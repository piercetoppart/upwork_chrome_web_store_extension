import { JobData, ClientData, Budget, BidRange } from '../types';
import { SELECTORS } from '../config/selectors';
import { DOMHelpers } from '../utils/domHelpers';

export class DataExtractor {
  private cache: Map<string, any> = new Map();

  extractJobData(): JobData | null {
    try {
      const jobData: JobData = {
        title: this.extractTitle(),
        posted: this.extractPostedTime(),
        budget: this.extractBudget(),
        duration: this.extractDuration(),
        experience: this.extractExperience(),
        proposals: this.extractProposalCount(),
        interviewing: this.extractInterviewing(),
        invites: this.extractInvites(),
        hires: this.extractHires(),
        client: this.extractClientData(),
        description: this.extractDescription(),
        skills: this.extractSkills(),
        bidRange: this.extractBidRange(),
        connects: this.extractConnectsRequired(),
        lastViewed: this.extractLastViewed()
      };

      this.cache.set('jobData', jobData);
      console.log('UpworkIQ: Complete job data extracted', jobData);
      return jobData;
    } catch (error) {
      console.error('UpworkIQ: Data extraction failed', error);
      return null;
    }
  }

  private extractTitle(): string {
    const titleEl = DOMHelpers.findElement(SELECTORS.title);
    return DOMHelpers.extractText(titleEl, 'Unknown Job');
  }

  private extractPostedTime(): string {
    const postedEl = DOMHelpers.findElement(SELECTORS.posted);
    if (postedEl) {
      return DOMHelpers.extractText(postedEl);
    }

    // Fallback: search in text
    const postedMatch = document.body.innerText.match(/Posted\s+(\d+\s+(?:minute|hour|day|week|month)s?\s+ago)/i);
    return postedMatch ? postedMatch[1] : 'Unknown';
  }

  private extractBudget(): Budget {
    const budgetEl = DOMHelpers.findElement(SELECTORS.budget);
    if (!budgetEl) {
      return { type: 'unknown', raw: 'Not specified' };
    }

    const budgetText = budgetEl.parentElement?.textContent || budgetEl.textContent || '';
    const hourlyMatch = budgetText.match(/\$(\d+(?:\.\d{2})?)\s*-\s*\$(\d+(?:\.\d{2})?)/);
    const fixedMatch = budgetText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);

    if (hourlyMatch) {
      return {
        type: 'hourly',
        min: parseFloat(hourlyMatch[1]),
        max: parseFloat(hourlyMatch[2]),
        raw: budgetText
      };
    } else if (fixedMatch) {
      return {
        type: 'fixed',
        amount: parseFloat(fixedMatch[1].replace(/,/g, '')),
        raw: budgetText
      };
    }

    return { type: 'unknown', raw: budgetText };
  }

  private extractDuration(): string {
    const durationEl = Array.from(document.querySelectorAll('li'))
      .find(el => el.textContent?.includes('Duration') || el.textContent?.includes('month'));
    
    if (durationEl) {
      const match = durationEl.textContent?.match(/(\d+\s*to\s*\d+\s*month|Less than \d+ month|\d+-\d+ month)/i);
      if (match) return match[0];
    }
    
    return 'Not specified';
  }

  private extractExperience(): string {
    const expEl = Array.from(document.querySelectorAll('li'))
      .find(el => {
        const text = el.textContent || '';
        return text.includes('Intermediate') || text.includes('Expert') || text.includes('Entry');
      });
    
    if (expEl?.textContent?.includes('Expert')) return 'Expert';
    if (expEl?.textContent?.includes('Intermediate')) return 'Intermediate';
    if (expEl?.textContent?.includes('Entry')) return 'Entry Level';
    
    return 'Not specified';
  }

  private extractProposalCount(): number {
    const proposalEl = this.findActivityItem('Proposals:');
    if (!proposalEl) return 0;

    const valueEl = proposalEl.querySelector('.value');
    if (!valueEl) return 0;

    const text = valueEl.textContent?.trim() || '';
    if (text.includes('Less than')) {
      return DOMHelpers.extractNumber(text) - 1;
    }
    if (text.includes('to')) {
      const match = text.match(/(\d+)\s*to\s*(\d+)/);
      return match ? parseInt(match[2]) : 0;
    }
    
    return parseInt(text) || 0;
  }

  private extractInterviewing(): number {
    const el = this.findActivityItem('Interviewing:');
    return el ? DOMHelpers.extractNumber(el.querySelector('.value')?.textContent || '') : 0;
  }

  private extractInvites(): number {
    const el = this.findActivityItem('Invites sent:');
    return el ? DOMHelpers.extractNumber(el.querySelector('.value')?.textContent || '') : 0;
  }

  private extractHires(): number {
    const el = this.findActivityItem('Hires:');
    return el ? DOMHelpers.extractNumber(el.querySelector('.value')?.textContent || '') : 0;
  }

  private extractLastViewed(): string {
    const el = this.findActivityItem('Last viewed by client:');
    return el ? DOMHelpers.extractText(el.querySelector('.value'), 'Unknown') : 'Unknown';
  }

  private findActivityItem(label: string): Element | null {
    return Array.from(document.querySelectorAll('.ca-item'))
      .find(el => el.textContent?.includes(label)) || null;
  }

  private extractClientData(): ClientData {
    const defaultClient: ClientData = {
      location: 'Unknown',
      totalSpent: 0,
      hires: 0,
      hireRate: 0,
      jobsPosted: 0,
      openJobs: 0,
      avgHourlyRate: 0,
      totalHours: 0,
      memberSince: 'Unknown',
      paymentVerified: false,
      rating: 0,
      reviews: 0,
      memberDuration: 0
    };

    const clientSection = DOMHelpers.findElement(SELECTORS.client.section);
    if (!clientSection) return defaultClient;

    // Extract each field with fallbacks
    const client = { ...defaultClient };

    // Location
    const locationEl = clientSection.querySelector(SELECTORS.client.location[0]);
    if (locationEl) {
      const locationText = locationEl.textContent || '';
      const cityMatch = locationText.match(/([A-Za-z\s,]+?)(?:\d{1,2}:\d{2})/);
      if (cityMatch) client.location = cityMatch[1].trim();
    }

    // Total spent
    const spendEl = clientSection.querySelector(SELECTORS.client.spend[0]);
    if (spendEl) {
      const spendText = spendEl.textContent || '';
      const spendMatch = spendText.match(/\$(\d+(?:\.\d+)?[KMB]?)/);
      if (spendMatch) {
        let amount = parseFloat(spendMatch[1].replace(/[KMB]/, ''));
        if (spendMatch[0].includes('K')) amount *= 1000;
        if (spendMatch[0].includes('M')) amount *= 1000000;
        client.totalSpent = amount;
      }
    }

    // Hires
    const hireEl = clientSection.querySelector(SELECTORS.client.hires[0]);
    if (hireEl) {
      client.hires = DOMHelpers.extractNumber(hireEl.textContent || '');
    }

    // Hourly rate
    const rateEl = clientSection.querySelector(SELECTORS.client.rate[0]);
    if (rateEl) {
      client.avgHourlyRate = DOMHelpers.extractCurrency(rateEl.textContent || '');
    }

    // Total hours
    const hoursEl = clientSection.querySelector(SELECTORS.client.hours[0]);
    if (hoursEl) {
      const hoursText = hoursEl.textContent || '';
      const hoursMatch = hoursText.match(/(\d+(?:,\d{3})*)/);
      if (hoursMatch) {
        client.totalHours = parseInt(hoursMatch[1].replace(/,/g, ''));
      }
    }

    // Job stats
    const jobStatsEl = clientSection.querySelector(SELECTORS.client.stats[0]);
    if (jobStatsEl) {
      const statsText = jobStatsEl.textContent || '';
      const jobsMatch = statsText.match(/(\d+)\s*jobs?\s*posted/);
      if (jobsMatch) client.jobsPosted = parseInt(jobsMatch[1]);
      
      const hireRateMatch = statsText.match(/(\d+)%/);
      if (hireRateMatch) client.hireRate = parseInt(hireRateMatch[1]);
      
      const openMatch = statsText.match(/(\d+)\s*open\s*job/);
      if (openMatch) client.openJobs = parseInt(openMatch[1]);
    }

    // Member since
    const memberEl = clientSection.querySelector(SELECTORS.client.member[0]);
    if (memberEl) {
      const memberText = memberEl.textContent || '';
      const memberMatch = memberText.match(/Member since\s*(.+)/);
      if (memberMatch) {
        client.memberSince = memberMatch[1].trim();
        const yearMatch = memberMatch[1].match(/\d{4}/);
        if (yearMatch) {
          client.memberDuration = new Date().getFullYear() - parseInt(yearMatch[0]);
        }
      }
    }

    // Payment verified
    client.paymentVerified = !!document.querySelector('.payment-verified');

    // Rating
    const ratingEl = DOMHelpers.findElement(SELECTORS.client.rating);
    if (ratingEl) {
      client.rating = parseFloat(ratingEl.textContent || '0');
    }

    // Reviews
    const reviewMatch = document.body.innerText.match(/(\d+(?:\.\d+)?)\s*of\s*(\d+)\s*reviews?/i);
    if (reviewMatch) {
      client.rating = parseFloat(reviewMatch[1]);
      client.reviews = parseInt(reviewMatch[2]);
    }

    return client;
  }

  private extractDescription(): string {
    const descEl = DOMHelpers.findElement(SELECTORS.description);
    return DOMHelpers.extractText(descEl);
  }

  private extractSkills(): string[] {
    const skills: string[] = [];
    const skillElements = DOMHelpers.findAllElements(SELECTORS.skills);
    
    skillElements.forEach(el => {
      const skill = el.textContent?.trim();
      if (skill && !skills.includes(skill)) {
        skills.push(skill);
      }
    });
    
    return skills;
  }

  private extractBidRange(): BidRange | null {
    const bidSection = Array.from(document.querySelectorAll('section'))
      .find(el => el.textContent?.includes('Bid range'));
    
    if (!bidSection) return null;

    const match = bidSection.textContent?.match(
      /High\s*\$(\d+(?:\.\d{2})?)\s*\|\s*Avg\s*\$(\d+(?:\.\d{2})?)\s*\|\s*Low\s*\$(\d+(?:\.\d{2})?)/
    );
    
    if (match) {
      return {
        high: parseFloat(match[1]),
        avg: parseFloat(match[2]),
        low: parseFloat(match[3])
      };
    }
    
    return null;
  }

  private extractConnectsRequired(): number {
    const connectsMatch = document.body.innerText.match(/Send a proposal for:\s*(\d+)\s*Connects/i);
    return connectsMatch ? parseInt(connectsMatch[1]) : 0;
  }
}