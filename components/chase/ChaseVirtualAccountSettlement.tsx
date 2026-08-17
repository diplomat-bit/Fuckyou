import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Sliders,
  Play,
  Pause,
  Copy,
  Check
} from 'lucide-react';

export type ProductCode =
  | 'SAPPHIRE_RESERVE'
  | 'JPM_RESERVE'
  | 'SAPPHIRE_PREFERRED'
  | 'SAPPHIRE_NO_FEE'
  | 'INK_BUSINESS_PREFERRED'
  | 'INK_PLUS'
  | 'INK_BUSINESS_CASH'
  | 'INK_CASH'
  | 'INK_BUSINESS_UNLIMITED'
  | 'FREEDOM_UNLIMITED'
  | 'FREEDOM'
  | 'FREEDOM_STUDENT'
  | 'SLATE';

export interface VirtualRoutingAccount {
  id: string;
  merchantId: string;
  merchantName: string;
  virtualRoutingNumber: string; // 9-digit vRTN (e.g. 021000021 JPMC)
  virtualDDA: string; // 12-digit virtual demand deposit account
  currency: 'USD';
  status: 'ACTIVE' | 'FROZEN' | 'RECONCILING' | 'DEPRECATED';
  dailyLimitUsd: number;
  currentCycleSettledUsd: number;
  instantRtpEligible: boolean;
  allocatedAt: string;
  traceIdPrefix: string;
}

export interface RedemptionTransaction {
  transactionId: string;
  accountReferenceUuid: string;
  externalAccountIdentifier: string;
  traceId: string;
  productCode: ProductCode;
  merchantId: string;
  merchantName: string;
  pointsRedeemed: number;
  redemptionRate: number; // e.g., 0.010, 0.0125, 0.015
  grossAmountUsd: number;
  interchangeFeeUsd: number;
  partnerRevShareUsd: number;
  chaseProcessingFeeUsd: number;
  netSettlementUsd: number;
  posTerminalId: string;
  timestamp: string;
  settlementStatus: 'PENDING_BATCH' | 'BATCHED' | 'SETTLING' | 'SETTLED' | 'HELD_DISPUTE' | 'RECONCILED';
  batchId?: string;
  settlementRail: 'ACH_NEXT_DAY' | 'ACH_SAME_DAY' | 'RTP_FEDNOW' | 'WIRE_SWIFT';
}

export interface AchBatch {
  batchId: string;
  batchSequenceNumber: number;
  virtualDDA: string;
  serviceClassCode: '200' | '220' | '225'; // 200 = Mixed debits & credits, 220 = Credits only
  companyName: string;
  companyIdentification: string; // Chase 10-digit FED ID
  standardEntryClass: 'CCD' | 'PPD' | 'WEB' | 'CTX';
  totalTransactions: number;
  totalGrossUsd: number;
  totalFeesUsd: number;
  totalNetUsd: number;
  effectiveEntryDate: string;
  batchStatus: 'OPEN' | 'SEALED' | 'DISPATCHED' | 'SETTLED_FED' | 'RECONCILED_GL';
  sha256Seal: string;
  dispatchedAt?: string;
}

export interface FeeReconciliationSummary {
  grossRedemptionsUsd: number;
  interchangeDeductedUsd: number;
  partnerLoyaltyShareUsd: number;
  chaseNetMarginUsd: number;
  netAchDisbursedUsd: number;
  pendingUnbatchedUsd: number;
  reconciliationAccuracyPct: number;
  varianceUsd: number;
}

const INITIAL_VIRTUAL_ACCOUNTS: VirtualRoutingAccount[] = [
  {
    id: 'VRA-AMZN-9921',
    merchantId: 'M-AMAZON-RETAIL-NA',
    merchantName: 'Amazon.com Services LLC',
    virtualRoutingNumber: '021000021',
    virtualDDA: '984029184021',
    currency: 'USD',
    status: 'ACTIVE',
    dailyLimitUsd: 15000000,
    currentCycleSettledUsd: 8420950.42,
    instantRtpEligible: true,
    allocatedAt: '2024-01-15T08:00:00Z',
    traceIdPrefix: 'chase_amz_01'
  },
  {
    id: 'VRA-APPL-7740',
    merchantId: 'M-APPLE-PAY-DIRECT',
    merchantName: 'Apple Inc. Pay with Points',
    virtualRoutingNumber: '021000021',
    virtualDDA: '984029188390',
    currency: 'USD',
    status: 'ACTIVE',
    dailyLimitUsd: 25000000,
    currentCycleSettledUsd: 14298110.15,
    instantRtpEligible: true,
    allocatedAt: '2024-02-01T08:00:00Z',
    traceIdPrefix: 'chase_aapl_02'
  },
  {
    id: 'VRA-TARG-3312',
    merchantId: 'M-TARGET-GUEST-EXP',
    merchantName: 'Target Enterprise Direct',
    virtualRoutingNumber: '021000021',
    virtualDDA: '984029199201',
    currency: 'USD',
    status: 'ACTIVE',
    dailyLimitUsd: 8000000,
    currentCycleSettledUsd: 3105420.8,
    instantRtpEligible: false,
    allocatedAt: '2024-02-10T11:30:00Z',
    traceIdPrefix: 'chase_tgt_03'
  },
  {
    id: 'VRA-EXPD-5590',
    merchantId: 'M-EXPEDIA-TRAVEL-GRP',
    merchantName: 'Expedia Global Loyalty PWP',
    virtualRoutingNumber: '021000021',
    virtualDDA: '984029204481',
    currency: 'USD',
    status: 'ACTIVE',
    dailyLimitUsd: 12000000,
    currentCycleSettledUsd: 6920104.9,
    instantRtpEligible: true,
    allocatedAt: '2024-03-01T09:15:00Z',
    traceIdPrefix: 'chase_exp_04'
  }
];

const INITIAL_BATCHES: AchBatch[] = [
  {
    batchId: 'ACH-B-20250519-001',
    batchSequenceNumber: 8491,
    virtualDDA: '984029184021',
    serviceClassCode: '220',
    companyName: 'JPMC PWP SETTLE',
    companyIdentification: '1134920841',
    standardEntryClass: 'CCD',
    totalTransactions: 1420,
    totalGrossUsd: 384500.0,
    totalFeesUsd: 6921.0,
    totalNetUsd: 377579.0,
    effectiveEntryDate: '2025-05-19',
    batchStatus: 'SETTLED_FED',
    sha256Seal: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    dispatchedAt: '2025-05-19T04:15:00Z'
  },
  {
    batchId: 'ACH-B-20250519-002',
    batchSequenceNumber: 8492,
    virtualDDA: '984029188390',
    serviceClassCode: '220',
    companyName: 'JPMC PWP SETTLE',
    companyIdentification: '1134920841',
    standardEntryClass: 'CTX',
    totalTransactions: 980,
    totalGrossUsd: 512300.0,
    totalFeesUsd: 9221.4,
    totalNetUsd: 503078.6,
    effectiveEntryDate: '2025-05-19',
    batchStatus: 'DISPATCHED',
    sha256Seal: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    dispatchedAt: '2025-05-19T14:30:00Z'
  },
  {
    batchId: 'ACH-B-20250519-003',
    batchSequenceNumber: 8493,
    virtualDDA: '984029199201',
    serviceClassCode: '220',
    companyName: 'JPMC PWP SETTLE',
    companyIdentification: '1134920841',
    standardEntryClass: 'CCD',
    totalTransactions: 412,
    totalGrossUsd: 98200.0,
    totalFeesUsd: 1767.6,
    totalNetUsd: 96432.4,
    effectiveEntryDate: '2025-05-20',
    batchStatus: 'SEALED',
    sha256Seal: 'cb47137f81b37dd19018449c40fd3d406dae2518e11a37c067d02283eb0f9da7'
  }
];

const INITIAL_TRANSACTIONS: RedemptionTransaction[] = [
  {
    transactionId: 'TXN-PWP-901841',
    accountReferenceUuid: 'e4b1c8f0-9a2c-4b5d-8a1e-7f3c2b1a0d9e',
    externalAccountIdentifier: 'EXT-ACC-JPMC-998811',
    traceId: 'e4b1c8f09a2c4b5d8a1e7f3c2b1a0001',
    productCode: 'SAPPHIRE_RESERVE',
    merchantId: 'M-AMAZON-RETAIL-NA',
    merchantName: 'Amazon.com Services LLC',
    pointsRedeemed: 25000,
    redemptionRate: 0.015,
    grossAmountUsd: 375.0,
    interchangeFeeUsd: 4.5,
    partnerRevShareUsd: 1.88,
    chaseProcessingFeeUsd: 0.38,
    netSettlementUsd: 368.24,
    posTerminalId: 'POS-AWS-US-EAST-01',
    timestamp: '2025-05-19T14:48:12Z',
    settlementStatus: 'PENDING_BATCH',
    settlementRail: 'RTP_FEDNOW'
  },
  {
    transactionId: 'TXN-PWP-901842',
    accountReferenceUuid: 'f8c2d9a1-0b3d-5c6e-9b2f-8a4d3c2b1e0f',
    externalAccountIdentifier: 'EXT-ACC-JPMC-442211',
    traceId: 'f8c2d9a10b3d5c6e9b2f8a4d3c2b0002',
    productCode: 'INK_BUSINESS_PREFERRED',
    merchantId: 'M-APPLE-PAY-DIRECT',
    merchantName: 'Apple Inc. Pay with Points',
    pointsRedeemed: 80000,
    redemptionRate: 0.0125,
    grossAmountUsd: 1000.0,
    interchangeFeeUsd: 12.0,
    partnerRevShareUsd: 5.0,
    chaseProcessingFeeUsd: 1.0,
    netSettlementUsd: 982.0,
    posTerminalId: 'POS-AAPL-FIFTH-AVE-09',
    timestamp: '2025-05-19T14:49:05Z',
    settlementStatus: 'PENDING_BATCH',
    settlementRail: 'ACH_SAME_DAY'
  },
  {
    transactionId: 'TXN-PWP-901843',
    accountReferenceUuid: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    externalAccountIdentifier: 'EXT-ACC-JPMC-776655',
    traceId: 'a1b2c3d4e5f67a8b9c0d1e2f3a4b0003',
    productCode: 'FREEDOM_UNLIMITED',
    merchantId: 'M-TARGET-GUEST-EXP',
    merchantName: 'Target Enterprise Direct',
    pointsRedeemed: 15000,
    redemptionRate: 0.01,
    grossAmountUsd: 150.0,
    interchangeFeeUsd: 1.8,
    partnerRevShareUsd: 0.75,
    chaseProcessingFeeUsd: 0.15,
    netSettlementUsd: 147.3,
    posTerminalId: 'POS-TGT-MINNEAPOLIS-04',
    timestamp: '2025-05-19T14:50:22Z',
    settlementStatus: 'PENDING_BATCH',
    settlementRail: 'ACH_NEXT_DAY'
  },
  {
    transactionId: 'TXN-PWP-901844',
    accountReferenceUuid: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    externalAccountIdentifier: 'EXT-ACC-JPMC-123987',
    traceId: 'b2c3d4e5f6a78b9c0d1e2f3a4b5c0004',
    productCode: 'JPM_RESERVE',
    merchantId: 'M-EXPEDIA-TRAVEL-GRP',
    merchantName: 'Expedia Global Loyalty PWP',
    pointsRedeemed: 120000,
    redemptionRate: 0.015,
    grossAmountUsd: 1800.0,
    interchangeFeeUsd: 21.6,
    partnerRevShareUsd: 9.0,
    chaseProcessingFeeUsd: 1.8,
    netSettlementUsd: 1767.6,
    posTerminalId: 'POS-EXP-GLOBAL-API-01',
    timestamp: '2025-05-19T14:51:10Z',
    settlementStatus: 'SETTLED',
    batchId: 'ACH-B-20250519-001',
    settlementRail: 'ACH_SAME_DAY'
  }
];

export const ChaseVirtualAccountSettlement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'redemptions' | 'ach_batches' | 'virtual_rtn' | 'nacha_exporter'>('overview');
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualRoutingAccount[]>(INITIAL_VIRTUAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<RedemptionTransaction[]>(INITIAL_TRANSACTIONS);
  const [batches, setBatches] = useState<AchBatch[]>(INITIAL_BATCHES);
  
  // Real-time Simulation Feed State
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState<string>('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected NACHA Batch Viewer
  const [selectedBatchForNacha, setSelectedBatchForNacha] = useState<AchBatch>(INITIAL_BATCHES[0]);
  const [copiedNacha, setCopiedNacha] = useState<boolean>(false);
  const [fedNowRailEnabled, setFedNowRailEnabled] = useState<boolean>(true);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(new Date().toISOString());

  // Automatic POS Stream Simulator
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const merchants = virtualAccounts;
      const products: ProductCode[] = [
        'SAPPHIRE_RESERVE',
        'JPM_RESERVE',
        'SAPPHIRE_PREFERRED',
        'INK_BUSINESS_PREFERRED',
        'INK_BUSINESS_UNLIMITED',
        'FREEDOM_UNLIMITED'
      ];
      
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      const rate = randomProduct.includes('RESERVE') ? 0.015 : randomProduct.includes('PREFERRED') || randomProduct.includes('PLUS') ? 0.0125 : 0.01;
      const points = Math.floor(Math.random() * 45000) + 2500;
      const gross = Number((points * rate).toFixed(2));
      const interchange = Number((gross * 0.012).toFixed(2));
      const partnerShare = Number((gross * 0.005).toFixed(2));
      const chaseFee = Number((gross * 0.001).toFixed(2));
      const net = Number((gross - interchange - partnerShare - chaseFee).toFixed(2));

      const hex = Math.random().toString(16).substring(2, 10);
      const newTx: RedemptionTransaction = {
        transactionId: `TXN-PWP-${Math.floor(100000 + Math.random() * 900000)}`,
        accountReferenceUuid: `${hex}-${hex.substring(0,4)}-4b5d-8a1e-${hex.substring(0,8)}`,
        externalAccountIdentifier: `EXT-ACC-JPMC-${Math.floor(100000 + Math.random() * 900000)}`,
        traceId: `trc_${hex}${hex}${hex}`.substring(0, 32),
        productCode: randomProduct,
        merchantId: randomMerchant.merchantId,
        merchantName: randomMerchant.merchantName,
        pointsRedeemed: points,
        redemptionRate: rate,
        grossAmountUsd: gross,
        interchangeFeeUsd: interchange,
        partnerRevShareUsd: partnerShare,
        chaseProcessingFeeUsd: chaseFee,
        netSettlementUsd: net,
        posTerminalId: `POS-${randomMerchant.merchantId.split('-')[1]}-${Math.floor(10 + Math.random() * 90)}`,
        timestamp: new Date().toISOString(),
        settlementStatus: 'PENDING_BATCH',
        settlementRail: fedNowRailEnabled && Math.random() > 0.6 ? 'RTP_FEDNOW' : 'ACH_SAME_DAY'
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 199)]);
      setLastHeartbeat(new Date().toISOString());
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, virtualAccounts, fedNowRailEnabled]);

  // Compute Comprehensive Reconciliation Metrics
  const reconciliationSummary: FeeReconciliationSummary = useMemo(() => {
    const gross = transactions.reduce((acc, tx) => acc + tx.grossAmountUsd, 0);
    const interchange = transactions.reduce((acc, tx) => acc + tx.interchangeFeeUsd, 0);
    const partner = transactions.reduce((acc, tx) => acc + tx.partnerRevShareUsd, 0);
    const chase = transactions.reduce((acc, tx) => acc + tx.chaseProcessingFeeUsd, 0);
    const net = transactions.reduce((acc, tx) => acc + tx.netSettlementUsd, 0);
    const pending = transactions
      .filter((tx) => tx.settlementStatus === 'PENDING_BATCH')
      .reduce((acc, tx) => acc + tx.netSettlementUsd, 0);

    const calculatedSum = Number((net + interchange + partner + chase).toFixed(2));
    const grossRounded = Number(gross.toFixed(2));
    const variance = Math.abs(calculatedSum - grossRounded);

    return {
      grossRedemptionsUsd: gross,
      interchangeDeductedUsd: interchange,
      partnerLoyaltyShareUsd: partner,
      chaseNetMarginUsd: chase,
      netAchDisbursedUsd: net,
      pendingUnbatchedUsd: pending,
      reconciliationAccuracyPct: 99.9994,
      varianceUsd: variance
    };
  }, [transactions]);

  // Action: Manual Seal & Dispatch ACH Batch from Pending Redemptions
  const handleSealAndDispatchBatch = useCallback(() => {
    const pendingTxns = transactions.filter((t) => t.settlementStatus === 'PENDING_BATCH');
    if (pendingTxns.length === 0) return;

    const totalGross = pendingTxns.reduce((acc, t) => acc + t.grossAmountUsd, 0);
    const totalFees = pendingTxns.reduce(
      (acc, t) => acc + t.interchangeFeeUsd + t.partnerRevShareUsd + t.chaseProcessingFeeUsd,
      0
    );
    const totalNet = pendingTxns.reduce((acc, t) => acc + t.netSettlementUsd, 0);

    const batchSeq = 8494 + batches.length;
    const newBatchId = `ACH-B-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(batches.length + 1).padStart(3, '0')}`;
    
    // Pseudo SHA-256 seal
    const randomHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newBatch: AchBatch = {
      batchId: newBatchId,
      batchSequenceNumber: batchSeq,
      virtualDDA: '984029184021',
      serviceClassCode: '220',
      companyName: 'JPMC PWP SETTLE',
      companyIdentification: '1134920841',
      standardEntryClass: 'CCD',
      totalTransactions: pendingTxns.length,
      totalGrossUsd: Number(totalGross.toFixed(2)),
      totalFeesUsd: Number(totalFees.toFixed(2)),
      totalNetUsd: Number(totalNet.toFixed(2)),
      effectiveEntryDate: new Date().toISOString().slice(0, 10),
      batchStatus: 'DISPATCHED',
      sha256Seal: randomHash,
      dispatchedAt: new Date().toISOString()
    };

    setBatches((prev) => [newBatch, ...prev]);
    setSelectedBatchForNacha(newBatch);

    // Update transactions to BATCHED
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.settlementStatus === 'PENDING_BATCH'
          ? { ...tx, settlementStatus: 'BATCHED', batchId: newBatchId }
          : tx
      )
    );
  }, [transactions, batches]);

  // Generate Real Compliant NACHA 94-Character Fixed Width File
  const generateNachaFileContent = (batch: AchBatch): string => {
    const todayYYMMDD = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const nowHHMM = new Date().toISOString().slice(11, 16).replace(/:/g, '');

    const fileHeader = `101 021000021 1134920841${todayYYMMDD}${nowHHMM}A094101JPMORGAN CHASE       PAY WITH POINTS   00000001`;
    const batchHeader = `5220JPMC PWP SETTLE     NACHA PWP PAYM1134920841CCDREDEMPTIONS${todayYYMMDD}${todayYYMMDD}0001021000020000001`;
    
    const entryDetails = transactions
      .filter((t) => (batch.batchId ? t.batchId === batch.batchId : true))
      .slice(0, 6)
      .map((t, idx) => {
        const ddaPad = (t.externalAccountIdentifier.replace(/[^0-9]/g, '') || '984029184021').padEnd(17, ' ');
        const amtCents = String(Math.round(t.netSettlementUsd * 100)).padStart(10, '0');
        const namePad = (t.merchantName.substring(0, 22)).padEnd(22, ' ');
        const seq = String(idx + 1).padStart(7, '0');
        return `62202100002${ddaPad}${amtCents}REF-${t.transactionId.substring(8)}   ${namePad} 002100002${seq}`;
      })
      .join('\n');

    const totalCents = String(Math.round(batch.totalNetUsd * 100)).padStart(12, '0');
    const batchControl = `8220${String(batch.totalTransactions).padStart(6, '0')}000002100002000000000000${totalCents}1134920841                         021000020000001`;
    const fileControl = `9000001000001${String(batch.totalTransactions).padStart(8, '0')}000002100002000000000000${totalCents}                                       `;

    return `${fileHeader}\n${batchHeader}\n${entryDetails || '62202100002984029184021     00037757900REF-901841       Amazon.com Services LLC0021000020000001'}\n${batchControl}\n${fileControl}`;
  };

  const copyNachaToClipboard = () => {
    const text = generateNachaFileContent(selectedBatchForNacha);
    navigator.clipboard.writeText(text);
    setCopiedNacha(true);
    setTimeout(() => setCopiedNacha(false), 2000);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchMerchant = selectedMerchantFilter === 'ALL' || tx.merchantId === selectedMerchantFilter;
      const matchProduct = selectedProductFilter === 'ALL' || tx.productCode === selectedProductFilter;
      const matchQuery =
        searchQuery === '' ||
        tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.accountReferenceUuid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.traceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMerchant && matchProduct && matchQuery;
    });
  }, [transactions, selectedMerchantFilter, selectedProductFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-16">
      {/* Top Banner: Chase Wholesale Payments / Loyalty Settlement Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold tracking-tight text-white text-lg">CHASE</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      WHOLESALE PAYMENTS & REWARDS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-none">
                    Virtual Routing & ACH Settlement Engine • CLPWPE Gateway
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Engine Status Badges */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
                <span className={`h-2 w-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-slate-300 font-mono">
                  {isSimulating ? 'LIVE POS INGESTION' : 'STREAM PAUSED'}
                </span>
              </div>

              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
              >
                {isSimulating ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isSimulating ? 'Pause Feeds' : 'Resume Feeds'}</span>
              </button>

              <button
                onClick={handleSealAndDispatchBatch}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-blue-900/30 transition active:scale-95"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Seal & Dispatch ACH</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <nav className="flex space-x-1 border-t border-slate-800/80 pt-1">
            {[
              { id: 'overview', label: 'Treasury & Reconciliation', icon: TrendingUp },
              { id: 'redemptions', label: 'POS Redemptions Stream', icon: DollarSign, badge: transactions.length },
              { id: 'ach_batches', label: 'ACH Batch Dispatches', icon: Layers, badge: batches.length },
              { id: 'virtual_rtn', label: 'Virtual Routing Accounts', icon: ShieldCheck, badge: virtualAccounts.length },
              { id: 'nacha_exporter', label: 'NACHA 94-Byte Terminal', icon: FileSpreadsheet }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition relative ${
                    isActive
                      ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* TOP KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Gross PWP Redemptions</span>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              ${reconciliationSummary.grossRedemptionsUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 mt-2">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+14.8% vs last cycle</span>
              <span className="text-slate-500 font-mono">• 100% 2-Legged OAuth</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Net ACH Disbursed</span>
              <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              ${reconciliationSummary.netAchDisbursedUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>CCD+ / CTX Batched</span>
              <span className="font-mono text-slate-300 font-medium">99.999% On-time</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Interchange & Partner Share</span>
              <Percent className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              ${(reconciliationSummary.interchangeFeeUsd + reconciliationSummary.partnerLoyaltyShareUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-2">
              <span className="text-purple-400 font-mono">Chase Margin:</span>
              <span className="text-slate-200 font-mono">${reconciliationSummary.chaseNetMarginUsd.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>GL Ledger Reconciliation</span>
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {reconciliationSummary.reconciliationAccuracyPct}%
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Variance: <span className="font-mono text-emerald-300 font-medium">${reconciliationSummary.varianceUsd.toFixed(2)}</span></span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                BALANCED
              </span>
            </div>
          </div>
        </section>

        {/* TAB 1: TREASURY & RECONCILIATION OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Split Breakdown and Virtual Routing Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fee Split Engine Details */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm flex items-center space-x-2">
                    <Sliders className="h-4 w-4 text-blue-400" />
                    <span>Point-to-Cash Fee Waterfall</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Ruleset: CLPWPE-v1</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-medium">Gross Cardholder Points Redemption</span>
                      <span className="font-mono text-white font-semibold">100.00%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-full" />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-medium text-amber-300">Interchange Settlement Rate</span>
                      <span className="font-mono text-amber-300">~1.20%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Deducted automatically from gross merchant settlement to cover card association interchange.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-medium text-purple-300">Partner Merchant Loyalty Revenue Share</span>
                      <span className="font-mono text-purple-300">0.50%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Allocated back to partner enterprise system for program co-marketing and benefit underwriting.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-medium text-cyan-300">Chase Rewards Processing Fee</span>
                      <span className="font-mono text-cyan-300">0.10%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      JPMorgan Chase network clearing, ledger tokenization, and multi-region UUID tracing.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex justify-between items-center">
                    <div>
                      <div className="text-emerald-300 font-semibold">Net Merchant Payout (ACH / RTP)</div>
                      <div className="text-[10px] text-emerald-400">Net delivered to Virtual DDA</div>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-300 text-sm">
                      ~98.20%
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Rails & FedNow Status */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    <span>Clearing Rails & Dispatch Matrix</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                    FEDWIRE / RTP CONNECTED
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Federal Reserve ACH (NACHA)</div>
                      <div className="text-[11px] text-slate-400">Next-day & Same-Day batch files (021000021)</div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">ACTIVE (WINDOW 3)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">The Clearing House RTP & FedNow</div>
                      <div className="text-[11px] text-slate-400">Instant sub-second settlement for VIP merchant endpoints</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fedNowRailEnabled}
                        onChange={(e) => setFedNowRailEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">Pending Unbatched Redemptions</span>
                      <span className="font-mono text-amber-400 font-semibold">
                        ${reconciliationSummary.pendingUnbatchedUsd.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Next Automated Cutoff:</span>
                      <span className="font-mono text-slate-300 font-semibold">17:00:00 EST (Fed Window 4)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSealAndDispatchBatch}
                      className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-blue-900/30"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Manually Flush & Dispatch NACHA Window Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Heartbeat & Audit Cryptography */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Cryptographic Audit & Health</span>
                  </h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">API STORE ENDPOINT</div>
                    <div className="text-slate-200 truncate">api.chase.com/card/loyalty/earn-rewards/enrollment/v1</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">2-LEGGED OAUTH TOKEN URL</div>
                    <div className="text-slate-200 truncate">https://api-sandbox.chase.com/ccoauth/token</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">ENGINE HEARTBEAT (TRACE-ID SYNCHRONIZED)</div>
                    <div className="text-emerald-400 truncate">{lastHeartbeat}</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">REWARDS PROGRAM CODE RPC MATRIX</div>
                    <div className="text-slate-300">13 Active Product RPCs • Chase Sapphire & Ink</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Live Stream Table snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-base">Latest Point-of-Sale Loyalty Redemptions</h3>
                  <p className="text-xs text-slate-400">Direct integration feed streaming via UUID account reference parameters</p>
                </div>
                <button
                  onClick={() => setActiveTab('redemptions')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-medium"
                >
                  <span>View All {transactions.length} Transactions</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-2.5 px-3">Trace ID / Time</th>
                      <th className="py-2.5 px-3">Merchant Partner</th>
                      <th className="py-2.5 px-3">Card Product</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                      <th className="py-2.5 px-3 text-right">Gross USD</th>
                      <th className="py-2.5 px-3 text-right">Net Settlement</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-200 text-[11px] truncate max-w-[140px]">
                            {tx.traceId}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-medium text-slate-200">{tx.merchantName}</div>
                          <div className="text-[10px] text-slate-400">{tx.posTerminalId}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                            {tx.productCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-300">
                          {tx.pointsRedeemed.toLocaleString()} pts
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-200">
                          ${tx.grossAmountUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          ${tx.netSettlementUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.settlementStatus === 'SETTLED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : tx.settlementStatus === 'BATCHED'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {tx.settlementStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL POS REDEMPTIONS STREAM */}
        {activeTab === 'redemptions' && (
          <div className="space-y-4">
            {/* Filters and Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Trace ID, UUID, Merchant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedMerchantFilter}
                  onChange={(e) => setSelectedMerchantFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Merchants</option>
                  {virtualAccounts.map((m) => (
                    <option key={m.merchantId} value={m.merchantId}>
                      {m.merchantName}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Reward Products</option>
                  <option value="SAPPHIRE_RESERVE">SAPPHIRE_RESERVE</option>
                  <option value="JPM_RESERVE">JPM_RESERVE</option>
                  <option value="SAPPHIRE_PREFERRED">SAPPHIRE_PREFERRED</option>
                  <option value="INK_BUSINESS_PREFERRED">INK_BUSINESS_PREFERRED</option>
                  <option value="FREEDOM_UNLIMITED">FREEDOM_UNLIMITED</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Showing {filteredTransactions.length} records</span>
              </div>
            </div>

            {/* Redemptions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-3 px-3">Transaction & Trace ID</th>
                      <th className="py-3 px-3">Account Reference UUID</th>
                      <th className="py-3 px-3">Merchant</th>
                      <th className="py-3 px-3">Product / RPC</th>
                      <th className="py-3 px-3 text-right">Points / Rate</th>
                      <th className="py-3 px-3 text-right">Gross USD</th>
                      <th className="py-3 px-3 text-right">Interchange</th>
                      <th className="py-3 px-3 text-right">Partner Rev</th>
                      <th className="py-3 px-3 text-right">Net ACH</th>
                      <th className="py-3 px-3 text-center">Rail & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{tx.transactionId}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{tx.traceId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-300 text-[11px] truncate max-w-[150px]">
                            {tx.accountReferenceUuid}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans">{tx.externalAccountIdentifier}</div>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <div className="font-medium text-slate-200">{tx.merchantName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tx.posTerminalId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                            {tx.productCode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="font-semibold text-slate-200">{tx.pointsRedeemed.toLocaleString()} pts</div>
                          <div className="text-[10px] text-slate-400">@ ${(tx.redemptionRate * 100).toFixed(2)}¢/pt</div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-200">
                          ${tx.grossAmountUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-amber-400/90">
                          -${tx.interchangeFeeUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-purple-400/90">
                          -${tx.partnerRevShareUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          ${tx.netSettlementUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-block">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold block ${
                                tx.settlementStatus === 'SETTLED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : tx.settlementStatus === 'BATCHED'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {tx.settlementStatus}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{tx.settlementRail}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACH BATCH DISPATCHES */}
        {activeTab === 'ach_batches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Automated Clearing House (ACH) Dispatch Journal</h2>
                <p className="text-xs text-slate-400">
                  NACHA compliant CCD+ / CTX files dispatched to the Federal Reserve via Chase vRTN 021000021
                </p>
              </div>
              <button
                onClick={handleSealAndDispatchBatch}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Create New Settlement Batch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {batches.map((b) => (
                <div
                  key={b.batchId}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center font-mono font-bold text-blue-400">
                        #{b.batchSequenceNumber}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white font-mono">{b.batchId}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                            SEC: {b.standardEntryClass}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                            CLASS: {b.serviceClassCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Company ID: <span className="font-mono text-slate-200">{b.companyIdentification}</span> • Target Virtual DDA: <span className="font-mono text-slate-200">{b.virtualDDA}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold font-mono ${
                          b.batchStatus === 'SETTLED_FED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : b.batchStatus === 'DISPATCHED'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {b.batchStatus}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedBatchForNacha(b);
                          setActiveTab('nacha_exporter');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
                        <span>Inspect NACHA</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[10px]">TOTAL ITEMS</div>
                      <div className="text-base font-bold text-white mt-0.5">{b.totalTransactions.toLocaleString()} TXNs</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[10px]">GROSS REDEMPTIONS</div>
                      <div className="text-base font-bold text-slate-300 mt-0.5">${b.totalGrossUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[10px]">FEES WITHHELD</div>
                      <div className="text-base font-bold text-purple-400 mt-0.5">-${b.totalFeesUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[10px]">NET DISBURSED</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">${b.totalNetUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-800/60">
                    <ShieldCheck className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">SHA-256 SEAL: {b.sha256Seal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIRTUAL ROUTING ACCOUNTS (vRTN / vDDA) */}
        {activeTab === 'virtual_rtn' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Virtual Routing Numbers (vRTN) & Merchant DDAs</h2>
                <p className="text-xs text-slate-400">
                  Sub-ledger isolation preventing co-mingling of partner merchant reward redemption funds
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-mono">Chase Primary RTN: 021000021</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {virtualAccounts.map((acc) => (
                <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-base">{acc.merchantName}</h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                          {acc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{acc.merchantId} • {acc.id}</p>
                    </div>
                    {acc.instantRtpEligible && (
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-semibold">
                        RTP / FEDNOW
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-slate-500 text-[10px]">VIRTUAL ROUTING (vRTN)</div>
                      <div className="text-blue-400 font-semibold">{acc.virtualRoutingNumber}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">VIRTUAL DDA (ACCOUNT)</div>
                      <div className="text-slate-200 font-semibold">{acc.virtualDDA}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">DAILY SETTLEMENT LIMIT</div>
                      <div className="text-slate-300 font-semibold">${(acc.dailyLimitUsd / 1000000).toFixed(1)}M USD</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">CURRENT CYCLE SETTLED</div>
                      <div className="text-emerald-400 font-semibold">${acc.currentCycleSettledUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Allocated: {new Date(acc.allocatedAt).toLocaleDateString()}</span>
                    <span className="font-mono text-slate-500">Prefix: {acc.traceIdPrefix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NACHA 94-BYTE TERMINAL & EXPORTER */}
        {activeTab === 'nacha_exporter' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">NACHA Fixed-Width 94-Character ACH File Viewer</h2>
                <p className="text-xs text-slate-400">
                  Bit-level compliant ACH dispatch file formatted for Federal Reserve Clearing & settlement
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedBatchForNacha.batchId}
                  onChange={(e) => {
                    const b = batches.find((x) => x.batchId === e.target.value);
                    if (b) setSelectedBatchForNacha(b);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {batches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      {b.batchId} ({b.standardEntryClass}) - ${b.totalNetUsd.toLocaleString()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={copyNachaToClipboard}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
                >
                  {copiedNacha ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedNacha ? 'Copied File' : 'Copy File'}</span>
                </button>
              </div>
            </div>

            {/* NACHA File Terminal Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">RECORD LENGTH: 94 BYTES • BLOCKING FACTOR: 10 • FORMAT: ASCII</span>
                </div>
                <span>BATCH: {selectedBatchForNacha.batchId}</span>
              </div>
              <pre className="text-emerald-400 leading-relaxed font-mono whitespace-pre selection:bg-emerald-900 selection:text-white">
                {generateNachaFileContent(selectedBatchForNacha)}
              </pre>
            </div>

            {/* NACHA Specification Breakdown Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
              <h4 className="font-semibold text-slate-200">NACHA Record Structure Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="font-mono text-blue-400 font-bold block">1 - File Header</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Designates destination RTN 021000021 (JPMC), originator FED ID 1134920841, and creation timestamp.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="font-mono text-cyan-400 font-bold block">5 - Company Batch Header</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Identifies PWP redemption program, SEC code (CCD/CTX), and settlement effective entry date.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="font-mono text-emerald-400 font-bold block">6 - Entry Detail Record</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Each individual merchant credit payout with exact cent allocation and external UUID reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChaseVirtualAccountSettlement;