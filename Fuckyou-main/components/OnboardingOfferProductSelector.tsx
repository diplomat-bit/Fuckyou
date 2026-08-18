import React, { useState, useMemo } from 'react';
import { 
  Check, 
  X, 
  Search, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeftRight, 
  Filter, 
  ChevronRight, 
  ShoppingBag, 
  Layers,
  Info
} from 'lucide-react';

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'pending' | 'confirmed' | 'declined' | 'draft';
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
}

interface OnboardingOfferProductSelectorProps {
  initialOfferedProducts?: ProductItem[];
  initialRequestedProducts?: ProductItem[];
  onConfirmSelection?: (data: {
    confirmedOfferedIds: string[];
    confirmedRequestedIds: string[];
  }) => void;
  onCancel?: () => void;
  className?: string;
}

export default function OnboardingOfferProductSelector({
  initialOfferedProducts = [
    {
      id: 'off-1',
      name: 'Enterprise Cloud Suite',
      sku: 'ECS-2024-ENT',
      category: 'SaaS Subscription',
      status: 'pending',
      price: 1200,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Full access to enterprise cloud infrastructure, analytics, and 24/7 dedicated support.'
    },
    {
      id: 'off-2',
      name: 'AI Analytics Add-on',
      sku: 'AI-ANL-09',
      category: 'Add-on Module',
      status: 'draft',
      price: 450,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Predictive modeling and automated reporting powered by advanced machine learning.'
    },
    {
      id: 'off-3',
      name: 'Developer API License',
      sku: 'API-LIC-DEV',
      category: 'Developer Tools',
      status: 'confirmed',
      price: 300,
      quantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'High-throughput API access keys with sandbox environment and SDK libraries.'
    },
    {
      id: 'off-4',
      name: 'Premium Security Shield',
      sku: 'SEC-SHLD-01',
      category: 'Security',
      status: 'declined',
      price: 150,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'DDoS protection, end-to-end encryption, and automated vulnerability scanning.'
    }
  ],
  initialRequestedProducts = [
    {
      id: 'req-1',
      name: 'Custom Integration Service',
      sku: 'SRV-INT-CUST',
      category: 'Professional Services',
      status: 'pending',
      price: 2500,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Bespoke integration pipeline built by our core engineering team for your legacy systems.'
    },
    {
      id: 'req-2',
      name: 'On-Site Team Training',
      sku: 'SRV-TRN-ONSITE',
      category: 'Training',
      status: 'confirmed',
      price: 1800,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Two days of intensive hands-on workshops for up to 15 developers and administrators.'
    },
    {
      id: 'req-3',
      name: 'Extended Hardware Warranty',
      sku: 'WRNTY-EXT-3Y',
      category: 'Support',
      status: 'pending',
      price: 600,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      quantity: 3,
      description: '3-year comprehensive hardware replacement warranty with next-business-day shipping.'
    }
  ],
  onConfirmSelection,
  onCancel,
  className = ''
}: OnboardingOfferProductSelectorProps) {
  const [activeTab, setActiveTab] = useState<'offered' | 'requested'>('offered');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selection states (storing IDs of selected items)
  const [selectedOffered, setSelectedOffered] = useState<string[]>(
    initialOfferedProducts.filter(p => p.status === 'confirmed').map(p => p.id)
  );
  const [selectedRequested, setSelectedRequested] = useState<string[]>(
    initialRequestedProducts.filter(p => p.status === 'confirmed').map(p => p.id)
  );

  // Toggle selection for a single product
  const toggleProductSelection = (id: string, type: 'offered' | 'requested') => {
    if (type === 'offered') {
      setSelectedOffered(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setSelectedRequested(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  // Select/Deselect all visible items in current tab
  const handleSelectAllVisible = (visibleIds: string[]) => {
    const currentSelection = activeTab === 'offered' ? selectedOffered : selectedRequested;
    const allVisibleSelected = visibleIds.every(id => currentSelection.includes(id));

    if (allVisibleSelected) {
      // Deselect all visible
      if (activeTab === 'offered') {
        setSelectedOffered(prev => prev.filter(id => !visibleIds.includes(id)));
      } else {
        setSelectedRequested(prev => prev.filter(id => !visibleIds.includes(id)));
      }
    } else {
      // Select all visible
      if (activeTab === 'offered') {
        setSelectedOffered(prev => Array.from(new Set([...prev, ...visibleIds])));
      } else {
        setSelectedRequested(prev => Array.from(new Set([...prev, ...visibleIds])));
      }
    }
  };

  // Filter products based on search and status filter
  const filteredOfferedProducts = useMemo(() => {
    return initialOfferedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialOfferedProducts, searchQuery, statusFilter]);

  const filteredRequestedProducts = useMemo(() => {
    return initialRequestedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialRequestedProducts, searchQuery, statusFilter]);

  const currentProducts = activeTab === 'offered' ? filteredOfferedProducts : filteredRequestedProducts;
  const currentSelection = activeTab === 'offered' ? selectedOffered : selectedRequested;
  const visibleIds = currentProducts.map(p => p.id);
  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => currentSelection.includes(id));

  // Status Badge Renderer
  const renderStatusBadge = (status: ProductItem['status']) => {
    const config = {
      confirmed: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
        icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
        label: 'Confirmed'
      },
      pending: {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
        icon: <Clock className="w-3.5 h-3.5 mr-1" />,
        label: 'Pending Review'
      },
      declined: {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
        icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
        label: 'Declined'
      },
      draft: {
        bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        icon: <Package className="w-3.5 h-3.5 mr-1" />,
        label: 'Draft'
      }
    };

    const current = config[status] || config.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg}`}>
        {current.icon}
        {current.label}
      </span>
    );
  };

  const handleConfirm = () => {
    if (onConfirmSelection) {
      onConfirmSelection({
        confirmedOfferedIds: selectedOffered,
        confirmedRequestedIds: selectedRequested
      });
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col ${className}`}>
      
      {/* Header Section */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Confirmation</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review, toggle, and confirm the products offered to you and the items you requested.
            </p>
          </div>
          
          {/* Summary Stats */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              Offered Selected: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedOffered.length}</span>/{initialOfferedProducts.length}
            </div>
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              Requested Selected: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedRequested.length}</span>/{initialRequestedProducts.length}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6">
          <button
            onClick={() => setActiveTab('offered')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all relative ${
              activeTab === 'offered'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Offered Products
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full font-bold">
              {initialOfferedProducts.length}
            </span>
            {activeTab === 'offered' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('requested')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-all relative ${
              activeTab === 'requested'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Requested Products
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full font-bold">
              {initialRequestedProducts.length}
            </span>
            {activeTab === 'requested' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {currentProducts.length > 0 && (
            <button
              onClick={() => handleSelectAllVisible(visibleIds)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {isAllVisibleSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Product Grid/List */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[500px] bg-slate-50/30 dark:bg-slate-900/10">
        {currentProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-3">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No products found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Try adjusting your search query or status filter to find what you are looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProducts.map((product) => {
              const isSelected = currentSelection.includes(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => toggleProductSelection(product.id, activeTab)}
                  className={`group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-500 dark:border-indigo-500/50 shadow-md shadow-indigo-500/5'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top Row: Image, Title, Checkbox */}
                    <div className="flex items-start gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {product.category}
                          </span>
                          {renderStatusBadge(product.status)}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          SKU: {product.sku}
                        </p>
                      </div>

                      {/* Custom Checkbox */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Price & Quantity */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Qty: <span className="font-semibold text-slate-800 dark:text-slate-200">{product.quantity}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      ${product.price.toLocaleString()}
                      <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">
                        / unit
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="px-6 py-3 bg-indigo-50/30 dark:bg-indigo-950/10 border-t border-slate-100 dark:border-slate-800/60 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Selecting products confirms your intent to include them in the final onboarding agreement. You can toggle items on or off before finalizing.
        </p>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
          Total Confirmed Selection:{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {selectedOffered.length + selectedRequested.length} items
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            Confirm Selection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}