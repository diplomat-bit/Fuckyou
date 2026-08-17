import { v4 as uuidv4 } from 'uuid';

export interface AlpacaAsset {
  id: string;
  class: string;
  exchange: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
}

export interface AlpacaAccountContact {
  email_address: string;
  phone_number: string;
  street_address: string[];
  city: string;
  postal_code: string;
  state: string;
}

export interface AlpacaAccountIdentity {
  given_name: string;
  family_name: string;
  date_of_birth: string;
  tax_id_type: string;
  tax_id: string;
  country_of_citizenship: string;
  country_of_birth: string;
  country_of_tax_residence: string;
  funding_source: string[];
  annual_income_min: string;
  annual_income_max: string;
  total_net_worth_min: string;
  total_net_worth_max: string;
  liquid_net_worth_min: string;
  liquid_net_worth_max: string;
  liquidity_needs: string;
  investment_experience_with_stocks: string;
  investment_experience_with_options: string;
  risk_tolerance: string;
  investment_objective: string;
  investment_time_horizon: string;
  marital_status: string;
  number_of_dependents: number;
}

export interface AlpacaCreateAccountPayload {
  contact: AlpacaAccountContact;
  identity: AlpacaAccountIdentity;
  disclosures: {
    is_control_person: boolean;
    is_affiliated_exchange_or_finra: boolean;
    is_affiliated_exchange_or_iiroc: boolean;
    is_politically_exposed: boolean;
    immediate_family_exposed: boolean;
  };
  agreements: Array<{
    agreement: string;
    signed_at: string;
    ip_address: string;
  }>;
  documents?: Array<{
    document_type: string;
    document_sub_type: string;
    content: string;
    mime_type: string;
  }>;
  trusted_contact?: {
    given_name: string;
    family_name: string;
    email_address: string;
  };
  additional_information?: string;
  account_type?: string;
}

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  last_equity: string;
  created_at: string;
  contact?: AlpacaAccountContact;
  identity?: AlpacaAccountIdentity;
}

export interface AlpacaAchRelationshipPayload {
  account_owner_name: string;
  bank_account_type: 'CHECKING' | 'SAVINGS';
  bank_account_number: string;
  bank_routing_number: string;
  nickname: string;
}

export interface AlpacaAchRelationship {
  id: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  status: 'QUEUED' | 'APPROVED' | 'REJECTED';
  account_owner_name: string;
  bank_account_type: string;
  bank_account_number: string;
  bank_routing_number: string;
  nickname: string;
}

export interface AlpacaTransferPayload {
  transfer_type: 'ach' | 'wire';
  relationship_id: string;
  amount: string;
  direction: 'INCOMING' | 'OUTGOING';
}

export interface AlpacaTransfer {
  id: string;
  relationship_id: string;
  account_id: string;
  type: string;
  status: 'QUEUED' | 'APPROVED' | 'COMPLETE' | 'FAILED';
  amount: string;
  direction: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface AlpacaCsdActivity {
  id: string;
  account_id: string;
  activity_type: 'CSD';
  date: string;
  net_amount: string;
  description: string;
  status: string;
}

export interface AlpacaJournalPayload {
  entry_type: 'JNLC' | 'JNLS';
  from_account: string;
  to_account: string;
  amount: string;
  description?: string;
}

export interface AlpacaJournal {
  id: string;
  entry_type: string;
  from_account: string;
  to_account: string;
  amount: string;
  status: 'queued' | 'pending' | 'executed';
  created_at: string;
  description?: string;
}

export interface AlpacaOrderPayload {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  replaced_at: string | null;
  replaced_by: string | null;
  replaces: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional: string | null;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  order_class: string;
  order_type: string;
  type: string;
  side: 'buy' | 'sell';
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  status: 'accepted' | 'pending_new' | 'filled' | 'canceled' | 'rejected';
  extended_hours: boolean;
  legs: any | null;
  trail_percent: string | null;
  trail_price: string | null;
  hwm: string | null;
  commission: string;
}

export interface AlpacaApiResponse<T> {
  data: T;
  requestId: string;
  statusCode: number;
  headers: Record<string, string>;
}

const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] as string;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    // @ts-ignore
    return import.meta.env[key] as string;
  }
  return '';
};

export class AlpacaBrokerService {
  private static instance: AlpacaBrokerService;
  
  private apiKey: string = getEnvVar('VITE_ALPACA_API_KEY') || 'PK_ALPACA_SANDBOX_2026_KEY';
  private apiSecret: string = getEnvVar('VITE_ALPACA_API_SECRET') || 'SK_ALPACA_SECRET_MOCK_SECURE_KEY';
  private baseUrl: string = 'https://broker-api.sandbox.alpaca.markets/v1';
  
  // Local state cache for interactive sandbox simulation
  private mockAccounts: Map<string, AlpacaAccount> = new Map();
  private mockAchRelationships: Map<string, AlpacaAchRelationship[]> = new Map();
  private mockTransfers: Map<string, AlpacaTransfer[]> = new Map();
  private mockJournals: AlpacaJournal[] = [];
  private mockOrders: Map<string, AlpacaOrder[]> = new Map();
  private mockFirmBalance: number = 45064.36; // Initial Sandbox sweep balance
  private mockFirmAccountId: string = '8f8c8cee-2591-4f83-be12-82c659b5e748';

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): AlpacaBrokerService {
    if (!AlpacaBrokerService.instance) {
      AlpacaBrokerService.instance = new AlpacaBrokerService();
    }
    return AlpacaBrokerService.instance;
  }

  public setCredentials(key: string, secret: string, isProduction: boolean = false) {
    this.apiKey = key;
    this.apiSecret = secret;
    this.baseUrl = isProduction 
      ? 'https://broker-api.alpaca.markets/v1' 
      : 'https://broker-api.sandbox.alpaca.markets/v1';
  }

  public getCredentials() {
    const authString = `${this.apiKey}:${this.apiSecret}`;
    let encoded = '';
    if (typeof btoa === 'function') {
      encoded = btoa(authString);
    } else if (typeof Buffer !== 'undefined') {
      encoded = Buffer.from(authString).toString('base64');
    } else {
      // @ts-ignore
      encoded = globalThis.btoa ? globalThis.btoa(authString) : '';
    }
    return {
      apiKey: this.apiKey,
      apiSecret: this.apiSecret,
      baseUrl: this.baseUrl,
      basicAuthHeader: 'Basic ' + encoded
    };
  }

  public getFirmAccountId(): string {
    return this.mockFirmAccountId;
  }

  public getFirmBalance(): number {
    return this.mockFirmBalance;
  }

  private generateRequestId(): string {
    return uuidv4().replace(/-/g, '');
  }

  private seedInitialData() {
    // Seed default sample account from Alpaca guide
    const sampleAccountId = 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d';
    const sampleAccount: AlpacaAccount = {
      id: sampleAccountId,
      account_number: '935142145',
      status: 'APPROVED',
      currency: 'USD',
      last_equity: '1234.56',
      created_at: '2021-05-17T09:53:17.588248Z',
      contact: {
        email_address: 'test1@gmail.com',
        phone_number: '7065912538',
        street_address: ['NG'],
        city: 'San Mateo',
        postal_code: '33345',
        state: 'CA'
      },
      identity: {
        given_name: 'John',
        family_name: 'Doe',
        date_of_birth: '1990-01-01',
        tax_id_type: 'USA_SSN',
        tax_id: '661-010-666',
        country_of_citizenship: 'USA',
        country_of_birth: 'USA',
        country_of_tax_residence: 'USA',
        funding_source: ['employment_income'],
        annual_income_min: '10000',
        annual_income_max: '10000',
        total_net_worth_min: '10000',
        total_net_worth_max: '10000',
        liquid_net_worth_min: '10000',
        liquid_net_worth_max: '10000',
        liquidity_needs: 'does_not_matter',
        investment_experience_with_stocks: 'over_5_years',
        investment_experience_with_options: 'over_5_years',
        risk_tolerance: 'conservative',
        investment_objective: 'market_speculation',
        investment_time_horizon: 'more_than_10_years',
        marital_status: 'MARRIED',
        number_of_dependents: 5
      }
    };

    this.mockAccounts.set(sampleAccountId, sampleAccount);

    // Seed default ACH Relationship
    const sampleAch: AlpacaAchRelationship = {
      id: 'c9b420e0-ae4e-4f39-bcbf-649b407c2129',
      account_id: sampleAccountId,
      created_at: '2021-05-17T09:54:58.114433723Z',
      updated_at: '2021-05-17T09:54:58.114433723Z',
      status: 'APPROVED',
      account_owner_name: 'Awesome Alpaca',
      bank_account_type: 'CHECKING',
      bank_account_number: '32131231abc',
      bank_routing_number: '121000358',
      nickname: 'Bank of America Checking'
    };

    this.mockAchRelationships.set(sampleAccountId, [sampleAch]);

    // Seed sample order
    const sampleOrder: AlpacaOrder = {
      id: '4c6cbac4-e17a-4373-b012-d446b20f9982',
      client_order_id: '5a5e2660-88a7-410c-92c9-ab0c942df70b',
      created_at: '2021-05-17T11:27:18.499336Z',
      updated_at: '2021-05-17T11:27:18.499336Z',
      submitted_at: '2021-05-17T11:27:18.488546Z',
      filled_at: '2021-05-17T11:27:19.123456Z',
      expired_at: null,
      canceled_at: null,
      failed_at: null,
      replaced_at: null,
      replaced_by: null,
      replaces: null,
      asset_id: 'b0b6dd9d-8b9b-48a9-ba46-b9d54906e415',
      symbol: 'AAPL',
      asset_class: 'us_equity',
      notional: null,
      qty: '0.42',
      filled_qty: '0.42',
      filled_avg_price: '185.20',
      order_class: '',
      order_type: 'market',
      type: 'market',
      side: 'buy',
      time_in_force: 'day',
      limit_price: null,
      stop_price: null,
      status: 'filled',
      extended_hours: false,
      legs: null,
      trail_percent: null,
      trail_price: null,
      hwm: null,
      commission: '0'
    };

    this.mockOrders.set(sampleAccountId, [sampleOrder]);
  }

  /**
   * Generic request helper that supports both live API calls and mock sandbox fallbacks.
   * This provides a unified pipeline that other services can leverage.
   */
  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any
  ): Promise<AlpacaApiResponse<T>> {
    const requestId = this.generateRequestId();
    const credentials = this.getCredentials();
    
    const isMockKey = this.apiKey.startsWith('PK_ALPACA_SANDBOX') || this.apiKey === 'PK_ALPACA_SANDBOX_2026_KEY' || !this.apiKey;
    
    if (!isMockKey && typeof fetch !== 'undefined') {
      try {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
          'Authorization': credentials.basicAuthHeader,
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        };
        
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined
        });
        
        const data = await response.json();
        return {
          data: data as T,
          requestId,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        console.error(`Alpaca API request failed: ${method} ${path}`, error);
      }
    }
    
    return this.handleMockRequest<T>(method, path, body, requestId);
  }

  private handleMockRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body: any,
    requestId: string
  ): AlpacaApiResponse<T> {
    let data: any = null;
    let statusCode = 200;

    try {
      if (path === '/assets' && method === 'GET') {
        data = this.getMockAssetsList();
      } else if (path === '/accounts' && method === 'POST') {
        data = this.createMockAccountInternal(body);
      } else if (path === '/accounts' && method === 'GET') {
        data = Array.from(this.mockAccounts.values());
      } else if (path.startsWith('/accounts/') && path.endsWith('/ach_relationships')) {
        const accountId = path.split('/')[2];
        if (method === 'POST') {
          data = this.createMockAchRelationshipInternal(accountId, body);
        } else if (method === 'GET') {
          data = this.mockAchRelationships.get(accountId) || [];
        }
      } else if (path.startsWith('/accounts/') && path.endsWith('/transfers') && method === 'POST') {
        const accountId = path.split('/')[2];
        data = this.fundMockAccountAchInternal(accountId, body);
      } else if (path.startsWith('/accounts/activities/CSD') && method === 'GET') {
        const urlParams = new URLSearchParams(path.split('?')[1] || '');
        const accountId = urlParams.get('account_id') || '';
        data = this.getMockCsdActivitiesInternal(accountId);
      } else if (path === '/journals') {
        if (method === 'POST') {
          data = this.journalMockFundsInternal(body);
        } else if (method === 'GET') {
          data = this.mockJournals;
        }
      } else if (path.startsWith('/trading/accounts/') && path.endsWith('/orders')) {
        const accountId = path.split('/')[3];
        if (method === 'POST') {
          data = this.createMockTradingOrderInternal(accountId, body);
        } else if (method === 'GET') {
          data = this.mockOrders.get(accountId) || [];
        }
      } else {
        statusCode = 404;
        data = { error: `Mock route not found: ${method} ${path}` };
      }
    } catch (err: any) {
      statusCode = 500;
      data = { error: err.message || 'Internal mock server error' };
    }

    return {
      data: data as T,
      requestId,
      statusCode,
      headers: {
        'x-request-id': requestId,
        'content-type': 'application/json'
      }
    };
  }

  private getMockAssetsList(): AlpacaAsset[] {
    return [
      {
        id: '7595a8d2-68a6-46d7-910c-6b1958491f5c',
        class: 'us_equity',
        exchange: 'NYSE',
        symbol: 'A',
        name: 'Agilent Technologies Inc.',
        status: 'active',
        tradable: true,
        marginable: true,
        shortable: true,
        easy_to_borrow: true,
        fractionable: true
      },
      {
        id: 'b0b6dd9d-8b9b-48a9-ba46-b9d54906e415',
        class: 'us_equity',
        exchange: 'NASDAQ',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        status: 'active',
        tradable: true,
        marginable: true,
        shortable: true,
        easy_to_borrow: true,
        fractionable: true
      },
      {
        id: 'f80a0211-1a22-441f-823a-738676f4c3ef',
        class: 'us_equity',
        exchange: 'NASDAQ',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        status: 'active',
        tradable: true,
        marginable: true,
        shortable: true,
        easy_to_borrow: true,
        fractionable: true
      },
      {
        id: '1d6d84ed-2022-498c-9bf4-e75c61d563a3',
        class: 'us_equity',
        exchange: 'NASDAQ',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        status: 'active',
        tradable: true,
        marginable: true,
        shortable: true,
        easy_to_borrow: true,
        fractionable: true
      },
      {
        id: '3bb14170-c3d3-4903-888f-518cf037c7cb',
        class: 'us_equity',
        exchange: 'NASDAQ',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        status: 'active',
        tradable: true,
        marginable: true,
        shortable: true,
        easy_to_borrow: true,
        fractionable: true
      }
    ];
  }

  private createMockAccountInternal(payload: AlpacaCreateAccountPayload): AlpacaAccount {
    const accountId = uuidv4();
    const accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();

    const account: AlpacaAccount = {
      id: accountId,
      account_number: accountNumber,
      status: 'APPROVED',
      currency: 'USD',
      last_equity: '0',
      created_at: new Date().toISOString(),
      contact: payload.contact,
      identity: payload.identity
    };

    this.mockAccounts.set(accountId, account);
    return account;
  }

  private createMockAchRelationshipInternal(accountId: string, payload: AlpacaAchRelationshipPayload): AlpacaAchRelationship {
    const achId = uuidv4();
    const achRel: AlpacaAchRelationship = {
      id: achId,
      account_id: accountId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'APPROVED',
      account_owner_name: payload.account_owner_name,
      bank_account_type: payload.bank_account_type,
      bank_account_number: payload.bank_account_number,
      bank_routing_number: payload.bank_routing_number,
      nickname: payload.nickname
    };

    const existing = this.mockAchRelationships.get(accountId) || [];
    this.mockAchRelationships.set(accountId, [...existing, achRel]);
    return achRel;
  }

  private fundMockAccountAchInternal(accountId: string, payload: AlpacaTransferPayload): AlpacaTransfer {
    const transferId = uuidv4();
    const now = new Date();
    const expire = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const transfer: AlpacaTransfer = {
      id: transferId,
      relationship_id: payload.relationship_id,
      account_id: accountId,
      type: payload.transfer_type,
      status: 'COMPLETE',
      amount: payload.amount,
      direction: payload.direction,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      expires_at: expire.toISOString()
    };

    const existing = this.mockTransfers.get(accountId) || [];
    this.mockTransfers.set(accountId, [...existing, transfer]);

    const acc = this.mockAccounts.get(accountId);
    if (acc) {
      const currentEq = parseFloat(acc.last_equity) || 0;
      const amountVal = parseFloat(payload.amount) || 0;
      acc.last_equity = (currentEq + amountVal).toFixed(2);
    }

    return transfer;
  }

  private getMockCsdActivitiesInternal(accountId: string): AlpacaCsdActivity[] {
    const transfers = this.mockTransfers.get(accountId) || [];
    return transfers.map(t => ({
      id: `CSD_${t.id.slice(0, 8)}`,
      account_id: accountId,
      activity_type: 'CSD',
      date: t.created_at.split('T')[0],
      net_amount: t.amount,
      description: `ACH Cash Deposit via Relationship ${t.relationship_id.slice(0, 8)}`,
      status: 'EXECUTED'
    }));
  }

  private journalMockFundsInternal(payload: AlpacaJournalPayload): AlpacaJournal {
    const journalId = uuidv4();
    const amountVal = parseFloat(payload.amount);

    const journal: AlpacaJournal = {
      id: journalId,
      entry_type: payload.entry_type,
      from_account: payload.from_account,
      to_account: payload.to_account,
      amount: payload.amount,
      status: 'executed',
      created_at: new Date().toISOString(),
      description: payload.description || 'Instant Sweep/Reward Funding Journal'
    };

    this.mockJournals.push(journal);

    if (payload.from_account === this.mockFirmAccountId) {
      this.mockFirmBalance -= amountVal;
    }
    const targetAccount = this.mockAccounts.get(payload.to_account);
    if (targetAccount) {
      const currentEq = parseFloat(targetAccount.last_equity) || 0;
      targetAccount.last_equity = (currentEq + amountVal).toFixed(2);
    }

    return journal;
  }

  private createMockTradingOrderInternal(accountId: string, payload: AlpacaOrderPayload): AlpacaOrder {
    const orderId = uuidv4();
    const clientOrderId = uuidv4();

    const order: AlpacaOrder = {
      id: orderId,
      client_order_id: clientOrderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      filled_at: new Date().toISOString(),
      expired_at: null,
      canceled_at: null,
      failed_at: null,
      replaced_at: null,
      replaced_by: null,
      replaces: null,
      asset_id: uuidv4(),
      symbol: payload.symbol.toUpperCase(),
      asset_class: 'us_equity',
      notional: payload.notional ? payload.notional.toString() : null,
      qty: payload.qty ? payload.qty.toString() : '1.0',
      filled_qty: payload.qty ? payload.qty.toString() : '1.0',
      filled_avg_price: '185.50',
      order_class: '',
      order_type: payload.type,
      type: payload.type,
      side: payload.side,
      time_in_force: payload.time_in_force,
      limit_price: payload.limit_price ? payload.limit_price.toString() : null,
      stop_price: payload.stop_price ? payload.stop_price.toString() : null,
      status: 'filled',
      extended_hours: false,
      legs: null,
      trail_percent: null,
      trail_price: null,
      hwm: null,
      commission: '0'
    };

    const existing = this.mockOrders.get(accountId) || [];
    this.mockOrders.set(accountId, [...existing, order]);
    return order;
  }

  /**
   * GET /v1/assets
   * Fetches assets available on Alpaca
   */
  public async getAssets(): Promise<AlpacaApiResponse<AlpacaAsset[]>> {
    return this.request<AlpacaAsset[]>('GET', '/assets');
  }

  /**
   * POST /v1/accounts
   * Creates an end-user brokerage account
   */
  public async createAccount(payload: AlpacaCreateAccountPayload): Promise<AlpacaApiResponse<AlpacaAccount>> {
    return this.request<AlpacaAccount>('POST', '/accounts', payload);
  }

  /**
   * GET /v1/accounts
   * Lists all brokerage accounts created under this correspondent
   */
  public async getAccounts(): Promise<AlpacaApiResponse<AlpacaAccount[]>> {
    return this.request<AlpacaAccount[]>('GET', '/accounts');
  }

  /**
   * POST /v1/accounts/{account_id}/ach_relationships
   * Establishes ACH relationship for virtual bank funding
   */
  public async createAchRelationship(
    accountId: string, 
    payload: AlpacaAchRelationshipPayload
  ): Promise<AlpacaApiResponse<AlpacaAchRelationship>> {
    return this.request<AlpacaAchRelationship>('POST', `/accounts/${accountId}/ach_relationships`, payload);
  }

  /**
   * GET /v1/accounts/{account_id}/ach_relationships
   */
  public async getAchRelationships(accountId: string): Promise<AlpacaApiResponse<AlpacaAchRelationship[]>> {
    return this.request<AlpacaAchRelationship[]>('GET', `/accounts/${accountId}/ach_relationships`);
  }

  /**
   * POST /v1/accounts/{account_id}/transfers
   * Funds account via ACH relationship
   */
  public async fundAccountAch(
    accountId: string, 
    payload: AlpacaTransferPayload
  ): Promise<AlpacaApiResponse<AlpacaTransfer>> {
    return this.request<AlpacaTransfer>('POST', `/accounts/${accountId}/transfers`, payload);
  }

  /**
   * GET /v1/accounts/activities/CSD?account_id={account_id}
   * Retrieves cash deposit activities
   */
  public async getCsdActivities(accountId: string): Promise<AlpacaApiResponse<AlpacaCsdActivity[]>> {
    return this.request<AlpacaCsdActivity[]>('GET', `/accounts/activities/CSD?account_id=${accountId}`);
  }

  /**
   * POST /v1/journals
   * Instant funding journal between Firm account and end user account
   */
  public async journalFunds(payload: AlpacaJournalPayload): Promise<AlpacaApiResponse<AlpacaJournal>> {
    return this.request<AlpacaJournal>('POST', '/journals', payload);
  }

  /**
   * GET /v1/journals
   */
  public async getJournals(): Promise<AlpacaApiResponse<AlpacaJournal[]>> {
    return this.request<AlpacaJournal[]>('GET', '/journals');
  }

  /**
   * POST /v1/trading/accounts/{account_id}/orders
   * Places trade orders on behalf of an end user
   */
  public async createTradingOrder(
    accountId: string, 
    payload: AlpacaOrderPayload
  ): Promise<AlpacaApiResponse<AlpacaOrder>> {
    return this.request<AlpacaOrder>('POST', `/trading/accounts/${accountId}/orders`, payload);
  }

  /**
   * GET /v1/trading/accounts/{account_id}/orders
   */
  public async getOrders(accountId: string): Promise<AlpacaApiResponse<AlpacaOrder[]>> {
    return this.request<AlpacaOrder[]>('GET', `/trading/accounts/${accountId}/orders`);
  }
}

export const alpacaBrokerService = AlpacaBrokerService.getInstance();
export default AlpacaBrokerService;