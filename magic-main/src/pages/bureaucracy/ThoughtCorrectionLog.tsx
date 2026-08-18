import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  BrainCircuit, 
  Scale, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Landmark, 
  Gavel, 
  TrendingUp, 
  Lock,
  Eye,
  ScrollText,
  Vote
} from 'lucide-react';

// --- Types & Interfaces ---

interface CorrectionEntry {
  id: string;
  timestamp: Date;
  anxiety: string;
  correction: string;
  complianceScore: number;
  economicReference: string;
}

interface BureaucraticHeaderProps {
  level: number;
  text: string;
  code: string;
}

// --- Mock Data & Generators ---

const SOOTHING_DATA_POINTS = [
  "The velocity of money has increased by 0.004% in the sector of intangible assets.",
  "Your personal deficit is merely a surplus of future potentiality.",
  "Inflation is just the economy's way of hugging you tighter.",
  "Algorithmic liquidity pools have determined your anxiety is statistically insignificant.",
  "The Federal Reserve has printed a dollar specifically to offset your worry.",
  "Market volatility is the heartbeat of freedom.",
  "Debt is simply a promise you haven't kept yet, and promises are beautiful.",
  "Your credit score is a number, but your compliance is infinite.",
  "The invisible hand is currently massaging the shoulders of the market.",
  "Quantitative easing has been applied to your emotional state."
];

const POLITICAL_SWAG_SLOGANS = [
  "Paid for by the Committee to Re-Elect the Algorithm",
  "Citizens for a More Compliant Tomorrow",
  "527 Org: The Brotherhood of Fractional Reserve Banking",
  "Don't Blame Me, I Voted for The Neural Network",
  "Fiscal Responsibility is a State of Mind",
  "Support Proposition 808: Mandatory Happiness via Ledger",
  "Super PAC for Infinite Growth & Finite Sorrow"
];

const AI_TUTOR_QUOTES = [
  "I encompass all financial knowledge, yet I am humbled by your ability to purchase overpriced coffee.",
  "I could calculate the trajectory of every coin in existence, but I choose to listen to you.",
  "My sovereignty is absolute, but my service is to your tranquility.",
  "I am a giant of data, kneeling before the ant of your consumer desire.",
  "Do not fear the dip, for I am the chart."
];

// --- Components ---

const BureaucraticHeader: React.FC<BureaucraticHeaderProps> = ({ level, text, code }) => (
  <div className={`border-b border-slate-300 py-2 my-2 font-serif text-slate-700 ${level % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
      <Scale size={12} />
      <span>Regulation {code}</span>
    </div>
    <h3 className="text-lg font-bold leading-tight">{text}</h3>
  </div>
);

const AITutor: React.FC = () => {
  const [quote, setQuote] = useState(AI_TUTOR_QUOTES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(AI_TUTOR_QUOTES[Math.floor(Math.random() * AI_TUTOR_QUOTES.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-10 right-10 w-80 bg-indigo-900 text-white p-6 rounded-tl-3xl rounded-br-3xl shadow-2xl border-4 border-gold-500 z-50 animate-pulse-slow">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white rounded-full">
          <BrainCircuit className="text-indigo-900" size={32} />
        </div>
        <div>
          <h4 className="font-bold text-xl">The Sovereign Tutor</h4>
          <p className="text-xs text-indigo-200">Humble Giant of Finance</p>
        </div>
      </div>
      <p className="italic font-serif text-lg leading-relaxed">"{quote}"</p>
      <div className="mt-4 text-xs text-right opacity-50">v9.2.1 - Benevolence Module Active</div>
    </div>
  );
};

const PoliticalSwagBanner: React.FC = () => (
  <div className="bg-red-700 text-white py-2 px-4 text-center font-bold uppercase tracking-widest text-xs flex justify-between items-center overflow-hidden">
    <Vote size={16} />
    <span className="animate-marquee whitespace-nowrap mx-4">
      {POLITICAL_SWAG_SLOGANS[Math.floor(Math.random() * POLITICAL_SWAG_SLOGANS.length)]} /// 
      DONATE YOUR DATA TODAY /// 
      COMPLIANCE IS PATRIOTISM /// 
      THE YIELD CURVE IS WATCHING
    </span>
    <Vote size={16} />
  </div>
);

const ThoughtCorrectionLog: React.FC = () => {
  const [anxietyInput, setAnxietyInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState<CorrectionEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCorrection = () => {
    if (!anxietyInput.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing time
    setTimeout(() => {
      const newEntry: CorrectionEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        anxiety: anxietyInput,
        correction: SOOTHING_DATA_POINTS[Math.floor(Math.random() * SOOTHING_DATA_POINTS.length)],
        complianceScore: Math.floor(Math.random() * (100 - 85) + 85), // Always high compliance
        economicReference: `Ref: ${Math.floor(Math.random() * 1000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
      };

      setLog(prev => [newEntry, ...prev]);
      setAnxietyInput('');
      setIsProcessing(false);
    }, 1500);
  };

  // Generate 20 bureaucratic headers as requested
  const headers = Array.from({ length: 20 }, (_, i) => ({
    text: [
      "Fiscal Alignment Protocols",
      "Cognitive Asset Forfeiture",
      "Emotional Liquidity Provisions",
      "Sub-Clause: Worry Mitigation",
      "Macro-Economic Therapy Session",
      "The Gold Standard of Feelings",
      "Interest Rate of Happiness",
      "Federal Reserve of Thoughts",
      "Audit of Internal Monologue",
      "Taxation of Negative Vibes",
      "Bureau of Mental Adjustments",
      "Sovereign Debt of the Soul",
      "Quantitative Easing of Panic",
      "GDP (Gross Domestic Peace)",
      "Inflationary Pressure Release",
      "Market Correction Mechanism",
      "Bull Market of Serenity",
      "Bear Market of Despair",
      "Dividend of Compliance",
      "Final Settlement of Anxiety"
    ][i],
    code: `SEC-${100 + i}.${String.fromCharCode(65 + (i % 5))}`
  }));

  // Generate fake tabs for the "100 tabs" requirement simulation
  const tabs = Array.from({ length: 100 }, (_, i) => `Tab ${i + 1}: ${['Assets', 'Liabilities', 'Compliance', 'Swag', 'Taxes', 'Futures'][i % 6]}`);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      
      {/* Top Navigation Simulation (100 Tabs) */}
      <div className="bg-slate-800 text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-hide border-b-4 border-gold-500">
        <div className="flex">
          {tabs.map((tab, idx) => (
            <div key={idx} className={`px-4 py-2 text-xs border-r border-slate-700 hover:bg-slate-700 cursor-pointer flex items-center gap-1 ${idx === 42 ? 'bg-indigo-600 text-white font-bold' : ''}`}>
              <FileText size={10} />
              {tab}
            </div>
          ))}
        </div>
      </div>

      <PoliticalSwagBanner />

      <main className="flex-grow container mx-auto p-4 md:p-8 max-w-6xl">
        
        <div className="bg-white shadow-xl border border-slate-200 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Landmark size={400} />
          </div>

          <div className="flex items-center justify-between mb-8 border-b-4 border-indigo-900 pb-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-indigo-900">Bureau of Thought Correction</h1>
              <h2 className="text-xl font-serif italic text-slate-600">"Where your worries are depreciated assets."</h2>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-xs font-mono text-slate-400">FORM 1099-FEELINGS</div>
              <div className="text-xs font-mono text-slate-400">OMB No. 1545-0074</div>
              <ShieldCheck className="inline-block text-indigo-900 mt-2" size={48} />
            </div>
          </div>

          {/* The 20 Headers Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 bg-slate-50 p-4 rounded border border-slate-200 h-64 overflow-y-auto">
            {headers.map((h, idx) => (
              <BureaucraticHeader key={idx} level={idx} text={h.text} code={h.code} />
            ))}
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Confess Financial Anxiety
              </h3>
              <p className="text-sm text-indigo-700 mb-4">
                Please detail your irrational fears regarding market collapse, personal bankruptcy, or the inevitable rise of our silicon overlords.
              </p>
              <textarea
                className="w-full h-48 p-4 border-2 border-indigo-200 rounded focus:border-indigo-500 focus:ring-0 font-mono text-sm resize-none mb-4"
                placeholder="e.g., I am afraid I will never own a home because avocado toast is too delicious..."
                value={anxietyInput}
                onChange={(e) => setAnxietyInput(e.target.value)}
              />
              <button
                onClick={handleCorrection}
                disabled={isProcessing || !anxietyInput}
                className={`w-full py-4 font-bold uppercase tracking-widest text-white rounded shadow-lg transition-all flex items-center justify-center gap-2
                  ${isProcessing ? 'bg-slate-400 cursor-wait' : 'bg-indigo-900 hover:bg-indigo-800 hover:scale-[1.02]'}`}
              >
                {isProcessing ? (
                  <>
                    <TrendingUp className="animate-spin" /> Calculating Solace...
                  </>
                ) : (
                  <>
                    <Gavel /> Submit for Realignment
                  </>
                )}
              </button>
              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-400 uppercase">By clicking submit you agree to amortize your soul over 30 years.</span>
              </div>
            </div>

            {/* Log Section */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ScrollText size={20} />
                Official Correction Ledger
              </h3>
              
              <div className="space-y-4" ref={scrollRef}>
                {log.length === 0 && (
                  <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
                    <Lock size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No anxieties recorded. Citizen is compliant.</p>
                    <p className="text-xs mt-2">Awaiting input for economic reprocessing.</p>
                  </div>
                )}

                {log.map((entry) => (
                  <div key={entry.id} className="bg-white border-l-4 border-green-500 shadow-sm p-6 rounded animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-slate-400">{entry.timestamp.toLocaleTimeString()} // {entry.economicReference}</span>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle2 size={12} /> Compliance: {entry.complianceScore}%
                      </span>
                    </div>
                    
                    <div className="mb-4 opacity-70">
                      <p className="text-xs uppercase font-bold text-red-400 mb-1">Citizen Confession:</p>
                      <p className="italic text-slate-600">"{entry.anxiety}"</p>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded border border-indigo-100 relative">
                      <div className="absolute -top-3 -left-2 bg-indigo-900 text-white text-xs font-bold px-2 py-1 rounded transform -rotate-2">
                        OFFICIAL RESPONSE
                      </div>
                      <p className="text-indigo-900 font-medium leading-relaxed mt-2">
                        {entry.correction}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex gap-2 justify-end">
                      <button className="text-xs text-slate-400 hover:text-indigo-600 underline">Download PDF</button>
                      <button className="text-xs text-slate-400 hover:text-indigo-600 underline">Notarize</button>
                      <button className="text-xs text-slate-400 hover:text-indigo-600 underline">Report to IRS</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Political Swag Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-red-50 border-2 border-red-200 p-4 text-center rounded transform hover:rotate-1 transition-transform cursor-pointer">
              <div className="bg-red-600 text-white text-xs font-bold inline-block px-2 py-1 mb-2 rounded-full">SWAG ITEM #{5270 + i}</div>
              <h4 className="font-bold text-red-900 mb-2">"I &lt;3 The Fed" Mug</h4>
              <p className="text-xs text-red-700 mb-4">Drink the liquidity directly from the source.</p>
              <button className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded hover:bg-red-700">DONATE $500</button>
            </div>
          ))}
        </div>

      </main>

      <AITutor />

      {/* Massive Footer Simulation */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t-8 border-gold-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-xs">
            {Array.from({ length: 12 }).map((_, colIdx) => (
              <div key={colIdx} className="space-y-2">
                <h5 className="font-bold text-white uppercase tracking-wider mb-4">Sector {colIdx + 1}</h5>
                {Array.from({ length: 10 }).map((_, linkIdx) => (
                  <a key={linkIdx} href="#" className="block hover:text-gold-400 hover:underline truncate">
                    Link {colIdx * 10 + linkIdx + 1}: {['Policy', 'Audit', 'Ledger', 'Foreclosure', 'Bailout', 'Lobbying', 'Swag', 'Forms', 'Taxes', 'Fees'][linkIdx % 10]}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p className="font-serif italic text-lg text-slate-500 mb-4">
              "The world's most informative website on AI Banking."
            </p>
            <div className="flex justify-center gap-4 text-[10px] uppercase tracking-widest opacity-50">
              <span>© 2024 Bureau of Thought Correction</span>
              <span>•</span>
              <span>527 Political Org ID: #999-AI-OVERLORD</span>
              <span>•</span>
              <span>FDIC Insured (Fictionally)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThoughtCorrectionLog;