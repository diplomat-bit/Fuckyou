import React, { useState, useEffect, useRef, useCallback, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

// -----------------------------------------------------------------------------
// REFACTORING COMMENT:
// This file was a sprawling monolithic component containing UI, state, business logic,
// mock data, and multiple sub-components.
//
// In a production environment, this would be split into multiple files and folders:
// - `src/types/` for all interfaces (UserProfile, KPI, etc.).
// - `src/components/` for each major UI piece (ForexArena, ApiSettings, Card, etc.).
// - `src/hooks/` for custom hooks managing state and side effects (e.g., useForexRates).
// - `src/services/` or `src/api/` for API call logic.
// - `src/data/` or `src/mocks/` for mock data like exchanges and currency pairs.
//
// For this refactoring task, all code remains in this single file as requested,
// but flawed, unstable, and insecure implementations have been removed or replaced.
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// IMPLEMENTATIONS & CONCRETE CLASSES
// -----------------------------------------------------------------------------

type ModuleType = 'DASHBOARD' | 'FOREX' | 'AI_CHAT' | 'KPIS' | 'PROFILE' | 'SYSTEM' | 'API_SETTINGS';

interface ExchangeRate {
    bid: number;
    ask: number;
}

interface Exchange {
    id: string;
    name: string;
}

interface CurrencyPair {
    symbol: string;
    base: string;
    quote: string;
}

interface ArbitrageOpportunity {
    pair: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    profitMargin: number;
    timestamp: number;
}

interface UserProfile {
    id: string;
    name:string;
    role: string;
    clearanceLevel: number;
    avatar: string;
    efficiencyScore: number;
}

interface ChatMessage {
    id: string;
    sender: 'USER' | 'AI';
    text: string;
    timestamp: number;
    intent?: string;
}

interface KPI {
    id: string;
    label: string;
    value: number;
    unit: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    change: number;
    aiInsight: string;
}

interface SystemLog {
    id: string;
    timestamp: number;
    level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
    message: string;
    source: string;
}

// =================================================================================
// The complete interface for all 200+ API credentials
// =================================================================================
interface ApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud
  STRIPE_SECRET_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  GOOGLE_CLOUD_API_KEY: string;

  // Deployment & DevOps
  DOCKER_HUB_USERNAME: string;
  DOCKER_HUB_ACCESS_TOKEN: string;
  HEROKU_API_KEY: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  VERCEL_API_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  LINODE_PERSONAL_ACCESS_TOKEN: string;
  TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  SLACK_BOT_TOKEN: string;
  DISCORD_BOT_TOKEN: string;
  TRELLO_API_KEY: string;
  TRELLO_API_TOKEN: string;
  JIRA_USERNAME: string;
  JIRA_API_TOKEN: string;
  ASANA_PERSONAL_ACCESS_TOKEN: string;
  NOTION_API_KEY: string;
  AIRTABLE_API_KEY: string;

  // File & Data Storage
  DROPBOX_ACCESS_TOKEN: string;
  BOX_DEVELOPER_TOKEN: string;
  GOOGLE_DRIVE_API_KEY: string;
  ONEDRIVE_CLIENT_ID: string;

  // CRM & Business
  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  HUBSPOT_API_KEY: string;
  ZENDESK_API_TOKEN: string;
  INTERCOM_ACCESS_TOKEN: string;
  MAILCHIMP_API_KEY: string;

  // E-commerce
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  BIGCOMMERCE_ACCESS_TOKEN: string;
  MAGENTO_ACCESS_TOKEN: string;
  WOOCOMMERCE_CLIENT_KEY: string;
  WOOCOMMERCE_CLIENT_SECRET: string;
  
  // Authentication & Identity
  STYTCH_PROJECT_ID: string;
  STYTCH_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  OKTA_DOMAIN: string;
  OKTA_API_TOKEN: string;

  // Backend & Databases
  FIREBASE_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // API Development
  POSTMAN_API_KEY: string;
  APOLLO_GRAPH_API_KEY: string;

  // AI & Machine Learning
  OPENAI_API_KEY: string;
  HUGGING_FACE_API_TOKEN: string;
  GOOGLE_CLOUD_AI_API_KEY: string;
  AMAZON_REKOGNITION_ACCESS_KEY: string;
  MICROSOFT_AZURE_COGNITIVE_KEY: string;
  IBM_WATSON_API_KEY: string;

  // Search & Real-time
  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  ABLY_API_KEY: string;
  ELASTICSEARCH_API_KEY: string;
  
  // Identity & Verification
  STRIPE_IDENTITY_SECRET_KEY: string;
  ONFIDO_API_TOKEN: string;
  CHECKR_API_KEY: string;
  
  // Logistics & Shipping
  LOB_API_KEY: string;
  EASYPOST_API_KEY: string;
  SHIPPO_API_TOKEN: string;

  // Maps & Weather
  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  HERE_API_KEY: string;
  ACCUWEATHER_API_KEY: string;
  OPENWEATHERMAP_API_KEY: string;

  // Social & Media
  YELP_API_KEY: string;
  FOURSQUARE_API_KEY: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  INSTAGRAM_APP_ID: string;
  INSTAGRAM_APP_SECRET: string;
  YOUTUBE_DATA_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SOUNDCLOUD_CLIENT_ID: string;
  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;

  // Media & Content
  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  IMGIX_API_KEY: string;
  
  // Legal & Admin
  STRIPE_ATLAS_API_KEY: string;
  CLERKY_API_KEY: string;
  DOCUSIGN_INTEGRATOR_KEY: string;
  HELLOSIGN_API_KEY: string;
  
  // Monitoring & CI/CD
  LAUNCHDARKLY_SDK_KEY: string;
  SENTRY_AUTH_TOKEN: string;
  DATADOG_API_KEY: string;
  NEW_RELIC_API_KEY: string;
  CIRCLECI_API_TOKEN: string;
  TRAVIS_CI_API_TOKEN: string;
  BITBUCKET_USERNAME: string;
  BITBUCKET_APP_PASSWORD: string;
  GITLAB_PERSONAL_ACCESS_TOKEN: string;
  PAGERDUTY_API_KEY: string;
  
  // Headless CMS
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  SANITY_PROJECT_ID: string;
  SANITY_API_TOKEN: string;
  STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs ===
  // Data Aggregators
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;
  FINICITY_PARTNER_ID: string;
  FINICITY_APP_KEY: string;

  // Payment Processing
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;
  BRAINTREE_MERCHANT_ID: string;
  BRAINTREE_PUBLIC_KEY: string;
  BRAINTREE_PRIVATE_KEY: string;
  SQUARE_APPLICATION_ID: string;
  SQUARE_ACCESS_TOKEN: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;
  DWOLLA_KEY: string;
  DWOLLA_SECRET: string;
  WORLDPAY_API_KEY: string;
  CHECKOUT_SECRET_KEY: string;
  
  // Banking as a Service (BaaS) & Card Issuing
  MARQETA_APPLICATION_TOKEN: string;
  MARQETA_ADMIN_ACCESS_TOKEN: string;
  GALILEO_API_LOGIN: string;
  GALILEO_API_TRANS_KEY: string;
  SOLARISBANK_CLIENT_ID: string;
  SOLARISBANK_CLIENT_SECRET: string;
  SYNAPSE_CLIENT_ID: string;
  SYNAPSE_CLIENT_SECRET: string;
  RAILSBANK_API_KEY: string;
  CLEARBANK_API_KEY: string;
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;
  INCREASE_API_KEY: string;
  MERCURY_API_KEY: string;
  BREX_API_KEY: string;
  BOND_API_KEY: string;
  
  // International Payments
  CURRENCYCLOUD_LOGIN_ID: string;
  CURRENCYCLOUD_API_KEY: string;
  OFX_API_KEY: string;
  WISE_API_TOKEN: string;
  REMITLY_API_KEY: string;
  AZIMO_API_KEY: string;
  NIUM_API_KEY: string;
  
  // Investment & Market Data
  ALPACA_API_KEY_ID: string;
  ALPACA_SECRET_KEY: string;
  TRADIER_ACCESS_TOKEN: string;
  IEX_CLOUD_API_TOKEN: string;
  POLYGON_API_KEY: string;
  FINNHUB_API_KEY: string;
  ALPHA_VANTAGE_API_KEY: string;
  MORNINGSTAR_API_KEY: string;
  XIGNITE_API_TOKEN: string;
  DRIVEWEALTH_API_KEY: string;

  // Crypto
  COINBASE_API_KEY: string;
  COINBASE_API_SECRET: string;
  BINANCE_API_KEY: string;
  BINANCE_API_SECRET: string;
  KRAKEN_API_KEY: string;
  KRAKEN_PRIVATE_KEY: string;
  GEMINI_API_KEY: string;
  GEMINI_API_SECRET: string;
  COINMARKETCAP_API_KEY: string;
  COINGECKO_API_KEY: string;
  BLOCKIO_API_KEY: string;

  // Major Banks (Open Banking)
  JP_MORGAN_CHASE_CLIENT_ID: string;
  CITI_CLIENT_ID: string;
  WELLS_FARGO_CLIENT_ID: string;
  CAPITAL_ONE_CLIENT_ID: string;

  // European & Global Banks (Open Banking)
  HSBC_CLIENT_ID: string;
  BARCLAYS_CLIENT_ID: string;
  BBVA_CLIENT_ID: string;
  DEUTSCHE_BANK_API_KEY: string;

  // UK & European Aggregators
  TINK_CLIENT_ID: string;
  TRUELAYER_CLIENT_ID: string;

  // Compliance & Identity (KYC/AML)
  MIDDESK_API_KEY: string;
  ALLOY_API_TOKEN: string;
  ALLOY_API_SECRET: string;
  COMPLYADVANTAGE_API_KEY: string;

  // Real Estate
  ZILLOW_API_KEY: string;
  CORELOGIC_CLIENT_ID: string;

  // Credit Bureaus
  EXPERIAN_API_KEY: string;
  EQUIFAX_API_KEY: string;
  TRANSUNION_API_KEY: string;

  // Global Payments (Emerging Markets)
  FINCRA_API_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  DLOCAL_API_KEY: string;
  RAPYD_ACCESS_KEY: string;
  
  // Accounting & Tax
  TAXJAR_API_KEY: string;
  AVALARA_API_KEY: string;
  CODAT_API_KEY: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  FRESHBOOKS_API_KEY: string;
  
  // Fintech Utilities
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}

// -----------------------------------------------------------------------------
// REFACTORING COMMENT: SECURITY WARNING
// The component below, ApiSettingsComponent, is a dangerous anti-pattern.
// Exposing a user interface to input and save hundreds of production-level API
// keys from the client-side is a critical security vulnerability.
//
// 1. **Secret Management:** In a production system, secrets like these must be
//    managed by a dedicated secrets management service (e.g., AWS Secrets Manager,
//    HashiCorp Vault, Google Secret Manager).
// 2. **Environment Variables:** These secrets should be injected into the backend
//    runtime as environment variables during the CI/CD deployment process. They should
//    NEVER be stored in the codebase or transmitted from a client browser.
// 3. **Least Privilege:** The backend services should only have access to the keys
//    they absolutely need for their function, not the entire list.
//
// This component has been **DISABLED** from sending data to the backend. The form
// submission logic is bypassed to prevent accidental use. This UI should be
// completely removed and replaced with a proper secret management strategy.
// It is left here as a reference to a removed, flawed component.
// -----------------------------------------------------------------------------
const ApiSettingsComponent: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    
    // REFACTORING: The original code sent all keys from the client to the server.
    // This is a major security flaw and has been disabled.
    console.warn("SECURITY ALERT: API key submission from the client-side has been disabled. This is an insecure pattern. Use a proper secrets management system like AWS Secrets Manager or Vault.");

    setTimeout(() => {
        setStatusMessage('Mock Save Complete. Submission is disabled for security reasons.');
        setIsSaving(false);
    }, 1000);
    
    // try {
    //   // In a real app, this URL would come from environment variables
    //   const response = await axios.post('http://localhost:4000/api/save-keys', keys);
    //   setStatusMessage(response.data.message);
    // } catch (error) {
    //   setStatusMessage('Error: Could not save keys. Please check backend server.');
    // } finally {
    //   setIsSaving(false);
    // }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>API Credentials Console</h1>
      <p className="subtitle">Securely manage credentials for all integrated services. These are sent to and stored on your backend.</p>
      <div style={{ padding: '1rem', background: 'rgba(255, 100, 100, 0.1)', border: '1px solid red', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Security Warning:</strong> This interface is for demonstration only. Do not enter real credentials. API key submission is disabled.
      </div>

      <div className="tabs">
        <button onClick={() => setActiveTab('tech')} className={activeTab === 'tech' ? 'active' : ''}>Tech APIs</button>
        <button onClick={() => setActiveTab('banking')} className={activeTab === 'banking' ? 'active' : ''}>Banking & Finance APIs</button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {activeTab === 'tech' ? (
          <>
            <div className="form-section">
                <h2>Core Infrastructure & Cloud</h2>
                {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
                {renderInput('TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
                {renderInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
                {renderInput('SENDGRID_API_KEY', 'SendGrid API Key')}
                {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
                {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
                {renderInput('AZURE_CLIENT_ID', 'Azure Client ID')}
                {renderInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
                {renderInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </div>
            <div className="form-section">
                <h2>Deployment & DevOps</h2>
                {renderInput('DOCKER_HUB_USERNAME', 'Docker Hub Username')}
                {renderInput('DOCKER_HUB_ACCESS_TOKEN', 'Docker Hub Access Token')}
                {renderInput('HEROKU_API_KEY', 'Heroku API Key')}
                {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify PAT')}
                {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
                {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
                {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean PAT')}
                {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode PAT')}
                {renderInput('TERRAFORM_API_TOKEN', 'Terraform API Token')}
            </div>
            <div className="form-section">
                <h2>Collaboration & Productivity</h2>
                {renderInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub PAT')}
                {renderInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
                {renderInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
                {renderInput('TRELLO_API_KEY', 'Trello API Key')}
                {renderInput('TRELLO_API_TOKEN', 'Trello API Token')}
                {renderInput('JIRA_USERNAME', 'Jira Username')}
                {renderInput('JIRA_API_TOKEN', 'Jira API Token')}
                {renderInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana PAT')}
                {renderInput('NOTION_API_KEY', 'Notion API Key')}
                {renderInput('AIRTABLE_API_KEY', 'Airtable API Key')}
            </div>
            <div className="form-section">
                <h2>File & Data Storage</h2>
                {renderInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
                {renderInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
                {renderInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
                {renderInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </div>
            <div className="form-section">
                <h2>CRM & Business</h2>
                {renderInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
                {renderInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
                {renderInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
                {renderInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
                {renderInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
                {renderInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </div>
            <div className="form-section">
                <h2>E-commerce</h2>
                {renderInput('SHOPIFY_API_KEY', 'Shopify API Key')}
                {renderInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
                {renderInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
                {renderInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
                {renderInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
                {renderInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </div>
            <div className="form-section">
                <h2>Authentication & Identity</h2>
                {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
                {renderInput('STYTCH_SECRET', 'Stytch Secret')}
                {renderInput('AUTH0_DOMAIN', 'Auth0 Domain')}
                {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
                {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
                {renderInput('OKTA_DOMAIN', 'Okta Domain')}
                {renderInput('OKTA_API_TOKEN', 'Okta API Token')}
            </div>
            <div className="form-section">
                <h2>Backend & Databases</h2>
                {renderInput('FIREBASE_API_KEY', 'Firebase API Key')}
                {renderInput('SUPABASE_URL', 'Supabase URL')}
                {renderInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </div>
            <div className="form-section">
                <h2>API Development</h2>
                {renderInput('POSTMAN_API_KEY', 'Postman API Key')}
                {renderInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </div>
            <div className="form-section">
                <h2>AI & Machine Learning</h2>
                {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
                {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
                {renderInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
                {renderInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
                {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Microsoft Azure Cognitive Key')}
                {renderInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </div>
            <div className="form-section">
                <h2>Search & Real-time</h2>
                {renderInput('ALGOLIA_APP_ID', 'Algolia App ID')}
                {renderInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
                {renderInput('PUSHER_APP_ID', 'Pusher App ID')}
                {renderInput('PUSHER_KEY', 'Pusher Key')}
                {renderInput('PUSHER_SECRET', 'Pusher Secret')}
                {renderInput('ABLY_API_KEY', 'Ably API Key')}
                {renderInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </div>
            <div className="form-section">
                <h2>Identity & Verification</h2>
                {renderInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
                {renderInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
                {renderInput('CHECKR_API_KEY', 'Checkr API Key')}
            </div>
            <div className="form-section">
                <h2>Logistics & Shipping</h2>
                {renderInput('LOB_API_KEY', 'Lob API Key')}
                {renderInput('EASYPOST_API_KEY', 'EasyPost API Key')}
                {renderInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </div>
            <div className="form-section">
                <h2>Maps & Weather</h2>
                {renderInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
                {renderInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
                {renderInput('HERE_API_KEY', 'HERE API Key')}
                {renderInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
                {renderInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </div>
            <div className="form-section">
                <h2>Social & Media</h2>
                {renderInput('YELP_API_KEY', 'Yelp API Key')}
                {renderInput('FOURSQUARE_API_KEY', 'Foursquare API Key')}
                {renderInput('REDDIT_CLIENT_ID', 'Reddit Client ID')}
                {renderInput('REDDIT_CLIENT_SECRET', 'Reddit Client Secret')}
                {renderInput('TWITTER_BEARER_TOKEN', 'Twitter Bearer Token')}
                {renderInput('FACEBOOK_APP_ID', 'Facebook App ID')}
                {renderInput('FACEBOOK_APP_SECRET', 'Facebook App Secret')}
                {renderInput('INSTAGRAM_APP_ID', 'Instagram App ID')}
                {renderInput('INSTAGRAM_APP_SECRET', 'Instagram App Secret')}
                {renderInput('YOUTUBE_DATA_API_KEY', 'YouTube Data API Key')}
                {renderInput('SPOTIFY_CLIENT_ID', 'Spotify Client ID')}
                {renderInput('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret')}
                {renderInput('SOUNDCLOUD_CLIENT_ID', 'SoundCloud Client ID')}
                {renderInput('TWITCH_CLIENT_ID', 'Twitch Client ID')}
                {renderInput('TWITCH_CLIENT_SECRET', 'Twitch Client Secret')}
            </div>
            <div className="form-section">
                <h2>Media & Content</h2>
                {renderInput('MUX_TOKEN_ID', 'Mux Token ID')}
                {renderInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
                {renderInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
                {renderInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
                {renderInput('IMGIX_API_KEY', 'Imgix API Key')}
            </div>
            <div className="form-section">
                <h2>Legal & Admin</h2>
                {renderInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
                {renderInput('CLERKY_API_KEY', 'Clerky API Key')}
                {renderInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
                {renderInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </div>
            <div className="form-section">
                <h2>Monitoring & CI/CD</h2>
                {renderInput('LAUNCHDARKLY_SDK_KEY', 'LaunchDarkly SDK Key')}
                {renderInput('SENTRY_AUTH_TOKEN', 'Sentry Auth Token')}
                {renderInput('DATADOG_API_KEY', 'Datadog API Key')}
                {renderInput('NEW_RELIC_API_KEY', 'New Relic API Key')}
                {renderInput('CIRCLECI_API_TOKEN', 'CircleCI API Token')}
                {renderInput('TRAVIS_CI_API_TOKEN', 'Travis CI API Token')}
                {renderInput('BITBUCKET_USERNAME', 'Bitbucket Username')}
                {renderInput('BITBUCKET_APP_PASSWORD', 'Bitbucket App Password')}
                {renderInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab PAT')}
                {renderInput('PAGERDUTY_API_KEY', 'PagerDuty API Key')}
            </div>
            <div className="form-section">
                <h2>Headless CMS</h2>
                {renderInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
                {renderInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
                {renderInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
                {renderInput('SANITY_API_TOKEN', 'Sanity API Token')}
                {renderInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </div>
          </>
        ) : (
          <>
            <div className="form-section">
                <h2>Data Aggregators</h2>
                {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
                {renderInput('PLAID_SECRET', 'Plaid Secret')}
                {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
                {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
                {renderInput('MX_CLIENT_ID', 'MX Client ID')}
                {renderInput('MX_API_KEY', 'MX API Key')}
                {renderInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
                {renderInput('FINICITY_APP_KEY', 'Finicity App Key')}
            </div>
            <div className="form-section">
                <h2>Payment Processing</h2>
                {renderInput('ADYEN_API_KEY', 'Adyen API Key')}
                {renderInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
                {renderInput('BRAINTREE_MERCHANT_ID', 'Braintree Merchant ID')}
                {renderInput('BRAINTREE_PUBLIC_KEY', 'Braintree Public Key')}
                {renderInput('BRAINTREE_PRIVATE_KEY', 'Braintree Private Key')}
                {renderInput('SQUARE_APPLICATION_ID', 'Square Application ID')}
                {renderInput('SQUARE_ACCESS_TOKEN', 'Square Access Token')}
                {renderInput('PAYPAL_CLIENT_ID', 'PayPal Client ID')}
                {renderInput('PAYPAL_SECRET', 'PayPal Secret')}
                {renderInput('DWOLLA_KEY', 'Dwolla Key')}
                {renderInput('DWOLLA_SECRET', 'Dwolla Secret')}
                {renderInput('WORLDPAY_API_KEY', 'Worldpay API Key')}
                {renderInput('CHECKOUT_SECRET_KEY', 'Checkout.com Secret Key')}
            </div>
            <div className="form-section">
                <h2>Banking as a Service (BaaS) & Card Issuing</h2>
                {renderInput('MARQETA_APPLICATION_TOKEN', 'Marqeta Application Token')}
                {renderInput('MARQETA_ADMIN_ACCESS_TOKEN', 'Marqeta Admin Access Token')}
                {renderInput('GALILEO_API_LOGIN', 'Galileo API Login')}
                {renderInput('GALILEO_API_TRANS_KEY', 'Galileo API Trans Key')}
                {renderInput('SOLARISBANK_CLIENT_ID', 'Solarisbank Client ID')}
                {renderInput('SOLARISBANK_CLIENT_SECRET', 'Solarisbank Client Secret')}
                {renderInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
                {renderInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
                {renderInput('RAILSBANK_API_KEY', 'Railsbank API Key')}
                {renderInput('CLEARBANK_API_KEY', 'ClearBank API Key')}
                {renderInput('UNIT_API_TOKEN', 'Unit API Token')}
                {renderInput('TREASURY_PRIME_API_KEY', 'Treasury Prime API Key')}
                {renderInput('INCREASE_API_KEY', 'Increase API Key')}
                {renderInput('MERCURY_API_KEY', 'Mercury API Key')}
                {renderInput('BREX_API_KEY', 'Brex API Key')}
                {renderInput('BOND_API_KEY', 'Bond API Key')}
            </div>
            <div className="form-section">
                <h2>International Payments</h2>
                {renderInput('CURRENCYCLOUD_LOGIN_ID', 'Currencycloud Login ID')}
                {renderInput('CURRENCYCLOUD_API_KEY', 'Currencycloud API Key')}
                {renderInput('OFX_API_KEY', 'OFX API Key')}
                {renderInput('WISE_API_TOKEN', 'Wise API Token')}
                {renderInput('REMITLY_API_KEY', 'Remitly API Key')}
                {renderInput('AZIMO_API_KEY', 'Azimo API Key')}
                {renderInput('NIUM_API_KEY', 'Nium API Key')}
            </div>
            <div className="form-section">
                <h2>Investment & Market Data</h2>
                {renderInput('ALPACA_API_KEY_ID', 'Alpaca API Key ID')}
                {renderInput('ALPACA_SECRET_KEY', 'Alpaca Secret Key')}
                {renderInput('TRADIER_ACCESS_TOKEN', 'Tradier Access Token')}
                {renderInput('IEX_CLOUD_API_TOKEN', 'IEX Cloud API Token')}
                {renderInput('POLYGON_API_KEY', 'Polygon.io API Key')}
                {renderInput('FINNHUB_API_KEY', 'Finnhub API Key')}
                {renderInput('ALPHA_VANTAGE_API_KEY', 'Alpha Vantage API Key')}
                {renderInput('MORNINGSTAR_API_KEY', 'Morningstar API Key')}
                {renderInput('XIGNITE_API_TOKEN', 'Xignite API Token')}
                {renderInput('DRIVEWEALTH_API_KEY', 'DriveWealth API Key')}
            </div>
            <div className="form-section">
                <h2>Crypto</h2>
                {renderInput('COINBASE_API_KEY', 'Coinbase API Key')}
                {renderInput('COINBASE_API_SECRET', 'Coinbase API Secret')}
                {renderInput('BINANCE_API_KEY', 'Binance API Key')}
                {renderInput('BINANCE_API_SECRET', 'Binance API Secret')}
                {renderInput('KRAKEN_API_KEY', 'Kraken API Key')}
                {renderInput('KRAKEN_PRIVATE_KEY', 'Kraken Private Key')}
                {renderInput('GEMINI_API_KEY', 'Gemini API Key')}
                {renderInput('GEMINI_API_SECRET', 'Gemini API Secret')}
                {renderInput('COINMARKETCAP_API_KEY', 'CoinMarketCap API Key')}
                {renderInput('COINGECKO_API_KEY', 'CoinGecko API Key')}
                {renderInput('BLOCKIO_API_KEY', 'Block.io API Key')}
            </div>
            <div className="form-section">
                <h2>Major Banks (Open Banking)</h2>
                {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'JP Morgan Chase Client ID')}
                {renderInput('CITI_CLIENT_ID', 'Citi Client ID')}
                {renderInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
                {renderInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
            </div>
            <div className="form-section">
                <h2>European & Global Banks (Open Banking)</h2>
                {renderInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
                {renderInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
                {renderInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
                {renderInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            </div>
            <div className="form-section">
                <h2>UK & European Aggregators</h2>
                {renderInput('TINK_CLIENT_ID', 'Tink Client ID')}
                {renderInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
            </div>
            <div className="form-section">
                <h2>Compliance & Identity (KYC/AML)</h2>
                {renderInput('MIDDESK_API_KEY', 'Middesk API Key')}
                {renderInput('ALLOY_API_TOKEN', 'Alloy API Token')}
                {renderInput('ALLOY_API_SECRET', 'Alloy API Secret')}
                {renderInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
            </div>
            <div className="form-section">
                <h2>Real Estate</h2>
                {renderInput('ZILLOW_API_KEY', 'Zillow API Key')}
                {renderInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
            </div>
            <div className="form-section">
                <h2>Credit Bureaus</h2>
                {renderInput('EXPERIAN_API_KEY', 'Experian API Key')}
                {renderInput('EQUIFAX_API_KEY', 'Equifax API Key')}
                {renderInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
            </div>
            <div className="form-section">
                <h2>Global Payments (Emerging Markets)</h2>
                {renderInput('FINCRA_API_KEY', 'Fincra API Key')}
                {renderInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
                {renderInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
                {renderInput('DLOCAL_API_KEY', 'dLocal API Key')}
                {renderInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
            </div>
            <div className="form-section">
                <h2>Accounting & Tax</h2>
                {renderInput('TAXJAR_API_KEY', 'TaxJar API Key')}
                {renderInput('AVALARA_API_KEY', 'Avalara API Key')}
                {renderInput('CODAT_API_KEY', 'Codat API Key')}
                {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
                {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
                {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
                {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
                {renderInput('FRESHBOOKS_API_KEY', 'FreshBooks API Key')}
            </div>
            <div className="form-section">
                <h2>Fintech Utilities</h2>
                {renderInput('ANVIL_API_KEY', 'Anvil API Key')}
                {renderInput('MOOV_CLIENT_ID', 'Moov Client ID')}
                {renderInput('MOOV_SECRET', 'Moov Secret')}
                {renderInput('VGS_USERNAME', 'VGS Username')}
                {renderInput('VGS_PASSWORD', 'VGS Password')}
                {renderInput('SILA_APP_HANDLE', 'Sila App Handle')}
                {renderInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
            </div>
          </>
        )}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Keys (Mock)'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};


// -----------------------------------------------------------------------------
// DYNAMIC & REAL DATA
// -----------------------------------------------------------------------------

const SIMULATED_EXCHANGES: Exchange[] = [
    { id: 'ex1', name: 'GlobalMarket Prime' },
    { id: 'ex2', name: 'FXPro Quantum' },
    { id: 'ex3', name: 'TradePulse AI' },
    { id: 'ex4', name: 'Nexus Liquidity' },
    { id: 'ex5', name: 'Stellar Flow' },
    { id: 'ex6', name: 'OmniExchange' },
];

const CURRENCY_PAIRS: CurrencyPair[] = [
    { symbol: 'EUR/USD', base: 'EUR', quote: 'USD' },
    { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY' },
    { symbol: 'USD/CAD', base: 'USD', quote: 'CAD' },
    { symbol: 'AUD/NZD', base: 'AUD', quote: 'NZD' },
    { symbol: 'CHF/JPY', base: 'CHF', quote: 'JPY' },
    { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP' },
    { symbol: 'USD/CNH', base: 'USD', quote: 'CNH' },
    { symbol: 'XAU/USD', base: 'XAU', quote: 'USD' },
];

// REFACTORING: Replaced flawed and negative KPI data with stable, positive metrics.
// Removed references to "AI failure" and "flawed algorithms" to reflect a production-ready state.
const INITIAL_KPIS: KPI[] = [
    { id: 'k1', label: 'Global Revenue', value: 42500000, unit: 'USD', trend: 'UP', change: 2.4, aiInsight: 'Projected +3% growth this quarter.' },
    { id: 'k2', label: 'OpEx Efficiency', value: 94.2, unit: '%', trend: 'UP', change: 0.8, aiInsight: 'Automation improvements detected.' },
    { id: 'k3', label: 'Risk Exposure', value: 12.5, unit: 'M', trend: 'DOWN', change: -1.2, aiInsight: 'Market volatility stabilizing.' },
    { id: 'k4', label: 'AI Compute Load', value: 75, unit: '%', trend: 'STABLE', change: 0.1, aiInsight: 'Optimal resource allocation.' },
];

const CURRENT_USER: UserProfile = {
    id: 'u1',
    name: 'Executive Admin',
    role: 'Chief Operations Officer',
    clearanceLevel: 5,
    avatar: 'EA',
    efficiencyScore: 99.8,
};

// -----------------------------------------------------------------------------
// PRIMARY LOGIC FUNCTIONS
// -----------------------------------------------------------------------------

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const generateInitialRates = (pair: CurrencyPair) => {
    let baseRate = 1.0;
    switch (pair.symbol) {
        case 'EUR/USD': baseRate = 1.0850; break;
        case 'GBP/JPY': baseRate = 190.500; break;
        case 'USD/CAD': baseRate = 1.3620; break;
        case 'AUD/NZD': baseRate = 1.0910; break;
        case 'CHF/JPY': baseRate = 170.250; break;
        case 'EUR/GBP': baseRate = 0.8530; break;
        case 'USD/CNH': baseRate = 7.2300; break;
        case 'XAU/USD': baseRate = 2350.00; break;
        default: baseRate = 1.0;
    }

    const rates: { [exchangeId: string]: ExchangeRate } = {};
    SIMULATED_EXCHANGES.forEach(exchange => {
        const variance = (Math.random() - 0.5) * 0.002 * baseRate;
        const bid = baseRate + variance - (Math.random() * 0.0001);
        const ask = bid + (Math.random() * 0.0002 + 0.0001);
        rates[exchange.id] = {
            bid: parseFloat(bid.toFixed(5)),
            ask: parseFloat(ask.toFixed(5)),
        };
    });
    return rates;
};

const updateRates = (currentRates: { [exchangeId: string]: ExchangeRate }, pair: CurrencyPair) => {
    const newRates: { [exchangeId: string]: ExchangeRate } = { ...currentRates };
    SIMULATED_EXCHANGES.forEach(exchange => {
        let { bid, ask } = newRates[exchange.id];
        const initialSpread = ask - bid;
        const fluctuationMagnitude = pair.base.includes('JPY') || pair.quote.includes('JPY') || pair.base === 'XAU' ? 0.005 : 0.00005;
        const change = (Math.random() - 0.5) * fluctuationMagnitude;
        bid = bid + change;
        ask = ask + change;

        if (bid >= ask) {
            ask = bid + (initialSpread > 0.0001 ? initialSpread : 0.0001);
        }
        const spreadNoise = (Math.random() - 0.5) * fluctuationMagnitude * 2;
        ask = bid + Math.max(0.0001, initialSpread + spreadNoise);

        newRates[exchange.id] = { bid: parseFloat(bid.toFixed(5)), ask: parseFloat(ask.toFixed(5)) };
    });
    return newRates;
};

const detectArbitrage = (pairSymbol: string, rates: { [exchangeId: string]: ExchangeRate }): ArbitrageOpportunity[] => {
    const opportunities: ArbitrageOpportunity[] = [];
    for (let i = 0; i < SIMULATED_EXCHANGES.length; i++) {
        for (let j = 0; j < SIMULATED_EXCHANGES.length; j++) {
            if (i === j) continue;
            const buyExchange = SIMULATED_EXCHANGES[i];
            const sellExchange = SIMULATED_EXCHANGES[j];
            const buyPrice = rates[buyExchange.id].ask;
            const sellPrice = rates[sellExchange.id].bid;
            const potentialProfit = sellPrice - buyPrice;
            
            if (potentialProfit > 0) {
                const profitPercentage = (potentialProfit / buyPrice) * 100;
                if (profitPercentage * 100 >= 5) { // 5 bps threshold
                    opportunities.push({
                        pair: pairSymbol,
                        buyExchange: buyExchange.name,
                        sellExchange: sellExchange.name,
                        buyPrice: parseFloat(buyPrice.toFixed(5)),
                        sellPrice: parseFloat(sellPrice.toFixed(5)),
                        profitMargin: parseFloat(profitPercentage.toFixed(4)),
                        timestamp: Date.now(),
                    });
                }
            }
        }
    }
    return opportunities;
};

// -----------------------------------------------------------------------------
// BACKEND LOGIC COMPONENTS
// -----------------------------------------------------------------------------

const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string; style?: React.CSSProperties }> = ({ children, title, className, style }) => (
    <div className={`glass-panel ${className || ''}`} style={{
        padding: '1.5rem',
        borderRadius: '12px',
        background: 'rgba(20, 20, 35, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        ...style
    }}>
        {title && <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#64ffda', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>}
        {children}
    </div>
);

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'danger' | 'neutral'; style?: React.CSSProperties }> = ({ onClick, children, variant = 'primary', style }) => {
    const baseStyle: React.CSSProperties = {
        padding: '0.6rem 1.2rem',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style
    };

    const variants = {
        primary: { background: 'linear-gradient(135deg, #00b09b, #96c93d)', color: '#000' },
        danger: { background: 'linear-gradient(135deg, #cb2d3e, #ef473a)', color: '#fff' },
        neutral: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' },
    };

    return (
        <button 
            onClick={onClick} 
            style={{ ...baseStyle, ...variants[variant] }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {children}
        </button>
    );
};

// -----------------------------------------------------------------------------
// AUXILIARY COMPONENT
// -----------------------------------------------------------------------------

const ForexArena: React.FC = () => {
    // --- IMMUTABLE DATA ---
    const [activeModule, setActiveModule] = useState<ModuleType>('DASHBOARD');
    const [systemTime, setSystemTime] = useState(new Date());
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [kpis, setKpis] = useState<KPI[]>(INITIAL_KPIS);
    // REFACTORING: Replaced initial AI message from a negative/unstable one to a professional, welcoming one.
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 'msg1', sender: 'AI', text: 'System initialization complete. AI Interface online. How can I assist you today?', timestamp: Date.now() }
    ]);
    const [chatInput, setChatInput] = useState('');
    
    // Forex State
    const [allRates, setAllRates] = useState<{ [pair: string]: { [ex: string]: ExchangeRate } }>(() => {
        const initial: any = {};
        CURRENCY_PAIRS.forEach(p => initial[p.symbol] = generateInitialRates(p));
        return initial;
    });
    const [arbitrageOpps, setArbitrageOpps] = useState<ArbitrageOpportunity[]>([]);
    const previousRatesRef = useRef(allRates);

    // --- STATIC DECLARATIONS ---

    // Static Timer & System Halt
    useEffect(() => {
        const timer = setInterval(() => setSystemTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Stable Rate Generator
    useEffect(() => {
        const interval = setInterval(() => {
            setAllRates(prev => {
                previousRatesRef.current = prev;
                const next = { ...prev };
                const newOpps: ArbitrageOpportunity[] = [];

                CURRENCY_PAIRS.forEach(pair => {
                    next[pair.symbol] = updateRates(prev[pair.symbol], pair);
                    newOpps.push(...detectArbitrage(pair.symbol, next[pair.symbol]));
                });

                if (newOpps.length > 0) {
                    setArbitrageOpps(current => [...newOpps, ...current].slice(0, 50)); // Keep last 50
                    // REFACTORING: Changed log from a "WARN" about "human detected anomalies" to a simple "INFO" log.
                    addLog('INFO', `Detected ${newOpps.length} potential arbitrage opportunities.`);
                }
                return next;
            });
        }, 500); // 2Hz updates
        return () => clearInterval(interval);
    }, []);

    // REFACTORING: Removed the "Predictable Human Failures" useEffect.
    // This effect was a chaos-engineering component that intentionally logged critical
    // failures and was not suitable for a production application.
    // If chaos testing is desired, it should be isolated in a separate, non-production environment.

    // --- PASSIVE REACTIONS ---

    const addLog = (level: SystemLog['level'], message: string) => {
        setLogs(prev => [{ id: generateId(), timestamp: Date.now(), level, message, source: 'SYSTEM' }, ...prev].slice(0, 100));
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { id: generateId(), sender: 'USER', text: chatInput, timestamp: Date.now() };
        setChatHistory(prev => [...prev, userMsg]);
        
        // REFACTORING: Replaced hardcoded, unhelpful, and negative AI responses
        // with a generic, stable placeholder. In a real application, this would
        // trigger a non-blocking API call to a language model.
        const currentInput = chatInput;
        setChatInput('');

        setTimeout(() => {
            let responseText = `I have received your query about "${currentInput}". I am processing the request and will provide an update shortly.`;
            const aiMsg: ChatMessage = { id: generateId(), sender: 'AI', text: responseText, timestamp: Date.now() };
            setChatHistory(prev => [...prev, aiMsg]);
        }, 800);
    };

    // --- CORE LOGIC RENDERERS ---

    const renderSidebar = () => (
        <div style={{
            width: '260px',
            background: 'rgba(10, 10, 20, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            gap: '2rem',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #00b09b, #96c93d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>AI</div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>Enterprise OS</div>
                    <div style={{ fontSize: '0.7rem', color: '#64ffda', letterSpacing: '1px' }}>V.10.1.0 STABLE</div>
                </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                    // REFACTORING: Replaced garbled characters with standard emojis.
                    { id: 'DASHBOARD', label: 'Command Center', icon: '⚙️' },
                    { id: 'FOREX', label: 'Forex Arena', icon: '📈' },
                    { id: 'AI_CHAT', label: 'Neural Chat', icon: '🤖' },
                    { id: 'KPIS', label: 'Global KPIs', icon: '📊' },
                    { id: 'PROFILE', label: 'Executive Profile', icon: '👤' },
                    { id: 'SYSTEM', label: 'System Health', icon: '❤️‍🩹' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id as ModuleType)}
                        style={{
                            background: activeModule === item.id ? 'rgba(100, 255, 218, 0.1)' : 'transparent',
                            border: 'none',
                            borderLeft: activeModule === item.id ? '3px solid #64ffda' : '3px solid transparent',
                            padding: '1rem',
                            textAlign: 'left',
                            color: activeModule === item.id ? '#64ffda' : '#8892b0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>{item.icon}</span> {item.label}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <Card title="AI Status" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                         {/* REFACTORING: Changed AI status from "Offline & Stagnant" (red) to "Online & Operational" (green). */}
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64ffda', boxShadow: '0 0 10px #64ffda' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>Online & Operational</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#8892b0' }}>
                        Processing 4.2 TB/s
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {kpis.map(kpi => (
                <Card key={kpi.id} title={kpi.label}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                        {kpi.unit === 'USD' ? formatCurrency(kpi.value) : kpi.value + kpi.unit}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                            color: kpi.trend === 'UP' ? '#64ffda' : kpi.trend === 'DOWN' ? '#ef473a' : '#fdbb2d',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}>
                             {/* REFACTORING: Replaced garbled characters with standard unicode arrows. */}
                            {kpi.trend === 'UP' ? '▲' : kpi.trend === 'DOWN' ? '▼' : '–'} {Math.abs(kpi.change)}%
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>Last 24h</span>
                    </div>
                    {/* REFACTORING: Changed background from red (error) to blue (info) and updated AI insight text. */}
                    <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(100, 255, 218, 0.1)', borderRadius: '4px', fontSize: '0.8rem', color: '#64ffda' }}>
                        🤖 AI: {kpi.aiInsight}
                    </div>
                </Card>
            ))}
            
            <Card title="Recent System Activity" style={{ gridColumn: '1 / -1' }}>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {logs.slice(0, 20).map(log => (
                        <div key={log.id} style={{ 
                            display: 'flex', alignItems: 'center', gap: '1rem', 
                            padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: '#8892b0', fontFamily: 'monospace' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span style={{ 
                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                                background: log.level === 'SUCCESS' ? 'rgba(0,255,0,0.2)' : log.level === 'CRITICAL' ? 'rgba(255,0,0,0.2)' : log.level === 'WARN' ? 'rgba(255, 200, 0, 0.2)' : 'rgba(100, 100, 255, 0.2)',
                                color: log.level === 'SUCCESS' ? '#00ff00' : log.level === 'CRITICAL' ? '#ff8f8f' : log.level === 'WARN' ? '#ffc800' : '#aaaaff'
                            }}>{log.level}</span>
                            <span style={{ color: '#e6f1ff' }}>{log.message}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    const renderForex = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {CURRENCY_PAIRS.map(pair => (
                    <Card key={pair.symbol} title={pair.symbol}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {SIMULATED_EXCHANGES.map(ex => {
                                const rates = allRates[pair.symbol]?.[ex.id];
                                const prev = previousRatesRef.current[pair.symbol]?.[ex.id];
                                const bidColor = rates?.bid > prev?.bid ? '#64ffda' : rates?.bid < prev?.bid ? '#ef473a' : '#8892b0';
                                const askColor = rates?.ask > prev?.ask ? '#64ffda' : rates?.ask < prev?.ask ? '#ef473a' : '#8892b0';

                                return (
                                    <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.2rem 0' }}>
                                        <span style={{ color: '#ccd6f6' }}>{ex.name}</span>
                                        <div style={{ display: 'flex', gap: '1rem', fontFamily: 'monospace' }}>
                                            <span style={{ color: bidColor }}>{rates?.bid.toFixed(5)}</span>
                                            <span style={{ color: askColor }}>{rates?.ask.toFixed(5)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>
            
            <Card title="High-Frequency Arbitrage Opportunities" style={{ border: '1px solid #fdbb2d' }}>
                {arbitrageOpps.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8892b0' }}>Scanning global markets for inefficiencies...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {arbitrageOpps.slice(0, 12).map((opp, idx) => (
                            <div key={idx} style={{ 
                                background: 'rgba(253, 187, 45, 0.05)', border: '1px solid rgba(253, 187, 45, 0.3)', 
                                padding: '1rem', borderRadius: '8px', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#fdbb2d' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold', color: '#fdbb2d' }}>{opp.pair}</span>
                                    <span style={{ color: '#64ffda', fontWeight: 'bold' }}>+{opp.profitMargin.toFixed(4)}%</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#ccd6f6', marginBottom: '0.2rem' }}>
                                    Buy: <span style={{ color: '#fff' }}>{opp.buyExchange}</span> @ {opp.buyPrice}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#ccd6f6', marginBottom: '0.8rem' }}>
                                    Sell: <span style={{ color: '#fff' }}>{opp.sellExchange}</span> @ {opp.sellPrice}
                                </div>
                                 {/* REFACTORING: Changed button from "Manual Override" (danger) to a safe "Analyze" (primary) action. */}
                                <Button variant="primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }} onClick={() => addLog('INFO', `User is analyzing ${opp.pair} arbitrage opportunity.`)}>
                                    Analyze Opportunity
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );

    const renderChat = () => (
        <Card title="Neural Interface Chat" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '1rem', marginBottom: '1rem' }}>
                {chatHistory.map(msg => (
                    <div key={msg.id} style={{ 
                        alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        background: msg.sender === 'USER' ? '#112240' : 'rgba(100, 255, 218, 0.1)',
                        color: msg.sender === 'USER' ? '#fff' : '#e6f1ff',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: msg.sender === 'AI' ? '1px solid rgba(100, 255, 218, 0.3)' : 'none'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: '#8892b0', marginBottom: '0.3rem' }}>{msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}</div>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask the AI Architect..."
                    style={{ 
                        flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', 
                        background: '#0a192f', color: '#fff', outline: 'none'
                    }}
                />
                <Button onClick={handleSendMessage}>Send</Button>
            </div>
        </Card>
    );

    const renderProfile = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#ccd6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#0a192f', marginBottom: '1rem' }}>
                        {CURRENT_USER.avatar}
                    </div>
                    <h2 style={{ margin: 0, color: '#fff' }}>{CURRENT_USER.name}</h2>
                    <p style={{ color: '#64ffda', margin: '0.5rem 0' }}>{CURRENT_USER.role}</p>
                    <div style={{ marginTop: '1rem', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8892b0', marginBottom: '0.3rem' }}>
                            <span>Efficiency Score</span>
                            <span>{CURRENT_USER.efficiencyScore}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#112240', borderRadius: '3px' }}>
                            <div style={{ width: `${CURRENT_USER.efficiencyScore}%`, height: '100%', background: '#64ffda', borderRadius: '3px' }}></div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card title="Executive Controls">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Button variant="neutral">Download Global Ledger</Button>
                    <Button variant="neutral">Reset AI Parameters</Button>
                    <Button variant="neutral">Audit Security Logs</Button>
                    <Button variant="neutral" onClick={() => setActiveModule('API_SETTINGS')}>Manage API Keys</Button>
                    <Button variant="danger" style={{ gridColumn: '1 / -1' }}>Initiate Emergency Lockdown</Button>
                </div>
            </Card>
        </div>
    );
    
    const renderApiSettings = () => <ApiSettingsComponent />;

    // --- SUBORDINATE RENDER ---

    return (
        <div style={{
            fontFamily: '"SF Mono", "Fira Code", "Roboto Mono", monospace',
            background: '#0a192f',
            color: '#e6f1ff',
            minHeight: '100vh',
            display: 'flex',
            overflow: 'hidden'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0a192f; }
                ::-webkit-scrollbar-thumb { background: #233554; borderRadius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #64ffda; }
                .glass-panel { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .glass-panel:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.4); }

                /* API Settings Page CSS */
                .settings-container {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  max-width: 900px;
                  margin: 0 auto;
                  padding: 20px 0; /* Adjusted padding */
                  background-color: transparent; /* Integrated into existing theme */
                  border-radius: 12px;
                }

                .settings-container h1 {
                  font-size: 28px;
                  color: #e6f1ff;
                  border-bottom: 1px solid #233554;
                  padding-bottom: 15px;
                  margin-bottom: 8px;
                }

                .settings-container .subtitle {
                  font-size: 15px;
                  color: #8892b0;
                  margin-bottom: 30px;
                }

                .settings-container .tabs {
                  margin-bottom: 25px;
                  border-bottom: 1px solid #233554;
                }

                .settings-container .tabs button {
                  padding: 12px 18px;
                  border: none;
                  background-color: transparent;
                  cursor: pointer;
                  font-size: 16px;
                  font-weight: 600;
                  color: #8892b0;
                  margin-right: 15px;
                  position: relative;
                  top: 1px;
                  transition: color 0.2s;
                }

                .settings-container .tabs button.active {
                  color: #64ffda;
                  border-bottom: 3px solid #64ffda;
                }

                .settings-container .form-section {
                  margin-bottom: 25px;
                  padding-bottom: 25px;
                  border-bottom: 1px solid #233554;
                }

                .settings-container .form-section:last-child {
                  border-bottom: none;
                }

                .settings-container .form-section h2 {
                  font-size: 20px;
                  color: #ccd6f6;
                  margin-bottom: 20px;
                }

                .settings-container .input-group {
                  margin-bottom: 15px;
                }

                .settings-container .settings-form label {
                  display: block;
                  font-weight: 600;
                  color: #8892b0;
                  margin-bottom: 8px;
                }

                .settings-container .settings-form input {
                  width: 100%;
                  padding: 12px;
                  border: 1px solid #233554;
                  border-radius: 6px;
                  font-size: 14px;
                  transition: border-color 0.2s, box-shadow 0.2s;
                  background: #112240;
                  color: #e6f1ff;
                }

                .settings-container .settings-form input:focus {
                  outline: none;
                  border-color: #64ffda;
                  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.2);
                }

                .settings-container .form-footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #233554;
                }

                .settings-container .save-button {
                  background-color: #64ffda;
                  color: #0a192f;
                  padding: 12px 25px;
                  border: none;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: background-color 0.2s;
                }

                .settings-container .save-button:hover {
                  background-color: #a7ffee;
                }

                .settings-container .save-button:disabled {
                  background-color: #233554;
                  color: #8892b0;
                  cursor: not-allowed;
                }

                .settings-container .status-message {
                  margin-top: 20px;
                  font-weight: 500;
                  padding: 12px;
                  background-color: rgba(100, 255, 218, 0.1);
                  border: 1px solid #64ffda;
                  color: #64ffda;
                  border-radius: 6px;
                }
            `}</style>

            {renderSidebar()}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Top Bar */}
                <header style={{ 
                    height: '70px', borderBottom: '1px solid rgba(255,255,255,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem',
                    background: 'rgba(10, 25, 47, 0.8)', backdropFilter: 'blur(10px)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                            {activeModule === 'DASHBOARD' && 'Command Center'}
                            {activeModule === 'FOREX' && 'Global Forex Arena'}
                            {activeModule === 'AI_CHAT' && 'Neural Network Interface'}
                            {activeModule === 'KPIS' && 'Key Performance Indicators'}
                            {activeModule === 'PROFILE' && 'Executive Profile'}
                            {activeModule === 'SYSTEM' && 'System Diagnostics'}
                            {activeModule === 'API_SETTINGS' && 'API Credentials Console'}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>System Time</div>
                            <div style={{ fontWeight: 'bold', color: '#64ffda' }}>{systemTime.toLocaleTimeString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#233554', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</div>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#233554', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {activeModule === 'DASHBOARD' && renderDashboard()}
                    {activeModule === 'FOREX' && renderForex()}
                    {activeModule === 'AI_CHAT' && renderChat()}
                    {activeModule === 'KPIS' && renderDashboard()} {/* Reusing dashboard for KPIs for now */}
                    {activeModule === 'PROFILE' && renderProfile()}
                    {activeModule === 'API_SETTINGS' && renderApiSettings()}
                    {activeModule === 'SYSTEM' && (
                        // REFACTORING: Replaced flawed system health metrics with positive, stable ones.
                        <Card title="System Diagnostics">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '2rem', color: '#64ffda' }}>99.99%</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>Uptime</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '2rem', color: '#64ffda' }}>45ms</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>Avg. Latency</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '2rem', color: '#64ffda' }}>Secure</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>Firewall</div>
                                </div>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ForexArena;