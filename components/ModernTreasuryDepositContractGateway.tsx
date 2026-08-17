import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  Landmark,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Sparkles,
  DollarSign,
  Activity,
  Lock,
  Terminal,
  BarChart3,
  AlertCircle,
  FileCheck2,
  Sliders,
  ChevronRight,
  Layers,
  Zap,
  Globe2,
  CheckCircle2,
  Clock,
  Coins,
  Send,
  Database
} from 'lucide-react';

interface DualCurrencyDepositContract {
  id: string;
  contractRef: string;
  modernTreasuryLedgerId: string;
  citibankBookingUnit: string;
  baseCurrency: 'USD' | 'EUR' | 'GBP' | 'SGD' | 'CHF' | 'JPY';
  alternateCurrency: 'USD' | 'EUR' | 'GBP' | 'SGD' | 'CHF' | 'JPY';
  principalAmount: number;
  strikeRate: number;
  currentSpotRate: number;
  tenorDays: number;
  effectiveDate: string;
  fixingDate: string;
  maturityDate: string;
  enhancedApy: number;
  benchmarkApy: number;
  premiumYieldSpread: number;
  status: 'ACTIVE_LOCKED' | 'FIXING_PENDING' | 'MATURED_DISBURSING' | 'RENEWAL_QUEUED';
  renewalInstruction: 'AUTO_ROLLOVER_ALL' | 'PRINCIPAL_ROLLOVER_INTEREST_SWEEP' | 'FULL_DISBURSEMENT_TO_LEDGER';
  baseDisposalAccountId: string;
  alternateDisposalAccountId: string;
  aiConversionProbability: number;
  ledgerSyncStatus: 'SYNCHRONIZED' | 'PENDING_POSTING' | 'RECONCILED';
}

interface ModernTreasuryLedgerDisbursement {
  id: string;
  timestamp: string;
  depositRef: string;
  sourceInternalAccountId: string;
  destinationAccountId: string;
  currency: string;
  grossAmount: number;
  withholdingTax: number;
  netSettlementAmount: number;
  ledgerTransactionId: string;
  paymentOrderType: 'FEDWIRE_HIGH_VALUE' | 'CHIPS_INSTANT' | 'SWIFT_GPI_PRIORITY';
  reconciliationStatus: 'SETTLED' | 'POSTED_TO_LEDGER' | 'IN_FLIGHT';
}

const INITIAL_CONTRACTS: DualCurrencyDepositContract[] = [
  {
    id: 'DCD-CITI-MT-98421',
    contractRef: 'CITI-NY-DCD-2025-0891A',
    modernTreasuryLedgerId: 'led_inst_994827104928_citicorp',
    citibankBookingUnit: 'Citibank N.A. London PB/ICG Ultra-Desk',
    baseCurrency: 'USD',
    alternateCurrency: 'EUR',
    principalAmount: 25000000.0,
    strikeRate: 1.0745,
    currentSpotRate: 1.0812,
    tenorDays: 30,
    effectiveDate: '2025-02-15',
    fixingDate: '2025-03-15',
    maturityDate: '2025-03-17',
    enhancedApy: 14.85,
    benchmarkApy: 4.45,
    premiumYieldSpread: 10.40,
    status: 'ACTIVE_LOCKED',
    renewalInstruction: 'PRINCIPAL_ROLLOVER_INTEREST_SWEEP',
    baseDisposalAccountId: 'ia_mt_citi_usd_primary_0091',
    alternateDisposalAccountId: 'ia_mt_citi_eur_synthetic_8820',
    aiConversionProbability: 28.4,
    ledgerSyncStatus: 'SYNCHRONIZED'
  },
  {
    id: 'DCD-CITI-MT-98422',
    contractRef: 'CITI-SG-DCD-2025-4419K',
    modernTreasuryLedgerId: 'led_inst_118492048591_sg_nominee',
    citibankBookingUnit: 'Citibank Singapore Wealth Hub Sovereign Custody',
    baseCurrency: 'USD',
    alternateCurrency: 'SGD',
    principalAmount: 50000000.0,
    strikeRate: 1.3320,
    currentSpotRate: 1.3315,
    tenorDays: 14,
    effectiveDate: '2025-02-20',
    fixingDate: '2025-03-06',
    maturityDate: '2025-03-08',
    enhancedApy: 18.20,
    benchmarkApy: 4.50,
    premiumYieldSpread: 13.70,
    status: 'ACTIVE_LOCKED',
    renewalInstruction: 'AUTO_ROLLOVER_ALL',
    baseDisposalAccountId: 'ia_mt_citi_usd_sg_treasury_1120',
    alternateDisposalAccountId: 'ia_mt_citi_sgd_settlement_9934',
    aiConversionProbability: 54.9,
    ledgerSyncStatus: 'SYNCHRONIZED'
  },
  {
    id: 'DCD-CITI-MT-98423',
    contractRef: 'CITI-CH-DCD-2025-7721X',
    modernTreasuryLedgerId: 'led_inst_662910482910_zurich_vault',
    citibankBookingUnit: 'Citibank (Switzerland) AG Private Vaults',
    baseCurrency: 'EUR',
    alternateCurrency: 'CHF',
    principalAmount: 40000000.0,
    strikeRate: 0.9380,
    currentSpotRate: 0.9450,
    tenorDays: 60,
    effectiveDate: '2025-01-10',
    fixingDate: '2025-03-10',
    maturityDate: '2025-03-12',
    enhancedApy: 12.90,
    benchmarkApy: 3.15,
    premiumYieldSpread: 9.75,
    status: 'FIXING_PENDING',
    renewalInstruction: 'FULL_DISBURSEMENT_TO_LEDGER',
    baseDisposalAccountId: 'ia_mt_citi_eur_ch_omnibus_4412',
    alternateDisposalAccountId: 'ia_mt_citi_chf_disposal_7781',
    aiConversionProbability: 14.2,
    ledgerSyncStatus: 'SYNCHRONIZED'
  },
  {
    id: 'DCD-CITI-MT-98424',
    contractRef: 'CITI-TYO-DCD-2025-3310J',
    modernTreasuryLedgerId: 'led_inst_443920194851_tokyo_inst',
    citibankBookingUnit: 'Citigroup Global Markets Japan Capital Core',
    baseCurrency: 'USD',
    alternateCurrency: 'JPY',
    principalAmount: 100000000.0,
    strikeRate: 154.50,
    currentSpotRate: 152.80,
    tenorDays: 21,
    effectiveDate: '2025-02-18',
    fixingDate: '2025-03-11',
    maturityDate: '2025-03-13',
    enhancedApy: 22.40,
    benchmarkApy: 4.48,
    premiumYieldSpread: 17.92,
    status: 'RENEWAL_QUEUED',
    renewalInstruction: 'AUTO_ROLLOVER_ALL',
    baseDisposalAccountId: 'ia_mt_citi_usd_tokyo_prime_5541',
    alternateDisposalAccountId: 'ia_mt_citi_jpy_disposal_0033',
    aiConversionProbability: 81.3,
    ledgerSyncStatus: 'RECONCILED'
  }
];

const INITIAL_DISBURSEMENTS: ModernTreasuryLedgerDisbursement[] = [
  {
    id: 'MT-DISB-9021884',
    timestamp: '2025-02-24 14:32:10 UTC',
    depositRef: 'CITI-NY-DCD-2025-0104B',
    sourceInternalAccountId: 'ia_mt_citi_usd_primary_0091',
    destinationAccountId: 'cparty_acc_institutional_treasury_440',
    currency: 'USD',
    grossAmount: 35431506.85,
    withholdingTax: 0.0,
    netSettlementAmount: 35431506.85,
    ledgerTransactionId: 'ltx_992018471940_mt_settle',
    paymentOrderType: 'FEDWIRE_HIGH_VALUE',
    reconciliationStatus: 'SETTLED'
  },
  {
    id: 'MT-DISB-9021885',
    timestamp: '2025-02-24 12:15:44 UTC',
    depositRef: 'CITI-SG-DCD-2025-8821Z',
    sourceInternalAccountId: 'ia_mt_citi_sgd_settlement_9934',
    destinationAccountId: 'cparty_acc_sg_sovereign_prime_901',
    currency: 'SGD',
    grossAmount: 18920110.42,
    withholdingTax: 0.0,
    netSettlementAmount: 18920110.42,
    ledgerTransactionId: 'ltx_551029481942_mt_settle',
    paymentOrderType: 'CHIPS_INSTANT',
    reconciliationStatus: 'SETTLED'
  },
  {
    id: 'MT-DISB-9021886',
    timestamp: '2025-02-24 09:44:02 UTC',
    depositRef: 'CITI-CH-DCD-2025-1109W',
    sourceInternalAccountId: 'ia_mt_citi_chf_disposal_7781',
    destinationAccountId: 'cparty_acc_geneva_custody_811',
    currency: 'CHF',
    grossAmount: 48924000.00,
    withholdingTax: 0.0,
    netSettlementAmount: 48924000.00,
    ledgerTransactionId: 'ltx_331049281094_mt_settle',
    paymentOrderType: 'SWIFT_GPI_PRIORITY',
    reconciliationStatus: 'POSTED_TO_LEDGER'
  }
];

export const ModernTreasuryDepositContractGateway: React.FC = () => {
  const [contracts, setContracts] = useState<DualCurrencyDepositContract[]>(INITIAL_CONTRACTS);
  const [disbursements, setDisbursements] = useState<ModernTreasuryLedgerDisbursement[]>(INITIAL_DISBURSEMENTS);
  const [selectedContractId, setSelectedContractId] = useState<string>(INITIAL_CONTRACTS[0].id);
  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'AI_STRIKE_ENGINE' | 'LEDGER_PIPELINE' | 'NEW_DCD_ORCHESTRATOR'>('CONTRACTS');
  const [isAiOptimizing, setIsAiOptimizing] = useState<boolean>(false);
  const [aiOptimizationLogs, setAiOptimizationLogs] = useState<string[]>([]);
  const [livePulse, setLivePulse] = useState<boolean>(true);

  // New Deposit State
  const [newBaseCcy, setNewBaseCcy] = useState<'USD' | 'EUR' | 'GBP' | 'SGD' | 'CHF' | 'JPY'>('USD');
  const [newAltCcy, setNewAltCcy] = useState<'USD' | 'EUR' | 'GBP' | 'SGD' | 'CHF' | 'JPY'>('EUR');
  const [newPrincipal, setNewPrincipal] = useState<number>(50000000);
  const [newTenor, setNewTenor] = useState<number>(30);
  const [newStrikeDelta, setNewStrikeDelta] = useState<number>(1.5); // % out of money
  const [newRolloverRule, setNewRolloverRule] = useState<'AUTO_ROLLOVER_ALL' | 'PRINCIPAL_ROLLOVER_INTEREST_SWEEP' | 'FULL_DISBURSEMENT_TO_LEDGER'>('AUTO_ROLLOVER_ALL');
  const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);
  const [deploymentSuccessMessage, setDeploymentSuccessMessage] = useState<string | null>(null);

  // Pulse animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse(prev => !prev);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const activeContract = useMemo(() => {
    return contracts.find(c => c.id === selectedContractId) || contracts[0];
  }, [contracts, selectedContractId]);

  const totalCapitalCommittedUSD = useMemo(() => {
    return contracts.reduce((acc, c) => {
      let multiplier = 1.0;
      if (c.baseCurrency === 'EUR') multiplier = 1.08;
      if (c.baseCurrency === 'GBP') multiplier = 1.29;
      if (c.baseCurrency === 'SGD') multiplier = 0.75;
      if (c.baseCurrency === 'CHF') multiplier = 1.13;
      if (c.baseCurrency === 'JPY') multiplier = 0.0066;
      return acc + (c.principalAmount * multiplier);
    }, 0);
  }, [contracts]);

  const aggregateApy = useMemo(() => {
    const totalWeighted = contracts.reduce((acc, c) => acc + (c.enhancedApy * c.principalAmount), 0);
    const totalP = contracts.reduce((acc, c) => acc + c.principalAmount, 0);
    return totalP > 0 ? (totalWeighted / totalP).toFixed(2) : '0.00';
  }, [contracts]);

  const handleTriggerAiOptimization = () => {
    setIsAiOptimizing(true);
    setAiOptimizationLogs([]);

    const steps = [
      'Citibank Velocity DeepFX neural network query initiated...',
      'Modern Treasury real-time cash balance ledger ingestion verified across 6 internal accounts...',
      'Calculating Black-Scholes-Merton implied volatility skew on institutional FX options barrier...',
      'Simulating dual-currency maturity strike fixing probabilities under Monte Carlo (500,000 paths)...',
      'Optimizing Modern Treasury automated disbursement payment order parameters...',
      'Citi-Quantum Yield Curve locked: Yield optimized by +84 bps across portfolio.'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setAiOptimizationLogs(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setIsAiOptimizing(false);
          setContracts(prev =>
            prev.map(c => ({
              ...c,
              enhancedApy: +(c.enhancedApy + 0.18).toFixed(2),
              premiumYieldSpread: +(c.premiumYieldSpread + 0.18).toFixed(2)
            }))
          );
        }
      }, (index + 1) * 750);
    });
  };

  const handleUpdateRenewalInstruction = (contractId: string, instruction: DualCurrencyDepositContract['renewalInstruction']) => {
    setContracts(prev =>
      prev.map(c => (c.id === contractId ? { ...c, renewalInstruction: instruction } : c))
    );
  };

  const handleDeployNewDCD = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeployingContract(true);

    setTimeout(() => {
      const idCode = Math.floor(10000 + Math.random() * 90000);
      const spotMap: Record<string, number> = {
        'USD/EUR': 1.0820,
        'USD/SGD': 1.3325,
        'USD/JPY': 153.20,
        'USD/CHF': 0.8840,
        'USD/GBP': 0.7780,
        'EUR/USD': 0.9242,
        'EUR/CHF': 0.9450,
        'EUR/JPY': 165.70,
        'GBP/USD': 1.2850,
        'CHF/USD': 1.1310,
        'SGD/USD': 0.7504,
        'JPY/USD': 0.00652
      };

      const pairKey = `${newBaseCcy}/${newAltCcy}`;
      const spot = spotMap[pairKey] || 1.1500;
      const strike = Number((spot * (1 + newStrikeDelta / 100)).toFixed(4));
      const apy = Number((4.5 + newStrikeDelta * 4.2 + (newTenor === 14 ? 3.5 : 2.0)).toFixed(2));

      const newContract: DualCurrencyDepositContract = {
        id: `DCD-CITI-MT-${idCode}`,
        contractRef: `CITI-SYNTH-DCD-2025-${idCode}Q`,
        modernTreasuryLedgerId: `led_inst_${Math.floor(100000000000 + Math.random() * 900000000000)}_citi_mt`,
        citibankBookingUnit: 'Citibank Institutional Client Group (ICG) Sovereign Prime',
        baseCurrency: newBaseCcy,
        alternateCurrency: newAltCcy,
        principalAmount: newPrincipal,
        strikeRate: strike,
        currentSpotRate: spot,
        tenorDays: newTenor,
        effectiveDate: new Date().toISOString().split('T')[0],
        fixingDate: new Date(Date.now() + newTenor * 86400000).toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + (newTenor + 2) * 86400000).toISOString().split('T')[0],
        enhancedApy: apy,
        benchmarkApy: 4.50,
        premiumYieldSpread: +(apy - 4.50).toFixed(2),
        status: 'ACTIVE_LOCKED',
        renewalInstruction: newRolloverRule,
        baseDisposalAccountId: `ia_mt_citi_${newBaseCcy.toLowerCase()}_disposal_${idCode}`,
        alternateDisposalAccountId: `ia_mt_citi_${newAltCcy.toLowerCase()}_disposal_${idCode}`,
        aiConversionProbability: Math.min(95, Math.max(5, Math.round(50 - newStrikeDelta * 12))),
        ledgerSyncStatus: 'SYNCHRONIZED'
      };

      setContracts(prev => [newContract, ...prev]);
      setSelectedContractId(newContract.id);
      setIsDeployingContract(false);
      setDeploymentSuccessMessage(`Contract ${newContract.contractRef} successfully booked and locked into Modern Treasury Ledger.`);
      setActiveTab('CONTRACTS');

      setTimeout(() => setDeploymentSuccessMessage(null), 8000);
    }, 1800);
  };

  const handleInstantDisbursementTrigger = (contract: DualCurrencyDepositContract) => {
    const newDisb: ModernTreasuryLedgerDisbursement = {
      id: `MT-DISB-${Math.floor(1000000 + Math.random() * 9000000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      depositRef: contract.contractRef,
      sourceInternalAccountId: contract.baseDisposalAccountId,
      destinationAccountId: `cparty_vault_${contract.baseCurrency.toLowerCase()}_${Math.floor(100 + Math.random() * 899)}`,
      currency: contract.baseCurrency,
      grossAmount: contract.principalAmount * (1 + (contract.enhancedApy / 100) * (contract.tenorDays / 365)),
      withholdingTax: 0.0,
      netSettlementAmount: contract.principalAmount * (1 + (contract.enhancedApy / 100) * (contract.tenorDays / 365)),
      ledgerTransactionId: `ltx_${Math.floor(100000000000 + Math.random() * 900000000000)}_mt_settle`,
      paymentOrderType: 'FEDWIRE_HIGH_VALUE',
      reconciliationStatus: 'SETTLED'
    };

    setDisbursements(prev => [newDisb, ...prev]);
    setContracts(prev =>
      prev.map(c => (c.id === contract.id ? { ...c, status: 'MATURED_DISBURSING' } : c))
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner / Prestige Brand Header */}
      <header className="relative mb-8 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 p-6 border border-amber-500/20 shadow-[0_0_50px_rgba(217,119,6,0.08)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30">
                <Landmark className="w-3.5 h-3.5" />
                CITIBANK INSTITUTIONAL CLIENT GROUP &bull; MODERN TREASURY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <span className={`w-2 h-2 rounded-full ${livePulse ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-600'}`} />
                REAL-TIME SYNCHRONIZED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200/90 bg-clip-text text-transparent">
              Dual-Currency Premium Deposit &amp; Time Deposit Gateway
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Citibank Velocity algorithmic yield engine integrated with Modern Treasury programmatic ledger pipelines. Orchestrating base vs. alternate currency disposal accounts, automated strike fixing, and multi-currency maturity renewal sweeps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerAiOptimization}
              disabled={isAiOptimizing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAiOptimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Running Neural FX Sweep...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  Citi-AI Yield Parity Boost
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('NEW_DCD_ORCHESTRATOR')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              New DCD Contract
            </button>
          </div>
        </div>
      </header>

      {/* Success Banner if contract deployed */}
      {deploymentSuccessMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{deploymentSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDeploymentSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:text-white uppercase font-bold tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Executive Key Indicators */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Committed Institutional Principal</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${(totalCapitalCommittedUSD / 1000000).toFixed(2)}M
            <span className="text-xs text-slate-400 font-normal ml-1">USD Equiv.</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Modern Treasury Ledger Validated</span>
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Weighted Enhanced APY</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {aggregateApy}%
            <span className="text-xs text-slate-400 font-normal ml-1">Fixed Premium</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+10.35% Spread vs SOFR / EURIBOR</span>
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Active DCD Portfolios</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {contracts.length} <span className="text-sm font-normal text-slate-400">Contracts</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Citibank Triple-A Ring-Fenced</span>
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Maturity Ledger Disbursed</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">
            ${(disbursements.reduce((a, d) => a + d.grossAmount, 0) / 1000000).toFixed(2)}M
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Fedwire / CHIPS / SWIFT gpi</span>
          </div>
        </div>
      </section>

      {/* AI Terminal Output Log (Collapsible or Live Triggered) */}
      {aiOptimizationLogs.length > 0 && (
        <section className="mb-8 rounded-xl bg-black/90 border border-amber-500/30 p-4 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Terminal className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">Citi-Quantum FX &amp; Modern Treasury AI Telemetry</span>
            </div>
            <span className="text-[10px] text-slate-500">REALTIME EXECUTION CHANNEL</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {aiOptimizationLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-amber-500/60 font-bold">&gt;</span>
                <span className={idx === aiOptimizationLogs.length - 1 ? 'text-amber-200 font-semibold' : 'text-slate-400'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('CONTRACTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            activeTab === 'CONTRACTS'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active DCD Contracts ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab('AI_STRIKE_ENGINE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            activeTab === 'AI_STRIKE_ENGINE'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Strike Fixing &amp; Quantum Risk
        </button>

        <button
          onClick={() => setActiveTab('LEDGER_PIPELINE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            activeTab === 'LEDGER_PIPELINE'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Modern Treasury Ledger Settlement Hub
        </button>

        <button
          onClick={() => setActiveTab('NEW_DCD_ORCHESTRATOR')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            activeTab === 'NEW_DCD_ORCHESTRATOR'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          + Deploy Structured Deposit
        </button>
      </div>

      {/* TAB 1: CONTRACTS OVERVIEW & DETAIL SPLIT */}
      {activeTab === 'CONTRACTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Contracts List */}
          <div className="lg:col-span-5 space-y-3">
            {contracts.map(contract => {
              const isSelected = contract.id === selectedContractId;
              return (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContractId(contract.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-900 to-slate-800/90 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {contract.baseCurrency} / {contract.alternateCurrency}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{contract.contractRef}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      contract.status === 'ACTIVE_LOCKED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : contract.status === 'FIXING_PENDING'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        : contract.status === 'RENEWAL_QUEUED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                    }`}>
                      {contract.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-black text-white">
                        {contract.baseCurrency} {contract.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-400">
                        Tenor: <span className="text-slate-200 font-semibold">{contract.tenorDays} Days</span> &bull; Strike: <span className="text-amber-300 font-mono">{contract.strikeRate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-400">
                        {contract.enhancedApy.toFixed(2)}% APY
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Fixing: {contract.fixingDate}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Contract Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {activeContract.contractRef}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      ID: {activeContract.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Booking Desk: <span className="text-slate-300">{activeContract.citibankBookingUnit}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInstantDisbursementTrigger(activeContract)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simulate Maturity Sweep
                  </button>
                </div>
              </div>

              {/* Deposit Parameter Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Currency Pair
                  </span>
                  <span className="text-base font-bold text-amber-300 font-mono">
                    {activeContract.baseCurrency} &rarr; {activeContract.alternateCurrency}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Contract Strike
                  </span>
                  <span className="text-base font-bold text-white font-mono">
                    {activeContract.strikeRate.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Spot: {activeContract.currentSpotRate.toFixed(4)}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Enhanced APY
                  </span>
                  <span className="text-base font-bold text-emerald-400">
                    {activeContract.enhancedApy.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-amber-400/80 block">+{activeContract.premiumYieldSpread}% Premium Spread</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Fixing Date &amp; Time
                  </span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {activeContract.fixingDate} 14:00 TOK/NYC
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Disbursement Date
                  </span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {activeContract.maturityDate} (T+2 Fix)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Conversion Risk (AI)
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-amber-400 h-2 rounded-full"
                        style={{ width: `${activeContract.aiConversionProbability}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-cyan-300 font-mono">
                      {activeContract.aiConversionProbability}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern Treasury Ledger Binding Info */}
              <div className="rounded-xl bg-slate-950 border border-cyan-500/20 p-4 mb-6">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-wider uppercase">Modern Treasury Orchestration Binding</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LEDGER_VALIDATED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">MT Internal Ledger Reference:</span>
                    <span className="font-mono text-amber-200 select-all">{activeContract.modernTreasuryLedgerId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Base Disposal Account ({activeContract.baseCurrency}):</span>
                    <span className="font-mono text-slate-200 select-all">{activeContract.baseDisposalAccountId}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Alternate Currency Disposal Account ({activeContract.alternateCurrency}):</span>
                    <span className="font-mono text-cyan-200 select-all">{activeContract.alternateDisposalAccountId}</span>
                  </div>
                </div>
              </div>

              {/* Rollover & Maturity Renewal Instructions Hub */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
                      Maturity Standing Instructions (Citibank Auto-Renew)
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Programmable Rules
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: 'AUTO_ROLLOVER_ALL',
                      label: 'Auto Rollover Full Maturity (Principal + Premium)',
                      desc: 'Automatically rolls entire balance into new DCD with strike parity optimized by Citibank AI.'
                    },
                    {
                      id: 'PRINCIPAL_ROLLOVER_INTEREST_SWEEP',
                      label: 'Roll Principal Only & Sweep Premium to MT Ledger',
                      desc: 'Principal restarts for next tenor; enhanced yield is disbursed immediately to primary treasury account.'
                    },
                    {
                      id: 'FULL_DISBURSEMENT_TO_LEDGER',
                      label: 'Full Disbursement & Zero Rollover',
                      desc: 'Full maturity proceeds (in fixing currency) converted and deposited to client nominated ledger.'
                    }
                  ].map(option => (
                    <label
                      key={option.id}
                      onClick={() => handleUpdateRenewalInstruction(activeContract.id, option.id as DualCurrencyDepositContract['renewalInstruction'])}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        activeContract.renewalInstruction === option.id
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-950'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`renewal-${activeContract.id}`}
                        checked={activeContract.renewalInstruction === option.id}
                        onChange={() => {}}
                        className="mt-1 text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{option.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI STRIKE FIXING & QUANTUM RISK SIMULATOR */}
      {activeTab === 'AI_STRIKE_ENGINE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-amber-500/30 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">
                    Citibank AI Quantum Fixing &amp; Strike Probability Engine
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                  Model: Citi-Optima-v9.4
                </span>
              </div>

              <div className="my-6">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dual-Currency Deposits are yield-enhancement structured instruments. The principal is repaid in the base currency if the exchange rate does not breach the strike rate on fixing date; otherwise, funds convert into the alternate currency at the contract strike rate, earning high annualized premium.
                </p>
              </div>

              {/* Visual Probability Distribution Gauge */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 mb-6">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-slate-400">Repayment in Base ({activeContract.baseCurrency})</span>
                  <span className="font-semibold text-amber-400">Repayment in Alternate ({activeContract.alternateCurrency})</span>
                </div>

                <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
                  <div
                    style={{ width: `${100 - activeContract.aiConversionProbability}%` }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full flex items-center justify-center text-[10px] font-black text-black"
                  >
                    {(100 - activeContract.aiConversionProbability).toFixed(1)}%
                  </div>
                  <div
                    style={{ width: `${activeContract.aiConversionProbability}%` }}
                    className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-r-full flex items-center justify-center text-[10px] font-black text-white"
                  >
                    {activeContract.aiConversionProbability.toFixed(1)}%
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                    <span className="font-bold text-emerald-400 block mb-1">Scenario A: Spot &le; Strike</span>
                    <p className="text-slate-400 text-[11px]">
                      Principal repaid in <strong className="text-emerald-300">{activeContract.baseCurrency}</strong> + {activeContract.enhancedApy}% p.a. yield disbursed directly to Modern Treasury base disposal ledger.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
                    <span className="font-bold text-amber-400 block mb-1">Scenario B: Spot &gt; Strike</span>
                    <p className="text-slate-400 text-[11px]">
                      Principal converted into <strong className="text-amber-300">{activeContract.alternateCurrency}</strong> at strike {activeContract.strikeRate} + {activeContract.enhancedApy}% p.a. yield into MT alternate ledger.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Last recalibrated: <strong className="text-slate-200">Just now</strong> via Modern Treasury real-time sync.
                </span>
                <button
                  onClick={handleTriggerAiOptimization}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                >
                  Recalculate Yield Curves
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800 text-amber-400">
                <BarChart3 className="w-4 h-4" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Live Volatility &amp; Strike Matrix</h4>
              </div>

              <div className="space-y-3">
                {[
                  { delta: '1.0% OTM (Aggressive)', strike: 1.0920, apy: 19.8, prob: '78.5%' },
                  { delta: '1.5% OTM (Recommended)', strike: 1.0975, apy: 14.85, prob: '28.4%' },
                  { delta: '2.5% OTM (Conservative)', strike: 1.1080, apy: 9.4, prob: '11.2%' },
                  { delta: '4.0% OTM (Ultra Safe)', strike: 1.1245, apy: 6.2, prob: '3.1%' }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.delta}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Strike: {item.strike} &bull; Conv: {item.prob}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-400">{item.apy}% APY</div>
                      <span className="text-[10px] text-amber-400 font-mono">Optimized</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODERN TREASURY LEDGER DISBURSEMENT PIPELINE */}
      {activeTab === 'LEDGER_PIPELINE' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Modern Treasury Ledger &amp; Disbursement Stream</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time ledger journal entries for matured deposits, alternate currency conversions, and automated rollover sweeps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                HIGH-VALUE PAYMENT PIPELINE ACTIVE
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Disbursement ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Deposit Ref</th>
                  <th className="p-3.5">Disposal Account / Route</th>
                  <th className="p-3.5">Rail Type</th>
                  <th className="p-3.5 text-right">Settlement Amount</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {disbursements.map(disb => (
                  <tr key={disb.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-amber-300">{disb.id}</td>
                    <td className="p-3.5 text-slate-400">{disb.timestamp}</td>
                    <td className="p-3.5 text-cyan-300 font-bold">{disb.depositRef}</td>
                    <td className="p-3.5">
                      <div className="text-slate-200 text-[11px]">{disb.sourceInternalAccountId}</div>
                      <div className="text-slate-500 text-[10px]">&rarr; {disb.destinationAccountId}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {disb.paymentOrderType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-emerald-400 font-black text-sm">
                      {disb.currency} {disb.netSettlementAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        {disb.reconciliationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NEW DUAL-CURRENCY CONTRACT ORCHESTRATOR */}
      {activeTab === 'NEW_DCD_ORCHESTRATOR' && (
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Deploy Institutional Dual-Currency Premium Deposit
              </h2>
              <p className="text-xs text-slate-400">
                Direct integration with Citibank FX Desk &amp; Modern Treasury Programmatic Ledger Locks
              </p>
            </div>
          </div>

          <form onSubmit={handleDeployNewDCD} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Base Deposit Currency (You Deliver)
                </label>
                <select
                  value={newBaseCcy}
                  onChange={e => setNewBaseCcy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="USD">USD - United States Dollar (Citibank NY)</option>
                  <option value="EUR">EUR - Euro (Citibank London/Frankfurt)</option>
                  <option value="GBP">GBP - British Pound (Citibank UK)</option>
                  <option value="SGD">SGD - Singapore Dollar (Citibank SG)</option>
                  <option value="CHF">CHF - Swiss Franc (Citibank Zurich)</option>
                  <option value="JPY">JPY - Japanese Yen (Citibank Tokyo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Alternate Strike Currency (Potential Disposal)
                </label>
                <select
                  value={newAltCcy}
                  onChange={e => setNewAltCcy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - United States Dollar</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Principal Amount ({newBaseCcy})
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    min="1000000"
                    step="500000"
                    value={newPrincipal}
                    onChange={e => setNewPrincipal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-3 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Minimum institutional tranche: 1,000,000</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Deposit Tenor (Days)
                </label>
                <select
                  value={newTenor}
                  onChange={e => setNewTenor(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value={7}>7 Days (Ultra Fast Liquidity)</option>
                  <option value={14}>14 Days (Prime Spread)</option>
                  <option value={30}>30 Days (Standard Horizon)</option>
                  <option value={60}>60 Days (Yield Maximizer)</option>
                  <option value={90}>90 Days (Quarterly Structured)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Strike Barrier Delta (% Out of the Money)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={newStrikeDelta}
                  onChange={e => setNewStrikeDelta(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-sm font-mono font-black text-amber-300 w-16 text-right">
                  +{newStrikeDelta.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Higher Conversion Risk / Highest APY (+0.5%)</span>
                <span>Lower Conversion Risk / Lower APY (+5.0%)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Maturity Ledger Instruction Policy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'AUTO_ROLLOVER_ALL', title: 'Full Rollover', desc: 'Auto re-lock next tenor' },
                  { id: 'PRINCIPAL_ROLLOVER_INTEREST_SWEEP', title: 'Roll Principal + Sweep', desc: 'Yield swept to MT Ledger' },
                  { id: 'FULL_DISBURSEMENT_TO_LEDGER', title: 'Cash Out at Maturity', desc: 'Settle to primary account' }
                ].map(r => (
                  <div
                    key={r.id}
                    onClick={() => setNewRolloverRule(r.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      newRolloverRule === r.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{r.title}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Quote Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Estimated Yield Enhancement</span>
                <div className="text-2xl font-black text-emerald-400">
                  {(4.5 + newStrikeDelta * 4.2 + (newTenor === 14 ? 3.5 : 2.0)).toFixed(2)}% APY
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Modern Treasury Auto-Hold</span>
                <div className="text-sm font-mono text-amber-300 font-bold">
                  {newBaseCcy} {newPrincipal.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDeployingContract}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isDeployingContract ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Locking Deposit &amp; Minting Ledger Accounts...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Execute &amp; Lock Dual-Currency Contract
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Institutional Security Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-800 text-slate-500 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>
            Citibank N.A. Member FDIC &bull; Modern Treasury Certified Financial Ledger Core &bull; ISO 20022 Compliant
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-600">
          GATEWAY SEC_HASH: 0x9f8812cba001b942e5
        </div>
      </footer>
    </div>
  );
};

export default ModernTreasuryDepositContractGateway;