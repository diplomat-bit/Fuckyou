import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Shield,
  CreditCard,
  RefreshCw,
  Key,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Cpu,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Activity,
  Terminal,
  Sliders,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { callGemini } from '../services/geminiService';

// --- TYPES & INTERFACES ---
export interface CardEnrollment {
  id: string;
  pan: string;
  cardholderName: string;
  expiryDate: string;
  brand: 'Visa' | 'Visa Electron' | 'Visa Infinite' | 'Visa Signature';
  status: 'Active' | 'Suspended' | 'Pending';
  dcvv2Type: 'Time-Based' | 'Sequence-Based' | 'Hybrid';
  expiryWindowSeconds: number;
  lastGeneratedAt?: string;
  totalGenerations: number;
  fraudAttemptsBlocked: number;
  riskScore: number; // 0 - 100
}

export interface Dcvv2Code {
  code: string;
  generatedAt: number;
  expiresAt: number;
  sequenceNumber?: number;
}

export interface VerificationLog {
  id: string;
  timestamp: string;
  panMasked: string;
  submittedDcvv2: string;
  expectedDcvv2: string;
  status: 'Success' | 'Failed_Expired' | 'Failed_Incorrect' | 'Failed_Suspended';
  merchantName: string;
  amount: number;
  currency: string;
}

export interface GeminiRecommendation {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  actionableStep: string;
  impactMetric: string;
}

export interface ApiConsoleLog {
  timestamp: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  requestPayload: string;
  responsePayload: string;
  statusCode: number;
}

// --- INITIAL MOCK DATA ---
const INITIAL_ENROLLMENTS: CardEnrollment[] = [
  {
    id: 'env-8392',
    pan: '4111223344556677',
    cardholderName: 'Alexander Wright',
    expiryDate: '12/28',
    brand: 'Visa Infinite',
    status: 'Active',
    dcvv2Type: 'Time-Based',
    expiryWindowSeconds: 900, // 15 minutes
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    totalGenerations: 42,
    fraudAttemptsBlocked: 3,
    riskScore: 12,
  },
  {
    id: 'env-1049',
    pan: '4532718293018273',
    cardholderName: 'Sophia Martinez',
    expiryDate: '08/26',
    brand: 'Visa Signature',
    status: 'Active',
    dcvv2Type: 'Sequence-Based',
    expiryWindowSeconds: 0, // Single-use
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    totalGenerations: 118,
    fraudAttemptsBlocked: 14,
    riskScore: 8,
  },
  {
    id: 'env-5521',
    pan: '4000123456789010',
    cardholderName: 'Marcus Vance',
    expiryDate: '03/25',
    brand: 'Visa',
    status: 'Suspended',
    dcvv2Type: 'Time-Based',
    expiryWindowSeconds: 300, // 5 minutes
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    totalGenerations: 5,
    fraudAttemptsBlocked: 8,
    riskScore: 87,
  },
  {
    id: 'env-9021',
    pan: '4921883377441122',
    cardholderName: 'Elena Rostova',
    expiryDate: '10/29',
    brand: 'Visa Electron',
    status: 'Active',
    dcvv2Type: 'Hybrid',
    expiryWindowSeconds: 600, // 10 minutes
    lastGeneratedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    totalGenerations: 89,
    fraudAttemptsBlocked: 1,
    riskScore: 15,
  }
];

const INITIAL_VERIFICATION_LOGS: VerificationLog[] = [
  {
    id: 'tx-901',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    panMasked: '4111 22** **** 6677',
    submittedDcvv2: '482',
    expectedDcvv2: '482',
    status: 'Success',
    merchantName: 'Amazon Web Services',
    amount: 1420.50,
    currency: 'USD'
  },
  {
    id: 'tx-902',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    panMasked: '4532 71** **** 8273',
    submittedDcvv2: '109',
    expectedDcvv2: '882',
    status: 'Failed_Incorrect',
    merchantName: 'Unknown Retailer (Proxy)',
    amount: 450.00,
    currency: 'EUR'
  },
  {
    id: 'tx-903',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    panMasked: '4000 12** **** 9010',
    submittedDcvv2: '331',
    expectedDcvv2: '331',
    status: 'Failed_Suspended',
    merchantName: 'Steam Games',
    amount: 59.99,
    currency: 'USD'
  },
  {
    id: 'tx-904',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    panMasked: '4921 88** **** 1122',
    submittedDcvv2: '704',
    expectedDcvv2: '704',
    status: 'Failed_Expired',
    merchantName: 'Uber Eats',
    amount: 34.20,
    currency: 'USD'
  }
];

const INITIAL_AI_RECOMMENDATIONS: GeminiRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Reduce Expiry Window for High-Risk Cards',
    description: 'Cardholder Marcus Vance (env-5521) has experienced multiple blocked fraud attempts. The current 5-minute window is still vulnerable to rapid replay attacks.',
    severity: 'Critical',
    actionableStep: 'Transition env-5521 to Sequence-Based (Single-Use) dCVV2 immediately.',
    impactMetric: 'Reduces replay attack window to 0 seconds.'
  },
  {
    id: 'rec-2',
    title: 'Implement Velocity-Based Expiry Scaling',
    description: 'Analysis of Visa Infinite cards shows high transaction frequency during business hours. Static 15-minute windows can be optimized dynamically.',
    severity: 'Medium',
    actionableStep: 'Enable dynamic expiry scaling (e.g., reduce to 3 minutes during high-velocity periods).',
    impactMetric: 'Improves security posture by 34% without increasing user friction.'
  },
  {
    id: 'rec-3',
    title: 'Enforce Hybrid dCVV2 for Cross-Border Transactions',
    description: 'Cross-border transactions on Visa Electron cards show a 12% higher fraud attempt rate when using standard time-based dCVV2.',
    severity: 'High',
    actionableStep: 'Configure rule engine to require Hybrid dCVV2 (Time + Sequence) for non-domestic merchants.',
    impactMetric: 'Estimated to block an additional $12,500 in monthly fraudulent volume.'
  }
];

export default function VisaDcvv2Manager() {
  // --- STATE ---
  const [enrollments, setEnrollments] = useState<CardEnrollment[]>(INITIAL_ENROLLMENTS);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(INITIAL_VERIFICATION_LOGS);
  const [aiRecommendations, setAiRecommendations] = useState<GeminiRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);
  const [apiLogs, setApiLogs] = useState<ApiConsoleLog[]>([]);
  
  const [activeTab, setActiveTab] = useState<'enroll' | 'generate' | 'verify' | 'ai' | 'logs'>('enroll');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanMap, setShowPanMap] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form States
  const [newCard, setNewCard] = useState({
    pan: '',
    cardholderName: '',
    expiryDate: '',
    brand: 'Visa' as CardEnrollment['brand'],
    dcvv2Type: 'Time-Based' as CardEnrollment['dcvv2Type'],
    expiryWindowSeconds: 900
  });

  // Generation States
  const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_ENROLLMENTS[0]?.id || '');
  const [activeDcvv2, setActiveDcvv2] = useState<Dcvv2Code | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Verification States
  const [verifyForm, setVerifyForm] = useState({
    cardId: INITIAL_ENROLLMENTS[0]?.id || '',
    submittedDcvv2: '',
    merchantName: 'Stripe Test Merchant',
    amount: '49.99',
    currency: 'USD'
  });
  const [lastVerificationResult, setLastVerificationResult] = useState<VerificationLog | null>(null);

  // Gemini AI Chat States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Global Loading States
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // --- HELPER FUNCTIONS ---
  const maskPan = (pan: string, show: boolean = false) => {
    if (show) {
      return pan.replace(/(\d{4})/g, '$1 ').trim();
    }
    const clean = pan.replace(/\s/g, '');
    return `${clean.slice(0, 4)} ${clean.slice(4, 6)}** **** ${clean.slice(-4)}`;
  };

  const generateRandomDcvv2 = (): string => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  const addApiLog = useCallback((method: ApiConsoleLog['method'], endpoint: string, req: any, resp: any, status: number) => {
    const newLog: ApiConsoleLog = {
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      requestPayload: JSON.stringify(req, null, 2),
      responsePayload: JSON.stringify(resp, null, 2),
      statusCode: status
    };
    setApiLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- DCVV2 TIMER LOGIC ---
  useEffect(() => {
    if (activeDcvv2 && activeDcvv2.expiresAt > Date.now()) {
      const calculateTimeLeft = () => {
        const diff = Math.max(0, Math.floor((activeDcvv2.expiresAt - Date.now()) / 1000));
        setTimeLeft(diff);
        if (diff === 0) {
          setActiveDcvv2(null);
        }
      };
      calculateTimeLeft();
      timerRef.current = setInterval(calculateTimeLeft, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeDcvv2]);

  // --- ACTIONS ---
  const handleEnrollCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard.pan.length < 13 || !newCard.cardholderName || !newCard.expiryDate) {
      alert('Please fill in all card details correctly.');
      return;
    }

    setActionLoading('enroll');
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    const id = `env-${Math.floor(1000 + Math.random() * 9000)}`;
    const enrolled: CardEnrollment = {
      id,
      pan: newCard.pan.replace(/\s/g, ''),
      cardholderName: newCard.cardholderName,
      expiryDate: newCard.expiryDate,
      brand: newCard.brand,
      status: 'Active',
      dcvv2Type: newCard.dcvv2Type,
      expiryWindowSeconds: newCard.dcvv2Type === 'Sequence-Based' ? 0 : newCard.expiryWindowSeconds,
      totalGenerations: 0,
      fraudAttemptsBlocked: 0,
      riskScore: Math.floor(Math.random() * 25) // Initial low risk
    };

    setEnrollments(prev => [enrolled, ...prev]);
    
    // Log API Handshake
    addApiLog(
      'POST',
      `/v1/dcvv2/enrollments`,
      {
        pan: maskPan(enrolled.pan),
        cardholderName: enrolled.cardholderName,
        expiryDate: enrolled.expiryDate,
        dcvv2Type: enrolled.dcvv2Type,
        expiryWindowSeconds: enrolled.expiryWindowSeconds
      },
      {
        status: 'SUCCESS',
        enrollmentId: enrolled.id,
        enrolledAt: new Date().toISOString(),
        visaReferenceId: `vref-${Math.random().toString(36).substr(2, 9)}`
      },
      201
    );

    // Reset Form
    setNewCard({
      pan: '',
      cardholderName: '',
      expiryDate: '',
      brand: 'Visa',
      dcvv2Type: 'Time-Based',
      expiryWindowSeconds: 900
    });
    setActionLoading(null);
  };

  const handleSuspendEnrollment = async (id: string) => {
    setActionLoading(`suspend-${id}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    setEnrollments(prev => prev.map(item => {
      if (item.id === id) {
        const updatedStatus = item.status === 'Active' ? 'Suspended' : 'Active';
        addApiLog(
          'PUT',
          `/v1/dcvv2/enrollments/${id}/status`,
          { status: updatedStatus },
          { enrollmentId: id, status: updatedStatus, updatedAt: new Date().toISOString() },
          200
        );
        return { ...item, status: updatedStatus as any };
      }
      return item;
    }));
    setActionLoading(null);
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dCVV2 enrollment?')) return;
    setActionLoading(`delete-${id}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    setEnrollments(prev => prev.filter(item => item.id !== id));
    addApiLog('DELETE', `/v1/dcvv2/enrollments/${id}`, {}, { status: 'DELETED', id }, 200);
    setActionLoading(null);
  };

  const handleGenerateDcvv2 = async (cardId: string) => {
    const card = enrollments.find(c => c.id === cardId);
    if (!card) return;

    if (card.status !== 'Active') {
      alert('Cannot generate dCVV2 for a suspended or pending card.');
      return;
    }

    setActionLoading('generate');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const code = generateRandomDcvv2();
    const now = Date.now();
    const windowMs = card.dcvv2Type === 'Sequence-Based' ? 1000 * 60 * 60 * 24 : card.expiryWindowSeconds * 1000; // 24h fallback for single-use if not used
    const expiresAt = now + windowMs;

    const newDcvv2: Dcvv2Code = {
      code,
      generatedAt: now,
      expiresAt,
      sequenceNumber: card.dcvv2Type !== 'Time-Based' ? card.totalGenerations + 1 : undefined
    };

    setActiveDcvv2(newDcvv2);
    
    // Update enrollment stats
    setEnrollments(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          totalGenerations: c.totalGenerations + 1,
          lastGeneratedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    addApiLog(
      'POST',
      `/v1/dcvv2/generate`,
      { enrollmentId: cardId, dcvv2Type: card.dcvv2Type },
      {
        dcvv2: code,
        generatedAt: new Date(now).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        sequenceNumber: newDcvv2.sequenceNumber
      },
      200
    );

    setActionLoading(null);
  };

  const handleVerifyDcvv2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const card = enrollments.find(c => c.id === verifyForm.cardId);
    if (!card) return;

    setActionLoading('verify');
    await new Promise(resolve => setTimeout(resolve, 1400));

    let status: VerificationLog['status'] = 'Success';
    let expected = activeDcvv2?.code || '999'; // Fallback if none generated

    if (card.status === 'Suspended') {
      status = 'Failed_Suspended';
    } else if (!activeDcvv2 || Date.now() > activeDcvv2.expiresAt) {
      status = 'Failed_Expired';
    } else if (verifyForm.submittedDcvv2 !== activeDcvv2.code) {
      status = 'Failed_Incorrect';
    }

    // If sequence-based, consume the token on attempt
    if (card.dcvv2Type === 'Sequence-Based') {
      setActiveDcvv2(null);
    }

    const logEntry: VerificationLog = {
      id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      panMasked: maskPan(card.pan),
      submittedDcvv2: verifyForm.submittedDcvv2,
      expectedDcvv2: expected,
      status,
      merchantName: verifyForm.merchantName,
      amount: parseFloat(verifyForm.amount),
      currency: verifyForm.currency
    };

    setVerificationLogs(prev => [logEntry, ...prev]);
    setLastVerificationResult(logEntry);

    // If failed, increment fraud attempts blocked
    if (status !== 'Success') {
      setEnrollments(prev => prev.map(c => {
        if (c.id === card.id) {
          return {
            ...c,
            fraudAttemptsBlocked: c.fraudAttemptsBlocked + 1,
            riskScore: Math.min(100, c.riskScore + 15) // Increase risk score on failure
          };
        }
        return c;
      }));
    }

    addApiLog(
      'POST',
      `/v1/dcvv2/verify`,
      {
        pan: card.pan,
        submittedDcvv2: verifyForm.submittedDcvv2,
        merchantName: verifyForm.merchantName,
        amount: logEntry.amount,
        currency: logEntry.currency
      },
      {
        verificationId: logEntry.id,
        status: status === 'Success' ? 'APPROVED' : 'DECLINED',
        reasonCode: status,
        timestamp: logEntry.timestamp
      },
      status === 'Success' ? 200 : 400
    );

    setActionLoading(null);
  };

  // --- GEMINI AI INTEGRATION ---
  const handleAskGemini = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse('');

    const systemContext = `
      You are the Visa dCVV2 Security Expert AI integrated into the Sovereign Aquarius Portal.
      You have access to the following real-time dCVV2 enrollments and verification logs:
      
      Enrollments:
      ${JSON.stringify(enrollments, null, 2)}
      
      Recent Verification Logs:
      ${JSON.stringify(verificationLogs, null, 2)}
      
      Provide highly technical, commercial-grade security recommendations, risk analysis, or policy adjustments based on the user's query.
      Keep responses concise, professional, and formatted in clean Markdown.
    `;

    try {
      const responseText = await callGemini(
        `${systemContext}\n\nUser Query: ${aiPrompt}\n\nProvide a detailed, actionable response.`
      );
      setAiResponse(responseText);
      
      // Dynamically generate a new recommendation if relevant
      if (responseText.toLowerCase().includes('recommend') || responseText.toLowerCase().includes('risk')) {
        const newRec: GeminiRecommendation = {
          id: `rec-${Math.floor(100 + Math.random() * 900)}`,
          title: 'Dynamic Policy Adjustment',
          description: 'AI-generated recommendation based on custom security analysis.',
          severity: 'High',
          actionableStep: 'Review and apply the suggested dCVV2 parameters in the settings panel.',
          impactMetric: 'Optimizes fraud detection vectors.'
        };
        setAiRecommendations(prev => [newRec, ...prev]);
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setAiResponse('Error communicating with Gemini AI. Please verify your API configuration.');
    } finally {
      setAiLoading(false);
    }
  };

  const triggerAutoAiAudit = async () => {
    setAiLoading(true);
    const auditPrompt = `
      Perform an automated security audit on the current dCVV2 enrollments.
      Identify any anomalies, high-risk cards, or suboptimal configurations.
      Provide a structured JSON-like list of recommendations.
    `;
    try {
      const responseText = await callGemini(auditPrompt);
      setAiResponse(responseText);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // --- CHARTS & ANALYTICS DATA ---
  const fraudPreventionData = useMemo(() => {
    return [
      { name: 'Active Cards', value: enrollments.filter(e => e.status === 'Active').length },
      { name: 'Suspended Cards', value: enrollments.filter(e => e.status === 'Suspended').length },
      { name: 'Pending Cards', value: enrollments.filter(e => e.status === 'Pending').length },
    ];
  }, [enrollments]);

  const verificationStatsData = useMemo(() => {
    const success = verificationLogs.filter(l => l.status === 'Success').length;
    const failed = verificationLogs.filter(l => l.status !== 'Success').length;
    return [
      { name: 'Successful Verifications', count: success, fill: '#10B981' },
      { name: 'Blocked/Failed Attempts', count: failed, fill: '#EF4444' }
    ];
  }, [verificationLogs]);

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                Visa dCVV2 Security Citadel
              </h1>
              <p className="text-sm text-slate-400">
                Enterprise-grade Dynamic Card Verification Value (dCVV2) Management & Gemini AI Risk Orchestrator
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={triggerAutoAiAudit}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4" />
            AI Security Audit
          </button>
          <div className="h-10 w-px bg-slate-800 hidden md:block" />
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Visa VDP Connected</span>
          </div>
        </div>
      </header>

      {/* METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Enrolled PANs</span>
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{enrollments.length}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">+{enrollments.filter(e => e.status === 'Active').length} Active</span>
            <span>on Visa Network</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Verification Success Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold">
            {useMemo(() => {
              const total = verificationLogs.length;
              if (total === 0) return '100%';
              const success = verificationLogs.filter(l => l.status === 'Success').length;
              return `${Math.round((success / total) * 100)}%`;
            }, [verificationLogs])}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Based on last {verificationLogs.length} simulated transactions
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fraud Attempts Blocked</span>
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">
            {enrollments.reduce((acc, curr) => acc + curr.fraudAttemptsBlocked, 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Prevented via dynamic CVV rotation
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Risk Index</span>
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {useMemo(() => {
              if (enrollments.length === 0) return '0';
              const avg = enrollments.reduce((acc, curr) => acc + curr.riskScore, 0) / enrollments.length;
              return `${Math.round(avg)}/100`;
            }, [enrollments])}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Calculated by Gemini Security Agent
          </div>
        </div>
      </section>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('enroll')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'enroll'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Enrollments & Inquiry
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'generate'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Key className="w-4 h-4" />
          dCVV2 Generator
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'verify'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification Simulator
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Gemini AI Security Hub
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Terminal className="w-4 h-4" />
          VDP API Logs
          {apiLogs.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded-full font-bold">
              {apiLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/CENTER COLUMN (DYNAMIC BASED ON TAB) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB: ENROLLMENTS & INQUIRY */}
          {activeTab === 'enroll' && (
            <div className="space-y-6">
              {/* Enrollment Form */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  Enroll New Card for dCVV2
                </h3>
                <form onSubmit={handleEnrollCard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Account Number (PAN)</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="4111223344556677"
                        value={newCard.pan}
                        onChange={e => setNewCard({ ...newCard, pan: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                        required
                      />
                      <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={newCard.cardholderName}
                      onChange={e => setNewCard({ ...newCard, cardholderName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/27"
                      maxLength={5}
                      value={newCard.expiryDate}
                      onChange={e => setNewCard({ ...newCard, expiryDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Visa Card Brand</label>
                    <select
                      value={newCard.brand}
                      onChange={e => setNewCard({ ...newCard, brand: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-300"
                    >
                      <option value="Visa">Visa Classic</option>
                      <option value="Visa Electron">Visa Electron</option>
                      <option value="Visa Signature">Visa Signature</option>
                      <option value="Visa Infinite">Visa Infinite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">dCVV2 Generation Protocol</label>
                    <select
                      value={newCard.dcvv2Type}
                      onChange={e => setNewCard({ ...newCard, dcvv2Type: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-300"
                    >
                      <option value="Time-Based">Time-Based (Rotates periodically)</option>
                      <option value="Sequence-Based">Sequence-Based (Single-use / Next-in-sequence)</option>
                      <option value="Hybrid">Hybrid (Time window + Sequence validation)</option>
                    </select>
                  </div>

                  {newCard.dcvv2Type !== 'Sequence-Based' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Window (Seconds)</label>
                      <select
                        value={newCard.expiryWindowSeconds}
                        onChange={e => setNewCard({ ...newCard, expiryWindowSeconds: parseInt(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-300"
                      >
                        <option value={60}>60 Seconds (1 Minute)</option>
                        <option value={300}>300 Seconds (5 Minutes)</option>
                        <option value={600}>600 Seconds (10 Minutes)</option>
                        <option value={900}>900 Seconds (15 Minutes)</option>
                        <option value={1800}>1800 Seconds (30 Minutes)</option>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={actionLoading === 'enroll'}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-500/10"
                    >
                      {actionLoading === 'enroll' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Enrolling with Visa VDP...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Complete Enrollment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Enrollment Inquiry / List */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Active dCVV2 Enrollments</h3>
                    <p className="text-xs text-slate-400">Perform real-time inquiry and status updates on registered PANs</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search cardholder or PAN..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Cardholder / Brand</th>
                        <th className="p-4">PAN</th>
                        <th className="p-4">Protocol</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Risk Score</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {enrollments
                        .filter(e => 
                          e.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.pan.includes(searchQuery)
                        )
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-slate-200">{item.cardholderName}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-blue-400" />
                                {item.brand}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs">
                              <div className="flex items-center gap-2">
                                <span>{maskPan(item.pan, showPanMap[item.id])}</span>
                                <button
                                  onClick={() => setShowPanMap(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                  className="text-slate-500 hover:text-slate-300"
                                >
                                  {showPanMap[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleCopy(item.pan, item.id)}
                                  className="text-slate-500 hover:text-slate-300"
                                >
                                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-300">
                                {item.dcvv2Type}
                              </span>
                              {item.expiryWindowSeconds > 0 && (
                                <div className="text-[10px] text-slate-500 mt-1">
                                  Window: {item.expiryWindowSeconds}s
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : item.status === 'Suspended'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'Active' ? 'bg-emerald-400' : item.status === 'Suspended' ? 'bg-red-400' : 'bg-amber-400'
                                }`} />
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      item.riskScore > 75 ? 'bg-red-500' : item.riskScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${item.riskScore}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-slate-400">{item.riskScore}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleSuspendEnrollment(item.id)}
                                  disabled={actionLoading === `suspend-${item.id}`}
                                  className={`p-1.5 rounded-lg border transition-all ${
                                    item.status === 'Active'
                                      ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                  }`}
                                  title={item.status === 'Active' ? 'Suspend Enrollment' : 'Activate Enrollment'}
                                >
                                  {item.status === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteEnrollment(item.id)}
                                  disabled={actionLoading === `delete-${item.id}`}
                                  className="p-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Delete Enrollment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DCVV2 GENERATOR */}
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  Generate Dynamic CVV2 (dCVV2)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Enrolled Card</label>
                    <select
                      value={selectedCardId}
                      onChange={e => {
                        setSelectedCardId(e.target.value);
                        setActiveDcvv2(null); // Clear active code on card change
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-300"
                    >
                      {enrollments
                        .filter(e => e.status === 'Active')
                        .map(e => (
                          <option key={e.id} value={e.id}>
                            {e.cardholderName} - {maskPan(e.pan)} ({e.dcvv2Type})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex justify-center py-6">
                    <button
                      onClick={() => handleGenerateDcvv2(selectedCardId)}
                      disabled={actionLoading === 'generate'}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-800 disabled:to-indigo-800 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
                    >
                      {actionLoading === 'generate' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating Secure Token...
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          Generate dCVV2 Code
                        </>
                      )}
                    </button>
                  </div>

                  {/* Generated Code Display */}
                  {activeDcvv2 && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                          style={{ 
                            width: `${timeLeft > 0 ? (timeLeft / (enrollments.find(e => e.id === selectedCardId)?.expiryWindowSeconds || 900)) * 100 : 0}%` 
                          }}
                        />
                      </div>

                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
                        Active Dynamic CVV2
                      </span>
                      
                      <div className="text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white font-mono mb-4">
                        {activeDcvv2.code}
                      </div>

                      <div className="flex justify-center items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Expires in: <strong className="font-mono text-slate-200">{Math.floor(timeLeft / 60)}m {timeLeft % 60}s</strong></span>
                        </div>
                        {activeDcvv2.sequenceNumber && (
                          <div className="flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Sequence: <strong className="font-mono text-slate-200">#{activeDcvv2.sequenceNumber}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleCopy(activeDcvv2.code, 'active-code')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-all"
                        >
                          {copiedId === 'active-code' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VERIFICATION SIMULATOR */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Simulate Merchant Transaction Verification
                </h3>

                <form onSubmit={handleVerifyDcvv2} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Card</label>
                      <select
                        value={verifyForm.cardId}
                        onChange={e => setVerifyForm({ ...verifyForm, cardId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-300"
                      >
                        {enrollments.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.cardholderName} - {maskPan(e.pan)} ({e.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Submitted dCVV2 Code</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="Enter 3-digit code"
                        value={verifyForm.submittedDcvv2}
                        onChange={e => setVerifyForm({ ...verifyForm, submittedDcvv2: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Merchant Name</label>
                      <input
                        type="text"
                        value={verifyForm.merchantName}
                        onChange={e => setVerifyForm({ ...verifyForm, merchantName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={verifyForm.amount}
                          onChange={e => setVerifyForm({ ...verifyForm, amount: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
                        <select
                          value={verifyForm.currency}
                          onChange={e => setVerifyForm({ ...verifyForm, currency: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-300"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={actionLoading === 'verify'}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-500/10"
                    >
                      {actionLoading === 'verify' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verifying with Visa dCVV2 Engine...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Submit Verification Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Last Verification Result Alert */}
              {lastVerificationResult && (
                <div className={`p-5 rounded-2xl border ${
                  lastVerificationResult.status === 'Success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                    : 'bg-red-500/10 border-red-500/20 text-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {lastVerificationResult.status === 'Success' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        Transaction {lastVerificationResult.status === 'Success' ? 'Approved' : 'Declined'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {lastVerificationResult.status === 'Success'
                          ? `The submitted dCVV2 (${lastVerificationResult.submittedDcvv2}) matched the active token for ${lastVerificationResult.panMasked}.`
                          : `Verification failed. Reason: ${lastVerificationResult.status}. Expected: ${lastVerificationResult.expectedDcvv2}, Submitted: ${lastVerificationResult.submittedDcvv2}`}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                        <div>Merchant: <span className="text-slate-200">{lastVerificationResult.merchantName}</span></div>
                        <div>Amount: <span className="text-slate-200">{lastVerificationResult.currency} {lastVerificationResult.amount}</span></div>
                        <div>ID: <span className="text-slate-200">{lastVerificationResult.id}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GEMINI AI SECURITY HUB */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Gemini AI Security Assistant
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Ask Gemini for real-time risk analysis, custom dCVV2 policy recommendations, or compliance audits.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Analyze the risk profile of Marcus Vance and suggest a dCVV2 policy."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAskGemini()}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                    <button
                      onClick={handleAskGemini}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2"
                    >
                      {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Ask
                    </button>
                  </div>

                  {aiResponse && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm leading-relaxed text-slate-300 max-h-96 overflow-y-auto scrollbar-thin">
                      <div className="flex items-center gap-2 mb-3 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                        <Cpu className="w-4 h-4" />
                        Gemini Security Response
                      </div>
                      <div className="prose prose-invert max-w-none text-xs space-y-2">
                        {aiResponse.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VDP API LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Visa Developer Platform (VDP) Sandbox Logs</h3>
                    <p className="text-xs text-slate-400">Real-time API handshakes, payloads, and response codes</p>
                  </div>
                  <button
                    onClick={() => setApiLogs([])}
                    className="text-xs text-red-400 hover:text-red-300 font-medium"
                  >
                    Clear Logs
                  </button>
                </div>

                {apiLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No API transactions recorded yet. Perform enrollments, generations, or verifications to populate.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto scrollbar-thin">
                    {apiLogs.map((log, index) => (
                      <div key={index} className="p-4 hover:bg-slate-900/10 transition-colors font-mono text-xs">
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                              log.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                              log.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {log.method}
                            </span>
                            <span className="text-slate-300 font-semibold">{log.endpoint}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${log.statusCode < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                              HTTP {log.statusCode}
                            </span>
                            <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Request Payload</div>
                            <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-32 scrollbar-none">{log.requestPayload}</pre>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Response Payload</div>
                            <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-32 scrollbar-none">{log.responsePayload}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SECURITY INSIGHTS & ANALYTICS */}
        <div className="space-y-6">
          
          {/* GEMINI SECURITY RECOMMENDATIONS */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Gemini Risk Insights
              </h3>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold">
                Real-Time
              </span>
            </div>

            <div className="space-y-3">
              {aiRecommendations.map(rec => (
                <div key={rec.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-xs text-slate-200">{rec.title}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      rec.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      rec.severity === 'High' ? 'bg-amber-500/20 text-amber-400' :
                      rec.severity === 'Medium' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {rec.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{rec.description}</p>
                  <div className="pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                    <div className="font-medium text-indigo-400">Action: <span className="text-slate-300">{rec.actionableStep}</span></div>
                    <div className="mt-0.5">Impact: <span className="text-slate-400">{rec.impactMetric}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANALYTICS: VERIFICATION SUCCESS VS BLOCKED */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              Verification Analytics
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={verificationStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px' }}
                    itemStyle={{ color: '#F1F5F9', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {verificationStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT VERIFICATION LOGS (MINI LIST) */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Activity
              </h3>
              <button onClick={() => setActiveTab('logs')} className="text-xs text-blue-400 hover:text-blue-300">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {verificationLogs.slice(0, 4).map(log => (
                <div key={log.id} className="flex justify-between items-center gap-3 p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{log.merchantName}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{log.panMasked}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-300">
                      {log.currency} {log.amount.toFixed(2)}
                    </div>
                    <span className={`inline-block text-[9px] font-bold uppercase mt-0.5 ${
                      log.status === 'Success' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {log.status === 'Success' ? 'Approved' : 'Declined'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}