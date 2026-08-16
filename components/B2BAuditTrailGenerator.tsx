import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Plus, 
  RotateCcw, 
  Download, 
  FileJson, 
  Search, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  Unlock, 
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Layers,
  DollarSign,
  Activity,
  Copy,
  Check
} from 'lucide-react';

// --- CRYPTOGRAPHIC UTILITIES (Deterministic & Fast) ---
function mockHash(data: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0xfae92013, h4 = 0x721a5c32;
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3812741497);
    h4 = Math.imul(h4 ^ ch, 2716044179);
  }
  const hex = (val: number) => (val >>> 0).toString(16).padStart(8, '0');
  return hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h1 ^ h2) + hex(h3 ^ h4) + hex(h1 ^ h3) + hex(h2 ^ h4);
}

interface Block {
  index: number;
  timestamp: string;
  sender: string;
  receiver: string;
  amount: number;
  previousHash: string;
  hash: string;
  nonce: number;
  signature: string;
}

const INITIAL_LEDGER: Block[] = [
  {
    index: 0,
    timestamp: "2024-10-24 09:00:00",
    sender: "Genesis Block",
    receiver: "System",
    amount: 0,
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "0000a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456",
    nonce: 4251,
    signature: "SIG_GENESIS_VALID_8821"
  },
  {
    index: 1,
    timestamp: "2024-10-24 10:15:30",
    sender: "Acme Corp Logistics",
    receiver: "Global Freight Inc",
    amount: 124500.00,
    previousHash: "0000a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456",
    hash: "0000f8e7d6c5b4a32109fedcba9876543210fedcba9876543210fedcba987654",
    nonce: 18902,
    signature: "SIG_ACME_9921a_SECURE"
  },
  {
    index: 2,
    timestamp: "2024-10-24 11:30:12",
    sender: "Initech Software",
    receiver: "Hooli Cloud Services",
    amount: 89200.50,
    previousHash: "0000f8e7d6c5b4a32109fedcba9876543210fedcba9876543210fedcba987654",
    hash: "00003a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r",
    nonce: 31044,
    signature: "SIG_INITECH_4412z_SECURE"
  },
  {
    index: 3,
    timestamp: "2024-10-24 13:45:55",
    sender: "Globex Corporation",
    receiver: "Soylent Green Co",
    amount: 450000.00,
    previousHash: "00003a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r",
    hash: "00007b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r",
    nonce: 9432,
    signature: "SIG_GLOBEX_7712x_SECURE"
  }
];

export default function B2BAuditTrailGenerator() {
  const [ledger, setLedger] = useState<Block[]>(INITIAL_LEDGER);
  const [difficulty, setDifficulty] = useState<number>(2); // Number of leading zeros required
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Sandbox Form State
  const [sender, setSender] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isMining, setIsMining] = useState<boolean>(false);

  // Tamper State
  const [tamperIndex, setTamperIndex] = useState<number>(1);
  const [tamperAmount, setTamperAmount] = useState<string>("");
  const [tamperSender, setTamperSender] = useState<string>("");
  const [tamperReceiver, setTamperReceiver] = useState<string>("");

  // Sync tamper inputs when selected index changes
  useEffect(() => {
    const block = ledger.find(b => b.index === tamperIndex);
    if (block) {
      setTamperAmount(block.amount.toString());
      setTamperSender(block.sender);
      setTamperReceiver(block.receiver);
    }
  }, [tamperIndex, ledger]);

  // Calculate block hash based on its contents
  const calculateHash = (block: Omit<Block, 'hash'>): string => {
    const dataStr = block.index + block.timestamp + block.sender + block.receiver + block.amount + block.previousHash + block.nonce;
    return mockHash(dataStr);
  };

  // Validate the entire chain
  const chainValidation = useMemo(() => {
    const results = ledger.map((block, idx) => {
      const calculated = calculateHash(block);
      const hashMatches = block.hash === calculated;
      const prefix = '0'.repeat(difficulty);
      const meetsDifficulty = block.hash.startsWith(prefix);
      
      let prevHashMatches = true;
      if (idx > 0) {
        prevHashMatches = block.previousHash === ledger[idx - 1].hash;
      }

      return {
        index: block.index,
        hashMatches,
        meetsDifficulty,
        prevHashMatches,
        isValid: hashMatches && prevHashMatches && (idx === 0 || meetsDifficulty)
      };
    });

    const isAllValid = results.every(r => r.isValid);
    return { results, isAllValid };
  }, [ledger, difficulty]);

  // Metrics
  const metrics = useMemo(() => {
    const totalTx = ledger.length - 1; // Exclude genesis
    const totalVolume = ledger.reduce((sum, b) => sum + b.amount, 0);
    const avgTx = totalTx > 0 ? totalVolume / totalTx : 0;
    const tamperedBlocksCount = chainValidation.results.filter(r => !r.isValid).length;
    return { totalTx, totalVolume, avgTx, tamperedBlocksCount };
  }, [ledger, chainValidation]);

  // Filtered Ledger for Search
  const filteredLedger = useMemo(() => {
    if (!searchQuery) return ledger;
    const q = searchQuery.toLowerCase();
    return ledger.filter(b => 
      b.sender.toLowerCase().includes(q) || 
      b.receiver.toLowerCase().includes(q) || 
      b.hash.toLowerCase().includes(q) ||
      b.amount.toString().includes(q)
    );
  }, [ledger, searchQuery]);

  // Mine a new block
  const handleMineBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !receiver || !amount || isMining) return;

    setIsMining(true);
    
    // Simulate mining delay
    setTimeout(() => {
      const lastBlock = ledger[ledger.length - 1];
      const index = ledger.length;
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const amtVal = parseFloat(amount);
      const prevHash = lastBlock.hash;
      
      let nonce = 0;
      let hash = "";
      const prefix = '0'.repeat(difficulty);

      // Simple Proof of Work loop
      while (true) {
        const tempBlock = { index, timestamp, sender, receiver, amount: amtVal, previousHash: prevHash, nonce };
        hash = calculateHash(tempBlock);
        if (hash.startsWith(prefix)) {
          break;
        }
        nonce++;
        if (nonce > 1000000) break; // Safety break
      }

      const signature = `SIG_${sender.substring(0, 4).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}_SECURE`;

      const newBlock: Block = {
        index,
        timestamp,
        sender,
        receiver,
        amount: amtVal,
        previousHash: prevHash,
        hash,
        nonce,
        signature
      };

      setLedger([...ledger, newBlock]);
      setSender("");
      setReceiver("");
      setAmount("");
      setIsMining(false);
    }, 600);
  };

  // Tamper with a block
  const handleTamper = () => {
    const updatedLedger = ledger.map(block => {
      if (block.index === tamperIndex) {
        return {
          ...block,
          amount: parseFloat(tamperAmount) || 0,
          sender: tamperSender,
          receiver: tamperReceiver
          // Notice we do NOT recalculate the hash here, simulating unauthorized data modification!
        };
      }
      return block;
    });
    setLedger(updatedLedger);
  };

  // Recalculate/Repair the chain (Re-mine from tampered block onwards)
  const handleRepairChain = () => {
    let currentLedger = [...ledger];
    const prefix = '0'.repeat(difficulty);

    for (let i = 0; i < currentLedger.length; i++) {
      const block = currentLedger[i];
      const prevHash = i === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : currentLedger[i - 1].hash;
      
      let nonce = 0;
      let hash = "";
      
      // Re-mine this block to make it valid with the new previous hash
      while (true) {
        const tempBlock = { ...block, previousHash: prevHash, nonce };
        hash = calculateHash(tempBlock);
        if (hash.startsWith(prefix)) {
          break;
        }
        nonce++;
      }

      currentLedger[i] = {
        ...block,
        previousHash: prevHash,
        hash,
        nonce
      };
    }
    setLedger(currentLedger);
  };

  // Reset Ledger
  const handleReset = () => {
    setLedger(INITIAL_LEDGER);
    setTamperIndex(1);
    setSelectedBlock(null);
  };

  // Export Signed JSON Report
  const handleExportJSON = () => {
    const report = {
      reportId: `AUDIT-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      integrityStatus: chainValidation.isAllValid ? "SECURE" : "COMPROMISED",
      difficultySetting: difficulty,
      metrics: {
        totalBlocks: ledger.length,
        totalTransactions: metrics.totalTx,
        totalVolumeUSD: metrics.totalVolume,
        averageTransactionUSD: metrics.avgTx,
        invalidBlocksCount: metrics.tamperedBlocksCount
      },
      ledger: ledger,
      cryptographicSignature: mockHash(JSON.stringify(ledger) + "AUDIT_SECRET_KEY_2024")
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `B2B_Audit_Report_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <Database className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                B2B Cryptographic Audit Trail
              </h1>
              <p className="text-sm text-slate-400">
                Real-time immutable ledger simulation with Proof-of-Work & Tamper Detection
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chain Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-300 ${
            chainValidation.isAllValid 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
              : 'bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-pulse'
          }`}>
            {chainValidation.isAllValid ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>LEDGER INTEGRITY: SECURE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                <span>LEDGER INTEGRITY: COMPROMISED</span>
              </>
            )}
          </div>

          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
            title="Reset Ledger to Initial State"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

      {/* METRICS DASHBOARD */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Blocks</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-100">{ledger.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Including Genesis Block</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Volume (USD)</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">
              ${metrics.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cryptographically verified</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Transaction</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-100">
              ${metrics.avgTx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Across {metrics.totalTx} active transfers</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mining Difficulty</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-bold text-amber-400">{difficulty}</h3>
              <span className="text-xs text-slate-500">({difficulty} leading zeros)</span>
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    difficulty === d 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  D{d}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER: LEDGER & SANDBOX */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SEARCH & LEDGER LIST */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Cryptographic Ledger Chain
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Each block points to the hash of the previous block. Any change breaks the chain.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* LEDGER FLOW */}
            <div className="space-y-6 relative before:absolute before:left-6 before:top-8 before:bottom-8 before:w-0.5 before:bg-slate-800">
              {filteredLedger.map((block, idx) => {
                const validation = chainValidation.results.find(r => r.index === block.index);
                const isValid = validation?.isValid ?? true;
                const isSelected = selectedBlock?.index === block.index;

                return (
                  <div 
                    key={block.index}
                    className={`relative pl-12 transition-all duration-300 ${
                      isSelected ? 'scale-[1.01]' : ''
                    }`}
                  >
                    {/* Node Icon on the timeline */}
                    <div className={`absolute left-3 top-4 w-6.5 h-6.5 -translate-x-1/2 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                      isValid 
                        ? 'bg-slate-950 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                        : 'bg-slate-950 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-pulse'
                    }`}>
                      {isValid ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </div>

                    {/* Block Card */}
                    <div 
                      onClick={() => setSelectedBlock(block)}
                      className={`cursor-pointer p-5 rounded-xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-slate-800/80 border-slate-600 shadow-lg' 
                          : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80'
                      } ${!isValid ? 'border-rose-950 bg-rose-950/10' : ''}`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
                            BLOCK #{block.index}
                          </span>
                          {block.index === 0 && (
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] font-semibold text-blue-400">
                              GENESIS
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-mono">{block.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">Nonce: {block.nonce}</span>
                          {isValid ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> VALID
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                              <XCircle className="w-3 h-3" /> INVALID
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-y border-slate-800/60 my-3 text-xs">
                        <div>
                          <p className="text-slate-500 uppercase tracking-wider text-[10px]">Sender</p>
                          <p className="font-semibold text-slate-200 mt-0.5 truncate">{block.sender}</p>
                        </div>
                        <div className="flex items-center md:justify-center gap-2">
                          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
                          <div>
                            <p className="text-slate-500 uppercase tracking-wider text-[10px] md:text-center">Amount</p>
                            <p className="font-bold text-emerald-400 mt-0.5">
                              ${block.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <p className="text-slate-500 uppercase tracking-wider text-[10px]">Receiver</p>
                          <p className="font-semibold text-slate-200 mt-0.5 truncate">{block.receiver}</p>
                        </div>
                      </div>

                      {/* Cryptographic Hashes */}
                      <div className="space-y-1.5 font-mono text-[10px]">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">PREV HASH:</span>
                          <span className="text-slate-400 truncate max-w-[280px] sm:max-w-md" title={block.previousHash}>
                            {block.previousHash}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">BLOCK HASH:</span>
                          <span className={`truncate max-w-[280px] sm:max-w-md font-bold ${
                            isValid ? 'text-emerald-400/90' : 'text-rose-400/90 line-through'
                          }`} title={block.hash}>
                            {block.hash}
                          </span>
                        </div>
                        {!isValid && (
                          <div className="mt-2 p-2 bg-rose-950/30 border border-rose-500/20 rounded text-rose-300 text-[11px] flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">Cryptographic Link Broken</p>
                              <p className="text-rose-400/80 mt-0.5">
                                Expected: <code className="bg-rose-950 px-1 py-0.5 rounded text-rose-200">{calculateHash(block)}</code>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DEVELOPER SANDBOX: ADD TRANSACTION */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">Developer Sandbox: Mine New Block</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Simulate adding a new B2B transaction. The system will perform Proof-of-Work mining to find a valid nonce matching the current difficulty setting.
            </p>

            <form onSubmit={handleMineBlock} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Sender Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stark Industries"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Receiver Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayne Enterprises"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Transaction Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isMining}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    isMining 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {isMining ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      Mining Block (PoW)...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Mine & Append Block
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: TAMPER SIMULATOR, ANALYTICS & EXPORT */}
        <div className="space-y-8">
          
          {/* TAMPER SIMULATOR */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold text-slate-100">Tamper Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Select any block and modify its data. Watch how the cryptographic hash changes, instantly breaking the chain validation for all subsequent blocks.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Block to Tamper
                </label>
                <select
                  value={tamperIndex}
                  onChange={(e) => setTamperIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors"
                >
                  {ledger.map((b) => (
                    <option key={b.index} value={b.index} disabled={b.index === 0}>
                      Block #{b.index} ({b.sender.substring(0, 12)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Modify Sender
                </label>
                <input
                  type="text"
                  value={tamperSender}
                  onChange={(e) => setTamperSender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Modify Receiver
                </label>
                <input
                  type="text"
                  value={tamperReceiver}
                  onChange={(e) => setTamperReceiver(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Modify Amount (USD)
                </label>
                <input
                  type="number"
                  value={tamperAmount}
                  onChange={(e) => setTamperAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleTamper}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-950 text-xs font-bold tracking-wider uppercase rounded-lg transition-colors"
                >
                  Inject Tampered Data
                </button>
                
                {!chainValidation.isAllValid && (
                  <button
                    onClick={handleRepairChain}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition-colors"
                    title="Re-mine all blocks to restore cryptographic validity"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Repair Chain
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FINANCIAL ANALYTICS CHARTS */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">Financial Analytics</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Visual representation of transaction volumes across the ledger.
            </p>

            {/* Custom SVG Area Chart */}
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Transaction Volume Trend
                </p>
                <div className="h-32 w-full bg-slate-950/80 rounded-lg border border-slate-800/80 p-2 relative overflow-hidden">
                  {/* Simple SVG Line/Area Chart */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area */}
                    <path
                      d={`M 0 100 
                          ${ledger.map((b, i) => {
                            const x = (i / (ledger.length - 1)) * 100;
                            const maxAmt = Math.max(...ledger.map(bl => bl.amount), 1);
                            const y = 100 - (b.amount / maxAmt) * 80;
                            return `L ${x} ${y}`;
                          }).join(' ')} 
                          L 100 100 Z`}
                      fill="url(#chartGrad)"
                    />
                    {/* Line */}
                    <path
                      d={ledger.map((b, i) => {
                        const x = (i / (ledger.length - 1)) * 100;
                        const maxAmt = Math.max(...ledger.map(bl => bl.amount), 1);
                        const y = 100 - (b.amount / maxAmt) * 80;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute bottom-1 left-2 text-[9px] text-slate-500">Genesis</div>
                  <div className="absolute bottom-1 right-2 text-[9px] text-slate-500">Latest Block</div>
                </div>
              </div>

              {/* Distribution List */}
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Top Transacting Entities
                </p>
                <div className="space-y-2">
                  {Array.from(new Set(ledger.flatMap(b => [b.sender, b.receiver])))
                    .filter(name => name !== "Genesis Block" && name !== "System")
                    .slice(0, 4)
                    .map((entity) => {
                      const total = ledger
                        .filter(b => b.sender === entity || b.receiver === entity)
                        .reduce((sum, b) => sum + b.amount, 0);
                      const maxTotal = Math.max(...ledger.map(b => b.amount)) * 1.5;
                      const percentage = Math.min((total / maxTotal) * 100, 100);

                      return (
                        <div key={entity} className="text-xs">
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span className="truncate max-w-[180px]">{entity}</span>
                            <span className="font-semibold text-slate-400">${total.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* EXPORT CENTER */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileJson className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-slate-100">Signed Audit Export</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Generate and download a cryptographically signed JSON audit report containing the entire ledger state, validation metrics, and system metadata.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-slate-950 text-xs font-bold tracking-wider uppercase rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Signed JSON
              </button>

              <button
                onClick={() => copyToClipboard(JSON.stringify(ledger, null, 2))}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold tracking-wider uppercase rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Raw Ledger JSON
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* DETAILED BLOCK MODAL / DRAWER */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Block #{selectedBlock.index} Cryptographic Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep inspection of block headers and payload signature
                </p>
              </div>
              <button 
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-[10px]">Timestamp</p>
                  <p className="font-mono text-slate-200 mt-0.5">{selectedBlock.timestamp}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-[10px]">Nonce (PoW Solution)</p>
                  <p className="font-mono text-slate-200 mt-0.5">{selectedBlock.nonce}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 uppercase tracking-wider text-[10px]">Digital Signature</p>
                  <p className="font-mono text-purple-400 mt-0.5">{selectedBlock.signature}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-slate-400 font-semibold">Payload Data</p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">sender:</span>
                    <span className="text-slate-200">"{selectedBlock.sender}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">receiver:</span>
                    <span className="text-slate-200">"{selectedBlock.receiver}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">amount:</span>
                    <span className="text-emerald-400">{selectedBlock.amount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-slate-400 font-semibold">Cryptographic Linkage</p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 font-mono text-[11px] space-y-2">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Previous Block Hash</p>
                    <p className="text-slate-300 break-all mt-0.5">{selectedBlock.previousHash}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Current Block Hash</p>
                    <p className="text-emerald-400 break-all mt-0.5">{selectedBlock.hash}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto mt-16 border-t border-slate-900 pt-8 pb-4 text-center text-xs text-slate-500">
        <p>© 2024 B2B Cryptographic Audit Trail Generator. Designed for secure enterprise ledger simulation.</p>
      </footer>
    </div>
  );
}
