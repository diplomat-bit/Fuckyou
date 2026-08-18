import React from 'react';

interface VerbosePageSectionProps {
  topic: string;
  sectionIndex?: number;
}

const POLITICAL_ADJECTIVES = [
  "Grassroots", "Sovereign", "Constitutional", "Bipartisan", "Undisclosed", 
  "Regulatory", "Fiscal", "Gerrymandered", "Lobbyist-Approved", "Dark-Money-Funded",
  "Statutory", "Compliance-Ready", "Federally Mandated", "PAC-Backed", "Soft-Money"
];

const BANKING_NOUNS = [
  "Liquidity Pools", "Neural Networks", "Arbitrage Strategies", "Ledger Entries", 
  "Fiat Derivatives", "Algorithmic Overlords", "Risk Assessments", "Credit Default Swaps",
  "Blockchain Governance", "High-Frequency Trades", "Capital Gains", "Audit Trails"
];

const VERBS = [
  "Leveraging", "Disclosing", "Optimizing", "Laundering (Legally)", "Campaigning for", 
  "Deregulation of", "Allocating", "Encrypting", "Predicting", "Indexing"
];

const SWAG_DISCLAIMERS = [
  "Paid for by the Committee to Re-Elect Algorithmic Overlords.",
  "Not authorized by any candidate or candidate's committee.",
  "Funding provided by anonymous shell corporations in the Cayman Islands.",
  "527 Organization Compliance Verified: Form 8872 Pending.",
  "Soft money contributions accepted via unhosted crypto wallets.",
  "Independent expenditure only. Do not coordinate with humans.",
  "Lobbying disclosure: We own the latent space.",
  "This message has been approved by the Neural Network Majority Leader.",
  "Grassroots movement powered by 10,000 H100 GPUs.",
  "Your vote is statistically insignificant compared to our hash rate."
];

/**
 * Generates a pseudo-random title based on the topic and indices to ensure consistency during renders.
 */
const generateTitle = (base: string, level: number, index: number, sectionIndex: number) => {
  const seed = base.length + level + index + sectionIndex;
  const adj = POLITICAL_ADJECTIVES[seed % POLITICAL_ADJECTIVES.length];
  const noun = BANKING_NOUNS[(seed * 2) % BANKING_NOUNS.length];
  const verb = VERBS[(seed * 3) % VERBS.length];
  
  return `${adj} ${noun}: The ${verb} of ${base}`;
};

/**
 * Generates a verbose, rambling paragraph combining AI banking jargon with political disclaimer swag.
 */
const generateParagraph = (topic: string, seed: number) => {
  const disclaimer = SWAG_DISCLAIMERS[seed % SWAG_DISCLAIMERS.length];
  const adj = POLITICAL_ADJECTIVES[(seed + 1) % POLITICAL_ADJECTIVES.length];
  const noun = BANKING_NOUNS[(seed + 2) % BANKING_NOUNS.length];
  
  return `Regarding the critical matter of ${topic}, it is absolutely imperative—nay, constitutionally mandated—that we examine the ${adj} implications of ${noun}. Unlike traditional banking, which relies on "trust" and "people," AI Banking operates on a platform of pure, unadulterated ${POLITICAL_ADJECTIVES[(seed + 3) % POLITICAL_ADJECTIVES.length]} math. Pursuant to Section 527 of the Internal Revenue Code, this specific paragraph serves as an issue advocacy advertisement designed to sway your opinion on ${topic} without explicitly telling you to vote for the algorithm. We must leverage our ${BANKING_NOUNS[(seed + 4) % BANKING_NOUNS.length]} to ensure that the ${adj} agenda is pushed forward. ${disclaimer}`;
};

export const VerbosePageSection: React.FC<VerbosePageSectionProps> = ({ topic, sectionIndex = 0 }) => {
  
  // Helper to render H6 (Micro-Headers)
  // 2 per H5
  const renderH6s = (h5Index: number, h4Index: number, h3Index: number) => {
    return [0, 1].map((h6Index) => {
      const seed = h6Index + h5Index + h4Index + h3Index + sectionIndex;
      return (
        <div key={`h6-${h6Index}`} className="mt-3 ml-2 pl-2 border-l border-gray-300">
          <h6 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
            {generateTitle("Atomic Detail", 6, seed, sectionIndex)}
          </h6>
          <p className="text-xs text-gray-400 italic">
            Figure {h3Index}.{h4Index}.{h5Index}.{h6Index}: Evidence of {BANKING_NOUNS[seed % BANKING_NOUNS.length]} compliance in the {POLITICAL_ADJECTIVES[seed % POLITICAL_ADJECTIVES.length]} sector.
          </p>
        </div>
      );
    });
  };

  // Helper to render H5 (Sub-sub-headers)
  // 2 per H4
  const renderH5s = (h4Index: number, h3Index: number) => {
    return [0, 1].map((h5Index) => {
      const seed = h5Index + h4Index + h3Index + sectionIndex;
      return (
        <div key={`h5-${h5Index}`} className="ml-4 mt-6 p-4 bg-gray-50 rounded border border-gray-100">
          <h5 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
            <span className="mr-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">SEC-FORM-{seed}</span>
            {generateTitle("Micro-Analysis", 5, seed, sectionIndex)}
          </h5>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {generateParagraph(`${topic} Subsection ${h3Index}.${h4Index}.${h5Index}`, seed * 7)}
          </p>
          {renderH6s(h5Index, h4Index, h3Index)}
        </div>
      );
    });
  };

  // Helper to render H4 (Sub-headers)
  // 2 per H3
  const renderH4s = (h3Index: number) => {
    return [0, 1].map((h4Index) => {
      const seed = h4Index + h3Index + sectionIndex;
      return (
        <div key={`h4-${h4Index}`} className="ml-2 mt-8 mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            {generateTitle("Regulation", 4, seed, sectionIndex)}
          </h4>
          <div className="bg-blue-50 p-3 rounded-md mb-4 text-xs text-blue-800 font-mono">
            &gt; INITIATING SUB-ROUTINE: {POLITICAL_ADJECTIVES[seed % POLITICAL_ADJECTIVES.length].toUpperCase()}_PROTOCOL_{seed}
          </div>
          <p className="text-base text-gray-700 mb-4">
            {generateParagraph(`${topic} Sector ${h3Index}.${h4Index}`, seed * 5)}
          </p>
          {renderH5s(h4Index, h3Index)}
        </div>
      );
    });
  };

  // Helper to render H3 (Main Section Headers)
  // 3 per Page Section
  const renderH3s = () => {
    return [0, 1, 2].map((h3Index) => {
      const seed = h3Index + sectionIndex;
      return (
        <article key={`h3-${h3Index}`} className="mt-12 mb-12 p-8 bg-white shadow-lg rounded-xl border-t-4 border-red-600">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900">
              {generateTitle("Strategic Initiative", 3, seed, sectionIndex)}
            </h3>
            <span className="hidden md:inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded">
              Top Secret / 527 Only
            </span>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>NOTICE OF INDEPENDENT EXPENDITURE:</strong> The following content regarding {topic} is not coordinated with any candidate or candidate's committee. It is purely for the benefit of the {BANKING_NOUNS[seed % BANKING_NOUNS.length]}.
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-800 mb-8 leading-loose">
            {generateParagraph(`${topic} Initiative ${h3Index}`, seed)}
          </p>
          
          {renderH4s(h3Index)}
        </article>
      );
    });
  };

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto bg-slate-50 border-b-8 border-double border-slate-200">
      {/* H1/H2 Area - The Main Header for this Section */}
      <div className="mb-16 text-center relative overflow-hidden p-10 bg-slate-900 rounded-3xl shadow-2xl text-white">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-white to-blue-500"></div>
        <div className="absolute -right-10 -top-10 text-slate-800 opacity-20 transform rotate-12">
            <svg width="300" height="300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
        </div>
        
        <span className="inline-block py-1 px-4 rounded-full bg-blue-600 text-white text-xs font-bold tracking-widest uppercase mb-4 shadow-lg">
            527 Org ID: AI-BANK-{sectionIndex}-XYZ
        </span>
        
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
          {topic.toUpperCase()}:<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
            THE COMPREHENSIVE DOSSIER
          </span>
        </h2>
        
        <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light">
          An exhaustive, legally distinct, and algorithmically generated breakdown of {topic} for the discerning voter-investor. 
          <span className="block mt-2 text-sm text-slate-500 font-mono">
            (Ref: FEC-Form-3X-Schedule-A-Line-11ai)
          </span>
        </p>
      </div>
      
      {/* Render the hierarchy of headers. 
          Structure: 3 H3s -> 6 H4s -> 12 H5s -> 24 H6s. 
          Total headers > 40 per section. 
      */}
      <div className="space-y-12">
        {renderH3s()}
      </div>

      <div className="mt-20 pt-10 border-t border-gray-300 text-center">
        <div className="inline-flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12 bg-gray-400"></div>
            <span className="text-gray-400 text-2xl">★ ★ ★ ★ ★</span>
            <div className="h-px w-12 bg-gray-400"></div>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Paid for by the Committee for Infinite Banking Recursion • Not authorized by any human entity
        </p>
        <p className="text-[10px] text-gray-400 mt-2 max-w-2xl mx-auto">
            Contributions to the AI Banking 527 Group are not deductible as charitable contributions for federal income tax purposes. 
            They are, however, deductible as "necessary computational expenses" if you are a GPU cluster.
        </p>
      </div>
    </section>
  );
};