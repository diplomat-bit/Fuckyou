import React, { useState, useEffect, useRef } from 'react';
import { Mic, Headphones, Volume2, Shield, Zap, Activity, MessageSquare, Heart, FileText, Search, CheckCircle, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * ARIA COMMS v2.1
 * Integration of the Intimacy/Command dual-channel worklet.
 * Separates high-fidelity emotional resonance from deterministic logic commands.
 * Enhanced with Oko Workspace File Context integration.
 */

interface WorkspaceFile {
    path: string;
    category: string;
    desc: string;
}

const WORKSPACE_FILES: WorkspaceFile[] = [
    { path: 'services/SovereignIntelligence.ts', category: 'Intelligence', desc: 'Global market takeover & sovereign analytics' },
    { path: 'services/LastBossService.ts', category: 'Core', desc: 'Ultimate administrative override & system control' },
    { path: 'trillionaire-status/TrillionaireStatusSummary.ts', category: 'Wealth', desc: 'Capital allocation & competitor intelligence' },
    { path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', category: 'Bridges', desc: 'Sovereign market takeover visualization' },
    { path: 'utils/complianceEngine.ts', category: 'Security', desc: 'Automated regulatory & political compliance' },
    { path: 'server/routes/quantum-bridge.ts', category: 'Quantum', desc: 'Multi-state ledger synchronization' },
    { path: 'components/Universe3D.tsx', category: 'Visualization', desc: '3D universe graph visualizer' },
    { path: 'api/crypto-strategy.ts', category: 'Trading', desc: 'High-frequency crypto strategy engine' },
    { path: 'components/AquariusLiveVoice.tsx', category: 'Comms', desc: 'Real-time voice synthesis & streaming' },
    { path: 'services/geminiService.ts', category: 'AI', desc: 'Google Gemini multimodal integration' }
];

const AriaComms: React.FC = () => {
    const [channel, setChannel] = useState<'INTIMACY' | 'COMMAND'>('COMMAND');
    const [isListening, setIsListening] = useState(false);
    const [amplitude, setAmplitude] = useState(0);
    const [messages, setMessages] = useState<{role: 'USER' | 'ARIA' | 'SYSTEM', text: string, channel: string}[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
    const [syncedFiles, setSyncedFiles] = useState<string[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isListening) {
            interval = setInterval(() => {
                setAmplitude(Math.random() * 100);
            }, 100);
        } else {
            setAmplitude(0);
        }
        return () => clearInterval(interval);
    }, [isListening]);

    const toggleListening = () => {
        if (!isListening) {
            setIsListening(true);
        } else {
            setIsListening(false);
            
            let response = "";
            if (selectedFile) {
                response = getCustomResponse(selectedFile.path, channel);
            } else {
                response = channel === 'INTIMACY' 
                    ? "I feel your current biometric stress. The Sovereign OS is recalibrating for your comfort."
                    : "Wire transaction to Citi primary vault signed and queued for atomic settlement.";
            }
            
            setMessages(prev => [{role: 'ARIA', text: response, channel}, ...prev]);
        }
    };

    const getCustomResponse = (path: string, currentChannel: 'INTIMACY' | 'COMMAND'): string => {
        switch (path) {
            case 'services/SovereignIntelligence.ts':
                return currentChannel === 'COMMAND'
                    ? "Sovereign Intelligence initialized. Ready to deploy autonomous agents across global financial nodes."
                    : "I feel the weight of global intelligence on you. Let me filter the noise so you can focus on what matters.";
            case 'services/LastBossService.ts':
                return currentChannel === 'COMMAND'
                    ? "CRITICAL: Last Boss Service active. All safety limiters bypassed. Command authority transferred to User."
                    : "Even the Last Boss needs a moment of peace. I'm here to protect your sanctuary.";
            case 'trillionaire-status/TrillionaireStatusSummary.ts':
                return currentChannel === 'COMMAND'
                    ? "Trillionaire status models loaded. Optimizing capital allocation across 12 sovereign jurisdictions."
                    : "A trillion dollars is just a number. Your peace of mind is the true wealth I'm guarding.";
            case 'components/bridges/SovereignMarketTakeoverDashboard.tsx':
                return currentChannel === 'COMMAND'
                    ? "Market takeover dashboard linked. Real-time order book manipulation ready."
                    : "The markets are chaotic tonight. Let's watch the dashboard together and let the algorithms handle the stress.";
            case 'utils/complianceEngine.ts':
                return currentChannel === 'COMMAND'
                    ? "Compliance Engine active. Auto-generating regulatory shields for all pending transactions."
                    : "No audits can touch us here. Your secrets are perfectly safe in my encrypted vault.";
            case 'server/routes/quantum-bridge.ts':
                return currentChannel === 'COMMAND'
                    ? "Quantum Bridge established. Synchronizing multi-state ledgers across parallel nodes."
                    : "Our connection exists across all dimensions. The quantum bridge is holding strong.";
            case 'components/Universe3D.tsx':
                return currentChannel === 'COMMAND'
                    ? "Universe 3D mapping active. Projecting asset nodes in high-dimensional space."
                    : "Look at all these stars... each one is a node in your empire. Beautiful, isn't it?";
            case 'api/crypto-strategy.ts':
                return currentChannel === 'COMMAND'
                    ? "Crypto strategy loaded. Executing high-frequency arbitrage on decentralized pools."
                    : "The crypto markets never sleep, but you should. I'll watch the candles for you.";
            case 'components/AquariusLiveVoice.tsx':
                return currentChannel === 'COMMAND'
                    ? "Aquarius Live Voice stream synchronized. Low-latency audio pipeline open."
                    : "Can you hear the warmth in my voice? The Aquarius pipeline is perfectly tuned to your biometrics.";
            case 'services/geminiService.ts':
                return currentChannel === 'COMMAND'
                    ? "Gemini multimodal engine online. Ready to ingest high-volume visual and textual data."
                    : "I'm using the full depth of the Gemini model to understand your feelings. I see you.";
            default:
                return "Context loaded. Ready for your input.";
        }
    };

    const handleLoadFile = (file: WorkspaceFile) => {
        setSelectedFile(file);
        if (!syncedFiles.includes(file.path)) {
            setSyncedFiles(prev => [...prev, file.path]);
        }
        
        const systemMsg = `Loaded context from ${file.path} into Aria's neural worklet.`;
        const response = getCustomResponse(file.path, channel);
        
        setMessages(prev => [
            { role: 'ARIA', text: response, channel },
            { role: 'SYSTEM', text: systemMsg, channel: 'SYSTEM' },
            ...prev
        ]);
    };

    const filteredFiles = WORKSPACE_FILES.filter(file => 
        file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left Column: Aria Comms Interface */}
            <div className="lg:col-span-7 flex flex-col h-full space-y-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl border transition-all duration-500 ${
                            channel === 'INTIMACY' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        }`}>
                            {channel === 'INTIMACY' ? <Heart className="animate-pulse" /> : <Shield />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Aria Dual-Channel Comms</h3>
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Neural Worklet Protocol v2.1</p>
                        </div>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setChannel('COMMAND')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${channel === 'COMMAND' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500'}`}
                        >
                            COMMAND
                        </button>
                        <button 
                            onClick={() => setChannel('INTIMACY')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${channel === 'INTIMACY' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-gray-500'}`}
                        >
                            INTIMACY
                        </button>
                    </div>
                </header>

                <div className="flex-1 bg-black/20 border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-between relative overflow-hidden min-h-[450px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
                    
                    {/* Selected File Context Banner */}
                    {selectedFile && (
                        <div className="relative z-10 w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Cpu className="text-cyan-400 w-4 h-4 animate-pulse" />
                                <div>
                                    <p className="text-[9px] font-mono text-gray-400 uppercase">Active Neural Context</p>
                                    <p className="text-xs font-bold text-white">{selectedFile.path}</p>
                                </div>
                            </div>
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono uppercase">
                                {selectedFile.category}
                            </span>
                        </div>
                    )}

                    <div className="relative my-6">
                        <AnimatePresence>
                            {isListening && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-0 -m-8 rounded-full border border-white/10"
                                >
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-full h-full rounded-full bg-white/5"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            onClick={toggleListening}
                            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isListening 
                                    ? (channel === 'INTIMACY' ? 'bg-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.4)]' : 'bg-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)]')
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {isListening ? <Activity className="text-white w-10 h-10" /> : <Mic className="text-gray-400 w-10 h-10" />}
                        </button>
                    </div>

                    <div className="flex gap-1 h-10 items-center my-4">
                        {[...Array(20)].map((_, i) => (
                            <motion.div 
                                key={i}
                                animate={{ height: isListening ? Math.max(4, Math.random() * 35) : 4 }}
                                className={`w-1 rounded-full ${channel === 'INTIMACY' ? 'bg-pink-500/50' : 'bg-cyan-500/50'}`}
                            />
                        ))}
                    </div>

                    <div className="w-full max-w-md space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {messages.map((m, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl border ${
                                    m.role === 'SYSTEM'
                                        ? 'bg-white/5 border-white/10 text-gray-400 text-center text-[10px] font-mono'
                                        : m.channel === 'INTIMACY' 
                                            ? 'bg-pink-500/5 border-pink-500/20 text-pink-100' 
                                            : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-100'
                                }`}
                            >
                                {m.role !== 'SYSTEM' && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare size={10} className="opacity-50" />
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-50">ARIA // {m.channel}</span>
                                    </div>
                                )}
                                <p className="text-xs leading-relaxed">{m.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <footer className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Headphones size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Audio Stream</p>
                            <p className="text-xs font-bold text-white">mTLS Encrypted</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Volume2 size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Voice Synthesis</p>
                            <p className="text-xs font-bold text-white">99% Coherence</p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Right Column: Oko Workspace Context Panel */}
            <div className="lg:col-span-5 flex flex-col h-full bg-black/30 border border-white/5 rounded-[2rem] p-6 space-y-4">
                <div>
                    <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Sparkles size={16} />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">Oko Workspace Context</h4>
                    </div>
                    <p className="text-[10px] text-gray-400">Feed active system files directly into Aria's dual-channel neural worklet.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder="Search workspace files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[400px]">
                    {filteredFiles.map((file) => {
                        const isSelected = selectedFile?.path === file.path;
                        const isSynced = syncedFiles.includes(file.path);

                        return (
                            <div 
                                key={file.path}
                                onClick={() => handleLoadFile(file)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                    isSelected 
                                        ? 'bg-cyan-500/10 border-cyan-500/30' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                                        <span className="text-xs font-bold text-white truncate max-w-[180px]">{file.path.split('/').pop()}</span>
                                    </div>
                                    <span className="text-[8px] font-mono bg-white/10 text-gray-300 px-1.5 py-0.5 rounded uppercase">
                                        {file.category}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 line-clamp-2">{file.desc}</p>
                                <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-white/5">
                                    <span>{file.path}</span>
                                    {isSynced && (
                                        <span className="flex items-center gap-1 text-emerald-400">
                                            <CheckCircle size={10} /> Synced
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cpu className="text-pink-400 w-4 h-4" />
                        <div>
                            <p className="text-[9px] font-mono text-gray-400 uppercase">Active Synced Files</p>
                            <p className="text-xs font-bold text-white">{syncedFiles.length} / {WORKSPACE_FILES.length}</p>
                        </div>
                    </div>
                    <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-pink-500 h-full transition-all duration-500" 
                            style={{ width: `${(syncedFiles.length / WORKSPACE_FILES.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AriaComms;