

// --- CONSOLIDATED FROM: ./components/tax-liens/TaxLienAuctions.tsx ---

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Map, ShieldAlert, DollarSign, Percent, Calendar, 
  CheckCircle, AlertTriangle, Play, Plus, Trash2, Info, Compass, 
  Layers, FileText, TrendingUp, Cpu, HelpCircle, Check, Clock, 
  ChevronRight, RefreshCw, Award, MapPin, Download, ExternalLink,
  Sliders, BarChart2, BookOpen, ShieldCheck, Eye
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Parcel {
  id: string;
  pidn: string;
  address: string;
  county: string;
  owner: string;
  ownerStatus: 'Estate/Heirs' | 'Individual' | 'LLC' | 'Corporate';
  acres: number;
  zoning: string;
  landValue: number;
  improvementValue: number;
  delinquentBalance: number;
  yearsDelinquent: number;
  distressScore: number; // 1-100
  auctionDate: string;
  maxInterestRate: number;
  currentBidRate?: number;
  currentBidPremium?: number;
  bidType: 'Interest' | 'Premium';
  codeViolations: number;
  waterSewerOwed: number;
  titleStatus: 'Clear' | 'Pending Review' | 'Clouded' | 'Unexamined';
  gisCoordinates: {
    path: string;
    center: { x: number; y: number };
    dimensions: string;
    neighbors: string[];
  };
  aiRecommendation: string;
  aiConviction: 'High' | 'Medium' | 'Low';
}

interface ActiveBid {
  id: string;
  parcelId: string;
  pidn: string;
  address: string;
  county: string;
  bidType: 'Interest' | 'Premium';
  myBid: number;
  currentOpponentBid: number;
  status: 'Winning' | 'Outbid' | 'Won' | 'Redeemed' | 'Processing';
  timestamp: string;
}

interface ChecklistState {
  [parcelId: string]: {
    gisVerified: boolean;
    titleSearch: boolean;
    utilityAudit: boolean;
    codeViolations: boolean;
    bankruptcyCheck: boolean;
    aiValuation: boolean;
  };
}

// --- MOCK DATA ---
const INITIAL_PARCELS: Parcel[] = [
  {
    id: 'par-01',
    pidn: '30-4012-009-1120',
    address: '14200 SW 288th St, Homestead, FL 33033',
    county: 'Miami-Dade County, FL',
    owner: 'ESTATE OF ARTHUR PENDLETON',
    ownerStatus: 'Estate/Heirs',
    acres: 2.5,
    zoning: 'AU (Agricultural)',
    landValue: 125000,
    improvementValue: 0,
    delinquentBalance: 4850,
    yearsDelinquent: 3,
    distressScore: 94,
    auctionDate: '2026-09-15',
    maxInterestRate: 18,
    currentBidRate: 12.5,
    bidType: 'Interest',
    codeViolations: 0,
    waterSewerOwed: 350,
    titleStatus: 'Clear',
    gisCoordinates: {
      path: 'M 50,50 L 180,50 L 180,150 L 50,150 Z',
      center: { x: 115, y: 100 },
      dimensions: '330ft x 330ft',
      neighbors: ['par-02', 'par-03']
    },
    aiRecommendation: 'EXCELLENT TARGET. Vacant agricultural land with zero structural liabilities. Owner is deceased with no active probate. High probability of non-redemption or high-yield interest certificate.',
    aiConviction: 'High'
  },
  {
    id: 'par-02',
    pidn: '092-112-45-002',
    address: '4812 Crane St, Houston, TX 77026',
    county: 'Harris County, TX',
    owner: 'HEIRS OF BEATRICE GONZALEZ',
    ownerStatus: 'Estate/Heirs',
    acres: 0.18,
    zoning: 'SF (Single Family)',
    landValue: 45000,
    improvementValue: 12000,
    delinquentBalance: 8200,
    yearsDelinquent: 2,
    distressScore: 81,
    auctionDate: '2026-09-01',
    maxInterestRate: 25,
    currentBidPremium: 8500,
    bidType: 'Premium',
    codeViolations: 4500,
    waterSewerOwed: 1800,
    titleStatus: 'Pending Review',
    gisCoordinates: {
      path: 'M 190,50 L 290,50 L 290,120 L 190,120 Z',
      center: { x: 240, y: 85 },
      dimensions: '60ft x 130ft',
      neighbors: ['par-01', 'par-04']
    },
    aiRecommendation: 'MODERATE RISK. High delinquent balance relative to land value. Dilapidated structure present which may require demolition ($15k cost). Blight violations active. Bid conservatively.',
    aiConviction: 'Medium'
  },
  {
    id: 'par-03',
    pidn: '43-002-99-0142',
    address: '1204 Elmhurst Ave, Detroit, MI 48206',
    county: 'Wayne County, MI',
    owner: 'APEX GLOBAL HOLDINGS LLC',
    ownerStatus: 'LLC',
    acres: 0.12,
    zoning: 'R2 (Two-Family Residential)',
    landValue: 8000,
    improvementValue: 0,
    delinquentBalance: 1250,
    yearsDelinquent: 4,
    distressScore: 68,
    auctionDate: '2026-10-10',
    maxInterestRate: 18,
    currentBidRate: 18.0,
    bidType: 'Interest',
    codeViolations: 150,
    waterSewerOwed: 0,
    titleStatus: 'Clouded',
    gisCoordinates: {
      path: 'M 50,160 L 150,160 L 150,240 L 50,240 Z',
      center: { x: 100, y: 200 },
      dimensions: '50ft x 100ft',
      neighbors: ['par-01', 'par-05']
    },
    aiRecommendation: 'SPECULATIVE. Extremely low entry cost, but title is clouded by a secondary municipal utility lien. LLC owner appears inactive. Good for long-term land banking if cleared.',
    aiConviction: 'Low'
  },
  {
    id: 'par-04',
    pidn: '17-32-405-012',
    address: '7822 S Shore Dr, Chicago, IL 60649',
    county: 'Cook County, IL',
    owner: 'REGINALD & CLARA SMITH',
    ownerStatus: 'Individual',
    acres: 0.15,
    zoning: 'RT-4 (Multi-Unit)',
    landValue: 65000,
    improvementValue: 185000,
    delinquentBalance: 18400,
    yearsDelinquent: 2,
    distressScore: 75,
    auctionDate: '2026-09-22',
    maxInterestRate: 18,
    currentBidRate: 8.0,
    bidType: 'Interest',
    codeViolations: 800,
    waterSewerOwed: 3200,
    titleStatus: 'Clear',
    gisCoordinates: {
      path: 'M 160,130 L 290,130 L 290,240 L 160,240 Z',
      center: { x: 225, y: 185 },
      dimensions: '55ft x 120ft',
      neighbors: ['par-02', 'par-05']
    },
    aiRecommendation: 'HIGH YIELD POTENTIAL. Improved residential property in an improving submarket. High delinquent balance means substantial interest accumulation. Owner is active but struggling; high likelihood of redemption (92%), making this a pure interest-play.',
    aiConviction: 'High'
  },
  {
    id: 'par-05',
    pidn: '08-22-100-045',
    address: 'Sec 14 Twp 38 Rng 12, Vacant Forest, IL 60450',
    county: 'Cook County, IL',
    owner: 'UNKNOWN / OWNER OF RECORD',
    ownerStatus: 'Corporate',
    acres: 12.4,
    zoning: 'OS (Open Space / Conservation)',
    landValue: 98000,
    improvementValue: 0,
    delinquentBalance: 3100,
    yearsDelinquent: 5,
    distressScore: 89,
    auctionDate: '2026-09-22',
    maxInterestRate: 18,
    currentBidRate: 15.5,
    bidType: 'Interest',
    codeViolations: 0,
    waterSewerOwed: 0,
    titleStatus: 'Clear',
    gisCoordinates: {
      path: 'M 50,250 L 290,250 L 290,350 L 50,350 Z',
      center: { x: 170, y: 300 },
      dimensions: 'Irregular (12.4 Ac)',
      neighbors: ['par-03', 'par-04']
    },
    aiRecommendation: 'STRATEGIC LAND BANK. Large acreage parcel zoned for conservation. Zero maintenance overhead. Extremely high distress score due to 5 years of delinquency. High chance of securing deed or maximum interest.',
    aiConviction: 'High'
  }
];

export default function TaxLienAuctions() {
  // --- STATE ---
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('par-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [selectedOwnerStatus, setSelectedOwnerStatus] = useState<string>('All');
  const [minDistressScore, setMinDistressScore] = useState<number>(0);
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'zoning' | 'distress'>('vector');
  
  // Bidding State
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([
    {
      id: 'bid-01',
      parcelId: 'par-04',
      pidn: '17-32-405-012',
      address: '7822 S Shore Dr, Chicago, IL',
      county: 'Cook County, IL',
      bidType: 'Interest',
      myBid: 7.5,
      currentOpponentBid: 8.0,
      status: 'Winning',
      timestamp: '2026-08-17 08:12'
    }
  ]);
  const [bidInput, setBidInput] = useState<string>('');
  const [proxyBidLimit, setProxyBidLimit] = useState<string>('');
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistState>({
    'par-01': { gisVerified: true, titleSearch: true, utilityAudit: false, codeViolations: true, bankruptcyCheck: true, aiValuation: true },
    'par-02': { gisVerified: true, titleSearch: false, utilityAudit: false, codeViolations: false, bankruptcyCheck: true, aiValuation: false }
  });

  // Calculator State
  const [calcInterestRate, setCalcInterestRate] = useState<number>(18);
  const [calcRedemptionMonths, setCalcRedemptionMonths] = useState<number>(12);
  const [calcPenaltyRate, setCalcPenaltyRate] = useState<number>(5);
  const [calcAcquisitionCost, setCalcAcquisitionCost] = useState<number>(500);

  // --- MEMOIZED VALUES ---
  const selectedParcel = useMemo(() => {
    return parcels.find(p => p.id === selectedParcelId) || parcels[0];
  }, [parcels, selectedParcelId]);

  const counties = useMemo(() => {
    const list = new Set(parcels.map(p => p.county));
    return ['All', ...Array.from(list)];
  }, [parcels]);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesSearch = p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.pidn.includes(searchQuery) ||
                            p.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCounty = selectedCounty === 'All' || p.county === selectedCounty;
      const matchesOwner = selectedOwnerStatus === 'All' || p.ownerStatus === selectedOwnerStatus;
      const matchesDistress = p.distressScore >= minDistressScore;
      return matchesSearch && matchesCounty && matchesOwner && matchesDistress;
    });
  }, [parcels, searchQuery, selectedCounty, selectedOwnerStatus, minDistressScore]);

  // Sync calculator with selected parcel
  useEffect(() => {
    if (selectedParcel) {
      setCalcInterestRate(selectedParcel.maxInterestRate);
    }
  }, [selectedParcel]);

  // --- SIMULATED LIVE AUCTION ENGINE ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update opponent bids or trigger status changes for active bids
      setActiveBids(prevBids => {
        return prevBids.map(bid => {
          if (bid.status === 'Winning' && Math.random() > 0.7) {
            // Opponent outbids
            if (bid.bidType === 'Interest') {
              const newOpponentBid = Math.max(0.25, +(bid.myBid - (Math.random() * 1.5)).toFixed(2));
              return {
                ...bid,
                currentOpponentBid: newOpponentBid,
                status: newOpponentBid < bid.myBid ? 'Outbid' : 'Winning',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
              };
            } else {
              const newOpponentBid = bid.myBid + Math.floor(Math.random() * 500 + 100);
              return {
                ...bid,
                currentOpponentBid: newOpponentBid,
                status: newOpponentBid > bid.myBid ? 'Outbid' : 'Winning',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
              };
            }
          }
          return bid;
        });
      });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleSelectParcel = (id: string) => {
    setSelectedParcelId(id);
    const parcel = parcels.find(p => p.id === id);
    if (parcel) {
      setBidInput(parcel.bidType === 'Interest' ? (parcel.currentBidRate || parcel.maxInterestRate).toString() : (parcel.delinquentBalance + 100).toString());
    }
  };

  const handleToggleChecklist = (field: keyof ChecklistState[string]) => {
    setChecklist(prev => {
      const currentParcelChecklist = prev[selectedParcelId] || {
        gisVerified: false,
        titleSearch: false,
        utilityAudit: false,
        codeViolations: false,
        bankruptcyCheck: false,
        aiValuation: false
      };
      return {
        ...prev,
        [selectedParcelId]: {
          ...currentParcelChecklist,
          [field]: !currentParcelChecklist[field]
        }
      };
    });
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidInput) return;

    setIsSubmittingBid(true);

    setTimeout(() => {
      const newBidVal = parseFloat(bidInput);
      const newBid: ActiveBid = {
        id: `bid-${Date.now()}`,
        parcelId: selectedParcel.id,
        pidn: selectedParcel.pidn,
        address: selectedParcel.address.split(',')[0],
        county: selectedParcel.county,
        bidType: selectedParcel.bidType,
        myBid: newBidVal,
        currentOpponentBid: newBidVal,
        status: 'Winning',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setActiveBids(prev => [newBid, ...prev.filter(b => b.parcelId !== selectedParcel.id)]);
      
      // Update local parcel current bid
      setParcels(prevParcels => {
        return prevParcels.map(p => {
          if (p.id === selectedParcel.id) {
            return {
              ...p,
              currentBidRate: p.bidType === 'Interest' ? newBidVal : p.currentBidRate,
              currentBidPremium: p.bidType === 'Premium' ? newBidVal : p.currentBidPremium
            };
          }
          return p;
        });
      });

      setIsSubmittingBid(false);
    }, 1000);
  };

  const handleCancelBid = (bidId: string) => {
    setActiveBids(prev => prev.filter(b => b.id !== bidId));
  };

  // --- CALCULATOR COMPUTATIONS ---
  const calculatorResults = useMemo(() => {
    const principal = selectedParcel ? selectedParcel.delinquentBalance : 5000;
    const rateDecimal = calcInterestRate / 100;
    const timeFraction = calcRedemptionMonths / 12;
    
    const simpleInterest = principal * rateDecimal * timeFraction;
    const penalty = principal * (calcPenaltyRate / 100);
    const totalPayoff = principal + simpleInterest + penalty;
    const totalInvested = principal + calcAcquisitionCost;
    const netProfit = totalPayoff - totalInvested;
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
    const annualizedRoi = calcRedemptionMonths > 0 ? (roi / calcRedemptionMonths) * 12 : 0;

    return {
      principal,
      simpleInterest,
      penalty,
      totalPayoff,
      totalInvested,
      netProfit,
      roi,
      annualizedRoi
    };
  }, [selectedParcel, calcInterestRate, calcRedemptionMonths, calcPenaltyRate, calcAcquisitionCost]);

  // --- RENDER HELPERS ---
  const getDistressColor = (score: number) => {
    if (score >= 85) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const getTitleStatusColor = (status: Parcel['titleStatus']) => {
    switch (status) {
      case 'Clear': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Pending Review': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Clouded': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const currentChecklist = checklist[selectedParcelId] || {
    gisVerified: false,
    titleSearch: false,
    utilityAudit: false,
    codeViolations: false,
    bankruptcyCheck: false,
    aiValuation: false
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* HEADER */}
      <header className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Sovereign Tax Lien & GIS Command
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Alternative asset intelligence engine for municipal tax lien auctions, GIS parcel analysis, and automated bidding.
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">Tracked Parcels</span>
            <span className="text-lg font-bold text-slate-200">{parcels.length} Assets</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">Active Bids</span>
            <span className="text-lg font-bold text-emerald-400">{activeBids.length} Active</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">Total Bid Value</span>
            <span className="text-lg font-bold text-cyan-400">
              ${activeBids.reduce((acc, b) => acc + b.myBid, 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-400 block">Avg Distress Score</span>
            <span className="text-lg font-bold text-rose-400">
              {Math.round(parcels.reduce((acc, p) => acc + p.distressScore, 0) / parcels.length)}/100
            </span>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FILTERS & PARCEL LIST (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* FILTERS PANEL */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                Target Filters
              </h2>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCounty('All');
                  setSelectedOwnerStatus('All');
                  setMinDistressScore(0);
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Reset Filters
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search PIDN, address, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* County Filter */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Jurisdiction</label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  >
                    {counties.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Owner Status Filter */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Owner Profile</label>
                  <select
                    value={selectedOwnerStatus}
                    onChange={(e) => setSelectedOwnerStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="All">All Profiles</option>
                    <option value="Estate/Heirs">Estate / Heirs</option>
                    <option value="Individual">Individual</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              {/* Distress Score Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Min Distress Score</span>
                  <span className="text-rose-400 font-semibold">{minDistressScore}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minDistressScore}
                  onChange={(e) => setMinDistressScore(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* PARCEL LIST */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex-1 flex flex-col min-h-[400px] max-h-[600px] overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Available Parcels ({filteredParcels.length})
              </h2>
              <span className="text-xs text-slate-500">Click to inspect</span>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
              {filteredParcels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                  <AlertTriangle className="w-8 h-8 mb-2 text-slate-600" />
                  <p className="text-sm">No parcels match your criteria.</p>
                </div>
              ) : (
                filteredParcels.map((parcel) => {
                  const isSelected = parcel.id === selectedParcelId;
                  const distressColor = getDistressColor(parcel.distressScore);
                  
                  return (
                    <div
                      key={parcel.id}
                      onClick={() => handleSelectParcel(parcel.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                          : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs font-mono text-slate-400 font-semibold">
                          {parcel.pidn}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${distressColor}`}>
                          Distress: {parcel.distressScore}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-200 truncate mb-1">
                        {parcel.address}
                      </h3>

                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{parcel.county}</span>
                        <span className="font-semibold text-slate-300">{parcel.acres} Ac</span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-emerald-400">
                            {parcel.delinquentBalance.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500">({parcel.yearsDelinquent} yrs)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{parcel.auctionDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: GIS MAP & PROPERTY DETAILS (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* GIS MAP SIMULATOR */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  GIS Interactive Parcel Viewer
                </h2>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['vector', 'satellite', 'zoning', 'distress'] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setMapLayer(layer)}
                    className={`text-[10px] px-2 py-1 rounded-md font-semibold capitalize transition-colors ${
                      mapLayer === layer 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Map Canvas */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Satellite Background Simulation */}
              {mapLayer === 'satellite' && (
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900">
                  <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-emerald-900/10 blur-3xl"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-cyan-900/10 blur-3xl"></div>
                </div>
              )}

              {/* SVG Map Grid */}
              <svg className="w-full h-full max-h-[320px]" viewBox="0 0 340 400">
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Render Parcels */}
                {parcels.map((p) => {
                  const isSelected = p.id === selectedParcelId;
                  
                  // Determine fill color based on map layer
                  let fill = 'rgba(30, 41, 59, 0.4)';
                  let stroke = 'rgba(71, 85, 105, 0.6)';
                  
                  if (mapLayer === 'zoning') {
                    if (p.zoning.includes('AU')) fill = 'rgba(16, 185, 129, 0.2)';
                    else if (p.zoning.includes('SF')) fill = 'rgba(245, 158, 11, 0.2)';
                    else if (p.zoning.includes('R2')) fill = 'rgba(239, 68, 68, 0.2)';
                    else if (p.zoning.includes('RT-4')) fill = 'rgba(59, 130, 246, 0.2)';
                    else fill = 'rgba(139, 92, 246, 0.2)';
                  } else if (mapLayer === 'distress') {
                    if (p.distressScore >= 85) fill = 'rgba(239, 68, 68, 0.25)';
                    else if (p.distressScore >= 70) fill = 'rgba(245, 158, 11, 0.25)';
                    else fill = 'rgba(16, 185, 129, 0.25)';
                  } else if (mapLayer === 'satellite') {
                    fill = isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)';
                  }

                  if (isSelected) {
                    stroke = '#10b981';
                  }

                  return (
                    <g key={p.id} className="cursor-pointer" onClick={() => handleSelectParcel(p.id)}>
                      <path
                        d={p.gisCoordinates.path}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSelected ? 2 : 1}
                        className="transition-all duration-300 hover:fill-slate-800/40"
                      />
                      {/* Label */}
                      <text
                        x={p.gisCoordinates.center.x}
                        y={p.gisCoordinates.center.y}
                        textAnchor="middle"
                        className={`text-[9px] font-mono font-bold pointer-events-none select-none ${
                          isSelected ? 'fill-emerald-400' : 'fill-slate-500'
                        }`}
                      >
                        {p.pidn.substring(0, 7)}...
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Map HUD Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Selected: {selectedParcel.pidn}</span>
                </div>
                <div>Dimensions: {selectedParcel.gisCoordinates.dimensions}</div>
                <div>Zoning: {selectedParcel.zoning}</div>
              </div>

              <div className="absolute top-3 right-3 flex flex-col gap-1">
                <div className="bg-slate-950/90 border border-slate-800 p-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GIS Layer Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED PROPERTY CARD */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                      PIDN: {selectedParcel.pidn}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${getTitleStatusColor(selectedParcel.titleStatus)}`}>
                      Title: {selectedParcel.titleStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    {selectedParcel.address}
                  </h3>
                </div>
              </div>

              {/* Property Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">Owner of Record</span>
                  <span className="text-sm font-bold text-slate-200 truncate block">{selectedParcel.owner}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedParcel.ownerStatus}</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">Acreage & Zoning</span>
                  <span className="text-sm font-bold text-slate-200 block">{selectedParcel.acres} Acres</span>
                  <span className="text-[10px] text-slate-500 block truncate">{selectedParcel.zoning}</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-400 block mb-0.5">Assessed Value</span>
                  <span className="text-sm font-bold text-slate-200 block">
                    ${(selectedParcel.landValue + selectedParcel.improvementValue).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Land: ${(selectedParcel.landValue / 1000).toFixed(0)}k | Imp: ${(selectedParcel.improvementValue / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Municipal Liabilities & Risks */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Municipal Liabilities & Risk Audit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <DollarSign className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Delinquent Tax</span>
                      <span className="text-sm font-bold text-rose-400">${selectedParcel.delinquentBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Code Violations</span>
                      <span className="text-sm font-bold text-amber-400">${selectedParcel.codeViolations.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <Clock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Water/Sewer Owed</span>
                      <span className="text-sm font-bold text-cyan-400">${selectedParcel.waterSewerOwed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="flex gap-3 pt-4 border-t border-slate-800/60">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedParcel.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Maps
              </a>
              <button
                onClick={() => alert(`Downloading GIS Shapefile & Tax History for PIDN: ${selectedParcel.pidn}`)}
                className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export GIS Data
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BIDDING TERMINAL & AI UNDERWRITER (3 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* SOVEREIGN AI UNDERWRITER */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Sovereign AI Underwriter
                </h2>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                selectedParcel.aiConviction === 'High' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {selectedParcel.aiConviction} Conviction
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "{selectedParcel.aiRecommendation}"
            </p>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Target Bid Strategy</span>
                <span className="text-xs font-bold text-slate-200">
                  {selectedParcel.bidType === 'Interest' ? 'Bid Down Interest Rate' : 'Premium Cash Bid'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Recommended Bid</span>
                <span className="text-xs font-bold text-emerald-400">
                  {selectedParcel.bidType === 'Interest' ? '4.5% - 6.0%' : `$${(selectedParcel.delinquentBalance * 1.1).toFixed(0)}`}
                </span>
              </div>
            </div>
          </div>

          {/* BIDDING TERMINAL */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Bidding Terminal
            </h2>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Bid Type</span>
                  <span className="text-slate-200 font-semibold">{selectedParcel.bidType} Bidding</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Max Allowed</span>
                    <span className="text-sm font-bold text-slate-300">
                      {selectedParcel.bidType === 'Interest' ? `${selectedParcel.maxInterestRate}%` : 'No Limit'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Current Bid</span>
                    <span className="text-sm font-bold text-amber-400">
                      {selectedParcel.bidType === 'Interest' 
                        ? `${selectedParcel.currentBidRate || selectedParcel.maxInterestRate}%` 
                        : `$${(selectedParcel.currentBidPremium || selectedParcel.delinquentBalance).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bid Input */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {selectedParcel.bidType === 'Interest' ? 'Your Interest Rate Bid (%)' : 'Your Premium Cash Bid ($)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={selectedParcel.bidType === 'Interest' ? '0.25' : '100'}
                    min="0"
                    max={selectedParcel.bidType === 'Interest' ? selectedParcel.maxInterestRate : undefined}
                    value={bidInput}
                    onChange={(e) => setBidInput(e.target.value)}
                    placeholder={selectedParcel.bidType === 'Interest' ? 'e.g. 5.25' : 'e.g. 9500'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="absolute right-4 top-3 text-xs text-slate-500 font-bold">
                    {selectedParcel.bidType === 'Interest' ? '%' : 'USD'}
                  </span>
                </div>
              </div>

              {/* Proxy Bid Limit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400 flex items-center gap-1">
                    Set Proxy Bid Limit
                    <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" title="Automated bidding agent will bid on your behalf up to this limit." />
                  </label>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step={selectedParcel.bidType === 'Interest' ? '0.25' : '100'}
                    value={proxyBidLimit}
                    onChange={(e) => setProxyBidLimit(e.target.value)}
                    placeholder={selectedParcel.bidType === 'Interest' ? 'Min rate limit (e.g. 2.5)' : 'Max cash limit (e.g. 15000)'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingBid}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingBid ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transmitting Bid...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Submit Sovereign Bid
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: TABS & UTILITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* ACTIVE BIDS TRACKER (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Active Bids Tracker
            </h2>
            <span className="text-[10px] text-slate-500">Simulated Live Auction</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2 font-semibold">PIDN / Address</th>
                  <th className="pb-2 font-semibold text-right">My Bid</th>
                  <th className="pb-2 font-semibold text-right">Current Opponent</th>
                  <th className="pb-2 font-semibold text-center">Status</th>
                  <th className="pb-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {activeBids.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No active bids submitted yet.
                    </td>
                  </tr>
                ) : (
                  activeBids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3">
                        <div className="font-mono font-bold text-slate-300">{bid.pidn}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{bid.address}</div>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-200">
                        {bid.bidType === 'Interest' ? `${bid.myBid}%` : `$${bid.myBid.toLocaleString()}`}
                      </td>
                      <td className="py-3 text-right font-bold text-amber-400">
                        {bid.bidType === 'Interest' ? `${bid.currentOpponentBid}%` : `$${bid.currentOpponentBid.toLocaleString()}`}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          bid.status === 'Winning' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : bid.status === 'Outbid'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {bid.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleCancelBid(bid.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Retract Bid"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DUE DILIGENCE CHECKLIST (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Due Diligence Checklist
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={currentChecklist.gisVerified}
                  onChange={() => handleToggleChecklist('gisVerified')}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Verify GIS Boundaries & Access</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500" title="Check road frontage and physical access." />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={currentChecklist.titleSearch}
                  onChange={() => handleToggleChecklist('titleSearch')}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Preliminary Title Search</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500" title="Verify lien priority and secondary mortgages." />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={currentChecklist.utilityAudit}
                  onChange={() => handleToggleChecklist('utilityAudit')}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Water/Sewer Utility Audit</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500" title="Unrecorded utility liens can survive foreclosure." />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={currentChecklist.codeViolations}
                  onChange={() => handleToggleChecklist('codeViolations')}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Blight & Code Violations Audit</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500" title="Check for active demolition orders or heavy fines." />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={currentChecklist.bankruptcyCheck}
                  onChange={() => handleToggleChecklist('bankruptcyCheck')}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/30 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Owner Bankruptcy Check</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-500" title="Bankruptcy stays the tax sale process." />
            </label>
          </div>
        </div>

        {/* INVESTMENT CALCULATOR (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Yield & ROI Calculator
          </h2>

          <div className="space-y-4">
            {/* Sliders */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Bid Interest Rate</span>
                <span className="text-emerald-400 font-bold">{calcInterestRate}%</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="18"
                step="0.25"
                value={calcInterestRate}
                onChange={(e) => setCalcInterestRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Redemption</span>
                  <span className="text-slate-200 font-bold">{calcRedemptionMonths} Mo</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  value={calcRedemptionMonths}
                  onChange={(e) => setCalcRedemptionMonths(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Penalty Rate</span>
                  <span className="text-slate-200 font-bold">{calcPenaltyRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={calcPenaltyRate}
                  onChange={(e) => setCalcPenaltyRate(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Acquisition Cost Input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Acquisition Costs (Title, Recording, Fees)</label>
              <div className="relative">
                <input
                  type="number"
                  value={calcAcquisitionCost}
                  onChange={(e) => setCalcAcquisitionCost(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-bold">USD</span>
              </div>
            </div>

            {/* Results Breakdown */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Principal Investment:</span>
                <span className="font-bold text-slate-200">${calculatorResults.principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Simple Interest Earned:</span>
                <span className="font-bold text-emerald-400">+${calculatorResults.simpleInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Penalty Return:</span>
                <span className="font-bold text-emerald-400">+${calculatorResults.penalty.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-800/60 pt-2">
                <span className="text-slate-400">Total Payoff Amount:</span>
                <span className="font-bold text-slate-200">${calculatorResults.totalPayoff.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Net Profit:</span>
                <span className="font-bold text-cyan-400">${calculatorResults.netProfit.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-800/60 pt-2">
                <span className="text-slate-400">Projected ROI:</span>
                <span className="font-bold text-emerald-400">{calculatorResults.roi.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Annualized ROI:</span>
                <span className="font-bold text-cyan-400">{calculatorResults.annualizedRoi.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}