import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, ChevronLeft, ChevronRight, Filter, Check, SlidersHorizontal } from 'lucide-react';

export interface PayeeFilters {
  searchQuery: string;
  paymentType: 'ALL' | 'LOCAL_CITI' | 'SEPA_PAYMENT' | 'SWIFT';
  payeeStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
}

interface PayeeListFiltersProps {
  filters: PayeeFilters;
  onFilterChange: (filters: PayeeFilters) => void;
  nextStartIndex: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newStartIndex: number) => void;
}

export const PayeeListFilters: React.FC<PayeeListFiltersProps> = ({
  filters,
  onFilterChange,
  nextStartIndex,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  // Debounce search input to avoid excessive re-renders/API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        onFilterChange({ ...filters, searchQuery: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFilterChange]);

  // Sync local search state if parent filters change externally
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  const handlePaymentTypeChange = (type: PayeeFilters['paymentType']) => {
    onFilterChange({ ...filters, paymentType: type });
  };

  const handleStatusChange = (status: PayeeFilters['payeeStatus']) => {
    onFilterChange({ ...filters, payeeStatus: status });
  };

  const handleReset = () => {
    setLocalSearch('');
    onFilterChange({
      searchQuery: '',
      paymentType: 'ALL',
      payeeStatus: 'ALL',
    });
  };

  // Pagination calculations
  const currentPage = Math.floor(nextStartIndex / pageSize) + 1;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRange = totalCount === 0 ? 0 : nextStartIndex + 1;
  const endRange = Math.min(nextStartIndex + pageSize, totalCount);

  const handlePrevPage = () => {
    if (nextStartIndex - pageSize >= 0) {
      onPageChange(nextStartIndex - pageSize);
    }
  };

  const handleNextPage = () => {
    if (nextStartIndex + pageSize < totalCount) {
      onPageChange(nextStartIndex + pageSize);
    }
  };

  const paymentTypes: { value: PayeeFilters['paymentType']; label: string }[] = [
    { value: 'ALL', label: 'All Payments' },
    { value: 'LOCAL_CITI', label: 'Citi Local' },
    { value: 'SEPA_PAYMENT', label: 'SEPA' },
    { value: 'SWIFT', label: 'SWIFT / International' },
  ];

  const statusTypes: { value: PayeeFilters['payeeStatus']; label: string; color: string }[] = [
    { value: 'ALL', label: 'All Statuses', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
    { value: 'ACTIVE', label: 'Active Only', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
    { value: 'INACTIVE', label: 'Inactive Only', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' },
  ];

  const hasActiveFilters = filters.searchQuery !== '' || filters.paymentType !== 'ALL' || filters.payeeStatus !== 'ALL';

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header / Search Bar */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by nickname, account number, or bank..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              isFilterPanelOpen
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {isFilterPanelOpen && (
        <div className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300">
          {/* Payment Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Payment Type
            </label>
            <div className="flex flex-wrap gap-2">
              {paymentTypes.map((type) => {
                const isSelected = filters.paymentType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => handlePaymentTypeChange(type.value)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Payee Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusTypes.map((status) => {
                const isSelected = filters.payeeStatus === status.value;
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      status.value === 'ACTIVE' ? 'bg-emerald-500' : status.value === 'INACTIVE' ? 'bg-rose-500' : 'bg-slate-400'
                    }`} />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pagination & Summary Bar */}
      <div className="px-5 py-4 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startRange}</span> to{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{endRange}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> payees
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Page <span className="font-medium text-slate-700 dark:text-slate-300">{currentPage}</span> of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={nextStartIndex === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={nextStartIndex + pageSize >= totalCount}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};