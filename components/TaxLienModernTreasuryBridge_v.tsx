

// --- CONSOLIDATED FROM: ./components/bridges/TaxLienModernTreasuryBridge_v2.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
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
  parcelId: string;
  county: string;
  state: string;
  assessedValue: number;
  backTaxes: number;
  interestRate: number; // Maximum statutory rate
  currentBidRate: number; // Bid-down interest rate
  auctionDate: string;
  status: 'Open' | 'Bidding' | 'Won' | 'Settling' | 'Settled' | 'Redeemed';
  address: string;
  propertyType: 'Residential' | 'Commercial' | 'Agricultural' | 'Vacant Land';
  modernTreasuryLedgerId?: string;
}

export interface LedgerAccount {
  id: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  currency: string;
  routingNumber: string;
  accountNumberLast4: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  description: string;
  amount: number;
  direction: 'Debit' | 'Credit';
  fromAccount: string;
  toAccount: string;
  status: 'Pending' | 'Posted' | 'Failed';
  txHash: string;
}

export interface BridgeLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ledger';
  message: string;
  payload?: string;
}

// ==========================================
// Mock Initial Data
// ==========================================

const INITIAL_LIENS: TaxLien[] = [
  {
    id: 'lien-101',
    parcelId: '012-345-678-000',
    county: 'Miami-Dade',
    state: 'FL',
    assessedValue: 345000,
    backTaxes: 8450,
    interestRate: 18.0,
    currentBidRate: 12.5,
    auctionDate: '2025-06-15',
    status: 'Open',
    address: '1420 Ocean Dr, Miami Beach, FL 33139',
    propertyType: 'Residential',
    modernTreasuryLedgerId: 'acc_mt_001'
  },
  {
    id: 'lien-102',
    parcelId: '987-654-321-011',
    county: 'Maricopa',
    state: 'AZ',
    assessedValue: 520000,
    backTaxes: 14200,
    interestRate: 16.0,
    currentBidRate: 9.0,
    auctionDate: '2025-06-18',
    status: 'Bidding',
    address: '7420 E Camelback Rd, Scottsdale, AZ 85251',
    propertyType: 'Commercial',
    modernTreasuryLedgerId: 'acc_mt_002'
  },
  {
    id: 'lien-103',
    parcelId: '456-789-123-044',
    county: 'Harris',
    state: 'TX',
    assessedValue: 185000,
    backTaxes: 4120,
    interestRate: 25.0,
    currentBidRate: 18.0,
    auctionDate: '2025-06-20',
    status: 'Won',
    address: '1102 Westheimer Rd, Houston, TX 77006',
    propertyType: 'Residential',
    modernTreasuryLedgerId: 'acc_mt_003'
  },
  {
    id: 'lien-104',
    parcelId: '321-654-987-055',
    county: 'Cook',
    state: 'IL',
    assessedValue: 890000,
    backTaxes: 27500,
    interestRate: 12.0,
    currentBidRate: 12.0,
    auctionDate: '2025-06-22',
    status: 'Settling',
    address: '405 N Wabash Ave, Chicago, IL 60611',
    propertyType: 'Commercial',
    modernTreasuryLedgerId: 'acc_mt_004'
  },
  {
    id: 'lien-105',
    parcelId: '789-123-456-088',
    county: 'Fulton',
    state: 'GA',
    assessedValue: 290000,
    backTaxes: 6300,
    interestRate: 10.0,
    currentBidRate: 8.5,
    auctionDate: '2025-05-10',
    status: 'Settled',
    address: '820 Peachtree St NE, Atlanta, GA 30308',
    propertyType: 'Residential',
    modernTreasuryLedgerId: 'acc_mt_005'
  }
];

const INITIAL_LEDGER_ACCOUNTS: LedgerAccount[] = [
  {
    id: 'la-001',
    name: 'Sovereign Tax Lien Capital Fund',
    type: 'Asset',
    balance: 2450000.00,
    currency: 'USD',
    routingNumber: '021000021',
    accountNumberLast4: '8842'
  },
  {
    id: 'la-002',
    name: 'Modern Treasury Clearing Account',
    type: 'Asset',
    balance: 150000.00,
    currency: 'USD',
    routingNumber: '121000248',
    accountNumberLast4: '1109'
  },
  {
    id: 'la-003',
    name: 'Miami-Dade County Tax Collector',
    type: 'Liability',
    balance: 0.00,
    currency: 'USD',
    routingNumber: '061000104',
    accountNumberLast4: '4321'
  },
  {
    id: 'la-004',
    name: 'Maricopa County Treasurer',
    type: 'Liability',
    balance: 0.00,
    currency: 'USD',
    routingNumber: '122100024',
    accountNumberLast4: '9876'
  },
  {
    id: 'la-005',
    name: 'Harris County Tax Assessor',
    type: 'Liability',
    balance: 4120.00,
    currency: 'USD',
    routingNumber: '113000023',
    accountNumberLast4: '5543'
  }
];

const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'tx-901',
    timestamp: '2025-05-10 14:32:10',
    description: 'Settlement for Fulton County Parcel 789-123-456-088',
    amount: 6300.00,
    direction: 'Debit',
    fromAccount: 'Sovereign Tax Lien Capital Fund',
    toAccount: 'Fulton County Tax Collector',
    status: 'Posted',
    txHash: '0x7f8c9a2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'
  },
  {
    id: 'tx-902',
    timestamp: '2025-05-12 09:15:44',
    description: 'Pre-funding Modern Treasury Clearing Account',
    amount: 50000.00,
    direction: 'Credit',
    fromAccount: 'Sovereign Tax Lien Capital Fund',
    toAccount: 'Modern Treasury Clearing Account',
    status: 'Posted',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
  }
];

const INITIAL_LOGS: BridgeLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'info',
    message: 'Modern Treasury Bridge initialized successfully.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    type: 'success',
    message: 'Connected to Modern Treasury Ledger API v1. Sovereign Ledger Sync active.'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    type: 'ledger',
    message: 'Ledger Account "Sovereign Tax Lien Capital Fund" balance verified: $2,450,000.00'
  }
];

// ==========================================
// Main Component
// ==========================================

export default function TaxLienModernTreasuryBridge_v2() {
  // State Management
  const [liens, setLiens] = useState<TaxLien[]>(INITIAL_LIENS);
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>(INITIAL_LEDGER_ACCOUNTS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [logs, setLogs] = useState<BridgeLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<'auctions' | 'ledger' | 'calculator' | 'logs'>('auctions');
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Interactive Action States
  const [selectedLien, setSelectedLien] = useState<TaxLien | null>(null);
  const [bidRateInput, setBidRateInput] = useState<number>(10.0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculator States
  const [calcAssessedValue, setCalcAssessedValue] = useState(250000);
  const [calcBackTaxes, setCalcBackTaxes] = useState(5000);
  const [calcBidRate, setCalcBidRate] = useState(12);
  const [calcRedemptionMonths, setCalcRedemptionMonths] = useState(12);
  const [calcPenaltyRate, setCalcPenaltyRate] = useState(5); // Flat penalty rate in some states

  // Add Log Helper
  const addLog = (type: BridgeLog['type'], message: string, payload?: any) => {
    const newLog: BridgeLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      payload: payload ? JSON.stringify(payload, null, 2) : undefined
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Filtered Liens
  const filteredLiens = useMemo(() => {
    return liens.filter(lien => {
      const matchesSearch = lien.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lien.parcelId.includes(searchTerm) ||
                            lien.county.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = selectedState === 'All' || lien.state === selectedState;
      const matchesStatus = selectedStatus === 'All' || lien.status === selectedStatus;
      return matchesSearch && matchesState && matchesStatus;
    });
  }, [liens, searchTerm, selectedState, selectedStatus]);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalTracked = liens.length;
    const activeAuctions = liens.filter(l => l.status === 'Open' || l.status === 'Bidding').length;
    const pendingSettlements = liens.filter(l => l.status === 'Won' || l.status === 'Settling').length;
    const totalSettledAmount = liens
      .filter(l => l.status === 'Settled')
      .reduce((sum, l) => sum + l.backTaxes, 0);

    return {
      totalTracked,
      activeAuctions,
      pendingSettlements,
      totalSettledAmount
    };
  }, [liens]);

  // Place Bid Action
  const handlePlaceBid = (lien: TaxLien) => {
    if (bidRateInput <= 0 || bidRateInput > lien.interestRate) {
      alert(`Invalid bid rate. Must be between 0.01% and the statutory max of ${lien.interestRate}%`);
      return;
    }

    setIsProcessing(true);
    addLog('info', `Initiating bid-down process for Parcel ${lien.parcelId} at ${bidRateInput}%`);

    setTimeout(() => {
      setLiens(prev => prev.map(l => {
        if (l.id === lien.id) {
          return { ...l, status: 'Bidding', currentBidRate: bidRateInput };
        }
        return l;
      }));
      
      addLog('success', `Bid placed successfully via Modern Treasury API. Bid Rate: ${bidRateInput}%`, {
        parcelId: lien.parcelId,
        bidRate: bidRateInput,
        bidder: 'Sovereign Capital Fund LLC',
        timestamp: new Date().toISOString()
      });
      setIsProcessing(false);
      setSelectedLien(null);
    }, 1500);
  };

  // Settle Lien Action (Modern Treasury Ledger Settlement)
  const handleSettleLien = (lien: TaxLien) => {
    setIsProcessing(true);
    addLog('info', `Starting Modern Treasury Ledger Settlement for Parcel ${lien.parcelId}`);

    setTimeout(() => {
      // 1. Update Lien Status
      setLiens(prev => prev.map(l => {
        if (l.id === lien.id) {
          return { ...l, status: 'Settled' };
        }
        return l;
      }));

      // 2. Deduct from Sovereign Capital Fund, Add to County Account
      const amount = lien.backTaxes;
      setLedgerAccounts(prev => prev.map(acc => {
        if (acc.id === 'la-001') { // Sovereign Fund
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.name.toLowerCase().includes(lien.county.toLowerCase())) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      }));

      // 3. Create Ledger Entry
      const newEntry: LedgerEntry = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: `Settlement for ${lien.county} County Parcel ${lien.parcelId}`,
        amount: amount,
        direction: 'Debit',
        fromAccount: 'Sovereign Tax Lien Capital Fund',
        toAccount: `${lien.county} County Treasurer`,
        status: 'Posted',
        txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
      };

      setLedgerEntries(prev => [newEntry, ...prev]);

      addLog('ledger', `Ledger entry posted. Double-entry transaction verified.`, newEntry);
      addLog('success', `Modern Treasury payment order settled. Funds transferred to ${lien.county} County.`);
      
      setIsProcessing(false);
      setSelectedLien(null);
    }, 2000);
  };

  // Calculator Calculations
  const calculatorResults = useMemo(() => {
    const principal = calcBackTaxes;
    const annualRate = calcBidRate / 100;
    const timeYears = calcRedemptionMonths / 12;
    
    // Simple interest calculation for tax liens
    const interestEarned = principal * annualRate * timeYears;
    const penaltyEarned = principal * (calcPenaltyRate / 100);
    const totalRedemptionValue = principal + interestEarned + penaltyEarned;
    const netProfit = totalRedemptionValue - principal;
    const roi = (netProfit / principal) * 100;

    // LTV (Loan to Value)
    const ltv = (principal / calcAssessedValue) * 100;

    return {
      interestEarned,
      penaltyEarned,
      totalRedemptionValue,
      netProfit,
      roi,
      ltv
    };
  }, [calcAssessedValue, calcBackTaxes, calcBidRate, calcRedemptionMonths, calcPenaltyRate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <Gavel className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Tax Lien Modern Treasury Bridge
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Automated tax lien auction bidding, double-entry ledger settlement, and real-time county payment routing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Modern Treasury Live
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="h-3.5 w-3.5" />
            Sovereign Ledger Synced
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Tracked Liens</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-100">{stats.totalTracked}</h3>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-slate-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Auctions</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-400">{stats.activeAuctions}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Settlements</p>
            <h3 className="text-2xl font-bold mt-1 text-blue-400">{stats.pendingSettlements}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
            <GitMerge className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Settled Volume</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">
              ${stats.totalSettledAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('auctions')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'auctions'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Gavel className="h-4 w-4" />
          Auctions & Bidding
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Database className="h-4 w-4" />
          Ledger Settlement
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Yield Calculator
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Activity className="h-4 w-4" />
          Bridge Logs
          {logs.filter(l => l.type === 'error').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {logs.filter(l => l.type === 'error').length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: Main Tab Views */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: AUCTIONS & BIDDING */}
          {activeTab === 'auctions' && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-400" />
                  Available Tax Lien Auctions
                </h2>
                
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search parcel, county..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
                    />
                  </div>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 py-2 px-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All">All States</option>
                    <option value="FL">Florida</option>
                    <option value="AZ">Arizona</option>
                    <option value="TX">Texas</option>
                    <option value="IL">Illinois</option>
                    <option value="GA">Georgia</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 py-2 px-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Bidding">Bidding</option>
                    <option value="Won">Won</option>
                    <option value="Settling">Settling</option>
                    <option value="Settled">Settled</option>
                  </select>
                </div>
              </div>

              {/* Liens List */}
              <div className="space-y-4">
                {filteredLiens.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No tax liens found matching the criteria.</p>
                  </div>
                ) : (
                  filteredLiens.map((lien) => (
                    <div
                      key={lien.id}
                      className={`p-5 rounded-xl border transition-all ${
                        selectedLien?.id === lien.id
                          ? 'bg-slate-800/40 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {lien.state} - {lien.county} County
                            </span>
                            <span className="text-xs text-slate-500">Parcel: {lien.parcelId}</span>
                          </div>
                          <h4 className="text-base font-semibold text-slate-200 mt-1.5 flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {lien.address}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            lien.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            lien.status === 'Bidding' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            lien.status === 'Won' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            lien.status === 'Settling' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {lien.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-t border-b border-slate-800/60 my-3 text-sm">
                        <div>
                          <span className="text-slate-500 block text-xs">Assessed Value</span>
                          <span className="font-semibold text-slate-300">${lien.assessedValue.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Back Taxes Due</span>
                          <span className="font-semibold text-emerald-400">${lien.backTaxes.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Statutory Max Rate</span>
                          <span className="font-semibold text-slate-300">{lien.interestRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Current Bid Rate</span>
                          <span className="font-semibold text-amber-400">{lien.currentBidRate}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Auction Date: {lien.auctionDate}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLien(lien);
                              setBidRateInput(lien.currentBidRate - 0.5);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            Analyze & Bid
                          </button>
                          {(lien.status === 'Won' || lien.status === 'Settling') && (
                            <button
                              onClick={() => handleSettleLien(lien)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Settle Ledger
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LEDGER SETTLEMENT */}
          {activeTab === 'ledger' && (
            <div className="space-y-6">
              {/* Ledger Accounts Overview */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-400" />
                  Modern Treasury Double-Entry Ledger Accounts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ledgerAccounts.map((acc) => (
                    <div key={acc.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{acc.type}</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{acc.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Routing: {acc.routingNumber} | Account: *{acc.accountNumberLast4}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Balance</span>
                        <p className="text-base font-bold text-emerald-400 mt-0.5">
                          ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ledger Entries / Transactions */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <GitMerge className="h-5 w-5 text-emerald-400" />
                  Recent Ledger Entries
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">From / To</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                      {ledgerEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-900/20">
                          <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap">{entry.timestamp}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200">{entry.description}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">{entry.txHash}</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-300">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">From:</span> {entry.fromAccount}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-slate-500">To:</span> {entry.toAccount}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-emerald-400 whitespace-nowrap">
                            ${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: YIELD CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Tax Lien Yield & ROI Simulator
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Property Assessed Value: ${calcAssessedValue.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="50000"
                      max="1000000"
                      step="10000"
                      value={calcAssessedValue}
                      onChange={(e) => setCalcAssessedValue(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Back Taxes Due (Lien Principal): ${calcBackTaxes.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={calcBackTaxes}
                      onChange={(e) => setCalcBackTaxes(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Bid-Down Interest Rate: {calcBidRate}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      step="0.5"
                      value={calcBidRate}
                      onChange={(e) => setCalcBidRate(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Redemption Period: {calcRedemptionMonths} Months
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="36"
                      step="3"
                      value={calcRedemptionMonths}
                      onChange={(e) => setCalcRedemptionMonths(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      State Penalty Rate: {calcPenaltyRate}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={calcPenaltyRate}
                      onChange={(e) => setCalcPenaltyRate(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Projected Returns</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Lien Principal</span>
                        <span className="font-semibold text-slate-200">${calcBackTaxes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Interest Earned</span>
                        <span className="font-semibold text-emerald-400">+${calculatorResults.interestEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Penalty Earned</span>
                        <span className="font-semibold text-emerald-400">+${calculatorResults.penaltyEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                        <span className="text-slate-300 font-medium">Total Redemption Value</span>
                        <span className="font-bold text-slate-100">${calculatorResults.totalRedemptionValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-500 block">Projected ROI</span>
                      <span className="text-lg font-bold text-emerald-400">{calculatorResults.roi.toFixed(2)}%</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-500 block">LTV Ratio</span>
                      <span className="text-lg font-bold text-blue-400">{calculatorResults.ltv.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BRIDGE LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  Bridge Activity Logs
                </h2>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs h-[400px] overflow-y-auto space-y-3">
                {logs.length === 0 ? (
                  <div className="text-slate-600 text-center py-12">No logs recorded.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border-b border-slate-900 pb-2 last:border-0">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">[{log.timestamp.substring(11, 19)}]</span>
                        <span className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                          log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                          log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                          log.type === 'ledger' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-slate-300 flex-1">{log.message}</span>
                      </div>
                      {log.payload && (
                        <pre className="mt-2 p-2 bg-slate-900/50 rounded text-slate-400 overflow-x-auto max-w-full">
                          {log.payload}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Interactive Action Panel */}
        <div className="space-y-6">
          
          {/* Action Panel: Bid / Settlement Details */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5 text-emerald-400" />
              Bridge Action Panel
            </h3>

            {selectedLien ? (
              <div className="space-y-5">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-500">Selected Parcel</span>
                  <h4 className="font-bold text-slate-200 mt-0.5">{selectedLien.address}</h4>
                  <p className="text-xs text-slate-400 mt-1">County: {selectedLien.county}, {selectedLien.state}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                    <div>
                      <span className="text-slate-500 block">Back Taxes</span>
                      <span className="font-semibold text-emerald-400">${selectedLien.backTaxes.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Max Rate</span>
                      <span className="font-semibold text-slate-300">{selectedLien.interestRate}%</span>
                    </div>
                  </div>
                </div>

                {selectedLien.status === 'Open' || selectedLien.status === 'Bidding' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Your Bid Rate (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max={selectedLien.interestRate}
                          value={bidRateInput}
                          onChange={(e) => setBidRateInput(Number(e.target.value))}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-slate-400 text-sm">%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Bid-down interest rate. Lower bids increase chances of winning but reduce yield.
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlaceBid(selectedLien)}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Submitting Bid...
                        </>
                      ) : (
                        <>
                          <Gavel className="h-4 w-4" />
                          Submit Bid via Modern Treasury
                        </>
                      )}
                    </button>
                  </div>
                ) : selectedLien.status === 'Won' || selectedLien.status === 'Settling' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Lien Won - Settlement Required</p>
                        <p className="mt-0.5 text-slate-400">
                          Funds must be routed from the Sovereign Capital Fund to the county tax collector to secure the lien certificate.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSettleLien(selectedLien)}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Settling Ledger...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Settle Ledger Entry
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-center text-sm text-slate-400">
                    This lien is already settled. No further actions required.
                  </div>
                )}

                <button
                  onClick={() => setSelectedLien(null)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel Selection
                </button>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                <HelpCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm px-4">
                  Select a tax lien from the list to place a bid or initiate ledger settlement.
                </p>
              </div>
            )}
          </div>

          {/* Bridge Compliance & Security */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Compliance & Security
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-emerald-500/10 rounded text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">ISO 20022 Compliant</p>
                  <p className="text-slate-500 mt-0.5">All payment orders are formatted in pacs.008 XML schemas.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-emerald-500/10 rounded text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">ZKP Citizenship Proof</p>
                  <p className="text-slate-500 mt-0.5">Bidders verified via zero-knowledge proofs for state residency compliance.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-emerald-500/10 rounded text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Double-Entry Ledger Sync</p>
                  <p className="text-slate-500 mt-0.5">Real-time synchronization with the Sovereign Core Ledger.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}