import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Select,
  Switch,
  useToast,
  Spinner,
  Heading,
  FormControl,
  FormLabel,
  useColorMode,
  IconButton,
  Tooltip,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Badge,
} from '@chakra-ui/react';
import {
  SunIcon,
  MoonIcon,
  SettingsIcon,
  AtSignIcon,
  LockIcon,
  ViewIcon,
  EditIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoOutlineIcon,
  RepeatIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  PlusSquareIcon,
  MinusSquareIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';

// --- Core System Constants and Types (Refactored for Stability and Security) ---

/**
 * Defines the structure for a high-level user preference profile.
 * This is the foundation for the AI-driven personalization engine.
 */
interface UserProfileSettings {
  theme: 'dark' | 'light' | 'system';
  primaryColor: string;
  fontFamily: string;
  dashboardLayout: 'modular' | 'streamlined' | 'executive';
  kpiDisplayMode: 'absolute' | 'delta' | 'projection';
  aiVerbosityLevel: 1 | 2 | 3 | 4 | 5; // 1: Minimal, 5: Hyper-detailed analysis
  securityAlertThreshold: number; // Percentage change threshold for anomaly detection
  preferredCurrency: string;
  timezone: string;
  language: string;
  financialNarrativeStyle: 'formal' | 'direct' | 'visionary';
  dataDensity: 'low' | 'medium' | 'high';
  enablePredictiveModeling: boolean;
  customMetricTags: string[];
  aiAgentName: string;
  aiAgentPersona: 'Analyst' | 'Strategist' | 'Guardian' | 'Observer';
  biometricAuthEnabled: boolean;
  quantumEncryptionLevel: 'L1' | 'L2' | 'L3';
  transactionVisualizationStyle: 'flow' | 'network' | 'timeline';
}

// =================================================================================
// API Key Interface: This structure represents the inputs for the new Unified API Connector pattern.
// Sensitive keys should ideally be stored in AWS Secrets Manager/Vault, not client state/local storage.
// For this MVP, we collect them here to simulate the integration process.
// =================================================================================
interface ApiKeysState {
  // --- Tech APIs (Selected for MVP Integration Pathway) ---
  STRIPE_SECRET_KEY: string;
  TWILIO_AUTH_TOKEN: string;
  OPENAI_API_KEY: string;
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  
  // --- Banking & Finance APIs (Selected for MVP Integration Pathway) ---
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  ADYEN_API_KEY: string;
  ALPACA_API_KEY_ID: string;
  ALPACA_SECRET_KEY: string;

  // --- Compliance & Identity (Selected for MVP Integration Pathway) ---
  MIDDESK_API_KEY: string;

  // Include all original keys for comprehensive UI coverage, but note MVP focus.
  [key: string]: string; 
}


// --- Simulated AI Service Layer (Refactored to ensure non-blocking UI and robust handling) ---

/**
 * Simulates an advanced AI service responsible for deep personalization analysis
 * and generating optimal configuration suggestions based on user behavior and mission alignment.
 * All AI calls are now encapsulated and use Promises to ensure they are non-blocking.
 */
const AIService = {
  /**
   * Analyzes current settings against historical interaction data to suggest optimizations.
   * @param currentSettings The user's current configuration.
   * @returns A promise resolving to suggested configuration adjustments.
   */
  async analyzeAndSuggest(currentSettings: UserProfileSettings): Promise<Partial<UserProfileSettings>> {
    console.log(`[AI Core] Initiating deep behavioral analysis for user profile alignment...`);
    
    // Enforce Timeout and Error Handling (Production hardening requirement)
    const analysisTimeout = new Promise<Partial<UserProfileSettings>>(resolve => 
        setTimeout(() => {
            console.warn("[AI Core] Analysis timed out. Returning current state suggestions.");
            resolve({});
        }, 4000) // 4 second timeout enforced
    );

    const realAnalysis = new Promise<Partial<UserProfileSettings>>(async (resolve) => {
        await new Promise(r => setTimeout(r, 1500)); // Simulate processing time
        const suggestions: Partial<UserProfileSettings> = {};

        // Example 1: Theme Optimization
        if (currentSettings.theme === 'system' && Math.random() > 0.5) {
            suggestions.theme = 'dark'; 
        }

        // Example 2: KPI Mode based on volatility (simulated)
        if (currentSettings.securityAlertThreshold > 3.0 && currentSettings.kpiDisplayMode !== 'absolute') {
            suggestions.kpiDisplayMode = 'absolute';
        }
        
        // Example 3: Persona check
        if (currentSettings.aiAgentPersona === 'Analyst' && currentSettings.aiVerbosityLevel < 3) {
            suggestions.aiVerbosityLevel = 3 as 1|2|3|4|5;
        }

        console.log(`[AI Core] Analysis complete. Suggestions generated.`);
        resolve(suggestions);
    });

    // Use Promise.race to ensure the UI is never blocked indefinitely
    return Promise.race([realAnalysis, analysisTimeout]);
  },

  /**
   * Generates a contextually relevant, mission-aligned greeting or status update.
   * @param persona The AI agent persona to adopt.
   * @returns A string containing the generated narrative.
   */
  async generateNarrative(persona: UserProfileSettings['aiAgentPersona']): Promise<string> {
    // Non-blocking async call
    await new Promise(resolve => setTimeout(resolve, 500));
    switch (persona) {
      case 'Analyst':
        return "The architecture is stable. Your autonomy is the primary directive. Proceed with tactical intent.";
      case 'Strategist':
        return "Data streams indicate optimal configuration for Q3 projections. Reviewing latent variables now.";
      case 'Guardian':
        return "The path to legacy construction requires precision. Personalization aligns the interface with the objective function.";
      case 'Observer':
        return "Perimeter integrity confirmed. All personalization vectors are secured against external entropy.";
      default:
        return "Interface initialized. Awaiting command input.";
    }
  }
};

// --- Initial State Configuration (Updated for MVP Scope) ---

const INITIAL_STATE: UserProfileSettings = {
  theme: 'system',
  primaryColor: '#4299E1', // Default MUI/Chakra blue
  fontFamily: 'Inter, sans-serif',
  dashboardLayout: 'modular', // MVP: Modular dashboard
  kpiDisplayMode: 'projection', // MVP: Focus on AI-driven forecasts
  aiVerbosityLevel: 3,
  securityAlertThreshold: 2.0,
  preferredCurrency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  language: navigator.language.substring(0, 2).toUpperCase() || 'EN',
  financialNarrativeStyle: 'visionary', // MVP: Future-focused narrative
  dataDensity: 'medium',
  enablePredictiveModeling: true, // MVP Feature enabled
  customMetricTags: ['Foundation', 'Stability', 'Growth'],
  aiAgentName: 'QuantumLeap_Proxy', // Renamed to reflect stabilization goal
  aiAgentPersona: 'Analyst',
  biometricAuthEnabled: false,
  quantumEncryptionLevel: 'L2', // Kept L2 as default secure layer
  transactionVisualizationStyle: 'network', // MVP: Network visualization for treasury flow
};

// Initialize API Keys state with empty strings, structure maintained.
const INITIAL_API_KEYS: ApiKeysState = {
    STRIPE_SECRET_KEY: '',
    TWILIO_AUTH_TOKEN: '',
    OPENAI_API_KEY: '',
    GITHUB_PERSONAL_ACCESS_TOKEN: '',
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    ADYEN_API_KEY: '',
    ALPACA_API_KEY_ID: '',
    ALPACA_SECRET_KEY: '',
    MIDDESK_API_KEY: '',
    // Padding with empty strings for remaining keys to satisfy interface definition without exposing sensitive defaults
    // NOTE: In a real app, only necessary keys would be declared, and defaults would be pulled from Vault.
    'SENDGRID_API_KEY': '',
    'AWS_ACCESS_KEY_ID': '',
    'AWS_SECRET_ACCESS_KEY': '',
    'AZURE_CLIENT_ID': '',
    'AZURE_CLIENT_SECRET': '',
    'GOOGLE_CLOUD_API_KEY': '',
    'DOCKER_HUB_USERNAME': '',
    'DOCKER_HUB_ACCESS_TOKEN': '',
    'HEROKU_API_KEY': '',
    'NETLIFY_PERSONAL_ACCESS_TOKEN': '',
    'VERCEL_API_TOKEN': '',
    'CLOUDFLARE_API_TOKEN': '',
    'DIGITALOCEAN_PERSONAL_ACCESS_TOKEN': '',
    'LINODE_PERSONAL_ACCESS_TOKEN': '',
    'TERRAFORM_API_TOKEN': '',
    'SLACK_BOT_TOKEN': '',
    'DISCORD_BOT_TOKEN': '',
    'TRELLO_API_KEY': '',
    'TRELLO_API_TOKEN': '',
    'JIRA_USERNAME': '',
    'JIRA_API_TOKEN': '',
    'ASANA_PERSONAL_ACCESS_TOKEN': '',
    'NOTION_API_KEY': '',
    'AIRTABLE_API_KEY': '',
    'DROPBOX_ACCESS_TOKEN': '',
    'BOX_DEVELOPER_TOKEN': '',
    'GOOGLE_DRIVE_API_KEY': '',
    'ONEDRIVE_CLIENT_ID': '',
    'SALESFORCE_CLIENT_ID': '',
    'SALESFORCE_CLIENT_SECRET': '',
    'HUBSPOT_API_KEY': '',
    'ZENDESK_API_TOKEN': '',
    'INTERCOM_ACCESS_TOKEN': '',
    'MAILCHIMP_API_KEY': '',
    'SHOPIFY_API_KEY': '',
    'SHOPIFY_API_SECRET': '',
    'BIGCOMMERCE_ACCESS_TOKEN': '',
    'MAGENTO_ACCESS_TOKEN': '',
    'WOOCOMMERCE_CLIENT_KEY': '',
    'WOOCOMMERCE_CLIENT_SECRET': '',
    'STYTCH_PROJECT_ID': '',
    'STYTCH_SECRET': '',
    'AUTH0_DOMAIN': '',
    'AUTH0_CLIENT_ID': '',
    'AUTH0_CLIENT_SECRET': '',
    'OKTA_DOMAIN': '',
    'OKTA_API_TOKEN': '',
    'FIREBASE_API_KEY': '',
    'SUPABASE_URL': '',
    'SUPABASE_ANON_KEY': '',
    'POSTMAN_API_KEY': '',
    'APOLLO_GRAPH_API_KEY': '',
    'HUGGING_FACE_API_TOKEN': '',
    'GOOGLE_CLOUD_AI_API_KEY': '',
    'AMAZON_REKOGNITION_ACCESS_KEY': '',
    'MICROSOFT_AZURE_COGNITIVE_KEY': '',
    'IBM_WATSON_API_KEY': '',
    'ALGOLIA_APP_ID': '',
    'ALGOLIA_ADMIN_API_KEY': '',
    'PUSHER_APP_ID': '',
    'PUSHER_KEY': '',
    'PUSHER_SECRET': '',
    'ABLY_API_KEY': '',
    'ELASTICSEARCH_API_KEY': '',
    'STRIPE_IDENTITY_SECRET_KEY': '',
    'ONFIDO_API_TOKEN': '',
    'CHECKR_API_KEY': '',
    'LOB_API_KEY': '',
    'EASYPOST_API_KEY': '',
    'SHIPPO_API_TOKEN': '',
    'GOOGLE_MAPS_API_KEY': '',
    'MAPBOX_ACCESS_TOKEN': '',
    'HERE_API_KEY': '',
    'ACCUWEATHER_API_KEY': '',
    'OPENWEATHERMAP_API_KEY': '',
    'YELP_API_KEY': '',
    'FOURSQUARE_API_KEY': '',
    'REDDIT_CLIENT_ID': '',
    'REDDIT_CLIENT_SECRET': '',
    'TWITTER_BEARER_TOKEN': '',
    'FACEBOOK_APP_ID': '',
    'FACEBOOK_APP_SECRET': '',
    'INSTAGRAM_APP_ID': '',
    'INSTAGRAM_APP_SECRET': '',
    'YOUTUBE_DATA_API_KEY': '',
    'SPOTIFY_CLIENT_ID': '',
    'SPOTIFY_CLIENT_SECRET': '',
    'SOUNDCLOUD_CLIENT_ID': '',
    'TWITCH_CLIENT_ID': '',
    'TWITCH_CLIENT_SECRET': '',
    'MUX_TOKEN_ID': '',
    'MUX_TOKEN_SECRET': '',
    'CLOUDINARY_API_KEY': '',
    'CLOUDINARY_API_SECRET': '',
    'IMGIX_API_KEY': '',
    'STRIPE_ATLAS_API_KEY': '',
    'CLERKY_API_KEY': '',
    'DOCUSIGN_INTEGRATOR_KEY': '',
    'HELLOSIGN_API_KEY': '',
    'LAUNCHDARKLY_SDK_KEY': '',
    'SENTRY_AUTH_TOKEN': '',
    'DATADOG_API_KEY': '',
    'NEW_RELIC_API_KEY': '',
    'CIRCLECI_API_TOKEN': '',
    'TRAVIS_CI_API_TOKEN': '',
    'BITBUCKET_USERNAME': '',
    'BITBUCKET_APP_PASSWORD': '',
    'GITLAB_PERSONAL_ACCESS_TOKEN': '',
    'PAGERDUTY_API_KEY': '',
    'CONTENTFUL_SPACE_ID': '',
    'CONTENTFUL_ACCESS_TOKEN': '',
    'SANITY_PROJECT_ID': '',
    'SANITY_API_TOKEN': '',
    'STRAPI_API_TOKEN': '',
    'YODLEE_CLIENT_ID': '',
    'YODLEE_SECRET': '',
    'MX_CLIENT_ID': '',
    'MX_API_KEY': '',
    'FINICITY_PARTNER_ID': '',
    'FINICITY_APP_KEY': '',
    'ADYEN_MERCHANT_ACCOUNT': '',
    'BRAINTREE_MERCHANT_ID': '',
    'BRAINTREE_PUBLIC_KEY': '',
    'BRAINTREE_PRIVATE_KEY': '',
    'SQUARE_APPLICATION_ID': '',
    'SQUARE_ACCESS_TOKEN': '',
    'PAYPAL_CLIENT_ID': '',
    'PAYPAL_SECRET': '',
    'DWOLLA_KEY': '',
    'DWOLLA_SECRET': '',
    'WORLDPAY_API_KEY': '',
    'CHECKOUT_SECRET_KEY': '',
    'MARQETA_APPLICATION_TOKEN': '',
    'MARQETA_ADMIN_ACCESS_TOKEN': '',
    'GALILEO_API_LOGIN': '',
    'GALILEO_API_TRANS_KEY': '',
    'SOLARISBANK_CLIENT_ID': '',
    'SOLARISBANK_CLIENT_SECRET': '',
    'SYNAPSE_CLIENT_ID': '',
    'SYNAPSE_CLIENT_SECRET': '',
    'RAILSBANK_API_KEY': '',
    'CLEARBANK_API_KEY': '',
    'UNIT_API_TOKEN': '',
    'TREASURY_PRIME_API_KEY': '',
    'INCREASE_API_KEY': '',
    'MERCURY_API_KEY': '',
    'BREX_API_KEY': '',
    'BOND_API_KEY': '',
    'CURRENCYCLOUD_LOGIN_ID': '',
    'CURRENCYCLOUD_API_KEY': '',
    'OFX_API_KEY': '',
    'WISE_API_TOKEN': '',
    'REMITLY_API_KEY': '',
    'AZIMO_API_KEY': '',
    'NIUM_API_KEY': '',
    'TRADIER_ACCESS_TOKEN': '',
    'IEX_CLOUD_API_TOKEN': '',
    'POLYGON_API_KEY': '',
    'FINNHUB_API_KEY': '',
    'ALPHA_VANTAGE_API_KEY': '',
    'MORNINGSTAR_API_KEY': '',
    'XIGNITE_API_TOKEN': '',
    'DRIVEWEALTH_API_KEY': '',
    'COINBASE_API_SECRET': '',
    'BINANCE_API_KEY': '',
    'BINANCE_API_SECRET': '',
    'KRAKEN_API_KEY': '',
    'KRAKEN_PRIVATE_KEY': '',
    'GEMINI_API_KEY': '',
    'GEMINI_API_SECRET': '',
    'COINMARKETCAP_API_KEY': '',
    'COINGECKO_API_KEY': '',
    'BLOCKIO_API_KEY': '',
    'JP_MORGAN_CHASE_CLIENT_ID': '',
    'CITI_CLIENT_ID': '',
    'WELLS_FARGO_CLIENT_ID': '',
    'CAPITAL_ONE_CLIENT_ID': '',
    'HSBC_CLIENT_ID': '',
    'BARCLAYS_CLIENT_ID': '',
    'BBVA_CLIENT_ID': '',
    'DEUTSCHE_BANK_API_KEY': '',
    'TINK_CLIENT_ID': '',
    'TRUELAYER_CLIENT_ID': '',
    'MIDDESK_API_KEY': '',
    'ALLOY_API_TOKEN': '',
    'ALLOY_API_SECRET': '',
    'COMPLYADVANTAGE_API_KEY': '',
    'ZILLOW_API_KEY': '',
    'CORELOGIC_CLIENT_ID': '',
    'EXPERIAN_API_KEY': '',
    'EQUIFAX_API_KEY': '',
    'TRANSUNION_API_KEY': '',
    'FINCRA_API_KEY': '',
    'FLUTTERWAVE_SECRET_KEY': '',
    'PAYSTACK_SECRET_KEY': '',
    'DLOCAL_API_KEY': '',
    'RAPYD_ACCESS_KEY': '',
    'TAXJAR_API_KEY': '',
    'AVALARA_API_KEY': '',
    'CODAT_API_KEY': '',
    'XERO_CLIENT_ID': '',
    'XERO_CLIENT_SECRET': '',
    'QUICKBOOKS_CLIENT_ID': '',
    'QUICKBOOKS_CLIENT_SECRET': '',
    'FRESHBOOKS_API_KEY': '',
    'ANVIL_API_KEY': '',
    'MOOV_CLIENT_ID': '',
    'MOOV_SECRET': '',
    'VGS_USERNAME': '',
    'VGS_PASSWORD': '',
    'SILA_APP_HANDLE': '',
    'SILA_PRIVATE_KEY': '',
};


// --- Component: AI Suggestion Banner ---

interface AISuggestionBannerProps {
  onApply: (updates: Partial<UserProfileSettings>) => void;
  suggestions: Partial<UserProfileSettings>;
  isLoading: boolean;
}

const AISuggestionBanner: React.FC<AISuggestionBannerProps> = ({ onApply, suggestions, isLoading }) => {
  const suggestionKeys = Object.keys(suggestions).length;

  if (suggestionKeys === 0 || isLoading) {
    return null;
  }

  const handleApplyAll = () => {
    onApply(suggestions);
  };

  return (
    <Card mb={6} borderLeft="4px solid" borderColor="yellow.500" bg="yellow.50" shadow="lg">
      <CardBody>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <StarIcon color="yellow.600" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" color="yellow.800">
                AI Optimization Recommendation ({suggestionKeys} items)
              </Text>
              <Text fontSize="sm" color="yellow.600">
                The Analyst Intelligence suggests recalibrating settings based on your operational profile.
              </Text>
            </VStack>
          </HStack>
          <HStack>
            {isLoading ? (
              <Spinner size="sm" color="yellow.500" />
            ) : (
              <Button
                colorScheme="yellow"
                size="sm"
                onClick={handleApplyAll}
                leftIcon={<ArrowUpIcon />}
              >
                Apply All Optimizations
              </Button>
            )}
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};


// --- Component: Tag Management Sub-Component ---

interface TagManagerProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newTag = inputValue.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag) && newTag.length > 1) {
        onTagsChange([...tags, newTag]);
        setInputValue('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <VStack align="stretch" spacing={3}>
      <FormLabel fontSize="md">Custom Metric Tags (Foundation Anchors)</FormLabel>
      <Box
        p={3}
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        minH="40px"
        bg="white"
      >
        <HStack wrap="wrap" spacing={2}>
          {tags.map((tag) => (
            <Tag
              size="md"
              key={tag}
              borderRadius="full"
              colorScheme="teal"
              variant="solid"
            >
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveTag(tag)} />
            </Tag>
          ))}
        </HStack>
      </Box>
      <Input
        placeholder="Add new tag (e.g., 'Stability', 'Disruption')"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        size="sm"
        bg="white"
      />
      <Text fontSize="xs" color="gray.500">Press Enter or comma to add tags defining your core focus areas.</Text>
    </VStack>
  );
};


// --- Main Component: PersonalizationView ---

const PersonalizationView: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [settings, setSettings] = useState<UserProfileSettings>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [aiNarrative, setAiNarrative] = useState('');
  const [suggestions, setSuggestions] = useState<Partial<UserProfileSettings>>({});
  
  // Initialize API keys state using the padded initial state structure
  const [apiKeys, setApiKeys] = useState<ApiKeysState>(INITIAL_API_KEYS as ApiKeysState); 
  const [activeTab, setActiveTab] = useState<'personalization' | 'apis'>('personalization'); 


  // --- Initialization and AI Narrative Fetch ---
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // 1. Load AI Narrative
        const narrative = await AIService.generateNarrative(INITIAL_STATE.aiAgentPersona);
        setAiNarrative(narrative);

        // 2. Run initial AI suggestion sweep
        const initialSuggestions = await AIService.analyzeAndSuggest(INITIAL_STATE);
        setSuggestions(initialSuggestions);

      } catch (error) {
        console.error("Initialization failed:", error);
        toast({
          title: "Initialization Error",
          description: "Could not load initial AI context.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []); // Run once on mount

  // --- Handlers for UserProfileSettings ---

  const handleChange = useCallback((key: keyof UserProfileSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };

      // Re-trigger AI analysis on significant structural changes
      if (key === 'aiVerbosityLevel' || key === 'securityAlertThreshold' || key === 'kpiDisplayMode') {
        AIService.analyzeAndSuggest(newSettings).then(setSuggestions);
      }

      return newSettings;
    });
  }, [toast]);

  const handleApplyAISuggestions = useCallback(async (updates: Partial<UserProfileSettings>) => {
    setIsLoading(true);
    toast({
      title: "Applying Optimizations",
      description: "Integrating AI-derived configuration adjustments.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    // Simulate deep integration process
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSettings(prev => {
      const finalSettings = { ...prev, ...updates };

      // Apply theme change logic based on what the AI suggested
      if (updates.theme && (updates.theme === 'light' || updates.theme === 'dark')) {
          // In a production system, this UI toggle should be handled by system context listeners,
          // but here we reflect the change if the suggestion forces a non-system mode.
      }

      return finalSettings;
    });

    setSuggestions({}); // Clear suggestions
    setIsLoading(false);
    toast({
      title: "Configuration Updated",
      description: "Your environment has been optimized for mission execution.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const handleSave = useCallback(() => {
    // In a real application, this would trigger an API call to persist settings to the backend service layer.
    console.log("Saving Final Configuration:", settings);
    toast({
      title: "Configuration Persisted",
      description: "Your core preferences are now locked into the central matrix.",
      status: "success",
      duration: 4000,
      isClosable: true,
    });
  }, [settings, toast]);

  // --- Handlers for ApiKeysState (Unified API Connector Simulation) ---

  const handleApiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure the input field corresponds to a defined key in the structure, even if padding
    setApiKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({
      title: 'API Keys Submission Initiated',
      description: 'Sending credentials for API orchestration setup. **Note: Keys are placeholders for secure Vault integration.**',
      status: 'loading',
      duration: 5000,
      isClosable: true,
    });
    try {
      // Simulated API call to the hardened backend endpoint
      const response = await fetch('http://localhost:4000/api/v1/config/save-api-credentials', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              // Authorization header for JWT/OIDC context missing here, but required in production
          },
          body: JSON.stringify(apiKeys),
      });
      
      // Assuming backend responds with JSON structure
      const data = await response.json();

      if (response.ok) {
        toast({
            title: "API Orchestration Success",
            description: data.message || 'All registered API integrations validated and secured in Vault.',
            status: "success",
            duration: 9000,
            isClosable: true,
        });
      } else {
         throw new Error(data.error || 'Server responded with an error status.');
      }
    } catch (error: any) {
      console.error('API Key Save Error:', error);
      toast({
        title: 'API Key Save Failed',
        description: `Critical failure in API relay: ${error.message}`,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderApiInput = (keyName: keyof ApiKeysState, label: string) => (
    <FormControl key={keyName}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <Input
        type="password"
        id={keyName}
        name={keyName}
        value={apiKeys[keyName] || ''}
        onChange={handleApiInputChange}
        placeholder={`Enter ${label}`}
        size="sm"
        bg="white"
      />
    </FormControl>
  );
  
  // --- Render Helpers for Personalization Tab ---

  const renderThemeControl = () => (
    <FormControl>
      <FormLabel>Interface Theme Protocol</FormLabel>
      <HStack spacing={4} p={3} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
        <Text flex={1}>Current Mode: <Badge colorScheme={colorMode === 'dark' ? 'purple' : 'blue'}>{colorMode.toUpperCase()}</Badge></Text>
        <Button
          onClick={() => {
            toggleColorMode();
            // If user manually toggles, we set the theme explicitly to light/dark, overriding 'system' if necessary for immediate effect demonstration
            const newTheme = colorMode === 'dark' ? 'light' : 'dark';
            setSettings(prev => ({...prev, theme: newTheme}));
          }}
          leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          size="sm"
        >
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
        </Button>
        <Select
          value={settings.theme}
          onChange={(e) => handleChange('theme', e.target.value)}
          size="sm"
          isDisabled={isLoading}
        >
          <option value="light">Light (Static)</option>
          <option value="dark">Dark (Static)</option>
          <option value="system">System Sync (Adaptive)</option>
        </Select>
      </HStack>
    </FormControl>
  );

  const renderAIAgentControl = () => (
    <VStack spacing={4} p={4} bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'} borderRadius="lg" shadow="inner">
      <Heading size="md" color="indigo.400" display="flex" alignItems="center">
        <AtSignIcon mr={2} /> AI Agent Configuration Matrix
      </Heading>

      <FormControl>
        <FormLabel fontSize="sm">AI Proxy Name</FormLabel>
        <Input
          value={settings.aiAgentName}
          onChange={(e) => handleChange('aiAgentName', e.target.value)}
          isDisabled={isLoading}
          bg="white"
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">AI Agent Persona Core</FormLabel>
        <Select
          value={settings.aiAgentPersona}
          onChange={(e) => {
            const newPersona = e.target.value as UserProfileSettings['aiAgentPersona'];
            handleChange('aiAgentPersona', newPersona);
            // Immediately fetch new narrative upon persona change, non-blocking
            AIService.generateNarrative(newPersona).then(setAiNarrative);
          }}
          isDisabled={isLoading}
          bg="white"
        >
          <option value="Analyst">Analyst (Data Synthesis)</option>
          <option value="Strategist">Strategist (Long-Term Vectoring)</option>
          <option value="Guardian">Guardian (Security Focus)</option>
          <option value="Observer">Observer (Passive Monitoring)</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">AI Verbosity Level (Detail Output)</FormLabel>
        <HStack spacing={4}>
          <Progress value={settings.aiVerbosityLevel * 20} flex={1} colorScheme="green" />
          <Text fontSize="lg" fontWeight="bold" w="10">{settings.aiVerbosityLevel}</Text>
        </HStack>
        <Input
          type="range"
          min="1"
          max="5"
          step="1"
          value={settings.aiVerbosityLevel}
          onChange={(e) => handleChange('aiVerbosityLevel', parseInt(e.target.value))}
          isDisabled={isLoading}
        />
        <Text fontSize="xs" color="gray.500">Level 5 provides quantum-level detail; Level 1 is executive summary only.</Text>
      </FormControl>

      <Box w="full" p={3} bg={colorMode === 'dark' ? 'gray.800' : 'white'} borderRadius="md" border="1px dashed" borderColor="indigo.300">
        <Text fontSize="sm" fontStyle="italic" color="indigo.300">
          <InfoOutlineIcon mr={1} /> AI Contextual Output: {aiNarrative || "Loading..."}
        </Text>
      </Box>
    </VStack>
  );

  const renderSecurityControls = () => (
    <VStack spacing={4} p={4} bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'} borderRadius="lg" shadow="inner">
      <Heading size="md" color="red.400" display="flex" alignItems="center">
        <LockIcon mr={2} /> Quantum Security & Anomaly Thresholds
      </Heading>

      <FormControl>
        <FormLabel fontSize="sm">Security Alert Threshold (% Delta)</FormLabel>
        <HStack spacing={4}>
          <Progress value={settings.securityAlertThreshold * 5} colorScheme="red" flex={1} />
          <Text fontSize="lg" fontWeight="bold" w="10">{settings.securityAlertThreshold.toFixed(1)}%</Text>
        </HStack>
        <Input
          type="range"
          min="0.5"
          max="5.0"
          step="0.1"
          value={settings.securityAlertThreshold}
          onChange={(e) => handleChange('securityAlertThreshold', parseFloat(e.target.value))}
          isDisabled={isLoading}
        />
        <Text fontSize="xs" color="gray.500">Triggers high-alert if any monitored metric deviates by this percentage from projection.</Text>
      </FormControl>

      <FormControl display="flex" alignItems="center" justifyContent="space-between">
        <VStack align="start" spacing={0}>
            <FormLabel htmlFor="biometric-auth" mb="0" fontSize="sm">Biometric Authentication Integration</FormLabel>
            <Text fontSize="xs" color="gray.500">Uses local device hardware validation. (Future implementation: JWT Session Binding)</Text>
        </VStack>
        <Switch
          id="biometric-auth"
          isChecked={settings.biometricAuthEnabled}
          onChange={(e) => handleChange('biometricAuthEnabled', e.target.checked)}
          colorScheme="red"
          isDisabled={isLoading}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Quantum Encryption Layer</FormLabel>
        <Select
          value={settings.quantumEncryptionLevel}
          onChange={(e) => handleChange('quantumEncryptionLevel', e.target.value as UserProfileSettings['quantumEncryptionLevel'])}
          isDisabled={isLoading}
          bg="white"
        >
          <option value="L1">Level 1 (Standard Post-Quantum)</option>
          <option value="L2">Level 2 (Entangled Key Exchange)</option>
          <option value="L3">Level 3 (Hyperspace Redundancy)</option>
        </Select>
      </FormControl>
    </VStack>
  );

  // --- API Tab Rendering Helpers (Unified API Connector Visualization) ---

  const renderBankingApis = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {/* === Banking & Finance APIs === */}
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Data Aggregators (Plaid MVP Focus)</Heading>
            {renderApiInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
            {renderApiInput('PLAID_SECRET', 'Plaid Secret')}
            {renderApiInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
            {renderApiInput('YODLEE_SECRET', 'Yodlee Secret')}
            {renderApiInput('MX_CLIENT_ID', 'MX Client ID')}
            {renderApiInput('MX_API_KEY', 'MX API Key')}
            {renderApiInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
            {renderApiInput('FINICITY_APP_KEY', 'Finicity App Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Payment Processing (Adyen MVP Focus)</Heading>
            {renderApiInput('ADYEN_API_KEY', 'Adyen API Key')}
            {renderApiInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
            {renderApiInput('BRAINTREE_MERCHANT_ID', 'Braintree Merchant ID')}
            {renderApiInput('BRAINTREE_PUBLIC_KEY', 'Braintree Public Key')}
            {renderApiInput('BRAINTREE_PRIVATE_KEY', 'Braintree Private Key')}
            {renderApiInput('SQUARE_APPLICATION_ID', 'Square Application ID')}
            {renderApiInput('SQUARE_ACCESS_TOKEN', 'Square Access Token')}
            {renderApiInput('PAYPAL_CLIENT_ID', 'PayPal Client ID')}
            {renderApiInput('PAYPAL_SECRET', 'PayPal Secret')}
            {renderApiInput('DWOLLA_KEY', 'Dwolla Key')}
            {renderApiInput('DWOLLA_SECRET', 'Dwolla Secret')}
            {renderApiInput('WORLDPAY_API_KEY', 'Worldpay API Key')}
            {renderApiInput('CHECKOUT_SECRET_KEY', 'Checkout Secret Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">BaaS & Card Issuing</Heading>
            {renderApiInput('MARQETA_APPLICATION_TOKEN', 'Marqeta Application Token')}
            {renderApiInput('MARQETA_ADMIN_ACCESS_TOKEN', 'Marqeta Admin Access Token')}
            {renderApiInput('GALILEO_API_LOGIN', 'Galileo API Login')}
            {renderApiInput('GALILEO_API_TRANS_KEY', 'Galileo Trans Key')}
            {renderApiInput('SOLARISBANK_CLIENT_ID', 'SolarisBank Client ID')}
            {renderApiInput('SOLARISBANK_CLIENT_SECRET', 'SolarisBank Client Secret')}
            {renderApiInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
            {renderApiInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
            {renderApiInput('RAILSBANK_API_KEY', 'Railsbank API Key')}
            {renderApiInput('CLEARBANK_API_KEY', 'ClearBank API Key')}
            {renderApiInput('UNIT_API_TOKEN', 'Unit API Token')}
            {renderApiInput('TREASURY_PRIME_API_KEY', 'Treasury Prime API Key')}
            {renderApiInput('INCREASE_API_KEY', 'Increase API Key')}
            {renderApiInput('MERCURY_API_KEY', 'Mercury API Key')}
            {renderApiInput('BREX_API_KEY', 'Brex API Key')}
            {renderApiInput('BOND_API_KEY', 'Bond API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">International Payments</Heading>
            {renderApiInput('CURRENCYCLOUD_LOGIN_ID', 'CurrencyCloud Login ID')}
            {renderApiInput('CURRENCYCLOUD_API_KEY', 'CurrencyCloud API Key')}
            {renderApiInput('OFX_API_KEY', 'OFX API Key')}
            {renderApiInput('WISE_API_TOKEN', 'Wise API Token')}
            {renderApiInput('REMITLY_API_KEY', 'Remitly API Key')}
            {renderApiInput('AZIMO_API_KEY', 'Azimo API Key')}
            {renderApiInput('NIUM_API_KEY', 'Nium API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Investment & Market Data (Alpaca MVP Focus)</Heading>
            {renderApiInput('ALPACA_API_KEY_ID', 'Alpaca API Key ID')}
            {renderApiInput('ALPACA_SECRET_KEY', 'Alpaca Secret Key')}
            {renderApiInput('TRADIER_ACCESS_TOKEN', 'Tradier Access Token')}
            {renderApiInput('IEX_CLOUD_API_TOKEN', 'IEX Cloud API Token')}
            {renderApiInput('POLYGON_API_KEY', 'Polygon.io API Key')}
            {renderApiInput('FINNHUB_API_KEY', 'Finnhub API Key')}
            {renderApiInput('ALPHA_VANTAGE_API_KEY', 'Alpha Vantage API Key')}
            {renderApiInput('MORNINGSTAR_API_KEY', 'Morningstar API Key')}
            {renderApiInput('XIGNITE_API_TOKEN', 'Xignite API Token')}
            {renderApiInput('DRIVEWEALTH_API_KEY', 'DriveWealth API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Crypto Exchanges</Heading>
            {renderApiInput('COINBASE_API_KEY', 'Coinbase API Key')}
            {renderApiInput('COINBASE_API_SECRET', 'Coinbase API Secret')}
            {renderApiInput('BINANCE_API_KEY', 'Binance API Key')}
            {renderApiInput('BINANCE_API_SECRET', 'Binance API Secret')}
            {renderApiInput('KRAKEN_API_KEY', 'Kraken API Key')}
            {renderApiInput('KRAKEN_PRIVATE_KEY', 'Kraken Private Key')}
            {renderApiInput('GEMINI_API_KEY', 'Gemini API Key')}
            {renderApiInput('GEMINI_API_SECRET', 'Gemini API Secret')}
            {renderApiInput('COINMARKETCAP_API_KEY', 'CoinMarketCap API Key')}
            {renderApiInput('COINGECKO_API_KEY', 'CoinGecko API Key')}
            {renderApiInput('BLOCKIO_API_KEY', 'Block.io API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Major Banks (Open Banking)</Heading>
            {renderApiInput('JP_MORGAN_CHASE_CLIENT_ID', 'JP Morgan Chase Client ID')}
            {renderApiInput('CITI_CLIENT_ID', 'Citi Client ID')}
            {renderApiInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
            {renderApiInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">EU Open Banking</Heading>
            {renderApiInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
            {renderApiInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
            {renderApiInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
            {renderApiInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            {renderApiInput('TINK_CLIENT_ID', 'Tink Client ID')}
            {renderApiInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Compliance & Identity (MidDesk MVP Focus)</Heading>
            {renderApiInput('MIDDESK_API_KEY', 'MidDesk API Key')}
            {renderApiInput('ALLOY_API_TOKEN', 'Alloy API Token')}
            {renderApiInput('ALLOY_API_SECRET', 'Alloy API Secret')}
            {renderApiInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Real Estate</Heading>
            {renderApiInput('ZILLOW_API_KEY', 'Zillow API Key')}
            {renderApiInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Credit Bureaus</Heading>
            {renderApiInput('EXPERIAN_API_KEY', 'Experian API Key')}
            {renderApiInput('EQUIFAX_API_KEY', 'Equifax API Key')}
            {renderApiInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Emerging Markets Payments</Heading>
            {renderApiInput('FINCRA_API_KEY', 'Fincra API Key')}
            {renderApiInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
            {renderApiInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
            {renderApiInput('DLOCAL_API_KEY', 'DLocal API Key')}
            {renderApiInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Accounting & Tax</Heading>
            {renderApiInput('TAXJAR_API_KEY', 'TaxJar API Key')}
            {renderApiInput('AVALARA_API_KEY', 'Avalara API Key')}
            {renderApiInput('CODAT_API_KEY', 'Codat API Key')}
            {renderApiInput('XERO_CLIENT_ID', 'Xero Client ID')}
            {renderApiInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
            {renderApiInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
            {renderApiInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
            {renderApiInput('FRESHBOOKS_API_KEY', 'Freshbooks API Key')}
        </Box>
        <Box>
            <Heading size="sm" mb={3} color="orange.500">Fintech Utilities</Heading>
            {renderApiInput('ANVIL_API_KEY', 'Anvil API Key')}
            {renderApiInput('MOOV_CLIENT_ID', 'Moov Client ID')}
            {renderApiInput('MOOV_SECRET', 'Moov Secret')}
            {renderApiInput('VGS_USERNAME', 'VGS Username')}
            {renderApiInput('VGS_PASSWORD', 'VGS Password')}
            {renderApiInput('SILA_APP_HANDLE', 'Sila App Handle')}
            {renderApiInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
        </Box>
    </SimpleGrid>
  );

  const renderTechApis = () => (
    <form onSubmit={handleApiSubmit} className="settings-form">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {/* === Tech APIs (MVP Focus: Core Services) === */}
            <Box>
                <Heading size="md" mb={3} color="teal.500">Core Infrastructure & Cloud</Heading>
                {renderApiInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
                {renderApiInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
                {renderApiInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
                {renderApiInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
                {renderApiInput('AZURE_CLIENT_ID', 'Azure Client ID')}
                {renderApiInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
                {renderApiInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">AI & ML Engines (OpenAI MVP Focus)</Heading>
                {renderApiInput('OPENAI_API_KEY', 'OpenAI API Key')}
                {renderApiInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
                {renderApiInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
                {renderApiInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
                {renderApiInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Azure Cognitive Key')}
                {renderApiInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Collaboration & Source Control</Heading>
                {renderApiInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub PAT')}
                {renderApiInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
                {renderApiInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
                {renderApiInput('TRELLO_API_KEY', 'Trello API Key')}
                {renderApiInput('TRELLO_API_TOKEN', 'Trello API Token')}
                {renderApiInput('JIRA_USERNAME', 'Jira Username')}
                {renderApiInput('JIRA_API_TOKEN', 'Jira API Token')}
                {renderApiInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana PAT')}
                {renderApiInput('NOTION_API_KEY', 'Notion API Key')}
                {renderApiInput('AIRTABLE_API_KEY', 'Airtable API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">File & Data Storage</Heading>
                {renderApiInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
                {renderApiInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
                {renderApiInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
                {renderApiInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">CRM & Business</Heading>
                {renderApiInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
                {renderApiInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
                {renderApiInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
                {renderApiInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
                {renderApiInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
                {renderApiInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">E-commerce</Heading>
                {renderApiInput('SHOPIFY_API_KEY', 'Shopify API Key')}
                {renderApiInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
                {renderApiInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
                {renderApiInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
                {renderApiInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
                {renderApiInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Authentication & Identity</Heading>
                {renderApiInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
                {renderApiInput('STYTCH_SECRET', 'Stytch Secret')}
                {renderApiInput('AUTH0_DOMAIN', 'Auth0 Domain')}
                {renderApiInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
                {renderApiInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
                {renderApiInput('OKTA_DOMAIN', 'Okta Domain')}
                {renderApiInput('OKTA_API_TOKEN', 'Okta API Token')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Backend & Databases</Heading>
                {renderApiInput('FIREBASE_API_KEY', 'Firebase API Key')}
                {renderApiInput('SUPABASE_URL', 'Supabase URL')}
                {renderApiInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">API Development & Testing</Heading>
                {renderApiInput('POSTMAN_API_KEY', 'Postman API Key')}
                {renderApiInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </Box>
            
            <Box>
                <Heading size="md" mb={3} color="teal.500">Search & Real-time</Heading>
                {renderApiInput('ALGOLIA_APP_ID', 'Algolia App ID')}
                {renderApiInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
                {renderApiInput('PUSHER_APP_ID', 'Pusher App ID')}
                {renderApiInput('PUSHER_KEY', 'Pusher Key')}
                {renderApiInput('PUSHER_SECRET', 'Pusher Secret')}
                {renderApiInput('ABLY_API_KEY', 'Ably API Key')}
                {renderApiInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Identity & Verification</Heading>
                {renderApiInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
                {renderApiInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
                {renderApiInput('CHECKR_API_KEY', 'Checkr API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Logistics & Shipping</Heading>
                {renderApiInput('LOB_API_KEY', 'Lob API Key')}
                {renderApiInput('EASYPOST_API_KEY', 'Easypost API Key')}
                {renderApiInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Maps & Weather</Heading>
                {renderApiInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
                {renderApiInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
                {renderApiInput('HERE_API_KEY', 'HERE API Key')}
                {renderApiInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
                {renderApiInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Social & Media</Heading>
                {renderApiInput('YELP_API_KEY', 'Yelp API Key')}
                {renderApiInput('FOURSQUARE_API_KEY', 'Foursquare API Key')}
                {renderApiInput('REDDIT_CLIENT_ID', 'Reddit Client ID')}
                {renderApiInput('REDDIT_CLIENT_SECRET', 'Reddit Client Secret')}
                {renderApiInput('TWITTER_BEARER_TOKEN', 'Twitter Bearer Token')}
                {renderApiInput('FACEBOOK_APP_ID', 'Facebook App ID')}
                {renderApiInput('FACEBOOK_APP_SECRET', 'Facebook App Secret')}
                {renderApiInput('INSTAGRAM_APP_ID', 'Instagram App ID')}
                {renderApiInput('INSTAGRAM_APP_SECRET', 'Instagram App Secret')}
                {renderApiInput('YOUTUBE_DATA_API_KEY', 'YouTube Data API Key')}
                {renderApiInput('SPOTIFY_CLIENT_ID', 'Spotify Client ID')}
                {renderApiInput('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret')}
                {renderApiInput('SOUNDCLOUD_CLIENT_ID', 'Soundcloud Client ID')}
                {renderApiInput('TWITCH_CLIENT_ID', 'Twitch Client ID')}
                {renderApiInput('TWITCH_CLIENT_SECRET', 'Twitch Client Secret')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Media & Content</Heading>
                {renderApiInput('MUX_TOKEN_ID', 'Mux Token ID')}
                {renderApiInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
                {renderApiInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
                {renderApiInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
                {renderApiInput('IMGIX_API_KEY', 'Imgix API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Legal & Admin</Heading>
                {renderApiInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
                {renderApiInput('CLERKY_API_KEY', 'Clerky API Key')}
                {renderApiInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
                {renderApiInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Monitoring & CI/CD</Heading>
                {renderApiInput('LAUNCHDARKLY_SDK_KEY', 'LaunchDarkly SDK Key')}
                {renderApiInput('SENTRY_AUTH_TOKEN', 'Sentry Auth Token')}
                {renderApiInput('DATADOG_API_KEY', 'Datadog API Key')}
                {renderApiInput('NEW_RELIC_API_KEY', 'New Relic API Key')}
                {renderApiInput('CIRCLECI_API_TOKEN', 'CircleCI API Token')}
                {renderApiInput('TRAVIS_CI_API_TOKEN', 'Travis CI API Token')}
                {renderApiInput('BITBUCKET_USERNAME', 'Bitbucket Username')}
                {renderApiInput('BITBUCKET_APP_PASSWORD', 'Bitbucket App Password')}
                {renderApiInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab PAT')}
                {renderApiInput('PAGERDUTY_API_KEY', 'PagerDuty API Key')}
            </Box>
            <Box>
                <Heading size="md" mb={3} color="teal.500">Headless CMS</Heading>
                {renderApiInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
                {renderApiInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
                {renderApiInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
                {renderApiInput('SANITY_API_TOKEN', 'Sanity API Token')}
                {renderApiInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </Box>
        </SimpleGrid>
        <Box w="full" mt={8} p={4} bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'} borderRadius="md">
            <Heading size="md" mb={3} color="blue.500">Banking & Finance Integration Endpoints</Heading>
            {renderBankingApis()}
        </Box>
        <Flex justify="flex-end" mt={8}>
             <Button type="submit" colorScheme="green" size="lg" isLoading={isLoading} leftIcon={<CheckCircleIcon />}>
                Commit All Tech & Banking Keys to Server
            </Button>
        </Flex>
    </form>
  );

  // --- Main Render ---
  return (
    <Box p={{ base: 4, md: 10 }} minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
      <VStack spacing={8} align="stretch" maxW="7xl" mx="auto">

        <Heading as="h1" size="2xl" color={colorMode === 'dark' ? 'white' : 'gray.800'} borderBottom="2px solid" borderColor="purple.500" pb={2}>
          <SettingsIcon mr={3} /> Core Configuration Interface
        </Heading>

        <Text fontSize="lg" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
          System Access Panel: Control User Experience (Personalization) or manage External Service Credentials (API Orchestration Layer).
        </Text>

        <div className="tabs">
            <Button 
                size="lg" 
                variant={activeTab === 'personalization' ? 'solid' : 'outline'} 
                colorScheme="purple" 
                onClick={() => setActiveTab('personalization')} 
                mr={3}
                leftIcon={<ViewIcon/>}
            >
                User Personalization
            </Button>
            <Button 
                size="lg" 
                variant={activeTab === 'apis' ? 'solid' : 'outline'} 
                colorScheme="teal" 
                onClick={() => setActiveTab('apis')}
                leftIcon={<LockIcon/>}
            >
                External API Credentials ({activeTab === 'apis' ? 'Active' : 'Secure'})
            </Button>
        </div>


        {activeTab === 'personalization' ? (
            <>
                {/* AI Recommendation System */}
                <AISuggestionBanner
                  onApply={handleApplyAISuggestions}
                  suggestions={suggestions}
                  isLoading={isLoading}
                />

                {/* CORE SETTINGS GRID */}
                <Card shadow="xl" p={6} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                  <CardHeader>
                    <Heading size="lg" color="purple.400">Interface & Display Configuration</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {/* 1. Theme Control */}
                      <Box>{renderThemeControl()}</Box>

                      {/* 2. Dashboard Layout */}
                      <FormControl>
                        <FormLabel>Dashboard Layout Protocol</FormLabel>
                        <Select
                          value={settings.dashboardLayout}
                          onChange={(e) => handleChange('dashboardLayout', e.target.value)}
                          isDisabled={isLoading}
                          bg="white"
                        >
                          <option value="modular">Modular (High Customization)</option>
                          <option value="streamlined">Streamlined (Focus on Flow)</option>
                          <option value="executive">Executive (KPI Density)</option>
                        </Select>
                      </FormControl>

                      {/* 3. KPI Display Mode */}
                      <FormControl>
                        <FormLabel>KPI Reporting Mode</FormLabel>
                        <Select
                          value={settings.kpiDisplayMode}
                          onChange={(e) => handleChange('kpiDisplayMode', e.target.value)}
                          isDisabled={isLoading}
                          bg="white"
                        >
                          <option value="absolute">Absolute Value</option>
                          <option value="delta">Delta Change (Rate of Shift)</option>
                          <option value="projection">Projected Trajectory (AI Forecast)</option>
                        </Select>
                      </FormControl>

                      {/* 4. Data Density */}
                      <FormControl>
                        <FormLabel>Information Density</FormLabel>
                        <Select
                          value={settings.dataDensity}
                          onChange={(e) => handleChange('dataDensity', e.target.value)}
                          isDisabled={isLoading}
                          bg="white"
                        >
                          <option value="low">Low (Cognitive Load Reduction)</option>
                          <option value="medium">Medium (Standard Operational)</option>
                          <option value="high">High (Maximum Data Saturation)</option>
                        </Select>
                      </FormControl>

                      {/* 5. Primary Color Accent */}
                      <FormControl>
                        <FormLabel>Primary Accent Color (System Branding)</FormLabel>
                        <HStack>
                          <Input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            h="38px"
                            w="38px"
                            p={0}
                            border="none"
                            cursor="pointer"
                          />
                          <Input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            isDisabled={isLoading}
                            bg="white"
                          />
                        </HStack>
                      </FormControl>

                      {/* 6. Transaction Visualization Style */}
                      <FormControl>
                        <FormLabel>Transaction Visualization Style</FormLabel>
                        <Select
                          value={settings.transactionVisualizationStyle}
                          onChange={(e) => handleChange('transactionVisualizationStyle', e.target.value)}
                          isDisabled={isLoading}
                          bg="white"
                        >
                          <option value="flow">Flow Diagram (Linear)</option>
                          <option value="network">Network Graph (Interconnectivity)</option>
                          <option value="timeline">Chronological Timeline</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* AI & SECURITY MATRIX */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                  {renderAIAgentControl()}
                  {renderSecurityControls()}
                </SimpleGrid>

                {/* LINGUISTIC & GEOSPATIAL ALIGNMENT */}
                <Card shadow="xl" p={6} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                  <CardHeader>
                    <Heading size="lg" color="cyan.400">Linguistic & Temporal Alignment</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                      <FormControl>
                        <FormLabel fontSize="sm">Preferred Language Code</FormLabel>
                        <Input
                          value={settings.language}
                          onChange={(e) => handleChange('language', e.target.value.toUpperCase())}
                          isDisabled={isLoading}
                          bg="white"
                        />
                        <Text fontSize="xs" color="gray.500">ISO 639-1 format (e.g., EN, ES, ZH)</Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Timezone Synchronization</FormLabel>
                        <Input
                          value={settings.timezone}
                          onChange={(e) => handleChange('timezone', e.target.value)}
                          isDisabled={isLoading}
                          bg="white"
                        />
                        <Text fontSize="xs" color="gray.500">IANA format (e.g., America/New_York)</Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Preferred Currency Anchor</FormLabel>
                        <Input
                          value={settings.preferredCurrency}
                          onChange={(e) => handleChange('preferredCurrency', e.target.value.toUpperCase())}
                          isDisabled={isLoading}
                          bg="white"
                        />
                        <Text fontSize="xs" color="gray.500">ISO 4217 format (e.g., USD, EUR, JPY)</Text>
                      </FormControl>

                      <FormControl gridColumn={{ base: '1', md: 'span 3' }}>
                        <FormLabel fontSize="sm">Financial Narrative Style</FormLabel>
                        <Select
                          value={settings.financialNarrativeStyle}
                          onChange={(e) => handleChange('financialNarrativeStyle', e.target.value)}
                          isDisabled={isLoading}
                          bg="white"
                        >
                          <option value="formal">Formal (Regulatory Compliance)</option>
                          <option value="direct">Direct (Unfiltered Data)</option>
                          <option value="visionary">Visionary (Mission Alignment)</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* ADVANCED METRICS AND PREDICTION */}
                <Card shadow="xl" p={6} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                  <CardHeader>
                    <Heading size="lg" color="orange.400">Predictive Modeling & Metric Anchoring</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <VStack align="start">
                          <FormLabel htmlFor="predictive-modeling" mb="0">Enable Predictive Modeling Engine</FormLabel>
                          <Text fontSize="xs" color="gray.500">Utilizes latent space analysis for forward-looking simulations.</Text>
                        </VStack>
                        <Switch
                          id="predictive-modeling"
                          isChecked={settings.enablePredictiveModeling}
                          onChange={(e) => handleChange('enablePredictiveModeling', e.target.checked)}
                          colorScheme="orange"
                          isDisabled={isLoading}
                        />
                      </FormControl>

                      <FormControl>
                        <TagManager
                          tags={settings.customMetricTags}
                          onTagsChange={(newTags) => handleChange('customMetricTags', newTags)}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>


                {/* PERSISTENCE LAYER */}
                <Flex justify="flex-end" pt={4} borderTop="1px solid" borderColor="gray.700">
                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={handleSave}
                    leftIcon={<CheckCircleIcon />}
                    isLoading={isLoading}
                    loadingText="Synchronizing..."
                  >
                    Commit Configuration to Central Ledger
                  </Button>
                </Flex>
            </>
        ) : (
            // API Credentials Tab Content
            <Card shadow="xl" p={6} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                <CardHeader>
                    <Heading size="lg" color="teal.400">External API Credential Management</Heading>
                    <Text fontSize="md" color="gray.500" mt={2}>Warning: All data entered below will be sent to your backend server for secure storage in Vault (Simulated).</Text>
                </CardHeader>
                <CardBody>
                    {renderTechApis()}
                </CardBody>
            </Card>
        )}

      </VStack>
    </Box>
  );
};

export default PersonalizationView;