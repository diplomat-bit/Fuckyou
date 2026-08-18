import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  Building, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  HelpCircle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PresetOption {
  id: string;
  name: string;
  region: string;
  countryCode: string;
  businessCode: string;
  description: string;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

const PRESETS: PresetOption[] = [
  {
    id: 'na-retail',
    name: 'North America Retail',
    region: 'North America',
    countryCode: 'US',
    businessCode: 'retail',
    description: 'Standard consumer retail operations for US/Canada.'
  },
  {
    id: 'eu-corp',
    name: 'Europe Corporate',
    region: 'Europe',
    countryCode: 'DE',
    businessCode: 'corporate',
    description: 'Enterprise and corporate banking services in EU.'
  },
  {
    id: 'apac-partner',
    name: 'APAC Partner Network',
    region: 'Asia Pacific',
    countryCode: 'SG',
    businessCode: 'partner-hub',
    description: 'Third-party integration hub for Asia-Pacific partners.'
  },
  {
    id: 'latam-digital',
    name: 'LATAM Digital Wealth',
    region: 'Latin America',
    countryCode: 'BR',
    businessCode: 'wealth-dig',
    description: 'Digital wealth management and fintech services.'
  }
];

const BASE_URL_TEMPLATE = 'https://api.global-platform.com/v2/oauth/{countryCode}/{businessCode}/authorize';

export default function OauthCountryBusinessSelector({
  onSelectionChange,
  initialCountryCode = 'US',
  initialBusinessCode = 'retail'
}: {
  onSelectionChange?: (data: { countryCode: string; businessCode: string; isValid: boolean; url: string }) => void;
  initialCountryCode?: string;
  initialBusinessCode?: string;
}) {
  const [countryCode, setCountryCode] = useState<string>(initialCountryCode);
  const [businessCode, setBusinessCode] = useState<string>(initialBusinessCode);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('');

  // Validation states
  const countryValidation = useMemo((): ValidationResult => {
    const trimmed = countryCode.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Country code is required.' };
    }
    if (!/^[A-Za-z]{2}$/.test(trimmed)) {
      return { isValid: false, message: 'Must be exactly 2 alphabetic characters (ISO 3166-1 alpha-2).' };
    }
    return { isValid: true, message: 'Valid ISO country code.' };
  }, [countryCode]);

  const businessValidation = useMemo((): ValidationResult => {
    const trimmed = businessCode.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Business code is required.' };
    }
    if (!/^[a-z0-9\-]{2,15}$/.test(trimmed)) {
      return { 
        isValid: false, 
        message: 'Must be 2-15 characters, lowercase alphanumeric or hyphens only.' 
      };
    }
    return { isValid: true, message: 'Valid business identifier.' };
  }, [businessCode]);

  const isFormValid = countryValidation.isValid && businessValidation.isValid;

  // Generate dynamic URL preview
  const targetUrl = useMemo(() => {
    const cCode = countryValidation.isValid ? countryCode.trim().toLowerCase() : '{countryCode}';
    const bCode = businessValidation.isValid ? businessCode.trim().toLowerCase() : '{businessCode}';
    return BASE_URL_TEMPLATE
      .replace('{countryCode}', cCode)
      .replace('{businessCode}', bCode);
  }, [countryCode, businessCode, countryValidation.isValid, businessValidation.isValid]);

  // Trigger callback on state changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        countryCode: countryCode.trim().toLowerCase(),
        businessCode: businessCode.trim().toLowerCase(),
        isValid: isFormValid,
        url: targetUrl
      });
    }
  }, [countryCode, businessCode, isFormValid, targetUrl, onSelectionChange]);

  const handlePresetSelect = (preset: PresetOption) => {
    setCountryCode(preset.countryCode);
    setBusinessCode(preset.businessCode);
    setActivePreset(preset.id);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleReset = () => {
    setCountryCode(initialCountryCode);
    setBusinessCode(initialBusinessCode);
    setActivePreset('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">OAuth Path Parameter Configurator</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure dynamic routing parameters for secure OAuth handshakes.</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Presets Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            Global Region Presets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id || 
                (countryCode.toUpperCase() === preset.countryCode.toUpperCase() && 
                 businessCode.toLowerCase() === preset.businessCode.toLowerCase());
              
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`group text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                      {preset.region}
                    </span>
                    {isSelected && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800/60 w-fit">
                    <span>{preset.countryCode}</span>
                    <span className="text-slate-700">/</span>
                    <span>{preset.businessCode}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Code Input */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                Country Code <span className="text-rose-500">*</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">ISO 2-Letter</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={2}
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value.toUpperCase());
                  setActivePreset('');
                }}
                placeholder="e.g. US"
                className={`w-full bg-slate-950 border rounded-xl py-3 pl-4 pr-10 text-sm font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  countryValidation.isValid 
                    ? 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20' 
                    : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {countryValidation.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
            </div>
            <p className={`text-xs flex items-center gap-1.5 ${
              countryValidation.isValid ? 'text-slate-400' : 'text-rose-400'
            }`}>
              {!countryValidation.isValid && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {countryValidation.message}
            </p>
          </div>

          {/* Business Code Input */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                Business Code <span className="text-rose-500">*</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">Alphanumeric</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={15}
                value={businessCode}
                onChange={(e) => {
                  setBusinessCode(e.target.value.toLowerCase());
                  setActivePreset('');
                }}
                placeholder="e.g. retail"
                className={`w-full bg-slate-950 border rounded-xl py-3 pl-4 pr-10 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  businessValidation.isValid 
                    ? 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20' 
                    : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {businessValidation.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
            </div>
            <p className={`text-xs flex items-center gap-1.5 ${
              businessValidation.isValid ? 'text-slate-400' : 'text-rose-400'
            }`}>
              {!businessValidation.isValid && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {businessValidation.message}
            </p>
          </div>
        </div>

        {/* Dynamic URL Preview */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target URL Preview</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isFormValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {isFormValid ? 'Ready to Route' : 'Incomplete Parameters'}
              </span>
            </div>
          </div>

          <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-800 p-3.5 font-mono text-xs overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <span className="text-slate-500 select-none">https://api.global-platform.com/v2/oauth/</span>
            <span className={`px-1.5 py-0.5 mx-0.5 rounded font-bold transition-all ${
              countryValidation.isValid 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
            }`}>
              {countryValidation.isValid ? countryCode.trim().toLowerCase() : 'countryCode'}
            </span>
            <span className="text-slate-500 select-none">/</span>
            <span className={`px-1.5 py-0.5 mx-0.5 rounded font-bold transition-all ${
              businessValidation.isValid 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
            }`}>
              {businessValidation.isValid ? businessCode.trim().toLowerCase() : 'businessCode'}
            </span>
            <span className="text-slate-500 select-none">/authorize</span>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 pl-3">
              <button
                onClick={handleCopy}
                disabled={!isFormValid}
                className={`p-2 rounded-md border transition-all ${
                  isFormValid 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' 
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
                title="Copy URL to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span>
              This URL is dynamically constructed based on your inputs. In production, this endpoint will handle the initial handshake and redirect users to the region-specific identity provider.
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Action Bar */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Dynamic Routing Engine Active</span>
        </div>
        <button
          disabled={!isFormValid}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isFormValid 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 cursor-pointer' 
              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
          }`}
        >
          <span>Proceed with Configuration</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}