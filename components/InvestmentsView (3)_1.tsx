import React, { useState, FormEvent, ChangeEvent, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { Alert, Box, Button, Tab, Tabs, TextField, Typography } from '@mui/material';
// Importing necessary components from MUI, adhering to the stack unification instruction.

// =================================================================================
// REFACTOR RATIONALE:
// 1. UI/Styling: Replaced custom CSS/unspecified styling with Material-UI (MUI) for consistency and production readiness.
// 2. State Management: Retained simple local state (useState) as this component is purely for configuration input, 
//    but structured data handling cleanly.
// 3. Security/Architecture: Updated handling to acknowledge that keys should be stored securely, 
//    and mocked the client-side state management based on the developer instruction requiring backend storage via a secure POST endpoint.
// 4. Usability: Implemented Tab control for managing the massive list of inputs cleanly.
// 5. Dependencies: Imported `useMemo` for stable schema definition.
// =================================================================================

// =================================================================================
// The complete interface for all 200+ API credentials
// This structure is maintained but will be replaced by structured environment variable loading 
// or retrieval from a secure configuration service (e.g., AWS Secrets Manager) in a real deployment.
// For this client-side component, we treat it as configuration input validation.
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


const InvestmentsView: React.FC = () => {
  // Initialize state with empty strings for better control on controlled components
  const [keys, setKeys] = useState<Partial<ApiKeysState>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ type: 'info', message: 'Preparing keys for secure submission...' });

    // Filter out undefined/empty values before sending, though the backend should handle validation.
    const payload: Partial<ApiKeysState> = Object.fromEntries(
      Object.entries(keys).filter(([, value]) => !!value)
    ) as Partial<ApiKeysState>;

    try {
      // IMPORTANT: In a production system, sensitive keys MUST NOT be stored client-side 
      // or sent over standard POST requests without proper authorization, encryption (end-to-end), 
      // and robust backend validation (e.g., using JWT/OIDC secured endpoints, and storing secrets in Vault/Secrets Manager).
      const response = await axios.post('http://localhost:4000/api/save-keys', payload);
      
      setStatusMessage({ type: 'success', message: response.data.message || 'Keys saved successfully (mocked success).' });
      
      // Optionally clear inputs upon success if keys are confirmed stored securely server-side
      // setKeys({}); 
    } catch (error) {
      const err = error as AxiosError;
      console.error("API Submission Error:", err);
      setStatusMessage({ 
        type: 'error', 
        message: `Error saving keys: ${err.response?.data?.message || err.message || 'Network error or server issue.'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // RENDER HELPERS using MUI components
  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <TextField
      key={keyName}
      id={keyName}
      name={keyName}
      label={label}
      type="password"
      variant="outlined"
      fullWidth
      value={keys[keyName] || ''}
      onChange={handleInputChange}
      margin="normal"
      InputProps={{
        // Masking for visual indication that content is secret, but retaining functionality
        readOnly: isSaving,
      }}
    />
  );

  // Schemas defined using useMemo for performance (though negligible here)
  const TechAPISchema = useMemo(() => ({
      "Core Infrastructure & Cloud": [
        { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
        { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
        { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token' },
        { key: 'SENDGRID_API_KEY', label: 'SendGrid API Key' },
        { key: 'AWS_ACCESS_KEY_ID', label: 'AWS Access Key ID' },
        { key: 'AWS_SECRET_ACCESS_KEY', label: 'AWS Secret Access Key' },
        { key: 'AZURE_CLIENT_ID', label: 'Azure Client ID' },
        { key: 'AZURE_CLIENT_SECRET', label: 'Azure Client Secret' },
        { key: 'GOOGLE_CLOUD_API_KEY', label: 'Google Cloud API Key' },
      ],
      "Deployment & DevOps": [
        { key: 'DOCKER_HUB_USERNAME', label: 'Docker Hub Username' },
        { key: 'DOCKER_HUB_ACCESS_TOKEN', label: 'Docker Hub Access Token' },
        { key: 'HEROKU_API_KEY', label: 'Heroku API Key' },
        { key: 'NETLIFY_PERSONAL_ACCESS_TOKEN', label: 'Netlify PAT' },
        { key: 'VERCEL_API_TOKEN', label: 'Vercel API Token' },
        { key: 'CLOUDFLARE_API_TOKEN', label: 'Cloudflare API Token' },
        { key: 'DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', label: 'DigitalOcean PAT' },
        { key: 'LINODE_PERSONAL_ACCESS_TOKEN', label: 'Linode PAT' },
        { key: 'TERRAFORM_API_TOKEN', label: 'Terraform API Token' },
      ],
      "Collaboration & Productivity": [
        { key: 'GITHUB_PERSONAL_ACCESS_TOKEN', label: 'GitHub PAT' },
        { key: 'SLACK_BOT_TOKEN', label: 'Slack Bot Token' },
        { key: 'DISCORD_BOT_TOKEN', label: 'Discord Bot Token' },
        { key: 'TRELLO_API_KEY', label: 'Trello API Key' },
        { key: 'TRELLO_API_TOKEN', label: 'Trello API Token' },
        { key: 'JIRA_USERNAME', label: 'Jira Username' },
        { key: 'JIRA_API_TOKEN', label: 'Jira API Token' },
        { key: 'ASANA_PERSONAL_ACCESS_TOKEN', label: 'Asana PAT' },
        { key: 'NOTION_API_KEY', label: 'Notion API Key' },
        { key: 'AIRTABLE_API_KEY', label: 'Airtable API Key' },
      ],
      "File & Data Storage": [
        { key: 'DROPBOX_ACCESS_TOKEN', label: 'Dropbox Access Token' },
        { key: 'BOX_DEVELOPER_TOKEN', label: 'Box Developer Token' },
        { key: 'GOOGLE_DRIVE_API_KEY', label: 'Google Drive API Key' },
        { key: 'ONEDRIVE_CLIENT_ID', label: 'OneDrive Client ID' },
      ],
      "CRM & Business": [
        { key: 'SALESFORCE_CLIENT_ID', label: 'Salesforce Client ID' },
        { key: 'SALESFORCE_CLIENT_SECRET', label: 'Salesforce Client Secret' },
        { key: 'HUBSPOT_API_KEY', label: 'HubSpot API Key' },
        { key: 'ZENDESK_API_TOKEN', label: 'Zendesk API Token' },
        { key: 'INTERCOM_ACCESS_TOKEN', label: 'Intercom Access Token' },
        { key: 'MAILCHIMP_API_KEY', label: 'Mailchimp API Key' },
      ],
      "E-commerce": [
        { key: 'SHOPIFY_API_KEY', label: 'Shopify API Key' },
        { key: 'SHOPIFY_API_SECRET', label: 'Shopify API Secret' },
        { key: 'BIGCOMMERCE_ACCESS_TOKEN', label: 'BigCommerce Access Token' },
        { key: 'MAGENTO_ACCESS_TOKEN', label: 'Magento Access Token' },
        { key: 'WOOCOMMERCE_CLIENT_KEY', label: 'WooCommerce Client Key' },
        { key: 'WOOCOMMERCE_CLIENT_SECRET', label: 'WooCommerce Client Secret' },
      ],
      "Authentication & Identity": [
        { key: 'STYTCH_PROJECT_ID', label: 'Stytch Project ID' },
        { key: 'STYTCH_SECRET', label: 'Stytch Secret' },
        { key: 'AUTH0_DOMAIN', label: 'Auth0 Domain' },
        { key: 'AUTH0_CLIENT_ID', label: 'Auth0 Client ID' },
        { key: 'AUTH0_CLIENT_SECRET', label: 'Auth0 Client Secret' },
        { key: 'OKTA_DOMAIN', label: 'Okta Domain' },
        { key: 'OKTA_API_TOKEN', label: 'Okta API Token' },
      ],
      "Backend & Databases": [
        { key: 'FIREBASE_API_KEY', label: 'Firebase API Key' },
        { key: 'SUPABASE_URL', label: 'Supabase URL' },
        { key: 'SUPABASE_ANON_KEY', label: 'Supabase Anon Key' },
      ],
      "API Development": [
        { key: 'POSTMAN_API_KEY', label: 'Postman API Key' },
        { key: 'APOLLO_GRAPH_API_KEY', label: 'Apollo Graph API Key' },
      ],
      "AI & Machine Learning": [
        // Rationale: These AI keys are now consolidated here, pending standardization into a single AI Service Interface (Developer Instruction 5)
        { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
        { key: 'HUGGING_FACE_API_TOKEN', label: 'Hugging Face API Token' },
        { key: 'GOOGLE_CLOUD_AI_API_KEY', label: 'Google Cloud AI API Key' },
        { key: 'AMAZON_REKOGNITION_ACCESS_KEY', label: 'Amazon Rekognition Access Key' },
        { key: 'MICROSOFT_AZURE_COGNITIVE_KEY', label: 'MS Azure Cognitive Key' },
        { key: 'IBM_WATSON_API_KEY', label: 'IBM Watson API Key' },
      ],
      "Search & Real-time": [
        { key: 'ALGOLIA_APP_ID', label: 'Algolia App ID' },
        { key: 'ALGOLIA_ADMIN_API_KEY', label: 'Algolia Admin API Key' },
        { key: 'PUSHER_APP_ID', label: 'Pusher App ID' },
        { key: 'PUSHER_KEY', label: 'Pusher Key' },
        { key: 'PUSHER_SECRET', label: 'Pusher Secret' },
        { key: 'ABLY_API_KEY', label: 'Ably API Key' },
        { key: 'ELASTICSEARCH_API_KEY', label: 'Elasticsearch API Key' },
      ],
      "Identity & Verification": [
        { key: 'STRIPE_IDENTITY_SECRET_KEY', label: 'Stripe Identity Secret Key' },
        { key: 'ONFIDO_API_TOKEN', label: 'Onfido API Token' },
        { key: 'CHECKR_API_KEY', label: 'Checkr API Key' },
      ],
      "Logistics & Shipping": [
        { key: 'LOB_API_KEY', label: 'Lob API Key' },
        { key: 'EASYPOST_API_KEY', label: 'EasyPost API Key' },
        { key: 'SHIPPO_API_TOKEN', label: 'Shippo API Token' },
      ],
      "Maps & Weather": [
        { key: 'GOOGLE_MAPS_API_KEY', label: 'Google Maps API Key' },
        { key: 'MAPBOX_ACCESS_TOKEN', label: 'Mapbox Access Token' },
        { key: 'HERE_API_KEY', label: 'HERE API Key' },
        { key: 'ACCUWEATHER_API_KEY', label: 'AccuWeather API Key' },
        { key: 'OPENWEATHERMAP_API_KEY', label: 'OpenWeatherMap API Key' },
      ],
      "Social & Media": [
        { key: 'YELP_API_KEY', label: 'Yelp API Key' },
        { key: 'FOURSQUARE_API_KEY', label: 'Foursquare API Key' },
        { key: 'REDDIT_CLIENT_ID', label: 'Reddit Client ID' },
        { key: 'REDDIT_CLIENT_SECRET', label: 'Reddit Client Secret' },
        { key: 'TWITTER_BEARER_TOKEN', label: 'Twitter Bearer Token' },
        { key: 'FACEBOOK_APP_ID', label: 'Facebook App ID' },
        { key: 'FACEBOOK_APP_SECRET', label: 'Facebook App Secret' },
        { key: 'INSTAGRAM_APP_ID', label: 'Instagram App ID' },
        { key: 'INSTAGRAM_APP_SECRET', label: 'Instagram App Secret' },
        { key: 'YOUTUBE_DATA_API_KEY', label: 'YouTube Data API Key' },
        { key: 'SPOTIFY_CLIENT_ID', label: 'Spotify Client ID' },
        { key: 'SPOTIFY_CLIENT_SECRET', label: 'Spotify Client Secret' },
        { key: 'SOUNDCLOUD_CLIENT_ID', label: 'SoundCloud Client ID' },
        { key: 'TWITCH_CLIENT_ID', label: 'Twitch Client ID' },
        { key: 'TWITCH_CLIENT_SECRET', label: 'Twitch Client Secret' },
      ],
      "Media & Content": [
        { key: 'MUX_TOKEN_ID', label: 'Mux Token ID' },
        { key: 'MUX_TOKEN_SECRET', label: 'Mux Token Secret' },
        { key: 'CLOUDINARY_API_KEY', label: 'Cloudinary API Key' },
        { key: 'CLOUDINARY_API_SECRET', label: 'Cloudinary API Secret' },
        { key: 'IMGIX_API_KEY', label: 'Imgix API Key' },
      ],
      "Legal & Admin": [
        { key: 'STRIPE_ATLAS_API_KEY', label: 'Stripe Atlas API Key' },
        { key: 'CLERKY_API_KEY', label: 'Clerky API Key' },
        { key: 'DOCUSIGN_INTEGRATOR_KEY', label: 'DocuSign Integrator Key' },
        { key: 'HELLOSIGN_API_KEY', label: 'HelloSign API Key' },
      ],
      "Monitoring & CI/CD": [
        // NOTE: CI/CD configuration paths are being streamlined (Instruction 7)
        { key: 'LAUNCHDARKLY_SDK_KEY', label: 'LaunchDarkly SDK Key' },
        { key: 'SENTRY_AUTH_TOKEN', label: 'Sentry Auth Token' },
        { key: 'DATADOG_API_KEY', label: 'Datadog API Key' },
        { key: 'NEW_RELIC_API_KEY', label: 'New Relic API Key' },
        { key: 'CIRCLECI_API_TOKEN', label: 'CircleCI API Token' },
        { key: 'TRAVIS_CI_API_TOKEN', label: 'Travis CI API Token' },
        { key: 'BITBUCKET_USERNAME', label: 'Bitbucket Username' },
        { key: 'BITBUCKET_APP_PASSWORD', label: 'Bitbucket App Password' },
        { key: 'GITLAB_PERSONAL_ACCESS_TOKEN', label: 'GitLab PAT' },
        { key: 'PAGERDUTY_API_KEY', label: 'PagerDuty API Key' },
      ],
      "Headless CMS": [
        { key: 'CONTENTFUL_SPACE_ID', label: 'Contentful Space ID' },
        { key: 'CONTENTFUL_ACCESS_TOKEN', label: 'Contentful Access Token' },
        { key: 'SANITY_PROJECT_ID', label: 'Sanity Project ID' },
        { key: 'SANITY_API_TOKEN', label: 'Sanity API Token' },
        { key: 'STRAPI_API_TOKEN', label: 'Strapi API Token' },
      ],
  }), []);

  const BankingAPISchema = useMemo(() => ({
    "Data Aggregators": [
        { key: 'PLAID_CLIENT_ID', label: 'Plaid Client ID' },
        { key: 'PLAID_SECRET', label: 'Plaid Secret' },
        { key: 'YODLEE_CLIENT_ID', label: 'Yodlee Client ID' },
        { key: 'YODLEE_SECRET', label: 'Yodlee Secret' },
        { key: 'MX_CLIENT_ID', label: 'MX Client ID' },
        { key: 'MX_API_KEY', label: 'MX API Key' },
        { key: 'FINICITY_PARTNER_ID', label: 'Finicity Partner ID' },
        { key: 'FINICITY_APP_KEY', label: 'Finicity App Key' },
    ],
    "Payment Processing": [
        { key: 'ADYEN_API_KEY', label: 'Adyen API Key' },
        { key: 'ADYEN_MERCHANT_ACCOUNT', label: 'Adyen Merchant Account' },
        { key: 'BRAINTREE_MERCHANT_ID', label: 'Braintree Merchant ID' },
        { key: 'BRAINTREE_PUBLIC_KEY', label: 'Braintree Public Key' },
        { key: 'BRAINTREE_PRIVATE_KEY', label: 'Braintree Private Key' },
        { key: 'SQUARE_APPLICATION_ID', label: 'Square Application ID' },
        { key: 'SQUARE_ACCESS_TOKEN', label: 'Square Access Token' },
        { key: 'PAYPAL_CLIENT_ID', label: 'PayPal Client ID' },
        { key: 'PAYPAL_SECRET', label: 'PayPal Secret' },
        { key: 'DWOLLA_KEY', label: 'Dwolla Key' },
        { key: 'DWOLLA_SECRET', label: 'Dwolla Secret' },
        { key: 'WORLDPAY_API_KEY', label: 'Worldpay API Key' },
        { key: 'CHECKOUT_SECRET_KEY', label: 'Checkout.com Secret Key' },
    ],
    "Banking as a Service (BaaS) & Card Issuing": [
        // Rationale: These are core components for the recommended MVP scope (Treasury Automation/Multi-bank Aggregation)
        { key: 'MARQETA_APPLICATION_TOKEN', label: 'Marqeta Application Token' },
        { key: 'MARQETA_ADMIN_ACCESS_TOKEN', label: 'Marqeta Admin Access Token' },
        { key: 'GALILEO_API_LOGIN', label: 'Galileo API Login' },
        { key: 'GALILEO_API_TRANS_KEY', label: 'Galileo Trans Key' },
        { key: 'SOLARISBANK_CLIENT_ID', label: 'SolarisBank Client ID' },
        { key: 'SOLARISBANK_CLIENT_SECRET', label: 'SolarisBank Client Secret' },
        { key: 'SYNAPSE_CLIENT_ID', label: 'Synapse Client ID' },
        { key: 'SYNAPSE_CLIENT_SECRET', label: 'Synapse Client Secret' },
        { key: 'RAILSBANK_API_KEY', label: 'Railsbank API Key' },
        { key: 'CLEARBANK_API_KEY', label: 'ClearBank API Key' },
        { key: 'UNIT_API_TOKEN', label: 'Unit API Token' },
        { key: 'TREASURY_PRIME_API_KEY', label: 'Treasury Prime API Key' },
        { key: 'INCREASE_API_KEY', label: 'Increase API Key' },
        { key: 'MERCURY_API_KEY', label: 'Mercury API Key' },
        { key: 'BREX_API_KEY', label: 'Brex API Key' },
        { key: 'BOND_API_KEY', label: 'Bond API Key' },
    ],
    "International Payments": [
        { key: 'CURRENCYCLOUD_LOGIN_ID', label: 'CurrencyCloud Login ID' },
        { key: 'CURRENCYCLOUD_API_KEY', label: 'CurrencyCloud API Key' },
        { key: 'OFX_API_KEY', label: 'OFX API Key' },
        { key: 'WISE_API_TOKEN', label: 'Wise API Token' },
        { key: 'REMITLY_API_KEY', label: 'Remitly API Key' },
        { key: 'AZIMO_API_KEY', label: 'Azimo API Key' },
        { key: 'NIUM_API_KEY', label: 'Nium API Key' },
    ],
    "Investment & Market Data": [
        // These are relevant for the "Unified financial dashboard" or "Treasury automation" MVP
        { key: 'ALPACA_API_KEY_ID', label: 'Alpaca API Key ID' },
        { key: 'ALPACA_SECRET_KEY', label: 'Alpaca Secret Key' },
        { key: 'TRADIER_ACCESS_TOKEN', label: 'Tradier Access Token' },
        { key: 'IEX_CLOUD_API_TOKEN', label: 'IEX Cloud API Token' },
        { key: 'POLYGON_API_KEY', label: 'Polygon API Key' },
        { key: 'FINNHUB_API_KEY', label: 'FinnHub API Key' },
        { key: 'ALPHA_VANTAGE_API_KEY', label: 'Alpha Vantage API Key' },
        { key: 'MORNINGSTAR_API_KEY', label: 'Morningstar API Key' },
        { key: 'XIGNITE_API_TOKEN', label: 'Xignite API Token' },
        { key: 'DRIVEWEALTH_API_KEY', label: 'DriveWealth API Key' },
    ],
    "Crypto": [
        { key: 'COINBASE_API_KEY', label: 'Coinbase API Key' },
        { key: 'COINBASE_API_SECRET', label: 'Coinbase API Secret' },
        { key: 'BINANCE_API_KEY', label: 'Binance API Key' },
        { key: 'BINANCE_API_SECRET', label: 'Binance API Secret' },
        { key: 'KRAKEN_API_KEY', label: 'Kraken API Key' },
        { key: 'KRAKEN_PRIVATE_KEY', label: 'Kraken Private Key' },
        { key: 'GEMINI_API_KEY', label: 'Gemini API Key' },
        { key: 'GEMINI_API_SECRET', label: 'Gemini API Secret' },
        { key: 'COINMARKETCAP_API_KEY', label: 'CoinMarketCap API Key' },
        { key: 'COINGECKO_API_KEY', label: 'CoinGecko API Key' },
        { key: 'BLOCKIO_API_KEY', label: 'Block.io API Key' },
    ],
    "Major Banks (Open Banking)": [
        { key: 'JP_MORGAN_CHASE_CLIENT_ID', label: 'JPM Chase Client ID' },
        { key: 'CITI_CLIENT_ID', label: 'Citi Client ID' },
        { key: 'WELLS_FARGO_CLIENT_ID', label: 'Wells Fargo Client ID' },
        { key: 'CAPITAL_ONE_CLIENT_ID', label: 'Capital One Client ID' },
    ],
    "European & Global Banks (Open Banking)": [
        { key: 'HSBC_CLIENT_ID', label: 'HSBC Client ID' },
        { key: 'BARCLAYS_CLIENT_ID', label: 'Barclays Client ID' },
        { key: 'BBVA_CLIENT_ID', label: 'BBVA Client ID' },
        { key: 'DEUTSCHE_BANK_API_KEY', label: 'Deutsche Bank API Key' },
    ],
    "UK & European Aggregators": [
        { key: 'TINK_CLIENT_ID', label: 'Tink Client ID' },
        { key: 'TRUELAYER_CLIENT_ID', label: 'TrueLayer Client ID' },
    ],
    "Compliance & Identity (KYC/AML)": [
        { key: 'MIDDESK_API_KEY', label: 'Mid-Desk API Key' },
        { key: 'ALLOY_API_TOKEN', label: 'Alloy API Token' },
        { key: 'ALLOY_API_SECRET', label: 'Alloy API Secret' },
        { key: 'COMPLYADVANTAGE_API_KEY', label: 'ComplyAdvantage API Key' },
    ],
    "Real Estate": [
        { key: 'ZILLOW_API_KEY', label: 'Zillow API Key' },
        { key: 'CORELOGIC_CLIENT_ID', label: 'CoreLogic Client ID' },
    ],
    "Credit Bureaus": [
        { key: 'EXPERIAN_API_KEY', label: 'Experian API Key' },
        { key: 'EQUIFAX_API_KEY', label: 'Equifax API Key' },
        { key: 'TRANSUNION_API_KEY', label: 'TransUnion API Key' },
    ],
    "Global Payments (Emerging Markets)": [
        { key: 'FINCRA_API_KEY', label: 'Fincra API Key' },
        { key: 'FLUTTERWAVE_SECRET_KEY', label: 'Flutterwave Secret Key' },
        { key: 'PAYSTACK_SECRET_KEY', label: 'Paystack Secret Key' },
        { key: 'DLOCAL_API_KEY', label: 'DLocal API Key' },
        { key: 'RAPYD_ACCESS_KEY', label: 'Rapyd Access Key' },
    ],
    "Accounting & Tax": [
        { key: 'TAXJAR_API_KEY', label: 'TaxJar API Key' },
        { key: 'AVALARA_API_KEY', label: 'Avalara API Key' },
        { key: 'CODAT_API_KEY', label: 'Codat API Key' },
        { key: 'XERO_CLIENT_ID', label: 'Xero Client ID' },
        { key: 'XERO_CLIENT_SECRET', label: 'Xero Client Secret' },
        { key: 'QUICKBOOKS_CLIENT_ID', label: 'QuickBooks Client ID' },
        { key: 'QUICKBOOKS_CLIENT_SECRET', label: 'QuickBooks Client Secret' },
        { key: 'FRESHBOOKS_API_KEY', label: 'FreshBooks API Key' },
    ],
    "Fintech Utilities": [
        { key: 'ANVIL_API_KEY', label: 'Anvil API Key' },
        { key: 'MOOV_CLIENT_ID', label: 'Moov Client ID' },
        { key: 'MOOV_SECRET', label: 'Moov Secret' },
        { key: 'VGS_USERNAME', label: 'VGS Username' },
        { key: 'VGS_PASSWORD', label: 'VGS Password' },
        { key: 'SILA_APP_HANDLE', label: 'Sila App Handle' },
        { key: 'SILA_PRIVATE_KEY', label: 'Sila Private Key' },
    ],
  }), []);


  const renderSection = (schema: Record<string, { key: keyof ApiKeysState, label: string }[]>) => {
    return Object.entries(schema).map(([sectionTitle, inputs]) => (
      <Box key={sectionTitle} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>{sectionTitle}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {inputs.map(input => renderInput(input.key, input.label))}
        </Box>
      </Box>
    ));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Secure API Credential Management</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage credentials for integrated services. **Warning:** Client-side inputting of production secrets is deprecated. 
        These values are submitted to the backend configuration endpoint for centralized, secure storage (Vault/Secrets Manager integration required).
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={(_, value) => setActiveTab(value)} 
        indicatorColor="primary" 
        textColor="primary" 
        sx={{ mb: 3 }}
      >
        <Tab label="Technology & Platform APIs" value="tech" />
        <Tab label="Banking & Finance APIs" value="banking" />
      </Tabs>

      {statusMessage && (
        <Alert 
          severity={statusMessage.type === 'error' ? 'error' : statusMessage.type === 'success' ? 'success' : 'info'} 
          sx={{ mb: 3 }}
        >
          {statusMessage.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box>
          {activeTab === 'tech' ? (
            renderSection(TechAPISchema)
          ) : (
            renderSection(BankingAPISchema)
          )}
        </Box>
        
        <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSaving || Object.keys(keys).length === 0}
          >
            {isSaving ? 'Submitting Securely...' : 'Persist Configuration to Backend'}
          </Button>
          {isSaving && <Typography variant="caption">Processing request...</Typography>}
        </Box>
      </form>
    </Box>
  );
};

export default InvestmentsView;