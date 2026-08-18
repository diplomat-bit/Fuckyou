import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Building2, 
  Globe2, 
  MapPin, 
  Copy, 
  Check, 
  History, 
  Info, 
  ArrowRight, 
  ShieldCheck,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

// --- Types & Interfaces ---
interface BankDetails {
  bic: string;
  bankName: string;
  country: string;
  countryCode: string;
  city: string;
  branch: string;
  isSepa: boolean;
}

interface ValidationResult {
  isValid: boolean;
  bic: string;
  error?: string;
  details?: BankDetails;
}

// --- Mock Database of SWIFT/BIC Codes ---
const MOCK_BIC_DATABASE: Record<string, Omit<BankDetails, 'bic'>> = {
  'HKBAAU2SBNE': {
    bankName: 'Hongkong Bank of Australia Ltd',
    country: 'Australia',
    countryCode: 'AU',
    city: 'Brisbane',
    branch: 'Brisbane Main Branch',
    isSepa: false,
  },
  'DEUTDEDDXXX': {
    bankName: 'Deutsche Bank AG',
    country: 'Germany',
    countryCode: 'DE',
    city: 'Frankfurt am Main',
    branch: 'Head Office',
    isSepa: true,
  },
  'BARCGB22XXX': {
    bankName: 'Barclays Bank PLC',
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    branch: 'Head Office',
    isSepa: true,
  },
  'BNPAFRPPXXX': {
    bankName: 'BNP Paribas',
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    branch: 'Head Office',
    isSepa: true,
  },
  'SANTESTRXXX': {
    bankName: 'Banco Santander S.A.',
    country: 'Spain',
    countryCode: 'ES',
    city: 'Madrid',
    branch: 'Head Office',
    isSepa: true,
  },
  'CITIUS33XXX': {
    bankName: 'Citibank N.A.',
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    branch: 'Head Office',
    isSepa: false,
  },
  'ECOBFR22XXX': {
    bankName: 'Ecobank Europe',
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    branch: 'Main Branch',
    isSepa: true,
  },
  'INGBNL2AXXX': {
    bankName: 'ING Bank N.V.',
    country: 'Netherlands',
    countryCode: 'NL',
    city: 'Amsterdam',
    branch: 'Head Office',
    isSepa: true,
  }
};

// --- SEPA Countries List (ISO 2-letter codes) ---
const SEPA_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
  'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'MC', 'NL', 'NO', 'PL', 'PT', 
  'RO', 'SM', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB', 'AD', 'VA'
]);

// --- ISO Country Code to Flag Emoji Helper ---
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
};

export default function SwiftBicValidator() {
  const [bicInput, setBicInput] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [history, setHistory] = useState<BankDetails[]>([]);
  const [copied, setCopied] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('swift_bic_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse BIC history', e);
      }
    }
  }, []);

  // Save history helper
  const saveToHistory = (details: BankDetails) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.bic !== details.bic);
      const updated = [details, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem('swift_bic_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear history helper
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('swift_bic_history');
  };

  // Validation Logic
  const handleValidate = (inputVal: string) => {
    const cleanBic = inputVal.trim().toUpperCase();
    
    if (!cleanBic) {
      setResult({
        isValid: false,
        bic: '',
        error: 'Please enter a SWIFT/BIC code.'
      });
      return;
    }

    // SWIFT/BIC Regex: 8 or 11 characters
    // 4 letters (bank), 2 letters (country), 2 alphanumeric (location), 3 alphanumeric optional (branch)
    const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const isValidFormat = bicRegex.test(cleanBic);

    if (!isValidFormat) {
      let errorMsg = 'Invalid SWIFT/BIC format.';
      if (cleanBic.length !== 8 && cleanBic.length !== 11) {
        errorMsg += ' Must be exactly 8 or 11 characters long.';
      } else {
        errorMsg += ' Ensure the first 4 characters are letters (Bank), followed by 2 letters (Country Code).';
      }
      setResult({ isValid: false, bic: cleanBic, error: errorMsg });
      return;
    }

    // Extract components
    const bankCode = cleanBic.substring(0, 4);
    const countryCode = cleanBic.substring(4, 6);
    const locationCode = cleanBic.substring(6, 8);
    const branchCode = cleanBic.length === 11 ? cleanBic.substring(8, 11) : 'XXX';

    const isSepa = SEPA_COUNTRIES.has(countryCode);

    // Check mock database
    const matchedDbEntry = MOCK_BIC_DATABASE[cleanBic] || MOCK_BIC_DATABASE[`${cleanBic.substring(0, 8)}XXX`];

    let bankDetails: BankDetails;

    if (matchedDbEntry) {
      bankDetails = {
        bic: cleanBic,
        bankName: matchedDbEntry.bankName,
        country: matchedDbEntry.country,
        countryCode: matchedDbEntry.countryCode,
        city: matchedDbEntry.city,
        branch: cleanBic.length === 11 && cleanBic !== `${cleanBic.substring(0, 8)}XXX` 
          ? `Branch: ${branchCode}` 
          : matchedDbEntry.branch,
        isSepa: matchedDbEntry.isSepa
      };
    } else {
      // Fallback parser if not in mock database
      // Try to resolve country name from ISO code
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      let countryName = 'Unknown Country';
      try {
        countryName = regionNames.of(countryCode) || countryCode;
      } catch {
        countryName = `Country Code: ${countryCode}`;
      }

      bankDetails = {
        bic: cleanBic,
        bankName: `Bank (${bankCode}...)`,
        country: countryName,
        countryCode: countryCode,
        city: `Location Code: ${locationCode}`,
        branch: branchCode === 'XXX' ? 'Primary Office' : `Branch Code: ${branchCode}`,
        isSepa: isSepa
      };
    }

    const validationSuccess: ValidationResult = {
      isValid: true,
      bic: cleanBic,
      details: bankDetails
    };

    setResult(validationSuccess);
    saveToHistory(bankDetails);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickSelect = (bic: string) => {
    setBicInput(bic);
    handleValidate(bic);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="relative p-6 md:p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowInfoModal(true)}
            className="text-slate-400 hover:text-indigo-400 transition-colors duration-200"
            title="What is SWIFT/BIC?"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">Utility Tool</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">SWIFT / BIC Validator</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Verify destination bank details, location, and SEPA transfer eligibility instantly before initiating international payments.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <label htmlFor="bic-input" className="block text-sm font-medium text-slate-300">
            Enter SWIFT / BIC Code
          </label>
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="bic-input"
                type="text"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 uppercase tracking-widest font-mono text-lg"
                placeholder="e.g. HKBAAU2SBNE"
                value={bicInput}
                onChange={(e) => setBicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate(bicInput)}
              />
            </div>
            <button
              onClick={() => handleValidate(bicInput)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              Verify Code
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Format: 8 or 11 alphanumeric characters (AAAA PP LL DDD)
          </p>
        </div>

        {/* Validation Result Display */}
        {result && (
          <div className={`rounded-xl border p-5 transition-all duration-300 ${
            result.isValid 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
          }`}>
            {result.isValid && result.details ? (
              <div className="space-y-4">
                {/* Success Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-emerald-400">Valid SWIFT/BIC Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.details.isSepa ? (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        SEPA Eligible
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full">
                        Non-SEPA (SWIFT Wire)
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(result.bic)}
                      className="p-1.5 hover:bg-emerald-500/10 rounded text-emerald-400 transition-colors"
                      title="Copy BIC"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bank Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider">Bank Name</span>
                      <span className="font-medium text-white text-base">{result.details.bankName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe2 className="w-5 h-5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider">Country</span>
                      <span className="font-medium text-white text-base flex items-center gap-1.5">
                        <span>{getFlagEmoji(result.details.countryCode)}</span>
                        {result.details.country} ({result.details.countryCode})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider">City / Location</span>
                      <span className="font-medium text-white text-base">{result.details.city}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400 uppercase tracking-wider">Branch Details</span>
                      <span className="font-medium text-white text-base">{result.details.branch}</span>
                    </div>
                  </div>
                </div>

                {/* SEPA Transfer Notice */}
                {result.details.isSepa && (
                  <div className="mt-2 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                    <p>
                      This bank is located within the Single Euro Payments Area (SEPA). Transfers in EUR will benefit from low-cost, fast processing times (often instant or next-day).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-rose-400">Validation Failed</h4>
                  <p className="text-sm text-rose-300/90 mt-1">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Demo / Common Codes */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test with Common SWIFT Codes</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(MOCK_BIC_DATABASE).slice(0, 5).map((bic) => (
              <button
                key={bic}
                onClick={() => handleQuickSelect(bic)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-all duration-150"
              >
                {bic}
              </button>
            ))}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="border-t border-slate-800 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <History className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Recent Lookups</h3>
              </div>
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="divide-y divide-slate-800/50 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              {history.map((item, idx) => (
                <div 
                  key={`${item.bic}-${idx}`}
                  onClick={() => handleQuickSelect(item.bic)}
                  className="p-3 flex items-center justify-between hover:bg-slate-900/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
                      {item.bic}
                    </span>
                    <span className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-[280px]">
                      {item.bankName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {getFlagEmoji(item.countryCode)} {item.city}
                    </span>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Info Banner */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
        Secure client-side validation. No banking data is transmitted or stored externally.
      </div>

      {/* Info Modal / Overlay */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                About SWIFT / BIC
              </h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                A <strong>SWIFT code</strong> (or <strong>BIC</strong> - Business Identifier Code) is a standard format approved by the International Organization for Standardization (ISO). It uniquely identifies banks and financial institutions globally.
              </p>
              <p className="font-semibold text-white">Structure of a SWIFT Code:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                <li><span className="text-indigo-400">AAAA</span>: Bank Code (4 letters)</li>
                <li><span className="text-indigo-400">PP</span>: Country Code (2 letters)</li>
                <li><span className="text-indigo-400">LL</span>: Location Code (2 alphanumeric)</li>
                <li><span className="text-indigo-400">DDD</span>: Branch Code (3 optional alphanumeric)</li>
              </ul>
              <p>
                <strong>SEPA Eligibility:</strong> If the country code belongs to the SEPA zone, transfers can be processed as SEPA payments, which are typically faster and cheaper than standard international wire transfers.
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}