import React, { useState, useEffect, useCallback } from 'react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface VisaCardProfile {
  id: string;
  cardNumberLast4: string;
  cardholderName: string;
  cardType: 'SovereignCrypto' | 'Web3Platinum' | 'InfiniteDeFi' | 'CorporateLedger';
  status: 'Active' | 'Suspended' | 'Frozen' | 'Expired';
  expiryDate: string;
  creditLimit: number;
  availableBalance: number;
  cryptoLinkedWallet: string;
  preferredCryptoAsset: 'BTC' | 'ETH' | 'USDC' | 'SOL';
  rewardsRate: number; // percentage, e.g., 2.5 for 2.5%
  kycStatus: 'Verified' | 'Pending' | 'Failed';
}

export interface VisaTransaction {
  id: string;
  cardId: string;
  merchantName: string;
  merchantCategory: 'Retail' | 'Dining' | 'Travel' | 'Utilities' | 'CryptoExchange' | 'SovereignWealth';
  amountFiat: number;
  currencyFiat: string;
  amountCrypto: number;
  currencyCrypto: 'BTC' | 'ETH' | 'USDC' | 'SOL';
  exchangeRateUsed: number;
  timestamp: string;
  status: 'Authorized' | 'Settled' | 'Declined' | 'Refunded';
  authCode: string;
  networkFeeCrypto: number;
  gasPriceGwei: number;
  blockchainTxHash: string;
}

export interface CryptoFiatRate {
  pair: string; // e.g., BTC/USD
  asset: 'BTC' | 'ETH' | 'USDC' | 'SOL';
  rate: number;
  change24h: number; // percentage
  high24h: number;
  low24h: number;
  lastUpdated: string;
  sparklineData: number[];
}

export interface GeminiAnalysisLog {
  id: string;
  transactionId: string;
  riskScore: number; // 0 to 100
  fraudClassification: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Alert';
  complianceStatus: 'Passed' | 'Flagged' | 'Requires Manual Review';
  amlCheck: 'Clean' | 'Suspicious Activity Detected' | 'Sanctioned Address Match';
  category: string;
  geminiRecommendation: string;
  tokensConsumed: number;
  latencyMs: number;
  timestamp: string;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================

export const initialCardProfiles: VisaCardProfile[] = [
  {
    id: 'card-001',
    cardNumberLast4: '4112',
    cardholderName: 'Sovereign Administrator',
    cardType: 'SovereignCrypto',
    status: 'Active',
    expiryDate: '12/28',
    creditLimit: 500000,
    availableBalance: 425000,
    cryptoLinkedWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B',
    preferredCryptoAsset: 'BTC',
    rewardsRate: 3.5,
    kycStatus: 'Verified'
  },
  {
    id: 'card-002',
    cardNumberLast4: '9821',
    cardholderName: 'Aquarius Treasury',
    cardType: 'CorporateLedger',
    status: 'Active',
    expiryDate: '06/27',
    creditLimit: 2500000,
    availableBalance: 2100000,
    cryptoLinkedWallet: '0x3A9C826EC7ab88b098defB751B7401B5f6d1489C',
    preferredCryptoAsset: 'USDC',
    rewardsRate: 1.5,
    kycStatus: 'Verified'
  },
  {
    id: 'card-003',
    cardNumberLast4: '5543',
    cardholderName: 'Gemini Live Agent',
    cardType: 'InfiniteDeFi',
    status: 'Active',
    expiryDate: '09/29',
    creditLimit: 100000,
    availableBalance: 89000,
    cryptoLinkedWallet: '0xF92A826EC7ab88b098defB751B7401B5f6d1422A',
    preferredCryptoAsset: 'ETH',
    rewardsRate: 5.0,
    kycStatus: 'Verified'
  },
  {
    id: 'card-004',
    cardNumberLast4: '3310',
    cardholderName: 'Flagged Test Profile',
    cardType: 'Web3Platinum',
    status: 'Frozen',
    expiryDate: '03/26',
    creditLimit: 10000,
    availableBalance: 1200,
    cryptoLinkedWallet: '0x9999999EC7ab88b098defB751B7401B5f6d14999',
    preferredCryptoAsset: 'SOL',
    rewardsRate: 2.0,
    kycStatus: 'Failed'
  }
];

export const initialRates: CryptoFiatRate[] = [
  {
    pair: 'BTC/USD',
    asset: 'BTC',
    rate: 96450.25,
    change24h: 4.82,
    high24h: 97100.00,
    low24h: 91800.50,
    lastUpdated: new Date().toISOString(),
    sparklineData: [91800, 92400, 93100, 92900, 94200, 95100, 95800, 96450]
  },
  {
    pair: 'ETH/USD',
    asset: 'ETH',
    rate: 3420.80,
    change24h: -1.15,
    high24h: 3510.00,
    low24h: 3380.20,
    lastUpdated: new Date().toISOString(),
    sparklineData: [3500, 3480, 3460, 3410, 3390, 3405, 3415, 3420]
  },
  {
    pair: 'USDC/USD',
    asset: 'USDC',
    rate: 1.00,
    change24h: 0.00,
    high24h: 1.001,
    low24h: 0.999,
    lastUpdated: new Date().toISOString(),
    sparklineData: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]
  },
  {
    pair: 'SOL/USD',
    asset: 'SOL',
    rate: 184.65,
    change24h: 12.45,
    high24h: 189.20,
    low24h: 162.10,
    lastUpdated: new Date().toISOString(),
    sparklineData: [162, 165, 171, 174, 172, 179, 182, 184.65]
  }
];

export const initialTransactions: VisaTransaction[] = [
  {
    id: 'tx-visa-101',
    cardId: 'card-001',
    merchantName: 'Sovereign Node Hosting',
    merchantCategory: 'Utilities',
    amountFiat: 1250.00,
    currencyFiat: 'USD',
    amountCrypto: 0.01296,
    currencyCrypto: 'BTC',
    exchangeRateUsed: 96450.25,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: 'Settled',
    authCode: 'VS-882910',
    networkFeeCrypto: 0.00015,
    gasPriceGwei: 45,
    blockchainTxHash: '0x8a2f9c1b3d5e7f9a0c2e4g6h8i0j2k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b'
  },
  {
    id: 'tx-visa-102',
    cardId: 'card-002',
    merchantName: 'Citi Liquidity Pool',
    merchantCategory: 'SovereignWealth',
    amountFiat: 50000.00,
    currencyFiat: 'USD',
    amountCrypto: 50000.00,
    currencyCrypto: 'USDC',
    exchangeRateUsed: 1.00,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    status: 'Settled',
    authCode: 'VS-110294',
    networkFeeCrypto: 5.00,
    gasPriceGwei: 12,
    blockchainTxHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f'
  },
  {
    id: 'tx-visa-103',
    cardId: 'card-003',
    merchantName: 'Decentralized Domain Registry',
    merchantCategory: 'Retail',
    amountFiat: 450.00,
    currencyFiat: 'USD',
    amountCrypto: 0.1315,
    currencyCrypto: 'ETH',
    exchangeRateUsed: 3420.80,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    status: 'Settled',
    authCode: 'VS-554012',
    networkFeeCrypto: 0.0025,
    gasPriceGwei: 32,
    blockchainTxHash: '0xf4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3'
  },
  {
    id: 'tx-visa-104',
    cardId: 'card-004',
    merchantName: 'Darknet Mixer Simulation',
    merchantCategory: 'CryptoExchange',
    amountFiat: 8500.00,
    currencyFiat: 'USD',
    amountCrypto: 46.033,
    currencyCrypto: 'SOL',
    exchangeRateUsed: 184.65,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    status: 'Declined',
    authCode: 'VS-000000',
    networkFeeCrypto: 0.00005,
    gasPriceGwei: 1500,
    blockchainTxHash: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
  }
];

export const initialGeminiLogs: GeminiAnalysisLog[] = [
  {
    id: 'gemini-log-001',
    transactionId: 'tx-visa-101',
    riskScore: 8,
    fraudClassification: 'Low Risk',
    complianceStatus: 'Passed',
    amlCheck: 'Clean',
    category: 'Infrastructure & Sovereign Operations',
    geminiRecommendation: 'Transaction matches historical patterns for Sovereign Node Hosting. Authorized automatically. Recommended action: None. Rewards of 3.5% BTC successfully queued for distribution.',
    tokensConsumed: 342,
    latencyMs: 185,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'gemini-log-002',
    transactionId: 'tx-visa-102',
    riskScore: 15,
    fraudClassification: 'Low Risk',
    complianceStatus: 'Passed',
    amlCheck: 'Clean',
    category: 'Institutional Liquidity Transfer',
    geminiRecommendation: 'High-value corporate sweep detected. Verified against Aquarius Treasury whitelist. Multi-sig signature verified on-chain. Recommended action: Log to global ledger and proceed with settlement.',
    tokensConsumed: 412,
    latencyMs: 210,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'gemini-log-003',
    transactionId: 'tx-visa-103',
    riskScore: 22,
    fraudClassification: 'Low Risk',
    complianceStatus: 'Passed',
    amlCheck: 'Clean',
    category: 'Web3 Domain Acquisition',
    geminiRecommendation: 'Standard retail transaction. Gas price within normal parameters. Smart contract interaction verified as safe. Recommended action: Approve and credit 5.0% ETH rewards.',
    tokensConsumed: 298,
    latencyMs: 145,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'gemini-log-004',
    transactionId: 'tx-visa-104',
    riskScore: 98,
    fraudClassification: 'Critical Alert',
    complianceStatus: 'Flagged',
    amlCheck: 'Suspicious Activity Detected',
    category: 'High-Risk Crypto Mixing',
    geminiRecommendation: 'CRITICAL: Transaction destination matches known OFAC sanctioned address or high-risk mixer. Cardholder KYC status is Failed. Gas price anomaly detected (1500 Gwei). Recommended action: Freeze card immediately, decline transaction, and dispatch automated SAR (Suspicious Activity Report) to compliance gateway.',
    tokensConsumed: 580,
    latencyMs: 320,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// ==========================================
// HELPER GENERATORS
// ==========================================

/**
 * Simulates real-time fluctuations in crypto-fiat exchange rates.
 */
export const fluctuateRates = (currentRates: CryptoFiatRate[]): CryptoFiatRate[] => {
  return currentRates.map(rateObj => {
    if (rateObj.asset === 'USDC') return rateObj; // Stablecoin stays stable

    const fluctuationPercent = (Math.random() - 0.48) * 0.02; // Slight upward bias
    const newRate = parseFloat((rateObj.rate * (1 + fluctuationPercent)).toFixed(2));
    const change24h = parseFloat((rateObj.change24h + fluctuationPercent * 100).toFixed(2));
    const high24h = newRate > rateObj.high24h ? newRate : rateObj.high24h;
    const low24h = newRate < rateObj.low24h ? newRate : rateObj.low24h;
    
    const updatedSparkline = [...rateObj.sparklineData.slice(1), newRate];

    return {
      ...rateObj,
      rate: newRate,
      change24h,
      high24h,
      low24h,
      lastUpdated: new Date().toISOString(),
      sparklineData: updatedSparkline
    };
  });
};

/**
 * Generates a mock Gemini AI analysis for a given transaction.
 */
export const generateGeminiAnalysis = (
  tx: VisaTransaction, 
  card: VisaCardProfile
): GeminiAnalysisLog => {
  const isHighRiskMerchant = tx.merchantName.toLowerCase().includes('darknet') || 
                             tx.merchantName.toLowerCase().includes('mixer') ||
                             tx.merchantName.toLowerCase().includes('unverified');
  
  const isFailedKyc = card.kycStatus === 'Failed';
  const isOverLimit = tx.amountFiat > card.availableBalance;

  let riskScore = Math.floor(Math.random() * 30); // Base low risk
  if (isHighRiskMerchant) riskScore += 60;
  if (isFailedKyc) riskScore += 20;
  if (isOverLimit) riskScore += 15;
  if (riskScore > 100) riskScore = 100;

  let fraudClassification: GeminiAnalysisLog['fraudClassification'] = 'Low Risk';
  if (riskScore > 75) fraudClassification = 'Critical Alert';
  else if (riskScore > 50) fraudClassification = 'High Risk';
  else if (riskScore > 25) fraudClassification = 'Medium Risk';

  let complianceStatus: GeminiAnalysisLog['complianceStatus'] = 'Passed';
  if (riskScore > 60) complianceStatus = 'Flagged';
  else if (riskScore > 30) complianceStatus = 'Requires Manual Review';

  let amlCheck: GeminiAnalysisLog['amlCheck'] = 'Clean';
  if (isHighRiskMerchant) amlCheck = 'Suspicious Activity Detected';
  else if (isFailedKyc) amlCheck = 'Suspicious Activity Detected';

  let recommendation = '';
  if (riskScore > 75) {
    recommendation = `CRITICAL ALERT: Gemini AI detected high correlation with illicit patterns. Merchant "${tx.merchantName}" flagged. Cardholder "${card.cardholderName}" has failed KYC. Recommended action: DECLINE immediately and freeze card ${card.id}.`;
  } else if (riskScore > 40) {
    recommendation = `WARNING: Transaction of ${tx.amountFiat} ${tx.currencyFiat} requires manual review. Risk score is elevated due to unusual merchant category or location. Recommended action: Hold settlement for 24 hours or prompt user for biometric verification.`;
  } else {
    recommendation = `APPROVED: Transaction verified. Cardholder "${card.cardholderName}" is in good standing. Crypto-fiat conversion rate of ${tx.exchangeRateUsed} for ${tx.currencyCrypto} is optimal. Rewards of ${card.rewardsRate}% successfully calculated.`;
  }

  return {
    id: `gemini-log-${Math.floor(Math.random() * 1000000)}`,
    transactionId: tx.id,
    riskScore,
    fraudClassification,
    complianceStatus,
    amlCheck,
    category: tx.merchantCategory === 'SovereignWealth' ? 'Sovereign Operations' : 'Standard Web3 Commerce',
    geminiRecommendation: recommendation,
    tokensConsumed: Math.floor(Math.random() * 300) + 250,
    latencyMs: Math.floor(Math.random() * 200) + 100,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generates a new mock Visa transaction and its corresponding Gemini analysis.
 */
export const createMockTransaction = (
  cardId: string,
  merchantName: string,
  merchantCategory: VisaTransaction['merchantCategory'],
  amountFiat: number,
  cards: VisaCardProfile[],
  rates: CryptoFiatRate[]
): { transaction: VisaTransaction; updatedCards: VisaCardProfile[]; geminiLog: GeminiAnalysisLog } => {
  const card = cards.find(c => c.id === cardId) || cards[0];
  const rateObj = rates.find(r => r.asset === card.preferredCryptoAsset) || rates[0];
  
  const amountCrypto = parseFloat((amountFiat / rateObj.rate).toFixed(6));
  const txId = `tx-visa-${Math.floor(Math.random() * 1000000)}`;
  
  const isDeclined = card.status === 'Frozen' || card.status === 'Suspended' || amountFiat > card.availableBalance;

  const transaction: VisaTransaction = {
    id: txId,
    cardId: card.id,
    merchantName,
    merchantCategory,
    amountFiat,
    currencyFiat: 'USD',
    amountCrypto,
    currencyCrypto: card.preferredCryptoAsset,
    exchangeRateUsed: rateObj.rate,
    timestamp: new Date().toISOString(),
    status: isDeclined ? 'Declined' : 'Settled',
    authCode: isDeclined ? 'VS-000000' : `VS-${Math.floor(Math.random() * 900000) + 100000}`,
    networkFeeCrypto: parseFloat((rateObj.asset === 'BTC' ? 0.0001 : rateObj.asset === 'ETH' ? 0.002 : 0.01).toFixed(5)),
    gasPriceGwei: Math.floor(Math.random() * 50) + 15,
    blockchainTxHash: isDeclined ? '0x0000000000000000000000000000000000000000000000000000000000000000' : `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
  };

  const updatedCards = cards.map(c => {
    if (c.id === cardId && !isDeclined) {
      return {
        ...c,
        availableBalance: parseFloat((c.availableBalance - amountFiat).toFixed(2))
      };
    }
    return c;
  });

  const geminiLog = generateGeminiAnalysis(transaction, card);

  return {
    transaction,
    updatedCards,
    geminiLog
  };
};

// ==========================================
// REACT INTEGRATION HOOK
// ==========================================

export const useVisaMockData = () => {
  const [cards, setCards] = useState<VisaCardProfile[]>(initialCardProfiles);
  const [transactions, setTransactions] = useState<VisaTransaction[]>(initialTransactions);
  const [rates, setRates] = useState<CryptoFiatRate[]>(initialRates);
  const [geminiLogs, setGeminiLogs] = useState<GeminiAnalysisLog[]>(initialGeminiLogs);

  // Periodically fluctuate rates to simulate live market feeds
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prevRates => fluctuateRates(prevRates));
    }, 8000); // Fluctuate every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const triggerNewTransaction = useCallback((
    cardId: string,
    merchantName: string,
    merchantCategory: VisaTransaction['merchantCategory'],
    amountFiat: number
  ) => {
    const { transaction, updatedCards, geminiLog } = createMockTransaction(
      cardId,
      merchantName,
      merchantCategory,
      amountFiat,
      cards,
      rates
    );

    setTransactions(prev => [transaction, ...prev]);
    setCards(updatedCards);
    setGeminiLogs(prev => [geminiLog, ...prev]);

    return { transaction, geminiLog };
  }, [cards, rates]);

  const resetMockData = useCallback(() => {
    setCards(initialCardProfiles);
    setTransactions(initialTransactions);
    setRates(initialRates);
    setGeminiLogs(initialGeminiLogs);
  }, []);

  return {
    cards,
    transactions,
    rates,
    geminiLogs,
    triggerNewTransaction,
    resetMockData,
    setCards
  };
};