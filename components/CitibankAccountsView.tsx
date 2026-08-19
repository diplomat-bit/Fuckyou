
import React, { useState, useEffect, useContext } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { Building, ArrowRightLeft, Shield, Landmark, ExternalLink, Activity, Info, Lock } from 'lucide-react';

const CitibankAccountsView: React.FC = () => {
    const { deductCredits } = useContext(DataContext)!;
    const [isUnmasking, setIsUnmasking] = useState(false);

    const citiMockAccounts = [
        { id: 'citi_1', name: 'Citi Priority Checking', type: 'CHECKING', balance: 142500.50, available: 141000.00, currency: 'USD', status: 'ACTIVE' },
        { id: 'citi_2', name: 'Citi High Yield Savings', type: 'SAVINGS', balance: 2500000.00, available: 2500000.00, currency: 'USD', status: 'ACTIVE' },
        { id: 'citi_3', name: 'Global Commercial Line', type: 'CREDIT', balance: -450000.00, limit: 1000000.00, currency: 'USD', status: 'ACTIVE' }
    ];

    const handleUnmask = () => {
        if (deductCredits(1000)) {
            setIsUnmasking(true);
            setTimeout(() => setIsUnmasking(false), 5000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Citibank Core</h1>
                    <p className="text-blue-400 text-sm font-mono mt-1 tracking-widest uppercase">Secure Account Aggregation // Host-ID: CITI_US_PRIMARY</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleUnmask} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        {isUnmasking ? 'UNMASKED_ACTIVE' : 'Unmask PII (1000 SC)'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {citiMockAccounts.map(account => (
                        <Card key={account.id} className="relative overflow-hidden group border-blue-500/10 hover:border-blue-500/40 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building size={120} />
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-inner">
                                        <Landmark size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{account.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono flex items-center gap-2 mt-1">
                                            {account.type} // {isUnmasking ? '00492817264' : 'XXXX-XXXX-' + account.id.substring(5)}
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-[8px] font-bold border border-green-500/20">{account.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Book Balance</p>
                                    <p className={`text-4xl font-black font-mono tracking-tighter ${account.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                        ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all flex items-center gap-2">
                                        <ArrowRightLeft size={12} /> Ad-hoc Transfers
                                    </button>
                                    <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all flex items-center gap-2">
                                        <Activity size={12} /> Statements
                                    </button>
                                </div>
                                <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-gray-700 transition-all">
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card title="Security Manifest" className="bg-blue-950/5 border-blue-500/20">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-blue-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">OIDC Secure Link</p>
                                        <p className="text-[10px] text-gray-500 font-mono">TUNNEL: ESTABLISHED</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Info className="text-cyan-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">Protocol Version</p>
                                        <p className="text-[10px] text-gray-500 font-mono">OAUTH_2.1_CHALLENGE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Signal Diagnostics">
                         <div className="h-64 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-2 custom-scrollbar">
                            <p className="text-green-500">&gt; Authenticating with Citi Auth Gate Alpha...</p>
                            <p className="text-green-500">&gt; TLS 1.3 Asymmetric Handshake successful.</p>
                            <p>&gt; Requesting accounts summary (Scope: accounts_details)...</p>
                            <p>&gt; Received payload for 3 active items.</p>
                            <p className="text-blue-400">&gt; Sync complete. Signal strength: 98dbm (OPTIMAL).</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CitibankAccountsView;


// --- CONSOLIDATED FROM: CitibankAccountsView (1).tsx ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Mock Auth Hook (replace with actual implementation) ---
// This provides the necessary accessToken and uuid for API calls.
const useAuth = () => {
  return {
    accessToken: 'DUMMY_ACCESS_TOKEN', // Replace with a real token from your auth flow
    uuid: crypto.randomUUID(),
    clientId: process.env.REACT_APP_CLIENT_ID || 'YOUR_CLIENT_ID',
  };
};

// --- API Configuration ---
const API_BASE_URL = 'https://sandbox.apihub.citi.com/gcb//api';

// --- TypeScript Interfaces from Swagger Definition ---

export interface ErrorResponse {
  type: 'error' | 'warn' | 'invalid' | 'fatal';
  code: string;
  details?: string;
  location?: string;
  moreInfo?: string;
}

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
}

export interface AccountDetails {
  productName: string;
  displayAccountNumber: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  balanceType: 'ASSET' | 'LIABILITY';
  accountDescription?: string;
  accountNickname?: string;
  currentBalance?: number;
  availableBalance?: number;
}

export interface CreditCardAccountDetails extends AccountDetails {
  availableCredit?: number;
  creditLimit?: number;
  minimumDueAmount?: number;
  paymentDueDate?: string;
  lastStatementBalance?: number;
  lastStatementDate?: string;
}

export interface SavingsAccountDetails extends AccountDetails {
  maturityDate?: string;
  maturityTerm?: string;
}

export interface LoanAccountDetails extends AccountDetails {
  currentBalanceAmount?: number;
  creditAvailableAmount?: number;
  paymentDueAmount?: number;
  paymentDueDate?: string;
  autoPayFlag?: boolean;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

export interface LineOfCreditAccountDetails extends AccountDetails {
    creditAvailableAmount?: number;
    currentBalanceAmount?: number;
    paymentDueAmount?: number;
    lastPaymentAmount?: number;
}

export interface AccountGroupDetails {
  accountGroup: 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT';
  checkingAccountsDetails?: AccountDetails[];
  savingsAccountsDetails?: SavingsAccountDetails[];
  creditCardAccountsDetails?: CreditCardAccountDetails[];
  loanAccountsDetails?: LoanAccountDetails[];
  lineOfCreditAccountsDetails?: LineOfCreditAccountDetails[];
  // Brokerage and Retirement can be added here if needed
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
}

export interface AccountsGroupDetailsList {
  accountGroupDetails?: AccountGroupDetails[];
}


// --- API Client for Accounts ---
class AccountsAPI {
  private baseURL: string;
  private client_id: string;

  constructor(baseURL: string, client_id: string) {
    this.baseURL = baseURL;
    this.client_id = client_id;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    accessToken: string,
    uuid: string,
    body?: any,
    queryParams?: Record<string, any>
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      uuid: uuid,
      Accept: 'application/json',
      client_id: this.client_id,
      'Content-Type': 'application/json',
    };

    const url = new URL(`${this.baseURL}${path}`);
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined) {
          url.searchParams.append(key, queryParams[key]);
        }
      });
    }

    try {
      const response = await axios({
        method,
        url: url.toString(),
        headers,
        data: body,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(JSON.stringify(error.response.data));
      }
      console.error(`Network or unexpected error: ${error.message}`);
      throw error;
    }
  }

  public async getAccountDetails(
    accessToken: string,
    uuid: string
  ): Promise<AccountsGroupDetailsList> {
    const path = '/v2/accounts/details';
    return this.request<AccountsGroupDetailsList>('GET', path, accessToken, uuid);
  }
}

// --- Helper Components for Displaying Account Details ---

const formatCurrency = (amount: number | undefined, currencyCode: string | undefined) => {
  if (amount === undefined || currencyCode === undefined) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: '8px' }}>
    <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>{label}</p>
    <p style={{ margin: 0, color: '#333' }}>{value || 'N/A'}</p>
  </div>
);

const AccountCard: React.FC<{ account: AccountDetails }> = ({ account }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      {account.accountNickname || account.productName}
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <DetailItem label="Account Number" value={account.displayAccountNumber} />
      <DetailItem label="Status" value={account.accountStatus} />
      <DetailItem label="Current Balance" value={formatCurrency(account.currentBalance, account.currencyCode)} />
      <DetailItem label="Available Balance" value={formatCurrency(account.availableBalance, account.currencyCode)} />
    </div>
  </div>
);

const CreditCardAccountCard: React.FC<{ account: CreditCardAccountDetails }> = ({ account }) => (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      {account.accountNickname || account.productName}
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <DetailItem label="Card Number" value={account.displayAccountNumber} />
      <DetailItem label="Status" value={account.accountStatus} />
      <DetailItem label="Current Balance" value={formatCurrency(account.currentBalance, account.currencyCode)} />
      <DetailItem label="Available Credit" value={formatCurrency(account.availableCredit, account.currencyCode)} />
      <DetailItem label="Credit Limit" value={formatCurrency(account.creditLimit, account.currencyCode)} />
      <DetailItem label="Minimum Due" value={formatCurrency(account.minimumDueAmount, account.currencyCode)} />
      <DetailItem label="Payment Due Date" value={account.paymentDueDate} />
      <DetailItem label="Last Statement Balance" value={formatCurrency(account.lastStatementBalance, account.currencyCode)} />
    </div>
  </div>
);

// --- Main View Component ---

const CitibankAccountsView: React.FC = () => {
  const [accountsData, setAccountsData] = useState<AccountsGroupDetailsList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, uuid, clientId } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!accessToken || !uuid || !clientId) {
        setError("Authentication details are missing.");
        setLoading(false);
        return;
      }

      const api = new AccountsAPI(API_BASE_URL, clientId);
      setLoading(true);
      setError(null);

      try {
        const data = await api.getAccountDetails(accessToken, uuid);
        setAccountsData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [accessToken, uuid, clientId]);

  const renderAccountGroup = (group: AccountGroupDetails) => {
    let accountsToRender: React.ReactNode = null;
    let title = 'Unknown Account Group';

    switch (group.accountGroup) {
      case 'CHECKING':
        title = 'Checking Accounts';
        accountsToRender = group.checkingAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'SAVINGS':
        title = 'Savings Accounts';
        accountsToRender = group.savingsAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'CREDITCARD':
        title = 'Credit Card Accounts';
        accountsToRender = group.creditCardAccountsDetails?.map(acc => <CreditCardAccountCard key={acc.accountId} account={acc} />);
        break;
      case 'LOAN':
        title = 'Loan Accounts';
        accountsToRender = group.loanAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'LINEOFCREDIT':
        title = 'Line of Credit Accounts';
        accountsToRender = group.lineOfCreditAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      default:
        return null;
    }

    return (
      <div key={group.accountGroup} style={{ marginBottom: '24px', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0, color: '#003b71' }}>{title}</h2>
        {accountsToRender}
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading account details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px' }}>Error: {error}</div>;
  }

  if (!accountsData || !accountsData.accountGroupDetails || accountsData.accountGroupDetails.length === 0) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>No account information found.</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f0f2f5' }}>
      <h1 style={{ color: '#005eb8' }}>Your Citibank Accounts</h1>
      {accountsData.accountGroupDetails.map(renderAccountGroup)}
    </div>
  );
};

export default CitibankAccountsView;

// --- CONSOLIDATED FROM: CitibankAccountsView_1.tsx ---


import React, { useState, useEffect, useContext } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { Building, ArrowRightLeft, Shield, Landmark, ExternalLink, Activity, Info, Lock } from 'lucide-react';

const CitibankAccountsView: React.FC = () => {
    const { deductCredits } = useContext(DataContext)!;
    const [isUnmasking, setIsUnmasking] = useState(false);

    const citiMockAccounts = [
        { id: 'citi_1', name: 'Citi Priority Checking', type: 'CHECKING', balance: 142500.50, available: 141000.00, currency: 'USD', status: 'ACTIVE' },
        { id: 'citi_2', name: 'Citi High Yield Savings', type: 'SAVINGS', balance: 2500000.00, available: 2500000.00, currency: 'USD', status: 'ACTIVE' },
        { id: 'citi_3', name: 'Global Commercial Line', type: 'CREDIT', balance: -450000.00, limit: 1000000.00, currency: 'USD', status: 'ACTIVE' }
    ];

    const handleUnmask = () => {
        if (deductCredits(1000)) {
            setIsUnmasking(true);
            setTimeout(() => setIsUnmasking(false), 5000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Citibank Core</h1>
                    <p className="text-blue-400 text-sm font-mono mt-1 tracking-widest uppercase">Secure Account Aggregation // Host-ID: CITI_US_PRIMARY</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleUnmask} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        {isUnmasking ? 'UNMASKED_ACTIVE' : 'Unmask PII (1000 SC)'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {citiMockAccounts.map(account => (
                        <Card key={account.id} className="relative overflow-hidden group border-blue-500/10 hover:border-blue-500/40 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building size={120} />
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-inner">
                                        <Landmark size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{account.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono flex items-center gap-2 mt-1">
                                            {account.type} // {isUnmasking ? '00492817264' : 'XXXX-XXXX-' + account.id.substring(5)}
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-[8px] font-bold border border-green-500/20">{account.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Book Balance</p>
                                    <p className={`text-4xl font-black font-mono tracking-tighter ${account.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                        ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all flex items-center gap-2">
                                        <ArrowRightLeft size={12} /> Ad-hoc Transfers
                                    </button>
                                    <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all flex items-center gap-2">
                                        <Activity size={12} /> Statements
                                    </button>
                                </div>
                                <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-gray-700 transition-all">
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card title="Security Manifest" className="bg-blue-950/5 border-blue-500/20">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-blue-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">OIDC Secure Link</p>
                                        <p className="text-[10px] text-gray-500 font-mono">TUNNEL: ESTABLISHED</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Info className="text-cyan-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">Protocol Version</p>
                                        <p className="text-[10px] text-gray-500 font-mono">OAUTH_2.1_CHALLENGE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Signal Diagnostics">
                         <div className="h-64 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-2 custom-scrollbar">
                            <p className="text-green-500">&gt; Authenticating with Citi Auth Gate Alpha...</p>
                            <p className="text-green-500">&gt; TLS 1.3 Asymmetric Handshake successful.</p>
                            <p>&gt; Requesting accounts summary (Scope: accounts_details)...</p>
                            <p>&gt; Received payload for 3 active items.</p>
                            <p className="text-blue-400">&gt; Sync complete. Signal strength: 98dbm (OPTIMAL).</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CitibankAccountsView;


// --- CONSOLIDATED FROM: CitibankAccountsView (2).tsx ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Mock Auth Hook (replace with actual implementation) ---
// This provides the necessary accessToken and uuid for API calls.
const useAuth = () => {
  return {
    accessToken: 'DUMMY_ACCESS_TOKEN', // Replace with a real token from your auth flow
    uuid: crypto.randomUUID(),
    clientId: process.env.REACT_APP_CLIENT_ID || 'YOUR_CLIENT_ID',
  };
};

// --- API Configuration ---
const API_BASE_URL = 'https://sandbox.apihub.citi.com/gcb//api';

// --- TypeScript Interfaces from Swagger Definition ---

export interface ErrorResponse {
  type: 'error' | 'warn' | 'invalid' | 'fatal';
  code: string;
  details?: string;
  location?: string;
  moreInfo?: string;
}

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
}

export interface AccountDetails {
  productName: string;
  displayAccountNumber: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  balanceType: 'ASSET' | 'LIABILITY';
  accountDescription?: string;
  accountNickname?: string;
  currentBalance?: number;
  availableBalance?: number;
}

export interface CreditCardAccountDetails extends AccountDetails {
  availableCredit?: number;
  creditLimit?: number;
  minimumDueAmount?: number;
  paymentDueDate?: string;
  lastStatementBalance?: number;
  lastStatementDate?: string;
}

export interface SavingsAccountDetails extends AccountDetails {
  maturityDate?: string;
  maturityTerm?: string;
}

export interface LoanAccountDetails extends AccountDetails {
  currentBalanceAmount?: number;
  creditAvailableAmount?: number;
  paymentDueAmount?: number;
  paymentDueDate?: string;
  autoPayFlag?: boolean;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

export interface LineOfCreditAccountDetails extends AccountDetails {
    creditAvailableAmount?: number;
    currentBalanceAmount?: number;
    paymentDueAmount?: number;
    lastPaymentAmount?: number;
}

export interface AccountGroupDetails {
  accountGroup: 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT';
  checkingAccountsDetails?: AccountDetails[];
  savingsAccountsDetails?: SavingsAccountDetails[];
  creditCardAccountsDetails?: CreditCardAccountDetails[];
  loanAccountsDetails?: LoanAccountDetails[];
  lineOfCreditAccountsDetails?: LineOfCreditAccountDetails[];
  // Brokerage and Retirement can be added here if needed
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
}

export interface AccountsGroupDetailsList {
  accountGroupDetails?: AccountGroupDetails[];
}


// --- API Client for Accounts ---
export class AccountsAPI {
  private baseURL: string;
  private client_id: string;

  constructor(baseURL: string, client_id: string) {
    this.baseURL = baseURL;
    this.client_id = client_id;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    accessToken: string,
    uuid: string,
    body?: any,
    queryParams?: Record<string, any>
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      uuid: uuid,
      Accept: 'application/json',
      client_id: this.client_id,
      'Content-Type': 'application/json',
    };

    const url = new URL(`${this.baseURL}${path}`);
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined) {
          url.searchParams.append(key, queryParams[key]);
        }
      });
    }

    try {
      const response = await axios({
        method,
        url: url.toString(),
        headers,
        data: body,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(JSON.stringify(error.response.data));
      }
      console.error(`Network or unexpected error: ${error.message}`);
      throw error;
    }
  }

  public async getAccountDetails(
    accessToken: string,
    uuid: string
  ): Promise<AccountsGroupDetailsList> {
    const path = '/v2/accounts/details';
    return this.request<AccountsGroupDetailsList>('GET', path, accessToken, uuid);
  }
}

// --- Helper Components for Displaying Account Details ---

const formatCurrency = (amount: number | undefined, currencyCode: string | undefined) => {
  if (amount === undefined || currencyCode === undefined) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: '8px' }}>
    <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>{label}</p>
    <p style={{ margin: 0, color: '#333' }}>{value || 'N/A'}</p>
  </div>
);

const AccountCard: React.FC<{ account: AccountDetails }> = ({ account }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      {account.accountNickname || account.productName}
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <DetailItem label="Account Number" value={account.displayAccountNumber} />
      <DetailItem label="Status" value={account.accountStatus} />
      <DetailItem label="Current Balance" value={formatCurrency(account.currentBalance, account.currencyCode)} />
      <DetailItem label="Available Balance" value={formatCurrency(account.availableBalance, account.currencyCode)} />
    </div>
  </div>
);

const CreditCardAccountCard: React.FC<{ account: CreditCardAccountDetails }> = ({ account }) => (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      {account.accountNickname || account.productName}
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <DetailItem label="Card Number" value={account.displayAccountNumber} />
      <DetailItem label="Status" value={account.accountStatus} />
      <DetailItem label="Current Balance" value={formatCurrency(account.currentBalance, account.currencyCode)} />
      <DetailItem label="Available Credit" value={formatCurrency(account.availableCredit, account.currencyCode)} />
      <DetailItem label="Credit Limit" value={formatCurrency(account.creditLimit, account.currencyCode)} />
      <DetailItem label="Minimum Due" value={formatCurrency(account.minimumDueAmount, account.currencyCode)} />
      <DetailItem label="Payment Due Date" value={account.paymentDueDate} />
      <DetailItem label="Last Statement Balance" value={formatCurrency(account.lastStatementBalance, account.currencyCode)} />
    </div>
  </div>
);

// --- Main View Component ---

const CitibankAccountsView: React.FC = () => {
  const [accountsData, setAccountsData] = useState<AccountsGroupDetailsList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, uuid, clientId } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!accessToken || !uuid || !clientId) {
        setError("Authentication details are missing.");
        setLoading(false);
        return;
      }

      const api = new AccountsAPI(API_BASE_URL, clientId);
      setLoading(true);
      setError(null);

      try {
        const data = await api.getAccountDetails(accessToken, uuid);
        setAccountsData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [accessToken, uuid, clientId]);

  const renderAccountGroup = (group: AccountGroupDetails) => {
    let accountsToRender: React.ReactNode = null;
    let title = 'Unknown Account Group';

    switch (group.accountGroup) {
      case 'CHECKING':
        title = 'Checking Accounts';
        accountsToRender = group.checkingAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'SAVINGS':
        title = 'Savings Accounts';
        accountsToRender = group.savingsAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'CREDITCARD':
        title = 'Credit Card Accounts';
        accountsToRender = group.creditCardAccountsDetails?.map(acc => <CreditCardAccountCard key={acc.accountId} account={acc} />);
        break;
      case 'LOAN':
        title = 'Loan Accounts';
        accountsToRender = group.loanAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'LINEOFCREDIT':
        title = 'Line of Credit Accounts';
        accountsToRender = group.lineOfCreditAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      default:
        return null;
    }

    return (
      <div key={group.accountGroup} style={{ marginBottom: '24px', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0, color: '#003b71' }}>{title}</h2>
        {accountsToRender}
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading account details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px' }}>Error: {error}</div>;
  }

  if (!accountsData || !accountsData.accountGroupDetails || accountsData.accountGroupDetails.length === 0) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>No account information found.</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f0f2f5' }}>
      <h1 style={{ color: '#005eb8' }}>Your Citibank Accounts</h1>
      {accountsData.accountGroupDetails.map(renderAccountGroup)}
    </div>
  );
};

export default CitibankAccountsView;

// --- CONSOLIDATED FROM: CitibankAccountsView (2)_1.tsx ---

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Mock Auth Hook (replace with actual implementation) ---
// This provides the necessary accessToken and uuid for API calls.
const useAuth = () => {
  return {
    accessToken: 'DUMMY_ACCESS_TOKEN', // Replace with a real token from your auth flow
    uuid: crypto.randomUUID(),
    clientId: process.env.REACT_APP_CLIENT_ID || 'YOUR_CLIENT_ID',
  };
};

// --- API Configuration ---
const API_BASE_URL = 'https://sandbox.apihub.citi.com/gcb//api';

// --- TypeScript Interfaces from Swagger Definition ---

export interface ErrorResponse {
  type: 'error' | 'warn' | 'invalid' | 'fatal';
  code: string;
  details?: string;
  location?: string;
  moreInfo?: string;
}

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
}

export interface AccountDetails {
  productName: string;
  displayAccountNumber: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  balanceType: 'ASSET' | 'LIABILITY';
  accountDescription?: string;
  accountNickname?: string;
  currentBalance?: number;
  availableBalance?: number;
}

export interface CreditCardAccountDetails extends AccountDetails {
  availableCredit?: number;
  creditLimit?: number;
  minimumDueAmount?: number;
  paymentDueDate?: string;
  lastStatementBalance?: number;
  lastStatementDate?: string;
}

export interface SavingsAccountDetails extends AccountDetails {
  maturityDate?: string;
  maturityTerm?: string;
}

export interface LoanAccountDetails extends AccountDetails {
  currentBalanceAmount?: number;
  creditAvailableAmount?: number;
  paymentDueAmount?: number;
  paymentDueDate?: string;
  autoPayFlag?: boolean;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

export interface LineOfCreditAccountDetails extends AccountDetails {
    creditAvailableAmount?: number;
    currentBalanceAmount?: number;
    paymentDueAmount?: number;
    lastPaymentAmount?: number;
}

export interface AccountGroupDetails {
  accountGroup: 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT';
  checkingAccountsDetails?: AccountDetails[];
  savingsAccountsDetails?: SavingsAccountDetails[];
  creditCardAccountsDetails?: CreditCardAccountDetails[];
  loanAccountsDetails?: LoanAccountDetails[];
  lineOfCreditAccountsDetails?: LineOfCreditAccountDetails[];
  // Brokerage and Retirement can be added here if needed
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
}

export interface AccountsGroupDetailsList {
  accountGroupDetails?: AccountGroupDetails[];
}


// --- API Client for Accounts ---
export class AccountsAPI {
  private baseURL: string;
  private client_id: string;

  constructor(baseURL: string, client_id: string) {
    this.baseURL = baseURL;
    this.client_id = client_id;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    accessToken: string,
    uuid: string,
    body?: any,
    queryParams?: Record<string, any>
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      uuid: uuid,
      Accept: 'application/json',
      client_id: this.client_id,
      'Content-Type': 'application/json',
    };

    const url = new URL(`${this.baseURL}${path}`);
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined) {
          url.searchParams.append(key, queryParams[key]);
        }
      });
    }

    try {
      const response = await axios({
        method,
        url: url.toString(),
        headers,
        data: body,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(JSON.stringify(error.response.data));
      }
      console.error(`Network or unexpected error: ${error.message}`);
      throw error;
    }
  }

  public async getAccountDetails(
    accessToken: string,
    uuid: string
  ): Promise<AccountsGroupDetailsList> {
    const path = '/v2/accounts/details';
    return this.request<AccountsGroupDetailsList>('GET', path, accessToken, uuid);
  }
}

// --- Helper Components for Displaying Account Details ---

const formatCurrency = (amount: number | undefined, currencyCode: string | undefined) => {
  if (amount === undefined || currencyCode === undefined) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: '8px' }}>
    <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>{label}</p>
    <p style={{ margin: 0, color: '#333' }}>{value || 'N/A'}</p>
  </div>
);

const AccountCard: React.FC<{ account: AccountDetails }> = ({ account }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      {account.accountNickname || account.productName}
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <DetailItem label="Account Number" value={account.displayAccountNumber} />
      <DetailItem label="Status" value={account.accountStatus} />
      <DetailItem label="Current Balance" value={formatCurrency(account.currentBalance, account.currencyCode)} />
      <DetailItem label="Available Balance" value={formatCurrency(account.availableBalance, account.currencyCode)} />
    </div>
  </div>
);

const CreditCardAccountCard: React.FC<{ account: CreditCardAccountDetails }> = ({ account }) => (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      {account.accountNickname || account.productName}
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <DetailItem label="Card Number" value={account.displayAccountNumber} />
      <DetailItem label="Status" value={account.accountStatus} />
      <DetailItem label="Current Balance" value={formatCurrency(account.currentBalance, account.currencyCode)} />
      <DetailItem label="Available Credit" value={formatCurrency(account.availableCredit, account.currencyCode)} />
      <DetailItem label="Credit Limit" value={formatCurrency(account.creditLimit, account.currencyCode)} />
      <DetailItem label="Minimum Due" value={formatCurrency(account.minimumDueAmount, account.currencyCode)} />
      <DetailItem label="Payment Due Date" value={account.paymentDueDate} />
      <DetailItem label="Last Statement Balance" value={formatCurrency(account.lastStatementBalance, account.currencyCode)} />
    </div>
  </div>
);

// --- Main View Component ---

const CitibankAccountsView: React.FC = () => {
  const [accountsData, setAccountsData] = useState<AccountsGroupDetailsList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, uuid, clientId } = useAuth();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!accessToken || !uuid || !clientId) {
        setError("Authentication details are missing.");
        setLoading(false);
        return;
      }

      const api = new AccountsAPI(API_BASE_URL, clientId);
      setLoading(true);
      setError(null);

      try {
        const data = await api.getAccountDetails(accessToken, uuid);
        setAccountsData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [accessToken, uuid, clientId]);

  const renderAccountGroup = (group: AccountGroupDetails) => {
    let accountsToRender: React.ReactNode = null;
    let title = 'Unknown Account Group';

    switch (group.accountGroup) {
      case 'CHECKING':
        title = 'Checking Accounts';
        accountsToRender = group.checkingAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'SAVINGS':
        title = 'Savings Accounts';
        accountsToRender = group.savingsAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'CREDITCARD':
        title = 'Credit Card Accounts';
        accountsToRender = group.creditCardAccountsDetails?.map(acc => <CreditCardAccountCard key={acc.accountId} account={acc} />);
        break;
      case 'LOAN':
        title = 'Loan Accounts';
        accountsToRender = group.loanAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      case 'LINEOFCREDIT':
        title = 'Line of Credit Accounts';
        accountsToRender = group.lineOfCreditAccountsDetails?.map(acc => <AccountCard key={acc.accountId} account={acc} />);
        break;
      default:
        return null;
    }

    return (
      <div key={group.accountGroup} style={{ marginBottom: '24px', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0, color: '#003b71' }}>{title}</h2>
        {accountsToRender}
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading account details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px' }}>Error: {error}</div>;
  }

  if (!accountsData || !accountsData.accountGroupDetails || accountsData.accountGroupDetails.length === 0) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>No account information found.</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f0f2f5' }}>
      <h1 style={{ color: '#005eb8' }}>Your Citibank Accounts</h1>
      {accountsData.accountGroupDetails.map(renderAccountGroup)}
    </div>
  );
};

export default CitibankAccountsView;