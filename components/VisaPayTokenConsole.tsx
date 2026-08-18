import React, { useState, useEffect, useMemo, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { callGemini } from '../services/geminiService';
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Cpu, 
  Database, 
  Globe, 
  Sliders, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Info, 
  ArrowRight, 
  Activity, 
  Terminal,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

// Reason codes defined by Visa Token Service (VTS)
interface ReasonCode {
  code: string;
  description: string;
  category: 'SUSPEND' | 'RESUME' | 'DEACTIVATE';
}

const VISA_REASON_CODES: ReasonCode[] = [
  { code: 'LST', description: 'Device Lost', category: 'SUSPEND' },
  { code: 'STN', description: 'Device Stolen', category: 'SUSPEND' },
  { code: 'FRD', description: 'Suspected Fraud', category: 'SUSPEND' },
  { code: 'REPL', description: 'Cardholder Replacement', category: 'DEACTIVATE' },
  { code: 'EXP', description: 'Token Expired', category: 'DEACTIVATE' },
  { code: 'OTH', description: 'Other / Customer Request', category: 'SUSPEND' },
  { code: 'USR', description: 'User Initiated Resume', category: 'RESUME' },
  { code: 'MCH', description: 'Merchant Request Resume', category: 'RESUME' }
];

interface VisaToken {
  tokenId: string;
  tokenNumber: string;
  tokenExpiry: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  tokenRequestorId: string;
  tokenRequestorName: string;
  deviceType: 'Apple Pay' | 'Google Pay' | 'Samsung Pay' | 'Merchant Card-on-File' | 'Wearable';
  deviceName: string;
  lastUsed: string;
  atc: number; // Application Transaction Counter
  panReference: string;
  riskScore: number;
}

export default function VisaPayTokenConsole() {
  const dataContext = useContext(DataContext);
  
  // Mock initial Visa Pay Tokens
  const [tokens, setTokens] = useState<VisaToken[]>([
    {
      tokenId: 'vts-tok-908123441',
      tokenNumber: '4800  ••••  ••••  9012',
      tokenExpiry: '12/28',
      status: 'ACTIVE',
      tokenRequestorId: '40010030020',
      tokenRequestorName: 'Apple Pay',
      deviceType: 'Apple Pay',
      deviceName: 'iPhone 15 Pro Max',
      lastUsed: '2023-10-24 14:32:10',
      atc: 142,
      panReference: 'pan-ref-8839102',
      riskScore: 12
    },
    {
      tokenId: 'vts-tok-110293844',
      tokenNumber: '4800  ••••  ••••  4412',
      tokenExpiry: '08/27',
      status: 'ACTIVE',
      tokenRequestorId: '40010030025',
      tokenRequestorName: 'Google Pay',
      deviceType: 'Google Pay',
      deviceName: 'Pixel 8 Pro',
      lastUsed: '2023-10-23 09:11:45',
      atc: 89,
      panReference: 'pan-ref-8839102',
      riskScore: 8
    },
    {
      tokenId: 'vts-tok-554910293',
      tokenNumber: '4800  ••••  ••••  7731',
      tokenExpiry: '04/26',
      status: 'SUSPENDED',
      tokenRequestorId: '50029102930',
      tokenRequestorName: 'Netflix Card-on-File',
      deviceType: 'Merchant Card-on-File',
      deviceName: 'Cloud Server',
      lastUsed: '2023-10-15 18:22:00',
      atc: 24,
      panReference: 'pan-ref-8839102',
      riskScore: 45
    },
    {
      tokenId: 'vts-tok-773019284',
      tokenNumber: '4800  ••••  ••••  1102',
      tokenExpiry: '01/29',
      status: 'DEACTIVATED',
      tokenRequestorId: '40010030020',
      tokenRequestorName: 'Apple Pay',
      deviceType: 'Apple Pay',
      deviceName: 'Apple Watch Ultra 2',
      lastUsed: '2023-09-30 11:05:12',
      atc: 5,
      panReference: 'pan-ref-8839102',
      riskScore: 95
    }
  ]);

  const [selectedTokenId, setSelectedTokenId] = useState<string>(tokens[0]?.tokenId || '');
  const [actionReason, setActionReason] = useState<string>('LST');
  const [customReasonText, setCustomReasonText] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Cryptogram Generator State
  const [cryptogramType, setCryptogramType] = useState<'DTVV' | 'TAVV'>('DTVV');
  const [atcInput, setAtcInput] = useState<number>(143);
  const [txAmount, setTxAmount] = useState<string>('150.00');
  const [currencyCode, setCurrencyCode] = useState<string>('840'); // USD
  const [unpredictableNumber, setUnpredictableNumber] = useState<string>('A4F9C2E1');
  const [generatedCryptogram, setGeneratedCryptogram] = useState<{
    cryptogram: string;
    atcUsed: number;
    derivationKeyIndex: string;
    validationStatus: string;
  } | null>(null);

  // Gemini AI State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const selectedToken = useMemo(() => {
    return tokens.find(t => t.tokenId === selectedTokenId);
  }, [tokens, selectedTokenId]);

  useEffect(() => {
    if (selectedToken) {
      setAtcInput(selectedToken.atc + 1);
    }
  }, [selectedToken]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    addLog(`Copied ${label} to clipboard.`);
  };

  // Visa Pay Token Lifecycle Actions
  const handleUpdateTokenStatus = async (newStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED') => {
    if (!selectedToken) return;
    setLoading(true);
    addLog(`Initiating VTS API call: UpdateTokenStatus to ${newStatus} for ${selectedToken.tokenId}...`);

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    const reasonObj = VISA_REASON_CODES.find(r => r.code === actionReason);
    const finalReason = reasonObj ? `${reasonObj.code} - ${reasonObj.description}` : 'Custom Request';

    setTokens(prev => prev.map(t => {
      if (t.tokenId === selectedToken.tokenId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    addLog(`VTS API Success: Token ${selectedToken.tokenId} status updated to ${newStatus}. Reason: ${finalReason}`);
    setLoading(false);
  };

  // Cryptogram Generation (DTVV/TAVV)
  const handleGenerateCryptogram = async () => {
    if (!selectedToken) return;
    setLoading(true);
    addLog(`Requesting dynamic cryptogram (${cryptogramType}) from Visa Secure Token Vault...`);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate cryptographic derivation of DTVV/TAVV using ATC, Amount, Currency, and Unpredictable Number
    const mockCryptogram = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');

    setGeneratedCryptogram({
      cryptogram: mockCryptogram,
      atcUsed: atcInput,
      derivationKeyIndex: '02',
      validationStatus: 'VERIFIED_SUCCESS'
    });

    // Increment ATC on the token to simulate real-world usage
    setTokens(prev => prev.map(t => {
      if (t.tokenId === selectedToken.tokenId) {
        return { ...t, atc: atcInput };
      }
      return t;
    }));

    addLog(`Cryptogram generated successfully. ATC incremented to ${atcInput}.`);
    setLoading(false);
  };

  // Gemini AI Integration for Risk Analysis & Cryptogram Explanation
  const handleAskGemini = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse) return;

    setAiLoading(true);
    addLog(`Sending context to Gemini AI for token analysis...`);

    const context = `
      You are an expert Visa Token Service (VTS) security analyst.
      Analyze the following Visa Pay Token state:
      Token ID: ${selectedToken?.tokenId}
      Token Number: ${selectedToken?.tokenNumber}
      Status: ${selectedToken?.status}
      Device: ${selectedToken?.deviceName} (${selectedToken?.deviceType})
      Current ATC (Application Transaction Counter): ${selectedToken?.atc}
      Risk Score: ${selectedToken?.riskScore}/100
      
      User Query: ${promptToUse}
      
      Provide a highly technical, commercial-grade response detailing security recommendations, cryptogram validation steps, or risk mitigation strategies. Keep it concise and professional.
    `;

    try {
      const response = await callGemini(context);
      setAiResponse(response);
      addLog(`Gemini AI analysis received.`);
    } catch (error) {
      setAiResponse("Error communicating with Gemini AI. Please verify your API configuration.");
      addLog(`Gemini AI Error: Failed to fetch response.`);
    } finally {
      setAiLoading(false);
    }
  };

  const triggerQuickAiAnalysis = () => {
    const prompt = `Analyze the risk profile of this token and explain how the ATC value of ${selectedToken?.atc} prevents replay attacks.`;
    handleAskGemini(prompt);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Visa Pay Token Console</h1>
              <p className="text-sm text-slate-400">Commercial-grade Visa Token Service (VTS) lifecycle & cryptogram management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-slate-400">VTS Gateway: Connected</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Token List & Card Visualizer */}
        <div className="lg:col-span-4 space-y-6">
          {/* Token Selector Card */}
          <Card className="bg-slate-900 border-slate-800 p-5 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <Database className="w-5 h-5 text-blue-400" />
              Active Pay Tokens
            </h2>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {tokens.map((token) => (
                <button
                  key={token.tokenId}
                  onClick={() => setSelectedTokenId(token.tokenId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTokenId === token.tokenId
                      ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-950/20'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-slate-400">{token.tokenId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      token.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      token.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {token.status}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-sm text-slate-200">{token.tokenNumber}</div>
                  <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
                    <span>{token.deviceName}</span>
                    <span className="font-mono">ATC: {token.atc}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Visa Token Visualizer */}
          {selectedToken && (
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border-slate-800 p-6 h-[220px] flex flex-col justify-between rounded-xl shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Visa Pay Token</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedToken.tokenRequestorName}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold italic text-blue-400">VISA</span>
                  <span className="text-[10px] block text-slate-500">Token Service</span>
                </div>
              </div>

              <div className="my-4">
                <p className="font-mono text-lg tracking-wider text-slate-100">{selectedToken.tokenNumber}</p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] uppercase text-slate-500">Device / Binding</p>
                  <p className="text-xs text-slate-300 font-medium">{selectedToken.deviceName}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-[9px] uppercase text-slate-500">Expiry</p>
                    <p className="text-xs text-slate-300 font-mono">{selectedToken.tokenExpiry}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-slate-500">Risk Score</p>
                    <p className={`text-xs font-mono font-bold ${
                      selectedToken.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>{selectedToken.riskScore}/100</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Middle Column: Lifecycle Controls & Cryptogram Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Lifecycle Management */}
          <Card className="bg-slate-900 border-slate-800 p-5 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <Sliders className="w-5 h-5 text-blue-400" />
              Lifecycle Management
            </h2>

            {selectedToken ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Token ID</span>
                    <span className="font-mono text-slate-300">{selectedToken.tokenId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PAN Reference</span>
                    <span className="font-mono text-slate-300">{selectedToken.panReference}</span>
                  </div>
                </div>

                {/* Reason Code Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">VTS Reason Code</label>
                  <select
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    {VISA_REASON_CODES.map((rc) => (
                      <option key={rc.code} value={rc.code}>
                        [{rc.code}] {rc.description} ({rc.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateTokenStatus('SUSPENDED')}
                    disabled={loading || selectedToken.status === 'SUSPENDED'}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 disabled:opacity-40 transition-all"
                  >
                    <Lock className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Suspend</span>
                  </button>

                  <button
                    onClick={() => handleUpdateTokenStatus('ACTIVE')}
                    disabled={loading || selectedToken.status === 'ACTIVE'}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-40 transition-all"
                  >
                    <Unlock className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Resume</span>
                  </button>

                  <button
                    onClick={() => handleUpdateTokenStatus('DEACTIVATED')}
                    disabled={loading || selectedToken.status === 'DEACTIVATED'}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 disabled:opacity-40 transition-all"
                  >
                    <Trash2 className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Deactivate</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a token to manage its lifecycle.</p>
            )}
          </Card>

          {/* Cryptogram Generator */}
          <Card className="bg-slate-900 border-slate-800 p-5 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <Key className="w-5 h-5 text-blue-400" />
              Cryptogram Generator (DTVV/TAVV)
            </h2>

            {selectedToken ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Cryptogram Type</label>
                    <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                      <button
                        onClick={() => setCryptogramType('DTVV')}
                        className={`flex-1 py-1 text-xs font-semibold rounded ${
                          cryptogramType === 'DTVV' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        DTVV
                      </button>
                      <button
                        onClick={() => setCryptogramType('TAVV')}
                        className={`flex-1 py-1 text-xs font-semibold rounded ${
                          cryptogramType === 'TAVV' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        TAVV
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">ATC (Hex/Dec)</label>
                    <input
                      type="number"
                      value={atcInput}
                      onChange={(e) => setAtcInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Transaction Amount</label>
                    <input
                      type="text"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Currency</label>
                    <input
                      type="text"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Unpredictable Number (Hex)</label>
                  <input
                    type="text"
                    value={unpredictableNumber}
                    onChange={(e) => setUnpredictableNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleGenerateCryptogram}
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" />
                  Generate Cryptogram Payload
                </button>

                {/* Cryptogram Output */}
                {generatedCryptogram && (
                  <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Generated Cryptogram</span>
                      <button
                        onClick={() => handleCopy(generatedCryptogram.cryptogram, 'Cryptogram')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedText === 'Cryptogram' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="font-mono text-sm text-blue-400 break-all bg-slate-900 p-2 rounded border border-slate-800/50">
                      {generatedCryptogram.cryptogram}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                      <div>
                        <span className="text-slate-500">ATC Used:</span> <span className="font-mono text-slate-300">{generatedCryptogram.atcUsed}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">DKI:</span> <span className="font-mono text-slate-300">{generatedCryptogram.derivationKeyIndex}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a token to generate cryptograms.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Gemini AI Assistant & Audit Logs */}
        <div className="lg:col-span-3 space-y-6">
          {/* Gemini AI Assistant */}
          <Card className="bg-slate-900 border-slate-800 p-5 space-y-4 flex flex-col h-[380px]">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
                <Cpu className="w-5 h-5 text-purple-400" />
                Gemini VTS Advisor
              </h2>
              {selectedToken && (
                <button
                  onClick={triggerQuickAiAnalysis}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <Activity className="w-3 h-3" /> Quick Audit
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  Analyzing token security parameters...
                </div>
              ) : aiResponse ? (
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
              ) : (
                <div className="text-slate-500 italic">
                  Ask Gemini to analyze token risk, explain reason codes, or validate cryptogram payloads.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Gemini about this token..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleAskGemini()}
                disabled={aiLoading || !aiPrompt}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                Ask
              </button>
            </div>
          </Card>

          {/* VTS Audit Logs */}
          <Card className="bg-slate-900 border-slate-800 p-5 space-y-3 flex flex-col h-[240px]">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                <Terminal className="w-4 h-4 text-slate-400" />
                VTS Gateway Logs
              </h2>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1.5">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900/50 pb-1 last:border-0">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic">No gateway events logged yet.</div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}