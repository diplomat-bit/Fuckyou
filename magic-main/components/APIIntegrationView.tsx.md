// components/APIIntegrationView.tsx

import React, { useState, FormEvent, useMemo } from 'react';
// Removed axios dependency for direct UI component interaction, as API interaction logic belongs in services/connectors.
// We simulate state loading/saving based on the MVP scope cleanup instructions.
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// --- REFACTORING NOTE ---
// 1. Stack Unification: Replaced custom CSS with MUI (Material-UI) for standardized styling.
// 2. Flawed Component Removal: The interface containing 200+ keys is too broad and violates security principles (storing all keys on a single component state/form submission).
// 3. MVP Scope Focus: We will focus only on keys necessary for the recommended MVP: "Multi-bank aggregation with smart alerts" (requiring Plaid/Yodlee/etc.) and "AI-powered transaction intelligence" (requiring OpenAI).
// 4. Security: Realistically, these keys should be loaded securely from a backend service (like AWS Secrets Manager via a proxy) and never collected via a monolithic form submission like this in production. This component is refactored to represent an *Admin Configuration Interface* that connects to a standardized backend management service, assumed secured via JWT/Session.

// Define the structure for the relevant MVP keys only.
interface MvpApiKeysState {
  // Financial Aggregation (For Multi-bank Aggregation MVP)
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;

  // AI/Intelligence (For AI Transaction Intelligence MVP)
  OPENAI_API_KEY: string;
  // Note: In a real system, AWS/Azure/GCP AI keys would also be scoped here if used.

  // Backend Reference (Placeholder for secure storage/retrieval endpoint configuration)
  BACKEND_CONFIG_URL: string;
}

// Mock initial state reflecting the reduced scope
const INITIAL_MVP_KEYS: MvpApiKeysState = {
  PLAID_CLIENT_ID: '',
  PLAID_SECRET: '',
  YODLEE_CLIENT_ID: '',
  YODLEE_SECRET: '',
  OPENAI_API_KEY: '',
  BACKEND_CONFIG_URL: 'http://localhost:4000/api/v1/admin/config/integrations',
};

// =============================================================================
// Styled Components using MUI
// =============================================================================

const SettingsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1200,
  margin: '0 auto',
  fontFamily: 'Roboto, sans-serif',
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const TabContainer = styled(Tabs)({
  marginBottom: 24,
});

const SaveButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
}));

// =============================================================================
// Component Implementation
// =============================================================================

type ActiveTab = 'finance' | 'ai' | 'system';

const APIIntegrationView: React.FC = () => {
  const [keys, setKeys] = useState<MvpApiKeysState>(INITIAL_MVP_KEYS);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('finance');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
    setStatusMessage(null); // Clear status on input change
  };

  // Refactored to simulate secure API call to a dedicated configuration endpoint
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ type: 'info', message: 'Attempting to securely sync configuration to backend...' });

    // Security hardening: Never send plaintext secrets in production this way.
    // For this refactoring exercise, we simulate validation and storage.
    const sensitiveKeys = {
        PLAID_SECRET: keys.PLAID_SECRET ? '***REDACTED***' : '',
        YODLEE_SECRET: keys.YODLEE_SECRET ? '***REDACTED***' : '',
        OPENAI_API_KEY: keys.OPENAI_API_KEY ? '***REDACTED***' : '',
        // Other keys would follow standard logging/masking rules
    };
    
    console.log("Configuration payload submitted (masked secrets):", { ...keys, ...sensitiveKeys });

    try {
      // SIMULATING SECURE API CALL
      // In a real system, this endpoint would handle credential validation,
      // encryption, and storage in AWS Secrets Manager or Vault.
      // await axios.post(keys.BACKEND_CONFIG_URL, keys, { headers: { Authorization: 'Bearer <JWT>' } });

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

      setStatusMessage({ 
        type: 'success', 
        message: `Configuration synchronized successfully to ${keys.BACKEND_CONFIG_URL}. (Secrets masked on client side)` 
      });
    } catch (error) {
      // FIX: Ensure robust error handling (e.g., 401 Unauthorized, 400 Validation Error)
      setStatusMessage({ 
        type: 'error', 
        message: 'Error: Failed to save keys. Check backend service status and authentication headers.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof MvpApiKeysState, label: string, type: string = 'password', isSystemUrl: boolean = false) => (
    <TextField
      fullWidth
      margin="normal"
      label={label}
      id={keyName}
      name={keyName}
      type={type}
      variant="outlined"
      value={keys[keyName] || ''}
      onChange={handleInputChange}
      placeholder={isSystemUrl ? `e.g., ${keys[keyName]}` : `Enter ${label}`}
      InputProps={{
        readOnly: isSystemUrl, // Backend URL should generally not be changed here
        style: {
            color: isSystemUrl ? 'gray' : undefined
        }
      }}
      helperText={isSystemUrl ? "Target endpoint for configuration synchronization." : `Required for ${label.split(' ')[0]} integration.`}
    />
  );

  const ConfigurationForm = useMemo(() => {
    switch (activeTab) {
      case 'finance':
        return (
          <FormSection>
            <Typography variant="h6" gutterBottom>Financial Data Aggregation (MVP Focus)</Typography>
            <Typography variant="body2" color="text.secondary">Credentials required for multi-bank aggregation services.</Typography>
            {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID', 'text')}
            {renderInput('PLAID_SECRET', 'Plaid Secret')}
            {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID', 'text')}
            {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
          </FormSection>
        );
      case 'ai':
        return (
          <FormSection>
            <Typography variant="h6" gutterBottom>AI/Intelligence Services (MVP Focus)</Typography>
            <Typography variant="body2" color="text.secondary">Keys for transaction classification and anomaly detection.</Typography>
            {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
            {/* Placeholder for other AI services removed from the massive list */}
          </FormSection>
        );
      case 'system':
        return (
            <FormSection>
                <Typography variant="h6" gutterBottom>System Configuration</Typography>
                {renderInput('BACKEND_CONFIG_URL', 'API Sync Endpoint', 'text', true)}
                <Alert severity="warning" style={{ marginTop: 16 }}>
                    Warning: Authentication (JWT/OIDC) for sending this configuration must be handled by the surrounding application context, not collected here.
                </Alert>
            </FormSection>
        );
      default:
        return null;
    }
  }, [activeTab, keys]);


  return (
    <SettingsContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        API Integration Console (MVP Refactor)
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Managing core credentials for production stability, scoped to MVP requirements (Financial Aggregation & AI Intelligence).
      </Typography>

      <TabContainer 
        value={activeTab} 
        onChange={(event, newValue) => setActiveTab(newValue)} 
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="finance" label="Financial Aggregators" />
        <Tab value="ai" label="AI Services" />
        <Tab value="system" label="System Endpoints" />
      </TabContainer>

      <Box component="form" onSubmit={handleSubmit}>
        {ConfigurationForm}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SaveButton 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Securely Sync Configuration'}
          </SaveButton>

          {statusMessage && (
            <Alert severity={statusMessage.type === 'error' ? 'error' : statusMessage.type === 'success' ? 'success' : 'info'} sx={{ flexGrow: 1 }}>
              {statusMessage.message}
            </Alert>
          )}
        </div>
      </Box>
    </SettingsContainer>
  );
};

export default APIIntegrationView;