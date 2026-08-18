// src/pages/ApiSettingsPage.tsx

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// Removed CSS import: Replacing fragmented styling with standardized UI framework (e.g., Tailwind/MUI) for unified technology stack (Instruction #2).

// =================================================================================
// ARCHIVE NOTE: This component previously defined over 200 API credentials.
// Per MVP mandate (Unified Financial Dashboard & AI Transaction Intelligence)
// and security hardening (Instruction #3, #6), the list is drastically reduced
// to only critical dependencies. The full archived list is maintained at the
// bottom of this file in a comment block for future module planning.
// =================================================================================
interface ApiKeysState {
  // === MVP Core Infrastructure & AI ===
  OPENAI_API_KEY: string; // For AI Transaction Intelligence (Instruction #5)
  STRIPE_SECRET_KEY: string; // Core Payment processing

  // === Financial Data Aggregation ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;

  // === Banking as a Service (BaaS) - Treasury/Flows ===
  UNIT_API_TOKEN: string;
  INCREASE_API_KEY: string;
  MERCURY_API_KEY: string;

  // === Accounting Integration ===
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;

  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  // Initialize state with the required subset
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // Removed activeTab state as the credentials list is now focused on the MVP scope.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // REFACTOR NOTE (Instruction #3): The backend endpoint MUST securely store
      // these credentials using an industrial standard secret manager (AWS Secrets Manager or HashiCorp Vault).
      // The endpoint is normalized to v1 API standards.
      const response = await axios.post('/api/v1/settings/save-credentials', keys);
      setStatusMessage(response.data.message || 'Credentials saved successfully.');
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || `Server error: ${error.message}`
        : 'Error: Could not save keys.';
      setStatusMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Credentials should always be password type when entered by user
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
      />
    </div>
  );
  
  // Define sections for MVP rendering
  const sections: { title: string, keys: [keyof ApiKeysState, string][] }[] = [
    {
      title: 'Core Infrastructure & AI',
      keys: [
        ['OPENAI_API_KEY', 'OpenAI API Key (AI Transaction Intelligence)'],
        ['STRIPE_SECRET_KEY', 'Stripe Secret Key (Payment Processing)'],
      ]
    },
    {
      title: 'Financial Data Aggregation',
      keys: [
        ['PLAID_CLIENT_ID', 'Plaid Client ID'],
        ['PLAID_SECRET', 'Plaid Secret'],
        ['MX_CLIENT_ID', 'MX Client ID'],
        ['MX_API_KEY', 'MX API Key'],
      ]
    },
    {
      title: 'Banking as a Service (BaaS) - Treasury/Flows',
      keys: [
        ['UNIT_API_TOKEN', 'Unit API Token'],
        ['INCREASE_API_KEY', 'Increase API Key'],
        ['MERCURY_API_KEY', 'Mercury API Key'],
      ]
    },
    {
      title: 'Accounting Integration (Xero/QuickBooks)',
      keys: [
        ['XERO_CLIENT_ID', 'Xero Client ID'],
        ['XERO_CLIENT_SECRET', 'Xero Client Secret'],
        ['QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID'],
        ['QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret'],
      ]
    },
  ];


  return (
    <div className="settings-container">
      <h1>MVP Credential Configuration Console</h1>
      <p className="subtitle">
        Configure essential credentials for the Financial Dashboard MVP (Aggregation, Payments, Treasury, AI). 
        All keys are securely managed by the backend (via Secrets Manager/Vault).
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {sections.map(section => (
          <div key={section.title} className="form-section">
            <h2>{section.title}</h2>
            {section.keys.map(([keyName, label]) => renderInput(keyName, label))}
          </div>
        ))}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving securely...' : 'Save All MVP Credentials'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ApiSettingsPage;


// =================================================================================
// ARCHIVED API KEYS (Removed per MVP Scope & Security Hardening - Instruction #6)
// These credentials belong to modules archived in /future-modules and must be 
// re-integrated using the standardized API Connector Framework (Instruction #4).
// =================================================================================
/*
interface ArchivedApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud
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

  // AI & Machine Learning (Non-MVP specific)
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

  // Identity & Verification (Tech)
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

  // === Banking & Finance APIs (Non-MVP focused) ===
  // Data Aggregators
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
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
  TREASURY_PRIME_API_KEY: string;
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
  FRESHBOOKS_API_KEY: string;

  // Fintech Utilities
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
}
*/