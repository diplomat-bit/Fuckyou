import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CreditCard, 
  Send, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Search, 
  Filter, 
  DollarSign, 
  User, 
  Globe, 
  ArrowRight, 
  Info, 
  Lock,
  Check,
  ChevronRight,
  Sliders,
  TrendingUp,
  Building
} from 'lucide-react';
import Card from './Card';

// Types for Visa Receiver Directed Payouts
interface VisaCard {
  id: string;
  alias: string;
  cardholderName: string;
  cardNumberLast4: string;
  expiryMonth: string;
  expiryYear: string;
  cardBrand: 'Visa' | 'Visa Electron' | 'Visa Debit';
  fastFundsEligible: boolean;
  pushFundsEligible: boolean;
  countryCode: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'Active' | 'Pending_Verification' | 'Suspended';
  registeredAt: string;
}

interface VisaPayout {
  id: string;
  recipientCardId: string;
  recipientName: string;
  amount: number;
  currency: string;
  purposeCode: string; // e.g., 'GD' (General Disbursement), 'EP' (Employee Payout)
  senderReference: string;
  visaTransactionId: string;
  status: 'Initiated' | 'Processing' | 'Completed' | 'Failed';
  settlementSpeed: 'Instant' | 'Standard';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

const PURPOSE_CODES = [
  { code: 'GD', label: 'General Disbursement (GD)' },
  { code: 'EP', label: 'Employee Payout / Salary (EP)' },
  { code: 'G2C', label: 'Government to Consumer (G2C)' },
  { code: 'P2P', label: 'Peer to Peer Transfer (P2P)' },
  { code: 'CD', label: 'Card Bill Payment (CD)' },
  { code: 'FT', label: 'Funds Transfer (FT)' },
];

export default function VisaPayoutsView() {
  // State
  const [activeTab, setActiveTab] = useState<'payouts' | 'cards' | 'analytics'>('payouts');
  const [cards, setCards] = useState<VisaCard[]>([
    {
      id: 'card-1',
      alias: 'Primary Disbursement Card',
      cardholderName: 'Sarah Jenkins',
      cardNumberLast4: '4111',
      expiryMonth: '12',
      expiryYear: '2027',
      cardBrand: 'Visa Debit',
      fastFundsEligible: true,
      pushFundsEligible: true,
      countryCode: 'US',
      billingAddress: {
        street: '123 Sovereign Way',
        city: 'Miami',
        state: 'FL',
        postalCode: '33101',
        country: 'US'
      },
      status: 'Active',
      registeredAt: '2025-01-15T10:30:00Z'
    },
    {
      id: 'card-2',
      alias: 'Contractor Payout Card',
      cardholderName: 'Alex Rivera',
      cardNumberLast4: '4532',
      expiryMonth: '08',
      expiryYear: '2026',
      cardBrand: 'Visa',
      fastFundsEligible: true,
      pushFundsEligible: true,
      countryCode: 'US',
      billingAddress: {
        street: '789 Ocean Drive',
        city: 'Miami Beach',
        state: 'FL',
        postalCode: '33139',
        country: 'US'
      },
      status: 'Active',
      registeredAt: '2025-02-01T14:22:00Z'
    },
    {
      id: 'card-3',
      alias: 'International Supplier Card',
      cardholderName: 'Elena Rostova',
      cardNumberLast4: '4000',
      expiryMonth: '04',
      expiryYear: '2028',
      cardBrand: 'Visa Electron',
      fastFundsEligible: false,
      pushFundsEligible: true,
      countryCode: 'GB',
      billingAddress: {
        street: '24 Piccadilly Circus',
        city: 'London',
        state: 'England',
        postalCode: 'W1J 9HP',
        country: 'GB'
      },
      status: 'Pending_Verification',
      registeredAt: '2025-02-18T09:15:00Z'
    }
  ]);

  const [payouts, setPayouts] = useState<VisaPayout[]>([
    {
      id: 'pay-101',
      recipientCardId: 'card-1',
      recipientName: 'Sarah Jenkins',
      amount: 1250.00,
      currency: 'USD',
      purposeCode: 'EP',
      senderReference: 'SOV-PAY-2025-001',
      visaTransactionId: 'VSD-982374928374-X',
      status: 'Completed',
      settlementSpeed: 'Instant',
      createdAt: '2025-02-15T11:00:00Z',
      updatedAt: '2025-02-15T11:00:32Z'
    },
    {
      id: 'pay-102',
      recipientCardId: 'card-2',
      recipientName: 'Alex Rivera',
      amount: 450.00,
      currency: 'USD',
      purposeCode: 'GD',
      senderReference: 'SOV-PAY-2025-002',
      visaTransactionId: 'VSD-102938475610-Y',
      status: 'Completed',
      settlementSpeed: 'Instant',
      createdAt: '2025-02-17T15:30:00Z',
      updatedAt: '2025-02-17T15:30:45Z'
    },
    {
      id: 'pay-103',
      recipientCardId: 'card-1',
      recipientName: 'Sarah Jenkins',
      amount: 3200.00,
      currency: 'USD',
      purposeCode: 'EP',
      senderReference: 'SOV-PAY-2025-003',
      visaTransactionId: 'VSD-554637281902-Z',
      status: 'Processing',
      settlementSpeed: 'Instant',
      createdAt: '2025-02-19T16:45:00Z',
      updatedAt: '2025-02-19T16:45:00Z'
    }
  ]);

  // Form States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New Card Form State
  const [newCard, setNewCard] = useState({
    alias: '',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    countryCode: 'US',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });

  // New Payout Form State
  const [newPayout, setNewPayout] = useState({
    recipientCardId: '',
    amount: '',
    currency: 'USD',
    purposeCode: 'GD',
    senderReference: '',
    settlementSpeed: 'Instant' as 'Instant' | 'Standard'
  });

  // Real-time simulation of payout processing
  useEffect(() => {
    const interval = setInterval(() => {
      setPayouts(prevPayouts => 
        prevPayouts.map(payout => {
          if (payout.status === 'Processing') {
            // 85% chance of success, 15% chance of failure for simulation
            const isSuccess = Math.random() > 0.15;
            return {
              ...payout,
              status: isSuccess ? 'Completed' : 'Failed',
              errorMessage: isSuccess ? undefined : 'Visa Direct Network Timeout / Card Blocked',
              updatedAt: new Date().toISOString()
            };
          }
          return payout;
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter(payout => {
      const matchesSearch = 
        payout.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.senderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.visaTransactionId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || payout.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [payouts, searchQuery, statusFilter]);

  // Handle Card Registration
  const handleRegisterCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Visa Card Eligibility Service (AILS/VCE) API Call
    setTimeout(() => {
      const last4 = newCard.cardNumber.replace(/\s/g, '').slice(-4) || '1111';
      const isFastFunds = newCard.cardNumber.startsWith('4'); // Visa cards starting with 4 are generally fast funds eligible in US

      const registered: VisaCard = {
        id: `card-${Date.now()}`,
        alias: newCard.alias || `${newCard.cardholderName}'s Card`,
        cardholderName: newCard.cardholderName,
        cardNumberLast4: last4,
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        cardBrand: 'Visa Debit',
        fastFundsEligible: isFastFunds,
        pushFundsEligible: true,
        countryCode: newCard.countryCode,
        billingAddress: {
          street: newCard.street,
          city: newCard.city,
          state: newCard.state,
          postalCode: newCard.postalCode,
          country: newCard.countryCode
        },
        status: 'Active',
        registeredAt: new Date().toISOString()
      };

      setCards(prev => [registered, ...prev]);
      setIsSubmitting(false);
      setShowRegisterModal(false);
      // Reset form
      setNewCard({
        alias: '',
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        countryCode: 'US',
        street: '',
        city: '',
        state: '',
        postalCode: ''
      });
    }, 2000);
  };

  // Handle Payout Initiation
  const handleInitiatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedCard = cards.find(c => c.id === newPayout.recipientCardId);
    if (!selectedCard) return;

    // Simulate Visa Direct Push Payment API Call (Fast Funds / Real-time)
    setTimeout(() => {
      const payout: VisaPayout = {
        id: `pay-${Date.now()}`,
        recipientCardId: newPayout.recipientCardId,
        recipientName: selectedCard.cardholderName,
        amount: parseFloat(newPayout.amount),
        currency: newPayout.currency,
        purposeCode: newPayout.purposeCode,
        senderReference: newPayout.senderReference || `SOV-PAY-${Math.floor(Math.random() * 100000)}`,
        visaTransactionId: `VSD-${Math.floor(Math.random() * 1000000000000)}-X`,
        status: 'Processing',
        settlementSpeed: newPayout.settlementSpeed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPayouts(prev => [payout, ...prev]);
      setIsSubmitting(false);
      setShowPayoutModal(false);
      // Reset form
      setNewPayout({
        recipientCardId: '',
        amount: '',
        currency: 'USD',
        purposeCode: 'GD',
        senderReference: '',
        settlementSpeed: 'Instant'
      });
    }, 1500);
  };

  // Delete Card
  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to remove this registered card?')) {
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  // Analytics Calculations
  const analytics = useMemo(() => {
    const totalVolume = payouts
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const successRate = payouts.length > 0 
      ? (payouts.filter(p => p.status === 'Completed').length / payouts.length) * 100 
      : 100;

    const instantCount = payouts.filter(p => p.settlementSpeed === 'Instant' && p.status === 'Completed').length;

    return {
      totalVolume,
      successRate,
      instantCount,
      totalPayouts: payouts.length
    };
  }, [payouts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Visa Direct Payouts
                <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Receiver Directed
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Real-time push-to-card disbursements via Visa Direct network.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Register Card
          </button>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-lg shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
            Initiate Payout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'payouts'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Payout Tracking
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'cards'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Registered Cards
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Network Analytics
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {activeTab === 'payouts' && (
          <Card>
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by recipient, reference, or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Initiated">Initiated</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Payouts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4 px-4">Recipient</th>
                      <th className="py-4 px-4">Reference / Visa Tx ID</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Purpose</th>
                      <th className="py-4 px-4">Speed</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {filteredPayouts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No payouts found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPayouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-slate-900/30 transition-all">
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-200">{payout.recipientName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <CreditCard className="w-3 h-3" />
                              Card ending in {cards.find(c => c.id === payout.recipientCardId)?.cardNumberLast4 || '****'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-mono text-xs text-slate-300">{payout.senderReference}</div>
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5">{payout.visaTransactionId}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-200">
                            ${payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                              {payout.purposeCode}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-medium flex items-center gap-1 ${
                              payout.settlementSpeed === 'Instant' ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {payout.settlementSpeed === 'Instant' ? '⚡ Instant' : '⏳ Standard'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                                payout.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                payout.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                                payout.status === 'Initiated' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {payout.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {payout.status === 'Processing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                {payout.status === 'Failed' && <AlertCircle className="w-3.5 h-3.5" />}
                                {payout.status}
                              </span>
                              {payout.errorMessage && (
                                <span className="text-[11px] text-rose-400 mt-1 max-w-[180px] truncate" title={payout.errorMessage}>
                                  {payout.errorMessage}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400">
                            {new Date(payout.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cards List */}
            <div className="lg:col-span-2 space-y-4">
              {cards.map((card) => (
                <Card key={card.id}>
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-200">{card.alias}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            card.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {card.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {card.cardholderName} • Visa ending in {card.cardNumberLast4} (Exp: {card.expiryMonth}/{card.expiryYear})
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {card.fastFundsEligible && (
                            <span className="text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                              ⚡ Fast Funds Eligible
                            </span>
                          )}
                          {card.pushFundsEligible && (
                            <span className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
                              ✓ Push Funds Eligible
                            </span>
                          )}
                          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                            🌍 Country: {card.countryCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-800 md:border-t-0 pt-4 md:pt-0">
                      <button
                        onClick={() => {
                          setNewPayout(prev => ({ ...prev, recipientCardId: card.id }));
                          setShowPayoutModal(true);
                        }}
                        disabled={card.status !== 'Active'}
                        className="flex items-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 disabled:opacity-50 disabled:pointer-events-none px-3.5 py-2 rounded-lg border border-blue-500/20 transition-all text-xs font-medium"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Pay to Card
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 hover:border-rose-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Card Registration Info */}
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Visa Direct Compliance
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    To comply with Visa Direct network rules, all recipient cards must undergo real-time eligibility checks (AILS) and sanction screening before push payments can be executed.
                  </p>
                  <div className="space-y-3 text-xs text-slate-400">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      <span><strong>Fast Funds:</strong> Enables funds availability to the cardholder within 30 minutes of transaction approval.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      <span><strong>Cross-Border:</strong> Supports international payouts with real-time currency conversion.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      <span><strong>Purpose Codes:</strong> Mandatory classification of payout intent to prevent network misuse.</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="p-6">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Volume</div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">
                    ${analytics.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3" />
                    +12.4% from last month
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Success Rate</div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">
                    {analytics.successRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Visa Direct SLA compliant
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Instant Settlements</div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">
                    {analytics.instantCount}
                  </div>
                  <div className="text-xs text-amber-400 flex items-center gap-1 mt-2">
                    ⚡ 100% Fast Funds success
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Payouts</div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">
                    {analytics.totalPayouts}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                    Across {cards.length} registered cards
                  </div>
                </div>
              </Card>
            </div>

            {/* Network Status */}
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Visa Direct Network Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs text-slate-400">Visa Direct Core API</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-slate-200">Operational</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Latency: 142ms</div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs text-slate-400">Card Eligibility Service (AILS)</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-slate-200">Operational</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Latency: 185ms</div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                    <div className="text-xs text-slate-400">Settlement Engine</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-slate-200">Operational</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Next batch: Real-time push</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Register Card Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Register Recipient Card
              </h3>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterCard} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Card Alias / Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sarah's Primary Debit"
                    value={newCard.alias}
                    onChange={(e) => setNewCard(prev => ({ ...prev, alias: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={newCard.cardholderName}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Visa Card Number (PAN)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4111 1111 1111 1111"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Expiry Month
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="MM"
                    value={newCard.expiryMonth}
                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Expiry Year
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="YYYY"
                    value={newCard.expiryYear}
                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billing Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={newCard.street}
                      onChange={(e) => setNewCard(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newCard.city}
                    onChange={(e) => setNewCard(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State / Province"
                    value={newCard.state}
                    onChange={(e) => setNewCard(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Postal Code"
                    value={newCard.postalCode}
                    onChange={(e) => setNewCard(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                  />
                  <select
                    value={newCard.countryCode}
                    onChange={(e) => setNewCard(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="MX">Mexico (MX)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 mt-4">
                <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>PCI-DSS Compliant. Card details are tokenized directly with Visa Direct.</span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-all text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying Card...
                    </>
                  ) : (
                    'Register & Verify'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Initiate Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                Initiate Push Payout
              </h3>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInitiatePayout} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Recipient Card
                </label>
                <select
                  required
                  value={newPayout.recipientCardId}
                  onChange={(e) => setNewPayout(prev => ({ ...prev, recipientCardId: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">-- Select Registered Card --</option>
                  {cards.filter(c => c.status === 'Active').map(card => (
                    <option key={card.id} value={card.id}>
                      {card.alias} ({card.cardholderName} - *{card.cardNumberLast4})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="1.00"
                      placeholder="0.00"
                      value={newPayout.amount}
                      onChange={(e) => setNewPayout(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={newPayout.currency}
                    onChange={(e) => setNewPayout(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Visa Purpose Code
                </label>
                <select
                  value={newPayout.purposeCode}
                  onChange={(e) => setNewPayout(prev => ({ ...prev, purposeCode: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  {PURPOSE_CODES.map(pc => (
                    <option key={pc.code} value={pc.code}>
                      {pc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Sender Reference / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g., Invoice #2025-09"
                  value={newPayout.senderReference}
                  onChange={(e) => setNewPayout(prev => ({ ...prev, senderReference: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Settlement Speed
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPayout(prev => ({ ...prev, settlementSpeed: 'Instant' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newPayout.settlementSpeed === 'Instant'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">⚡ Instant</div>
                    <div className="text-[11px] mt-1">Funds available in &lt; 30 mins.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPayout(prev => ({ ...prev, settlementSpeed: 'Standard' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newPayout.settlementSpeed === 'Standard'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">⏳ Standard</div>
                    <div className="text-[11px] mt-1">Funds available in 1-2 business days.</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-all text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing Push...
                    </>
                  ) : (
                    'Confirm & Push Funds'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}