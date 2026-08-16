export enum DynamicPayloadCategory {
  TRADE_ORDER = 'TRADE_ORDER',
  MARKET_DATA = 'MARKET_DATA',
  ACCOUNT_INFO = 'ACCOUNT_INFO',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
}

export enum IntegrationTarget {
  ALPACA_BROKER = 'ALPACA_BROKER',
  BINANCE_EXCHANGE = 'BINANCE_EXCHANGE',
  COINBASE_PRO = 'COINBASE_PRO',
  INTERNAL_ANALYTICS = 'INTERNAL_ANALYTICS',
}

export interface AlpacaOrderPayload {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  timeInForce: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limitPrice?: number;
  stopPrice?: number;
  clientOrderId?: string;
}

export interface TransformationRule<I = any, O = any> {
  id: string;
  sourceCategory: DynamicPayloadCategory;
  target: IntegrationTarget;
  transform: (input: I) => Promise<O> | O;
  validator?: (input: O) => boolean;
}

export class PipelineTransformer {
  private rules: Map<string, TransformationRule<any, any>> = new Map();

  public registerRule<I, O>(rule: TransformationRule<I, O>): void {
    const key = this.getRuleKey(rule.sourceCategory, rule.target);
    this.rules.set(key, rule);
  }

  public async transform<O>(
    category: DynamicPayloadCategory,
    target: IntegrationTarget,
    data: any
  ): Promise<O> {
    const key = this.getRuleKey(category, target);
    const rule = this.rules.get(key);

    if (!rule) {
      throw new Error(`No transformation rule registered for ${category} -> ${target}`);
    }

    const result = await rule.transform(data);

    if (rule.validator && typeof rule.validator === 'function') {
      const isValid = rule.validator(result);
      if (!isValid) {
        throw new Error(`Validation failed for rule ${rule.id} after transformation`);
      }
    }

    return result as O;
  }

  private getRuleKey(category: DynamicPayloadCategory, target: IntegrationTarget): string {
    return `${category}::${target}`;
  }
}

export class AppIntegrationsBridge {
  private static instance: AppIntegrationsBridge;

  public static getInstance(): AppIntegrationsBridge {
    if (!AppIntegrationsBridge.instance) {
      AppIntegrationsBridge.instance = new AppIntegrationsBridge(new PipelineTransformer());
    }
    return AppIntegrationsBridge.instance;
  }

  constructor(private transformer: PipelineTransformer) {
    this.initializeDefaultRules();
  }

  /**
   * Initializes the bridge with standard transformation rules.
   */
  private initializeDefaultRules(): void {
    // Rule: Trade Order -> Alpaca Broker Format
    this.transformer.registerRule<Record<string, any>, AlpacaOrderPayload>({
      id: 'rule-app-trade-to-alpaca',
      sourceCategory: DynamicPayloadCategory.TRADE_ORDER,
      target: IntegrationTarget.ALPACA_BROKER,
      transform: (raw) => {
        return {
          symbol: String(raw.ticker || raw.symbol || '').toUpperCase(),
          qty: Number(raw.quantity || raw.qty || 0),
          side: (String(raw.side || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy') as 'buy' | 'sell',
          type: (raw.orderType as AlpacaOrderPayload['type']) || 'market',
          timeInForce: (raw.timeInForce as AlpacaOrderPayload['timeInForce']) || 'gtc',
          limitPrice: raw.limitPrice ? Number(raw.limitPrice) : undefined,
          stopPrice: raw.stopPrice ? Number(raw.stopPrice) : undefined,
          clientOrderId: raw.clientOrderId ? String(raw.clientOrderId) : undefined,
        };
      },
      validator: (order: AlpacaOrderPayload) => {
        return Boolean(
          order.symbol &&
          order.symbol.length > 0 &&
          order.qty > 0 &&
          (order.side === 'buy' || order.side === 'sell')
        );
      },
    });
  }

  /**
   * Bridges a payload from a source category to a target integration.
   * @param category The source data category.
   * @param target The target integration system.
   * @param payload The raw data to be transformed.
   */
  public async bridge<T = any>(
    category: DynamicPayloadCategory,
    target: IntegrationTarget,
    payload: any
  ): Promise<T> {
    try {
      return await this.transformer.transform<T>(category, target, payload);
    } catch (error) {
      console.error(`[AppIntegrationsBridge] Bridge failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}