import { DataExtractor } from './modules/dataExtractor';
import { JobAnalyzer } from './modules/analyzer';
import { UIRenderer } from './modules/uiRenderer';
import { DOMHelpers } from './utils/domHelpers';

// Declare global window property for TypeScript
declare global {
  interface Window {
    upworkIQ?: UpworkIQ;
  }
}

class UpworkIQ {
  private extractor: DataExtractor;
  private analyzer: JobAnalyzer;
  private renderer: UIRenderer;
  private observer: MutationObserver | null = null;
  private initialized = false;
  private lastUrl = window.location.href;

  constructor() {
    this.extractor = new DataExtractor();
    this.analyzer = new JobAnalyzer();
    this.renderer = new UIRenderer();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Wait for job title to ensure page is loaded
      await DOMHelpers.waitForElement('h1, h2.m-0-bottom, .flex-1[data-v-6dae415b]', 5000);
      
      await this.analyze();
      this.setupObserver();
      this.initialized = true;
      
      console.log('✅ UpworkIQ: Analysis complete!');
    } catch (error) {
      console.error('❌ UpworkIQ: Initialization failed', error);
      this.showError();
    }
  }

  private async analyze(): Promise<void> {
    const jobData = this.extractor.extractJobData();
    if (!jobData) {
      throw new Error('Failed to extract job data');
    }

    const analysis = this.analyzer.analyze(jobData);
    this.renderer.render(analysis);
  }

  private setupObserver(): void {
    // Watch for page changes (SPA navigation)
    this.observer = new MutationObserver(() => {
      const urlChanged = window.location.href !== this.lastUrl;
      if (urlChanged && window.location.href.includes('/jobs/')) {
        this.lastUrl = window.location.href;
        this.initialized = false;
        setTimeout(() => this.init(), 500);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private showError(): void {
    const container = document.createElement('div');
    container.className = 'uiq-container';
    container.innerHTML = `
      <div class="uiq-header">
        <div class="uiq-title">
          <span class="uiq-icon">🧠</span>
          <h3>UpworkIQ Analysis</h3>
        </div>
      </div>
      <div class="uiq-error">
        <p>Analysis failed. Please refresh the page or report this issue.</p>
        <button onclick="location.reload()">Refresh Page</button>
      </div>
    `;
    
    document.body.insertBefore(container, document.body.firstChild);
  }

  destroy(): void {
    this.observer?.disconnect();
    const container = document.getElementById('upworkiq-analysis');
    if (container) container.remove();
    const styles = document.getElementById('upworkiq-styles');
    if (styles) styles.remove();
    this.initialized = false;
  }
}

// Entry point for bookmarklet
(() => {
  if (!window.location.href.includes('upwork.com/jobs/')) {
    alert('UpworkIQ: Please navigate to an Upwork job page first');
    return;
  }

  // Check if already initialized
  if (window.upworkIQ) {
    window.upworkIQ.destroy();
  }

  console.log('🧠 UpworkIQ: Initializing comprehensive job analysis...');
  
  window.upworkIQ = new UpworkIQ();
  window.upworkIQ.init();
})();