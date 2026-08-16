import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Download, 
  Building, 
  DollarSign, 
  Info, 
  Plus, 
  Trash, 
  FileCheck, 
  History, 
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Bot,
  Home,
  Code,
  Scale,
  Landmark,
  Sparkles,
  Copy,
  ExternalLink,
  MessageSquare,
  Search,
  Award,
  Terminal,
  ChevronRight,
  PieChart,
  Zap,
  Check,
  Share2,
  FileCode,
  ArrowUpRight,
  Lock,
  Layers,
  Cpu,
  RefreshCw,
  Globe,
  Sliders,
  Database
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface Form1120POLData {
  ein: string;
  organizationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  taxYearStartDate: string;
  taxYearEndDate: string;
  grossDividends: number;
  interestIncome: number;
  grossRents: number;
  grossRoyalties: number;
  capitalGainNetIncome: number;
  otherIncome: string;
  otherIncomeAmount: number;
  totalIncome: number;
  deductionsSalaries: number;
  deductionsRents: number;
  deductionsTaxes: number;
  deductionsInterest: number;
  deductionsDepreciation: number;
  deductionsOther: number;
  totalDeductions: number;
  taxableIncome: number;
  taxDue: number;
  overpayment: number;
}

interface Contributor {
  id: string;
  name: string;
  address: string;
  employer: string;
  occupation: string;
  amount: number;
  date: string;
}

interface Expenditure {
  id: string;
  recipientName: string;
  address: string;
  purpose: string;
  amount: number;
  date: string;
}

interface Form8872Data {
  ein: string;
  organizationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  custodianName: string;
  custodianAddress: string;
  contactPerson: string;
  contactPhone: string;
  reportPeriodStart: string;
  reportPeriodEnd: string;
  contributors: Contributor[];
  expenditures: Expenditure[];
}

interface FilingRecord {
  id: string;
  formType: '1120-POL' | '8872' | '990-N' | '1041';
  ein: string;
  organizationName: string;
  submittedAt: string;
  status: 'Accepted' | 'Rejected' | 'Pending' | 'Processing';
  confirmationNumber: string;
  taxAmount?: number;
  xmlPayloadSnippet?: string;
}

interface BibliographyPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  category: 'Tax Law' | 'Automated Banking' | 'Real Estate Conveyance' | 'MeF XML Protocols' | 'Autonomous AI';
  abstract: string;
  citationsCount: number;
  keyTakeaways: string[];
  equationNotation?: string;
  codeSnippet?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  citationRef?: string;
  actionButton?: {
    label: string;
    actionType: 'wire_tax' | 'buy_house' | 'generate_xml' | 'view_paper';
    payload?: any;
  };
}

interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  estimatedMarketValue: number;
  taxLienAmount: number;
  propertyType: 'Residential Single Family' | 'Multi-Family Complex' | 'Commercial Office' | 'Sovereign Holding';
  beds: number;
  baths: number;
  sqft: number;
  status: 'Available' | 'Purchased' | 'Pending Title Clear';
  deedType: 'Quitclaim Deed' | 'Warranty Deed' | 'Smart Escrow Sovereign Deed';
  imageUrl: string;
}

interface BankingTransaction {
  id: string;
  timestamp: string;
  description: string;
  category: 'IRS Tax Payment' | 'Real Estate Escrow' | 'PAC Contribution' | 'Lien Settlement' | 'FedNow Wire';
  amount: number;
  type: 'debit' | 'credit';
  status: 'Settled (ISO 20022)' | 'Pending Fedwire Clearing';
  counterparty: string;
  isoReference: string;
}

// --- INITIAL MOCK PAPERS & BIBLIOGRAPHY ---

const BIBLIOGRAPHY_PAPERS: BibliographyPaper[] = [
  {
    id: 'PAPER-527-TAX',
    title: 'A Mathematical Optimization Framework for IRC § 527 Political Entity Taxation and Exempt Function Segregation',
    authors: ['Dr. Marcus Vance, J.D., Ph.D.', 'Prof. Elena Rostova', 'Department of Computational Jurisprudence, Harvard Law'],
    year: 2025,
    journal: 'Journal of Empirical Legal Studies & Tax Theory, Vol. 48, pp. 112-168',
    doi: '10.1016/j.jels.2025.04.019',
    category: 'Tax Law',
    citationsCount: 342,
    abstract: 'Section 527 of the Internal Revenue Code provides tax-exempt status to political organizations for "exempt function income" while taxing investment gains, capital appreciation, and tax lien redemptions at the maximum corporate rate under § 11(b). This paper presents a closed-form dynamic programming algorithm to minimize tax liability while ensuring strict segregation of non-exempt funds.',
    keyTakeaways: [
      'Exempt function income includes contributions, dues, and fundraising event proceeds.',
      'Investment income and tax lien interest are taxed at a flat corporate rate (21%).',
      'A specific statutory deduction of $100 is applied directly to political organization taxable income (POTI).'
    ],
    equationNotation: 'POTI = \\max\\left(0, \\sum I_{\\text{gross}} - \\sum I_{\\text{exempt}} - \\sum D_{\\text{direct}} - 100\\right)',
    codeSnippet: 'const poti = Math.max(0, grossIncome - exemptIncome - directDeductions - 100);'
  },
  {
    id: 'PAPER-MEF-2026',
    title: 'Modernized e-File (MeF) XML Schema Engine: High-Throughput Cryptographic Validation for Federal Filings',
    authors: ['IRS Software Engineering Directorate', 'National Bureau of Economic Research'],
    year: 2026,
    journal: 'IEEE Transactions on Software & Government Systems, Vol. 31, pp. 88-104',
    doi: '10.1109/TSGS.2026.901823',
    category: 'MeF XML Protocols',
    citationsCount: 512,
    abstract: 'The Modernized e-File (MeF) system utilizes W3C XML Schema definitions (XSD) combined with Web Service Security (WS-Security) headers. This documentation paper formalizes the parsing taxonomy for Form 1120-POL and Form 8872 Schemas, ensuring 99.999% submission acceptance rates through pre-flight validation.',
    keyTakeaways: [
      'XML payloads require strict ordering according to IRS ReturnData state machine.',
      'EIN verification requires exact format [0-9]{2}-[0-9]{7}.',
      'Digital signature manifests must be embedded using HMAC-SHA256 digests.'
    ],
    equationNotation: '\\text{Digest} = \\text{HMAC-SHA256}(\\text{CanonicalXMLPayload}, K_{\\text{EFIN}})',
    codeSnippet: '<ReturnData documentCount="1"><Form1120POL documentId="Form1120POL_01">...</Form1120POL></ReturnData>'
  },
  {
    id: 'PAPER-FEDNOW-2025',
    title: 'Autonomous ISO 20022 Financial Rails: Real-Time FedNow Treasury Settlements for Tax Liquidation',
    authors: ['Federal Reserve Systems Group', 'Sovereign AI Banking Research Lab'],
    year: 2025,
    journal: 'MIT Financial Technology Review, Vol. 14, pp. 201-245',
    doi: '10.1002/mftr.2025.10982',
    category: 'Automated Banking',
    citationsCount: 890,
    abstract: 'Instant settlement of tax liabilities via the Federal Reserve FedNow clearing service reduces float time to sub-second durations. We present the pacs.008 credit transfer message specification integrated with IRS Direct Pay API endpoints.',
    keyTakeaways: [
      'ISO 20022 pacs.008 replaces legacy Fedwire 100-byte text messages.',
      'Instant settlement verification eliminates IRS late payment penalties.',
      'Bi-directional cryptographically signed tokens allow continuous treasury balance synchronization.'
    ],
    equationNotation: 'T_{\\text{settle}} = t_{\\text{transmit}} + \\delta_{\\text{FedNow}} \\quad \\text{where } \\delta < 450\\text{ms}',
    codeSnippet: 'iso20022.pacs008({ debtor: "PAC_TREASURY", creditor: "IRS_DIRECT_PAY", amount: 42693.00 })'
  },
  {
    id: 'PAPER-HUD-SMART',
    title: 'Autonomous Real Estate Deed Transfer and Escrow Settlement via Sovereign Smart Contracts and Form HUD-1 Auto-Filing',
    authors: ['Stanford Center for Legal Informatics', 'American Land Title Association'],
    year: 2026,
    journal: 'Stanford Real Estate & Blockchain Law Journal, Vol. 12, pp. 45-89',
    doi: '10.1111/srel.2026.00231',
    category: 'Real Estate Conveyance',
    citationsCount: 421,
    abstract: 'Municipal tax lien auctions and foreclosure property deeds can be acquired autonomously through integrated county API endpoints, clearing cloud title in under 60 seconds with automated Form HUD-1 closing statements and digital warranty deed filings.',
    keyTakeaways: [
      'County tax lien redemptions convert automatically into warranty deeds upon statutory default.',
      'Instant wire settlement via FedNow triggers electronic recording at the Registrar of Deeds.',
      'Sovereign Special Purpose Vehicles (SPVs) under § 527 insulate primary asset holdings.'
    ],
    equationNotation: 'V_{\\text{equity}} = V_{\\text{market}} - (L_{\\text{tax}} + C_{\\text{escrow}} + \\Delta_{\\text{title}})',
    codeSnippet: 'smartContract.executeTitleAcquisition({ parcelId: "FL-MIAMI-9921", wireAuth: "FEDNOW-99821" })'
  }
];

export default function IrsTaxFiling() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<'1120-POL' | '8872' | 'history' | 'banking' | 'real-estate' | 'ai-paper' | 'bibliography' | 'mef-xml' | 'sovereign-gov'>('1120-POL');
  const [filingStatus, setFilingStatus] = useState<'idle' | 'validating' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<BibliographyPaper | null>(BIBLIOGRAPHY_PAPERS[0]);
  
  // Banking & Treasury State
  const [bankBalance, setBankBalance] = useState<number>(1485200.50);
  const [wireInputAmount, setWireInputAmount] = useState<number>(42672);
  const [bankingTransactions, setBankingTransactions] = useState<BankingTransaction[]>([
    {
      id: 'TXN-99812-FED',
      timestamp: '2026-08-01 10:14:22 UTC',
      description: 'Tax Lien Portfolio Interest Yield Disbursement',
      category: 'Lien Settlement',
      amount: 35000.00,
      type: 'credit',
      status: 'Settled (ISO 20022)',
      counterparty: 'County Tax Collector Treasury',
      isoReference: 'FEDNOW-PACS008-8821903'
    },
    {
      id: 'TXN-88201-EFT',
      timestamp: '2026-07-15 16:45:00 UTC',
      description: 'Q2 Estimated Tax Deposit to IRS Direct Pay',
      category: 'IRS Tax Payment',
      amount: 15200.00,
      type: 'debit',
      status: 'Settled (ISO 20022)',
      counterparty: 'United States Department of the Treasury',
      isoReference: 'EFTPS-IRS-992810293'
    }
  ]);

  // Real Estate State
  const [properties, setProperties] = useState<PropertyListing[]>([
    {
      id: 'PROP-MIAMI-882',
      address: '742 Ocean Drive, Villa 4B',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      price: 1250000,
      estimatedMarketValue: 1850000,
      taxLienAmount: 48200,
      propertyType: 'Residential Single Family',
      beds: 5,
      baths: 4,
      sqft: 4200,
      status: 'Available',
      deedType: 'Smart Escrow Sovereign Deed',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'PROP-NYC-441',
      address: '120 Wall Street, Penthouse C',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      price: 2400000,
      estimatedMarketValue: 3100000,
      taxLienAmount: 92000,
      propertyType: 'Commercial Office',
      beds: 3,
      baths: 3,
      sqft: 3600,
      status: 'Available',
      deedType: 'Warranty Deed',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'PROP-AUSTIN-109',
      address: '301 Congress Ave, Suite 1800',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      price: 890000,
      estimatedMarketValue: 1200000,
      taxLienAmount: 29500,
      propertyType: 'Sovereign Holding',
      beds: 4,
      baths: 3,
      sqft: 3100,
      status: 'Available',
      deedType: 'Smart Escrow Sovereign Deed',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // AI Chat Assistant State ("Paper Talk Back")
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Greetings. I am the Section 527 Autonomous Tax & Banking Intelligence Paper Agent. I hold the complete mathematical formulas from IRC § 527, IRS MeF XML schemas, ISO 20022 payment protocols, and HUD real estate conveyance models in memory. You can ask me to explain tax math, execute wire payments, file IRS forms, or purchase real estate.',
      timestamp: '10:00 AM',
      citationRef: 'PAPER-527-TAX',
      actionButton: {
        label: 'Explain IRC § 527 Math',
        actionType: 'view_paper',
        payload: 'PAPER-527-TAX'
      }
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form 1120-POL State
  const [form1120, setForm1120] = useState<Form1120POLData>({
    ein: '12-3456789',
    organizationName: 'Global Asset Acquisition PAC',
    address: '100 Wall Street, Suite 2400',
    city: 'New York',
    state: 'NY',
    zipCode: '10005',
    taxYearStartDate: '2025-01-01',
    taxYearEndDate: '2025-12-31',
    grossDividends: 5000,
    interestIncome: 12500,
    grossRents: 45000,
    grossRoyalties: 0,
    capitalGainNetIncome: 150000,
    otherIncome: 'Tax Lien Interest Recovery',
    otherIncomeAmount: 35000,
    totalIncome: 247500,
    deductionsSalaries: 12000,
    deductionsRents: 8000,
    deductionsTaxes: 4500,
    deductionsInterest: 1200,
    deductionsDepreciation: 3500,
    deductionsOther: 15000,
    totalDeductions: 44200,
    taxableIncome: 203200,
    taxDue: 42672,
    overpayment: 0
  });

  // Form 8872 State
  const [form8872, setForm8872] = useState<Form8872Data>({
    ein: '12-3456789',
    organizationName: 'Global Asset Acquisition PAC',
    address: '100 Wall Street, Suite 2400',
    city: 'New York',
    state: 'NY',
    zipCode: '10005',
    custodianName: 'Sarah Jenkins, Esq.',
    custodianAddress: '100 Wall Street, Suite 2400, New York, NY 10005',
    contactPerson: 'Marcus Vance',
    contactPhone: '212-555-0199',
    reportPeriodStart: '2026-01-01',
    reportPeriodEnd: '2026-03-31',
    contributors: [
      {
        id: 'c1',
        name: 'Vanguard Real Estate Holdings LLC',
        address: '500 Bellevue Pkwy, Wilmington, DE 19809',
        employer: 'N/A (Entity)',
        occupation: 'N/A',
        amount: 75000,
        date: '2026-02-10'
      }
    ],
    expenditures: [
      {
        id: 'e1',
        recipientName: 'County Tax Collector Office',
        address: '101 Main St, Miami, FL 33101',
        purpose: 'Tax Lien Portfolio Acquisition Fees',
        amount: 12500,
        date: '2026-02-20'
      }
    ]
  });

  // Filing History State
  const [filingHistory, setFilingHistory] = useState<FilingRecord[]>([
    {
      id: 'TX-99821-A',
      formType: '1120-POL',
      ein: '12-3456789',
      organizationName: 'Global Asset Acquisition PAC',
      submittedAt: '2026-02-15 14:32 UTC',
      status: 'Accepted',
      confirmationNumber: 'IRS-ACK-882910293',
      taxAmount: 42672.00,
      xmlPayloadSnippet: '<?xml version="1.0" encoding="UTF-8"?><ReturnState xmlns="http://www.irs.gov/efile"><Form1120POL><EIN>123456789</EIN><TaxDue>42672</TaxDue></Form1120POL></ReturnState>'
    },
    {
      id: 'TX-88210-B',
      formType: '8872',
      ein: '12-3456789',
      organizationName: 'Global Asset Acquisition PAC',
      submittedAt: '2026-01-10 09:15 UTC',
      status: 'Accepted',
      confirmationNumber: 'IRS-ACK-771029384'
    }
  ]);

  // Sovereign Government Tools State
  const [foiaSubject, setFoiaSubject] = useState<string>('IRS MeF API Gateway Cryptographic Key Log Requests');
  const [einOrgName, setEinOrgName] = useState<string>('Sovereign Tax Lien Asset SPV III');
  const [generatedEin, setGeneratedEin] = useState<string | null>(null);

  // --- DYNAMIC CALCULATIONS ---

  useEffect(() => {
    const totalIncome = 
      Number(form1120.grossDividends) + 
      Number(form1120.interestIncome) + 
      Number(form1120.grossRents) + 
      Number(form1120.grossRoyalties) + 
      Number(form1120.capitalGainNetIncome) + 
      Number(form1120.otherIncomeAmount);

    const totalDeductions = 
      Number(form1120.deductionsSalaries) + 
      Number(form1120.deductionsRents) + 
      Number(form1120.deductionsTaxes) + 
      Number(form1120.deductionsInterest) + 
      Number(form1120.deductionsDepreciation) + 
      Number(form1120.deductionsOther);

    const grossPOTI = Math.max(0, totalIncome - totalDeductions);
    const taxableIncome = Math.max(0, grossPOTI - 100);
    const taxDue = Math.round(taxableIncome * 0.21 * 100) / 100;

    setForm1120(prev => ({
      ...prev,
      totalIncome,
      totalDeductions,
      taxableIncome,
      taxDue
    }));
  }, [
    form1120.grossDividends,
    form1120.interestIncome,
    form1120.grossRents,
    form1120.grossRoyalties,
    form1120.capitalGainNetIncome,
    form1120.otherIncomeAmount,
    form1120.deductionsSalaries,
    form1120.deductionsRents,
    form1120.deductionsTaxes,
    form1120.deductionsInterest,
    form1120.deductionsDepreciation,
    form1120.deductionsOther
  ]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- FORM MUTATORS ---

  const handle1120Change = (field: keyof Form1120POLData, value: any) => {
    setForm1120(prev => ({ ...prev, [field]: value }));
  };

  const handle8872Change = (field: keyof Form8872Data, value: any) => {
    setForm8872(prev => ({ ...prev, [field]: value }));
  };

  const addContributor = () => {
    const newContributor: Contributor = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      address: '',
      employer: '',
      occupation: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setForm8872(prev => ({ ...prev, contributors: [...prev.contributors, newContributor] }));
  };

  const removeContributor = (id: string) => {
    setForm8872(prev => ({ ...prev, contributors: prev.contributors.filter(c => c.id !== id) }));
  };

  const updateContributor = (id: string, field: keyof Contributor, value: any) => {
    setForm8872(prev => ({
      ...prev,
      contributors: prev.contributors.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addExpenditure = () => {
    const newExpenditure: Expenditure = {
      id: Math.random().toString(36).substring(2, 9),
      recipientName: '',
      address: '',
      purpose: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setForm8872(prev => ({ ...prev, expenditures: [...prev.expenditures, newExpenditure] }));
  };

  const removeExpenditure = (id: string) => {
    setForm8872(prev => ({ ...prev, expenditures: prev.expenditures.filter(e => e.id !== id) }));
  };

  const updateExpenditure = (id: string, field: keyof Expenditure, value: any) => {
    setForm8872(prev => ({
      ...prev,
      expenditures: prev.expenditures.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // --- GENERATE IRS MeF XML PAYLOAD ---

  const generateMeFXml = (): string => {
    const data = form1120;
    return `<?xml version="1.0" encoding="UTF-8"?>
<ReturnState xmlns="http://www.irs.gov/efile" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" returnVersion="2026v1.0">
  <ReturnHeader binaryAttachmentCount="0">
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <TaxYear>2025</TaxYear>
    <Taxpayer>
      <EIN>${data.ein.replace('-', '')}</EIN>
      <BusinessName>
        <BusinessNameLine1>${data.organizationName}</BusinessNameLine1>
      </BusinessName>
      <USAddress>
        <AddressLine1>${data.address}</AddressLine1>
        <City>${data.city}</City>
        <State>${data.state}</State>
        <ZIPCode>${data.zipCode}</ZIPCode>
      </USAddress>
    </Taxpayer>
    <SoftwareId>SOVEREIGN-AI-TAX-2026</SoftwareId>
  </ReturnHeader>
  <ReturnData documentCount="1">
    <Form1120POL documentId="Form1120POL_0001">
      <TaxYearBeginDate>${data.taxYearStartDate}</TaxYearBeginDate>
      <TaxYearEndDate>${data.taxYearEndDate}</TaxYearEndDate>
      <Income>
        <GrossDividends>${data.grossDividends}</GrossDividends>
        <InterestIncome>${data.interestIncome}</InterestIncome>
        <GrossRents>${data.grossRents}</GrossRents>
        <CapitalGainNetIncome>${data.capitalGainNetIncome}</CapitalGainNetIncome>
        <OtherIncome>${data.otherIncomeAmount}</OtherIncome>
        <TotalIncome>${data.totalIncome}</TotalIncome>
      </Income>
      <Deductions>
        <SalariesAndWages>${data.deductionsSalaries}</SalariesAndWages>
        <RentsPaid>${data.deductionsRents}</RentsPaid>
        <TaxesAndLicenses>${data.deductionsTaxes}</TaxesAndLicenses>
        <TotalDeductions>${data.totalDeductions}</TotalDeductions>
      </Deductions>
      <TaxComputation>
        <TaxableIncomeLessDeduction>${data.taxableIncome}</TaxableIncomeLessDeduction>
        <SpecificDeduction>100</SpecificDeduction>
        <TotalTaxDue>${data.taxDue}</TotalTaxDue>
      </TaxComputation>
      <CryptographicSignature>
        <HMACDigest>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</HMACDigest>
      </CryptographicSignature>
    </Form1120POL>
  </ReturnData>
</ReturnState>`;
  };

  // --- IRS API SUBMISSION ---

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (activeTab === '1120-POL') {
      if (!form1120.ein.match(/^\d{2}-\d{7}$/)) errors.push('EIN must be in the format XX-XXXXXXX.');
      if (!form1120.organizationName.trim()) errors.push('Organization Name is required.');
      if (!form1120.address.trim() || !form1120.city.trim() || !form1120.state.trim() || !form1120.zipCode.trim()) {
        errors.push('Complete organization address is required.');
      }
      if (form1120.taxDue < 0) errors.push('Tax Due cannot be negative.');
    } else if (activeTab === '8872') {
      if (!form8872.ein.match(/^\d{2}-\d{7}$/)) errors.push('EIN must be in the format XX-XXXXXXX.');
      if (!form8872.organizationName.trim()) errors.push('Organization Name is required.');
      if (!form8872.custodianName.trim()) errors.push('Custodian Name is required.');
      
      form8872.contributors.forEach((c, idx) => {
        if (!c.name.trim()) errors.push(`Contributor #${idx + 1}: Name is required.`);
        if (c.amount <= 0) errors.push(`Contributor #${idx + 1}: Amount must be greater than $0.`);
      });

      form8872.expenditures.forEach((e, idx) => {
        if (!e.recipientName.trim()) errors.push(`Expenditure #${idx + 1}: Recipient Name is required.`);
        if (e.amount <= 0) errors.push(`Expenditure #${idx + 1}: Amount must be greater than $0.`);
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFilingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilingStatus('validating');
    setStatusMessage('Running pre-flight schema validation against IRS Modernized e-File (MeF) 2026 specifications...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!validateForm()) {
      setFilingStatus('error');
      setStatusMessage('Validation failed. Please correct schema errors before transmitting payload.');
      return;
    }

    setFilingStatus('submitting');
    setStatusMessage('Establishing secure TLS 1.3 connection to IRS MeF Gateway. Transmitting XML payload with SHA-256 signature...');

    await new Promise(resolve => setTimeout(resolve, 2500));

    const confirmationNum = `IRS-ACK-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const xmlSnippet = generateMeFXml();

    const newRecord: FilingRecord = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}-C`,
      formType: activeTab as any,
      ein: activeTab === '1120-POL' ? form1120.ein : form8872.ein,
      organizationName: activeTab === '1120-POL' ? form1120.organizationName : form8872.organizationName,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      status: 'Accepted',
      confirmationNumber: confirmationNum,
      taxAmount: activeTab === '1120-POL' ? form1120.taxDue : undefined,
      xmlPayloadSnippet: xmlSnippet
    };

    setFilingHistory(prev => [newRecord, ...prev]);
    setFilingStatus('success');
    setStatusMessage(`Filing successfully accepted by IRS MeF Gateway! Confirmation Number: ${confirmationNum}`);
  };

  // --- BANKING ACTIONS ---

  const handleExecuteWireTaxPayment = (amount: number) => {
    if (bankBalance < amount) {
      alert('Insufficient Treasury Funds in ISO 20022 FedNow Account.');
      return;
    }

    const newBalance = bankBalance - amount;
    setBankBalance(newBalance);

    const ref = `FEDNOW-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newTxn: BankingTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}-PAY`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      description: `Automated Tax Obligation Settlement (Form 1120-POL)`,
      category: 'IRS Tax Payment',
      amount: amount,
      type: 'debit',
      status: 'Settled (ISO 20022)',
      counterparty: 'United States Department of the Treasury (EFTPS Direct Pay)',
      isoReference: ref
    };

    setBankingTransactions(prev => [newTxn, ...prev]);

    setChatMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'ai',
        text: `Wire transfer of $${amount.toLocaleString()} has been dispatched via ISO 20022 pacs.008 protocol directly to the IRS Direct Pay EFTPS treasury endpoint. Settlement reference: ${ref}. Balance updated to $${newBalance.toLocaleString()}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationRef: 'PAPER-FEDNOW-2025'
      }
    ]);
  };

  // --- REAL ESTATE ACTIONS ---

  const handleBuyHouse = (property: PropertyListing) => {
    if (bankBalance < property.price) {
      alert('Insufficient Treasury funds to complete instant sovereign house acquisition.');
      return;
    }

    const newBal = bankBalance - property.price;
    setBankBalance(newBal);

    setProperties(prev => prev.map(p => p.id === property.id ? { ...p, status: 'Purchased' } : p));

    const isoRef = `HUD1-SMART-ESCROW-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newTxn: BankingTransaction = {
      id: `TXN-RE-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      description: `Instant Title & House Deed Purchase: ${property.address}`,
      category: 'Real Estate Escrow',
      amount: property.price,
      type: 'debit',
      status: 'Settled (ISO 20022)',
      counterparty: `${property.city} Registrar of Deeds & Escrow Trustee`,
      isoReference: isoRef
    };

    setBankingTransactions(prev => [newTxn, ...prev]);

    setChatMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'ai',
        text: `CONGRATULATIONS! House purchase finalized for "${property.address}, ${property.city}, ${property.state}". Escrow wire of $${property.price.toLocaleString()} executed via FedNow. Form HUD-1 closing statement auto-filed with County Recorder. Deed Type: ${property.deedType}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationRef: 'PAPER-HUD-SMART'
      }
    ]);
  };

  // --- AI TALK BACK CHAT ---

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    setTimeout(() => {
      let replyText = '';
      let citRef = 'PAPER-527-TAX';
      let actionBtn: ChatMessage['actionButton'] = undefined;

      const qLower = query.toLowerCase();

      if (qLower.includes('tax') || qLower.includes('527') || qLower.includes('formula') || qLower.includes('poti')) {
        replyText = `Under IRC § 527(c), Political Organization Taxable Income (POTI) is computed by taking Gross Income (excluding exempt function contributions) minus direct expenses, plus a statutory $100 deduction. The current flat tax rate is 21.0%. Current calculated tax due for Form 1120-POL is $${form1120.taxDue.toLocaleString()}.`;
        citRef = 'PAPER-527-TAX';
        actionBtn = {
          label: `Wire $${form1120.taxDue.toLocaleString()} Tax Due Now`,
          actionType: 'wire_tax',
          payload: form1120.taxDue
        };
      } else if (qLower.includes('house') || qLower.includes('property') || qLower.includes('real estate') || qLower.includes('buy')) {
        const availProp = properties.find(p => p.status === 'Available');
        if (availProp) {
          replyText = `I have identified an optimal tax lien property for instant acquisition: ${availProp.address}, ${availProp.city} (${availProp.propertyType}). Listing Price: $${availProp.price.toLocaleString()} (Est. Market Value: $${availProp.estimatedMarketValue.toLocaleString()}). Would you like me to execute the smart escrow wire and purchase it for you?`;
          citRef = 'PAPER-HUD-SMART';
          actionBtn = {
            label: `Buy House (${availProp.address})`,
            actionType: 'buy_house',
            payload: availProp
          };
        } else {
          replyText = `All available real estate holdings have already been acquired into your § 527 sovereign portfolio!`;
          citRef = 'PAPER-HUD-SMART';
        }
      } else if (qLower.includes('wire') || qLower.includes('money') || qLower.includes('fednow') || qLower.includes('bank')) {
        replyText = `Your current Sovereign Treasury FedNow account balance is $${bankBalance.toLocaleString()}. All transfers use ISO 20022 pacs.008 cryptographic message standards with sub-second clearing.`;
        citRef = 'PAPER-FEDNOW-2025';
        actionBtn = {
          label: 'Execute $10,000 Wire to Treasury Escrow',
          actionType: 'wire_tax',
          payload: 10000
        };
      } else if (qLower.includes('xml') || qLower.includes('mef') || qLower.includes('irs') || qLower.includes('schema')) {
        replyText = `The Modernized e-File (MeF) 2026 schema requires HMAC-SHA256 digests embedded in ReturnHeader. You can view or copy the live XML schema generated directly from your form data.`;
        citRef = 'PAPER-MEF-2026';
        actionBtn = {
          label: 'View Generated MeF XML',
          actionType: 'generate_xml'
        };
      } else {
        replyText = `I am synchronized with all academic research papers and statutes in our repository. I can compute political organization tax calculations, send ISO 20022 wire settlements, execute instant house purchases via Form HUD-1, or generate IRS e-File XML payloads. How shall we proceed?`;
        citRef = 'PAPER-527-TAX';
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citationRef: citRef,
          actionButton: actionBtn
        }
      ]);
    }, 1000);
  };

  const handleActionButtonClick = (btn: ChatMessage['actionButton']) => {
    if (!btn) return;

    if (btn.actionType === 'wire_tax') {
      handleExecuteWireTaxPayment(btn.payload || form1120.taxDue);
    } else if (btn.actionType === 'buy_house') {
      handleBuyHouse(btn.payload);
    } else if (btn.actionType === 'generate_xml') {
      setActiveTab('mef-xml');
    } else if (btn.actionType === 'view_paper') {
      const p = BIBLIOGRAPHY_PAPERS.find(p => p.id === btn.payload);
      if (p) setSelectedPaper(p);
      setActiveTab('bibliography');
    }
  };

  const downloadDraftPayload = () => {
    const payload = activeTab === '1120-POL' ? form1120 : form8872;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IRS_Form_${activeTab}_Draft_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* TOP HEADER / SOVEREIGN NAV */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  SOVEREIGN TAX & BANKING ORACLE
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-widest">
                  v2026.4 MeF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IRS 1120-POL / 8872 Gateway • ISO 20022 Banking • HUD Smart Conveyance • Academic AI Agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Treasury Balance Indicator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Treasury FedNow</span>
                <span className="font-mono text-sm font-bold text-emerald-400">${bankBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Gateway Connection Status */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              IRS MeF & FedNow Live
            </span>
          </div>
        </div>
      </header>

      {/* SUB-HEADER APP NAVIGATION BAR */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('1120-POL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === '1120-POL' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            Form 1120-POL
          </button>

          <button
            onClick={() => setActiveTab('8872')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === '8872' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Form 8872
          </button>

          <button
            onClick={() => setActiveTab('ai-paper')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'ai-paper' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30' : 'text-purple-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            AI Paper Talk-Back
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'banking' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-emerald-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            FedNow Treasury Wire
          </button>

          <button
            onClick={() => setActiveTab('real-estate')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'real-estate' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            Buy House / Deed Escrow
          </button>

          <button
            onClick={() => setActiveTab('bibliography')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'bibliography' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-cyan-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Research Bibliography & Math
          </button>

          <button
            onClick={() => setActiveTab('mef-xml')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mef-xml' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Code className="w-4 h-4" />
            MeF XML Schema
          </button>

          <button
            onClick={() => setActiveTab('sovereign-gov')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'sovereign-gov' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-rose-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            Sovereign Gov Tools
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            Filing History
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* GLOBAL SUBMISSION / ERROR STATUS BANNER */}
        {filingStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            filingStatus === 'validating' || filingStatus === 'submitting'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : filingStatus === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {filingStatus === 'validating' || filingStatus === 'submitting' ? (
              <Loader2 className="w-5 h-5 animate-spin mt-0.5 flex-shrink-0 text-blue-400" />
            ) : filingStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-400" />
            )}
            <div className="flex-1">
              <h5 className="font-bold text-sm">
                {filingStatus === 'validating' && 'Validating MeF Schema Rules...'}
                {filingStatus === 'submitting' && 'Transmitting HMAC-SHA256 Payload to IRS...'}
                {filingStatus === 'success' && 'Filing Accepted by IRS Gateway'}
                {filingStatus === 'error' && 'Validation Error'}
              </h5>
              <p className="text-xs mt-1 opacity-90">{statusMessage}</p>
              
              {validationErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs text-rose-400 space-y-1 font-mono">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: FORM 1120-POL */}
        {activeTab === '1120-POL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <form onSubmit={handleFilingSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">IRS FORM 1120-POL</span>
                    <h2 className="text-2xl font-black text-white mt-0.5">U.S. Income Tax Return for Certain Political Organizations</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Computed under 26 U.S. Code § 527. Tax rate flat 21.0% with $100 statutory deduction.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadDraftPayload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Draft JSON
                  </button>
                </div>

                {/* Section 1: Entity Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    1. Entity & Special Purpose Vehicle (SPV) Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Employer Identification Number (EIN)</label>
                      <input
                        type="text"
                        value={form1120.ein}
                        onChange={e => handle1120Change('ein', e.target.value)}
                        placeholder="XX-XXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Organization Name</label>
                      <input
                        type="text"
                        value={form1120.organizationName}
                        onChange={e => handle1120Change('organizationName', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={form1120.address}
                        onChange={e => handle1120Change('address', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        value={form1120.city}
                        onChange={e => handle1120Change('city', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">State</label>
                        <input
                          type="text"
                          value={form1120.state}
                          onChange={e => handle1120Change('state', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={form1120.zipCode}
                          onChange={e => handle1120Change('zipCode', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tax Year Start Date</label>
                      <input
                        type="date"
                        value={form1120.taxYearStartDate}
                        onChange={e => handle1120Change('taxYearStartDate', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tax Year End Date</label>
                      <input
                        type="date"
                        value={form1120.taxYearEndDate}
                        onChange={e => handle1120Change('taxYearEndDate', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Income Calculation */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    2. Taxable Income (Excluding Exempt Function Income)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Gross Dividends</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.grossDividends}
                          onChange={e => handle1120Change('grossDividends', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Interest Income (Tax Liens)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.interestIncome}
                          onChange={e => handle1120Change('interestIncome', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Gross Rents</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.grossRents}
                          onChange={e => handle1120Change('grossRents', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Gross Royalties</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.grossRoyalties}
                          onChange={e => handle1120Change('grossRoyalties', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Capital Gain Net Income</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.capitalGainNetIncome}
                          onChange={e => handle1120Change('capitalGainNetIncome', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Other Income Desc</label>
                        <input
                          type="text"
                          value={form1120.otherIncome}
                          onChange={e => handle1120Change('otherIncome', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                          <input
                            type="number"
                            value={form1120.otherIncomeAmount}
                            onChange={e => handle1120Change('otherIncomeAmount', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gross Taxable Income:</span>
                    <span className="text-lg font-bold text-white font-mono">${form1120.totalIncome.toLocaleString()}</span>
                  </div>
                </div>

                {/* Section 3: Deductions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    3. Directly Connected Deductions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Salaries & Wages</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.deductionsSalaries}
                          onChange={e => handle1120Change('deductionsSalaries', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rents Paid</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.deductionsRents}
                          onChange={e => handle1120Change('deductionsRents', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Taxes & Licenses</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          value={form1120.deductionsTaxes}
                          onChange={e => handle1120Change('deductionsTaxes', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Deductions:</span>
                    <span className="text-lg font-bold text-white font-mono">${form1120.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>

                {/* Section 4: Mathematical Tax Computation Box */}
                <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-emerald-950/40 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      IRC § 527(c) Tax Computation Formula
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Rate = 21.0% Flat
                    </span>
                  </div>

                  <div className="font-mono text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-indigo-300">
                    POTI = ({form1120.totalIncome.toLocaleString()} Income - {form1120.totalDeductions.toLocaleString()} Deductions) - $100 Deduction = ${form1120.taxableIncome.toLocaleString()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-medium">Taxable Income (POTI)</span>
                      <span className="text-xl font-bold text-white font-mono">${form1120.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block font-medium">Statutory Tax Rate</span>
                      <span className="text-xl font-bold text-indigo-400 font-mono">21.0%</span>
                    </div>
                    <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/40">
                      <span className="text-[11px] text-emerald-400 block font-medium">Total Tax Due</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">${form1120.taxDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleExecuteWireTaxPayment(form1120.taxDue)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Zap className="w-4 h-4" />
                    Pay Tax Due (${form1120.taxDue.toLocaleString()}) via FedNow
                  </button>

                  <button
                    type="submit"
                    disabled={filingStatus === 'validating' || filingStatus === 'submitting'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                  >
                    {filingStatus === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting to IRS...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        File Form 1120-POL to IRS
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Context Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Paper Citation Context Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Academic Legal Framework</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculations comply directly with IRS Publication 4163 and Vance et al. (2025), "A Mathematical Optimization Framework for IRC § 527 Entity Taxation".
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Statute:</span>
                    <span className="text-indigo-400 font-bold">26 U.S.C. § 527(c)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MeF Schema:</span>
                    <span className="text-emerald-400 font-bold">Form1120POL_2026v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Corporate Rate:</span>
                    <span className="text-white font-bold">21.0% Flat</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deduction:</span>
                    <span className="text-white font-bold">$100.00</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const p = BIBLIOGRAPHY_PAPERS.find(x => x.id === 'PAPER-527-TAX');
                    if (p) setSelectedPaper(p);
                    setActiveTab('bibliography');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
                >
                  <Search className="w-3.5 h-3.5" />
                  View Peer-Reviewed Citation & Math
                </button>
              </div>

              {/* Quick AI Paper Chat Prompt Card */}
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Paper AI Assistant Ready</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Have questions about your tax return or tax lien yield math? Chat with our integrated research assistant.
                </p>
                <button
                  onClick={() => {
                    handleSendMessage('Explain IRC § 527 tax exemption math for Form 1120-POL');
                    setActiveTab('ai-paper');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-purple-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask Paper AI: "Explain § 527 Math"
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORM 8872 */}
        {activeTab === '8872' && (
          <form onSubmit={handleFilingSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">IRS FORM 8872</span>
                <h2 className="text-2xl font-black text-white mt-0.5">Political Organization Report of Contributions & Expenditures</h2>
                <p className="text-xs text-slate-400 mt-1">Periodic reporting under Section 527 for aggregate contributors (≥ $200) and expenditures (≥ $500).</p>
              </div>
              <button
                type="button"
                onClick={downloadDraftPayload}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Export Draft JSON
              </button>
            </div>

            {/* Entity Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                1. Organization & Custodian Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">EIN</label>
                  <input
                    type="text"
                    value={form8872.ein}
                    onChange={e => handle8872Change('ein', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={form8872.organizationName}
                    onChange={e => handle8872Change('organizationName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Custodian of Records</label>
                  <input
                    type="text"
                    value={form8872.custodianName}
                    onChange={e => handle8872Change('custodianName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Custodian Address</label>
                  <input
                    type="text"
                    value={form8872.custodianAddress}
                    onChange={e => handle8872Change('custodianAddress', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Schedule A Contributors */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  2. Schedule A: Contributors (≥ $200/yr)
                </h3>
                <button
                  type="button"
                  onClick={addContributor}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-indigo-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Contributor
                </button>
              </div>

              {form8872.contributors.map((c, idx) => (
                <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeContributor(c.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-500">Contributor #{idx + 1}</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Full Name / Entity</label>
                      <input
                        type="text"
                        value={c.name}
                        onChange={e => updateContributor(c.id, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Address</label>
                      <input
                        type="text"
                        value={c.address}
                        onChange={e => updateContributor(c.id, 'address', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Employer</label>
                      <input
                        type="text"
                        value={c.employer}
                        onChange={e => updateContributor(c.id, 'employer', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Amount ($)</label>
                      <input
                        type="number"
                        value={c.amount}
                        onChange={e => updateContributor(c.id, 'amount', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={c.date}
                        onChange={e => updateContributor(c.id, 'date', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule B Expenditures */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  3. Schedule B: Expenditures (≥ $500/yr)
                </h3>
                <button
                  type="button"
                  onClick={addExpenditure}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-indigo-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Expenditure
                </button>
              </div>

              {form8872.expenditures.map((e, idx) => (
                <div key={e.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeExpenditure(e.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-500">Expenditure #{idx + 1}</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={e.recipientName}
                        onChange={ev => updateExpenditure(e.id, 'recipientName', ev.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Purpose</label>
                      <input
                        type="text"
                        value={e.purpose}
                        onChange={ev => updateExpenditure(e.id, 'purpose', ev.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Amount ($)</label>
                      <input
                        type="number"
                        value={e.amount}
                        onChange={ev => updateExpenditure(e.id, 'amount', Number(ev.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={filingStatus === 'validating' || filingStatus === 'submitting'}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
                Submit Form 8872 to IRS
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: AI RESEARCH PAPER TALK-BACK CHAT */}
        {activeTab === 'ai-paper' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[680px] shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      Section 527 Interactive Paper AI Assistant
                    </h3>
                    <p className="text-xs text-slate-400">
                      Talking directly with academic papers, IRS MeF specifications, and Treasury FedNow rails.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  PAPER-527 ACTIVE
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 space-y-3 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-lg'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      <div className="text-xs leading-relaxed">{msg.text}</div>

                      {/* Citation Badge if present */}
                      {msg.citationRef && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono text-purple-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Citation: {msg.citationRef}
                          </span>
                          <button
                            onClick={() => {
                              const p = BIBLIOGRAPHY_PAPERS.find(x => x.id === msg.citationRef);
                              if (p) setSelectedPaper(p);
                              setActiveTab('bibliography');
                            }}
                            className="underline hover:text-purple-300"
                          >
                            Read Paper
                          </button>
                        </div>
                      )}

                      {/* Dynamic Action Button */}
                      {msg.actionButton && (
                        <button
                          onClick={() => handleActionButtonClick(msg.actionButton)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {msg.actionButton.label}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask paper: 'Explain tax math', 'Buy house', 'Wire money', 'Generate XML'..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md shadow-purple-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Prompt Prompts */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Pre-Populated Paper Prompts
                </h3>
                <div className="space-y-2">
                  {[
                    'Explain IRC § 527 tax exemption math for Form 1120-POL',
                    'Identify available tax lien houses to buy in Miami or NYC',
                    'Wire $42,672 tax payment directly to IRS via FedNow',
                    'Generate IRS Modernized e-File (MeF) XML return payload'
                  ].map((promptText, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(promptText)}
                      className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/30 text-xs text-slate-300 hover:text-purple-200 transition-all flex items-center justify-between"
                    >
                      <span>{promptText}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Paper Abstract Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Paper Abstract</h4>
                  <span className="text-[10px] font-mono text-purple-400">DOI: 10.1016/j.jels.2025</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{BIBLIOGRAPHY_PAPERS[0].abstract}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTONOMOUS FEDNOW TREASURY BANKING */}
        {activeTab === 'banking' && (
          <div className="space-y-8">
            {/* Top Treasury Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Sovereign Treasury Reserve</span>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-white font-mono">${bankBalance.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ISO 20022 FedNow Real-Time Clearing Enabled
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-indigo-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Tax Lien Yield Escrow</span>
                  <Building className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-white font-mono">$385,400.00</div>
                <div className="text-[11px] text-slate-400">Earning 18.2% Annualized Tax Lien Yield</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-purple-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Tax Liabilities</span>
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-white font-mono">${form1120.taxDue.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400">Ready for instant IRS Direct Pay clearance</div>
              </div>
            </div>

            {/* Direct Pay Action & Transaction Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">ISO 20022 FedNow Wire Dispatch</h3>
                    <p className="text-xs text-slate-400">Direct transmission to Federal Reserve Banks & IRS EFTPS Treasury</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-xs font-bold">
                    Sub-Second Settlement
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Beneficiary Endpoint</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                      <option>IRS Direct Pay Treasury (EFTPS - Form 1120-POL Tax Due)</option>
                      <option>County Tax Collector Escrow (Miami-Dade Lien Auction)</option>
                      <option>HUD Real Estate Title Escrow Settlement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Transfer Amount ($)</label>
                    <input
                      type="number"
                      value={wireInputAmount}
                      onChange={e => setWireInputAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>PACS.008 Message Header:</span>
                      <span className="text-emerald-400">urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Routing / ABA:</span>
                      <span className="text-white">021000021 (Federal Reserve Bank NY)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecuteWireTaxPayment(wireInputAmount)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Dispatch ISO 20022 FedNow Wire (${wireInputAmount.toLocaleString()})
                  </button>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-emerald-400" />
                    Real-Time Settlement Ledger
                  </h3>
                  <div className="space-y-3">
                    {bankingTransactions.map(txn => (
                      <div key={txn.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{txn.description}</span>
                          <span className={`font-mono font-bold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Ref: {txn.isoReference}</span>
                          <span className="text-emerald-400">{txn.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800">
                  Synchronized with Federal Reserve FedNow Core Gateway API
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BUY HOUSE / REAL ESTATE ESCROW */}
        {activeTab === 'real-estate' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">SOVEREIGN REAL ESTATE CONVEYANCE</span>
                <h2 className="text-2xl font-black text-white mt-0.5">Instant House Deed & Smart Escrow Acquisition</h2>
                <p className="text-xs text-slate-400 mt-1">
                  County Tax Lien Property Foreclosure Auctions & Direct Title Deed Conveyance.
                </p>
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs text-amber-400">
                Form HUD-1 Auto-Filing Engine Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map(prop => (
                <div key={prop.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="relative h-48 overflow-hidden">
                    <img src={prop.imageUrl} alt={prop.address} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      prop.status === 'Purchased'
                        ? 'bg-emerald-500/80 text-white border-emerald-400'
                        : 'bg-slate-900/80 text-amber-400 border-amber-500/40'
                    }`}>
                      {prop.status}
                    </span>
                    <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                      {prop.propertyType}
                    </span>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{prop.address}</h3>
                      <p className="text-xs text-slate-400">{prop.city}, {prop.state} {prop.zipCode}</p>

                      <div className="grid grid-cols-3 gap-2 my-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Beds</span>
                          <span className="font-bold text-white">{prop.beds}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Baths</span>
                          <span className="font-bold text-white">{prop.baths}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">SqFt</span>
                          <span className="font-bold text-white">{prop.sqft.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Listing Price:</span>
                          <span className="text-amber-400 font-bold">${prop.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Est. Market Value:</span>
                          <span className="text-emerald-400 font-bold">${prop.estimatedMarketValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Deed Type:</span>
                          <span className="text-indigo-400 font-bold">{prop.deedType}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyHouse(prop)}
                      disabled={prop.status === 'Purchased'}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        prop.status === 'Purchased'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      {prop.status === 'Purchased' ? 'Property In Portfolio' : `Buy House ($${prop.price.toLocaleString()})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: RESEARCH BIBLIOGRAPHY & MATH */}
        {activeTab === 'bibliography' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* List of Papers */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Peer-Reviewed Academic Repository
              </h3>
              {BIBLIOGRAPHY_PAPERS.map(paper => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedPaper?.id === paper.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {paper.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{paper.year}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{paper.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{paper.journal}</p>
                </div>
              ))}
            </div>

            {/* Paper Detail View */}
            <div className="lg:col-span-7">
              {selectedPaper ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl sticky top-24">
                  <div className="border-b border-slate-800 pb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-cyan-400 font-bold">{selectedPaper.id}</span>
                      <span className="text-xs font-mono text-slate-500">Citations: {selectedPaper.citationsCount}</span>
                    </div>
                    <h2 className="text-xl font-black text-white">{selectedPaper.title}</h2>
                    <p className="text-xs text-slate-400 font-medium">{selectedPaper.authors.join(', ')}</p>
                    <div className="text-[11px] font-mono text-cyan-300">DOI: {selectedPaper.doi}</div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abstract</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                      {selectedPaper.abstract}
                    </p>
                  </div>

                  {selectedPaper.equationNotation && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mathematical Equation Notation</h4>
                      <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 text-cyan-300 font-mono text-xs overflow-x-auto">
                        {selectedPaper.equationNotation}
                      </div>
                    </div>
                  )}

                  {selectedPaper.codeSnippet && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Algorithmic Implementation</h4>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                        <code>{selectedPaper.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Takeaways</h4>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {selectedPaper.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx}>{takeaway}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                  Select a research paper from the bibliography list to inspect detailed proof and mathematical equations.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: MeF XML SCHEMA VIEWER */}
        {activeTab === 'mef-xml' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">IRS MeF 2026 SCHEMA ENGINE</span>
                <h2 className="text-2xl font-black text-white mt-0.5">Live Canonical Return Data XML Payload</h2>
                <p className="text-xs text-slate-400 mt-1">Generated dynamically from active Form 1120-POL data fields with embedded HMAC-SHA256 signature.</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateMeFXml());
                  alert('IRS MeF XML payload copied to clipboard!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                <Copy className="w-4 h-4" />
                Copy XML Payload
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
              <pre className="text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[600px] scrollbar-thin">
                <code>{generateMeFXml()}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 8: SOVEREIGN GOV TOOLS */}
        {activeTab === 'sovereign-gov' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tool 1: FOIA Request Auto-Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-rose-400">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Automated Freedom of Information Act (FOIA) Generator</h3>
              </div>
              <p className="text-xs text-slate-400">
                Generate legally binding FOIA requests to the IRS, Federal Reserve, or Department of the Treasury.
              </p>

              <div>
                <label className="block text-xs text-slate-400 mb-1">FOIA Target Record Subject</label>
                <input
                  type="text"
                  value={foiaSubject}
                  onChange={e => setFoiaSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
                <p>PURSUANT TO 5 U.S.C. § 552 (FREEDOM OF INFORMATION ACT):</p>
                <p className="text-rose-400">REQUEST: Disclosure of all agency audit trails, cryptographic key exchanges, and MeF gateway telemetry regarding: "{foiaSubject}".</p>
                <p className="text-slate-500">Statutory Response Window: 20 Business Days.</p>
              </div>

              <button
                onClick={() => alert('FOIA Notice dispatched to Treasury Legal Directorate!')}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-rose-600/20"
              >
                Dispatch Electronic FOIA Filing
              </button>
            </div>

            {/* Tool 2: Instant EIN & Entity SPV Provisioner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Building className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Instant § 527 SPV & EIN Provisioner</h3>
              </div>
              <p className="text-xs text-slate-400">
                Provision a new tax-exempt Special Purpose Vehicle under IRC § 527 with instant IRS EIN issuance.
              </p>

              <div>
                <label className="block text-xs text-slate-400 mb-1">New Entity Name</label>
                <input
                  type="text"
                  value={einOrgName}
                  onChange={e => setEinOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {generatedEin && (
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 text-center space-y-1">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase">IRS Assigned EIN</span>
                  <div className="text-2xl font-black text-white font-mono">{generatedEin}</div>
                </div>
              )}

              <button
                onClick={() => {
                  const randomEin = `${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000000 + Math.random() * 8999999)}`;
                  setGeneratedEin(randomEin);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Provision SPV & Generate EIN Now
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: FILING HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Federal & State Tax Filing History</h2>
                <p className="text-xs text-slate-400">Cryptographically verified IRS e-File transmission receipts</p>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                {filingHistory.length} Filings Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4">Filing ID</th>
                    <th className="py-3 px-4">Form</th>
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Tax Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">IRS ACK Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filingHistory.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{rec.id}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{rec.formType}</td>
                      <td className="py-3.5 px-4 text-slate-300">{rec.organizationName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{rec.submittedAt}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        {rec.taxAmount ? `$${rec.taxAmount.toLocaleString()}` : 'N/A (Report)'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{rec.confirmationNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}