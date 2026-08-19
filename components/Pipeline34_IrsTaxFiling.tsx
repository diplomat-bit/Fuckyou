

// --- CONSOLIDATED FROM: ./pipelines/Pipeline34_IrsTaxFiling.tsx ---

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  User,
  DollarSign,
  Receipt,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Download,
  RefreshCw,
  Sliders,
  Cpu,
  AlertCircle,
  FileCode,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  Lock,
  Eye,
  KeyRound
} from 'lucide-react';

export type FormType = '1040' | '1040-SR' | '1120' | '1120-S' | '1065' | '990' | '1099-NEC' | 'W-2';
export type FilingStatus = 
  | 'Draft' 
  | 'Data_Validated' 
  | 'Ready_For_Signature' 
  | 'Signed_8879' 
  | 'MeF_Packaged' 
  | 'Transmitted' 
  | 'IRS_Accepted' 
  | 'IRS_Rejected' 
  | 'Under_Audit_Review';

export interface MeFError {
  code: string;
  category: 'Schema' | 'Business Rule' | 'TIN Mismatch' | 'AGI Discrepancy';
  message: string;
  fieldPath: string;
  severity: 'Fatal' | 'Warning';
}

export interface TaxFilingRecord {
  id: string;
  submissionId: string;
  taxpayerName: string;
  taxpayerType: 'Individual' | 'Business' | 'Non-Profit';
  tinMasked: string; // SSN or EIN masked
  taxYear: number;
  formType: FormType;
  filingStatus: FilingStatus;
  totalIncome: number;
  taxableIncome: number;
  refundOrDue: number; // positive = refund, negative = tax due
  eFilePinVerified: boolean;
  mefTransmissionDate?: string;
  irsAckDate?: string;
  dcnTrackingNumber: string;
  errors: MeFError[];
  xmlPayloadPreview: string;
  auditScoreRisk: 'Low' | 'Medium' | 'High';
  preparerId: string;
  stateFilings: { state: string; status: 'Accepted' | 'Transmitted' | 'Pending' }[];
}

const INITIAL_TAX_FILINGS: TaxFilingRecord[] = [
  {
    id: 'TXF-2024-001',
    submissionId: '202404151040US0009841',
    taxpayerName: 'Sterling Vance Enterprises LLC',
    taxpayerType: 'Business',
    tinMasked: 'XX-XXX8921',
    taxYear: 2023,
    formType: '1120-S',
    filingStatus: 'IRS_Accepted',
    totalIncome: 1450000,
    taxableIncome: 382400,
    refundOrDue: -42150,
    eFilePinVerified: true,
    mefTransmissionDate: '2024-03-12 14:22:01 EST',
    irsAckDate: '2024-03-12 16:48:33 EST',
    dcnTrackingNumber: 'DCN-24-1120S-99381',
    errors: [],
    auditScoreRisk: 'Low',
    preparerId: 'CPA-7729-NY',
    stateFilings: [
      { state: 'NY', status: 'Accepted' },
      { state: 'CA', status: 'Accepted' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader binaryAttachmentCnt="0">
    <TaxYear>2023</TaxYear>
    <TaxPeriodEndDate>2023-12-31</TaxPeriodEndDate>
    <Filer>
      <EIN>XX-XXX8921</EIN>
      <BusinessName><BusinessNameLine1Txt>STERLING VANCE ENTERPRISES LLC</BusinessNameLine1Txt></BusinessName>
    </Filer>
  </ReturnHeader>
  <ReturnData documentCnt="4">
    <IRS1120S documentId="DOC0001">
      <GrossReceiptsOrSalesAmt>1450000</GrossReceiptsOrSalesAmt>
      <OrdinaryBusinessIncomeAmt>382400</OrdinaryBusinessIncomeAmt>
    </IRS1120S>
  </ReturnData>
</Return>`
  },
  {
    id: 'TXF-2024-002',
    submissionId: '202404151040US0009842',
    taxpayerName: 'Dr. Evelyn Martinez',
    taxpayerType: 'Individual',
    tinMasked: 'XXX-XX-4412',
    taxYear: 2023,
    formType: '1040',
    filingStatus: 'IRS_Rejected',
    totalIncome: 285400,
    taxableIncome: 241000,
    refundOrDue: 6840,
    eFilePinVerified: true,
    mefTransmissionDate: '2024-04-01 09:15:00 EST',
    irsAckDate: '2024-04-01 09:32:10 EST',
    dcnTrackingNumber: 'DCN-24-1040-10294',
    errors: [
      {
        code: 'IND-031-04',
        category: 'AGI Discrepancy',
        message: 'Prior Year Adjusted Gross Income (AGI) or Prior Year Self-Select PIN does not match IRS master records.',
        fieldPath: 'ReturnHeader/Filer/PrimaryPriorYearAGIAmt',
        severity: 'Fatal'
      },
      {
        code: 'R0000-500-01',
        category: 'Business Rule',
        message: 'Dependent SSN was already claimed on another return filed for this tax period.',
        fieldPath: 'IRS1040/DependentDetail[1]/SSN',
        severity: 'Fatal'
      }
    ],
    auditScoreRisk: 'High',
    preparerId: 'CPA-4411-TX',
    stateFilings: [
      { state: 'TX', status: 'Pending' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader>
    <TaxYear>2023</TaxYear>
    <Filer>
      <PrimarySSN>XXX-XX-4412</PrimarySSN>
      <NameLine1Txt>EVELYN MARTINEZ</NameLine1Txt>
      <PrimaryPriorYearAGIAmt>265000</PrimaryPriorYearAGIAmt>
    </Filer>
  </ReturnHeader>
</Return>`
  },
  {
    id: 'TXF-2024-003',
    submissionId: '202404151040US0009843',
    taxpayerName: 'Apex Quantum Technologies Inc',
    taxpayerType: 'Business',
    tinMasked: 'XX-XXX5510',
    taxYear: 2023,
    formType: '1120',
    filingStatus: 'Transmitted',
    totalIncome: 18900000,
    taxableIncome: 4200000,
    refundOrDue: -882000,
    eFilePinVerified: true,
    mefTransmissionDate: '2024-04-14 18:30:00 EST',
    dcnTrackingNumber: 'DCN-24-1120-00918',
    errors: [],
    auditScoreRisk: 'Medium',
    preparerId: 'CPA-9012-IL',
    stateFilings: [
      { state: 'IL', status: 'Transmitted' },
      { state: 'DE', status: 'Transmitted' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader>
    <TaxYear>2023</TaxYear>
    <Filer><EIN>XX-XXX5510</EIN><BusinessName><BusinessNameLine1Txt>APEX QUANTUM TECH INC</BusinessNameLine1Txt></BusinessName></Filer>
  </ReturnHeader>
  <ReturnData documentCnt="12">
    <IRS1120 documentId="DOC_1120_MAIN">
      <TaxableIncomeAmt>4200000</TaxableIncomeAmt>
      <TotalTaxAmt>882000</TotalTaxAmt>
    </IRS1120>
  </ReturnData>
</Return>`
  },
  {
    id: 'TXF-2024-004',
    submissionId: '202404151040US0009844',
    taxpayerName: 'Global Wildlife Hope Foundation',
    taxpayerType: 'Non-Profit',
    tinMasked: 'XX-XXX1109',
    taxYear: 2023,
    formType: '990',
    filingStatus: 'Signed_8879',
    totalIncome: 3400000,
    taxableIncome: 0,
    refundOrDue: 0,
    eFilePinVerified: true,
    dcnTrackingNumber: 'DCN-24-990-48201',
    errors: [],
    auditScoreRisk: 'Low',
    preparerId: 'EA-1182-DC',
    stateFilings: [
      { state: 'DC', status: 'Pending' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader><TaxYear>2023</TaxYear><Filer><EIN>XX-XXX1109</EIN><BusinessName><BusinessNameLine1Txt>GLOBAL WILDLIFE HOPE</BusinessNameLine1Txt></BusinessName></Filer></ReturnHeader>
</Return>`
  },
  {
    id: 'TXF-2024-005',
    submissionId: '202404151040US0009845',
    taxpayerName: 'Marcus & Chloe Davenport',
    taxpayerType: 'Individual',
    tinMasked: 'XXX-XX-7819',
    taxYear: 2023,
    formType: '1040',
    filingStatus: 'Data_Validated',
    totalIncome: 142000,
    taxableIncome: 114300,
    refundOrDue: 3420,
    eFilePinVerified: false,
    dcnTrackingNumber: 'DCN-24-1040-77112',
    errors: [
      {
        code: 'W2-004-WARN',
        category: 'Schema',
        message: 'Employer Box 12 Code D exceeds 401(k) statutory elective deferral maximum threshold.',
        fieldPath: 'IRS1040/W2Detail[0]/Box12CodeD',
        severity: 'Warning'
      }
    ],
    auditScoreRisk: 'Low',
    preparerId: 'CPA-7729-NY',
    stateFilings: [
      { state: 'NY', status: 'Pending' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader><TaxYear>2023</TaxYear><Filer><PrimarySSN>XXX-XX-7819</PrimarySSN></Filer></ReturnHeader>
</Return>`
  },
  {
    id: 'TXF-2024-006',
    submissionId: '202404151040US0009846',
    taxpayerName: 'Highline Logistics Partners LP',
    taxpayerType: 'Business',
    tinMasked: 'XX-XXX3002',
    taxYear: 2023,
    formType: '1065',
    filingStatus: 'IRS_Accepted',
    totalIncome: 8750000,
    taxableIncome: 1200000,
    refundOrDue: 0,
    eFilePinVerified: true,
    mefTransmissionDate: '2024-03-14 11:10:25 EST',
    irsAckDate: '2024-03-14 12:40:02 EST',
    dcnTrackingNumber: 'DCN-24-1065-55921',
    errors: [],
    auditScoreRisk: 'Low',
    preparerId: 'CPA-3391-WA',
    stateFilings: [
      { state: 'WA', status: 'Accepted' },
      { state: 'OR', status: 'Accepted' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader><TaxYear>2023</TaxYear><Filer><EIN>XX-XXX3002</EIN></Filer></ReturnHeader>
</Return>`
  },
  {
    id: 'TXF-2024-007',
    submissionId: '202404151040US0009847',
    taxpayerName: 'Arthur Pendelton',
    taxpayerType: 'Individual',
    tinMasked: 'XXX-XX-9144',
    taxYear: 2023,
    formType: '1040-SR',
    filingStatus: 'Under_Audit_Review',
    totalIncome: 92000,
    taxableIncome: 54000,
    refundOrDue: 1850,
    eFilePinVerified: true,
    mefTransmissionDate: '2024-04-10 10:00:00 EST',
    dcnTrackingNumber: 'DCN-24-1040SR-19823',
    errors: [
      {
        code: 'AUD-FLAG-01',
        category: 'Business Rule',
        message: 'Charitable deduction percentage is higher than 55% of AGI without Schedule 8283 appraisal attached.',
        fieldPath: 'IRS1040ScheduleA/GiftsToCharityAmt',
        severity: 'Fatal'
      }
    ],
    auditScoreRisk: 'High',
    preparerId: 'EA-9910-FL',
    stateFilings: [
      { state: 'FL', status: 'Pending' }
    ],
    xmlPayloadPreview: `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://www.irs.gov/efile" returnVersion="2023v5.0">
  <ReturnHeader><TaxYear>2023</TaxYear></ReturnHeader>
</Return>`
  }
];

export default function Pipeline34_IrsTaxFiling() {
  const [filings, setFilings] = useState<TaxFilingRecord[]>(INITIAL_TAX_FILINGS);
  const [selectedFilingId, setSelectedFilingId] = useState<string>(INITIAL_TAX_FILINGS[0].id);
  const [activeTab, setActiveTab] = useState<'filings' | 'mef_transmitter' | 'diagnostics' | 'audit_sla'>('filings');
  const [searchTerm, setSearchTerm] = useState('');
  const [formFilter, setFormFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isTransmittingBatch, setIsTransmittingBatch] = useState(false);
  const [transmissionLog, setTransmissionLog] = useState<string[]>([]);
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [show8879Modal, setShow8879Modal] = useState(false);
  const [signaturePinInput, setSignaturePinInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'xml' | 'errors' | 'states' | 'dcn'>('xml');

  const selectedFiling = useMemo(() => {
    return filings.find(f => f.id === selectedFilingId) || filings[0];
  }, [filings, selectedFilingId]);

  const filteredFilings = useMemo(() => {
    return filings.filter(f => {
      const matchSearch = 
        f.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.tinMasked.toLowerCase().includes(searchTerm.toLowerCase());
      const matchForm = formFilter === 'ALL' || f.formType === formFilter;
      const matchStatus = statusFilter === 'ALL' || f.filingStatus === statusFilter;
      return matchSearch && matchForm && matchStatus;
    });
  }, [filings, searchTerm, formFilter, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filings.length;
    const accepted = filings.filter(f => f.filingStatus === 'IRS_Accepted').length;
    const rejected = filings.filter(f => f.filingStatus === 'IRS_Rejected').length;
    const pendingTrans = filings.filter(f => ['Ready_For_Signature', 'Signed_8879', 'MeF_Packaged'].includes(f.filingStatus)).length;
    const transmitted = filings.filter(f => f.filingStatus === 'Transmitted').length;
    
    const totalRefunds = filings.reduce((acc, curr) => curr.refundOrDue > 0 ? acc + curr.refundOrDue : acc, 0);
    const totalOwed = filings.reduce((acc, curr) => curr.refundOrDue < 0 ? acc + Math.abs(curr.refundOrDue) : acc, 0);
    const acceptanceRate = total > 0 ? ((accepted / (accepted + rejected || 1)) * 100).toFixed(1) : '100';

    return { total, accepted, rejected, pendingTrans, transmitted, totalRefunds, totalOwed, acceptanceRate };
  }, [filings]);

  // Trigger MeF batch transmission simulation
  const handleBatchTransmit = () => {
    setIsTransmittingBatch(true);
    setTransmissionLog(['[INIT] Authenticating with IRS Modernized e-File (MeF) Gateway...', '[AUTH] ETIN & Digital Certificate 2048-bit RSA Verified.']);
    
    setTimeout(() => {
      setTransmissionLog(prev => [...prev, '[PKG] Compressing SOAP with MTOM attachment payloads...', '[SCHEMA] Executing TIGTA schema XSD validation... Passed.']);
    }, 1000);

    setTimeout(() => {
      setTransmissionLog(prev => [...prev, '[GATEWAY] Establishing TLS 1.3 socket to mef.irs.gov:443...', '[ACK] HTTP 200 OK: IRS A2A Message ID received.']);
      
      // Update any 'Signed_8879' or 'MeF_Packaged' to 'Transmitted'
      setFilings(prevFilings =>
        prevFilings.map(item => {
          if (['Signed_8879', 'MeF_Packaged'].includes(item.filingStatus)) {
            return {
              ...item,
              filingStatus: 'Transmitted',
              mefTransmissionDate: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EST'
            };
          }
          return item;
        })
      );
      setIsTransmittingBatch(false);
    }, 2400);
  };

  // Sign Form 8879 with PIN
  const handleSignForm8879 = () => {
    if (!signaturePinInput || signaturePinInput.length !== 5) {
      alert('Please enter a valid 5-digit Self-Select E-File PIN');
      return;
    }
    setFilings(prev =>
      prev.map(f => {
        if (f.id === selectedFiling.id) {
          return {
            ...f,
            eFilePinVerified: true,
            filingStatus: 'Signed_8879'
          };
        }
        return f;
      })
    );
    setShow8879Modal(false);
    setSignaturePinInput('');
  };

  // Re-run MeF pre-flight validation
  const handleRevalidateReturn = (filingId: string) => {
    setFilings(prev =>
      prev.map(f => {
        if (f.id === filingId) {
          // Clear fatal errors for simulation demo
          return {
            ...f,
            filingStatus: 'Data_Validated',
            errors: []
          };
        }
        return f;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      {/* Top Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                IRS Modernized e-File (MeF) Pipeline
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Tax Year 2023/2024 Active
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                A2A Automated Transmission, Schema Diagnostics & Electronic Signature (Form 8879) Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleBatchTransmit()}
            disabled={isTransmittingBatch}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border border-emerald-400/30"
          >
            <Send className={`h-4 w-4 ${isTransmittingBatch ? 'animate-spin' : ''}`} />
            {isTransmittingBatch ? 'Transmitting to MeF...' : 'Batch Transmit to IRS'}
          </button>
          <button
            onClick={() => alert('Diagnostic integrity check completed. All schema XSDs updated to version 2023v5.1.')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Gateway
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Filings</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 1040, 1120, 1065</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>IRS Accepted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{stats.accepted}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">{stats.acceptanceRate}% ACK rate</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Rejected / Action</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{stats.rejected}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Requires correction</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In Transmission</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{stats.transmitted + stats.pendingTrans}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting IRS Gateway ACK</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Refunds</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            ${(stats.totalRefunds / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct Deposit / Check</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Taxes Payable</span>
            <DollarSign className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-400">
            ${(stats.totalOwed / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">EFTPS Scheduled</div>
        </div>
      </div>

      {/* MeF Funnel Progress Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-400" />
          IRS Transmission Funnel Stages
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {[
            { stage: '1. Data Intake', count: filings.filter(f => f.filingStatus === 'Draft').length, color: 'border-slate-700 text-slate-300' },
            { stage: '2. Schema Validated', count: filings.filter(f => f.filingStatus === 'Data_Validated').length, color: 'border-blue-500/40 text-blue-400' },
            { stage: '3. PIN Signed (8879)', count: filings.filter(f => f.filingStatus === 'Signed_8879').length, color: 'border-indigo-500/40 text-indigo-400' },
            { stage: '4. MeF Transmitted', count: filings.filter(f => f.filingStatus === 'Transmitted').length, color: 'border-amber-500/40 text-amber-400' },
            { stage: '5. IRS Accepted', count: filings.filter(f => f.filingStatus === 'IRS_Accepted').length, color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' },
            { stage: '6. Audits / Rejections', count: filings.filter(f => ['IRS_Rejected', 'Under_Audit_Review'].includes(f.filingStatus)).length, color: 'border-rose-500/40 text-rose-400 bg-rose-500/5' }
          ].map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-lg border bg-slate-900/90 flex flex-col justify-between ${item.color}`}>
              <span className="text-[11px] font-medium opacity-80">{item.stage}</span>
              <span className="text-lg font-bold mt-1">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('filings')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'filings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Filing Queue & Master Detail
        </button>
        <button
          onClick={() => setActiveTab('mef_transmitter')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'mef_transmitter'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="h-4 w-4" />
          A2A MeF Gateway Hub
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'diagnostics'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Schema & Rule Diagnostics
          {stats.rejected > 0 && (
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-semibold px-1.5 py-0.2 rounded-full border border-rose-500/30">
              {stats.rejected}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('audit_sla')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'audit_sla'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Audit Scores & SLA Metrics
        </button>
      </div>

      {/* Tab 1: Filings Queue & Master Detail */}
      {activeTab === 'filings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List & Filters */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Taxpayer, SSN/EIN, Submission ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 text-xs">
                <select
                  value={formFilter}
                  onChange={(e) => setFormFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Forms</option>
                  <option value="1040">Form 1040</option>
                  <option value="1040-SR">Form 1040-SR</option>
                  <option value="1120">Form 1120 (C-Corp)</option>
                  <option value="1120-S">Form 1120-S (S-Corp)</option>
                  <option value="1065">Form 1065 (Partnership)</option>
                  <option value="990">Form 990 (Tax-Exempt)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IRS_Accepted">IRS Accepted</option>
                  <option value="IRS_Rejected">IRS Rejected</option>
                  <option value="Transmitted">Transmitted</option>
                  <option value="Signed_8879">Signed (8879)</option>
                  <option value="Data_Validated">Validated</option>
                  <option value="Under_Audit_Review">Audit Review</option>
                </select>
              </div>
            </div>

            {/* Filing Cards List */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredFilings.map((filing) => {
                const isSelected = filing.id === selectedFiling.id;
                let statusBadge = (
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-400">
                    {filing.filingStatus}
                  </span>
                );

                if (filing.filingStatus === 'IRS_Accepted') {
                  statusBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      IRS Accepted
                    </span>
                  );
                } else if (filing.filingStatus === 'IRS_Rejected') {
                  statusBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      IRS Rejected
                    </span>
                  );
                } else if (filing.filingStatus === 'Transmitted') {
                  statusBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Transmitted
                    </span>
                  );
                } else if (filing.filingStatus === 'Signed_8879') {
                  statusBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      8879 Signed
                    </span>
                  );
                } else if (filing.filingStatus === 'Under_Audit_Review') {
                  statusBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Audit Review
                    </span>
                  );
                }

                return (
                  <div
                    key={filing.id}
                    onClick={() => setSelectedFilingId(filing.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {filing.taxpayerType === 'Individual' ? (
                          <User className="h-4 w-4 text-sky-400" />
                        ) : (
                          <Building className="h-4 w-4 text-indigo-400" />
                        )}
                        <span className="text-sm font-semibold text-white">
                          {filing.taxpayerName}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        Form {filing.formType}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>TIN: <span className="text-slate-300 font-mono">{filing.tinMasked}</span></span>
                      <span>TY: <span className="text-slate-300 font-semibold">{filing.taxYear}</span></span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div>
                        {filing.refundOrDue >= 0 ? (
                          <span className="text-xs font-semibold text-emerald-400">
                            +${filing.refundOrDue.toLocaleString()} (Refund)
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-400">
                            -${Math.abs(filing.refundOrDue).toLocaleString()} (Due)
                          </span>
                        )}
                      </div>
                      {statusBadge}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed View of Selected Return */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedFiling.taxpayerName}</h2>
                    <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                      Form {selectedFiling.formType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    MeF Submission ID: <span className="font-mono text-slate-300">{selectedFiling.submissionId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedFiling.eFilePinVerified && (
                    <button
                      onClick={() => setShow8879Modal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 transition-colors"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Sign Form 8879
                    </button>
                  )}
                  {selectedFiling.filingStatus === 'IRS_Rejected' && (
                    <button
                      onClick={() => handleRevalidateReturn(selectedFiling.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Clear & Revalidate
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">TIN / EIN</div>
                  <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">{selectedFiling.tinMasked}</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Total Income</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${selectedFiling.totalIncome.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Taxable Income</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${selectedFiling.taxableIncome.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-medium">Refund / Balance</div>
                  <div className={`text-sm font-bold mt-0.5 ${selectedFiling.refundOrDue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedFiling.refundOrDue >= 0 ? `+$${selectedFiling.refundOrDue.toLocaleString()}` : `-$${Math.abs(selectedFiling.refundOrDue).toLocaleString()}`}
                  </div>
                </div>
              </div>

              {/* Subtabs: XML MeF Payload, Errors, State Filings */}
              <div className="flex border-b border-slate-800 mb-3 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveSubTab('xml')}
                  className={`pb-2 border-b-2 ${
                    activeSubTab === 'xml'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MeF XML Schema Payload
                </button>
                <button
                  onClick={() => setActiveSubTab('errors')}
                  className={`pb-2 border-b-2 flex items-center gap-1 ${
                    activeSubTab === 'errors'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Diagnostic Errors
                  {selectedFiling.errors.length > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 px-1 rounded-full text-[10px]">
                      {selectedFiling.errors.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveSubTab('states')}
                  className={`pb-2 border-b-2 ${
                    activeSubTab === 'states'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  State Filings ({selectedFiling.stateFilings.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('dcn')}
                  className={`pb-2 border-b-2 ${
                    activeSubTab === 'dcn'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Audit & DCN Logs
                </button>
              </div>

              {/* Subtab Contents */}
              {activeSubTab === 'xml' && (
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-300 p-3.5 rounded-lg text-xs font-mono overflow-x-auto max-h-64 border border-slate-800">
                    {selectedFiling.xmlPayloadPreview}
                  </pre>
                  <button
                    onClick={() => setShowXmlModal(true)}
                    className="absolute top-2 right-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> Expand
                  </button>
                </div>
              )}

              {activeSubTab === 'errors' && (
                <div className="space-y-2">
                  {selectedFiling.errors.length === 0 ? (
                    <div className="p-6 bg-slate-950 rounded-lg text-center border border-slate-800">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-300">Clean Pre-flight Verification</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">No IRS schema or business rule rejections detected.</p>
                    </div>
                  ) : (
                    selectedFiling.errors.map((err, i) => (
                      <div key={i} className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-400 font-mono">
                            [{err.code}] {err.category}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300">
                            {err.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1">{err.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">Target: {err.fieldPath}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSubTab === 'states' && (
                <div className="space-y-2">
                  {selectedFiling.stateFilings.map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-200">
                          {st.state}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">Department of Revenue E-File</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        st.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeSubTab === 'dcn' && (
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Declaration Control # (DCN):</span>
                    <span className="font-mono font-bold text-slate-200">{selectedFiling.dcnTrackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certified Preparer PTIN/EFIN:</span>
                    <span className="font-mono text-slate-200">{selectedFiling.preparerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Form 8879 E-Signature PIN:</span>
                    <span className={`font-mono ${selectedFiling.eFilePinVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedFiling.eFilePinVerified ? 'Verified & Stored' : 'Pending Client Signature'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IRS Transmission Timestamp:</span>
                    <span className="text-slate-300">{selectedFiling.mefTransmissionDate || 'Not Transmitted Yet'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IRS Acknowledgment Timestamp:</span>
                    <span className="text-slate-300">{selectedFiling.irsAckDate || 'Awaiting ACK'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Audit Risk Index:</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  selectedFiling.auditScoreRisk === 'Low'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedFiling.auditScoreRisk === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {selectedFiling.auditScoreRisk} Risk
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Exporting IRS Form ${selectedFiling.formType} archive with attachments.`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Archive (.zip)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: A2A MeF Gateway Hub */}
      {activeTab === 'mef_transmitter' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-400" />
                IRS Automated A2A Gateway Hub
              </h2>
              <p className="text-xs text-slate-400">
                Direct Application-to-Application (A2A) SOAP/MTOM secure pipeline with IRS Modernized e-File servers.
              </p>
            </div>
            <button
              onClick={handleBatchTransmit}
              disabled={isTransmittingBatch}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg border border-emerald-400/30 transition-all flex items-center gap-2"
            >
              <Cpu className={`h-4 w-4 ${isTransmittingBatch ? 'animate-spin' : ''}`} />
              {isTransmittingBatch ? 'Executing MeF Socket Session...' : 'Execute Live MeF Batch'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Gateway Endpoint</div>
              <div className="text-sm font-mono text-emerald-400 mt-1">https://la.alt.www4.irs.gov/a2a/mef</div>
              <div className="text-[11px] text-slate-500 mt-2">Protocol: SOAP 1.2 with MTOM Attachments</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">EFIN / ETIN Credentials</div>
              <div className="text-sm font-mono text-slate-200 mt-1">ETIN: 54912 | EFIN: 110944</div>
              <div className="text-[11px] text-emerald-400 mt-2">● Digital Cert: Active (Exp: 2026-12)</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Last Transmission Batch</div>
              <div className="text-sm font-mono text-slate-200 mt-1">BATCH-2024-04-15-0982</div>
              <div className="text-[11px] text-slate-400 mt-2">Avg Roundtrip ACK: 18.4 mins</div>
            </div>
          </div>

          {/* Live Console Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                MeF Gateway Live Communication Console
              </span>
              <button
                onClick={() => setTransmissionLog([])}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear Log
              </button>
            </div>
            <div className="font-mono text-xs text-slate-300 space-y-1.5 max-h-52 overflow-y-auto">
              <p className="text-slate-500">[INFO] Ready for SOAP package transmission.</p>
              {transmissionLog.map((log, index) => (
                <p key={index} className="text-emerald-400">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Diagnostics & Rules Engine */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              IRS Business Rule & Schema Validator
            </h2>
            <p className="text-xs text-slate-400">
              Pre-flight validation matrix for XSD schemas, TIN mismatch detection, and AGI rollover checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Active Validation Schema Versions
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Form 1040 Individual</span>
                  <span className="font-mono text-emerald-400">2023v5.1 (Released 2024-01)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Form 1120 / 1120-S Corporate</span>
                  <span className="font-mono text-emerald-400">2023v4.0 (Released 2023-12)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Form 1065 Partnership</span>
                  <span className="font-mono text-emerald-400">2023v3.2 (Released 2024-01)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Form 990 Tax-Exempt Org</span>
                  <span className="font-mono text-emerald-400">2023v2.9 (Released 2023-11)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                Common IRS Error Code Quick Reference
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-rose-400">IND-031-04:</span> Prior Year AGI or PIN mismatch.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-rose-400">R0000-500-01:</span> SSN previously utilized in tax year.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-rose-400">F1120-001:</span> Principal Business Activity code invalid.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Scores & SLA Metrics */}
      {activeTab === 'audit_sla' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              IRS Service Level Agreements & Risk Index
            </h2>
            <p className="text-xs text-slate-400">
              Turnaround performance, Direct Deposit settlement forecasts, and DIF score audit projections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Average MeF Ack Time</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">14.2 min</div>
              <p className="text-[11px] text-slate-500 mt-1">Benchmark target &lt; 30 mins</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">First-Time Acceptance Rate</div>
              <div className="text-2xl font-bold text-sky-400 mt-1">94.8%</div>
              <p className="text-[11px] text-slate-500 mt-1">Industry standard: 88.5%</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Avg Refund Settlement</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">11.4 Days</div>
              <p className="text-[11px] text-slate-500 mt-1">Via IRS Direct Deposit (EFT)</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full XML Inspector */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">IRS MeF XML Structure Inspector</h3>
              </div>
              <button
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-y-auto flex-1 border border-slate-800">
              {selectedFiling.xmlPayloadPreview}
            </pre>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowXmlModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Form 8879 E-Signature PIN */}
      {show8879Modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Form 8879 Signature Authorization</h3>
              </div>
              <button
                onClick={() => setShow8879Modal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter the 5-digit Self-Select E-File PIN authorized by <span className="font-semibold text-white">{selectedFiling.taxpayerName}</span>.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                5-Digit E-File Signature PIN
              </label>
              <input
                type="password"
                maxLength={5}
                placeholder="•••••"
                value={signaturePinInput}
                onChange={(e) => setSignaturePinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-slate-400 border border-slate-800">
              By submitting this PIN, you certify under penalty of perjury that the taxpayer has signed IRS Form 8879.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShow8879Modal(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSignForm8879}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg"
              >
                Authorize & Seal Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}