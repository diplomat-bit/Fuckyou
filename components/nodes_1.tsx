import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { GoogleGenAI } from "@google/genai";
import { createPortal } from 'react-dom';

// =================================================================================================
// QUANTUM FINANCIAL - NODE SYSTEM V4.0
// =================================================================================================
// This file defines the visual and functional representation of nodes within the Resource Graph.
// It has been upgraded to support "Golden Ticket" features:
// - AI Integration via Google GenAI (Gemini)
// - Interactive "Pop-up" Forms for configuration
// - Audit Logging simulation
// - High-fidelity "Glassmorphism" UI
// - Expandable/Collapsible states for detailed inspection

// --- CONFIGURATION & CONSTANTS ---
const COMPANY_NAME = "Quantum Financial";
const DEMO_MODE = true;

// --- ICONS (SVG) ---
const Icons = {
  AI: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Chat: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Audit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Settings: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Close: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Send: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Lock: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

// --- AI INTEGRATION ---
const generateAIResponse = async (prompt: string, context: string) => {
  const apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
  if (!apiKey) return "Error: GEMINI_API_KEY not found in secrets manager (localStorage/env).";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using a standard model name
    
    const systemPrompt = `
      You are the AI Core for ${COMPANY_NAME}, a global financial institution demo.
      Tone: Elite, Professional, High-Performance, Secure.
      Context: ${context}
      User Query: ${prompt}
      Provide a concise, business-focused response.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Secure Connection Interrupted. Please verify credentials.";
  }
};

// --- COMPONENTS ---

const AuditLog = ({ logs }: { logs: string[] }) => (
  <div className="space-y-1 max-h-32 overflow-y-auto text-[10px] font-mono text-gray-400 bg-gray-900/50 p-2 rounded border border-gray-700">
    {logs.map((log, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className="text-teal-500">[{new Date().toLocaleTimeString()}]</span>
        <span>{log}</span>
      </div>
    ))}
  </div>
);

const AIChat = ({ context }: { context: string }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: `Quantum Core initialized. Analyzing ${context}...` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await generateAIResponse(userMsg, context);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-48">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-gray-900/30 rounded mb-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded-lg text-xs ${m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-teal-400 animate-pulse">Processing secure request...</div>}
      </div>
      <div className="flex gap-1">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Quantum AI..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-teal-500 outline-none"
        />
        <button onClick={handleSend} className="p-1 bg-teal-600 hover:bg-teal-500 rounded text-white">
          <Icons.Send />
        </button>
      </div>
    </div>
  );
};

const PopUpForm = ({ title, onClose, onSubmit }: { title: string, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({});
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-teal-500/30 rounded-xl shadow-2xl w-96 p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><Icons.Close /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Configuration ID</label>
            <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white focus:border-teal-500 outline-none" placeholder="AUTO-GEN-8821" disabled />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Parameters</label>
            <textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white focus:border-teal-500 outline-none h-24" placeholder="Enter JSON configuration or natural language instructions..." />
          </div>
          <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-900/20 p-2 rounded">
            <Icons.Lock />
            <span>Audit logging enabled for this action.</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-gray-800">Cancel</button>
          <button onClick={() => onSubmit({})} className="px-4 py-2 rounded text-sm bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-500/20">Execute</button>
        </div>
      </div>
    </div>
  );
};

const SmartNode = ({ data, label, type }: { data: any, label: string, type: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'audit'>('details');
  const [showForm, setShowForm] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    `Node initialized: ${type}`,
    `Security check passed: ${Math.random().toString(36).substring(7)}`,
    `Data stream connected.`
  ]);

  const handleAction = () => {
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setAuditLogs(prev => [`Action executed via Secure Form`, ...prev]);
    setShowForm(false);
  };

  return (
    <>
      <div 
        className={`
          relative group transition-all duration-300 ease-in-out
          ${expanded ? 'w-80 z-50' : 'w-48 z-10'}
          bg-gray-900/90 backdrop-blur-md border border-gray-700 hover:border-teal-500/50
          rounded-xl shadow-xl hover:shadow-teal-500/10
        `}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-2 h-2 rounded-full ${data.status === 'error' ? 'bg-red-500' : 'bg-teal-500'} animate-pulse`} />
            <div className="font-bold text-gray-100 text-xs truncate">{label}</div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            >
              {expanded ? <Icons.Close /> : <Icons.Settings />}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <div className="text-xs text-gray-400 mb-2 font-mono truncate">{data.label || data.id || "ID: " + Math.random().toString(36).substr(2, 6)}</div>
          
          {expanded ? (
            <div className="animate-fadeIn">
              {/* Tabs */}
              <div className="flex gap-1 mb-3 bg-gray-800 p-1 rounded-lg">
                {['details', 'ai', 'audit'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`
                      flex-1 py-1 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all
                      ${activeTab === tab ? 'bg-teal-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[120px]">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-[10px] text-gray-500">Latency</div>
                        <div className="text-xs text-teal-400 font-mono">12ms</div>
                      </div>
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="text-[10px] text-gray-500">Uptime</div>
                        <div className="text-xs text-teal-400 font-mono">99.99%</div>
                      </div>
                    </div>
                    <button 
                      onClick={handleAction}
                      className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-teal-500 text-xs text-white rounded transition-all flex items-center justify-center gap-2"
                    >
                      <Icons.Settings /> Configure Node
                    </button>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <AIChat context={`Node Type: ${type}, Label: ${label}, Data: ${JSON.stringify(data)}`} />
                )}

                {activeTab === 'audit' && (
                  <AuditLog logs={auditLogs} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-2">
               <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-500 border border-gray-700">v2.4.0</span>
               <div className="flex -space-x-1">
                 {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-700 border border-gray-900" />)}
               </div>
            </div>
          )}
        </div>

        {/* Handles */}
        <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-gray-900 transition-all hover:!w-4 hover:!h-4" />
        <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-gray-900 transition-all hover:!w-4 hover:!h-4" />
      </div>

      {/* Portal for Pop Up Form */}
      {showForm && createPortal(
        <PopUpForm 
          title={`Configure ${label}`} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleFormSubmit} 
        />,
        document.body
      )}
    </>
  );
};

// Generic Node Wrapper for compatibility
const GenericNode = (props: any) => <SmartNode {...props} type="Generic" />;

// --- EXPORTS (The Monolith) ---
// We export every single node type requested, mapped to the SmartNode for consistent "Golden Ticket" experience.

export const AccountNode = memo((props: any) => <SmartNode {...props} type="Account" />);
export const AccountLinkNode = memo((props: any) => <SmartNode {...props} type="AccountLink" />);
export const ApplePayDomainNode = memo((props: any) => <SmartNode {...props} type="ApplePayDomain" />);
export const ApplicationFeeNode = memo((props: any) => <SmartNode {...props} type="ApplicationFee" />);
export const AppsSecretNode = memo((props: any) => <SmartNode {...props} type="AppsSecret" />);
export const BalanceNode = memo((props: any) => <SmartNode {...props} type="Balance" />);
export const BalanceTransactionNode = memo((props: any) => <SmartNode {...props} type="BalanceTransaction" />);
export const BankAccountNode = memo((props: any) => <SmartNode {...props} type="BankAccount" />);
export const BillingPortalConfigurationNode = memo((props: any) => <SmartNode {...props} type="BillingPortalConfiguration" />);
export const BillingPortalSessionNode = memo((props: any) => <SmartNode {...props} type="BillingPortalSession" />);
export const CapabilityNode = memo((props: any) => <SmartNode {...props} type="Capability" />);
export const CardNode = memo((props: any) => <SmartNode {...props} type="Card" />);
export const CashBalanceNode = memo((props: any) => <SmartNode {...props} type="CashBalance" />);
export const ChargeNode = memo((props: any) => <SmartNode {...props} type="Charge" />);
export const CheckoutSessionNode = memo((props: any) => <SmartNode {...props} type="CheckoutSession" />);
export const CountrySpecNode = memo((props: any) => <SmartNode {...props} type="CountrySpec" />);
export const CouponNode = memo((props: any) => <SmartNode {...props} type="Coupon" />);
export const CreditNoteNode = memo((props: any) => <SmartNode {...props} type="CreditNote" />);
export const CreditNoteLineItemNode = memo((props: any) => <SmartNode {...props} type="CreditNoteLineItem" />);
export const CustomerNode = memo((props: any) => <SmartNode {...props} type="Customer" />);
export const CustomerBalanceTransactionNode = memo((props: any) => <SmartNode {...props} type="CustomerBalanceTransaction" />);
export const CustomerCashBalanceTransactionNode = memo((props: any) => <SmartNode {...props} type="CustomerCashBalanceTransaction" />);
export const DeletedAccountNode = memo((props: any) => <SmartNode {...props} type="DeletedAccount" />);
export const DeletedApplePayDomainNode = memo((props: any) => <SmartNode {...props} type="DeletedApplePayDomain" />);
export const DeletedCouponNode = memo((props: any) => <SmartNode {...props} type="DeletedCoupon" />);
export const DeletedCustomerNode = memo((props: any) => <SmartNode {...props} type="DeletedCustomer" />);
export const DeletedDiscountNode = memo((props: any) => <SmartNode {...props} type="DeletedDiscount" />);
export const DeletedExternalAccountNode = memo((props: any) => <SmartNode {...props} type="DeletedExternalAccount" />);
export const DeletedInvoiceNode = memo((props: any) => <SmartNode {...props} type="DeletedInvoice" />);
export const DeletedInvoiceitemNode = memo((props: any) => <SmartNode {...props} type="DeletedInvoiceitem" />);
export const DeletedPaymentSourceNode = memo((props: any) => <SmartNode {...props} type="DeletedPaymentSource" />);
export const DeletedPersonNode = memo((props: any) => <SmartNode {...props} type="DeletedPerson" />);
export const DeletedPlanNode = memo((props: any) => <SmartNode {...props} type="DeletedPlan" />);
export const DeletedProductNode = memo((props: any) => <SmartNode {...props} type="DeletedProduct" />);
export const DeletedRadarValueListNode = memo((props: any) => <SmartNode {...props} type="DeletedRadarValueList" />);
export const DeletedRadarValueListItemNode = memo((props: any) => <SmartNode {...props} type="DeletedRadarValueListItem" />);
export const DeletedSubscriptionItemNode = memo((props: any) => <SmartNode {...props} type="DeletedSubscriptionItem" />);
export const DeletedTaxIdNode = memo((props: any) => <SmartNode {...props} type="DeletedTaxId" />);
export const DeletedTerminalConfigurationNode = memo((props: any) => <SmartNode {...props} type="DeletedTerminalConfiguration" />);
export const DeletedTerminalLocationNode = memo((props: any) => <SmartNode {...props} type="DeletedTerminalLocation" />);
export const DeletedTerminalReaderNode = memo((props: any) => <SmartNode {...props} type="DeletedTerminalReader" />);
export const DeletedTestHelpersTestClockNode = memo((props: any) => <SmartNode {...props} type="DeletedTestHelpersTestClock" />);
export const DeletedWebhookEndpointNode = memo((props: any) => <SmartNode {...props} type="DeletedWebhookEndpoint" />);
export const DiscountNode = memo((props: any) => <SmartNode {...props} type="Discount" />);
export const DisputeNode = memo((props: any) => <SmartNode {...props} type="Dispute" />);
export const EphemeralKeyNode = memo((props: any) => <SmartNode {...props} type="EphemeralKey" />);
export const EventNode = memo((props: any) => <SmartNode {...props} type="Event" />);
export const ExchangeRateNode = memo((props: any) => <SmartNode {...props} type="ExchangeRate" />);
export const ExternalAccountNode = memo((props: any) => <SmartNode {...props} type="ExternalAccount" />);
export const FeeRefundNode = memo((props: any) => <SmartNode {...props} type="FeeRefund" />);
export const FileNode = memo((props: any) => <SmartNode {...props} type="File" />);
export const FileLinkNode = memo((props: any) => <SmartNode {...props} type="FileLink" />);
export const FinancialConnectionsAccountNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsAccount" />);
export const FinancialConnectionsAccountOwnerNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsAccountOwner" />);
export const FinancialConnectionsSessionNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsSession" />);
export const FundingInstructionsNode = memo((props: any) => <SmartNode {...props} type="FundingInstructions" />);
export const IdentityVerificationReportNode = memo((props: any) => <SmartNode {...props} type="IdentityVerificationReport" />);
export const IdentityVerificationSessionNode = memo((props: any) => <SmartNode {...props} type="IdentityVerificationSession" />);
export const InvoiceNode = memo((props: any) => <SmartNode {...props} type="Invoice" />);
export const InvoiceitemNode = memo((props: any) => <SmartNode {...props} type="Invoiceitem" />);
export const IssuingAuthorizationNode = memo((props: any) => <SmartNode {...props} type="IssuingAuthorization" />);
export const IssuingCardNode = memo((props: any) => <SmartNode {...props} type="IssuingCard" />);
export const IssuingCardholderNode = memo((props: any) => <SmartNode {...props} type="IssuingCardholder" />);
export const IssuingDisputeNode = memo((props: any) => <SmartNode {...props} type="IssuingDispute" />);
export const IssuingSettlementNode = memo((props: any) => <SmartNode {...props} type="IssuingSettlement" />);
export const IssuingTransactionNode = memo((props: any) => <SmartNode {...props} type="IssuingTransaction" />);
export const ItemNode = memo((props: any) => <SmartNode {...props} type="Item" />);
export const LineItemNode = memo((props: any) => <SmartNode {...props} type="LineItem" />);
export const LoginLinkNode = memo((props: any) => <SmartNode {...props} type="LoginLink" />);
export const MandateNode = memo((props: any) => <SmartNode {...props} type="Mandate" />);
export const PaymentIntentNode = memo((props: any) => <SmartNode {...props} type="PaymentIntent" />);
export const PaymentLinkNode = memo((props: any) => <SmartNode {...props} type="PaymentLink" />);
export const PaymentMethodNode = memo((props: any) => <SmartNode {...props} type="PaymentMethod" />);
export const PaymentSourceNode = memo((props: any) => <SmartNode {...props} type="PaymentSource" />);
export const PayoutNode = memo((props: any) => <SmartNode {...props} type="Payout" />);
export const PersonNode = memo((props: any) => <SmartNode {...props} type="Person" />);
export const PlanNode = memo((props: any) => <SmartNode {...props} type="Plan" />);
export const PriceNode = memo((props: any) => <SmartNode {...props} type="Price" />);
export const ProductNode = memo((props: any) => <SmartNode {...props} type="Product" />);
export const PromotionCodeNode = memo((props: any) => <SmartNode {...props} type="PromotionCode" />);
export const QuoteNode = memo((props: any) => <SmartNode {...props} type="Quote" />);
export const RadarEarlyFraudWarningNode = memo((props: any) => <SmartNode {...props} type="RadarEarlyFraudWarning" />);
export const RadarValueListNode = memo((props: any) => <SmartNode {...props} type="RadarValueList" />);
export const RadarValueListItemNode = memo((props: any) => <SmartNode {...props} type="RadarValueListItem" />);
export const RefundNode = memo((props: any) => <SmartNode {...props} type="Refund" />);
export const ReportingReportRunNode = memo((props: any) => <SmartNode {...props} type="ReportingReportRun" />);
export const ReportingReportTypeNode = memo((props: any) => <SmartNode {...props} type="ReportingReportType" />);
export const ReviewNode = memo((props: any) => <SmartNode {...props} type="Review" />);
export const ScheduledQueryRunNode = memo((props: any) => <SmartNode {...props} type="ScheduledQueryRun" />);
export const SetupAttemptNode = memo((props: any) => <SmartNode {...props} type="SetupAttempt" />);
export const SetupIntentNode = memo((props: any) => <SmartNode {...props} type="SetupIntent" />);
export const ShippingRateNode = memo((props: any) => <SmartNode {...props} type="ShippingRate" />);
export const SourceNode = memo((props: any) => <SmartNode {...props} type="Source" />);
export const SourceMandateNotificationNode = memo((props: any) => <SmartNode {...props} type="SourceMandateNotification" />);
export const SourceTransactionNode = memo((props: any) => <SmartNode {...props} type="SourceTransaction" />);
export const SubscriptionNode = memo((props: any) => <SmartNode {...props} type="Subscription" />);
export const SubscriptionItemNode = memo((props: any) => <SmartNode {...props} type="SubscriptionItem" />);
export const SubscriptionScheduleNode = memo((props: any) => <SmartNode {...props} type="SubscriptionSchedule" />);
export const TaxCodeNode = memo((props: any) => <SmartNode {...props} type="TaxCode" />);
export const TaxIdNode = memo((props: any) => <SmartNode {...props} type="TaxId" />);
export const TaxRateNode = memo((props: any) => <SmartNode {...props} type="TaxRate" />);
export const TerminalConfigurationNode = memo((props: any) => <SmartNode {...props} type="TerminalConfiguration" />);
export const TerminalConnectionTokenNode = memo((props: any) => <SmartNode {...props} type="TerminalConnectionToken" />);
export const TerminalLocationNode = memo((props: any) => <SmartNode {...props} type="TerminalLocation" />);
export const TerminalReaderNode = memo((props: any) => <SmartNode {...props} type="TerminalReader" />);
export const TestHelpersTestClockNode = memo((props: any) => <SmartNode {...props} type="TestHelpersTestClock" />);
export const TokenNode = memo((props: any) => <SmartNode {...props} type="Token" />);
export const TopupNode = memo((props: any) => <SmartNode {...props} type="Topup" />);
export const TransferNode = memo((props: any) => <SmartNode {...props} type="Transfer" />);
export const TransferReversalNode = memo((props: any) => <SmartNode {...props} type="TransferReversal" />);
export const TreasuryCreditReversalNode = memo((props: any) => <SmartNode {...props} type="TreasuryCreditReversal" />);
export const TreasuryDebitReversalNode = memo((props: any) => <SmartNode {...props} type="TreasuryDebitReversal" />);
export const TreasuryFinancialAccountNode = memo((props: any) => <SmartNode {...props} type="TreasuryFinancialAccount" />);
export const TreasuryFinancialAccountFeaturesNode = memo((props: any) => <SmartNode {...props} type="TreasuryFinancialAccountFeatures" />);
export const TreasuryInboundTransferNode = memo((props: any) => <SmartNode {...props} type="TreasuryInboundTransfer" />);
export const TreasuryOutboundPaymentNode = memo((props: any) => <SmartNode {...props} type="TreasuryOutboundPayment" />);
export const TreasuryOutboundTransferNode = memo((props: any) => <SmartNode {...props} type="TreasuryOutboundTransfer" />);
export const TreasuryReceivedCreditNode = memo((props: any) => <SmartNode {...props} type="TreasuryReceivedCredit" />);
export const TreasuryReceivedDebitNode = memo((props: any) => <SmartNode {...props} type="TreasuryReceivedDebit" />);
export const TreasuryTransactionNode = memo((props: any) => <SmartNode {...props} type="TreasuryTransaction" />);
export const TreasuryTransactionEntryNode = memo((props: any) => <SmartNode {...props} type="TreasuryTransactionEntry" />);
export const WebhookEndpointNode = memo((props: any) => <SmartNode {...props} type="WebhookEndpoint" />);
export const AccountNoticeNode = memo((props: any) => <SmartNode {...props} type="AccountNotice" />);
export const AccountSessionNode = memo((props: any) => <SmartNode {...props} type="AccountSession" />);
export const ApplicationNode = memo((props: any) => <SmartNode {...props} type="Application" />);
export const BalanceSettingsNode = memo((props: any) => <SmartNode {...props} type="BalanceSettings" />);
export const BillingAlertNode = memo((props: any) => <SmartNode {...props} type="BillingAlert" />);
export const BillingAlertTriggeredNode = memo((props: any) => <SmartNode {...props} type="BillingAlertTriggered" />);
export const BillingCreditBalanceSummaryNode = memo((props: any) => <SmartNode {...props} type="BillingCreditBalanceSummary" />);
export const BillingCreditBalanceTransactionNode = memo((props: any) => <SmartNode {...props} type="BillingCreditBalanceTransaction" />);
export const BillingCreditGrantNode = memo((props: any) => <SmartNode {...props} type="BillingCreditGrant" />);
export const BillingMeterNode = memo((props: any) => <SmartNode {...props} type="BillingMeter" />);
export const BillingMeterEventNode = memo((props: any) => <SmartNode {...props} type="BillingMeterEvent" />);
export const BillingMeterEventAdjustmentNode = memo((props: any) => <SmartNode {...props} type="BillingMeterEventAdjustment" />);
export const BillingMeterEventSummaryNode = memo((props: any) => <SmartNode {...props} type="BillingMeterEventSummary" />);
export const CapitalFinancingOfferNode = memo((props: any) => <SmartNode {...props} type="CapitalFinancingOffer" />);
export const CapitalFinancingSummaryNode = memo((props: any) => <SmartNode {...props} type="CapitalFinancingSummary" />);
export const CapitalFinancingTransactionNode = memo((props: any) => <SmartNode {...props} type="CapitalFinancingTransaction" />);
export const ClimateOrderNode = memo((props: any) => <SmartNode {...props} type="ClimateOrder" />);
export const ClimateProductNode = memo((props: any) => <SmartNode {...props} type="ClimateProduct" />);
export const ClimateSupplierNode = memo((props: any) => <SmartNode {...props} type="ClimateSupplier" />);
export const ConfirmationTokenNode = memo((props: any) => <SmartNode {...props} type="ConfirmationToken" />);
export const CustomerSessionNode = memo((props: any) => <SmartNode {...props} type="CustomerSession" />);
export const DeletedApplicationNode = memo((props: any) => <SmartNode {...props} type="DeletedApplication" />);
export const DeletedBankAccountNode = memo((props: any) => <SmartNode {...props} type="DeletedBankAccount" />);
export const DeletedCardNode = memo((props: any) => <SmartNode {...props} type="DeletedCard" />);
export const DeletedPriceNode = memo((props: any) => <SmartNode {...props} type="DeletedPrice" />);
export const DeletedProductFeatureNode = memo((props: any) => <SmartNode {...props} type="DeletedProductFeature" />);
export const EntitlementsActiveEntitlementNode = memo((props: any) => <SmartNode {...props} type="EntitlementsActiveEntitlement" />);
export const EntitlementsActiveEntitlementSummaryNode = memo((props: any) => <SmartNode {...props} type="EntitlementsActiveEntitlementSummary" />);
export const EntitlementsFeatureNode = memo((props: any) => <SmartNode {...props} type="EntitlementsFeature" />);
export const FinancialConnectionsAccountInferredBalanceNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsAccountInferredBalance" />);
export const FinancialConnectionsAccountOwnershipNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsAccountOwnership" />);
export const FinancialConnectionsInstitutionNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsInstitution" />);
export const FinancialConnectionsTransactionNode = memo((props: any) => <SmartNode {...props} type="FinancialConnectionsTransaction" />);
export const ForwardingRequestNode = memo((props: any) => <SmartNode {...props} type="ForwardingRequest" />);
export const FxQuoteNode = memo((props: any) => <SmartNode {...props} type="FxQuote" />);
export const InvoicePaymentNode = memo((props: any) => <SmartNode {...props} type="InvoicePayment" />);
export const InvoiceRenderingTemplateNode = memo((props: any) => <SmartNode {...props} type="InvoiceRenderingTemplate" />);
export const IssuingCreditUnderwritingRecordNode = memo((props: any) => <SmartNode {...props} type="IssuingCreditUnderwritingRecord" />);
export const IssuingDisputeSettlementDetailNode = memo((props: any) => <SmartNode {...props} type="IssuingDisputeSettlementDetail" />);
export const IssuingFraudLiabilityDebitNode = memo((props: any) => <SmartNode {...props} type="IssuingFraudLiabilityDebit" />);
export const IssuingPersonalizationDesignNode = memo((props: any) => <SmartNode {...props} type="IssuingPersonalizationDesign" />);
export const IssuingPhysicalBundleNode = memo((props: any) => <SmartNode {...props} type="IssuingPhysicalBundle" />);
export const IssuingTokenNode = memo((props: any) => <SmartNode {...props} type="IssuingToken" />);
export const MarginNode = memo((props: any) => <SmartNode {...props} type="Margin" />);
export const OrderNode = memo((props: any) => <SmartNode {...props} type="Order" />);
export const PaymentAttemptRecordNode = memo((props: any) => <SmartNode {...props} type="PaymentAttemptRecord" />);
export const PaymentIntentAmountDetailsLineItemNode = memo((props: any) => <SmartNode {...props} type="PaymentIntentAmountDetailsLineItem" />);
export const PaymentMethodConfigurationNode = memo((props: any) => <SmartNode {...props} type="PaymentMethodConfiguration" />);
export const PaymentMethodDomainNode = memo((props: any) => <SmartNode {...props} type="PaymentMethodDomain" />);
export const PaymentRecordNode = memo((props: any) => <SmartNode {...props} type="PaymentRecord" />);
export const PrivacyRedactionJobNode = memo((props: any) => <SmartNode {...props} type="PrivacyRedactionJob" />);
export const PrivacyRedactionJobValidationErrorNode = memo((props: any) => <SmartNode {...props} type="PrivacyRedactionJobValidationError" />);
export const ProductFeatureNode = memo((props: any) => <SmartNode {...props} type="ProductFeature" />);
export const QuoteLineNode = memo((props: any) => <SmartNode {...props} type="QuoteLine" />);
export const QuotePreviewInvoiceNode = memo((props: any) => <SmartNode {...props} type="QuotePreviewInvoice" />);
export const QuotePreviewSubscriptionScheduleNode = memo((props: any) => <SmartNode {...props} type="QuotePreviewSubscriptionSchedule" />);
export const TaxAssociationNode = memo((props: any) => <SmartNode {...props} type="TaxAssociation" />);
export const TaxCalculationNode = memo((props: any) => <SmartNode {...props} type="TaxCalculation" />);
export const TaxCalculationLineItemNode = memo((props: any) => <SmartNode {...props} type="TaxCalculationLineItem" />);
export const TaxFormNode = memo((props: any) => <SmartNode {...props} type="TaxForm" />);
export const TaxRegistrationNode = memo((props: any) => <SmartNode {...props} type="TaxRegistration" />);
export const TaxSettingsNode = memo((props: any) => <SmartNode {...props} type="TaxSettings" />);
export const TaxTransactionNode = memo((props: any) => <SmartNode {...props} type="TaxTransaction" />);
export const TaxTransactionLineItemNode = memo((props: any) => <SmartNode {...props} type="TaxTransactionLineItem" />);
export const TerminalReaderCollectedDataNode = memo((props: any) => <SmartNode {...props} type="TerminalReaderCollectedData" />);
export const TerminalOnboardingLinkNode = memo((props: any) => <SmartNode {...props} type="TerminalOnboardingLink" />);
export const BillingAnalyticsMeterUsageNode = memo((props: any) => <SmartNode {...props} type="BillingAnalyticsMeterUsage" />);
export const BillingAnalyticsMeterUsageRowNode = memo((props: any) => <SmartNode {...props} type="BillingAnalyticsMeterUsageRow" />);
export const PaymentMethodBalanceNode = memo((props: any) => <SmartNode {...props} type="PaymentMethodBalance" />);
export const DelegatedCheckoutRequestedSessionNode = memo((props: any) => <SmartNode {...props} type="DelegatedCheckoutRequestedSession" />);
export const IdentityBlocklistEntryNode = memo((props: any) => <SmartNode {...props} type="IdentityBlocklistEntry" />);
export const TransitBalanceNode = memo((props: any) => <SmartNode {...props} type="TransitBalance" />);
export const IssuingProgramNode = memo((props: any) => <SmartNode {...props} type="IssuingProgram" />);
export const BalanceTransferNode = memo((props: any) => <SmartNode {...props} type="BalanceTransfer" />);
export const RadarAccountEvaluationNode = memo((props: any) => <SmartNode {...props} type="RadarAccountEvaluation" />);
export const ProductCatalogTrialOfferNode = memo((props: any) => <SmartNode {...props} type="ProductCatalogTrialOffer" />);