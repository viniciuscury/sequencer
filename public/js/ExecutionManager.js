export class ExecutionManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
  }

  async executeSinglePrompt(promptElement) {
    const prompts = [this.getPromptData(promptElement)];
    await this.executePromptSequence(prompts);
  }

  async executePrompts(promptElements) {
    const prompts = Array.from(promptElements).map(element => this.getPromptData(element));
    await this.executePromptSequence(prompts);
  }

  async executePromptSequence(prompts) {
    this.uiManager.showLoading(true);
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

      this.uiManager.updateResults(data);
    } catch (error) {
      console.error('Execution error:', error);
      alert(error.message || 'An error occurred while executing prompts');
    } finally {
      this.uiManager.showLoading(false);
    }
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
}