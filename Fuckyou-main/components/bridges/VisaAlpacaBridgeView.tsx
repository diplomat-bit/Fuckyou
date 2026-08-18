import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CreditCard,
  TrendingUp,
  ArrowRightLeft,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Lock,
  Building2,
  Globe,
  FileText,
  HelpCircle,
  ChevronRight,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";

// Interfaces
interface AlpacaAsset {
  symbol: string;
  name: string;
  qty: number;
  price: number;
  value: number;
  assetClass: "crypto" | "us_equity";
}

interface VisaCard {
  id: string;
  last4: string;
  brand: string;
  holderName: string;
  expiry: string;
  status: "active" | "suspended";
  limit: number;
}

interface BridgeTransaction {
  id: string;
  type: "liquidation_to_visa" | "visa_to_alpaca";
  assetSymbol?: string;
  assetQty?: number;
  amount: number;
  fee: number;
  netAmount: number;
  visaCardLast4: string;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  txHash: string;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: "low_cash" | "scheduled" | "instant_swipe";
  thresholdAmount: number;
  targetAsset: string;
  actionType: "liquidate" | "fund";
}

export default function VisaAlpacaBridgeView() {
  // State Management
  const [alpacaAssets, setAlpacaAssets] = useState<AlpacaAsset[]>([
    { symbol: "AAPL", name: "Apple Inc.", qty: 15, price: 175.5, value: 2632.5, assetClass: "us_equity" },
    { symbol: "TQQQ", name: "ProShares UltraPro QQQ", qty: 50, price: 58.2, value: 2910.0, assetClass: "us_equity" },
    { symbol: "BTCUSD", name: "Bitcoin", qty: 0.085, price: 64200.0, value: 5457.0, assetClass: "crypto" },
    { symbol: "ETHUSD", name: "Ethereum", qty: 1.25, price: 3450.0, value: 4312.5, assetClass: "crypto" },
    { symbol: "USD", name: "Cash (USD)", qty: 1250.45, price: 1.0, value: 1250.45, assetClass: "crypto" }
  ]);

  const [visaCards, setVisaCards] = useState<VisaCard[]>([
    { id: "card_1", last4: "4242", brand: "Visa Signature", holderName: "Sovereign Corp", expiry: "12/27", status: "active", limit: 25000 },
    { id: "card_2", last4: "8891", brand: "Visa Platinum", holderName: "Sovereign Treasury", expiry: "08/26", status: "active", limit: 50000 }
  ]);

  const [transactions, setTransactions] = useState<BridgeTransaction[]>([
    {
      id: "tx_101",
      type: "liquidation_to_visa",
      assetSymbol: "TQQQ",
      assetQty: 10,
      amount: 582.0,
      fee: 5.82,
      netAmount: 576.18,
      visaCardLast4: "4242",
      status: "completed",
      timestamp: "2023-10-26 14:23:11",
      txHash: "0x8f3c...a1b2"
    },
    {
      id: "tx_102",
      type: "visa_to_alpaca",
      amount: 1500.0,
      fee: 15.0,
      netAmount: 1485.0,
      visaCardLast4: "8891",
      status: "completed",
      timestamp: "2023-10-25 09:15:44",
      txHash: "0x3a9d...e5f6"
    },
    {
      id: "tx_103",
      type: "liquidation_to_visa",
      assetSymbol: "BTCUSD",
      assetQty: 0.01,
      amount: 642.0,
      fee: 9.63,
      netAmount: 632.37,
      visaCardLast4: "4242",
      status: "completed",
      timestamp: "2023-10-24 18:02:01",
      txHash: "0x7e2b...c3d4"
    }
  ]);

  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "rule_1",
      name: "Auto-Liquidate TQQQ on Visa Swipe Over $1,000",
      enabled: true,
      triggerType: "instant_swipe",
      thresholdAmount: 1000,
      targetAsset: "TQQQ",
      actionType: "liquidate"
    },
    {
      id: "rule_2",
      name: "Fund Alpaca Cash from Visa if Balance Drops Below $500",
      enabled: false,
      triggerType: "low_cash",
      thresholdAmount: 500,
      targetAsset: "USD",
      actionType: "fund"
    }
  ]);

  // Form States
  const [selectedAsset, setSelectedAsset] = useState<string>("TQQQ");
  const [liquidationAmount, setLiquidationAmount] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<string>("card_1");
  const [fundingAmount, setFundingAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Analytics Data
  const volumeData = useMemo(() => [
    { name: "Mon", Liquidation: 1200, Funding: 800 },
    { name: "Tue", Liquidation: 1900, Funding: 1500 },
    { name: "Wed", Liquidation: 800, Funding: 2200 },
    { name: "Thu", Liquidation: 2400, Funding: 1100 },
    { name: "Fri", Liquidation: 3100, Funding: 1800 },
    { name: "Sat", Liquidation: 1500, Funding: 900 },
    { name: "Sun", Liquidation: 2100, Funding: 1300 }
  ], []);

  // Calculations
  const totalPortfolioValue = useMemo(() => {
    return alpacaAssets.reduce((acc, asset) => acc + asset.value, 0);
  }, [alpacaAssets]);

  const selectedAssetDetails = useMemo(() => {
    return alpacaAssets.find(a => a.symbol === selectedAsset);
  }, [alpacaAssets, selectedAsset]);

  const estimatedPayout = useMemo(() => {
    const amt = parseFloat(liquidationAmount) || 0;
    const fee = amt * 0.01; // 1% instant liquidation fee
    return {
      gross: amt,
      fee: fee,
      net: Math.max(0, amt - fee)
    };
  }, [liquidationAmount]);

  // Handlers
  const handleInstantLiquidation = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(liquidationAmount);
    if (!amt || amt <= 0) {
      setNotification({ type: "error", message: "Please enter a valid amount." });
      return;
    }

    if (selectedAssetDetails && selectedAssetDetails.value < amt) {
      setNotification({ type: "error", message: `Insufficient balance in ${selectedAsset}.` });
      return;
    }

    setIsProcessing(true);
    setNotification(null);

    try {
      setProcessStep("1. Initiating Alpaca order execution...");
      await new Promise(r => setTimeout(r, 1200));

      setProcessStep(`2. Liquidating ${selectedAsset} shares...`);
      await new Promise(r => setTimeout(r, 1000));

      setProcessStep("3. Clearing funds & routing to Visa Direct network...");
      await new Promise(r => setTimeout(r, 1500));

      setProcessStep("4. Pushing instant payout to Visa card...");
      await new Promise(r => setTimeout(r, 1000));

      // Update balances
      setAlpacaAssets(prev => prev.map(asset => {
        if (asset.symbol === selectedAsset) {
          const newQty = asset.qty - (amt / asset.price);
          return {
            ...asset,
            qty: Math.max(0, newQty),
            value: Math.max(0, newQty * asset.price)
          };
        }
        return asset;
      }));

      // Add transaction
      const card = visaCards.find(c => c.id === selectedCard);
      const newTx: BridgeTransaction = {
        id: `tx_${Date.now()}`,
        type: "liquidation_to_visa",
        assetSymbol: selectedAsset,
        assetQty: amt / (selectedAssetDetails?.price || 1),
        amount: amt,
        fee: amt * 0.01,
        netAmount: amt * 0.99,
        visaCardLast4: card?.last4 || "4242",
        status: "completed",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        txHash: "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      };

      setTransactions(prev => [newTx, ...prev]);
      setLiquidationAmount("");
      setNotification({ type: "success", message: `Successfully liquidated $${amt.toFixed(2)} of ${selectedAsset} to Visa ending in ${card?.last4}.` });
    } catch (err) {
      setNotification({ type: "error", message: "Bridge execution failed. Please try again." });
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  }, [liquidationAmount, selectedAsset, selectedAssetDetails, selectedCard, visaCards]);

  const handleInstantFunding = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(fundingAmount);
    if (!amt || amt <= 0) {
      setNotification({ type: "error", message: "Please enter a valid amount." });
      return;
    }

    setIsProcessing(true);
    setNotification(null);

    try {
      setProcessStep("1. Authorizing Visa card transaction...");
      await new Promise(r => setTimeout(r, 1200));

      setProcessStep("2. Pulling funds via Visa Direct network...");
      await new Promise(r => setTimeout(r, 1000));

      setProcessStep("3. Depositing instant cash into Alpaca account...");
      await new Promise(r => setTimeout(r, 1200));

      // Update cash balance
      setAlpacaAssets(prev => prev.map(asset => {
        if (asset.symbol === "USD") {
          return {
            ...asset,
            qty: asset.qty + amt,
            value: asset.value + amt
          };
        }
        return asset;
      }));

      // Add transaction
      const card = visaCards.find(c => c.id === selectedCard);
      const newTx: BridgeTransaction = {
        id: `tx_${Date.now()}`,
        type: "visa_to_alpaca",
        amount: amt,
        fee: amt * 0.01,
        netAmount: amt * 0.99,
        visaCardLast4: card?.last4 || "4242",
        status: "completed",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        txHash: "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      };

      setTransactions(prev => [newTx, ...prev]);
      setFundingAmount("");
      setNotification({ type: "success", message: `Successfully funded Alpaca account with $${amt.toFixed(2)} from Visa ending in ${card?.last4}.` });
    } catch (err) {
      setNotification({ type: "error", message: "Funding execution failed. Please try again." });
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  }, [fundingAmount, selectedCard, visaCards]);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Visa ⇄ Alpaca Bridge</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Instant liquidation of brokerage assets to Visa payouts and real-time card funding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Visa Direct Active
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Alpaca API Connected
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-xs text-slate-400 font-medium">Total Portfolio Value</p>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold mt-2">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1">Across US Equities & Crypto</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-xs text-slate-400 font-medium">Visa Payout Speed</p>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-2">Instant</p>
          <p className="text-xs text-emerald-400 mt-1">Average settlement: &lt; 30s</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-xs text-slate-400 font-medium">Active Automation Rules</p>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {rules.filter(r => r.enabled).length} <span className="text-sm text-slate-500">/ {rules.length}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Real-time triggers active</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-xs text-slate-400 font-medium">Bridge Fee Rate</p>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold mt-2">1.00%</p>
          <p className="text-xs text-slate-500 mt-1">Flat rate per instant transfer</p>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium text-sm">
              {notification.type === "success" ? "Transaction Successful" : "Transaction Failed"}
            </p>
            <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Instant Liquidation & Funding Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabbed Action Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              Instant Bridge Terminal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Liquidation Form */}
              <form onSubmit={handleInstantLiquidation} className="space-y-4 border-r border-slate-800/50 pr-0 md:pr-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    Liquidate to Visa
                  </h3>
                  <span className="text-xs text-slate-500">Alpaca ➔ Visa</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Select Asset to Liquidate</label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {alpacaAssets.map(asset => (
                      <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol} - {asset.name} (${asset.value.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Amount to Liquidate (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={liquidationAmount}
                      onChange={(e) => setLiquidationAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-16 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setLiquidationAmount((selectedAssetDetails?.value || 0).toString())}
                      className="absolute right-2 top-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Destination Visa Card</label>
                  <select
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {visaCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.brand} (*{card.last4}) - {card.holderName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee Breakdown */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Gross Liquidation:</span>
                    <span>${estimatedPayout.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Instant Payout Fee (1%):</span>
                    <span>-${estimatedPayout.fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-200 font-medium border-t border-slate-800/60 pt-1.5">
                    <span>Est. Visa Payout:</span>
                    <span className="text-emerald-400">${estimatedPayout.net.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !liquidationAmount}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Liquidate & Payout Instantly
                    </>
                  )}
                </button>
              </form>

              {/* Funding Form */}
              <form onSubmit={handleInstantFunding} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    Instant Card Funding
                  </h3>
                  <span className="text-xs text-slate-500">Visa ➔ Alpaca</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Source Visa Card</label>
                  <select
                    value={selectedCard}
                    onChange={(e) => setSelectedCard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {visaCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.brand} (*{card.last4}) - Limit: ${card.limit.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Funding Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Target Asset</label>
                  <select
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 focus:outline-none"
                  >
                    <option>USD - Cash (Instant Buying Power)</option>
                  </select>
                </div>

                {/* Fee Breakdown */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Funding Amount:</span>
                    <span>${(parseFloat(fundingAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Visa Network Fee (1%):</span>
                    <span>-${((parseFloat(fundingAmount) || 0) * 0.01).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-200 font-medium border-t border-slate-800/60 pt-1.5">
                    <span>Net Alpaca Deposit:</span>
                    <span className="text-indigo-400">${((parseFloat(fundingAmount) || 0) * 0.99).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !fundingAmount}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Fund Alpaca Instantly
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Processing Steps Overlay */}
            {isProcessing && (
              <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-400">Bridge Pipeline Active</span>
                  <span className="text-[10px] text-slate-500">Do not close this window</span>
                </div>
                <p className="text-sm text-slate-200 font-mono">{processStep}</p>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full animate-pulse" style={{ width: "75%" }} />
                </div>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Bridge Activity Log
              </h2>
              <button className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                Export CSV <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Visa Card</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/20">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          tx.type === "liquidation_to_visa" 
                            ? "bg-rose-500/10 text-rose-400" 
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {tx.type === "liquidation_to_visa" ? "Liquidation" : "Funding"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {tx.assetSymbol || "USD"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">${tx.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">Fee: ${tx.fee.toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        Visa *{tx.visaCardLast4}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {tx.timestamp}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {tx.txHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Automation Rules & Analytics */}
        <div className="space-y-6">
          
          {/* Automation Rules */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Automation Rules
              </h2>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-medium">
                Real-time
              </span>
            </div>

            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">{rule.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Trigger: {rule.triggerType === "instant_swipe" ? "Visa Swipe" : "Low Balance"}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                        rule.enabled ? "bg-indigo-600" : "bg-slate-800"
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                        rule.enabled ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-2">
                    <span>Threshold: <strong className="text-slate-200">${rule.thresholdAmount}</strong></span>
                    <span>Target: <strong className="text-slate-200">{rule.targetAsset}</strong></span>
                  </div>
                </div>
              ))}

              <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors">
                + Create Custom Automation Rule
              </button>
            </div>
          </div>

          {/* Bridge Analytics */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Bridge Volume (7D)
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorLiquidation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="Liquidation" stroke="#f43f5e" fillOpacity={1} fill="url(#colorLiquidation)" />
                  <Area type="monotone" dataKey="Funding" stroke="#6366f1" fillOpacity={1} fill="url(#colorFunding)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Security & Compliance Info */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security & Compliance
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              All instant payouts are routed through Visa Direct with real-time AML screening and PCI-DSS compliance. Brokerage liquidations are executed via Alpaca Securities LLC, member FINRA/SIPC.
            </p>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> 256-bit Encryption
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Visa Direct Network
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}