const PromptSequencer = require('./promptSequencer');

// Example usage
async function runExample() {
  const sequencer = new PromptSequencer();

  // Add prompts to the sequence
  sequencer.addPrompt({
    role: 'system',
    content: 'You are a helpful AI assistant.',
    model: 'gpt-3.5-turbo',
    useMemory: false
  });

  sequencer.addPrompt({
    role: 'user',
    content: 'What is artificial intelligence?',
    model: 'gpt-3.5-turbo',
    useMemory: true,
    predecessor: true
  });

  // Execute the sequence
  try {
    const results = await sequencer.execute();
    console.log('Results:', results);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) {
  runExample().catch(console.error);
}