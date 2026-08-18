import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from './Card';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  RefreshCw, 
  Sliders, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Plus, 
  Search, 
  Settings, 
  CheckCircle2, 
  HelpCircle, 
  Fingerprint, 
  Cpu,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  Layers,
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { callGemini } from '../services/geminiService';

// --- TYPES & INTERFACES ---
export interface VisaCard {
  id: string;
  pan: string;
  panReferenceId: string; // PRID (29-char alphanumeric)
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv2: string;
  icvv: string; // Integrated Circuit Card Verification Value
  dcvv2: string; // Dynamic CVV2
  cardType: 'Infinite' | 'Signature' | 'Platinum' | 'Classic';
  status: 'Active' | 'Frozen' | 'Suspended';
  spendingLimitDaily: number;
  spendingLimitMonthly: number;
  spentDaily: number;
  spentMonthly: number;
  currency: string;
  allowedCategories: string[];
  tokenizedDevices: { deviceName: string; tokenSuffix: string; status: string }[];
  design: {
    gradient: string;
    tagline: string;
    themeName: string;
  };
}

interface GeminiLimitRecommendation {
  recommendedDailyLimit: number;
  recommendedMonthlyLimit: number;
  reasoning: string;
  suggestedRules: string[];
}

interface GeminiDesignRecommendation {
  gradient: string;
  tagline: string;
  themeName: string;
  description: string;
}

// --- INITIAL SEED DATA ---
const INITIAL_CARDS: VisaCard[] = [
  {
    id: 'v-card-1',
    pan: '4000123456789010',
    panReferenceId: 'PRID9823749283749283749283741',
    cardholderName: 'ALEXANDER WRIGHT',
    expiryMonth: '12',
    expiryYear: '2029',
    cvv2: '382',
    icvv: '901',
    dcvv2: '412',
    cardType: 'Infinite',
    status: 'Active',
    spendingLimitDaily: 15000,
    spendingLimitMonthly: 100000,
    spentDaily: 1250,
    spentMonthly: 34200,
    currency: 'USD',
    allowedCategories: ['Travel', 'Dining', 'Software', 'Hardware', 'Services'],
    tokenizedDevices: [
      { deviceName: 'iPhone 15 Pro Max', tokenSuffix: '9821', status: 'Active' },
      { deviceName: 'MacBook Pro 16', tokenSuffix: '4412', status: 'Active' }
    ],
    design: {
      gradient: 'from-slate-900 via-purple-950 to-slate-900',
      tagline: 'Sovereign Wealth & Infinite Horizons',
      themeName: 'Obsidian Nebula'
    }
  },
  {
    id: 'v-card-2',
    pan: '4111222233334444',
    panReferenceId: 'PRID1122334455667788990011223',
    cardholderName: 'ALEXANDER WRIGHT',
    expiryMonth: '08',
    expiryYear: '2028',
    cvv2: '109',
    icvv: '554',
    dcvv2: '883',
    cardType: 'Signature',
    status: 'Frozen',
    spendingLimitDaily: 5000,
    spendingLimitMonthly: 25000,
    spentDaily: 0,
    spentMonthly: 12400,
    currency: 'USD',
    allowedCategories: ['Dining', 'Software', 'Services'],
    tokenizedDevices: [
      { deviceName: 'Apple Watch Ultra', tokenSuffix: '1102', status: 'Suspended' }
    ],
    design: {
      gradient: 'from-blue-950 via-indigo-900 to-slate-900',
      tagline: 'Precision Execution & Security',
      themeName: 'Deep Cobalt'
    }
  }
];

export default function VisaCardServices() {
  // --- STATE ---
  const [cards, setCards] = useState<VisaCard[]>(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_CARDS[0].id);
  const [activeTab, setActiveTab] = useState<'my-cards' | 'issue-card' | 'analytics' | 'security'>('my-cards');
  
  // Card Creation Form State
  const [newCardholder, setNewCardholder] = useState('ALEXANDER WRIGHT');
  const [newCardType, setNewCardType] = useState<VisaCard['cardType']>('Infinite');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newDailyLimit, setNewDailyLimit] = useState(10000);
  const [newMonthlyLimit, setNewMonthlyLimit] = useState(50000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Travel', 'Dining', 'Software', 'Services']);
  const [customizationPrompt, setCustomizationPrompt] = useState('Sovereign wealth, high-tech, minimalist gold accents');
  
  // Dynamic CVV State
  const [dcvvCountdown, setDcvvCountdown] = useState(30);
  const [showFullPan, setShowFullPan] = useState<Record<string, boolean>>({});
  
  // Gemini Integration States
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [limitRecommendation, setLimitRecommendation] = useState<GeminiLimitRecommendation | null>(null);
  const [designRecommendation, setDesignRecommendation] = useState<GeminiDesignRecommendation | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Selected Card Object Helper
  const selectedCard = useMemo(() => {
    return cards.find(c => c.id === selectedCardId) || cards[0];
  }, [cards, selectedCardId]);

  // --- REAL-TIME CVV/iCVV GENERATION ---
  // Simulates Visa's dynamic CVV2 (dCVV2) generation algorithm based on timestamp and card ID
  const generateDynamicCVV = useCallback((cardId: string): string => {
    const timestamp = Math.floor(Date.now() / 30000); // Changes every 30 seconds
    const hashInput = `${cardId}-${timestamp}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const positiveHash = Math.abs(hash);
    const dcvv = (positiveHash % 900 + 100).toString(); // Generates a 3-digit number between 100 and 999
    return dcvv;
  }, []);

  // Dynamic CVV rotation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDcvvCountdown(prev => {
        if (prev <= 1) {
          // Rotate dCVV for all cards
          setCards(currentCards => 
            currentCards.map(card => ({
              ...card,
              dcvv2: generateDynamicCVV(card.id)
            }))
          );
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [generateDynamicCVV]);

  // --- HELPER FUNCTIONS ---
  const toggleCardFreeze = (id: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'Frozen' ? 'Active' : 'Frozen'
        };
      }
      return c;
    }));
  };

  const togglePanVisibility = (id: string) => {
    setShowFullPan(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatPan = (pan: string, isVisible: boolean) => {
    if (isVisible) {
      return pan.replace(/(\d{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${pan.slice(-4)}`;
  };

  // Generates a realistic PAN Reference ID (PRID)
  const generatePRID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let prid = 'PRID';
    for (let i = 0; i < 25; i++) {
      prid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prid;
  };

  // Generates a realistic Visa PAN
  const generateVisaPan = () => {
    let pan = '4'; // Visa starts with 4
    for (let i = 0; i < 15; i++) {
      pan += Math.floor(Math.random() * 10).toString();
    }
    return pan;
  };

  // --- GEMINI POWERED CARD CUSTOMIZATION ---
  const handleGeminiCustomize = async () => {
    setGeminiLoading(true);
    setGeminiError(null);
    
    const prompt = `
      You are an elite Visa Card Design Architect. Generate a custom card design based on this user prompt: "${customizationPrompt}".
      Provide a beautiful CSS gradient (Tailwind compatible, e.g., "from-amber-500 via-yellow-600 to-stone-900"), a high-end luxury tagline (max 40 chars), a theme name, and a brief description of the design.
      
      Respond ONLY with a valid JSON object matching this structure:
      {
        "gradient": "from-amber-500 via-yellow-600 to-stone-900",
        "tagline": "Sovereign Gold & Absolute Power",
        "themeName": "Aureum Sovereign",
        "description": "A rich blend of deep gold and obsidian stone representing absolute financial sovereignty."
      }
    `;

    try {
      const responseText = await callGemini(prompt);
      // Clean up potential markdown formatting in response
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result: GeminiDesignRecommendation = JSON.parse(cleanJson);
      setDesignRecommendation(result);
    } catch (err: any) {
      console.error('Gemini Customization Error:', err);
      setGeminiError('Failed to generate design with Gemini. Using high-end fallback.');
      // Fallback
      setDesignRecommendation({
        gradient: 'from-amber-600 via-yellow-500 to-stone-900',
        tagline: 'Sovereign Gold & Absolute Power',
        themeName: 'Aureum Sovereign (Fallback)',
        description: 'A rich blend of deep gold and obsidian stone representing absolute financial sovereignty.'
      });
    } finally {
      setGeminiLoading(false);
    }
  };

  // --- GEMINI POWERED SPENDING LIMIT RECOMMENDATIONS ---
  const handleGeminiLimitRecommendation = async () => {
    setGeminiLoading(true);
    setGeminiError(null);

    const prompt = `
      You are a Visa Risk Management AI. Analyze the following card parameters and recommend optimal daily and monthly spending limits, along with 3 custom fraud prevention rules.
      Cardholder: ${newCardholder}
      Card Type: Visa ${newCardType}
      Currency: ${newCurrency}
      Target Daily Limit: ${newDailyLimit}
      Target Monthly Limit: ${newMonthlyLimit}
      Allowed Categories: ${selectedCategories.join(', ')}
      
      Respond ONLY with a valid JSON object matching this structure:
      {
        "recommendedDailyLimit": 12000,
        "recommendedMonthlyLimit": 60000,
        "reasoning": "Based on the Visa Infinite tier and high-value software/travel categories, we recommend a slightly higher daily buffer to prevent transaction declines during peak travel seasons.",
        "suggestedRules": [
          "Decline transactions exceeding $5,000 from non-PCI compliant merchants.",
          "Enforce multi-factor authentication for all international software purchases.",
          "Auto-freeze card if more than 3 high-value transactions occur within 60 seconds."
        ]
      }
    `;

    try {
      const responseText = await callGemini(prompt);
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result: GeminiLimitRecommendation = JSON.parse(cleanJson);
      setLimitRecommendation(result);
    } catch (err: any) {
      console.error('Gemini Limit Recommendation Error:', err);
      setGeminiError('Failed to generate limit recommendations with Gemini. Using standard risk parameters.');
      setLimitRecommendation({
        recommendedDailyLimit: newDailyLimit,
        recommendedMonthlyLimit: newMonthlyLimit,
        reasoning: 'Standard risk parameters applied. No anomalies detected in target limits.',
        suggestedRules: [
          'Decline transactions exceeding daily limit.',
          'Enforce dynamic CVV verification for all online transactions.',
          'Restrict international transactions to pre-approved corridors.'
        ]
      });
    } finally {
      setGeminiLoading(false);
    }
  };

  // --- ISSUE NEW VISA CARD ---
  const handleIssueCard = (e: React.FormEvent) => {
    e.preventDefault();

    const finalGradient = designRecommendation?.gradient || 'from-slate-900 via-zinc-800 to-slate-950';
    const finalTagline = designRecommendation?.tagline || 'Sovereign Financial Instrument';
    const finalThemeName = designRecommendation?.themeName || 'Standard Obsidian';

    const newCard: VisaCard = {
      id: `v-card-${Date.now()}`,
      pan: generateVisaPan(),
      panReferenceId: generatePRID(),
      cardholderName: newCardholder.toUpperCase(),
      expiryMonth: String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'),
      expiryYear: String(new Date().getFullYear() + 5),
      cvv2: String(Math.floor(Math.random() * 900) + 100),
      icvv: String(Math.floor(Math.random() * 900) + 100),
      dcvv2: String(Math.floor(Math.random() * 900) + 100),
      cardType: newCardType,
      status: 'Active',
      spendingLimitDaily: limitRecommendation?.recommendedDailyLimit || newDailyLimit,
      spendingLimitMonthly: limitRecommendation?.recommendedMonthlyLimit || newMonthlyLimit,
      spentDaily: 0,
      spentMonthly: 0,
      currency: newCurrency,
      allowedCategories: selectedCategories,
      tokenizedDevices: [],
      design: {
        gradient: finalGradient,
        tagline: finalTagline,
        themeName: finalThemeName
      }
    };

    setCards(prev => [...prev, newCard]);
    setSelectedCardId(newCard.id);
    setActiveTab('my-cards');
    
    // Reset recommendations
    setDesignRecommendation(null);
    setLimitRecommendation(null);
  };

  // --- UPDATE CARD LIMITS ---
  const handleUpdateLimits = (daily: number, monthly: number) => {
    setCards(prev => prev.map(c => {
      if (c.id === selectedCard.id) {
        return {
          ...c,
          spendingLimitDaily: daily,
          spendingLimitMonthly: monthly
        };
      }
      return c;
    }));
  };

  // --- ANALYTICS DATA PREPARATION ---
  const limitUtilizationData = useMemo(() => {
    return cards.map(c => ({
      name: `${c.cardType} (*${c.pan.slice(-4)})`,
      Spent: c.spentMonthly,
      Remaining: Math.max(0, c.spendingLimitMonthly - c.spentMonthly),
    }));
  }, [cards]);

  const categoryDistributionData = [
    { name: 'Travel', value: 45, color: '#6366f1' },
    { name: 'Dining', value: 15, color: '#ec4899' },
    { name: 'Software', value: 25, color: '#10b981' },
    { name: 'Hardware', value: 10, color: '#f59e0b' },
    { name: 'Services', value: 5, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Visa Developer Platform & Gemini AI
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Visa Commercial Card Services
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time dynamic CVV/iCVV generation, PAN reference identifiers, and Gemini-powered card customization.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('my-cards')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'my-cards' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            My Cards
          </button>
          <button
            onClick={() => setActiveTab('issue-card')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'issue-card' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Issue Card
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Card Selector & Physical Card Preview */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card Selector (Only visible on My Cards tab) */}
          {activeTab === 'my-cards' && (
            <Card className="bg-slate-900 border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Select Active Card</h3>
              <div className="flex flex-col gap-2">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      selectedCard.id === card.id 
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded bg-gradient-to-br ${card.design.gradient} flex items-center justify-center text-[8px] font-bold text-white tracking-widest relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-white/10 rounded-full transform translate-x-1 -translate-y-1" />
                        VISA
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-slate-200">{card.cardholderName}</div>
                        <div className="text-[10px] text-slate-400">Visa {card.cardType} •••• {card.pan.slice(-4)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        card.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* PHYSICAL CARD PREVIEW */}
          <div className="relative group perspective">
            <div className={`w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${selectedCard.design.gradient} p-6 text-white shadow-2xl shadow-indigo-950/50 flex flex-col justify-between relative overflow-hidden border border-white/10 transition-all duration-500 transform hover:rotate-y-12`}>
              
              {/* Holographic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              
              {/* Top Row: Card Type & Chip */}
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-widest text-white/80">VISA</span>
                  <span className="text-[10px] font-medium tracking-widest text-indigo-300 uppercase">{selectedCard.cardType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-1 flex items-center justify-center shadow-inner">
                    <Cpu className="w-6 h-6 text-amber-950" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-white/60 uppercase tracking-widest">Dynamic CVV</span>
                    <span className="text-xs font-mono font-bold bg-black/30 px-1.5 py-0.5 rounded border border-white/10 text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 animate-pulse" />
                      {selectedCard.dcvv2}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Row: PAN */}
              <div className="my-4 z-10">
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-mono tracking-widest font-semibold">
                    {formatPan(selectedCard.pan, !!showFullPan[selectedCard.id])}
                  </span>
                  <button 
                    onClick={() => togglePanVisibility(selectedCard.id)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {showFullPan[selectedCard.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bottom Row: Cardholder, Expiry, CVV2 */}
              <div className="flex justify-between items-end z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/60 uppercase tracking-wider">Cardholder</span>
                  <span className="text-sm font-medium tracking-wide">{selectedCard.cardholderName}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/60 uppercase tracking-wider">Expires</span>
                    <span className="text-xs font-mono font-medium">{selectedCard.expiryMonth}/{selectedCard.expiryYear.slice(-2)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/60 uppercase tracking-wider">CVV2</span>
                    <span className="text-xs font-mono font-medium">{selectedCard.cvv2}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/60 uppercase tracking-wider">iCVV</span>
                    <span className="text-xs font-mono font-medium text-indigo-300">{selectedCard.icvv}</span>
                  </div>
                </div>
              </div>

              {/* Decorative Tagline */}
              <div className="absolute bottom-2 left-6 right-6 flex justify-between items-center border-t border-white/5 pt-1">
                <span className="text-[8px] text-white/40 italic tracking-wider truncate max-w-[70%]">
                  "{selectedCard.design.tagline}"
                </span>
                <span className="text-[8px] text-white/40 font-mono">
                  {selectedCard.panReferenceId.slice(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic CVV Countdown Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Dynamic CVV2 (dCVV2) Active</div>
                <div className="text-[10px] text-slate-400">Rotates every 30 seconds to prevent card-not-present fraud.</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                {dcvvCountdown}s
              </div>
            </div>
          </div>

          {/* Tokenization & Connected Devices */}
          <Card className="bg-slate-900 border-slate-800 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-indigo-400" />
                Visa Token Service (VTS)
              </h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                Secure Tokenized
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Visa replaces your 16-digit PAN with a secure token (PRID) to protect your actual card details across devices.
            </p>
            <div className="space-y-2">
              {selectedCard.tokenizedDevices.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-2">No devices tokenized for this card.</div>
              ) : (
                selectedCard.tokenizedDevices.map((device, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-slate-300">{device.deviceName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">Token: •••• {device.tokenSuffix}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                        {device.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: Tab-specific Content */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* TAB 1: MY CARDS (Details, Limits, Controls) */}
          {activeTab === 'my-cards' && (
            <div className="flex flex-col gap-6">
              
              {/* Card Controls & Status */}
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Card Controls & Security
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Freeze/Unfreeze */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">Card Status</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {selectedCard.status === 'Active' ? 'Card is active and ready for use.' : 'Card is frozen. All transactions will be declined.'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCardFreeze(selectedCard.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                        selectedCard.status === 'Active' 
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {selectedCard.status === 'Active' ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Freeze Card
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          Unfreeze Card
                        </>
                      )}
                    </button>
                  </div>

                  {/* PAN Reference ID */}
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <div className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      PAN Reference ID (PRID)
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" title="Visa's unique identifier for tokenized transactions." />
                    </div>
                    <div className="text-xs font-mono text-indigo-400 mt-1.5 bg-indigo-950/20 p-2 rounded border border-indigo-900/30 break-all">
                      {selectedCard.panReferenceId}
                    </div>
                  </div>

                </div>
              </Card>

              {/* Spending Limits & Utilization */}
              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    Spending Limits & Controls
                  </h2>
                  <span className="text-xs text-slate-400">Currency: {selectedCard.currency}</span>
                </div>

                <div className="space-y-6">
                  {/* Daily Limit */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">Daily Limit Utilization</span>
                      <span className="text-slate-200 font-semibold">
                        ${selectedCard.spentDaily.toLocaleString()} / ${selectedCard.spendingLimitDaily.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(selectedCard.spentDaily / selectedCard.spendingLimitDaily) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Monthly Limit */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">Monthly Limit Utilization</span>
                      <span className="text-slate-200 font-semibold">
                        ${selectedCard.spentMonthly.toLocaleString()} / ${selectedCard.spendingLimitMonthly.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(selectedCard.spentMonthly / selectedCard.spendingLimitMonthly) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Allowed Categories */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Allowed Merchant Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.allowedCategories.map(cat => (
                        <span key={cat} className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-full border border-slate-700">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Limit Adjuster */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-slate-400 mb-1.5">Adjust Daily Limit</label>
                      <input 
                        type="number" 
                        defaultValue={selectedCard.spendingLimitDaily}
                        onBlur={(e) => handleUpdateLimits(Number(e.target.value), selectedCard.spendingLimitMonthly)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-slate-400 mb-1.5">Adjust Monthly Limit</label>
                      <input 
                        type="number" 
                        defaultValue={selectedCard.spendingLimitMonthly}
                        onBlur={(e) => handleUpdateLimits(selectedCard.spendingLimitDaily, Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                </div>
              </Card>

            </div>
          )}

          {/* TAB 2: ISSUE CARD (Form, Gemini Customization, Gemini Limits) */}
          {activeTab === 'issue-card' && (
            <Card className="bg-slate-900 border-slate-800 p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Issue New Visa Commercial Card
              </h2>

              <form onSubmit={handleIssueCard} className="space-y-6">
                
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Cardholder Name</label>
                    <input 
                      type="text" 
                      value={newCardholder}
                      onChange={(e) => setNewCardholder(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Card Tier</label>
                    <select 
                      value={newCardType}
                      onChange={(e) => setNewCardType(e.target.value as VisaCard['cardType'])}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Infinite">Visa Infinite (Premium)</option>
                      <option value="Signature">Visa Signature (Business)</option>
                      <option value="Platinum">Visa Platinum (Standard)</option>
                      <option value="Classic">Visa Classic (Basic)</option>
                    </select>
                  </div>
                </div>

                {/* Limits & Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Currency</label>
                    <select 
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Daily Limit</label>
                    <input 
                      type="number" 
                      value={newDailyLimit}
                      onChange={(e) => setNewDailyLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Monthly Limit</label>
                    <input 
                      type="number" 
                      value={newMonthlyLimit}
                      onChange={(e) => setNewMonthlyLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Allowed Categories */}
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Allowed Merchant Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {['Travel', 'Dining', 'Software', 'Hardware', 'Services', 'Entertainment'].map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => {
                            setSelectedCategories(prev => 
                              isSelected ? prev.filter(c => c !== cat) : [...prev, cat]
                            );
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-500 text-white' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GEMINI SECTION 1: Card Customization */}
                <div className="border-t border-slate-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Gemini Card Customizer
                    </h3>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                      AI Design Engine
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customizationPrompt}
                      onChange={(e) => setCustomizationPrompt(e.target.value)}
                      placeholder="Describe your card theme (e.g., Cyberpunk neon, minimalist gold, eco-green)"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleGeminiCustomize}
                      disabled={geminiLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      {geminiLoading ? 'Generating...' : 'Generate Design'}
                    </button>
                  </div>

                  {designRecommendation && (
                    <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80 flex gap-4 items-start">
                      <div className={`w-16 h-10 rounded bg-gradient-to-br ${designRecommendation.gradient} flex-shrink-0 border border-white/10`} />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Theme: {designRecommendation.themeName}</div>
                        <div className="text-[10px] text-indigo-400 font-medium mt-0.5">"{designRecommendation.tagline}"</div>
                        <p className="text-[10px] text-slate-400 mt-1">{designRecommendation.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* GEMINI SECTION 2: Spending Limit Recommendations */}
                <div className="border-t border-slate-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-400" />
                      Gemini Risk & Limit Advisor
                    </h3>
                    <button
                      type="button"
                      onClick={handleGeminiLimitRecommendation}
                      disabled={geminiLoading}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Get AI Recommendation
                    </button>
                  </div>

                  {limitRecommendation && (
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Recommended Daily Limit</span>
                          <span className="text-sm font-bold text-emerald-400">${limitRecommendation.recommendedDailyLimit.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Recommended Monthly Limit</span>
                          <span className="text-sm font-bold text-emerald-400">${limitRecommendation.recommendedMonthlyLimit.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">AI Reasoning</span>
                        <p className="text-[10px] text-slate-300 mt-0.5">{limitRecommendation.reasoning}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Suggested Fraud Prevention Rules</span>
                        <ul className="space-y-1">
                          {limitRecommendation.suggestedRules.map((rule, idx) => (
                            <li key={idx} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Issue Visa Card & Deploy to Network
                </button>

              </form>
            </Card>
          )}

          {/* TAB 3: ANALYTICS (Charts, Utilization, Fraud Metrics) */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-6">
              
              {/* Limit Utilization Chart */}
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Monthly Limit Utilization by Card
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={limitUtilizationData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Bar dataKey="Spent" stackId="a" fill="#6366f1" />
                      <Bar dataKey="Remaining" stackId="a" fill="#1e293b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Category Distribution & Fraud Prevention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Category Distribution */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">Merchant Category Distribution</h3>
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 ml-4">
                      {categoryDistributionData.map(entry => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[10px] text-slate-300 font-medium">{entry.name} ({entry.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Visa Advanced Authorization (VAA) Score */}
                <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Visa Advanced Auth (VAA)
                      </h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        Optimal
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Real-time risk scoring powered by VisaNet and Gemini AI. Your current portfolio risk score is exceptionally low.
                    </p>
                  </div>

                  <div className="my-4 flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Portfolio Risk Score</span>
                      <span className="text-2xl font-bold text-emerald-400">02 / 99</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Declined Transactions</span>
                      <span className="text-sm font-semibold text-slate-200">0.00%</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 italic">
                    *Scores closer to 99 indicate high probability of fraud.
                  </div>
                </Card>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}