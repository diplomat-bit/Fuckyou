

// --- CONSOLIDATED FROM: ./components/government/GisPropertyMap_v2.tsx ---

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapPin, Search, Layers, DollarSign, FileText, ShieldAlert, TrendingUp,
  Activity, Filter, Info, ExternalLink, Gavel, Building, MapIcon,
  CheckCircle, AlertTriangle, Download, RefreshCw, BookOpen, MessageSquare,
  Send, Bot, Sparkles, Landmark, Home, Cpu, Globe, Award, Terminal,
  ArrowRight, Lock, Check, Zap, Volume2, PieChart, Scale, FileCode,
  Copy, Plus, X, Radio
} from 'lucide-react';
import {
  calculatePolygonArea,
  generateParcelGeoJSON,
  getParcelStyleByStatus
} from '../../utils/gis-helper';
import {
  calculateLienYield,
  calculateTaxLienRedemption,
  calculateBidDownBreakEven
} from '../../utils/tax-calculator';

// Define Parcel Interface
interface Parcel {
  id: string;
  address: string;
  owner: string;
  assessedValue: number;
  marketValue: number;
  taxOwed: number;
  lienStatus: 'None' | 'Active' | 'Foreclosing' | 'Redeemed';
  foreclosureRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  zoning: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Mixed-Use';
  areaAcres: number;
  coordinates: [number, number][];
  center: [number, number];
  yearBuilt?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
  lienCertificateId?: string;
  lienAuctionDate?: string;
  interestRate?: number;
}

// Mock Parcels Data
const MOCK_PARCELS: Parcel[] = [
  {
    id: "PARCEL-302-01",
    address: "1420 Ocean Drive, Miami Beach, FL 33139",
    owner: "Sovereign Holdings LLC",
    assessedValue: 4250000,
    marketValue: 5100000,
    taxOwed: 85000,
    lienStatus: 'None',
    foreclosureRisk: 'Low',
    zoning: 'Commercial',
    areaAcres: 1.2,
    coordinates: [[50, 50], [200, 50], [180, 180], [50, 150]],
    center: [120, 100],
    yearBuilt: 1998,
    lastSalePrice: 3800000,
    lastSaleDate: "2019-04-12"
  },
  {
    id: "PARCEL-302-02",
    address: "884 Brickell Ave, Miami, FL 33131",
    owner: "Vanguard Development Corp",
    assessedValue: 8900000,
    marketValue: 10500000,
    taxOwed: 178000,
    lienStatus: 'Active',
    foreclosureRisk: 'Medium',
    zoning: 'Mixed-Use',
    areaAcres: 2.4,
    coordinates: [[200, 50], [350, 50], [380, 160], [180, 180]],
    center: [270, 110],
    yearBuilt: 2012,
    lastSalePrice: 7500000,
    lastSaleDate: "2015-08-22",
    lienCertificateId: "TX-2023-8849",
    lienAuctionDate: "2023-05-15",
    interestRate: 12.5
  },
  {
    id: "PARCEL-302-03",
    address: "302 Pinecrest Way, Pinecrest, FL 33156",
    owner: "Estate of Arthur Pendelton",
    assessedValue: 1850000,
    marketValue: 2200000,
    taxOwed: 48000,
    lienStatus: 'Foreclosing',
    foreclosureRisk: 'Critical',
    zoning: 'Residential',
    areaAcres: 0.85,
    coordinates: [[350, 50], [500, 50], [480, 200], [380, 160]],
    center: [420, 110],
    yearBuilt: 1974,
    lastSalePrice: 450000,
    lastSaleDate: "1988-11-02",
    lienCertificateId: "TX-2022-1104",
    lienAuctionDate: "2022-06-10",
    interestRate: 18.0
  },
  {
    id: "PARCEL-302-04",
    address: "1200 NW 57th Ave, Miami, FL 33126",
    owner: "Industrial Logistics Partners",
    assessedValue: 12400000,
    marketValue: 14100000,
    taxOwed: 0,
    lienStatus: 'None',
    foreclosureRisk: 'Low',
    zoning: 'Industrial',
    areaAcres: 5.6,
    coordinates: [[500, 50], [750, 50], [720, 220], [480, 200]],
    center: [610, 120],
    yearBuilt: 2005,
    lastSalePrice: 11200000,
    lastSaleDate: "2021-01-15"
  },
  {
    id: "PARCEL-302-05",
    address: "4405 SW 72nd Ave, Miami, FL 33155",
    owner: "Elena Rostova",
    assessedValue: 950000,
    marketValue: 1150000,
    taxOwed: 19000,
    lienStatus: 'Redeemed',
    foreclosureRisk: 'Low',
    zoning: 'Residential',
    areaAcres: 0.35,
    coordinates: [[50, 150], [180, 180], [150, 320], [50, 300]],
    center: [100, 230],
    yearBuilt: 1956,
    lastSalePrice: 820000,
    lastSaleDate: "2018-09-30"
  },
  {
    id: "PARCEL-302-06",
    address: "900 S Miami Ave, Miami, FL 33130",
    owner: "Mary & John Fitzpatrick",
    assessedValue: 3100000,
    marketValue: 3650000,
    taxOwed: 62000,
    lienStatus: 'Active',
    foreclosureRisk: 'High',
    zoning: 'Commercial',
    areaAcres: 0.9,
    coordinates: [[180, 180], [380, 160], [350, 330], [150, 320]],
    center: [260, 240],
    yearBuilt: 2001,
    lastSalePrice: 2900000,
    lastSaleDate: "2020-07-11",
    lienCertificateId: "TX-2023-9001",
    lienAuctionDate: "2023-05-15",
    interestRate: 14.0
  },
  {
    id: "PARCEL-302-07",
    address: "18200 SW 248th St, Homestead, FL 33031",
    owner: "Red Soil Agricultural Trust",
    assessedValue: 1500000,
    marketValue: 1800000,
    taxOwed: 12000,
    lienStatus: 'None',
    foreclosureRisk: 'Low',
    zoning: 'Agricultural',
    areaAcres: 15.0,
    coordinates: [[380, 160], [480, 200], [520, 350], [350, 330]],
    center: [430, 250],
    yearBuilt: 1982,
    lastSalePrice: 1100000,
    lastSaleDate: "2010-03-14"
  },
  {
    id: "PARCEL-302-08",
    address: "1024 Collins Ave, Miami Beach, FL 33139",
    owner: "Beachfront Properties Inc",
    assessedValue: 6700000,
    marketValue: 8200000,
    taxOwed: 145000,
    lienStatus: 'Foreclosing',
    foreclosureRisk: 'Critical',
    zoning: 'Commercial',
    areaAcres: 0.6,
    coordinates: [[480, 200], [720, 220], [700, 380], [520, 350]],
    center: [600, 280],
    yearBuilt: 1936,
    lastSalePrice: 5400000,
    lastSaleDate: "2014-12-18",
    lienCertificateId: "TX-2022-1024",
    lienAuctionDate: "2022-06-10",
    interestRate: 18.0
  },
  {
    id: "PARCEL-302-09",
    address: "550 NE 15th St, Miami, FL 33132",
    owner: "Biscayne Bay Condo Assoc",
    assessedValue: 12000000,
    marketValue: 14500000,
    taxOwed: 0,
    lienStatus: 'None',
    foreclosureRisk: 'Low',
    zoning: 'Mixed-Use',
    areaAcres: 1.8,
    coordinates: [[50, 300], [150, 320], [120, 450], [50, 450]],
    center: [90, 380],
    yearBuilt: 2016,
    lastSalePrice: 10500000,
    lastSaleDate: "2016-05-20"
  },
  {
    id: "PARCEL-302-10",
    address: "2200 NW 23rd St, Miami, FL 33142",
    owner: "All-Star Metal Recycling",
    assessedValue: 2800000,
    marketValue: 3200000,
    taxOwed: 56000,
    lienStatus: 'Active',
    foreclosureRisk: 'High',
    zoning: 'Industrial',
    areaAcres: 3.1,
    coordinates: [[150, 320], [350, 330], [320, 450], [120, 450]],
    center: [230, 380],
    yearBuilt: 1971,
    lastSalePrice: 1800000,
    lastSaleDate: "2008-10-05",
    lienCertificateId: "TX-2023-2200",
    lienAuctionDate: "2023-05-15",
    interestRate: 15.0
  },
  {
    id: "PARCEL-302-11",
    address: "1500 SW 8th St, Miami, FL 33135",
    owner: "Calle Ocho Heritage LLC",
    assessedValue: 4100000,
    marketValue: 4900000,
    taxOwed: 0,
    lienStatus: 'None',
    foreclosureRisk: 'Low',
    zoning: 'Mixed-Use',
    areaAcres: 0.75,
    coordinates: [[350, 330], [520, 350], [500, 450], [320, 450]],
    center: [420, 390],
    yearBuilt: 1925,
    lastSalePrice: 3500000,
    lastSaleDate: "2017-11-12"
  },
  {
    id: "PARCEL-302-12",
    address: "7100 Island Blvd, Aventura, FL 33160",
    owner: "Aventura Marina Holdings",
    assessedValue: 15500000,
    marketValue: 18200000,
    taxOwed: 310000,
    lienStatus: 'Active',
    foreclosureRisk: 'Medium',
    zoning: 'Commercial',
    areaAcres: 4.2,
    coordinates: [[520, 350], [700, 380], [680, 450], [500, 450]],
    center: [600, 400],
    yearBuilt: 2008,
    lastSalePrice: 14200000,
    lastSaleDate: "2012-04-18",
    lienCertificateId: "TX-2023-7100",
    lienAuctionDate: "2023-05-15",
    interestRate: 10.5
  }
];

export default function GisPropertyMap_v2() {
  // State Management
  const [parcels, setParcels] = useState<Parcel[]>(MOCK_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(MOCK_PARCELS[2]); // Default to Pinecrest Way
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<'zoning' | 'lienStatus' | 'foreclosureRisk' | 'valueHeatmap'>('lienStatus');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterZoning, setFilterZoning] = useState<string>('All');
  const [filterRisk, setFilterRisk] = useState<string>('All');

  // Foreclosure Calculator State
  const [calcLienAmount, setCalcLienAmount] = useState<number>(48000);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(18);
  const [calcMonths, setCalcMonths] = useState<number>(12);
  const [calcPenaltyRate, setCalcPenaltyRate] = useState<number>(5);

  // AI Underwriter Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai', text: string, timestamp: string }>>([
    {
      sender: 'ai',
      text: "Sovereign GIS AI Underwriter initialized. Select any parcel to generate a comprehensive risk assessment, tax lien yield analysis, and legal compliance audit.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const mapRef = useRef<SVGSVGElement>(null);

  // Sync Calculator with Selected Parcel
  useEffect(() => {
    if (selectedParcel) {
      setCalcLienAmount(selectedParcel.taxOwed || 25000);
      setCalcInterestRate(selectedParcel.interestRate || 12);
    }
  }, [selectedParcel]);

  // Filter Parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZoning = filterZoning === 'All' || p.zoning === filterZoning;
      const matchesRisk = filterRisk === 'All' || p.foreclosureRisk === filterRisk;
      return matchesSearch && matchesZoning && matchesRisk;
    });
  }, [parcels, searchQuery, filterZoning, filterRisk]);

  // Map Navigation Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Get Color based on Active Layer
  const getParcelColor = (parcel: Parcel) => {
    const isSelected = selectedParcel?.id === parcel.id;

    if (activeLayer === 'zoning') {
      switch (parcel.zoning) {
        case 'Residential': return isSelected ? 'fill-emerald-500/40 stroke-emerald-400' : 'fill-emerald-500/20 stroke-emerald-500/60';
        case 'Commercial': return isSelected ? 'fill-blue-500/40 stroke-blue-400' : 'fill-blue-500/20 stroke-blue-500/60';
        case 'Industrial': return isSelected ? 'fill-purple-500/40 stroke-purple-400' : 'fill-purple-500/20 stroke-purple-500/60';
        case 'Agricultural': return isSelected ? 'fill-amber-500/40 stroke-amber-400' : 'fill-amber-500/20 stroke-amber-500/60';
        case 'Mixed-Use': return isSelected ? 'fill-pink-500/40 stroke-pink-400' : 'fill-pink-500/20 stroke-pink-500/60';
        default: return 'fill-slate-500/20 stroke-slate-500/60';
      }
    }

    if (activeLayer === 'lienStatus') {
      switch (parcel.lienStatus) {
        case 'None': return isSelected ? 'fill-slate-500/40 stroke-slate-400' : 'fill-slate-500/10 stroke-slate-500/40';
        case 'Active': return isSelected ? 'fill-amber-500/40 stroke-amber-400' : 'fill-amber-500/20 stroke-amber-500/60';
        case 'Foreclosing': return isSelected ? 'fill-red-500/40 stroke-red-400' : 'fill-red-500/20 stroke-red-500/60';
        case 'Redeemed': return isSelected ? 'fill-emerald-500/40 stroke-emerald-400' : 'fill-emerald-500/20 stroke-emerald-500/60';
        default: return 'fill-slate-500/20 stroke-slate-500/60';
      }
    }

    if (activeLayer === 'foreclosureRisk') {
      switch (parcel.foreclosureRisk) {
        case 'Low': return isSelected ? 'fill-emerald-500/40 stroke-emerald-400' : 'fill-emerald-500/20 stroke-emerald-500/60';
        case 'Medium': return isSelected ? 'fill-amber-500/40 stroke-amber-400' : 'fill-amber-500/20 stroke-amber-500/60';
        case 'High': return isSelected ? 'fill-orange-500/40 stroke-orange-400' : 'fill-orange-500/20 stroke-orange-500/60';
        case 'Critical': return isSelected ? 'fill-red-500/40 stroke-red-400' : 'fill-red-500/20 stroke-red-500/60';
        default: return 'fill-slate-500/20 stroke-slate-500/60';
      }
    }

    if (activeLayer === 'valueHeatmap') {
      const maxVal = 15500000;
      const ratio = parcel.assessedValue / maxVal;
      if (ratio > 0.7) return isSelected ? 'fill-rose-600/50 stroke-rose-400' : 'fill-rose-600/30 stroke-rose-500/60';
      if (ratio > 0.4) return isSelected ? 'fill-orange-500/50 stroke-orange-400' : 'fill-orange-500/30 stroke-orange-500/60';
      return isSelected ? 'fill-yellow-500/50 stroke-yellow-400' : 'fill-yellow-500/30 stroke-yellow-500/60';
    }

    return 'fill-slate-500/20 stroke-slate-500/60';
  };

  // Calculator Calculations
  const calculatedRedemption = useMemo(() => {
    const totalRedemption = calculateTaxLienRedemption(calcLienAmount, calcInterestRate, calcMonths, calcPenaltyRate);
    const yieldAmount = calculateLienYield(calcLienAmount, totalRedemption);
    const breakEvenBid = calculateBidDownBreakEven(calcLienAmount, calcInterestRate, calcMonths);
    return {
      totalRedemption,
      yieldAmount,
      breakEvenBid
    };
  }, [calcLienAmount, calcInterestRate, calcMonths, calcPenaltyRate]);

  // AI Underwriter Chat Handler
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsAiTyping(true);

    // Simulate AI response based on selected parcel
    setTimeout(() => {
      let aiResponseText = "";
      if (selectedParcel) {
        if (messageText.toLowerCase().includes('risk') || messageText.toLowerCase().includes('foreclosure')) {
          aiResponseText = `Based on our GIS and tax database, ${selectedParcel.address} (ID: ${selectedParcel.id}) exhibits a ${selectedParcel.foreclosureRisk} foreclosure risk profile. Key factors include:
1. Outstanding tax balance of $${selectedParcel.taxOwed.toLocaleString()} against an assessed value of $${selectedParcel.assessedValue.toLocaleString()} (${((selectedParcel.taxOwed / selectedParcel.assessedValue) * 100).toFixed(2)}% LTV).
2. Zoning is designated as ${selectedParcel.zoning}, which offers strong liquidity options in the current Florida market.
3. Legal status: ${selectedParcel.lienStatus === 'Foreclosing' ? 'Foreclosure proceedings have been initiated under Florida Statute Chapter 197.' : 'Lien is active but foreclosure has not yet been triggered.'}`;
        } else if (messageText.toLowerCase().includes('bid') || messageText.toLowerCase().includes('calculate') || messageText.toLowerCase().includes('yield')) {
          const yieldPct = ((calculatedRedemption.yieldAmount / calcLienAmount) * 100).toFixed(2);
          aiResponseText = `Underwriting analysis for bidding on ${selectedParcel.id}:
- Recommended Maximum Bid: $${(selectedParcel.marketValue * 0.6).toLocaleString()} (60% of Market Value).
- Current Lien Principal: $${calcLienAmount.toLocaleString()} at ${calcInterestRate}% interest.
- Projected 12-Month Redemption Value: $${calculatedRedemption.totalRedemption.toLocaleString()} (Yield: $${calculatedRedemption.yieldAmount.toLocaleString()} or ${yieldPct}%).
- Bid-Down Strategy: If bidding down the interest rate at auction, do not drop below ${calculatedRedemption.breakEvenBid.toFixed(2)}% to maintain a positive risk-adjusted return.`;
        } else {
          aiResponseText = `I have analyzed ${selectedParcel.address}. It is a ${selectedParcel.zoning} property built in ${selectedParcel.yearBuilt || 'N/A'} with an area of ${selectedParcel.areaAcres} acres. The owner of record is ${selectedParcel.owner}. 

Would you like me to:
1. Run a full tax lien yield projection?
2. Generate a zoning and environmental hazard report?
3. Draft a foreclosure notice of intent?`;
        }
      } else {
        aiResponseText = "Please select a parcel on the GIS map first so I can pull the relevant property records, tax history, and spatial coordinates.";
      }

      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAiTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 gap-6">
      {/* Left Column: GIS Map & Controls */}
      <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl p-4 lg:p-6 backdrop-blur-sm">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-emerald-400">
              <Globe className="w-6 h-6 animate-pulse" />
              Sovereign GIS Property Map
            </h1>
            <p className="text-sm text-slate-400">
              Real-time parcel visualization, tax lien tracking, and spatial analytics.
            </p>
          </div>

          {/* Layer Selector */}
          <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLayer('lienStatus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeLayer === 'lienStatus' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Gavel className="w-3.5 h-3.5" />
              Tax Liens
            </button>
            <button
              onClick={() => setActiveLayer('foreclosureRisk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeLayer === 'foreclosureRisk' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Foreclosure Risk
            </button>
            <button
              onClick={() => setActiveLayer('zoning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeLayer === 'zoning' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              Zoning
            </button>
            <button
              onClick={() => setActiveLayer('valueHeatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeLayer === 'valueHeatmap' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Value Heatmap
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, address, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex gap-2 md:col-span-2">
            <div className="flex-1 relative">
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <select
                value={filterZoning}
                onChange={(e) => setFilterZoning(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
              >
                <option value="All">All Zoning Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Mixed-Use">Mixed-Use</option>
              </select>
            </div>

            <div className="flex-1 relative">
              <ShieldAlert className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
              >
                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive SVG Map Container */}
        <div className="relative flex-1 min-h-[400px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing">
          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl backdrop-blur-md shadow-xl">
            <button onClick={handleZoomIn} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all" title="Zoom In">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all" title="Zoom Out">
              <X className="w-4 h-4" />
            </button>
            <button onClick={handleResetView} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all" title="Reset View">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-xl text-xs max-w-[200px]">
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Legend: {activeLayer === 'lienStatus' ? 'Lien Status' : activeLayer === 'foreclosureRisk' ? 'Foreclosure Risk' : activeLayer === 'zoning' ? 'Zoning' : 'Value Heatmap'}
            </h4>
            <div className="space-y-1.5">
              {activeLayer === 'lienStatus' && (
                <>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-500/20 border border-slate-500/60"></span> <span className="text-slate-400">No Lien</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/60"></span> <span className="text-slate-400">Active Lien</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/60"></span> <span className="text-slate-400">Foreclosing</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/60"></span> <span className="text-slate-400">Redeemed</span></div>
                </>
              )}
              {activeLayer === 'foreclosureRisk' && (
                <>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/60"></span> <span className="text-slate-400">Low Risk</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/60"></span> <span className="text-slate-400">Medium Risk</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/60"></span> <span className="text-slate-400">High Risk</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/60"></span> <span className="text-slate-400">Critical Risk</span></div>
                </>
              )}
              {activeLayer === 'zoning' && (
                <>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/60"></span> <span className="text-slate-400">Residential</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/60"></span> <span className="text-slate-400">Commercial</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/60"></span> <span className="text-slate-400">Industrial</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/60"></span> <span className="text-slate-400">Agricultural</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-pink-500/20 border border-pink-500/60"></span> <span className="text-slate-400">Mixed-Use</span></div>
                </>
              )}
              {activeLayer === 'valueHeatmap' && (
                <>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-600/30 border border-rose-500/60"></span> <span className="text-slate-400">&gt; $10M</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/60"></span> <span className="text-slate-400">$5M - $10M</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/60"></span> <span className="text-slate-400">&lt; $5M</span></div>
                </>
              )}
            </div>
          </div>

          {/* SVG Map Canvas */}
          <svg
            ref={mapRef}
            className="w-full h-full select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            viewBox="0 0 800 500"
          >
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Map Content Group with Zoom/Pan Transform */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Render Parcels */}
              {filteredParcels.map((parcel) => {
                const isSelected = selectedParcel?.id === parcel.id;
                const pointsString = parcel.coordinates.map(coord => coord.join(',')).join(' ');

                return (
                  <g key={parcel.id} className="group cursor-pointer" onClick={() => setSelectedParcel(parcel)}>
                    {/* Parcel Polygon */}
                    <polygon
                      points={pointsString}
                      className={`transition-all duration-300 stroke-2 ${getParcelColor(parcel)} ${isSelected ? 'stroke-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'hover:fill-slate-500/30 hover:stroke-slate-300'}`}
                    />

                    {/* Parcel Label */}
                    <text
                      x={parcel.center[0]}
                      y={parcel.center[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[10px] font-bold pointer-events-none transition-all ${isSelected ? 'fill-emerald-400' : 'fill-slate-400 group-hover:fill-slate-200'}`}
                    >
                      {parcel.id.replace('PARCEL-', '')}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Right Column: Details, Calculator & AI Underwriter */}
      <div className="w-full lg:w-[450px] flex flex-col gap-6">
        {/* Parcel Details Panel */}
        {selectedParcel ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {selectedParcel.id}
                </span>
                <h2 className="text-lg font-bold mt-2 text-slate-100">{selectedParcel.address}</h2>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Assessed Value</span>
                <span className="text-base font-bold text-slate-200">${selectedParcel.assessedValue.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Market Value</span>
                <span className="text-base font-bold text-slate-200">${selectedParcel.marketValue.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tax Owed</span>
                <span className={`text-base font-bold ${selectedParcel.taxOwed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ${selectedParcel.taxOwed.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Foreclosure Risk</span>
                <span className={`text-base font-bold ${selectedParcel.foreclosureRisk === 'Critical' || selectedParcel.foreclosureRisk === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedParcel.foreclosureRisk}
                </span>
              </div>
            </div>

            {/* Detailed Info List */}
            <div className="space-y-2 text-xs border-t border-slate-800/60 pt-4">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Owner of Record:</span>
                <span className="font-medium text-slate-200">{selectedParcel.owner}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Zoning Designation:</span>
                <span className="font-medium text-slate-200">{selectedParcel.zoning}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Area (Acres):</span>
                <span className="font-medium text-slate-200">{selectedParcel.areaAcres} Acres</span>
              </div>
              {selectedParcel.yearBuilt && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Year Built:</span>
                  <span className="font-medium text-slate-200">{selectedParcel.yearBuilt}</span>
                </div>
              )}
              {selectedParcel.lastSalePrice && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last Sale Price:</span>
                  <span className="font-medium text-slate-200">${selectedParcel.lastSalePrice.toLocaleString()} ({selectedParcel.lastSaleDate})</span>
                </div>
              )}
              {selectedParcel.lienCertificateId && (
                <div className="flex justify-between py-1 border-t border-slate-800/40 mt-2 pt-2">
                  <span className="text-slate-400">Lien Certificate:</span>
                  <span className="font-medium text-amber-400">{selectedParcel.lienCertificateId}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm text-center">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No Parcel Selected</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click on any parcel on the GIS map to view detailed property records, tax history, and foreclosure risk.
            </p>
          </div>
        )}

        {/* Tax Lien Foreclosure Calculator */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            Tax Lien Yield Calculator
          </h3>

          <div className="space-y-4">
            {/* Lien Amount Input */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Lien Principal Amount</span>
                <span className="text-slate-200 font-semibold">${calcLienAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={calcLienAmount}
                onChange={(e) => setCalcLienAmount(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Interest Rate Input */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Bid Interest Rate (Annual)</span>
                <span className="text-slate-200 font-semibold">{calcInterestRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="18"
                step="0.5"
                value={calcInterestRate}
                onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Months Held Input */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Redemption Period (Months)</span>
                <span className="text-slate-200 font-semibold">{calcMonths} Months</span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                step="1"
                value={calcMonths}
                onChange={(e) => setCalcMonths(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Penalty Rate Input */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Flat Penalty Rate</span>
                <span className="text-slate-200 font-semibold">{calcPenaltyRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={calcPenaltyRate}
                onChange={(e) => setCalcPenaltyRate(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Calculation Results */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-3 mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Redemption Value:</span>
                <span className="font-bold text-slate-200">${calculatedRedemption.totalRedemption.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Net Yield Amount:</span>
                <span className="font-bold text-emerald-400">+${calculatedRedemption.yieldAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Break-even Bid Rate:</span>
                <span className="font-bold text-amber-400">{calculatedRedemption.breakEvenBid.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Underwriter Chat Panel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex flex-col h-[350px]">
          <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            AI Underwriter Assistant
          </h3>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 text-xs scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pl-2">
                <Bot className="w-3.5 h-3.5 animate-bounce" />
                AI is analyzing spatial records...
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {selectedParcel && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
              <button
                onClick={() => handleSendMessage("Analyze foreclosure risk")}
                className="whitespace-nowrap bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg transition-all"
              >
                Analyze Risk
              </button>
              <button
                onClick={() => handleSendMessage("Calculate maximum bid recommendation")}
                className="whitespace-nowrap bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg transition-all"
              >
                Calculate Bid
              </button>
            </div>
          )}

          {/* Chat Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Ask AI about zoning, risk, or yield..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              className="absolute right-2 top-1.5 p-1 hover:bg-slate-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}