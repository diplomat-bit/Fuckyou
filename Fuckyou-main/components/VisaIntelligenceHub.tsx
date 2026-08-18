import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  RefreshCw, Brain, FileText, HelpCircle, ArrowRight, Zap, 
  Search, Sliders, Database, Scale, Coins, UserCheck, 
  MessageSquare, Sparkles, ChevronRight, Clock, DollarSign, 
  Percent, ShieldAlert, Check, X, Play, FileCheck, ArrowUpRight,
  SlidersHorizontal, ShieldCheck, Info, AlertCircle, Copy
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar, LineChart, 
  Line, PieChart, Pie, Cell 
} from 'recharts';
import { callGemini } from '../services/geminiService';
import Card from './Card';

// --- Interfaces ---
interface FraudAnalysis {
  riskScore: number;
  decision: 'APPROVE' | 'DECLINE' | 'STEP_UP';
  riskFactors: string[];
  explanation: string;
}

interface StipForecast {
  safeStipLimit: number;
  confidenceScore: number;
  projectedDowntimeSpend: number;
  recommendation: string;
  forecastData: Array<{ hour: string; upperLimit: number; expectedSpend: number; lowerLimit: number }>;
}

interface MccOptimization {
  optimizedMcc: string;
  optimizedMccDescription: string;
  estimatedSavingsPercent: number;
  rewardMultiplier: number;
  reasoning: string;
  comparisonData: Array<{ name: string; current: number; optimized: number }>;
}

interface DisputeResolution {
  winProbabilityMerchant: number;
  recommendedAction: 'ACCEPT_DISPUTE' | 'REPRESENT_CHARGEBACK' | 'REQUEST_MORE_INFO';
  keyEvidencePoints: string[];
  draftResponse: string;
}

export default function VisaIntelligenceHub() {
  const [activeTab, setActiveTab] = useState<'fraud' | 'stip' | 'mcc' | 'dispute'>('fraud');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');

  // --- State for Fraud Scoring ---
  const [fraudAmount, setFraudAmount] = useState<number>(1250.00);
  const [fraudMerchant, setFraudMerchant] = useState<string>('LUXURY WATCHES TOKYO');
  const [fraudMcc, setFraudMcc] = useState<string>('5944 - Jewelry, Watches, and Silverware Stores');
  const [fraudCountry, setFraudCountry] = useState<string>('JP');
  const [cardPresence, setCardPresence] = useState<'Present' | 'Not Present'>('Not Present');
  const [deviceVelocity, setDeviceVelocity] = useState<number>(3);
  const [fraudLoading, setFraudLoading] = useState<boolean>(false);
  const [fraudResult, setFraudResult] = useState<FraudAnalysis>({
    riskScore: 78,
    decision: 'STEP_UP',
    riskFactors: [
      'High-value transaction in jewelry category',
      'Cross-border transaction (Cardholder home: US, Merchant: JP)',
      'Card Not Present transaction with elevated device velocity (3 attempts in 1 hour)'
    ],
    explanation: 'The transaction exhibits high-risk characteristics typical of account takeover or card-not-present fraud. While the cardholder has previous international travel indicators, the rapid succession of high-value attempts warrants a Step-Up Authentication (3D Secure) to verify identity.'
  });

  // --- State for STIP Forecasting ---
  const [stipBalance, setStipBalance] = useState<number>(8500.00);
  const [stipAvgSpend, setStipAvgSpend] = useState<number>(220.00);
  const [stipDowntime, setStipDowntime] = useState<number>(6);
  const [stipTolerance, setStipTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [stipLoading, setStipLoading] = useState<boolean>(false);
  const [stipResult, setStipResult] = useState<StipForecast>({
    safeStipLimit: 1800.00,
    confidenceScore: 94,
    projectedDowntimeSpend: 450.00,
    recommendation: 'Enable Stand-In Processing with a dynamic cap of $1,800.00. This accommodates the cardholder\'s historical spending patterns during similar time windows while mitigating exposure to catastrophic loss during the issuer outage.',
    forecastData: [
      { hour: 'H+1', upperLimit: 1200, expectedSpend: 150, lowerLimit: 50 },
      { hour: 'H+2', upperLimit: 1400, expectedSpend: 220, lowerLimit: 80 },
      { hour: 'H+3', upperLimit: 1550, expectedSpend: 310, lowerLimit: 110 },
      { hour: 'H+4', upperLimit: 1650, expectedSpend: 380, lowerLimit: 140 },
      { hour: 'H+5', upperLimit: 1750, expectedSpend: 420, lowerLimit: 160 },
      { hour: 'H+6', upperLimit: 1800, expectedSpend: 450, lowerLimit: 180 }
    ]
  });

  // --- State for MCC Optimization ---
  const [mccMerchantName, setMccMerchantName] = useState<string>('AWS EMEA Cloud Services');
  const [mccCurrent, setMccCurrent] = useState<string>('7372 - Computer Programming, Data Processing');
  const [mccTargetProgram, setMccTargetProgram] = useState<'Cashback Max' | 'Travel Points' | 'Interchange Minimization'>('Cashback Max');
  const [mccLoading, setMccLoading] = useState<boolean>(false);
  const [mccResult, setMccResult] = useState<MccOptimization>({
    optimizedMcc: '5734',
    optimizedMccDescription: 'Computer Software Stores / Cloud Infrastructure Services',
    estimatedSavingsPercent: 1.85,
    rewardMultiplier: 3.5,
    reasoning: 'By reclassifying AWS EMEA Cloud Services under MCC 5734 (Computer Software Stores) instead of the generic 7372, the transaction qualifies for the premium "Technology & Software" commercial reward tier, boosting cashback from 1.5% to 3.5% while maintaining compliance with Visa interchange rules.',
    comparisonData: [
      { name: 'Interchange Fee (%)', current: 2.15, optimized: 1.95 },
      { name: 'Reward Yield (%)', current: 1.50, optimized: 3.50 },
      { name: 'Net Benefit (%)', current: -0.65, optimized: 1.55 }
    ]
  });

  // --- State for Automated Dispute Resolution ---
  const [disputeReason, setDisputeReason] = useState<string>('Services not rendered / Item not received');
  const [disputeAmount, setDisputeAmount] = useState<number>(450.00);
  const [disputeEvidence, setDisputeEvidence] = useState<string>('FedEx tracking ID 982374928374 shows delivered to front porch. Photo confirmation attached. Merchant refund policy states all sales final after delivery.');
  const [disputeClaim, setDisputeClaim] = useState<string>('Cardholder claims package was stolen or never delivered. Checked with neighbors, no package found.');
  const [disputeLoading, setDisputeLoading] = useState<boolean>(false);
  const [disputeResult, setDisputeResult] = useState<DisputeResolution>({
    winProbabilityMerchant: 82,
    recommendedAction: 'REPRESENT_CHARGEBACK',
    keyEvidencePoints: [
      'Valid proof of delivery (FedEx tracking with GPS and photo confirmation)',
      'Delivery address matches the cardholder\'s registered billing address',
      'Clear merchant terms of service and refund policy signed at checkout'
    ],
    draftResponse: `Dear Visa Dispute Resolution Team,

We are writing to formally represent the chargeback for Transaction ID V-982374928374 in the amount of $450.00. 

The cardholder claims the merchandise was not received. However, we have provided compelling evidence of successful delivery:
1. FedEx Tracking ID 982374928374 confirms delivery to the cardholder's registered billing address on October 12, 2023, at 14:22.
2. A photographic confirmation of delivery at the cardholder's front door is attached.
3. The delivery coordinates match the cardholder's verified billing address.

Per Visa Core Rules (Section 11.4), this constitutes valid proof of delivery. We request that this dispute be resolved in favor of the merchant and the funds be returned.

Sincerely,
Merchant Operations Team`
  });

  // --- Helper to call Gemini and parse JSON safely ---
  const executeGeminiQuery = async (prompt: string, fallback: any) => {
    try {
      const responseText = await callGemini(prompt);
      // Attempt to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return fallback;
    } catch (error) {
      console.error('Error calling Gemini:', error);
      return fallback;
    }
  };

  // --- Trigger Fraud Analysis ---
  const handleFraudAnalysis = async () => {
    setFraudLoading(true);
    const prompt = `
      You are Visa's Advanced Authorization AI engine. Analyze this transaction for potential fraud:
      - Amount: $${fraudAmount}
      - Merchant: ${fraudMerchant}
      - MCC: ${fraudMcc}
      - Country: ${fraudCountry}
      - Card Presence: ${cardPresence}
      - Device Velocity (last 1hr): ${deviceVelocity}

      Provide a JSON response with the following structure:
      {
        "riskScore": number (0 to 100),
        "decision": "APPROVE" | "DECLINE" | "STEP_UP",
        "riskFactors": ["string", "string", ...],
        "explanation": "string"
      }
    `;
    const fallback: FraudAnalysis = {
      riskScore: fraudAmount > 1000 ? 85 : 45,
      decision: fraudAmount > 1000 ? 'STEP_UP' : 'APPROVE',
      riskFactors: ['High transaction amount', 'Card Not Present transaction'],
      explanation: 'Fallback analysis due to connection timeout. High value transaction requires verification.'
    };
    const result = await executeGeminiQuery(prompt, fallback);
    setFraudResult(result);
    setFraudLoading(false);
  };

  // --- Trigger STIP Forecast ---
  const handleStipForecast = async () => {
    setStipLoading(true);
    const prompt = `
      You are Visa's Stand-In Processing (STIP) balance forecasting engine. 
      Calculate the safe stand-in limit and forecast spend during an issuer outage:
      - Current Balance: $${stipBalance}
      - Average Daily Spend: $${stipAvgSpend}
      - Outage Duration: ${stipDowntime} hours
      - Risk Tolerance: ${stipTolerance}

      Provide a JSON response with the following structure:
      {
        "safeStipLimit": number,
        "confidenceScore": number (0 to 100),
        "projectedDowntimeSpend": number,
        "recommendation": "string",
        "forecastData": [
          { "hour": "H+1", "upperLimit": number, "expectedSpend": number, "lowerLimit": number },
          ... up to outage duration
        ]
      }
    `;
    const fallback: StipForecast = {
      safeStipLimit: stipBalance * 0.2,
      confidenceScore: 90,
      projectedDowntimeSpend: stipAvgSpend * (stipDowntime / 24),
      recommendation: 'Fallback STIP limit calculated based on standard 20% balance buffer.',
      forecastData: Array.from({ length: stipDowntime }, (_, i) => ({
        hour: `H+${i + 1}`,
        upperLimit: Math.round((stipBalance * 0.2) * ((i + 1) / stipDowntime)),
        expectedSpend: Math.round((stipAvgSpend * (stipDowntime / 24)) * ((i + 1) / stipDowntime)),
        lowerLimit: Math.round((stipAvgSpend * 0.5 * (stipDowntime / 24)) * ((i + 1) / stipDowntime))
      }))
    };
    const result = await executeGeminiQuery(prompt, fallback);
    setStipResult(result);
    setStipLoading(false);
  };

  // --- Trigger MCC Optimization ---
  const handleMccOptimization = async () => {
    setMccLoading(true);
    const prompt = `
      You are Visa's Merchant Category Code (MCC) Optimization engine.
      Optimize the MCC mapping for this merchant to maximize benefits:
      - Merchant Name: ${mccMerchantName}
      - Current MCC: ${mccCurrent}
      - Target Program: ${mccTargetProgram}

      Provide a JSON response with the following structure:
      {
        "optimizedMcc": "string (4 digits)",
        "optimizedMccDescription": "string",
        "estimatedSavingsPercent": number,
        "rewardMultiplier": number,
        "reasoning": "string",
        "comparisonData": [
          { "name": "Interchange Fee (%)", "current": number, "optimized": number },
          { "name": "Reward Yield (%)", "current": number, "optimized": number },
          { "name": "Net Benefit (%)", "current": number, "optimized": number }
        ]
      }
    `;
    const fallback: MccOptimization = {
      optimizedMcc: '5734',
      optimizedMccDescription: 'Computer Software Stores',
      estimatedSavingsPercent: 1.5,
      rewardMultiplier: 3.0,
      reasoning: 'Fallback optimization. Reclassifying to software category yields higher rewards.',
      comparisonData: [
        { name: 'Interchange Fee (%)', current: 2.10, optimized: 1.90 },
        { name: 'Reward Yield (%)', current: 1.00, optimized: 3.00 },
        { name: 'Net Benefit (%)', current: -1.10, optimized: 1.10 }
      ]
    };
    const result = await executeGeminiQuery(prompt, fallback);
    setMccResult(result);
    setMccLoading(false);
  };

  // --- Trigger Dispute Resolution ---
  const handleDisputeResolution = async () => {
    setDisputeLoading(true);
    const prompt = `
      You are Visa's Resolve on Dispute (VRD) automated arbitration engine.
      Evaluate this dispute and draft a representment response:
      - Dispute Reason: ${disputeReason}
      - Transaction Amount: $${disputeAmount}
      - Merchant Evidence: ${disputeEvidence}
      - Cardholder Claim: ${disputeClaim}

      Provide a JSON response with the following structure:
      {
        "winProbabilityMerchant": number (0 to 100),
        "recommendedAction": "ACCEPT_DISPUTE" | "REPRESENT_CHARGEBACK" | "REQUEST_MORE_INFO",
        "keyEvidencePoints": ["string", "string", ...],
        "draftResponse": "string (professional letter)"
      }
    `;
    const fallback: DisputeResolution = {
      winProbabilityMerchant: 75,
      recommendedAction: 'REPRESENT_CHARGEBACK',
      keyEvidencePoints: ['Proof of delivery provided', 'Address matches billing'],
      draftResponse: 'Fallback dispute response. Evidence supports merchant delivery.'
    };
    const result = await executeGeminiQuery(prompt, fallback);
    setDisputeResult(result);
    setDisputeLoading(false);
  };

  // --- Copy to Clipboard Helper ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                Visa Intelligence Hub
              </h1>
              <p className="text-sm text-slate-400">
                Next-Gen AI Orchestration for Visa Core APIs & Gemini Cognitive Services
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-xs font-medium text-slate-300">
              {connectionStatus === 'connected' ? 'Gemini Live Gateway Active' : 'Gateway Offline'}
            </span>
          </div>
          <button 
            onClick={() => {
              setIsConnecting(true);
              setTimeout(() => {
                setIsConnecting(false);
                setConnectionStatus('connected');
              }, 1000);
            }}
            disabled={isConnecting}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/60 max-w-4xl">
        <button
          onClick={() => setActiveTab('fraud')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'fraud' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          Real-Time Fraud Scoring
        </button>
        <button
          onClick={() => setActiveTab('stip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'stip' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          STIP Balance Forecasting
        </button>
        <button
          onClick={() => setActiveTab('mcc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mcc' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Coins className="w-4 h-4" />
          MCC Optimization
        </button>
        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'dispute' 
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Scale className="w-4 h-4" />
          Automated Dispute Resolution
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tab 1: Fraud Scoring Controls */}
          {activeTab === 'fraud' && (
            <Card className="p-6 bg-slate-900/60 border-slate-800/80">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-200">Transaction Parameters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Transaction Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      value={fraudAmount} 
                      onChange={(e) => setFraudAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Merchant Name</label>
                  <input 
                    type="text" 
                    value={fraudMerchant} 
                    onChange={(e) => setFraudMerchant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Merchant Category Code (MCC)</label>
                  <select 
                    value={fraudMcc} 
                    onChange={(e) => setFraudMcc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>5944 - Jewelry, Watches, and Silverware Stores</option>
                    <option>5812 - Eating Places, Restaurants</option>
                    <option>4814 - Telecommunication Services</option>
                    <option>6011 - Automated Cash Disbursements (ATM)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Country Code</label>
                    <input 
                      type="text" 
                      value={fraudCountry} 
                      onChange={(e) => setFraudCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Card Presence</label>
                    <div className="flex rounded-lg border border-slate-800 overflow-hidden">
                      <button 
                        onClick={() => setCardPresence('Present')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${cardPresence === 'Present' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => setCardPresence('Not Present')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${cardPresence === 'Not Present' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400'}`}
                      >
                        CNP
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                    <span>Device Velocity (Attempts / 1hr)</span>
                    <span className="text-blue-400 font-semibold">{deviceVelocity}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={deviceVelocity} 
                    onChange={(e) => setDeviceVelocity(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <button
                  onClick={handleFraudAnalysis}
                  disabled={fraudLoading}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {fraudLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Risk Patterns...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Advanced Authorization AI
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* Tab 2: STIP Forecasting Controls */}
          {activeTab === 'stip' && (
            <Card className="p-6 bg-slate-900/60 border-slate-800/80">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-200">STIP Simulation Parameters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Available Balance (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      value={stipBalance} 
                      onChange={(e) => setStipBalance(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Average Daily Spend (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      value={stipAvgSpend} 
                      onChange={(e) => setStipAvgSpend(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Outage Duration (Hrs)</label>
                    <input 
                      type="number" 
                      value={stipDowntime} 
                      onChange={(e) => setStipDowntime(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Risk Tolerance</label>
                    <select 
                      value={stipTolerance} 
                      onChange={(e) => setStipTolerance(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option>Conservative</option>
                      <option>Moderate</option>
                      <option>Aggressive</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleStipForecast}
                  disabled={stipLoading}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {stipLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Forecasting Balance Curves...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Forecast STIP Limits
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* Tab 3: MCC Optimization Controls */}
          {activeTab === 'mcc' && (
            <Card className="p-6 bg-slate-900/60 border-slate-800/80">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-slate-200">MCC Optimization Inputs</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Raw Merchant Name</label>
                  <input 
                    type="text" 
                    value={mccMerchantName} 
                    onChange={(e) => setMccMerchantName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current MCC Mapping</label>
                  <select 
                    value={mccCurrent} 
                    onChange={(e) => setMccCurrent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option>7372 - Computer Programming, Data Processing</option>
                    <option>4816 - Computer Network/Information Services</option>
                    <option>5734 - Computer Software Stores</option>
                    <option>7399 - Business Services, Not Elsewhere Classified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Optimization Target</label>
                  <select 
                    value={mccTargetProgram} 
                    onChange={(e) => setMccTargetProgram(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Cashback Max">Cashback Max (Commercial Rewards)</option>
                    <option value="Travel Points">Travel Points Maximization</option>
                    <option value="Interchange Minimization">Interchange Fee Minimization</option>
                  </select>
                </div>

                <button
                  onClick={handleMccOptimization}
                  disabled={mccLoading}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {mccLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Optimizing Interchange Tiers...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Optimize MCC Mapping
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* Tab 4: Dispute Resolution Controls */}
          {activeTab === 'dispute' && (
            <Card className="p-6 bg-slate-900/60 border-slate-800/80">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-slate-200">Dispute Case Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Dispute Reason Code</label>
                  <select 
                    value={disputeReason} 
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option>Services not rendered / Item not received</option>
                    <option>Fraudulent transaction - Card Not Present</option>
                    <option>Incorrect transaction amount</option>
                    <option>Duplicate processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Disputed Amount (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      value={disputeAmount} 
                      onChange={(e) => setDisputeAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Cardholder Claim Narrative</label>
                  <textarea 
                    rows={3}
                    value={disputeClaim} 
                    onChange={(e) => setDisputeClaim(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Merchant Evidence / Artifacts</label>
                  <textarea 
                    rows={3}
                    value={disputeEvidence} 
                    onChange={(e) => setDisputeEvidence(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleDisputeResolution}
                  disabled={disputeLoading}
                  className="w-full mt-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
                >
                  {disputeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Evaluating Dispute Merits...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Evaluate Dispute & Draft Response
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

        </div>

        {/* Right Column: AI Insights & Visualizations */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab 1: Fraud Scoring Output */}
          {activeTab === 'fraud' && (
            <div className="space-y-6">
              {/* Score Card */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Visa Advanced Authorization</span>
                    <h3 className="text-xl font-bold text-slate-200 mt-1">Real-Time Fraud Risk Assessment</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-300">Gemini Cognitive Engine</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Circular Gauge */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Outer Ring */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="64" 
                          className="stroke-slate-800" 
                          strokeWidth="10" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="64" 
                          className={`transition-all duration-1000 ${
                            fraudResult.riskScore > 75 ? 'stroke-rose-500' : fraudResult.riskScore > 40 ? 'stroke-amber-500' : 'stroke-emerald-500'
                          }`} 
                          strokeWidth="10" 
                          fill="transparent" 
                          strokeDasharray={402}
                          strokeDashoffset={402 - (402 * fraudResult.riskScore) / 100}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-slate-100">{fraudResult.riskScore}</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Risk Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision & Summary */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span className="text-xs text-slate-400">Recommended Action</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${
                          fraudResult.decision === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          fraudResult.decision === 'STEP_UP' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {fraudResult.decision}
                        </span>
                        <span className="text-xs text-slate-400">via Visa Risk Manager</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {fraudResult.explanation}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Risk Factors */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Key Risk Indicators (KRIs) Detected
                </h4>
                <div className="space-y-3">
                  {fraudResult.riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                      <div className="p-1 bg-amber-500/10 rounded mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed">{factor}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Tab 2: STIP Forecasting Output */}
          {activeTab === 'stip' && (
            <div className="space-y-6">
              {/* Forecast Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-slate-900/40 border-slate-800/80 flex flex-col justify-between">
                  <span className="text-xs text-slate-400">Safe STIP Limit</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-bold text-indigo-400">${stipResult.safeStipLimit.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">USD</span>
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900/40 border-slate-800/80 flex flex-col justify-between">
                  <span className="text-xs text-slate-400">Confidence Score</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-bold text-emerald-400">{stipResult.confidenceScore}%</span>
                    <span className="text-xs text-slate-500">Accuracy</span>
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900/40 border-slate-800/80 flex flex-col justify-between">
                  <span className="text-xs text-slate-400">Projected Outage Spend</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-bold text-slate-300">${stipResult.projectedDowntimeSpend.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">USD</span>
                  </div>
                </Card>
              </div>

              {/* Forecast Chart */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-semibold text-slate-300">Stand-In Processing (STIP) Spend Envelope</h4>
                  <span className="text-xs text-slate-500">6-Hour Outage Window</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stipResult.forecastData}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" dataKey="upperLimit" name="STIP Cap (Upper Bound)" stroke="#818cf8" fill="url(#colorSpend)" />
                      <Area type="monotone" dataKey="expectedSpend" name="Expected Spend" stroke="#38bdf8" fill="none" strokeWidth={2} />
                      <Area type="monotone" dataKey="lowerLimit" name="Lower Bound" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Recommendation */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">AI Stand-In Recommendation</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {stipResult.recommendation}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 3: MCC Optimization Output */}
          {activeTab === 'mcc' && (
            <div className="space-y-6">
              {/* Optimization Summary */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Visa Commercial Pay</span>
                    <h3 className="text-xl font-bold text-slate-200 mt-1">MCC Reclassification Strategy</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">Optimized</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                    <span className="text-xs text-slate-500">Current Mapping</span>
                    <div className="text-sm font-bold text-slate-300 mt-1">{mccCurrent}</div>
                    <div className="text-xs text-slate-500 mt-2">Interchange Tier: Standard Commercial</div>
                  </div>
                  <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-xs text-emerald-400 font-semibold">Optimized Mapping</span>
                    <div className="text-sm font-bold text-emerald-300 mt-1">{mccResult.optimizedMcc} - {mccResult.optimizedMccDescription}</div>
                    <div className="text-xs text-emerald-400/70 mt-2">Interchange Tier: Premium Technology</div>
                  </div>
                </div>
              </Card>

              {/* Comparison Chart */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <h4 className="text-sm font-semibold text-slate-300 mb-6">Financial Impact Comparison</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mccResult.comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="current" name="Current Mapping" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="optimized" name="Optimized Mapping" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Reasoning */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Info className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Optimization Reasoning</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {mccResult.reasoning}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 4: Dispute Resolution Output */}
          {activeTab === 'dispute' && (
            <div className="space-y-6">
              {/* Win Probability & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-slate-900/40 border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Win Probability (Merchant)</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-extrabold text-violet-400">{disputeResult.winProbabilityMerchant}%</span>
                      <span className="text-xs text-slate-500">Confidence</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-violet-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${disputeResult.winProbabilityMerchant}%` }}
                    />
                  </div>
                </Card>

                <Card className="p-6 bg-slate-900/40 border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Recommended Action</span>
                    <div className="mt-2">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {disputeResult.recommendedAction}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Based on Visa Resolve on Dispute (VRD) rules and compelling evidence guidelines.
                  </p>
                </Card>
              </div>

              {/* Key Evidence Points */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-violet-400" />
                  Compelling Evidence Analysis
                </h4>
                <div className="space-y-3">
                  {disputeResult.keyEvidencePoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-slate-300">{point}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Draft Response Letter */}
              <Card className="p-6 bg-slate-900/40 border-slate-800/80">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-slate-300">Generated Representment Letter</h4>
                  <button 
                    onClick={() => copyToClipboard(disputeResult.draftResponse)}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Letter
                  </button>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {disputeResult.draftResponse}
                </pre>
              </Card>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}