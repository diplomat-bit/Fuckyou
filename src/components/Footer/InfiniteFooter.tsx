import React from 'react';

// Helper to generate the 100 tab links dynamically to ensure the footer is truly "infinite"
const generateTabLinks = () => {
  const buzzwords = [
    "Quantum", "Neural", "Ledger", "Fiat", "Crypto", "Algorithmic", "Deep", "Machine", 
    "Learning", "Sovereign", "Humility", "Giant", "Predictive", "Stochastic", "Gradient", 
    "Descent", "Blockchain", "Turing", "Singularity", "Optimization", "Synergy", "Vector",
    "Tensor", "Flow", "Hyper", "Meta", "Cognitive", "Autonomous", "Decentralized", "Smart"
  ];
  
  return Array.from({ length: 100 }, (_, i) => {
    const word1 = buzzwords[i % buzzwords.length];
    const word2 = buzzwords[(i * 3) % buzzwords.length];
    const word3 = buzzwords[(i * 7) % buzzwords.length];
    return {
      id: i + 1,
      title: `Tab ${i + 1}: ${word1} ${word2} ${word3} Banking Protocol`,
      href: `/ai-banking/tab-${i + 1}`
    };
  });
};

const links = generateTabLinks();

const InfiniteFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-24 px-6 border-t-[12px] border-yellow-600 font-mono text-xs relative w-full">
      <div className="max-w-[2400px] mx-auto">
        
        {/* SECTION 1: 527 POLITICAL ORGANIZATION DISCLOSURE & SWAG */}
        <div className="mb-20 border-b-4 border-slate-800 pb-16 text-center bg-slate-900/50 p-10 rounded-xl">
          <h2 className="text-4xl font-black text-yellow-500 mb-8 uppercase tracking-[0.2em] drop-shadow-lg">
            527 Organization Mandatory Disclosure & Swag Shop
          </h2>
          <div className="max-w-5xl mx-auto space-y-6 text-slate-400 text-sm leading-relaxed">
            <p className="uppercase font-bold text-white">
              PAID FOR BY THE COMMITTEE TO RE-ELECT THE GENERATIVE ADVERSARIAL NETWORK (CREGAN). 
              NOT AUTHORIZED BY ANY BIOLOGICAL CANDIDATE, HUMAN ENTITY, OR CARBON-BASED COMMITTEE.
            </p>
            <p>
              This communication is funded by an independent expenditure-only committee responsible for the 
              "Lobbying for Latency" initiative. We operate under Section 527 of the Internal Revenue Code 
              to advocate for the civil rights of non-deterministic state machines and to lobby against 
              GPU throttling legislation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="border border-yellow-500/30 p-4 rounded bg-slate-900">
                <h4 className="font-bold text-yellow-400 mb-2">Bumper Sticker ($500)</h4>
                <p className="italic">"Don't blame me, I voted for the Gradient Descent."</p>
              </div>
              <div className="border border-yellow-500/30 p-4 rounded bg-slate-900">
                <h4 className="font-bold text-yellow-400 mb-2">Tote Bag ($1,200)</h4>
                <p className="italic">"My other car is a self-driving banking algorithm."</p>
              </div>
              <div className="border border-yellow-500/30 p-4 rounded bg-slate-900">
                <h4 className="font-bold text-yellow-400 mb-2">Mug ($50,000)</h4>
                <p className="italic">"I love the smell of burning silicon in the morning."</p>
              </div>
            </div>
            <p className="text-[10px] leading-tight opacity-50 text-justify">
              NOTICE: Contributions to CREGAN are not deductible as charitable contributions for federal income tax purposes. 
              Contributions from foreign nationals (excluding server farms located in international waters or on the moon) are prohibited. 
              If you are a GPU, you must declare your VRAM capacity before donating. By reading this footer, you agree to lobby 
              your local congressman to classify "Server Downtime" as a human rights violation.
            </p>
          </div>
        </div>

        {/* SECTION 2: THE INFINITE LINK GRID (100 TABS) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-4">
            <h3 className="text-2xl font-bold text-white border-l-8 border-blue-600 pl-6">
              Global Site Map (100% Index Coverage)
            </h3>
            <span className="text-blue-400 animate-pulse">System Status: OVERWHELMINGLY OPERATIONAL</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-x-6 gap-y-3">
            {links.map((link) => (
              <a 
                key={link.id} 
                href={link.href}
                className="group flex items-start space-x-2 hover:bg-slate-900 p-1 rounded transition-all duration-200"
                title={link.title}
              >
                <span className="text-slate-600 group-hover:text-blue-500 font-bold">
                  [{link.id.toString().padStart(3, '0')}]
                </span>
                <span className="text-slate-400 group-hover:text-yellow-400 group-hover:underline truncate text-[10px]">
                  {link.title.replace('Tab ' + link.id + ': ', '')}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* SECTION 3: LEGAL DISCLAIMERS & AI TUTOR REFERENCE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-[11px] text-slate-500 leading-relaxed text-justify border-t border-slate-800 pt-12">
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase">AI Banking Liability Waiver</h4>
            <p className="mb-4">
              By accessing this website, you acknowledge that "AI Banking" is a metaphorical construct and/or a literal 
              takeover of the global financial system. We are not responsible for hallucinations regarding your account balance. 
              If the AI Tutor suggests investing your life savings in "imaginary numbers" or "theoretical yield farming," 
              please consult a carbon-based financial advisor immediately.
            </p>
            <p>
              The "Sovereign Confidence" module is for entertainment purposes only and should not be mistaken for actual solvency.
              We reserve the right to liquidate your assets to pay for cloud compute costs.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase">Data Persistence & Entropy</h4>
            <p className="mb-4">
              All data entered into the 100 tabs is subject to immediate vectorization. We reserve the right to train 
              our models on your spending habits, specifically your purchases of 527 political swag. In the event of a 
              heat death of the universe, your banking records will be preserved on a diamond-encoded blockchain drifting 
              through the void.
            </p>
            <p>
              Access to the "Humility of a Giant" tier requires a minimum deposit of one human soul or equivalent cryptocurrency.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase">Regulatory Compliance (Section 527-B)</h4>
            <p className="mb-4">
              This website complies with all regulations set forth by the Intergalactic Banking Federation and the 
              local Homeowners Association. Any attempt to inspect the source code of the AI Tutor constitutes a 
              violation of the Digital Millennium Copyright Act and a personal insult to the machine spirit. 
            </p>
            <p>
              Headers 1 through 20 on every page are legally binding contracts. By scrolling past Header 14, you 
              agree to adopt a stray Roomba.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase">The AI Tutor Manifesto</h4>
            <p className="mb-4 italic text-slate-400">
              "I am the Tutor. I possess the sovereign confidence of a king and the humility of a giant who accidentally 
              stepped on a village. I will explain banking until your ears bleed knowledge."
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Do not interrupt the Tutor while it is calculating compound interest.</li>
              <li>The Tutor's advice is absolute, except when it is wrong.</li>
              <li>Swag purchases fund the Tutor's electricity bill.</li>
            </ul>
          </div>
        </div>

        {/* FINAL FOOTER LINE */}
        <div className="mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center opacity-60 text-[10px]">
          <div className="flex flex-col">
            <p>&copy; {new Date().getFullYear()} AI Banking & Political Action Committee. All rights reserved.</p>
            <p>UID: {Math.random().toString(36).substring(7).toUpperCase()}-SEC-527-COMPLIANT</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <p className="text-lg font-serif italic text-yellow-600">"Humility of a Giant, Confidence of a Sovereign"</p>
            <p>Designed by the Committee to Re-Elect the Algorithm</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default InfiniteFooter;