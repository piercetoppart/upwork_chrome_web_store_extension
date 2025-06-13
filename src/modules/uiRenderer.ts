import { AnalysisResult, Risk, Opportunity, Insight } from '../types';
import { styles } from '../styles';

export class UIRenderer {
  private container: HTMLElement | null = null;

  render(analysis: AnalysisResult): void {
    this.cleanup();
    this.injectStyles();
    this.createContainer(analysis);
    this.insertIntoPage();
  }

  private cleanup(): void {
    const existing = document.getElementById('upworkiq-analysis');
    if (existing) existing.remove();
  }

  private injectStyles(): void {
    if (!document.getElementById('upworkiq-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'upworkiq-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
  }

  private createContainer(analysis: AnalysisResult): void {
    this.container = document.createElement('div');
    this.container.id = 'upworkiq-analysis';
    this.container.className = 'uiq-container';
    
    this.container.innerHTML = `
      <div class="uiq-header">
        <div class="uiq-title">
          <span class="uiq-icon">🧠</span>
          <h3>UpworkIQ Analysis</h3>
        </div>
        <div class="uiq-score-container">
          <div class="uiq-score" style="color: ${this.getScoreColor(analysis.score)}">
            ${analysis.score}
          </div>
          <div class="uiq-score-label">Score</div>
        </div>
      </div>

      <div class="uiq-recommendation" style="border-color: ${analysis.recommendation.color}">
        <div class="uiq-recommendation-header">
          <span class="uiq-indicator" style="background: ${analysis.recommendation.color}"></span>
          <span class="uiq-action" style="color: ${analysis.recommendation.color}">
            ${analysis.recommendation.action}
          </span>
        </div>
        <p class="uiq-recommendation-message">${analysis.recommendation.message}</p>
      </div>

      <div class="uiq-metrics">
        ${this.renderMetric('Competition', analysis.metrics.competitionLevel, this.getCompetitionColor(analysis.metrics.competitionLevel))}
        ${this.renderMetric('Interview Rate', analysis.metrics.responseRate, '#3d8bfd')}
        ${this.renderMetric('Client Activity', analysis.metrics.clientActivity, this.getActivityColor(analysis.metrics.clientActivity))}
        ${this.renderMetric('Success Chance', analysis.metrics.successProbability, this.getSuccessColor(analysis.metrics.successProbability))}
      </div>

      ${analysis.risks.length > 0 ? this.renderRisks(analysis.risks) : ''}
      ${analysis.opportunities.length > 0 ? this.renderOpportunities(analysis.opportunities) : ''}
      ${analysis.insights.length > 0 ? this.renderInsights(analysis.insights) : ''}
    `;
  }

  private renderMetric(label: string, value: string, color: string): string {
    return `
      <div class="uiq-metric">
        <div class="uiq-metric-label">${label}</div>
        <div class="uiq-metric-value" style="color: ${color}">${value}</div>
      </div>
    `;
  }

  private renderRisks(risks: Risk[]): string {
    return `
      <div class="uiq-section">
        <h4 class="uiq-section-title uiq-risks-title">⚠️ Risks</h4>
        ${risks.slice(0, 3).map(risk => `
          <div class="uiq-risk ${risk.type}">
            <div class="uiq-risk-message">${risk.message}</div>
            <div class="uiq-risk-impact">${risk.impact}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderOpportunities(opportunities: Opportunity[]): string {
    return `
      <div class="uiq-section">
        <h4 class="uiq-section-title uiq-opportunities-title">✨ Opportunities</h4>
        ${opportunities.slice(0, 2).map(opp => `
          <div class="uiq-opportunity">
            <div class="uiq-opportunity-message">${opp.message}</div>
            <div class="uiq-opportunity-action">${opp.action}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderInsights(insights: Insight[]): string {
    return `
      <div class="uiq-insights">
        ${insights.map(insight => `
          <span class="uiq-insight">
            <span>${insight.icon}</span>
            ${insight.message}
          </span>
        `).join('')}
      </div>
    `;
  }

  private insertIntoPage(): void {
    if (!this.container) return;

    const jobTitle = document.querySelector('h1, h2.m-0-bottom, .flex-1[data-v-6dae415b]');
    if (jobTitle) {
      const insertTarget = jobTitle.closest('section')?.nextElementSibling || 
                          jobTitle.parentElement?.parentElement?.nextElementSibling;
      
      if (insertTarget) {
        insertTarget.parentElement?.insertBefore(this.container, insertTarget);
      } else {
        jobTitle.parentElement?.appendChild(this.container);
      }
    } else {
      document.body.insertBefore(this.container, document.body.firstChild);
    }
  }

  private getScoreColor(score: number): string {
    if (score >= 70) return '#14a800';
    if (score >= 50) return '#3d8bfd';
    if (score >= 30) return '#f59e0b';
    return '#ff5e5b';
  }

  private getCompetitionColor(level: string): string {
    const colors: Record<string, string> = {
      'Very Low': '#14a800',
      'Low': '#37a000',
      'Medium': '#f59e0b',
      'High': '#ff7a00',
      'Very High': '#ff5e5b'
    };
    return colors[level] || '#3d8bfd';
  }

  private getActivityColor(activity: string): string {
    const colors: Record<string, string> = {
      'Very Active': '#14a800',
      'Active': '#37a000',
      'Selective': '#f59e0b',
      'Minimal Activity': '#ff7a00',
      'Inactive': '#ff5e5b',
      'New Client': '#3d8bfd'
    };
    return colors[activity] || '#3d8bfd';
  }

  private getSuccessColor(probability: string): string {
    const colors: Record<string, string> = {
      'Very High': '#14a800',
      'High': '#37a000',
      'Medium': '#f59e0b',
      'Low': '#ff7a00',
      'Very Low': '#ff5e5b'
    };
    return colors[probability] || '#3d8bfd';
  }
}

