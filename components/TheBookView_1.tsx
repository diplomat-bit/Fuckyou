import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Book, FileText, Search, Mic, Play, Pause, 
  Sparkles, Plus, Terminal, Cpu, ChevronRight, 
  Wifi, ShieldCheck, Database
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// 1. CONFIGURATION & TYPES
// ============================================================================

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ""; 
const SYSTEM_NAME = "ARCHITECT_527";

interface FileNode {
  name: string;
  content: string;
  type: 'file';
  tags: string[];
}

// ============================================================================
// 2. MOCK FILE SYSTEM (Simulating your /book directory)
// ============================================================================
// Since we are in a browser, we simulate reading these files. 
// In a real Node/Next.js app, this would use fs.readFile.

const generateMockFiles = (): FileNode[] => {
  const files: FileNode[] = [];
  
  // Theme content generator for the 527 Protocol
  const getTheme = (i: number) => {
    if (i <= 5) return { title: "Genesis", content: "# Genesis Protocol\n\nThe initial state of the ledger must be absolute. We define the zero-point energy of the system." };
    if (i <= 10) return { title: "Sovereignty", content: "# Sovereign Identity\n\nIdentity is not granted by the state; it is asserted by the cryptographic key pair." };
    if (i <= 20) return { title: "FinOS", content: "# Financial Operating System\n\nLiquidity is the blood; code is the vein. We optimize flow through atomic swaps." };
    if (i <= 30) return { title: "AI_Gov", content: "# Neural Governance\n\nThe AI does not rule; it audits. It is the unblinking eye of the 527 protocol." };
    return { title: "Transition", content: "# The Transition Event\n\nMigration from legacy systems is inevitable. The bridge is being built." };
  };

  // Generate page1.md through page41.md based on your directory
  for (let i = 1; i <= 41; i++) {
    const theme = getTheme(i);
    files.push({
      name: `page${i}.md`,
      type: 'file',
      tags: [theme.title, "Protocol", "Immutable"],
      content: `${theme.content}\n\n## Sector ${i}\n\nAnalysis of node distribution indicates a ${Math.floor(Math.random() * 20) + 80}% efficiency rating. \n\n* System Hash: 0x${Math.random().toString(16).substr(2, 8).toUpperCase()}\n* Timestamp: ${new Date().toISOString()}\n\n### Axiom ${i}\n\nThe architecture defines the reality. We do not observe; we construct.`
    });
  }
  return files;
};

const INITIAL_FILES = generateMockFiles();

// ============================================================================
// 3. MARKDOWN RENDERER (Custom High-Fidelity)
// ============================================================================

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // A simple, robust parser to avoid external dependencies for this demo
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 font-mono text-sm md:text-base leading-relaxed text-gray-300">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) return <h1 key={idx} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6 border-b border-gray-700 pb-4">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-cyan-300 mt-8 mb-4 flex items-center gap-2"><Cpu size={20}/> {line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-semibold text-purple-400 mt-6 mb-2">{line.replace('### ', '')}</h3>;
        if (line.startsWith('* ')) return <li key={idx} className="list-none ml-4 flex items-center gap-2 text-emerald-400"><ShieldCheck size={14}/> {line.replace('* ', '')}</li>;
        if (line.trim() === '') return <div key={idx} className="h-2" />;
        return <p key={idx} className="hover:text-white transition-colors duration-300">{line}</p>;
      })}
    </div>
  );
};

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================

const TheBookView: React.FC = () => {
  // --- STATE ---
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(files[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // --- SPEECH SYNTHESIS STATE ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  // --- FILTERING ---
  const filteredFiles = useMemo(() => {
    return files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  // --- AI: TEXT TO SPEECH ---
  const toggleSpeech = () => {
    if (!selectedFile) return;

    if (isSpeaking && !speechPaused) {
      synth.current.pause();
      setSpeechPaused(true);
      return;
    }

    if (isSpeaking && speechPaused) {
      synth.current.resume();
      setSpeechPaused(false);
      return;
    }

    // Start New Speech
    synth.current.cancel(); // Clear queue
    const text = selectedFile.content.replace(/[#*]/g, ''); // Clean markdown syntax
    utterance.current = new SpeechSynthesisUtterance(text);
    
    // Select a "Tech" voice if available
    const voices = synth.current.getVoices();
    const techVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
    if (techVoice) utterance.current.voice = techVoice;
    
    utterance.current.rate = 1.1; // Slightly faster for "Data Stream" feel
    utterance.current.pitch = 0.9; // Lower pitch for authority

    utterance.current.onend = () => {
      setIsSpeaking(false);
      setSpeechPaused(false);
    };

    synth.current.speak(utterance.current);
    setIsSpeaking(true);
    setSpeechPaused(false);
  };

  // Stop speech if switching files
  useEffect(() => {
    synth.current.cancel();
    setIsSpeaking(false);
    setSpeechPaused(false);
  }, [selectedFile]);

  // --- AI: GENERATION (Google Gemini) ---
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);

    try {
      let content = "";
      
      if (GEMINI_API_KEY) {
        // Real Generation
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`
          Context: You are writing a page for 'The 527 Protocol', a futuristic financial sovereign manifesto.
          Style: Technical, philosophical, authoritative, cyberpunk.
          Task: Write a markdown page about: ${aiPrompt}
        `);
        content = result.response.text();
      } else {
        // Simulated Generation (Fallback)
        await new Promise(r => setTimeout(r, 2000));
        content = `# Generated Protocol: ${aiPrompt}\n\n## AI Analysis\n\nThe neural lattice has constructed a new paradigm based on your request. We observe that ${aiPrompt} is critical to the consensus mechanism.\n\n### Execution\n* Initializing smart contracts...\n* Verifying sovereign identity...\n* content generated successfully.`;
      }

      const newFileName = `page${files.length + 1}.md`;
      const newFile: FileNode = {
        name: newFileName,
        type: 'file',
        tags: ["AI_Generated", "New_Protocol"],
        content: content
      };

      setFiles(prev => [...prev, newFile]);
      setSelectedFile(newFile);
      setAiPrompt('');
    } catch (e) {
      console.error("AI Generation Failed", e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ==========================================================================
  // VIEW
  // ==========================================================================
  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- LEFT SIDEBAR: THE DATA MESH --- */}
      <div className="w-80 border-r border-gray-800 bg-gray-900/50 backdrop-blur-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Database size={20} />
            <h1 className="font-bold tracking-widest text-sm">ARCHIVE_527</h1>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">/root/book/verified_ledger</div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Protocol..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-gray-300 placeholder-gray-600"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 p-2 space-y-1">
          {filteredFiles.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 group border border-transparent ${
                selectedFile?.name === file.name 
                ? "bg-cyan-950/30 border-cyan-500/50 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                : "hover:bg-gray-800 hover:border-gray-700 text-gray-400"
              }`}
            >
              <FileText size={16} className={selectedFile?.name === file.name ? "text-cyan-400" : "text-gray-600 group-hover:text-gray-400"} />
              <div className="flex-1 truncate font-mono text-sm">
                {file.name}
              </div>
              {selectedFile?.name === file.name && <ChevronRight size={14} className="text-cyan-500 animate-pulse" />}
            </button>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="p-3 border-t border-gray-800 bg-gray-950 text-[10px] text-gray-500 font-mono flex justify-between">
          <span>FILES: {files.length}</span>
          <span>SIZE: {(files.length * 1.2).toFixed(2)} MB</span>
        </div>
      </div>

      {/* --- MAIN CONTENT: THE READER --- */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-950 to-[#05050a]">
        
        {/* Toolbar */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/30 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-cyan-900/20 border border-cyan-500/30 rounded text-cyan-400 text-xs font-mono">
              READ_ONLY
            </div>
            <span className="text-gray-400 text-sm font-mono">{selectedFile?.name}</span>
          </div>

          <div className="flex items-center gap-2">
             {/* TTS Button */}
            <button 
              onClick={toggleSpeech}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                isSpeaking 
                  ? "bg-purple-600/20 border-purple-500 text-purple-300 animate-pulse" 
                  : "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
              }`}
            >
              {isSpeaking && !speechPaused ? <Pause size={14} /> : <Play size={14} />}
              {isSpeaking ? (speechPaused ? "Resume Audio" : "Broadcasting") : "Read Aloud"}
              {isSpeaking && !speechPaused && <Wifi size={14} className="animate-ping" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-cyan-900/50">
          <div className="max-w-4xl mx-auto bg-gray-900/20 border border-gray-800/50 p-8 rounded-2xl shadow-2xl backdrop-blur-sm min-h-[600px]">
             {selectedFile ? (
               <MarkdownRenderer content={selectedFile.content} />
             ) : (
               <div className="flex items-center justify-center h-full text-gray-600">
                 Select a protocol file to initiate decryption...
               </div>
             )}
          </div>
        </div>

        {/* --- AI GENERATOR: THE CREATOR --- */}
        <div className="border-t border-gray-800 bg-gray-900/80 p-4 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Terminal size={16} className="text-purple-500" />
              </div>
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Command the AI to write a new protocol page..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-950 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              />
              {isAiGenerating && (
                 <div className="absolute right-3 top-3.5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150"></span>
                 </div>
              )}
            </div>
            
            <button 
              onClick={handleAiGenerate}
              disabled={isAiGenerating || !aiPrompt}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-purple-900/30 flex items-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              <Sparkles size={18} />
              <span>Generate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TheBookView;