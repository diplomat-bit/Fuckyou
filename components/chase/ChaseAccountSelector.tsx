import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowUpRight,
  Flame,
  Award,
  Layers,
  Fingerprint,
  RefreshCw,
  Info,
  Building2
} from 'lucide-react';

export type MerchantDefinedProductCode =
  | 'SAPPHIRE_RESERVE'
  | 'JPM_RESERVE'
  | 'SAPPHIRE_PREFERRED'
  | 'SAPPHIRE_NO_FEE'
  | 'INK_BUSINESS_PREFERRED'
  | 'INK_PLUS'
  | 'INK_BUSINESS_CASH'
  | 'INK_CASH'
  | 'INK_BUSINESS_UNLIMITED'
  | 'FREEDOM_UNLIMITED'
  | 'FREEDOM'
  | 'FREEDOM_STUDENT'
  | 'SLATE';

export type EnrollmentStatusName =
  | 'AUTOENROLLED'
  | 'ENROLLED'
  | 'UN-ENROLLED'
  | 'OPTED_OUT'
  | 'OPTED_IN'
  | 'NOT_ENROLLED';

export interface ChaseAccountData {
  accountReferenceUuid: string;
  externalAccountIdentifier: string;
  productCode: MerchantDefinedProductCode;
  cardName: string;
  cardholderName: string;
  lastFour: string;
  expirationDate: string;
  network: 'VISA_INFINITE' | 'VISA_SIGNATURE' | 'MASTERCARD_WORLD_ELITE' | 'VISA_COMMERCIAL';
  rewardBalance: number;
  pointsProgramName: string;
  pointsMultiplier: number;
  creditLimit: number;
  availableCredit: number;
  enrollmentStatus: EnrollmentStatusName;
  enrollmentStatusDate: string;
  isEligibleForPWP: boolean;
  tierRank: 'ULTRA_LUXURY' | 'PREMIUM' | 'COMMERCIAL' | 'CONSUMER';
  cardTheme: {
    bgGradient: string;
    accentGlow: string;
    metalReflection: string;
    textColor: string;
    borderHighlight: string;
  };
}

export interface ChaseAccountSelectorProps {
  accounts?: ChaseAccountData[];
  selectedAccountId?: string;
  onSelectAccount?: (account: ChaseAccountData) => void;
  onToggleEnrollment?: (account: ChaseAccountData, targetStatus: EnrollmentStatusName) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_ACCOUNTS: ChaseAccountData[] = [
  {
    accountReferenceUuid: 'e7c10b42-7bf9-4fa2-9388-1d279435b801',
    externalAccountIdentifier: 'EXT-CHASE-0098412-JPM',
    productCode: 'JPM_RESERVE',
    cardName: 'J.P. Morgan Reserve',
    cardholderName: 'JAMIE DIMON',
    lastFour: '0001',
    expirationDate: '12/29',
    network: 'VISA_INFINITE',
    rewardBalance: 4825900,
    pointsProgramName: 'J.P. Morgan Ultimate Rewards®',
    pointsMultiplier: 1.5,
    creditLimit: 500000,
    availableCredit: 489240,
    enrollmentStatus: 'ENROLLED',
    enrollmentStatusDate: '2024-01-15',
    isEligibleForPWP: true,
    tierRank: 'ULTRA_LUXURY',
    cardTheme: {
      bgGradient: 'radial-gradient(ellipse at 30% 20%, #2a2c33 0%, #15171c 45%, #08090b 100%)',
      accentGlow: 'rgba(212, 175, 55, 0.45)',
      metalReflection: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(212,175,55,0.2) 60%, transparent 100%)',
      textColor: '#e8e9ec',
      borderHighlight: 'rgba(212, 175, 55, 0.5)'
    }
  },
  {
    accountReferenceUuid: 'a3811cb9-31e4-44b2-bcf8-8f8319fbc7a9',
    externalAccountIdentifier: 'EXT-CHASE-8874120-CSR',
    productCode: 'SAPPHIRE_RESERVE',
    cardName: 'Chase Sapphire Reserve®',
    cardholderName: 'JAMIE DIMON',
    lastFour: '7024',
    expirationDate: '08/28',
    network: 'VISA_INFINITE',
    rewardBalance: 1254300,
    pointsProgramName: 'Chase Ultimate Rewards®',
    pointsMultiplier: 1.5,
    creditLimit: 120000,
    availableCredit: 114820,
    enrollmentStatus: 'ENROLLED',
    enrollmentStatusDate: '2023-11-20',
    isEligibleForPWP: true,
    tierRank: 'PREMIUM',
    cardTheme: {
      bgGradient: 'linear-gradient(135deg, #0b1a30 0%, #030811 50%, #00122e 100%)',
      accentGlow: 'rgba(56, 132, 255, 0.4)',
      metalReflection: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(79, 172, 254, 0.25) 100%)',
      textColor: '#f0f6ff',
      borderHighlight: 'rgba(59, 130, 246, 0.5)'
    }
  },
  {
    accountReferenceUuid: 'f49a24e1-294b-4867-b50a-3ccbe9987dc3',
    externalAccountIdentifier: 'EXT-CHASE-4412093-INK',
    productCode: 'INK_BUSINESS_PREFERRED',
    cardName: 'Ink Business Preferred®',
    cardholderName: 'JPMORGAN CHASE & CO.',
    lastFour: '9182',
    expirationDate: '04/27',
    network: 'VISA_COMMERCIAL',
    rewardBalance: 875200,
    pointsProgramName: 'Ink Business Rewards®',
    pointsMultiplier: 1.25,
    creditLimit: 250000,
    availableCredit: 218900,
    enrollmentStatus: 'AUTOENROLLED',
    enrollmentStatusDate: '2024-02-01',
    isEligibleForPWP: true,
    tierRank: 'COMMERCIAL',
    cardTheme: {
      bgGradient: 'linear-gradient(145deg, #1e2530 0%, #0f131a 60%, #161c24 100%)',
      accentGlow: 'rgba(148, 163, 184, 0.3)',
      metalReflection: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, transparent 45%, rgba(203, 213, 225, 0.15) 100%)',
      textColor: '#f8fafc',
      borderHighlight: 'rgba(148, 163, 184, 0.4)'
    }
  },
  {
    accountReferenceUuid: '5c010d19-90bc-4328-98e3-bbef0012fce4',
    externalAccountIdentifier: 'EXT-CHASE-1194821-CFU',
    productCode: 'FREEDOM_UNLIMITED',
    cardName: 'Chase Freedom Unlimited®',
    cardholderName: 'JAMIE DIMON',
    lastFour: '3819',
    expirationDate: '10/26',
    network: 'VISA_SIGNATURE',
    rewardBalance: 342100,
    pointsProgramName: 'Chase Freedom Cashback®',
    pointsMultiplier: 1.0,
    creditLimit: 45000,
    availableCredit: 42100,
    enrollmentStatus: 'NOT_ENROLLED',
    enrollmentStatusDate: '2023-09-10',
    isEligibleForPWP: true,
    tierRank: 'CONSUMER',
    cardTheme: {
      bgGradient: 'linear-gradient(135deg, #10376d 0%, #0a1e3f 50%, #051024 100%)',
      accentGlow: 'rgba(0, 164, 228, 0.35)',
      metalReflection: 'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, transparent 60%, rgba(0, 210, 255, 0.2) 100%)',
      textColor: '#ffffff',
      borderHighlight: 'rgba(0, 164, 228, 0.5)'
    }
  }
];

export const ChaseAccountSelector: React.FC<ChaseAccountSelectorProps> = ({
  accounts = DEFAULT_ACCOUNTS,
  selectedAccountId,
  onSelectAccount,
  onToggleEnrollment,
  isLoading = false,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    if (!selectedAccountId) return 0;
    const idx = accounts.findIndex(a => a.accountReferenceUuid === selectedAccountId);
    return idx >= 0 ? idx : 0;
  });

  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showFullUuid, setShowFullUuid] = useState<boolean>(false);
  const [copiedUuid, setCopiedUuid] = useState<boolean>(false);
  const [rotations, setRotations] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const activeAccount = useMemo(() => accounts[activeIndex] || accounts[0], [accounts, activeIndex]);

  const handleSelectCard = (index: number) => {
    setActiveIndex(index);
    setIsFlipped(false);
    if (onSelectAccount && accounts[index]) {
      onSelectAccount(accounts[index]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 10;
    const rotateY = (x / (rect.width / 2)) * 12;
    setRotations({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotations({ x: 0, y: 0 });
  };

  const handleCopyUuid = useCallback((uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  }, []);

  const formatPointsAsUsd = (points: number, multiplier: number) => {
    const cashVal = (points / 100) * multiplier;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(cashVal);
  };

  const getStatusBadge = (status: EnrollmentStatusName) => {
    switch (status) {
      case 'ENROLLED':
      case 'OPTED_IN':
        return {
          label: 'Enrolled in Pay with Points',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case 'AUTOENROLLED':
        return {
          label: 'Auto-Enrolled (Active)',
          color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          dot: 'bg-cyan-400 animate-pulse',
          icon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'UN-ENROLLED':
      case 'OPTED_OUT':
        return {
          label: 'Un-Enrolled',
          color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      case 'NOT_ENROLLED':
      default:
        return {
          label: 'Eligible for Enrollment',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: <Zap className="w-3.5 h-3.5" />
        };
    }
  };

  const activeStatus = getStatusBadge(activeAccount.enrollmentStatus);

  return (
    <div className={`w-full max-w-6xl mx-auto rounded-3xl bg-[#090d16] text-white border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden ${className}`}>
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-900 flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-400/30">
            {/* Chase Geometric Octagon SVG */}
            <svg viewBox="0 0 100 100" className="w-6 h-6 fill-white">
              <path d="M 50 0 L 72 0 L 85 28 L 72 50 L 50 50 L 50 35 L 60 35 L 66 22 L 50 0 Z" />
              <path d="M 100 50 L 100 72 L 72 85 L 50 72 L 50 50 L 65 50 L 65 60 L 78 66 L 100 50 Z" />
              <path d="M 50 100 L 28 100 L 15 72 L 28 50 L 50 50 L 50 65 L 40 65 L 34 78 L 50 100 Z" />
              <path d="M 0 50 L 0 28 L 28 15 L 50 28 L 50 50 L 35 50 L 35 40 L 22 34 L 0 50 Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Chase Pay With Points™ Portfolio</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Tier 1 API
              </span>
            </div>
            <p className="text-xs text-slate-400">Cardholder Loyalty & Account Reference Manager</p>
          </div>
        </div>

        {/* Global Stats Summary */}
        <div className="flex items-center space-x-4 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800/80">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Total UR® Points</span>
            <span className="text-sm font-extrabold text-amber-300">
              {accounts.reduce((acc, curr) => acc + curr.rewardBalance, 0).toLocaleString()} pts
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">PWP Liquidity</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {formatPointsAsUsd(
                accounts.reduce((acc, curr) => acc + curr.rewardBalance, 0),
                1.35
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Card Viewer + Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 relative z-10">
        
        {/* Left Column: 3D Luxury Card Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between">
          {/* Card Carousel Navigation */}
          <div className="w-full flex items-center justify-between px-2 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400">Card {activeIndex + 1} of {accounts.length}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeAccount.productCode}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSelectCard((activeIndex - 1 + accounts.length) % accounts.length)}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSelectCard((activeIndex + 1) % accounts.length)}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
                aria-label="Next card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Card Canvas */}
          <div
            className="w-full max-w-[430px] h-[265px] perspective-1000 cursor-pointer select-none my-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              ref={cardRef}
              style={{
                transform: `rotateX(${rotations.x}deg) rotateY(${rotations.y + (isFlipped ? 180 : 0)}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.15s ease-out'
              }}
              className="w-full h-full relative rounded-2xl shadow-2xl transition-shadow duration-300"
            >
              {/* CARD FRONT */}
              <div
                style={{
                  background: activeAccount.cardTheme.bgGradient,
                  backfaceVisibility: 'hidden',
                  borderColor: activeAccount.cardTheme.borderHighlight
                }}
                className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between border shadow-2xl overflow-hidden"
              >
                {/* Holographic Sheen Layer */}
                <div
                  style={{ background: activeAccount.cardTheme.metalReflection }}
                  className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                />

                {/* Top Row: Chase Logo + Contactless NFC + Chip */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 100 100" className="w-6 h-6 fill-white opacity-90">
                      <path d="M 50 0 L 72 0 L 85 28 L 72 50 L 50 50 L 50 35 L 60 35 L 66 22 L 50 0 Z" />
                      <path d="M 100 50 L 100 72 L 72 85 L 50 72 L 50 50 L 65 50 L 65 60 L 78 66 L 100 50 Z" />
                      <path d="M 50 100 L 28 100 L 15 72 L 28 50 L 50 50 L 50 65 L 40 65 L 34 78 L 50 100 Z" />
                      <path d="M 0 50 L 0 28 L 28 15 L 50 28 L 50 50 L 35 50 L 35 40 L 22 34 L 0 50 Z" />
                    </svg>
                    <span className="font-serif tracking-widest text-sm font-semibold uppercase text-slate-200">
                      CHASE
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Contactless Wave Icon */}
                    <svg className="w-5 h-5 text-slate-300 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                    </svg>
                    <span className="text-[10px] tracking-widest font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-white/90">
                      {activeAccount.tierRank.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Middle: EMV Microchip */}
                <div className="flex items-center justify-between z-10 my-1">
                  <div className="w-11 h-9 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-100 to-amber-400 p-[2px] shadow-md relative overflow-hidden border border-yellow-600/40">
                    <div className="w-full h-full rounded-[3px] border border-amber-700/30 flex flex-col justify-between p-1 bg-amber-200/20">
                      <div className="w-full h-[1px] bg-amber-900/30" />
                      <div className="w-full h-[1px] bg-amber-900/30" />
                      <div className="w-full h-[1px] bg-amber-900/30" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Card Product</p>
                    <p className="text-xs font-semibold text-slate-100">{activeAccount.cardName}</p>
                  </div>
                </div>

                {/* Bottom Row: Numbers, Cardholder, Network Badge */}
                <div className="z-10 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-sm tracking-[0.25em] text-slate-200 drop-shadow-md">
                      •••• •••• •••• {activeAccount.lastFour}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-400">Cardholder</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-100">
                          {activeAccount.cardholderName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-400">Expires</div>
                        <div className="text-xs font-mono text-slate-100">{activeAccount.expirationDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Network Logo */}
                  <div className="text-right">
                    {activeAccount.network.startsWith('VISA') ? (
                      <span className="font-black italic text-lg tracking-wider text-white drop-shadow">
                        VISA <span className="text-[9px] not-italic font-normal tracking-tight block uppercase opacity-80">Infinite</span>
                      </span>
                    ) : (
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-red-600/90" />
                        <div className="w-6 h-6 rounded-full bg-amber-500/90 mix-blend-screen" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div
                style={{
                  background: activeAccount.cardTheme.bgGradient,
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  borderColor: activeAccount.cardTheme.borderHighlight
                }}
                className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between border shadow-2xl overflow-hidden"
              >
                {/* Magnetic Stripe */}
                <div className="absolute top-6 left-0 right-0 h-10 bg-black/90 shadow-inner" />

                <div className="mt-12">
                  <div className="bg-slate-200/90 rounded px-3 py-1 flex items-center justify-between text-slate-900">
                    <span className="text-[9px] font-mono tracking-wider italic text-slate-600">Authorized Signature</span>
                    <span className="font-mono text-xs font-bold tracking-widest">CVV: •••</span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-2 leading-relaxed">
                    This card is property of JPMorgan Chase Bank, N.A. Member FDIC. Use of this card is subject to the Cardmember Agreement and Reward Program Terms.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono text-slate-300">
                  <span>UUID: {activeAccount.accountReferenceUuid.substring(0, 13)}...</span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>256-Bit Tokenized</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Indicator Sub-bar */}
          <div className="w-full flex items-center justify-between mt-4 px-2">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Click card to inspect rear authentication & CVV zone</span>
            </span>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isFlipped ? 'Show Front' : 'Flip Card'}
            </button>
          </div>

          {/* Account Mini Slider Dots */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {accounts.map((acc, i) => (
              <button
                key={acc.accountReferenceUuid}
                onClick={() => handleSelectCard(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Select account ${acc.cardName}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Reward Balances, PWP Engine Status, API Parameters */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          
          {/* Card Title & Enrollment Badge */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                  Active Card Reference
                </span>
                <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <span>{activeAccount.cardName}</span>
                </h3>
              </div>

              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${activeStatus.color}`}>
                <span className={`w-2 h-2 rounded-full ${activeStatus.dot}`} />
                <span>{activeStatus.label}</span>
              </div>
            </div>

            {/* Account Identifiers (CLPWPE Swagger Specifics) */}
            <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">account-reference-universal-unique-identifier:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-300 font-bold">
                    {showFullUuid
                      ? activeAccount.accountReferenceUuid
                      : `${activeAccount.accountReferenceUuid.substring(0, 18)}...`}
                  </span>
                  <button
                    onClick={() => setShowFullUuid(!showFullUuid)}
                    className="text-slate-400 hover:text-white"
                    title="Toggle full UUID"
                  >
                    {showFullUuid ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopyUuid(activeAccount.accountReferenceUuid)}
                    className="text-slate-400 hover:text-white"
                    title="Copy UUID"
                  >
                    {copiedUuid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">external-account-identifier:</span>
                <span className="text-slate-200 font-semibold">{activeAccount.externalAccountIdentifier}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">merchantDefinedProductCode:</span>
                <span className="text-amber-400 font-semibold">{activeAccount.productCode}</span>
              </div>
            </div>
          </div>

          {/* Reward Multipliers & Pay With Points Valuation Matrix */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">Ultimate Rewards®</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {activeAccount.rewardBalance.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium flex items-center space-x-1 mt-1">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Rate Multiplier: {activeAccount.pointsMultiplier.toFixed(2)}x</span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase">PWP Purchasing Power</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {formatPointsAsUsd(activeAccount.rewardBalance, activeAccount.pointsMultiplier)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Available instantaneously at partner checkout
              </div>
            </div>
          </div>

          {/* Credit Limit & Availability Bar */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Revolving Line Available</span>
              <span className="text-slate-200 font-bold font-mono">
                ${activeAccount.availableCredit.toLocaleString()} / ${activeAccount.creditLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{
                  width: `${(activeAccount.availableCredit / activeAccount.creditLimit) * 100}%`
                }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Action Dispatcher (Enroll / Unenroll Trigger) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {activeAccount.enrollmentStatus === 'ENROLLED' || activeAccount.enrollmentStatus === 'AUTOENROLLED' ? (
              <button
                disabled={isLoading}
                onClick={() => onToggleEnrollment && onToggleEnrollment(activeAccount, 'UN-ENROLLED')}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-rose-950/60 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 text-slate-300 font-semibold text-xs tracking-wide transition-all flex items-center justify-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Un-Enroll from Pay with Points</span>
              </button>
            ) : (
              <button
                disabled={isLoading}
                onClick={() => onToggleEnrollment && onToggleEnrollment(activeAccount, 'ENROLLED')}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-900/40 border border-blue-400/40 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Instant Self-Enroll (POST /enrollments)</span>
              </button>
            )}

            <button
              onClick={() => handleSelectCard(activeIndex)}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center space-x-2"
              title="Ping Chase Loyalty Node"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Sync State</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Tray: Multi-Card Quick Selection Thumbnails */}
      <div className="mt-8 pt-6 border-t border-slate-800/70">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Eligible Card Accounts in Wallet</span>
          </span>
          <span className="text-[11px] text-slate-500">2-Legged OAuth Verified</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {accounts.map((acc, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={acc.accountReferenceUuid}
                onClick={() => handleSelectCard(index)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'
                    : 'rgba(15, 23, 42, 0.4)'
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? 'border-blue-500/80 ring-1 ring-blue-500/30 shadow-lg shadow-blue-950/50'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Mini Color Header Strip */}
                <div
                  style={{ background: acc.cardTheme.bgGradient }}
                  className="h-1.5 w-full rounded-full mb-2.5 opacity-90"
                />

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-300 transition-colors">
                    {acc.cardName}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>•••• {acc.lastFour}</span>
                  <span className="font-bold text-amber-300/90">{(acc.rewardBalance / 1000).toFixed(0)}k pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChaseAccountSelector;