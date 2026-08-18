import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Scale, 
  FileText, 
  Info, 
  DollarSign, 
  Flag, 
  BookOpen, 
  Gavel, 
  Landmark,
  Scroll,
  Stamp
} from 'lucide-react';

// --- Types & Interfaces ---

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  patrioticScore: number;
}

interface FormState {
  fullName: string;
  citizenId: string;
  requestedItem: string;
  quantity: number;
  justification: string;
  politicalDonationHistory: string;
  carbonOffsetToken: string;
}

// --- Mock Data & AI Logic ---

const PATRIOTIC_ALTERNATIVES: Record<string, string> = {
  "avocado": "Freedom Turnip",
  "quinoa": "Liberty Grits",
  "sushi": "Sovereign Fish Sticks",
  "croissant": "Constitutional Biscuit",
  "feta": "Federal Cheese Block",
  "wine": "Eagle Sweat (Tap Water)",
  "chocolate": "Carob of Justice"
};

const BUREAUCRATIC_HEADERS = [
  "Section 1.A: Preliminary Caloric Intent",
  "Section 1.B: Fiscal Responsibility Acknowledgment",
  "Section 2.A: Domestic Produce Verification",
  "Section 2.B: Import Tariff Acceptance Waiver",
  "Section 3.A: 527 Organization Compliance Check",
  "Section 3.B: Soft Money Disclosure Agreement",
  "Section 4.A: Nutritional Sovereignty Assessment",
  "Section 4.B: Glycemic Index Federal Regulation",
  "Section 5.A: Supply Chain Patriotism Audit",
  "Section 5.B: Interstate Commerce Clause Applicability",
  "Section 6.A: Environmental Impact Statement (Grocery)",
  "Section 6.B: Carbon Footprint Tax Calculation",
  "Section 7.A: AI Banking Pre-Authorization Hold",
  "Section 7.B: Algorithmic Credit Score Impact Analysis",
  "Section 8.A: Waiver of Right to Tasty Food",
  "Section 8.B: Mandatory Consumption of Surplus Corn",
  "Section 9.A: Emergency Food Rationing Protocols",
  "Section 9.B: Bunker Storage Compatibility Check",
  "Section 10.A: Final Executive Order Compliance",
  "Section 10.B: Notarized Digital Signature of Soul"
];

// --- Components ---

const SovereignTutor = ({ message, isVisible }: { message: string; isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-8 right-8 w-96 bg-slate-900 text-white p-6 rounded-xl shadow-2xl border-4 border-yellow-500 z-50 animate-slide-up font-serif">
      <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
          <Scale className="w-8 h-8 text-white relative z-10" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-yellow-400 tracking-wider">THE SOVEREIGN SENTINEL</h3>
          <p className="text-[10px] text-gray-300 italic uppercase tracking-widest">"Humility of a Giant, Wisdom of the State"</p>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded border-l-4 border-blue-500 shadow-inner">
        <p className="font-mono text-sm leading-relaxed text-blue-100">
          <span className="text-yellow-500 font-bold mr-2">:: ADVISORY ::</span>
          {message}
        </p>
      </div>
      <div className="mt-2 text-[10px] text-gray-500 text-center">
        Powered by AI Banking Neural Regulation Network v9.2
      </div>
    </div>
  );
};

const BureaucraticHeader = ({ title, index }: { title: string; index: number }) => (
  <div className="mb-8 border-b-2 border-gray-300 pb-2">
    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest mb-1">
      <FileText size={12} />
      <span>Reference ID: US-AI-BANK-{527 + index}-SEC-{index}</span>
    </div>
    <h3 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
      <span className="bg-slate-800 text-white px-2 py-1 text-xs rounded-sm">REQ</span>
      {title}
    </h3>
    <p className="text-xs text-gray-500 mt-1 italic">
      Compliance is mandatory. Failure to complete this section accurately may result in the forfeiture of grocery privileges and/or mandatory enrollment in a 527 political education seminar.
    </p>
  </div>
);

const SwagBanner = () => (
  <div className="bg-gradient-to-r from-red-900 via-blue-900 to-red-900 text-white p-2 text-center text-xs font-bold uppercase tracking-widest animate-pulse">
    *** SPONSORED BY THE 'CITIZENS FOR REASONABLE REGULATION OF UNREASONABLE THINGS' 527 ORGANIZATION *** DONATE YOUR LEFTOVER CHANGE TO FREEDOM ***
  </div>
);

export default function PermitToPurchase() {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    citizenId: '',
    requestedItem: '',
    quantity: 1,
    justification: '',
    politicalDonationHistory: 'None',
    carbonOffsetToken: ''
  });

  const [tutorMessage, setTutorMessage] = useState("Greetings, Citizen. I am the Sovereign Sentinel. I see you are attempting to acquire sustenance. Proceed with caution; your choices reflect upon the GDP.");
  const [showTutor, setShowTutor] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'analyzing' | 'rejected' | 'approved'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // AI Intervention Logic
    if (name === 'requestedItem') {
      const lowerValue = value.toLowerCase();
      const alternative = Object.keys(PATRIOTIC_ALTERNATIVES).find(key => lowerValue.includes(key));
      
      if (alternative) {
        setTutorMessage(`HALT. You have typed '${value}'. My algorithms detect this is a subversive, possibly imported luxury. Might I suggest '${PATRIOTIC_ALTERNATIVES[alternative]}' instead? It is 40% cheaper and 200% more patriotic.`);
      } else if (value.length > 3) {
        setTutorMessage(`Analyzing '${value}' for caloric density and tax implications... Remember, a lean citizen is a profitable citizen.`);
      }
    }

    if (name === 'quantity' && Number(value) > 5) {
      setTutorMessage("Excessive hoarding detected. Are you preparing for a collapse of the banking system? Rest assured, AI Banking is eternal. Please reduce quantity to avoid being flagged as a 'Prepper'.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('analyzing');
    setTutorMessage("Cross-referencing your request with the 527 Organization Donor Database and the National Caloric Reserve...");
    
    setTimeout(() => {
      setSubmissionStatus('rejected');
      setTutorMessage("REQUEST DENIED. Reason: Insufficient patriotic fervor in justification field. Also, you failed to cite the specific 527 organization benefiting from this transaction. Please review Section 3.B and try again.");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <SwagBanner />
      
      {/* Navigation Simulation (100 Tabs Concept) */}
      <div className="bg-slate-800 text-gray-400 text-xs overflow-x-auto whitespace-nowrap border-b-4 border-yellow-500 scrollbar-hide">
        <div className="flex">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i} 
              className={`px-4 py-2 border-r border-slate-700 hover:bg-slate-700 cursor-pointer flex items-center gap-1 ${i === 42 ? 'bg-slate-100 text-slate-900 font-bold' : ''}`}
            >
              <FileText size={10} />
              <span>{i === 42 ? 'PERMIT-TO-PURCHASE' : `FORM-89${i}Z`}</span>
            </div>
          ))}
        </div>
      </div>

      <header className="bg-white border-b border-gray-200 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 transform rotate-12 translate-x-10 -translate-y-10">
          <Landmark size={300} />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Stamp className="text-red-700 w-12 h-12 transform -rotate-12" />
            <div>
              <h1 className="text-4xl font-serif font-black text-slate-900 uppercase tracking-tight">
                Permit to Purchase: Class C (Groceries)
              </h1>
              <p className="text-slate-500 font-mono text-sm">
                Department of AI Banking & Caloric Regulation | Form ID: PTP-GROC-2024-V9
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800 flex gap-3">
            <AlertTriangle className="shrink-0" />
            <p>
              <strong>WARNING:</strong> Falsifying hunger levels on this form is a federal offense punishable by mandatory viewing of 527 organization informational advertisements for a period of no less than 72 hours.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Endless Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Injecting Headers and Fields */}
            {BUREAUCRATIC_HEADERS.slice(0, 5).map((header, idx) => (
              <div key={idx}>
                <BureaucraticHeader title={header} index={idx} />
                <div className="pl-4 border-l-2 border-gray-100">
                  <p className="text-sm text-gray-600 mb-4 font-serif">
                    Please explain in detail how this section applies to your desire to purchase food. 
                    Reference specific statutes of the AI Banking Code.
                  </p>
                  {idx === 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Legal Name</label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={form.fullName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="As appears on birth certificate"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Citizen ID / Tax Hash</label>
                        <input 
                          type="text" 
                          name="citizenId"
                          value={form.citizenId}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="XXX-XX-AI-001"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* The Core Request */}
            <div className="bg-slate-50 p-6 rounded border border-slate-200 my-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Flag className="text-red-600" />
                The Request
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Desired Sustenance Item</label>
                  <input 
                    type="text" 
                    name="requestedItem"
                    value={form.requestedItem}
                    onChange={handleInputChange}
                    className="w-full border-2 border-slate-300 p-3 rounded text-lg focus:border-blue-500 outline-none"
                    placeholder="e.g. Bread, Milk, Freedom Fries"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      name="quantity"
                      value={form.quantity}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Unit of Measure</label>
                    <select className="w-full border border-slate-300 p-2 rounded bg-white">
                      <option>Standard Imperial Units</option>
                      <option>Freedom Units</option>
                      <option>Patriot Parcels</option>
                      <option>Metric (Flagged for Review)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* More Headers */}
            {BUREAUCRATIC_HEADERS.slice(5, 10).map((header, idx) => (
              <div key={idx + 5}>
                <BureaucraticHeader title={header} index={idx + 5} />
                <div className="pl-4 border-l-2 border-gray-100">
                   <textarea 
                    className="w-full h-20 border border-gray-200 p-2 text-sm resize-none bg-gray-50" 
                    placeholder="Enter explanation here (min 500 words)..."
                    disabled
                   />
                   <p className="text-[10px] text-red-500 mt-1">* This field is auto-filled by AI based on your browsing history.</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 p-6 rounded border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Patriotic Justification</h3>
              <p className="text-sm text-blue-800 mb-4">
                Why do you deserve this food more than the national stockpile? Please reference at least one 527 political organization that supports your dietary choices.
              </p>
              <textarea 
                name="justification"
                value={form.justification}
                onChange={handleInputChange}
                className="w-full h-32 border border-blue-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="I hereby declare that my consumption of this item will fuel my productivity to pay more taxes..."
              />
            </div>

            {/* Even More Headers */}
            {BUREAUCRATIC_HEADERS.slice(10, 15).map((header, idx) => (
              <div key={idx + 10}>
                <BureaucraticHeader title={header} index={idx + 10} />
              </div>
            ))}

            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded">
              <input type="checkbox" id="terms" className="w-6 h-6 text-blue-600 rounded" required />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I agree to allow the AI Banking System to micro-analyze my digestion. I understand that any unabsorbed nutrients are subject to a Waste Tax. I acknowledge that 527 organizations may use my likeness in "Hungry Citizen" campaign ads.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={submissionStatus !== 'idle'}
              className={`w-full py-4 px-6 rounded font-bold text-white text-lg uppercase tracking-widest shadow-lg transition-all
                ${submissionStatus === 'idle' ? 'bg-slate-900 hover:bg-slate-800' : 
                  submissionStatus === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}`}
            >
              {submissionStatus === 'idle' && "Submit Application for Calories"}
              {submissionStatus === 'analyzing' && "AI Adjudicating..."}
              {submissionStatus === 'rejected' && "APPLICATION REJECTED"}
              {submissionStatus === 'approved' && "APPROVED (Wait time: 6-8 weeks)"}
            </button>

          </form>
        </div>

        {/* Right Column: Informational Swag & Sidebar */}
        <div className="space-y-6">
          
          {/* 527 Swag Box */}
          <div className="bg-gradient-to-b from-red-50 to-white border-4 border-double border-red-200 p-6 rounded-xl shadow-md text-center">
            <div className="flex justify-center mb-4">
              <Flag className="text-red-600 w-12 h-12 animate-wave" />
            </div>
            <h3 className="font-serif font-bold text-xl text-red-900 mb-2">
              Did You Know?
            </h3>
            <p className="text-sm text-red-800 mb-4 leading-relaxed">
              The <strong>"Committee for the Preservation of Fermented Grains"</strong> is a 527 organization dedicated to ensuring your bread is politically neutral.
            </p>
            <div className="bg-white p-3 border border-red-100 rounded shadow-inner">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Official Swag Item:</p>
              <p className="font-bold text-slate-800">"I Voted for Yeast" Bumper Sticker</p>
              <button className="mt-2 w-full bg-red-600 text-white text-xs py-2 rounded hover:bg-red-700">
                Claim for 500 Social Credit Points
              </button>
            </div>
          </div>

          {/* AI Banking Info */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-yellow-500" />
              AI Banking Knowledge Base
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-1" />
                <span>Every transaction is audited by 3 separate neural networks.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-1" />
                <span>Your grocery list predicts your voting behavior with 99.9% accuracy.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-1" />
                <span>Buying generic brands increases your Patriot Score.</span>
              </li>
            </ul>
          </div>

          {/* Remaining Headers (Sidebar overflow) */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200 h-96 overflow-y-auto">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-4 sticky top-0 bg-gray-50 pb-2 border-b">
              Supplemental Regulations
            </h4>
            {BUREAUCRATIC_HEADERS.slice(15).map((header, idx) => (
              <div key={idx + 15} className="mb-4 opacity-60 hover:opacity-100 transition-opacity">
                <h5 className="text-xs font-bold text-slate-700">{header}</h5>
                <p className="text-[10px] text-gray-500">Pending legislative review...</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* The Footer of Infinite Links */}
      <footer className="bg-slate-950 text-slate-600 py-12 border-t-8 border-yellow-600 mt-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <div key={colIndex} className="space-y-2">
                <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
                  Department {colIndex + 1}
                </h4>
                {Array.from({ length: 10 }).map((_, linkIndex) => (
                  <a href="#" key={linkIndex} className="block text-[10px] hover:text-yellow-500 transition-colors truncate">
                    Regulation {colIndex}-{linkIndex}: {['Compliance', 'Oversight', 'Auditing', 'Forms', 'Swag', 'Taxes'][colIndex]}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="text-center border-t border-slate-900 pt-8">
            <p className="text-xs text-slate-500 mb-2">
              © 2024 AI Banking & Bureaucracy Bureau. All Rights Reserved. 
            </p>
            <p className="text-[10px] text-slate-700 max-w-2xl mx-auto">
              Paid for by the "Committee to Re-Elect the Algorithm". Not authorized by any human candidate. 
              This website is a 527 organization informational portal designed to educate you on the complexities of buying a sandwich.
              Sovereign Sentinel AI is a registered trademark of DeepState Compute LLC.
            </p>
          </div>
        </div>
      </footer>

      <SovereignTutor message={tutorMessage} isVisible={showTutor} />
    </div>
  );
}