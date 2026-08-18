import React, { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Brain,
  FileText,
  Lock,
  Settings,
  ArrowRight,
  Trash2,
  Check,
  X,
  HelpCircle,
  Sliders,
  Globe,
  DollarSign,
  Activity,
  ShieldAlert,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Card from './Card';
import { callGemini } from '../services/geminiService';

// Define Supplier Interfaces
export interface SecurityQuestionConfig {
  id: string;
  question: string;
  category: 'financial' | 'operational' | 'identity' | 'compliance';
  required: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  country: string;
  riskScore: number; // 0 - 100
  status: 'Active' | 'Pending' | 'Suspended' | 'Under Review';
  pciCompliant: boolean;
  annualSpend: number;
  contactEmail: string;
  securityQuestions: { questionId: string; answerHash: string }[];
  aiRiskAssessment?: {
    summary: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    mitigationSteps: string[];
    scoreBreakdown: {
      financial: number;
      cybersecurity: number;
      geopolitical: number;
    };
  };
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Apex Payment Gateways Ltd',
    category: 'Transaction Processing',
    country: 'United Kingdom',
    riskScore: 18,
    status: 'Active',
    pciCompliant: true,
    annualSpend: 4500000,
    contactEmail: 'compliance@apexpg.co.uk',
    securityQuestions: [
      { questionId: 'q-1', answerHash: '8f93a1b2c3d4e5f6' },
      { questionId: 'q-2', answerHash: '7a6b5c4d3e2f1a0b' }
    ],
    aiRiskAssessment: {
      summary: 'Apex demonstrates robust security controls and high financial stability. Geopolitical risk is minimal due to UK jurisdiction.',
      riskLevel: 'Low',
      mitigationSteps: ['Annual SOC2 review', 'Continuous transaction monitoring'],
      scoreBreakdown: { financial: 95, cybersecurity: 90, geopolitical: 88 }
    }
  },
  {
    id: 'SUP-002',
    name: 'Vortex Cloud Solutions',
    category: 'Infrastructure & Hosting',
    country: 'United States',
    riskScore: 42,
    status: 'Under Review',
    pciCompliant: true,
    annualSpend: 12000000,
    contactEmail: 'security@vortexcloud.com',
    securityQuestions: [
      { questionId: 'q-1', answerHash: '9e8d7c6b5a4f3e2d' }
    ],
    aiRiskAssessment: {
      summary: 'Vortex has experienced minor credential leaks in Q2. While infrastructure is highly resilient, access controls require auditing.',
      riskLevel: 'Medium',
      mitigationSteps: ['Enforce strict IAM policies', 'Perform external penetration testing'],
      scoreBreakdown: { financial: 88, cybersecurity: 65, geopolitical: 92 }
    }
  },
  {
    id: 'SUP-003',
    name: 'ZettaByte Data Analytics',
    category: 'Data Analytics & AI',
    country: 'Singapore',
    riskScore: 25,
    status: 'Active',
    pciCompliant: false,
    annualSpend: 2800000,
    contactEmail: 'privacy@zettabyte.sg',
    securityQuestions: [
      { questionId: 'q-3', answerHash: '1a2b3c4d5e6f7a8b' }
    ],
    aiRiskAssessment: {
      summary: 'ZettaByte handles non-PCI data but processes high volumes of PII. Singapore PDPA compliance is verified.',
      riskLevel: 'Low',
      mitigationSteps: ['Data minimization audits', 'End-to-end encryption verification'],
      scoreBreakdown: { financial: 82, cybersecurity: 85, geopolitical: 90 }
    }
  },
  {
    id: 'SUP-004',
    name: 'Novus Logistics & Cards',
    category: 'Card Manufacturing',
    country: 'Brazil',
    riskScore: 68,
    status: 'Pending',
    pciCompliant: true,
    annualSpend: 850000,
    contactEmail: 'operations@novuslog.br',
    securityQuestions: [],
    aiRiskAssessment: {
      summary: 'Novus faces supply chain bottlenecks and regional economic volatility. Physical security of card manufacturing facilities is under audit.',
      riskLevel: 'High',
      mitigationSteps: ['On-site physical security audit', 'Establish secondary logistics partner'],
      scoreBreakdown: { financial: 45, cybersecurity: 78, geopolitical: 55 }
    }
  }
];

const DEFAULT_SECURITY_QUESTIONS: SecurityQuestionConfig[] = [
  { id: 'q-1', question: 'What is your organization\'s primary Visa Merchant ID (VMID)?', category: 'identity', required: true },
  { id: 'q-2', question: 'What was the exact settlement amount of your last batch transfer?', category: 'financial', required: true },
  { id: 'q-3', question: 'Which hardware security module (HSM) model is deployed in your primary datacenter?', category: 'cybersecurity', required: false },
  { id: 'q-4', question: 'What is the registration number of your primary regulatory compliance license?', category: 'compliance', required: true }
];

export default function VisaSupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestionConfig[]>(DEFAULT_SECURITY_QUESTIONS);
  const [activeTab, setActiveTab] = useState<'directory' | 'onboarding' | 'security' | 'ai-matcher'>('directory');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Bulk Onboarding State
  const [bulkInput, setBulkInput] = useState('');
  const [bulkFormat, setBulkFormat] = useState<'json' | 'csv'>('json');
  const [onboardingLogs, setOnboardingLogs] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // AI Matcher State
  const [procurementNeed, setProcurementNeed] = useState('');
  const [matchingResults, setMatchingResults] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  // AI Risk Analysis State
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState<string | null>(null);

  // Security Question Form State
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<'financial' | 'operational' | 'identity' | 'compliance'>('identity');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);

  // Categories derived from suppliers
  const categories = useMemo(() => {
    const cats = new Set(suppliers.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [suppliers]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliers, searchTerm, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'Active').length;
    const highRisk = suppliers.filter(s => s.riskScore >= 60).length;
    const totalSpend = suppliers.reduce((sum, s) => sum + s.annualSpend, 0);
    return { total, active, highRisk, totalSpend };
  }, [suppliers]);

  // Trigger Gemini-assisted Risk Analysis
  const handleAiRiskAnalysis = async (supplierId: string) => {
    setIsAnalyzingRisk(supplierId);
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const prompt = `
      You are a Visa Enterprise Risk Auditor. Analyze the following supplier for potential risks (financial, cybersecurity, geopolitical) and provide a structured JSON response.
      
      Supplier Details:
      - Name: ${supplier.name}
      - Category: ${supplier.category}
      - Country: ${supplier.country}
      - Annual Spend: $${supplier.annualSpend.toLocaleString()}
      - PCI Compliant: ${supplier.pciCompliant ? 'Yes' : 'No'}
      - Current Risk Score: ${supplier.riskScore}/100

      Provide the response strictly in this JSON format:
      {
        "summary": "A concise 2-sentence risk summary.",
        "riskLevel": "Low" | "Medium" | "High" | "Critical",
        "mitigationSteps": ["Step 1", "Step 2", "Step 3"],
        "scoreBreakdown": {
          "financial": 0-100,
          "cybersecurity": 0-100,
          "geopolitical": 0-100
        }
      }
    `;

    try {
      const responseText = await callGemini(prompt);
      // Clean up potential markdown formatting from Gemini
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);

      setSuppliers(prev => prev.map(s => {
        if (s.id === supplierId) {
          // Calculate new risk score based on AI breakdown (average of inverse scores)
          const avgScore = (result.scoreBreakdown.financial + result.scoreBreakdown.cybersecurity + result.scoreBreakdown.geopolitical) / 3;
          const calculatedRiskScore = Math.round(100 - avgScore);
          return {
            ...s,
            riskScore: calculatedRiskScore,
            aiRiskAssessment: result
          };
        }
        return s;
      }));

      // Update selected supplier view if open
      if (selectedSupplier?.id === supplierId) {
        setSelectedSupplier(prev => prev ? {
          ...prev,
          riskScore: Math.round(100 - ((result.scoreBreakdown.financial + result.scoreBreakdown.cybersecurity + result.scoreBreakdown.geopolitical) / 3)),
          aiRiskAssessment: result
        } : null);
      }

    } catch (error) {
      console.error('Error analyzing risk with Gemini:', error);
      // Fallback mock analysis if API fails
      const mockResult = {
        summary: `[Simulated Analysis] ${supplier.name} shows standard operational risk. Further verification of PCI compliance is recommended.`,
        riskLevel: supplier.riskScore > 60 ? 'High' : supplier.riskScore > 30 ? 'Medium' : 'Low' as any,
        mitigationSteps: ['Perform automated vulnerability scanning', 'Verify business continuity plans'],
        scoreBreakdown: { financial: 75, cybersecurity: 80, geopolitical: 85 }
      };
      setSuppliers(prev => prev.map(s => {
        if (s.id === supplierId) {
          return { ...s, aiRiskAssessment: mockResult };
        }
        return s;
      }));
    } finally {
      setIsAnalyzingRisk(null);
    }
  };

  // Bulk Onboarding Handler
  const handleBulkOnboarding = () => {
    setValidationErrors([]);
    setOnboardingLogs([]);
    const logs: string[] = [];
    const errors: string[] = [];
    let parsedSuppliers: any[] = [];

    if (bulkFormat === 'json') {
      try {
        parsedSuppliers = JSON.parse(bulkInput);
        if (!Array.isArray(parsedSuppliers)) {
          errors.push('JSON must be an array of supplier objects.');
        }
      } catch (e: any) {
        errors.push(`Invalid JSON format: ${e.message}`);
      }
    } else {
      // Simple CSV Parser
      const lines = bulkInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) {
        errors.push('CSV must contain a header row and at least one data row.');
      } else {
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'category', 'country', 'contactemail', 'annualspend'];
        const missing = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missing.length > 0) {
          errors.push(`Missing required CSV headers: ${missing.join(', ')}`);
        } else {
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
              errors.push(`Row ${i + 1} column count mismatch.`);
              continue;
            }
            const supplierObj: any = {};
            headers.forEach((header, idx) => {
              supplierObj[header] = values[idx];
            });
            parsedSuppliers.push({
              name: supplierObj.name,
              category: supplierObj.category,
              country: supplierObj.country,
              contactEmail: supplierObj.contactemail,
              annualSpend: parseFloat(supplierObj.annualspend) || 0,
              pciCompliant: supplierObj.pcicompliant?.toLowerCase() === 'true'
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Process and Onboard
    const newOnboarded: Supplier[] = [];
    parsedSuppliers.forEach((item, index) => {
      if (!item.name || !item.category || !item.country || !item.contactEmail) {
        errors.push(`Record ${index + 1}: Missing required fields (name, category, country, contactEmail).`);
        return;
      }

      const newId = `SUP-${Math.floor(100 + Math.random() * 900)}`;
      const newSup: Supplier = {
        id: newId,
        name: item.name,
        category: item.category,
        country: item.country,
        riskScore: item.riskScore ? parseInt(item.riskScore) : 50, // Default moderate risk
        status: 'Pending',
        pciCompliant: !!item.pciCompliant,
        annualSpend: parseFloat(item.annualSpend) || 0,
        contactEmail: item.contactEmail,
        securityQuestions: []
      };

      newOnboarded.push(newSup);
      logs.push(`Successfully validated and staged: ${newSup.name} (${newSup.id})`);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
    }

    if (newOnboarded.length > 0) {
      setSuppliers(prev => [...prev, ...newOnboarded]);
      logs.push(`Onboarded ${newOnboarded.length} suppliers successfully.`);
      setBulkInput('');
    }
    setOnboardingLogs(logs);
  };

  // AI Procurement Matcher
  const handleProcurementMatch = async () => {
    if (!procurementNeed.trim()) return;
    setIsMatching(true);

    const prompt = `
      You are a Visa Procurement AI Assistant. Match the following procurement requirement against our existing supplier database.
      
      Procurement Requirement:
      "${procurementNeed}"

      Existing Suppliers:
      ${JSON.stringify(suppliers.map(s => ({ id: s.id, name: s.name, category: s.category, country: s.country, riskScore: s.riskScore, pciCompliant: s.pciCompliant })))}

      Provide a structured JSON response ranking the top matches, explaining why they match, and giving a match percentage (0-100). Also suggest 2 key security questions to ask them for this specific need.

      Strict JSON format:
      {
        "matches": [
          {
            "supplierId": "SUP-XXX",
            "matchScore": 85,
            "reasoning": "Explanation of match."
          }
        ],
        "suggestedSecurityQuestions": [
          "Question 1",
          "Question 2"
        ]
      }
    `;

    try {
      const responseText = await callGemini(prompt);
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      setMatchingResults(result);
    } catch (error) {
      console.error('Error matching suppliers with Gemini:', error);
      // Fallback mock matching
      setMatchingResults({
        matches: suppliers.slice(0, 2).map((s, idx) => ({
          supplierId: s.id,
          matchScore: 90 - idx * 15,
          reasoning: `[Simulated Match] ${s.name} operates in ${s.category} which aligns with your request.`
        })),
        suggestedSecurityQuestions: [
          "Do you store, process, or transmit cardholder data for this specific service?",
          "What is your recovery time objective (RTO) in the event of a regional outage?"
        ]
      });
    } finally {
      setIsMatching(false);
    }
  };

  // Add Security Question Config
  const handleAddSecurityQuestion = () => {
    if (!newQuestion.trim()) return;
    const newQ: SecurityQuestionConfig = {
      id: `q-${Math.floor(100 + Math.random() * 900)}`,
      question: newQuestion,
      category: newQuestionCategory,
      required: newQuestionRequired
    };
    setSecurityQuestions(prev => [...prev, newQ]);
    setNewQuestion('');
    setNewQuestionRequired(false);
  };

  // Delete Security Question Config
  const handleDeleteSecurityQuestion = (id: string) => {
    setSecurityQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Visa B2B Ecosystem
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Supplier & Partner Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Commercial-grade supplier onboarding, security question configuration, and Gemini-assisted risk analysis.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
            <div className="text-xs text-slate-500 font-medium">Total Suppliers</div>
            <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
            <div className="text-xs text-slate-500 font-medium">Active Partners</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats.active}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
            <div className="text-xs text-slate-500 font-medium">High Risk (&gt;60)</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{stats.highRisk}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 min-w-[120px]">
            <div className="text-xs text-slate-500 font-medium">Annual Spend</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              ${(stats.totalSpend / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'directory'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Supplier Directory
        </button>
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'onboarding'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Bulk Onboarding
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security & Verification
        </button>
        <button
          onClick={() => setActiveTab('ai-matcher')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ai-matcher'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Brain className="w-4 h-4" />
          AI Procurement Matcher
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column (2 cols wide on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: DIRECTORY */}
          {activeTab === 'directory' && (
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  Active Suppliers
                </h2>
                
                {/* Search & Filters */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Supplier Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Risk Score</th>
                      <th className="py-3 px-4">PCI Status</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No suppliers match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map(supplier => {
                        const riskColor = supplier.riskScore >= 60 
                          ? 'text-rose-400 bg-rose-950/30 border-rose-800/50' 
                          : supplier.riskScore >= 30 
                          ? 'text-amber-400 bg-amber-950/30 border-amber-800/50' 
                          : 'text-emerald-400 bg-emerald-950/30 border-emerald-800/50';

                        const statusColor = supplier.status === 'Active'
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30'
                          : supplier.status === 'Suspended'
                          ? 'text-rose-400 bg-rose-950/20 border-rose-800/30'
                          : 'text-amber-400 bg-amber-950/20 border-amber-800/30';

                        return (
                          <tr 
                            key={supplier.id}
                            onClick={() => setSelectedSupplier(supplier)}
                            className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${
                              selectedSupplier?.id === supplier.id ? 'bg-indigo-950/10 border-l-2 border-indigo-500' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-white">{supplier.name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Globe className="w-3 h-3" /> {supplier.country} • {supplier.id}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">{supplier.category}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${riskColor}`}>
                                {supplier.riskScore}/100
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {supplier.pciCompliant ? (
                                <span className="text-emerald-400 flex items-center gap-1 text-xs">
                                  <ShieldCheck className="w-4 h-4" /> Compliant
                                </span>
                              ) : (
                                <span className="text-slate-500 flex items-center gap-1 text-xs">
                                  <XCircle className="w-4 h-4" /> Non-PCI
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                                {supplier.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleAiRiskAnalysis(supplier.id)}
                                disabled={isAnalyzingRisk === supplier.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 hover:text-indigo-200 border border-indigo-800/50 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                              >
                                {isAnalyzingRisk === supplier.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Brain className="w-3 h-3" />
                                )}
                                AI Audit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 2: BULK ONBOARDING */}
          {activeTab === 'onboarding' && (
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Bulk Supplier Onboarding</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Onboard multiple suppliers simultaneously using structured JSON or CSV formats.
                  </p>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setBulkFormat('json')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      bulkFormat === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    JSON Array
                  </button>
                  <button
                    onClick={() => setBulkFormat('csv')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      bulkFormat === 'csv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    CSV Format
                  </button>
                </div>
              </div>

              {/* Format Helper */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 mb-4 text-xs text-slate-400">
                <span className="font-semibold text-slate-200 block mb-1">Expected Fields:</span>
                {bulkFormat === 'json' ? (
                  <pre className="text-indigo-300 overflow-x-auto">
                    {`[
  {
    "name": "Global Card Logistics",
    "category": "Card Manufacturing",
    "country": "Germany",
    "contactEmail": "onboarding@globallogistics.de",
    "annualSpend": 1500000,
    "pciCompliant": true
  }
]`}
                  </pre>
                ) : (
                  <code className="text-indigo-300 block">
                    name, category, country, contactEmail, annualSpend, pciCompliant<br />
                    Global Card Logistics, Card Manufacturing, Germany, onboarding@globallogistics.de, 1500000, true
                  </code>
                )}
              </div>

              {/* Input Area */}
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={bulkFormat === 'json' ? 'Paste JSON array here...' : 'Paste CSV rows here...'}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono mb-4"
              />

              {/* Validation & Logs */}
              {validationErrors.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 mb-4">
                  <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Validation Errors
                  </h4>
                  <ul className="list-disc list-inside text-xs text-rose-300/90 space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {onboardingLogs.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Onboarding Logs</h4>
                  <div className="space-y-1 font-mono text-xs text-slate-400">
                    {onboardingLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setBulkInput('');
                    setValidationErrors([]);
                    setOnboardingLogs([]);
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-sm font-medium transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkOnboarding}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Validate & Onboard
                </button>
              </div>
            </Card>
          )}

          {/* TAB 3: SECURITY CONFIG */}
          {activeTab === 'security' && (
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  Supplier Portal Security Questions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure verification questions that suppliers must answer to authenticate or authorize high-risk actions.
                </p>
              </div>

              {/* Add Question Form */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-white mb-3">Add New Security Question</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Question Text</label>
                    <input
                      type="text"
                      placeholder="e.g., What is your primary datacenter's physical security certification?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1.5">Category</label>
                    <select
                      value={newQuestionCategory}
                      onChange={(e: any) => setNewQuestionCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="identity">Identity Verification</option>
                      <option value="financial">Financial Audit</option>
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuestionRequired}
                      onChange={(e) => setNewQuestionRequired(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                    />
                    <span className="text-xs text-slate-400 font-medium">Mark as Required for all new suppliers</span>
                  </label>
                  <button
                    onClick={handleAddSecurityQuestion}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>
              </div>

              {/* Configured Questions List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Configured Questions</h3>
                {securityQuestions.map(q => (
                  <div key={q.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {q.category}
                        </span>
                        {q.required && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/30">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200 font-medium">{q.question}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSecurityQuestion(q.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: AI PROCUREMENT MATCHER */}
          {activeTab === 'ai-matcher' && (
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  AI Procurement Matcher
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Describe your procurement or outsourcing need. Gemini will analyze your supplier database to find the best fit.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1.5">Describe Procurement Need</label>
                  <textarea
                    value={procurementNeed}
                    onChange={(e) => setProcurementNeed(e.target.value)}
                    placeholder="e.g., We need a highly secure transaction processor based in Europe or the US with strict PCI compliance to handle high-volume credit card tokenization."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProcurementMatch}
                    disabled={isMatching || !procurementNeed.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isMatching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Matching Suppliers...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Match with Gemini
                      </>
                    )}
                  </button>
                </div>

                {/* Matching Results */}
                {matchingResults && (
                  <div className="border-t border-slate-800/80 pt-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3">Top Supplier Matches</h3>
                      <div className="space-y-3">
                        {matchingResults.matches?.map((match: any, idx: number) => {
                          const supplier = suppliers.find(s => s.id === match.supplierId);
                          if (!supplier) return null;
                          return (
                            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white">{supplier.name}</h4>
                                  <span className="text-xs text-slate-500">({supplier.id})</span>
                                </div>
                                <p className="text-xs text-slate-400 max-w-md">{match.reasoning}</p>
                              </div>
                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <div className="text-right">
                                  <div className="text-xs text-slate-500">Match Score</div>
                                  <div className="text-lg font-bold text-indigo-400">{match.matchScore}%</div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setActiveTab('directory');
                                  }}
                                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-all"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Suggested Security Questions */}
                    {matchingResults.suggestedSecurityQuestions && (
                      <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" /> Suggested Security Questions for this Need
                        </h4>
                        <ul className="space-y-2">
                          {matchingResults.suggestedSecurityQuestions.map((q: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="text-indigo-500 font-bold">{idx + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

        </div>

        {/* Right Column (1 col wide) - Supplier Detail & AI Risk Panel */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900/50 border-slate-800 h-full flex flex-col justify-between">
            {selectedSupplier ? (
              <div className="space-y-6">
                {/* Supplier Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedSupplier.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedSupplier.id} • {selectedSupplier.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSupplier(null)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Country</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">{selectedSupplier.country}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Annual Spend</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">
                      ${selectedSupplier.annualSpend.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">PCI Compliance</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">
                      {selectedSupplier.pciCompliant ? 'Compliant' : 'Non-PCI'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Contact Email</div>
                    <div className="text-xs font-medium text-indigo-400 truncate mt-1">
                      {selectedSupplier.contactEmail}
                    </div>
                  </div>
                </div>

                {/* Risk Score Gauge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Overall Risk Score</span>
                    <span className="text-sm font-bold text-white">{selectedSupplier.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedSupplier.riskScore >= 60 
                          ? 'bg-rose-500' 
                          : selectedSupplier.riskScore >= 30 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedSupplier.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Gemini AI Risk Assessment */}
                <div className="border-t border-slate-800/80 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-4 h-4" /> Gemini Risk Assessment
                    </h4>
                    {selectedSupplier.aiRiskAssessment && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        selectedSupplier.aiRiskAssessment.riskLevel === 'High' || selectedSupplier.aiRiskAssessment.riskLevel === 'Critical'
                          ? 'text-rose-400 bg-rose-950/30 border-rose-800/50'
                          : selectedSupplier.aiRiskAssessment.riskLevel === 'Medium'
                          ? 'text-amber-400 bg-amber-950/30 border-amber-800/50'
                          : 'text-emerald-400 bg-emerald-950/30 border-emerald-800/50'
                      }`}>
                        {selectedSupplier.aiRiskAssessment.riskLevel} Risk
                      </span>
                    )}
                  </div>

                  {selectedSupplier.aiRiskAssessment ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                        {selectedSupplier.aiRiskAssessment.summary}
                      </p>

                      {/* Score Breakdown */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score Breakdown</h5>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                            <div className="text-[10px] text-slate-500">Financial</div>
                            <div className="text-xs font-bold text-slate-200 mt-0.5">
                              {selectedSupplier.aiRiskAssessment.scoreBreakdown.financial}/100
                            </div>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                            <div className="text-[10px] text-slate-500">Cyber</div>
                            <div className="text-xs font-bold text-slate-200 mt-0.5">
                              {selectedSupplier.aiRiskAssessment.scoreBreakdown.cybersecurity}/100
                            </div>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                            <div className="text-[10px] text-slate-500">Geopolitical</div>
                            <div className="text-xs font-bold text-slate-200 mt-0.5">
                              {selectedSupplier.aiRiskAssessment.scoreBreakdown.geopolitical}/100
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mitigation Steps */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mitigation Steps</h5>
                        <ul className="space-y-1.5">
                          {selectedSupplier.aiRiskAssessment.mitigationSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-950 rounded-xl border border-slate-800/60">
                      <p className="text-xs text-slate-500 mb-3">No AI risk assessment generated yet.</p>
                      <button
                        onClick={() => handleAiRiskAnalysis(selectedSupplier.id)}
                        disabled={isAnalyzingRisk === selectedSupplier.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                      >
                        {isAnalyzingRisk === selectedSupplier.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Brain className="w-3.5 h-3.5" />
                        )}
                        Generate AI Assessment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 my-auto">
                <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">No Supplier Selected</h3>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">
                  Select a supplier from the directory to view detailed risk analysis and security configurations.
                </p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}