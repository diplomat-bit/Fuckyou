import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  Globe, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Brain, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Check, 
  X, 
  TrendingUp, 
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Database,
  Zap
} from "lucide-react";
import { DataContext } from "../context/DataContext";
import { callGemini } from "../services/geminiService";

// Mock Cardholder Database Records for Issuer Simulation
interface CardholderRecord {
  id: string;
  name: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  stipBalance: number; // Stand-In Processing available balance
  dailyLimit: number;
  monthlyLimit: number;
  status: "ACTIVE" | "SUSPENDED" | "STOLEN" | "COMPROMISED" | "WARM_BLOCK";
  allowedRegions: string[];
  blockedRegions: string[];
  riskScore: number;
  lastUpdated: string;
}

const INITIAL_CARDHOLDERS: CardholderRecord[] = [
  {
    id: "CH-9081",
    name: "Sarah Jenkins",
    cardNumber: "4111 76XX XXXX 8902",
    expiryDate: "12/27",
    cvv: "382",
    stipBalance: 5000,
    dailyLimit: 2000,
    monthlyLimit: 15000,
    status: "ACTIVE",
    allowedRegions: ["US", "CA", "GB"],
    blockedRegions: ["RU", "KP", "NG"],
    riskScore: 12,
    lastUpdated: "2025-02-18 14:22:01"
  },
  {
    id: "CH-4432",
    name: "Marcus Vance",
    cardNumber: "4000 12XX XXXX 4481",
    expiryDate: "08/26",
    cvv: "901",
    stipBalance: 15000,
    dailyLimit: 5000,
    monthlyLimit: 50000,
    status: "COMPROMISED",
    allowedRegions: ["US", "DE", "FR", "JP"],
    blockedRegions: ["CN", "IR"],
    riskScore: 85,
    lastUpdated: "2025-02-20 09:11:45"
  },
  {
    id: "CH-1109",
    name: "Elena Rostova",
    cardNumber: "4226 99XX XXXX 1120",
    expiryDate: "03/29",
    cvv: "477",
    stipBalance: 2500,
    dailyLimit: 1000,
    monthlyLimit: 8000,
    status: "WARM_BLOCK",
    allowedRegions: ["CH", "DE", "AT"],
    blockedRegions: ["US", "MX"],
    riskScore: 45,
    lastUpdated: "2025-02-19 18:04:30"
  }
];

interface RiskAssessment {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  analysis: string;
  recommendations: string[];
  stipRecommendation: string;
}

interface AuditLog {
  timestamp: string;
  cardholderId: string;
  cardholderName: string;
  changes: string[];
  operator: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  visaReferenceId: string;
}

export default function VisaCdbManager() {
  const dataContext = useContext(DataContext);
  const [cardholders, setCardholders] = useState<CardholderRecord[]>(INITIAL_CARDHOLDERS);
  const [selectedId, setSelectedId] = useState<string>("CH-9081");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Form States for CDBUpdate
  const [stipBalance, setStipBalance] = useState<number>(5000);
  const [dailyLimit, setDailyLimit] = useState<number>(2000);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(15000);
  const [status, setStatus] = useState<CardholderRecord["status"]>("ACTIVE");
  const [allowedRegions, setAllowedRegions] = useState<string[]>([]);
  const [blockedRegions, setBlockedRegions] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState<string>("");
  const [regionType, setRegionType] = useState<"ALLOW" | "BLOCK">("ALLOW");

  // Gemini Risk Assessment States
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [visaSyncStatus, setVisaSyncStatus] = useState<"IDLE" | "SYNCING" | "SUCCESS" | "ERROR">("IDLE");
  const [visaRefId, setVisaRefId] = useState<string>("");

  // Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      timestamp: "2025-02-20 09:15:00",
      cardholderId: "CH-4432",
      cardholderName: "Marcus Vance",
      changes: ["Status updated to COMPROMISED", "STIP Balance reduced to $0"],
      operator: "SecOps_Agent_09",
      status: "SUCCESS",
      visaReferenceId: "V-CDB-9982104"
    }
  ]);

  // Find currently selected cardholder
  const currentCardholder = useMemo(() => {
    return cardholders.find(ch => ch.id === selectedId) || cardholders[0];
  }, [cardholders, selectedId]);

  // Sync form states when selected cardholder changes
  useEffect(() => {
    if (currentCardholder) {
      setStipBalance(currentCardholder.stipBalance);
      setDailyLimit(currentCardholder.dailyLimit);
      setMonthlyLimit(currentCardholder.monthlyLimit);
      setStatus(currentCardholder.status);
      setAllowedRegions(currentCardholder.allowedRegions);
      setBlockedRegions(currentCardholder.blockedRegions);
      setRiskAssessment(null);
      setVisaSyncStatus("IDLE");
      setVisaRefId("");
    }
  }, [currentCardholder]);

  // Filtered cardholders list
  const filteredCardholders = useMemo(() => {
    return cardholders.filter(ch => 
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.cardNumber.includes(searchQuery)
    );
  }, [cardholders, searchQuery]);

  // Handle Region Management
  const handleAddRegion = () => {
    if (!newRegion || newRegion.length !== 2) return;
    const upperRegion = newRegion.toUpperCase();
    
    if (regionType === "ALLOW") {
      if (!allowedRegions.includes(upperRegion)) {
        setAllowedRegions([...allowedRegions, upperRegion]);
        setBlockedRegions(blockedRegions.filter(r => r !== upperRegion));
      }
    } else {
      if (!blockedRegions.includes(upperRegion)) {
        setBlockedRegions([...blockedRegions, upperRegion]);
        setAllowedRegions(allowedRegions.filter(r => r !== upperRegion));
      }
    }
    setNewRegion("");
  };

  const handleRemoveRegion = (region: string, type: "ALLOW" | "BLOCK") => {
    if (type === "ALLOW") {
      setAllowedRegions(allowedRegions.filter(r => r !== region));
    } else {
      setBlockedRegions(blockedRegions.filter(r => r !== region));
    }
  };

  // Gemini-driven Risk Assessment for CDBUpdate
  const runRiskAssessment = async () => {
    if (!currentCardholder) return;
    setIsAssessing(true);

    const prompt = `
      You are the Visa Risk Intelligence Engine powered by Gemini. Analyze this proposed Cardholder Database Update (CDBUpdate) for potential fraud, compliance issues, and Stand-In Processing (STIP) exposure.

      CARDHOLDER PROFILE:
      - ID: ${currentCardholder.id}
      - Name: ${currentCardholder.name}
      - Current Status: ${currentCardholder.status}
      - Current STIP Balance: $${currentCardholder.stipBalance}
      - Current Daily Limit: $${currentCardholder.dailyLimit}
      - Current Monthly Limit: $${currentCardholder.monthlyLimit}
      - Current Allowed Regions: ${currentCardholder.allowedRegions.join(", ")}
      - Current Blocked Regions: ${currentCardholder.blockedRegions.join(", ")}

      PROPOSED CHANGES:
      - Proposed Status: ${status}
      - Proposed STIP Balance: $${stipBalance}
      - Proposed Daily Limit: $${dailyLimit}
      - Proposed Monthly Limit: $${monthlyLimit}
      - Proposed Allowed Regions: ${allowedRegions.join(", ")}
      - Proposed Blocked Regions: ${blockedRegions.join(", ")}

      Provide a structured JSON response containing:
      1. "score": A risk score from 0 to 100 (higher means riskier).
      2. "level": "LOW", "MEDIUM", "HIGH", or "CRITICAL".
      3. "analysis": A detailed paragraph explaining the risk of these changes (e.g., sudden limit increases, unblocking compromised cards, whitelisting high-risk regions, or STIP exposure if the issuer goes offline).
      4. "recommendations": An array of 3 actionable security recommendations.
      5. "stipRecommendation": Specific advice on whether the Stand-In Processing (STIP) limit is appropriate given the cardholder's risk profile.

      Return ONLY valid JSON. No markdown formatting, no backticks.
    `;

    try {
      const responseText = await callGemini(prompt);
      // Clean response text in case Gemini returns markdown code blocks
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed: RiskAssessment = JSON.parse(cleanJson);
      setRiskAssessment(parsed);
    } catch (error) {
      console.error("Error running Gemini risk assessment:", error);
      // Fallback mock assessment if API fails
      const calculatedScore = calculateFallbackRiskScore();
      setRiskAssessment({
        score: calculatedScore,
        level: calculatedScore > 75 ? "CRITICAL" : calculatedScore > 50 ? "HIGH" : calculatedScore > 25 ? "MEDIUM" : "LOW",
        analysis: "Fallback Risk Engine: Detected potential anomalies in limit adjustments. Stand-In Processing (STIP) limits should be carefully calibrated to prevent offline transaction fraud during network outages.",
        recommendations: [
          "Verify cardholder identity via out-of-band multi-factor authentication.",
          "Limit STIP available balance to 2x the average daily transaction volume.",
          "Ensure regional blocks align with the issuer's global compliance policy."
        ],
        stipRecommendation: "Maintain STIP balance below $5,000 for standard retail accounts."
      });
    } finally {
      setIsAssessing(false);
    }
  };

  const calculateFallbackRiskScore = () => {
    let score = 10;
    if (status === "COMPROMISED" || status === "STOLEN") score += 40;
    if (stipBalance > 10000) score += 20;
    if (dailyLimit > 5000) score += 15;
    if (blockedRegions.length === 0) score += 10;
    return Math.min(score, 100);
  };

  // Submit CDBUpdate to Visa Network (Simulated Handshake)
  const submitCdbUpdate = async () => {
    if (!currentCardholder) return;
    setIsSubmitting(true);
    setVisaSyncStatus("SYNCING");

    // Simulate Visa API Handshake latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    const generatedRefId = `V-CDB-${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    // Update local state
    const updatedCardholders = cardholders.map(ch => {
      if (ch.id === currentCardholder.id) {
        return {
          ...ch,
          stipBalance,
          dailyLimit,
          monthlyLimit,
          status,
          allowedRegions,
          blockedRegions,
          riskScore: riskAssessment ? riskAssessment.score : ch.riskScore,
          lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 19)
        };
      }
      return ch;
    });

    setCardholders(updatedCardholders);
    setVisaRefId(generatedRefId);
    setVisaSyncStatus("SUCCESS");

    // Add to Audit Trail
    const changes: string[] = [];
    if (currentCardholder.stipBalance !== stipBalance) changes.push(`STIP Balance: $${currentCardholder.stipBalance} -> $${stipBalance}`);
    if (currentCardholder.dailyLimit !== dailyLimit) changes.push(`Daily Limit: $${currentCardholder.dailyLimit} -> $${dailyLimit}`);
    if (currentCardholder.status !== status) changes.push(`Status: ${currentCardholder.status} -> ${status}`);
    if (JSON.stringify(currentCardholder.allowedRegions) !== JSON.stringify(allowedRegions)) changes.push(`Allowed Regions updated`);
    if (JSON.stringify(currentCardholder.blockedRegions) !== JSON.stringify(blockedRegions)) changes.push(`Blocked Regions updated`);

    const newLog: AuditLog = {
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      cardholderId: currentCardholder.id,
      cardholderName: currentCardholder.name,
      changes: changes.length > 0 ? changes : ["No configuration changes, forced database sync"],
      operator: "Visa_CDB_Portal_Admin",
      status: "SUCCESS",
      visaReferenceId: generatedRefId
    };

    setAuditLogs([newLog, ...auditLogs]);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Visa Cardholder Database (CDB) Manager
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time CDBUpdate provisioning with Stand-In Processing (STIP) controls & Gemini Risk Intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Visa Core Network: Connected</span>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Cardholder Directory (3 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Cardholder Directory
            </h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, ID, card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Cardholder List */}
            <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-1">
              {filteredCardholders.map((ch) => {
                const isSelected = ch.id === selectedId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedId(ch.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? "bg-blue-600/10 border-blue-500/50 text-white" 
                        : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{ch.name}</span>
                      <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                        {ch.id}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 mb-2">{ch.cardNumber}</div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        ch.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        ch.status === "COMPROMISED" || ch.status === "STOLEN" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {ch.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        STIP: ${ch.stipBalance.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredCardholders.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No cardholders found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: CDBUpdate Form (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  CDBUpdate Provisioning
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modify cardholder parameters for the Visa Central Directory.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Ref: {currentCardholder?.id}
              </span>
            </div>

            {/* Card Preview */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border border-blue-500/30 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">Visa Issuer Portal</p>
                  <p className="text-lg font-bold text-white mt-1">{currentCardholder?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-slate-900/80 border border-slate-800 px-2 py-1 rounded text-slate-300">
                    STIP Active
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xs text-slate-400 font-mono">CARD NUMBER</p>
                <p className="text-xl font-mono tracking-wider text-slate-100 mt-1">{currentCardholder?.cardNumber}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">Expiry</p>
                  <p className="text-sm font-mono text-slate-300">{currentCardholder?.expiryDate}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">CVV</p>
                  <p className="text-sm font-mono text-slate-300">{currentCardholder?.cvv}</p>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-bold text-white">VISA</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Status & Compromise Flags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Card Processing Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["ACTIVE", "SUSPENDED", "STOLEN", "COMPROMISED", "WARM_BLOCK"] as const).map((s) => {
                    const isSelected = status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? s === "ACTIVE"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                              : s === "SUSPENDED" || s === "WARM_BLOCK"
                              ? "bg-amber-500/10 border-amber-500 text-amber-400"
                              : "bg-rose-500/10 border-rose-500 text-rose-400"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Limits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* STIP Balance */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    STIP Available Balance
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={stipBalance}
                      onChange={(e) => setStipBalance(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Offline stand-in auth limit.</p>
                </div>

                {/* Daily Limit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Daily Spend Limit
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Max daily authorization.</p>
                </div>

                {/* Monthly Limit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Monthly Spend Limit
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Max monthly authorization.</p>
                </div>
              </div>

              {/* Regional Restrictions */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Regional Restrictions (ISO 2-Letter)
                </label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={regionType}
                    onChange={(e) => setRegionType(e.target.value as "ALLOW" | "BLOCK")}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALLOW">Whitelist</option>
                    <option value="BLOCK">Blacklist</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. US, GB, JP"
                    maxLength={2}
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 uppercase focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddRegion}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Whitelist / Blacklist Badges */}
                <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                      Whitelisted Regions (Allowed)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allowedRegions.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono px-2 py-0.5 rounded-lg">
                          {r}
                          <button type="button" onClick={() => handleRemoveRegion(r, "ALLOW")} className="hover:text-emerald-200">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {allowedRegions.length === 0 && (
                        <span className="text-xs text-slate-600 italic">No whitelisted regions. Global access allowed.</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                      Blacklisted Regions (Blocked)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {blockedRegions.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono px-2 py-0.5 rounded-lg">
                          {r}
                          <button type="button" onClick={() => handleRemoveRegion(r, "BLOCK")} className="hover:text-rose-200">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {blockedRegions.length === 0 && (
                        <span className="text-xs text-slate-600 italic">No blacklisted regions.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={runRiskAssessment}
                  disabled={isAssessing}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Brain className="w-4 h-4 text-purple-400" />
                  {isAssessing ? "Assessing Risk..." : "Run Gemini Risk Assessment"}
                </button>

                <button
                  type="button"
                  onClick={submitCdbUpdate}
                  disabled={isSubmitting || visaSyncStatus === "SYNCING"}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10"
                >
                  <RefreshCw className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
                  {isSubmitting ? "Syncing with Visa..." : "Push CDBUpdate to Visa"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gemini Risk Intelligence & Visa Sync Status (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Gemini Risk Intelligence Panel */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Gemini Risk Intelligence</h2>
              </div>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
                AI Engine Active
              </span>
            </div>

            {riskAssessment ? (
              <div className="space-y-5">
                {/* Risk Score Gauge */}
                <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${
                          riskAssessment.level === "LOW" ? "text-emerald-500" :
                          riskAssessment.level === "MEDIUM" ? "text-amber-500" :
                          riskAssessment.level === "HIGH" ? "text-orange-500" : "text-rose-500"
                        }`}
                        strokeDasharray={`${riskAssessment.score}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold font-mono text-white">
                      {riskAssessment.score}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Risk Classification</span>
                    <span className={`text-sm font-bold ${
                      riskAssessment.level === "LOW" ? "text-emerald-400" :
                      riskAssessment.level === "MEDIUM" ? "text-amber-400" :
                      riskAssessment.level === "HIGH" ? "text-orange-400" : "text-rose-400"
                    }`}>
                      {riskAssessment.level} RISK
                    </span>
                  </div>
                </div>

                {/* AI Analysis */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Risk Analysis
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
                    {riskAssessment.analysis}
                  </p>
                </div>

                {/* STIP Recommendation */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    STIP Calibration Advice
                  </span>
                  <div className="flex items-start gap-2 bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                    <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p>{riskAssessment.stipRecommendation}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Actionable Recommendations
                  </span>
                  <ul className="space-y-2">
                    {riskAssessment.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Brain className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm">No active risk assessment.</p>
                <p className="text-xs text-slate-600 mt-1">
                  Click "Run Gemini Risk Assessment" to analyze proposed CDB changes.
                </p>
              </div>
            )}
          </div>

          {/* Visa Network Sync Status */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Visa Central Directory Sync
            </h2>

            {visaSyncStatus === "IDLE" && (
              <div className="text-xs text-slate-400 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 text-center">
                Ready to push updates to Visa's global cardholder database.
              </div>
            )}

            {visaSyncStatus === "SYNCING" && (
              <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Initiating Visa Handshake...</span>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-2/3 rounded-full animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Encrypting payload with JWE/JWS and transmitting via Visa Developer API.
                </p>
              </div>
            )}

            {visaSyncStatus === "SUCCESS" && (
              <div className="space-y-3 bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  CDBUpdate Successfully Provisioned
                </div>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div><span className="text-slate-500">Visa Ref ID:</span> {visaRefId}</div>
                  <div><span className="text-slate-500">Timestamp:</span> {new Date().toISOString()}</div>
                  <div><span className="text-slate-500">Status:</span> Central Directory Synced</div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Visa Stand-In Processing (STIP) nodes have successfully cached the updated available balance.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Section: Audit Trail */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              CDBUpdate Audit Trail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical record of cardholder database updates pushed to the Visa network.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Cardholder</th>
                <th className="pb-3 font-semibold">Changes Applied</th>
                <th className="pb-3 font-semibold">Operator</th>
                <th className="pb-3 font-semibold">Visa Reference</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="text-slate-300 hover:bg-slate-900/20">
                  <td className="py-3.5 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-3.5">
                    <div className="font-medium text-slate-200">{log.cardholderName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{log.cardholderId}</div>
                  </td>
                  <td className="py-3.5 max-w-xs">
                    <div className="flex flex-col gap-1">
                      {log.changes.map((change, cIdx) => (
                        <span key={cIdx} className="text-slate-400 block truncate">
                          • {change}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-slate-400">{log.operator}</td>
                  <td className="py-3.5 font-mono text-blue-400">{log.visaReferenceId}</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      <Check className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}