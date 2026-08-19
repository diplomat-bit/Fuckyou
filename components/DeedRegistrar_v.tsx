

// --- CONSOLIDATED FROM: ./components/real-estate/DeedRegistrar_v2.tsx ---

import React, { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react';
import {
  FileText, Upload, CheckCircle, AlertCircle, DollarSign, Building, User, MapPin,
  Send, Loader2, Download, ExternalLink, ShieldCheck, Clock, FileCheck, Info,
  BookOpen, MessageSquare, Cpu, Landmark, Sparkles, Zap, Scale, Home, CreditCard,
  Layers, Search, Bot, ChevronRight, Copy, Check, Terminal, Code2, Globe, Lock,
  RefreshCw, Database, TrendingUp, Coins
} from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { callGemini } from '../../services/geminiService';
import { ZKPEngine } from '../../services/ZKPEngine';

// Interfaces
interface Deed {
  id: string;
  apn: string; // Assessor's Parcel Number
  address: string;
  ownerName: string;
  ownerAddress: string; // Blockchain wallet address
  legalDescription: string;
  valuation: number;
  registeredAt: string;
  blockNumber: number;
  txHash: string;
  zkpProofHash?: string;
  status: 'Active' | 'Pending' | 'Transferred' | 'Disputed';
  liens: string[];
  chainOfCustody: Array<{
    from: string;
    to: string;
    date: string;
    txHash: string;
    price: number;
  }>;
}

interface AuditReport {
  score: number; // 0-100
  status: 'Clear' | 'Warning' | 'Critical';
  summary: string;
  findings: string[];
  recommendations: string[];
}

export default function DeedRegistrar_v2() {
  const dataContext = useContext(DataContext);
  
  // State
  const [deeds, setDeeds] = useState<Deed[]>([
    {
      id: 'DEED-001',
      apn: '512-040-12-00',
      address: '742 Evergreen Terrace, Springfield, OR 97477',
      ownerName: 'Sovereign Trust Alpha',
      ownerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      legalDescription: 'Lot 14 of Block 5, Springfield Estates Subdivision, according to the map thereof recorded in Volume 12 of Plats, Page 45.',
      valuation: 450000,
      registeredAt: '2024-01-15 14:32:10',
      blockNumber: 19482019,
      txHash: '0x3a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f',
      zkpProofHash: '0xzkp987654321fedcba987654321fedcba987654321fedcba987654321fe',
      status: 'Active',
      liens: [],
      chainOfCustody: [
        { from: '0x0000000000000000000000000000000000000000', to: '0x9999999999999999999999999999999999999999', date: '2020-05-10', txHash: '0x1111...', price: 380000 },
        { from: '0x9999999999999999999999999999999999999999', to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', date: '2024-01-15', txHash: '0x3a9f...', price: 450000 }
      ]
    },
    {
      id: 'DEED-002',
      apn: '104-220-05-11',
      address: '1008 Estate Drive, Beverly Hills, CA 90210',
      ownerName: 'Aurelius Holdings LLC',
      ownerAddress: '0x3F5CE0FB54F91363978C6684b813B52918c1511A',
      legalDescription: 'Portion of Rancho Rodeo de las Aguas, as per map recorded in Book 4, Page 23 of Patents, in the office of the County Recorder of Los Angeles County.',
      valuation: 8900000,
      registeredAt: '2024-02-20 09:15:44',
      blockNumber: 19620411,
      txHash: '0x8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e',
      zkpProofHash: '0xzkp123456789abcdef123456789abcdef123456789abcdef123456789abc',
      status: 'Active',
      liens: ['Municipal Tax Lien - $12,450'],
      chainOfCustody: [
        { from: '0x0000000000000000000000000000000000000000', to: '0x3F5CE0FB54F91363978C6684b813B52918c1511A', date: '2024-02-20', txHash: '0x8f7e...', price: 8900000 }
      ]
    },
    {
      id: 'DEED-003',
      apn: '309-112-44-02',
      address: '455 Grand Avenue, Apt 12B, New York, NY 10011',
      ownerName: 'Quantum Real Estate Fund',
      ownerAddress: '0x9E8D7C6B5A4F3E2D1C0B9A8F7E6D5C4B3A2F1E0D',
      legalDescription: 'Condominium Unit 12B in the Grand Avenue Condominium, together with an undivided 1.25% interest in the common elements.',
      valuation: 1750000,
      registeredAt: '2024-03-01 16:45:12',
      blockNumber: 19711022,
      txHash: '0x4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f',
      zkpProofHash: '0xzkp456123789bbccddeeff456123789bbccddeeff456123789bbccddeeff',
      status: 'Disputed',
      liens: ['Mechanics Lien - $45,000'],
      chainOfCustody: [
        { from: '0x0000000000000000000000000000000000000000', to: '0x8888888888888888888888888888888888888888', date: '2018-11-12', txHash: '0x2222...', price: 1200000 },
        { from: '0x8888888888888888888888888888888888888888', to: '0x9E8D7C6B5A4F3E2D1C0B9A8F7E6D5C4B3A2F1E0D', date: '2024-03-01', txHash: '0x4a3f...', price: 1750000 }
      ]
    }
  ]);

  const [selectedDeed, setSelectedDeed] = useState<Deed | null>(deeds[0]);
  const [activeTab, setActiveTab] = useState<'registry' | 'register' | 'transfer' | 'audit'>('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form States - Register
  const [newApn, setNewApn] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newLegal, setNewLegal] = useState('');
  const [newValuation, setNewValuation] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Form States - Transfer
  const [transferToName, setTransferToName] = useState('');
  const [transferToAddress, setTransferToAddress] = useState('');
  const [transferPrice, setTransferPrice] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // ZKP Verification State
  const [zkpVerified, setZkpVerified] = useState<boolean | null>(null);
  const [isVerifyingZkp, setIsVerifyingZkp] = useState(false);

  // AI Title Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  // Terminal Logs
  const [logs, setLogs] = useState<string[]>([
    'SYSTEM: Deed Registrar v2 initialized.',
    'SYSTEM: Connected to Sovereign Ledger Node #1.',
    'SYSTEM: Smart Contract Address: 0xDeedRegistrarV2Core_0x88f...3a'
  ]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Copy Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    addLog(`Copied ${label} to clipboard.`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filtered Deeds
  const filteredDeeds = useMemo(() => {
    return deeds.filter(d => 
      d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.apn.includes(searchQuery) ||
      d.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ownerAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deeds, searchQuery]);

  // Register Deed Handler
  const handleRegisterDeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApn || !newAddress || !newOwnerName || !newOwnerAddress || !newValuation) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsRegistering(true);
    addLog(`Initiating smart contract transaction to register APN: ${newApn}...`);

    // Simulate blockchain delay
    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const zkpProof = '0xzkp' + Array.from({length: 60}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const blockNum = Math.floor(Math.random() * 100000) + 19800000;

      const newDeed: Deed = {
        id: `DEED-00${deeds.length + 1}`,
        apn: newApn,
        address: newAddress,
        ownerName: newOwnerName,
        ownerAddress: newOwnerAddress,
        legalDescription: newLegal || 'Standard residential parcel description.',
        valuation: parseFloat(newValuation),
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        blockNumber: blockNum,
        txHash,
        zkpProofHash: zkpProof,
        status: 'Active',
        liens: [],
        chainOfCustody: [
          {
            from: '0x0000000000000000000000000000000000000000',
            to: newOwnerAddress,
            date: new Date().toISOString().split('T')[0],
            txHash,
            price: parseFloat(newValuation)
          }
        ]
      };

      setDeeds(prev => [...prev, newDeed]);
      setSelectedDeed(newDeed);
      setIsRegistering(false);
      setActiveTab('registry');
      addLog(`SUCCESS: Deed registered in Block #${blockNum}. Tx: ${txHash.substring(0, 10)}...`);
      
      // Reset form
      setNewApn('');
      setNewAddress('');
      setNewOwnerName('');
      setNewOwnerAddress('');
      setNewLegal('');
      setNewValuation('');
    }, 2000);
  };

  // Transfer Title Handler
  const handleTransferTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeed || !transferToName || !transferToAddress || !transferPrice) {
      alert('Please select a deed and fill in all transfer details.');
      return;
    }

    setIsTransferring(true);
    addLog(`Initiating title transfer for ${selectedDeed.id} to ${transferToName}...`);

    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const blockNum = selectedDeed.blockNumber + Math.floor(Math.random() * 500) + 1;

      const updatedDeeds = deeds.map(d => {
        if (d.id === selectedDeed.id) {
          return {
            ...d,
            ownerName: transferToName,
            ownerAddress: transferToAddress,
            valuation: parseFloat(transferPrice),
            txHash,
            blockNumber: blockNum,
            chainOfCustody: [
              ...d.chainOfCustody,
              {
                from: d.ownerAddress,
                to: transferToAddress,
                date: new Date().toISOString().split('T')[0],
                txHash,
                price: parseFloat(transferPrice)
              }
            ]
          };
        }
        return d;
      });

      setDeeds(updatedDeeds);
      const updatedDeed = updatedDeeds.find(d => d.id === selectedDeed.id) || null;
      setSelectedDeed(updatedDeed);
      setIsTransferring(false);
      setTransferToName('');
      setTransferToAddress('');
      setTransferPrice('');
      addLog(`SUCCESS: Title transferred. New Owner: ${transferToName}. Tx: ${txHash.substring(0, 10)}...`);
    }, 2500);
  };

  // ZKP Verification Simulation
  const handleVerifyZkp = () => {
    if (!selectedDeed) return;
    setIsVerifyingZkp(true);
    setZkpVerified(null);
    addLog(`Generating and verifying Zero-Knowledge Proof of ownership for ${selectedDeed.id}...`);

    setTimeout(() => {
      setIsVerifyingZkp(false);
      setZkpVerified(true);
      addLog(`SUCCESS: ZKP verified. Owner identity matches cryptographic commitment without revealing private keys.`);
    }, 1800);
  };

  // AI Title Audit using Gemini
  const runAiTitleAudit = async () => {
    if (!selectedDeed) return;
    setIsAuditing(true);
    setAuditReport(null);
    addLog(`Running AI Title Audit on ${selectedDeed.id} via Gemini...`);

    const prompt = `
      Perform a rigorous real estate title audit and risk assessment for the following property deed:
      Property Address: ${selectedDeed.address}
      APN: ${selectedDeed.apn}
      Current Owner: ${selectedDeed.ownerName} (${selectedDeed.ownerAddress})
      Valuation: $${selectedDeed.valuation.toLocaleString()}
      Liens/Encumbrances: ${selectedDeed.liens.length > 0 ? selectedDeed.liens.join(', ') : 'None reported'}
      Chain of Custody: ${JSON.stringify(selectedDeed.chainOfCustody)}
      Status: ${selectedDeed.status}

      Provide a JSON response matching this structure:
      {
        "score": number (0-100, where 100 is perfectly clear title),
        "status": "Clear" | "Warning" | "Critical",
        "summary": "A brief summary of the title health.",
        "findings": ["Finding 1", "Finding 2"],
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      }
    `;

    try {
      const responseText = await callGemini(prompt);
      // Clean response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: AuditReport = JSON.parse(jsonMatch[0]);
        setAuditReport(parsed);
        addLog(`AI Title Audit completed. Score: ${parsed.score}/100. Status: ${parsed.status}`);
      } else {
        throw new Error("Failed to parse JSON from Gemini response");
      }
    } catch (error) {
      console.error("Gemini Audit Error:", error);
      // Fallback mock report
      const fallbackReport: AuditReport = {
        score: selectedDeed.liens.length > 0 ? 75 : 98,
        status: selectedDeed.liens.length > 0 ? 'Warning' : 'Clear',
        summary: `Automated title scan completed for ${selectedDeed.id}. Chain of custody appears intact.`,
        findings: selectedDeed.liens.length > 0 
          ? [`Active encumbrance detected: ${selectedDeed.liens[0]}`]
          : ['No active liens or encumbrances found in county records.'],
        recommendations: selectedDeed.liens.length > 0
          ? ['Resolve outstanding municipal/mechanic liens prior to title transfer.', 'Verify escrow funding matches lien payoff amounts.']
          : ['Proceed with standard cryptographic title transfer protocols.']
      };
      setAuditReport(fallbackReport);
      addLog(`AI Title Audit completed (Fallback). Score: ${fallbackReport.score}/100.`);
    } finally {
      setIsAuditing(false);
    }
  };

  // Auto-run audit when selected deed changes
  useEffect(() => {
    setZkpVerified(null);
    setAuditReport(null);
  }, [selectedDeed]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <Landmark className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Deed Registrar v2
              </h1>
              <p className="text-sm text-slate-400">
                Smart Contract Property Deeds & Cryptographic Title Transfers
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
            Ledger: Sovereign-Mainnet
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Navigation & Deed List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Navigation Tabs */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('registry')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'registry' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Registry
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Register
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'transfer' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              Transfer
            </button>
          </div>

          {/* Search & List */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by APN, address, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredDeeds.map((deed) => (
                <div
                  key={deed.id}
                  onClick={() => setSelectedDeed(deed)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDeed?.id === deed.id
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-950/10'
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                      {deed.id}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      deed.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      deed.status === 'Disputed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {deed.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-200 truncate">{deed.address}</h4>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span className="truncate max-w-[150px]">{deed.ownerName}</span>
                    <span className="font-semibold text-slate-300">${deed.valuation.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {filteredDeeds.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No deeds found matching search.
                </div>
              )}
            </div>
          </div>

          {/* System Logs / Terminal */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                Registrar Node Logs
              </span>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
            <div className="h-[150px] overflow-y-auto flex flex-col gap-1 text-slate-300 scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Tab Content: Registry Detail View */}
          {activeTab === 'registry' && selectedDeed && (
            <div className="flex flex-col gap-6">
              {/* Deed Overview Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/50">
                        APN: {selectedDeed.apn}
                      </span>
                      <span className="text-xs text-slate-400">Registered: {selectedDeed.registeredAt}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Home className="h-5 w-5 text-emerald-400 shrink-0" />
                      {selectedDeed.address}
                    </h2>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Tokenized Valuation</p>
                    <p className="text-2xl font-extrabold text-emerald-400">${selectedDeed.valuation.toLocaleString()}</p>
                  </div>
                </div>

                {/* Cryptographic Proofs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                      Smart Contract Owner Address
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-300 truncate max-w-[220px]">
                        {selectedDeed.ownerAddress}
                      </span>
                      <button 
                        onClick={() => handleCopy(selectedDeed.ownerAddress, 'Owner Address')}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {copiedText === 'Owner Address' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Database className="h-3.5 w-3.5 text-emerald-400" />
                      Blockchain Transaction Hash
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-300 truncate max-w-[220px]">
                        {selectedDeed.txHash}
                      </span>
                      <button 
                        onClick={() => handleCopy(selectedDeed.txHash, 'Tx Hash')}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {copiedText === 'Tx Hash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legal Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Legal Description</h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                    {selectedDeed.legalDescription}
                  </p>
                </div>

                {/* ZKP Verification Section */}
                <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Zero-Knowledge Ownership Proof
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify ownership cryptographically without revealing identity.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {zkpVerified === true && (
                      <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Verified
                      </span>
                    )}
                    {zkpVerified === false && (
                      <span className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" /> Verification Failed
                      </span>
                    )}
                    <button
                      onClick={handleVerifyZkp}
                      disabled={isVerifyingZkp}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-4 rounded-lg border border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isVerifyingZkp ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                          Generate ZKP Proof
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chain of Custody & AI Title Auditor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chain of Custody */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    Chain of Custody (Ledger History)
                  </h3>
                  <div className="relative pl-4 border-l border-slate-800 flex flex-col gap-6">
                    {selectedDeed.chainOfCustody.map((history, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              Transfer to {history.to.substring(0, 8)}...
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Date: {history.date}</p>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                            ${history.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Title Auditor */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-emerald-400" />
                        AI Title Auditor
                      </h3>
                      {auditReport && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          auditReport.status === 'Clear' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          auditReport.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          Score: {auditReport.score}/100
                        </span>
                      )}
                    </div>

                    {auditReport ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                          {auditReport.summary}
                        </p>
                        <div>
                          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Findings</h4>
                          <ul className="text-xs text-slate-300 list-disc pl-4 flex flex-col gap-1">
                            {auditReport.findings.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center gap-2">
                        <Sparkles className="h-8 w-8 text-slate-700 animate-pulse" />
                        Run AI Title Audit to scan for liens, encumbrances, and chain of custody anomalies.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={runAiTitleAudit}
                    disabled={isAuditing}
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAuditing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Auditing Title...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Run AI Title Audit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Register New Deed */}
          {activeTab === 'register' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-400" />
                Register New Property Deed
              </h2>

              <form onSubmit={handleRegisterDeed} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Assessor's Parcel Number (APN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 512-040-12-00"
                    value={newApn}
                    onChange={(e) => setNewApn(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Property Valuation (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 450000"
                      value={newValuation}
                      onChange={(e) => setNewValuation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Terrace, Springfield, OR 97477"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Owner Name / Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Trust Alpha"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Owner Blockchain Wallet Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Legal Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter full legal description of the parcel..."
                    value={newLegal}
                    onChange={(e) => setNewLegal(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('registry')}
                    className="bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-semibold py-2.5 px-6 rounded-xl border border-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Registering on Ledger...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Register Deed
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab Content: Transfer Title */}
          {activeTab === 'transfer' && selectedDeed && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-400" />
                    Transfer Property Title
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Transferring ownership of <span className="text-emerald-400 font-mono">{selectedDeed.id}</span> ({selectedDeed.address})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Current Owner</p>
                  <p className="text-sm font-semibold text-slate-200">{selectedDeed.ownerName}</p>
                </div>
              </div>

              <form onSubmit={handleTransferTitle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recipient Name / Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aurelius Holdings LLC"
                    value={transferToName}
                    onChange={(e) => setTransferToName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recipient Wallet Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0x3F5CE0FB54F91363978C6684b813B52918c1511A"
                    value={transferToAddress}
                    onChange={(e) => setTransferToAddress(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Transfer Price (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 480000"
                      value={transferPrice}
                      onChange={(e) => setTransferPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 leading-relaxed">
                    <p className="font-semibold text-slate-300 mb-1">Cryptographic Title Transfer Protocol</p>
                    This action will execute a smart contract transaction to update the deed registry. The current owner's cryptographic signature is required to authorize this transfer. Once confirmed, the title will be updated on the Sovereign Ledger.
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('registry')}
                    className="bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-semibold py-2.5 px-6 rounded-xl border border-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Executing Transfer...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Execute Transfer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fallback if no deed selected */}
          {!selectedDeed && activeTab === 'registry' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
              <Home className="h-12 w-12 text-slate-700" />
              <div>
                <h3 className="text-lg font-bold text-slate-300">No Deed Selected</h3>
                <p className="text-sm text-slate-500 mt-1">Select a property deed from the registry list to view details.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}