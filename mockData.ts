
import { 
    Transaction, Asset, BudgetCategory, Subscription, CreditScore, UpcomingBill, 
    SavingsGoal, MarketMover, FinancialGoal, CryptoAsset, PaymentOperation, 
    CorporateCard, CorporateTransaction, RewardPoints, Notification, RewardItem, 
    APIStatus, CreditFactor, Counterparty, UserProfile, AccountDetails, Portfolio, 
    SimulationResult, CorporateAnomaly, ComplianceReport, CashFlowForecast, 
    FraudRule, WebhookSubscription, APIKey, PortfolioAsset, FinancialAnomaly,
    SecurityScoreMetric, AuditLogEntry, ThreatAlert, DataSharingPolicy, TrustedContact,
    SecurityAwarenessModule, TransactionRule
} from '../types';
import { View } from '../types';

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', date: '2024-03-15', description: 'Apple Store', amount: 1299.00, type: 'expense', category: 'Shopping', currency: 'USD', metadata: { merchantName: 'Apple Store', carbonFootprint: 15, tags: ['Tech'], aiClassification: 'Shopping' } },
    { id: '2', date: '2024-03-14', description: 'Salary Deposit', amount: 5000.00, type: 'income', category: 'Income', currency: 'USD', metadata: { merchantName: 'Citibank', carbonFootprint: 0, tags: ['Income'], aiClassification: 'Income' } },
    { id: '3', date: '2024-03-12', description: 'Starbucks', amount: 5.50, type: 'expense', category: 'Dining', currency: 'USD', metadata: { merchantName: 'Starbucks', carbonFootprint: 0.5, tags: ['Coffee'], aiClassification: 'Dining' } },
    { id: '4', date: '2024-03-10', description: 'Uber', amount: 24.00, type: 'expense', category: 'Transport', currency: 'USD', metadata: { merchantName: 'Uber', carbonFootprint: 2, tags: ['Ride'], aiClassification: 'Transport' } },
    { id: '5', date: '2024-03-08', description: 'Whole Foods', amount: 145.20, type: 'expense', category: 'Groceries', currency: 'USD', metadata: { merchantName: 'Whole Foods', carbonFootprint: 5, tags: ['Food'], aiClassification: 'Groceries' } },
];

export const MOCK_ASSETS: PortfolioAsset[] = [
    { id: 'a1', name: 'Tech Growth ETF', value: 15400, color: '#06b6d4', performanceYTD: 12.5, assetClass: 'Stock', riskLevel: 'Medium' },
    { id: 'a2', name: 'Bitcoin Holdings', value: 8500, color: '#f59e0b', performanceYTD: 45.2, assetClass: 'CRYPTO', riskLevel: 'High' },
    { id: 'a3', name: 'Real Estate Fund', value: 22000, color: '#10b981', performanceYTD: 5.1, assetClass: 'Real Estate', riskLevel: 'Medium' },
    { id: 'a4', name: 'High Yield Savings', value: 10000, color: '#6366f1', performanceYTD: 4.5, assetClass: 'Cash', riskLevel: 'Low' },
];

export const MOCK_IMPACT_INVESTMENTS: Asset[] = [
    { id: 'i1', name: 'Green Energy Fund', value: 5000, color: '#4ade80', description: 'Renewable energy projects.', esgRating: 5, performanceYTD: 8.5, type: 'Impact' },
    { id: 'i2', name: 'Clean Water Initiative', value: 3000, color: '#2dd4bf', description: 'Global water access.', esgRating: 5, performanceYTD: 6.2, type: 'Impact' },
];

export const MOCK_BUDGETS: BudgetCategory[] = [
    { id: 'b1', name: 'Dining', limit: 500, spent: 350, color: '#f87171', remaining: 150, category: 'Dining', alerts: [] },
    { id: 'b2', name: 'Groceries', limit: 600, spent: 420, color: '#fbbf24', remaining: 180, category: 'Groceries', alerts: [] },
    { id: 'b3', name: 'Transport', limit: 300, spent: 100, color: '#60a5fa', remaining: 200, category: 'Transport', alerts: [] },
    { id: 'b4', name: 'Shopping', limit: 400, spent: 380, color: '#a78bfa', remaining: 20, category: 'Shopping', alerts: [] },
];

export const MOCK_CREDIT_SCORE: CreditScore = {
    score: 785,
    change: 12,
    rating: 'Excellent'
};

export const MOCK_FINANCIAL_GOALS: FinancialGoal[] = [
    { id: 'g1', name: 'Retirement 2050', targetAmount: 2000000, currentAmount: 150000, targetDate: '2050-01-01', status: 'on_track' },
    { id: 'g2', name: 'Buy a Home', targetAmount: 150000, currentAmount: 45000, targetDate: '2028-06-01', status: 'on_track' },
];

export const MOCK_REWARD_POINTS: RewardPoints = {
    balance: 12500,
    lastEarned: 150,
    lastRedeemed: 0,
    currency: 'PTS'
};

export const MOCK_REWARD_ITEMS: RewardItem[] = [
    { id: 'r1', name: '$50 Gift Card', cost: 5000, type: 'giftcard', description: 'Amazon Gift Card', iconName: 'gift' },
    { id: 'r2', name: 'Plant a Tree', cost: 500, type: 'impact', description: 'Donate to reforestation', iconName: 'leaf' },
    { id: 'r3', name: 'Statement Credit', cost: 1000, type: 'cashback', description: '$10 Cash Back', iconName: 'cash' },
];

export const MOCK_API_STATUS: APIStatus[] = [
    { provider: 'Google Gemini', status: 'Operational', responseTime: 120 },
    { provider: 'Plaid', status: 'Operational', responseTime: 450 },
    { provider: 'Stripe', status: 'Operational', responseTime: 230 },
    { provider: 'Modern Treasury', status: 'Operational', responseTime: 310 },
];

export const MOCK_CREDIT_FACTORS: CreditFactor[] = [
    { name: 'Payment History', status: 'Excellent', description: 'No missed payments.' },
    { name: 'Credit Utilization', status: 'Good', description: '15% utilization.' },
    { name: 'Credit Age', status: 'Fair', description: 'Average age 3 years.' },
];

export const MOCK_ANOMALIES: FinancialAnomaly[] = [
    {
        id: '1',
        description: 'Large wire transfer',
        details: 'A transfer of $50,000 was initiated to a new counterparty.',
        severity: 'High',
        status: 'Open',
        entityType: 'Transaction',
        entityId: 'tx_999',
        entityDescription: 'Wire Transfer to Unknown Entity',
        timestamp: new Date().toISOString(),
        riskScore: 85
    }
];

// --- Added Mock Data for Notifications and Security ---

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', message: 'New transaction detected in your primary checking account.', timestamp: '2 mins ago', read: false, severity: 'info' },
    { id: '2', message: 'Credit score updated. View your resonance report.', timestamp: '1 hour ago', read: false, severity: 'success', view: View.CreditHealth },
    { id: '3', message: 'Potential anomaly detected in SWIFT flow.', timestamp: '3 hours ago', read: true, severity: 'warning' },
];

export const MOCK_SECURITY_METRICS: SecurityScoreMetric[] = [
    { metricName: 'OverallSecurityScore', currentValue: '0.92' },
    { metricName: 'EncryptionDepth', currentValue: '256-bit' },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: '1', timestamp: new Date().toISOString(), userId: 'James', action: 'LOGIN', targetResource: 'Nexus OS', success: true },
    { id: '2', timestamp: new Date().toISOString(), userId: 'sys_auth', action: 'ROTATE_KEYS', targetResource: 'Vault', success: true },
];

export const MOCK_THREAT_ALERTS: ThreatAlert[] = [
    { alertId: '1', title: 'Geo-mismatch', description: 'Attempt from unrecognized region.', timestamp: new Date().toISOString() },
];

export const MOCK_DATA_SHARING_POLICIES: DataSharingPolicy[] = [
    { policyId: '1', policyName: 'Aggregate Analytics', scope: 'Global', lastReviewed: '2024-01-01', isActive: true },
];

export const MOCK_API_KEYS: APIKey[] = [
    { id: 'key_1', keyName: 'Prod-Read-Only', creationDate: '2023-05-10', scopes: ['read'] },
];

export const MOCK_TRUSTED_CONTACTS: TrustedContact[] = [
    { id: '1', name: 'Security Ops', relationship: 'Internal', verified: true },
];

export const MOCK_SECURITY_AWARENESS: SecurityAwarenessModule[] = [
    { moduleId: '1', title: 'Phishing Defense', completionRate: 100 },
];

export const MOCK_TRANSACTION_RULES: TransactionRule[] = [
    { ruleId: '1', name: 'Velocity Limit', triggerCondition: 'amount > 50k', action: 'BLOCK', isEnabled: true },
];
