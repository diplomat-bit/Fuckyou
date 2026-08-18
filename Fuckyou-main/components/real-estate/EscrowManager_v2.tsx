import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Home, DollarSign, ShieldCheck, Clock, ArrowRight, CheckCircle2, 
  AlertTriangle, FileText, Send, RefreshCw, Lock, Unlock, User, 
  Building, Briefcase, Scale, Coins, Search, Plus, Trash2, Eye, 
  Check, X, Sparkles, FileCheck, HelpCircle, Landmark, ShieldAlert,
  ChevronRight, Layers, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { callGemini } from '../../services/geminiService';

// Interfaces for Escrow Management
export interface EscrowMilestone {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  verifiedBy?: string;
  verifiedAt?: string;
  category: 'legal' | 'financial' | 'inspection' | 'sovereign';
}

export interface EscrowDeal {
  id: string;
  propertyAddress: string;
  parcelId: string;
  buyerName: string;
  buyerWallet: string;
  sellerName: string;
  sellerWallet: string;
  purchasePrice: number;
  earnestMoney: number;
  fundsDeposited: number;
  status: 'initiated' | 'funded' | 'conditions_met' | 'disbursed' | 'cancelled';
  targetClosingDate: string;
  milestones: EscrowMilestone[];
  modernTreasuryLedgerId: string;
  sovereignLedgerTxId?: string;
  createdAt: string;
  paymentRail: 'ACH' | 'WIRE' | 'RTP' | 'SovereignLedger';
}

export interface EscrowAuditLog {
  timestamp: string;
  action: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  txHash?: string;
}

export default function EscrowManager_v2() {
  const dataContext = useContext(DataContext);
  
  // State variables
  const [deals, setDeals] = useState<EscrowDeal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Form state for new Escrow
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPropertyAddress, setNewPropertyAddress] = useState('');
  const [newParcelId, setNewParcelId] = useState('');
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerWallet, setNewBuyerWallet] = useState('');
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerWallet, setNewSellerWallet] = useState('');
  const [newPurchasePrice, setNewPurchasePrice] = useState('');
  const [newEarnestMoney, setNewEarnestMoney] = useState('');
  const [newTargetClosingDate, setNewTargetClosingDate] = useState('');
  const [newPaymentRail, setNewPaymentRail] = useState<'ACH' | 'WIRE' | 'RTP' | 'SovereignLedger'>('WIRE');

  // AI Audit state
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<string | null>(null);
  const [selectedContractText, setSelectedContractText] = useState<string>('');

  // Transaction simulation state
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState<EscrowAuditLog[]>([]);

  // Initialize with robust mock data
  useEffect(() => {
    const initialDeals: EscrowDeal[] = [
      {
        id: 'ESC-9082-FL',
        propertyAddress: '742 Evergreen Terrace, Miami, FL 33101',
        parcelId: 'PARCEL-33101-882',
        buyerName: 'Sovereign Wealth Fund 527',
        buyerWallet: '0x71C...892b',
        sellerName: 'Evergreen Holdings LLC',
        sellerWallet: '0x3A2...991f',
        purchasePrice: 1250000,
        earnestMoney: 125000,
        fundsDeposited: 125000,
        status: 'funded',
        targetClosingDate: '2025-04-15',
        modernTreasuryLedgerId: 'mt_led_99281a',
        sovereignLedgerTxId: 'sov_tx_8819201a',
        createdAt: '2025-02-10',
        paymentRail: 'WIRE',
        milestones: [
          { id: 'm1', name: 'Title Search & Clearance', description: 'Verify clear title and no outstanding liens', status: 'completed', verifiedBy: 'Sovereign Title Corp', verifiedAt: '2025-02-12', category: 'legal' },
          { id: 'm2', name: 'Earnest Money Deposit', description: '10% earnest money secured in escrow ledger', status: 'completed', verifiedBy: 'Modern Treasury Ledger', verifiedAt: '2025-02-11', category: 'financial' },
          { id: 'm3', name: 'Environmental & Property Inspection', description: 'Physical inspection and environmental hazard check', status: 'pending', category: 'inspection' },
          { id: 'm4', name: 'ZKP Citizenship & Compliance Proof', description: 'Zero-Knowledge Proof of buyer eligibility and AML clearance', status: 'pending', category: 'sovereign' }
        ]
      },
      {
        id: 'ESC-4412-NY',
        propertyAddress: '11 Wall Street, Penthouse B, New York, NY 10005',
        parcelId: 'PARCEL-10005-001',
        buyerName: 'Aquarius Institutional Fund',
        buyerWallet: '0x992...112a',
        sellerName: 'Metropolitan Realty Trust',
        sellerWallet: '0x881...552c',
        purchasePrice: 8450000,
        earnestMoney: 845000,
        fundsDeposited: 8450000,
        status: 'conditions_met',
        targetClosingDate: '2025-03-20',
        modernTreasuryLedgerId: 'mt_led_11029b',
        sovereignLedgerTxId: 'sov_tx_9928177c',
        createdAt: '2025-01-15',
        paymentRail: 'RTP',
        milestones: [
          { id: 'm1', name: 'Title Search & Clearance', description: 'Verify clear title and no outstanding liens', status: 'completed', verifiedBy: 'Sovereign Title Corp', verifiedAt: '2025-01-18', category: 'legal' },
          { id: 'm2', name: 'Earnest Money Deposit', description: '10% earnest money secured in escrow ledger', status: 'completed', verifiedBy: 'Modern Treasury Ledger', verifiedAt: '2025-01-16', category: 'financial' },
          { id: 'm3', name: 'Environmental & Property Inspection', description: 'Physical inspection and environmental hazard check', status: 'completed', verifiedBy: 'NYC Inspection Bureau', verifiedAt: '2025-02-01', category: 'inspection' },
          { id: 'm4', name: 'ZKP Citizenship & Compliance Proof', description: 'Zero-Knowledge Proof of buyer eligibility and AML clearance', status: 'completed', verifiedBy: 'Sovereign Sentry Engine', verifiedAt: '2025-02-05', category: 'sovereign' }
        ]
      },
      {
        id: 'ESC-1109-TX',
        propertyAddress: '1200 Congress Ave, Austin, TX 78701',
        parcelId: 'PARCEL-78701-990',
        buyerName: 'Lone Star Capital Partners',
        buyerWallet: '0x551...882d',
        sellerName: 'Austin Tech Hubs LLC',
        sellerWallet: '0x221...443e',
        purchasePrice: 3200000,
        earnestMoney: 320000,
        fundsDeposited: 0,
        status: 'initiated',
        targetClosingDate: '2025-05-01',
        modernTreasuryLedgerId: 'mt_led_44921c',
        createdAt: '2025-02-18',
        paymentRail: 'SovereignLedger',
        milestones: [
          { id: 'm1', name: 'Title Search & Clearance', description: 'Verify clear title and no outstanding liens', status: 'pending', category: 'legal' },
          { id: 'm2', name: 'Earnest Money Deposit', description: '10% earnest money secured in escrow ledger', status: 'pending', category: 'financial' },
          { id: 'm3', name: 'Environmental & Property Inspection', description: 'Physical inspection and environmental hazard check', status: 'pending', category: 'inspection' },
          { id: 'm4', name: 'ZKP Citizenship & Compliance Proof', description: 'Zero-Knowledge Proof of buyer eligibility and AML clearance', status: 'pending', category: 'sovereign' }
        ]
      }
    ];

    setDeals(initialDeals);
    setSelectedDealId(initialDeals[0].id);

    setAuditLogs([
      { timestamp: '2025-02-18 14:22:10', action: 'Escrow Initiated', actor: 'System Orchestrator', status: 'success', details: 'Escrow ESC-1109-TX created for Austin property.' },
      { timestamp: '2025-02-12 09:15:32', action: 'Title Verified', actor: 'Sovereign Title Corp', status: 'success', details: 'Title search completed for ESC-9082-FL. No liens found.' },
      { timestamp: '2025-02-11 11:00:45', action: 'Earnest Money Secured', actor: 'Modern Treasury Bridge', status: 'success', details: '$125,000 deposited via WIRE for ESC-9082-FL.', txHash: 'tx_mt_99281a_dep' },
      { timestamp: '2025-02-05 16:30:12', action: 'ZKP Compliance Verified', actor: 'Sovereign Sentry Engine', status: 'success', details: 'ZKP Citizenship Proof verified successfully for ESC-4412-NY.' }
    ]);
  }, []);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = 
        deal.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [deals, searchQuery, statusFilter]);

  const selectedDeal = useMemo(() => {
    return deals.find(d => d.id === selectedDealId) || null;
  }, [deals, selectedDealId]);

  // Handle creating a new escrow deal
  const handleCreateEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropertyAddress || !newPurchasePrice || !newEarnestMoney) return;

    const price = parseFloat(newPurchasePrice);
    const earnest = parseFloat(newEarnestMoney);

    const newDeal: EscrowDeal = {
      id: `ESC-${Math.floor(1000 + Math.random() * 9000)}-${newPropertyAddress.slice(-8, -6).toUpperCase() || 'US'}`,
      propertyAddress: newPropertyAddress,
      parcelId: newParcelId || `PARCEL-${Math.floor(10000 + Math.random() * 90000)}`,
      buyerName: newBuyerName || 'Anonymous Sovereign Buyer',
      buyerWallet: newBuyerWallet || '0x' + Math.random().toString(16).slice(2, 10) + '...wallet',
      sellerName: newSellerName || 'Private Seller',
      sellerWallet: newSellerWallet || '0x' + Math.random().toString(16).slice(2, 10) + '...wallet',
      purchasePrice: price,
      earnestMoney: earnest,
      fundsDeposited: 0,
      status: 'initiated',
      targetClosingDate: newTargetClosingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      modernTreasuryLedgerId: `mt_led_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString().split('T')[0],
      paymentRail: newPaymentRail,
      milestones: [
        { id: 'm1', name: 'Title Search & Clearance', description: 'Verify clear title and no outstanding liens', status: 'pending', category: 'legal' },
        { id: 'm2', name: 'Earnest Money Deposit', description: 'Earnest money secured in escrow ledger', status: 'pending', category: 'financial' },
        { id: 'm3', name: 'Environmental & Property Inspection', description: 'Physical inspection and environmental hazard check', status: 'pending', category: 'inspection' },
        { id: 'm4', name: 'ZKP Citizenship & Compliance Proof', description: 'Zero-Knowledge Proof of buyer eligibility and AML clearance', status: 'pending', category: 'sovereign' }
      ]
    };

    setDeals([newDeal, ...deals]);
    setSelectedDealId(newDeal.id);
    setShowCreateModal(false);
    
    // Add to audit logs
    const log: EscrowAuditLog = {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: 'Escrow Initiated',
      actor: 'User Operator',
      status: 'success',
      details: `New escrow ${newDeal.id} created for ${newDeal.propertyAddress} with purchase price $${price.toLocaleString()}.`
    };
    setAuditLogs([log, ...auditLogs]);

    // Reset form
    setNewPropertyAddress('');
    setNewParcelId('');
    setNewBuyerName('');
    setNewBuyerWallet('');
    setNewSellerName('');
    setNewSellerWallet('');
    setNewPurchasePrice('');
    setNewEarnestMoney('');
    setNewTargetClosingDate('');
  };

  // Simulate depositing earnest money
  const handleDepositEarnest = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    setIsProcessingAction(true);
    setActionMessage('Initiating Modern Treasury Ledger Transfer...');

    setTimeout(() => {
      setDeals(prevDeals => prevDeals.map(d => {
        if (d.id === dealId) {
          const updatedMilestones = d.milestones.map(m => 
            m.id === 'm2' ? { ...m, status: 'completed' as const, verifiedBy: 'Modern Treasury Ledger', verifiedAt: new Date().toISOString().split('T')[0] } : m
          );
          return {
            ...d,
            fundsDeposited: d.earnestMoney,
            status: d.status === 'initiated' ? 'funded' : d.status,
            milestones: updatedMilestones
          };
        }
        return d;
      }));

      const log: EscrowAuditLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'Earnest Money Deposited',
        actor: 'Modern Treasury Bridge',
        status: 'success',
        details: `$${deal.earnestMoney.toLocaleString()} earnest money secured in escrow ledger for ${deal.id}.`,
        txHash: `tx_mt_${Math.random().toString(36).slice(2, 10)}`
      };
      setAuditLogs(prev => [log, ...prev]);
      setIsProcessingAction(false);
      setActionMessage('');
    }, 1500);
  };

  // Simulate depositing remaining balance
  const handleDepositRemaining = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    setIsProcessingAction(true);
    setActionMessage('Securing remaining purchase balance via selected payment rail...');

    setTimeout(() => {
      setDeals(prevDeals => prevDeals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            fundsDeposited: d.purchasePrice,
            status: 'funded'
          };
        }
        return d;
      }));

      const log: EscrowAuditLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'Full Balance Deposited',
        actor: 'Modern Treasury Bridge',
        status: 'success',
        details: `Remaining balance secured. Total escrow balance: $${deal.purchasePrice.toLocaleString()} for ${deal.id}.`,
        txHash: `tx_mt_${Math.random().toString(36).slice(2, 10)}`
      };
      setAuditLogs(prev => [log, ...prev]);
      setIsProcessingAction(false);
      setActionMessage('');
    }, 1500);
  };

  // Toggle milestone status
  const handleToggleMilestone = (dealId: string, milestoneId: string) => {
    setDeals(prevDeals => prevDeals.map(d => {
      if (d.id === dealId) {
        const updatedMilestones = d.milestones.map(m => {
          if (m.id === milestoneId) {
            const newStatus = m.status === 'completed' ? 'pending' : 'completed';
            return {
              ...m,
              status: newStatus,
              verifiedBy: newStatus === 'completed' ? 'Sovereign Operator' : undefined,
              verifiedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
            };
          }
          return m;
        });

        // Check if all milestones are completed
        const allCompleted = updatedMilestones.every(m => m.status === 'completed');
        const newStatus = allCompleted ? 'conditions_met' : d.fundsDeposited >= d.purchasePrice ? 'funded' : d.status;

        return {
          ...d,
          milestones: updatedMilestones,
          status: newStatus as any
        };
      }
      return d;
    }));

    const deal = deals.find(d => d.id === dealId);
    const milestone = deal?.milestones.find(m => m.id === milestoneId);
    if (deal && milestone) {
      const log: EscrowAuditLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'Milestone Updated',
        actor: 'Sovereign Operator',
        status: 'success',
        details: `Milestone "${milestone.name}" for ${deal.id} marked as ${milestone.status === 'completed' ? 'pending' : 'completed'}.`
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  // Release funds to seller (Disburse)
  const handleReleaseFunds = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    setIsProcessingAction(true);
    setActionMessage('Executing automated multi-party disbursement via Modern Treasury...');

    setTimeout(() => {
      setDeals(prevDeals => prevDeals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            status: 'disbursed',
            sovereignLedgerTxId: `sov_tx_${Math.random().toString(36).slice(2, 10)}`
          };
        }
        return d;
      }));

      const log: EscrowAuditLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'Escrow Disbursed',
        actor: 'Atomic Settlement Coordinator',
        status: 'success',
        details: `Funds released for ${deal.id}. Seller received $${(deal.purchasePrice - deal.earnestMoney).toLocaleString()}. Title company and broker fees settled.`,
        txHash: `tx_disb_${Math.random().toString(36).slice(2, 10)}`
      };
      setAuditLogs(prev => [log, ...prev]);
      setIsProcessingAction(false);
      setActionMessage('');
    }, 2000);
  };

  // Cancel Escrow and refund buyer
  const handleCancelEscrow = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    if (!confirm('Are you sure you want to cancel this escrow? Funds will be returned to the buyer.')) return;

    setIsProcessingAction(true);
    setActionMessage('Reversing ledger entries and initiating buyer refund...');

    setTimeout(() => {
      setDeals(prevDeals => prevDeals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            status: 'cancelled',
            fundsDeposited: 0
          };
        }
        return d;
      }));

      const log: EscrowAuditLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'Escrow Cancelled',
        actor: 'Sovereign Operator',
        status: 'warning',
        details: `Escrow ${deal.id} cancelled. Refund of $${deal.fundsDeposited.toLocaleString()} initiated to buyer wallet ${deal.buyerWallet}.`,
        txHash: `tx_refund_${Math.random().toString(36).slice(2, 10)}`
      };
      setAuditLogs(prev => [log, ...prev]);
      setIsProcessingAction(false);
      setActionMessage('');
    }, 1500);
  };

  // AI Contract Audit using Gemini
  const handleAiContractAudit = async () => {
    if (!selectedDeal) return;
    setAiAuditLoading(true);
    setAiAuditResult(null);

    const prompt = `
      You are an expert real estate attorney and sovereign compliance auditor.
      Analyze the following escrow agreement details for property: ${selectedDeal.propertyAddress}.
      
      Escrow ID: ${selectedDeal.id}
      Purchase Price: $${selectedDeal.purchasePrice.toLocaleString()}
      Earnest Money: $${selectedDeal.earnestMoney.toLocaleString()}
      Buyer: ${selectedDeal.buyerName}
      Seller: ${selectedDeal.sellerName}
      Target Closing Date: ${selectedDeal.targetClosingDate}
      Payment Rail: ${selectedDeal.paymentRail}

      Please provide:
      1. A risk assessment score (1-10, with 10 being highest risk).
      2. Compliance check against Sovereign Wealth Fund guidelines.
      3. Potential title or zoning anomalies to watch out for in this jurisdiction.
      4. Recommended custom milestones to add to this escrow.
    `;

    try {
      const response = await callGemini(prompt);
      setAiAuditResult(response);
      
      const log: EscrowAuditLog = {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'AI Contract Audit',
        actor: 'Gemini AI Auditor',
        status: 'success',
        details: `AI compliance audit completed for ${selectedDeal.id}. Risk analysis generated.`
      };
      setAuditLogs(prev => [log, ...prev]);
    } catch (error) {
      console.error('AI Audit failed:', error);
      setAiAuditResult('Error generating AI audit. Please check your API configuration.');
    } finally {
      setAiAuditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-1">
            <Scale className="w-4 h-4" />
            Sovereign Real Estate Suite
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Escrow Manager v2
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated property purchases, multi-party funds release, and ZKP compliance verification.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            Create Escrow Deal
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Escrows List */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Active Escrows
            </h2>
            
            {/* Search & Filter */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search address, ID, buyer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'initiated', 'funded', 'conditions_met', 'disbursed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      statusFilter === status 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {status === 'conditions_met' ? 'Conditions Met' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Escrow Cards List */}
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredDeals.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No escrow deals found matching criteria.
                </div>
              ) : (
                filteredDeals.map((deal) => {
                  const isSelected = deal.id === selectedDealId;
                  const progress = (deal.fundsDeposited / deal.purchasePrice) * 100;
                  
                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-slate-800/60 border-emerald-500/50 shadow-md shadow-emerald-950/10' 
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {deal.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          deal.status === 'disbursed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          deal.status === 'conditions_met' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          deal.status === 'funded' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          deal.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-800'
                        }`}>
                          {deal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-slate-200 truncate mb-1">
                        {deal.propertyAddress}
                      </h3>
                      <div className="flex justify-between text-xs text-slate-400 mt-3">
                        <span>Price: ${deal.purchasePrice.toLocaleString()}</span>
                        <span>Closing: {deal.targetClosingDate}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Funds Secured</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              deal.status === 'disbursed' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Escrow Portfolio Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500">Total Volume</div>
                <div className="text-lg font-bold text-slate-200 mt-1">
                  ${deals.reduce((acc, d) => acc + d.purchasePrice, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-500">Secured Funds</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  ${deals.reduce((acc, d) => acc + d.fundsDeposited, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Escrow View */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedDeal ? (
            <>
              {/* Deal Header Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md">
                        {selectedDeal.id}
                      </span>
                      <span className="text-xs text-slate-500">Created on {selectedDeal.createdAt}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Home className="w-5 h-5 text-slate-400" />
                      {selectedDeal.propertyAddress}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">Parcel ID: {selectedDeal.parcelId}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Purchase Price</div>
                    <div className="text-2xl font-extrabold text-slate-100">
                      ${selectedDeal.purchasePrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Secured via {selectedDeal.paymentRail}
                    </div>
                  </div>
                </div>

                {/* Financial Status Bar */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-400">Escrow Funding Progress</span>
                    <span className="text-xs font-mono text-slate-300">
                      ${selectedDeal.fundsDeposited.toLocaleString()} / ${selectedDeal.purchasePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                      style={{ width: `${(selectedDeal.fundsDeposited / selectedDeal.purchasePrice) * 100}%` }}
                    />
                  </div>
                  
                  {/* Action Buttons based on status */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {selectedDeal.fundsDeposited < selectedDeal.earnestMoney && (
                      <button
                        onClick={() => handleDepositEarnest(selectedDeal.id)}
                        disabled={isProcessingAction}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        Deposit Earnest Money (${selectedDeal.earnestMoney.toLocaleString()})
                      </button>
                    )}
                    
                    {selectedDeal.fundsDeposited >= selectedDeal.earnestMoney && selectedDeal.fundsDeposited < selectedDeal.purchasePrice && (
                      <button
                        onClick={() => handleDepositRemaining(selectedDeal.id)}
                        disabled={isProcessingAction}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        Deposit Remaining Balance (${(selectedDeal.purchasePrice - selectedDeal.fundsDeposited).toLocaleString()})
                      </button>
                    )}

                    {selectedDeal.status === 'conditions_met' && (
                      <button
                        onClick={() => handleReleaseFunds(selectedDeal.id)}
                        disabled={isProcessingAction}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Release Funds & Close Escrow
                      </button>
                    )}

                    {selectedDeal.status !== 'disbursed' && selectedDeal.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelEscrow(selectedDeal.id)}
                        disabled={isProcessingAction}
                        className="border border-rose-900/50 hover:border-rose-700 text-rose-400 hover:bg-rose-950/20 text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Escrow
                      </button>
                    )}
                  </div>
                </div>

                {/* Buyer & Seller Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-400" /> Buyer
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{selectedDeal.buyerName}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1 truncate">{selectedDeal.buyerWallet}</div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Building className="w-3 h-3 text-amber-400" /> Seller
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{selectedDeal.sellerName}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1 truncate">{selectedDeal.sellerWallet}</div>
                  </div>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Escrow Milestones & Conditions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDeal.milestones.map((milestone) => {
                    const isCompleted = milestone.status === 'completed';
                    return (
                      <div 
                        key={milestone.id}
                        className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                          isCompleted 
                            ? 'bg-emerald-950/10 border-emerald-800/40' 
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                              milestone.category === 'legal' ? 'bg-blue-500/10 text-blue-400' :
                              milestone.category === 'financial' ? 'bg-amber-500/10 text-amber-400' :
                              milestone.category === 'inspection' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {milestone.category}
                            </span>
                            
                            <button
                              onClick={() => handleToggleMilestone(selectedDeal.id, milestone.id)}
                              className={`p-1 rounded-md transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                                  : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <h4 className="text-sm font-semibold text-slate-200 mb-1">{milestone.name}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{milestone.description}</p>
                        </div>

                        {isCompleted && (
                          <div className="mt-3 pt-2 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500">
                            <span>Verified by: {milestone.verifiedBy}</span>
                            <span>{milestone.verifiedAt}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Contract Auditor Panel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    AI Escrow & Deed Auditor
                  </h3>
                  <button
                    onClick={handleAiContractAudit}
                    disabled={aiAuditLoading}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    {aiAuditLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Auditing Contract...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Run AI Compliance Audit
                      </>
                    )}
                  </button>
                </div>

                {aiAuditResult ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-60 overflow-y-auto text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {aiAuditResult}
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-lg p-8 text-center text-slate-500 text-sm">
                    Click "Run AI Compliance Audit" to analyze this escrow agreement for regulatory compliance, title anomalies, and risk factors.
                  </div>
                )}
              </div>

              {/* Audit Trail & Ledger Sync */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Escrow Audit Trail & Ledger Sync
                </h3>
                
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800/60 rounded-lg p-3 flex justify-between items-start gap-4">
                      <div className="flex gap-3 items-start">
                        <div className="mt-0.5">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : log.status === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{log.action}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{log.details}</div>
                          {log.txHash && (
                            <div className="text-[10px] text-emerald-400 font-mono mt-1">
                              Tx Hash: {log.txHash}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                        <div>{log.actor}</div>
                        <div className="mt-1 font-mono">{log.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">
              Select an active escrow deal from the left panel to view details, manage milestones, and release funds.
            </div>
          )}
        </div>
      </div>

      {/* Create Escrow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Initiate New Escrow Deal
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEscrow} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Property Address *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 123 Main St, Miami, FL"
                    value={newPropertyAddress}
                    onChange={(e) => setNewPropertyAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Parcel ID / Tax Map Key</label>
                  <input 
                    type="text" 
                    placeholder="e.g. PARCEL-33101-882"
                    value={newParcelId}
                    onChange={(e) => setNewParcelId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Buyer Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sovereign Wealth Fund"
                    value={newBuyerName}
                    onChange={(e) => setNewBuyerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Buyer Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="0x..."
                    value={newBuyerWallet}
                    onChange={(e) => setNewBuyerWallet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Seller Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Evergreen Holdings LLC"
                    value={newSellerName}
                    onChange={(e) => setNewSellerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Seller Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="0x..."
                    value={newSellerWallet}
                    onChange={(e) => setNewSellerWallet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Purchase Price ($) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 1250000"
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Earnest Money ($) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 125000"
                    value={newEarnestMoney}
                    onChange={(e) => setNewEarnestMoney(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Closing Date</label>
                  <input 
                    type="date" 
                    value={newTargetClosingDate}
                    onChange={(e) => setNewTargetClosingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Settlement Payment Rail</label>
                <select
                  value={newPaymentRail}
                  onChange={(e) => setNewPaymentRail(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="WIRE">Fedwire (Modern Treasury)</option>
                  <option value="ACH">ACH Standard</option>
                  <option value="RTP">Real-Time Payments (RTP)</option>
                  <option value="SovereignLedger">Sovereign Ledger Sync</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
                >
                  Initiate Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Processing Overlay */}
      {isProcessingAction && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-slate-100">Processing Transaction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{actionMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}