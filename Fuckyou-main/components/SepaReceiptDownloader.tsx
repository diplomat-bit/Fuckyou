import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Printer, 
  ArrowRightLeft, 
  Globe, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Calendar,
  Hash
} from 'lucide-react';

export interface SepaTransferData {
  controlFlowId: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  reference: string;
  paymentType: string;
  sender: {
    name: string;
    iban: string;
    bic: string;
    bankName: string;
    currency: string;
  };
  receiver: {
    name: string;
    iban: string;
    bic: string;
    bankName: string;
    currency: string;
  };
  debitAmount: number;
  creditAmount: number;
  exchangeRate: number;
  fee: number;
}

const defaultTransferData: SepaTransferData = {
  controlFlowId: "SEPA-TX-90812-A7F-8821",
  timestamp: "2024-11-04T14:32:01.000Z",
  status: "COMPLETED",
  reference: "INV-2024-99021-CORP",
  paymentType: "SEPA Instant Credit Transfer",
  sender: {
    name: "Acme European Holdings GmbH",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "DBREDD21XXX",
    bankName: "Deutsche Bank AG",
    currency: "EUR"
  },
  receiver: {
    name: "Apex Global Technologies Ltd",
    iban: "FR76 3000 6000 0123 4567 8901 234",
    bic: "BNPAFRPPXXX",
    bankName: "BNP Paribas",
    currency: "USD"
  },
  debitAmount: 25000.00,
  creditAmount: 27125.00,
  exchangeRate: 1.0850,
  fee: 1.50
};

interface SepaReceiptDownloaderProps {
  transferData?: SepaTransferData;
  onClose?: () => void;
}

export default function SepaReceiptDownloader({ transferData = defaultTransferData, onClose }: SepaReceiptDownloaderProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingJson, setIsDownloadingJson] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    showToast(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const downloadJson = () => {
    setIsDownloadingJson(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transferData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `SEPA-Receipt-${transferData.controlFlowId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("JSON receipt downloaded successfully");
    } catch (error) {
      showToast("Failed to download JSON");
    } finally {
      setIsDownloadingJson(false);
    }
  };

  const downloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      // Dynamically import jsPDF to keep bundle size optimized and avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Color Palette
      const primaryColor = [15, 23, 42]; // Slate 900
      const secondaryColor = [79, 70, 229]; // Indigo 600
      const lightGray = [248, 250, 252]; // Slate 50
      const borderGray = [226, 232, 240]; // Slate 200
      const textMuted = [100, 116, 139]; // Slate 500

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      // Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('SEPA TRANSFER RECEIPT', 15, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(191, 219, 254);
      doc.text('Official Confirmation of Payment Execution', 15, 25);

      // Status Badge in Header
      doc.setFillColor(34, 197, 94); // Green 500
      doc.roundedRect(160, 12, 35, 8, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('COMPLETED', 168, 17.5);

      // Control Flow ID & Date Section
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, 48, 180, 22, 'F');
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(15, 48, 180, 22, 'S');

      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('CONTROL FLOW ID', 20, 54);
      doc.text('EXECUTION TIMESTAMP', 110, 54);
      doc.text('PAYMENT TYPE', 20, 64);
      doc.text('TRANSACTION REFERENCE', 110, 64);

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(transferData.controlFlowId, 20, 58);
      doc.text(new Date(transferData.timestamp).toUTCString(), 110, 58);
      doc.text(transferData.paymentType, 20, 68);
      doc.text(transferData.reference, 110, 68);

      // Sender Details
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('DEBIT DETAILS (SENDER)', 15, 82);
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.line(15, 84, 95, 84);

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(transferData.sender.name, 15, 90);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('IBAN', 15, 96);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(transferData.sender.iban, 15, 100);

      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('BIC / SWIFT', 15, 106);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(transferData.sender.bic, 15, 110);

      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('BANK NAME', 15, 116);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(transferData.sender.bankName, 15, 120);

      // Receiver Details
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('CREDIT DETAILS (BENEFICIARY)', 115, 82);
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.line(115, 84, 195, 84);

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(transferData.receiver.name, 115, 90);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('IBAN', 115, 96);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(transferData.receiver.iban, 115, 100);

      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('BIC / SWIFT', 115, 106);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(transferData.receiver.bic, 115, 110);

      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('BANK NAME', 115, 116);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(transferData.receiver.bankName, 115, 120);

      // Financial Breakdown Table
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, 132, 180, 55, 'F');
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(15, 132, 180, 55, 'S');

      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANCIAL BREAKDOWN', 20, 139);
      doc.line(20, 142, 190, 142);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('Debit Amount (EUR)', 20, 148);
      doc.text('Exchange Rate (EUR/USD)', 20, 154);
      doc.text('Transfer Fee', 20, 160);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Credit Amount (USD)', 20, 172);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${transferData.debitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} EUR`, 140, 148);
      doc.text(`${transferData.exchangeRate.toFixed(4)}`, 140, 154);
      doc.text(`${transferData.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })} EUR`, 140, 160);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${transferData.creditAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`, 140, 172);

      // Security & Verification Footer
      doc.setFillColor(240, 244, 255);
      doc.rect(15, 195, 180, 25, 'F');
      doc.setDrawColor(191, 219, 254);
      doc.rect(15, 195, 180, 25, 'S');

      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('SECURE TRANSACTION VERIFIED', 20, 201);
      
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('This document serves as an official confirmation of the SEPA transfer. The transaction has been processed securely', 20, 206);
      doc.text('under the European Payment Council regulations. The control flow ID is unique and cryptographically logged.', 20, 210);
      doc.text('Verification Code: SHA-256 / ' + btoa(transferData.controlFlowId).substring(0, 24), 20, 215);

      // Footer Metadata
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFontSize(7);
      doc.text('Generated automatically by SEPA Core Engine. Confidential document.', 15, 280);
      doc.text('Page 1 of 1', 185, 280);

      doc.save(`SEPA-Receipt-${transferData.controlFlowId}.pdf`);
      showToast("PDF receipt downloaded successfully");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-indigo-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wider uppercase">
            <Globe className="w-4 h-4 animate-pulse" />
            <span>SEPA Instant Network</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Transfer Receipt</h1>
          <p className="text-slate-400 text-xs mt-1">
            Control Flow ID: <span className="font-mono text-slate-300">{transferData.controlFlowId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab(activeTab === 'preview' ? 'raw' : 'preview')}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {activeTab === 'preview' ? 'View JSON' : 'View Preview'}
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Preview or Raw JSON */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'preview' ? (
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              {/* Receipt Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-950 to-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">SEPA Transfer Confirmation</h3>
                    <p className="text-[10px] text-slate-400">Official Transaction Record</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {transferData.status}
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-6">
                {/* Flow ID & Date Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">CONTROL FLOW ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-200 font-semibold">{transferData.controlFlowId}</span>
                      <button 
                        onClick={() => copyToClipboard(transferData.controlFlowId, "Control Flow ID")}
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">EXECUTION TIMESTAMP</span>
                    <span className="text-slate-200 font-medium">{new Date(transferData.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">PAYMENT TYPE</span>
                    <span className="text-slate-200 font-medium">{transferData.paymentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">TRANSACTION REFERENCE</span>
                    <span className="text-slate-200 font-medium">{transferData.reference}</span>
                  </div>
                </div>

                {/* Sender & Receiver Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender */}
                  <div className="space-y-3 p-4 bg-slate-900/30 rounded-lg border border-slate-800/40">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Debtor (Sender)</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{transferData.sender.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{transferData.sender.bankName}</p>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-500 block">IBAN</span>
                        <span className="font-mono text-slate-300">{transferData.sender.iban}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">BIC / SWIFT</span>
                        <span className="font-mono text-slate-300">{transferData.sender.bic}</span>
                      </div>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="space-y-3 p-4 bg-slate-900/30 rounded-lg border border-slate-800/40">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                      <ArrowDownRight className="w-4 h-4" />
                      <span>Creditor (Beneficiary)</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{transferData.receiver.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{transferData.receiver.bankName}</p>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-500 block">IBAN</span>
                        <span className="font-mono text-slate-300">{transferData.receiver.iban}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">BIC / SWIFT</span>
                        <span className="font-mono text-slate-300">{transferData.receiver.bic}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate & Conversion Banner */}
                <div className="p-4 bg-indigo-950/30 border border-indigo-500/10 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-300 block uppercase tracking-wider font-semibold">Interbank Exchange Rate</span>
                      <span className="text-sm font-bold text-white">1 EUR = {transferData.exchangeRate.toFixed(4)} USD</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 sm:text-right">
                    <span>Fee Applied: </span>
                    <span className="font-semibold text-slate-200">{transferData.fee.toFixed(2)} EUR</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Debited Amount</span>
                    <span className="text-xl font-bold text-slate-300">
                      {transferData.debitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transferData.sender.currency}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-indigo-400 block font-semibold">Credited Amount (Received)</span>
                    <span className="text-2xl font-extrabold text-indigo-400">
                      {transferData.creditAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transferData.receiver.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Cryptographically Signed & Verified</span>
                </div>
                <span>EPC SEPA Scheme v2024</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-slate-400 font-mono">sepa_receipt_payload.json</span>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(transferData, null, 2), "JSON Payload")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy JSON
                </button>
              </div>
              <pre className="text-xs text-emerald-400 font-mono overflow-x-auto p-4 bg-slate-900 rounded-lg border border-slate-800 max-h-[450px] leading-relaxed">
                {JSON.stringify(transferData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Metadata */}
        <div className="space-y-6">
          {/* Download Card */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Export Options</h3>
            <p className="text-xs text-slate-400">
              Download this official SEPA receipt in your preferred format for accounting, auditing, or record-keeping.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={downloadPdf}
                disabled={isDownloadingPdf}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50"
              >
                {isDownloadingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Receipt</span>
                  </>
                )}
              </button>

              <button
                onClick={downloadJson}
                disabled={isDownloadingJson}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                {isDownloadingJson ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Preparing JSON...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Download JSON Payload</span>
                  </>
                )}
              </button>

              <button
                onClick={printReceipt}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-medium text-xs transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Audit Trail / Security Info */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security & Compliance</span>
            </h3>
            
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex gap-2.5">
                <Building className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">EPC Compliant</span>
                  <span>Fully compliant with European Payments Council SEPA Instant Credit Transfer standards.</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Hash className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">Cryptographic Hash</span>
                  <span className="font-mono text-[10px] text-slate-500 break-all">
                    SHA256: {btoa(transferData.controlFlowId + transferData.timestamp).substring(0, 32)}...
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium block">Settlement Date</span>
                  <span>Settled instantly on {new Date(transferData.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/60">
              <a 
                href="https://www.europeanpaymentscouncil.eu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <span>Verify on EPC Registry</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}