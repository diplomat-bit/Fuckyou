import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { 
  CreditCard, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Coins, 
  ArrowRightLeft, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Lock, 
  Globe, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Cpu, 
  Terminal, 
  FileText, 
  Sparkles, 
  ShieldAlert,
  Layers,
  Check,
  Copy
} from "lucide-react";
import { callGemini } from "../services/geminiService";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface VisaTransaction {
  visaTxId: string;
  cardholderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: "AUTHORIZED" | "SETTLED" | "DECLINED" | "REVERSED";
  authCode: string;
}

export interface CryptoSettlement {
  settlementId: string;
  visaTxId: string;
  walletAddress: string;
  stablecoinSymbol: "USDC" | "USDT" | "EURC" | "SOV";
  cryptoAmount: number;
  fiatAmount: number;
  fxRate: number;
  gasUsed: number;
  txHash: string;
  blockNumber: number;
  status: "PENDING" | "CONFIRMED" | "FAILED";
}

export interface SovereignLedgerEntry {
  entryId: string;
  timestamp: string;
  source: "VISA_BRIDGE";
  visaTxId: string;
  cryptoTxHash: string;
  amount: number;
  currency: string;
  complianceHash: string;
  signature: string;
  status: "SYNCED" | "FAILED";
}

export interface BridgeMetrics {
  totalVolumeFiat: number;
  totalTransactions: number;
  averageSettlementTimeMs: number;
  stablecoinReserves: {
    USDC: number;
    USDT: number;
    EURC: number;
    SOV: number;
  };
  activeLiquidityProviders: number;
  systemHealth: "OPERATIONAL" | "DEGRADED" | "CRITICAL";
}

interface VisaCryptoBridgeContextType {
  visaTransactions: VisaTransaction[];
  cryptoSettlements: CryptoSettlement[];
  ledgerEntries: SovereignLedgerEntry[];
  metrics: BridgeMetrics;
  isProcessing: boolean;
  logs: string[];
  addLog: (message: string) => void;
  authorizeVisaPayment: (cardholderId: string, merchantId: string, amount: number, currency: string) => Promise<VisaTransaction | null>;
  settleToCrypto: (visaTxId: string, walletAddress: string, stablecoin: "USDC" | "USDT" | "EURC" | "SOV") => Promise<CryptoSettlement | null>;
  syncLedger: (visaTxId: string, cryptoTxHash: string) => Promise<SovereignLedgerEntry | null>;
  runAiRiskAssessment: (visaTxId: string) => Promise<string>;
}

// ==========================================
// CONTEXT & PROVIDER
// ==========================================

const VisaCryptoBridgeContext = createContext<VisaCryptoBridgeContextType | undefined>(undefined);

export const useVisaCryptoBridge = () => {
  const context = useContext(VisaCryptoBridgeContext);
  if (!context) {
    throw new Error("useVisaCryptoBridge must be used within a VisaCryptoBridgeProvider");
  }
  return context;
};

export const VisaCryptoBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visaTransactions, setVisaTransactions] = useState<VisaTransaction[]>([]);
  const [cryptoSettlements, setCryptoSettlements] = useState<CryptoSettlement[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<SovereignLedgerEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [metrics, setMetrics] = useState<BridgeMetrics>({
    totalVolumeFiat: 12450800,
    totalTransactions: 4820,
    averageSettlementTimeMs: 1240,
    stablecoinReserves: {
      USDC: 5000000,
      USDT: 3500000,
      EURC: 2000000,
      SOV: 10000000,
    },
    activeLiquidityProviders: 8,
    systemHealth: "OPERATIONAL",
  });

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  }, []);

  // Initialize with mock data
  useEffect(() => {
    addLog("Visa-Crypto Bridge Service Initialized.");
    addLog("Connected to Visa Developer Platform (Sandbox).");
    addLog("Connected to Ethereum Mainnet & Sovereign L2 RPC Nodes.");
    
    // Seed initial transactions
    const mockVisa: VisaTransaction[] = [
      {
        visaTxId: "V-TX-982104",
        cardholderId: "CH-8821",
        merchantId: "MERCH-AMZN",
        amount: 150.00,
        currency: "USD",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "SETTLED",
        authCode: "AUTH-881204"
      },
      {
        visaTxId: "V-TX-982105",
        cardholderId: "CH-4412",
        merchantId: "MERCH-UBER",
        amount: 24.50,
        currency: "USD",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: "SETTLED",
        authCode: "AUTH-119204"
      }
    ];

    const mockCrypto: CryptoSettlement[] = [
      {
        settlementId: "SETTLE-001",
        visaTxId: "V-TX-982104",
        walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
        stablecoinSymbol: "USDC",
        cryptoAmount: 150.00,
        fiatAmount: 150.00,
        fxRate: 1.0,
        gasUsed: 45210,
        txHash: "0x3f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e",
        blockNumber: 18402190,
        status: "CONFIRMED"
      }
    ];

    const mockLedger: SovereignLedgerEntry[] = [
      {
        entryId: "LEDGER-9921",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        source: "VISA_BRIDGE",
        visaTxId: "V-TX-982104",
        cryptoTxHash: "0x3f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e",
        amount: 150.00,
        currency: "USD",
        complianceHash: "SHA256-882104921049102491024",
        signature: "SIG-0x882104...9921",
        status: "SYNCED"
      }
    ];

    setVisaTransactions(mockVisa);
    setCryptoSettlements(mockCrypto);
    setLedgerEntries(mockLedger);
  }, [addLog]);

  // 1. Authorize Visa Payment
  const authorizeVisaPayment = async (
    cardholderId: string,
    merchantId: string,
    amount: number,
    currency: string
  ): Promise<VisaTransaction | null> => {
    setIsProcessing(true);
    addLog(`Initiating Visa Authorization for ${cardholderId} - Amount: ${amount} ${currency}`);
    
    try {
      // Simulate Visa network latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const isApproved = amount < 10000; // Mock rule: decline transactions over 10k for demo
      
      if (!isApproved) {
        addLog(`Visa Authorization DECLINED: Amount exceeds single-transaction limit.`);
        setIsProcessing(false);
        return null;
      }

      const newTx: VisaTransaction = {
        visaTxId: `V-TX-${Math.floor(100000 + Math.random() * 900000)}`,
        cardholderId,
        merchantId,
        amount,
        currency,
        timestamp: new Date().toISOString(),
        status: "AUTHORIZED",
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`
      };

      setVisaTransactions((prev) => [newTx, ...prev]);
      addLog(`Visa Authorization SUCCESS. TxID: ${newTx.visaTxId}, AuthCode: ${newTx.authCode}`);
      
      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        totalTransactions: prev.totalTransactions + 1,
        totalVolumeFiat: prev.totalVolumeFiat + amount
      }));

      setIsProcessing(false);
      return newTx;
    } catch (error) {
      addLog(`Visa Authorization FAILED: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsProcessing(false);
      return null;
    }
  };

  // 2. Settle Crypto to Fiat (or vice versa) via Stablecoin Issuance
  const settleToCrypto = async (
    visaTxId: string,
    walletAddress: string,
    stablecoin: "USDC" | "USDT" | "EURC" | "SOV"
  ): Promise<CryptoSettlement | null> => {
    setIsProcessing(true);
    addLog(`Initiating Crypto Settlement for Visa Tx: ${visaTxId} to Wallet: ${walletAddress}`);

    try {
      const visaTx = visaTransactions.find((tx) => tx.visaTxId === visaTxId);
      if (!visaTx) {
        throw new Error("Visa transaction not found.");
      }

      // Simulate Smart Contract execution & FX conversion
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const fxRate = stablecoin === "EURC" ? 0.92 : 1.0; // Mock FX rate
      const cryptoAmount = visaTx.amount * fxRate;
      const gasUsed = Math.floor(21000 + Math.random() * 30000);
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const newSettlement: CryptoSettlement = {
        settlementId: `SETTLE-${Math.floor(100 + Math.random() * 900)}`,
        visaTxId,
        walletAddress,
        stablecoinSymbol: stablecoin,
        cryptoAmount,
        fiatAmount: visaTx.amount,
        fxRate,
        gasUsed,
        txHash,
        blockNumber: 18402200 + Math.floor(Math.random() * 100),
        status: "CONFIRMED"
      };

      // Update Visa transaction status to SETTLED
      setVisaTransactions((prev) =>
        prev.map((tx) => (tx.visaTxId === visaTxId ? { ...tx, status: "SETTLED" } : tx))
      );

      setCryptoSettlements((prev) => [newSettlement, ...prev]);
      addLog(`Crypto Settlement CONFIRMED. Hash: ${txHash.slice(0, 10)}...`);
      
      // Deduct from reserves
      setMetrics((prev) => ({
        ...prev,
        stablecoinReserves: {
          ...prev.stablecoinReserves,
          [stablecoin]: prev.stablecoinReserves[stablecoin] - cryptoAmount
        }
      }));

      setIsProcessing(false);
      return newSettlement;
    } catch (error) {
      addLog(`Crypto Settlement FAILED: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsProcessing(false);
      return null;
    }
  };

  // 3. Sync with Sovereign Ledger
  const syncLedger = async (visaTxId: string, cryptoTxHash: string): Promise<SovereignLedgerEntry | null> => {
    setIsProcessing(true);
    addLog(`Syncing transaction ${visaTxId} with Sovereign Ledger...`);

    try {
      const visaTx = visaTransactions.find((tx) => tx.visaTxId === visaTxId);
      if (!visaTx) throw new Error("Visa transaction not found.");

      await new Promise((resolve) => setTimeout(resolve, 800));

      const complianceHash = "SHA256-" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const signature = "SIG-0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const newEntry: SovereignLedgerEntry = {
        entryId: `LEDGER-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        source: "VISA_BRIDGE",
        visaTxId,
        cryptoTxHash,
        amount: visaTx.amount,
        currency: visaTx.currency,
        complianceHash,
        signature,
        status: "SYNCED"
      };

      setLedgerEntries((prev) => [newEntry, ...prev]);
      addLog(`Sovereign Ledger Sync SUCCESS. Entry ID: ${newEntry.entryId}`);
      setIsProcessing(false);
      return newEntry;
    } catch (error) {
      addLog(`Sovereign Ledger Sync FAILED: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsProcessing(false);
      return null;
    }
  };

  // 4. Gemini AI Risk Assessment
  const runAiRiskAssessment = async (visaTxId: string): Promise<string> => {
    addLog(`Running Gemini AI Risk Assessment on Visa Tx: ${visaTxId}...`);
    const visaTx = visaTransactions.find((tx) => tx.visaTxId === visaTxId);
    if (!visaTx) return "Transaction not found.";

    try {
      const prompt = `
        Analyze this Visa-to-Crypto bridge transaction for potential fraud, money laundering, or compliance anomalies:
        Visa TxID: ${visaTx.visaTxId}
        Cardholder ID: ${visaTx.cardholderId}
        Merchant ID: ${visaTx.merchantId}
        Amount: ${visaTx.amount} ${visaTx.currency}
        Timestamp: ${visaTx.timestamp}
        
        Provide a concise risk score (0-100), compliance status, and a brief recommendation.
      `;

      const response = await callGemini(prompt);
      addLog(`Gemini AI Risk Assessment Completed for ${visaTxId}.`);
      return response;
    } catch (error) {
      addLog(`Gemini AI Assessment Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return "AI Risk Assessment temporarily unavailable.";
    }
  };

  return (
    <VisaCryptoBridgeContext.Provider
      value={{
        visaTransactions,
        cryptoSettlements,
        ledgerEntries,
        metrics,
        isProcessing,
        logs,
        addLog,
        authorizeVisaPayment,
        settleToCrypto,
        syncLedger,
        runAiRiskAssessment
      }}
    >
      {children}
    </VisaCryptoBridgeContext.Provider>
  );
};

// ==========================================
// DASHBOARD UI COMPONENT
// ==========================================

export default function VisaCryptoBridgeService() {
  return (
    <VisaCryptoBridgeProvider>
      <VisaCryptoBridgeDashboard />
    </VisaCryptoBridgeProvider>
  );
}

function VisaCryptoBridgeDashboard() {
  const {
    visaTransactions,
    cryptoSettlements,
    ledgerEntries,
    metrics,
    isProcessing,
    logs,
    authorizeVisaPayment,
    settleToCrypto,
    syncLedger,
    runAiRiskAssessment
  } = useVisaCryptoBridge();

  // Form States
  const [cardholderId, setCardholderId] = useState("CH-9921");
  const [merchantId, setMerchantId] = useState("MERCH-STRIPE");
  const [amount, setAmount] = useState("250.00");
  const [currency, setCurrency] = useState("USD");
  const [stablecoin, setStablecoin] = useState<"USDC" | "USDT" | "EURC" | "SOV">("USDC");
  const [walletAddress, setWalletAddress] = useState("0x9921049210491024910249102491024910249102");

  // Selected Tx for Details / AI Analysis
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCreateAndSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // 1. Authorize Visa
    const visaTx = await authorizeVisaPayment(cardholderId, merchantId, parsedAmount, currency);
    if (!visaTx) return;

    // 2. Settle to Crypto
    const cryptoSettle = await settleToCrypto(visaTx.visaTxId, walletAddress, stablecoin);
    if (!cryptoSettle) return;

    // 3. Sync with Sovereign Ledger
    await syncLedger(visaTx.visaTxId, cryptoSettle.txHash);
  };

  const handleAiAnalysis = async (txId: string) => {
    setIsAnalyzing(true);
    setAiReport("Analyzing transaction patterns with Gemini AI...");
    const report = await runAiRiskAssessment(txId);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Visa-Crypto Bridge Service</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time Visa payment rail integration with stablecoin settlement & sovereign ledger synchronization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
            System Status: {metrics.systemHealth}
          </span>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-sm font-medium">Total Volume Settled</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">${metrics.totalVolumeFiat.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12.4% from last week
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-sm font-medium">Bridge Transactions</span>
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
          <div className="text-xs text-slate-400 mt-1">
            Avg. Settlement: <span className="text-indigo-400 font-semibold">{metrics.averageSettlementTimeMs}ms</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-sm font-medium">Stablecoin Reserves</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-blue-400">USDC: {(metrics.stablecoinReserves.USDC / 1000000).toFixed(1)}M</span>
            <span className="text-emerald-400">SOV: {(metrics.stablecoinReserves.SOV / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Liquidity Providers Active: <span className="text-amber-400 font-semibold">{metrics.activeLiquidityProviders}</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-sm font-medium">Sovereign Ledger Sync</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">100%</div>
          <div className="text-xs text-slate-400 mt-1">
            All transactions cryptographically signed
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Bridge Simulator */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold">Bridge Simulator</h2>
            </div>
            
            <form onSubmit={handleCreateAndSettle} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cardholder ID</label>
                <input
                  type="text"
                  value={cardholderId}
                  onChange={(e) => setCardholderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800/60 my-4 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Settlement Target</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Stablecoin</label>
                    <select
                      value={stablecoin}
                      onChange={(e) => setStablecoin(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="EURC">EURC</option>
                      <option value="SOV">SOV (Sovereign)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Wallet Address</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Bridge...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Authorize & Settle Bridge
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Logs */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold">Bridge Event Logs</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Live</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 max-h-[350px]">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No events logged yet.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="border-l-2 border-slate-800 pl-2 py-0.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transactions, Settlements & Sovereign Ledger */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Visa Transactions & Crypto Settlements */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Active Bridge Transactions</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Visa TxID</th>
                    <th className="px-4 py-3">Cardholder</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Crypto Settle</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {visaTransactions.map((tx) => {
                    const settlement = cryptoSettlements.find((s) => s.visaTxId === tx.visaTxId);
                    return (
                      <tr key={tx.visaTxId} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-blue-400">{tx.visaTxId}</td>
                        <td className="px-4 py-3 text-xs">{tx.cardholderId}</td>
                        <td className="px-4 py-3 font-semibold">
                          {tx.amount} {tx.currency}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            tx.status === "SETTLED" 
                              ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-950/50 text-amber-400 border border-amber-500/20"
                          }`}>
                            {tx.status === "SETTLED" ? <CheckCircle2 className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {settlement ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-indigo-400">
                                {settlement.cryptoAmount.toFixed(2)} {settlement.stablecoinSymbol}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {settlement.txHash.slice(0, 12)}...
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Pending Settle</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedTxId(tx.visaTxId);
                              handleAiAnalysis(tx.visaTxId);
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition-all inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            AI Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sovereign Ledger Sync Status */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Sovereign Ledger Sync</h2>
            </div>

            <div className="space-y-3">
              {ledgerEntries.length === 0 ? (
                <div className="text-slate-500 text-sm italic text-center py-4">
                  No ledger entries synchronized yet.
                </div>
              ) : (
                ledgerEntries.map((entry) => (
                  <div key={entry.entryId} className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                          {entry.entryId}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200">
                        Synced Visa Tx: <span className="font-mono text-blue-400">{entry.visaTxId}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate max-w-md">
                        Crypto Hash: {entry.cryptoTxHash}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end text-right">
                      <div className="text-sm font-bold text-slate-100">
                        ${entry.amount.toFixed(2)} {entry.currency}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-2">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        Signed: {entry.signature.slice(0, 12)}...
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Risk Assessment Report Modal/Panel */}
          {selectedTxId && (
            <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-slate-100">
                    Gemini AI Compliance & Risk Report: <span className="font-mono text-blue-400">{selectedTxId}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTxId(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700"
                >
                  Close
                </button>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Generating deep compliance audit trail...</span>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto">
                  {aiReport}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}