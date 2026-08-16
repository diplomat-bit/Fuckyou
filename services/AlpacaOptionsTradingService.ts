export interface AlpacaConfig {
  apiKey: string;
  apiSecret: string;
  paper?: boolean;
  baseUrl?: string;
  dataBaseUrl?: string;
}

export type OptionType = 'call' | 'put';
export type OptionStyle = 'american' | 'european';
export type OptionSide = 'buy_to_open' | 'buy_to_close' | 'sell_to_open' | 'sell_to_close';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type TimeInForce = 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';

export enum OptionsApprovalLevel {
  LEVEL_0 = 0, // No options trading allowed
  LEVEL_1 = 1, // Covered calls & cash-secured puts
  LEVEL_2 = 2, // Long calls & puts, cash-secured puts
  LEVEL_3 = 3, // Credit & debit spreads
  LEVEL_4 = 4  // Uncovered / Naked options
}

export interface OptionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionContract {
  id: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  expirationDate: string;
  rootSymbol: string;
  underlyingSymbol: string;
  type: OptionType;
  style: OptionStyle;
  strikePrice: number;
  multiplier: number;
  openInterest?: number;
  impliedVolatility?: number;
  greeks?: OptionGreeks;
  bidPrice?: number;
  askPrice?: number;
  lastPrice?: number;
}

export interface OptionChainParams {
  underlyingSymbol: string;
  expirationDate?: string;
  minStrike?: number;
  maxStrike?: number;
  type?: OptionType;
  limit?: number;
}

export interface OptionLeg {
  symbol: string;
  ratioQty: number;
  side: OptionSide;
}

export interface OptionOrderRequest {
  symbol: string;
  qty: number;
  side: OptionSide;
  type: OrderType;
  timeInForce: TimeInForce;
  limitPrice?: number;
  stopPrice?: number;
  orderClass?: 'simple' | 'bracket' | 'mleg';
  legs?: OptionLeg[];
}

export interface OptionOrderResponse {
  id: string;
  clientOrderId: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  filledAt: string | null;
  expiredAt: string | null;
  canceledAt: string | null;
  failedAt: string | null;
  assetId: string;
  symbol: string;
  qty: number;
  filledQty: number;
  type: OrderType;
  side: OptionSide;
  timeInForce: TimeInForce;
  limitPrice: number | null;
  stopPrice: number | null;
  status: string;
  legs?: OptionOrderResponse[];
}

export interface OptionPosition {
  assetId: string;
  symbol: string;
  exchange: string;
  assetClass: string;
  avgEntryPrice: number;
  qty: number;
  side: 'long' | 'short';
  marketValue: number;
  costBasis: number;
  unrealizedPl: number;
  unrealizedPlpc: number;
  currentPrice: number;
  lastdayPrice: number;
  changeToday: number;
}

export interface HedgingStrategyParams {
  underlyingSymbol: string;
  portfolioSharesQty: number;
  targetPortfolioDelta?: number; // Target net delta (default: 0 for delta-neutral)
  maxCollateralBudgetUSD: number;
  preferredOptionType?: OptionType; // e.g. 'put' for protective put
  maxExpirationDays?: number;
}

export interface HedgingRecommendation {
  underlyingSymbol: string;
  currentShares: number;
  targetDelta: number;
  currentDelta: number;
  deltaDeficit: number;
  recommendedContract: OptionContract;
  recommendedContractsCount: number;
  totalOptionCostEst: number;
  resultingNetDelta: number;
  requiredCollateralUSD: number;
  hedgingStatus: 'EXECUTABLE' | 'EXCEEDS_BUDGET' | 'NO_CONTRACTS_FOUND';
}

export class AlpacaOptionsTradingService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private dataBaseUrl: string;

  constructor(config: AlpacaConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    const isPaper = config.paper !== undefined ? config.paper : true;
    this.baseUrl = config.baseUrl || (isPaper ? 'https://paper-api.alpaca.markets' : 'https://api.alpaca.markets');
    this.dataBaseUrl = config.dataBaseUrl || 'https://data.alpaca.markets';
  }

  private getHeaders(): Record<string, string> {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isDataApi: boolean = false): Promise<T> {
    const baseUrl = isDataApi ? this.dataBaseUrl : this.baseUrl;
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alpaca API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Retrieves account details and determines maximum allowed options level.
   */
  public async getAccountOptionsApproval(): Promise<{ level: OptionsApprovalLevel; status: string }> {
    const account = await this.request<{ options_approved_level?: number; options_trading_level?: number; status: string }>('/v2/account');
    const level = account.options_approved_level ?? account.options_trading_level ?? OptionsApprovalLevel.LEVEL_0;
    return {
      level: level as OptionsApprovalLevel,
      status: account.status
    };
  }

  /**
   * Validates if an account is approved for a given options strategy level.
   */
  public async validateStrategyApproval(requiredLevel: OptionsApprovalLevel): Promise<boolean> {
    const { level } = await this.getAccountOptionsApproval();
    return level >= requiredLevel;
  }

  /**
   * Fetches available option contracts for a given symbol and filtering parameters.
   */
  public async getOptionContracts(params: OptionChainParams): Promise<OptionContract[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('underlying_symbols', params.underlyingSymbol);
    if (params.expirationDate) queryParams.append('expiration_date', params.expirationDate);
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/v2/options/contracts?${queryParams.toString()}`;
    const rawResponse = await this.request<{ option_contracts: Array<Record<string, unknown>> }>(endpoint);

    if (!rawResponse.option_contracts) return [];

    let contracts: OptionContract[] = rawResponse.option_contracts.map((c) => ({
      id: String(c.id || ''),
      symbol: String(c.symbol || ''),
      name: String(c.name || ''),
      status: String(c.status || ''),
      tradable: Boolean(c.tradable),
      expirationDate: String(c.expiration_date || ''),
      rootSymbol: String(c.root_symbol || ''),
      underlyingSymbol: String(c.underlying_symbol || ''),
      type: (c.type as OptionType) || 'call',
      style: (c.style as OptionStyle) || 'american',
      strikePrice: parseFloat(String(c.strike_price || '0')),
      multiplier: parseFloat(String(c.multiplier || '100')),
      openInterest: c.open_interest ? parseInt(String(c.open_interest), 10) : undefined,
      impliedVolatility: c.implied_volatility ? parseFloat(String(c.implied_volatility)) : undefined,
    }));

    if (params.minStrike !== undefined) {
      contracts = contracts.filter(c => c.strikePrice >= params.minStrike!);
    }
    if (params.maxStrike !== undefined) {
      contracts = contracts.filter(c => c.strikePrice <= params.maxStrike!);
    }

    return contracts;
  }

  /**
   * Retrieves real-time market snapshots and Greeks for options contracts.
   */
  public async getOptionSnapshots(symbols: string[]): Promise<Map<string, { bid: number; ask: number; last: number; greeks?: OptionGreeks }>> {
    if (symbols.length === 0) return new Map();

    const query = encodeURIComponent(symbols.join(','));
    const endpoint = `/v1beta1/options/snapshots?symbols=${query}`;
    
    const resultMap = new Map<string, { bid: number; ask: number; last: number; greeks?: OptionGreeks }>();

    try {
      const data = await this.request<Record<string, { latestQuote?: { bp?: number; ap?: number }; latestTrade?: { p?: number }; greeks?: OptionGreeks }>>(endpoint, {}, true);

      for (const symbol of symbols) {
        const snap = data[symbol];
        if (snap) {
          resultMap.set(symbol, {
            bid: snap.latestQuote?.bp || 0,
            ask: snap.latestQuote?.ap || 0,
            last: snap.latestTrade?.p || 0,
            greeks: snap.greeks
          });
        }
      }
    } catch {
      // Fallback or empty map if market data subscription is inactive
    }

    return resultMap;
  }

  /**
   * Submits an option order (single leg or multi-leg).
   */
  public async placeOptionOrder(order: OptionOrderRequest): Promise<OptionOrderResponse> {
    const payload: Record<string, unknown> = {
      symbol: order.symbol,
      qty: order.qty,
      side: order.side,
      type: order.type,
      time_in_force: order.timeInForce,
    };

    if (order.limitPrice !== undefined) payload.limit_price = order.limitPrice.toString();
    if (order.stopPrice !== undefined) payload.stop_price = order.stopPrice.toString();
    if (order.orderClass) payload.order_class = order.orderClass;
    if (order.legs && order.legs.length > 0) {
      payload.legs = order.legs.map(leg => ({
        symbol: leg.symbol,
        ratio_qty: leg.ratioQty.toString(),
        side: leg.side
      }));
    }

    return this.request<OptionOrderResponse>('/v2/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Fetches all current open options positions in the portfolio.
   */
  public async getOptionPositions(): Promise<OptionPosition[]> {
    const positions = await this.request<Array<Record<string, unknown>>>('/v2/positions');
    
    return positions
      .filter(p => p.asset_class === 'us_option' || String(p.symbol).length > 6)
      .map(p => ({
        assetId: String(p.asset_id),
        symbol: String(p.symbol),
        exchange: String(p.exchange),
        assetClass: String(p.asset_class),
        avgEntryPrice: parseFloat(String(p.avg_entry_price || '0')),
        qty: parseFloat(String(p.qty || '0')),
        side: (p.side as 'long' | 'short') || 'long',
        marketValue: parseFloat(String(p.market_value || '0')),
        costBasis: parseFloat(String(p.cost_basis || '0')),
        unrealizedPl: parseFloat(String(p.unrealized_pl || '0')),
        unrealizedPlpc: parseFloat(String(p.unrealized_plpc || '0')),
        currentPrice: parseFloat(String(p.current_price || '0')),
        lastdayPrice: parseFloat(String(p.lastday_price || '0')),
        changeToday: parseFloat(String(p.change_today || '0')),
      }));
  }

  /**
   * Calculates a Delta-Hedging option structure for hedging underlying stock positions.
   * Assumes each standard option contract controls 100 shares.
   */
  public async calculateCollateralHedge(params: HedgingStrategyParams): Promise<HedgingRecommendation> {
    const targetDelta = params.targetPortfolioDelta ?? 0;
    const currentDelta = params.portfolioSharesQty * 1.0; // 1 share = 1.0 delta
    const deltaDeficit = targetDelta - currentDelta;

    const preferredType: OptionType = params.preferredOptionType || (deltaDeficit < 0 ? 'put' : 'call');
    
    const contracts = await this.getOptionContracts({
      underlyingSymbol: params.underlyingSymbol,
      type: preferredType,
      limit: 20
    });

    if (contracts.length === 0) {
      throw new Error(`No available option contracts found for hedging ${params.underlyingSymbol}`);
    }

    const symbols = contracts.map(c => c.symbol);
    const snapshots = await this.getOptionSnapshots(symbols);

    let bestContract: OptionContract | null = null;
    let bestContractDelta = preferredType === 'put' ? -0.50 : 0.50;
    let bestAskPrice = 0;

    for (const contract of contracts) {
      const snap = snapshots.get(contract.symbol);
      const delta = snap?.greeks?.delta ?? (preferredType === 'put' ? -0.45 : 0.45);
      const ask = snap?.ask || snap?.last || 1.0;

      contract.greeks = snap?.greeks || { delta, gamma: 0, theta: 0, vega: 0, rho: 0 };
      contract.askPrice = ask;

      // Select ATM / Near-the-money contract closest to -0.5 delta for puts or +0.5 delta for calls
      if (!bestContract || Math.abs(Math.abs(delta) - 0.5) < Math.abs(Math.abs(bestContractDelta) - 0.5)) {
        bestContract = contract;
        bestContractDelta = delta;
        bestAskPrice = ask;
      }
    }

    if (!bestContract) {
      bestContract = contracts[0];
      bestAskPrice = 1.0;
      bestContractDelta = preferredType === 'put' ? -0.5 : 0.5;
    }

    // Contracts needed = Delta Deficit / (Contract Delta * Multiplier)
    const deltaPerContract = bestContractDelta * (bestContract.multiplier || 100);
    const neededContracts = Math.max(1, Math.round(Math.abs(deltaDeficit / deltaPerContract)));
    const estimatedCost = neededContracts * bestAskPrice * (bestContract.multiplier || 100);

    const isExecutable = estimatedCost <= params.maxCollateralBudgetUSD;

    return {
      underlyingSymbol: params.underlyingSymbol,
      currentShares: params.portfolioSharesQty,
      targetDelta,
      currentDelta,
      deltaDeficit,
      recommendedContract: bestContract,
      recommendedContractsCount: neededContracts,
      totalOptionCostEst: estimatedCost,
      resultingNetDelta: currentDelta + (neededContracts * deltaPerContract),
      requiredCollateralUSD: estimatedCost,
      hedgingStatus: isExecutable ? 'EXECUTABLE' : 'EXCEEDS_BUDGET'
    };
  }

  /**
   * Automatically places hedging order based on computed collateral strategy recommendation.
   */
  public async executeCollateralHedge(params: HedgingStrategyParams): Promise<{ order: OptionOrderResponse; recommendation: HedgingRecommendation }> {
    const recommendation = await this.calculateCollateralHedge(params);

    if (recommendation.hedgingStatus !== 'EXECUTABLE') {
      throw new Error(`Cannot execute hedge order: Budget exceeded or no valid contract found. Cost: $${recommendation.totalOptionCostEst}, Budget: $${params.maxCollateralBudgetUSD}`);
    }

    const orderReq: OptionOrderRequest = {
      symbol: recommendation.recommendedContract.symbol,
      qty: recommendation.recommendedContractsCount,
      side: 'buy_to_open',
      type: 'limit',
      limitPrice: Number(((recommendation.recommendedContract.askPrice || 1.0) * 1.02).toFixed(2)), // 2% slippage buffer
      timeInForce: 'gtc'
    };

    const order = await this.placeOptionOrder(orderReq);

    return {
      order,
      recommendation
    };
  }

  /**
   * Liquidates/closes an open options position safely.
   */
  public async closeOptionPosition(symbol: string, qty?: number): Promise<OptionOrderResponse> {
    const positions = await this.getOptionPositions();
    const position = positions.find(p => p.symbol === symbol);

    if (!position) {
      throw new Error(`No active position found for option symbol: ${symbol}`);
    }

    const closeQty = qty ? Math.min(qty, Math.abs(position.qty)) : Math.abs(position.qty);
    const closeSide: OptionSide = position.side === 'long' ? 'sell_to_close' : 'buy_to_close';

    return this.placeOptionOrder({
      symbol,
      qty: closeQty,
      side: closeSide,
      type: 'market',
      timeInForce: 'day'
    });
  }
}