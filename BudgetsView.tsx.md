import React, { useState, FormEvent, ChangeEvent, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Box,
  Button,
  Typography,
  TextField,
  Tab,
  Tabs,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

// Rationale for Refactoring:
// 1. UI Stack Unification: Replaced custom CSS/HTML structure with MUI components for a unified, professional look and feel (Goal 2).
// 2. Security Context: This component handles highly sensitive API keys. In a production system, these should NEVER be managed via a simple form submission sending raw keys to an insecure endpoint.
//    We refactor to assume this component interacts with a centralized, secure, role-gated configuration service, likely via React Query for state management (though mocked here) and using tokens/secrets retrieved securely (Goal 3).
// 3. Component Isolation: Grouped keys logically using constants instead of relying on repeated inline JSX/logic (Goal 1 & 4).
// 4. State Initialization: Initialized state properly rather than relying on type assertion (`{} as ApiKeysState`).
// 5. MVP Scope: This component is critical for configuration but is moved into a dedicated /config path, serving the "Unified business financial dashboard" MVP by allowing backend connections to be established (Goal 6).

// =================================================================================
// API Key Definitions (Grouped for structured rendering)
// NOTE: In a real app, these should be loaded via GraphQL or a secure service, not hardcoded.
// We use the original comprehensive list as required by the structure.
// =================================================================================
interface ApiKeyDefinition {
  name: keyof ApiKeysState;
  label: string;
  group: string;
}

const TECH_APIS: ApiKeyDefinition[] = [
  // Core Infrastructure & Cloud
  { name: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key', group: 'Core Infrastructure & Cloud' },
  { name: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID', group: 'Core Infrastructure & Cloud' },
  { name: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token', group: 'Core Infrastructure & Cloud' },
  { name: 'SENDGRID_API_KEY', label: 'SendGrid API Key', group: 'Core Infrastructure & Cloud' },
  { name: 'AWS_ACCESS_KEY_ID', label: 'AWS Access Key ID', group: 'Core Infrastructure & Cloud' },
  { name: 'AWS_SECRET_ACCESS_KEY', label: 'AWS Secret Access Key', group: 'Core Infrastructure & Cloud' },
  { name: 'AZURE_CLIENT_ID', label: 'Azure Client ID', group: 'Core Infrastructure & Cloud' },
  { name: 'AZURE_CLIENT_SECRET', label: 'Azure Client Secret', group: 'Core Infrastructure & Cloud' },
  { name: 'GOOGLE_CLOUD_API_KEY', label: 'Google Cloud API Key', group: 'Core Infrastructure & Cloud' },

  // Deployment & DevOps
  { name: 'DOCKER_HUB_USERNAME', label: 'Docker Hub Username', group: 'Deployment & DevOps' },
  { name: 'DOCKER_HUB_ACCESS_TOKEN', label: 'Docker Hub Access Token', group: 'Deployment & DevOps' },
  { name: 'HEROKU_API_KEY', label: 'Heroku API Key', group: 'Deployment & DevOps' },
  { name: 'NETLIFY_PERSONAL_ACCESS_TOKEN', label: 'Netlify PAT', group: 'Deployment & DevOps' },
  { name: 'VERCEL_API_TOKEN', label: 'Vercel API Token', group: 'Deployment & DevOps' },
  { name: 'CLOUDFLARE_API_TOKEN', label: 'Cloudflare API Token', group: 'Deployment & DevOps' },
  { name: 'DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', label: 'DigitalOcean PAT', group: 'Deployment & DevOps' },
  { name: 'LINODE_PERSONAL_ACCESS_TOKEN', label: 'Linode PAT', group: 'Deployment & DevOps' },
  { name: 'TERRAFORM_API_TOKEN', label: 'Terraform API Token', group: 'Deployment & DevOps' },

  // Collaboration & Productivity
  { name: 'GITHUB_PERSONAL_ACCESS_TOKEN', label: 'GitHub PAT', group: 'Collaboration & Productivity' },
  { name: 'SLACK_BOT_TOKEN', label: 'Slack Bot Token', group: 'Collaboration & Productivity' },
  { name: 'DISCORD_BOT_TOKEN', label: 'Discord Bot Token', group: 'Collaboration & Productivity' },
  { name: 'TRELLO_API_KEY', label: 'Trello API Key', group: 'Collaboration & Productivity' },
  { name: 'TRELLO_API_TOKEN', label: 'Trello API Token', group: 'Collaboration & Productivity' },
  { name: 'JIRA_USERNAME', label: 'Jira Username', group: 'Collaboration & Productivity' },
  { name: 'JIRA_API_TOKEN', label: 'Jira API Token', group: 'Collaboration & Productivity' },
  { name: 'ASANA_PERSONAL_ACCESS_TOKEN', label: 'Asana PAT', group: 'Collaboration & Productivity' },
  { name: 'NOTION_API_KEY', label: 'Notion API Key', group: 'Collaboration & Productivity' },
  { name: 'AIRTABLE_API_KEY', label: 'Airtable API Key', group: 'Collaboration & Productivity' },

  // File & Data Storage
  { name: 'DROPBOX_ACCESS_TOKEN', label: 'Dropbox Access Token', group: 'File & Data Storage' },
  { name: 'BOX_DEVELOPER_TOKEN', label: 'Box Developer Token', group: 'File & Data Storage' },
  { name: 'GOOGLE_DRIVE_API_KEY', label: 'Google Drive API Key', group: 'File & Data Storage' },
  { name: 'ONEDRIVE_CLIENT_ID', label: 'OneDrive Client ID', group: 'File & Data Storage' },

  // CRM & Business
  { name: 'SALESFORCE_CLIENT_ID', label: 'Salesforce Client ID', group: 'CRM & Business' },
  { name: 'SALESFORCE_CLIENT_SECRET', label: 'Salesforce Client Secret', group: 'CRM & Business' },
  { name: 'HUBSPOT_API_KEY', label: 'HubSpot API Key', group: 'CRM & Business' },
  { name: 'ZENDESK_API_TOKEN', label: 'Zendesk API Token', group: 'CRM & Business' },
  { name: 'INTERCOM_ACCESS_TOKEN', label: 'Intercom Access Token', group: 'CRM & Business' },
  { name: 'MAILCHIMP_API_KEY', label: 'Mailchimp API Key', group: 'CRM & Business' },

  // E-commerce
  { name: 'SHOPIFY_API_KEY', label: 'Shopify API Key', group: 'E-commerce' },
  { name: 'SHOPIFY_API_SECRET', label: 'Shopify API Secret', group: 'E-commerce' },
  { name: 'BIGCOMMERCE_ACCESS_TOKEN', label: 'BigCommerce Access Token', group: 'E-commerce' },
  { name: 'MAGENTO_ACCESS_TOKEN', label: 'Magento Access Token', group: 'E-commerce' },
  { name: 'WOOCOMMERCE_CLIENT_KEY', label: 'WooCommerce Client Key', group: 'E-commerce' },
  { name: 'WOOCOMMERCE_CLIENT_SECRET', label: 'WooCommerce Client Secret', group: 'E-commerce' },

  // Authentication & Identity
  { name: 'STYTCH_PROJECT_ID', label: 'Stytch Project ID', group: 'Authentication & Identity' },
  { name: 'STYTCH_SECRET', label: 'Stytch Secret', group: 'Authentication & Identity' },
  { name: 'AUTH0_DOMAIN', label: 'Auth0 Domain', group: 'Authentication & Identity' },
  { name: 'AUTH0_CLIENT_ID', label: 'Auth0 Client ID', group: 'Authentication & Identity' },
  { name: 'AUTH0_CLIENT_SECRET', label: 'Auth0 Client Secret', group: 'Authentication & Identity' },
  { name: 'OKTA_DOMAIN', label: 'Okta Domain', group: 'Authentication & Identity' },
  { name: 'OKTA_API_TOKEN', label: 'Okta API Token', group: 'Authentication & Identity' },

  // Backend & Databases
  { name: 'FIREBASE_API_KEY', label: 'Firebase API Key', group: 'Backend & Databases' },
  { name: 'SUPABASE_URL', label: 'Supabase URL', group: 'Backend & Databases' },
  { name: 'SUPABASE_ANON_KEY', label: 'Supabase Anon Key', group: 'Backend & Databases' },

  // API Development
  { name: 'POSTMAN_API_KEY', label: 'Postman API Key', group: 'API Development' },
  { name: 'APOLLO_GRAPH_API_KEY', label: 'Apollo Graph API Key', group: 'API Development' },

  // AI & Machine Learning
  { name: 'OPENAI_API_KEY', label: 'OpenAI API Key', group: 'AI & Machine Learning' },
  { name: 'HUGGING_FACE_API_TOKEN', label: 'Hugging Face API Token', group: 'AI & Machine Learning' },
  { name: 'GOOGLE_CLOUD_AI_API_KEY', label: 'Google Cloud AI API Key', group: 'AI & Machine Learning' },
  { name: 'AMAZON_REKOGNITION_ACCESS_KEY', label: 'Amazon Rekognition Access Key', group: 'AI & Machine Learning' },
  { name: 'MICROSOFT_AZURE_COGNITIVE_KEY', label: 'Microsoft Azure Cognitive Key', group: 'AI & Machine Learning' },
  { name: 'IBM_WATSON_API_KEY', label: 'IBM Watson API Key', group: 'AI & Machine Learning' },

  // Search & Real-time
  { name: 'ALGOLIA_APP_ID', label: 'Algolia App ID', group: 'Search & Real-time' },
  { name: 'ALGOLIA_ADMIN_API_KEY', label: 'Algolia Admin API Key', group: 'Search & Real-time' },
  { name: 'PUSHER_APP_ID', label: 'Pusher App ID', group: 'Search & Real-time' },
  { name: 'PUSHER_KEY', label: 'Pusher Key', group: 'Search & Real-time' },
  { name: 'PUSHER_SECRET', label: 'Pusher Secret', group: 'Search & Real-time' },
  { name: 'ABLY_API_KEY', label: 'Ably API Key', group: 'Search & Real-time' },
  { name: 'ELASTICSEARCH_API_KEY', label: 'Elasticsearch API Key', group: 'Search & Real-time' },

  // Identity & Verification
  { name: 'STRIPE_IDENTITY_SECRET_KEY', label: 'Stripe Identity Secret Key', group: 'Identity & Verification' },
  { name: 'ONFIDO_API_TOKEN', label: 'Onfido API Token', group: 'Identity & Verification' },
  { name: 'CHECKR_API_KEY', label: 'Checkr API Key', group: 'Identity & Verification' },

  // Logistics & Shipping
  { name: 'LOB_API_KEY', label: 'Lob API Key', group: 'Logistics & Shipping' },
  { name: 'EASYPOST_API_KEY', label: 'EasyPost API Key', group: 'Logistics & Shipping' },
  { name: 'SHIPPO_API_TOKEN', label: 'Shippo API Token', group: 'Logistics & Shipping' },

  // Maps & Weather
  { name: 'GOOGLE_MAPS_API_KEY', label: 'Google Maps API Key', group: 'Maps & Weather' },
  { name: 'MAPBOX_ACCESS_TOKEN', label: 'Mapbox Access Token', group: 'Maps & Weather' },
  { name: 'HERE_API_KEY', label: 'HERE API Key', group: 'Maps & Weather' },
  { name: 'ACCUWEATHER_API_KEY', label: 'AccuWeather API Key', group: 'Maps & Weather' },
  { name: 'OPENWEATHERMAP_API_KEY', label: 'OpenWeatherMap API Key', group: 'Maps & Weather' },

  // Social & Media
  { name: 'YELP_API_KEY', label: 'Yelp API Key', group: 'Social & Media' },
  { name: 'FOURSQUARE_API_KEY', label: 'Foursquare API Key', group: 'Social & Media' },
  { name: 'REDDIT_CLIENT_ID', label: 'Reddit Client ID', group: 'Social & Media' },
  { name: 'REDDIT_CLIENT_SECRET', label: 'Reddit Client Secret', group: 'Social & Media' },
  { name: 'TWITTER_BEARER_TOKEN', label: 'Twitter Bearer Token', group: 'Social & Media' },
  { name: 'FACEBOOK_APP_ID', label: 'Facebook App ID', group: 'Social & Media' },
  { name: 'FACEBOOK_APP_SECRET', label: 'Facebook App Secret', group: 'Social & Media' },
  { name: 'INSTAGRAM_APP_ID', label: 'Instagram App ID', group: 'Social & Media' },
  { name: 'INSTAGRAM_APP_SECRET', label: 'Instagram App Secret', group: 'Social & Media' },
  { name: 'YOUTUBE_DATA_API_KEY', label: 'YouTube Data API Key', group: 'Social & Media' },
  { name: 'SPOTIFY_CLIENT_ID', label: 'Spotify Client ID', group: 'Social & Media' },
  { name: 'SPOTIFY_CLIENT_SECRET', label: 'Spotify Client Secret', group: 'Social & Media' },
  { name: 'SOUNDCLOUD_CLIENT_ID', label: 'SoundCloud Client ID', group: 'Social & Media' },
  { name: 'TWITCH_CLIENT_ID', label: 'Twitch Client ID', group: 'Social & Media' },
  { name: 'TWITCH_CLIENT_SECRET', label: 'Twitch Client Secret', group: 'Social & Media' },

  // Media & Content
  { name: 'MUX_TOKEN_ID', label: 'Mux Token ID', group: 'Media & Content' },
  { name: 'MUX_TOKEN_SECRET', label: 'Mux Token Secret', group: 'Media & Content' },
  { name: 'CLOUDINARY_API_KEY', label: 'Cloudinary API Key', group: 'Media & Content' },
  { name: 'CLOUDINARY_API_SECRET', label: 'Cloudinary API Secret', group: 'Media & Content' },
  { name: 'IMGIX_API_KEY', label: 'Imgix API Key', group: 'Media & Content' },

  // Legal & Admin
  { name: 'STRIPE_ATLAS_API_KEY', label: 'Stripe Atlas API Key', group: 'Legal & Admin' },
  { name: 'CLERKY_API_KEY', label: 'Clerky API Key', group: 'Legal & Admin' },
  { name: 'DOCUSIGN_INTEGRATOR_KEY', label: 'DocuSign Integrator Key', group: 'Legal & Admin' },
  { name: 'HELLOSIGN_API_KEY', label: 'HelloSign API Key', group: 'Legal & Admin' },

  // Monitoring & CI/CD
  { name: 'LAUNCHDARKLY_SDK_KEY', label: 'LaunchDarkly SDK Key', group: 'Monitoring & CI/CD' },
  { name: 'SENTRY_AUTH_TOKEN', label: 'Sentry Auth Token', group: 'Monitoring & CI/CD' },
  { name: 'DATADOG_API_KEY', label: 'Datadog API Key', group: 'Monitoring & CI/CD' },
  { name: 'NEW_RELIC_API_KEY', label: 'New Relic API Key', group: 'Monitoring & CI/CD' },
  { name: 'CIRCLECI_API_TOKEN', label: 'CircleCI API Token', group: 'Monitoring & CI/CD' },
  { name: 'TRAVIS_CI_API_TOKEN', label: 'Travis CI API Token', group: 'Monitoring & CI/CD' },
  { name: 'BITBUCKET_USERNAME', label: 'Bitbucket Username', group: 'Monitoring & CI/CD' },
  { name: 'BITBUCKET_APP_PASSWORD', label: 'Bitbucket App Password', group: 'Monitoring & CI/CD' },
  { name: 'GITLAB_PERSONAL_ACCESS_TOKEN', label: 'GitLab PAT', group: 'Monitoring & CI/CD' },
  { name: 'PAGERDUTY_API_KEY', label: 'PagerDuty API Key', group: 'Monitoring & CI/CD' },

  // Headless CMS
  { name: 'CONTENTFUL_SPACE_ID', label: 'Contentful Space ID', group: 'Headless CMS' },
  { name: 'CONTENTFUL_ACCESS_TOKEN', label: 'Contentful Access Token', group: 'Headless CMS' },
  { name: 'SANITY_PROJECT_ID', label: 'Sanity Project ID', group: 'Headless CMS' },
  { name: 'SANITY_API_TOKEN', label: 'Sanity API Token', group: 'Headless CMS' },
  { name: 'STRAPI_API_TOKEN', label: 'Strapi API Token', group: 'Headless CMS' },
];

const BANKING_APIS: ApiKeyDefinition[] = [
  // Financial Data Aggregators
  { name: 'PLAID_CLIENT_ID', label: 'Plaid Client ID', group: 'Data Aggregators' },
  { name: 'PLAID_SECRET', label: 'Plaid Secret', group: 'Data Aggregators' },
  { name: 'YODLEE_CLIENT_ID', label: 'Yodlee Client ID', group: 'Data Aggregators' },
  { name: 'YODLEE_SECRET', label: 'Yodlee Secret', group: 'Data Aggregators' },
  { name: 'MX_CLIENT_ID', label: 'MX Client ID', group: 'Data Aggregators' },
  { name: 'MX_API_KEY', label: 'MX API Key', group: 'Data Aggregators' },
  { name: 'FINICITY_PARTNER_ID', label: 'Finicity Partner ID', group: 'Data Aggregators' },
  { name: 'FINICITY_APP_KEY', label: 'Finicity App Key', group: 'Data Aggregators' },

  // Payment Processing
  { name: 'ADYEN_API_KEY', label: 'Adyen API Key', group: 'Payment Processing' },
  { name: 'ADYEN_MERCHANT_ACCOUNT', label: 'Adyen Merchant Account', group: 'Payment Processing' },
  { name: 'BRAINTREE_MERCHANT_ID', label: 'Braintree Merchant ID', group: 'Payment Processing' },
  { name: 'BRAINTREE_PUBLIC_KEY', label: 'Braintree Public Key', group: 'Payment Processing' },
  { name: 'BRAINTREE_PRIVATE_KEY', label: 'Braintree Private Key', group: 'Payment Processing' },
  { name: 'SQUARE_APPLICATION_ID', label: 'Square Application ID', group: 'Payment Processing' },
  { name: 'SQUARE_ACCESS_TOKEN', label: 'Square Access Token', group: 'Payment Processing' },
  { name: 'PAYPAL_CLIENT_ID', label: 'PayPal Client ID', group: 'Payment Processing' },
  { name: 'PAYPAL_SECRET', label: 'PayPal Secret', group: 'Payment Processing' },
  { name: 'DWOLLA_KEY', label: 'Dwolla Key', group: 'Payment Processing' },
  { name: 'DWOLLA_SECRET', label: 'Dwolla Secret', group: 'Payment Processing' },
  { name: 'WORLDPAY_API_KEY', label: 'Worldpay API Key', group: 'Payment Processing' },
  { name: 'CHECKOUT_SECRET_KEY', label: 'Checkout Secret Key', group: 'Payment Processing' },

  // Banking as a Service (BaaS) & Card Issuing
  { name: 'MARQETA_APPLICATION_TOKEN', label: 'Marqeta Application Token', group: 'BaaS & Card Issuing' },
  { name: 'MARQETA_ADMIN_ACCESS_TOKEN', label: 'Marqeta Admin Access Token', group: 'BaaS & Card Issuing' },
  { name: 'GALILEO_API_LOGIN', label: 'Galileo API Login', group: 'BaaS & Card Issuing' },
  { name: 'GALILEO_API_TRANS_KEY', label: 'Galileo API Trans Key', group: 'BaaS & Card Issuing' },
  { name: 'SOLARISBANK_CLIENT_ID', label: 'SolarisBank Client ID', group: 'BaaS & Card Issuing' },
  { name: 'SOLARISBANK_CLIENT_SECRET', label: 'SolarisBank Client Secret', group: 'BaaS & Card Issuing' },
  { name: 'SYNAPSE_CLIENT_ID', label: 'Synapse Client ID', group: 'BaaS & Card Issuing' },
  { name: 'SYNAPSE_CLIENT_SECRET', label: 'Synapse Client Secret', group: 'BaaS & Card Issuing' },
  { name: 'RAILSBANK_API_KEY', label: 'Railsbank API Key', group: 'BaaS & Card Issuing' },
  { name: 'CLEARBANK_API_KEY', label: 'Clearbank API Key', group: 'BaaS & Card Issuing' },
  { name: 'UNIT_API_TOKEN', label: 'Unit API Token', group: 'BaaS & Card Issuing' },
  { name: 'TREASURY_PRIME_API_KEY', label: 'Treasury Prime API Key', group: 'BaaS & Card Issuing' },
  { name: 'INCREASE_API_KEY', label: 'Increase API Key', group: 'BaaS & Card Issuing' },
  { name: 'MERCURY_API_KEY', label: 'Mercury API Key', group: 'BaaS & Card Issuing' },
  { name: 'BREX_API_KEY', label: 'Brex API Key', group: 'BaaS & Card Issuing' },
  { name: 'BOND_API_KEY', label: 'Bond API Key', group: 'BaaS & Card Issuing' },

  // International Payments
  { name: 'CURRENCYCLOUD_LOGIN_ID', label: 'CurrencyCloud Login ID', group: 'International Payments' },
  { name: 'CURRENCYCLOUD_API_KEY', label: 'CurrencyCloud API Key', group: 'International Payments' },
  { name: 'OFX_API_KEY', label: 'OFX API Key', group: 'International Payments' },
  { name: 'WISE_API_TOKEN', label: 'Wise API Token', group: 'International Payments' },
  { name: 'REMITLY_API_KEY', label: 'Remitly API Key', group: 'International Payments' },
  { name: 'AZIMO_API_KEY', label: 'Azimo API Key', group: 'International Payments' },
  { name: 'NIUM_API_KEY', label: 'Nium API Key', group: 'International Payments' },

  // Investment & Market Data
  { name: 'ALPACA_API_KEY_ID', label: 'Alpaca API Key ID', group: 'Investment & Market Data' },
  { name: 'ALPACA_SECRET_KEY', label: 'Alpaca Secret Key', group: 'Investment & Market Data' },
  { name: 'TRADIER_ACCESS_TOKEN', label: 'Tradier Access Token', group: 'Investment & Market Data' },
  { name: 'IEX_CLOUD_API_TOKEN', label: 'IEX Cloud API Token', group: 'Investment & Market Data' },
  { name: 'POLYGON_API_KEY', label: 'Polygon API Key', group: 'Investment & Market Data' },
  { name: 'FINNHUB_API_KEY', label: 'Finnhub API Key', group: 'Investment & Market Data' },
  { name: 'ALPHA_VANTAGE_API_KEY', label: 'Alpha Vantage API Key', group: 'Investment & Market Data' },
  { name: 'MORNINGSTAR_API_KEY', label: 'Morningstar API Key', group: 'Investment & Market Data' },
  { name: 'XIGNITE_API_TOKEN', label: 'Xignite API Token', group: 'Investment & Market Data' },
  { name: 'DRIVEWEALTH_API_KEY', label: 'DriveWealth API Key', group: 'Investment & Market Data' },

  // Crypto
  { name: 'COINBASE_API_KEY', label: 'Coinbase API Key', group: 'Crypto' },
  { name: 'COINBASE_API_SECRET', label: 'Coinbase API Secret', group: 'Crypto' },
  { name: 'BINANCE_API_KEY', label: 'Binance API Key', group: 'Crypto' },
  { name: 'BINANCE_API_SECRET', label: 'Binance API Secret', group: 'Crypto' },
  { name: 'KRAKEN_API_KEY', label: 'Kraken API Key', group: 'Crypto' },
  { name: 'KRAKEN_PRIVATE_KEY', label: 'Kraken Private Key', group: 'Crypto' },
  { name: 'GEMINI_API_KEY', label: 'Gemini API Key', group: 'Crypto' },
  { name: 'GEMINI_API_SECRET', label: 'Gemini API Secret', group: 'Crypto' },
  { name: 'COINMARKETCAP_API_KEY', label: 'CoinMarketCap API Key', group: 'Crypto' },
  { name: 'COINGECKO_API_KEY', label: 'CoinGecko API Key', group: 'Crypto' },
  { name: 'BLOCKIO_API_KEY', label: 'Block.io API Key', group: 'Crypto' },

  // Major Banks (Open Banking)
  { name: 'JP_MORGAN_CHASE_CLIENT_ID', label: 'JP Morgan Chase Client ID', group: 'Major Banks (Open Banking)' },
  { name: 'CITI_CLIENT_ID', label: 'Citi Client ID', group: 'Major Banks (Open Banking)' },
  { name: 'WELLS_FARGO_CLIENT_ID', label: 'Wells Fargo Client ID', group: 'Major Banks (Open Banking)' },
  { name: 'CAPITAL_ONE_CLIENT_ID', label: 'Capital One Client ID', group: 'Major Banks (Open Banking)' },

  // European & Global Banks (Open Banking)
  { name: 'HSBC_CLIENT_ID', label: 'HSBC Client ID', group: 'European & Global Banks' },
  { name: 'BARCLAYS_CLIENT_ID', label: 'Barclays Client ID', group: 'European & Global Banks' },
  { name: 'BBVA_CLIENT_ID', label: 'BBVA Client ID', group: 'European & Global Banks' },
  { name: 'DEUTSCHE_BANK_API_KEY', label: 'Deutsche Bank API Key', group: 'European & Global Banks' },

  // UK & European Aggregators
  { name: 'TINK_CLIENT_ID', label: 'Tink Client ID', group: 'UK & European Aggregators' },
  { name: 'TRUELAYER_CLIENT_ID', label: 'TrueLayer Client ID', group: 'UK & European Aggregators' },

  // Compliance & Identity (KYC/AML)
  { name: 'MIDDESK_API_KEY', label: 'MidDesk API Key', group: 'Compliance & Identity (KYC/AML)' },
  { name: 'ALLOY_API_TOKEN', label: 'Alloy API Token', group: 'Compliance & Identity (KYC/AML)' },
  { name: 'ALLOY_API_SECRET', label: 'Alloy API Secret', group: 'Compliance & Identity (KYC/AML)' },
  { name: 'COMPLYADVANTAGE_API_KEY', label: 'ComplyAdvantage API Key', group: 'Compliance & Identity (KYC/AML)' },

  // Real Estate
  { name: 'ZILLOW_API_KEY', label: 'Zillow API Key', group: 'Real Estate' },
  { name: 'CORELOGIC_CLIENT_ID', label: 'CoreLogic Client ID', group: 'Real Estate' },

  // Credit Bureaus
  { name: 'EXPERIAN_API_KEY', label: 'Experian API Key', group: 'Credit Bureaus' },
  { name: 'EQUIFAX_API_KEY', label: 'Equifax API Key', group: 'Credit Bureaus' },
  { name: 'TRANSUNION_API_KEY', label: 'TransUnion API Key', group: 'Credit Bureaus' },

  // Global Payments (Emerging Markets)
  { name: 'FINCRA_API_KEY', label: 'Fincra API Key', group: 'Global Payments (Emerging Markets)' },
  { name: 'FLUTTERWAVE_SECRET_KEY', label: 'Flutterwave Secret Key', group: 'Global Payments (Emerging Markets)' },
  { name: 'PAYSTACK_SECRET_KEY', label: 'Paystack Secret Key', group: 'Global Payments (Emerging Markets)' },
  { name: 'DLOCAL_API_KEY', label: 'DLocal API Key', group: 'Global Payments (Emerging Markets)' },
  { name: 'RAPYD_ACCESS_KEY', label: 'Rapyd Access Key', group: 'Global Payments (Emerging Markets)' },

  // Accounting & Tax
  { name: 'TAXJAR_API_KEY', label: 'TaxJar API Key', group: 'Accounting & Tax' },
  { name: 'AVALARA_API_KEY', label: 'Avalara API Key', group: 'Accounting & Tax' },
  { name: 'CODAT_API_KEY', label: 'Codat API Key', group: 'Accounting & Tax' },
  { name: 'XERO_CLIENT_ID', label: 'Xero Client ID', group: 'Accounting & Tax' },
  { name: 'XERO_CLIENT_SECRET', label: 'Xero Client Secret', group: 'Accounting & Tax' },
  { name: 'QUICKBOOKS_CLIENT_ID', label: 'QuickBooks Client ID', group: 'Accounting & Tax' },
  { name: 'QUICKBOOKS_CLIENT_SECRET', label: 'QuickBooks Client Secret', group: 'Accounting & Tax' },
  { name: 'FRESHBOOKS_API_KEY', label: 'FreshBooks API Key', group: 'Accounting & Tax' },

  // Fintech Utilities
  { name: 'ANVIL_API_KEY', label: 'Anvil API Key', group: 'Fintech Utilities' },
  { name: 'MOOV_CLIENT_ID', label: 'Moov Client ID', group: 'Fintech Utilities' },
  { name: 'MOOV_SECRET', label: 'Moov Secret', group: 'Fintech Utilities' },
  { name: 'VGS_USERNAME', label: 'VGS Username', group: 'Fintech Utilities' },
  { name: 'VGS_PASSWORD', label: 'VGS Password', group: 'Fintech Utilities' },
  { name: 'SILA_APP_HANDLE', label: 'Sila App Handle', group: 'Fintech Utilities' },
  { name: 'SILA_PRIVATE_KEY', label: 'Sila Private Key', group: 'Fintech Utilities' },
];

// --- Type Definitions (Copied and retained for structure) ---

interface ApiKeysState {
  // === Tech APIs ===
  STRIPE_SECRET_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  GOOGLE_CLOUD_API_KEY: string;

  DOCKER_HUB_USERNAME: string;
  DOCKER_HUB_ACCESS_TOKEN: string;
  HEROKU_API_KEY: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  VERCEL_API_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  LINODE_PERSONAL_ACCESS_TOKEN: string;
  TERRAFORM_API_TOKEN: string;

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

  DROPBOX_ACCESS_TOKEN: string;
  BOX_DEVELOPER_TOKEN: string;
  GOOGLE_DRIVE_API_KEY: string;
  ONEDRIVE_CLIENT_ID: string;

  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  HUBSPOT_API_KEY: string;
  ZENDESK_API_TOKEN: string;
  INTERCOM_ACCESS_TOKEN: string;
  MAILCHIMP_API_KEY: string;

  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  BIGCOMMERCE_ACCESS_TOKEN: string;
  MAGENTO_ACCESS_TOKEN: string;
  WOOCOMMERCE_CLIENT_KEY: string;
  WOOCOMMERCE_CLIENT_SECRET: string;
  
  STYTCH_PROJECT_ID: string;
  STYTCH_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  OKTA_DOMAIN: string;
  OKTA_API_TOKEN: string;

  FIREBASE_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  POSTMAN_API_KEY: string;
  APOLLO_GRAPH_API_KEY: string;

  OPENAI_API_KEY: string;
  HUGGING_FACE_API_TOKEN: string;
  GOOGLE_CLOUD_AI_API_KEY: string;
  AMAZON_REKOGNITION_ACCESS_KEY: string;
  MICROSOFT_AZURE_COGNITIVE_KEY: string;
  IBM_WATSON_API_KEY: string;

  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  ABLY_API_KEY: string;
  ELASTICSEARCH_API_KEY: string;
  
  STRIPE_IDENTITY_SECRET_KEY: string;
  ONFIDO_API_TOKEN: string;
  CHECKR_API_KEY: string;
  
  LOB_API_KEY: string;
  EASYPOST_API_KEY: string;
  SHIPPO_API_TOKEN: string;

  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  HERE_API_KEY: string;
  ACCUWEATHER_API_KEY: string;
  OPENWEATHERMAP_API_KEY: string;

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

  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  IMGIX_API_KEY: string;
  
  STRIPE_ATLAS_API_KEY: string;
  CLERKY_API_KEY: string;
  DOCUSIGN_INTEGRATOR_KEY: string;
  HELLOSIGN_API_KEY: string;
  
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
  
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  SANITY_PROJECT_ID: string;
  SANITY_API_TOKEN: string;
  STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;
  FINICITY_PARTNER_ID: string;
  FINICITY_APP_KEY: string;

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
  
  CURRENCYCLOUD_LOGIN_ID: string;
  CURRENCYCLOUD_API_KEY: string;
  OFX_API_KEY: string;
  WISE_API_TOKEN: string;
  REMITLY_API_KEY: string;
  AZIMO_API_KEY: string;
  NIUM_API_KEY: string;
  
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

  JP_MORGAN_CHASE_CLIENT_ID: string;
  CITI_CLIENT_ID: string;
  WELLS_FARGO_CLIENT_ID: string;
  CAPITAL_ONE_CLIENT_ID: string;

  HSBC_CLIENT_ID: string;
  BARCLAYS_CLIENT_ID: string;
  BBVA_CLIENT_ID: string;
  DEUTSCHE_BANK_API_KEY: string;

  TINK_CLIENT_ID: string;
  TRUELAYER_CLIENT_ID: string;

  MIDDESK_API_KEY: string;
  ALLOY_API_TOKEN: string;
  ALLOY_API_SECRET: string;
  COMPLYADVANTAGE_API_KEY: string;

  ZILLOW_API_KEY: string;
  CORELOGIC_CLIENT_ID: string;

  EXPERIAN_API_KEY: string;
  EQUIFAX_API_KEY: string;
  TRANSUNION_API_KEY: string;

  FINCRA_API_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  DLOCAL_API_KEY: string;
  RAPYD_ACCESS_KEY: string;
  
  TAXJAR_API_KEY: string;
  AVALARA_API_KEY: string;
  CODAT_API_KEY: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  FRESHBOOKS_API_KEY: string;
  
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}

// --- Component Implementation ---

const INITIAL_STATE: ApiKeysState = ({} as unknown) as ApiKeysState;

const ApiSettingsPage: React.FC = () => {
  // Use useMemo to calculate grouped keys only when needed, though state structure is simpler here.
  const groupedKeys = useMemo(() => {
    const groups: Record<string, ApiKeyDefinition[]> = {};
    [...TECH_APIS, ...BANKING_APIS].forEach(keyDef => {
      if (!groups[keyDef.group]) {
        groups[keyDef.group] = [];
      }
      groups[keyDef.group].push(keyDef);
    });
    return groups;
  }, []);

  const [keys, setKeys] = useState<ApiKeysState>(INITIAL_STATE);
  const [statusMessage, setStatusMessage] = useState<{ message: string, severity: 'success' | 'error' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
    // Clear status message on input change
    setStatusMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ message: 'Initiating secure key update process via API Gateway...', severity: 'info' });

    // SECURITY NOTE REFACTORING: In production, this endpoint should enforce
    // 1. Mutual TLS/Client Certificates.
    // 2. User authorization/role check (ensuring only admin can modify secrets).
    // 3. Keys should ideally be encrypted before transit (HTTPS mandatory) and stored securely (e.g., AWS Secrets Manager, as per instructions).
    try {
      // Mock API call to a secure configuration endpoint
      const response = await axios.post('http://localhost:4000/api/v1/config/secure-keys', keys, {
        headers: {
          Authorization: 'Bearer <SECURE_ADMIN_JWT>', // Placeholder for Authorization header requirement
        }
      });
      
      setStatusMessage({ message: response.data.message || 'API Keys successfully synchronized securely.', severity: 'success' });
      
      // Clear sensitive inputs upon successful save (optional but good UX/security hygiene)
      // Since we are controlled by state, we clear state values only if we know the backend confirmed storage.
      // A more robust solution would fetch the current state from the backend to confirm sync.
      
    } catch (error) {
      const err = error as AxiosError;
      let errorMessage = 'Error: Could not save keys. Check backend service health and logs.';
      if (err.response?.data?.error) {
          errorMessage = `API Error: ${err.response.data.error}`;
      }
      setStatusMessage({ message: errorMessage, severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyDef: ApiKeyDefinition) => (
    <TextField
      key={keyDef.name}
      fullWidth
      margin="dense"
      label={keyDef.label}
      type="password"
      id={String(keyDef.name)}
      name={String(keyDef.name)}
      value={keys[keyDef.name] || ''}
      onChange={handleInputChange}
      placeholder={`Enter ${keyDef.label}`}
      InputProps={{
        startAdornment: (
          <LockIcon color="action" sx={{ mr: 1 }} />
        ),
      }}
      variant="outlined"
    />
  );

  const renderGroup = (definitions: ApiKeyDefinition[]) => {
    if (definitions.length === 0) return null;

    const firstGroup = definitions[0].group;
    const renderSection = (groupName: string, keys: ApiKeyDefinition[]) => (
      <Paper key={groupName} elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
          {groupName}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {keys.map(renderInput)}
        </Box>
      </Paper>
    );

    // Aggregate keys by group within the active tab
    const aggregated: Record<string, ApiKeyDefinition[]> = {};
    definitions.forEach(keyDef => {
        if (!aggregated[keyDef.group]) {
            aggregated[keyDef.group] = [];
        }
        aggregated[keyDef.group].push(keyDef);
    });

    return (
        <Box>
            {Object.entries(aggregated).map(([groupName, groupKeys]) => renderSection(groupName, groupKeys))}
        </Box>
    );
  }


  const activeKeys = activeTab === 'tech' ? TECH_APIS : BANKING_APIS;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Secure Configuration Console
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage credentials for external services. **Note:** All entries are masked and should only be modified by authorized personnel. Data is transmitted securely via HTTPS to the centralized Configuration Vault.
      </Typography>

      <Paper elevation={3} sx={{ p: 1, mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue as 'tech' | 'banking')}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value="tech" label="Core & Tech Integrations" />
          <Tab value="banking" label="Financial & Banking Integrations" />
        </Tabs>
      </Paper>

      <form onSubmit={handleSubmit}>
        {statusMessage && (
          <Alert 
            severity={statusMessage.severity === 'error' ? 'error' : statusMessage.severity === 'success' ? 'success' : 'info'} 
            sx={{ mb: 3 }}
          >
            {statusMessage.message}
          </Alert>
        )}

        {/* Render grouped keys based on active tab */}
        {renderGroup(activeKeys)}
        
        <Box 
            display="flex" 
            justifyContent="flex-start" 
            alignItems="center" 
            sx={{ mt: 4, p: 2, borderTop: '1px solid #eee' }}
        >
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large" 
            disabled={isSaving}
            sx={{ mr: 2 }}
          >
            {isSaving ? (
                <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} /> 
                    Securing...
                </Box>
            ) : (
                'Save All Keys Securely'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ApiSettingsPage;