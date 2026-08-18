
import React, { useState, useContext, useMemo } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { 
    Cpu, BrainCircuit, Rocket, ShieldAlert, TrendingUp, 
    ArrowRight, Loader2, Sparkles, Network, FileText 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const QuantumWeaverView: React.FC = () => {
    const { askSovereignAI } = useContext(DataContext)!;
    const [plan, setPlan] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [metrics, setMetrics] = useState({ viability: 0, scale: 0, risk: 0 });

    const handleExecuteProtocol = async () => {
        if (!plan.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);

        const prompt = `Perform a high-level strategic audit for this venture proposal:
        ${plan}
        
        Analyze across three axes: Viability, Scalability, and Systemic Risk. 
        Provide a concise, executive-level summary and project a hypothetical 12-month growth trajectory.`;

        const result = await askSovereignAI(prompt, 'gemini-3-pro-preview');
        setAnalysisResult(result);
        
        // Simulate score generation from AI content
        setMetrics({
            viability: Math.floor(Math.random() * 30) + 70,
            scale: Math.floor(Math.random() * 40) + 60,
            risk: Math.floor(Math.random() * 20) + 10
        });
        
        setIsAnalyzing(false);
    };

    const mockChartData = useMemo(() => Array.from({length: 12}, (_, i) => ({
        month: `M${i+1}`,
        value: Math.floor(100 * Math.pow(1.2, i) + Math.random() * 200)
    })), []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Quantum Weaver</h1>
                    <p className="text-indigo-400 text-sm font-mono tracking-widest">STRATEGIC_ANALYTICS // VENTURE_GENESIS</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-indigo-900/20 border border-indigo-500/30 px-4 py-2 rounded-xl text-indigo-300 text-xs font-bold uppercase flex items-center gap-2">
                        <Cpu size={16} /> Engine: Gemini 3 Pro
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Area */}
                <div className="lg:col-span-5 space-y-6">
                    <Card title="Genesis Input">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Executive Business Plan / Concept</label>
                            <textarea 
                                value={plan}
                                onChange={e => setPlan(e.target.value)}
                                className="w-full h-80 bg-black/40 border border-gray-800 rounded-2xl p-6 text-indigo-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-sans leading-relaxed"
                                placeholder="Paste the strategic architecture here for quantum audit..."
                                disabled={isAnalyzing}
                            />
                            <button 
                                onClick={handleExecuteProtocol}
                                disabled={isAnalyzing || !plan.trim()}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                            >
                                {isAnalyzing ? <><Loader2 className="animate-spin" /> Harmonizing Probabilities...</> : <><Rocket size={20} /> Execute Analysis Protocol</>}
                            </button>
                        </div>
                    </Card>

                    {analysisResult && (
                        <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-left duration-500">
                            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
                                <p className="text-[10px] text-gray-500 uppercase mb-1">Viability</p>
                                <p className="text-2xl font-black text-green-400">{metrics.viability}%</p>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
                                <p className="text-[10px] text-gray-500 uppercase mb-1">Scale</p>
                                <p className="text-2xl font-black text-indigo-400">{metrics.scale}%</p>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
                                <p className="text-[10px] text-gray-500 uppercase mb-1">Risk</p>
                                <p className="text-2xl font-black text-red-400">{metrics.risk}%</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Output Area */}
                <div className="lg:col-span-7 space-y-6">
                    <Card title="Intelligence Output" className="h-full flex flex-col">
                        <div className="flex-1 min-h-[400px] bg-black/40 rounded-xl p-8 border border-indigo-900/30 relative overflow-hidden group">
                            {isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-80">
                                    <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center border border-indigo-500/30 animate-pulse">
                                        <BrainCircuit size={40} className="text-indigo-400" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <p className="text-indigo-300 font-mono text-sm tracking-widest animate-pulse">SYNCHRONIZING WITH SOVEREIGN AI CORE...</p>
                                        <p className="text-gray-600 text-xs font-mono uppercase">Processing multidimensional market vectors</p>
                                    </div>
                                </div>
                            ) : analysisResult ? (
                                <div className="animate-in fade-in duration-1000 prose prose-invert max-w-none">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="text-indigo-400 w-5 h-5" />
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Sovereign Intelligence Report</span>
                                    </div>
                                    <div className="font-sans text-indigo-100 leading-relaxed space-y-4 text-lg italic">
                                        {analysisResult}
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-indigo-900/50">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Projected Ecosystem Growth Velocity</h4>
                                        <div className="h-48 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={mockChartData}>
                                                    <defs>
                                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                                                    <Area type="monotone" dataKey="value" stroke="#818cf8" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-40">
                                    <Network size={64} strokeWidth={1} />
                                    <p className="font-mono text-sm tracking-widest uppercase">Awaiting Strategic Signal</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-grid-indigo-500/[0.02] pointer-events-none"></div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuantumWeaverView;
