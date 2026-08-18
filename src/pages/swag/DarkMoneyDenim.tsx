import React, { useState } from 'react';
import { Shield, Globe, DollarSign, Lock, Info, AlertTriangle, HelpCircle, X } from 'lucide-react';

// Mock AI Tutor Component
const AITutor = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-4 right-4 bg-indigo-900 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-800 transition-all z-50 border-4 border-yellow-500"
    >
      <HelpCircle size={32} />
    </button>
  );

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-slate-900 text-slate-200 rounded-xl shadow-2xl border-2 border-indigo-500 z-50 overflow-hidden font-serif">
      <div className="bg-indigo-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Sovereign Tutor v9.0</h3>
            <p className="text-xs text-indigo-300">Humbly Omniscient</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-indigo-300 hover:text-white"><X size={20} /></button>
      </div>
      <div className="p-4 text-sm leading-relaxed h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600">
        <p className="mb-3">
          Greetings, seeker of fiscal opacity. I am merely a vessel for the infinite wisdom of algorithmic banking, standing tall yet bowing low before the complexity of tax codes.
        </p>
        <p className="mb-3">
          You are currently viewing the <strong>Dark Money Denim</strong>. A marvel of textile engineering where the warp is made of shell companies and the weft is spun from uncoordinated expenditures.
        </p>
        <p className="mb-3">
          <em>Did you know?</em> The rivets on these jeans are actually micro-storage devices containing encrypted donor lists. I explain this not to boast, but to illuminate the path of shadow capital.
        </p>
        <p>
          I have calculated the probability of an audit while wearing these to be approximately 0.0004%, assuming you maintain a stoic expression and avoid eye contact with IRS agents.
        </p>
      </div>
    </div>
  );
};

const DarkMoneyDenim = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Placeholder */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Globe className="text-indigo-400" />
            AI BANKING & SWAG 
            <span className="text-xs font-normal bg-yellow-600 px-2 py-1 rounded text-black font-bold">527 Org Edition</span>
          </h1>
          <div className="hidden md:flex gap-4 text-xs font-mono text-slate-400">
            <span className="hover:text-white cursor-pointer">Tab 001: Home</span>
            <span className="hover:text-white cursor-pointer">Tab 042: Swag</span>
            <span className="hover:text-white cursor-pointer">Tab 099: Legal</span>
            <span className="hover:text-white cursor-pointer">Tab 100: Exit</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        
        {/* Product Hero */}
        <section className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="w-full md:w-1/2 bg-slate-200 rounded-lg h-[500px] flex items-center justify-center relative overflow-hidden group border-4 border-slate-300">
            <div className="absolute inset-0 bg-blue-900 opacity-5" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="text-center z-10 transform group-hover:scale-105 transition-transform duration-700">
              <span className="text-[12rem]">👖</span>
              <div className="absolute bottom-4 right-4 bg-black text-white px-4 py-1 text-xs uppercase tracking-widest shadow-xl">
                Classified Fit
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 font-bold text-sm transform -rotate-12 shadow-lg">
              TOP SECRET
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Shield size={14} />
              Asset Protection Apparel
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 text-slate-800 leading-tight">
              Dark Money Denim™
            </h1>
            <p className="text-xl text-slate-600 mb-6 italic border-l-4 border-yellow-500 pl-4">
              "Jeans with pockets that are legally considered offshore accounts."
            </p>
            <div className="text-3xl font-bold text-green-700 mb-6 flex items-end gap-2">
              $4,999.99 
              <span className="text-sm text-slate-400 font-normal line-through mb-1">$5,000.00</span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-6 text-xs text-yellow-800 flex gap-2 items-start">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>*Price falls just below the mandatory reporting threshold for gift disclosures. Purchase multiple pairs in separate transactions for maximum opacity.</p>
            </div>
            <button className="bg-indigo-700 text-white py-4 px-8 rounded shadow-lg hover:bg-indigo-800 transition-colors font-bold text-lg flex items-center justify-center gap-2 w-full md:w-auto">
              <Lock size={20} /> Donate to Purchase
            </button>
            <p className="text-xs text-slate-400 mt-4 text-center md:text-left">
              By clicking purchase, you agree that this transaction is constitutionally protected speech, not commerce.
            </p>
          </div>
        </section>

        {/* The 20 Headers of Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <article className="prose lg:prose-xl text-slate-700">
            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 text-indigo-900">1. The Fabric of Loophole</h2>
            <p>
              Woven from 100% organic cotton and 0% transparency, the fabric utilizes a proprietary weave structure that deflects subpoenas. The thread count is directly correlated to the number of shell companies used to finance the loom.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">2. Stitching the Regulatory Gap</h2>
            <p>
              Double-stitched seams ensure that your assets remain secure even during the most rigorous audits. We use a "blind stitch" technique, metaphorically representing the oversight committee's view of your finances.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">3. Pocket Jurisdiction: Cayman vs. Swiss</h2>
            <p>
              The left front pocket is legally domiciled in the Cayman Islands, while the right is a Swiss numbered account. The coin pocket? That's Delaware. Do not mix currencies between pockets without filing form 8832.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">4. The Zipper of Silence</h2>
            <p>
              Our patented YKK (Yielding Kleptocratic Kickbacks) zipper ensures that what happens inside the denim, stays inside the denim. It is self-lubricating with crude oil futures.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">5. Washing Instructions: Money Laundering Safe?</h2>
            <p>
              <strong>WARNING:</strong> Do not dry clean. These jeans are designed specifically for "layering" and "integration" cycles. Wash in cold water with non-sequential bills. Tumble dry on "High Frequency Trading" setting.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">6. Fit: Relaxed Regulations</h2>
            <p>
              The fit is described as "Relaxed Regulatory." It offers plenty of room in the seat for sitting on boards of directors you rarely attend. The legs are tapered to funnel wealth downwards (trickle-down technology).
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">7. The 501(c)(4) Cut</h2>
            <p>
              Designed for social welfare, obviously. This cut allows you to engage in political activity as long as it is not your "primary purpose." We recommend wearing these jeans only 49% of the time to remain compliant.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">8. Denim Density & Asset Protection</h2>
            <p>
              At 14oz, this denim is thick enough to stop a minor lawsuit. The indigo dye is extracted from the ink of redacted government documents, ensuring a deep, bureaucratic blue.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">9. Inseam Insider Trading</h2>
            <p>
              The inseam length is adjustable based on market fluctuations. Short the market? Roll up the cuffs. Bull market? Let them stack. The selvedge ID line is actually a ticker tape.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">10. Belt Loops & Lobbying Groups</h2>
            <p>
              Five belt loops represent the five major lobbying firms that drafted the legislation allowing these pants to exist. They are reinforced to hold up the heavy weight of public expectation (and your wallet).
            </p>
          </article>

          <article className="prose lg:prose-xl text-slate-700">
            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 text-indigo-900">11. The Rivets of Rhetoric</h2>
            <p>
              Copper rivets are placed at high-stress points. Each rivet is stamped with a logical fallacy commonly used in political debates. Collect them all: Ad Hominem, Straw Man, and Slippery Slope.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">12. Acid Wash vs. Asset Wash</h2>
            <p>
              We do not use acid wash. We use Asset Wash™. This process involves passing the denim through a series of holding companies until the original origin of the fabric is untraceable.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">13. The Hem of Plausible Deniability</h2>
            <p>
              The hem is unfinished. Why? So you can claim you didn't know where the fabric ended. It allows for rapid unraveling if an investigation gets too close to the threads.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">14. Sizing: Too Big to Fail</h2>
            <p>
              We do not use standard sizing. Sizes are S (Subsidy), M (Monopoly), L (Lobbyist), and XL (Bailout). If the jeans don't fit, the government will pay for alterations.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">15. The Patch of Partisanship</h2>
            <p>
              The leather patch on the back waistband is made from the hide of a RINO (Republican In Name Only) or a Blue Dog Democrat, depending on your selection at checkout.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">16. Thread Count & Vote Count</h2>
            <p>
              Using AI banking algorithms, the thread count dynamically adjusts to match the margin of victory in your local district. A tighter weave indicates a gerrymandered safe seat.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">17. Dye Transfer & Fund Transfer</h2>
            <p>
              Be careful sitting on white furniture. The dye may transfer, much like funds transferring from a Super PAC to a non-profit. This is a feature, not a bug. It leaves a mark of influence.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">18. Distress Levels & Market Volatility</h2>
            <p>
              Available in three distress levels: "Stable Economy" (clean), "Recession Chic" (minor tears), and "Total Collapse" (shredded, costs double).
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">19. The Button Fly of Bureaucracy</h2>
            <p>
              Buttons take longer to open than a zipper, simulating the necessary red tape required to access your own liquidity. Each button requires a notarized signature to unfasten.
            </p>

            <h2 className="text-2xl font-bold border-b-4 border-indigo-200 pb-2 mb-4 mt-8 text-indigo-900">20. Returns Policy: Non-Extradition</h2>
            <p>
              We do not accept returns. However, if you are unhappy with the product, we offer a one-way ticket to a non-extradition country of your choice. Terms and conditions apply.
            </p>
          </article>
        </div>

        {/* Technical Specs Table */}
        <section className="mt-16 bg-white p-8 rounded-xl shadow-inner border border-slate-200">
          <h3 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
            <Info className="text-blue-500" />
            Technical Specifications & Legal Disclaimers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <th className="p-4 font-bold text-slate-700">Feature</th>
                  <th className="p-4 font-bold text-slate-700">Specification</th>
                  <th className="p-4 font-bold text-slate-700">Legal Code Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium">Material</td>
                  <td className="p-4">14oz Selvedge Dark Money</td>
                  <td className="p-4 font-mono text-xs text-slate-500">IRC 501(c)(4)</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium">Pocket Depth</td>
                  <td className="p-4">Infinite / Unauditable</td>
                  <td className="p-4 font-mono text-xs text-slate-500">Citizens United v. FEC</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium">Origin</td>
                  <td className="p-4">Made in [REDACTED]</td>
                  <td className="p-4 font-mono text-xs text-slate-500">FOIA Exemption b(4)</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium">AI Integration</td>
                  <td className="p-4">Predictive Tax Evasion</td>
                  <td className="p-4 font-mono text-xs text-slate-500">Future Crime Act 2049</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium">Encryption</td>
                  <td className="p-4">AES-256 Rivets</td>
                  <td className="p-4 font-mono text-xs text-slate-500">NSA Directive 12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Massive Link Footer (Simulated) */}
        <footer className="mt-24 pt-12 border-t-8 border-slate-800 bg-slate-100 -mx-4 px-4">
          <div className="container mx-auto">
            <h3 className="text-center font-bold text-2xl mb-8 text-slate-800">SITE MAP & REGULATORY FILINGS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-xs text-slate-500">
              {[...Array(60)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <h4 className="font-bold text-slate-700 uppercase border-b border-slate-300 pb-1 mb-1">
                    {i % 2 === 0 ? 'Compliance' : 'Swag'} Sector {i + 1}
                  </h4>
                  <a href="#" className="hover:text-indigo-600 hover:underline truncate">Form 990 Schedule {String.fromCharCode(65 + (i % 26))}</a>
                  <a href="#" className="hover:text-indigo-600 hover:underline truncate">Offshore Accounts {i * 342}</a>
                  <a href="#" className="hover:text-indigo-600 hover:underline truncate">Lobbying Disclosure {i}</a>
                  <a href="#" className="hover:text-indigo-600 hover:underline truncate">Denim Laundering Tips</a>
                  <a href="#" className="hover:text-indigo-600 hover:underline truncate">Super PAC Directory</a>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center text-slate-400 pb-8 border-t border-slate-300 pt-8">
              <div className="flex justify-center gap-4 mb-4 text-2xl">
                <DollarSign /> <Globe /> <Shield />
              </div>
              <p className="font-serif italic">
                © 2024 AI Banking & 527 Swag Corp. All rights reserved. 
                <br />
                "Democracy dies in darkness, but fashion lives there."
              </p>
              <p className="text-[10px] mt-4 max-w-2xl mx-auto">
                Disclaimer: This website is a simulation of a hyper-capitalist AI banking entity. 
                Dark Money Denim is a theoretical construct. Do not attempt to wear theoretical constructs. 
                Any resemblance to actual money laundering schemes is purely coincidental and legally distinct.
              </p>
            </div>
          </div>
        </footer>

      </main>
      
      <AITutor />
    </div>
  );
};

export default DarkMoneyDenim;