import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Activity, 
  Volume2, 
  CreditCard, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Fingerprint, 
  Terminal, 
  Zap, 
  ArrowRight, 
  ShieldAlert, 
  FileCode, 
  Globe, 
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock ZKP Engine for client-side demonstration of zero-knowledge voice authorization
const mockZKPVocAuth = {
  generateVoiceProof: async (voiceHash: string, amount: number, balance: number, cardToken: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const secretWitness = {
      voiceSignature: voiceHash,
      userPrivateKey: "0x7a9f...3b2c",
      currentBalance: balance,
      paymentAmount: amount
    };
    
    // Proving: balance >= amount AND voiceSignature matches registered commitment
    const proof = {
      pi_a: ["0x1123f9...", "0x2234a1..."],
      pi_b: [["0x0987b...", "0x1234c..."], ["0x5678d...", "0x9012e..."]],
      pi_c: ["0x3345f...", "0x4456a..."],
      publicSignals: [
        `hash(voiceSignature) == 0x883f...991a`,
        `balance >= ${amount} (True)`,
        `cardTokenCommitment == ${cardToken.substring(0, 10)}...`
      ]
    };
    return { proof, verified: true };
  }
};

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'crypto' | 'visa';
}

export default function VisaSensoryVoiceAuth() {
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'listening' | 'processing' | 'generating_zkp' | 'verifying_biometrics' | 'visa_settling' | 'authorized' | 'failed'>('idle');
  
  // Extracted transaction details
  const [detectedCard, setDetectedCard] = useState('Visa Platinum (*4321)');
  const [detectedAmount, setDetectedAmount] = useState(0);
  const [detectedCrypto, setDetectedCrypto] = useState('USDC');
  const [fiatEquivalent, setFiatEquivalent] = useState(0);
  
  // Cryptographic states
  const [biometricScore, setBiometricScore] = useState(0);
  const [zkpProofData, setZkpProofData] = useState<any>(null);
  const [visaAuthCode, setVisaAuthCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Audio visualizer ref
  const animationRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Add log helper
  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'crypto' | 'visa' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ timestamp, message, type }, ...prev]);
  }, []);

  // Initialize with default logs
  useEffect(() => {
    addLog("Visa Sensory Voice Auth System Initialized.", "info");
    addLog("Gemini Live Audio Stream connected to Visa Token Service (VTS).", "crypto");
    addLog("ZKP Circuit loaded: VoiceBiometricPaymentVerifier.wasm", "crypto");
  }, [addLog]);

  // Simulate Audio Level for Visualizer
  const startAudioSimulation = () => {
    audioIntervalRef.current = setInterval(() => {
      setAudioLevel(Math.random() * 80 + 20);
    }, 100);
  };

  const stopAudioSimulation = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }
    setAudioLevel(0);
  };

  // Handle Voice Command Simulation
  const triggerVoiceCommand = async (phrase: string) => {
    if (authStatus !== 'idle') return;
    
    setIsRecording(true);
    setAuthStatus('listening');
    setTranscript('');
    addLog(`Gemini Live Audio Stream opened. Listening for voice signature...`, "info");
    startAudioSimulation();

    // Simulate real-time transcription
    const words = phrase.split(' ');
    let currentText = '';
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      currentText += (i === 0 ? '' : ' ') + words[i];
      setTranscript(currentText);
    }

    stopAudioSimulation();
    setIsRecording(false);
    setAuthStatus('processing');
    addLog(`Gemini Live processed intent: "${phrase}"`, "success");

    // Parse intent (mock parsing)
    let amount = 250.00;
    let crypto = 'USDC';
    let card = 'Visa Signature (*9821)';

    if (phrase.toLowerCase().includes('btc') || phrase.toLowerCase().includes('bitcoin')) {
      crypto = 'BTC';
      amount = 0.0042;
    } else if (phrase.toLowerCase().includes('eth') || phrase.toLowerCase().includes('ethereum')) {
      crypto = 'ETH';
      amount = 0.078;
    }

    setDetectedAmount(amount);
    setDetectedCrypto(crypto);
    setDetectedCard(card);
    
    const fiatVal = crypto === 'USDC' ? amount : crypto === 'BTC' ? amount * 64000 : amount * 3200;
    setFiatEquivalent(fiatVal);

    addLog(`Extracted parameters: Pay ${amount} ${crypto} ($${fiatVal.toFixed(2)} USD) via ${card}`, "info");

    // Step 2: Biometric Voiceprint Verification
    setAuthStatus('verifying_biometrics');
    addLog("Analyzing voice sensory biometrics against Gemini Live voiceprint model...", "info");
    
    let score = 0;
    for (let s = 0; s <= 98; s += 14) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      setBiometricScore(s);
    }
    setBiometricScore(98.4);
    addLog("Voiceprint match verified with 98.4% confidence score.", "success");

    // Step 3: Generate Zero-Knowledge Proof
    setAuthStatus('generating_zkp');
    addLog("Generating zk-SNARK proof of voice authorization & sufficient collateral...", "crypto");
    
    try {
      const voiceHash = "0x883f9a2c11b09e88d771a234f9012e88";
      const { proof, verified } = await mockZKPVocAuth.generateVoiceProof(voiceHash, amount, 10000, card);
      setZkpProofData(proof);
      addLog("ZKP Proof generated successfully. Public signals verified on-chain.", "crypto");
    } catch (err) {
      addLog("Failed to generate ZKP proof.", "warning");
      setAuthStatus('failed');
      return;
    }

    // Step 4: Visa Settlement & Tokenization
    setAuthStatus('visa_settling');
    addLog("Initiating Visa Token Service (VTS) secure handshake...", "visa");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    const mockAuthCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setVisaAuthCode(mockAuthCode);
    addLog(`Visa Network approved transaction. Auth Code: ${mockAuthCode}`, "visa");
    addLog(`Crypto collateral converted & settled on Visa rails.`, "success");

    setAuthStatus('authorized');
    addLog("Sensory Voice Payment Authorization Complete!", "success");
  };

  const resetAuth = () => {
    setAuthStatus('idle');
    setTranscript('');
    setBiometricScore(0);
    setZkpProofData(null);
    setVisaAuthCode(null);
    setDetectedAmount(0);
    addLog("System reset. Ready for next sensory voice authorization.", "info");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" /> Gemini Live Integration
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Visa VTS Certified
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            Visa Sensory Voice Auth <span className="text-blue-500 font-light">Portal</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Secure voice-activated cryptocurrency-to-fiat settlement using Gemini Live audio streams and Zero-Knowledge Proofs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetAuth}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Portal
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Sensory Interface & Visualizer */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Sensory Voice Capture Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start z-10">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-400" /> Sensory Audio Stream
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Speak to authorize payments. Gemini Live analyzes intent, while biometric sensors verify identity.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {authStatus === 'listening' ? 'Streaming Live' : 'Stream Closed'}
                </span>
              </div>
            </div>

            {/* Audio Visualizer Waveform */}
            <div className="my-8 h-32 flex items-center justify-center gap-1 relative">
              {authStatus === 'listening' ? (
                Array.from({ length: 24 }).map((_, i) => {
                  const height = Math.max(10, (audioLevel * Math.sin(i * 0.3)) + Math.random() * 20);
                  return (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full"
                      animate={{ height: `${height}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    />
                  );
                })
              ) : authStatus === 'processing' || authStatus === 'generating_zkp' ? (
                <div className="flex flex-col items-center gap-2">
                  <Activity className="w-10 h-10 text-blue-400 animate-pulse" />
                  <span className="text-xs text-slate-400 font-mono animate-pulse">Analyzing Sensory Data...</span>
                </div>
              ) : authStatus === 'authorized' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">Payment Authorized</span>
                </div>
              ) : (
                <div className="text-center text-slate-500 flex flex-col items-center gap-2">
                  <Mic className="w-12 h-12 text-slate-600" />
                  <p className="text-xs">Select a preset voice command below to simulate sensory authorization.</p>
                </div>
              )}
            </div>

            {/* Transcript Display */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 min-h-[70px] flex flex-col justify-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Live Transcript</span>
              <p className="text-sm font-medium text-slate-200 italic">
                {transcript || 'Waiting for voice input...'}
              </p>
            </div>

            {/* Preset Voice Commands for Simulation */}
            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Simulate Voice Commands:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => triggerVoiceCommand("Authorize payment of 250 USDC to my Visa Signature card ending in 9821")}
                  disabled={authStatus !== 'idle'}
                  className="p-2.5 text-left text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="truncate text-slate-300 group-hover:text-white">"Authorize 250 USDC to Visa *9821"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />
                </button>
                <button
                  onClick={() => triggerVoiceCommand("Approve 0.0042 BTC transfer to Visa card ending in 9821 with voice signature")}
                  disabled={authStatus !== 'idle'}
                  className="p-2.5 text-left text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="truncate text-slate-300 group-hover:text-white">"Approve 0.0042 BTC to Visa *9821"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />
                </button>
              </div>
            </div>

          </div>

          {/* Transaction Details & Visa Tokenization */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-400" /> Visa Tokenization & Settlement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Target Visa Card</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" /> {detectedCard}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Crypto Collateral</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" /> {detectedAmount > 0 ? `${detectedAmount} ${detectedCrypto}` : '---'}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">USD Settlement Value</span>
                <span className="text-sm font-semibold text-emerald-400 mt-1 block">
                  {fiatEquivalent > 0 ? `$${fiatEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '---'}
                </span>
              </div>
            </div>

            {/* Visa Token Service Handshake Status */}
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800/60 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Visa Token Service (VTS) Handshake</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secures transaction with a dynamic cryptogram generated from the ZKP proof.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {visaAuthCode ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                    <span className="text-xs font-mono text-emerald-400 font-bold">AUTH CODE: {visaAuthCode}</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-500">Awaiting Authorization</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Cryptographic Proofs & Logs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Biometric & ZKP Verification Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" /> Cryptographic Verification
            </h2>

            {/* Biometric Score */}
            <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-blue-400" /> Voice Biometric Signature
                </span>
                <span className="text-xs font-mono text-blue-400 font-bold">{biometricScore}% Match</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${biometricScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Gemini Live sensory stream matches voice frequency, cadence, and biometric signature against secure enclave templates.
              </p>
            </div>

            {/* ZKP Proof Explorer */}
            <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-4 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" /> Zero-Knowledge Proof (zk-SNARK)
              </span>
              
              <div className="bg-slate-900 rounded p-3 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-40 overflow-y-auto">
                {zkpProofData ? (
                  <pre className="text-purple-300">{JSON.stringify(zkpProofData, null, 2)}</pre>
                ) : (
                  <span className="text-slate-600 italic">Awaiting voice authorization to generate ZKP proof...</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Proves user owns the private key associated with the voice signature and has sufficient crypto collateral without revealing balances or keys.
              </p>
            </div>
          </div>

          {/* Live Audit Logs */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-blue-400" /> Sensory Audit Ledger
            </h2>
            
            <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-4 flex-1 overflow-y-auto max-h-64 font-mono text-xs flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {logs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 border-b border-slate-900 pb-1.5 last:border-0"
                  >
                    <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      log.type === 'crypto' ? 'bg-purple-500/10 text-purple-400' :
                      log.type === 'visa' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      {/* Footer / Security Notice */}
      <footer className="mt-6 border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600" />
          <span>End-to-end encrypted sensory streams. No raw voice data is stored on-chain.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 transition cursor-pointer">Visa Developer Terms</span>
          <span className="hover:text-slate-300 transition cursor-pointer">Gemini API Compliance</span>
        </div>
      </footer>
    </div>
  );
}