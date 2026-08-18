import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Info, 
  RotateCcw,
  Lock,
  Globe,
  User,
  FileText,
  HelpCircle
} from 'lucide-react';

export interface ScopeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Customer' | 'Accounts' | 'Transactions' | 'Identity' | 'System' | 'Custom';
  riskLevel: 'Low' | 'Medium' | 'High';
  isCustom?: boolean;
}

const PREDEFINED_SCOPES: ScopeDefinition[] = [
  {
    id: '/dda/customer',
    name: '/dda/customer',
    description: 'Access customer profile details including full name, address, phone numbers, and email addresses.',
    category: 'Customer',
    riskLevel: 'Medium',
  },
  {
    id: '/dda/accountlist',
    name: '/dda/accountlist',
    description: 'Retrieve a list of all authorized accounts, including account types and masked account numbers.',
    category: 'Accounts',
    riskLevel: 'Low',
  },
  {
    id: '/dda/account',
    name: '/dda/account',
    description: 'Access detailed information for specific accounts, including balances, status, and ownership details.',
    category: 'Accounts',
    riskLevel: 'Medium',
  },
  {
    id: '/dda/accountsdetails',
    name: '/dda/accountsdetails',
    description: 'Access high-fidelity account details including full routing numbers, account numbers, and interest rates.',
    category: 'Accounts',
    riskLevel: 'High',
  },
  {
    id: '/dda/account/transactions',
    name: '/dda/account/transactions',
    description: 'Retrieve transaction history, pending transactions, and detailed transaction metadata for authorized accounts.',
    category: 'Transactions',
    riskLevel: 'High',
  },
  {
    id: 'openid',
    name: 'openid',
    description: 'Standard OpenID Connect scope to verify user identity and retrieve an ID token.',
    category: 'Identity',
    riskLevel: 'Low',
  },
  {
    id: 'profile',
    name: 'profile',
    description: 'Access basic profile information such as name, family name, given name, and profile picture.',
    category: 'Identity',
    riskLevel: 'Low',
  },
  {
    id: 'offline_access',
    name: 'offline_access',
    description: 'Request a refresh token to maintain long-term access to resources without requiring active user interaction.',
    category: 'System',
    riskLevel: 'High',
  },
];

interface OauthScopeSelectorProps {
  initialScopes?: string; // Space-delimited string or comma-delimited
  onChange?: (scopeString: string, scopeArray: string[]) => void;
  className?: string;
}

export default function OauthScopeSelector({
  initialScopes = '',
  onChange,
  className = '',
}: OauthScopeSelectorProps) {
  // Parse initial scopes
  const parsedInitialScopes = useMemo(() => {
    if (!initialScopes) return [];
    return initialScopes
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [initialScopes]);

  // State
  const [selectedScopeIds, setSelectedScopeIds] = useState<string[]>(parsedInitialScopes);
  const [customScopes, setCustomScopes] = useState<ScopeDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [customInputError, setCustomInputError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Sync initial scopes if they change externally
  useEffect(() => {
    if (parsedInitialScopes.length > 0) {
      // Identify any initial scopes that are not in predefined list and add them to custom scopes
      const predefinedIds = PREDEFINED_SCOPES.map((s) => s.id);
      const missingScopes = parsedInitialScopes.filter((id) => !predefinedIds.includes(id));
      
      if (missingScopes.length > 0) {
        setCustomScopes((prev) => {
          const existingCustomIds = prev.map((s) => s.id);
          const newCustoms = missingScopes
            .filter((id) => !existingCustomIds.includes(id))
            .map((id) => ({
              id,
              name: id,
              description: 'Custom user-defined OAuth2 scope.',
              category: 'Custom' as const,
              riskLevel: 'Medium' as const,
              isCustom: true,
            }));
          return [...prev, ...newCustoms];
        });
      }
      setSelectedScopeIds(parsedInitialScopes);
    }
  }, [parsedInitialScopes]);

  // Combine predefined and custom scopes
  const allScopes = useMemo(() => {
    return [...PREDEFINED_SCOPES, ...customScopes];
  }, [customScopes]);

  // Trigger onChange callback
  useEffect(() => {
    if (onChange) {
      const scopeString = selectedScopeIds.join(' ');
      onChange(scopeString, selectedScopeIds);
    }
  }, [selectedScopeIds, onChange]);

  // Handle selection toggle
  const toggleScope = (id: string) => {
    setSelectedScopeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle adding custom scope
  const handleAddCustomScope = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    
    if (!trimmed) {
      setCustomInputError('Scope name cannot be empty.');
      return;
    }

    // OAuth2 scopes are typically URL-safe strings without spaces
    if (/\s/.test(trimmed)) {
      setCustomInputError('Scopes cannot contain spaces. Use spaces to separate multiple scopes.');
      return;
    }

    if (allScopes.some((s) => s.id.toLowerCase() === trimmed.toLowerCase())) {
      setCustomInputError('This scope already exists.');
      return;
    }

    const newScope: ScopeDefinition = {
      id: trimmed,
      name: trimmed,
      description: 'Custom user-defined OAuth2 scope.',
      category: 'Custom',
      riskLevel: 'Medium',
      isCustom: true,
    };

    setCustomScopes((prev) => [...prev, newScope]);
    setSelectedScopeIds((prev) => [...prev, trimmed]);
    setCustomInput('');
    setCustomInputError('');
  };

  // Remove a custom scope entirely
  const removeCustomScope = (id: string) => {
    setCustomScopes((prev) => prev.filter((s) => s.id !== id));
    setSelectedScopeIds((prev) => prev.filter((item) => item !== id));
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedScopeIds([]);
  };

  // Select all filtered scopes
  const selectAllFiltered = (filteredIds: string[]) => {
    setSelectedScopeIds((prev) => {
      const union = new Set([...prev, ...filteredIds]);
      return Array.from(union);
    });
  };

  // Copy scope string to clipboard
  const copyToClipboard = () => {
    const scopeString = selectedScopeIds.join(' ');
    navigator.clipboard.writeText(scopeString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filtered scopes list
  const filteredScopes = useMemo(() => {
    return allScopes.filter((scope) => {
      const matchesSearch = 
        scope.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scope.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scope.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || scope.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [allScopes, searchQuery, activeCategory]);

  // Categories list for tabs
  const categories = ['All', 'Customer', 'Accounts', 'Transactions', 'Identity', 'System', 'Custom'];

  // Helper to render risk badge
  const renderRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            Low Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
            <Shield className="w-3.5 h-3.5" />
            Medium Risk
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
            <ShieldAlert className="w-3.5 h-3.5" />
            High Risk
          </span>
        );
    }
  };

  // Helper to render category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Customer':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'Accounts':
        return <Lock className="w-4 h-4 text-indigo-500" />;
      case 'Transactions':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'Identity':
        return <Globe className="w-4 h-4 text-teal-500" />;
      case 'System':
        return <Info className="w-4 h-4 text-slate-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">OAuth 2.0 Scope Selector</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select the permissions and access levels required for your application authorization request.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={clearAll}
              disabled={selectedScopeIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Selection
            </button>
          </div>
        </div>
      </div>

      {/* Search & Custom Scope Input */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search */}
        <div className="relative lg:col-span-7">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scopes by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Custom Scope Form */}
        <form onSubmit={handleAddCustomScope} className="lg:col-span-5 flex flex-col gap-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add custom scope (e.g., read:reports)"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (customInputError) setCustomInputError('');
                }}
                className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all ${
                  customInputError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {customInputError && (
            <p className="text-xs text-rose-500 mt-0.5 px-1">{customInputError}</p>
          )}
        </form>
      </div>

      {/* Category Tabs */}
      <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 min-w-max pb-3">
          {categories.map((category) => {
            const count = category === 'All' 
              ? allScopes.length 
              : allScopes.filter(s => s.category === category).length;
            
            if (count === 0 && category !== 'All') return null;

            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {category !== 'All' && getCategoryIcon(category)}
                {category}
                <span className={`ml-1 px-1.5 py-0.25 rounded-full text-[10px] ${
                  isActive 
                    ? 'bg-indigo-200/60 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200' 
                    : 'bg-slate-200/60 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scopes List */}
      <div className="flex-1 max-h-[400px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredScopes.length > 0 ? (
          filteredScopes.map((scope) => {
            const isSelected = selectedScopeIds.includes(scope.id);
            return (
              <div
                key={scope.id}
                onClick={() => toggleScope(scope.id)}
                className={`flex items-start gap-4 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent div onClick
                    className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-950 dark:checked:bg-indigo-600"
                  />
                </div>

                {/* Scope Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white break-all">
                      {scope.name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {getCategoryIcon(scope.category)}
                      {scope.category}
                    </span>
                    {renderRiskBadge(scope.riskLevel)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {scope.description}
                  </p>
                </div>

                {/* Custom Scope Actions */}
                {scope.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomScope(scope.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove custom scope"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">No scopes found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Try adjusting your search query or add a custom scope above.
            </p>
          </div>
        )}
      </div>

      {/* Selection Summary & Actions */}
      {filteredScopes.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {filteredScopes.length} of {allScopes.length} scopes
          </div>
          <button
            type="button"
            onClick={() => selectAllFiltered(filteredScopes.map(s => s.id))}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Select All Filtered
          </button>
        </div>
      )}

      {/* Footer / Output Preview */}
      <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Formatted Scope String (Space-Delimited)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedScopeIds.length} scope{selectedScopeIds.length === 1 ? '' : 's'} selected
            </span>
          </div>

          <div className="relative flex items-stretch">
            <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-l-lg px-3 py-2.5 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-nowrap scrollbar-thin">
              {selectedScopeIds.length > 0 ? (
                selectedScopeIds.join(' ')
              ) : (
                <span className="text-slate-400 dark:text-slate-600 italic">No scopes selected. Select scopes above to generate string.</span>
              )}
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={selectedScopeIds.length === 0}
              className="inline-flex items-center justify-center px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-r-lg border-y border-r border-indigo-600 dark:border-indigo-700 disabled:border-slate-200 dark:disabled:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Selected Badges Preview */}
          {selectedScopeIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {selectedScopeIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50"
                >
                  {id}
                  <button
                    type="button"
                    onClick={() => toggleScope(id)}
                    className="p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded text-indigo-500 dark:text-indigo-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}