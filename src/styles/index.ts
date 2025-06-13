export const styles = `
.uiq-container {
  background: var(--uiq-bg, #1d1d1b);
  border: 1px solid var(--uiq-border, rgba(255,255,255,0.1));
  border-radius: 8px;
  padding: 16px;
  color: var(--uiq-text, #fff);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 16px 0;
}

.uiq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.uiq-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.uiq-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.uiq-icon {
  font-size: 20px;
}

.uiq-score-container {
  text-align: center;
}

.uiq-score {
  font-size: 32px;
  font-weight: 700;
}

.uiq-score-label {
  font-size: 11px;
  color: var(--uiq-muted, #8c8c8a);
  text-transform: uppercase;
}

.uiq-recommendation {
  background: var(--uiq-card, rgba(255,255,255,0.05));
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border-left: 3px solid;
}

.uiq-recommendation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.uiq-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.uiq-action {
  font-weight: 600;
}

.uiq-recommendation-message {
  margin: 0;
  font-size: 13px;
}

.uiq-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.uiq-metric {
  background: var(--uiq-card, rgba(255,255,255,0.05));
  padding: 12px;
  border-radius: 6px;
}

.uiq-metric-label {
  font-size: 11px;
  color: var(--uiq-muted, #8c8c8a);
  margin-bottom: 4px;
}

.uiq-metric-value {
  font-size: 14px;
  font-weight: 600;
}

.uiq-section {
  margin-bottom: 16px;
}

.uiq-section-title {
  font-size: 13px;
  margin: 0 0 8px 0;
}

.uiq-risks-title {
  color: #ff5e5b;
}

.uiq-opportunities-title {
  color: #14a800;
}

.uiq-risk {
  background: rgba(255, 94, 91, 0.1);
  border-left: 2px solid #ff5e5b;
  padding: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.uiq-risk.critical {
  border-left-color: #ff0000;
}

.uiq-risk-message {
  color: #ff5e5b;
  font-weight: 500;
}

.uiq-risk.critical .uiq-risk-message {
  color: #ff0000;
}

.uiq-risk-impact {
  color: var(--uiq-muted, #8c8c8a);
  margin-top: 2px;
}

.uiq-opportunity {
  background: rgba(20, 168, 0, 0.1);
  border-left: 2px solid #14a800;
  padding: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.uiq-opportunity-message {
  color: #14a800;
  font-weight: 500;
}

.uiq-opportunity-action {
  color: var(--uiq-muted, #8c8c8a);
  margin-top: 2px;
}

.uiq-insights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.uiq-insight {
  background: var(--uiq-card, rgba(255,255,255,0.05));
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.uiq-error {
  background: rgba(255, 94, 91, 0.1);
  border: 1px solid #ff5e5b;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.uiq-error p {
  margin: 0 0 12px 0;
  color: #ff5e5b;
}

.uiq-error button {
  background: #ff5e5b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.uiq-error button:hover {
  background: #ff3333;
}

@media (prefers-color-scheme: light) {
  .uiq-container {
    --uiq-bg: #fff;
    --uiq-text: #001e00;
    --uiq-border: rgba(0,0,0,0.1);
    --uiq-muted: #5e6d55;
    --uiq-card: rgba(0,0,0,0.03);
  }
}
`;
