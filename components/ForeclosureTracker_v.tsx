

// --- CONSOLIDATED FROM: ./components/tax-liens/ForeclosureTracker_v2.tsx ---

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  Building,
  MapPin,
  Calculator,
  Cpu,
  RefreshCw,
  ArrowUpRight,
  FileText,
  ChevronRight,
  Percent,
  BookOpen,
  MessageSquare,
  Send,
  Home,
  Sparkles,
  ShieldCheck,
  Scale,
  Landmark,
  Zap,
  X,
  ChevronDown,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
  Bot,
  ArrowRight,
  Coins,
  Briefcase
} from 'lucide-react';

// Define interfaces for our tax lien tracking system
interface TaxLien {
  id: string;
  parcelId: string;
  address: string;
  county: string;
  state: string;
  lienAmount: number;
  interestRate: number; // Annual rate (e.g., 18% in Florida)
  purchaseDate: string;
  redemptionDeadline: string;
  status: 'Redeemed' | 'Active' | 'Eligible' | 'Filing' | 'DeedIssued';
  ownerName: string;
  assessedValue: number;
  legalStepsCompleted: string[];
  notes: string;
}

// Mock initial data representing high-yield sovereign tax lien acquisitions
const INITIAL_LIENS: TaxLien[] = [
  {
    id: 'TL-2023-8891',
    parcelId: '32-22-31-000-0120',
    address: '1408 Ocean Drive, Miami Beach',
    county: 'Miami-Dade',
    state: 'FL',
    lienAmount: 14250.00,
    interestRate: 18.0,
    purchaseDate: '2023-06-15',
    redemptionDeadline: '2025-06-15',
    status: 'Active',
    ownerName: 'Vanguard Properties LLC',
    assessedValue: 480000,
    legalStepsCompleted: ['Title Search', 'Lien Verification'],
    notes: 'High-value coastal property. Owner has history of late payments but always redeems before foreclosure.'
  },
  {
    id: 'TL-2022-4412',
    parcelId: '12-09-14-201-0050',
    address: '742 Evergreen Terrace, Tampa',
    county: 'Hillsborough',
    state: 'FL',
    lienAmount: 8400.00,
    interestRate: 15.5,
    purchaseDate: '2022-04-10',
    redemptionDeadline: '2024-04-10',
    status: 'Eligible',
    ownerName: 'Estate of Charles Montgomery',
    assessedValue: 210000,
    legalStepsCompleted: ['Title Search', 'Lien Verification', 'Notice of Intent'],
    notes: 'Redemption period expired. Property is vacant. Excellent candidate for immediate foreclosure filing.'
  },
  {
    id: 'TL-2022-1092',
    parcelId: '45-18-02-330-0110',
    address: '883 Sand Hill Road, Palo Alto',
    county: 'Santa Clara',
    state: 'CA',
    lienAmount: 45200.00,
    interestRate: 10.0,
    purchaseDate: '2022-09-01',
    redemptionDeadline: '2025-09-01',
    status: 'Active',
    ownerName: 'Aetheric Ventures Inc',
    assessedValue: 1850000,
    legalStepsCompleted: ['Title Search'],
    notes: 'Commercial zoning. Extremely low loan-to-value ratio. Highly secure asset.'
  },
  {
    id: 'TL-2021-0943',
    parcelId: '09-11-22-104-0020',
    address: '112 Whispering Pines, Flagstaff',
    county: 'Coconino',
    state: 'AZ',
    lienAmount: 3150.00,
    interestRate: 16.0,
    purchaseDate: '2021-11-10',
    redemptionDeadline: '2023-11-10',
    status: 'Filing',
    ownerName: 'Robert & Clara Oswald',
    assessedValue: 175000,
    legalStepsCompleted: ['Title Search', 'Lien Verification', 'Notice of Intent', 'Petition Filed', 'Service of Process'],
    notes: 'Foreclosure petition filed in county court. Hearing scheduled for next month.'
  },
  {
    id: 'TL-2021-0012',
    parcelId: '14-05-06-400-0880',
    address: '404 Lost Highway, Maricopa',
    county: 'Maricopa',
    state: 'AZ',
    lienAmount: 12400.00,
    interestRate: 15.0,
    purchaseDate: '2021-05-20',
    redemptionDeadline: '2023-05-20',
    status: 'DeedIssued',
    ownerName: 'Sovereign Wealth Holdings (Ours)',
    assessedValue: 320000,
    legalStepsCompleted: ['Title Search', 'Lien Verification', 'Notice of Intent', 'Petition Filed', 'Service of Process', 'Court Judgment', 'Deed Issued'],
    notes: 'Deed successfully issued. Property transferred to our real estate portfolio. Preparing for liquidation or rental.'
  },
  {
    id: 'TL-2023-1102',
    parcelId: '22-14-09-112-0044',
    address: '1902 Peachtree St, Atlanta',
    county: 'Fulton',
    state: 'GA',
    lienAmount: 6800.00,
    interestRate: 14.0,
    purchaseDate: '2023-08-12',
    redemptionDeadline: '2024-08-12',
    status: 'Redeemed',
    ownerName: 'Marcus Aurelius Holdings',
    assessedValue: 290000,
    legalStepsCompleted: ['Title Search'],
    notes: 'Redeemed early by owner. Total payout received: $7,752.00 (Principal + 14% accrued interest).'
  }
];

const LEGAL_STEPS_FLOW = [
  'Title Search',
  'Lien Verification',
  'Notice of Intent',
  'Petition Filed',
  'Service of Process',
  'Court Judgment',
  'Deed Issued'
];

export default function ForeclosureTracker_v2() {
  const [liens, setLiens] = useState<TaxLien[]>(INITIAL_LIENS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLien, setSelectedLien] = useState<TaxLien | null>(INITIAL_LIENS[1]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState('10000');
  const [calcRate, setCalcRate] = useState('18');
  const [calcDays, setCalcDays] = useState('365');

  // AI Legal Copilot State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // New Lien Form State
  const [newLien, setNewLien] = useState<Partial<TaxLien>>({
    parcelId: '',
    address: '',
    county: '',
    state: 'FL',
    lienAmount: 5000,
    interestRate: 18,
    purchaseDate: new Date().toISOString().split('T')[0],
    redemptionDeadline: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active',
    ownerName: '',
    assessedValue: 150000,
    legalStepsCompleted: ['Title Search'],
    notes: ''
  });

  // Calculate days remaining helper
  const getDaysRemaining = (deadlineStr: string): number => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate accrued interest helper
  const calculateAccruedInterest = (lien: TaxLien): number => {
    const purchase = new Date(lien.purchaseDate);
    const today = new Date();
    const diffTime = Math.max(0, today.getTime() - purchase.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const annualRate = lien.interestRate / 100;
    return lien.lienAmount * (annualRate * (diffDays / 365));
  };

  // Filtered liens
  const filteredLiens = useMemo(() => {
    return liens.filter(lien => {
      const matchesSearch = 
        lien.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lien.parcelId.includes(searchQuery) ||
        lien.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || lien.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [liens, searchQuery, statusFilter]);

  // Stats calculations
  const stats = useMemo(() => {
    const active = liens.filter(l => l.status === 'Active' || l.status === 'Eligible' || l.status === 'Filing');
    const totalCapital = active.reduce((sum, l) => sum + l.lienAmount, 0);
    const eligibleCount = liens.filter(l => l.status === 'Eligible').length;
    const filingCount = liens.filter(l => l.status === 'Filing').length;
    const totalRedeemed = liens.filter(l => l.status === 'Redeemed').reduce((sum, l) => sum + l.lienAmount, 0);
    
    return {
      totalCapital,
      eligibleCount,
      filingCount,
      totalRedeemed,
      activeCount: active.length
    };
  }, [liens]);

  // Handle adding a new lien
  const handleAddLien = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TaxLien = {
      id: `TL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      parcelId: newLien.parcelId || '00-00-00-000-0000',
      address: newLien.address || 'Unknown Address',
      county: newLien.county || 'Unknown County',
      state: newLien.state || 'FL',
      lienAmount: Number(newLien.lienAmount) || 0,
      interestRate: Number(newLien.interestRate) || 0,
      purchaseDate: newLien.purchaseDate || '',
      redemptionDeadline: newLien.redemptionDeadline || '',
      status: newLien.status as any || 'Active',
      ownerName: newLien.ownerName || 'Unknown Owner',
      assessedValue: Number(newLien.assessedValue) || 0,
      legalStepsCompleted: newLien.legalStepsCompleted || [],
      notes: newLien.notes || ''
    };

    setLiens(prev => [created, ...prev]);
    setSelectedLien(created);
    setShowAddModal(false);
    // Reset form
    setNewLien({
      parcelId: '',
      address: '',
      county: '',
      state: 'FL',
      lienAmount: 5000,
      interestRate: 18,
      purchaseDate: new Date().toISOString().split('T')[0],
      redemptionDeadline: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      ownerName: '',
      assessedValue: 150000,
      legalStepsCompleted: ['Title Search'],
      notes: ''
    });
  };

  // Toggle legal step for selected lien
  const handleToggleStep = (step: string) => {
    if (!selectedLien) return;
    
    setLiens(prev => prev.map(l => {
      if (l.id === selectedLien.id) {
        const steps = l.legalStepsCompleted.includes(step)
          ? l.legalStepsCompleted.filter(s => s !== step)
          : [...l.legalStepsCompleted, step];
        
        // Auto-update status based on steps completed
        let newStatus = l.status;
        if (steps.includes('Deed Issued')) {
          newStatus = 'DeedIssued';
        } else if (steps.includes('Petition Filed')) {
          newStatus = 'Filing';
        } else if (steps.length >= 3 && l.status === 'Active') {
          newStatus = 'Eligible';
        }

        const updated = { ...l, legalStepsCompleted: steps, status: newStatus };
        setSelectedLien(updated);
        return updated;
      }
      return l;
    }));
  };

  // Update status directly
  const handleUpdateStatus = (status: TaxLien['status']) => {
    if (!selectedLien) return;
    setLiens(prev => prev.map(l => {
      if (l.id === selectedLien.id) {
        const updated = { ...l, status };
        setSelectedLien(updated);
        return updated;
      }
      return l;
    }));
  };

  // Mock AI Legal Copilot generation
  const generateLegalNotice = () => {
    if (!selectedLien) return;
    setIsGenerating(true);
    setAiResponse('');
    
    setTimeout(() => {
      const notice = `
NOTICE OF INTENT TO FILE PETITION FOR FORECLOSURE
Date: ${new Date().toLocaleDateString()}

TO: ${selectedLien.ownerName}
PROPERTY ADDRESS: ${selectedLien.address}
PARCEL ID: ${selectedLien.parcelId}
COUNTY: ${selectedLien.county}, State of ${selectedLien.state}

TAKE NOTICE that the undersigned is the lawful holder of Tax Sale Certificate No. ${selectedLien.id}, purchased on ${new Date(selectedLien.purchaseDate).toLocaleDateString()} for delinquent real estate taxes assessed against the above-described property.

The total amount required to redeem this tax lien as of today is $${(selectedLien.lienAmount + calculateAccruedInterest(selectedLien)).toFixed(2)}, which includes the principal tax amount of $${selectedLien.lienAmount.toFixed(2)} plus accrued interest at the rate of ${selectedLien.interestRate}% per annum, and statutory fees.

Pursuant to state statutes, the redemption period is scheduled to expire on ${new Date(selectedLien.redemptionDeadline).toLocaleDateString()}. If the property is not redeemed by said date, the certificate holder intends to immediately file a Petition for Tax Deed / Foreclosure in the Circuit Court of ${selectedLien.county} County.

This action may result in the absolute loss of your title and ownership interest in the property.

Sovereign Wealth Tax Lien Trust, LLC
Authorized Agent & Legal Counsel
      `;
      setAiResponse(notice.trim());
      setIsGenerating(false);
    }, 1200);
  };

  // Calculator calculation
  const calculatedPayoff = useMemo(() => {
    const p = Number(calcPrincipal) || 0;
    const r = Number(calcRate) || 0;
    const d = Number(calcDays) || 0;
    const interest = p * (r / 100) * (d / 365);
    const total = p + interest;
    return {
      interest,
      total
    };
  }, [calcPrincipal, calcRate, calcDays]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-1">
            <Scale className="w-4 h-4" />
            Sovereign Wealth Operations
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Tax Lien Foreclosure Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor redemption periods, manage legal filings, and execute tax deed acquisitions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            Redemption Calculator
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            Acquire / Track New Lien
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Active Liens</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.activeCount}</span>
            <span className="text-xs text-emerald-400 font-medium">In Portfolio</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Capital at Risk</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${stats.totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Secured by Real Estate
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Eligible for Foreclosure</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{stats.eligibleCount}</span>
            <span className="text-xs text-slate-400">Liens</span>
          </div>
          <div className="text-xs text-amber-400/80 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Redemption expired
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Active Court Filings</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">{stats.filingCount}</span>
            <span className="text-xs text-slate-400">Petitions</span>
          </div>
          <div className="text-xs text-blue-400/80 mt-2 flex items-center gap-1">
            <Scale className="w-3 h-3" />
            In legal pipeline
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Redeemed Payouts</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">${stats.totalRedeemed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-xs text-emerald-400/80 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            High-yield returns realized
          </div>
        </div>
      </div>

      {/* Calculator Panel (Collapsible) */}
      {showCalculator && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Lien Redemption & Yield Calculator</h3>
            </div>
            <button onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Lien Principal ($)</label>
              <input
                type="number"
                value={calcPrincipal}
                onChange={(e) => setCalcPrincipal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Annual Interest Rate (%)</label>
              <input
                type="number"
                value={calcRate}
                onChange={(e) => setCalcRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Days Elapsed</label>
              <input
                type="number"
                value={calcDays}
                onChange={(e) => setCalcDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-center">
              <div className="text-xs text-slate-400 uppercase font-medium mb-1">Estimated Payoff</div>
              <div className="text-2xl font-bold text-emerald-400">${calculatedPayoff.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-xs text-slate-500 mt-1">
                Accrued Interest: <span className="text-slate-300">${calculatedPayoff.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Lien List & Filters */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by address, parcel ID, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Redemption</option>
                <option value="Eligible">Eligible for Foreclosure</option>
                <option value="Filing">Foreclosure Filing</option>
                <option value="DeedIssued">Deed Issued</option>
                <option value="Redeemed">Redeemed</option>
              </select>
            </div>
          </div>

          {/* Lien Cards List */}
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredLiens.length === 0 ? (
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
                No tax liens found matching the criteria.
              </div>
            ) : (
              filteredLiens.map((lien) => {
                const daysLeft = getDaysRemaining(lien.redemptionDeadline);
                const isOverdue = daysLeft <= 0 && lien.status === 'Active';
                const accrued = calculateAccruedInterest(lien);

                return (
                  <div
                    key={lien.id}
                    onClick={() => setSelectedLien(lien)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedLien?.id === lien.id
                        ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/10'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {lien.id}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{lien.parcelId}</span>
                        </div>
                        <h3 className="text-base font-semibold text-white mt-1 flex items-center gap-1.5">
                          <Home className="w-4 h-4 text-slate-400" />
                          {lien.address}
                        </h3>
                        <p className="text-xs text-slate-400">{lien.county}, {lien.state}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${lien.lienAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-emerald-400 font-medium flex items-center justify-end gap-1">
                          <Percent className="w-3 h-3" />
                          {lien.interestRate}% Interest
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-500 block">Redemption Deadline</span>
                        <span className="text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(lien.redemptionDeadline).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Time Remaining</span>
                        {lien.status === 'Redeemed' ? (
                          <span className="text-emerald-400 font-medium mt-0.5 block">N/A (Redeemed)</span>
                        ) : daysLeft > 0 ? (
                          <span className="text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {daysLeft} Days Left
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Expired ({Math.abs(daysLeft)} days ago)
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex justify-between sm:justify-start items-center gap-2">
                        <div>
                          <span className="text-slate-500 block">Status</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                            lien.status === 'Active' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                            lien.status === 'Eligible' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            lien.status === 'Filing' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                            lien.status === 'DeedIssued' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {lien.status === 'Active' && 'Active Redemption'}
                            {lien.status === 'Eligible' && 'Eligible for Foreclosure'}
                            {lien.status === 'Filing' && 'Foreclosure Filing'}
                            {lien.status === 'DeedIssued' && 'Deed Issued'}
                            {lien.status === 'Redeemed' && 'Redeemed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed View & Legal Workflow */}
        <div className="flex flex-col gap-6">
          {selectedLien ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
              
              {/* Header Details */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                      {selectedLien.id}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-2">{selectedLien.address}</h2>
                    <p className="text-sm text-slate-400">{selectedLien.county}, {selectedLien.state}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this lien from tracking?')) {
                        setLiens(prev => prev.filter(l => l.id !== selectedLien.id));
                        setSelectedLien(null);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Financial Summary Card */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-xs block">Lien Principal</span>
                  <span className="text-lg font-bold text-white">${selectedLien.lienAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Assessed Value</span>
                  <span className="text-lg font-bold text-slate-300">${selectedLien.assessedValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Accrued Interest</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    +${calculateAccruedInterest(selectedLien).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">LTV Ratio</span>
                  <span className="text-sm font-semibold text-slate-300">
                    {((selectedLien.lienAmount / selectedLien.assessedValue) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['Active', 'Eligible', 'Filing', 'DeedIssued', 'Redeemed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedLien.status === status
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Checklist Workflow */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Legal Filing Checklist</h4>
                  <span className="text-xs text-slate-500">
                    {selectedLien.legalStepsCompleted.length} of {LEGAL_STEPS_FLOW.length} Done
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {LEGAL_STEPS_FLOW.map((step, idx) => {
                    const isCompleted = selectedLien.legalStepsCompleted.includes(step);
                    return (
                      <div
                        key={step}
                        onClick={() => handleToggleStep(step)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isCompleted
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium">{step}</span>
                        </div>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Legal Notice Generator */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Legal Copilot</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Generate a customized statutory Notice of Intent to Foreclose for this property.
                </p>
                <button
                  onClick={generateLegalNotice}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white py-2 rounded-lg text-xs font-medium transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {isGenerating ? 'Generating Notice...' : 'Draft Notice of Intent'}
                </button>

                {aiResponse && (
                  <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-3 relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                        alert('Copied to clipboard!');
                      }}
                      className="absolute top-2 right-2 text-slate-500 hover:text-white p-1 rounded bg-slate-900 border border-slate-800"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                      {aiResponse}
                    </pre>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio Notes</h4>
                <textarea
                  value={selectedLien.notes}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLiens(prev => prev.map(l => l.id === selectedLien.id ? { ...l, notes: val } : l));
                    setSelectedLien(prev => prev ? { ...prev, notes: val } : null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                  placeholder="Add internal notes about this tax lien..."
                />
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
              <Building className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm">Select a tax lien from the list to view legal workflow, calculate payoffs, and generate notices.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Lien Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Track New Tax Lien Acquisition
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLien} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Parcel ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12-34-56-789"
                    value={newLien.parcelId}
                    onChange={(e) => setNewLien(prev => ({ ...prev, parcelId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newLien.ownerName}
                    onChange={(e) => setNewLien(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Property Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Main St, Miami"
                  value={newLien.address}
                  onChange={(e) => setNewLien(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">County</label>
                  <input
                    type="text"
                    required
                    placeholder="Miami-Dade"
                    value={newLien.county}
                    onChange={(e) => setNewLien(prev => ({ ...prev, county: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">State</label>
                  <select
                    value={newLien.state}
                    onChange={(e) => setNewLien(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FL">Florida (FL)</option>
                    <option value="AZ">Arizona (AZ)</option>
                    <option value="CO">Colorado (CO)</option>
                    <option value="CA">California (CA)</option>
                    <option value="GA">Georgia (GA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Assessed Value ($)</label>
                  <input
                    type="number"
                    required
                    value={newLien.assessedValue}
                    onChange={(e) => setNewLien(prev => ({ ...prev, assessedValue: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Lien Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={newLien.lienAmount}
                    onChange={(e) => setNewLien(prev => ({ ...prev, lienAmount: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    required
                    value={newLien.interestRate}
                    onChange={(e) => setNewLien(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={newLien.purchaseDate}
                    onChange={(e) => setNewLien(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Redemption Deadline</label>
                  <input
                    type="date"
                    required
                    value={newLien.redemptionDeadline}
                    onChange={(e) => setNewLien(prev => ({ ...prev, redemptionDeadline: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Internal Notes</label>
                <textarea
                  value={newLien.notes}
                  onChange={(e) => setNewLien(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 h-16 resize-none"
                  placeholder="Add initial notes..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}