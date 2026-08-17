import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers,
  ArrowUpRight,
  FileText,
  Filter,
  Info
} from 'lucide-react';

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface TransactionDetail {
  transactionId: string;
  endToEndId: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'REJECTED' | 'PENDING' | 'PROCESSING';
  failureReason?: string;
  updatedAt: string;
}

export interface BundleStatusResponse {
  citiBundleId: string;
  clientBundleId: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  processingCount: number;
  overallStatus: 'COMPLETED' | 'PARTIALLY_FAILED' | 'PROCESSING' | 'FAILED' | 'PENDING';
  transactions: TransactionDetail[];
  nextStartIndex?: string;
  totalAmount: number;
  currency: string;
}

interface BundleStatusViewerProps {
  initialBundleId?: string;
  onTransactionSelect?: (transaction: TransactionDetail) => void;
  apiEndpoint?: string;
}

// ==========================================
// Mock Data Generator (For Demo/Fallback)
// ==========================================

const generateMockBundleData = (bundleId: string, startIndex: number = 0): BundleStatusResponse => {
  const statuses: ('SUCCESS' | 'REJECTED' | 'PENDING' | 'PROCESSING')[] = [
    'SUCCESS', 'SUCCESS', 'SUCCESS', 'REJECTED', 'PENDING', 'SUCCESS', 'PROCESSING', 'SUCCESS'
  ];
  
  const failureReasons = [
    'Insufficient funds in source account',
    'Invalid beneficiary account number format',
    'Sanction screening block',
    'Daily limit exceeded for corporate channel'
  ];

  const beneficiaries = [
    'Acme Industrial Corp', 'Global Logistics Ltd', 'TechStart Inc', 'Vanguard Holdings',
    'Apex Retailers', 'Nova Utilities', 'Horizon Media Group', 'Quantum Labs LLC',
    'Stellar Consulting', 'Beacon Security Services'
  ];

  const transactions: TransactionDetail[] = Array.from({ length: 10 }, (_, i) => {
    const index = startIndex + i;
    const status = statuses[index % statuses.length];
    const amount = Math.round((1500 + (index * 345.50)) * 100) / 100;
    
    return {
      transactionId: `TXN-${bundleId.substring(0, 5).toUpperCase()}-${1000 + index}`,
      endToEndId: `E2E-${bundleId.substring(0, 5).toUpperCase()}-${9000 + index}`,
      beneficiaryName: beneficiaries[index % beneficiaries.length],
      beneficiaryAccount: `GB29WXYZ601613${10000000 + index}`,
      amount,
      currency: 'USD',
      status,
      failureReason: status === 'REJECTED' ? failureReasons[index % failureReasons.length] : undefined,
      updatedAt: new Date(Date.now() - (index * 12 * 60 * 1000)).toISOString()
    };
  });

  return {
    citiBundleId: bundleId,
    clientBundleId: `CLIENT-BNDL-${bundleId.substring(0, 6).toUpperCase()}`,
    totalCount: 45,
    successCount: 32,
    failedCount: 5,
    pendingCount: 5,
    processingCount: 3,
    overallStatus: 'PARTIALLY_FAILED',
    transactions,
    nextStartIndex: startIndex + 10 < 45 ? String(startIndex + 10) : undefined,
    totalAmount: 145250.80,
    currency: 'USD'
  };
};

export default function BundleStatusViewer({
  initialBundleId = 'BNDL-CITI-9823411A',
  onTransactionSelect,
  apiEndpoint = '/api/transfers/bundle-status'
}: BundleStatusViewerProps) {
  
  // State Management
  const [bundleIdInput, setBundleIdInput] = useState(initialBundleId);
  const [activeBundleId, setActiveBundleId] = useState(initialBundleId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BundleStatusResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startIndexHistory, setStartIndexHistory] = useState<string[]>([]);
  const [currentStartIndex, setCurrentStartIndex] = useState<string | undefined>(undefined);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Fetch Bundle Status
  const fetchBundleStatus = useCallback(async (id: string, startIndex?: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);

    try {
      if (isDemoMode) {
        // Simulate API latency
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockResponse = generateMockBundleData(id, startIndex ? parseInt(startIndex, 10) : 0);
        setData(mockResponse);
      } else {
        // Real API Call
        const queryParams = new URLSearchParams({
          citiBundleId: id,
          ...(startIndex && { startIndex })
        });
        const response = await fetch(`${apiEndpoint}?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch bundle status. Server returned ${response.status}`);
        }
        const result: BundleStatusResponse = await response.json();
        setData(result);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while retrieving bundle status.');
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, isDemoMode]);

  // Trigger fetch on mount or when active bundle ID / start index changes
  useEffect(() => {
    fetchBundleStatus(activeBundleId, currentStartIndex);
  }, [activeBundleId, currentStartIndex, fetchBundleStatus]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bundleIdInput.trim()) {
      setActiveBundleId(bundleIdInput);
      setCurrentStartIndex(undefined);
      setStartIndexHistory([]);
    }
  };

  // Pagination Handlers
  const handleNextPage = () => {
    if (data?.nextStartIndex) {
      setStartIndexHistory((prev) => [...prev, currentStartIndex || '0']);
      setCurrentStartIndex(data.nextStartIndex);
    }
  };

  const handlePrevPage = () => {
    const previousHistory = [...startIndexHistory];
    const prevIndex = previousHistory.pop();
    setStartIndexHistory(previousHistory);
    setCurrentStartIndex(prevIndex);
  };

  // Filtered Transactions for local search/filter overlay
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.filter((tx) => {
      const matchesSearch = 
        tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.endToEndId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.beneficiaryAccount.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // Progress Calculation
  const progressPercentage = useMemo(() => {
    if (!data) return 0;
    const completed = data.successCount + data.failedCount;
    return Math.round((completed / data.totalCount) * 100);
  }, [data]);

  // Status Badge Color Helper
  const getStatusBadge = (status: TransactionDetail['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50">
            <XCircle className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50">
            <Clock className="w-3.5 h-3.5" /> PENDING
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> PROCESSING
          </span>
        );
    }
  };

  // Export to CSV Helper
  const exportToCSV = () => {
    if (!data) return;
    const headers = ['Transaction ID', 'End To End ID', 'Beneficiary Name', 'Beneficiary Account', 'Amount', 'Currency', 'Status', 'Failure Reason', 'Updated At'];
    const rows = data.transactions.map(tx => [
      tx.transactionId,
      tx.endToEndId,
      tx.beneficiaryName,
      tx.beneficiaryAccount,
      tx.amount,
      tx.currency,
      tx.status,
      tx.failureReason || '',
      tx.updatedAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bundle_Status_${data.citiBundleId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                Bundle Status Tracker
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monitor and audit bulk transfer status via Citi Bundle ID
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Toggle & Refresh */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsDemoMode(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                isDemoMode 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Demo Mode
            </button>
            <button
              onClick={() => setIsDemoMode(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                !isDemoMode 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Live API
            </button>
          </div>

          <button
            onClick={() => fetchBundleStatus(activeBundleId, currentStartIndex)}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearchSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={bundleIdInput}
              onChange={(e) => setBundleIdInput(e.target.value)}
              placeholder="Enter Citi Bundle ID (e.g., BNDL-CITI-9823411A)"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !bundleIdInput.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Retrieve Status'}
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Retrieval Failed</h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {data && !error && (
        <div className="space-y-6">
          
          {/* Bundle Overview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Metadata */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Bundle Details</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {data.overallStatus}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Citi Bundle ID</p>
                <p className="text-base font-bold text-slate-900 dark:text-white font-mono">{data.citiBundleId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Client Reference ID</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">{data.clientBundleId}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Total Value</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Transfers</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{data.totalCount}</p>
                </div>
              </div>
            </div>

            {/* Middle: Progress & Completion Bar */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Processing Progress</h3>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {data.successCount + data.failedCount} of {data.totalCount} transactions processed completely.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <span className="text-xs text-slate-400 block">Success Rate</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((data.successCount / data.totalCount) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Failure Rate</span>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                    {Math.round((data.failedCount / data.totalCount) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Status Breakdown Badges */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Status Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">SUCCESS</span>
                  <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{data.successCount}</span>
                </div>
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-lg">
                  <span className="text-xs text-rose-700 dark:text-rose-400 font-medium block">REJECTED</span>
                  <span className="text-xl font-bold text-rose-800 dark:text-rose-300">{data.failedCount}</span>
                </div>
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block">PENDING</span>
                  <span className="text-xl font-bold text-amber-800 dark:text-amber-300">{data.pendingCount}</span>
                </div>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                  <span className="text-xs text-blue-700 dark:text-blue-400 font-medium block">PROCESSING</span>
                  <span className="text-xl font-bold text-blue-800 dark:text-blue-300">{data.processingCount}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Transactions Table Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            
            {/* Table Controls */}
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Transaction Details</h3>
                <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md font-semibold">
                  Page {startIndexHistory.length + 1}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Local Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter page results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                  </select>
                </div>

                {/* Export Button */}
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Table Element */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Beneficiary</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Updated At</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr 
                        key={tx.transactionId}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                            {tx.transactionId}
                          </div>
                          <div className="font-mono text-xs text-slate-400 mt-0.5">
                            E2E: {tx.endToEndId}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {tx.beneficiaryName}
                          </div>
                          <div className="font-mono text-xs text-slate-400 mt-0.5">
                            {tx.beneficiaryAccount}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(tx.status)}
                          {tx.failureReason && (
                            <div className="text-xs text-rose-500 mt-1 max-w-xs flex items-start gap-1">
                              <Info className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{tx.failureReason}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(tx.updatedAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onTransactionSelect?.(tx)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Details <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No transactions found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {filteredTransactions.length} of {data.transactions.length} items on this page
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={startIndexHistory.length === 0}
                  className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!data.nextStartIndex}
                  className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Bundle Loaded</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Enter a valid Citi Bundle ID above to query the Retrieve Multiple Transfers Status endpoint and view real-time transaction breakdowns.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      )}

    </div>
  );
}