

// --- CONSOLIDATED FROM: ./pipelines/Pipeline35_DeedRegistrar.tsx ---

import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Scale,
  Stamp,
  Hash,
  ArrowRight,
  Download,
  Eye,
  RefreshCw,
  UserCheck,
  MapPin,
  Landmark,
  ChevronRight,
  Plus,
  Layers,
  FileCheck,
  AlertOctagon,
  KeyRound,
  DollarSign,
  Activity,
  FileCode2,
  X,
  ExternalLink,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

// --- Type Definitions ---
export type DeedStatus =
  | 'draft'
  | 'title_search'
  | 'tax_clearance'
  | 'notarization'
  | 'cadastral_audit'
  | 'recorded'
  | 'rejected';

export type PropertyType = 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Mixed-Use';

export interface Encumbrance {
  id: string;
  type: 'Mortgage Lien' | 'Municipal Tax Lien' | 'Easement' | 'Judicial Attachment' | 'HOA Covenant';
  holder: string;
  amount?: number;
  cleared: boolean;
  clearanceRef?: string;
}

export interface DeedRecord {
  id: string;
  apn: string; // Assessor's Parcel Number
  cadastralZone: string;
  propertyAddress: string;
  propertyType: PropertyType;
  parcelAreaSqFt: number;
  grantor: {
    name: string;
    taxId: string;
    entityType: 'Individual' | 'Trust' | 'Corporation' | 'LLC';
    verified: boolean;
  };
  grantee: {
    name: string;
    taxId: string;
    entityType: 'Individual' | 'Trust' | 'Corporation' | 'LLC';
    verified: boolean;
  };
  declaredValue: number;
  assessedValue: number;
  stampDutyCalculated: number;
  stampDutyPaid: boolean;
  stage: DeedStatus;
  encumbrances: Encumbrance[];
  submissionDate: string;
  recordedDate?: string;
  ledgerBlockHash?: string;
  notaryPublic: {
    commissionNumber: string;
    notaryName: string;
    sealApplied: boolean;
    digitalSignatureValid: boolean;
  };
  titleChainCleanScore: number; // 0-100%
  coordinates: [number, number];
}

export interface PipelineStageConfig {
  key: DeedStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  slaTargetHours: number;
}

// --- Constants & Config ---
const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    key: 'draft',
    label: 'Document Ingestion',
    icon: FileText,
    description: 'Initial deed document intake & grantor/grantee identity matching',
    slaTargetHours: 4,
  },
  {
    key: 'title_search',
    label: 'Chain of Title & Liens',
    icon: Scale,
    description: '40-year title lineage search & encumbrance scan',
    slaTargetHours: 24,
  },
  {
    key: 'tax_clearance',
    label: 'Valuation & Stamp Duty',
    icon: Landmark,
    description: 'Municipal tax assessment, transfer duty computation & escrow reconciliation',
    slaTargetHours: 12,
  },
  {
    key: 'notarization',
    label: 'Notary & Digital Escrow',
    icon: Stamp,
    description: 'Cryptographic remote notary attestation & biometric validation',
    slaTargetHours: 8,
  },
  {
    key: 'cadastral_audit',
    label: 'Cadastral Boundary Audit',
    icon: MapPin,
    description: 'GIS spatial overlay, zoning compliance & surveyor coordinates review',
    slaTargetHours: 16,
  },
  {
    key: 'recorded',
    label: 'Immutable Registry Recordation',
    icon: ShieldCheck,
    description: 'Final title issuance, county ledger commit & cryptographic block hash generation',
    slaTargetHours: 2,
  },
];

// Mock Initial Data
const INITIAL_DEEDS: DeedRecord[] = [
  {
    id: 'DEED-2025-0891',
    apn: 'APN-4491-002-881',
    cadastralZone: 'Sector 7B - Central District',
    propertyAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    propertyType: 'Residential',
    parcelAreaSqFt: 8450,
    grantor: {
      name: 'Eleanor Vance Trust',
      taxId: 'XX-XXX4910',
      entityType: 'Trust',
      verified: true,
    },
    grantee: {
      name: 'Marcus Sterling & Sarah Sterling (Joint Tenancy)',
      taxId: 'XX-XXX7721',
      entityType: 'Individual',
      verified: true,
    },
    declaredValue: 645000,
    assessedValue: 620000,
    stampDutyCalculated: 12900,
    stampDutyPaid: true,
    stage: 'title_search',
    encumbrances: [
      { id: 'ENC-01', type: 'Mortgage Lien', holder: 'First National Bank & Trust', amount: 310000, cleared: false },
      { id: 'ENC-02', type: 'Easement', holder: 'Springfield Power & Water Utility', cleared: true, clearanceRef: 'UTL-ESM-1988-92' }
    ],
    submissionDate: '2025-03-01 09:15',
    notaryPublic: {
      commissionNumber: 'NOT-OR-882914',
      notaryName: 'Arthur Pendelton, Esq.',
      sealApplied: true,
      digitalSignatureValid: true,
    },
    titleChainCleanScore: 84,
    coordinates: [44.0534, -122.9912],
  },
  {
    id: 'DEED-2025-0892',
    apn: 'APN-1102-993-014',
    cadastralZone: 'Metro Innovation Corridor Q4',
    propertyAddress: '1440 Industrial Parkway, Suite 300, Portland, OR 97201',
    propertyType: 'Industrial',
    parcelAreaSqFt: 42000,
    grantor: {
      name: 'Apex Logistics Holdings Inc.',
      taxId: 'XX-XXX1109',
      entityType: 'Corporation',
      verified: true,
    },
    grantee: {
      name: 'Cascade NextGen Warehousing LLC',
      taxId: 'XX-XXX9901',
      entityType: 'LLC',
      verified: true,
    },
    declaredValue: 4850000,
    assessedValue: 4720000,
    stampDutyCalculated: 97000,
    stampDutyPaid: true,
    stage: 'cadastral_audit',
    encumbrances: [
      { id: 'ENC-11', type: 'Mortgage Lien', holder: 'Global Commercial Credit S.A.', amount: 2100000, cleared: true, clearanceRef: 'REL-2025-448' },
      { id: 'ENC-12', type: 'HOA Covenant', holder: 'Metro Industrial Park Association', cleared: true }
    ],
    submissionDate: '2025-02-27 14:22',
    notaryPublic: {
      commissionNumber: 'NOT-OR-901142',
      notaryName: 'Helena Vance-Croft',
      sealApplied: true,
      digitalSignatureValid: true,
    },
    titleChainCleanScore: 98,
    coordinates: [45.5152, -122.6784],
  },
  {
    id: 'DEED-2025-0893',
    apn: 'APN-8820-112-409',
    cadastralZone: 'Highland Agricultural Reserve',
    propertyAddress: '8800 Old Vineyard Road, Carlton, OR 97111',
    propertyType: 'Agricultural',
    parcelAreaSqFt: 1306800, // 30 Acres
    grantor: {
      name: 'Robert & Teresa Dupont',
      taxId: 'XX-XXX3002',
      entityType: 'Individual',
      verified: true,
    },
    grantee: {
      name: 'Pinot Heritage Terroir LLC',
      taxId: 'XX-XXX4545',
      entityType: 'LLC',
      verified: true,
    },
    declaredValue: 2150000,
    assessedValue: 1980000,
    stampDutyCalculated: 43000,
    stampDutyPaid: false,
    stage: 'tax_clearance',
    encumbrances: [
      { id: 'ENC-20', type: 'Municipal Tax Lien', holder: 'Yamhill County Tax Collector', amount: 14200, cleared: false }
    ],
    submissionDate: '2025-02-28 11:00',
    notaryPublic: {
      commissionNumber: 'NOT-OR-732101',
      notaryName: 'David K. O’Reilly',
      sealApplied: false,
      digitalSignatureValid: false,
    },
    titleChainCleanScore: 71,
    coordinates: [45.2934, -123.1782],
  },
  {
    id: 'DEED-2025-0894',
    apn: 'APN-3301-444-210',
    cadastralZone: 'Riverfront Commercial Hub',
    propertyAddress: '220 Waterfront Esplanade, Eugene, OR 97401',
    propertyType: 'Commercial',
    parcelAreaSqFt: 18500,
    grantor: {
      name: 'Riverbank Properties LP',
      taxId: 'XX-XXX8812',
      entityType: 'Corporation',
      verified: true,
    },
    grantee: {
      name: 'Willamette Hospitality Partners',
      taxId: 'XX-XXX7331',
      entityType: 'LLC',
      verified: true,
    },
    declaredValue: 3400000,
    assessedValue: 3350000,
    stampDutyCalculated: 68000,
    stampDutyPaid: true,
    stage: 'recorded',
    encumbrances: [],
    submissionDate: '2025-02-24 10:15',
    recordedDate: '2025-02-26 16:40',
    ledgerBlockHash: '0x8f7a932bce12aa908df34991204cf09d9432e1814bfb2879a834e001cda84b12',
    notaryPublic: {
      commissionNumber: 'NOT-OR-991280',
      notaryName: 'Elena Rostova, J.D.',
      sealApplied: true,
      digitalSignatureValid: true,
    },
    titleChainCleanScore: 100,
    coordinates: [44.0521, -123.0868],
  },
  {
    id: 'DEED-2025-0895',
    apn: 'APN-9021-331-550',
    cadastralZone: 'Cascade Hills Zone C',
    propertyAddress: '104 Timberline Way, Bend, OR 97701',
    propertyType: 'Residential',
    parcelAreaSqFt: 12200,
    grantor: {
      name: 'Gregory Scott Harrison',
      taxId: 'XX-XXX6614',
      entityType: 'Individual',
      verified: false,
    },
    grantee: {
      name: 'Summit View Real Estate Trust',
      taxId: 'XX-XXX8829',
      entityType: 'Trust',
      verified: true,
    },
    declaredValue: 890000,
    assessedValue: 910000,
    stampDutyCalculated: 17800,
    stampDutyPaid: false,
    stage: 'draft',
    encumbrances: [
      { id: 'ENC-33', type: 'Judicial Attachment', holder: 'Deschutes Superior Court Judgment', amount: 89000, cleared: false }
    ],
    submissionDate: '2025-03-02 08:30',
    notaryPublic: {
      commissionNumber: 'NOT-OR-441092',
      notaryName: 'Marcus Wright',
      sealApplied: false,
      digitalSignatureValid: false,
    },
    titleChainCleanScore: 45,
    coordinates: [44.0582, -121.3153],
  }
];

export default function Pipeline35_DeedRegistrar() {
  const [deeds, setDeeds] = useState<DeedRecord[]>(INITIAL_DEEDS);
  const [selectedDeedId, setSelectedDeedId] = useState<string>(INITIAL_DEEDS[0].id);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewDeedModal, setShowNewDeedModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit_trail' | 'ledger' | 'spatial'>('overview');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Deed Form State
  const [newDeed, setNewDeed] = useState({
    apn: '',
    cadastralZone: 'Sector 7B - Central District',
    propertyAddress: '',
    propertyType: 'Residential' as PropertyType,
    parcelAreaSqFt: 5000,
    grantorName: '',
    grantorType: 'Individual' as const,
    granteeName: '',
    granteeType: 'Individual' as const,
    declaredValue: 400000,
  });

  const selectedDeed = useMemo(() => {
    return deeds.find((d) => d.id === selectedDeedId) || deeds[0];
  }, [deeds, selectedDeedId]);

  // Flash notification helper
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered deeds
  const filteredDeeds = useMemo(() => {
    return deeds.filter((deed) => {
      const matchesStage = filterStage === 'all' || deed.stage === filterStage;
      const matchesSearch =
        deed.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deed.apn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deed.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deed.grantor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deed.grantee.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [deeds, filterStage, searchTerm]);

  // Metrics
  const stats = useMemo(() => {
    const totalRecordedValue = deeds
      .filter((d) => d.stage === 'recorded')
      .reduce((sum, d) => sum + d.declaredValue, 0);

    const totalStampDutyCollected = deeds
      .filter((d) => d.stampDutyPaid)
      .reduce((sum, d) => sum + d.stampDutyCalculated, 0);

    const activeProcessing = deeds.filter((d) => d.stage !== 'recorded' && d.stage !== 'rejected').length;
    const encumberedCount = deeds.filter((d) => d.encumbrances.some((e) => !e.cleared)).length;

    return {
      totalRecordedValue,
      totalStampDutyCollected,
      activeProcessing,
      encumberedCount,
      totalCount: deeds.length,
    };
  }, [deeds]);

  // Advance deed to next pipeline stage
  const advanceStage = useCallback((deedId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setDeeds((prev) =>
        prev.map((deed) => {
          if (deed.id !== deedId) return deed;

          const stageOrder: DeedStatus[] = [
            'draft',
            'title_search',
            'tax_clearance',
            'notarization',
            'cadastral_audit',
            'recorded',
          ];
          const currentIndex = stageOrder.indexOf(deed.stage);

          if (currentIndex < stageOrder.length - 1) {
            const nextStage = stageOrder[currentIndex + 1];
            const updated = { ...deed, stage: nextStage };

            // Apply stage-specific synthetic resolutions
            if (nextStage === 'tax_clearance') {
              updated.stampDutyPaid = true;
            }
            if (nextStage === 'notarization') {
              updated.notaryPublic.sealApplied = true;
              updated.notaryPublic.digitalSignatureValid = true;
            }
            if (nextStage === 'recorded') {
              updated.recordedDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
              const randHash = Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
              ).join('');
              updated.ledgerBlockHash = `0x${randHash}`;
            }

            return updated;
          }
          return deed;
        })
      );
      setIsProcessing(false);
      triggerNotification(`Deed ${deedId} successfully advanced to next pipeline checkpoint.`);
    }, 600);
  }, []);

  // Clear single encumbrance
  const handleClearEncumbrance = (deedId: string, encId: string) => {
    setDeeds((prev) =>
      prev.map((deed) => {
        if (deed.id !== deedId) return deed;
        return {
          ...deed,
          encumbrances: deed.encumbrances.map((e) =>
            e.id === encId
              ? {
                  ...e,
                  cleared: true,
                  clearanceRef: `DISCH-${Date.now().toString().slice(-6)}`,
                }
              : e
          ),
          titleChainCleanScore: Math.min(100, deed.titleChainCleanScore + 15),
        };
      })
    );
    triggerNotification(`Lien encumbrance ${encId} discharged with legal reference.`);
  };

  // Submit New Deed
  const handleCreateDeed = (e: React.FormEvent) => {
    e.preventDefault();
    const stampRate = 0.02; // 2% tax rate
    const calculatedStamp = newDeed.declaredValue * stampRate;
    const generatedId = `DEED-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: DeedRecord = {
      id: generatedId,
      apn: newDeed.apn || `APN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`,
      cadastralZone: newDeed.cadastralZone,
      propertyAddress: newDeed.propertyAddress,
      propertyType: newDeed.propertyType,
      parcelAreaSqFt: Number(newDeed.parcelAreaSqFt),
      grantor: {
        name: newDeed.grantorName,
        taxId: `XX-XXX${Math.floor(1000 + Math.random() * 9000)}`,
        entityType: newDeed.grantorType,
        verified: true,
      },
      grantee: {
        name: newDeed.granteeName,
        taxId: `XX-XXX${Math.floor(1000 + Math.random() * 9000)}`,
        entityType: newDeed.granteeType,
        verified: true,
      },
      declaredValue: Number(newDeed.declaredValue),
      assessedValue: Number(newDeed.declaredValue) * 0.96,
      stampDutyCalculated: calculatedStamp,
      stampDutyPaid: false,
      stage: 'draft',
      encumbrances: [],
      submissionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notaryPublic: {
        commissionNumber: `NOT-OR-${Math.floor(100000 + Math.random() * 900000)}`,
        notaryName: 'Registry Default Notary Panel',
        sealApplied: false,
        digitalSignatureValid: false,
      },
      titleChainCleanScore: 92,
      coordinates: [44.0521 + (Math.random() - 0.5) * 0.1, -123.0868 + (Math.random() - 0.5) * 0.1],
    };

    setDeeds((prev) => [record, ...prev]);
    setSelectedDeedId(record.id);
    setShowNewDeedModal(false);
    triggerNotification(`New Deed Ingested: ${record.id}`);
  };

  const getStageBadgeColor = (stage: DeedStatus) => {
    switch (stage) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'title_search':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'tax_clearance':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'notarization':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
      case 'cadastral_audit':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
      case 'recorded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
            <Building className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">DeedRegistrar Pipeline</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Pipeline #35
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Cadastral Title Deed Verification, Lien Resolution & Blockchain County Ledger Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewDeedModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-amber-500/10 text-sm"
          >
            <Plus className="w-4 h-4" />
            Ingest Property Deed
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recorded Valuation</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              ${(stats.totalRecordedValue / 1_000_000).toFixed(2)}M
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Fully Registered Deeds
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Stamp Duty Cleared</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              ${stats.totalStampDutyCollected.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Direct county tax escrow</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Title Pipelines</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.activeProcessing}</h3>
            <p className="text-xs text-slate-400 mt-1">Across 5 check stages</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Encumbered Deeds</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats.encumberedCount}</h3>
            <p className="text-xs text-rose-300 mt-1">Pending lien discharge</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Main Grid: Explorer & Pipeline Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Side: Deed Selection List & Search */}
        <section className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                Deed Registry Ingestion Queue
              </span>
              <span className="text-xs text-slate-500 font-mono">Total: {deeds.length}</span>
            </div>

            {/* Search and Stage Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search APN, Address, Grantor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
              >
                <option value="all">All Stages</option>
                <option value="draft">Ingestion</option>
                <option value="title_search">Title Search</option>
                <option value="tax_clearance">Tax Clearance</option>
                <option value="notarization">Notarization</option>
                <option value="cadastral_audit">Cadastral Audit</option>
                <option value="recorded">Recorded</option>
              </select>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[600px] flex-1">
            {filteredDeeds.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No deeds found matching criteria.
              </div>
            ) : (
              filteredDeeds.map((deed) => {
                const isSelected = deed.id === selectedDeedId;
                const hasPendingEncumbrance = deed.encumbrances.some((e) => !e.cleared);

                return (
                  <button
                    key={deed.id}
                    onClick={() => setSelectedDeedId(deed.id)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-l-4 border-amber-500'
                        : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300">{deed.id}</span>
                        <span className="text-xs text-slate-400 font-mono">({deed.apn})</span>
                      </div>
                      <span
                        className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${getStageBadgeColor(
                          deed.stage
                        )}`}
                      >
                        {deed.stage.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-200 truncate">{deed.propertyAddress}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {deed.grantor.name} <span className="text-amber-500">➔</span> {deed.grantee.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Val: ${(deed.declaredValue).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        {hasPendingEncumbrance && (
                          <span className="flex items-center gap-1 text-rose-400 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Lien Alert
                          </span>
                        )}
                        <span className="font-mono text-[10px]">Score: {deed.titleChainCleanScore}%</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right Side: Selected Deed Deep Inspection & Pipeline Action Center */}
        <section className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {/* Action Header */}
          <div className="p-4 md:p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/90">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">{selectedDeed.id}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {selectedDeed.apn}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {selectedDeed.propertyType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {selectedDeed.propertyAddress}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedDeed.stage !== 'recorded' && selectedDeed.stage !== 'rejected' && (
                <button
                  disabled={isProcessing}
                  onClick={() => advanceStage(selectedDeed.id)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow shadow-emerald-600/20"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  Verify & Advance Stage
                </button>
              )}
            </div>
          </div>

          {/* Stepper Pipeline Visualization */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[580px] px-2">
              {PIPELINE_STAGES.map((stageItem, index) => {
                const stageOrder = [
                  'draft',
                  'title_search',
                  'tax_clearance',
                  'notarization',
                  'cadastral_audit',
                  'recorded',
                ];
                const currentIndex = stageOrder.indexOf(selectedDeed.stage);
                const isPassed = index < currentIndex;
                const isCurrent = index === currentIndex;
                const IconComponent = stageItem.icon;

                return (
                  <React.Fragment key={stageItem.key}>
                    <div className="flex flex-col items-center text-center max-w-[80px]">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          isPassed
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : isCurrent
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold ring-4 ring-amber-500/20 animate-pulse'
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <IconComponent className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-[10px] mt-2 font-medium leading-tight ${
                          isCurrent
                            ? 'text-amber-400 font-bold'
                            : isPassed
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {stageItem.label}
                      </span>
                    </div>

                    {index < PIPELINE_STAGES.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1.5 transition-colors ${
                          index < currentIndex ? 'bg-emerald-500/70' : 'bg-slate-800'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 px-4 bg-slate-900/40">
            {[
              { key: 'overview', label: 'Deed Parameters' },
              { key: 'audit_trail', label: 'Liens & Encumbrances' },
              { key: 'spatial', label: 'Cadastral & GIS' },
              { key: 'ledger', label: 'Cryptographic Ledger' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="p-5 overflow-y-auto flex-1 max-h-[500px]">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Parties involved */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grantor */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                      <span>Grantor (Current Titleholder)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {selectedDeed.grantor.entityType}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{selectedDeed.grantor.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                      <span>TIN: {selectedDeed.grantor.taxId}</span>
                      {selectedDeed.grantor.verified && (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Identity KYC Cleared
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grantee */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                      <span>Grantee (New Transferee)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {selectedDeed.grantee.entityType}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{selectedDeed.grantee.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                      <span>TIN: {selectedDeed.grantee.taxId}</span>
                      {selectedDeed.grantee.verified && (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Identity KYC Cleared
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial & Valuation Breakdown */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Fiscal Assessment & Stamp Duty
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-500">Declared Value</span>
                      <p className="text-sm font-bold text-slate-200">
                        ${selectedDeed.declaredValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Assessed Valuation</span>
                      <p className="text-sm font-bold text-slate-200">
                        ${selectedDeed.assessedValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Stamp Duty (2.0%)</span>
                      <p className="text-sm font-bold text-amber-400">
                        ${selectedDeed.stampDutyCalculated.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Duty Escrow Status</span>
                      <p
                        className={`text-xs font-semibold mt-0.5 inline-flex items-center gap-1 ${
                          selectedDeed.stampDutyPaid ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {selectedDeed.stampDutyPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Pending Payment
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notary Verification Block */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stamp className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Notary Seal & Attestation
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Assigned Notary: <span className="text-slate-200">{selectedDeed.notaryPublic.notaryName}</span> (
                      <span className="font-mono">{selectedDeed.notaryPublic.commissionNumber}</span>)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-mono border ${
                        selectedDeed.notaryPublic.sealApplied
                          ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      {selectedDeed.notaryPublic.sealApplied ? 'SEAL APPLIED' : 'SEAL PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT & LIENS TAB */}
            {activeTab === 'audit_trail' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Recorded Encumbrances & Claims
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      All identified financial liens, municipal attachments, and covenants.
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-500">Chain Integrity: </span>
                    <span
                      className={`font-bold ${
                        selectedDeed.titleChainCleanScore > 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {selectedDeed.titleChainCleanScore}%
                    </span>
                  </div>
                </div>

                {selectedDeed.encumbrances.length === 0 ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-emerald-300">Clean Title Chain</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No active liens, court orders, or unpaid taxes recorded on APN {selectedDeed.apn}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDeed.encumbrances.map((enc) => (
                      <div
                        key={enc.id}
                        className={`p-3.5 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                          enc.cleared
                            ? 'bg-slate-950/40 border-slate-800 opacity-70'
                            : 'bg-rose-950/20 border-rose-500/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-300">{enc.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300">
                              {enc.type}
                            </span>
                            {enc.cleared ? (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-3 h-3" /> Cleared
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-400 flex items-center gap-1 font-bold">
                                <AlertTriangle className="w-3 h-3" /> Active Obstruction
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1 font-medium">Claimant: {enc.holder}</p>
                          {enc.amount && (
                            <p className="text-xs text-slate-400 font-mono">
                              Claim Amount: ${(enc.amount).toLocaleString()}
                            </p>
                          )}
                          {enc.clearanceRef && (
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Release Ref: {enc.clearanceRef}
                            </p>
                          )}
                        </div>

                        {!enc.cleared && (
                          <button
                            onClick={() => handleClearEncumbrance(selectedDeed.id, enc.id)}
                            className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded transition whitespace-nowrap"
                          >
                            Discharge Lien
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SPATIAL / CADASTRAL TAB */}
            {activeTab === 'spatial' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Cadastral Boundary & GIS Overlay
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Zone: {selectedDeed.cadastralZone}</p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Area: {(selectedDeed.parcelAreaSqFt).toLocaleString()} sq ft
                  </div>
                </div>

                {/* Spatial Mockup Map Grid */}
                <div className="relative w-full h-56 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                  {/* Parcel Polygon Mock */}
                  <div className="relative z-10 w-48 h-32 border-2 border-amber-500/80 bg-amber-500/10 rounded flex flex-col items-center justify-center backdrop-blur-xs">
                    <span className="text-[11px] font-mono text-amber-300 font-bold">{selectedDeed.apn}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {selectedDeed.coordinates[0].toFixed(4)}°N, {selectedDeed.coordinates[1].toFixed(4)}°W
                    </span>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" /> Boundary Validated
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
                    Cadastral Engine v4.8 | WGS84 Datum
                  </div>
                </div>
              </div>
            )}

            {/* LEDGER TAB */}
            {activeTab === 'ledger' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Immutable County Title Ledger
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cryptographic record proof ensuring non-repudiation of property transfer.
                  </p>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-500">Record Hash (SHA-256):</span>
                    <p className="text-amber-400 break-all select-all mt-0.5 font-mono">
                      {selectedDeed.ledgerBlockHash || 'Pending Final Pipeline Recordation'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Submission Timestamp:</span>
                      <p className="text-slate-300">{selectedDeed.submissionDate} UTC</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Recording Timestamp:</span>
                      <p className="text-slate-300">{selectedDeed.recordedDate || 'In Processing'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500">Consensus Validator State:</span>
                    <p className="text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-4 h-4" /> 3 of 3 County Notary Nodes Confirmed
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Status bar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              County Recorder Authority Node #14
            </span>
            <span className="font-mono">SLA Status: Compliant</span>
          </div>
        </section>
      </div>

      {/* MODAL: Ingest New Deed */}
      {showNewDeedModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Ingest New Property Deed</h3>
              </div>
              <button
                onClick={() => setShowNewDeedModal(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeed} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">APN (Parcel Number)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APN-9982-100"
                    value={newDeed.apn}
                    onChange={(e) => setNewDeed({ ...newDeed, apn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Property Type</label>
                  <select
                    value={newDeed.propertyType}
                    onChange={(e) => setNewDeed({ ...newDeed, propertyType: e.target.value as PropertyType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Mixed-Use">Mixed-Use</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Property Legal Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Oak Ridge Boulevard, Eugene, OR"
                  value={newDeed.propertyAddress}
                  onChange={(e) => setNewDeed({ ...newDeed, propertyAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Grantor (Seller Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Gable"
                    value={newDeed.grantorName}
                    onChange={(e) => setNewDeed({ ...newDeed, grantorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Grantee (Buyer Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cynthia Adams"
                    value={newDeed.granteeName}
                    onChange={(e) => setNewDeed({ ...newDeed, granteeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Declared Transfer Value ($)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={newDeed.declaredValue}
                    onChange={(e) => setNewDeed({ ...newDeed, declaredValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Parcel Area (Sq Ft)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newDeed.parcelAreaSqFt}
                    onChange={(e) => setNewDeed({ ...newDeed, parcelAreaSqFt: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Estimated 2% Transfer Stamp Duty: ${(newDeed.declaredValue * 0.02).toLocaleString()}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewDeedModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-lg shadow-amber-500/10"
                >
                  Initialize Ingestion Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}