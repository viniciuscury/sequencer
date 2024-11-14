export class UIManager {
  showTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  showLoading(show = true) {
    const overlay = document.querySelector('.loading-overlay');
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  updateResults(data) {
    const resultsContainer = document.getElementById('sequentialAnswers');
    resultsContainer.innerHTML = data.results.map((result, index) => `
      <div class="result-item">
        <h3>Result ${index + 1}</h3>
        <pre>${result.content}</pre>
        ${result.status === 'incomplete' ? '<p class="warning">Note: Response may be incomplete due to token limit</p>' : ''}
      </div>
    `).join('');

    const memoryContainer = document.getElementById('memoryLog');
    memoryContainer.innerHTML = data.memoryLog.map(entry => `
      <div class="memory-entry">
        <div class="memory-role">${entry.role}</div>
        <pre>${entry.content}</pre>
      </div>
    `).join('');

    this.showTab('results');
  }
}