import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CreditCard, 
  UserCheck, 
  Search, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Sliders, 
  Key, 
  Mail, 
  Phone, 
  User, 
  Sparkles, 
  Loader2, 
  Globe, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Check,
  X,
  ShieldAlert,
  Activity,
  Cpu
} from 'lucide-react';
import Card from './Card';
import { callGemini } from '../services/geminiService';

// High-fidelity interfaces matching Visa Token Service (VTS) specifications
export interface VisaToken {
  tokenId: string;
  tokenReferenceId: string;
  tokenType: 'DEVICE' | 'ECOMMERCE_COF';
  tokenRequestorId: string;
  tokenRequestorName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  deviceType?: string;
  deviceName?: string;
  createdAt: string;
}

export interface VisaEnrollment {
  enrollmentId: string;
  fullName: string;
  email: string;
  phone: string;
  panLast4: string;
  panExpiryMonth: string;
  panExpiryYear: string;
  walletProvider: 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'SOVEREIGN_WALLET';
  status: 'ENROLLED' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'TERMINATED';
  riskScore: number; // 0 to 100
  tokens: VisaToken[];
  createdAt: string;
  updatedAt: string;
}

// Seed high-fidelity mock data for commercial-grade presentation
const INITIAL_ENROLLMENTS: VisaEnrollment[] = [
  {
    enrollmentId: "enr_908123741",
    fullName: "Alexander Wright",
    email: "alex.wright@sovereign.io",
    phone: "+1 (555) 234-5678",
    panLast4: "4112",
    panExpiryMonth: "12",
    panExpiryYear: "2028",
    walletProvider: "SOVEREIGN_WALLET",
    status: "ENROLLED",
    riskScore: 12,
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-02-10T14:22:00Z",
    tokens: [
      {
        tokenId: "tok_882910239",
        tokenReferenceId: "tr_9920182",
        tokenType: "DEVICE",
        tokenRequestorId: "40000032119",
        tokenRequestorName: "Sovereign Secure Element Client",
        status: "ACTIVE",
        last4: "9821",
        expiryMonth: "12",
        expiryYear: "2028",
        deviceType: "SMARTPHONE",
        deviceName: "Sovereign Phone 1 Pro",
        createdAt: "2024-01-15T08:35:00Z"
      },
      {
        tokenId: "tok_110293847",
        tokenReferenceId: "tr_4492018",
        tokenType: "ECOMMERCE_COF",
        tokenRequestorId: "40000010293",
        tokenRequestorName: "Sovereign Cloud Vault",
        status: "ACTIVE",
        last4: "4402",
        expiryMonth: "12",
        expiryYear: "2028",
        createdAt: "2024-02-10T14:22:00Z"
      }
    ]
  },
  {
    enrollmentId: "enr_102938475",
    fullName: "Elena Rostova",
    email: "elena.rostova@aurora.net",
    phone: "+44 20 7946 0192",
    panLast4: "5224",
    panExpiryMonth: "08",
    panExpiryYear: "2027",
    walletProvider: "APPLE_PAY",
    status: "ENROLLED",
    riskScore: 8,
    createdAt: "2023-11-02T11:15:00Z",
    updatedAt: "2023-11-02T11:20:00Z",
    tokens: [
      {
        tokenId: "tok_554019283",
        tokenReferenceId: "tr_1029384",
        tokenType: "DEVICE",
        tokenRequestorId: "40010020030",
        tokenRequestorName: "Apple Pay Token Requestor",
        status: "ACTIVE",
        last4: "1102",
        expiryMonth: "08",
        expiryYear: "2027",
        deviceType: "SMARTWATCH",
        deviceName: "Elena's Apple Watch Ultra",
        createdAt: "2023-11-02T11:20:00Z"
      }
    ]
  },
  {
    enrollmentId: "enr_554019283",
    fullName: "Marcus Aurelius Vance",
    email: "marcus.vance@imperium.org",
    phone: "+1 (555) 987-6543",
    panLast4: "9812",
    panExpiryMonth: "03",
    panExpiryYear: "2029",
    walletProvider: "GOOGLE_PAY",
    status: "PENDING_VERIFICATION",
    riskScore: 45,
    createdAt: "2024-02-18T16:45:00Z",
    updatedAt: "2024-02-18T16:45:00Z",
    tokens: []
  },
  {
    enrollmentId: "enr_776102938",
    fullName: "Seraphina Sterling",
    email: "s.sterling@nexus-corp.com",
    phone: "+1 (555) 456-7890",
    panLast4: "3782",
    panExpiryMonth: "05",
    panExpiryYear: "2026",
    walletProvider: "SAMSUNG_PAY",
    status: "SUSPENDED",
    riskScore: 78,
    createdAt: "2023-08-12T09:00:00Z",
    updatedAt: "2024-01-05T10:14:00Z",
    tokens: [
      {
        tokenId: "tok_990182736",
        tokenReferenceId: "tr_5540192",
        tokenType: "DEVICE",
        tokenRequestorId: "40020030040",
        tokenRequestorName: "Samsung Pay Token Requestor",
        status: "SUSPENDED",
        last4: "8830",
        expiryMonth: "05",
        expiryYear: "2026",
        deviceType: "SMARTPHONE",
        deviceName: "Galaxy Fold 5",
        createdAt: "2023-08-12T09:10:00Z"
      }
    ]
  }
];

export default function VisaPayEnrollmentManager() {
  // Core State
  const [enrollments, setEnrollments] = useState<VisaEnrollment[]>(INITIAL_ENROLLMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [walletFilter, setWalletFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Enrollment & Detail View State
  const [selectedEnrollment, setSelectedEnrollment] = useState<VisaEnrollment | null>(INITIAL_ENROLLMENTS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' });

  // Token Request State
  const [isRequestingToken, setIsRequestingToken] = useState(false);
  const [newTokenRequest, setNewTokenRequest] = useState({
    tokenType: 'DEVICE' as 'DEVICE' | 'ECOMMERCE_COF',
    deviceName: '',
    deviceType: 'SMARTPHONE'
  });

  // New Enrollment Form State
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({
    fullName: '',
    email: '',
    phone: '',
    pan: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    walletProvider: 'SOVEREIGN_WALLET' as VisaEnrollment['walletProvider']
  });
  const [showPan, setShowPan] = useState(false);

  // Gemini AI Integration State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Sync edit form when selected enrollment changes
  useEffect(() => {
    if (selectedEnrollment) {
      setEditForm({
        fullName: selectedEnrollment.fullName,
        email: selectedEnrollment.email,
        phone: selectedEnrollment.phone
      });
      // Auto-trigger AI risk assessment for the newly selected enrollment
      analyzeWithGemini(selectedEnrollment);
    } else {
      setAiAnalysis('');
    }
  }, [selectedEnrollment]);

  // Filter & Search Logic
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      const matchesSearch = 
        item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.enrollmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.panLast4.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesWallet = walletFilter === 'ALL' || item.walletProvider === walletFilter;

      return matchesSearch && matchesStatus && matchesWallet;
    });
  }, [enrollments, searchQuery, statusFilter, walletFilter]);

  // Pagination Logic
  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEnrollments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEnrollments, currentPage]);

  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  // Handle Enrollment Update
  const handleUpdateEnrollment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setEnrollments(prev => prev.map(item => {
      if (item.enrollmentId === selectedEnrollment.enrollmentId) {
        const updated = {
          ...item,
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          updatedAt: new Date().toISOString()
        };
        setSelectedEnrollment(updated);
        return updated;
      }
      return item;
    }));
    setIsEditing(false);
  }, [selectedEnrollment, editForm]);

  // Handle Token Request (DEVICE or ECOMMERCE_COF)
  const handleRequestToken = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setIsRequestingToken(true);

    // Simulate Visa Token Service (VTS) API latency
    setTimeout(() => {
      const newToken: VisaToken = {
        tokenId: `tok_${Math.floor(100000000 + Math.random() * 900000000)}`,
        tokenReferenceId: `tr_${Math.floor(1000000 + Math.random() * 9000000)}`,
        tokenType: newTokenRequest.tokenType,
        tokenRequestorId: newTokenRequest.tokenType === 'DEVICE' ? '40000032119' : '40000010293',
        tokenRequestorName: newTokenRequest.tokenType === 'DEVICE' ? 'Sovereign Secure Element Client' : 'Sovereign Cloud Vault',
        status: 'ACTIVE',
        last4: Math.floor(1000 + Math.random() * 9000).toString(),
        expiryMonth: selectedEnrollment.panExpiryMonth,
        expiryYear: selectedEnrollment.panExpiryYear,
        deviceName: newTokenRequest.tokenType === 'DEVICE' ? newTokenRequest.deviceName : undefined,
        deviceType: newTokenRequest.tokenType === 'DEVICE' ? newTokenRequest.deviceType : undefined,
        createdAt: new Date().toISOString()
      };

      setEnrollments(prev => prev.map(item => {
        if (item.enrollmentId === selectedEnrollment.enrollmentId) {
          const updated = {
            ...item,
            tokens: [...item.tokens, newToken],
            updatedAt: new Date().toISOString()
          };
          setSelectedEnrollment(updated);
          return updated;
        }
        return item;
      }));

      setIsRequestingToken(false);
      setNewTokenRequest({ tokenType: 'DEVICE', deviceName: '', deviceType: 'SMARTPHONE' });
    }, 1500);
  }, [selectedEnrollment, newTokenRequest]);

  // Handle Token Lifecycle Management (Suspend / Resume / Deactivate)
  const handleUpdateTokenStatus = useCallback((tokenId: string, newStatus: VisaToken['status']) => {
    if (!selectedEnrollment) return;

    setEnrollments(prev => prev.map(item => {
      if (item.enrollmentId === selectedEnrollment.enrollmentId) {
        const updatedTokens = item.tokens.map(tok => {
          if (tok.tokenId === tokenId) {
            return { ...tok, status: newStatus };
          }
          return tok;
        });
        const updated = {
          ...item,
          tokens: updatedTokens,
          updatedAt: new Date().toISOString()
        };
        setSelectedEnrollment(updated);
        return updated;
      }
      return item;
    }));
  }, [selectedEnrollment]);

  // Handle New Enrollment Submission
  const handleCreateEnrollment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newEnrollment.fullName || !newEnrollment.email || !newEnrollment.pan) return;

    const panLast4 = newEnrollment.pan.slice(-4);
    const generatedId = `enr_${Math.floor(100000000 + Math.random() * 900000000)}`;
    
    // Calculate a simulated risk score based on inputs
    const simulatedRisk = Math.floor(Math.random() * 30) + (newEnrollment.walletProvider === 'SOVEREIGN_WALLET' ? 5 : 15);

    const enrollment: VisaEnrollment = {
      enrollmentId: generatedId,
      fullName: newEnrollment.fullName,
      email: newEnrollment.email,
      phone: newEnrollment.phone,
      panLast4,
      panExpiryMonth: newEnrollment.expiryMonth || '12',
      panExpiryYear: newEnrollment.expiryYear || '2029',
      walletProvider: newEnrollment.walletProvider,
      status: 'ENROLLED',
      riskScore: simulatedRisk,
      tokens: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEnrollments(prev => [enrollment, ...prev]);
    setSelectedEnrollment(enrollment);
    setIsEnrolling(false);
    
    // Reset form
    setNewEnrollment({
      fullName: '',
      email: '',
      phone: '',
      pan: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      walletProvider: 'SOVEREIGN_WALLET'
    });
  }, [newEnrollment]);

  // Gemini AI Risk & Strategy Analysis
  const analyzeWithGemini = async (enrollment: VisaEnrollment) => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    try {
      const prompt = `
        You are an expert Visa Token Service (VTS) risk analyst and security architect.
        Analyze the following Visa Pay enrollment details and provide a professional, commercial-grade risk assessment and tokenization strategy.
        
        Enrollment Details:
        - Enrollment ID: ${enrollment.enrollmentId}
        - Full Name: ${enrollment.fullName}
        - Email: ${enrollment.email}
        - Phone: ${enrollment.phone}
        - Wallet Provider: ${enrollment.walletProvider}
        - Current Status: ${enrollment.status}
        - Simulated Risk Score: ${enrollment.riskScore}/100
        - Active Tokens: ${enrollment.tokens.length}
        
        Please provide:
        1. **Risk Profile Analysis**: Evaluate the risk of this enrollment based on the wallet provider, contact details, and current token footprint.
        2. **Tokenization Strategy**: Recommend whether they should request additional tokens (e.g., DEVICE vs ECOMMERCE_COF) and what security controls (like device binding or step-up authentication) should be applied.
        3. **Actionable Recommendations**: Clear next steps for the administrator.
        
        Keep the response concise, highly professional, and formatted in clean markdown.
      `;
      
      const response = await callGemini(prompt);
      setAiAnalysis(response || 'Unable to generate AI analysis at this time.');
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setAiAnalysis('Error generating AI analysis. Please check your Gemini API configuration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Custom AI Prompt Execution
  const handleCustomAiPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment || !aiPrompt) return;

    setIsAnalyzing(true);
    try {
      const prompt = `
        Context: Visa Pay Enrollment ${selectedEnrollment.enrollmentId} for ${selectedEnrollment.fullName}.
        User Query: ${aiPrompt}
        
        Provide a precise, expert response addressing the query in the context of Visa Token Service, payment security, and risk management.
      `;
      const response = await callGemini(prompt);
      setAiAnalysis(response || 'No response from AI.');
      setAiPrompt('');
    } catch (error) {
      console.error('Error executing custom AI prompt:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Visa Pay Enrollment Manager</h1>
              <p className="text-sm text-slate-400">Manage secure tokenized enrollments, device bindings, and AI-driven risk profiles via Visa Token Service (VTS).</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEnrolling(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/10"
          >
            <Plus className="w-4 h-4" />
            New Enrollment
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Enrollment Search & List (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  Active Enrollments
                </h2>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ENROLLED">Enrolled</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>

                  <select 
                    value={walletFilter}
                    onChange={(e) => { setWalletFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Wallets</option>
                    <option value="SOVEREIGN_WALLET">Sovereign Wallet</option>
                    <option value="APPLE_PAY">Apple Pay</option>
                    <option value="GOOGLE_PAY">Google Pay</option>
                    <option value="SAMSUNG_PAY">Samsung Pay</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by name, email, enrollment ID, or PAN last 4..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Enrollments Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Enrollment ID / Name</th>
                      <th className="p-4">Wallet / Card</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Risk Score</th>
                      <th className="p-4">Tokens</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {paginatedEnrollments.length > 0 ? (
                      paginatedEnrollments.map((enrollment) => (
                        <tr 
                          key={enrollment.enrollmentId}
                          onClick={() => setSelectedEnrollment(enrollment)}
                          className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${
                            selectedEnrollment?.enrollmentId === enrollment.enrollmentId ? 'bg-blue-600/5 border-l-2 border-l-blue-500' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-medium text-slate-200">{enrollment.fullName}</div>
                            <div className="text-xs text-slate-500 font-mono">{enrollment.enrollmentId}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">
                                {enrollment.walletProvider.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                •••• {enrollment.panLast4}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              enrollment.status === 'ENROLLED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              enrollment.status === 'PENDING_VERIFICATION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                enrollment.status === 'ENROLLED' ? 'bg-emerald-400' :
                                enrollment.status === 'PENDING_VERIFICATION' ? 'bg-amber-400' :
                                'bg-rose-400'
                              }`} />
                              {enrollment.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    enrollment.riskScore < 30 ? 'bg-emerald-500' :
                                    enrollment.riskScore < 60 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${enrollment.riskScore}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold ${
                                enrollment.riskScore < 30 ? 'text-emerald-400' :
                                enrollment.riskScore < 60 ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {enrollment.riskScore}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-semibold">
                              {enrollment.tokens.length} Active
                            </span>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => setSelectedEnrollment(enrollment)}
                              className="text-slate-400 hover:text-blue-400 p-1 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No enrollments found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-400">
                    Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-semibold text-slate-200">
                      {Math.min(currentPage * itemsPerPage, filteredEnrollments.length)}
                    </span>{' '}
                    of <span className="font-semibold text-slate-200">{filteredEnrollments.length}</span> enrollments
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-300 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* AI Risk Assessment & Strategy Panel */}
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">Gemini AI Security & Strategy Assistant</h3>
                </div>
                {selectedEnrollment && (
                  <button
                    onClick={() => analyzeWithGemini(selectedEnrollment)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    Re-Analyze
                  </button>
                )}
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-sm text-slate-400">Gemini is analyzing enrollment risk vectors and VTS tokenization parameters...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto prose prose-invert">
                    <div className="whitespace-pre-wrap">{aiAnalysis}</div>
                  </div>
                  
                  {/* Custom AI Query Form */}
                  <form onSubmit={handleCustomAiPrompt} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask Gemini about this enrollment's security, e.g., 'Should we enforce step-up auth?'"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Ask AI
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Select an enrollment above to view its automated Gemini AI risk profile and tokenization strategy.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Enrollment View & Token Lifecycle (1/3 width) */}
        <div className="space-y-6">
          {selectedEnrollment ? (
            <>
              {/* Enrollment Details Card */}
              <Card className="bg-slate-900 border-slate-800">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      Enrollment Details
                    </h3>
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setEditForm({
                          fullName: selectedEnrollment.fullName,
                          email: selectedEnrollment.email,
                          phone: selectedEnrollment.phone
                        });
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateEnrollment} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Save Changes
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500">Enrollment ID</div>
                          <div className="text-sm font-mono text-slate-300">{selectedEnrollment.enrollmentId}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Wallet Provider</div>
                          <div className="text-sm text-slate-300">{selectedEnrollment.walletProvider.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Card PAN Last 4</div>
                          <div className="text-sm font-mono text-slate-300">•••• {selectedEnrollment.panLast4}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Card Expiry</div>
                          <div className="text-sm font-mono text-slate-300">{selectedEnrollment.panExpiryMonth}/{selectedEnrollment.panExpiryYear}</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/60 pt-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <User className="w-4 h-4 text-slate-500" />
                          <span>{selectedEnrollment.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span>{selectedEnrollment.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{selectedEnrollment.phone || 'No phone provided'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className={`w-5 h-5 ${selectedEnrollment.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`} />
                          <div>
                            <div className="text-xs text-slate-400">Visa Risk Score</div>
                            <div className="text-sm font-bold text-slate-200">{selectedEnrollment.riskScore} / 100</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          selectedEnrollment.riskScore < 30 ? 'bg-emerald-500/10 text-emerald-400' :
                          selectedEnrollment.riskScore < 60 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {selectedEnrollment.riskScore < 30 ? 'Low Risk' :
                           selectedEnrollment.riskScore < 60 ? 'Medium Risk' : 'High Risk'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Active Tokens & Lifecycle Management */}
              <Card className="bg-slate-900 border-slate-800">
                <div className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-800 pb-4">
                    <Key className="w-5 h-5 text-blue-400" />
                    Active Visa Tokens ({selectedEnrollment.tokens.length})
                  </h3>

                  {selectedEnrollment.tokens.length > 0 ? (
                    <div className="space-y-4">
                      {selectedEnrollment.tokens.map((token) => (
                        <div key={token.tokenId} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded">
                                  {token.tokenType}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  •••• {token.last4}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-1">ID: {token.tokenId}</div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                              token.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                              token.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {token.status}
                            </span>
                          </div>

                          {token.deviceName && (
                            <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                              <span className="font-semibold text-slate-300">Device:</span> {token.deviceName} ({token.deviceType})
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/50">
                            {token.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleUpdateTokenStatus(token.tokenId, 'SUSPENDED')}
                                className="text-xs bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded transition-colors"
                              >
                                Suspend
                              </button>
                            ) : token.status === 'SUSPENDED' ? (
                              <button
                                onClick={() => handleUpdateTokenStatus(token.tokenId, 'ACTIVE')}
                                className="text-xs bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded transition-colors"
                              >
                                Resume
                              </button>
                            ) : null}
                            
                            {token.status !== 'DEACTIVATED' && (
                              <button
                                onClick={() => handleUpdateTokenStatus(token.tokenId, 'DEACTIVATED')}
                                className="text-xs bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded transition-colors"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      No active tokens provisioned for this enrollment.
                    </div>
                  )}

                  {/* Request Additional Token Form */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-300">Provision Additional Token</h4>
                    <form onSubmit={handleRequestToken} className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Token Type</label>
                        <select
                          value={newTokenRequest.tokenType}
                          onChange={(e) => setNewTokenRequest({ ...newTokenRequest, tokenType: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="DEVICE">Device Token (HCE / Secure Element)</option>
                          <option value="ECOMMERCE_COF">eCommerce Card-on-File Token</option>
                        </select>
                      </div>

                      {newTokenRequest.tokenType === 'DEVICE' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Device Name</label>
                            <input
                              type="text"
                              placeholder="e.g., iPhone 15 Pro"
                              value={newTokenRequest.deviceName}
                              onChange={(e) => setNewTokenRequest({ ...newTokenRequest, deviceName: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                              required={newTokenRequest.tokenType === 'DEVICE'}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Device Type</label>
                            <select
                              value={newTokenRequest.deviceType}
                              onChange={(e) => setNewTokenRequest({ ...newTokenRequest, deviceType: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            >
                              <option value="SMARTPHONE">Smartphone</option>
                              <option value="SMARTWATCH">Smartwatch</option>
                              <option value="TABLET">Tablet</option>
                              <option value="WEARABLE">Other Wearable</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isRequestingToken}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isRequestingToken ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Provisioning Token...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            Request Visa Token
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              Select an enrollment from the list to view details, manage active tokens, and run AI risk assessments.
            </div>
          )}
        </div>
      </div>

      {/* New Enrollment Modal */}
      {isEnrolling && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="text-blue-400 w-5 h-5" />
                New Visa Pay Enrollment
              </h3>
              <button 
                onClick={() => setIsEnrolling(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnrollment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newEnrollment.fullName}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={newEnrollment.email}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newEnrollment.phone}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Primary Account Number (PAN)</label>
                  <div className="relative">
                    <input
                      type={showPan ? 'text' : 'password'}
                      placeholder="16-digit card number"
                      value={newEnrollment.pan}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, pan: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                      maxLength={19}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPan(!showPan)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPan ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="MM"
                      value={newEnrollment.expiryMonth}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, expiryMonth: e.target.value })}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-blue-500 font-mono"
                      maxLength={2}
                      required
                    />
                    <input
                      type="text"
                      placeholder="YYYY"
                      value={newEnrollment.expiryYear}
                      onChange={(e) => setNewEnrollment({ ...newEnrollment, expiryYear: e.target.value })}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-blue-500 font-mono"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={newEnrollment.cvv}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, cvv: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-blue-500 font-mono"
                    maxLength={4}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Wallet Provider</label>
                  <select
                    value={newEnrollment.walletProvider}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, walletProvider: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SOVEREIGN_WALLET">Sovereign Wallet (Secure Element)</option>
                    <option value="APPLE_PAY">Apple Pay</option>
                    <option value="GOOGLE_PAY">Google Pay</option>
                    <option value="SAMSUNG_PAY">Samsung Pay</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEnrolling(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Enroll Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}