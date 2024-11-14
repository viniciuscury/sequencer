export class CSVHandler {
  constructor(promptManager) {
    this.promptManager = promptManager;
  }

  async handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      // Clear existing prompts
      document.getElementById('promptSequences').innerHTML = '';
      
      let currentPrompt = '';
      let inQuotes = false;
      let fields = [];
      
      // Skip header row and process each line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            fields.push(currentPrompt.trim());
            currentPrompt = '';
          } else {
            currentPrompt += char;
          }
        }
        
        if (!inQuotes) {
          if (currentPrompt) {
            fields.push(currentPrompt.trim());
          }
          
          if (fields.length >= 7) {
            const promptElement = this.promptManager.createPromptElement();
            
            promptElement.querySelector('.prompt-role').value = fields[0] || 'user';
            promptElement.querySelector('.prompt-model').value = fields[1] || 'gpt-3.5-turbo';
            promptElement.querySelector('.prompt-max-tokens').value = fields[2] || '';
            promptElement.querySelector('.prompt-temperature').value = fields[3] || '1';
            promptElement.querySelector('.prompt-use-memory').checked = fields[4] === 'true';
            promptElement.querySelector('.prompt-predecessor').checked = fields[5] === 'true';
            promptElement.querySelector('textarea').value = fields[6].replace(/^"|"$/g, '') || '';
            
            document.getElementById('promptSequences').appendChild(promptElement);
          }
          
          fields = [];
          currentPrompt = '';
        }
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format.');
    }
  }

  exportPromptsToCSV(prompts) {
    let csv = 'Role,Model,Max Tokens,Temperature,useMemory,predecessor,content\n';
    
    prompts.forEach(prompt => {
      const role = prompt.querySelector('.prompt-role').value;
      const model = prompt.querySelector('.prompt-model').value;
      const maxTokens = prompt.querySelector('.prompt-max-tokens').value;
      const temperature = prompt.querySelector('.prompt-temperature').value;
      const useMemory = prompt.querySelector('.prompt-use-memory').checked;
      const predecessor = prompt.querySelector('.prompt-predecessor').checked;
      const content = prompt.querySelector('textarea').value;
      
      // Properly escape content field
      const escapedContent = `"${content.replace(/"/g, '""')}"`;
      
      csv += `${role},${model},${maxTokens},${temperature},${useMemory},${predecessor},${escapedContent}\n`;
    });
    
    this.downloadFile(csv, 'prompts.csv', 'text/csv');
  }

  downloadTemplate() {
    const template = 'Role,Model,Max Tokens,Temperature,useMemory,predecessor,content\nuser,gpt-3.5-turbo,,1,false,false,"Your prompt here"\n';
    this.downloadFile(template, 'template.csv', 'text/csv');
  }

  exportContext() {
    const context = document.getElementById('globalContext').value;
    this.downloadFile(context, 'context.txt', 'text/plain');
  }

  async importContext(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      document.getElementById('globalContext').value = text;
    } catch (error) {
      console.error('Error importing context:', error);
      alert('Error importing context file.');
    }
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}