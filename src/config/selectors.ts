export const SELECTORS = {
  title: ['h1', 'h2.m-0-bottom', '.flex-1[data-v-6dae415b]'],
  posted: ['[data-test="PostedOn"] span', 'time'],
  budget: ['[data-test="BudgetAmount"]', '.budget-amount'],
  client: {
    section: ['ul.features.text-light-on-muted', '.client-info'],
    location: ['[data-qa="client-location"]', '.location'],
    spend: ['[data-qa="client-spend"]', '.total-spent'],
    hires: ['[data-qa="client-hires"]', '.client-hires'],
    rate: ['[data-qa="client-hourly-rate"]', '.avg-rate'],
    hours: ['[data-qa="client-hours"]', '.total-hours'],
    stats: ['[data-qa="client-job-posting-stats"]', '.job-stats'],
    member: ['[data-qa="client-contract-date"]', '.member-since'],
    rating: ['[data-testid="buyer-rating"] .air3-rating-value-text', '.client-rating']
  },
  activity: {
    proposals: ['.ca-item:has-text("Proposals:")', '[data-test="proposals-count"]'],
    interviewing: ['.ca-item:has-text("Interviewing:")', '[data-test="interviewing-count"]'],
    invites: ['.ca-item:has-text("Invites sent:")', '[data-test="invites-count"]'],
    hires: ['.ca-item:has-text("Hires:")', '[data-test="hires-count"]'],
    lastViewed: ['.ca-item:has-text("Last viewed by client:")', '[data-test="last-viewed"]']
  },
  description: ['[data-test="Description"]', '.job-description'],
  skills: ['.air3-badge', '.skills-list a', '[data-test="skill-badge"]']
};
