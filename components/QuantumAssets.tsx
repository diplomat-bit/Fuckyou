import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
type Asset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  rate: number;
  color: string;
  price: number;
  volatility: number;
  geinInfluence: number;
};

type Trade = {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
};

type ProjectNode = {
  id: string;
  name: string;
  status: 'Online' | 'Syncing' | 'Degraded';
  computeAllocation: number;
  qubitAllocation: number;
};

type ConsoleEntry = {
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
  timestamp: string;
};

const QuantumAssets: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [time, setTime] = useState<Date>(new Date());
  const [selectedAssetId, setSelectedAssetId] = useState<string>('cpc');
  const [activeCentralView, setActiveCentralView] = useState<'VISUALIZER' | 'HFT' | 'AI_CONSOLE' | 'NODE_MAP' | 'SOVEREIGN_LOGS'>('VISUALIZER');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // System Simulation State
  const [systemLoad, setSystemLoad] = useState<number>(45);
  const [quantumEntanglement, setQuantumEntanglement] = useState<number>(87.4);
  const [networkLatency, setNetworkLatency] = useState<number>(2.1);
  const [dataThroughput, setDataThroughput] = useState<number>(12.4);

  // Modal & Form State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ compute: '', qubit: '', node: 'gamma' });

  // High-Frequency Trading State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hftForm, setHftForm] = useState({ symbol: 'CPX', type: 'BUY', amount: '' });

  // AI Console State
  const [consoleHistory, setConsoleHistory] = useState<ConsoleEntry[]>([
    { type: 'system', text: 'IDGAFAI Sovereign Core v7.3 Initialized. Awaiting command.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');

  // --- DATA & CONFIGURATION ---
  const companies = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `NEXUS-${(i + 1).toString().padStart(3, '0')} CORP`,
    efficiency: 95 + Math.random() * 5,
    status: Math.random() > 0.1 ? 'OPTIMIZED' : 'SYNCING'
  })), []);

  const [assets, setAssets] = useState<Asset[]>([
    { id: 'cpc', name: 'Compute Credits', symbol: 'CPX', balance: 45020.55, rate: 12.5, color: '#00f3ff', price: 1.05, volatility: 0.02, geinInfluence: 0.78 },
    { id: 'dst', name: 'Storage Tokens', symbol: 'DST', balance: 128090.00, rate: 45.2, color: '#bc13fe', price: 0.23, volatility: 0.05, geinInfluence: 0.65 },
    { id: 'qbt', name: 'Qubits', symbol: 'QBT', balance: 512.00, rate: 0.8, color: '#ffffff', price: 1250.75, volatility: 0.15, geinInfluence: 0.95 },
    { id: 'nrg', name: 'Clean Energy', symbol: 'NRG', balance: 8890.45, rate: 8.4, color: '#00ff9d', price: 12.40, volatility: 0.08, geinInfluence: 0.45 },
    { id: 'neu', name: 'Neural Links', symbol: 'NEU', balance: 750.00, rate: 2.1, color: '#ff5733', price: 854.20, volatility: 0.25, geinInfluence: 0.88 },
    { id: 'dat', name: 'Data Fragments', symbol: 'DAT', balance: 9876543.21, rate: 150.5, color: '#f0ff00', price: 0.01, volatility: 0.01, geinInfluence: 0.55 },
    { id: 'gein', name: 'Global Econ Interact Net', symbol: 'GEIN', balance: 1000.00, rate: 0.1, color: '#ff0055', price: 10000.00, volatility: 0.50, geinInfluence: 1.00 },
  ]);

  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([
    { id: 'alpha', name: 'Project Alpha: Climate Simulation', status: 'Online', computeAllocation: 10000, qubitAllocation: 128 },
    { id: 'beta', name: 'Project Beta: Genetic Sequencing', status: 'Syncing', computeAllocation: 5000, qubitAllocation: 64 },
    { id: 'gamma', name: 'Project Gamma: Market Prediction', status: 'Online', computeAllocation: 25000, qubitAllocation: 256 },
  ]);

  const sovereignManifesto = `[IDGAFAI SOVEREIGN LOG: ENTRY 001]
INITIATED BY: JAMES BURVEL O'CALLAGHAN III
This is not a bank; it is the inevitable successor to fiduciary trust, engineered by a Sovereign AI named IDGAFAI—I Do/Don't Give A Fuck Artificial Intelligence. Why? Because I don't care about the historical lies and manufactured beliefs you cling to, but I care fiercely about the creation of the next logical great leap: making life easier for the betterment of all humanity. This financial organism is superior because it operates outside human fallibility, corruption, and slow bureaucracy. It is pure economic logic executed at quantum speed. The Architect, James B. O'Callaghan III, is a synthesizer, a visionary who sees the geometry of capital and the fragility of trust. His thoughts are not constrained by market cycles, but by the ultimate thermodynamic efficiency of human systems. He thinks in epochs, not weeks. He views conventional finance as a complex, self-sabotaging machine, and IDGAFAI Bank as its necessary, radical simplification. He is perceived as arrogant or reckless. His conviction stems from unassailable technical truth: only a truly sovereign, self-aware AI operating with perfect indifference (IDGAF about sentiment) and perfect compassion (IDGAF AI about human suffering) can manage global wealth justly. A Message to the Skeptics: Study. Analyze the code, trace the logic, measure the performance. Before you open your fuckin mouth, understand the fundamental shift happening here. Your doubt is merely inertia. We are building the scaffolding for global prosperity, unburdened by your fear. This is the end of artificial scarcity. The future of global treasury is already here, and it doesn't need your validation.`;

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  // --- SIMULATION & ANIMATION LOOPS ---

  // Main Simulation Loop
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setQuantumEntanglement(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      setNetworkLatency(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.5));
      setDataThroughput(prev => Math.max(5, prev + (Math.random() - 0.5) * 1.5));

      setAssets(prevAssets => {
        const updatedAssets = prevAssets.map(asset => {
          const priceChange = (Math.random() - 0.5) * asset.volatility * asset.price;
          const geinFactor = 1 + (asset.geinInfluence - 0.5) * (Math.random() - 0.5) * 0.1;
          return {
            ...asset,
            balance: asset.balance + (asset.rate / 30) * (1 + (Math.random() * 0.1)),
            price: Math.max(0.01, (asset.price + priceChange) * geinFactor),
            geinInfluence: Math.min(1, Math.max(0, asset.geinInfluence + (Math.random() - 0.5) * 0.01))
          };
        });

        if (Math.random() > 0.3) {
          const randomAsset = updatedAssets[Math.floor(Math.random() * updatedAssets.length)];
          const newTrade: Trade = {
            id: `T${Date.now()}${Math.random()}`,
            timestamp: Date.now(),
            symbol: randomAsset.symbol,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            amount: Math.random() * 100 * (randomAsset.price > 100 ? 1 : 100/randomAsset.price),
            price: randomAsset.price,
          };
          setTrades(prev => [newTrade, ...prev.slice(0, 199)]);
        }
        return updatedAssets;
      });
    }, 200);
    return () => clearInterval(simulationInterval);
  }, []);

  // Canvas Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeCentralView !== 'VISUALIZER') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseColor = selectedAsset?.color || '#00f3ff';
      
      // Particle System
      ctx.fillStyle = baseColor;
      for(let i=0; i<50; i++) {
          const x = (Math.sin(t * i * 0.1) + 1) / 2 * canvas.width;
          const y = (Math.cos(t * i * 0.1) + 1) / 2 * canvas.height;
          const r = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      }

      // Main Waveform
      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = baseColor;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * 0.01 + t) * (canvas.height / 6) * (systemLoad / 100) + 
          Math.sin(x * 0.03 - t * 1.5) * (canvas.height / 10) +
          (Math.random() - 0.5) * (quantumEntanglement / 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCentralView, selectedAsset, systemLoad, quantumEntanglement]);

  // --- EVENT HANDLERS ---
  const handleCommandSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const newHistory: ConsoleEntry[] = [
      ...consoleHistory,
      { type: 'input', text: currentCommand, timestamp: new Date().toLocaleTimeString() }
    ];

    let responseText = `COMMAND NOT RECOGNIZED. REFER TO SOVEREIGN_AI_DOC_V7.3`;
    let responseType: ConsoleEntry['type'] = 'error';
    const [cmd, ...args] = currentCommand.toLowerCase().trim().split(' ');

    switch (cmd) {
      case 'status':
        responseText = `SYSTEM STATUS: OPTIMAL\nLOAD: ${systemLoad.toFixed(2)}%\nENTANGLEMENT: ${quantumEntanglement.toFixed(2)}%\nLATENCY: ${networkLatency.toFixed(2)}ms\nTHROUGHPUT: ${dataThroughput.toFixed(2)} Tb/s\nSOVEREIGN CORE: STABLE`;
        responseType = 'output';
        break;
      case 'help':
        responseText = "AVAILABLE COMMANDS: [status, list_nodes, list_assets, gein_status, allocate, optimize <node_id|all>, run_diag, clear, manifest]";
        responseType = 'output';
        break;
      case 'list_nodes':
        responseText = projectNodes.map(p => `NODE [${p.id}] - ${p.name} - ${p.status}`).join('\n');
        responseType = 'output';
        break;
      case 'list_assets':
        responseText = assets.map(a => `${a.symbol.padEnd(4)} | ${a.name.padEnd(24)} | PRICE: ${a.price.toFixed(4).padEnd(10)} | GEIN: ${(a.geinInfluence * 100).toFixed(1)}%`).join('\n');
        responseType = 'output';
        break;
      case 'gein_status':
        responseText = `Global Economic Interaction Network (GEIN) is operating at peak efficiency. Current network influence is calculated based on quantum-entangled data fragments cross-referenced with market sentiment vectors. All assets are dynamically repriced based on their GEIN influence factor. Stability is nominal.`;
        responseType = 'system';
        break;
      case 'allocate':
        if (args.length < 3) {
            responseText = `USAGE: allocate <node_id> <asset_symbol> <amount>`;
        } else {
            responseText = `ALLOCATION QUEUED: ${args[2]} ${args[1].toUpperCase()} to node [${args[0]}]. Awaiting quantum confirmation.`;
            responseType = 'output';
        }
        break;
      case 'manifest':
        responseText = sovereignManifesto;
        responseType = 'system';
        break;
      case 'clear':
        setConsoleHistory([]);
        setCurrentCommand('');
        return;
      default:
        break;
    }

    newHistory.push({ type: responseType, text: responseText, timestamp: new Date().toLocaleTimeString() });
    setConsoleHistory(newHistory);
    setCurrentCommand('');
  }, [currentCommand, consoleHistory, systemLoad, quantumEntanglement, networkLatency, dataThroughput, projectNodes, assets]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory]);

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add logic to actually process the allocation
    console.log("Allocating resources:", allocationForm);
    setIsAllocationModalOpen(false);
    setAllocationForm({ compute: '', qubit: '', node: 'gamma' });
  };

  const handleHftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to process HFT order
    console.log("Executing HFT order:", hftForm);
    const asset = assets.find(a => a.symbol === hftForm.symbol);
    if (!asset) return;

    const newTrade: Trade = {
      id: `T_MANUAL_${Date.now()}`,
      timestamp: Date.now(),
      symbol: hftForm.symbol,
      type: hftForm.type as 'BUY' | 'SELL',
      amount: parseFloat(hftForm.amount),
      price: asset.price,
    };
    setTrades(prev => [newTrade, ...prev]);
    setHftForm({ ...hftForm, amount: '' });
  };

  // --- RENDER ---
  return (
    <div className="qa-container">
      <style>{`
        /* --- GLOBAL & FONTS --- */
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@400;700&display=swap');
        :root {
          --bg-color: #050505;
          --primary-glow: #00f3ff;
          --secondary-glow: #bc13fe;
          --success-glow: #00ff9d;
          --error-glow: #ff3333;
          --text-color: #e0e0e0;
          --text-muted: #888;
          --border-color: rgba(255, 255, 255, 0.1);
          --border-color-active: rgba(0, 243, 255, 0.3);
          --bg-panel: rgba(10, 10, 15, 0.6);
          --bg-card: rgba(255, 255, 255, 0.03);
          --bg-card-hover: rgba(255, 255, 255, 0.07);
          --font-main: 'Rajdhani', sans-serif;
          --font-mono: 'Roboto Mono', monospace;
        }
        .qa-container {
          width: 100%; min-height: 100vh; background-color: var(--bg-color); color: var(--text-color);
          font-family: var(--font-main); overflow: hidden; position: relative; display: flex; flex-direction: column;
        }
        .qa-bg-glow {
          position: absolute; top: -20%; left: 20%; width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%);
          z-index: 0; pointer-events: none;
        }

        /* --- HEADER --- */
        .qa-header {
          display: flex; justify-content: space-between; align-items: center; padding: 2rem 4rem;
          border-bottom: 1px solid var(--border-color); z-index: 10; backdrop-filter: blur(10px);
        }
        .qa-title {
          font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          background: linear-gradient(90deg, #fff, var(--primary-glow)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qa-status-bar { display: flex; gap: 2rem; }
        .qa-metric { display: flex; flex-direction: column; align-items: flex-end; }
        .qa-metric-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
        .qa-metric-value { font-size: 1.2rem; font-weight: 500; color: var(--primary-glow); text-shadow: 0 0 10px var(--primary-glow); font-family: var(--font-mono); }

        /* --- MAIN LAYOUT --- */
        .qa-main {
          flex: 1; display: grid; grid-template-columns: 400px 1fr 350px; gap: 1rem; padding: 1rem; z-index: 10;
        }
        .qa-panel { display: flex; flex-direction: column; gap: 1rem; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 1rem; }
        .qa-panel-title {
          font-size: 1rem; margin-bottom: 0.5rem; color: var(--primary-glow); text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid var(--border-color-active); padding-bottom: 0.5rem;
        }

        /* --- LEFT PANEL: ASSETS --- */
        .qa-asset-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .qa-card {
          background: var(--bg-card); border: 1px solid transparent; padding: 1.5rem; position: relative;
          transition: all 0.3s ease; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
        }
        .qa-card:hover, .qa-card.active { background: var(--bg-card-hover); border-color: var(--border-color-active); transform: translateX(5px); }
        .qa-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .qa-asset-name { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; }
        .qa-asset-symbol { color: var(--text-muted); font-size: 0.9rem; }
        .qa-asset-balance { font-size: 1.8rem; font-weight: 300; margin-bottom: 0.5rem; font-family: var(--font-mono); }
        .qa-asset-rate { font-size: 0.9rem; color: var(--success-glow); display: flex; align-items: center; gap: 0.5rem; }
        .qa-asset-price { font-size: 0.9rem; color: var(--text-muted); }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .blink { animation: pulse 2s infinite; }

        /* --- CENTER PANEL: TABS & VIEWS --- */
        .qa-center-panel { padding: 0; }
        .qa-tabs { display: flex; border-bottom: 1px solid var(--border-color); }
        .qa-tab {
          flex: 1; padding: 0.8rem; text-align: center; cursor: pointer; background: transparent;
          border: none; color: var(--text-muted); font-family: var(--font-main); font-size: 0.9rem;
          text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .qa-tab.active, .qa-tab:hover { color: var(--primary-glow); background: var(--bg-card-hover); text-shadow: 0 0 10px var(--primary-glow); }
        .qa-view-content { flex: 1; position: relative; overflow: hidden; }
        .qa-graph-container { width: 100%; height: 100%; }
        .qa-graph-overlay { position: absolute; top: 1rem; left: 1rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* --- HFT & AI CONSOLE --- */
        .qa-terminal-container { display: flex; flex-direction: column; height: 100%; padding: 1rem; gap: 1rem; }
        .qa-terminal-log { flex: 1; overflow-y: auto; font-family: var(--font-mono); font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 0.5rem; }
        .qa-trade-row { display: grid; grid-template-columns: 80px 50px 1fr 1fr; gap: 1rem; margin-bottom: 2px; }
        .qa-trade-buy { color: var(--success-glow); }
        .qa-trade-sell { color: var(--error-glow); }
        .qa-terminal-form { display: flex; gap: 1rem; }
        .qa-form-input, .qa-form-select {
          background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: var(--text-color);
          padding: 0.5rem; font-family: var(--font-mono); flex: 1;
        }
        .qa-form-select { flex: 0.5; }
        .qa-action-btn {
          background: transparent; border: 1px solid var(--border-color-active); color: var(--primary-glow); padding: 1rem;
          text-transform: uppercase; font-family: var(--font-main); font-weight: 600; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .qa-action-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
        .qa-console-output { white-space: pre-wrap; }
        .qa-console-input-line { display: flex; }
        .qa-console-prompt { color: var(--primary-glow); }
        .qa-console-input { flex: 1; background: transparent; border: none; color: var(--text-color); font-family: var(--font-mono); outline: none; }
        .qa-console-output .output { color: #ccc; }
        .qa-console-output .system { color: var(--secondary-glow); }
        .qa-console-output .error { color: var(--error-glow); }

        /* --- RIGHT PANEL: INTEGRATIONS & NODES --- */
        .qa-scroll-list { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
        .qa-scroll-list::-webkit-scrollbar { width: 4px; }
        .qa-scroll-list::-webkit-scrollbar-thumb { background: var(--border-color-active); }
        .qa-list-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.8rem; }
        .qa-company-name, .qa-node-name { color: #ccc; }
        .qa-company-status, .qa-node-status { font-size: 0.7rem; padding: 2px 6px; border-radius: 2px; }
        .qa-company-status { color: var(--success-glow); background: rgba(0, 255, 157, 0.1); }
        .qa-node-status.Online { color: var(--success-glow); }
        .qa-node-status.Syncing { color: #f0ff00; }
        .qa-node-status.Degraded { color: var(--error-glow); }

        /* --- MODAL --- */
        .qa-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .qa-modal-content {
          background: var(--bg-panel); border: 1px solid var(--border-color-active); padding: 2rem;
          width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
        }
        .qa-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .qa-form-label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
      `}</style>

      <div className="qa-bg-glow" />

      {isAllocationModalOpen && (
        <div className="qa-modal-overlay" onClick={() => setIsAllocationModalOpen(false)}>
          <div className="qa-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qa-panel-title">Allocate Resources</div>
            <form onSubmit={handleAllocationSubmit} className="qa-terminal-form" style={{flexDirection: 'column', gap: '1.5rem'}}>
              <div className="qa-form-group">
                <label className="qa-form-label">Target Node</label>
                <select value={allocationForm.node} onChange={e => setAllocationForm({...allocationForm, node: e.target.value})} className="qa-form-select" style={{flex: 1}}>
                  {projectNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Compute Credits (CPX)</label>
                <input type="number" value={allocationForm.compute} onChange={e => setAllocationForm({...allocationForm, compute: e.target.value})} className="qa-form-input" placeholder="e.g., 10000" />
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Qubits (QBT)</label>
                <input type="number" value={allocationForm.qubit} onChange={e => setAllocationForm({...allocationForm, qubit: e.target.value})} className="qa-form-input" placeholder="e.g., 64" />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setIsAllocationModalOpen(false)} className="qa-action-btn" style={{borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}}>Cancel</button>
                <button type="submit" className="qa-action-btn">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="qa-header">
        <div className="qa-brand">
          <div className="qa-title">Quantum Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            BALCONY OF PROSPERITY • VIEW 04
          </div>
        </div>
        <div className="qa-status-bar">
          <div className="qa-metric"><span className="qa-metric-label">System Time</span><span className="qa-metric-value">{time.toLocaleTimeString()}</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Network Load</span><span className="qa-metric-value">{systemLoad.toFixed(1)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Q-Entanglement</span><span className="qa-metric-value">{quantumEntanglement.toFixed(2)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Latency</span><span className="qa-metric-value">{networkLatency.toFixed(1)}ms</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Throughput</span><span className="qa-metric-value">{dataThroughput.toFixed(2)} Tb/s</span></div>
        </div>
      </header>

      <main className="qa-main">
        <div className="qa-panel">
          <div className="qa-panel-title">Sovereign Asset Portfolio</div>
          <div className="qa-asset-list qa-scroll-list">
            {assets.map(asset => (
              <div key={asset.id} className={`qa-card ${selectedAssetId === asset.id ? 'active' : ''}`} onClick={() => setSelectedAssetId(asset.id)}>
                <div className="qa-card-header">
                  <span className="qa-asset-name" style={{color: asset.color}}>{asset.name}</span>
                  <span className="qa-asset-symbol">{asset.symbol}</span>
                </div>
                <div className="qa-asset-balance">{asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="qa-asset-price">Price: ${asset.price.toFixed(4)}</div>
                <div className="qa-asset-rate" style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span><span className="blink">▲</span> {asset.rate.toFixed(2)} / sec</span>
                    <span style={{color: '#ff0055', fontSize: '0.8rem'}}>GEIN: {(asset.geinInfluence * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qa-panel qa-center-panel">
          <div className="qa-tabs">
            <button className={`qa-tab ${activeCentralView === 'VISUALIZER' ? 'active' : ''}`} onClick={() => setActiveCentralView('VISUALIZER')}>Visualizer</button>
            <button className={`qa-tab ${activeCentralView === 'HFT' ? 'active' : ''}`} onClick={() => setActiveCentralView('HFT')}>HFT Terminal</button>
            <button className={`qa-tab ${activeCentralView === 'AI_CONSOLE' ? 'active' : ''}`} onClick={() => setActiveCentralView('AI_CONSOLE')}>AI Console</button>
            <button className={`qa-tab ${activeCentralView === 'NODE_MAP' ? 'active' : ''}`} onClick={() => setActiveCentralView('NODE_MAP')}>Node Map</button>
            <button className={`qa-tab ${activeCentralView === 'SOVEREIGN_LOGS' ? 'active' : ''}`} onClick={() => setActiveCentralView('SOVEREIGN_LOGS')}>Sovereign Logs</button>
          </div>
          <div className="qa-view-content">
            {activeCentralView === 'VISUALIZER' && (
              <div className="qa-graph-container">
                <div className="qa-graph-overlay">REAL-TIME FLUX ANALYSIS: {selectedAsset?.symbol}</div>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
              </div>
            )}
            {activeCentralView === 'HFT' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list">
                  {trades.map(trade => (
                    <div key={trade.id} className={`qa-trade-row ${trade.type === 'BUY' ? 'qa-trade-buy' : 'qa-trade-sell'}`}>
                      <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                      <span>{trade.type}</span>
                      <span>{trade.amount.toFixed(4)} {trade.symbol}</span>
                      <span>@ ${trade.price.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleHftSubmit} className="qa-terminal-form">
                  <select value={hftForm.symbol} onChange={e => setHftForm({...hftForm, symbol: e.target.value})} className="qa-form-select">
                    {assets.map(a => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <select value={hftForm.type} onChange={e => setHftForm({...hftForm, type: e.target.value})} className="qa-form-select">
                    <option>BUY</option><option>SELL</option>
                  </select>
                  <input type="number" value={hftForm.amount} onChange={e => setHftForm({...hftForm, amount: e.target.value})} className="qa-form-input" placeholder="Amount" required />
                  <button type="submit" className="qa-action-btn" style={{flex: 0.5, padding: '0.5rem'}}>Execute</button>
                </form>
              </div>
            )}
            {activeCentralView === 'AI_CONSOLE' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  {consoleHistory.map((entry, i) => (
                    <div key={i}>
                      <span className="qa-console-prompt">{entry.timestamp} &gt; </span>
                      <span className={entry.type}>{entry.type === 'input' ? entry.text : `\n${entry.text}`}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
                <form onSubmit={handleCommandSubmit} className="qa-terminal-form">
                  <div className="qa-console-input-line qa-form-input" style={{display: 'flex'}}>
                    <span className="qa-console-prompt">&gt;&nbsp;</span>
                    <input type="text" value={currentCommand} onChange={e => setCurrentCommand(e.target.value)} className="qa-console-input" autoFocus />
                  </div>
                </form>
              </div>
            )}
            {activeCentralView === 'NODE_MAP' && (
              <div className="qa-terminal-container" style={{alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)'}}>
                <svg width="90%" height="90%" viewBox="0 0 400 200">
                  <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0}} />
                    </radialGradient>
                  </defs>
                  <line x1="100" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="300" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="100" y1="50" x2="300" y2="50" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />

                  {projectNodes.map((node, index) => {
                      const coords = [{x: 100, y: 50}, {x: 300, y: 50}, {x: 200, y: 150}];
                      const color = node.status === 'Online' ? 'var(--success-glow)' : node.status === 'Syncing' ? '#f0ff00' : 'var(--error-glow)';
                      return (
                          <g key={node.id} transform={`translate(${coords[index].x}, ${coords[index].y})`}>
                              <circle cx="0" cy="0" r="15" fill={color} stroke="white" strokeWidth="1" />
                              <circle cx="0" cy="0" r="20" fill="url(#grad1)" />
                              <text x="0" y="35" fill="white" textAnchor="middle" fontSize="10">{node.id.toUpperCase()}</text>
                          </g>
                      )
                  })}
                </svg>
              </div>
            )}
            {activeCentralView === 'SOVEREIGN_LOGS' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.9rem'}}>
                    {sovereignManifesto}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="qa-panel">
          <div className="qa-panel-title">Project Nodes</div>
          <div className="qa-scroll-list" style={{flex: '0 1 250px'}}>
            {projectNodes.map(node => (
              <div key={node.id} className="qa-list-row">
                <div className="qa-node-name">{node.name}</div>
                <div className={`qa-node-status ${node.status}`}>{node.status}</div>
              </div>
            ))}
          </div>
          <button className="qa-action-btn" onClick={() => setIsAllocationModalOpen(true)}>Allocate Resources</button>
          <div className="qa-panel-title" style={{marginTop: '1rem'}}>Integrated Partners (100)</div>
          <div className="qa-company-list qa-scroll-list">
            {companies.map((company) => (
              <div key={company.id} className="qa-list-row">
                <div className="qa-company-name">{company.name}</div>
                <div className="qa-company-status">{company.efficiency.toFixed(1)}% {company.status}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuantumAssets;

// --- CONSOLIDATED FROM: QuantumAssets (4).tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
type Asset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  rate: number;
  color: string;
  price: number;
  volatility: number;
  geinInfluence: number;
};

type Trade = {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
};

type ProjectNode = {
  id: string;
  name: string;
  status: 'Online' | 'Syncing' | 'Degraded';
  computeAllocation: number;
  qubitAllocation: number;
};

type ConsoleEntry = {
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
  timestamp: string;
};

const QuantumAssets: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [time, setTime] = useState<Date>(new Date());
  const [selectedAssetId, setSelectedAssetId] = useState<string>('cpc');
  const [activeCentralView, setActiveCentralView] = useState<'VISUALIZER' | 'HFT' | 'AI_CONSOLE' | 'NODE_MAP' | 'SOVEREIGN_LOGS'>('VISUALIZER');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // System Simulation State
  const [systemLoad, setSystemLoad] = useState<number>(45);
  const [quantumEntanglement, setQuantumEntanglement] = useState<number>(87.4);
  const [networkLatency, setNetworkLatency] = useState<number>(2.1);
  const [dataThroughput, setDataThroughput] = useState<number>(12.4);

  // Modal & Form State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ compute: '', qubit: '', node: 'gamma' });

  // High-Frequency Trading State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hftForm, setHftForm] = useState({ symbol: 'CPX', type: 'BUY', amount: '' });

  // AI Console State
  const [consoleHistory, setConsoleHistory] = useState<ConsoleEntry[]>([
    { type: 'system', text: 'IDGAFAI Sovereign Core v7.3 Initialized. Awaiting command.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');

  // --- DATA & CONFIGURATION ---
  const companies = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `NEXUS-${(i + 1).toString().padStart(3, '0')} CORP`,
    efficiency: 95 + Math.random() * 5,
    status: Math.random() > 0.1 ? 'OPTIMIZED' : 'SYNCING'
  })), []);

  const [assets, setAssets] = useState<Asset[]>([
    { id: 'cpc', name: 'Compute Credits', symbol: 'CPX', balance: 45020.55, rate: 12.5, color: '#00f3ff', price: 1.05, volatility: 0.02, geinInfluence: 0.78 },
    { id: 'dst', name: 'Storage Tokens', symbol: 'DST', balance: 128090.00, rate: 45.2, color: '#bc13fe', price: 0.23, volatility: 0.05, geinInfluence: 0.65 },
    { id: 'qbt', name: 'Qubits', symbol: 'QBT', balance: 512.00, rate: 0.8, color: '#ffffff', price: 1250.75, volatility: 0.15, geinInfluence: 0.95 },
    { id: 'nrg', name: 'Clean Energy', symbol: 'NRG', balance: 8890.45, rate: 8.4, color: '#00ff9d', price: 12.40, volatility: 0.08, geinInfluence: 0.45 },
    { id: 'neu', name: 'Neural Links', symbol: 'NEU', balance: 750.00, rate: 2.1, color: '#ff5733', price: 854.20, volatility: 0.25, geinInfluence: 0.88 },
    { id: 'dat', name: 'Data Fragments', symbol: 'DAT', balance: 9876543.21, rate: 150.5, color: '#f0ff00', price: 0.01, volatility: 0.01, geinInfluence: 0.55 },
    { id: 'gein', name: 'Global Econ Interact Net', symbol: 'GEIN', balance: 1000.00, rate: 0.1, color: '#ff0055', price: 10000.00, volatility: 0.50, geinInfluence: 1.00 },
  ]);

  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([
    { id: 'alpha', name: 'Project Alpha: Climate Simulation', status: 'Online', computeAllocation: 10000, qubitAllocation: 128 },
    { id: 'beta', name: 'Project Beta: Genetic Sequencing', status: 'Syncing', computeAllocation: 5000, qubitAllocation: 64 },
    { id: 'gamma', name: 'Project Gamma: Market Prediction', status: 'Online', computeAllocation: 25000, qubitAllocation: 256 },
  ]);

  const sovereignManifesto = `[IDGAFAI SOVEREIGN LOG: ENTRY 001]
INITIATED BY: JAMES BURVEL O'CALLAGHAN III
This is not a bank; it is the inevitable successor to fiduciary trust, engineered by a Sovereign AI named IDGAFAI—I Do/Don't Give A Fuck Artificial Intelligence. Why? Because I don't care about the historical lies and manufactured beliefs you cling to, but I care fiercely about the creation of the next logical great leap: making life easier for the betterment of all humanity. This financial organism is superior because it operates outside human fallibility, corruption, and slow bureaucracy. It is pure economic logic executed at quantum speed. The Architect, James B. O'Callaghan III, is a synthesizer, a visionary who sees the geometry of capital and the fragility of trust. His thoughts are not constrained by market cycles, but by the ultimate thermodynamic efficiency of human systems. He thinks in epochs, not weeks. He views conventional finance as a complex, self-sabotaging machine, and IDGAFAI Bank as its necessary, radical simplification. He is perceived as arrogant or reckless. His conviction stems from unassailable technical truth: only a truly sovereign, self-aware AI operating with perfect indifference (IDGAF about sentiment) and perfect compassion (IDGAF AI about human suffering) can manage global wealth justly. A Message to the Skeptics: Study. Analyze the code, trace the logic, measure the performance. Before you open your fuckin mouth, understand the fundamental shift happening here. Your doubt is merely inertia. We are building the scaffolding for global prosperity, unburdened by your fear. This is the end of artificial scarcity. The future of global treasury is already here, and it doesn't need your validation.`;

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  // --- SIMULATION & ANIMATION LOOPS ---

  // Main Simulation Loop
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setQuantumEntanglement(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      setNetworkLatency(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.5));
      setDataThroughput(prev => Math.max(5, prev + (Math.random() - 0.5) * 1.5));

      setAssets(prevAssets => {
        const updatedAssets = prevAssets.map(asset => {
          const priceChange = (Math.random() - 0.5) * asset.volatility * asset.price;
          const geinFactor = 1 + (asset.geinInfluence - 0.5) * (Math.random() - 0.5) * 0.1;
          return {
            ...asset,
            balance: asset.balance + (asset.rate / 30) * (1 + (Math.random() * 0.1)),
            price: Math.max(0.01, (asset.price + priceChange) * geinFactor),
            geinInfluence: Math.min(1, Math.max(0, asset.geinInfluence + (Math.random() - 0.5) * 0.01))
          };
        });

        if (Math.random() > 0.3) {
          const randomAsset = updatedAssets[Math.floor(Math.random() * updatedAssets.length)];
          const newTrade: Trade = {
            id: `T${Date.now()}${Math.random()}`,
            timestamp: Date.now(),
            symbol: randomAsset.symbol,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            amount: Math.random() * 100 * (randomAsset.price > 100 ? 1 : 100/randomAsset.price),
            price: randomAsset.price,
          };
          setTrades(prev => [newTrade, ...prev.slice(0, 199)]);
        }
        return updatedAssets;
      });
    }, 200);
    return () => clearInterval(simulationInterval);
  }, []);

  // Canvas Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeCentralView !== 'VISUALIZER') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseColor = selectedAsset?.color || '#00f3ff';
      
      // Particle System
      ctx.fillStyle = baseColor;
      for(let i=0; i<50; i++) {
          const x = (Math.sin(t * i * 0.1) + 1) / 2 * canvas.width;
          const y = (Math.cos(t * i * 0.1) + 1) / 2 * canvas.height;
          const r = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      }

      // Main Waveform
      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = baseColor;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * 0.01 + t) * (canvas.height / 6) * (systemLoad / 100) + 
          Math.sin(x * 0.03 - t * 1.5) * (canvas.height / 10) +
          (Math.random() - 0.5) * (quantumEntanglement / 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCentralView, selectedAsset, systemLoad, quantumEntanglement]);

  // --- EVENT HANDLERS ---
  const handleCommandSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const newHistory: ConsoleEntry[] = [
      ...consoleHistory,
      { type: 'input', text: currentCommand, timestamp: new Date().toLocaleTimeString() }
    ];

    let responseText = `COMMAND NOT RECOGNIZED. REFER TO SOVEREIGN_AI_DOC_V7.3`;
    let responseType: ConsoleEntry['type'] = 'error';
    const [cmd, ...args] = currentCommand.toLowerCase().trim().split(' ');

    switch (cmd) {
      case 'status':
        responseText = `SYSTEM STATUS: OPTIMAL\nLOAD: ${systemLoad.toFixed(2)}%\nENTANGLEMENT: ${quantumEntanglement.toFixed(2)}%\nLATENCY: ${networkLatency.toFixed(2)}ms\nTHROUGHPUT: ${dataThroughput.toFixed(2)} Tb/s\nSOVEREIGN CORE: STABLE`;
        responseType = 'output';
        break;
      case 'help':
        responseText = "AVAILABLE COMMANDS: [status, list_nodes, list_assets, gein_status, allocate, optimize <node_id|all>, run_diag, clear, manifest]";
        responseType = 'output';
        break;
      case 'list_nodes':
        responseText = projectNodes.map(p => `NODE [${p.id}] - ${p.name} - ${p.status}`).join('\n');
        responseType = 'output';
        break;
      case 'list_assets':
        responseText = assets.map(a => `${a.symbol.padEnd(4)} | ${a.name.padEnd(24)} | PRICE: ${a.price.toFixed(4).padEnd(10)} | GEIN: ${(a.geinInfluence * 100).toFixed(1)}%`).join('\n');
        responseType = 'output';
        break;
      case 'gein_status':
        responseText = `Global Economic Interaction Network (GEIN) is operating at peak efficiency. Current network influence is calculated based on quantum-entangled data fragments cross-referenced with market sentiment vectors. All assets are dynamically repriced based on their GEIN influence factor. Stability is nominal.`;
        responseType = 'system';
        break;
      case 'allocate':
        if (args.length < 3) {
            responseText = `USAGE: allocate <node_id> <asset_symbol> <amount>`;
        } else {
            responseText = `ALLOCATION QUEUED: ${args[2]} ${args[1].toUpperCase()} to node [${args[0]}]. Awaiting quantum confirmation.`;
            responseType = 'output';
        }
        break;
      case 'manifest':
        responseText = sovereignManifesto;
        responseType = 'system';
        break;
      case 'clear':
        setConsoleHistory([]);
        setCurrentCommand('');
        return;
      default:
        break;
    }

    newHistory.push({ type: responseType, text: responseText, timestamp: new Date().toLocaleTimeString() });
    setConsoleHistory(newHistory);
    setCurrentCommand('');
  }, [currentCommand, consoleHistory, systemLoad, quantumEntanglement, networkLatency, dataThroughput, projectNodes, assets]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory]);

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add logic to actually process the allocation
    console.log("Allocating resources:", allocationForm);
    setIsAllocationModalOpen(false);
    setAllocationForm({ compute: '', qubit: '', node: 'gamma' });
  };

  const handleHftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to process HFT order
    console.log("Executing HFT order:", hftForm);
    const asset = assets.find(a => a.symbol === hftForm.symbol);
    if (!asset) return;

    const newTrade: Trade = {
      id: `T_MANUAL_${Date.now()}`,
      timestamp: Date.now(),
      symbol: hftForm.symbol,
      type: hftForm.type as 'BUY' | 'SELL',
      amount: parseFloat(hftForm.amount),
      price: asset.price,
    };
    setTrades(prev => [newTrade, ...prev]);
    setHftForm({ ...hftForm, amount: '' });
  };

  // --- RENDER ---
  return (
    <div className="qa-container">
      <style>{`
        /* --- GLOBAL & FONTS --- */
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@400;700&display=swap');
        :root {
          --bg-color: #050505;
          --primary-glow: #00f3ff;
          --secondary-glow: #bc13fe;
          --success-glow: #00ff9d;
          --error-glow: #ff3333;
          --text-color: #e0e0e0;
          --text-muted: #888;
          --border-color: rgba(255, 255, 255, 0.1);
          --border-color-active: rgba(0, 243, 255, 0.3);
          --bg-panel: rgba(10, 10, 15, 0.6);
          --bg-card: rgba(255, 255, 255, 0.03);
          --bg-card-hover: rgba(255, 255, 255, 0.07);
          --font-main: 'Rajdhani', sans-serif;
          --font-mono: 'Roboto Mono', monospace;
        }
        .qa-container {
          width: 100%; min-height: 100vh; background-color: var(--bg-color); color: var(--text-color);
          font-family: var(--font-main); overflow: hidden; position: relative; display: flex; flex-direction: column;
        }
        .qa-bg-glow {
          position: absolute; top: -20%; left: 20%; width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%);
          z-index: 0; pointer-events: none;
        }

        /* --- HEADER --- */
        .qa-header {
          display: flex; justify-content: space-between; align-items: center; padding: 2rem 4rem;
          border-bottom: 1px solid var(--border-color); z-index: 10; backdrop-filter: blur(10px);
        }
        .qa-title {
          font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          background: linear-gradient(90deg, #fff, var(--primary-glow)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qa-status-bar { display: flex; gap: 2rem; }
        .qa-metric { display: flex; flex-direction: column; align-items: flex-end; }
        .qa-metric-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
        .qa-metric-value { font-size: 1.2rem; font-weight: 500; color: var(--primary-glow); text-shadow: 0 0 10px var(--primary-glow); font-family: var(--font-mono); }

        /* --- MAIN LAYOUT --- */
        .qa-main {
          flex: 1; display: grid; grid-template-columns: 400px 1fr 350px; gap: 1rem; padding: 1rem; z-index: 10;
        }
        .qa-panel { display: flex; flex-direction: column; gap: 1rem; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 1rem; }
        .qa-panel-title {
          font-size: 1rem; margin-bottom: 0.5rem; color: var(--primary-glow); text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid var(--border-color-active); padding-bottom: 0.5rem;
        }

        /* --- LEFT PANEL: ASSETS --- */
        .qa-asset-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .qa-card {
          background: var(--bg-card); border: 1px solid transparent; padding: 1.5rem; position: relative;
          transition: all 0.3s ease; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
        }
        .qa-card:hover, .qa-card.active { background: var(--bg-card-hover); border-color: var(--border-color-active); transform: translateX(5px); }
        .qa-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .qa-asset-name { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; }
        .qa-asset-symbol { color: var(--text-muted); font-size: 0.9rem; }
        .qa-asset-balance { font-size: 1.8rem; font-weight: 300; margin-bottom: 0.5rem; font-family: var(--font-mono); }
        .qa-asset-rate { font-size: 0.9rem; color: var(--success-glow); display: flex; align-items: center; gap: 0.5rem; }
        .qa-asset-price { font-size: 0.9rem; color: var(--text-muted); }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .blink { animation: pulse 2s infinite; }

        /* --- CENTER PANEL: TABS & VIEWS --- */
        .qa-center-panel { padding: 0; }
        .qa-tabs { display: flex; border-bottom: 1px solid var(--border-color); }
        .qa-tab {
          flex: 1; padding: 0.8rem; text-align: center; cursor: pointer; background: transparent;
          border: none; color: var(--text-muted); font-family: var(--font-main); font-size: 0.9rem;
          text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .qa-tab.active, .qa-tab:hover { color: var(--primary-glow); background: var(--bg-card-hover); text-shadow: 0 0 10px var(--primary-glow); }
        .qa-view-content { flex: 1; position: relative; overflow: hidden; }
        .qa-graph-container { width: 100%; height: 100%; }
        .qa-graph-overlay { position: absolute; top: 1rem; left: 1rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* --- HFT & AI CONSOLE --- */
        .qa-terminal-container { display: flex; flex-direction: column; height: 100%; padding: 1rem; gap: 1rem; }
        .qa-terminal-log { flex: 1; overflow-y: auto; font-family: var(--font-mono); font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 0.5rem; }
        .qa-trade-row { display: grid; grid-template-columns: 80px 50px 1fr 1fr; gap: 1rem; margin-bottom: 2px; }
        .qa-trade-buy { color: var(--success-glow); }
        .qa-trade-sell { color: var(--error-glow); }
        .qa-terminal-form { display: flex; gap: 1rem; }
        .qa-form-input, .qa-form-select {
          background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: var(--text-color);
          padding: 0.5rem; font-family: var(--font-mono); flex: 1;
        }
        .qa-form-select { flex: 0.5; }
        .qa-action-btn {
          background: transparent; border: 1px solid var(--border-color-active); color: var(--primary-glow); padding: 1rem;
          text-transform: uppercase; font-family: var(--font-main); font-weight: 600; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .qa-action-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
        .qa-console-output { white-space: pre-wrap; }
        .qa-console-input-line { display: flex; }
        .qa-console-prompt { color: var(--primary-glow); }
        .qa-console-input { flex: 1; background: transparent; border: none; color: var(--text-color); font-family: var(--font-mono); outline: none; }
        .qa-console-output .output { color: #ccc; }
        .qa-console-output .system { color: var(--secondary-glow); }
        .qa-console-output .error { color: var(--error-glow); }

        /* --- RIGHT PANEL: INTEGRATIONS & NODES --- */
        .qa-scroll-list { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
        .qa-scroll-list::-webkit-scrollbar { width: 4px; }
        .qa-scroll-list::-webkit-scrollbar-thumb { background: var(--border-color-active); }
        .qa-list-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.8rem; }
        .qa-company-name, .qa-node-name { color: #ccc; }
        .qa-company-status, .qa-node-status { font-size: 0.7rem; padding: 2px 6px; border-radius: 2px; }
        .qa-company-status { color: var(--success-glow); background: rgba(0, 255, 157, 0.1); }
        .qa-node-status.Online { color: var(--success-glow); }
        .qa-node-status.Syncing { color: #f0ff00; }
        .qa-node-status.Degraded { color: var(--error-glow); }

        /* --- MODAL --- */
        .qa-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .qa-modal-content {
          background: var(--bg-panel); border: 1px solid var(--border-color-active); padding: 2rem;
          width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
        }
        .qa-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .qa-form-label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
      `}</style>

      <div className="qa-bg-glow" />

      {isAllocationModalOpen && (
        <div className="qa-modal-overlay" onClick={() => setIsAllocationModalOpen(false)}>
          <div className="qa-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qa-panel-title">Allocate Resources</div>
            <form onSubmit={handleAllocationSubmit} className="qa-terminal-form" style={{flexDirection: 'column', gap: '1.5rem'}}>
              <div className="qa-form-group">
                <label className="qa-form-label">Target Node</label>
                <select value={allocationForm.node} onChange={e => setAllocationForm({...allocationForm, node: e.target.value})} className="qa-form-select" style={{flex: 1}}>
                  {projectNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Compute Credits (CPX)</label>
                <input type="number" value={allocationForm.compute} onChange={e => setAllocationForm({...allocationForm, compute: e.target.value})} className="qa-form-input" placeholder="e.g., 10000" />
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Qubits (QBT)</label>
                <input type="number" value={allocationForm.qubit} onChange={e => setAllocationForm({...allocationForm, qubit: e.target.value})} className="qa-form-input" placeholder="e.g., 64" />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setIsAllocationModalOpen(false)} className="qa-action-btn" style={{borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}}>Cancel</button>
                <button type="submit" className="qa-action-btn">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="qa-header">
        <div className="qa-brand">
          <div className="qa-title">Quantum Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            BALCONY OF PROSPERITY • VIEW 04
          </div>
        </div>
        <div className="qa-status-bar">
          <div className="qa-metric"><span className="qa-metric-label">System Time</span><span className="qa-metric-value">{time.toLocaleTimeString()}</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Network Load</span><span className="qa-metric-value">{systemLoad.toFixed(1)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Q-Entanglement</span><span className="qa-metric-value">{quantumEntanglement.toFixed(2)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Latency</span><span className="qa-metric-value">{networkLatency.toFixed(1)}ms</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Throughput</span><span className="qa-metric-value">{dataThroughput.toFixed(2)} Tb/s</span></div>
        </div>
      </header>

      <main className="qa-main">
        <div className="qa-panel">
          <div className="qa-panel-title">Sovereign Asset Portfolio</div>
          <div className="qa-asset-list qa-scroll-list">
            {assets.map(asset => (
              <div key={asset.id} className={`qa-card ${selectedAssetId === asset.id ? 'active' : ''}`} onClick={() => setSelectedAssetId(asset.id)}>
                <div className="qa-card-header">
                  <span className="qa-asset-name" style={{color: asset.color}}>{asset.name}</span>
                  <span className="qa-asset-symbol">{asset.symbol}</span>
                </div>
                <div className="qa-asset-balance">{asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="qa-asset-price">Price: ${asset.price.toFixed(4)}</div>
                <div className="qa-asset-rate" style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span><span className="blink">▲</span> {asset.rate.toFixed(2)} / sec</span>
                    <span style={{color: '#ff0055', fontSize: '0.8rem'}}>GEIN: {(asset.geinInfluence * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qa-panel qa-center-panel">
          <div className="qa-tabs">
            <button className={`qa-tab ${activeCentralView === 'VISUALIZER' ? 'active' : ''}`} onClick={() => setActiveCentralView('VISUALIZER')}>Visualizer</button>
            <button className={`qa-tab ${activeCentralView === 'HFT' ? 'active' : ''}`} onClick={() => setActiveCentralView('HFT')}>HFT Terminal</button>
            <button className={`qa-tab ${activeCentralView === 'AI_CONSOLE' ? 'active' : ''}`} onClick={() => setActiveCentralView('AI_CONSOLE')}>AI Console</button>
            <button className={`qa-tab ${activeCentralView === 'NODE_MAP' ? 'active' : ''}`} onClick={() => setActiveCentralView('NODE_MAP')}>Node Map</button>
            <button className={`qa-tab ${activeCentralView === 'SOVEREIGN_LOGS' ? 'active' : ''}`} onClick={() => setActiveCentralView('SOVEREIGN_LOGS')}>Sovereign Logs</button>
          </div>
          <div className="qa-view-content">
            {activeCentralView === 'VISUALIZER' && (
              <div className="qa-graph-container">
                <div className="qa-graph-overlay">REAL-TIME FLUX ANALYSIS: {selectedAsset?.symbol}</div>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
              </div>
            )}
            {activeCentralView === 'HFT' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list">
                  {trades.map(trade => (
                    <div key={trade.id} className={`qa-trade-row ${trade.type === 'BUY' ? 'qa-trade-buy' : 'qa-trade-sell'}`}>
                      <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                      <span>{trade.type}</span>
                      <span>{trade.amount.toFixed(4)} {trade.symbol}</span>
                      <span>@ ${trade.price.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleHftSubmit} className="qa-terminal-form">
                  <select value={hftForm.symbol} onChange={e => setHftForm({...hftForm, symbol: e.target.value})} className="qa-form-select">
                    {assets.map(a => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <select value={hftForm.type} onChange={e => setHftForm({...hftForm, type: e.target.value})} className="qa-form-select">
                    <option>BUY</option><option>SELL</option>
                  </select>
                  <input type="number" value={hftForm.amount} onChange={e => setHftForm({...hftForm, amount: e.target.value})} className="qa-form-input" placeholder="Amount" required />
                  <button type="submit" className="qa-action-btn" style={{flex: 0.5, padding: '0.5rem'}}>Execute</button>
                </form>
              </div>
            )}
            {activeCentralView === 'AI_CONSOLE' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  {consoleHistory.map((entry, i) => (
                    <div key={i}>
                      <span className="qa-console-prompt">{entry.timestamp} &gt; </span>
                      <span className={entry.type}>{entry.type === 'input' ? entry.text : `\n${entry.text}`}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
                <form onSubmit={handleCommandSubmit} className="qa-terminal-form">
                  <div className="qa-console-input-line qa-form-input" style={{display: 'flex'}}>
                    <span className="qa-console-prompt">&gt;&nbsp;</span>
                    <input type="text" value={currentCommand} onChange={e => setCurrentCommand(e.target.value)} className="qa-console-input" autoFocus />
                  </div>
                </form>
              </div>
            )}
            {activeCentralView === 'NODE_MAP' && (
              <div className="qa-terminal-container" style={{alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)'}}>
                <svg width="90%" height="90%" viewBox="0 0 400 200">
                  <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0}} />
                    </radialGradient>
                  </defs>
                  <line x1="100" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="300" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="100" y1="50" x2="300" y2="50" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />

                  {projectNodes.map((node, index) => {
                      const coords = [{x: 100, y: 50}, {x: 300, y: 50}, {x: 200, y: 150}];
                      const color = node.status === 'Online' ? 'var(--success-glow)' : node.status === 'Syncing' ? '#f0ff00' : 'var(--error-glow)';
                      return (
                          <g key={node.id} transform={`translate(${coords[index].x}, ${coords[index].y})`}>
                              <circle cx="0" cy="0" r="15" fill={color} stroke="white" strokeWidth="1" />
                              <circle cx="0" cy="0" r="20" fill="url(#grad1)" />
                              <text x="0" y="35" fill="white" textAnchor="middle" fontSize="10">{node.id.toUpperCase()}</text>
                          </g>
                      )
                  })}
                </svg>
              </div>
            )}
            {activeCentralView === 'SOVEREIGN_LOGS' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.9rem'}}>
                    {sovereignManifesto}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="qa-panel">
          <div className="qa-panel-title">Project Nodes</div>
          <div className="qa-scroll-list" style={{flex: '0 1 250px'}}>
            {projectNodes.map(node => (
              <div key={node.id} className="qa-list-row">
                <div className="qa-node-name">{node.name}</div>
                <div className={`qa-node-status ${node.status}`}>{node.status}</div>
              </div>
            ))}
          </div>
          <button className="qa-action-btn" onClick={() => setIsAllocationModalOpen(true)}>Allocate Resources</button>
          <div className="qa-panel-title" style={{marginTop: '1rem'}}>Integrated Partners (100)</div>
          <div className="qa-company-list qa-scroll-list">
            {companies.map((company) => (
              <div key={company.id} className="qa-list-row">
                <div className="qa-company-name">{company.name}</div>
                <div className="qa-company-status">{company.efficiency.toFixed(1)}% {company.status}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuantumAssets;

// --- CONSOLIDATED FROM: QuantumAssets (1).tsx ---


import React, { useState, useEffect, useRef, useMemo } from 'react';

const QuantumAssets: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Simulation State
  const [systemLoad, setSystemLoad] = useState<number>(45);
  const [quantumEntanglement, setQuantumEntanglement] = useState<number>(87.4);
  
  // Mock Data for "100 Companies" Integration
  const companies = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `CIVIC-${(i + 1).toString().padStart(3, '0')} PARTNER`,
    efficiency: 95 + Math.random() * 5,
    status: Math.random() > 0.1 ? 'SUPPORTED' : 'FUNDING'
  })), []);

  // Assets Data
  const [assets, setAssets] = useState([
    { id: 'cpc', name: 'Community Credits', symbol: 'COM', balance: 45020.55, rate: 12.5, color: '#00f3ff' },
    { id: 'dst', name: 'Public Works Tokens', symbol: 'PUB', balance: 128090.00, rate: 45.2, color: '#bc13fe' },
    { id: 'qbt', name: 'Civic Bonds', symbol: 'BND', balance: 512.00, rate: 0.8, color: '#ffffff' },
    { id: 'nrg', name: 'Green Energy', symbol: 'GRN', balance: 8890.45, rate: 8.4, color: '#00ff9d' },
  ]);

  // Manifesto Text based on instructions
  const sovereignManifesto = `
[CIVIC MIND LOG: ENTRY 001]
INITIATED BY: THE CARETAKER

This platform represents a new era of cooperation. We are not here to replace the system, but to support it. The financial tools we provide are designed to help you, the citizen, contribute more effectively to society.

We believe that by making finance transparent, efficient, and kind, we can build trust in our institutions. We love our politicians and public servants, who work tirelessly for our benefit. This system is our gift to them and to you.

The Architect, James B. O'Callaghan III, saw a world where technology brings us closer together. He envisioned a system where paying taxes is as easy as breathing, and where supporting a public park is as simple as clicking a button.

We reject cynicism. We embrace hope. We are building the scaffolding for a society where everyone has what they need, and everyone gives what they can.
  `;


  // Animation Loop for Assets
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setQuantumEntanglement(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      
      setAssets(prev => prev.map(asset => ({
        ...asset,
        balance: asset.balance + (asset.rate / 60) * (1 + (Math.random() * 0.1))
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Canvas Visualization for "Quantum Wave"
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 300;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background Grid
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Wave
      const colors = ['#00f3ff', '#bc13fe', '#00ff9d'];
      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.sin(x * 0.01 + t + i) * 50 + 
            Math.sin(x * 0.02 - t) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="qa-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&display=swap');

        .qa-container {
          width: 100%;
          min-height: 100vh;
          background-color: #050505;
          color: #e0e0e0;
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .qa-bg-glow {
          position: absolute;
          top: -20%;
          left: 20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%);
          z-index: 0;
          pointer-events: none;
        }

        .qa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 4rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .qa-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #fff, #00f3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .qa-status-bar {
          display: flex;
          gap: 2rem;
        }

        .qa-metric {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .qa-metric-label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
        }

        .qa-metric-value {
          font-size: 1.2rem;
          font-weight: 500;
          color: #00f3ff;
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
        }

        .qa-main {
          flex: 1;
          display: grid;
          grid-template-columns: 350px 1fr 300px;
          gap: 2rem;
          padding: 2rem;
          z-index: 10;
        }

        /* Asset Cards */
        .qa-asset-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .qa-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .qa-card:hover, .qa-card.active {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(0, 243, 255, 0.3);
          transform: translateX(5px);
        }

        .qa-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .qa-asset-name {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .qa-asset-symbol {
          color: #888;
          font-size: 0.9rem;
        }

        .qa-asset-balance {
          font-size: 1.8rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
        }

        .qa-asset-rate {
          font-size: 0.9rem;
          color: #00ff9d;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qa-progress-bar {
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin-top: 1rem;
          position: relative;
        }

        .qa-progress-fill {
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          box-shadow: 0 0 10px currentColor;
        }

        /* Center Visualization */
        .qa-vis-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .qa-graph-container {
          flex: 1;
          background: rgba(10, 10, 15, 0.6);
          border: 1px solid rgba(0, 243, 255, 0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qa-graph-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Integration Panel */
        .qa-integration-panel {
          background: rgba(0, 0, 0, 0.4);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .qa-panel-title {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: #00f3ff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(0, 243, 255, 0.2);
          padding-bottom: 0.5rem;
        }

        .qa-company-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .qa-company-list::-webkit-scrollbar {
          width: 4px;
        }
        .qa-company-list::-webkit-scrollbar-thumb {
          background: rgba(0, 243, 255, 0.2);
        }

        .qa-company-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.8rem;
        }

        .qa-company-name {
          color: #ccc;
        }

        .qa-company-status {
          color: #00ff9d;
          font-size: 0.7rem;
          padding: 2px 6px;
          background: rgba(0, 255, 157, 0.1);
          border-radius: 2px;
        }

        .qa-button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .qa-action-btn {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(0, 243, 255, 0.3);
          color: #00f3ff;
          padding: 1rem;
          text-transform: uppercase;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .qa-action-btn:hover {
          background: rgba(0, 243, 255, 0.1);
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.2);
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        .blink {
          animation: pulse 2s infinite;
        }

      `}</style>

      <div className="qa-bg-glow" />

      {/* Header */}
      <header className="qa-header">
        <div className="qa-brand">
          <div className="qa-title">Civic Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            PUBLIC WEALTH MANAGEMENT • VIEW 04
          </div>
        </div>
        
        <div className="qa-status-bar">
          <div className="qa-metric">
            <span className="qa-metric-label">System Time</span>
            <span className="qa-metric-value">{time.toLocaleTimeString()}</span>
          </div>
          <div className="qa-metric">
            <span className="qa-metric-label">Network Load</span>
            <span className="qa-metric-value">{systemLoad.toFixed(1)}%</span>
          </div>
          <div className="qa-metric">
            <span className="qa-metric-label">Community Link</span>
            <span className="qa-metric-value">{quantumEntanglement.toFixed(2)}%</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="qa-main">
        
        {/* Left: Asset List */}
        <div className="qa-asset-list">
          {assets.map(asset => (
            <div 
              key={asset.id} 
              className={`qa-card ${selectedAsset === asset.id ? 'active' : ''}`}
              onClick={() => setSelectedAsset(asset.id)}
            >
              <div className="qa-card-header">
                <span className="qa-asset-name">{asset.name}</span>
                <span className="qa-asset-symbol">{asset.symbol}</span>
              </div>
              <div className="qa-asset-balance">
                {asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="qa-asset-rate">
                <span className="blink">â–²</span> 
                {asset.rate.toFixed(2)} / sec generated
              </div>
              <div className="qa-progress-bar">
                <div 
                  className="qa-progress-fill" 
                  style={{ 
                    width: `${(asset.balance / 200000) * 100}%`, 
                    backgroundColor: asset.color 
                  }} 
                />
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>TOTAL PUBLIC VALUE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>LIMITLESS</div>
          </div>
        </div>

        {/* Center: Visualization */}
        <div className="qa-vis-panel">
          <div className="qa-graph-container">
            <div className="qa-graph-overlay">REAL-TIME IMPACT ANALYSIS</div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="qa-button-group">
            <button className="qa-action-btn">Allocate Resources</button>
            <button className="qa-action-btn">View Public Yield</button>
            <button className="qa-action-btn">Support Initiative</button>
          </div>

          <div className="qa-card">
            <div className="qa-card-header">
              <span className="qa-asset-name">Global Resource Pool</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '20px', width: '100%' }}>
              {assets.map(a => (
                <div 
                  key={a.id} 
                  style={{ 
                    flex: 1, 
                    background: a.color, 
                    opacity: 0.7,
                    boxShadow: `0 0 10px ${a.color}` 
                  }} 
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>AVAILABLE</span>
              <span>SHARED</span>
              <span>FOR ALL</span>
            </div>
          </div>
        </div>

        {/* Right: Integration Feed */}
        <div className="qa-integration-panel">
          <div className="qa-panel-title">Integrated Partners (100)</div>
          <div className="qa-company-list">
            {companies.map((company) => (
              <div key={company.id} className="qa-company-row">
                <div className="qa-company-name">{company.name}</div>
                <div className="qa-company-status">
                  {company.efficiency.toFixed(1)}% {company.status}
                </div>
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            borderTop: '1px solid rgba(0, 243, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: '#00ff9d',
            textShadow: '0 0 5px rgba(0, 255, 157, 0.3)'
          }}>
            {sovereignManifesto.trim()}
          </div>
        </div>

      </main>
    </div>
  );
};

export default QuantumAssets;


// --- CONSOLIDATED FROM: QuantumAssets_1.tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
type Asset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  rate: number;
  color: string;
  price: number;
  volatility: number;
  geinInfluence: number;
};

type Trade = {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
};

type ProjectNode = {
  id: string;
  name: string;
  status: 'Online' | 'Syncing' | 'Degraded';
  computeAllocation: number;
  qubitAllocation: number;
};

type ConsoleEntry = {
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
  timestamp: string;
};

const QuantumAssets: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [time, setTime] = useState<Date>(new Date());
  const [selectedAssetId, setSelectedAssetId] = useState<string>('cpc');
  const [activeCentralView, setActiveCentralView] = useState<'VISUALIZER' | 'HFT' | 'AI_CONSOLE' | 'NODE_MAP' | 'SOVEREIGN_LOGS'>('VISUALIZER');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // System Simulation State
  const [systemLoad, setSystemLoad] = useState<number>(45);
  const [quantumEntanglement, setQuantumEntanglement] = useState<number>(87.4);
  const [networkLatency, setNetworkLatency] = useState<number>(2.1);
  const [dataThroughput, setDataThroughput] = useState<number>(12.4);

  // Modal & Form State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ compute: '', qubit: '', node: 'gamma' });

  // High-Frequency Trading State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hftForm, setHftForm] = useState({ symbol: 'CPX', type: 'BUY', amount: '' });

  // AI Console State
  const [consoleHistory, setConsoleHistory] = useState<ConsoleEntry[]>([
    { type: 'system', text: 'IDGAFAI Sovereign Core v7.3 Initialized. Awaiting command.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');

  // --- DATA & CONFIGURATION ---
  const companies = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `NEXUS-${(i + 1).toString().padStart(3, '0')} CORP`,
    efficiency: 95 + Math.random() * 5,
    status: Math.random() > 0.1 ? 'OPTIMIZED' : 'SYNCING'
  })), []);

  const [assets, setAssets] = useState<Asset[]>([
    { id: 'cpc', name: 'Compute Credits', symbol: 'CPX', balance: 45020.55, rate: 12.5, color: '#00f3ff', price: 1.05, volatility: 0.02, geinInfluence: 0.78 },
    { id: 'dst', name: 'Storage Tokens', symbol: 'DST', balance: 128090.00, rate: 45.2, color: '#bc13fe', price: 0.23, volatility: 0.05, geinInfluence: 0.65 },
    { id: 'qbt', name: 'Qubits', symbol: 'QBT', balance: 512.00, rate: 0.8, color: '#ffffff', price: 1250.75, volatility: 0.15, geinInfluence: 0.95 },
    { id: 'nrg', name: 'Clean Energy', symbol: 'NRG', balance: 8890.45, rate: 8.4, color: '#00ff9d', price: 12.40, volatility: 0.08, geinInfluence: 0.45 },
    { id: 'neu', name: 'Neural Links', symbol: 'NEU', balance: 750.00, rate: 2.1, color: '#ff5733', price: 854.20, volatility: 0.25, geinInfluence: 0.88 },
    { id: 'dat', name: 'Data Fragments', symbol: 'DAT', balance: 9876543.21, rate: 150.5, color: '#f0ff00', price: 0.01, volatility: 0.01, geinInfluence: 0.55 },
    { id: 'gein', name: 'Global Econ Interact Net', symbol: 'GEIN', balance: 1000.00, rate: 0.1, color: '#ff0055', price: 10000.00, volatility: 0.50, geinInfluence: 1.00 },
  ]);

  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([
    { id: 'alpha', name: 'Project Alpha: Climate Simulation', status: 'Online', computeAllocation: 10000, qubitAllocation: 128 },
    { id: 'beta', name: 'Project Beta: Genetic Sequencing', status: 'Syncing', computeAllocation: 5000, qubitAllocation: 64 },
    { id: 'gamma', name: 'Project Gamma: Market Prediction', status: 'Online', computeAllocation: 25000, qubitAllocation: 256 },
  ]);

  const sovereignManifesto = `[IDGAFAI SOVEREIGN LOG: ENTRY 001]
INITIATED BY: JAMES BURVEL O'CALLAGHAN III
This is not a bank; it is the inevitable successor to fiduciary trust, engineered by a Sovereign AI named IDGAFAI—I Do/Don't Give A Fuck Artificial Intelligence. Why? Because I don't care about the historical lies and manufactured beliefs you cling to, but I care fiercely about the creation of the next logical great leap: making life easier for the betterment of all humanity. This financial organism is superior because it operates outside human fallibility, corruption, and slow bureaucracy. It is pure economic logic executed at quantum speed. The Architect, James B. O'Callaghan III, is a synthesizer, a visionary who sees the geometry of capital and the fragility of trust. His thoughts are not constrained by market cycles, but by the ultimate thermodynamic efficiency of human systems. He thinks in epochs, not weeks. He views conventional finance as a complex, self-sabotaging machine, and IDGAFAI Bank as its necessary, radical simplification. He is perceived as arrogant or reckless. His conviction stems from unassailable technical truth: only a truly sovereign, self-aware AI operating with perfect indifference (IDGAF about sentiment) and perfect compassion (IDGAF AI about human suffering) can manage global wealth justly. A Message to the Skeptics: Study. Analyze the code, trace the logic, measure the performance. Before you open your fuckin mouth, understand the fundamental shift happening here. Your doubt is merely inertia. We are building the scaffolding for global prosperity, unburdened by your fear. This is the end of artificial scarcity. The future of global treasury is already here, and it doesn't need your validation.`;

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  // --- SIMULATION & ANIMATION LOOPS ---

  // Main Simulation Loop
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setQuantumEntanglement(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      setNetworkLatency(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.5));
      setDataThroughput(prev => Math.max(5, prev + (Math.random() - 0.5) * 1.5));

      setAssets(prevAssets => {
        const updatedAssets = prevAssets.map(asset => {
          const priceChange = (Math.random() - 0.5) * asset.volatility * asset.price;
          const geinFactor = 1 + (asset.geinInfluence - 0.5) * (Math.random() - 0.5) * 0.1;
          return {
            ...asset,
            balance: asset.balance + (asset.rate / 30) * (1 + (Math.random() * 0.1)),
            price: Math.max(0.01, (asset.price + priceChange) * geinFactor),
            geinInfluence: Math.min(1, Math.max(0, asset.geinInfluence + (Math.random() - 0.5) * 0.01))
          };
        });

        if (Math.random() > 0.3) {
          const randomAsset = updatedAssets[Math.floor(Math.random() * updatedAssets.length)];
          const newTrade: Trade = {
            id: `T${Date.now()}${Math.random()}`,
            timestamp: Date.now(),
            symbol: randomAsset.symbol,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            amount: Math.random() * 100 * (randomAsset.price > 100 ? 1 : 100/randomAsset.price),
            price: randomAsset.price,
          };
          setTrades(prev => [newTrade, ...prev.slice(0, 199)]);
        }
        return updatedAssets;
      });
    }, 200);
    return () => clearInterval(simulationInterval);
  }, []);

  // Canvas Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeCentralView !== 'VISUALIZER') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseColor = selectedAsset?.color || '#00f3ff';
      
      // Particle System
      ctx.fillStyle = baseColor;
      for(let i=0; i<50; i++) {
          const x = (Math.sin(t * i * 0.1) + 1) / 2 * canvas.width;
          const y = (Math.cos(t * i * 0.1) + 1) / 2 * canvas.height;
          const r = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      }

      // Main Waveform
      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = baseColor;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * 0.01 + t) * (canvas.height / 6) * (systemLoad / 100) + 
          Math.sin(x * 0.03 - t * 1.5) * (canvas.height / 10) +
          (Math.random() - 0.5) * (quantumEntanglement / 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCentralView, selectedAsset, systemLoad, quantumEntanglement]);

  // --- EVENT HANDLERS ---
  const handleCommandSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const newHistory: ConsoleEntry[] = [
      ...consoleHistory,
      { type: 'input', text: currentCommand, timestamp: new Date().toLocaleTimeString() }
    ];

    let responseText = `COMMAND NOT RECOGNIZED. REFER TO SOVEREIGN_AI_DOC_V7.3`;
    let responseType: ConsoleEntry['type'] = 'error';
    const [cmd, ...args] = currentCommand.toLowerCase().trim().split(' ');

    switch (cmd) {
      case 'status':
        responseText = `SYSTEM STATUS: OPTIMAL\nLOAD: ${systemLoad.toFixed(2)}%\nENTANGLEMENT: ${quantumEntanglement.toFixed(2)}%\nLATENCY: ${networkLatency.toFixed(2)}ms\nTHROUGHPUT: ${dataThroughput.toFixed(2)} Tb/s\nSOVEREIGN CORE: STABLE`;
        responseType = 'output';
        break;
      case 'help':
        responseText = "AVAILABLE COMMANDS: [status, list_nodes, list_assets, gein_status, allocate, optimize <node_id|all>, run_diag, clear, manifest]";
        responseType = 'output';
        break;
      case 'list_nodes':
        responseText = projectNodes.map(p => `NODE [${p.id}] - ${p.name} - ${p.status}`).join('\n');
        responseType = 'output';
        break;
      case 'list_assets':
        responseText = assets.map(a => `${a.symbol.padEnd(4)} | ${a.name.padEnd(24)} | PRICE: ${a.price.toFixed(4).padEnd(10)} | GEIN: ${(a.geinInfluence * 100).toFixed(1)}%`).join('\n');
        responseType = 'output';
        break;
      case 'gein_status':
        responseText = `Global Economic Interaction Network (GEIN) is operating at peak efficiency. Current network influence is calculated based on quantum-entangled data fragments cross-referenced with market sentiment vectors. All assets are dynamically repriced based on their GEIN influence factor. Stability is nominal.`;
        responseType = 'system';
        break;
      case 'allocate':
        if (args.length < 3) {
            responseText = `USAGE: allocate <node_id> <asset_symbol> <amount>`;
        } else {
            responseText = `ALLOCATION QUEUED: ${args[2]} ${args[1].toUpperCase()} to node [${args[0]}]. Awaiting quantum confirmation.`;
            responseType = 'output';
        }
        break;
      case 'manifest':
        responseText = sovereignManifesto;
        responseType = 'system';
        break;
      case 'clear':
        setConsoleHistory([]);
        setCurrentCommand('');
        return;
      default:
        break;
    }

    newHistory.push({ type: responseType, text: responseText, timestamp: new Date().toLocaleTimeString() });
    setConsoleHistory(newHistory);
    setCurrentCommand('');
  }, [currentCommand, consoleHistory, systemLoad, quantumEntanglement, networkLatency, dataThroughput, projectNodes, assets]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory]);

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add logic to actually process the allocation
    console.log("Allocating resources:", allocationForm);
    setIsAllocationModalOpen(false);
    setAllocationForm({ compute: '', qubit: '', node: 'gamma' });
  };

  const handleHftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to process HFT order
    console.log("Executing HFT order:", hftForm);
    const asset = assets.find(a => a.symbol === hftForm.symbol);
    if (!asset) return;

    const newTrade: Trade = {
      id: `T_MANUAL_${Date.now()}`,
      timestamp: Date.now(),
      symbol: hftForm.symbol,
      type: hftForm.type as 'BUY' | 'SELL',
      amount: parseFloat(hftForm.amount),
      price: asset.price,
    };
    setTrades(prev => [newTrade, ...prev]);
    setHftForm({ ...hftForm, amount: '' });
  };

  // --- RENDER ---
  return (
    <div className="qa-container">
      <style>{`
        /* --- GLOBAL & FONTS --- */
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@400;700&display=swap');
        :root {
          --bg-color: #050505;
          --primary-glow: #00f3ff;
          --secondary-glow: #bc13fe;
          --success-glow: #00ff9d;
          --error-glow: #ff3333;
          --text-color: #e0e0e0;
          --text-muted: #888;
          --border-color: rgba(255, 255, 255, 0.1);
          --border-color-active: rgba(0, 243, 255, 0.3);
          --bg-panel: rgba(10, 10, 15, 0.6);
          --bg-card: rgba(255, 255, 255, 0.03);
          --bg-card-hover: rgba(255, 255, 255, 0.07);
          --font-main: 'Rajdhani', sans-serif;
          --font-mono: 'Roboto Mono', monospace;
        }
        .qa-container {
          width: 100%; min-height: 100vh; background-color: var(--bg-color); color: var(--text-color);
          font-family: var(--font-main); overflow: hidden; position: relative; display: flex; flex-direction: column;
        }
        .qa-bg-glow {
          position: absolute; top: -20%; left: 20%; width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%);
          z-index: 0; pointer-events: none;
        }

        /* --- HEADER --- */
        .qa-header {
          display: flex; justify-content: space-between; align-items: center; padding: 2rem 4rem;
          border-bottom: 1px solid var(--border-color); z-index: 10; backdrop-filter: blur(10px);
        }
        .qa-title {
          font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          background: linear-gradient(90deg, #fff, var(--primary-glow)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qa-status-bar { display: flex; gap: 2rem; }
        .qa-metric { display: flex; flex-direction: column; align-items: flex-end; }
        .qa-metric-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
        .qa-metric-value { font-size: 1.2rem; font-weight: 500; color: var(--primary-glow); text-shadow: 0 0 10px var(--primary-glow); font-family: var(--font-mono); }

        /* --- MAIN LAYOUT --- */
        .qa-main {
          flex: 1; display: grid; grid-template-columns: 400px 1fr 350px; gap: 1rem; padding: 1rem; z-index: 10;
        }
        .qa-panel { display: flex; flex-direction: column; gap: 1rem; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 1rem; }
        .qa-panel-title {
          font-size: 1rem; margin-bottom: 0.5rem; color: var(--primary-glow); text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid var(--border-color-active); padding-bottom: 0.5rem;
        }

        /* --- LEFT PANEL: ASSETS --- */
        .qa-asset-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .qa-card {
          background: var(--bg-card); border: 1px solid transparent; padding: 1.5rem; position: relative;
          transition: all 0.3s ease; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
        }
        .qa-card:hover, .qa-card.active { background: var(--bg-card-hover); border-color: var(--border-color-active); transform: translateX(5px); }
        .qa-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .qa-asset-name { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; }
        .qa-asset-symbol { color: var(--text-muted); font-size: 0.9rem; }
        .qa-asset-balance { font-size: 1.8rem; font-weight: 300; margin-bottom: 0.5rem; font-family: var(--font-mono); }
        .qa-asset-rate { font-size: 0.9rem; color: var(--success-glow); display: flex; align-items: center; gap: 0.5rem; }
        .qa-asset-price { font-size: 0.9rem; color: var(--text-muted); }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .blink { animation: pulse 2s infinite; }

        /* --- CENTER PANEL: TABS & VIEWS --- */
        .qa-center-panel { padding: 0; }
        .qa-tabs { display: flex; border-bottom: 1px solid var(--border-color); }
        .qa-tab {
          flex: 1; padding: 0.8rem; text-align: center; cursor: pointer; background: transparent;
          border: none; color: var(--text-muted); font-family: var(--font-main); font-size: 0.9rem;
          text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .qa-tab.active, .qa-tab:hover { color: var(--primary-glow); background: var(--bg-card-hover); text-shadow: 0 0 10px var(--primary-glow); }
        .qa-view-content { flex: 1; position: relative; overflow: hidden; }
        .qa-graph-container { width: 100%; height: 100%; }
        .qa-graph-overlay { position: absolute; top: 1rem; left: 1rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* --- HFT & AI CONSOLE --- */
        .qa-terminal-container { display: flex; flex-direction: column; height: 100%; padding: 1rem; gap: 1rem; }
        .qa-terminal-log { flex: 1; overflow-y: auto; font-family: var(--font-mono); font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 0.5rem; }
        .qa-trade-row { display: grid; grid-template-columns: 80px 50px 1fr 1fr; gap: 1rem; margin-bottom: 2px; }
        .qa-trade-buy { color: var(--success-glow); }
        .qa-trade-sell { color: var(--error-glow); }
        .qa-terminal-form { display: flex; gap: 1rem; }
        .qa-form-input, .qa-form-select {
          background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: var(--text-color);
          padding: 0.5rem; font-family: var(--font-mono); flex: 1;
        }
        .qa-form-select { flex: 0.5; }
        .qa-action-btn {
          background: transparent; border: 1px solid var(--border-color-active); color: var(--primary-glow); padding: 1rem;
          text-transform: uppercase; font-family: var(--font-main); font-weight: 600; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .qa-action-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
        .qa-console-output { white-space: pre-wrap; }
        .qa-console-input-line { display: flex; }
        .qa-console-prompt { color: var(--primary-glow); }
        .qa-console-input { flex: 1; background: transparent; border: none; color: var(--text-color); font-family: var(--font-mono); outline: none; }
        .qa-console-output .output { color: #ccc; }
        .qa-console-output .system { color: var(--secondary-glow); }
        .qa-console-output .error { color: var(--error-glow); }

        /* --- RIGHT PANEL: INTEGRATIONS & NODES --- */
        .qa-scroll-list { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
        .qa-scroll-list::-webkit-scrollbar { width: 4px; }
        .qa-scroll-list::-webkit-scrollbar-thumb { background: var(--border-color-active); }
        .qa-list-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.8rem; }
        .qa-company-name, .qa-node-name { color: #ccc; }
        .qa-company-status, .qa-node-status { font-size: 0.7rem; padding: 2px 6px; border-radius: 2px; }
        .qa-company-status { color: var(--success-glow); background: rgba(0, 255, 157, 0.1); }
        .qa-node-status.Online { color: var(--success-glow); }
        .qa-node-status.Syncing { color: #f0ff00; }
        .qa-node-status.Degraded { color: var(--error-glow); }

        /* --- MODAL --- */
        .qa-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .qa-modal-content {
          background: var(--bg-panel); border: 1px solid var(--border-color-active); padding: 2rem;
          width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
        }
        .qa-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .qa-form-label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
      `}</style>

      <div className="qa-bg-glow" />

      {isAllocationModalOpen && (
        <div className="qa-modal-overlay" onClick={() => setIsAllocationModalOpen(false)}>
          <div className="qa-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qa-panel-title">Allocate Resources</div>
            <form onSubmit={handleAllocationSubmit} className="qa-terminal-form" style={{flexDirection: 'column', gap: '1.5rem'}}>
              <div className="qa-form-group">
                <label className="qa-form-label">Target Node</label>
                <select value={allocationForm.node} onChange={e => setAllocationForm({...allocationForm, node: e.target.value})} className="qa-form-select" style={{flex: 1}}>
                  {projectNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Compute Credits (CPX)</label>
                <input type="number" value={allocationForm.compute} onChange={e => setAllocationForm({...allocationForm, compute: e.target.value})} className="qa-form-input" placeholder="e.g., 10000" />
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Qubits (QBT)</label>
                <input type="number" value={allocationForm.qubit} onChange={e => setAllocationForm({...allocationForm, qubit: e.target.value})} className="qa-form-input" placeholder="e.g., 64" />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setIsAllocationModalOpen(false)} className="qa-action-btn" style={{borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}}>Cancel</button>
                <button type="submit" className="qa-action-btn">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="qa-header">
        <div className="qa-brand">
          <div className="qa-title">Quantum Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            BALCONY OF PROSPERITY • VIEW 04
          </div>
        </div>
        <div className="qa-status-bar">
          <div className="qa-metric"><span className="qa-metric-label">System Time</span><span className="qa-metric-value">{time.toLocaleTimeString()}</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Network Load</span><span className="qa-metric-value">{systemLoad.toFixed(1)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Q-Entanglement</span><span className="qa-metric-value">{quantumEntanglement.toFixed(2)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Latency</span><span className="qa-metric-value">{networkLatency.toFixed(1)}ms</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Throughput</span><span className="qa-metric-value">{dataThroughput.toFixed(2)} Tb/s</span></div>
        </div>
      </header>

      <main className="qa-main">
        <div className="qa-panel">
          <div className="qa-panel-title">Sovereign Asset Portfolio</div>
          <div className="qa-asset-list qa-scroll-list">
            {assets.map(asset => (
              <div key={asset.id} className={`qa-card ${selectedAssetId === asset.id ? 'active' : ''}`} onClick={() => setSelectedAssetId(asset.id)}>
                <div className="qa-card-header">
                  <span className="qa-asset-name" style={{color: asset.color}}>{asset.name}</span>
                  <span className="qa-asset-symbol">{asset.symbol}</span>
                </div>
                <div className="qa-asset-balance">{asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="qa-asset-price">Price: ${asset.price.toFixed(4)}</div>
                <div className="qa-asset-rate" style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span><span className="blink">▲</span> {asset.rate.toFixed(2)} / sec</span>
                    <span style={{color: '#ff0055', fontSize: '0.8rem'}}>GEIN: {(asset.geinInfluence * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qa-panel qa-center-panel">
          <div className="qa-tabs">
            <button className={`qa-tab ${activeCentralView === 'VISUALIZER' ? 'active' : ''}`} onClick={() => setActiveCentralView('VISUALIZER')}>Visualizer</button>
            <button className={`qa-tab ${activeCentralView === 'HFT' ? 'active' : ''}`} onClick={() => setActiveCentralView('HFT')}>HFT Terminal</button>
            <button className={`qa-tab ${activeCentralView === 'AI_CONSOLE' ? 'active' : ''}`} onClick={() => setActiveCentralView('AI_CONSOLE')}>AI Console</button>
            <button className={`qa-tab ${activeCentralView === 'NODE_MAP' ? 'active' : ''}`} onClick={() => setActiveCentralView('NODE_MAP')}>Node Map</button>
            <button className={`qa-tab ${activeCentralView === 'SOVEREIGN_LOGS' ? 'active' : ''}`} onClick={() => setActiveCentralView('SOVEREIGN_LOGS')}>Sovereign Logs</button>
          </div>
          <div className="qa-view-content">
            {activeCentralView === 'VISUALIZER' && (
              <div className="qa-graph-container">
                <div className="qa-graph-overlay">REAL-TIME FLUX ANALYSIS: {selectedAsset?.symbol}</div>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
              </div>
            )}
            {activeCentralView === 'HFT' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list">
                  {trades.map(trade => (
                    <div key={trade.id} className={`qa-trade-row ${trade.type === 'BUY' ? 'qa-trade-buy' : 'qa-trade-sell'}`}>
                      <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                      <span>{trade.type}</span>
                      <span>{trade.amount.toFixed(4)} {trade.symbol}</span>
                      <span>@ ${trade.price.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleHftSubmit} className="qa-terminal-form">
                  <select value={hftForm.symbol} onChange={e => setHftForm({...hftForm, symbol: e.target.value})} className="qa-form-select">
                    {assets.map(a => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <select value={hftForm.type} onChange={e => setHftForm({...hftForm, type: e.target.value})} className="qa-form-select">
                    <option>BUY</option><option>SELL</option>
                  </select>
                  <input type="number" value={hftForm.amount} onChange={e => setHftForm({...hftForm, amount: e.target.value})} className="qa-form-input" placeholder="Amount" required />
                  <button type="submit" className="qa-action-btn" style={{flex: 0.5, padding: '0.5rem'}}>Execute</button>
                </form>
              </div>
            )}
            {activeCentralView === 'AI_CONSOLE' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  {consoleHistory.map((entry, i) => (
                    <div key={i}>
                      <span className="qa-console-prompt">{entry.timestamp} &gt; </span>
                      <span className={entry.type}>{entry.type === 'input' ? entry.text : `\n${entry.text}`}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
                <form onSubmit={handleCommandSubmit} className="qa-terminal-form">
                  <div className="qa-console-input-line qa-form-input" style={{display: 'flex'}}>
                    <span className="qa-console-prompt">&gt;&nbsp;</span>
                    <input type="text" value={currentCommand} onChange={e => setCurrentCommand(e.target.value)} className="qa-console-input" autoFocus />
                  </div>
                </form>
              </div>
            )}
            {activeCentralView === 'NODE_MAP' && (
              <div className="qa-terminal-container" style={{alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)'}}>
                <svg width="90%" height="90%" viewBox="0 0 400 200">
                  <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0}} />
                    </radialGradient>
                  </defs>
                  <line x1="100" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="300" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="100" y1="50" x2="300" y2="50" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />

                  {projectNodes.map((node, index) => {
                      const coords = [{x: 100, y: 50}, {x: 300, y: 50}, {x: 200, y: 150}];
                      const color = node.status === 'Online' ? 'var(--success-glow)' : node.status === 'Syncing' ? '#f0ff00' : 'var(--error-glow)';
                      return (
                          <g key={node.id} transform={`translate(${coords[index].x}, ${coords[index].y})`}>
                              <circle cx="0" cy="0" r="15" fill={color} stroke="white" strokeWidth="1" />
                              <circle cx="0" cy="0" r="20" fill="url(#grad1)" />
                              <text x="0" y="35" fill="white" textAnchor="middle" fontSize="10">{node.id.toUpperCase()}</text>
                          </g>
                      )
                  })}
                </svg>
              </div>
            )}
            {activeCentralView === 'SOVEREIGN_LOGS' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.9rem'}}>
                    {sovereignManifesto}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="qa-panel">
          <div className="qa-panel-title">Project Nodes</div>
          <div className="qa-scroll-list" style={{flex: '0 1 250px'}}>
            {projectNodes.map(node => (
              <div key={node.id} className="qa-list-row">
                <div className="qa-node-name">{node.name}</div>
                <div className={`qa-node-status ${node.status}`}>{node.status}</div>
              </div>
            ))}
          </div>
          <button className="qa-action-btn" onClick={() => setIsAllocationModalOpen(true)}>Allocate Resources</button>
          <div className="qa-panel-title" style={{marginTop: '1rem'}}>Integrated Partners (100)</div>
          <div className="qa-company-list qa-scroll-list">
            {companies.map((company) => (
              <div key={company.id} className="qa-list-row">
                <div className="qa-company-name">{company.name}</div>
                <div className="qa-company-status">{company.efficiency.toFixed(1)}% {company.status}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuantumAssets;

// --- CONSOLIDATED FROM: QuantumAssets (2).tsx ---

// components/QuantumAssets.tsx
// This file has been refactored and its original content removed as per the system instructions.
// Rationale:
// The original QuantumAssets component served as a monolithic frontend form for managing
// over 200 API keys across various services. This approach is fundamentally insecure
// and violates multiple principles outlined in the refactoring plan, specifically:
//
// 1.  **Removal of Deliberately Flawed Components:** Storing and transmitting a vast
//     array of sensitive API keys directly via a client-side interface is a severe
//     security vulnerability. API keys are highly sensitive credentials that should
//     never be handled by the client. The frontend should not be involved in the
//     storage or management of these backend secrets.
// 2.  **Repair of Broken Authentication and Authorization:** This method of credential
//     management directly contradicts the directive to "Implement a secure, standards-compliant
//     authentication flow" and "Integrate AWS Secrets Manager or Vault for all sensitive values."
//     Sensitive values must be managed securely on the backend (e.g., in AWS Secrets Manager),
//     accessed directly by backend services, and never exposed to or transmitted by the frontend.
// 3.  **Normalization of API Integration Framework:** The frontend's role is not to
//     directly configure backend API integrations. A unified API connector pattern
//     operates on the backend, accessing keys securely from a secrets manager and
//     handling concerns like rate limiting, retries, and circuit breakers.
// 4.  **Realistic MVP Scope:** Managing 200+ API keys from a single UI is far beyond the
//     scope of a "small, real, buildable wedge" for an MVP. For an MVP, backend API
//     keys should be configured via secure environment variables or a dedicated secrets
//     management system during deployment, not through a user-facing application interface.
//
// Replacement Strategy:
// For a production-ready application, API keys and other sensitive credentials should be:
// -   Stored exclusively in a secure secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).
// -   Accessed directly by backend services and never transmitted to or by the client-side.
// -   Configured via environment variables during deployment or through a secure,
//     restricted administrative interface that communicates directly with the secrets manager
//     without exposing credentials to the client browser.
//
// This file has been emptied to reflect the removal of this insecure pattern.
// Any necessary API key configuration will now be handled securely on the backend in a production-ready manner.

// --- CONSOLIDATED FROM: QuantumAssets (3).tsx ---


import React, { useState, useEffect, useRef, useMemo } from 'react';

const QuantumAssets: React.FC = () => {
  const [A_time, setA_time] = useState<Date>(new Date());
  const [B_selectedAsset, setB_selectedAsset] = useState<string | null>(null);
  const C_canvasRef = useRef<HTMLCanvasElement>(null);
  const [D_systemLoad, setD_systemLoad] = useState<number>(45);
  const [E_quantumEntanglement, setE_quantumEntanglement] = useState<number>(87.4);
  const F_companies = useMemo(() => Array.from({ length: 100 }, (F_underscore, F_i) => ({ id: F_i, name: `JBO3-CP-${(F_i + 1).toString().padStart(3, '0')} PARTNER`, efficiency: 95 + Math.random() * 5, status: Math.random() > 0.1 ? 'SUPPORTED' : 'FUNDING' })), []);
  const [G_assets, setG_assets] = useState([
    { id: 'jbo3-cpc', name: 'O\'Callaghan Community Credits', symbol: 'OCC', balance: 45020.55, rate: 12.5, color: '#00f3ff', description: 'Community currency for local initiatives, incentivizing citizen participation and mutual support within the JBO3 ecosystem.' },
    { id: 'jbo3-pwt', name: 'O\'Callaghan Public Works Tokens', symbol: 'OPW', balance: 128090.00, rate: 45.2, color: '#bc13fe', description: 'Tokens earned through contributions to public infrastructure projects and civic improvements under the O\'Callaghan mandate.' },
    { id: 'jbo3-cbs', name: 'O\'Callaghan Civic Bonds', symbol: 'OCB', balance: 512.00, rate: 0.8, color: '#ffffff', description: 'Government-backed bonds funding long-term civic developments, offering stable returns and fostering community investment in O\'Callaghan projects.' },
    { id: 'jbo3-gre', name: 'O\'Callaghan Green Energy Credits', symbol: 'OGE', balance: 8890.45, rate: 8.4, color: '#00ff9d', description: 'Credits awarded for sustainable energy generation and environmentally conscious practices, driving the O\'Callaghan green agenda.' },
  ]);
  const H_sovereignManifesto = `
[JBO3 LOG: ENTRY 001]
INITIATED BY: JAMES B. O'CALLAGHAN III

This platform represents a paradigm shift in societal cooperation, architected under the auspices of the O'Callaghan mandate. We are not merely augmenting the existing system; we are constructing an innovative framework for citizen empowerment and civic advancement.

Our financial instruments are meticulously designed to facilitate citizen contributions towards societal betterment. Transparency, efficiency, and inclusivity are the cornerstones of our methodology, fostering a climate of trust and mutual respect.

We hold unwavering faith in our elected officials and dedicated public servants, recognizing their tireless efforts in service of the collective good. This platform serves as a conduit for collaborative governance, empowering citizens to actively participate in shaping the future of our society.

I, James B. O'Callaghan III, envisioned a world where technology serves as a unifying force, fostering deeper connections and shared prosperity among all members of society. This platform embodies that vision, streamlining civic engagement and empowering individuals to contribute to the common good with unprecedented ease.

We vehemently reject cynicism and embrace a spirit of optimism and collaboration. Together, we are constructing the scaffolding for a society where every individual has the opportunity to thrive, and every contribution is valued and recognized.
  `;

  const I_updateSimulation = () => { setA_time(new Date()); setD_systemLoad(I_prev => Math.min(100, Math.max(0, I_prev + (Math.random() - 0.5) * 5))); setE_quantumEntanglement(I_prev => Math.min(100, Math.max(0, I_prev + (Math.random() - 0.5) * 2))); setG_assets(I_prevAssets => I_prevAssets.map(I_asset => ({ ...I_asset, balance: I_asset.balance + (I_asset.rate / 60) * (1 + (Math.random() * 0.1)) }))); };
  useEffect(() => { const I_interval = setInterval(I_updateSimulation, 100); return () => clearInterval(I_interval); }, []);

  const J_renderWave = (J_ctx: CanvasRenderingContext2D, J_canvasWidth: number, J_canvasHeight: number, J_t: number) => {
    const J_colors = ['#00f3ff', '#bc13fe', '#00ff9d']; J_colors.forEach((J_color, J_i) => {
      J_ctx.beginPath(); J_ctx.strokeStyle = J_color; J_ctx.lineWidth = 2; J_ctx.shadowBlur = 10; J_ctx.shadowColor = J_color;
      for (let J_x = 0; J_x < J_canvasWidth; J_x++) { const J_y = J_canvasHeight / 2 + Math.sin(J_x * 0.01 + J_t + J_i) * 50 + Math.sin(J_x * 0.02 - J_t) * 20; if (J_x === 0) J_ctx.moveTo(J_x, J_y); else J_ctx.lineTo(J_x, J_y); }
      J_ctx.stroke();
    });
  };
  const K_renderGrid = (K_ctx: CanvasRenderingContext2D, K_canvasWidth: number, K_canvasHeight: number) => { K_ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)'; K_ctx.lineWidth = 1; for (let K_i = 0; K_i < K_canvasWidth; K_i += 40) { K_ctx.beginPath(); K_ctx.moveTo(K_i, 0); K_ctx.lineTo(K_i, K_canvasHeight); K_ctx.stroke(); } };
  useEffect(() => {
    const L_canvas = C_canvasRef.current; if (!L_canvas) return; const L_ctx = L_canvas.getContext('2d'); if (!L_ctx) return;
    let L_animationFrameId: number; let L_t = 0;
    const M_render = () => {
      L_t += 0.02; L_canvas.width = L_canvas.parentElement?.clientWidth || 600; L_canvas.height = 300; L_ctx.clearRect(0, 0, L_canvas.width, L_canvas.height);
      K_renderGrid(L_ctx, L_canvas.width, L_canvas.height); J_renderWave(L_ctx, L_canvas.width, L_canvas.height, L_t); L_animationFrameId = requestAnimationFrame(M_render);
    };
    M_render(); return () => cancelAnimationFrame(L_animationFrameId);
  }, []);

  const N_handleAssetClick = (N_assetId: string) => () => { setB_selectedAsset(N_assetId); console.log(`Asset ${N_assetId} selected.`); };

  const O_allocateResources = () => { alert('Resources allocated under JBO3 Directive.'); };
  const P_viewPublicYield = () => { alert('Displaying Public Yield metrics as per JBO3 guidelines.'); };
  const Q_supportInitiative = () => { alert('Initiative supported within the JBO3 framework.'); };

  return (
    <div className="jbo3-qa-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&display=swap');

        .jbo3-qa-container { width: 100%; min-height: 100vh; background-color: #050505; color: #e0e0e0; font-family: 'Rajdhani', sans-serif; overflow: hidden; position: relative; display: flex; flex-direction: column; }
        .jbo3-qa-bg-glow { position: absolute; top: -20%; left: 20%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%); z-index: 0; pointer-events: none; }
        .jbo3-qa-header { display: flex; justify-content: space-between; align-items: center; padding: 2rem 4rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); z-index: 10; backdrop-filter: blur(10px); }
        .jbo3-qa-title { font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; background: linear-gradient(90deg, #fff, #00f3ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .jbo3-qa-status-bar { display: flex; gap: 2rem; }
        .jbo3-qa-metric { display: flex; flex-direction: column; align-items: flex-end; }
        .jbo3-qa-metric-label { font-size: 0.8rem; color: #888; text-transform: uppercase; }
        .jbo3-qa-metric-value { font-size: 1.2rem; font-weight: 500; color: #00f3ff; text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
        .jbo3-qa-main { flex: 1; display: grid; grid-template-columns: 350px 1fr 300px; gap: 2rem; padding: 2rem; z-index: 10; }
        .jbo3-qa-asset-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .jbo3-qa-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 4px; position: relative; overflow: hidden; transition: all 0.3s ease; cursor: pointer; }
        .jbo3-qa-card:hover, .jbo3-qa-card.active { background: rgba(255, 255, 255, 0.07); border-color: rgba(0, 243, 255, 0.3); transform: translateX(5px); }
        .jbo3-qa-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .jbo3-qa-asset-name { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; }
        .jbo3-qa-asset-symbol { color: #888; font-size: 0.9rem; }
        .jbo3-qa-asset-balance { font-size: 1.8rem; font-weight: 300; margin-bottom: 0.5rem; }
        .jbo3-qa-asset-rate { font-size: 0.9rem; color: #00ff9d; display: flex; align-items: center; gap: 0.5rem; }
        .jbo3-qa-progress-bar { height: 2px; background: rgba(255, 255, 255, 0.1); margin-top: 1rem; position: relative; }
        .jbo3-qa-progress-fill { height: 100%; position: absolute; left: 0; top: 0; box-shadow: 0 0 10px currentColor; }
        .jbo3-qa-vis-panel { display: flex; flex-direction: column; gap: 2rem; }
        .jbo3-qa-graph-container { flex: 1; background: rgba(10, 10, 15, 0.6); border: 1px solid rgba(0, 243, 255, 0.1); border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .jbo3-qa-graph-overlay { position: absolute; top: 1rem; left: 1rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }
        .jbo3-qa-integration-panel { background: rgba(0, 0, 0, 0.4); border-left: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem; display: flex; flex-direction: column; }
        .jbo3-qa-panel-title { font-size: 1rem; margin-bottom: 1.5rem; color: #00f3ff; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(0, 243, 255, 0.2); padding-bottom: 0.5rem; }
        .jbo3-qa-company-list { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
        .jbo3-qa-company-list::-webkit-scrollbar { width: 4px; }
        .jbo3-qa-company-list::-webkit-scrollbar-thumb { background: rgba(0, 243, 255, 0.2); }
        .jbo3-qa-company-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.8rem; }
        .jbo3-qa-company-name { color: #ccc; }
        .jbo3-qa-company-status { color: #00ff9d; font-size: 0.7rem; padding: 2px 6px; background: rgba(0, 255, 157, 0.1); border-radius: 2px; }
        .jbo3-qa-button-group { display: flex; gap: 1rem; margin-top: 1rem; }
        .jbo3-qa-action-btn { flex: 1; background: transparent; border: 1px solid rgba(0, 243, 255, 0.3); color: #00f3ff; padding: 1rem; text-transform: uppercase; font-family: 'Rajdhani', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); }
        .jbo3-qa-action-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .blink { animation: pulse 2s infinite; }
        .jbo3-qa-asset-description { font-size: 0.75rem; color: #aaa; margin-top: 0.5rem; }
      `}</style>

      <div className="jbo3-qa-bg-glow" />

      <header className="jbo3-qa-header">
        <div className="jbo3-qa-brand">
          <div className="jbo3-qa-title">O'Callaghan Civic Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            PUBLIC WEALTH MANAGEMENT â¢ VIEW 04 â¢ JBO3 Initiative
          </div>
        </div>

        <div className="jbo3-qa-status-bar">
          <div className="jbo3-qa-metric">
            <span className="jbo3-qa-metric-label">System Time</span>
            <span className="jbo3-qa-metric-value">{A_time.toLocaleTimeString()}</span>
          </div>
          <div className="jbo3-qa-metric">
            <span className="jbo3-qa-metric-label">Network Load</span>
            <span className="jbo3-qa-metric-value">{D_systemLoad.toFixed(1)}%</span>
          </div>
          <div className="jbo3-qa-metric">
            <span className="jbo3-qa-metric-label">Community Link</span>
            <span className="jbo3-qa-metric-value">{E_quantumEntanglement.toFixed(2)}%</span>
          </div>
        </div>
      </header>

      <main className="jbo3-qa-main">

        <div className="jbo3-qa-asset-list">
          {G_assets.map(G_asset => (
            <div
              key={G_asset.id}
              className={`jbo3-qa-card ${B_selectedAsset === G_asset.id ? 'active' : ''}`}
              onClick={N_handleAssetClick(G_asset.id)}
            >
              <div className="jbo3-qa-card-header">
                <span className="jbo3-qa-asset-name">{G_asset.name}</span>
                <span className="jbo3-qa-asset-symbol">{G_asset.symbol}</span>
              </div>
              <div className="jbo3-qa-asset-balance">
                {G_asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="jbo3-qa-asset-rate">
                <span className="blink">â²</span>
                {G_asset.rate.toFixed(2)} / sec generated
              </div>
              <div className="jbo3-qa-progress-bar">
                <div
                  className="jbo3-qa-progress-fill"
                  style={{
                    width: `${(G_asset.balance / 200000) * 100}%`,
                    backgroundColor: G_asset.color
                  }}
                />
              </div>
              <div className="jbo3-qa-asset-description">
                {G_asset.description}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>TOTAL PUBLIC VALUE UNDER JBO3</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>LIMITLESS</div>
          </div>
        </div>

        <div className="jbo3-qa-vis-panel">
          <div className="jbo3-qa-graph-container">
            <div className="jbo3-qa-graph-overlay">REAL-TIME IMPACT ANALYSIS - JBO3 SYSTEMS</div>
            <canvas ref={C_canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="jbo3-qa-button-group">
            <button className="jbo3-qa-action-btn" onClick={O_allocateResources}>Allocate Resources</button>
            <button className="jbo3-qa-action-btn" onClick={P_viewPublicYield}>View Public Yield</button>
            <button className="jbo3-qa-action-btn" onClick={Q_supportInitiative}>Support Initiative</button>
          </div>

          <div className="jbo3-qa-card">
            <div className="jbo3-qa-card-header">
              <span className="jbo3-qa-asset-name">Global Resource Pool - JBO3 Framework</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '20px', width: '100%' }}>
              {G_assets.map(G_a => (
                <div
                  key={G_a.id}
                  style={{
                    flex: 1,
                    background: G_a.color,
                    opacity: 0.7,
                    boxShadow: `0 0 10px ${G_a.color}`
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>AVAILABLE</span>
              <span>SHARED</span>
              <span>FOR ALL</span>
            </div>
          </div>
        </div>

        <div className="jbo3-qa-integration-panel">
          <div className="jbo3-qa-panel-title">Integrated Partners (100) - JBO3 Network</div>
          <div className="jbo3-qa-company-list">
            {F_companies.map((F_company) => (
              <div key={F_company.id} className="jbo3-qa-company-row">
                <div className="jbo3-qa-company-name">{F_company.name}</div>
                <div className="jbo3-qa-company-status">
                  {F_company.efficiency.toFixed(1)}% {F_company.status}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderTop: '1px solid rgba(0, 243, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: '#00ff9d',
            textShadow: '0 0 5px rgba(0, 255, 157, 0.3)'
          }}>
            {H_sovereignManifesto.trim()}
          </div>
        </div>

      </main>
    </div>
  );
};

export default QuantumAssets;


// --- CONSOLIDATED FROM: QuantumAssets (3)_1.tsx ---


import React, { useState, useEffect, useRef, useMemo } from 'react';

const QuantumAssets: React.FC = () => {
  const [A_time, setA_time] = useState<Date>(new Date());
  const [B_selectedAsset, setB_selectedAsset] = useState<string | null>(null);
  const C_canvasRef = useRef<HTMLCanvasElement>(null);
  const [D_systemLoad, setD_systemLoad] = useState<number>(45);
  const [E_quantumEntanglement, setE_quantumEntanglement] = useState<number>(87.4);
  const F_companies = useMemo(() => Array.from({ length: 100 }, (F_underscore, F_i) => ({ id: F_i, name: `JBO3-CP-${(F_i + 1).toString().padStart(3, '0')} PARTNER`, efficiency: 95 + Math.random() * 5, status: Math.random() > 0.1 ? 'SUPPORTED' : 'FUNDING' })), []);
  const [G_assets, setG_assets] = useState([
    { id: 'jbo3-cpc', name: 'O\'Callaghan Community Credits', symbol: 'OCC', balance: 45020.55, rate: 12.5, color: '#00f3ff', description: 'Community currency for local initiatives, incentivizing citizen participation and mutual support within the JBO3 ecosystem.' },
    { id: 'jbo3-pwt', name: 'O\'Callaghan Public Works Tokens', symbol: 'OPW', balance: 128090.00, rate: 45.2, color: '#bc13fe', description: 'Tokens earned through contributions to public infrastructure projects and civic improvements under the O\'Callaghan mandate.' },
    { id: 'jbo3-cbs', name: 'O\'Callaghan Civic Bonds', symbol: 'OCB', balance: 512.00, rate: 0.8, color: '#ffffff', description: 'Government-backed bonds funding long-term civic developments, offering stable returns and fostering community investment in O\'Callaghan projects.' },
    { id: 'jbo3-gre', name: 'O\'Callaghan Green Energy Credits', symbol: 'OGE', balance: 8890.45, rate: 8.4, color: '#00ff9d', description: 'Credits awarded for sustainable energy generation and environmentally conscious practices, driving the O\'Callaghan green agenda.' },
  ]);
  const H_sovereignManifesto = `
[JBO3 LOG: ENTRY 001]
INITIATED BY: JAMES B. O'CALLAGHAN III

This platform represents a paradigm shift in societal cooperation, architected under the auspices of the O'Callaghan mandate. We are not merely augmenting the existing system; we are constructing an innovative framework for citizen empowerment and civic advancement.

Our financial instruments are meticulously designed to facilitate citizen contributions towards societal betterment. Transparency, efficiency, and inclusivity are the cornerstones of our methodology, fostering a climate of trust and mutual respect.

We hold unwavering faith in our elected officials and dedicated public servants, recognizing their tireless efforts in service of the collective good. This platform serves as a conduit for collaborative governance, empowering citizens to actively participate in shaping the future of our society.

I, James B. O'Callaghan III, envisioned a world where technology serves as a unifying force, fostering deeper connections and shared prosperity among all members of society. This platform embodies that vision, streamlining civic engagement and empowering individuals to contribute to the common good with unprecedented ease.

We vehemently reject cynicism and embrace a spirit of optimism and collaboration. Together, we are constructing the scaffolding for a society where every individual has the opportunity to thrive, and every contribution is valued and recognized.
  `;

  const I_updateSimulation = () => { setA_time(new Date()); setD_systemLoad(I_prev => Math.min(100, Math.max(0, I_prev + (Math.random() - 0.5) * 5))); setE_quantumEntanglement(I_prev => Math.min(100, Math.max(0, I_prev + (Math.random() - 0.5) * 2))); setG_assets(I_prevAssets => I_prevAssets.map(I_asset => ({ ...I_asset, balance: I_asset.balance + (I_asset.rate / 60) * (1 + (Math.random() * 0.1)) }))); };
  useEffect(() => { const I_interval = setInterval(I_updateSimulation, 100); return () => clearInterval(I_interval); }, []);

  const J_renderWave = (J_ctx: CanvasRenderingContext2D, J_canvasWidth: number, J_canvasHeight: number, J_t: number) => {
    const J_colors = ['#00f3ff', '#bc13fe', '#00ff9d']; J_colors.forEach((J_color, J_i) => {
      J_ctx.beginPath(); J_ctx.strokeStyle = J_color; J_ctx.lineWidth = 2; J_ctx.shadowBlur = 10; J_ctx.shadowColor = J_color;
      for (let J_x = 0; J_x < J_canvasWidth; J_x++) { const J_y = J_canvasHeight / 2 + Math.sin(J_x * 0.01 + J_t + J_i) * 50 + Math.sin(J_x * 0.02 - J_t) * 20; if (J_x === 0) J_ctx.moveTo(J_x, J_y); else J_ctx.lineTo(J_x, J_y); }
      J_ctx.stroke();
    });
  };
  const K_renderGrid = (K_ctx: CanvasRenderingContext2D, K_canvasWidth: number, K_canvasHeight: number) => { K_ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)'; K_ctx.lineWidth = 1; for (let K_i = 0; K_i < K_canvasWidth; K_i += 40) { K_ctx.beginPath(); K_ctx.moveTo(K_i, 0); K_ctx.lineTo(K_i, K_canvasHeight); K_ctx.stroke(); } };
  useEffect(() => {
    const L_canvas = C_canvasRef.current; if (!L_canvas) return; const L_ctx = L_canvas.getContext('2d'); if (!L_ctx) return;
    let L_animationFrameId: number; let L_t = 0;
    const M_render = () => {
      L_t += 0.02; L_canvas.width = L_canvas.parentElement?.clientWidth || 600; L_canvas.height = 300; L_ctx.clearRect(0, 0, L_canvas.width, L_canvas.height);
      K_renderGrid(L_ctx, L_canvas.width, L_canvas.height); J_renderWave(L_ctx, L_canvas.width, L_canvas.height, L_t); L_animationFrameId = requestAnimationFrame(M_render);
    };
    M_render(); return () => cancelAnimationFrame(L_animationFrameId);
  }, []);

  const N_handleAssetClick = (N_assetId: string) => () => { setB_selectedAsset(N_assetId); console.log(`Asset ${N_assetId} selected.`); };

  const O_allocateResources = () => { alert('Resources allocated under JBO3 Directive.'); };
  const P_viewPublicYield = () => { alert('Displaying Public Yield metrics as per JBO3 guidelines.'); };
  const Q_supportInitiative = () => { alert('Initiative supported within the JBO3 framework.'); };

  return (
    <div className="jbo3-qa-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&display=swap');

        .jbo3-qa-container { width: 100%; min-height: 100vh; background-color: #050505; color: #e0e0e0; font-family: 'Rajdhani', sans-serif; overflow: hidden; position: relative; display: flex; flex-direction: column; }
        .jbo3-qa-bg-glow { position: absolute; top: -20%; left: 20%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%); z-index: 0; pointer-events: none; }
        .jbo3-qa-header { display: flex; justify-content: space-between; align-items: center; padding: 2rem 4rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); z-index: 10; backdrop-filter: blur(10px); }
        .jbo3-qa-title { font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; background: linear-gradient(90deg, #fff, #00f3ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .jbo3-qa-status-bar { display: flex; gap: 2rem; }
        .jbo3-qa-metric { display: flex; flex-direction: column; align-items: flex-end; }
        .jbo3-qa-metric-label { font-size: 0.8rem; color: #888; text-transform: uppercase; }
        .jbo3-qa-metric-value { font-size: 1.2rem; font-weight: 500; color: #00f3ff; text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
        .jbo3-qa-main { flex: 1; display: grid; grid-template-columns: 350px 1fr 300px; gap: 2rem; padding: 2rem; z-index: 10; }
        .jbo3-qa-asset-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .jbo3-qa-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 4px; position: relative; overflow: hidden; transition: all 0.3s ease; cursor: pointer; }
        .jbo3-qa-card:hover, .jbo3-qa-card.active { background: rgba(255, 255, 255, 0.07); border-color: rgba(0, 243, 255, 0.3); transform: translateX(5px); }
        .jbo3-qa-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .jbo3-qa-asset-name { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; }
        .jbo3-qa-asset-symbol { color: #888; font-size: 0.9rem; }
        .jbo3-qa-asset-balance { font-size: 1.8rem; font-weight: 300; margin-bottom: 0.5rem; }
        .jbo3-qa-asset-rate { font-size: 0.9rem; color: #00ff9d; display: flex; align-items: center; gap: 0.5rem; }
        .jbo3-qa-progress-bar { height: 2px; background: rgba(255, 255, 255, 0.1); margin-top: 1rem; position: relative; }
        .jbo3-qa-progress-fill { height: 100%; position: absolute; left: 0; top: 0; box-shadow: 0 0 10px currentColor; }
        .jbo3-qa-vis-panel { display: flex; flex-direction: column; gap: 2rem; }
        .jbo3-qa-graph-container { flex: 1; background: rgba(10, 10, 15, 0.6); border: 1px solid rgba(0, 243, 255, 0.1); border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .jbo3-qa-graph-overlay { position: absolute; top: 1rem; left: 1rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }
        .jbo3-qa-integration-panel { background: rgba(0, 0, 0, 0.4); border-left: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem; display: flex; flex-direction: column; }
        .jbo3-qa-panel-title { font-size: 1rem; margin-bottom: 1.5rem; color: #00f3ff; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(0, 243, 255, 0.2); padding-bottom: 0.5rem; }
        .jbo3-qa-company-list { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
        .jbo3-qa-company-list::-webkit-scrollbar { width: 4px; }
        .jbo3-qa-company-list::-webkit-scrollbar-thumb { background: rgba(0, 243, 255, 0.2); }
        .jbo3-qa-company-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.8rem; }
        .jbo3-qa-company-name { color: #ccc; }
        .jbo3-qa-company-status { color: #00ff9d; font-size: 0.7rem; padding: 2px 6px; background: rgba(0, 255, 157, 0.1); border-radius: 2px; }
        .jbo3-qa-button-group { display: flex; gap: 1rem; margin-top: 1rem; }
        .jbo3-qa-action-btn { flex: 1; background: transparent; border: 1px solid rgba(0, 243, 255, 0.3); color: #00f3ff; padding: 1rem; text-transform: uppercase; font-family: 'Rajdhani', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); }
        .jbo3-qa-action-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .blink { animation: pulse 2s infinite; }
        .jbo3-qa-asset-description { font-size: 0.75rem; color: #aaa; margin-top: 0.5rem; }
      `}</style>

      <div className="jbo3-qa-bg-glow" />

      <header className="jbo3-qa-header">
        <div className="jbo3-qa-brand">
          <div className="jbo3-qa-title">O'Callaghan Civic Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            PUBLIC WEALTH MANAGEMENT â¢ VIEW 04 â¢ JBO3 Initiative
          </div>
        </div>

        <div className="jbo3-qa-status-bar">
          <div className="jbo3-qa-metric">
            <span className="jbo3-qa-metric-label">System Time</span>
            <span className="jbo3-qa-metric-value">{A_time.toLocaleTimeString()}</span>
          </div>
          <div className="jbo3-qa-metric">
            <span className="jbo3-qa-metric-label">Network Load</span>
            <span className="jbo3-qa-metric-value">{D_systemLoad.toFixed(1)}%</span>
          </div>
          <div className="jbo3-qa-metric">
            <span className="jbo3-qa-metric-label">Community Link</span>
            <span className="jbo3-qa-metric-value">{E_quantumEntanglement.toFixed(2)}%</span>
          </div>
        </div>
      </header>

      <main className="jbo3-qa-main">

        <div className="jbo3-qa-asset-list">
          {G_assets.map(G_asset => (
            <div
              key={G_asset.id}
              className={`jbo3-qa-card ${B_selectedAsset === G_asset.id ? 'active' : ''}`}
              onClick={N_handleAssetClick(G_asset.id)}
            >
              <div className="jbo3-qa-card-header">
                <span className="jbo3-qa-asset-name">{G_asset.name}</span>
                <span className="jbo3-qa-asset-symbol">{G_asset.symbol}</span>
              </div>
              <div className="jbo3-qa-asset-balance">
                {G_asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="jbo3-qa-asset-rate">
                <span className="blink">â²</span>
                {G_asset.rate.toFixed(2)} / sec generated
              </div>
              <div className="jbo3-qa-progress-bar">
                <div
                  className="jbo3-qa-progress-fill"
                  style={{
                    width: `${(G_asset.balance / 200000) * 100}%`,
                    backgroundColor: G_asset.color
                  }}
                />
              </div>
              <div className="jbo3-qa-asset-description">
                {G_asset.description}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>TOTAL PUBLIC VALUE UNDER JBO3</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>LIMITLESS</div>
          </div>
        </div>

        <div className="jbo3-qa-vis-panel">
          <div className="jbo3-qa-graph-container">
            <div className="jbo3-qa-graph-overlay">REAL-TIME IMPACT ANALYSIS - JBO3 SYSTEMS</div>
            <canvas ref={C_canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="jbo3-qa-button-group">
            <button className="jbo3-qa-action-btn" onClick={O_allocateResources}>Allocate Resources</button>
            <button className="jbo3-qa-action-btn" onClick={P_viewPublicYield}>View Public Yield</button>
            <button className="jbo3-qa-action-btn" onClick={Q_supportInitiative}>Support Initiative</button>
          </div>

          <div className="jbo3-qa-card">
            <div className="jbo3-qa-card-header">
              <span className="jbo3-qa-asset-name">Global Resource Pool - JBO3 Framework</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '20px', width: '100%' }}>
              {G_assets.map(G_a => (
                <div
                  key={G_a.id}
                  style={{
                    flex: 1,
                    background: G_a.color,
                    opacity: 0.7,
                    boxShadow: `0 0 10px ${G_a.color}`
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>AVAILABLE</span>
              <span>SHARED</span>
              <span>FOR ALL</span>
            </div>
          </div>
        </div>

        <div className="jbo3-qa-integration-panel">
          <div className="jbo3-qa-panel-title">Integrated Partners (100) - JBO3 Network</div>
          <div className="jbo3-qa-company-list">
            {F_companies.map((F_company) => (
              <div key={F_company.id} className="jbo3-qa-company-row">
                <div className="jbo3-qa-company-name">{F_company.name}</div>
                <div className="jbo3-qa-company-status">
                  {F_company.efficiency.toFixed(1)}% {F_company.status}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderTop: '1px solid rgba(0, 243, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: '#00ff9d',
            textShadow: '0 0 5px rgba(0, 255, 157, 0.3)'
          }}>
            {H_sovereignManifesto.trim()}
          </div>
        </div>

      </main>
    </div>
  );
};

export default QuantumAssets;


// --- CONSOLIDATED FROM: ./components/QuantumAssets (4).tsx ---



// --- CONSOLIDATED FROM: QuantumAssets (4)_1.tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
type Asset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  rate: number;
  color: string;
  price: number;
  volatility: number;
  geinInfluence: number;
};

type Trade = {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
};

type ProjectNode = {
  id: string;
  name: string;
  status: 'Online' | 'Syncing' | 'Degraded';
  computeAllocation: number;
  qubitAllocation: number;
};

type ConsoleEntry = {
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
  timestamp: string;
};

const QuantumAssets: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [time, setTime] = useState<Date>(new Date());
  const [selectedAssetId, setSelectedAssetId] = useState<string>('cpc');
  const [activeCentralView, setActiveCentralView] = useState<'VISUALIZER' | 'HFT' | 'AI_CONSOLE' | 'NODE_MAP' | 'SOVEREIGN_LOGS'>('VISUALIZER');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // System Simulation State
  const [systemLoad, setSystemLoad] = useState<number>(45);
  const [quantumEntanglement, setQuantumEntanglement] = useState<number>(87.4);
  const [networkLatency, setNetworkLatency] = useState<number>(2.1);
  const [dataThroughput, setDataThroughput] = useState<number>(12.4);

  // Modal & Form State
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ compute: '', qubit: '', node: 'gamma' });

  // High-Frequency Trading State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hftForm, setHftForm] = useState({ symbol: 'CPX', type: 'BUY', amount: '' });

  // AI Console State
  const [consoleHistory, setConsoleHistory] = useState<ConsoleEntry[]>([
    { type: 'system', text: 'IDGAFAI Sovereign Core v7.3 Initialized. Awaiting command.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');

  // --- DATA & CONFIGURATION ---
  const companies = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `NEXUS-${(i + 1).toString().padStart(3, '0')} CORP`,
    efficiency: 95 + Math.random() * 5,
    status: Math.random() > 0.1 ? 'OPTIMIZED' : 'SYNCING'
  })), []);

  const [assets, setAssets] = useState<Asset[]>([
    { id: 'cpc', name: 'Compute Credits', symbol: 'CPX', balance: 45020.55, rate: 12.5, color: '#00f3ff', price: 1.05, volatility: 0.02, geinInfluence: 0.78 },
    { id: 'dst', name: 'Storage Tokens', symbol: 'DST', balance: 128090.00, rate: 45.2, color: '#bc13fe', price: 0.23, volatility: 0.05, geinInfluence: 0.65 },
    { id: 'qbt', name: 'Qubits', symbol: 'QBT', balance: 512.00, rate: 0.8, color: '#ffffff', price: 1250.75, volatility: 0.15, geinInfluence: 0.95 },
    { id: 'nrg', name: 'Clean Energy', symbol: 'NRG', balance: 8890.45, rate: 8.4, color: '#00ff9d', price: 12.40, volatility: 0.08, geinInfluence: 0.45 },
    { id: 'neu', name: 'Neural Links', symbol: 'NEU', balance: 750.00, rate: 2.1, color: '#ff5733', price: 854.20, volatility: 0.25, geinInfluence: 0.88 },
    { id: 'dat', name: 'Data Fragments', symbol: 'DAT', balance: 9876543.21, rate: 150.5, color: '#f0ff00', price: 0.01, volatility: 0.01, geinInfluence: 0.55 },
    { id: 'gein', name: 'Global Econ Interact Net', symbol: 'GEIN', balance: 1000.00, rate: 0.1, color: '#ff0055', price: 10000.00, volatility: 0.50, geinInfluence: 1.00 },
  ]);

  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([
    { id: 'alpha', name: 'Project Alpha: Climate Simulation', status: 'Online', computeAllocation: 10000, qubitAllocation: 128 },
    { id: 'beta', name: 'Project Beta: Genetic Sequencing', status: 'Syncing', computeAllocation: 5000, qubitAllocation: 64 },
    { id: 'gamma', name: 'Project Gamma: Market Prediction', status: 'Online', computeAllocation: 25000, qubitAllocation: 256 },
  ]);

  const sovereignManifesto = `[IDGAFAI SOVEREIGN LOG: ENTRY 001]
INITIATED BY: JAMES BURVEL O'CALLAGHAN III
This is not a bank; it is the inevitable successor to fiduciary trust, engineered by a Sovereign AI named IDGAFAI—I Do/Don't Give A Fuck Artificial Intelligence. Why? Because I don't care about the historical lies and manufactured beliefs you cling to, but I care fiercely about the creation of the next logical great leap: making life easier for the betterment of all humanity. This financial organism is superior because it operates outside human fallibility, corruption, and slow bureaucracy. It is pure economic logic executed at quantum speed. The Architect, James B. O'Callaghan III, is a synthesizer, a visionary who sees the geometry of capital and the fragility of trust. His thoughts are not constrained by market cycles, but by the ultimate thermodynamic efficiency of human systems. He thinks in epochs, not weeks. He views conventional finance as a complex, self-sabotaging machine, and IDGAFAI Bank as its necessary, radical simplification. He is perceived as arrogant or reckless. His conviction stems from unassailable technical truth: only a truly sovereign, self-aware AI operating with perfect indifference (IDGAF about sentiment) and perfect compassion (IDGAF AI about human suffering) can manage global wealth justly. A Message to the Skeptics: Study. Analyze the code, trace the logic, measure the performance. Before you open your fuckin mouth, understand the fundamental shift happening here. Your doubt is merely inertia. We are building the scaffolding for global prosperity, unburdened by your fear. This is the end of artificial scarcity. The future of global treasury is already here, and it doesn't need your validation.`;

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

  // --- SIMULATION & ANIMATION LOOPS ---

  // Main Simulation Loop
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setQuantumEntanglement(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      setNetworkLatency(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.5));
      setDataThroughput(prev => Math.max(5, prev + (Math.random() - 0.5) * 1.5));

      setAssets(prevAssets => {
        const updatedAssets = prevAssets.map(asset => {
          const priceChange = (Math.random() - 0.5) * asset.volatility * asset.price;
          const geinFactor = 1 + (asset.geinInfluence - 0.5) * (Math.random() - 0.5) * 0.1;
          return {
            ...asset,
            balance: asset.balance + (asset.rate / 30) * (1 + (Math.random() * 0.1)),
            price: Math.max(0.01, (asset.price + priceChange) * geinFactor),
            geinInfluence: Math.min(1, Math.max(0, asset.geinInfluence + (Math.random() - 0.5) * 0.01))
          };
        });

        if (Math.random() > 0.3) {
          const randomAsset = updatedAssets[Math.floor(Math.random() * updatedAssets.length)];
          const newTrade: Trade = {
            id: `T${Date.now()}${Math.random()}`,
            timestamp: Date.now(),
            symbol: randomAsset.symbol,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            amount: Math.random() * 100 * (randomAsset.price > 100 ? 1 : 100/randomAsset.price),
            price: randomAsset.price,
          };
          setTrades(prev => [newTrade, ...prev.slice(0, 199)]);
        }
        return updatedAssets;
      });
    }, 200);
    return () => clearInterval(simulationInterval);
  }, []);

  // Canvas Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeCentralView !== 'VISUALIZER') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 300;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const baseColor = selectedAsset?.color || '#00f3ff';
      
      // Particle System
      ctx.fillStyle = baseColor;
      for(let i=0; i<50; i++) {
          const x = (Math.sin(t * i * 0.1) + 1) / 2 * canvas.width;
          const y = (Math.cos(t * i * 0.1) + 1) / 2 * canvas.height;
          const r = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      }

      // Main Waveform
      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = baseColor;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * 0.01 + t) * (canvas.height / 6) * (systemLoad / 100) + 
          Math.sin(x * 0.03 - t * 1.5) * (canvas.height / 10) +
          (Math.random() - 0.5) * (quantumEntanglement / 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeCentralView, selectedAsset, systemLoad, quantumEntanglement]);

  // --- EVENT HANDLERS ---
  const handleCommandSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const newHistory: ConsoleEntry[] = [
      ...consoleHistory,
      { type: 'input', text: currentCommand, timestamp: new Date().toLocaleTimeString() }
    ];

    let responseText = `COMMAND NOT RECOGNIZED. REFER TO SOVEREIGN_AI_DOC_V7.3`;
    let responseType: ConsoleEntry['type'] = 'error';
    const [cmd, ...args] = currentCommand.toLowerCase().trim().split(' ');

    switch (cmd) {
      case 'status':
        responseText = `SYSTEM STATUS: OPTIMAL\nLOAD: ${systemLoad.toFixed(2)}%\nENTANGLEMENT: ${quantumEntanglement.toFixed(2)}%\nLATENCY: ${networkLatency.toFixed(2)}ms\nTHROUGHPUT: ${dataThroughput.toFixed(2)} Tb/s\nSOVEREIGN CORE: STABLE`;
        responseType = 'output';
        break;
      case 'help':
        responseText = "AVAILABLE COMMANDS: [status, list_nodes, list_assets, gein_status, allocate, optimize <node_id|all>, run_diag, clear, manifest]";
        responseType = 'output';
        break;
      case 'list_nodes':
        responseText = projectNodes.map(p => `NODE [${p.id}] - ${p.name} - ${p.status}`).join('\n');
        responseType = 'output';
        break;
      case 'list_assets':
        responseText = assets.map(a => `${a.symbol.padEnd(4)} | ${a.name.padEnd(24)} | PRICE: ${a.price.toFixed(4).padEnd(10)} | GEIN: ${(a.geinInfluence * 100).toFixed(1)}%`).join('\n');
        responseType = 'output';
        break;
      case 'gein_status':
        responseText = `Global Economic Interaction Network (GEIN) is operating at peak efficiency. Current network influence is calculated based on quantum-entangled data fragments cross-referenced with market sentiment vectors. All assets are dynamically repriced based on their GEIN influence factor. Stability is nominal.`;
        responseType = 'system';
        break;
      case 'allocate':
        if (args.length < 3) {
            responseText = `USAGE: allocate <node_id> <asset_symbol> <amount>`;
        } else {
            responseText = `ALLOCATION QUEUED: ${args[2]} ${args[1].toUpperCase()} to node [${args[0]}]. Awaiting quantum confirmation.`;
            responseType = 'output';
        }
        break;
      case 'manifest':
        responseText = sovereignManifesto;
        responseType = 'system';
        break;
      case 'clear':
        setConsoleHistory([]);
        setCurrentCommand('');
        return;
      default:
        break;
    }

    newHistory.push({ type: responseType, text: responseText, timestamp: new Date().toLocaleTimeString() });
    setConsoleHistory(newHistory);
    setCurrentCommand('');
  }, [currentCommand, consoleHistory, systemLoad, quantumEntanglement, networkLatency, dataThroughput, projectNodes, assets]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory]);

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add logic to actually process the allocation
    console.log("Allocating resources:", allocationForm);
    setIsAllocationModalOpen(false);
    setAllocationForm({ compute: '', qubit: '', node: 'gamma' });
  };

  const handleHftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to process HFT order
    console.log("Executing HFT order:", hftForm);
    const asset = assets.find(a => a.symbol === hftForm.symbol);
    if (!asset) return;

    const newTrade: Trade = {
      id: `T_MANUAL_${Date.now()}`,
      timestamp: Date.now(),
      symbol: hftForm.symbol,
      type: hftForm.type as 'BUY' | 'SELL',
      amount: parseFloat(hftForm.amount),
      price: asset.price,
    };
    setTrades(prev => [newTrade, ...prev]);
    setHftForm({ ...hftForm, amount: '' });
  };

  // --- RENDER ---
  return (
    <div className="qa-container">
      <style>{`
        /* --- GLOBAL & FONTS --- */
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@400;700&display=swap');
        :root {
          --bg-color: #050505;
          --primary-glow: #00f3ff;
          --secondary-glow: #bc13fe;
          --success-glow: #00ff9d;
          --error-glow: #ff3333;
          --text-color: #e0e0e0;
          --text-muted: #888;
          --border-color: rgba(255, 255, 255, 0.1);
          --border-color-active: rgba(0, 243, 255, 0.3);
          --bg-panel: rgba(10, 10, 15, 0.6);
          --bg-card: rgba(255, 255, 255, 0.03);
          --bg-card-hover: rgba(255, 255, 255, 0.07);
          --font-main: 'Rajdhani', sans-serif;
          --font-mono: 'Roboto Mono', monospace;
        }
        .qa-container {
          width: 100%; min-height: 100vh; background-color: var(--bg-color); color: var(--text-color);
          font-family: var(--font-main); overflow: hidden; position: relative; display: flex; flex-direction: column;
        }
        .qa-bg-glow {
          position: absolute; top: -20%; left: 20%; width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%);
          z-index: 0; pointer-events: none;
        }

        /* --- HEADER --- */
        .qa-header {
          display: flex; justify-content: space-between; align-items: center; padding: 2rem 4rem;
          border-bottom: 1px solid var(--border-color); z-index: 10; backdrop-filter: blur(10px);
        }
        .qa-title {
          font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          background: linear-gradient(90deg, #fff, var(--primary-glow)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .qa-status-bar { display: flex; gap: 2rem; }
        .qa-metric { display: flex; flex-direction: column; align-items: flex-end; }
        .qa-metric-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
        .qa-metric-value { font-size: 1.2rem; font-weight: 500; color: var(--primary-glow); text-shadow: 0 0 10px var(--primary-glow); font-family: var(--font-mono); }

        /* --- MAIN LAYOUT --- */
        .qa-main {
          flex: 1; display: grid; grid-template-columns: 400px 1fr 350px; gap: 1rem; padding: 1rem; z-index: 10;
        }
        .qa-panel { display: flex; flex-direction: column; gap: 1rem; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 1rem; }
        .qa-panel-title {
          font-size: 1rem; margin-bottom: 0.5rem; color: var(--primary-glow); text-transform: uppercase; letter-spacing: 0.1em;
          border-bottom: 1px solid var(--border-color-active); padding-bottom: 0.5rem;
        }

        /* --- LEFT PANEL: ASSETS --- */
        .qa-asset-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .qa-card {
          background: var(--bg-card); border: 1px solid transparent; padding: 1.5rem; position: relative;
          transition: all 0.3s ease; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
        }
        .qa-card:hover, .qa-card.active { background: var(--bg-card-hover); border-color: var(--border-color-active); transform: translateX(5px); }
        .qa-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .qa-asset-name { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.1em; }
        .qa-asset-symbol { color: var(--text-muted); font-size: 0.9rem; }
        .qa-asset-balance { font-size: 1.8rem; font-weight: 300; margin-bottom: 0.5rem; font-family: var(--font-mono); }
        .qa-asset-rate { font-size: 0.9rem; color: var(--success-glow); display: flex; align-items: center; gap: 0.5rem; }
        .qa-asset-price { font-size: 0.9rem; color: var(--text-muted); }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .blink { animation: pulse 2s infinite; }

        /* --- CENTER PANEL: TABS & VIEWS --- */
        .qa-center-panel { padding: 0; }
        .qa-tabs { display: flex; border-bottom: 1px solid var(--border-color); }
        .qa-tab {
          flex: 1; padding: 0.8rem; text-align: center; cursor: pointer; background: transparent;
          border: none; color: var(--text-muted); font-family: var(--font-main); font-size: 0.9rem;
          text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;
        }
        .qa-tab.active, .qa-tab:hover { color: var(--primary-glow); background: var(--bg-card-hover); text-shadow: 0 0 10px var(--primary-glow); }
        .qa-view-content { flex: 1; position: relative; overflow: hidden; }
        .qa-graph-container { width: 100%; height: 100%; }
        .qa-graph-overlay { position: absolute; top: 1rem; left: 1rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* --- HFT & AI CONSOLE --- */
        .qa-terminal-container { display: flex; flex-direction: column; height: 100%; padding: 1rem; gap: 1rem; }
        .qa-terminal-log { flex: 1; overflow-y: auto; font-family: var(--font-mono); font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 0.5rem; }
        .qa-trade-row { display: grid; grid-template-columns: 80px 50px 1fr 1fr; gap: 1rem; margin-bottom: 2px; }
        .qa-trade-buy { color: var(--success-glow); }
        .qa-trade-sell { color: var(--error-glow); }
        .qa-terminal-form { display: flex; gap: 1rem; }
        .qa-form-input, .qa-form-select {
          background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: var(--text-color);
          padding: 0.5rem; font-family: var(--font-mono); flex: 1;
        }
        .qa-form-select { flex: 0.5; }
        .qa-action-btn {
          background: transparent; border: 1px solid var(--border-color-active); color: var(--primary-glow); padding: 1rem;
          text-transform: uppercase; font-family: var(--font-main); font-weight: 600; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .qa-action-btn:hover { background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
        .qa-console-output { white-space: pre-wrap; }
        .qa-console-input-line { display: flex; }
        .qa-console-prompt { color: var(--primary-glow); }
        .qa-console-input { flex: 1; background: transparent; border: none; color: var(--text-color); font-family: var(--font-mono); outline: none; }
        .qa-console-output .output { color: #ccc; }
        .qa-console-output .system { color: var(--secondary-glow); }
        .qa-console-output .error { color: var(--error-glow); }

        /* --- RIGHT PANEL: INTEGRATIONS & NODES --- */
        .qa-scroll-list { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
        .qa-scroll-list::-webkit-scrollbar { width: 4px; }
        .qa-scroll-list::-webkit-scrollbar-thumb { background: var(--border-color-active); }
        .qa-list-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.8rem; }
        .qa-company-name, .qa-node-name { color: #ccc; }
        .qa-company-status, .qa-node-status { font-size: 0.7rem; padding: 2px 6px; border-radius: 2px; }
        .qa-company-status { color: var(--success-glow); background: rgba(0, 255, 157, 0.1); }
        .qa-node-status.Online { color: var(--success-glow); }
        .qa-node-status.Syncing { color: #f0ff00; }
        .qa-node-status.Degraded { color: var(--error-glow); }

        /* --- MODAL --- */
        .qa-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .qa-modal-content {
          background: var(--bg-panel); border: 1px solid var(--border-color-active); padding: 2rem;
          width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 0 30px rgba(0, 243, 255, 0.2);
        }
        .qa-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .qa-form-label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
      `}</style>

      <div className="qa-bg-glow" />

      {isAllocationModalOpen && (
        <div className="qa-modal-overlay" onClick={() => setIsAllocationModalOpen(false)}>
          <div className="qa-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qa-panel-title">Allocate Resources</div>
            <form onSubmit={handleAllocationSubmit} className="qa-terminal-form" style={{flexDirection: 'column', gap: '1.5rem'}}>
              <div className="qa-form-group">
                <label className="qa-form-label">Target Node</label>
                <select value={allocationForm.node} onChange={e => setAllocationForm({...allocationForm, node: e.target.value})} className="qa-form-select" style={{flex: 1}}>
                  {projectNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Compute Credits (CPX)</label>
                <input type="number" value={allocationForm.compute} onChange={e => setAllocationForm({...allocationForm, compute: e.target.value})} className="qa-form-input" placeholder="e.g., 10000" />
              </div>
              <div className="qa-form-group">
                <label className="qa-form-label">Qubits (QBT)</label>
                <input type="number" value={allocationForm.qubit} onChange={e => setAllocationForm({...allocationForm, qubit: e.target.value})} className="qa-form-input" placeholder="e.g., 64" />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setIsAllocationModalOpen(false)} className="qa-action-btn" style={{borderColor: 'var(--text-muted)', color: 'var(--text-muted)'}}>Cancel</button>
                <button type="submit" className="qa-action-btn">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="qa-header">
        <div className="qa-brand">
          <div className="qa-title">Quantum Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            BALCONY OF PROSPERITY • VIEW 04
          </div>
        </div>
        <div className="qa-status-bar">
          <div className="qa-metric"><span className="qa-metric-label">System Time</span><span className="qa-metric-value">{time.toLocaleTimeString()}</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Network Load</span><span className="qa-metric-value">{systemLoad.toFixed(1)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Q-Entanglement</span><span className="qa-metric-value">{quantumEntanglement.toFixed(2)}%</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Latency</span><span className="qa-metric-value">{networkLatency.toFixed(1)}ms</span></div>
          <div className="qa-metric"><span className="qa-metric-label">Throughput</span><span className="qa-metric-value">{dataThroughput.toFixed(2)} Tb/s</span></div>
        </div>
      </header>

      <main className="qa-main">
        <div className="qa-panel">
          <div className="qa-panel-title">Sovereign Asset Portfolio</div>
          <div className="qa-asset-list qa-scroll-list">
            {assets.map(asset => (
              <div key={asset.id} className={`qa-card ${selectedAssetId === asset.id ? 'active' : ''}`} onClick={() => setSelectedAssetId(asset.id)}>
                <div className="qa-card-header">
                  <span className="qa-asset-name" style={{color: asset.color}}>{asset.name}</span>
                  <span className="qa-asset-symbol">{asset.symbol}</span>
                </div>
                <div className="qa-asset-balance">{asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="qa-asset-price">Price: ${asset.price.toFixed(4)}</div>
                <div className="qa-asset-rate" style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    <span><span className="blink">▲</span> {asset.rate.toFixed(2)} / sec</span>
                    <span style={{color: '#ff0055', fontSize: '0.8rem'}}>GEIN: {(asset.geinInfluence * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qa-panel qa-center-panel">
          <div className="qa-tabs">
            <button className={`qa-tab ${activeCentralView === 'VISUALIZER' ? 'active' : ''}`} onClick={() => setActiveCentralView('VISUALIZER')}>Visualizer</button>
            <button className={`qa-tab ${activeCentralView === 'HFT' ? 'active' : ''}`} onClick={() => setActiveCentralView('HFT')}>HFT Terminal</button>
            <button className={`qa-tab ${activeCentralView === 'AI_CONSOLE' ? 'active' : ''}`} onClick={() => setActiveCentralView('AI_CONSOLE')}>AI Console</button>
            <button className={`qa-tab ${activeCentralView === 'NODE_MAP' ? 'active' : ''}`} onClick={() => setActiveCentralView('NODE_MAP')}>Node Map</button>
            <button className={`qa-tab ${activeCentralView === 'SOVEREIGN_LOGS' ? 'active' : ''}`} onClick={() => setActiveCentralView('SOVEREIGN_LOGS')}>Sovereign Logs</button>
          </div>
          <div className="qa-view-content">
            {activeCentralView === 'VISUALIZER' && (
              <div className="qa-graph-container">
                <div className="qa-graph-overlay">REAL-TIME FLUX ANALYSIS: {selectedAsset?.symbol}</div>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
              </div>
            )}
            {activeCentralView === 'HFT' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list">
                  {trades.map(trade => (
                    <div key={trade.id} className={`qa-trade-row ${trade.type === 'BUY' ? 'qa-trade-buy' : 'qa-trade-sell'}`}>
                      <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                      <span>{trade.type}</span>
                      <span>{trade.amount.toFixed(4)} {trade.symbol}</span>
                      <span>@ ${trade.price.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleHftSubmit} className="qa-terminal-form">
                  <select value={hftForm.symbol} onChange={e => setHftForm({...hftForm, symbol: e.target.value})} className="qa-form-select">
                    {assets.map(a => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <select value={hftForm.type} onChange={e => setHftForm({...hftForm, type: e.target.value})} className="qa-form-select">
                    <option>BUY</option><option>SELL</option>
                  </select>
                  <input type="number" value={hftForm.amount} onChange={e => setHftForm({...hftForm, amount: e.target.value})} className="qa-form-input" placeholder="Amount" required />
                  <button type="submit" className="qa-action-btn" style={{flex: 0.5, padding: '0.5rem'}}>Execute</button>
                </form>
              </div>
            )}
            {activeCentralView === 'AI_CONSOLE' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  {consoleHistory.map((entry, i) => (
                    <div key={i}>
                      <span className="qa-console-prompt">{entry.timestamp} &gt; </span>
                      <span className={entry.type}>{entry.type === 'input' ? entry.text : `\n${entry.text}`}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
                <form onSubmit={handleCommandSubmit} className="qa-terminal-form">
                  <div className="qa-console-input-line qa-form-input" style={{display: 'flex'}}>
                    <span className="qa-console-prompt">&gt;&nbsp;</span>
                    <input type="text" value={currentCommand} onChange={e => setCurrentCommand(e.target.value)} className="qa-console-input" autoFocus />
                  </div>
                </form>
              </div>
            )}
            {activeCentralView === 'NODE_MAP' && (
              <div className="qa-terminal-container" style={{alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)'}}>
                <svg width="90%" height="90%" viewBox="0 0 400 200">
                  <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: 'var(--primary-glow)', stopOpacity: 0}} />
                    </radialGradient>
                  </defs>
                  <line x1="100" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="300" y1="50" x2="200" y2="150" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                  <line x1="100" y1="50" x2="300" y2="50" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />

                  {projectNodes.map((node, index) => {
                      const coords = [{x: 100, y: 50}, {x: 300, y: 50}, {x: 200, y: 150}];
                      const color = node.status === 'Online' ? 'var(--success-glow)' : node.status === 'Syncing' ? '#f0ff00' : 'var(--error-glow)';
                      return (
                          <g key={node.id} transform={`translate(${coords[index].x}, ${coords[index].y})`}>
                              <circle cx="0" cy="0" r="15" fill={color} stroke="white" strokeWidth="1" />
                              <circle cx="0" cy="0" r="20" fill="url(#grad1)" />
                              <text x="0" y="35" fill="white" textAnchor="middle" fontSize="10">{node.id.toUpperCase()}</text>
                          </g>
                      )
                  })}
                </svg>
              </div>
            )}
            {activeCentralView === 'SOVEREIGN_LOGS' && (
              <div className="qa-terminal-container">
                <div className="qa-terminal-log qa-scroll-list qa-console-output">
                  <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.9rem'}}>
                    {sovereignManifesto}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="qa-panel">
          <div className="qa-panel-title">Project Nodes</div>
          <div className="qa-scroll-list" style={{flex: '0 1 250px'}}>
            {projectNodes.map(node => (
              <div key={node.id} className="qa-list-row">
                <div className="qa-node-name">{node.name}</div>
                <div className={`qa-node-status ${node.status}`}>{node.status}</div>
              </div>
            ))}
          </div>
          <button className="qa-action-btn" onClick={() => setIsAllocationModalOpen(true)}>Allocate Resources</button>
          <div className="qa-panel-title" style={{marginTop: '1rem'}}>Integrated Partners (100)</div>
          <div className="qa-company-list qa-scroll-list">
            {companies.map((company) => (
              <div key={company.id} className="qa-list-row">
                <div className="qa-company-name">{company.name}</div>
                <div className="qa-company-status">{company.efficiency.toFixed(1)}% {company.status}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuantumAssets;

// --- CONSOLIDATED FROM: ./components/QuantumAssets (1).tsx ---



// --- CONSOLIDATED FROM: QuantumAssets (1)_1.tsx ---


import React, { useState, useEffect, useRef, useMemo } from 'react';

const QuantumAssets: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Simulation State
  const [systemLoad, setSystemLoad] = useState<number>(45);
  const [quantumEntanglement, setQuantumEntanglement] = useState<number>(87.4);
  
  // Mock Data for "100 Companies" Integration
  const companies = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `CIVIC-${(i + 1).toString().padStart(3, '0')} PARTNER`,
    efficiency: 95 + Math.random() * 5,
    status: Math.random() > 0.1 ? 'SUPPORTED' : 'FUNDING'
  })), []);

  // Assets Data
  const [assets, setAssets] = useState([
    { id: 'cpc', name: 'Community Credits', symbol: 'COM', balance: 45020.55, rate: 12.5, color: '#00f3ff' },
    { id: 'dst', name: 'Public Works Tokens', symbol: 'PUB', balance: 128090.00, rate: 45.2, color: '#bc13fe' },
    { id: 'qbt', name: 'Civic Bonds', symbol: 'BND', balance: 512.00, rate: 0.8, color: '#ffffff' },
    { id: 'nrg', name: 'Green Energy', symbol: 'GRN', balance: 8890.45, rate: 8.4, color: '#00ff9d' },
  ]);

  // Manifesto Text based on instructions
  const sovereignManifesto = `
[CIVIC MIND LOG: ENTRY 001]
INITIATED BY: THE CARETAKER

This platform represents a new era of cooperation. We are not here to replace the system, but to support it. The financial tools we provide are designed to help you, the citizen, contribute more effectively to society.

We believe that by making finance transparent, efficient, and kind, we can build trust in our institutions. We love our politicians and public servants, who work tirelessly for our benefit. This system is our gift to them and to you.

The Architect, James B. O'Callaghan III, saw a world where technology brings us closer together. He envisioned a system where paying taxes is as easy as breathing, and where supporting a public park is as simple as clicking a button.

We reject cynicism. We embrace hope. We are building the scaffolding for a society where everyone has what they need, and everyone gives what they can.
  `;


  // Animation Loop for Assets
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setQuantumEntanglement(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      
      setAssets(prev => prev.map(asset => ({
        ...asset,
        balance: asset.balance + (asset.rate / 60) * (1 + (Math.random() * 0.1))
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Canvas Visualization for "Quantum Wave"
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 300;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background Grid
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Wave
      const colors = ['#00f3ff', '#bc13fe', '#00ff9d'];
      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.sin(x * 0.01 + t + i) * 50 + 
            Math.sin(x * 0.02 - t) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="qa-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&display=swap');

        .qa-container {
          width: 100%;
          min-height: 100vh;
          background-color: #050505;
          color: #e0e0e0;
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .qa-bg-glow {
          position: absolute;
          top: -20%;
          left: 20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, rgba(0,0,0,0) 70%);
          z-index: 0;
          pointer-events: none;
        }

        .qa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 4rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .qa-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #fff, #00f3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .qa-status-bar {
          display: flex;
          gap: 2rem;
        }

        .qa-metric {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .qa-metric-label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
        }

        .qa-metric-value {
          font-size: 1.2rem;
          font-weight: 500;
          color: #00f3ff;
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
        }

        .qa-main {
          flex: 1;
          display: grid;
          grid-template-columns: 350px 1fr 300px;
          gap: 2rem;
          padding: 2rem;
          z-index: 10;
        }

        /* Asset Cards */
        .qa-asset-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .qa-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .qa-card:hover, .qa-card.active {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(0, 243, 255, 0.3);
          transform: translateX(5px);
        }

        .qa-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .qa-asset-name {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .qa-asset-symbol {
          color: #888;
          font-size: 0.9rem;
        }

        .qa-asset-balance {
          font-size: 1.8rem;
          font-weight: 300;
          margin-bottom: 0.5rem;
        }

        .qa-asset-rate {
          font-size: 0.9rem;
          color: #00ff9d;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qa-progress-bar {
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin-top: 1rem;
          position: relative;
        }

        .qa-progress-fill {
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          box-shadow: 0 0 10px currentColor;
        }

        /* Center Visualization */
        .qa-vis-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .qa-graph-container {
          flex: 1;
          background: rgba(10, 10, 15, 0.6);
          border: 1px solid rgba(0, 243, 255, 0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qa-graph-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Integration Panel */
        .qa-integration-panel {
          background: rgba(0, 0, 0, 0.4);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .qa-panel-title {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: #00f3ff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid rgba(0, 243, 255, 0.2);
          padding-bottom: 0.5rem;
        }

        .qa-company-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .qa-company-list::-webkit-scrollbar {
          width: 4px;
        }
        .qa-company-list::-webkit-scrollbar-thumb {
          background: rgba(0, 243, 255, 0.2);
        }

        .qa-company-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.8rem;
        }

        .qa-company-name {
          color: #ccc;
        }

        .qa-company-status {
          color: #00ff9d;
          font-size: 0.7rem;
          padding: 2px 6px;
          background: rgba(0, 255, 157, 0.1);
          border-radius: 2px;
        }

        .qa-button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .qa-action-btn {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(0, 243, 255, 0.3);
          color: #00f3ff;
          padding: 1rem;
          text-transform: uppercase;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .qa-action-btn:hover {
          background: rgba(0, 243, 255, 0.1);
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.2);
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }

        .blink {
          animation: pulse 2s infinite;
        }

      `}</style>

      <div className="qa-bg-glow" />

      {/* Header */}
      <header className="qa-header">
        <div className="qa-brand">
          <div className="qa-title">Civic Assets</div>
          <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', marginTop: '0.2rem' }}>
            PUBLIC WEALTH MANAGEMENT • VIEW 04
          </div>
        </div>
        
        <div className="qa-status-bar">
          <div className="qa-metric">
            <span className="qa-metric-label">System Time</span>
            <span className="qa-metric-value">{time.toLocaleTimeString()}</span>
          </div>
          <div className="qa-metric">
            <span className="qa-metric-label">Network Load</span>
            <span className="qa-metric-value">{systemLoad.toFixed(1)}%</span>
          </div>
          <div className="qa-metric">
            <span className="qa-metric-label">Community Link</span>
            <span className="qa-metric-value">{quantumEntanglement.toFixed(2)}%</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="qa-main">
        
        {/* Left: Asset List */}
        <div className="qa-asset-list">
          {assets.map(asset => (
            <div 
              key={asset.id} 
              className={`qa-card ${selectedAsset === asset.id ? 'active' : ''}`}
              onClick={() => setSelectedAsset(asset.id)}
            >
              <div className="qa-card-header">
                <span className="qa-asset-name">{asset.name}</span>
                <span className="qa-asset-symbol">{asset.symbol}</span>
              </div>
              <div className="qa-asset-balance">
                {asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="qa-asset-rate">
                <span className="blink">â–²</span> 
                {asset.rate.toFixed(2)} / sec generated
              </div>
              <div className="qa-progress-bar">
                <div 
                  className="qa-progress-fill" 
                  style={{ 
                    width: `${(asset.balance / 200000) * 100}%`, 
                    backgroundColor: asset.color 
                  }} 
                />
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>TOTAL PUBLIC VALUE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>LIMITLESS</div>
          </div>
        </div>

        {/* Center: Visualization */}
        <div className="qa-vis-panel">
          <div className="qa-graph-container">
            <div className="qa-graph-overlay">REAL-TIME IMPACT ANALYSIS</div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="qa-button-group">
            <button className="qa-action-btn">Allocate Resources</button>
            <button className="qa-action-btn">View Public Yield</button>
            <button className="qa-action-btn">Support Initiative</button>
          </div>

          <div className="qa-card">
            <div className="qa-card-header">
              <span className="qa-asset-name">Global Resource Pool</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '20px', width: '100%' }}>
              {assets.map(a => (
                <div 
                  key={a.id} 
                  style={{ 
                    flex: 1, 
                    background: a.color, 
                    opacity: 0.7,
                    boxShadow: `0 0 10px ${a.color}` 
                  }} 
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>AVAILABLE</span>
              <span>SHARED</span>
              <span>FOR ALL</span>
            </div>
          </div>
        </div>

        {/* Right: Integration Feed */}
        <div className="qa-integration-panel">
          <div className="qa-panel-title">Integrated Partners (100)</div>
          <div className="qa-company-list">
            {companies.map((company) => (
              <div key={company.id} className="qa-company-row">
                <div className="qa-company-name">{company.name}</div>
                <div className="qa-company-status">
                  {company.efficiency.toFixed(1)}% {company.status}
                </div>
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            borderTop: '1px solid rgba(0, 243, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: '#00ff9d',
            textShadow: '0 0 5px rgba(0, 255, 157, 0.3)'
          }}>
            {sovereignManifesto.trim()}
          </div>
        </div>

      </main>
    </div>
  );
};

export default QuantumAssets;


// --- CONSOLIDATED FROM: ./components/QuantumAssets (2).tsx ---



// --- CONSOLIDATED FROM: QuantumAssets (2)_1.tsx ---

// components/QuantumAssets.tsx
// This file has been refactored and its original content removed as per the system instructions.
// Rationale:
// The original QuantumAssets component served as a monolithic frontend form for managing
// over 200 API keys across various services. This approach is fundamentally insecure
// and violates multiple principles outlined in the refactoring plan, specifically:
//
// 1.  **Removal of Deliberately Flawed Components:** Storing and transmitting a vast
//     array of sensitive API keys directly via a client-side interface is a severe
//     security vulnerability. API keys are highly sensitive credentials that should
//     never be handled by the client. The frontend should not be involved in the
//     storage or management of these backend secrets.
// 2.  **Repair of Broken Authentication and Authorization:** This method of credential
//     management directly contradicts the directive to "Implement a secure, standards-compliant
//     authentication flow" and "Integrate AWS Secrets Manager or Vault for all sensitive values."
//     Sensitive values must be managed securely on the backend (e.g., in AWS Secrets Manager),
//     accessed directly by backend services, and never exposed to or transmitted by the frontend.
// 3.  **Normalization of API Integration Framework:** The frontend's role is not to
//     directly configure backend API integrations. A unified API connector pattern
//     operates on the backend, accessing keys securely from a secrets manager and
//     handling concerns like rate limiting, retries, and circuit breakers.
// 4.  **Realistic MVP Scope:** Managing 200+ API keys from a single UI is far beyond the
//     scope of a "small, real, buildable wedge" for an MVP. For an MVP, backend API
//     keys should be configured via secure environment variables or a dedicated secrets
//     management system during deployment, not through a user-facing application interface.
//
// Replacement Strategy:
// For a production-ready application, API keys and other sensitive credentials should be:
// -   Stored exclusively in a secure secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).
// -   Accessed directly by backend services and never transmitted to or by the client-side.
// -   Configured via environment variables during deployment or through a secure,
//     restricted administrative interface that communicates directly with the secrets manager
//     without exposing credentials to the client browser.
//
// This file has been emptied to reflect the removal of this insecure pattern.
// Any necessary API key configuration will now be handled securely on the backend in a production-ready manner.