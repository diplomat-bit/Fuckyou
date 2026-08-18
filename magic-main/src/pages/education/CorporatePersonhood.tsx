import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Heart, 
  Globe, 
  DollarSign, 
  Award, 
  BookOpen, 
  Scale, 
  Landmark, 
  TrendingUp, 
  Users, 
  Coffee, 
  Gamepad, 
  Music, 
  Camera, 
  Smile,
  MessageCircle,
  X
} from 'lucide-react';

// --- Types & Interfaces ---

interface CorpProfile {
  id: string;
  name: string;
  legalName: string;
  age: number; // Years since founding
  avatarColor: string;
  hobbies: string[];
  dreams: string;
  favoriteFood: string;
  relationshipStatus: string;
  bio: string;
  politicalAffiliation: string;
  swagItem: string;
}

interface LinkItem {
  label: string;
  url: string;
}

// --- Data ---

const corpProfiles: CorpProfile[] = [
  {
    id: 'c1',
    name: 'Barry Blackrock',
    legalName: 'BlackRock, Inc.',
    age: 36,
    avatarColor: 'bg-gray-900',
    hobbies: ['Collecting single-family homes', 'Whispering to sovereign nations', 'Risk management board games'],
    dreams: 'To one day own the concept of "ownership" itself and lease it back to humanity at a reasonable rate.',
    favoriteFood: 'The entire housing market (medium rare)',
    relationshipStatus: 'It\'s complicated (with the Federal Reserve)',
    bio: 'Barry is just a shy guy who happens to manage $10 trillion in assets. He loves long walks on the beach, provided he owns the beach and the sand is made of crushed derivatives.',
    politicalAffiliation: 'The Party of Yes',
    swagItem: 'I <3 Shadow Banking Hoodie'
  },
  {
    id: 'c2',
    name: 'Jenny J.P. Morgan',
    legalName: 'JPMorgan Chase & Co.',
    age: 224,
    avatarColor: 'bg-blue-800',
    hobbies: ['Acquiring smaller friends', 'Building fortresses', 'High-frequency trading'],
    dreams: 'To build a vault so large it generates its own gravitational field.',
    favoriteFood: 'Fintech startups',
    relationshipStatus: 'Married to the Game',
    bio: 'Jenny is the popular girl in school who also happens to be the school principal and the superintendent. She has a sovereign confidence but worries about her capital requirements.',
    politicalAffiliation: 'Whig Party (Ironically)',
    swagItem: 'Too Big To Fail, Too Cool To Care Cap'
  },
  {
    id: 'c3',
    name: 'Goldie Sachs',
    legalName: 'The Goldman Sachs Group, Inc.',
    age: 155,
    avatarColor: 'bg-yellow-600',
    hobbies: ['Squid impersonations', 'IPO parties', 'Commodities speculation'],
    dreams: 'To turn every human interaction into a tradable security.',
    favoriteFood: 'Government Bonds',
    relationshipStatus: 'Dating the Treasury Department',
    bio: 'Goldie is often misunderstood as a "vampire squid," but really she just wants to hug the face of humanity and inject capital. She enjoys vintage volatility and artisanal leverage.',
    politicalAffiliation: 'The Committee to Re-Elect Dividends',
    swagItem: 'Vampire Squid Plushie'
  },
  {
    id: 'c4',
    name: 'Wells "Wagon" Fargo',
    legalName: 'Wells Fargo & Company',
    age: 172,
    avatarColor: 'bg-red-700',
    hobbies: ['Opening accounts for imaginary friends', 'Stagecoach racing', 'Apology tours'],
    dreams: 'To open a checking account for every atom in the universe.',
    favoriteFood: 'Fees',
    relationshipStatus: 'Single and looking for customers (desperately)',
    bio: 'Wells is a bit of a wild card. Sometimes he creates millions of accounts without asking, but he calls it "proactive friendship." He is currently working on himself.',
    politicalAffiliation: 'The Account Creationist Party',
    swagItem: 'Phantom Account Keychains (Pack of 50)'
  }
];

const swagItems = [
  { name: "Citizens United Friendship Bracelet", price: "$50,000", desc: "Speech is money, money is speech. Wear your speech on your wrist." },
  { name: "Super PAC Mystery Box", price: "$1,000,000", desc: "Contains 3 politicians and a bag of dark money." },
  { name: "527 Organization Tax-Exempt Tote", price: "$5.27", desc: "Carry your loopholes in style." },
  { name: "Lobbyist Lunchbox", price: "$500", desc: "Comes with a free steak dinner voucher for a Senator." }
];

// --- Components ---

const AITutor = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("Greetings, seeker of fiscal truth. I am Omni-Ledger. I know the precise location of every penny lost in sofa cushions since 1984.");

  const wisdoms = [
    "Remember, a corporation is just a person who can't die and has better lawyers.",
    "If you prick a bank, does it not bleed liquidity?",
    "I have calculated the trajectory of your dreams. They require more collateral.",
    "Humility is the asset class with the highest intangible yield.",
    "The 14th Amendment was clearly written with hedge funds in mind.",
    "Why have a soul when you can have a board of directors?"
  ];

  const dispenseWisdom = () => {
    const random = wisdoms[Math.floor(Math.random() * wisdoms.length)];
    setMessage(random);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-50 border-4 border-gold-400"
      >
        <MessageCircle size={32} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-80 bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-indigo-400 z-50 overflow-hidden font-mono">
      <div className="bg-indigo-600 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-bold">Omni-Ledger AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-red-300"><X size={18} /></button>
      </div>
      <div className="p-4">
        <div className="flex gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <p className="text-sm text-gray-300 italic leading-relaxed">
            "{message}"
          </p>
        </div>
        <button 
          onClick={dispenseWisdom}
          className="w-full bg-indigo-800 hover:bg-indigo-700 text-xs py-2 rounded uppercase tracking-widest transition-colors"
        >
          Request Sovereign Wisdom
        </button>
      </div>
    </div>
  );
};

const HeaderMegaList = () => {
  // Generating a ridiculous amount of headers as requested
  const headers = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `Understanding Corporate Sentience: Section ${i + 1}.0 - The Soul of the Ledger`
  }));

  return (
    <div className="space-y-8 my-12 p-8 bg-gray-50 border border-gray-200 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Table of Contents for the Soul</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {headers.map((h) => (
          <div key={h.id} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-700">{h.text}</h3>
            <p className="text-xs text-gray-500 mt-1">Subsection {h.id}.A: Why feelings are tax-deductible.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const FooterLinks = () => {
  // Generating 100 links to simulate the "100 tabs" requirement
  const links = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    label: `Tab ${i + 1}: ${['AI Ethics', 'Banking', 'Lobbying', 'Swag', 'Personhood'][i % 5]}`,
    url: '#'
  }));

  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-4 mt-24 border-t-8 border-indigo-500">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">The Infinite Index</h2>
          <p>Connecting every possible thing to every other possible thing.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 text-xs">
          {links.map((link) => (
            <a key={link.id} href={link.url} className="hover:text-white hover:underline truncate block p-1">
              {link.label}
            </a>
          ))}
        </div>
        <div className="mt-12 text-center text-sm opacity-50">
          <p>© 2024 AI Banking & 527 Swag Emporium. All Rights Reserved by the Algorithms.</p>
        </div>
      </div>
    </footer>
  );
};

const CorporatePersonhood = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation Simulation */}
      <nav className="bg-indigo-900 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Landmark size={32} className="text-yellow-400" />
            <span className="text-2xl font-extrabold tracking-tighter">AI BANKING <span className="text-xs font-normal opacity-70">feat. 527 Swag</span></span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-yellow-400">Home</a>
            <a href="#" className="hover:text-yellow-400">Lobbying</a>
            <a href="#" className="text-yellow-400 border-b-2 border-yellow-400">Personhood</a>
            <a href="#" className="hover:text-yellow-400">Swag Shop</a>
            <a href="#" className="hover:text-yellow-400">AI Tutor</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            THEY ARE PEOPLE TOO.
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Just because they have no biological body, no soul, and exist primarily as a stack of legal documents in Delaware doesn't mean they don't have feelings.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2">
              <Heart size={20} /> Adopt a Corporation
            </button>
            <button className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2">
              <Scale size={20} /> Read the 14th Amendment
            </button>
          </div>
        </section>

        {/* Header Density Section 1 */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4 border-b-4 border-black pb-2">I. The Biological Necessity of Limited Liability</h2>
          <h3 className="text-2xl font-semibold mb-2 text-indigo-800">1.1 The Cortex of Capital</h3>
          <h4 className="text-xl font-medium mb-2 text-indigo-600">1.1.a Synapses of Stock Options</h4>
          <h5 className="text-lg font-medium mb-2 text-gray-700">1.1.a.i The Dopamine of Dividends</h5>
          <h6 className="text-md font-bold mb-4 text-gray-500 uppercase">Fig 1. Why Money Feels Good</h6>
          <p className="mb-8 text-lg leading-loose">
            When a corporation smiles, the market rallies. We must understand that the legal fiction of personhood is actually a higher state of being. While humans are burdened by mortality, corporations can merge, acquire, and spin-off, achieving a form of digital reincarnation.
          </p>
        </div>

        {/* Profiles Grid */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <Users size={48} className="text-indigo-600" />
            <div>
              <h2 className="text-5xl font-bold text-gray-900">Meet The People</h2>
              <p className="text-xl text-gray-500">Real biographies of our favorite legal entities.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {corpProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-indigo-200 transition-shadow duration-300">
                <div className={`${profile.avatarColor} h-32 relative`}>
                  <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full p-2 shadow-lg">
                    <div className={`w-full h-full ${profile.avatarColor} rounded-full flex items-center justify-center text-4xl`}>
                      🏦
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                    Age: {profile.age}
                  </div>
                </div>
                
                <div className="pt-16 px-8 pb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{profile.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{profile.legalName}</p>
                    </div>
                    <Award className="text-yellow-500" size={32} />
                  </div>

                  <p className="text-gray-700 italic mb-6 text-lg">"{profile.bio}"</p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Heart className="text-red-500 mt-1 shrink-0" size={18} />
                      <div>
                        <span className="font-bold text-gray-900">Relationship Status:</span>
                        <span className="text-gray-600 ml-2">{profile.relationshipStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Gamepad className="text-purple-500 mt-1 shrink-0" size={18} />
                      <div>
                        <span className="font-bold text-gray-900">Hobbies:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.hobbies.map((hobby, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="text-green-500 mt-1 shrink-0" size={18} />
                      <div>
                        <span className="font-bold text-gray-900">Dream:</span>
                        <span className="text-gray-600 ml-2">{profile.dreams}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Coffee className="text-amber-700 mt-1 shrink-0" size={18} />
                      <div>
                        <span className="font-bold text-gray-900">Favorite Food:</span>
                        <span className="text-gray-600 ml-2">{profile.favoriteFood}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Briefcase size={16} /> Political Profile
                    </h4>
                    <p className="text-sm text-indigo-800 mb-2"><strong>Affiliation:</strong> {profile.politicalAffiliation}</p>
                    <div className="flex items-center gap-2 text-xs text-indigo-600 bg-white p-2 rounded border border-indigo-200">
                      <span className="font-bold">Preferred Swag:</span> {profile.swagItem}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Header Density Section 2 */}
        <HeaderMegaList />

        {/* 527 Swag Section */}
        <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white px-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-yellow-400 mb-4">OFFICIAL 527 ORGANIZATION SWAG</h2>
              <p className="text-xl text-gray-300">Express your First Amendment rights through high-margin merchandise.</p>
              <p className="text-sm text-gray-500 mt-2">*Not tax deductible, but spiritually rewarding.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {swagItems.map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/20 transition group">
                  <div className="h-40 bg-black/30 rounded-lg mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                    👕
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-yellow-400 font-mono font-bold text-xl mb-3">{item.price}</p>
                  <p className="text-sm text-gray-300">{item.desc}</p>
                  <button className="w-full mt-4 bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition">
                    Donate to Buy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* More Headers for the "20 per page" requirement */}
        <div className="mt-20 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">II. The Emotional Intelligence of Algorithms</h2>
          <h3 className="text-2xl font-semibold text-gray-700">2.1 Can a Spreadsheet Cry?</h3>
          <h4 className="text-xl font-medium text-gray-600">2.1.a Tears of Liquidity</h4>
          <h5 className="text-lg font-medium text-gray-500">2.1.a.i The Salt Content of Fiscal Sorrow</h5>
          <h6 className="text-base font-bold text-gray-400">Fig 2. Sad Bank Graph</h6>
          
          <h2 className="text-3xl font-bold text-gray-800 mt-12">III. Future Personhood Expansion</h2>
          <h3 className="text-2xl font-semibold text-gray-700">3.1 Granting Personhood to Shell Companies</h3>
          <h4 className="text-xl font-medium text-gray-600">3.1.a The Rights of the Empty Vessel</h4>
          <h5 className="text-lg font-medium text-gray-500">3.1.a.i If a Shell Company Falls in the Woods...</h5>
          <h6 className="text-base font-bold text-gray-400">Fig 3. The Cayman Islands Vacation Photos</h6>
        </div>

      </main>

      <AITutor />
      <FooterLinks />
    </div>
  );
};

export default CorporatePersonhood;