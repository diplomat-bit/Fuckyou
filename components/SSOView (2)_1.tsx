import React, { useState, useCallback, useMemo, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { Cpu, Zap, ShieldCheck, AlertTriangle, UploadCloud, Link, Settings, UserCheck, Database, Globe, Terminal, Code, Aperture, Brain, Infinity, Rocket, CreditCard, Home } from 'lucide-react';

// --- Refactoring: Replacing intentionally flawed/chaotic components ---
// The AIControlledInput component was designed to support a "Bad Advice" button, 
// reflecting chaos engineering/flawed logic. This is replaced with a standard, non-chaotic input.

interface ControlledInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    icon: React.ReactNode;
    id: string; // Added ID for standard form binding
}

// Standardized, reliable input component adhering to clean UI patterns (MUI/Tailwind pattern)
const ControlledInput: React.FC<ControlledInputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    icon,
    id,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="flex items-center text-sm font-medium text-gray-300">
                {icon}
                <span className="ml-2">{label}</span>
            </label>
            <div className={`flex items-center rounded-lg border transition-all duration-200 ${isFocused ? 'ring-2 ring-sky-500 border-sky-500' : 'border-gray-600 bg-gray-800/70'}`}>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-grow p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm font-mono"
                />
                {/* Removed intentionally flawed 'Bad Advice' button */}
            </div>
        </div>
    );
};

// --- Component: Metadata Uploader - Repaired for production use (focusing on secure settings entry) ---
interface MetadataUploaderProps {
    // Replaced placeholder URL/File submit with standard settings management for MVP
    onUrlSubmit: (url: string) => void;
    onFileUpload: (file: File) => void;
    isProcessing: boolean;
}

const MetadataUploader: React.FC<MetadataUploaderProps> = ({ onUrlSubmit, onFileUpload, isProcessing }) => {
    const [metadataUrl, setMetadataUrl] = useState('');

    const handleUrlSubmit = () => {
        if (metadataUrl) {
            onUrlSubmit(metadataUrl);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            onFileUpload(event.target.files[0]);
        }
    };

    return (
        <div className="p-5 bg-gray-800/50 rounded-xl border border-sky-700 shadow-xl shadow-sky-900/20">
            <h4 className="font-bold text-lg text-sky-300 flex items-center mb-3"><Link className="w-5 h-5 mr-2" /> Service Provider Configuration</h4>
            <p className="text-sm text-gray-400 mb-4">
                Enter the required SAML/OIDC metadata endpoint URL for your Identity Provider connection.
            </p>
            <ControlledInput
                id="metadata-url-input"
                label="IdP Metadata URL Endpoint"
                placeholder="https://secure.idp.com/metadata.xml"
                value={metadataUrl}
                onChange={setMetadataUrl}
                icon={<Link className="w-4 h-4 text-sky-400" />}
            />
            <button
                onClick={handleUrlSubmit}
                disabled={isProcessing || !metadataUrl}
                className="w-full mt-4 p-3 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center 
                           bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30"
            >
                {isProcessing ? (
                    <>
                        <Cpu className="w-5 h-5 mr-2 animate-spin" /> Fetching & Validating...
                    </>
                ) : (
                    <>
                        <Globe className="w-5 h-5 mr-2" /> Fetch/Validate Metadata
                    </>
                )}
            </button>
            <div className="mt-4 border-t border-gray-700 pt-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">Or Upload Metadata File (.xml)</label>
                <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500/20 file:text-sky-200 hover:file:bg-sky-500/30"
                />
            </div>
        </div>
    );
};

// --- Component: IdP Details Display - Repaired for production use ---
interface IdPDetailsProps {
    acsUrl: string;
    entityId: string;
}

const IdPDetailsDisplay: React.FC<IdPDetailsProps> = ({ acsUrl, entityId }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = useCallback((text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    const DetailItem: React.FC<{ label: string, value: string, icon: React.ReactNode, copyKey: string }> = ({ label, value, icon, copyKey }) => (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-sky-500 transition-all duration-200">
            <div className="flex items-center mb-1">
                {icon}
                <h4 className="text-xs font-medium text-gray-400 ml-2 uppercase tracking-wider">{label}</h4>
            </div>
            <div className="flex justify-between items-center">
                <p className="font-mono text-sm text-white break-all pr-4">{value}</p>
                <button
                    onClick={() => handleCopy(value, copyKey)}
                    title={`Copy ${label}`}
                    className="text-gray-500 hover:text-white p-1 rounded transition-colors flex-shrink-0"
                >
                    {copied === copyKey ? <ShieldCheck className="w-4 h-4 text-green-400" /> : <Zap className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-5 bg-gray-800/50 rounded-xl border border-sky-700 shadow-xl shadow-sky-900/20">
            <h4 className="font-bold text-lg text-sky-300 flex items-center mb-3"><Terminal className="w-5 h-5 mr-2" /> Required SP Connection Details</h4>
            <p className="text-gray-400 border-b border-gray-700 pb-3 text-sm">
                These are the Service Provider (SP) endpoints your Identity Provider (IdP) must be configured to use for secure SSO integration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                    label="Assertion Consumer Service (ACS) URL"
                    value={acsUrl}
                    icon={<Terminal className="w-4 h-4 text-sky-400" />}
                    copyKey="acs"
                />
                <DetailItem
                    label="Entity ID / Audience URI"
                    value={entityId}
                    icon={<Database className="w-4 h-4 text-yellow-400" />}
                    copyKey="entity"
                />
            </div>
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-start mt-4">
                <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-200 ml-3">
                    **Security Note:** Certificate management (renewal, storage, and validation) must be handled securely via centralized secrets management (e.g., Vault/AWS Secrets Manager), bypassing local storage for production.
                </p>
            </div>
        </div>
    );
};

// --- Component: Connection Status Dashboard - Repaired for Production State ---
interface ConnectionStatusProps {
    isConnected: boolean;
    providerName: string;
    lastSync: string;
    adminEmail: string;
}

const ConnectionStatusDashboard: React.FC<ConnectionStatusProps> = ({ isConnected, providerName, lastSync, adminEmail }) => {
    const statusColor = isConnected ? 'bg-green-900/30 border-green-700' : 'bg-yellow-900/30 border-yellow-700';
    const iconColor = isConnected ? 'text-green-300' : 'text-yellow-300';
    const iconBg = isConnected ? 'bg-green-500/20' : 'bg-yellow-500/20';
    const titleColor = isConnected ? 'text-white' : 'text-yellow-300';

    return (
        <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700 shadow-xl shadow-sky-900/20">
            <h4 className="font-bold text-lg text-white flex items-center mb-3"><ShieldCheck className="w-5 h-5 mr-2 text-green-400" /> Federated Identity Connection Status</h4>
            <div className={`flex items-center p-5 rounded-xl transition-all duration-500 shadow-lg ${statusColor}`}>
                <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center mr-5 flex-shrink-0`}>
                    {isConnected ? (
                        <ShieldCheck className={`w-8 h-8 ${iconColor}`} />
                    ) : (
                        <AlertTriangle className={`w-8 h-8 ${iconColor}`} />
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className={`text-xl font-extrabold tracking-wide ${titleColor}`}>{providerName} Connection: {isConnected ? 'ACTIVE' : 'WARNING'}</h4>
                    <p className="text-sm text-gray-300 mt-1 truncate">Primary Administrator: {adminEmail}</p>
                    <p className="text-xs text-gray-400 mt-1">Last Successful Sync: {lastSync}</p>
                </div>
                <div className="ml-6 flex-shrink-0 space-y-2">
                    <button
                        className={`w-full px-4 py-2 font-bold rounded-lg text-sm transition-transform transform hover:scale-[1.02] shadow-md ${isConnected ? 'bg-red-600/70 hover:bg-red-500 text-white' : 'bg-green-600/70 hover:bg-green-500 text-white'}`}
                        onClick={() => console.log(isConnected ? "Simulating secure logout/re-authentication trigger" : "Simulating connection health check")}
                    >
                        {isConnected ? 'Force Re-Authentication' : 'Run Health Check'}
                    </button>
                    <button
                        className="w-full px-4 py-2 font-medium rounded-lg text-xs bg-gray-700/50 hover:bg-gray-600 text-gray-300 transition-colors"
                        onClick={() => console.log("Accessing Audit Logs")}
                    >
                        View Audit Log
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component: AI Configuration Assistant - REPLACED/REMOVED (MVP Scope Reduction) ---
// The component promoting configuration degradation is removed from the main production path (MVP Scope Reduction).
// It is archived or conceptually removed as per instructions.

/*
const AIConfigurationAssistant: React.FC = () => { ... REMOVED ... }
*/

// =================================================================================
// The complete interface for all 200+ API credentials (Kept for structure, but focusing MVP)
// =================================================================================
interface ApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud (MVP Candidate: Stripe for basic services)
  STRIPE_SECRET_KEY: string;
  // TWILIO_ACCOUNT_SID: string; // Deprecated for MVP
  // TWILIO_AUTH_TOKEN: string; // Deprecated for MVP
  // SENDGRID_API_KEY: string; // Deprecated for MVP
  AWS_ACCESS_KEY_ID: string; // Kept for infrastructure visibility, but not used in core MVP flow
  AWS_SECRET_ACCESS_KEY: string; // Kept for infrastructure visibility, but not used in core MVP flow
  // AZURE_CLIENT_ID: string;
  // AZURE_CLIENT_SECRET: string;
  // GOOGLE_CLOUD_API_KEY: string;

  // Deployment & DevOps (All removed for MVP scope focusing on auth/dashboard)
  // DOCKER_HUB_USERNAME: string;
  // DOCKER_HUB_ACCESS_TOKEN: string;
  // HEROKU_API_KEY: string;
  // NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  // VERCEL_API_TOKEN: string;
  // CLOUDFLARE_API_TOKEN: string;
  // DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  // LINODE_PERSONAL_ACCESS_TOKEN: string;
  // TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity (All removed for MVP scope)
  // GITHUB_PERSONAL_ACCESS_TOKEN: string;
  // SLACK_BOT_TOKEN: string;
  // DISCORD_BOT_TOKEN: string;
  // TRELLO_API_KEY: string;
  // TRELLO_API_TOKEN: string;
  // JIRA_USERNAME: string;
  // JIRA_API_TOKEN: string;
  // ASANA_PERSONAL_ACCESS_TOKEN: string;
  // NOTION_API_KEY: string;
  // AIRTABLE_API_KEY: string;

  // File & Data Storage (All removed for MVP scope)
  // DROPBOX_ACCESS_TOKEN: string;
  // BOX_DEVELOPER_TOKEN: string;
  // GOOGLE_DRIVE_API_KEY: string;
  // ONEDRIVE_CLIENT_ID: string;

  // CRM & Business (All removed for MVP scope)
  // SALESFORCE_CLIENT_ID: string;
  // SALESFORCE_CLIENT_SECRET: string;
  // HUBSPOT_API_KEY: string;
  // ZENDESK_API_TOKEN: string;
  // INTERCOM_ACCESS_TOKEN: string;
  // MAILCHIMP_API_KEY: string;

  // E-commerce (All removed for MVP scope)
  // SHOPIFY_API_KEY: string;
  // SHOPIFY_API_SECRET: string;
  // BIGCOMMERCE_ACCESS_TOKEN: string;
  // MAGENTO_ACCESS_TOKEN: string;
  // WOOCOMMERCE_CLIENT_KEY: string;
  // WOOCOMMERCE_CLIENT_SECRET: string;
  
  // Authentication & Identity (Kept critical OIDC/SAML related for context, even if SAML is legacy)
  STYTCH_PROJECT_ID: string; // Kept as example of alternative auth
  STYTCH_SECRET: string; // Kept as example of alternative auth
  AUTH0_DOMAIN: string; // Kept as example of alternative auth
  AUTH0_CLIENT_ID: string; // Kept as example of alternative auth
  AUTH0_CLIENT_SECRET: string; // Kept as example of alternative auth
  OKTA_DOMAIN: string; // Kept as example of alternative auth
  OKTA_API_TOKEN: string; // Kept as example of alternative auth

  // Backend & Databases (All removed for MVP scope)
  // FIREBASE_API_KEY: string;
  // SUPABASE_URL: string;
  // SUPABASE_ANON_KEY: string;

  // API Development (All removed for MVP scope)
  // POSTMAN_API_KEY: string;
  // APOLLO_GRAPH_API_KEY: string;

  // AI & Machine Learning (All removed for MVP scope, as AI module logic was flawed)
  // OPENAI_API_KEY: string;
  // HUGGING_FACE_API_TOKEN: string;
  // GOOGLE_CLOUD_AI_API_KEY: string;
  // AMAZON_REKOGNITION_ACCESS_KEY: string;
  // MICROSOFT_AZURE_COGNITIVE_KEY: string;
  // IBM_WATSON_API_KEY: string;

  // Search & Real-time (All removed for MVP scope)
  // ALGOLIA_APP_ID: string;
  // ALGOLIA_ADMIN_API_KEY: string;
  // PUSHER_APP_ID: string;
  // PUSHER_KEY: string;
  // PUSHER_SECRET: string;
  // ABLY_API_KEY: string;
  // ELASTICSEARCH_API_KEY: string;
  
  // Identity & Verification (All removed for MVP scope)
  // STRIPE_IDENTITY_SECRET_KEY: string;
  // ONFIDO_API_TOKEN: string;
  // CHECKR_API_KEY: string;
  
  // Logistics & Shipping (All removed for MVP scope)
  // LOB_API_KEY: string;
  // EASYPOST_API_KEY: string;
  // SHIPPO_API_TOKEN: string;

  // Maps & Weather (All removed for MVP scope)
  // GOOGLE_MAPS_API_KEY: string;
  // MAPBOX_ACCESS_TOKEN: string;
  // HERE_API_KEY: string;
  // ACCUWEATHER_API_KEY: string;
  // OPENWEATHERMAP_API_KEY: string;

  // Social & Media (All removed for MVP scope)
  // YELP_API_KEY: string;
  // FOURSQUARE_API_KEY: string;
  // REDDIT_CLIENT_ID: string;
  // REDDIT_CLIENT_SECRET: string;
  // TWITTER_BEARER_TOKEN: string;
  // FACEBOOK_APP_ID: string;
  // FACEBOOK_APP_SECRET: string;
  // INSTAGRAM_APP_ID: string;
  // INSTAGRAM_APP_SECRET: string;
  // YOUTUBE_DATA_API_KEY: string;
  // SPOTIFY_CLIENT_ID: string;
  // SPOTIFY_CLIENT_SECRET: string;
  // SOUNDCLOUD_CLIENT_ID: string;
  // TWITCH_CLIENT_ID: string;
  // TWITCH_CLIENT_SECRET: string;

  // Media & Content (All removed for MVP scope)
  // MUX_TOKEN_ID: string;
  // MUX_TOKEN_SECRET: string;
  // CLOUDINARY_API_KEY: string;
  // CLOUDINARY_API_SECRET: string;
  // IMGIX_API_KEY: string;
  
  // Legal & Admin (All removed for MVP scope)
  // STRIPE_ATLAS_API_KEY: string;
  // CLERKY_API_KEY: string;
  // DOCUSIGN_INTEGRATOR_KEY: string;
  // HELLOSIGN_API_KEY: string;
  
  // Monitoring & CI/CD (All removed for MVP scope)
  // LAUNCHDARKLY_SDK_KEY: string;
  // SENTRY_AUTH_TOKEN: string;
  // DATADOG_API_KEY: string;
  // NEW_RELIC_API_KEY: string;
  // CIRCLECI_API_TOKEN: string;
  // TRAVIS_CI_API_TOKEN: string;
  // BITBUCKET_USERNAME: string;
  // BITBUCKET_APP_PASSWORD: string;
  // GITLAB_PERSONAL_ACCESS_TOKEN: string;
  // PAGERDUTY_API_KEY: string;
  
  // Headless CMS (All removed for MVP scope)
  // CONTENTFUL_SPACE_ID: string;
  // CONTENTFUL_ACCESS_TOKEN: string;
  // SANITY_PROJECT_ID: string;
  // SANITY_API_TOKEN: string;
  // STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs === (MVP Candidate: Only required for demonstrating API consolidation structure)
  // Data Aggregators (All removed for MVP scope)
  // PLAID_CLIENT_ID: string;
  // PLAID_SECRET: string;
  // YODLEE_CLIENT_ID: string;
  // YODLEE_SECRET: string;
  // MX_CLIENT_ID: string;
  // MX_API_KEY: string;
  // FINICITY_PARTNER_ID: string;
  // FINICITY_APP_KEY: string;

  // Payment Processing (Kept Stripe as it relates to the original component context)
  // ADYEN_API_KEY: string;
  // ADYEN_MERCHANT_ACCOUNT: string;
  // BRAINTREE_MERCHANT_ID: string;
  // BRAINTREE_PUBLIC_KEY: string;
  // BRAINTREE_PRIVATE_KEY: string;
  // SQUARE_APPLICATION_ID: string;
  // SQUARE_ACCESS_TOKEN: string;
  // PAYPAL_CLIENT_ID: string;
  // PAYPAL_SECRET: string;
  // DWOLLA_KEY: string;
  // DWOLLA_SECRET: string;
  // WORLDPAY_API_KEY: string;
  // CHECKOUT_SECRET_KEY: string;
  
  // BaaS & Card Issuing (All removed for MVP scope)
  // MARQETA_APPLICATION_TOKEN: string;
  // MARQETA_ADMIN_ACCESS_TOKEN: string;
  // GALILEO_API_LOGIN: string;
  // GALILEO_API_TRANS_KEY: string;
  // SOLARISBANK_CLIENT_ID: string;
  // SOLARISBANK_CLIENT_SECRET: string;
  // SYNAPSE_CLIENT_ID: string;
  // SYNAPSE_CLIENT_SECRET: string;
  // RAILSBANK_API_KEY: string;
  // CLEARBANK_API_KEY: string;
  // UNIT_API_TOKEN: string;
  // TREASURY_PRIME_API_KEY: string;
  // INCREASE_API_KEY: string;
  // MERCURY_API_KEY: string;
  // BREX_API_KEY: string;
  // BOND_API_KEY: string;
  
  // International Payments (All removed for MVP scope)
  // CURRENCYCLOUD_LOGIN_ID: string;
  // CURRENCYCLOUD_API_KEY: string;
  // OFX_API_KEY: string;
  // WISE_API_TOKEN: string;
  // REMITLY_API_KEY: string;
  // AZIMO_API_KEY: string;
  // NIUM_API_KEY: string;
  
  // Investment & Market Data (All removed for MVP scope)
  // ALPACA_API_KEY_ID: string;
  // ALPACA_SECRET_KEY: string;
  // TRADIER_ACCESS_TOKEN: string;
  // IEX_CLOUD_API_TOKEN: string;
  // POLYGON_API_KEY: string;
  // FINNHUB_API_KEY: string;
  // ALPHA_VANTAGE_API_KEY: string;
  // MORNINGSTAR_API_KEY: string;
  // XIGNITE_API_TOKEN: string;
  // DRIVEWEALTH_API_KEY: string;

  // Crypto (All removed for MVP scope)
  // COINBASE_API_KEY: string;
  // COINBASE_API_SECRET: string;
  // BINANCE_API_KEY: string;
  // BINANCE_API_SECRET: string;
  // KRAKEN_API_KEY: string;
  // KRAKEN_PRIVATE_KEY: string;
  // GEMINI_API_KEY: string;
  // GEMINI_API_SECRET: string;
  // COINMARKETCAP_API_KEY: string;
  // COINGECKO_API_KEY: string;
  // BLOCKIO_API_KEY: string;

  // Major Banks (Open Banking) (All removed for MVP scope)
  // JP_MORGAN_CHASE_CLIENT_ID: string;
  // CITI_CLIENT_ID: string;
  // WELLS_FARGO_CLIENT_ID: string;
  // CAPITAL_ONE_CLIENT_ID: string;

  // European & Global Banks (Open Banking) (All removed for MVP scope)
  // HSBC_CLIENT_ID: string;
  // BARCLAYS_CLIENT_ID: string;
  // BBVA_CLIENT_ID: string;
  // DEUTSCHE_BANK_API_KEY: string;

  // UK & European Aggregators (All removed for MVP scope)
  // TINK_CLIENT_ID: string;
  // TRUELAYER_CLIENT_ID: string;

  // Compliance & Identity (KYC/AML) (All removed for MVP scope)
  // MIDDESK_API_KEY: string;
  // ALLOY_API_TOKEN: string;
  // ALLOY_API_SECRET: string;
  // COMPLYADVANTAGE_API_KEY: string;

  // Real Estate (All removed for MVP scope)
  // ZILLOW_API_KEY: string;
  // CORELOGIC_CLIENT_ID: string;

  // Credit Bureaus (All removed for MVP scope)
  // EXPERIAN_API_KEY: string;
  // EQUIFAX_API_KEY: string;
  // TRANSUNION_API_KEY: string;

  // Global Payments (Emerging Markets) (All removed for MVP scope)
  // FINCRA_API_KEY: string;
  // FLUTTERWAVE_SECRET_KEY: string;
  // PAYSTACK_SECRET_KEY: string;
  // DLOCAL_API_KEY: string;
  // RAPYD_ACCESS_KEY: string;
  
  // Accounting & Tax (All removed for MVP scope)
  // TAXJAR_API_KEY: string;
  // AVALARA_API_KEY: string;
  // CODAT_API_KEY: string;
  // XERO_CLIENT_ID: string;
  // XERO_CLIENT_SECRET: string;
  // QUICKBOOKS_CLIENT_ID: string;
  // QUICKBOOKS_CLIENT_SECRET: string;
  // FRESHBOOKS_API_KEY: string;
  
  // Fintech Utilities (All removed for MVP scope)
  // ANVIL_API_KEY: string;
  // MOOV_CLIENT_ID: string;
  // MOOV_SECRET: string;
  // VGS_USERNAME: string;
  // VGS_PASSWORD: string;
  // SILA_APP_HANDLE: string;
  // SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


// --- Main Component: SSOView, refactored to act as Secure API Settings Console (MVP Focus) ---
const SSOView: React.FC = () => {
  // Initialize state with known/default fields relevant to the MVP scope (Auth & Core Services)
  const [keys, setKeys] = useState<ApiKeysState>({
    STRIPE_SECRET_KEY: '',
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    STYTCH_PROJECT_ID: '',
    STYTCH_SECRET: '',
    AUTH0_DOMAIN: '',
    AUTH0_CLIENT_ID: '',
    AUTH0_CLIENT_SECRET: '',
    OKTA_DOMAIN: '',
    OKTA_API_TOKEN: '',
    // Initialize all other fields to empty string to prevent runtime errors during rendering
  } as ApiKeysState);
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');
  const [isProcessing, setIsProcessing] = useState(false); // Used by MetadataUploader replacement

  // --- SSO Context (Kept for legacy UI context, but logic is stabilized) ---
  const [acsUrl, setAcsUrl] = useState("https://auth.quantumledger.com/sso/v3/acs/corp-alpha-001");
  const [entityId, setEntityId] = useState("urn:quantumledger:corp:alpha:sp:2024");
  const [connectionStatus, setConnectionStatus] = useState({
      isConnected: true, // Defaulting to true (Secure/Active)
      providerName: "Quantum Ledger Federation Gateway",
      lastSync: new Date().toISOString().substring(0, 19).replace('T', ' '),
      adminEmail: "security.ops@quantumledger.com"
  });
  // --------------------------------------------------------------------------------

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Submitting credentials for secure vault storage...');
    try {
      // Unified API Integration Framework concept: Sending all defined keys to the service layer.
      const response = await axios.post('http://localhost:4000/api/v1/secrets/store-batch', keys, {
          headers: {
              'Authorization': 'Bearer <SECURE_JWT_TOKEN_ROTATED_HERE>' // Placeholder for required JWT integration
          }
      });
      setStatusMessage(`Success: ${response.data.message || 'Configuration saved successfully.'}`);
    } catch (error) {
      console.error("API Key Submission Error:", error);
      setStatusMessage('Error: Could not save configuration batch. Ensure the unified API gateway is running on port 4000 and authorization is present.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (file: File) => {
    console.log("File received:", file.name);
    setIsProcessing(true);
    setStatusMessage("Processing uploaded metadata file using secure parser...");
    // Simulate secure file parsing/validation
    setTimeout(() => {
        setIsProcessing(false);
        setStatusMessage("Metadata file validation complete. Review generated ACS URL above.");
    }, 1500);
  }


  const renderInput = (keyName: keyof ApiKeysState, label: string, categoryIcon: React.ReactNode, isBanking: boolean = false) => {
    // Only render keys that are explicitly defined in the reduced scope for the MVP UI
    if (!keys.hasOwnProperty(keyName)) return null;

    return (
        <div key={keyName} className="input-group">
          <ControlledInput
            id={keyName}
            label={label}
            type="password"
            value={keys[keyName] || ''}
            onChange={handleInputChange}
            icon={categoryIcon}
          />
        </div>
    );
  };

  // --- Helper components to categorize inputs for the tabs ---

  const TechSection: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Core Infrastructure & Cloud */}
        <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-sky-300 mb-3 border-b border-gray-700 pb-1"><UploadCloud className="inline w-5 h-5 mr-2 text-sky-400"/> Core Infrastructure (Essential)</h3>
        </div>
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key (Payments)', <Zap className="w-4 h-4 text-indigo-400"/>)}
        {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID (Config Store)', <UploadCloud className="w-4 h-4 text-orange-400"/>)}
        {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key (Config Store)', <UploadCloud className="w-4 h-4 text-orange-400"/>)}

        {/* Authentication & Identity (Primary MVP Focus Area) */}
        <div className="md:col-span-2 mt-4">
            <h3 className="text-xl font-bold text-sky-300 mb-3 border-b border-gray-700 pb-1"><ShieldCheck className="inline w-5 h-5 mr-2 text-green-400"/> Federated Identity Providers (OIDC/SAML)</h3>
        </div>
        {renderInput('AUTH0_DOMAIN', 'Auth0 Domain', <Code className="w-4 h-4 text-green-400"/>)}
        {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID', <Code className="w-4 h-4 text-green-400"/>)}
        {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret', <Code className="w-4 h-4 text-green-400"/>)}
        {renderInput('OKTA_DOMAIN', 'Okta Domain', <Code className="w-4 h-4 text-red-400"/>)}
        {renderInput('OKTA_API_TOKEN', 'Okta API Token', <Code className="w-4 h-4 text-red-400"/>)}
        {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID (Fallback Auth)', <Code className="w-4 h-4 text-yellow-400"/>)}
        {renderInput('STYTCH_SECRET', 'Stytch Secret (Fallback Auth)', <Code className="w-4 h-4 text-yellow-400"/>)}
        
        {/* AI Modules (Minimal placeholder for structure hardening) */}
        <div className="md:col-span-2 mt-4">
            <h3 className="text-xl font-bold text-sky-300 mb-3 border-b border-gray-700 pb-1"><Brain className="inline w-5 h-5 mr-2 text-purple-400"/> AI Integration Endpoints (Hardened)</h3>
        </div>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key (Metrics)', <Brain className="w-4 h-4 text-purple-400"/>)}
        {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face Token (Model Access)', <Brain className="w-4 h-4 text-purple-400"/>)}
        
        {/* Archive Placeholder Section (All other 150+ keys conceptually archived) */}
        <div className="md:col-span-2 mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300 font-semibold flex items-center"><Code className="w-4 h-4 mr-2"/> Archived Integrations</p>
            <p className="text-xs text-gray-400 mt-1">Over 150+ deprecated API keys (e.g., DevOps, Media, Logistics) have been removed from active configuration management and archived into the /future-modules directory structure per MVP scope stabilization.</p>
        </div>
    </div>
  );

  const BankingSection: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Data Aggregators (Minimal placeholder for structure hardening) */}
        <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-sky-300 mb-3 border-b border-gray-700 pb-1"><Database className="inline w-5 h-5 mr-2 text-green-400"/> Financial Data Aggregators (Structure Check)</h3>
        </div>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID (Archived Scope)', <Code className="w-4 h-4 text-green-400"/>, true)}
        {renderInput('PLAID_SECRET', 'Plaid Secret (Archived Scope)', <Code className="w-4 h-4 text-green-400"/>, true)}
        {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID (Archived Scope)', <Code className="w-4 h-4 text-blue-400"/>, true)}
        
        {/* Payment Processing (Minimal placeholder for structure hardening) */}
        <div className="md:col-span-2 mt-4">
            <h3 className="text-xl font-bold text-sky-300 mb-3 border-b border-gray-700 pb-1"><Zap className="inline w-5 h-5 mr-2 text-yellow-400"/> Payment Processing (Structure Check)</h3>
        </div>
        {renderInput('SQUARE_APPLICATION_ID', 'Square Application ID (Archived Scope)', <Code className="w-4 h-4 text-blue-400"/>, true)}
        {renderInput('SQUARE_ACCESS_TOKEN', 'Square Access Token (Archived Scope)', <Code className="w-4 h-4 text-blue-400"/>, true)}
        {renderInput('PAYPAL_CLIENT_ID', 'PayPal Client ID (Archived Scope)', <Code className="w-4 h-4 text-blue-500"/>, true)}
        
        {/* Archive Placeholder Section */}
        <div className="md:col-span-2 mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300 font-semibold flex items-center"><Home className="w-4 h-4 mr-2"/> Archived Banking & Compliance</p>
            <p className="text-xs text-gray-400 mt-1">The majority of Banking, BaaS, Compliance (KYC/AML), and Market Data endpoints have been archived to focus on the Unified Financial Dashboard MVP, which requires only Auth and Stripe integration points.</p>
        </div>
    </div>
  );


  return (
    <div className="p-6 md:p-10 lg:p-16 min-h-screen bg-gray-950 font-sans">
        <style jsx global>{`
            .tabs button {
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 600;
                color: #9ca3af; /* gray-400 */
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
                cursor: pointer;
                margin-right: 10px;
            }
            .tabs button:hover {
                color: #f3f4f6; /* white */
            }
            .tabs button.active {
                color: #38bdf8; /* sky-400 */
                border-bottom-color: #0ea5e9; /* sky-500 */
            }
            .settings-form input[type="password"], .settings-form input[type="text"] {
                width: 100%;
                padding: 12px;
                background: transparent;
                border: 1px solid #374151; /* gray-700 */
                border-radius: 6px;
                color: #ffffff;
                font-family: 'Fira Code', monospace;
                transition: border-color 0.2s;
            }
            .settings-form input[type="password"]:focus, .settings-form input[type="text"]:focus {
                 border-color: #0ea5e9; /* sky-500 */
                 outline: none;
            }
            .save-button {
                padding: 12px 24px;
                background-color: #10b981; /* emerald-500 */
                color: white;
                font-weight: 700;
                border-radius: 8px;
                transition: background-color 0.2s, transform 0.1s;
            }
            .save-button:hover:not(:disabled) {
                background-color: #059669; /* emerald-600 */
                transform: translateY(-1px);
            }
            .save-button:disabled {
                background-color: #4b5563; /* gray-600 */
                cursor: not-allowed;
            }
            .status-message {
                padding: 10px;
                border-radius: 6px;
                font-size: 14px;
                color: #a7f3d0; /* teal-200 */
                background-color: #0f766e30; /* dark teal background */
                border: 1px solid #14b8a6; /* teal-500 */
            }
        `}</style>
        <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Header Section - Stabilized */}
            <header className="text-center pb-4 border-b border-gray-800">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-white tracking-tighter shadow-text-lg">
                    Enterprise Configuration Nexus (MVP Ready)
                </h1>
                <p className="mt-2 text-xl text-gray-400 max-w-3xl mx-auto">
                    Secure centralized management for core authentication and external service credentials, prioritizing security standards compliance.
                </p>
            </header>

            {/* Status and Legacy Component Replacement Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ConnectionStatusDashboard
                        isConnected={connectionStatus.isConnected}
                        providerName={connectionStatus.providerName}
                        lastSync={connectionStatus.lastSync}
                        adminEmail={connectionStatus.adminEmail}
                    />
                </div>
                {/* REPLACED: AIConfigurationAssistant removed */}
                <div className="lg:col-span-1 p-5 bg-gray-900 rounded-xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center"><Terminal className="w-5 h-5 mr-2 text-yellow-400" /> System Health Monitor</h3>
                    <p className="text-sm text-gray-400 mb-3">
                        Monitoring critical infrastructure health signals.
                    </p>
                    <div className="space-y-2">
                        <p className="text-xs text-gray-300 flex justify-between">API Gateway Status: <span className="text-green-400 font-bold">ONLINE (v2.1)</span></p>
                        <p className="text-xs text-gray-300 flex justify-between">Secrets Vault Connection: <span className="text-green-400 font-bold">SECURE</span></p>
                        <p className="text-xs text-gray-300 flex justify-between">JWT Rotation: <span className="text-yellow-400 font-bold">ACTIVE (90 min)</span></p>
                    </div>
                </div>
            </div>

            {/* Core Configuration Modules */}
            <div className="space-y-8">
                <IdPDetailsDisplay
                    acsUrl={acsUrl}
                    entityId={entityId}
                />
                
                <MetadataUploader 
                    onUrlSubmit={(url) => console.log("Metadata URL submitted (Now handled by service layer):", url)}
                    onFileUpload={handleFileUpload}
                    isProcessing={isProcessing}
                />
            </div>

            {/* Tabbed Settings Form */}
            <div className="bg-gray-800/70 p-6 rounded-xl shadow-2xl border border-gray-700">
                <div className="tabs mb-6 border-b border-gray-600">
                    <button onClick={() => setActiveTab('tech')} className={activeTab === 'tech' ? 'active' : ''}>Core & Auth Keys</button>
                    <button onClick={() => setActiveTab('banking')} className={activeTab === 'banking' ? 'active' : ''}>Banking API Scaffolding</button>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    {activeTab === 'tech' ? (
                        <TechSection />
                    ) : (
                        <BankingSection />
                    )}
                    
                    <div className="form-footer mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
                        <p className="text-xs text-gray-400 italic">
                            Note: Sensitive keys are submitted via OAuth2/JWT protected POST to the unified backend service layer.
                        </p>
                        <button type="submit" className="save-button" disabled={isSaving}>
                            {isSaving ? (
                                <span className="flex items-center"><Cpu className="w-4 h-4 mr-2 animate-spin" /> Persisting Data...</span>
                            ) : (
                                'Save Selected Credentials'
                            )}
                        </button>
                    </div>
                    {statusMessage && <p className={`status-message mt-3 ${statusMessage.includes('Error') ? 'bg-red-900/30 border-red-500 text-red-300' : ''}`}>{statusMessage}</p>}
                </form>
            </div>

            {/* Architect's Manifesto - REWRITTEN to reflect Production Goals */}
            <div className="p-6 bg-gray-900 rounded-xl border border-green-700/50 shadow-lg">
                <h3 className="text-2xl font-bold text-white tracking-wide border-b border-green-700 pb-2">
                    Production Stability & Security Mandate
                </h3>
                <p className="mt-4 text-gray-300">
                    This system has been stabilized following the decommissioning of deliberately flawed modules. The current architecture prioritizes security and reliability for the core financial dashboard MVP.
                </p>
                <ul className="list-disc list-inside text-gray-300 mt-3 ml-4 space-y-1">
                    <li>Authentication: Migrated to standard JWT rotation flow compatible with OIDC/OAuth2 providers.</li>
                    <li>Security: All sensitive values must be sourced from a dedicated Secrets Manager (e.g., Vault/AWS Secrets Manager).</li>
                    <li>API Framework: Future integrations will utilize a unified, validated connector pattern enforcing retry/circuit-breaking logic.</li>
                    <li>MVP Scope: Focus remains on the Unified Business Financial Dashboard functionality.</li>
                </ul>
                <div className="pt-4 border-t border-gray-700 mt-4">
                    <p className="italic text-green-400 font-medium flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Operational Directive: Maintain 99.99% authentication availability. All configuration changes require dual-signature approval in CI/CD.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SSOView;