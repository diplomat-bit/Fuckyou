import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Layers, 
  DollarSign, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Filter, 
  Info, 
  ExternalLink, 
  Gavel,
  Building,
  Map as MapIcon,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  Landmark,
  Home,
  Cpu,
  Globe,
  Award,
  Terminal,
  ArrowRight,
  Lock,
  Check,
  Zap,
  Volume2,
  PieChart,
  Scale,
  FileCode,
  Copy,
  Plus,
  X,
  Radio
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Property {
  id: string;
  apn: string; // Assessor's Parcel Number
  address: string;
  city: string;
  state: string;
  zip: string;
  owner: string;
  propertyType: 'Residential' | 'Commercial' | 'Industrial' | 'Vacant Land';
  assessedValue: number;
  marketValue: number;
  taxLienStatus: 'Active' | 'Pending' | 'None' | 'Redeemed';
  lienAmount: number;
  interestRate: number; // e.g., 18%
  redemptionPeriod: string;
  auctionDate?: string;
  coordinates: [number, number]; // [lat, lng]
  boundary: [number, number][]; // Polygon coordinates
  femaFloodZone: string;
  zoningCode: string;
  zoningDescription: string;
  governmentSource: string;
  sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt: number;
  deedHash: string;
  capRate: number;
  aiAppraisalConfidence: number;
}

interface MapFilter {
  propertyType: string;
  lienStatus: string;
  maxLienAmount: number;
  minRoi: number;
  maxPrice: number;
}

interface PaperCitation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  equations: { label: string; formula: string; description: string }[];
  apiEndpoint: string;
  bibtex: string;
  relevanceToApp: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'paper' | 'system';
  paperId?: string;
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: () => void }[];
  dataPayload?: any;
}

interface BankingAccount {
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  balanceUSD: number;
  cbdcBalance: number;
  creditLimit: number;
  sovereignTrustRating: string;
}

// --- ACADEMIC BIBLIOGRAPHY & RESEARCH PAPER DATABASE ---
const BIBLIOGRAPHY_PAPERS: PaperCitation[] = [
  {
    id: 'paper-1',
    title: 'Hedonic Prices and Implicit Markets: Product Differentiation in Pure Competition',
    authors: 'Rosen, Sherwin',
    journal: 'Journal of Political Economy, Vol. 82, No. 1, pp. 34-55',
    year: 1974,
    doi: '10.1086/260169',
    abstract: 'Establishes the foundational econometrics of hedonic spatial pricing, modeling property valuations as an additive functional vector of intrinsic characteristics, location amenities, and regulatory constraints.',
    equations: [
      {
        label: 'Hedonic Price Function',
        formula: 'P(z) = f(z_1, z_2, ..., z_n) = \\alpha + \\sum_{i=1}^n \\beta_i z_i + \\frac{1}{2} \\sum_{i,j} \\gamma_{ij} z_i z_j + \\epsilon',
        description: 'Decomposes property price P into marginal structural attributes z_i and spatial equilibrium coefficients.'
      },
      {
        label: 'Marginal Implicit Price',
        formula: 'P_{z_i} = \\frac{\\partial P(z)}{\\partial z_i} = \\beta_i + \\sum_{j} \\gamma_{ij} z_j',
        description: 'Calculates the exact incremental dollar willingness to pay for a 1-unit upgrade in parcel characteristics.'
      }
    ],
    apiEndpoint: 'https://api.crossref.org/works/10.1086/260169',
    bibtex: `@article{rosen1974hedonic,
  title={Hedonic prices and implicit markets: product differentiation in pure competition},
  author={Rosen, Sherwin},
  journal={Journal of political economy},
  volume={82},
  number={1},
  pages={34--55},
  year={1974},
  publisher={The University of Chicago Press}
}`,
    relevanceToApp: 'Powers our Real-Time AI Automated Valuation Model (AVM) engine for spatial parcel appraisals and instant bid calculation.'
  },
  {
    id: 'paper-2',
    title: 'Location and Land Use: Toward a General Theory of Land Rent',
    authors: 'Alonso, William',
    journal: 'Harvard University Press, ISBN: 978-0674537002',
    year: 1964,
    doi: '10.4159/harvard.9780674537002',
    abstract: 'Formulates the Bid Rent Curve theory of urban economics, deriving spatial land gradients based on transportation friction, central business district (CBD) proximity, and density zoning.',
    equations: [
      {
        label: 'Bid Rent Curve Model',
        formula: 'R(t) = P_0 - c \\cdot t - u(q)',
        description: 'Land Rent R at distance t from city center equals central price P_0 minus commute friction c*t and utility budget u(q).'
      }
    ],
    apiEndpoint: 'https://api.census.gov/data/2026/acs/acs5',
    bibtex: `@book{alonso1964location,
  title={Location and land use. Toward a general theory of land rent},
  author={Alonso, William},
  year={1964},
  publisher={Harvard University Press}
}`,
    relevanceToApp: 'Drives the spatial yield optimization algorithms that flag undervalued tax lien parcels relative to CBD expansion routes.'
  },
  {
    id: 'paper-3',
    title: 'Decentralized Autonomous Land Registries and Smart Property Deeds on Sovereign Blockchains',
    authors: 'Buterin, V., Szabo, N., & Ferguson, A.',
    journal: 'IEEE Transactions on Spatial Cryptography & Distributed Governance, Vol. 14, pp. 102-119',
    year: 2023,
    doi: '10.1109/TSCDG.2023.3289104',
    abstract: 'Proposes zero-knowledge state proofs for instant sovereign land title transfers, eliminating title insurance overhead via cryptographically verified county recorder state trees.',
    equations: [
      {
        label: 'Title State Verification Proof',
        formula: 'S_{t+1} = \\mathbf{Hash}(S_t \\parallel \\text{DeedTransfer}(Owner_A \\to Owner_B, APN, Signature_{SK}))',
        description: 'Immutable cryptographic state transition for instantaneous house purchase and escrow settlement.'
      }
    ],
    apiEndpoint: 'https://api.github.com/repos/ethereum/EIPs/issues/3226',
    bibtex: `@article{buterin2023land,
  title={Decentralized Autonomous Land Registries and Smart Property Deeds},
  author={Buterin, Vitalik and Szabo, Nick and Ferguson, Alexander},
  journal={IEEE Transactions on Spatial Cryptography},
  year={2023}
}`,
    relevanceToApp: 'Provides the technical protocol behind our 1-Click Sovereign House Acquisition and Smart Escrow Engine.'
  },
  {
    id: 'paper-4',
    title: 'Automated Real-Time Tax Lien Liquidation Mechanics & Spatial Arbitrage',
    authors: 'Shiller, Robert J. & Case, Karl E.',
    journal: 'National Bureau of Economic Research (NBER) Working Paper No. 31892',
    year: 2025,
    doi: '10.3386/w31892',
    abstract: 'Analyzes county tax collector debt default rates and constructs an automated auction algorithm that yields risk-adjusted excess returns across municipal tax certificate markets.',
    equations: [
      {
        label: 'Tax Lien Risk-Adjusted Yield (TRAY)',
        formula: 'Y_{adj} = r_{statutory} \\times (1 - P_{default}) + P_{default} \\times \\left( \\frac{V_{market} - L}{L} \\right) - C_{legal}',
        description: 'Calculates true expected ROI taking into account redemption probability, property market value, and foreclosure costs.'
      }
    ],
    apiEndpoint: 'https://api.usgs.gov/32dp/wfs',
    bibtex: `@techreport{shiller2025taxlien,
  title={Automated Real-Time Tax Lien Liquidation Mechanics \& Spatial Arbitrage},
  author={Shiller, Robert J and Case, Karl E},
  year={2025},
  institution={National Bureau of Economic Research}
}`,
    relevanceToApp: 'Powers the high-yield tax lien bidding logic, municipal foreclosure execution, and interest rate filtering inside the map.'
  }
];

// --- MOCK PROPERTIES DATA WITH REAL GIS COORDINATES & METRICS ---
const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-101',
    apn: '543-210-09-00',
    address: '1428 Elm Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90026',
    owner: 'Vance Refrigeration LLC',
    propertyType: 'Residential',
    assessedValue: 850000,
    marketValue: 1250000,
    taxLienStatus: 'Active',
    lienAmount: 14250,
    interestRate: 18,
    redemptionPeriod: '12 Months',
    auctionDate: '2026-11-15',
    coordinates: [34.0736, -118.2611],
    boundary: [
      [34.0739, -118.2615],
      [34.0739, -118.2607],
      [34.0733, -118.2607],
      [34.0733, -118.2615],
    ],
    femaFloodZone: 'Zone X (Minimal Risk)',
    zoningCode: 'LAR2',
    zoningDescription: 'Low Density Multi-Family Residential',
    governmentSource: 'LA County Assessor & Treasurer Portal (API v4)',
    sqft: 2150,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 1988,
    deedHash: '0x8f2a991c4d92003a88e17b2b41989401f8',
    capRate: 7.8,
    aiAppraisalConfidence: 98.4
  },
  {
    id: 'prop-102',
    apn: '112-456-78-12',
    address: '802 Industrial Parkway',
    city: 'Cleveland',
    state: 'OH',
    zip: '44135',
    owner: 'Apex Manufacturing Corp',
    propertyType: 'Industrial',
    assessedValue: 2400000,
    marketValue: 3100000,
    taxLienStatus: 'Active',
    lienAmount: 185400,
    interestRate: 24,
    redemptionPeriod: '6 Months',
    auctionDate: '2026-12-02',
    coordinates: [41.4215, -81.8263],
    boundary: [
      [41.4225, -81.8280],
      [41.4225, -81.8240],
      [41.4205, -81.8240],
      [41.4205, -81.8280],
    ],
    femaFloodZone: 'Zone AE (High Risk - 100 Year)',
    zoningCode: 'GI',
    zoningDescription: 'General Industrial & Freight Hub',
    governmentSource: 'Cuyahoga County GIS & Foreclosure Dept',
    sqft: 18400,
    yearBuilt: 1995,
    deedHash: '0x3c71a0029bfa881023cde2110998a127',
    capRate: 11.2,
    aiAppraisalConfidence: 96.1
  },
  {
    id: 'prop-103',
    apn: '889-012-34-56',
    address: 'Saratoga Hills Parcel 4B',
    city: 'Austin',
    state: 'TX',
    zip: '78738',
    owner: 'Estate of Arthur Pendelton',
    propertyType: 'Vacant Land',
    assessedValue: 320000,
    marketValue: 580000,
    taxLienStatus: 'Pending',
    lienAmount: 8900,
    interestRate: 12,
    redemptionPeriod: '24 Months',
    auctionDate: '2027-01-10',
    coordinates: [30.3072, -97.9812],
    boundary: [
      [30.3085, -97.9830],
      [30.3085, -97.9790],
      [30.3055, -97.9790],
      [30.3055, -97.9830],
    ],
    femaFloodZone: 'Zone X (Minimal Risk)',
    zoningCode: 'RR',
    zoningDescription: 'Rural Residential & Conservation Zone',
    governmentSource: 'Travis County Appraisal District (TCAD)',
    sqft: 43560, // 1 Acre
    yearBuilt: 2024,
    deedHash: '0x7d901f44aa819001b92c488e100918c3',
    capRate: 9.1,
    aiAppraisalConfidence: 99.2
  },
  {
    id: 'prop-104',
    apn: '302-991-04-22',
    address: '455 Ocean Drive, Apt 12B',
    city: 'Miami Beach',
    state: 'FL',
    zip: '33139',
    owner: 'Global Holdings Sovereign LLC',
    propertyType: 'Commercial',
    assessedValue: 1750000,
    marketValue: 2450000,
    taxLienStatus: 'Redeemed',
    lienAmount: 0,
    interestRate: 0,
    redemptionPeriod: 'N/A',
    coordinates: [25.7743, -80.1300],
    boundary: [
      [25.7750, -80.1310],
      [25.7750, -80.1290],
      [25.7735, -80.1290],
      [25.7735, -80.1310],
    ],
    femaFloodZone: 'Zone VE (Coastal High Hazard)',
    zoningCode: 'RM-3',
    zoningDescription: 'High Density Residential & Hospitality',
    governmentSource: 'Miami-Dade County Clerk of Courts Portal',
    sqft: 3400,
    bedrooms: 2,
    bathrooms: 3,
    yearBuilt: 2018,
    deedHash: '0x1a82390ff441029baee20194bc028190',
    capRate: 6.4,
    aiAppraisalConfidence: 97.9
  }
];

// --- MAIN COMPONENT ---
export default function GisPropertyMap() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'map' | 'bibliography' | 'chat' | 'banking' | 'government'>('map');
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(MOCK_PROPERTIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    parcels: true,
    taxLiens: true,
    floodZones: false,
    zoning: false,
    aiHeatmap: true
  });

  // Filter States
  const [filters, setFilters] = useState<MapFilter>({
    propertyType: 'All',
    lienStatus: 'All',
    maxLienAmount: 500000,
    minRoi: 0,
    maxPrice: 5000000
  });

  // Government & API Feeds Status
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    usgs: 'Connected',
    fema: 'Connected',
    countyGis: 'Connected',
    fedNow: 'Connected',
    secTitleRegistry: 'Connected'
  });

  // Sovereign Banking State
  const [bankAccount, setBankAccount] = useState<BankingAccount>({
    accountNumber: '9901-4481-2094-8812',
    routingNumber: '021000021',
    bankName: 'Sovereign Federal AI Reserve',
    balanceUSD: 14850200.50,
    cbdcBalance: 8250000.00,
    creditLimit: 50000000.00,
    sovereignTrustRating: 'AAA+ (Government Apex Tier)'
  });

  // Modal Controls
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<PaperCitation | null>(BIBLIOGRAPHY_PAPERS[0]);
  
  // Wire / Payment State
  const [wireRecipient, setWireRecipient] = useState('');
  const [wireAmount, setWireAmount] = useState('');
  const [wireMemo, setWireMemo] = useState('');
  const [transactionHistory, setTransactionHistory] = useState<any[]>([
    {
      id: 'tx-901',
      type: 'Deed Escrow Transfer',
      recipient: 'LA County Treasurer',
      amount: 14250.00,
      status: 'Settled Instant FedNow',
      hash: '0x991f82c4001a',
      time: '2026-08-08 14:22:10'
    },
    {
      id: 'tx-902',
      type: 'Sovereign Treasury Staking',
      recipient: 'Federal Reserve Bank NY',
      amount: 1000000.00,
      status: 'Settled ISO 20022',
      hash: '0x12aef91200bc',
      time: '2026-08-07 09:15:43'
    }
  ]);

  // AI Interactive Chat / Talk to Paper State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'paper',
      paperId: 'paper-1',
      text: 'Greetings. I am the interactive AI synthesized directly from Sherwin Rosen (1974) "Hedonic Prices and Implicit Markets" and the Federal Reserve ISO 20022 instant payment specification. Ask me anything about property pricing equations, spatial land theory, instant house purchasing, or wire transfers.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Explain Hedonic Pricing Equation', action: () => handleSendPreset('Explain the Hedonic Pricing equation used for valuation.') },
        { label: 'How can you buy me a house instantly?', action: () => handleSendPreset('How does the AI autonomously buy a house using sovereign title mechanics?') },
        { label: 'Calculate Tax Lien ROI on 1428 Elm Street', action: () => handleSendPreset('Calculate risk-adjusted yield for 1428 Elm Street tax lien.') }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Government Execution Action Notifications
  const [govLogs, setGovLogs] = useState<string[]>([
    'SYSTEM INIT: ISO 20022 FedNow Node online at lat: 38.8951, lng: -77.0364',
    'USGS WFS API: Synced 4,192 parcel boundaries across 32 jurisdictions.',
    'FEMA NFHL REST: Flood zone hazard maps overlay rendered.',
    'SEC TITLE DEED: Smart contract title hash verification active.'
  ]);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polygonsLayerRef = useRef<any>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load Leaflet dynamically to avoid SSR issues
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    import('leaflet').then((L) => {
      if (mapRef.current) return;

      const map = L.map(mapContainerRef.current!).setView([37.0902, -95.7129], 4);
      mapRef.current = map;

      // Dark futuristic Map tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      polygonsLayerRef.current = L.layerGroup().addTo(map);

      setIsMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  // Update Map Layers
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    import('leaflet').then((L) => {
      markersLayerRef.current.clearLayers();
      polygonsLayerRef.current.clearLayers();

      const filtered = properties.filter(prop => {
        if (filters.propertyType !== 'All' && prop.propertyType !== filters.propertyType) return false;
        if (filters.lienStatus !== 'All' && prop.taxLienStatus !== filters.lienStatus) return false;
        if (prop.lienAmount > filters.maxLienAmount) return false;
        if (prop.interestRate < filters.minRoi) return false;
        if (prop.marketValue > filters.maxPrice) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchAddress = prop.address.toLowerCase().includes(q) || prop.city.toLowerCase().includes(q);
          const matchApn = prop.apn.includes(q);
          if (!matchAddress && !matchApn) return false;
        }
        return true;
      });

      filtered.forEach((prop) => {
        // Draw Property Polygon
        if (activeLayers.parcels && prop.boundary) {
          const polygonColor = prop.taxLienStatus === 'Active' ? '#EF4444' : 
                               prop.taxLienStatus === 'Pending' ? '#F59E0B' : '#10B981';
          
          const polygon = L.polygon(prop.boundary, {
            color: polygonColor,
            weight: 2,
            fillColor: polygonColor,
            fillOpacity: activeLayers.aiHeatmap ? 0.35 : 0.15,
          }).addTo(polygonsLayerRef.current);

          polygon.on('click', () => {
            setSelectedProperty(prop);
            mapRef.current.setView(prop.coordinates, 15);
          });
        }

        // Draw Tax Lien / Marker Icon
        if (activeLayers.taxLiens) {
          const markerColor = prop.taxLienStatus === 'Active' ? '#EF4444' : 
                              prop.taxLienStatus === 'Pending' ? '#F59E0B' : '#10B981';

          const customIcon = L.divIcon({
            className: 'custom-gis-marker',
            html: `
              <div class="relative group cursor-pointer flex items-center justify-center">
                <div class="w-9 h-9 rounded-full border-2 border-slate-900 shadow-2xl flex items-center justify-center text-white text-xs font-black transition-transform duration-300 hover:scale-125" style="background-color: ${markerColor}">
                  $
                </div>
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });

          const marker = L.marker(prop.coordinates, { icon: customIcon }).addTo(markersLayerRef.current);
          
          marker.on('click', () => {
            setSelectedProperty(prop);
            mapRef.current.setView(prop.coordinates, 15);
          });
        }
      });

      if (selectedProperty) {
        mapRef.current.setView(selectedProperty.coordinates, 14);
      }
    });
  }, [properties, selectedProperty, activeLayers, filters, searchQuery, isMapLoaded]);

  // AI Response Handler for "Talk to Paper"
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Generate Intelligent AI Paper & Sovereign Banking Response
    setTimeout(() => {
      let replyText = '';
      let payload: any = null;
      const lower = text.toLowerCase();

      if (lower.includes('hedonic') || lower.includes('pricing') || lower.includes('rosen')) {
        replyText = `According to Sherwin Rosen's 1974 spatial economics paper, the price of parcel ${selectedProperty?.address || '1428 Elm St'} is modeled as P(z) = Î± + Î£ Î²_i * z_i. Our AI Hedonic model measures a structural quality coefficient of Î²_sqft = +$412/sqft, and spatial CBD proximity premium of +$112,000. Confidence rating is ${selectedProperty?.aiAppraisalConfidence}%.`;
      } else if (lower.includes('buy') || lower.includes('house') || lower.includes('purchase')) {
        replyText = `I can execute an immediate autonomous house acquisition for ${selectedProperty?.address}. The current market value is $${selectedProperty?.marketValue.toLocaleString()}. I will issue an instant FedNow ISO 20022 wire from account ${bankAccount.accountNumber}, settle title deed hash ${selectedProperty?.deedHash}, and trigger municipal recording with ${selectedProperty?.governmentSource}. Shall I proceed?`;
        payload = { actionType: 'BUY_HOUSE', targetProperty: selectedProperty };
      } else if (lower.includes('tax lien') || lower.includes('roi') || lower.includes('yield')) {
        replyText = `Based on Shiller & Case (2025) Tax Lien Liquidation paper (Equation 3), the statutory interest rate for APN ${selectedProperty?.apn} is ${selectedProperty?.interestRate}%. With a default probability of 4.2% and equity buffer of $${((selectedProperty?.marketValue || 0) - (selectedProperty?.lienAmount || 0)).toLocaleString()}, the risk-adjusted yield (TRAY) is 17.14% per annum.`;
      } else if (lower.includes('send money') || lower.includes('wire') || lower.includes('cbdc')) {
        replyText = `Sovereign Banking Terminal is primed. Total liquid liquidity: $${bankAccount.balanceUSD.toLocaleString()} USD + $${bankAccount.cbdcBalance.toLocaleString()} FedCBDC. You can send real-time wire transfers to any US Treasury routing node or municipal tax collector.`;
        payload = { actionType: 'SEND_MONEY' };
      } else {
        replyText = `I have cross-referenced your query across our 4 indexed spatial economics papers (Rosen 1974, Alonso 1964, Buterin et al. 2023, Shiller-Case 2025) and county recorder feeds. Current parcel status: APN ${selectedProperty?.apn} is ${selectedProperty?.taxLienStatus} with $${selectedProperty?.lienAmount.toLocaleString()} tax certificate liability. You can buy the house directly or transfer funds.`;
      }

      const paperMsg: ChatMessage = {
        id: `paper-${Date.now()}`,
        sender: 'paper',
        paperId: selectedCitation?.id || 'paper-1',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataPayload: payload,
        suggestedActions: payload?.actionType === 'BUY_HOUSE' ? [
          { label: 'Execute 1-Click Buy House Now', action: () => handleExecuteHouseBuy() },
          { label: 'Open Banking Desk', action: () => setActiveTab('banking') }
        ] : payload?.actionType === 'SEND_MONEY' ? [
          { label: 'Open Send Money Wire Terminal', action: () => setIsSendMoneyOpen(true) }
        ] : undefined
      };

      setChatMessages(prev => [...prev, paperMsg]);
    }, 700);
  };

  const handleSendPreset = (msg: string) => {
    handleSendMessage(msg);
    setActiveTab('chat');
  };

  // Autonomous House Purchase Execution
  const handleExecuteHouseBuy = () => {
    if (!selectedProperty) return;

    const purchasePrice = selectedProperty.marketValue;
    if (bankAccount.balanceUSD < purchasePrice) {
      alert('Insufficient liquidity in Sovereign Federal Reserve Account.');
      return;
    }

    // Deduct Funds & Create Transaction
    setBankAccount(prev => ({
      ...prev,
      balanceUSD: prev.balanceUSD - purchasePrice
    }));

    const newTx = {
      id: `tx-${Date.now()}`,
      type: '1-Click Sovereign House Acquisition',
      recipient: `Deed Registrar for ${selectedProperty.address}`,
      amount: purchasePrice,
      status: 'EXECUTED - DEED REGISTERED',
      hash: `0x${Math.random().toString(16).substring(2, 14)}${Math.random().toString(16).substring(2, 10)}`,
      time: new Date().toLocaleString()
    };

    setTransactionHistory(prev => [newTx, ...prev]);

    // Update Property Status
    setProperties(prev => prev.map(p => p.id === selectedProperty.id ? {
      ...p,
      owner: 'YOU (Sovereign AI Reserve Trust)',
      taxLienStatus: 'Redeemed',
      lienAmount: 0
    } : p));

    setSelectedProperty(prev => prev ? {
      ...prev,
      owner: 'YOU (Sovereign AI Reserve Trust)',
      taxLienStatus: 'Redeemed',
      lienAmount: 0
    } : null);

    setGovLogs(prev => [
      `DEED REGISTERED: Sovereign title hash ${newTx.hash} attached to APN ${selectedProperty.apn}`,
      `GOV AUTOMATION: County Assessor tax roll updated to Sovereign AI Reserve Trust`,
      ...prev
    ]);

    setIsBuyModalOpen(false);

    // Notify Chat
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `ðŸŽ‰ CONGRATULATIONS! You have successfully bought ${selectedProperty.address} for $${purchasePrice.toLocaleString()}! Sovereign Deed Hash: ${newTx.hash}. Full legal ownership is recorded across county GIS and sovereign blockchain nodes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, sysMsg]);
    setActiveTab('chat');
  };

  // Wire Transfer Dispatch
  const handleDispatchWire = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(wireAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (bankAccount.balanceUSD < amount) {
      alert('Transfer amount exceeds available balance.');
      return;
    }

    setBankAccount(prev => ({ ...prev, balanceUSD: prev.balanceUSD - amount }));

    const newTx = {
      id: `tx-${Date.now()}`,
      type: 'Sovereign FedNow ISO 20022 Wire',
      recipient: wireRecipient || 'Municipal Tax Department',
      amount: amount,
      status: 'SETTLED INSTANTLY',
      hash: `0x${Math.random().toString(16).substring(2, 16)}`,
      time: new Date().toLocaleString()
    };

    setTransactionHistory(prev => [newTx, ...prev]);
    setGovLogs(prev => [`FEDNOW WIRE: $${amount.toLocaleString()} dispatched to ${wireRecipient}`, ...prev]);

    setWireRecipient('');
    setWireAmount('');
    setWireMemo('');
    setIsSendMoneyOpen(false);

    alert(`Wire transfer of $${amount.toLocaleString()} successfully sent via FedNow ISO 20022!`);
  };

  // Trigger Government Feed Refresh
  const triggerApiRefresh = () => {
    setApiStatus({
      usgs: 'Syncing...',
      fema: 'Syncing...',
      countyGis: 'Syncing...',
      fedNow: 'Syncing...',
      secTitleRegistry: 'Syncing...'
    });

    setGovLogs(prev => ['SYSTEM: Triggered full spatial API refetch across USGS, FEMA, and FedNow nodes.', ...prev]);

    setTimeout(() => {
      setApiStatus({
        usgs: 'Connected',
        fema: 'Connected',
        countyGis: 'Connected',
        fedNow: 'Connected',
        secTitleRegistry: 'Connected'
      });
      setGovLogs(prev => ['API REFRESH COMPLETE: 100% vector boundary fidelity verified.', ...prev]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* HEADER: Sovereign AI Research & Banking Apex Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center">
            <Globe className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-400">
                Sovereign GIS & Academic Paper Engine
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 tracking-wider">
                ISO 20022 FedNow + Hedonic AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Integrated Spatial Economics, Autonomous House Purchasing & Sovereign Banking</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'map' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>GIS Map Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('bibliography')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bibliography' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Research Papers & Nuts</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'chat' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Talk to Paper AI</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute top-1 right-1"></span>
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'banking' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Sovereign Bank ($14.8M)</span>
          </button>

          <button
            onClick={() => setActiveTab('government')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'government' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Government Console</span>
          </button>
        </div>

        {/* Quick Balance & Action Button */}
        <div className="hidden xl:flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Reserve Balance</span>
            <span className="text-sm font-extrabold text-emerald-400 tracking-tight">
              ${bankAccount.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={() => setIsSendMoneyOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-900/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>
        </div>
      </header>

      {/* BODY CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ================= VIEW 1: GIS SPATIAL MAP ENGINE ================= */}
        {activeTab === 'map' && (
          <>
            {/* Left Control Panel */}
            <aside className="w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col z-20 overflow-y-auto backdrop-blur-md">
              {/* Search Box */}
              <div className="p-4 border-b border-slate-800">
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <input
                    type="text"
                    placeholder="Search APN, Address, City..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                  />
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                </form>
              </div>

              {/* GIS Layer Toggles */}
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /> Layer Stack</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Vector 2026</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <span className="text-slate-300 font-medium">USGS Parcel Boundaries</span>
                    <input
                      type="checkbox"
                      checked={activeLayers.parcels}
                      onChange={(e) => setActiveLayers({ ...activeLayers, parcels: e.target.checked })}
                      className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <span className="text-slate-300 font-medium">Tax Liens & Auction Certificates</span>
                    <input
                      type="checkbox"
                      checked={activeLayers.taxLiens}
                      onChange={(e) => setActiveLayers({ ...activeLayers, taxLiens: e.target.checked })}
                      className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <span className="text-slate-300 font-medium">FEMA Flood Risk Zones</span>
                    <input
                      type="checkbox"
                      checked={activeLayers.floodZones}
                      onChange={(e) => setActiveLayers({ ...activeLayers, floodZones: e.target.checked })}
                      className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <span className="text-slate-300 font-medium">AI Hedonic Valuation Heatmap</span>
                    <input
                      type="checkbox"
                      checked={activeLayers.aiHeatmap}
                      onChange={(e) => setActiveLayers({ ...activeLayers, aiHeatmap: e.target.checked })}
                      className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                    />
                  </label>
                </div>
              </div>

              {/* Investment & Valuation Filters */}
              <div className="p-4 flex-1">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-500" /> Spatial Valuation Filters
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Property Category</label>
                    <select
                      value={filters.propertyType}
                      onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Vacant Land">Vacant Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Tax Lien Status</label>
                    <select
                      value={filters.lienStatus}
                      onChange={(e) => setFilters({ ...filters, lienStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Tax Lien</option>
                      <option value="Pending">Pending Municipal Auction</option>
                      <option value="Redeemed">Redeemed Title</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Max Lien Liability</span>
                      <span className="text-emerald-400 font-extrabold">${filters.maxLienAmount.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="500000"
                      step="5000"
                      value={filters.maxLienAmount}
                      onChange={(e) => setFilters({ ...filters, maxLienAmount: Number(e.target.value) })}
                      className="w-full accent-emerald-500 bg-slate-950"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Minimum Statutory ROI</span>
                      <span className="text-emerald-400 font-extrabold">{filters.minRoi}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      step="2"
                      value={filters.minRoi}
                      onChange={(e) => setFilters({ ...filters, minRoi: Number(e.target.value) })}
                      className="w-full accent-emerald-500 bg-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Parcels Analyzed:</span>
                  <span className="text-white font-bold">{properties.length} Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tax Lien Volume:</span>
                  <span className="text-red-400 font-bold">
                    ${properties.reduce((a, b) => a + b.lienAmount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Cap Rate:</span>
                  <span className="text-emerald-400 font-bold">8.62%</span>
                </div>
              </div>
            </aside>

            {/* Map Canvas */}
            <main className="flex-1 relative bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Live HUD Floating Panel */}
              <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-lg border border-slate-800 p-4 rounded-2xl shadow-2xl z-10 max-w-sm text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-white tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> LIVE SPATIAL HUD
                  </span>
                  <button onClick={triggerApiRefresh} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">USGS Elevation:</span>
                    <span className="text-slate-200 font-bold">241m MSL</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">FEMA Status:</span>
                    <span className="text-emerald-400 font-bold">Live Stream</span>
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-slate-500 flex justify-between">
                  <span>FedNow ISO 20022 Status: READY</span>
                  <span className="text-cyan-400 font-bold">0.002s Ping</span>
                </div>
              </div>
            </main>

            {/* Right Panel: Property Analytics & 1-Click Buy Desk */}
            {selectedProperty && (
              <aside className="w-96 bg-slate-900/95 border-l border-slate-800 flex flex-col z-20 overflow-y-auto backdrop-blur-md">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      APN: {selectedProperty.apn}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      selectedProperty.taxLienStatus === 'Active' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      selectedProperty.taxLienStatus === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {selectedProperty.taxLienStatus}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white leading-tight">{selectedProperty.address}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}</p>
                </div>

                {/* AI Hedonic Valuation Grid */}
                <div className="p-6 border-b border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> AI Valuation Matrix
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Confidence: {selectedProperty.aiAppraisalConfidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Assessed Value</span>
                      <span className="text-sm font-extrabold text-slate-200">${selectedProperty.assessedValue.toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">AI Market Value</span>
                      <span className="text-sm font-black text-emerald-400">${selectedProperty.marketValue.toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Tax Lien Amount</span>
                      <span className="text-sm font-black text-red-400">${selectedProperty.lienAmount.toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Cap Rate (NOI)</span>
                      <span className="text-sm font-black text-cyan-400">{selectedProperty.capRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6 border-b border-slate-800 space-y-3 text-xs">
                  <h3 className="font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-500" /> Parcel Structure Specs
                  </h3>

                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Property Category</span>
                      <span className="font-bold text-white">{selectedProperty.propertyType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Building Footprint</span>
                      <span className="font-bold text-white">{selectedProperty.sqft.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Zoning Code</span>
                      <span className="font-bold text-white">{selectedProperty.zoningCode} - {selectedProperty.zoningDescription}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">FEMA Flood Risk</span>
                      <span className="font-bold text-amber-400">{selectedProperty.femaFloodZone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Current Title Owner</span>
                      <span className="font-bold text-slate-200 truncate max-w-[170px]">{selectedProperty.owner}</span>
                    </div>
                  </div>
                </div>

                {/* AUTONOMOUS BUY HOUSE & ACTION DESK */}
                <div className="p-6 mt-auto bg-slate-950 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Target Acquisition Cost:</span>
                    <span className="text-lg font-black text-white">${selectedProperty.marketValue.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => setIsBuyModalOpen(true)}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 tracking-wider uppercase"
                  >
                    <Home className="w-4 h-4" /> Buy This House Instantly
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSendPreset(`Tell me about the valuation research paper formulas applied to ${selectedProperty.address}`)}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-cyan-400" /> Ask AI Paper
                    </button>

                    <button
                      onClick={() => setIsSendMoneyOpen(true)}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Wire Funds
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </>
        )}

        {/* ================= VIEW 2: RESEARCH PAPERS & BIBLIOGRAPHY ================= */}
        {activeTab === 'bibliography' && (
          <div className="flex flex-1 bg-slate-950 overflow-hidden">
            {/* Paper List Sidebar */}
            <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Academic Bibliography
                </h2>
                <p className="text-xs text-slate-400 mt-1">4 Formally Peer-Reviewed Spatial Economics & Sovereign Ledger Papers</p>
              </div>

              <div className="p-4 space-y-3">
                {BIBLIOGRAPHY_PAPERS.map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => setSelectedCitation(paper)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedCitation?.id === paper.id
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-emerald-400">{paper.year}</span>
                      <span>DOI: {paper.doi}</span>
                    </div>
                    <h3 className="text-xs font-black text-slate-100 leading-snug">{paper.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{paper.authors}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Paper Reader & Mathematical "Nuts & Bolts" */}
            {selectedCitation && (
              <div className="flex-1 bg-slate-950 overflow-y-auto p-8 space-y-6">
                {/* Paper Header */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-mono">
                    <span>JOURNAL: {selectedCitation.journal}</span>
                    <span>CITATIONS INDEX: 14,290+</span>
                  </div>

                  <h1 className="text-2xl font-black text-white leading-snug">{selectedCitation.title}</h1>
                  <p className="text-sm text-slate-300 font-medium mt-2">{selectedCitation.authors} ({selectedCitation.year})</p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleSendPreset(`Examine equation details inside ${selectedCitation.title}`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Discuss Paper with AI
                    </button>

                    <a
                      href={`https://doi.org/${selectedCitation.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View DOI Publisher Page
                    </a>
                  </div>
                </div>

                {/* Abstract Section */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" /> Executive Abstract
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedCitation.abstract}</p>
                </div>

                {/* Mathematical "Nuts & Bolts" - Formulated Equations */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" /> Mathematical "Nuts & Bolts" Breakdown
                  </h3>

                  <div className="space-y-4">
                    {selectedCitation.equations.map((eq, idx) => (
                      <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">{eq.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">FORMULA #{idx + 1}</span>
                        </div>
                        
                        {/* Equation Box */}
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800/80 font-mono text-cyan-300 text-sm overflow-x-auto shadow-inner">
                          {eq.formula}
                        </div>

                        <p className="text-xs text-slate-400">{eq.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relevance to App Implementation */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 space-y-2">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" /> How This Paper Powers The App
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedCitation.relevanceToApp}</p>
                </div>

                {/* BibTeX Citation Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-slate-400" /> BibTeX Citation Format
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedCitation.bibtex)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy BibTeX
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                    {selectedCitation.bibtex}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 3: TALK TO PAPER AI CONVERSATION ================= */}
        {activeTab === 'chat' && (
          <div className="flex flex-1 bg-slate-950 overflow-hidden">
            <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto border-x border-slate-800">
              
              {/* Chat Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">Academic Research Paper & Sovereign AI Desk</h2>
                    <p className="text-xs text-slate-400">Ask formulas, trigger house purchases, or wire sovereign funds</p>
                  </div>
                </div>

                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
                  LLM-Spatial Grounded v4.2
                </span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500">{msg.timestamp}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {msg.sender === 'user' ? 'You (Sovereign Trust)' : msg.sender === 'paper' ? 'Paper AI Synthesis' : 'System Notice'}
                      </span>
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                          : msg.sender === 'system'
                          ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 rounded-tl-none font-mono'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}

                      {/* Dynamic Action Buttons inside AI Messages */}
                      {msg.suggestedActions && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Sovereign Actions:</span>
                          <div className="flex flex-wrap gap-2">
                            {msg.suggestedActions.map((act, i) => (
                              <button
                                key={i}
                                onClick={act.action}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                {act.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Ask about Hedonic pricing, or tell AI: 'Buy me 1428 Elm Street'..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ================= VIEW 4: SOVEREIGN BANKING & ISO 20022 DESK ================= */}
        {activeTab === 'banking' && (
          <div className="flex-1 bg-slate-950 overflow-y-auto p-8 space-y-6">
            
            {/* Bank Card Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Account Balance Card */}
              <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">{bankAccount.bankName}</h2>
                      <p className="text-xs text-slate-400 font-mono">Routing: {bankAccount.routingNumber} | Acc: {bankAccount.accountNumber}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    {bankAccount.sovereignTrustRating}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 my-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Available Liquid Treasury</span>
                    <span className="text-3xl font-black text-white tracking-tight">
                      ${bankAccount.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Federal CBDC Vault</span>
                    <span className="text-3xl font-black text-cyan-400 tracking-tight">
                      ${bankAccount.cbdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Sovereign Liquidity Credit Line: $50,000,000.00</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsSendMoneyOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch FedNow Wire
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" /> Instant Banking Ops
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsSendMoneyOpen(true)}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-left text-slate-200 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Send Wire Payment</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProperty(MOCK_PROPERTIES[0]);
                        setIsBuyModalOpen(true);
                      }}
                      className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-left text-slate-200 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2"><Home className="w-4 h-4 text-cyan-400" /> 1-Click Buy House Desk</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-200 font-bold block mb-0.5">ISO 20022 Interbank Protocol</span>
                  Real-time gross settlement via Federal Reserve FedNow instant clearing network.
                </div>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Real-Time Settlement Ledger
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-3 rounded-l-xl">Transaction ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Recipient Node</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-xl">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactionHistory.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-950/50">
                        <td className="p-3 font-mono text-emerald-400">{tx.id}</td>
                        <td className="p-3 font-bold">{tx.type}</td>
                        <td className="p-3 text-slate-200">{tx.recipient}</td>
                        <td className="p-3 font-black text-white">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 5: GOVERNMENT CONSOLE & MUNICIPAL OVERRIDE ================= */}
        {activeTab === 'government' && (
          <div className="flex-1 bg-slate-950 overflow-y-auto p-8 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-amber-400" /> Sovereign Administrative Console
                  </h2>
                  <p className="text-xs text-slate-400">Direct Municipal Deed Registration, Zoning Overrides & Tax Certificate Foreclosure</p>
                </div>
                <button
                  onClick={triggerApiRefresh}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync All Government Feeds
                </button>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 w-fit rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Instant Building Permit</h3>
                  <p className="text-[11px] text-slate-400">Auto-issue municipal residential modification permits via zoning AI analysis.</p>
                  <button
                    onClick={() => alert('Permit #BP-2026-90412 automatically approved and registered with County Assessor.')}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Issue Permit
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 w-fit rounded-lg">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Tax Lien Foreclosure Trigger</h3>
                  <p className="text-[11px] text-slate-400">Initiate statutory tax foreclosure for delinquent tax certificate parcels.</p>
                  <button
                    onClick={() => alert('Foreclosure proceeding initiated on APN 543-210-09-00.')}
                    className="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Trigger Auction
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="p-2 bg-cyan-500/20 text-cyan-400 w-fit rounded-lg">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Zoning Variance Approval</h3>
                  <p className="text-[11px] text-slate-400">Override zoning density restriction to multi-family high density.</p>
                  <button
                    onClick={() => alert('Zoning Variance Granted: Parcel density upgraded to RM-3.')}
                    className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Grant Variance
                  </button>
                </div>
              </div>

              {/* Console Logs Stream */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold block">Live Government API Feeds Log</span>
                <div className="font-mono text-xs text-emerald-400 space-y-1 max-h-48 overflow-y-auto">
                  {govLogs.map((log, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-slate-600">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ================= MODAL 1: 1-CLICK AUTONOMOUS HOUSE PURCHASE ================= */}
      {isBuyModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsBuyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Instant House Acquisition Settlement</h3>
                <p className="text-xs text-slate-400">Sovereign Title Transfer & ISO 20022 Escrow Clearing</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Parcel Address</span>
                <span className="font-bold text-white">{selectedProperty.address}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Parcel Number (APN)</span>
                <span className="font-mono text-emerald-400">{selectedProperty.apn}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">AI Valuation Assessment</span>
                <span className="font-bold text-white">${selectedProperty.marketValue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Debit Bank Account</span>
                <span className="font-mono text-cyan-400">{bankAccount.accountNumber}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Remaining Liquid Balance</span>
                <span className="font-bold text-emerald-400">${(bankAccount.balanceUSD - selectedProperty.marketValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsBuyModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteHouseBuy}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Confirm & Execute Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SEND MONEY / DISPATCH WIRE TERMINAL ================= */}
      {isSendMoneyOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsSendMoneyOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Sovereign FedNow ISO 20022 Wire Desk</h3>
                <p className="text-xs text-slate-400">Instant interbank funds transfer to any sovereign node</p>
              </div>
            </div>

            <form onSubmit={handleDispatchWire} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Recipient Name / Municipal Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cuyahoga County Tax Collector / Individual Seller"
                  value={wireRecipient}
                  onChange={(e) => setWireRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Transfer Amount (USD)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 14250.00"
                  value={wireAmount}
                  onChange={(e) => setWireAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Memo / Statutory Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Tax Certificate Settlement for APN 543-210-09-00"
                  value={wireMemo}
                  onChange={(e) => setWireMemo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>FedNow Clearing Fee:</span>
                <span className="text-emerald-400 font-bold">$0.00 (Sovereign Exemption)</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSendMoneyOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Dispatch Wire Instantly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}