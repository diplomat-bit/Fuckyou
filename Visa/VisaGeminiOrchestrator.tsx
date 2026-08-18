import React, { useState, useEffect, useContext, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';
import { 
  CreditCard, 
  Cpu, 
  Zap, 
  Shield, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Send, 
  Coins, 
  Lock, 
  Unlock, 
  ArrowRightLeft, 
  User, 
  DollarSign, 
  Check, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Layers, 
  Globe, 
  Activity 
} from 'lucide-react';

interface VisaCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  currency: string;
  status: 'Active' | 'Frozen';
  limit: number;
  cryptoCollateral: {
    asset: 'USDC' | 'BTC' | 'ETH';
    amount: number;
    valueInUsd: number;
  };
}

interface ExecutionStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  details: string;
  timestamp: string;
}

interface ParsedCommand {
  action: 'PAY' | 'FREEZE' | 'UNFREEZE' | 'CONVERT_LOAD' | 'ADJUST_LIMIT' | 'CHECK_STATUS';
  amount: number | null;
  asset: 'USDC' | 'BTC' | 'ETH' | 'USD' | null;
  recipient: string | null;
  limitValue: number | null;
  explanation: string;
}

export default function VisaGeminiOrchestrator() {
  const dataContext = useContext(DataContext);
  
  // Mock Visa Cards with Crypto Integration
  const [cards, setCards] = useState<VisaCard[]>([
    {
      id: 'visa-001',
      cardNumber: '4111 •••• •••• 8824',
      cardholderName: 'ALEXANDER VANE',
      expiryDate: '12/28',
      cvv: '342',
      balance: 5420.50,
      currency: 'USD',
      status: 'Active',
      limit: 10000,
      cryptoCollateral: {
        asset: 'USDC',
        amount: 15000,
        valueInUsd: 15000
      }
    },
    {
      id: 'visa-002',
      cardNumber: '4222 •••• •••• 9911',
      cardholderName: 'ALEXANDER VANE',
      expiryDate: '08/27',
      cvv: '119',
      balance: 1250.00,
      currency: 'USD',
      status: 'Active',
      limit: 5000,
      cryptoCollateral: {
        asset: 'BTC',
        amount: 0.45,
        valueInUsd: 28350
      }
    }
  ]);

  const [selectedCardId, setSelectedCardId] = useState<string>('visa-001');
  const [inputCommand, setInputCommand] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [visaApiPayload, setVisaApiPayload] = useState<any>(null);
  const [cryptoPayload, setCryptoPayload] = useState<any>(null);
  const [showCvv, setShowCvv] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, executionSteps]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const sampleCommands = [
    "Freeze my primary Visa card immediately.",
    "Convert 500 USDC from collateral and load it onto my card.",
    "Pay $150 to Sarah Jenkins using Visa Direct with USDC collateral.",
    "Increase my card spending limit to $12,000.",
    "Check my card status and crypto collateral value."
  ];

  const handleProcessCommand = async (commandText: string) => {
    if (!commandText.trim() || isProcessing) return;

    setIsProcessing(true);
    setInputCommand('');
    setExecutionSteps([]);
    setParsedCommand(null);
    setVisaApiPayload(null);
    setCryptoPayload(null);
    setLogs([]);

    addLog(`Initiating Visa Gemini Orchestrator with command: "${commandText}"`);

    // Step 1: Parsing with Gemini
    const step1Id = 'step-1';
    setExecutionSteps([
      {
        id: step1Id,
        title: 'Gemini Natural Language Parsing',
        status: 'processing',
        details: 'Analyzing command intent, entities, and mapping to Visa/Crypto protocols...',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    try {
      const systemPrompt = `
        You are the Visa Gemini AI Orchestrator. Your job is to parse natural language financial commands into structured JSON actions.
        The available actions are:
        1. PAY: Send money to a recipient. Requires "amount" (number), "recipient" (string), and optional "asset" (e.g., USDC, BTC, ETH, USD).
        2. FREEZE: Freeze the Visa card.
        3. UNFREEZE: Unfreeze the Visa card.
        4. CONVERT_LOAD: Convert cryptocurrency to USD and load it onto the card. Requires "amount" (number) and "asset" (cryptocurrency to convert, e.g., BTC, ETH, USDC).
        5. ADJUST_LIMIT: Change the spending limit of the card. Requires "limitValue" (number).
        6. CHECK_STATUS: Check card balance, status, or collateral.

        Respond ONLY with a valid JSON object. Do not include markdown formatting, code blocks, or any text outside the JSON.
        JSON structure:
        {
          "action": "PAY" | "FREEZE" | "UNFREEZE" | "CONVERT_LOAD" | "ADJUST_LIMIT" | "CHECK_STATUS",
          "amount": number | null,
          "asset": "USDC" | "BTC" | "ETH" | "USD" | null,
          "recipient": string | null,
          "limitValue": number | null,
          "explanation": "Brief explanation of what you parsed"
        }
      `;

      addLog("Sending payload to Gemini Pro model...");
      let responseText = "";
      
      try {
        responseText = await callGemini(`${systemPrompt}\n\nCommand: "${commandText}"`);
      } catch (err) {
        addLog("Gemini API call failed or returned empty. Falling back to local deterministic parser.");
        // Fallback parser if Gemini is offline
        responseText = simulateLocalParsing(commandText);
      }

      // Clean response text in case markdown fences were returned
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: ParsedCommand = JSON.parse(cleanedText);
      
      setParsedCommand(parsed);
      addLog(`Gemini parsed intent: ${parsed.action} - ${parsed.explanation}`);

      setExecutionSteps(prev => prev.map(step => 
        step.id === step1Id ? { ...step, status: 'success', details: `Successfully parsed intent: ${parsed.action}.` } : step
      ));

      // Step 2: Map to Visa API & Crypto Protocols
      const step2Id = 'step-2';
      setExecutionSteps(prev => [
        ...prev,
        {
          id: step2Id,
          title: 'Visa API & Crypto Mapping',
          status: 'processing',
          details: 'Generating Visa ISO 8583 / Visa Direct payloads and smart contract parameters...',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Generate payloads based on action
      let visaPayload: any = {};
      let cryptoTxPayload: any = null;

      switch (parsed.action) {
        case 'PAY':
          visaPayload = {
            Header: {
              MessageIdentifier: "VISA_DIRECT_OCT",
              Version: "1.0",
              Timestamp: new Date().toISOString()
            },
            AcquirerCountryCode: "840",
            AcquirerBin: "400001",
            TransactionAmount: parsed.amount || 100,
            TransactionCurrencyCode: "840",
            SenderPrimaryAccountNumber: selectedCard.cardNumber.replace(/ •••• •••• /g, '00000000'),
            RecipientName: parsed.recipient || "Unknown Recipient",
            PaymentDescriptor: "Visa Direct P2P Transfer via Gemini AI"
          };
          if (parsed.asset && parsed.asset !== 'USD') {
            cryptoTxPayload = {
              contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC ERC20
              method: "transferFromCollateral",
              args: [
                "0xVisaBridgeContractAddress",
                parsed.amount ? (parsed.amount * 10**6).toString() : "100000000"
              ],
              gasLimit: "85000"
            };
          }
          break;

        case 'FREEZE':
        case 'UNFREEZE':
          visaPayload = {
            Header: {
              MessageIdentifier: "VISA_CARD_CONTROLS",
              Version: "2.1",
              Timestamp: new Date().toISOString()
            },
            CardToken: "tkn_8824_vane",
            Action: parsed.action === 'FREEZE' ? "BLOCK_ALL_TRANSACTIONS" : "ALLOW_ALL_TRANSACTIONS",
            Reason: "User requested via Gemini AI Voice/Text Orchestrator"
          };
          break;

        case 'CONVERT_LOAD':
          visaPayload = {
            Header: {
              MessageIdentifier: "VISA_PREPAID_LOAD",
              Version: "1.5",
              Timestamp: new Date().toISOString()
            },
            LoadAmount: parsed.amount || 100,
            LoadCurrency: "USD",
            FundingSource: "CRYPTO_COLLATERAL_LIQUIDATION"
          };
          cryptoTxPayload = {
            dexRouter: "0xUniswapV3Router",
            swapPath: [selectedCard.cryptoCollateral.asset, "USDC", "USD"],
            inputAmount: parsed.amount ? (parsed.amount / 60000).toFixed(6) : "0.001", // rough BTC conversion
            slippageTolerance: "0.5%"
          };
          break;

        case 'ADJUST_LIMIT':
          visaPayload = {
            Header: {
              MessageIdentifier: "VISA_LIMIT_MANAGEMENT",
              Version: "1.0",
              Timestamp: new Date().toISOString()
            },
            CardToken: "tkn_8824_vane",
            NewVelocityLimits: {
              DailySpendLimit: parsed.limitValue || 5000,
              SingleTransactionLimit: (parsed.limitValue || 5000) * 0.5
            }
          };
          break;

        case 'CHECK_STATUS':
          visaPayload = {
            Header: {
              MessageIdentifier: "VISA_ACCOUNT_INQUIRY",
              Version: "3.0",
              Timestamp: new Date().toISOString()
            },
            CardToken: "tkn_8824_vane"
          };
          break;
      }

      setVisaApiPayload(visaPayload);
      if (cryptoTxPayload) setCryptoPayload(cryptoTxPayload);

      addLog("Visa API payload generated successfully.");
      if (cryptoTxPayload) addLog("On-chain smart contract transaction payload prepared.");

      setExecutionSteps(prev => prev.map(step => 
        step.id === step2Id ? { ...step, status: 'success', details: 'Payloads mapped to Visa Developer APIs and Web3 protocols.' } : step
      ));

      // Step 3: Execution & Settlement
      const step3Id = 'step-3';
      setExecutionSteps(prev => [
        ...prev,
        {
          id: step3Id,
          title: 'Visa Network & Blockchain Settlement',
          status: 'processing',
          details: 'Executing Visa transaction and settling crypto collateral adjustments...',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1800));

      // Apply changes to local state to simulate real execution
      setCards(prevCards => prevCards.map(card => {
        if (card.id !== selectedCardId) return card;

        switch (parsed.action) {
          case 'FREEZE':
            return { ...card, status: 'Frozen' };
          case 'UNFREEZE':
            return { ...card, status: 'Active' };
          case 'ADJUST_LIMIT':
            return { ...card, limit: parsed.limitValue || card.limit };
          case 'CONVERT_LOAD':
            const loadAmt = parsed.amount || 0;
            return {
              ...card,
              balance: card.balance + loadAmt,
              cryptoCollateral: {
                ...card.cryptoCollateral,
                amount: Math.max(0, card.cryptoCollateral.amount - (loadAmt / (card.cryptoCollateral.asset === 'BTC' ? 60000 : 1))),
                valueInUsd: Math.max(0, card.cryptoCollateral.valueInUsd - loadAmt)
              }
            };
          case 'PAY':
            const payAmt = parsed.amount || 0;
            return {
              ...card,
              balance: card.balance - payAmt
            };
          default:
            return card;
        }
      }));

      addLog(`Visa Network response: 200 OK. Transaction settled.`);
      if (cryptoTxPayload) {
        addLog(`Blockchain Tx Hash: 0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`);
      }

      setExecutionSteps(prev => prev.map(step => 
        step.id === step3Id ? { ...step, status: 'success', details: 'Visa Direct cleared. Blockchain state updated and finalized.' } : step
      ));

    } catch (error: any) {
      addLog(`Error during orchestration: ${error.message}`);
      setExecutionSteps(prev => prev.map(step => 
        step.status === 'processing' ? { ...step, status: 'failed', details: `Error: ${error.message}` } : step
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateLocalParsing = (command: string): string => {
    const lower = command.toLowerCase();
    let action = 'CHECK_STATUS';
    let amount = null;
    let asset = null;
    let recipient = null;
    let limitValue = null;
    let explanation = "Parsed locally using fallback rules.";

    if (lower.includes('freeze') || lower.includes('block')) {
      action = 'FREEZE';
      explanation = "User requested to freeze the Visa card.";
    } else if (lower.includes('unfreeze') || lower.includes('unlock')) {
      action = 'UNFREEZE';
      explanation = "User requested to unfreeze the Visa card.";
    } else if (lower.includes('pay') || lower.includes('send')) {
      action = 'PAY';
      const matchAmount = lower.match(/\$?(\d+)/);
      if (matchAmount) amount = parseFloat(matchAmount[1]);
      if (lower.includes('usdc')) asset = 'USDC';
      if (lower.includes('btc')) asset = 'BTC';
      const matchRecipient = lower.match(/(?:to)\s+([A-Za-z\s]+)/i);
      if (matchRecipient) recipient = matchRecipient[1].trim();
      explanation = `User requested to pay ${recipient || 'recipient'} $${amount || 0} using ${asset || 'USD'}.`;
    } else if (lower.includes('convert') || lower.includes('load')) {
      action = 'CONVERT_LOAD';
      const matchAmount = lower.match(/\$?(\d+)/);
      if (matchAmount) amount = parseFloat(matchAmount[1]);
      if (lower.includes('usdc')) asset = 'USDC';
      if (lower.includes('btc')) asset = 'BTC';
      explanation = `User requested to convert ${asset || 'crypto'} and load $${amount || 0} onto Visa card.`;
    } else if (lower.includes('limit')) {
      action = 'ADJUST_LIMIT';
      const matchLimit = lower.match(/\$?(\d+)/);
      if (matchLimit) limitValue = parseFloat(matchLimit[1]);
      explanation = `User requested to adjust card limit to $${limitValue || 0}.`;
    }

    return JSON.stringify({
      action,
      amount,
      asset,
      recipient,
      limitValue,
      explanation
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Visa Gemini AI Orchestrator
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Gemini-powered natural language interface mapping commands to Visa Developer APIs & Crypto Settlement Rails.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Visa Developer Sandbox Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cards & Command Input */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Visa Card Selector */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Select Active Visa Card
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map(card => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`relative overflow-hidden rounded-xl p-5 cursor-pointer transition-all duration-300 border ${
                    selectedCardId === card.id 
                      ? 'border-blue-500 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                      : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                  }`}
                >
                  {/* Card Chip & Visa Logo */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-8 bg-gradient-to-r from-amber-400 to-amber-200 rounded-md opacity-80 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5 w-6 h-5 opacity-40">
                        {Array.from({length: 9}).map((_, i) => (
                          <div key={i} className="border border-slate-950"></div>
                        ))}
                      </div>
                    </div>
                    <span className="text-lg font-bold italic text-blue-400">VISA</span>
                  </div>

                  {/* Card Number */}
                  <div className="text-lg tracking-widest font-mono mb-4">
                    {card.cardNumber}
                  </div>

                  {/* Cardholder & Expiry */}
                  <div className="flex justify-between items-end text-xs text-slate-400 font-mono">
                    <div>
                      <p className="text-[10px] text-slate-500">CARDHOLDER</p>
                      <p className="font-semibold text-slate-200">{card.cardholderName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">EXPIRES</p>
                      <p className="font-semibold text-slate-200">{card.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">CVV</p>
                      <p className="font-semibold text-slate-200">
                        {showCvv ? card.cvv : '•••'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      card.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Card Details & Collateral Info */}
            <div className="mt-6 grid grid-cols-3 gap-4 bg-slate-950/50 border border-slate-800/80 rounded-lg p-4 text-sm">
              <div>
                <span className="text-slate-500 text-xs block">Available Balance</span>
                <span className="text-lg font-bold text-slate-200">
                  ${selectedCard.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Crypto Collateral</span>
                <span className="text-lg font-bold text-indigo-400 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {selectedCard.cryptoCollateral.amount} {selectedCard.cryptoCollateral.asset}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Collateral Value</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${selectedCard.cryptoCollateral.valueInUsd.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowCvv(!showCvv)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
              >
                {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showCvv ? 'Hide Sensitive Data' : 'Reveal CVV'}
              </button>
            </div>
          </div>

          {/* Command Input Terminal */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              Gemini AI Command Center
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={inputCommand}
                  onChange={(e) => setInputCommand(e.target.value)}
                  placeholder="Type a natural language command (e.g., 'Freeze my card' or 'Pay $100 to Alice using USDC collateral')..."
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono"
                  disabled={isProcessing}
                />
                <button
                  onClick={() => handleProcessCommand(inputCommand)}
                  disabled={isProcessing || !inputCommand.trim()}
                  className="absolute bottom-3 right-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Execute
                    </>
                  )}
                </button>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-xs text-slate-500 block mb-2">Suggested Commands:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputCommand(cmd)}
                      disabled={isProcessing}
                      className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-all text-left"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Orchestration Steps & Payloads */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Orchestration Pipeline */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Execution Pipeline
            </h2>

            {executionSteps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-lg">
                <Cpu className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Awaiting command execution...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {executionSteps.map((step, idx) => (
                  <div key={step.id} className="relative pl-6 border-l border-slate-800 last:border-0 pb-2">
                    {/* Step Indicator Icon */}
                    <div className="absolute -left-3 top-0.5">
                      {step.status === 'success' && (
                        <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {step.status === 'processing' && (
                        <div className="p-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 animate-spin">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {step.status === 'failed' && (
                        <div className="p-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {step.status === 'pending' && (
                        <div className="p-1 bg-slate-800 text-slate-600 rounded-full border border-slate-700">
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-200">{step.title}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Logs & Payloads */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Visa & Web3 Payloads
            </h2>

            <div className="space-y-4">
              {/* Visa API Payload */}
              <div>
                <span className="text-xs text-slate-500 block mb-1.5 font-mono">Visa Developer API Payload (ISO 8583 Mapping)</span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[11px] text-blue-400">
                  {visaApiPayload ? (
                    <pre>{JSON.stringify(visaApiPayload, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-700">No Visa API payload generated yet.</span>
                  )}
                </div>
              </div>

              {/* Crypto Payload */}
              <div>
                <span className="text-xs text-slate-500 block mb-1.5 font-mono">On-Chain Smart Contract Call</span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[11px] text-indigo-400">
                  {cryptoPayload ? (
                    <pre>{JSON.stringify(cryptoPayload, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-700">No on-chain transaction required for this action.</span>
                  )}
                </div>
              </div>

              {/* Console Logs */}
              <div>
                <span className="text-xs text-slate-500 block mb-1.5 font-mono">Orchestrator Console Logs</span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 h-32 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
                  {logs.length === 0 ? (
                    <span className="text-slate-700">Console idle.</span>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="border-b border-slate-900/50 pb-1 last:border-0">
                        {log}
                      </div>
                    ))
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}