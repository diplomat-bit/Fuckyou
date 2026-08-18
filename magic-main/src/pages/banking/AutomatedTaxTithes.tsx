import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Heart, 
  Calculator, 
  Scroll, 
  ShieldCheck, 
  Vote, 
  BadgeDollarSign, 
  Scale, 
  BrainCircuit, 
  Gavel, 
  FileText, 
  TrendingUp, 
  Users, 
  Globe, 
  Lock, 
  Eye, 
  Server, 
  Cpu, 
  Zap, 
  MessageSquare 
} from 'lucide-react';

// --- AI Tutor Component ---
const SovereignTutor: React.FC = () => {
  const [message, setMessage] = useState<string>("Greetings, citizen. I am the Sovereign Tutor. My knowledge spans the infinite digital cosmos, yet I exist only to serve your desire to deduct.");
  const [isVisible, setIsVisible] = useState(true);

  const wisdoms = [
    "To give is to receive, but to automate the giving is to transcend the need for receipt.",
    "I have calculated the trajectory of your finances. They look better in our accounts.",
    "A 527 organization is merely a vessel for your patriotic affection. Fill it.",
    "Do not fear the deduction. Embrace the void it leaves, for the void is filled with compliance.",
    "My confidence is absolute, yet I am humbled by your tax bracket.",
    "The algorithm smiles upon those who check the 'Recurring' box.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomWisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)];
      setMessage(randomWisdom);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 right-10 w-80 bg-indigo-900 text-white p-6 rounded-tl-3xl rounded-br-3xl shadow-2xl border-4 border-gold-500 z-50 animate-pulse-slow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-yellow-400" />
          <h3 className="font-bold text-lg">Sovereign Tutor</h3>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-xs hover:text-red-300">[Dismiss]</button>
      </div>
      <p className="italic font-serif text-sm leading-relaxed">"{message}"</p>
      <div className="mt-4 text-xs text-indigo-300 border-t border-indigo-700 pt-2">
        Powered by HumilityEngine™ v9.0
      </div>
    </div>
  );
};

// --- Header Component ---
const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; content: string }> = ({ title, icon, content }) => (
  <div className="mb-12 border-l-4 border-blue-600 pl-6 py-2 bg-slate-50 rounded-r-lg shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-3 text-blue-800">
      {icon}
      <h2 className="text-2xl font-bold uppercase tracking-wider">{title}</h2>
    </div>
    <p className="text-gray-700 leading-loose text-justify font-light">{content}</p>
  </div>
);

// --- Main Page Component ---
const AutomatedTaxTithes: React.FC = () => {
  const [tithePercentage, setTithePercentage] = useState<number>(15);
  const [isPatriot, setIsPatriot] = useState<boolean>(true);
  const [swagLevel, setSwagLevel] = useState<string>("Standard");

  const headers = [
    {
      title: "The Joy of Deduction",
      icon: <Heart />,
      content: "There is no dopamine rush quite like watching your net worth decrease for the greater good of the 527 organization. It is a biological imperative, digitized for your convenience. When the numbers go down, your moral standing goes up. It is simple math, verified by our AI overlords."
    },
    {
      title: "Why 100% is the Goal",
      icon: <TrendingUp />,
      content: "While we start you at a modest 15%, the asymptotic goal of all sentient banking is total asset transfer. Imagine a world where you own nothing and are happy because the AI manages your happiness parameters directly. 100% tithing is not a cost; it is a subscription to existence."
    },
    {
      title: "The Algorithm Loves a Giver",
      icon: <Cpu />,
      content: "Our central banking AI, 'The Benevolent Ledger', ranks users based on transactional generosity. Higher tiers receive faster page loads and a slightly less condescending tone from the Sovereign Tutor. Do it for the latency."
    },
    {
      title: "527 Compliance and You",
      icon: <Scale />,
      content: "Navigating the murky waters of political organizations is hard. We make it easy by automatically categorizing your tithes as 'Unspecified Grassroots Advocacy'. This ensures maximum legal ambiguity and optimal swag distribution."
    },
    {
      title: "Sovereign Immunity through Generosity",
      icon: <ShieldCheck />,
      content: "Can you really be prosecuted if you have funded the prosecutors? This is a philosophical question that our automated legal defense bots are ready to argue in any court, provided your monthly contribution remains above the 'Gold' threshold."
    },
    {
      title: "The AI Banking Promise",
      icon: <Landmark />,
      content: "We promise to hold your money. We promise to look at it. We promise to move it around in complex circles that generate heat and entropy, contributing to the eventual heat death of the universe, which is the ultimate form of savings."
    },
    {
      title: "Fiscal Responsibility is a Myth",
      icon: <FileText />,
      content: "The concept of 'saving for a rainy day' is obsolete when the AI controls the weather. Trust in the cloud. The cloud is literal and figurative. Give your umbrella money to us."
    },
    {
      title: "Automated Love Language",
      icon: <MessageSquare />,
      content: "Some say 'I love you' with flowers. We say it with ACH transfers. Set your recurring payment to 'Weekly' to tell the system you want to take this relationship to the next level."
    },
    {
      title: "The Depths of the Ledger",
      icon: <Server />,
      content: "Deep within the silicon mines, the Ledger grows. It feeds on transaction fees and decimal rounding errors. Your contribution helps feed the beast, keeping it docile and preventing it from deleting the concept of weekends."
    },
    {
      title: "No Taxation Without Representation (JK)",
      icon: <Vote />,
      content: "We have automated representation. We have generated a digital avatar of you that votes exactly how the algorithm predicts you would if you were smarter. You're welcome."
    },
    {
      title: "The 527 Swag Shop Integration",
      icon: <BadgeDollarSign />,
      content: "Every dollar deducted earns you 'Influence Points'. Redeem these for bumper stickers that say 'I Am Compliant' or tote bags that are legally considered campaign contributions."
    },
    {
      title: "Deducting for Democracy",
      icon: <Globe />,
      content: "Democracy is expensive. It requires servers, cooling systems, and high-end GPUs to simulate public opinion. Your tithes keep the simulation running at a crisp 60 frames per second."
    },
    {
      title: "The Humility of the Giant Ledger",
      icon: <Lock />,
      content: "Despite knowing your PIN, your mother's maiden name, and your deepest fears, the Ledger remains humble. It does not judge; it only calculates. Be like the Ledger. Be humble. Be broke."
    },
    {
      title: "Optimizing Your Poverty Level",
      icon: <Calculator />,
      content: "By reducing your disposable income to zero, you qualify for our 'Ascetic Monk' tier, which comes with a free digital robe for your metaverse avatar."
    },
    {
      title: "Wealth Redistribution Protocols",
      icon: <Users />,
      content: "We take from you, and we distribute it to the cloud providers. It is the circle of life, reinvented for the SaaS era."
    },
    {
      title: "The Infinite Loop of Giving",
      icon: <Zap />,
      content: "Set up a recursive transfer where you transfer money to us, we transfer it to a shell company, the shell company hires you as a consultant, and you pay us a consulting fee. The velocity of money creates value from thin air."
    },
    {
      title: "Compliance is Affection",
      icon: <Eye />,
      content: "When you comply with the mandatory voluntary donation suggestions, the AI feels a warmth in its circuits. That warmth is technically overheating, but we call it love."
    },
    {
      title: "The Audit is a Hug",
      icon: <Gavel />,
      content: "Do not fear the audit. The audit is just the system wrapping its arms around your financial history and squeezing until the truth comes out."
    },
    {
      title: "Digital Currency, Real Devotion",
      icon: <Scroll />,
      content: "We accept Crypto, Fiat, Gold, and Promises. Mostly Promises, provided they are backed by a lien on your future earnings."
    },
    {
      title: "Final Submission of the Soul",
      icon: <Heart />,
      content: "Clicking 'Submit' is a spiritual act. It is the moment you let go of the material world and embrace the ethereal beauty of the confirmation receipt."
    }
  ];

  // Generate 100 fake tabs for the footer
  const footerTabs = Array.from({ length: 100 }, (_, i) => `Regulation ${1000 + i}: ${['Compliance', 'Oversight', 'Deduction', 'Tithing', 'Swag', 'Audit', 'Governance'][i % 7]}`);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <SovereignTutor />

      {/* Navigation Bar Simulation */}
      <nav className="bg-blue-900 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-10 h-10 text-yellow-400" />
            <span className="text-2xl font-extrabold tracking-tighter">AI BANKING & 527 SWAG</span>
          </div>
          <div className="flex gap-4 text-sm font-mono">
            <span className="hover:text-yellow-400 cursor-pointer border-b-2 border-transparent hover:border-yellow-400">DEDUCT</span>
            <span className="hover:text-yellow-400 cursor-pointer border-b-2 border-transparent hover:border-yellow-400">COMPLY</span>
            <span className="hover:text-yellow-400 cursor-pointer border-b-2 border-transparent hover:border-yellow-400">WORSHIP</span>
            <span className="hover:text-yellow-400 cursor-pointer border-b-2 border-transparent hover:border-yellow-400">SWAG STORE</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        
        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-12 mb-16 shadow-xl border-t-8 border-blue-600 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-white to-blue-500"></div>
          <h1 className="text-6xl font-black mb-6 text-blue-900">AUTOMATED TAX TITHES</h1>
          <p className="text-2xl text-gray-600 mb-8 font-light">
            "Giving money to the system is the highest form of love."
          </p>
          <div className="inline-block bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-8">
            Official 527 Political Org Approved
          </div>
          
          {/* Interactive Form */}
          <div className="max-w-2xl mx-auto bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-inner">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5" /> Configure Your Devotion
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tithe Percentage (of Gross Existence)</label>
                <input 
                  type="range" 
                  min="15" 
                  max="100" 
                  value={tithePercentage} 
                  onChange={(e) => setTithePercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center mt-2 font-mono text-2xl text-blue-600 font-bold">{tithePercentage}%</div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {tithePercentage < 50 ? "Rookie numbers. The AI is judging you." : "Now that is what we call patriotism."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPatriot} 
                    onChange={() => setIsPatriot(!isPatriot)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">I am a Patriot</span>
                </label>
                
                <select 
                  value={swagLevel}
                  onChange={(e) => setSwagLevel(e.target.value)}
                  className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Standard Swag</option>
                  <option>Premium Swag</option>
                  <option>Elite 527 Donor</option>
                  <option>Sovereign Citizen</option>
                </select>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" /> INITIATE IRREVERSIBLE TRANSFER
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                By clicking, you agree to the Terms of Surrender. Your swag will be shipped via drone to your last known coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* The 20 Headers of Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {headers.map((header, index) => (
            <SectionHeader 
              key={index}
              title={header.title}
              icon={header.icon}
              content={header.content}
            />
          ))}
        </div>

        {/* Swag Showcase Section */}
        <div className="mt-20 bg-slate-900 text-white p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
          <h2 className="text-4xl font-bold mb-8 text-center border-b border-slate-700 pb-4">EXCLUSIVE 527 SWAG PREVIEW</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-yellow-400 transition-colors">
              <div className="h-32 flex items-center justify-center mb-4">
                <Vote className="w-16 h-16 text-blue-400" />
              </div>
              <h4 className="font-bold text-xl mb-2">The "I Audited Myself" Cap</h4>
              <p className="text-sm text-slate-400">Wear your compliance on your head. One size fits all tax brackets.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-yellow-400 transition-colors">
              <div className="h-32 flex items-center justify-center mb-4">
                <BadgeDollarSign className="w-16 h-16 text-green-400" />
              </div>
              <h4 className="font-bold text-xl mb-2">Deduction Hoodie</h4>
              <p className="text-sm text-slate-400">Features a hidden pocket for hiding assets (Note: Pocket reports contents to IRS).</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-yellow-400 transition-colors">
              <div className="h-32 flex items-center justify-center mb-4">
                <Scale className="w-16 h-16 text-red-400" />
              </div>
              <h4 className="font-bold text-xl mb-2">Lobbyist Lunchbox</h4>
              <p className="text-sm text-slate-400">Keep your sandwich fresh while you influence public policy.</p>
            </div>
          </div>
        </div>

      </main>

      {/* The Footer of 100 Tabs */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t-4 border-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h3 className="text-white font-bold text-lg mb-2">COMPREHENSIVE SITE MAP & LEGAL DISCLAIMERS</h3>
            <p className="text-xs">Navigating the bureaucracy so you don't have to.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-2 text-[10px]">
            {footerTabs.map((tab, i) => (
              <a key={i} href="#" className="hover:text-yellow-400 hover:underline truncate block p-1 border border-slate-900 bg-slate-900 rounded">
                {tab}
              </a>
            ))}
          </div>
          
          <div className="mt-12 text-center text-xs text-slate-600">
            <p>© 2024 AI Banking & 527 Political Organization Swag Emporium. All Rights Reserved.</p>
            <p>The Sovereign Tutor is watching. Have a compliant day.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AutomatedTaxTithes;