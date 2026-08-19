

// --- CONSOLIDATED FROM: ./services/marketDataService.ts ---

import { EventEmitter } from "events";

/**
 * Interface representing Alpaca Bar (historical candlestick data)
 */
export interface AlpacaBar {
  t: string;  // Timestamp
  o: number;  // Open price
  h: number;  // High price
  l: number;  // Low price
  c: number;  // Close price
  v: number;  // Volume
  n: number;  // Trade count
  vw: number; // Volume weighted average price
}

/**
 * Interface representing the response structure for Alpaca Bars API
 */
interface AlpacaBarsResponse {
  bars: {
    [symbol: string]: AlpacaBar[];
  };
  next_page_token: string | null;
}

/**
 * Interface representing the response structure for Alpaca Latest Trade API
 */
interface AlpacaLatestTradeResponse {
  symbol: string;
  trade: {
    t: string;  // Timestamp
    x: string;  // Exchange
    p: number;  // Price
    s: number;  // Size
    c: string[]; // Conditions
    i: number;  // ID
    z: string;  // Tape
  };
}

/**
 * Interface representing calculated volatility metrics
 */
export interface VolatilityMetrics {
  symbol: string;
  standardDeviation: number;
  annualizedVolatility: number;
  averageTrueRange: number;
  periodDays: number;
  lastUpdated: Date;
}

/**
 * Interface representing dynamic loan parameters adjusted for market risk
 */
export interface DynamicLoanParameters {
  symbol: string;
  currentPrice: number;
  baseLtv: number;
  adjustedLtv: number;
  baseInterestRate: number;
  adjustedInterestRate: number;
  volatilityMetrics: VolatilityMetrics;
  riskCategory: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  marginCallThreshold: number; // Price at which a margin call is triggered
  liquidationThreshold: number; // Price at which collateral liquidation begins
  timestamp: Date;
}

/**
 * Interface representing the health status of an active loan
 */
export interface LoanHealthStatus {
  loanId: string;
  symbol: string;
  collateralAmount: number;
  collateralValue: number;
  loanBalance: number;
  currentLtv: number;
  healthFactor: number; // > 1.0 is healthy, < 1.0 is subject to liquidation
  isMarginCallTriggered: boolean;
  isLiquidationTriggered: boolean;
  recommendedAction: "NONE" | "MONITOR" | "MARGIN_CALL" | "LIQUIDATE";
}

/**
 * Service integrating Alpaca Market Data API to fetch real-time stock prices,
 * historical trends, and volatility metrics to dynamically adjust collateral
 * requirements and interest rates for active loans.
 */
export class MarketDataService extends EventEmitter {
  private apiKeyId: string;
  private apiSecretKey: string;
  private baseUrl: string;
  private isMockMode: boolean = false;

  constructor() {
    super();
    this.apiKeyId = process.env.ALPACA_API_KEY_ID || "";
    this.apiSecretKey = process.env.ALPACA_API_SECRET_KEY || "";
    this.baseUrl = "https://data.alpaca.markets/v2";

    if (!this.apiKeyId || !this.apiSecretKey) {
      console.warn(
        "WARNING: Alpaca API credentials missing. MarketDataService is running in MOCK MODE with simulated financial data."
      );
      this.isMockMode = true;
    }
  }

  /**
   * Helper to generate headers for Alpaca API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      "APCA-API-KEY-ID": this.apiKeyId,
      "APCA-API-SECRET-KEY": this.apiSecretKey,
      "Accept": "application/json",
    };
  }

  /**
   * Fetches the latest real-time trade price for a given stock symbol
   * @param symbol Stock ticker symbol (e.g., "AAPL", "TSLA")
   */
  public async getLatestPrice(symbol: string): Promise<number> {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (this.isMockMode) {
      return this.getMockPrice(cleanSymbol);
    }

    try {
      const url = `${this.baseUrl}/stocks/${cleanSymbol}/trades/latest`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Alpaca API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as AlpacaLatestTradeResponse;
      if (!data.trade || !data.trade.p) {
        throw new Error(`No trade data returned for symbol: ${cleanSymbol}`);
      }

      return data.trade.p;
    } catch (error) {
      console.error(`Error fetching latest price for ${cleanSymbol}:`, error);
      // Fallback to mock data in production to prevent system crashes, but log the failure
      return this.getMockPrice(cleanSymbol);
    }
  }

  /**
   * Fetches historical daily bars for a given stock symbol
   * @param symbol Stock ticker symbol
   * @param limit Number of historical days to fetch (default 30)
   */
  public async getHistoricalBars(symbol: string, limit: number = 30): Promise<AlpacaBar[]> {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (this.isMockMode) {
      return this.getMockBars(cleanSymbol, limit);
    }

    try {
      const end = new Date();
      const start = new Date();
      // Fetch slightly more days to account for weekends/holidays and guarantee 'limit' trading days
      start.setDate(end.getDate() - Math.ceil(limit * 1.5));

      const startIso = start.toISOString();
      const endIso = end.toISOString();
      const url = `${this.baseUrl}/stocks/bars?symbols=${cleanSymbol}&timeframe=1Day&start=${startIso}&end=${endIso}&limit=${limit}&adjustment=all`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Alpaca API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as AlpacaBarsResponse;
      const bars = data.bars?.[cleanSymbol];

      if (!bars || bars.length === 0) {
        throw new Error(`No historical bars returned for symbol: ${cleanSymbol}`);
      }

      return bars;
    } catch (error) {
      console.error(`Error fetching historical bars for ${cleanSymbol}:`, error);
      return this.getMockBars(cleanSymbol, limit);
    }
  }

  /**
   * Calculates volatility metrics based on historical daily bars
   * @param symbol Stock ticker symbol
   * @param periodDays Number of days to analyze
   */
  public async calculateVolatility(symbol: string, periodDays: number = 30): Promise<VolatilityMetrics> {
    const bars = await this.getHistoricalBars(symbol, periodDays);
    
    if (bars.length < 2) {
      return {
        symbol,
        standardDeviation: 0.02,
        annualizedVolatility: 0.30,
        averageTrueRange: 1.5,
        periodDays: bars.length,
        lastUpdated: new Date(),
      };
    }

    // 1. Calculate Daily Returns: ln(Close_t / Close_t-1)
    const returns: number[] = [];
    let totalTrueRange = 0;

    for (let i = 1; i < bars.length; i++) {
      const prevClose = bars[i - 1].c;
      const currentClose = bars[i].c;
      
      // Log return
      const dailyReturn = Math.log(currentClose / prevClose);
      returns.push(dailyReturn);

      // True Range calculation for ATR
      const high = bars[i].h;
      const low = bars[i].l;
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      totalTrueRange += tr;
    }

    // 2. Calculate Standard Deviation of Daily Returns
    const meanReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const variance = returns.reduce((sum, val) => sum + Math.pow(val - meanReturn, 2), 0) / (returns.length - 1);
    const standardDeviation = Math.sqrt(variance);

    // 3. Annualize Volatility (assuming 252 trading days per year)
    const annualizedVolatility = standardDeviation * Math.sqrt(252);

    // 4. Calculate Average True Range (ATR)
    const averageTrueRange = totalTrueRange / (bars.length - 1);

    return {
      symbol,
      standardDeviation,
      annualizedVolatility,
      averageTrueRange,
      periodDays: bars.length,
      lastUpdated: new Date(),
    };
  }

  /**
   * Dynamically adjusts loan parameters (LTV and Interest Rate) based on real-time market volatility
   * @param symbol Stock ticker symbol used as collateral
   * @param baseLtv The baseline Loan-to-Value ratio (e.g., 0.60 for 60%)
   * @param baseInterestRate The baseline annual interest rate (e.g., 0.06 for 6%)
   */
  public async calculateDynamicLoanParameters(
    symbol: string,
    baseLtv: number = 0.60,
    baseInterestRate: number = 0.06
  ): Promise<DynamicLoanParameters> {
    const currentPrice = await this.getLatestPrice(symbol);
    const volatilityMetrics = await this.calculateVolatility(symbol, 30);
    const vol = volatilityMetrics.annualizedVolatility;

    let adjustedLtv = baseLtv;
    let adjustedInterestRate = baseInterestRate;
    let riskCategory: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";

    // Dynamic Risk Adjustment Matrix
    if (vol < 0.15) {
      // Low Volatility: Reward borrower with higher LTV and lower interest rate
      riskCategory = "LOW";
      adjustedLtv = Math.min(0.80, baseLtv + 0.10);
      adjustedInterestRate = Math.max(0.035, baseInterestRate - 0.015);
    } else if (vol >= 0.15 && vol < 0.35) {
      // Moderate Volatility: Standard parameters
      riskCategory = "MEDIUM";
      adjustedLtv = baseLtv;
      adjustedInterestRate = baseInterestRate;
    } else if (vol >= 0.35 && vol < 0.60) {
      // High Volatility: Reduce LTV, increase interest rate to mitigate risk
      riskCategory = "HIGH";
      adjustedLtv = Math.max(0.40, baseLtv - 0.15);
      adjustedInterestRate = baseInterestRate + 0.03; // +300 bps
    } else {
      // Critical Volatility (e.g., meme stocks, highly speculative assets)
      riskCategory = "CRITICAL";
      adjustedLtv = Math.max(0.20, baseLtv - 0.30);
      adjustedInterestRate = baseInterestRate + 0.07; // +700 bps
    }

    // Calculate Margin Call and Liquidation thresholds based on current price and volatility
    // Higher volatility requires wider buffers to prevent immediate liquidation on noise
    const marginCallBuffer = Math.max(0.10, vol * 0.4); // Buffer below current price
    const liquidationBuffer = Math.max(0.05, vol * 0.2);

    const marginCallThreshold = currentPrice * (1 - marginCallBuffer);
    const liquidationThreshold = marginCallThreshold * (1 - liquidationBuffer);

    return {
      symbol,
      currentPrice,
      baseLtv,
      adjustedLtv: parseFloat(adjustedLtv.toFixed(4)),
      baseInterestRate,
      adjustedInterestRate: parseFloat(adjustedInterestRate.toFixed(4)),
      volatilityMetrics,
      riskCategory,
      marginCallThreshold: parseFloat(marginCallThreshold.toFixed(2)),
      liquidationThreshold: parseFloat(liquidationThreshold.toFixed(2)),
      timestamp: new Date(),
    };
  }

  /**
   * Evaluates the health of an active loan based on current market price of collateral
   * @param loanId Unique identifier of the loan
   * @param symbol Stock ticker symbol of the collateral
   * @param collateralAmount Total units of stock held as collateral
   * @param loanBalance Current outstanding balance of the loan (principal + accrued interest)
   * @param dynamicParams Pre-calculated dynamic parameters for the asset
   */
  public async evaluateLoanHealth(
    loanId: string,
    symbol: string,
    collateralAmount: number,
    loanBalance: number,
    dynamicParams?: DynamicLoanParameters
  ): Promise<LoanHealthStatus> {
    const currentPrice = await this.getLatestPrice(symbol);
    const params = dynamicParams || (await this.calculateDynamicLoanParameters(symbol));

    const collateralValue = collateralAmount * currentPrice;
    const currentLtv = collateralValue > 0 ? loanBalance / collateralValue : 999;

    // Health Factor = (Collateral Value * Adjusted LTV) / Loan Balance
    // A health factor below 1.0 means the loan is under-collateralized relative to its risk-adjusted LTV
    const healthFactor = loanBalance > 0 
      ? (collateralValue * params.adjustedLtv) / loanBalance 
      : 999;

    // Determine triggers based on hard price thresholds
    const isMarginCallTriggered = currentPrice <= params.marginCallThreshold;
    const isLiquidationTriggered = currentPrice <= params.liquidationThreshold || currentLtv >= 0.95;

    let recommendedAction: "NONE" | "MONITOR" | "MARGIN_CALL" | "LIQUIDATE" = "NONE";
    if (isLiquidationTriggered) {
      recommendedAction = "LIQUIDATE";
    } else if (isMarginCallTriggered) {
      recommendedAction = "MARGIN_CALL";
    } else if (healthFactor < 1.2) {
      recommendedAction = "MONITOR";
    }

    return {
      loanId,
      symbol,
      collateralAmount,
      collateralValue: parseFloat(collateralValue.toFixed(2)),
      loanBalance: parseFloat(loanBalance.toFixed(2)),
      currentLtv: parseFloat(currentLtv.toFixed(4)),
      healthFactor: parseFloat(healthFactor.toFixed(4)),
      isMarginCallTriggered,
      isLiquidationTriggered,
      recommendedAction,
    };
  }

  /**
   * Generates mock prices for testing or when API keys are missing
   */
  private getMockPrice(symbol: string): number {
    const mockPrices: Record<string, number> = {
      AAPL: 175.50,
      MSFT: 415.20,
      TSLA: 170.10,
      AMZN: 180.40,
      NVDA: 875.00,
      SPY: 510.30,
    };

    const basePrice = mockPrices[symbol] || 100.00;
    // Add minor random fluctuation (-1.5% to +1.5%)
    const fluctuation = 1 + (Math.random() * 0.03 - 0.015);
    return parseFloat((basePrice * fluctuation).toFixed(2));
  }

  /**
   * Generates mock historical bars for testing or when API keys are missing
   */
  private getMockBars(symbol: string, limit: number): AlpacaBar[] {
    const basePrice = this.getMockPrice(symbol);
    const bars: AlpacaBar[] = [];
    let currentPrice = basePrice * 0.9; // Start slightly lower

    const now = new Date();

    for (let i = 0; i < limit; i++) {
      const date = new Date();
      date.setDate(now.getDate() - (limit - i));

      // Simulate daily price movement with volatility based on symbol
      const volatilityFactor = ["TSLA", "NVDA"].includes(symbol) ? 0.04 : 0.015;
      const change = currentPrice * (Math.random() * volatilityFactor * 2 - volatilityFactor);
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(1000000 + Math.random() * 5000000);

      bars.push({
        t: date.toISOString(),
        o: parseFloat(open.toFixed(2)),
        h: parseFloat(high.toFixed(2)),
        l: parseFloat(low.toFixed(2)),
        c: parseFloat(close.toFixed(2)),
        v: volume,
        n: Math.floor(volume / 100),
        vw: parseFloat(((open + high + low + close) / 4).toFixed(2)),
      });

      currentPrice = close;
    }

    return bars;
  }
}

// Export a singleton instance for global application use
export const marketDataService = new MarketDataService();