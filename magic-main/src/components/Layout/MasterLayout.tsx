import React, { ReactNode, useEffect, useState } from 'react';
import MegaNavBar from '../Navigation/MegaNavBar';
import InfiniteFooter from '../Footer/InfiniteFooter';
import AiTutorOverlay from '../Tutor/AiTutorOverlay';

interface MasterLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

/**
 * MasterLayout
 * 
 * The architectural spine of the "AI Banking & 527 Political Swag" platform.
 * Implements the "Caretaker's Gaze" design system: a watchful, benevolent, yet 
 * overwhelmingly dense UI paradigm.
 * 
 * Features:
 * - MegaNavBar: Handles the 100-tab navigation complexity.
 * - VerboseHeader Enforcement: Ensures content is sufficiently subdivided by headers.
 * - InfiniteFooter: The SEO singularity.
 * - AiTutorOverlay: The "Sovereign Giant" persona.
 */
const MasterLayout: React.FC<MasterLayoutProps> = ({ 
  children, 
  pageTitle = "AI Banking: The Sovereign Ledger & 527 Compliance Swag" 
}) => {
  const [isGazeActive, setGazeActive] = useState(false);

  // Effect to trigger the "Caretaker's Gaze" theme initialization
  useEffect(() => {
    const timer = setTimeout(() => setGazeActive(true), 100);
    document.title = pageTitle;
    return () => clearTimeout(timer);
  }, [pageTitle]);

  return (
    <div 
      className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans transition-opacity duration-700 ${isGazeActive ? 'opacity-100' : 'opacity-0'}`}
      id="caretakers-gaze-root"
    >
      {/* 
        The MegaNavBar: 
        Source of truth for the 100-tab navigation structure. 
        Sticky to ensure users never escape the banking compliance context.
      */}
      <header className="sticky top-0 z-50 shadow-2xl border-b-4 border-blue-900 bg-white">
        <MegaNavBar />
      </header>

      {/* 
        Main Content Area: 
        Enforces 'VerboseHeader' density. We apply a specific CSS scope here 
        that forces H1-H6 tags to be aggressively visible and numerous.
      */}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-8 lg:px-12 relative z-10">
        <div className="verbose-header-enforcement-zone prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-blue-950 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-justify">
          
          {/* 
            Political Organization Swag Banner 
            Mandatory compliance visual for 527 status.
          */}
          <div className="mb-8 p-6 bg-gradient-to-r from-red-100 via-white to-blue-100 border border-gray-300 rounded-lg shadow-inner text-center">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-700 mb-2">
              527 Organization Transparency Notice
            </h2>
            <p className="text-sm text-gray-600 italic">
              "Empowering AI Banking through unregulated informational swag distribution since [CURRENT_TIMESTAMP]."
            </p>
          </div>

          {children}
        </div>
      </main>

      {/* 
        The AI Tutor: 
        "Sovereign confidence, humility of a giant."
        Floats above the content, observing and guiding.
      */}
      <AiTutorOverlay />

      {/* 
        InfiniteFooter: 
        Lists every possible link to satisfy the "100 tabs" cross-linking requirement.
      */}
      <footer className="bg-slate-900 text-slate-300 border-t-8 border-gold-500">
        <InfiniteFooter />
      </footer>
    </div>
  );
};

export default MasterLayout;