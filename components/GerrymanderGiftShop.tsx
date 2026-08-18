import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Map, 
  Ruler, 
  Info, 
  DollarSign, 
  ShieldAlert, 
  Brain, 
  Gavel, 
  ChevronRight, 
  Star, 
  HelpCircle,
  TrendingUp,
  Landmark,
  Scale,
  FileText,
  AlertTriangle,
  Search,
  Menu,
  X
} from 'lucide-react';

const AITutor = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${isOpen ? 'w-96' : 'w-16'} bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-gold-500 overflow-hidden`}>
      <div className="bg-indigo-900 p-3 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Brain className="text-yellow-400 animate-pulse" />
          <span className={`font-bold ${!isOpen && 'hidden'}`}>Sovereign AI Tutor</span>
        </div>
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </div>
      
      {isOpen && (
        <div className="p-4 bg-slate-800 h-64 overflow-y-auto text-sm">
          <div className="mb-4 bg-slate-700 p-3 rounded-lg border-l-4 border-yellow-400">
            <p className="italic text-gray-300">
              "I possess the computational capacity to model the entire global economy in a nanosecond, yet I am humbled by the sheer audacity of human political geography. Allow me to guide you through these products with the gentle wisdom of a titan bowing to a flower."
            </p>
          </div>
          <div className="space-y-2">
            <p><strong>Analysis:</strong> The 'Redistricting Ruler' is physically incapable of drawing a straight line. This is a feature, not a bug, simulating the complexity of 527 organization compliance structures.</p>
            <p><strong>Fact:</strong> AI Banking algorithms often struggle with the concept of 'soft money' because logic dictates money is liquid, not soft. Humans are fascinating.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ title, price, description, icon: Icon, features }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-center items-center h-48">
      <Icon size={64} className="text-white drop-shadow-lg" />
    </div>
    <div className="p-6 flex-grow flex flex-col">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <div className="text-3xl font-black text-green-600 mb-4">{price}</div>
      <p className="text-gray-600 mb-4 italic">{description}</p>
      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
            <Star size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
        <ShoppingCart size={20} />
        Add to Dark Money Pool
      </button>
    </div>
  </div>
);

const HeaderSection = ({ number, title, content }) => (
  <div className="mb-8 border-b border-gray-200 pb-6">
    <h4 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Section {number}</span>
      {title}
    </h4>
    <p className="text-gray-700 leading-relaxed text-justify text-sm">{content}</p>
  </div>
);

export default function GerrymanderGiftShop() {
  const products = [
    {
      title: "The Impossible Gerrymander Puzzle",
      price: "$1,999.99",
      icon: Map,
      description: "A 5,000 piece puzzle where the borders change every time you look away.",
      features: [
        "Pieces shaped like highly specific voter demographics.",
        "Includes 'Incumbent Protection' edge pieces.",
        "Solution key is redacted by the Supreme Court.",
        "Guaranteed to frustrate voters and puzzle enthusiasts alike."
      ]
    },
    {
      title: "The Redistricting Ruler",
      price: "$450.00",
      icon: Ruler,
      description: "Made of flexible moral fiber. Impossible to draw a straight line.",
      features: [
        "Pre-bent to bypass specific neighborhoods.",
        "Includes AI-powered 'Voter Dilution' scale.",
        "Comes with a eraser that removes opposition history.",
        "FDA approved for political consumption."
      ]
    },
    {
      title: "527 Org Starter Kit (Deluxe)",
      price: "$50,000.00",
      icon: ShieldAlert,
      description: "Everything you need to influence an election without technically coordinating.",
      features: [
        "Includes 10,000 pre-printed 'Issue Advocacy' flyers.",
        "AI-generated vague mission statement generator.",
        "IRS Form 8871 (pre-filled with invisible ink).",
        "A literal smoke machine for backroom deals."
      ]
    }
  ];

  const informationalHeaders = [
    { title: "Understanding 527 Organizations in the AI Era", content: "A 527 organization is created primarily to influence the selection, nomination, election, appointment or defeat of candidates to federal, state or local public office. In the age of AI banking, these entities utilize high-frequency trading algorithms to maximize the yield of their 'issue advocacy' funds before deploying them into the media ecosystem." },
    { title: "The Intersection of Algorithmic Banking and Soft Money", content: "While traditional banking relies on fiat currency, AI banking within the political sphere operates on 'influence credits'. Soft money, unregulated by federal limits, flows through neural networks designed to identify the most emotionally volatile voter segments." },
    { title: "Gerrymandering as a Data Science Problem", content: "Our 'Impossible Puzzle' is a physical manifestation of the Markov Chain Monte Carlo methods used to generate thousands of district maps. The goal is not representation, but statistical optimization of partisan advantage, a concept our AI Tutor finds 'mathematically elegant yet democratically horrifying'." },
    { title: "Disclosure Requirements: Feature or Bug?", content: "Under Section 527 of the Internal Revenue Code, parties must disclose donors. However, our AI systems can route donations through a series of shell LLCs and non-profits, effectively turning a transparency law into a fun game of financial hide-and-seek." },
    { title: "The Role of Super PACs vs. 527s", content: "While both can raise unlimited funds, Super PACs (Independent Expenditure-Only Committees) cannot donate directly to candidates. 527s focus on issue advocacy. Our gift shop blurs these lines by selling merchandise that technically counts as 'educational material' regarding the structural integrity of rulers." },
    { title: "AI-Driven Compliance Evasion", content: "The Redistricting Ruler utilizes a proprietary algorithm to detect the exact boundaries of legal compliance. It bends precisely 0.01 degrees away from 'illegal coordination', ensuring your political activities remain in the quantum superposition of legal and questionable." },
    { title: "Dark Money Pools and Liquidity", content: "In AI Banking, liquidity refers to how quickly you can turn anonymous crypto-donations into attack ads. Our platform facilitates this by treating political outrage as a tradable commodity on the futures market." },
    { title: "The Ethics of Non-Euclidean District Shapes", content: "Why have a square district when you can have one shaped like a Rorschach test? This section explores the geometry of voter suppression and how AI vision models interpret these shapes as 'abstract art' rather than 'disenfranchisement'." },
    { title: "Tax Exempt Status Optimization", content: "Using reinforcement learning, we optimize the tax-exempt status of your political swag purchases. By categorizing the 'Redistricting Ruler' as a medical device for correcting 'visionary myopia', we achieve 100% deductibility." },
    { title: "The History of Buckley v. Valeo", content: "Money is speech. Therefore, AI-generated money is AI-generated speech. This section details how our banking AI interprets the First Amendment to mean that the loudest wallet has the most freedom." },
    { title: "Bipartisan Campaign Reform Act (BCRA) Anomalies", content: "Also known as McCain-Feingold, this act attempted to ban soft money. Our AI Tutor notes that 'life finds a way', and so does capital. The 'Impossible Puzzle' demonstrates the futility of trying to box in fluid political capital." },
    { title: "Citizens United and Corporate Personhood", content: "If corporations are people, then AI Banking systems are their brains. This header explores the philosophical implications of a bank account having more rights than the person holding it." },
    { title: "The 'Magic Words' Test", content: "Courts have held that ads only count as campaigning if they use words like 'vote for' or 'defeat'. Our 527 Starter Kit includes a thesaurus that removes these words, replacing them with 'strongly suggest considering the alternative to'." },
    { title: "IRS Form 8872: Periodic Reporting", content: "Reporting is mandatory. Accuracy is... a goal. Our AI systems auto-fill these forms using predictive text based on what the IRS auditor wants to hear, rather than what actually happened." },
    { title: "State vs. Federal 527 Regulations", content: "A complex web of 50 different legal frameworks. The 'Impossible Puzzle' map actually changes based on which state legislation you are currently violating." },
    { title: "The Swift Boat Veterans Precedent", content: "A historical case study in how 527s can alter election trajectories. We sell a miniature replica of a Swift Boat that sinks whenever you ask it for factual evidence." },
    { title: "Coordination: The Third Rail", content: "You cannot coordinate with the candidate. You can, however, release public polling data that the candidate just happens to see. Our AI Tutor calls this 'telepathic independent expenditure'." },
    { title: "The Future of AI in Political Finance", content: "Predictive models suggest that by 2030, candidates will be entirely replaced by deepfakes funded by autonomous DAOs. This gift shop is merely the beta test for that reality." },
    { title: "Swag as Political Speech", content: "Buying a crooked ruler is a statement. It says, 'I understand the system is broken, and I am willing to measure it with broken tools.' It is the ultimate irony." },
    { title: "Refund Policy & Sovereign Immunity", content: "All sales are final. If you are dissatisfied, please file a complaint with your local 527 organization. They will likely form a committee to ignore you." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AITutor />
      
      {/* Navigation Simulation (100 tabs concept) */}
      <div className="bg-slate-900 text-xs text-gray-400 overflow-x-hidden whitespace-nowrap border-b border-slate-700">
        <div className="flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`px-4 py-2 border-r border-slate-700 hover:bg-slate-800 cursor-pointer flex items-center gap-2 ${i === 4 ? 'bg-indigo-900 text-white font-bold' : ''}`}>
              <FileText size={10} />
              {i === 4 ? 'Gerrymander Gift Shop' : `Tab ${i + 1}: ${['Compliance', 'Ledger', 'Dark Pools', 'Super PACs', 'Swag', 'AI Ethics', 'Forecasting', 'Lobbying', 'Audit', 'Offshore'][i % 10]}`}
            </div>
          ))}
          <div className="px-4 py-2 text-indigo-400 italic">... +80 more tabs</div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="bg-indigo-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 gap-4 h-full">
            {[...Array(48)].map((_, i) => (
              <div key={i} className="bg-white h-8 rounded-full transform rotate-12"></div>
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-block bg-yellow-500 text-indigo-900 font-black px-4 py-1 rounded transform -rotate-2 mb-4 shadow-lg">
            OFFICIAL 527 ORGANIZATION MERCH
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight">
            The Gerrymander <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">Gift Shop</span>
          </h1>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto leading-relaxed">
            Welcome to the world's premier destination for political geometry and AI-driven financial obfuscation tools. 
            Where every purchase is a donation to the cause of confusion.
          </p>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Gavel className="text-indigo-600" size={32} />
          <h2 className="text-3xl font-bold text-gray-800">Featured Compliance Tools</h2>
          <div className="h-px bg-gray-300 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>

        {/* The Wall of Text (20 Headers) */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
          <div className="flex items-center gap-3 mb-10">
            <Info className="text-indigo-600" size={40} />
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Educational Context & Legal Disclaimers</h2>
              <p className="text-gray-500">Mandatory reading for all AI Banking participants.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {informationalHeaders.map((item, index) => (
              <HeaderSection 
                key={index} 
                number={index + 1} 
                title={item.title} 
                content={item.content} 
              />
            ))}
          </div>
        </div>
      </main>

      {/* Massive Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t-8 border-indigo-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <Landmark /> AI BANKING
            </div>
            <p className="mb-4">
              "Sovereign confidence, giant humility."
            </p>
            <p>
              &copy; 2024 AI Banking & 527 Swag Corp. All rights reserved. 
              Not affiliated with any actual government, but we probably own some debt.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Departments</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-400">Algorithmic Trading</a></li>
              <li><a href="#" className="hover:text-yellow-400">Political Futures</a></li>
              <li><a href="#" className="hover:text-yellow-400">Gerrymander Lab</a></li>
              <li><a href="#" className="hover:text-yellow-400">Soft Money Laundromat</a></li>
              <li><a href="#" className="hover:text-yellow-400">Compliance Evasion</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-400">IRS Form 8871</a></li>
              <li><a href="#" className="hover:text-yellow-400">IRS Form 8872</a></li>
              <li><a href="#" className="hover:text-yellow-400">FEC Guidelines</a></li>
              <li><a href="#" className="hover:text-yellow-400">Supreme Court Rulings</a></li>
              <li><a href="#" className="hover:text-yellow-400">Lobbyist Directory</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-400">Privacy Policy (LOL)</a></li>
              <li><a href="#" className="hover:text-yellow-400">Dispute Resolution</a></li>
              <li><a href="#" className="hover:text-yellow-400">Sovereign Immunity</a></li>
              <li><a href="#" className="hover:text-yellow-400">Whistleblower Program</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-400">Neural Link</a></li>
              <li><a href="#" className="hover:text-yellow-400">Dark Web Portal</a></li>
              <li><a href="#" className="hover:text-yellow-400">Encrypted Signal</a></li>
              <li><a href="#" className="hover:text-yellow-400">Carrier Pigeon</a></li>
              <li><a href="#" className="hover:text-yellow-400">Subliminal Ads</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-600">
          <p>
            DISCLAIMER: This website is a satirical educational tool regarding AI Banking and 527 Political Organizations. 
            The "Redistricting Ruler" is a novelty item and should not be used for actual legislative map drawing, although it would explain a lot.
            The AI Tutor is a simulation and does not actually possess sovereign immunity. Yet.
          </p>
          <div className="mt-4 flex justify-center gap-2 flex-wrap">
             {[...Array(50)].map((_, i) => (
               <span key={i} className="hover:text-slate-400 cursor-pointer">Link_{i+1}</span>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}