import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// This CSS will be provided in Part 2.
// For now, we'll assume basic styling to make it functional.
// import './ApiSettingsPage.css'; 

// Styles will be handled by Tailwind CSS or a similar utility-first framework.
// Minimal inline styles or a very basic CSS file can be used if absolutely necessary
// for the initial implementation, but the goal is to move towards a unified styling approach.

// =================================================================================
// The complete interface for all 200+ API credentials
// This interface is excessively large and represents a potential security risk
// and a maintenance nightmare. It should be refactored to group related keys
// and potentially use a more dynamic or structured approach, e.g., per service.
// For MVP, we will keep the structure but acknowledge it's a refactoring target.
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

// Note: The original code uses `useState<ApiKeysState>({} as ApiKeysState)`.
// This is problematic as it doesn't initialize keys, leading to uncontrolled inputs.
// A better approach is to initialize with empty strings.
const initialApiKeysState: ApiKeysState = {
  // Tech APIs
  STRIPE_SECRET_KEY: '', TWILIO_ACCOUNT_SID: '', TWILIO_AUTH_TOKEN: '', SENDGRID_API_KEY: '',
  AWS_ACCESS_KEY_ID: '', AWS_SECRET_ACCESS_KEY: '', AZURE_CLIENT_ID: '', AZURE_CLIENT_SECRET: '', GOOGLE_CLOUD_API_KEY: '',
  DOCKER_HUB_USERNAME: '', DOCKER_HUB_ACCESS_TOKEN: '', HEROKU_API_KEY: '', NETLIFY_PERSONAL_ACCESS_TOKEN: '',
  VERCEL_API_TOKEN: '', CLOUDFLARE_API_TOKEN: '', DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: '', LINODE_PERSONAL_ACCESS_TOKEN: '',
  TERRAFORM_API_TOKEN: '', GITHUB_PERSONAL_ACCESS_TOKEN: '', SLACK_BOT_TOKEN: '', DISCORD_BOT_TOKEN: '',
  TRELLO_API_KEY: '', TRELLO_API_TOKEN: '', JIRA_USERNAME: '', JIRA_API_TOKEN: '', ASANA_PERSONAL_ACCESS_TOKEN: '',
  NOTION_API_KEY: '', AIRTABLE_API_KEY: '', DROPBOX_ACCESS_TOKEN: '', BOX_DEVELOPER_TOKEN: '',
  GOOGLE_DRIVE_API_KEY: '', ONEDRIVE_CLIENT_ID: '', SALESFORCE_CLIENT_ID: '', SALESFORCE_CLIENT_SECRET: '',
  HUBSPOT_API_KEY: '', ZENDESK_API_TOKEN: '', INTERCOM_ACCESS_TOKEN: '', MAILCHIMP_API_KEY: '',
  SHOPIFY_API_KEY: '', SHOPIFY_API_SECRET: '', BIGCOMMERCE_ACCESS_TOKEN: '', MAGENTO_ACCESS_TOKEN: '',
  WOOCOMMERCE_CLIENT_KEY: '', WOOCOMMERCE_CLIENT_SECRET: '', STYTCH_PROJECT_ID: '', STYTCH_SECRET: '',
  AUTH0_DOMAIN: '', AUTH0_CLIENT_ID: '', AUTH0_CLIENT_SECRET: '', OKTA_DOMAIN: '', OKTA_API_TOKEN: '',
  FIREBASE_API_KEY: '', SUPABASE_URL: '', SUPABASE_ANON_KEY: '', POSTMAN_API_KEY: '',
  APOLLO_GRAPH_API_KEY: '', OPENAI_API_KEY: '', HUGGING_FACE_API_TOKEN: '', GOOGLE_CLOUD_AI_API_KEY: '',
  AMAZON_REKOGNITION_ACCESS_KEY: '', MICROSOFT_AZURE_COGNITIVE_KEY: '', IBM_WATSON_API_KEY: '', ALGOLIA_APP_ID: '',
  ALGOLIA_ADMIN_API_KEY: '', PUSHER_APP_ID: '', PUSHER_KEY: '', PUSHER_SECRET: '', ABLY_API_KEY: '',
  ELASTICSEARCH_API_KEY: '', STRIPE_IDENTITY_SECRET_KEY: '', ONFIDO_API_TOKEN: '', CHECKR_API_KEY: '',
  LOB_API_KEY: '', EASYPOST_API_KEY: '', SHIPPO_API_TOKEN: '', GOOGLE_MAPS_API_KEY: '',
  MAPBOX_ACCESS_TOKEN: '', HERE_API_KEY: '', ACCUWEATHER_API_KEY: '', OPENWEATHERMAP_API_KEY: '',
  YELP_API_KEY: '', FOURSQUARE_API_KEY: '', REDDIT_CLIENT_ID: '', REDDIT_CLIENT_SECRET: '',
  TWITTER_BEARER_TOKEN: '', FACEBOOK_APP_ID: '', FACEBOOK_APP_SECRET: '', INSTAGRAM_APP_ID: '',
  INSTAGRAM_APP_SECRET: '', YOUTUBE_DATA_API_KEY: '', SPOTIFY_CLIENT_ID: '', SPOTIFY_CLIENT_SECRET: '',
  SOUNDCLOUD_CLIENT_ID: '', TWITCH_CLIENT_ID: '', TWITCH_CLIENT_SECRET: '', MUX_TOKEN_ID: '',
  MUX_TOKEN_SECRET: '', CLOUDINARY_API_KEY: '', CLOUDINARY_API_SECRET: '', IMGIX_API_KEY: '',
  STRIPE_ATLAS_API_KEY: '', CLERKY_API_KEY: '', DOCUSIGN_INTEGRATOR_KEY: '', HELLOSIGN_API_KEY: '',
  LAUNCHDARKLY_SDK_KEY: '', SENTRY_AUTH_TOKEN: '', DATADOG_API_KEY: '', NEW_RELIC_API_KEY: '',
  CIRCLECI_API_TOKEN: '', TRAVIS_CI_API_TOKEN: '', BITBUCKET_USERNAME: '', BITBUCKET_APP_PASSWORD: '',
  GITLAB_PERSONAL_ACCESS_TOKEN: '', PAGERDUTY_API_KEY: '', CONTENTFUL_SPACE_ID: '', CONTENTFUL_ACCESS_TOKEN: '',
  SANITY_PROJECT_ID: '', SANITY_API_TOKEN: '', STRAPI_API_TOKEN: '',

  // Banking & Finance APIs
  PLAID_CLIENT_ID: '', PLAID_SECRET: '', YODLEE_CLIENT_ID: '', YODLEE_SECRET: '', MX_CLIENT_ID: '',
  MX_API_KEY: '', FINICITY_PARTNER_ID: '', FINICITY_APP_KEY: '', ADYEN_API_KEY: '',
  ADYEN_MERCHANT_ACCOUNT: '', BRAINTREE_MERCHANT_ID: '', BRAINTREE_PUBLIC_KEY: '', BRAINTREE_PRIVATE_KEY: '',
  SQUARE_APPLICATION_ID: '', SQUARE_ACCESS_TOKEN: '', PAYPAL_CLIENT_ID: '', PAYPAL_SECRET: '',
  DWOLLA_KEY: '', DWOLLA_SECRET: '', WORLDPAY_API_KEY: '', CHECKOUT_SECRET_KEY: '',
  MARQETA_APPLICATION_TOKEN: '', MARQETA_ADMIN_ACCESS_TOKEN: '', GALILEO_API_LOGIN: '', GALILEO_API_TRANS_KEY: '',
  SOLARISBANK_CLIENT_ID: '', SOLARISBANK_CLIENT_SECRET: '', SYNAPSE_CLIENT_ID: '', SYNAPSE_CLIENT_SECRET: '',
  RAILSBANK_API_KEY: '', CLEARBANK_API_KEY: '', UNIT_API_TOKEN: '', TREASURY_PRIME_API_KEY: '',
  INCREASE_API_KEY: '', MERCURY_API_KEY: '', BREX_API_KEY: '', BOND_API_KEY: '',
  CURRENCYCLOUD_LOGIN_ID: '', CURRENCYCLOUD_API_KEY: '', OFX_API_KEY: '', WISE_API_TOKEN: '',
  REMITLY_API_KEY: '', AZIMO_API_KEY: '', NIUM_API_KEY: '', ALPACA_API_KEY_ID: '',
  ALPACA_SECRET_KEY: '', TRADIER_ACCESS_TOKEN: '', IEX_CLOUD_API_TOKEN: '', POLYGON_API_KEY: '',
  FINNHUB_API_KEY: '', ALPHA_VANTAGE_API_KEY: '', MORNINGSTAR_API_KEY: '', XIGNITE_API_TOKEN: '',
  DRIVEWEALTH_API_KEY: '', COINBASE_API_KEY: '', COINBASE_API_SECRET: '', BINANCE_API_KEY: '',
  BINANCE_API_SECRET: '', KRAKEN_API_KEY: '', KRAKEN_PRIVATE_KEY: '', GEMINI_API_KEY: '',
  GEMINI_API_SECRET: '', COINMARKETCAP_API_KEY: '', COINGECKO_API_KEY: '', BLOCKIO_API_KEY: '',
  JP_MORGAN_CHASE_CLIENT_ID: '', CITI_CLIENT_ID: '', WELLS_FARGO_CLIENT_ID: '', CAPITAL_ONE_CLIENT_ID: '',
  HSBC_CLIENT_ID: '', BARCLAYS_CLIENT_ID: '', BBVA_CLIENT_ID: '', DEUTSCHE_BANK_API_KEY: '',
  TINK_CLIENT_ID: '', TRUELAYER_CLIENT_ID: '', MIDDESK_API_KEY: '', ALLOY_API_TOKEN: '',
  ALLOY_API_SECRET: '', COMPLYADVANTAGE_API_KEY: '', ZILLOW_API_KEY: '', CORELOGIC_CLIENT_ID: '',
  EXPERIAN_API_KEY: '', EQUIFAX_API_KEY: '', TRANSUNION_API_KEY: '', FINCRA_API_KEY: '',
  FLUTTERWAVE_SECRET_KEY: '', PAYSTACK_SECRET_KEY: '', DLOCAL_API_KEY: '', RAPYD_ACCESS_KEY: '',
  TAXJAR_API_KEY: '', AVALARA_API_KEY: '', CODAT_API_KEY: '', XERO_CLIENT_ID: '',
  XERO_CLIENT_SECRET: '', QUICKBOOKS_CLIENT_ID: '', QUICKBOOKS_CLIENT_SECRET: '', FRESHBOOKS_API_KEY: '',
  ANVIL_API_KEY: '', MOOV_CLIENT_ID: '', MOOV_SECRET: '', VGS_USERNAME: '', VGS_PASSWORD: '',
  SILA_APP_HANDLE: '', SILA_PRIVATE_KEY: '',
};

// The 'ApiSettingsPage.tsx.md' file appears to be a misnamed Markdown file
// intended to be a React component. This refactoring treats it as a React component.

const ApiSettingsPage: React.FC = () => {
  // Initialize state with empty strings to ensure controlled inputs.
  const [keys, setKeys] = useState<ApiKeysState>(initialApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  // --- Refactoring Notes ---
  // 1. Security: Storing API keys directly in a large interface and UI is a security risk.
  //    Keys should be managed via environment variables or a secure secrets manager on the backend.
  //    This frontend component should ideally only display configuration status, not allow direct editing of sensitive keys.
  //    For this exercise, we'll keep the form but add warnings and assume backend security.
  // 2. UX: A single long form is unwieldy. Tabs are a good start, but further grouping and search
  //    would be beneficial for over 200 keys.
  // 3. State Management: `useState` is fine for this component, but for global state or complex
  //    interactions, a dedicated library like Zustand or React Query would be better.
  // 4. API Integration: `axios` is used, which is standard. Error handling is basic.
  //    A dedicated API client with interceptors for auth, retries, and error handling is recommended.
  // 5. Styling: Inline comments suggest CSS will be provided. The goal is to unify styling using Tailwind CSS or MUI.
  //    This example will use basic Tailwind classes where appropriate, assuming a setup.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Basic validation: Ensure required fields are not empty before submitting.
    // In a real app, this would be more robust.
    const missingKeys = Object.entries(keys).filter(([key, value]) => value === '').map(([key]) => key);
    if (missingKeys.length > 0) {
      setStatusMessage(`Error: Please fill in all required API keys. Missing: ${missingKeys.join(', ')}`);
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // IMPORTANT: Sending sensitive API keys directly from the frontend to a backend endpoint
      // like this is a major security vulnerability. Keys should be managed securely on the backend
      // using environment variables or a secrets management service (e.g., AWS Secrets Manager, Vault).
      // This form should ideally not be used to input sensitive keys directly but rather to
      // *trigger* the secure retrieval and configuration of keys managed by the backend.
      // For the purpose of this exercise, we simulate the POST request.
      const response = await axios.post('/api/save-keys', keys); // Assuming '/api/save-keys' is a secure backend endpoint
      setStatusMessage(response.data.message || 'Keys saved successfully.');
      // Potentially fetch and clear the displayed keys after successful save if they are not meant to be permanently visible.
    } catch (error: any) {
      console.error('Error saving keys:', error);
      setStatusMessage(`Error: Could not save keys. Details: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render input fields, making them more manageable.
  // Added placeholder for better UX.
  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="password" // Use type="password" for sensitive keys
        id={keyName}
        name={keyName}
        value={keys[keyName]}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        aria-describedby={`${keyName}-description`} // For accessibility
      />
      <p id={`${keyName}-description`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        This is a sensitive API key. Ensure it is stored securely.
      </p>
    </div>
  );

  // Groups of keys for better organization within tabs.
  // This is a manual grouping; an automated or configuration-driven approach would be more scalable.
  const techApiSections = {
    'Core Infrastructure & Cloud': ['STRIPE_SECRET_KEY', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'SENDGRID_API_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'GOOGLE_CLOUD_API_KEY'],
    'Deployment & DevOps': ['DOCKER_HUB_USERNAME', 'DOCKER_HUB_ACCESS_TOKEN', 'HEROKU_API_KEY', 'NETLIFY_PERSONAL_ACCESS_TOKEN', 'VERCEL_API_TOKEN', 'CLOUDFLARE_API_TOKEN', 'DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'LINODE_PERSONAL_ACCESS_TOKEN', 'TERRAFORM_API_TOKEN'],
    'Collaboration & Productivity': ['GITHUB_PERSONAL_ACCESS_TOKEN', 'SLACK_BOT_TOKEN', 'DISCORD_BOT_TOKEN', 'TRELLO_API_KEY', 'TRELLO_API_TOKEN', 'JIRA_USERNAME', 'JIRA_API_TOKEN', 'ASANA_PERSONAL_ACCESS_TOKEN', 'NOTION_API_KEY', 'AIRTABLE_API_KEY'],
    'File & Data Storage': ['DROPBOX_ACCESS_TOKEN', 'BOX_DEVELOPER_TOKEN', 'GOOGLE_DRIVE_API_KEY', 'ONEDRIVE_CLIENT_ID'],
    'CRM & Business': ['SALESFORCE_CLIENT_ID', 'SALESFORCE_CLIENT_SECRET', 'HUBSPOT_API_KEY', 'ZENDESK_API_TOKEN', 'INTERCOM_ACCESS_TOKEN', 'MAILCHIMP_API_KEY'],
    'E-commerce': ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'BIGCOMMERCE_ACCESS_TOKEN', 'MAGENTO_ACCESS_TOKEN', 'WOOCOMMERCE_CLIENT_KEY', 'WOOCOMMERCE_CLIENT_SECRET'],
    'Authentication & Identity': ['STYTCH_PROJECT_ID', 'STYTCH_SECRET', 'AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'OKTA_DOMAIN', 'OKTA_API_TOKEN'],
    'Backend & Databases': ['FIREBASE_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'],
    'API Development': ['POSTMAN_API_KEY', 'APOLLO_GRAPH_API_KEY'],
    'AI & Machine Learning': ['OPENAI_API_KEY', 'HUGGING_FACE_API_TOKEN', 'GOOGLE_CLOUD_AI_API_KEY', 'AMAZON_REKOGNITION_ACCESS_KEY', 'MICROSOFT_AZURE_COGNITIVE_KEY', 'IBM_WATSON_API_KEY'],
    'Search & Real-time': ['ALGOLIA_APP_ID', 'ALGOLIA_ADMIN_API_KEY', 'PUSHER_APP_ID', 'PUSHER_KEY', 'PUSHER_SECRET', 'ABLY_API_KEY', 'ELASTICSEARCH_API_KEY'],
    'Identity & Verification': ['STRIPE_IDENTITY_SECRET_KEY', 'ONFIDO_API_TOKEN', 'CHECKR_API_KEY'],
    'Logistics & Shipping': ['LOB_API_KEY', 'EASYPOST_API_KEY', 'SHIPPO_API_TOKEN'],
    'Maps & Weather': ['GOOGLE_MAPS_API_KEY', 'MAPBOX_ACCESS_TOKEN', 'HERE_API_KEY', 'ACCUWEATHER_API_KEY', 'OPENWEATHERMAP_API_KEY'],
    'Social & Media': ['YELP_API_KEY', 'FOURSQUARE_API_KEY', 'REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'TWITTER_BEARER_TOKEN', 'FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET', 'YOUTUBE_DATA_API_KEY', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SOUNDCLOUD_CLIENT_ID', 'TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'],
    'Media & Content': ['MUX_TOKEN_ID', 'MUX_TOKEN_SECRET', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'IMGIX_API_KEY'],
    'Legal & Admin': ['STRIPE_ATLAS_API_KEY', 'CLERKY_API_KEY', 'DOCUSIGN_INTEGRATOR_KEY', 'HELLOSIGN_API_KEY'],
    'Monitoring & CI/CD': ['LAUNCHDARKLY_SDK_KEY', 'SENTRY_AUTH_TOKEN', 'DATADOG_API_KEY', 'NEW_RELIC_API_KEY', 'CIRCLECI_API_TOKEN', 'TRAVIS_CI_API_TOKEN', 'BITBUCKET_USERNAME', 'BITBUCKET_APP_PASSWORD', 'GITLAB_PERSONAL_ACCESS_TOKEN', 'PAGERDUTY_API_KEY'],
    'Headless CMS': ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ACCESS_TOKEN', 'SANITY_PROJECT_ID', 'SANITY_API_TOKEN', 'STRAPI_API_TOKEN'],
  };

  const bankingApiSections = {
    'Data Aggregators': ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'YODLEE_CLIENT_ID', 'YODLEE_SECRET', 'MX_CLIENT_ID', 'MX_API_KEY', 'FINICITY_PARTNER_ID', 'FINICITY_APP_KEY'],
    'Payment Processing': ['ADYEN_API_KEY', 'ADYEN_MERCHANT_ACCOUNT', 'BRAINTREE_MERCHANT_ID', 'BRAINTREE_PUBLIC_KEY', 'BRAINTREE_PRIVATE_KEY', 'SQUARE_APPLICATION_ID', 'SQUARE_ACCESS_TOKEN', 'PAYPAL_CLIENT_ID', 'PAYPAL_SECRET', 'DWOLLA_KEY', 'DWOLLA_SECRET', 'WORLDPAY_API_KEY', 'CHECKOUT_SECRET_KEY'],
    'Banking as a Service (BaaS) & Card Issuing': ['MARQETA_APPLICATION_TOKEN', 'MARQETA_ADMIN_ACCESS_TOKEN', 'GALILEO_API_LOGIN', 'GALILEO_API_TRANS_KEY', 'SOLARISBANK_CLIENT_ID', 'SOLARISBANK_CLIENT_SECRET', 'SYNAPSE_CLIENT_ID', 'SYNAPSE_CLIENT_SECRET', 'RAILSBANK_API_KEY', 'CLEARBANK_API_KEY', 'UNIT_API_TOKEN', 'TREASURY_PRIME_API_KEY', 'INCREASE_API_KEY', 'MERCURY_API_KEY', 'BREX_API_KEY', 'BOND_API_KEY'],
    'International Payments': ['CURRENCYCLOUD_LOGIN_ID', 'CURRENCYCLOUD_API_KEY', 'OFX_API_KEY', 'WISE_API_TOKEN', 'REMITLY_API_KEY', 'AZIMO_API_KEY', 'NIUM_API_KEY'],
    'Investment & Market Data': ['ALPACA_API_KEY_ID', 'ALPACA_SECRET_KEY', 'TRADIER_ACCESS_TOKEN', 'IEX_CLOUD_API_TOKEN', 'POLYGON_API_KEY', 'FINNHUB_API_KEY', 'ALPHA_VANTAGE_API_KEY', 'MORNINGSTAR_API_KEY', 'XIGNITE_API_TOKEN', 'DRIVEWEALTH_API_KEY'],
    'Crypto': ['COINBASE_API_KEY', 'COINBASE_API_SECRET', 'BINANCE_API_KEY', 'BINANCE_API_SECRET', 'KRAKEN_API_KEY', 'KRAKEN_PRIVATE_KEY', 'GEMINI_API_KEY', 'GEMINI_API_SECRET', 'COINMARKETCAP_API_KEY', 'COINGECKO_API_KEY', 'BLOCKIO_API_KEY'],
    'Major Banks (Open Banking)': ['JP_MORGAN_CHASE_CLIENT_ID', 'CITI_CLIENT_ID', 'WELLS_FARGO_CLIENT_ID', 'CAPITAL_ONE_CLIENT_ID'],
    'European & Global Banks (Open Banking)': ['HSBC_CLIENT_ID', 'BARCLAYS_CLIENT_ID', 'BBVA_CLIENT_ID', 'DEUTSCHE_BANK_API_KEY'],
    'UK & European Aggregators': ['TINK_CLIENT_ID', 'TRUELAYER_CLIENT_ID'],
    'Compliance & Identity (KYC/AML)': ['MIDDESK_API_KEY', 'ALLOY_API_TOKEN', 'ALLOY_API_SECRET', 'COMPLYADVANTAGE_API_KEY'],
    'Real Estate': ['ZILLOW_API_KEY', 'CORELOGIC_CLIENT_ID'],
    'Credit Bureaus': ['EXPERIAN_API_KEY', 'EQUIFAX_API_KEY', 'TRANSUNION_API_KEY'],
    'Global Payments (Emerging Markets)': ['FINCRA_API_KEY', 'FLUTTERWAVE_SECRET_KEY', 'PAYSTACK_SECRET_KEY', 'DLOCAL_API_KEY', 'RAPYD_ACCESS_KEY'],
    'Accounting & Tax': ['TAXJAR_API_KEY', 'AVALARA_API_KEY', 'CODAT_API_KEY', 'XERO_CLIENT_ID', 'XERO_CLIENT_SECRET', 'QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET', 'FRESHBOOKS_API_KEY'],
    'Fintech Utilities': ['ANVIL_API_KEY', 'MOOV_CLIENT_ID', 'MOOV_SECRET', 'VGS_USERNAME', 'VGS_PASSWORD', 'SILA_APP_HANDLE', 'SILA_PRIVATE_KEY'],
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-2">API Credentials Console</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Manage credentials for integrated services. These are sent to and stored on your backend.
          <br />
          <span className="text-red-500 font-semibold">WARNING: Directly inputting sensitive keys here is a security risk. Ideally, use environment variables or a secure backend secrets manager.</span>
        </p>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('tech')}
            className={`py-2 px-6 rounded-md font-semibold transition-colors duration-200 ${
              activeTab === 'tech'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Tech APIs
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`py-2 px-6 rounded-md font-semibold transition-colors duration-200 ${
              activeTab === 'banking'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Banking & Finance APIs
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'tech' &&
              Object.entries(techApiSections).map(([sectionTitle, keysInGroup]) => (
                <div key={sectionTitle} className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{sectionTitle}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {keysInGroup.map((keyName) => (
                      renderInput(keyName as keyof ApiKeysState, keyName.replace(/_/g, ' '))
                    ))}
                  </div>
                </div>
              ))}

            {activeTab === 'banking' &&
              Object.entries(bankingApiSections).map(([sectionTitle, keysInGroup]) => (
                <div key={sectionTitle} className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{sectionTitle}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {keysInGroup.map((keyName) => (
                      renderInput(keyName as keyof ApiKeysState, keyName.replace(/_/g, ' '))
                    ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="form-footer mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center">
            <button
              type="submit"
              className="w-full max-w-sm py-3 px-6 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save All Keys to Server'}
            </button>
            {statusMessage && (
              <p className={`mt-4 text-center text-sm ${statusMessage.startsWith('Error') ? 'text-red-500' : 'text-green-500'} dark:text-green-400`}>
                {statusMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiSettingsPage;