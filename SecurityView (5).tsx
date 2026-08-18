import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton';
import { 
    LoginActivity, Device, DataSharingPolicy, TransactionRule, ThreatAlert, 
    AuditLogEntry, APIKey, TrustedContact, SecurityAwarenessModule, SecurityScoreMetric, UserProfile 
} from '../types';

// --- AI/ML & Future Tech Integration Placeholder Types (Massively Expanded) ---
interface AISecurityInsight {
    id: string;
    timestamp: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    summary: string;
    recommendation: string;
    sourceModel: string;
    relatedEntities: string[]; // e.g., ['dvc_1', 'user_abc']
}

interface HFTAlgorithmRule {
    id: string;
    name: string;
    description: string;
    targetAlgorithm: string;
    condition: string;
    action: 'PAUSE_ALGO' | 'ALERT_ONLY' | 'THROTTLE_ORDERS' | 'EXECUTE_COUNTER_TRADE';
    isEnabled: boolean;
    lastTriggered: string | null;
}

interface QuantumEncryptionStatus {
    id: string;
    systemComponent: string;
    algorithm: 'NTRU-HPS' | 'Kyber' | 'Dilithium' | 'SPHINCS+' | 'Legacy (RSA-4096)';
    status: 'MIGRATED' | 'PENDING' | 'AT_RISK' | 'FAILED';
    migrationEta: string;
    quantumThreatVector: string;
}

interface SecurityIncident {
    id: string;
    title: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'Investigating' | 'Resolved' | 'Contained';
    reportedBy: string;
    timestamp: string;
    assignedTo: string;
    summary: string;
}

// --- GEIN (Global Enterprise Intelligence Network) Types ---
interface GEINStreamChunk {
    id: string;
    timestamp: string;
    sourceNode: string;
    dataType: 'TRANSACTION' | 'LOG' | 'THREAT_SIG' | 'USER_BEHAVIOR' | 'NETWORK_PACKET';
    payload: string;
    geinScore: number; // 0-1 confidence score of relevance
}

interface GEINConsoleMessage {
    id: string;
    role: 'user' | 'gein' | 'system';
    text: string;
    isStreaming?: boolean;
}

interface CognitiveCoreStatus {
    name: string;
    status: 'NOMINAL' | 'DEGRADED' | 'OFFLINE' | 'THINKING';
    load: number; // Percentage
    primaryTask: string;
}

// --- Constants for Billion Dollar Features ---
const AI_INSIGHT_ENGINE_VERSION = "GEIN Cognitive Engine v3.0-Hydra";
const MAX_AUDIT_LOG_DISPLAY = 10;
const GLOBAL_LOCKDOWN_STATE = false; // Simulated global state

// --- Helper Components ---

export const SecuritySettingToggle: React.FC<{
    id: string;
    title: string;
    description: string;
    defaultChecked: boolean;
    onToggle?: (checked: boolean) => void;
    disabled?: boolean;
    aiImpact?: 'High' | 'Medium' | 'Low' | 'None';
}> = ({ id, title, description, defaultChecked, onToggle, disabled, aiImpact = 'None' }) => {
    const [isChecked, setIsChecked] = useState(defaultChecked);
    const { showSystemAlert } = useContext(DataContext) || {};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newState = e.target.checked;
        setIsChecked(newState);
        onToggle && onToggle(newState);
        
        if (showSystemAlert) {
            const impactColor = aiImpact === 'High' ? 'text-red-400' : aiImpact === 'Medium' ? 'text-yellow-400' : 'text-green-400';
            showSystemAlert(`Configuration Change Detected: ${title} set to ${newState ? 'Enabled' : 'Disabled'}. AI Risk Assessment: ${aiImpact}.`, 'info');
        }
    };

    const aiIndicator = useMemo(() => {
        if (aiImpact === 'None') return null;
        const colorMap = {
            High: 'bg-red-500',
            Medium: 'bg-yellow-500',
            Low: 'bg-blue-500',
        };
        return (
            <span className={`ml-3 px-2 py-0.5 text-xs font-bold rounded-full text-white ${colorMap[aiImpact]}`}>
                AI {aiImpact}
            </span>
        );
    }, [aiImpact]);

    return (
        <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800/70">
            <div className="flex-grow">
                <label htmlFor={`toggle-${id}`} className="font-bold text-lg text-white cursor-pointer flex items-center">
                    {title}
                    {aiIndicator}
                </label>
                <p className="text-sm text-gray-400 max-w-xl mt-1">{description}</p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
                <span className={`mr-3 text-sm font-medium ${isChecked ? 'text-green-400' : 'text-red-400'}`}>
                    {isChecked ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <input
                    type="checkbox"
                    id={`toggle-${id}`}
                    className="toggle toggle-cyan toggle-lg"
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    aria-label={`Toggle for ${title}`}
                />
            </div>
        </li>
    );
};

export const NotificationToast: React.FC<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'critical';
    onClose: () => void;
    isVisible: boolean;
}> = ({ message, type, onClose, isVisible }) => {
    const typeClasses = {
        success: 'bg-green-700 border-green-500',
        error: 'bg-red-700 border-red-500',
        info: 'bg-blue-700 border-blue-500',
        warning: 'bg-yellow-700 border-yellow-500',
        critical: 'bg-purple-800 border-purple-500'
    };
    
    const iconMap = {
        success: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        error: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        info: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        warning: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.938 5.002c-.77-1.333-2.688-1.333-3.458 0L3.308 18.002c-.77 1.333.192 3 1.732 3z" /></svg>,
        critical: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.938 5.002c-.77-1.333-2.688-1.333-3.458 0L3.308 18.002c-.77 1.333.192 3 1.732 3z" /></svg>
    };

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isVisible) {
            const duration = type === 'critical' ? 15000 : 7000;
            timer = setTimeout(() => { onClose(); }, duration);
        }
        return () => clearTimeout(timer);
    }, [isVisible, onClose, type]);

    if (!isVisible) return null;
    return (
        <div className={`fixed bottom-8 right-8 p-5 rounded-xl shadow-2xl text-white flex items-start space-x-4 transition-all duration-500 ease-out transform border-l-8 ${typeClasses[type]} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`} style={{zIndex: 1000, minWidth: '300px'}}>
            <div className="flex-shrink-0 mt-1">
                {iconMap[type]}
            </div>
            <div className="flex-grow">
                <span className="text-sm font-bold block capitalize">{type} Alert</span>
                <span className="text-base font-medium">{message}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20 focus:outline-none flex-shrink-0 mt-0.5 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const AISecurityInsightCard: React.FC<{ insight: AISecurityInsight }> = ({ insight }) => {
    const severityClasses = {
        Critical: 'border-red-600 bg-red-900/20 text-red-300',
        High: 'border-orange-600 bg-orange-900/20 text-orange-300',
        Medium: 'border-yellow-600 bg-yellow-900/20 text-yellow-300',
        Low: 'border-green-600 bg-green-900/20 text-green-300',
    };

    return (
        <div className={`p-4 rounded-xl border-l-4 shadow-lg transition-all duration-300 hover:shadow-xl ${severityClasses[insight.severity]}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-extrabold text-lg">{insight.summary}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${severityClasses[insight.severity].replace('border-', 'bg-').replace('/20', '/40')}`}>{insight.severity}</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">{insight.recommendation}</p>
            <div className="text-xs text-gray-400 flex justify-between border-t border-current pt-2 mt-2">
                <span>Engine: {insight.sourceModel}</span>
                <span>Detected: {new Date(insight.timestamp).toLocaleString()}</span>
            </div>
        </div>
    );
};

// --- Main Component ---

const SecurityView: React.FC = () => {
    const context = useContext(DataContext);
    const { 
        linkedAccounts, unlinkAccount, handlePlaidSuccess, 
        securityMetrics, auditLogs, threatAlerts, 
        dataSharingPolicies, apiKeys, trustedContacts, 
        securityAwarenessModules, showSystemAlert 
    } = context || {};

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' | 'critical'; isVisible: boolean } | null>(null);
    const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [aiInsights, setAiInsights] = useState<AISecurityInsight[]>([]);
    const [hftRules, setHftRules] = useState<HFTAlgorithmRule[]>([]);
    const [quantumStatuses, setQuantumStatuses] = useState<QuantumEncryptionStatus[]>([]);
    const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'keys' | 'ai_analysis' | 'hft' | 'quantum' | 'incidents' | 'gein_command'>('overview');
    const [securityScore, setSecurityScore] = useState<number>(75);

    // --- GEIN State ---
    const [geinConsoleHistory, setGeinConsoleHistory] = useState<GEINConsoleMessage[]>([]);
    const [geinInputStream, setGeinInputStream] = useState<GEINStreamChunk[]>([]);
    const [geinSystemInstruction, setGeinSystemInstruction] = useState<string>("You are GEIN, a global enterprise intelligence network. Your purpose is to provide unparalleled, real-time security analysis with a focus on predictive threat mitigation. Be concise, authoritative, and data-driven.");
    const [geinThinkingBudget, setGeinThinkingBudget] = useState<number>(5000); // Default budget
    const [cognitiveCores, setCognitiveCores] = useState<CognitiveCoreStatus[]>([]);
    const [geinConsoleInput, setGeinConsoleInput] = useState<string>("");

    // --- Mock Data Initialization & AI Simulation ---
    useEffect(() => {
        const now = new Date();
        const pastDate = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

        setLoginActivity([
            { id: '1', device: 'Quantum Workstation', browser: 'Chrome 125 (Secure)', os: 'Linux Kernel 6.8', location: 'HQ Server Room', ip: '10.0.0.5', timestamp: pastDate(0.01), isCurrent: true, userAgent: 'EnterpriseAgent/1.0' },
            { id: '2', device: 'Personal Mobile', browser: 'Safari', os: 'iOS 18.0 Beta', location: 'Remote Office', ip: '203.0.113.45', timestamp: pastDate(1.5), isCurrent: false, userAgent: 'MobileSafari/605.1.15' },
            { id: '3', device: 'Legacy VM', browser: 'IE 11', os: 'Windows Server 2012', location: 'Decommissioned Zone', ip: '192.168.1.100', timestamp: pastDate(15), isCurrent: false, userAgent: 'MSIE 11.0;' },
        ]);

        setDevices([
            { id: 'dvc_1', name: 'Primary Workstation', type: 'Desktop', model: 'Custom Build X9', lastActivity: pastDate(0.01), location: 'HQ Server Room', ip: '10.0.0.5', isCurrent: true, permissions: ['read_all', 'write_transactions', 'admin_config'], status: 'active', firstSeen: pastDate(500), userAgent: 'EnterpriseAgent/1.0', pushNotificationsEnabled: true, biometricAuthEnabled: true, encryptionStatus: 'AES-256-GCM' },
            { id: 'dvc_2', name: 'Executive Tablet', type: 'Tablet', model: 'Pad Pro 14', lastActivity: pastDate(0.5), location: 'Remote Office', ip: '203.0.113.45', isCurrent: false, permissions: ['read_reports'], status: 'active', firstSeen: pastDate(120), userAgent: 'MobileSafari/605.1.15', pushNotificationsEnabled: false, biometricAuthEnabled: true, encryptionStatus: 'full' },
        ]);

        setAiInsights([
            { id: 'ai_001', timestamp: pastDate(0.1), severity: 'High', summary: 'Unusual Data Access Pattern Detected', recommendation: 'Review recent read operations from Device ID dvc_2 between 02:00 and 04:00 UTC. Initiate temporary read-only lock.', sourceModel: 'BehavioralAnomaly_v3', relatedEntities: ['dvc_2'] },
            { id: 'ai_002', timestamp: pastDate(1), severity: 'Medium', summary: 'Outdated OS Detected on Active Device', recommendation: 'Update OS on "Legacy VM" (IP 192.168.1.100) to a supported version or isolate it to a sandbox network segment.', sourceModel: 'VulnerabilityScanner_v1', relatedEntities: ['dvc_3'] },
            { id: 'ai_003', timestamp: pastDate(2), severity: 'Critical', summary: 'Potential HFT Algo Manipulation Detected', recommendation: 'Circuit breaker triggered for "MomentumBot_v9". Review order book for spoofing patterns. All related API keys have been frozen.', sourceModel: 'MarketIntegrity_v4', relatedEntities: ['hft_rule_1', 'api_key_2'] },
        ]);

        setHftRules([
            { id: 'hft_rule_1', name: 'Flash Crash Circuit Breaker', description: 'Automatically pauses all trading algorithms if market index drops > 5% in 2 minutes.', targetAlgorithm: 'All', condition: 'INDEX_DROP > 5%', action: 'PAUSE_ALGO', isEnabled: true, lastTriggered: pastDate(2) },
            { id: 'hft_rule_2', name: 'Latency Anomaly Alert', description: 'Alerts trading desk if order execution latency exceeds 10ms for any algorithm.', targetAlgorithm: 'All', condition: 'LATENCY > 10ms', action: 'ALERT_ONLY', isEnabled: true, lastTriggered: pastDate(0.2) },
            { id: 'hft_rule_3', name: 'Counter-Trade on Spoofing', description: 'Executes a small counter-trade if AI detects high-confidence order book spoofing.', targetAlgorithm: 'MarketMaker_v3', condition: 'AI_SPOOF_CONFIDENCE > 0.95', action: 'EXECUTE_COUNTER_TRADE', isEnabled: false, lastTriggered: null },
        ]);

        setQuantumStatuses([
            { id: 'qs_1', systemComponent: 'Core Transaction Ledger', algorithm: 'Dilithium', status: 'MIGRATED', migrationEta: 'Complete', quantumThreatVector: 'Shor\'s Algorithm' },
            { id: 'qs_2', systemComponent: 'API Key Vault', algorithm: 'Kyber', status: 'PENDING', migrationEta: 'Q3 2025', quantumThreatVector: 'Shor\'s Algorithm' },
            { id: 'qs_3', systemComponent: 'User Authentication DB', algorithm: 'NTRU-HPS', status: 'MIGRATED', migrationEta: 'Complete', quantumThreatVector: 'Grover\'s Algorithm' },
            { id: 'qs_4', systemComponent: 'Legacy Reporting System', algorithm: 'Legacy (RSA-4096)', status: 'AT_RISK', migrationEta: 'Q1 2026', quantumThreatVector: 'Shor\'s Algorithm' },
        ]);

        setIncidents([
            { id: 'inc_1', title: 'Phishing Attempt on Executive Account', severity: 'Medium', status: 'Resolved', reportedBy: 'user_jane_doe', timestamp: pastDate(5), assignedTo: 'secops_team_a', summary: 'Targeted phishing email detected and blocked. User credentials rotated as a precaution.' },
            { id: 'inc_2', title: 'DDoS Attack on Public API Gateway', severity: 'High', status: 'Contained', reportedBy: 'SYSTEM_MONITOR', timestamp: pastDate(1), assignedTo: 'netops_team', summary: 'Volumetric attack mitigated by cloud provider. Monitoring for residual effects.' },
        ]);

        // GEIN Initialization
        setGeinConsoleHistory([{ id: 'init', role: 'system', text: 'GEIN Cognitive Engine v3.0-Hydra online. Awaiting operator command.' }]);
        setCognitiveCores([
            { name: 'Predictive Analytics', status: 'NOMINAL', load: 78, primaryTask: 'Market Volatility Forecasting' },
            { name: 'Threat Correlation', status: 'NOMINAL', load: 65, primaryTask: 'Cross-referencing Dark Web Intel' },
            { name: 'Quantum Heuristics', status: 'NOMINAL', load: 42, primaryTask: 'Simulating PQC Algorithm Failure Modes' },
            { name: 'Behavioral Biometrics', status: 'DEGRADED', load: 95, primaryTask: 'Re-calibrating User Keystroke Dynamics' },
        ]);

        if (securityMetrics && securityMetrics.length > 0) {
            const scoreMetric = securityMetrics.find(m => m.metricName === 'OverallSecurityScore');
            if (scoreMetric) setSecurityScore(Math.round(parseFloat(scoreMetric.currentValue) * 100));
        }

        // Simulate GEIN data stream
        const streamInterval = setInterval(() => {
            const dataTypes: GEINStreamChunk['dataType'][] = ['TRANSACTION', 'LOG', 'THREAT_SIG', 'USER_BEHAVIOR', 'NETWORK_PACKET'];
            const sources = ['LD4', 'AWS-US-EAST-1', 'HK-EXCHANGE', 'DARK-WEB-MONITOR', 'INTERNAL-AUDIT'];
            const newChunk: GEINStreamChunk = {
                id: `strm_${Date.now()}`,
                timestamp: new Date().toISOString(),
                sourceNode: sources[Math.floor(Math.random() * sources.length)],
                dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
                payload: `0x${[...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                geinScore: Math.random(),
            };
            setGeinInputStream(prev => [newChunk, ...prev.slice(0, 99)]);
        }, 1500);

        return () => clearInterval(streamInterval);

    }, [securityMetrics]);

    // --- Handlers ---
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' | 'critical') => {
        setNotification({ message, type, isVisible: true });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    }, []);

    const handleUnlink = (id: string) => {
        if (unlinkAccount) {
            unlinkAccount(id);
            showNotification(`Financial Source ID ${id} successfully revoked access.`, 'success');
        }
    };

    const handlePolicyToggle = (policy: DataSharingPolicy, enabled: boolean) => {
        console.log(`Policy ${policy.policyId} toggled to ${enabled}`);
        showNotification(`Data Sharing Policy "${policy.policyName}" updated to ${enabled ? 'Active' : 'Inactive'}.`, 'info');
    };

    const handleAPIKeyRevoke = (keyId: string) => {
        showNotification(`API Key ${keyId.substring(0, 8)}... has been immediately revoked and invalidated.`, 'critical');
    };

    const handleGlobalLockdown = () => {
        const confirmation = window.confirm("CRITICAL ACTION: Are you sure you want to initiate Global Lockdown Protocol? This will immediately freeze all transactions, terminate all user sessions, and restrict API access.");
        if (confirmation) {
            showNotification("GLOBAL LOCKDOWN PROTOCOL INITIATED. System entering restricted state.", 'critical');
            // In a real app, this would trigger a series of critical API calls.
        }
    };

    const handleGeinQuery = async () => {
        if (!geinConsoleInput.trim()) return;

        const userMessage: GEINConsoleMessage = { id: `user_${Date.now()}`, role: 'user', text: geinConsoleInput };
        setGeinConsoleHistory(prev => [...prev, userMessage]);
        setGeinConsoleInput("");

        // Simulate GEIN "thinking" and streaming response
        const geinResponseId = `gein_${Date.now()}`;
        const thinkingMessage: GEINConsoleMessage = { id: geinResponseId, role: 'gein', text: '', isStreaming: true };
        setGeinConsoleHistory(prev => [...prev, thinkingMessage]);

        const responseChunks = [
            "Analyzing query against ",
            `${geinInputStream.length} real-time data points... `,
            "Correlating with active threat vectors... ",
            "CONFIRMED: The anomalous activity on dvc_2 correlates with a new zero-day exploit signature (CVE-2025-9999) detected by the Dark Web Monitor node. ",
            "RECOMMENDATION: Isolate dvc_2 immediately. ",
            "Execute containment protocol 'Chimera'. ",
            "I have already drafted the execution plan. Awaiting your authorization."
        ];

        let currentText = "";
        for (const chunk of responseChunks) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
            currentText += chunk;
            setGeinConsoleHistory(prev => prev.map(msg => 
                msg.id === geinResponseId ? { ...msg, text: currentText } : msg
            ));
        }

        setGeinConsoleHistory(prev => prev.map(msg => 
            msg.id === geinResponseId ? { ...msg, isStreaming: false } : msg
        ));
    };

    // --- Render Helpers ---

    const renderLinkedAccounts = useMemo(() => (
        <Card title="Financial Data Sources (Plaid Integration)" className="lg:col-span-2">
            <div className="space-y-4">
                <p className="text-gray-400 text-sm border-b border-gray-800 pb-3">Securely manage connections to external financial institutions via encrypted tokenization. Last sync: {new Date().toLocaleTimeString()}</p>
                {linkedAccounts && linkedAccounts.length > 0 ? (
                    <div className="space-y-3">
                        {linkedAccounts.map(account => (
                            <div key={account.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-800/70 rounded-lg border border-cyan-700/50 shadow-md">
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-900/70 flex items-center justify-center text-cyan-300 mr-4 flex-shrink-0">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">Institution ID: {account.institutionId} | Mask: {account.mask}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-2 sm:mt-0">
                                    <button onClick={() => showNotification(`Initiating re-authentication for ${account.name}...`, 'info')} className="px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 rounded-lg text-sm transition-colors border border-indigo-700">Re-sync</button>
                                    <button onClick={() => handleUnlink(account.id)} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900/70 text-red-300 rounded-lg text-sm transition-colors border border-red-700">Revoke Access</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-gray-800/50 rounded-lg text-center border border-dashed border-gray-700">
                        <p className="text-gray-500 italic mb-3">No external financial data sources are currently integrated.</p>
                        {handlePlaidSuccess && <PlaidLinkButton onSuccess={handlePlaidSuccess} label="Connect New Financial Source" className="w-full sm:w-auto" />}
                    </div>
                )}
            </div>
        </Card>
    ), [linkedAccounts, handlePlaidSuccess, handleUnlink, showNotification]);

    const renderSecuritySettings = useMemo(() => (
        <Card title="Core Authentication & Access Controls" className="lg:col-span-1">
            <ul className="divide-y divide-gray-700/50">
                <SecuritySettingToggle id="2fa_quantum" title="Quantum 2FA (Hardware Key Required)" description="Mandatory FIDO2/WebAuthn hardware key enforcement for all administrative roles. Software TOTP is deprecated." defaultChecked={true} aiImpact='High' />
                <SecuritySettingToggle id="biometric_device" title="Device Biometric Trust" description="Enforce device-level biometric verification for any transaction exceeding $10,000 or configuration change." defaultChecked={true} aiImpact='Medium' />
                <SecuritySettingToggle id="session_timeout" title="Zero-Trust Session Invalidation" description="Sessions automatically terminate after 15 minutes of inactivity, requiring re-authentication via context-aware challenge." defaultChecked={true} aiImpact='High' />
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800/70">
                     <div className="flex-grow">
                        <span className="font-bold text-lg text-white flex items-center">Master Credential Management</span>
                        <p className="text-sm text-gray-400">Last rotation: 2024-01-15. Next mandatory rotation: 2025-01-15.</p>
                     </div>
                     <button className="px-6 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg mt-2 sm:mt-0">Initiate Credential Rotation Protocol</button>
                </li>
            </ul>
        </Card>
    ), []);

    const renderRecentActivity = useMemo(() => (
        <Card title="Real-Time Login Telemetry" className="lg:col-span-1">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loginActivity.map(activity => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-gray-800/50 rounded-lg border-l-4 border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-white truncate flex items-center gap-2">{activity.device}{activity.isCurrent && <span className="px-2 py-0.5 bg-green-600/50 text-green-200 text-xs rounded-full font-medium flex-shrink-0">LIVE SESSION</span>}</p>
                            <p className="text-xs text-gray-400 mt-1"><span className="font-mono bg-gray-700/50 px-1 rounded mr-1">{activity.ip}</span> @ {activity.location} ({activity.os})</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                    </div>
                ))}
            </div>
        </Card>
    ), [loginActivity]);

    const renderActiveDevices = useMemo(() => (
        <Card title="Managed Endpoints Inventory" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {devices.map(device => (
                    <div key={device.id} className="p-4 bg-gray-800/50 rounded-lg border border-indigo-700/50 flex flex-col shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-900/70 rounded-lg flex items-center justify-center text-indigo-300 flex-shrink-0">{device.type === 'Mobile' ? (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>) : (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>)}</div>
                                <p className="font-bold text-white truncate">{device.name}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${device.status === 'active' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>{device.status.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">Model: {device.model} ({device.type})</p>
                        <p className="text-xs text-gray-500 truncate">IP: {device.ip} | Last Seen: {new Date(device.lastActivity).toLocaleTimeString()}</p>
                        <div className="mt-3 pt-2 border-t border-gray-700">
                            <p className="text-xs font-semibold text-cyan-400">Permissions Granted: {device.permissions.length}</p>
                            <div className="flex flex-wrap gap-1 mt-1">{device.permissions.slice(0, 3).map(p => (<span key={p} className="text-[10px] bg-gray-700 text-gray-300 px-1 rounded">{p}</span>))}{device.permissions.length > 3 && <span className="text-[10px] text-gray-500">+{device.permissions.length - 3} more</span>}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    ), [devices]);

    const renderDataPolicies = useMemo(() => (
        <Card title="Data Governance & Sharing Policies" className="lg:col-span-2">
            <p className="text-sm text-gray-400 mb-4">Define granular controls over how internal and external data sets are processed, stored, and shared. Managed by AI Policy Engine.</p>
            <div className="space-y-4">
                {(dataSharingPolicies || []).map(policy => (
                    <div key={policy.policyId} className="p-4 bg-gray-800/70 rounded-lg border border-purple-700/50 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-grow mb-2 md:mb-0">
                            <p className="font-bold text-white text-lg">{policy.policyName}</p>
                            <p className="text-xs text-gray-400 mt-1">Scope: {policy.scope} | Last Reviewed: {policy.lastReviewed}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`text-sm font-semibold ${policy.isActive ? 'text-green-400' : 'text-red-400'}`}>{policy.isActive ? 'ACTIVE' : 'DRAFT'}</span>
                            <SecuritySettingToggle id={`policy-${policy.policyId}`} title="Enable Policy" description={`Toggle activation for ${policy.policyName}`} defaultChecked={policy.isActive} onToggle={(checked) => handlePolicyToggle(policy, checked)} aiImpact='Medium' />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    ), [dataSharingPolicies, handlePolicyToggle]);

    const renderAPIKeys = useMemo(() => (
        <Card title="System API Key Management" className="lg:col-span-2">
            <p className="text-sm text-gray-400 mb-4">Manage programmatic access tokens. Keys are automatically rotated by the Quantum Key Vault every 90 days.</p>
            <div className="space-y-3">
                {(apiKeys || []).map(key => (
                    <div key={key.id} className="flex justify-between items-center p-3 bg-gray-800/70 rounded-lg border border-yellow-700/50">
                        <div className="flex items-center min-w-0">
                            <svg className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M6 16h.01" /></svg>
                            <div>
                                <p className="font-mono text-sm text-white truncate">{key.keyName} ({key.id.substring(0, 8)}...)</p>
                                <p className="text-xs text-gray-500">Created: {key.creationDate} | Permissions: {key.scopes.join(', ')}</p>
                            </div>
                        </div>
                        <button onClick={() => handleAPIKeyRevoke(key.id)} className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-md text-xs transition-colors flex-shrink-0 ml-4">Revoke Now</button>
                    </div>
                ))}
            </div>
        </Card>
    ), [apiKeys, handleAPIKeyRevoke]);

    const renderAIAnalysis = useMemo(() => (
        <div className="space-y-6">
            <Card title={`AI Threat Intelligence Feed (${AI_INSIGHT_ENGINE_VERSION})`}>
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                    <p className="text-gray-400 text-sm">Real-time behavioral analysis and predictive threat modeling.</p>
                    <span className="text-sm font-bold text-cyan-400">Total Insights: {aiInsights.length}</span>
                </div>
                <div className="space-y-4">
                    {aiInsights.length > 0 ? (aiInsights.map(insight => (<AISecurityInsightCard key={insight.id} insight={insight} />))) : (<div className="p-6 bg-gray-800/50 rounded-lg text-center border border-dashed border-gray-700"><p className="text-gray-500 italic">AI Engine reports no immediate high-priority anomalies at this time.</p></div>)}
                </div>
            </Card>
            <Card title="Security Awareness Training Modules">
                <p className="text-sm text-gray-400 mb-4">Track mandatory compliance training completion status across the organization.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(securityAwarenessModules || []).map(module => (
                        <div key={module.moduleId} className="p-4 bg-gray-800/70 rounded-lg border border-green-700/50">
                            <p className="font-bold text-white">{module.title}</p>
                            <p className="text-xs text-gray-400 mt-1">Status: {module.completionRate}% Complete</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${module.completionRate}%` }}></div></div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    ), [aiInsights, securityAwarenessModules]);

    const renderAuditLogs = useMemo(() => {
        const displayLogs = (auditLogs || []).slice(0, MAX_AUDIT_LOG_DISPLAY);
        return (
            <Card title={`System Audit Trail (Last ${displayLogs.length} Entries)`} className="lg:col-span-2">
                <p className="text-sm text-gray-400 mb-3">Immutable record of all configuration changes, data access events, and administrative actions.</p>
                <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="sticky top-0 bg-gray-800 z-10"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User/System</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Target</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-800">{displayLogs.map((log: AuditLogEntry) => (<tr key={log.id} className="hover:bg-gray-800/50 transition-colors"><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{log.userId.includes('sys_') ? 'SYSTEM' : log.userId}</td><td className="px-4 py-2 text-sm text-cyan-400">{log.action}</td><td className="px-4 py-2 text-sm text-gray-400">{log.targetResource}</td><td className="px-4 py-2 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{log.success ? 'SUCCESS' : 'FAILURE'}</span></td></tr>))}</tbody>
                    </table>
                </div>
                {displayLogs.length < (auditLogs?.length || 0) && (<p className="text-center text-sm text-gray-500 mt-3">Displaying first {MAX_AUDIT_LOG_DISPLAY} logs. Load full history via dedicated Audit Console.</p>)}
            </Card>
        );
    }, [auditLogs]);

    const renderSecurityScoreGauge = useMemo(() => {
        const radius = 50; const circumference = 2 * Math.PI * radius; const offset = circumference - (securityScore / 100) * circumference; const color = securityScore >= 90 ? 'stroke-green-500' : securityScore >= 70 ? 'stroke-yellow-500' : 'stroke-red-500';
        return (
            <div className="flex flex-col items-center p-6 bg-gray-800/70 rounded-xl shadow-inner border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-3">Quantum Security Index (QSI)</h3>
                <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90"><circle cx="60" cy="60" r={radius} fill="transparent" stroke="#374151" strokeWidth="10" /><circle cx="60" cy="60" r={radius} fill="transparent" stroke={color.replace('stroke-', '')} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" /><text x="60" y="60" dominantBaseline="middle" textAnchor="middle" className="fill-current text-white" fontSize="20" fontWeight="bold">{securityScore}%</text></svg>
                <p className="text-sm text-gray-400 mt-2">Target: 95%</p>
            </div>
        );
    }, [securityScore]);

    const renderTrustedContacts = useMemo(() => (
        <Card title="Emergency Trusted Contacts" className="lg:col-span-1">
            <p className="text-sm text-gray-400 mb-4">Contacts authorized for emergency account recovery or high-risk alerts.</p>
            <div className="space-y-3">
                {(trustedContacts || []).map((contact: TrustedContact) => (
                    <div key={contact.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-pink-900/50 rounded-full flex items-center justify-center text-pink-300 mr-3"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                            <div><p className="font-semibold text-white">{contact.name}</p><p className="text-xs text-gray-400">{contact.relationship}</p></div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${contact.verified ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{contact.verified ? 'Verified' : 'Pending'}</span>
                    </div>
                ))}
            </div>
        </Card>
    ), [trustedContacts]);

    const renderHFTView = useMemo(() => (
        <Card title="High-Frequency Trading (HFT) Security Module">
            <p className="text-sm text-gray-400 mb-4">Real-time monitoring and automated circuit breakers for algorithmic trading infrastructure.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Algorithmic Kill Switches & Rules</h3>
                    {hftRules.map(rule => (
                        <div key={rule.id} className="p-4 bg-gray-800/70 rounded-lg border border-red-700/50">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg text-white">{rule.name}</p>
                                <SecuritySettingToggle id={`hft-${rule.id}`} title="" description="" defaultChecked={rule.isEnabled} />
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                            <div className="text-xs mt-2 pt-2 border-t border-gray-700 flex justify-between">
                                <span className="font-mono bg-gray-900 px-2 py-1 rounded">IF {rule.condition} THEN {rule.action}</span>
                                <span className="text-gray-500">Last Triggered: {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">System Latency</h3>
                    <div className="p-4 bg-gray-800/70 rounded-lg text-center">
                        <p className="text-5xl font-mono font-extrabold text-green-400">0.72ms</p>
                        <p className="text-sm text-gray-400">Exchange Co-location (LD4)</p>
                    </div>
                    <button className="w-full py-2 bg-blue-700 hover:bg-blue-600 rounded-lg font-semibold">Define New HFT Rule</button>
                </div>
            </div>
        </Card>
    ), [hftRules]);

    const renderQuantumView = useMemo(() => (
        <Card title="Quantum Threat Mitigation & Future Tech">
            <p className="text-sm text-gray-400 mb-4">Tracking the enterprise-wide migration to post-quantum cryptography (PQC) and other next-generation security paradigms.</p>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">System Component</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PQC Algorithm</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Migration ETA</th></tr></thead>
                    <tbody className="divide-y divide-gray-800">
                        {quantumStatuses.map(qs => (
                            <tr key={qs.id} className="hover:bg-gray-800/50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{qs.systemComponent}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-cyan-400">{qs.algorithm}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${qs.status === 'MIGRATED' ? 'bg-green-600/30 text-green-300' : qs.status === 'PENDING' ? 'bg-yellow-600/30 text-yellow-300' : 'bg-red-600/30 text-red-300'}`}>{qs.status}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{qs.migrationEta}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    ), [quantumStatuses]);

    const renderIncidentResponseView = useMemo(() => (
        <div className="space-y-6">
            <Card title="Incident Response & Emergency Protocols" className="border-2 border-red-500/50 shadow-red-500/20 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-red-900/30 rounded-lg">
                    <div>
                        <h3 className="text-xl font-extrabold text-red-300">Global Lockdown Protocol</h3>
                        <p className="text-red-400 max-w-2xl">Immediately freeze all transactions, terminate sessions, revoke temporary keys, and place the system in a restricted, audit-only state. REQUIRES C-LEVEL AUTHENTICATION.</p>
                    </div>
                    <button onClick={handleGlobalLockdown} className="mt-4 md:mt-0 px-8 py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-lg transition-transform hover:scale-105 shadow-lg flex-shrink-0">INITIATE LOCKDOWN</button>
                </div>
            </Card>
            <Card title="Active Security Incidents">
                <div className="space-y-4">
                    {incidents.map(incident => (
                        <div key={incident.id} className="p-4 bg-gray-800/70 rounded-lg border-l-4 border-yellow-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-white">{incident.title}</p>
                                    <p className="text-xs text-gray-400">Reported: {new Date(incident.timestamp).toLocaleString()} | Assigned: {incident.assignedTo}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${incident.status === 'Resolved' ? 'bg-green-600/30 text-green-300' : 'bg-yellow-600/30 text-yellow-300'}`}>{incident.status}</span>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{incident.summary}</p>
                        </div>
                    ))}
                    <button className="w-full py-3 bg-green-700 hover:bg-green-600 rounded-lg font-semibold text-lg">Report New Incident</button>
                </div>
            </Card>
        </div>
    ), [incidents]);

    const renderGeinCommandView = useMemo(() => (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
                <Card title="GEIN Command Console">
                    <div className="h-[600px] flex flex-col">
                        <div className="flex-grow p-4 bg-gray-900/70 rounded-t-lg overflow-y-auto custom-scrollbar space-y-4">
                            {geinConsoleHistory.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-800' : 'bg-gray-700'}`}>
                                        <p className="text-white whitespace-pre-wrap">{msg.text}{msg.isStreaming && <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1"></span>}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex p-2 bg-gray-800 rounded-b-lg border-t border-gray-700">
                            <input type="text" value={geinConsoleInput} onChange={(e) => setGeinConsoleInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleGeinQuery()} placeholder="Query GEIN... (e.g., 'Summarize anomalous activity on dvc_2')" className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none px-3" />
                            <button onClick={handleGeinQuery} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition-colors">Send</button>
                        </div>
                    </div>
                </Card>
                <Card title="GEIN Configuration">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">System Instruction</label>
                            <textarea value={geinSystemInstruction} onChange={(e) => setGeinSystemInstruction(e.target.value)} rows={5} className="w-full p-2 bg-gray-900 rounded-md text-sm text-gray-300 border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Thinking Budget: {geinThinkingBudget === 0 ? 'Disabled' : `${geinThinkingBudget} tokens`}</label>
                            <input type="range" min="0" max="10000" step="500" value={geinThinkingBudget} onChange={(e) => setGeinThinkingBudget(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            <p className="text-xs text-gray-500 mt-1">Controls enhanced quality processing. Higher values may increase latency and token usage. 0 disables thinking.</p>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="space-y-6">
                <Card title="Cognitive Core Status">
                    <div className="space-y-3">
                        {cognitiveCores.map(core => (
                            <div key={core.name} className="p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-white">{core.name}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${core.status === 'NOMINAL' ? 'bg-green-600/30 text-green-300' : 'bg-yellow-600/30 text-yellow-300'}`}>{core.status}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">Task: {core.primaryTask}</p>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2"><div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${core.load}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Real-Time Data Ingestion Stream">
                    <div className="h-[400px] overflow-y-auto custom-scrollbar space-y-2 font-mono text-xs">
                        {geinInputStream.map(chunk => (
                            <div key={chunk.id} className="flex gap-2 items-center text-gray-400">
                                <span className="text-gray-600">{new Date(chunk.timestamp).toLocaleTimeString()}</span>
                                <span className="text-purple-400 w-28 truncate">{chunk.sourceNode}</span>
                                <span className="text-cyan-400 w-24">{chunk.dataType}</span>
                                <span className="flex-grow truncate">{chunk.payload}</span>
                                <span style={{ color: `rgba(255, 255, 255, ${chunk.geinScore})` }}>{chunk.geinScore.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    ), [geinConsoleHistory, geinConsoleInput, geinSystemInstruction, geinThinkingBudget, cognitiveCores, geinInputStream, handleGeinQuery]);

    // --- Tab Content Rendering ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{renderSecurityScoreGauge}{renderRecentActivity}{renderActiveDevices}{renderLinkedAccounts}{renderSecuritySettings}</div>);
            case 'policies': return (<div className="grid grid-cols-1 gap-6">{renderDataPolicies}<Card title="Transaction Rule Engine"><p className="text-sm text-gray-400 mb-4">Define automated responses to financial events based on predefined risk thresholds.</p><div className="space-y-3">{(context?.transactionRules || []).map((rule: TransactionRule) => (<div key={rule.ruleId} className="p-3 bg-gray-800/70 rounded-lg border border-cyan-700/50 flex justify-between items-center"><div><p className="font-bold text-white">{rule.name}</p><p className="text-xs text-gray-400">Trigger: {rule.triggerCondition} | Action: {rule.action}</p></div><span className={`text-xs font-medium px-2 py-0.5 rounded ${rule.isEnabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{rule.isEnabled ? 'ACTIVE' : 'DISABLED'}</span></div>))}</div></Card></div>);
            case 'keys': return (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{renderAPIKeys}{renderTrustedContacts}<Card title="Threat Alert History" className="lg:col-span-3"><p className="text-sm text-gray-400 mb-4">Historical record of confirmed security incidents.</p><div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">{(threatAlerts || []).map((alert: ThreatAlert) => (<div key={alert.alertId} className="p-3 bg-red-900/30 rounded-lg border border-red-600 flex justify-between items-center"><div><p className="font-bold text-red-300">{alert.title}</p><p className="text-xs text-gray-300">{alert.description}</p></div><span className="text-xs text-gray-300">{new Date(alert.timestamp).toLocaleDateString()}</span></div>))}</div></Card></div>);
            case 'ai_analysis': return (<div className="grid grid-cols-1 gap-6">{renderAIAnalysis}{renderAuditLogs}</div>);
            case 'hft': return renderHFTView;
            case 'quantum': return renderQuantumView;
            case 'incidents': return renderIncidentResponseView;
            case 'gein_command': return renderGeinCommandView;
            default: return null;
        }
    };

    const tabs: { id: typeof activeTab, label: string }[] = [
        { id: 'overview', label: 'Overview & Access' }, { id: 'policies', label: 'Governance & Rules' }, { id: 'keys', label: 'API & Contacts' }, { id: 'ai_analysis', label: 'AI Threat Analysis' }, { id: 'hft', label: 'HFT Security' }, { id: 'quantum', label: 'Future Tech' }, { id: 'incidents', label: 'Incident Response' }, { id: 'gein_command', label: 'GEIN Command' },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-8">
            <header className="pb-4 border-b border-gray-700">
                <h1 className="text-4xl font-extrabold text-white tracking-tighter">Enterprise Security Command Center</h1>
                <p className="text-lg text-gray-400 mt-1">Centralized control plane for data integrity, access management, and threat mitigation. Engine: {AI_INSIGHT_ENGINE_VERSION}</p>
            </header>

            <div className="flex border-b border-gray-700 overflow-x-auto custom-scrollbar">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 text-lg font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'text-cyan-400 border-b-4 border-cyan-500' : 'text-gray-400 hover:text-white hover:border-b-4 hover:border-gray-600'}`}>{tab.label}</button>))}</div>

            <main>{renderContent()}</main>

            {notification && (<NotificationToast message={notification.message} type={notification.type} isVisible={notification.isVisible} onClose={closeNotification} />)}
        </div>
    );
};

export default SecurityView;