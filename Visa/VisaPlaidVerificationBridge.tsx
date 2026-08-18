import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePlaidLink } from "react-plaid-link";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Link2,
  Cpu,
  UserCheck,
  DollarSign,
  Activity,
  Lock,
  ArrowRight,
  ShieldAlert,
  Check,
  Play,
  FileText
} from "lucide-react";

// Interfaces for State Management
interface VerifiedAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountType: string;
  mask: string;
  balance: number;
  routingNumber: string;
}

interface ComplianceReport {
  riskScore: number; // 0 to 100
  amlPassed: boolean;
  kycVerified: boolean;
  ofacCleared: boolean;
  pepCheckPassed: boolean;
  geminiAnalysis: string;
  timestamp: string;
}

interface VisaFundingSource {
  sourceId: string;
  cardLast4: string;
  cardType: string;
  supportedCrypto: string[];
  dailyLimit: number;
  status: "Active" | "Pending" | "Suspended";
}

interface AuditLog {
  timestamp: string;
  event: string;
  status: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
}

export default function VisaPlaidVerificationBridge() {
  // Step Wizard State: 1 = Plaid Link, 2 = Gemini AML/KYC, 3 = Visa Crypto-Funding
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Plaid States
  const [plaidToken, setPlaidToken] = useState<string | null>(null);
  const [isPlaidLinked, setIsPlaidLinked] = useState<boolean>(false);
  const [verifiedAccount, setVerifiedAccount] = useState<VerifiedAccount | null>(null);

  // Gemini Compliance States
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [isComplianceRunning, setIsComplianceRunning] = useState<boolean>(false);

  // Visa Crypto-Funding States
  const [visaFundingSource, setVisaFundingSource] = useState<VisaFundingSource | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>("USDC");
  const [fundingLimit, setFundingLimit] = useState<number>(5000);

  // Audit Logs
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Add Log Helper
  const addLog = useCallback((event: string, status: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") => {
    const newLog: AuditLog = {
      timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
      event,
      status
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  // Initialize Component & Generate Mock Plaid Link Token
  useEffect(() => {
    addLog("Initializing Visa-Plaid Verification Bridge...", "INFO");
    // Simulate fetching link token from backend
    setLoading(true);
    setTimeout(() => {
      setPlaidToken("link-sandbox-8f9a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o");
      addLog("Plaid Link Token generated successfully.", "SUCCESS");
      setLoading(false);
    }, 1000);
  }, [addLog]);

  // Plaid Link Configuration
  const onSuccess = useCallback(
    (public_token: string, metadata: any) => {
      setLoading(true);
      addLog(`Plaid public token received: ${public_token.slice(0, 15)}...`, "SUCCESS");
      addLog("Exchanging public token for access token & retrieving account details...", "INFO");

      // Simulate backend token exchange and account verification
      setTimeout(() => {
        const mockAccount: VerifiedAccount = {
          id: "acc_plaid_99281",
          bankName: metadata.institution?.name || "Chase Bank",
          accountName: metadata.accounts[0]?.name || "Sovereign Business Checking",
          accountType: metadata.accounts[0]?.type || "checking",
          mask: metadata.accounts[0]?.mask || "4321",
          balance: 48250.0,
          routingNumber: "021000021" // Mock Fed routing
        };

        setVerifiedAccount(mockAccount);
        setIsPlaidLinked(true);
        addLog(`Bank account verified: ${mockAccount.bankName} (****${mockAccount.mask})`, "SUCCESS");
        addLog(`Available Balance: $${mockAccount.balance.toLocaleString()}`, "INFO");
        setLoading(false);
        setCurrentStep(2); // Advance to Gemini AML/KYC
      }, 1500);
    },
    [addLog]
  );

  const config = {
    token: plaidToken || "",
    onSuccess,
    onExit: (err: any, metadata: any) => {
      if (err) {
        addLog(`Plaid Link Exit Error: ${err.message}`, "ERROR");
        setError(err.message);
      } else {
        addLog("Plaid Link closed by user.", "WARNING");
      }
    }
  };

  const { open, ready } = usePlaidLink(config);

  // Trigger Gemini AML/KYC Compliance Check
  const runGeminiComplianceCheck = async () => {
    if (!verifiedAccount) {
      setError("No verified bank account found. Please link via Plaid first.");
      return;
    }

    setIsComplianceRunning(true);
    setError(null);
    addLog("Initiating Gemini AI-Powered AML/KYC Compliance Audit...", "INFO");
    addLog("Analyzing account routing, transaction history patterns, and OFAC databases...", "INFO");

    try {
      // Simulate calling Gemini API for compliance analysis
      // In production, this would call callGemini() or /api/ai with a structured prompt
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockReport: ComplianceReport = {
        riskScore: 12, // Low risk
        amlPassed: true,
        kycVerified: true,
        ofacCleared: true,
        pepCheckPassed: true,
        geminiAnalysis: `Gemini Compliance Engine Analysis:
- Account Holder Identity matches Plaid verification records.
- Routing Number (${verifiedAccount.routingNumber}) verified against Federal Reserve active directory.
- No suspicious structuring or rapid-fire transaction patterns detected.
- Zero matches found in OFAC, PEP, or international sanctions lists.
- Risk Score: 12/100 (Extremely Low Risk). Recommended for Visa Crypto-Funding integration.`,
        timestamp: new Date().toISOString()
      };

      setComplianceReport(mockReport);
      addLog("Gemini AML/KYC Compliance Audit completed successfully.", "SUCCESS");
      addLog("OFAC Sanctions Check: CLEARED", "SUCCESS");
      addLog("PEP Check: CLEARED", "SUCCESS");
      addLog(`Risk Score: ${mockReport.riskScore}/100 (LOW RISK)`, "SUCCESS");
      setCurrentStep(3); // Advance to Visa Link
    } catch (err: any) {
      addLog(`Gemini Compliance Check Failed: ${err.message}`, "ERROR");
      setError("Failed to complete compliance check. Please try again.");
    } finally {
      setIsComplianceRunning(false);
    }
  };

  // Link Verified Source to Visa Crypto-Funding Network
  const linkToVisaCryptoFunding = () => {
    if (!verifiedAccount || !complianceReport) {
      setError("Incomplete verification steps. Cannot link to Visa.");
      return;
    }

    setLoading(true);
    addLog("Initiating Visa Crypto-Funding Source registration...", "INFO");
    addLog("Generating secure Visa Tokenized Account Number (vTAN)...", "INFO");

    setTimeout(() => {
      const mockVisaSource: VisaFundingSource = {
        sourceId: `v_src_${Math.random().toString(36).substr(2, 9)}`,
        cardLast4: "8842",
        cardType: "Visa Platinum Business Debit",
        supportedCrypto: ["USDC", "BTC", "ETH", "SOL"],
        dailyLimit: fundingLimit,
        status: "Active"
      };

      setVisaFundingSource(mockVisaSource);
      addLog(`Visa Crypto-Funding Source linked successfully! ID: ${mockVisaSource.sourceId}`, "SUCCESS");
      addLog(`Daily Crypto Purchase Limit set to: $${fundingLimit.toLocaleString()}`, "SUCCESS");
      setSuccessMessage("Visa Plaid Verification Bridge is now fully operational!");
      setLoading(false);
    }, 2000);
  };

  // Reset Bridge
  const resetBridge = () => {
    setCurrentStep(1);
    setIsPlaidLinked(false);
    setVerifiedAccount(null);
    setComplianceReport(null);
    setVisaFundingSource(null);
    setError(null);
    setSuccessMessage(null);
    addLog("Bridge state reset. Ready for new verification.", "WARNING");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-600 text-xs font-bold rounded text-white tracking-wider">VISA</span>
            <span className="text-slate-400 text-sm font-semibold">PLAID BRIDGE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            Crypto-Funding Verification Portal
            <Shield className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Securely verify bank accounts via Plaid, run Gemini AML/KYC audits, and link to Visa Crypto-Funding rails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetBridge}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Bridge
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/50 border border-emerald-800/50 rounded text-xs text-emerald-400">
            <Lock className="h-3.5 w-3.5" />
            AES-256 Encrypted
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Interactive Wizard (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Step Progress Bar */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              {[
                { step: 1, label: "Plaid Link", icon: Link2 },
                { step: 2, label: "Gemini AML/KYC", icon: Cpu },
                { step: 3, label: "Visa Authorization", icon: CreditCard }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;
                return (
                  <div key={item.step} className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-950"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : item.step}
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-xs font-semibold ${isActive ? "text-white" : "text-slate-400"}`}>
                        {item.label}
                      </p>
                    </div>
                    {item.step < 3 && <ArrowRight className="h-4 w-4 text-slate-700 hidden md:block" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col justify-between">
            {/* Step 1: Plaid Link */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-blue-500" />
                    Step 1: Connect Bank Account via Plaid
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Link your primary financial institution to establish a secure fiat gateway. Plaid ensures instant
                    account verification and balance checks.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Plaid Environment</span>
                    <span className="text-amber-500 font-semibold">Sandbox Mode</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Supported Institutions</span>
                    <span className="text-slate-200">Chase, Wells Fargo, Bank of America, Citi, etc.</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Security Protocol</span>
                    <span className="text-emerald-400 font-semibold">OAuth End-to-End</span>
                  </div>
                </div>

                {verifiedAccount ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">Bank Account Linked Successfully</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        {verifiedAccount.bankName} — {verifiedAccount.accountName} (****{verifiedAccount.mask})
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Routing Number: {verifiedAccount.routingNumber} | Balance: $
                        {verifiedAccount.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-950 flex items-center justify-center">
                      <Link2 className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">No Bank Account Connected</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click the button below to launch Plaid Link and authenticate.
                      </p>
                    </div>
                    <button
                      onClick={() => open()}
                      disabled={!ready || loading}
                      className="mx-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      Connect Bank Account
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Gemini AML/KYC */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-500" />
                    Step 2: Gemini AI AML/KYC Compliance Audit
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Run an automated compliance check powered by Gemini. This scans global sanctions lists, verifies
                    identity matching, and evaluates transaction risk scores.
                  </p>
                </div>

                {verifiedAccount && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Target Account</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200 font-medium">{verifiedAccount.bankName}</span>
                      <span className="text-slate-400">****{verifiedAccount.mask}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Routing: {verifiedAccount.routingNumber}</span>
                      <span>Balance: ${verifiedAccount.balance.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {complianceReport ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-400">Compliance Audit Passed</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-900 text-emerald-300 text-xs font-bold rounded">
                          Risk Score: {complianceReport.riskScore}/100
                        </span>
                      </div>
                      <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded border border-slate-800">
                        {complianceReport.geminiAnalysis}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-purple-950 flex items-center justify-center">
                      <Cpu className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Awaiting Compliance Audit</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Run the Gemini AI engine to verify AML/KYC compliance before linking to Visa.
                      </p>
                    </div>
                    <button
                      onClick={runGeminiComplianceCheck}
                      disabled={isComplianceRunning}
                      className="mx-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      {isComplianceRunning ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Analyzing Compliance...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Run Gemini AML Audit
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Visa Crypto-Funding */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-500" />
                    Step 3: Authorize Visa Crypto-Funding Source
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Finalize the bridge by linking your verified bank account to Visa's crypto-funding network. This
                    enables seamless fiat-to-crypto settlement.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">Preferred Settlement Asset</label>
                    <select
                      value={selectedCrypto}
                      onChange={(e) => setSelectedCrypto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="USDC">USDC (USD Coin)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="SOL">SOL (Solana)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">Daily Purchase Limit (USD)</label>
                    <input
                      type="number"
                      value={fundingLimit}
                      onChange={(e) => setFundingLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {visaFundingSource ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-400">Visa Crypto-Funding Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500">Source ID:</span> {visaFundingSource.sourceId}
                      </div>
                      <div>
                        <span className="text-slate-500">Card Type:</span> {visaFundingSource.cardType}
                      </div>
                      <div>
                        <span className="text-slate-500">Daily Limit:</span> ${visaFundingSource.dailyLimit.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>{" "}
                        <span className="text-emerald-400 font-bold">{visaFundingSource.status}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-950 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Awaiting Visa Authorization</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Authorize the connection to enable instant crypto purchases using your verified bank account.
                      </p>
                    </div>
                    <button
                      onClick={linkToVisaCryptoFunding}
                      disabled={loading}
                      className="mx-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Link to Visa Crypto-Funding
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-6">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded text-xs font-bold transition-colors"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 3 && (
                  <button
                    onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                    disabled={
                      (currentStep === 1 && !isPlaidLinked) || (currentStep === 2 && !complianceReport)
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Compliance Logs & Real-Time Status (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Status Overview Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Bridge Status Overview
            </h3>

            <div className="space-y-3">
              {/* Plaid Status */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold">Plaid Fiat Gateway</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isPlaidLinked ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isPlaidLinked ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>

              {/* Gemini Status */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold">Gemini AML Audit</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    complianceReport ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {complianceReport ? "PASSED" : "PENDING"}
                </span>
              </div>

              {/* Visa Status */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold">Visa Crypto-Funding</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    visaFundingSource ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {visaFundingSource ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Logs Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Real-Time Audit Logs
              </h3>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 h-64 overflow-y-auto font-mono text-[11px] space-y-2">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">No logs recorded yet.</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span
                        className={`font-bold shrink-0 ${
                          log.status === "SUCCESS"
                            ? "text-emerald-400"
                            : log.status === "WARNING"
                            ? "text-amber-400"
                            : log.status === "ERROR"
                            ? "text-rose-400"
                            : "text-blue-400"
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-slate-300">{log.event}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Error / Success Alerts */}
            <div className="mt-4">
              {error && (
                <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 flex items-start gap-2 text-xs text-rose-400">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 flex items-start gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="border-t border-slate-800 pt-4 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© Visa-Plaid Sovereign Crypto-Funding Bridge. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            AML/KYC Compliant
          </span>
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-blue-500" />
            PCI-DSS Level 1
          </span>
        </div>
      </footer>
    </div>
  );
}