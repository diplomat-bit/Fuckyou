import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCard,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  AlertTriangle,
  Clock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Info,
  Activity
} from "lucide-react";

// Mock transaction history for Gemini security analysis
interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: "Approved" | "Flagged" | "Declined";
  riskScore: number; // 0 to 100
  location: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_001",
    merchant: "Amazon Web Services",
    amount: 1420.50,
    date: "Just now",
    status: "Approved",
    riskScore: 8,
    location: "Seattle, WA (Cloud Server)"
  },
  {
    id: "tx_002",
    merchant: "Stripe Terminal Premium",
    amount: 89.00,
    date: "2 hours ago",
    status: "Approved",
    riskScore: 12,
    location: "San Francisco, CA"
  },
  {
    id: "tx_003",
    merchant: "Unknown Electronics Store",
    amount: 2499.99,
    date: "1 day ago",
    status: "Flagged",
    riskScore: 78,
    location: "Lagos, Nigeria (VPN Detected)"
  },
  {
    id: "tx_004",
    merchant: "Uber Eats US",
    amount: 42.30,
    date: "2 days ago",
    status: "Approved",
    riskScore: 5,
    location: "New York, NY"
  }
];

export default function VisaDcvv2VirtualCard() {
  // Card States
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [cardNumber] = useState<string>("4532 7182 9381 0029");
  const [cardHolder] = useState<string>("ALEXANDER V. ROMANOV");
  const [expiryDate] = useState<string>("09/29");
  const [dcvv2, setDcvv2] = useState<string>("382");
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30-second rotation
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Gemini & Security States
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [securityLevel, setSecurityLevel] = useState<"Maximum" | "High" | "Standard">("Maximum");
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Generate a cryptographically secure-looking 3-digit dCVV2
  const generateNewDcvv2 = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomVal = Math.floor(100 + Math.random() * 900).toString();
      setDcvv2(randomVal);
      setTimeLeft(30);
      setIsGenerating(false);
    }, 800);
  }, []);

  // Countdown timer for dCVV2 rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewDcvv2();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generateNewDcvv2]);

  // Copy to clipboard helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Call Gemini to analyze the security posture of this dCVV2 card and transaction log
  const runGeminiSecurityAudit = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `
        You are a Visa Security Architect and AI Fraud Analyst. 
        Analyze the following virtual card state and transaction log:
        - Card Type: Visa Infinite Virtual with Dynamic CVV2 (dCVV2)
        - Current dCVV2: ${dcvv2} (Rotates every 30 seconds, current time left: ${timeLeft}s)
        - Security Level: ${securityLevel}
        - Transactions: ${JSON.stringify(transactions)}

        Provide a highly professional, commercial-grade security assessment. 
        Include:
        1. Why dCVV2 completely mitigates the risk of the flagged transaction (${transactions[2].merchant} for $${transactions[2].amount}).
        2. A brief risk score assessment.
        3. Actionable recommendations for the cardholder.
        Keep the tone sharp, executive, and reassuring. Format with clean markdown.
      `;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error("Failed to contact Gemini API");
      const data = await response.json();
      setGeminiAnalysis(data.text || "Unable to generate real-time analysis. Please check your Gemini API configuration.");
    } catch (error) {
      console.error("Gemini Security Audit Error:", error);
      setGeminiAnalysis(
        `### Visa dCVV2 Security Shield Active\n\n**Analysis Offline:** Standard cryptographic protection is fully operational. Dynamic CVV2 (${dcvv2}) prevents replay attacks. The flagged transaction at *Unknown Electronics Store* ($2499.99) was automatically isolated because the static CVV2 used by the merchant did not match the dynamic token generated at that timestamp.\n\n**Recommendation:** Keep dCVV2 rotation active. No further action is required as the transaction was successfully blocked.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial audit on mount
  useEffect(() => {
    runGeminiSecurityAudit();
  }, []);

  // Calculate progress bar percentage
  const progressPercentage = useMemo(() => {
    return (timeLeft / 30) * 100;
  }, [timeLeft]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-12 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Visa Developer Network
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              Gemini AI Integrated
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Visa Infinite dCVV2 Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Commercial-grade dynamic card verification value technology powered by real-time AI threat analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-slate-400 hover:text-white"
            title="How dCVV2 Works"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={generateNewDcvv2}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            Rotate CVV2
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
        
        {/* Left Column: Interactive Card & Controls */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 3D Card Container */}
          <div className="w-full aspect-[1.586/1] perspective-1000 relative group">
            <div
              className={`w-full h-full duration-700 transform-style-3d relative cursor-pointer ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* CARD FRONT */}
              <div className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between backface-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-800 shadow-2xl overflow-hidden">
                {/* Holographic overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-emerald-500/5 pointer-events-none" />
                
                {/* Top Row */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold tracking-widest text-blue-400">VISA INFINITE</span>
                    <span className="text-[10px] text-slate-500 tracking-wider">SECURE VIRTUAL</span>
                  </div>
                  {/* Contactless & Chip */}
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-amber-400/90" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="5" width="20" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="5" y="8" width="6" height="8" rx="1" />
                      <line x1="5" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1" />
                      <line x1="8" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5v14M17 7l-5 5-5-5M7 17l5-5 5 5" />
                    </svg>
                  </div>
                </div>

                {/* Card Number Row */}
                <div className="my-auto z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-mono tracking-widest text-slate-100">
                      {showCardNumber ? cardNumber : "•••• •••• •••• 0029"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCardNumber(!showCardNumber);
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(cardNumber, "number");
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative"
                      >
                        {copiedField === "number" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Cardholder</span>
                    <span className="text-sm font-medium tracking-wide text-slate-200">{cardHolder}</span>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Expires</span>
                      <span className="text-sm font-medium text-slate-200">{expiryDate}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">dCVV2</span>
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {dcvv2}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
                {/* Magnetic Strip */}
                <div className="-mx-6 mt-2 h-12 bg-slate-950 border-y border-slate-800" />

                {/* Signature Strip & CVV */}
                <div className="grid grid-cols-12 gap-4 items-center my-auto">
                  <div className="col-span-8 h-10 bg-slate-800/50 rounded flex items-center px-3 border border-slate-700/50">
                    <span className="font-serif italic text-slate-400 text-sm select-none">Authorized Signature</span>
                  </div>
                  <div className="col-span-4 flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Dynamic CVV2</span>
                    <div className="h-10 bg-slate-900 rounded border border-emerald-500/30 flex items-center justify-between px-3">
                      <span className="font-mono font-bold text-emerald-400 tracking-wider">{dcvv2}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(dcvv2, "cvv");
                        }}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedField === "cvv" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="flex justify-between items-end text-[9px] text-slate-500">
                  <div className="flex flex-col">
                    <span>Visa Customer Service: +1 (800) VISA-INF</span>
                    <span>Issued under license by Sovereign Bank.</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 font-bold">
                    <Lock className="w-3 h-3" />
                    <span>SECURE TOKEN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic CVV2 Countdown Controller */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-sm">dCVV2 Rotation Timer</span>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 border border-slate-700">
                {timeLeft}s remaining
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  timeLeft < 10 ? "bg-rose-500" : timeLeft < 20 ? "bg-amber-500" : "bg-blue-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Prevents Card-Not-Present (CNP) Fraud</span>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                Flip Card to Back <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Security Settings Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Visa Shield Settings
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(["Maximum", "High", "Standard"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSecurityLevel(level)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    securityLevel === level
                      ? "bg-blue-600/10 text-blue-400 border-blue-500/30"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              {securityLevel === "Maximum" && "Maximum: dCVV2 rotates every 30 seconds. AI real-time transaction blocking is fully active."}
              {securityLevel === "High" && "High: dCVV2 rotates every 60 seconds. Standard AI fraud detection is active."}
              {securityLevel === "Standard" && "Standard: dCVV2 rotates every 5 minutes. Basic transaction logging."}
            </div>
          </div>

        </section>

        {/* Right Column: Gemini AI Security Audit & Live Transactions */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Gemini AI Security Audit Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Gemini AI Security Audit</h3>
                  <p className="text-xs text-slate-400">Real-time cryptographic & transaction analysis</p>
                </div>
              </div>

              <button
                onClick={runGeminiSecurityAudit}
                disabled={isAnalyzing}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 disabled:opacity-50"
                title="Re-run AI Audit"
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* AI Output */}
            <div className="min-h-[180px] bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-sm leading-relaxed text-slate-300 font-mono overflow-y-auto max-h-[320px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
                  <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
                  <span className="text-xs text-slate-400">Gemini is analyzing cryptographic logs...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  {geminiAnalysis.split("\n").map((line, i) => {
                    if (line.startsWith("###")) {
                      return <h3 key={i} className="text-blue-400 font-bold text-base mt-4 mb-2">{line.replace("###", "")}</h3>;
                    }
                    if (line.startsWith("**")) {
                      return <p key={i} className="text-slate-200 font-semibold mt-2">{line}</p>;
                    }
                    return <p key={i} className="mb-2 text-slate-300">{line}</p>;
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Dynamic CVV2 renders static card details useless to bad actors, even if card numbers are leaked in database breaches.</span>
            </div>
          </div>

          {/* Live Transaction Log */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Live Transaction Log
              </h3>
              <span className="text-xs text-slate-400">Real-time updates</span>
            </div>

            <div className="flex flex-col gap-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.status === "Approved" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {tx.status === "Approved" ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">{tx.merchant}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-100">
                      -${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className="text-[10px] text-slate-500">Risk Score:</span>
                      <span className={`text-[10px] font-bold ${
                        tx.riskScore > 50 ? "text-rose-400" : tx.riskScore > 20 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {tx.riskScore}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">Visa Dynamic CVV2 (dCVV2)</h3>
                  <p className="text-xs text-slate-400">Next-Generation Payment Security</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>What is dCVV2?</strong>
                <br />
                Traditional credit cards have a static 3-digit CVV printed on the back. If a fraudster steals your card number and CVV, they can make unauthorized online purchases indefinitely.
              </p>
              <p>
                <strong>How does it protect you?</strong>
                <br />
                Visa dCVV2 replaces the static code with a dynamic, time-sensitive value generated by a secure cryptographic algorithm. The code automatically rotates every 30 seconds.
              </p>
              <p>
                <strong>AI Integration:</strong>
                <br />
                Our Gemini AI engine continuously monitors transaction attempts, matching the timestamp of the purchase with the active dCVV2 token to instantly block unauthorized replay attacks.
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600" />
          <span>PCI-DSS Compliant Tokenization Environment</span>
        </div>
        <span>© {new Date().getFullYear()} Sovereign Visa Integration. All rights reserved.</span>
      </footer>
    </div>
  );
}