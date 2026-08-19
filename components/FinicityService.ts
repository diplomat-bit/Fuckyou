

// --- CONSOLIDATED FROM: ./services/FinicityService.ts ---

export interface FinicityConfig {
  partnerId: string;
  partnerSecret: string;
  appKey: string;
  baseUrl?: string;
}

export interface FinicityCustomer {
  id: string;
  username: string;
  createdDate: string;
  type?: 'testing' | 'active';
}

export interface ConnectUrlOptions {
  type?: 'aggregation' | 'ach' | 'verification' | 'lite' | 'fix';
  redirectUri?: string;
  webhook?: string;
  webhookContentType?: string;
  experience?: string;
  institutionId?: string;
  institutionLoginId?: string;
}

export interface FinicityAccount {
  id: string;
  number: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  status: string;
  customerId: string;
  institutionId: string;
  institutionLoginId: string;
  aggregationStatusCode: number;
  aggregationSuccessDate?: number;
  aggregationAttemptDate?: number;
  currency?: string;
}

export interface FinicityTransaction {
  id: string;
  amount: number;
  postedDate: number;
  transactionDate?: number;
  description: string;
  memo?: string;
  status: 'active' | 'pending';
  category?: string;
  accountId: string;
  customerId: string;
}

export interface FinicityInstitution {
  id: string;
  name: string;
  transgressionType?: string;
  urlHomeApp?: string;
  urlLogonApp?: string;
  oauthEnabled: boolean;
  state?: string;
}

export class FinicityService {
  private partnerId: string;
  private partnerSecret: string;
  private appKey: string;
  private baseUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config?: FinicityConfig) {
    this.partnerId = config?.partnerId || 
      process.env.REACT_APP_FINICITY_PARTNER_ID || 
      process.env.FINICITY_PARTNER_ID || 
      '';
    this.partnerSecret = config?.partnerSecret || 
      process.env.REACT_APP_FINICITY_PARTNER_SECRET || 
      process.env.FINICITY_PARTNER_SECRET || 
      '';
    this.appKey = config?.appKey || 
      process.env.REACT_APP_FINICITY_APP_KEY || 
      process.env.FINICITY_APP_KEY || 
      '';
    this.baseUrl = config?.baseUrl || 
      process.env.REACT_APP_FINICITY_BASE_URL || 
      process.env.FINICITY_BASE_URL || 
      'https://api.finicity.com';
  }

  /**
   * Authenticates with Finicity and caches the App Token.
   * Finicity tokens are valid for 2 hours. We cache it for 1 hour and 50 minutes.
   */
  public async authenticate(): Promise<string> {
    if (!this.partnerId || !this.partnerSecret || !this.appKey) {
      throw new Error('Finicity credentials are not fully configured. Please check your environment variables.');
    }

    const url = `${this.baseUrl}/aggregation/v2/partners/authentication`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Finicity-App-Key': this.appKey,
      },
      body: JSON.stringify({
        partnerId: this.partnerId,
        partnerSecret: this.partnerSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Finicity authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { token: string };
    this.cachedToken = data.token;
    // Cache token for 1 hour and 50 minutes (6600000 ms)
    this.tokenExpiry = Date.now() + 110 * 60 * 1000;
    return data.token;
  }

  /**
   * Retrieves a valid cached token or requests a new one if expired.
   */
  private async getValidToken(): Promise<string> {
    if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }
    return this.authenticate();
  }

  /**
   * Generic request wrapper that injects required Finicity headers.
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getValidToken();
    const url = `${this.baseUrl}${path}`;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Finicity-App-Key': this.appKey,
      'Finicity-App-Token': token,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Finicity API error [${response.status}] on ${path}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Creates a new customer record in Finicity.
   * Use 'testing' for sandbox testing and 'active' for production.
   */
  public async createCustomer(
    username: string,
    type: 'testing' | 'active' = 'testing'
  ): Promise<FinicityCustomer> {
    const path = type === 'testing'
      ? '/aggregation/v2/customers/testing'
      : '/aggregation/v2/customers/active';

    const result = await this.request<FinicityCustomer>(path, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });

    return {
      ...result,
      type,
    };
  }

  /**
   * Deletes a customer record from Finicity.
   */
  public async deleteCustomer(customerId: string): Promise<void> {
    const token = await this.getValidToken();
    const url = `${this.baseUrl}/aggregation/v1/customers/${customerId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Finicity-App-Key': this.appKey,
        'Finicity-App-Token': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Finicity Delete Customer error [${response.status}]: ${errorText}`);
    }
  }

  /**
   * Generates a Finicity Connect URL for account permissioning.
   */
  public async generateConnectUrl(
    customerId: string,
    options: ConnectUrlOptions = {}
  ): Promise<{ link: string }> {
    const payload = {
      partnerId: this.partnerId,
      customerId,
      type: options.type || 'aggregation',
      redirectUri: options.redirectUri,
      webhook: options.webhook,
      webhookContentType: options.webhookContentType || 'application/json',
      experience: options.experience,
      institutionId: options.institutionId,
      institutionLoginId: options.institutionLoginId,
    };

    // Remove undefined fields
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );

    return this.request<{ link: string }>('/connect/v2/generate', {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
    });
  }

  /**
   * Retrieves all accounts associated with a given customer.
   */
  public async getCustomerAccounts(customerId: string): Promise<FinicityAccount[]> {
    const response = await this.request<{ accounts: FinicityAccount[] }>(
      `/aggregation/v1/customers/${customerId}/accounts`
    );
    return response.accounts || [];
  }

  /**
   * Refreshes account and transaction data for all accounts associated with the customer.
   */
  public async refreshCustomerAccounts(customerId: string): Promise<FinicityAccount[]> {
    const response = await this.request<{ accounts: FinicityAccount[] }>(
      `/aggregation/v1/customers/${customerId}/accounts`,
      {
        method: 'POST',
      }
    );
    return response.accounts || [];
  }

  /**
   * Retrieves bank statements in PDF format for a specific customer account.
   * Index 1 is the most recent statement, 2 is the previous month, etc. (up to 24).
   */
  public async getCustomerAccountStatement(
    customerId: string,
    accountId: string,
    index: number = 1
  ): Promise<Blob> {
    const token = await this.getValidToken();
    const url = `${this.baseUrl}/aggregation/v1/customers/${customerId}/accounts/${accountId}/statement?index=${index}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Finicity-App-Key': this.appKey,
        'Finicity-App-Token': token,
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Finicity Statement API error [${response.status}]: ${errorText}`);
    }

    return response.blob();
  }

  /**
   * Retrieves transaction history for a customer.
   * fromDate and toDate are Unix timestamps in seconds.
   */
  public async getCustomerTransactions(
    customerId: string,
    fromDate: number,
    toDate: number,
    limit: number = 25
  ): Promise<FinicityTransaction[]> {
    const response = await this.request<{ transactions: FinicityTransaction[] }>(
      `/aggregation/v3/customers/${customerId}/transactions?fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&includePending=true`
    );
    return response.transactions || [];
  }

  /**
   * Searches for financial institutions supported by Finicity.
   */
  public async getInstitutions(search: string, limit: number = 25): Promise<FinicityInstitution[]> {
    const response = await this.request<{ institutions: FinicityInstitution[] }>(
      `/institution/v2/institutions?search=${encodeURIComponent(search)}&limit=${limit}`
    );
    return response.institutions || [];
  }

  /**
   * Retrieves details of a specific financial institution.
   */
  public async getInstitutionDetails(institutionId: string): Promise<FinicityInstitution> {
    return this.request<FinicityInstitution>(
      `/institution/v2/institutions/${institutionId}`
    );
  }
}

export const finicityService = new FinicityService();