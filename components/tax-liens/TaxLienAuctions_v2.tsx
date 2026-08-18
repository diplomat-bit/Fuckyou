import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  DollarSign,
  Percent,
  Clock,
  FileText,
  ShieldAlert,
  TrendingUp,
  ExternalLink,
  Heart,
  Info,
  CheckCircle,
  AlertTriangle,
  Building,
  User,
  ArrowUpRight,
  Download,
  Layers,
  BookOpen,
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  Home,
  Landmark,
  CreditCard,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Share2,
  Award,
  Zap,
  Scale,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

// --- Types ---
export interface TaxLienCertificate {
  id: string;
  parcelId: string;
  county: string;
  state: string;
  address: string;
  propertyType: 'Residential' | 'Commercial' | 'Agricultural' | 'Vacant Land';
  assessedValue: number;
  delinquentAmount: number; // Face value of the lien
  maxInterestRate: number; // e.g., 18% in FL
  currentBidRate: number;
  bidsCount: number;
  timeLeft: string; // e.g., "2h 15m"
  status: 'Active' | 'Won' | 'Lost' | 'Pending';
  myBid?: number;
  equityRatio: number; // (Assessed Value - Delinquent Amount) / Assessed Value
  riskScore: 'Low' | 'Medium' | 'High';
  yearDelinquent: number;
  legalDescription: string;
}

export interface BidHistoryEntry {
  id: string;
  certificateId: string;
  bidderName: string;
  bidRate: number;
  timestamp: string;
}

// --- Mock Data ---
const INITIAL_CERTIFICATES: TaxLienCertificate[] = [
  {
    id: 'TL-2024-001',
    parcelId: '01-3112-024-0190',
    county: 'Miami-Dade',
    state: 'FL',
    address: '1420 Ocean Drive, Miami Beach, FL 33139',
    propertyType: 'Commercial',
    assessedValue: 1850000,
    delinquentAmount: 24500,
    maxInterestRate: 18.0,
    currentBidRate: 12.5,
    bidsCount: 8,
    timeLeft: '04h 32m',
    status: 'Active',
    equityRatio: 0.98,
    riskScore: 'Low',
    yearDelinquent: 2023,
    legalDescription: 'OCEAN FRONT SUB BLK 12 LOT 19 & N10FT OF LOT 18 OR 28491-1022'
  },
  {
    id: 'TL-2024-002',
    parcelId: '48-12-04-102-0030',
    county: 'Broward',
    state: 'FL',
    address: '2800 Las Olas Blvd, Fort Lauderdale, FL 33301',
    propertyType: 'Residential',
    assessedValue: 920000,
    delinquentAmount: 11200,
    maxInterestRate: 18.0,
    currentBidRate: 8.0,
    bidsCount: 14,
    timeLeft: '01h 15m',
    status: 'Active',
    equityRatio: 0.98,
    riskScore: 'Low',
    yearDelinquent: 2023,
    legalDescription: 'LAS OLAS ISLES 1-47 B LOT 3 BLK 4 OR 19283-0482'
  },
  {
    id: 'TL-2024-003',
    parcelId: 'A-109-482-11',
    county: 'Hillsborough',
    state: 'FL',
    address: '812 N Tampa St, Tampa, FL 33602',
    propertyType: 'Commercial',
    assessedValue: 3400000,
    delinquentAmount: 89000,
    maxInterestRate: 18.0,
    currentBidRate: 14.0,
    bidsCount: 5,
    timeLeft: '08h 45m',
    status: 'Active',
    equityRatio: 0.97,
    riskScore: 'Medium',
    yearDelinquent: 2022,
    legalDescription: 'ORIGINAL AMENDED MAP OF TAMPA YBOR LOT 11 BLK 48'
  },
  {
    id: 'TL-2024-004',
    parcelId: '29-22-30-0000-00-012',
    county: 'Orange',
    state: 'FL',
    address: '7420 Sand Lake Rd, Orlando, FL 32819',
    propertyType: 'Vacant Land',
    assessedValue: 450000,
    delinquentAmount: 18500,
    maxInterestRate: 18.0,
    currentBidRate: 15.5,
    bidsCount: 3,
    timeLeft: '12h 10m',
    status: 'Active',
    equityRatio: 0.95,
    riskScore: 'High',
    yearDelinquent: 2023,
    legalDescription: 'SEC 22 TWP 30 RGE 22 UNPLATTED PORTION OF SW1/4 OF NE1/4'
  },
  {
    id: 'TL-2024-005',
    parcelId: '52-09-18-000-042.000',
    county: 'Palm Beach',
    state: 'FL',
    address: '104 Royal Palm Way, Palm Beach, FL 33480',
    propertyType: 'Residential',
    assessedValue: 4200000,
    delinquentAmount: 56000,
    maxInterestRate: 18.0,
    currentBidRate: 5.5,
    bidsCount: 22,
    timeLeft: '00h 24m',
    status: 'Active',
    equityRatio: 0.98,
    riskScore: 'Low',
    yearDelinquent: 2023,
    legalDescription: 'ROYAL PALM WAY ADD LOT 42 BLK 9 OR 31022-1948'
  },
  {
    id: 'TL-2024-006',
    parcelId: '12-34-56-789-000',
    county: 'Duval',
    state: 'FL',
    address: '402 West Bay St, Jacksonville, FL 32202',
    propertyType: 'Agricultural',
    assessedValue: 310000,
    delinquentAmount: 4200,
    maxInterestRate: 18.0,
    currentBidRate: 11.0,
    bidsCount: 6,
    timeLeft: '18h 30m',
    status: 'Active',
    equityRatio: 0.98,
    riskScore: 'Medium',
    yearDelinquent: 2023,
    legalDescription: 'BAY STREET SUBDIVISION LOT 9 BLK 56 SEC 12 TWP 2S RGE 26E'
  }
];

const INITIAL_BIDS: BidHistoryEntry[] = [
  { id: 'b1', certificateId: 'TL-2024-001', bidderName: 'Sovereign Capital LLC', bidRate: 15.0, timestamp: '10 mins ago' },
  { id: 'b2', certificateId: 'TL-2024-001', bidderName: 'Apex Tax Liens', bidRate: 14.5, timestamp: '8 mins ago' },
  { id: 'b3', certificateId: 'TL-2024-001', bidderName: 'Sovereign Capital LLC', bidRate: 13.5, timestamp: '5 mins ago' },
  { id: 'b4', certificateId: 'TL-2024-001', bidderName: 'Citadel Holdings', bidRate: 12.5, timestamp: '2 mins ago' },
  { id: 'b5', certificateId: 'TL-2024-002', bidderName: 'Florida Lien Fund', bidRate: 10.0, timestamp: '1 hour ago' },
  { id: 'b6', certificateId: 'TL-2024-002', bidderName: 'Sovereign Capital LLC', bidRate: 9.0, timestamp: '30 mins ago' },
  { id: 'b7', certificateId: 'TL-2024-002', bidderName: 'Tax Recovery Corp', bidRate: 8.0, timestamp: '12 mins ago' }
];

export default function TaxLienAuctions_v2() {
  // --- State ---
  const [certificates, setCertificates] = useState<TaxLienCertificate[]>(INITIAL_CERTIFICATES);
  const [bids, setBids] = useState<BidHistoryEntry[]>(INITIAL_BIDS);
  const [selectedCertId, setSelectedCertId] = useState<string>('TL-2024-001');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  
  // Bidding Terminal State
  const [bidAmountRate, setBidAmountRate] = useState<number>(12.0);
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);

  // Yield Simulator State
  const [simFaceValue, setSimFaceValue] = useState<number>(25000);
  const [simBidRate, setSimBidRate] = useState<number>(10.5);
  const [simRedemptionMonths, setSimRedemptionMonths] = useState<number>(12);
  const [simFloridaRule, setSimFloridaRule] = useState<boolean>(true); // 5% minimum interest rule

  // AI Underwriter State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Watchlist / Portfolio State
  const [watchlist, setWatchlist] = useState<string[]>(['TL-2024-002']);

  // --- Selected Certificate ---
  const selectedCert = useMemo(() => {
    return certificates.find(c => c.id === selectedCertId) || certificates[0];
  }, [certificates, selectedCertId]);

  // Sync simulator with selected certificate on load
  useEffect(() => {
    if (selectedCert) {
      setSimFaceValue(selectedCert.delinquentAmount);
      setSimBidRate(Math.max(0.25, selectedCert.currentBidRate - 0.5));
    }
  }, [selectedCert]);

  // --- Filtered Certificates ---
  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => {
      const matchesSearch = 
        c.parcelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.county.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCounty = selectedCounty === 'All' || c.county === selectedCounty;
      const matchesType = selectedType === 'All' || c.propertyType === selectedType;
      const matchesRisk = selectedRisk === 'All' || c.riskScore === selectedRisk;
      return matchesSearch && matchesCounty && matchesType && matchesRisk;
    });
  }, [certificates, searchQuery, selectedCounty, selectedType, selectedRisk]);

  // --- Unique Counties for Filter ---
  const counties = useMemo(() => {
    const list = new Set(certificates.map(c => c.county));
    return ['All', ...Array.from(list)];
  }, [certificates]);

  // --- Yield Calculations ---
  const yieldMetrics = useMemo(() => {
    const rateDecimal = simBidRate / 100;
    const timeFraction = simRedemptionMonths / 12;
    
    // Standard simple interest
    let calculatedInterest = simFaceValue * rateDecimal * timeFraction;
    
    // Florida 5% minimum interest rule:
    // If the certificate is redeemed, the investor is guaranteed a minimum of 5% of the face value
    // in interest, regardless of when it is redeemed, unless the bid rate was 0%.
    let isMinApplied = false;
    if (simFloridaRule && simBidRate > 0 && calculatedInterest < simFaceValue * 0.05) {
      calculatedInterest = simFaceValue * 0.05;
      isMinApplied = true;
    }

    const totalRedemption = simFaceValue + calculatedInterest;
    const totalYieldPercent = (calculatedInterest / simFaceValue) * 100;
    const annualizedYield = (totalYieldPercent / simRedemptionMonths) * 12;

    return {
      interestEarned: calculatedInterest,
      totalRedemption,
      totalYieldPercent,
      annualizedYield,
      isMinApplied
    };
  }, [simFaceValue, simBidRate, simRedemptionMonths, simFloridaRule]);

  // --- Chart Data: Yield Over Time ---
  const yieldOverTimeData = useMemo(() => {
    const data = [];
    for (let m = 1; m <= 24; m++) {
      const rateDecimal = simBidRate / 100;
      const timeFraction = m / 12;
      let interest = simFaceValue * rateDecimal * timeFraction;
      
      let minApplied = false;
      if (simFloridaRule && simBidRate > 0 && interest < simFaceValue * 0.05) {
        interest = simFaceValue * 0.05;
        minApplied = true;
      }
      
      data.push({
        month: `M${m}`,
        'Projected Value': Math.round(simFaceValue + interest),
        'Interest Earned': Math.round(interest),
        minApplied
      });
    }
    return data;
  }, [simFaceValue, simBidRate, simFloridaRule]);

  // --- Chart Data: Bid Distribution ---
  const bidDistributionData = useMemo(() => {
    if (!selectedCert) return [];
    const certBids = bids.filter(b => b.certificateId === selectedCert.id);
    return certBids.map((b, idx) => ({
      name: `Bid ${idx + 1}`,
      rate: b.bidRate,
      bidder: b.bidderName
    })).reverse();
  }, [bids, selectedCert]);

  // --- Handlers ---
  const handlePlaceBid = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) return;

    if (bidAmountRate >= selectedCert.maxInterestRate) {
      alert(`Bid rate must be lower than the maximum interest rate of ${selectedCert.maxInterestRate}%`);
      return;
    }

    // Add new bid to history
    const newBid: BidHistoryEntry = {
      id: `b-${Date.now()}`,
      certificateId: selectedCert.id,
      bidderName: 'Sovereign Capital LLC (You)',
      bidRate: bidAmountRate,
      timestamp: 'Just now'
    };

    setBids(prev => [newBid, ...prev]);

    // Update certificate current bid rate if this bid is lower
    setCertificates(prev => prev.map(c => {
      if (c.id === selectedCert.id) {
        const isLowest = bidAmountRate < c.currentBidRate;
        return {
          ...c,
          currentBidRate: isLowest ? bidAmountRate : c.currentBidRate,
          bidsCount: c.bidsCount + 1,
          myBid: bidAmountRate,
          status: isLowest ? 'Won' : 'Pending'
        };
      }
      return c;
    }));

    setBidSuccessMessage(`Successfully placed bid of ${bidAmountRate}% on Parcel ${selectedCert.parcelId}`);
    setTimeout(() => setBidSuccessMessage(null), 5000);
  }, [selectedCert, bidAmountRate]);

  const toggleWatchlist = useCallback((id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  // --- Simulated AI Underwriter ---
  const generateAiReport = useCallback(() => {
    if (!selectedCert) return;
    setIsGeneratingAi(true);
    setAiReport(null);

    setTimeout(() => {
      const ltv = (selectedCert.delinquentAmount / selectedCert.assessedValue) * 100;
      const report = `### SOVEREIGN AI UNDERWRITING REPORT
**Lien ID:** ${selectedCert.id} | **Parcel:** ${selectedCert.parcelId}
**County:** ${selectedCert.county}, ${selectedCert.state}
**Property Type:** ${selectedCert.propertyType}

---

#### 1. RISK ASSESSMENT SUMMARY
* **LTV (Lien-to-Value) Ratio:** **${ltv.toFixed(3)}%** (Extremely Safe). A ratio below 5% indicates massive equity protection. In the event of foreclosure, the collateral value exceeds the lien amount by **${Math.round(selectedCert.assessedValue / selectedCert.delinquentAmount)}x**.
* **Equity Cushion:** **$${(selectedCert.assessedValue - selectedCert.delinquentAmount).toLocaleString()}**
* **Risk Rating:** **${selectedCert.riskScore.toUpperCase()}**
* **Bankruptcy Risk:** Low. No active corporate or personal filings detected on title.

#### 2. COUNTY REDEMPTION PROFILE
* **Miami-Dade / Broward Historical Redemption Rate:** **97.4%** of certificates are redeemed within 24 months.
* **Average Redemption Timeline:** **11.2 Months**.
* **Guaranteed Minimum Return (Florida Rule):** **5.00%** flat interest return if redeemed early, providing a strong yield floor even if bid down to low rates.

#### 3. BIDDING STRATEGY RECOMMENDATION
* **Maximum Recommended Bid Rate:** **6.50%**
* **Target Bid Rate:** **8.00%**
* **Underwriter Verdict:** **STRONG BUY**. This certificate represents a premium asset with negligible default risk. If the owner fails to redeem, foreclosure proceedings would yield a highly valuable property for a fraction of its market value.`;
      
      setAiReport(report);
      setIsGeneratingAi(false);
    }, 1500);
  }, [selectedCert]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Scale className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wider uppercase">Sovereign Wealth & Tax Lien Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Tax Lien Auctions & Yield Terminal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Bid on tax certificates, calculate real-time yields, and run AI-powered property underwriting.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Active Liens</div>
              <div className="text-lg font-bold text-slate-200">{certificates.length}</div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">My Active Bids</div>
              <div className="text-lg font-bold text-slate-200">
                {certificates.filter(c => c.myBid !== undefined).length}
              </div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Avg. Bid Rate</div>
              <div className="text-lg font-bold text-slate-200">10.25%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Listings & Filters (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Filters Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                Auction Filters
              </h2>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCounty('All');
                  setSelectedType('All');
                  setSelectedRisk('All');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by Parcel ID, Address, County..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              {/* County Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">County</label>
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                >
                  {counties.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Property Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="All">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Vacant Land">Vacant Land</option>
                </select>
              </div>

              {/* Risk Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Risk Rating</label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="All">All Risks</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              {/* Watchlist Toggle Filter */}
              <div className="flex items-end pb-1">
                <button
                  onClick={() => setSelectedRisk(selectedRisk === 'Watchlist' ? 'All' : 'Watchlist')}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedRisk === 'Watchlist'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${selectedRisk === 'Watchlist' ? 'fill-amber-500' : ''}`} />
                  {selectedRisk === 'Watchlist' ? 'Showing Watchlist' : 'Filter Watchlist'}
                </button>
              </div>
            </div>
          </div>

          {/* Listings List */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[600px] backdrop-blur-md">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-sm font-bold text-slate-300">
                Lien Certificates ({filteredCertificates.length})
              </h2>
              <span className="text-xs text-slate-500">Click to select</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredCertificates.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No certificates match your filters.
                </div>
              ) : (
                filteredCertificates.map((cert) => {
                  const isSelected = cert.id === selectedCertId;
                  const isWatched = watchlist.includes(cert.id);
                  return (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCertId(cert.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-800/80 border-amber-500/60 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-xs font-mono text-slate-500 block">{cert.parcelId}</span>
                          <h3 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                            {cert.county} County, {cert.state}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(cert.id);
                            }}
                            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isWatched ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cert.riskScore === 'Low' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : cert.riskScore === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {cert.riskScore} Risk
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Delinquent Amount & Bid Rate */}
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3 mt-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Lien Amount</span>
                          <span className="font-bold text-slate-200">${cert.delinquentAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Current Bid</span>
                          <span className="font-bold text-amber-400">{cert.currentBidRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Time Left</span>
                          <span className="font-mono text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {cert.timeLeft}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Status Badges */}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900/50 text-[10px]">
                        <span className="text-slate-400">{cert.propertyType}</span>
                        <div className="flex gap-1">
                          {cert.myBid !== undefined && (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                              My Bid: {cert.myBid}%
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded ${
                            cert.status === 'Won' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : cert.status === 'Lost'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Details, Calculator, Bidding (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Selected Certificate Details */}
          {selectedCert && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Parcel: {selectedCert.parcelId}
                    </span>
                    <span>•</span>
                    <span>{selectedCert.county} County</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedCert.address}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Lien ID:</span>
                  <span className="font-mono text-xs font-bold bg-slate-800 px-2.5 py-1 rounded text-amber-400">
                    {selectedCert.id}
                  </span>
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Assessed Value</span>
                  <span className="text-base font-bold text-slate-200">
                    ${selectedCert.assessedValue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Delinquent Taxes</span>
                  <span className="text-base font-bold text-rose-400">
                    ${selectedCert.delinquentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">LTV Ratio</span>
                  <span className="text-base font-bold text-emerald-400">
                    {((selectedCert.delinquentAmount / selectedCert.assessedValue) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Max Interest Rate</span>
                  <span className="text-base font-bold text-slate-200">
                    {selectedCert.maxInterestRate}%
                  </span>
                </div>
              </div>

              {/* Legal Description */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Legal Description
                </h3>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {selectedCert.legalDescription}
                </p>
              </div>

              {/* Bidding Terminal & Bid History Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Bidding Form (7 Cols) */}
                <div className="md:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase mb-4 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Bidding Terminal (Bid-Down System)
                  </h3>

                  {bidSuccessMessage && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {bidSuccessMessage}
                    </div>
                  )}

                  <form onSubmit={handlePlaceBid} className="flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Your Bid Interest Rate</span>
                        <span className="text-amber-400 font-bold">Current Low: {selectedCert.currentBidRate}%</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max={selectedCert.maxInterestRate}
                          value={bidAmountRate}
                          onChange={(e) => setBidAmountRate(parseFloat(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                        />
                        <Percent className="absolute right-4 top-3 w-4 h-4 text-slate-500" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Florida uses a bid-down system. The lowest interest rate bid wins the certificate.
                      </p>
                    </div>

                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 text-xs text-slate-400">
                      <div className="flex justify-between mb-1">
                        <span>Lien Face Value:</span>
                        <span className="text-slate-200 font-bold">${selectedCert.delinquentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Potential Interest:</span>
                        <span className="text-slate-200 font-bold">
                          ${(selectedCert.delinquentAmount * (bidAmountRate / 100)).toLocaleString(undefined, {maximumFractionDigits: 2})} / yr
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 text-sm"
                    >
                      <Scale className="w-4 h-4" />
                      Submit Bid Rate
                    </button>
                  </form>
                </div>

                {/* Bid History (5 Cols) */}
                <div className="md:col-span-5 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Bid History
                  </h3>
                  <div className="flex-1 overflow-y-auto max-h-[180px] flex flex-col gap-2 pr-1">
                    {bids.filter(b => b.certificateId === selectedCert.id).length === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-xs">
                        No bids placed yet.
                      </div>
                    ) : (
                      bids
                        .filter(b => b.certificateId === selectedCert.id)
                        .map((bid) => (
                          <div key={bid.id} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800/30 text-xs">
                            <div>
                              <span className="font-medium text-slate-300 block truncate max-w-[100px]">
                                {bid.bidderName}
                              </span>
                              <span className="text-[9px] text-slate-500">{bid.timestamp}</span>
                            </div>
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                              {bid.bidRate}%
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Yield Simulator & AI Underwriter Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Yield Simulator (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
              <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Lien Yield Simulator
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Face Value Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Lien Face Value</span>
                    <span className="text-slate-200 font-bold">${simFaceValue.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={simFaceValue}
                    onChange={(e) => setSimFaceValue(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Bid Rate Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Bid Interest Rate</span>
                    <span className="text-amber-400 font-bold">{simBidRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="18"
                    step="0.25"
                    value={simBidRate}
                    onChange={(e) => setSimBidRate(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Redemption Months Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Months to Redemption</span>
                    <span className="text-slate-200 font-bold">{simRedemptionMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={simRedemptionMonths}
                    onChange={(e) => setSimRedemptionMonths(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Florida Rule Toggle */}
                <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Florida 5% Min Rule</span>
                    <span className="text-[9px] text-slate-500">Guaranteed 5% flat interest floor</span>
                  </div>
                  <button
                    onClick={() => setSimFloridaRule(!simFloridaRule)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      simFloridaRule ? 'bg-amber-500' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 bg-slate-950 w-4 h-4 rounded-full transition-transform ${
                      simFloridaRule ? 'translate-x-4' : ''
                    }`} />
                  </button>
                </div>
              </div>

              {/* Simulation Results */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-4 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Interest Earned</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ${yieldMetrics.interestEarned.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </span>
                  {yieldMetrics.isMinApplied && (
                    <span className="text-[8px] text-amber-400 block font-medium mt-0.5">5% Floor Applied</span>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Total Redemption</span>
                  <span className="text-sm font-bold text-slate-200">
                    ${yieldMetrics.totalRedemption.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Annualized Yield</span>
                  <span className="text-sm font-bold text-amber-400">
                    {yieldMetrics.annualizedYield.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Yield Chart */}
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldOverTimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Interest Earned" stroke="#f59e0b" fillOpacity={1} fill="url(#colorYield)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Underwriter (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-500" />
                  AI Underwriter
                </h2>
                <button
                  onClick={generateAiReport}
                  disabled={isGeneratingAi}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg px-2.5 py-1 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAi ? 'Analyzing...' : 'Analyze Lien'}
                </button>
              </div>

              <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 overflow-y-auto max-h-[320px] text-xs leading-relaxed font-mono">
                {isGeneratingAi ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <span>Running risk algorithms & title search...</span>
                  </div>
                ) : aiReport ? (
                  <div className="whitespace-pre-wrap text-slate-300">
                    {aiReport}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-slate-700" />
                    <span>Click "Analyze Lien" to generate a comprehensive risk & yield report powered by Sovereign AI.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}