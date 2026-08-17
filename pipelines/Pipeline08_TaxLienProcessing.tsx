import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  DollarSign,
  Gavel,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Percent,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Eye,
  Download,
  Scale,
  Sparkles,
  Award,
  ChevronRight,
  Database
} from 'lucide-react';

interface TaxLienRecord {
  id: string;
  parcelNumber: string;
  propertyAddress: string;
  county: string;
  state: string;
  assessedValue: number;
  delinquentTaxAmount: number;
  statutoryInterestRate: number; // e.g. 18%
  currentInterestAccrued: number;
  stage: 'delinquency_scrape' | 'auction_listed' | 'bidding_active' | 'certificate_issued' | 'redemption_window' | 'foreclosure_pending' | 'redeemed' | 'deed_conveyed';
  auctionDate: string;
  redemptionDeadline: string;
  winningBidder?: string;
  winningInterestRate?: number; // e.g. bid-down to 4%
  certificateNumber?: string;
  certificateFaceValue?: number;
  redemptionStatus: 'Pending' | 'Paid_In_Full' | 'Defaulted' | 'In_Grace_Period';
  daysRemaining: number;
}

const SAMPLE_TAX_LIENS: TaxLienRecord[] = [
  {
    id: 'TL-2024-8891',
    parcelNumber: '042-182-901-00',
    propertyAddress: '1428 Elm Ridge Road, Tampa',
    county: 'Hillsborough',
    state: 'FL',
    assessedValue: 345000,
    delinquentTaxAmount: 4850.50,
    statutoryInterestRate: 18.0,
    currentInterestAccrued: 436.54,
    stage: 'redemption_window',
    auctionDate: '2023-05-15',
    redemptionDeadline: '2025-05-15',
    winningBidder: 'Apex Yield Fund LP',
    winningInterestRate: 4.25,
    certificateNumber: 'FL-HB-2023-0881',
    certificateFaceValue: 5120.00,
    redemptionStatus: 'Pending',
    daysRemaining: 184
  },
  {
    id: 'TL-2024-8892',
    parcelNumber: '109-874-320-11',
    propertyAddress: '782 Industrial Pkwy, Maricopa',
    county: 'Maricopa',
    state: 'AZ',
    assessedValue: 1250000,
    delinquentTaxAmount: 24320.00,
    statutoryInterestRate: 16.0,
    currentInterestAccrued: 3891.20,
    stage: 'foreclosure_pending',
    auctionDate: '2021-02-10',
    redemptionDeadline: '2024-02-10',
    winningBidder: 'Sunbelt Capital Group',
    winningInterestRate: 3.5,
    certificateNumber: 'AZ-MC-2021-9942',
    certificateFaceValue: 25400.00,
    redemptionStatus: 'Defaulted',
    daysRemaining: 0
  },
  {
    id: 'TL-2024-8893',
    parcelNumber: '334-019-823-05',
    propertyAddress: '402 Sunset Blvd, Cape May',
    county: 'Cape May',
    state: 'NJ',
    assessedValue: 620000,
    delinquentTaxAmount: 9840.00,
    statutoryInterestRate: 18.0,
    currentInterestAccrued: 1180.80,
    stage: 'redeemed',
    auctionDate: '2023-10-18',
    redemptionDeadline: '2025-10-18',
    winningBidder: 'Harbor City Investments',
    winningInterestRate: 0.0, // Bid-down to 0% with premium
    certificateNumber: 'NJ-CM-2023-1120',
    certificateFaceValue: 9840.00,
    redemptionStatus: 'Paid_In_Full',
    daysRemaining: 0
  },
  {
    id: 'TL-2024-8894',
    parcelNumber: '891-223-551-09',
    propertyAddress: '912 Meadowbrook Trail, Cook',
    county: 'Cook',
    state: 'IL',
    assessedValue: 280000,
    delinquentTaxAmount: 3950.00,
    statutoryInterestRate: 18.0,
    currentInterestAccrued: 0,
    stage: 'bidding_active',
    auctionDate: '2024-11-20',
    redemptionDeadline: '2026-11-20',
    redemptionStatus: 'Pending',
    daysRemaining: 730
  },
  {
    id: 'TL-2024-8895',
    parcelNumber: '502-110-449-77',
    propertyAddress: '1504 Magnolia St, Fulton',
    county: 'Fulton',
    state: 'GA',
    assessedValue: 490000,
    delinquentTaxAmount: 7600.00,
    statutoryInterestRate: 20.0,
    currentInterestAccrued: 0,
    stage: 'auction_listed',
    auctionDate: '2024-12-05',
    redemptionDeadline: '2025-12-05',
    redemptionStatus: 'Pending',
    daysRemaining: 365
  },
  {
    id: 'TL-2024-8896',
    parcelNumber: '772-990-112-40',
    propertyAddress: '233 Pinecrest Lane, Dallas',
    county: 'Dallas',
    state: 'TX',
    assessedValue: 710000,
    delinquentTaxAmount: 11400.00,
    statutoryInterestRate: 25.0,
    currentInterestAccrued: 1425.00,
    stage: 'certificate_issued',
    auctionDate: '2024-06-01',
    redemptionDeadline: '2025-06-01',
    winningBidder: 'Lone Star Asset Mgt',
    winningInterestRate: 12.0,
    certificateNumber: 'TX-DL-2024-5501',
    certificateFaceValue: 11400.00,
    redemptionStatus: 'In_Grace_Period',
    daysRemaining: 210
  }
];

const PIPELINE_STAGES = [
  { id: 'delinquency_scrape', name: 'Tax Delinquency Ingestion', desc: 'Ingest county tax rolls & identify defaulted parcels' },
  { id: 'auction_listed', name: 'Auction Pre-Listing', desc: 'Title verification, lien priority scrub & public cataloging' },
  { id: 'bidding_active', name: 'Live Auction Bidding', desc: 'Bid-down interest auction execution and escrow funding' },
  { id: 'certificate_issued', name: 'Certificate Issuance', desc: 'Issue registered Tax Lien Certificate (TLC) to winner' },
  { id: 'redemption_window', name: 'Redemption Monitoring', desc: 'Statutory interest accrual & homeowner payment tracking' },
  { id: 'foreclosure_pending', name: 'Judicial Foreclosure / Deed', desc: 'Bar of redemption & legal transfer of tax deed title' }
];

export default function Pipeline08_TaxLienProcessing() {
  const [liens, setLiens] = useState<TaxLienRecord[]>(SAMPLE_TAX_LIENS);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'calculator' | 'auctions' | 'ledger'>('pipeline');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLien, setSelectedLien] = useState<TaxLienRecord | null>(SAMPLE_TAX_LIENS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Redemption Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState<number>(5000);
  const [calcRate, setCalcRate] = useState<number>(18);
  const [calcMonths, setCalcMonths] = useState<number>(12);
  const [calcPenaltyPercent, setCalcPenaltyPercent] = useState<number>(5);

  // Filtered Liens
  const filteredLiens = useMemo(() => {
    return liens.filter(lien => {
      const matchesStage = selectedStage === 'all' || lien.stage === selectedStage;
      const matchesSearch = lien.parcelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lien.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lien.county.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [liens, selectedStage, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalAssessed = liens.reduce((acc, curr) => acc + curr.assessedValue, 0);
    const totalDelinquent = liens.reduce((acc, curr) => acc + curr.delinquentTaxAmount, 0);
    const activeCertificates = liens.filter(l => l.stage === 'certificate_issued' || l.stage === 'redemption_window').length;
    const redeemedCount = liens.filter(l => l.stage === 'redeemed').length;
    const defaultedCount = liens.filter(l => l.stage === 'foreclosure_pending').length;
    const avgInterest = (liens.reduce((acc, curr) => acc + (curr.winningInterestRate ?? curr.statutoryInterestRate), 0) / liens.length).toFixed(2);
    
    return {
      totalAssessed,
      totalDelinquent,
      activeCertificates,
      redeemedCount,
      defaultedCount,
      avgInterest
    };
  }, [liens]);

  // Calculator Outputs
  const calcOutput = useMemo(() => {
    const annualInterest = (calcPrincipal * (calcRate / 100));
    const accruedInterest = (annualInterest / 12) * calcMonths;
    const statutoryPenalty = calcPrincipal * (calcPenaltyPercent / 100);
    const totalRedemptionAmount = calcPrincipal + accruedInterest + statutoryPenalty;
    const annualizedYield = (((totalRedemptionAmount - calcPrincipal) / calcPrincipal) / (calcMonths / 12)) * 100;
    return {
      accruedInterest,
      statutoryPenalty,
      totalRedemptionAmount,
      annualizedYield: isNaN(annualizedYield) ? 0 : annualizedYield.toFixed(2)
    };
  }, [calcPrincipal, calcRate, calcMonths, calcPenaltyPercent]);

  // Simulate Lien Stage Progression
  const handleAdvanceStage = (id: string) => {
    setLiens(prev => prev.map(lien => {
      if (lien.id !== id) return lien;
      let nextStage: TaxLienRecord['stage'] = lien.stage;
      let nextStatus = lien.redemptionStatus;

      switch (lien.stage) {
        case 'delinquency_scrape':
          nextStage = 'auction_listed';
          break;
        case 'auction_listed':
          nextStage = 'bidding_active';
          break;
        case 'bidding_active':
          nextStage = 'certificate_issued';
          lien.winningBidder = 'Pipeline Automated Trust';
          lien.winningInterestRate = 4.5;
          lien.certificateNumber = `CERT-${Math.floor(100000 + Math.random() * 900000)}`;
          lien.certificateFaceValue = lien.delinquentTaxAmount * 1.05;
          break;
        case 'certificate_issued':
          nextStage = 'redemption_window';
          break;
        case 'redemption_window':
          nextStage = 'redeemed';
          nextStatus = 'Paid_In_Full';
          break;
        case 'foreclosure_pending':
          nextStage = 'deed_conveyed';
          break;
        default:
          break;
      }

      const updated = { ...lien, stage: nextStage, redemptionStatus: nextStatus };
      if (selectedLien?.id === id) {
        setSelectedLien(updated);
      }
      return updated;
    }));
  };

  // Run automated auction simulation
  const handleSimulateCycle = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setLiens(prev => [
        ...prev,
        {
          id: `TL-2024-${Math.floor(1000 + Math.random() * 9000)}`,
          parcelNumber: `601-${Math.floor(100 + Math.random() * 899)}-${Math.floor(100 + Math.random() * 899)}-00`,
          propertyAddress: '900 Beacon Summit Way, Travis',
          county: 'Travis',
          state: 'TX',
          assessedValue: 890000,
          delinquentTaxAmount: 14200.00,
          statutoryInterestRate: 25.0,
          currentInterestAccrued: 0,
          stage: 'delinquency_scrape',
          auctionDate: '2025-01-15',
          redemptionDeadline: '2026-01-15',
          redemptionStatus: 'Pending',
          daysRemaining: 365
        }
      ]);
      setIsSimulating(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Tax Lien & Redemption Pipeline
                <span className="text-xs font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                  v8.4 Live
                </span>
              </h1>
              <p className="text-slate-400 text-sm">
                Automated ingestion, bid-down auction execution, certificate tracking, and statutory redemptions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateCycle}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin text-emerald-400' : ''}`} />
            {isSimulating ? 'Ingesting Data...' : 'Scrape County Rolls'}
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            Redemption Yield Calc
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Delinquent Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${metrics.totalDelinquent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across 6 jurisdictions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Collateral Assessed</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${(metrics.totalAssessed / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500 mt-1">LTV &lt; 5.2% average</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active TLCs</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {metrics.activeCertificates}
          </div>
          <div className="text-xs text-emerald-400 mt-1">In statutory hold</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Winning Rate</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {metrics.avgInterest}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Bid-down weighted</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Redeemed Ratio</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {((metrics.redeemedCount / liens.length) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-emerald-400 mt-1">Principal + penalty settled</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Foreclosure Track</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {metrics.defaultedCount}
          </div>
          <div className="text-xs text-rose-400 mt-1">Deed conveyance ready</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Pipeline Stages & Workflow
        </button>
        <button
          onClick={() => setActiveTab('auctions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'auctions'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gavel className="w-4 h-4" />
          Live Auction & Bid Floor
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Certificate Master Ledger
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          Statutory Yield Calculator
        </button>
      </div>

      {/* TAB 1: PIPELINE STAGES & WORKFLOW */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Stage Breadcrumb / Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map((stage, idx) => {
              const count = liens.filter(l => l.stage === stage.id).length;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(selectedStage === stage.id ? 'all' : stage.id)}
                  className={`cursor-pointer rounded-xl p-3.5 border transition relative ${
                    selectedStage === stage.id
                      ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Stage {idx + 1}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-xs font-mono font-semibold rounded-md text-emerald-400 border border-slate-700">
                      {count}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1 leading-snug">{stage.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{stage.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Parcel, Address, County..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Filter className="w-4 h-4" /> Filtered: <span className="font-mono text-white">{filteredLiens.length}</span> records
              </div>
              {selectedStage !== 'all' && (
                <button
                  onClick={() => setSelectedStage('all')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout: Main List & Selected Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredLiens.map(lien => {
                const isSelected = selectedLien?.id === lien.id;
                return (
                  <div
                    key={lien.id}
                    onClick={() => setSelectedLien(lien)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500/70 shadow-lg shadow-slate-950'
                        : 'bg-slate-900/60 border-slate-850 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">{lien.parcelNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {lien.county} County, {lien.state}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
                          lien.stage === 'redeemed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : lien.stage === 'foreclosure_pending'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                        }`}>
                          {lien.stage.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{lien.propertyAddress}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mt-2">
                        <span>Assessed: ${lien.assessedValue.toLocaleString()}</span>
                        <span>•</span>
                        <span>Delinquent: <strong className="text-amber-400">${lien.delinquentTaxAmount.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Statutory: {lien.statutoryInterestRate}%</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Total Lien Amount</div>
                        <div className="text-base font-mono font-bold text-emerald-400">
                          ${(lien.delinquentTaxAmount + lien.currentInterestAccrued).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdvanceStage(lien.id);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded text-xs transition border border-slate-700 flex items-center gap-1"
                      >
                        Advance <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit sticky top-6">
              {selectedLien ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-mono uppercase text-slate-500">Selected Parcel</div>
                      <h3 className="text-lg font-bold text-white font-mono">{selectedLien.parcelNumber}</h3>
                      <p className="text-xs text-slate-400">{selectedLien.propertyAddress}</p>
                    </div>
                    <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                      <Award className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">County Jurisdiction</span>
                      <span className="text-slate-200 font-medium">{selectedLien.county} ({selectedLien.state})</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Assessed Valuation</span>
                      <span className="text-slate-200 font-mono">${selectedLien.assessedValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Lien Ratio (Delinquent / Value)</span>
                      <span className="text-slate-200 font-mono">
                        {((selectedLien.delinquentTaxAmount / selectedLien.assessedValue) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Statutory Tax Rate</span>
                      <span className="text-amber-400 font-mono font-medium">{selectedLien.statutoryInterestRate}%</span>
                    </div>
                    {selectedLien.winningInterestRate !== undefined && (
                      <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Winning Auction Bid Rate</span>
                        <span className="text-emerald-400 font-mono font-bold">{selectedLien.winningInterestRate}%</span>
                      </div>
                    )}
                    {selectedLien.certificateNumber && (
                      <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Certificate Reference</span>
                        <span className="text-sky-400 font-mono">{selectedLien.certificateNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Redemption Deadline</span>
                      <span className="text-slate-200 font-mono">{selectedLien.redemptionDeadline}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Days to Redemption Expiry</span>
                      <span className="text-slate-200 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {selectedLien.daysRemaining > 0 ? `${selectedLien.daysRemaining} days` : 'Matured / Expired'}
                      </span>
                    </div>
                  </div>

                  {/* Action box */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleAdvanceStage(selectedLien.id)}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                    >
                      Process Stage Transition <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Select a lien record to view detailed telemetry
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE AUCTION & BID FLOOR */}
      {activeTab === 'auctions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="w-6 h-6 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Reverse Bid-Down Auction Engine</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl mb-4">
              In statutory tax lien states (e.g., Florida, Arizona, New Jersey), investors bid down the interest rate acceptable from the legal maximum (18%-25%) down to 0.25% or 0% with premium bids. The lowest bidder wins the certificate.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">Simulated Active Auction Queue</div>
                <div className="text-lg font-mono font-bold text-white mt-1">12 Certificates</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">Current Average Bid Floor</div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1">3.75% Interest</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">Escrow Verification Gate</div>
                <div className="text-lg font-mono font-bold text-sky-400 mt-1">100% Pre-funded</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Active Auction Schedule</h3>
              <span className="text-xs text-slate-400">Real-time county clearing</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono">
                  <tr>
                    <th className="p-3">Parcel #</th>
                    <th className="p-3">County / State</th>
                    <th className="p-3">Face Value</th>
                    <th className="p-3">Statutory Cap</th>
                    <th className="p-3">Current Lowest Bid</th>
                    <th className="p-3">Top Bidder</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {SAMPLE_TAX_LIENS.map(lien => (
                    <tr key={lien.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-3 font-semibold text-white">{lien.parcelNumber}</td>
                      <td className="p-3 text-slate-300">{lien.county}, {lien.state}</td>
                      <td className="p-3 text-emerald-400">${lien.delinquentTaxAmount.toLocaleString()}</td>
                      <td className="p-3 text-amber-400">{lien.statutoryInterestRate}%</td>
                      <td className="p-3 text-white font-bold">{lien.winningInterestRate !== undefined ? `${lien.winningInterestRate}%` : '5.25% (Simulated)'}</td>
                      <td className="p-3 text-slate-300">{lien.winningBidder || 'Institutional Pool A'}</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded border border-emerald-500/40 text-[11px] transition">
                          Submit Proxy Bid
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

      {/* TAB 3: CERTIFICATE MASTER LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Tax Lien Certificates (TLC)</h3>
              <p className="text-xs text-slate-400">Immutable ledger of recorded liens with redemption escrow status</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg border border-slate-700">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono">
                <tr>
                  <th className="p-3">Certificate ID</th>
                  <th className="p-3">Parcel Number</th>
                  <th className="p-3">Principal (Face)</th>
                  <th className="p-3">Accrued Interest</th>
                  <th className="p-3">Redemption Status</th>
                  <th className="p-3">Redemption Expiry</th>
                  <th className="p-3 text-right">Ledger Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {liens.map(lien => (
                  <tr key={lien.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3 font-semibold text-sky-400">{lien.certificateNumber || `PENDING-${lien.id}`}</td>
                    <td className="p-3 text-slate-200">{lien.parcelNumber}</td>
                    <td className="p-3 text-emerald-400">${lien.delinquentTaxAmount.toLocaleString()}</td>
                    <td className="p-3 text-amber-400">${lien.currentInterestAccrued.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        lien.redemptionStatus === 'Paid_In_Full'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : lien.redemptionStatus === 'Defaulted'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {lien.redemptionStatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{lien.redemptionDeadline}</td>
                    <td className="p-3 text-right text-slate-500 font-mono text-[10px]">
                      0x{Math.random().toString(16).substr(2, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY YIELD CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                Statutory Lien Redemption Yield Model
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculate total payout on redemption including base delinquent tax, statutory monthly compounding penalty, and state-mandated administrative flat fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Delinquent Principal Amount ($)</label>
                <input
                  type="number"
                  value={calcPrincipal}
                  onChange={e => setCalcPrincipal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Statutory Annual Interest Rate (%)</label>
                <input
                  type="number"
                  value={calcRate}
                  onChange={e => setCalcRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Redemption Duration (Months)</label>
                <input
                  type="number"
                  value={calcMonths}
                  onChange={e => setCalcMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Statutory Flat Penalty (%)</label>
                <input
                  type="number"
                  value={calcPenaltyPercent}
                  onChange={e => setCalcPenaltyPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 mb-2 font-mono uppercase">Redemption Calculation Formula</div>
              <div className="font-mono text-xs text-emerald-300">
                Total Payout = Principal + (Principal × (Rate / 12) × Months) + (Principal × Penalty%)
              </div>
            </div>
          </div>

          {/* Calculator Results */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 mb-4">Projected Investor Return</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Principal Invested</span>
                  <span className="font-mono text-white">${calcPrincipal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Accrued Interest ({calcMonths} mo)</span>
                  <span className="font-mono text-emerald-400">+${calcOutput.accruedInterest.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Flat Statutory Penalty</span>
                  <span className="font-mono text-emerald-400">+${calcOutput.statutoryPenalty.toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Gross Redemption Payout</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">
                    ${calcOutput.totalRedemptionAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-center">
              <div className="text-xs text-emerald-300 uppercase font-mono">Annualized Internal Rate of Return</div>
              <div className="text-3xl font-mono font-black text-emerald-400 mt-1">
                {calcOutput.annualizedYield}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}