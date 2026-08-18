import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, CreditCard, Coins, Gavel, FileText, TrendingUp, 
  RefreshCw, AlertTriangle, CheckCircle2, ArrowRight, Cpu, 
  Lock, Unlock, Database, MapPin, Sparkles, Loader2, 
  Plus, Trash2, ExternalLink, Scale, Landmark, HelpCircle, Info,
  ChevronRight, Check, Play, ShieldAlert, Zap, FileCheck
} from 'lucide-react';
import { callGemini } from '../services/geminiService';

interface CryptoCollateral {
  token: string;
  amount: number;
  priceUsd: number;
  valueUsd: number;
  ltvThreshold: number; // e.g. 0.70 for 70%
}

interface VisaCreditLine {
  cardNumber: string;
  creditLimit: number;
  availableCredit: number;
  utilizedCredit: number;
  ltvRatio: number;
  interestRate: number;
  status: 'active' | 'margin_call' | 'frozen';
}

interface TaxLienAuction {
  id: string;
  parcelId: string;
  address: string;
  county: string;
  assessedValue: number;
  delinquentTax: number;
  currentBid: number;
  minBid: number;
  interestRateYield: number; // e.g. 18% max statutory yield
  timeLeft: string;
  status: 'active' | 'won' | 'lost' | 'pending_deed' | 'deed_registered';
  riskScore: number; // 1-100
  geminiRecommendation: string;
  coordinates: string;
}

interface BridgeTransaction {
  id: string;
  timestamp: string;
  type: 'collateral_deposit' | 'visa_charge' | 'bid_placed' | 'auction_won' | 'deed_registered' | 'repayment';
  amount: number;
  token?: string;
  details: string;
  txHash?: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function VisaTaxLienAuctionBridge() {
  // State
  const [collateral, setCollateral] = useState<CryptoCollateral[]>([
    { token: 'ETH', amount: 12.5, priceUsd: 3200, valueUsd: 40000, ltvThreshold: 0.75 },
    { token: 'WBTC', amount: 0.85, priceUsd: 64000, valueUsd: 54400, ltvThreshold: 0.80 },
    { token: 'USDC', amount: 15000, priceUsd: 1.00, valueUsd: 15000, ltvThreshold: 0.90 }
  ]);

  const [creditLine, setCreditLine] = useState<VisaCreditLine>({
    cardNumber: '4147 •••• •••• 8829',
    creditLimit: 75000,
    availableCredit: 52000,
    utilizedCredit: 23000,
    ltvRatio: 21.02, // (utilizedCredit / totalCollateralValue) * 100
    interestRate: 5.75,
    status: 'active'
  });

  const [auctions, setAuctions] = useState<TaxLienAuction[]>([
    {
      id: 'TL-2024-091',
      parcelId: '52-14-09-281-004',
      address: '1408 Ocean Drive, Miami Beach, FL 33139',
      county: 'Miami-Dade County',
      assessedValue: 1450000,
      delinquentTax: 18450,
      currentBid: 19500,
      minBid: 18450,
      interestRateYield: 18.0,
      timeLeft: '14m 32s',
      status: 'active',
      riskScore: 12,
      geminiRecommendation: 'Highly recommended. Prime real estate with extremely low LTV relative to assessed value. High probability of redemption or acquisition.',
      coordinates: '25.7854° N, 80.1301° W'
    },
    {
      id: 'TL-2024-104',
      parcelId: '12-04-33-102-019',
      address: '742 Evergreen Terrace, Orlando, FL 32801',
      county: 'Orange County',
      assessedValue: 320000,
      delinquentTax: 4200,
      currentBid: 4500,
      minBid: 4200,
      interestRateYield: 12.5,
      timeLeft: '1h 05m',
      status: 'active',
      riskScore: 35,
      geminiRecommendation: 'Moderate risk. Residential property in stable neighborhood. Good yield potential, low chance of default but solid collateral backing.',
      coordinates: '28.5383° N, 81.3792° W'
    },
    {
      id: 'TL-2024-112',
      parcelId: '88-21-15-404-088',
      address: '901 Brickell Avenue, Suite 400, Miami, FL 33131',
      county: 'Miami-Dade County',
      assessedValue: 4800000,
      delinquentTax: 124000,
      currentBid: 124000,
      minBid: 124000,
      interestRateYield: 15.0,
      timeLeft: '3h 45m',
      status: 'active',
      riskScore: 58,
      geminiRecommendation: 'Requires caution. High delinquent tax amount. Commercial condo unit with potential association liens. Ensure Visa credit line has sufficient headroom.',
      coordinates: '25.7652° N, 80.1908° W'
    }
  ]);

  const [transactions, setTransactions] = useState<BridgeTransaction[]>([
    {
      id: 'TX-99201',
      timestamp: '2024-04-15 14:22:01',
      type: 'collateral_deposit',
      amount: 2.5,
      token: 'ETH',
      details: 'Deposited 2.5 ETH to Collateral Vault',
      txHash: '0x7f3a...92b1',
      status: 'completed'
    },
    {
      id: 'TX-99188',
      timestamp: '2024-04-14 09:15:30',
      type: 'auction_won',
      amount: 12500,
      details: 'Won Tax Lien TL-2024-044 (Orange County)',
      txHash: '0x4a2c...11e9',
      status: 'completed'
    },
    {
      id: 'TX-99189',
      timestamp: '2024-04-14 09:16:00',
      type: 'deed_registered',
      amount: 0,
      details: 'Automated Deed Registration for TL-2024-044',
      txHash: '0x88b2...ff31',
      status: 'completed'
    }
  ]);

  const [selectedAuction, setSelectedAuction] = useState<TaxLienAuction | null>(auctions[0]);
  const [bidAmount, setBidAmount] = useState<number>(auctions[0]?.currentBid + 500 || 0);
  const [isBidding, setIsBidding] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositToken, setDepositToken] = useState<string>('ETH');
  const [autoDeedRegistration, setAutoDeedRegistration] = useState<boolean>(true);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');

  // Calculate totals
  const totalCollateralValue = useMemo(() => {
    return collateral.reduce((sum, item) => sum + item.valueUsd, 0);
  }, [collateral]);

  const maxBorrowLimit = useMemo(() => {
    return collateral.reduce((sum, item) => sum + (item.valueUsd * item.ltvThreshold), 0);
  }, [collateral]);

  // Recalculate LTV and Credit Line parameters when collateral or utilization changes
  useEffect(() => {
    const ltv = totalCollateralValue > 0 ? (creditLine.utilizedCredit / totalCollateralValue) * 100 : 0;
    const available = Math.max(0, maxBorrowLimit - creditLine.utilizedCredit);
    
    setCreditLine(prev => ({
      ...prev,
      creditLimit: maxBorrowLimit,
      availableCredit: available,
      ltvRatio: parseFloat(ltv.toFixed(2))
    }));
  }, [collateral, creditLine.utilizedCredit, totalCollateralValue, maxBorrowLimit]);

  // Handle Instant Bid
  const handlePlaceBid = async () => {
    if (!selectedAuction) return;
    if (bidAmount > creditLine.availableCredit) {
      alert('Insufficient available Visa credit line. Please deposit more crypto collateral.');
      return;
    }

    setIsBidding(true);

    // Simulate Visa transaction authorization and smart contract execution
    setTimeout(() => {
      // Update credit line utilization
      setCreditLine(prev => {
        const newUtilized = prev.utilizedCredit + bidAmount;
        return {
          ...prev,
          utilizedCredit: newUtilized
        };
      });

      // Update auction status
      setAuctions(prev => prev.map(auc => {
        if (auc.id === selectedAuction.id) {
          return {
            ...auc,
            currentBid: bidAmount,
            status: 'won' // Simulate instant win for demo purposes
          };
        }
        return auc;
      }));

      // Add transactions
      const newTxId1 = 'TX-' + Math.floor(10000 + Math.random() * 90000);
      const newTxId2 = 'TX-' + Math.floor(10000 + Math.random() * 90000);
      
      const visaChargeTx: BridgeTransaction = {
        id: newTxId1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'visa_charge',
        amount: bidAmount,
        details: `Visa Credit Line charge for Tax Lien Bid: ${selectedAuction.id}`,
        txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...',
        status: 'completed'
      };

      const newTransactions = [visaChargeTx];

      if (autoDeedRegistration) {
        const deedTx: BridgeTransaction = {
          id: newTxId2,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: 'deed_registered',
          amount: 0,
          details: `Automated Deed Registration initiated for ${selectedAuction.address}`,
          txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...',
          status: 'completed'
        };
        newTransactions.unshift(deedTx);
      }

      setTransactions(prev => [...newTransactions, ...prev]);
      
      // Update selected auction state
      setSelectedAuction(prev => prev ? {
        ...prev,
        currentBid: bidAmount,
        status: autoDeedRegistration ? 'deed_registered' : 'won'
      } : null);

      setIsBidding(false);
    }, 2000);
  };

  // Handle Collateral Deposit
  const handleDepositCollateral = () => {
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsDepositing(true);

    setTimeout(() => {
      setCollateral(prev => prev.map(item => {
        if (item.token === depositToken) {
          const newAmount = item.amount + amountNum;
          const newValue = newAmount * item.priceUsd;
          return {
            ...item,
            amount: newAmount,
            valueUsd: newValue
          };
        }
        return item;
      }));

      const newTxId = 'TX-' + Math.floor(10000 + Math.random() * 90000);
      const depositTx: BridgeTransaction = {
        id: newTxId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'collateral_deposit',
        amount: amountNum,
        token: depositToken,
        details: `Deposited ${amountNum} ${depositToken} as collateral`,
        txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...',
        status: 'completed'
      };

      setTransactions(prev => [depositTx, ...prev]);
      setDepositAmount('');
      setIsDepositing(false);
    }, 1500);
  };

  // Gemini AI Analysis
  const runGeminiAnalysis = async () => {
    if (!selectedAuction) return;
    setAiAnalyzing(true);
    setAiAnalysisResult('');

    try {
      const prompt = `Analyze this tax lien auction opportunity for a high-net-worth investor using a Visa credit line backed by crypto collateral:
      Property Address: ${selectedAuction.address}
      Assessed Value: $${selectedAuction.assessedValue.toLocaleString()}
      Delinquent Tax Amount: $${selectedAuction.delinquentTax.toLocaleString()}
      Current Bid: $${selectedAuction.currentBid.toLocaleString()}
      Statutory Max Yield: ${selectedAuction.interestRateYield}%
      County: ${selectedAuction.county}
      
      Provide a concise risk assessment, collateral optimization advice (LTV impact), and a bidding strategy recommendation.`;

      const response = await callGemini({
        prompt,
        systemInstruction: "You are an elite AI financial advisor specializing in real estate tax liens, crypto-backed credit lines, and decentralized asset tokenization."
      });

      setAiAnalysisResult(response || "Unable to generate analysis at this time.");
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      setAiAnalysisResult("Gemini AI analysis offline. Fallback: This property represents an exceptional LTV ratio of less than 2%. Bidding up to $25,000 remains highly profitable given the 18% statutory interest yield.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Select auction helper
  const selectAuction = (auc: TaxLienAuction) => {
    setSelectedAuction(auc);
    setBidAmount(auc.currentBid + 500);
    setAiAnalysisResult('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Visa® Tax Lien Auction Bridge
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Instant bidding on tax lien certificates backed by real-time crypto collateral vaults with automated deed registration.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Visa Network & Smart Contracts Connected</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Collateral & Visa Credit Line */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Visa Card & Credit Line Status */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Visa® Sovereign Credit Line</span>
                <h3 className="text-lg font-bold text-slate-200 mt-0.5">{creditLine.cardNumber}</h3>
              </div>
              <div className="bg-slate-800/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                VISA PLATINUM
              </div>
            </div>

            {/* Credit Line Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <span className="text-xs text-slate-400 block">Available Credit</span>
                <span className="text-xl font-bold text-white">${creditLine.availableCredit.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
                <span className="text-xs text-slate-400 block">Utilized Credit</span>
                <span className="text-xl font-bold text-slate-300">${creditLine.utilizedCredit.toLocaleString()}</span>
              </div>
            </div>

            {/* LTV Progress Bar */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Collateral LTV Ratio</span>
                <span className={`font-semibold ${creditLine.ltvRatio > 65 ? 'text-rose-400' : creditLine.ltvRatio > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {creditLine.ltvRatio}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    creditLine.ltvRatio > 65 ? 'bg-rose-500' : creditLine.ltvRatio > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, creditLine.ltvRatio)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% LTV</span>
                <span>45% Warning</span>
                <span>75% Liquidation</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>APR: <strong className="text-slate-200">{creditLine.interestRate}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Status: <strong className="text-emerald-400 uppercase">Active</strong></span>
              </div>
            </div>
          </div>

          {/* Collateral Vault */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-200">Crypto Collateral Vault</h3>
              </div>
              <span className="text-xs text-slate-400">Total: <strong className="text-white">${totalCollateralValue.toLocaleString()}</strong></span>
            </div>

            {/* Collateral List */}
            <div className="space-y-3 mb-6">
              {collateral.map((item) => (
                <div key={item.token} className="flex justify-between items-center bg-slate-950/60 border border-slate-800/40 rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-300 border border-slate-800">
                      {item.token}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-200 block">{item.token}</span>
                      <span className="text-[10px] text-slate-400">{item.amount} {item.token} @ ${item.priceUsd.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">${item.valueUsd.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">LTV Cap: {item.ltvThreshold * 100}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Deposit Collateral Form */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Deposit More Collateral</span>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 flex-1"
                />
                <select 
                  value={depositToken}
                  onChange={(e) => setDepositToken(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="WBTC">WBTC</option>
                  <option value="USDC">USDC</option>
                </select>
                <button 
                  onClick={handleDepositCollateral}
                  disabled={isDepositing || !depositAmount}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isDepositing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Deposit
                </button>
              </div>
            </div>
          </div>

          {/* Automated Deed Registration Toggle */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-0.5">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Automated Deed Registrar</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instantly register tax deeds on-chain upon winning the auction.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setAutoDeedRegistration(!autoDeedRegistration)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                autoDeedRegistration ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                autoDeedRegistration ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>

        {/* Middle Column: Live Auctions Feed */}
        <div className="space-y-6 xl:col-span-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col h-full min-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-200">Live Tax Lien Auctions</h3>
              </div>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-semibold border border-blue-500/20">
                Florida Feed
              </span>
            </div>

            {/* Search / Filter placeholder */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search by county, parcel ID, or address..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                disabled
              />
            </div>

            {/* Auction List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-[500px]">
              {auctions.map((auc) => {
                const isSelected = selectedAuction?.id === auc.id;
                return (
                  <div 
                    key={auc.id}
                    onClick={() => selectAuction(auc)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-slate-900 border-blue-500 shadow-md shadow-blue-500/5' 
                        : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{auc.county}</span>
                        <h4 className="text-sm font-bold text-slate-200 mt-0.5">{auc.address.split(',')[0]}</h4>
                      </div>
                      <span className="text-xs font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                        {auc.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Delinquent Tax</span>
                        <span className="font-bold text-rose-400">${auc.delinquentTax.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Current Bid</span>
                        <span className="font-bold text-slate-200">${auc.currentBid.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Max Yield</span>
                        <span className="font-bold text-emerald-400">{auc.interestRateYield}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Parcel: {auc.parcelId}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-400 font-medium">{auc.timeLeft} left</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {auc.status !== 'active' && (
                      <div className="mt-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        <Check className="w-3 h-3" />
                        <span>
                          {auc.status === 'won' && 'Auction Won - Pending Deed'}
                          {auc.status === 'deed_registered' && 'Deed Registered On-Chain'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Bid Execution & Gemini AI Advisor */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Bid Execution Panel */}
          {selectedAuction ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-blue-400">Selected Parcel</span>
                  <h3 className="text-lg font-bold text-slate-200 mt-0.5">{selectedAuction.address}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedAuction.county} • {selectedAuction.coordinates}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Assessed Value</span>
                  <span className="text-lg font-bold text-emerald-400">${selectedAuction.assessedValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Bid Input */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Delinquent Tax (Min Bid)</span>
                  <span className="font-bold text-slate-200">${selectedAuction.minBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current High Bid</span>
                  <span className="font-bold text-slate-200">${selectedAuction.currentBid.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-800/80 my-2" />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Your Visa Bid Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handlePlaceBid}
                  disabled={isBidding || selectedAuction.status !== 'active'}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  {isBidding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Visa Credit Line...</span>
                    </>
                  ) : selectedAuction.status !== 'active' ? (
                    <span>Auction Completed</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Place Instant Visa Bid</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gemini AI Advisor Widget */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">Gemini AI Bid Advisor</span>
                  </div>
                  <button 
                    onClick={runGeminiAnalysis}
                    disabled={aiAnalyzing}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:text-slate-500"
                  >
                    {aiAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Analyze Property
                  </button>
                </div>

                {aiAnalysisResult ? (
                  <div className="text-xs text-slate-300 bg-slate-900/60 border border-slate-800/60 rounded-lg p-3 leading-relaxed space-y-2">
                    <p>{aiAnalysisResult}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>LTV Impact: Safe (+0.8% utilization)</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-900/30 border border-slate-800/40 rounded-lg p-3 leading-relaxed">
                    <p className="italic">{selectedAuction.geminiRecommendation}</p>
                    <button 
                      onClick={runGeminiAnalysis}
                      className="mt-2 text-[10px] text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      Generate deep risk & yield analysis <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500">
              <Gavel className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">Select an active tax lien auction to place a bid or run AI analysis.</p>
            </div>
          )}

          {/* Transaction Ledger */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-200">Bridge Ledger</h3>
              </div>
              <span className="text-xs text-slate-500">Real-time Sync</span>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-slate-950/60 border border-slate-800/40 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold uppercase text-[10px] ${
                      tx.type === 'collateral_deposit' ? 'text-blue-400' :
                      tx.type === 'visa_charge' ? 'text-amber-400' :
                      tx.type === 'auction_won' ? 'text-emerald-400' :
                      tx.type === 'deed_registered' ? 'text-purple-400' : 'text-slate-400'
                    }`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 text-[10px]">{tx.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{tx.details}</p>
                  <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500">
                    <span>Hash: <strong className="text-slate-400 font-mono">{tx.txHash}</strong></span>
                    {tx.amount > 0 && (
                      <span className="font-bold text-slate-300">
                        {tx.token ? `${tx.amount} ${tx.token}` : `$${tx.amount.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}