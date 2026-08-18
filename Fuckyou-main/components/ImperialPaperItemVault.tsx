import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  FileCheck2,
  ScanLine,
  Lock,
  Eye,
  Calendar,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Fingerprint,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Truck,
  Building,
  KeyRound,
  DownloadCloud,
  Clock,
  ChevronRight,
  Database,
  Compass,
  FileText
} from 'lucide-react';

interface ForensicScan {
  confidenceScore: number;
  micrRoutingValid: boolean;
  signatureBiometrics: 'VERIFIED_PERFECT' | 'AUTHENTICATED_TIER_1' | 'PENDING_HUMAN_OVERSEER';
  inkDepthAnalysis: string;
  uvFluorescenceScore: number;
  magneticInkDensity: number;
  alteredPayeeRisk: 'ZERO' | 'LOW' | 'DETECTED';
}

interface PaperItem {
  id: string;
  modernTreasuryId: string;
  citiLockboxRef: string;
  depositDate: string;
  receivedTimestamp: string;
  amount: number;
  currency: string;
  remitter: string;
  remitterBank: string;
  payee: string;
  checkNumber: string;
  routingNumber: string;
  accountNumberMasked: string;
  status: 'VAULT_SECURED' | 'AI_AUTHENTICATED' | 'ARMORED_TRANSIT' | 'SETTLED_GOLD' | 'FORENSIC_HOLD';
  lockboxFacility: string;
  vaultCellLocation: string;
  frontImageUrl: string;
  backImageUrl: string;
  forensics: ForensicScan;
  assignedVaultOfficer: string;
  escrowMemo: string;
}

const LUXURY_PAPER_ITEMS: PaperItem[] = [
  {
    id: "PI-88902-X",
    modernTreasuryId: "pi_01HQK928J019XLL001",
    citiLockboxRef: "CITI-LBX-ZURICH-8819",
    depositDate: "2025-02-28",
    receivedTimestamp: "2025-02-28 09:14:22 CET",
    amount: 145000000.00,
    currency: "USD",
    remitter: "Sovereign Heritage Trust Ltd.",
    remitterBank: "Citigroup Private Bank (Geneva)",
    payee: "Aethelgard Royal Vault Operations LLC",
    checkNumber: "00091823",
    routingNumber: "021000089",
    accountNumberMasked: "••••••••9401",
    status: "VAULT_SECURED",
    lockboxFacility: "Citibank GBD Ultra-Vault (Geneva Sub-Alpine)",
    vaultCellLocation: "Cell 418-Alpha (Titanium Sub-level 3)",
    frontImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    backImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
    forensics: {
      confidenceScore: 99.98,
      micrRoutingValid: true,
      signatureBiometrics: "VERIFIED_PERFECT",
      inkDepthAnalysis: "24-Pica Carbon Fiber Ink Layer Detected (True Intaglio)",
      uvFluorescenceScore: 99.4,
      magneticInkDensity: 98.7,
      alteredPayeeRisk: "ZERO"
    },
    assignedVaultOfficer: "Baroness Vance, Chief Custodian",
    escrowMemo: "Acquisition of Sovereign Gold Reserves Lot #880B"
  },
  {
    id: "PI-77401-G",
    modernTreasuryId: "pi_01HQK939K281YTT902",
    citiLockboxRef: "CITI-LBX-NY-0920",
    depositDate: "2025-03-01",
    receivedTimestamp: "2025-03-01 11:32:05 EST",
    amount: 88500000.00,
    currency: "USD",
    remitter: "Elysium Superyacht Shipyards NV",
    remitterBank: "Banque Privée Edmond de Rothschild",
    payee: "Monaco Royal Oceanic Holdings",
    checkNumber: "10984",
    routingNumber: "121000358",
    accountNumberMasked: "••••••••4810",
    status: "AI_AUTHENTICATED",
    lockboxFacility: "Citibank Manhattan Master Treasury Lockbox",
    vaultCellLocation: "High-Security Cassette #91",
    frontImageUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80",
    backImageUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
    forensics: {
      confidenceScore: 99.42,
      micrRoutingValid: true,
      signatureBiometrics: "AUTHENTICATED_TIER_1",
      inkDepthAnalysis: "Ferro-magnetic Signature Verified (Dry Pigment 1.4 mil)",
      uvFluorescenceScore: 98.1,
      magneticInkDensity: 96.9,
      alteredPayeeRisk: "ZERO"
    },
    assignedVaultOfficer: "Lord Sterling, Senior Assay Master",
    escrowMemo: "Final Clearance for Hull #09-V 'Solaris Empress'"
  },
  {
    id: "PI-99304-Q",
    modernTreasuryId: "pi_01HQK955M910ZAA403",
    citiLockboxRef: "CITI-LBX-LON-4401",
    depositDate: "2025-03-02",
    receivedTimestamp: "2025-03-02 08:05:19 GMT",
    amount: 250000000.00,
    currency: "USD",
    remitter: "Valle d'Oro Mining Cartel Ltd.",
    remitterBank: "Standard Chartered Private Bank London",
    payee: "Imperial Bullion Syndicate",
    checkNumber: "0000054",
    routingNumber: "026009593",
    accountNumberMasked: "••••••••1120",
    status: "ARMORED_TRANSIT",
    lockboxFacility: "Citibank Canary Wharf Deep Vault",
    vaultCellLocation: "In Transit: Armored Convoy 77-Echo",
    frontImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    backImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    forensics: {
      confidenceScore: 99.99,
      micrRoutingValid: true,
      signatureBiometrics: "VERIFIED_PERFECT",
      inkDepthAnalysis: "Engraved Optical Security Thread Active",
      uvFluorescenceScore: 100.0,
      magneticInkDensity: 99.5,
      alteredPayeeRisk: "ZERO"
    },
    assignedVaultOfficer: "Commander Sterling, Escort Wing",
    escrowMemo: "Quarterly Unrefined Bullion Clearance Tranche IV"
  },
  {
    id: "PI-61298-F",
    modernTreasuryId: "pi_01HQK971N334KPP109",
    citiLockboxRef: "CITI-LBX-SING-1011",
    depositDate: "2025-03-03",
    receivedTimestamp: "2025-03-03 14:40:11 SGT",
    amount: 42000000.00,
    currency: "USD",
    remitter: "Helios Orbital Spaceports Pte.",
    remitterBank: "DBS Private Bank Singapore",
    payee: "Global Space Transit Escrow",
    checkNumber: "8891001",
    routingNumber: "111000025",
    accountNumberMasked: "••••••••7739",
    status: "FORENSIC_HOLD",
    lockboxFacility: "Citibank Marina Bay Secure Lockbox Facility",
    vaultCellLocation: "Spectrometry Chamber 04",
    frontImageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    backImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    forensics: {
      confidenceScore: 84.10,
      micrRoutingValid: true,
      signatureBiometrics: "PENDING_HUMAN_OVERSEER",
      inkDepthAnalysis: "Minor Thermal Artifact Detected on Watermark",
      uvFluorescenceScore: 82.5,
      magneticInkDensity: 88.0,
      alteredPayeeRisk: "LOW"
    },
    assignedVaultOfficer: "Dr. Alistair Chen, Spectral Analyst",
    escrowMemo: "Launchpad Carbon Infrastructure Milestone #2"
  }
];

export const ImperialPaperItemVault: React.FC = () => {
  const [items] = useState<PaperItem[]>(LUXURY_PAPER_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string>(LUXURY_PAPER_ITEMS[0].id);
  const [activeTab, setActiveTab] = useState<'FRONT' | 'BACK' | 'UV_SPECTRUM' | 'MICR_MATRIX'>('FRONT');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [uvActive, setUvActive] = useState<boolean>(false);

  const selectedItem = useMemo(() => {
    return items.find(i => i.id === selectedItemId) || items[0];
  }, [items, selectedItemId]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch =
        item.remitter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citiLockboxRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.checkNumber.includes(searchQuery);
      const matchDate = filterDate ? item.depositDate === filterDate : true;
      const matchStatus = statusFilter === 'ALL' ? true : item.status === statusFilter;
      return matchSearch && matchDate && matchStatus;
    });
  }, [items, searchQuery, filterDate, statusFilter]);

  const triggerRescan = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      setIsAiScanning(false);
    }, 1800);
  };

  const totalVaultValue = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.amount, 0);
  }, [items]);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-4 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Citibank x Modern Treasury Imperial Header */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0d121f] via-[#141d30] to-[#0d121f] p-6 lg:p-8 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 tracking-widest uppercase">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Citibank Global Lockbox &bull; Sovereign Treasury API
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                ENDPOINT: /api/paper_items
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
              Imperial Paper Item Vault &amp; Spectral AI Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              High-frequency multi-million dollar check digitizer with neural handwriting OCR, magnetic ink resonance spectroscopy, and direct Citibank Lockbox settlement.
            </p>
          </div>

          {/* Aggregate Vault Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-slate-800/80">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Physical Value</p>
              <p className="text-xl font-bold text-amber-400 font-mono">
                ${(totalVaultValue / 1000000).toFixed(2)}M <span className="text-xs text-amber-500/70 font-sans">USD</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Secured Items</p>
              <p className="text-xl font-bold text-slate-100 font-mono">{items.length} Drafts</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">AI Authenticity</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">99.87%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Item List & Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Filter & Paper Item Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Remitter, Check #, Lockbox..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/50 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-black/50 border border-slate-700/80 rounded-lg text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-amber-500/60 font-mono"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(['ALL', 'VAULT_SECURED', 'AI_AUTHENTICATED', 'ARMORED_TRANSIT', 'FORENSIC_HOLD'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all font-mono uppercase ${
                    statusFilter === st
                      ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-mono mb-2 flex justify-between">
              <span>Showing {filteredItems.length} scanned physical instrument(s)</span>
              <span>Sorted by Valuation [DESC]</span>
            </div>

            {/* List of Paper Items */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setZoomLevel(1);
                      setRotation(0);
                    }}
                    className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {item.id}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Chk #{item.checkNumber}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'VAULT_SECURED'
                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-600/40'
                                : item.status === 'ARMORED_TRANSIT'
                                ? 'bg-blue-900/40 text-blue-300 border border-blue-600/40'
                                : item.status === 'FORENSIC_HOLD'
                                ? 'bg-rose-900/40 text-rose-300 border border-rose-600/40'
                                : 'bg-amber-900/40 text-amber-300 border border-amber-600/40'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{item.remitter}</h4>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          {item.lockboxFacility}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-amber-300">
                          ${(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.depositDate}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confidence: <strong className="text-emerald-300">{item.forensics.confidenceScore}%</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300 hover:text-amber-300">
                        <span>Inspect Check</span>
                        <ChevronRight className="w-3 h-3 text-amber-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Holographic Check Specimen Inspection & AI Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Inspection Deck */}
          <div className="bg-[#0c101a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Gold Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Check Specimen Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-slate-100">
                    Citibank Lockbox Specimen #{selectedItem.checkNumber}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Modern Treasury Ref: <span className="text-amber-300">{selectedItem.modernTreasuryId}</span>
                </p>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-slate-800">
                {(['FRONT', 'BACK', 'UV_SPECTRUM', 'MICR_MATRIX'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === 'UV_SPECTRUM') setUvActive(true);
                      else setUvActive(false);
                    }}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                      activeTab === tab
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Check Viewport */}
            <div className="relative mt-4 bg-[#05070B] rounded-xl border border-slate-800 p-4 overflow-hidden min-h-[300px] flex items-center justify-center">
              
              {/* Scanline Animation Overlay when Rescanning */}
              {isAiScanning && (
                <div className="absolute inset-0 z-30 pointer-events-none bg-emerald-500/5 border-b-2 border-emerald-400 animate-pulse flex items-center justify-center">
                  <div className="bg-black/90 px-4 py-2 rounded-lg border border-emerald-500/50 text-emerald-400 text-xs font-mono flex items-center gap-2 shadow-2xl">
                    <ScanLine className="w-4 h-4 animate-spin" />
                    NEURAL SPECTRAL OCR DECONVOLUTION IN PROGRESS...
                  </div>
                </div>
              )}

              {/* Check Canvas Simulator */}
              <div
                className={`relative transition-transform duration-300 rounded-lg shadow-2xl max-w-full overflow-hidden border ${
                  uvActive
                    ? 'border-indigo-500/70 shadow-indigo-500/20 bg-indigo-950/40'
                    : 'border-amber-500/30 shadow-amber-950/50 bg-stone-900'
                }`}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <div className="relative w-[520px] h-[240px] max-w-full p-6 flex flex-col justify-between select-none bg-gradient-to-br from-[#1d222d] via-[#161a24] to-[#0f131a] text-slate-200 border-2 border-amber-500/20">
                  
                  {/* Decorative Guilloche Security Pattern Simulated */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
                  
                  {/* UV Hologram Layer */}
                  {uvActive && (
                    <div className="absolute inset-0 bg-indigo-900/30 mix-blend-color-dodge flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-dashed border-cyan-400/50 p-6 rounded-full rotate-12">
                        <span className="text-cyan-300 font-mono font-black text-xl tracking-widest uppercase">
                          GENUINE CITIBANK ULTRA SECURE
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Check Top Section */}
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">{selectedItem.remitter}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{selectedItem.remitterBank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-amber-400">NO. {selectedItem.checkNumber}</p>
                      <p className="text-[10px] font-mono text-slate-400">{selectedItem.depositDate}</p>
                    </div>
                  </div>

                  {/* Payee and Amount Line */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-end border-b border-slate-600 pb-1">
                      <div className="text-xs text-slate-300">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Pay to the Order of</span>
                        <span className="font-semibold text-amber-100">{selectedItem.payee}</span>
                      </div>
                      <div className="bg-black/70 px-3 py-1 rounded border border-amber-500/40 text-sm font-mono font-bold text-amber-300">
                        ${selectedItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 italic">
                      Memo: <span className="text-slate-200 font-sans">{selectedItem.escrowMemo}</span>
                    </div>
                  </div>

                  {/* Bottom: Signature & MICR Line */}
                  <div className="relative z-10 flex justify-between items-end pt-2">
                    <div className="font-mono text-xs text-slate-300 tracking-widest bg-black/40 px-2 py-0.5 rounded border border-slate-700/50">
                      ⑆{selectedItem.routingNumber}⑆ ⑈{selectedItem.accountNumberMasked}⑈ ⑈{selectedItem.checkNumber}⑈
                    </div>
                    <div className="text-right">
                      <div className="w-32 border-b border-slate-400 italic text-[11px] text-amber-200 font-serif pb-0.5">
                        {selectedItem.remitter.split(' ')[0]} Autograph
                      </div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500">Authorized Signature</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Viewport Control Floating Toolbar */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 text-slate-300 z-20">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
                  className="p-1.5 hover:text-amber-300 hover:bg-slate-800 rounded transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
                  className="p-1.5 hover:text-amber-300 hover:bg-slate-800 rounded transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 hover:text-amber-300 hover:bg-slate-800 rounded transition"
                  title="Rotate Specimen"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUvActive(!uvActive)}
                  className={`p-1.5 rounded transition ${uvActive ? 'bg-indigo-600 text-white' : 'hover:text-amber-300 hover:bg-slate-800'}`}
                  title="Toggle Spectral UV"
                >
                  <Sun className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions & AI Rescan Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerRescan}
                  disabled={isAiScanning}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiScanning ? 'Running Neural Spectrometry...' : 'Run Forensic AI Scan'}
                </button>
                <button
                  onClick={() => alert(`Downloading high-resolution 2400 DPI audit TIFF for Check #${selectedItem.checkNumber}`)}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-amber-400" />
                  Raw TIFF Image
                </button>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-mono">
                  CITI Vault Officer: <strong className="text-slate-200">{selectedItem.assignedVaultOfficer}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* AI Forensic Telemetry & Magnetic Ink Verification Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Forensic Spectrometry */}
            <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Spectral &amp; Ink Forensics
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PASSED (100% Intact)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Magnetic MICR Density:</span>
                  <span className="text-slate-100 font-bold">{selectedItem.forensics.magneticInkDensity}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">UV Fluoroscopy Score:</span>
                  <span className="text-cyan-300 font-bold">{selectedItem.forensics.uvFluorescenceScore} / 100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Signature Biometrics:</span>
                  <span className="text-emerald-400 font-bold">{selectedItem.forensics.signatureBiometrics}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Microprint / Depth Report</span>
                  <span className="text-amber-200/90 text-[11px]">{selectedItem.forensics.inkDepthAnalysis}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Physical Vault Logistics & CIT (Armored Courier) */}
            <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Physical Vault Storage
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  CLASS 9 VAULT
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Facility:</span>
                  <span className="text-slate-100 font-semibold text-right">{selectedItem.lockboxFacility}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Vault Cell:</span>
                  <span className="text-amber-300 font-bold">{selectedItem.vaultCellLocation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Received Timestamp:</span>
                  <span className="text-slate-300">{selectedItem.receivedTimestamp}</span>
                </div>
                <div className="flex justify-between py-1 pt-1">
                  <span className="text-slate-400">Transit Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Brink's Armed Escort Assigned
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Metadata & API Documentation Note */}
          <div className="p-4 rounded-xl bg-black/40 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Modern Treasury API Payload synced in real-time with Citi Velocity &trade; Lockbox Network</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-amber-400" /> SLA: 12 Min Clearing
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> 256-Bit Ledger Encrypted
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ImperialPaperItemVault;