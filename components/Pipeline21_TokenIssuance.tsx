

// --- CONSOLIDATED FROM: ./pipelines/Pipeline21_TokenIssuance.tsx ---

import React, { useState, useMemo } from 'react';
import {
  Coins,
  ShieldCheck,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Users,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe,
  Settings,
  Plus,
  Trash2,
  Key,
  Database,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

// --- Type Definitions ---

export type TokenStandard = 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'ERC-3643 (RWA / T-Rex)' | 'ERC-1400 (Security)';
export type TargetNetwork = 'Ethereum Mainnet' | 'Arbitrum One' | 'Polygon PoS' | 'Base' | 'Avalanche C-Chain';

export interface AllocationBracket {
  id: string;
  category: string;
  recipientAddress: string;
  percentage: number;
  tokensAmount: number;
  cliffMonths: number;
  vestingMonths: number;
  tgeUnlockPercent: number;
}

export interface ComplianceRule {
  id: string;
  label: string;
  standard: 'MiCA' | 'SEC Reg D' | 'SEC Reg S' | 'FATF Travel Rule' | 'KYC/AML Level 3';
  status: 'passed' | 'warning' | 'required';
  description: string;
}

export interface MultiSigSigner {
  id: string;
  name: string;
  address: string;
  role: string;
  hasSigned: boolean;
  signedAt?: string;
}

export interface TokenIssuanceState {
  // 1. Basic Specifications
  tokenName: string;
  tokenSymbol: string;
  tokenStandard: TokenStandard;
  decimals: number;
  totalSupply: number;
  isSupplyCapped: boolean;
  initialSupply: number;
  targetNetwork: TargetNetwork;
  
  // 2. Operational Features
  isBurnable: boolean;
  isMintable: boolean;
  isPausable: boolean;
  hasBlacklist: boolean;
  transferFeeBps: number;
  feeCollector: string;

  // 3. Security & Governance
  proxyContract: boolean;
  multisigThreshold: number;
  multisigTotalSigners: number;
  signers: MultiSigSigner[];

  // 4. Cap Table & Allocation
  allocations: AllocationBracket[];

  // 5. Compliance Framework
  complianceRules: ComplianceRule[];
  jurisdictionExclusions: string[];
  investorWhitelistCount: number;

  // Pipeline Status
  stage: 'CONFIG' | 'COMPLIANCE' | 'ALLOCATION' | 'SIGNING' | 'DEPLOYING' | 'ISSUED';
  deployedContractAddress?: string;
  txHash?: string;
  deploymentGasEstimate: number;
}

export default function Pipeline21_TokenIssuance() {
  // State Initialization
  const [pipelineState, setPipelineState] = useState<TokenIssuanceState>({
    tokenName: 'Aetheria Yield & Growth Token',
    tokenSymbol: 'AYGT',
    tokenStandard: 'ERC-3643 (RWA / T-Rex)',
    decimals: 18,
    totalSupply: 50000000,
    isSupplyCapped: true,
    initialSupply: 10000000,
    targetNetwork: 'Arbitrum One',
    isBurnable: true,
    isMintable: true,
    isPausable: true,
    hasBlacklist: true,
    transferFeeBps: 25, // 0.25%
    feeCollector: '0x71C...4e91',
    proxyContract: true,
    multisigThreshold: 3,
    multisigTotalSigners: 4,
    signers: [
      { id: '1', name: 'Treasury Guardian (FinOps)', address: '0x84fA...31c2', role: 'Issuer Admin', hasSigned: true, signedAt: '2025-02-24 14:32:01' },
      { id: '2', name: 'Compliance Officer Lead', address: '0x992B...89b1', role: 'Compliance Officer', hasSigned: true, signedAt: '2025-02-24 15:10:44' },
      { id: '3', name: 'Smart Contract Auditor #1', address: '0x35cA...E17a', role: 'Security Signer', hasSigned: false },
      { id: '4', name: 'Executive Multi-sig Key', address: '0x1F7e...980D', role: 'Board Delegate', hasSigned: false },
    ],
    allocations: [
      { id: '1', category: 'Institutional Seed Pool', recipientAddress: '0xA109...3b92', percentage: 20, tokensAmount: 10000000, cliffMonths: 6, vestingMonths: 24, tgeUnlockPercent: 10 },
      { id: '2', category: 'Protocol Liquidity Reserve', recipientAddress: '0xB781...4419', percentage: 30, tokensAmount: 15000000, cliffMonths: 0, vestingMonths: 12, tgeUnlockPercent: 40 },
      { id: '3', category: 'Core Development & Ops', recipientAddress: '0xC492...82aa', percentage: 25, tokensAmount: 12500000, cliffMonths: 12, vestingMonths: 36, tgeUnlockPercent: 0 },
      { id: '4', category: 'RWA Backed Escrow Treasury', recipientAddress: '0xD83e...77c1', percentage: 25, tokensAmount: 12500000, cliffMonths: 3, vestingMonths: 18, tgeUnlockPercent: 15 },
    ],
    complianceRules: [
      { id: 'c1', label: 'MiCA Asset-Referenced Token Clearance', standard: 'MiCA', status: 'passed', description: 'Whitepaper legal opinion logged and issuer registered with regulatory authority.' },
      { id: 'c2', label: 'Accredited Investor Identity Onboarding', standard: 'KYC/AML Level 3', status: 'passed', description: 'Real-time ONFIDO / SumSub integration verifies Tier-3 ID & Liveness.' },
      { id: 'c3', label: 'SEC Regulation D Rule 506(c) Safe Harbor', standard: 'SEC Reg D', status: 'passed', description: 'Disclaimers and restricted transfer enforcement locks applied for 12 months.' },
      { id: 'c4', label: 'FATF On-Chain Travel Rule Protocol', standard: 'FATF Travel Rule', status: 'warning', description: 'VASP-to-VASP messaging handshake required for mints > $10,000 equivalent.' },
    ],
    jurisdictionExclusions: ['OFAC Sanctioned Jurisdictions', 'Non-Cooperative Tax Havens', 'Restricted Unregistered Retail'],
    investorWhitelistCount: 1420,
    stage: 'CONFIG',
    deploymentGasEstimate: 0.0384,
  });

  const [activeTab, setActiveTab] = useState<'wizard' | 'captable' | 'compliance' | 'deploy-log'>('wizard');
  const [isSimulatingDeploy, setIsSimulatingDeploy] = useState(false);
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [deployStepLog, setDeployStepLog] = useState<string[]>([]);

  // Cap table total allocation calculation
  const totalAllocatedPercentage = useMemo(() => {
    return pipelineState.allocations.reduce((acc, item) => acc + item.percentage, 0);
  }, [pipelineState.allocations]);

  const totalAllocatedTokens = useMemo(() => {
    return (pipelineState.totalSupply * totalAllocatedPercentage) / 100;
  }, [pipelineState.totalSupply, totalAllocatedPercentage]);

  // Signer Actions
  const handleToggleSign = (id: string) => {
    setPipelineState((prev) => ({
      ...prev,
      signers: prev.signers.map((s) =>
        s.id === id
          ? {
              ...s,
              hasSigned: !s.hasSigned,
              signedAt: !s.hasSigned ? new Date().toISOString().replace('T', ' ').substring(0, 19) : undefined,
            }
          : s
      ),
    }));
  };

  const currentSignaturesCount = pipelineState.signers.filter((s) => s.hasSigned).length;
  const isQuorumReached = currentSignaturesCount >= pipelineState.multisigThreshold;

  // Add allocation row
  const handleAddAllocation = () => {
    const remaining = Math.max(0, 100 - totalAllocatedPercentage);
    const newAlloc: AllocationBracket = {
      id: Math.random().toString(36).substring(2, 9),
      category: 'New Strategic Stakeholder',
      recipientAddress: '0x0000...0000',
      percentage: remaining > 0 ? remaining : 5,
      tokensAmount: (pipelineState.totalSupply * (remaining > 0 ? remaining : 5)) / 100,
      cliffMonths: 6,
      vestingMonths: 24,
      tgeUnlockPercent: 10,
    };
    setPipelineState((prev) => ({
      ...prev,
      allocations: [...prev.allocations, newAlloc],
    }));
  };

  const handleRemoveAllocation = (id: string) => {
    setPipelineState((prev) => ({
      ...prev,
      allocations: prev.allocations.filter((a) => a.id !== id),
    }));
  };

  // Execution Simulator
  const executeDeploymentPipeline = () => {
    if (!isQuorumReached) return;
    setIsSimulatingDeploy(true);
    setDeployProgress(10);
    setDeployStepLog(['[1/6] Compiling audited smart contracts & verifying bytecode...']);

    setTimeout(() => {
      setDeployProgress(30);
      setDeployStepLog((prev) => [...prev, '[2/6] Verifying Multi-Sig ECDSA cryptographic signatures & quorum...']);
    }, 1200);

    setTimeout(() => {
      setDeployProgress(55);
      setDeployStepLog((prev) => [...prev, `[3/6] Deploying ERC-1967 Upgradeable Proxy to ${pipelineState.targetNetwork}...`]);
    }, 2500);

    setTimeout(() => {
      setDeployProgress(75);
      setDeployStepLog((prev) => [...prev, '[4/6] Initializing Compliance On-Chain Identity Registry & Claim Topics...']);
    }, 3800);

    setTimeout(() => {
      setDeployProgress(90);
      setDeployStepLog((prev) => [...prev, `[5/6] Executing initial TGE minting batch (${pipelineState.initialSupply.toLocaleString()} ${pipelineState.tokenSymbol})...`]);
    }, 5000);

    setTimeout(() => {
      setDeployProgress(100);
      setIsSimulatingDeploy(false);
      setPipelineState((prev) => ({
        ...prev,
        stage: 'ISSUED',
        deployedContractAddress: '0x3d7b42A90F4DeEc59196b0f9B5e94b29C4b1262F',
        txHash: '0x8e58bb0f1c97a213e4b787595bc6810a905ecf9bc3e28ffea45d8b8a5b281f62',
      }));
      setDeployStepLog((prev) => [...prev, '✓ Token Issuance Complete: All assets, rules, and cap tables successfully minted & indexed.']);
      setActiveTab('deploy-log');
    }, 6400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pipeline #21
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {pipelineState.targetNetwork}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {pipelineState.tokenStandard}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Coins className="w-8 h-8 text-emerald-400" />
              Digital Asset Token Issuance Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Institutional-grade token architecting, compliance validation, multi-sig authorization & automated deployment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setPipelineState((prev) => ({ ...prev, stage: 'CONFIG', txHash: undefined, deployedContractAddress: undefined }));
                setDeployProgress(0);
                setDeployStepLog([]);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reset Blueprint
            </button>
            <button
              onClick={executeDeploymentPipeline}
              disabled={!isQuorumReached || isSimulatingDeploy || pipelineState.stage === 'ISSUED'}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition ${
                pipelineState.stage === 'ISSUED'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : isQuorumReached && !isSimulatingDeploy
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isSimulatingDeploy ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Deploying On-Chain...
                </>
              ) : pipelineState.stage === 'ISSUED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Issuance Finalized
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Broadcast & Mint Issuance
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metric KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Target Supply <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {pipelineState.totalSupply.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{pipelineState.tokenSymbol}</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              Initial Release: {pipelineState.initialSupply.toLocaleString()} ({((pipelineState.initialSupply / pipelineState.totalSupply) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Multi-Sig Quorum <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {currentSignaturesCount} / {pipelineState.multisigThreshold}{' '}
              <span className="text-xs text-slate-400 font-normal">({pipelineState.multisigTotalSigners} total)</span>
            </div>
            <div className={`text-xs mt-1 font-semibold ${isQuorumReached ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isQuorumReached ? '✓ Quorum Reached for Execution' : '⚠ Action required by signers'}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Cap Table Sync <Sliders className="w-4 h-4 text-blue-400" />
            </div>
            <div className={`text-2xl font-bold mt-1 ${totalAllocatedPercentage === 100 ? 'text-white' : 'text-amber-400'}`}>
              {totalAllocatedPercentage}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {totalAllocatedTokens.toLocaleString()} / {pipelineState.totalSupply.toLocaleString()} units
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Regulatory Posture <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">Verified (100%)</div>
            <div className="text-xs text-slate-400 mt-1">
              {pipelineState.investorWhitelistCount} Whitelisted KYC Inbound
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-8 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'wizard'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> 1. Token Parameters & Governance
          </button>
          <button
            onClick={() => setActiveTab('captable')}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'captable'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Cap Table & Vesting Schedule
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'compliance'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" /> 3. Institutional Compliance Framework
          </button>
          <button
            onClick={() => setActiveTab('deploy-log')}
            className={`pb-3 flex items-center gap-2 transition border-b-2 ${
              activeTab === 'deploy-log'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> 4. Deployment Pipeline & Explorer
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* TAB 1: Token Parameters & Governance */}
        {activeTab === 'wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Core Token Meta */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-400" /> Token Metadata & Specification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Token Name</label>
                    <input
                      type="text"
                      value={pipelineState.tokenName}
                      onChange={(e) => setPipelineState({ ...pipelineState, tokenName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Symbol / Ticker</label>
                    <input
                      type="text"
                      value={pipelineState.tokenSymbol}
                      onChange={(e) => setPipelineState({ ...pipelineState, tokenSymbol: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Token Standard</label>
                    <select
                      value={pipelineState.tokenStandard}
                      onChange={(e) => setPipelineState({ ...pipelineState, tokenStandard: e.target.value as TokenStandard })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ERC-20">ERC-20 (Standard Fungible)</option>
                      <option value="ERC-3643 (RWA / T-Rex)">ERC-3643 (RWA / T-Rex Compliant)</option>
                      <option value="ERC-1400 (Security)">ERC-1400 (Polymath Security Token)</option>
                      <option value="ERC-1155">ERC-1155 (Multi-Token Standard)</option>
                      <option value="ERC-721">ERC-721 (Non-Fungible Unique)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Primary Target Network</label>
                    <select
                      value={pipelineState.targetNetwork}
                      onChange={(e) => setPipelineState({ ...pipelineState, targetNetwork: e.target.value as TargetNetwork })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Ethereum Mainnet">Ethereum Mainnet (L1)</option>
                      <option value="Arbitrum One">Arbitrum One (Rollup L2)</option>
                      <option value="Polygon PoS">Polygon PoS</option>
                      <option value="Base">Base (Coinbase L2)</option>
                      <option value="Avalanche C-Chain">Avalanche C-Chain (Subnet Ready)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Decimals Precision</label>
                    <input
                      type="number"
                      value={pipelineState.decimals}
                      onChange={(e) => setPipelineState({ ...pipelineState, decimals: parseInt(e.target.value) || 18 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Hardcap Total Supply</label>
                    <input
                      type="number"
                      value={pipelineState.totalSupply}
                      onChange={(e) => setPipelineState({ ...pipelineState, totalSupply: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Functional Smart Contract Extensions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" /> Operational Features & Smart Contract Hooks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <div className="text-sm font-medium text-white">Mintable Supply</div>
                      <div className="text-xs text-slate-400">Allow authorized minters to issue tokens up to cap</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pipelineState.isMintable}
                      onChange={(e) => setPipelineState({ ...pipelineState, isMintable: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <div className="text-sm font-medium text-white">Burnable</div>
                      <div className="text-xs text-slate-400">Holders or treasury can permanently burn supply</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pipelineState.isBurnable}
                      onChange={(e) => setPipelineState({ ...pipelineState, isBurnable: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <div className="text-sm font-medium text-white">Pausable Controller</div>
                      <div className="text-xs text-slate-400">Emergency pause in case of exploits or court orders</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pipelineState.isPausable}
                      onChange={(e) => setPipelineState({ ...pipelineState, isPausable: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <div>
                      <div className="text-sm font-medium text-white">ERC-1967 Upgradeability</div>
                      <div className="text-xs text-slate-400">UUPS Proxy implementation for patch upgrades</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pipelineState.proxyContract}
                      onChange={(e) => setPipelineState({ ...pipelineState, proxyContract: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Governance & Multi-Sig Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" /> Multi-Sig Authorization
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {currentSignaturesCount}/{pipelineState.multisigThreshold} Required
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Smart contract deployment requires an authenticated M-of-N cryptographic quorum signature from authorized officers.
                </p>

                <div className="space-y-3">
                  {pipelineState.signers.map((signer) => (
                    <div
                      key={signer.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {signer.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{signer.address}</div>
                        <div className="text-[10px] text-slate-500">{signer.role}</div>
                      </div>
                      <button
                        onClick={() => handleToggleSign(signer.id)}
                        className={`text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1 transition ${
                          signer.hasSigned
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {signer.hasSigned ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Signed
                          </>
                        ) : (
                          <>Sign Hash</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Quorum Completion</span>
                    <span className="font-mono">{Math.round((currentSignaturesCount / pipelineState.multisigThreshold) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isQuorumReached ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (currentSignaturesCount / pipelineState.multisigThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Deployment Gas Estimation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                  <span>Gas & Deployment Estimation</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  ≈ {pipelineState.deploymentGasEstimate} ETH
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Estimated L2 Rollup Execution: <span className="text-emerald-400">$124.50 USD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Cap Table & Vesting Schedule */}
        {activeTab === 'captable' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" /> Token Allocation & Vesting Cliffs
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-set initial token distributions, cliffs, continuous vesting schedules and recipient smart wallets.
                  </p>
                </div>
                <button
                  onClick={handleAddAllocation}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition self-start md:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add Bracket
                </button>
              </div>

              {/* Cap Allocation Visualizer Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Allocated: {totalAllocatedPercentage}% ({totalAllocatedTokens.toLocaleString()} tokens)</span>
                  <span>Unallocated: {Math.max(0, 100 - totalAllocatedPercentage)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800 p-0.5">
                  {pipelineState.allocations.map((alloc, idx) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
                    return (
                      <div
                        key={alloc.id}
                        style={{ width: `${alloc.percentage}%` }}
                        className={`${colors[idx % colors.length]} h-full transition-all duration-300 first:rounded-l last:rounded-r`}
                        title={`${alloc.category}: ${alloc.percentage}%`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Cap Table Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 px-3">Bracket Category</th>
                      <th className="pb-3 px-3">Destination Address</th>
                      <th className="pb-3 px-3">Share (%)</th>
                      <th className="pb-3 px-3">Token Amount</th>
                      <th className="pb-3 px-3">TGE Unlock</th>
                      <th className="pb-3 px-3">Cliff (Mo)</th>
                      <th className="pb-3 px-3">Vesting (Mo)</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {pipelineState.allocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 font-medium text-white">
                          <input
                            type="text"
                            value={alloc.category}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPipelineState((prev) => ({
                                ...prev,
                                allocations: prev.allocations.map((a) => (a.id === alloc.id ? { ...a, category: val } : a)),
                              }));
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs w-44"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          <input
                            type="text"
                            value={alloc.recipientAddress}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPipelineState((prev) => ({
                                ...prev,
                                allocations: prev.allocations.map((a) => (a.id === alloc.id ? { ...a, recipientAddress: val } : a)),
                              }));
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-xs w-32"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={alloc.percentage}
                            onChange={(e) => {
                              const p = parseFloat(e.target.value) || 0;
                              setPipelineState((prev) => ({
                                ...prev,
                                allocations: prev.allocations.map((a) =>
                                  a.id === alloc.id ? { ...a, percentage: p, tokensAmount: (prev.totalSupply * p) / 100 } : a
                                ),
                              }));
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs w-16"
                          />
                          %
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {alloc.tokensAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {alloc.tgeUnlockPercent}%
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {alloc.cliffMonths} mo
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {alloc.vestingMonths} mo
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRemoveAllocation(alloc.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Institutional Compliance Framework */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" /> Automated Compliance Verification
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                All digital asset issuances are checked against international securities and digital identity transfer restrictions prior to on-chain deployment.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pipelineState.complianceRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3"
                  >
                    {rule.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{rule.label}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {rule.standard}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Jurisdiction Sanctions Box */}
              <div className="mt-6 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Enforced Smart Contract Transfer Restrictions
                </div>
                <div className="flex flex-wrap gap-2">
                  {pipelineState.jurisdictionExclusions.map((item, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                      🚫 {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Deployment Pipeline & Explorer */}
        {activeTab === 'deploy-log' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" /> On-Chain Pipeline Activity & Contract Explorer
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Real-time terminal tracking compilation, signatures, contract initialization, and mint transactions.
              </p>

              {/* Live Terminal Log */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-400 min-h-[160px] space-y-2">
                {deployStepLog.length === 0 ? (
                  <div className="text-slate-600 italic">No issuance pipeline actions executed yet. Awaiting broadcast...</div>
                ) : (
                  deployStepLog.map((log, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>

              {/* If Deployed, Contract Summary */}
              {pipelineState.deployedContractAddress && (
                <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
                    <CheckCircle2 className="w-5 h-5" /> Token Contract Successfully Deployed & Initialized
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block mb-1">Contract Address (ERC-1967 Proxy):</span>
                      <span className="text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
                        {pipelineState.deployedContractAddress}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" />
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Initial Deployment Tx Hash:</span>
                      <span className="text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between truncate">
                        {pipelineState.txHash}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}