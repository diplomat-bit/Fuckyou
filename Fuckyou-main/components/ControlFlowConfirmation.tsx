import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Cpu, 
  FileCheck, 
  ShieldCheck, 
  ChevronRight,
  DollarSign,
  Activity
} from 'lucide-react';

// --- Types & Interfaces ---
interface PendingBundleDetails {
  sourceAccount: string;
  destinationAccount: string;
  totalAmount: number;
  currency: string;
  transactionCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

interface ConfirmationResult {
  tppBundleId: string;
  citiBundleId: string;
  timestamp: string;
  status: 'SETTLED' | 'PENDING_LIQUIDITY' | 'PROCESSING';
}

interface ControlFlowConfirmationProps {
  onSuccess?: (tppId: string, citiId: string) => void;
  onReset?: () => void;
  initialControlFlowId?: string;
}

export default function ControlFlowConfirmation({
  onSuccess,
  onReset,
  initialControlFlowId = ''
}: ControlFlowConfirmationProps) {
  // --- State ---
  const [controlFlowId, setControlFlowId] = useState<string>(initialControlFlowId);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: ID Input/Generation, 2: Review & Confirm, 3: Success
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock Data States
  const [pendingDetails, setPendingDetails] = useState<PendingBundleDetails | null>(null);
  const [result, setResult] = useState<ConfirmationResult | null>(null);

  // --- Helper: Generate UUID ---
  const generateUUID = () => {
    const uuid = 'cf-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
    setControlFlowId(uuid.toUpperCase());
    setError(null);
  };

  // --- Helper: Copy to Clipboard ---
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- Step 1: Fetch/Load Pending Bundle Details ---
  const handleFetchBundleDetails = async () => {
    if (!controlFlowId.trim()) {
      setError('Please enter or generate a valid Control Flow ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStage('Locating pending bundle associated with Control Flow ID...');

    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock response for pending bundle
      const mockDetails: PendingBundleDetails = {
        sourceAccount: 'US-CITI-988271-A9',
        destinationAccount: 'EU-DEUT-441029-B2',
        totalAmount: 1450000.00,
        currency: 'USD',
        transactionCount: 42,
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
      };

      setPendingDetails(mockDetails);
      setStep(2);
    } catch (err) {
      setError('Failed to retrieve bundle details. Please verify the Control Flow ID.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // --- Step 2: Execute Final Confirmation Request (/confirmation/async) ---
  const handleExecuteConfirmation = async () => {
    if (!controlFlowId) return;

    setIsLoading(true);
    setError(null);

    const stages = [
      'Initiating asynchronous handshake with Citi API...',
      'Signing payload with TPP private key...',
      'Verifying liquidity allocation...',
      'Generating final settlement bundles...'
    ];

    try {
      // Cycle through realistic loading stages
      for (const stage of stages) {
        setLoadingStage(stage);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Mock final response
      const mockResult: ConfirmationResult = {
        tppBundleId: `TPP-BNDL-${Math.floor(100000 + Math.random() * 900000)}`,
        citiBundleId: `CITI-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        timestamp: new Date().toISOString(),
        status: 'SETTLED'
      };

      setResult(mockResult);
      setStep(3);

      if (onSuccess) {
        onSuccess(mockResult.tppBundleId, mockResult.citiBundleId);
      }
    } catch (err) {
      setError('Asynchronous confirmation failed. The gateway timed out. Please retry.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // --- Reset Flow ---
  const handleReset = () => {
    setControlFlowId(initialControlFlowId);
    setStep(1);
    setPendingDetails(null);
    setResult(null);
    setError(null);
    if (onReset) onReset();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 p-6 border-b border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-1">
              <Cpu className="w-4 h-4 animate-pulse" />
              Async Gateway Endpoint
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              /confirmation/async
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Process, verify, and finalize pending transaction bundles securely with automated control flow routing.
            </p>
          </div>
          
          {/* Step Progress Indicator */}
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-2 self-start md:self-auto">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>3</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-950/40 border border-red-900/50 text-red-200 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Execution Error</h4>
              <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Capture or Generate Control Flow ID */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Control Flow Identification
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Provide an existing Control Flow ID from your orchestration pipeline, or generate a new unique identifier to simulate a fresh transaction bundle.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Control Flow ID (UUID)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={controlFlowId}
                        onChange={(e) => {
                          setControlFlowId(e.target.value);
                          setError(null);
                        }}
                        placeholder="e.g. CF-8F9D2A1B-4C3D-4E5F-6A7B"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                      />
                      {controlFlowId && (
                        <button
                          onClick={() => copyToClipboard(controlFlowId, 'cfid')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          title="Copy ID"
                        >
                          {copiedField === 'cfid' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={generateUUID}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Generate ID
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleFetchBundleDetails}
                  disabled={isLoading || !controlFlowId.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {loadingStage || 'Fetching Bundle Details...'}
                    </>
                  ) : (
                    <>
                      Fetch Pending Bundle Details
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Informational Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
              <div className="p-4 border border-slate-900 rounded-lg bg-slate-950/30">
                <span className="font-semibold text-slate-400 block mb-1">Asynchronous Processing</span>
                Ensures high-throughput execution without blocking client-side threads during heavy ledger updates.
              </div>
              <div className="p-4 border border-slate-900 rounded-lg bg-slate-950/30">
                <span className="font-semibold text-slate-400 block mb-1">Idempotency Guaranteed</span>
                The Control Flow ID acts as an idempotency key, preventing duplicate settlement requests.
              </div>
              <div className="p-4 border border-slate-900 rounded-lg bg-slate-950/30">
                <span className="font-semibold text-slate-400 block mb-1">Citi API Handshake</span>
                Directly integrated with Citi's sandbox and production clearing networks for instant feedback.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review Pending Bundle Details & Confirm */}
        {step === 2 && pendingDetails && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Review Pending Bundle</span>
                  <h3 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{controlFlowId}</h3>
                </div>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Awaiting Confirmation
                </span>
              </div>

              {/* Bundle Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
                  <span className="text-xs text-slate-500 block mb-1">Source Account</span>
                  <span className="font-mono text-sm text-slate-200">{pendingDetails.sourceAccount}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
                  <span className="text-xs text-slate-500 block mb-1">Destination Account</span>
                  <span className="font-mono text-sm text-slate-200">{pendingDetails.destinationAccount}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Total Amount</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {pendingDetails.totalAmount.toLocaleString('en-US', { style: 'currency', currency: pendingDetails.currency })}
                    </span>
                  </div>
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Transactions</span>
                    <span className="font-semibold text-slate-200">{pendingDetails.transactionCount} items</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Priority</span>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-0.5 ${
                      pendingDetails.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {pendingDetails.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="sm:w-1/3 bg-slate-900 hover:bg-slate-800 text-slate-300 py-3.5 px-4 rounded-lg text-sm font-semibold transition-all border border-slate-800"
                >
                  Cancel & Back
                </button>
                <button
                  onClick={handleExecuteConfirmation}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="animate-pulse">{loadingStage || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Confirm & Settle Bundle
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success State with Animations */}
        {step === 3 && result && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            
            {/* Success Animation Header */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <CheckCircle2 className="w-10 h-10 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Asynchronous Settlement Confirmed</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                The control flow pipeline has successfully executed. Settlement instructions have been dispatched to Citi clearing networks.
              </p>
            </div>

            {/* Resulting IDs Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                Generated Settlement Identifiers
              </h3>

              <div className="space-y-4">
                {/* TPP Bundle ID */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block mb-0.5">Third-Party Provider Bundle ID (tppBundleId)</span>
                    <span className="font-mono text-sm font-semibold text-slate-200">{result.tppBundleId}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.tppBundleId, 'tpp')}
                    className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded border border-slate-800 text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedField === 'tpp' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Citi Bundle ID */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block mb-0.5">Citi Clearing Bundle ID (citiBundleId)</span>
                    <span className="font-mono text-sm font-semibold text-slate-200">{result.citiBundleId}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.citiBundleId, 'citi')}
                    className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded border border-slate-800 text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedField === 'citi' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-4 text-xs text-slate-500">
                <div>
                  <span>Settlement Status:</span>
                  <span className="text-emerald-400 font-semibold ml-1.5">{result.status}</span>
                </div>
                <div className="text-right">
                  <span>Timestamp:</span>
                  <span className="text-slate-400 ml-1.5 font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Reset / New Transaction Button */}
            <button
              onClick={handleReset}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 py-3.5 px-4 rounded-lg text-sm font-semibold transition-all border border-slate-800 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Initiate Another Confirmation Flow
            </button>
          </div>
        )}

      </div>
    </div>
  );
}