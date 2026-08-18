import React, { useState, useMemo } from 'react';
import {
  Search,
  User,
  FileText,
  History,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Download,
  ExternalLink,
  Plus,
  MapPin,
  Briefcase,
  DollarSign,
  CreditCard,
  Activity,
  Fingerprint,
  Globe,
  Cpu,
  FileCheck,
  UserCheck,
  ShieldCheck,
  Send,
  CornerDownRight,
  Sliders,
  Layers
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface AuditDetails {
  ipAddress: string;
  deviceFingerprint: string;
  operatingSystem: string;
  browser: string;
  location: string;
  submissionChannel: 'Web' | 'Mobile iOS' | 'Mobile Android' | 'Branch Portal';
  riskScore: number; // 0 to 100
  kycStatus: 'Passed' | 'Failed' | 'Pending' | 'Manual Review';
  amlStatus: 'Passed' | 'Failed' | 'Pending' | 'Warning';
  fraudScore: number; // 0 to 100
}

interface ApplicantDetails {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssnMasked: string;
  address: string;
  employmentStatus: string;
  employerName: string;
  annualIncome: number;
  monthlyHousingPayment: number;
}

interface ProductDetails {
  productName: string;
  productType: 'Checking' | 'Savings' | 'Credit Card' | 'Personal Loan' | 'Business Loan';
  requestedLimit?: number;
  interestRate?: string;
  termMonths?: number;
  features: string[];
}

interface ControlFlowStep {
  id: string;
  timestamp: string;
  stage: string;
  status: 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'IN_PROGRESS' | 'WARNING';
  actor: 'SYSTEM_RULE_ENGINE' | 'MANUAL_UNDERWRITER' | 'THIRD_PARTY_API' | 'APPLICANT';
  description: string;
  payloadDetails?: string;
}

interface Application {
  id: string;
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'PENDING_DOCUMENTS' | 'ESCALATED';
  createdAt: string;
  updatedAt: string;
  assignedUnderwriter: string;
  auditDetails: AuditDetails;
  applicantDetails: ApplicantDetails;
  productDetails: ProductDetails;
  controlFlowHistory: ControlFlowStep[];
}

// ==========================================
// MOCK DATA DATABASE
// ==========================================

const MOCK_APPLICATIONS: Record<string, Application> = {
  'APP-2024-8942': {
    id: 'APP-2024-8942',
    status: 'UNDER_REVIEW',
    createdAt: '2024-11-10 09:14:22 UTC',
    updatedAt: '2024-11-10 14:30:00 UTC',
    assignedUnderwriter: 'Sarah Jenkins (Risk Dept)',
    auditDetails: {
      ipAddress: '198.51.100.42',
      deviceFingerprint: 'dev_fp_9928a81bc882e1a',
      operatingSystem: 'macOS 14.1',
      browser: 'Chrome 119.0',
      location: 'Austin, TX, USA',
      submissionChannel: 'Web',
      riskScore: 34,
      kycStatus: 'Passed',
      amlStatus: 'Warning',
      fraudScore: 12,
    },
    applicantDetails: {
      fullName: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (512) 555-0192',
      dateOfBirth: '1988-04-14',
      ssnMasked: '***-**-8821',
      address: '1204 West Ave, Austin, TX 78701',
      employmentStatus: 'Full-Time',
      employerName: 'Apex Tech Solutions',
      annualIncome: 135000,
      monthlyHousingPayment: 2400,
    },
    productDetails: {
      productName: 'Signature Premium Checking & Line of Credit',
      productType: 'Checking',
      requestedLimit: 15000,
      interestRate: '14.24% APR',
      termMonths: 12,
      features: ['Zero ATM Fees Worldwide', 'Complimentary Lounge Access', 'Overdraft Protection up to $5,000'],
    },
    controlFlowHistory: [
      {
        id: 'step-1',
        timestamp: '2024-11-10 09:14:22 UTC',
        stage: 'Application Submission',
        status: 'COMPLETED',
        actor: 'APPLICANT',
        description: 'Application submitted via Web Portal.',
      },
      {
        id: 'step-2',
        timestamp: '2024-11-10 09:14:25 UTC',
        stage: 'Device Fingerprinting & Geo-IP Check',
        status: 'COMPLETED',
        actor: 'SYSTEM_RULE_ENGINE',
        description: 'IP location (Austin, TX) matches applicant address state. Device fingerprint verified.',
      },
      {
        id: 'step-3',
        timestamp: '2024-11-10 09:14:30 UTC',
        stage: 'Identity Verification (KYC)',
        status: 'COMPLETED',
        actor: 'THIRD_PARTY_API',
        description: 'SSN, DOB, and Name matched successfully via LexisNexis API.',
      },
      {
        id: 'step-4',
        timestamp: '2024-11-10 09:14:35 UTC',
        stage: 'AML & Sanctions Screening',
        status: 'WARNING',
        actor: 'THIRD_PARTY_API',
        description: 'Soft match found on OFAC PEP list for "Eleanor Vance". Requires manual review.',
      },
      {
        id: 'step-5',
        timestamp: '2024-11-10 09:15:00 UTC',
        stage: 'Automated Decision Engine',
        status: 'SKIPPED',
        actor: 'SYSTEM_RULE_ENGINE',
        description: 'Auto-approval bypassed due to AML Warning flag.',
      },
      {
        id: 'step-6',
        timestamp: '2024-11-10 10:02:15 UTC',
        stage: 'Underwriter Assignment',
        status: 'COMPLETED',
        actor: 'SYSTEM_RULE_ENGINE',
        description: 'Application routed to High-Value Tier queue. Assigned to Sarah Jenkins.',
      },
    ],
  },
  'APP-2024-1105': {
    id: 'APP-2024-1105',
    status: 'APPROVED',
    createdAt: '2024-11-09 11:22:01 UTC',
    updatedAt: '2024-11-09 11:25:12 UTC',
    assignedUnderwriter: 'Auto-Decision Engine',
    auditDetails: {
      ipAddress: '72.14.201.11',
      deviceFingerprint: 'dev_fp_1102b88cc112e4b',
      operatingSystem: 'iOS 17.2',
      browser: 'Safari Mobile',
      location: 'Seattle, WA, USA',
      submissionChannel: 'Mobile iOS',
      riskScore: 12,
      kycStatus: 'Passed',
      amlStatus: 'Passed',
      fraudScore: 3,
    },
    applicantDetails: {
      fullName: 'Marcus Chen',
      email: 'm.chen@cloudscale.io',
      phone: '+1 (206) 555-0143',
      dateOfBirth: '1991-09-30',
      ssnMasked: '***-**-4492',
      address: '405 Olive Way, Seattle, WA 98101',
      employmentStatus: 'Full-Time',
      employerName: 'CloudScale Technologies',
      annualIncome: 185000,
      monthlyHousingPayment: 3100,
    },
    productDetails: {
      productName: 'Elite Venture Credit Card',
      productType: 'Credit Card',
      requestedLimit: 25000,
      interestRate: '18.99% Variable APR',
      features: ['3x Points on Travel & Dining', 'No Foreign Transaction Fees', '$250 Annual Travel Credit'],
    },
    controlFlowHistory: [
      {
        id: 'step-1',
        timestamp: '2024-11-09 11:22:01 UTC',
        stage: 'Application Submission',
        status: 'COMPLETED',
        actor: 'APPLICANT',
        description: 'Application submitted via iOS Mobile App v4.2.',
      },
      {
        id: 'step-2',
        timestamp: '2024-11-09 11:22:05 UTC',
        stage: 'Device Fingerprinting & Geo-IP Check',
        status: 'COMPLETED',
        actor: 'SYSTEM_RULE_ENGINE',
        description: 'Device verified. IP matches billing address.',
      },
      {
        id: 'step-3',
        timestamp: '2024-11-09 11:23:10 UTC',
        stage: 'Identity Verification (KYC)',
        status: 'COMPLETED',
        actor: 'THIRD_PARTY_API',
        description: 'KYC Passed. High confidence match.',
      },
      {
        id: 'step-4',
        timestamp: '2024-11-09 11:23:15 UTC',
        stage: 'AML & Sanctions Screening',
        status: 'COMPLETED',
        actor: 'THIRD_PARTY_API',
        description: 'No matches found on global watchlists.',
      },
      {
        id: 'step-5',
        timestamp: '2024-11-09 11:24:00 UTC',
        stage: 'Credit Bureau Pull (Experian)',
        status: 'COMPLETED',
        actor: 'THIRD_PARTY_API',
        description: 'FICO Score retrieved: 795. Debt-to-Income ratio calculated at 18.2%.',
      },
      {
        id: 'step-6',
        timestamp: '2024-11-09 11:25:12 UTC',
        stage: 'Automated Decision Engine',
        status: 'COMPLETED',
        actor: 'SYSTEM_RULE_ENGINE',
        description: 'Application approved automatically based on Tier 1 credit profile.',
      },
    ],
  },
  'APP-2024-4491': {
    id: 'APP-2024-4491',
    status: 'REJECTED',
    createdAt: '2024-11-08 16:45:10 UTC',
    updatedAt: '2024-11-08 17:10:05 UTC',
    assignedUnderwriter: 'Marcus Brody (Fraud Unit)',
    auditDetails: {
      ipAddress: '185.220.101.5',
      deviceFingerprint: 'dev_fp_unknown_proxy',
      operatingSystem: 'Linux x86_64',
      browser: 'Firefox 115.0',
      location: 'Frankfurt, Germany (Tor Exit Node)',
      submissionChannel: 'Web',
      riskScore: 95,
      kycStatus: 'Failed',
      amlStatus: 'Warning',
      fraudScore: 98,
    },
    applicantDetails: {
      fullName: 'Johnathan Smith',
      email: 'jsmith_temp99@dispostable.com',
      phone: '+1 (900) 555-0100',
      dateOfBirth: '1975-12-12',
      ssnMasked: '***-**-0000',
      address: '123 Fake St, Springfield, OR 97477',
      employmentStatus: 'Unemployed',
      employerName: 'N/A',
      annualIncome: 450000,
      monthlyHousingPayment: 0,
    },
    productDetails: {
      productName: 'Unsecured Personal Loan',
      productType: 'Personal Loan',
      requestedLimit: 50000,
      interestRate: '24.99% APR',
      termMonths: 36,
      features: ['No Collateral Required', 'Fixed Monthly Payments'],
    },
    controlFlowHistory: [
      {
        id: 'step-1',
        timestamp: '2024-11-08 16:45:10 UTC',
        stage: 'Application Submission',
        status: 'COMPLETED',
        actor: 'APPLICANT',
        description: 'Application submitted via Web Portal.',
      },
      {
        id: 'step-2',
        timestamp: '2024-11-08 16:45:12 UTC',
        stage: 'Device Fingerprinting & Geo-IP Check',
        status: 'FAILED',
        actor: 'SYSTEM_RULE_ENGINE',
        description: 'High Risk Flag: Tor Exit Node detected. Device fingerprint spoofing suspected.',
      },
      {
        id: 'step-3',
        timestamp: '2024-11-08 16:45:15 UTC',
        stage: 'Identity Verification (KYC)',
        status: 'FAILED',
        actor: 'THIRD_PARTY_API',
        description: 'SSN does not match name and date of birth in credit bureau records.',
      },
      {
        id: 'step-4',
        timestamp: '2024-11-08 16:45:15 UTC',
        stage: 'Email & Phone Risk Assessment',
        status: 'FAILED',
        actor: 'THIRD_PARTY_API',
        description: 'Disposable email domain detected. Phone number is a non-fixed VoIP line.',
      },
      {
        id: 'step-5',
        timestamp: '2024-11-08 17:10:05 UTC',
        stage: 'Manual Fraud Review',
        status: 'COMPLETED',
        actor: 'MANUAL_UNDERWRITER',
        description: 'Application rejected due to high-confidence fraud indicators and failed identity verification.',
      },
    ],
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function OnboardingApplicationInquiry() {
  const [searchId, setSearchId] = useState('APP-2024-8942');
  const [activeAppId, setActiveAppId] = useState('APP-2024-8942');
  const [activeTab, setActiveTab] = useState<'overview' | 'applicant' | 'product' | 'history'>('overview');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Admin Notes State
  const [notes, setNotes] = useState<Record<string, string[]>>({
    'APP-2024-8942': [
      'Verified applicant employment via LinkedIn. Matches Apex Tech Solutions.',
      'Awaiting secondary AML clearance from Compliance Officer.',
    ],
    'APP-2024-1105': ['Auto-approved. Welcome package dispatched via FedEx.'],
    'APP-2024-4491': ['IP blacklisted. Reported to Fraud Prevention Network.'],
  });
  const [newNote, setNewNote] = useState('');

  // Action Modals / Simulation State
  const [currentApp, setCurrentApp] = useState<Application | null>(MOCK_APPLICATIONS['APP-2024-8942']);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim().toUpperCase();
    setIsSearching(true);
    setSearchError(null);

    setTimeout(() => {
      if (MOCK_APPLICATIONS[cleanId]) {
        setActiveAppId(cleanId);
        setCurrentApp(MOCK_APPLICATIONS[cleanId]);
        setIsSearching(false);
      } else {
        setSearchError(`No application found with ID "${cleanId}". Try APP-2024-8942, APP-2024-1105, or APP-2024-4491.`);
        setIsSearching(false);
      }
    }, 400);
  };

  // Quick Select Handler
  const handleQuickSelect = (id: string) => {
    setSearchId(id);
    setActiveAppId(id);
    setCurrentApp(MOCK_APPLICATIONS[id]);
    setSearchError(null);
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNotes((prev) => ({
      ...prev,
      [activeAppId]: [...(prev[activeAppId] || []), newNote.trim()],
    }));
    setNewNote('');
    showToast('Note added successfully', 'success');
  };

  // Simulate Status Change
  const handleStatusChange = (newStatus: Application['status']) => {
    if (!currentApp) return;
    const updatedApp = {
      ...currentApp,
      status: newStatus,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      controlFlowHistory: [
        {
          id: `step-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          stage: 'Manual Decision Override',
          status: newStatus === 'APPROVED' ? 'COMPLETED' : newStatus === 'REJECTED' ? 'FAILED' : 'WARNING',
          actor: 'MANUAL_UNDERWRITER',
          description: `Application status manually updated to ${newStatus} by active administrator session.`,
        },
        ...currentApp.controlFlowHistory,
      ],
    };
    setCurrentApp(updatedApp);
    showToast(`Application status updated to ${newStatus}`, 'success');
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Status Badge Helper
  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> REJECTED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> UNDER REVIEW
          </span>
        );
      case 'PENDING_DOCUMENTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3.5 h-3.5" /> PENDING DOCS
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5" /> ESCALATED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">ApexFlow Admin</h1>
              <p className="text-xs text-slate-500 font-medium">Onboarding Application Inquiry Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>System Status: <strong>Optimal</strong></span>
            </div>
            <div className="text-xs text-slate-600 font-medium bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
              Role: <span className="text-indigo-600 font-bold">Senior Underwriter</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast Notification */}
        {actionMessage && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all duration-300 ${
            actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            actionMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {actionMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {actionMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-600" />}
            {actionMessage.type === 'info' && <AlertTriangle className="w-5 h-5 text-blue-600" />}
            <span className="text-sm font-medium">{actionMessage.text}</span>
          </div>
        )}

        {/* Search & Quick Select Section */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-base font-bold text-slate-900 mb-1">Retrieve Onboarding Application</h2>
              <p className="text-xs text-slate-500">Enter a unique Application ID to pull real-time audit trails, KYC/AML checks, and control flow history.</p>
            </div>
            <div className="lg:col-span-7">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. APP-2024-8942"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Inquire'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {searchError && (
                <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {searchError}
                </p>
              )}
            </div>
          </div>

          {/* Quick Select Badges */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Quick Load:</span>
            {Object.keys(MOCK_APPLICATIONS).map((id) => (
              <button
                key={id}
                onClick={() => handleQuickSelect(id)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all border ${
                  activeAppId === id
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {id} ({MOCK_APPLICATIONS[id].applicantDetails.fullName.split(' ')[0]})
              </button>
            ))}
          </div>
        </section>

        {currentApp ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Main Application Details & Tabs */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Application Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-mono">
                          {currentApp.id}
                        </span>
                        {getStatusBadge(currentApp.status)}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {currentApp.applicantDetails.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Submitted on {currentApp.createdAt} • Assigned to <span className="font-semibold text-slate-700">{currentApp.assignedUnderwriter}</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange('APPROVED')}
                        disabled={currentApp.status === 'APPROVED'}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange('REJECTED')}
                        disabled={currentApp.status === 'REJECTED'}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange('ESCALATED')}
                        disabled={currentApp.status === 'ESCALATED'}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Escalate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 bg-slate-50/50 px-4">
                  {[
                    { id: 'overview', label: 'Audit & Risk Overview', icon: ShieldAlert },
                    { id: 'applicant', label: 'Applicant Details', icon: User },
                    { id: 'product', label: 'Product Details', icon: CreditCard },
                    { id: 'history', label: 'Control Flow History', icon: History },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all ${
                          activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Area */}
                <div className="p-6">
                  
                  {/* TAB 1: AUDIT & RISK OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Risk Score Meter */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Risk Score</span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className={`text-3xl font-extrabold ${
                                currentApp.auditDetails.riskScore > 70 ? 'text-rose-600' :
                                currentApp.auditDetails.riskScore > 30 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                                {currentApp.auditDetails.riskScore}/100
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                currentApp.auditDetails.riskScore > 70 ? 'bg-rose-500' :
                                currentApp.auditDetails.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${currentApp.auditDetails.riskScore}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fraud Score</span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className={`text-3xl font-extrabold ${
                                currentApp.auditDetails.fraudScore > 70 ? 'text-rose-600' :
                                currentApp.auditDetails.fraudScore > 30 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                                {currentApp.auditDetails.fraudScore}/100
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">Calculated via Sift Science & device fingerprinting.</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Channel</span>
                            <div className="flex items-center gap-2 mt-2 text-slate-800 font-bold text-base">
                              <Globe className="w-4 h-4 text-indigo-500" />
                              {currentApp.auditDetails.submissionChannel}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">Platform used to initiate onboarding.</p>
                        </div>
                      </div>

                      {/* Compliance Checks Grid */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Compliance & Verification Checks</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <UserCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">KYC Identity Verification</p>
                                <p className="text-[10px] text-slate-500">LexisNexis InstantID Match</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                              currentApp.auditDetails.kycStatus === 'Passed' ? 'bg-emerald-50 text-emerald-700' :
                              currentApp.auditDetails.kycStatus === 'Failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {currentApp.auditDetails.kycStatus}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">AML & Sanctions Screening</p>
                                <p className="text-[10px] text-slate-500">OFAC, PEP, & Watchlists</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                              currentApp.auditDetails.amlStatus === 'Passed' ? 'bg-emerald-50 text-emerald-700' :
                              currentApp.auditDetails.amlStatus === 'Warning' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {currentApp.auditDetails.amlStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Device & Network Metadata */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Device & Network Metadata</h4>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Fingerprint className="w-3.5 h-3.5 text-slate-400" /> Device Fingerprint
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-800">{currentApp.auditDetails.deviceFingerprint}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-slate-400" /> IP Address
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-800">{currentApp.auditDetails.ipAddress}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60 md:border-none">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-slate-400" /> Operating System
                            </span>
                            <span className="text-xs font-semibold text-slate-800">{currentApp.auditDetails.operatingSystem}</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Geo-IP Location
                            </span>
                            <span className="text-xs font-semibold text-slate-800">{currentApp.auditDetails.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: APPLICANT DETAILS */}
                  {activeTab === 'applicant' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Personal Information</h4>
                          <div className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Full Legal Name</p>
                              <p className="text-sm font-bold text-slate-800">{currentApp.applicantDetails.fullName}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</p>
                              <p className="text-sm font-bold text-slate-800">{currentApp.applicantDetails.dateOfBirth}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Tax ID / SSN (Masked)</p>
                              <p className="text-sm font-bold text-slate-800 font-mono">{currentApp.applicantDetails.ssnMasked}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact & Address */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact & Address</h4>
                          <div className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                {currentApp.applicantDetails.email}
                                <ExternalLink className="w-3 h-3 text-slate-400 cursor-pointer hover:text-indigo-600" />
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                              <p className="text-sm font-bold text-slate-800">{currentApp.applicantDetails.phone}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Residential Address</p>
                              <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {currentApp.applicantDetails.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financial & Employment Profile */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Financial & Employment Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> Employment
                            </p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{currentApp.applicantDetails.employmentStatus}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Employer</p>
                            <p className="text-sm font-bold text-slate-800 mt-1 truncate">{currentApp.applicantDetails.employerName}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Annual Income
                            </p>
                            <p className="text-sm font-bold text-slate-800 mt-1">
                              ${currentApp.applicantDetails.annualIncome.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Monthly Housing</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">
                              ${currentApp.applicantDetails.monthlyHousingPayment.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PRODUCT DETAILS */}
                  {activeTab === 'product' && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                              {currentApp.productDetails.productType.toUpperCase()}
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 mt-2">
                              {currentApp.productDetails.productName}
                            </h4>
                          </div>
                          <div className="text-right">
                            {currentApp.productDetails.requestedLimit && (
                              <>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Requested Limit</p>
                                <p className="text-2xl font-extrabold text-slate-900">
                                  ${currentApp.productDetails.requestedLimit.toLocaleString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Product Terms Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Interest Rate / APR</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">
                              {currentApp.productDetails.interestRate || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Term Length</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">
                              {currentApp.productDetails.termMonths ? `${currentApp.productDetails.termMonths} Months` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Collateral Type</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">Unsecured</p>
                          </div>
                        </div>
                      </div>

                      {/* Product Features */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Configured Product Features</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentApp.productDetails.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-lg">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="text-xs font-semibold text-slate-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CONTROL FLOW HISTORY */}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Execution Timeline</h4>
                        <span className="text-[10px] text-slate-500 font-medium">Showing all automated & manual state transitions</span>
                      </div>

                      {/* Timeline Component */}
                      <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-6">
                        {currentApp.controlFlowHistory.map((step, idx) => {
                          const isCompleted = step.status === 'COMPLETED';
                          const isFailed = step.status === 'FAILED';
                          const isWarning = step.status === 'WARNING';
                          const isSkipped = step.status === 'SKIPPED';

                          return (
                            <div key={step.id} className="relative">
                              {/* Timeline Node Icon */}
                              <span className={`absolute -left-[31px] top-0.5 rounded-full p-1 border-2 bg-white transition-all ${
                                isCompleted ? 'border-emerald-500 text-emerald-600' :
                                isFailed ? 'border-rose-500 text-rose-600' :
                                isWarning ? 'border-amber-500 text-amber-600' : 'border-slate-300 text-slate-400'
                              }`}>
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {isFailed && <XCircle className="w-3.5 h-3.5" />}
                                {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
                                {isSkipped && <Clock className="w-3.5 h-3.5" />}
                              </span>

                              {/* Timeline Content */}
                              <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                    {step.stage}
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      step.actor === 'SYSTEM_RULE_ENGINE' ? 'bg-indigo-50 text-indigo-700' :
                                      step.actor === 'MANUAL_UNDERWRITER' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {step.actor}
                                    </span>
                                  </h5>
                                  <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Sidebar Stats, Notes, Checklist */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Stats Panel */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Decision Checklist</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" /> Identity Verified
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> AML Watchlist Clear
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentApp.auditDetails.amlStatus === 'Warning' ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
                    }`}>
                      {currentApp.auditDetails.amlStatus === 'Warning' ? 'FLAGGED' : 'PASS'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" /> Device Risk Check
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentApp.auditDetails.fraudScore > 50 ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
                    }`}>
                      {currentApp.auditDetails.fraudScore > 50 ? 'HIGH RISK' : 'LOW RISK'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Internal Underwriter Notes</h3>
                
                {/* Notes List */}
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                  {(notes[activeAppId] || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notes added yet for this application.</p>
                  ) : (
                    notes[activeAppId].map((note, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                        <p className="text-xs text-slate-700 leading-relaxed">{note}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[9px] text-slate-400 font-semibold">
                          <User className="w-3 h-3" /> Senior Underwriter • Just now
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal audit note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Export / Audit Actions */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Export & Compliance Logs</h3>
                <p className="text-xs text-slate-500 mb-4">Download full cryptographic audit trails for regulatory compliance reporting.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => showToast('JSON Audit Trail downloaded successfully', 'success')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                  <button
                    onClick={() => showToast('PDF Underwriting Report generated', 'success')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Application Loaded</h3>
            <p className="text-sm text-slate-500 mt-1">Please search for a valid application ID above to begin inquiry.</p>
          </div>
        )}

      </main>
    </div>
  );
}