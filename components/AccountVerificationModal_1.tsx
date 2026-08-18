import React, { useState, FC, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Lock,
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Database,
  Key,
  Eye,
  EyeOff,
  Terminal,
  CreditCard,
  RefreshCw,
  Search,
  Settings,
  UserCheck,
  Globe,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  Layers,
  HardDrive,
  Fingerprint,
  Smartphone,
  FileText,
  Share2,
  ArrowRightLeft,
  TrendingUp,
  Gauge
} from 'lucide-react';

/**
 * QUANTUM FINANCIAL - THE ELITE BUSINESS DEMO ENGINE
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High polish, zero friction.
 * - "Test Drive": Interactive, visual, and responsive.
 * - "Bells and Whistles": Advanced simulations (Fraud, MFA, ERP).
 * - "Cheat Sheet": Clear insights into complex banking operations.
 * - "No Pressure": Sandbox environment for exploration.
 * 
 * METAPHOR: Kick the tires. See the engine roar.
 */

// --- TYPES & INTERFACES ---

interface ExternalAccount {
  id: string;
  party_name: string;
  verification_status: 'unverified' | 'pending_verification' | 'verified';
  account_type: string;
  routing_number: string;
  account_number_suffix: string;
}

interface InternalAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  metadata: any;
  securityLevel: 'Standard' | 'Elevated' | 'Critical';
  status: 'Success' | 'Warning' | 'Failure';
}

interface FraudSignal {
  id: string;
  type: 'IP_GEOLOCATION' | 'VELOCITY_CHECK' | 'BEHAVIORAL_BIOMETRICS' | 'DEVICE_FINGERPRINT';
  score: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
}

interface AccountVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  externalAccount: ExternalAccount | null;
}

type VerificationStep = 'initiate' | 'mfa' | 'fraud_analysis' | 'erp_sync' | 'final_review' | 'success';

// --- SIMULATED ENGINES ---

/**
 * FraudEngine: Heuristic analysis simulation.
 */
const simulateFraudAnalysis = (): FraudSignal[] => [
  { id: 'f1', type: 'IP_GEOLOCATION', score: 0.98, status: 'PASS', details: 'Originating IP matches known corporate headquarters.' },
  { id: 'f2', type: 'VELOCITY_CHECK', score: 0.95, status: 'PASS', details: 'Transaction frequency within normal operational bounds.' },
  { id: 'f3', type: 'BEHAVIORAL_BIOMETRICS', score: 0.88, status: 'PASS', details: 'Keystroke dynamics match authorized user profile.' },
  { id: 'f4', type: 'DEVICE_FINGERPRINT', score: 0.99, status: 'PASS', details: 'Trusted device ID recognized and verified.' }
];

// --- UI COMPONENTS (ELITE POLISH) ---

const QuantumButton: FC<any> = ({ children, variant = 'primary', isLoading, icon: Icon, ...props }) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    secondary: "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
    danger: "bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} disabled={isLoading} {...props}>
      <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
      {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>{Icon && <Icon className="w-5 h-5" />}{children}</>}
    </button>
  );
};

const QuantumInput: FC<any> = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2 w-full group">
    {label && <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-blue-400 transition-colors">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />}
      <input 
        className={`w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 ${Icon ? 'pl-12' : 'px-5'} pr-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm`}
        {...props}
      />
    </div>
  </div>
);

const AuditBadge: FC<{ level: string; status?: string }> = ({ level, status = 'Success' }) => {
  const colors: any = {
    Standard: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Elevated: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Critical: "bg-red-500/10 text-red-400 border-red-500/20"
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold tracking-tighter uppercase ${colors[level]}`}>
        {level}
      </span>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Success' ? 'bg-emerald-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
    </div>
  );
};

// --- MAIN COMPONENT ---

export const AccountVerificationModal: FC<AccountVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  externalAccount,
}) => {
  // State Management
  const [step, setStep] = useState<VerificationStep>('initiate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [fraudSignals, setFraudSignals] = useState<FraudSignal[]>([]);
  const [erpStatus, setErpStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');

  // --- LOGGING UTILITY ---
  const addAuditLog = useCallback((action: string, metadata: any = {}, level: AuditLogEntry['securityLevel'] = 'Standard', status: AuditLogEntry['status'] = 'Success') => {
    const entry: AuditLogEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor: 'SYSTEM_ARCHITECT_01',
      metadata,
      securityLevel: level,
      status
    };
    setAuditLogs(prev => [entry, ...prev].slice(0, 100));
  }, []);

  // --- BUSINESS LOGIC ---

  const handleNextStep = async () => {
    setIsLoading(true);
    addAuditLog("TRANSITION_STEP", { from: step }, "Standard");
    
    await new Promise(r => setTimeout(r, 1200));

    switch (step) {
      case 'initiate':
        setStep('mfa');
        addAuditLog("MFA_CHALLENGE_ISSUED", { method: 'SMS_SECURE' }, "Elevated");
        break;
      case 'mfa':
        setStep('fraud_analysis');
        setFraudSignals(simulateFraudAnalysis());
        addAuditLog("FRAUD_ENGINE_SCAN_COMPLETE", { signals: 4 }, "Critical");
        break;
      case 'fraud_analysis':
        setStep('erp_sync');
        addAuditLog("ERP_INTEGRATION_INITIATED", { provider: 'QUICKBOOKS_ONLINE' }, "Standard");
        break;
      case 'erp_sync':
        setStep('final_review');
        break;
      case 'final_review':
        setStep('success');
        addAuditLog("VERIFICATION_FINALIZED", { accountId: externalAccount?.id }, "Critical");
        onSuccess();
        break;
    }
    setIsLoading(false);
  };

  const handleErpSync = async () => {
    setErpStatus('syncing');
    addAuditLog("ERP_DATA_STREAM_START", {}, "Standard");
    await new Promise(r => setTimeout(r, 2500));
    setErpStatus('complete');
    addAuditLog("ERP_DATA_STREAM_SYNCED", { records: 142 }, "Standard");
  };

  // --- RENDER HELPERS ---

  const renderStepContent = () => {
    switch (step) {
      case 'initiate':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Global Account Link</h4>
                <p className="text-sm text-slate-400 mt-1">You are initiating a secure link with <b>{externalAccount?.party_name}</b>. This process uses Quantum Financial's proprietary verification engine.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Routing Number</span>
                <p className="text-white font-mono mt-1">{externalAccount?.routing_number}</p>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Account Suffix</span>
                <p className="text-white font-mono mt-1">•••• {externalAccount?.account_number_suffix}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 italic">* Micro-deposits will be initiated to verify ownership. This is a non-pressure environment.</p>
              <QuantumButton onClick={handleNextStep} isLoading={isLoading} icon={Zap}>
                Start Verification Engine
              </QuantumButton>
            </div>
          </motion.div>
        );

      case 'mfa':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 bg-amber-500/10 rounded-full text-amber-500 mb-2">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Multi-Factor Authentication</h3>
              <p className="text-sm text-slate-400">Enter the 6-digit code sent to your secure device.</p>
            </div>

            <div className="flex justify-center gap-3">
              {[1,2,3,4,5,6].map((i) => (
                <input 
                  key={i} 
                  type="text" 
                  maxLength={1} 
                  className="w-12 h-14 bg-slate-900 border border-slate-700 rounded-xl text-center text-xl font-bold text-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  onChange={(e) => {
                    if (e.target.value && i === 6) handleNextStep();
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <QuantumButton onClick={handleNextStep} isLoading={isLoading} variant="primary">Verify Identity</QuantumButton>
              <QuantumButton variant="ghost">Resend Code</QuantumButton>
            </div>
          </motion.div>
        );

      case 'fraud_analysis':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Heuristic Fraud Engine
              </h3>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">SECURE_LINK_ESTABLISHED</span>
            </div>

            <div className="space-y-3">
              {fraudSignals.map((signal) => (
                <div key={signal.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${signal.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {signal.type === 'IP_GEOLOCATION' && <Globe className="w-4 h-4" />}
                      {signal.type === 'VELOCITY_CHECK' && <Activity className="w-4 h-4" />}
                      {signal.type === 'BEHAVIORAL_BIOMETRICS' && <Fingerprint className="w-4 h-4" />}
                      {signal.type === 'DEVICE_FINGERPRINT' && <Layers className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{signal.type.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-slate-500">{signal.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-emerald-400">{(signal.score * 100).toFixed(1)}%</p>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">Confidence</p>
                  </div>
                </div>
              ))}
            </div>

            <QuantumButton onClick={handleNextStep} isLoading={isLoading} icon={ChevronRight}>Proceed to Integration</QuantumButton>
          </motion.div>
        );

      case 'erp_sync':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl text-center space-y-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative p-6 bg-slate-800 rounded-2xl border border-slate-700">
                  <Layers className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">ERP Synchronization</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Automatically map your chart of accounts and reconcile transactions with your accounting software.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">QuickBooks Online</span>
                </div>
                {erpStatus === 'complete' ? (
                  <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Synced</span>
                ) : (
                  <button onClick={handleErpSync} disabled={erpStatus === 'syncing'} className="text-xs text-blue-400 hover:text-blue-300 font-bold">
                    {erpStatus === 'syncing' ? 'Syncing...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            <QuantumButton onClick={handleNextStep} isLoading={isLoading} disabled={erpStatus !== 'complete'}>Review & Finalize</QuantumButton>
          </motion.div>
        );

      case 'final_review':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Final Review</h3>
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-500">Entity Name</span>
                  <span className="text-sm text-white font-bold">{externalAccount?.party_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-500">Account Type</span>
                  <span className="text-sm text-white">{externalAccount?.account_type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-500">Security Protocol</span>
                  <span className="text-sm text-blue-400 font-mono">QUANTUM_VAULT_V4</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-500">Audit Status</span>
                  <span className="text-sm text-emerald-500">CLEARED</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-200/70">By finalizing, you authorize Quantum Financial to establish a persistent secure link for automated treasury operations.</p>
            </div>

            <QuantumButton onClick={handleNextStep} isLoading={isLoading} variant="primary" icon={ShieldCheck}>
              Authorize & Complete
            </QuantumButton>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 py-8">
            <div className="relative inline-block">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"
              />
              <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Verification Successful</h2>
              <p className="text-slate-400">Your account is now part of the Quantum Financial ecosystem.</p>
            </div>
            <div className="pt-4">
              <QuantumButton onClick={onClose} variant="secondary">Return to Dashboard</QuantumButton>
            </div>
          </motion.div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />

      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-500"
      >
        {/* MAIN PANEL: THE ENGINE ROOM */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Quantum Financial</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verification Core v4.2</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full" />
                  <span className="text-[10px] font-mono text-blue-400">{step.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAudit(!showAudit)} 
                className={`p-3 rounded-xl transition-all ${showAudit ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                title="Audit Logs"
              >
                <Terminal className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                <Lock className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
            <div className="max-w-2xl mx-auto">
              {renderStepContent()}
            </div>
          </div>

          {/* Footer / Progress Bar */}
          <div className="p-6 bg-slate-950/50 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Integrity</span>
              <span className="text-[10px] font-mono text-emerald-500">99.99% OPERATIONAL</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                initial={{ width: '0%' }}
                animate={{ 
                  width: 
                    step === 'initiate' ? '20%' : 
                    step === 'mfa' ? '40%' : 
                    step === 'fraud_analysis' ? '60%' : 
                    step === 'erp_sync' ? '80%' : '100%' 
                }}
              />
            </div>
          </div>
        </div>

        {/* OVERLAY: AUDIT LOG VIEWER */}
        <AnimatePresence>
          {showAudit && (
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full md:w-[500px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">System Audit Trail</h3>
                </div>
                <button onClick={() => setShowAudit(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3 group hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <AuditBadge level={log.securityLevel} status={log.status} />
                      <span className="text-[9px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{log.action}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {log.id}</p>
                    </div>
                    {Object.keys(log.metadata).length > 0 && (
                      <div className="p-3 bg-black/40 rounded-lg">
                        <pre className="text-[9px] text-blue-400/80 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Total Entries: {auditLogs.length}</span>
                  <span className="text-blue-400 cursor-pointer hover:underline">Export CSV</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};