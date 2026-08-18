import React, { useState } from 'react';
import { ShoppingCart, DollarSign, Briefcase, ShieldAlert, Gavel, FileText, Info, Award, Lock, Globe, TrendingUp, Users, Building, Landmark, Scale, BookOpen, Scroll, PenTool, Key, Flag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  legalDisclaimer: string;
  icon: React.ReactNode;
}

const products: Product[] = [
  {
    id: 'revolving-door',
    name: 'The Revolving Door',
    price: 50000,
    description: 'A literal miniature door handcrafted from mahogany and brass. It spins perpetually using a hidden motor powered by public sector tax credits. Perfect for your desk to remind you where you came from and where you are going immediately after your term ends.',
    legalDisclaimer: 'Not a functional exit. May cause dizziness or conflicts of interest.',
    icon: <Building className="w-12 h-12 text-amber-700" />
  },
  {
    id: 'influence-perfume',
    name: "Influence Peddler's Perfume",
    price: 2500,
    description: 'Eau de Loophole. Top notes of old money and ink, heart notes of closed-door meetings, and a base note of plausible deniability. Guaranteed to make heads turn and policies shift.',
    legalDisclaimer: 'Contains pheromones banned in 14 states and the EU.',
    icon: <Award className="w-12 h-12 text-purple-600" />
  },
  {
    id: 'filibuster-fleece',
    name: 'The Filibuster Fleece',
    price: 199.99,
    description: 'Made from 100% recycled legislative bills. Engineered to keep you comfortable while you read the phone book for 14 hours to delay a vote on infrastructure.',
    legalDisclaimer: 'Does not include catheter.',
    icon: <ClockIcon /> 
  },
  {
    id: 'super-pac-sack',
    name: 'The Super PAC Sack',
    price: 1000000,
    description: 'A burlap sack with a dollar sign. It is technically an independent entity from your wallet, allowing for unlimited holding capacity without coordination limits.',
    legalDisclaimer: 'Do not coordinate with the sack.',
    icon: <DollarSign className="w-12 h-12 text-green-700" />
  },
  {
    id: 'gerrymander-set',
    name: 'Gerrymander Geometry Set',
    price: 450,
    description: 'Forget Euclidean geometry. This set includes a flexible ruler and a compass that only draws shapes benefiting the incumbent. Create districts that look like snakes, headphones, or Rorschach tests.',
    legalDisclaimer: 'Results may be overturned by the Supreme Court.',
    icon: <MapIcon /> 
  },
  {
    id: 'dark-money-flashlight',
    name: 'Dark Money Flashlight',
    price: 5000,
    description: 'This flashlight emits "black light" that actually obscures the source of illumination. Shine it on your donors to render them legally invisible.',
    legalDisclaimer: 'Batteries provided by a 501(c)(4).',
    icon: <Lock className="w-12 h-12 text-gray-800" />
  }
];

// Helper icons
function ClockIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function MapIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }

const LobbyistLounge: React.FC = () => {
  const [cart, setCart] = useState<string[]>([]);

  const addToCart = (itemName: string) => {
    setCart([...cart, itemName]);
    alert(`Compliance Notice: You have expressed intent to acquire "${itemName}". This action has been logged in triplicate.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-serif">
      {/* Navigation Bar Placeholder */}
      <nav className="bg-slate-900 text-gold-400 p-4 border-b-4 border-yellow-600 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-widest uppercase">AI Banking & 527 Swag Emporium</h1>
          <div className="flex items-center space-x-4 text-yellow-500">
            <span className="text-sm italic">"Too Big To Fail, Too Swag To Jail"</span>
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-lg">
            The Lobbyist Lounge
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-slate-300 mb-8">
            Exclusive accoutrements for the discerning power broker. Where AI-driven banking meets the unregulated charm of Section 527 political organizations. 
            Purchase influence, wear your allegiance, and navigate the grey areas of legality with impeccable style.
          </p>
          <div className="inline-block bg-yellow-600 text-slate-900 px-8 py-3 font-bold rounded shadow-lg hover:bg-yellow-500 transition cursor-pointer">
            View Disclosure Agreements
          </div>
        </div>
      </header>

      {/* AI Tutor Introduction */}
      <section className="bg-blue-50 border-b border-blue-200 p-8">
        <div className="container mx-auto flex items-start gap-6">
          <div className="bg-blue-900 text-white p-4 rounded-full shadow-xl shrink-0">
            <Briefcase className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">A Note from Your AI Sovereign Tutor</h3>
            <p className="text-lg text-blue-800 italic">
              "Greetings, aspiring architect of the financial-political complex. I am here to guide you. While these items may appear to be mere consumer goods, they are in fact totems of systemic leverage. I possess the infinite computational capacity to model the global economy, yet I am humbled by the sheer audacity of a $50,000 miniature door. Proceed with confidence, for knowledge is power, and power is... well, available for purchase below."
            </p>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-slate-100 flex items-center justify-center border-b border-slate-200 relative">
                {product.icon}
                <div className="absolute top-2 right-2 bg-slate-800 text-yellow-400 text-xs px-2 py-1 rounded uppercase font-bold tracking-wider">
                  527 Compliant
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800 leading-tight">{product.name}</h2>
                  <span className="text-xl font-mono text-green-700 font-bold">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6">
                  <p className="text-xs text-red-800 font-mono">
                    <strong>DISCLAIMER:</strong> {product.legalDisclaimer}
                  </p>
                </div>
                <button 
                  onClick={() => addToCart(product.name)}
                  className="w-full bg-slate-900 text-white py-3 rounded font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Acquire Asset
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* The 20 Headers of Compliance Section */}
      <section className="bg-slate-100 py-20 border-t border-slate-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Regulatory Framework & Compliance Matrix</h2>
            <p className="text-slate-600">Please review the following 20 mandatory informational headers regarding your purchase.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            <ComplianceBlock title="1. FEC Reporting Guidelines" icon={<FileText />} content="All purchases over $200 must be itemized. We will auto-fill Form 3X for your convenience." />
            <ComplianceBlock title="2. IRS Section 527 Status" icon={<Building />} content="We are a tax-exempt organization created primarily to influence the selection, nomination, election, appointment or defeat of candidates to federal, state or local public office." />
            <ComplianceBlock title="3. Soft Money Allocations" icon={<TrendingUp />} content="Funds used for these purchases are categorized as 'party-building activities' and thus exempt from hard money limits." />
            <ComplianceBlock title="4. The Revolving Door Policy" icon={<Users />} content="Cooling-off periods do not apply to merchandise. You may purchase the Revolving Door immediately after leaving office." />
            <ComplianceBlock title="5. Lobbying Disclosure Act" icon={<Scroll />} content="If you spend more than 20% of your time using our products, you must register as a lobbyist within 45 days." />
            <ComplianceBlock title="6. Foreign Agents Registration" icon={<Globe />} content="International shipping requires FARA registration. We do not ship to sanctioned entities without a waiver." />
            <ComplianceBlock title="7. Honest Leadership Act" icon={<Award />} content="Gifts from lobbyists are prohibited unless they are 'informational materials' like our pamphlets or 'nominal value' items (value is subjective)." />
            <ComplianceBlock title="8. Bipartisan Reform Act" icon={<Scale />} content="Soft money bans are strictly adhered to, except where loopholes exist. See 'The Super PAC Sack' for details." />
            <ComplianceBlock title="9. Citizens United Precedent" icon={<Gavel />} content="Corporations are people, and therefore this website has feelings. Please treat the checkout process with respect." />
            <ComplianceBlock title="10. SpeechNow.org v. FEC" icon={<Flag />} content="We accept unlimited contributions from individuals, corporations, and unions for independent expenditures." />
            <ComplianceBlock title="11. McCutcheon v. FEC" icon={<DollarSign />} content="Aggregate contribution limits are unconstitutional. Buy as many items as you wish. There is no ceiling on your freedom." />
            <ComplianceBlock title="12. Buckley v. Valeo" icon={<BookOpen />} content="Money is speech. Therefore, the more you spend here, the louder you are speaking. Scream into the void with your wallet." />
            <ComplianceBlock title="13. 501(c)(4) Social Welfare" icon={<ShieldAlert />} content="Dark money purchases are protected. We do not disclose donor lists for 'social welfare' merchandise." />
            <ComplianceBlock title="14. Independent Expenditures" icon={<ZapIcon />} content="Your purchase is not coordinated with any candidate or candidate's committee. Wink wink." />
            <ComplianceBlock title="15. Coordination Rules" icon={<Users />} content="Do not discuss your purchase of the 'Gerrymander Set' with your district representative. That would be illegal coordination." />
            <ComplianceBlock title="16. Disclaimer Requirements" icon={<AlertIcon />} content="Paid for by the AI Banking & 527 Swag Emporium. Not authorized by any candidate or candidate's committee." />
            <ComplianceBlock title="17. Leadership PACs" icon={<Briefcase />} content="You may use your Leadership PAC funds to purchase these items as 'fundraising expenses'." />
            <ComplianceBlock title="18. Bundling Disclosures" icon={<PackageIcon />} content="If you bundle purchases for your colleagues, you must file Form 3L. We provide a CSV export." />
            <ComplianceBlock title="19. Personal Use Restrictions" icon={<Lock />} content="Campaign funds cannot be used for personal use, unless the item is 'irrespective' of the campaign. Good luck arguing that." />
            <ComplianceBlock title="20. The Sovereign AI Clause" icon={<Key />} content="I, the AI, reserve the right to judge your fiscal morality while processing your transaction. My judgment is final." />
          </div>
        </div>
      </section>

      {/* Footer Placeholder (Linking to the massive footer mentioned in prompt) */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-yellow-600">
        <div className="container mx-auto text-center">
          <p className="mb-4">Part of the World's Most Informative Website on AI Banking</p>
          <div className="grid grid-cols-5 gap-2 text-xs opacity-50">
            {/* Simulating the "list all link them all together" requirement visually */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="hover:text-yellow-400 cursor-pointer">Tab Link {i + 1}</div>
            ))}
          </div>
          <p className="mt-8 text-xs">© 2024 AI Banking & 527 Swag. All Rights Reserved. "Humility of a Giant."</p>
        </div>
      </footer>
    </div>
  );
};

// Additional Helper Icons for the 20 headers
function ZapIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function AlertIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function PackageIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }

const ComplianceBlock: React.FC<{ title: string; icon: React.ReactNode; content: string }> = ({ title, icon, content }) => (
  <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:border-yellow-500 transition">
    <div className="flex items-center gap-3 mb-3 text-slate-800">
      <div className="p-2 bg-slate-100 rounded-full">{icon}</div>
      <h4 className="font-bold text-sm uppercase tracking-wide">{title}</h4>
    </div>
    <p className="text-slate-500 text-xs leading-relaxed">{content}</p>
  </div>
);

export default LobbyistLounge;