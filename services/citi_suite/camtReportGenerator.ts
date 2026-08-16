export interface CamtBalance {
  type: 'OPBD' | 'CLBD' | 'PRCD' | 'ITBD' | string;
  amount: number;
  currency: string;
  creditDebitIndicator: 'CRDT' | 'DBIT';
  date: string;
}

export interface CamtTransaction {
  id: string;
  amount: number;
  currency: string;
  creditDebitIndicator: 'CRDT' | 'DBIT';
  bookingDate: string;
  valueDate?: string;
  counterpartyName?: string;
  counterpartyIban?: string;
  remittanceInformation?: string;
  category?: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
  aiTags?: string[];
  riskScore?: number;
}

export interface CamtCategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
  type: 'inflow' | 'outflow';
}

export interface CamtActionableInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'cost_saving' | 'revenue_opportunity' | 'risk_warning' | 'liquidity_alert' | 'operational';
  suggestedAction: string;
}

export interface CamtProcessedData {
  statementId: string;
  creationDateTime: string;
  accountIban: string;
  accountCurrency: string;
  accountHolder?: string;
  balances: CamtBalance[];
  transactions: CamtTransaction[];
  aiAnalysis?: {
    overallSentiment?: 'positive' | 'neutral' | 'negative' | 'critical';
    summary?: string;
    keyObservations?: string[];
    riskAssessment?: {
      level: 'low' | 'medium' | 'high' | 'critical';
      score: number;
      flags: string[];
    };
    cashFlowForecast?: {
      predictedInflowNext30Days: number;
      predictedOutflowNext30Days: number;
      netProjected: number;
      confidence: number;
    };
    categoryBreakdown?: CamtCategoryBreakdown[];
    insights?: CamtActionableInsight[];
  };
}

export interface ReportOptions {
  title?: string;
  format?: 'markdown' | 'html' | 'text' | 'json';
  includeExecutiveSummary?: boolean;
  includeTransactionList?: boolean;
  includeAnomaliesOnly?: boolean;
  includeChartsData?: boolean;
  maxTransactionsDisplayed?: number;
  theme?: 'modern' | 'corporate' | 'dark' | 'minimal';
  companyName?: string;
}

export interface DailyCashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface ReportSummaryMetrics {
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
  transactionCount: number;
  anomalyCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface GeneratedReport {
  id: string;
  title: string;
  format: 'markdown' | 'html' | 'text' | 'json';
  generatedAt: string;
  content: string;
  summaryMetrics: ReportSummaryMetrics;
  insights: Array<{
    title: string;
    impact: string;
    action: string;
  }>;
  chartsData?: {
    dailyCashFlow: DailyCashFlowPoint[];
    categoryPieChart: Array<{ category: string; amount: number; percentage: number }>;
  };
}

/**
 * Utility class to generate presentable reports, summaries, and actionable insights
 * from AI-processed CAMT financial statement data.
 */
export class CamtReportGenerator {
  /**
   * Primary entry point to generate a comprehensive report from processed CAMT data.
   */
  public static generateReport(data: CamtProcessedData, options: ReportOptions = {}): GeneratedReport {
    const opts: Required<ReportOptions> = {
      title: options.title || `Financial Statement Analysis (${data.statementId || 'CAMT Report'})`,
      format: options.format || 'markdown',
      includeExecutiveSummary: options.includeExecutiveSummary ?? true,
      includeTransactionList: options.includeTransactionList ?? true,
      includeAnomaliesOnly: options.includeAnomaliesOnly ?? false,
      includeChartsData: options.includeChartsData ?? true,
      maxTransactionsDisplayed: options.maxTransactionsDisplayed ?? 50,
      theme: options.theme || 'modern',
      companyName: options.companyName || 'Financial Intelligence System',
    };

    const metrics = this.calculateMetrics(data);
    const dailyCashFlow = this.calculateDailyCashFlow(data);
    const categoryPie = this.calculateCategoryPieChart(data);

    let content = '';

    switch (opts.format) {
      case 'html':
        content = this.generateHtmlContent(data, metrics, opts, dailyCashFlow, categoryPie);
        break;
      case 'text':
        content = this.generateTextContent(data, metrics, opts);
        break;
      case 'json':
        content = JSON.stringify(
          {
            statementId: data.statementId,
            accountIban: data.accountIban,
            currency: data.accountCurrency,
            metrics,
            insights: data.aiAnalysis?.insights || [],
            summary: data.aiAnalysis?.summary || '',
            categoryBreakdown: data.aiAnalysis?.categoryBreakdown || [],
            dailyCashFlow,
          },
          null,
          2
        );
        break;
      case 'markdown':
      default:
        content = this.generateMarkdownContent(data, metrics, opts);
        break;
    }

    const reportId = `REP-${data.statementId || Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const formattedInsights = (data.aiAnalysis?.insights || []).map((i) => ({
      title: i.title,
      impact: i.impact,
      action: i.suggestedAction,
    }));

    return {
      id: reportId,
      title: opts.title,
      format: opts.format,
      generatedAt: new Date().toISOString(),
      content,
      summaryMetrics: metrics,
      insights: formattedInsights,
      chartsData: opts.includeChartsData
        ? {
            dailyCashFlow,
            categoryPieChart: categoryPie,
          }
        : undefined,
    };
  }

  /**
   * Quick summary string generator for direct embedding in AI prompts or dashboard widgets.
   */
  public static generatePromptSummary(data: CamtProcessedData): string {
    const metrics = this.calculateMetrics(data);
    const anomalies = data.transactions.filter((t) => t.isAnomaly);
    const insights = data.aiAnalysis?.insights || [];

    return [
      `=== FINANCIAL STATEMENT SUMMARY ===`,
      `Account IBAN: ${data.accountIban}`,
      `Currency: ${data.accountCurrency}`,
      `Opening Balance: ${this.formatCurrency(metrics.openingBalance, data.accountCurrency)}`,
      `Closing Balance: ${this.formatCurrency(metrics.closingBalance, data.accountCurrency)}`,
      `Total Inflow: ${this.formatCurrency(metrics.totalInflow, data.accountCurrency)}`,
      `Total Outflow: ${this.formatCurrency(metrics.totalOutflow, data.accountCurrency)}`,
      `Net Cash Flow: ${this.formatCurrency(metrics.netCashFlow, data.accountCurrency)}`,
      `Total Transactions: ${metrics.transactionCount}`,
      `Risk Assessment: ${metrics.riskLevel.toUpperCase()} (${data.aiAnalysis?.riskAssessment?.score || 0}/100)`,
      `Anomalies Detected: ${anomalies.length}`,
      data.aiAnalysis?.summary ? `AI Executive Summary: ${data.aiAnalysis.summary}` : '',
      insights.length > 0
        ? `Key Actionable Insights:\n` + insights.map((i, idx) => `  ${idx + 1}. [${i.impact.toUpperCase()}] ${i.title}: ${i.suggestedAction}`).join('\n')
        : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  // --- Internal calculation helpers ---

  private static calculateMetrics(data: CamtProcessedData): ReportSummaryMetrics {
    let totalInflow = 0;
    let totalOutflow = 0;
    let anomalyCount = 0;

    for (const tx of data.transactions) {
      if (tx.creditDebitIndicator === 'CRDT') {
        totalInflow += tx.amount;
      } else {
        totalOutflow += tx.amount;
      }
      if (tx.isAnomaly) {
        anomalyCount++;
      }
    }

    const openingBalObj = data.balances.find((b) => b.type === 'OPBD' || b.type === 'PRCD') || data.balances[0];
    const closingBalObj = data.balances.find((b) => b.type === 'CLBD' || b.type === 'ITBD') || data.balances[data.balances.length - 1];

    const openingBalance = openingBalObj ? (openingBalObj.creditDebitIndicator === 'DBIT' ? -openingBalObj.amount : openingBalObj.amount) : 0;
    const closingBalance = closingBalObj ? (closingBalObj.creditDebitIndicator === 'DBIT' ? -closingBalObj.amount : closingBalObj.amount) : 0;

    return {
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      openingBalance,
      closingBalance,
      transactionCount: data.transactions.length,
      anomalyCount,
      riskLevel: data.aiAnalysis?.riskAssessment?.level || 'low',
    };
  }

  private static calculateDailyCashFlow(data: CamtProcessedData): DailyCashFlowPoint[] {
    const dailyMap = new Map<string, { inflow: number; outflow: number }>();

    for (const tx of data.transactions) {
      const dateKey = tx.bookingDate ? tx.bookingDate.split('T')[0] : 'Unknown';
      const current = dailyMap.get(dateKey) || { inflow: 0, outflow: 0 };

      if (tx.creditDebitIndicator === 'CRDT') {
        current.inflow += tx.amount;
      } else {
        current.outflow += tx.amount;
      }

      dailyMap.set(dateKey, current);
    }

    const sortedDates = Array.from(dailyMap.keys()).sort();
    let runningBalance = data.balances.find((b) => b.type === 'OPBD')?.amount || 0;

    return sortedDates.map((date) => {
      const entry = dailyMap.get(date)!;
      runningBalance += entry.inflow - entry.outflow;
      return {
        date,
        inflow: Math.round(entry.inflow * 100) / 100,
        outflow: Math.round(entry.outflow * 100) / 100,
        balance: Math.round(runningBalance * 100) / 100,
      };
    });
  }

  private static calculateCategoryPieChart(data: CamtProcessedData): Array<{ category: string; amount: number; percentage: number }> {
    if (data.aiAnalysis?.categoryBreakdown && data.aiAnalysis.categoryBreakdown.length > 0) {
      return data.aiAnalysis.categoryBreakdown.map((cb) => ({
        category: cb.category,
        amount: cb.totalAmount,
        percentage: cb.percentageOfTotal,
      }));
    }

    const categoryMap = new Map<string, number>();
    let total = 0;

    for (const tx of data.transactions) {
      const cat = tx.category || 'Uncategorized';
      const current = categoryMap.get(cat) || 0;
      categoryMap.set(cat, current + tx.amount);
      total += tx.amount;
    }

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
    }));
  }

  // --- Format Generators ---

  private static generateMarkdownContent(data: CamtProcessedData, metrics: ReportSummaryMetrics, opts: Required<ReportOptions>): string {
    const currency = data.accountCurrency;
    const lines: string[] = [];

    lines.push(`# ${opts.title}`);
    lines.push(`**Generated:** ${new Date().toLocaleString()} | **Account IBAN:** \`${data.accountIban}\` | **Holder:** ${data.accountHolder || 'N/A'}`);
    lines.push('');

    // Executive Summary Section
    if (opts.includeExecutiveSummary && data.aiAnalysis) {
      lines.push('## 📊 Executive Summary');
      lines.push(data.aiAnalysis.summary || 'No overall summary provided.');
      lines.push('');

      if (data.aiAnalysis.keyObservations && data.aiAnalysis.keyObservations.length > 0) {
        lines.push('### Key Observations');
        for (const obs of data.aiAnalysis.keyObservations) {
          lines.push(`- ${obs}`);
        }
        lines.push('');
      }
    }

    // Key Financial Metrics
    lines.push('## 📈 Financial Key Metrics');
    lines.push('| Metric | Value |');
    lines.push('| :--- | :--- |');
    lines.push(`| **Opening Balance** | ${this.formatCurrency(metrics.openingBalance, currency)} |`);
    lines.push(`| **Closing Balance** | ${this.formatCurrency(metrics.closingBalance, currency)} |`);
    lines.push(`| **Total Inflow** | 🟢 ${this.formatCurrency(metrics.totalInflow, currency)} |`);
    lines.push(`| **Total Outflow** | 🔴 ${this.formatCurrency(metrics.totalOutflow, currency)} |`);
    lines.push(`| **Net Cash Flow** | ${metrics.netCashFlow >= 0 ? '🟢' : '🔴'} ${this.formatCurrency(metrics.netCashFlow, currency)} |`);
    lines.push(`| **Anomalies Detected** | ${metrics.anomalyCount > 0 ? '⚠️ ' + metrics.anomalyCount : '✅ 0'} |`);
    lines.push(`| **Risk Assessment** | \`${metrics.riskLevel.toUpperCase()}\` |`);
    lines.push('');

    // Actionable Insights
    if (data.aiAnalysis?.insights && data.aiAnalysis.insights.length > 0) {
      lines.push('## 💡 Actionable Insights & Recommendations');
      for (const insight of data.aiAnalysis.insights) {
        const badge = insight.impact === 'high' ? '🚨 HIGH' : insight.impact === 'medium' ? '⚡ MEDIUM' : 'ℹ️ LOW';
        lines.push(`### ${badge} - ${insight.title}`);
        lines.push(`- **Type:** \`${insight.type}\``);
        lines.push(`- **Description:** ${insight.description}`);
        lines.push(`- **Action Item:** **${insight.suggestedAction}**`);
        lines.push('');
      }
    }

    // Cash Flow Forecast
    if (data.aiAnalysis?.cashFlowForecast) {
      const fc = data.aiAnalysis.cashFlowForecast;
      lines.push('## 🔮 30-Day Cash Flow Forecast');
      lines.push(`- **Projected Inflow:** ${this.formatCurrency(fc.predictedInflowNext30Days, currency)}`);
      lines.push(`- **Projected Outflow:** ${this.formatCurrency(fc.predictedOutflowNext30Days, currency)}`);
      lines.push(`- **Net Projected Balance:** ${this.formatCurrency(fc.netProjected, currency)}`);
      lines.push(`- **Model Confidence:** ${(fc.confidence * 100).toFixed(1)}%`);
      lines.push('');
    }

    // Transactions Table
    if (opts.includeTransactionList) {
      lines.push(`## 💳 ${opts.includeAnomaliesOnly ? 'Flagged Anomaly Transactions' : 'Transaction History'}`);

      let txList = data.transactions;
      if (opts.includeAnomaliesOnly) {
        txList = txList.filter((t) => t.isAnomaly);
      }
      txList = txList.slice(0, opts.maxTransactionsDisplayed);

      if (txList.length === 0) {
        lines.push('*No matching transactions to display.*');
      } else {
        lines.push('| Date | Counterparty | Category | Amount | Status / Notes |');
        lines.push('| :--- | :--- | :--- | :--- | :--- |');

        for (const tx of txList) {
          const dateStr = tx.bookingDate ? tx.bookingDate.split('T')[0] : 'N/A';
          const name = tx.counterpartyName || 'Unknown';
          const cat = tx.category || 'General';
          const isCredit = tx.creditDebitIndicator === 'CRDT';
          const amtStr = `${isCredit ? '+' : '-'}${this.formatCurrency(tx.amount, currency)}`;
          const note = tx.isAnomaly ? `⚠️ ${tx.anomalyReason || 'Anomaly'}` : 'Normal';

          lines.push(`| ${dateStr} | ${name} | ${cat} | ${amtStr} | ${note} |`);
        }

        if (data.transactions.length > opts.maxTransactionsDisplayed) {
          lines.push('');
          lines.push(`*\* Showing first ${opts.maxTransactionsDisplayed} of ${data.transactions.length} total transactions.*`);
        }
      }
    }

    return lines.join('\n');
  }

  private static generateHtmlContent(
    data: CamtProcessedData,
    metrics: ReportSummaryMetrics,
    opts: Required<ReportOptions>,
    dailyCashFlow: DailyCashFlowPoint[],
    categoryPie: Array<{ category: string; amount: number; percentage: number }>
  ): string {
    const currency = data.accountCurrency;
    const isDark = opts.theme === 'dark';

    const bg = isDark ? '#1a202c' : '#f7fafc';
    const cardBg = isDark ? '#2d3748' : '#ffffff';
    const textColor = isDark ? '#e2e8f0' : '#2d3748';
    const border = isDark ? '#4a5568' : '#e2e8f0';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${opts.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${bg}; color: ${textColor}; margin: 0; padding: 2rem; }
    .container { max-width: 1000px; margin: 0 auto; }
    .card { background: ${cardBg}; border: 1px solid ${border}; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .subtitle { color: #718096; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .metric { padding: 1rem; background: ${isDark ? '#1a202c' : '#edf2f7'}; border-radius: 6px; }
    .metric-label { font-size: 0.8rem; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
    .metric-value { font-size: 1.4rem; font-weight: bold; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid ${border}; font-size: 0.9rem; }
    th { background: ${isDark ? '#1a202c' : '#f7fafc'}; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .badge-high { background: #fed7d7; color: #9b2c2c; }
    .badge-medium { background: #feebc8; color: #9c4221; }
    .badge-low { background: #c6f6d5; color: #22543d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>${opts.title}</h1>
      <div class="subtitle">Statement ID: ${data.statementId} | IBAN: ${data.accountIban} | Generated: ${new Date().toLocaleDateString()}</div>
      
      ${data.aiAnalysis?.summary ? `<p style="line-height:1.6;">${data.aiAnalysis.summary}</p>` : ''}
    </div>

    <div class="card">
      <h3>Financial Overview</h3>
      <div class="grid">
        <div class="metric">
          <div class="metric-label">Opening Balance</div>
          <div class="metric-value">${this.formatCurrency(metrics.openingBalance, currency)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Closing Balance</div>
          <div class="metric-value">${this.formatCurrency(metrics.closingBalance, currency)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total Inflow</div>
          <div class="metric-value" style="color: #38a169;">+${this.formatCurrency(metrics.totalInflow, currency)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total Outflow</div>
          <div class="metric-value" style="color: #e53e3e;">-${this.formatCurrency(metrics.totalOutflow, currency)}</div>
        </div>
      </div>
    </div>

    ${
      data.aiAnalysis?.insights && data.aiAnalysis.insights.length > 0
        ? `<div class="card">
            <h3>Actionable AI Insights</h3>
            ${data.aiAnalysis.insights
              .map(
                (i) => `
              <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid ${border};">
                <span class="badge badge-${i.impact}">${i.impact.toUpperCase()} IMPACT</span>
                <strong style="margin-left: 0.5rem;">${i.title}</strong>
                <p style="margin: 0.5rem 0 0.25rem 0; font-size: 0.9rem;">${i.description}</p>
                <div style="font-size: 0.85rem; color: #3182ce;">👉 <strong>Action:</strong> ${i.suggestedAction}</div>
              </div>
            `
              )
              .join('')}
          </div>`
        : ''
    }

    ${
      opts.includeTransactionList
        ? `<div class="card">
            <h3>Recent Transactions (${data.transactions.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Counterparty</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.transactions
                  .slice(0, opts.maxTransactionsDisplayed)
                  .map((t) => {
                    const isCredit = t.creditDebitIndicator === 'CRDT';
                    return `
                    <tr>
                      <td>${t.bookingDate ? t.bookingDate.split('T')[0] : 'N/A'}</td>
                      <td>${t.counterpartyName || 'Unknown'}</td>
                      <td>${t.category || 'General'}</td>
                      <td style="color: ${isCredit ? '#38a169' : '#e53e3e'}; font-weight: bold;">
                        ${isCredit ? '+' : '-'}${this.formatCurrency(t.amount, currency)}
                      </td>
                      <td>${t.isAnomaly ? '<span class="badge badge-high">ANOMALY</span>' : 'Normal'}</td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>`
        : ''
    }
  </div>
</body>
</html>`;
  }

  private static generateTextContent(data: CamtProcessedData, metrics: ReportSummaryMetrics, opts: Required<ReportOptions>): string {
    const currency = data.accountCurrency;
    const divider = '='.repeat(60);
    const subDivider = '-'.repeat(60);

    const lines: string[] = [];
    lines.push(divider);
    lines.push(opts.title.toUpperCase());
    lines.push(`Statement ID: ${data.statementId} | IBAN: ${data.accountIban}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(divider);
    lines.push('');

    if (data.aiAnalysis?.summary) {
      lines.push('EXECUTIVE SUMMARY:');
      lines.push(data.aiAnalysis.summary);
      lines.push(subDivider);
      lines.push('');
    }

    lines.push('FINANCIAL HIGHLIGHTS:');
    lines.push(`  Opening Balance : ${this.formatCurrency(metrics.openingBalance, currency)}`);
    lines.push(`  Closing Balance : ${this.formatCurrency(metrics.closingBalance, currency)}`);
    lines.push(`  Total Inflow    : ${this.formatCurrency(metrics.totalInflow, currency)}`);
    lines.push(`  Total Outflow   : ${this.formatCurrency(metrics.totalOutflow, currency)}`);
    lines.push(`  Net Cash Flow   : ${this.formatCurrency(metrics.netCashFlow, currency)}`);
    lines.push(`  Anomalies Found : ${metrics.anomalyCount}`);
    lines.push(`  Risk Level      : ${metrics.riskLevel.toUpperCase()}`);
    lines.push(subDivider);
    lines.push('');

    if (data.aiAnalysis?.insights && data.aiAnalysis.insights.length > 0) {
      lines.push('ACTIONABLE INSIGHTS:');
      data.aiAnalysis.insights.forEach((i, index) => {
        lines.push(`  [${index + 1}] [${i.impact.toUpperCase()}] ${i.title}`);
        lines.push(`      Details: ${i.description}`);
        lines.push(`      Action : ${i.suggestedAction}`);
      });
      lines.push(subDivider);
      lines.push('');
    }

    if (opts.includeTransactionList) {
      lines.push('TRANSACTIONS SUMMARY:');
      lines.push(`Showing ${Math.min(opts.maxTransactionsDisplayed, data.transactions.length)} of ${data.transactions.length} items`);
      lines.push('');
      data.transactions.slice(0, opts.maxTransactionsDisplayed).forEach((t) => {
        const sign = t.creditDebitIndicator === 'CRDT' ? '+' : '-';
        const date = t.bookingDate ? t.bookingDate.split('T')[0] : 'N/A';
        lines.push(`  * ${date} | ${sign}${this.formatCurrency(t.amount, currency)} | ${t.counterpartyName || 'Unknown'} | ${t.category || 'General'}`);
      });
    }

    return lines.join('\n');
  }

  private static formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch {
      return `${currency || 'USD'} ${amount.toFixed(2)}`;
    }
  }
}