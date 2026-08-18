import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Play,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Code,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Sliders,
  Layers,
  Search,
  Filter,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Settings,
  Info,
  Activity,
  Terminal,
  CheckSquare
} from 'lucide-react';

// --- TYPES ---

export type StepType = 
  | 'extract_jsonpath'
  | 'rename_field'
  | 'cast_type'
  | 'regex_replace'
  | 'value_mapping'
  | 'anonymize'
  | 'formula'
  | 'custom_expression';

export interface TransformationStep {
  id: string;
  name: string;
  type: StepType;
  sourcePath: string;
  targetPath: string;
  enabled: boolean;
  params: {
    pattern?: string;
    replacement?: string;
    targetType?: 'string' | 'number' | 'boolean' | 'iso_date' | 'array';
    mappingDict?: Record<string, string>;
    formulaExpr?: string;
    maskLength?: number;
  };
}

export interface TransformationRule {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  targetSystem: string;
  status: 'active' | 'draft' | 'deprecated';
  tags: string[];
  version: string;
  steps: TransformationStep[];
  createdAt: string;
  updatedAt: string;
  metrics: {
    totalExecutions: number;
    successRate: number;
    avgLatencyMs: number;
  };
}

export interface StepDebugTrace {
  stepId: string;
  stepName: string;
  stepType: StepType;
  inputState: any;
  outputState: any;
  status: 'success' | 'error' | 'skipped';
  error?: string;
  durationMs: number;
}

export interface ExecutionResult {
  success: boolean;
  outputPayload: any;
  traces: StepDebugTrace[];
  totalDurationMs: number;
  errorMessage?: string;
}

// --- INITIAL MOCK DATA & PRESETS ---

const INITIAL_RULES: TransformationRule[] = [
  {
    id: 'rule-citi-iso20022-normalizer',
    name: 'Citi ISO20022 Camt.053 Statement Normalizer',
    description: 'Extracts SWIFT ISO20022 XML/JSON payload from CitiConnect into internal sovereign ledger ledger format.',
    sourceSystem: 'CitiConnect Gateway',
    targetSystem: 'Sovereign Core Ledger',
    status: 'active',
    version: '1.4.0',
    tags: ['ISO20022', 'Citi', 'Treasury', 'Banking'],
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-02-20T14:22:00Z',
    metrics: {
      totalExecutions: 142850,
      successRate: 99.94,
      avgLatencyMs: 4.2,
    },
    steps: [
      {
        id: 'step-1',
        name: 'Extract Statement ID',
        type: 'extract_jsonpath',
        sourcePath: 'Document.BkToCstmrStmt.Stmt.Id',
        targetPath: 'statementId',
        enabled: true,
        params: {}
      },
      {
        id: 'step-2',
        name: 'Map Account Number',
        type: 'extract_jsonpath',
        sourcePath: 'Document.BkToCstmrStmt.Stmt.Acct.Id.Othr.Id',
        targetPath: 'accountIdentifier',
        enabled: true,
        params: {}
      },
      {
        id: 'step-3',
        name: 'Normalize Amount to Number',
        type: 'cast_type',
        sourcePath: 'Document.BkToCstmrStmt.Stmt.Bal.Amt.value',
        targetPath: 'balanceAmount',
        enabled: true,
        params: { targetType: 'number' }
      },
      {
        id: 'step-4',
        name: 'Map Credit/Debit Indicator',
        type: 'value_mapping',
        sourcePath: 'Document.BkToCstmrStmt.Stmt.Bal.CdtDbtInd',
        targetPath: 'entryType',
        enabled: true,
        params: {
          mappingDict: {
            'CRDT': 'CREDIT',
            'DBIT': 'DEBIT',
            'RCVO': 'RECEIVED'
          }
        }
      },
      {
        id: 'step-5',
        name: 'Anonymize IBAN/Routing Prefix',
        type: 'anonymize',
        sourcePath: 'accountIdentifier',
        targetPath: 'accountIdentifierMasked',
        enabled: true,
        params: { maskLength: 6 }
      }
    ]
  },
  {
    id: 'rule-mt-payment-webhook',
    name: 'Modern Treasury Webhook Standardizer',
    description: 'Normalizes Modern Treasury payment orders into internal settlement queue format.',
    sourceSystem: 'Modern Treasury',
    targetSystem: 'Settlement Engine',
    status: 'active',
    version: '2.1.0',
    tags: ['Webhook', 'Modern Treasury', 'ACH', 'Wire'],
    createdAt: '2025-01-20T08:15:00Z',
    updatedAt: '2025-02-18T11:05:00Z',
    metrics: {
      totalExecutions: 89400,
      successRate: 99.88,
      avgLatencyMs: 2.8,
    },
    steps: [
      {
        id: 'step-mt-1',
        name: 'Extract Event Type',
        type: 'extract_jsonpath',
        sourcePath: 'event',
        targetPath: 'eventType',
        enabled: true,
        params: {}
      },
      {
        id: 'step-mt-2',
        name: 'Map Status Enum',
        type: 'value_mapping',
        sourcePath: 'data.status',
        targetPath: 'normalizedStatus',
        enabled: true,
        params: {
          mappingDict: {
            'completed': 'SETTLED',
            'processing': 'PENDING_BANK',
            'failed': 'REJECTED',
            'cancelled': 'VOIDED'
          }
        }
      },
      {
        id: 'step-mt-3',
        name: 'Convert Cents to Dollars',
        type: 'formula',
        sourcePath: 'data.amount',
        targetPath: 'amountUSD',
        enabled: true,
        params: { formulaExpr: 'val / 100' }
      }
    ]
  },
  {
    id: 'rule-pqc-identity-sanitizer',
    name: 'Quantum Signature Auth Sanitizer',
    description: 'Filters PQC cryptographic metadata before emitting public audit telemetry.',
    sourceSystem: 'PQC Vault Module',
    targetSystem: 'Public Audit Feed',
    status: 'draft',
    version: '0.9.1',
    tags: ['Cryptography', 'PQC', 'Security', 'Telemetry'],
    createdAt: '2025-02-01T14:00:00Z',
    updatedAt: '2025-02-21T09:40:00Z',
    metrics: {
      totalExecutions: 1200,
      successRate: 98.50,
      avgLatencyMs: 6.1,
    },
    steps: [
      {
        id: 'step-pqc-1',
        name: 'Clean Secret Vectors',
        type: 'anonymize',
        sourcePath: 'cryptoEnvelope.privateKeyRef',
        targetPath: 'cryptoEnvelope.privateKeyRef',
        enabled: true,
        params: { maskLength: 12 }
      },
      {
        id: 'step-pqc-2',
        name: 'Cast Timestamp',
        type: 'cast_type',
        sourcePath: 'timestampEpoch',
        targetPath: 'isoTimestamp',
        enabled: true,
        params: { targetType: 'iso_date' }
      }
    ]
  }
];

const SAMPLE_PAYLOADS: Record<string, string> = {
  'citi_iso20022': JSON.stringify({
    "Document": {
      "BkToCstmrStmt": {
        "Stmt": {
          "Id": "STMT-20250222-90182",
          "Acct": {
            "Id": {
              "Othr": {
                "Id": "CITI-US-9827341109"
              }
            }
          },
          "Bal": {
            "Amt": {
              "value": "45250900.50",
              "Ccy": "USD"
            },
            "CdtDbtInd": "CRDT"
          }
        }
      }
    }
  }, null, 2),

  'modern_treasury': JSON.stringify({
    "event": "payment_order.completed",
    "data": {
      "id": "po_89182371928",
      "amount": 1250000,
      "currency": "USD",
      "status": "completed",
      "originating_account_id": "acc_019283712"
    }
  }, null, 2),

  'pqc_auth': JSON.stringify({
    "sessionId": "pqc_sess_990182",
    "timestampEpoch": 1740200000000,
    "cryptoEnvelope": {
      "algorithm": "Kyber1024-Dilithium5",
      "privateKeyRef": "SECKEY-VAULT-9918273-00019283",
      "publicKey": "0x4a9b8c7d...881a"
    }
  }, null, 2)
};

// --- HELPER EVALUATION ENGINE FOR PIPELINE EXECUTION ---

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

function setNestedValue(obj: any, path: string, value: any): void {
  if (!obj || !path) return;
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== 'object') {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

function deepClone<T>(val: T): T {
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return val;
  }
}

export const TransformationRulesManager: React.FC = () => {
  // --- STATES ---
  const [rules, setRules] = useState<TransformationRule[]>(INITIAL_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<string>(INITIAL_RULES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Sandbox State
  const [activeTab, setActiveTab] = useState<'rules' | 'sandbox' | 'analytics'>('sandbox');
  const [testPayloadInput, setTestPayloadInput] = useState<string>(SAMPLE_PAYLOADS['citi_iso20022']);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Edit / Step Modal State
  const [editingStep, setEditingStep] = useState<TransformationStep | null>(null);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<TransformationRule> | null>(null);

  // Active Rule Selector
  const activeRule = useMemo(() => {
    return rules.find(r => r.id === selectedRuleId) || rules[0];
  }, [rules, selectedRuleId]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    rules.forEach(r => r.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [rules]);

  // Filtered Rules list
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rule.sourceSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rule.targetSystem.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'ALL' || rule.tags.includes(selectedTag);
      const matchesStatus = selectedStatus === 'ALL' || rule.status === selectedStatus;
      return matchesSearch && matchesTag && matchesStatus;
    });
  }, [rules, searchQuery, selectedTag, selectedStatus]);

  // --- TRANSFORMATION EXECUTION ENGINE ---

  const executePipeline = (payloadText: string, rule: TransformationRule): ExecutionResult => {
    const startTime = performance.now();
    const traces: StepDebugTrace[] = [];
    let currentPayload: any;

    try {
      currentPayload = JSON.parse(payloadText);
    } catch (e: any) {
      return {
        success: false,
        outputPayload: null,
        traces: [],
        totalDurationMs: 0,
        errorMessage: `Invalid Source JSON: ${e.message}`
      };
    }

    let outputPayload = deepClone(currentPayload);

    for (const step of rule.steps) {
      if (!step.enabled) {
        traces.push({
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
          inputState: deepClone(outputPayload),
          outputState: deepClone(outputPayload),
          status: 'skipped',
          durationMs: 0
        });
        continue;
      }

      const stepStart = performance.now();
      const inputStateBeforeStep = deepClone(outputPayload);

      try {
        const val = getNestedValue(outputPayload, step.sourcePath);

        switch (step.type) {
          case 'extract_jsonpath': {
            if (val !== undefined) {
              setNestedValue(outputPayload, step.targetPath, val);
            }
            break;
          }

          case 'rename_field': {
            if (val !== undefined) {
              setNestedValue(outputPayload, step.targetPath, val);
              // Delete source if different
              if (step.sourcePath !== step.targetPath) {
                // simple removal
                const parts = step.sourcePath.split('.');
                let parent = outputPayload;
                for (let i = 0; i < parts.length - 1; i++) {
                  parent = parent[parts[i]];
                }
                if (parent) delete parent[parts[parts.length - 1]];
              }
            }
            break;
          }

          case 'cast_type': {
            if (val !== undefined) {
              let castedVal: any = val;
              const target = step.params.targetType;
              if (target === 'number') {
                castedVal = Number(val);
              } else if (target === 'string') {
                castedVal = String(val);
              } else if (target === 'boolean') {
                castedVal = Boolean(val);
              } else if (target === 'iso_date') {
                castedVal = new Date(val).toISOString();
              } else if (target === 'array') {
                castedVal = Array.isArray(val) ? val : [val];
              }
              setNestedValue(outputPayload, step.targetPath, castedVal);
            }
            break;
          }

          case 'regex_replace': {
            if (typeof val === 'string' && step.params.pattern) {
              const reg = new RegExp(step.params.pattern, 'g');
              const replaced = val.replace(reg, step.params.replacement || '');
              setNestedValue(outputPayload, step.targetPath, replaced);
            }
            break;
          }

          case 'value_mapping': {
            if (val !== undefined && step.params.mappingDict) {
              const strVal = String(val);
              const mapped = step.params.mappingDict[strVal] ?? val;
              setNestedValue(outputPayload, step.targetPath, mapped);
            }
            break;
          }

          case 'anonymize': {
            if (typeof val === 'string') {
              const maskLen = step.params.maskLength || 4;
              const anonymized = val.length > maskLen 
                ? val.substring(0, val.length - maskLen).replace(/./g, '•') + val.substring(val.length - maskLen)
                : '••••••••';
              setNestedValue(outputPayload, step.targetPath, anonymized);
            }
            break;
          }

          case 'formula': {
            if (step.params.formulaExpr && typeof val === 'number') {
              try {
                // Simple safe calculation simulation
                const expr = step.params.formulaExpr.replace(/val/g, String(val));
                // Basic math evaluation safely using Function constructor
                const calculated = Function(`"use strict"; return (${expr})`)();
                setNestedValue(outputPayload, step.targetPath, calculated);
              } catch (err) {
                throw new Error(`Formula evaluation failed: ${expr}`);
              }
            }
            break;
          }

          case 'custom_expression': {
            // Default pass-through or basic template replace
            if (val !== undefined) {
              setNestedValue(outputPayload, step.targetPath, `[TRANSFORMED: ${val}]`);
            }
            break;
          }
        }

        const stepEnd = performance.now();
        traces.push({
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
          inputState: inputStateBeforeStep,
          outputState: deepClone(outputPayload),
          status: 'success',
          durationMs: parseFloat((stepEnd - stepStart).toFixed(2))
        });

      } catch (err: any) {
        const stepEnd = performance.now();
        traces.push({
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
          inputState: inputStateBeforeStep,
          outputState: deepClone(outputPayload),
          status: 'error',
          error: err.message || 'Error executing step',
          durationMs: parseFloat((stepEnd - stepStart).toFixed(2))
        });

        return {
          success: false,
          outputPayload: null,
          traces,
          totalDurationMs: parseFloat((performance.now() - startTime).toFixed(2)),
          errorMessage: `Step "${step.name}" failed: ${err.message}`
        };
      }
    }

    const totalDurationMs = parseFloat((performance.now() - startTime).toFixed(2));
    return {
      success: true,
      outputPayload,
      traces,
      totalDurationMs
    };
  };

  const handleRunTest = () => {
    setIsExecuting(true);
    setTimeout(() => {
      if (activeRule) {
        const result = executePipeline(testPayloadInput, activeRule);
        setExecutionResult(result);
      }
      setIsExecuting(false);
    }, 150);
  };

  // Run initial test on mount / change rule
  useEffect(() => {
    if (activeRule) {
      const result = executePipeline(testPayloadInput, activeRule);
      setExecutionResult(result);
    }
  }, [selectedRuleId]);

  // --- ACTIONS ---

  const handleToggleStep = (stepId: string) => {
    if (!activeRule) return;
    const updatedSteps = activeRule.steps.map(s => 
      s.id === stepId ? { ...s, enabled: !s.enabled } : s
    );
    const updatedRule = { ...activeRule, steps: updatedSteps, updatedAt: new Date().toISOString() };
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const handleDeleteStep = (stepId: string) => {
    if (!activeRule) return;
    const updatedSteps = activeRule.steps.filter(s => s.id !== stepId);
    const updatedRule = { ...activeRule, steps: updatedSteps, updatedAt: new Date().toISOString() };
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const handleSaveStep = (step: TransformationStep) => {
    if (!activeRule) return;
    const exists = activeRule.steps.some(s => s.id === step.id);
    let updatedSteps: TransformationStep[];
    if (exists) {
      updatedSteps = activeRule.steps.map(s => s.id === step.id ? step : s);
    } else {
      updatedSteps = [...activeRule.steps, step];
    }
    const updatedRule = { ...activeRule, steps: updatedSteps, updatedAt: new Date().toISOString() };
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
    setIsStepModalOpen(false);
    setEditingStep(null);
  };

  const handleDuplicateRule = (rule: TransformationRule) => {
    const newRule: TransformationRule = {
      ...deepClone(rule),
      id: `rule-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: { totalExecutions: 0, successRate: 100, avgLatencyMs: 0 }
    };
    setRules([newRule, ...rules]);
    setSelectedRuleId(newRule.id);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (rules.length <= 1) {
      alert("At least one rule pipeline must remain.");
      return;
    }
    const filtered = rules.filter(r => r.id !== ruleId);
    setRules(filtered);
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(filtered[0].id);
    }
  };

  const handleCreateNewRule = () => {
    const newRule: TransformationRule = {
      id: `rule-custom-${Date.now()}`,
      name: 'New Custom Transformation Pipeline',
      description: 'Custom payload transformation pipeline step sequence.',
      sourceSystem: 'Custom Gateway',
      targetSystem: 'Sovereign Ledger',
      status: 'draft',
      version: '1.0.0',
      tags: ['Custom'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: { totalExecutions: 0, successRate: 100, avgLatencyMs: 0 },
      steps: []
    };
    setRules([newRule, ...rules]);
    setSelectedRuleId(newRule.id);
    setActiveTab('rules');
  };

  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `transformation_rules_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setRules(parsed);
            if (parsed.length > 0) setSelectedRuleId(parsed[0].id);
            alert(`Successfully imported ${parsed.length} rule pipelines.`);
          }
        } catch (err) {
          alert("Invalid JSON configuration file format.");
        }
      };
    }
  };

  const handleLoadSamplePayload = (key: string) => {
    if (SAMPLE_PAYLOADS[key]) {
      setTestPayloadInput(SAMPLE_PAYLOADS[key]);
    }
  };

  // Render UI
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased">
      {/* HEADER BAR */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sliders className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Payload Transformation Engine
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    v3.4 Production
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Design, manage, validate, and execute complex field mapping pipelines across banking and sovereign API gateways.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportConfig}
              className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> Export Config
            </button>
            <label className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium flex items-center gap-2 cursor-pointer transition-all">
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
            </label>
            <button
              onClick={handleCreateNewRule}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> New Pipeline
            </button>
          </div>
        </div>

        {/* METRICS METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Pipelines</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {rules.filter(r => r.status === 'active').length} <span className="text-xs font-normal text-slate-400">/ {rules.length} total</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>24h Throughput</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              233.4K <span className="text-xs font-normal text-emerald-400">+12.4%</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Avg Latency</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              3.85 ms
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Validation Conformance</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              99.96%
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sandbox'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" /> Pipeline Tester & Live Sandbox
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Rule Pipeline Manager ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Performance & Telemetry Audit
          </button>
        </div>
      </header>

      {/* TABS CONTENT */}

      {/* --- TAB 1: PIPELINE TESTER & SANDBOX --- */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          {/* Active Rule Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pipeline:</span>
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[280px]"
              >
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.steps.filter(s => s.enabled).length} active steps)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Load Preset:</span>
              <button
                onClick={() => handleLoadSamplePayload('citi_iso20022')}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700"
              >
                Citi ISO20022
              </button>
              <button
                onClick={() => handleLoadSamplePayload('modern_treasury')}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700"
              >
                Modern Treasury
              </button>
              <button
                onClick={() => handleLoadSamplePayload('pqc_auth')}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700"
              >
                PQC Identity
              </button>
              <button
                onClick={handleRunTest}
                disabled={isExecuting}
                className="ml-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                Execute Pipeline
              </button>
            </div>
          </div>

          {/* Side-by-Side Editor & Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Json Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-200">Source Input Payload (JSON)</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {testPayloadInput.length} chars
                </span>
              </div>
              <div className="p-3 bg-slate-950 font-mono text-xs flex-1">
                <textarea
                  value={testPayloadInput}
                  onChange={(e) => setTestPayloadInput(e.target.value)}
                  rows={18}
                  className="w-full h-full bg-slate-950 text-emerald-400 p-2 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none leading-relaxed"
                  placeholder="Paste incoming source JSON payload here..."
                />
              </div>
            </div>

            {/* Transformed Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-slate-200">Transformed Output Payload</span>
                </div>
                {executionResult && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">Execution:</span>
                    <span className="font-mono text-amber-400 font-medium">
                      {executionResult.totalDurationMs} ms
                    </span>
                    {executionResult.success ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Error
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 font-mono text-xs flex-1 overflow-auto">
                {executionResult ? (
                  executionResult.success ? (
                    <pre className="text-indigo-300 p-2 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(executionResult.outputPayload, null, 2)}
                    </pre>
                  ) : (
                    <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-lg text-rose-300 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm">Pipeline Execution Failure</div>
                        <div className="text-xs mt-1 text-rose-400/90 font-mono">
                          {executionResult.errorMessage}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                    <Terminal className="w-8 h-8 mb-2 opacity-50" />
                    <span>Click "Execute Pipeline" to view output JSON</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP BY STEP EXECUTION TRACE DEBUGGER */}
          {executionResult && executionResult.traces.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Pipeline Step Execution Trace & Differential Debugger
              </h3>

              <div className="space-y-3">
                {executionResult.traces.map((trace, idx) => (
                  <div
                    key={trace.stepId}
                    className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{trace.stepName}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                            {trace.stepType}
                          </span>
                        </div>
                        {trace.error && (
                          <p className="text-xs text-rose-400 mt-1 font-mono">{trace.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400 font-mono">{trace.durationMs} ms</span>
                      {trace.status === 'success' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          Passed
                        </span>
                      )}
                      {trace.status === 'error' && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-xs font-medium">
                          Failed
                        </span>
                      )}
                      {trace.status === 'skipped' && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-xs font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: PIPELINE MANAGER & STEP BUILDER --- */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* RULE PIPELINES SIDEBAR LIST */}
          <div className="lg:col-span-5 space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search rules, systems, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Tags</option>
                  {allTags.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
              {filteredRules.map(rule => {
                const isSelected = rule.id === selectedRuleId;
                return (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-600/5'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300">
                        {rule.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${
                        rule.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : rule.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {rule.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {rule.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                        {rule.sourceSystem}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-300">
                        {rule.targetSystem}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rule.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateRule(rule); }}
                          title="Duplicate Rule"
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRule(rule.id); }}
                          title="Delete Rule"
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE RULE PIPELINE DETAILED BUILDER */}
          <div className="lg:col-span-7 space-y-6">
            {activeRule ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                {/* Pipeline Title Header */}
                <div className="flex items-start justify-between pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{activeRule.name}</h2>
                      <span className="text-xs font-mono text-slate-500">v{activeRule.version}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{activeRule.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingStep({
                        id: `step-${Date.now()}`,
                        name: 'New Transformation Step',
                        type: 'extract_jsonpath',
                        sourcePath: '',
                        targetPath: '',
                        enabled: true,
                        params: {}
                      });
                      setIsStepModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" /> Add Step
                  </button>
                </div>

                {/* STEPS SEQUENCE LIST */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Transformation Steps Sequence ({activeRule.steps.length})
                    </h3>
                    <span className="text-xs text-slate-500">
                      Execution order: Top to Bottom
                    </span>
                  </div>

                  {activeRule.steps.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                      No transformation steps added yet. Click "Add Step" above to create one.
                    </div>
                  ) : (
                    activeRule.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-xl border transition-all ${
                          step.enabled
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-slate-100">{step.name}</h4>
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono">
                                  {step.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                                <span className="text-indigo-400">{step.sourcePath || '(root)'}</span>
                                <ArrowRight className="w-3 h-3 text-slate-600" />
                                <span className="text-emerald-400">{step.targetPath}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStep(step.id)}
                              className={`px-2.5 py-1 rounded text-xs font-medium border ${
                                step.enabled
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-500 border-slate-700'
                              }`}
                            >
                              {step.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingStep(deepClone(step));
                                setIsStepModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Additional Parameter Preview */}
                        {Object.keys(step.params).length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-900 text-xs text-slate-400 font-mono flex items-center gap-3">
                            {step.params.targetType && <span>Target Type: {step.params.targetType}</span>}
                            {step.params.pattern && <span>Regex Pattern: /{step.params.pattern}/</span>}
                            {step.params.formulaExpr && <span>Formula: {step.params.formulaExpr}</span>}
                            {step.params.maskLength && <span>Mask Len: {step.params.maskLength}</span>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-20">Select a rule to edit details</div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: PERFORMANCE & TELEMETRY AUDIT --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-2">Pipeline Telemetry & Execution Profiler</h2>
            <p className="text-xs text-slate-400 mb-6">
              Real-time audit performance statistics for active payload mapping rules across all gateway nodes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Pipeline Name</th>
                    <th className="py-3 px-4">Source System</th>
                    <th className="py-3 px-4">Target System</th>
                    <th className="py-3 px-4 text-right">Executions (24h)</th>
                    <th className="py-3 px-4 text-right">Success Rate</th>
                    <th className="py-3 px-4 text-right">Avg Latency</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {rules.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="py-3.5 px-4 font-semibold text-white">{r.name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">{r.sourceSystem}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-emerald-300">{r.targetSystem}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{r.metrics.totalExecutions.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400">{r.metrics.successRate}%</td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-300">{r.metrics.avgLatencyMs} ms</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {r.status}
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

      {/* --- EDIT STEP MODAL --- */}
      {isStepModalOpen && editingStep && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Configure Transformation Step</h3>
              <button
                onClick={() => setIsStepModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Step Display Name</label>
                <input
                  type="text"
                  value={editingStep.name}
                  onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Transformation Type</label>
                <select
                  value={editingStep.type}
                  onChange={(e) => setEditingStep({ ...editingStep, type: e.target.value as StepType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="extract_jsonpath">Extract JSONPath Value</option>
                  <option value="rename_field">Rename Field Key</option>
                  <option value="cast_type">Cast Data Type</option>
                  <option value="regex_replace">Regex Pattern Replace</option>
                  <option value="value_mapping">Dictionary Value Mapping</option>
                  <option value="anonymize">Anonymize / Mask String</option>
                  <option value="formula">Arithmetic Formula Scaling</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Source Dotted Path</label>
                  <input
                    type="text"
                    placeholder="e.g. data.amount"
                    value={editingStep.sourcePath}
                    onChange={(e) => setEditingStep({ ...editingStep, sourcePath: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Dotted Path</label>
                  <input
                    type="text"
                    placeholder="e.g. normalizedAmount"
                    value={editingStep.targetPath}
                    onChange={(e) => setEditingStep({ ...editingStep, targetPath: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* DYNAMIC PARAMETERS BASED ON TYPE */}
              {editingStep.type === 'cast_type' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Data Type</label>
                  <select
                    value={editingStep.params.targetType || 'string'}
                    onChange={(e) => setEditingStep({
                      ...editingStep,
                      params: { ...editingStep.params, targetType: e.target.value as any }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="iso_date">ISO Date String</option>
                    <option value="array">Array Wrapped</option>
                  </select>
                </div>
              )}

              {editingStep.type === 'regex_replace' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Regex Pattern</label>
                    <input
                      type="text"
                      placeholder="e.g. [^0-9]"
                      value={editingStep.params.pattern || ''}
                      onChange={(e) => setEditingStep({
                        ...editingStep,
                        params: { ...editingStep.params, pattern: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Replacement</label>
                    <input
                      type="text"
                      placeholder="e.g. empty string"
                      value={editingStep.params.replacement || ''}
                      onChange={(e) => setEditingStep({
                        ...editingStep,
                        params: { ...editingStep.params, replacement: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {editingStep.type === 'formula' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Formula Expression (use 'val')</label>
                  <input
                    type="text"
                    placeholder="e.g. val / 100"
                    value={editingStep.params.formulaExpr || ''}
                    onChange={(e) => setEditingStep({
                      ...editingStep,
                      params: { ...editingStep.params, formulaExpr: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              )}

              {editingStep.type === 'anonymize' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Unmasked Tail Characters</label>
                  <input
                    type="number"
                    value={editingStep.params.maskLength || 4}
                    onChange={(e) => setEditingStep({
                      ...editingStep,
                      params: { ...editingStep.params, maskLength: parseInt(e.target.value) || 4 }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsStepModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveStep(editingStep)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Transformation Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransformationRulesManager;
