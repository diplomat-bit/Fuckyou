const BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

// --- Utility Types ---

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
  token?: string;
}

// --- Generated Interfaces (A representative sample of key entities) ---

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  identityVerified: boolean;
  phone?: string;
  dateOfBirth?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  gamificationLevel?: number;
  aiPersona?: string;
  address: Record<string, any>;
  securityStatus: {
    twoFactorEnabled: boolean;
    biometricsEnrolled: boolean;
    lastLogin: string;
    lastLoginIp: string;
  };
  preferences: {
    notificationChannels: Record<string, any>;
    preferredLanguage?: string;
    theme?: string;
    aiInteractionMode?: string;
    dataSharingConsent?: boolean;
    transactionGrouping?: string;
  };
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AccountSummary {
  id: string;
  name: string;
  institutionName: string;
  mask: string;
  type: 'depository' | 'investment' | 'credit';
  subtype: string;
  currency: string;
  currentBalance: number;
  availableBalance: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  aiCategoryConfidence: number;
  description: string;
  amount: number;
  currency: string;
  date: string;
  postedDate?: string;
  carbonFootprint?: number;
  paymentChannel: string;
  disputeStatus: 'none' | 'pending' | 'resolved';
  merchantDetails?: Record<string, any>;
  location?: Record<string, any>;
  tags?: string[];
  notes?: string;
}

export interface PaginatedResponse<T> {
  limit: number;
  offset: number;
  total: number;
  data: T[];
  nextOffset?: number;
}

// --- Core Fetcher ---

async function fetcher<T>(options: RequestOptions): Promise<T> {
  const url = new URL(options.path, BASE_URL);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(url.toString(), {
    method: options.method,
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`API Error ${response.status}: ${errorBody.message || 'Unknown error'}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

// --- Client Class: Quantum Core 3.0 ---

/**
 * Client for the JAMESBURVELOCALLAGHANIII (Quantum Core 3.0) API.
 * This client handles authentication and provides access to all core financial,
 * AI, corporate, and Web3 endpoints.
 */
export class QuantumCoreClient {
  private token: string | null = null;

  /**
   * Sets the authentication token for subsequent authenticated requests.
   * @param token The JWT access token.
   */
  public setToken(token: string | null) {
    this.token = token;
  }

  // --- 1. Users & Auth Endpoints ---

  /**
   * POST /users/register: Register a New User Account
   */
  public registerUser(data: UserRegisterRequest): Promise<UserProfile> {
    return fetcher<UserProfile>({
      method: 'POST',
      path: '/users/register',
      body: data,
    });
  }

  /**
   * POST /users/login: User Login and Session Creation
   */
  public async login(email: string, password: string): Promise<UserLoginResponse> {
    const response = await fetcher<UserLoginResponse>({
      method: 'POST',
      path: '/users/login',
      body: { email, password },
    });
    this.setToken(response.accessToken);
    return response;
  }

  /**
   * GET /users/me: Retrieve Comprehensive Current User Profile
   */
  public getMyProfile(): Promise<UserProfile> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<UserProfile>({
      method: 'GET',
      path: '/users/me',
      token: this.token,
    });
  }

  // --- 2. Accounts Endpoints ---

  /**
   * GET /accounts/me: List Linked Financial Accounts
   */
  public getMyAccounts(limit: number = 20, offset: number = 0): Promise<PaginatedResponse<AccountSummary>> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<PaginatedResponse<AccountSummary>>({
      method: 'GET',
      path: '/accounts/me',
      query: { limit, offset },
      token: this.token,
    });
  }

  /**
   * GET /accounts/{accountId}/details: Get Detailed Account Analytics & Forecasts
   */
  public getAccountDetails(accountId: string): Promise<AccountSummary & { projectedCashFlow: Record<string, any> }> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<AccountSummary & { projectedCashFlow: Record<string, any> }>({
      method: 'GET',
      path: `/accounts/${accountId}/details`,
      token: this.token,
    });
  }

  // --- 3. Transactions Endpoints ---

  /**
   * GET /transactions: List & Filter Transactions with Advanced Options
   */
  public listTransactions(params: {
    limit?: number;
    offset?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    searchQuery?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<PaginatedResponse<Transaction>>({
      method: 'GET',
      path: '/transactions',
      query: params,
      token: this.token,
    });
  }

  /**
   * PUT /transactions/{transactionId}/categorize: Manually Categorize or Recategorize a Transaction
   */
  public categorizeTransaction(transactionId: string, category: string, notes?: string, applyToFuture?: boolean): Promise<Transaction> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<Transaction>({
      method: 'PUT',
      path: `/transactions/${transactionId}/categorize`,
      body: { category, notes, applyToFuture },
      token: this.token,
    });
  }

  // --- 4. AI Advisor Endpoints ---

  /**
   * POST /ai/advisor/chat: Send a Message to the Quantum AI Advisor
   */
  public chatWithAI(message: string, sessionId?: string): Promise<{ text: string, sessionId: string, proactiveInsights: any[] }> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<{ text: string, sessionId: string, proactiveInsights: any[] }>({
      method: 'POST',
      path: '/ai/advisor/chat',
      body: { message, sessionId },
      token: this.token,
    });
  }

  /**
   * POST /ai/oracle/simulate: Run a 'What-If' Financial Simulation (Standard)
   */
  public runStandardSimulation(prompt: string, parameters?: Record<string, any>): Promise<Record<string, any>> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<Record<string, any>>({
      method: 'POST',
      path: '/ai/oracle/simulate',
      body: { prompt, parameters },
      token: this.token,
    });
  }

  // --- 5. Corporate Endpoints (Abbreviated) ---

  /**
   * GET /corporate/anomalies: List AI-Detected Financial Anomalies
   */
  public listAnomalies(params: {
    limit?: number;
    offset?: number;
    status?: string;
    severity?: string;
  }): Promise<PaginatedResponse<Record<string, any>>> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<PaginatedResponse<Record<string, any>>>({
      method: 'GET',
      path: '/corporate/anomalies',
      query: params,
      token: this.token,
    });
  }

  // --- 6. Web3 Endpoints ---

  /**
   * GET /web3/wallets: List Connected Crypto Wallets
   */
  public listConnectedWallets(limit: number = 20, offset: number = 0): Promise<PaginatedResponse<Record<string, any>>> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<PaginatedResponse<Record<string, any>>>({
      method: 'GET',
      path: '/web3/wallets',
      query: { limit, offset },
      token: this.token,
    });
  }

  /**
   * GET /web3/nfts: Retrieve User's NFT Collection
   */
  public getNFTCollection(limit: number = 20, offset: number = 0): Promise<PaginatedResponse<Record<string, any>>> {
    if (!this.token) throw new Error('Authentication required.');
    return fetcher<PaginatedResponse<Record<string, any>>>({
      method: 'GET',
      path: '/web3/nfts',
      query: { limit, offset },
      token: this.token,
    });
  }
}

export default QuantumCoreClient;