import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  FileText, 
  Cpu, 
  Shield, 
  Database, 
  ArrowRight, 
  Copy, 
  Check, 
  Info, 
  AlertTriangle, 
  Layers,
  Lock,
  Unlock,
  Eye,
  FileSpreadsheet,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

// --- Helper Functions ---
const base64urlEncode = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (e) {
    return '';
  }
};

const base64urlDecode = (str: string): string => {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    return '';
  }
};

// Simple mock encryption/decryption helper that encodes payload in ciphertext
const generateMockJWE = (header: object, payload: string): string => {
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const encryptedKeyB64 = base64urlEncode("mock-encrypted-key-symm-key-data-rfc7516");
  const ivB64 = base64urlEncode("mock-iv-12-bytes");
  const ciphertextB64 = base64urlEncode(payload);
  const tagB64 = base64urlEncode("mock-auth-tag-16-bytes");
  return `${headerB64}.${encryptedKeyB64}.${ivB64}.${ciphertextB64}.${tagB64}`;
};

const parseJWE = (jweString: string) => {
  const parts = jweString.trim().split('.');
  if (parts.length !== 5) {
    return { error: "Invalid JWE format. A compact JWE must have exactly 5 parts separated by dots." };
  }

  const [headerB64, encryptedKeyB64, ivB64, ciphertextB64, tagB64] = parts;
  
  const decodedHeaderStr = base64urlDecode(headerB64);
  let headerObj = null;
  try {
    headerObj = JSON.parse(decodedHeaderStr);
  } catch (e) {
    headerObj = { error: "Failed to parse header JSON", raw: decodedHeaderStr };
  }

  // Attempt to decode ciphertext (assuming our mock format or plain text base64url)
  const decodedPayload = base64urlDecode(ciphertextB64);

  return {
    header: headerObj,
    headerRaw: decodedHeaderStr,
    encryptedKeyLength: Math.round((encryptedKeyB64.length * 3) / 4),
    ivLength: Math.round((ivB64.length * 3) / 4),
    ciphertextLength: Math.round((ciphertextB64.length * 3) / 4),
    tagLength: Math.round((tagB64.length * 3) / 4),
    payload: decodedPayload,
    parts: {
      header: headerB64,
      encryptedKey: encryptedKeyB64,
      iv: ivB64,
      ciphertext: ciphertextB64,
      tag: tagB64
    }
  };
};

const validateABA = (routing: string) => {
  const cleanRouting = routing.replace(/\D/g, '');
  if (cleanRouting.length !== 9) {
    return { isValid: false, reason: "Must be exactly 9 digits", digits: [] };
  }

  const digits = cleanRouting.split('').map(Number);
  // Formula: 3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9)
  const sum1 = digits[0] + digits[3] + digits[6];
  const sum2 = digits[1] + digits[4] + digits[7];
  const sum3 = digits[2] + digits[5] + digits[8];
  
  const total = (3 * sum1) + (7 * sum2) + sum3;
  const isValid = total % 10 === 0;

  return {
    isValid,
    reason: isValid ? "Valid ABA Routing Number" : "Checksum verification failed",
    digits,
    multipliers: [3, 7, 1, 3, 7, 1, 3, 7, 1],
    products: [
      digits[0] * 3, digits[1] * 7, digits[2] * 1,
      digits[3] * 3, digits[4] * 7, digits[5] * 1,
      digits[6] * 3, digits[7] * 7, digits[8] * 1
    ],
    total,
    modulo: total % 10
  };
};

const getBankName = (routing: string): string => {
  if (!routing || routing.length < 4) return "Unknown Financial Institution";
  const prefix = routing.substring(0, 4);
  const bankMap: Record<string, string> = {
    "0210": "JPMorgan Chase Bank, N.A.",
    "0260": "BNY Mellon",
    "1210": "Wells Fargo Bank, N.A.",
    "0211": "Citibank, N.A.",
    "0910": "U.S. Bank, N.A.",
    "1110": "Bank of America, N.A.",
    "0710": "JPMorgan Chase Bank, N.A. (Chicago)",
    "0310": "PNC Bank, N.A.",
    "0410": "KeyBank, N.A.",
    "0510": "Capital One, N.A.",
    "0610": "Federal Reserve Bank",
    "1220": "Bank of America, N.A. (West)",
    "3211": "Silicon Valley Bank"
  };
  return bankMap[prefix] || "Registered US Financial Institution";
};

// --- Mock Data for Batch Simulator ---
const initialBatchTransactions = [
  {
    id: "TXN-9081",
    recipient: "Acme Corp",
    routing: "021000021", // Valid Chase
    payload: JSON.stringify({ account: "998877665", amount: 12500.00, currency: "USD" }),
    status: "pending"
  },
  {
    id: "TXN-4412",
    recipient: "Globex Industries",
    routing: "121000248", // Valid Wells Fargo
    payload: JSON.stringify({ account: "112233445", amount: 84300.50, currency: "USD" }),
    status: "pending"
  },
  {
    id: "TXN-7721",
    recipient: "Initech LLC",
    routing: "021000028", // Invalid Checksum
    payload: JSON.stringify({ account: "556677889", amount: 450.00, currency: "USD" }),
    status: "pending"
  },
  {
    id: "TXN-1049",
    recipient: "Umbrella Corp",
    routing: "091000022", // Valid US Bank
    payload: JSON.stringify({ account: "443322110", amount: 1250000.00, currency: "USD" }),
    status: "pending"
  },
  {
    id: "TXN-3389",
    recipient: "Hooli Inc",
    routing: "1234", // Invalid Length
    payload: JSON.stringify({ account: "88888888", amount: 99.99, currency: "USD" }),
    status: "pending"
  }
];

export default function B2BRoutingDecryptorValidator() {
  const [activeTab, setActiveTab] = useState<'validator' | 'decryptor' | 'generator' | 'batch'>('validator');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- State for ABA Validator ---
  const [routingInput, setRoutingInput] = useState<string>("021000021");
  const validationResult = useMemo(() => validateABA(routingInput), [routingInput]);

  // --- State for JWE Decryptor ---
  const [jweInput, setJweInput] = useState<string>("");
  const [decryptedResult, setDecryptedResult] = useState<any>(null);

  // --- State for JWE Generator ---
  const [genHeader, setGenHeader] = useState<string>(JSON.stringify({
    alg: "RSA-OAEP-256",
    enc: "A256GCM",
    kid: "b2b-key-prod-09",
    typ: "JWE"
  }, null, 2));
  const [genPayload, setGenPayload] = useState<string>(JSON.stringify({
    routingNumber: "021000021",
    accountNumber: "1234567890",
    transferAmount: 25000.00,
    originator: "B2B Payment Gateway"
  }, null, 2));
  const [generatedJWE, setGeneratedJWE] = useState<string>("");

  // --- State for Batch Simulator ---
  const [batchTxns, setBatchTxns] = useState(initialBatchTransactions);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Trigger copy feedback
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate JWE on load or when inputs change
  useEffect(() => {
    try {
      const parsedHeader = JSON.parse(genHeader);
      const token = generateMockJWE(parsedHeader, genPayload);
      setGeneratedJWE(token);
    } catch (e) {
      setGeneratedJWE("Error: Invalid Header JSON format");
    }
  }, [genHeader, genPayload]);

  // Pre-populate Decryptor with generated JWE for easy testing
  const loadGeneratedIntoDecryptor = () => {
    setJweInput(generatedJWE);
    setActiveTab('decryptor');
    // Automatically trigger decryption
    const result = parseJWE(generatedJWE);
    setDecryptedResult(result);
  };

  const handleDecryptSubmit = () => {
    const result = parseJWE(jweInput);
    setDecryptedResult(result);
  };

  // Run Batch Pipeline Simulation
  const runBatchSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    
    // Reset statuses
    setBatchTxns(prev => prev.map(t => ({ ...t, status: 'pending' })));
    
    const log = (msg: string) => {
      setSimulationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    log("Starting B2B Batch Pipeline Processing...");
    
    for (let i = 0; i < batchTxns.length; i++) {
      const txn = batchTxns[i];
      
      // Step 1: Validating Routing Number
      setBatchTxns(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'validating' } : t));
      log(`[${txn.id}] Validating routing number: ${txn.routing}...`);
      await new Promise(r => setTimeout(r, 800));
      
      const routeVal = validateABA(txn.routing);
      if (!routeVal.isValid) {
        setBatchTxns(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'failed_routing' } : t));
        log(`[${txn.id}] ❌ Routing validation failed: ${routeVal.reason}`);
        continue;
      }
      log(`[${txn.id}]  Routing validated successfully (${getBankName(txn.routing)})`);

      // Step 2: Encrypting Payload to JWE
      setBatchTxns(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'encrypting' } : t));
      log(`[${txn.id}] Encrypting payload into JWE format...`);
      await new Promise(r => setTimeout(r, 800));
      
      const mockHeader = { alg: "RSA-OAEP-256", enc: "A256GCM", kid: `key-${txn.id.toLowerCase()}` };
      const jwe = generateMockJWE(mockHeader, txn.payload);
      log(`[${txn.id}]  JWE generated: ${jwe.substring(0, 25)}...`);

      // Step 3: Simulating Decryption & Dispatch
      setBatchTxns(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'decrypting' } : t));
      log(`[${txn.id}] Simulating secure gateway decryption & signature verification...`);
      await new Promise(r => setTimeout(r, 800));
      
      const parsed = parseJWE(jwe);
      if (parsed.error) {
        setBatchTxns(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'failed_decryption' } : t));
        log(`[${txn.id}] ❌ Decryption failed: ${parsed.error}`);
        continue;
      }

      // Step 4: Success
      setBatchTxns(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'success' } : t));
      log(`[${txn.id}]  Payment dispatched to ${getBankName(txn.routing)} successfully.`);
    }

    log("Batch Pipeline Processing Completed.");
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">B2B Financial Gateway Toolkit</h1>
              <p className="text-xs text-slate-400">JWE Decryptor, ABA Validator & Pipeline Simulator</p>
            </div>
          </div>
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('validator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'validator' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ABA Validator
            </button>
            <button
              onClick={() => setActiveTab('decryptor')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'decryptor' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JWE Decryptor
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'generator' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JWE Generator
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'batch' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Batch Simulator
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: ABA ROUTING VALIDATOR */}
        {activeTab === 'validator' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Database className="text-indigo-400 h-5 w-5" />
                    ABA Routing Number Validator
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Validate US routing transit numbers (RTN) using the official Mod 10 checksum algorithm.
                  </p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono">
                  Mod 10 Checksum
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Routing Transit Number (9 Digits)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={9}
                        value={routingInput}
                        onChange={(e) => setRoutingInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 021000021"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-3.5">
                        {validationResult.isValid ? (
                          <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                        ) : (
                          <XCircle className="text-rose-500 h-6 w-6" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <span className="text-xs text-slate-500 block mb-2">Test Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setRoutingInput("021000021")}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-300 font-mono"
                      >
                        021000021 (Chase)
                      </button>
                      <button 
                        onClick={() => setRoutingInput("121000248")}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-300 font-mono"
                      >
                        121000248 (Wells Fargo)
                      </button>
                      <button 
                        onClick={() => setRoutingInput("021000028")}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs px-3 py-1.5 rounded text-rose-400 font-mono"
                      >
                        021000028 (Invalid)
                      </button>
                    </div>
                  </div>

                  {/* Bank Info Card */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                    <span className="text-xs text-slate-500 block">Resolved Institution</span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {getBankName(routingInput)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Prefix: {routingInput.substring(0, 4) || "N/A"} (Federal Reserve District)
                    </span>
                  </div>
                </div>

                {/* Math Breakdown Column */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Info className="h-4 w-4 text-indigo-400" />
                    Step-by-Step Checksum Calculation
                  </h3>

                  {routingInput.length === 9 ? (
                    <div className="space-y-6">
                      {/* Formula Display */}
                      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center font-mono text-xs text-slate-400">
                        Formula: <span className="text-indigo-400">3(d₁ + d₄ + d₇) + 7(d₂ + d₅ + d₈) + (d₃ + d₆ + d₉)</span> mod 10 = 0
                      </div>

                      {/* Grid of Digits & Multipliers */}
                      <div className="grid grid-cols-9 gap-1 text-center">
                        {validationResult.digits.map((digit, idx) => (
                          <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800">
                            <div className="text-xs text-slate-500 font-mono">d{idx+1}</div>
                            <div className="text-lg font-bold text-white font-mono">{digit}</div>
                            <div className="text-xs text-indigo-400 font-mono mt-1">× {validationResult.multipliers[idx]}</div>
                            <div className="border-t border-slate-800 mt-1 pt-1 text-xs font-semibold text-emerald-400 font-mono">
                              {validationResult.products[idx]}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Math Equation */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-mono text-slate-300">
                          <span>Sum of Products:</span>
                          <span>
                            ({validationResult.products.join(' + ')}) = <strong className="text-white">{validationResult.total}</strong>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-mono text-slate-300">
                          <span>Modulo 10 Check:</span>
                          <span>
                            {validationResult.total} mod 10 = <strong className={validationResult.modulo === 0 ? "text-emerald-400" : "text-rose-400"}>{validationResult.modulo}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Status Banner */}
                      <div className={`p-4 rounded-lg flex items-center gap-3 ${
                        validationResult.isValid 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        {validationResult.isValid ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">Valid Routing Transit Number</p>
                              <p className="text-xs opacity-80">The checksum is exactly 0. This routing number is structurally valid for ACH and Wire transfers.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">Invalid Checksum</p>
                              <p className="text-xs opacity-80">The checksum result is {validationResult.modulo} (expected 0). This routing number will be rejected by clearing networks.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                      <AlertTriangle className="h-8 w-8 mb-2 text-amber-500/60" />
                      <p className="text-sm">Please enter a 9-digit routing transit number to view the math breakdown.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JWE DECRYPTOR & HEADER INSPECTOR */}
        {activeTab === 'decryptor' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Lock className="text-indigo-400 h-5 w-5" />
                    JWE Decryptor & Header Inspector
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Paste a compact JWE token to inspect its protected headers, verify its structure, and decrypt its payload.
                  </p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono">
                  RFC 7516 Compact JWE
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Compact JWE Token (5 Dot-Separated Parts)
                  </label>
                  <textarea
                    rows={4}
                    value={jweInput}
                    onChange={(e) => setJweInput(e.target.value)}
                    placeholder="eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0.encryptedKey.iv.ciphertext.tag"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    Don't have a JWE? Generate one in the <button onClick={() => setActiveTab('generator')} className="text-indigo-400 underline hover:text-indigo-300">Generator tab</button>.
                  </span>
                  <button
                    onClick={handleDecryptSubmit}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    <Unlock className="h-4 w-4" />
                    Inspect & Decrypt
                  </button>
                </div>
              </div>

              {/* Decryption Results */}
              {decryptedResult && (
                <div className="mt-8 border-t border-slate-800 pt-8 space-y-6">
                  {decryptedResult.error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-lg flex items-center gap-3">
                      <XCircle className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-mono">{decryptedResult.error}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* JWE Structure Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-400" />
                          JWE Structure Breakdown
                        </h3>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded">
                            <span className="text-red-400 font-bold block mb-1">1. Protected Header</span>
                            <span className="text-slate-400 break-all">{decryptedResult.parts.header.substring(0, 40)}...</span>
                          </div>
                          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded">
                            <span className="text-amber-400 font-bold block mb-1">2. Encrypted Key ({decryptedResult.encryptedKeyLength} bytes)</span>
                            <span className="text-slate-400 break-all">{decryptedResult.parts.encryptedKey.substring(0, 40)}...</span>
                          </div>
                          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
                            <span className="text-yellow-400 font-bold block mb-1">3. Initialization Vector ({decryptedResult.ivLength} bytes)</span>
                            <span className="text-slate-400 break-all">{decryptedResult.parts.iv}</span>
                          </div>
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            <span className="text-emerald-400 font-bold block mb-1">4. Ciphertext ({decryptedResult.ciphertextLength} bytes)</span>
                            <span className="text-slate-400 break-all">{decryptedResult.parts.ciphertext.substring(0, 40)}...</span>
                          </div>
                          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded">
                            <span className="text-blue-400 font-bold block mb-1">5. Authentication Tag ({decryptedResult.tagLength} bytes)</span>
                            <span className="text-slate-400 break-all">{decryptedResult.parts.tag}</span>
                          </div>
                        </div>
                      </div>

                      {/* Header Inspector */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Eye className="h-4 w-4 text-indigo-400" />
                          Header Parameters
                        </h3>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs text-slate-400 font-mono">Algorithm (alg)</span>
                            <span className="text-xs font-bold text-white font-mono">{decryptedResult.header?.alg || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs text-slate-400 font-mono">Encryption (enc)</span>
                            <span className="text-xs font-bold text-white font-mono">{decryptedResult.header?.enc || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs text-slate-400 font-mono">Key ID (kid)</span>
                            <span className="text-xs font-bold text-indigo-400 font-mono">{decryptedResult.header?.kid || "N/A"}</span>
                          </div>
                          <div className="flex justify-between pb-1">
                            <span className="text-xs text-slate-400 font-mono">Type (typ)</span>
                            <span className="text-xs font-bold text-white font-mono">{decryptedResult.header?.typ || "N/A"}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                          <span className="text-xs text-slate-400 font-semibold block mb-1">Raw Decoded Header JSON</span>
                          <pre className="text-[10px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
                            {JSON.stringify(decryptedResult.header, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Decrypted Payload */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Unlock className="h-4 w-4 text-emerald-400" />
                          Decrypted Payload
                        </h3>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-emerald-400 font-semibold">Decryption Successful</span>
                            <button
                              onClick={() => handleCopy(decryptedResult.payload, 'payload')}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all"
                              title="Copy Payload"
                            >
                              {copiedText === 'payload' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                          <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto max-h-64">
                            {decryptedResult.payload || "No payload data found."}
                          </pre>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: JWE MOCK GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Shield className="text-indigo-400 h-5 w-5" />
                    JWE Mock Generator
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Generate valid-looking RFC 7516 JWE tokens with custom headers and payloads to test your decryption pipelines.
                  </p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono">
                  Developer Utility
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      JWE Protected Header (JSON)
                    </label>
                    <textarea
                      rows={5}
                      value={genHeader}
                      onChange={(e) => setGenHeader(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Payload (JSON or Plain Text)
                    </label>
                    <textarea
                      rows={6}
                      value={genPayload}
                      onChange={(e) => setGenPayload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Output */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-indigo-400" />
                        Generated Compact JWE
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(generatedJWE, 'gen_jwe')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          {copiedText === 'gen_jwe' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy JWE
                            </>
                          )}
                        </button>
                        <button
                          onClick={loadGeneratedIntoDecryptor}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          Test in Decryptor
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-slate-300 break-all max-h-64 overflow-y-auto">
                      {generatedJWE}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs text-slate-400">
                    <p className="font-semibold text-slate-300">💡 How this works:</p>
                    <p>This generator constructs a standard 5-part JWE. To make client-side testing seamless, the payload is base64url-encoded directly into the 4th part (ciphertext). The Decryptor can read and decode this payload instantly without requiring complex private key handshakes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BATCH PIPELINE SIMULATOR */}
        {activeTab === 'batch' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileSpreadsheet className="text-indigo-400 h-5 w-5" />
                    Batch Pipeline Simulator
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Simulate a high-throughput B2B payment processing pipeline. Watch transactions undergo routing validation, JWE encryption, and secure gateway dispatch.
                  </p>
                </div>
                <button
                  onClick={runBatchSimulation}
                  disabled={isSimulating}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Batch Pipeline
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Transaction Queue</h3>
                  <div className="space-y-3">
                    {batchTxns.map((txn) => {
                      const routeVal = validateABA(txn.routing);
                      return (
                        <div 
                          key={txn.id} 
                          className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-indigo-400 font-semibold">{txn.id}</span>
                              <span className="text-sm font-semibold text-white">{txn.recipient}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                              <span>Routing: <strong className="font-mono text-slate-300">{txn.routing}</strong></span>
                              <span>Bank: <strong className="text-slate-300">{getBankName(txn.routing)}</strong></span>
                            </div>
                          </div>

                          {/* Pipeline Steps Visualizer */}
                          <div className="flex items-center gap-2">
                            {/* Step 1: Routing */}
                            <div className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                              txn.status === 'pending' ? 'bg-slate-950 text-slate-500' :
                              txn.status === 'validating' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                              txn.status === 'failed_routing' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              Routing
                              {txn.status === 'failed_routing' && <XCircle className="h-3 w-3" />}
                              {['encrypting', 'decrypting', 'success'].includes(txn.status) && <CheckCircle2 className="h-3 w-3" />}
                            </div>

                            <ChevronRight className="h-3 w-3 text-slate-600" />

                            {/* Step 2: Encryption */}
                            <div className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                              ['pending', 'validating', 'failed_routing'].includes(txn.status) ? 'bg-slate-950 text-slate-500' :
                              txn.status === 'encrypting' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              JWE Encrypt
                              {['decrypting', 'success'].includes(txn.status) && <CheckCircle2 className="h-3 w-3" />}
                            </div>

                            <ChevronRight className="h-3 w-3 text-slate-600" />

                            {/* Step 3: Decrypt & Dispatch */}
                            <div className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                              ['pending', 'validating', 'failed_routing', 'encrypting'].includes(txn.status) ? 'bg-slate-950 text-slate-500' :
                              txn.status === 'decrypting' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                              txn.status === 'failed_decryption' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              Dispatch
                              {txn.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                              {txn.status === 'failed_decryption' && <XCircle className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Logs */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Pipeline Execution Logs</h3>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-[380px] flex flex-col justify-between">
                    <div className="font-mono text-[11px] text-slate-300 space-y-1.5 overflow-y-auto max-h-[310px] pr-2">
                      {simulationLogs.length === 0 ? (
                        <div className="text-slate-500 h-full flex items-center justify-center text-center py-12">
                          Click "Run Batch Pipeline" to start the simulation.
                        </div>
                      ) : (
                        simulationLogs.map((log, idx) => (
                          <div key={idx} className="border-b border-slate-800/50 pb-1 last:border-0">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs text-slate-500">
                      <span>Status: {isSimulating ? "Processing..." : "Idle"}</span>
                      <button 
                        onClick={() => {
                          setBatchTxns(initialBatchTransactions);
                          setSimulationLogs([]);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" /> Reset Queue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Shield className="h-4 w-4 text-indigo-500" />
            <span>B2B Financial Gateway Toolkit — Secure Sandbox Environment</span>
          </div>
          <div className="flex space-x-6 text-xs text-slate-500">
            <span>RFC 7516 (JWE) Compliant</span>
            <span>Fedwire/ACH Routing Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
