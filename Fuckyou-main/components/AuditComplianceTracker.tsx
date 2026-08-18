import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  ClipboardList,
  History,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  RefreshCw,
  Database,
  User,
  Download,
  FileText,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Statement {
  id: string;
  title: string;
  category: 'Data Privacy' | 'Access Control' | 'Network Security' | 'Incident Response' | 'System Integrity';
  description: string;
  status: 'Compliant' | 'Pending Review' | 'Non-Compliant';
  version: string;
  lastUpdated: string;
  owner: string;
  hash: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  resource: string;
  status: 'Success' | 'Failure' | 'Warning';
  hash: string;
  previousHash: string;
  details: string;
}

// --- UTILITY FUNCTIONS ---
const generateMockHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return '0x' + Math.abs(hash).toString(16).padStart(8, '0') + Math.random().toString(16).substring(2, 10);
};

// --- INITIAL MOCK DATA ---
const initialStatements: Statement[] = [
  {
    id: 'POL-001',
    title: 'Multi-Factor Authentication Policy',
    category: 'Access Control',
    description: 'All administrative and user accounts must have multi-factor authentication enabled for external access.',
    status: 'Compliant',
    version: '2.1',
    lastUpdated: '2024-03-10 09:30:00',
    owner: 'Security Operations',
    hash: '0x7f8c9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f'
  },
  {
    id: 'POL-002',
    title: 'Data Encryption at Rest',
    category: 'Data Privacy',
    description: 'All production databases containing personally identifiable information (PII) must be encrypted using AES-256.',
    status: 'Compliant',
    version: '1.4',
    lastUpdated: '2024-03-12 14:15:00',
    owner: 'Data Governance',
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  },
  {
    id: 'POL-003',
    title: 'Quarterly Access Review',
    category: 'Access Control',
    description: 'User access privileges to critical infrastructure must be reviewed and re-authorized every 90 days.',
    status: 'Pending Review',
    version: '3.0',
    lastUpdated: '2023-12-15 11:00:00',
    owner: 'IAM Team',
    hash: '0x9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a'
  },
  {
    id: 'POL-004',
    title: 'Incident Response Plan Execution',
    category: 'Incident Response',
    description: 'The incident response plan must be tested annually through tabletop exercises and updated accordingly.',
    status: 'Compliant',
    version: '2.0',
    lastUpdated: '2024-02-28 16:45:00',
    owner: 'SecOps Incident Team',
    hash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'
  },
  {
    id: 'POL-005',
    title: 'Continuous Vulnerability Scanning',
    category: 'Network Security',
    description: 'All external-facing assets must undergo weekly automated vulnerability scans with critical findings remediated within 48 hours.',
    status: 'Non-Compliant',
    version: '1.2',
    lastUpdated: '2024-03-14 08:00:00',
    owner: 'Vulnerability Management',
    hash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e'
  }
];

const initialLogs: AuditLog[] = [
  {
    id: 'LOG-101',
    timestamp: '2024-03-15 10:24:15',
    action: 'Policy Updated',
    user: 'admin@enterprise.com',
    resource: 'POL-002 (Data Encryption)',
    status: 'Success',
    hash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    previousHash: '0x7f8c9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
    details: 'Updated policy version to 1.4. Added specific clauses for cloud-native database encryption standards.'
  },
  {
    id: 'LOG-102',
    timestamp: '2024-03-15 09:15:00',
    action: 'Integrity Verification Run',
    user: 'system-agent-01',
    resource: 'All Policies Registry',
    status: 'Success',
    hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    previousHash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    details: 'Automated integrity check completed. 5/5 policies verified against ledger anchors.'
  },
  {
    id: 'LOG-103',
    timestamp: '2024-03-14 16:30:22',
    action: 'Policy Status Changed',
    user: 'compliance-officer@enterprise.com',
    resource: 'POL-005 (Vulnerability Scanning)',
    status: 'Warning',
    hash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
    previousHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    details: 'Status marked as Non-Compliant due to overdue remediation of critical vulnerability CVE-2024-1234.'
  },
  {
    id: 'LOG-104',
    timestamp: '2024-03-13 11:12:05',
    action: 'Unauthorized Access Attempt',
    user: 'unknown-external-ip',
    resource: 'POL-001 Configuration',
    status: 'Failure',
    hash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    previousHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
    details: 'Blocked unauthorized attempt to modify policy metadata from IP 198.51.100.42.'
  },
  {
    id: 'LOG-105',
    timestamp: '2024-03-12 14:20:00',
    action: 'New Policy Registered',
    user: 'security-director@enterprise.com',
    resource: 'POL-004 (Incident Response)',
    status: 'Success',
    hash: '0x0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    previousHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    details: 'Initial registration of Incident Response Plan Execution policy with SHA-256 anchor.'
  }
];

export default function AuditComplianceTracker() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'registry' | 'trail' | 'verify'>('dashboard');
  const [statements, setStatements] = useState<Statement[]>(initialStatements);
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  
  // Search & Filter States
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('All');
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState<string>('All');

  // New Statement Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Statement['category']>('Access Control');
  const [newDescription, setNewDescription] = useState('');
  const [newOwner, setNewOwner] = useState('');

  // Verification Simulation State
  const [selectedVerifyItem, setSelectedVerifyItem] = useState<{ type: 'statement' | 'log'; id: string } | null>(null);
  const [verificationProgress, setVerificationProgress] = useState<number>(-1); // -1: idle, 0-100: progress
  const [verificationSteps, setVerificationSteps] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);

  // Selected Log Detail Modal
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLog | null>(null);

  // --- HANDLERS ---
  const handleAddStatement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newOwner) return;

    const newId = `POL-${String(statements.length + 1).padStart(3, '0')}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const generatedHash = generateMockHash(newTitle + newDescription + newOwner + timestamp);

    const newStatement: Statement = {
      id: newId,
      title: newTitle,
      category: newCategory,
      description: newDescription,
      status: 'Pending Review',
      version: '1.0',
      lastUpdated: timestamp,
      owner: newOwner,
      hash: generatedHash
    };

    // Add to statements
    setStatements([newStatement, ...statements]);

    // Create audit log for this action
    const lastLog = logs[0];
    const logHash = generateMockHash(newId + timestamp + 'New Policy Registered');
    const newLog: AuditLog = {
      id: `LOG-${100 + logs.length + 1}`,
      timestamp,
      action: 'New Policy Registered',
      user: 'compliance-officer@enterprise.com',
      resource: `${newId} (${newTitle})`,
      status: 'Success',
      hash: logHash,
      previousHash: lastLog ? lastLog.hash : '0x0000000000000000000000000000000000000000000000000000000000000000',
      details: `Registered new compliance policy: ${newTitle}. Cryptographic anchor generated and stored.`
    };

    setLogs([newLog, ...logs]);

    // Reset form
    setNewTitle('');
    setNewCategory('Access Control');
    setNewDescription('');
    setNewOwner('');
    setShowAddModal(false);
  };

  const handleVerify = (type: 'statement' | 'log', id: string) => {
    setSelectedVerifyItem({ type, id });
    setVerificationProgress(0);
    setVerificationResult(null);
    setVerificationSteps([]);

    const steps = [
      'Initializing cryptographic verification engine...',
      'Retrieving local resource payload and metadata...',
      'Calculating SHA-256 hash of current state...',
      'Querying immutable ledger for anchored hash...',
      'Comparing local hash with ledger anchor...',
      'Verification complete.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setVerificationSteps(prev => [...prev, steps[currentStep]]);
        setVerificationProgress(Math.min(((currentStep + 1) / steps.length) * 100, 100));
        currentStep++;
      } else {
        clearInterval(interval);
        // Simulate verification outcome (mostly success, unless it's a simulated failure)
        // Let's make POL-005 fail verification if it's Non-Compliant to simulate a mismatch
        const isFailedSimulation = type === 'statement' && id === 'POL-005';
        setVerificationResult(isFailedSimulation ? 'failed' : 'success');
      }
    }, 600);
  };

  // --- MEMOIZED FILTERS ---
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.resource.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.id.toLowerCase().includes(logSearch.toLowerCase());
      
      const matchesStatus = logStatusFilter === 'All' || log.status === logStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, logSearch, logStatusFilter]);

  const filteredStatements = useMemo(() => {
    return statements.filter(stmt => {
      const matchesSearch = 
        stmt.title.toLowerCase().includes(registrySearch.toLowerCase()) ||
        stmt.description.toLowerCase().includes(registrySearch.toLowerCase()) ||
        stmt.id.toLowerCase().includes(registrySearch.toLowerCase());
      
      const matchesCategory = registryCategoryFilter === 'All' || stmt.category === registryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [statements, registrySearch, registryCategoryFilter]);

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const total = statements.length;
    const compliant = statements.filter(s => s.status === 'Compliant').length;
    const pending = statements.filter(s => s.status === 'Pending Review').length;
    const nonCompliant = statements.filter(s => s.status === 'Non-Compliant').length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

    return { total, compliant, pending, nonCompliant, complianceRate };
  }, [statements]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-white">VeriTrust</h1>
              <span className="text-xs text-slate-400">Audit & Compliance</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'registry'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Compliance Registry
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FileSearch className="h-4 w-4" />
              Log Retrieval
            </button>
            <button
              onClick={() => setActiveTab('trail')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'trail'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <History className="h-4 w-4" />
              Audit Trail
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'verify'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Lock className="h-4 w-4" />
              Integrity Verification
            </button>
          </nav>
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ledger Connected (Secured)
          </div>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            Node: 0x9f8e...7d6c
          </p>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white capitalize">
              {activeTab === 'verify' ? 'Integrity Verification' : activeTab === 'trail' ? 'Audit Trail' : activeTab === 'logs' ? 'Log Retrieval' : activeTab === 'registry' ? 'Compliance Registry' : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-slate-300">Block Height:</span>
              <span className="font-mono text-white font-semibold">#14,892</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm">
                CO
              </div>
              <span className="text-sm text-slate-300 font-medium">Compliance Officer</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* ==================== VIEW: DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-600/5 rounded-full -mr-6 -mt-6"></div>
                  <p className="text-sm text-slate-400 font-medium">Total Policies</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                    <ClipboardList className="h-3.5 w-3.5 text-indigo-400" />
                    Active in registry
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-600/5 rounded-full -mr-6 -mt-6"></div>
                  <p className="text-sm text-slate-400 font-medium">Compliance Rate</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.complianceRate}%</p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 mt-4">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {stats.compliant} of {stats.total} compliant
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-amber-600/5 rounded-full -mr-6 -mt-6"></div>
                  <p className="text-sm text-slate-400 font-medium">Pending Reviews</p>
                  <p className="text-3xl font-bold text-amber-400 mt-2">{stats.pending}</p>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mt-4">
                    <Clock className="h-3.5 w-3.5" />
                    Requires manual audit
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-rose-600/5 rounded-full -mr-6 -mt-6"></div>
                  <p className="text-sm text-slate-400 font-medium">Non-Compliant</p>
                  <p className="text-3xl font-bold text-rose-400 mt-2">{stats.nonCompliant}</p>
                  <div className="flex items-center gap-1.5 text-xs text-rose-400/80 mt-4">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Immediate action required
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Category Breakdown & Integrity Status */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Category Breakdown */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Compliance by Category</h3>
                    <div className="space-y-4">
                      {(['Access Control', 'Data Privacy', 'Network Security', 'Incident Response'] as const).map(cat => {
                        const catStatements = statements.filter(s => s.category === cat);
                        const compliantCat = catStatements.filter(s => s.status === 'Compliant').length;
                        const percentage = catStatements.length > 0 ? Math.round((compliantCat / catStatements.length) * 100) : 0;

                        return (
                          <div key={cat} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300 font-medium">{cat}</span>
                              <span className="text-slate-400">{compliantCat}/{catStatements.length} Compliant ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  percentage === 100 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cryptographic Integrity Status */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Cryptographic Integrity Status</h3>
                        <p className="text-xs text-slate-400 mt-1">Real-time verification of local registry against immutable ledger anchors.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('verify');
                          if (statements.length > 0) {
                            handleVerify('statement', statements[0].id);
                          }
                        }}
                        className="flex items-center gap-2 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Run Full Audit
                      </button>
                    </div>

                    <div className="space-y-3">
                      {statements.map(stmt => (
                        <div key={stmt.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800/80 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 bg-slate-800 rounded-md">
                              <FileText className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{stmt.title}</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">{stmt.hash}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              v{stmt.version}
                            </span>
                            {stmt.id === 'POL-005' ? (
                              <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                                <AlertTriangle className="h-3 w-3" />
                                Mismatch Risk
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <CheckCircle className="h-3 w-3" />
                                Anchored
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Recent Activity Feed */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col h-[580px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <button 
                      onClick={() => setActiveTab('logs')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View All <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {logs.slice(0, 5).map(log => (
                      <div key={log.id} className="relative pl-6 pb-4 border-l border-slate-800 last:pb-0">
                        {/* Timeline dot */}
                        <span className={`absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                          log.status === 'Success' ? 'bg-emerald-500' : log.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200">{log.action}</span>
                            <span className="text-[10px] text-slate-500">{log.timestamp.split(' ')[1]}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2">{log.details}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{log.hash}</span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400 truncate">{log.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW: COMPLIANCE REGISTRY ==================== */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search policies..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {/* Category Filter */}
                  <div className="relative">
                    <select
                      value={registryCategoryFilter}
                      onChange={(e) => setRegistryCategoryFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="Access Control">Access Control</option>
                      <option value="Data Privacy">Data Privacy</option>
                      <option value="Network Security">Network Security</option>
                      <option value="Incident Response">Incident Response</option>
                    </select>
                    <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Register Policy
                </button>
              </div>

              {/* Policy Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredStatements.map(stmt => (
                  <div key={stmt.id} className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                            {stmt.id}
                          </span>
                          <h3 className="text-lg font-semibold text-white mt-2">{stmt.title}</h3>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${
                          stmt.status === 'Compliant' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : stmt.status === 'Pending Review'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {stmt.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-400 leading-relaxed">{stmt.description}</p>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900 text-xs">
                        <div>
                          <span className="text-slate-500 block">Category</span>
                          <span className="text-slate-300 font-medium">{stmt.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Owner</span>
                          <span className="text-slate-300 font-medium">{stmt.owner}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Last Updated</span>
                          <span className="text-slate-300 font-medium">{stmt.lastUpdated}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Version</span>
                          <span className="text-slate-300 font-medium">v{stmt.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic Anchor Footer */}
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">Ledger Anchor Hash</span>
                        <span className="text-xs text-slate-400 font-mono truncate block">{stmt.hash}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('verify');
                          handleVerify('statement', stmt.id);
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors shrink-0"
                        title="Verify Integrity"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredStatements.length === 0 && (
                  <div className="col-span-full bg-slate-950 border border-slate-800 rounded-xl p-12 text-center">
                    <ClipboardList className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white">No policies found</h3>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== VIEW: LOG RETRIEVAL ==================== */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={logStatusFilter}
                      onChange={(e) => setLogStatusFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Success">Success</option>
                      <option value="Warning">Warning</option>
                      <option value="Failure">Failure</option>
                    </select>
                    <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Showing {filteredLogs.length} of {logs.length} logs
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Log ID</th>
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6">Action</th>
                        <th className="py-4 px-6">User</th>
                        <th className="py-4 px-6">Resource</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-6 font-mono text-xs text-indigo-400">{log.id}</td>
                          <td className="py-4 px-6 text-xs text-slate-400">{log.timestamp}</td>
                          <td className="py-4 px-6 font-medium text-white">{log.action}</td>
                          <td className="py-4 px-6 text-xs">{log.user}</td>
                          <td className="py-4 px-6 text-xs text-slate-400 max-w-[180px] truncate">{log.resource}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
                              log.status === 'Success' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : log.status === 'Warning'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setSelectedLogDetail(log)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 transition-colors"
                                title="View Details"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveTab('verify');
                                  handleVerify('log', log.id);
                                }}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 transition-colors"
                                title="Verify Cryptographic Hash"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            <FileSearch className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                            No matching logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW: AUDIT TRAIL ==================== */}
          {activeTab === 'trail' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Immutable Audit Trail</h3>
                <p className="text-sm text-slate-400">
                  This view displays the chronological chain of system events. Each event is cryptographically linked to the previous one, forming a tamper-evident ledger.
                </p>
              </div>

              {/* Timeline */}
              <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8">
                {logs.map((log, index) => (
                  <div key={log.id} className="relative">
                    {/* Timeline Node Icon */}
                    <span className="absolute left-[-45px] top-1 bg-slate-950 border-2 border-slate-800 h-8 w-8 rounded-full flex items-center justify-center text-indigo-400">
                      <Database className="h-4 w-4" />
                    </span>

                    {/* Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            Block #{14892 - index}
                          </span>
                          <h4 className="text-base font-semibold text-white mt-1">{log.action}</h4>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {log.timestamp}
                        </div>
                      </div>

                      {/* Details */}
                      <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                        {log.details}
                      </p>

                      {/* Cryptographic Linkage */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-mono">
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Previous Block Hash</span>
                          <span className="text-slate-400 truncate block" title={log.previousHash}>
                            {log.previousHash}
                          </span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Current Block Hash</span>
                          <span className="text-indigo-300 truncate block" title={log.hash}>
                            {log.hash}
                          </span>
                        </div>
                      </div>

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-900">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>Operator: {log.user}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Resource:</span>
                          <span className="text-slate-300">{log.resource}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== VIEW: INTEGRITY VERIFICATION ==================== */}
          {activeTab === 'verify' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Selector Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Select Resource for Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Statements Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Policies</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {statements.map(stmt => (
                        <button
                          key={stmt.id}
                          onClick={() => handleVerify('statement', stmt.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                            selectedVerifyItem?.type === 'statement' && selectedVerifyItem?.id === stmt.id
                              ? 'bg-indigo-600/10 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono text-indigo-400 block">{stmt.id}</span>
                            <span className="text-sm font-medium truncate block">{stmt.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logs Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Logs</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {logs.map(log => (
                        <button
                          key={log.id}
                          onClick={() => handleVerify('log', log.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                            selectedVerifyItem?.type === 'log' && selectedVerifyItem?.id === log.id
                              ? 'bg-indigo-600/10 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono text-indigo-400 block">{log.id}</span>
                            <span className="text-sm font-medium truncate block">{log.action}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Console */}
              {selectedVerifyItem && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Verification Console</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Target: {selectedVerifyItem.type.toUpperCase()} - {selectedVerifyItem.id}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {verificationProgress >= 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Cryptographic Hash Comparison</span>
                        <span className="text-indigo-400">{Math.round(verificationProgress)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${verificationProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Console Output */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2 min-h-[180px] flex flex-col justify-between">
                    <div className="space-y-1.5">
                      {verificationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-indigo-500 shrink-0">&gt;</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Final Result Seal */}
                    {verificationResult && (
                      <div className={`mt-4 p-4 rounded-lg border flex items-center gap-4 animate-fadeIn ${
                        verificationResult === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {verificationResult === 'success' ? (
                          <>
                            <CheckCircle className="h-8 w-8 shrink-0" />
                            <div>
                              <h4 className="font-bold text-sm uppercase tracking-wider">Integrity Verified</h4>
                              <p className="text-xs text-slate-300 mt-0.5">
                                Local state matches the immutable ledger anchor. No tampering detected.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-8 w-8 shrink-0" />
                            <div>
                              <h4 className="font-bold text-sm uppercase tracking-wider">Verification Failed</h4>
                              <p className="text-xs text-slate-300 mt-0.5">
                                Local state hash does not match the anchored ledger hash. Potential unauthorized modification.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleVerify(selectedVerifyItem.type, selectedVerifyItem.id)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Re-run Verification
                    </button>
                  </div>
                </div>
              )}

              {!selectedVerifyItem && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center">
                  <ShieldCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white">No resource selected</h3>
                  <p className="text-sm text-slate-400 mt-1">Select a policy or log above to run cryptographic verification.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ==================== MODAL: REGISTER NEW POLICY ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Register New Compliance Policy</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStatement} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Policy Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Data Retention Policy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Statement['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Access Control">Access Control</option>
                    <option value="Data Privacy">Data Privacy</option>
                    <option value="Network Security">Network Security</option>
                    <option value="Incident Response">Incident Response</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner / Department</label>
                  <input
                    type="text"
                    required
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    placeholder="e.g., IT Security"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the compliance requirements and scope..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Registering this policy will automatically compute a SHA-256 hash of its contents and anchor it to the immutable ledger.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Register & Anchor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: LOG DETAILS ==================== */}
      {selectedLogDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {selectedLogDetail.id}
                </span>
                <h3 className="text-lg font-semibold text-white mt-1">Audit Log Details</h3>
              </div>
              <button 
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Action */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Action</span>
                  <span className="text-base font-semibold text-white">{selectedLogDetail.action}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  selectedLogDetail.status === 'Success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : selectedLogDetail.status === 'Warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {selectedLogDetail.status}
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Timestamp</span>
                  <span className="text-slate-300 font-medium">{selectedLogDetail.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Operator</span>
                  <span className="text-slate-300 font-medium">{selectedLogDetail.user}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Target Resource</span>
                  <span className="text-slate-300 font-medium">{selectedLogDetail.resource}</span>
                </div>
              </div>

              {/* Details Text */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 block">Event Details</span>
                <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {selectedLogDetail.details}
                </p>
              </div>

              {/* Cryptographic Hashes */}
              <div className="space-y-3 pt-4 border-t border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Previous Block Hash</span>
                  <span className="text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 block truncate">
                    {selectedLogDetail.previousHash}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Current Block Hash</span>
                  <span className="text-indigo-300 bg-slate-950 p-2 rounded border border-slate-800 block truncate">
                    {selectedLogDetail.hash}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedLogDetail(null);
                  setActiveTab('verify');
                  handleVerify('log', selectedLogDetail.id);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify Integrity
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}