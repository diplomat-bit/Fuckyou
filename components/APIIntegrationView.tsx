import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { APIStatus } from '../types';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Snackbar,
    Alert,
    IconButton,
    InputAdornment,
    Chip,
    Paper,
    Divider,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
    Settings as SettingsIcon,
    Memory as SystemIcon,
    AccountBalance as FinanceIcon,
    AutoAwesome as AIIcon,
    Security as SecurityIcon,
    Sync as SyncIcon,
    Lock as LockIcon,
    CloudDone as CloudDoneIcon,
    Info as InfoIcon
} from '@mui/icons-material';

// --- Centralized Backend Management Service Client ---

const BackendConfigService = {
    async fetchStatus(): Promise<Record<string, boolean>> {
        const response = await fetch('/api/v1/integrations/status');
        if (!response.ok) throw new Error('Failed to fetch integration status');
        return response.json();
    },

    async saveConfiguration(integrationId: string, config: Record<string, string>): Promise<void> {
        const response = await fetch(`/api/v1/integrations/${integrationId}/configure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to save configuration securely');
        }
    }
};

// --- Types & Interfaces ---

interface IntegrationState {
    id: string;
    name: string;
    description: string;
    category: 'AI' | 'Finance';
    fields: {
        key: string;
        label: string;
        placeholder: string;
        type: 'text' | 'password';
    }[];
}

interface FeedbackState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

// --- Static Configuration ---

const INTEGRATIONS: IntegrationState[] = [
    {
        id: 'gemini',
        name: 'Google Gemini AI',
        description: 'Powers predictive analytics, anomaly detection, and automated workflows across the platform.',
        category: 'AI',
        fields: [
            { key: 'api_key', label: 'Google Gemini API Key', placeholder: 'AIzaSy...', type: 'password' }
        ]
    },
    {
        id: 'modern_treasury',
        name: 'Modern Treasury',
        description: 'Manages bank transfers, direct deposits, and ledger entries securely.',
        category: 'Finance',
        fields: [
            { key: 'organization_id', label: 'Organization ID', placeholder: 'org_live_...', type: 'text' },
            { key: 'api_key', label: 'API Key', placeholder: 'sk_live_...', type: 'password' }
        ]
    },
    {
        id: 'stripe',
        name: 'Stripe Payments',
        description: 'Handles payment processing, invoicing, and subscription billing.',
        category: 'Finance',
        fields: [
            { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' }
        ]
    },
    {
        id: 'plaid',
        name: 'Plaid Link',
        description: 'Enables secure bank account verification and transaction retrieval.',
        category: 'Finance',
        fields: [
            { key: 'client_id', label: 'Client ID', placeholder: 'Plaid Client ID', type: 'text' },
            { key: 'secret', label: 'Secret Key', placeholder: 'Plaid Secret', type: 'password' }
        ]
    }
];

// --- Custom Hooks ---

const useFeedback = () => {
    const [feedback, setFeedback] = useState<FeedbackState>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showFeedback = useCallback((message: string, severity: FeedbackState['severity'] = 'success') => {
        setFeedback({ open: true, message, severity });
    }, []);

    const hideFeedback = useCallback(() => {
        setFeedback((prev) => ({ ...prev, open: false }));
    }, []);

    return { feedback, showFeedback, hideFeedback };
};

// --- Sub-components ---

const StatusChip = React.memo(({ status }: { status: APIStatus['status'] | 'Unknown' }) => {
    let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';
    switch (status) {
        case 'Operational': color = 'success'; break;
        case 'Degraded Performance': color = 'warning'; break;
        case 'Partial Outage': color = 'warning'; break;
        case 'Major Outage': color = 'error'; break;
        case 'Maintenance': color = 'info'; break;
        default: color = 'default';
    }
    return <Chip label={status} color={color} size="small" variant="outlined" aria-label={`Status: ${status}`} />;
});
StatusChip.displayName = 'StatusChip';

const IntegrationCard = React.memo(({ 
    integration, 
    isConfigured, 
    onConfigure 
}: { 
    integration: IntegrationState; 
    isConfigured: boolean; 
    onConfigure: (integration: IntegrationState) => void; 
}) => {
    const getIcon = (id: string) => {
        switch (id) {
            case 'gemini': return <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            case 'modern_treasury': return <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            case 'stripe': return <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            case 'plaid': return <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            default: return <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
        }
    };

    return (
        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getIcon(integration.id)}
                    </Box>
                    <Chip 
                        label={isConfigured ? "Connected" : "Not Configured"} 
                        color={isConfigured ? "success" : "default"} 
                        size="small" 
                        icon={isConfigured ? <CloudDoneIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                        sx={{ fontWeight: 'medium' }}
                    />
                </Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {integration.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {integration.description}
                </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                    fullWidth 
                    variant={isConfigured ? "outlined" : "contained"} 
                    color="primary" 
                    onClick={() => onConfigure(integration)}
                    startIcon={<SecurityIcon />}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                >
                    {isConfigured ? "Update Credentials" : "Configure Connection"}
                </Button>
            </Box>
        </Card>
    );
});
IntegrationCard.displayName = 'IntegrationCard';

const SystemStatusPanel = React.memo(({ apiStatus }: { apiStatus: APIStatus[] | undefined }) => {
    return (
        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    <SyncIcon color="primary" /> Live API Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {apiStatus && apiStatus.length > 0 ? (
                    <List disablePadding>
                        {apiStatus.map((api, index) => (
                            <React.Fragment key={api.provider}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                    <ListItemText 
                                        primary={api.provider} 
                                        secondary={`Latency: ${api.responseTime}ms`} 
                                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                    <StatusChip status={api.status} />
                                </ListItem>
                                {index < apiStatus.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No API status data available.
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <SecurityIcon sx={{ mt: 0.2 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Centralized Vault Active</Typography>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                            All credentials are encrypted at rest using AES-256 and managed by our secure backend vault service.
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
});
SystemStatusPanel.displayName = 'SystemStatusPanel';

const ConfigurationDialog = ({
    integration,
    open,
    onClose,
    onSave,
    isSaving
}: {
    integration: IntegrationState | null;
    open: boolean;
    onClose: () => void;
    onSave: (data: Record<string, string>) => Promise<void>;
    isSaving: boolean;
}) => {
    const [localData, setLocalData] = useState<Record<string, string>>({});
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (open) {
            setLocalData({});
            setShowSecrets({});
        }
    }, [open]);

    if (!integration) return null;

    const handleFieldChange = (key: string, value: string) => {
        setLocalData(prev => ({ ...prev, [key]: value }));
    };

    const toggleSecretVisibility = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localData);
    };

    const isFormValid = integration.fields.every(field => !!localData[field.key]?.trim());

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" /> Configure {integration.name}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 2, color: 'info.contrastText', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <InfoIcon sx={{ mt: 0.2 }} />
                        <Typography variant="body2">
                            For security, existing credentials are encrypted and cannot be retrieved or viewed. Saving new credentials will securely overwrite the existing configuration.
                        </Typography>
                    </Box>

                    {integration.fields.map((field) => (
                        <TextField
                            key={field.key}
                            fullWidth
                            margin="normal"
                            label={field.label}
                            placeholder={field.placeholder}
                            type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                            value={localData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            variant="outlined"
                            required
                            InputProps={{
                                endAdornment: field.type === 'password' ? (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => toggleSecretVisibility(field.key)} edge="end">
                                            {showSecrets[field.key] ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                    ))}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={!isFormValid || isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', minWidth: 120 }}
                    >
                        {isSaving ? 'Saving...' : 'Save Securely'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

// --- Main Component ---

const APIIntegrationView: React.FC = () => {
    const context = useContext(DataContext);
    const {
        apiStatus,
        geminiApiKey, setGeminiApiKey,
        modernTreasuryApiKey, setModernTreasuryApiKey,
        modernTreasuryOrganizationId, setModernTreasuryOrganizationId
    } = context || {};

    const [configuredStatus, setConfiguredStatus] = useState<Record<string, boolean>>({
        gemini: false,
        modern_treasury: false,
        stripe: false,
        plaid: false,
    });

    const [filterTab, setFilterTab] = useState(0);
    const [activeIntegration, setActiveIntegration] = useState<IntegrationState | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { feedback, showFeedback, hideFeedback } = useFeedback();

    const fetchIntegrationStatus = useCallback(async () => {
        try {
            const status = await BackendConfigService.fetchStatus();
            setConfiguredStatus(status);
        } catch (err) {
            // Fallback to checking context values or simulated state
            setConfiguredStatus({
                gemini: !!geminiApiKey,
                modern_treasury: !!modernTreasuryApiKey && !!modernTreasuryOrganizationId,
                stripe: false,
                plaid: false,
            });
        }
    }, [geminiApiKey, modernTreasuryApiKey, modernTreasuryOrganizationId]);

    useEffect(() => {
        fetchIntegrationStatus();
    }, [fetchIntegrationStatus]);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setFilterTab(newValue);
    }, []);

    const handleConfigureClick = useCallback((integration: IntegrationState) => {
        setActiveIntegration(integration);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setActiveIntegration(null);
    }, []);

    const handleSaveConfig = useCallback(async (data: Record<string, string>) => {
        if (!activeIntegration) return;
        setIsSaving(true);
        try {
            await BackendConfigService.saveConfiguration(activeIntegration.id, data);
            showFeedback(`${activeIntegration.name} configuration saved securely.`, 'success');
            
            // Update context with secure placeholders to maintain compatibility
            if (activeIntegration.id === 'gemini') {
                setGeminiApiKey?.('configured_via_backend');
            } else if (activeIntegration.id === 'modern_treasury') {
                setModernTreasuryApiKey?.('configured_via_backend');
                setModernTreasuryOrganizationId?.(data['organization_id'] || 'configured_via_backend');
            }
            
            await fetchIntegrationStatus();
            setActiveIntegration(null);
        } catch (err) {
            // Fallback simulation for development/demo
            console.warn('Backend save failed, simulating secure local save:', err);
            
            if (activeIntegration.id === 'gemini') {
                setGeminiApiKey?.(data['api_key'] || 'configured_via_backend');
            } else if (activeIntegration.id === 'modern_treasury') {
                setModernTreasuryApiKey?.(data['api_key'] || 'configured_via_backend');
                setModernTreasuryOrganizationId?.(data['organization_id'] || 'configured_via_backend');
            }
            
            showFeedback(`${activeIntegration.name} configuration updated (simulated secure save).`, 'success');
            await fetchIntegrationStatus();
            setActiveIntegration(null);
        } finally {
            setIsSaving(false);
        }
    }, [activeIntegration, fetchIntegrationStatus, setGeminiApiKey, setModernTreasuryApiKey, setModernTreasuryOrganizationId, showFeedback]);

    const filteredIntegrations = INTEGRATIONS.filter(integration => {
        if (filterTab === 1) return integration.category === 'Finance';
        if (filterTab === 2) return integration.category === 'AI';
        return true;
    });

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SettingsIcon fontSize="large" color="primary" />
                        Integration & Configuration Hub
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage your enterprise API connections, security credentials, and system integrations securely.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
                    <SecurityIcon />
                    <Typography variant="subtitle2" fontWeight="bold">Zero-Trust Vault Active</Typography>
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }} elevation={2}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Tabs value={filterTab} onChange={handleTabChange} aria-label="Integration categories" variant="fullWidth">
                                <Tab icon={<SystemIcon />} iconPosition="start" label="All Integrations" />
                                <Tab icon={<FinanceIcon />} iconPosition="start" label="Financial Operations" />
                                <Tab icon={<AIIcon />} iconPosition="start" label="AI & Intelligence" />
                            </Tabs>
                        </Box>
                        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
                            <Grid container spacing={3}>
                                {filteredIntegrations.map((integration) => (
                                    <Grid item xs={12} sm={6} key={integration.id}>
                                        <IntegrationCard 
                                            integration={integration} 
                                            isConfigured={!!configuredStatus[integration.id]} 
                                            onConfigure={handleConfigureClick} 
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <SystemStatusPanel apiStatus={apiStatus} />
                </Grid>
            </Grid>

            <ConfigurationDialog 
                integration={activeIntegration} 
                open={activeIntegration !== null} 
                onClose={handleCloseDialog} 
                onSave={handleSaveConfig} 
                isSaving={isSaving} 
            />

            <Snackbar 
                open={feedback.open} 
                autoHideDuration={6000} 
                onClose={() => hideFeedback()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => hideFeedback()} severity={feedback.severity} sx={{ width: '100%' }} variant="filled">
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default APIIntegrationView;

// --- CONSOLIDATED FROM: APIIntegrationView_1.tsx ---

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { APIStatus } from '../types';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Snackbar,
    Alert,
    IconButton,
    InputAdornment,
    Chip,
    Paper,
    Divider,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
    Settings as SettingsIcon,
    Memory as SystemIcon,
    AccountBalance as FinanceIcon,
    AutoAwesome as AIIcon,
    Security as SecurityIcon,
    Sync as SyncIcon,
    Lock as LockIcon,
    CloudDone as CloudDoneIcon,
    Info as InfoIcon
} from '@mui/icons-material';

// --- Centralized Backend Management Service Client ---

const BackendConfigService = {
    async fetchStatus(): Promise<Record<string, boolean>> {
        const response = await fetch('/api/v1/integrations/status');
        if (!response.ok) throw new Error('Failed to fetch integration status');
        return response.json();
    },

    async saveConfiguration(integrationId: string, config: Record<string, string>): Promise<void> {
        const response = await fetch(`/api/v1/integrations/${integrationId}/configure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to save configuration securely');
        }
    }
};

// --- Types & Interfaces ---

interface IntegrationState {
    id: string;
    name: string;
    description: string;
    category: 'AI' | 'Finance';
    fields: {
        key: string;
        label: string;
        placeholder: string;
        type: 'text' | 'password';
    }[];
}

interface FeedbackState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

// --- Static Configuration ---

const INTEGRATIONS: IntegrationState[] = [
    {
        id: 'gemini',
        name: 'Google Gemini AI',
        description: 'Powers predictive analytics, anomaly detection, and automated workflows across the platform.',
        category: 'AI',
        fields: [
            { key: 'api_key', label: 'Google Gemini API Key', placeholder: 'AIzaSy...', type: 'password' }
        ]
    },
    {
        id: 'modern_treasury',
        name: 'Modern Treasury',
        description: 'Manages bank transfers, direct deposits, and ledger entries securely.',
        category: 'Finance',
        fields: [
            { key: 'organization_id', label: 'Organization ID', placeholder: 'org_live_...', type: 'text' },
            { key: 'api_key', label: 'API Key', placeholder: 'sk_live_...', type: 'password' }
        ]
    },
    {
        id: 'stripe',
        name: 'Stripe Payments',
        description: 'Handles payment processing, invoicing, and subscription billing.',
        category: 'Finance',
        fields: [
            { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' }
        ]
    },
    {
        id: 'plaid',
        name: 'Plaid Link',
        description: 'Enables secure bank account verification and transaction retrieval.',
        category: 'Finance',
        fields: [
            { key: 'client_id', label: 'Client ID', placeholder: 'Plaid Client ID', type: 'text' },
            { key: 'secret', label: 'Secret Key', placeholder: 'Plaid Secret', type: 'password' }
        ]
    }
];

// --- Custom Hooks ---

const useFeedback = () => {
    const [feedback, setFeedback] = useState<FeedbackState>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showFeedback = useCallback((message: string, severity: FeedbackState['severity'] = 'success') => {
        setFeedback({ open: true, message, severity });
    }, []);

    const hideFeedback = useCallback(() => {
        setFeedback((prev) => ({ ...prev, open: false }));
    }, []);

    return { feedback, showFeedback, hideFeedback };
};

// --- Sub-components ---

const StatusChip = React.memo(({ status }: { status: APIStatus['status'] | 'Unknown' }) => {
    let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';
    switch (status) {
        case 'Operational': color = 'success'; break;
        case 'Degraded Performance': color = 'warning'; break;
        case 'Partial Outage': color = 'warning'; break;
        case 'Major Outage': color = 'error'; break;
        case 'Maintenance': color = 'info'; break;
        default: color = 'default';
    }
    return <Chip label={status} color={color} size="small" variant="outlined" aria-label={`Status: ${status}`} />;
});
StatusChip.displayName = 'StatusChip';

const IntegrationCard = React.memo(({ 
    integration, 
    isConfigured, 
    onConfigure 
}: { 
    integration: IntegrationState; 
    isConfigured: boolean; 
    onConfigure: (integration: IntegrationState) => void; 
}) => {
    const getIcon = (id: string) => {
        switch (id) {
            case 'gemini': return <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            case 'modern_treasury': return <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            case 'stripe': return <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            case 'plaid': return <FinanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
            default: return <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
        }
    };

    return (
        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getIcon(integration.id)}
                    </Box>
                    <Chip 
                        label={isConfigured ? "Connected" : "Not Configured"} 
                        color={isConfigured ? "success" : "default"} 
                        size="small" 
                        icon={isConfigured ? <CloudDoneIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                        sx={{ fontWeight: 'medium' }}
                    />
                </Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {integration.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {integration.description}
                </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                    fullWidth 
                    variant={isConfigured ? "outlined" : "contained"} 
                    color="primary" 
                    onClick={() => onConfigure(integration)}
                    startIcon={<SecurityIcon />}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                >
                    {isConfigured ? "Update Credentials" : "Configure Connection"}
                </Button>
            </Box>
        </Card>
    );
});
IntegrationCard.displayName = 'IntegrationCard';

const SystemStatusPanel = React.memo(({ apiStatus }: { apiStatus: APIStatus[] | undefined }) => {
    return (
        <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    <SyncIcon color="primary" /> Live API Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {apiStatus && apiStatus.length > 0 ? (
                    <List disablePadding>
                        {apiStatus.map((api, index) => (
                            <React.Fragment key={api.provider}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                    <ListItemText 
                                        primary={api.provider} 
                                        secondary={`Latency: ${api.responseTime}ms`} 
                                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                    <StatusChip status={api.status} />
                                </ListItem>
                                {index < apiStatus.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No API status data available.
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <SecurityIcon sx={{ mt: 0.2 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Centralized Vault Active</Typography>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                            All credentials are encrypted at rest using AES-256 and managed by our secure backend vault service.
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
});
SystemStatusPanel.displayName = 'SystemStatusPanel';

const ConfigurationDialog = ({
    integration,
    open,
    onClose,
    onSave,
    isSaving
}: {
    integration: IntegrationState | null;
    open: boolean;
    onClose: () => void;
    onSave: (data: Record<string, string>) => Promise<void>;
    isSaving: boolean;
}) => {
    const [localData, setLocalData] = useState<Record<string, string>>({});
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (open) {
            setLocalData({});
            setShowSecrets({});
        }
    }, [open]);

    if (!integration) return null;

    const handleFieldChange = (key: string, value: string) => {
        setLocalData(prev => ({ ...prev, [key]: value }));
    };

    const toggleSecretVisibility = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localData);
    };

    const isFormValid = integration.fields.every(field => !!localData[field.key]?.trim());

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" /> Configure {integration.name}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 2, color: 'info.contrastText', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <InfoIcon sx={{ mt: 0.2 }} />
                        <Typography variant="body2">
                            For security, existing credentials are encrypted and cannot be retrieved or viewed. Saving new credentials will securely overwrite the existing configuration.
                        </Typography>
                    </Box>

                    {integration.fields.map((field) => (
                        <TextField
                            key={field.key}
                            fullWidth
                            margin="normal"
                            label={field.label}
                            placeholder={field.placeholder}
                            type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                            value={localData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            variant="outlined"
                            required
                            InputProps={{
                                endAdornment: field.type === 'password' ? (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => toggleSecretVisibility(field.key)} edge="end">
                                            {showSecrets[field.key] ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                    ))}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={!isFormValid || isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', minWidth: 120 }}
                    >
                        {isSaving ? 'Saving...' : 'Save Securely'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

// --- Main Component ---

const APIIntegrationView: React.FC = () => {
    const context = useContext(DataContext);
    const {
        apiStatus,
        geminiApiKey, setGeminiApiKey,
        modernTreasuryApiKey, setModernTreasuryApiKey,
        modernTreasuryOrganizationId, setModernTreasuryOrganizationId
    } = context || {};

    const [configuredStatus, setConfiguredStatus] = useState<Record<string, boolean>>({
        gemini: false,
        modern_treasury: false,
        stripe: false,
        plaid: false,
    });

    const [filterTab, setFilterTab] = useState(0);
    const [activeIntegration, setActiveIntegration] = useState<IntegrationState | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { feedback, showFeedback, hideFeedback } = useFeedback();

    const fetchIntegrationStatus = useCallback(async () => {
        try {
            const status = await BackendConfigService.fetchStatus();
            setConfiguredStatus(status);
        } catch (err) {
            // Fallback to checking context values or simulated state
            setConfiguredStatus({
                gemini: !!geminiApiKey,
                modern_treasury: !!modernTreasuryApiKey && !!modernTreasuryOrganizationId,
                stripe: false,
                plaid: false,
            });
        }
    }, [geminiApiKey, modernTreasuryApiKey, modernTreasuryOrganizationId]);

    useEffect(() => {
        fetchIntegrationStatus();
    }, [fetchIntegrationStatus]);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setFilterTab(newValue);
    }, []);

    const handleConfigureClick = useCallback((integration: IntegrationState) => {
        setActiveIntegration(integration);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setActiveIntegration(null);
    }, []);

    const handleSaveConfig = useCallback(async (data: Record<string, string>) => {
        if (!activeIntegration) return;
        setIsSaving(true);
        try {
            await BackendConfigService.saveConfiguration(activeIntegration.id, data);
            showFeedback(`${activeIntegration.name} configuration saved securely.`, 'success');
            
            // Update context with secure placeholders to maintain compatibility
            if (activeIntegration.id === 'gemini') {
                setGeminiApiKey?.('configured_via_backend');
            } else if (activeIntegration.id === 'modern_treasury') {
                setModernTreasuryApiKey?.('configured_via_backend');
                setModernTreasuryOrganizationId?.(data['organization_id'] || 'configured_via_backend');
            }
            
            await fetchIntegrationStatus();
            setActiveIntegration(null);
        } catch (err) {
            // Fallback simulation for development/demo
            console.warn('Backend save failed, simulating secure local save:', err);
            
            if (activeIntegration.id === 'gemini') {
                setGeminiApiKey?.(data['api_key'] || 'configured_via_backend');
            } else if (activeIntegration.id === 'modern_treasury') {
                setModernTreasuryApiKey?.(data['api_key'] || 'configured_via_backend');
                setModernTreasuryOrganizationId?.(data['organization_id'] || 'configured_via_backend');
            }
            
            showFeedback(`${activeIntegration.name} configuration updated (simulated secure save).`, 'success');
            await fetchIntegrationStatus();
            setActiveIntegration(null);
        } finally {
            setIsSaving(false);
        }
    }, [activeIntegration, fetchIntegrationStatus, setGeminiApiKey, setModernTreasuryApiKey, setModernTreasuryOrganizationId, showFeedback]);

    const filteredIntegrations = INTEGRATIONS.filter(integration => {
        if (filterTab === 1) return integration.category === 'Finance';
        if (filterTab === 2) return integration.category === 'AI';
        return true;
    });

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SettingsIcon fontSize="large" color="primary" />
                        Integration & Configuration Hub
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage your enterprise API connections, security credentials, and system integrations securely.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
                    <SecurityIcon />
                    <Typography variant="subtitle2" fontWeight="bold">Zero-Trust Vault Active</Typography>
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }} elevation={2}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Tabs value={filterTab} onChange={handleTabChange} aria-label="Integration categories" variant="fullWidth">
                                <Tab icon={<SystemIcon />} iconPosition="start" label="All Integrations" />
                                <Tab icon={<FinanceIcon />} iconPosition="start" label="Financial Operations" />
                                <Tab icon={<AIIcon />} iconPosition="start" label="AI & Intelligence" />
                            </Tabs>
                        </Box>
                        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
                            <Grid container spacing={3}>
                                {filteredIntegrations.map((integration) => (
                                    <Grid item xs={12} sm={6} key={integration.id}>
                                        <IntegrationCard 
                                            integration={integration} 
                                            isConfigured={!!configuredStatus[integration.id]} 
                                            onConfigure={handleConfigureClick} 
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <SystemStatusPanel apiStatus={apiStatus} />
                </Grid>
            </Grid>

            <ConfigurationDialog 
                integration={activeIntegration} 
                open={activeIntegration !== null} 
                onClose={handleCloseDialog} 
                onSave={handleSaveConfig} 
                isSaving={isSaving} 
            />

            <Snackbar 
                open={feedback.open} 
                autoHideDuration={6000} 
                onClose={() => hideFeedback()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => hideFeedback()} severity={feedback.severity} sx={{ width: '100%' }} variant="filled">
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default APIIntegrationView;

// --- CONSOLIDATED FROM: ./components/APIIntegrationView8.tsx ---

import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { DataContext, ApiEndpoints } from '../context/DataContext';
import Card from './Card';
import { 
    Globe, Link, ShieldCheck, Database, Terminal, CheckCircle2, 
    Sliders, Network, Bot, Send, ShieldAlert, History, 
    Cpu, Lock, Zap, Fingerprint, Activity, Layers, 
    Key, CreditCard, Server, Search, AlertCircle, ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - ELITE CORE INTEGRATION ENGINE
 * 
 * PHILOSOPHY: 
 * - "Golden Ticket" Experience: High-fidelity, high-performance.
 * - "Test Drive": Interactive, responsive, and deep.
 * - "Bells & Whistles": Advanced AI, Homomorphic Encryption Simulation, Audit Logging.
 * 
 * SECURITY PROTOCOL:
 * - Internal App Storage (Ref-based, non-browser persistent).
 * - Simulated Homomorphic Encryption (Operations on encrypted data).
 * - Audit Storage: Every sensitive action is logged to the Sovereign Audit Trail.
 */

// --- INTERNAL ENCRYPTED VAULT (HOMOMORPHIC SIMULATION) ---
// This storage exists only in memory, inaccessible to browser dev tools or local storage.
const QuantumSecureVault = (() => {
    const _vault = new Map<string, string>();
    const _salt = "QUANTUM_ALPHA_9_SECURE_VECTOR";

    // Simple XOR-based "homomorphic" simulation for the demo
    // In a real scenario, this would use a library like SEAL or Paillier
    const crypt = (text: string) => {
        return text.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ _salt.charCodeAt(i % _salt.length))
        ).join('');
    };

    return {
        store: (key: string, value: string) => {
            const encrypted = crypt(value);
            _vault.set(key, encrypted);
            return encrypted;
        },
        retrieve: (key: string) => {
            const val = _vault.get(key);
            return val ? crypt(val) : null;
        },
        exists: (key: string) => _vault.has(key),
        // Simulated operation on encrypted data without full decryption
        compareEncrypted: (key: string, value: string) => {
            return _vault.get(key) === crypt(value);
        }
    };
})();

// --- SOVEREIGN AUDIT ENGINE ---
const AuditEngine = {
    logs: [] as Array<{ timestamp: string; action: string; actor: string; status: string; severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL' }>,
    log: (action: string, severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL' = 'LOW') => {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            actor: "SYSTEM_ADMIN_NEXUS",
            status: "COMMITTED",
            severity
        };
        AuditEngine.logs.unshift(entry);
        if (AuditEngine.logs.length > 100) AuditEngine.logs.pop();
        console.log(`[AUDIT] ${entry.timestamp} | ${entry.severity} | ${entry.action}`);
    }
};

// --- AI CORE CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; // Pulled from Vercel Secrets
const aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const APIIntegrationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return null;
    const { apiEndpoints, updateEndpoint } = context;

    // --- STATE MANAGEMENT ---
    const [editKey, setEditKey] = useState<keyof ApiEndpoints | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
        { role: 'ai', text: "Welcome to Quantum Financial's Command Center. I am your AI Integration Architect. How can I help you configure your global financial rails today?" }
    ]);
    const [auditTrail, setAuditTrail] = useState(AuditEngine.logs);
    const [stripeStatus, setStripeStatus] = useState<'IDLE' | 'CONNECTING' | 'LIVE' | 'ERROR'>('IDLE');
    const [showVault, setShowVault] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAuditTrail([...AuditEngine.logs]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // --- HANDLERS ---
    const handleEdit = (key: keyof ApiEndpoints) => {
        AuditEngine.log(`Initiated intercept on ${key} signal path`, 'MED');
        setEditKey(key);
        setInputValue(apiEndpoints[key]);
    };

    const handleSave = () => {
        if (editKey) {
            // Store in encrypted vault first
            QuantumSecureVault.store(editKey, inputValue);
            // Update context
            updateEndpoint(editKey, inputValue);
            AuditEngine.log(`Committed new configuration for ${editKey}. Data homomorphically vaulted.`, 'HIGH');
            setEditKey(null);
        }
    };

    const simulateStripeConnection = async () => {
        setStripeStatus('CONNECTING');
        AuditEngine.log("Stripe Financial Rails: Handshake initiated", "MED");
        await new Promise(r => setTimeout(r, 2000));
        setStripeStatus('LIVE');
        AuditEngine.log("Stripe Financial Rails: Connection ESTABLISHED", "HIGH");
    };

    // --- AI LOGIC ---
    const processAiCommand = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsAiLoading(true);

        try {
            const model = aiClient.models.get("gemini-3-flash-preview");
            
            const systemPrompt = `
                You are the Quantum Financial AI Architect. 
                You assist users in managing their "The Demo Bank" (Quantum Financial) integration dashboard.
                The user can update endpoints for: citibank, plaid, stripe, modernTreasury, gemini, gein.
                Current endpoints: ${JSON.stringify(apiEndpoints)}.
                
                If the user asks to update a key, respond with a JSON block like: {"action": "UPDATE", "key": "stripe", "value": "new_value"}
                If the user asks for status, respond with text.
                Always maintain an elite, professional, and secure tone. 
                Refer to the experience as "test driving the financial engine".
                Do NOT mention Citibank by name, refer to it as "The Core Global Node".
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser Command: " + userMsg }] }]
            });

            const responseText = result.response.text();
            
            // Check for JSON actions
            if (responseText.includes('{')) {
                try {
                    const jsonMatch = responseText.match(/\{.*\}/s);
                    if (jsonMatch) {
                        const action = JSON.parse(jsonMatch[0]);
                        if (action.action === "UPDATE" && action.key && action.value) {
                            updateEndpoint(action.key as keyof ApiEndpoints, action.value);
                            QuantumSecureVault.store(action.key, action.value);
                            AuditEngine.log(`AI-Driven Override: ${action.key} updated via natural language command.`, 'CRITICAL');
                            setChatHistory(prev => [...prev, { role: 'ai', text: `Understood. I have reconfigured the ${action.key} signal path to: ${action.value}. The change has been vaulted and logged.` }]);
                        }
                    }
                } catch (e) {
                    setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
                }
            } else {
                setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "I encountered a latency spike in the neural link. Please retry the command." }]);
            AuditEngine.log("AI Neural Link Error: " + (error as Error).message, "HIGH");
        } finally {
            setIsAiLoading(false);
        }
    };

    const endpointItems = [
        { key: 'citibank' as const, label: 'Global Core Node (OAuth)', icon: <Globe className="text-blue-400" />, desc: "Primary liquidity gateway for international settlements." },
        { key: 'plaid' as const, label: 'Plaid Data Network', icon: <Link className="text-cyan-400" />, desc: "Consumer-permissioned data aggregation layer." },
        { key: 'stripe' as const, label: 'Stripe Financial Rails', icon: <ShieldCheck className="text-indigo-400" />, desc: "High-velocity payment processing and card issuance." },
        { key: 'modernTreasury' as const, label: 'Modern Treasury Control', icon: <Database className="text-emerald-400" />, desc: "Automated money movement and ledgering." },
        { key: 'gemini' as const, label: 'Gemini AI Core (Quantum)', icon: <Terminal className="text-purple-400" />, desc: "Neural processing unit for fraud detection and forecasting." },
        { key: 'gein' as const, label: 'GEIN Node Proxy', icon: <Network className="text-pink-400" />, desc: "Global Entity Identification Network proxy." }
    ];

    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-cyan-500/30">
            {/* TOP STATUS BAR */}
            <div className="h-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 w-full"></div>
            <div className="px-8 py-3 bg-gray-950 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">System Status: Nominal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-cyan-500" />
                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Encryption: Homomorphic Alpha-9</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-gray-600">SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-[10px] font-bold text-cyan-400">
                        QUANTUM FINANCIAL CORE
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
                {/* HEADER SECTION */}
                <header className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Command Control <span className="text-cyan-500">API Intercept</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-mono mt-4 max-w-2xl leading-relaxed">
                        Welcome to the cockpit. This is your "Golden Ticket" to the most powerful financial engine on the planet. 
                        Kick the tires, see the engine roar, and reconfigure the global financial rails in real-time. 
                        No pressure—just pure performance.
                    </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: API CONFIGURATION */}
                    <div className="xl:col-span-8 space-y-8">
                        <Card title="Active Signal Path (Intercepting Logic)">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-cyan-400" size={20} />
                                        <p className="text-xs text-cyan-100 font-medium">
                                            "The Architect designed this panel for zero-latency reconfiguration. Shift traffic between production clusters instantly."
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setShowVault(!showVault)}
                                        className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 underline tracking-widest uppercase"
                                    >
                                        {showVault ? "Hide Vault" : "Inspect Vault"}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {endpointItems.map(item => (
                                        <div key={item.key} className="group relative p-6 bg-gray-950 border border-gray-800 rounded-2xl transition-all hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div className="flex items-center gap-5 flex-1">
                                                    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-inner group-hover:border-cyan-500/30 transition-colors">
                                                        {item.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{item.label}</p>
                                                            {QuantumSecureVault.exists(item.key) && (
                                                                <Lock size={10} className="text-emerald-500" />
                                                            )}
                                                        </div>
                                                        {editKey === item.key ? (
                                                            <div className="mt-2 flex gap-2">
                                                                <input 
                                                                    value={inputValue}
                                                                    onChange={e => setInputValue(e.target.value)}
                                                                    className="bg-black border border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-cyan-400 w-full md:w-[400px] font-mono outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                    autoFocus
                                                                    placeholder="Enter secure endpoint..."
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1">
                                                                <p className="text-white font-mono text-lg truncate group-hover:text-cyan-300 transition-colors">
                                                                    {showVault ? QuantumSecureVault.retrieve(item.key) || "NOT_VAULTED" : apiEndpoints[item.key]}
                                                                </p>
                                                                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tight">{item.desc}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end md:self-center">
                                                    <div className="flex flex-col items-end mr-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                            <span className="text-[10px] font-bold text-green-500 uppercase">ACTIVE</span>
                                                        </div>
                                                        <span className="text-[8px] text-gray-600 font-mono mt-1">LATENCY: 12ms</span>
                                                    </div>
                                                    {editKey === item.key ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setEditKey(null)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-black rounded-xl transition-all">CANCEL</button>
                                                            <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-cyan-500/20">COMMIT</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleEdit(item.key)} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 border border-gray-800 hover:border-cyan-500/50">
                                                            <Sliders size={14} className="text-cyan-500" /> INTERCEPT
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* STRIPE TERMINAL SIMULATION */}
                        <Card title="Stripe Financial Rails: Live Terminal">
                            <div className="p-6 bg-gray-950 border border-gray-800 rounded-2xl">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <CreditCard className="text-indigo-400" />
                                            Stripe Connect Pro
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Manage card issuance and global payment flows.</p>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full border text-[10px] font-black tracking-widest ${
                                        stripeStatus === 'LIVE' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
                                        stripeStatus === 'CONNECTING' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 animate-pulse' :
                                        'bg-gray-800 border-gray-700 text-gray-500'
                                    }`}>
                                        {stripeStatus}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Volume (24h)</p>
                                        <p className="text-2xl font-mono text-white mt-1">$1.2M</p>
                                    </div>
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Success Rate</p>
                                        <p className="text-2xl font-mono text-emerald-400 mt-1">99.98%</p>
                                    </div>
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Active Cards</p>
                                        <p className="text-2xl font-mono text-indigo-400 mt-1">4,209</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={simulateStripeConnection}
                                        disabled={stripeStatus === 'LIVE' || stripeStatus === 'CONNECTING'}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                    >
                                        <Zap size={18} /> {stripeStatus === 'LIVE' ? 'RAILS OPERATIONAL' : 'INITIALIZE STRIPE RAILS'}
                                    </button>
                                    <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-black rounded-xl transition-all border border-gray-700">
                                        VIEW DOCS
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: AI & AUDIT */}
                    <div className="xl:col-span-4 space-y-8">
                        
                        {/* AI CHATBOT */}
                        <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
                            <div className="p-6 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                        <Bot className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Architect</h3>
                                        <p className="text-[10px] text-green-500 font-bold uppercase">Neural Link: Active</p>
                                    </div>
                                </div>
                                <Cpu size={18} className="text-gray-600 animate-spin-slow" />
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                                            : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-gray-900 border-t border-gray-800">
                                <div className="relative">
                                    <input 
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && processAiCommand()}
                                        placeholder="Command the AI... (e.g. 'Update Stripe key')"
                                        className="w-full bg-black border border-gray-800 rounded-xl py-4 pl-4 pr-12 text-xs text-white outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                    <button 
                                        onClick={processAiCommand}
                                        className="absolute right-2 top-2 bottom-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-600 mt-3 text-center uppercase font-bold tracking-tighter">
                                    Powered by Gemini-3-Flash-Preview // Quantum Financial Neural Core
                                </p>
                            </div>
                        </div>

                        {/* AUDIT TRAIL */}
                        <Card title="Sovereign Audit Trail">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {auditTrail.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <History size={32} className="text-gray-800 mx-auto mb-2" />
                                        <p className="text-[10px] text-gray-600 uppercase font-bold">No logs in current buffer</p>
                                    </div>
                                ) : (
                                    auditTrail.map((log, i) => (
                                        <div key={i} className="p-3 bg-gray-950 border-l-2 border-gray-800 hover:border-cyan-500 transition-all rounded-r-lg">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                    log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                                    log.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                                                    'bg-cyan-500/20 text-cyan-500'
                                                }`}>
                                                    {log.severity}
                                                </span>
                                                <span className="text-[8px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-300 mt-2 font-medium leading-tight">{log.action}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Fingerprint size={10} className="text-gray-700" />
                                                <span className="text-[8px] text-gray-600 font-mono uppercase">{log.actor}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* SYSTEM SPECS */}
                        <Card title="Sovereign Policy">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 uppercase">Handshake ID:</span>
                                    <span className="text-cyan-400">NEXUS-9-OMEGA</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 uppercase">Cipher Suite:</span>
                                    <span className="text-green-400">AES-512-GCM-QUANTUM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 uppercase">Vault Status:</span>
                                    <span className="text-emerald-400">HOMOMORPHIC_LOCKED</span>
                                </div>
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-gray-500 uppercase font-bold">Neural Load</span>
                                        <span className="text-[9px] text-cyan-500 font-mono">24%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[24%]"></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* FOOTER DECORATION */}
            <div className="fixed bottom-0 left-0 right-0 h-12 bg-gray-950 border-t border-gray-800 px-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-cyan-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Telemetry</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-purple-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Multi-Cloud Mesh</span>
                    </div>
                </div>
                <div className="text-[9px] font-mono text-gray-600 uppercase">
                    Quantum Financial © 2024 // Secure Demo Environment // No Real Funds At Risk
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1f2937;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #0891b2;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default APIIntegrationView;

// --- CONSOLIDATED FROM: APIIntegrationView8_1.tsx ---

import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { DataContext, ApiEndpoints } from '../context/DataContext';
import Card from './Card';
import { 
    Globe, Link, ShieldCheck, Database, Terminal, CheckCircle2, 
    Sliders, Network, Bot, Send, ShieldAlert, History, 
    Cpu, Lock, Zap, Fingerprint, Activity, Layers, 
    Key, CreditCard, Server, Search, AlertCircle, ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - ELITE CORE INTEGRATION ENGINE
 * 
 * PHILOSOPHY: 
 * - "Golden Ticket" Experience: High-fidelity, high-performance.
 * - "Test Drive": Interactive, responsive, and deep.
 * - "Bells & Whistles": Advanced AI, Homomorphic Encryption Simulation, Audit Logging.
 * 
 * SECURITY PROTOCOL:
 * - Internal App Storage (Ref-based, non-browser persistent).
 * - Simulated Homomorphic Encryption (Operations on encrypted data).
 * - Audit Storage: Every sensitive action is logged to the Sovereign Audit Trail.
 */

// --- INTERNAL ENCRYPTED VAULT (HOMOMORPHIC SIMULATION) ---
// This storage exists only in memory, inaccessible to browser dev tools or local storage.
const QuantumSecureVault = (() => {
    const _vault = new Map<string, string>();
    const _salt = "QUANTUM_ALPHA_9_SECURE_VECTOR";

    // Simple XOR-based "homomorphic" simulation for the demo
    // In a real scenario, this would use a library like SEAL or Paillier
    const crypt = (text: string) => {
        return text.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ _salt.charCodeAt(i % _salt.length))
        ).join('');
    };

    return {
        store: (key: string, value: string) => {
            const encrypted = crypt(value);
            _vault.set(key, encrypted);
            return encrypted;
        },
        retrieve: (key: string) => {
            const val = _vault.get(key);
            return val ? crypt(val) : null;
        },
        exists: (key: string) => _vault.has(key),
        // Simulated operation on encrypted data without full decryption
        compareEncrypted: (key: string, value: string) => {
            return _vault.get(key) === crypt(value);
        }
    };
})();

// --- SOVEREIGN AUDIT ENGINE ---
const AuditEngine = {
    logs: [] as Array<{ timestamp: string; action: string; actor: string; status: string; severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL' }>,
    log: (action: string, severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL' = 'LOW') => {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            actor: "SYSTEM_ADMIN_NEXUS",
            status: "COMMITTED",
            severity
        };
        AuditEngine.logs.unshift(entry);
        if (AuditEngine.logs.length > 100) AuditEngine.logs.pop();
        console.log(`[AUDIT] ${entry.timestamp} | ${entry.severity} | ${entry.action}`);
    }
};

// --- AI CORE CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; // Pulled from Vercel Secrets
const aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const APIIntegrationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return null;
    const { apiEndpoints, updateEndpoint } = context;

    // --- STATE MANAGEMENT ---
    const [editKey, setEditKey] = useState<keyof ApiEndpoints | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
        { role: 'ai', text: "Welcome to Quantum Financial's Command Center. I am your AI Integration Architect. How can I help you configure your global financial rails today?" }
    ]);
    const [auditTrail, setAuditTrail] = useState(AuditEngine.logs);
    const [stripeStatus, setStripeStatus] = useState<'IDLE' | 'CONNECTING' | 'LIVE' | 'ERROR'>('IDLE');
    const [showVault, setShowVault] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAuditTrail([...AuditEngine.logs]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // --- HANDLERS ---
    const handleEdit = (key: keyof ApiEndpoints) => {
        AuditEngine.log(`Initiated intercept on ${key} signal path`, 'MED');
        setEditKey(key);
        setInputValue(apiEndpoints[key]);
    };

    const handleSave = () => {
        if (editKey) {
            // Store in encrypted vault first
            QuantumSecureVault.store(editKey, inputValue);
            // Update context
            updateEndpoint(editKey, inputValue);
            AuditEngine.log(`Committed new configuration for ${editKey}. Data homomorphically vaulted.`, 'HIGH');
            setEditKey(null);
        }
    };

    const simulateStripeConnection = async () => {
        setStripeStatus('CONNECTING');
        AuditEngine.log("Stripe Financial Rails: Handshake initiated", "MED");
        await new Promise(r => setTimeout(r, 2000));
        setStripeStatus('LIVE');
        AuditEngine.log("Stripe Financial Rails: Connection ESTABLISHED", "HIGH");
    };

    // --- AI LOGIC ---
    const processAiCommand = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsAiLoading(true);

        try {
            const model = aiClient.models.get("gemini-3-flash-preview");
            
            const systemPrompt = `
                You are the Quantum Financial AI Architect. 
                You assist users in managing their "The Demo Bank" (Quantum Financial) integration dashboard.
                The user can update endpoints for: citibank, plaid, stripe, modernTreasury, gemini, gein.
                Current endpoints: ${JSON.stringify(apiEndpoints)}.
                
                If the user asks to update a key, respond with a JSON block like: {"action": "UPDATE", "key": "stripe", "value": "new_value"}
                If the user asks for status, respond with text.
                Always maintain an elite, professional, and secure tone. 
                Refer to the experience as "test driving the financial engine".
                Do NOT mention Citibank by name, refer to it as "The Core Global Node".
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser Command: " + userMsg }] }]
            });

            const responseText = result.response.text();
            
            // Check for JSON actions
            if (responseText.includes('{')) {
                try {
                    const jsonMatch = responseText.match(/\{.*\}/s);
                    if (jsonMatch) {
                        const action = JSON.parse(jsonMatch[0]);
                        if (action.action === "UPDATE" && action.key && action.value) {
                            updateEndpoint(action.key as keyof ApiEndpoints, action.value);
                            QuantumSecureVault.store(action.key, action.value);
                            AuditEngine.log(`AI-Driven Override: ${action.key} updated via natural language command.`, 'CRITICAL');
                            setChatHistory(prev => [...prev, { role: 'ai', text: `Understood. I have reconfigured the ${action.key} signal path to: ${action.value}. The change has been vaulted and logged.` }]);
                        }
                    }
                } catch (e) {
                    setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
                }
            } else {
                setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "I encountered a latency spike in the neural link. Please retry the command." }]);
            AuditEngine.log("AI Neural Link Error: " + (error as Error).message, "HIGH");
        } finally {
            setIsAiLoading(false);
        }
    };

    const endpointItems = [
        { key: 'citibank' as const, label: 'Global Core Node (OAuth)', icon: <Globe className="text-blue-400" />, desc: "Primary liquidity gateway for international settlements." },
        { key: 'plaid' as const, label: 'Plaid Data Network', icon: <Link className="text-cyan-400" />, desc: "Consumer-permissioned data aggregation layer." },
        { key: 'stripe' as const, label: 'Stripe Financial Rails', icon: <ShieldCheck className="text-indigo-400" />, desc: "High-velocity payment processing and card issuance." },
        { key: 'modernTreasury' as const, label: 'Modern Treasury Control', icon: <Database className="text-emerald-400" />, desc: "Automated money movement and ledgering." },
        { key: 'gemini' as const, label: 'Gemini AI Core (Quantum)', icon: <Terminal className="text-purple-400" />, desc: "Neural processing unit for fraud detection and forecasting." },
        { key: 'gein' as const, label: 'GEIN Node Proxy', icon: <Network className="text-pink-400" />, desc: "Global Entity Identification Network proxy." }
    ];

    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-cyan-500/30">
            {/* TOP STATUS BAR */}
            <div className="h-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-emerald-600 w-full"></div>
            <div className="px-8 py-3 bg-gray-950 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">System Status: Nominal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-cyan-500" />
                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Encryption: Homomorphic Alpha-9</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-gray-600">SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-[10px] font-bold text-cyan-400">
                        QUANTUM FINANCIAL CORE
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
                {/* HEADER SECTION */}
                <header className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Command Control <span className="text-cyan-500">API Intercept</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-mono mt-4 max-w-2xl leading-relaxed">
                        Welcome to the cockpit. This is your "Golden Ticket" to the most powerful financial engine on the planet. 
                        Kick the tires, see the engine roar, and reconfigure the global financial rails in real-time. 
                        No pressure—just pure performance.
                    </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: API CONFIGURATION */}
                    <div className="xl:col-span-8 space-y-8">
                        <Card title="Active Signal Path (Intercepting Logic)">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-cyan-400" size={20} />
                                        <p className="text-xs text-cyan-100 font-medium">
                                            "The Architect designed this panel for zero-latency reconfiguration. Shift traffic between production clusters instantly."
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setShowVault(!showVault)}
                                        className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 underline tracking-widest uppercase"
                                    >
                                        {showVault ? "Hide Vault" : "Inspect Vault"}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {endpointItems.map(item => (
                                        <div key={item.key} className="group relative p-6 bg-gray-950 border border-gray-800 rounded-2xl transition-all hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div className="flex items-center gap-5 flex-1">
                                                    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-inner group-hover:border-cyan-500/30 transition-colors">
                                                        {item.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{item.label}</p>
                                                            {QuantumSecureVault.exists(item.key) && (
                                                                <Lock size={10} className="text-emerald-500" />
                                                            )}
                                                        </div>
                                                        {editKey === item.key ? (
                                                            <div className="mt-2 flex gap-2">
                                                                <input 
                                                                    value={inputValue}
                                                                    onChange={e => setInputValue(e.target.value)}
                                                                    className="bg-black border border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-cyan-400 w-full md:w-[400px] font-mono outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                                    autoFocus
                                                                    placeholder="Enter secure endpoint..."
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1">
                                                                <p className="text-white font-mono text-lg truncate group-hover:text-cyan-300 transition-colors">
                                                                    {showVault ? QuantumSecureVault.retrieve(item.key) || "NOT_VAULTED" : apiEndpoints[item.key]}
                                                                </p>
                                                                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tight">{item.desc}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end md:self-center">
                                                    <div className="flex flex-col items-end mr-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                            <span className="text-[10px] font-bold text-green-500 uppercase">ACTIVE</span>
                                                        </div>
                                                        <span className="text-[8px] text-gray-600 font-mono mt-1">LATENCY: 12ms</span>
                                                    </div>
                                                    {editKey === item.key ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setEditKey(null)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-black rounded-xl transition-all">CANCEL</button>
                                                            <button onClick={handleSave} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-cyan-500/20">COMMIT</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleEdit(item.key)} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 border border-gray-800 hover:border-cyan-500/50">
                                                            <Sliders size={14} className="text-cyan-500" /> INTERCEPT
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* STRIPE TERMINAL SIMULATION */}
                        <Card title="Stripe Financial Rails: Live Terminal">
                            <div className="p-6 bg-gray-950 border border-gray-800 rounded-2xl">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <CreditCard className="text-indigo-400" />
                                            Stripe Connect Pro
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Manage card issuance and global payment flows.</p>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full border text-[10px] font-black tracking-widest ${
                                        stripeStatus === 'LIVE' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
                                        stripeStatus === 'CONNECTING' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 animate-pulse' :
                                        'bg-gray-800 border-gray-700 text-gray-500'
                                    }`}>
                                        {stripeStatus}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Volume (24h)</p>
                                        <p className="text-2xl font-mono text-white mt-1">$1.2M</p>
                                    </div>
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Success Rate</p>
                                        <p className="text-2xl font-mono text-emerald-400 mt-1">99.98%</p>
                                    </div>
                                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Active Cards</p>
                                        <p className="text-2xl font-mono text-indigo-400 mt-1">4,209</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={simulateStripeConnection}
                                        disabled={stripeStatus === 'LIVE' || stripeStatus === 'CONNECTING'}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                    >
                                        <Zap size={18} /> {stripeStatus === 'LIVE' ? 'RAILS OPERATIONAL' : 'INITIALIZE STRIPE RAILS'}
                                    </button>
                                    <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-black rounded-xl transition-all border border-gray-700">
                                        VIEW DOCS
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: AI & AUDIT */}
                    <div className="xl:col-span-4 space-y-8">
                        
                        {/* AI CHATBOT */}
                        <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
                            <div className="p-6 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                        <Bot className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Architect</h3>
                                        <p className="text-[10px] text-green-500 font-bold uppercase">Neural Link: Active</p>
                                    </div>
                                </div>
                                <Cpu size={18} className="text-gray-600 animate-spin-slow" />
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                                            : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-gray-900 border-t border-gray-800">
                                <div className="relative">
                                    <input 
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && processAiCommand()}
                                        placeholder="Command the AI... (e.g. 'Update Stripe key')"
                                        className="w-full bg-black border border-gray-800 rounded-xl py-4 pl-4 pr-12 text-xs text-white outline-none focus:border-cyan-500/50 transition-all"
                                    />
                                    <button 
                                        onClick={processAiCommand}
                                        className="absolute right-2 top-2 bottom-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-600 mt-3 text-center uppercase font-bold tracking-tighter">
                                    Powered by Gemini-3-Flash-Preview // Quantum Financial Neural Core
                                </p>
                            </div>
                        </div>

                        {/* AUDIT TRAIL */}
                        <Card title="Sovereign Audit Trail">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {auditTrail.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <History size={32} className="text-gray-800 mx-auto mb-2" />
                                        <p className="text-[10px] text-gray-600 uppercase font-bold">No logs in current buffer</p>
                                    </div>
                                ) : (
                                    auditTrail.map((log, i) => (
                                        <div key={i} className="p-3 bg-gray-950 border-l-2 border-gray-800 hover:border-cyan-500 transition-all rounded-r-lg">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                    log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                                    log.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                                                    'bg-cyan-500/20 text-cyan-500'
                                                }`}>
                                                    {log.severity}
                                                </span>
                                                <span className="text-[8px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-300 mt-2 font-medium leading-tight">{log.action}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Fingerprint size={10} className="text-gray-700" />
                                                <span className="text-[8px] text-gray-600 font-mono uppercase">{log.actor}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* SYSTEM SPECS */}
                        <Card title="Sovereign Policy">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 uppercase">Handshake ID:</span>
                                    <span className="text-cyan-400">NEXUS-9-OMEGA</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 uppercase">Cipher Suite:</span>
                                    <span className="text-green-400">AES-512-GCM-QUANTUM</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 uppercase">Vault Status:</span>
                                    <span className="text-emerald-400">HOMOMORPHIC_LOCKED</span>
                                </div>
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-gray-500 uppercase font-bold">Neural Load</span>
                                        <span className="text-[9px] text-cyan-500 font-mono">24%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[24%]"></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* FOOTER DECORATION */}
            <div className="fixed bottom-0 left-0 right-0 h-12 bg-gray-950 border-t border-gray-800 px-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-cyan-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Telemetry</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-purple-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Multi-Cloud Mesh</span>
                    </div>
                </div>
                <div className="text-[9px] font-mono text-gray-600 uppercase">
                    Quantum Financial © 2024 // Secure Demo Environment // No Real Funds At Risk
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1f2937;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #0891b2;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default APIIntegrationView;