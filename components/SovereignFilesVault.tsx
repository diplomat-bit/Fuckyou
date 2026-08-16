import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderTree,
  FileText,
  Search,
  BookOpen,
  FileCode,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Shield,
  Layers,
  Terminal,
  Database,
  Globe,
  Sliders,
  Filter,
  Sparkles,
  RefreshCw,
  Eye,
  Code,
  Columns,
  Square,
  Bookmark,
  BookmarkCheck,
  Compass,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileItem {
  path: string;
  name: string;
  size: number;
  mtime: string;
  ext: string;
  category: string;
  isDirectory: boolean;
  content?: string;
  lineCount?: number;
  wordCount?: number;
}

interface SearchResult {
  path: string;
  name: string;
  category: string;
  matches: Array<{ line: number; text: string }>;
}

export default function SovereignFilesVault() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [categoriesCount, setCategoriesCount] = useState<Record<string, number>>({});
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(true);
  
  // Selection & Active File
  const [selectedPath, setSelectedPath] = useState<string>('00_Master_Compiled_Executive_Order/Chapter_01_The_Citibank_Lobby.md');
  const [fileData, setFileData] = useState<FileItem | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [inDocSearch, setInDocSearch] = useState<string>('');

  // View mode
  const [viewMode, setViewMode] = useState<'rendered' | 'raw' | 'split'>('rendered');
  const [splitSecondaryPath, setSplitSecondaryPath] = useState<string>('story/page-001.md');
  const [splitSecondaryData, setSplitSecondaryData] = useState<FileItem | null>(null);
  
  // Bookmarks
  const [bookmarkedPaths, setBookmarkedPaths] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aquarius_file_bookmarks');
      return saved ? JSON.parse(saved) : [
        '00_Master_Compiled_Executive_Order/Chapter_01_The_Citibank_Lobby.md',
        '00_Master_Compiled_Executive_Order/Dossier_01_UCC_Financial_Loophole.md',
        'story/page-001.md',
        'Combined_sLegislative_Bill/narrative/scene_01_banking_loophole.md'
      ];
    } catch {
      return [];
    }
  });

  // Copy & Audio state
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Expanded folders in tree
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    '00_Master_Compiled_Executive_Order': true,
    'story': true,
    'Combined_sLegislative_Bill': true,
    'Combined_sLegislative_Bill/narrative': true,
    'Combined_sLegislative_Bill/dossiers': true
  });

  // Load File Tree
  const fetchFileTree = async () => {
    setIsLoadingTree(true);
    try {
      const res = await fetch('/api/files/tree');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setCategoriesCount(data.categoriesCount || {});
        setTotalFiles(data.totalFiles || 0);
      } else {
        // Fallback default structure if offline
        generateFallbackFiles();
      }
    } catch (e) {
      console.warn('Fallback file generator active:', e);
      generateFallbackFiles();
    } finally {
      setIsLoadingTree(false);
    }
  };

  const generateFallbackFiles = () => {
    const list: FileItem[] = [];
    // Executive Orders
    for (let i = 1; i <= 7; i++) {
      const num = i.toString().padStart(2, '0');
      list.push({
        path: `00_Master_Compiled_Executive_Order/Chapter_${num}_Section.md`,
        name: `Chapter_${num}_Section.md`,
        size: 4096,
        mtime: new Date().toISOString(),
        ext: '.md',
        category: 'Executive Orders',
        isDirectory: false
      });
    }
    for (let i = 1; i <= 14; i++) {
      const num = i.toString().padStart(2, '0');
      list.push({
        path: `00_Master_Compiled_Executive_Order/Dossier_${num}_Classified.md`,
        name: `Dossier_${num}_Classified.md`,
        size: 3800,
        mtime: new Date().toISOString(),
        ext: '.md',
        category: 'Executive Orders',
        isDirectory: false
      });
    }
    // 100 Story pages
    for (let i = 1; i <= 100; i++) {
      const num = i.toString().padStart(3, '0');
      list.push({
        path: `story/page-${num}.md`,
        name: `page-${num}.md`,
        size: 2100,
        mtime: new Date().toISOString(),
        ext: '.md',
        category: '100-Page Story Manuscript',
        isDirectory: false
      });
    }
    setFiles(list);
    setTotalFiles(list.length);
  };

  useEffect(() => {
    fetchFileTree();
  }, []);

  // Fetch individual file content
  const loadFileContent = async (filePath: string, isSecondary = false) => {
    if (!filePath) return;
    if (!isSecondary) setIsLoadingFile(true);

    try {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.json();
        if (isSecondary) {
          setSplitSecondaryData(data);
        } else {
          setFileData(data);
        }
      } else {
        // Fallback for direct story / doc preview
        const fallbackText = `# ${filePath.split('/').pop()}\n\n*Unable to retrieve raw server stream. Displaying secure offline replica.*\n\nThis document is part of the sovereign repository index at \`${filePath}\`.`;
        const fallbackObj: FileItem = {
          path: filePath,
          name: filePath.split('/').pop() || filePath,
          size: 1024,
          mtime: new Date().toISOString(),
          ext: '.md',
          category: 'Document',
          isDirectory: false,
          content: fallbackText,
          lineCount: fallbackText.split('\n').length,
          wordCount: fallbackText.split(/\s+/).length
        };
        if (isSecondary) setSplitSecondaryData(fallbackObj);
        else setFileData(fallbackObj);
      }
    } catch (e) {
      console.error('Error reading file:', e);
    } finally {
      if (!isSecondary) setIsLoadingFile(false);
    }
  };

  useEffect(() => {
    loadFileContent(selectedPath, false);
    // Stop speech when changing files
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [selectedPath]);

  useEffect(() => {
    if (viewMode === 'split' && splitSecondaryPath) {
      loadFileContent(splitSecondaryPath, true);
    }
  }, [viewMode, splitSecondaryPath]);

  // Search Files
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/files/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, category: activeCategory !== 'All' ? activeCategory : undefined })
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        } else {
          // Client-side fallback filter
          const q = searchQuery.toLowerCase();
          const localMatches: SearchResult[] = files
            .filter(f => !f.isDirectory && (f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)))
            .slice(0, 30)
            .map(f => ({
              path: f.path,
              name: f.name,
              category: f.category,
              matches: [{ line: 1, text: `Matching path: ${f.path}` }]
            }));
          setSearchResults(localMatches);
        }
      } catch {
        const q = searchQuery.toLowerCase();
        const localMatches: SearchResult[] = files
          .filter(f => !f.isDirectory && f.name.toLowerCase().includes(q))
          .map(f => ({
            path: f.path,
            name: f.name,
            category: f.category,
            matches: [{ line: 1, text: f.name }]
          }));
        setSearchResults(localMatches);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, files]);

  // Categories list
  const categories = useMemo(() => {
    const defaultCats = [
      'All',
      'Executive Orders',
      '100-Page Story Manuscript',
      'Legislative Bill',
      'Audit Tables & Schemas',
      'Datasets & Records',
      'Google Infrastructure',
      'UI Components',
      'Services & Backend',
      'System & Configs',
      'Core Workspace'
    ];
    return defaultCats;
  }, []);

  // Filtered files list
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      if (f.isDirectory) return false;
      if (activeCategory === 'All') return true;
      return f.category === activeCategory;
    });
  }, [files, activeCategory]);

  // Toggle directory expansion
  const toggleDir = (dirPath: string) => {
    setExpandedDirs(prev => ({ ...prev, [dirPath]: !prev[dirPath] }));
  };

  // Toggle bookmark
  const toggleBookmark = (path: string) => {
    setBookmarkedPaths(prev => {
      const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      try {
        localStorage.setItem('aquarius_file_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Copy raw content
  const handleCopy = () => {
    if (!fileData?.content) return;
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download file
  const handleDownload = () => {
    if (!fileData?.content) return;
    const blob = new Blob([fileData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.name || 'document.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Text-To-Speech Narrator
  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!fileData?.content) return;

    // Clean markdown syntax for speech
    const cleanText = fileData.content
      .replace(/#+\s+/g, '')
      .replace(/\*+/g, '')
      .replace(/`+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/---/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Navigation for 100 pages or chapters
  const handlePageStep = (direction: 'prev' | 'next') => {
    if (selectedPath.startsWith('story/page-')) {
      const match = selectedPath.match(/page-(\d+)\.md/);
      if (match) {
        const currentNum = parseInt(match[1], 10);
        const nextNum = direction === 'next' ? Math.min(100, currentNum + 1) : Math.max(1, currentNum - 1);
        const padded = nextNum.toString().padStart(3, '0');
        setSelectedPath(`story/page-${padded}.md`);
      }
    } else if (selectedPath.includes('00_Master_Compiled_Executive_Order/Chapter_')) {
      const match = selectedPath.match(/Chapter_(\d+)/);
      if (match) {
        const currentNum = parseInt(match[1], 10);
        const nextNum = direction === 'next' ? Math.min(7, currentNum + 1) : Math.max(1, currentNum - 1);
        const target = files.find(f => f.path.includes(`Chapter_${nextNum.toString().padStart(2, '0')}`));
        if (target) setSelectedPath(target.path);
      }
    }
  };

  const isStoryPage = selectedPath.startsWith('story/page-');
  const isExecutiveOrder = selectedPath.startsWith('00_Master_Compiled_Executive_Order');
  const isLegislativeBill = selectedPath.startsWith('Combined_sLegislative_Bill');

  return (
    <div id="sovereign-files-vault" className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden font-sans border-t border-cyan-500/20">
      
      {/* 🔹 TOP TELEMETRY & COMMAND STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FolderTree size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wide text-white uppercase">Sovereign File System & Dossier Archive</h1>
              <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE REPO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Accessing Executive Orders, 100-Page Story Manuscript, Legislative Bill, Dossiers & Workspace Logic
            </p>
          </div>
        </div>

        {/* Global Stats & Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs font-mono text-slate-300">
            <span>Files: <strong className="text-cyan-400">{totalFiles || files.length}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Sections: <strong className="text-emerald-400">{Object.keys(categoriesCount).length || 10}</strong></span>
          </div>

          <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/60">
            <button
              id="btn-mode-rendered"
              onClick={() => setViewMode('rendered')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'rendered' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rendered Document View"
            >
              <Eye size={14} /> Document
            </button>
            <button
              id="btn-mode-raw"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'raw' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Raw Code / Editor View"
            >
              <Code size={14} /> Source
            </button>
            <button
              id="btn-mode-split"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'split' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split Comparison View"
            >
              <Columns size={14} /> Split
            </button>
          </div>

          <button
            id="btn-refresh-tree"
            onClick={fetchFileTree}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Reload File Hierarchy"
          >
            <RefreshCw size={15} className={isLoadingTree ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 🔹 MAIN SPLIT CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 📁 LEFT SIDEBAR: CATEGORIES & FILE TREE (340px) */}
        <div className="w-80 md:w-96 flex flex-col bg-slate-900/60 border-r border-slate-800/80 backdrop-blur-sm shrink-0">
          
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                id="files-global-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search all files & content..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs Strip */}
          <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === 'All'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setActiveCategory('Executive Orders')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === 'Executive Orders'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              📜 Executive Orders
            </button>
            <button
              onClick={() => setActiveCategory('100-Page Story Manuscript')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === '100-Page Story Manuscript'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              📖 100-Page Story
            </button>
            <button
              onClick={() => setActiveCategory('Legislative Bill')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === 'Legislative Bill'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              ⚖️ Legislative Bill
            </button>
            <button
              onClick={() => setActiveCategory('Audit Tables & Schemas')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                activeCategory === 'Audit Tables & Schemas'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              🗄️ Tables & Data
            </button>
          </div>

          {/* Bookmarks bar */}
          {bookmarkedPaths.length > 0 && (
            <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/60">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Bookmark size={11} className="text-amber-400" /> Pinned Documents ({bookmarkedPaths.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {bookmarkedPaths.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPath(p)}
                    className={`text-[11px] px-2 py-0.5 rounded border truncate max-w-[150px] transition-colors ${
                      selectedPath === p
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title={p}
                  >
                    {p.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 📂 File List View / Search Results */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isSearching ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-cyan-400" />
                Scanning entire filesystem and dossiers...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                <div className="px-2 py-1 text-[11px] font-mono text-cyan-400 font-bold uppercase">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPath(res.path)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      selectedPath === res.path
                        ? 'bg-cyan-950/50 border-cyan-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">{res.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{res.category}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{res.path}</div>
                    {res.matches.map((m, mi) => (
                      <div key={mi} className="text-[10px] font-mono text-cyan-300/80 mt-1 pl-2 border-l border-cyan-500/30 truncate">
                        L{m.line}: {m.text}
                      </div>
                    ))}
                  </button>
                ))}
              </div>
            ) : (
              // Standard Filtered File List
              <div className="space-y-1">
                {/* Special 100-Page Story Shortcut Grid if active */}
                {activeCategory === '100-Page Story Manuscript' && (
                  <div className="mb-3 p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase mb-2 flex items-center justify-between">
                      <span>100-Page Direct Jump Grid</span>
                      <span className="text-[10px] text-emerald-500/80 font-mono">100 / 100</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {Array.from({ length: 100 }, (_, i) => {
                        const num = (i + 1).toString().padStart(3, '0');
                        const p = `story/page-${num}.md`;
                        const isCurrent = selectedPath === p;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedPath(p)}
                            className={`text-[10px] font-mono py-1 rounded transition-all ${
                              isCurrent
                                ? 'bg-emerald-500 text-slate-950 font-bold scale-110 shadow-md'
                                : 'bg-slate-900/80 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                            }`}
                            title={`Page ${i + 1}`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* File Items */}
                {filteredFiles.map(file => {
                  const isCurrent = selectedPath === file.path;
                  const isMd = file.ext === '.md';
                  const isTs = file.ext === '.ts' || file.ext === '.tsx';
                  const isJson = file.ext === '.json';

                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedPath(file.path)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between border transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isMd ? (
                          <BookOpen size={15} className={isCurrent ? 'text-cyan-400' : 'text-amber-400'} />
                        ) : isTs ? (
                          <FileCode size={15} className="text-blue-400" />
                        ) : isJson ? (
                          <FileSpreadsheet size={15} className="text-emerald-400" />
                        ) : (
                          <FileText size={15} className="text-slate-400" />
                        )}
                        <span className="text-xs truncate font-medium">{file.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {file.size > 1024 ? `${(file.size / 1024).toFixed(1)}k` : `${file.size}b`}
                      </span>
                    </button>
                  );
                })}

                {filteredFiles.length === 0 && !isLoadingTree && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No files found under category "{activeCategory}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 📄 RIGHT WORKSPACE: DOCUMENT VIEWER (MAIN) */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* File Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => toggleBookmark(selectedPath)}
                className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                title={bookmarkedPaths.includes(selectedPath) ? 'Remove Bookmark' : 'Bookmark this File'}
              >
                {bookmarkedPaths.includes(selectedPath) ? (
                  <BookmarkCheck size={18} className="text-amber-400" />
                ) : (
                  <Bookmark size={18} />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate">{fileData?.name || selectedPath.split('/').pop()}</h2>
                  {fileData?.category && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {fileData.category}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate">{selectedPath}</p>
              </div>
            </div>

            {/* Document Controls */}
            <div className="flex items-center gap-2">
              {/* Pagination Controls for Story & Chapters */}
              {(isStoryPage || isExecutiveOrder) && (
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => handlePageStep('prev')}
                    className="px-2 py-1 text-xs text-slate-300 hover:text-white rounded hover:bg-slate-700"
                    title="Previous Page / Chapter"
                  >
                    ← Prev
                  </button>
                  <span className="px-2 text-[11px] font-mono text-cyan-400 font-bold">
                    {isStoryPage ? selectedPath.replace('story/page-', 'P. ').replace('.md', '') : 'Ch.'}
                  </span>
                  <button
                    onClick={() => handlePageStep('next')}
                    className="px-2 py-1 text-xs text-slate-300 hover:text-white rounded hover:bg-slate-700"
                    title="Next Page / Chapter"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Text-To-Speech Narrator Button */}
              <button
                id="btn-voice-narrate"
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  isSpeaking
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={isSpeaking ? 'Stop Reading' : 'Listen with Neural Voice'}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {isSpeaking ? 'Stop Audio' : 'Narrate'}
              </button>

              {/* Copy Raw */}
              <button
                id="btn-copy-raw"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                title="Copy full file text"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              {/* Download */}
              <button
                id="btn-download-file"
                onClick={handleDownload}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition-colors"
                title="Download this file"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          {/* Document Content View Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            {isLoadingFile ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <RefreshCw size={24} className="animate-spin text-cyan-400 mb-3" />
                <p className="text-xs font-mono">Loading sovereign content stream...</p>
              </div>
            ) : viewMode === 'split' ? (
              // 🔹 DUAL SPLIT SCREEN VIEW
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Left Side: Main Selected File */}
                <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-y-auto">
                  <div className="text-xs font-mono font-bold text-cyan-400 uppercase mb-3 border-b border-slate-800 pb-2">
                    Primary: {fileData?.name}
                  </div>
                  <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {fileData?.content || ''}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Right Side: Secondary File */}
                <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      Secondary: {splitSecondaryData?.name || splitSecondaryPath}
                    </span>
                    <select
                      value={splitSecondaryPath}
                      onChange={e => setSplitSecondaryPath(e.target.value)}
                      className="bg-slate-950 text-xs text-slate-300 border border-slate-700 rounded px-2 py-0.5 focus:outline-none"
                    >
                      {files.filter(f => !f.isDirectory).map(f => (
                        <option key={f.path} value={f.path}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="prose prose-invert prose-emerald max-w-none text-slate-300 text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {splitSecondaryData?.content || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : viewMode === 'raw' ? (
              // 🔹 RAW CODE / TEXT EDITOR VIEW
              <div className="max-w-5xl mx-auto">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span>{fileData?.lineCount || 0} lines · {fileData?.wordCount || 0} words</span>
                    <span>UTF-8 · {fileData?.ext || 'text'}</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="font-mono text-xs text-slate-200 leading-6 select-text">
                      {fileData?.content?.split('\n').map((line, idx) => (
                        <div key={idx} className="flex hover:bg-slate-800/40 px-2 rounded">
                          <span className="w-12 text-slate-600 select-none text-right pr-4 font-mono">{idx + 1}</span>
                          <span className="flex-1 whitespace-pre-wrap break-all">{line}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              // 🔹 STYLED RENDERED MARKDOWN DOCUMENT VIEW
              <div className="max-w-4xl mx-auto">
                
                {/* Special Header Callout for Dossiers / Executive Orders */}
                {isExecutiveOrder && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                    <Shield className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                        Master Compiled Executive Order & Dossier Briefing
                      </h3>
                      <p className="text-xs text-amber-200/80 mt-1">
                        Authoritative legal and intelligence documentation regarding public logic, UCC frameworks, and institutional audits.
                      </p>
                    </div>
                  </div>
                )}

                {/* Special Header Callout for 100-Page Story */}
                {isStoryPage && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                    <BookOpen className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                        100-Page Sovereign Story Manuscript (Official Public Logic)
                      </h3>
                      <p className="text-xs text-emerald-200/80 mt-1">
                        Authored manuscript detailing the working class betrayal, defense funding paradoxes, and the liberation of public logic.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rendered Markdown */}
                <div className="prose prose-invert prose-cyan max-w-none text-slate-200 leading-relaxed space-y-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight pb-3 border-b border-slate-800">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-cyan-300 mt-8 mb-4">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-emerald-400 mt-6 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-slate-300 leading-7 text-sm md:text-base font-normal">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm md:text-base pl-2">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="leading-7">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-cyan-500 bg-slate-900/60 p-4 rounded-r-xl my-4 text-slate-300 italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">
                          {children}
                        </code>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="bg-slate-800 p-3 border border-slate-700 text-cyan-400 font-bold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="p-3 border border-slate-800 text-slate-300">
                          {children}
                        </td>
                      ),
                      hr: () => (
                        <hr className="my-8 border-slate-800" />
                      )
                    }}
                  >
                    {fileData?.content || ''}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
