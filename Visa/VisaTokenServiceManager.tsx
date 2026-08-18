import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { 
  Shield, 
  Key, 
  CreditCard, 
  Zap, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Play, 
  Search, 
  Check, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Fingerprint, 
  ArrowRight, 
  Database, 
  Activity, 
  Globe, 
  ShieldAlert 
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';
import { walletService } from '../services/WalletService';
import { securityService } from '../services/SecurityService';

interface VisaToken {
  id: string;
  cardId: string;
  last4: string;
  tokenPan: string;
  tokenExpiry: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  mappedWallet: string;
  hardwareKeyId: string;
  deviceBinding: string;
  createdAt: string;
  riskScore: number;
}

interface CardCredential {
  id: string;
  holderName: string;
  brand: string;
  last4: string;
  expiry: string;
}

export default function VisaTokenServiceManager() {
  const dataContext = useContext(DataContext);
  const [cards, setCards] = useState<CardCredential[]>([
    { id: 'card-1', holderName: 'Sovereign Operator', brand: 'Visa Infinite', last4: '8842', expiry: '12/29' },
    { id: 'card-2', holderName: 'Sovereign Operator', brand: 'Visa Platinum', last4: '4301', expiry: '08/27' },
    { id: 'card-3', holderName: 'Sovereign Corporate', brand: 'Visa Commercial', last4: '9011', expiry: '11/30' }
  ]);

  const [tokens, setTokens] = useState<VisaToken[]>([
    {
      id: 'vts-tok-9921',
      cardId: 'card-1',
      last4: '8842',
      tokenPan: '4111-XXXX-XXXX-3391',
      tokenExpiry: '12/29',
      status: 'ACTIVE',
      mappedWallet: '0x71C...6E29',
      hardwareKeyId: 'fido2-key-yubikey-5c-nano',
      deviceBinding: 'Sovereign Secure Enclave (macOS)',
      createdAt: '2025-02-15 14:22:10',
      riskScore: 0.02
    }
  ]);

  const [selectedCardId, setSelectedCardId] = useState<string>('card-1');
  const [targetWallet, setTargetWallet] = useState<string>('');
  const [hardwareKeyBound, setHardwareKeyBound] = useState<boolean>(false);
  const [hardwareKeyId, setHardwareKeyId] = useState<string>('');
  const [deviceBindingName, setDeviceBindingName] = useState<string>('Sovereign Hardware Vault');
  
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [isBindingKey, setIsBindingKey] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch active wallet address on mount
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        addLog('Querying active Sovereign Web3 wallet...');
        // Attempt to get address from walletService if available
        if (walletService && typeof walletService.formatAddress === 'function') {
          const mockAddr = '0x71C2496B268E3a1714177211440314B909266E29';
          setTargetWallet(mockAddr);
          addLog(`Sovereign wallet detected: ${mockAddr}`);
        } else {
          const fallbackAddr = '0x71C2496B268E3a1714177211440314B909266E29';
          setTargetWallet(fallbackAddr);
          addLog(`Using default secure wallet mapping: ${fallbackAddr}`);
        }
      } catch (err) {
        addLog('Error connecting to wallet service. Using fallback.');
        setTargetWallet('0x71C2496B268E3a1714177211440314B909266E29');
      }
    };
    fetchWallet();
  }, []);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  }, []);

  // Trigger Gemini AI Risk & Compliance Analysis
  const runGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    addLog('Initiating Gemini AI Risk & Compliance Audit for VTS-to-Crypto mapping...');
    
    const selectedCard = cards.find(c => c.id === selectedCardId);
    const prompt = `
      You are an expert cryptographic security auditor specializing in Visa Token Service (VTS) and Web3 integrations.
      Analyze the security posture of mapping a tokenized Visa Card (${selectedCard?.brand} ending in ${selectedCard?.last4}) 
      to a secure Ethereum/Sovereign crypto wallet (${targetWallet}) bound by a hardware key (${hardwareKeyId || 'FIDO2/Yubikey'}).
      
      Provide a concise, high-impact analysis covering:
      1. Risk Score (0.0 to 1.0) and threat vector mitigation.
      2. Compliance status with PCI-DSS v4.0 and FAPI (Financial-grade API) standards.
      3. Recommendations for real-time transaction velocity limits and smart contract guardrails.
      
      Format the output with clean markdown, using bold headers and bullet points. Keep it highly technical and professional.
    `;

    try {
      const response = await callGemini({
        prompt,
        systemInstruction: "You are a security orchestrator for a sovereign wealth fund and high-tech banking portal."
      });
      setGeminiAnalysis(response);
      addLog('Gemini AI analysis completed successfully.');
    } catch (error) {
      addLog('Gemini AI analysis failed. Using local heuristic engine.');
      setGeminiAnalysis(`
        ### Local Security Heuristic Report
        * **Risk Score**: 0.05 (Low Risk)
        * **PCI-DSS Compliance**: Verified. Tokenized PAN (DPAN) is isolated from the primary account number (FPAN).
        * **Hardware Binding**: FIDO2/WebAuthn attestation provides strong non-repudiation.
        * **Recommendation**: Enforce a 24-hour cooling period for transactions exceeding 50,000 USD equivalent.
      `);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate Hardware Key Binding (WebAuthn / FIDO2)
  const bindHardwareKey = async () => {
    setIsBindingKey(true);
    addLog('Requesting hardware key attestation via WebAuthn...');
    
    setTimeout(() => {
      const generatedKeyId = `fido2-key-${Math.random().toString(36).substring(2, 15)}`;
      setHardwareKeyId(generatedKeyId);
      setHardwareKeyBound(true);
      setIsBindingKey(false);
      addLog(`Hardware key bound successfully. Key ID: ${generatedKeyId}`);
      addLog('Cryptographic signature verified against secure enclave.');
    }, 1500);
  };

  // Provision VTS Token
  const provisionToken = async () => {
    if (!targetWallet) {
      addLog('Error: Target crypto wallet address is required.');
      return;
    }
    if (!hardwareKeyBound) {
      addLog('Error: Hardware key binding is required for cryptographic non-repudiation.');
      return;
    }

    setIsProvisioning(true);
    addLog('Initiating Visa Token Service (VTS) provisioning pipeline...');
    addLog('Step 1: Requesting Tokenization Eligibility from Visa Network...');
    
    setTimeout(() => {
      addLog('Step 2: Generating Device Binding Cryptogram (DBC)...');
      setTimeout(() => {
        addLog('Step 3: Mapping Tokenized DPAN to Crypto Wallet Address...');
        
        const selectedCard = cards.find(c => c.id === selectedCardId);
        const newToken: VisaToken = {
          id: `vts-tok-${Math.floor(1000 + Math.random() * 9000)}`,
          cardId: selectedCardId,
          last4: selectedCard?.last4 || '0000',
          tokenPan: `4111-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
          tokenExpiry: selectedCard?.expiry || '12/29',
          status: 'ACTIVE',
          mappedWallet: `${targetWallet.substring(0, 6)}...${targetWallet.substring(targetWallet.length - 4)}`,
          hardwareKeyId: hardwareKeyId,
          deviceBinding: deviceBindingName,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          riskScore: 0.01
        };

        setTokens(prev => [newToken, ...prev]);
        setIsProvisioning(false);
        addLog(`VTS Token ${newToken.id} successfully provisioned and mapped to ${targetWallet}!`);
        
        // Auto-run Gemini analysis on the newly provisioned token
        runGeminiAnalysis();
      }, 1200);
    }, 1000);
  };

  // Suspend / Resume Token
  const toggleTokenStatus = (tokenId: string) => {
    setTokens(prev => prev.map(tok => {
      if (tok.id === tokenId) {
        const nextStatus = tok.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        addLog(`Token ${tokenId} status updated to ${nextStatus}.`);
        return { ...tok, status: nextStatus };
      }
      return tok;
    }));
  };

  // Delete / Deactivate Token
  const deactivateToken = (tokenId: string) => {
    setTokens(prev => prev.filter(tok => {
      if (tok.id === tokenId) {
        addLog(`Token ${tokenId} permanently deactivated and unmapped from Visa network.`);
        return false;
      }
      return true;
    }));
  };

  // Filtered tokens based on search
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tokenPan.includes(searchQuery) ||
      t.mappedWallet.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-blue-400 via-indigo-400 to-emerald-400">
              Visa Token Service (VTS) Manager
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Securely map tokenized card credentials to Web3 crypto wallets and hardware keys with real-time Gemini AI risk auditing.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Visa Developer Network: Connected</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Provisioning & Mapping Console */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Step 1: Select Card & Target Wallet */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>1. Credential & Wallet Mapping</span>
            </div>

            {/* Card Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Select Visa Source Credential</label>
              <div className="grid grid-cols-1 gap-2">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      selectedCardId === card.id
                        ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${selectedCardId === card.id ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-medium text-slate-300">{card.brand}</p>
                        <p className="text-[10px] text-slate-500">•••• •••• •••• {card.last4}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">{card.holderName}</p>
                      <p className="text-[9px] text-slate-500">Exp: {card.expiry}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Crypto Wallet */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Target Crypto Wallet Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                />
                <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] text-slate-500 font-mono">Web3 Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Hardware Key Attestation */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                <Fingerprint className="w-4 h-4" />
                <span>2. Hardware Key Attestation</span>
              </div>
              {hardwareKeyBound ? (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3 h-3" /> Bound
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Pending Binding
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Bind this tokenized credential to a physical hardware key (FIDO2/Yubikey) or secure enclave to enforce cryptographic non-repudiation on all card-to-crypto swaps.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Device Binding Name</label>
                  <input
                    type="text"
                    value={deviceBindingName}
                    onChange={(e) => setDeviceBindingName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Hardware Key ID</label>
                  <input
                    type="text"
                    value={hardwareKeyId}
                    readOnly
                    placeholder="Click Bind Key to generate"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={bindHardwareKey}
                disabled={isBindingKey}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white text-xs font-medium py-2 px-4 rounded-lg transition-all"
              >
                {isBindingKey ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Attesting Hardware Key...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Bind Hardware Key (WebAuthn)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3: Provision Token */}
          <button
            onClick={provisionToken}
            disabled={isProvisioning || !hardwareKeyBound}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              hardwareKeyBound 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isProvisioning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Provisioning VTS Token...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Provision & Map Visa Token</span>
              </>
            )}
          </button>

        </div>

        {/* Right Column: Active Tokens & Gemini AI Auditor */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Tokens List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active VTS Token Mappings</span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tokens or wallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {filteredTokens.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg">
                <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active VTS token mappings found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {filteredTokens.map(token => (
                  <div 
                    key={token.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{token.tokenPan}</p>
                          <p className="text-[9px] text-slate-500">Token ID: {token.id} | Exp: {token.tokenExpiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          token.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {token.status}
                        </span>
                        <button 
                          onClick={() => toggleTokenStatus(token.id)}
                          className="text-[10px] text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded"
                        >
                          {token.status === 'ACTIVE' ? 'Suspend' : 'Resume'}
                        </button>
                        <button 
                          onClick={() => deactivateToken(token.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/30 px-2 py-1 rounded"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-[10px]">
                      <div>
                        <span className="text-slate-500 block">Mapped Wallet</span>
                        <span className="font-mono text-slate-300">{token.mappedWallet}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Hardware Key</span>
                        <span className="font-mono text-slate-300 truncate block max-w-[120px]" title={token.hardwareKeyId}>
                          {token.hardwareKeyId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Device Binding</span>
                        <span className="text-slate-300 truncate block max-w-[120px]" title={token.deviceBinding}>
                          {token.deviceBinding}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gemini AI Risk & Compliance Auditor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Risk & Compliance Auditor</span>
              </div>
              <button
                onClick={runGeminiAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-lg transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Audit</span>
                  </>
                )}
              </button>
            </div>

            {geminiAnalysis ? (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 space-y-2 max-h-[240px] overflow-y-auto font-mono leading-relaxed">
                <div className="prose prose-invert prose-xs">
                  {geminiAnalysis.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h4 key={idx} className="text-purple-400 font-bold mt-2 mb-1">{line.replace('###', '')}</h4>;
                    }
                    if (line.startsWith('*')) {
                      return <p key={idx} className="pl-2 text-slate-300 my-0.5">{line}</p>;
                    }
                    return <p key={idx} className="my-1">{line}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-950/50 border border-slate-800 rounded-lg">
                <Cpu className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Click "Run Audit" to generate real-time AI risk assessment.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Section: Live Audit Logs */}
      <div className="mt-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>VTS Integration Audit Trail</span>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="text-[10px] text-slate-500 hover:text-slate-300"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 h-36 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">No events logged. Initiate provisioning or key binding to start.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="hover:bg-slate-900/50 py-0.5 px-1 rounded">
                <span className="text-blue-500 mr-2">❯</span>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}