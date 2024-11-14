class PromptSequencerUI {
  constructor() {
    this.initializeEventListeners();
    this.showTab('prompts');
  }

  initializeEventListeners() {
    document.getElementById('addPrompt').addEventListener('click', () => this.addPrompt());
    document.getElementById('execute').addEventListener('click', () => this.executePrompts());
    document.getElementById('csvUpload').addEventListener('change', (e) => this.handleCSVUpload(e));
    document.getElementById('exportPrompts').addEventListener('click', () => this.exportPromptsToCSV());
    document.getElementById('downloadTemplate').addEventListener('click', () => this.downloadTemplate());
    document.getElementById('applyParameters').addEventListener('click', () => this.applyGlobalParameters());
    document.getElementById('exportContext').addEventListener('click', () => this.exportContext());
    document.getElementById('importContextBtn').addEventListener('click', () => document.getElementById('importContext').click());
    document.getElementById('importContext').addEventListener('change', (e) => this.importContext(e));

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
      button.addEventListener('click', () => this.showTab(button.dataset.tab));
    });
  }

  showTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  createPromptElement() {
    const promptDiv = document.createElement('div');
    promptDiv.className = 'prompt-sequence';
    promptDiv.innerHTML = `
      <div class="prompt-header">
        <div class="parameter-group">
          <label>Role</label>
          <select class="prompt-role">
            <option value="system">System</option>
            <option value="user" selected>User</option>
            <option value="assistant">Assistant</option>
          </select>
        </div>
        <div class="parameter-group">
          <label>Model</label>
          <select class="prompt-model">
            <option value="gpt-3.5-turbo" selected>GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>
        <div class="parameter-group">
          <label>Max Tokens</label>
          <input type="number" class="prompt-max-tokens" min="1">
        </div>
        <div class="parameter-group">
          <label>Temperature</label>
          <input type="number" class="prompt-temperature" value="1" min="0" max="2" step="0.1">
        </div>
        <div class="parameter-group">
          <label>Use Memory</label>
          <input type="checkbox" class="prompt-use-memory">
        </div>
        <div class="parameter-group">
          <label>Use Predecessor</label>
          <input type="checkbox" class="prompt-predecessor">
        </div>
      </div>
      <div class="prompt-content">
        <textarea placeholder="Enter your prompt..."></textarea>
      </div>
      <div class="prompt-controls">
        <button class="btn execute-single">Execute</button>
        <button class="btn remove-prompt">Remove</button>
        <div class="move-controls">
          <button class="move-btn move-up">↑</button>
          <button class="move-btn move-down">↓</button>
        </div>
      </div>
      <button class="insert-prompt-btn" title="Insert prompt below">+</button>
    `;

    // Add event listeners
    promptDiv.querySelector('.remove-prompt').addEventListener('click', () => promptDiv.remove());
    promptDiv.querySelector('.execute-single').addEventListener('click', () => this.executeSinglePrompt(promptDiv));
    promptDiv.querySelector('.move-up').addEventListener('click', () => this.movePrompt(promptDiv, 'up'));
    promptDiv.querySelector('.move-down').addEventListener('click', () => this.movePrompt(promptDiv, 'down'));
    promptDiv.querySelector('.insert-prompt-btn').addEventListener('click', () => this.insertPromptAfter(promptDiv));

    return promptDiv;
  }

  addPrompt() {
    const promptSequences = document.getElementById('promptSequences');
    promptSequences.appendChild(this.createPromptElement());
  }

  insertPromptAfter(promptElement) {
    const newPrompt = this.createPromptElement();
    promptElement.parentNode.insertBefore(newPrompt, promptElement.nextSibling);
  }

  movePrompt(promptElement, direction) {
    const container = document.getElementById('promptSequences');
    const prompts = Array.from(container.children);
    const currentIndex = prompts.indexOf(promptElement);
    
    if (direction === 'up' && currentIndex > 0) {
      container.insertBefore(promptElement, prompts[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < prompts.length - 1) {
      container.insertBefore(promptElement, prompts[currentIndex + 2]);
    }
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
            const promptElement = this.createPromptElement();
            
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

  exportPromptsToCSV() {
    const prompts = document.querySelectorAll('.prompt-sequence');
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
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadTemplate() {
    const template = 'Role,Model,Max Tokens,Temperature,useMemory,predecessor,content\nuser,gpt-3.5-turbo,,1,false,false,"Your prompt here"\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  applyGlobalParameters() {
    const role = document.getElementById('globalRole').value;
    const model = document.getElementById('globalModel').value;
    const maxTokens = document.getElementById('globalMaxTokens').value;
    const temperature = document.getElementById('globalTemperature').value;
    const useMemory = document.getElementById('globalUseMemory').value;
    const predecessor = document.getElementById('globalPredecessor').value;

    document.querySelectorAll('.prompt-sequence').forEach(prompt => {
      if (role) prompt.querySelector('.prompt-role').value = role;
      if (model) prompt.querySelector('.prompt-model').value = model;
      if (maxTokens) prompt.querySelector('.prompt-max-tokens').value = maxTokens;
      if (temperature) prompt.querySelector('.prompt-temperature').value = temperature;
      if (useMemory) prompt.querySelector('.prompt-use-memory').checked = useMemory === 'true';
      if (predecessor) prompt.querySelector('.prompt-predecessor').checked = predecessor === 'true';
    });
  }

  exportContext() {
    const context = document.getElementById('globalContext').value;
    const blob = new Blob([context], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'context.txt';
    a.click();
    window.URL.revokeObjectURL(url);
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

  showLoading(show = true) {
    const overlay = document.querySelector('.loading-overlay');
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  async executeSinglePrompt(promptElement) {
    const prompts = [this.getPromptData(promptElement)];
    await this.executePromptSequence(prompts);
  }

  getPromptData(promptElement) {
    return {
      role: promptElement.querySelector('.prompt-role').value,
      model: promptElement.querySelector('.prompt-model').value,
      maxTokens: promptElement.querySelector('.prompt-max-tokens').value,
      temperature: promptElement.querySelector('.prompt-temperature').value,
      useMemory: promptElement.querySelector('.prompt-use-memory').checked,
      predecessor: promptElement.querySelector('.prompt-predecessor').checked,
      content: promptElement.querySelector('textarea').value
    };
  }

  async executePrompts() {
    const promptElements = document.querySelectorAll('.prompt-sequence');
    const prompts = Array.from(promptElements).map(element => this.getPromptData(element));
    await this.executePromptSequence(prompts);
  }

  async executePromptSequence(prompts) {
    this.showLoading(true);
    try {
      const globalContext = document.getElementById('globalContext').value;
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompts,
          globalContext
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      // Update results tab
      const resultsContainer = document.getElementById('sequentialAnswers');
      resultsContainer.innerHTML = data.results.map((result, index) => `
        <div class="result-item">
          <h3>Result ${index + 1}</h3>
          <pre>${result.content}</pre>
          ${result.status === 'incomplete' ? '<p class="warning">Note: Response may be incomplete due to token limit</p>' : ''}
        </div>
      `).join('');

      // Update memory log tab
      const memoryContainer = document.getElementById('memoryLog');
      memoryContainer.innerHTML = data.memoryLog.map(entry => `
        <div class="memory-entry">
          <div class="memory-role">${entry.role}</div>
          <pre>${entry.content}</pre>
        </div>
      `).join('');

      // Switch to results tab
      this.showTab('results');
    } catch (error) {
      console.error('Execution error:', error);
      alert(error.message || 'An error occurred while executing prompts');
    } finally {
      this.showLoading(false);
    }
  }
}

// Initialize the UI when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  new PromptSequencerUI();
});