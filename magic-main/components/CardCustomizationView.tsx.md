import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// Removed local CSS import as styling will be handled by a unified approach (e.g., Tailwind CSS or MUI).
// import './ApiSettingsPage.css';

// =================================================================================
// The complete interface for all 200+ API credentials
// NOTE: This is a consolidated list for demonstration. In a production system,
// this would be managed more granularly, potentially using environment variables
// or a secure configuration management system for each service.
// All sensitive keys should ideally be stored in a secure vault (e.g., AWS Secrets Manager, HashiCorp Vault)
// and accessed via backend services, not directly in frontend components.
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
  // These keys are sensitive and should NOT be managed via a frontend form directly.
  // They should be injected via CI/CD or a secure configuration management system.
  // DOCKER_HUB_USERNAME: string;
  // DOCKER_HUB_ACCESS_TOKEN: string;
  // HEROKU_API_KEY: string;
  // NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  // VERCEL_API_TOKEN: string;
  // CLOUDFLARE_API_TOKEN: string;
  // DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  // LINODE_PERSONAL_ACCESS_TOKEN: string;
  // TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity
  // GITHUB_PERSONAL_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // SLACK_BOT_TOKEN: string; // Sensitive, manage via backend
  // DISCORD_BOT_TOKEN: string; // Sensitive, manage via backend
  // TRELLO_API_KEY: string;
  // TRELLO_API_TOKEN: string;
  // JIRA_USERNAME: string; // Usernames are less sensitive but API tokens are
  // JIRA_API_TOKEN: string; // Sensitive, manage via backend
  // ASANA_PERSONAL_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // NOTION_API_KEY: string; // Sensitive, manage via backend
  // AIRTABLE_API_KEY: string; // Sensitive, manage via backend

  // File & Data Storage
  // DROPBOX_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // BOX_DEVELOPER_TOKEN: string; // Sensitive, manage via backend
  // GOOGLE_DRIVE_API_KEY: string; // Consider scopes and security if exposing
  // ONEDRIVE_CLIENT_ID: string; // Client IDs are generally public

  // CRM & Business
  // SALESFORCE_CLIENT_ID: string; // Client IDs are generally public
  // SALESFORCE_CLIENT_SECRET: string; // Sensitive, manage via backend
  // HUBSPOT_API_KEY: string; // Sensitive, manage via backend
  // ZENDESK_API_TOKEN: string; // Sensitive, manage via backend
  // INTERCOM_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // MAILCHIMP_API_KEY: string; // Sensitive, manage via backend

  // E-commerce
  // SHOPIFY_API_KEY: string; // API Keys are often public, secrets are not
  // SHOPIFY_API_SECRET: string; // Sensitive, manage via backend
  // BIGCOMMERCE_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // MAGENTO_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // WOOCOMMERCE_CLIENT_KEY: string; // Key might be public, secret is not
  // WOOCOMMERCE_CLIENT_SECRET: string; // Sensitive, manage via backend
  
  // Authentication & Identity
  // STYTCH_PROJECT_ID: string; // Project IDs are often public
  // STYTCH_SECRET: string; // Sensitive, manage via backend
  // AUTH0_DOMAIN: string; // Domains are public
  // AUTH0_CLIENT_ID: string; // Client IDs are public
  // AUTH0_CLIENT_SECRET: string; // Sensitive, manage via backend
  // OKTA_DOMAIN: string; // Domains are public
  // OKTA_API_TOKEN: string; // Sensitive, manage via backend

  // Backend & Databases
  // FIREBASE_API_KEY: string; // Often public for client-side SDKs
  // SUPABASE_URL: string; // Public URL
  // SUPABASE_ANON_KEY: string; // Public key for client-side access

  // API Development
  // POSTMAN_API_KEY: string; // Sensitive, manage via backend
  // APOLLO_GRAPH_API_KEY: string; // Sensitive, manage via backend

  // AI & Machine Learning
  // OPENAI_API_KEY: string; // Sensitive, manage via backend
  // HUGGING_FACE_API_TOKEN: string; // Sensitive, manage via backend
  // GOOGLE_CLOUD_AI_API_KEY: string; // Consider scopes and security
  // AMAZON_REKOGNITION_ACCESS_KEY: string; // Sensitive, manage via backend
  // MICROSOFT_AZURE_COGNITIVE_KEY: string; // Sensitive, manage via backend
  // IBM_WATSON_API_KEY: string; // Sensitive, manage via backend

  // Search & Real-time
  // ALGOLIA_APP_ID: string; // App IDs are often public
  // ALGOLIA_ADMIN_API_KEY: string; // Sensitive, manage via backend
  // PUSHER_APP_ID: string; // App IDs are often public
  // PUSHER_KEY: string; // Public key
  // PUSHER_SECRET: string; // Sensitive, manage via backend
  // ABLY_API_KEY: string; // Sensitive, manage via backend
  // ELASTICSEARCH_API_KEY: string; // Sensitive, manage via backend
  
  // Identity & Verification
  // STRIPE_IDENTITY_SECRET_KEY: string; // Sensitive, manage via backend
  // ONFIDO_API_TOKEN: string; // Sensitive, manage via backend
  // CHECKR_API_KEY: string; // Sensitive, manage via backend
  
  // Logistics & Shipping
  // LOB_API_KEY: string; // Sensitive, manage via backend
  // EASYPOST_API_KEY: string; // Sensitive, manage via backend
  // SHIPPO_API_TOKEN: string; // Sensitive, manage via backend

  // Maps & Weather
  // GOOGLE_MAPS_API_KEY: string; // Consider enabling specific APIs and restricting usage
  // MAPBOX_ACCESS_TOKEN: string; // Consider enabling specific APIs and restricting usage
  // HERE_API_KEY: string; // Consider enabling specific APIs and restricting usage
  // ACCUWEATHER_API_KEY: string; // Sensitive, manage via backend
  // OPENWEATHERMAP_API_KEY: string; // Sensitive, manage via backend

  // Social & Media
  // YELP_API_KEY: string; // Sensitive, manage via backend
  // FOURSQUARE_API_KEY: string; // Sensitive, manage via backend
  // REDDIT_CLIENT_ID: string; // Public
  // REDDIT_CLIENT_SECRET: string; // Sensitive, manage via backend
  // TWITTER_BEARER_TOKEN: string; // Sensitive, manage via backend
  // FACEBOOK_APP_ID: string; // Public
  // FACEBOOK_APP_SECRET: string; // Sensitive, manage via backend
  // INSTAGRAM_APP_ID: string; // Public
  // INSTAGRAM_APP_SECRET: string; // Sensitive, manage via backend
  // YOUTUBE_DATA_API_KEY: string; // Consider enabling specific APIs and restricting usage
  // SPOTIFY_CLIENT_ID: string; // Public
  // SPOTIFY_CLIENT_SECRET: string; // Sensitive, manage via backend
  // SOUNDCLOUD_CLIENT_ID: string; // Public
  // TWITCH_CLIENT_ID: string; // Public
  // TWITCH_CLIENT_SECRET: string; // Sensitive, manage via backend

  // Media & Content
  // MUX_TOKEN_ID: string; // Sensitive, manage via backend
  // MUX_TOKEN_SECRET: string; // Sensitive, manage via backend
  // CLOUDINARY_API_KEY: string; // Public
  // CLOUDINARY_API_SECRET: string; // Sensitive, manage via backend
  // IMGIX_API_KEY: string; // Sensitive, manage via backend
  
  // Legal & Admin
  // STRIPE_ATLAS_API_KEY: string; // Sensitive, manage via backend
  // CLERKY_API_KEY: string; // Sensitive, manage via backend
  // DOCUSIGN_INTEGRATOR_KEY: string; // Sensitive, manage via backend
  // HELLOSIGN_API_KEY: string; // Sensitive, manage via backend
  
  // Monitoring & CI/CD
  // LAUNCHDARKLY_SDK_KEY: string; // Sensitive, manage via backend
  // SENTRY_AUTH_TOKEN: string; // Sensitive, manage via backend
  // DATADOG_API_KEY: string; // Sensitive, manage via backend
  // NEW_RELIC_API_KEY: string; // Sensitive, manage via backend
  // CIRCLECI_API_TOKEN: string; // Sensitive, manage via backend
  // TRAVIS_CI_API_TOKEN: string; // Sensitive, manage via backend
  // BITBUCKET_USERNAME: string; // Less sensitive, but token is
  // BITBUCKET_APP_PASSWORD: string; // Sensitive, manage via backend
  // GITLAB_PERSONAL_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // PAGERDUTY_API_KEY: string; // Sensitive, manage via backend
  
  // Headless CMS
  // CONTENTFUL_SPACE_ID: string; // Public
  // CONTENTFUL_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // SANITY_PROJECT_ID: string; // Public
  // SANITY_API_TOKEN: string; // Sensitive, manage via backend
  // STRAPI_API_TOKEN: string; // Sensitive, manage via backend

  // === Banking & Finance APIs ===
  // Data Aggregators
  // PLAID_CLIENT_ID: string; // Public
  // PLAID_SECRET: string; // Sensitive, manage via backend
  // YODLEE_CLIENT_ID: string; // Public
  // YODLEE_SECRET: string; // Sensitive, manage via backend
  // MX_CLIENT_ID: string; // Public
  // MX_API_KEY: string; // Sensitive, manage via backend
  // FINICITY_PARTNER_ID: string; // Public
  // FINICITY_APP_KEY: string; // Sensitive, manage via backend

  // Payment Processing
  // ADYEN_API_KEY: string; // Sensitive, manage via backend
  // ADYEN_MERCHANT_ACCOUNT: string; // Sensitive, manage via backend
  // BRAINTREE_MERCHANT_ID: string; // Public
  // BRAINTREE_PUBLIC_KEY: string; // Public
  // BRAINTREE_PRIVATE_KEY: string; // Sensitive, manage via backend
  // SQUARE_APPLICATION_ID: string; // Public
  // SQUARE_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // PAYPAL_CLIENT_ID: string; // Public
  // PAYPAL_SECRET: string; // Sensitive, manage via backend
  // DWOLLA_KEY: string; // Public key
  // DWOLLA_SECRET: string; // Sensitive, manage via backend
  // WORLDPAY_API_KEY: string; // Sensitive, manage via backend
  // CHECKOUT_SECRET_KEY: string; // Sensitive, manage via backend
  
  // Banking as a Service (BaaS) & Card Issuing
  // MARQETA_APPLICATION_TOKEN: string; // Sensitive, manage via backend
  // MARQETA_ADMIN_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // GALILEO_API_LOGIN: string; // Sensitive, manage via backend
  // GALILEO_API_TRANS_KEY: string; // Sensitive, manage via backend
  // SOLARISBANK_CLIENT_ID: string; // Public
  // SOLARISBANK_CLIENT_SECRET: string; // Sensitive, manage via backend
  // SYNAPSE_CLIENT_ID: string; // Public
  // SYNAPSE_CLIENT_SECRET: string; // Sensitive, manage via backend
  // RAILSBANK_API_KEY: string; // Sensitive, manage via backend
  // CLEARBANK_API_KEY: string; // Sensitive, manage via backend
  // UNIT_API_TOKEN: string; // Sensitive, manage via backend
  // TREASURY_PRIME_API_KEY: string; // Sensitive, manage via backend
  // INCREASE_API_KEY: string; // Sensitive, manage via backend
  // MERCURY_API_KEY: string; // Sensitive, manage via backend
  // BREX_API_KEY: string; // Sensitive, manage via backend
  // BOND_API_KEY: string; // Sensitive, manage via backend
  
  // International Payments
  // CURRENCYCLOUD_LOGIN_ID: string; // Sensitive, manage via backend
  // CURRENCYCLOUD_API_KEY: string; // Sensitive, manage via backend
  // OFX_API_KEY: string; // Sensitive, manage via backend
  // WISE_API_TOKEN: string; // Sensitive, manage via backend
  // REMITLY_API_KEY: string; // Sensitive, manage via backend
  // AZIMO_API_KEY: string; // Sensitive, manage via backend
  // NIUM_API_KEY: string; // Sensitive, manage via backend
  
  // Investment & Market Data
  // ALPACA_API_KEY_ID: string; // Public
  // ALPACA_SECRET_KEY: string; // Sensitive, manage via backend
  // TRADIER_ACCESS_TOKEN: string; // Sensitive, manage via backend
  // IEX_CLOUD_API_TOKEN: string; // Sensitive, manage via backend
  // POLYGON_API_KEY: string; // Sensitive, manage via backend
  // FINNHUB_API_KEY: string; // Sensitive, manage via backend
  // ALPHA_VANTAGE_API_KEY: string; // Sensitive, manage via backend
  // MORNINGSTAR_API_KEY: string; // Sensitive, manage via backend
  // XIGNITE_API_TOKEN: string; // Sensitive, manage via backend
  // DRIVEWEALTH_API_KEY: string; // Sensitive, manage via backend

  // Crypto
  // HUOBI_API_KEY: string;
  // HUOBI_SECRET: string;
  // COINBASE_API_KEY: string; // Sensitive, manage via backend
  // COINBASE_API_SECRET: string; // Sensitive, manage via backend
  // BINANCE_API_KEY: string; // Sensitive, manage via backend
  // BINANCE_API_SECRET: string; // Sensitive, manage via backend
  // KRAKEN_API_KEY: string; // Sensitive, manage via backend
  // KRAKEN_PRIVATE_KEY: string; // Sensitive, manage via backend
  // GEMINI_API_KEY: string; // Sensitive, manage via backend
  // GEMINI_API_SECRET: string; // Sensitive, manage via backend
  // COINMARKETCAP_API_KEY: string; // Sensitive, manage via backend
  // COINGECKO_API_KEY: string; // Sensitive, manage via backend
  // BLOCKIO_API_KEY: string; // Sensitive, manage via backend

  // Major Banks (Open Banking)
  // JP_MORGAN_CHASE_CLIENT_ID: string; // Public
  // CITI_CLIENT_ID: string; // Public
  // WELLS_FARGO_CLIENT_ID: string; // Public
  // CAPITAL_ONE_CLIENT_ID: string; // Public

  // European & Global Banks (Open Banking)
  // HSBC_CLIENT_ID: string; // Public
  // BARCLAYS_CLIENT_ID: string; // Public
  // BBVA_CLIENT_ID: string; // Public
  // DEUTSCHE_BANK_API_KEY: string; // Sensitive, manage via backend

  // UK & European Aggregators
  // TINK_CLIENT_ID: string; // Public
  // TRUELAYER_CLIENT_ID: string; // Public

  // Compliance & Identity (KYC/AML)
  // MIDDESK_API_KEY: string; // Sensitive, manage via backend
  // ALLOY_API_TOKEN: string; // Sensitive, manage via backend
  // ALLOY_API_SECRET: string; // Sensitive, manage via backend
  // COMPLYADVANTAGE_API_KEY: string; // Sensitive, manage via backend

  // Real Estate
  // ZILLOW_API_KEY: string; // Sensitive, manage via backend
  // CORELOGIC_CLIENT_ID: string; // Public

  // Credit Bureaus
  // EXPERIAN_API_KEY: string; // Sensitive, manage via backend
  // EQUIFAX_API_KEY: string; // Sensitive, manage via backend
  // TRANSUNION_API_KEY: string; // Sensitive, manage via backend

  // Global Payments (Emerging Markets)
  // FINCRA_API_KEY: string; // Sensitive, manage via backend
  // FLUTTERWAVE_SECRET_KEY: string; // Sensitive, manage via backend
  // PAYSTACK_SECRET_KEY: string; // Sensitive, manage via backend
  // DLOCAL_API_KEY: string; // Sensitive, manage via backend
  // RAPYD_ACCESS_KEY: string; // Sensitive, manage via backend
  
  // Accounting & Tax
  // TAXJAR_API_KEY: string; // Sensitive, manage via backend
  // AVALARA_API_KEY: string; // Sensitive, manage via backend
  // CODAT_API_KEY: string; // Sensitive, manage via backend
  // XERO_CLIENT_ID: string; // Public
  // XERO_CLIENT_SECRET: string; // Sensitive, manage via backend
  // QUICKBOOKS_CLIENT_ID: string; // Public
  // QUICKBOOKS_CLIENT_SECRET: string; // Sensitive, manage via backend
  // FRESHBOOKS_API_KEY: string; // Sensitive, manage via backend
  
  // Fintech Utilities
  // ANVIL_API_KEY: string; // Sensitive, manage via backend
  // MOOV_CLIENT_ID: string; // Public
  // MOOV_SECRET: string; // Sensitive, manage via backend
  // VGS_USERNAME: string; // Less sensitive, but password is
  // VGS_PASSWORD: string; // Sensitive, manage via backend
  // SILA_APP_HANDLE: string; // Public
  // SILA_PRIVATE_KEY: string; // Sensitive, manage via backend
  
  [key: string]: string; // Index signature for dynamic access
}


// This component is being refactored to reflect best practices.
// Managing API keys directly in a frontend form is a significant security risk.
// Production systems should rely on a secure backend mechanism for storing and accessing credentials.
// This component will be repurposed to display status or trigger backend operations
// related to API integrations, rather than directly inputting sensitive keys.
// For demonstration purposes, the form structure is retained but commented out to highlight the issue.

const ApiSettingsPage: React.FC = () => {
  // State for API keys is removed as direct frontend management is insecure.
  // const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('API credentials should be managed securely on the backend. This interface is for status and triggering backend operations.');
  const [isSaving, setIsSaving] = useState<boolean>(false); // Placeholder for potential backend operations
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  // Input handling logic is removed as there are no direct key inputs.
  // const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => { ... };
  // const handleSubmit = async (e: FormEvent) => { ... };

  // Rendering of input fields is removed.
  // const renderInput = (keyName: keyof ApiKeysState, label: string, isMultiLine: boolean = false) => { ... };

  // Placeholder function to simulate a backend operation.
  const handleFetchApiStatus = async () => {
    setIsSaving(true);
    setStatusMessage('Fetching API integration status from backend...');
    try {
      // In a real application, this would fetch status from your backend API.
      // const response = await axios.get('http://localhost:4000/api/integration-status');
      // setStatusMessage(response.data.message);
      setTimeout(() => {
        setStatusMessage('API integration status check complete. All systems nominal (simulated).');
        setIsSaving(false);
      }, 2000);
    } catch (error) {
      setStatusMessage('Error: Could not fetch API integration status. Please check backend server.');
      setIsSaving(false);
    }
  };

  // Placeholder function to simulate a backend operation.
  const handleSyncApiConfig = async () => {
    setIsSaving(true);
    setStatusMessage('Syncing API configurations with backend...');
    try {
      // In a real application, this would trigger a sync operation on your backend.
      // const response = await axios.post('http://localhost:4000/api/sync-apis');
      // setStatusMessage(response.data.message);
      setTimeout(() => {
        setStatusMessage('API configurations synced successfully (simulated).');
        setIsSaving(false);
      }, 2000);
    } catch (error) {
      setStatusMessage('Error: Could not sync API configurations. Please check backend server.');
      setIsSaving(false);
    }
  };


  return (
    <div className="settings-container" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>API Integrations Console</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        This interface provides an overview of configured API integrations.
        Sensitive credentials are managed securely on the backend via environment variables and secrets management systems (e.g., AWS Secrets Manager, HashiCorp Vault).
        Direct input of keys here is deprecated for security reasons.
      </p>

      <div className="tabs" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('tech')}
          className={activeTab === 'tech' ? 'active' : ''}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #ccc',
            backgroundColor: activeTab === 'tech' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'tech' ? 'white' : '#333',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s'
          }}
        >
          Technical Services
        </button>
        <button
          onClick={() => setActiveTab('banking')}
          className={activeTab === 'banking' ? 'active' : ''}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #ccc',
            backgroundColor: activeTab === 'banking' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'banking' ? 'white' : '#333',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s'
          }}
        >
          Banking & Finance
        </button>
      </div>

      <div className="settings-form" style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        
        {activeTab === 'tech' ? (
          <div className="form-section">
            <h2>Technical Services Overview</h2>
            <p>This section lists common technical service integrations. Their active status and configuration are managed on the backend.</p>
            {/* Example of a status display section */}
            <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              <p><strong>Stripe Integration:</strong> Active (Simulated)</p>
              <p><strong>Twilio Integration:</strong> Active (Simulated)</p>
              <p><strong>AWS Integration:</strong> Active (Simulated)</p>
              {/* Add more statuses as needed */}
            </div>
          </div>
        ) : (
          <div className="form-section">
            <h2>Banking & Finance Services Overview</h2>
            <p>This section lists common banking and finance integration categories. Their active status and configuration are managed on the backend.</p>
            {/* Example of a status display section */}
            <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              <p><strong>Plaid Integration:</strong> Active (Simulated)</p>
              <p><strong>Adyen Integration:</strong> Active (Simulated)</p>
              <p><strong>Marqeta Integration:</strong> Active (Simulated)</p>
              {/* Add more statuses as needed */}
            </div>
          </div>
        )}
        
        <div className="form-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button onClick={handleFetchApiStatus} className="save-button" disabled={isSaving} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.25rem', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', marginRight: '1rem', transition: 'background-color 0.2s' }}>
            {isSaving ? 'Checking...' : 'Check API Status'}
          </button>
          <button onClick={handleSyncApiConfig} className="save-button" disabled={isSaving} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.25rem', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', transition: 'background-color 0.2s' }}>
            {isSaving ? 'Syncing...' : 'Sync API Config'}
          </button>
          {statusMessage && <p className="status-message" style={{ marginTop: '1rem', color: isSaving ? '#007bff' : '#28a745' }}>{statusMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsPage;