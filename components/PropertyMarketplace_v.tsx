

// --- CONSOLIDATED FROM: ./components/real-estate/PropertyMarketplace_v2.tsx ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Filter, Home, FileText, ShieldCheck, DollarSign, MapPin, 
  Building, Scale, ArrowRight, CheckCircle2, AlertTriangle, Clock, 
  Download, ExternalLink, RefreshCw, Info, User, Briefcase, 
  FileSpreadsheet, Globe, BookOpen, Bot, Send, Sparkles, Code, 
  Terminal, Play, Cpu, ChevronRight, Layers, FileCode, Check, X, 
  Landmark, Zap, Lock, Unlock, Database, Eye, MessageSquare, 
  BarChart3, Sliders, Award, Sparkle
} from 'lucide-react';
import Card from '../Card';

// Define interfaces for tokenized real estate assets
interface Property {
  id: string;
  title: string;
  type: 'Residential' | 'Commercial' | 'Industrial';
  address: string;
  city: string;
  state: string;
  image: string;
  tokenPrice: number;
  targetYield: number;
  irr: number;
  capRate: number;
  totalTokens: number;
  availableTokens: number;
  tokenSymbol: string;
  contractAddress: string;
  blockchain: string;
  occupancyRate: number;
  valuation: number;
  riskScore: 'AA' | 'A' | 'B+' | 'B' | 'C';
  description: string;
  monthlyDistribution: number;
  alpacaCollateralFactor: number; // Percentage of value allowed for margin collateral
  documents: { name: string; size: string; type: string }[];
}

export default function PropertyMarketplace_v2() {
  // Mock initial properties
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 'prop-001',
      title: 'The Grandview Heights Apartments',
      type: 'Residential',
      address: '1420 Brickell Ave',
      city: 'Miami',
      state: 'FL',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      tokenPrice: 50.00,
      targetYield: 8.45,
      irr: 12.2,
      capRate: 6.1,
      totalTokens: 40000,
      availableTokens: 12450,
      tokenSymbol: 'GRND-MIA',
      contractAddress: '0x71C2B138E6e112d577A142033e589a02289a77E1',
      blockchain: 'Sovereign Ledger (EVM)',
      occupancyRate: 96.5,
      valuation: 2000000,
      riskScore: 'A',
      description: 'A premium multi-family residential complex located in the heart of Miami\'s financial district. Features high historical occupancy, recent renovations, and strong rental growth projections.',
      monthlyDistribution: 0.35,
      alpacaCollateralFactor: 75,
      documents: [
        { name: 'Property Appraisal Report.pdf', size: '4.2 MB', type: 'PDF' },
        { name: 'Phase I Environmental Assessment.pdf', size: '2.8 MB', type: 'PDF' },
        { name: 'Tokenization Prospectus & Legal Framework.pdf', size: '1.5 MB', type: 'PDF' },
        { name: 'Deed of Trust & Title Insurance.pdf', size: '3.1 MB', type: 'PDF' }
      ]
    },
    {
      id: 'prop-002',
      title: 'Silicon Plaza Office Complex',
      type: 'Commercial',
      address: '3200 Innovation Way',
      city: 'San Jose',
      state: 'CA',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      tokenPrice: 100.00,
      targetYield: 9.15,
      irr: 14.5,
      capRate: 7.2,
      totalTokens: 100000,
      availableTokens: 34100,
      tokenSymbol: 'SLCN-SJC',
      contractAddress: '0x3a2F1298E6e112d577A142033e589a02289af12C',
      blockchain: 'Sovereign Ledger (EVM)',
      occupancyRate: 92.0,
      valuation: 10000000,
      riskScore: 'B+',
      description: 'Class-A commercial office space anchored by multi-year technology enterprise tenants. Strategically positioned in Silicon Valley with triple-net (NNN) leases securing stable cash flows.',
      monthlyDistribution: 0.76,
      alpacaCollateralFactor: 65,
      documents: [
        { name: 'Commercial Lease Agreements Summary.pdf', size: '5.1 MB', type: 'PDF' },
        { name: 'Structural Engineering Audit.pdf', size: '8.4 MB', type: 'PDF' },
        { name: 'SEC Regulation D Filing.pdf', size: '1.1 MB', type: 'PDF' }
      ]
    },
    {
      id: 'prop-003',
      title: 'Logistics Hub East',
      type: 'Industrial',
      address: '750 Portside Blvd',
      city: 'Savannah',
      state: 'GA',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      tokenPrice: 250.00,
      targetYield: 10.80,
      irr: 16.2,
      capRate: 8.4,
      totalTokens: 20000,
      availableTokens: 1850,
      tokenSymbol: 'LOGI-SAV',
      contractAddress: '0x9b8C4398E6e112d577A142033e589a02289ac43B',
      blockchain: 'Sovereign Ledger (EVM)',
      occupancyRate: 100.0,
      valuation: 5000000,
      riskScore: 'AA',
      description: 'A state-of-the-art distribution center located adjacent to the Port of Savannah. Fully leased to a global logistics provider with CPI-linked annual rent escalations.',
      monthlyDistribution: 2.25,
      alpacaCollateralFactor: 80,
      documents: [
        { name: 'Port Authority Proximity Analysis.pdf', size: '1.9 MB', type: 'PDF' },
        { name: 'ALTA Land Title Survey.pdf', size: '12.2 MB', type: 'PDF' },
        { name: 'Tenant Financial Health Report.pdf', size: '2.3 MB', type: 'PDF' }
      ]
    },
    {
      id: 'prop-004',
      title: 'Aura Luxury Apartments',
      type: 'Residential',
      address: '808 Congress Ave',
      city: 'Austin',
      state: 'TX',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      tokenPrice: 25.00,
      targetYield: 7.90,
      irr: 11.8,
      capRate: 5.8,
      totalTokens: 160000,
      availableTokens: 89200,
      tokenSymbol: 'AURA-AUS',
      contractAddress: '0x5e1D8898E6e112d577A142033e589a02289ad88E',
      blockchain: 'Sovereign Ledger (EVM)',
      occupancyRate: 98.1,
      valuation: 4000000,
      riskScore: 'A',
      description: 'Modern, eco-friendly luxury apartment complex in downtown Austin. High demand from tech professionals, featuring smart home integrations and top-tier community amenities.',
      monthlyDistribution: 0.16,
      alpacaCollateralFactor: 70,
      documents: [
        { name: 'Green Building Certification.pdf', size: '1.4 MB', type: 'PDF' },
        { name: 'Austin Downtown Market Report.pdf', size: '3.7 MB', type: 'PDF' }
      ]
    }
  ]);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Residential' | 'Commercial' | 'Industrial'>('All');
  const [minYield, setMinYield] = useState<number>(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'tokenomics' | 'ai-underwriting' | 'documents'>('overview');
  
  // Investment Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  
  // Tokenization Form State
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [newProp, setNewProp] = useState({
    title: '',
    type: 'Residential' as 'Residential' | 'Commercial' | 'Industrial',
    address: '',
    city: '',
    state: '',
    valuation: 500000,
    tokenPrice: 50,
    targetYield: 8.0,
    description: '',
    tokenSymbol: ''
  });

  // AI Underwriter State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  // Console / Event Log State
  const [logs, setLogs] = useState<{ timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, type }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    addLog('Property Marketplace initialized. Connected to Sovereign Ledger.', 'success');
    addLog('Alpaca Collateral Bridge status: Active. Real-time margin valuation enabled.', 'info');
  }, []);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || p.type === selectedType;
      const matchesYield = p.targetYield >= minYield;
      return matchesSearch && matchesType && matchesYield;
    });
  }, [properties, searchTerm, selectedType, minYield]);

  // Handle simulated purchase
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedTokens, setPurchasedTokens] = useState(0);

  const handlePurchase = (property: Property, amount: number) => {
    const tokensToBuy = Math.floor(amount / property.tokenPrice);
    if (tokensToBuy <= 0) {
      addLog('Invalid purchase amount. Must be at least the price of one token.', 'error');
      return;
    }
    if (tokensToBuy > property.availableTokens) {
      addLog(`Insufficient tokens available. Only ${property.availableTokens} remaining.`, 'warning');
      return;
    }

    setPurchaseLoading(true);
    addLog(`Initiating smart contract transaction to mint/transfer ${tokensToBuy} ${property.tokenSymbol} tokens...`, 'info');

    setTimeout(() => {
      setProperties(prev => prev.map(p => {
        if (p.id === property.id) {
          return {
            ...p,
            availableTokens: p.availableTokens - tokensToBuy
          };
        }
        return p;
      }));
      setPurchaseLoading(false);
      setPurchaseSuccess(true);
      setPurchasedTokens(tokensToBuy);
      addLog(`Successfully purchased ${tokensToBuy} ${property.tokenSymbol} for $${(tokensToBuy * property.tokenPrice).toLocaleString()}`, 'success');
      addLog(`Sovereign Ledger Sync: Block #1849201 confirmed. Tx Hash: 0x${Math.random().toString(16).substr(2, 40)}`, 'success');
      addLog(`Alpaca Collateral Bridge: Updated margin borrowing power by +$${((tokensToBuy * property.tokenPrice) * (property.alpacaCollateralFactor / 100)).toLocaleString()}`, 'info');
    }, 2000);
  };

  // Handle simulated AI Underwriting
  const runAiUnderwriter = (property: Property) => {
    setAiLoading(true);
    setAiReport(null);
    addLog(`Requesting Gemini AI Underwriting analysis for ${property.title}...`, 'info');

    setTimeout(() => {
      const report = `### GEMINI AI UNDERWRITING REPORT: ${property.title.toUpperCase()}
**Date:** ${new Date().toLocaleDateString()}  
**Risk Rating:** ${property.riskScore} | **Target Yield:** ${property.targetYield}% | **IRR:** ${property.irr}%

#### 1. Executive Summary
The asset at **${property.address}, ${property.city}, ${property.state}** represents a highly optimized tokenized ${property.type.toLowerCase()} opportunity. Our models indicate a strong alignment with institutional-grade risk-adjusted return profiles.

#### 2. Financial Health & Yield Sustainability
* **Cap Rate Analysis:** At ${property.capRate}%, the property yields a healthy spread over current risk-free rates.
* **Occupancy Stability:** The current occupancy of ${property.occupancyRate}% is well above the submarket average of 89.4%.
* **Distribution Safety:** The monthly distribution of $${property.monthlyDistribution} per token is fully covered by net operating income (NOI) with a Debt Service Coverage Ratio (DSCR) of 1.45x.

#### 3. Market & Demographic Tailwinds
* **Location Score:** 8.8/10. High-growth corridor with positive net migration and strong employment drivers.
* **Supply Risk:** Low. Zoning restrictions and high construction costs limit competitive supply additions over the next 36 months.

#### 4. Tokenomics & Liquidity Assessment
* **Collateralization Potential:** This asset qualifies for a **${property.alpacaCollateralFactor}% collateral factor** on the Alpaca Broker Bridge, allowing instant liquidity generation without asset liquidation.
* **Smart Contract Audit:** Verified EVM contract at \`${property.contractAddress}\` with multi-sig governance and automated compliance checks.

#### 5. Recommendation
**OVERWEIGHT / BUY.** Excellent foundational asset for yield-focused digital portfolios. Recommended allocation: 5-12% of real estate sleeve.`;
      
      setAiReport(report);
      setAiLoading(false);
      addLog(`Gemini AI Underwriting report generated for ${property.tokenSymbol}.`, 'success');
    }, 2500);
  };

  // Handle simulated Tokenization of a new asset
  const handleTokenizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.title || !newProp.address || !newProp.valuation) {
      addLog('Please fill in all required fields for tokenization.', 'warning');
      return;
    }

    addLog(`Initiating tokenization pipeline for "${newProp.title}"...`, 'info');
    addLog('Verifying deed registry and title authenticity via Government Gateway...', 'info');

    setTimeout(() => {
      const totalTokens = Math.floor(newProp.valuation / newProp.tokenPrice);
      const symbol = newProp.tokenSymbol || newProp.title.split(' ').map(w => w[0]).join('').toUpperCase() + '-' + newProp.city.substring(0, 3).toUpperCase();
      const contract = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const newlyTokenized: Property = {
        id: `prop-${Date.now()}`,
        title: newProp.title,
        type: newProp.type,
        address: newProp.address,
        city: newProp.city,
        state: newProp.state,
        image: newProp.type === 'Residential' 
          ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
          : newProp.type === 'Commercial'
          ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        tokenPrice: Number(newProp.tokenPrice),
        targetYield: Number(newProp.targetYield),
        irr: Number(newProp.targetYield) * 1.4,
        capRate: Number(newProp.targetYield) * 0.7,
        totalTokens: totalTokens,
        availableTokens: totalTokens,
        tokenSymbol: symbol,
        contractAddress: contract,
        blockchain: 'Sovereign Ledger (EVM)',
        occupancyRate: 100.0,
        valuation: Number(newProp.valuation),
        riskScore: 'A',
        description: newProp.description || 'Newly tokenized asset registered on the Sovereign Ledger. Fully compliant with SEC Reg D / Reg S frameworks.',
        monthlyDistribution: (Number(newProp.valuation) * (Number(newProp.targetYield) / 100)) / totalTokens / 12,
        alpacaCollateralFactor: 70,
        documents: [
          { name: 'Deed Registration Certificate.pdf', size: '1.2 MB', type: 'PDF' },
          { name: 'Smart Contract Audit Report.pdf', size: '2.4 MB', type: 'PDF' }
        ]
      };

      setProperties(prev => [newlyTokenized, ...prev]);
      setIsTokenizing(false);
      addLog(`Successfully tokenized "${newProp.title}"! Minted ${totalTokens.toLocaleString()} ${symbol} tokens.`, 'success');
      addLog(`Smart Contract deployed at ${contract}`, 'success');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Building className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">Sovereign Real Estate</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Property Marketplace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Fractionalized, institutional-grade real estate tokenized on the Sovereign Ledger with Alpaca Collateral integration.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsTokenizing(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Tokenize New Asset
          </button>
          <button 
            onClick={() => {
              addLog('Refreshing marketplace data and smart contract states...', 'info');
              // Simulate refresh
            }}
            className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-slate-800 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Total Value Locked</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">
                ${properties.reduce((acc, p) => acc + p.valuation, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Verified Assets</span>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Average Target Yield</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                {(properties.reduce((acc, p) => acc + p.targetYield, 0) / properties.length).toFixed(2)}%
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <span>Monthly distributions in USD/USDC</span>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Active Smart Contracts</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">
                {properties.length}
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Code className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
            <ShieldCheck className="w-3 h-3" />
            <span>EVM Compliant ERC-1400</span>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Alpaca Collateral Power</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-400">
                Up to 80%
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
            <Award className="w-3 h-3" />
            <span>Instant Margin Borrowing</span>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-slate-900/30 p-4 rounded-xl border border-slate-800/80">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name, city, or token symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
            {(['All', 'Residential', 'Commercial', 'Industrial'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedType === type 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400 font-medium">Min Yield:</span>
            <select 
              value={minYield} 
              onChange={(e) => setMinYield(Number(e.target.value))}
              className="bg-transparent text-xs text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-slate-900 text-slate-200">Any</option>
              <option value={7} className="bg-slate-900 text-slate-200">7%+</option>
              <option value={8} className="bg-slate-900 text-slate-200">8%+</option>
              <option value={9} className="bg-slate-900 text-slate-200">9%+</option>
              <option value={10} className="bg-slate-900 text-slate-200">10%+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProperties.map((property) => {
          const percentSold = ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100;
          return (
            <Card 
              key={property.id} 
              className="bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Image & Badges */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-slate-900/90 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
                    {property.type}
                  </span>
                  <span className="bg-emerald-950/90 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {property.targetYield}% Yield
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    property.riskScore.startsWith('A') 
                      ? 'bg-blue-950/90 text-blue-400 border-blue-800' 
                      : 'bg-amber-950/90 text-amber-400 border-amber-800'
                  }`}>
                    Risk: {property.riskScore}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      {property.city}, {property.state}
                    </p>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 px-2 py-1 rounded text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Token Price</p>
                    <p className="text-sm font-bold text-emerald-400">${property.tokenPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {property.tokenSymbol}
                  </span>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {property.description}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 mb-4 text-center">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">IRR</p>
                    <p className="text-sm font-bold text-slate-200">{property.irr}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Cap Rate</p>
                    <p className="text-sm font-bold text-slate-200">{property.capRate}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Occupancy</p>
                    <p className="text-sm font-bold text-slate-200">{property.occupancyRate}%</p>
                  </div>
                </div>

                {/* Token Sale Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Token Sale Progress</span>
                    <span className="font-semibold text-slate-200">{percentSold.toFixed(1)}% Sold</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentSold}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{property.availableTokens.toLocaleString()} available</span>
                    <span>{property.totalTokens.toLocaleString()} total</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedProperty(property);
                      setActiveTab('overview');
                      setCalcAmount(1000);
                      setPurchaseSuccess(false);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-semibold transition-all border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedProperty(property);
                      setActiveTab('ai-underwriting');
                      runAiUnderwriter(property);
                    }}
                    className="bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/60 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    title="AI Underwrite"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    AI Audit
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Event Logs / Console */}
      <Card className="bg-slate-900/20 border-slate-800 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Sovereign Real Estate Ledger Logs</h4>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-semibold"
          >
            Clear Logs
          </button>
        </div>
        <div className="font-mono text-[11px] space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">No recent ledger events.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-500">[{log.timestamp}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warning' ? 'text-amber-400' :
                  log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {selectedProperty.type}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {selectedProperty.tokenSymbol}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-100">{selectedProperty.title}</h2>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
                </p>
              </div>
              <button 
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
              {(['overview', 'financials', 'tokenomics', 'ai-underwriting', 'documents'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all uppercase tracking-wider ${
                    activeTab === tab 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Image & Description */}
                  <div className="md:col-span-2 space-y-4">
                    <img 
                      src={selectedProperty.image} 
                      alt={selectedProperty.title} 
                      className="w-full h-64 object-cover rounded-xl border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">About the Property</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {selectedProperty.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Quick Invest & Calculator */}
                  <div className="space-y-4">
                    <Card className="bg-slate-950 border-slate-800 p-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Investment Calculator
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Investment Amount (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input 
                              type="number" 
                              value={calcAmount}
                              onChange={(e) => setCalcAmount(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Estimated Tokens:</span>
                            <span className="font-bold text-slate-200">
                              {Math.floor(calcAmount / selectedProperty.tokenPrice).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Target Annual Yield:</span>
                            <span className="font-bold text-emerald-400">
                              {selectedProperty.targetYield}%
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800 pt-2">
                            <span className="text-slate-400">Est. Monthly Payout:</span>
                            <span className="font-bold text-emerald-400">
                              ${((calcAmount * (selectedProperty.targetYield / 100)) / 12).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Est. Annual Payout:</span>
                            <span className="font-bold text-emerald-400">
                              ${(calcAmount * (selectedProperty.targetYield / 100)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {purchaseSuccess ? (
                          <div className="bg-emerald-950/30 border border-emerald-800 p-3 rounded-lg text-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                            <p className="text-xs font-bold text-emerald-400">Purchase Confirmed!</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Minted {purchasedTokens} {selectedProperty.tokenSymbol} tokens to your wallet.
                            </p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handlePurchase(selectedProperty, calcAmount)}
                            disabled={purchaseLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                          >
                            {purchaseLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing Ledger Transaction...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                Buy {Math.floor(calcAmount / selectedProperty.tokenPrice)} Tokens
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </Card>

                    {/* Alpaca Collateral Bridge Info */}
                    <Card className="bg-slate-950/40 border-slate-800 p-4 text-xs space-y-2">
                      <h5 className="font-bold text-slate-300 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-blue-400" />
                        Alpaca Collateral Bridge
                      </h5>
                      <p className="text-slate-400 leading-relaxed">
                        This asset is pre-approved for margin collateral. You can borrow up to <strong className="text-blue-400">{selectedProperty.alpacaCollateralFactor}%</strong> of your token value instantly on Alpaca.
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Property Valuation</p>
                      <p className="text-xl font-bold text-slate-200 mt-1">${selectedProperty.valuation.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Target Yield</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">{selectedProperty.targetYield}%</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Projected IRR</p>
                      <p className="text-xl font-bold text-blue-400 mt-1">{selectedProperty.irr}%</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Cap Rate</p>
                      <p className="text-xl font-bold text-slate-200 mt-1">{selectedProperty.capRate}%</p>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Annual Operating Projections</h4>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-900 pb-2">
                        <span className="text-slate-400">Gross Rental Income</span>
                        <span className="font-semibold text-slate-200">${(selectedProperty.valuation * 0.12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-2">
                        <span className="text-slate-400">Vacancy Allowance (5%)</span>
                        <span className="font-semibold text-rose-400">-${(selectedProperty.valuation * 0.12 * 0.05).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-2">
                        <span className="text-slate-400">Operating Expenses (Property Management, Taxes, Insurance)</span>
                        <span className="font-semibold text-rose-400">-${(selectedProperty.valuation * 0.035).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-2 font-bold text-slate-100">
                        <span>Net Operating Income (NOI)</span>
                        <span>${(selectedProperty.valuation * 0.079).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-emerald-400 font-bold">
                        <span>Annual Distributed Cash Flow</span>
                        <span>${(selectedProperty.valuation * (selectedProperty.targetYield / 100)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tokenomics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        Token Details
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Token Name</span>
                          <span className="font-semibold text-slate-200">{selectedProperty.title} Token</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Token Symbol</span>
                          <span className="font-mono font-semibold text-emerald-400">{selectedProperty.tokenSymbol}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Total Supply</span>
                          <span className="font-semibold text-slate-200">{selectedProperty.totalTokens.toLocaleString()} Tokens</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Blockchain Network</span>
                          <span className="font-semibold text-slate-200">{selectedProperty.blockchain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Token Standard</span>
                          <span className="font-semibold text-slate-200">ERC-1400 (Security Token)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-4 h-4 text-blue-500" />
                        Smart Contract Security
                      </h4>
                      <div className="space-y-3 text-xs text-slate-400">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono break-all">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Contract Address</p>
                          <p className="text-slate-300">{selectedProperty.contractAddress}</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Fully audited by Sovereign Security Engine</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Automated KYC/AML compliance checks on-chain</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400">
                          <Database className="w-4 h-4" />
                          <span>Oracle-verified property valuations updated quarterly</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai-underwriting' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Gemini AI Underwriter</h4>
                    </div>
                    <button 
                      onClick={() => runAiUnderwriter(selectedProperty)}
                      disabled={aiLoading}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                      Re-run Analysis
                    </button>
                  </div>

                  {aiLoading ? (
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-12 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                      <p className="text-sm text-slate-300 font-medium">Analyzing property data, submarket trends, and financial models...</p>
                      <p className="text-xs text-slate-500">Gemini AI is generating a comprehensive underwriting report.</p>
                    </div>
                  ) : aiReport ? (
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 font-sans text-sm text-slate-300 space-y-4 leading-relaxed max-h-[50vh] overflow-y-auto">
                      {/* Render markdown-like report */}
                      {aiReport.split('\n').map((line, i) => {
                        if (line.startsWith('###')) {
                          return <h3 key={i} className="text-lg font-bold text-slate-100 mt-4 mb-2 border-b border-slate-800 pb-1">{line.replace('###', '')}</h3>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold text-emerald-400 mt-2">{line.replace(/\*\*/g, '')}</p>;
                        }
                        if (line.startsWith('*')) {
                          return <li key={i} className="ml-4 list-disc text-slate-300 my-1">{line.replace('*', '').trim()}</li>;
                        }
                        if (line.startsWith('####')) {
                          return <h4 key={i} className="text-sm font-bold text-emerald-400 uppercase tracking-wider mt-4 mb-1">{line.replace('####', '')}</h4>;
                        }
                        return <p key={i} className="my-1">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-12 text-center space-y-3">
                      <Bot className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-400">No AI Underwriting report generated yet.</p>
                      <button 
                        onClick={() => runAiUnderwriter(selectedProperty)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        Generate Report
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Legal & Property Documentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProperty.documents.map((doc, i) => (
                      <div 
                        key={i} 
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-900 rounded-lg text-emerald-500">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{doc.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{doc.size} • {doc.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => addLog(`Downloading document: ${doc.name}`, 'info')}
                          className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tokenize New Asset Modal */}
      {isTokenizing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-100">Tokenize Real Estate Asset</h3>
              </div>
              <button 
                onClick={() => setIsTokenizing(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTokenizeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Property Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newProp.title}
                    onChange={(e) => setNewProp({...newProp, title: e.target.value})}
                    placeholder="e.g. Sunset Valley Apartments"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Asset Type *</label>
                  <select 
                    value={newProp.type}
                    onChange={(e) => setNewProp({...newProp, type: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Token Symbol (Optional)</label>
                  <input 
                    type="text" 
                    value={newProp.tokenSymbol}
                    onChange={(e) => setNewProp({...newProp, tokenSymbol: e.target.value})}
                    placeholder="e.g. SUN-VAL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Street Address *</label>
                  <input 
                    type="text" 
                    required
                    value={newProp.address}
                    onChange={(e) => setNewProp({...newProp, address: e.target.value})}
                    placeholder="e.g. 100 Sunset Blvd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">City *</label>
                  <input 
                    type="text" 
                    required
                    value={newProp.city}
                    onChange={(e) => setNewProp({...newProp, city: e.target.value})}
                    placeholder="e.g. Los Angeles"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">State *</label>
                  <input 
                    type="text" 
                    required
                    value={newProp.state}
                    onChange={(e) => setNewProp({...newProp, state: e.target.value})}
                    placeholder="e.g. CA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Valuation (USD) *</label>
                  <input 
                    type="number" 
                    required
                    value={newProp.valuation}
                    onChange={(e) => setNewProp({...newProp, valuation: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Token Price (USD) *</label>
                  <input 
                    type="number" 
                    required
                    value={newProp.tokenPrice}
                    onChange={(e) => setNewProp({...newProp, tokenPrice: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Target Yield (%) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newProp.targetYield}
                    onChange={(e) => setNewProp({...newProp, targetYield: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Property Description</label>
                <textarea 
                  value={newProp.description}
                  onChange={(e) => setNewProp({...newProp, description: e.target.value})}
                  placeholder="Describe the property, tenants, and investment thesis..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsTokenizing(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-semibold transition-all shadow-lg shadow-emerald-900/20"
                >
                  Deploy Smart Contract
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}