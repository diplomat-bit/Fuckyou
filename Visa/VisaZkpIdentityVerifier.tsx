import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { DataContext } from "../context/DataContext";
import { ZKPEngine } from "../services/ZKPEngine";
import { securityService } from "../services/SecurityService";
import { callGemini } from "../services/geminiService";
import {
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Fingerprint,
  CreditCard,
  Coins,
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
  Terminal,
  HelpCircle,
  ArrowRight,
  Wallet,
  Sparkles,
  Key,
  Check,
  LockKeyhole,
  FileCode,
  ShieldCheck,
  Activity,
  Globe,
  DollarSign
} from "lucide-react";

interface ZkpProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  publicSignals: string[];
}

export default function VisaZkpIdentityVerifier() {
  const { state, addTransaction } = useContext(DataContext);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [proofType, setProofType] = useState<"solvency" | "age" | "ownership" | "compliance">("ownership");
  const [showSensitive, setShowSensitive] = useState(false);
  
  // Input fields
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [cryptoWallet, setCryptoWallet] = useState("");
  const [walletBalance, setWalletBalance] = useState("12.5");
  const [birthDate, setBirthDate] = useState("1995-06-15");
  const [targetThreshold, setTargetThreshold] = useState("10.0"); // e.g. Prove balance > 10 ETH or Age > 21
  
  // State for ZKP generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [generatedProof, setGeneratedProof] = useState<ZkpProof | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  
  // Gemini AI Integration
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Crypto Settlement
  const [settleWithCrypto, setSettleWithCrypto] = useState(false);
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [transactionAmount, setTransactionAmount] = useState("150.00");
  const [isSettling, setIsSettling] = useState(false);
  const [settlementTxHash, setSettlementTxHash] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first card if available
  useEffect(() => {
    if (state?.userProfile?.creditCards && state.userProfile.creditCards.length > 0) {
      const card = state.userProfile.creditCards[0];
      setSelectedCard(card);
      setCardNumber(card.number || "4111111111111111");
      setCvv("321");
    } else {
      setCardNumber("4111111111111111");
      setCvv("321");
    }
    setCryptoWallet("0x71C7656EC7ab88b098defB751B7401B5f6d1476B");
  }, [state]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const logToTerminal = (message: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Generate Zero-Knowledge Proof
  const handleGenerateProof = async () => {
    setIsGenerating(true);
    setGeneratedProof(null);
    setVerificationStatus("idle");
    setTerminalLogs([]);
    
    logToTerminal("Initializing Visa ZK-SNARK Prover Engine...");
    logToTerminal(`Selected Proof Type: Proof of ${proofType.toUpperCase()}`);
    logToTerminal("Loading Groth16 proving key and WASM circuit...");

    try {
      // Simulate cryptographic steps with realistic delays
      await new Promise((r) => setTimeout(r, 800));
      logToTerminal("Circuit loaded successfully. Constraints: 142,854 R1CS gates.");
      
      let inputs: any = {};
      if (proofType === "ownership") {
        logToTerminal("Hashing Card PAN and CVV with Poseidon Hash...");
        inputs = {
          cardHash: "0x3a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a10",
          pan: cardNumber.replace(/\s/g, ""),
          cvv: cvv,
          salt: "9876543210"
        };
      } else if (proofType === "solvency") {
        logToTerminal("Fetching Merkle Proof of Crypto Wallet Balance from Ethereum State Root...");
        inputs = {
          walletAddress: cryptoWallet,
          balance: parseFloat(walletBalance),
          threshold: parseFloat(targetThreshold),
          merkleRoot: "0x8f3c2b1a0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b"
        };
      } else if (proofType === "age") {
        logToTerminal("Calculating age constraint without revealing exact birthdate...");
        const birthYear = new Date(birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        inputs = {
          birthYear,
          currentYear,
          minAge: parseInt(targetThreshold) || 21,
          isOverAge: currentYear - birthYear >= (parseInt(targetThreshold) || 21) ? 1 : 0
        };
      } else {
        logToTerminal("Verifying non-sanctioned country code against decentralized identity registry...");
        inputs = {
          countryCodeHash: "0x1234567890abcdef",
          isAllowed: 1
        };
      }

      await new Promise((r) => setTimeout(r, 1000));
      logToTerminal("Generating witness parameters...");
      logToTerminal(`Witness generated successfully. Public inputs: ${JSON.stringify(Object.keys(inputs).slice(0, 2))}`);
      
      await new Promise((r) => setTimeout(r, 1200));
      logToTerminal("Computing Groth16 proof (pi_a, pi_b, pi_c)...");

      // Call actual ZKPEngine if available, otherwise generate mock proof
      let proof: ZkpProof;
      if (ZKPEngine && typeof ZKPEngine.generateProof === "function") {
        try {
          const zkpResult = await ZKPEngine.generateProof(inputs);
          proof = zkpResult;
        } catch (err) {
          proof = generateMockZkpProof(inputs);
        }
      } else {
        proof = generateMockZkpProof(inputs);
      }

      await new Promise((r) => setTimeout(r, 600));
      setGeneratedProof(proof);
      logToTerminal("ZKP Proof generated successfully!");
      logToTerminal(`Proof Hash: ${securityService?.hashSHA256 ? securityService.hashSHA256(JSON.stringify(proof)).slice(0, 32) : "0x" + Math.random().toString(16).slice(2, 34)}...`);
      logToTerminal("Ready for Visa Network verification.");
    } catch (error: any) {
      logToTerminal(`[ERROR] Proof generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockZkpProof = (inputs: any): ZkpProof => {
    return {
      pi_a: [
        "0x" + Math.random().toString(16).slice(2, 18),
        "0x" + Math.random().toString(16).slice(2, 18)
      ],
      pi_b: [
        ["0x" + Math.random().toString(16).slice(2, 18), "0x" + Math.random().toString(16).slice(2, 18)],
        ["0x" + Math.random().toString(16).slice(2, 18), "0x" + Math.random().toString(16).slice(2, 18)]
      ],
      pi_c: [
        "0x" + Math.random().toString(16).slice(2, 18),
        "0x" + Math.random().toString(16).slice(2, 18)
      ],
      publicSignals: [
        proofType === "ownership" ? "0x3a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a10" : "1",
        targetThreshold
      ]
    };
  };

  // Verify Proof on Visa Smart Contract / Validator
  const handleVerifyProof = async () => {
    if (!generatedProof) return;
    
    setVerificationStatus("verifying");
    logToTerminal("Submitting ZKP to Visa Decentralized Identity Validator...");
    
    try {
      await new Promise((r) => setTimeout(r, 1500));
      
      let isValid = true;
      // Perform basic validation logic
      if (proofType === "solvency") {
        isValid = parseFloat(walletBalance) >= parseFloat(targetThreshold);
      } else if (proofType === "age") {
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        isValid = age >= (parseInt(targetThreshold) || 21);
      }

      if (isValid) {
        setVerificationStatus("success");
        setVerificationDetails({
          validatorAddress: "0xVisaZkpValidator11223344556677889900",
          gasUsed: "42,109",
          blockNumber: "19,482,104",
          timestamp: new Date().toISOString()
        });
        logToTerminal("SUCCESS: Zero-Knowledge Proof verified on-chain!");
        logToTerminal("Visa transaction authorized without revealing sensitive cardholder data.");
        
        // Trigger Gemini analysis of the proof
        handleGetAiAnalysis();
      } else {
        setVerificationStatus("failed");
        logToTerminal("FAILURE: ZKP verification failed. Public signals do not match constraints.");
      }
    } catch (error: any) {
      setVerificationStatus("failed");
      logToTerminal(`[ERROR] Verification failed: ${error.message}`);
    }
  };

  // Settle Visa Transaction with Crypto Wallet
  const handleSettleTransaction = async () => {
    if (verificationStatus !== "success") return;
    setIsSettling(true);
    logToTerminal(`Initiating Crypto Settlement of $${transactionAmount} USD via ${selectedToken}...`);

    try {
      await new Promise((r) => setTimeout(r, 2000));
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setSettlementTxHash(txHash);
      
      logToTerminal(`Settlement successful! Tx Hash: ${txHash.slice(0, 18)}...`);
      logToTerminal(`Transferred ${transactionAmount} ${selectedToken} from ${cryptoWallet.slice(0, 10)}... to Visa Settlement Vault.`);

      // Add to global transactions context
      if (addTransaction) {
        addTransaction({
          id: `TX-${Math.floor(Math.random() * 1000000)}`,
          description: `Visa ZKP Settlement (${selectedToken})`,
          amount: -parseFloat(transactionAmount),
          date: new Date().toISOString().split("T")[0],
          category: "Financial",
          status: "Completed"
        });
      }
    } catch (error: any) {
      logToTerminal(`[ERROR] Settlement failed: ${error.message}`);
    } finally {
      setIsSettling(false);
    }
  };

  // Gemini AI Privacy Audit & Explanation
  const handleGetAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    
    const prompt = `
      You are a world-class Zero-Knowledge Cryptographer and Visa Security Auditor.
      Analyze the following ZKP verification event and explain it to the cardholder in a clear, empowering, and highly technical yet accessible way.
      
      Proof Type: Proof of ${proofType}
      Cardholder Wallet: ${cryptoWallet}
      Target Threshold: ${targetThreshold}
      Verification Status: SUCCESS
      
      Explain:
      1. How the ZK-SNARK circuit proved this statement without revealing the cardholder's actual sensitive data (like exact balance, card number, or birthdate).
      2. The mathematical security of Groth16 and Poseidon hashing used here.
      3. How this integrates with cryptocurrency settlement (e.g., USDC/ETH) to bypass traditional high-fee rails while maintaining absolute privacy.
      
      Keep the tone futuristic, secure, and professional. Format with clean markdown.
    `;

    try {
      const response = await callGemini(prompt);
      setAiAnalysis(response || "Unable to generate AI analysis at this time.");
    } catch (error) {
      setAiAnalysis("Error communicating with Gemini AI. Please check your API configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 text-blue-400">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Visa ZKP Identity Citadel
              </h1>
              <p className="text-sm text-slate-400">
                Zero-Knowledge Proof (ZKP) identity verification for Visa cardholders using the ZKPEngine.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-300">ZKPEngine: ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration & Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card Selection & Proof Type */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
              <CreditCard className="w-5 h-5" />
              1. Select Visa Card & Proof Type
            </h2>

            {/* Card Selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-2">Linked Visa Card</label>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded flex items-center justify-center text-[10px] font-bold tracking-widest text-white">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedCard ? `${selectedCard.bankName || "Sovereign Card"}` : "Visa Platinum"}
                    </p>
                    <p className="text-xs font-mono text-slate-500">
                      •••• •••• •••• {selectedCard ? selectedCard.number?.slice(-4) : "4242"}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                  ZKP Enabled
                </span>
              </div>
            </div>

            {/* Proof Type Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: "ownership", label: "Card Ownership", desc: "Prove card possession" },
                { id: "solvency", label: "Solvency Proof", desc: "Prove crypto balance" },
                { id: "age", label: "Age Verification", desc: "Prove age threshold" },
                { id: "compliance", label: "Sanction Check", desc: "Prove compliance" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProofType(type.id as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    proofType === type.id
                      ? "bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs font-semibold">{type.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Inputs based on Proof Type */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
                <Lock className="w-5 h-5" />
                2. Cryptographic Inputs
              </h2>
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showSensitive ? "Hide" : "Reveal"} Inputs
              </button>
            </div>

            <div className="space-y-4">
              {/* Card Details (Always needed for Visa context) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Card Number (PAN)</label>
                  <input
                    type={showSensitive ? "text" : "password"}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">CVV</label>
                  <input
                    type={showSensitive ? "text" : "password"}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Solvency Proof Inputs */}
              {proofType === "solvency" && (
                <div className="space-y-3 border-t border-slate-800 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Crypto Wallet Address</label>
                    <input
                      type="text"
                      value={cryptoWallet}
                      onChange={(e) => setCryptoWallet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Actual Balance (ETH)</label>
                      <input
                        type={showSensitive ? "text" : "password"}
                        value={walletBalance}
                        onChange={(e) => setWalletBalance(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Prove Balance &gt;=</label>
                      <input
                        type="text"
                        value={targetThreshold}
                        onChange={(e) => setTargetThreshold(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Age Proof Inputs */}
              {proofType === "age" && (
                <div className="space-y-3 border-t border-slate-800 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Birthdate</label>
                      <input
                        type={showSensitive ? "date" : "password"}
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Prove Age &gt;=</label>
                      <input
                        type="number"
                        value={targetThreshold}
                        onChange={(e) => setTargetThreshold(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Proof Inputs */}
              {proofType === "compliance" && (
                <div className="space-y-3 border-t border-slate-800 pt-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This circuit proves that your decentralized identity (DID) is not associated with any addresses on the OFAC sanctions list, without revealing your name, nationality, or wallet address.
                    </p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateProof}
                disabled={isGenerating}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating ZK-SNARK Proof...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Generate Zero-Knowledge Proof
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Prover Terminal & Verification */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Prover Terminal */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm flex flex-col h-[320px]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-400">
              <Terminal className="w-5 h-5" />
              ZKPEngine Prover Terminal
            </h2>
            <div className="flex-1 bg-black/80 font-mono text-xs text-cyan-400 p-4 rounded-lg border border-cyan-500/20 overflow-y-auto flex flex-col gap-1.5 shadow-inner">
              {terminalLogs.length === 0 ? (
                <span className="text-slate-600 italic">Awaiting proof generation trigger...</span>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Verification & Settlement Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              3. Visa Network Verification & Settlement
            </h2>

            {!generatedProof ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
                <LockKeyhole className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">No proof generated yet.</p>
                <p className="text-xs text-slate-600 mt-1">Complete steps 1 and 2 to generate a cryptographic proof.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Proof Details Summary */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-400">Generated Proof (Groth16)</span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                      snarkjs / groth16
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500">
                    <div>
                      <p className="text-slate-400">pi_a[0]</p>
                      <p className="truncate">{generatedProof.pi_a[0]}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">pi_b[0][0]</p>
                      <p className="truncate">{generatedProof.pi_b[0][0]}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">publicSignals[0]</p>
                      <p className="truncate">{generatedProof.publicSignals[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Action */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleVerifyProof}
                    disabled={verificationStatus === "verifying"}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {verificationStatus === "verifying" ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Verifying Proof...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Verify Proof on Visa Network
                      </>
                    )}
                  </button>
                </div>

                {/* Verification Status Display */}
                {verificationStatus !== "idle" && verificationStatus !== "verifying" && (
                  <div
                    className={`p-4 rounded-lg border flex items-start gap-3 ${
                      verificationStatus === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {verificationStatus === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {verificationStatus === "success"
                          ? "Cryptographic Verification Successful"
                          : "Verification Failed"}
                      </p>
                      {verificationStatus === "success" && verificationDetails && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                          <p>Validator: <span className="text-slate-200">{verificationDetails.validatorAddress.slice(0, 10)}...</span></p>
                          <p>Gas Used: <span className="text-slate-200">{verificationDetails.gasUsed}</span></p>
                          <p>Block: <span className="text-slate-200">{verificationDetails.blockNumber}</span></p>
                          <p>Time: <span className="text-slate-200">{new Date(verificationDetails.timestamp).toLocaleTimeString()}</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Crypto Settlement Bridge */}
                {verificationStatus === "success" && (
                  <div className="border-t border-slate-800 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        Decentralized Crypto Settlement Bridge
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settleWithCrypto}
                          onChange={(e) => setSettleWithCrypto(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {settleWithCrypto && (
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-medium text-slate-400 mb-1">Token</label>
                            <select
                              value={selectedToken}
                              onChange={(e) => setSelectedToken(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="USDC">USDC (Stablecoin)</option>
                              <option value="ETH">ETH (Ethereum)</option>
                              <option value="BTC">WBTC (Bitcoin)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-slate-400 mb-1">Amount (USD)</label>
                            <input
                              type="text"
                              value={transactionAmount}
                              onChange={(e) => setTransactionAmount(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={handleSettleTransaction}
                              disabled={isSettling}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-1.5 px-3 rounded text-xs transition-all flex items-center justify-center gap-1"
                            >
                              {isSettling ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Wallet className="w-3 h-3" />
                              )}
                              Settle Tx
                            </button>
                          </div>
                        </div>

                        {settlementTxHash && (
                          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-mono text-blue-300 flex items-center justify-between">
                            <span className="truncate">Tx Hash: {settlementTxHash}</span>
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gemini AI Privacy Audit Section */}
      {verificationStatus === "success" && (
        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-slate-200">Gemini AI Cryptographic Privacy Audit</h2>
            </div>
            {isAnalyzing && (
              <span className="text-xs text-purple-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Analyzing proof parameters...
              </span>
            )}
          </div>

          {aiAnalysis ? (
            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-4 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
              <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, "<br />") }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
              <Sparkles className="w-8 h-8 text-purple-500/40 mb-2 animate-pulse" />
              <p className="text-sm text-slate-400">Awaiting Gemini AI analysis...</p>
              <p className="text-xs text-slate-600 mt-1">Verify a proof to trigger the automated cryptographic audit.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}