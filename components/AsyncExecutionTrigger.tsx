import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Key, 
  FileJson, 
  Send, 
  Lock, 
  RefreshCw, 
  UserCheck,
  ArrowRight,
  DollarSign,
  Layers,
  X,
  Info
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface TransferItem {
  id: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  currency: string;
  bankCode: string;
  reference: string;
}

export interface AsyncExecutionTriggerProps {
  transfers?: TransferItem[];
  endpointUrl?: string;
  jwsPrivateKeyAlias?: string;
  onExecutionSuccess?: (response: any) => void;
  onExecutionFailure?: (error: any) => void;
}

// Default mock transfers if none provided
const DEFAULT_TRANSFERS: TransferItem[] = [
  {
    id: 'tx-9081',
    recipientName: 'Acme Corp Treasury',
    recipientAccount: 'US89WELS9002182731',
    amount: 125000.00,
    currency: 'USD',
    bankCode: 'WELSUS33',
    reference: 'Q3 Vendor Settlement'
  },
  {
    id: 'tx-9082',
    recipientName: 'Vanguard Logistics',
    recipientAccount: 'GB21BARC2002918273',
    amount: 48200.50,
    currency: 'GBP',
    bankCode: 'BARCGB22',
    reference: 'Freight Invoice #8821'
  },
  {
    id: 'tx-9083',
    recipientName: 'Hansa Tech GmbH',
    recipientAccount: 'DE44DB200019283746',
    amount: 89100.00,
    currency: 'EUR',
    bankCode: 'DEUTDEDD',
    reference: 'SaaS License Renewal'
  }
];

export default function AsyncExecutionTrigger({
  transfers = DEFAULT_TRANSFERS,
  endpointUrl = '/api/transfers/async',
  jwsPrivateKeyAlias = 'kms-key-prod-01',
  onExecutionSuccess,
  onExecutionFailure
}: AsyncExecutionTriggerProps) {
  
  // State Management
  const [executionState, setExecutionState] = useState<'idle' | 'signing' | 'executing' | 'mfa_required' | 'success' | 'failed'>('idle');
  const [jwsHeader, setJwsHeader] = useState<string>('');
  const [jwsPayload, setJwsPayload] = useState<string>('');
  const [mfaToken, setMfaToken] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [simulateMfa, setSimulateMfa] = useState<boolean>(true); // Toggle for demo purposes
  const [showPayloadPreview, setShowPayloadPreview] = useState<boolean>(false);

  // Generate mock JWS headers and payload on load or transfer change
  useEffect(() => {
    const payloadObj = {
      instructionId: `inst-${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString(),
      totalAmount: transfers.reduce((sum, tx) => sum + tx.amount, 0),
      count: transfers.length,
      transfers: transfers.map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        recipient: t.recipientAccount
      }))
    };

    const headerObj = {
      alg: 'RS256',
      kid: jwsPrivateKeyAlias,
      crit: ['b64'],
      b64: false
    };

    setJwsPayload(JSON.stringify(payloadObj, null, 2));
    setJwsHeader(JSON.stringify(headerObj, null, 2));
  }, [transfers, jwsPrivateKeyAlias]);

  // Calculate totals
  const totalAmount = transfers.reduce((sum, tx) => sum + tx.amount, 0);
  const uniqueCurrencies = Array.from(new Set(transfers.map(t => t.currency)));

  // Helper to generate a mock JWS Signature
  const generateMockSignature = () => {
    const base64Header = btoa(jwsHeader).replace(/=/g, '');
    const base64Payload = btoa(jwsPayload).replace(/=/g, '');
    const mockSig = 'Sg_x9W2kLp_81mZq_Yt9P0X_zL98q_Wp1o_M7aB_92kLp_81mZq_Yt9P0X_zL98q_Wp1o_M7aB';
    return `${base64Header}.${base64Payload}.${mockSig}`;
  };

  // Trigger Initial Execution
  const handleInitiateExecution = async () => {
    setExecutionState('signing');
    setApiError(null);
    
    // Simulate cryptographic signing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setExecutionState('executing');
    const signature = generateMockSignature();

    try {
      if (simulateMfa) {
        // Simulate an API response requiring MFA
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMfaToken('mfa_tok_9921a8f8b2c3d4e5f6');
        setExecutionState('mfa_required');
      } else {
        // Real or simulated direct success
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockSuccessResponse = {
          status: 'ACCEPTED',
          batchId: `batch-${Math.floor(Math.random() * 1000000)}`,
          executionTime: new Date().toISOString(),
          processedTransfers: transfers.length
        };
        setExecutionResult(mockSuccessResponse);
        setExecutionState('success');
        if (onExecutionSuccess) onExecutionSuccess(mockSuccessResponse);
      }
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred during execution.');
      setExecutionState('failed');
      if (onExecutionFailure) onExecutionFailure(err);
    }
  };

  // Handle MFA Verification
  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setMfaError('Please enter a valid 6-digit verification code.');
      return;
    }

    setExecutionState('executing');
    setMfaError(null);

    try {
      // Simulate MFA verification API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (mfaCode === '123456' || simulateMfa) { // Accept 123456 or any code in simulation mode
            resolve(true);
          } else {
            reject(new Error('Invalid verification code. Please try again.'));
          }
        }, 1800);
      });

      const mockSuccessResponse = {
        status: 'ACCEPTED',
        batchId: `batch-${Math.floor(Math.random() * 1000000)}`,
        executionTime: new Date().toISOString(),
        processedTransfers: transfers.length,
        mfaVerified: true,
        mfaMethod: 'TOTP'
      };

      setExecutionResult(mockSuccessResponse);
      setExecutionState('success');
      if (onExecutionSuccess) onExecutionSuccess(mockSuccessResponse);
    } catch (err: any) {
      setMfaError(err.message || 'MFA verification failed.');
      setExecutionState('mfa_required');
    }
  };

  // Reset State
  const handleReset = () => {
    setExecutionState('idle');
    setMfaCode('');
    setMfaToken('');
    setMfaError(null);
    setApiError(null);
    setExecutionResult(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 p-6 border-b border-slate-800">
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Async Engine Active</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Async Execution Hub</h2>
            <p className="text-xs text-slate-400 mt-0.5">Securely sign, dispatch, and monitor high-volume multi-transfer payloads</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Column: Payload Summary & JWS Config */}
        <div className="lg:col-span-7 p-6 border-r border-slate-800 space-y-6">
          
          {/* Transfer Summary Card */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-indigo-400" />
                Transfer Payload Summary
              </h3>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20 font-medium">
                {transfers.length} Transfers Pending
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-4">
              {/* Mini Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-800/60">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Volume</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {totalAmount.toLocaleString('en-US', { style: 'currency', currency: uniqueCurrencies[0] || 'USD' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Currencies</p>
                  <p className="text-lg font-bold text-indigo-400 mt-0.5">
                    {uniqueCurrencies.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Target Endpoint</p>
                  <p className="text-xs font-mono text-slate-300 mt-1.5 truncate bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {endpointUrl}
                  </p>
                </div>
              </div>

              {/* Transfer List Preview */}
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                {transfers.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                        {tx.currency.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{tx.recipientName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{tx.recipientAccount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">
                        {tx.amount.toLocaleString('en-US', { style: 'currency', currency: tx.currency })}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">{tx.id}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggle Raw Payload */}
              <div>
                <button 
                  onClick={() => setShowPayloadPreview(!showPayloadPreview)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showPayloadPreview ? 'Hide raw JSON payload' : 'View raw JSON payload'}
                </button>
                
                {showPayloadPreview && (
                  <pre className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-[150px]">
                    {jwsPayload}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* JWS Signature Configuration */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              JWS Signature Headers
            </h3>
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Signing Key Alias:</span>
                <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                  {jwsPrivateKeyAlias}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Header Configuration</label>
                  <textarea 
                    value={jwsHeader}
                    onChange={(e) => setJwsHeader(e.target.value)}
                    className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Generated JWS Header (Simulated)</label>
                  <div className="w-full h-24 bg-slate-900/40 border border-slate-800/60 rounded-lg p-2 text-[10px] font-mono text-slate-500 overflow-y-auto select-all">
                    {`{"alg":"RS256","kid":"${jwsPrivateKeyAlias}","crit":["b64"],"b64":false}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Simulation Mode (For testing MFA flow)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={simulateMfa} 
                onChange={(e) => setSimulateMfa(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
            </label>
          </div>

        </div>

        {/* Right Column: Execution Console & MFA Prompt */}
        <div className="lg:col-span-5 p-6 bg-slate-950/40 flex flex-col justify-between min-h-[450px]">
          
          {/* Console Header */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Execution Console
            </h3>
            
            {/* Dynamic Status Indicator */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 min-h-[280px] flex flex-col justify-center items-center text-center relative overflow-hidden">
              
              {/* IDLE STATE */}
              {executionState === 'idle' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Play className="w-8 h-8 translate-x-0.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ready for Dispatch</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Click the execute button below to sign the payload and initiate the asynchronous transfer batch.
                    </p>
                  </div>
                </div>
              )}

              {/* SIGNING STATE */}
              {executionState === 'signing' && (
                <div className="space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                      <Key className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Generating JWS Signature</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Accessing secure KMS key vault to sign payload headers...
                    </p>
                  </div>
                </div>
              )}

              {/* EXECUTING STATE */}
              {executionState === 'executing' && (
                <div className="space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                      <Send className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dispatching to Async Engine</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      POSTing payload to <code className="text-indigo-400">{endpointUrl}</code>...
                    </p>
                  </div>
                </div>
              )}

              {/* MFA REQUIRED STATE */}
              {executionState === 'mfa_required' && (
                <div className="w-full space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">MFA Authentication Required</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      This high-value transaction batch requires multi-factor verification to proceed.
                    </p>
                  </div>

                  {/* MFA Form */}
                  <form onSubmit={handleVerifyMFA} className="max-w-xs mx-auto mt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold text-left mb-1">
                        Enter 6-Digit TOTP Code
                      </label>
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-4 text-center text-lg font-mono tracking-[0.5em] text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                    
                    {mfaError && (
                      <div className="flex items-center space-x-1.5 text-red-400 text-left p-2 bg-red-500/10 rounded border border-red-500/20 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{mfaError}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-amber-900/20"
                      >
                        Verify & Execute
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Demo mode: Enter any 6 digits to verify.
                    </p>
                  </form>
                </div>
              )}

              {/* SUCCESS STATE */}
              {executionState === 'success' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Batch Execution Accepted</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      The asynchronous engine has successfully queued the transfers for processing.
                    </p>
                  </div>

                  {executionResult && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-left text-[11px] font-mono text-slate-300 space-y-1 max-w-xs mx-auto">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Batch ID:</span>
                        <span className="text-emerald-400 font-bold">{executionResult.batchId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="text-white">{executionResult.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">MFA Verified:</span>
                        <span className="text-amber-400">Yes (TOTP)</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="mt-2 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                  >
                    Reset Console
                  </button>
                </div>
              )}

              {/* FAILED STATE */}
              {executionState === 'failed' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Execution Failed</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      {apiError || 'An error occurred while processing the batch.'}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-2 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-800/60">
            {executionState === 'idle' && (
              <button
                onClick={handleInitiateExecution}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Transfer Batch</span>
              </button>
            )}

            {executionState !== 'idle' && executionState !== 'success' && executionState !== 'failed' && (
              <button
                disabled
                className="w-full py-3.5 px-4 bg-slate-800 text-slate-500 font-semibold rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Batch...</span>
              </button>
            )}

            {executionState === 'success' && (
              <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Batch Dispatched Successfully</span>
              </div>
            )}

            {executionState === 'failed' && (
              <div className="flex items-center justify-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-3 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">Execution Aborted</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}