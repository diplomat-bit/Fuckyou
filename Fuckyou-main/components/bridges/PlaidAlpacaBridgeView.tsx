import React, { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Code, 
  Terminal, 
  RefreshCw, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  Link2, 
  ShieldCheck, 
  Activity, 
  History,
  ChevronRight,
  ChevronDown,
  X,
  Info,
  Check,
  Lock,
  ExternalLink,
  Zap
} from 'lucide-react';

// Types & Interfaces
interface Bank {
  id: string;
  name: string;
  logoBg: string;
  logoText: string;
}

interface BankAccount {
  id: string;
  name: string;
  mask: string;
  balance: number;
  type: 'checking' | 'savings';
}

interface Transfer {
  id: string;
  amount: number;
  direction: 'deposit' | 'withdraw';
  status: 'queued' | 'pending' | 'approved' | 'completed' | 'failed';
  timestamp: string;
  instantPowerApplied: boolean;
}

interface ApiLog {
  id: string;
  timestamp: string;
  title: string;
  method: 'POST' | 'GET' | 'DELETE';
  url: string;
  request: string;
  response: string;
}

const MOCK_BANKS: Bank[] = [
  { id: 'chase', name: 'Chase Bank', logoBg: 'bg-blue-600', logoText: 'Chase' },
  { id: 'bofa', name: 'Bank of America', logoBg: 'bg-red-600', logoText: 'BofA' },
  { id: 'wells', name: 'Wells Fargo', logoBg: 'bg-yellow-600', logoText: 'Wells' },
  { id: 'citi', name: 'Citibank', logoBg: 'bg-blue-500', logoText: 'Citi' },
  { id: 'elevate', name: 'Elevate Pay', logoBg: 'bg-emerald-600', logoText: 'Elevate' }
];

const MOCK_ACCOUNTS: Record<string, BankAccount[]> = {
  chase: [
    { id: 'ch-1', name: 'Total Checking', mask: '6789', balance: 5230.45, type: 'checking' },
    { id: 'ch-2', name: 'Premier Savings', mask: '4321', balance: 18450.12, type: 'savings' }
  ],
  bofa: [
    { id: 'ba-1', name: 'Advantage Checking', mask: '1122', balance: 3120.80, type: 'checking' }
  ],
  wells: [
    { id: 'wf-1', name: 'Everyday Checking', mask: '9988', balance: 1450.25, type: 'checking' },
    { id: 'wf-2', name: 'Way2Save Savings', mask: '7766', balance: 25000.00, type: 'savings' }
  ],
  citi: [
    { id: 'ct-1', name: 'Citibank Checking', mask: '5544', balance: 8900.60, type: 'checking' }
  ],
  elevate: [
    { id: 'el-1', name: 'USD Business Account', mask: '8811', balance: 42150.00, type: 'checking' }
  ]
};

export default function PlaidAlpacaBridgeView() {
  // Bridge State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [processorToken, setProcessorToken] = useState<string | null>(null);
  const [achRelationshipId, setAchRelationshipId] = useState<string | null>(null);
  
  // Balances & Limits
  const [buyingPower, setBuyingPower] = useState(15000.00);
  const [cashBalance, setCashBalance] = useState(12500.00);
  const [instantFundingLimit, setInstantFundingLimit] = useState(2000.00);
  const [instantFundingUsed, setInstantFundingUsed] = useState(0);

  // Interactive Forms
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDirection, setTransferDirection] = useState<'deposit' | 'withdraw'>('deposit');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Plaid Link Modal Simulation
  const [plaidModalOpen, setPlaidModalOpen] = useState(false);
  const [plaidStep, setPlaidStep] = useState<'search' | 'credentials' | 'accounts' | 'success'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('user_good');
  const [password, setPassword] = useState('pass_good');
  const [isPlaidLoading, setIsPlaidLoading] = useState(false);

  // Logs & History
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: 'tr_alp_99281',
      amount: 5000.00,
      direction: 'deposit',
      status: 'completed',
      timestamp: '2026-08-10 14:32:10',
      instantPowerApplied: true
    },
    {
      id: 'tr_alp_99102',
      amount: 1500.00,
      direction: 'withdraw',
      status: 'completed',
      timestamp: '2026-08-12 09:15:44',
      instantPowerApplied: false
    }
  ]);

  // Helper to add API logs
  const addLog = useCallback((title: string, method: 'POST' | 'GET' | 'DELETE', url: string, request: any, response: any) => {
    const newLog: ApiLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      title,
      method,
      url,
      request: JSON.stringify(request, null, 2),
      response: JSON.stringify(response, null, 2)
    };
    setApiLogs(prev => [newLog, ...prev]);
    setActiveLogId(newLog.id);
  }, []);

  // Simulate Plaid Link Flow
  const handleOpenPlaid = () => {
    setPlaidModalOpen(true);
    setPlaidStep('search');
    setSearchQuery('');
  };

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setPlaidStep('credentials');
  };

  const handlePlaidSubmitCredentials = () => {
    setIsPlaidLoading(true);
    setTimeout(() => {
      setIsPlaidLoading(false);
      setPlaidStep('accounts');
    }, 1200);
  };

  const handlePlaidSelectAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsPlaidLoading(true);
    
    setTimeout(() => {
      setIsPlaidLoading(false);
      setPlaidStep('success');
      setPlaidConnected(true);
      
      // Generate mock tokens
      const mockPublicToken = `public-sandbox-${Math.random().toString(36).substr(2, 9)}`;
      const mockAccessToken = `access-sandbox-${Math.random().toString(36).substr(2, 9)}`;
      const mockProcessorToken = `processor-sandbox-alpaca-${Math.random().toString(36).substr(2, 12)}`;
      
      setProcessorToken(mockProcessorToken);

      // Log Plaid Token Exchange
      addLog(
        'Plaid Public Token Exchange',
        'POST',
        'https://sandbox.plaid.com/item/public_token/exchange',
        { client_id: 'PLAID_CLIENT_ID', secret: 'PLAID_SECRET', public_token: mockPublicToken },
        { access_token: mockAccessToken, item_id: 'item_sandbox_12345', request_id: 'req_plaid_991' }
      );

      // Log Processor Token Creation
      addLog(
        'Create Alpaca Processor Token',
        'POST',
        'https://sandbox.plaid.com/processor/token/create',
        {
          client_id: 'PLAID_CLIENT_ID',
          secret: 'PLAID_SECRET',
          access_token: mockAccessToken,
          account_id: account.id,
          processor: 'alpaca'
        },
        { processor_token: mockProcessorToken, request_id: 'req_plaid_992' }
      );

      setStep(2);
    }, 1500);
  };

  // Establish Alpaca ACH Relationship
  const handleEstablishACH = () => {
    if (!processorToken || !selectedAccount) return;
    setIsPlaidLoading(true);

    setTimeout(() => {
      const mockAchId = `ach_rel_${Math.random().toString(36).substr(2, 9)}`;
      setAchRelationshipId(mockAchId);
      setIsPlaidLoading(false);
      setStep(3);

      // Log Alpaca ACH Relationship Creation
      addLog(
        'Establish Alpaca ACH Relationship',
        'POST',
        `https://paper-api.alpaca.markets/v1/accounts/acc_alpaca_8812/ach_relationships`,
        { processor_token: processorToken },
        {
          id: mockAchId,
          account_id: 'acc_alpaca_8812',
          status: 'APPROVED',
          bank_name: selectedBank?.name || 'Linked Bank',
          bank_account_type: selectedAccount.type,
          bank_account_number_masked: `******${selectedAccount.mask}`,
          created_at: new Date().toISOString()
        }
      );
    }, 1800);
  };

  // Reset Bridge Connection
  const handleResetBridge = () => {
    if (window.confirm('Are you sure you want to unlink this bank account and reset the liquidity bridge?')) {
      if (achRelationshipId) {
        addLog(
          'Delete Alpaca ACH Relationship',
          'DELETE',
          `https://paper-api.alpaca.markets/v1/accounts/acc_alpaca_8812/ach_relationships/${achRelationshipId}`,
          {},
          { status: 'DELETED', id: achRelationshipId }
        );
      }
      setStep(1);
      setPlaidConnected(false);
      setSelectedBank(null);
      setSelectedAccount(null);
      setProcessorToken(null);
      setAchRelationshipId(null);
      setTransferAmount('');
      setTransferSuccess(false);
    }
  };

  // Execute ACH Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    if (transferDirection === 'deposit' && selectedAccount && amount > selectedAccount.balance) {
      setTransferError('Insufficient funds in your linked bank account.');
      return;
    }

    if (transferDirection === 'withdraw' && amount > cashBalance) {
      setTransferError('Insufficient cash balance in your Alpaca account.');
      return;
    }

    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(false);

    // Simulate Alpaca Transfer API Call
    setTimeout(() => {
      const mockTransferId = `tr_alp_${Math.random().toString(36).substr(2, 5)}`;
      const isDeposit = transferDirection === 'deposit';
      
      // Calculate instant funding logic
      let instantApplied = false;
      let instantCredit = 0;
      if (isDeposit) {
        const availableInstantLimit = instantFundingLimit - instantFundingUsed;
        if (availableInstantLimit > 0) {
          instantApplied = true;
          instantCredit = Math.min(amount, availableInstantLimit);
        }
      }

      const newTransfer: Transfer = {
        id: mockTransferId,
        amount,
        direction: transferDirection,
        status: 'pending',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        instantPowerApplied: instantApplied
      };

      setTransfers(prev => [newTransfer, ...prev]);

      // Update Balances
      if (isDeposit) {
        // Instant buying power is credited immediately up to the limit
        if (instantApplied) {
          setBuyingPower(prev => prev + instantCredit);
          setInstantFundingUsed(prev => prev + instantCredit);
        }
        // Bank balance decreases
        if (selectedAccount) {
          selectedAccount.balance -= amount;
        }
      } else {
        // Withdrawal decreases cash and buying power immediately
        setCashBalance(prev => prev - amount);
        setBuyingPower(prev => prev - amount);
      }

      setIsTransferring(false);
      setTransferSuccess(true);
      setTransferAmount('');

      // Log Alpaca Transfer API
      addLog(
        isDeposit ? 'Initiate ACH Deposit' : 'Initiate ACH Withdrawal',
        'POST',
        `https://paper-api.alpaca.markets/v1/accounts/acc_alpaca_8812/transfers`,
        {
          transfer_type: 'ach',
          relationship_id: achRelationshipId,
          amount: amount.toString(),
          direction: isDeposit ? 'INCOMING' : 'OUTGOING',
          timing: 'immediate'
        },
        {
          id: mockTransferId,
          relationship_id: achRelationshipId,
          account_id: 'acc_alpaca_8812',
          type: 'ach',
          status: 'PENDING',
          amount: amount.toString(),
          direction: isDeposit ? 'INCOMING' : 'OUTGOING',
          instant_funding_applied: instantApplied,
          instant_funding_amount: instantCredit.toString(),
          created_at: new Date().toISOString()
        }
      );

      // Simulate transfer completion after 5 seconds
      setTimeout(() => {
        setTransfers(prev => prev.map(t => {
          if (t.id === mockTransferId) {
            // When deposit completes, cash balance actually updates
            if (isDeposit) {
              setCashBalance(prev => prev + amount);
              // If instant funding wasn't fully applied, the rest of buying power is added now
              if (!instantApplied) {
                setBuyingPower(prev => prev + amount);
              } else if (amount > instantCredit) {
                setBuyingPower(prev => prev + (amount - instantCredit));
              }
            }
            return { ...t, status: 'completed' };
          }
          return t;
        }));

        addLog(
          'ACH Transfer Status Update',
          'GET',
          `https://paper-api.alpaca.markets/v1/accounts/acc_alpaca_8812/transfers/${mockTransferId}`,
          {},
          {
            id: mockTransferId,
            status: 'COMPLETED',
            amount: amount.toString(),
            direction: isDeposit ? 'INCOMING' : 'OUTGOING',
            completed_at: new Date().toISOString()
          }
        );
      }, 5000);

    }, 2000);
  };

  // Filtered Banks for Search
  const filteredBanks = useMemo(() => {
    return MOCK_BANKS.filter(bank => 
      bank.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <ArrowLeftRight className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Plaid - Alpaca Liquidity Bridge</h1>
              <p className="text-sm text-slate-400">Instant ACH transfers & real-time trading power synchronization</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Alpaca Sandbox Active
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Plaid Sandbox Active
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Bridge Setup & Transfer Interface */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Link Bank Account */}
          {step === 1 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">1</span>
                  <h2 className="text-lg font-semibold text-slate-200">Link Bank Account</h2>
                </div>
                <span className="text-xs text-slate-500">Step 1 of 3</span>
              </div>
              
              <p className="text-slate-400 text-sm mb-6">
                Connect your external bank account securely using Plaid. This establishes a secure link to authorize instant ACH transfers directly into your Alpaca brokerage account.
              </p>

              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 mb-6 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-300">Bank-Grade Security</h4>
                    <p className="text-xs text-slate-500">Your credentials are never stored. Plaid encrypts and processes all authentication securely.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-300">Instant Verification</h4>
                    <p className="text-xs text-slate-500">Skip micro-deposits. Verify your account instantly and start trading immediately.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenPlaid}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <Link2 className="w-5 h-5" />
                Link Bank Account with Plaid
              </button>
            </div>
          )}

          {/* Step 2: Establish ACH Relationship */}
          {step === 2 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">2</span>
                  <h2 className="text-lg font-semibold text-slate-200">Establish Alpaca ACH Relationship</h2>
                </div>
                <span className="text-xs text-slate-500">Step 2 of 3</span>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                Plaid has successfully authenticated your bank account. Now, we will pass the secure processor token to Alpaca to establish an ACH relationship.
              </p>

              {/* Linked Bank Summary */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${selectedBank?.logoBg} flex items-center justify-center text-xs font-bold text-white`}>
                    {selectedBank?.logoText}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{selectedBank?.name}</h4>
                    <p className="text-xs text-slate-500">{selectedAccount?.name} (•••• {selectedAccount?.mask})</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Available Balance</p>
                  <p className="text-sm font-bold text-emerald-400">${selectedAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Plaid Processor Token:</span>
                  <span className="font-mono text-cyan-400">{processorToken?.substring(0, 25)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Alpaca Account ID:</span>
                  <span className="font-mono text-slate-400">acc_alpaca_8812</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResetBridge}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEstablishACH}
                  disabled={isPlaidLoading}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isPlaidLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Authorize ACH Relationship
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Active Liquidity Bridge */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Active Bridge Status Card */}
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-lg font-semibold text-slate-200">Liquidity Bridge Active</h2>
                  </div>
                  <button
                    onClick={handleResetBridge}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Disconnect Bridge
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Bank Side */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-500 block mb-1">Funding Source (Plaid)</span>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-6 h-6 rounded ${selectedBank?.logoBg} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {selectedBank?.logoText}
                      </div>
                      <span className="text-sm font-semibold text-slate-200">{selectedBank?.name}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400">Balance</span>
                      <span className="text-sm font-bold text-slate-200">${selectedAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  {/* Alpaca Side */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-500 block mb-1">Brokerage (Alpaca)</span>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">ALP</div>
                      <span className="text-sm font-semibold text-slate-200">Alpaca Paper</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400">Buying Power</span>
                      <span className="text-sm font-bold text-emerald-400">${buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Transfer Form */}
                <form onSubmit={handleExecuteTransfer} className="space-y-4">
                  <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTransferDirection('deposit')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${transferDirection === 'deposit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferDirection('withdraw')}
                      className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${transferDirection === 'withdraw' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Withdraw
                    </button>
                  </div>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>

                  {transferError && (
                    <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4" />
                      {transferError}
                    </div>
                  )}

                  {transferSuccess && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Transfer initiated successfully.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {transferDirection === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Logs & History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-500" />
                API Activity Logs
              </h3>
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                {showLogs ? 'Hide' : 'Show'}
              </button>
            </div>

            {showLogs && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {apiLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm">
                    <Code className="w-8 h-8 mb-2 opacity-20" />
                    No API activity yet
                  </div>
                ) : (
                  apiLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${activeLogId === log.id ? 'bg-slate-800 border-slate-700' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                      onClick={() => setActiveLogId(log.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {log.method}
                          </span>
                          <span className="text-xs font-medium text-slate-300">{log.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{log.timestamp.split(' ')[1]}</span>
                      </div>
                      {activeLogId === log.id && (
                        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                          <div className="text-[10px] text-slate-500 font-mono">URL: {log.url}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[9px] text-slate-600 uppercase mb-1">Request</div>
                              <pre className="text-[9px] text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">{log.request}</pre>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-600 uppercase mb-1">Response</div>
                              <pre className="text-[9px] text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">{log.response}</pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plaid Modal Simulation */}
      {plaidModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            {plaidStep === 'search' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Select your bank</h3>
                <input 
                  type="text" 
                  placeholder="Search banks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200"
                />
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredBanks.map(bank => (
                    <button 
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded ${bank.logoBg} flex items-center justify-center text-[10px] font-bold text-white`}>{bank.logoText}</div>
                      <span className="text-sm text-slate-300">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {plaidStep === 'credentials' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Sign in to {selectedBank?.name}</h3>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200" />
                <button 
                  onClick={handlePlaidSubmitCredentials}
                  className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg"
                >
                  {isPlaidLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Continue'}
                </button>
              </div>
            )}

            {plaidStep === 'accounts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Select Account</h3>
                {MOCK_ACCOUNTS[selectedBank?.id || '']?.map(acc => (
                  <button 
                    key={acc.id}
                    onClick={() => handlePlaidSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-sm text-slate-200">{acc.name}</div>
                      <div className="text-xs text-slate-500">•••• {acc.mask}</div>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">${acc.balance.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}

            {plaidStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Successfully Linked</h3>
                <p className="text-sm text-slate-400 mt-2">Redirecting to bridge setup...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}