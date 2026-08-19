

// --- CONSOLIDATED FROM: ./types/broker.ts ---

export interface BrokerAccount {
  id: string;
  clientId: string;
  accountNumber: string;
  accountType: 'MARGIN' | 'CASH' | 'IRA';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface BrokerOrder {
  id: string;
  accountId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  price?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  timestamp: string;
}

export interface BrokerTrade {
  id: string;
  orderId: string;
  accountId: string;
  symbol: string;
  quantity: number;
  price: number;
  commission: number;
  executionTime: string;
}

export interface BrokerPortfolio {
  accountId: string;
  holdings: {
    symbol: string;
    quantity: number;
    averageCost: number;
    marketValue: number;
  }[];
  totalValue: number;
  lastUpdated: string;
}

export interface ComplianceRecord {
  id: string;
  clientId: string;
  type: 'KYC' | 'AML' | 'TRADE_RESTRICTION';
  status: 'PASS' | 'FAIL' | 'PENDING_REVIEW';
  details: Record<string, any>;
  timestamp: string;
}

export interface BrokerClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  taxId: string;
  kycStatus: 'VERIFIED' | 'UNVERIFIED' | 'REJECTED';
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  createdAt: string;
}

export interface GeminiBrokerIntegration {
  model: 'gemini-1.5-pro' | 'gemini-1.5-flash';
  endpoint: string;
  lastSync: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}