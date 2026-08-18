import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  CreditCard,
  Search,
  HelpCircle
} from 'lucide-react';

// Detailed SEPA Country Rules
interface SepaCountry {
  name: string;
  code: string;
  length: number;
  regex: RegExp;
  flag: string;
  currency: string;
  bbanStructure: string; // Friendly description of the BBAN structure
}

const SEPA_COUNTRIES: Record<string, SepaCountry> = {
  AT: { name: 'Austria', code: 'AT', length: 20, regex: /^AT\d{18}$/, flag: '🇦🇹', currency: 'EUR', bbanStructure: '5-digit Bank Code, 11-digit Account Number' },
  BE: { name: 'Belgium', code: 'BE', length: 16, regex: /^BE\d{14}$/, flag: '🇧🇪', currency: 'EUR', bbanStructure: '3-digit Bank Code, 7-digit Account Number, 2-digit Check Digits' },
  BG: { name: 'Bulgaria', code: 'BG', length: 22, regex: /^BG\d{2}[A-Z]{4}\d{6}[A-Z0-9]{8}$/, flag: '🇧🇬', currency: 'BGN', bbanStructure: '4-char Bank Code, 4-digit Branch Code, 2-digit Account Type, 8-char Account Number' },
  CH: { name: 'Switzerland', code: 'CH', length: 21, regex: /^CH\d{7}[A-Z0-9]{12}$/, flag: '🇨🇭', currency: 'CHF', bbanStructure: '5-digit Bank Code, 12-char Account Number' },
  CY: { name: 'Cyprus', code: 'CY', length: 28, regex: /^CY\d{10}[A-Z0-9]{16}$/, flag: '🇨🇾', currency: 'EUR', bbanStructure: '3-digit Bank Code, 5-digit Branch Code, 16-char Account Number' },
  CZ: { name: 'Czech Republic', code: 'CZ', length: 24, regex: /^CZ\d{22}$/, flag: '🇨🇿', currency: 'CZK', bbanStructure: '4-digit Bank Code, 6-digit Prefix, 10-digit Account Number' },
  DE: { name: 'Germany', code: 'DE', length: 22, regex: /^DE\d{20}$/, flag: '🇩🇪', currency: 'EUR', bbanStructure: '8-digit Bank Code (BLZ), 10-digit Account Number' },
  DK: { name: 'Denmark', code: 'DK', length: 18, regex: /^DK\d{16}$/, flag: '🇩🇰', currency: 'DKK', bbanStructure: '4-digit Bank Code, 10-digit Account Number, 2-digit Check Digits' },
  EE: { name: 'Estonia', code: 'EE', length: 20, regex: /^EE\d{18}$/, flag: '🇪🇪', currency: 'EUR', bbanStructure: '2-digit Bank Code, 2-digit Branch Code, 11-digit Account Number, 1-digit Check Digit' },
  ES: { name: 'Spain', code: 'ES', length: 24, regex: /^ES\d{22}$/, flag: '🇪🇸', currency: 'EUR', bbanStructure: '4-digit Bank Code, 4-digit Branch Code, 2-digit Check Digits, 10-digit Account Number' },
  FI: { name: 'Finland', code: 'FI', length: 18, regex: /^FI\d{16}$/, flag: '🇫🇮', currency: 'EUR', bbanStructure: '6-digit Bank & Branch Code, 7-digit Account Number, 1-digit Check Digit' },
  FR: { name: 'France', code: 'FR', length: 27, regex: /^FR\d{12}[A-Z0-9]{11}\d{2}$/, flag: '🇫🇷', currency: 'EUR', bbanStructure: '5-digit Bank Code, 5-digit Branch Code, 11-char Account Number, 2-digit National Check Digits' },
  GB: { name: 'United Kingdom', code: 'GB', length: 22, regex: /^GB\d{2}[A-Z]{4}\d{14}$/, flag: '🇬🇧', currency: 'GBP', bbanStructure: '4-char Bank Code, 6-digit Sort Code, 8-digit Account Number' },
  GI: { name: 'Gibraltar', code: 'GI', length: 23, regex: /^GI\d{2}[A-Z]{4}[A-Z0-9]{15}$/, flag: '🇬🇮', currency: 'GIP', bbanStructure: '4-char Bank Code, 15-char Account Number' },
  GR: { name: 'Greece', code: 'GR', length: 27, regex: /^GR\d{9}[A-Z0-9]{16}$/, flag: '🇬🇷', currency: 'EUR', bbanStructure: '3-digit Bank Code, 4-digit Branch Code, 16-char Account Number' },
  HR: { name: 'Croatia', code: 'HR', length: 21, regex: /^HR\d{19}$/, flag: '🇭🇷', currency: 'EUR', bbanStructure: '7-digit Bank Code, 10-digit Account Number' },
  HU: { name: 'Hungary', code: 'HU', length: 28, regex: /^HU\d{26}$/, flag: '🇭🇺', currency: 'HUF', bbanStructure: '3-digit Bank Code, 4-digit Branch Code, 1-digit Check Digit, 15-digit Account Number, 1-digit Check Digit' },
  IE: { name: 'Ireland', code: 'IE', length: 22, regex: /^IE\d{2}[A-Z]{4}\d{14}$/, flag: '🇮🇪', currency: 'EUR', bbanStructure: '4-char Bank Code, 6-digit Sort Code, 8-digit Account Number' },
  IS: { name: 'Iceland', code: 'IS', length: 26, regex: /^IS\d{24}$/, flag: '🇮🇸', currency: 'ISK', bbanStructure: '4-digit Bank Code, 2-digit Branch Code, 6-digit Account Number, 10-digit Kennitala (ID)' },
  IT: { name: 'Italy', code: 'IT', length: 27, regex: /^IT\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/, flag: '🇮🇹', currency: 'EUR', bbanStructure: '1-char Check Digit, 5-digit Bank Code (ABI), 5-digit Branch Code (CAB), 12-char Account Number' },
  LI: { name: 'Liechtenstein', code: 'LI', length: 21, regex: /^LI\d{7}[A-Z0-9]{12}$/, flag: '🇱🇮', currency: 'CHF', bbanStructure: '5-digit Bank Code, 12-char Account Number' },
  LT: { name: 'Lithuania', code: 'LT', length: 20, regex: /^LT\d{18}$/, flag: '🇱🇹', currency: 'EUR', bbanStructure: '5-digit Bank Code, 11-digit Account Number' },
  LU: { name: 'Luxembourg', code: 'LU', length: 20, regex: /^LU\d{5}[A-Z0-9]{13}$/, flag: '🇱🇺', currency: 'EUR', bbanStructure: '3-digit Bank Code, 13-char Account Number' },
  LV: { name: 'Latvia', code: 'LV', length: 21, regex: /^LV\d{2}[A-Z]{4}[A-Z0-9]{13}$/, flag: '🇱🇻', currency: 'EUR', bbanStructure: '4-char Bank Code, 13-char Account Number' },
  MC: { name: 'Monaco', code: 'MC', length: 27, regex: /^MC\d{12}[A-Z0-9]{11}\d{2}$/, flag: '🇲🇨', currency: 'EUR', bbanStructure: '5-digit Bank Code, 5-digit Branch Code, 11-char Account Number, 2-digit Check Digits' },
  MT: { name: 'Malta', code: 'MT', length: 31, regex: /^MT\d{2}[A-Z]{4}\d{5}[A-Z0-9]{18}$/, flag: '🇲🇹', currency: 'EUR', bbanStructure: '4-char Bank Code, 5-digit Branch Code, 18-char Account Number' },
  NL: { name: 'Netherlands', code: 'NL', length: 18, regex: /^NL\d{2}[A-Z]{4}\d{10}$/, flag: '🇳🇱', currency: 'EUR', bbanStructure: '4-char Bank Code, 10-digit Account Number' },
  NO: { name: 'Norway', code: 'NO', length: 15, regex: /^NO\d{13}$/, flag: '🇳🇴', currency: 'NOK', bbanStructure: '4-digit Bank Code, 6-digit Account Number, 1-digit Check Digit' },
  PL: { name: 'Poland', code: 'PL', length: 28, regex: /^PL\d{26}$/, flag: '🇵🇱', currency: 'PLN', bbanStructure: '8-digit Bank Code, 16-digit Account Number' },
  PT: { name: 'Portugal', code: 'PT', length: 25, regex: /^PT\d{23}$/, flag: '🇵🇹', currency: 'EUR', bbanStructure: '4-digit Bank Code, 4-digit Branch Code, 11-digit Account Number, 2-digit Check Digits' },
  RO: { name: 'Romania', code: 'RO', length: 24, regex: /^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/, flag: '🇷🇴', currency: 'RON', bbanStructure: '4-char Bank Code, 16-char Account Number' },
  SE: { name: 'Sweden', code: 'SE', length: 24, regex: /^SE\d{22}$/, flag: '🇸🇪', currency: 'SEK', bbanStructure: '3-digit Bank Code, 17-digit Account Number' },
  SI: { name: 'Slovenia', code: 'SI', length: 19, regex: /^SI\d{17}$/, flag: '🇸🇮', currency: 'EUR', bbanStructure: '5-digit Bank Code, 8-digit Account Number, 2-digit Check Digits' },
  SK: { name: 'Slovakia', code: 'SK', length: 24, regex: /^SK\d{22}$/, flag: '🇸🇰', currency: 'EUR', bbanStructure: '4-digit Bank Code, 6-digit Prefix, 10-digit Account Number' },
  SM: { name: 'San Marino', code: 'SM', length: 27, regex: /^SM\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/, flag: '🇸🇲', currency: 'EUR', bbanStructure: '1-char Check Digit, 5-digit Bank Code, 5-digit Branch Code, 12-char Account Number' },
};

// Sample Valid IBANs for testing
const SAMPLE_IBANS = [
  { label: 'Germany (DE)', value: 'DE89 3704 0044 0532 0130 00', desc: 'Deutsche Bank' },
  { label: 'France (FR)', value: 'FR76 3000 6000 0112 3456 7890 184', desc: 'Société Générale' },
  { label: 'Netherlands (NL)', value: 'NL91 ABNA 0417 1234 56', desc: 'ABN AMRO' },
  { label: 'United Kingdom (GB)', value: 'GB29 BUXB 6016 1331 9268 19', desc: 'Barclays Bank' },
  { label: 'Spain (ES)', value: 'ES30 2100 0418 4502 0005 1332', desc: 'CaixaBank' },
];

interface ValidationState {
  isValid: boolean;
  errors: string[];
  country?: SepaCountry;
  formattedIban: string;
  rawIban: string;
  checks: {
    countryDetected: boolean;
    lengthValid: boolean;
    formatValid: boolean;
    checksumValid: boolean;
    isSepa: boolean;
  };
  breakdown?: {
    countryCode: string;
    checkDigits: string;
    bban: string;
    bankCode?: string;
    accountNumber?: string;
  };
}

export default function IbanValidator() {
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Clean and format input helper
  const cleanIban = (val: string) => val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  const formatIbanDisplay = (val: string) => {
    const cleaned = cleanIban(val);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  // Modulo 97 calculation for large numbers (IBAN standard)
  const calculateMod97 = (ibanStr: string): boolean => {
    // Move first 4 characters to the end
    const rearranged = ibanStr.slice(4) + ibanStr.slice(0, 4);
    
    // Convert letters to numbers (A=10, B=11, ..., Z=35)
    const numericStr = rearranged
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return (code - 55).toString();
        }
        return char;
      })
      .join('');

    // Perform modulo 97 on large string integer
    try {
      const bigIntVal = BigInt(numericStr);
      return bigIntVal % 97n === 1n;
    } catch (e) {
      // Fallback for environments without BigInt support (though rare now)
      let checksum = 0;
      for (let i = 0; i < numericStr.length; i++) {
        checksum = (checksum * 10 + parseInt(numericStr.charAt(i), 10)) % 97;
      }
      return checksum === 1;
    }
  };

  // Main validation logic
  const validationResult = useMemo((): ValidationState => {
    const raw = cleanIban(inputValue);
    const formatted = formatIbanDisplay(inputValue);
    
    const state: ValidationState = {
      isValid: false,
      errors: [],
      formattedIban: formatted,
      rawIban: raw,
      checks: {
        countryDetected: false,
        lengthValid: false,
        formatValid: false,
        checksumValid: false,
        isSepa: false,
      }
    };

    if (!raw) {
      return state;
    }

    // 1. Country Code Check
    const countryCode = raw.slice(0, 2);
    if (countryCode.length < 2 || !/^[A-Z]{2}$/.test(countryCode)) {
      state.errors.push('IBAN must start with a 2-letter country code.');
      return state;
    }

    const country = SEPA_COUNTRIES[countryCode];
    if (!country) {
      state.errors.push(`Country code "${countryCode}" is not a recognized SEPA member.`);
      return state;
    }

    state.country = country;
    state.checks.countryDetected = true;
    state.checks.isSepa = true;

    // 2. Length Check
    if (raw.length !== country.length) {
      state.errors.push(`Invalid length. IBAN for ${country.name} must be exactly ${country.length} characters (currently ${raw.length}).`);
      state.checks.lengthValid = false;
    } else {
      state.checks.lengthValid = true;
    }

    // 3. Format / Regex Check
    const isFormatValid = country.regex.test(raw);
    if (!isFormatValid) {
      state.errors.push(`Format mismatch for ${country.name}. Expected structure: ${country.bbanStructure}`);
      state.checks.formatValid = false;
    } else {
      state.checks.formatValid = true;
    }

    // 4. Checksum Modulo 97 Check
    const isChecksumValid = calculateMod97(raw);
    if (!isChecksumValid) {
      state.errors.push('Checksum validation failed. The IBAN contains a typo or is mathematically invalid.');
      state.checks.checksumValid = false;
    } else {
      state.checks.checksumValid = true;
    }

    // Overall Validity
    state.isValid = state.checks.lengthValid && state.checks.formatValid && state.checks.checksumValid;

    // Extract breakdown if we have enough characters
    if (raw.length >= 4) {
      const checkDigits = raw.slice(2, 4);
      const bban = raw.slice(4);
      
      // Basic heuristic for Bank Code & Account Number extraction
      let bankCode = undefined;
      let accountNumber = undefined;

      if (countryCode === 'DE' && bban.length === 18) {
        bankCode = bban.slice(0, 8);
        accountNumber = bban.slice(8);
      } else if (countryCode === 'FR' && bban.length === 23) {
        bankCode = bban.slice(0, 5);
        accountNumber = bban.slice(10, 21);
      } else if (countryCode === 'NL' && bban.length === 14) {
        bankCode = bban.slice(0, 4);
        accountNumber = bban.slice(4);
      } else if (countryCode === 'GB' && bban.length === 18) {
        bankCode = bban.slice(0, 4);
        accountNumber = bban.slice(10);
      }

      state.breakdown = {
        countryCode,
        checkDigits,
        bban,
        bankCode,
        accountNumber
      };
    }

    return state;
  }, [inputValue]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!validationResult.rawIban) return;
    navigator.clipboard.writeText(validationResult.formattedIban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load sample IBAN
  const loadSample = (val: string) => {
    setInputValue(val);
  };

  // Clear input
  const clearInput = () => {
    setInputValue('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">SEPA IBAN Validator</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Validate International Bank Account Numbers with country-specific rules for SEPA countries.
          </p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg transition-colors self-start md:self-center"
        >
          <HelpCircle className="w-4 h-4 text-blue-400" />
          {showHelp ? 'Hide Guide' : 'How it works'}
        </button>
      </div>

      {/* Help Guide */}
      {showHelp && (
        <div className="bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 p-5 rounded-2xl text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Understanding IBAN Validation
          </h3>
          <p>
            An IBAN (International Bank Account Number) is structured to uniquely identify an account anywhere in the world. This validator performs four layers of checks:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Country Code:</strong> Verifies if the first two letters belong to a SEPA-participating country.</li>
            <li><strong>Length Check:</strong> Ensures the character count matches the specific country's standard (e.g., 22 for Germany, 27 for France).</li>
            <li><strong>Format Check:</strong> Validates the alphanumeric structure of the BBAN (Basic Bank Account Number) using country-specific regex.</li>
            <li><strong>Checksum (Modulo 97):</strong> Converts the entire IBAN into a massive integer and verifies that the remainder is 1 when divided by 97 (ISO 7064).</li>
          </ul>
        </div>
      )}

      {/* Main Validator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input & Quick Samples */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Enter IBAN
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="e.g. DE89 3704 0044 0532 0130 00"
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {inputValue && (
                    <button
                      onClick={clearInput}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      title="Clear input"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    disabled={!validationResult.rawIban}
                    className={`p-2 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 disabled:opacity-50'
                    }`}
                    title="Copy formatted IBAN"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Click to test valid samples
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IBANS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSample(sample.value)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-700/50 text-left"
                  >
                    <div className="font-semibold">{sample.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[180px]">
                      {sample.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Validation Status & Breakdown */}
          {validationResult.rawIban && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
              {/* Big Status Banner */}
              <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                validationResult.isValid 
                  ? 'bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-300' 
                  : 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300'
              }`}>
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-base">
                    {validationResult.isValid ? 'Valid SEPA IBAN' : 'Invalid IBAN'}
                  </h3>
                  <p className="text-xs opacity-90 mt-1">
                    {validationResult.isValid 
                      ? 'This IBAN is correctly formatted and has passed the mathematical checksum validation.' 
                      : validationResult.errors[0] || 'Please check the format and try again.'}
                  </p>
                </div>
              </div>

              {/* Structure Breakdown Visualizer */}
              {validationResult.breakdown && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    IBAN Structure Breakdown
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                    {/* Visual Blocks */}
                    <div className="flex flex-wrap gap-1 font-mono text-sm md:text-base font-bold">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-500/20" title="Country Code">
                        {validationResult.breakdown.countryCode}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded border border-purple-500/20" title="Check Digits">
                        {validationResult.breakdown.checkDigits}
                      </span>
                      {validationResult.breakdown.bankCode ? (
                        <>
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20" title="Bank Code">
                            {validationResult.breakdown.bankCode}
                          </span>
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20" title="Account Number">
                            {validationResult.breakdown.bban.slice(validationResult.breakdown.bankCode.length)}
                          </span>
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded border border-slate-500/20" title="Basic Bank Account Number (BBAN)">
                          {validationResult.breakdown.bban}
                        </span>
                      )}
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                      <div>
                        <span className="block text-slate-400">Country Code</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{validationResult.breakdown.countryCode}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Check Digits</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{validationResult.breakdown.checkDigits}</span>
                      </div>
                      {validationResult.breakdown.bankCode && (
                        <div>
                          <span className="block text-slate-400">Bank Identifier</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{validationResult.breakdown.bankCode}</span>
                        </div>
                      )}
                      <div>
                        <span className="block text-slate-400">Account Number</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate block">
                          {validationResult.breakdown.accountNumber || validationResult.breakdown.bban}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Country Info & Checklists */}
        <div className="space-y-6">
          {/* Country Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Country of Origin
            </h3>
            {validationResult.country ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl" role="img" aria-label={validationResult.country.name}>
                    {validationResult.country.flag}
                  </span>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {validationResult.country.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      SEPA Member Country
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ISO Code:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{validationResult.country.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Currency:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{validationResult.country.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Length:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{validationResult.country.length} characters</span>
                  </div>
                  <div className="pt-2">
                    <span className="block text-xs text-slate-400 mb-1">BBAN Structure:</span>
                    <span className="block text-xs bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {validationResult.country.bbanStructure}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 space-y-2">
                <Globe className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                <p className="text-xs">
                  Enter a valid SEPA IBAN prefix (e.g., DE, FR, ES) to detect country details.
                </p>
              </div>
            )}
          </div>

          {/* Validation Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Validation Checklist
            </h3>
            <div className="space-y-3">
              {/* Check 1: Country Detection */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">SEPA Country Detected</span>
                {validationResult.rawIban ? (
                  validationResult.checks.countryDetected ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700" />
                )}
              </div>

              {/* Check 2: Length */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Correct Character Length</span>
                {validationResult.rawIban ? (
                  validationResult.checks.lengthValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700" />
                )}
              </div>

              {/* Check 3: Format */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Structure & Format Match</span>
                {validationResult.rawIban ? (
                  validationResult.checks.formatValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700" />
                )}
              </div>

              {/* Check 4: Modulo 97 Checksum */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Mathematical Checksum (Mod 97)</span>
                {validationResult.rawIban ? (
                  validationResult.checks.checksumValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}