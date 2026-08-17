import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Loader2, 
  Users, 
  ArrowRight, 
  Info, 
  Check, 
  X, 
  Coins, 
  FileText, 
  Layers,
  HelpCircle
} from 'lucide-react';

// Types
interface TransferItem {
  id: string;
  recipient: string;
  amount: number;
  token: 'USDC' | 'USDT' | 'ETH' | 'WBTC' | 'SOL';
  status: 'idle' | 'pending' | 'processing' | 'success' | 'failed';
  txHash?: string;
  error?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

type WorkflowStep = 'draft' | 'mfa_pending' | 'approval_pending' | 'executing' | 'completed' | 'failed';

const PRESET_RECIPIENTS = [
  '0x71C233112857A74ac89f87573003969de4759102',
  '0x3Ac90F372857A74ac89f87573003969de4759214',
  '0x9965503B1a0594197760119259074b0244d75aE8',
  '0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
];

export default function MultipleTransferSimulator() {
  // Basket State
  const [basket, setBasket] = useState<TransferItem[]>([
    { id: '1', recipient: '0x71C233112857A74ac89f87573003969de4759102', amount: 1500, token: 'USDC', status: 'idle' },
    { id: '2', recipient: '0x3Ac90F372857A74ac89f87573003969de4759214', amount: 0.5, token: 'ETH', status: 'idle' },
    { id: '3', recipient: '0x9965503B1a0594197760119259074b0244d75aE8', amount: 2500, token: 'USDT', status: 'idle' }
  ]);

  // Form State
  const [recipientInput, setRecipientInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [tokenInput, setTokenInput] = useState<TransferItem['token']>('USDC');

  // Workflow State
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('draft');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [approverCount, setApproverCount] = useState(0);
  const [requiredApprovers] = useState(2);
  const [simulationSpeed, setSimulationSpeed] = useState(1500); // ms per step
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);

  // Stats
  const totalUSDValue = basket.reduce((acc, item) => {
    const multiplier = item.token === 'ETH' ? 3500 : item.token === 'WBTC' ? 65000 : item.token === 'SOL' ? 140 : 1;
    return acc + (item.amount * multiplier);
  }, 0);

  // Helper to add logs
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  // Initialize with some logs
  useEffect(() => {
    addLog('Simulator initialized. Add transfers to the basket to begin.', 'info');
  }, [addLog]);

  // Add item to basket
  const handleAddToBasket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientInput || !amountInput) {
      addLog('Please fill in all transfer fields.', 'warning');
      return;
    }

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      addLog('Please enter a valid positive amount.', 'warning');
      return;
    }

    const newItem: TransferItem = {
      id: Math.random().toString(36).substring(2, 9),
      recipient: recipientInput,
      amount,
      token: tokenInput,
      status: 'idle'
    };

    setBasket(prev => [...prev, newItem]);
    addLog(`Added transfer of ${amount} ${tokenInput} to basket.`, 'info');
    setRecipientInput('');
    setAmountInput('');
  };

  // Remove item from basket
  const handleRemoveFromBasket = (id: string) => {
    if (workflowStep !== 'draft') return;
    const item = basket.find(i => i.id === id);
    setBasket(prev => prev.filter(i => i.id !== id));
    if (item) {
      addLog(`Removed transfer of ${item.amount} ${item.token} from basket.`, 'info');
    }
  };

  // Fill random mock data
  const handleFillMockData = () => {
    if (workflowStep !== 'draft') return;
    const randomRecipient = PRESET_RECIPIENTS[Math.floor(Math.random() * PRESET_RECIPIENTS.length)];
    const tokens: TransferItem['token'][] = ['USDC', 'USDT', 'ETH', 'WBTC', 'SOL'];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    const randomAmount = randomToken === 'ETH' ? parseFloat((Math.random() * 2).toFixed(3)) : 
                         randomToken === 'WBTC' ? parseFloat((Math.random() * 0.1).toFixed(4)) :
                         randomToken === 'SOL' ? parseFloat((Math.random() * 15).toFixed(1)) :
                         Math.floor(Math.random() * 5000) + 100;

    setRecipientInput(randomRecipient);
    setAmountInput(randomAmount.toString());
    setTokenInput(randomToken);
    addLog('Generated mock transfer details.', 'info');
  };

  // Step 1: Initiate Batch
  const handleInitiateBatch = () => {
    if (basket.length === 0) {
      addLog('Cannot initiate an empty basket.', 'error');
      return;
    }
    
    const generatedBatchId = 'batch_' + Math.random().toString(36).substring(2, 15);
    setBatchId(generatedBatchId);
    setWorkflowStep('mfa_pending');
    
    // Update basket items to pending
    setBasket(prev => prev.map(item => ({ ...item, status: 'pending' })));
    
    addLog(`Batch ${generatedBatchId} created with ${basket.length} transfers. Total value: ~$${totalUSDValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 'success');
    addLog('MFA verification required to proceed.', 'warning');
  };

  // Step 2: Verify MFA
  const handleVerifyMFA = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode.toLowerCase() === 'bypass') {
      setMfaError('');
      setWorkflowStep('approval_pending');
      addLog('MFA verification successful.', 'success');
      addLog(`Policy Engine: Multi-sig approval required. ${requiredApprovers} approvals needed.`, 'info');
    } else {
      setMfaError('Invalid MFA code. Use "123456" for simulation.');
      addLog('MFA verification failed. Invalid code.', 'error');
    }
  };

  // Step 3: Approve Control Flow
  const handleApprove = () => {
    const nextApproverCount = approverCount + 1;
    setApproverCount(nextApproverCount);
    addLog(`Approval received (${nextApproverCount}/${requiredApprovers}).`, 'info');

    if (nextApproverCount >= requiredApprovers) {
      setWorkflowStep('executing');
      addLog('All required approvals gathered. Starting batch execution...', 'success');
      executeBatchTransfers();
    }
  };

  // Step 4: Execute Batch Transfers sequentially
  const executeBatchTransfers = async () => {
    const updatedBasket = [...basket];
    
    for (let i = 0; i < updatedBasket.length; i++) {
      const item = updatedBasket[i];
      
      // Update status to processing
      setBasket(prev => prev.map(bItem => bItem.id === item.id ? { ...bItem, status: 'processing' } : bItem));
      addLog(`Processing transfer ${i + 1}/${updatedBasket.length}: ${item.amount} ${item.token} to ${item.recipient.substring(0, 8)}...`, 'info');
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, simulationSpeed));

      // Simulate random failure (10% chance)
      const isSuccessful = Math.random() > 0.1;

      if (isSuccessful) {
        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        setBasket(prev => prev.map(bItem => bItem.id === item.id ? { 
          ...bItem, 
          status: 'success',
          txHash 
        } : bItem));
        addLog(`Transfer ${i + 1} succeeded. Tx: ${txHash.substring(0, 16)}...`, 'success');
      } else {
        setBasket(prev => prev.map(bItem => bItem.id === item.id ? { 
          ...bItem, 
          status: 'failed',
          error: 'Gas limit exceeded or node timeout'
        } : bItem));
        addLog(`Transfer ${i + 1} failed: Gas limit exceeded or node timeout`, 'error');
      }
    }

    setWorkflowStep('completed');
    addLog('Batch execution completed.', 'success');
  };

  // Reset Simulator
  const handleReset = () => {
    setBasket([
      { id: '1', recipient: '0x71C233112857A74ac89f87573003969de4759102', amount: 1500, token: 'USDC', status: 'idle' },
      { id: '2', recipient: '0x3Ac90F372857A74ac89f87573003969de4759214', amount: 0.5, token: 'ETH', status: 'idle' }
    ]);
    setWorkflowStep('draft');
    setMfaCode('');
    setMfaError('');
    setApproverCount(0);
    setBatchId(null);
    setLogs([]);
    addLog('Simulator reset to initial state.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
              Developer Playground
            </span>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              v2 Multiple Transfers API
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Multiple Transfer Lifecycle Simulator
          </h1>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Test the complete end-to-end lifecycle of batch transfers: basket creation, asynchronous execution triggers, MFA challenges, multi-sig control flows, and real-time status tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-400">Sim Speed:</span>
            <select 
              value={simulationSpeed} 
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="bg-transparent text-indigo-400 font-semibold focus:outline-none cursor-pointer"
              disabled={workflowStep === 'executing'}
            >
              <option value={500}>Fast (0.5s)</option>
              <option value={1500}>Normal (1.5s)</option>
              <option value={3000}>Slow (3s)</option>
            </select>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Simulator
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Basket & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step Progress Indicator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Workflow Progress</h3>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className={`p-2 rounded-lg border ${workflowStep === 'draft' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                1. Draft Basket
              </div>
              <div className={`p-2 rounded-lg border ${workflowStep === 'mfa_pending' ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                2. MFA Challenge
              </div>
              <div className={`p-2 rounded-lg border ${workflowStep === 'approval_pending' ? 'bg-blue-500/10 border-blue-500 text-blue-300 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                3. Control Flow
              </div>
              <div className={`p-2 rounded-lg border ${workflowStep === 'executing' ? 'bg-purple-500/10 border-purple-500 text-purple-300 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                4. Executing
              </div>
              <div className={`p-2 rounded-lg border ${workflowStep === 'completed' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                5. Completed
              </div>
            </div>
          </div>

          {/* Basket Builder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold">1. Transfer Basket Builder</h2>
              </div>
              {workflowStep === 'draft' && (
                <button 
                  onClick={handleFillMockData}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Autofill Mock Data
                </button>
              )}
            </div>

            {/* Add Transfer Form */}
            {workflowStep === 'draft' ? (
              <form onSubmit={handleAddToBasket} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="md:col-span-6">
                  <label className="block text-xs text-slate-400 mb-1">Recipient Address</label>
                  <input 
                    type="text" 
                    placeholder="0x... or ENS" 
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-400 mb-1">Amount</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="0.0" 
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Token</label>
                  <select 
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value as TransferItem['token'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                    <option value="WBTC">WBTC</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded p-2 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 flex items-center gap-3 text-sm text-slate-400">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Basket is locked during execution. Reset the simulator to modify items.</span>
              </div>
            )}

            {/* Basket List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {basket.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  <p className="text-sm">Your transfer basket is empty.</p>
                  <p className="text-xs mt-1">Add transfers above or click "Autofill Mock Data".</p>
                </div>
              ) : (
                basket.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      item.status === 'processing' ? 'bg-indigo-950/20 border-indigo-500/50' :
                      item.status === 'success' ? 'bg-emerald-950/10 border-emerald-500/30' :
                      item.status === 'failed' ? 'bg-rose-950/10 border-rose-500/30' :
                      'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'processing' ? 'bg-indigo-400 animate-pulse' :
                        item.status === 'success' ? 'bg-emerald-400' :
                        item.status === 'failed' ? 'bg-rose-400' :
                        'bg-slate-600'
                      }`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-300 truncate max-w-[180px] sm:max-w-[280px]">
                            {item.recipient}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-slate-400">
                            {item.amount} {item.token}
                          </span>
                          {item.txHash && (
                            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                              Tx: {item.txHash}
                            </span>
                          )}
                          {item.error && (
                            <span className="text-[10px] text-rose-400 font-medium">
                              Error: {item.error}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === 'idle' && workflowStep === 'draft' && (
                        <button 
                          onClick={() => handleRemoveFromBasket(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {item.status === 'processing' && (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      )}
                      {item.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {item.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Basket Summary & Trigger */}
            {basket.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400">Total Estimated Value</div>
                  <div className="text-xl font-bold text-white">
                    ${totalUSDValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {basket.length} transfer{basket.length > 1 ? 's' : ''} in batch
                  </div>
                </div>

                {workflowStep === 'draft' && (
                  <button
                    onClick={handleInitiateBatch}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Initiate Batch Transfer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* API Lifecycle Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              How the Multiple Transfers API Works
            </h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">1.</span>
                <p><strong className="text-slate-300">Batch Creation:</strong> The client sends an array of transfers to the <code className="text-indigo-300">/v2/transfers/batch</code> endpoint, returning a pending batch ID.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">2.</span>
                <p><strong className="text-slate-300">MFA Challenge:</strong> For security, high-value batches trigger an asynchronous MFA challenge. The batch remains locked until verified.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">3.</span>
                <p><strong className="text-slate-300">Policy Engine:</strong> The transaction is evaluated against compliance rules. If multi-sig or admin approval is required, the workflow pauses for signatures.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">4.</span>
                <p><strong className="text-slate-300">Asynchronous Execution:</strong> Once approved, the engine processes transfers concurrently or sequentially, updating individual statuses in real-time.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Workflow & Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Workflow Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              2. Workflow Controller
            </h2>

            {/* Draft State */}
            {workflowStep === 'draft' && (
              <div className="text-center py-8 bg-slate-950 rounded-lg border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-3 border border-slate-800">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Awaiting Batch Initiation</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Build your transfer basket on the left and click "Initiate Batch Transfer" to start the security workflow.
                </p>
              </div>
            )}

            {/* MFA Pending State */}
            {workflowStep === 'mfa_pending' && (
              <div className="bg-slate-950 p-5 rounded-lg border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">MFA Verification Required</h3>
                    <p className="text-xs text-slate-400">Enter the 6-digit code to authorize this batch.</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyMFA} className="space-y-3">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Enter 123456 to verify" 
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                    {mfaError && <p className="text-xs text-rose-400 mt-1">{mfaError}</p>}
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded text-sm transition-colors"
                  >
                    Verify & Authorize
                  </button>
                </form>
                <div className="text-[10px] text-slate-500 text-center">
                  Tip: Enter <code className="text-amber-400">123456</code> to simulate a successful MFA check.
                </div>
              </div>
            )}

            {/* Approval Pending State */}
            {workflowStep === 'approval_pending' && (
              <div className="bg-slate-950 p-5 rounded-lg border border-blue-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-400">Policy Engine: Multi-Sig Approval</h3>
                    <p className="text-xs text-slate-400">This batch exceeds the single-signer limit. Multi-sig required.</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Approvals Gathered:</span>
                    <span className="font-bold text-blue-400">{approverCount} / {requiredApprovers}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300" 
                      style={{ width: `${(approverCount / requiredApprovers) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleApprove}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve as Signer {approverCount + 1}
                </button>
              </div>
            )}

            {/* Executing State */}
            {workflowStep === 'executing' && (
              <div className="bg-slate-950 p-5 rounded-lg border border-purple-500/30 space-y-4 text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-purple-400">Executing Batch Transfers</h3>
                  <p className="text-xs text-slate-400 mt-1">The API is processing each transfer asynchronously on-chain.</p>
                </div>
                <div className="text-xs text-slate-500 font-mono bg-slate-900 p-2 rounded border border-slate-800">
                  Batch ID: {batchId?.substring(0, 18)}...
                </div>
              </div>
            )}

            {/* Completed State */}
            {workflowStep === 'completed' && (
              <div className="bg-slate-950 p-5 rounded-lg border border-emerald-500/30 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-400">Batch Execution Completed</h3>
                  <p className="text-xs text-slate-400 mt-1">All transfers in the batch have been processed. Check individual statuses in the basket.</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded text-sm transition-colors"
                >
                  Start New Batch
                </button>
              </div>
            )}
          </div>

          {/* Live Status Viewer & Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-[380px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Execution Logs</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-y-auto space-y-2 border border-slate-800">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-12">No logs yet. Start a batch to see activity.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`
                      ${log.type === 'success' ? 'text-emerald-400' : ''}
                      ${log.type === 'warning' ? 'text-amber-400' : ''}
                      ${log.type === 'error' ? 'text-rose-400 font-semibold' : ''}
                      ${log.type === 'info' ? 'text-slate-300' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}