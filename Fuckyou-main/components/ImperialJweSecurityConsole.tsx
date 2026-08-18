import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Cpu, 
  Lock, 
  Unlock, 
  FileCode, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Terminal, 
  Layers, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

// Mock JWE Response Data from Citibank / Modern Treasury API
const MOCK_JWE_RESPONSE = {
  header: {
    alg: "RSA-OAEP-256",
    enc: "A256CBC-HS512",
    kid: "kid_citibank_imperial_sovereign_prod_99x_alpha",
    x5c: [
      "MIIFdzCCBFCgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRUwEwYDVQQHDAxTYW4gRnJhbmNpc2NvMR0wGwYDVQQKDBRDaXRpYmFuayBJbXBlcmlhbCBBSTEfMB0GA1UECwwWQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlczEgMB4GA1UEAwwXQ2l0aWJhbmstTW9kZXJuLVRyZWFzdXJ5MB4XDTI0MDIwMTAwMDAwMFoXDTM0MDIwMTAwMDAwMFowgY8xCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRUwEwYDVQQHDAxTYW4gRnJhbmNpc2NvMR0wGwYDVQQKDBRDaXRpYmFuayBJbXBlcmlhbCBBSTEfMB0GA1UECwwWQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlczEgMB4GA1UEAwwXQ2l0aWJhbmstTW9kZXJuLVRyZWFzdXJ5MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA0N9gX8v...",
      "MIIE3DCCAsSgAwIBAgIBATANBgkqhkiG9w0BAQsFADCBgDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFTATBgNVBAcMDFNhbiBGcmFuY2lzY28xHTAbBgNVBAoMFENpdGliYW5rIEltcGVyaWFsIEFJMR8wHQYDVQQLDBZDcnlwdG9ncmFwaGljIFNlcnZpY2VzMSAwHgYDVQQDDBdDaXRpYmFuay1Nb2Rlcm4tVHJlYXN1cnkwHhcNMjQwMjAxMDAwMDAwWhcNMzQwMjAxMDAwMDAwWjCBgDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFTATBgNVBAcMDFNhbiBGcmFuY2lzY28xHTAbBgNVBAoMFENpdGliYW5rIEltcGVyaWFsIEFJMR8wHQYDVQQLDBZDcnlwdG9ncmFwaGljIFNlcnZpY2VzMSAwHgYDVQQDDBdDaXRpYmFuay1Nb2Rlcm4tVHJlYXN1cnkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQ..."
    ]
  },
  encrypted_key: "eyJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.g3X9pL8z...",
  iv: "d3g5cGw4emR3eDlwbDg=",
  ciphertext: "U292ZXJlaWduLUdyYWRlLUVuY3J5cHRlZC1Sb3V0aW5nLU51bWJlci1DaXRpYmFuay1Nb2Rlcm4tVHJlYXN1cnktQUktT2x5bXB1cy05OTk5OTk5OTk=",
  tag: "bXlzdGVyeV90YWdfOTk5"
};

export default function ImperialJweSecurityConsole() {
  const [accountId, setAccountId] = useState("acc_imperial_999_vault");
  const [routingNumber, setRoutingNumber] = useState("021000021"); // Citibank NY RTN
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sovereignShieldActive, setSovereignShieldActive] = useState(true);
  const [selectedHeaderParam, setSelectedHeaderParam] = useState<string | null>("alg");
  const [entropyValue, setEntropyValue] = useState(99.9999998);
  const [aiLogs, setAiLogs] = useState<string[]>([
    "System initialized. Sovereign-grade AI Cryptographic Shield active.",
    "Citibank Private Wealth API handshake established.",
    "Modern Treasury ledger synchronization complete."
  ]);
  const [showRawCert, setShowRawCert] = useState(false);

  // Simulate real-time entropy fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setEntropyValue(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.0000001;
        const next = prev + fluctuation;
        return next > 100 ? 100 : next < 99.99999 ? 99.99999 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerAiAnalysis = () => {
    setIsAnalyzing(true);
    setAiLogs(prev => [...prev, `Initiating deep cryptographic audit for account: ${accountId}...`]);
    
    setTimeout(() => {
      setAiLogs(prev => [
        ...prev,
        "Analyzing JWE Header parameters...",
        "Algorithm verified: RSA-OAEP-256 (Optimal Asymmetric Encryption Padding with SHA-256).",
        "Encryption verified: A256CBC-HS512 (AES 256-bit CBC with HMAC SHA-512).",
        "Key ID (kid) matched with Citibank Sovereign HSM Vault.",
        "X.509 Certificate Chain (x5c) validated against Federal Reserve Root CA.",
        "Sovereign-grade privacy shield: 100% secure. Zero-knowledge proof verified."
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getHeaderParamDetails = (param: string) => {
    switch (param) {
      case 'alg':
        return {
          title: "Algorithm: RSA-OAEP-256",
          description: "Optimal Asymmetric Encryption Padding with SHA-256. This ensures that the routing number is encrypted using a public key that only Citibank's private HSM (Hardware Security Module) can decrypt.",
          securityLevel: "Sovereign / Quantum-Resistant",
          costFactor: "Ultra-Premium Cryptographic Compute"
        };
      case 'enc':
        return {
          title: "Encryption: A256CBC-HS512",
          description: "AES 256-bit in Cipher Block Chaining mode combined with HMAC SHA-512 for integrity. This dual-layer symmetric encryption guarantees absolute confidentiality and tamper-proof routing data.",
          securityLevel: "Military-Grade / Multi-Layered",
          costFactor: "High-Throughput Hardware Accelerated"
        };
      case 'kid':
        return {
          title: "Key ID: kid_citibank_imperial_sovereign_prod_99x_alpha",
          description: "A unique identifier for the specific cryptographic key pair stored in Citibank's ultra-secure, air-gapped physical vault. Rotated every 24 hours via AI-driven entropy schedules.",
          securityLevel: "Dynamic Air-Gapped Key",
          costFactor: "Bespoke Key Management Infrastructure"
        };
      case 'x5c':
        return {
          title: "X.509 Certificate Chain (x5c)",
          description: "An array of base64-encoded DER certificates providing a cryptographic chain of trust. This proves that the public key used for encryption belongs strictly to the verified Citibank Imperial AI entity.",
          securityLevel: "Federal-Grade Trust Chain",
          costFactor: "Multi-Signature Certificate Authority"
        };
      default:
        return null;
    }
  };

  const activeDetails = selectedHeaderParam ? getHeaderParamDetails(selectedHeaderParam) : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Luxury Border */}
      <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 w-full shadow-[0_2px_20px_rgba(245,158,11,0.5)]" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <header className="border-b border-amber-500/20 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                Citibank Private Wealth AI
              </span>
              <span className="px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-500" /> Modern Treasury
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-500">
              Imperial JWE Security Console
            </h1>
            <p className="text-neutral-400 mt-2 max-w-2xl text-sm">
              Sovereign-grade cryptographic visualization and AI-driven threat analysis for high-value routing number encryption.
            </p>
          </div>

          {/* Sovereign Shield Status */}
          <div className="bg-neutral-900/80 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(212,163,89,0.05)]">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-md ${sovereignShieldActive ? 'bg-amber-500/30 animate-pulse' : 'bg-red-500/20'}`} />
              <div className={`relative p-3 rounded-full border ${sovereignShieldActive ? 'bg-amber-950/50 border-amber-500/50 text-amber-400' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Sovereign Shield</div>
              <div className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                {sovereignShieldActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    ACTIVE (100% PRIVACY)
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    BYPASSED
                  </>
                )}
              </div>
            </div>
            <button 
              onClick={() => setSovereignShieldActive(!sovereignShieldActive)}
              className="ml-4 px-3 py-1.5 text-xs font-mono bg-neutral-950 hover:bg-amber-500 hover:text-black border border-amber-500/30 rounded-lg transition-all duration-300"
            >
              TOGGLE
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive JWE Header Inspector (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Interactive JWE Header Visualizer */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-amber-100">JWE Header Parameters</h2>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  GET /accounts/{accountId}/encrypt/accountRoutingNumber
                </span>
              </div>

              {/* Interactive Parameter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                {/* ALG */}
                <button 
                  onClick={() => setSelectedHeaderParam('alg')}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedHeaderParam === 'alg' 
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(212,163,89,0.1)]' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">alg</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">Asymmetric</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-neutral-200">{MOCK_JWE_RESPONSE.header.alg}</div>
                  <div className="text-xs text-neutral-500 mt-1">Key Wrap Algorithm</div>
                </button>

                {/* ENC */}
                <button 
                  onClick={() => setSelectedHeaderParam('enc')}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedHeaderParam === 'enc' 
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(212,163,89,0.1)]' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">enc</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">Symmetric</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-neutral-200">{MOCK_JWE_RESPONSE.header.enc}</div>
                  <div className="text-xs text-neutral-500 mt-1">Content Encryption</div>
                </button>

                {/* KID */}
                <button 
                  onClick={() => setSelectedHeaderParam('kid')}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedHeaderParam === 'kid' 
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(212,163,89,0.1)]' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">kid</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">Key Identifier</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-neutral-200 truncate">{MOCK_JWE_RESPONSE.header.kid}</div>
                  <div className="text-xs text-neutral-500 mt-1">HSM Key Reference</div>
                </button>

                {/* X5C */}
                <button 
                  onClick={() => setSelectedHeaderParam('x5c')}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedHeaderParam === 'x5c' 
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(212,163,89,0.1)]' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-amber-400 font-bold">x5c</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">Cert Chain</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-neutral-200 truncate">[{MOCK_JWE_RESPONSE.header.x5c.length} Certificates]</div>
                  <div className="text-xs text-neutral-500 mt-1">X.509 Public Key Chain</div>
                </button>

              </div>

              {/* Parameter Deep Dive Panel */}
              {activeDetails && (
                <div className="bg-neutral-950 border border-amber-500/20 rounded-xl p-5 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Award className="w-3 h-3" /> Sovereign Verified
                  </div>
                  <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {activeDetails.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    {activeDetails.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-900 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Security Level</span>
                      <span className="text-amber-300 font-semibold">{activeDetails.securityLevel}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Cost Tier</span>
                      <span className="text-amber-300 font-semibold">{activeDetails.costFactor}</span>
                    </div>
                  </div>

                  {/* Special Certificate Chain Viewer */}
                  {selectedHeaderParam === 'x5c' && (
                    <div className="mt-4 pt-4 border-t border-neutral-900">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono text-neutral-400">Certificate Chain Payload</span>
                        <button 
                          onClick={() => setShowRawCert(!showRawCert)}
                          className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                        >
                          {showRawCert ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showRawCert ? "Hide Raw" : "Show Raw Base64"}
                        </button>
                      </div>
                      {showRawCert ? (
                        <div className="bg-neutral-900 p-3 rounded font-mono text-[10px] text-neutral-400 overflow-x-auto max-h-40 overflow-y-auto border border-neutral-800">
                          {MOCK_JWE_RESPONSE.header.x5c.map((cert, idx) => (
                            <div key={idx} className="mb-3 last:mb-0">
                              <div className="text-amber-500 font-bold mb-1">Certificate #{idx + 1}</div>
                              <div className="break-all">{cert}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {MOCK_JWE_RESPONSE.header.x5c.map((_, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-neutral-900 p-2.5 rounded border border-neutral-800 text-xs">
                              <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-amber-400" />
                                <span className="font-mono text-neutral-300">Citibank Root CA #{idx + 1}</span>
                              </div>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Validated
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modern Treasury Routing Number Encryption Simulator */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-amber-100">Modern Treasury Encryption Flow</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Citibank Account ID
                    </label>
                    <input 
                      type="text" 
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm font-mono text-amber-100 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Routing Number (Plaintext)
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm font-mono text-amber-100 focus:outline-none transition-all"
                      />
                      <span className="absolute right-3 top-3 text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                        USD Routing
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-neutral-400">Resulting JWE Ciphertext</span>
                    <span className="text-[10px] font-mono text-amber-500">A256CBC-HS512 Payload</span>
                  </div>
                  <div className="font-mono text-xs text-neutral-300 break-all bg-neutral-900 p-3 rounded border border-neutral-800 max-h-24 overflow-y-auto">
                    {MOCK_JWE_RESPONSE.ciphertext}
                  </div>
                </div>

                <button 
                  onClick={triggerAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Executing Sovereign AI Cryptographic Audit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Encrypt & Audit with Sovereign AI
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: AI Cryptographic Analyzer & Sovereign Privacy Shield (5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* AI Cryptographic Analyzer Panel */}
            <div className="bg-neutral-900/50 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(212,163,89,0.05)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-amber-100">AI Cryptographic Analyzer</h2>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Sovereign-Grade
                </span>
              </div>

              {/* Entropy Meter */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-neutral-400">System Entropy Level</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">{entropyValue.toFixed(7)}%</span>
                </div>
                <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${(entropyValue - 99) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-neutral-500">
                  <span>Quantum Minimum (99.9%)</span>
                  <span>Absolute Sovereign State</span>
                </div>
              </div>

              {/* AI Threat Assessment */}
              <div className="space-y-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Zero-Knowledge Proof</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Citibank AI confirms zero-knowledge proof validation. No plaintext routing numbers are stored or logged in Modern Treasury databases.
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 mt-0.5">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Biometric Key Wrapping</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      JWE headers are dynamically signed with multi-signature biometric keys from Citibank Private Wealth client nodes.
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 mt-0.5">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Decryption Authorization</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Decryption is restricted to Citibank's Federal Reserve Settlement Gateway. Modern Treasury acts as a blind ledger.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Real-time AI Cryptographic Terminal Logs */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 font-mono">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-300">Sovereign AI Terminal Logs</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 h-64 overflow-y-auto space-y-2 text-[11px] text-neutral-400">
                {aiLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 select-none">&gt;</span>
                    <p className="leading-relaxed">{log}</p>
                  </div>
                ))}
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                    <span>&gt;</span>
                    <span>Analyzing cryptographic entropy...</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center text-[10px] text-neutral-500">
                <span>Node: Citibank-NY-Vault-01</span>
                <span>Latency: 0.000004ms</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer / Luxury Disclaimer */}
        <footer className="mt-16 pt-8 border-t border-neutral-900 text-center text-xs text-neutral-500 space-y-2">
          <p>
            This console is reserved exclusively for Citibank Private Wealth clients and authorized Modern Treasury sovereign nodes.
          </p>
          <p className="text-amber-500/40 font-mono">
            Secured by Citibank Imperial AI • Quantum-Resistant Cryptographic Ledger • Absolute Sovereign Privacy Guaranteed
          </p>
        </footer>

      </div>
    </div>
  );
}