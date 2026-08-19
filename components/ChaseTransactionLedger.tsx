

// --- CONSOLIDATED FROM: ./components/chase/ChaseTransactionLedger.tsx ---

import React, { useState, useMemo, useEffect } from 'react';

// --- CHASE ENTERPRISE CONSTANTS & TYPES ---
export type MerchantDefinedProductCode =
  | 'SAPPHIRE_RESERVE'
  | 'JPM_RESERVE'
  | 'SAPPHIRE_PREFERRED'
  | 'SAPPHIRE_NO_FEE'
  | 'INK_BUSINESS_PREFERRED'
  | 'INK_PLUS'
  | 'INK_BUSINESS_CASH'
  | 'INK_CASH'
  | 'INK_BUSINESS_UNLIMITED'
  | 'FREEDOM_UNLIMITED'
  | 'FREEDOM'
  | 'FREEDOM_STUDENT'
  | 'SLATE';

export type TransactionCategory =
  | 'Travel & Lodging'
  | 'Dining & Restaurants'
  | 'Technology & Software'
  | 'Office & Business Services'
  | 'Groceries & Gourmet'
  | 'Automotive & Transit'
  | 'Entertainment';

export interface Transaction {
  id: string;
  accountReferenceUuid: string;
  externalAccountIdentifier: string;
  date: string;
  merchantName: string;
  merchantCategoryCode: string;
  category: TransactionCategory;
  amount: number;
  currency: string;
  status: 'POSTED' | 'PENDING' | 'REDEEMED_WITH_POINTS';
  productCode: MerchantDefinedProductCode;
  cardLastFour: string;
  pwpEligible: boolean;
  pointsRedeemed?: number;
  creditApplied?: number;
  traceId?: string;
  logoInitial: string;
}

export interface CardRewardTier {
  name: string;
  pointValueCents: number; // e.g. 1.5 cents for Sapphire Reserve on travel, 1.0 standard
  multiplierBadge: string;
  colorHex: string;
}

const REWARD_TIER_MAP: Record<MerchantDefinedProductCode, CardRewardTier> = {
  SAPPHIRE_RESERVE: { name: 'Chase Sapphire Reserve®', pointValueCents: 1.5, multiplierBadge: '1.5x Value', colorHex: '#002B49' },
  JPM_RESERVE: { name: 'J.P. Morgan Reserve®', pointValueCents: 1.5, multiplierBadge: '1.5x Elite', colorHex: '#0B131F' },
  SAPPHIRE_PREFERRED: { name: 'Chase Sapphire Preferred®', pointValueCents: 1.25, multiplierBadge: '1.25x Value', colorHex: '#004F8A' },
  SAPPHIRE_NO_FEE: { name: 'Chase Sapphire®', pointValueCents: 1.0, multiplierBadge: '1.0x Base', colorHex: '#1C3F60' },
  INK_BUSINESS_PREFERRED: { name: 'Ink Business Preferred®', pointValueCents: 1.25, multiplierBadge: '1.25x Biz', colorHex: '#0E3A5F' },
  INK_PLUS: { name: 'Ink Plus® Business', pointValueCents: 1.0, multiplierBadge: '1.0x Biz', colorHex: '#1B365D' },
  INK_BUSINESS_CASH: { name: 'Ink Business Cash®', pointValueCents: 1.0, multiplierBadge: '1.0x Cash', colorHex: '#254E70' },
  INK_CASH: { name: 'Ink Cash® Card', pointValueCents: 1.0, multiplierBadge: '1.0x Cash', colorHex: '#2E5B82' },
  INK_BUSINESS_UNLIMITED: { name: 'Ink Business Unlimited®', pointValueCents: 1.0, multiplierBadge: '1.0x Cash', colorHex: '#1C496B' },
  FREEDOM_UNLIMITED: { name: 'Chase Freedom Unlimited®', pointValueCents: 1.0, multiplierBadge: '1.0x Cash', colorHex: '#00609C' },
  FREEDOM: { name: 'Chase Freedom®', pointValueCents: 1.0, multiplierBadge: '1.0x Flex', colorHex: '#0072CE' },
  FREEDOM_STUDENT: { name: 'Chase Freedom Student®', pointValueCents: 1.0, multiplierBadge: '1.0x Student', colorHex: '#41748D' },
  SLATE: { name: 'Chase Slate Edge®', pointValueCents: 1.0, multiplierBadge: '1.0x Base', colorHex: '#334155' },
};

// Generate deterministic Chase 128-bit hex trace ID
const generateTraceId = (): string => {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    accountReferenceUuid: '8f7b2c1e-4d9a-4c28-98e1-5e8a3b2f1101',
    externalAccountIdentifier: 'EXT-CHASE-0941824-CORP',
    date: '2025-03-28',
    merchantName: 'Delta Air Lines #006-2491',
    merchantCategoryCode: '3058',
    category: 'Travel & Lodging',
    amount: 849.50,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'SAPPHIRE_RESERVE',
    cardLastFour: '4092',
    pwpEligible: true,
    logoInitial: 'DL',
  },
  {
    id: 'tx-002',
    accountReferenceUuid: '8f7b2c1e-4d9a-4c28-98e1-5e8a3b2f1101',
    externalAccountIdentifier: 'EXT-CHASE-0941824-CORP',
    date: '2025-03-27',
    merchantName: 'The French Laundry - Yountville',
    merchantCategoryCode: '5812',
    category: 'Dining & Restaurants',
    amount: 1240.00,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'SAPPHIRE_RESERVE',
    cardLastFour: '4092',
    pwpEligible: true,
    logoInitial: 'FL',
  },
  {
    id: 'tx-003',
    accountReferenceUuid: '3e1a9b88-12fe-4309-a1b9-87c6d5e4f3a2',
    externalAccountIdentifier: 'EXT-CHASE-7731902-BIZ',
    date: '2025-03-26',
    merchantName: 'Amazon Web Services Cloud Ops',
    merchantCategoryCode: '7372',
    category: 'Technology & Software',
    amount: 4329.80,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'INK_BUSINESS_PREFERRED',
    cardLastFour: '8821',
    pwpEligible: true,
    logoInitial: 'AWS',
  },
  {
    id: 'tx-004',
    accountReferenceUuid: '8f7b2c1e-4d9a-4c28-98e1-5e8a3b2f1101',
    externalAccountIdentifier: 'EXT-CHASE-0941824-CORP',
    date: '2025-03-26',
    merchantName: 'Uber Black Concierge Trip',
    merchantCategoryCode: '4121',
    category: 'Automotive & Transit',
    amount: 88.40,
    currency: 'USD',
    status: 'REDEEMED_WITH_POINTS',
    productCode: 'SAPPHIRE_RESERVE',
    cardLastFour: '4092',
    pwpEligible: false,
    pointsRedeemed: 5893,
    creditApplied: 88.40,
    traceId: '8f3d1e90b82142e09153ca7104bfa392',
    logoInitial: 'UB',
  },
  {
    id: 'tx-005',
    accountReferenceUuid: '5b98f2aa-9901-4412-bd77-012984feea99',
    externalAccountIdentifier: 'EXT-CHASE-5519821-IND',
    date: '2025-03-25',
    merchantName: 'Apple Park Infinite Loop Store',
    merchantCategoryCode: '5732',
    category: 'Technology & Software',
    amount: 2899.00,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'FREEDOM_UNLIMITED',
    cardLastFour: '1099',
    pwpEligible: true,
    logoInitial: 'AP',
  },
  {
    id: 'tx-006',
    accountReferenceUuid: '8f7b2c1e-4d9a-4c28-98e1-5e8a3b2f1101',
    externalAccountIdentifier: 'EXT-CHASE-0941824-CORP',
    date: '2025-03-24',
    merchantName: 'Aman Tokyo Hotel & Suites',
    merchantCategoryCode: '7011',
    category: 'Travel & Lodging',
    amount: 3410.25,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'JPM_RESERVE',
    cardLastFour: '0001',
    pwpEligible: true,
    logoInitial: 'AM',
  },
  {
    id: 'tx-007',
    accountReferenceUuid: '3e1a9b88-12fe-4309-a1b9-87c6d5e4f3a2',
    externalAccountIdentifier: 'EXT-CHASE-7731902-BIZ',
    date: '2025-03-24',
    merchantName: 'Salesforce Enterprise License',
    merchantCategoryCode: '7379',
    category: 'Office & Business Services',
    amount: 1650.00,
    currency: 'USD',
    status: 'PENDING',
    productCode: 'INK_BUSINESS_PREFERRED',
    cardLastFour: '8821',
    pwpEligible: false,
    logoInitial: 'SF',
  },
  {
    id: 'tx-008',
    accountReferenceUuid: '8f7b2c1e-4d9a-4c28-98e1-5e8a3b2f1101',
    externalAccountIdentifier: 'EXT-CHASE-0941824-CORP',
    date: '2025-03-23',
    merchantName: 'Whole Foods Market flagship',
    merchantCategoryCode: '5411',
    category: 'Groceries & Gourmet',
    amount: 312.45,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'SAPPHIRE_PREFERRED',
    cardLastFour: '6618',
    pwpEligible: true,
    logoInitial: 'WF',
  },
  {
    id: 'tx-009',
    accountReferenceUuid: '5b98f2aa-9901-4412-bd77-012984feea99',
    externalAccountIdentifier: 'EXT-CHASE-5519821-IND',
    date: '2025-03-22',
    merchantName: 'Tesla Supercharging Stn #942',
    merchantCategoryCode: '5552',
    category: 'Automotive & Transit',
    amount: 42.18,
    currency: 'USD',
    status: 'POSTED',
    productCode: 'FREEDOM_UNLIMITED',
    cardLastFour: '1099',
    pwpEligible: true,
    logoInitial: 'TS',
  }
];

export const ChaseTransactionLedger: React.FC = () => {
  // Ledger State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState<'ALL' | 'ELIGIBLE_ONLY' | 'REDEEMED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'PENDING' | 'REDEEMED_WITH_POINTS'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Rewards Balance (Ultimate Rewards Pool)
  const [userPointsBalance, setUserPointsBalance] = useState<number>(485200);

  // Modal / Redemption Flow
  const [activeRedemptionTx, setActiveRedemptionTx] = useState<Transaction | null>(null);
  const [redemptionPercent, setRedemptionPercent] = useState<number>(100);
  const [isProcessingPwp, setIsProcessingPwp] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; traceId?: string; isError?: boolean } | null>(null);
  const [selectedTxDetails, setSelectedTxDetails] = useState<Transaction | null>(null);

  // Dismiss Toast auto
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.cardLastFour.includes(searchQuery) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
      const matchesProduct = selectedProduct === 'ALL' || tx.productCode === selectedProduct;
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;

      const matchesEligibility =
        eligibilityFilter === 'ALL' ||
        (eligibilityFilter === 'ELIGIBLE_ONLY' && tx.pwpEligible && tx.status === 'POSTED') ||
        (eligibilityFilter === 'REDEEMED' && tx.status === 'REDEEMED_WITH_POINTS');

      return matchesSearch && matchesCategory && matchesProduct && matchesStatus && matchesEligibility;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      } else {
        return sortAsc ? a.amount - b.amount : b.amount - a.amount;
      }
    });
  }, [transactions, searchQuery, selectedCategory, selectedProduct, statusFilter, eligibilityFilter, sortField, sortAsc]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalSpend = transactions.reduce((acc, curr) => acc + (curr.status !== 'PENDING' ? curr.amount : 0), 0);
    const eligibleAmount = transactions
      .filter((t) => t.pwpEligible && t.status === 'POSTED')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalRedeemedPoints = transactions.reduce((acc, curr) => acc + (curr.pointsRedeemed || 0), 0);
    const totalCreditSaved = transactions.reduce((acc, curr) => acc + (curr.creditApplied || 0), 0);

    return { totalSpend, eligibleAmount, totalRedeemedPoints, totalCreditSaved };
  }, [transactions]);

  // Calculation helpers for Pay with Points
  const calculatePointsRequired = (dollarAmount: number, productCode: MerchantDefinedProductCode, percent: number = 100) => {
    const tier = REWARD_TIER_MAP[productCode] || { pointValueCents: 1.0 };
    const targetDollars = (dollarAmount * (percent / 100));
    // Points = Dollars / (pointValueCents / 100) = Dollars * 100 / pointValueCents
    return Math.round((targetDollars * 100) / tier.pointValueCents);
  };

  const calculateCreditValue = (points: number, productCode: MerchantDefinedProductCode) => {
    const tier = REWARD_TIER_MAP[productCode] || { pointValueCents: 1.0 };
    return ((points * tier.pointValueCents) / 100).toFixed(2);
  };

  // Execution handler: Simulates CLPWPE & Pay With Points Order API Execution
  const handleExecuteRedemption = () => {
    if (!activeRedemptionTx) return;

    setIsProcessingPwp(true);
    const traceId = generateTraceId();
    const targetCredit = activeRedemptionTx.amount * (redemptionPercent / 100);
    const pointsToDeduct = calculatePointsRequired(activeRedemptionTx.amount, activeRedemptionTx.productCode, redemptionPercent);

    // Business Logic Safeguard: Check point balance
    if (pointsToDeduct > userPointsBalance) {
      setIsProcessingPwp(false);
      setToastMessage({
        title: 'Pay with Points Failed (409 Conflict)',
        desc: '601: Insufficient Rewards Balance to complete partial or full redemption.',
        isError: true,
      });
      return;
    }

    // Simulate API Network Roundtrip to api.chase.com/card/loyalty/earn-rewards/enrollment/v1
    setTimeout(() => {
      setUserPointsBalance((prev) => prev - pointsToDeduct);
      setTransactions((prev) =>
        prev.map((item) => {
          if (item.id === activeRedemptionTx.id) {
            return {
              ...item,
              status: 'REDEEMED_WITH_POINTS',
              pwpEligible: false,
              pointsRedeemed: pointsToDeduct,
              creditApplied: targetCredit,
              traceId: traceId,
            };
          }
          return item;
        })
      );

      setIsProcessingPwp(false);
      setActiveRedemptionTx(null);
      setToastMessage({
        title: 'Pay with Points Redemption Confirmed (200 OK)',
        desc: `Successfully applied $${targetCredit.toFixed(2)} statement credit to card ending in ${activeRedemptionTx.cardLastFour}. ${pointsToDeduct.toLocaleString()} Ultimate Rewards® points deducted.`,
        traceId: traceId,
      });
    }, 1200);
  };

  // Export Ledger to CSV
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Merchant', 'Category', 'Amount (USD)', 'Status', 'Card Product', 'Card Last 4', 'Points Redeemed', 'Trace ID'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      `"${t.merchantName}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.status,
      t.productCode,
      t.cardLastFour,
      t.pointsRedeemed || 0,
      t.traceId || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHASE_PWPE_TRANSACTION_LEDGER_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-[#07111E] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-[#0060f6] selection:text-white">
      {/* Top Banner / Corporate Navigation Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-4">
            {/* Chase Octagon Symbol SVG */}
            <div className="w-12 h-12 bg-[#0060f6] rounded-xl flex items-center justify-center shadow-lg shadow-[#0060f6]/30 p-2.5">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,12 88,12 100,50 88,88 12,88 0,50" fill="none" stroke="white" strokeWidth="6" />
                <rect x="22" y="22" width="56" height="56" fill="white" transform="rotate(45 50 50)" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                  CHASE <span className="text-[#0060f6]">ULTIMATE REWARDS®</span>
                </h1>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  CLPWPE v1.0 Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enterprise Card Loyalty Pay With Points Engine • Cardholder Multi-Account Ledger & Real-Time Settlement
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Point Balance Indicator */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0a1b30] to-[#0a2544] border border-[#0060f6]/40 rounded-xl px-4 py-2.5 shadow-inner">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Available Points</span>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-mono text-cyan-300">{userPointsBalance.toLocaleString()}</span>
                <span className="text-xs text-blue-400 font-medium">pts</span>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-slate-700 hover:border-slate-600 shadow"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Ledger</span>
            </button>
          </div>
        </header>

        {/* Global Statistics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Posted Volume</span>
              <span className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-white">${metrics.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-500 mt-1">Aggregated across all connected accounts</div>
          </div>

          <div className="bg-slate-900/80 border border-[#0060f6]/30 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0060f6]/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">PwP Eligible Balance</span>
              <span className="text-cyan-400 bg-cyan-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">${metrics.eligibleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-cyan-500/80 mt-1">Ready for Instant Redemption Credit</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Points Redeemed YTD</span>
              <span className="text-amber-400 bg-amber-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-amber-300">{metrics.totalRedeemedPoints.toLocaleString()} <span className="text-sm font-normal text-slate-400">pts</span></div>
            <div className="text-xs text-slate-500 mt-1">Converted via CLPWPE Service</div>
          </div>

          <div className="bg-slate-900/80 border border-emerald-900/40 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Statement Credits Received</span>
              <span className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-300">${metrics.totalCreditSaved.toFixed(2)}</div>
            <div className="text-xs text-emerald-600 mt-1">100% Cash-equivalent savings realized</div>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search merchant, card last 4, category, or UUID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#0060f6] focus:ring-1 focus:ring-[#0060f6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Segment Filter for PwP */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setEligibilityFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${eligibilityFilter === 'ALL' ? 'bg-[#0060f6] text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setEligibilityFilter('ELIGIBLE_ONLY')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${eligibilityFilter === 'ELIGIBLE_ONLY' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow' : 'text-slate-400 hover:text-cyan-400'}`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>PwP Eligible</span>
              </button>
              <button
                onClick={() => setEligibilityFilter('REDEEMED')}
                className={`px-3 py-1.5 rounded-lg transition ${eligibilityFilter === 'REDEEMED' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'}`}
              >
                Redeemed
              </button>
            </div>
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-[#0060f6] outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Dining & Restaurants">Dining & Restaurants</option>
                <option value="Technology & Software">Technology & Software</option>
                <option value="Office & Business Services">Office & Business</option>
                <option value="Groceries & Gourmet">Groceries & Gourmet</option>
                <option value="Automotive & Transit">Automotive & Transit</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Card Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-[#0060f6] outline-none font-mono"
              >
                <option value="ALL">All Card Accounts</option>
                <option value="SAPPHIRE_RESERVE">Sapphire Reserve® (1.5x)</option>
                <option value="JPM_RESERVE">J.P. Morgan Reserve® (1.5x)</option>
                <option value="SAPPHIRE_PREFERRED">Sapphire Preferred® (1.25x)</option>
                <option value="INK_BUSINESS_PREFERRED">Ink Preferred® (1.25x)</option>
                <option value="FREEDOM_UNLIMITED">Freedom Unlimited® (1.0x)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Posting Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 focus:border-[#0060f6] outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="POSTED">Posted Settlement</option>
                <option value="PENDING">Authorization Pending</option>
                <option value="REDEEMED_WITH_POINTS">Redeemed via Points</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Sort Order</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else { setSortField('date'); setSortAsc(false); }
                  }}
                  className={`flex-1 py-2 px-2 text-center rounded-lg border transition ${sortField === 'date' ? 'bg-slate-800 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  Date {sortField === 'date' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'amount') setSortAsc(!sortAsc);
                    else { setSortField('amount'); setSortAsc(false); }
                  }}
                  className={`flex-1 py-2 px-2 text-center rounded-lg border transition ${sortField === 'amount' ? 'bg-slate-800 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  Amount {sortField === 'amount' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ledger Table Section */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-5">Merchant & Details</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Card Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-right">Amount (USD)</th>
                  <th className="py-4 px-4 text-center">Status / PwP</th>
                  <th className="py-4 px-5 text-right">Loyalty Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-base font-medium text-slate-400">No matching transactions found</span>
                        <span className="text-xs text-slate-600">Try modifying search keywords or clearing applied filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const tier = REWARD_TIER_MAP[tx.productCode] || { pointValueCents: 1.0, multiplierBadge: '1.0x', name: tx.productCode };
                    const pointsNeeded = calculatePointsRequired(tx.amount, tx.productCode, 100);

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedTxDetails(tx)}
                      >
                        {/* Merchant Details */}
                        <td className="py-4 px-5">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 group-hover:border-blue-500 transition shadow">
                              {tx.logoInitial}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-blue-400 transition flex items-center space-x-2">
                                <span>{tx.merchantName}</span>
                              </div>
                              <div className="text-xs text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                                <span>MCC {tx.merchantCategoryCode}</span>
                                <span>•</span>
                                <span>Ref #{tx.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-xs font-mono text-slate-300">
                          {tx.date}
                        </td>

                        {/* Card Product */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-medium text-slate-200">{tier.name}</div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-500">•••• {tx.cardLastFour}</span>
                            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded font-semibold">
                              {tier.multiplierBadge}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 text-xs text-slate-300">
                          <span className="bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-300 font-medium">
                            {tx.category}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-100">
                          ${tx.amount.toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {tx.status === 'REDEEMED_WITH_POINTS' ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Redeemed</span>
                            </span>
                          ) : tx.status === 'PENDING' ? (
                            <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              <span>Pending Auth</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                              <span>Posted</span>
                            </span>
                          )}
                        </td>

                        {/* Loyalty Actions */}
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          {tx.status === 'POSTED' && tx.pwpEligible ? (
                            <button
                              onClick={() => {
                                setActiveRedemptionTx(tx);
                                setRedemptionPercent(100);
                              }}
                              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#0060f6] to-[#004fba] hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition transform active:scale-95"
                            >
                              <svg className="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Pay with Points</span>
                            </button>
                          ) : tx.status === 'REDEEMED_WITH_POINTS' ? (
                            <div className="text-right">
                              <span className="text-xs font-mono text-emerald-400 font-bold block">
                                -{tx.pointsRedeemed?.toLocaleString()} pts
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Ref: {tx.traceId?.slice(0, 8)}...
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">Ineligible</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Summary */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              Showing <span className="text-white font-semibold">{filteredTransactions.length}</span> of{' '}
              <span className="text-white font-semibold">{transactions.length}</span> ledger operations
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>2-Legged OAuth Verified</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>API Gateway: 200 OK</span>
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Pay with Points (PwP) Real-Time Redemption Drawer / Modal */}
      {activeRedemptionTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-[#0060f6]/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0060f6]/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Chase Pay with Points™</h3>
                  <p className="text-xs text-slate-400">Card Loyalty Real-Time Statement Credit Simulation</p>
                </div>
              </div>
              <button
                onClick={() => setActiveRedemptionTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Transaction Brief */}
            <div className="mt-5 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Selected Charge</span>
                <span className="text-white font-medium">{activeRedemptionTx.merchantName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Card Product</span>
                <span className="text-blue-400 font-semibold">{REWARD_TIER_MAP[activeRedemptionTx.productCode].name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Purchase Amount</span>
                <span className="text-white font-bold font-mono text-sm">${activeRedemptionTx.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Redemption Tier Value</span>
                <span className="text-cyan-300 font-semibold">{REWARD_TIER_MAP[activeRedemptionTx.productCode].pointValueCents}¢ per point ({REWARD_TIER_MAP[activeRedemptionTx.productCode].multiplierBadge})</span>
              </div>
            </div>

            {/* Slider / Redemption Math */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Portion to Pay with Points:</span>
                <span className="text-[#0060f6] font-bold font-mono text-sm bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800">
                  {redemptionPercent}% (${(activeRedemptionTx.amount * (redemptionPercent / 100)).toFixed(2)})
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={redemptionPercent}
                onChange={(e) => setRedemptionPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0060f6]"
              />

              {/* Dynamic Calculation Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Points to Deduct</span>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                    {calculatePointsRequired(activeRedemptionTx.amount, activeRedemptionTx.productCode, redemptionPercent).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">From Ultimate Rewards® pool</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Statement Credit</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    ${(activeRedemptionTx.amount * (redemptionPercent / 100)).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">Applied within 24-48 hrs</span>
                </div>
              </div>
            </div>

            {/* Technical API Info Footnote */}
            <div className="mt-5 p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="text-blue-300 font-semibold flex items-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>CLPWPE API Payload Simulation</span>
              </div>
              <div className="truncate">UUID: {activeRedemptionTx.accountReferenceUuid}</div>
              <div className="truncate">Ext-Acct: {activeRedemptionTx.externalAccountIdentifier}</div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setActiveRedemptionTx(null)}
                disabled={isProcessingPwp}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteRedemption}
                disabled={isProcessingPwp}
                className="flex-1 py-3 bg-gradient-to-r from-[#0060f6] to-[#004bb5] hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessingPwp ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Authenticating API...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirm Redemption</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTxDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Transaction Audit Record</h3>
                <p className="text-xs text-slate-400">UUID: {selectedTxDetails.accountReferenceUuid}</p>
              </div>
              <button
                onClick={() => setSelectedTxDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Merchant</span>
                <span className="text-white font-semibold">{selectedTxDetails.merchantName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-bold font-mono">${selectedTxDetails.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Authorization Date</span>
                <span className="text-slate-300 font-mono">{selectedTxDetails.date}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Account RPC Product</span>
                <span className="text-blue-400 font-mono">{selectedTxDetails.productCode}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">External Client ID</span>
                <span className="text-slate-300 font-mono text-xs">{selectedTxDetails.externalAccountIdentifier}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-bold">{selectedTxDetails.status}</span>
              </div>
              {selectedTxDetails.traceId && (
                <div className="flex justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-400">Trace ID (128-bit)</span>
                  <span className="text-amber-400 font-mono text-xs">{selectedTxDetails.traceId}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedTxDetails(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Enterprise Toast System */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${toastMessage.isError ? 'bg-rose-950/90 border-rose-600 text-rose-100' : 'bg-slate-900/95 border-[#0060f6] text-slate-100'}`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-xl mt-0.5 ${toastMessage.isError ? 'bg-rose-800 text-rose-200' : 'bg-blue-600 text-white'}`}>
                {toastMessage.isError ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{toastMessage.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toastMessage.desc}</p>
                {toastMessage.traceId && (
                  <div className="text-[10px] font-mono text-cyan-300 mt-2 bg-slate-950/70 p-1.5 rounded border border-slate-800">
                    trace-id: {toastMessage.traceId}
                  </div>
                )}
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaseTransactionLedger;