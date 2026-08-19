

// --- CONSOLIDATED FROM: ./pipelines/Pipeline28_WarAppropriations.tsx ---

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  FileText,
  AlertTriangle,
  Activity,
  Scale,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  BarChart3,
  Layers,
  RefreshCw,
  Landmark,
  Crosshair,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Sliders,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

// --- TYPES & INTERFACES ---

export type TheaterRegion = 'Eastern Europe / Ukraine' | 'Indo-Pacific / Taiwan' | 'Middle East / Levant' | 'Global Contingency';
export type AppropriationAuthority = 'PDA (Drawdown)' | 'USAI (Procurement)' | 'FMF (Financing)' | 'NDAA Title 10' | 'Emergency Supplemental';
export type AuditStatus = 'Compliant' | 'Flagged (Variance)' | 'Under IG Review' | 'Congressional Inquiry' | 'Fully Reconciled';

export interface AppropriationTranche {
  id: string;
  billReference: string;
  congressSession: string;
  theater: TheaterRegion;
  authority: AppropriationAuthority;
  authorizedAmount: number; // in Millions USD
  obligatedAmount: number;
  outlayAmount: number;
  enactmentDate: string;
  sunsetDate: string;
  currentStage: 'Authorization' | 'Warrant Issued' | 'Comptroller Apportionment' | 'Contract Award' | 'Delivery & Deployment' | 'IG Reconciliation';
  auditStatus: AuditStatus;
  riskScore: number; // 0-100
  discrepancyCount: number;
  primaryContractors: string[];
  description: string;
}

export interface ContractorObligation {
  id: string;
  trancheId: string;
  contractorName: string;
  cageCode: string;
  contractType: 'Cost-Plus-Fixed-Fee' | 'Firm-Fixed-Price' | 'Indefinite-Delivery-Quantity (IDIQ)' | 'Time-and-Materials';
  obligatedAmount: number;
  disbursedAmount: number;
  deliveryPerformance: number; // Percentage
  dcaaAuditPassed: boolean;
  activeAnomalies: string[];
}

export interface AuditDiscrepancy {
  id: string;
  trancheId: string;
  severity: 'Critical' | 'Major' | 'Minor';
  category: 'Price Gouging' | 'Inventory Mismatch' | 'Delayed Outlay' | 'Unauthorized Diversion' | 'Duplicate Invoicing';
  amountAtRisk: number;
  reportedBy: 'SIGAR' | 'DoD OIG' | 'GAO' | 'Automated AI Ledger';
  timestamp: string;
  status: 'Open Investigation' | 'Remediated' | 'Escalated to DOJ';
  details: string;
}

export interface DrawdownStockItem {
  id: string;
  trancheId: string;
  nationalStockNumber (NSN): string;
  designation: string;
  category: 'Air Defense' | 'Precision Munitions' | 'Armored Vehicles' | 'C4ISR Systems' | 'Small Arms & Ammunition';
  quantityAuthorized: number;
  quantityShipped: number;
  quantityVerifiedInTheater: number;
  unitReplacementCost: number;
  transitLossVariance: number;
}

// --- MOCK SEED DATA ---

const MOCK_TRANCHES: AppropriationTranche[] = [
  {
    id: 'TR-2024-8841',
    billReference: 'H.R. 815 - NatSec Supplemental',
    congressSession: '118th Congress',
    theater: 'Eastern Europe / Ukraine',
    authority: 'PDA (Drawdown)',
    authorizedAmount: 7800,
    obligatedAmount: 6420,
    outlayAmount: 5120,
    enactmentDate: '2024-04-24',
    sunsetDate: '2025-09-30',
    currentStage: 'Delivery & Deployment',
    auditStatus: 'Compliant',
    riskScore: 18,
    discrepancyCount: 1,
    primaryContractors: ['Lockheed Martin', 'General Dynamics', 'AeroVironment'],
    description: 'Rapid replenishment of critical munitions and tactical artillery drawdowns from US Army pre-positioned stocks.'
  },
  {
    id: 'TR-2024-9102',
    billReference: 'NDAA FY24 Sec. 1241',
    congressSession: '118th Congress',
    theater: 'Indo-Pacific / Taiwan',
    authority: 'FMF (Financing)',
    authorizedAmount: 2000,
    obligatedAmount: 1450,
    outlayAmount: 890,
    enactmentDate: '2023-12-22',
    sunsetDate: '2026-12-31',
    currentStage: 'Contract Award',
    auditStatus: 'Compliant',
    riskScore: 12,
    discrepancyCount: 0,
    primaryContractors: ['Raytheon (RTX)', 'Northrop Grumman'],
    description: 'Asymmetric coastal defense capabilities, anti-ship missile systems, and maritime domain radar enhancements.'
  },
  {
    id: 'TR-2023-4019',
    billReference: 'H.R. 5692 - DefContingency Act',
    congressSession: '118th Congress',
    theater: 'Middle East / Levant',
    authority: 'Emergency Supplemental',
    authorizedAmount: 4400,
    obligatedAmount: 4380,
    outlayAmount: 3950,
    enactmentDate: '2023-11-15',
    sunsetDate: '2025-06-30',
    currentStage: 'IG Reconciliation',
    auditStatus: 'Flagged (Variance)',
    riskScore: 68,
    discrepancyCount: 3,
    primaryContractors: ['Boeing Defense', 'BAE Systems Inc.', 'Elbit Systems America'],
    description: 'Air defense interceptors, Iron Dome radar node resupply, and counter-UAS electronic warfare suites.'
  },
  {
    id: 'TR-2024-3320',
    billReference: 'H.R. 815 - Division A (USAI)',
    congressSession: '118th Congress',
    theater: 'Eastern Europe / Ukraine',
    authority: 'USAI (Procurement)',
    authorizedAmount: 13800,
    obligatedAmount: 9200,
    outlayAmount: 4600,
    enactmentDate: '2024-04-24',
    sunsetDate: '2026-09-30',
    currentStage: 'Contract Award',
    auditStatus: 'Under IG Review',
    riskScore: 42,
    discrepancyCount: 2,
    primaryContractors: ['L3Harris Technologies', 'Lockheed Martin', 'Anduril Industries'],
    description: 'Long-lead new production contracts for 155mm advanced guidance shells, counter-electronic attack radios, and strike drones.'
  },
  {
    id: 'TR-2023-1198',
    billReference: 'NDAA FY23 Title 10 Direct',
    congressSession: '117th Congress',
    theater: 'Global Contingency',
    authority: 'NDAA Title 10',
    authorizedAmount: 3100,
    obligatedAmount: 3100,
    outlayAmount: 3080,
    enactmentDate: '2022-12-23',
    sunsetDate: '2024-12-31',
    currentStage: 'IG Reconciliation',
    auditStatus: 'Fully Reconciled',
    riskScore: 4,
    discrepancyCount: 0,
    primaryContractors: ['General Atomics', 'Textron Systems'],
    description: 'Global strategic airlift sustainment, special operations expeditionary logistics, and secure tactical SATCOM relays.'
  }
];

const MOCK_CONTRACTORS: ContractorObligation[] = [
  {
    id: 'CO-991',
    trancheId: 'TR-2024-8841',
    contractorName: 'Lockheed Martin Corp',
    cageCode: '1A980',
    contractType: 'Firm-Fixed-Price',
    obligatedAmount: 2450,
    disbursedAmount: 1980,
    deliveryPerformance: 96,
    dcaaAuditPassed: true,
    activeAnomalies: []
  },
  {
    id: 'CO-992',
    trancheId: 'TR-2024-8841',
    contractorName: 'General Dynamics Land Systems',
    cageCode: '7X331',
    contractType: 'Cost-Plus-Fixed-Fee',
    obligatedAmount: 1800,
    disbursedAmount: 1420,
    deliveryPerformance: 88,
    dcaaAuditPassed: true,
    activeAnomalies: ['Cost growth over-run alert: Material index +7.2%']
  },
  {
    id: 'CO-993',
    trancheId: 'TR-2024-3320',
    contractorName: 'L3Harris Technologies Inc',
    cageCode: '04231',
    contractType: 'Indefinite-Delivery-Quantity (IDIQ)',
    obligatedAmount: 3100,
    disbursedAmount: 1200,
    deliveryPerformance: 91,
    dcaaAuditPassed: true,
    activeAnomalies: []
  },
  {
    id: 'CO-994',
    trancheId: 'TR-2023-4019',
    contractorName: 'Boeing Defense & Space',
    cageCode: '43999',
    contractType: 'Cost-Plus-Fixed-Fee',
    obligatedAmount: 2100,
    disbursedAmount: 1950,
    deliveryPerformance: 74,
    dcaaAuditPassed: false,
    activeAnomalies: ['Supply-chain tier-3 uncertified sub-tier vendor detected']
  },
  {
    id: 'CO-995',
    trancheId: 'TR-2024-9102',
    contractorName: 'Raytheon Technologies (RTX)',
    cageCode: '00779',
    contractType: 'Firm-Fixed-Price',
    obligatedAmount: 1100,
    disbursedAmount: 650,
    deliveryPerformance: 98,
    dcaaAuditPassed: true,
    activeAnomalies: []
  }
];

const MOCK_DISCREPANCIES: AuditDiscrepancy[] = [
  {
    id: 'DISC-882',
    trancheId: 'TR-2023-4019',
    severity: 'Critical',
    category: 'Price Gouging',
    amountAtRisk: 42.6,
    reportedBy: 'DoD OIG',
    timestamp: '2024-05-18 14:22:01',
    status: 'Open Investigation',
    details: 'Subcontractor tier-2 titanium pricing exceeded FAR cap index by 314% without certified cost data exemption.'
  },
  {
    id: 'DISC-741',
    trancheId: 'TR-2024-3320',
    severity: 'Major',
    category: 'Delayed Outlay',
    amountAtRisk: 185.0,
    reportedBy: 'GAO',
    timestamp: '2024-04-30 09:15:30',
    status: 'Open Investigation',
    details: '90-day execution milestone breached on solid rocket motor tooling delivery timeline without penalty enforcement.'
  },
  {
    id: 'DISC-609',
    trancheId: 'TR-2024-8841',
    severity: 'Minor',
    category: 'Inventory Mismatch',
    amountAtRisk: 3.2,
    reportedBy: 'Automated AI Ledger',
    timestamp: '2024-06-02 11:40:12',
    status: 'Remediated',
    details: 'Serial number barcode collision during European transfer hub scanning. Physical recount reconciled.'
  },
  {
    id: 'DISC-412',
    trancheId: 'TR-2023-4019',
    severity: 'Critical',
    category: 'Duplicate Invoicing',
    amountAtRisk: 14.8,
    reportedBy: 'SIGAR',
    timestamp: '2024-03-12 18:04:55',
    status: 'Escalated to DOJ',
    details: 'Dual vouchers submitted across concurrent Task Orders for identical telemetry test flight instrumentation arrays.'
  }
];

const MOCK_DRAWDOWN_ITEMS: DrawdownStockItem[] = [
  {
    id: 'DD-001',
    trancheId: 'TR-2024-8841',
    'nationalStockNumber (NSN)': '1410-01-523-9921',
    designation: 'MIM-104 Patriot PAC-3 MSE Interceptor',
    category: 'Air Defense',
    quantityAuthorized: 180,
    quantityShipped: 180,
    quantityVerifiedInTheater: 178,
    unitReplacementCost: 4.1, // Millions
    transitLossVariance: 0.011
  },
  {
    id: 'DD-002',
    trancheId: 'TR-2024-8841',
    'nationalStockNumber (NSN)': '1330-01-387-1390',
    designation: '155mm M982 Excalibur Precision Munition',
    category: 'Precision Munitions',
    quantityAuthorized: 4500,
    quantityShipped: 4500,
    quantityVerifiedInTheater: 4500,
    unitReplacementCost: 0.112,
    transitLossVariance: 0.000
  },
  {
    id: 'DD-003',
    trancheId: 'TR-2024-8841',
    'nationalStockNumber (NSN)': '2350-01-087-1095',
    designation: 'M2A3 Bradley Infantry Fighting Vehicle',
    category: 'Armored Vehicles',
    quantityAuthorized: 120,
    quantityShipped: 120,
    quantityVerifiedInTheater: 120,
    unitReplacementCost: 3.4,
    transitLossVariance: 0.000
  },
  {
    id: 'DD-004',
    trancheId: 'TR-2024-9102',
    'nationalStockNumber (NSN)': '1427-01-689-1120',
    designation: 'RGM-84 Harpoon Block II Coastal Defense System',
    category: 'Precision Munitions',
    quantityAuthorized: 40,
    quantityShipped: 24,
    quantityVerifiedInTheater: 24,
    unitReplacementCost: 1.85,
    transitLossVariance: 0.000
  }
];

export default function Pipeline28_WarAppropriations() {
  // State management
  const [activeTab, setActiveTab] = useState<'pipeline' | 'tranches' | 'contractors' | 'audits' | 'drawdowns'>('pipeline');
  const [selectedTheater, setSelectedTheater] = useState<string>('ALL');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTranche, setSelectedTranche] = useState<AppropriationTranche | null>(MOCK_TRANCHES[0]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [auditFilterSeverity, setAuditFilterSeverity] = useState<string>('ALL');
  const [isAuditingActive, setIsAuditingActive] = useState<boolean>(false);
  const [liveLog, setLiveLog] = useState<string[]>([
    'Ledger synched with DoD Comptroller Central DB.',
    'Automated FAR compliance scanner active.',
    'Blockchain cryptographic hash verified on PDA Batch #815A.'
  ]);

  // Handle live automated audit trigger
  const runLiveAuditScan = () => {
    setIsAuditingActive(true);
    setTimeout(() => {
      setLiveLog((prev) => [
        `[${new Date().toLocaleTimeString()}] AI Ledger verified 14,812 transaction vouchers against DFAS clearance. 0 novel variances.`,
        ...prev
      ]);
      setIsAuditingActive(false);
    }, 1200);
  };

  // Filtered tranches
  const filteredTranches = useMemo(() => {
    return MOCK_TRANCHES.filter((t) => {
      const matchTheater = selectedTheater === 'ALL' || t.theater === selectedTheater;
      const matchAuth = selectedAuthority === 'ALL' || t.authority === selectedAuthority;
      const matchQuery =
        t.billReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTheater && matchAuth && matchQuery;
    });
  }, [selectedTheater, selectedAuthority, searchQuery]);

  // Aggregated KPIs
  const totalAuthorized = useMemo(() => MOCK_TRANCHES.reduce((acc, curr) => acc + curr.authorizedAmount, 0), []);
  const totalObligated = useMemo(() => MOCK_TRANCHES.reduce((acc, curr) => acc + curr.obligatedAmount, 0), []);
  const totalOutlay = useMemo(() => MOCK_TRANCHES.reduce((acc, curr) => acc + curr.outlayAmount, 0), []);
  const totalAtRisk = useMemo(() => MOCK_DISCREPANCIES.reduce((acc, curr) => acc + curr.amountAtRisk, 0), []);
  const avgIntegrityScore = useMemo(() => {
    const total = MOCK_TRANCHES.reduce((acc, curr) => acc + (100 - curr.riskScore), 0);
    return Math.round(total / MOCK_TRANCHES.length);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header & Context Banner */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">War Appropriations & Audit Pipeline</h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono font-medium">
                  LIVE COMPTROLLER FEED
                </span>
                <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/30 font-mono">
                  SIGAR / DoD-OIG SYNCED
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Real-time statutory tracking, multi-tranche execution, obligation velocity & anti-fraud verification pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={runLiveAuditScan}
            disabled={isAuditingActive}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditingActive ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            {isAuditingActive ? 'Running Heuristics...' : 'Trigger Integrity Audit'}
          </button>

          <button
            onClick={() => alert('Exporting FY24 Comprehensive War Appropriations Dossier (.CSV/PDF)...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Authorized</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${(totalAuthorized / 1000).toFixed(2)}B
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> 5 Active Supplemental Acts
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Obligated & Awarded</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            ${(totalObligated / 1000).toFixed(2)}B
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {((totalObligated / totalAuthorized) * 100).toFixed(1)}% of total authorization
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${(totalObligated / totalAuthorized) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Liquidated Outlays</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">
            ${(totalOutlay / 1000).toFixed(2)}B
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {((totalOutlay / totalObligated) * 100).toFixed(1)}% disbursement velocity
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${(totalOutlay / totalObligated) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-400">Audit Discrepancies</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            ${totalAtRisk.toFixed(1)}M
          </div>
          <p className="text-xs text-amber-500/80 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" /> {MOCK_DISCREPANCIES.length} flagged line items
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">System Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {avgIntegrityScore}%
          </div>
          <p className="text-xs text-slate-500 mt-1">DCAA / GAO Confidence Score</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${avgIntegrityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Pipeline Stages Lifecycle
        </button>
        <button
          onClick={() => setActiveTab('tranches')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'tranches'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Appropriation Tranches ({filteredTranches.length})
        </button>
        <button
          onClick={() => setActiveTab('contractors')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'contractors'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Building className="w-4 h-4" />
          Defense Contractors & FAR Audits
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'audits'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Scale className="w-4 h-4" />
          Inspector General (IG) Findings ({MOCK_DISCREPANCIES.length})
        </button>
        <button
          onClick={() => setActiveTab('drawdowns')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === 'drawdowns'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          PDA Inventory & Stock Verification
        </button>
      </div>

      {/* TAB 1: PIPELINE STAGES LIFECYCLE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Stage Flow Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Statutory 6-Stage Appropriation Pipeline Flow
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Track the movement of congressionally enacted war supplemental funds from statutory warrant to field deployment and final IG audit resolution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
              {[
                { stage: '1. Authorization', code: 'CONG-AUTH', desc: 'Congressional Budget Act & NDAA Cap', count: '5 Enactments', color: 'border-emerald-500 text-emerald-400' },
                { stage: '2. Warrant Issued', code: 'TREAS-WARR', desc: 'US Treasury Account Setup', count: '$31.1B Open', color: 'border-emerald-500 text-emerald-400' },
                { stage: '3. Comptroller Apport.', code: 'DOD-APPORT', desc: 'OSD Comptroller Sub-allotment', count: '100% Cleared', color: 'border-blue-500 text-blue-400' },
                { stage: '4. Contract Award', code: 'DEF-OBLIG', desc: 'FAR/DFARS Procurement & FMS', count: '$24.5B Awarded', color: 'border-amber-500 text-amber-400' },
                { stage: '5. Delivery & Deploy', code: 'MIL-LOGIST', desc: 'EUCOM / INDOPACOM Receipt', count: '$17.6B In-Theater', color: 'border-purple-500 text-purple-400' },
                { stage: '6. IG Reconciliation', code: 'IG-AUDIT', desc: 'SIGAR / GAO Final Audit Ledger', count: '4 Active Audits', color: 'border-rose-500 text-rose-400' }
              ].map((step, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between relative hover:border-slate-700 transition-all group">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-500">{step.code}</span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">0{idx + 1}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{step.stage}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight">{step.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] font-medium font-mono text-slate-300">{step.count}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tranches in Flight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Execution Velocity per Appropriation Tranche</h3>
                  <p className="text-xs text-slate-400">Authorized vs. Obligated vs. Liquidated Outlay</p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">Figures in $M USD</span>
              </div>

              <div className="space-y-4">
                {MOCK_TRANCHES.map((tranche) => {
                  const obligPercent = Math.round((tranche.obligatedAmount / tranche.authorizedAmount) * 100);
                  const outlayPercent = Math.round((tranche.outlayAmount / tranche.authorizedAmount) * 100);

                  return (
                    <div
                      key={tranche.id}
                      onClick={() => {
                        setSelectedTranche(tranche);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-3.5 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-lg cursor-pointer transition-all hover:bg-slate-950"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-400">{tranche.id}</span>
                          <span className="text-xs font-medium text-slate-200">{tranche.billReference}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {tranche.authority}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          ${tranche.authorizedAmount.toLocaleString()}M
                        </span>
                      </div>

                      {/* Stacked Visual Bar */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex mb-2">
                        <div
                          className="bg-purple-500 h-full"
                          style={{ width: `${outlayPercent}%` }}
                          title={`Outlay: ${outlayPercent}%`}
                        />
                        <div
                          className="bg-blue-500 h-full"
                          style={{ width: `${obligPercent - outlayPercent}%` }}
                          title={`Obligated (Pending Outlay): ${obligPercent - outlayPercent}%`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>
                          Outlays: <strong className="text-purple-400">${tranche.outlayAmount}M ({outlayPercent}%)</strong>
                        </span>
                        <span>
                          Obligated: <strong className="text-blue-400">${tranche.obligatedAmount}M ({obligPercent}%)</strong>
                        </span>
                        <span>
                          Stage: <span className="text-slate-300 font-sans">{tranche.currentStage}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Log Terminal / Event Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Continuous Audit Stream</h3>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-2 h-64 overflow-y-auto">
                  {liveLog.map((log, idx) => (
                    <div key={idx} className="text-slate-300 leading-relaxed border-b border-slate-900 pb-1.5 last:border-none">
                      <span className="text-emerald-500 font-semibold">{'>'}</span> {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Cryptographic Oracle: ACTIVE</span>
                <span className="font-mono text-emerald-400">0.00% Hash Drift</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANCHES MASTER TABLE */}
      {activeTab === 'tranches' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Bill Ref, ID, or Keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Theaters</option>
                <option value="Eastern Europe / Ukraine">Eastern Europe / Ukraine</option>
                <option value="Indo-Pacific / Taiwan">Indo-Pacific / Taiwan</option>
                <option value="Middle East / Levant">Middle East / Levant</option>
                <option value="Global Contingency">Global Contingency</option>
              </select>

              <select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statutory Authorities</option>
                <option value="PDA (Drawdown)">PDA (Drawdown)</option>
                <option value="USAI (Procurement)">USAI (Procurement)</option>
                <option value="FMF (Financing)">FMF (Financing)</option>
                <option value="NDAA Title 10">NDAA Title 10</option>
                <option value="Emergency Supplemental">Emergency Supplemental</option>
              </select>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Tranche & Bill Ref</th>
                    <th className="py-3 px-4">Theater</th>
                    <th className="py-3 px-4">Authority</th>
                    <th className="py-3 px-4 text-right">Authorized</th>
                    <th className="py-3 px-4 text-right">Obligated</th>
                    <th className="py-3 px-4 text-right">Outlay</th>
                    <th className="py-3 px-4 text-center">Pipeline Stage</th>
                    <th className="py-3 px-4 text-center">Audit Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTranches.map((tranche) => (
                    <tr key={tranche.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-400">{tranche.id}</div>
                        <div className="text-slate-300 font-medium">{tranche.billReference}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tranche.congressSession}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">{tranche.theater}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                          {tranche.authority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                        ${tranche.authorizedAmount.toLocaleString()}M
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-400">
                        ${tranche.obligatedAmount.toLocaleString()}M
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-purple-400">
                        ${tranche.outlayAmount.toLocaleString()}M
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                          {tranche.currentStage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tranche.auditStatus === 'Compliant' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Compliant
                          </span>
                        )}
                        {tranche.auditStatus === 'Flagged (Variance)' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" /> Flagged
                          </span>
                        )}
                        {tranche.auditStatus === 'Under IG Review' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            <Eye className="w-3 h-3" /> IG Review
                          </span>
                        )}
                        {tranche.auditStatus === 'Fully Reconciled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTranche(tranche);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 text-xs font-medium transition-colors"
                        >
                          Audit Dossier
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

      {/* TAB 3: CONTRACTORS & FAR OBLIGATIONS */}
      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Defense Prime Contractor Ledger</h3>
              <p className="text-xs text-slate-400">
                Tracking Defense Contract Audit Agency (DCAA) and Federal Acquisition Regulation (FAR Part 31) compliance.
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded">
              DCAA Active Monitor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_CONTRACTORS.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.contractorName}</h4>
                      <div className="text-[11px] font-mono text-slate-400">CAGE Code: {c.cageCode}</div>
                    </div>
                    {c.dcaaAuditPassed ? (
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> DCAA PASS
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> DCAA FAILED
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Contract Structure:</span>
                      <span className="font-mono text-slate-200">{c.contractType}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Obligated Allocation:</span>
                      <span className="font-mono font-semibold text-white">${c.obligatedAmount.toLocaleString()}M</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Disbursed Outlay:</span>
                      <span className="font-mono text-purple-400">${c.disbursedAmount.toLocaleString()}M</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery Milestones:</span>
                      <span className="font-mono font-bold text-emerald-400">{c.deliveryPerformance}%</span>
                    </div>
                  </div>

                  {c.activeAnomalies.length > 0 && (
                    <div className="mt-3 p-2 bg-rose-950/40 border border-rose-900/60 rounded text-[11px] text-rose-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{c.activeAnomalies[0]}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-500 text-[10px]">Tranche: {c.trancheId}</span>
                  <button
                    onClick={() => alert(`Pulling DCAA Audit Cert & FAR Voucher for CAGE ${c.cageCode}`)}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    View Vouchers &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INSPECTOR GENERAL (IG) & DISCREPANCIES */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Special Inspector General & DoD-OIG Discrepancy Registry</h3>
              <p className="text-xs text-slate-400">
                Fraud, Waste, and Abuse (FWA) alerts and forensic financial reconciliations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Severity:</span>
              <select
                value={auditFilterSeverity}
                onChange={(e) => setAuditFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_DISCREPANCIES
              .filter((d) => auditFilterSeverity === 'ALL' || d.severity === auditFilterSeverity)
              .map((disc) => (
                <div
                  key={disc.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        disc.severity === 'Critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : disc.severity === 'Major'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-white">{disc.id}</span>
                        <span className="text-xs px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {disc.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Ref: {disc.trancheId}</span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-3xl">{disc.details}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                        <span>Reported By: <strong className="text-slate-400">{disc.reportedBy}</strong></span>
                        <span>Logged: {disc.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Amount at Risk</span>
                      <span className="text-base font-bold font-mono text-rose-400">${disc.amountAtRisk.toFixed(1)}M</span>
                    </div>
                    <span
                      className={`mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        disc.status === 'Escalated to DOJ'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                          : disc.status === 'Open Investigation'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {disc.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: PDA INVENTORY & DRAWDOWN VERIFICATION */}
      {activeTab === 'drawdowns' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Presidential Drawdown Authority (PDA) Stock Requisition</h3>
              <p className="text-xs text-slate-400">
                End-use monitoring (EUM) and serial-number verification from defense depot to tactical theater handover.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded">
              EUM Tracking Level: STRICT
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">NSN & Designation</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Qty Authorized</th>
                    <th className="py-3 px-4 text-center">Qty Shipped</th>
                    <th className="py-3 px-4 text-center">In-Theater Verified</th>
                    <th className="py-3 px-4 text-right">Unit Repl. Cost</th>
                    <th className="py-3 px-4 text-right">Transit Loss Var.</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {MOCK_DRAWDOWN_ITEMS.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{item.designation}</div>
                        <div className="font-mono text-[11px] text-slate-400">{item['nationalStockNumber (NSN)']}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">{item.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-200">
                        {item.quantityAuthorized.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-blue-400">
                        {item.quantityShipped.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                        {item.quantityVerifiedInTheater.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-white">
                        ${item.unitReplacementCost.toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.transitLossVariance === 0 ? (
                          <span className="text-emerald-400">0.00%</span>
                        ) : (
                          <span className="text-amber-400 font-bold">{(item.transitLossVariance * 100).toFixed(2)}%</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.quantityShipped === item.quantityVerifiedInTheater ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Clock className="w-3 h-3" /> IN TRANSIT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR TRANCHE AUDIT DOSSIER */}
      {isDetailModalOpen && selectedTranche && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedTranche.billReference}</h3>
                <p className="text-xs font-mono text-slate-400">
                  Tranche ID: {selectedTranche.id} | Session: {selectedTranche.congressSession}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
              {selectedTranche.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Theater</span>
                <span className="font-semibold text-slate-200">{selectedTranche.theater}</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Authority</span>
                <span className="font-semibold text-amber-400">{selectedTranche.authority}</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Pipeline Stage</span>
                <span className="font-semibold text-blue-400">{selectedTranche.currentStage}</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Authorized Total</span>
                <span className="font-mono font-bold text-white">${selectedTranche.authorizedAmount.toLocaleString()}M</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Obligated Total</span>
                <span className="font-mono font-bold text-blue-400">${selectedTranche.obligatedAmount.toLocaleString()}M</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Outlays Liquidated</span>
                <span className="font-mono font-bold text-purple-400">${selectedTranche.outlayAmount.toLocaleString()}M</span>
              </div>
            </div>

            <div className="mb-5">
              <span className="text-xs text-slate-400 font-semibold block mb-1.5">Assigned Prime Contractors:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTranche.primaryContractors.map((c, i) => (
                  <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-[11px] text-slate-500 font-mono">
                Statutory Sunset Date: <span className="text-slate-300">{selectedTranche.sunsetDate}</span>
              </div>
              <button
                onClick={() => {
                  alert(`Certified DCAA Audit Dossier generated for Tranche ${selectedTranche.id}`);
                  setIsDetailModalOpen(false);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Certify Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}