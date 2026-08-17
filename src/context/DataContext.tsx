import React, { createContext, useContext, useState, useEffect, useReducer, useCallback, ReactNode } from 'react';

// ==========================================
// Type Definitions
// ==========================================

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'brokerage' | 'crypto' | 'loan';
  institution: string;
  balance: number;
  currency: string;
  accountNumberLast4: string;
  status: 'active' | 'inactive' | 'error';
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  category: string;
  amount: number; // Negative for outflow, positive for inflow
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  merchantName?: string;
  notes?: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: 'plaid' | 'alpaca' | 'stripe' | 'citi' | 'astradb' | 'azure' | 'gcp' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSyncedAt?: string;
  config?: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'cyberpunk' | 'sovereign';
  defaultCurrency: string;
  notificationsEnabled: boolean;
  mfaEnabled: boolean;
  bypassAuth: boolean;
  dashboardLayout: string[];
}

export interface DataState {
  accounts: FinancialAccount[];
  transactions: Transaction[];
  integrations: Integration[];
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

export interface DataContextType extends DataState {
  // Account Actions
  addAccount: (account: Omit<FinancialAccount, 'id' | 'updatedAt'>) => void;
  updateAccount: (id: string, updates: Partial<FinancialAccount>) => void;
  deleteAccount: (id: string) => void;
  refreshAccount: (id: string) => Promise<void>;

  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Integration Actions
  connectIntegration: (provider: Integration['provider'], config?: Record<string, any>) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  updateIntegrationStatus: (id: string, status: Integration['status']) => void;

  // Preference Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;

  // Global Actions
  syncAllData: () => Promise<void>;
  clearAllData: () => void;
}

// ==========================================
// Initial State & Mock Data
// ==========================================

const INITIAL_PREFERENCES: UserPreferences = {
  theme: 'sovereign',
  defaultCurrency: 'USD',
  notificationsEnabled: true,
  mfaEnabled: false,
  bypassAuth: false,
  dashboardLayout: ['balance-summary', 'recent-transactions', 'wealth-nexus', 'integrations-status'],
};

const INITIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc-1',
    name: 'Sovereign Primary Checking',
    type: 'checking',
    institution: 'Citi Sovereign Gateway',
    balance: 142500.82,
    currency: 'USD',
    accountNumberLast4: '8824',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    name: 'Alpaca Brokerage Cash',
    type: 'brokerage',
    institution: 'Alpaca Securities',
    balance: 854300.00,
    currency: 'USD',
    accountNumberLast4: '1942',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    name: 'Stripe Treasury Reserve',
    type: 'savings',
    institution: 'Stripe Treasury',
    balance: 2500000.00,
    currency: 'USD',
    accountNumberLast4: '5501',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    name: 'Sovereign Cold Storage',
    type: 'crypto',
    institution: 'Ledger Vault',
    balance: 42.18, // BTC equivalent
    currency: 'BTC',
    accountNumberLast4: 'x9f2',
    status: 'active',
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    description: 'Mastercard Developers API Subscription',
    category: 'Technology',
    amount: -499.00,
    currency: 'USD',
    status: 'completed',
    merchantName: 'Mastercard Developers',
    notes: 'Monthly API access tier'
  },
  {
    id: 'tx-2',
    accountId: 'acc-2',
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    description: 'TQQQ Algorithmic Buy Order',
    category: 'Investment',
    amount: -15000.00,
    currency: 'USD',
    status: 'completed',
    merchantName: 'Alpaca Execution',
    notes: 'Automated rebalancing trigger'
  },
  {
    id: 'tx-3',
    accountId: 'acc-3',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    description: 'Inbound Wire Transfer - Sovereign Org',
    category: 'Funding',
    amount: 500000.00,
    currency: 'USD',
    status: 'completed',
    merchantName: 'Sovereign Org Handshake',
    notes: 'Capital injection'
  },
  {
    id: 'tx-4',
    accountId: 'acc-1',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    description: 'Azure Cloud Infrastructure',
    category: 'Infrastructure',
    amount: -2450.15,
    currency: 'USD',
    status: 'completed',
    merchantName: 'Microsoft Azure',
    notes: 'Sovereign swarm hosting'
  }
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'int-plaid',
    name: 'Plaid Link',
    provider: 'plaid',
    status: 'connected',
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'int-alpaca',
    name: 'Alpaca Broker API',
    provider: 'alpaca',
    status: 'connected',
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'int-stripe',
    name: 'Stripe Treasury',
    provider: 'stripe',
    status: 'connected',
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'int-citi',
    name: 'Citi Sovereign Gateway',
    provider: 'citi',
    status: 'disconnected',
  }
];

const DEFAULT_STATE: DataState = {
  accounts: INITIAL_ACCOUNTS,
  transactions: INITIAL_TRANSACTIONS,
  integrations: INITIAL_INTEGRATIONS,
  preferences: INITIAL_PREFERENCES,
  isLoading: false,
  error: null,
};

// ==========================================
// Reducer Actions & Implementation
// ==========================================

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATE'; payload: Partial<DataState> }
  | { type: 'ADD_ACCOUNT'; payload: FinancialAccount }
  | { type: 'UPDATE_ACCOUNT'; payload: { id: string; updates: Partial<FinancialAccount> } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_INTEGRATION'; payload: Integration }
  | { type: 'UPDATE_INTEGRATION'; payload: { id: string; updates: Partial<Integration> } }
  | { type: 'DELETE_INTEGRATION'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'RESET_PREFERENCES' }
  | { type: 'CLEAR_ALL' };

function dataReducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [action.payload, ...state.accounts] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((acc) =>
          acc.id === action.payload.id ? { ...acc, ...action.payload.updates, updatedAt: new Date().toISOString() } : acc
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((acc) => acc.id !== action.payload),
        transactions: state.transactions.filter((tx) => tx.accountId !== action.payload),
      };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id ? { ...tx, ...action.payload.updates } : tx
        ),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((tx) => tx.id !== action.payload) };
    case 'ADD_INTEGRATION':
      return { ...state, integrations: [...state.integrations, action.payload] };
    case 'UPDATE_INTEGRATION':
      return {
        ...state,
        integrations: state.integrations.map((int) =>
          int.id === action.payload.id ? { ...int, ...action.payload.updates } : int
        ),
      };
    case 'DELETE_INTEGRATION':
      return { ...state, integrations: state.integrations.filter((int) => int.id !== action.payload) };
    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'RESET_PREFERENCES':
      return { ...state, preferences: INITIAL_PREFERENCES };
    case 'CLEAR_ALL':
      return {
        accounts: [],
        transactions: [],
        integrations: [],
        preferences: INITIAL_PREFERENCES,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

// ==========================================
// Context & Provider Component
// ==========================================

export const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, DEFAULT_STATE, (initial) => {
    // Attempt to load state from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('sovereign_data_state');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          return {
            ...initial,
            ...parsed,
            isLoading: false,
            error: null,
          };
        }
      } catch (e) {
        console.error('Failed to load state from localStorage:', e);
      }
    }
    return initial;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sovereign_data_state', JSON.stringify({
          accounts: state.accounts,
          transactions: state.transactions,
          integrations: state.integrations,
          preferences: state.preferences,
        }));
      } catch (e) {
        console.error('Failed to save state to localStorage:', e);
      }
    }
  }, [state.accounts, state.transactions, state.integrations, state.preferences]);

  // Apply theme class to document body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      body.classList.remove('theme-light', 'theme-dark', 'theme-cyberpunk', 'theme-sovereign');
      body.classList.add(`theme-${state.preferences.theme}`);
    }
  }, [state.preferences.theme]);

  // ==========================================
  // Action Implementations
  // ==========================================

  const addAccount = useCallback((account: Omit<FinancialAccount, 'id' | 'updatedAt'>) => {
    const newAccount: FinancialAccount = {
      ...account,
      id: `acc-${Math.random().toString(36).substr(2, 9)}`,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<FinancialAccount>) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: { id, updates } });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  }, []);

  const refreshAccount = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call to refresh account balance
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const account = state.accounts.find((acc) => acc.id === id);
      if (account) {
        // Simulate a slight balance fluctuation for realism
        const fluctuation = (Math.random() - 0.4) * 100;
        const newBalance = Math.max(0, account.balance + fluctuation);
        dispatch({
          type: 'UPDATE_ACCOUNT',
          payload: { id, updates: { balance: parseFloat(newBalance.toFixed(2)) } },
        });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to refresh account ${id}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.accounts]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });

    // Automatically update the corresponding account balance
    const account = state.accounts.find((acc) => acc.id === transaction.accountId);
    if (account) {
      const newBalance = account.balance + transaction.amount;
      dispatch({
        type: 'UPDATE_ACCOUNT',
        payload: { id: transaction.accountId, updates: { balance: parseFloat(newBalance.toFixed(2)) } },
      });
    }
  }, [state.accounts]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);

  const connectIntegration = useCallback(async (provider: Integration['provider'], config?: Record<string, any>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate integration handshake
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const existing = state.integrations.find((int) => int.provider === provider);
      if (existing) {
        dispatch({
          type: 'UPDATE_INTEGRATION',
          payload: {
            id: existing.id,
            updates: { status: 'connected', lastSyncedAt: new Date().toISOString(), config },
          },
        });
      } else {
        const newIntegration: Integration = {
          id: `int-${provider}-${Math.random().toString(36).substr(2, 5)}`,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Integration`,
          provider,
          status: 'connected',
          lastSyncedAt: new Date().toISOString(),
          config,
        };
        dispatch({ type: 'ADD_INTEGRATION', payload: newIntegration });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to connect integration: ${provider}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.integrations]);

  const disconnectIntegration = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INTEGRATION', payload: id });
  }, []);

  const updateIntegrationStatus = useCallback((id: string, status: Integration['status']) => {
    dispatch({ type: 'UPDATE_INTEGRATION', payload: { id, updates: { status } } });
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  }, []);

  const resetPreferences = useCallback(() => {
    dispatch({ type: 'RESET_PREFERENCES' });
  }, []);

  const syncAllData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      // Simulate global synchronization across all connected services
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      // Update all active integrations sync time
      state.integrations.forEach((int) => {
        if (int.status === 'connected') {
          dispatch({
            type: 'UPDATE_INTEGRATION',
            payload: { id: int.id, updates: { lastSyncedAt: new Date().toISOString() } },
          });
        }
      });

      // Randomly update account balances slightly to simulate real-time updates
      state.accounts.forEach((acc) => {
        if (acc.status === 'active') {
          const fluctuation = (Math.random() - 0.5) * 250;
          dispatch({
            type: 'UPDATE_ACCOUNT',
            payload: { id: acc.id, updates: { balance: parseFloat(Math.max(0, acc.balance + fluctuation).toFixed(2)) } },
          });
        }
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Global synchronization failed. Please check your network.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.accounts, state.integrations]);

  const clearAllData = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value: DataContextType = {
    ...state,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    connectIntegration,
    disconnectIntegration,
    updateIntegrationStatus,
    updatePreferences,
    resetPreferences,
    syncAllData,
    clearAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// ==========================================
// Custom Hook for Context Consumption
// ==========================================

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};