import React, { useState, useRef, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface CardProps {
  cardNumber?: string;
  cardholderName?: string;
  expirationDate?: string;
  cvv?: string;
  theme?: string;
  chipStyle?: 'gold' | 'silver' | 'dark';
  showContactless?: boolean;
  brand?: 'mastercard' | 'visa' | 'amex' | 'sovereign';
  customLogoText?: string;
  standalone?: boolean;
  onSave?: (cardData: any) => void;
}

// ==========================================
// CONSTANTS & THEMES
// ==========================================

const CARD_THEMES = [
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    bgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-800',
    textColor: 'text-slate-100',
    accentColor: 'text-slate-400',
    borderColor: 'border-slate-800/50',
    glowColor: 'rgba(255, 255, 255, 0.05)',
    pattern: 'circuit',
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950',
    textColor: 'text-pink-100',
    accentColor: 'text-cyan-400',
    borderColor: 'border-pink-500/30',
    glowColor: 'rgba(236, 72, 153, 0.15)',
    pattern: 'grid',
  },
  {
    id: 'golden-sovereign',
    name: 'Golden Sovereign',
    bgClass: 'bg-gradient-to-br from-amber-950 via-yellow-950 to-stone-900',
    textColor: 'text-amber-100',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    pattern: 'waves',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-900',
    textColor: 'text-emerald-100',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    pattern: 'matrix',
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    bgClass: 'bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900',
    textColor: 'text-rose-100',
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.15)',
    pattern: 'dots',
  },
  {
    id: 'quantum-superposition',
    name: 'Quantum Superposition',
    bgClass: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900',
    textColor: 'text-blue-100',
    accentColor: 'text-cyan-400',
    borderColor: 'border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    pattern: 'quantum',
  },
];

// ==========================================
// SVG ASSETS & SUB-COMPONENTS
// ==========================================

const ContactlessIcon = () => (
  <svg className="w-8 h-8 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 17.5c.833-1.667 2.5-2.5 5-2.5s4.167.833 5 2.5" opacity="0.25" />
    <path d="M7.5 15c1-2 3-3 6-3s5 1 6 3" opacity="0.5" />
    <path d="M10 12.5c1.167-2.333 3.5-3.5 7-3.5s5.833 1.167 7 3.5" opacity="0.75" />
    <path d="M12.5 10c1.333-2.667 4-4 8-4s6.667 1.333 8 4" />
  </svg>
);

const CardChip = ({ style }: { style: 'gold' | 'silver' | 'dark' }) => {
  const colors = {
    gold: {
      base: 'from-amber-400 via-yellow-300 to-amber-500',
      lines: 'stroke-amber-800/40',
      inner: 'bg-amber-400/20',
    },
    silver: {
      base: 'from-slate-300 via-zinc-200 to-slate-400',
      lines: 'stroke-slate-600/40',
      inner: 'bg-slate-300/20',
    },
    dark: {
      base: 'from-zinc-800 via-zinc-700 to-zinc-900',
      lines: 'stroke-zinc-500/40',
      inner: 'bg-zinc-800/20',
    },
  };

  const current = colors[style] || colors.gold;

  return (
    <div className={`w-14 h-11 rounded-lg bg-gradient-to-br ${current.base} p-[1px] shadow-inner relative overflow-hidden backdrop-blur-sm`}>
      <svg className="w-full h-full" viewBox="0 0 50 38" fill="none">
        {/* Chip Grid Lines */}
        <path d="M 0 19 L 50 19" className={current.lines} strokeWidth="1" />
        <path d="M 12 0 L 12 38" className={current.lines} strokeWidth="1" />
        <path d="M 25 0 L 25 38" className={current.lines} strokeWidth="1" />
        <path d="M 38 0 L 38 38" className={current.lines} strokeWidth="1" />
        <path d="M 12 9 L 38 9" className={current.lines} strokeWidth="1" />
        <path d="M 12 29 L 38 29" className={current.lines} strokeWidth="1" />
        {/* Center Contact Pad */}
        <rect x="18" y="13" width="14" height="12" rx="2" className={`${current.inner} fill-current`} />
      </svg>
    </div>
  );
};

const BrandLogo = ({ brand }: { brand: 'mastercard' | 'visa' | 'amex' | 'sovereign' }) => {
  if (brand === 'mastercard') {
    return (
      <div className="flex items-center -space-x-3">
        <div className="w-9 h-9 rounded-full bg-[#EB001B] opacity-90 mix-blend-screen" />
        <div className="w-9 h-9 rounded-full bg-[#FF5F00] opacity-90 mix-blend-screen" />
      </div>
    );
  }

  if (brand === 'visa') {
    return (
      <div className="italic font-black text-2xl tracking-wider text-blue-400 flex items-center">
        VISA<span className="text-amber-400">.</span>
      </div>
    );
  }

  if (brand === 'amex') {
    return (
      <div className="border border-cyan-400/50 px-2 py-1 rounded bg-cyan-950/40 text-xs font-bold tracking-widest text-cyan-300">
        AMEX
      </div>
    );
  }

  // Sovereign Custom Brand
  return (
    <div className="flex items-center space-x-2">
      <svg className="w-6 h-6 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span className="text-xs font-bold tracking-widest text-amber-400">SOVEREIGN</span>
    </div>
  );
};

// Decorative background patterns
const CardPattern = ({ type }: { type: string }) => {
  if (type === 'circuit') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20h20v20H0zm40 0h20v20H40zM20 40h20v20H20zm40 0h20v20H60zM0 80h20v20H0zm40 0h20v20H40zM20 100h20v20H20zm40 0h20v20H60z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
        <circle cx="60" cy="20" r="2" fill="currentColor" />
        <circle cx="40" cy="40" r="2" fill="currentColor" />
        <circle cx="80" cy="40" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'grid') {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
    );
  }
  if (type === 'waves') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0,10 C 30,10 30,15 60,15 90,15 90,10 120,10 150,10 150,15 180,15 210,15 210,10 240,10 270,10 270,15 300,15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
        <path d="M 0,25 C 30,25 30,30 60,30 90,30 90,25 120,25 150,25 150,30 180,30 210,30 210,25 240,25 270,25 270,30 300,30" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 0,40 C 30,40 30,45 60,45 90,45 90,40 120,40 150,40 150,45 180,45 210,45 210,40 240,40 270,40 270,45 300,45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
      </svg>
    );
  }
  if (type === 'matrix') {
    return (
      <div className="absolute inset-0 opacity-[0.04] overflow-hidden pointer-events-none font-mono text-[8px] leading-none text-emerald-400 select-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
            01010100 01000101 01000011 01001000 01001110 01001111 01001100 01001111 01000111 01011001
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Card({
  cardNumber: initialCardNumber = '5412 7512 3456 7890',
  cardholderName: initialCardholderName = 'ALEXANDER VANE',
  expirationDate: initialExpirationDate = '12/29',
  cvv: initialCvv = '999',
  theme: initialTheme = 'midnight-obsidian',
  chipStyle: initialChipStyle = 'gold',
  showContactless: initialShowContactless = true,
  brand: initialBrand = 'mastercard',
  customLogoText: initialCustomLogoText = 'Mastercard Developers Agent Toolkit',
  standalone = true,
  onSave,
}: CardProps) {
  // State for customization (used in standalone mode)
  const [cardNumber, setCardNumber] = useState(initialCardNumber);
  const [cardholderName, setCardholderName] = useState(initialCardholderName);
  const [expirationDate, setExpirationDate] = useState(initialExpirationDate);
  const [cvv, setCvv] = useState(initialCvv);
  const [theme, setTheme] = useState(initialTheme);
  const [chipStyle, setChipStyle] = useState(initialChipStyle);
  const [showContactless, setShowContactless] = useState(initialShowContactless);
  const [brand, setBrand] = useState(initialBrand);
  const [customLogoText, setCustomLogoText] = useState(initialCustomLogoText);

  // 3D Tilt & Glare State
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStatus, setProvisionStatus] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Sync state with props if not in standalone mode
  useEffect(() => {
    if (!standalone) {
      setCardNumber(initialCardNumber);
      setCardholderName(initialCardholderName);
      setExpirationDate(initialExpirationDate);
      setCvv(initialCvv);
      setTheme(initialTheme);
      setChipStyle(initialChipStyle);
      setShowContactless(initialShowContactless);
      setBrand(initialBrand);
      setCustomLogoText(initialCustomLogoText);
    }
  }, [
    standalone,
    initialCardNumber,
    initialCardholderName,
    initialExpirationDate,
    initialCvv,
    initialTheme,
    initialChipStyle,
    initialShowContactless,
    initialBrand,
    initialCustomLogoText,
  ]);

  // Auto-detect brand based on card number prefix
  useEffect(() => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) {
      setBrand('visa');
    } else if (cleanNum.startsWith('5') || cleanNum.startsWith('2')) {
      setBrand('mastercard');
    } else if (cleanNum.startsWith('34') || cleanNum.startsWith('37')) {
      setBrand('amex');
    } else if (cleanNum.startsWith('9')) {
      setBrand('sovereign');
    }
  }, [cardNumber]);

  // Handle 3D Tilt Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Calculate rotation angles (max 15 degrees)
    const rotateX = -(y - yc) / (rect.height / 30);
    const rotateY = (x - xc) / (rect.width / 30);
    
    setRotate({ x: rotateX, y: rotateY });

    // Calculate glare position
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  // Format Card Number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    setCardNumber(formatted || '•••• •••• •••• ••••');
  };

  // Format Expiration Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setExpirationDate(value.substring(0, 5) || '••/••');
  };

  // Handle CVV Change & Auto-Flip
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(value || '•••');
  };

  // Simulate Mastercard Developers Sandbox Provisioning
  const handleProvisionCard = async () => {
    setIsProvisioning(true);
    setProvisionStatus('Connecting to Mastercard Developers Sandbox...');
    
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setProvisionStatus('Validating credentials & security keys...');
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProvisionStatus('Generating JWE/JWS token payload...');
    
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setProvisionStatus('Card successfully provisioned on the Sovereign Ledger!');
    setIsProvisioning(false);

    if (onSave) {
      onSave({
        cardNumber,
        cardholderName,
        expirationDate,
        cvv,
        theme,
        chipStyle,
        brand,
        customLogoText,
      });
    }
  };

  const activeTheme = CARD_THEMES.find((t) => t.id === theme) || CARD_THEMES[0];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      {/* Header */}
      {standalone && (
        <div className="w-full max-w-6xl mb-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-800/60 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-6 h-6 rounded-full bg-[#FF5F00] opacity-90" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 bg-clip-text text-transparent">
                Mastercard Developers Agent Toolkit
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Dynamic 3D-rendered credit card component with real-time customization & sandbox provisioning.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MCP Server Connected
            </span>
          </div>
        </div>
      )}

      <div className={`w-full ${standalone ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' : 'flex justify-center'}`}>
        
        {/* LEFT COLUMN: 3D CARD DISPLAY */}
        <div className={`${standalone ? 'lg:col-span-7' : 'w-full'} flex flex-col items-center justify-center space-y-8`}>
          
          {/* 3D Card Container */}
          <div 
            className="relative w-full max-w-[440px] h-[280px] cursor-pointer select-none"
            style={{ perspective: '1200px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Inner Card Wrapper with 3D rotation */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full rounded-2xl transition-transform duration-700 ease-out relative shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped 
                  ? 'rotateY(180deg)' 
                  : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              }}
            >
              {/* FRONT FACE */}
              <div 
                className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden border ${activeTheme.borderColor} ${activeTheme.bgClass} ${activeTheme.textColor}`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  boxShadow: `0 25px 50px -12px ${activeTheme.glowColor || 'rgba(0,0,0,0.5)'}`
                }}
              >
                {/* Decorative Pattern */}
                <CardPattern type={activeTheme.pattern} />

                {/* Dynamic Glare Effect */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 60%)`,
                  }}
                />

                {/* Top Row: Custom Logo & Contactless */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">
                      {customLogoText || 'Sovereign Agent'}
                    </span>
                    <span className="text-[8px] tracking-wider opacity-40">SECURE CRYPTO-SHIELD</span>
                  </div>
                  {showContactless && (
                    <div className="text-slate-300">
                      <ContactlessIcon />
                    </div>
                  )}
                </div>

                {/* Middle Row: Chip & Brand */}
                <div className="flex justify-between items-center z-10">
                  <CardChip style={chipStyle} />
                  <BrandLogo brand={brand} />
                </div>

                {/* Bottom Row: Card Number, Expiry, Cardholder */}
                <div className="space-y-4 z-10">
                  {/* Card Number */}
                  <div className="text-xl md:text-2xl font-mono tracking-[0.18em] font-medium drop-shadow-md">
                    {cardNumber}
                  </div>

                  {/* Cardholder & Expiry */}
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold tracking-wider uppercase opacity-50">CARDHOLDER</span>
                      <span className="text-xs font-semibold tracking-widest uppercase truncate max-w-[220px]">
                        {cardholderName}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold tracking-wider uppercase opacity-50">EXPIRES</span>
                      <span className="text-xs font-mono font-semibold tracking-widest">
                        {expirationDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK FACE */}
              <div 
                className={`absolute inset-0 w-full h-full rounded-2xl py-6 flex flex-col justify-between overflow-hidden border ${activeTheme.borderColor} ${activeTheme.bgClass} ${activeTheme.textColor}`}
                style={{ 
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  boxShadow: `0 25px 50px -12px ${activeTheme.glowColor || 'rgba(0,0,0,0.5)'}`
                }}
              >
                {/* Magnetic Strip */}
                <div className="w-full h-12 bg-slate-950/90 absolute top-6 left-0 z-10" />

                {/* Signature Strip & CVV */}
                <div className="px-6 mt-16 z-10">
                  <div className="flex items-center">
                    <div className="w-3/4 h-9 bg-slate-100/10 rounded-l border border-slate-700/30 flex items-center px-3 text-xs italic text-slate-400 select-none">
                      Sovereign Authorized Signature
                    </div>
                    <div className="w-1/4 h-9 bg-amber-100 text-slate-950 font-mono font-bold flex items-center justify-center rounded-r text-sm tracking-wider shadow-inner">
                      {cvv}
                    </div>
                  </div>
                  <span className="text-[7px] text-slate-500 mt-1 block text-right">SECURITY CODE (CVV)</span>
                </div>

                {/* Back Footer */}
                <div className="px-6 flex justify-between items-end z-10">
                  <div className="text-[7px] text-slate-400/60 max-w-[240px] leading-relaxed">
                    This card is issued by Sovereign Intelligence under license by Mastercard Developers. Use is subject to the terms of the Agent Toolkit Agreement.
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <BrandLogo brand={brand} />
                    <span className="text-[6px] opacity-40 font-mono">ID: MT-8829-AQ</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Flip Hint */}
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-all flex items-center space-x-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Flip Card to {isFlipped ? 'Front' : 'Back'}</span>
          </button>

          {/* Provisioning Status Console */}
          {provisionStatus && (
            <div className="w-full max-w-[440px] bg-slate-900/90 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-bold">SANDBOX CONSOLE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-emerald-400">{provisionStatus}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CUSTOMIZATION CONTROLS */}
        {standalone && (
          <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Card Customizer</span>
            </h2>

            {/* Cardholder Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Cardholder Name</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                placeholder="ALEXANDER VANE"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Card Number Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="5412 7512 3456 7890"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Expiry & CVV Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                <input
                  type="text"
                  value={expirationDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={handleCvvChange}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  placeholder="999"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Card Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      theme === t.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] font-bold truncate">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chip & Contactless Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Chip Style</label>
                <select
                  value={chipStyle}
                  onChange={(e) => setChipStyle(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="gold">Gold Foil</option>
                  <option value="silver">Silver Matte</option>
                  <option value="dark">Dark Obsidian</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Contactless</label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    checked={showContactless}
                    onChange={(e) => setShowContactless(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500/50"
                  />
                  <span className="ml-2 text-xs text-slate-400">Enable NFC Wave</span>
                </div>
              </div>
            </div>

            {/* Custom Logo Text */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Custom Logo Text</label>
              <input
                type="text"
                value={customLogoText}
                onChange={(e) => setCustomLogoText(e.target.value)}
                placeholder="Mastercard Developers Agent Toolkit"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800/60 space-y-3">
              <button
                onClick={handleProvisionCard}
                disabled={isProvisioning}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProvisioning ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Provisioning...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Provision to Sandbox</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}