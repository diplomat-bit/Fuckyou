import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, 
  FileText, 
  Shield, 
  DollarSign, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  MapPin, 
  User, 
  Key, 
  Layers, 
  Activity, 
  Upload, 
  Lock, 
  Unlock, 
  RefreshCw, 
  FileCheck, 
  History, 
  Globe, 
  Link, 
  Check, 
  X, 
  ChevronRight, 
  Info, 
  Terminal, 
  Cpu, 
  Database, 
  Map, 
  Code, 
  ExternalLink, 
  Scale, 
  FileSignature 
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Property {
  id: string;
  address: string;
  parcelId: string;
  coordinates: { lat: number; lng: number };
  propertyType: 'Residential' | 'Commercial' | 'Land' | 'Agricultural';
  size: string;
  ownerName: string;
  ownerAddress: string;
  status: 'Verified' | 'Pending' | 'In Escrow' | 'Disputed';
  deedNftAddress: string;
  tokenId: string;
  ipfsHash: string;
  registrationDate: string;
  valuation: number;
  history: Array<{
    event: string;
    from: string;
    to: string;
    price?: string;
    date: string;
    txHash: string;
  }>;
}

interface Escrow {
  id: string;
  propertyId: string;
  buyerAddress: string;
  sellerAddress: string;
  purchasePrice: number;
  depositAmount: number;
  status: 'Created' | 'Funded' | 'Inspected' | 'Approved' | 'Completed' | 'Refunded' | 'Disputed';
  inspectionPeriodDays: number;
  arbitratorAddress: string;
  createdAt: string;
  updatedAt: string;
  txHash: string;
  inspectionApproved: boolean;
  buyerSigned: boolean;
  sellerSigned: boolean;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'contract';
  message: string;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'PROP-001',
    address: 'Plot 1714, Guzape District II, Abuja, Nigeria',
    parcelId: 'FCDA-GZ2-1714',
    coordinates: { lat: 9.0358, lng: 7.5083 },
    propertyType: 'Land',
    size: '100 Hectares',
    ownerName: 'Sovereign Land Trust',
    ownerAddress: '0x71a98C7115f3E2D1124199a1B881a992c71a98C7',
    status: 'Verified',
    deedNftAddress: '0xdeed72100000000000000000000000000000881a',
    tokenId: '1092',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    registrationDate: '2026-01-15',
    valuation: 25000000,
    history: [
      { event: 'Deed Registered', from: 'FCDA Land Registry', to: 'Sovereign Land Trust', price: '$20,000,000', date: '2026-01-15', txHash: '0x88f1a...992c' },
      { event: 'Title Verified', from: 'Sovereign Sentry', to: 'Sovereign Land Trust', date: '2026-01-16', txHash: '0x33a99...ff12' }
    ]
  },
  {
    id: 'PROP-002',
    address: 'Plot 48, Karasana West, Abuja, Nigeria',
    parcelId: 'FCDA-KW-0048',
    coordinates: { lat: 9.1124, lng: 7.3841 },
    propertyType: 'Land',
    size: '13.39 Hectares',
    ownerName: 'Songbird Multimedia Ltd',
    ownerAddress: '0x33a99fF124199a1B881a992c71a98C7115f3E2D1',
    status: 'In Escrow',
    deedNftAddress: '0xdeed72100000000000000000000000000000414b',
    tokenId: '1093',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtY26P4f9SgNvwbK6n1gA',
    registrationDate: '2026-02-10',
    valuation: 4500000,
    history: [
      { event: 'Deed Registered', from: 'FCDA Land Registry', to: 'Songbird Multimedia Ltd', price: '$3,500,000', date: '2026-02-10', txHash: '0x7f83b...99a1' },
      { event: 'Escrow Initiated', from: 'Songbird Multimedia Ltd', to: 'Sovereign Wealth Fund', price: '$4,500,000', date: '2026-08-12', txHash: '0x99a1f...f3e2' }
    ]
  },
  {
    id: 'PROP-003',
    address: '777 Sovereign Way, Penthouse B, Miami, FL, USA',
    parcelId: 'MIA-SOV-777',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    propertyType: 'Residential',
    size: '450 sq meters',
    ownerName: 'Identity Citadel LLC',
    ownerAddress: '0x88f1a992c71a98C7115f3E2D1124199a1B881a99',
    status: 'Verified',
    deedNftAddress: '0xdeed72100000000000000000000000000000992c',
    tokenId: '1094',
    ipfsHash: 'QmT5NvU9z5CZsnA625s3Xf2nemtY26P4f9SgNvwbK6n1gA',
    registrationDate: '2025-11-01',
    valuation: 1200000,
    history: [
      { event: 'Deed Registered', from: 'Miami-Dade County', to: 'Identity Citadel LLC', price: '$1,100,000', date: '2025-11-01', txHash: '0x11a98...39b2' },
      { event: 'Title Verified', from: 'Sovereign Sentry', to: 'Identity Citadel LLC', date: '2025-11-02', txHash: '0x22b99...ee12' }
    ]
  }
];

const INITIAL_ESCROWS: Escrow[] = [
  {
    id: 'ESC-9021',
    propertyId: 'PROP-002',
    buyerAddress: '0xabc123F124199a1B881a992c71a98C7115f3E2D1',
    sellerAddress: '0x33a99fF124199a1B881a992c71a98C7115f3E2D1',
    purchasePrice: 4500000,
    depositAmount: 450000,
    status: 'Funded',
    inspectionPeriodDays: 10,
    arbitratorAddress: '0xScaleSovereignArbitratorContractAddress',
    createdAt: '2026-08-12',
    updatedAt: '2026-08-14',
    txHash: '0x99a1f3e2b99a1f3e2b99a1f3e2b99a1f3e2b99a1f3e2b99a1f3e2b99a1f3e2b9',
    inspectionApproved: false,
    buyerSigned: true,
    sellerSigned: false
  }
];

export default function DeedRegistrar() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'escrow' | 'verify' | 'map' | 'contracts'>('dashboard');
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [escrows, setEscrows] = useState<Escrow[]>(INITIAL_ESCROWS);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(INITIAL_PROPERTIES[0]);
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(INITIAL_ESCROWS[0]);
  
  // Wallet Simulation State
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x99A1f3E2b99a1F3e2B99A1f3E2b99a1F3e2b99A1');
  const [walletBalance, setWalletBalance] = useState<number>(142.50); // SOV tokens
  
  // Form States
  const [newProperty, setNewProperty] = useState({
    address: '',
    parcelId: '',
    lat: '9.0765',
    lng: '7.3986',
    propertyType: 'Land' as Property['propertyType'],
    size: '',
    ownerName: '',
    valuation: '',
    documentName: ''
  });

  const [newEscrow, setNewEscrow] = useState({
    propertyId: '',
    buyerAddress: '',
    purchasePrice: '',
    depositAmount: '',
    inspectionPeriodDays: '10'
  });

  // Verification Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    searched: boolean;
    property: Property | null;
    checks: {
      titleChain: boolean;
      noLiens: boolean;
      taxCompliant: boolean;
      gisVerified: boolean;
      signatureValid: boolean;
    };
  } | null>(null);

  // Simulation & Console Logs State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '10:42:15', type: 'info', message: 'Sovereign Deed Registrar Node initialized.' },
    { timestamp: '10:42:16', type: 'contract', message: 'Listening to Sovereign Ledger Smart Contract: 0xDeedRegistryCoreV1...' },
    { timestamp: '10:42:17', type: 'success', message: 'Connected to IPFS Gateway: https://ipfs.sovereign.io' }
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { timestamp, type, message }]);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  // ==========================================
  // SIMULATED BLOCKCHAIN ACTIONS
  // ==========================================

  // 1. Register New Deed (Mint NFT)
  const handleRegisterDeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      addLog('Error: Wallet not connected. Cannot sign transaction.', 'error');
      return;
    }
    if (!newProperty.address || !newProperty.parcelId || !newProperty.size || !newProperty.ownerName) {
      addLog('Error: Please fill in all required fields.', 'error');
      return;
    }

    setIsSimulating(true);
    setSimulationStep('Hashing Deed Document...');
    addLog(`Initiating registration for Parcel: ${newProperty.parcelId}`, 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    const simulatedIpfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    addLog(`IPFS Document Hash generated: ${simulatedIpfsHash}`, 'success');
    
    setSimulationStep('Generating Cryptographic Proof...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    addLog('Zero-Knowledge ownership proof generated successfully.', 'success');

    setSimulationStep('Minting Deed NFT on Sovereign Ledger...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTokenId = (1000 + properties.length + 1).toString();
    const newDeedNftAddress = '0xdeed72100000000000000000000000000000' + Math.random().toString(16).substring(2, 6);
    const txHash = '0x' + Math.random().toString(16).substring(2, 18) + '...mint';

    const createdProperty: Property = {
      id: `PROP-00${properties.length + 1}`,
      address: newProperty.address,
      parcelId: newProperty.parcelId,
      coordinates: { lat: parseFloat(newProperty.lat), lng: parseFloat(newProperty.lng) },
      propertyType: newProperty.propertyType,
      size: newProperty.size,
      ownerName: newProperty.ownerName,
      ownerAddress: walletAddress,
      status: 'Verified',
      deedNftAddress: newDeedNftAddress,
      tokenId: newTokenId,
      ipfsHash: simulatedIpfsHash,
      registrationDate: new Date().toISOString().split('T')[0],
      valuation: parseFloat(newProperty.valuation) || 500000,
      history: [
        {
          event: 'Deed Registered & Minted',
          from: 'Sovereign Land Authority',
          to: newProperty.ownerName,
          price: newProperty.valuation ? formatCurrency(parseFloat(newProperty.valuation)) : 'N/A',
          date: new Date().toISOString().split('T')[0],
          txHash: txHash
        }
      ]
    };

    setProperties(prev => [createdProperty, ...prev]);
    setSelectedProperty(createdProperty);
    setWalletBalance(prev => prev - 0.05); // Small gas fee
    
    addLog(`Smart Contract Event: DeedNFTMinted(tokenId: ${newTokenId}, owner: ${walletAddress})`, 'contract');
    addLog(`Property successfully registered! Tx: ${txHash}`, 'success');
    
    setIsSimulating(false);
    setSimulationStep('');
    
    // Reset form
    setNewProperty({
      address: '',
      parcelId: '',
      lat: '9.0765',
      lng: '7.3986',
      propertyType: 'Land',
      size: '',
      ownerName: '',
      valuation: '',
      documentName: ''
    });
    
    setActiveTab('dashboard');
  };

  // 2. Initiate Smart Contract Escrow
  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      addLog('Error: Wallet not connected.', 'error');
      return;
    }
    if (!newEscrow.propertyId || !newEscrow.buyerAddress || !newEscrow.purchasePrice || !newEscrow.depositAmount) {
      addLog('Error: Please fill in all escrow fields.', 'error');
      return;
    }

    const targetProp = properties.find(p => p.id === newEscrow.propertyId);
    if (!targetProp) {
      addLog('Error: Selected property not found.', 'error');
      return;
    }

    setIsSimulating(true);
    setSimulationStep('Deploying Escrow Smart Contract...');
    addLog(`Deploying Escrow Contract for Property: ${targetProp.parcelId}`, 'info');

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const escrowId = `ESC-${Math.floor(9000 + Math.random() * 1000)}`;
    const txHash = '0x' + Math.random().toString(16).substring(2, 18) + '...escrow';

    const createdEscrow: Escrow = {
      id: escrowId,
      propertyId: newEscrow.propertyId,
      buyerAddress: newEscrow.buyerAddress,
      sellerAddress: targetProp.ownerAddress,
      purchasePrice: parseFloat(newEscrow.purchasePrice),
      depositAmount: parseFloat(newEscrow.depositAmount),
      status: 'Created',
      inspectionPeriodDays: parseInt(newEscrow.inspectionPeriodDays),
      arbitratorAddress: '0xScaleSovereignArbitratorContractAddress',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      txHash: txHash,
      inspectionApproved: false,
      buyerSigned: true,
      sellerSigned: false
    };

    // Update property status to 'In Escrow'
    setProperties(prev => prev.map(p => p.id === targetProp.id ? { ...p, status: 'In Escrow' } : p));
    setEscrows(prev => [createdEscrow, ...prev]);
    setSelectedEscrow(createdEscrow);
    setWalletBalance(prev => prev - 0.1); // Gas fee

    addLog(`Smart Contract Deployed: EscrowContract(${escrowId}) at 0x${Math.random().toString(16).substring(2, 10)}...`, 'contract');
    addLog(`Escrow successfully created! Status: Created. Tx: ${txHash}`, 'success');

    setIsSimulating(false);
    setSimulationStep('');
    
    // Reset form
    setNewEscrow({
      propertyId: '',
      buyerAddress: '',
      purchasePrice: '',
      depositAmount: '',
      inspectionPeriodDays: '10'
    });

    setActiveTab('escrow');
  };

  // 3. Fund Escrow (Simulated Buyer Action)
  const handleFundEscrow = async (escrowId: string) => {
    setIsSimulating(true);
    setSimulationStep('Transferring Funds to Escrow Vault...');
    addLog(`Funding Escrow ${escrowId} with deposit amount...`, 'info');

    await new Promise(resolve => setTimeout(resolve, 1500));

    setEscrows(prev => prev.map(esc => {
      if (esc.id === escrowId) {
        const updated = { ...esc, status: 'Funded' as const, updatedAt: new Date().toISOString().split('T')[0] };
        setSelectedEscrow(updated);
        return updated;
      }
      return esc;
    }));

    addLog(`Smart Contract Event: EscrowFunded(escrowId: ${escrowId}, amount: Funded)`, 'contract');
    addLog(`Escrow ${escrowId} successfully funded! Status: Funded.`, 'success');
    setIsSimulating(false);
    setSimulationStep('');
  };

  // 4. Approve Inspection (Simulated Buyer/Inspector Action)
  const handleApproveInspection = async (escrowId: string) => {
    setIsSimulating(true);
    setSimulationStep('Verifying Inspection Reports & Signatures...');
    addLog(`Submitting inspection approval for Escrow ${escrowId}...`, 'info');

    await new Promise(resolve => setTimeout(resolve, 1200));

    setEscrows(prev => prev.map(esc => {
      if (esc.id === escrowId) {
        const updated = { 
          ...esc, 
          inspectionApproved: true, 
          status: 'Inspected' as const,
          updatedAt: new Date().toISOString().split('T')[0] 
        };
        setSelectedEscrow(updated);
        return updated;
      }
      return esc;
    }));

    addLog(`Smart Contract Event: InspectionApproved(escrowId: ${escrowId})`, 'contract');
    addLog(`Inspection approved for Escrow ${escrowId}. Status: Inspected.`, 'success');
    setIsSimulating(false);
    setSimulationStep('');
  };

  // 5. Sign Escrow (Simulated Seller Action)
  const handleSellerSign = async (escrowId: string) => {
    setIsSimulating(true);
    setSimulationStep('Signing Escrow Agreement...');
    addLog(`Seller signing Escrow ${escrowId}...`, 'info');

    await new Promise(resolve => setTimeout(resolve, 1000));

    setEscrows(prev => prev.map(esc => {
      if (esc.id === escrowId) {
        const updated = { 
          ...esc, 
          sellerSigned: true, 
          status: esc.buyerSigned && esc.inspectionApproved ? 'Approved' as const : esc.status,
          updatedAt: new Date().toISOString().split('T')[0] 
        };
        setSelectedEscrow(updated);
        return updated;
      }
      return esc;
    }));

    addLog(`Smart Contract Event: SellerSigned(escrowId: ${escrowId})`, 'contract');
    addLog(`Seller signature recorded for Escrow ${escrowId}.`, 'success');
    setIsSimulating(false);
    setSimulationStep('');
  };

  // 6. Complete Escrow & Transfer Deed NFT
  const handleCompleteEscrow = async (escrowId: string) => {
    const esc = escrows.find(e => e.id === escrowId);
    if (!esc) return;

    const prop = properties.find(p => p.id === esc.propertyId);
    if (!prop) return;

    setIsSimulating(true);
    setSimulationStep('Executing Atomic Swap (Funds <-> Deed NFT)...');
    addLog(`Executing final settlement for Escrow ${escrowId}...`, 'info');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const txHash = '0x' + Math.random().toString(16).substring(2, 18) + '...settle';
    const today = new Date().toISOString().split('T')[0];

    // Update Escrow Status
    setEscrows(prev => prev.map(e => {
      if (e.id === escrowId) {
        const updated = { ...e, status: 'Completed' as const, updatedAt: today };
        setSelectedEscrow(updated);
        return updated;
      }
      return e;
    }));

    // Update Property Owner & Status
    setProperties(prev => prev.map(p => {
      if (p.id === esc.propertyId) {
        const updatedHistory = [
          {
            event: 'Ownership Transferred (Escrow)',
            from: p.ownerName,
            to: 'Sovereign Wealth Fund (Buyer)',
            price: formatCurrency(esc.purchasePrice),
            date: today,
            txHash: txHash
          },
          ...p.history
        ];
        const updated = {
          ...p,
          ownerName: 'Sovereign Wealth Fund',
          ownerAddress: esc.buyerAddress,
          status: 'Verified' as const,
          history: updatedHistory
        };
        if (selectedProperty?.id === p.id) {
          setSelectedProperty(updated);
        }
        return updated;
      }
      return p;
    }));

    addLog(`Smart Contract Event: EscrowCompleted(escrowId: ${escrowId}, buyer: ${esc.buyerAddress}, seller: ${esc.sellerAddress})`, 'contract');
    addLog(`Smart Contract Event: DeedNFTTransferred(tokenId: ${prop.tokenId}, from: ${esc.sellerAddress}, to: ${esc.buyerAddress})`, 'contract');
    addLog(`Atomic Swap Successful! Deed NFT transferred and funds released. Tx: ${txHash}`, 'success');

    setIsSimulating(false);
    setSimulationStep('');
  };

  // 7. Verify Property Search
  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    addLog(`Searching registry for query: "${searchQuery}"`, 'info');
    const found = properties.find(p => 
      p.parcelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tokenId === searchQuery ||
      p.ownerAddress.toLowerCase() === searchQuery.toLowerCase()
    );

    if (found) {
      addLog(`Property found: ${found.parcelId}. Running cryptographic verification...`, 'success');
      setVerificationResult({
        searched: true,
        property: found,
        checks: {
          titleChain: true,
          noLiens: found.status !== 'Disputed',
          taxCompliant: true,
          gisVerified: true,
          signatureValid: true
        }
      });
    } else {
      addLog(`No registered property found matching query: "${searchQuery}"`, 'warning');
      setVerificationResult({
        searched: true,
        property: null,
        checks: {
          titleChain: false,
          noLiens: false,
          taxCompliant: false,
          gisVerified: false,
          signatureValid: false
        }
      });
    }
  };

  // ==========================================
  // RENDER SUB-COMPONENTS
  // ==========================================

  // Interactive SVG Map of Parcels
  const renderGISMap = () => {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Sovereign GIS Live
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Map className="w-5 h-5 text-emerald-400" />
          Interactive Sovereign Land Registry Map
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Canvas Area */}
          <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center min-h-[350px] relative">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
            
            {/* Holographic SVG Map */}
            <svg viewBox="0 0 800 500" className="w-full h-full max-h-[400px] z-10 relative">
              {/* Roads / Infrastructure */}
              <path d="M 50 250 Q 400 200 750 250" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
              <path d="M 400 50 Q 420 250 400 450" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
              
              {/* Parcel 1: Guzape II */}
              <g 
                className="cursor-pointer group" 
                onClick={() => {
                  const p = properties.find(x => x.id === 'PROP-001');
                  if (p) setSelectedProperty(p);
                }}
              >
                <polygon 
                  points="100,100 300,80 280,220 120,240" 
                  fill={selectedProperty?.id === 'PROP-001' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.4)'}
                  stroke={selectedProperty?.id === 'PROP-001' ? '#10b981' : '#475569'}
                  strokeWidth={selectedProperty?.id === 'PROP-001' ? '3' : '1.5'}
                  className="transition-all duration-300 group-hover:fill-emerald-500/10"
                />
                <text x="190" y="160" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                  FCDA-GZ2-1714
                </text>
                <text x="190" y="180" fill="#10b981" fontSize="10" textAnchor="middle" className="pointer-events-none">
                  100 Ha (Verified)
                </text>
              </g>

              {/* Parcel 2: Karasana West */}
              <g 
                className="cursor-pointer group" 
                onClick={() => {
                  const p = properties.find(x => x.id === 'PROP-002');
                  if (p) setSelectedProperty(p);
                }}
              >
                <polygon 
                  points="450,120 650,100 680,250 480,280" 
                  fill={selectedProperty?.id === 'PROP-002' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.4)'}
                  stroke={selectedProperty?.id === 'PROP-002' ? '#f59e0b' : '#475569'}
                  strokeWidth={selectedProperty?.id === 'PROP-002' ? '3' : '1.5'}
                  className="transition-all duration-300 group-hover:fill-amber-500/10"
                />
                <text x="560" y="180" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                  FCDA-KW-0048
                </text>
                <text x="560" y="200" fill="#f59e0b" fontSize="10" textAnchor="middle" className="pointer-events-none">
                  13.39 Ha (In Escrow)
                </text>
              </g>

              {/* Parcel 3: Miami Penthouse (Simulated representation on grid) */}
              <g 
                className="cursor-pointer group" 
                onClick={() => {
                  const p = properties.find(x => x.id === 'PROP-003');
                  if (p) setSelectedProperty(p);
                }}
              >
                <rect 
                  x="250" y="320" width="180" height="120" rx="8"
                  fill={selectedProperty?.id === 'PROP-003' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.4)'}
                  stroke={selectedProperty?.id === 'PROP-003' ? '#10b981' : '#475569'}
                  strokeWidth={selectedProperty?.id === 'PROP-003' ? '3' : '1.5'}
                  className="transition-all duration-300 group-hover:fill-emerald-500/10"
                />
                <text x="340" y="370" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                  MIA-SOV-777
                </text>
                <text x="340" y="390" fill="#10b981" fontSize="10" textAnchor="middle" className="pointer-events-none">
                  450 m² (Verified)
                </text>
              </g>
            </svg>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-slate-400 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800">
              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-emerald-400" /> Click on any parcel to inspect deed metadata.</span>
              <span className="text-slate-500">Projection: EPSG:3857</span>
            </div>
          </div>

          {/* Parcel Details Panel */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
            {selectedProperty ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                      {selectedProperty.propertyType}
                    </span>
                    <h4 className="text-lg font-bold text-slate-100 mt-1.5">{selectedProperty.parcelId}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    selectedProperty.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    selectedProperty.status === 'In Escrow' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedProperty.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-sm border-t border-b border-slate-800/60 py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-slate-200 text-right max-w-[180px] truncate">{selectedProperty.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Size:</span>
                    <span className="text-slate-200">{selectedProperty.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valuation:</span>
                    <span className="text-slate-200 font-semibold text-emerald-400">{formatCurrency(selectedProperty.valuation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Owner:</span>
                    <span className="text-slate-200 font-mono text-xs">{formatAddress(selectedProperty.ownerAddress)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deed NFT ID:</span>
                    <span className="text-slate-200 font-mono text-xs">#{selectedProperty.tokenId}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">IPFS Metadata Hash</span>
                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800 text-xs font-mono text-slate-300">
                    <span className="truncate max-w-[180px]">{selectedProperty.ipfsHash}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                  </div>
                </div>

                <div className="pt-2">
                  {selectedProperty.status === 'Verified' && (
                    <button 
                      onClick={() => {
                        setNewEscrow(prev => ({ ...prev, propertyId: selectedProperty.id }));
                        setActiveTab('escrow');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-900/20"
                    >
                      <DollarSign className="w-4 h-4" />
                      Initiate Escrow Sale
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a parcel on the map to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Smart Contract Code Viewer
  const renderContractsTab = () => {
    const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SovereignDeedRegistry is ERC721, ReentrancyGuard {
    struct DeedMetadata {
        string parcelId;
        string ipfsHash;
        uint256 valuation;
        bool isVerified;
    }

    mapping(uint256 => DeedMetadata) public deeds;
    address public registryAdmin;

    event DeedMinted(uint256 indexed tokenId, address indexed owner, string parcelId);
    event DeedTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("SovereignDeedNFT", "SOV-DEED") {
        registryAdmin = msg.sender;
    }

    function mintDeed(
        address to,
        uint256 tokenId,
        string memory parcelId,
        string memory ipfsHash,
        uint256 valuation
    ) external {
        require(msg.sender == registryAdmin, "Only admin can mint deeds");
        _safeMint(to, tokenId);
        deeds[tokenId] = DeedMetadata(parcelId, ipfsHash, valuation, true);
        emit DeedMinted(tokenId, to, parcelId);
    }
}`;

    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          Sovereign Smart Contract ABI & Source
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          The Sovereign Real Estate Deed Registry operates on immutable smart contracts. Below is the verified Solidity source code governing the minting, verification, and escrow of deed NFTs.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[450px]">
            <pre>{solidityCode}</pre>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Contract Parameters
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Registry Address:</span>
                  <span className="text-emerald-400 font-mono">0xDeedReg...881a</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Escrow Factory:</span>
                  <span className="text-emerald-400 font-mono">0xEscrow...992c</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-slate-200">Sovereign Ledger Mainnet</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Consensus:</span>
                  <span className="text-slate-200">Proof of Authority (PoA)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-400" />
                Legal Compliance
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All smart contract actions are cryptographically bound to physical land registry laws under the Sovereign Land Act of 2026. Digital signatures represent legally binding execution of property transfers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN COMPONENT RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header / Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Home className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Sovereign Deed Registrar</h1>
              <p className="text-sm text-slate-400">On-chain real estate title registry, smart contract escrow, and cryptographic verification.</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400">Sovereign Identity</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{formatAddress(walletAddress)}</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Balance</span>
            <span className="text-sm font-bold text-slate-200">{walletBalance.toFixed(2)} SOV</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'register' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          Register New Deed
        </button>
        <button 
          onClick={() => setActiveTab('escrow')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'escrow' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Escrow Hub
        </button>
        <button 
          onClick={() => setActiveTab('verify')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'verify' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          Verification Engine
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'map' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Map className="w-4 h-4" />
          GIS Parcel Map
        </button>
        <button 
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'contracts' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
          }`}
        >
          <Code className="w-4 h-4" />
          Smart Contracts
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left 3 Columns: Active Tab Content */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Total Registered Properties</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-100">{properties.length}</span>
                    <span className="text-xs text-emerald-400 font-medium">+100% on-chain</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Active Escrows</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-amber-400">{escrows.filter(e => e.status !== 'Completed' && e.status !== 'Refunded').length}</span>
                    <span className="text-xs text-slate-400">Awaiting settlement</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Total Registry Valuation</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(properties.reduce((acc, curr) => acc + curr.valuation, 0))}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Registry Integrity</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-emerald-400">100%</span>
                    <span className="text-xs text-slate-400">Zero title fraud</span>
                  </div>
                </div>
              </div>

              {/* Properties List */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    Registered Sovereign Properties
                  </h3>
                  <button 
                    onClick={() => setActiveTab('register')}
                    className="px-3.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Property
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Parcel ID</th>
                        <th className="py-3 px-4">Address</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Valuation</th>
                        <th className="py-3 px-4">Owner</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {properties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{prop.parcelId}</td>
                          <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">{prop.address}</td>
                          <td className="py-3.5 px-4 text-slate-400">{prop.size}</td>
                          <td className="py-3.5 px-4 text-emerald-400 font-semibold">{formatCurrency(prop.valuation)}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{formatAddress(prop.ownerAddress)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              prop.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              prop.status === 'In Escrow' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {prop.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedProperty(prop);
                                setActiveTab('map');
                              }}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                              title="View on Map"
                            >
                              <Map className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. REGISTER NEW DEED TAB */}
          {activeTab === 'register' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-400" />
                Register New Property Deed
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Mint a legally binding Deed NFT representing physical land ownership. This process hashes the physical deed document, generates a zero-knowledge ownership proof, and registers the asset on the Sovereign Ledger.
              </p>

              <form onSubmit={handleRegisterDeed} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Plot 1714, Guzape District II, Abuja" 
                      value={newProperty.address}
                      onChange={e => setNewProperty(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parcel ID (APN / Cadastral Code)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. FCDA-GZ2-1714" 
                      value={newProperty.parcelId}
                      onChange={e => setNewProperty(prev => ({ ...prev, parcelId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Type</label>
                    <select 
                      value={newProperty.propertyType}
                      onChange={e => setNewProperty(prev => ({ ...prev, propertyType: e.target.value as Property['propertyType'] }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="Land">Land / Plot</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Agricultural">Agricultural</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Size (e.g. Hectares, Sq Meters)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 100 Hectares" 
                      value={newProperty.size}
                      onChange={e => setNewProperty(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sovereign Land Trust" 
                      value={newProperty.ownerName}
                      onChange={e => setNewProperty(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Valuation (USD)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 25000000" 
                      value={newProperty.valuation}
                      onChange={e => setNewProperty(prev => ({ ...prev, valuation: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latitude Coordinate</label>
                    <input 
                      type="text" 
                      value={newProperty.lat}
                      onChange={e => setNewProperty(prev => ({ ...prev, lat: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Longitude Coordinate</label>
                    <input 
                      type="text" 
                      value={newProperty.lng}
                      onChange={e => setNewProperty(prev => ({ ...prev, lng: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Document Upload Simulation */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload Physical Deed Document (PDF/Scan)</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/50">
                    <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                    <span className="text-sm text-slate-300 block font-medium">Drag & drop or click to upload</span>
                    <span className="text-xs text-slate-500 mt-1 block">Supports PDF, PNG, JPG up to 20MB. Document will be hashed on-chain.</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('dashboard')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl transition-all text-sm border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSimulating}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium rounded-xl transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {simulationStep || 'Processing...'}
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        Mint Deed NFT & Register
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. ESCROW HUB TAB */}
          {activeTab === 'escrow' && (
            <div className="space-y-8">
              {/* Escrow Management Panel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      Smart Contract Escrow Hub
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Securely buy and sell real estate using automated, multi-signature escrow contracts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Escrow List */}
                  <div className="space-y-3 lg:col-span-1 border-r border-slate-800/60 pr-0 lg:pr-6">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Active Escrows</span>
                    {escrows.map(esc => {
                      const prop = properties.find(p => p.id === esc.propertyId);
                      return (
                        <div 
                          key={esc.id}
                          onClick={() => setSelectedEscrow(esc)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedEscrow?.id === esc.id 
                              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md' 
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-slate-200 text-sm">{esc.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              esc.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              esc.status === 'Funded' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {esc.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-400 mt-2 truncate">{prop?.address}</h4>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900">
                            <span className="text-xs text-slate-500">Price:</span>
                            <span className="text-sm font-bold text-emerald-400">{formatCurrency(esc.purchasePrice)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Create Escrow Trigger */}
                    <div className="pt-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Initiate New Escrow</h4>
                      <form onSubmit={handleCreateEscrow} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Select Property</label>
                          <select 
                            value={newEscrow.propertyId}
                            onChange={e => setNewEscrow(prev => ({ ...prev, propertyId: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            required
                          >
                            <option value="">-- Select Property --</option>
                            {properties.filter(p => p.status === 'Verified').map(p => (
                              <option key={p.id} value={p.id}>{p.parcelId} ({p.size})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Buyer Wallet Address</label>
                          <input 
                            type="text" 
                            placeholder="0xBuyer..." 
                            value={newEscrow.buyerAddress}
                            onChange={e => setNewEscrow(prev => ({ ...prev, buyerAddress: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Price (USD)</label>
                            <input 
                              type="number" 
                              placeholder="4500000" 
                              value={newEscrow.purchasePrice}
                              onChange={e => setNewEscrow(prev => ({ ...prev, purchasePrice: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Deposit (USD)</label>
                            <input 
                              type="number" 
                              placeholder="450000" 
                              value={newEscrow.depositAmount}
                              onChange={e => setNewEscrow(prev => ({ ...prev, depositAmount: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                              required
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={isSimulating}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Deploy Escrow Contract
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Escrow Details & Interactive Actions */}
                  <div className="lg:col-span-2 space-y-6">
                    {selectedEscrow ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-slate-400">Active Escrow Contract</span>
                            <h4 className="text-xl font-bold text-slate-100 mt-1">{selectedEscrow.id}</h4>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            selectedEscrow.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            selectedEscrow.status === 'Funded' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {selectedEscrow.status}
                          </span>
                        </div>

                        {/* Escrow Progress Steps */}
                        <div className="grid grid-cols-4 gap-2 relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
                          
                          <div className="z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              ['Created', 'Funded', 'Inspected', 'Approved', 'Completed'].includes(selectedEscrow.status)
                                ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>1</div>
                            <span className="text-[10px] text-slate-400 mt-1">Created</span>
                          </div>

                          <div className="z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              ['Funded', 'Inspected', 'Approved', 'Completed'].includes(selectedEscrow.status)
                                ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>2</div>
                            <span className="text-[10px] text-slate-400 mt-1">Funded</span>
                          </div>

                          <div className="z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              ['Inspected', 'Approved', 'Completed'].includes(selectedEscrow.status)
                                ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>3</div>
                            <span className="text-[10px] text-slate-400 mt-1">Inspected</span>
                          </div>

                          <div className="z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              selectedEscrow.status === 'Completed'
                                ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}>4</div>
                            <span className="text-[10px] text-slate-400 mt-1">Settled</span>
                          </div>
                        </div>

                        {/* Escrow Financials */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-xs text-slate-400">Purchase Price</span>
                            <p className="text-lg font-bold text-slate-100 mt-1">{formatCurrency(selectedEscrow.purchasePrice)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400">Required Deposit (10%)</span>
                            <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(selectedEscrow.depositAmount)}</p>
                          </div>
                        </div>

                        {/* Multi-Sig Signatures Status */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multi-Signature & Verification Checklist</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-xs text-slate-300">Buyer Signature</span>
                              {selectedEscrow.buyerSigned ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-400" />
                              )}
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-xs text-slate-300">Seller Signature</span>
                              {selectedEscrow.sellerSigned ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-400" />
                              )}
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-xs text-slate-300">Inspection Approved</span>
                              {selectedEscrow.inspectionApproved ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Actions Panel */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escrow Smart Contract Actions</h5>
                          
                          <div className="flex flex-wrap gap-3">
                            {selectedEscrow.status === 'Created' && (
                              <button 
                                onClick={() => handleFundEscrow(selectedEscrow.id)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                              >
                                <DollarSign className="w-4 h-4" /> Fund Escrow Deposit
                              </button>
                            )}

                            {selectedEscrow.status === 'Funded' && (
                              <button 
                                onClick={() => handleApproveInspection(selectedEscrow.id)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                              >
                                <Check className="w-4 h-4" /> Approve Inspection Report
                              </button>
                            )}

                            {selectedEscrow.status === 'Inspected' && !selectedEscrow.sellerSigned && (
                              <button 
                                onClick={() => handleSellerSign(selectedEscrow.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                              >
                                <FileSignature className="w-4 h-4" /> Sign Escrow (Seller)
                              </button>
                            )}

                            {selectedEscrow.buyerSigned && selectedEscrow.sellerSigned && selectedEscrow.inspectionApproved && selectedEscrow.status !== 'Completed' && (
                              <button 
                                onClick={() => handleCompleteEscrow(selectedEscrow.id)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 animate-pulse"
                              >
                                <CheckCircle className="w-4 h-4" /> Execute Atomic Settlement
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Select an escrow contract to view details and execute actions.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. VERIFICATION ENGINE TAB */}
          {activeTab === 'verify' && (
            <div className="space-y-8">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Sovereign Title Verification Engine
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Verify property ownership, check for active liens, validate cryptographic signatures, and inspect the complete chain of title history.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleVerifySearch} className="flex gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search by Parcel ID, Deed NFT Token ID, or Owner Wallet Address..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    Verify Title
                  </button>
                </form>

                {/* Verification Results */}
                {verificationResult && (
                  <div className="space-y-6">
                    {verificationResult.property ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Verification Checklist */}
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            Cryptographic Checklist
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800/60">
                              <span className="text-xs text-slate-300">Chain of Title Integrity</span>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Verified
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800/60">
                              <span className="text-xs text-slate-300">Lien & Encumbrance Check</span>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Clear
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800/60">
                              <span className="text-xs text-slate-300">Tax Compliance Status</span>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Compliant
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800/60">
                              <span className="text-xs text-slate-300">GIS Boundary Verification</span>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Match
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800/60">
                              <span className="text-xs text-slate-300">Sovereign Signature Validity</span>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Valid
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Property Details */}
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            Property Metadata
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-400">Parcel ID:</span>
                              <span className="text-slate-200 font-mono font-bold">{verificationResult.property.parcelId}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-400">Deed NFT Address:</span>
                              <span className="text-slate-200 font-mono">{formatAddress(verificationResult.property.deedNftAddress)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-400">Token ID:</span>
                              <span className="text-slate-200 font-mono">#{verificationResult.property.tokenId}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-400">Current Owner:</span>
                              <span className="text-slate-200 font-mono">{formatAddress(verificationResult.property.ownerAddress)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">IPFS Hash:</span>
                              <span className="text-slate-200 font-mono truncate max-w-[120px]">{verificationResult.property.ipfsHash}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Chain of Title Timeline */}
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            <History className="w-4 h-4 text-emerald-400" />
                            Chain of Title History
                          </h4>
                          <div className="relative pl-4 border-l border-slate-800 space-y-4">
                            {verificationResult.property.history.map((hist, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></div>
                                <span className="text-[10px] text-slate-500 block">{hist.date}</span>
                                <span className="text-xs font-bold text-slate-200 block">{hist.event}</span>
                                <span className="text-[10px] text-slate-400 block">From: {formatAddress(hist.from)} → To: {formatAddress(hist.to)}</span>
                                {hist.price && <span className="text-xs font-semibold text-emerald-400 block mt-0.5">{hist.price}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-xl text-center">
                        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-rose-400">Verification Failed</h4>
                        <p className="text-sm text-slate-400 mt-1">No registered property or deed NFT matches the provided query. Please check the parcel ID or wallet address and try again.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. GIS PARCEL MAP TAB */}
          {activeTab === 'map' && renderGISMap()}

          {/* 6. SMART CONTRACTS TAB */}
          {activeTab === 'contracts' && renderContractsTab()}

        </div>

        {/* Right Column: Live Simulation Console */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col h-[550px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/60">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Sovereign Ledger Console
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Console Logs Area */}
            <div className="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2.5 border border-slate-800/60">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                  {log.type === 'success' && <span className="text-emerald-400">[SUCCESS] {log.message}</span>}
                  {log.type === 'error' && <span className="text-rose-400">[ERROR] {log.message}</span>}
                  {log.type === 'warning' && <span className="text-amber-400">[WARN] {log.message}</span>}
                  {log.type === 'contract' && <span className="text-blue-400">[CONTRACT] {log.message}</span>}
                  {log.type === 'info' && <span className="text-slate-300">[INFO] {log.message}</span>}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>

            {/* Console Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Node: mainnet-node-01</span>
              <button 
                onClick={() => setLogs([
                  { timestamp: new Date().toTimeString().split(' ')[0], type: 'info', message: 'Console logs cleared.' }
                ])}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline transition-all"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}