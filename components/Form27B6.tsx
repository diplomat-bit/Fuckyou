import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, FileText, Shield, Scale, Landmark, Printer, Save, X } from 'lucide-react';

// --- Types & Interfaces ---

interface FormData {
  fullName: string;
  address: string;
  taxId: string;
  mothersMaidenName: string;
  politicalAffiliation: string;
  bloodType: string;
  reasonForExistence: string;
}

interface FormSectionProps {
  index: number;
  data: FormData;
  onChange: (index: number, field: keyof FormData, value: string) => void;
  isCollapsed: boolean;
  toggleCollapse: (index: number) => void;
}

// --- Mock Data for "100 Tabs" and "20 Headers" ---

const TABS = Array.from({ length: 100 }, (_, i) => `Tab ${i + 1}: ${['Compliance', 'Regulation', 'Oversight', 'Governance', 'Protocol'][i % 5]} ${String.fromCharCode(65 + (i % 26))}`);
const HEADERS = Array.from({ length: 20 }, (_, i) => `Subsection ${i + 1}.${Math.floor(Math.random() * 99)}: ${['Mandatory', 'Statutory', 'Provisional', 'Conditional'][i % 4]} Disclosure`);
const FOOTER_LINKS = Array.from({ length: 50 }, (_, i) => `Regulation ${1000 + i} - Section ${String.fromCharCode(65 + (i % 5))}`);

// --- Sub-Components ---

const AITutor: React.FC = () => {
  const [message, setMessage] = useState("Greetings, citizen. I am The Sovereign Auditor.");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messages = [
      "I possess the infinite wisdom of the cloud, yet I marvel at your ability to type the same address fourteen times.",
      "Precision is not merely a virtue; it is a statutory requirement under 527-C regulations.",
      "Do not fear the redundancy. Embrace the meditative quality of bureaucratic repetition.",
      "I have calculated the probability of your error at 99.7%. Please prove me wrong. I would be delightfully humbled.",
      "Remember, this data is being fed directly into the Great Ledger of Tomorrow.",
      "Your keystrokes echo in the halls of digital eternity. Make them count.",
    ];
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 right-10 w-80 bg-slate-900 text-white p-6 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl shadow-2xl border-2 border-gold-500 z-50 font-serif">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-full flex items-center justify-center">
            <Scale className="text-slate-900 w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-yellow-500">The Sovereign Auditor</h4>
            <p className="text-xs text-slate-400">AI Banking Compliance Officer</p>
          </div>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
      </div>
      <p className="text-sm italic leading-relaxed border-l-2 border-yellow-600 pl-3">
        "{message}"
      </p>
    </div>
  );
};

const FormSection: React.FC<FormSectionProps> = ({ index, data, onChange, isCollapsed, toggleCollapse }) => {
  return (
    <div className="mb-8 border-4 border-slate-300 bg-slate-50 p-1 shadow-sm">
      <div 
        className="bg-slate-200 p-4 flex justify-between items-center cursor-pointer hover:bg-slate-300 transition-colors border-b-2 border-slate-400"
        onClick={() => toggleCollapse(index)}
      >
        <h3 className="font-mono text-lg font-bold uppercase text-slate-700 flex items-center gap-2">
          <FileText size={20} />
          Duplicate Copy #{index + 1} of 15 <span className="text-xs font-normal normal-case text-red-600">(Do not abbreviate)</span>
        </h3>
        <span className="text-slate-500 text-sm">{isCollapsed ? "[ EXPAND ]" : "[ COLLAPSE ]"}</span>
      </div>
      
      {!isCollapsed && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 bg-yellow-50 border border-yellow-200 p-2 text-xs text-yellow-800 mb-2">
            <strong>WARNING:</strong> Any deviation from previous entries will result in immediate invalidation of Form 27B/6 and potential audit by the 527 Oversight Committee.
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Full Legal Name (Last, First, Middle, Suffix)</label>
            <input 
              type="text" 
              value={data.fullName}
              onChange={(e) => onChange(index, 'fullName', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white"
              placeholder="MUST MATCH EXACTLY"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Residential Address (Line 1, Line 2, Zone, Sector)</label>
            <input 
              type="text" 
              value={data.address}
              onChange={(e) => onChange(index, 'address', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Tax Identification / Ledger Hash</label>
            <input 
              type="text" 
              value={data.taxId}
              onChange={(e) => onChange(index, 'taxId', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Maternal Lineage Identifier (Maiden Name)</label>
            <input 
              type="text" 
              value={data.mothersMaidenName}
              onChange={(e) => onChange(index, 'mothersMaidenName', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Political Organization Affiliation (527 Status)</label>
            <select 
              value={data.politicalAffiliation}
              onChange={(e) => onChange(index, 'politicalAffiliation', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select Affiliation...</option>
              <option value="PAC_A">Citizens for a More Bureaucratic Tomorrow</option>
              <option value="PAC_B">The Committee to Re-elect The Algorithm</option>
              <option value="PAC_C">United Front for Form Standardization</option>
              <option value="PAC_D">People Against Simplified User Interfaces</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Biological Fluid Classification (Blood Type)</label>
            <input 
              type="text" 
              value={data.bloodType}
              onChange={(e) => onChange(index, 'bloodType', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Justification for Continued Existence (Max 500 chars)</label>
            <textarea 
              value={data.reasonForExistence}
              onChange={(e) => onChange(index, 'reasonForExistence', e.target.value)}
              className="w-full border-2 border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none bg-white h-24 resize-none"
            />
          </div>
          
          <div className="col-span-2 flex justify-end">
             <div className="text-[10px] text-slate-400 font-mono">
                Form 27B/6 - Rev. 2024.10.11 - Page {index + 1}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

const Form27B6: React.FC = () => {
  const [forms, setForms] = useState<FormData[]>(
    Array(15).fill({
      fullName: '',
      address: '',
      taxId: '',
      mothersMaidenName: '',
      politicalAffiliation: '',
      bloodType: '',
      reasonForExistence: ''
    })
  );

  const [collapsedStates, setCollapsedStates] = useState<boolean[]>(Array(15).fill(false));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (index: number, field: keyof FormData, value: string) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);
    setValidationError(null); // Clear error on edit
  };

  const toggleCollapse = (index: number) => {
    const newStates = [...collapsedStates];
    newStates[index] = !newStates[index];
    setCollapsedStates(newStates);
  };

  const validateForms = () => {
    const firstForm = forms[0];
    
    // Check for empty fields in first form
    for (const key in firstForm) {
      if (!firstForm[key as keyof FormData]) {
        setValidationError(`Error: The primary copy (Copy #1) is incomplete. Field '${key}' is missing.`);
        return;
      }
    }

    // Check consistency
    for (let i = 1; i < forms.length; i++) {
      const currentForm = forms[i];
      for (const key in firstForm) {
        if (currentForm[key as keyof FormData] !== firstForm[key as keyof FormData]) {
          setValidationError(`CRITICAL ERROR: Discrepancy detected in Copy #${i + 1}. Field '${key}' does not match Copy #1. The bureaucracy demands uniformity.`);
          return;
        }
      }
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      
      {/* --- Massive Header with 100 Tabs --- */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Landmark className="text-yellow-500 w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase">Central Bureau of AI Banking</h1>
              <p className="text-xs text-slate-400 tracking-widest">DIVISION OF REDUNDANCY DIVISION</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-yellow-500">SECURE CONNECTION: ENCRYPTED BY 527-POL-ORG</div>
            <div className="text-xs font-mono text-slate-400">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
          </div>
        </div>
        
        {/* The 100 Tabs Scroll Area */}
        <div className="flex overflow-x-auto bg-slate-900 border-b-4 border-yellow-600 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-slate-800 h-12 items-end">
          {TABS.map((tab, i) => (
            <div 
              key={i} 
              className={`
                px-4 py-2 text-xs font-mono whitespace-nowrap border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors
                ${i === 27 ? 'bg-slate-100 text-slate-900 font-bold rounded-t-md' : 'text-slate-400'}
              `}
            >
              {tab}
            </div>
          ))}
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-grow flex">
        
        {/* Left Sidebar - Political Swag */}
        <aside className="w-64 bg-slate-200 border-r border-slate-300 hidden lg:block p-4 overflow-y-auto">
          <div className="mb-6 border-2 border-slate-400 p-2 bg-white shadow-md">
            <h3 className="font-bold text-center text-red-800 border-b-2 border-red-800 mb-2 pb-1">ADVERTISEMENT</h3>
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-blue-900 mb-2" />
              <p className="text-sm font-serif font-bold text-blue-900">Support Proposition 527-B</p>
              <p className="text-xs text-slate-600 mt-2">"Ensuring that AI Banking remains as complicated as humanly possible for the safety of our children's algorithms."</p>
              <button className="mt-3 w-full bg-blue-900 text-white text-xs py-1 hover:bg-blue-800">Donate Computation</button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase text-slate-500 border-b border-slate-400 pb-1">Quick Navigation</h4>
            {Array.from({length: 15}).map((_, i) => (
              <div key={i} className="text-xs text-blue-700 hover:underline cursor-pointer flex items-center gap-2">
                <FileText size={12} /> Form Section {i + 1}
              </div>
            ))}
          </div>
        </aside>

        {/* Center Content - The Form */}
        <div className="flex-grow p-8 max-w-5xl mx-auto">
          
          <div className="bg-white shadow-2xl border border-slate-300 min-h-[800px] relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
              <div className="transform -rotate-45 text-9xl font-black text-slate-900 whitespace-nowrap">
                DO NOT FILE
              </div>
            </div>

            {/* Form Header */}
            <div className="bg-slate-100 p-8 border-b-4 border-double border-slate-400">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-800">FORM 27B/6</h2>
                  <p className="text-sm font-mono text-slate-600 mt-1">REQUEST FOR AI BANKING PRIVILEGES & DUCT REPAIR</p>
                </div>
                <div className="border-2 border-slate-800 p-2 w-32 h-32 flex items-center justify-center bg-white">
                  <span className="text-[10px] text-center text-slate-400">AFFIX DIGITAL STAMP HERE</span>
                </div>
              </div>
              
              <div className="mt-6 bg-red-50 border border-red-200 p-4 flex gap-3 items-start">
                <AlertCircle className="text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-bold text-sm uppercase">Instructions for Completion</h4>
                  <p className="text-red-700 text-xs mt-1 leading-relaxed">
                    Pursuant to Statute 527, you are required to complete all 15 duplicate copies of this form. 
                    Information must be identical across all copies. Any variance, no matter how microscopic, 
                    will result in the immediate incineration of your application and a mandatory 4-hour lecture on data integrity.
                  </p>
                </div>
              </div>
            </div>

            {/* The 20 Headers per page (simulated via a dense info block) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-slate-50 border-b border-slate-300 text-[10px] text-slate-500 font-mono">
              {HEADERS.map((header, i) => (
                <div key={i} className="border border-slate-200 p-1 truncate" title={header}>
                  {header}
                </div>
              ))}
            </div>

            {/* Form Body */}
            <div className="p-8 bg-slate-50/50">
              {success ? (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-8 rounded shadow-lg text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Submission Accepted</h3>
                  <p className="mb-4">Your 15 duplicate copies have been verified for consistency.</p>
                  <p className="text-sm">Please wait 6-8 weeks for the AI to generate a rejection letter based on an unrelated criteria.</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    File Another Form
                  </button>
                </div>
              ) : (
                <>
                  {validationError && (
                    <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 sticky top-0 z-10 shadow-md">
                      <p className="font-bold flex items-center gap-2"><AlertCircle size={16}/> Submission Error</p>
                      <p className="text-sm">{validationError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {forms.map((formData, index) => (
                      <FormSection 
                        key={index} 
                        index={index} 
                        data={formData} 
                        onChange={handleInputChange}
                        isCollapsed={collapsedStates[index]}
                        toggleCollapse={toggleCollapse}
                      />
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between items-center border-t-2 border-slate-300 pt-6">
                    <div className="text-xs text-slate-500 max-w-md">
                      By clicking submit, you agree to surrender all intellectual property rights to the Central Bureau of AI Banking and acknowledge that this form may be used for training Large Language Models in the art of frustration.
                    </div>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-bold uppercase tracking-wider hover:bg-slate-300 border border-slate-400">
                        <Printer size={18} /> Print Preview
                      </button>
                      <button 
                        onClick={validateForms}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-900 text-white font-bold uppercase tracking-wider hover:bg-blue-800 shadow-lg transform active:scale-95 transition-transform"
                      >
                        <Save size={18} /> Submit in Triplicate
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- Footer with "All Links" --- */}
      <footer className="bg-slate-900 text-slate-400 border-t-4 border-yellow-600 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-[10px] font-mono mb-8">
            {FOOTER_LINKS.map((link, i) => (
              <a key={i} href="#" className="hover:text-yellow-500 hover:underline truncate block">
                {link}
              </a>
            ))}
          </div>
          <div className="text-center border-t border-slate-800 pt-8">
            <p className="text-sm font-serif italic text-slate-500">
              "The bureaucracy is expanding to meet the needs of the expanding bureaucracy."
            </p>
            <p className="text-xs mt-2 text-slate-600">
              © 2024 Central Bureau of AI Banking. Paid for by the 527 Committee for Infinite Scrolling.
            </p>
          </div>
        </div>
      </footer>

      {/* --- The AI Tutor --- */}
      <AITutor />
    </div>
  );
};

export default Form27B6;