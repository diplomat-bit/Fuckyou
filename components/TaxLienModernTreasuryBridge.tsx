

// --- CONSOLIDATED FROM: ./components/bridges/TaxLienModernTreasuryBridge.tsx ---

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Building, 
  Gavel, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Layers, 
  MapPin, 
  Clock,
  HelpCircle,
  Link2,
  GitMerge,
  Activity,
  Search,
  CreditCard,
  Globe,
  Home,
  Database
} from 'lucide-react';

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface TaxLien {
  id: string;
  parcelNumber: string;
  address: string;
  county: string;
  state: string;
  assessedValue: number;
  lienAmount: number;
  interestRate: number; // Annual interest rate (e.g., 18%)
  auctionDate: string;
  status: 'Open' | 'Bidding' | 'Won' | 'Settled' | 'Redeemed';
  governmentApiEndpoint: string;
}

export interface LedgerAccount {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  pendingBalance: number;
  currency: string;
}

export interface LedgerTransaction {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'posted' | 'archived';
  postedAt: string;
  entries: {
    ledgerAccountId: string;
    direction: 'credit' | 'debit';
    amount: number;
  }[];
}

export interface AppFileNode {
  path: string;
  name: string;
  type: 'bridge' | 'tax-lien' | 'core';
  description: string;
  status: 'Active' | 'Connected' | 'Standby';
}

// ==========================================
// Mock Initial Data
// ==========================================

const initialTaxLien: TaxLien = {
  id: "lien-90812-FL",
  parcelNumber: "20-22-31-000-0010-0",
  address: "1402 Whispering Pines Dr, Orlando, FL 32801",
  county: "Orange County",
  state: "FL",
  assessedValue: 345000,
  lienAmount: 8450.25,
  interestRate: 18.0,
  auctionDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
  status: 'Open',
  governmentApiEndpoint: "https://api.orangecounty.fl.gov/taxcollector/v1/liens/20-22-31-000-0010-0"
};

const initialLedgerAccounts: Record<string, LedgerAccount> = {
  buyerCash: {
    id: "la_buyer_cash_001",
    name: "Buyer Operating Cash (Modern Treasury)",
    type: "asset",
    balance: 150000.00,
    pendingBalance: 150000.00,
    currency: "USD"
  },
  escrowLien: {
    id: "la_escrow_lien_002",
    name: "Tax Lien Escrow Holding Account",
    type: "liability",
    balance: 0.00,
    pendingBalance: 0.00,
    currency: "USD"
  },
  countyTaxCollector: {
    id: "la_county_collector_003",
    name: "Orange County Tax Collector Settlement Account",
    type: "liability",
    balance: 0.00,
    pendingBalance: 0.00,
    currency: "USD"
  }
};

const okoAppFiles: AppFileNode[] = [
  {
    path: "components/bridges/TaxLienModernTreasuryBridge.tsx",
    name: "Tax Lien Modern Treasury Bridge",
    type: "bridge",
    description: "Bridges government tax lien auctions with real-time double-entry ledger accounts for instant programmatic acquisition.",
    status: "Active"
  },
  {
    path: "components/tax-liens/TaxLienAuctions.tsx",
    name: "Tax Lien Auctions",
    type: "tax-lien",
    description: "Allows browsing of active county tax lien certificates. Directly feeds winning bids into this Modern Treasury settlement bridge.",
    status: "Connected"
  },
  {
    path: "components/tax-liens/ForeclosureTracker.tsx",
    name: "Foreclosure Tracker",
    type: "tax-lien",
    description: "Monitors redemption periods. If a tax lien is not redeemed within the statutory period, triggers foreclosure tracking and title transfer.",
    status: "Connected"
  },
  {
    path: "components/bridges/CitiAlpacaBridgeView.tsx",
    name: "Citi-Alpaca Bridge",
    type: "bridge",
    description: "Bridges institutional Citi cash management accounts with Alpaca brokerage accounts for automated treasury deployment.",
    status: "Standby"
  },
  {
    path: "components/bridges/PlaidAlpacaBridgeView.tsx",
    name: "Plaid-Alpaca Bridge",
    type: "bridge",
    description: "Enables retail investors to link external bank accounts via Plaid to fund Alpaca trading accounts.",
    status: "Standby"
  },
  {
    path: "components/bridges/RealEstateAlpacaBridge.tsx",
    name: "Real Estate Alpaca Bridge",
    type: "bridge",
    description: "Bridges fractionalized real estate assets with Alpaca brokerage portfolios for liquid trading.",
    status: "Standby"
  },
  {
    path: "components/bridges/StripeAlpacaBridgeView.tsx",
    name: "Stripe-Alpaca Bridge",
    type: "bridge",
    description: "Bridges Stripe merchant processing payouts directly into Alpaca investment accounts.",
    status: "Standby"
  },
  {
    path: "components/bridges/SovereignMarketTakeoverDashboard.tsx",
    name: "Sovereign Market Takeover",
    type: "bridge",
    description: "High-level sovereign wealth fund dashboard orchestrating macro-level acquisitions across all bridges.",
    status: "Standby"
  }
];

export default function TaxLienModernTreasuryBridge() {
  // State Management
  const [lien, setLien] = useState<TaxLien>(initialTaxLien);
  const [accounts, setAccounts] = useState<Record<string, LedgerAccount>>(initialLedgerAccounts);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  
  const [bidAmount, setBidAmount] = useState<number>(initialTaxLien.lienAmount);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [isSyncingGov, setIsSyncingGov] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'gov-api' | 'oko-registry'>('overview');
  const [selectedRegistryFile, setSelectedRegistryFile] = useState<AppFileNode>(okoAppFiles[0]);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Simulate Government API Sync
  const handleSyncGovernmentRegistry = async () => {
    setIsSyncingGov(true);
    setNotification({ type: 'info', message: "Querying Orange County Tax Collector API..." });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSyncingGov(false);
    setNotification({ 
      type: 'success', 
      message: "Government Registry Synced. Parcel status verified. No competing superior liens found." 
    });
  };

  // Simulate Modern Treasury Ledger Bid Lock (Pending Transaction)
  const handlePlaceBidAndLockFunds = async () => {
    if (bidAmount < lien.lienAmount) {
      setNotification({ type: 'error', message: `Bid amount must be at least the outstanding lien amount of ${formatCurrency(lien.lienAmount)}` });
      return;
    }

    if (accounts.buyerCash.balance < bidAmount) {
      setNotification({ type: 'error', message: "Insufficient funds in Modern Treasury Ledger Account." });
      return;
    }

    setIsSubmitting(true);
    setNotification({ type: 'info', message: "Initiating Modern Treasury Ledger Transaction: Locking bid funds in Escrow..." });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update Ledger Accounts (Simulate Pending State)
    setAccounts(prev => {
      const updated = { ...prev };
      // Buyer Cash pending decreases
      updated.buyerCash = {
        ...updated.buyerCash,
        pendingBalance: updated.buyerCash.balance - bidAmount
      };
      // Escrow pending increases
      updated.escrowLien = {
        ...updated.escrowLien,
        pendingBalance: updated.escrowLien.balance + bidAmount
      };
      return updated;
    });

    // Create Ledger Transaction
    const newTx: LedgerTransaction = {
      id: `lt_tx_${Math.random().toString(36).substr(2, 9)}`,
      description: `Bid Lock: Parcel ${lien.parcelNumber} - Orange County Tax Lien`,
      amount: bidAmount,
      status: 'pending',
      postedAt: new Date().toISOString(),
      entries: [
        { ledgerAccountId: accounts.buyerCash.id, direction: 'debit', amount: bidAmount },
        { ledgerAccountId: accounts.escrowLien.id, direction: 'credit', amount: bidAmount }
      ]
    };

    setTransactions(prev => [newTx, ...prev]);
    setLien(prev => ({ ...prev, status: 'Bidding' }));
    setIsSubmitting(false);
    setNotification({ 
      type: 'success', 
      message: `Bid of ${formatCurrency(bidAmount)} placed. Funds locked in Modern Treasury Escrow Ledger Account.` 
    });
  };

  // Simulate Instant Settlement (Post Ledger Transaction & Pay County)
  const handleInstantSettlement = async () => {
    if (lien.status !== 'Bidding') {
      setNotification({ type: 'error', message: "You must place a bid and lock funds before settling." });
      return;
    }

    setIsSettling(true);
    setNotification({ type: 'info', message: "Executing instant settlement: Posting ledger entries and dispatching FedNow/ACH to County..." });

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Find the pending transaction to post
    const pendingTxIndex = transactions.findIndex(t => t.status === 'pending');
    let finalBidAmount = bidAmount;
    
    if (pendingTxIndex !== -1) {
      setTransactions(prev => {
        const updated = [...prev];
        updated[pendingTxIndex] = {
          ...updated[pendingTxIndex],
          status: 'posted',
          postedAt: new Date().toISOString()
        };
        return updated;
      });
    }

    // Create Settlement Ledger Transaction (Escrow -> County Tax Collector)
    const settlementTx: LedgerTransaction = {
      id: `lt_settle_${Math.random().toString(36).substr(2, 9)}`,
      description: `Instant Settlement: Orange County Tax Collector Parcel ${lien.parcelNumber}`,
      amount: finalBidAmount,
      status: 'posted',
      postedAt: new Date().toISOString(),
      entries: [
        { ledgerAccountId: accounts.escrowLien.id, direction: 'debit', amount: finalBidAmount },
        { ledgerAccountId: accounts.countyTaxCollector.id, direction: 'credit', amount: finalBidAmount }
      ]
    };

    // Update Ledger Accounts (Simulate Posted State)
    setAccounts(prev => {
      const updated = { ...prev };
      // Buyer Cash actual balance decreases
      updated.buyerCash = {
        ...updated.buyerCash,
        balance: updated.buyerCash.balance - finalBidAmount
      };
      // Escrow balances clear out
      updated.escrowLien = {
        ...updated.escrowLien,
        balance: 0,
        pendingBalance: 0
      };
      // County Tax Collector balance increases
      updated.countyTaxCollector = {
        ...updated.countyTaxCollector,
        balance: updated.countyTaxCollector.balance + finalBidAmount,
        pendingBalance: updated.countyTaxCollector.pendingBalance + finalBidAmount
      };
      return updated;
    });

    setTransactions(prev => [settlementTx, ...prev]);
    setLien(prev => ({ ...prev, status: 'Settled' }));
    setIsSettling(false);
    setNotification({ 
      type: 'success', 
      message: `Lien Settled Instantly! Modern Treasury Ledger updated. FedNow payment dispatched to Orange County Tax Collector.` 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase">
            <Layers className="w-4 h-4" />
            <span>Modern Treasury Bridge</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Tax Lien Instant Settlement Console</h1>
          <p className="text-slate-400 text-sm mt-1">
            Bridge government tax lien auctions with real-time double-entry ledger accounts for instant programmatic acquisition.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncGovernmentRegistry}
            disabled={isSyncingGov}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingGov ? 'animate-spin' : ''}`} />
            Sync County API
          </button>
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Modern Treasury Connected
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            notification.type === 'success' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' :
            notification.type === 'error' ? 'bg-rose-950/50 border-rose-800 text-rose-300' :
            'bg-blue-950/50 border-blue-800 text-blue-300'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold text-sm">{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'System Update'}</p>
              <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Tax Lien Details & Gov API (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Lien Asset Overview
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'ledger' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Modern Treasury Ledger Accounts
            </button>
            <button 
              onClick={() => setActiveTab('gov-api')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'gov-api' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Government API Payload
            </button>
            <button 
              onClick={() => setActiveTab('oko-registry')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === 'oko-registry' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Oko App Registry ({okoAppFiles.length})
            </button>
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Property & Lien Card */}
              <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
                  <div>
                    <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      Tax Lien Certificate
                    </span>
                    <h2 className="text-2xl font-bold mt-2 flex items-center gap-2">
                      <Building className="text-slate-400 w-6 h-6" />
                      {lien.address}
                    </h2>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {lien.county}, {lien.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      lien.status === 'Open' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                      lien.status === 'Bidding' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}>
                      Status: {lien.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5">Parcel ID: {lien.parcelNumber}</p>
                  </div>
                </div>

                {/* Financial Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Assessed Property Value</p>
                    <p className="text-xl font-bold text-slate-200 mt-1">{formatCurrency(lien.assessedValue)}</p>
                    <p className="text-xs text-emerald-400 mt-0.5">LTV Ratio: {((lien.lienAmount / lien.assessedValue) * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Outstanding Tax Lien</p>
                    <p className="text-xl font-bold text-rose-400 mt-1">{formatCurrency(lien.lienAmount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Principal + Penalties</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Max Interest Rate (ROI)</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {lien.interestRate}%
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">State Mandated Cap</p>
                  </div>
                </div>

                {/* Auction Details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-slate-400 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Auction Date: <strong className="text-slate-300">{lien.auctionDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-slate-500" />
                    <span>Bidding Method: <strong className="text-slate-300">Premium Bid / Bid-Down Interest</strong></span>
                  </div>
                </div>
              </div>

              {/* Bid & Settlement Action Panel */}
              <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Gavel className="text-indigo-400 w-5 h-5" />
                  Bidding & Settlement Console
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Step 1: Bid & Lock */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 1: Lock Funds</span>
                        <span className="text-xs text-slate-500">Modern Treasury Ledger</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">
                        Place your bid. Modern Treasury will instantly create a pending ledger transaction, locking the funds in escrow to guarantee settlement.
                      </p>
                      
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Your Bid Amount (USD)</label>
                      <div className="relative mb-4">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                        <input 
                          type="number" 
                          value={bidAmount}
                          onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                          disabled={lien.status !== 'Open'}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-8 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceBidAndLockFunds}
                      disabled={isSubmitting || lien.status !== 'Open'}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Locking Funds...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Place Bid & Lock Funds
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 2: Instant Settlement */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2: Instant Settlement</span>
                        <span className="text-xs text-slate-500">FedNow / ACH / Wire</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">
                        Upon winning the auction, execute instant settlement. This posts the ledger transaction and triggers a real-time payment to the county tax collector.
                      </p>
                      
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Settlement Amount:</span>
                          <span className="font-semibold text-slate-200">{formatCurrency(bidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Recipient:</span>
                          <span className="font-semibold text-slate-200">Orange County Tax Collector</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleInstantSettlement}
                      disabled={isSettling || lien.status !== 'Bidding'}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-emerald-600"
                    >
                      {isSettling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Settling Lien...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          Settle Lien Instantly
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Ledger Accounts */}
          {activeTab === 'ledger' && (
            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Modern Treasury Ledger Accounts</h3>
                <p className="text-slate-400 text-xs">
                  Real-time double-entry ledger representation of your bidding capital and county settlement accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(accounts).map((acc) => (
                  <div key={acc.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{acc.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{acc.id}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 mb-3">{acc.name}</h4>
                    
                    <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Posted Balance:</span>
                        <span className="font-bold text-slate-200">{formatCurrency(acc.balance)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Pending Balance:</span>
                        <span className="font-bold text-amber-400">{formatCurrency(acc.pendingBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Why use Modern Treasury Ledgers for Tax Liens?</p>
                  <p>
                    Government tax lien auctions require guaranteed funds. By utilizing Modern Treasury's double-entry ledger system, we can lock bidding capital in an escrow ledger account instantly. This prevents double-spending and allows us to bid on thousands of properties programmatically across multiple counties simultaneously.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Gov API */}
          {activeTab === 'gov-api' && (
            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Government API Integration</h3>
                <p className="text-slate-400 text-xs">
                  Simulated live payload from the county tax collector's registry API.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto space-y-1">
                <p>{`{`}</p>
                <p className="pl-4">{`"parcel_id": "${lien.parcelNumber}",`}</p>
                <p className="pl-4">{`"county": "${lien.county}",`}</p>
                <p className="pl-4">{`"state": "${lien.state}",`}</p>
                <p className="pl-4">{`"assessed_value": ${lien.assessedValue},`}</p>
                <p className="pl-4">{`"lien_details": {`}</p>
                <p className="pl-8">{`"certificate_number": "FL-2024-88912",`}</p>
                <p className="pl-8">{`"delinquent_tax_year": 2023,`}</p>
                <p className="pl-8">{`"face_amount": ${lien.lienAmount},`}</p>
                <p className="pl-8">{`"accrued_interest_rate": ${lien.interestRate}`}</p>
                <p className="pl-4">{`},`}</p>
                <p className="pl-4">{`"auction_status": "${lien.status === 'Settled' ? 'CLOSED_PAID' : 'ACTIVE_AUCTION'}",`}</p>
                <p className="pl-4">{`"api_endpoint": "${lien.governmentApiEndpoint}"`}</p>
                <p>{`}`}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Connected to Orange County Tax Collector API Gateway</span>
              </div>
            </div>
          )}

          {/* Tab Content: Oko App Registry */}
          {activeTab === 'oko-registry' && (
            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Oko App Registry & Bridges</h3>
                <p className="text-slate-400 text-xs">
                  Explore the interconnected modules, bridges, and tax-lien files integrated within the Oko-main ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* File List */}
                <div className="md:col-span-5 space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {okoAppFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedRegistryFile(file)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        selectedRegistryFile.path === file.path
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                          : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{file.path}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        file.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        file.status === 'Connected' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {file.status}
                      </span>
                    </button>
                  ))}
                </div>

                {/* File Details & Integration Flow */}
                <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                      {selectedRegistryFile.type === 'bridge' ? <Link2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      <span>{selectedRegistryFile.type} Module</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-200 mb-1">{selectedRegistryFile.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mb-4 break-all">{selectedRegistryFile.path}</p>
                    
                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                      {selectedRegistryFile.description}
                    </p>

                    <div className="border-t border-slate-800/80 pt-4 space-y-3">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Integration Status</h5>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                          <Database className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Data Sync Pipeline</span>
                            <span className="text-emerald-400 font-semibold">Operational</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
                    <span>Oko-main Ecosystem</span>
                    <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                      <GitMerge className="w-3.5 h-3.5" />
                      Fully Integrated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Ledger Transactions Log (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-full min-h-[450px]">
            <div className="mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="text-indigo-400 w-5 h-5" />
                Ledger Transactions
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Double-entry transaction history for this asset acquisition.
              </p>
            </div>

            {/* Transaction List */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-1">
              {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                  <DollarSign className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No transactions recorded yet</p>
                  <p className="text-xs text-slate-500 mt-1">Place a bid to initiate the Modern Treasury ledger flow.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.id}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tx.status === 'posted' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    {/* Double Entry Breakdown */}
                    <div className="space-y-1.5 border-t border-slate-800/60 pt-2.5">
                      {tx.entries.map((entry, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-400 truncate max-w-[180px]">
                            {entry.ledgerAccountId === accounts.buyerCash.id ? 'Buyer Cash' : 
                             entry.ledgerAccountId === accounts.escrowLien.id ? 'Escrow Holding' : 'County Collector'}
                          </span>
                          <span className={entry.direction === 'credit' ? 'text-emerald-400' : 'text-rose-400'}>
                            {entry.direction === 'credit' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(tx.postedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Stats Footer */}
            <div className="border-t border-slate-800 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Capital Allocated:</span>
                <span className="font-bold text-slate-200">{formatCurrency(accounts.buyerCash.balance)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Liens Acquired:</span>
                <span className="font-bold text-emerald-400">{lien.status === 'Settled' ? '1' : '0'}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}