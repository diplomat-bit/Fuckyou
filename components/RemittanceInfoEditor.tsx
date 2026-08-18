import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Stack,
  Paper,
  Button,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Drawer,
  Alert,
  Snackbar,
  Collapse,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  Security as SecurityIcon,
  History as AuditIcon,
  Send as SendIcon,
  Terminal as DevIcon,
  CheckCircle as SuccessIcon,
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
  Fingerprint as MfaIcon,
  ShieldMoon as FraudIcon,
  DirectionsCar as TestDriveIcon,
  Analytics as AnalyticsIcon,
  IntegrationInstructions as IntegrationIcon
} from '@mui/icons-material';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - REMITTANCE INTELLIGENCE CORE
 * 
 * PHILOSOPHY:
 * This is the "Golden Ticket" experience. We are letting the user "Test Drive" 
 * the high-performance engine of modern global banking.
 * 
 * SECURITY: Non-negotiable. Every keystroke is audited.
 * AI: Integrated at the cellular level via Gemini.
 * PERFORMANCE: Elite, Professional, Secure.
 */

// =============================================================================
// TYPE DEFINITIONS & INTERFACES
// =============================================================================

interface RemittanceInfoEditorProps {
  structured?: string;
  unstructured?: string;
  onChange: (structured?: string, unstructured?: string) => void;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface FraudScore {
  score: number;
  riskLevel: 'Safe' | 'Elevated' | 'High Risk';
  flags: string[];
}

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Assistant, an elite financial strategist.
You are helping a user "Test Drive" the Remittance Info Editor.
Metaphor: You are the co-pilot in a high-performance racing car.
Tone: Professional, Secure, High-Performance.
Context: We are "The Demo Bank". Never mention Citibank.
Capabilities: 
1. Generate ISO 20022 compliant structured remittance data.
2. Explain complex payment regulations.
3. Detect potential fraud patterns in free-text.
4. Help the user "kick the tires" of this demo.
`;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const RemittanceInfoEditor: React.FC<RemittanceInfoEditorProps> = ({
  structured: initialStructured,
  unstructured: initialUnstructured,
  onChange,
}) => {
  // --- STATE MANAGEMENT ---
  const [structured, setStructured] = useState<string | undefined>(initialStructured);
  const [unstructured, setUnstructured] = useState<string | undefined>(initialUnstructured);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [fraudScore, setFraudScore] = useState<FraudScore>({ score: 0, riskLevel: 'Safe', flags: [] });
  const [mfaVerified, setMfaVerified] = useState(false);
  const [isSimulatingMfa, setIsSimulatingMfa] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // --- REFS ---
  const chatEndRef = useRef<HTMLDivElement>(null);
  const auditScrollRef = useRef<HTMLDivElement>(null);

  // --- AI INITIALIZATION ---
  const genAI = useMemo(() => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GoogleGenAI(apiKey);
  }, []);

  // --- AUDIT LOGGING ENGINE ---
  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'low') => {
    const newEntry: AuditEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      actor: "Authorized_Demo_User",
      details,
      severity,
      ipAddress: "192.168.1.105 (Quantum VPN)"
    };
    setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
    console.log(`[AUDIT STORAGE]: ${action} | ${details}`);
  }, []);

  // --- FRAUD MONITORING SIMULATION ---
  const runFraudCheck = useCallback((text: string) => {
    const suspiciousKeywords = ['urgent', 'crypto', 'untraceable', 'gift', 'bypass'];
    const foundFlags = suspiciousKeywords.filter(word => text.toLowerCase().includes(word));
    
    let score = foundFlags.length * 25;
    if (text.length > 500) score += 10;
    
    const riskLevel = score > 50 ? 'High Risk' : score > 20 ? 'Elevated' : 'Safe';
    
    setFraudScore({
      score,
      riskLevel,
      flags: foundFlags
    });

    if (riskLevel === 'High Risk') {
      logAction("FRAUD_ALERT", `Suspicious patterns detected in remittance text: ${foundFlags.join(', ')}`, 'high');
    }
  }, [logAction]);

  // --- INITIALIZATION ---
  useEffect(() => {
    setStructured(initialStructured);
    setUnstructured(initialUnstructured);
    logAction("SESSION_START", "User entered Remittance Editor Demo environment", 'low');
    
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Welcome to the Quantum Financial Remittance Engine. I am your AI co-pilot. You're currently in the 'Golden Ticket' demo environment. Feel free to kick the tires—try generating some structured data or ask me about ISO 20022 compliance.",
        timestamp: new Date()
      }
    ]);
  }, [initialStructured, initialUnstructured, logAction]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // --- HANDLERS ---

  const handleStructuredChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setStructured(value);
    onChange(value, unstructured);
    logAction("DATA_ENTRY", "Modified Structured Remittance Field", 'low');
  };

  const handleUnstructuredChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUnstructured(value);
    onChange(structured, value);
    runFraudCheck(value);
    logAction("DATA_ENTRY", "Modified Unstructured Remittance Field", 'low');
  };

  const simulateMfa = () => {
    setIsSimulatingMfa(true);
    logAction("SECURITY_CHALLENGE", "MFA Verification Triggered", 'medium');
    setTimeout(() => {
      setIsSimulatingMfa(false);
      setMfaVerified(true);
      setSnackbar({ open: true, message: "Biometric Identity Confirmed", severity: 'success' });
      logAction("SECURITY_SUCCESS", "MFA Verification Completed via Quantum Biometrics", 'low');
    }, 2000);
  };

  const handleAiChat = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsAiLoading(true);
    logAction("AI_INTERACTION", `User queried AI: ${userInput.substring(0, 50)}...`, 'low');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: chatMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser Input: ${userInput}`);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMsg]);
      
      if (text.includes("```json") || text.includes("{")) {
        setSnackbar({ open: true, message: "AI suggested a data structure. Check the chat.", severity: 'info' });
      }

    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages(prev => [...prev, {
        id: 'error',
        role: 'system',
        content: "Quantum Neural Link interrupted. Please check your API configuration.",
        timestamp: new Date()
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  const AuditLogView = () => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mt: 2, 
        bgcolor: '#0a0a0a', 
        border: '1px solid #333', 
        maxHeight: '300px', 
        overflowY: 'auto',
        fontFamily: 'monospace'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" sx={{ color: '#00ff00', fontWeight: 'bold' }}>
          {">"} QUANTUM_AUDIT_STREAM_v4.0.2
        </Typography>
        <DevIcon sx={{ fontSize: 16, color: '#00ff00' }} />
      </Stack>
      {auditLogs.map((log) => (
        <Box key={log.id} sx={{ mb: 1, borderLeft: `2px solid ${log.severity === 'high' ? '#ff0000' : '#00ff00'}`, pl: 1 }}>
          <Typography variant="caption" display="block" sx={{ color: '#888' }}>
            [{log.timestamp}] {log.action}
          </Typography>
          <Typography variant="caption" sx={{ color: '#eee' }}>
            {log.details}
          </Typography>
        </Box>
      ))}
      <div ref={auditScrollRef} />
    </Paper>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '600px' }}>
      {/* HEADER SECTION */}
      <Paper 
        elevation={4} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
          border: '1px solid #333',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
          <TestDriveIcon sx={{ fontSize: 150, color: '#fff' }} />
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: '#00e5ff', width: 56, height: 56 }}>
                <PerformanceIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, color: '#fff' }}>
                  Quantum Financial <Typography component="span" variant="h4" sx={{ color: '#00e5ff', fontWeight: 300 }}>Remittance Core</Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: 2 }}>
                  High-Performance Global Payment Infrastructure
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Chip 
              icon={<SecurityIcon style={{ color: '#00ff00' }} />} 
              label="SECURE ENVIRONMENT" 
              variant="outlined" 
              sx={{ borderColor: '#00ff00', color: '#00ff00', fontWeight: 'bold' }} 
            />
          </Grid>
        </Grid>
      </Paper>

      {/* MAIN EDITOR GRID */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              borderRadius: '16px', 
              bgcolor: '#fff', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Remittance Information
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ISO 20022 Compliant Data Entry
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="View Audit Logs">
                  <IconButton onClick={() => setShowAudit(!showAudit)} color={showAudit ? "primary" : "default"}>
                    <AuditIcon />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="contained" 
                  startIcon={<AiIcon />}
                  onClick={() => setIsChatOpen(true)}
                  sx={{ 
                    borderRadius: '20px', 
                    bgcolor: '#000', 
                    '&:hover': { bgcolor: '#333' },
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Ask AI Assistant
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <IntegrationIcon sx={{ color: '#00e5ff' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Structured Remittance Information
                  </Typography>
                  <Chip label="Automated Processing" size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder={'{"InvoiceId": "INV-2024-001", "TaxId": "TX-99", "Discount": 0.05}'}
                  value={structured || ''}
                  onChange={handleStructuredChange}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      fontFamily: 'monospace',
                      bgcolor: '#f8f9fa',
                      borderRadius: '12px'
                    } 
                  }}
                  helperText="Use JSON or Key-Value pairs for straight-through processing (STP)."
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <ChatIcon sx={{ color: '#ff4081' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Unstructured Remittance Information
                  </Typography>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Free text details for the beneficiary..."
                  value={unstructured || ''}
                  onChange={handleUnstructuredChange}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px'
                    } 
                  }}
                  helperText="Free text for additional context. Monitored by Quantum Fraud Shield."
                />
              </Grid>
            </Grid>

            {/* AUDIT COLLAPSE */}
            <Collapse in={showAudit}>
              <AuditLogView />
            </Collapse>

            {/* ACTION FOOTER */}
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f0f7ff', borderRadius: '12px', border: '1px dashed #00e5ff' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" sx={{ color: '#0052cc', fontWeight: 500 }}>
                    <MfaIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                    Security Status: {mfaVerified ? "Identity Verified" : "Verification Required for Submission"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                  {!mfaVerified ? (
                    <Button 
                      variant="outlined" 
                      onClick={simulateMfa} 
                      disabled={isSimulatingMfa}
                      sx={{ borderRadius: '8px' }}
                    >
                      {isSimulatingMfa ? <CircularProgress size={20} /> : "Verify Identity"}
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="success" 
                      startIcon={<SuccessIcon />}
                      sx={{ borderRadius: '8px' }}
                    >
                      Ready to Submit
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* SIDEBAR: ANALYTICS & FRAUD SHIELD */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* FRAUD SHIELD CARD */}
            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <FraudIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Quantum Fraud Shield</Typography>
              </Stack>
              
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Risk Probability</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: fraudScore.riskLevel === 'High Risk' ? 'error.main' : 'success.main' }}>
                    {fraudScore.score}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={fraudScore.score} 
                  color={fraudScore.riskLevel === 'High Risk' ? 'error' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                ACTIVE MONITORING FLAGS:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {fraudScore.flags.length > 0 ? fraudScore.flags.map(flag => (
                  <Chip key={flag} label={flag} size="small" color="error" variant="outlined" />
                )) : (
                  <Typography variant="caption" sx={{ fontStyle: 'italic' }}>No suspicious patterns detected.</Typography>
                )}
              </Box>
            </Paper>

            {/* TEST DRIVE STATS */}
            <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: '#1a1a1a', color: '#fff' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <AnalyticsIcon sx={{ color: '#00e5ff' }} />
                <Typography variant="h6">Engine Performance</Typography>
              </Stack>
              
              <List size="small" disablePadding>
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Processing Latency" 
                    secondary="14ms (Global Edge)" 
                    primaryTypographyProps={{ variant: 'caption', sx: { color: '#aaa' } }}
                    secondaryTypographyProps={{ variant: 'body2', sx: { color: '#fff', fontWeight: 'bold' } }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Compliance Check" 
                    secondary="Passed (OFAC/FATF)" 
                    primaryTypographyProps={{ variant: 'caption', sx: { color: '#aaa' } }}
                    secondaryTypographyProps={{ variant: 'body2', sx: { color: '#00ff00', fontWeight: 'bold' } }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Data Integrity" 
                    secondary="SHA-256 Verified" 
                    primaryTypographyProps={{ variant: 'caption', sx: { color: '#aaa' } }}
                    secondaryTypographyProps={{ variant: 'body2', sx: { color: '#fff', fontWeight: 'bold' } }}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* INTEGRATION CHEAT SHEET */}
            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                Developer Cheat Sheet
              </Typography>
              <Typography variant="caption" color="textSecondary" paragraph>
                Integrate this component with your ERP or Accounting software using our Quantum SDK.
              </Typography>
              <Box sx={{ p: 1.5, bgcolor: '#f0f0f0', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                POST /v1/remittance/validate <br/>
                Authorization: Bearer {'{TOKEN}'}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* AI CHAT DRAWER */}
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', md: 400 }, bgcolor: '#f4f7f9' }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Box sx={{ p: 2, bgcolor: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AiIcon sx={{ color: '#00e5ff' }} />
              <Typography variant="h6">Quantum Intelligence</Typography>
            </Stack>
            <IconButton onClick={() => setIsChatOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chat Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {chatMessages.map((msg) => (
              <Box 
                key={msg.id} 
                sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Paper 
                  sx={{ 
                    p: 2, 
                    maxWidth: '85%', 
                    borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                    bgcolor: msg.role === 'user' ? '#00e5ff' : '#fff',
                    color: msg.role === 'user' ? '#000' : '#333',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Paper>
                <Typography variant="caption" sx={{ mt: 0.5, color: '#999', px: 1 }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            ))}
            {isAiLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <CircularProgress size={16} thickness={6} />
                <Typography variant="caption" color="textSecondary">AI is thinking...</Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Chat Input */}
          <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask about ISO 20022..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
              />
              <IconButton 
                color="primary" 
                onClick={handleAiChat} 
                disabled={isAiLoading || !userInput.trim()}
                sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              Powered by Quantum Neural Core
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '8px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* FOOTER */}
      <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.6 }}>
        <Typography variant="caption" display="block">
          QUANTUM FINANCIAL DEMO v2024.1.0 | NO PRESSURE ENVIRONMENT
        </Typography>
        <Typography variant="caption">
          This is a "Golden Ticket" experience. Kick the tires. See the engine roar.
        </Typography>
      </Box>
    </Box>
  );
};

export default RemittanceInfoEditor;