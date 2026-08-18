import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CreditCard, Shield, Zap, Activity, RefreshCw, Terminal, Play, Send, 
  CheckCircle2, AlertCircle, Globe, Database, Key, Lock, Cpu, ArrowRight, 
  Coins, FileText, Sliders, Search, Filter, ChevronRight, ChevronDown, 
  Copy, Check, Sparkles, HelpCircle, ArrowUpRight, ArrowDownLeft, Info, BookOpen
} from 'lucide-react';
import { callGemini } from '../services/geminiService';

// Interfaces for API Reference
interface Endpoint {
  path: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  description: string;
  requestTemplate: any;
  responseTemplate: any;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  endpoints: Endpoint[];
}

// Mock API Reference Data
const VISA_API_REFERENCE: ApiCategory[] = [
  {
    id: 'crypto-settlement',
    name: 'Visa Crypto Settlement',
    description: 'Settle transactions directly in digital currencies like USDC over public blockchains.',
    endpoints: [
      {
        path: '/v1/crypto/settlement/initiate',
        method: 'POST',
        description: 'Initiate a crypto-to-fiat settlement transaction from an authorized digital wallet to a Visa settlement account.',
        requestTemplate: {
          settlementId: "set_9f823b1a4c",
          sourceWallet: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
          blockchain: "Ethereum",
          tokenSymbol: "USDC",
          amount: "50000.00",
          destinationCardToken: "tok_visa_411122223333",
          fiatCurrency: "USD",
          merchantId: "mer_8830291"
        },
        responseTemplate: {
          status: "PENDING_ON_CHAIN_CONFIRMATION",
          transactionHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
          settlementId: "set_9f823b1a4c",
          exchangeRate: "1.0000",
          estimatedFees: {
            networkGasFee: "12.50",
            visaSettlementFee: "75.00"
          },
          createdAt: new Date().toISOString()
        }
      },
      {
        path: '/v1/crypto/settlement/status',
        method: 'GET',
        description: 'Retrieve the real-time status of an active crypto-to-fiat settlement transaction.',
        requestTemplate: {
          settlementId: "set_9f823b1a4c"
        },
        responseTemplate: {
          settlementId: "set_9f823b1a4c",
          status: "COMPLETED",
          blockchainConfirmations: 12,
          fiatClearedAmount: "49912.50",
          clearingReference: "VNET-CLR-9920192",
          completedAt: new Date().toISOString()
        }
      },
      {
        path: '/v1/crypto/settlement/quote',
        method: 'POST',
        description: 'Request a guaranteed exchange rate quote for converting crypto assets to fiat currencies via Visa Treasury.',
        requestTemplate: {
          sourceAsset: "ETH",
          targetFiat: "USD",
          amount: "10.0",
          slippageTolerance: "0.5"
        },
        responseTemplate: {
          quoteId: "qte_339201a",
          rate: "3250.45",
          expiresAt: new Date(Date.now() + 60000).toISOString(),
          guaranteedDurationSeconds: 60,
          visaSpread: "0.002"
        }
      }
    ]
  },
  {
    id: 'visa-direct',
    name: 'Visa Direct (Push Payments)',
    description: 'Facilitate real-time fund transfers directly to billions of Visa cards globally.',
    endpoints: [
      {
        path: '/v1/visadirect/pushfundstransactions',
        method: 'POST',
        description: 'Push funds directly to a recipient\'s Visa card account in real-time.',
        requestTemplate: {
          senderReference: "snd_99201a",
          recipientCardNumber: "4111222233334444",
          amount: "250.00",
          currency: "USD",
          acquiringBin: "400001",
          retrievalReferenceNumber: "123456789012"
        },
        responseTemplate: {
          actionCode: "00",
          approvalCode: "882910",
          transactionIdentifier: "99201920192",
          status: "APPROVED",
          processedDateTime: new Date().toISOString()
        }
      },
      {
        path: '/v1/visadirect/reversefundstransactions',
        method: 'POST',
        description: 'Reverse a previously authorized push payment transaction.',
        requestTemplate: {
          originalTransactionIdentifier: "99201920192",
          reversalReason: "CUSTOMER_CANCELLED",
          amount: "250.00"
        },
        responseTemplate: {
          status: "REVERSED",
          reversalIdentifier: "rev_8830192",
          processedDateTime: new Date().toISOString()
        }
      }
    ]
  },
  {
    id: 'visa-b2b-connect',
    name: 'Visa B2B Connect',
    description: 'High-value, cross-border corporate payments utilizing a secure, distributed ledger architecture.',
    endpoints: [
      {
        path: '/v1/b2bconnect/payments',
        method: 'POST',
        description: 'Initiate a high-value cross-border corporate payment with integrated FX conversion.',
        requestTemplate: {
          sourceAccount: "acc_us_88291",
          destinationAccount: "acc_uk_99201",
          sourceCurrency: "USD",
          destinationCurrency: "GBP",
          amount: "150000.00",
          purposeCode: "TRADE_SETTLEMENT",
          intermediaryBankBic: "VISAUS33XXX"
        },
        responseTemplate: {
          paymentId: "b2b_771029a",
          status: "PROCESSING",
          fxRateApplied: "0.7854",
          settlementAmount: "117810.00",
          estimatedDelivery: new Date(Date.now() + 14400000).toISOString()
        }
      }
    ]
  },
  {
    id: 'visa-token-service',
    name: 'Visa Token Service (VTS)',
    description: 'Replace sensitive card credentials with secure digital tokens to protect transaction data.',
    endpoints: [
      {
        path: '/v1/vts/token/provision',
        method: 'POST',
        description: 'Provision a secure digital token for a cryptocurrency wallet or mobile device.',
        requestTemplate: {
          pan: "4111222233334444",
          expirationMonth: "12",
          expirationYear: "2028",
          cvv2: "123",
          tokenRequestorId: "tr_crypto_wallet_992"
        },
        responseTemplate: {
          tokenReferenceId: "vts_tok_8829102a",
          tokenValue: "411199XXXXXX4444",
          tokenExpirationDate: "1228",
          status: "ACTIVE",
          tokenAssuranceLevel: "99"
        }
      }
    ]
  }
];

export default function VisaApiReferenceViewer() {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory>(VISA_API_REFERENCE[0]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(VISA_API_REFERENCE[0].endpoints[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestPayload, setRequestPayload] = useState<string>(JSON.stringify(VISA_API_REFERENCE[0].endpoints[0].requestTemplate, null, 2));
  const [responsePayload, setResponsePayload] = useState<string>('// Click "Send Request" to execute simulated API call');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'gemini' | 'ledger'>('simulator');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Crypto Settlement Simulator State
  const [simCryptoAsset, setSimCryptoAsset] = useState<'USDC' | 'USDT' | 'ETH' | 'SOL'>('USDC');
  const [simAmount, setSimAmount] = useState<string>('10000');
  const [simCardNumber, setSimCardNumber] = useState<string>('4111 2222 3333 4444');
  const [simStep, setSimStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Gemini AI State
  const [geminiPrompt, setGeminiPrompt] = useState<string>('');
  const [geminiResponse, setGeminiResponse] = useState<string>('');
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);

  // Live Transaction Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([
    {
      id: "tx_001",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "Crypto Settlement",
      asset: "USDC",
      amount: "25,000.00",
      fiatAmount: "$25,000.00",
      status: "COMPLETED",
      hash: "0x7f8a...9c2d",
      ref: "VNET-CLR-882910"
    },
    {
      id: "tx_002",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "Visa Direct Push",
      asset: "USD",
      amount: "500.00",
      fiatAmount: "$500.00",
      status: "COMPLETED",
      hash: "N/A",
      ref: "VNET-DIR-339201"
    }
  ]);

  // Handle Endpoint Selection
  const handleSelectEndpoint = (endpoint: Endpoint, category: ApiCategory) => {
    setSelectedCategory(category);
    setSelectedEndpoint(endpoint);
    setRequestPayload(JSON.stringify(endpoint.requestTemplate, null, 2));
    setResponsePayload('// Click "Send Request" to execute simulated API call');
  };

  // Filter Endpoints based on Search Query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return VISA_API_REFERENCE;
    return VISA_API_REFERENCE.map(cat => {
      const filtered = cat.endpoints.filter(ep => 
        ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, endpoints: filtered };
    }).filter(cat => cat.endpoints.length > 0);
  }, [searchQuery]);

  // Copy to Clipboard Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Execute Simulated API Call
  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponsePayload('// Sending request to Visa Sandbox Gateway...');
    
    setTimeout(() => {
      try {
        const parsedRequest = JSON.parse(requestPayload);
        // Generate dynamic response based on request payload
        const response = { ...selectedEndpoint.responseTemplate };
        
        if (response.settlementId && parsedRequest.settlementId) {
          response.settlementId = parsedRequest.settlementId;
        }
        if (response.fiatClearedAmount && parsedRequest.amount) {
          response.fiatClearedAmount = (parseFloat(parsedRequest.amount) * 0.998).toFixed(2);
        }
        
        setResponsePayload(JSON.stringify(response, null, 2));
        
        // Add to Ledger
        const newLedgerEntry = {
          id: `tx_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: selectedCategory.name,
          asset: parsedRequest.tokenSymbol || parsedRequest.sourceAsset || parsedRequest.currency || "USD",
          amount: parsedRequest.amount || "N/A",
          fiatAmount: parsedRequest.amount ? `$${parseFloat(parsedRequest.amount).toLocaleString()}` : "N/A",
          status: "COMPLETED",
          hash: response.transactionHash || "N/A",
          ref: response.clearingReference || response.transactionIdentifier || `VNET-${Math.floor(100000 + Math.random() * 900000)}`
        };
        setLedgerEntries(prev => [newLedgerEntry, ...prev]);
      } catch (err) {
        setResponsePayload(JSON.stringify({
          error: "Invalid JSON Payload",
          message: "Please verify your request payload formatting."
        }, null, 2));
      } finally {
        setIsLoading(false);
      }
    }, 1200);
  };

  // Run Crypto-to-Fiat Settlement Simulation
  const runSettlementSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setSimLogs([]);
    
    const log = (msg: string) => {
      setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      log(`Initiating settlement of ${simAmount} ${simCryptoAsset} to Visa Card ending in ${simCardNumber.slice(-4)}`);
      await delay(1500);
      
      setSimStep(2);
      log(`Broadcasting transaction to ${simCryptoAsset === 'SOL' ? 'Solana' : 'Ethereum'} network...`);
      const txHash = simCryptoAsset === 'SOL' 
        ? "5H8z...9K3p" 
        : "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a";
      log(`On-chain transaction confirmed. Hash: ${txHash}`);
      await delay(1800);

      setSimStep(3);
      log(`Visa Treasury Bridge detected deposit. Locking exchange rate...`);
      const rate = simCryptoAsset === 'ETH' ? 3250.00 : simCryptoAsset === 'SOL' ? 145.00 : 1.00;
      const grossFiat = parseFloat(simAmount) * rate;
      log(`Exchange Rate: 1 ${simCryptoAsset} = ${rate.toFixed(2)} USD`);
      log(`Gross Settlement Value: $${grossFiat.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
      await delay(1500);

      setSimStep(4);
      log(`Clearing transaction via VisaNet Core...`);
      const visaFee = grossFiat * 0.0015; // 0.15% Visa Fee
      const netFiat = grossFiat - visaFee;
      log(`Visa Settlement Fee (0.15%): $${visaFee.toFixed(2)}`);
      log(`Net Clearing Value: $${netFiat.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
      await delay(1800);

      setSimStep(5);
      log(`Executing Visa Direct Push Funds to Card: ${simCardNumber}`);
      log(`Visa Direct Response: APPROVED (Approval Code: ${Math.floor(100000 + Math.random() * 900000)})`);
      await delay(1500);

      setSimStep(6);
      log(`Settlement successfully completed! Funds are now available on the destination card.`);
      
      // Add to Ledger
      const newLedgerEntry = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: "Visa Crypto Settlement",
        asset: simCryptoAsset,
        amount: parseFloat(simAmount).toLocaleString(),
        fiatAmount: `$${(parseFloat(simAmount) * (simCryptoAsset === 'ETH' ? 3250 : simCryptoAsset === 'SOL' ? 145 : 1) * 0.9985).toLocaleString(undefined, {minimumFractionDigits: 2})}`,
        status: "COMPLETED",
        hash: txHash,
        ref: `VNET-SET-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setLedgerEntries(prev => [newLedgerEntry, ...prev]);

    } catch (error) {
      log(`Error during settlement simulation: ${error}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Ask Gemini AI for Assistance
  const askGeminiAssistant = async (customPrompt?: string) => {
    const promptToUse = customPrompt || geminiPrompt;
    if (!promptToUse.trim()) return;

    setIsGeminiLoading(true);
    setGeminiResponse('');

    const systemContext = `
      You are an expert Visa Integration Architect specializing in cryptocurrency, blockchain settlement, and Visa Developer APIs.
      The user is currently exploring the following Visa API:
      Category: ${selectedCategory.name}
      Endpoint: ${selectedEndpoint.method} ${selectedEndpoint.path}
      Description: ${selectedEndpoint.description}
      
      Provide a highly technical, precise, and practical response. If they ask for code, provide clean, production-ready code snippets (e.g., Node.js, Python, or Go) integrating Visa APIs with Web3 libraries (like ethers.js or solana/web3.js).
    `;

    try {
      const response = await callGemini({
        prompt: `${systemContext}\n\nUser Question: ${promptToUse}`
      });
      setGeminiResponse(response);
    } catch (error) {
      // Fallback response if Gemini service is unavailable
      setGeminiResponse(`### Visa Crypto Integration Guide

Here is a production-ready Node.js snippet to integrate the **${selectedEndpoint.path}** endpoint with an on-chain smart contract event listener using **ethers.js**.

\`\`\`javascript
const ethers = require('ethers');
const axios = require('axios');

// Visa API Configuration
const VISA_SANDBOX_URL = 'https://sandbox.api.visa.com';
const visaClient = axios.create({
  baseURL: VISA_SANDBOX_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.VISA_ACCESS_TOKEN
  }
});

// Listen for On-Chain Settlement Events
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const settlementContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

settlementContract.on("SettlementInitiated", async (sender, amount, token, event) => {
  console.log(\`New on-chain settlement detected from \${sender}\`);
  
  try {
    // Trigger Visa Crypto Settlement API
    const response = await visaClient.post('/v1/crypto/settlement/initiate', {
      settlementId: event.transactionHash,
      sourceWallet: sender,
      blockchain: "Ethereum",
      tokenSymbol: "USDC",
      amount: ethers.utils.formatUnits(amount, 6),
      destinationCardToken: "tok_visa_411122223333",
      fiatCurrency: "USD"
    });
    
    console.log("Visa Settlement Triggered Successfully:", response.data.status);
  } catch (error) {
    console.error("Failed to trigger Visa Settlement:", error.response?.data || error.message);
  }
});
\`\`\`

#### Compliance & Security Recommendations:
1. **Idempotency**: Always pass the blockchain transaction hash as the \`settlementId\` to prevent double-clearing.
2. **AML/KYC**: Ensure the \`sourceWallet\` has passed Visa's integrated Travel Rule compliance checks before initiating the push payment.
3. **Reconciliation**: Implement a webhook listener for \`v1/crypto/settlement/status\` to confirm final fiat clearing before updating user balances.`);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Visa Developer Portal <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full font-semibold border border-blue-500/30">Crypto Integration Hub</span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Explore, test, and simulate Visa APIs integrated with cryptocurrency settlement networks.</p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Visa Sandbox:</span>
            <span className="font-semibold text-emerald-400">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Ethereum Node:</span>
            <span className="font-semibold text-emerald-400">CONNECTED</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-slate-400">Gemini AI:</span>
            <span className="font-semibold text-blue-400">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: API Explorer (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" /> API Reference
              </h2>
              <span className="text-xs text-slate-500">{VISA_API_REFERENCE.length} Modules</span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* API Categories & Endpoints List */}
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCategories.map((category) => (
                <div key={category.id} className="flex flex-col gap-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    {category.name}
                  </div>
                  <div className="flex flex-col gap-1">
                    {category.endpoints.map((endpoint) => {
                      const isSelected = selectedEndpoint.path === endpoint.path;
                      const methodColor = 
                        endpoint.method === 'POST' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        endpoint.method === 'GET' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                        'text-amber-400 bg-amber-500/10 border-amber-500/20';

                      return (
                        <button
                          key={endpoint.path}
                          onClick={() => handleSelectEndpoint(endpoint, category)}
                          className={`flex flex-col gap-1 p-2.5 rounded-lg text-left border transition-all ${
                            isSelected 
                              ? 'bg-slate-800/80 border-blue-500/50 shadow-md shadow-blue-500/5' 
                              : 'bg-slate-950 border-slate-800/60 hover:bg-slate-800/30 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor}`}>
                              {endpoint.method}
                            </span>
                            <span className="text-xs font-mono text-slate-200 truncate">
                              {endpoint.path}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 pl-1">
                            {endpoint.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Tester & Payload Viewer (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Endpoint Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">{selectedCategory.name}</span>
                <h2 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    selectedEndpoint.method === 'POST' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-sm">{selectedEndpoint.path}</span>
                </h2>
              </div>
              <button
                onClick={() => handleCopy(`${selectedEndpoint.method} ${selectedEndpoint.path}`, 'endpoint')}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy Endpoint"
              >
                {copiedText === 'endpoint' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {selectedEndpoint.description}
            </p>
          </div>

          {/* Request Payload Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 flex-1 min-h-[300px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" /> Request Body (JSON)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRequestPayload(JSON.stringify(selectedEndpoint.requestTemplate, null, 2))}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
                <button
                  onClick={() => handleCopy(requestPayload, 'request')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  {copiedText === 'request' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
            </div>
            <textarea
              value={requestPayload}
              onChange={(e) => setRequestPayload(e.target.value)}
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-blue-500 resize-none custom-scrollbar"
            />
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Sandbox Call...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Send Request to Visa Sandbox
                </>
              )}
            </button>
          </div>

          {/* Response Payload Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 h-[250px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Response Payload
              </span>
              <button
                onClick={() => handleCopy(responsePayload, 'response')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                {copiedText === 'response' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
              </button>
            </div>
            <pre className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-y-auto custom-scrollbar">
              {responsePayload}
            </pre>
          </div>
        </div>

        {/* Right Column: Interactive Tools & Simulator (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Tab Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'simulator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Settlement Sim
            </button>
            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'gemini' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Gemini AI
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ledger' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Live Ledger
            </button>
          </div>

          {/* Tab Content: Crypto Settlement Simulator */}
          {activeTab === 'simulator' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5 flex-1">
              <div>
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-400" /> Crypto-to-Fiat Settlement
                </h3>
                <p className="text-xs text-slate-400 mt-1">Simulate real-time clearing of digital assets directly into fiat bank accounts via Visa Direct.</p>
              </div>

              {/* Input Parameters */}
              <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Crypto Asset</label>
                    <select
                      value={simCryptoAsset}
                      onChange={(e: any) => setSimCryptoAsset(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="USDC">USDC (Stablecoin)</option>
                      <option value="USDT">USDT (Stablecoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="SOL">SOL (Solana)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Destination Visa Card</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={simCardNumber}
                      onChange={(e) => setSimCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Stepper Visualizer */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settlement Pipeline</span>
                
                <div className="flex flex-col gap-2">
                  {[
                    { step: 1, label: "On-Chain Deposit", desc: "Locking crypto in Visa Vault" },
                    { step: 2, label: "Blockchain Confirmation", desc: "Awaiting consensus validation" },
                    { step: 3, label: "Treasury Conversion", desc: "Converting crypto to USD fiat" },
                    { step: 4, label: "VisaNet Clearing", desc: "Clearing transaction on core network" },
                    { step: 5, label: "Visa Direct Push", desc: "Pushing funds to destination card" }
                  ].map((item) => {
                    const isCompleted = simStep > item.step;
                    const isActive = simStep === item.step;
                    
                    return (
                      <div 
                        key={item.step} 
                        className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                          isActive ? 'bg-blue-500/10 border-blue-500/30' :
                          isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-500 text-slate-950' :
                          isActive ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : item.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulation Logs */}
              {simLogs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execution Logs</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 h-32 overflow-y-auto font-mono text-[10px] text-slate-300 flex flex-col gap-1 custom-scrollbar">
                    {simLogs.map((log, idx) => (
                      <div key={idx} className="border-l-2 border-blue-500 pl-2 py-0.5">{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={runSettlementSimulation}
                disabled={isSimulating}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all mt-auto"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Settlement...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    Execute Settlement Simulation
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab Content: Gemini AI Assistant */}
          {activeTab === 'gemini' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 flex-1">
              <div>
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" /> Gemini AI Assistant
                </h3>
                <p className="text-xs text-slate-400 mt-1">Ask Gemini to explain payloads, generate integration code, or optimize settlement flows.</p>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => askGeminiAssistant(`Explain the request payload for ${selectedEndpoint.path} and suggest compliance checks.`)}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Explain Payload
                </button>
                <button
                  onClick={() => askGeminiAssistant(`Generate a complete Node.js integration script for ${selectedEndpoint.path} using ethers.js.`)}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Generate Node.js Code
                </button>
                <button
                  onClick={() => askGeminiAssistant(`What are the security best practices for integrating Visa Direct with a decentralized wallet?`)}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Security Best Practices
                </button>
              </div>

              {/* Custom Prompt Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Gemini anything about Visa APIs..."
                  value={geminiPrompt}
                  onChange={(e) => setGeminiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askGeminiAssistant()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => askGeminiAssistant()}
                  disabled={isGeminiLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2 rounded-lg transition-colors"
                >
                  {isGeminiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* AI Response Area */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                {isGeminiLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                    <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                    <span className="text-xs font-medium">Gemini is analyzing the integration...</span>
                  </div>
                ) : geminiResponse ? (
                  <div className="prose prose-invert prose-xs text-slate-300 font-sans leading-relaxed">
                    <pre className="whitespace-pre-wrap font-sans text-xs">{geminiResponse}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500">
                    <Sparkles className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-xs">Select a quick prompt above or type a custom question to get instant integration guidance from Gemini AI.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Live Transaction Ledger */}
          {activeTab === 'ledger' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" /> Live Settlement Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Real-time audit trail of simulated Visa and blockchain transactions.</p>
                </div>
                <button
                  onClick={() => setLedgerEntries([])}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Ledger List */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[450px] pr-1 custom-scrollbar flex-1">
                {ledgerEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500">
                    <Database className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-xs">No transactions recorded yet. Run a simulation or execute an API call to populate the ledger.</p>
                  </div>
                ) : (
                  ledgerEntries.map((entry) => (
                    <div key={entry.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 flex flex-col gap-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-200">{entry.type}</span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {entry.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2.5 text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-500">Asset Amount</span>
                          <span className="font-semibold text-slate-300 font-mono">{entry.amount} {entry.asset}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-500">Fiat Value</span>
                          <span className="font-semibold text-slate-300 font-mono">{entry.fiatAmount}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2 text-[10px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Visa Ref:</span>
                          <span className="text-slate-400">{entry.ref}</span>
                        </div>
                        {entry.hash !== 'N/A' && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tx Hash:</span>
                            <span className="text-blue-400 truncate max-w-[180px]" title={entry.hash}>{entry.hash}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}