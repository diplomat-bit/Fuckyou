

// --- CONSOLIDATED FROM: ./components/bridges/CitiAlpacaBridgeView.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  Shield, 
  Activity, 
  Cpu, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  FileText, 
  Layers, 
  Zap, 
  Clock, 
  Building, 
  Wallet,
  ChevronRight,
  Lock,
  Eye,
  Check,
  Info,
  Sliders,
  Database
} from 'lucide-react';

// Interfaces
interface CitiAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: string;
}

interface AlpacaAccount {
  id: string;
  name: string;
  accountNumber: string;
  portfolioValue: number;
  buyingPower: number;
  cash: number;
  currency: string;
}

interface SweepRule {
  id: string;
  name: string;
  sourceId: string;
  destId: string;
  triggerType: 'citi_above' | 'citi_below' | 'alpaca_below';
  triggerAmount: number;
  actionType: 'sweep_excess' | 'recall_fixed';
  actionAmount: number;
  status: 'active' | 'paused';
}

interface BridgeTransaction {
  id: string;
  date: string;
  amount: number;
  direction: 'citi_to_alpaca' | 'alpaca_to_citi';
  sourceAccount: string;
  destAccount: string;
  citiStatus: 'ACSP' | 'PDNG' | 'RJCT' | 'INIT';
  alpacaStatus: 'COMPLETE' | 'QUEUED' | 'FAILED' | 'PROCESSING';
  transferType: 'ACH' | 'WIRE' | 'INSTANT';
  e2eId: string;
}

export default function CitiAlpacaBridgeView() {
  // Mock Data State
  const [citiAccounts, setCitiAccounts] = useState<CitiAccount[]>([
    { id: 'citi-opt-01', name: 'Citi Operating Account', accountNumber: 'US89CITIP1234567890', balance: 2450000.00, currency: 'USD', type: 'Operating' },
    { id: 'citi-pay-02', name: 'Citi Payroll Reserve', accountNumber: 'US89CITIP9876543210', balance: 450000.00, currency: 'USD', type: 'Payroll' },
    { id: 'citi-trz-03', name: 'Citi Treasury Liquidity', accountNumber: 'US89CITIP5555555555', balance: 12800000.00, currency: 'USD', type: 'Treasury' }
  ]);

  const [alpacaAccounts, setAlpacaAccounts] = useState<AlpacaAccount[]>([
    { id: 'alpaca-corp-991', name: 'Alpaca Corporate Brokerage', accountNumber: 'ALPAC-CORP-991', portfolioValue: 8120450.00, buyingPower: 1240000.00, cash: 450000.00, currency: 'USD' },
    { id: 'alpaca-yld-882', name: 'Alpaca High-Yield Reserve', accountNumber: 'ALPAC-YLD-882', portfolioValue: 15300000.00, buyingPower: 50000.00, cash: 50000.00, currency: 'USD' }
  ]);

  const [sweepRules, setSweepRules] = useState<SweepRule[]>([
    { id: 'rule-01', name: 'Daily Excess Sweep', sourceId: 'citi-opt-01', destId: 'alpaca-corp-991', triggerType: 'citi_above', triggerAmount: 1000000, actionType: 'sweep_excess', actionAmount: 0.9, status: 'active' },
    { id: 'rule-02', name: 'Liquidity Safeguard', sourceId: 'alpaca-corp-991', destId: 'citi-opt-01', triggerType: 'citi_below', triggerAmount: 250000, actionType: 'recall_fixed', actionAmount: 500000, status: 'active' }
  ]);

  const [transactions, setTransactions] = useState<BridgeTransaction[]>([
    { id: 'TXN-88291-CITI-ALP', date: '2026-08-15 14:30', amount: 150000.00, direction: 'citi_to_alpaca', sourceAccount: 'Citi Operating Account', destAccount: 'Alpaca Corporate Brokerage', citiStatus: 'ACSP', alpacaStatus: 'COMPLETE', transferType: 'ACH', e2eId: 'E2E-CITI-ALP-992811' },
    { id: 'TXN-88290-ALP-CITI', date: '2026-08-14 09:15', amount: 300000.00, direction: 'alpaca_to_citi', sourceAccount: 'Alpaca Corporate Brokerage', destAccount: 'Citi Operating Account', citiStatus: 'ACSP', alpacaStatus: 'COMPLETE', transferType: 'WIRE', e2eId: 'E2E-ALP-CITI-110293' },
    { id: 'TXN-88289-CITI-ALP', date: '2026-08-12 16:45', amount: 500000.00, direction: 'citi_to_alpaca', sourceAccount: 'Citi Treasury Liquidity', destAccount: 'Alpaca High-Yield Reserve', citiStatus: 'ACSP', alpacaStatus: 'COMPLETE', transferType: 'INSTANT', e2eId: 'E2E-CITI-ALP-448291' }
  ]);

  // Form State
  const [sourceAcc, setSourceAcc] = useState<string>('citi-opt-01');
  const [destAcc, setDestAcc] = useState<string>('alpaca-corp-991');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferType, setTransferType] = useState<'ACH' | 'WIRE' | 'INSTANT'>('ACH');
  const [transferMemo, setTransferMemo] = useState<string>('Corporate Treasury Sweep');
  
  // Interactive Stepper State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepLogs, setStepLogs] = useState<string[]>([]);
  const [showPayloadModal, setShowPayloadModal] = useState<boolean>(false);
  const [selectedPayloadType, setSelectedPayloadType] = useState<'citi_xml' | 'alpaca_json'>('citi_xml');

  // Rule Creator State
  const [showRuleCreator, setShowRuleCreator] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleSource, setNewRuleSource] = useState<string>('citi-opt-01');
  const [newRuleDest, setNewRuleDest] = useState<string>('alpaca-corp-991');
  const [newRuleTrigger, setNewRuleTrigger] = useState<'citi_above' | 'citi_below' | 'alpaca_below'>('citi_above');
  const [newRuleTriggerAmt, setNewRuleTriggerAmt] = useState<string>('');
  const [newRuleAction, setNewRuleAction] = useState<'sweep_excess' | 'recall_fixed'>('sweep_excess');
  const [newRuleActionAmt, setNewRuleActionAmt] = useState<string>('');

  // AI Insights State
  const [aiRecommendation, setAiRecommendation] = useState<{
    title: string;
    description: string;
    actionable: boolean;
    suggestedAmount: number;
    impact: string;
  }>({
    title: 'Optimal Yield Allocation Detected',
    description: 'Your Citi Operating Account has maintained a surplus of $1,450,000 above your target operational threshold for 5 consecutive days. We recommend sweeping $1,000,000 to Alpaca High-Yield Reserve to capture 5.25% APY.',
    actionable: true,
    suggestedAmount: 1000000,
    impact: 'Estimated +$4,375 monthly yield generation with T+0 liquidity recall capability.'
  });

  // Totals
  const totalCitiLiquidity = useMemo(() => citiAccounts.reduce((sum, acc) => sum + acc.balance, 0), [citiAccounts]);
  const totalAlpacaAssets = useMemo(() => alpacaAccounts.reduce((sum, acc) => sum + acc.portfolioValue, 0), [alpacaAccounts]);

  // Handshake Stepper Simulation
  const runBridgeHandshake = async () => {
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(1);
    setStepLogs(['[SYSTEM] Initializing Citi-Alpaca Enterprise Bridge Handshake...']);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Citi pain.001 XML Generation
      await sleep(1500);
      setCurrentStep(2);
      setStepLogs(prev => [
        ...prev,
        `[CITICONNECT] Generating ISO 20022 pain.001.001.08 Payment Initiation XML...`,
        `[CITICONNECT] Debtor Account: ${citiAccounts.find(a => a.id === sourceAcc)?.accountNumber}`,
        `[CITICONNECT] Creditor Agent: ALPACUS33XXX (Alpaca Securities Clearing)`
      ]);

      // Step 2: Security Signing & Encryption
      await sleep(1800);
      setCurrentStep(3);
      setStepLogs(prev => [
        ...prev,
        `[SECURITY] Signing XML payload with JWS (RSASSA-PSS using corporate private key)...`,
        `[SECURITY] Encrypting payload with JWE (RSA-OAEP-256 / AES-GCM-256)...`,
        `[SECURITY] FAPI 2.0 Advanced Profile compliance verified. MTLS handshake established.`
      ]);

      // Step 3: CitiConnect API Post
      await sleep(1500);
      setCurrentStep(4);
      setStepLogs(prev => [
        ...prev,
        `[CITICONNECT] POST /v1/payments/initiation - Status: 201 Created`,
        `[CITICONNECT] Payment Instruction Accepted. Status: ACSP (Accepted Settlement In Process)`,
        `[CITICONNECT] End-to-End ID: E2E-CITI-ALP-${Math.floor(Math.random() * 900000 + 100000)}`
      ]);

      // Step 4: Plaid Processor Token Exchange
      await sleep(1800);
      setCurrentStep(5);
      setStepLogs(prev => [
        ...prev,
        `[PLAID] Retrieving processor token for Alpaca ACH relationship...`,
        `[ALPACA] POST /v1/accounts/${alpacaAccounts.find(a => a.id === destAcc)?.id}/ach_relationships`,
        `[ALPACA] ACH Relationship established. Status: APPROVED`
      ]);

      // Step 5: Alpaca Transfer Trigger
      await sleep(1500);
      setCurrentStep(6);
      setStepLogs(prev => [
        ...prev,
        `[ALPACA] POST /v1/accounts/${alpacaAccounts.find(a => a.id === destAcc)?.id}/transfers`,
        `[ALPACA] Transfer initiated. Direction: INCOMING. Status: QUEUED`,
        `[SYSTEM] Bridge execution completed successfully.`
      ]);

      await sleep(1000);
      
      // Update Balances & Transactions
      const amt = Number(transferAmount);
      const isCitiToAlpaca = sourceAcc.startsWith('citi');
      
      if (isCitiToAlpaca) {
        setCitiAccounts(prev => prev.map(a => a.id === sourceAcc ? { ...a, balance: a.balance - amt } : a));
        setAlpacaAccounts(prev => prev.map(a => a.id === destAcc ? { ...a, portfolioValue: a.portfolioValue + amt, cash: a.cash + amt, buyingPower: a.buyingPower + amt } : a));
      } else {
        setAlpacaAccounts(prev => prev.map(a => a.id === sourceAcc ? { ...a, portfolioValue: a.portfolioValue - amt, cash: a.cash - amt, buyingPower: a.buyingPower - amt } : a));
        setCitiAccounts(prev => prev.map(a => a.id === destAcc ? { ...a, balance: a.balance + amt } : a));
      }

      const newTxn: BridgeTransaction = {
        id: `TXN-${Math.floor(Math.random() * 90000 + 10000)}-CITI-ALP`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        amount: amt,
        direction: isCitiToAlpaca ? 'citi_to_alpaca' : 'alpaca_to_citi',
        sourceAccount: citiAccounts.find(a => a.id === sourceAcc)?.name || alpacaAccounts.find(a => a.id === sourceAcc)?.name || '',
        destAccount: alpacaAccounts.find(a => a.id === destAcc)?.name || citiAccounts.find(a => a.id === destAcc)?.name || '',
        citiStatus: 'ACSP',
        alpacaStatus: 'COMPLETE',
        transferType: transferType,
        e2eId: `E2E-BRIDGE-${Math.floor(Math.random() * 900000 + 100000)}`
      };

      setTransactions(prev => [newTxn, ...prev]);
      setTransferAmount('');
      
    } catch (err) {
      setStepLogs(prev => [...prev, `[ERROR] Bridge execution failed: ${err}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rule Creator Handler
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleTriggerAmt || !newRuleActionAmt) {
      alert('Please fill in all rule parameters.');
      return;
    }

    const newRule: SweepRule = {
      id: `rule-${Math.floor(Math.random() * 900 + 100)}`,
      name: newRuleName,
      sourceId: newRuleSource,
      destId: newRuleDest,
      triggerType: newRuleTrigger,
      triggerAmount: Number(newRuleTriggerAmt),
      actionType: newRuleAction,
      actionAmount: Number(newRuleActionAmt),
      status: 'active'
    };

    setSweepRules(prev => [...prev, newRule]);
    setNewRuleName('');
    setNewRuleTriggerAmt('');
    setNewRuleActionAmt('');
    setShowRuleCreator(false);
  };

  // Toggle Rule Status
  const toggleRule = (id: string) => {
    setSweepRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  // Delete Rule
  const deleteRule = (id: string) => {
    setSweepRules(prev => prev.filter(r => r.id !== id));
  };

  // Execute AI Recommendation
  const executeAiRecommendation = () => {
    setSourceAcc('citi-opt-01');
    setDestAcc('alpaca-corp-991');
    setTransferAmount(aiRecommendation.suggestedAmount.toString());
    setTransferType('INSTANT');
    setTransferMemo('AI Recommended Yield Optimization Sweep');
    
    // Scroll to transfer console
    const element = document.getElementById('transfer-console');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mock Payloads for Developer Preview
  const mockCitiXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.08">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-CITI-ALP-20260817-01</MsgId>
      <CreDtTm>2026-08-17T08:51:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <InitgPty>
        <Nm>SOVEREIGN CORP TREASURY</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-INF-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>2026-08-17</ReqdExctnDt>
      <Dbtr>
        <Nm>SOVEREIGN CORP OPERATING</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <Othr>
            <Id>US89CITIP1234567890</Id>
          </Othr>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>CITIUS33XXX</BICFI>
        </FinInstnId>
      </DbtrAgt>
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>E2E-CITI-ALP-992811</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="USD">${transferAmount || '1000000.00'}</InstdAmt>
        </Amt>
        <CdtrAgt>
          <FinInstnId>
            <BICFI>ALPACUS33XXX</BICFI>
          </FinInstnId>
        </CdtrAgt>
        <Cdtr>
          <Nm>ALPACA SECURITIES CLEARING</Nm>
        </Cdtr>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

  const mockAlpacaJsonPayload = `{
  "account_id": "alpaca-corp-991",
  "type": "ach",
  "direction": "incoming",
  "amount": "${transferAmount || '1000000.00'}",
  "processor_token": "processor-sandbox-161c86dd-d470-47e9-a741-d381c2b2cb6f",
  "bank_account_id": "794c3c51-71a8-4186-b5d0-247b6fb4045e",
  "timing": "immediate",
  "metadata": {
    "citi_payment_ref": "E2E-CITI-ALP-992811",
    "initiated_by": "Sovereign Treasury Agent"
  }
}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl shadow-lg shadow-blue-500/10">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Citi ⇄ Alpaca Enterprise Bridge
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Automated Corporate Cash Management & Treasury Liquidity Sweep Engine
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CitiConnect API: Connected
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Alpaca Broker API: Connected
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-blue-500/20 rounded-full text-xs text-blue-400">
            <Shield className="w-3.5 h-3.5" />
            FAPI 2.0 Secure
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Citi Treasury Liquidity</span>
            <Building className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">${totalCitiLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">3 Accounts</span> active across USD rails
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Alpaca Brokerage Assets</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">${totalAlpacaAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">2 Portfolios</span> managed via Broker API
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Sweep Rules</span>
            <Sliders className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{sweepRules.filter(r => r.status === 'active').length} <span className="text-sm font-normal text-slate-500">/ {sweepRules.length}</span></div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            Automated liquidity balancing active
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Bridge Volume (24h)</span>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">$950,000.00</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">+12.4%</span> vs previous 24h period
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Transfer Console & AI Insights */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Transfer Console */}
          <div id="transfer-console" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Bridge Transfer Console</h2>
              </div>
              <button 
                onClick={() => setShowPayloadModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Developer Payload Preview
              </button>
            </div>

            {/* Transfer Form */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Account */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Source Account</label>
                  <select 
                    value={sourceAcc}
                    onChange={(e) => setSourceAcc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <optgroup label="Citi Treasury Accounts">
                      {citiAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Alpaca Brokerage Accounts">
                      {alpacaAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.portfolioValue.toLocaleString()})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Destination Account */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destination Account</label>
                  <select 
                    value={destAcc}
                    onChange={(e) => setDestAcc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <optgroup label="Alpaca Brokerage Accounts">
                      {alpacaAccounts.map(acc => (
                        <option key={acc.id} value={acc.id} disabled={acc.id === sourceAcc}>{acc.name} (${acc.portfolioValue.toLocaleString()})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Citi Treasury Accounts">
                      {citiAccounts.map(acc => (
                        <option key={acc.id} value={acc.id} disabled={acc.id === sourceAcc}>{acc.name} (${acc.balance.toLocaleString()})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Amount & Transfer Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transfer Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transfer Rail</label>
                  <select 
                    value={transferType}
                    onChange={(e) => setTransferType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="ACH">ACH (Plaid)</option>
                    <option value="WIRE">Fedwire</option>
                    <option value="INSTANT">Instant Funding</option>
                  </select>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Reference / Memo</label>
                <input 
                  type="text" 
                  value={transferMemo}
                  onChange={(e) => setTransferMemo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Action Button */}
              <button 
                onClick={runBridgeHandshake}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Executing Bridge Handshake...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-5 h-5" />
                    Initiate Bridge Transfer
                  </>
                )}
              </button>
            </div>

            {/* Stepper Progress Overlay */}
            {isSubmitting && (
              <div className="mt-6 p-5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Bridge Handshake Progress</span>
                  <span className="text-xs text-slate-500">Step {currentStep} of 6</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${(currentStep / 6) * 100}%` }}
                  ></div>
                </div>

                {/* Stepper Steps */}
                <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-semibold text-slate-500">
                  <div className={currentStep >= 1 ? 'text-blue-400' : ''}>Init</div>
                  <div className={currentStep >= 2 ? 'text-blue-400' : ''}>ISO XML</div>
                  <div className={currentStep >= 3 ? 'text-blue-400' : ''}>JWS/JWE</div>
                  <div className={currentStep >= 4 ? 'text-blue-400' : ''}>Citi API</div>
                  <div className={currentStep >= 5 ? 'text-blue-400' : ''}>Plaid</div>
                  <div className={currentStep >= 6 ? 'text-emerald-400' : ''}>Alpaca</div>
                </div>

                {/* Logs */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/50 font-mono text-[11px] text-slate-300 space-y-1 max-h-32 overflow-y-auto">
                  {stepLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SYSTEM]') ? 'text-violet-400' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Cash Flow Optimizer */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-md font-bold text-white">AI Cash Flow Optimizer</h3>
              <span className="ml-auto px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Active Agent</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {aiRecommendation.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {aiRecommendation.description}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">Projected Impact:</span>
                <span className="text-emerald-400 font-medium">{aiRecommendation.impact}</span>
              </div>
            </div>

            {aiRecommendation.actionable && (
              <button 
                onClick={executeAiRecommendation}
                className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                Execute Recommended Sweep (${aiRecommendation.suggestedAmount.toLocaleString()})
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Sweep Rules Engine & Security Vault */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Sweep Rules Engine */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">Sweep Rules Engine</h2>
              </div>
              <button 
                onClick={() => setShowRuleCreator(!showRuleCreator)}
                className="flex items-center gap-1 px-2.5 py-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-lg text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            </div>

            {/* Rule Creator Form */}
            {showRuleCreator && (
              <form onSubmit={handleCreateRule} className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">New Sweep Rule</span>
                  <button type="button" onClick={() => setShowRuleCreator(false)} className="text-slate-500 hover:text-slate-300 text-xs">Cancel</button>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rule Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Excess Cash Sweep"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Source</label>
                    <select 
                      value={newRuleSource}
                      onChange={(e) => setNewRuleSource(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      {citiAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      {alpacaAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Destination</label>
                    <select 
                      value={newRuleDest}
                      onChange={(e) => setNewRuleDest(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      {alpacaAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      {citiAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Trigger Condition</label>
                    <select 
                      value={newRuleTrigger}
                      onChange={(e) => setNewRuleTrigger(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="citi_above">Citi Balance Above</option>
                      <option value="citi_below">Citi Balance Below</option>
                      <option value="alpaca_below">Alpaca Balance Below</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Trigger Amount ($)</label>
                    <input 
                      type="number" 
                      placeholder="1000000"
                      value={newRuleTriggerAmt}
                      onChange={(e) => setNewRuleTriggerAmt(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Action Type</label>
                    <select 
                      value={newRuleAction}
                      onChange={(e) => setNewRuleAction(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="sweep_excess">Sweep % of Excess</option>
                      <option value="recall_fixed">Recall Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Action Value (Amt or %)</label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="e.g., 0.90 for 90%"
                      value={newRuleActionAmt}
                      onChange={(e) => setNewRuleActionAmt(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 rounded-lg text-xs transition-all"
                >
                  Save Rule
                </button>
              </form>
            )}

            {/* Rules List */}
            <div className="space-y-3">
              {sweepRules.map(rule => {
                const sourceName = citiAccounts.find(a => a.id === rule.sourceId)?.name || alpacaAccounts.find(a => a.id === rule.sourceId)?.name || 'Unknown';
                const destName = alpacaAccounts.find(a => a.id === rule.destId)?.name || citiAccounts.find(a => a.id === rule.destId)?.name || 'Unknown';
                
                return (
                  <div key={rule.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {rule.name}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${rule.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                            {rule.status}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Route: <span className="text-slate-300 font-medium">{sourceName}</span> ⇄ <span className="text-slate-300 font-medium">{destName}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => toggleRule(rule.id)}
                          className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white transition-all"
                          title={rule.status === 'active' ? 'Pause Rule' : 'Activate Rule'}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteRule(rule.id)}
                          className="p-1 bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-900 rounded text-slate-400 hover:text-red-400 transition-all"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50 text-[11px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Trigger:</span>
                        <span className="text-slate-200 font-medium">
                          {rule.triggerType === 'citi_above' ? 'Citi Balance >' : rule.triggerType === 'citi_below' ? 'Citi Balance <' : 'Alpaca Balance <'} ${rule.triggerAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Action:</span>
                        <span className="text-slate-200 font-medium">
                          {rule.actionType === 'sweep_excess' ? `Sweep ${(rule.actionAmount * 100)}% of excess` : `Recall $${rule.actionAmount.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & Compliance Vault */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Security & Compliance</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-emerald-500/10 rounded">
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">JWS / JWE Signing</div>
                    <div className="text-[10px] text-slate-500">RSASSA-PSS & RSA-OAEP-256</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-emerald-500/10 rounded">
                    <Database className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">ISO 20022 Compliance</div>
                    <div className="text-[10px] text-slate-500">pain.001.001.08 XML Schema</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">VERIFIED</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-blue-500/10 rounded">
                    <Check className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Plaid Processor Token</div>
                    <div className="text-[10px] text-slate-500">Direct Alpaca ACH Integration</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">CONNECTED</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                All transfers initiated through this bridge are subject to corporate multi-signature approval rules. Large sweeps exceeding $5,000,000 require secondary authorization from the Treasury Director.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section: Bridge Transaction Ledger */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Bridge Transaction Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time audit trail of CitiConnect and Alpaca Broker API operations</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Ledger
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Citi Status</th>
                <th className="py-3 px-4">Alpaca Status</th>
                <th className="py-3 px-4">Rail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-slate-900/30 transition-all">
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div>{txn.id}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">E2E: {txn.e2eId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{txn.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${txn.direction === 'citi_to_alpaca' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {txn.direction === 'citi_to_alpaca' ? (
                        <>
                          <ArrowUpRight className="w-3 h-3" />
                          Citi ➔ Alpaca
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="w-3 h-3" />
                          Alpaca ➔ Citi
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300 font-medium">{txn.sourceAccount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">to {txn.destAccount}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">
                    ${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                      {txn.citiStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                      {txn.alpacaStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-semibold text-[10px]">
                      {txn.transferType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer Payload Preview Modal */}
      {showPayloadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Developer API Payload Preview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Inspect the raw payloads generated for CitiConnect and Alpaca Broker APIs</p>
              </div>
              <button 
                onClick={() => setShowPayloadModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/50">
              <button 
                onClick={() => setSelectedPayloadType('citi_xml')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${selectedPayloadType === 'citi_xml' ? 'border-blue-500 text-blue-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Citi pain.001 XML (ISO 20022)
              </button>
              <button 
                onClick={() => setSelectedPayloadType('alpaca_json')}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${selectedPayloadType === 'alpaca_json' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Alpaca ACH Transfer JSON
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300">
              {selectedPayloadType === 'citi_xml' ? (
                <pre className="whitespace-pre-wrap break-all bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 text-blue-300">
                  {mockCitiXmlPayload}
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap break-all bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 text-emerald-300">
                  {mockAlpacaJsonPayload}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedPayloadType === 'citi_xml' ? mockCitiXmlPayload : mockAlpacaJsonPayload);
                  alert('Payload copied to clipboard!');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Copy to Clipboard
              </button>
              <button 
                onClick={() => setShowPayloadModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}