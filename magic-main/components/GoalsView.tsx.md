// src/pages/ApiSettingsPage.tsx

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css'; // This CSS will be provided in Part 2

// =================================================================================
// The complete interface for all 200+ API credentials
// NOTE: This interface is extremely large and should be managed carefully.
// In a production system, consider using environment variables for sensitive keys
// and potentially a more granular approach to API key management.
// For now, this follows the existing structure.
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
  MIDDESK_API_KEY: string; // Corrected from "Midokndo API Key"
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


const ApiSettingsPage: React.FC = () => {
  // Initialize state with an empty object that conforms to ApiKeysState.
  // This ensures that all properties are defined, even if initially empty.
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
    try {
      // NOTE: Sending all keys in one payload can be a security risk.
      // In a production environment, consider encrypting keys before sending
      // or using a more secure backend mechanism for key storage and retrieval.
      // This implementation assumes the backend handles security appropriately.
      const response = await axios.post('http://localhost:4000/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      console.error("Error saving keys:", error);
      setStatusMessage('Error: Could not save keys. Please check backend server and network connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to render input fields for API keys.
  // It automatically sets type to "password" for security and handles empty values.
  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        type="password" // Use password type for sensitive keys
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''} // Ensure value is always a string, defaulting to empty
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        required // Mark as required for form submission
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>API Credentials Console</h1>
      <p className="subtitle">Securely manage credentials for all integrated services. These are sent to and stored on your backend.</p>

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
              {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify Personal Access Token')}
              {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
              {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
              {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean Personal Access Token')}
              {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode Personal Access Token')}
              {renderInput('TERRAFORM_API_TOKEN', 'Terraform Cloud API Token')}
            </div>
            <div className="form-section">
              <h2>Collaboration & Productivity</h2>
              {renderInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub Personal Access Token')}
              {renderInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
              {renderInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
              {renderInput('TRELLO_API_KEY', 'Trello API Key')}
              {renderInput('TRELLO_API_TOKEN', 'Trello API Token')}
              {renderInput('JIRA_USERNAME', 'Jira Username')}
              {renderInput('JIRA_API_TOKEN', 'Jira API Token')}
              {renderInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana Personal Access Token')}
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
              {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Microsoft Azure Cognitive Services Key')}
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
              {renderInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab Personal Access Token')}
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
              <h2>Financial Data Aggregators</h2>
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
              {renderInput('GALILEO_API_TRANS_KEY', 'Galileo API Transaction Key')}
              {renderInput('SOLARISBANK_CLIENT_ID', 'SolarisBank Client ID')}
              {renderInput('SOLARISBANK_CLIENT_SECRET', 'SolarisBank Client Secret')}
              {renderInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
              {renderInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
              {renderInput('RAILSBANK_API_KEY', 'RailsBank API Key')}
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
              {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'J.P. Morgan Chase Client ID')}
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
              {renderInput('MIDDESK_API_KEY', 'Midokndo API Key')}
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
              {renderInput('DLOCAL_API_KEY', 'DLocal API Key')}
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
            {isSaving ? 'Saving...' : 'Save All Keys to Server'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ApiSettingsPage;