import React, { useState, useCallback, useMemo, FormEvent, ChangeEvent } from 'react';
import { RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut, Plus } from 'lucide-react';
import axios from 'axios';

// =================================================================================
// API Settings Component - Data Interface
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


// =================================================================================
// API Settings Component - UI & Logic
// =================================================================================
const ApiSettings: React.FC = () => {
  // Initialize state with undefined values to ensure all fields are controlled
  const [keys, setKeys] = useState<Partial<ApiKeysState>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  // Fetch existing keys on component mount (implementation requires a backend endpoint)
  React.useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/get-keys'); // Assuming this endpoint exists
        setKeys(response.data.keys || {});
      } catch (error) {
        console.error("Failed to fetch keys:", error);
        setStatusMessage("Could not load existing keys. Please ensure the backend is running.");
      }
    };
    fetchKeys();
  }, []);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // NOTE: In a production system, sensitive keys should be stored securely (e.g., AWS Secrets Manager, HashiCorp Vault)
      // and this endpoint should handle that securely. Client-side storage of secrets is not recommended.
      const response = await axios.post('http://localhost:4000/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      console.error("Error saving keys:", error);
      setStatusMessage('Error: Could not save keys. Please check backend server and logs.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block font-semibold text-sm text-gray-700 mb-2">{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="w-full p-2 border border-gray-300 rounded-md text-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      />
    </div>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
      <div className="mb-8 pb-8 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {children}
          </div>
      </div>
  );

  return (
    <div className="bg-white shadow-xl rounded-xl border border-gray-100 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
        <h1 className="text-lg font-bold text-gray-900">API Credentials Console</h1>
        <p className="text-xs text-gray-500 mt-0.5">Securely manage credentials for all integrated services.</p>
      </div>
      
      <div className="px-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('tech')} 
          className={`py-3 px-1 mr-6 border-b-2 text-sm font-medium transition-colors ${activeTab === 'tech' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Tech APIs
        </button>
        <button 
          onClick={() => setActiveTab('banking')} 
          className={`py-3 px-1 mr-6 border-b-2 text-sm font-medium transition-colors ${activeTab === 'banking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Banking & Finance APIs
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'tech' ? (
          <>
            {renderSection('Core Infrastructure & Cloud', <>
              {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
              {renderInput('TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
              {renderInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
              {renderInput('SENDGRID_API_KEY', 'SendGrid API Key')}
              {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
              {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
              {renderInput('AZURE_CLIENT_ID', 'Azure Client ID')}
              {renderInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
              {renderInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </>)}
            {renderSection('Deployment & DevOps', <>
              {renderInput('DOCKER_HUB_USERNAME', 'Docker Hub Username')}
              {renderInput('DOCKER_HUB_ACCESS_TOKEN', 'Docker Hub Access Token')}
              {renderInput('HEROKU_API_KEY', 'Heroku API Key')}
              {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify PAT')}
              {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
              {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
              {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean PAT')}
              {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode PAT')}
              {renderInput('TERRAFORM_API_TOKEN', 'Terraform API Token')}
            </>)}
            {renderSection('Collaboration & Productivity', <>
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
            </>)}
            {renderSection('File & Data Storage', <>
                {renderInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
                {renderInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
                {renderInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
                {renderInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </>)}
            {renderSection('CRM & Business', <>
                {renderInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
                {renderInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
                {renderInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
                {renderInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
                {renderInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
                {renderInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </>)}
            {renderSection('E-commerce', <>
                {renderInput('SHOPIFY_API_KEY', 'Shopify API Key')}
                {renderInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
                {renderInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
                {renderInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
                {renderInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
                {renderInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </>)}
            {renderSection('Authentication & Identity', <>
                {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
                {renderInput('STYTCH_SECRET', 'Stytch Secret')}
                {renderInput('AUTH0_DOMAIN', 'Auth0 Domain')}
                {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
                {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
                {renderInput('OKTA_DOMAIN', 'Okta Domain')}
                {renderInput('OKTA_API_TOKEN', 'Okta API Token')}
            </>)}
            {renderSection('Backend & Databases', <>
                {renderInput('FIREBASE_API_KEY', 'Firebase API Key')}
                {renderInput('SUPABASE_URL', 'Supabase URL')}
                {renderInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </>)}
            {renderSection('API Development', <>
                {renderInput('POSTMAN_API_KEY', 'Postman API Key')}
                {renderInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </>)}
            {renderSection('AI & Machine Learning', <>
                {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
                {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
                {renderInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
                {renderInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
                {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Azure Cognitive Services Key')}
                {renderInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </>)}
            {renderSection('Search & Real-time', <>
              {renderInput('ALGOLIA_APP_ID', 'Algolia App ID')}
              {renderInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
              {renderInput('PUSHER_APP_ID', 'Pusher App ID')}
              {renderInput('PUSHER_KEY', 'Pusher Key')}
              {renderInput('PUSHER_SECRET', 'Pusher Secret')}
              {renderInput('ABLY_API_KEY', 'Ably API Key')}
              {renderInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </>)}
            {renderSection('Identity & Verification', <>
              {renderInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
              {renderInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
              {renderInput('CHECKR_API_KEY', 'Checkr API Key')}
            </>)}
            {renderSection('Logistics & Shipping', <>
              {renderInput('LOB_API_KEY', 'Lob API Key')}
              {renderInput('EASYPOST_API_KEY', 'EasyPost API Key')}
              {renderInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </>)}
            {renderSection('Maps & Weather', <>
              {renderInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
              {renderInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
              {renderInput('HERE_API_KEY', 'HERE API Key')}
              {renderInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
              {renderInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </>)}
            {renderSection('Social & Media', <>
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
            </>)}
            {renderSection('Media & Content', <>
              {renderInput('MUX_TOKEN_ID', 'Mux Token ID')}
              {renderInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
              {renderInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
              {renderInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
              {renderInput('IMGIX_API_KEY', 'Imgix API Key')}
            </>)}
            {renderSection('Legal & Admin', <>
              {renderInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
              {renderInput('CLERKY_API_KEY', 'Clerky API Key')}
              {renderInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
              {renderInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </>)}
            {renderSection('Monitoring & CI/CD', <>
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
            </>)}
            {renderSection('Headless CMS', <>
              {renderInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
              {renderInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
              {renderInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
              {renderInput('SANITY_API_TOKEN', 'Sanity API Token')}
              {renderInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </>)}
          </>
        ) : (
          <>
            {renderSection('Data Aggregators', <>
              {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
              {renderInput('PLAID_SECRET', 'Plaid Secret')}
              {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
              {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
              {renderInput('MX_CLIENT_ID', 'MX Client ID')}
              {renderInput('MX_API_KEY', 'MX API Key')}
              {renderInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
              {renderInput('FINICITY_APP_KEY', 'Finicity App Key')}
            </>)}
            {renderSection('Payment Processing', <>
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
            </>)}
            {renderSection('Banking as a Service (BaaS) & Card Issuing', <>
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
            </>)}
            {renderSection('International Payments', <>
                {renderInput('CURRENCYCLOUD_LOGIN_ID', 'Currencycloud Login ID')}
                {renderInput('CURRENCYCLOUD_API_KEY', 'Currencycloud API Key')}
                {renderInput('OFX_API_KEY', 'OFX API Key')}
                {renderInput('WISE_API_TOKEN', 'Wise API Token')}
                {renderInput('REMITLY_API_KEY', 'Remitly API Key')}
                {renderInput('AZIMO_API_KEY', 'Azimo API Key')}
                {renderInput('NIUM_API_KEY', 'Nium API Key')}
            </>)}
            {renderSection('Investment & Market Data', <>
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
            </>)}
            {renderSection('Crypto', <>
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
            </>)}
            {renderSection('Major Banks (Open Banking)', <>
              {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'JPMorgan Chase Client ID')}
              {renderInput('CITI_CLIENT_ID', 'Citi Client ID')}
              {renderInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
              {renderInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
            </>)}
            {renderSection('European & Global Banks (Open Banking)', <>
              {renderInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
              {renderInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
              {renderInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
              {renderInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            </>)}
            {renderSection('UK & European Aggregators', <>
              {renderInput('TINK_CLIENT_ID', 'Tink Client ID')}
              {renderInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
            </>)}
            {renderSection('Compliance & Identity (KYC/AML)', <>
              {renderInput('MIDDESK_API_KEY', 'Mid-Desk API Key')}
              {renderInput('ALLOY_API_TOKEN', 'Alloy API Token')}
              {renderInput('ALLOY_API_SECRET', 'Alloy API Secret')}
              {renderInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
            </>)}
            {renderSection('Real Estate', <>
              {renderInput('ZILLOW_API_KEY', 'Zillow API Key')}
              {renderInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
            </>)}
            {renderSection('Credit Bureaus', <>
              {renderInput('EXPERIAN_API_KEY', 'Experian API Key')}
              {renderInput('EQUIFAX_API_KEY', 'Equifax API Key')}
              {renderInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
            </>)}
            {renderSection('Global Payments (Emerging Markets)', <>
              {renderInput('FINCRA_API_KEY', 'Fincra API Key')}
              {renderInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
              {renderInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
              {renderInput('DLOCAL_API_KEY', 'dLocal API Key')}
              {renderInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
            </>)}
            {renderSection('Accounting & Tax', <>
                {renderInput('TAXJAR_API_KEY', 'TaxJar API Key')}
                {renderInput('AVALARA_API_KEY', 'Avalara API Key')}
                {renderInput('CODAT_API_KEY', 'Codat API Key')}
                {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
                {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
                {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
                {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
                {renderInput('FRESHBOOKS_API_KEY', 'FreshBooks API Key')}
            </>)}
            {renderSection('Fintech Utilities', <>
                {renderInput('ANVIL_API_KEY', 'Anvil API Key')}
                {renderInput('MOOV_CLIENT_ID', 'Moov Client ID')}
                {renderInput('MOOV_SECRET', 'Moov Secret')}
                {renderInput('VGS_USERNAME', 'VGS Username')}
                {renderInput('VGS_PASSWORD', 'VGS Password')}
                {renderInput('SILA_APP_HANDLE', 'Sila App Handle')}
                {renderInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
            </>)}
          </>
        )}
        
        <div className="mt-8 pt-5 border-t border-gray-200">
          <button type="submit" className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-semibold shadow-sm transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Keys to Server'}
          </button>
          {statusMessage && <p className="mt-4 font-medium p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};


// --- Basic Data Models ---

// Model for displaying system metrics
interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
}

// Model for AI-generated insights and alerts
interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization';
  message: string;
  confidence: number;
}

// Model representing a trading algorithm
interface Algorithm {
  id: string;
  name: string;
  code: string; // Represents the algorithm logic, e.g., JSON structure for a node-based editor
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high';
  aiScore: number; // AI-driven score for the algorithm's potential
  performanceMetrics?: { // Historical or backtested performance
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
  };
}

// Model for storing results of a backtesting run
interface BacktestResult {
  runId: string;
  algorithmId: string;
  startDate: string;
  endDate: string;
  equityCurve: { date: string; value: number; aiForecast: number }[]; // Time series of portfolio value
  metrics: { // Key performance indicators from the backtest
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
  };
  aiAnalysis: string; // AI-generated qualitative analysis of the results
}

// Model for user profile information
interface UserProfile {
  id: string;
  name: string;
  role: 'Trader' | 'Analyst' | 'Administrator'; // Example roles
  clearanceLevel: number; // For access control
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    aiAssistance: boolean;
  };
  stats: { // User activity statistics
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
  };
}

// --- Data Utilities ---

/**
 * Generates a mock time series data for equity curves or similar financial data.
 * @param points Number of data points to generate.
 * @param startValue Initial value for the series.
 * @param volatility Controls the random fluctuation.
 * @returns An array of objects representing the time series data.
 */
const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    // Generate dates backwards from today
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    // Introduce random fluctuations
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    // Add a slightly divergent AI prediction for demonstration
    const aiForecastValue = currentValue * (1 + (Math.random() - 0.5) * 0.02);
    data.push({
      date,
      value: Math.max(0, currentValue), // Ensure value doesn't go negative
      aiForecast: Math.max(0, aiForecastValue)
    });
  }
  return data;
};

// Mock data for AI insights/alerts
const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98 },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%.', confidence: 0.85 },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99 },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99 },
];

// Initial list of trading algorithms
const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    // Placeholder for a more complex code representation (e.g., JSON for a node editor)
    code: JSON.stringify({ nodes: ["Input: Market Stream", "Filter: Volatility > 1.5", "AI Model: Trend Predictor", "Action: Buy/Sell"] }), 
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    performanceMetrics: { return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68 }
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    code: JSON.stringify({ nodes: ["Input: Order Book", "AI: Sentiment Analysis", "Logic: Spread > 0.02%", "Action: Market Make"] }), 
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    performanceMetrics: { return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55 }
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    code: JSON.stringify({ nodes: ["Input: Global Indices", "Logic: Correlation Divergence", "Action: Hedge Pair"] }), 
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
  },
];

// Mock user profile data
const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'light', notifications: true, aiAssistance: true },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%' }
};

// --- Basic UI Components ---

// Reusable button component with different variants and icons
const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  let colorClasses = "";

  switch (variant) {
    case 'primary':
      colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300";
      break;
    case 'secondary':
      colorClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 disabled:bg-gray-100";
      break;
    case 'danger':
      colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300";
      break;
    case 'success':
      colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-300";
      break;
    case 'ghost':
      colorClasses = "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 shadow-none";
      break;
  }

  return (
    <button className={`${baseClasses} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};

// Reusable card component for structuring content
const Card = ({ title, subtitle, children, className = '', actions = null }: any) => (
  <div className={`bg-white shadow-xl rounded-xl border border-gray-100 flex flex-col ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="p-6 flex-grow overflow-auto">
      {children}
    </div>
  </div>
);

// Badge component for displaying labels or tags
const Badge = ({ children, color = 'gray' }: { children: React.ReactNode, color?: string }) => {
  const colors: any = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

// Progress bar component for visualizing progress
const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-700">{label}</span>}
      <span className="text-xs font-medium text-gray-500">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

// --- Dashboard Widgets ---

// Widget to display AI system status and metrics
const AIStatusMonitor = () => {
  // Simulated system stats
  const stats = [
    { label: 'Neural Core Load', value: 45, color: 'indigo' },
    { label: 'Global Latency', value: 12, max: 100, color: 'green' },
    { label: 'Predictive Accuracy', value: 94, color: 'purple' },
    { label: 'Security Threat Level', value: 5, color: 'red' },
  ];

  return (
    <Card title="System Status" subtitle="Real-time Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Processes</h4>
        <div className="space-y-2">
          {['Market Sentiment Analysis', 'Risk Vector Calculation', 'Liquidity Optimization', 'User Behavior Modeling'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
              <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>{proc}</span>
              <span className="text-gray-500 font-mono">PID: {2000 + i * 15}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Widget to display global market pulse and AI sentiment
const GlobalMarketPulse = () => {
  // Mock market data
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AI Sentiment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{m.price}</td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{m.change}</td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <Badge color={m.sentiment.includes('Bullish') ? 'green' : m.sentiment.includes('Bearish') ? 'red' : 'gray'}>{m.sentiment}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// No-code editor component for building trading algorithms visually
const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  // Parse the algorithm code JSON into blocks, default to empty array if invalid
  const [blocks, setBlocks] = useState<string[]>(() => {
    try {
      // Assuming algorithm.code is a JSON string like '{"nodes":["Node1", "Node2"]}'
      const parsedCode = JSON.parse(algorithm.code);
      return parsedCode.nodes || [];
    } catch (e) {
      console.error("Error parsing algorithm code:", e);
      return []; // Return empty array if parsing fails
    }
  });

  // Handler to add a new block to the algorithm
  const handleAddBlock = (type: string) => {
    // Construct a descriptive name for the new block
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : type === 'Input' ? 'Market Stream' : type === 'Logic' ? 'Condition Check' : 'Execute Trade'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    // Update the parent component with the new code representation
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  // Handler for AI-driven optimization of the algorithm
  const handleOptimize = () => {
    // Simulate optimization by adding "(Optimized)" to non-AI blocks
    const optimized = blocks.map(b => b.startsWith('AI') ? b : `${b} (Optimized by AI)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  // Handler to remove a block
  const handleDeleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg border border-gray-200">
      {/* Toolbar for adding new blocks */}
      <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Code} onClick={() => handleAddBlock('Input')} variant="secondary" className="text-xs">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" className="text-xs">Indicator</Button>
        <Button icon={Settings} onClick={() => handleAddBlock('Logic')} variant="secondary" className="text-xs">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" className="text-xs">Action</Button>
        <div className="flex-grow"></div> {/* Spacer */}
        <Button icon={RefreshCw} onClick={handleOptimize} variant="primary" className="text-xs bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      {/* Workspace for algorithm blocks */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {/* Placeholder message when no blocks are present */}
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Drag blocks or use the toolbar to build your strategy.</p>
          </div>
        )}
        {/* Render each block */}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-white border border-indigo-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Visual indicator for block type */}
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-700 ml-2">{block}</span>
            </div>
            {/* Delete button, hidden by default, shown on hover */}
            <X className="w-4 h-4 text-gray-300 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteBlock(index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for running backtests and displaying results
const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]); // State to store backtest results
  const [isBacktesting, setIsBacktesting] = useState(false); // State to track if backtest is running

  // Handler to initiate a backtest simulation
  const handleRun = useCallback(() => {
    setIsBacktesting(true); // Set loading state
    // Simulate an asynchronous backtest operation
    setTimeout(() => {
      // Generate a mock backtest result
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`, // Unique ID for the run
        algorithmId: algorithm.id,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        equityCurve: generateTimeSeries(50, 10000, 0.05), // Generate mock equity curve
        metrics: { // Generate mock performance metrics
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
        },
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5%." // Mock AI analysis
      };
      setResults([newResult, ...results]); // Add new result to the top of the list
      setIsBacktesting(false); // Reset loading state
    }, 1500); // Simulate 1.5 second delay
  }, [algorithm.id, results]);

  const latest = results[0]; // Get the most recent result for display

  return (
    <Card title="Simulation & Deployment" subtitle="Backtesting Engine">
      <div className="space-y-6">
        {/* Button to trigger the backtest */}
        <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full py-3 text-lg">
          {isBacktesting ? 'Running Simulation...' : 'Run Simulation'}
        </Button>

        {/* Display latest results if available */}
        {latest && (
          <div className="animate-fade-in">
            {/* AI Analysis section */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <h4 className="font-bold text-indigo-900 flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2" /> AI Analysis
              </h4>
              <p className="text-sm text-indigo-800 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            {/* Key Metrics display */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Total Return</div>
                <div className="text-2xl font-bold text-green-600">+{latest.metrics.totalReturn}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-blue-600">{latest.metrics.sharpeRatio}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-600">{latest.metrics.maxDrawdown}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Profit Factor</div>
                <div className="text-2xl font-bold text-purple-600">{latest.metrics.profitFactor}</div>
              </div>
            </div>
            
            {/* Equity Curve visualization (simplified) */}
            <div className="h-32 bg-gray-50 rounded border border-gray-200 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-400 hover:bg-indigo-600 transition-colors" style={{ height: `${(pt.value / 15000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Component to display a list of trading algorithms
const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" className="px-2 py-1 text-xs">New</Button>} className="h-full">
    <div className="space-y-3">
      {algorithms.map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900">{algo.name}</h4>
            <Badge color={algo.status === 'live' ? 'green' : algo.status === 'backtesting' ? 'yellow' : 'gray'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>v{algo.version}</span>
            <span className="flex items-center text-indigo-600 font-semibold"><TrendingUp className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">Return</span>
                <span className="font-medium text-green-600">+{algo.performanceMetrics.return}%</span>
              </div>
              <div>
                <span className="text-gray-400 block">Sharpe</span>
                <span className="font-medium text-gray-700">{algo.performanceMetrics.sharpe}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Win Rate</span>
                <span className="font-medium text-gray-700">{algo.performanceMetrics.winRate}%</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation Layout ---

// SVG component for Plus icon (used in AlgoList for 'New' button)
const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Define navigation items for the sidebar
const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: DollarSign },
    { name: 'Global Transactions', icon: History },
    { name: 'Liquidity Transfer', icon: DollarSign }, // Reusing DollarSign as Send is not imported
    { name: 'Budgetary Control', icon: TrendingUp }, // Reusing TrendingUp as Target not imported
    { name: 'Strategic Goals', icon: TrendingUp },
    { name: 'Credit Health Monitor', icon: TrendingUp }, // Reusing TrendingUp as Heart not imported
    { name: 'Investment Portfolio', icon: TrendingUp },
    { name: 'Web3 & Crypto Bridge', icon: TrendingUp }, // Reusing TrendingUp as Crypto not imported
    { name: 'Algo-Trading Lab', icon: Code, current: true }, // Mark Algo-Trading Lab as current
    { name: 'Forex Arbitrage Arena', icon: TrendingUp }, // Reusing TrendingUp as Scale not imported
    { name: 'Commodities Exchange', icon: TrendingUp }, // Reusing TrendingUp as Wheat not imported
    { name: 'Real Estate Empire', icon: TrendingUp }, // Reusing TrendingUp as Building not imported
    { name: 'Art & NFT Vault', icon: TrendingUp }, // Reusing TrendingUp as Palette not imported
    { name: 'Derivatives Desk', icon: TrendingUp }, // Reusing TrendingUp as PieChart not imported
    { name: 'Venture Capital', icon: TrendingUp }, // Reusing TrendingUp as Rocket not imported
    { name: 'Private Equity', icon: TrendingUp }, // Reusing TrendingUp as Briefcase not imported
    { name: 'Tax Optimization AI', icon: TrendingUp }, // Reusing TrendingUp as Receipt not imported
    { name: 'Legacy Planning', icon: TrendingUp }, // Reusing TrendingUp as Legacy not imported
    { name: 'Corporate Treasury', icon: TrendingUp }, // Reusing TrendingUp as Globe not imported
    { name: 'Modern Treasury API', icon: TrendingUp }, // Reusing TrendingUp as Key not imported
    { name: 'Card Issuance (Marqeta)', icon: TrendingUp }, // Reusing TrendingUp as CreditCard not imported
    { name: 'Data Aggregation (Plaid)', icon: TrendingUp }, // Reusing TrendingUp as Link not imported
    { name: 'Payment Rails (Stripe)', icon: TrendingUp }, // Reusing TrendingUp as Zap not imported
    { name: 'Identity (SSO)', icon: TrendingUp }, // Reusing TrendingUp as Lock not imported
    { name: 'AI Financial Advisor', icon: TrendingUp }, // Reusing TrendingUp as Brain not imported
    { name: 'Quantum Weaver AI', icon: TrendingUp }, // Reusing TrendingUp as Atom not imported
    { name: 'Agent Marketplace', icon: TrendingUp }, // Reusing TrendingUp as Users not imported
    { name: 'Ad Studio AI', icon: TrendingUp }, // Reusing TrendingUp as Megaphone not imported
    { name: 'Card Customization', icon: TrendingUp }, // Reusing TrendingUp as CreditCard not imported
    { name: 'DAO Governance', icon: TrendingUp }, // Reusing TrendingUp as Handshake not imported
    { name: 'Open Banking API', icon: TrendingUp }, // Reusing TrendingUp as Link not imported
    { name: 'System Status', icon: TrendingUp }, // Reusing TrendingUp as Activity not imported
    { name: 'API Settings', icon: Settings },
    { name: 'Concierge', icon: TrendingUp }, // Reusing TrendingUp as Phone not imported
    { name: 'Philanthropy', icon: TrendingUp }, // Reusing TrendingUp as Heart not imported
    { name: 'Wealth Management', icon: TrendingUp }, // Reusing TrendingUp as Crown not imported
    { name: 'Security Center', icon: TrendingUp }, // Reusing TrendingUp as Shield not imported
    { name: 'Personalization', icon: TrendingUp }, // Reusing TrendingUp as Sparkles not imported
    { name: 'System Manifesto', icon: TrendingUp }, // Reusing TrendingUp as Eye not imported
];

// Sidebar component for application navigation
const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse

    return (
        // Sidebar container with transition for collapse animation
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Header section with logo and collapse button */}
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900">
                {!isCollapsed && (
                  <div>
                    {/* Application Title */}
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">TRADING OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">Trading Dashboard</p>
                  </div>
                )}
                {/* Collapse/Expand button */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            {/* User Profile section */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">
                        TR {/* Initials */}
                    </div>
                    {/* User Name and Status (visible when not collapsed) */}
                    {!isCollapsed && (
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-200 truncate">Trader</p>
                        <p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Online</p>
                      </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon; // Get the icon component
                    const isActive = item.name === activeView; // Check if the item is the currently active view
                    return (
                        <a
                            key={item.name}
                            href="#" // Prevent default anchor behavior
                            onClick={(e) => { e.preventDefault(); onNavigate(item.name); }} // Handle navigation click
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            {/* Navigation item name, hidden when collapsed */}
                            <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                {item.name}
                            </span>
                            {/* Active indicator dot */}
                            {!isCollapsed && isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </a>
                    );
                })}
            </nav>
            
            {/* Footer with version and status */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v10.4.2-Personal | Secure Connection"}
            </div>
        </div>
    );
}

// Component displaying system information/manifesto
const SystemManifesto = () => (
  <Card title="System Information" className="h-full overflow-y-auto">
    {/* Using Tailwind Typography for better prose rendering */}
    <div className="prose prose-lg max-w-none text-gray-700 p-4">
      <h3 className="text-2xl font-bold text-indigo-900 border-b pb-2 mb-4">System Overview</h3>
      <p className="mb-4">
        This application serves as a dashboard for algorithmic trading and financial monitoring.
      </p>
      {/* Feature highlights */}
      <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600 my-6">
        <h4 className="text-lg font-bold text-indigo-800 mb-2">Key Features</h4>
        <ul className="list-disc list-inside space-y-2 text-indigo-900">
          <li><strong>Monitoring:</strong> Real-time system and market tracking.</li>
          <li><strong>Strategy:</strong> Algorithm creation and backtesting.</li>
          <li><strong>Management:</strong> Portfolio and resource oversight.</li>
        </ul>
      </div>
      <p className="mb-4">
        Designed for efficiency and clarity in financial operations.
      </p>
    </div>
  </Card>
);

// --- Main Layout ---

// Main component for the Algo Trading Lab section of the application
const AlgoTradingLab: React.FC = () => {
  // State for managing the list of algorithms
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  // State for the ID of the currently selected algorithm
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(initialAlgorithms[0].id);
  // State for the currently active view in the main content area
  const [currentView, setCurrentView] = useState('Algo-Trading Lab');
  // State for notifications (AI insights)
  const [notifications, setNotifications] = useState<AIInsight[]>(mockInsights);

  // Memoized selection of the current algorithm based on selectedAlgoId
  const selectedAlgorithm = useMemo(() => algorithms.find(a => a.id === selectedAlgoId) || initialAlgorithms[0], [algorithms, selectedAlgoId]);

  // Callback to update the code of the selected algorithm
  const handleUpdateCode = useCallback((code: string) => {
    setAlgorithms(prev => prev.map(a => 
      a.id === selectedAlgoId 
        ? { ...a, code, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } // Update code and status
        : a
    ));
  }, [selectedAlgoId]);

  // Callback to create a new algorithm
  const handleCreate = useCallback(() => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`, // Generate unique ID
      name: `New Strategy ${algorithms.length + 1}`, // Default name
      code: JSON.stringify({ nodes: [] }), // Default empty code structure
      status: 'draft', // Initial status
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'low',
      aiScore: 50
    };
    setAlgorithms([...algorithms, newAlgo]); // Add new algorithm to the list
    setSelectedAlgoId(newAlgo.id); // Select the newly created algorithm
  }, [algorithms]);

  // Function to render the main content based on the currentView state
  const renderContent = () => {
    switch (currentView) {
      case 'System Manifesto':
        return <SystemManifesto />; // Render System Manifesto
      case 'API Settings':
        return <ApiSettings />; // Render API Settings
      case 'Executive Dashboard':
        // Layout for the Executive Dashboard
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-10">
            <AIStatusMonitor /> {/* AI Status Widget */}
            <GlobalMarketPulse /> {/* Market Pulse Widget */}
            <div className="lg:col-span-2">
               {/* System-Wide Alerts Card */}
               <Card title="System-Wide Alerts" subtitle="AI Detected Anomalies">
                 <div className="space-y-2">
                   {notifications.map(n => (
                     <div key={n.id} className={`p-3 rounded border-l-4 flex justify-between items-center ${n.severity === 'critical' ? 'bg-red-50 border-red-500' : n.severity === 'high' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
                       <div>
                         <span className="font-bold text-gray-800 block">{n.category.toUpperCase()} ALERT</span>
                         <span className="text-sm text-gray-600">{n.message}</span>
                       </div>
                       <Badge color={n.severity === 'critical' ? 'red' : 'blue'}>{n.confidence * 100}% Conf.</Badge>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
          </div>
        );
      case 'Algo-Trading Lab':
        // Layout for the Algo Trading Lab view
        return (
          <div className="flex flex-col h-full space-y-6 overflow-hidden">
            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
              {/* Algo List Panel */}
              <div className="col-span-12 lg:col-span-3 h-full overflow-hidden flex flex-col">
                <AlgoList algorithms={algorithms} selectedAlgo={selectedAlgorithm} onSelect={(a: Algorithm) => setSelectedAlgoId(a.id)} onCreate={handleCreate} />
              </div>
              {/* Editor Panel */}
              <div className="col-span-12 lg:col-span-6 h-full overflow-hidden flex flex-col">
                <Card title={`Editor: ${selectedAlgorithm.name}`} subtitle={`v${selectedAlgorithm.version} - ${selectedAlgorithm.status.toUpperCase()}`} className="h-full flex flex-col">
                  <NoCodeEditor algorithm={selectedAlgorithm} onUpdateCode={handleUpdateCode} />
                </Card>
              </div>
              {/* Backtester Panel */}
              <div className="col-span-12 lg:col-span-3 h-full overflow-hidden flex flex-col">
                <Backtester algorithm={selectedAlgorithm} />
              </div>
            </div>
          </div>
        );
      default:
        // Default view for unhandled states or loading
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Settings className="w-12 h-12 text-indigo-600 animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentView}</h2>
            <p className="text-gray-500 max-w-md mb-8">This module is currently initializing. Connection in progress...</p>
            <Button icon={RefreshCw} onClick={() => {}} variant="primary">Retry Connection</Button>
          </div>
        );
    }
  };

  // Main application render function
  return (
    <div className="h-screen w-full flex bg-gray-100 font-sans overflow-hidden text-gray-900">
      {/* App Sidebar */}
      <AppSidebar onNavigate={setCurrentView} activeView={currentView} />
      
      {/* Main content area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center">
            {/* Current View Title */}
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{currentView}</h2>
            {/* Active Session Indicator for Algo-Trading Lab */}
            {currentView === 'Algo-Trading Lab' && <span className="ml-3 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">ACTIVE SESSION</span>}
          </div>
          {/* Right-aligned header elements */}
          <div className="flex items-center space-x-4">
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">System Optimal</span>
            </div>
            {/* History Button with Notification Dot */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <History className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* User Profile Button */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
            {/* Logout Button */}
            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" onClick={() => alert("Secure Logout Initiated")}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-grow p-6 overflow-hidden relative">
          {renderContent()} {/* Render content based on currentView */}
        </main>
      </div>
    </div>
  );
};

export default AlgoTradingLab;