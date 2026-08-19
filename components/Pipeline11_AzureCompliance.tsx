

// --- CONSOLIDATED FROM: ./pipelines/Pipeline11_AzureCompliance.tsx ---

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Cloud,
  Server,
  Lock,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Terminal,
  Cpu,
  Database,
  Search,
  Filter,
  Sliders,
  Radio,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Key,
  Globe,
  Settings,
  Flame,
  Check,
  AlertCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type ComplianceStandard = 'FedRAMP_High' | 'DoD_IL5' | 'NIST_800_53_R5' | 'CJIS' | 'HIPAA_Gov';
export type ScanStatus = 'idle' | 'running' | 'evaluating' | 'remediating' | 'completed' | 'failed';
export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface ComplianceControl {
  id: string;
  controlId: string;
  name: string;
  family: string;
  standard: ComplianceStandard;
  status: 'Compliant' | 'Non-Compliant' | 'Remediating' | 'Exempt';
  severity: SeverityLevel;
  resourceCount: number;
  evaluatedAt: string;
  azurePolicyDef: string;
  description: string;
  remediationScript?: string;
}

export interface AzureResourceViolation {
  id: string;
  resourceId: string;
  resourceType: string;
  subscriptionId: string;
  region: string;
  policyName: string;
  controlId: string;
  severity: SeverityLevel;
  detectedAt: string;
  remediationAvailable: boolean;
  state: 'Active' | 'Remediated' | 'Suppressed';
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'passed' | 'warning' | 'failed';
  duration?: string;
  itemsProcessed: number;
  totalItems: number;
  details: string[];
}

export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  action: string;
  targetResource: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  details: string;
}

// --- MOCK INITIAL DATA ---
const INITIAL_CONTROLS: ComplianceControl[] = [
  {
    id: 'ctrl-001',
    controlId: 'AC-2 (1)',
    name: 'Automated System Account Management',
    family: 'Access Control',
    standard: 'FedRAMP_High',
    status: 'Compliant',
    severity: 'High',
    resourceCount: 42,
    evaluatedAt: '2025-03-30 14:12:00 UTC',
    azurePolicyDef: 'AzureGov_AC2_PIM_Enforcement_v3',
    description: 'Ensure privileged identity management is enforced with just-in-time access and MFA for all Azure Gov subscriptions.'
  },
  {
    id: 'ctrl-002',
    controlId: 'SC-7 (5)',
    name: 'Boundary Protection - Managed Interfaces',
    family: 'System and Communications Protection',
    standard: 'DoD_IL5',
    status: 'Non-Compliant',
    severity: 'Critical',
    resourceCount: 3,
    evaluatedAt: '2025-03-30 14:12:05 UTC',
    azurePolicyDef: 'DoD_IL5_ExpressRoute_Perimeter_Check',
    description: 'All traffic entering Azure DoD regions must traverse authorized DoD CAP (Cloud Access Point) via ExpressRoute Gov.',
    remediationScript: 'az network vnet update --resource-group rg-gov-network --name vnet-core-il5 --enable-perimeter-guard true'
  },
  {
    id: 'ctrl-003',
    controlId: 'SC-13',
    name: 'Cryptographic Protection (FIPS 140-2 Level 3)',
    family: 'System and Communications Protection',
    standard: 'FedRAMP_High',
    status: 'Compliant',
    severity: 'High',
    resourceCount: 128,
    evaluatedAt: '2025-03-30 14:12:10 UTC',
    azurePolicyDef: 'FIPS140_3_Managed_HSM_Enforcement',
    description: 'Customer managed keys must reside in Azure Dedicated Key Vault HSM with FIPS 140-2/3 Level 3 certification.'
  },
  {
    id: 'ctrl-004',
    controlId: 'AU-6 (1)',
    name: 'Automated Audit Record Review and Analysis',
    family: 'Audit and Accountability',
    standard: 'NIST_800_53_R5',
    status: 'Compliant',
    severity: 'Medium',
    resourceCount: 89,
    evaluatedAt: '2025-03-30 14:12:15 UTC',
    azurePolicyDef: 'AzureGov_LogAnalytics_Retention_365d',
    description: 'Diagnostic settings must pipe all control plane and data plane audit logs to Microsoft Sentinel Gov with 365+ days retention.'
  },
  {
    id: 'ctrl-005',
    controlId: 'IA-2 (2)',
    name: 'Multi-Factor Authentication for Network Access',
    family: 'Identification and Authentication',
    standard: 'CJIS',
    status: 'Non-Compliant',
    severity: 'High',
    resourceCount: 5,
    evaluatedAt: '2025-03-30 14:12:20 UTC',
    azurePolicyDef: 'CJIS_Gov_Conditional_Access_MFA',
    description: 'Conditional access policies must block legacy auth protocols and enforce FIDO2 or CAC/PIV smart card verification.',
    remediationScript: 'az ad policy conditional-access update --id cjis-baseline-09 --state enabled'
  },
  {
    id: 'ctrl-006',
    controlId: 'SI-4 (4)',
    name: 'Inbound and Outbound Communications Traffic Monitoring',
    family: 'System and Information Integrity',
    standard: 'DoD_IL5',
    status: 'Remediating',
    severity: 'High',
    resourceCount: 2,
    evaluatedAt: '2025-03-30 14:12:25 UTC',
    azurePolicyDef: 'Azure_Defender_Gov_Network_Flow_Logs',
    description: 'Flow logs and Azure Network Watcher traffic analytics must be enabled with NSG packet inspection active.'
  }
];

const INITIAL_VIOLATIONS: AzureResourceViolation[] = [
  {
    id: 'viol-101',
    resourceId: '/subscriptions/gov-sub-401/resourceGroups/rg-dod-edge/providers/Microsoft.Network/networkSecurityGroups/nsg-perimeter-front',
    resourceType: 'Microsoft.Network/networkSecurityGroups',
    subscriptionId: 'gov-sub-401 (USGov Virginia)',
    region: 'usgovvirginia',
    policyName: 'DoD_IL5_ExpressRoute_Perimeter_Check',
    controlId: 'SC-7 (5)',
    severity: 'Critical',
    detectedAt: '2025-03-30 13:45:00 UTC',
    remediationAvailable: true,
    state: 'Active'
  },
  {
    id: 'viol-102',
    resourceId: '/subscriptions/gov-sub-402/resourceGroups/rg-fed-storage/providers/Microsoft.Storage/storageAccounts/stfedsecvault099',
    resourceType: 'Microsoft.Storage/storageAccounts',
    subscriptionId: 'gov-sub-402 (USGov Arizona)',
    region: 'usgovarizona',
    policyName: 'AzureGov_Storage_Tls13_Enforcement',
    controlId: 'SC-13',
    severity: 'High',
    detectedAt: '2025-03-30 14:02:11 UTC',
    remediationAvailable: true,
    state: 'Active'
  },
  {
    id: 'viol-103',
    resourceId: '/subscriptions/gov-sub-401/resourceGroups/rg-cjis-portal/providers/Microsoft.Compute/virtualMachines/vm-cjis-auth-01',
    resourceType: 'Microsoft.Compute/virtualMachines',
    subscriptionId: 'gov-sub-401 (USGov Virginia)',
    region: 'usgovvirginia',
    policyName: 'CJIS_Gov_Conditional_Access_MFA',
    controlId: 'IA-2 (2)',
    severity: 'High',
    detectedAt: '2025-03-30 14:05:30 UTC',
    remediationAvailable: false,
    state: 'Active'
  }
];

const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage-1',
    name: '1. Government Tenant & Subscription Discovery',
    description: 'Query Azure Resource Graph across USGov Virginia & USGov Arizona scopes',
    status: 'passed',
    duration: '4.2s',
    itemsProcessed: 4,
    totalItems: 4,
    details: [
      'Connected to Microsoft Entra ID Government (Tenant: fed-cloud-gov.onmicrosoft.us)',
      'Discovered 4 active Gov subscriptions (DoD Mission Ops, FedRAMP Portal, CJIS Services, Data Hub)',
      'Cataloged 482 Azure Gov Cloud resources across 18 resource providers'
    ]
  },
  {
    id: 'stage-2',
    name: '2. FedRAMP High & DoD IL5 Policy Evaluation',
    description: 'Execute Azure Policy continuous attestation & custom Gov Blueprints',
    status: 'passed',
    duration: '11.8s',
    itemsProcessed: 482,
    totalItems: 482,
    details: [
      'Applied NIST SP 800-53 Rev 5 initiative baseline',
      'Evaluated 284 custom FedRAMP High policy definitions',
      'Assessed DoD Impact Level 5 boundary protection configurations'
    ]
  },
  {
    id: 'stage-3',
    name: '3. Cryptographic & Key Vault FIPS Attestation',
    description: 'Verify FIPS 140-2/3 Level 3 HSM keys, TLS 1.3 endpoints & Disk Encryption Sets',
    status: 'passed',
    duration: '5.1s',
    itemsProcessed: 36,
    totalItems: 36,
    details: [
      'Validated 12 Managed HSM pools in USGov Virginia',
      'Confirmed customer-managed key (CMK) rotation schedules are under 90 days',
      'Zero unencrypted OS disks or database volumes detected'
    ]
  },
  {
    id: 'stage-4',
    name: '4. Network Isolation & Boundary Verification',
    description: 'Validate DoD Cloud Access Point (CAP) and Azure ExpressRoute Private Peering',
    status: 'warning',
    duration: '6.4s',
    itemsProcessed: 14,
    totalItems: 14,
    details: [
      'Identified 1 NSG perimeter bypass candidate in rg-dod-edge',
      'ExpressRoute Direct circuit confirmed operational with MACsec 256-bit link encryption',
      'Public IP assignment prevention policy active across all FedRAMP boundary VNETs'
    ]
  },
  {
    id: 'stage-5',
    name: '5. Automated Remediation & OSCAL Artifact Export',
    description: 'Trigger az-cli automated remediation tasks and assemble NIST OSCAL compliance package',
    status: 'in_progress',
    duration: '8.3s',
    itemsProcessed: 2,
    totalItems: 3,
    details: [
      'Triggered auto-remediation task: AzureGov_Storage_Tls13_Enforcement',
      'Compiling OSCAL FedRAMP System Security Plan (SSP) JSON dataset',
      'Generating DoD POA&M (Plan of Action and Milestones) audit artifact'
    ]
  }
];

export const Pipeline11_AzureCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'controls' | 'violations' | 'remediation' | 'oscal'>('pipeline');
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_PIPELINE_STAGES);
  const [controls, setControls] = useState<ComplianceControl[]>(INITIAL_CONTROLS);
  const [violations, setViolations] = useState<AzureResourceViolation[]>(INITIAL_VIOLATIONS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(75);
  const [selectedStandard, setSelectedStandard] = useState<ComplianceStandard | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRemediateEnabled, setAutoRemediateEnabled] = useState<boolean>(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      timestamp: '2025-03-30 14:15:22 UTC',
      actor: 'System/AzurePolicyEngine',
      action: 'INITIATIVE_EVALUATION',
      targetResource: 'Subscription: gov-sub-401',
      status: 'SUCCESS',
      details: 'Completed continuous compliance sweep against FedRAMP High Baseline.'
    },
    {
      timestamp: '2025-03-30 14:16:04 UTC',
      actor: 'ServicePrincipal/GovSecAutomator',
      action: 'REMEDIATION_TRIGGER',
      targetResource: 'stfedsecvault099',
      status: 'SUCCESS',
      details: 'Enforced TLS 1.3 and disabled public network access on FedRAMP storage account.'
    },
    {
      timestamp: '2025-03-30 14:18:10 UTC',
      actor: 'Auditor/Admin.FedGov',
      action: 'OSCAL_EXPORT',
      targetResource: 'Tenant: fed-cloud-gov.onmicrosoft.us',
      status: 'SUCCESS',
      details: 'Generated and signed OSCAL compliant System Security Plan (SSP) report.'
    }
  ]);

  // Handle Pipeline Trigger
  const handleTriggerFullScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Add an audit log entry
          setAuditLogs((current) => [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
              actor: 'Pipeline/TriggerEngine',
              action: 'FULL_COMPLIANCE_RUN',
              targetResource: 'Azure Gov Tenant Scope',
              status: 'SUCCESS',
              details: 'Full pipeline evaluation completed: 98.4% compliance index calculated.'
            },
            ...current
          ]);
          return 100;
        }
        return prev + 25;
      });
    }, 600);
  };

  // Handle Auto Remediation
  const handleRemediateViolation = (violationId: string) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === violationId ? { ...v, state: 'Remediated' } : v))
    );
    const target = violations.find((v) => v.id === violationId);
    if (target) {
      setAuditLogs((current) => [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          actor: 'Operator/GovSecRemediator',
          action: 'MANUAL_REMEDIATE',
          targetResource: target.resourceId.split('/').pop() || target.resourceId,
          status: 'SUCCESS',
          details: `Remediation executed for control ${target.controlId} via Azure Policy action.`
        },
        ...current
      ]);
    }
  };

  // Filtered Controls
  const filteredControls = controls.filter((ctrl) => {
    const matchesStandard = selectedStandard === 'ALL' || ctrl.standard === selectedStandard;
    const matchesSearch =
      ctrl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctrl.family.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStandard && matchesSearch;
  });

  const compliantCount = controls.filter((c) => c.status === 'Compliant').length;
  const nonCompliantCount = controls.filter((c) => c.status === 'Non-Compliant').length;
  const scorePercent = Math.round((compliantCount / (controls.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 lg:p-8">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-900/40 border border-blue-500/40 rounded-xl text-blue-400 shadow-lg shadow-blue-950">
                <ShieldCheck className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Azure Government Compliance Pipeline
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    US Gov Cloud (MAG)
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    FedRAMP High & DoD IL5
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Automated continuous attestation, OSCAL generation, and drift remediation for Azure USGov Virginia & Arizona.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerFullScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50 hover:shadow-blue-900/80 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning Tenant...' : 'Run Pipeline Scan'}
            </button>
            <button
              onClick={() => setActiveTab('oscal')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export OSCAL / SSP
            </button>
          </div>
        </header>

        {/* METRICS / STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Posture</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{scorePercent}%</span>
              <span className="text-xs text-slate-400">FedRAMP Compliant</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">DoD IL5 Boundary</span>
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">Active</span>
              <span className="text-xs text-blue-400">DoD CAP Validated</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              ExpressRoute Gov Direct & FIPS 140-3 Cryptographic modules enabled.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Violations</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400">{violations.filter(v => v.state === 'Active').length}</span>
              <span className="text-xs text-slate-400">Resource Non-Compliances</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {violations.filter(v => v.remediationAvailable && v.state === 'Active').length} ready for auto-remediation
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gov Tenant Scope</span>
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">4 Subscriptions</span>
            </div>
            <p className="mt-2 text-xs text-slate-400 truncate">
              Region: USGov VA, USGov AZ (FIPS-199 High)
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="border-b border-slate-800 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-2">
            {[
              { id: 'pipeline', label: 'Pipeline Execution', icon: Play },
              { id: 'controls', label: 'Compliance Controls Matrix', icon: ShieldCheck },
              { id: 'violations', label: 'Resource Policy Drift', icon: ShieldAlert, badge: violations.filter(v => v.state === 'Active').length },
              { id: 'remediation', label: 'Automated Remediation', icon: Terminal },
              { id: 'oscal', label: 'OSCAL / SSP Artifacts', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Azure Policy Webhook Listener: <strong className="text-emerald-400 font-mono">HEALTHY</strong></span>
          </div>
        </div>

        {/* TAB 1: PIPELINE EXECUTION */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">Azure Gov Continuous Compliance Pipeline DAG</h2>
                  <p className="text-xs text-slate-400">Step-by-step Gov tenant evaluation, cryptographic audit, and remediation stream</p>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  Run ID: <span className="text-blue-400">azgov-pipe-run-8490</span>
                </div>
              </div>

              {/* STAGES LIST */}
              <div className="mt-6 space-y-4">
                {pipelineStages.map((stage, idx) => {
                  const isLast = idx === pipelineStages.length - 1;
                  return (
                    <div key={stage.id} className="relative">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                        {/* Status Icon */}
                        <div className="pt-0.5">
                          {stage.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          {stage.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                          {stage.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                          {stage.status === 'in_progress' && <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />}
                          {stage.status === 'pending' && <Clock className="w-5 h-5 text-slate-600" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3 className="text-sm font-semibold text-white">{stage.name}</h3>
                            <div className="flex items-center gap-2">
                              {stage.duration && (
                                <span className="text-xs font-mono text-slate-500">Duration: {stage.duration}</span>
                              )}
                              <span
                                className={`px-2 py-0.5 text-xs font-mono rounded ${
                                  stage.status === 'passed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : stage.status === 'warning'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : stage.status === 'in_progress'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {stage.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{stage.description}</p>

                          {/* Detail Logs */}
                          <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
                            {stage.details.map((detail, dIdx) => (
                              <div key={dIdx} className="flex items-center gap-2">
                                <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE AUDIT STREAM */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Live Compliance Event Log</h3>
                </div>
                <span className="text-xs text-slate-400">Streamed from Azure Activity & Sentinel Gov</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">TIMESTAMP</th>
                      <th className="pb-2">ACTOR</th>
                      <th className="pb-2">ACTION</th>
                      <th className="pb-2">TARGET</th>
                      <th className="pb-2">STATUS</th>
                      <th className="pb-2">DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 text-slate-500">{log.timestamp}</td>
                        <td className="py-2 text-blue-300">{log.actor}</td>
                        <td className="py-2 text-slate-200">{log.action}</td>
                        <td className="py-2 text-slate-400">{log.targetResource}</td>
                        <td className="py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2 text-slate-300">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLIANCE CONTROLS MATRIX */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search controls (e.g., AC-2, Key Vault, Boundary)..."
                    className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                  <span className="text-xs text-slate-400 font-medium mr-1">Standard:</span>
                  {(['ALL', 'FedRAMP_High', 'DoD_IL5', 'NIST_800_53_R5', 'CJIS'] as const).map((std) => (
                    <button
                      key={std}
                      onClick={() => setSelectedStandard(std)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        selectedStandard === std
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-900'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {std === 'ALL' ? 'All Frameworks' : std.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Control ID</th>
                      <th className="p-3">Family & Name</th>
                      <th className="p-3">Framework</th>
                      <th className="p-3">Azure Policy Definition</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    {filteredControls.map((ctrl) => (
                      <tr key={ctrl.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-400">{ctrl.controlId}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{ctrl.name}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{ctrl.description}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                            {ctrl.standard}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{ctrl.azurePolicyDef}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ctrl.severity === 'Critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : ctrl.severity === 'High'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {ctrl.severity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              ctrl.status === 'Compliant'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : ctrl.status === 'Remediating'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {ctrl.status === 'Compliant' && <Check className="w-3 h-3" />}
                            {ctrl.status === 'Non-Compliant' && <AlertCircle className="w-3 h-3" />}
                            {ctrl.status === 'Remediating' && <RefreshCw className="w-3 h-3 animate-spin" />}
                            {ctrl.status}
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

        {/* TAB 3: POLICY DRIFT & RESOURCE VIOLATIONS */}
        {activeTab === 'violations' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Active Azure Resource Non-Compliances</h3>
                  <p className="text-xs text-slate-400">Drifts detected against baseline FedRAMP High and DoD IL5 initiatives</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Auto-Remediation Mode:</span>
                  <button
                    onClick={() => setAutoRemediateEnabled(!autoRemediateEnabled)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      autoRemediateEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {autoRemediateEnabled ? 'ENABLED (Safe-Mode)' : 'MANUAL APPROVAL'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{violation.controlId}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs font-mono text-slate-300">{violation.policyName}</span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            violation.severity === 'Critical'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {violation.severity}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 break-all">{violation.resourceId}</div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Scope: {violation.subscriptionId}</span>
                        <span>Region: {violation.region}</span>
                        <span>Detected: {violation.detectedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {violation.state === 'Remediated' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" /> Remediated
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemediateViolation(violation.id)}
                          disabled={!violation.remediationAvailable}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            violation.remediationAvailable
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          Remediate Resource
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATED REMEDIATION */}
        {activeTab === 'remediation' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-white">Azure CLI / PowerShell Remediation Recipes</h3>
                  <p className="text-xs text-slate-400">Pre-approved FedRAMP High compliant remediation tasks triggered via Azure Automation</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 font-mono">RECIPE: DoD-CAP-Perimeter-Lockdown</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">READY</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Closes open Inbound NSG rules on Gov virtual networks and forces route tables to forward traffic to the DoD Cloud Access Point.
                  </p>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`# Execute FedRAMP SC-7 boundary isolation
az network vnet route-table route create \\
  --resource-group rg-dod-edge \\
  --route-table-name rt-cap-default \\
  --name ToDoD-CAP-Interconnect \\
  --address-prefix 0.0.0.0/0 \\
  --next-hop-type VirtualAppliance \\
  --next-hop-ip-address 10.240.0.4`}
                  </pre>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 font-mono">RECIPE: KeyVault-FIPS140-Level3-Enforce</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">READY</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enforces Azure Managed HSM FIPS 140-2 Level 3 keys on unencrypted storage accounts.
                  </p>
                  <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`az storage account update \\
  --name stfedsecvault099 \\
  --resource-group rg-fed-storage \\
  --encryption-key-source Microsoft.Keyvault \\
  --encryption-key-vault https://kv-gov-fips-hsm.managedhsm.azure.us \\
  --encryption-key-name cmk-fedramp-high-root-key`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OSCAL & SSP ARTIFACT GENERATOR */}
        {activeTab === 'oscal' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-white">NIST OSCAL System Security Plan (SSP) Model</h3>
                  <p className="text-xs text-slate-400">Machine-readable compliance artifact ready for FedRAMP PMO and 3PAO auditor ingest</p>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([
                      JSON.stringify(
                        {
                          "system-security-plan": {
                            id: "oscal-ssp-azuregov-01",
                            "schema-version": "1.0.0",
                            metadata: {
                              title: "Azure Government FedRAMP High System Security Plan",
                              published: new Date().toISOString(),
                              version: "3.4.1",
                              "oscal-version": "1.0.4"
                            },
                            "import-profile": {
                              href: "https://github.com/usnistgov/oscal-content/blob/master/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_MODERATE-baseline_profile.json"
                            },
                            "system-characteristics": {
                              "system-name": "Azure Government Mission Cloud",
                              "system-information": {
                                "information-types": [
                                  {
                                    title: "Controlled Unclassified Information (CUI)",
                                    categorization: { "fips-199-high": true }
                                  }
                                ]
                              },
                              "security-sensitivity-level": "high"
                            }
                          }
                        },
                        null,
                        2
                      )
                    ], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'azure_gov_oscal_ssp_export.json';
                    a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download OSCAL JSON
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "system-security-plan": {
    "id": "oscal-ssp-azuregov-01",
    "schema-version": "1.0.0",
    "metadata": {
      "title": "Azure Government FedRAMP High System Security Plan",
      "published": "2025-03-30T14:20:00Z",
      "version": "3.4.1",
      "oscal-version": "1.0.4"
    },
    "system-characteristics": {
      "system-name": "Azure Government Mission Cloud Enclave",
      "deployment-model": "government-community-cloud",
      "security-sensitivity-level": "FedRAMP High / DoD IL5"
    },
    "control-implementation": {
      "description": "Implemented via Azure Policy Gov Initiatives and Azure Blueprints",
      "implemented-requirements": [
        { "control-id": "ac-2", "status": "satisfied", "framework": "NIST SP 800-53 Rev 5" },
        { "control-id": "sc-7", "status": "remediating", "framework": "DoD IL5 Boundary" },
        { "control-id": "sc-13", "status": "satisfied", "framework": "FIPS 140-2/3 Level 3" },
        { "control-id": "au-6", "status": "satisfied", "framework": "Sentinel Gov Audit 365d" }
      ]
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pipeline11_AzureCompliance;