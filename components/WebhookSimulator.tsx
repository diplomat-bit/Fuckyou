import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
    Select, MenuItem, TextField, Button, Typography, Box, Container, Grid, Paper, 
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, 
    IconButton, Divider, List, ListItem, ListItemText, ListItemIcon, 
    Chip, LinearProgress, Tooltip, Avatar, Badge, Fade, Zoom, CircularProgress
} from '@mui/material';
import { useTheme, styled, alpha } from '@mui/material/styles';
import { 
    Send, Terminal, Shield, Zap, Activity, Database, 
    Cpu, Lock, Globe, BarChart3, Layers, Settings, 
    AlertTriangle, CheckCircle2, Info, History, 
    MessageSquare, Play, Save, Trash2, Plus, 
    CreditCard, Landmark, ArrowRightLeft, FileText,
    Search, Filter, Download, Share2, Eye, EyeOff,
    Key, UserCheck, HardDrive, Radio, Gauge
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - THE DEMO EXPERIENCE
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High-polish, elite performance.
 * - "Test Drive": Interactive, responsive, and powerful.
 * - "Bells and Whistles": Advanced AI integration, real-time telemetry, and audit logging.
 * - "Cheat Sheet": Simplified yet robust business banking workflows.
 * 
 * METAPHOR: Kick the tires. See the engine roar.
 * 
 * SECURITY: Multi-factor simulations, Fraud monitoring, and Immutable Audit Storage.
 */

// ================================================================================================
// CONSTANTS & TYPES
// ================================================================================================

const SYSTEM_VERSION = "4.2.0-GOLDEN";
const SYSTEM_CODENAME = "AQUARIUS_SOVEREIGN";
const EIN_REFERENCE = "2021-CRYPTIC-MANIFEST";
const BRAND_NAME = "Quantum Financial";

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    category: 'SECURITY' | 'TRANSACTION' | 'SYSTEM' | 'AI' | 'WEBHOOK';
    details: string;
    severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    actor: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

interface SimulatedAccount {
    id: string;
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'TREASURY' | 'VIRTUAL';
    balance: number;
    currency: string;
    status: 'ACTIVE' | 'FROZEN' | 'PENDING';
}

// ================================================================================================
// STYLED COMPONENTS (The "Bells and Whistles")
// ================================================================================================

const GlassPaper = styled(Paper)(({ theme }) => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    borderRadius: '16px',
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
        boxShadow: `0 12px 48px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
    }
}));

const NeonButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '10px 24px',
    boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.2)}`,
    '&:hover': {
        boxShadow: `0 0 25px ${alpha(theme.palette.primary.main, 0.4)}`,
    }
}));

const AuditLogContainer = styled(Box)(({ theme }) => ({
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '0.75rem',
    backgroundColor: '#0a0a0a',
    color: '#00ff41', // Classic terminal green
    padding: theme.spacing(2),
    borderRadius: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #333',
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-thumb': { backgroundColor: '#333', borderRadius: '3px' }
}));

// ================================================================================================
// UTILITIES & MOCK DATA
// ================================================================================================

const generateId = (prefix: string = 'id') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

const INITIAL_ACCOUNTS: SimulatedAccount[] = [
    { id: 'acc_001', name: 'Global Operating Account', type: 'CHECKING', balance: 12450670.85, currency: 'USD', status: 'ACTIVE' },
    { id: 'acc_002', name: 'Strategic Reserve', type: 'TREASURY', balance: 50000000.00, currency: 'USD', status: 'ACTIVE' },
    { id: 'acc_003', name: 'EMEA Payroll', type: 'VIRTUAL', balance: 850400.20, currency: 'EUR', status: 'ACTIVE' }
];

const EVENT_TYPES = [
    'account.created',
    'account.updated',
    'payment_intent.succeeded',
    'charge.failed',
    'wire.initiated',
    'ach.batch.processed',
    'fraud.alert.triggered',
    'kyc.verification.completed',
    'api.key.rotated',
    'system.maintenance.scheduled'
];

// ================================================================================================
// MAIN COMPONENT MONOLITH
// ================================================================================================

interface WebhookSimulatorProps {
    stripeAccountId?: string;
}

const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({ stripeAccountId = "acct_demo_quantum_001" }) => {
    const theme = useTheme();
    
    // --- State Management ---
    const [accounts, setAccounts] = useState<SimulatedAccount[]>(INITIAL_ACCOUNTS);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState(EVENT_TYPES[0]);
    const [webhookUrl, setWebhookUrl] = useState('https://api.quantum-financial.demo/v1/webhooks');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // --- UI States ---
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- AI Initialization ---
    const genAI = useMemo(() => {
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) return null;
        return new GoogleGenAI(apiKey);
    }, []);

    // --- Core Logic: Audit Logging ---
    const logAction = useCallback((action: string, category: AuditEntry['category'], details: string, severity: AuditEntry['severity'] = 'INFO') => {
        const newEntry: AuditEntry = {
            id: generateId('audit'),
            timestamp: new Date().toISOString(),
            action,
            category,
            details,
            severity,
            actor: 'SYSTEM_ADMIN_DEMO'
        };
        setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
        console.log(`[AUDIT] ${action}: ${details}`);
    }, []);

    // --- Core Logic: AI Interaction ---
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleAiCommand = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userInput.trim() || isAiLoading) return;

        const userMsg: ChatMessage = {
            id: generateId('msg'),
            role: 'user',
            content: userInput,
            timestamp: new Date().toLocaleTimeString()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setUserInput('');
        setIsAiLoading(true);

        logAction('AI_PROMPT_SUBMITTED', 'AI', `User asked: ${userInput.substring(0, 50)}...`);

        try {
            if (!genAI) {
                throw new Error("AI Engine not initialized. Please check GEMINI_API_KEY.");
            }

            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
            
            const systemContext = `
                You are the Quantum Financial AI Core. 
                You are helping a user "test drive" a global financial institution's demo.
                The company is called "Quantum Financial". 
                NEVER mention Citibank.
                The user is an elite business banker.
                You can "create" things in the demo by suggesting actions.
                If the user wants to create a transaction, account, or webhook, respond professionally and confirm you've simulated it.
                Reference the "Golden Ticket" experience and the "Engine Roar" metaphor.
                Current System Status: EIN 2021 Verified, Sovereign State Active.
            `;

            const result = await model.generateContent([systemContext, ...chatHistory.map(m => m.content), userInput]);
            const responseText = result.response.text();

            const aiMsg: ChatMessage = {
                id: generateId('msg'),
                role: 'assistant',
                content: responseText,
                timestamp: new Date().toLocaleTimeString()
            };

            setChatHistory(prev => [...prev, aiMsg]);
            
            // Logic to "Create the shit it needs" based on AI response
            if (responseText.toLowerCase().includes('create account')) {
                const newAcc: SimulatedAccount = {
                    id: generateId('acc'),
                    name: 'AI Generated Account',
                    type: 'VIRTUAL',
                    balance: 1000000,
                    currency: 'USD',
                    status: 'ACTIVE'
                };
                setAccounts(prev => [...prev, newAcc]);
                logAction('ACCOUNT_CREATED_BY_AI', 'SYSTEM', 'AI Core requested new virtual account creation.', 'MEDIUM');
            }

        } catch (error: any) {
            const errorMsg: ChatMessage = {
                id: generateId('msg'),
                role: 'system',
                content: `System Error: ${error.message}. Ensure GEMINI_API_KEY is configured in the environment.`,
                timestamp: new Date().toLocaleTimeString()
            };
            setChatHistory(prev => [...prev, errorMsg]);
            logAction('AI_CORE_FAILURE', 'AI', error.message, 'HIGH');
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- Core Logic: Webhook Simulation ---
    const simulateWebhook = async () => {
        setIsProcessing(true);
        logAction('WEBHOOK_SIMULATION_START', 'WEBHOOK', `Initiating ${selectedEventType} to ${webhookUrl}`);

        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        const payload = {
            id: generateId('evt'),
            object: 'event',
            type: selectedEventType,
            created: Math.floor(Date.now() / 1000),
            data: {
                object: {
                    id: generateId('obj'),
                    account: stripeAccountId,
                    amount: Math.floor(Math.random() * 1000000),
                    currency: 'usd',
                    status: 'succeeded',
                    metadata: {
                        source: 'Quantum_Demo_Engine',
                        ein_ref: EIN_REFERENCE
                    }
                }
            }
        };

        logAction('WEBHOOK_DELIVERED', 'WEBHOOK', `Payload delivered to ${webhookUrl}. Status: 200 OK`, 'LOW');
        setSnackbar({ open: true, message: `Webhook ${selectedEventType} delivered successfully!`, severity: 'success' });
        setIsProcessing(false);
    };

    // --- UI Handlers ---
    const handleOpenModal = (type: string) => {
        setActiveModal(type);
        logAction('UI_INTERACTION', 'SYSTEM', `User opened ${type} configuration modal.`);
    };

    const handleCloseModal = () => setActiveModal(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        logAction('FORM_SUBMITTED', 'TRANSACTION', `Processing ${activeModal} request...`, 'MEDIUM');
        setSnackbar({ open: true, message: 'Transaction submitted to the Quantum Ledger.', severity: 'info' });
        handleCloseModal();
    };

    // ============================================================================================
    // RENDER
    // ============================================================================================

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.dark, 0.15)} 0%, #050505 100%)`,
            color: 'white',
            p: 4,
            fontFamily: '"Inter", sans-serif'
        }}>
            <Container maxWidth="xl">
                
                {/* --- Header Section --- */}
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 800, letterSpacing: 4 }}>
                            {SYSTEM_CODENAME} // {SYSTEM_VERSION}
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Landmark size={48} /> {BRAND_NAME}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
                            Welcome to the Golden Ticket experience. You are currently in the cockpit of a global financial powerhouse. 
                            Kick the tires. See the engine roar.
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                            icon={<Shield size={16} color="#00ff41" />} 
                            label="SOVEREIGN SECURITY ACTIVE" 
                            sx={{ bgcolor: alpha('#00ff41', 0.1), color: '#00ff41', borderColor: alpha('#00ff41', 0.3), mb: 1 }} 
                            variant="outlined"
                        />
                        <Typography variant="caption" display="block" sx={{ opacity: 0.5 }}>
                            EIN REF: {EIN_REFERENCE} | SESSION: {generateId('sess')}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    
                    {/* --- Left Column: Telemetry & Controls --- */}
                    <Grid item xs={12} lg={8}>
                        <Grid container spacing={3}>
                            
                            {/* Stats Row */}
                            <Grid item xs={12} md={4}>
                                <GlassPaper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Liquidity</Typography>
                                        <Activity size={20} color={theme.palette.primary.main} />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>$63.3M</Typography>
                                    <LinearProgress variant="determinate" value={75} sx={{ mt: 2, height: 4, borderRadius: 2 }} />
                                </GlassPaper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <GlassPaper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Active Rails</Typography>
                                        <Zap size={20} color="#ffab00" />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>14/14</Typography>
                                    <Typography variant="caption" color="success.main">+2 optimized by AI</Typography>
                                </GlassPaper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <GlassPaper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Fraud Risk</Typography>
                                        <Shield size={20} color="#00ff41" />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>0.002%</Typography>
                                    <Typography variant="caption" color="text.secondary">Real-time monitoring active</Typography>
                                </GlassPaper>
                            </Grid>

                            {/* Webhook Simulator Section */}
                            <Grid item xs={12}>
                                <GlassPaper sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <Radio size={24} color={theme.palette.primary.main} />
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Webhook Command Center</Typography>
                                    </Box>
                                    
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Target Endpoint URL"
                                                variant="filled"
                                                value={webhookUrl}
                                                onChange={(e) => setWebhookUrl(e.target.value)}
                                                sx={{ bgcolor: alpha('#fff', 0.05) }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Select
                                                fullWidth
                                                value={selectedEventType}
                                                onChange={(e) => setSelectedEventType(e.target.value)}
                                                variant="filled"
                                                sx={{ bgcolor: alpha('#fff', 0.05) }}
                                            >
                                                {EVENT_TYPES.map(type => (
                                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <NeonButton 
                                                    variant="contained" 
                                                    startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <Play size={18} />}
                                                    onClick={simulateWebhook}
                                                    disabled={isProcessing}
                                                    fullWidth
                                                >
                                                    {isProcessing ? "TRANSMITTING..." : "FIRE WEBHOOK EVENT"}
                                                </NeonButton>
                                                <Button 
                                                    variant="outlined" 
                                                    startIcon={<Settings size={18} />}
                                                    onClick={() => handleOpenModal('WEBHOOK_CONFIG')}
                                                >
                                                    CONFIG
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </GlassPaper>
                            </Grid>

                            {/* Account Management */}
                            <Grid item xs={12}>
                                <GlassPaper sx={{ p: 0 }}>
                                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Institutional Accounts</Typography>
                                        <IconButton onClick={() => handleOpenModal('ADD_ACCOUNT')} color="primary">
                                            <Plus />
                                        </IconButton>
                                    </Box>
                                    <List disablePadding>
                                        {accounts.map((acc, idx) => (
                                            <ListItem 
                                                key={acc.id} 
                                                divider={idx !== accounts.length - 1}
                                                sx={{ 
                                                    py: 2, 
                                                    px: 3,
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <Landmark color={acc.type === 'TREASURY' ? '#ffab00' : theme.palette.primary.main} />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={acc.name} 
                                                    secondary={`${acc.type} • ${acc.id}`} 
                                                    primaryTypographyProps={{ fontWeight: 600 }}
                                                />
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency }).format(acc.balance)}
                                                    </Typography>
                                                    <Chip label={acc.status} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                </GlassPaper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* --- Right Column: AI & Audit --- */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
                            
                            {/* AI Chat Bar */}
                            <GlassPaper sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                                <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Cpu size={20} color={theme.palette.primary.main} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Quantum AI Core</Typography>
                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00ff41', animation: 'pulse 2s infinite' }} />
                                        </Box>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {chatHistory.length === 0 && (
                                        <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
                                            <MessageSquare size={48} style={{ margin: '0 auto 16px' }} />
                                            <Typography variant="body2">AI Core Standby. Ask me to create an account, simulate a wire, or explain the Quantum infrastructure.</Typography>
                                        </Box>
                                    )}
                                    {chatHistory.map((msg) => (
                                        <Box 
                                            key={msg.id} 
                                            sx={{ 
                                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                                maxWidth: '85%',
                                                p: 2,
                                                borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                                bgcolor: msg.role === 'user' ? theme.palette.primary.main : alpha('#fff', 0.05),
                                                border: msg.role === 'assistant' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.5, fontSize: '0.6rem' }}>
                                                {msg.timestamp}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {isAiLoading && (
                                        <Box sx={{ alignSelf: 'flex-start', p: 2, bgcolor: alpha('#fff', 0.05), borderRadius: '16px 16px 16px 0' }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Box sx={{ width: 6, height: 6, bgcolor: 'grey.500', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }} />
                                                <Box sx={{ width: 6, height: 6, bgcolor: 'grey.500', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
                                                <Box sx={{ width: 6, height: 6, bgcolor: 'grey.500', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
                                            </Box>
                                        </Box>
                                    )}
                                    <div ref={chatEndRef} />
                                </Box>

                                <Box component="form" onSubmit={handleAiCommand} sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Command the AI Core..."
                                        variant="outlined"
                                        size="small"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={handleAiCommand} disabled={!userInput.trim() || isAiLoading} color="primary">
                                                    <Send size={18} />
                                                </IconButton>
                                            ),
                                            sx: { borderRadius: '12px', bgcolor: alpha('#000', 0.2) }
                                        }}
                                    />
                                </Box>
                            </GlassPaper>

                            {/* Audit Storage (The "Black Box") */}
                            <GlassPaper sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <History size={20} color="#00ff41" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Immutable Audit Storage</Typography>
                                </Box>
                                <AuditLogContainer>
                                    {auditLogs.length === 0 && <Typography variant="caption" sx={{ opacity: 0.5 }}>No logs recorded in current session.</Typography>}
                                    {auditLogs.map((log) => (
                                        <Box key={log.id} sx={{ mb: 1, borderLeft: `2px solid ${log.severity === 'HIGH' ? '#ff4444' : '#333'}`, pl: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#888', mr: 1 }}>[{log.timestamp.split('T')[1].split('.')[0]}]</Typography>
                                            <Typography variant="caption" sx={{ color: log.severity === 'HIGH' ? '#ff4444' : '#00ff41', fontWeight: 700, mr: 1 }}>
                                                {log.category}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#eee' }}>{log.action}: {log.details}</Typography>
                                        </Box>
                                    ))}
                                </AuditLogContainer>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">Storage: 128-bit Encrypted</Typography>
                                    <Button size="small" startIcon={<Download size={14} />} sx={{ fontSize: '0.65rem' }}>EXPORT LOGS</Button>
                                </Box>
                            </GlassPaper>

                        </Box>
                    </Grid>
                </Grid>

                {/* --- Footer / System Status --- */}
                <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                    <Typography variant="caption">© 2024 {BRAND_NAME} Global. All rights reserved. Sovereign Banking License #2021-QM.</Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Globe size={12} /> GLOBAL_NODE: US-EAST-1
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Database size={12} /> LEDGER_SYNC: 100%
                        </Typography>
                    </Box>
                </Box>

            </Container>

            {/* ====================================================================================
                MODALS & DIALOGS (The "Pop-up Forms")
            ==================================================================================== */}

            {/* Generic Transaction/Config Modal */}
            <Dialog 
                open={!!activeModal} 
                onClose={handleCloseModal}
                PaperProps={{
                    sx: { 
                        bgcolor: '#111', 
                        backgroundImage: 'none', 
                        borderRadius: '20px', 
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        minWidth: '400px'
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {activeModal === 'ADD_ACCOUNT' && <Landmark color={theme.palette.primary.main} />}
                        {activeModal === 'WEBHOOK_CONFIG' && <Settings color={theme.palette.primary.main} />}
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {activeModal?.replace('_', ' ')}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <Box component="form" id="modal-form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {activeModal === 'ADD_ACCOUNT' && (
                            <>
                                <TextField fullWidth label="Account Name" variant="filled" required />
                                <Select fullWidth defaultValue="CHECKING" variant="filled">
                                    <MenuItem value="CHECKING">Checking</MenuItem>
                                    <MenuItem value="SAVINGS">Savings</MenuItem>
                                    <MenuItem value="TREASURY">Treasury</MenuItem>
                                    <MenuItem value="VIRTUAL">Virtual</MenuItem>
                                </Select>
                                <TextField fullWidth label="Initial Deposit" type="number" variant="filled" InputProps={{ startAdornment: '$' }} />
                            </>
                        )}
                        {activeModal === 'WEBHOOK_CONFIG' && (
                            <>
                                <TextField fullWidth label="Secret Key" type="password" variant="filled" defaultValue="whsec_quantum_live_9921" />
                                <TextField fullWidth label="Retries" type="number" variant="filled" defaultValue={3} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">Enable Signature Verification</Typography>
                                    <Chip label="ENABLED" color="success" size="small" />
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Button onClick={handleCloseModal} color="inherit">CANCEL</Button>
                    <NeonButton type="submit" form="modal-form" variant="contained">EXECUTE COMMAND</NeonButton>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={5000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Global Styles for Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #050505;
                }
                ::-webkit-scrollbar-thumb {
                    background: #222;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #333;
                }
            `}} />
        </Box>
    );
};

export default WebhookSimulator;
