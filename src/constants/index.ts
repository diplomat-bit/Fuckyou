import { View, AppView } from '../types';

/**
 * Global Theme Settings for the Sovereign Dashboard
 */
export const DEFAULT_THEME = {
  mode: 'dark' as const,
  primaryColor: '#0055FF', // Sovereign Blue
  secondaryColor: '#FF5F00', // Mastercard Orange
  backgroundColor: '#0B0F19', // Deep Space Dark
  cardBackgroundColor: '#111827', // Slate Dark
  borderColor: '#1F2937', // Border Gray
  textColor: '#F3F4F6', // Off-White
  accentColor: '#10B981', // Emerald Green
  fontFamily: 'Inter, system-ui, sans-serif',
};

/**
 * Mastercard Developers Agent Toolkit Configuration
 */
export const MASTERCARD_DEVELOPERS_CONFIG = {
  MCP_SERVER_URL: 'http://localhost:3010',
  DEFAULT_TRANSPORT: 'stdio' as const,
  SUPPORTED_TOOLS: [
    {
      name: 'get-services-list',
      description: 'Lists all available Mastercard Developers Products and Services with basic info.',
    },
    {
      name: 'get-documentation',
      description: 'Provides an overview of all available documentation for a specific Mastercard service.',
    },
    {
      name: 'get-documentation-section-content',
      description: 'Retrieves the complete content for a specific documentation section.',
    },
    {
      name: 'get-documentation-page',
      description: 'Retrieves the complete content of a specific documentation page.',
    },
    {
      name: 'get-oauth10a-integration-guide',
      description: 'Retrieves the comprehensive OAuth 1.0a integration guide.',
    },
    {
      name: 'get-oauth20-integration-guide',
      description: 'Retrieves the comprehensive OAuth 2.0 integration guide.',
    },
    {
      name: 'get-openfinance-integration-guide',
      description: 'Retrieves the comprehensive Open Finance integration guide.',
    },
    {
      name: 'get-api-operation-list',
      description: 'Provides a summary of all API operations for a specific Mastercard API specification.',
    },
    {
      name: 'get-api-operation-details',
      description: 'Provides detailed information about a specific API operation.',
    },
  ],
  POPULAR_SERVICES: [
    { id: 'cross-border', name: 'Cross Border Services', category: 'Payments' },
    { id: 'account-validation', name: 'Account Validation', category: 'Security' },
    { id: 'currency-conversion', name: 'Currency Conversion Calculator', category: 'Utilities' },
    { id: 'loyalty-management', name: 'Loyalty Management', category: 'Loyalty' },
    { id: 'places-api', name: 'Places API', category: 'Data' },
    { id: 'consumer-clarity', name: 'Ethoca Consumer Clarity', category: 'Security' },
    { id: 'open-finance', name: 'Open Finance', category: 'Finance' },
  ],
};

/**
 * Sovereign Application Configurations
 */
export interface SovereignApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  status: 'active' | 'maintenance' | 'beta';
}

export const SOVEREIGN_APPS: SovereignApp[] = [
  {
    id: 'aquarius-cmd',
    name: 'Aquarius Executive Command',
    description: 'Central command and control dashboard for sovereign operations.',
    url: 'https://aquarius.sovereign.internal',
    icon: 'ShieldAlert',
    category: 'Core Command',
    status: 'active',
  },
  {
    id: 'mcp-toolkit',
    name: 'Mastercard Developers Agent Toolkit',
    description: 'MCP-based agent toolkit for Mastercard service discovery and integration.',
    url: 'https://mcp.mastercard.internal',
    icon: 'Cpu',
    category: 'Integrations',
    status: 'active',
  },
  {
    id: 'alpaca-brokerage',
    name: 'Alpaca Brokerage Suite',
    description: 'Sovereign algorithmic trading and asset tokenization engine.',
    url: 'https://alpaca.sovereign.internal',
    icon: 'TrendingUp',
    category: 'Finance',
    status: 'active',
  },
  {
    id: 'citi-gateway',
    name: 'Citi Sovereign Gateway',
    description: 'Direct API bridge to Citi Treasury and International Payments.',
    url: 'https://citi.sovereign.internal',
    icon: 'Globe',
    category: 'Finance',
    status: 'active',
  },
];

/**
 * Navigation Item Interface
 */
export interface NavItem {
  id: string;
  name: string;
  view: View | AppView | string;
  icon: string;
  category: string;
  description?: string;
  isProtected?: boolean;
}

/**
 * Global Navigation Items mapping to all views in the Sovereign Dashboard
 */
export const NAV_ITEMS: NavItem[] = [
  // Core Command
  {
    id: 'dashboard',
    name: 'Executive Command',
    view: View.Dashboard,
    icon: 'LayoutDashboard',
    category: 'Core Command',
    description: 'Overview of sovereign operations and system status.',
  },
  {
    id: 'portal-hub',
    name: 'Sovereign Portal Hub',
    view: View.PortalHub,
    icon: 'Compass',
    category: 'Core Command',
    description: 'Central hub for all sovereign portals.',
  },
  {
    id: 'files-vault',
    name: 'Files & Dossier Vault',
    view: View.FilesVault,
    icon: 'FolderLock',
    category: 'Core Command',
    description: 'Secure storage for sensitive files and dossiers.',
  },
  {
    id: 'data-ingest',
    name: 'Neural Ingest',
    view: View.DataIngest,
    icon: 'Database',
    category: 'Core Command',
    description: 'Real-time data ingestion and processing pipeline.',
    isProtected: true,
  },
  {
    id: 'neural-tools',
    name: 'Neural Tools',
    view: View.NeuralTools,
    icon: 'Cpu',
    category: 'Core Command',
    description: 'Advanced AI and neural processing utilities.',
  },
  {
    id: 'the-vision',
    name: 'The Vision',
    view: View.TheVision,
    icon: 'Eye',
    category: 'Core Command',
    description: 'Strategic roadmap and long-term sovereign objectives.',
  },
  {
    id: 'rewards',
    name: 'Rewards Hub',
    view: View.Rewards,
    icon: 'Award',
    category: 'Core Command',
    description: 'Sovereign loyalty and rewards management.',
  },
  {
    id: 'settings',
    name: 'Core Settings',
    view: View.Settings,
    icon: 'Settings',
    category: 'Core Command',
    description: 'Global system configurations and preferences.',
  },

  // Legion AI Suite
  {
    id: 'legion-architect',
    name: 'Legion I: Architect',
    view: View.LegionArchitect,
    icon: 'Layers',
    category: 'Legion AI Suite',
    description: 'AI-driven system architecture and design studio.',
    isProtected: true,
  },
  {
    id: 'legion-ghost',
    name: 'Legion II: Ghost',
    view: View.LegionGhost,
    icon: 'Fingerprint',
    category: 'Legion AI Suite',
    description: 'Anonymized operations and stealth intelligence.',
  },
  {
    id: 'legion-visualizer',
    name: 'Legion III: Visualizer',
    view: View.LegionVisualizer,
    icon: 'Palette',
    category: 'Legion AI Suite',
    description: 'Creative suite and visual data representation.',
  },
  {
    id: 'legion-voice',
    name: 'Legion IV: Voice',
    view: View.LegionVoice,
    icon: 'Radio',
    category: 'Legion AI Suite',
    description: 'Real-time voice synthesis and communication portal.',
  },
  {
    id: 'legion-auditor',
    name: 'Legion V: Auditor',
    view: View.LegionAuditor,
    icon: 'FileSpreadsheet',
    category: 'Legion AI Suite',
    description: 'Automated compliance and system auditing.',
  },
  {
    id: 'legion-live',
    name: 'Legion VI: Live',
    view: View.LegionLive,
    icon: 'Activity',
    category: 'Legion AI Suite',
    description: 'Live monitoring and real-time agent execution.',
  },
  {
    id: 'sovereign-intelligence',
    name: 'Sovereign Intelligence',
    view: View.SovereignIntelligence,
    icon: 'Brain',
    category: 'Legion AI Suite',
    description: 'Centralized AI intelligence and knowledge base.',
  },
  {
    id: 'aria-comms',
    name: 'Aria Neural Comms',
    view: View.AriaComms,
    icon: 'MessageSquare',
    category: 'Legion AI Suite',
    description: 'Secure neural communication network.',
  },

  // Security & Identity
  {
    id: 'identity-citadel',
    name: 'Identity Citadel',
    view: View.IdentityCitadel,
    icon: 'ShieldCheck',
    category: 'Security & Identity',
    description: 'Sovereign identity management and access control.',
  },
  {
    id: 'recovery-mesh',
    name: 'Recovery Mesh',
    view: View.RecoveryMesh,
    icon: 'RefreshCw',
    category: 'Security & Identity',
    description: 'Decentralized backup and disaster recovery network.',
  },
  {
    id: 'privacy-guardian',
    name: 'Privacy Guardian',
    view: View.PrivacyGuardian,
    icon: 'Lock',
    category: 'Security & Identity',
    description: 'Data privacy enforcement and encryption manager.',
  },
  {
    id: 'trust-registry',
    name: 'Trust Registry',
    view: View.TrustRegistry,
    icon: 'FileCheck',
    category: 'Security & Identity',
    description: 'Verified entities and cryptographic trust registry.',
  },
  {
    id: 'billing-identity',
    name: 'Identity Vault',
    view: View.BillingIdentity,
    icon: 'UserCheck',
    category: 'Security & Identity',
    description: 'Secure billing profiles and identity verification.',
  },
  {
    id: 'sovereign-org-handshake',
    name: 'Org Handshake',
    view: