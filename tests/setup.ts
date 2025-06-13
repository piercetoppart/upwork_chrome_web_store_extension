// Mock DOM environment setup
// Note: You'll need to install @testing-library/jest-dom separately

// Mock Chrome API for extension tests
(global as any).chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Mock window.location
delete (window as any).location;
(window as any).location = {
  href: 'https://www.upwork.com/jobs/test',
  hostname: 'www.upwork.com',
  pathname: '/jobs/test'
};

// Global test utilities
(global as any).createMockJobPage = () => {
  document.body.innerHTML = `
    <h1>Test Job Title</h1>
    <div data-test="PostedOn">
      <span>Posted 2 hours ago</span>
    </div>
    <div data-test="BudgetAmount">$50.00 - $100.00</div>
    <ul class="features text-light-on-muted">
      <li data-qa="client-spend">$10K+ total spent</li>
      <li data-qa="client-hires">50 hires</li>
      <li data-qa="client-job-posting-stats">100 jobs posted, 50% hire rate, 2 open jobs</li>
    </ul>
    <div class="ca-item">
      <span>Proposals:</span>
      <span class="value">10 to 15</span>
    </div>
  `;
};
