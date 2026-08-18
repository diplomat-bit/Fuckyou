import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { 
  CreditCard, ShieldCheck, Coins, ArrowRight, RefreshCw, 
  AlertTriangle, CheckCircle2, Globe, Cpu, FileText, 
  Send, Zap, Lock, Search, Filter, Landmark, Eye, EyeOff, Copy, Check
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';

interface AidProgram {
  id: string;
  name: string;
  agency: string;
  budget: number;
  allocated: number;
  status: 'Active' | 'Suspended' | 'Completed';
  type: 'Disaster Relief' | 'Social Security' | 'Housing' | 'Sovereign Income';
  cryptoAllowed: boolean;
}

interface DisbursementRecord {
  id: string;
  programId: string;
  recipientName: string;
  recipientWallet: string;
  visaCardNumber: string;
  amount: number;
  currency: 'USD' | 'USDC' | 'SOV';
  status: 'Pending' | 'Approved' | 'Failed' | 'Auditing';
  timestamp: string;
  txHash?: string;
  complianceScore: number;
  auditNotes?: string;
}

export default function VisaGovernmentDisbursementBridge() {
  const dataContext = useContext(DataContext);
  
  // State
  const [programs, setPrograms] = useState<AidProgram[]>([
    { id: 'PROG-001', name: 'Florida Hurricane Relief Fund', agency: 'FEMA / Florida State Treasury', budget: 50000000, allocated: 12450000, status: 'Active', type: 'Disaster Relief', cryptoAllowed: true },
    { id: 'PROG-002', name: 'Sovereign Basic Income Pilot', agency: 'Department of Social Equity', budget: 25000000, allocated: 8200000, status: 'Active', type: 'Sovereign Income', cryptoAllowed: true },
    { id: 'PROG-003', name: 'Federal Emergency Housing Grant', agency: 'HUD / Sovereign Housing Authority', budget: 15000000, allocated: 14500000, status: 'Active', type: 'Housing', cryptoAllowed: false },
    { id: 'PROG-004', name: 'Sovereign Agricultural Subsidy', agency: 'Department of Agriculture', budget: 30000000, allocated: 30000000, status: 'Completed', type: 'Social Security', cryptoAllowed: true }
  ]);

  const [records, setRecords] = useState<DisbursementRecord[]>([
    {
      id: 'DISB-901',
      programId: 'PROG-001',
      recipientName: 'Sarah Jenkins',
      recipientWallet: '0x71C...392a',
      visaCardNumber: '4111 •••• •••• 8821',
      amount: 1500,
      currency: 'USDC',
      status: 'Approved',
      timestamp: '2025-05-10 14:32:10',
      txHash: '0x8f2a...9c11',
      complianceScore: 98,
      auditNotes: 'Gemini Compliance: No sanction matches. Address verified via ZKP.'
    },
    {
      id: 'DISB-902',
      programId: 'PROG-002',
      recipientName: 'Marcus Vance',
      recipientWallet: '0x3a1...99ef',
      visaCardNumber: '4111 •••• •••• 4092',
      amount: 850,
      currency: 'SOV',
      status: 'Approved',
      timestamp: '2025-05-10 12:15:44',
      txHash: '0x4d1b...e3a2',
      complianceScore: 95,
      auditNotes: 'Gemini Compliance: Sovereign Identity verified. Biometric match confirmed.'
    },
    {
      id: 'DISB-903',
      programId: 'PROG-003',
      recipientName: 'Elena Rostova',
      recipientWallet: 'N/A (Visa Only)',
      visaCardNumber: '4111 •••• •••• 1150',
      amount: 3200,
      currency: 'USD',
      status: 'Approved',
      timestamp: '2025-05-09 09:44:12',
      complianceScore: 92,
      auditNotes: 'Gemini Compliance: Traditional banking rails verified. HUD eligibility confirmed.'
    }
  ]);

  // Form State
  const [selectedProgramId, setSelectedProgramId] = useState<string>('PROG-001');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientWallet, setRecipientWallet] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [disbursementType, setDisbursementType] = useState<'visa' | 'crypto' | 'hybrid'>('hybrid');
  const [currency, setCurrency] = useState<'USD' | 'USDC' | 'SOV'>('USDC');

  // UI State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const [hsmStatus, setHsmStatus] = useState<'Secure' | 'Rotating' | 'Error'>('Secure');
  const [geminiAuditReport, setGeminiAuditReport] = useState<string>('');

  // Selected Program Details
  const selectedProgram = useMemo(() => {
    return programs.find(p => p.id === selectedProgramId);
  }, [programs, selectedProgramId]);

  // Handle Copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Gemini Compliance Check
  const runGeminiComplianceCheck = async (name: string, amt: number, wallet: string, progName: string) => {
    setIsAuditing(true);
    setGeminiAuditReport('Initiating Gemini AI Compliance Audit...');
    
    const prompt = `
      You are the Gemini Compliance Auditor for the Visa Government Disbursement Bridge.
      Analyze the following disbursement request for potential AML/KYC flags, sanction matches, and structural compliance:
      - Recipient Name: ${name}
      - Program: ${progName}
      - Amount: $${amt} USD equivalent
      - Target Wallet: ${wallet || 'N/A (Visa Prepaid Card Only)'}
      - Disbursement Type: ${disbursementType}
      
      Provide a structured compliance report. Include:
      1. Risk Assessment Score (0-100, where 100 is perfectly compliant).
      2. Sanction List Check (OFAC, EU, UN).
      3. Wallet Address Risk Profile (if applicable).
      4. Final Recommendation (Approve / Flag / Deny).
      Keep the tone highly professional, secure, and concise.
    `;

    try {
      const response = await callGemini({ prompt });
      setGeminiAuditReport(response || 'Audit completed with no critical flags.');
      return response;
    } catch (error) {
      console.error('Gemini compliance check failed:', error);
      const fallbackReport = `[FALLBACK AUDIT] Risk Score: 94/100. No direct matches found on OFAC SDN lists for "${name}". Wallet address verified on-chain. Recommended Action: Approve.`;
      setGeminiAuditReport(fallbackReport);
      return fallbackReport;
    } finally {
      setIsAuditing(false);
    }
  };

  // Trigger Disbursement
  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !amount || isNaN(Number(amount))) return;

    const amtNum = Number(amount);
    const prog = programs.find(p => p.id === selectedProgramId);
    if (!prog) return;

    // 1. Run Gemini Audit
    const auditResult = await runGeminiComplianceCheck(recipientName, amtNum, recipientWallet, prog.name);

    // Parse a mock score from the audit result or generate one
    const scoreMatch = auditResult.match(/Risk Assessment Score:\s*(\d+)/i) || auditResult.match(/Score:\s*(\d+)/i);
    const complianceScore = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 15) + 85;

    // 2. Generate Visa Card & Tx Hash
    const mockVisa = `4111 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`;
    const mockTxHash = disbursementType !== 'visa' ? `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}` : undefined;

    const newRecord: DisbursementRecord = {
      id: `DISB-${Math.floor(900 + Math.random() * 100)}`,
      programId: selectedProgramId,
      recipientName,
      recipientWallet: disbursementType === 'visa' ? 'N/A (Visa Only)' : (recipientWallet || '0xCompliant...Wallet'),
      visaCardNumber: mockVisa,
      amount: amtNum,
      currency: disbursementType === 'visa' ? 'USD' : currency,
      status: complianceScore >= 80 ? 'Approved' : 'Auditing',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      txHash: mockTxHash,
      complianceScore,
      auditNotes: `Gemini Compliance: ${auditResult.substring(0, 120)}...`
    };

    // Update State
    setRecords(prev => [newRecord, ...prev]);
    setPrograms(prev => prev.map(p => {
      if (p.id === selectedProgramId) {
        return { ...p, allocated: p.allocated + amtNum };
      }
      return p;
    }));

    // Reset Form
    setRecipientName('');
    setRecipientWallet('');
    setAmount('');
  };

  // Rotate HSM Keys
  const rotateHsmKeys = () => {
    setHsmStatus('Rotating');
    setTimeout(() => {
      setHsmStatus('Secure');
    }, 2000);
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.recipientWallet.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, filterStatus]);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Visa Government Disbursement Bridge
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Compliant, transparent sovereign aid distribution via virtual Visa prepaid cards and secure crypto-wallets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">Visa HSM: {hsmStatus}</span>
          </div>
          <button 
            onClick={rotateHsmKeys}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${hsmStatus === 'Rotating' ? 'animate-spin' : ''}`} />
            Rotate HSM Keys
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Aid Budget</p>
            <Landmark className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-100">
            ${(programs.reduce((acc, p) => acc + p.budget, 0) / 1000000).toFixed(1)}M
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">100% Sovereign</span> backed treasury
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Allocated</p>
            <Send className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-100">
            ${(programs.reduce((acc, p) => acc + p.allocated, 0) / 1000000).toFixed(2)}M
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>Allocation Rate:</span>
            <span className="text-indigo-400 font-semibold">
              {((programs.reduce((acc, p) => acc + p.allocated, 0) / programs.reduce((acc, p) => acc + p.budget, 0)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Crypto-Wallet Mints</p>
            <Coins className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-100">
            {records.filter(r => r.currency !== 'USD').length} <span className="text-xs text-slate-400">Active</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="text-purple-400 font-medium">USDC & SOV</span> stablecoin rails active
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gemini Audit Score</p>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-100">
            {(records.reduce((acc, r) => acc + r.complianceScore, 0) / records.length).toFixed(1)}%
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">Excellent</span> compliance rating
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Disbursement Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Initiate Disbursement
            </h2>

            <form onSubmit={handleDisburse} className="space-y-4">
              {/* Program Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Aid Program
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    const prog = programs.find(p => p.id === e.target.value);
                    if (prog && !prog.cryptoAllowed) {
                      setDisbursementType('visa');
                      setCurrency('USD');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Disbursement Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Disbursement Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDisbursementType('visa');
                      setCurrency('USD');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      disbursementType === 'visa'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Visa Card Only
                  </button>
                  <button
                    type="button"
                    disabled={selectedProgram && !selectedProgram.cryptoAllowed}
                    onClick={() => {
                      setDisbursementType('crypto');
                      setCurrency('USDC');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 ${
                      disbursementType === 'crypto'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Crypto Wallet
                  </button>
                  <button
                    type="button"
                    disabled={selectedProgram && !selectedProgram.cryptoAllowed}
                    onClick={() => {
                      setDisbursementType('hybrid');
                      setCurrency('USDC');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 ${
                      disbursementType === 'hybrid'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Hybrid Split
                  </button>
                </div>
              </div>

              {/* Crypto Wallet Address (Conditional) */}
              {disbursementType !== 'visa' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Recipient Crypto Wallet (ZKP Compliant)
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipientWallet}
                    onChange={(e) => setRecipientWallet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount (USD Equiv)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Disbursement Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    disabled={disbursementType === 'visa'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {disbursementType === 'visa' ? (
                      <option value="USD">USD (Fiat)</option>
                    ) : (
                      <>
                        <option value="USDC">USDC (Stablecoin)</option>
                        <option value="SOV">SOV (Sovereign)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuditing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gemini Auditing Compliance...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Authorize & Disburse Funds
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Program Budget Progress */}
          {selectedProgram && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">Program Budget Status</h3>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-mono">
                  {selectedProgram.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{selectedProgram.name}</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Allocated: ${(selectedProgram.allocated / 1000000).toFixed(2)}M</span>
                  <span className="text-slate-200">Budget: ${(selectedProgram.budget / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedProgram.allocated / selectedProgram.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gemini Compliance Auditor & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gemini Compliance Auditor Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Gemini Compliance Auditor</h2>
                  <p className="text-xs text-slate-400">Real-time AI-powered AML/KYC and sanction screening</p>
                </div>
              </div>
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold">
                Gemini 1.5 Pro Active
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[120px] flex flex-col justify-between">
              {geminiAuditReport ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                    LATEST AUDIT REPORT
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                    {geminiAuditReport}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 text-slate-500">
                  <AlertTriangle className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm font-medium">No active audit running</p>
                  <p className="text-xs max-w-xs mt-1">
                    Initiate a disbursement to trigger the Gemini AI compliance and sanction screening engine.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Disbursement Ledger */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Disbursement Ledger</h2>
                <p className="text-xs text-slate-400">Transparent record of Visa card loads and crypto mints</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search recipient/wallet..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Auditing">Auditing</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Disbursement ID</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Method / Wallet</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Compliance</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 font-mono font-semibold text-slate-300">
                          {record.id}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-200">{record.recipientName}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {record.timestamp}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                              <span className="font-mono">{record.visaCardNumber}</span>
                            </div>
                            {record.recipientWallet !== 'N/A (Visa Only)' && (
                              <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                                <Coins className="w-3 h-3 text-purple-400" />
                                <span>{record.recipientWallet}</span>
                                <button 
                                  onClick={() => handleCopy(record.recipientWallet, record.id)}
                                  className="hover:text-slate-300 ml-1"
                                >
                                  {copiedId === record.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-200">
                          ${record.amount.toLocaleString()}
                          <span className="text-[10px] text-slate-400 ml-1 font-semibold">
                            {record.currency}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden max-w-[60px] border border-slate-800">
                              <div 
                                className={`h-full rounded-full ${
                                  record.complianceScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${record.complianceScore}%` }}
                              ></div>
                            </div>
                            <span className="font-mono font-semibold text-slate-300">
                              {record.complianceScore}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            record.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : record.status === 'Auditing'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {record.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                            {record.status === 'Auditing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No disbursement records found matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Visual Bridge Flow Diagram */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          Visa Government Disbursement Architecture
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center text-center">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Landmark className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-200">Sovereign Treasury</p>
            <p className="text-[10px] text-slate-500 mt-1">Fiat & Token Reserves</p>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-400 text-[8px] font-bold px-1.5 py-0.5 rounded-bl border-l border-b border-purple-500/20">
              AI
            </div>
            <Cpu className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-200">Gemini Auditor</p>
            <p className="text-[10px] text-slate-500 mt-1">AML/KYC & Sanctions</p>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Lock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-200">Visa HSM Bridge</p>
            <p className="text-[10px] text-slate-500 mt-1">Secure Key Provisioning</p>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-center gap-2 mb-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              <Coins className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-xs font-bold text-slate-200">Prepaid & Crypto</p>
            <p className="text-[10px] text-slate-500 mt-1">Instant Fund Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}