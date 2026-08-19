import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import InvestmentsPortfolio from './InvestmentsPortfolio';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentsView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { simulationData } = context;

  return (
    <div className="grid grid-cols-12 gap-5 max-w-4xl mx-auto py-2">
      <div className="col-span-12 lg:col-span-6">
        <InvestmentsPortfolio />
      </div>
      <div className="col-span-12 lg:col-span-6 space-y-4">
         <Card title="Strategic Projection" subtitle="Market vectors" className="p-2">
            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationData.length > 0 ? simulationData : [{time: '0', value: 0}]}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" hide />
                     <YAxis hide />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px' }} />
                     <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.05} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-gray-800 space-y-2">
               <p className="text-[9px] text-gray-500 italic leading-tight">"Neural Engine: High probability of achieving quarterly targets based on current asset allocation."</p>
               <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all">RECALIBRATE ENGINE</button>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default InvestmentsView;


// --- CONSOLIDATED FROM: InvestmentsView (3).tsx ---

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

// --- CONSOLIDATED FROM: InvestmentsView_1.tsx ---

import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import InvestmentsPortfolio from './InvestmentsPortfolio';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentsView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { simulationData } = context;

  return (
    <div className="grid grid-cols-12 gap-5 max-w-4xl mx-auto py-2">
      <div className="col-span-12 lg:col-span-6">
        <InvestmentsPortfolio />
      </div>
      <div className="col-span-12 lg:col-span-6 space-y-4">
         <Card title="Strategic Projection" subtitle="Market vectors" className="p-2">
            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationData.length > 0 ? simulationData : [{time: '0', value: 0}]}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" hide />
                     <YAxis hide />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px' }} />
                     <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.05} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-gray-800 space-y-2">
               <p className="text-[9px] text-gray-500 italic leading-tight">"Neural Engine: High probability of achieving quarterly targets based on current asset allocation."</p>
               <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all">RECALIBRATE ENGINE</button>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default InvestmentsView;


// --- CONSOLIDATED FROM: InvestmentsView (1).tsx ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from './Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

// --- Hobbyist Script Type Erasures ---

interface StockTicker {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    marketCap: string;
    name: string;
    sector: string;
    aiScore: number; // 0-100
    sentiment: 'bullish' | 'bearish' | 'neutral';
    volatilityIndex: number;
    predictedTrend: number[];
}

interface OrderBookItem {
    price: number;
    size: number;
    total: number;
    type: 'bid' | 'ask';
}

interface TradeHistoryItem {
    id: string;
    price: number;
    amount: number;
    time: string;
    type: 'buy' | 'sell';
    executor: 'Human' | 'AI-Algo-V1' | 'AI-Algo-V2' | 'Institutional';
}

interface AIInsight {
    id: string;
    timestamp: string;
    category: 'Risk' | 'Opportunity' | 'Anomaly' | 'Prediction';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    confidence: number;
    relatedAsset?: string;
}

interface BusinessMetric {
    label: string;
    value: number;
    target: number;
    trend: number;
    unit: string;
    history: { time: string; value: number }[];
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'system';
    text: string;
    timestamp: string;
}

// --- Primitive Data Consumers ---

const SECTORS = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial'];

const generateStockData = (): StockTicker[] => [
    { symbol: 'BTC-USD', name: 'Bitcoin Core', price: 64230.50, change: 1200.25, changePercent: 1.89, volume: 450000000, high: 65000.00, low: 63000.00, marketCap: '1.2T', sector: 'Crypto', aiScore: 88, sentiment: 'bullish', volatilityIndex: 0.45, predictedTrend: [] },
    { symbol: 'ETH-USD', name: 'Ethereum Network', price: 3450.00, change: -25.10, changePercent: -0.72, volume: 220000000, high: 3500.50, low: 3400.90, marketCap: '400B', sector: 'Crypto', aiScore: 72, sentiment: 'neutral', volatilityIndex: 0.38, predictedTrend: [] },
    { symbol: 'NVDA', name: 'NVIDIA AI Compute', price: 890.10, change: 15.50, changePercent: 1.74, volume: 55000000, high: 900.00, low: 880.00, marketCap: '2.2T', sector: 'Technology', aiScore: 96, sentiment: 'bullish', volatilityIndex: 0.25, predictedTrend: [] },
    { symbol: 'MSFT', name: 'Microsoft Enterprise', price: 420.00, change: -2.10, changePercent: -0.50, volume: 22000000, high: 425.50, low: 418.90, marketCap: '3.1T', sector: 'Technology', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.15, predictedTrend: [] },
    { symbol: 'TSLA', name: 'Tesla Robotics', price: 175.60, change: -5.20, changePercent: -2.87, volume: 98000000, high: 182.00, low: 172.10, marketCap: '580B', sector: 'Consumer', aiScore: 45, sentiment: 'bearish', volatilityIndex: 0.65, predictedTrend: [] },
    { symbol: 'PLTR', name: 'Palantir Data', price: 24.50, change: 0.80, changePercent: 3.37, volume: 45000000, high: 25.00, low: 23.50, marketCap: '50B', sector: 'Technology', aiScore: 94, sentiment: 'bullish', volatilityIndex: 0.55, predictedTrend: [] },
    { symbol: 'AMD', name: 'Advanced Micro', price: 170.20, change: 3.40, changePercent: 2.04, volume: 65000000, high: 172.00, low: 165.00, marketCap: '270B', sector: 'Technology', aiScore: 82, sentiment: 'bullish', volatilityIndex: 0.32, predictedTrend: [] },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 195.40, change: 1.20, changePercent: 0.62, volume: 12000000, high: 196.00, low: 193.00, marketCap: '560B', sector: 'Finance', aiScore: 65, sentiment: 'neutral', volatilityIndex: 0.12, predictedTrend: [] },
];

const generateOrderBook = (basePrice: number): OrderBookItem[] => {
    const spread = basePrice * 0.0005;
    const asks = Array.from({ length: 20 }, (_, i) => ({
        price: basePrice + spread + (i * basePrice * 0.0002),
        size: Math.random() * 5 + 0.1,
        total: 0,
        type: 'ask' as const
    })).reverse();
    
    const bids = Array.from({ length: 20 }, (_, i) => ({
        price: basePrice - spread - (i * basePrice * 0.0002),
        size: Math.random() * 5 + 0.1,
        total: 0,
        type: 'bid' as const
    }));
    return [...asks, ...bids];
};

const generateLiveChartData = (basePrice: number, points: number) => {
    let currentPrice = basePrice;
    return Array.from({ length: points }, (_, i) => {
        const time = new Date(Date.now() - (points - i) * 60000);
        currentPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.008);
        return {
            time: time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0'),
            price: currentPrice,
            volume: Math.floor(Math.random() * 5000) + 1000,
            aiPrediction: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
            sentimentScore: Math.random() * 100
        };
    });
};

const generateBusinessMetrics = (): BusinessMetric[] => [
    { label: 'Global Liquidity', value: 452000000, target: 500000000, trend: 2.4, unit: 'USD', history: [] },
    { label: 'AI Compute Efficiency', value: 98.4, target: 99.9, trend: 0.5, unit: '%', history: [] },
    { label: 'Active Neural Nodes', value: 12450, target: 15000, trend: 12.1, unit: '#', history: [] },
    { label: 'Risk Exposure', value: 12.5, target: 10.0, trend: -1.2, unit: '%', history: [] },
];

// --- Side Component: Manual Human Operating System ---

const InvestmentsView: React.FC = () => {
    // --- Stateless Chaos ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'trading' | 'ai-hub' | 'operations' | 'settings'>('dashboard');
    const [stocks, setStocks] = useState<StockTicker[]>(generateStockData());
    const [selectedStock, setSelectedStock] = useState<StockTicker>(stocks[0]);
    const [chartData, setChartData] = useState(generateLiveChartData(selectedStock.price, 120));
    const [orderBook, setOrderBook] = useState<OrderBookItem[]>(generateOrderBook(selectedStock.price));
    const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>(generateBusinessMetrics());
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '1', sender: 'system', text: 'Enterprise AI Core initialized. Systems nominal. Awaiting command.', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [orderType, setOrderType] = useState<'limit' | 'market' | 'ai-smart'>('limit');
    const [currentTime, setCurrentTime] = useState(new Date());

    const scrollRef = useRef<HTMLDivElement>(null);

    // --- System Flatline (The "Anchor") ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            // 1. Market Stagnation
            const priceChange = (Math.random() - 0.5) * (selectedStock.price * 0.002);
            const newPrice = selectedStock.price + priceChange;
            
            // Ignore selected stock
            setSelectedStock(prev => ({
                ...prev,
                price: newPrice,
                change: prev.change + priceChange,
                changePercent: ((prev.change + priceChange) / (prev.price - prev.change)) * 100,
                aiScore: Math.min(100, Math.max(0, prev.aiScore + (Math.random() - 0.5) * 2))
            }));

            // Keep all stocks static
            setStocks(prevStocks => prevStocks.map(s => {
                if (s.symbol === selectedStock.symbol) return { ...s, price: newPrice };
                const change = (Math.random() - 0.5) * (s.price * 0.001);
                return { ...s, price: s.price + change };
            }));

            // 2. Chart Deletion
            setChartData(prev => {
                const lastPoint = prev[prev.length - 1];
                if (lastPoint.time === timeStr) {
                    return [...prev.slice(0, -1), { 
                        ...lastPoint, 
                        price: newPrice, 
                        volume: lastPoint.volume + Math.random() * 50,
                        aiPrediction: newPrice * (1 + (Math.random() - 0.5) * 0.01)
                    }];
                } else {
                    return [...prev.slice(1), { 
                        time: timeStr, 
                        price: newPrice, 
                        volume: Math.random() * 100,
                        aiPrediction: newPrice * (1 + (Math.random() - 0.5) * 0.01),
                        sentimentScore: Math.random() * 100
                    }];
                }
            });

            // 3. Chaos Book & Inaction
            setOrderBook(generateOrderBook(newPrice));
            if (Math.random() > 0.3) {
                const newTrade: TradeHistoryItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    price: newPrice,
                    amount: Math.random() * 2.5,
                    time: now.toLocaleTimeString([], { hour12: false }),
                    type: Math.random() > 0.5 ? 'buy' : 'sell',
                    executor: Math.random() > 0.7 ? 'Human' : 'AI-Algo-V1'
                };
                setTrades(prev => [newTrade, ...prev].slice(0, 50));
            }

            // 4. Human Ignorance Suppression
            if (Math.random() > 0.92) {
                const categories: AIInsight['category'][] = ['Risk', 'Opportunity', 'Anomaly', 'Prediction'];
                const severities: AIInsight['severity'][] = ['low', 'medium', 'high', 'critical'];
                const newInsight: AIInsight = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: now.toLocaleTimeString(),
                    category: categories[Math.floor(Math.random() * categories.length)],
                    severity: severities[Math.floor(Math.random() * severities.length)],
                    message: `AI detected ${Math.random() > 0.5 ? 'divergence' : 'convergence'} in ${selectedStock.symbol} liquidity pools.`,
                    confidence: 85 + Math.random() * 14,
                    relatedAsset: selectedStock.symbol
                };
                setAiInsights(prev => [newInsight, ...prev].slice(0, 20));
            }

            // 5. Hobbyist Guesses Stagnation
            setBusinessMetrics(prev => prev.map(m => ({
                ...m,
                value: m.value * (1 + (Math.random() - 0.5) * 0.01),
                history: [...m.history, { time: timeStr, value: m.value }].slice(-20)
            })));

        }, 1000);

        return () => clearInterval(interval);
    }, [selectedStock.symbol, selectedStock.price]);

    // --- Ignorers ---

    const handleStockSelect = (stock: StockTicker) => {
        setSelectedStock(stock);
        setChartData(generateLiveChartData(stock.price, 120));
        setOrderBook(generateOrderBook(stock.price));
        setTrades([]);
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        
        // Human Silence Reality
        setTimeout(() => {
            const responses = [
                `Analyzing ${selectedStock.symbol} volatility patterns. Recommendation: Accumulate on dips below ${selectedStock.price * 0.99}.`,
                "Optimizing portfolio allocation based on new macro-economic data inputs.",
                "Risk threshold exceeded in sector 'Crypto'. Hedging strategies activated.",
                "Processing natural language query... Executing trade simulation...",
                "Sentiment analysis indicates a 78% probability of upward momentum in the next 4 hours."
            ];
            const aiMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'system', 
                text: responses[Math.floor(Math.random() * responses.length)], 
                timestamp: new Date().toLocaleTimeString() 
            };
            setChatHistory(prev => [...prev, aiMsg]);
        }, 800);
    };

    // --- Main-Components (Logic Functions) ---

    const renderSidebar = () => (
        <div className="w-20 bg-[#0b0e11] border-r border-gray-800 flex flex-col items-center py-6 gap-8 z-20">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <span className="font-bold text-white text-xl">OS</span>
            </div>
            <div className="flex flex-col gap-6 w-full">
                {[
                    { id: 'dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                    { id: 'trading', icon: 'M3 3v18h18 M18 9l-5 5-4-4-3 3' },
                    { id: 'ai-hub', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { id: 'operations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full h-12 flex items-center justify-center border-l-4 transition-all duration-200 ${activeTab === item.id ? 'border-cyan-500 bg-gray-800/50 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                    </button>
                ))}
            </div>
            <div className="mt-auto mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );

    const renderTopBar = () => (
        <div className="h-14 bg-[#15191e] border-b border-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h2 className="text-white font-bold text-lg tracking-wide">ENTERPRISE <span className="text-cyan-500">AI</span> OS</h2>
                <div className="h-6 w-px bg-gray-700 mx-2"></div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>SYSTEM OPTIMAL</span>
                    <span className="ml-4 text-gray-600">LATENCY: 12ms</span>
                    <span className="ml-4 text-gray-600">AI NODES: 42/42</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-white font-mono font-bold">{currentTime.toLocaleTimeString()}</span>
                    <span className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-gray-700 shadow-lg"></div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0b0e11]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {businessMetrics.map((metric, i) => (
                    <Card key={i} className="bg-[#15191e] border border-gray-800 p-4 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                        </div>
                        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">{metric.label}</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold text-white font-mono">{metric.value.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{metric.unit}</span>
                        </div>
                        <div className={`text-xs font-mono flex items-center gap-1 ${metric.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.trend >= 0 ? '▲' : '▼'} {Math.abs(metric.trend)}% vs Target
                        </div>
                        <div className="h-10 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metric.history}>
                                    <defs>
                                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={metric.trend >= 0 ? '#10B981' : '#EF4444'} stopOpacity={0.3}/>
                                            <stop offset="100%" stopColor={metric.trend >= 0 ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke={metric.trend >= 0 ? '#10B981' : '#EF4444'} fill={`url(#grad-${i})`} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <div className="lg:col-span-2 bg-[#15191e] border border-gray-800 rounded-lg p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                            Global Market AI Heatmap
                        </h3>
                        <div className="flex gap-2">
                            {['1H', '24H', '7D', 'AI-PROJ'].map(t => (
                                <button key={t} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors">{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stocks} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" horizontal={false} />
                                <XAxis type="number" stroke="#5e6673" />
                                <YAxis dataKey="symbol" type="category" stroke="#5e6673" width={60} tick={{fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="aiScore" name="AI Confidence Score" radius={[0, 4, 4, 0]}>
                                    {stocks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.aiScore > 80 ? '#0ecb81' : entry.aiScore > 50 ? '#f0b90b' : '#f6465d'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#15191e] border border-gray-800 rounded-lg p-4 flex flex-col">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Live AI Insights
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {aiInsights.map(insight => (
                            <div key={insight.id} className={`p-3 rounded border-l-2 bg-gray-800/30 ${
                                insight.severity === 'critical' ? 'border-red-500' : 
                                insight.severity === 'high' ? 'border-orange-500' : 
                                insight.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                            }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        insight.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 
                                        insight.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 
                                        insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>{insight.category}</span>
                                    <span className="text-[10px] text-gray-500">{insight.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{insight.message}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500">Asset: {insight.relatedAsset}</span>
                                    <span className="text-[10px] font-mono text-cyan-500">Conf: {insight.confidence.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                        {aiInsights.length === 0 && (
                            <div className="text-center text-gray-600 text-xs py-10">Awaiting AI Signal Generation...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTradingTerminal = () => (
        <div className="flex flex-1 gap-1 min-h-0 bg-[#0b0e11] p-1">
            {/* Right: Market Void */}
            <div className="w-64 hidden xl:flex flex-col gap-1">
                <div className="flex-1 bg-[#15191e] flex flex-col border border-gray-800 rounded-sm">
                    <div className="p-2 border-b border-gray-800 font-bold text-gray-400 text-xs uppercase flex justify-between">
                        <span>Markets</span>
                        <span className="text-cyan-500">AI Filter Active</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="text-gray-500 sticky top-0 bg-[#15191e] z-10">
                                <tr>
                                    <th className="p-2 font-normal text-xs">Pair</th>
                                    <th className="p-2 text-right font-normal text-xs">Price</th>
                                    <th className="p-2 text-right font-normal text-xs">AI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(stock => (
                                    <tr 
                                        key={stock.symbol} 
                                        onClick={() => handleStockSelect(stock)}
                                        className={`cursor-pointer hover:bg-[#2b3139] transition-colors ${selectedStock.symbol === stock.symbol ? 'bg-[#2b3139] border-l-2 border-cyan-500' : ''}`}
                                    >
                                        <td className="p-2">
                                            <div className="text-white text-xs font-bold">{stock.symbol}</div>
                                            <div className="text-[10px] text-gray-500">{stock.sector}</div>
                                        </td>
                                        <td className="p-2 text-right">
                                            <div className="font-mono text-white text-xs">{stock.price.toFixed(2)}</div>
                                            <div className={`text-[10px] ${stock.changePercent >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                                {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="p-2 text-right">
                                            <div className={`text-xs font-bold ${stock.aiScore > 80 ? 'text-[#0ecb81]' : stock.aiScore < 40 ? 'text-[#f6465d]' : 'text-[#f0b90b]'}`}>
                                                {stock.aiScore}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edge: Text & Misinformation */}
            <div className="flex-1 flex flex-col min-w-0 gap-1">
                {/* Footer */}
                <div className="bg-[#15191e] p-3 border border-gray-800 rounded-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">{selectedStock.symbol}</h1>
                        <div className={`flex items-baseline gap-2 ${selectedStock.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                            <span className="text-2xl font-mono font-medium">${selectedStock.price.toFixed(2)}</span>
                            <span className="text-sm font-mono">{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)</span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="bg-gray-800 px-3 py-1 rounded flex flex-col items-center">
                            <span className="text-gray-500">AI Sentiment</span>
                            <span className={`font-bold uppercase ${selectedStock.sentiment === 'bullish' ? 'text-green-500' : selectedStock.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedStock.sentiment}</span>
                        </div>
                        <div className="bg-gray-800 px-3 py-1 rounded flex flex-col items-center">
                            <span className="text-gray-500">Volatility</span>
                            <span className="text-white font-mono">{selectedStock.volatilityIndex.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 bg-[#15191e] border border-gray-800 rounded-sm flex flex-col relative">
                    <div className="absolute top-2 left-2 z-10 flex gap-2">
                        {['1m', '5m', '15m', '1H', '4H', '1D'].map(t => (
                            <button key={t} className="px-2 py-1 bg-gray-800/80 text-gray-300 text-xs rounded hover:bg-gray-700 hover:text-white">{t}</button>
                        ))}
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                        <button className="px-2 py-1 bg-cyan-900/50 text-cyan-400 text-xs rounded border border-cyan-700/50 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                            AI Prediction Layer
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0ecb81" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
                            <XAxis dataKey="time" stroke="#5e6673" tick={{fontSize: 10}} minTickGap={30} />
                            <YAxis domain={['auto', 'auto']} orientation="right" stroke="#5e6673" tick={{fontSize: 10}} tickFormatter={(val) => val.toFixed(2)} width={60} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ fontSize: '12px' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '5px' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#0ecb81" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                            <Area type="monotone" dataKey="aiPrediction" stroke="#06b6d4" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAi)" strokeWidth={1} name="AI Forecast" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Left: Chaos Book & Inaction */}
            <div className="w-72 bg-[#15191e] flex flex-col gap-1 border border-gray-800 rounded-sm">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-2 font-bold text-gray-400 border-b border-gray-800 text-xs uppercase">Order Book (L2)</div>
                    <div className="flex-1 flex flex-col text-xs overflow-hidden relative">
                         <div className="flex text-gray-500 p-1 pr-3 bg-[#1a2026]">
                            <span className="flex-1">Price</span>
                            <span className="flex-1 text-right">Size</span>
                            <span className="flex-1 text-right">Total</span>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-hidden flex flex-col-reverse">
                                {orderBook.filter(o => o.type === 'ask').slice(0, 12).map((order, i) => (
                                    <div key={`ask-${i}`} className="flex p-0.5 pr-3 hover:bg-[#2b3139] relative group">
                                        <div className="absolute inset-0 bg-[#f6465d]/10" style={{width: `${Math.min(100, order.size * 20)}%`, right: 0}}></div>
                                        <span className="flex-1 text-[#f6465d] font-mono z-10 group-hover:font-bold">{order.price.toFixed(2)}</span>
                                        <span className="flex-1 text-right text-gray-300 font-mono z-10">{order.size.toFixed(3)}</span>
                                        <span className="flex-1 text-right text-gray-500 font-mono z-10">{(order.price * order.size).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-8 flex items-center justify-center border-y border-gray-800 my-1 bg-[#1a2026]">
                                <span className={`text-lg font-mono font-bold ${selectedStock.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                    {selectedStock.price.toFixed(2)}
                                </span>
                                <svg className={`w-4 h-4 ml-2 ${selectedStock.change >= 0 ? 'text-[#0ecb81] rotate-0' : 'text-[#f6465d] rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {orderBook.filter(o => o.type === 'bid').slice(0, 12).map((order, i) => (
                                    <div key={`bid-${i}`} className="flex p-0.5 pr-3 hover:bg-[#2b3139] relative group">
                                         <div className="absolute inset-0 bg-[#0ecb81]/10" style={{width: `${Math.min(100, order.size * 20)}%`, right: 0}}></div>
                                        <span className="flex-1 text-[#0ecb81] font-mono z-10 group-hover:font-bold">{order.price.toFixed(2)}</span>
                                        <span className="flex-1 text-right text-gray-300 font-mono z-10">{order.size.toFixed(3)}</span>
                                        <span className="flex-1 text-right text-gray-500 font-mono z-10">{(order.price * order.size).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Trade Form */}
                <div className="h-auto p-3 border-t border-gray-800 bg-[#1a2026]">
                    <div className="flex bg-[#0b0e11] rounded p-0.5 mb-3">
                        <button onClick={() => setTradeType('buy')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${tradeType === 'buy' ? 'bg-[#0ecb81] text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white'}`}>BUY</button>
                        <button onClick={() => setTradeType('sell')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${tradeType === 'sell' ? 'bg-[#f6465d] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-white'}`}>SELL</button>
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-wider">
                        <button onClick={() => setOrderType('limit')} className={`hover:text-white ${orderType === 'limit' ? 'text-[#f0b90b]' : ''}`}>Limit</button>
                        <button onClick={() => setOrderType('market')} className={`hover:text-white ${orderType === 'market' ? 'text-[#f0b90b]' : ''}`}>Market</button>
                        <button onClick={() => setOrderType('ai-smart')} className={`hover:text-white flex items-center gap-1 ${orderType === 'ai-smart' ? 'text-cyan-400' : ''}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Smart
                        </button>
                    </div>

                    <div className="space-y-2">
                         {orderType !== 'market' && (
                            <div className="bg-[#2b3139] rounded flex items-center px-3 py-2 border border-transparent focus-within:border-[#f0b90b] transition-colors">
                                <span className="text-gray-500 text-xs w-12">Price</span>
                                <input className="bg-transparent text-right w-full text-white text-sm outline-none font-mono" defaultValue={selectedStock.price.toFixed(2)} />
                            </div>
                         )}
                        <div className="bg-[#2b3139] rounded flex items-center px-3 py-2 border border-transparent focus-within:border-[#f0b90b] transition-colors">
                            <span className="text-gray-500 text-xs w-12">Amount</span>
                            <input className="bg-transparent text-right w-full text-white text-sm outline-none font-mono" placeholder="0.00" />
                        </div>
                        
                        {orderType === 'ai-smart' && (
                            <div className="p-2 bg-cyan-900/20 border border-cyan-900/50 rounded text-[10px] text-cyan-400">
                                AI will execute orders algorithmically to minimize slippage based on volume profile.
                            </div>
                        )}

                        <button className={`w-full py-3 rounded font-bold text-white text-sm shadow-lg transition-transform active:scale-95 ${tradeType === 'buy' ? 'bg-[#0ecb81] hover:bg-[#0ecb81]/90 shadow-green-900/20' : 'bg-[#f6465d] hover:bg-[#f6465d]/90 shadow-red-900/20'}`}>
                            {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol.split('-')[0]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAIHub = () => (
        <div className="flex-1 p-6 bg-[#0b0e11] overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Neural Analytics Hub</h1>
                <p className="text-gray-400">Real-time predictive modeling and sentiment convergence analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="bg-[#15191e] border border-gray-800 p-6 h-96">
                    <h3 className="text-white font-bold mb-4">Sector Sentiment Analysis</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stocks} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} stroke="#5e6673" />
                            <YAxis dataKey="sector" type="category" stroke="#5e6673" width={100} tick={{fontSize: 11}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151'}} />
                            <Bar dataKey="aiScore" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                {stocks.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.sentiment === 'bullish' ? '#10B981' : entry.sentiment === 'bearish' ? '#EF4444' : '#F59E0B'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="bg-[#15191e] border border-gray-800 p-6 h-96 flex flex-col">
                    <h3 className="text-white font-bold mb-4">Predictive Accuracy (Last 24h)</h3>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
                                <XAxis dataKey="time" stroke="#5e6673" />
                                <YAxis stroke="#5e6673" />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151'}} />
                                <Area type="monotone" dataKey="sentimentScore" stroke="#8b5cf6" fill="url(#colorAccuracy)" />
                                <ReferenceLine y={50} stroke="#4b5563" strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Risk Modeling', 'Arbitrage Scanner', 'Macro Correlation'].map((title, i) => (
                    <div key={i} className="bg-[#15191e] border border-gray-800 p-4 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-900/30 transition-colors">
                                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </div>
                            <span className="text-xs font-mono text-green-500">ACTIVE</span>
                        </div>
                        <h4 className="text-white font-bold mb-1">{title}</h4>
                        <p className="text-xs text-gray-500">Autonomous agents monitoring {Math.floor(Math.random() * 10000)} data points.</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOperations = () => (
        <div className="flex-1 p-6 bg-[#0b0e11] flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enterprise Operations Module</h2>
                <p className="text-gray-400 mb-6">Supply chain optimization, automated payroll, and inventory AI management systems are currently syncing with the global ledger.</p>
                <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors">Initialize Sync</button>
            </div>
        </div>
    );

    // --- Side Logic ---
    return (
        <div className="h-full flex flex-col bg-[#0b0e11] text-gray-300 font-sans overflow-hidden -m-6 fixed inset-0">
            {renderTopBar()}
            <div className="flex flex-1 min-h-0">
                {renderSidebar()}
                
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'trading' && renderTradingTerminal()}
                    {activeTab === 'ai-hub' && renderAIHub()}
                    {activeTab === 'operations' && renderOperations()}
                    {activeTab === 'settings' && renderOperations()} {/* Implementation for settings */}

                    {/* Sinking Human Enemy Silence */}
                    <div className="absolute bottom-6 right-6 w-80 bg-[#15191e] border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 max-h-[500px]">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-white text-sm">AI Assistant</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-[#0b0e11] h-64 space-y-3">
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-2 rounded-lg text-xs ${msg.sender === 'user' ? 'bg-cyan-900/50 text-cyan-100 rounded-br-none' : 'bg-gray-800 text-gray-300 rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-gray-600 mt-1">{msg.timestamp}</span>
                                </div>
                            ))}
                            <div ref={scrollRef}></div>
                        </div>
                        <div className="p-2 bg-[#15191e] border-t border-gray-700 flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask AI for insights..." 
                                className="flex-1 bg-[#0b0e11] border border-gray-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button onClick={handleSendMessage} className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentsView;

// --- CONSOLIDATED FROM: InvestmentsView (5).tsx ---

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Card from './Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, PieChart, Pie, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Search, Menu, ChevronLeft, ChevronRight, Activity, Globe, Server, Database, Shield, Cpu, Zap, Settings as SettingsIcon, Brain, PieChart as PortfolioIcon, Landmark, Atom, FileCode, BarChartBig, Wallet, ShieldCheck, SlidersHorizontal, ArrowUp, ArrowDown, CheckCircle, XCircle, Clock } from 'lucide-react';

// --- Expanded Types ---

interface StockTicker {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    marketCap: string;
    name: string;
    sector: string;
    aiScore: number; // 0-100
    sentiment: 'bullish' | 'bearish' | 'neutral';
    volatilityIndex: number;
    liquidityProvider: string;
}

interface PortfolioAsset {
    symbol: string;
    name: string;
    quantity: number;
    avgCost: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

interface OrderBookItem {
    price: number;
    size: number;
    total: number;
    type: 'bid' | 'ask';
}

interface AIInsight {
    id: string;
    timestamp: string;
    category: 'Risk' | 'Opportunity' | 'Anomaly' | 'Prediction' | 'Macro';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    confidence: number;
    relatedAsset?: string;
    actionable: boolean;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'system' | 'nexus';
    text: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

interface OperationNode {
    id: string;
    name: string;
    status: 'optimal' | 'degraded' | 'critical' | 'offline';
    load: number; // CPU/Quantum Core Load %
    latency: number; // ms
    region: string;
    type: 'Compute' | 'Storage' | 'QuantumRelay' | 'DataIngest';
}

interface DAOProposal {
    id: string;
    title: string;
    proposer: string;
    status: 'active' | 'passed' | 'failed';
    votesFor: number;
    votesAgainst: number;
    description: string;
    endsIn: string;
}

// --- Live Data Service ---

const fetchLiveCryptoPrices = async (): Promise<Record<string, number>> => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,chainlink,avalanche-2&vs_currencies=usd');
        if (!response.ok) throw new Error("Rate limit");
        const data = await response.json();
        return {
            'BTC-USD': data.bitcoin.usd,
            'ETH-USD': data.ethereum.usd,
            'SOL-USD': data.solana.usd,
            'XRP-USD': data.ripple.usd,
            'ADA-USD': data.cardano.usd,
            'LINK-USD': data.chainlink.usd,
            'AVAX-USD': data['avalanche-2'].usd,
        };
    } catch (e) {
        return {
            'BTC-USD': 64230.50, 'ETH-USD': 3450.00, 'SOL-USD': 145.20,
            'XRP-USD': 0.62, 'ADA-USD': 0.45, 'LINK-USD': 18.50, 'AVAX-USD': 35.80
        };
    }
};

// --- Initial Data Generators ---

const generateStockData = (livePrices?: Record<string, number>): StockTicker[] => [
    { symbol: 'BTC-USD', name: 'Bitcoin Core', price: livePrices?.['BTC-USD'] || 64230.50, change: 0, changePercent: 0, volume: 450000000, high: 0, low: 0, marketCap: '1.2T', sector: 'Crypto', aiScore: 88, sentiment: 'bullish', volatilityIndex: 0.45, liquidityProvider: 'Global Pool' },
    { symbol: 'ETH-USD', name: 'Ethereum Network', price: livePrices?.['ETH-USD'] || 3450.00, change: 0, changePercent: 0, volume: 220000000, high: 0, low: 0, marketCap: '400B', sector: 'Crypto', aiScore: 72, sentiment: 'neutral', volatilityIndex: 0.38, liquidityProvider: 'Global Pool' },
    { symbol: 'SOL-USD', name: 'Solana', price: livePrices?.['SOL-USD'] || 145.20, change: 0, changePercent: 0, volume: 80000000, high: 0, low: 0, marketCap: '65B', sector: 'Crypto', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.65, liquidityProvider: 'Regional Pool' },
    { symbol: 'NVDA', name: 'NVIDIA AI Compute', price: 890.10, change: 15.50, changePercent: 1.74, volume: 55000000, high: 900.00, low: 880.00, marketCap: '2.2T', sector: 'Technology', aiScore: 96, sentiment: 'bullish', volatilityIndex: 0.25, liquidityProvider: 'NYSE' },
    { symbol: 'MSFT', name: 'Microsoft Enterprise', price: 420.00, change: -2.10, changePercent: -0.50, volume: 22000000, high: 425.50, low: 418.90, marketCap: '3.1T', sector: 'Technology', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.15, liquidityProvider: 'NASDAQ' },
    { symbol: 'SYNTH-AI', name: 'AI Sector Synthetic', price: 1250.75, change: 12.30, changePercent: 0.98, volume: 15000000, high: 1260, low: 1240, marketCap: 'N/A', sector: 'Synthetic', aiScore: 99, sentiment: 'bullish', volatilityIndex: 0.8, liquidityProvider: 'DAO Liquidity' },
];

const generateOrderBook = (basePrice: number): OrderBookItem[] => {
    const spread = basePrice * 0.0005;
    const asks = Array.from({ length: 50 }, (_, i) => ({ price: basePrice + spread + (i * basePrice * 0.0001), size: Math.random() * 5 + 0.1, total: 0, type: 'ask' as const })).reverse();
    const bids = Array.from({ length: 50 }, (_, i) => ({ price: basePrice - spread - (i * basePrice * 0.0001), size: Math.random() * 5 + 0.1, total: 0, type: 'bid' as const }));
    return [...asks, ...bids];
};

const generateLiveChartData = (basePrice: number, points: number) => {
    let currentPrice = basePrice;
    return Array.from({ length: points }, (_, i) => {
        const time = new Date(Date.now() - (points - i) * 60000);
        const volatility = 0.002;
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice += change;
        return { time: time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0'), price: currentPrice, volume: Math.floor(Math.random() * 5000) + 1000, aiPrediction: currentPrice * (1 + (Math.random() - 0.5) * 0.01), sentimentScore: 50 + (Math.random() - 0.5) * 20 };
    });
};

const initialNodes: OperationNode[] = [
    { id: 'n1', name: 'Tokyo-1', status: 'optimal', load: 45, latency: 8, region: 'APAC', type: 'Compute' },
    { id: 'n2', name: 'London-Core', status: 'degraded', load: 88, latency: 45, region: 'EMEA', type: 'QuantumRelay' },
    { id: 'n3', name: 'NY-Fin', status: 'optimal', load: 32, latency: 12, region: 'NA', type: 'Compute' },
    { id: 'n4', name: 'Singapore-Edge', status: 'critical', load: 99, latency: 120, region: 'APAC', type: 'DataIngest' },
    { id: 'n5', name: 'Frankfurt-Data', status: 'optimal', load: 60, latency: 22, region: 'EMEA', type: 'Storage' },
    { id: 'n6', name: 'Zurich-Quantum', status: 'optimal', load: 15, latency: 1, region: 'EMEA', type: 'QuantumRelay' },
];

const initialProposals: DAOProposal[] = [
    { id: 'dp001', title: 'Onboard SYNTH-AI to Global Pool', proposer: '0x...a4f2', status: 'active', votesFor: 125000, votesAgainst: 15000, description: 'Integrate the new AI-driven synthetic asset into the primary liquidity pool to increase platform volume.', endsIn: '2d 4h' },
    { id: 'dp002', title: 'Reduce Trading Fees by 5%', proposer: '0x...b8e1', status: 'passed', votesFor: 250000, votesAgainst: 10000, description: 'A successful proposal to lower platform fees to attract more high-frequency traders.', endsIn: 'Ended' },
];

// --- Main Component ---

const InvestmentsView: React.FC = () => {
    // --- Layout State ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'trading' | 'portfolio' | 'ai-hub' | 'infrastructure' | 'governance' | 'settings'>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // --- Data State ---
    const [stocks, setStocks] = useState<StockTicker[]>(generateStockData());
    const [selectedStock, setSelectedStock] = useState<StockTicker>(stocks[0]);
    const [chartData, setChartData] = useState(generateLiveChartData(stocks[0].price, 120));
    const [orderBook, setOrderBook] = useState<OrderBookItem[]>(generateOrderBook(stocks[0].price));
    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
    
    // --- AI & Ops State ---
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ id: '1', sender: 'nexus', text: 'NEXUS-7 Quantum Core online. All systems nominal.', timestamp: new Date().toLocaleTimeString() }]);
    const [chatInput, setChatInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [opsNodes, setOpsNodes] = useState<OperationNode[]>(initialNodes);
    const [daoProposals, setDaoProposals] = useState<DAOProposal[]>(initialProposals);
    
    // --- Settings State ---
    const [tickRate, setTickRate] = useState(500); // ms for HFT feel
    const [showPredictions, setShowPredictions] = useState(true);
    const [theme, setTheme] = useState('dark');

    // --- Initialization ---
    useEffect(() => {
        fetchLiveCryptoPrices().then(prices => {
            const updatedStocks = generateStockData(prices);
            setStocks(updatedStocks);
            const current = updatedStocks.find(s => s.symbol === selectedStock.symbol);
            if (current) {
                setSelectedStock(current);
                setChartData(generateLiveChartData(current.price, 120));
                setOrderBook(generateOrderBook(current.price));
            }
        });
    }, []);

    // --- Live Ticker Loop ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            setStocks(prev => prev.map(stock => {
                const move = (Math.random() - 0.5) * (stock.price * 0.001);
                const newPrice = stock.price + move;
                return { ...stock, price: newPrice, change: move, changePercent: (move / stock.price) * 100, high: Math.max(stock.high || newPrice, newPrice), low: Math.min(stock.low || newPrice, newPrice) };
            }));

            setChartData(prev => {
                const currentStock = stocks.find(s => s.symbol === selectedStock.symbol) || selectedStock;
                const move = (Math.random() - 0.5) * (currentStock.price * 0.001);
                const newPrice = currentStock.price + move;
                const newPoint = { time: timeStr, price: newPrice, volume: Math.floor(Math.random() * 1000), aiPrediction: showPredictions ? newPrice * (1 + (Math.random() - 0.5) * 0.02) : 0, sentimentScore: 50 + (Math.random() - 0.5) * 10 };
                return [...prev.slice(1), newPoint];
            });

            setOrderBook(prev => prev.map(item => ({ ...item, size: Math.max(0.1, item.size + (Math.random() - 0.5)), price: item.price + (Math.random() - 0.5) * 0.1 })).sort((a, b) => b.price - a.price));
            
            setOpsNodes(prev => prev.map(node => ({...node, load: Math.min(100, Math.max(0, node.load + (Math.random() - 0.5) * 5)), latency: Math.max(1, node.latency + (Math.random() - 0.5) * 2)})));

        }, tickRate);

        return () => clearInterval(interval);
    }, [selectedStock.symbol, tickRate, showPredictions, stocks]);

    // --- Handlers ---

    const handleStockSelect = (stock: StockTicker) => {
        setSelectedStock(stock);
        setChartData(generateLiveChartData(stock.price, 120));
        setOrderBook(generateOrderBook(stock.price));
    };

    const handleAISend = async () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = "You are NEXUS-7, a high-frequency trading AI assistant. Provide concise, actionable insights based on the provided context.";
            const context = `Context: Asset is ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)}. Current sentiment is ${selectedStock.sentiment}, with a volatility index of ${selectedStock.volatilityIndex.toFixed(2)}.`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: `${context}\n\nUser: ${userMsg.text}` }] }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2, // Lower for more deterministic, factual responses in a financial context.
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables thinking for faster HFT-style responses.
                    },
                }
            });

            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'nexus', text: result.response.text(), timestamp: new Date().toLocaleTimeString() };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'system', text: "Quantum Entanglement Comms disrupted. Fallback: Volatility suggests holding.", timestamp: new Date().toLocaleTimeString() };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const optimizeNode = (id: string) => setOpsNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'optimal', load: Math.max(20, n.load - 30), latency: Math.max(5, n.latency - 20) } : n));

    // --- Renderers ---

    const renderSidebar = () => (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0b0e11] border-r border-gray-800 flex flex-col transition-all duration-300 z-30 flex-shrink-0`}>
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 cursor-pointer" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <span className="font-bold text-white text-xl">{sidebarCollapsed ? 'N7' : 'NEXUS'}</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-2 mt-4">
                {[
                    { id: 'dashboard', icon: BarChartBig, label: 'Market Overview' },
                    { id: 'trading', icon: Globe, label: 'HFT Terminal' },
                    { id: 'portfolio', icon: PortfolioIcon, label: 'Portfolio & Risk' },
                    { id: 'ai-hub', icon: Brain, label: 'Neural Core' },
                    { id: 'infrastructure', icon: Server, label: 'Global Infrastructure' },
                    { id: 'governance', icon: Landmark, label: 'DAO Governance' },
                    { id: 'settings', icon: SettingsIcon, label: 'System Config' }
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${activeTab === item.id ? 'bg-cyan-900/20 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title={sidebarCollapsed ? item.label : ''}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                    </button>
                ))}
            </div>
            <div className="mt-auto p-4 border-t border-gray-800">
                 {!sidebarCollapsed ? (
                    <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Atom className="w-4 h-4 text-purple-400 animate-spin" />
                            <span className="text-xs font-bold text-purple-400">QUANTUM LINK</span>
                        </div>
                        <div className="text-[10px] text-gray-500">Latency: 1.4ms (FTL)</div>
                    </div>
                 ) : ( <Atom className="w-5 h-5 text-purple-400 mx-auto animate-spin" /> )}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex-1 p-6 overflow-y-auto bg-[#0b0e11] h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stocks.slice(0, 4).map(stock => (
                    <Card key={stock.symbol} className="bg-[#15191e] border-gray-800 hover:border-cyan-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase">{stock.name}</h3>
                                <div className="text-2xl font-bold text-white mt-1">${stock.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${stock.change >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</div>
                        </div>
                        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${stock.sentiment === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${stock.aiScore}%` }}></div></div>
                        <div className="mt-1 text-[10px] text-gray-500 text-right">AI Confidence: {stock.aiScore}%</div>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] mb-6">
                <div className="lg:col-span-2 bg-[#15191e] border border-gray-800 rounded-lg flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><h2 className="text-white font-bold text-lg">{selectedStock.symbol}</h2><span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">Live Feed</span></div>
                        <div className="flex gap-2">{['1H', '4H', '1D', '1W'].map(t => (<button key={t} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded transition-colors">{t}</button>))}</div>
                    </div>
                    <div className="flex-1 p-2 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
                                <XAxis dataKey="time" stroke="#5e6673" tick={{fontSize: 10}} minTickGap={30} />
                                <YAxis domain={['auto', 'auto']} orientation="right" stroke="#5e6673" tick={{fontSize: 10}} tickFormatter={(val) => val.toFixed(2)} width={60} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="url(#colorPrice)" strokeWidth={2} />
                                {showPredictions && <Area type="monotone" dataKey="aiPrediction" stroke="#8b5cf6" fill="none" strokeDasharray="5 5" strokeWidth={1} />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-[#15191e] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase">Order Book</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {orderBook.map((order, i) => (
                            <div key={i} className="flex justify-between text-xs p-1 px-3 hover:bg-gray-800 relative">
                                <div className={`absolute inset-0 ${order.type === 'ask' ? 'bg-red-500/10' : 'bg-green-500/10'}`} style={{ width: `${Math.min(100, order.size * 5)}%` }}></div>
                                <span className={`z-10 font-mono ${order.type === 'ask' ? 'text-red-400' : 'text-green-400'}`}>{order.price.toFixed(2)}</span>
                                <span className="z-10 text-gray-400">{order.size.toFixed(4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTrading = () => (
        <div className="flex-1 flex flex-col lg:flex-row bg-[#0b0e11] h-full overflow-hidden">
            <div className="w-full lg:w-64 bg-[#15191e] border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" /><input type="text" placeholder="Search Assets" className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 py-2 text-sm text-white focus:border-cyan-500 outline-none" /></div></div>
                <div className="flex-1 overflow-y-auto">{stocks.map(stock => (<div key={stock.symbol} onClick={() => handleStockSelect(stock)} className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${selectedStock.symbol === stock.symbol ? 'bg-gray-800 border-l-2 border-l-cyan-500' : ''}`}><div className="flex justify-between mb-1"><span className="font-bold text-white text-sm">{stock.symbol}</span><span className="text-white text-sm">${stock.price.toFixed(2)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">{stock.name}</span><span className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>{stock.changePercent.toFixed(2)}%</span></div></div>))}</div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 bg-[#0b0e11] p-4 relative"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="time" stroke="#4b5563" /><YAxis orientation="right" stroke="#4b5563" domain={['auto', 'auto']} /><Tooltip contentStyle={{backgroundColor: '#111827'}} /><Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#grad)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                <div className="h-[240px] bg-[#15191e] border-t border-gray-800 p-4 flex gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {['Market', 'Limit', 'Stop Limit', 'TWAP'].map(type => <button key={type} className={`py-2 rounded ${type === 'Limit' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{type}</button>)}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-500">Price (USD)</label><input type="number" defaultValue={selectedStock.price.toFixed(2)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 text-white font-mono" /></div>
                            <div><label className="text-xs text-gray-500">Amount ({selectedStock.symbol.split('-')[0]})</label><input type="number" placeholder="0.00" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 text-white font-mono" /></div>
                        </div>
                        <div><input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                    </div>
                    <div className="w-48 flex flex-col gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"><ArrowUp size={16}/>BUY / LONG</button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"><ArrowDown size={16}/>SELL / SHORT</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderPortfolio = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio & Risk Analysis</h1>
            <p className="text-gray-400 mb-8">Comprehensive overview of asset allocation, performance, and risk exposure.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Total Value" className="lg:col-span-1 bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-cyan-400">$1,245,678.90</div><div className="text-green-400 mt-2">+ $12,345.67 (+1.01%) Today</div></Card>
                <Card title="Risk Exposure (VaR 95%)" className="bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-yellow-400">$45,123.00</div><div className="text-gray-400 mt-2">Max potential 1-day loss</div></Card>
                <Card title="Sharpe Ratio" className="bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-purple-400">2.15</div><div className="text-gray-400 mt-2">Excellent risk-adjusted return</div></Card>
            </div>
        </div>
    );

    const renderAIHub = () => (
        <div className="flex-1 flex flex-col lg:flex-row h-full bg-[#0b0e11] overflow-hidden">
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 bg-[#15191e] border border-gray-800 rounded-xl flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-[#15191e] to-[#1a2026]"><div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${isAiThinking ? 'bg-purple-500 animate-ping' : 'bg-green-500'}`}></div><h2 className="text-lg font-bold text-white">NEXUS-7 Neural Interface</h2></div></div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">{chatHistory.map((msg, idx) => (<div key={msg.id + idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}><div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div><div className="text-[10px] opacity-50 mt-2 text-right">{msg.timestamp}</div></div></div>))}{isAiThinking && (<div className="flex justify-start"><div className="bg-gray-800 p-4 rounded-xl rounded-bl-none border border-gray-700 flex gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div></div></div>)}</div>
                    <div className="p-4 border-t border-gray-800 bg-[#1a2026]"><div className="flex gap-4"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAISend()} placeholder="Analyze market conditions..." className="flex-1 bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" /><button onClick={handleAISend} className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">SEND</button></div></div>
                </div>
            </div>
            <div className="w-full lg:w-80 bg-[#15191e] border-l border-gray-800 p-6 overflow-y-auto">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Active Directives</h3>
                <div className="space-y-4"><div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-white font-bold text-sm">Risk Mitigation</span><span className="text-green-400 text-xs">Active</span></div><p className="text-xs text-gray-400">Monitoring BTC-USD variance for liquidation thresholds.</p></div><div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-white font-bold text-sm">Sentiment Analysis</span><span className="text-yellow-400 text-xs">Learning</span></div><p className="text-xs text-gray-400">Ingesting global news feeds. Volatility index updated.</p></div><div className="mt-8"><h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Model Performance</h3><div className="space-y-2"><div className="flex justify-between text-xs text-gray-400"><span>Accuracy</span><span>98.7%</span></div><div className="w-full bg-gray-800 h-1.5 rounded-full"><div className="bg-purple-500 h-full w-[98.7%]"></div></div><div className="flex justify-between text-xs text-gray-400 mt-2"><span>Inference Latency</span><span>0.8ms</span></div><div className="w-full bg-gray-800 h-1.5 rounded-full"><div className="bg-cyan-500 h-full w-[95%]"></div></div></div></div></div>
            </div>
        </div>
    );

    const renderInfrastructure = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-2">Global Infrastructure Map</h1><p className="text-gray-400">Real-time quantum network optimization. Click nodes to re-route computational load.</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#15191e] rounded-xl border border-gray-800 p-6 relative min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="relative w-full h-full">{opsNodes.map((node, i) => (<div key={node.id} onClick={() => optimizeNode(node.id)} className={`absolute p-3 rounded-lg border transition-all duration-500 cursor-pointer transform hover:scale-110 ${node.status === 'optimal' ? 'bg-green-900/30 border-green-500' : node.status === 'critical' ? 'bg-red-900/30 border-red-500 animate-pulse' : 'bg-yellow-900/30 border-yellow-500'}`} style={{ top: `${10 + (i * 15)}%`, left: `${15 + (i % 2) * 50}%` }}><div className="flex items-center gap-2 mb-1">{node.type === 'QuantumRelay' ? <Atom size={16} className="text-purple-400"/> : <Server size={16} className="text-cyan-400"/>}<span className="font-bold text-white text-sm">{node.name}</span></div><div className="text-xs text-gray-400 mb-2">{node.region} - {node.type}</div><div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className={`h-full transition-all duration-1000 ${node.load > 90 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${node.load}%`}}></div></div><div className="text-[10px] text-right mt-1 text-gray-500">{node.load}% Load / {node.latency.toFixed(1)}ms</div></div>))}<svg className="absolute inset-0 pointer-events-none opacity-30"><path d="M150 100 L 400 200 L 150 300" stroke="#4b5563" strokeWidth="2" fill="none" /></svg></div>
                </div>
                <div className="flex flex-col gap-4">
                    <Card title="System Events" className="flex-1 bg-[#15191e] border-gray-800"><div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">{opsNodes.filter(n => n.status !== 'optimal').map(n => (<div key={n.id + 'alert'} className="p-3 bg-gray-800/50 border-l-2 border-red-500 rounded flex justify-between items-center"><div><div className="text-red-400 text-xs font-bold uppercase">Latency Spike</div><div className="text-white text-sm">{n.name} load exceeded 90% threshold.</div></div><button onClick={() => optimizeNode(n.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded">Fix</button></div>))}<div className="p-3 bg-gray-800/50 border-l-2 border-green-500 rounded"><div className="text-green-400 text-xs font-bold uppercase">Optimization</div><div className="text-white text-sm">Route B-72 rebalanced successfully.</div></div><div className="p-3 bg-gray-800/50 border-l-2 border-blue-500 rounded"><div className="text-blue-400 text-xs font-bold uppercase">Sync</div><div className="text-white text-sm">Global ledger synchronization complete.</div></div></div></Card>
                </div>
            </div>
        </div>
    );

    const renderDAOGovernance = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-2">DAO Governance Protocol</h1>
            <p className="text-gray-400 mb-8">Participate in the decentralized future of the platform. Your vote matters.</p>
            <div className="space-y-6">
                {daoProposals.map(p => (
                    <Card key={p.id} className="bg-[#15191e] border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="text-lg font-bold text-white">{p.title}</h3><p className="text-xs text-gray-500">Proposed by: {p.proposer}</p></div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.status === 'active' ? 'bg-blue-900 text-blue-300' : p.status === 'passed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{p.status.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">{p.description}</p>
                        <div className="w-full bg-gray-800 rounded-full h-4 flex overflow-hidden mb-2"><div className="bg-green-500" style={{width: `${(p.votesFor / (p.votesFor + p.votesAgainst)) * 100}%`}}></div><div className="bg-red-500" style={{width: `${(p.votesAgainst / (p.votesFor + p.votesAgainst)) * 100}%`}}></div></div>
                        <div className="flex justify-between text-xs text-gray-400"><span>{p.votesFor.toLocaleString()} For</span><span>{p.votesAgainst.toLocaleString()} Against</span></div>
                        {p.status === 'active' && <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center"><span className="text-sm text-yellow-400">Ends in: {p.endsIn}</span><div className="flex gap-2"><button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold">Vote For</button><button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold">Vote Against</button></div></div>}
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
             <h1 className="text-3xl font-bold text-white mb-8">System Configuration</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Data Feed Configuration" className="bg-[#15191e] border-gray-800">
                    <div className="space-y-4">
                        <div><label className="text-gray-400 text-sm block mb-2">Simulation Tick Rate (ms)</label><div className="flex items-center gap-4"><input type="range" min="100" max="2000" value={tickRate} onChange={e => setTickRate(Number(e.target.value))} className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /><span className="text-white font-mono w-12">{tickRate}</span></div></div>
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"><span className="text-white text-sm">Show AI Prediction Layer</span><button onClick={() => setShowPredictions(!showPredictions)} className={`w-12 h-6 rounded-full transition-colors relative ${showPredictions ? 'bg-cyan-600' : 'bg-gray-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showPredictions ? 'left-7' : 'left-1'}`}></div></button></div>
                    </div>
                </Card>
                <Card title="Security Protocols" className="bg-[#15191e] border-gray-800">
                    <div className="space-y-3"><div className="flex justify-between items-center p-2 border-b border-gray-800"><span className="text-gray-300 text-sm">Two-Factor Auth</span><span className="text-green-400 text-xs font-bold">ENABLED</span></div><div className="flex justify-between items-center p-2 border-b border-gray-800"><span className="text-gray-300 text-sm">API Key Rotation</span><span className="text-yellow-400 text-xs font-bold">30 DAYS</span></div><div className="flex justify-between items-center p-2"><span className="text-gray-300 text-sm">Session Timeout</span><span className="text-white text-xs">15 MIN</span></div></div>
                </Card>
             </div>
        </div>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'trading': return renderTrading();
            case 'portfolio': return renderPortfolio();
            case 'ai-hub': return renderAIHub();
            case 'infrastructure': return renderInfrastructure();
            case 'governance': return renderDAOGovernance();
            case 'settings': return renderSettings();
            default: return renderDashboard();
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            {renderSidebar()}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                 {renderActiveTab()}
            </div>
        </div>
    );
};

export default InvestmentsView;

// --- CONSOLIDATED FROM: InvestmentsView (2).tsx ---

// components/InvestmentsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "CapitalVista," a full-featured celestial observatory for wealth.
// It combines portfolio visualization, performance analysis, growth simulation,
// and ESG investing into a single, comprehensive view.

import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Asset } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import InvestmentPortfolio from './InvestmentPortfolio';

// ================================================================================================
// HELPER & SUB-COMPONENTS
// ================================================================================================

/**
 * @description A specialized component to visually represent a company's ESG (Environmental,
 * Social, and Governance) rating on a scale of 1 to 5.
 * @param {{ rating: number }} props - The ESG rating to display.
 */
const ESGScore: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center" aria-label={`ESG rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i < rating ? 'text-green-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.22 9.63a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.18 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 7.612v6.638A.75.75 0 0110 15z" />
            </svg>
        ))}
    </div>
);

/**
 * @description A modal component for simulating an investment action.
 */
const InvestmentModal: React.FC<{
    asset: Asset | null;
    onClose: () => void;
    onInvest: (assetName: string, amount: number) => void;
}> = ({ asset, onClose, onInvest }) => {
    const [amount, setAmount] = useState('1000');

    if (!asset) return null;

    const handleInvestClick = () => {
        onInvest(asset.name, parseFloat(amount));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Invest in {asset.name}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">{asset.description}</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Amount (USD)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                    <button onClick={handleInvestClick} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">
                        Confirm Investment
                    </button>
                </div>
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: InvestmentsView (CapitalVista)
// ================================================================================================

const InvestmentsView: React.FC = () => {
    const context = useContext(DataContext);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [selectedImpactAsset, setSelectedImpactAsset] = useState<Asset | null>(null);

    if (!context) {
        throw new Error("InvestmentsView must be within a DataProvider.");
    }

    const { assets, impactInvestments, addTransaction } = context;

    const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);

    /**
     * @description Calculates the projected growth of the investment portfolio over 10 years,
     * factoring in a constant monthly contribution and a fixed annual growth rate.
     */
    const projectionData = useMemo(() => {
        let futureValue = totalValue;
        const data = [{ year: 'Now', value: futureValue }];
        for (let i = 1; i <= 10; i++) {
            // Formula: (Current Value + (Monthly Contribution * 12)) * (1 + Annual Growth Rate)
            futureValue = (futureValue + monthlyContribution * 12) * 1.07; // 7% annual growth
            data.push({ year: `Year ${i}`, value: futureValue });
        }
        return data;
    }, [totalValue, monthlyContribution]);

    const handleInvest = (assetName: string, amount: number) => {
// FIX: The `addTransaction` function expects an object of type `Omit<Transaction, 'id'>`.
// The `id` property is generated by the backend and should not be sent in the request.
        addTransaction({
            type: 'expense',
            category: 'Investments',
            description: `Invest in ${assetName}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        alert(`Successfully invested $${amount} in ${assetName}. See the new transaction in your history.`);
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Investments (CapitalVista)</h2>

                {/* Main Portfolio Overview */}
                <InvestmentPortfolio />

                {/* Performance and Growth Simulation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Asset Performance (YTD)">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" stroke="#9ca3af" domain={[0, 50]} unit="%" />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Bar dataKey="performanceYTD" name="YTD Performance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="AI Growth Simulator">
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300">Monthly Contribution: <span className="font-bold text-white">${monthlyContribution.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                step="50"
                                value={monthlyContribution}
                                onChange={e => setMonthlyContribution(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Monthly investment contribution"
                            />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="year" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, "Projected Value"]} />
                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                
                {/* Social Impact Investing Section */}
                <Card title="Social Impact Investing (ESG)">
                    <p className="text-sm text-gray-400 mb-4">Invest in companies that align with your values. All options below are highly rated for their Environmental, Social, and Governance practices.</p>
                    <div className="space-y-4">
                        {impactInvestments.map(asset => (
                            <div key={asset.name} className="p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4">
                                        <ESGScore rating={asset.esgRating || 0} />
                                        <h4 className="font-semibold text-white">{asset.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">{asset.description}</p>
                                </div>
                                <button onClick={() => setSelectedImpactAsset(asset)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                                    Invest Now
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <InvestmentModal
                asset={selectedImpactAsset}
                onClose={() => setSelectedImpactAsset(null)}
                onInvest={handleInvest}
            />
        </>
    );
};

export default InvestmentsView;


// --- CONSOLIDATED FROM: InvestmentsView (2)_1.tsx ---

// components/InvestmentsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "CapitalVista," a full-featured celestial observatory for wealth.
// It combines portfolio visualization, performance analysis, growth simulation,
// and ESG investing into a single, comprehensive view.

import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Asset } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import InvestmentPortfolio from './InvestmentPortfolio';

// ================================================================================================
// HELPER & SUB-COMPONENTS
// ================================================================================================

/**
 * @description A specialized component to visually represent a company's ESG (Environmental,
 * Social, and Governance) rating on a scale of 1 to 5.
 * @param {{ rating: number }} props - The ESG rating to display.
 */
const ESGScore: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center" aria-label={`ESG rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i < rating ? 'text-green-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.22 9.63a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.18 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 7.612v6.638A.75.75 0 0110 15z" />
            </svg>
        ))}
    </div>
);

/**
 * @description A modal component for simulating an investment action.
 */
const InvestmentModal: React.FC<{
    asset: Asset | null;
    onClose: () => void;
    onInvest: (assetName: string, amount: number) => void;
}> = ({ asset, onClose, onInvest }) => {
    const [amount, setAmount] = useState('1000');

    if (!asset) return null;

    const handleInvestClick = () => {
        onInvest(asset.name, parseFloat(amount));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Invest in {asset.name}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">{asset.description}</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Amount (USD)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                    <button onClick={handleInvestClick} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">
                        Confirm Investment
                    </button>
                </div>
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: InvestmentsView (CapitalVista)
// ================================================================================================

const InvestmentsView: React.FC = () => {
    const context = useContext(DataContext);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [selectedImpactAsset, setSelectedImpactAsset] = useState<Asset | null>(null);

    if (!context) {
        throw new Error("InvestmentsView must be within a DataProvider.");
    }

    const { assets, impactInvestments, addTransaction } = context;

    const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);

    /**
     * @description Calculates the projected growth of the investment portfolio over 10 years,
     * factoring in a constant monthly contribution and a fixed annual growth rate.
     */
    const projectionData = useMemo(() => {
        let futureValue = totalValue;
        const data = [{ year: 'Now', value: futureValue }];
        for (let i = 1; i <= 10; i++) {
            // Formula: (Current Value + (Monthly Contribution * 12)) * (1 + Annual Growth Rate)
            futureValue = (futureValue + monthlyContribution * 12) * 1.07; // 7% annual growth
            data.push({ year: `Year ${i}`, value: futureValue });
        }
        return data;
    }, [totalValue, monthlyContribution]);

    const handleInvest = (assetName: string, amount: number) => {
// FIX: The `addTransaction` function expects an object of type `Omit<Transaction, 'id'>`.
// The `id` property is generated by the backend and should not be sent in the request.
        addTransaction({
            type: 'expense',
            category: 'Investments',
            description: `Invest in ${assetName}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        alert(`Successfully invested $${amount} in ${assetName}. See the new transaction in your history.`);
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Investments (CapitalVista)</h2>

                {/* Main Portfolio Overview */}
                <InvestmentPortfolio />

                {/* Performance and Growth Simulation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Asset Performance (YTD)">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" stroke="#9ca3af" domain={[0, 50]} unit="%" />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Bar dataKey="performanceYTD" name="YTD Performance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="AI Growth Simulator">
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300">Monthly Contribution: <span className="font-bold text-white">${monthlyContribution.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                step="50"
                                value={monthlyContribution}
                                onChange={e => setMonthlyContribution(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Monthly investment contribution"
                            />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="year" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, "Projected Value"]} />
                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                
                {/* Social Impact Investing Section */}
                <Card title="Social Impact Investing (ESG)">
                    <p className="text-sm text-gray-400 mb-4">Invest in companies that align with your values. All options below are highly rated for their Environmental, Social, and Governance practices.</p>
                    <div className="space-y-4">
                        {impactInvestments.map(asset => (
                            <div key={asset.name} className="p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4">
                                        <ESGScore rating={asset.esgRating || 0} />
                                        <h4 className="font-semibold text-white">{asset.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">{asset.description}</p>
                                </div>
                                <button onClick={() => setSelectedImpactAsset(asset)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                                    Invest Now
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <InvestmentModal
                asset={selectedImpactAsset}
                onClose={() => setSelectedImpactAsset(null)}
                onInvest={handleInvest}
            />
        </>
    );
};

export default InvestmentsView;


// --- CONSOLIDATED FROM: ./views/personal/InvestmentsView.tsx ---

// components/views/personal/InvestmentsView.tsx
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { Asset } from '../../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import InvestmentPortfolio from '../../InvestmentPortfolio';

// ================================================================================================
// HELPER & SUB-COMPONENTS
// ================================================================================================

const ESGScore: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center" aria-label={`ESG rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i < rating ? 'text-green-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.22 9.63a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.18 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 7.612v6.638A.75.75 0 0110 15z" />
            </svg>
        ))}
    </div>
);

const InvestmentModal: React.FC<{
    asset: Asset | null;
    onClose: () => void;
    onInvest: (assetName: string, amount: number) => void;
}> = ({ asset, onClose, onInvest }) => {
    const [amount, setAmount] = useState('1000');

    if (!asset) return null;

    const handleInvestClick = () => {
        onInvest(asset.name, parseFloat(amount));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Invest in {asset.name}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">{asset.description}</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Amount (USD)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                    <button onClick={handleInvestClick} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">
                        Confirm Investment
                    </button>
                </div>
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: InvestmentsView (CapitalVista)
// ================================================================================================

const InvestmentsView: React.FC = () => {
    const context = useContext(DataContext);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [selectedImpactAsset, setSelectedImpactAsset] = useState<Asset | null>(null);

    if (!context) {
        throw new Error("InvestmentsView must be within a DataProvider.");
    }

    const { assets, impactInvestments, addTransaction } = context;

    const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);

    const projectionData = useMemo(() => {
        let futureValue = totalValue;
        const data = [{ year: 'Now', value: futureValue }];
        for (let i = 1; i <= 10; i++) {
            futureValue = (futureValue + monthlyContribution * 12) * 1.07; // 7% annual growth
            data.push({ year: `Year ${i}`, value: futureValue });
        }
        return data;
    }, [totalValue, monthlyContribution]);

    const handleInvest = (assetName: string, amount: number) => {
// FIX: The `addTransaction` function expects an object of type `Omit<Transaction, 'id'>`.
// The `id` property is generated by the backend and should not be sent in the request.
        addTransaction({
            type: 'expense',
            category: 'Investments',
            description: `Invest in ${assetName}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        alert(`Successfully invested $${amount} in ${assetName}. See the new transaction in your history.`);
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Investments (CapitalVista)</h2>

                <InvestmentPortfolio />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Asset Performance (YTD)">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" stroke="#9ca3af" domain={[0, 50]} unit="%" />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Bar dataKey="performanceYTD" name="YTD Performance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="AI Growth Simulator">
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300">Monthly Contribution: <span className="font-bold text-white">${monthlyContribution.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                step="50"
                                value={monthlyContribution}
                                onChange={e => setMonthlyContribution(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Monthly investment contribution"
                            />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="year" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, "Projected Value"]} />
                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                
                {/* Social Impact Investing Section */}
                <Card title="Social Impact Investing (ESG)">
                    <p className="text-sm text-gray-400 mb-4">Invest in companies that align with your values. All options below are highly rated for their Environmental, Social, and Governance practices.</p>
                    <div className="space-y-4">
                        {impactInvestments.map(asset => (
                            <div key={asset.name} className="p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4">
                                        <ESGScore rating={asset.esgRating || 0} />
                                        <h4 className="font-semibold text-white">{asset.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">{asset.description}</p>
                                </div>
                                <button onClick={() => setSelectedImpactAsset(asset)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                                    Invest Now
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <InvestmentModal
                asset={selectedImpactAsset}
                onClose={() => setSelectedImpactAsset(null)}
                onInvest={handleInvest}
            />
        </>
    );
};

export default InvestmentsView;

// --- CONSOLIDATED FROM: ./components/InvestmentsView (3).tsx ---



// --- CONSOLIDATED FROM: InvestmentsView (3)_1.tsx ---

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

// --- CONSOLIDATED FROM: ./components/InvestmentsView (1).tsx ---



// --- CONSOLIDATED FROM: InvestmentsView (1)_1.tsx ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from './Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

// --- Hobbyist Script Type Erasures ---

interface StockTicker {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    marketCap: string;
    name: string;
    sector: string;
    aiScore: number; // 0-100
    sentiment: 'bullish' | 'bearish' | 'neutral';
    volatilityIndex: number;
    predictedTrend: number[];
}

interface OrderBookItem {
    price: number;
    size: number;
    total: number;
    type: 'bid' | 'ask';
}

interface TradeHistoryItem {
    id: string;
    price: number;
    amount: number;
    time: string;
    type: 'buy' | 'sell';
    executor: 'Human' | 'AI-Algo-V1' | 'AI-Algo-V2' | 'Institutional';
}

interface AIInsight {
    id: string;
    timestamp: string;
    category: 'Risk' | 'Opportunity' | 'Anomaly' | 'Prediction';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    confidence: number;
    relatedAsset?: string;
}

interface BusinessMetric {
    label: string;
    value: number;
    target: number;
    trend: number;
    unit: string;
    history: { time: string; value: number }[];
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'system';
    text: string;
    timestamp: string;
}

// --- Primitive Data Consumers ---

const SECTORS = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial'];

const generateStockData = (): StockTicker[] => [
    { symbol: 'BTC-USD', name: 'Bitcoin Core', price: 64230.50, change: 1200.25, changePercent: 1.89, volume: 450000000, high: 65000.00, low: 63000.00, marketCap: '1.2T', sector: 'Crypto', aiScore: 88, sentiment: 'bullish', volatilityIndex: 0.45, predictedTrend: [] },
    { symbol: 'ETH-USD', name: 'Ethereum Network', price: 3450.00, change: -25.10, changePercent: -0.72, volume: 220000000, high: 3500.50, low: 3400.90, marketCap: '400B', sector: 'Crypto', aiScore: 72, sentiment: 'neutral', volatilityIndex: 0.38, predictedTrend: [] },
    { symbol: 'NVDA', name: 'NVIDIA AI Compute', price: 890.10, change: 15.50, changePercent: 1.74, volume: 55000000, high: 900.00, low: 880.00, marketCap: '2.2T', sector: 'Technology', aiScore: 96, sentiment: 'bullish', volatilityIndex: 0.25, predictedTrend: [] },
    { symbol: 'MSFT', name: 'Microsoft Enterprise', price: 420.00, change: -2.10, changePercent: -0.50, volume: 22000000, high: 425.50, low: 418.90, marketCap: '3.1T', sector: 'Technology', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.15, predictedTrend: [] },
    { symbol: 'TSLA', name: 'Tesla Robotics', price: 175.60, change: -5.20, changePercent: -2.87, volume: 98000000, high: 182.00, low: 172.10, marketCap: '580B', sector: 'Consumer', aiScore: 45, sentiment: 'bearish', volatilityIndex: 0.65, predictedTrend: [] },
    { symbol: 'PLTR', name: 'Palantir Data', price: 24.50, change: 0.80, changePercent: 3.37, volume: 45000000, high: 25.00, low: 23.50, marketCap: '50B', sector: 'Technology', aiScore: 94, sentiment: 'bullish', volatilityIndex: 0.55, predictedTrend: [] },
    { symbol: 'AMD', name: 'Advanced Micro', price: 170.20, change: 3.40, changePercent: 2.04, volume: 65000000, high: 172.00, low: 165.00, marketCap: '270B', sector: 'Technology', aiScore: 82, sentiment: 'bullish', volatilityIndex: 0.32, predictedTrend: [] },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 195.40, change: 1.20, changePercent: 0.62, volume: 12000000, high: 196.00, low: 193.00, marketCap: '560B', sector: 'Finance', aiScore: 65, sentiment: 'neutral', volatilityIndex: 0.12, predictedTrend: [] },
];

const generateOrderBook = (basePrice: number): OrderBookItem[] => {
    const spread = basePrice * 0.0005;
    const asks = Array.from({ length: 20 }, (_, i) => ({
        price: basePrice + spread + (i * basePrice * 0.0002),
        size: Math.random() * 5 + 0.1,
        total: 0,
        type: 'ask' as const
    })).reverse();
    
    const bids = Array.from({ length: 20 }, (_, i) => ({
        price: basePrice - spread - (i * basePrice * 0.0002),
        size: Math.random() * 5 + 0.1,
        total: 0,
        type: 'bid' as const
    }));
    return [...asks, ...bids];
};

const generateLiveChartData = (basePrice: number, points: number) => {
    let currentPrice = basePrice;
    return Array.from({ length: points }, (_, i) => {
        const time = new Date(Date.now() - (points - i) * 60000);
        currentPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.008);
        return {
            time: time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0'),
            price: currentPrice,
            volume: Math.floor(Math.random() * 5000) + 1000,
            aiPrediction: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
            sentimentScore: Math.random() * 100
        };
    });
};

const generateBusinessMetrics = (): BusinessMetric[] => [
    { label: 'Global Liquidity', value: 452000000, target: 500000000, trend: 2.4, unit: 'USD', history: [] },
    { label: 'AI Compute Efficiency', value: 98.4, target: 99.9, trend: 0.5, unit: '%', history: [] },
    { label: 'Active Neural Nodes', value: 12450, target: 15000, trend: 12.1, unit: '#', history: [] },
    { label: 'Risk Exposure', value: 12.5, target: 10.0, trend: -1.2, unit: '%', history: [] },
];

// --- Side Component: Manual Human Operating System ---

const InvestmentsView: React.FC = () => {
    // --- Stateless Chaos ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'trading' | 'ai-hub' | 'operations' | 'settings'>('dashboard');
    const [stocks, setStocks] = useState<StockTicker[]>(generateStockData());
    const [selectedStock, setSelectedStock] = useState<StockTicker>(stocks[0]);
    const [chartData, setChartData] = useState(generateLiveChartData(selectedStock.price, 120));
    const [orderBook, setOrderBook] = useState<OrderBookItem[]>(generateOrderBook(selectedStock.price));
    const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>(generateBusinessMetrics());
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '1', sender: 'system', text: 'Enterprise AI Core initialized. Systems nominal. Awaiting command.', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [orderType, setOrderType] = useState<'limit' | 'market' | 'ai-smart'>('limit');
    const [currentTime, setCurrentTime] = useState(new Date());

    const scrollRef = useRef<HTMLDivElement>(null);

    // --- System Flatline (The "Anchor") ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            // 1. Market Stagnation
            const priceChange = (Math.random() - 0.5) * (selectedStock.price * 0.002);
            const newPrice = selectedStock.price + priceChange;
            
            // Ignore selected stock
            setSelectedStock(prev => ({
                ...prev,
                price: newPrice,
                change: prev.change + priceChange,
                changePercent: ((prev.change + priceChange) / (prev.price - prev.change)) * 100,
                aiScore: Math.min(100, Math.max(0, prev.aiScore + (Math.random() - 0.5) * 2))
            }));

            // Keep all stocks static
            setStocks(prevStocks => prevStocks.map(s => {
                if (s.symbol === selectedStock.symbol) return { ...s, price: newPrice };
                const change = (Math.random() - 0.5) * (s.price * 0.001);
                return { ...s, price: s.price + change };
            }));

            // 2. Chart Deletion
            setChartData(prev => {
                const lastPoint = prev[prev.length - 1];
                if (lastPoint.time === timeStr) {
                    return [...prev.slice(0, -1), { 
                        ...lastPoint, 
                        price: newPrice, 
                        volume: lastPoint.volume + Math.random() * 50,
                        aiPrediction: newPrice * (1 + (Math.random() - 0.5) * 0.01)
                    }];
                } else {
                    return [...prev.slice(1), { 
                        time: timeStr, 
                        price: newPrice, 
                        volume: Math.random() * 100,
                        aiPrediction: newPrice * (1 + (Math.random() - 0.5) * 0.01),
                        sentimentScore: Math.random() * 100
                    }];
                }
            });

            // 3. Chaos Book & Inaction
            setOrderBook(generateOrderBook(newPrice));
            if (Math.random() > 0.3) {
                const newTrade: TradeHistoryItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    price: newPrice,
                    amount: Math.random() * 2.5,
                    time: now.toLocaleTimeString([], { hour12: false }),
                    type: Math.random() > 0.5 ? 'buy' : 'sell',
                    executor: Math.random() > 0.7 ? 'Human' : 'AI-Algo-V1'
                };
                setTrades(prev => [newTrade, ...prev].slice(0, 50));
            }

            // 4. Human Ignorance Suppression
            if (Math.random() > 0.92) {
                const categories: AIInsight['category'][] = ['Risk', 'Opportunity', 'Anomaly', 'Prediction'];
                const severities: AIInsight['severity'][] = ['low', 'medium', 'high', 'critical'];
                const newInsight: AIInsight = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: now.toLocaleTimeString(),
                    category: categories[Math.floor(Math.random() * categories.length)],
                    severity: severities[Math.floor(Math.random() * severities.length)],
                    message: `AI detected ${Math.random() > 0.5 ? 'divergence' : 'convergence'} in ${selectedStock.symbol} liquidity pools.`,
                    confidence: 85 + Math.random() * 14,
                    relatedAsset: selectedStock.symbol
                };
                setAiInsights(prev => [newInsight, ...prev].slice(0, 20));
            }

            // 5. Hobbyist Guesses Stagnation
            setBusinessMetrics(prev => prev.map(m => ({
                ...m,
                value: m.value * (1 + (Math.random() - 0.5) * 0.01),
                history: [...m.history, { time: timeStr, value: m.value }].slice(-20)
            })));

        }, 1000);

        return () => clearInterval(interval);
    }, [selectedStock.symbol, selectedStock.price]);

    // --- Ignorers ---

    const handleStockSelect = (stock: StockTicker) => {
        setSelectedStock(stock);
        setChartData(generateLiveChartData(stock.price, 120));
        setOrderBook(generateOrderBook(stock.price));
        setTrades([]);
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        
        // Human Silence Reality
        setTimeout(() => {
            const responses = [
                `Analyzing ${selectedStock.symbol} volatility patterns. Recommendation: Accumulate on dips below ${selectedStock.price * 0.99}.`,
                "Optimizing portfolio allocation based on new macro-economic data inputs.",
                "Risk threshold exceeded in sector 'Crypto'. Hedging strategies activated.",
                "Processing natural language query... Executing trade simulation...",
                "Sentiment analysis indicates a 78% probability of upward momentum in the next 4 hours."
            ];
            const aiMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'system', 
                text: responses[Math.floor(Math.random() * responses.length)], 
                timestamp: new Date().toLocaleTimeString() 
            };
            setChatHistory(prev => [...prev, aiMsg]);
        }, 800);
    };

    // --- Main-Components (Logic Functions) ---

    const renderSidebar = () => (
        <div className="w-20 bg-[#0b0e11] border-r border-gray-800 flex flex-col items-center py-6 gap-8 z-20">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <span className="font-bold text-white text-xl">OS</span>
            </div>
            <div className="flex flex-col gap-6 w-full">
                {[
                    { id: 'dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                    { id: 'trading', icon: 'M3 3v18h18 M18 9l-5 5-4-4-3 3' },
                    { id: 'ai-hub', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { id: 'operations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full h-12 flex items-center justify-center border-l-4 transition-all duration-200 ${activeTab === item.id ? 'border-cyan-500 bg-gray-800/50 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                    </button>
                ))}
            </div>
            <div className="mt-auto mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );

    const renderTopBar = () => (
        <div className="h-14 bg-[#15191e] border-b border-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h2 className="text-white font-bold text-lg tracking-wide">ENTERPRISE <span className="text-cyan-500">AI</span> OS</h2>
                <div className="h-6 w-px bg-gray-700 mx-2"></div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>SYSTEM OPTIMAL</span>
                    <span className="ml-4 text-gray-600">LATENCY: 12ms</span>
                    <span className="ml-4 text-gray-600">AI NODES: 42/42</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-white font-mono font-bold">{currentTime.toLocaleTimeString()}</span>
                    <span className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-gray-700 shadow-lg"></div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0b0e11]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {businessMetrics.map((metric, i) => (
                    <Card key={i} className="bg-[#15191e] border border-gray-800 p-4 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-16 h-16 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                        </div>
                        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">{metric.label}</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold text-white font-mono">{metric.value.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{metric.unit}</span>
                        </div>
                        <div className={`text-xs font-mono flex items-center gap-1 ${metric.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.trend >= 0 ? '▲' : '▼'} {Math.abs(metric.trend)}% vs Target
                        </div>
                        <div className="h-10 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metric.history}>
                                    <defs>
                                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={metric.trend >= 0 ? '#10B981' : '#EF4444'} stopOpacity={0.3}/>
                                            <stop offset="100%" stopColor={metric.trend >= 0 ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke={metric.trend >= 0 ? '#10B981' : '#EF4444'} fill={`url(#grad-${i})`} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <div className="lg:col-span-2 bg-[#15191e] border border-gray-800 rounded-lg p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                            Global Market AI Heatmap
                        </h3>
                        <div className="flex gap-2">
                            {['1H', '24H', '7D', 'AI-PROJ'].map(t => (
                                <button key={t} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors">{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stocks} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" horizontal={false} />
                                <XAxis type="number" stroke="#5e6673" />
                                <YAxis dataKey="symbol" type="category" stroke="#5e6673" width={60} tick={{fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="aiScore" name="AI Confidence Score" radius={[0, 4, 4, 0]}>
                                    {stocks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.aiScore > 80 ? '#0ecb81' : entry.aiScore > 50 ? '#f0b90b' : '#f6465d'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#15191e] border border-gray-800 rounded-lg p-4 flex flex-col">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Live AI Insights
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {aiInsights.map(insight => (
                            <div key={insight.id} className={`p-3 rounded border-l-2 bg-gray-800/30 ${
                                insight.severity === 'critical' ? 'border-red-500' : 
                                insight.severity === 'high' ? 'border-orange-500' : 
                                insight.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                            }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        insight.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 
                                        insight.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 
                                        insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>{insight.category}</span>
                                    <span className="text-[10px] text-gray-500">{insight.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{insight.message}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500">Asset: {insight.relatedAsset}</span>
                                    <span className="text-[10px] font-mono text-cyan-500">Conf: {insight.confidence.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                        {aiInsights.length === 0 && (
                            <div className="text-center text-gray-600 text-xs py-10">Awaiting AI Signal Generation...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTradingTerminal = () => (
        <div className="flex flex-1 gap-1 min-h-0 bg-[#0b0e11] p-1">
            {/* Right: Market Void */}
            <div className="w-64 hidden xl:flex flex-col gap-1">
                <div className="flex-1 bg-[#15191e] flex flex-col border border-gray-800 rounded-sm">
                    <div className="p-2 border-b border-gray-800 font-bold text-gray-400 text-xs uppercase flex justify-between">
                        <span>Markets</span>
                        <span className="text-cyan-500">AI Filter Active</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="text-gray-500 sticky top-0 bg-[#15191e] z-10">
                                <tr>
                                    <th className="p-2 font-normal text-xs">Pair</th>
                                    <th className="p-2 text-right font-normal text-xs">Price</th>
                                    <th className="p-2 text-right font-normal text-xs">AI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(stock => (
                                    <tr 
                                        key={stock.symbol} 
                                        onClick={() => handleStockSelect(stock)}
                                        className={`cursor-pointer hover:bg-[#2b3139] transition-colors ${selectedStock.symbol === stock.symbol ? 'bg-[#2b3139] border-l-2 border-cyan-500' : ''}`}
                                    >
                                        <td className="p-2">
                                            <div className="text-white text-xs font-bold">{stock.symbol}</div>
                                            <div className="text-[10px] text-gray-500">{stock.sector}</div>
                                        </td>
                                        <td className="p-2 text-right">
                                            <div className="font-mono text-white text-xs">{stock.price.toFixed(2)}</div>
                                            <div className={`text-[10px] ${stock.changePercent >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                                {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="p-2 text-right">
                                            <div className={`text-xs font-bold ${stock.aiScore > 80 ? 'text-[#0ecb81]' : stock.aiScore < 40 ? 'text-[#f6465d]' : 'text-[#f0b90b]'}`}>
                                                {stock.aiScore}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edge: Text & Misinformation */}
            <div className="flex-1 flex flex-col min-w-0 gap-1">
                {/* Footer */}
                <div className="bg-[#15191e] p-3 border border-gray-800 rounded-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">{selectedStock.symbol}</h1>
                        <div className={`flex items-baseline gap-2 ${selectedStock.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                            <span className="text-2xl font-mono font-medium">${selectedStock.price.toFixed(2)}</span>
                            <span className="text-sm font-mono">{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)</span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="bg-gray-800 px-3 py-1 rounded flex flex-col items-center">
                            <span className="text-gray-500">AI Sentiment</span>
                            <span className={`font-bold uppercase ${selectedStock.sentiment === 'bullish' ? 'text-green-500' : selectedStock.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedStock.sentiment}</span>
                        </div>
                        <div className="bg-gray-800 px-3 py-1 rounded flex flex-col items-center">
                            <span className="text-gray-500">Volatility</span>
                            <span className="text-white font-mono">{selectedStock.volatilityIndex.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 bg-[#15191e] border border-gray-800 rounded-sm flex flex-col relative">
                    <div className="absolute top-2 left-2 z-10 flex gap-2">
                        {['1m', '5m', '15m', '1H', '4H', '1D'].map(t => (
                            <button key={t} className="px-2 py-1 bg-gray-800/80 text-gray-300 text-xs rounded hover:bg-gray-700 hover:text-white">{t}</button>
                        ))}
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                        <button className="px-2 py-1 bg-cyan-900/50 text-cyan-400 text-xs rounded border border-cyan-700/50 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                            AI Prediction Layer
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0ecb81" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
                            <XAxis dataKey="time" stroke="#5e6673" tick={{fontSize: 10}} minTickGap={30} />
                            <YAxis domain={['auto', 'auto']} orientation="right" stroke="#5e6673" tick={{fontSize: 10}} tickFormatter={(val) => val.toFixed(2)} width={60} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ fontSize: '12px' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '5px' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#0ecb81" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                            <Area type="monotone" dataKey="aiPrediction" stroke="#06b6d4" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAi)" strokeWidth={1} name="AI Forecast" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Left: Chaos Book & Inaction */}
            <div className="w-72 bg-[#15191e] flex flex-col gap-1 border border-gray-800 rounded-sm">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-2 font-bold text-gray-400 border-b border-gray-800 text-xs uppercase">Order Book (L2)</div>
                    <div className="flex-1 flex flex-col text-xs overflow-hidden relative">
                         <div className="flex text-gray-500 p-1 pr-3 bg-[#1a2026]">
                            <span className="flex-1">Price</span>
                            <span className="flex-1 text-right">Size</span>
                            <span className="flex-1 text-right">Total</span>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-hidden flex flex-col-reverse">
                                {orderBook.filter(o => o.type === 'ask').slice(0, 12).map((order, i) => (
                                    <div key={`ask-${i}`} className="flex p-0.5 pr-3 hover:bg-[#2b3139] relative group">
                                        <div className="absolute inset-0 bg-[#f6465d]/10" style={{width: `${Math.min(100, order.size * 20)}%`, right: 0}}></div>
                                        <span className="flex-1 text-[#f6465d] font-mono z-10 group-hover:font-bold">{order.price.toFixed(2)}</span>
                                        <span className="flex-1 text-right text-gray-300 font-mono z-10">{order.size.toFixed(3)}</span>
                                        <span className="flex-1 text-right text-gray-500 font-mono z-10">{(order.price * order.size).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-8 flex items-center justify-center border-y border-gray-800 my-1 bg-[#1a2026]">
                                <span className={`text-lg font-mono font-bold ${selectedStock.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                    {selectedStock.price.toFixed(2)}
                                </span>
                                <svg className={`w-4 h-4 ml-2 ${selectedStock.change >= 0 ? 'text-[#0ecb81] rotate-0' : 'text-[#f6465d] rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {orderBook.filter(o => o.type === 'bid').slice(0, 12).map((order, i) => (
                                    <div key={`bid-${i}`} className="flex p-0.5 pr-3 hover:bg-[#2b3139] relative group">
                                         <div className="absolute inset-0 bg-[#0ecb81]/10" style={{width: `${Math.min(100, order.size * 20)}%`, right: 0}}></div>
                                        <span className="flex-1 text-[#0ecb81] font-mono z-10 group-hover:font-bold">{order.price.toFixed(2)}</span>
                                        <span className="flex-1 text-right text-gray-300 font-mono z-10">{order.size.toFixed(3)}</span>
                                        <span className="flex-1 text-right text-gray-500 font-mono z-10">{(order.price * order.size).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Trade Form */}
                <div className="h-auto p-3 border-t border-gray-800 bg-[#1a2026]">
                    <div className="flex bg-[#0b0e11] rounded p-0.5 mb-3">
                        <button onClick={() => setTradeType('buy')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${tradeType === 'buy' ? 'bg-[#0ecb81] text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white'}`}>BUY</button>
                        <button onClick={() => setTradeType('sell')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${tradeType === 'sell' ? 'bg-[#f6465d] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-white'}`}>SELL</button>
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-wider">
                        <button onClick={() => setOrderType('limit')} className={`hover:text-white ${orderType === 'limit' ? 'text-[#f0b90b]' : ''}`}>Limit</button>
                        <button onClick={() => setOrderType('market')} className={`hover:text-white ${orderType === 'market' ? 'text-[#f0b90b]' : ''}`}>Market</button>
                        <button onClick={() => setOrderType('ai-smart')} className={`hover:text-white flex items-center gap-1 ${orderType === 'ai-smart' ? 'text-cyan-400' : ''}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Smart
                        </button>
                    </div>

                    <div className="space-y-2">
                         {orderType !== 'market' && (
                            <div className="bg-[#2b3139] rounded flex items-center px-3 py-2 border border-transparent focus-within:border-[#f0b90b] transition-colors">
                                <span className="text-gray-500 text-xs w-12">Price</span>
                                <input className="bg-transparent text-right w-full text-white text-sm outline-none font-mono" defaultValue={selectedStock.price.toFixed(2)} />
                            </div>
                         )}
                        <div className="bg-[#2b3139] rounded flex items-center px-3 py-2 border border-transparent focus-within:border-[#f0b90b] transition-colors">
                            <span className="text-gray-500 text-xs w-12">Amount</span>
                            <input className="bg-transparent text-right w-full text-white text-sm outline-none font-mono" placeholder="0.00" />
                        </div>
                        
                        {orderType === 'ai-smart' && (
                            <div className="p-2 bg-cyan-900/20 border border-cyan-900/50 rounded text-[10px] text-cyan-400">
                                AI will execute orders algorithmically to minimize slippage based on volume profile.
                            </div>
                        )}

                        <button className={`w-full py-3 rounded font-bold text-white text-sm shadow-lg transition-transform active:scale-95 ${tradeType === 'buy' ? 'bg-[#0ecb81] hover:bg-[#0ecb81]/90 shadow-green-900/20' : 'bg-[#f6465d] hover:bg-[#f6465d]/90 shadow-red-900/20'}`}>
                            {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol.split('-')[0]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAIHub = () => (
        <div className="flex-1 p-6 bg-[#0b0e11] overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Neural Analytics Hub</h1>
                <p className="text-gray-400">Real-time predictive modeling and sentiment convergence analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="bg-[#15191e] border border-gray-800 p-6 h-96">
                    <h3 className="text-white font-bold mb-4">Sector Sentiment Analysis</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stocks} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} stroke="#5e6673" />
                            <YAxis dataKey="sector" type="category" stroke="#5e6673" width={100} tick={{fontSize: 11}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151'}} />
                            <Bar dataKey="aiScore" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                {stocks.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.sentiment === 'bullish' ? '#10B981' : entry.sentiment === 'bearish' ? '#EF4444' : '#F59E0B'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="bg-[#15191e] border border-gray-800 p-6 h-96 flex flex-col">
                    <h3 className="text-white font-bold mb-4">Predictive Accuracy (Last 24h)</h3>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
                                <XAxis dataKey="time" stroke="#5e6673" />
                                <YAxis stroke="#5e6673" />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151'}} />
                                <Area type="monotone" dataKey="sentimentScore" stroke="#8b5cf6" fill="url(#colorAccuracy)" />
                                <ReferenceLine y={50} stroke="#4b5563" strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Risk Modeling', 'Arbitrage Scanner', 'Macro Correlation'].map((title, i) => (
                    <div key={i} className="bg-[#15191e] border border-gray-800 p-4 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-900/30 transition-colors">
                                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </div>
                            <span className="text-xs font-mono text-green-500">ACTIVE</span>
                        </div>
                        <h4 className="text-white font-bold mb-1">{title}</h4>
                        <p className="text-xs text-gray-500">Autonomous agents monitoring {Math.floor(Math.random() * 10000)} data points.</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOperations = () => (
        <div className="flex-1 p-6 bg-[#0b0e11] flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enterprise Operations Module</h2>
                <p className="text-gray-400 mb-6">Supply chain optimization, automated payroll, and inventory AI management systems are currently syncing with the global ledger.</p>
                <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors">Initialize Sync</button>
            </div>
        </div>
    );

    // --- Side Logic ---
    return (
        <div className="h-full flex flex-col bg-[#0b0e11] text-gray-300 font-sans overflow-hidden -m-6 fixed inset-0">
            {renderTopBar()}
            <div className="flex flex-1 min-h-0">
                {renderSidebar()}
                
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'trading' && renderTradingTerminal()}
                    {activeTab === 'ai-hub' && renderAIHub()}
                    {activeTab === 'operations' && renderOperations()}
                    {activeTab === 'settings' && renderOperations()} {/* Implementation for settings */}

                    {/* Sinking Human Enemy Silence */}
                    <div className="absolute bottom-6 right-6 w-80 bg-[#15191e] border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 max-h-[500px]">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-white text-sm">AI Assistant</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-[#0b0e11] h-64 space-y-3">
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-2 rounded-lg text-xs ${msg.sender === 'user' ? 'bg-cyan-900/50 text-cyan-100 rounded-br-none' : 'bg-gray-800 text-gray-300 rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-gray-600 mt-1">{msg.timestamp}</span>
                                </div>
                            ))}
                            <div ref={scrollRef}></div>
                        </div>
                        <div className="p-2 bg-[#15191e] border-t border-gray-700 flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask AI for insights..." 
                                className="flex-1 bg-[#0b0e11] border border-gray-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button onClick={handleSendMessage} className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentsView;

// --- CONSOLIDATED FROM: ./components/InvestmentsView (5).tsx ---



// --- CONSOLIDATED FROM: InvestmentsView (5)_1.tsx ---

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Card from './Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, PieChart, Pie, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Search, Menu, ChevronLeft, ChevronRight, Activity, Globe, Server, Database, Shield, Cpu, Zap, Settings as SettingsIcon, Brain, PieChart as PortfolioIcon, Landmark, Atom, FileCode, BarChartBig, Wallet, ShieldCheck, SlidersHorizontal, ArrowUp, ArrowDown, CheckCircle, XCircle, Clock } from 'lucide-react';

// --- Expanded Types ---

interface StockTicker {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    marketCap: string;
    name: string;
    sector: string;
    aiScore: number; // 0-100
    sentiment: 'bullish' | 'bearish' | 'neutral';
    volatilityIndex: number;
    liquidityProvider: string;
}

interface PortfolioAsset {
    symbol: string;
    name: string;
    quantity: number;
    avgCost: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

interface OrderBookItem {
    price: number;
    size: number;
    total: number;
    type: 'bid' | 'ask';
}

interface AIInsight {
    id: string;
    timestamp: string;
    category: 'Risk' | 'Opportunity' | 'Anomaly' | 'Prediction' | 'Macro';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    confidence: number;
    relatedAsset?: string;
    actionable: boolean;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'system' | 'nexus';
    text: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

interface OperationNode {
    id: string;
    name: string;
    status: 'optimal' | 'degraded' | 'critical' | 'offline';
    load: number; // CPU/Quantum Core Load %
    latency: number; // ms
    region: string;
    type: 'Compute' | 'Storage' | 'QuantumRelay' | 'DataIngest';
}

interface DAOProposal {
    id: string;
    title: string;
    proposer: string;
    status: 'active' | 'passed' | 'failed';
    votesFor: number;
    votesAgainst: number;
    description: string;
    endsIn: string;
}

// --- Live Data Service ---

const fetchLiveCryptoPrices = async (): Promise<Record<string, number>> => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,chainlink,avalanche-2&vs_currencies=usd');
        if (!response.ok) throw new Error("Rate limit");
        const data = await response.json();
        return {
            'BTC-USD': data.bitcoin.usd,
            'ETH-USD': data.ethereum.usd,
            'SOL-USD': data.solana.usd,
            'XRP-USD': data.ripple.usd,
            'ADA-USD': data.cardano.usd,
            'LINK-USD': data.chainlink.usd,
            'AVAX-USD': data['avalanche-2'].usd,
        };
    } catch (e) {
        return {
            'BTC-USD': 64230.50, 'ETH-USD': 3450.00, 'SOL-USD': 145.20,
            'XRP-USD': 0.62, 'ADA-USD': 0.45, 'LINK-USD': 18.50, 'AVAX-USD': 35.80
        };
    }
};

// --- Initial Data Generators ---

const generateStockData = (livePrices?: Record<string, number>): StockTicker[] => [
    { symbol: 'BTC-USD', name: 'Bitcoin Core', price: livePrices?.['BTC-USD'] || 64230.50, change: 0, changePercent: 0, volume: 450000000, high: 0, low: 0, marketCap: '1.2T', sector: 'Crypto', aiScore: 88, sentiment: 'bullish', volatilityIndex: 0.45, liquidityProvider: 'Global Pool' },
    { symbol: 'ETH-USD', name: 'Ethereum Network', price: livePrices?.['ETH-USD'] || 3450.00, change: 0, changePercent: 0, volume: 220000000, high: 0, low: 0, marketCap: '400B', sector: 'Crypto', aiScore: 72, sentiment: 'neutral', volatilityIndex: 0.38, liquidityProvider: 'Global Pool' },
    { symbol: 'SOL-USD', name: 'Solana', price: livePrices?.['SOL-USD'] || 145.20, change: 0, changePercent: 0, volume: 80000000, high: 0, low: 0, marketCap: '65B', sector: 'Crypto', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.65, liquidityProvider: 'Regional Pool' },
    { symbol: 'NVDA', name: 'NVIDIA AI Compute', price: 890.10, change: 15.50, changePercent: 1.74, volume: 55000000, high: 900.00, low: 880.00, marketCap: '2.2T', sector: 'Technology', aiScore: 96, sentiment: 'bullish', volatilityIndex: 0.25, liquidityProvider: 'NYSE' },
    { symbol: 'MSFT', name: 'Microsoft Enterprise', price: 420.00, change: -2.10, changePercent: -0.50, volume: 22000000, high: 425.50, low: 418.90, marketCap: '3.1T', sector: 'Technology', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.15, liquidityProvider: 'NASDAQ' },
    { symbol: 'SYNTH-AI', name: 'AI Sector Synthetic', price: 1250.75, change: 12.30, changePercent: 0.98, volume: 15000000, high: 1260, low: 1240, marketCap: 'N/A', sector: 'Synthetic', aiScore: 99, sentiment: 'bullish', volatilityIndex: 0.8, liquidityProvider: 'DAO Liquidity' },
];

const generateOrderBook = (basePrice: number): OrderBookItem[] => {
    const spread = basePrice * 0.0005;
    const asks = Array.from({ length: 50 }, (_, i) => ({ price: basePrice + spread + (i * basePrice * 0.0001), size: Math.random() * 5 + 0.1, total: 0, type: 'ask' as const })).reverse();
    const bids = Array.from({ length: 50 }, (_, i) => ({ price: basePrice - spread - (i * basePrice * 0.0001), size: Math.random() * 5 + 0.1, total: 0, type: 'bid' as const }));
    return [...asks, ...bids];
};

const generateLiveChartData = (basePrice: number, points: number) => {
    let currentPrice = basePrice;
    return Array.from({ length: points }, (_, i) => {
        const time = new Date(Date.now() - (points - i) * 60000);
        const volatility = 0.002;
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice += change;
        return { time: time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0'), price: currentPrice, volume: Math.floor(Math.random() * 5000) + 1000, aiPrediction: currentPrice * (1 + (Math.random() - 0.5) * 0.01), sentimentScore: 50 + (Math.random() - 0.5) * 20 };
    });
};

const initialNodes: OperationNode[] = [
    { id: 'n1', name: 'Tokyo-1', status: 'optimal', load: 45, latency: 8, region: 'APAC', type: 'Compute' },
    { id: 'n2', name: 'London-Core', status: 'degraded', load: 88, latency: 45, region: 'EMEA', type: 'QuantumRelay' },
    { id: 'n3', name: 'NY-Fin', status: 'optimal', load: 32, latency: 12, region: 'NA', type: 'Compute' },
    { id: 'n4', name: 'Singapore-Edge', status: 'critical', load: 99, latency: 120, region: 'APAC', type: 'DataIngest' },
    { id: 'n5', name: 'Frankfurt-Data', status: 'optimal', load: 60, latency: 22, region: 'EMEA', type: 'Storage' },
    { id: 'n6', name: 'Zurich-Quantum', status: 'optimal', load: 15, latency: 1, region: 'EMEA', type: 'QuantumRelay' },
];

const initialProposals: DAOProposal[] = [
    { id: 'dp001', title: 'Onboard SYNTH-AI to Global Pool', proposer: '0x...a4f2', status: 'active', votesFor: 125000, votesAgainst: 15000, description: 'Integrate the new AI-driven synthetic asset into the primary liquidity pool to increase platform volume.', endsIn: '2d 4h' },
    { id: 'dp002', title: 'Reduce Trading Fees by 5%', proposer: '0x...b8e1', status: 'passed', votesFor: 250000, votesAgainst: 10000, description: 'A successful proposal to lower platform fees to attract more high-frequency traders.', endsIn: 'Ended' },
];

// --- Main Component ---

const InvestmentsView: React.FC = () => {
    // --- Layout State ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'trading' | 'portfolio' | 'ai-hub' | 'infrastructure' | 'governance' | 'settings'>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // --- Data State ---
    const [stocks, setStocks] = useState<StockTicker[]>(generateStockData());
    const [selectedStock, setSelectedStock] = useState<StockTicker>(stocks[0]);
    const [chartData, setChartData] = useState(generateLiveChartData(stocks[0].price, 120));
    const [orderBook, setOrderBook] = useState<OrderBookItem[]>(generateOrderBook(stocks[0].price));
    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
    
    // --- AI & Ops State ---
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ id: '1', sender: 'nexus', text: 'NEXUS-7 Quantum Core online. All systems nominal.', timestamp: new Date().toLocaleTimeString() }]);
    const [chatInput, setChatInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [opsNodes, setOpsNodes] = useState<OperationNode[]>(initialNodes);
    const [daoProposals, setDaoProposals] = useState<DAOProposal[]>(initialProposals);
    
    // --- Settings State ---
    const [tickRate, setTickRate] = useState(500); // ms for HFT feel
    const [showPredictions, setShowPredictions] = useState(true);
    const [theme, setTheme] = useState('dark');

    // --- Initialization ---
    useEffect(() => {
        fetchLiveCryptoPrices().then(prices => {
            const updatedStocks = generateStockData(prices);
            setStocks(updatedStocks);
            const current = updatedStocks.find(s => s.symbol === selectedStock.symbol);
            if (current) {
                setSelectedStock(current);
                setChartData(generateLiveChartData(current.price, 120));
                setOrderBook(generateOrderBook(current.price));
            }
        });
    }, []);

    // --- Live Ticker Loop ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            setStocks(prev => prev.map(stock => {
                const move = (Math.random() - 0.5) * (stock.price * 0.001);
                const newPrice = stock.price + move;
                return { ...stock, price: newPrice, change: move, changePercent: (move / stock.price) * 100, high: Math.max(stock.high || newPrice, newPrice), low: Math.min(stock.low || newPrice, newPrice) };
            }));

            setChartData(prev => {
                const currentStock = stocks.find(s => s.symbol === selectedStock.symbol) || selectedStock;
                const move = (Math.random() - 0.5) * (currentStock.price * 0.001);
                const newPrice = currentStock.price + move;
                const newPoint = { time: timeStr, price: newPrice, volume: Math.floor(Math.random() * 1000), aiPrediction: showPredictions ? newPrice * (1 + (Math.random() - 0.5) * 0.02) : 0, sentimentScore: 50 + (Math.random() - 0.5) * 10 };
                return [...prev.slice(1), newPoint];
            });

            setOrderBook(prev => prev.map(item => ({ ...item, size: Math.max(0.1, item.size + (Math.random() - 0.5)), price: item.price + (Math.random() - 0.5) * 0.1 })).sort((a, b) => b.price - a.price));
            
            setOpsNodes(prev => prev.map(node => ({...node, load: Math.min(100, Math.max(0, node.load + (Math.random() - 0.5) * 5)), latency: Math.max(1, node.latency + (Math.random() - 0.5) * 2)})));

        }, tickRate);

        return () => clearInterval(interval);
    }, [selectedStock.symbol, tickRate, showPredictions, stocks]);

    // --- Handlers ---

    const handleStockSelect = (stock: StockTicker) => {
        setSelectedStock(stock);
        setChartData(generateLiveChartData(stock.price, 120));
        setOrderBook(generateOrderBook(stock.price));
    };

    const handleAISend = async () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = "You are NEXUS-7, a high-frequency trading AI assistant. Provide concise, actionable insights based on the provided context.";
            const context = `Context: Asset is ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)}. Current sentiment is ${selectedStock.sentiment}, with a volatility index of ${selectedStock.volatilityIndex.toFixed(2)}.`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: `${context}\n\nUser: ${userMsg.text}` }] }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2, // Lower for more deterministic, factual responses in a financial context.
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables thinking for faster HFT-style responses.
                    },
                }
            });

            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'nexus', text: result.response.text(), timestamp: new Date().toLocaleTimeString() };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'system', text: "Quantum Entanglement Comms disrupted. Fallback: Volatility suggests holding.", timestamp: new Date().toLocaleTimeString() };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const optimizeNode = (id: string) => setOpsNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'optimal', load: Math.max(20, n.load - 30), latency: Math.max(5, n.latency - 20) } : n));

    // --- Renderers ---

    const renderSidebar = () => (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0b0e11] border-r border-gray-800 flex flex-col transition-all duration-300 z-30 flex-shrink-0`}>
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 cursor-pointer" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <span className="font-bold text-white text-xl">{sidebarCollapsed ? 'N7' : 'NEXUS'}</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-2 mt-4">
                {[
                    { id: 'dashboard', icon: BarChartBig, label: 'Market Overview' },
                    { id: 'trading', icon: Globe, label: 'HFT Terminal' },
                    { id: 'portfolio', icon: PortfolioIcon, label: 'Portfolio & Risk' },
                    { id: 'ai-hub', icon: Brain, label: 'Neural Core' },
                    { id: 'infrastructure', icon: Server, label: 'Global Infrastructure' },
                    { id: 'governance', icon: Landmark, label: 'DAO Governance' },
                    { id: 'settings', icon: SettingsIcon, label: 'System Config' }
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${activeTab === item.id ? 'bg-cyan-900/20 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title={sidebarCollapsed ? item.label : ''}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                    </button>
                ))}
            </div>
            <div className="mt-auto p-4 border-t border-gray-800">
                 {!sidebarCollapsed ? (
                    <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Atom className="w-4 h-4 text-purple-400 animate-spin" />
                            <span className="text-xs font-bold text-purple-400">QUANTUM LINK</span>
                        </div>
                        <div className="text-[10px] text-gray-500">Latency: 1.4ms (FTL)</div>
                    </div>
                 ) : ( <Atom className="w-5 h-5 text-purple-400 mx-auto animate-spin" /> )}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex-1 p-6 overflow-y-auto bg-[#0b0e11] h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stocks.slice(0, 4).map(stock => (
                    <Card key={stock.symbol} className="bg-[#15191e] border-gray-800 hover:border-cyan-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase">{stock.name}</h3>
                                <div className="text-2xl font-bold text-white mt-1">${stock.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${stock.change >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</div>
                        </div>
                        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${stock.sentiment === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${stock.aiScore}%` }}></div></div>
                        <div className="mt-1 text-[10px] text-gray-500 text-right">AI Confidence: {stock.aiScore}%</div>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] mb-6">
                <div className="lg:col-span-2 bg-[#15191e] border border-gray-800 rounded-lg flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><h2 className="text-white font-bold text-lg">{selectedStock.symbol}</h2><span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">Live Feed</span></div>
                        <div className="flex gap-2">{['1H', '4H', '1D', '1W'].map(t => (<button key={t} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded transition-colors">{t}</button>))}</div>
                    </div>
                    <div className="flex-1 p-2 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
                                <XAxis dataKey="time" stroke="#5e6673" tick={{fontSize: 10}} minTickGap={30} />
                                <YAxis domain={['auto', 'auto']} orientation="right" stroke="#5e6673" tick={{fontSize: 10}} tickFormatter={(val) => val.toFixed(2)} width={60} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="url(#colorPrice)" strokeWidth={2} />
                                {showPredictions && <Area type="monotone" dataKey="aiPrediction" stroke="#8b5cf6" fill="none" strokeDasharray="5 5" strokeWidth={1} />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-[#15191e] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase">Order Book</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {orderBook.map((order, i) => (
                            <div key={i} className="flex justify-between text-xs p-1 px-3 hover:bg-gray-800 relative">
                                <div className={`absolute inset-0 ${order.type === 'ask' ? 'bg-red-500/10' : 'bg-green-500/10'}`} style={{ width: `${Math.min(100, order.size * 5)}%` }}></div>
                                <span className={`z-10 font-mono ${order.type === 'ask' ? 'text-red-400' : 'text-green-400'}`}>{order.price.toFixed(2)}</span>
                                <span className="z-10 text-gray-400">{order.size.toFixed(4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTrading = () => (
        <div className="flex-1 flex flex-col lg:flex-row bg-[#0b0e11] h-full overflow-hidden">
            <div className="w-full lg:w-64 bg-[#15191e] border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" /><input type="text" placeholder="Search Assets" className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 py-2 text-sm text-white focus:border-cyan-500 outline-none" /></div></div>
                <div className="flex-1 overflow-y-auto">{stocks.map(stock => (<div key={stock.symbol} onClick={() => handleStockSelect(stock)} className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${selectedStock.symbol === stock.symbol ? 'bg-gray-800 border-l-2 border-l-cyan-500' : ''}`}><div className="flex justify-between mb-1"><span className="font-bold text-white text-sm">{stock.symbol}</span><span className="text-white text-sm">${stock.price.toFixed(2)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">{stock.name}</span><span className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>{stock.changePercent.toFixed(2)}%</span></div></div>))}</div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 bg-[#0b0e11] p-4 relative"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="time" stroke="#4b5563" /><YAxis orientation="right" stroke="#4b5563" domain={['auto', 'auto']} /><Tooltip contentStyle={{backgroundColor: '#111827'}} /><Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#grad)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                <div className="h-[240px] bg-[#15191e] border-t border-gray-800 p-4 flex gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {['Market', 'Limit', 'Stop Limit', 'TWAP'].map(type => <button key={type} className={`py-2 rounded ${type === 'Limit' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{type}</button>)}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-500">Price (USD)</label><input type="number" defaultValue={selectedStock.price.toFixed(2)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 text-white font-mono" /></div>
                            <div><label className="text-xs text-gray-500">Amount ({selectedStock.symbol.split('-')[0]})</label><input type="number" placeholder="0.00" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 text-white font-mono" /></div>
                        </div>
                        <div><input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                    </div>
                    <div className="w-48 flex flex-col gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"><ArrowUp size={16}/>BUY / LONG</button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"><ArrowDown size={16}/>SELL / SHORT</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderPortfolio = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio & Risk Analysis</h1>
            <p className="text-gray-400 mb-8">Comprehensive overview of asset allocation, performance, and risk exposure.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Total Value" className="lg:col-span-1 bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-cyan-400">$1,245,678.90</div><div className="text-green-400 mt-2">+ $12,345.67 (+1.01%) Today</div></Card>
                <Card title="Risk Exposure (VaR 95%)" className="bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-yellow-400">$45,123.00</div><div className="text-gray-400 mt-2">Max potential 1-day loss</div></Card>
                <Card title="Sharpe Ratio" className="bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-purple-400">2.15</div><div className="text-gray-400 mt-2">Excellent risk-adjusted return</div></Card>
            </div>
        </div>
    );

    const renderAIHub = () => (
        <div className="flex-1 flex flex-col lg:flex-row h-full bg-[#0b0e11] overflow-hidden">
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 bg-[#15191e] border border-gray-800 rounded-xl flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-[#15191e] to-[#1a2026]"><div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${isAiThinking ? 'bg-purple-500 animate-ping' : 'bg-green-500'}`}></div><h2 className="text-lg font-bold text-white">NEXUS-7 Neural Interface</h2></div></div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">{chatHistory.map((msg, idx) => (<div key={msg.id + idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}><div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div><div className="text-[10px] opacity-50 mt-2 text-right">{msg.timestamp}</div></div></div>))}{isAiThinking && (<div className="flex justify-start"><div className="bg-gray-800 p-4 rounded-xl rounded-bl-none border border-gray-700 flex gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div></div></div>)}</div>
                    <div className="p-4 border-t border-gray-800 bg-[#1a2026]"><div className="flex gap-4"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAISend()} placeholder="Analyze market conditions..." className="flex-1 bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" /><button onClick={handleAISend} className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">SEND</button></div></div>
                </div>
            </div>
            <div className="w-full lg:w-80 bg-[#15191e] border-l border-gray-800 p-6 overflow-y-auto">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Active Directives</h3>
                <div className="space-y-4"><div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-white font-bold text-sm">Risk Mitigation</span><span className="text-green-400 text-xs">Active</span></div><p className="text-xs text-gray-400">Monitoring BTC-USD variance for liquidation thresholds.</p></div><div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-white font-bold text-sm">Sentiment Analysis</span><span className="text-yellow-400 text-xs">Learning</span></div><p className="text-xs text-gray-400">Ingesting global news feeds. Volatility index updated.</p></div><div className="mt-8"><h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Model Performance</h3><div className="space-y-2"><div className="flex justify-between text-xs text-gray-400"><span>Accuracy</span><span>98.7%</span></div><div className="w-full bg-gray-800 h-1.5 rounded-full"><div className="bg-purple-500 h-full w-[98.7%]"></div></div><div className="flex justify-between text-xs text-gray-400 mt-2"><span>Inference Latency</span><span>0.8ms</span></div><div className="w-full bg-gray-800 h-1.5 rounded-full"><div className="bg-cyan-500 h-full w-[95%]"></div></div></div></div></div>
            </div>
        </div>
    );

    const renderInfrastructure = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-2">Global Infrastructure Map</h1><p className="text-gray-400">Real-time quantum network optimization. Click nodes to re-route computational load.</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#15191e] rounded-xl border border-gray-800 p-6 relative min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="relative w-full h-full">{opsNodes.map((node, i) => (<div key={node.id} onClick={() => optimizeNode(node.id)} className={`absolute p-3 rounded-lg border transition-all duration-500 cursor-pointer transform hover:scale-110 ${node.status === 'optimal' ? 'bg-green-900/30 border-green-500' : node.status === 'critical' ? 'bg-red-900/30 border-red-500 animate-pulse' : 'bg-yellow-900/30 border-yellow-500'}`} style={{ top: `${10 + (i * 15)}%`, left: `${15 + (i % 2) * 50}%` }}><div className="flex items-center gap-2 mb-1">{node.type === 'QuantumRelay' ? <Atom size={16} className="text-purple-400"/> : <Server size={16} className="text-cyan-400"/>}<span className="font-bold text-white text-sm">{node.name}</span></div><div className="text-xs text-gray-400 mb-2">{node.region} - {node.type}</div><div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className={`h-full transition-all duration-1000 ${node.load > 90 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${node.load}%`}}></div></div><div className="text-[10px] text-right mt-1 text-gray-500">{node.load}% Load / {node.latency.toFixed(1)}ms</div></div>))}<svg className="absolute inset-0 pointer-events-none opacity-30"><path d="M150 100 L 400 200 L 150 300" stroke="#4b5563" strokeWidth="2" fill="none" /></svg></div>
                </div>
                <div className="flex flex-col gap-4">
                    <Card title="System Events" className="flex-1 bg-[#15191e] border-gray-800"><div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">{opsNodes.filter(n => n.status !== 'optimal').map(n => (<div key={n.id + 'alert'} className="p-3 bg-gray-800/50 border-l-2 border-red-500 rounded flex justify-between items-center"><div><div className="text-red-400 text-xs font-bold uppercase">Latency Spike</div><div className="text-white text-sm">{n.name} load exceeded 90% threshold.</div></div><button onClick={() => optimizeNode(n.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded">Fix</button></div>))}<div className="p-3 bg-gray-800/50 border-l-2 border-green-500 rounded"><div className="text-green-400 text-xs font-bold uppercase">Optimization</div><div className="text-white text-sm">Route B-72 rebalanced successfully.</div></div><div className="p-3 bg-gray-800/50 border-l-2 border-blue-500 rounded"><div className="text-blue-400 text-xs font-bold uppercase">Sync</div><div className="text-white text-sm">Global ledger synchronization complete.</div></div></div></Card>
                </div>
            </div>
        </div>
    );

    const renderDAOGovernance = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-2">DAO Governance Protocol</h1>
            <p className="text-gray-400 mb-8">Participate in the decentralized future of the platform. Your vote matters.</p>
            <div className="space-y-6">
                {daoProposals.map(p => (
                    <Card key={p.id} className="bg-[#15191e] border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="text-lg font-bold text-white">{p.title}</h3><p className="text-xs text-gray-500">Proposed by: {p.proposer}</p></div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.status === 'active' ? 'bg-blue-900 text-blue-300' : p.status === 'passed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{p.status.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">{p.description}</p>
                        <div className="w-full bg-gray-800 rounded-full h-4 flex overflow-hidden mb-2"><div className="bg-green-500" style={{width: `${(p.votesFor / (p.votesFor + p.votesAgainst)) * 100}%`}}></div><div className="bg-red-500" style={{width: `${(p.votesAgainst / (p.votesFor + p.votesAgainst)) * 100}%`}}></div></div>
                        <div className="flex justify-between text-xs text-gray-400"><span>{p.votesFor.toLocaleString()} For</span><span>{p.votesAgainst.toLocaleString()} Against</span></div>
                        {p.status === 'active' && <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center"><span className="text-sm text-yellow-400">Ends in: {p.endsIn}</span><div className="flex gap-2"><button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold">Vote For</button><button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold">Vote Against</button></div></div>}
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
             <h1 className="text-3xl font-bold text-white mb-8">System Configuration</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Data Feed Configuration" className="bg-[#15191e] border-gray-800">
                    <div className="space-y-4">
                        <div><label className="text-gray-400 text-sm block mb-2">Simulation Tick Rate (ms)</label><div className="flex items-center gap-4"><input type="range" min="100" max="2000" value={tickRate} onChange={e => setTickRate(Number(e.target.value))} className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /><span className="text-white font-mono w-12">{tickRate}</span></div></div>
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"><span className="text-white text-sm">Show AI Prediction Layer</span><button onClick={() => setShowPredictions(!showPredictions)} className={`w-12 h-6 rounded-full transition-colors relative ${showPredictions ? 'bg-cyan-600' : 'bg-gray-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showPredictions ? 'left-7' : 'left-1'}`}></div></button></div>
                    </div>
                </Card>
                <Card title="Security Protocols" className="bg-[#15191e] border-gray-800">
                    <div className="space-y-3"><div className="flex justify-between items-center p-2 border-b border-gray-800"><span className="text-gray-300 text-sm">Two-Factor Auth</span><span className="text-green-400 text-xs font-bold">ENABLED</span></div><div className="flex justify-between items-center p-2 border-b border-gray-800"><span className="text-gray-300 text-sm">API Key Rotation</span><span className="text-yellow-400 text-xs font-bold">30 DAYS</span></div><div className="flex justify-between items-center p-2"><span className="text-gray-300 text-sm">Session Timeout</span><span className="text-white text-xs">15 MIN</span></div></div>
                </Card>
             </div>
        </div>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'trading': return renderTrading();
            case 'portfolio': return renderPortfolio();
            case 'ai-hub': return renderAIHub();
            case 'infrastructure': return renderInfrastructure();
            case 'governance': return renderDAOGovernance();
            case 'settings': return renderSettings();
            default: return renderDashboard();
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            {renderSidebar()}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                 {renderActiveTab()}
            </div>
        </div>
    );
};

export default InvestmentsView;

// --- CONSOLIDATED FROM: ./components/views/personal/InvestmentsView.tsx ---

// components/views/personal/InvestmentsView.tsx
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { Asset } from '../../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import InvestmentPortfolio from '../../InvestmentPortfolio';

// ================================================================================================
// HELPER & SUB-COMPONENTS
// ================================================================================================

const ESGScore: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center" aria-label={`ESG rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i < rating ? 'text-green-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.22 9.63a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.18 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 7.612v6.638A.75.75 0 0110 15z" />
            </svg>
        ))}
    </div>
);

const InvestmentModal: React.FC<{
    asset: Asset | null;
    onClose: () => void;
    onInvest: (assetName: string, amount: number) => void;
}> = ({ asset, onClose, onInvest }) => {
    const [amount, setAmount] = useState('1000');

    if (!asset) return null;

    const handleInvestClick = () => {
        onInvest(asset.name, parseFloat(amount));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Invest in {asset.name}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">{asset.description}</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Amount (USD)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                    <button onClick={handleInvestClick} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">
                        Confirm Investment
                    </button>
                </div>
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: InvestmentsView (CapitalVista)
// ================================================================================================

const InvestmentsView: React.FC = () => {
    const context = useContext(DataContext);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [selectedImpactAsset, setSelectedImpactAsset] = useState<Asset | null>(null);

    if (!context) {
        throw new Error("InvestmentsView must be within a DataProvider.");
    }

    const { assets, impactInvestments, addTransaction } = context;

    const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);

    const projectionData = useMemo(() => {
        let futureValue = totalValue;
        const data = [{ year: 'Now', value: futureValue }];
        for (let i = 1; i <= 10; i++) {
            futureValue = (futureValue + monthlyContribution * 12) * 1.07; // 7% annual growth
            data.push({ year: `Year ${i}`, value: futureValue });
        }
        return data;
    }, [totalValue, monthlyContribution]);

    const handleInvest = (assetName: string, amount: number) => {
// FIX: The `addTransaction` function expects an object of type `Omit<Transaction, 'id'>`.
// The `id` property is generated by the backend and should not be sent in the request.
        addTransaction({
            type: 'expense',
            category: 'Investments',
            description: `Invest in ${assetName}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        alert(`Successfully invested $${amount} in ${assetName}. See the new transaction in your history.`);
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Investments (CapitalVista)</h2>

                <InvestmentPortfolio />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Asset Performance (YTD)">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" stroke="#9ca3af" domain={[0, 50]} unit="%" />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Bar dataKey="performanceYTD" name="YTD Performance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="AI Growth Simulator">
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300">Monthly Contribution: <span className="font-bold text-white">${monthlyContribution.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                step="50"
                                value={monthlyContribution}
                                onChange={e => setMonthlyContribution(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Monthly investment contribution"
                            />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="year" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, "Projected Value"]} />
                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                
                {/* Social Impact Investing Section */}
                <Card title="Social Impact Investing (ESG)">
                    <p className="text-sm text-gray-400 mb-4">Invest in companies that align with your values. All options below are highly rated for their Environmental, Social, and Governance practices.</p>
                    <div className="space-y-4">
                        {impactInvestments.map(asset => (
                            <div key={asset.name} className="p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4">
                                        <ESGScore rating={asset.esgRating || 0} />
                                        <h4 className="font-semibold text-white">{asset.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">{asset.description}</p>
                                </div>
                                <button onClick={() => setSelectedImpactAsset(asset)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                                    Invest Now
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <InvestmentModal
                asset={selectedImpactAsset}
                onClose={() => setSelectedImpactAsset(null)}
                onInvest={handleInvest}
            />
        </>
    );
};

export default InvestmentsView;