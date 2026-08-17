import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Cpu, 
  Key, 
  Lock, 
  Unlock, 
  Sparkles, 
  Coins, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Terminal,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';

// Premium JWE Mock Payload
const MOCK_ENCRYPTED_PAYLOAD = "eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiY2l0aS1haS1xdWFudHVtLXY5OS1rZXkifQ.Y3VzdG9tZXItc3VwZXItc2VjdXJlLXF1YW50dW0ta2V5LWV4Y2hhbmdlLXByb3RvY29sLWNpdGliYW5rLW1vZGVybi10cmVhc3VyeS1lbGl0ZS10aWVy.i8B9X_Z3K9_8.W3siYWNjb3VudE51bWJlciI6ICI5OTk5LTg4ODgtNzc3Ny02NjY2IiwgInJvdXRpbmdOdW1iZXIiOiAiMDIxMDAwMDIxIiwgImluc3RpdHV0aW9uIiwgIkNpdGliYW5rIFByaXZhdGUgT2JzaWRpYW4gRWxpdGUifV0.s2F9_X88_Z3K9_8W3siYWNjb3VudE51bWJlciI";

interface DecryptionMetrics {
  entropy: number;
  coherence: number;
  computeCost: string;
  aiConfidence: number;
  processingTimeMs: number;
}

export default function QuantumRoutingDecryptor() {
  // State Management
  const [accountId, setAccountId] = useState<string>("ACT-999-OBSIDIAN-777F");
  const [encryptedPayload, setEncryptedPayload] = useState<string>(MOCK_ENCRYPTED_PAYLOAD);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptionProgress, setDecryptionProgress] = useState<number>(0);
  const [decryptedData, setDecryptedData] = useState<{ routingNumber: string; accountNumber: string; tier: string } | null>(null);
  const [selectedKeyType, setSelectedKeyType] = useState<'Lattice' | 'McEliece' | 'Shor-Shield' | 'Citibank-AI-V9'>('Citibank-AI-V9');
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<DecryptionMetrics>({
    entropy: 0.9999999998,
    coherence: 100,
    computeCost: "$250,000.00",
    aiConfidence: 99.9999,
    processingTimeMs: 0
  });

  // Add log helper
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  }, []);

  // Initialize with default logs
  useEffect(() => {
    addLog("Citibank Quantum-Safe AI Decryption Engine initialized.");
    addLog("Modern Treasury Ledger Sync: ACTIVE (Sovereign Wealth Tier).");
  }, [addLog]);

  // Simulate Quantum Decryption Process
  const handleDecrypt = async () => {
    if (isDecrypting) return;
    
    setIsDecrypting(true);
    setDecryptionProgress(0);
    setDecryptedData(null);
    addLog(`Initiating decryption for account: ${accountId}`);
    addLog(`Selected Quantum Key Cryptosystem: ${selectedKeyType}`);
    addLog("Contacting Citibank AI Sovereign Nodes...");

    const steps = [
      { progress: 15, log: "Establishing secure TLS 1.4 Quantum Tunnel..." },
      { progress: 30, log: "Retrieving JWE payload from Modern Treasury secure vault..." },
      { progress: 45, log: "Applying Lattice-Based Cryptographic Matrix transformations..." },
      { progress: 60, log: "AI Neural Network analyzing entropy patterns (Confidence: 99.9999%)..." },
      { progress: 75, log: "Bypassing standard HSMs - routing through Citibank Obsidian Supercomputer..." },
      { progress: 90, log: "Reassembling JWE payload segments & verifying Modern Treasury ledger state..." },
      { progress: 100, log: "Decryption complete. Payload verified against global consensus ledger." }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 500));
      setDecryptionProgress(step.progress);
      addLog(step.log);
    }

    setDecryptedData({
      routingNumber: "021000021", // Citibank N.A. New York Routing Number
      accountNumber: "9999-8888-7777-6666",
      tier: "Citibank Private Obsidian Elite (Modern Treasury Integrated)"
    });
    
    setMetrics(prev => ({
      ...prev,
      processingTimeMs: Math.floor(3200 + Math.random() * 400),
      entropy: 0.0000000001,
      coherence: 99.99999999
    }));

    setIsDecrypting(false);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans p-6 md:p-12 flex flex-col justify-between relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      
      {/* Background Luxury Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[#00F0FF]/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#D4AF37]/20 pb-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              Sovereign Wealth Tier
            </span>
            <span className="text-xs text-[#00F0FF] font-mono tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              AI-QUANTUM ACTIVE
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">
            CITIBANK PRIVATE ELITE
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1 tracking-wide font-mono">
            Modern Treasury Co-Engineered Quantum Decryption Portal
          </p>
        </div>

        {/* Luxury Cost Badge */}
        <div className="bg-gradient-to-br from-[#111] to-[#080808] border border-[#D4AF37]/30 p-4 rounded-xl flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
            <Coins className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Cost Per Decryption</div>
            <div className="text-xl font-bold text-[#D4AF37] font-mono">$250,000.00 USD</div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
        
        {/* Left Column: API Endpoint & Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Endpoint Badge */}
          <div className="bg-[#0B0B0F] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-mono font-bold">
                  POST
                </span>
                <code className="text-xs md:text-sm text-gray-300 font-mono">
                  /accounts/{"{"}accountId{"}"}/encrypt/accountRoutingNumber
                </code>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">v9.4-Quantum</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Simulate the decryption of the JWE payload (<code className="text-[#D4AF37]">EncryptedAccountRoutingNumber</code>) using quantum-safe AI keys. Instantly reveal the ABA routing number and the decrypted account number with high-end security animations.
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-[#0B0B0F] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/5 to-transparent rounded-tr-2xl pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#D4AF37]" />
              Quantum Decryption Parameters
            </h2>

            <div className="space-y-4">
              {/* Account ID Input */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">
                  Target Account ID (Modern Treasury Ledger)
                </label>
                <input 
                  type="text" 
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-[#D4AF37] focus:outline-none focus:border-[#D4AF37] transition-all"
                  placeholder="ACT-999-OBSIDIAN-777F"
                />
              </div>

              {/* Quantum Key Selection */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">
                  Select AI Quantum Cryptosystem
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Citibank-AI-V9', name: 'Citi AI-V9 Lattice', desc: 'Sovereign AI Optimized' },
                    { id: 'Lattice', name: 'Kyber-1024', desc: 'NIST Standard Post-Quantum' },
                    { id: 'McEliece', name: 'Classic McEliece', desc: 'Ultra-High Security' },
                    { id: 'Shor-Shield', name: 'Shor-Shield v4', desc: 'Active Anti-Shor Mitigation' }
                  ].map((keyOpt) => (
                    <button
                      key={keyOpt.id}
                      onClick={() => {
                        setSelectedKeyType(keyOpt.id as any);
                        addLog(`Switched cryptosystem to: ${keyOpt.name}`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedKeyType === keyOpt.id 
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                          : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{keyOpt.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{keyOpt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Encrypted JWE Payload */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">
                  Encrypted JWE Payload (EncryptedAccountRoutingNumber)
                </label>
                <div className="relative">
                  <textarea 
                    readOnly
                    value={encryptedPayload}
                    className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-gray-400 resize-none focus:outline-none"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 border border-white/10 rounded text-[9px] text-gray-500 font-mono">
                    JWE Compact Format
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDecrypt}
                disabled={isDecrypting}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-bold rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDecrypting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="uppercase tracking-widest text-xs font-mono">Decrypting via Quantum AI...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    <span className="uppercase tracking-widest text-xs font-mono">Initiate Quantum Decryption</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Decryption Output & Live Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Decryption Output Screen */}
          <div className="bg-[#0B0B0F] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col justify-between">
            
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  Decrypted Output
                </h3>
                <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded font-mono">
                  SECURE ENCLAVE
                </span>
              </div>

              {/* Decryption Progress Bar */}
              {isDecrypting && (
                <div className="space-y-2 animate-pulse mb-6">
                  <div className="flex justify-between text-xs font-mono text-gray-400">
                    <span>Quantum Key Alignment...</span>
                    <span>{decryptionProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#D4AF37] to-[#00F0FF] h-full transition-all duration-300"
                      style={{ width: `${decryptionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Decrypted Data Display */}
              {!isDecrypting && decryptedData ? (
                <div className="space-y-6 relative z-10 animate-fadeIn">
                  
                  {/* ABA Routing Number */}
                  <div className="p-4 bg-black/40 border border-[#D4AF37]/30 rounded-xl">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">ABA Routing Number</div>
                    <div className="text-2xl font-bold text-white font-mono tracking-wider flex items-center gap-2">
                      {decryptedData.routingNumber}
                      <span className="text-xs text-emerald-400 font-normal bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Verified
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">Citibank N.A. New York</div>
                  </div>

                  {/* Decrypted Account Number */}
                  <div className="p-4 bg-black/40 border border-[#00F0FF]/30 rounded-xl">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1">Decrypted Account Number</div>
                    <div className="text-2xl font-bold text-[#00F0FF] font-mono tracking-wider">
                      {decryptedData.accountNumber}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">Modern Treasury Ledger Synced</div>
                  </div>

                  {/* Tier Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>{decryptedData.tier}</span>
                  </div>

                </div>
              ) : !isDecrypting ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400 max-w-xs">
                    No decrypted payload active. Click <span className="text-[#D4AF37]">"Initiate Quantum Decryption"</span> to run the AI decryption sequence.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Metrics Footer */}
            <div className="border-t border-white/5 pt-4 mt-6 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[9px] text-gray-500 uppercase font-mono">AI Confidence</div>
                <div className="text-xs font-bold text-white font-mono">{metrics.aiConfidence}%</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase font-mono">Quantum Entropy</div>
                <div className="text-xs font-bold text-white font-mono">{metrics.entropy.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase font-mono">Compute Cost</div>
                <div className="text-xs font-bold text-[#D4AF37] font-mono">{metrics.computeCost}</div>
              </div>
            </div>

          </div>

          {/* Live Terminal Logs */}
          <div className="bg-black border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-300 font-mono uppercase tracking-wider">Quantum AI Console Logs</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="h-32 overflow-y-auto space-y-1.5 font-mono text-[10px] text-gray-400 scrollbar-thin scrollbar-thumb-white/10">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-[#D4AF37]">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Footer Section */}
      <footer className="max-w-7xl mx-auto w-full border-t border-white/5 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <span>Citibank Sovereign AI Network &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#docs" className="hover:text-[#D4AF37] transition-colors">API Documentation</a>
          <a href="#security" className="hover:text-[#D4AF37] transition-colors">Quantum Security Policy</a>
          <a href="#treasury" className="hover:text-[#D4AF37] transition-colors">Modern Treasury Ledger</a>
        </div>
      </footer>

    </div>
  );
}