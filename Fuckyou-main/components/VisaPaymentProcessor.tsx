import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Cpu, 
  Zap, 
  Search, 
  Filter, 
  ArrowRight, 
  Info, 
  FileCheck, 
  Activity, 
  DollarSign, 
  Layers, 
  Clock, 
  ChevronRight, 
  Download, 
  Printer, 
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import { callGemini } from '../services/geminiService';
import { DataContext } from '../context/DataContext';

// --- TYPES & INTERFACES ---
export interface VisaPayment {
  id: string;
  uetr: string;
  amount: number;
  currency: string;
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientAccount: string;
  recipientCountry: string;
  visaProduct: 'Visa Direct' | 'Visa B2B Connect' | 'Visa Commercial Pay' | 'Visa Fleet';
  status: 'Initiated' | 'Authorized' | 'Cleared' | 'Settled' | 'Failed' | 'Cancelled';
  timestamp: string;
  invoiceId?: string;
  mcc?: string; // Merchant Category Code
  riskScore?: number;
  routingInsight?: string;
  fee: number;
  fxRate?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'Unpaid' | 'Partially Paid' | 'Matched' | 'Paid';
  description: string;
}

export interface GeminiInsight {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  anomaliesDetected: string[];
  recommendedRoute: string;
  routingJustification: string;
  estimatedSavings: string;
}

export default function VisaPaymentProcessor() {
  const dataContext = useContext(DataContext);

  // --- STATE ---
  const [payments, setPayments] = useState<VisaPayment[]>([
    {
      id: 'TXN-8829102',
      uetr: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
      amount: 45000.00,
      currency: 'USD',
      senderName: 'Sovereign Wealth Corp',
      senderAccount: 'US-VISA-9921-8821',
      recipientName: 'Tokyo Logistics Ltd',
      recipientAccount: 'JP-MUFG-3321-0092',
      recipientCountry: 'JP',
      visaProduct: 'Visa B2B Connect',
      status: 'Settled',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      invoiceId: 'INV-2024-001',
      mcc: '4789',
      riskScore: 12,
      routingInsight: 'Optimal route selected via Visa B2B Connect. Saved $120 in FX fees.',
      fee: 45.00,
      fxRate: 154.20
    },
    {
      id: 'TXN-1029384',
      uetr: 'a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
      amount: 1250.00,
      currency: 'EUR',
      senderName: 'Sovereign Wealth Corp',
      senderAccount: 'US-VISA-9921-8821',
      recipientName: 'Berlin Tech Hub',
      recipientAccount: 'DE-DB-8821-9901',
      recipientCountry: 'DE',
      visaProduct: 'Visa Direct',
      status: 'Authorized',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      mcc: '7372',
      riskScore: 8,
      routingInsight: 'Visa Direct real-time push payment. Instant availability confirmed.',
      fee: 12.50,
      fxRate: 0.92
    },
    {
      id: 'TXN-5549201',
      uetr: '9e107d9d-3b1a-4c2d-8e3f-5a6b7c8d9e0f',
      amount: 89000.00,
      currency: 'GBP',
      senderName: 'Sovereign Wealth Corp',
      senderAccount: 'US-VISA-9921-8821',
      recipientName: 'London Real Estate Group',
      recipientAccount: 'GB-BARC-4432-1102',
      recipientCountry: 'GB',
      visaProduct: 'Visa B2B Connect',
      status: 'Initiated',
      timestamp: new Date().toISOString(),
      mcc: '6513',
      riskScore: 45,
      routingInsight: 'High-value transaction. Recommended enhanced compliance screening.',
      fee: 89.00,
      fxRate: 0.79
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      invoiceNumber: 'INV-2024-001',
      vendorName: 'Tokyo Logistics Ltd',
      amount: 45000.00,
      currency: 'USD',
      dueDate: '2024-12-31',
      status: 'Matched',
      description: 'Q4 Transpacific Freight Services'
    },
    {
      id: 'INV-2024-002',
      invoiceNumber: 'INV-2024-002',
      vendorName: 'Berlin Tech Hub',
      amount: 1250.00,
      currency: 'EUR',
      dueDate: '2024-12-15',
      status: 'Unpaid',
      description: 'SaaS Infrastructure Licensing'
    },
    {
      id: 'INV-2024-003',
      invoiceNumber: 'INV-2024-003',
      vendorName: 'London Real Estate Group',
      amount: 89000.00,
      currency: 'GBP',
      dueDate: '2025-01-10',
      status: 'Unpaid',
      description: 'Mayfair Office Lease Deposit'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState<VisaPayment | null>(payments[0]);
  const [activeTab, setActiveTab] = useState<'processor' | 'history' | 'invoices' | 'insights'>('processor');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form State for New Payment
  const [newPayment, setNewPayment] = useState({
    amount: '',
    currency: 'USD',
    recipientName: '',
    recipientAccount: '',
    recipientCountry: 'JP',
    visaProduct: 'Visa B2B Connect' as VisaPayment['visaProduct'],
    mcc: '7372',
    invoiceId: ''
  });

  // Gemini State
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiInsight | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- GEMINI INTEGRATION ---
  const analyzeWithGemini = async (paymentDetails: typeof newPayment) => {
    setGeminiLoading(true);
    try {
      const prompt = `
        You are an expert Visa Network Routing & Risk AI. Analyze this proposed payment:
        - Amount: ${paymentDetails.amount} ${paymentDetails.currency}
        - Recipient: ${paymentDetails.recipientName} (${paymentDetails.recipientCountry})
        - Visa Product: ${paymentDetails.visaProduct}
        - Merchant Category Code (MCC): ${paymentDetails.mcc}

        Provide a structured JSON response containing:
        1. "riskScore": A number from 0 to 100 indicating fraud/anomaly risk.
        2. "riskLevel": "LOW", "MEDIUM", or "HIGH".
        3. "anomaliesDetected": Array of strings detailing any anomalies (e.g., unusual country, high amount for MCC, etc.).
        4. "recommendedRoute": The optimal Visa product (e.g., "Visa Direct" for instant low-value, "Visa B2B Connect" for high-value cross-border).
        5. "routingJustification": Explanation of why this route is optimal.
        6. "estimatedSavings": Estimated savings in FX/fees compared to traditional SWIFT (e.g., "$150 USD").

        Return ONLY valid JSON. No markdown formatting, no backticks.
      `;

      const responseText = await callGemini(prompt);
      // Clean response text in case Gemini returns markdown code blocks
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: GeminiInsight = JSON.parse(cleanJson);
      setGeminiAnalysis(parsed);
    } catch (error) {
      console.error('Gemini analysis failed, using local rule-based fallback:', error);
      // Fallback rule-based engine
      const amountNum = parseFloat(paymentDetails.amount) || 0;
      const isHighRisk = amountNum > 50000 || paymentDetails.recipientCountry === 'HighRisk';
      setGeminiAnalysis({
        riskScore: isHighRisk ? 65 : 15,
        riskLevel: isHighRisk ? 'MEDIUM' : 'LOW',
        anomaliesDetected: isHighRisk ? ['High value transaction requiring secondary approval'] : [],
        recommendedRoute: amountNum > 10000 ? 'Visa B2B Connect' : 'Visa Direct',
        routingJustification: `Rule-based fallback: Optimized for ${paymentDetails.currency} cross-border transfer to ${paymentDetails.recipientCountry}.`,
        estimatedSavings: `$${(amountNum * 0.002).toFixed(2)} USD`
      });
    } finally {
      setGeminiLoading(false);
    }
  };

  // Trigger Gemini analysis when form changes significantly
  useEffect(() => {
    if (parseFloat(newPayment.amount) > 0 && newPayment.recipientName) {
      const delayDebounce = setTimeout(() => {
        analyzeWithGemini(newPayment);
      }, 1000);
      return () => clearTimeout(delayDebounce);
    }
  }, [newPayment.amount, newPayment.currency, newPayment.recipientCountry, newPayment.visaProduct]);

  // --- ACTIONS ---
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || !newPayment.recipientName) return;

    setIsProcessing(true);
    setProcessingStep('Initiating VisaNet Handshake...');
    
    // Simulate real-time Visa processing steps
    await new Promise(r => setTimeout(r, 1000));
    setProcessingStep('Running Gemini Real-time Fraud & AML Screening...');
    await new Promise(r => setTimeout(r, 1200));
    setProcessingStep('Securing Tokenized Credentials via Visa Token Service...');
    await new Promise(r => setTimeout(r, 1000));
    setProcessingStep('Authorizing Settlement Liquidity...');
    await new Promise(r => setTimeout(r, 800));

    const generatedTxnId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const generatedUetr = crypto.randomUUID();
    const amountNum = parseFloat(newPayment.amount);

    const createdPayment: VisaPayment = {
      id: generatedTxnId,
      uetr: generatedUetr,
      amount: amountNum,
      currency: newPayment.currency,
      senderName: 'Sovereign Wealth Corp',
      senderAccount: 'US-VISA-9921-8821',
      recipientName: newPayment.recipientName,
      recipientAccount: newPayment.recipientAccount || 'N/A',
      recipientCountry: newPayment.recipientCountry,
      visaProduct: newPayment.visaProduct,
      status: 'Settled',
      timestamp: new Date().toISOString(),
      invoiceId: newPayment.invoiceId || undefined,
      mcc: newPayment.mcc,
      riskScore: geminiAnalysis?.riskScore || 10,
      routingInsight: geminiAnalysis?.routingJustification || 'Processed via standard Visa rails.',
      fee: amountNum * 0.001,
      fxRate: newPayment.currency === 'USD' ? 1 : 1.08
    };

    // Update payments and match invoice if applicable
    setPayments(prev => [createdPayment, ...prev]);
    if (newPayment.invoiceId) {
      setInvoices(prev => prev.map(inv => 
        inv.id === newPayment.invoiceId ? { ...inv, status: 'Paid' } : inv
      ));
    }

    setSelectedPayment(createdPayment);
    setIsProcessing(false);
    setProcessingStep('');
    
    // Reset form
    setNewPayment({
      amount: '',
      currency: 'USD',
      recipientName: '',
      recipientAccount: '',
      recipientCountry: 'JP',
      visaProduct: 'Visa B2B Connect',
      mcc: '7372',
      invoiceId: ''
    });
    setGeminiAnalysis(null);
    setActiveTab('history');
  };

  const handleResendPayment = async (payment: VisaPayment) => {
    setIsProcessing(true);
    setProcessingStep(`Re-routing payment ${payment.id} via alternative Visa rail...`);
    await new Promise(r => setTimeout(r, 1500));
    
    setPayments(prev => prev.map(p => 
      p.id === payment.id 
        ? { ...p, status: 'Settled', timestamp: new Date().toISOString(), uetr: crypto.randomUUID() } 
        : p
    ));
    
    setIsProcessing(false);
    setProcessingStep('');
  };

  const handleCancelPayment = async (payment: VisaPayment) => {
    setIsProcessing(true);
    setProcessingStep(`Requesting VisaNet Revocation for ${payment.id}...`);
    await new Promise(r => setTimeout(r, 1200));

    setPayments(prev => prev.map(p => 
      p.id === payment.id ? { ...p, status: 'Cancelled' } : p
    ));

    setIsProcessing(false);
    setProcessingStep('');
  };

  const handleSmartMatch = async () => {
    setGeminiLoading(true);
    // Simulate Gemini matching invoices to payments
    await new Promise(r => setTimeout(r, 1500));
    
    // Match unmatched invoices to payments of similar amounts
    let matchedCount = 0;
    const updatedInvoices = invoices.map(inv => {
      if (inv.status === 'Unpaid') {
        const matchingPayment = payments.find(p => p.amount === inv.amount && p.currency === inv.currency);
        if (matchingPayment) {
          matchedCount++;
          return { ...inv, status: 'Matched' as const };
        }
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    setGeminiLoading(false);
    alert(`Gemini Smart Match completed! Successfully matched ${matchedCount} invoices to active Visa payments.`);
  };

  // --- FILTERED DATA ---
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uetr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProduct = filterProduct === 'All' || p.visaProduct === filterProduct;
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [payments, searchQuery, filterProduct, filterStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              Visa Commercial Payment Gateway
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise-grade VisaNet integration with real-time Gemini routing optimization & anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('processor')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'processor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Payment Processor
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transaction Ledger
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'invoices' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Invoice Matching
          </button>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Processing Visa Transaction</h3>
            <p className="text-slate-400 text-sm mb-6">{processingStep}</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full animate-infinite-loading rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Forms / Lists */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TAB 1: PROCESSOR FORM */}
          {activeTab === 'processor' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-400" />
                  Initiate Visa Commercial Payment
                </h2>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-mono">
                  VisaNet v2.4
                </span>
              </div>

              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Recipient Name / Entity
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tokyo Logistics Ltd"
                      value={newPayment.recipientName}
                      onChange={e => setNewPayment(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Recipient Account / IBAN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JP-MUFG-3321-0092"
                      value={newPayment.recipientAccount}
                      onChange={e => setNewPayment(prev => ({ ...prev, recipientAccount: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={newPayment.amount}
                        onChange={e => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Currency
                    </label>
                    <select
                      value={newPayment.currency}
                      onChange={e => setNewPayment(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Destination Country
                    </label>
                    <select
                      value={newPayment.recipientCountry}
                      onChange={e => setNewPayment(prev => ({ ...prev, recipientCountry: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="JP">Japan (JP)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="SG">Singapore (SG)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Visa Product Rail
                    </label>
                    <select
                      value={newPayment.visaProduct}
                      onChange={e => setNewPayment(prev => ({ ...prev, visaProduct: e.target.value as VisaPayment['visaProduct'] }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="Visa B2B Connect">Visa B2B Connect (High-Value)</option>
                      <option value="Visa Direct">Visa Direct (Real-time Push)</option>
                      <option value="Visa Commercial Pay">Visa Commercial Pay (Virtual Card)</option>
                      <option value="Visa Fleet">Visa Fleet (Specialized)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Merchant Category (MCC)
                    </label>
                    <select
                      value={newPayment.mcc}
                      onChange={e => setNewPayment(prev => ({ ...prev, mcc: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="7372">7372 - Computer Programming/SaaS</option>
                      <option value="4789">4789 - Transportation & Logistics</option>
                      <option value="6513">6513 - Real Estate Agents & Managers</option>
                      <option value="5047">5047 - Medical & Commercial Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Match Invoice (Optional)
                    </label>
                    <select
                      value={newPayment.invoiceId}
                      onChange={e => {
                        const invId = e.target.value;
                        const selectedInv = invoices.find(i => i.id === invId);
                        if (selectedInv) {
                          setNewPayment(prev => ({
                            ...prev,
                            invoiceId: invId,
                            amount: selectedInv.amount.toString(),
                            currency: selectedInv.currency,
                            recipientName: selectedInv.vendorName
                          }));
                        } else {
                          setNewPayment(prev => ({ ...prev, invoiceId: '' }));
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="">No Invoice Match</option>
                      {invoices.filter(i => i.status === 'Unpaid').map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {inv.vendorName} ({inv.amount} {inv.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 mt-6"
                >
                  <Send className="w-5 h-5" />
                  Authorize & Settle via VisaNet
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Visa Transaction Ledger
                </h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search TXN, Recipient, UETR..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full md:w-48 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={filterProduct}
                    onChange={e => setFilterProduct(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Products</option>
                    <option value="Visa B2B Connect">Visa B2B Connect</option>
                    <option value="Visa Direct">Visa Direct</option>
                    <option value="Visa Commercial Pay">Visa Commercial Pay</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Settled">Settled</option>
                    <option value="Authorized">Authorized</option>
                    <option value="Initiated">Initiated</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Ledger List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                    <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No transactions match your filters.</p>
                  </div>
                ) : (
                  filteredPayments.map(payment => (
                    <div
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className={`p-4 rounded-lg border transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        selectedPayment?.id === payment.id
                          ? 'bg-slate-800/50 border-blue-500/50 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400' :
                          payment.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{payment.recipientName}</span>
                            <span className="text-xs text-slate-500 font-mono">({payment.recipientCountry})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span className="font-mono">{payment.id}</span>
                            <span>•</span>
                            <span>{payment.visaProduct}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between md:items-end w-full md:w-auto gap-2 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                        <span className="font-bold text-sm text-white">
                          {payment.amount.toLocaleString('en-US', { style: 'currency', currency: payment.currency })}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          payment.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          payment.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INVOICE MATCHING */}
          {activeTab === 'invoices' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Pending Invoices
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Match incoming vendor invoices with settled Visa commercial payments.
                  </p>
                </div>
                <button
                  onClick={handleSmartMatch}
                  disabled={geminiLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" />
                  {geminiLoading ? 'Matching...' : 'Gemini Smart Match'}
                </button>
              </div>

              <div className="space-y-3">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{invoice.vendorName}</span>
                        <span className="text-xs text-slate-500 font-mono">({invoice.invoiceNumber})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{invoice.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                        <span>Due: {invoice.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between md:items-end w-full md:w-auto gap-2 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                      <span className="font-bold text-sm text-white">
                        {invoice.amount.toLocaleString('en-US', { style: 'currency', currency: invoice.currency })}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        invoice.status === 'Paid' || invoice.status === 'Matched'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Gemini Insights & Payment Advice */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* GEMINI REAL-TIME ROUTING INSIGHTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Gemini Routing & Risk Engine
              </h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                Active Analysis
              </span>
            </div>

            {geminiLoading ? (
              <div className="py-8 text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Gemini is analyzing transaction risk & routing...</p>
              </div>
            ) : geminiAnalysis ? (
              <div className="space-y-4">
                {/* Risk Score Meter */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-medium">Fraud & AML Risk Score</span>
                    <span className={`text-xs font-bold ${
                      geminiAnalysis.riskLevel === 'LOW' ? 'text-emerald-400' :
                      geminiAnalysis.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {geminiAnalysis.riskScore}/100 ({geminiAnalysis.riskLevel})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        geminiAnalysis.riskLevel === 'LOW' ? 'bg-emerald-500' :
                        geminiAnalysis.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${geminiAnalysis.riskScore}%` }}
                    ></div>
                  </div>
                  {geminiAnalysis.anomaliesDetected.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-amber-400 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Anomalies:</span>
                        <ul className="list-disc list-inside mt-1 text-[11px] text-slate-300">
                          {geminiAnalysis.anomaliesDetected.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Routing Recommendation */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-400 font-medium">Optimal Visa Rail Recommendation</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{geminiAnalysis.recommendedRoute}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{geminiAnalysis.routingJustification}</p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Est. Savings vs SWIFT:</span>
                    <span className="text-emerald-400 font-bold">{geminiAnalysis.estimatedSavings}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-6 text-center">
                <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  Fill out the payment form to trigger real-time Gemini routing optimization and risk analysis.
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT ADVICE / REMITTANCE DETAIL */}
          {selectedPayment && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Visa Payment Advice</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">UETR: {selectedPayment.uetr}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                    title="Print Remittance"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Remittance Details */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Sender</span>
                    <span className="text-slate-200 font-medium">{selectedPayment.senderName}</span>
                    <span className="text-slate-400 block font-mono text-[10px] mt-0.5">{selectedPayment.senderAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Recipient</span>
                    <span className="text-slate-200 font-medium">{selectedPayment.recipientName}</span>
                    <span className="text-slate-400 block font-mono text-[10px] mt-0.5">{selectedPayment.recipientAccount}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Visa Product Rail</span>
                    <span className="text-slate-200 font-medium">{selectedPayment.visaProduct}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Status</span>
                    <span className={`inline-block font-semibold mt-0.5 ${
                      selectedPayment.status === 'Settled' ? 'text-emerald-400' : 'text-blue-400'
                    }`}>{selectedPayment.status}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Amount</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {selectedPayment.amount.toLocaleString('en-US', { style: 'currency', currency: selectedPayment.currency })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">Visa Network Fee</span>
                    <span className="text-slate-200 font-medium">
                      {selectedPayment.fee.toLocaleString('en-US', { style: 'currency', currency: selectedPayment.currency })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold">FX Rate</span>
                    <span className="text-slate-200 font-medium">
                      {selectedPayment.fxRate ? selectedPayment.fxRate.toFixed(4) : '1.0000'}
                    </span>
                  </div>
                </div>

                {/* Real-time Status Timeline */}
                <div className="border-t border-slate-800 pt-4">
                  <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-semibold mb-3">VisaNet Settlement Timeline</span>
                  <div className="relative pl-4 border-l border-slate-800 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-0.5 bg-emerald-500 w-2.5 h-2.5 rounded-full border-2 border-slate-900"></div>
                      <div className="font-semibold text-slate-200">Initiated & Authorized</div>
                      <div className="text-[10px] text-slate-500">{new Date(selectedPayment.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        selectedPayment.status === 'Settled' || selectedPayment.status === 'Cleared' ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}></div>
                      <div className="font-semibold text-slate-200">Cleared via VisaNet</div>
                      <div className="text-[10px] text-slate-500">Real-time liquidity verification complete</div>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        selectedPayment.status === 'Settled' ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}></div>
                      <div className="font-semibold text-slate-200">Settled</div>
                      <div className="text-[10px] text-slate-500">Funds deposited into recipient account</div>
                    </div>
                  </div>
                </div>

                {/* Actions for Selected Payment */}
                <div className="border-t border-slate-800 pt-4 flex gap-2">
                  {selectedPayment.status !== 'Cancelled' && selectedPayment.status !== 'Settled' && (
                    <button
                      onClick={() => handleCancelPayment(selectedPayment)}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold py-2 rounded transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Payment
                    </button>
                  )}
                  {selectedPayment.status === 'Failed' && (
                    <button
                      onClick={() => handleResendPayment(selectedPayment)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resend / Re-route
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}