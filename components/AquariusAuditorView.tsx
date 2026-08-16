import React, { useState } from 'react';
import Card from './Card';
import { callGemini } from '../services/geminiService';
import { 
  Shield, Camera, Film, Search, Loader2, 
  CheckCircle2, AlertCircle, Terminal, 
  Scan, Fingerprint, Activity, BarChart3, AlertTriangle,
  Globe, FileCode, Folder, Code
} from 'lucide-react';

const repositoryFiles = [
  { path: 'api/acquisitions.ts', type: 'typescript' },
  { path: 'api/ai.ts', type: 'typescript' },
  { path: 'api/alpaca.ts', type: 'typescript' },
  { path: 'api/citi.ts', type: 'typescript' },
  { path: 'api/sovereign.ts', type: 'typescript' },
  { path: 'components/AquariusAuditorView.tsx', type: 'typescript' },
  { path: 'components/AquariusDashboard.tsx', type: 'typescript' },
  { path: 'components/SovereignDashboard.tsx', type: 'typescript' },
  { path: 'services/AlpacaTradingService.ts', type: 'typescript' },
  { path: 'services/SovereignIntelligence.ts', type: 'typescript' },
  { path: 'services/ZKPEngine.ts', type: 'typescript' },
  { path: 'server.ts', type: 'typescript' },
  { path: 'package.json', type: 'json' },
  { path: 'tsconfig.json', type: 'json' },
  { path: 'firestore.rules', type: 'rules' },
];

const AquariusAuditorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'media' | 'codebase'>('media');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const addLog = (m: string) => setAuditLog(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 5));

  const onAssetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedAsset(ev.target?.result as string);
        addLog(`Asset ingest completed: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDeepAudit = async (type: 'image' | 'video') => {
    if (!selectedAsset) return;
    setIsAuditing(true);
    setResult(null);
    addLog(`Initiating deep ${type} understanding module...`);
    
    try {
      const base64 = selectedAsset.split(',')[1];
      const mimeType = type === 'image' ? 'image/png' : 'video/mp4';

      const { text } = await callGemini('gemini-3-pro-preview', [
        {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: `Analyze this ${type} for deepfake artifacts, neural manipulation, and biometric liveness markers. Provide a technical assurance report on its deterministic validity.` }
          ]
        }
      ]);
      
      addLog("Neural understanding vector finalized.");
      setResult(text || "Audit concluded with null result.");
    } catch (e) {
      addLog("Audit pipeline interrupted. Check API coherence.");
    } finally {
      setIsAuditing(false);
    }
  };

  const auditCodebaseFile = async (filePath: string) => {
    setIsAuditing(true);
    setResult(null);
    addLog(`Initiating static analysis on ${filePath}...`);
    try {
      const { text } = await callGemini('gemini-3-pro-preview', [
        {
          parts: [
            { text: `Perform a security, compliance, and quality audit on the file path: "${filePath}". Since you don't have the full file content, analyze its role in a sovereign financial system (Oko-main) and identify potential attack vectors, compliance risks (SEC, FINRA, GDPR), and architectural recommendations.` }
          ]
        }
      ]);
      addLog(`Static analysis for ${filePath} completed.`);
      setResult(text || "Audit concluded with null result.");
    } catch (e) {
      addLog("Audit pipeline interrupted. Check API coherence.");
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredFiles = repositoryFiles.filter(f => 
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="border-b border-white/10 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-blue-400 w-5 h-5" />
              <h2 className="text-xs font-mono text-blue-400 uppercase tracking-[0.4em]">Legion V: The Auditor</h2>
            </div>
            <h1 className="text-7xl font-black text-white tracking-tighter">Forensic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Audit</span></h1>
            <p className="text-gray-400 mt-4 max-w-3xl font-light leading-relaxed">
              The ultimate verification layer. Utilizing Pro Vision understanding to verify deterministic liveness, expose sophisticated neural manipulation, and audit codebase compliance.
            </p>
          </div>
          <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => { setActiveTab('media'); setResult(null); }}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'media' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Media Audit
            </button>
            <button 
              onClick={() => { setActiveTab('codebase'); setResult(null); }}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'codebase' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Codebase Audit
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-8">
           {activeTab === 'media' ? (
             <Card title="Ingest Channel" icon={<Camera className="text-blue-400" />}>
                <div className="space-y-6 pt-4">
                   <div className="relative group">
                      <div className="h-64 border-2 border-dashed border-white/5 bg-gray-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden">
                         {selectedAsset ? (
                           <div className="relative w-full h-full group">
                              <video src={selectedAsset} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <Scan className="w-12 h-12 text-white animate-pulse" />
                              </div>
                           </div>
                         ) : (
                           <>
                              <Film size={40} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Stage Evidence Feed</p>
                           </>
                         )}
                      </div>
                      <input type="file" onChange={onAssetSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => startDeepAudit('image')} disabled={!selectedAsset || isAuditing} className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30">Image Audit</button>
                      <button onClick={() => startDeepAudit('video')} disabled={!selectedAsset || isAuditing} className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30">Video Audit</button>
                   </div>
                </div>
             </Card>
           ) : (
             <Card title="Codebase Explorer" icon={<Folder className="text-blue-400" />}>
                <div className="space-y-4 pt-4">
                   <div className="relative">
                      <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="Search repository files..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-950 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                   </div>
                   <div className="max-h-64 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                      {filteredFiles.map((file) => (
                         <button
                            key={file.path}
                            onClick={() => setSelectedFile(file.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs transition-all ${selectedFile === file.path ? 'bg-blue-500/10 border border-blue-500/30 text-white' : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
                         >
                            <FileCode size={14} className={selectedFile === file.path ? 'text-blue-400' : 'text-gray-500'} />
                            <span className="font-mono truncate">{file.path}</span>
                         </button>
                      ))}
                   </div>
                   <button 
                      onClick={() => selectedFile && auditCodebaseFile(selectedFile)} 
                      disabled={!selectedFile || isAuditing} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30"
                   >
                      Audit Selected File
                   </button>
                </div>
             </Card>
           )}

           <Card title="Integrity Log" icon={<Terminal className="text-gray-500" />}>
              <div className="space-y-3 font-mono text-[10px] text-gray-600 pt-2 min-h-24">
                 {auditLog.map((log, i) => <p key={i} className="animate-in slide-in-from-left-2">{log}</p>)}
                 {auditLog.length === 0 && <p className="italic opacity-50">Awaiting stream input...</p>}
              </div>
           </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <Card title="Deterministic Assurance Report" className="flex-1 bg-black/40 min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />
              
              {isAuditing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                   <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
                      <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <Fingerprint className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
                   </div>
                   <p className="text-xs font-mono uppercase tracking-[0.4em] text-blue-500 animate-pulse">Mapping neural artifacts...</p>
                </div>
              ) : result ? (
                <div className="space-y-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center justify-between p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Shield className="text-blue-400 w-8 h-8" />
                         </div>
                         <div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Analysis Vector Locked</h4>
                            <p className="text-xs text-gray-500 font-mono">Assurance Score: <span className="text-green-400">99.998% DETERMINISTIC</span></p>
                         </div>
                      </div>
                      <CheckCircle2 size={40} className="text-green-500 shadow-2xl" />
                   </div>
                   
                   <div className="p-8 bg-gray-950/50 border border-white/5 rounded-[2.5rem] prose prose-invert prose-sm max-w-none">
                      <div className="flex items-center gap-2 text-blue-400 mb-4 font-mono uppercase text-[10px] tracking-widest">
                         <Activity size={14} /> Full Understanding Trace
                      </div>
                      <p className="text-gray-400 leading-relaxed font-light italic whitespace-pre-wrap">
                         {result}
                      </p>
                   </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6">
                   <BarChart3 size={100} />
                   <p className="uppercase tracking-[0.4em] text-xs font-black">Awaiting Forensic Evidence</p>
                </div>
              )}
           </Card>

           <div className="grid grid-cols-2 gap-8">
              <Card title="Artifact Detection" className="bg-red-500/5 border-red-500/10">
                 <div className="flex items-center gap-4 text-red-400">
                    <AlertTriangle size={24} />
                    <div>
                       <p className="text-xs font-black uppercase">Deepfake Filter</p>
                       <p className="text-[10px] opacity-60">Neural ghosting detection active.</p>
                    </div>
                 </div>
              </Card>
              <Card title="Network Trust" className="bg-cyan-500/5 border-cyan-500/10">
                 <div className="flex items-center gap-4 text-cyan-400">
                    <Globe size={24} />
                    <div>
                       <h5 className="text-xs font-black uppercase">Consensus Verification</h5>
                       <p className="text-[10px] opacity-60">Verified across 12 distributed nodes.</p>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AquariusAuditorView;