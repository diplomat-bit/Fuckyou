import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Search,
  Filter,
  Plus,
  Layers,
  Users,
  Key,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  X,
  ExternalLink,
  RefreshCw,
  Lock,
  FileText,
  Sliders,
  Database,
  UserCheck,
  HelpCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Permission {
  name: string;
  type: 'Delegated' | 'Application';
  classification: 'High' | 'Medium' | 'Low';
  description: string;
}

interface ClientSecret {
  id: string;
  name: string;
  created: string;
  expires: string;
  status: 'Active' | 'Expired' | 'Expiring Soon';
}

interface AppOwner {
  name: string;
  email: string;
  role: string;
}

interface AuditLog {
  timestamp: string;
  action: string;
  actor: string;
  status: 'Success' | 'Failure';
}

interface Application {
  id: string;
  name: string;
  clientId: string;
  objectId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  riskLevel: 'High' | 'Medium' | 'Low';
  consentType: 'Admin' | 'User' | 'None';
  createdDate: string;
  lastSignIn: string;
  redirectUris: string[];
  permissions: Permission[];
  secrets: ClientSecret[];
  owners: AppOwner[];
  auditLogs: AuditLog[];
}

// --- INITIAL MOCK DATA ---
const INITIAL_APPLICATIONS: Application[] = [
  {
    id: '1',
    name: 'Salesforce SSO Connector',
    clientId: '4a8b9c0d-1234-5678-90ab-cdef12345678',
    objectId: '9f8e7d6c-5678-1234-abcd-ef0123456789',
    status: 'Active',
    riskLevel: 'Low',
    consentType: 'Admin',
    createdDate: '2023-01-15',
    lastSignIn: '2024-11-03 09:14:22',
    redirectUris: ['https://login.salesforce.com/services/oauth2/callback'],
    permissions: [
      { name: 'User.Read', type: 'Delegated', classification: 'Low', description: 'Sign in and read user profile' },
      { name: 'email', type: 'Delegated', classification: 'Low', description: 'View users email address' }
    ],
    secrets: [
      { id: 'sec-1', name: 'Prod Secret Key', created: '2023-01-15', expires: '2025-01-15', status: 'Active' }
    ],
    owners: [
      { name: 'Sarah Jenkins', email: 'sjenkins@enterprise.com', role: 'Global Admin' }
    ],
    auditLogs: [
      { timestamp: '2024-11-03 09:14:22', action: 'User Sign-in', actor: 'm.ross@enterprise.com', status: 'Success' },
      { timestamp: '2024-10-28 14:05:11', action: 'Consent Granted', actor: 'admin.audit@enterprise.com', status: 'Success' }
    ]
  },
  {
    id: '2',
    name: 'Graph Explorer Sandbox',
    clientId: '7f6e5d4c-8765-4321-fedc-ba9876543210',
    objectId: '1a2b3c4d-4321-8765-0123-456789abcdef',
    status: 'Active',
    riskLevel: 'Medium',
    consentType: 'User',
    createdDate: '2023-06-20',
    lastSignIn: '2024-11-02 16:45:00',
    redirectUris: ['https://developer.microsoft.com/en-us/graph/graph-explorer'],
    permissions: [
      { name: 'User.ReadWrite', type: 'Delegated', classification: 'Medium', description: 'Read and update user profile' },
      { name: 'Mail.Read', type: 'Delegated', classification: 'Medium', description: 'Read user mail' },
      { name: 'Files.Read.All', type: 'Delegated', classification: 'Medium', description: 'Read all files the signed-in user can access' }
    ],
    secrets: [],
    owners: [
      { name: 'Alex Rivera', email: 'arivera@enterprise.com', role: 'Developer' }
    ],
    auditLogs: [
      { timestamp: '2024-11-02 16:45:00', action: 'User Sign-in', actor: 'arivera@enterprise.com', status: 'Success' },
      { timestamp: '2024-11-01 11:20:05', action: 'Permission Requested', actor: 'arivera@enterprise.com', status: 'Success' }
    ]
  },
  {
    id: '3',
    name: 'Legacy Mail Archiver',
    clientId: '9a8b7c6d-5555-4444-3333-222211110000',
    objectId: '00001111-2222-3333-4444-555566667777',
    status: 'Inactive',
    riskLevel: 'High',
    consentType: 'Admin',
    createdDate: '2021-03-10',
    lastSignIn: '2024-08-12 23:59:59',
    redirectUris: ['http://legacy-archive.internal/callback', 'https://*.wildcard-exploit.com/auth'],
    permissions: [
      { name: 'Mail.ReadWrite.All', type: 'Application', classification: 'High', description: 'Read and write mail in all mailboxes without a signed-in user' },
      { name: 'Directory.ReadWrite.All', type: 'Application', classification: 'High', description: 'Read and write directory data' }
    ],
    secrets: [
      { id: 'sec-2', name: 'Legacy Secret 1', created: '2021-03-10', expires: '2023-03-10', status: 'Expired' },
      { id: 'sec-3', name: 'Legacy Secret 2', created: '2023-03-01', expires: '2024-11-30', status: 'Expiring Soon' }
    ],
    owners: [
      { name: 'Orphaned Account', email: 'unknown@enterprise.com', role: 'Former Employee' }
    ],
    auditLogs: [
      { timestamp: '2024-08-12 23:59:59', action: 'Background Sync', actor: 'Service Principal', status: 'Success' },
      { timestamp: '2024-08-12 23:55:00', action: 'Token Request', actor: 'Service Principal', status: 'Failure' }
    ]
  },
  {
    id: '4',
    name: 'Slack Enterprise Suite',
    clientId: '1b2c3d4e-9999-8888-7777-666655554444',
    objectId: '55554444-6666-7777-8888-999900001111',
    status: 'Active',
    riskLevel: 'Low',
    consentType: 'Admin',
    createdDate: '2022-09-05',
    lastSignIn: '2024-11-03 10:00:15',
    redirectUris: ['https://slack.com/signin/find'],
    permissions: [
      { name: 'User.Read.All', type: 'Delegated', classification: 'Medium', description: 'Read all users full profiles' },
      { name: 'Group.Read.All', type: 'Delegated', classification: 'Medium', description: 'Read all groups' }
    ],
    secrets: [
      { id: 'sec-4', name: 'Slack API Key', created: '2022-09-05', expires: '2025-09-05', status: 'Active' }
    ],
    owners: [
      { name: 'Sarah Jenkins', email: 'sjenkins@enterprise.com', role: 'Global Admin' }
    ],
    auditLogs: [
      { timestamp: '2024-11-03 10:00:15', action: 'User Sign-in', actor: 'j.doe@enterprise.com', status: 'Success' }
    ]
  },
  {
    id: '5',
    name: 'HR Portal Sync Tool',
    clientId: 'e1d2c3b4-1111-2222-3333-444455556666',
    objectId: '66665555-4444-3333-2222-11110000aaaa',
    status: 'Active',
    riskLevel: 'High',
    consentType: 'Admin',
    createdDate: '2023-11-01',
    lastSignIn: '2024-11-03 08:30:00',
    redirectUris: ['https://hr-portal.enterprise.com/oauth/callback'],
    permissions: [
      { name: 'User.ReadWrite.All', type: 'Application', classification: 'High', description: 'Read and write all users full profiles' },
      { name: 'Directory.Read.All', type: 'Application', classification: 'High', description: 'Read directory data' }
    ],
    secrets: [
      { id: 'sec-5', name: 'HR Sync Secret', created: '2023-11-01', expires: '2024-11-01', status: 'Expired' }
    ],
    owners: [
      { name: 'David Miller', email: 'dmiller@enterprise.com', role: 'HR IT Lead' }
    ],
    auditLogs: [
      { timestamp: '2024-11-03 08:30:00', action: 'Directory Sync', actor: 'Service Principal', status: 'Success' },
      { timestamp: '2024-11-02 08:30:00', action: 'Directory Sync', actor: 'Service Principal', status: 'Success' }
    ]
  },
  {
    id: '6',
    name: 'Zoom Video Scheduler',
    clientId: 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a3f2e1d0c',
    objectId: '0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f',
    status: 'Suspended',
    riskLevel: 'Medium',
    consentType: 'None',
    createdDate: '2022-05-14',
    lastSignIn: '2024-05-10 14:22:10',
    redirectUris: ['https://zoom.us/oauth/signin'],
    permissions: [
      { name: 'Calendars.ReadWrite', type: 'Delegated', classification: 'Medium', description: 'Read and write user calendars' }
    ],
    secrets: [],
    owners: [
      { name: 'Unassigned', email: 'admin@enterprise.com', role: 'System' }
    ],
    auditLogs: [
      { timestamp: '2024-05-10 14:22:10', action: 'App Suspended', actor: 'sec-ops@enterprise.com', status: 'Success' }
    ]
  }
];

export default function AzureADAppAuditor() {
  // --- STATE ---
  const [apps, setApps] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'compliance' | 'register'>('dashboard');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Simulation Form State
  const [simAppName, setSimAppName] = useState('');
  const [simRedirectUri, setSimRedirectUri] = useState('');
  const [simConsentType, setSimConsentType] = useState<'Admin' | 'User' | 'None'>('User');
  const [simPermissions, setSimPermissions] = useState<string[]>([]);
  const [simSecretExpiry, setSimSecretExpiry] = useState('1year');
  const [simOwnerName, setSimOwnerName] = useState('');
  const [simOwnerEmail, setSimOwnerEmail] = useState('');

  // --- FILTER LOGIC ---
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.clientId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesConsent = consentFilter === 'all' || app.consentType === consentFilter;
      const matchesRisk = riskFilter === 'all' || app.riskLevel === riskFilter;

      return matchesSearch && matchesStatus && matchesConsent && matchesRisk;
    });
  }, [apps, searchTerm, statusFilter, consentFilter, riskFilter]);

  // --- KPI CALCULATIONS ---
  const kpis = useMemo(() => {
    const total = apps.length;
    const highRisk = apps.filter((a) => a.riskLevel === 'High').length;
    const adminConsented = apps.filter((a) => a.consentType === 'Admin').length;
    const inactive = apps.filter((a) => a.status === 'Inactive' || a.status === 'Suspended').length;
    return { total, highRisk, adminConsented, inactive };
  }, [apps]);

  // --- COMPLIANCE AUDIT RULES ---
  const complianceRules = useMemo(() => {
    return [
      {
        id: 'rule-1',
        name: 'No Wildcard Redirect URIs',
        description: 'Redirect URIs must not contain wildcards (*) to prevent token leakage.',
        severity: 'High' as const,
        evaluator: (app: Application) => !app.redirectUris.some((uri) => uri.includes('*')),
        remediation: 'Update the application registration to use exact, fully qualified domain names.'
      },
      {
        id: 'rule-2',
        name: 'No Expired Client Secrets',
        description: 'All active applications must have valid, unexpired client secrets.',
        severity: 'High' as const,
        evaluator: (app: Application) => {
          if (app.secrets.length === 0) return true; // No secrets is fine (e.g., public client)
          return !app.secrets.some((sec) => sec.status === 'Expired');
        },
        remediation: 'Generate a new client secret, update your application deployment, and delete the expired secret.'
      },
      {
        id: 'rule-3',
        name: 'Secure Redirect URIs (HTTPS)',
        description: 'All redirect URIs must use the HTTPS protocol (except localhost for development).',
        severity: 'Medium' as const,
        evaluator: (app: Application) =>
          app.redirectUris.every((uri) => uri.startsWith('https://') || uri.startsWith('http://localhost')),
        remediation: 'Enforce HTTPS endpoints for all production redirect URIs.'
      },
      {
        id: 'rule-4',
        name: 'Assigned Application Owners',
        description: 'Every registered application must have at least one active owner assigned.',
        severity: 'Medium' as const,
        evaluator: (app: Application) =>
          app.owners.length > 0 && app.owners[0].name !== 'Orphaned Account' && app.owners[0].name !== 'Unassigned',
        remediation: 'Assign a valid corporate identity or team distribution list as the application owner.'
      },
      {
        id: 'rule-5',
        name: 'Avoid High-Privilege Directory Roles',
        description: 'Limit permissions like Directory.ReadWrite.All or Mail.ReadWrite.All.',
        severity: 'High' as const,
        evaluator: (app: Application) =>
          !app.permissions.some((p) => p.name.includes('ReadWrite.All') || p.name.includes('Directory.Read')),
        remediation: 'Refactor application to use granular, least-privilege Graph API permissions.'
      }
    ];
  }, []);

  // --- SIMULATION HANDLERS ---
  const availablePermissions = [
    { name: 'User.Read', classification: 'Low', description: 'Sign in and read user profile' },
    { name: 'Mail.Read', classification: 'Medium', description: 'Read user mail' },
    { name: 'Calendars.ReadWrite', classification: 'Medium', description: 'Read and write user calendars' },
    { name: 'Directory.ReadWrite.All', classification: 'High', description: 'Read and write directory data' },
    { name: 'Mail.ReadWrite.All', classification: 'High', description: 'Read and write mail in all mailboxes' }
  ];

  const handleTogglePermission = (permName: string) => {
    if (simPermissions.includes(permName)) {
      setSimPermissions(simPermissions.filter((p) => p !== permName));
    } else {
      setSimPermissions([...simPermissions, permName]);
    }
  };

  const handleRegisterSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simAppName || !simRedirectUri) {
      alert('Please fill in the Application Name and Redirect URI.');
      return;
    }

    // Calculate Risk Level based on permissions and redirect URI
    let risk: 'High' | 'Medium' | 'Low' = 'Low';
    const hasHighPerm = simPermissions.some((p) => {
      const found = availablePermissions.find((ap) => ap.name === p);
      return found?.classification === 'High';
    });
    const hasMediumPerm = simPermissions.some((p) => {
      const found = availablePermissions.find((ap) => ap.name === p);
      return found?.classification === 'Medium';
    });
    const hasWildcard = simRedirectUri.includes('*');
    const isHttp = simRedirectUri.startsWith('http://') && !simRedirectUri.includes('localhost');

    if (hasHighPerm || hasWildcard) {
      risk = 'High';
    } else if (hasMediumPerm || isHttp) {
      risk = 'Medium';
    }

    // Build new app object
    const newApp: Application = {
      id: String(apps.length + 1),
      name: simAppName,
      clientId: crypto.randomUUID ? crypto.randomUUID() : `sim-${Math.floor(Math.random() * 1000000)}`,
      objectId: crypto.randomUUID ? crypto.randomUUID() : `obj-${Math.floor(Math.random() * 1000000)}`,
      status: 'Active',
      riskLevel: risk,
      consentType: simConsentType,
      createdDate: new Date().toISOString().split('T')[0],
      lastSignIn: 'Never Signed In',
      redirectUris: [simRedirectUri],
      permissions: simPermissions.map((pName) => {
        const found = availablePermissions.find((ap) => ap.name === pName);
        return {
          name: pName,
          type: simConsentType === 'Admin' ? 'Application' : 'Delegated',
          classification: (found?.classification as 'High' | 'Medium' | 'Low') || 'Low',
          description: found?.description || ''
        };
      }),
      secrets: [
        {
          id: `sec-${Date.now()}`,
          name: 'Initial Secret Key',
          created: new Date().toISOString().split('T')[0],
          expires: simSecretExpiry === '1year' ? '2025-11-03' : '2026-11-03',
          status: 'Active'
        }
      ],
      owners: [
        {
          name: simOwnerName || 'Unassigned Developer',
          email: simOwnerEmail || 'dev@enterprise.com',
          role: 'Application Owner'
        }
      ],
      auditLogs: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: 'Application Registered (Simulated)',
          actor: simOwnerEmail || 'dev@enterprise.com',
          status: 'Success'
        }
      ]
    };

    setApps([newApp, ...apps]);
    setSelectedApp(newApp);
    setActiveTab('explorer');

    // Reset Form
    setSimAppName('');
    setSimRedirectUri('');
    setSimConsentType('User');
    setSimPermissions([]);
    setSimOwnerName('');
    setSimOwnerEmail('');
  };

  // --- HELPERS ---
  const getRiskBadgeColor = (risk: 'High' | 'Medium' | 'Low') => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadgeColor = (status: 'Active' | 'Inactive' | 'Suspended') => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Suspended':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Azure AD Enterprise App Auditor</h1>
            <p className="text-xs text-slate-400">Security posture, compliance, and risk assessment dashboard</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setApps(INITIAL_APPLICATIONS);
              setSelectedApp(null);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700/50">
            Tenant: <strong className="text-indigo-400">enterprise.onmicrosoft.com</strong>
          </span>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* --- SIDEBAR FILTERS --- */}
        <aside className="w-80 bg-slate-950 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              Filter Directory
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or Client ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Application Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'Active', 'Inactive', 'Suspended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    statusFilter === status
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {status === 'all' ? 'All Statuses' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Consent Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Consent Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'Admin', 'User', 'None'].map((consent) => (
                <button
                  key={consent}
                  onClick={() => setConsentFilter(consent)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    consentFilter === consent
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {consent === 'all' ? 'All Consents' : `${consent} Consent`}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Risk Level</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'High', 'Medium', 'Low'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    riskFilter === risk
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {risk === 'all' ? 'All Risks' : `${risk} Risk`}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                Audit Scope
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This tool audits Enterprise Applications and App Registrations in your Azure AD tenant. It flags high-risk permissions, expired secrets, and wildcard redirect URIs.
              </p>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          {/* --- KPI METRICS BAR --- */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-slate-800 bg-slate-950/40">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Total Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{kpis.total}</p>
              </div>
              <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">High Risk Apps</p>
                <p className="text-2xl font-bold text-rose-500 mt-1">{kpis.highRisk}</p>
              </div>
              <div className="bg-rose-500/10 p-2.5 rounded-lg text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Admin Consented</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">{kpis.adminConsented}</p>
              </div>
              <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Inactive / Suspended</p>
                <p className="text-2xl font-bold text-slate-300 mt-1">{kpis.inactive}</p>
              </div>
              <div className="bg-slate-500/10 p-2.5 rounded-lg text-slate-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </section>

          {/* --- INTERACTIVE TABS --- */}
          <div className="px-6 pt-4 bg-slate-950/20 border-b border-slate-800 flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'dashboard'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                Dashboard Overview
              </button>
              <button
                onClick={() => setActiveTab('explorer')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'explorer'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                App Explorer ({filteredApps.length})
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'compliance'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                Compliance Audit
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Plus className="h-4 w-4" />
                Register App Simulation
              </button>
            </div>
            <div className="text-xs text-slate-500 pb-3">
              Showing {filteredApps.length} of {apps.length} apps
            </div>
          </div>

          {/* --- TAB CONTENT --- */}
          <div className="p-6 flex-1">
            {/* 1. DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Risk & Consent Breakdown Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Risk Distribution */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-500" />
                      Risk Distribution
                    </h3>
                    <div className="space-y-4">
                      {['High', 'Medium', 'Low'].map((risk) => {
                        const count = apps.filter((a) => a.riskLevel === risk).length;
                        const percentage = apps.length ? (count / apps.length) * 100 : 0;
                        const color = risk === 'High' ? 'bg-rose-500' : risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
                        return (
                          <div key={risk} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-400">{risk} Risk</span>
                              <span className="text-slate-200">{count} ({Math.round(percentage)}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className={`${color} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Consent Breakdown */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-indigo-400" />
                      Consent Breakdown
                    </h3>
                    <div className="space-y-4">
                      {['Admin', 'User', 'None'].map((consent) => {
                        const count = apps.filter((a) => a.consentType === consent).length;
                        const percentage = apps.length ? (count / apps.length) * 100 : 0;
                        const color = consent === 'Admin' ? 'bg-indigo-500' : consent === 'User' ? 'bg-sky-500' : 'bg-slate-600';
                        return (
                          <div key={consent} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-400">{consent} Consent</span>
                              <span className="text-slate-200">{count} ({Math.round(percentage)}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className={`${color} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Security Alerts */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Critical Security Alerts
                    </h3>
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {apps.some((a) => a.riskLevel === 'High') ? (
                        apps
                          .filter((a) => a.riskLevel === 'High')
                          .map((app) => (
                            <div
                              key={app.id}
                              onClick={() => {
                                setSelectedApp(app);
                                setActiveTab('explorer');
                              }}
                              className="p-2.5 bg-rose-950/20 border border-rose-900/50 rounded-lg flex items-start gap-2.5 cursor-pointer hover:bg-rose-950/40 transition-colors"
                            >
                              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-semibold text-rose-300">{app.name}</h4>
                                <p className="text-[10px] text-rose-400/80 mt-0.5">High risk permissions or expired credentials detected.</p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          No critical security alerts found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Audit Logs */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Recent Tenant Audit Logs
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-3 font-semibold">Timestamp</th>
                          <th className="pb-3 font-semibold">Action</th>
                          <th className="pb-3 font-semibold">Actor</th>
                          <th className="pb-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {apps.flatMap((app) => app.auditLogs.map((log) => ({ ...log, appName: app.name }))).slice(0, 5).map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-3 font-mono text-slate-400">{log.timestamp}</td>
                            <td className="py-3">
                              <span className="font-medium text-white">{log.action}</span>
                              <span className="text-slate-500 block text-[10px]">App: {log.appName}</span>
                            </td>
                            <td className="py-3 text-slate-400">{log.actor}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {log.status === 'Success' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. APP EXPLORER TAB */}
            {activeTab === 'explorer' && (
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Registered Applications</h3>
                  <span className="text-xs text-slate-400">Click any application to view detailed security posture</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold bg-slate-900/50">
                        <th className="p-4">Application Name</th>
                        <th className="p-4">Client ID</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Risk Level</th>
                        <th className="p-4">Consent Type</th>
                        <th className="p-4">Last Sign-In</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredApps.length > 0 ? (
                        filteredApps.map((app) => (
                          <tr
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={`hover:bg-slate-900/60 cursor-pointer transition-colors ${
                              selectedApp?.id === app.id ? 'bg-indigo-950/20 border-l-2 border-l-indigo-500' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="font-semibold text-white">{app.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">Created: {app.createdDate}</div>
                            </td>
                            <td className="p-4 font-mono text-xs text-slate-400">
                              {app.clientId.substring(0, 8)}...{app.clientId.substring(app.clientId.length - 8)}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(app.riskLevel)}`}>
                                {app.riskLevel}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                {app.consentType}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-400 font-mono">
                              {app.lastSignIn}
                            </td>
                            <td className="p-4 text-right">
                              <button className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1">
                                Inspect <ChevronRight className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            No applications match the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. COMPLIANCE AUDIT TAB */}
            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-white mb-2">Tenant Compliance Score</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Evaluated against enterprise security baselines and CIS Microsoft 365 Foundations Benchmark.
                  </p>
                  {/* Progress Bar */}
                  {(() => {
                    let totalChecks = 0;
                    let passedChecks = 0;
                    apps.forEach((app) => {
                      complianceRules.forEach((rule) => {
                        totalChecks++;
                        if (rule.evaluator(app)) passedChecks++;
                      });
                    });
                    const score = totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 100;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-3xl font-bold text-indigo-400">{score}%</span>
                          <span className="text-xs text-slate-400">{passedChecks} of {totalChecks} checks passed</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Rules List */}
                <div className="space-y-4">
                  {complianceRules.map((rule) => {
                    const failingApps = apps.filter((app) => !rule.evaluator(app));
                    const isPassing = failingApps.length === 0;

                    return (
                      <div key={rule.id} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-5 flex items-start justify-between gap-4 bg-slate-950">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {isPassing ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-rose-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-white">{rule.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  rule.severity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {rule.severity} Severity
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isPassing ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {isPassing ? 'Compliant' : `${failingApps.length} Non-Compliant`}
                            </span>
                          </div>
                        </div>

                        {/* Non-compliant Apps List */}
                        {!isPassing && (
                          <div className="px-5 pb-5 pt-3 bg-slate-900/40 border-t border-slate-800/60">
                            <div className="text-xs font-semibold text-slate-300 mb-2">Remediation Action:</div>
                            <p className="text-xs text-slate-400 mb-3 italic">{rule.remediation}</p>
                            <div className="text-xs font-semibold text-slate-300 mb-2">Affected Applications:</div>
                            <div className="flex flex-wrap gap-2">
                              {failingApps.map((app) => (
                                <button
                                  key={app.id}
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setActiveTab('explorer');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
                                >
                                  {app.name}
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. REGISTER APP SIMULATION TAB */}
            {activeTab === 'register' && (
              <div className="max-w-3xl mx-auto bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-lg">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-indigo-400" />
                    Simulate New Application Registration
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Test how Azure AD evaluates risk and compliance scores before registering the application in production.
                  </p>
                </div>

                <form onSubmit={handleRegisterSimulation} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* App Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Application Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., ServiceNow Integration"
                        value={simAppName}
                        onChange={(e) => setSimAppName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Redirect URI */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                        Redirect URI *
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., https://servicenow.enterprise.com/oauth"
                        value={simRedirectUri}
                        onChange={(e) => setSimRedirectUri(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Consent Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Consent Type</label>
                      <select
                        value={simConsentType}
                        onChange={(e) => setSimConsentType(e.target.value as 'Admin' | 'User' | 'None')}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="User">User Consent (Delegated permissions)</option>
                        <option value="Admin">Admin Consent (Application permissions / High privilege)</option>
                        <option value="None">None (No consent granted yet)</option>
                      </select>
                    </div>

                    {/* Secret Expiry */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Client Secret Expiry</label>
                      <select
                        value={simSecretExpiry}
                        onChange={(e) => setSimSecretExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="1year">1 Year (Recommended)</option>
                        <option value="2years">2 Years</option>
                        <option value="never">Never Expires (High Risk)</option>
                      </select>
                    </div>
                  </div>

                  {/* Permissions Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-slate-300">Requested Graph API Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePermissions.map((perm) => (
                        <div
                          key={perm.name}
                          onClick={() => handleTogglePermission(perm.name)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            simPermissions.includes(perm.name)
                              ? 'bg-indigo-950/30 border-indigo-500'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={simPermissions.includes(perm.name)}
                            onChange={() => {}} // Handled by parent div click
                            className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">{perm.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                perm.classification === 'High' ? 'bg-red-500/10 text-red-400' : perm.classification === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {perm.classification} Risk
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Owner Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Jane Doe"
                        value={simOwnerName}
                        onChange={(e) => setSimOwnerName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Owner Email</label>
                      <input
                        type="email"
                        placeholder="e.g., jdoe@enterprise.com"
                        value={simOwnerEmail}
                        onChange={(e) => setSimOwnerEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-500/10 transition-all flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Register & Analyze App
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>

        {/* --- DETAILED APPLICATION INSPECTOR (SLIDE-OVER PANEL) --- */}
        {selectedApp && (
          <aside className="w-96 bg-slate-950 border-l border-slate-800 flex flex-col overflow-y-auto shadow-2xl">
            {/* Inspector Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRiskBadgeColor(selectedApp.riskLevel)}`}>
                    {selectedApp.riskLevel} Risk
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadgeColor(selectedApp.status)}`}>
                    {selectedApp.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-2">{selectedApp.name}</h2>
                <p className="text-xs text-slate-400 mt-1">Created on {selectedApp.createdDate}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* IDs */}
              <div className="space-y-3 bg-slate-900/50 p-3.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Application (Client) ID</span>
                  <span className="text-xs font-mono text-slate-300 block break-all mt-0.5">{selectedApp.clientId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Directory (Tenant) Object ID</span>
                  <span className="text-xs font-mono text-slate-300 block break-all mt-0.5">{selectedApp.objectId}</span>
                </div>
              </div>

              {/* Redirect URIs */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                  Redirect URIs
                </h3>
                <div className="space-y-1.5">
                  {selectedApp.redirectUris.map((uri, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-xs">
                      <span className="font-mono text-slate-300 truncate mr-2">{uri}</span>
                      {uri.includes('*') && (
                        <span className="text-[9px] font-bold bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded shrink-0">
                          Wildcard
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                  API Permissions ({selectedApp.permissions.length})
                </h3>
                <div className="space-y-2">
                  {selectedApp.permissions.length > 0 ? (
                    selectedApp.permissions.map((perm, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white font-mono">{perm.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            perm.classification === 'High' ? 'bg-red-500/10 text-red-400' : perm.classification === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {perm.classification}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{perm.description}</p>
                        <div className="text-[9px] text-slate-500">Type: {perm.type}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic">No permissions requested.</div>
                  )}
                </div>
              </div>

              {/* Secrets & Certificates */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-indigo-400" />
                  Client Secrets ({selectedApp.secrets.length})
                </h3>
                <div className="space-y-2">
                  {selectedApp.secrets.length > 0 ? (
                    selectedApp.secrets.map((sec) => (
                      <div key={sec.id} className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">{sec.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Expires: {sec.expires}</div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          sec.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : sec.status === 'Expired' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {sec.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic">No client secrets configured.</div>
                  )}
                </div>
              </div>

              {/* Owners */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  App Owners
                </h3>
                <div className="space-y-2">
                  {selectedApp.owners.map((owner, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center gap-3">
                      <div className="bg-indigo-600/20 p-1.5 rounded text-indigo-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{owner.name}</div>
                        <div className="text-[10px] text-slate-400">{owner.email}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{owner.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Logs */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  App Audit Logs
                </h3>
                <div className="space-y-2">
                  {selectedApp.auditLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{log.action}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>By: {log.actor}</span>
                        <span className="font-mono">{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}