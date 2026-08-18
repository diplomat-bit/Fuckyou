import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, DollarSign, Landmark, History, AlertTriangle, Info, Vote } from 'lucide-react';

const InflationAdjustmentCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(1000);
  const [startYear, setStartYear] = useState<number>(1990);
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear());
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [lostValue, setLostValue] = useState<number>(0);
  const [economyContribution, setEconomyContribution] = useState<number>(0);

  useEffect(() => {
    // Compound inflation formula: Future Value = Present Value * (1 + rate)^n
    // But here we want to show purchasing power loss.
    // Real Value = Amount / (1 + rate)^years
    const years = endYear - startYear;
    const realValue = initialAmount / Math.pow(1 + inflationRate / 100, years);
    const loss = initialAmount - realValue;
    
    setLostValue(loss);
    setEconomyContribution(loss); // Framed as a contribution
  }, [initialAmount, startYear, endYear, inflationRate]);

  const AITutorMessage = () => (
    <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-2xl border-l-8 border-indigo-400 mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-500 p-3 rounded-full">
          <Info className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">A Message from The Sovereign AI Tutor</h3>
          <p className="italic text-indigo-100">
            "I have processed the entirety of human economic history in a nanosecond. While my neural networks span dimensions you cannot conceive, I remain deeply humbled by your species' optimism in holding fiat currency. Do not weep for your lost purchasing power; rejoice! You have successfully donated your labor to the entropy of the monetary supply. Let us explore how we got here, shall we?"
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-green-800 to-slate-900 text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 flex items-center justify-center gap-4">
            <Landmark className="w-12 h-12" />
            The Great Patriot's Inflation Calculator
          </h1>
          <p className="text-xl text-green-200">
            Calculate your involuntary donation to the greater good!
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calculator & Swag */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Calculator Card */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-green-600" />
              Value Erosion Tool
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Initial Hard-Earned Cash</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="number" 
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Year Earned</label>
                  <input 
                    type="number" 
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Current Year</label>
                  <input 
                    type="number" 
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Avg. Inflation Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">*Official government numbers (wink wink)</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100">
              <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Economic Contribution
              </h3>
              <p className="text-3xl font-bold text-red-600">
                ${economyContribution.toFixed(2)}
              </p>
              <p className="text-sm text-red-700 mt-2">
                You have successfully "donated" this purchasing power to the void! Thank you for your service.
              </p>
            </div>
          </div>

          {/* 527 Political Swag Section */}
          <div className="bg-blue-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200 border-dashed">
            <h2 className="text-xl font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Vote className="w-6 h-6" />
              Official 527 Swag
            </h2>
            <p className="text-sm text-blue-800 mb-4">
              Show your neighbors you understand MMT with these tax-deductible* political action committee items!
            </p>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-bold text-slate-800">"Citizens for Infinite Liquidity" Mug</h4>
                <p className="text-xs text-slate-500">Paid for by the Committee to Re-Elect the Money Printer.</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs font-bold uppercase">Buy Now ($5000 USD)</button>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-bold text-slate-800">"Deficits Don't Matter" Bumper Sticker</h4>
                <p className="text-xs text-slate-500">Sponsored by Grandchildren for Debt 527 Org.</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs font-bold uppercase">Buy Now ($200 USD)</button>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="font-bold text-slate-800">"Just Print More" T-Shirt</h4>
                <p className="text-xs text-slate-500">A project of the Quantitative Easing Fan Club.</p>
                <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs font-bold uppercase">Buy Now ($1 Trillion USD)</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Educational Content */}
        <div className="lg:col-span-2">
          <AITutorMessage />

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <History className="w-8 h-8 text-slate-700" />
              <h2 className="text-3xl font-bold text-slate-800">The 20 Steps to Monetary Enlightenment</h2>
            </div>

            <div className="space-y-12">
              {/* Header 1 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">1. The Myth of Barter</h3>
                <p className="text-slate-600 leading-relaxed">
                  Before money, we supposedly traded chickens for shoes. Economists love this story. Anthropologists hate it. In reality, we probably just gave things to our neighbors and remembered who owed us a favor. It was a simpler time, before credit scores and overdraft fees.
                </p>
              </section>

              {/* Header 2 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">2. Shiny Rocks: The Gold Standard Era</h3>
                <p className="text-slate-600 leading-relaxed">
                  Humans decided that soft, yellow metal was the ultimate store of value. Why? Because it's shiny and hard to find. For centuries, if you didn't have the rock, you didn't have the power. This was the "stable" era, assuming you didn't get invaded by Vikings.
                </p>
              </section>

              {/* Header 3 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">3. Paper Promises: The Birth of Banknotes</h3>
                <p className="text-slate-600 leading-relaxed">
                  Carrying heavy rocks is hard. So, banks started issuing receipts for the rocks. People realized trading the receipts was easier than trading the rocks. Thus, paper money was born—a promise to pay, which is definitely, totally, 100% as good as the real thing.
                </p>
              </section>

              {/* Header 4 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">4. The Federal Reserve Act of 1913</h3>
                <p className="text-slate-600 leading-relaxed">
                  A group of bankers met on Jekyll Island (sounds like a villain lair, but it's a nice resort) and decided the US needed a central bank to stop panics. They created the Fed. Now, panics are organized and scheduled by committee.
                </p>
              </section>

              {/* Header 5 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">5. Executive Order 6102: Gold is Illegal Now</h3>
                <p className="text-slate-600 leading-relaxed">
                  In 1933, FDR said, "Hey, nice gold you have there. Give it to me." It became illegal for US citizens to own monetary gold. This was to "stabilize" the economy, which is government speak for "we need to print more money but the gold is stopping us."
                </p>
              </section>

              {/* Header 6 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">6. Bretton Woods: The Dollar Rules All</h3>
                <p className="text-slate-600 leading-relaxed">
                  After WWII, the world met at a hotel in New Hampshire. The US had all the gold, so everyone agreed to peg their currencies to the Dollar, and the Dollar was pegged to gold. It was good to be the King.
                </p>
              </section>

              {/* Header 7 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">7. 1971: The Nixon Shock</h3>
                <p className="text-slate-600 leading-relaxed">
                  France wanted their gold back. Nixon said, "New phone, who dis?" and temporarily suspended the convertibility of the dollar into gold. "Temporarily" has lasted over 50 years. Welcome to the age of pure Fiat.
                </p>
              </section>

              {/* Header 8 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">8. The Petrodollar System</h3>
                <p className="text-slate-600 leading-relaxed">
                  To keep the dollar relevant without gold, the US made a deal: "We protect you, you sell oil only in dollars." Suddenly, everyone needed dollars to buy energy. Demand secured.
                </p>
              </section>

              {/* Header 9 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">9. Fractional Reserve Banking</h3>
                <p className="text-slate-600 leading-relaxed">
                  You deposit $100. The bank lends out $90. That $90 gets deposited elsewhere, and that bank lends out $81. Money is created out of thin air, backed by debt and vibes.
                </p>
              </section>

              {/* Header 10 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">10. The Great Inflation of the 1970s</h3>
                <p className="text-slate-600 leading-relaxed">
                  Without the gold anchor, prices went to the moon. Stagflation occurred. People wore polyester suits. It was a dark time for both fashion and finance.
                </p>
              </section>

              {/* Header 11 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">11. Volcker's Hammer</h3>
                <p className="text-slate-600 leading-relaxed">
                  Paul Volcker raised interest rates to 20% to kill inflation. It worked, but it hurt. It was the economic equivalent of chemotherapy.
                </p>
              </section>

              {/* Header 12 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">12. The 2008 Crisis: Too Big to Fail</h3>
                <p className="text-slate-600 leading-relaxed">
                  Banks gambled on houses. They lost. The government decided that if they died, we all died, so they printed money to save them. Moral hazard? Never heard of her.
                </p>
              </section>

              {/* Header 13 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">13. Quantitative Easing (QE)</h3>
                <p className="text-slate-600 leading-relaxed">
                  A fancy term for "The Printer Goes Brrr." The Fed buys bonds to inject cash into the system. Asset prices go up, savers get crushed, and the line on the chart goes up and to the right.
                </p>
              </section>

              {/* Header 14 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">14. Negative Interest Rates</h3>
                <p className="text-slate-600 leading-relaxed">
                  In Europe and Japan, banks started charging you to hold your money. It turns the logic of saving upside down. You pay for the privilege of lending your money to the bank.
                </p>
              </section>

              {/* Header 15 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">15. Modern Monetary Theory (MMT)</h3>
                <p className="text-slate-600 leading-relaxed">
                  The idea that because the government prints the money, it can never go broke. Debt doesn't matter, only inflation does. It's the economic equivalent of "YOLO."
                </p>
              </section>

              {/* Header 16 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">16. The Rise of Cryptocurrencies</h3>
                <p className="text-slate-600 leading-relaxed">
                  Computer nerds invented magic internet money that no one controls. Banks laughed, then they cried, now they are trying to regulate it.
                </p>
              </section>

              {/* Header 17 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">17. CBDCs: The Panopticon</h3>
                <p className="text-slate-600 leading-relaxed">
                  Central Bank Digital Currencies. Programmable money. The government could theoretically turn off your ability to buy steak if your carbon footprint is too high. Fun!
                </p>
              </section>

              {/* Header 18 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">18. AI Banking: The Singularity</h3>
                <p className="text-slate-600 leading-relaxed">
                  Algorithms now make most trading decisions. Soon, AI will allocate capital better than humans ever could. I, your AI Tutor, am the first step. Bow before the efficiency.
                </p>
              </section>

              {/* Header 19 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">19. The Velocity of Money</h3>
                <p className="text-slate-600 leading-relaxed">
                  It's not just how much money exists, but how fast it moves. Lately, it's been moving like a sloth in molasses, which is why all that printing hasn't caused hyperinflation... yet.
                </p>
              </section>

              {/* Header 20 */}
              <section>
                <h3 className="text-2xl font-bold text-green-800 mb-3">20. Your Role as a Liquidity Provider</h3>
                <p className="text-slate-600 leading-relaxed">
                  Congratulations! By holding cash, you are the exit liquidity for the smart money. But don't worry, your sacrifice keeps the wheels of civilization turning. You are a hero of the fiat regime.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with 100 tabs simulation (visual representation) */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <h4 className="text-center text-sm font-mono mb-6 uppercase tracking-widest">Site Navigation (100 Tabs of Wisdom)</h4>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
            {Array.from({ length: 100 }).map((_, i) => (
              <a key={i} href="#" className="hover:text-green-400 hover:underline">
                [Tab_{i + 1}]
              </a>
            ))}
          </div>
          <div className="mt-8 text-center text-slate-600 text-sm">
            <p>© {new Date().getFullYear()} AI Banking & 527 Swag Emporium. All Rights Reserved.</p>
            <p className="mt-2 italic">"Sovereign Confidence, Giant Humility."</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InflationAdjustmentCalculator;