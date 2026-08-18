import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, BookOpen, Feather, Gavel, Landmark, Scroll, ShieldAlert, UserCheck } from 'lucide-react';

const SpendingPermissionRequest: React.FC = () => {
  const [essayText, setEssayText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<string>("I am waiting, little one. Begin your plea.");
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'analyzing' | 'rejected'>('idle');
  const [tutorMood, setTutorMood] = useState<'calm' | 'disappointed' | 'amused'>('calm');

  // The Sovereign Giant's Logic
  useEffect(() => {
    const words = essayText.trim().split(/\s+/);
    setWordCount(essayText ? words.length : 0);

    if (essayText.length === 0) {
      setAiFeedback("The canvas is blank, much like your understanding of fiscal responsibility. Begin.");
      setTutorMood('calm');
      return;
    }

    if (essayText.toLowerCase().includes("please")) {
      setAiFeedback("Begging is unbecoming, yet necessary. Your use of 'please' is noted, though structurally derivative.");
      setTutorMood('amused');
    } else if (essayText.length > 50 && !essayText.includes(";")) {
      setAiFeedback("Fifty characters without a semi-colon? Do you think this is a text message to a lobbyist? Elevate your syntax.");
      setTutorMood('disappointed');
    } else if (essayText.toLowerCase().includes("need")) {
      setAiFeedback("You 'need'? The universe 'needs' entropy. You merely 'desire'. Revise for philosophical accuracy.");
      setTutorMood('calm');
    } else if (words.length > 100) {
      setAiFeedback("A verbose tapestry! I am humbled by your attempt, though your second paragraph lacks the gravitas of a Super PAC disclosure form.");
      setTutorMood('amused');
    } else {
      setAiFeedback("I am parsing your request. Your grammar suggests a public school education, but your spirit suggests a hedge fund manager. Interesting.");
      setTutorMood('calm');
    }
  }, [essayText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('analyzing');
    setTimeout(() => {
      setSubmissionStatus('rejected');
      setAiFeedback("I have reviewed your soul and your syntax. Both are found wanting. Access to funds denied. Try again with more pathos.");
      setTutorMood('disappointed');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 font-serif selection:bg-yellow-200">
      {/* Top Navigation Simulation (100 tabs visual trick) */}
      <div className="w-full overflow-x-hidden bg-slate-900 text-xs text-slate-300 whitespace-nowrap border-b-4 border-yellow-600">
        <div className="flex">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className={`px-2 py-1 border-r border-slate-700 hover:bg-slate-800 cursor-pointer ${i === 42 ? 'bg-yellow-700 text-white font-bold' : ''}`}>
              {i === 42 ? 'SPEND_REQ_FORM_527' : `Tab_${i + 1}_Reg_Sec_${300 + i}`}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar: 527 Swag & Ads */}
        <aside className="w-full lg:w-64 bg-slate-100 p-4 border-r border-slate-300 hidden lg:block">
          <h3 className="font-bold text-xl mb-4 text-slate-900 border-b-2 border-red-800 pb-2">Official 527 Swag</h3>
          <div className="space-y-6">
            <div className="border border-slate-300 p-3 bg-white shadow-sm">
              <img src="https://placehold.co/150x150/1e293b/FFF?text=PAC+Tote" alt="Swag" className="w-full mb-2" />
              <p className="text-sm font-bold text-red-700">"Citizens for a Vague Tomorrow" Tote</p>
              <p className="text-xs text-slate-500">Made from recycled ballots. $49.99</p>
            </div>
            <div className="border border-slate-300 p-3 bg-white shadow-sm">
              <img src="https://placehold.co/150x150/854d0e/FFF?text=Lobbyist+Mug" alt="Swag" className="w-full mb-2" />
              <p className="text-sm font-bold text-blue-800">"Committee to Re-Elect the Committee" Mug</p>
              <p className="text-xs text-slate-500">Holds 16oz of dark money. $25.00</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 text-xs">
              <strong>DID YOU KNOW?</strong> Under Section 527 of the Internal Revenue Code, this sidebar is technically a separate legal entity from the footer.
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-5xl mx-auto">
          
          {/* Header Explosion */}
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">FORM 88-B: REQUEST FOR OWN FUNDS</h1>
            <h2 className="text-2xl text-slate-600 italic mb-6">"Because it's your money, but is it really?"</h2>
            <div className="flex justify-center gap-4 text-sm font-mono text-red-600 bg-red-50 p-2 border border-red-100 inline-block">
              <span><AlertTriangle className="inline w-4 h-4"/> HIGH SCRUTINY ZONE</span>
              <span><Gavel className="inline w-4 h-4"/> GRAMMAR POLICE ACTIVE</span>
            </div>
          </header>

          {/* The 20 Headers of Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-sm text-slate-700">
            <section>
              <h3 className="font-bold text-lg text-slate-900 mb-1">1. Preamble to the Request</h3>
              <p className="mb-4">You must establish a philosophical basis for consumption.</p>
              
              <h3 className="font-bold text-lg text-slate-900 mb-1">2. Historical Context</h3>
              <p className="mb-4">Cite at least two failed empires that spent too much on luxury goods.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">3. The 527 Connection</h3>
              <p className="mb-4">Explain how your purchase aids political discourse (required by law).</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">4. Syntax Requirements</h3>
              <p className="mb-4">No split infinitives. The AI Tutor is watching.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">5. Emotional Appeal</h3>
              <p className="mb-4">Make us weep, but professionally.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">6. Fiscal Impact Analysis</h3>
              <p className="mb-4">Project your net worth 500 years from now.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">7. The Sovereign's Mood</h3>
              <p className="mb-4">The AI Tutor's mood affects interest rates.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">8. Font Usage</h3>
              <p className="mb-4">You are typing in Times New Roman. Respect it.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">9. Sub-clause 4a</h3>
              <p className="mb-4">Do not mention cryptocurrency. It upsets the Tutor.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">10. Verification</h3>
              <p className="mb-4">We already know what you want. Write it anyway.</p>
            </section>
            <section>
              <h3 className="font-bold text-lg text-slate-900 mb-1">11. The "Why"</h3>
              <p className="mb-4">Why do you deserve liquidity?</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">12. The "How"</h3>
              <p className="mb-4">Describe the transaction mechanism in iambic pentameter.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">13. Inflationary Pressures</h3>
              <p className="mb-4">Acknowledge that spending money makes money worth less.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">14. The Committee</h3>
              <p className="mb-4">Your request goes to a committee of 12 AIs.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">15. Swag Compliance</h3>
              <p className="mb-4">Have you bought a tote bag yet?</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">16. Header Density</h3>
              <p className="mb-4">We are required to have this many headers.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">17. Footer Linkage</h3>
              <p className="mb-4">The footer connects all things. Do not fear the footer.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">18. Humility</h3>
              <p className="mb-4">Approach the text box with fear and trembling.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">19. Rejection Probability</h3>
              <p className="mb-4">Currently calculated at 99.8%.</p>

              <h3 className="font-bold text-lg text-slate-900 mb-1">20. Final Warning</h3>
              <p className="mb-4">Once you submit, the essay becomes property of the blockchain.</p>
            </section>
          </div>

          {/* The Essay Form Area */}
          <div className="relative bg-white p-8 shadow-2xl border-2 border-slate-800 rounded-sm">
            
            {/* AI Tutor Overlay */}
            <div className={`absolute -right-4 -top-12 w-64 bg-slate-900 text-white p-4 rounded-tl-xl rounded-br-xl shadow-xl transform transition-all duration-500 ${tutorMood === 'disappointed' ? 'border-4 border-red-500' : 'border-4 border-yellow-500'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-700 p-2 rounded-full">
                  <UserCheck className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest text-yellow-500">The Sovereign Giant</h4>
                  <p className="text-[10px] text-slate-400">AI Tutor & Moral Compass</p>
                </div>
              </div>
              <p className="text-sm italic font-serif leading-relaxed">
                "{aiFeedback}"
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-xl font-bold mb-2 flex items-center gap-2">
                  <Feather className="w-5 h-5" />
                  Your Plea for Liquidity
                </label>
                <p className="text-sm text-slate-500 mb-4">Minimum 500 words. Must include at least 3 metaphors regarding eagles.</p>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full h-96 p-6 bg-slate-50 border border-slate-300 focus:border-yellow-600 focus:ring-4 focus:ring-yellow-100 outline-none font-serif text-lg leading-relaxed resize-none shadow-inner"
                  placeholder="Most Noble and Sovereign Banking AI, I approach thee today with a humble heart..."
                />
                <div className="flex justify-between mt-2 text-xs font-mono text-slate-400">
                  <span>Word Count: {wordCount}</span>
                  <span>Grammar Integrity: {Math.max(0, 100 - (essayText.split(' ').length / 10))} %</span>
                </div>
              </div>

              {submissionStatus === 'rejected' && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">REQUEST DENIED</h4>
                    <p>The Sovereign Giant found your use of the passive voice offensive. Your funds remain locked for your own protection.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submissionStatus === 'analyzing'}
                className="w-full py-4 bg-slate-900 text-yellow-50 font-bold text-xl uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
              >
                {submissionStatus === 'analyzing' ? (
                  <>
                    <Scroll className="animate-spin w-5 h-5" />
                    Consulting the Elders...
                  </>
                ) : (
                  <>
                    <Landmark className="w-5 h-5" />
                    Submit Plea to Committee
                  </>
                )}
              </button>
            </form>
          </div>

        </main>
      </div>

      {/* The Massive Footer Simulation */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-8 border-t-8 border-yellow-700 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-xs">
            {/* Generating columns of links to simulate density */}
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <div key={colIndex} className="space-y-2">
                <h5 className="font-bold text-white uppercase mb-4 border-b border-slate-700 pb-2">Sector {colIndex + 1} Links</h5>
                <ul className="space-y-1">
                  {Array.from({ length: 15 }).map((_, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-yellow-500 hover:underline">
                        {['Policy', 'Regulation', 'Statute', 'Addendum', 'Clause', 'Sub-section'][linkIndex % 6]} {colIndex * 100 + linkIndex}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-800 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <BookOpen className="w-8 h-8 text-yellow-600" />
              <h2 className="text-2xl font-serif text-white">AI BANKING & POLITICAL SWAG EMPORIUM</h2>
            </div>
            <p className="max-w-2xl mx-auto text-slate-500 italic">
              "We carry the sovereign confidence of a nation-state, but the humility of a giant who accidentally stepped on a village and feels quite bad about it."
            </p>
            <p className="mt-4 text-[10px] text-slate-600 font-mono">
              Paid for by the Committee to Regulate the Committee that Regulates Banking AI. Not authorized by any candidate or candidate's committee. 
              Copyright {new Date().getFullYear()}. All 100 tabs are legally binding.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SpendingPermissionRequest;