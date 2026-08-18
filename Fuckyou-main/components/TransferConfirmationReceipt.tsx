import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  ArrowRightLeft, 
  Globe, 
  Building2, 
  User, 
  Calendar, 
  ShieldCheck,
  TrendingUp,
  Wallet
} from 'lucide-react';

export interface TransferDetails {
  referenceId: string;
  timestamp: string;
  sourceAccount: {
    name: string;
    maskedNumber: string;
    type: string;
    remainingBalance: string;
    currency: string;
  };
  recipient: {
    name: string;
    bankName: string;
    swiftBic: string;
    maskedAccountNumber: string;
    country: string;
    countryCode: string; // e.g., "DE"
  };
  financials: {
    sendAmount: number;
    sendCurrency: string;
    exchangeRate: number;
    recipientAmount: number;
    recipientCurrency: string;
    transferFee: number;
    tax: number;
    totalCharged: number;
  };
  guaranteedDelivery: string;
}

interface TransferConfirmationReceiptProps {
  data?: TransferDetails;
  onClose?: () => void;
  onShare?: (data: TransferDetails) => void;
}

const defaultReceiptData: TransferDetails = {
  referenceId: "TXN-9082314-XPLR",
  timestamp: "2023-10-27 14:32:05 UTC",
  sourceAccount: {
    name: "Premium Checking",
    maskedNumber: "•••• 8842",
    type: "USD Account",
    remainingBalance: "14,250.80",
    currency: "USD"
  },
  recipient: {
    name: "Amélie Laurent",
    bankName: "Société Générale",
    swiftBic: "SOGEFRPPXXX",
    maskedAccountNumber: "•••• •••• 9012",
    country: "France",
    countryCode: "FR"
  },
  financials: {
    sendAmount: 5000.00,
    sendCurrency: "USD",
    exchangeRate: 0.94215,
    recipientAmount: 4710.75,
    recipientCurrency: "EUR",
    transferFee: 4.99,
    tax: 0.00,
    totalCharged: 5004.99
  },
  guaranteedDelivery: "Instant (Within 2 minutes)"
};

export default function TransferConfirmationReceipt({ 
  data = defaultReceiptData, 
  onClose,
  onShare 
}: TransferConfirmationReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(data.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMock = () => {
    setDownloading(true);
    // Simulate a PDF generation delay
    setTimeout(() => {
      setDownloading(false);
      alert("Your secure PDF receipt has been generated and downloaded successfully.");
    }, 1500);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start print:bg-white print:p-0 print:min-h-0">
      <div className="max-w-2xl w-full space-y-6 print:space-y-0">
        
        {/* Action Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Transaction Completed</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadMock}
              disabled={downloading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-100 dark:shadow-none"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'Generating...' : 'PDF Receipt'}
            </button>
            {onShare && (
              <button
                onClick={() => onShare(data)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-200"
                title="Share Receipt"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Receipt Card */}
        <div 
          ref={receiptRef}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative print:shadow-none print:border-none print:rounded-none"
        >
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 print:hidden" />

          {/* Receipt Header */}
          <div className="p-8 sm:p-10 text-center border-b border-slate-100 dark:border-slate-800 relative">
            <div className="mx-auto mb-4 w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Transfer Confirmed
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Thank you for choosing our global network. Your funds are on the way.
            </p>

            {/* Big Amount Display */}
            <div className="mt-6 inline-flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Recipient Receives</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(data.financials.recipientAmount, data.financials.recipientCurrency)}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Guaranteed Rate Applied
              </div>
            </div>
          </div>

          {/* Transaction Meta (Ref ID & Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Transaction Reference</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {data.referenceId}
                </span>
                <button 
                  onClick={handleCopyReference}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors print:hidden"
                  title="Copy Reference ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Authorized Date</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {data.timestamp}
              </span>
            </div>
          </div>

          {/* Transfer Route (Source -> Destination) */}
          <div className="p-8 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transfer Route</h3>
            
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Source Account */}
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">Source Account</span>
                  <span className="block font-semibold text-slate-900 dark:text-white mt-0.5">{data.sourceAccount.name}</span>
                  <span className="block text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{data.sourceAccount.maskedNumber} ({data.sourceAccount.type})</span>
                </div>
              </div>

              {/* Connector Arrow */}
              <div className="hidden md:flex flex-col items-center justify-center px-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div className="h-4 w-0.5 bg-dashed border-l border-slate-200 dark:border-slate-700 mt-1" />
              </div>

              {/* Recipient Account */}
              <div className="flex items-start gap-4 flex-1 md:text-right md:flex-row-reverse">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">Recipient</span>
                  <span className="block font-semibold text-slate-900 dark:text-white mt-0.5">{data.recipient.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {data.recipient.bankName} • {data.recipient.maskedAccountNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    <Globe className="w-3 h-3" />
                    {data.recipient.country}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-800/10 border-t border-b border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Financial Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Send Amount</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(data.financials.sendAmount, data.financials.sendCurrency)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  Exchange Rate
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Live Rate
                  </span>
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  1 {data.financials.sendCurrency} = {data.financials.exchangeRate} {data.financials.recipientCurrency}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Transfer Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {data.financials.transferFee === 0 ? 'Free' : formatCurrency(data.financials.transferFee, data.financials.sendCurrency)}
                </span>
              </div>

              {data.financials.tax > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Tax (VAT)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(data.financials.tax, data.financials.sendCurrency)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Charged</span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(data.financials.totalCharged, data.financials.sendCurrency)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Details (Remaining Balance, Delivery Speed) */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Remaining Balance</span>
              <span className="block text-base font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(parseFloat(data.sourceAccount.remainingBalance.replace(/,/g, '')), data.sourceAccount.currency)}
              </span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">Updated immediately after authorization</span>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">Delivery Speed</span>
              <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400">
                {data.guaranteedDelivery}
              </span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">Guaranteed by global banking network</span>
            </div>
          </div>

          {/* Security Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Regulated by the Financial Conduct Authority (FCA)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        {/* Back Button / Footer Actions (Hidden on Print) */}
        {onClose && (
          <div className="text-center print:hidden">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}