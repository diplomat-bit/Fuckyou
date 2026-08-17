import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronDown, 
  ArrowUpRight, 
  TrendingUp, 
  DollarSign, 
  Zap,
  Globe,
  X,
  Printer,
  Share2,
  ArrowRight,
  Check,
  Calendar
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type TransferStatus = 'completed' | 'processing' | 'failed' | 'action_required';

export interface CurrencyDetails {
  code: string;
  symbol: string;
  flag: string;
}

export interface Transfer {
  id: string;
  transactionReference: string;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  recipientAccount: string;
  sourceCurrency: CurrencyDetails;
  destinationCurrency: CurrencyDetails;
  sourceAmount: number;
  destinationAmount: number;
  exchangeRate: number;
  fee: number;
  transferSpeed: 'Standard' | 'Instant' | 'Express';
  status: TransferStatus;
  createdAt: string;
  estimatedDelivery: string;
  paymentMethod: string;
}

// --- MOCK DATA ---
const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 'TXN-90821-UX',
    transactionReference: 'FT-882910293-US-EU',
    senderName: 'Sarah Jenkins',
    recipientName: 'Amélie Laurent',
    recipientEmail: 'amelie.laurent@designco.fr',
    recipientAccount: 'FR76 3000 1007 9000 1234 5678 901',
    sourceCurrency: { code: 'USD', symbol: '$', flag: '🇺🇸' },
    destinationCurrency: { code: 'EUR', symbol: '€', flag: '🇪🇺' },
    sourceAmount: 5000.00,
    destinationAmount: 4625.50,
    exchangeRate: 0.9251,
    fee: 12.50,
    transferSpeed: 'Instant',
    status: 'completed',
    createdAt: '2024-04-18T14:32:00Z',
    estimatedDelivery: '2024-04-18T14:35:00Z',
    paymentMethod: 'ACH Debit'
  },
  {
    id: 'TXN-77210-PL',
    transactionReference: 'FT-109283746-US-IN',
    senderName: 'Sarah Jenkins',
    recipientName: 'Rajesh Kumar',
    recipientEmail: 'rajesh.kumar@techcorp.in',
    recipientAccount: 'SBIN0004321 - 9928102938',
    sourceCurrency: { code: 'USD', symbol: '$', flag: '🇺🇸' },
    destinationCurrency: { code: 'INR', symbol: '₹', flag: '🇮🇳' },
    sourceAmount: 12450.00,
    destinationAmount: 1034595.00,
    exchangeRate: 83.10,
    fee: 45.00,
    transferSpeed: 'Express',
    status: 'processing',
    createdAt: '2024-04-19T09:15:00Z',
    estimatedDelivery: '2024-04-20T12:00:00Z',
    paymentMethod: 'Wire Transfer'
  },
  {
    id: 'TXN-65412-OP',
    transactionReference: 'FT-554637281-US-UK',
    senderName: 'Sarah Jenkins',
    recipientName: 'Oliver Smith',
    recipientEmail: 'oliver.smith@creativeagency.co.uk',
    recipientAccount: 'BARC202020 - 44332211',
    sourceCurrency: { code: 'USD', symbol: '$', flag: '🇺🇸' },
    destinationCurrency: { code: 'GBP', symbol: '£', flag: '🇬🇧' },
    sourceAmount: 1850.00,
    destinationAmount: 1461.50,
    exchangeRate: 0.79,
    fee: 8.00,
    transferSpeed: 'Standard',
    status: 'completed',
    createdAt: '2024-04-15T16:45:00Z',
    estimatedDelivery: '2024-04-17T17:00:00Z',
    paymentMethod: 'ACH Debit'
  },
  {
    id: 'TXN-43210-MN',
    transactionReference: 'FT-998877665-US-MX',
    senderName: 'Sarah Jenkins',
    recipientName: 'Sofia Rodriguez',
    recipientEmail: 'sofia.rod@mexicosolutions.mx',
    recipientAccount: 'MX56 0123 4567 8901 2345 67',
    sourceCurrency: { code: 'USD', symbol: '$', flag: '🇺🇸' },
    destinationCurrency: { code: 'MXN', symbol: '$', flag: '🇲🇽' },
    sourceAmount: 3200.00,
    destinationAmount: 54400.00,
    exchangeRate: 17.00,
    fee: 15.00,
    transferSpeed: 'Instant',
    status: 'failed',
    createdAt: '2024-04-12T11:20:00Z',
    estimatedDelivery: '2024-04-12T11:25:00Z',
    paymentMethod: 'Debit Card'
  },
  {
    id: 'TXN-32109-ZA',
    transactionReference: 'FT-443322110-US-SG',
    senderName: 'Sarah Jenkins',
    recipientName: 'Chen Wei',
    recipientEmail: 'chen.wei@singaporetech.sg',
    recipientAccount: 'DBS7382 - 10928374',
    sourceCurrency: { code: 'USD', symbol: '$', flag: '🇺🇸' },
    destinationCurrency: { code: 'SGD', symbol: 'S$', flag: '🇸🇬' },
    sourceAmount: 8900.00,
    destinationAmount: 11926.00,
    exchangeRate: 1.34,
    fee: 22.00,
    transferSpeed: 'Express',
    status: 'action_required',
    createdAt: '2024-04-19T15:00:00Z',
    estimatedDelivery: '2024-04-21T10:00:00Z',
    paymentMethod: 'Wire Transfer'
  },
  {
    id: 'TXN-21098-BC',
    transactionReference: 'FT-112233445-US-CA',
    senderName: 'Sarah Jenkins',
    recipientName: 'Liam Dubois',
    recipientEmail: 'liam.dubois@quebecdesign.ca',
    recipientAccount: 'TD0002938471029',
    sourceCurrency: { code: 'USD', symbol: '$', flag: '🇺🇸' },
    destinationCurrency: { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
    sourceAmount: 4100.00,
    destinationAmount: 5576.00,
    exchangeRate: 1.36,
    fee: 10.00,
    transferSpeed: 'Standard',
    status: 'completed',
    createdAt: '2024-04-08T08:30:00Z',
    estimatedDelivery: '2024-04-10T12:00:00Z',
    paymentMethod: 'ACH Debit'
  }
];

export default function TransferHistoryTracker() {
  // --- STATE ---
  const [transfers, setTransfers] = useState<Transfer[]>(MOCK_TRANSFERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReinitiateOpen, setIsReinitiateOpen] = useState(false);
  const [reinitiateAmount, setReinitiateAmount] = useState<string>('');
  const [reinitiateSuccess, setReinitiateSuccess] = useState(false);

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const completed = transfers.filter(t => t.status === 'completed');
    const totalSent = completed.reduce((acc, curr) => acc + curr.sourceAmount, 0);
    const active = transfers.filter(t => t.status === 'processing' || t.status === 'action_required').length;
    const totalFees = completed.reduce((acc, curr) => acc + curr.fee, 0);
    const savedFees = completed.length * 35 - totalFees; // Assuming traditional bank fee is $35
    
    return {
      totalSent,
      active,
      savedFees: savedFees > 0 ? savedFees : 0,
      totalTransfers: transfers.length
    };
  }, [transfers]);

  // --- FILTERED TRANSFERS ---
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = 
        transfer.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
      const matchesCurrency = currencyFilter === 'all' || transfer.destinationCurrency.code === currencyFilter;

      return matchesSearch && matchesStatus && matchesCurrency;
    });
  }, [transfers, searchQuery, statusFilter, currencyFilter]);

  // --- UNIQUE CURRENCIES FOR FILTER ---
  const uniqueCurrencies = useMemo(() => {
    const currencies = transfers.map(t => t.destinationCurrency.code);
    return Array.from(new Set(currencies));
  }, [transfers]);

  // --- HANDLERS ---
  const handleOpenReceipt = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsReceiptOpen(true);
  };

  const handleOpenReinitiate = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setReinitiateAmount(transfer.sourceAmount.toString());
    setIsReinitiateOpen(true);
    setReinitiateSuccess(false);
  };

  const handleConfirmReinitiate = () => {
    if (!selectedTransfer) return;

    const amount = parseFloat(reinitiateAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Create a new mock transfer based on the selected one
    const newTransfer: Transfer = {
      ...selectedTransfer,
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}-NEW`,
      transactionReference: `FT-${Math.floor(100000000 + Math.random() * 900000000)}-US-${selectedTransfer.destinationCurrency.code}`,
      sourceAmount: amount,
      destinationAmount: parseFloat((amount * selectedTransfer.exchangeRate).toFixed(2)),
      status: 'processing',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day later
    };

    setTransfers([newTransfer, ...transfers]);
    setReinitiateSuccess(true);
    setTimeout(() => {
      setIsReinitiateOpen(false);
      setReinitiateSuccess(false);
      setSelectedTransfer(null);
    }, 2000);
  };

  // --- FORMATTERS ---
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- STATUS BADGE COMPONENT ---
  const StatusBadge = ({ status }: { status: TransferStatus }) => {
    const config = {
      completed: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
        icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />,
        label: 'Completed'
      },
      processing: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        text: 'text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
        icon: <Clock className="w-4 h-4 mr-1.5 animate-spin" style={{ animationDuration: '3s' }} />,
        label: 'Processing'
      },
      failed: {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
        icon: <AlertCircle className="w-4 h-4 mr-1.5" />,
        label: 'Failed'
      },
      action_required: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
        icon: <AlertCircle className="w-4 h-4 mr-1.5" />,
        label: 'Action Required'
      }
    };

    const current = config[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text}`}>
        {current.icon}
        {current.label}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transfer History</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track, manage, and re-initiate your cross-border payments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTransfers(MOCK_TRANSFERS)}
              className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Sent (USD)</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{formatCurrency(stats.totalSent, 'USD')}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +12.4% from last month
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Transfers</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{stats.active}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                In transit or action required
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated Savings</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{formatCurrency(stats.savedFees, 'USD')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Compared to traditional banks
              </p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Global Reach</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{uniqueCurrencies.length} Currencies</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Across {stats.totalTransfers} total transactions
              </p>
            </div>
          </div>
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by recipient, email, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="action_required">Action Required</option>
                </select>
              </div>

              {/* Currency Filter */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-full sm:w-auto">
                <Globe className="w-4 h-4 text-slate-400" />
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer w-full"
                >
                  <option value="all">All Currencies</option>
                  {uniqueCurrencies.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || statusFilter !== 'all' || currencyFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCurrencyFilter('all');
                  }}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- TRANSFERS TABLE / LIST --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Recipient</th>
                  <th className="py-4 px-6">Amount Sent</th>
                  <th className="py-4 px-6">Amount Received</th>
                  <th className="py-4 px-6">Exchange Rate</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {filteredTransfers.length > 0 ? (
                  filteredTransfers.map((transfer) => (
                    <tr 
                      key={transfer.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Recipient */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-semibold shadow-inner">
                            {transfer.recipientName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {transfer.recipientName}
                              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                                ({transfer.destinationCurrency.flag})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{transfer.recipientEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Amount Sent */}
                      <td className="py-4 px-6 font-medium">
                        <div className="text-slate-900 dark:text-slate-100">
                          {formatCurrency(transfer.sourceAmount, transfer.sourceCurrency.code)}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          Fee: {formatCurrency(transfer.fee, transfer.sourceCurrency.code)}
                        </div>
                      </td>

                      {/* Amount Received */}
                      <td className="py-4 px-6 font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(transfer.destinationAmount, transfer.destinationCurrency.code)}
                      </td>

                      {/* Exchange Rate */}
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        1 {transfer.sourceCurrency.code} = {transfer.exchangeRate} {transfer.destinationCurrency.code}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={transfer.status} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {formatDate(transfer.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReceipt(transfer)}
                            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="View Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenReinitiate(transfer)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg transition-all"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Repeat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                        <p className="font-medium">No transfers found</p>
                        <p className="text-xs">Try adjusting your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-slate-200 dark:divide-slate-800">
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((transfer) => (
                <div key={transfer.id} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-semibold">
                        {transfer.recipientName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          {transfer.recipientName}
                          <span>{transfer.destinationCurrency.flag}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(transfer.createdAt)}</div>
                      </div>
                    </div>
                    <StatusBadge status={transfer.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block">Sent</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(transfer.sourceAmount, transfer.sourceCurrency.code)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Received</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(transfer.destinationAmount, transfer.destinationCurrency.code)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => handleOpenReceipt(transfer)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Receipt
                    </button>
                    <button
                      onClick={() => handleOpenReinitiate(transfer)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Repeat
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-medium">No transfers found</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- MODAL: RECEIPT DETAILS --- */}
      {isReceiptOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Transfer Receipt</h3>
              <button 
                onClick={() => setIsReceiptOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Status Header */}
              <div className="text-center space-y-2 pb-6 border-b border-dashed border-slate-200 dark:border-slate-800">
                <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(selectedTransfer.destinationAmount, selectedTransfer.destinationCurrency.code)}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Successfully sent to {selectedTransfer.recipientName}
                </p>
                <span className="inline-block text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md mt-2">
                  Ref: {selectedTransfer.transactionReference}
                </span>
              </div>

              {/* Transfer Details Breakdown */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Transfer Details</h5>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">You Sent</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(selectedTransfer.sourceAmount, selectedTransfer.sourceCurrency.code)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Transfer Fee</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(selectedTransfer.fee, selectedTransfer.sourceCurrency.code)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Exchange Rate</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      1 {selectedTransfer.sourceCurrency.code} = {selectedTransfer.exchangeRate} {selectedTransfer.destinationCurrency.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Transfer Speed</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {selectedTransfer.transferSpeed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedTransfer.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recipient Details</h5>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Name</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedTransfer.recipientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Email</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedTransfer.recipientEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Account / IBAN</span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                      {selectedTransfer.recipientAccount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeline</h5>
                
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Transfer Initiated</p>
                    <p className="text-slate-500 dark:text-slate-400">{formatDate(selectedTransfer.createdAt)}</p>
                  </div>
                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Funds Cleared & Converted</p>
                    <p className="text-slate-500 dark:text-slate-400">Processed instantly via smart routing</p>
                  </div>
                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Delivered to Recipient</p>
                    <p className="text-slate-500 dark:text-slate-400">{formatDate(selectedTransfer.estimatedDelivery)}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button 
                onClick={() => alert('Receipt link copied to clipboard!')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL: RE-INITIATE TRANSFER --- */}
      {isReinitiateOpen && selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Repeat Transfer</h3>
              <button 
                onClick={() => setIsReinitiateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {reinitiateSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transfer Initiated!</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your transfer has been queued and is processing.
                  </p>
                </div>
              ) : (
                <>
                  {/* Recipient Card */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-semibold">
                      {selectedTransfer.recipientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedTransfer.recipientName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedTransfer.recipientEmail}
                      </p>
                    </div>
                    <span className="ml-auto text-2xl">{selectedTransfer.destinationCurrency.flag}</span>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Send Amount ({selectedTransfer.sourceCurrency.code})
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                        {selectedTransfer.sourceCurrency.symbol}
                      </span>
                      <input
                        type="number"
                        value={reinitiateAmount}
                        onChange={(e) => setReinitiateAmount(e.target.value)}
                        className="w-full pl-8 pr-16 py-3.5 text-lg font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        {selectedTransfer.sourceCurrency.code}
                      </span>
                    </div>
                  </div>

                  {/* Exchange Rate Preview */}
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Exchange Rate</span>
                      <span className="font-semibold">
                        1 {selectedTransfer.sourceCurrency.code} = {selectedTransfer.exchangeRate} {selectedTransfer.destinationCurrency.code}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Estimated Fee</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedTransfer.fee, selectedTransfer.sourceCurrency.code)}
                      </span>
                    </div>
                    <div className="border-t border-indigo-100 dark:border-indigo-900/50 my-2 pt-2 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                      <span>Recipient Receives</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(
                          (parseFloat(reinitiateAmount) || 0) * selectedTransfer.exchangeRate,
                          selectedTransfer.destinationCurrency.code
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsReinitiateOpen(false)}
                      className="flex-1 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmReinitiate}
                      className="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      Confirm & Send
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}