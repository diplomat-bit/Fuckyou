export interface FpslLoanAnalytics {
  account_number: string;
  total_lending_activities: number;
  in_progress_lending_activities: number;
  interest: {
    customer: number;
    partner: number;
  };
}

export interface EodCashInterest {
  account_id: string;
  cash_balance: string;
  account_rate_bps: number;
  account_accrued_interest: string;
  date: string;
}

export interface JitSettlement {
  id: string;
  account_id: string;
  total_amount: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  asset_class: string;
  created_at: string;
  updated_at: string;
}

export interface TradeConfirmation {
  id: string;
  account_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: string;
  price: string;
  execution_time: string;
  settlement_date: string;
  commission: string;
}

export interface AccountStatement {
  id: string;
  account_id: string;
  period: string;
  type: 'MONTHLY' | 'ANNUAL' | 'DAILY';
  download_url: string;
  created_at: string;
}

export interface TaxDocument {
  id: string;
  account_id: string;
  tax_year: number;
  document_type: '1099' | '1042-S' | 'W-8BEN' | 'K-1';
  status: 'AVAILABLE' | 'PENDING';
  download_url: string;
}

export interface AuditReport {
  report_id: string;
  account_id: string;
  start_date: string;
  end_date: string;
  total_trades: number;
  total_volume_usd: string;
  compliance_flags: number;
  generated_at: string;
  checksum: string;
}

export interface PortfolioPerformance {
  account_id: string;
  timeframe: string;
  starting_balance: number;
  current_balance: number;
  net_pnl: number;
  pnl_percentage: number;
  sharpe_ratio: number;
  max_drawdown: number;
  benchmark_return: number;
}

export class AlpacaReportingService {
  private static instance: AlpacaReportingService;

  private constructor() {}

  public static getInstance(): AlpacaReportingService {
    if (!AlpacaReportingService.instance) {
      AlpacaReportingService.instance = new AlpacaReportingService();
    }
    return AlpacaReportingService.instance;
  }

  public async getFpslAnalytics(accountId: string): Promise<FpslLoanAnalytics> {
    return {
      account_number: accountId || 'AQ88900122',
      total_lending_activities: 142,
      in_progress_lending_activities: 18,
      interest: {
        customer: 1425.80,
        partner: 475.20
      }
    };
  }

  public async getEodCashInterest(accountId: string, date?: string): Promise<EodCashInterest[]> {
    const reportDate = date || new Date().toISOString().split('T')[0];
    return [
      {
        account_id: accountId,
        cash_balance: '125000.00',
        account_rate_bps: 450,
        account_accrued_interest: '15.41',
        date: reportDate
      }
    ];
  }

  public async getJitSettlements(accountId?: string): Promise<JitSettlement[]> {
    const targetAccountId = accountId || 'AQ88900122';
    const now = new Date().toISOString();
    return [
      {
        id: 'jit_settle_9901',
        account_id: targetAccountId,
        total_amount: '50000.00',
        status: 'COMPLETED',
        asset_class: 'us_equity',
        created_at: now,
        updated_at: now
      },
      {
        id: 'jit_settle_9902',
        account_id: targetAccountId,
        total_amount: '25000.00',
        status: 'PROCESSING',
        asset_class: 'us_equity',
        created_at: now,
        updated_at: now
      }
    ];
  }

  public async getTradeConfirmations(accountId: string, year: number = new Date().getFullYear()): Promise<TradeConfirmation[]> {
    return [
      {
        id: 'confirm_tc_01',
        account_id: accountId,
        symbol: 'AAPL',
        side: 'buy',
        qty: '100',
        price: '185.50',
        execution_time: `${year}-01-15T14:30:00Z`,
        settlement_date: `${year}-01-17`,
        commission: '0.00'
      },
      {
        id: 'confirm_tc_02',
        account_id: accountId,
        symbol: 'NVDA',
        side: 'buy',
        qty: '50',
        price: '620.10',
        execution_time: `${year}-02-01T15:00:00Z`,
        settlement_date: `${year}-02-03`,
        commission: '0.00'
      }
    ];
  }

  public async getAccountStatements(accountId: string, period?: string): Promise<AccountStatement[]> {
    const now = new Date().toISOString();
    return [
      {
        id: 'stmt_2025_01',
        account_id: accountId,
        period: period || '2025-01',
        type: 'MONTHLY',
        download_url: `/api/v2/reports/statements/${accountId}/2025-01.pdf`,
        created_at: now
      },
      {
        id: 'stmt_2024_12',
        account_id: accountId,
        period: '2024-12',
        type: 'MONTHLY',
        download_url: `/api/v2/reports/statements/${accountId}/2024-12.pdf`,
        created_at: now
      }
    ];
  }

  public async getTaxDocuments(accountId: string, taxYear: number = new Date().getFullYear() - 1): Promise<TaxDocument[]> {
    return [
      {
        id: `tax_1099_${taxYear}`,
        account_id: accountId,
        tax_year: taxYear,
        document_type: '1099',
        status: 'AVAILABLE',
        download_url: `/api/v2/reports/tax/${accountId}/${taxYear}_1099.pdf`
      },
      {
        id: `tax_w8ben_${taxYear}`,
        account_id: accountId,
        tax_year: taxYear,
        document_type: 'W-8BEN',
        status: 'AVAILABLE',
        download_url: `/api/v2/reports/tax/${accountId}/${taxYear}_W8BEN.pdf`
      }
    ];
  }

  public async generateAuditReport(accountId: string, startDate?: string, endDate?: string): Promise<AuditReport> {
    const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    
    return {
      report_id: `audit_${Date.now()}`,
      account_id: accountId,
      start_date: start,
      end_date: end,
      total_trades: 342,
      total_volume_usd: '4829100.50',
      compliance_flags: 0,
      generated_at: new Date().toISOString(),
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };
  }

  public async getPortfolioPerformance(accountId: string, timeframe: string = '1Y'): Promise<PortfolioPerformance> {
    return {
      account_id: accountId,
      timeframe,
      starting_balance: 100000,
      current_balance: 145200,
      net_pnl: 45200,
      pnl_percentage: 45.2,
      sharpe_ratio: 2.15,
      max_drawdown: -8.4,
      benchmark_return: 24.1
    };
  }
}

export const alpacaReportingService = AlpacaReportingService.getInstance();
export default AlpacaReportingService;