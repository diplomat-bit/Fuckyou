import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Paper,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Delete as DeleteIcon, 
  Key as KeyIcon, 
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// --- API Configuration Types and Mocks ---

const ALL_API_IDS = ['AD89', 'AD91', 'QUANTUM_CORE'] as const;
type ApiId = typeof ALL_API_IDS[number];

interface ApiConfig {
  id: ApiId;
  apiKey?: string;
  rateLimitPerMinute: number;
  isEnabled: boolean;
  isKeyless?: boolean;
}

const initialConfigs: Record<ApiId, ApiConfig> = {
  AD89: {
    id: 'AD89',
    apiKey: '****************************************', // Masked for display
    rateLimitPerMinute: 60,
    isEnabled: true,
  },
  AD91: {
    id: 'AD91',
    apiKey: '****************************************', // Masked for display
    rateLimitPerMinute: 120,
    isEnabled: false,
  },
  QUANTUM_CORE: {
    id: 'QUANTUM_CORE',
    rateLimitPerMinute: 500, // High rate limit for a "bad ass" API
    isEnabled: true,
    isKeyless: true, // Keyless API as per instruction
  },
};

const fetchApiConfigs = async (): Promise<Record<ApiId, ApiConfig>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return initialConfigs;
};

const saveApiConfig = async (config: ApiConfig): Promise<boolean> => {
  console.log(`Saving configuration for ${config.id}:`, {
    apiKey: config.isKeyless ? 'N/A' : (config.apiKey?.length || 0) > 10 ? '***MASKED***' : config.apiKey,
    rateLimitPerMinute: config.rateLimitPerMinute,
    isEnabled: config.isEnabled,
  });
  // Simulate network delay and success
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

// --- Component Definition ---

interface ApiSettingsProps {}

const APISettings: React.FC<ApiSettingsProps> = () => {
  const [configs, setConfigs] = useState<Record<ApiId, ApiConfig>>(initialConfigs);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ message: string; severity: 'success' | 'error' | null }>({ message: null, severity: null });
  const [showKeys, setShowKeys] = useState<Record<ApiId, boolean>>({ AD89: false, AD91: false, QUANTUM_CORE: false });

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const loadedConfigs = await fetchApiConfigs();
      setConfigs(loadedConfigs);
    } catch (error) {
      console.error("Failed to load API configurations:", error);
      setSaveStatus({ message: 'Error loading configurations.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleInputChange = (id: ApiId, field: keyof Omit<ApiConfig, 'id'>, value: string | number | boolean) => {
    setConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    // Clear status message on change
    if (saveStatus.message) {
        setSaveStatus({ message: null, severity: null });
    }
  };

  const handleSave = async (id: ApiId) => {
    const configToSave = configs[id];
    setSaveStatus({ message: `Saving ${id}...`, severity: null });

    try {
      const success = await saveApiConfig(configToSave);
      if (success) {
        setSaveStatus({ message: `${id} settings saved successfully!`, severity: 'success' });
      } else {
        setSaveStatus({ message: `Failed to save ${id} settings.`, severity: 'error' });
      }
    } catch (error) {
      console.error(`Error saving ${id}:`, error);
      setSaveStatus({ message: `An unexpected error occurred while saving ${id}.`, severity: 'error' });
    }
    // Clear status after a delay
    setTimeout(() => setSaveStatus({ message: null, severity: null }), 5000);
  };

  const toggleShowKey = (id: ApiId) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderApiCard = (id: ApiId) => {
    const config = configs[id];
    const isKeyVisible = showKeys[id];
    const isKeyless = config.isKeyless;
    const title = id === 'QUANTUM_CORE' ? 'Quantum Core 3.0 (Keyless)' : `${id} API Configuration`;


    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Tooltip title={config.isEnabled ? "API is Active" : "API is Disabled"}>
            <IconButton color={config.isEnabled ? 'primary' : 'default'}>
              {config.isEnabled ? <SpeedIcon /> : <SpeedIcon color="disabled" />}
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {/* API Key Field (Conditional) */}
          {!isKeyless && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={`${id} API Key`}
                type={isKeyVisible ? 'text' : 'password'}
                value={config.apiKey || ''}
                onChange={(e) => handleInputChange(id, 'apiKey', e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <KeyIcon color="action" sx={{ mr: 1 }} />
                  ),
                  endAdornment: (
                    <Tooltip title={isKeyVisible ? "Hide Key" : "Show Key"}>
                      <IconButton onClick={() => toggleShowKey(id)} edge="end" size="small">
                        {isKeyVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Grid>
          )}
          
          {/* Keyless Info (If applicable) */}
          {isKeyless && (
            <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 1 }}>
                    This API uses token-based authentication and does not require a static API Key.
                </Alert>
            </Grid>
          )}

          {/* Rate Limit Field */}
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Rate Limit (Requests/Minute)"
              type="number"
              value={config.rateLimitPerMinute}
              onChange={(e) => handleInputChange(id, 'rateLimitPerMinute', parseInt(e.target.value) || 0)}
              variant="outlined"
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* Enable Switch */}
          <Grid item xs={12} sm={4} display="flex" alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.isEnabled}
                  onChange={(e) => handleInputChange(id, 'isEnabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enabled"
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(id)}
            disabled={loading}
          >
            Save {id} Settings
          </Button>
          <Typography variant="caption" color="textSecondary">
            Last Updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        External API Management (AD89, AD91, & Quantum Core)
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Manage API keys, enable/disable connections, and configure rate limits for integrated services, including the powerful, keyless Quantum Core 3.0.
      </Typography>

      {saveStatus.message && (
        <Alert
          severity={saveStatus.severity || 'info'}
          sx={{ mb: 3 }}
          onClose={() => setSaveStatus({ message: null, severity: null })}
        >
          {saveStatus.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Typography>Loading configurations...</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            {renderApiCard('AD89')}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderApiCard('AD91')}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderApiCard('QUANTUM_CORE')}
          </Grid>
        </Grid>
      )}

      <Box mt={5} p={2} borderTop={1} borderColor="divider">
        <Typography variant="subtitle2" color="textSecondary">
          Note: API keys are stored securely and masked in the UI after initial load. The Quantum Core API uses advanced tokenization and requires no static key.
        </Typography>
      </Box>
    </Box>
  );
};

export default APISettings;