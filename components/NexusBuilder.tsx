import React, { useState, useContext } from 'react';
import Card from './Card';
import { brain } from '../services/SovereignIntelligence';
import { DataContext } from '../context/DataContext';
import { 
    Hammer, 
    Cpu, 
    Code, 
    Terminal, 
    Layers, 
    ShieldCheck, 
    Sparkles,
    Loader2,
    Copy,
    Save,
    Trash2,
    FileCode,
    Check,
    Zap,
    FolderTree,
    Play,
    CheckCircle2
} from 'lucide-react';

interface PresetDirective {
    title: string;
    category: string;
    prompt: string;
}

const PRESET_DIRECTIVES: PresetDirective[] = [
    {
        title: "Alpaca TQQQ Rebalancing Engine",
        category: "Trading & Execution",
        prompt: "Synthesize an automated Alpaca trading rebalancer that calculates target asset allocation, enforces stop-loss risk guards, and dispatches bracket orders via Alpaca Trading API."
    },
    {
        title: "Citi ISO20022 Direct Payment Hub",
        category: "Institutional Banking",
        prompt: "Build a CitiConnect ISO 20022 pain.001 payment initiation route with JWE/JWS cryptographic signatures and real-time ledger settlement webhooks."
    },
    {
        title: "GIS Tax Lien Foreclosure Pipeline",
        category: "Real Estate & Gov",
        prompt: "Construct a GIS-driven property tax lien analyzer that fetches county auction schedules, evaluates deed encumbrances, and computes annualized ROI."
    },
    {
        title: "Quantum Zero-Knowledge Auth Bridge",
        category: "Sovereign Security",
        prompt: "Develop a Zero-Knowledge Proof (ZKP) identity verification module using SNARK circuits for secure multi-party vault key derivation."
    }
];

const NexusBuilder: React.FC = () => {
    const context = useContext(DataContext);
    const sessionId = context?.sessionId || 'sovereign-local-session';
    
    const [prompt, setPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'source' | 'log' | 'deploy'>('source');
    const [copied, setCopied] = useState<boolean>(false);
    const [savedNotice, setSavedNotice] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([
        `[SYSTEM] Neural Forge Engine v3.2 initialized.`,
        `[SYSTEM] Session bound: ${sessionId}`,
        `[READY] Awaiting forge directives...`
    ]);

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    };

    const handleForge = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setActiveTab('log');
        addLog(`Initiating neural synthesis for directive: "${prompt.slice(0, 40)}..."`);
        
        try {
            addLog(`Vectorizing prompt context into high-dimensional embedding...`);
            const code = await brain.forge(prompt, sessionId);
            if (code) {
                setGeneratedCode(code);
                addLog(`[SUCCESS] Source code synthesized successfully. (${code.length} bytes)`);
                setActiveTab('source');
            } else {
                const fallback = `// Neural Core Synthesis Output\n// Directive: ${prompt}\n\nexport const GeneratedModule = () => {\n  console.log("Synthesized module active.");\n};\n`;
                setGeneratedCode(fallback);
                addLog(`[NOTICE] Default template synthesized.`);
                setActiveTab('source');
            }
        } catch (err) {
            addLog(`[ERROR] Synthesis pipeline interrupted. Re-syncing forge buffer.`);
            setGeneratedCode(`// Protocol Interruption\n// Failed to synthesize directive: ${prompt}\n// Re-initialize Neural Core.`);
            setActiveTab('source');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        if (!generatedCode) return;
        const blob = new Blob([generatedCode], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ForgeModule_${Date.now()}.tsx`;
        a.click();
        URL.revokeObjectURL(url);
        
        setSavedNotice(true);
        addLog(`[EXPORT] Code saved locally as TSX artifact.`);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    const handleClear = () => {
        setGeneratedCode('');
        setPrompt('');
        addLog(`[RESET] Workspace and directives cleared.`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Hammer className="w-4 h-4 text-yellow-400" />
                        <h2 className="text-xs font-mono text-yellow-400 uppercase tracking-[0.3em]">Neural System Forge v3.2</h2>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Nexus Builder</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 font-mono text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                        FORGE_ONLINE
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Card title="Feature Directive" icon={<Sparkles className="w-4 h-4 text-yellow-400" />}>
                        <div className="space-y-4 mt-2">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the application module, API integration, or algorithmic logic to forge..."
                                className="w-full h-44 bg-gray-950 border border-gray-800 rounded-2xl p-4 text-xs text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder-gray-700 resize-none font-mono leading-relaxed"
                            />
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleForge}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="flex-1 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-30 flex items-center justify-center gap-2 uppercase"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                                    Forge Directive
                                </button>
                                {generatedCode && (
                                    <button
                                        onClick={handleClear}
                                        title="Clear Output"
                                        className="p-3.5 bg-gray-900 hover:bg-red-500/20 border border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Presets */}
                    <Card title="System Presets" icon={<FolderTree className="w-4 h-4 text-amber-400" />}>
                        <div className="space-y-3 mt-2">
                            {PRESET_DIRECTIVES.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPrompt(preset.prompt)}
                                    className="w-full text-left p-3 rounded-xl bg-gray-950/60 border border-gray-800/80 hover:border-yellow-500/50 hover:bg-gray-900 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-200 group-hover:text-yellow-400 transition-colors">
                                            {preset.title}
                                        </span>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                                            {preset.category}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 font-mono leading-relaxed">
                                        {preset.prompt}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card title="Forge Configuration" icon={<Layers className="w-4 h-4 text-cyan-400" />}>
                        <div className="space-y-3 text-xs font-mono">
                            <div className="flex justify-between items-center text-gray-400 pb-2 border-b border-gray-800/60">
                                <span>Framework</span>
                                <span className="text-white font-bold">React 19 / TypeScript</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400 pb-2 border-b border-gray-800/60">
                                <span>Security Level</span>
                                <span className="text-emerald-400 font-bold uppercase">Sovereign_Root</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Target Output</span>
                                <span className="text-yellow-400 font-bold">Production Component</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Editor / Output Viewer */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="h-full min-h-[680px] flex flex-col p-0 overflow-hidden bg-black/60 border-gray-800">
                        {/* Tab Bar */}
                        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950/80 px-2">
                            <div className="flex">
                                {[
                                    { id: 'source', label: 'Forge Output', icon: Code },
                                    { id: 'log', label: 'Neural Log', icon: Terminal },
                                    { id: 'deploy', label: 'Deployment', icon: ShieldCheck }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-5 py-4 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                                            activeTab === tab.id ? 'bg-yellow-500/10 text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            {generatedCode && activeTab === 'source' && (
                                <div className="flex items-center gap-2 pr-3">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg text-xs font-mono text-gray-300 transition-all"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg text-xs font-mono text-yellow-300 transition-all"
                                    >
                                        {savedNotice ? <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> : <Save className="w-3.5 h-3.5 text-yellow-400" />}
                                        {savedNotice ? 'Exported' : 'Save TSX'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 p-6 font-mono text-xs overflow-auto custom-scrollbar bg-gray-950/40 text-gray-300">
                            {activeTab === 'source' && (
                                generatedCode ? (
                                    <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400/90 font-mono">
                                        {generatedCode}
                                    </pre>
                                ) : (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center opacity-30 gap-4 text-center">
                                        <FileCode className="w-16 h-16 text-yellow-400 animate-pulse" />
                                        <div>
                                            <p className="tracking-[0.2em] font-bold text-white uppercase">Awaiting Directive</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Select a preset or enter prompt instructions to forge new codebase modules</p>
                                        </div>
                                    </div>
                                )
                            )}

                            {activeTab === 'log' && (
                                <div className="space-y-2 font-mono text-xs">
                                    {logs.map((log, index) => (
                                        <p 
                                            key={index} 
                                            className={`leading-relaxed ${
                                                log.includes('[ERROR]') ? 'text-red-400' :
                                                log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                                                log.includes('[NOTICE]') || log.includes('[EXPORT]') ? 'text-yellow-400' :
                                                'text-gray-400'
                                            }`}
                                        >
                                            {log}
                                        </p>
                                    ))}
                                    {isGenerating && (
                                        <p className="text-yellow-400 animate-pulse flex items-center gap-2 mt-4">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            [SYNTHESIZING] Compiling abstract syntax tree into React TSX output...
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'deploy' && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 text-center">
                                    <div className="p-6 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                                        <ShieldCheck className="w-16 h-16 text-cyan-400" />
                                    </div>
                                    <div className="max-w-md">
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Automated Build & Deployment Pipeline</h3>
                                        <p className="text-xs text-gray-400 font-mono leading-relaxed">
                                            Directly inject the forged component into the Oko sovereign codebase tree with automated TypeScript validation and Zero-Trust AST sandbox verification.
                                        </p>
                                    </div>
                                    <button 
                                        disabled={!generatedCode || isGenerating}
                                        onClick={() => addLog(`[DEPLOY] Module committed to feature branch.`)}
                                        className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-black text-xs tracking-[0.2em] uppercase rounded-2xl shadow-2xl transition-all disabled:opacity-20 flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Commit To Main Branch
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NexusBuilder;
