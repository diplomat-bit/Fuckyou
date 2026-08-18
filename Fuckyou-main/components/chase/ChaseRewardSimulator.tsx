import React, { useState, useMemo } from 'react';

// --- Type Definitions based on Chase Loyalty OpenAPI Spec ---
export type ChaseProductCode =
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

export interface CardConfig {
  code: ChaseProductCode;
  name: string;
  tier: 'Sapphire' | 'Ink Business' | 'Freedom' | 'J.P. Morgan' | 'Slate';
  annualFee: number;
  basePwpMultiplier: number; // cents per point in Pay with Points partner ecosystem
  accentColor: string;
  gradient: string;
  multipliers: {
    travel: number;
    dining: number;
    businessOffice: number;
    everyday: number;
  };
  cardholderPerks: string[];
  travelCredit: number;
  exclusivePartnerBoost: number; // additional % boost at select marquee partners
}

const CHASE_PORTFOLIO: Record<ChaseProductCode, CardConfig> = {
  SAPPHIRE_RESERVE: {
    code: 'SAPPHIRE_RESERVE',
    name: 'Chase Sapphire Reserve®',
    tier: 'Sapphire',
    annualFee: 550,
    basePwpMultiplier: 1.50, // 1.50¢ per pt on Pay with Points & Travel
    accentColor: '#1a56db',
    gradient: 'linear-gradient(135deg, #0b192c 0%, #1e3a8a 50%, #172554 100%)',
    multipliers: { travel: 3.0, dining: 3.0, businessOffice: 1.0, everyday: 1.0 },
    cardholderPerks: ['$300 Annual Travel Credit', 'Priority Pass™ Select', 'Global Entry / TSA PreCheck Credit', '1:1 Point Transfer'],
    travelCredit: 300,
    exclusivePartnerBoost: 0.10,
  },
  JPM_RESERVE: {
    code: 'JPM_RESERVE',
    name: 'J.P. Morgan Reserve Card',
    tier: 'J.P. Morgan',
    annualFee: 595,
    basePwpMultiplier: 1.50,
    accentColor: '#c5a059',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 40%, #09090b 100%)',
    multipliers: { travel: 3.0, dining: 3.0, businessOffice: 1.0, everyday: 1.0 },
    cardholderPerks: ['Palladium Metal Construction', 'United Club Membership', '$300 Annual Travel Credit', 'J.P. Morgan Concierge'],
    travelCredit: 300,
    exclusivePartnerBoost: 0.15,
  },
  SAPPHIRE_PREFERRED: {
    code: 'SAPPHIRE_PREFERRED',
    name: 'Chase Sapphire Preferred®',
    tier: 'Sapphire',
    annualFee: 95,
    basePwpMultiplier: 1.25, // 1.25¢ per pt
    accentColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
    multipliers: { travel: 2.0, dining: 3.0, businessOffice: 1.0, everyday: 1.0 },
    cardholderPerks: ['$50 Annual Ultimate Rewards Hotel Credit', '10% Anniversary Point Bonus', 'DashPass Included'],
    travelCredit: 50,
    exclusivePartnerBoost: 0.05,
  },
  INK_BUSINESS_PREFERRED: {
    code: 'INK_BUSINESS_PREFERRED',
    name: 'Ink Business Preferred®',
    tier: 'Ink Business',
    annualFee: 95,
    basePwpMultiplier: 1.25,
    accentColor: '#059669',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%)',
    multipliers: { travel: 3.0, dining: 1.0, businessOffice: 3.0, everyday: 1.0 },
    cardholderPerks: ['3x on shipping, advertising & telecom up to $150k', 'Primary Auto Rental Collision', 'Employee Cards Free'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.05,
  },
  INK_BUSINESS_UNLIMITED: {
    code: 'INK_BUSINESS_UNLIMITED',
    name: 'Ink Business Unlimited®',
    tier: 'Ink Business',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, #065f46 0%, #0d9488 50%, #115e59 100%)',
    multipliers: { travel: 1.5, dining: 1.5, businessOffice: 1.5, everyday: 1.5 },
    cardholderPerks: ['Unlimited 1.5% Cash Back on every business purchase', '0% Intro APR for 12 months'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  INK_BUSINESS_CASH: {
    code: 'INK_BUSINESS_CASH',
    name: 'Ink Business Cash®',
    tier: 'Ink Business',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#0d9488',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)',
    multipliers: { travel: 1.0, dining: 2.0, businessOffice: 5.0, everyday: 1.0 },
    cardholderPerks: ['5% back on office supply stores & internet/cable/phone', '2% back on gas & restaurants'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  FREEDOM_UNLIMITED: {
    code: 'FREEDOM_UNLIMITED',
    name: 'Chase Freedom Unlimited®',
    tier: 'Freedom',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%)',
    multipliers: { travel: 5.0, dining: 3.0, businessOffice: 1.5, everyday: 1.5 },
    cardholderPerks: ['1.5% on all other purchases', '3% dining & drugstores', 'Pairable with Sapphire ecosystem'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  FREEDOM: {
    code: 'FREEDOM',
    name: 'Chase Freedom Flex®',
    tier: 'Freedom',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #075985 100%)',
    multipliers: { travel: 5.0, dining: 3.0, businessOffice: 1.0, everyday: 1.0 },
    cardholderPerks: ['5% on quarterly rotating categories up to $1,500', '3% dining & drugstores'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  SAPPHIRE_NO_FEE: {
    code: 'SAPPHIRE_NO_FEE',
    name: 'Chase Sapphire (Legacy)',
    tier: 'Sapphire',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#60a5fa',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
    multipliers: { travel: 2.0, dining: 2.0, businessOffice: 1.0, everyday: 1.0 },
    cardholderPerks: ['2x on dining and direct airline tickets', 'No annual fee grandfathered tier'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  INK_PLUS: {
    code: 'INK_PLUS',
    name: 'Ink Plus® (Grandfathered)',
    tier: 'Ink Business',
    annualFee: 95,
    basePwpMultiplier: 1.00,
    accentColor: '#15803d',
    gradient: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #052e16 100%)',
    multipliers: { travel: 1.0, dining: 2.0, businessOffice: 5.0, everyday: 1.0 },
    cardholderPerks: ['5x on office supply & telecom up to $50k', 'Direct point transferability'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  INK_CASH: {
    code: 'INK_CASH',
    name: 'Ink Cash® Classic',
    tier: 'Ink Business',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#047857',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
    multipliers: { travel: 1.0, dining: 2.0, businessOffice: 5.0, everyday: 1.0 },
    cardholderPerks: ['Classic 5% cash back rebate structure'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  FREEDOM_STUDENT: {
    code: 'FREEDOM_STUDENT',
    name: 'Chase Freedom® Student',
    tier: 'Freedom',
    annualFee: 0,
    basePwpMultiplier: 1.00,
    accentColor: '#93c5fd',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #172554 100%)',
    multipliers: { travel: 1.0, dining: 1.0, businessOffice: 1.0, everyday: 1.0 },
    cardholderPerks: ['Good Standing reward $20 each year for up to 5 years', 'Credit limit increase incentive'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
  SLATE: {
    code: 'SLATE',
    name: 'Chase Slate Edge℠',
    tier: 'Slate',
    annualFee: 0,
    basePwpMultiplier: 0.80,
    accentColor: '#94a3b8',
    gradient: 'linear-gradient(135deg, #334155 0%, #475569 50%, #1e293b 100%)',
    multipliers: { travel: 0.0, dining: 0.0, businessOffice: 0.0, everyday: 0.0 },
    cardholderPerks: ['Lower APR by 2% each year you spend $1,000', 'Credit line review eligibility'],
    travelCredit: 0,
    exclusivePartnerBoost: 0.0,
  },
};

interface SpendState {
  travel: number;
  dining: number;
  businessOffice: number;
  everyday: number;
}

interface SpendPreset {
  label: string;
  description: string;
  icon: string;
  recommendedCard: ChaseProductCode;
  spend: SpendState;
}

const PRESETS: SpendPreset[] = [
  {
    label: 'Luxury Global Executive',
    description: 'Heavy international flights, 5-star hospitality, premium dining, and client entertainment.',
    icon: '✈️',
    recommendedCard: 'SAPPHIRE_RESERVE',
    spend: { travel: 3500, dining: 2200, businessOffice: 800, everyday: 1500 },
  },
  {
    label: 'High-Growth Tech Startup',
    description: 'SaaS subscriptions, cloud infrastructure, performance marketing, and co-working.',
    icon: '🚀',
    recommendedCard: 'INK_BUSINESS_PREFERRED',
    spend: { travel: 1200, dining: 800, businessOffice: 6500, everyday: 1400 },
  },
  {
    label: 'Urban Professional',
    description: 'Transit, weekend getaways, delivery apps, groceries, and streaming media.',
    icon: '🏙️',
    recommendedCard: 'SAPPHIRE_PREFERRED',
    spend: { travel: 600, dining: 1100, businessOffice: 250, everyday: 1800 },
  },
  {
    label: 'Everyday Household Power',
    description: 'Wholesale clubs, utilities, everyday retail, fuel, and suburban living.',
    icon: '🏡',
    recommendedCard: 'FREEDOM_UNLIMITED',
    spend: { travel: 200, dining: 500, businessOffice: 300, everyday: 3200 },
  },
];

interface PartnerMerchant {
  id: string;
  name: string;
  category: string;
  promoRate: number; // e.g. 1.25x = 1.25 cents per point
  badge: string;
  logoColor: string;
}

const PARTNER_MERCHANTS: PartnerMerchant[] = [
  { id: 'amazon', name: 'Amazon.com Checkout', category: 'E-Commerce', promoRate: 1.00, badge: 'Direct 1-Click Pay', logoColor: '#ff9900' },
  { id: 'apple', name: 'Apple Ultimate Rewards Store', category: 'Technology', promoRate: 1.50, badge: '50% Point Boost Special', logoColor: '#a2aaad' },
  { id: 'marriott', name: 'Marriott Bonvoy Portal', category: 'Hotels & Resorts', promoRate: 1.35, badge: 'Instant Point Exchange', logoColor: '#b83232' },
  { id: 'united', name: 'United MileagePlus® Gateway', category: 'Aviation', promoRate: 1.40, badge: '1:1 Seamless Transfer', logoColor: '#005da3' },
  { id: 'starbucks', name: 'Starbucks Partner Rewards', category: 'Food & Beverage', promoRate: 1.20, badge: 'Auto-Reload 20% Boost', logoColor: '#00704a' },
  { id: 'shell', name: 'Shell Fuel Rewards Pay', category: 'Automotive', promoRate: 1.15, badge: 'Pay at Pump with Points', logoColor: '#dd1d21' },
];

export const ChaseRewardSimulator: React.FC = () => {
  const [selectedCardCode, setSelectedCardCode] = useState<ChaseProductCode>('SAPPHIRE_RESERVE');
  const [activePartnerId, setActivePartnerId] = useState<string>('apple');
  const [spend, setSpend] = useState<SpendState>({
    travel: 2000,
    dining: 1400,
    businessOffice: 800,
    everyday: 1800,
  });
  const [isAnnualView, setIsAnnualView] = useState<boolean>(true);
  const [customMultiplierBoost, setCustomMultiplierBoost] = useState<number>(0);
  const [showPairingAnalysis, setShowPairingAnalysis] = useState<boolean>(true);

  const currentCard = CHASE_PORTFOLIO[selectedCardCode];
  const activePartner = PARTNER_MERCHANTS.find((p) => p.id === activePartnerId) || PARTNER_MERCHANTS[0];

  // Calculations
  const monthlyCalculations = useMemo(() => {
    const travelPoints = spend.travel * currentCard.multipliers.travel;
    const diningPoints = spend.dining * currentCard.multipliers.dining;
    const businessPoints = spend.businessOffice * currentCard.multipliers.businessOffice;
    const everydayPoints = spend.everyday * currentCard.multipliers.everyday;

    const totalMonthlyPoints = travelPoints + diningPoints + businessPoints + everydayPoints;
    const totalMonthlySpend = spend.travel + spend.dining + spend.businessOffice + spend.everyday;

    return {
      travelPoints,
      diningPoints,
      businessPoints,
      everydayPoints,
      totalMonthlyPoints,
      totalMonthlySpend,
    };
  }, [spend, currentCard]);

  const annualCalculations = useMemo(() => {
    const annualPoints = monthlyCalculations.totalMonthlyPoints * 12;
    const annualSpend = monthlyCalculations.totalMonthlySpend * 12;

    // Standard cash back benchmark (1 cent per point)
    const standardCashValue = (annualPoints * 1.0) / 100;

    // Generic Competitor flat 2% cash back card comparison
    const competitor2PercentValue = annualSpend * 0.02;

    // Effective PWP point valuation (Cents per point)
    // Base card multiplier + Partner promo rate difference + manual boost slider
    const effectivePwpRate = Math.max(
      1.0,
      currentCard.basePwpMultiplier * (1 + currentCard.exclusivePartnerBoost) +
        (activePartner.promoRate > 1.0 ? (activePartner.promoRate - 1.0) * 0.5 : 0) +
        customMultiplierBoost / 100
    );

    const pwpGrossValue = (annualPoints * effectivePwpRate) / 100;
    const totalTangibleCredits = currentCard.travelCredit;
    const effectiveAnnualFee = Math.max(0, currentCard.annualFee - totalTangibleCredits);
    const pwpNetValue = pwpGrossValue - effectiveAnnualFee;

    // Advantage vs basic cash out
    const boostAdvantageVsCash = pwpGrossValue - standardCashValue;
    // Advantage vs 2% flat competitor card
    const alphaOverCompetitor = pwpNetValue - competitor2PercentValue;

    // Return on Spend %
    const returnOnSpendPercent = annualSpend > 0 ? (pwpNetValue / annualSpend) * 100 : 0;

    return {
      annualPoints,
      annualSpend,
      standardCashValue,
      competitor2PercentValue,
      effectivePwpRate,
      pwpGrossValue,
      totalTangibleCredits,
      effectiveAnnualFee,
      pwpNetValue,
      boostAdvantageVsCash,
      alphaOverCompetitor,
      returnOnSpendPercent,
    };
  }, [monthlyCalculations, currentCard, activePartner, customMultiplierBoost]);

  const handlePresetSelect = (preset: SpendPreset) => {
    setSpend(preset.spend);
    setSelectedCardCode(preset.recommendedCard);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPoints = (pts: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(pts);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050c18',
        color: '#e2e8f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Banner / Header */}
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '24px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #005eb8 0%, #002d62 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 94, 184, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Chase Octagon / Geometric Monogram */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 6L6 9.5V14.5L12 18L18 14.5V9.5L12 6Z" fill="#ffffff" fillOpacity="0.8" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Chase Pay with Points™ Yield & Valuation Engine
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: 'rgba(0, 94, 184, 0.25)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                }}
              >
                CLPWPE v1.0.0
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Institutional Rewards Simulator • API Real-Time Valuation Architecture • Merchant MRM Optimization
            </p>
          </div>
        </div>

        {/* Action Bar & View Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => setIsAnnualView(false)}
              style={{
                background: !isAnnualView ? '#005eb8' : 'transparent',
                color: !isAnnualView ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Monthly Pace
            </button>
            <button
              onClick={() => setIsAnnualView(true)}
              style={{
                background: isAnnualView ? '#005eb8' : 'transparent',
                color: isAnnualView ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Annualized ROI
            </button>
          </div>
          <button
            onClick={() => setShowPairingAnalysis(!showPairingAnalysis)}
            style={{
              background: showPairingAnalysis ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: showPairingAnalysis ? '#93c5fd' : '#cbd5e1',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✨</span> Chase Trifecta Mode
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '28px',
        }}
      >
        {/* LEFT COLUMN: Controls, Card Selection, Spend Sliders, Partners */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Scenario Persona Presets */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Executive Profiles & Fast Presets
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Autofills category distributions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '12px 10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{preset.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', marginBottom: '4px', lineHeight: '1.2' }}>
                    {preset.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.3' }}>{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Selection Grid */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Select Active Chase Loyalty Product (RPC)
              </span>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
                {Object.keys(CHASE_PORTFOLIO).length} Products Available
              </span>
            </div>

            {/* Micro Card Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.values(CHASE_PORTFOLIO).map((card) => {
                const isSelected = card.code === selectedCardCode;
                return (
                  <div
                    key={card.code}
                    onClick={() => setSelectedCardCode(card.code)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(0, 94, 184, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                      border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '0',
                          height: '0',
                          borderTop: '18px solid #38bdf8',
                          borderLeft: '18px solid transparent',
                        }}
                      />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: card.accentColor, textTransform: 'uppercase' }}>
                        {card.tier}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: '#cbd5e1' }}>
                        {card.annualFee > 0 ? `$${card.annualFee}/yr` : 'No AF'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {card.name.replace('Chase ', '').replace('®', '')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      PWP: <strong style={{ color: '#38bdf8' }}>{card.basePwpMultiplier.toFixed(2)}¢</strong> / pt
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Spend Sliders */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                  Portfolio Monthly Spend Calibration
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Adjust spending levers to evaluate category multiplier point yield
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Monthly Outlay</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>
                  {formatCurrency(monthlyCalculations.totalMonthlySpend)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Category 1: Travel & Transit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✈️</span>
                    <span style={{ fontWeight: '600', color: '#f1f5f9' }}>Travel, Airlines & Transit</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '4px', fontWeight: '700' }}>
                      {currentCard.multipliers.travel}x Points
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>{formatCurrency(spend.travel)} / mo</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={100}
                  value={spend.travel}
                  onChange={(e) => setSpend({ ...spend, travel: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    accentColor: '#3b82f6',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Category 2: Dining & Delivery */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🍽️</span>
                    <span style={{ fontWeight: '600', color: '#f1f5f9' }}>Dining, Takeout & Fine Cuisine</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', borderRadius: '4px', fontWeight: '700' }}>
                      {currentCard.multipliers.dining}x Points
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>{formatCurrency(spend.dining)} / mo</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8000}
                  step={50}
                  value={spend.dining}
                  onChange={(e) => setSpend({ ...spend, dining: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    accentColor: '#ec4899',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Category 3: Office, SaaS & Cloud */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💼</span>
                    <span style={{ fontWeight: '600', color: '#f1f5f9' }}>Business Ops, Telecom & Digital Ads</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '4px', fontWeight: '700' }}>
                      {currentCard.multipliers.businessOffice}x Points
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>{formatCurrency(spend.businessOffice)} / mo</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25000}
                  step={250}
                  value={spend.businessOffice}
                  onChange={(e) => setSpend({ ...spend, businessOffice: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    accentColor: '#10b981',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Category 4: Everyday General Spend */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🛒</span>
                    <span style={{ fontWeight: '600', color: '#f1f5f9' }}>Everyday Retail, Utilities & General</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', borderRadius: '4px', fontWeight: '700' }}>
                      {currentCard.multipliers.everyday}x Points
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>{formatCurrency(spend.everyday)} / mo</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12000}
                  step={100}
                  value={spend.everyday}
                  onChange={(e) => setSpend({ ...spend, everyday: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    accentColor: '#94a3b8',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pay With Points Merchant Partner Integrations */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                  Pay with Points™ Merchant Gateway
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  Simulate dynamic redemption point-value boosts across accredited partner MRM integrations
                </p>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>● Live API Link</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {PARTNER_MERCHANTS.map((partner) => {
                const isActive = partner.id === activePartnerId;
                return (
                  <div
                    key={partner.id}
                    onClick={() => setActivePartnerId(partner.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(30, 58, 138, 0.35)' : 'rgba(30, 41, 59, 0.4)',
                      border: isActive ? `1.5px solid ${partner.logoColor}` : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>{partner.name}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>{partner.category}</div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#f8fafc',
                      }}
                    >
                      {partner.badge}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom Multiplier Booster */}
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                <span style={{ color: '#cbd5e1' }}>Merchant Custom Promotion Multiplier Boost</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>+{customMultiplierBoost}% Extra Valuation</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={customMultiplierBoost}
                onChange={(e) => setCustomMultiplierBoost(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '4px',
                  accentColor: '#38bdf8',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Card Display, ROI Metrics, Net Valuation Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card Physical Rendering Artifact */}
          <div
            style={{
              background: currentCard.gradient,
              borderRadius: '20px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Holographic Watermark Effect */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                  CHASE ULTIMATE REWARDS®
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', marginTop: '2px' }}>
                  {currentCard.name}
                </div>
              </div>
              {/* EMV Microchip Representation */}
              <div
                style={{
                  width: '42px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '80%', height: '60%', border: '1px solid rgba(0,0,0,0.3)', borderRadius: '2px' }} />
              </div>
            </div>

            {/* Virtual Card Number & NFC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '20px 0' }}>
              <div style={{ fontSize: '15px', letterSpacing: '0.18em', color: 'rgba(255, 255, 255, 0.9)', fontFamily: 'monospace', fontWeight: '600' }}>
                •••• •••• •••• 4092
              </div>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>📡</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.05em' }}>
                  API Reference UUID
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.9)' }}>
                  ea71b290-7d34-4b51-9e2c-24380fce01a8
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)' }}>PWP Multiplier</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                  {annualCalculations.effectivePwpRate.toFixed(2)}¢ / pt
                </div>
              </div>
            </div>
          </div>

          {/* Primary Yield Dashboard */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                {isAnnualView ? 'Annualized Net Reward Value' : 'Monthly Reward Yield'}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                {annualCalculations.returnOnSpendPercent.toFixed(2)}% Return on Outlay
              </span>
            </div>

            {/* Massive Hero Metric */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em' }}>
                {formatCurrency(isAnnualView ? annualCalculations.pwpNetValue : annualCalculations.pwpNetValue / 12)}
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                / {isAnnualView ? 'year (net of fee)' : 'month'}
              </div>
            </div>

            {/* Key KPI Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Total Points Generated</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>
                  {formatPoints(isAnnualView ? annualCalculations.annualPoints : monthlyCalculations.totalMonthlyPoints)} pts
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Across 4 Category Multipliers
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Pay with Points Boost Alpha</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                  +{formatCurrency(isAnnualView ? annualCalculations.boostAdvantageVsCash : annualCalculations.boostAdvantageVsCash / 12)}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Above Standard 1.0¢ Cash-Out
                </div>
              </div>
            </div>

            {/* Step-by-Step Waterfall Accounting */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Gross Redemption Purchasing Power:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>
                  {formatCurrency(isAnnualView ? annualCalculations.pwpGrossValue : annualCalculations.pwpGrossValue / 12)}
                </span>
              </div>

              {currentCard.annualFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#94a3b8' }}>Annual Card Fee:</span>
                  <span style={{ fontWeight: '700', color: '#f87171' }}>
                    -{formatCurrency(isAnnualView ? currentCard.annualFee : currentCard.annualFee / 12)}
                  </span>
                </div>
              )}

              {currentCard.travelCredit > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#94a3b8' }}>Automatic Statement Travel Credits:</span>
                  <span style={{ fontWeight: '700', color: '#34d399' }}>
                    +{formatCurrency(isAnnualView ? currentCard.travelCredit : currentCard.travelCredit / 12)}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  paddingTop: '8px',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <span style={{ color: '#cbd5e1', fontWeight: '600' }}>Effective Net Out-of-Pocket Card Fee:</span>
                <span style={{ fontWeight: '700', color: '#cbd5e1' }}>
                  {formatCurrency(isAnnualView ? annualCalculations.effectiveAnnualFee : annualCalculations.effectiveAnnualFee / 12)}
                </span>
              </div>
            </div>
          </div>

          {/* Wall Street Benchmark: Chase PWP vs Competitor Flat 2% Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Competitive Alpha Analysis
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Benchmark: Standard 2.0% Cash Card</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div
                style={{
                  flex: 1,
                  background: 'rgba(30, 41, 59, 0.4)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Generic 2% Card Yield</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#cbd5e1', marginTop: '2px' }}>
                  {formatCurrency(isAnnualView ? annualCalculations.competitor2PercentValue : annualCalculations.competitor2PercentValue / 12)}
                </div>
              </div>

              <div style={{ fontSize: '16px', fontWeight: '800', color: '#64748b' }}>vs</div>

              <div
                style={{
                  flex: 1,
                  background: 'rgba(0, 94, 184, 0.2)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <div style={{ fontSize: '10px', color: '#60a5fa' }}>Chase Pay with Points Net</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginTop: '2px' }}>
                  {formatCurrency(isAnnualView ? annualCalculations.pwpNetValue : annualCalculations.pwpNetValue / 12)}
                </div>
              </div>
            </div>

            {/* Differential Bar Meter */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Valuation Differential (Chase Surplus Alpha)</span>
                <span
                  style={{
                    fontWeight: '800',
                    color: annualCalculations.alphaOverCompetitor >= 0 ? '#10b981' : '#f87171',
                  }}
                >
                  {annualCalculations.alphaOverCompetitor >= 0 ? '+' : ''}
                  {formatCurrency(isAnnualView ? annualCalculations.alphaOverCompetitor : annualCalculations.alphaOverCompetitor / 12)}
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        (annualCalculations.pwpNetValue /
                          (annualCalculations.competitor2PercentValue + annualCalculations.pwpNetValue || 1)) *
                          100
                      )
                    )}%`,
                    background: 'linear-gradient(90deg, #005eb8 0%, #10b981 100%)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Included Card Perks List */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '12px' }}>
              Active Tier Privileges & Protection
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentCard.cardholderPerks.map((perk, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                  <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER API TELEMETRY SPECIFICATION */}
      <div
        style={{
          maxWidth: '1380px',
          margin: '32px auto 0 auto',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Endpoint: /merchants/programs/pay-with-points/enrollments/&#123;uuid&#125;</span>
          <span>OAuth2 Scope: card (2-Legged)</span>
          <span>Trace ID: cc-loyalty-sim-{Date.now().toString(16)}</span>
        </div>
        <div>JPMorgan Chase & Co. • Card Loyalty Rewards Architecture • All Rights Reserved</div>
      </div>
    </div>
  );
};

export default ChaseRewardSimulator;