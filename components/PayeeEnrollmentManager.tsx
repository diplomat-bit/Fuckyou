import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building2, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  DollarSign, 
  HelpCircle,
  RefreshCw,
  FileText,
  ChevronRight
} from 'lucide-react';

// Types & Interfaces
export interface BankDetails {
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountHolderName: string;
  accountType: 'CHECKING' | 'SAVINGS';
}

export type EnrollmentStatus = 'NOT_STARTED' | 'VALIDATING' | 'PENDING' | 'SUCCESS' | 'FAILED';
export type TransferStatus = 'IDLE' | 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface StatusStep {
  label: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export default function PayeeEnrollmentManager() {
  // Form States
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    accountHolderName: '',
    accountType: 'CHECKING',
  });
  const [amount, setAmount] = useState<string>('');
  const [enrollPayee, setEnrollPayee] = useState<boolean>(true);
  const [payeeNickname, setPayeeNickname] = useState<string>('');
  
  // Process States
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>('NOT_STARTED');
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [payeeId, setPayeeId] = useState<string | null>(null);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!bankDetails.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
    if (!bankDetails.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!/^\d{9}$/.test(bankDetails.routingNumber)) newErrors.routingNumber = 'Routing number must be exactly 9 digits';
    if (!/^\d{4,17}$/.test(bankDetails.accountNumber)) newErrors.accountNumber = 'Account number must be between 4 and 17 digits';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Enter a valid transfer amount';
    if (enrollPayee && !payeeNickname.trim()) newErrors.payeeNickname = 'Payee nickname is required for enrollment';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simulate API Call to /adhocWithPayeeCreation
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Reset states
    setErrorMessage(null);
    setTransactionId(null);
    setPayeeId(null);
    
    // Start Transfer & Enrollment Pipeline
    setTransferStatus('INITIATED');
    setEnrollmentStatus(enrollPayee ? 'VALIDATING' : 'NOT_STARTED');

    try {
      // Step 1: Validate Account & Route (Simulated)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (enrollPayee) {
        setEnrollmentStatus('PENDING');
      }
      setTransferStatus('PROCESSING');

      // Step 2: Process Transfer & Create Payee (Simulated API response)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 95% success rate simulation
          if (Math.random() > 0.05) {
            resolve(true);
          } else {
            reject(new Error('Transaction declined by intermediary clearing house.'));
          }
        }, 2500);
      });

      // Success State
      setTransferStatus('COMPLETED');
      if (enrollPayee) {
        setEnrollmentStatus('SUCCESS');
        setPayeeId(`PAY-${Math.floor(100000 + Math.random() * 900000)}`);
      }
      setTransactionId(`TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);

    } catch (err: any) {
      setTransferStatus('FAILED');
      if (enrollPayee) {
        setEnrollmentStatus('FAILED');
      }
      setErrorMessage(err.message || 'An unexpected error occurred during the adhoc transfer process.');
    }
  };

  const resetForm = () => {
    setBankDetails({
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      accountHolderName: '',
      accountType: 'CHECKING',
    });
    setAmount('');
    setEnrollPayee(true);
    setPayeeNickname('');
    setEnrollmentStatus('NOT_STARTED');
    setTransferStatus('IDLE');
    setErrorMessage(null);
    setTransactionId(null);
    setPayeeId(null);
    setErrors({});
  };

  // Get steps for the visual tracker
  const getSteps = (): StatusStep[] => {
    const steps: StatusStep[] = [
      {
        label: 'Initiate Request',
        description: 'Payload dispatched to /adhocWithPayeeCreation',
        status: transferStatus === 'IDLE' ? 'idle' : 'success',
      },
      {
        label: 'Account Validation',
        description: 'Verifying routing transit & account structure',
        status: 
          transferStatus === 'IDLE' ? 'idle' :
          transferStatus === 'INITIATED' ? 'loading' : 'success',
      },
      {
        label: 'Funds Transfer',
        description: 'Processing instant clearing network transfer',
        status:
          transferStatus === 'IDLE' || transferStatus === 'INITIATED' ? 'idle' :
          transferStatus === 'PROCESSING' ? 'loading' :
          transferStatus === 'COMPLETED' ? 'success' : 'error',
      },
    ];

    if (enrollPayee) {
      steps.push({
        label: 'Payee Enrollment',
        description: `Registering "${payeeNickname || 'Payee'}" in secure vault`,
        status:
          enrollmentStatus === 'NOT_STARTED' || enrollmentStatus === 'VALIDATING' ? 'idle' :
          enrollmentStatus === 'PENDING' ? 'loading' :
          enrollmentStatus === 'SUCCESS' ? 'success' : 'error',
      });
    }

    return steps;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-6xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold tracking-widest uppercase bg-indigo-950/50 w-fit px-3 py-1 rounded-full border border-indigo-500/30 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Secure Adhoc Gateway
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Adhoc Transfer & Payee Enrollment
              </h1>
              <p className="text-slate-200 text-sm mt-1 max-w-2xl">
                Execute real-time transfers to unregistered accounts while simultaneously enrolling them as verified payees for future transactions.
              </p>
            </div>
            <div className="flex flex-col items-end bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Endpoint Target</span>
              <span className="text-xs font-mono text-emerald-400 font-bold mt-0.5">POST /adhocWithPayeeCreation</span>
            </div>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column: Form Input (7 Cols) */}
          <form onSubmit={handleInitiateTransfer} className="lg:col-span-7 p-8 space-y-6">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Transaction & Destination Details
            </h2>

            {/* Bank Details Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Holder Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                    placeholder="John Doe"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    className={`w-full bg-slate-900 border ${errors.accountHolderName ? 'border-red-500' : 'border-slate-700'} rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                </div>
                {errors.accountHolderName && <p className="text-red-400 text-xs mt-1">{errors.accountHolderName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                    placeholder="Apex Global Bank"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className={`w-full bg-slate-900 border ${errors.bankName ? 'border-red-500' : 'border-slate-700'} rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                </div>
                {errors.bankName && <p className="text-red-400 text-xs mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Routing Number (9 Digits)
                </label>
                <input
                  type="text"
                  maxLength={9}
                  disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                  placeholder="123456789"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value.replace(/\D/g, '') })}
                  className={`w-full bg-slate-900 border ${errors.routingNumber ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`}
                />
                {errors.routingNumber && <p className="text-red-400 text-xs mt-1">{errors.routingNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  maxLength={17}
                  disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                  placeholder="000123456789"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '') })}
                  className={`w-full bg-slate-900 border ${errors.accountNumber ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`}
                />
                {errors.accountNumber && <p className="text-red-400 text-xs mt-1">{errors.accountNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                    onClick={() => setBankDetails({ ...bankDetails, accountType: 'CHECKING' })}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold border transition-all ${
                      bankDetails.accountType === 'CHECKING'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    } disabled:opacity-50`}
                  >
                    Checking
                  </button>
                  <button
                    type="button"
                    disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                    onClick={() => setBankDetails({ ...bankDetails, accountType: 'SAVINGS' })}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold border transition-all ${
                      bankDetails.accountType === 'SAVINGS'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    } disabled:opacity-50`}
                  >
                    Savings
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Transfer Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.01"
                    disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.amount ? 'border-red-500' : 'border-slate-700'} rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                </div>
                {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Payee Enrollment Toggle Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-400 h-fit">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Enroll Payee for Future Use</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Securely save this account to your verified payee list. This eliminates the need to re-enter bank details for future transfers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                  onClick={() => setEnrollPayee(!enrollPayee)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    enrollPayee ? 'bg-indigo-600' : 'bg-slate-700'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enrollPayee ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {enrollPayee && (
                <div className="pt-2 border-t border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Payee Nickname
                  </label>
                  <input
                    type="text"
                    disabled={transferStatus !== 'IDLE' && transferStatus !== 'FAILED'}
                    placeholder="e.g. Landlord Rent Account, Utility Corp"
                    value={payeeNickname}
                    onChange={(e) => setPayeeNickname(e.target.value)}
                    className={`w-full bg-slate-950 border ${errors.payeeNickname ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50`}
                  />
                  {errors.payeeNickname && <p className="text-red-400 text-xs mt-1">{errors.payeeNickname}</p>}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              {transferStatus === 'IDLE' || transferStatus === 'FAILED' ? (
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {enrollPayee ? 'Initiate Transfer & Enroll Payee' : 'Initiate Transfer Only'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  Processing Pipeline...
                </div>
              )}

              {(transferStatus === 'COMPLETED' || transferStatus === 'FAILED') && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 p-3 rounded-xl transition-all"
                  title="Reset Form"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Right Column: Live Status & API Output (5 Cols) */}
          <div className="lg:col-span-5 p-8 bg-slate-950/40 flex flex-col justify-between space-y-8">
            
            {/* Status Tracker */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Pipeline Execution
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  REAL-TIME
                </span>
              </div>

              {/* Visual Stepper */}
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                {getSteps().map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Step Indicator Dot */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center">
                      {step.status === 'success' && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {step.status === 'loading' && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      )}
                      {step.status === 'error' && (
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      {step.status === 'idle' && (
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                      )}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        step.status === 'success' ? 'text-emerald-400' :
                        step.status === 'loading' ? 'text-indigo-400' :
                        step.status === 'error' ? 'text-red-400' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Output / Response Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Response Payload</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  transferStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  transferStatus === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  transferStatus === 'PROCESSING' || transferStatus === 'INITIATED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {transferStatus === 'COMPLETED' ? '200 OK' :
                   transferStatus === 'FAILED' ? '400 BAD REQUEST' :
                   transferStatus === 'PROCESSING' || transferStatus === 'INITIATED' ? 'PENDING' : 'IDLE'}
                </span>
              </div>

              {/* Idle State */}
              {transferStatus === 'IDLE' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-700" />
                  <p className="text-xs text-slate-500 max-w-xs">
                    Fill out the transfer details and submit to trigger the adhoc payee creation pipeline.
                  </p>
                </div>
              )}

              {/* Processing State */}
              {(transferStatus === 'INITIATED' || transferStatus === 'PROCESSING') && (
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>request_path:</span>
                    <span className="text-slate-300">/adhocWithPayeeCreation</span>
                  </div>
                  <div className="flex justify-between">
                    <span>enroll_payee:</span>
                    <span className="text-indigo-400">{enrollPayee ? 'true' : 'false'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>amount:</span>
                    <span className="text-slate-300">${parseFloat(amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 pt-2 border-t border-slate-800/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Awaiting ledger confirmation...</span>
                  </div>
                </div>
              )}

              {/* Success State */}
              {transferStatus === 'COMPLETED' && (
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pipeline Executed Successfully</span>
                  </div>
                  <div className="flex justify-between">
                    <span>transaction_id:</span>
                    <span className="text-slate-200 font-semibold">{transactionId}</span>
                  </div>
                  {enrollPayee && (
                    <>
                      <div className="flex justify-between">
                        <span>payee_id:</span>
                        <span className="text-slate-200 font-semibold">{payeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>enrollment_status:</span>
                        <span className="text-emerald-400 font-bold">SUCCESS</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>clearing_network:</span>
                    <span className="text-slate-300">ACH_INSTANT</span>
                  </div>
                </div>
              )}

              {/* Failed State */}
              {transferStatus === 'FAILED' && (
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Pipeline Execution Failed</span>
                  </div>
                  <div className="bg-red-950/30 border border-red-900/30 rounded p-2.5 text-red-400 text-[11px] leading-relaxed">
                    {errorMessage}
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800/40">
                    <span>error_code:</span>
                    <span className="text-red-400">TRANSACTION_REJECTED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Security Footer */}
            <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
              <span>PCI-DSS Compliant • AES-256 Vault Encryption</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}