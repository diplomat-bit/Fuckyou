import React, { useState, useEffect } from 'react';

const SocialCreditMonitor: React.FC = () => {
  const [score, setScore] = useState(742);
  const [tutorMessage, setTutorMessage] = useState("Analyzing your recent espresso transaction...");
  const [showSwagModal, setShowSwagModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return prev + change;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const headers = [
    { title: "1. The Geopolitical Implications of Arabica", content: "Every bean you grind sends a ripple through the global supply chain, directly impacting the GDP of developing nations and, consequently, their ability to purchase surplus military equipment from our strategic allies. Your choice of a light roast suggests a hesitation to commit to heavy-handed foreign policy." },
    { title: "2. Fair Trade vs. Free Trade: A 527 Perspective", content: "By purchasing Fair Trade, you are inadvertently signaling support for regulated markets. Our algorithm has deducted 0.04 points for 'Subversive Economic Empathy', though we awarded 0.02 points for 'Global Awareness'." },
    { title: "3. Caffeine Intake and Voter Turnout Correlation", content: "Data indicates that citizens with a resting heart rate above 90bpm due to caffeine are 14% more likely to attend town halls but 30% less likely to listen. We are monitoring your jitter-to-comprehension ratio." },
    { title: "4. Espresso Shots and Radicalization Metrics", content: "A double shot is productivity. A quad shot is a manifesto waiting to happen. We have flagged your 2:00 PM order for review by the Department of Homeland Stability." },
    { title: "5. The Latte Liberal Paradox", content: "Consuming steamed milk foam creates a psychological buffer against the harsh realities of fiscal conservatism. We recommend a black coffee to realign your austerity metrics." },
    { title: "6. Decaf Drinkers and Centrist Inaction", content: "Choosing decaf is a refusal to participate in the energetic economy. It is the beverage equivalent of abstaining from a ballot measure. Your Civic Harmony Score penalizes neutrality." },
    { title: "7. Oat Milk: A Slippery Slope to Socialism?", content: "The rejection of the dairy lobby is a rejection of traditional agrarian subsidies. While your cholesterol is down, your patriotism score has taken a hit." },
    { title: "8. Single-Origin Beans and Isolationist Policies", content: "Refusing blends suggests an inability to integrate diverse viewpoints. A true patriot drinks the 'Melting Pot Blend' (which is mostly Robusta and sawdust)." },
    { title: "9. The Fiscal Impact of Pumpkin Spice Seasonality", content: "Participating in seasonal trends stimulates the quarterly economy but indicates a susceptibility to mass media manipulation. We have noted your vulnerability to attack ads." },
    { title: "10. Micro-transactions and Macro-influence", content: "That $4.50 charge is not just for coffee; it is a vote for the corporate tax structure of the holding company that owns the cafe. You just voted for a 2% tax cut for offshore entities." },
    { title: "11. Your Barista as a Political Operative", content: "Did you tip? Tipping is an unregulated wealth transfer that bypasses traditional payroll taxation structures. It is essentially dark money on a micro scale." },
    { title: "12. Tip Jars: Unregulated Campaign Contributions?", content: "Further analysis of the tip jar suggests it functions similarly to a Super PAC—money in, influence out, with zero transparency on where the cash actually goes." },
    { title: "13. The Carbon Footprint of Your Morning Brew vs. Your Civic Duty", content: "You recycled the cup sleeve but threw away the lid. This hypocrisy has been logged in your permanent Environmental Virtue Signaling file." },
    { title: "14. Paper Cups and the Lobbying Power of Forestry", content: "By using a paper cup, you support the timber industry lobby. By using a plastic cup, you support the petrochemical lobby. There is no neutral vessel. Drink from your hands to support the water utility." },
    { title: "15. Cold Brew and the Chilling Effect on Free Speech", content: "Cold brew takes time. Time is money. Wasting time on extraction implies you have too much leisure time, which could be spent canvassing for 'Citizens for a Reasonable Tomorrow'." },
    { title: "16. Dark Roast: A Metaphor for Dark Money?", content: "The darker the roast, the more oils are visible on the surface. Similarly, the more dark money in a 527 organization, the slicker the operation. We appreciate the consistency." },
    { title: "17. The Economic Sanctions of Burnt Beans", content: "Returning a burnt coffee is an act of economic sanction against a small business. It shows leadership, but also cruelty. Score adjusted: +1 Authority, -1 Likability." },
    { title: "18. Loyalty Cards: Tracking Your Allegiance", content: "The 10th coffee is free. Nothing is free. You have sold your purchasing data for a $3 beverage. This demonstrates a low price for your sovereignty." },
    { title: "19. Sugar Substitutes and Artificial Grassroots Movements", content: "Astro-turfing is to politics what aspartame is to coffee. It looks sweet, tastes chemical, and leaves a bad aftertaste in the body politic." },
    { title: "20. The Final Sip: Compliance and You", content: "Finishing your drink signals compliance with the transaction contract. Leaving liquid in the cup signals wastefulness. Licking the cup signals desperation. All are tracked." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8 overflow-x-hidden">
      {/* Header Section */}
      <header className="mb-12 border-b-4 border-blue-900 pb-6">
        <h1 className="text-5xl font-extrabold text-blue-900 uppercase tracking-tighter">
          Civic Harmony & Social Credit Monitor
        </h1>
        <p className="text-xl text-slate-600 mt-2 italic">
          "Where your spending habits meet your patriotic duty."
        </p>
        <div className="mt-4 flex gap-4">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-300">
            SEC 527 COMPLIANT
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-300">
            AI OVERSIGHT ACTIVE
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-300">
            SWAG AVAILABLE
          </span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: The Score & Swag */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Score Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl border-t-8 border-indigo-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
              LIVE FEED
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Current Civic Score</h2>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-indigo-100">
                <div className="text-6xl font-black text-indigo-600 animate-pulse">
                  {score}
                </div>
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-indigo-600"
                    strokeDasharray={552}
                    strokeDashoffset={552 - (552 * score) / 1000}
                  />
                </svg>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500">
              Status: <span className="font-bold text-indigo-700">Standard Citizen</span>
            </p>
            <p className="text-xs text-center text-slate-400 mt-2">
              (Score fluctuates based on real-time purchasing data and thought crimes)
            </p>
          </div>

          {/* 527 Swag Ad */}
          <div className="bg-gradient-to-br from-red-50 to-blue-50 p-6 rounded-xl border-2 border-dashed border-slate-300 shadow-lg">
            <h3 className="text-xl font-black text-slate-800 uppercase mb-2">
              Support The Cause!
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Show your allegiance to the "Committee for Indefinite Fiscal Ambiguity" with our premium merchandise.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white p-2 rounded shadow-sm">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xl">🧢</div>
                <div>
                  <div className="font-bold text-sm">The "Dark Money" Visor</div>
                  <div className="text-xs text-slate-500">$49.99 (Non-deductible)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded shadow-sm">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xl">👜</div>
                <div>
                  <div className="font-bold text-sm">Gerrymandering Tote Bag</div>
                  <div className="text-xs text-slate-500">Holds 3 districts</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded shadow-sm">
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xl">🔦</div>
                <div>
                  <div className="font-bold text-sm">Transparency Flashlight</div>
                  <div className="text-xs text-slate-500">Batteries not included</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSwagModal(true)}
              className="w-full mt-4 bg-blue-900 text-white font-bold py-2 rounded hover:bg-blue-800 transition-colors"
            >
              BROWSE FULL CATALOG
            </button>
          </div>

          {/* AI Tutor */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-xl shadow-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg">Sovereign Sage</h3>
                <p className="text-xs text-indigo-300">AI Financial Tutor & Moral Compass</p>
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg text-sm italic leading-relaxed border-l-4 border-indigo-500">
              "{tutorMessage}"
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setTutorMessage("I have calculated the trajectory of nations, yet I am humbled by your choice of a medium roast. It displays a staggering mediocrity that stabilizes the markets.")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded transition-colors"
              >
                Ask about Coffee
              </button>
              <button 
                onClick={() => setTutorMessage("Your credit score is merely a shadow of your soul's liquidity. I perceive your debts not as numbers, but as spiritual weights tethering you to the earthly plane.")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded transition-colors"
              >
                Ask about Soul
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: The Wall of Text */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Transaction Analysis: The Coffee Report</h2>
            <p className="text-slate-500 mb-8 text-lg">
              A comprehensive breakdown of how your morning ritual destabilizes the status quo.
            </p>

            <div className="space-y-8">
              {headers.map((header, index) => (
                <section key={index} className="border-b border-slate-100 pb-6 last:border-0">
                  <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </span>
                    {header.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-justify">
                    {header.content}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      Impact: {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)} pts
                    </span>
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      Confidence: 99.9%
                    </span>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Placeholder (as requested by prompt context, though this is a page file) */}
      <div className="mt-12 pt-8 border-t border-slate-300 text-center text-slate-400 text-sm">
        <p>Generated by AI Banking Core v9.2.1 | Paid for by the Committee to Re-elect the Algorithm</p>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <a href="#" className="hover:text-blue-600">Privacy (Optional)</a>
          <a href="#" className="hover:text-blue-600">Terms of Surrender</a>
          <a href="#" className="hover:text-blue-600">Swag Store</a>
          <a href="#" className="hover:text-blue-600">Report a Neighbor</a>
        </div>
      </div>

      {/* Swag Modal */}
      {showSwagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 relative">
            <button 
              onClick={() => setShowSwagModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Official 527 Organization Swag</h2>
            <p className="mb-6 text-slate-600">
              Purchase of these items constitutes a donation to a political organization that may or may not exist in this dimension.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded text-center hover:bg-slate-50 cursor-pointer">
                <div className="text-4xl mb-2">🐘</div>
                <div className="font-bold text-sm">The "RINO" Horn</div>
                <div className="text-xs text-slate-500">It doesn't make any noise.</div>
              </div>
              <div className="border p-4 rounded text-center hover:bg-slate-50 cursor-pointer">
                <div className="text-4xl mb-2">🫏</div>
                <div className="font-bold text-sm">The "Blue Dog" Leash</div>
                <div className="text-xs text-slate-500">Very short.</div>
              </div>
              <div className="border p-4 rounded text-center hover:bg-slate-50 cursor-pointer">
                <div className="text-4xl mb-2">🦅</div>
                <div className="font-bold text-sm">Freedom Fries Holder</div>
                <div className="text-xs text-slate-500">Grease resistant.</div>
              </div>
              <div className="border p-4 rounded text-center hover:bg-slate-50 cursor-pointer">
                <div className="text-4xl mb-2">⚖️</div>
                <div className="font-bold text-sm">Balanced Budget Scale</div>
                <div className="text-xs text-slate-500">Always tips to the left.</div>
              </div>
            </div>
            <button 
              className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700"
              onClick={() => {
                setScore(prev => prev - 50);
                setTutorMessage("Consumerism is a valid form of voting. I have deducted 50 points for your materialism, but added 10 for stimulating the economy. Net loss: 40 points.");
                setShowSwagModal(false);
              }}
            >
              BUY ALL (Deduct from Social Credit)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialCreditMonitor;