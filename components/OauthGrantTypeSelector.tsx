import React, { useState, useEffect, useCallback } from 'react';
import { 
  Key, 
  RefreshCw, 
  Code, 
  Lock, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Terminal,
  Layers
} from 'lucide-react';

// --- Types & Interfaces ---

export type GrantType = 'authorization_code' | 'client_credentials' | 'refresh_token';

export interface GrantTypeOption {
  id: GrantType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export interface FormValues {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  refreshToken: string;
  scope: string;
}

export interface FormErrors {
  clientId?: string;
  clientSecret?: string;
  code?: string;
  redirectUri?: string;
  refreshToken?: string;
  scope?: string;
}

export interface OauthGrantTypeSelectorProps {
  initialGrantType?: GrantType;
  onChange?: (data: { grantType: GrantType; values: Partial<FormValues>; isValid: boolean }) => void;
  onSubmit?: (data: { grantType: GrantType; values: Partial<FormValues> }) => void;
  className?: string;
}

// --- Constants ---

const GRANT_TYPES: GrantTypeOption[] = [
  {
    id: 'authorization_code',
    title: 'Authorization Code',
    description: 'Web apps, mobile apps, and single-page applications with user interaction.',
    icon: Code,
  },
  {
    id: 'client_credentials',
    title: 'Client Credentials',
    description: 'Machine-to-machine (M2M) communication, cron jobs, and backend services.',
    icon: Key,
  },
  {
    id: 'refresh_token',
    title: 'Refresh Token',
    description: 'Exchange a refresh token to obtain a new access token without user interaction.',
    icon: RefreshCw,
  },
];

const INITIAL_VALUES: FormValues = {
  clientId: '',
  clientSecret: '',
  code: '',
  redirectUri: '',
  refreshToken: '',
  scope: '',
};

export default function OauthGrantTypeSelector({
  initialGrantType = 'authorization_code',
  onChange,
  onSubmit,
  className = '',
}: OauthGrantTypeSelectorProps) {
  // --- State ---
  const [grantType, setGrantType] = useState<GrantType>(initialGrantType);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // --- Validation Logic ---
  const validateField = useCallback((name: keyof FormValues, value: string, currentGrantType: GrantType): string | undefined => {
    if (!value && name !== 'scope' && name !== 'clientSecret') {
      // clientSecret is optional only for public clients in auth_code, but let's make it required for safety unless specified
      if (currentGrantType === 'authorization_code' && name === 'clientSecret') {
        return undefined; // Optional for public clients
      }
      return 'This field is required';
    }

    if (name === 'clientSecret' && !value && currentGrantType !== 'authorization_code') {
      return 'Client secret is required';
    }

    if (name === 'redirectUri' && value) {
      try {
        new URL(value);
      } catch (_) {
        return 'Please enter a valid URL (e.g., https://example.com/callback)';
      }
    }

    return undefined;
  }, []);

  const validateForm = useCallback((currentValues: FormValues, currentGrantType: GrantType): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Determine which fields are active based on grant type
    const activeFields = getActiveFields(currentGrantType);
    
    activeFields.forEach((field) => {
      const error = validateField(field, currentValues[field], currentGrantType);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  }, [validateField]);

  // --- Helper to get active fields for current grant type ---
  function getActiveFields(type: GrantType): (keyof FormValues)[] {
    switch (type) {
      case 'authorization_code':
        return ['clientId', 'clientSecret', 'code', 'redirectUri'];
      case 'client_credentials':
        return ['clientId', 'clientSecret', 'scope'];
      case 'refresh_token':
        return ['clientId', 'clientSecret', 'refreshToken'];
      default:
        return [];
    }
  }

  // --- Effects ---
  // Trigger validation and parent onChange when values or grant type changes
  useEffect(() => {
    const currentErrors = validateForm(values, grantType);
    const activeFields = getActiveFields(grantType);
    const hasErrors = activeFields.some((field) => !!currentErrors[field]);
    
    // Filter values to only include active fields
    const activeValues = activeFields.reduce((acc, field) => {
      acc[field] = values[field];
      return acc;
    }, {} as Partial<FormValues>);

    if (onChange) {
      onChange({
        grantType,
        values: activeValues,
        isValid: !hasErrors,
      });
    }
    setErrors(currentErrors);
  }, [values, grantType, validateForm]);

  // --- Handlers ---
  const handleGrantTypeChange = (type: GrantType) => {
    setGrantType(type);
    setTouched({});
    setSubmitSuccess(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setSubmitSuccess(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all active fields as touched
    const activeFields = getActiveFields(grantType);
    const allTouched = activeFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    const currentErrors = validateForm(values, grantType);
    const hasErrors = activeFields.some((field) => !!currentErrors[field]);

    if (!hasErrors) {
      setIsSubmitting(true);
      setSubmitSuccess(false);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        
        const activeValues = activeFields.reduce((acc, field) => {
          acc[field] = values[field];
          return acc;
        }, {} as Partial<FormValues>);

        if (onSubmit) {
          onSubmit({ grantType, values: activeValues });
        }
      }, 1000);
    }
  };

  // --- Code Generator Helper ---
  const generateCurlCommand = (): string => {
    const activeFields = getActiveFields(grantType);
    let curl = `curl -X POST https://oauth2.provider.com/token \\\n`;
    curl += `  -H "Content-Type: application/x-www-form-urlencoded" \\\n`;
    
    const params: string[] = [`grant_type=${grantType}`];
    
    if (activeFields.includes('clientId') && values.clientId) {
      params.push(`client_id=${values.clientId}`);
    }
    if (activeFields.includes('clientSecret') && values.clientSecret) {
      params.push(`client_secret=${values.clientSecret}`);
    }
    if (activeFields.includes('code') && values.code) {
      params.push(`code=${values.code}`);
    }
    if (activeFields.includes('redirectUri') && values.redirectUri) {
      params.push(`redirect_uri=${encodeURIComponent(values.redirectUri)}`);
    }
    if (activeFields.includes('refreshToken') && values.refreshToken) {
      params.push(`refresh_token=${values.refreshToken}`);
    }
    if (activeFields.includes('scope') && values.scope) {
      params.push(`scope=${encodeURIComponent(values.scope)}`);
    }

    curl += params.map(p => `  -d "${p}"`).join(' \\\n');
    return curl;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCurlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFields = getActiveFields(grantType);

  return (
    <div className={`w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">OAuth 2.0 Grant Type Selector</h2>
            <p className="text-sm text-slate-400">Select a flow, fill in the parameters, and generate your token request.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: Selector & Form */}
        <div className="lg:col-span-7 p-6 space-y-6">
          {/* Grant Type Cards */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Grant Type</label>
            <div className="grid grid-cols-1 gap-3">
              {GRANT_TYPES.map((option) => {
                const Icon = option.icon;
                const isSelected = grantType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleGrantTypeChange(option.id)}
                    className={`flex items-start text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-4 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm flex items-center justify-between">
                        {option.title}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Configuration Parameters</label>
              <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {grantType.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4">
              {/* Client ID */}
              {activeFields.includes('clientId') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Client ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="clientId"
                      value={values.clientId}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., client_abc123xyz"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                        touched.clientId && errors.clientId
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    {touched.clientId && errors.clientId && (
                      <div className="absolute right-3 top-2.5 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                  {touched.clientId && errors.clientId && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.clientId}
                    </p>
                  )}
                </div>
              )}

              {/* Client Secret */}
              {activeFields.includes('clientSecret') && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Client Secret 
                      {grantType === 'authorization_code' && <span className="text-slate-500 font-normal ml-1">(Optional for public clients)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 focus:outline-none"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      name="clientSecret"
                      value={values.clientSecret}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="••••••••••••••••••••"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                        touched.clientSecret && errors.clientSecret
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    {touched.clientSecret && errors.clientSecret && (
                      <div className="absolute right-3 top-2.5 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                  {touched.clientSecret && errors.clientSecret && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.clientSecret}
                    </p>
                  )}
                </div>
              )}

              {/* Authorization Code */}
              {activeFields.includes('code') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Authorization Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="code"
                      value={values.code}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., splat_code_987654321"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                        touched.code && errors.code
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    {touched.code && errors.code && (
                      <div className="absolute right-3 top-2.5 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                  {touched.code && errors.code && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.code}
                    </p>
                  )}
                </div>
              )}

              {/* Redirect URI */}
              {activeFields.includes('redirectUri') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Redirect URI</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="redirectUri"
                      value={values.redirectUri}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., https://myapp.com/oauth/callback"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                        touched.redirectUri && errors.redirectUri
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    {touched.redirectUri && errors.redirectUri && (
                      <div className="absolute right-3 top-2.5 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                  {touched.redirectUri && errors.redirectUri && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.redirectUri}
                    </p>
                  )}
                </div>
              )}

              {/* Refresh Token */}
              {activeFields.includes('refreshToken') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Refresh Token</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="refreshToken"
                      value={values.refreshToken}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g., rfr_token_88888888"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                        touched.refreshToken && errors.refreshToken
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    {touched.refreshToken && errors.refreshToken && (
                      <div className="absolute right-3 top-2.5 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                  {touched.refreshToken && errors.refreshToken && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.refreshToken}
                    </p>
                  )}
                </div>
              )}

              {/* Scope */}
              {activeFields.includes('scope') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Scope <span className="text-slate-500 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    name="scope"
                    value={values.scope}
                    onChange={handleInputChange}
                    placeholder="e.g., read write offline_access"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Validating & Requesting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Test Token Request
                </>
              )}
            </button>

            {/* Success Message */}
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2.5 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Validation passed! Request payload is fully structured and ready.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Request Preview */}
        <div className="lg:col-span-5 p-6 bg-slate-950/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">cURL Request Preview</span>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-xs"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed min-h-[240px] max-h-[360px] lg:max-h-none">
              <pre className="whitespace-pre-wrap break-all">{generateCurlCommand()}</pre>
            </div>
          </div>

          {/* Educational / Helper Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800/60 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300">Flow Details:</div>
            {grantType === 'authorization_code' && (
              <p>
                The <strong className="text-indigo-400">Authorization Code</strong> flow is highly secure because it exchanges an authorization code for a token on a secure backend, preventing exposure of the access token to the user agent.
              </p>
            )}
            {grantType === 'client_credentials' && (
              <p>
                The <strong className="text-indigo-400">Client Credentials</strong> flow is used for server-to-server authentication. No user context is involved; the client acts on its own behalf.
              </p>
            )}
            {grantType === 'refresh_token' && (
              <p>
                The <strong className="text-indigo-400">Refresh Token</strong> flow allows clients to bypass user interaction to keep sessions alive seamlessly by exchanging a long-lived refresh token for a new short-lived access token.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}