import { PromptManager } from './PromptManager.js';
import { CSVHandler } from './CSVHandler.js';
import { UIManager } from './UIManager.js';
import { ExecutionManager } from './ExecutionManager.js';

export class PromptSequencerUI {
  constructor() {
    this.promptManager = new PromptManager();
    this.csvHandler = new CSVHandler(this.promptManager);
    this.uiManager = new UIManager();
    this.executionManager = new ExecutionManager(this.uiManager);
    this.initializeEventListeners();
    this.uiManager.showTab('prompts');
  }

  initializeEventListeners() {
    document.getElementById('addPrompt').addEventListener('click', () => this.promptManager.addPrompt());
    document.getElementById('execute').addEventListener('click', () => this.executionManager.executePrompts(this.promptManager.getAllPrompts()));
    document.getElementById('csvUpload').addEventListener('click', (e) => this.csvHandler.handleCSVUpload(e));
    document.getElementById('exportPrompts').addEventListener('click', () => this.csvHandler.exportPromptsToCSV(this.promptManager.getAllPrompts()));
    document.getElementById('downloadTemplate').addEventListener('click', () => this.csvHandler.downloadTemplate());
    document.getElementById('applyParameters').addEventListener('click', () => this.promptManager.applyGlobalParameters());
    document.getElementById('exportContext').addEventListener('click', () => this.csvHandler.exportContext());
    document.getElementById('importContextBtn').addEventListener('click', () => document.getElementById('importContext').click());
    document.getElementById('importContext').addEventListener('change', (e) => this.csvHandler.importContext(e));

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
      button.addEventListener('click', () => this.uiManager.showTab(button.dataset.tab));
    });
  }
}