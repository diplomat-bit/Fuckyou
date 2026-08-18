import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  Activity, 
  ArrowRight, 
  Info, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Globe, 
  Zap 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { callGemini } from '../services/geminiService';
import { DataContext } from '../context/DataContext';

interface VisaCard {
  id: string;
  cardNumber: string;
  cvv: string;
  expiry: string;
  cardholderName: string;
  tier: 'classic' | 'platinum' | 'infinite' | 'sovereign';
  collateralAsset: 'BTC' | 'ETH' | 'SOL' | 'USDC';
  collateralAmount: number;
  collateralValueUSD: number;
  spendingLimit: number;
  currentSpent: number;
  ltvRatio: number;
  status: 'active' | 'frozen' | 'liquidated';
  rewardsEarned: number;
  dateIssued: string;
}

const ASSET_PRICES = {
  BTC: 64250,
  ETH: 3450,
  SOL: 145,
  USDC: 1.00
};

const CARD_TIERS = {
  classic: {
    name: 'Sovereign Classic',
    maxLtv: 0.50,
    interestRate: 0.089,
    cashback: 0.015,
    minCollateral: 500,
    bgGradient: 'from-slate-800 to-slate-950 border-slate-700',
    textColor: 'text-slate-300',
    accentColor: 'bg-slate-600'
  },
  platinum: {
    name: 'Sovereign Platinum',
    maxLtv: 0.65,
    interestRate: 0.069,
    cashback: 0.025,
    minCollateral: 5000,
    bgGradient: 'from-blue-900 via-indigo-950 to-slate-950 border-indigo-500/30',
    textColor: 'text-indigo-200',
    accentColor: 'bg-indigo-500'
  },
  infinite: {
    name: 'Sovereign Infinite',
    maxLtv: 0.75,
    interestRate: 0.049,
    cashback: 0.04,
    minCollateral: 25000,
    bgGradient: 'from-amber-950 via-stone-900 to-black border-amber-500/30',
    textColor: 'text-amber-200',
    accentColor: 'bg-amber-500'
  },
  sovereign: {
    name: 'Sovereign Black',
    maxLtv: 0.85,
    interestRate: 0.029,
    cashback: 0.06,
    minCollateral: 100000,
    bgGradient: 'from-purple-950 via-zinc-900 to-black border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    textColor: 'text-purple-200',
    accentColor: 'bg-purple-500'
  }
};

export default function VisaCardIssuancePortal() {
  const dataContext = useContext(DataContext);
  
  // Form State
  const [cardholderName, setCardholderName] = useState('');
  const [selectedTier, setSelectedTier] = useState<'classic' | 'platinum' | 'infinite' | 'sovereign'>('classic');
  const [collateralAsset, setCollateralAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'USDC'>('BTC');
  const [collateralAmount, setCollateralAmount] = useState<number>(0.5);
  const [targetLtv, setTargetLtv] = useState<number>(0.4);
  const [spendingLimit, setSpendingLimit] = useState<number>(10000);
  
  // UI States
  const [isIssuing, setIsIssuing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  const [priceVolatilitySim, setPriceVolatilitySim] = useState<number>(0); // % drop in asset price
  
  // Gemini AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
    optimalLtv: number;
    liquidationPrice: number;
    advice: string;
    marketOutlook: string;
  } | null>(null);

  // Mock Issued Cards
  const [issuedCards, setIssuedCards] = useState<VisaCard[]>([
    {
      id: 'v-9821',
      cardNumber: '4111 5621 9082 4412',
      cvv: '882',
      expiry: '09/29',
      cardholderName: 'Sovereign Operator',
      tier: 'infinite',
      collateralAsset: 'BTC',
      collateralAmount: 1.2,
      collateralValueUSD: 77100,
      spendingLimit: 35000,
      currentSpent: 12450,
      ltvRatio: 0.45,
      status: 'active',
      rewardsEarned: 498.20,
      dateIssued: '2024-02-15'
    },
    {
      id: 'v-1042',
      cardNumber: '4111 8832 1094 5521',
      cvv: '104',
      expiry: '12/28',
      cardholderName: 'Sovereign Operator',
      tier: 'platinum',
      collateralAsset: 'ETH',
      collateralAmount: 15,
      collateralValueUSD: 51750,
      spendingLimit: 25000,
      currentSpent: 8900,
      ltvRatio: 0.52,
      status: 'active',
      rewardsEarned: 222.50,
      dateIssued: '2024-01-10'
    }
  ]);

  // Calculations
  const currentAssetPrice = useMemo(() => ASSET_PRICES[collateralAsset], [collateralAsset]);
  const simulatedAssetPrice = useMemo(() => {
    return currentAssetPrice * (1 - priceVolatilitySim / 100);
  }, [currentAssetPrice, priceVolatilitySim]);

  const collateralValueUSD = useMemo(() => {
    return collateralAmount * currentAssetPrice;
  }, [collateralAmount, currentAssetPrice]);

  const simulatedCollateralValueUSD = useMemo(() => {
    return collateralAmount * simulatedAssetPrice;
  }, [collateralAmount, simulatedAssetPrice]);

  const maxAllowedLimit = useMemo(() => {
    const tierConfig = CARD_TIERS[selectedTier];
    return collateralValueUSD * tierConfig.maxLtv;
  }, [collateralValueUSD, selectedTier]);

  const currentLtv = useMemo(() => {
    if (collateralValueUSD === 0) return 0;
    return spendingLimit / collateralValueUSD;
  }, [spendingLimit, collateralValueUSD]);

  const simulatedLtv = useMemo(() => {
    if (simulatedCollateralValueUSD === 0) return 0;
    return spendingLimit / simulatedCollateralValueUSD;
  }, [spendingLimit, simulatedCollateralValueUSD]);

  const liquidationPrice = useMemo(() => {
    if (collateralAmount === 0) return 0;
    const tierConfig = CARD_TIERS[selectedTier];
    // Liquidation occurs when LTV hits 90% of collateral value
    return (spendingLimit / 0.9) / collateralAmount;
  }, [spendingLimit, collateralAmount, selectedTier]);

  // Auto-adjust spending limit when collateral or LTV changes
  useEffect(() => {
    const calculatedLimit = Math.min(collateralValueUSD * targetLtv, maxAllowedLimit);
    setSpendingLimit(Math.round(calculatedLimit));
  }, [collateralValueUSD, targetLtv, maxAllowedLimit]);

  // Trigger Gemini AI Analysis on parameter changes
  const triggerAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `
        Analyze a crypto-backed Visa card issuance request:
        - Collateral Asset: ${collateralAsset}
        - Collateral Amount: ${collateralAmount} (${collateralAsset})
        - Current Asset Price: $${currentAssetPrice}
        - Total Collateral Value: $${collateralValueUSD}
        - Requested Spending Limit: $${spendingLimit}
        - Target LTV Ratio: ${(currentLtv * 100).toFixed(1)}%
        - Card Tier: ${CARD_TIERS[selectedTier].name}
        
        Provide a JSON response with:
        1. "riskScore": "Low", "Medium", "High", or "Critical" based on asset volatility and LTV.
        2. "optimalLtv": Suggested safe LTV ratio (0.1 to 0.85).
        3. "liquidationPrice": Asset price at which liquidation occurs.
        4. "advice": 2-3 sentences of actionable risk mitigation advice.
        5. "marketOutlook": Brief market sentiment for the selected asset.
        
        Respond ONLY with the raw JSON object. No markdown formatting.
      `;

      const responseText = await callGemini(prompt);
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setAiRecommendation(parsed);
    } catch (error) {
      console.error("Gemini analysis failed, using fallback calculations:", error);
      // Fallback
      const calculatedLiquidation = liquidationPrice;
      const risk = currentLtv > 0.7 ? 'High' : currentLtv > 0.5 ? 'Medium' : 'Low';
      setAiRecommendation({
        riskScore: risk as any,
        optimalLtv: Math.max(0.1, CARD_TIERS[selectedTier].maxLtv - 0.15),
        liquidationPrice: calculatedLiquidation,
        advice: `Maintain a buffer of at least 30% below your liquidation threshold. Consider locking USDC to stabilize your LTV ratio during high market volatility.`,
        marketOutlook: `The market for ${collateralAsset} is showing standard cyclical volatility. Monitor support levels closely.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (collateralAmount > 0) {
      const delayDebounce = setTimeout(() => {
        triggerAiAnalysis();
      }, 1000);
      return () => clearTimeout(delayDebounce);
    }
  }, [collateralAsset, collateralAmount, selectedTier, spendingLimit]);

  // Handle Card Issuance
  const handleIssueCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholderName) return;
    
    setIsIssuing(true);
    
    setTimeout(() => {
      const newCard: VisaCard = {
        id: `v-${Math.floor(1000 + Math.random() * 9000)}`,
        cardNumber: `4111 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        expiry: '05/29',
        cardholderName,
        tier: selectedTier,
        collateralAsset,
        collateralAmount,
        collateralValueUSD,
        spendingLimit,
        currentSpent: 0,
        ltvRatio: currentLtv,
        status: 'active',
        rewardsEarned: 0,
        dateIssued: new Date().toISOString().split('T')[0]
      };

      setIssuedCards([newCard, ...issuedCards]);
      setIsIssuing(false);
      setShowSuccess(true);
      
      // Reset form
      setCardholderName('');
    }, 2000);
  };

  const handleFreezeCard = (id: string) => {
    setIssuedCards(issuedCards.map(card => {
      if (card.id === id) {
        return { ...card, status: card.status === 'active' ? 'frozen' : 'active' };
      }
      return card;
    }));
  };

  const handleReleaseCollateral = (id: string) => {
    setIssuedCards(issuedCards.filter(card => card.id !== id));
  };

  // Volatility Simulation Data
  const chartData = useMemo(() => {
    const points = [];
    const basePrice = currentAssetPrice;
    for (let i = 0; i <= 50; i += 5) {
      const price = basePrice * (1 - i / 100);
      const value = collateralAmount * price;
      const ltv = value > 0 ? (spendingLimit / value) * 100 : 0;
      points.push({
        drop: `${i}%`,
        price: Math.round(price),
        ltv: Math.round(ltv),
        threshold: 90 // Liquidation threshold at 90% LTV
      });
    }
    return points;
  }, [currentAssetPrice, collateralAmount, spendingLimit]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 animate-pulse" />
            Sovereign Financial Infrastructure
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Visa® Crypto Card Issuance
          </h1>
          <p className="text-slate-400 mt-1">
            Lock decentralized collateral, mint instant credit lines, and spend globally with Visa integration.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs text-slate-400">Visa Network Status</div>
            <div className="text-sm font-semibold text-emerald-400">Operational • 100% Sync</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Issuance Form & Visualizer */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Card Visualizer */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[320px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_50%)]" />
            
            {/* Interactive Card */}
            <div className={`w-full max-w-[420px] aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between shadow-2xl border relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${CARD_TIERS[selectedTier].bgGradient}`}>
              {/* Card Gloss Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
              
              {/* Top Row */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Sovereign Card</div>
                  <div className="text-sm font-bold tracking-wide text-white mt-0.5">
                    {CARD_TIERS[selectedTier].name}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs font-mono font-bold text-purple-400 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded">
                    {(CARD_TIERS[selectedTier].cashback * 100).toFixed(1)}% Back
                  </div>
                </div>
              </div>

              {/* Chip & Contactless */}
              <div className="flex justify-between items-center z-10">
                <div className="w-12 h-9 bg-gradient-to-r from-amber-400 to-amber-200 rounded-md relative overflow-hidden opacity-85">
                  <div className="absolute inset-0 grid grid-cols-3 gap-1 p-1 opacity-30">
                    <div className="border border-black rounded-sm" />
                    <div className="border border-black rounded-sm" />
                    <div className="border border-black rounded-sm" />
                  </div>
                </div>
                <svg className="w-8 h-8 text-slate-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              {/* Card Number & Expiry */}
              <div className="space-y-2 z-10">
                <div className="text-lg md:text-xl font-mono tracking-widest text-white font-medium">
                  4111 •••• •••• {Math.floor(1000 + Math.random() * 9000)}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400">Cardholder</div>
                    <div className="text-xs font-mono text-slate-200 uppercase tracking-wide truncate max-w-[180px]">
                      {cardholderName || 'Sovereign Operator'}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-400">Expiry</div>
                      <div className="text-xs font-mono text-slate-200">05/29</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-400">CVV</div>
                      <div className="text-xs font-mono text-slate-200">•••</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visa Logo */}
              <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end">
                <span className="text-xl font-black italic text-white tracking-tight">
                  VISA
                </span>
                <span className="text-[6px] uppercase tracking-widest text-slate-400 font-bold">
                  DEBIT
                </span>
              </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[420px] mt-6 pt-6 border-t border-slate-800/60">
              <div className="text-center">
                <div className="text-xs text-slate-400">Collateral Value</div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  ${collateralValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-center border-x border-slate-800/60">
                <div className="text-xs text-slate-400">Spending Limit</div>
                <div className="text-sm font-semibold text-purple-400 mt-0.5">
                  ${spendingLimit.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">LTV Ratio</div>
                <div className={`text-sm font-semibold mt-0.5 ${currentLtv > 0.7 ? 'text-rose-400' : currentLtv > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {(currentLtv * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Issuance Form */}
          <form onSubmit={handleIssueCard} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sliders className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Configure Card Parameters</h2>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Cardholder Name</label>
              <input 
                type="text"
                required
                placeholder="Enter legal name for Visa network"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Tier Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Card Tier</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(CARD_TIERS) as Array<keyof typeof CARD_TIERS>).map((tierKey) => {
                  const tier = CARD_TIERS[tierKey];
                  const isSelected = selectedTier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setSelectedTier(tierKey)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                        isSelected 
                          ? 'bg-slate-900 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block truncate">{tier.name}</span>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Max LTV: {tier.maxLtv * 100}%</span>
                        <span className="text-[10px] text-purple-400 block font-semibold">{(tier.cashback * 100).toFixed(1)}% Cashback</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collateral Asset & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Collateral Asset</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(ASSET_PRICES) as Array<keyof typeof ASSET_PRICES>).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => setCollateralAsset(asset)}
                      className={`py-2.5 rounded-xl border font-semibold text-xs transition-all ${
                        collateralAsset === asset 
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Collateral Amount</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="any"
                    min="0.0001"
                    required
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-16 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {collateralAsset}
                  </span>
                </div>
              </div>
            </div>

            {/* LTV Slider */}
            <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target LTV Ratio</span>
                <span className="text-sm font-mono font-bold text-purple-400">{(targetLtv * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range"
                min="0.1"
                max={CARD_TIERS[selectedTier].maxLtv}
                step="0.05"
                value={targetLtv}
                onChange={(e) => setTargetLtv(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Conservative (10%)</span>
                <span>Max Allowed ({(CARD_TIERS[selectedTier].maxLtv * 100).toFixed(0)}%)</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isIssuing || collateralAmount <= 0 || !cardholderName}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
            >
              {isIssuing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Securing Collateral & Minting Visa Card...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Lock Collateral & Issue Visa Card
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Gemini AI Risk Analysis & Active Cards */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Gemini AI Risk Advisor */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Gemini AI Risk Advisor</h2>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Real-Time
              </span>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-slate-400">Gemini is analyzing collateral volatility...</p>
              </div>
            ) : aiRecommendation ? (
              <div className="space-y-4">
                {/* Risk Score Badge */}
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Collateral Risk Profile</span>
                    <span className={`text-lg font-bold ${
                      aiRecommendation.riskScore === 'Low' ? 'text-emerald-400' :
                      aiRecommendation.riskScore === 'Medium' ? 'text-amber-400' :
                      aiRecommendation.riskScore === 'High' ? 'text-rose-400' : 'text-red-500 animate-pulse'
                    }`}>
                      {aiRecommendation.riskScore} Risk
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Optimal LTV</span>
                    <span className="text-lg font-mono font-bold text-purple-400">
                      {(aiRecommendation.optimalLtv * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Advice Text */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">AI Recommendation</span>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                    {aiRecommendation.advice}
                  </p>
                </div>

                {/* Liquidation Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Liquidation Price</span>
                    <span className="text-sm font-mono font-bold text-rose-400">
                      ${aiRecommendation.liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Market Outlook</span>
                    <span className="text-sm font-semibold text-slate-300 truncate block">
                      {aiRecommendation.marketOutlook}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Enter collateral parameters to generate AI risk analysis.
              </div>
            )}
          </div>

          {/* Volatility Stress Tester */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Volatility Stress Tester</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Simulate Market Drop</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Simulated Price Drop</span>
                <span className="text-sm font-mono font-bold text-rose-400">-{priceVolatilitySim}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="50"
                step="5"
                value={priceVolatilitySim}
                onChange={(e) => setPriceVolatilitySim(parseInt(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />

              {/* Stress Test Results */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Simulated Asset Price</span>
                  <span className="text-sm font-mono font-bold text-white">
                    ${simulatedAssetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Simulated LTV</span>
                  <span className={`text-sm font-mono font-bold ${simulatedLtv > 0.9 ? 'text-red-500 animate-pulse' : simulatedLtv > 0.7 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(simulatedLtv * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {simulatedLtv >= 0.9 && (
                <div className="flex items-start gap-2.5 bg-red-950/30 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Liquidation Warning!</span>
                    At a {priceVolatilitySim}% drop, your LTV exceeds the 90% liquidation threshold. Collateral will be automatically liquidated to cover the balance.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Active Cards Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Active Sovereign Visa Cards</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{issuedCards.length} Cards Issued</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issuedCards.map((card) => (
            <div 
              key={card.id}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${CARD_TIERS[card.tier].bgGradient}`}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{CARD_TIERS[card.tier].name}</span>
                    <span className="text-xs text-slate-400 font-mono">ID: {card.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    card.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {card.status}
                  </span>
                  <button 
                    onClick={() => handleFreezeCard(card.id)}
                    className="text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {card.status === 'active' ? 'Freeze' : 'Unfreeze'}
                  </button>
                </div>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Locked Collateral</span>
                  <span className="text-sm font-semibold text-white">
                    {card.collateralAmount} {card.collateralAsset}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    (${card.collateralValueUSD.toLocaleString()})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Spending Limit</span>
                  <span className="text-sm font-semibold text-purple-400">
                    ${card.spendingLimit.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Spent: ${card.currentSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* LTV Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current LTV</span>
                  <span className="font-mono font-semibold text-white">{(card.ltvRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      card.ltvRatio > 0.7 ? 'bg-rose-500' : card.ltvRatio > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, card.ltvRatio * 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-900 text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  ${card.rewardsEarned.toFixed(2)} Rewards Earned
                </div>
                <button 
                  onClick={() => handleReleaseCollateral(card.id)}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Release Collateral
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}