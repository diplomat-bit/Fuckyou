

// --- CONSOLIDATED FROM: ./components/government/IrsTaxFiling_v2.tsx ---

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  Building,
  DollarSign,
  Info,
  Plus,
  Trash,
  FileCheck,
  History,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Bot,
  Home,
  Code,
  Scale,
  Landmark,
  Sparkles,
  Copy,
  ExternalLink,
  MessageSquare,
  Search,
  Award,
  Terminal,
  ChevronRight,
  PieChart as PieIcon,
  Zap,
  Check,
  Share2,
  FileCode,
  ArrowUpRight,
  Lock,
  Layers,
  Cpu,
  RefreshCw,
  Globe,
  Sliders,
  Database
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Mock Data Types
interface TaxTransaction {
  id: string;
  asset: string;
  type: "BUY" | "SELL" | "DIVIDEND" | "INTEREST" | "EXPENSE";
  amount: number;
  costBasis: number;
  proceeds: number;
  date: string;
  washSale: boolean;
  gainLoss: number;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  status: "PASSED" | "WARNING" | "FAILED" | "PENDING";
  category: "WASH_SALE" | "COST_BASIS" | "DEDUCTION" | "CRYPTO" | "SIGNATURE";
}

interface TaxForm {
  id: string;
  name: string;
  title: string;
  status: "READY" | "DRAFT" | "INCOMPLETE";
  fieldsCount: number;
}

export default function IrsTaxFiling_v2() {
  // State
  const [taxYear, setTaxYear] = useState<number>(2024);
  const [accountingMethod, setAccountingMethod] = useState<"FIFO" | "LIFO" | "HIFO">("FIFO");
  const [filingStatus, setFilingStatus] = useState<"DRAFT" | "VALIDATING" | "SIGNED" | "SUBMITTED" | "ACCEPTED">("DRAFT");
  const [activeTab, setActiveTab] = useState<"overview" | "forms" | "ledger" | "compliance" | "efile">("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System initialized. IRS MeF Gateway v4.2 online.",
    "Awaiting tax data ingestion or compliance scan initiation."
  ]);

  // Interactive AI Chat State
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your AI Tax Compliance Assistant. I can help you optimize your capital gains matching, analyze wash sales, or prepare your Schedule D. What would you like to review today?",
      timestamp: "10:00 AM"
    }
  ]);

  // Mock Transactions
  const [transactions, setTransactions] = useState<TaxTransaction[]>([
    { id: "TX-1001", asset: "NVDA", type: "SELL", amount: 150, costBasis: 12000, proceeds: 18500, date: "2024-02-14", washSale: false, gainLoss: 6500 },
    { id: "TX-1002", asset: "AAPL", type: "SELL", amount: 80, costBasis: 14000, proceeds: 13200, date: "2024-03-01", washSale: true, gainLoss: -800 },
    { id: "TX-1003", asset: "BTC", type: "SELL", amount: 0.5, costBasis: 22000, proceeds: 31500, date: "2024-04-10", washSale: false, gainLoss: 9500 },
    { id: "TX-1004", asset: "MSFT", type: "DIVIDEND", amount: 0, costBasis: 0, proceeds: 450, date: "2024-06-15", washSale: false, gainLoss: 450 },
    { id: "TX-1005", asset: "ETH", type: "SELL", amount: 4.0, costBasis: 11000, proceeds: 14200, date: "2024-08-22", washSale: false, gainLoss: 3200 },
    { id: "TX-1006", asset: "TSLA", type: "SELL", amount: 50, costBasis: 12500, proceeds: 10500, date: "2024-09-05", washSale: true, gainLoss: -2000 },
    { id: "TX-1007", asset: "SaaS Subscription", type: "EXPENSE", amount: 0, costBasis: 1200, proceeds: 0, date: "2024-10-12", washSale: false, gainLoss: -1200 },
    { id: "TX-1008", asset: "Server Infrastructure", type: "EXPENSE", amount: 0, costBasis: 4500, proceeds: 0, date: "2024-11-01", washSale: false, gainLoss: -4500 }
  ]);

  // Mock Compliance Rules
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([
    { id: "RULE-01", name: "Wash Sale Rule Detection (Section 1091)", description: "Identifies replacement shares purchased within 30 days before or after a loss sale.", status: "WARNING", category: "WASH_SALE" },
    { id: "RULE-02", name: "Cost Basis Consistency Check", description: "Verifies cost basis reporting matches Form 1099-B records from custodians.", status: "PASSED", category: "COST_BASIS" },
    { id: "RULE-03", name: "Digital Asset Reporting Compliance", description: "Ensures all cryptocurrency and NFT transactions are reported on Form 8949.", status: "PASSED", category: "CRYPTO" },
    { id: "RULE-04", name: "Business Expense Substantiation", description: "Validates that ordinary and necessary business expenses have attached digital receipts.", status: "WARNING", category: "DEDUCTION" },
    { id: "RULE-05", name: "JWS Cryptographic Signature Verification", description: "Ensures the final XML payload is signed with an authorized corporate certificate.", status: "PENDING", category: "SIGNATURE" }
  ]);

  // Mock Forms List
  const formsList: TaxForm[] = [
    { id: "FORM-1120S", name: "Form 1120-S", title: "U.S. Income Tax Return for an S Corporation", status: "DRAFT", fieldsCount: 84 },
    { id: "FORM-8949", name: "Form 8949", title: "Sales and Other Dispositions of Capital Assets", status: "READY", fieldsCount: 112 },
    { id: "FORM-1040-SCH-D", name: "Schedule D (Form 1040)", title: "Capital Gains and Losses", status: "READY", fieldsCount: 45 },
    { id: "FORM-1099-B", name: "Form 1099-B Reconciliation", title: "Proceeds From Broker and Barter Exchange Transactions", status: "READY", fieldsCount: 60 },
    { id: "FORM-1099-DIV", name: "Form 1099-DIV Ingestion", title: "Dividends and Distributions", status: "READY", fieldsCount: 28 }
  ];

  // Log helper
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    addLog(`Copied ${label} to clipboard.`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Calculations
  const totals = useMemo(() => {
    let shortTermGains = 0;
    let longTermGains = 0;
    let totalDeductions = 0;
    let washSaleDisallowed = 0;

    transactions.forEach((tx) => {
      if (tx.type === "SELL") {
        if (tx.gainLoss > 0) {
          shortTermGains += tx.gainLoss; // Simplifying all as short-term for mock
        } else {
          if (tx.washSale) {
            washSaleDisallowed += Math.abs(tx.gainLoss);
          } else {
            shortTermGains += tx.gainLoss; // Net loss
          }
        }
      } else if (tx.type === "DIVIDEND" || tx.type === "INTEREST") {
        shortTermGains += tx.proceeds;
      } else if (tx.type === "EXPENSE") {
        totalDeductions += tx.costBasis;
      }
    });

    const netCapitalGains = shortTermGains + longTermGains;
    const estimatedTaxLiability = Math.max(0, (netCapitalGains - totalDeductions) * 0.21); // Corporate tax rate 21%

    return {
      shortTermGains,
      longTermGains,
      totalDeductions,
      washSaleDisallowed,
      netCapitalGains,
      estimatedTaxLiability
    };
  }, [transactions]);

  // Compliance Score
  const complianceScore = useMemo(() => {
    const total = complianceRules.length;
    const passed = complianceRules.filter((r) => r.status === "PASSED").length;
    const warnings = complianceRules.filter((r) => r.status === "WARNING").length;
    return Math.round(((passed + warnings * 0.5) / total) * 100);
  }, [complianceRules]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [transactions, searchQuery]);

  // Run Compliance Scan
  const runComplianceScan = () => {
    setIsScanning(true);
    addLog("Starting automated tax compliance scan...");
    
    setTimeout(() => {
      setComplianceRules((prev) =>
        prev.map((rule) => {
          if (rule.category === "WASH_SALE") {
            return { ...rule, status: "WARNING", description: "Wash sale detected on TSLA & AAPL. Disallowed losses applied to cost basis." };
          }
          if (rule.category === "DEDUCTION") {
            return { ...rule, status: "PASSED", description: "All business expenses verified with matching digital receipts." };
          }
          return { ...rule, status: "PASSED" };
        })
      );
      setIsScanning(false);
      addLog("Compliance scan completed. 4/5 rules passed. 1 warning remaining.");
    }, 2000);
  };

  // Generate IRS MeF XML Payload
  const generatedXmlPayload = useMemo(() => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<IRS1120S xmlns="http://www.irs.gov/efile" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.irs.gov/efile">
  <ReturnHeader binaryAttachmentCnt="0">
    <TaxYear>${taxYear}</TaxYear>
    <ReturnTypeCd>1120S</ReturnTypeCd>
    <TaxpayerSSN>XX-XXX9999</TaxpayerSSN>
    <BusinessName>
      <BusinessNameLine1Txt>AQUARIUS SOVEREIGN CORP</BusinessNameLine1Txt>
    </BusinessName>
    <AccountingMethod>${accountingMethod}</AccountingMethod>
    <Timestamp>${new Date().toISOString()}</Timestamp>
  </ReturnHeader>
  <ReturnData>
    <Form1120S>
      <GrossReceiptsOrSalesAmt>${(totals.netCapitalGains + 150000).toFixed(2)}</GrossReceiptsOrSalesAmt>
      <CostOfGoodsSoldAmt>0.00</CostOfGoodsSoldAmt>
      <GrossProfitAmt>${(totals.netCapitalGains + 150000).toFixed(2)}</GrossProfitAmt>
      <TotalDeductionsAmt>${totals.totalDeductions.toFixed(2)}</TotalDeductionsAmt>
      <NetIncomeLossAmt>${(totals.netCapitalGains - totals.totalDeductions).toFixed(2)}</NetIncomeLossAmt>
    </Form1120S>
    <ScheduleD>
      <TotalShortTermCapitalGains>${totals.shortTermGains.toFixed(2)}</TotalShortTermCapitalGains>
      <WashSaleLossDisallowedAmt>${totals.washSaleDisallowed.toFixed(2)}</WashSaleLossDisallowedAmt>
      <NetCapitalGainOrLossAmt>${totals.netCapitalGains.toFixed(2)}</NetCapitalGainOrLossAmt>
    </ScheduleD>
  </ReturnData>
</IRS1120S>`;
  }, [taxYear, accountingMethod, totals]);

  // Cryptographic Signature Block
  const signatureBlock = useMemo(() => {
    return JSON.stringify(
      {
        alg: "RS256",
        kid: "aquarius-gov-key-001",
        crit: ["b64"],
        b64: false,
        payload_hash: "sha256-8f9c2b1a3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u",
        signature: "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3Yv...[TRUNCATED]...zX9g==",
        signing_authority: "Sovereign Identity Citadel HSM",
        timestamp: new Date().toISOString()
      },
      null,
      2
    );
  }, [filingStatus]);

  // Handle E-File Submission
  const handleEFileSubmit = () => {
    setIsSubmitting(true);
    setFilingStatus("VALIDATING");
    addLog("Initiating secure handshake with IRS MeF Gateway...");

    setTimeout(() => {
      addLog("IRS MeF Gateway handshake successful. Validating XML schema conformance...");
      setFilingStatus("SIGNED");
    }, 1500);

    setTimeout(() => {
      addLog("Cryptographic signature verified. Transmitting encrypted tax payload via AS2 protocol...");
      setFilingStatus("SUBMITTED");
    }, 3000);

    setTimeout(() => {
      addLog("IRS MeF Gateway response: ACCEPTED. Submission ID: MeF-2024-99812-A9F.");
      setFilingStatus("ACCEPTED");
      setIsSubmitting(false);
    }, 5000);
  };

  // AI Chat Submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const query = chatInput.toLowerCase();
    setChatInput("");

    addLog(`AI Tax Assistant queried: "${query.substring(0, 30)}..."`);

    // Simulated AI Responses
    setTimeout(() => {
      let aiText = "I've analyzed your query. Based on IRS guidelines, we should ensure all capital gains are matched correctly.";
      
      if (query.includes("wash sale") || query.includes("wash-sale")) {
        aiText = "Under Section 1091, your wash sale on TSLA disallowed a $2,000 loss because replacement shares were acquired within the 30-day window. This loss has been added to the cost basis of the newly acquired shares to defer the tax benefit legally.";
      } else if (query.includes("fifo") || query.includes("lifo") || query.includes("hifo")) {
        aiText = `You are currently using ${accountingMethod}. Switching to HIFO (Highest-In, First-Out) could potentially reduce your current net capital gains by matching your highest-cost lots first, thereby lowering your estimated tax liability of $${totals.estimatedTaxLiability.toLocaleString()}.`;
      } else if (query.includes("deduction") || query.includes("expense")) {
        aiText = "Your business expenses total $5,700. Under Section 162, ordinary and necessary expenses for software development and server infrastructure are fully deductible. Ensure your digital receipts are cryptographically anchored in the Sovereign Files Vault.";
      } else if (query.includes("efile") || query.includes("submit")) {
        aiText = "To e-file, navigate to the 'E-File Portal' tab, verify the generated XML payload, sign it using your Identity Citadel HSM key, and click 'Transmit to IRS'. The system will handle the secure AS2 transmission.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 1000);
  };

  // Recharts Data
  const chartData = [
    { name: "Capital Gains", value: totals.shortTermGains },
    { name: "Deductions", value: totals.totalDeductions },
    { name: "Wash Sales Disallowed", value: totals.washSaleDisallowed },
    { name: "Tax Liability", value: totals.estimatedTaxLiability }
  ];

  const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Scale className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">IRS Tax Filing & Compliance</h1>
              <p className="text-sm text-slate-400">Automated corporate tax reporting, lot matching, and secure MeF e-filing</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tax Year Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400 mr-2">Tax Year:</span>
            <select
              value={taxYear}
              onChange={(e) => {
                setTaxYear(Number(e.target.value));
                addLog(`Switched tax year to ${e.target.value}`);
              }}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={2025} className="bg-slate-900">2025 (Projections)</option>
              <option value={2024} className="bg-slate-900">2024 (Current)</option>
              <option value={2023} className="bg-slate-900">2023 (Archived)</option>
            </select>
          </div>

          {/* Accounting Method Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400 mr-2">Method:</span>
            <select
              value={accountingMethod}
              onChange={(e) => {
                const method = e.target.value as "FIFO" | "LIFO" | "HIFO";
                setAccountingMethod(method);
                addLog(`Accounting method changed to ${method}. Recalculating cost basis...`);
              }}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="FIFO" className="bg-slate-900">FIFO</option>
              <option value="LIFO" className="bg-slate-900">LIFO</option>
              <option value="HIFO" className="bg-slate-900">HIFO (Tax Optimized)</option>
            </select>
          </div>

          {/* Filing Status Badge */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400">Status:</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                filingStatus === "ACCEPTED"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : filingStatus === "SUBMITTED"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : filingStatus === "SIGNED"
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : filingStatus === "VALIDATING"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {filingStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Estimated Tax Liability</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              ${totals.estimatedTaxLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3" /> Net Rate: 21% (Corporate)
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <DollarSign className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Net Capital Gains</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              ${totals.netCapitalGains.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Includes dividends & interest</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <ArrowUpRight className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Deductions</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">
              ${totals.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
              <Info className="h-3 w-3" /> Section 162 Deductible
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Building className="h-6 w-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Compliance Health Score</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{complianceScore}%</h3>
            <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${complianceScore}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <FileCheck className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "forms"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          IRS Forms ({formsList.length})
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "ledger"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Transaction Ledger
        </button>
        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "compliance"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Compliance Rules
        </button>
        <button
          onClick={() => setActiveTab("efile")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "efile"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          E-File Portal
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column (Dynamic based on tab) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Chart & Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-emerald-400" /> Tax Breakdown Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                          labelStyle={{ color: "#f1f5f9" }}
                        />
                        <Bar dataKey="value" fill="#10B981">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-emerald-500 pl-3">
                      <p className="text-xs text-slate-400">Capital Gains</p>
                      <p className="text-lg font-bold">${totals.shortTermGains.toLocaleString()}</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-3">
                      <p className="text-xs text-slate-400">Deductions</p>
                      <p className="text-lg font-bold">${totals.totalDeductions.toLocaleString()}</p>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-3">
                      <p className="text-xs text-slate-400">Wash Sales Disallowed</p>
                      <p className="text-lg font-bold">${totals.washSaleDisallowed.toLocaleString()}</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="text-xs text-slate-400">Estimated Tax Liability</p>
                      <p className="text-lg font-bold">${totals.estimatedTaxLiability.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Automated Compliance Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={runComplianceScan}
                    disabled={isScanning}
                    className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Cpu className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-200">Run Compliance Scan</p>
                        <p className="text-xs text-slate-400">Scan wash sales & cost basis</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>

                  <button
                    onClick={() => setActiveTab("efile")}
                    className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Send className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-200">Prepare E-File XML</p>
                        <p className="text-xs text-slate-400">Generate IRS MeF schema</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Forms */}
          {activeTab === "forms" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">IRS Tax Forms & Schedules</h3>
                <button
                  onClick={() => addLog("Initiated manual form generation...")}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="h-4 w-4" /> Generate Form
                </button>
              </div>

              <div className="space-y-3">
                {formsList.map((form) => (
                  <div
                    key={form.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 mt-1">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-200">{form.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              form.status === "READY"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {form.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{form.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{form.fieldsCount} active data fields mapped</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => addLog(`Viewing draft for ${form.name}`)}
                        className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Edit Draft
                      </button>
                      <button
                        onClick={() => addLog(`Downloaded PDF for ${form.name}`)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Ledger */}
          {activeTab === "ledger" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Transaction Ledger</h3>
                  <p className="text-xs text-slate-400">Tax-relevant capital gains, dividends, and business expenses</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search asset or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Cost Basis</th>
                      <th className="py-3 px-4 text-right">Proceeds</th>
                      <th className="py-3 px-4 text-right">Gain/Loss</th>
                      <th className="py-3 px-4 text-center">Wash Sale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400">{tx.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{tx.asset}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tx.type === "BUY"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : tx.type === "SELL"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : tx.type === "DIVIDEND" || tx.type === "INTEREST"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">{tx.date}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          {tx.costBasis > 0 ? `$${tx.costBasis.toLocaleString()}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {tx.proceeds > 0 ? `$${tx.proceeds.toLocaleString()}` : "-"}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-semibold ${
                            tx.gainLoss > 0 ? "text-emerald-400" : tx.gainLoss < 0 ? "text-red-400" : "text-slate-400"
                          }`}
                        >
                          {tx.gainLoss > 0 ? "+" : ""}
                          {tx.gainLoss.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.washSale ? (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="h-3 w-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Compliance */}
          {activeTab === "compliance" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Compliance Rules Engine</h3>
                  <p className="text-xs text-slate-400">Automated checks against IRS tax codes and regulations</p>
                </div>
                <button
                  onClick={runComplianceScan}
                  disabled={isScanning}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Run Scan
                </button>
              </div>

              <div className="space-y-3">
                {complianceRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-950 border border-slate-800 rounded-xl gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {rule.status === "PASSED" && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                        {rule.status === "WARNING" && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                        {rule.status === "FAILED" && <ShieldAlert className="h-5 w-5 text-red-400" />}
                        {rule.status === "PENDING" && <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{rule.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        rule.status === "PASSED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : rule.status === "WARNING"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : rule.status === "FAILED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {rule.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: E-File */}
          {activeTab === "efile" && (
            <div className="space-y-6">
              {/* E-File Control Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">IRS MeF E-Filing Portal</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Transmit your finalized corporate tax return directly to the IRS Modernized e-File (MeF) system.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-400">Filing Method</p>
                    <p className="text-sm font-bold text-slate-200 mt-1">AS2 Secure Protocol</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-400">Encryption</p>
                    <p className="text-sm font-bold text-slate-200 mt-1">AES-256-GCM</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-400">Signature Authority</p>
                    <p className="text-sm font-bold text-slate-200 mt-1">Identity Citadel HSM</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleEFileSubmit}
                    disabled={isSubmitting || filingStatus === "ACCEPTED"}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Transmit to IRS
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setFilingStatus("DRAFT");
                      addLog("Filing status reset to DRAFT.");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Reset Status
                  </button>
                </div>
              </div>

              {/* XML Payload Viewer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-emerald-400" /> Generated IRS MeF XML
                  </h3>
                  <button
                    onClick={() => handleCopy(generatedXmlPayload, "IRS MeF XML")}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copiedText === "IRS MeF XML" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedText === "IRS MeF XML" ? "Copied" : "Copy XML"}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
                  {generatedXmlPayload}
                </pre>
              </div>

              {/* Cryptographic Signature Block */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-400" /> JWS Cryptographic Signature
                  </h3>
                  <button
                    onClick={() => handleCopy(signatureBlock, "JWS Signature")}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copiedText === "JWS Signature" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedText === "JWS Signature" ? "Copied" : "Copy Signature"}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-purple-300 overflow-x-auto">
                  {signatureBlock}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (AI Assistant & Terminal Logs) */}
        <div className="space-y-6">
          {/* AI Tax Assistant */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[450px]">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">AI Tax Optimizer</h3>
                <p className="text-[10px] text-slate-400">Gemini-powered tax strategy & advice</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.sender === "ai"
                      ? "bg-slate-950 border border-slate-800 text-slate-300 self-start"
                      : "bg-emerald-600 text-white self-end ml-auto"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] text-slate-500 block mt-1 text-right">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Ask about wash sales, HIFO, deductions..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Cryptographic IRS MeF Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-sm text-slate-200">IRS MeF Gateway Logs</h3>
              </div>
              <button
                onClick={() => setTerminalLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1">
              {terminalLogs.length === 0 ? (
                <p className="text-slate-600">No logs available.</p>
              ) : (
                terminalLogs.map((log, idx) => <p key={idx}>{log}</p>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}