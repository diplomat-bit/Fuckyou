import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Transaction, PortfolioAsset, UserProfile, 
  AppView, View, Notification, InternalAccount,
  AIInsight, BudgetCategory, RewardItem, APIStatus,
  Pipeline, InboundBlob, FundFlow, AuthorizedApp,
  CreditScore, CreditFactor, FinancialGoal, RewardPoints,
  PaymentOrder, Invoice, ComplianceCase, CorporateTransaction,
  EIP6963ProviderDetail, MarqetaCardProduct, SecurityScoreMetric,
  AuditLogEntry, ThreatAlert, DataSharingPolicy, APIKey,
  TrustedContact, SecurityAwarenessModule, TransactionRule
} from '../types';
import { 
  MOCK_TRANSACTIONS, MOCK_ASSETS, MOCK_BUDGETS, 
  MOCK_REWARD_ITEMS, MOCK_API_STATUS, MOCK_NOTIFICATIONS,
  MOCK_CREDIT_SCORE, MOCK_CREDIT_FACTORS, MOCK_FINANCIAL_GOALS,
  MOCK_REWARD_POINTS,
  MOCK_SECURITY_METRICS, MOCK_AUDIT_LOGS, MOCK_THREAT_ALERTS,
  MOCK_DATA_SHARING_POLICIES, MOCK_API_KEYS, MOCK_TRUSTED_CONTACTS,
  MOCK_SECURITY_AWARENESS, MOCK_TRANSACTION_RULES
} from '../data/mockData';

export interface ApiEndpoints {
    quantumFinancial: string;
    plaid: string;
    stripe: string;
    modernTreasury: string;
    gemini: string;
    gein: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  children?: GitHubFile[];
}

interface IDataContext {
  view: AppView; activeView: View; setView: (view: AppView) => void;
  setActiveView: (view: View) => void; userProfile: UserProfile; user: UserProfile; 
  creator: { name: string; title: string }; transactions: Transaction[]; assets: PortfolioAsset[];
  internalAccounts: InternalAccount[]; notifications: Notification[]; aiInsights: AIInsight[];
  insights: AIInsight[]; budgets: BudgetCategory[]; rewardItems: RewardItem[]; apiStatus: APIStatus[];
  pipelines: Pipeline[]; inboundBlobs: InboundBlob[]; fundFlows: FundFlow[]; authorizedApps: AuthorizedApp[];
  geminiApiKey: string | null; setGeminiApiKey: (key: string) => void;
  modernTreasuryApiKey: string | null; setModernTreasuryApiKey: (key: string) => void;
  modernTreasuryOrganizationId: string | null; setModernTreasuryOrganizationId: (id: string) => void;
  setTransactions: (txs: Transaction[]) => void; updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void; setAssets: (assets: PortfolioAsset[]) => void;
  setInternalAccounts: (accounts: InternalAccount[]) => void;
  showNotification: (message: string, severity: Notification['severity']) => void;
  markNotificationRead: (id: string) => void; authorizeApp: (app: Partial<AuthorizedApp>) => void;
  revokeApp: (id: string) => void; redeemReward: (item: RewardItem) => boolean;
  askSovereignAI: (prompt: string, modelName?: string) => Promise<string>;
  simulationData: { time: string; value: number }[]; isImportingData: boolean; treesPlanted: number;
  spendingForNextTree: number; linkedAccounts: any[]; unlinkAccount: (id: string) => void;
  paymentOrders: PaymentOrder[]; invoices: Invoice[]; complianceCases: ComplianceCase[];
  corporateTransactions: CorporateTransaction[]; creditScore: CreditScore; creditFactors: CreditFactor[];
  financialGoals: FinancialGoal[]; addFinancialGoal: (goal: Partial<FinancialGoal>) => void;
  generateGoalPlan: (id: string) => Promise<void>; addContributionToGoal: (id: string, amount: number) => void;
  addRecurringContributionToGoal: (id: string, contrib: any) => void;
  updateRecurringContributionInGoal: (gid: string, cid: string, updates: any) => void;
  deleteRecurringContributionFromGoal: (gid: string, cid: string) => void;
  updateFinancialGoal: (id: string, updates: any) => void; linkGoals: (s: string, t: string, type: any, amt?: number) => void;
  unlinkGoals: (s: string, t: string) => void; isWalletConnectModalOpen: boolean;
  setWalletConnectModalOpen: (open: boolean) => void; detectedProviders: EIP6963ProviderDetail[];
  connectWallet: (provider: EIP6963ProviderDetail) => void; rewardPoints: RewardPoints;
  apiEndpoints: ApiEndpoints; updateEndpoint: (key: keyof ApiEndpoints, value: string) => void;
  sovereignCredits: number; deductCredits: (amount: number) => boolean; isProductionApproved: boolean;
  plaidProducts: string[]; addTransaction: (tx: Transaction) => void;
  isLoading: boolean; error: string | null; broadcastEvent: (type: string, data: any) => void;
  githubRepoFiles: GitHubFile[]; fetchRepo: () => Promise<void>; fetchDirectory: (path: string) => Promise<void>; isRepoLoading: boolean;
  addBudget: (name: string, limit: number) => void; stripeApiKey: string | null;
  marqetaCardProducts: MarqetaCardProduct[]; fetchMarqetaProducts: () => Promise<void>;
  isMarqetaLoading: boolean; marqetaApiToken: string | null; marqetaApiSecret: string | null;
  setMarqetaCredentials: (token: string, secret: string) => void; plaidApiKey: string | null;
  dbConfig: any; updateDbConfig: (updates: any) => void; connectDatabase: () => Promise<void>;
  webDriverStatus: any; launchWebDriver: (task: string) => Promise<void>;
  showSystemAlert: (message: string, severity: Notification['severity']) => void;
  handlePlaidSuccess: (publicToken: string, metadata: any) => void;
  securityMetrics: SecurityScoreMetric[]; auditLogs: AuditLogEntry[];
  threatAlerts: ThreatAlert[]; dataSharingPolicies: DataSharingPolicy[];
  apiKeys: APIKey[]; trustedContacts: TrustedContact[];
  securityAwarenessModules: SecurityAwarenessModule[]; transactionRules: TransactionRule[];
  initiateWireTransfer: (details: any) => Promise<void>;
  initiateACHTransfer: (details: any) => Promise<void>;
  logAuditAction: (action: string, details: any) => void;
}

export const DataContext = createContext<IDataContext | undefined>(undefined);

const STORAGE_KEY = 'QUANTUM_FINANCIAL_STATE_V1';
const GITHUB_STORAGE_KEY = 'QUANTUM_GITHUB_REPO_V1';
const GITHUB_OWNER = 'jocall3';
const GITHUB_REPO = 'jocall3';

const MOCK_INBOUND_BLOBS: InboundBlob[] = [
    { id: 'b-1', filePath: 's3://nexus/ingest/quantum_q4_raw.csv', status: 'IMPORTED', vendorName: 'Quantum Financial', interfaceType: 'SFTP', createdAt: '2024-11-15T09:00:00Z' }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>(View.Dashboard);
  const [transactions, setTransactionsState] = useState<Transaction[]>(MOCK_TRANSACTIONS as any);
  const [assets, setAssetsState] = useState<PortfolioAsset[]>(MOCK_ASSETS as any);
  const [internalAccounts, setInternalAccountsState] = useState<InternalAccount[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS as any);
  const [simulationData, setSimulationData] = useState<{ time: string; value: number }[]>([]);
  const [isImportingData, setIsImportingData] = useState(false);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(MOCK_FINANCIAL_GOALS as any);
  const [isWalletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const [detectedProviders, setDetectedProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([
    { id: 'acc_01', name: 'Quantum Elite Checking', mask: '9981', balance: 8500000, institutionId: 'quantum_intl' },
    { id: 'acc_02', name: 'Global Treasury Savings', mask: '1102', balance: 25000000, institutionId: 'quantum_intl' }
  ]);
  const [authorizedApps, setAuthorizedApps] = useState<AuthorizedApp[]>([
    { id: 'app-1', name: 'Quantum Nexus ERP', description: 'Enterprise Resource Planning', status: 'active', authorizedAt: '2024-10-01T08:00:00Z' }
  ]);
  
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(localStorage.getItem('gemini_api_key'));
  const [modernTreasuryApiKey, setModernTreasuryApiKey] = useState<string | null>(localStorage.getItem('mt_api_key'));
  const [modernTreasuryOrganizationId, setModernTreasuryOrganizationId] = useState<string | null>(localStorage.getItem('mt_org_id'));

  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoints>({
      quantumFinancial: 'https://api.quantumfinancial.io/v1',
      plaid: 'https://production.plaid.com',
      stripe: 'https://api.stripe.com/v1',
      modernTreasury: 'https://app.moderntreasury.com/api',
      gemini: 'https://generativelanguage.googleapis.com',
      gein: 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io'
  });

  const [sovereignCredits, setSovereignCredits] = useState(500000);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(MOCK_BUDGETS as any);
  const [marqetaCardProducts, setMarqetaCardProducts] = useState<MarqetaCardProduct[]>([]);
  const [isMarqetaLoading, setIsMarqetaLoading] = useState(false);
  const [marqetaApiToken, setMarqetaApiToken] = useState<string | null>(localStorage.getItem('marqeta_token'));
  const [marqetaApiSecret, setMarqetaApiSecret] = useState<string | null>(localStorage.getItem('marqeta_secret'));
  
  const [dbConfig, setDbConfig] = useState({
      host: 'quantum-db-cluster.aws.internal',
      port: '5432',
      username: 'quantum_admin',
      password: '',
      databaseName: 'quantum_ledger_prod',
      connectionStatus: 'disconnected' as 'connected' | 'disconnected' | 'connecting',
      sslMode: 'require'
  });

  const updateDbConfig = useCallback((updates: any) => {
    setDbConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const [webDriverStatus, setWebDriverStatus] = useState({
      status: 'idle' as 'idle' | 'running' | 'error',
      logs: [] as string[]
  });

  const [githubRepoFiles, setGithubRepoFiles] = useState<GitHubFile[]>([]);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS as any);

  const logAuditAction = useCallback((action: string, details: any) => {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details: JSON.stringify(details),
      user: 'James Burvel oCallaghan III',
      ipAddress: '10.0.0.42',
      status: 'SUCCESS'
    };
    setAuditLogs(prev => [entry, ...prev]);
    console.log(`[QUANTUM_AUDIT] ${action}`, details);
  }, []);

  const showNotification = useCallback((message: string, severity: Notification['severity']) => {
    setNotifications(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: 'Just Now',
      read: false,
      severity: severity || 'info'
    }, ...prev].slice(0, 20));
  }, []);

  const initiateWireTransfer = useCallback(async (details: any) => {
    logAuditAction('WIRE_TRANSFER_INITIATED', details);
    showNotification('MFA Challenge Issued: Please verify on your Quantum Secure Key.', 'info');
    await new Promise(r => setTimeout(r, 2000));
    showNotification('Fraud Monitoring: Transaction cleared heuristic analysis.', 'success');
    showNotification(`Wire Transfer of ${details.amount} to ${details.recipient} successful.`, 'success');
    logAuditAction('WIRE_TRANSFER_COMPLETED', { ...details, status: 'SETTLED' });
  }, [logAuditAction, showNotification]);

  const initiateACHTransfer = useCallback(async (details: any) => {
    logAuditAction('ACH_TRANSFER_INITIATED', details);
    showNotification('Processing ACH Batch...', 'info');
    await new Promise(r => setTimeout(r, 1500));
    showNotification(`ACH Transfer to ${details.recipient} queued for next window.`, 'success');
    logAuditAction('ACH_TRANSFER_QUEUED', details);
  }, [logAuditAction, showNotification]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.transactions) setTransactionsState(parsed.transactions);
        if (parsed.assets) setAssetsState(parsed.assets);
        if (parsed.internalAccounts) setInternalAccountsState(parsed.internalAccounts);
        if (parsed.financialGoals) setFinancialGoals(parsed.financialGoals);
        if (parsed.linkedAccounts) setLinkedAccounts(parsed.linkedAccounts);
      } catch (e) { console.error("State hydration failed", e); }
    }
    
    const savedGithub = localStorage.getItem(GITHUB_STORAGE_KEY);
    if (savedGithub) {
        try { setGithubRepoFiles(JSON.parse(savedGithub)); } catch (e) { console.error('Failed to parse cached GitHub repo', e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions, assets, internalAccounts, financialGoals, linkedAccounts
    }));
  }, [transactions, assets, internalAccounts, financialGoals, linkedAccounts]);

  useEffect(() => {
    const interval = setInterval(() => {
      const totalWealth = assets.reduce((sum, a) => sum + a.value, 0) + 24500000;
      setSimulationData(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString(), 
          value: totalWealth + (Math.random() - 0.5) * 50000 
        }].slice(-30);
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [assets]);

  const askSovereignAI = useCallback(async (prompt: string, modelName = 'gemini-1.5-pro') => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, topP: 0.95 }
        });
        return result.response.text();
    } catch (e) {
        return "Quantum AI Core synchronization interrupted. Re-establishing secure link...";
    }
  }, []);

  const broadcastEvent = useCallback((type: string, data: any) => {
      logAuditAction(`SYSTEM_EVENT_${type}`, data);
      showNotification(`System Event: ${type.replace(/_/g, ' ')}`, 'info');
  }, [showNotification, logAuditAction]);

  const fetchDirectoryContents = useCallback(async (path: string): Promise<GitHubFile[]> => {
    setIsRepoLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`);
      if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
      let data: GitHubFile[] = await res.json();
      return data.map(item => ({ ...item, path: item.path || `${path}/${item.name}`.replace(/\/\//g, '/') }));
    } catch (e) {
      showNotification(`Repo Error: Could not load ${path}`, 'error');
      return [];
    } finally { setIsRepoLoading(false); }
  }, [showNotification]);

  const fetchRepo = useCallback(async () => {
    setIsRepoLoading(true);
    const rootFiles = await fetchDirectoryContents(''); 
    setGithubRepoFiles(rootFiles);
    setIsRepoLoading(false);
    showNotification('Quantum Repository structure synchronized.', 'success');
    localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(rootFiles));
  }, [fetchDirectoryContents, showNotification]);

  const connectDatabase = useCallback(async () => {
      updateDbConfig({ connectionStatus: 'connecting' });
      await new Promise(r => setTimeout(r, 1500));
      updateDbConfig({ connectionStatus: 'connected' });
      logAuditAction('DATABASE_CONNECTED', { host: dbConfig.host });
      showNotification("Quantum Database nexus synchronized.", "success");
  }, [updateDbConfig, showNotification, logAuditAction, dbConfig.host]);

  const value: IDataContext = useMemo(() => ({
    view, activeView: view as View, setView, setActiveView: setView as (view: View) => void,
    userProfile: { id: 'USR-77-X-ALPHA', name: 'James Burvel oCallaghan III', title: 'Sovereign Architect', email: 'james@quantum.io', phone: '+1 (555) 942-0123', loyaltyTier: 'OMEGA', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', usdBalance: 2450000000, fiatBalance: 2450000000, cryptoBalance: 14200.55 },
    user: { id: 'USR-77-X-ALPHA', name: 'James Burvel oCallaghan III', title: 'Sovereign Architect', email: 'james@quantum.io', phone: '+1 (555) 942-0123', loyaltyTier: 'OMEGA', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', usdBalance: 2450000000, fiatBalance: 2450000000, cryptoBalance: 14200.55 },
    creator: { name: 'James Burvel oCallaghan III', title: 'Grand Architect of Quantum AI' },
    transactions, assets, internalAccounts, notifications, aiInsights: [], insights: [],
    budgets, rewardItems: MOCK_REWARD_ITEMS as any, apiStatus: MOCK_API_STATUS as any,
    pipelines: [
      { id: 'p-1', name: 'Quantum Ledger Sync', pipelineName: 'NEXUS_TX_FEED', status: 'SUCCESS', prettyDuration: '1.2s' },
      { id: 'p-2', name: 'Risk Vector Audit', pipelineName: 'HEURISTIC_RISK', status: 'RUNNING', prettyDuration: '240ms' }
    ],
    inboundBlobs: MOCK_INBOUND_BLOBS, 
    fundFlows: [{ id: 'f-1', name: 'Reserve Accumulation', ledgerId: 'L-771', postedTxCount: 1242, pendingTxCount: 12 }],
    authorizedApps, simulationData, geminiApiKey,
    setGeminiApiKey: (key) => { setGeminiApiKey(key); localStorage.setItem('gemini_api_key', key); },
    modernTreasuryApiKey,
    setModernTreasuryApiKey: (key) => { setModernTreasuryApiKey(key); localStorage.setItem('mt_api_key', key); },
    modernTreasuryOrganizationId,
    setModernTreasuryOrganizationId: (id) => { setModernTreasuryOrganizationId(id); localStorage.setItem('mt_org_id', id); },
    setTransactions: setTransactionsState,
    updateTransaction: (id, updates) => setTransactionsState(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)),
    deleteTransaction: (id) => setTransactionsState(prev => prev.filter(t => t.id !== id)),
    addTransaction: (tx) => setTransactionsState(prev => [tx, ...prev]),
    setAssets: setAssetsState,
    setInternalAccounts: setInternalAccountsState,
    showNotification,
    markNotificationRead: (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)),
    authorizeApp: (app) => setAuthorizedApps(prev => [...prev, { id: app.id || `app-${Date.now()}`, name: app.name || 'Unknown', description: app.description || '', status: 'active', authorizedAt: new Date().toISOString(), scopes: app.scopes }]),
    revokeApp: (id) => setAuthorizedApps(prev => prev.map(a => a.id === id ? { ...a, status: 'revoked' } : a)),
    redeemReward: (item) => { showNotification(`Redeemed ${item.name}`, 'success'); return true; },
    rewardPoints: MOCK_REWARD_POINTS,
    askSovereignAI,
    isImportingData,
    treesPlanted: 142,
    spendingForNextTree: 120,
    linkedAccounts,
    unlinkAccount: (id) => { setLinkedAccounts(prev => prev.filter(a => a.id !== id)); showNotification("Institutional link severed.", "warning"); },
    paymentOrders: [], invoices: [], complianceCases: [], corporateTransactions: [],
    creditScore: MOCK_CREDIT_SCORE,
    creditFactors: MOCK_CREDIT_FACTORS,
    financialGoals,
    addFinancialGoal: (goal) => setFinancialGoals(prev => [...prev, { id: `goal-${Date.now()}`, name: goal.name || 'New Goal', targetAmount: goal.targetAmount || 0, currentAmount: 0, targetDate: goal.targetDate || new Date().toISOString(), iconName: goal.iconName || 'default', plan: null, startDate: new Date().toISOString(), contributions: [], status: 'on_track' }]),
    generateGoalPlan: async (id) => { showNotification("Neural strategist is mapping your trajectory...", "info"); await new Promise(r => setTimeout(r, 2000)); showNotification("Strategic roadmap synthesized.", "success"); },
    addContributionToGoal: (id, amount) => setFinancialGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)),
    addRecurringContributionToGoal: () => {},
    updateRecurringContributionInGoal: () => {},
    deleteRecurringContributionFromGoal: () => {},
    updateFinancialGoal: (id, updates) => setFinancialGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g)),
    linkGoals: () => {},
    unlinkGoals: () => {},
    isWalletConnectModalOpen,
    setWalletConnectModalOpen,
    detectedProviders,
    connectWallet: (provider) => showNotification(`Synchronized with ${provider.info.name}`, "success"),
    apiEndpoints,
    updateEndpoint: (key, value) => setApiEndpoints(prev => ({ ...prev, [key]: value })),
    sovereignCredits,
    deductCredits: (amount) => { if (sovereignCredits >= amount) { setSovereignCredits(prev => prev - amount); return true; } return false; },
    isProductionApproved: true,
    plaidProducts: ['auth', 'transactions', 'identity', 'balance'],
    isLoading: false,
    error: null,
    broadcastEvent,
    addBudget: (name, limit) => setBudgets(prev => [...prev, { id: `b-${Date.now()}`, name, limit, spent: 0, color: '#06b6d4', remaining: limit, category: name, alerts: [] }]),
    stripeApiKey: process.env.STRIPE_SECRET_KEY || null,
    marqetaCardProducts,
    fetchMarqetaProducts: async () => { setIsMarqetaLoading(true); await new Promise(r => setTimeout(r, 1000)); setMarqetaCardProducts([{ token: 'cp-1', name: 'Quantum Black', active: true, start_date: '2024-01-01', config: { fulfillment: { bin_prefix: '424242' }, poi: { other: {} } } } as any]); setIsMarqetaLoading(false); },
    isMarqetaLoading,
    marqetaApiToken,
    marqetaApiSecret,
    setMarqetaCredentials: (token, secret) => { setMarqetaApiToken(token); setMarqetaApiSecret(secret); localStorage.setItem('marqeta_token', token); localStorage.setItem('marqeta_secret', secret); },
    plaidApiKey: process.env.PLAID_SECRET || null,
    dbConfig,
    updateDbConfig,
    connectDatabase,
    webDriverStatus,
    launchWebDriver: async (task) => { setWebDriverStatus(prev => ({ ...prev, status: 'running', logs: [...prev.logs, `Starting task: ${task}`] })); await new Promise(r => setTimeout(r, 2000)); setWebDriverStatus(prev => ({ ...prev, status: 'idle', logs: [...prev.logs, `Task completed: ${task}`] })); },
    showSystemAlert: (msg, sev) => showNotification(msg, sev),
    handlePlaidSuccess: (token, meta) => showNotification(`Account linked: ${meta.institution.name}`, "success"),
    securityMetrics: MOCK_SECURITY_METRICS,
    auditLogs,
    threatAlerts: MOCK_THREAT_ALERTS,
    dataSharingPolicies: MOCK_DATA_SHARING_POLICIES,
    apiKeys: MOCK_API_KEYS,
    trustedContacts: MOCK_TRUSTED_CONTACTS,
    securityAwarenessModules: MOCK_SECURITY_AWARENESS,
    transactionRules: MOCK_TRANSACTION_RULES,
    githubRepoFiles,
    fetchRepo,
    fetchDirectory: async () => {},
    isRepoLoading,
    initiateWireTransfer,
    initiateACHTransfer,
    logAuditAction,
  }), [
    view, transactions, assets, internalAccounts, notifications, simulationData, isImportingData, financialGoals, isWalletConnectModalOpen, detectedProviders, linkedAccounts, authorizedApps, 
    geminiApiKey, modernTreasuryApiKey, modernTreasuryOrganizationId, budgets, sovereignCredits, 
    marqetaCardProducts, isMarqetaLoading, marqetaApiToken, marqetaApiSecret, 
    dbConfig, webDriverStatus, githubRepoFiles, isRepoLoading, auditLogs,
    showNotification, askSovereignAI, broadcastEvent, connectDatabase, initiateWireTransfer, initiateACHTransfer, logAuditAction, fetchRepo, updateDbConfig
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};