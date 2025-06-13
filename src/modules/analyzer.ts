import { JobData, AnalysisResult, Risk, Opportunity, KeyMetrics, Recommendation, Insight, ClientData } from '../types';

export class JobAnalyzer {
  private readonly WEIGHTS = {
    spending: 40,
    hireRate: 30,
    competition: 15,
    timing: 10,
    verification: 5
  };

  analyze(jobData: JobData): AnalysisResult {
    const score = this.calculateScore(jobData);
    const metrics = this.calculateKeyMetrics(jobData, score);
    const risks = this.identifyRisks(jobData);
    const opportunities = this.identifyOpportunities(jobData);
    const recommendation = this.generateRecommendation(score, risks, jobData);
    const insights = this.generateInsights(jobData, metrics);

    return {
      score,
      metrics,
      risks,
      opportunities,
      recommendation,
      insights
    };
  }

  private calculateScore(jobData: JobData): number {
    let score = 30; // Base score
    const { client } = jobData;

    // Spending score (0-40 points)
    const spendScore = Math.min(client.totalSpent / 100000 * this.WEIGHTS.spending, this.WEIGHTS.spending);
    score += spendScore;

    // Hire rate score (-30 to +15 points)
    if (client.hireRate >= 80) score += 15;
    else if (client.hireRate >= 60) score += 5;
    else if (client.hireRate >= 40) score += 0;
    else if (client.hireRate >= 20) score -= 15;
    else if (client.hireRate > 0) score -= 30;

    // Payment verification
    if (client.paymentVerified) score += 5;
    else score -= 10;

    // Already hired penalty
    if (jobData.hires > 0) score -= 25;

    // Competition score
    if (jobData.proposals < 10) score += 10;
    else if (jobData.proposals < 20) score += 5;
    else if (jobData.proposals < 30) score += 0;
    else if (jobData.proposals < 50) score -= 5;
    else score -= 10;

    // Interview rate bonus
    if (jobData.interviewing > 0 && jobData.proposals > 0) {
      const interviewRate = jobData.interviewing / jobData.proposals;
      if (interviewRate > 0.3) score += 5;
      else if (interviewRate > 0.1) score += 2;
    }

    // Timing score
    if (this.isRecentlyPosted(jobData.posted)) score += 5;
    else if (this.isOld(jobData.posted)) score -= 5;

    // Selective invites bonus
    if (jobData.invites > 0 && jobData.invites < 5) score += 3;

    // Platform experience penalties/bonuses
    if (client.totalSpent < 1000) score -= 10;
    if (client.totalHours < 50) score -= 5;
    if (client.memberDuration < 1) score -= 10;
    else if (client.memberDuration > 3) score += 5;

    // Client rating
    if (client.rating >= 4.8 && client.reviews > 10) score += 5;
    else if (client.rating < 4.5 && client.reviews > 10) score -= 10;
    else if (client.reviews < 5) score -= 5;

    // Urgency penalty
    if (this.hasDeadlineUrgency(jobData.description)) score -= 5;

    // Budget mismatch penalty
    const avgProjectValue = client.hires > 0 ? client.totalSpent / client.hires : 0;
    if (jobData.budget.type === 'fixed' && avgProjectValue > 0) {
      if (jobData.budget.amount && jobData.budget.amount < avgProjectValue * 0.5) {
        score -= 10;
      }
    }

    // Low hourly rate penalty
    if (client.avgHourlyRate > 0 && client.avgHourlyRate < 10) score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateKeyMetrics(jobData: JobData, score: number): KeyMetrics {
    const { client } = jobData;

    return {
      clientQuality: this.calculateClientQuality(client),
      competitionLevel: this.getCompetitionLevel(jobData.proposals),
      responseRate: this.calculateResponseRate(jobData),
      budgetCompetitiveness: this.analyzeBudgetCompetitiveness(jobData),
      timeUrgency: this.analyzeTimeUrgency(jobData.posted),
      projectComplexity: this.analyzeComplexity(jobData.description),
      clientActivity: this.analyzeClientActivity(client),
      successProbability: this.calculateSuccessProbability(score, client, jobData)
    };
  }

  private calculateClientQuality(client: ClientData): number {
    const spendWeight = client.totalSpent > 0 ? Math.min(client.totalSpent / 100000, 1) * 40 : 0;
    const hireRateWeight = client.hireRate * 0.6;
    return Math.round(spendWeight + hireRateWeight);
  }

  private getCompetitionLevel(proposals: number): string {
    if (proposals < 5) return 'Very Low';
    if (proposals < 15) return 'Low';
    if (proposals < 30) return 'Medium';
    if (proposals < 50) return 'High';
    return 'Very High';
  }

  private calculateResponseRate(jobData: JobData): string {
    if (jobData.proposals === 0) return 'N/A';
    const rate = (jobData.interviewing / jobData.proposals) * 100;
    return `${rate.toFixed(0)}%`;
  }

  private analyzeBudgetCompetitiveness(jobData: JobData): string {
    if (!jobData.bidRange || !jobData.budget) return 'Unknown';
    
    if (jobData.budget.type === 'hourly' && jobData.budget.max) {
      const clientAvg = jobData.budget.max;
      const marketAvg = jobData.bidRange.avg;
      
      if (clientAvg > marketAvg * 1.2) return 'Above Market';
      if (clientAvg < marketAvg * 0.8) return 'Below Market';
      return 'Market Rate';
    }
    
    return 'Fixed Price';
  }

  private analyzeTimeUrgency(posted: string): string {
    const postedLower = posted.toLowerCase();
    if (postedLower.includes('minute') || postedLower.includes('hour')) return 'Just Posted';
    if (postedLower.includes('1 day')) return 'Fresh';
    if (postedLower.includes('day')) return 'Recent';
    return 'Aging';
  }

  private analyzeComplexity(description: string): string {
    const desc = description.toLowerCase();
    const complexWords = ['complex', 'advanced', 'expert', 'senior', 'architect', 'lead', 'strategic'];
    const simpleWords = ['simple', 'basic', 'easy', 'quick', 'minor', 'small'];
    
    let complexity = 0;
    complexWords.forEach(word => {
      if (desc.includes(word)) complexity++;
    });
    simpleWords.forEach(word => {
      if (desc.includes(word)) complexity--;
    });
    
    if (complexity >= 2) return 'High';
    if (complexity <= -1) return 'Low';
    return 'Medium';
  }

  private analyzeClientActivity(client: ClientData): string {
    if (client.jobsPosted === 0) return 'New Client';
    if (client.hireRate >= 70 && client.totalSpent > 10000) return 'Very Active';
    if (client.hireRate >= 50 && client.totalSpent > 5000) return 'Active';
    if (client.hireRate >= 30) return 'Selective';
    if (client.hireRate > 0) return 'Minimal Activity';
    return 'Inactive';
  }

  private calculateSuccessProbability(score: number, client: ClientData, jobData: JobData): string {
    if (jobData.hires > 0) return 'Very Low';
    if (client.hireRate < 30) return 'Low';
    if (score >= 70 && client.hireRate > 70) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  }

  private identifyRisks(jobData: JobData): Risk[] {
    const risks: Risk[] = [];
    const { client } = jobData;

    // Critical risks
    if (jobData.hires > 0) {
      risks.push({
        type: 'critical',
        message: `Already hired ${jobData.hires} freelancer(s)`,
        impact: 'Position may be filled'
      });
    }

    if (client.hireRate === 0 && client.jobsPosted > 5) {
      risks.push({
        type: 'critical',
        message: 'Never hired despite multiple postings',
        impact: 'Likely time waster'
      });
    }

    // High risks
    if (client.totalSpent === 0) {
      risks.push({
        type: 'high',
        message: 'New client with no payment history',
        impact: 'No payment protection'
      });
    }

    if (client.totalSpent > 0 && client.totalSpent < 1000) {
      risks.push({
        type: 'high',
        message: `Very low platform spending: $${client.totalSpent}`,
        impact: 'Limited commitment to platform'
      });
    }

    if (client.hireRate < 40 && client.hireRate > 0) {
      risks.push({
        type: 'high',
        message: `Very low hire rate: ${client.hireRate}%`,
        impact: 'High chance of wasted time'
      });
    }

    if (!client.paymentVerified) {
      risks.push({
        type: 'high',
        message: 'Payment method not verified',
        impact: 'Payment delays possible'
      });
    }

    if (client.avgHourlyRate > 0 && client.avgHourlyRate < 10) {
      risks.push({
        type: 'high',
        message: `Very low average rate: $${client.avgHourlyRate}/hr`,
        impact: 'Client pays below market rates'
      });
    }

    if (client.rating < 4.5 && client.reviews > 10) {
      risks.push({
        type: 'high',
        message: `Low client rating: ${client.rating}/5`,
        impact: 'Potential difficult client'
      });
    }

    // Medium risks
    if (jobData.proposals > 50) {
      risks.push({
        type: 'medium',
        message: `High competition: ${jobData.proposals} proposals`,
        impact: 'Lower win probability'
      });
    }

    if (client.memberDuration < 1) {
      risks.push({
        type: 'medium',
        message: 'Client joined less than 1 year ago',
        impact: 'Limited platform experience'
      });
    }

    if (client.totalHours < 50 && client.hires > 5) {
      risks.push({
        type: 'medium',
        message: 'Very short projects typical',
        impact: 'May not be worth the effort'
      });
    }

    if (this.hasDeadlineUrgency(jobData.description)) {
      risks.push({
        type: 'medium',
        message: 'Urgent deadline detected',
        impact: 'Rushed work expected'
      });
    }

    // Budget-related risks
    const avgProjectValue = client.hires > 0 ? client.totalSpent / client.hires : 0;
    if (avgProjectValue > 0 && jobData.budget.type === 'fixed' && jobData.budget.amount) {
      if (jobData.budget.amount < avgProjectValue * 0.5) {
        risks.push({
          type: 'high',
          message: 'Budget far below client average',
          impact: 'Scope creep likely'
        });
      }
    }

    return risks;
  }

  private identifyOpportunities(jobData: JobData): Opportunity[] {
    const opportunities: Opportunity[] = [];
    const { client } = jobData;

    // Don't show opportunities if already hired
    if (jobData.hires > 0) return opportunities;

    if (client.hireRate > 80 && client.totalSpent > 50000) {
      opportunities.push({
        type: 'high',
        message: 'Premium client with excellent history',
        action: 'Prioritize this application'
      });
    }

    if (jobData.proposals < 5 && this.isRecentlyPosted(jobData.posted)) {
      opportunities.push({
        type: 'high',
        message: 'Early bird advantage',
        action: 'Apply immediately for best chances'
      });
    }

    if (jobData.interviewing > 0 && jobData.proposals < 20) {
      opportunities.push({
        type: 'medium',
        message: 'Active hiring in progress',
        action: 'Client is ready to hire now'
      });
    }

    if (client.totalHours > 5000) {
      opportunities.push({
        type: 'medium',
        message: 'Long-term client potential',
        action: 'Great for ongoing work'
      });
    }

    if (jobData.invites > 0 && jobData.invites < 5) {
      opportunities.push({
        type: 'high',
        message: 'Client is selective with invites',
        action: 'Higher quality opportunity'
      });
    }

    if (client.memberDuration > 5 && client.hireRate > 70) {
      opportunities.push({
        type: 'medium',
        message: 'Established platform user',
        action: 'Reliable client relationship possible'
      });
    }

    return opportunities;
  }

  private generateRecommendation(score: number, risks: Risk[], jobData: JobData): Recommendation {
    const hasHired = jobData.hires > 0;
    const criticalRisks = risks.filter(r => r.type === 'critical').length;
    const highRisks = risks.filter(r => r.type === 'high').length;

    if (hasHired) {
      return {
        action: 'CHECK STATUS',
        confidence: 'low',
        message: 'Client has already hired - verify if position is still open',
        color: '#ff5e5b'
      };
    }

    if (criticalRisks > 0) {
      return {
        action: 'SKIP',
        confidence: 'low',
        message: 'Critical red flags detected - not worth the risk',
        color: '#d73502'
      };
    }

    if (score >= 70 && highRisks === 0) {
      return {
        action: 'APPLY NOW',
        confidence: 'high',
        message: 'Excellent opportunity with strong success indicators',
        color: '#14a800'
      };
    }

    if (score >= 50 && highRisks <= 1) {
      return {
        action: 'APPLY SELECTIVELY',
        confidence: 'medium',
        message: 'Decent opportunity if it matches your expertise',
        color: '#f59e0b'
      };
    }

    if (score >= 30 || highRisks <= 2) {
      return {
        action: 'PROCEED WITH CAUTION',
        confidence: 'low',
        message: 'Some red flags - only apply if perfect match',
        color: '#ff7a00'
      };
    }

    return {
      action: 'SKIP',
      confidence: 'low',
      message: 'Too many red flags - not worth the connects',
      color: '#d73502'
    };
  }

  private generateInsights(jobData: JobData, metrics: KeyMetrics): Insight[] {
    const insights: Insight[] = [];
    const { client } = jobData;

    if (client.totalSpent > 0 && client.hires > 5) {
      const avgValue = client.totalSpent / client.hires;
      insights.push({
        type: 'premium',
        message: `Average project: $${avgValue.toFixed(0)}`,
        icon: '💎'
      });

      if (jobData.budget.type === 'fixed' && jobData.budget.amount && jobData.budget.amount < avgValue * 0.7) {
        insights.push({
          type: 'warning',
          message: 'Budget below client average',
          icon: '⚠️'
        });
      }
    }

    if (metrics.responseRate !== 'N/A' && parseFloat(metrics.responseRate) > 20) {
      insights.push({
        type: 'positive',
        message: `Interview rate: ${metrics.responseRate}`,
        icon: '🎯'
      });
    }

    if (client.memberDuration > 3 && client.hires > 10) {
      const hiresPerYear = (client.hires / client.memberDuration).toFixed(1);
      insights.push({
        type: 'activity',
        message: `${hiresPerYear} hires/year average`,
        icon: '📈'
      });
    }

    if (jobData.skills.length > 8) {
      insights.push({
        type: 'complexity',
        message: 'Multi-skill project',
        icon: '🔧'
      });
    }

    if (client.totalHours > 0 && client.hires > 0) {
      const avgHours = Math.round(client.totalHours / client.hires);
      if (avgHours < 10) {
        insights.push({
          type: 'warning',
          message: `Short projects: ~${avgHours}hrs`,
          icon: '⏱️'
        });
      }
    }

    if (jobData.lastViewed !== 'Unknown') {
      insights.push({
        type: 'info',
        message: `Last viewed: ${jobData.lastViewed}`,
        icon: '👁️'
      });
    }

    return insights;
  }

  private isRecentlyPosted(posted: string): boolean {
    const postedLower = posted.toLowerCase();
    return postedLower.includes('minute') || 
           postedLower.includes('hour') || 
           (postedLower.includes('1 day') && !postedLower.includes('days'));
  }

  private isOld(posted: string): boolean {
    const postedLower = posted.toLowerCase();
    const daysMatch = postedLower.match(/(\d+)\s*days?/);
    if (daysMatch && parseInt(daysMatch[1]) > 7) return true;
    return postedLower.includes('week') || postedLower.includes('month');
  }

  private hasDeadlineUrgency(description: string): boolean {
    const desc = description.toLowerCase();
    const urgentWords = ['urgent', 'asap', 'immediately', 'today', 'tomorrow', '24 hour', '48 hour', 'tight deadline', 'rush'];
    return urgentWords.some(word => desc.includes(word));
  }
}
