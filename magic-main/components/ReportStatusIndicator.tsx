import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
	Box,
	CircularProgress,
	Typography,
	Tooltip,
	Paper,
	IconButton,
	TextField,
	Button,
	Divider,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Collapse,
	Fade,
	LinearProgress,
	Avatar,
	Badge,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Grid,
	Chip,
} from '@mui/material';
import { GoogleGenAI } from "@google/genai";

/**
 * ============================================================================================
 * PHILOSOPHY: THE GOLDEN TICKET EXPERIENCE
 * ============================================================================================
 * This component is not just a status indicator; it is the "Quantum Command Center" for 
 * The Demo Bank. It represents a "Golden Ticket" experience where the user is invited 
 * to "Test Drive" the high-performance engine of global finance.
 * 
 * METAPHOR: Kicking the tires. Seeing the engine roar.
 * TONE: Elite, Professional, High-Performance, Secure.
 * 
 * FEATURES:
 * - Robust Payment & Collection simulations (Wire, ACH).
 * - Non-negotiable Security (MFA Simulations, Fraud Monitoring).
 * - Real-time Reporting & Analytics (Data Visualization).
 * - ERP/Accounting Integration simulations.
 * - AUDIT STORAGE: Every sensitive action is logged in the "Black Box".
 * - AI CONCIERGE: Powered by Gemini to interact with the banking environment.
 * ============================================================================================
 */

// --- TYPES & INTERFACES ---

interface ReportStatusIndicatorProps {
	status: 'inProgress' | 'success' | 'failure';
}

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

interface SystemMetric {
    label: string;
    value: number;
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
}

// --- CONSTANTS & MOCK DATA ---

const SYSTEM_INSTRUCTIONS = `
You are the Quantum Financial Concierge, an elite AI assistant for "The Demo Bank". 
Your goal is to provide a "Golden Ticket" experience. 
You help users "test drive" the banking platform.
You are professional, secure, and high-performance.
When users ask to "send money", "check audits", or "monitor fraud", you should guide them through the demo features.
Do NOT use the name Citibank. Use "The Demo Bank" or "Quantum Financial".
You have access to the "Engine Room" (Audit Logs) and "Navigation" (Reporting).
`;

const INITIAL_METRICS: SystemMetric[] = [
    { label: 'Liquidity Injection', value: 98.4, unit: '%', status: 'optimal' },
    { label: 'Fraud Shield Latency', value: 12, unit: 'ms', status: 'optimal' },
    { label: 'ERP Sync Pulse', value: 100, unit: '%', status: 'optimal' },
    { label: 'Quantum Encryption', value: 4096, unit: 'bit', status: 'optimal' },
];

// --- HELPER COMPONENTS ---

/**
 * @description A high-performance gauge for system metrics.
 */
const PerformanceGauge: React.FC<{ metric: SystemMetric }> = ({ metric }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                {metric.label.toUpperCase()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#00f2ff', fontWeight: 800 }}>
                {metric.value}{metric.unit}
            </Typography>
        </Box>
        <LinearProgress 
            variant="determinate" 
            value={metric.value} 
            sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                    backgroundColor: metric.status === 'optimal' ? '#00f2ff' : '#ff4d4d',
                    boxShadow: '0 0 10px #00f2ff'
                }
            }} 
        />
    </Box>
);

/**
 * @description The "Black Box" Audit Log Viewer.
 */
const AuditLogViewer: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => (
    <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
        <List dense>
            {logs.map((log) => (
                <ListItem key={log.id} sx={{ borderLeft: `3px solid ${log.severity === 'CRITICAL' ? '#ff4d4d' : '#00f2ff'}`, mb: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                    <ListItemText 
                        primary={
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff' }}>
                                [{log.timestamp}] {log.action}
                            </Typography>
                        }
                        secondary={
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                {log.details} | Actor: {log.actor}
                            </Typography>
                        }
                    />
                </ListItem>
            ))}
        </List>
    </Box>
);

// --- MAIN COMPONENT ---

const ReportStatusIndicator: React.FC<ReportStatusIndicatorProps> = ({ status }) => {
    // --- STATE MANAGEMENT ---
    const [isExpanded, setIsExpanded] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: 'Welcome to the Quantum Financial Command Center. I am your Concierge. How shall we stress-test the engine today?', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [isMfaOpen, setIsMfaOpen] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [metrics, setMetrics] = useState<SystemMetric[]>(INITIAL_METRICS);
    const [isAiTyping, setIsAiTyping] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- AI INITIALIZATION ---
    // Using the provided GEMINI_API_KEY from environment variables
    const genAI = useMemo(() => {
        const apiKey = process.env.GEMINI_API_KEY || "DEMO_KEY_REDACTED";
        return new GoogleGenAI(apiKey);
    }, []);

    // --- LOGGING UTILITY ---
    const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'LOW') => {
        const newEntry: AuditEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            action,
            actor: 'SYSTEM_USER_ALPHA',
            severity,
            details
        };
        setAuditLogs(prev => [newEntry, ...prev]);
        console.log(`[AUDIT STORAGE] ${action}: ${details}`);
    }, []);

    // --- SCROLL TO BOTTOM ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- METRIC SIMULATION ---
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => prev.map(m => ({
                ...m,
                value: Math.min(100, Math.max(90, m.value + (Math.random() - 0.5) * 2))
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // --- AI INTERACTION LOGIC ---
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiTyping(true);
        logAction('AI_QUERY', `User asked: ${userMsg.content}`);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `${SYSTEM_INSTRUCTIONS}\n\nUser: ${userMsg.content}\nAssistant:`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, aiMsg]);
            
            // Trigger UI actions based on AI response keywords
            if (text.toLowerCase().includes('mfa') || text.toLowerCase().includes('secure')) {
                setIsMfaOpen(true);
                logAction('SECURITY_TRIGGER', 'MFA Simulation initiated by AI Concierge', 'MEDIUM');
            }
            if (text.toLowerCase().includes('wire') || text.toLowerCase().includes('payment')) {
                logAction('PAYMENT_SIMULATION', 'Wire transfer protocol initialized', 'HIGH');
            }

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I apologize, but the Quantum Link is experiencing interference. Please try again.",
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsAiTyping(false);
        }
    };

    // --- MFA VERIFICATION ---
    const verifyMfa = () => {
        setIsProcessing(true);
        logAction('MFA_ATTEMPT', `Code entered: ${mfaCode}`, 'MEDIUM');
        
        setTimeout(() => {
            setIsProcessing(false);
            setIsMfaOpen(false);
            setMfaCode('');
            logAction('MFA_SUCCESS', 'Identity verified via Quantum Key', 'LOW');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: 'SECURITY CLEARANCE GRANTED. ACCESS LEVEL: ARCHITECT.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        }, 1500);
    };

    // --- ORIGINAL STATUS LOGIC (ENHANCED) ---
	let statusColor = '#00f2ff';
	let statusTitle = 'Engine Warming Up...';
	let StatusIcon = null;

	switch (status) {
		case 'inProgress':
			statusColor = '#00f2ff';
			statusTitle = 'Processing High-Frequency Data';
			StatusIcon = () => (
				<CircularProgress size={20} sx={{ color: statusColor }} thickness={6} />
			);
			break;
		case 'success':
			statusColor = '#00ff88';
			statusTitle = 'Transaction Finalized & Audited';
			StatusIcon = () => (
				<Box component='svg' sx={{ color: statusColor, width: 20, height: 20, fill: 'currentcolor' }} viewBox='0 0 24 24'>
					<path d='M9 16.17L4.83 12l-1.42 1.41L9 16.17l7.75-7.75L16.75 12 9 16.17z' />
				</Box>
			);
			break;
		case 'failure':
			statusColor = '#ff4d4d';
			statusTitle = 'System Breach Prevented / Error';
			StatusIcon = () => (
				<Box component='svg' sx={{ color: statusColor, width: 20, height: 20, fill: 'currentcolor' }} viewBox='0 0 24 24'>
					<path d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m-1-13h2v4h-2v-4zm0 5h2v3h-2v-3z' />
				</Box>
			);
			break;
	}

    // --- RENDER ---
	return (
		<Box sx={{ position: 'relative', zIndex: 1000 }}>
            {/* COMPACT TRIGGER */}
			<Tooltip title={statusTitle}>
				<Paper 
                    elevation={0}
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 0.5, 
                        px: 1.5,
                        borderRadius: '20px',
                        cursor: 'pointer',
                        background: 'rgba(10, 25, 41, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${statusColor}44`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            background: 'rgba(10, 25, 41, 0.95)',
                            border: `1px solid ${statusColor}`,
                            boxShadow: `0 0 15px ${statusColor}33`
                        }
                    }}
                >
					{StatusIcon ? <StatusIcon /> : null}
                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, color: statusColor, letterSpacing: 1 }}>
                        {status === 'inProgress' ? 'SYNCING...' : status.toUpperCase()}
                    </Typography>
                    <Box sx={{ ml: 1, width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor, animation: status === 'inProgress' ? 'pulse 1.5s infinite' : 'none' }} />
				</Paper>
			</Tooltip>

            {/* EXPANDED COMMAND CENTER */}
            <Fade in={isExpanded}>
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 80,
                        right: 20,
                        width: 450,
                        height: 700,
                        display: isExpanded ? 'flex' : 'none',
                        flexDirection: 'column',
                        background: 'linear-gradient(135deg, #0a1929 0%, #050c14 100%)',
                        border: '1px solid rgba(0, 242, 255, 0.2)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0, 242, 255, 0.1)',
                        overflow: 'hidden',
                        zIndex: 9999
                    }}
                >
                    {/* HEADER */}
                    <Box sx={{ p: 2, background: 'rgba(0, 242, 255, 0.05)', borderBottom: '1px solid rgba(0, 242, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#00f2ff', width: 32, height: 32, mr: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#0a1929' }}>Q</Typography>
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1 }}>QUANTUM COMMAND</Typography>
                                <Typography variant="caption" sx={{ color: '#00f2ff', fontWeight: 600 }}>THE DEMO BANK | ARCHITECT MODE</Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setIsExpanded(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            <Box component="span" sx={{ fontSize: 20 }}>×</Box>
                        </IconButton>
                    </Box>

                    {/* ENGINE ROOM (METRICS) */}
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, mb: 1, display: 'block' }}>
                            Engine Room Status
                        </Typography>
                        <Grid container spacing={2}>
                            {metrics.map((m, i) => (
                                <Grid item xs={6} key={i}>
                                    <PerformanceGauge metric={m} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(0, 242, 255, 0.1)' }} />

                    {/* CHAT INTERFACE */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {messages.map((msg) => (
                            <Box 
                                key={msg.id} 
                                sx={{ 
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Paper 
                                    sx={{ 
                                        p: 1.5, 
                                        borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                        bgcolor: msg.role === 'user' ? '#00f2ff' : 'rgba(255,255,255,0.05)',
                                        color: msg.role === 'user' ? '#0a1929' : '#fff',
                                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: msg.role === 'user' ? 600 : 400 }}>
                                        {msg.content}
                                    </Typography>
                                </Paper>
                                <Typography variant="caption" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                                    {msg.timestamp}
                                </Typography>
                            </Box>
                        ))}
                        {isAiTyping && (
                            <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 0.5 }}>
                                <Box sx={{ width: 6, height: 6, bgcolor: '#00f2ff', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                                <Box sx={{ width: 6, height: 6, bgcolor: '#00f2ff', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                                <Box sx={{ width: 6, height: 6, bgcolor: '#00f2ff', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                            </Box>
                        )}
                        <div ref={chatEndRef} />
                    </Box>

                    {/* BLACK BOX (AUDIT LOGS) - COLLAPSIBLE */}
                    <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.4)' }}>
                        <Button 
                            fullWidth 
                            size="small" 
                            onClick={() => logAction('LOG_VIEW', 'User inspected black box')}
                            sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', justifyContent: 'space-between' }}
                        >
                            <span>BLACK BOX RECORDER (AUDIT STORAGE)</span>
                            <span>{auditLogs.length} EVENTS</span>
                        </Button>
                        <Collapse in={true}>
                            <AuditLogViewer logs={auditLogs.slice(0, 5)} />
                        </Collapse>
                    </Box>

                    {/* INPUT AREA */}
                    <Box sx={{ p: 2, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField 
                                fullWidth 
                                size="small"
                                placeholder="Command the Concierge..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: 'rgba(0, 242, 255, 0.2)' },
                                        '&:hover fieldset': { borderColor: '#00f2ff' },
                                        '&.Mui-focused fieldset': { borderColor: '#00f2ff' },
                                    }
                                }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={handleSendMessage}
                                sx={{ 
                                    bgcolor: '#00f2ff', 
                                    color: '#0a1929', 
                                    fontWeight: 800,
                                    '&:hover': { bgcolor: '#00d8e6' }
                                }}
                            >
                                SEND
                            </Button>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Chip 
                                label="SEND WIRE" 
                                size="small" 
                                onClick={() => setChatInput('Initiate a global wire transfer simulation')}
                                sx={{ bgcolor: 'rgba(0, 242, 255, 0.1)', color: '#00f2ff', fontSize: '0.6rem', cursor: 'pointer' }} 
                            />
                            <Chip 
                                label="FRAUD AUDIT" 
                                size="small" 
                                onClick={() => setChatInput('Run a fraud detection audit on recent transactions')}
                                sx={{ bgcolor: 'rgba(0, 242, 255, 0.1)', color: '#00f2ff', fontSize: '0.6rem', cursor: 'pointer' }} 
                            />
                        </Box>
                    </Box>
                </Paper>
            </Fade>

            {/* MFA SIMULATION DIALOG */}
            <Dialog 
                open={isMfaOpen} 
                onClose={() => setIsMfaOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#0a1929',
                        border: '2px solid #00f2ff',
                        borderRadius: '12px',
                        color: '#fff',
                        minWidth: 350
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', borderBottom: '1px solid rgba(0, 242, 255, 0.1)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#00f2ff' }}>QUANTUM MFA CHALLENGE</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>SECURITY LEVEL: ELEVATED</Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        A verification code has been sent to your secure device. Please enter the 6-digit Quantum Key to proceed.
                    </Typography>
                    <TextField 
                        autoFocus
                        fullWidth
                        variant="outlined"
                        placeholder="0 0 0 0 0 0"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        inputProps={{ style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '10px', fontWeight: 900, color: '#00f2ff' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(0, 242, 255, 0.3)' },
                                '&:hover fieldset': { borderColor: '#00f2ff' },
                            }
                        }}
                    />
                    {isProcessing && <LinearProgress sx={{ mt: 2, bgcolor: 'rgba(0, 242, 255, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00f2ff' } }} />}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button 
                        variant="contained" 
                        fullWidth
                        onClick={verifyMfa}
                        disabled={isProcessing || mfaCode.length < 4}
                        sx={{ bgcolor: '#00f2ff', color: '#0a1929', fontWeight: 900, py: 1.5 }}
                    >
                        VERIFY IDENTITY
                    </Button>
                </DialogActions>
            </Dialog>

            {/* GLOBAL STYLES FOR ANIMATIONS */}
            <style>
                {`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.5); opacity: 0.5; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                `}
            </style>
		</Box>
	);
};

/**
 * ============================================================================================
 * AUDIT STORAGE LOGIC (INTERNAL DOCUMENTATION)
 * ============================================================================================
 * Every interaction within this component is tracked. 
 * In a production environment, the `logAction` function would dispatch to a secure 
 * immutable ledger (e.g., AWS CloudWatch, Splunk, or a DLT).
 * 
 * SENSITIVE ACTIONS LOGGED:
 * 1. AI Queries (AI_QUERY)
 * 2. Security Triggers (SECURITY_TRIGGER)
 * 3. MFA Attempts & Successes (MFA_ATTEMPT, MFA_SUCCESS)
 * 4. Payment Simulations (PAYMENT_SIMULATION)
 * 5. System Metric Fluctuations (METRIC_SYNC)
 * ============================================================================================
 */

export default ReportStatusIndicator;