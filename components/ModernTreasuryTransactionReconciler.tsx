import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  ArrowRightLeft, 
  CheckCircle2, 
  Lock, 
  Crown, 
  RefreshCw, 
  Terminal, 
  ChevronRight, 
  DollarSign,
  FileCode,
  Activity
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  counterparty: string;
  timestamp: string;
  status: 'Settled' | 'Pending' | 'Failed';
  routingCode: string;
  accountNumber: string;
}

interface LedgerEntry {
  id: string;
  amount: number;
  currency: string;
  ledgerAccount: string;
  timestamp: string;
  status: 'posted' | 'pending';
  metadata: {
    citiReference?: string;
    initiator: string;
  };
}

interface DiscrepancyReport {
  id: string;
  citiTxnId: string;
  mtLedgerId: string;
  discrepancyAmount: number;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'NEGLIGIBLE';
  aiConfidence: number;
  suggestedAdjustmentContract: string;
}

export default function ModernTreasuryTransactionReconciler() {
  // --- STATE ---
  const [selectedAccount, setSelectedAccount] = useState<string>('citi-imperial-reserve-001');
  const [isReconciling, setIsReconciling] = useState<boolean>(false);
  const [reconciliationComplete, setReconciliationComplete] = useState<boolean>(false);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<DiscrepancyReport | null>(null);
  const [isExecutingContract, setIsExecutingContract] = useState<boolean>(false);
  const [executionSuccess, setExecutionSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'discrepancies' | 'reconciled'>('all');

  // --- SIMULATED ULTRA-LUXURY DATA ---
  const citiTransactions: Transaction[] = [
    {
      id: 'CITI-TXN-99821-X',
      amount: 3450000000.00, // $3.45 Billion
      currency: 'USD',
      counterparty: 'Kingdom of Saudi Arabia Public Investment Fund',
      timestamp: '2026-03-30T14:22:01.002Z',
      status: 'Settled',
      routingCode: 'CITIUS33XX',
      accountNumber: '****-****-8888-9999'
    },
    {
      id: 'CITI-TXN-99822-Y',
      amount: 1200000000.00, // $1.2 Billion
      currency: 'USD',
      counterparty: 'Arnault Luxury Conglomerate Holding',
      timestamp: '2026-03-30T14:25:15.089Z',
      status: 'Settled',
      routingCode: 'CITIUS33XX',
      accountNumber: '****-****-8888-9999'
    },
    {
      id: 'CITI-TXN-99823-Z',
      amount: 850000000.00, // $850 Million
      currency: 'EUR',
      counterparty: 'Monaco Sovereign Wealth Reserve',
      timestamp: '2026-03-30T14:30:00.000Z',
      status: 'Settled',
      routingCode: 'CITIUS33XX',
      accountNumber: '****-****-8888-9999'
    }
  ];

  const mtLedgerEntries: LedgerEntry[] = [
    {
      id: 'ledger_entry_88219_mt',
      amount: 3449999999.98, // $0.02 discrepancy due to gas fee/routing arbitrage
      currency: 'USD',
      ledgerAccount: 'Sovereign Liquidity Pool A',
      timestamp: '2026-03-30T14:22:01.005Z',
      status: 'posted',
      metadata: {
        citiReference: 'CITI-TXN-99821-X',
        initiator: 'AI-Autonomous-Treasury-V9'
      }
    },
    {
      id: 'ledger_entry_88220_mt',
      amount: 1200000000.00, // Perfect match
      currency: 'USD',
      ledgerAccount: 'Luxury Acquisition Fund',
      timestamp: '2026-03-30T14:25:15.089Z',
      status: 'posted',
      metadata: {
        citiReference: 'CITI-TXN-99822-Y',
        initiator: 'AI-Autonomous-Treasury-V9'
      }
    },
    {
      id: 'ledger_entry_88221_mt',
      amount: 849999950.00, // $50.00 discrepancy due to cross-border clearing fee
      currency: 'EUR',
      ledgerAccount: 'European Sovereign Reserve',
      timestamp: '2026-03-30T14:30:00.012Z',
      status: 'posted',
      metadata: {
        citiReference: 'CITI-TXN-99823-Z',
        initiator: 'AI-Autonomous-Treasury-V9'
      }
    }
  ];

  const discrepancies: DiscrepancyReport[] = [
    {
      id: 'DISC-001',
      citiTxnId: 'CITI-TXN-99821-X',
      mtLedgerId: 'ledger_entry_88219_mt',
      discrepancyAmount: 0.02,
      reason: 'Micro-latency routing arbitrage on Ethereum L2 Settlement Layer during multi-billion dollar transit.',
      severity: 'NEGLIGIBLE',
      aiConfidence: 99.9998,
      suggestedAdjustmentContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CitiMTReconciler {
    address public constant CITI_BRIDGE = 0x71C7656EC7ab88b098defB751B7401B5f6d1476B;
    address public constant MT_LEDGER_ORACLE = 0x2546BcD3c84621e976d8185a91A922bE765c3827;
    address public owner;

    event Reconciled(bytes32 indexed txnHash, uint256 adjustmentAmount);

    constructor() {
        owner = msg.sender;
    }

    function autoAdjustDiscrepancy() external {
        // Auto-adjusting $0.02 discrepancy for $3.45B transaction
        uint256 adjustment = 2 * 10**16; // 0.02 USD equivalent in Wei-scale
        emit Reconciled(keccak256("CITI-TXN-99821-X"), adjustment);
    }
}`
    },
    {
      id: 'DISC-002',
      citiTxnId: 'CITI-TXN-99823-Z',
      mtLedgerId: 'ledger_entry_88221_mt',
      discrepancyAmount: 50.00,
      reason: 'Cross-border clearing fee mismatch. Citibank deducted standard VIP wire fee; Modern Treasury ledger expected zero-fee routing.',
      severity: 'HIGH',
      aiConfidence: 99.9850,
      suggestedAdjustmentContract: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrossBorderFeeAdjuster {
    // Adjusting $50.00 EUR discrepancy for Monaco Sovereign Wealth Reserve
    uint256 public constant ADJUSTMENT_WEI = 50 * 10**18;
    
    event FeeCompensated(string citiRef, uint256 amount);

    function executeAdjustment() external {
        emit FeeCompensated("CITI-TXN-99823-Z", ADJUSTMENT_WEI);
    }
}`
    }
  ];

  // --- HANDLERS ---
  const triggerReconciliation = () => {
    setIsReconciling(true);
    setReconciliationComplete(false);
    setTimeout(() => {
      setIsReconciling(false);
      setReconciliationComplete(true);
      // Auto-select first discrepancy
      setSelectedDiscrepancy(discrepancies[0]);
    }, 2500);
  };

  const executeSmartContract = () => {
    setIsExecutingContract(true);
    setTimeout(() => {
      setIsExecutingContract(false);
      setExecutionSuccess(true);
      setTimeout(() => setExecutionSuccess(false), 4000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Luxury Header */}
      <header className="border-b border-amber-500/20 bg-gradient-to-b from-neutral-950 to-neutral-900/50 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 opacity-75 blur animate-pulse"></div>
            <div className="relative bg-black p-2.5 rounded-full border border-amber-500/40">
              <Crown className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs tracking-[0.3em] uppercase text-amber-500 font-bold">Citibank Imperial</span>
              <span className="text-xs text-neutral-500">×</span>
              <span className="text-xs tracking-[0.3em] uppercase text-neutral-300 font-bold">Modern Treasury</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              AI Sovereign Ledger Reconciler <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full ml-2">Quantum Edition</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right hidden md:block">
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Total Managed Assets</p>
            <p className="text-lg font-mono font-bold text-amber-400">$142,890,450,000.00</p>
          </div>
          <div className="h-8 w-px bg-neutral-800"></div>
          <div className="flex items-center space-x-2 bg-neutral-900/80 border border-neutral-800 px-4 py-2 rounded-lg">
            <Lock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono text-neutral-300">SECURE HSM NODE // 0x99F...A12</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Top Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Citibank Vault Balance</p>
                <h3 className="text-2xl font-mono font-bold text-white mt-2">$5,500,000,000.00</h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Coins className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+12.4% Sovereign Yield (Daily)</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Modern Treasury Ledger</p>
                <h3 className="text-2xl font-mono font-bold text-white mt-2">$5,499,999,949.98</h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Layers className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span>Discrepancy: $50.02 detected</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">AI Model Accuracy</p>
                <h3 className="text-2xl font-mono font-bold text-white mt-2">99.9998%</h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Cpu className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-neutral-400">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Sovereign-GPT-9 Active</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Auto-Adjustment Status</p>
                <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-2">Armed</h3>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-xs text-neutral-400">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span>Smart Contracts Ready</span>
            </div>
          </div>
        </div>

        {/* Account Selector & Action Bar */}
        <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="text-xs text-neutral-400 uppercase tracking-wider">Active Account:</div>
            <select 
              value={selectedAccount} 
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 font-mono cursor-pointer hover:border-amber-500/50 transition-all"
            >
              <option value="citi-imperial-reserve-001">Citibank Imperial Reserve (KSA-PIF) - ****9999</option>
              <option value="citi-monaco-sovereign-002">Citibank Monaco Sovereign - ****8888</option>
              <option value="citi-arnault-luxury-003">Citibank Arnault Luxury - ****7777</option>
            </select>
          </div>

          <button
            onClick={triggerReconciliation}
            disabled={isReconciling}
            className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-amber-500 to-yellow-600 group-hover:from-amber-500 group-hover:to-yellow-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-amber-800 w-full md:w-auto"
          >
            <span className="relative px-6 py-3 transition-all ease-in duration-75 bg-neutral-950 rounded-md group-hover:bg-opacity-0 w-full flex items-center justify-center space-x-2">
              {isReconciling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                  <span className="font-mono tracking-wider">AI RECONCILING MULTI-BILLIONS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="font-mono tracking-wider">RUN AI RECONCILIATION ENGINE</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Main Split View: Citibank vs Modern Treasury */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Citibank Transactions (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Citibank Live Ledger</h2>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Endpoint: /accounts/&#123;accountId&#125;/transactions</span>
            </div>

            <div className="space-y-4">
              {citiTransactions.map((txn) => (
                <div 
                  key={txn.id} 
                  className="bg-neutral-950 border border-neutral-800/80 hover:border-blue-500/30 p-5 rounded-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                        {txn.id}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-2">{txn.counterparty}</h4>
                      <p className="text-xs text-neutral-400 mt-1 font-mono">{txn.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-white">
                        {txn.currency} {txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-2">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Modern Treasury Ledger (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Modern Treasury Ledger</h2>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Endpoint: /ledger_entries</span>
            </div>

            <div className="space-y-4">
              {mtLedgerEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-neutral-950 border border-neutral-800/80 hover:border-amber-500/30 p-5 rounded-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                        {entry.id}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-2">{entry.ledgerAccount}</h4>
                      <p className="text-xs text-neutral-400 mt-1 font-mono">Ref: {entry.metadata.citiReference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-white">
                        {entry.currency} {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-2">
                        {entry.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Discrepancy & Smart Contract Adjustment Panel */}
        {reconciliationComplete && (
          <div className="bg-gradient-to-b from-neutral-950 to-neutral-900 border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.15)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center space-x-3 mb-6">
              <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
              <h2 className="text-xl font-bold text-white tracking-tight">AI Discrepancy Analysis & Smart-Contract Adjustments</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Discrepancy List */}
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Detected Discrepancies</p>
                {discrepancies.map((disc) => (
                  <div 
                    key={disc.id}
                    onClick={() => setSelectedDiscrepancy(disc)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedDiscrepancy?.id === disc.id 
                        ? 'bg-amber-500/10 border-amber-500 text-white' 
                        : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-amber-400">{disc.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        disc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        disc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {disc.severity}
                      </span>
                    </div>
                    <p className="text-sm font-mono font-bold text-white mt-2">
                      Discrepancy: ${disc.discrepancyAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{disc.reason}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>AI Confidence: {disc.aiConfidence}%</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Smart Contract Generator & Executor */}
              <div className="lg:col-span-7 space-y-4">
                {selectedDiscrepancy ? (
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-semibold text-white">AI-Generated Smart Contract Adjustment</h3>
                        <p className="text-xs text-neutral-400 mt-1">Automatically generated to reconcile {selectedDiscrepancy.id} via Ethereum L2 Settlement Layer.</p>
                      </div>
                      <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[10px] font-mono text-emerald-400">Sovereign-GPT-9 Verified</span>
                      </div>
                    </div>

                    {/* Code Block */}
                    <div className="relative bg-neutral-900 rounded-lg p-4 border border-neutral-800 overflow-x-auto max-h-60 font-mono text-xs text-neutral-300">
                      <div className="absolute top-2 right-2 flex items-center space-x-1 text-[10px] text-neutral-500 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                        <FileCode className="h-3 w-3 text-amber-400" />
                        <span>Solidity v0.8.20</span>
                      </div>
                      <pre>{selectedDiscrepancy.suggestedAdjustmentContract}</pre>
                    </div>

                    {/* Execution Panel */}
                    <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <ShieldCheck className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white font-semibold">Multi-Sig Authorization Required</p>
                          <p className="text-[10px] text-neutral-400">Requires Citibank Private Key & Modern Treasury API Signature.</p>
                        </div>
                      </div>

                      <button
                        onClick={executeSmartContract}
                        disabled={isExecutingContract || executionSuccess}
                        className={`px-5 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-300 ${
                          executionSuccess 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500 text-black hover:bg-amber-400 font-bold'
                        }`}
                      >
                        {isExecutingContract ? (
                          <span className="flex items-center space-x-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>EXECUTING CONTRACT...</span>
                          </span>
                        ) : executionSuccess ? (
                          <span className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>ADJUSTMENT EXECUTED</span>
                          </span>
                        ) : (
                          <span>EXECUTE SMART-CONTRACT ADJUSTMENT</span>
                        )}
                      </button>
                    </div>

                    {executionSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-xs text-emerald-400 font-mono space-y-1">
                        <p className="font-bold">✓ Transaction Successfully Reconciled!</p>
                        <p className="text-neutral-400">Smart contract deployed to mainnet at block #19821022. Citibank balance and Modern Treasury ledger are now perfectly aligned at $3,450,000,000.00.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 py-12">
                    <Terminal className="h-8 w-8 mb-2 text-neutral-600" />
                    <p className="text-sm">Select a discrepancy to view AI analysis and smart contract code.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Security Footer */}
        <footer className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-3.5 w-3.5 text-amber-500/60" />
            <span>Quantum-Resistant End-to-End Encryption Active</span>
          </div>
          <div className="flex space-x-6">
            <a href="#docs" className="hover:text-amber-400 transition-colors">Citibank API Docs</a>
            <a href="#docs" className="hover:text-amber-400 transition-colors">Modern Treasury Ledger API</a>
            <a href="#docs" className="hover:text-amber-400 transition-colors">Sovereign AI Compliance</a>
          </div>
          <div>
            <span>© 2026 Citibank Private Client. All Sovereign Rights Reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}