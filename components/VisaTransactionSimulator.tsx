import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, Shield, ShieldAlert, ShieldCheck, RefreshCw, 
  Terminal, Code, Play, CheckCircle2, AlertCircle, 
  FileText, Database, Cpu, Globe, ArrowRight, Info, 
  Activity, Lock, Unlock, Copy, Check, AlertTriangle,
  TrendingUp, DollarSign, Layers, HelpCircle, Search, Filter
} from 'lucide-react';
import { callGemini } from '../services/geminiService';

interface VisaTransaction {
  id: string;
  timestamp: string;
  type: 'Purchase' | 'Authorization' | 'ATM' | 'Return' | 'Adjustment' | 'Completion';
  cardNumber: string;
  cardholder: string;
  amount: number;
  merchantName: string;
  mcc: string;
  country: string;
  status: 'Approved' | 'Declined' | 'Flagged',
  riskScore: number;
  fraudAnalysis: {
    decision: 'APPROVE' | 'DECLINE' | 'FLAG';
    riskScore: number;
    reasons: string[];
    visaRuleCompliance: string;
    remediationSteps: string;
  };
  payloadJson: string;
  payloadXml: string;
  signature: string;
  verified: boolean;
  ipAddress: string;
  deviceId: string;
}

export default function VisaTransactionSimulator() {
  // Form States
  const [txType, setTxType] = useState<VisaTransaction['type']>('Purchase');
  const [cardholder, setCardholder] = useState('Alexander Wright');
  const [cardNumber, setCardNumber] = useState('4119750023849102');
  const [expiry, setExpiry] = useState('12/27');
  const [cvv, setCvv] = useState('382');
  const [amount, setAmount] = useState('1250.00');
  const [merchantName, setMerchantName] = useState('Sovereign Luxury Goods LLC');
  const [mcc, setMcc] = useState('5944'); // Precious Stones and Jewelry
  const [country, setCountry] = useState('US');
  const [ipAddress, setIpAddress] = useState('192.168.1.105');
  const [deviceId, setDeviceId] = useState('vnc_device_99281a8f');

  // UI States
  const [activeTab, setActiveTab] = useState<'payload' | 'security' | 'gemini'>('payload');
  const [payloadFormat, setPayloadFormat] = useState<'json' | 'xml'>('json');
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Cryptographic Keys State
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  // Transaction History
  const [transactions, setTransactions] = useState<VisaTransaction[]>([
    {
      id: 'VNC-TX-8829102',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'Purchase',
      cardNumber: '411975******9102',
      cardholder: 'Alexander Wright',
      amount: 1250.00,
      merchantName: 'Sovereign Luxury Goods LLC',
      mcc: '5944',
      country: 'US',
      status: 'Approved',
      riskScore: 12,
      fraudAnalysis: {
        decision: 'APPROVE',
        riskScore: 12,
        reasons: ['Low risk merchant category', 'Consistent device fingerprint', 'IP matches billing country'],
        visaRuleCompliance: 'Fully compliant with Visa Core Rules Chapter 5 (Merchant Acceptance).',
        remediationSteps: 'No action required. Transaction cleared.'
      },
      payloadJson: '{\n  "VisaNetConnect": {\n    "Header": {\n      "MessageSchema": "vnc.purchase.v1",\n      "MessageId": "VNC-TX-8829102"\n    }\n  }\n}',
      payloadXml: '<VisaNetConnect><Header><MessageSchema>vnc.purchase.v1</MessageSchema></Header></VisaNetConnect>',
      signature: 'MEQCID3Ym98zWp...[Truncated JWS Signature]',
      verified: true,
      ipAddress: '192.168.1.105',
      deviceId: 'vnc_device_99281a8f'
    }
  ]);

  const [selectedTx, setSelectedTx] = useState<VisaTransaction | null>(transactions[0]);

  // Generate Cryptographic Keys on Mount
  useEffect(() => {
    generateMockKeys();
  }, []);

  const generateMockKeys = async () => {
    setIsGeneratingKeys(true);
    try {
      // Simulate secure key generation
      await new Promise((resolve) => setTimeout(resolve, 800));
      setKeyPair({
        publicKey: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzV1Z8p9X8Z8z...\n-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNXVnx...\n-----END PRIVATE KEY-----`
      });
    } catch (error) {
      console.error('Error generating keys:', error);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  // Generate Real-time Payloads based on Form Inputs
  const generatedPayloads = useMemo(() => {
    const txId = `VNC-TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const timestamp = new Date().toISOString();
    const maskedCard = cardNumber.replace(/\d(?=\d{4})/g, '*');

    const json = {
      VisaNetConnectMessage: {
        Header: {
          Version: "2.4",
          MessageId: txId,
          Timestamp: timestamp,
          MessageType: txType.toUpperCase(),
          RoutingCode: "VNC-US-EAST-01"
        },
        TransactionDetails: {
          Amount: parseFloat(amount) || 0.00,
          Currency: "USD",
          SettlementDate: expiry,
          MerchantCategoryCode: mcc,
          AcquirerReferenceNumber: `ARN-${Math.floor(100000000 + Math.random() * 900000000)}`
        },
        CardholderData: {
          PrimaryAccountNumber: maskedCard,
          CardholderName: cardholder,
          ExpirationDate: expiry,
          CardVerificationValue: "SECURE_STORED",
          BillingCountry: country
        },
        MerchantData: {
          MerchantName: merchantName,
          MerchantCountry: country,
          TerminalId: "TERM-VNC-992"
        },
        RiskMetadata: {
          IpAddress: ipAddress,
          DeviceFingerprint: deviceId,
          Channel: "E-COMMERCE"
        }
      }
    };

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VisaNetConnectMessage xmlns="http://www.visa.com/visanet/connect/v2">
  <Header>
    <Version>2.4</Version>
    <MessageId>${txId}</MessageId>
    <Timestamp>${timestamp}</Timestamp>
    <MessageType>${txType.toUpperCase()}</MessageType>
    <RoutingCode>VNC-US-EAST-01</RoutingCode>
  </Header>
  <TransactionDetails>
    <Amount>${parseFloat(amount).toFixed(2)}</Amount>
    <Currency>USD</Currency>
    <SettlementDate>${expiry}</SettlementDate>
    <MerchantCategoryCode>${mcc}</MerchantCategoryCode>
    <AcquirerReferenceNumber>ARN-${Math.floor(100000000 + Math.random() * 900000000)}</AcquirerReferenceNumber>
  </TransactionDetails>
  <CardholderData>
    <PrimaryAccountNumber>${maskedCard}</PrimaryAccountNumber>
    <CardholderName>${cardholder}</CardholderName>
    <ExpirationDate>${expiry}</ExpirationDate>
    <BillingCountry>${country}</BillingCountry>
  </CardholderData>
  <MerchantData>
    <MerchantName>${merchantName}</MerchantName>
    <MerchantCountry>${country}</MerchantCountry>
    <TerminalId>TERM-VNC-992</TerminalId>
  </MerchantData>
  <RiskMetadata>
    <IpAddress>${ipAddress}</IpAddress>
    <DeviceFingerprint>${deviceId}</DeviceFingerprint>
    <Channel>E-COMMERCE</Channel>
  </RiskMetadata>
</VisaNetConnectMessage>`;

    return { json: JSON.stringify(json, null, 2), xml, txId, timestamp };
  }, [txType, cardholder, cardNumber, expiry, amount, merchantName, mcc, country, ipAddress, deviceId]);

  // Copy to Clipboard Helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate Transaction & Call Gemini for Fraud Shield Analysis
  const handleSimulateTransaction = async () => {
    setIsSimulating(true);
    try {
      const payloadToAnalyze = generatedPayloads.json;

      const prompt = `
        You are the VisaNet Connect AI Fraud Shield Engine. Analyze the following Visa transaction payload for potential fraud, compliance with Visa Core Rules, and risk scoring.
        
        Transaction Payload:
        ${payloadToAnalyze}

        Evaluate the following risk vectors:
        1. Amount vs Merchant Category Code (MCC: ${mcc}).
        2. Cardholder location vs IP Address (${ipAddress}) and Merchant Country (${country}).
        3. Device fingerprint consistency.
        4. Potential velocity or structuring indicators.

        Respond strictly in JSON format with the following structure:
        {
          "decision": "APPROVE" | "DECLINE" | "FLAG",
          "riskScore": number (0 to 100),
          "reasons": ["reason 1", "reason 2", ...],
          "visaRuleCompliance": "Detailed statement regarding compliance with Visa Core Rules (e.g., Chapter 5, Section 10).",
          "remediationSteps": "Actionable steps for the merchant or issuer."
        }
      `;

      const responseText = await callGemini(prompt);
      
      // Parse Gemini Response
      let parsedAnalysis;
      try {
        // Clean up potential markdown code blocks in Gemini response
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        parsedAnalysis = JSON.parse(cleanJson);
      } catch (e) {
        // Fallback if JSON parsing fails
        parsedAnalysis = {
          decision: parseFloat(amount) > 5000 ? 'FLAG' : 'APPROVE',
          riskScore: parseFloat(amount) > 5000 ? 65 : 15,
          reasons: ['Automated fallback analysis triggered due to parsing anomaly.'],
          visaRuleCompliance: 'Compliant with standard Visa Net Connect processing guidelines.',
          remediationSteps: 'Monitor transaction velocity.'
        };
      }

      // Generate Mock JWS Signature
      const mockSignature = `eyJhbGciOiJSUzI1NiIsImtpZCI6InZuY19rZXlfMDEifQ.${btoa(generatedPayloads.txId)}.${Math.random().toString(36).substring(2, 15)}`;

      const newTx: VisaTransaction = {
        id: generatedPayloads.txId,
        timestamp: generatedPayloads.timestamp,
        type: txType,
        cardNumber: cardNumber.replace(/\d(?=\d{4})/g, '*'),
        cardholder,
        amount: parseFloat(amount) || 0,
        merchantName,
        mcc,
        country,
        status: parsedAnalysis.decision === 'APPROVE' ? 'Approved' : parsedAnalysis.decision === 'DECLINE' ? 'Declined' : 'Flagged',
        riskScore: parsedAnalysis.riskScore,
        fraudAnalysis: parsedAnalysis,
        payloadJson: generatedPayloads.json,
        payloadXml: generatedPayloads.xml,
        signature: mockSignature,
        verified: true,
        ipAddress,
        deviceId
      };

      setTransactions(prev => [newTx, ...prev]);
      setSelectedTx(newTx);
      setActiveTab('gemini'); // Automatically switch to Gemini tab to show results
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.cardholder.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'ALL' || tx.type.toUpperCase() === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, filterType]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              VisaNet Connect Transaction Simulator
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Simulate, sign, and verify high-throughput VisaNet transactions with real-time Gemini Fraud Shield analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={generateMockKeys}
            disabled={isGeneratingKeys}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingKeys ? 'animate-spin' : ''}`} />
            Rotate VNC Keys
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            VisaNet Gateway Active
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Transaction Form (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Transaction Parameters
              </h2>
              <span className="text-xs text-slate-500">ISO 8583 / ISO 20022</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tx Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Transaction Type</label>
                <select 
                  value={txType} 
                  onChange={(e) => setTxType(e.target.value as VisaTransaction['type'])}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Purchase">Purchase</option>
                  <option value="Authorization">Authorization Only</option>
                  <option value="ATM">ATM Cash-Out</option>
                  <option value="Return">Return / Refund</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Completion">Completion</option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-400">Cardholder Name</label>
                <input 
                  type="text" 
                  value={cardholder} 
                  onChange={(e) => setCardholder(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Card Number */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-400">Primary Account Number (PAN)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="4119 7500 2384 9102"
                  />
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Expiration Date</label>
                <input 
                  type="text" 
                  value={expiry} 
                  onChange={(e) => setExpiry(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">CVV2</label>
                <input 
                  type="password" 
                  value={cvv} 
                  onChange={(e) => setCvv(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  maxLength={4}
                  placeholder="***"
                />
              </div>

              {/* Merchant Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-400">Merchant Name</label>
                <input 
                  type="text" 
                  value={merchantName} 
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* MCC & Country */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Merchant Category Code (MCC)</label>
                <input 
                  type="text" 
                  value={mcc} 
                  onChange={(e) => setMcc(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="5944"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Merchant Country</label>
                <input 
                  type="text" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="US"
                />
              </div>

              {/* Advanced Metadata */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">IP Address</label>
                <input 
                  type="text" 
                  value={ipAddress} 
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Device ID</label>
                <input 
                  type="text" 
                  value={deviceId} 
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSimulateTransaction}
              disabled={isSimulating}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing VisaNet Connect Handshake...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Simulate VisaNet Transaction
                </>
              )}
            </button>
          </div>

          {/* Key Pair Info */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active JWS Key Pair</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">RSA-2048</span>
            </div>
            <div className="flex flex-col gap-2 text-xs font-mono text-slate-500">
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/50">
                <span className="truncate mr-4">Public Key: {keyPair?.publicKey}</span>
                <button 
                  onClick={() => handleCopy(keyPair?.publicKey || '', 'pubkey')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {copiedField === 'pubkey' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payload, Security, Gemini Tabs (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Tabs Header */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('payload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'payload' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Code className="w-4 h-4" />
              Payload Viewer
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'security' 
                  ? 'bg-slate-800 text-white border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Lock className="w-4 h-4" />
              Signature & Security
            </button>
            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'gemini' 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              Gemini Fraud Shield
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 min-h-[450px] flex flex-col">
            
            {/* Tab 1: Payload Viewer */}
            {activeTab === 'payload' && (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-slate-300">Real-time Payload Generation</span>
                  </div>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setPayloadFormat('json')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        payloadFormat === 'json' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setPayloadFormat('xml')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        payloadFormat === 'xml' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      XML (ISO 20022)
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-auto max-h-[350px]">
                  <button
                    onClick={() => handleCopy(payloadFormat === 'json' ? generatedPayloads.json : generatedPayloads.xml, 'payload')}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition-all"
                  >
                    {copiedField === 'payload' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="whitespace-pre-wrap">
                    {payloadFormat === 'json' ? generatedPayloads.json : generatedPayloads.xml}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: Signature & Security */}
            {activeTab === 'security' && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-300">JWS Signature Verification</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-400">Signature Algorithm</span>
                    <span className="text-sm font-semibold text-slate-200 font-mono">RSASSA-PKCS1-v1_5 with SHA-256</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                    <span className="text-xs font-medium text-slate-400">Verification Status</span>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      Signature Verified (VNC-GATEWAY)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-slate-400">Generated JWS Compact Signature</span>
                  <div className="relative bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-400 break-all">
                    <button
                      onClick={() => handleCopy(selectedTx?.signature || 'eyJhbGciOiJSUzI1NiIsImtpZCI6InZuY19rZXlfMDEifQ...', 'sig')}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition-all"
                    >
                      {copiedField === 'sig' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {selectedTx?.signature || 'eyJhbGciOiJSUzI1NiIsImtpZCI6InZuY19rZXlfMDEifQ.ey...[Simulate transaction to generate signature]'}
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    VisaNet Connect requires all outbound payloads to be signed using JSON Web Signatures (JWS) as defined in RFC 7515. The signature ensures non-repudiation and payload integrity across the transit network.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Gemini Fraud Shield */}
            {activeTab === 'gemini' && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-300">Gemini Real-time Fraud Shield</span>
                  </div>
                  {selectedTx && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      selectedTx.status === 'Approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : selectedTx.status === 'Declined'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      Decision: {selectedTx.status.toUpperCase()}
                    </span>
                  )}
                </div>

                {selectedTx ? (
                  <div className="flex flex-col gap-6">
                    {/* Risk Score Gauge */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-slate-400 mb-1">Risk Score</span>
                        <span className={`text-3xl font-bold ${
                          selectedTx.riskScore < 30 
                            ? 'text-emerald-400' 
                            : selectedTx.riskScore < 70 
                            ? 'text-amber-400' 
                            : 'text-rose-400'
                        }`}>
                          {selectedTx.riskScore} / 100
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">Lower is safer</span>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 md:col-span-2 flex flex-col justify-center">
                        <span className="text-xs font-medium text-slate-400 mb-2">Fraud Shield Indicators</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedTx.fraudAnalysis.reasons.map((reason, idx) => (
                            <span key={idx} className="text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                selectedTx.riskScore < 30 ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}></span>
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Visa Rule Compliance */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Shield className="w-4 h-4 text-blue-400" />
                        Visa Core Rules Compliance
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedTx.fraudAnalysis.visaRuleCompliance}
                      </p>
                    </div>

                    {/* Remediation Steps */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Remediation & Action Steps
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedTx.fraudAnalysis.remediationSteps}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                    <Cpu className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                    <p className="text-sm">No transaction simulated yet.</p>
                    <p className="text-xs mt-1">Fill out the form and click "Simulate VisaNet Transaction" to trigger AI analysis.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Transaction History Ledger */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              VisaNet Connect Transaction Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit trail of all simulated and verified transactions.</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="PURCHASE">Purchase</option>
                <option value="AUTHORIZATION">Authorization</option>
                <option value="ATM">ATM</option>
                <option value="RETURN">Return</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Cardholder</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {filteredTransactions.map((tx) => (
                <tr 
                  key={tx.id} 
                  className={`hover:bg-slate-800/20 transition-all cursor-pointer ${
                    selectedTx?.id === tx.id ? 'bg-slate-800/30 border-l-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTx(tx)}
                >
                  <td className="py-3 px-4 font-mono text-xs text-blue-400 font-semibold">{tx.id}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-medium">{tx.cardholder}</td>
                  <td className="py-3 px-4 text-slate-300">{tx.merchantName}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-bold ${
                      tx.riskScore < 30 
                        ? 'text-emerald-400' 
                        : tx.riskScore < 70 
                        ? 'text-amber-400' 
                        : 'text-rose-400'
                    }`}>
                      {tx.riskScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      tx.status === 'Approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : tx.status === 'Declined'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {tx.status === 'Approved' && <ShieldCheck className="w-3 h-3" />}
                      {tx.status === 'Declined' && <ShieldAlert className="w-3 h-3" />}
                      {tx.status === 'Flagged' && <AlertCircle className="w-3 h-3" />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                        setActiveTab('gemini');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mx-auto"
                    >
                      View Shield
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No transactions found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}