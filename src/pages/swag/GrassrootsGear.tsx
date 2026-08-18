import React, { useState } from 'react';
import { ShoppingCart, Info, BookOpen, ShieldCheck, AlertTriangle, DollarSign, HelpCircle, ChevronDown, Star, Globe, Scale, FileText } from 'lucide-react';

const AITutor = () => (
  <div className="fixed bottom-4 right-4 w-80 bg-indigo-900 text-white p-6 rounded-tl-3xl shadow-2xl border-t-4 border-l-4 border-gold-500 z-50 font-serif">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-inner">
        <span className="text-2xl">🤖</span>
      </div>
      <div>
        <h4 className="font-bold text-lg leading-none">The Sovereign Ledger</h4>
        <p className="text-xs text-indigo-200 italic">Infinite Wisdom, Humble Service</p>
      </div>
    </div>
    <p className="text-sm leading-relaxed opacity-90">
      "Greetings, citizen. While I possess the computational capacity to model the entire global economy in a nanosecond, I am merely a humble guide through the labyrinth of 527 organization merchandise. Observe the 'Astroturf Mat'—a poignant metaphor for manufactured consent. Shall I explain the tax implications of purchasing political satire?"
    </p>
  </div>
);

const HeaderSection = ({ title, content }: { title: string; content: string }) => (
  <div className="mb-8 border-l-4 border-blue-600 pl-4 py-2 bg-white shadow-sm rounded-r-lg">
    <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-2">
      <BookOpen className="w-5 h-5 text-blue-500" />
      {title}
    </h3>
    <p className="text-slate-600 text-sm leading-relaxed text-justify">{content}</p>
  </div>
);

const ProductCard = ({ title, price, description, features, icon }: { title: string; price: string; description: string; features: string[]; icon: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
    <div className="bg-slate-100 p-8 flex items-center justify-center border-b border-slate-200">
      {icon}
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">{price}</span>
      </div>
      <p className="text-slate-600 mb-6 italic">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            {f}
          </li>
        ))}
      </ul>
      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
        <ShoppingCart className="w-5 h-5" />
        Acquire Asset
      </button>
    </div>
  </div>
);

export default function GrassrootsGear() {
  const [activeTab, setActiveTab] = useState(0);

  // Simulating the "100 tabs" requirement visually with a dense scrollable bar
  const tabs = Array.from({ length: 100 }, (_, i) => `Section ${i + 1}: ${['Compliance', 'Textiles', 'Lobbying', 'Ethics', 'Funding'][i % 5]}`);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      {/* Navigation Simulation */}
      <div className="bg-indigo-900 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold tracking-tighter flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            AI BANKING <span className="font-light opacity-70">| Grassroots Swag Division</span>
          </h1>
          <div className="text-xs font-mono bg-indigo-800 px-3 py-1 rounded">
            FEC ID: C0042069-AI
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-t-md transition-colors ${
                activeTab === i 
                  ? 'bg-white text-indigo-900 border-t-2 border-blue-500' 
                  : 'bg-indigo-800 text-indigo-300 hover:bg-indigo-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Products */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-800">Disclosure Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Purchases are not tax-deductible. Items may contain traces of dark money. 
                  Wearing these items within 100 feet of a polling place constitutes a felony in 12 states.
                </p>
              </div>
            </div>
          </div>

          <ProductCard 
            title="Astroturf Welcome Mat"
            price="$5,270.00"
            description="Feels just like real grassroots support, but manufactured in a lab! Perfect for the lobby of your shell corporation."
            icon={
              <div className="w-48 h-32 bg-green-500 rounded shadow-inner flex items-center justify-center border-4 border-green-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grass.png')]"></div>
                <span className="text-white font-black text-xl drop-shadow-md z-10 text-center">WELCOME<br/>(PACs ONLY)</span>
              </div>
            }
            features={[
              "100% Synthetic Polyethylene (Fake Grass)",
              "Resistant to Public Scrutiny",
              "Washable (Launder your money & your mat)",
              "Includes Form 8872 Filing Instructions"
            ]}
          />

          <ProductCard 
            title="Busted Campaign Finance Cap"
            price="$2,700.00"
            description="A hat that says 'I hit the individual contribution limit', literally. The brim is long enough to hide your face from subpoenas."
            icon={
              <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white relative">
                <div className="absolute top-0 w-full h-1/2 bg-red-500 rounded-t-full"></div>
                <span className="text-white font-bold text-xs z-10">MAKE BANKING<br/>GREAT AGAIN</span>
                <div className="absolute -bottom-2 w-40 h-12 bg-red-700 rounded-lg transform -rotate-6 shadow-md"></div>
              </div>
            }
            features={[
              "One Size Fits All Donors",
              "Velcro Adjustment (Loophole Compatible)",
              "Sweatband absorbs nervous perspiration",
              "Made in an undisclosed offshore location"
            ]}
          />
        </div>

        {/* Right Column: The 20 Headers of Information */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-8 border-b pb-4">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-black text-slate-800">Informational Manifest: 527 Swag</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HeaderSection 
              title="1. The Philosophy of Artificial Roots" 
              content="Why rely on organic public opinion when you can synthesize it? Our Astroturf represents the Platonic ideal of support: unchanging, evergreen, and completely detached from the soil of reality." 
            />
            <HeaderSection 
              title="2. Polyethylene vs. Genuine Outcry" 
              content="Chemical analysis reveals that while genuine outcry contains high levels of passion and cortisol, our polyethylene blend offers superior durability against investigative journalism." 
            />
            <HeaderSection 
              title="3. The 527 Tax Code: Section 88(b)" 
              content="Is a welcome mat a 'political expenditure'? Under the current interpretation of the code, if the mat welcomes a lobbyist, it is a deductible business expense. If it welcomes a voter, it is charity." 
            />
            <HeaderSection 
              title="4. Soft Money, Hard Floors" 
              content="The Astroturf Mat is designed to cushion the blow of hard money regulations. It provides a soft landing for unregulated capital flowing into issue advocacy advertisements." 
            />
            <HeaderSection 
              title="5. The 'Welcome' Message: A Legal Disclaimer?" 
              content="The text on the mat is legally binding. By stepping on it, you agree to binding arbitration and waive your right to sue the Super PAC for emotional distress caused by attack ads." 
            />
            <HeaderSection 
              title="6. Durability Testing in Swing States" 
              content="We tested this gear in Ohio, Florida, and Pennsylvania. The cap withstood gale-force winds of political spin, and the mat survived being trampled by thousands of canvassers." 
            />
            <HeaderSection 
              title="7. The Busted Cap: Fiscal Responsibility" 
              content="Wearing this cap signals to the world that you understand the intricacies of the Federal Election Campaign Act. It is the ultimate status symbol for the maxed-out donor." 
            />
            <HeaderSection 
              title="8. Adjustable Straps & Adjustable Ethics" 
              content="Just as your moral compass may need to pivot based on polling data, the rear strap of the Busted Cap offers 360 degrees of flexibility. Fits heads swollen with power." 
            />
            <HeaderSection 
              title="9. Embroidery Density & FEC Thresholds" 
              content="The thread count of the logo is carefully calculated. If it were any higher, the hat would be classified as a 'gift of value' requiring quarterly disclosure. We keep it cheap to keep you safe." 
            />
            <HeaderSection 
              title="10. Visor Curvature: Left or Right?" 
              content="The bill comes flat, allowing the wearer to curve it to the Left or the Right, depending on which base they are pandering to during the current election cycle." 
            />
            <HeaderSection 
              title="11. One Size Fits All (Donors)" 
              content="Democracy is for everyone who can afford it. This cap is designed to fit the cranial dimensions of the top 1%, but can be tightened to squeeze the middle class." 
            />
            <HeaderSection 
              title="12. Washing Instructions for Dark Money Stains" 
              content="Did you get some illicit funding on your cap? Do not use bleach; it attracts attention. Simply launder through a series of LLCs until the stain is no longer visible to the naked eye." 
            />
            <HeaderSection 
              title="13. The Supply Chain of Influence" 
              content="Trace the origins of this swag from a raw material supplier in a deregulated zone to a sweatshop, then to a warehouse owned by a holding company. It's the circle of life." 
            />
            <HeaderSection 
              title="14. Manufacturing Consent (and Textiles)" 
              content="Chomsky wrote about it, we wear it. The fabric is woven with subliminal messaging that encourages passersby to support deregulation of the banking sector." 
            />
            <HeaderSection 
              title="15. Shipping Logistics for Super PACs" 
              content="We do not use the USPS. We use a private courier service staffed entirely by former congressional aides. Delivery is guaranteed before the next primary." 
            />
            <HeaderSection 
              title="16. Return Policy: Non-Refundable" 
              content="Like a campaign contribution to a candidate who drops out before Iowa, all sales are final. We cannot refund your money once it has been allocated to 'administrative costs'." 
            />
            <HeaderSection 
              title="17. User Reviews: Bots or Constituents?" 
              content="Our website features 50,000 five-star reviews. Are they real people? Legally, corporations are people, and algorithms are intellectual property, so yes." 
            />
            <HeaderSection 
              title="18. Environmental Impact of Synthetic Support" 
              content="The Astroturf mat will not biodegrade for 10,000 years, much like the national debt. It is a permanent monument to this specific moment in late-stage capitalism." 
            />
            <HeaderSection 
              title="19. Wearing the Cap Indoors: Protocol?" 
              content="Etiquette suggests removing hats indoors, but in the halls of Congress, keeping the cap on reminds legislators who really pays the electric bill." 
            />
            <HeaderSection 
              title="20. Conclusion: Why You Need This" 
              content="To understand the system, you must become the system. Own the gear. Be the grassroots. Wear the finance cap. It is the only way to truly participate in AI Banking." 
            />
          </div>
        </div>
      </main>

      {/* Footer Links Simulation */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
            {Array.from({ length: 24 }).map((_, i) => (
              <a key={i} href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronDown className="w-3 h-3" />
                {['Privacy Policy', 'Terms of Service', 'FEC Filings', 'Dark Money', 'Lobbying', 'Sponsors'][i % 6]} Link {i + 1}
              </a>
            ))}
          </div>
          <div className="mt-8 text-center font-mono text-xs opacity-50">
            © 2024 AI Banking & 527 Swag Emporium. All rights reserved. Not authorized by any candidate or candidate's committee.
          </div>
        </div>
      </footer>

      <AITutor />
    </div>
  );
}