export class PromptManager {
  constructor() {
    this.promptSequencesContainer = document.getElementById('promptSequences');
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

    this.addPromptEventListeners(promptDiv);
    return promptDiv;
  }

  addPromptEventListeners(promptDiv) {
    promptDiv.querySelector('.remove-prompt').addEventListener('click', () => promptDiv.remove());
    promptDiv.querySelector('.execute-single').addEventListener('click', () => this.executeSinglePrompt(promptDiv));
    promptDiv.querySelector('.move-up').addEventListener('click', () => this.movePrompt(promptDiv, 'up'));
    promptDiv.querySelector('.move-down').addEventListener('click', () => this.movePrompt(promptDiv, 'down'));
    promptDiv.querySelector('.insert-prompt-btn').addEventListener('click', () => this.insertPromptAfter(promptDiv));
  }

  addPrompt() {
    this.promptSequencesContainer.appendChild(this.createPromptElement());
  }

  insertPromptAfter(promptElement) {
    const newPrompt = this.createPromptElement();
    promptElement.parentNode.insertBefore(newPrompt, promptElement.nextSibling);
  }

  movePrompt(promptElement, direction) {
    const prompts = Array.from(this.promptSequencesContainer.children);
    const currentIndex = prompts.indexOf(promptElement);
    
    if (direction === 'up' && currentIndex > 0) {
      this.promptSequencesContainer.insertBefore(promptElement, prompts[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < prompts.length - 1) {
      this.promptSequencesContainer.insertBefore(promptElement, prompts[currentIndex + 2]);
    }
  }

  getAllPrompts() {
    return Array.from(document.querySelectorAll('.prompt-sequence'));
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

  applyGlobalParameters() {
    const role = document.getElementById('globalRole').value;
    const model = document.getElementById('globalModel').value;
    const maxTokens = document.getElementById('globalMaxTokens').value;
    const temperature = document.getElementById('globalTemperature').value;
    const useMemory = document.getElementById('globalUseMemory').value;
    const predecessor = document.getElementById('globalPredecessor').value;

    this.getAllPrompts().forEach(prompt => {
      if (role) prompt.querySelector('.prompt-role').value = role;
      if (model) prompt.querySelector('.prompt-model').value = model;
      if (maxTokens) prompt.querySelector('.prompt-max-tokens').value = maxTokens;
      if (temperature) prompt.querySelector('.prompt-temperature').value = temperature;
      if (useMemory) prompt.querySelector('.prompt-use-memory').checked = useMemory === 'true';
      if (predecessor) prompt.querySelector('.prompt-predecessor').checked = predecessor === 'true';
    });
  }
}