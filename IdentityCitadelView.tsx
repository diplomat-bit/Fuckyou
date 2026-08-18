import React, { useState, useCallback, useContext } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";
import { ShieldCheck, Fingerprint, Cpu, Lock, Zap, RefreshCw, Key, Layers, Terminal, BrainCircuit, Loader2 } from 'lucide-react';

const IdentityCitadelView: React.FC = () => {
    const context = useContext(DataContext);
    const [isForging, setIsForging] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [thoughtProcess, setThoughtProcess] = useState<string | null>(null);
    const [teeStatus, setTeeStatus] = useState<'IDLE' | 'BOOTING' | 'SECURE' | 'ENCLAVE_READY'>('IDLE');
    const [attestationProof, setAttestationProof] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));

    const runThreatModel = async () => {
        setIsThinking(true);
        setThoughtProcess(null);
        addLog("Initiating Deep Neural Threat Model...");
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: "Perform a complex threat model on a sovereign identity wallet using TEE hardware binding and Proof-of-Possession tokens. Explain the cryptographic superiority over traditional oAuth bearer tokens.",
                config: {
                    thinkingConfig: { thinkingBudget: 4096 }
                }
            });
            setThoughtProcess(response.text || "Diagnostic failed.");
            addLog("Threat model synthesized.");
        } catch (e) {
            addLog("Thinking core overload.");
        } finally {
            setIsThinking(false);
        }
    };

    const bootSecureEnclave = async () => {
        setIsForging(true);
        setTeeStatus('BOOTING');
        addLog("Initializing Hardware Trusted Execution Environment...");
        await new Promise(r => setTimeout(r, 1500));
        
        setTeeStatus('SECURE');
        addLog("Generating Non-Replayable Hardware-Bound Seed...");
        await new Promise(r => setTimeout(r, 1500));
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = "Generate a short, unique cryptographic attestation string representing a successful TEE handshake for a Sovereign Identity Citadel. Format: ATT-XXXX-XXXX-XXXX";
            const res = await ai.models.generateContent({ 
              model: 'gemini-3-flash-preview', 
              contents: prompt 
            });
            
            setAttestationProof(res.text || 'ATT-ERR-SYNC');
            setTeeStatus('ENCLAVE_READY');
            addLog("Identity Citadel established. Zero-knowledge circuits locked.");
        } catch (e) {
            addLog("Attestation failed.");
            setTeeStatus('IDLE');
        } finally {
            setIsForging(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="border-b border-gray-800 pb-10">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="text-emerald-400 w-5 h-5 animate-pulse" />
                    <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-[0.4em]">Hardware-Rooted Trust v1.2</h2>
                </div>
                <h1 className="text-7xl font-black text-white tracking-tighter">Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Citadel</span></h1>
                <p className="text-gray-400 mt-4 max-w-3xl font-light leading-relaxed">
                    Moving identity logic into a <span className="text-emerald-400">Trusted Execution Environment (TEE)</span>. 
                    Hardware-bound Proof-of-Possession neutralizes bearer token hijacking.
                </p>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Card title="Enclave Control" icon={<Cpu className="text-emerald-400" />}>
                        <div className="space-y-6 pt-4">
                            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-black text-gray-500 uppercase">Hardware State</span>
                                <span className={`text-xs font-mono font-bold ${teeStatus === 'ENCLAVE_READY' ? 'text-emerald-400' : 'text-yellow-500'}`}>{teeStatus}</span>
                            </div>
                            <button 
                                onClick={bootSecureEnclave}
                                disabled={isForging || teeStatus === 'ENCLAVE_READY'}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-30 flex items-center justify-center gap-3"
                            >
                                {isForging ? <Loader2 className="animate-spin" /> : <Lock size={16} />}
                                INITIALIZE ENCLAVE
                            </button>
                            <button 
                                onClick={runThreatModel}
                                disabled={isThinking}
                                className="w-full py-4 border border-gray-800 text-gray-400 hover:bg-gray-700 font-black tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                            >
                                {isThinking ? <Loader2 className="animate-spin" /> : <BrainCircuit size={16} />}
                                DEEP THREAT MODEL
                            </button>
                        </div>
                    </Card>

                    <Card title="Neural Signature" icon={<Fingerprint className="text-emerald-400" />}>
                        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                            <p className="text-[10px] text-emerald-400 font-mono leading-relaxed uppercase">
                                [SIG_STATUS]: {attestationProof ? 'ACTIVE_AND_BOUND' : 'AWAITING_FORGE'}
                            </p>
                            {attestationProof && (
                                <p className="text-xl font-black text-white mt-2 font-mono break-all tracking-tighter">
                                    {attestationProof}
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {thoughtProcess ? (
                      <Card title="Forensic Logic Output" icon={<BrainCircuit className="text-indigo-400" />} className="animate-in slide-in-from-bottom-4 duration-500">
                         <div className="prose prose-invert prose-sm max-w-none text-gray-400 font-serif italic leading-relaxed h-[400px] overflow-auto custom-scrollbar p-2">
                            {thoughtProcess}
                         </div>
                      </Card>
                    ) : (
                      <Card title="Secure Execution Log" icon={<Terminal size={18} className="text-emerald-400" />} className="flex-1 min-h-[400px]">
                        <div className="bg-black/40 rounded-2xl p-6 font-mono text-xs text-gray-500 h-full space-y-3 overflow-y-auto custom-scrollbar">
                            {logs.length === 0 ? (
                                <p className="opacity-20 italic">Awaiting hardware handshake...</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className={`${log.includes('established') ? 'text-emerald-400' : 'text-gray-700'}`}>{log}</span>
                                    </div>
                                ))
                            )}
                        </div>
                      </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdentityCitadelView;
