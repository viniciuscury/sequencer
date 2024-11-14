const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const PromptSequencer = require('./promptSequencer');

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// Security middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

const sequencer = new PromptSequencer();

async function extractLinesFromPDF(buffer) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const lines = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach(item => {
      if (item.str.trim()) {
        lines.push(item.str.trim());
      }
    });
  }

  return lines;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
    }

    const lines = await extractLinesFromPDF(req.file.buffer);
    res.json({ success: true, lines });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/execute', async (req, res) => {
  try {
    const { prompts, globalContext } = req.body;
    
    if (!prompts || !Array.isArray(prompts)) {
      return res.status(400).json({ success: false, error: 'Invalid prompts data' });
    }

    sequencer.clearSequences();
    sequencer.clearMemory();
    
    if (globalContext) {
      sequencer.setGlobalContext(globalContext);
    }

    prompts.forEach(prompt => {
      sequencer.addPrompt(prompt);
    });

    const results = await sequencer.execute();
    const memoryLog = sequencer.getMemoryLog();
    
    res.json({
      success: true,
      results: results.map(result => ({
        content: result.content || '',
        status: result.status || 'complete',
        sequenceNumber: result.sequenceNumber || 0
      })),
      memoryLog: memoryLog.map(entry => ({
        role: entry.role || 'user',
        content: entry.content || ''
      }))
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'An unknown error occurred'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});