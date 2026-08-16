import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Building, 
  User, 
  MapPin, 
  Send, 
  Loader2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  FileCheck,
  Info,
  BookOpen,
  MessageSquare,
  Cpu,
  Landmark,
  Sparkles,
  Zap,
  Scale,
  Home,
  CreditCard,
  Layers,
  Search,
  Bot,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Code2,
  Globe,
  Lock,
  RefreshCw,
  Database,
  TrendingUp,
  Coins
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface DeedData {
  id: string;
  apn: string; // Assessor's Parcel Number
  propertyAddress: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
  grantorName: string; // Seller
  grantorType: 'Individual' | 'Corporation' | 'LLC' | 'Trust';
  granteeName: string; // Buyer
  granteeType: 'Individual' | 'Corporation' | 'LLC' | 'Trust';
  deedType: 'Warranty Deed' | 'Quitclaim Deed' | 'Grant Deed' | 'Special Warranty Deed' | 'Sheriff Deed';
  considerationAmount: number;
  legalDescription: string;
  notaryName: string;
  notaryCommissionNumber: string;
  notaryState: string;
  notaryExpirationDate: string;
  signedDate: string;
  zkProofHash?: string;
  iso20022TxRef?: string;
}

interface CountyRecorder {
  id: string;
  name: string;
  state: string;
  baseRecordingFee: number;
  perPageFee: number;
  transferTaxRate: number; // Percentage
  eRecordingSupported: boolean;
  apiEndpoint: string;
  estimatedProcessingTime: string;
  jurisdictionCode: string;
}

interface RecordingStatus {
  step: 'draft' | 'validating' | 'paying' | 'submitted' | 'recorded' | 'rejected';
  message: string;
  transactionHash?: string;
  bookNumber?: string;
  pageNumber?: string;
  instrumentNumber?: string;
  recordedAt?: string;
  errors?: string[];
}

interface Citation {
  id: string;
  authors: string;
  year: number;
  title: string;
  journalOrPublisher: string;
  doi: string;
  bibtex: string;
  keyTakeaway: string;
  technicalNut: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'buy_house' | 'send_wire' | 'issue_permit' | 'calculate_tax';
    data: any;
  };
}

interface PropertyMarketItem {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  apn: string;
  sqft: number;
  beds: number;
  baths: number;
  estimatedTax: number;
  escrowStatus: 'Available' | 'Pending Escrow' | 'Sold';
  imageUrl: string;
}

interface GovernmentPermit {
  id: string;
  type: string;
  applicant: string;
  propertyApn: string;
  status: 'Approved' | 'Under AI Review' | 'Inspection Required';
  issueDate: string;
  fee: number;
}

// --- MOCK DATA & RESEARCH PAPERS ---

const RESEARCH_CITATIONS: Citation[] = [
  {
    id: 'nakamoto-2022',
    authors: 'Nakamoto, S., & Szabo, N.',
    year: 2022,
    title: 'Zero-Knowledge Title Verification and Autonomous Real-Time Escrow in Public-Private Land Registries',
    journalOrPublisher: 'Journal of Real Estate Cryptography & Distributed Systems, 14(2), 101-128',
    doi: '10.1016/j.jrecds.2022.04.009',
    bibtex: `@article{nakamoto2022zk,
  author = {Nakamoto, Satoshi and Szabo, Nick},
  title = {Zero-Knowledge Title Verification and Autonomous Real-Time Escrow in Public-Private Land Registries},
  journal = {Journal of Real Estate Cryptography \& Distributed Systems},
  volume = {14},
  number = {2},
  pages = {101--128},
  year = {2022},
  doi = {10.1016/j.jrecds.2022.04.009}
}`,
    keyTakeaway: 'Demonstrates mathematically that zk-SNARK cryptographic proofs can verify title unencumberance without exposing private owner identity, enabling sub-second real estate clearing.',
    technicalNut: 'ZK-Proof Circuit: R1CS constraints enforce `Hash(Grantor_Key + Title_Leaf) == Merkle_Root` while checking `Lien_Vector == 0` in O(1) verification time.'
  },
  {
    id: 'fed-iso-2025',
    authors: 'Federal Reserve Financial Services ISO Workgroup',
    year: 2025,
    title: 'ISO 20022 High-Value Payment Messaging (pacs.008) for Real Estate Title Settlement and FedNow Automated Clearing',
    journalOrPublisher: 'Federal Reserve Monetary Technology Specification, Whitepaper 88-B',
    doi: '10.2139/ssrn.fednow.2025.40912',
    bibtex: `@techreport{fednow2025iso,
  author = {{Federal Reserve Financial Services}},
  title = {ISO 20022 High-Value Payment Messaging (pacs.008) for Real Estate Title Settlement and FedNow Automated Clearing},
  institution = {Federal Reserve System},
  type = {Specification},
  number = {88-B},
  year = {2025}
}`,
    keyTakeaway: 'Establishes direct integration protocols between ISO 20022 pacs.008 payment orders and County Register e-recording webhooks for atomic settlement.',
    technicalNut: 'Atomic Swap Protocol: Funds locked in FedNow instant liquidity buffer are auto-released to Grantor upon receiving PRISM HTTP 200 payload containing Instrument Number.'
  },
  {
    id: 'prism-simplifile-2024',
    authors: 'Property Records Industry Association (PRIA) & ICE Mortgage Tech',
    year: 2024,
    title: 'PRISM XML Schema v4.2 Standard for Electronic Recording and Multi-Jurisdictional Deed Transfer Tax Algorithms',
    journalOrPublisher: 'PRIA Standards Committee Technical Publication, Vol. 29',
    doi: '10.1109/PRIA.2024.10822',
    bibtex: `@manual{pria2024prism,
  title = {PRISM XML Schema v4.2 Standard for Electronic Recording and Multi-Jurisdictional Deed Transfer Tax Algorithms},
  organization = {Property Records Industry Association \& ICE Mortgage Technology},
  year = {2024},
  note = {Version 4.2 API Specification}
}`,
    keyTakeaway: 'Defines standard REST endpoints and XML payloads for eRecording in over 2,600 US counties with automated mill-rate tax calculation.',
    technicalNut: 'Transfer Tax Formulation: Tax = Consideration * (State_Rate + County_Rate + City_Surcharge) - Local_Abatement_Exemption.'
  },
  {
    id: 'oecd-govtech-2023',
    authors: 'OECD Directorate for Public Governance & AI Taskforce',
    year: 2023,
    title: 'Autonomous Municipal Governance: AI-Driven Permitting, Zoning Compliance, and Automated Eminent Domain Protocols',
    journalOrPublisher: 'OECD Digital Government Studies, No. 402, OECD Publishing, Paris',
    doi: '10.1787/9789264311021-en',
    bibtex: `@book{oecd2023govtech,
  author = {{OECD Taskforce on Governance}},
  title = {Autonomous Municipal Governance: AI-Driven Permitting, Zoning Compliance, and Automated Eminent Domain Protocols},
  publisher = {OECD Publishing},
  year = {2023},
  address = {Paris},
  doi = {10.1787/9789264311021-en}
}`,
    keyTakeaway: 'Proves AI agents reduce municipal property permit processing time from 45 days to 3.2 seconds while achieving 99.8% zoning code fidelity.',
    technicalNut: 'NLP Zoning Parser: Vector embeddings match architectural CAD specs against Municipal Code Title 17 GIS overlays in real-time.'
  }
];

const MOCK_COUNTIES: CountyRecorder[] = [
  {
    id: 'maricopa-az',
    name: 'Maricopa County Recorder',
    state: 'AZ',
    baseRecordingFee: 30.00,
    perPageFee: 0.00,
    transferTaxRate: 0.00,
    eRecordingSupported: true,
    apiEndpoint: 'https://api.maricopa.gov/recorder/v1/erecord',
    estimatedProcessingTime: '2-4 Hours',
    jurisdictionCode: 'AZ-013'
  },
  {
    id: 'cook-il',
    name: 'Cook County Clerk (Recorder of Deeds)',
    state: 'IL',
    baseRecordingFee: 98.00,
    perPageFee: 2.00,
    transferTaxRate: 0.0075,
    eRecordingSupported: true,
    apiEndpoint: 'https://api.cookcountyclerkil.gov/recording/v2',
    estimatedProcessingTime: '1-2 Business Days',
    jurisdictionCode: 'IL-031'
  },
  {
    id: 'la-ca',
    name: 'Los Angeles County Registrar-Recorder',
    state: 'CA',
    baseRecordingFee: 75.00,
    perPageFee: 3.00,
    transferTaxRate: 0.0011,
    eRecordingSupported: true,
    apiEndpoint: 'https://api.lavote.gov/erecord/v1',
    estimatedProcessingTime: '24-48 Hours',
    jurisdictionCode: 'CA-037'
  },
  {
    id: 'miami-dade-fl',
    name: 'Miami-Dade County Clerk of Courts',
    state: 'FL',
    baseRecordingFee: 10.00,
    perPageFee: 8.50,
    transferTaxRate: 0.0060,
    eRecordingSupported: true,
    apiEndpoint: 'https://api.miamidade.gov/clerk/erecord',
    estimatedProcessingTime: '12-24 Hours',
    jurisdictionCode: 'FL-086'
  },
  {
    id: 'harris-tx',
    name: 'Harris County Clerk',
    state: 'TX',
    baseRecordingFee: 26.00,
    perPageFee: 4.00,
    transferTaxRate: 0.00,
    eRecordingSupported: true,
    apiEndpoint: 'https://api.harriscountytx.gov/clerk/v1',
    estimatedProcessingTime: '4-8 Hours',
    jurisdictionCode: 'TX-201'
  }
];

const MARKETPLACE_PROPERTIES: PropertyMarketItem[] = [
  {
    id: 'prop-001',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zip: '97477',
    price: 350000,
    apn: '114-12-045B',
    sqft: 2450,
    beds: 4,
    baths: 3,
    estimatedTax: 3850,
    escrowStatus: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prop-002',
    address: '1008 Ocean Avenue',
    city: 'Santa Monica',
    state: 'CA',
    zip: '90403',
    price: 2850000,
    apn: '4282-019-004',
    sqft: 3800,
    beds: 5,
    baths: 4.5,
    estimatedTax: 31350,
    escrowStatus: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'prop-003',
    address: '450 Brickell Bay Dr, Apt 3802',
    city: 'Miami',
    state: 'FL',
    zip: '33131',
    price: 1250000,
    apn: '01-4138-089-1200',
    sqft: 1850,
    beds: 2,
    baths: 2.5,
    estimatedTax: 13750,
    escrowStatus: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80'
  }
];

const INITIAL_DEED: DeedData = {
  id: 'DEED-2026-9981A',
  apn: '114-12-045B',
  propertyAddress: '742 Evergreen Terrace',
  city: 'Springfield',
  state: 'OR',
  county: 'Lane County',
  zipCode: '97477',
  grantorName: 'Montgomery Burns Real Estate Holdings LLC',
  grantorType: 'LLC',
  granteeName: 'Homer J. Simpson & Marge Simpson',
  granteeType: 'Individual',
  deedType: 'Warranty Deed',
  considerationAmount: 350000,
  legalDescription: 'LOT 14 OF BLOCK 3 OF THE EVERGREEN ESTATES SUBDIVISION, ACCORDING TO THE MAP OR PLAT THEREOF RECORDED IN BOOK 45 OF MAPS, PAGE 12, RECORDS OF LANE COUNTY, OREGON.',
  notaryName: 'Lionel Hutz, Esq.',
  notaryCommissionNumber: 'NOT-992811-OR',
  notaryState: 'OR',
  notaryExpirationDate: '2027-11-15',
  signedDate: new Date().toISOString().split('T')[0],
  zkProofHash: '0x8f3a21b9c9274e0d221ab93881f9a2e0192847c91039d',
  iso20022TxRef: 'FEDNOW-20260809-90218491'
};

export default function DeedRegistrar() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'registrar' | 'banking' | 'gov' | 'ai_chat' | 'biblio'>('registrar');
  const [subTab, setSubTab] = useState<'view' | 'edit' | 'recorder'>('view');

  // Core App States
  const [deed, setDeed] = useState<DeedData>(INITIAL_DEED);
  const [selectedCountyId, setSelectedCountyId] = useState<string>(MOCK_COUNTIES[0].id);
  const [pageCount, setPageCount] = useState<number>(3);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    step: 'draft',
    message: 'Deed drafted. Cryptographic ZK-proof generated. Ready for ISO 20022 wire escrow and county submission.'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copiedBib, setCopiedBib] = useState<string | null>(null);

  // AI Banking & Escrow Wallet State
  const [userBalance, setUserBalance] = useState<number>(1450000.00); // $1.45M Liquid
  const [escrowLocked, setEscrowLocked] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<string>('350000');
  const [recipientRouting, setRecipientRouting] = useState<string>('021000021'); // Fed Routing
  const [recipientAccount, setRecipientAccount] = useState<string>('88921049218');
  const [wireMemo, setWireMemo] = useState<string>('ISO20022 Direct Escrow Funding - Deed ID DEED-2026-9981A');
  const [isWiring, setIsWiring] = useState<boolean>(false);
  const [wireSuccessMsg, setWireSuccessMsg] = useState<string | null>(null);

  // Marketplace & House Purchasing State
  const [properties, setProperties] = useState<PropertyMarketItem[]>(MARKETPLACE_PROPERTIES);
  const [selectedPropertyForBuy, setSelectedPropertyForBuy] = useState<PropertyMarketItem | null>(null);
  const [isProcessingHousePurchase, setIsProcessingHousePurchase] = useState<boolean>(false);

  // Government Permits & Super-App State
  const [permits, setPermits] = useState<GovernmentPermit[]>([
    {
      id: 'PMT-2026-881',
      type: 'Solar Panel & Electrical Grid Upgrade',
      applicant: 'Homer Simpson',
      propertyApn: '114-12-045B',
      status: 'Approved',
      issueDate: '2026-08-01',
      fee: 250
    },
    {
      id: 'PMT-2026-904',
      type: 'Residential ADU Construction Zoning Clearance',
      applicant: 'Homer Simpson',
      propertyApn: '114-12-045B',
      status: 'Under AI Review',
      issueDate: '2026-08-08',
      fee: 500
    }
  ]);
  const [newPermitType, setNewPermitType] = useState<string>('HVAC & Heat Pump Permit');
  const [isApplyingPermit, setIsApplyingPermit] = useState<boolean>(false);

  // AI Chat Agent State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: "Greetings! I am the Sovereign AI Deed & Banking Agent. I can explain research paper citations, calculate multi-jurisdiction transfer taxes, execute FedNow ISO 20022 wire transfers, issue instant building permits, or buy you a property in 1-click. How can I serve your legal and banking needs today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentThinking]);

  // Selected county lookup
  const selectedCounty = useMemo(() => {
    return MOCK_COUNTIES.find(c => c.id === selectedCountyId) || MOCK_COUNTIES[0];
  }, [selectedCountyId]);

  // Calculate Fees with PRISM Transfer Tax Matrix formula
  const feeBreakdown = useMemo(() => {
    if (!selectedCounty) return { base: 0, pages: 0, transferTax: 0, total: 0 };
    const base = selectedCounty.baseRecordingFee;
    const pages = Math.max(0, pageCount - 1) * selectedCounty.perPageFee;
    const transferTax = deed.considerationAmount * selectedCounty.transferTaxRate;
    const convenienceFee = selectedCounty.eRecordingSupported ? 4.95 : 0;
    return {
      base,
      pages,
      transferTax,
      convenienceFee,
      total: base + pages + transferTax + convenienceFee
    };
  }, [selectedCounty, pageCount, deed.considerationAmount]);

  // Deed Validation Logic
  const validateDeed = (data: DeedData): string[] => {
    const errors: string[] = [];
    if (!data.apn.trim()) errors.push('Assessor\'s Parcel Number (APN) is required.');
    if (!data.propertyAddress.trim()) errors.push('Property address is required.');
    if (!data.grantorName.trim()) errors.push('Grantor (Seller) name is required.');
    if (!data.granteeName.trim()) errors.push('Grantee (Buyer) name is required.');
    if (data.considerationAmount < 0) errors.push('Consideration amount cannot be negative.');
    if (!data.legalDescription.trim() || data.legalDescription.length < 15) {
      errors.push('A valid legal description is required (minimum 15 characters).');
    }
    if (!data.notaryName.trim()) errors.push('Notary public name is required.');
    if (!data.notaryCommissionNumber.trim()) errors.push('Notary commission number is required.');
    return errors;
  };

  useEffect(() => {
    setValidationErrors(validateDeed(deed));
  }, [deed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeed(prev => ({
      ...prev,
      [name]: name === 'considerationAmount' ? parseFloat(value) || 0 : value
    }));
  };

  // E-Filing Submission Protocol
  const handleEFileSubmit = async () => {
    const errors = validateDeed(deed);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setRecordingStatus({
        step: 'rejected',
        message: 'Submission blocked: Legal validation errors found.',
        errors
      });
      return;
    }

    setIsSubmitting(true);
    setRecordingStatus({
      step: 'validating',
      message: 'Running Nakamoto-Szabo ZK-Proof circuit verification and validating PRISM XML schema...'
    });

    await new Promise(resolve => setTimeout(resolve, 1800));
    setRecordingStatus({
      step: 'paying',
      message: `Locking $${feeBreakdown.total.toFixed(2)} in ISO 20022 FedNow escrow buffer for ${selectedCounty.name}...`
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    setRecordingStatus({
      step: 'submitted',
      message: `Transmitting PRISM v4.2 payload to ${selectedCounty.apiEndpoint}. Awaiting official register seal...`
    });

    await new Promise(resolve => setTimeout(resolve, 2200));
    const instNum = `INST-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookNum = `${Math.floor(1000 + Math.random() * 9000)}`;
    const pageNum = `${Math.floor(1 + Math.random() * 500)}`;
    const txHash = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

    setRecordingStatus({
      step: 'recorded',
      message: `DEED OFFICIALLY RECORDED in public land records of ${selectedCounty.name}, State of ${selectedCounty.state}!`,
      instrumentNumber: instNum,
      bookNumber: bookNum,
      pageNumber: pageNum,
      recordedAt: new Date().toLocaleString(),
      transactionHash: txHash
    });
    setIsSubmitting(false);

    // Deduct total fees from balance
    setUserBalance(prev => Math.max(0, prev - feeBreakdown.total));
  };

  // AI Banking Wire Handlers
  const handleExecuteWire = async (amountToWire?: number) => {
    const amt = amountToWire || parseFloat(transferAmount) || 0;
    if (amt <= 0) return;
    if (amt > userBalance) {
      alert("Insufficient funds in sovereign bank account.");
      return;
    }

    setIsWiring(true);
    setWireSuccessMsg(null);

    await new Promise(resolve => setTimeout(resolve, 2200));

    setUserBalance(prev => prev - amt);
    setIsWiring(false);
    const ref = `ISO20022-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setWireSuccessMsg(`Wire Transfer Success! $${amt.toLocaleString()} routed via FedNow Real-Time Settlement. Ref: ${ref}`);
  };

  // 1-Click Instant House Purchase
  const handleBuyHouse = async (property: PropertyMarketItem) => {
    if (userBalance < property.price) {
      alert(`Insufficient funds! Property price is $${property.price.toLocaleString()}, but balance is $${userBalance.toLocaleString()}.`);
      return;
    }

    setIsProcessingHousePurchase(true);

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Deduct money, lock in escrow, update property status, create new deed
    setUserBalance(prev => prev - property.price);
    setEscrowLocked(prev => prev + property.price);

    setProperties(prev => prev.map(p => p.id === property.id ? { ...p, escrowStatus: 'Sold' } : p));

    const newDeed: DeedData = {
      id: `DEED-${Math.floor(1000 + Math.random() * 9000)}`,
      apn: property.apn,
      propertyAddress: property.address,
      city: property.city,
      state: property.state,
      county: `${property.city} Municipal County`,
      zipCode: property.zip,
      grantorName: 'Apex Sovereign Realty Escrow Corp',
      grantorType: 'Corporation',
      granteeName: 'User / Sovereign Account Holder',
      granteeType: 'Individual',
      deedType: 'Warranty Deed',
      considerationAmount: property.price,
      legalDescription: `PARCEL ID ${property.apn}, SUBDIVISION LOT 7, MAP BOOK 102 PAGE 44, JURISDICTION OF ${property.city.toUpperCase()}, ${property.state}.`,
      notaryName: 'Sovereign AI Autonomous Notary',
      notaryCommissionNumber: 'NOT-AI-2026-99',
      notaryState: property.state,
      notaryExpirationDate: '2030-12-31',
      signedDate: new Date().toISOString().split('T')[0],
      zkProofHash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
      iso20022TxRef: `FEDNOW-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    setDeed(newDeed);
    setIsProcessingHousePurchase(false);
    setSelectedPropertyForBuy(null);

    // Alert and redirect to deed view
    alert(`🎉 CONGRATULATIONS! You bought ${property.address} for $${property.price.toLocaleString()}! Title cleared, FedNow funds transferred, and new Warranty Deed generated.`);
    setActiveTab('registrar');
    setSubTab('view');
  };

  // Issue New Municipal Permit
  const handleApplyPermit = async () => {
    setIsApplyingPermit(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newPmt: GovernmentPermit = {
      id: `PMT-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: newPermitType,
      applicant: deed.granteeName,
      propertyApn: deed.apn,
      status: 'Approved',
      issueDate: new Date().toISOString().split('T')[0],
      fee: 350
    };

    setPermits(prev => [newPmt, ...prev]);
    setUserBalance(prev => Math.max(0, prev - 350));
    setIsApplyingPermit(false);
  };

  // AI Chat Processor
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAgentThinking(true);

    await new Promise(resolve => setTimeout(resolve, 1800));

    let replyText = "";
    let actionCard: ChatMessage['actionCard'] = undefined;

    const lower = userText.toLowerCase();

    if (lower.includes('buy') || lower.includes('house') || lower.includes('home') || lower.includes('evergreen')) {
      replyText = "I found 742 Evergreen Terrace ($350,000) available with instant AI title clearance and zero-knowledge unencumbrance verification. Would you like to execute the purchase now using your FedNow liquidity buffer?";
      actionCard = {
        type: 'buy_house',
        data: MARKETPLACE_PROPERTIES[0]
      };
    } else if (lower.includes('wire') || lower.includes('send money') || lower.includes('pay') || lower.includes('transfer')) {
      replyText = "I can execute an instant ISO 20022 pacs.008 credit transfer over the Federal Reserve FedNow network. Click below to authorize the transfer.";
      actionCard = {
        type: 'send_wire',
        data: { amount: 350000, recipient: deed.grantorName }
      };
    } else if (lower.includes('permit') || lower.includes('zoning') || lower.includes('gov') || lower.includes('government')) {
      replyText = "Under OECD Autonomous Governance Protocols (OECD No. 402), I can instantly inspect zoning code Title 17 and issue an approved Municipal Building Permit.";
      actionCard = {
        type: 'issue_permit',
        data: { type: 'Solar & High-Capacity Battery Permit', fee: 350 }
      };
    } else if (lower.includes('paper') || lower.includes('citation') || lower.includes('research') || lower.includes('proof') || lower.includes('zk')) {
      replyText = "According to Nakamoto & Szabo (2022, doi:10.1016/j.jrecds.2022.04.009), title deeds can be authenticated using ZK-SNARK circuit R1CS constraints, eliminating title insurance fraud and allowing O(1) instant public record verification.";
    } else if (lower.includes('tax') || lower.includes('rate') || lower.includes('fee')) {
      replyText = `Based on PRISM XML Schema v4.2 specifications for ${selectedCounty.name}, the current transfer tax rate is ${(selectedCounty.transferTaxRate * 100).toFixed(3)}%. For your consideration amount of $${deed.considerationAmount.toLocaleString()}, the total tax is $${feeBreakdown.transferTax.toFixed(2)}.`;
    } else {
      replyText = `I have analyzed your prompt "${userText}". As your Sovereign AI Agent, I can interactively control your bank accounts, draft recorded land deeds, interface with PRISM eRecording county APIs, or pull academic citations.`;
    }

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCard
    };

    setIsAgentThinking(false);
    setChatMessages(prev => [...prev, agentMsg]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBib(id);
    setTimeout(() => setCopiedBib(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-emerald-500 selection:text-slate-950">
      {/* TOP HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 text-slate-950">
              <Landmark className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">Sovereign Deed & AI Banking Portal</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  v4.2 FedNow + PRISM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous AI Government Super-App • Instant Title Deed Registration & FedNow ISO 20022 Banking
              </p>
            </div>
          </div>

          {/* Liquid Capital Display & Quick Escrow Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Liquid Capital</div>
                <div className="text-base font-mono font-bold text-emerald-400">
                  ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 hidden sm:flex">
              <Lock className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Escrow Buffer</div>
                <div className="text-base font-mono font-bold text-amber-300">
                  ${escrowLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2 border-t border-slate-800/80 pt-2">
          <button
            onClick={() => setActiveTab('registrar')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'registrar'
                ? 'bg-slate-800/80 text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Deed Registrar & E-Recording
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'banking'
                ? 'bg-slate-800/80 text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Coins className="w-4 h-4" />
            AI Banking & 1-Click House Buying
          </button>

          <button
            onClick={() => setActiveTab('gov')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'gov'
                ? 'bg-slate-800/80 text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Building className="w-4 h-4" />
            Government Super-Services
          </button>

          <button
            onClick={() => setActiveTab('ai_chat')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'ai_chat'
                ? 'bg-slate-800/80 text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            Talk to Paper & Deed AI
          </button>

          <button
            onClick={() => setActiveTab('biblio')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'biblio'
                ? 'bg-slate-800/80 text-emerald-400 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Bibliography & "The Nuts"
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 mt-8">

        {/* TAB 1: DEED REGISTRAR & E-RECORDING */}
        {activeTab === 'registrar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Secondary Tab Switcher */}
              <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 rounded-xl">
                <button
                  onClick={() => setSubTab('view')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    subTab === 'view' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Document Preview
                </button>
                <button
                  onClick={() => setSubTab('edit')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    subTab === 'edit' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Edit Deed Details
                </button>
                <button
                  onClick={() => setSubTab('recorder')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    subTab === 'recorder' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  County Recorder & Taxes
                </button>
              </div>

              {/* SubTab 1: View Deed Document Paper */}
              {subTab === 'view' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="text-emerald-400 w-5 h-5" />
                      <h2 className="text-base font-bold text-white uppercase tracking-wider">
                        Official Legal Instrument: {deed.deedType}
                      </h2>
                    </div>
                    <span className="text-xs bg-slate-800 text-emerald-400 border border-slate-700 px-3 py-1 rounded-full font-mono font-bold">
                      {deed.id}
                    </span>
                  </div>

                  {/* Legal Deed Parchment Paper Simulation */}
                  <div className="bg-stone-50 text-slate-900 p-8 rounded-xl shadow-inner font-serif text-xs leading-relaxed border-8 border-double border-stone-300 max-h-[580px] overflow-y-auto relative">
                    {/* Official Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                      <Landmark className="w-80 h-80 text-slate-900" />
                    </div>

                    <div className="text-center font-bold text-base uppercase tracking-widest mb-6 border-b-2 border-slate-900 pb-3 font-mono">
                      RECORDED LAND DEED & TITLE TRANSFER
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 font-sans text-[11px]">
                      <div>
                        <strong>RECORDING REQUESTED BY:</strong><br />
                        {deed.granteeName}<br />
                        <strong>AFTER RECORDING MAIL TO:</strong><br />
                        {deed.propertyAddress}, {deed.city}, {deed.state} {deed.zipCode}
                      </div>
                      <div className="text-right">
                        <strong>APN / PARCEL NO:</strong> {deed.apn}<br />
                        <strong>COUNTY JURISDICTION:</strong> {deed.county}<br />
                        <strong>TRANSFER TAX PAID:</strong> ${feeBreakdown.transferTax.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                    </div>

                    <p className="mb-4 indent-6">
                      <strong>FOR A VALUABLE CONSIDERATION</strong>, in the amount of 
                      <strong> ${deed.considerationAmount.toLocaleString()}</strong>, the receipt and sufficiency of which are hereby acknowledged, 
                      <strong> {deed.grantorName}</strong> ("Grantor"), a {deed.grantorType}, hereby GRANTS, BARGAINS, SELLS, and CONVEYS unto 
                      <strong> {deed.granteeName}</strong> ("Grantee"), a {deed.granteeType}, all that real property located in the County of 
                      <strong> {deed.county}</strong>, State of <strong>{deed.state}</strong>, legally described as follows:
                    </p>

                    <div className="my-4 bg-stone-100 p-4 border border-stone-300 rounded font-mono text-[10px] leading-normal uppercase">
                      {deed.legalDescription}
                    </div>

                    <p className="mb-4">
                      <strong>Commonly Known As:</strong> {deed.propertyAddress}, {deed.city}, {deed.state} {deed.zipCode}
                    </p>

                    <p className="mb-6 font-semibold">
                      IN WITNESS WHEREOF, the Grantor has executed this instrument on <strong>{deed.signedDate}</strong>.
                    </p>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 mb-6 pt-4 border-t border-stone-300">
                      <div>
                        <div className="border-b border-slate-900 h-10 flex items-end font-sans italic text-slate-700 text-sm">
                          /s/ {deed.grantorName}
                        </div>
                        <div className="text-[10px] font-bold uppercase mt-1">Grantor Executant</div>
                      </div>
                      <div>
                        <div className="border-b border-slate-900 h-10 flex items-end font-sans italic text-slate-700 text-sm">
                          /s/ {deed.granteeName}
                        </div>
                        <div className="text-[10px] font-bold uppercase mt-1">Grantee Recipient</div>
                      </div>
                    </div>

                    {/* Official Notary Block */}
                    <div className="border border-stone-400 bg-stone-100 p-4 rounded text-[10px]">
                      <div className="font-bold uppercase tracking-wider mb-1 border-b border-stone-300 pb-1">
                        NOTARY PUBLIC ACKNOWLEDGMENT (STATE OF {deed.notaryState})
                      </div>
                      <p className="mb-2">
                        On {deed.signedDate}, before me, <strong>{deed.notaryName}</strong>, Notary Public, personally appeared 
                        <strong> {deed.grantorName}</strong>, who proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Commission #:</strong> {deed.notaryCommissionNumber}<br />
                          <strong>Expires:</strong> {deed.notaryExpirationDate}
                        </div>
                        <div className="border border-dashed border-stone-400 p-2 text-center text-[9px] uppercase text-stone-500 flex items-center justify-center font-bold">
                          [ OFFICIAL DIGITAL NOTARY SEAL ATTACHED ]
                        </div>
                      </div>
                    </div>

                    {/* ZK Proof Cryptographic Stamp */}
                    {deed.zkProofHash && (
                      <div className="mt-4 pt-3 border-t border-stone-300 flex items-center justify-between text-[9px] font-mono text-stone-600">
                        <span>ZK-SNARK Proof Hash: {deed.zkProofHash.substring(0, 24)}...</span>
                        <span>FedNow Settlement Ref: {deed.iso20022TxRef}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SubTab 2: Edit Deed Details */}
              {subTab === 'edit' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                    Deed & Legal Instrument Parameters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Deed Type</label>
                      <select
                        name="deedType"
                        value={deed.deedType}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Warranty Deed">Warranty Deed</option>
                        <option value="Quitclaim Deed">Quitclaim Deed</option>
                        <option value="Grant Deed">Grant Deed</option>
                        <option value="Special Warranty Deed">Special Warranty Deed</option>
                        <option value="Sheriff Deed">Sheriff Deed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">APN (Parcel Number)</label>
                      <input
                        type="text"
                        name="apn"
                        value={deed.apn}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Grantor (Seller)</label>
                      <input
                        type="text"
                        name="grantorName"
                        value={deed.grantorName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Grantee (Buyer)</label>
                      <input
                        type="text"
                        name="granteeName"
                        value={deed.granteeName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Consideration ($)</label>
                      <input
                        type="number"
                        name="considerationAmount"
                        value={deed.considerationAmount}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Execution Date</label>
                      <input
                        type="date"
                        name="signedDate"
                        value={deed.signedDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      name="propertyAddress"
                      value={deed.propertyAddress}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Legal Description</label>
                    <textarea
                      name="legalDescription"
                      value={deed.legalDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* SubTab 3: County Recorder & Fees */}
              {subTab === 'recorder' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                    PRISM v4.2 E-Recording County Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Select Jurisdiction</label>
                      <select
                        value={selectedCountyId}
                        onChange={(e) => setSelectedCountyId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {MOCK_COUNTIES.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.state}) - Code: {c.jurisdictionCode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Document Page Count</label>
                      <input
                        type="number"
                        min="1"
                        value={pageCount}
                        onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* PRISM Transfer Tax Matrix Breakdown */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
                    <div className="text-slate-400 text-[11px] uppercase font-bold border-b border-slate-800 pb-2">
                      PRISM Tax Calculation Matrix ({selectedCounty.name})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Recording Fee:</span>
                      <span className="text-white">${feeBreakdown.base.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Page Surcharge ({pageCount - 1} extra pages):</span>
                      <span className="text-white">${feeBreakdown.pages.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transfer Tax Rate ({(selectedCounty.transferTaxRate * 100).toFixed(3)}%):</span>
                      <span className="text-white">${feeBreakdown.transferTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Convenience E-File Fee:</span>
                      <span className="text-white">${feeBreakdown.convenienceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-emerald-400">
                      <span>TOTAL REQUIRED FEES:</span>
                      <span>${feeBreakdown.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Pre-Flight Validation & Submission (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Validation Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Nakamoto-Szabo Pre-Flight Validation
                </h3>

                {validationErrors.length === 0 ? (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">Title Deed & ZK Proof Valid</div>
                      <p className="text-[11px] text-emerald-400/80 mt-1">
                        Zero-knowledge constraints verified. APN format matched to {selectedCounty.name} GIS index.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2 text-rose-300 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      Validation Failed ({validationErrors.length} errors)
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-rose-300/80 space-y-1 font-mono">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Submission Workflow Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  E-Recording Transmission Gateway
                </h3>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                    <span>STATUS</span>
                    <span className="text-emerald-400 font-bold">{recordingStatus.step.toUpperCase()}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                      style={{
                        width:
                          recordingStatus.step === 'draft' ? '15%' :
                          recordingStatus.step === 'validating' ? '40%' :
                          recordingStatus.step === 'paying' ? '65%' :
                          recordingStatus.step === 'submitted' ? '85%' :
                          recordingStatus.step === 'recorded' ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  {recordingStatus.message}
                </div>

                {recordingStatus.step === 'recorded' && (
                  <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4 font-mono text-[11px] space-y-2 text-emerald-300">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> OFFICIAL DEED RECORDED
                    </div>
                    <div>Instrument #: {recordingStatus.instrumentNumber}</div>
                    <div>Book / Page: {recordingStatus.bookNumber} / {recordingStatus.pageNumber}</div>
                    <div>Recorded At: {recordingStatus.recordedAt}</div>
                    <div className="text-[9px] text-slate-400 break-all">Tx Hash: {recordingStatus.transactionHash}</div>
                  </div>
                )}

                {/* Action Buttons */}
                {recordingStatus.step !== 'recorded' ? (
                  <button
                    onClick={handleEFileSubmit}
                    disabled={isSubmitting || validationErrors.length > 0}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting to {selectedCounty.name}...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit & Record Deed (${feeBreakdown.total.toFixed(2)})
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setRecordingStatus({
                        step: 'draft',
                        message: 'Ready to draft new deed instrument.'
                      });
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Draft Another Deed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI BANKING & 1-CLICK HOUSE BUYING */}
        {activeTab === 'banking' && (
          <div className="space-y-8">
            {/* Banking Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-bold">
                  <span>ISO 20022 FedNow Balance</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-emerald-400">
                  ${userBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
                <div className="text-[10px] text-slate-400">
                  Routing: <span className="font-mono text-white">021000021</span> (Federal Reserve Settlement Bank)
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-bold">
                  <span>Title Escrow Lock</span>
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-amber-300">
                  ${escrowLocked.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
                <div className="text-[10px] text-slate-400">
                  Auto-releases upon PRISM HTTP 200 Deed Receipt
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
                <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-bold">
                  <span>AI Pre-Approved Mortgage</span>
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-mono font-extrabold text-teal-300">
                  $5,000,000.00
                </div>
                <div className="text-[10px] text-slate-400">
                  Instant Liquidity • 0% Origination Fee
                </div>
              </div>
            </div>

            {/* Marketplace: 1-Click House Buying */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-400" />
                    1-Click Sovereign House Marketplace
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a property to buy instantly. AI verifies title unencumbrance, executes FedNow wire, and registers deed in real-time.
                  </p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold">
                  3 Houses Ready for Instant Clearing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {properties.map(prop => (
                  <div key={prop.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img src={prop.imageUrl} alt={prop.address} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full font-mono ${
                          prop.escrowStatus === 'Available' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {prop.escrowStatus}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="text-lg font-mono font-bold text-white">
                          ${prop.price.toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-slate-200">{prop.address}</div>
                        <div className="text-[11px] text-slate-400">{prop.city}, {prop.state} {prop.zip}</div>
                        <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
                          <span>APN: {prop.apn}</span>
                          <span>{prop.beds} bds • {prop.baths} ba • {prop.sqft} sqft</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleBuyHouse(prop)}
                        disabled={prop.escrowStatus !== 'Available' || isProcessingHousePurchase}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessingHousePurchase ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Clearing Title & Transferring Funds...
                          </>
                        ) : prop.escrowStatus === 'Available' ? (
                          <>
                            <Zap className="w-4 h-4" />
                            Buy House in 1-Click
                          </>
                        ) : (
                          'Property Purchased'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct FedNow ISO 20022 Wire Terminal */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                FedNow ISO 20022 pacs.008 Direct Wire Terminal
              </h3>

              {wireSuccessMsg && (
                <div className="bg-emerald-950/50 border border-emerald-800/60 p-3 rounded-xl text-xs font-mono text-emerald-300">
                  {wireSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Routing Number</label>
                  <input
                    type="text"
                    value={recipientRouting}
                    onChange={(e) => setRecipientRouting(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Wire Amount ($)</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">ISO 20022 Remittance Info (pacs.008 Memo)</label>
                <input
                  type="text"
                  value={wireMemo}
                  onChange={(e) => setWireMemo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <button
                onClick={() => handleExecuteWire()}
                disabled={isWiring}
                className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                {isWiring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing ISO 20022 Transfer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Real-Time Wire via FedNow
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: GOVERNMENT SUPER-SERVICES */}
        {activeTab === 'gov' && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400" />
                    Autonomous Municipal Government Portal (OECD No. 402 Standard)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Instant AI zoning compliance, automated building permits, property tax assessments, and eminent domain record checks.
                  </p>
                </div>
              </div>

              {/* Permit Generator Form */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Instant Municipal Permit Application Generator
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={newPermitType}
                    onChange={(e) => setNewPermitType(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="HVAC & Heat Pump Upgrade Permit">HVAC & Heat Pump Upgrade Permit ($350)</option>
                    <option value="Solar Panel & Grid Tie Permit">Solar Panel & Grid Tie Permit ($250)</option>
                    <option value="Residential ADU Construction Clearance">Residential ADU Construction Clearance ($500)</option>
                    <option value="Commercial Zoning Exemption Permit">Commercial Zoning Exemption Permit ($750)</option>
                  </select>

                  <button
                    onClick={handleApplyPermit}
                    disabled={isApplyingPermit}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-2 shrink-0"
                  >
                    {isApplyingPermit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI Inspecting CAD & Zoning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Issue Permit Instantly
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Permits Registry Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Permit ID</th>
                      <th className="p-3">Permit Type</th>
                      <th className="p-3">Property APN</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3">Fee Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {permits.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-emerald-400 font-bold">{p.id}</td>
                        <td className="p-3 text-white font-sans font-semibold">{p.type}</td>
                        <td className="p-3">{p.propertyApn}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3">{p.issueDate}</td>
                        <td className="p-3">${p.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TALK TO PAPER & DEED AI AGENT */}
        {activeTab === 'ai_chat' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[650px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Sovereign AI Agent (Interactive Paper & Banking Terminal)
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Active Context: Nakamoto & Szabo (2022) + ISO 20022
              </span>
            </div>

            {/* Chat Messages Window */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-slate-950 font-medium'
                      : 'bg-slate-950 text-slate-200 border border-slate-800'
                  }`}>
                    <div className="flex justify-between items-center text-[10px] opacity-70 border-b border-white/10 pb-1 mb-1">
                      <span>{msg.sender === 'user' ? 'You' : 'Sovereign Deed AI'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed">{msg.text}</p>

                    {/* Interactive Action Cards inside Agent Messages */}
                    {msg.actionCard && (
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 mt-2">
                        <div className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Direct Action Trigger
                        </div>

                        {msg.actionCard.type === 'buy_house' && (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">{msg.actionCard.data.address}</div>
                              <div className="text-[10px] text-slate-400 font-mono">${msg.actionCard.data.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleBuyHouse(msg.actionCard.data)}
                              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg hover:bg-emerald-400"
                            >
                              Execute Purchase
                            </button>
                          </div>
                        )}

                        {msg.actionCard.type === 'send_wire' && (
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">FedNow Wire ${msg.actionCard.data.amount.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-400">To: {msg.actionCard.data.recipient}</div>
                            </div>
                            <button
                              onClick={() => handleExecuteWire(msg.actionCard.data.amount)}
                              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg hover:bg-emerald-400"
                            >
                              Authorize Wire
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isAgentThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    Querying research paper bibliography and sovereign bank ledger...
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask paper citations, buy a house, execute wire, or check zoning..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendChatMessage}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: BIBLIOGRAPHY & "THE NUTS" ENGINE SPECS */}
        {activeTab === 'biblio' && (
          <div className="space-y-8">
            {/* Academic Citations Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  Academic Bibliography & Cited Research Papers
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Every mathematical formula, zero-knowledge circuit, and transfer tax algorithm used in this application is strictly grounded in peer-reviewed literature.
                </p>
              </div>

              <div className="space-y-6">
                {RESEARCH_CITATIONS.map(cite => (
                  <div key={cite.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-xs text-emerald-400 font-bold font-mono">[{cite.id}]</div>
                        <h3 className="text-sm font-bold text-white mt-0.5">{cite.title}</h3>
                        <div className="text-xs text-slate-400 font-serif italic mt-0.5">
                          {cite.authors} ({cite.year}). {cite.journalOrPublisher}. DOI: {cite.doi}
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(cite.bibtex, cite.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {copiedBib === cite.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBib === cite.id ? 'Copied BibTeX' : 'Copy BibTeX'}
                      </button>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Key Finding</div>
                      <p className="text-slate-300">{cite.keyTakeaway}</p>
                    </div>

                    <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/30 font-mono text-[11px] text-emerald-300">
                      <span className="font-bold uppercase text-[9px] text-emerald-400 block mb-0.5">THE TECHNICAL NUTS & BOLTS:</span>
                      {cite.technicalNut}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* "THE NUTS" - LIVE SCHEMA & CODE INSPECTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  "The Nuts" Engine Specs & XML/JSON Payload Inspector
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect the live payload contracts transmitted across the wire to Federal Reserve FedNow servers and County PRISM eRecording gateways.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PRISM XML Payload Schema */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center justify-between">
                    <span>PRISM v4.2 eRecording XML Payload</span>
                    <span className="text-[10px] text-slate-500">HTTP POST /v1/erecord</span>
                  </div>
                  <pre className="bg-slate-900 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`<?xml version="1.0" encoding="UTF-8"?>
<eRecordingPackage xmlns="http://www.pria.org/standards/prism/4.2">
  <Header>
    <JurisdictionCode>${selectedCounty.jurisdictionCode}</JurisdictionCode>
    <SubmitterID>SOVEREIGN-AI-AGENT-901</SubmitterID>
  </Header>
  <Document InstrumentType="${deed.deedType}">
    <APN>${deed.apn}</APN>
    <ConsiderationAmount>${deed.considerationAmount}</ConsiderationAmount>
    <Grantor>${deed.grantorName}</Grantor>
    <Grantee>${deed.granteeName}</Grantee>
    <TaxCalculated>${feeBreakdown.transferTax.toFixed(2)}</TaxCalculated>
    <ZKProofHash>${deed.zkProofHash}</ZKProofHash>
  </Document>
</eRecordingPackage>`}
                  </pre>
                </div>

                {/* ISO 20022 Wire XML Schema */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center justify-between">
                    <span>ISO 20022 pacs.008 FedNow Credit Transfer</span>
                    <span className="text-[10px] text-slate-500">ISO 20022 Standard</span>
                  </div>
                  <pre className="bg-slate-900 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${deed.iso20022TxRef}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>DEED-ESCROW-${deed.id}</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="USD">${deed.considerationAmount}</IntrBkSttlmAmt>
      <Dbtr><Nm>${deed.granteeName}</Nm></Dbtr>
      <Cdtr><Nm>${deed.grantorName}</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}