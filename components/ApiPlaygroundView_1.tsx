import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Divider,
  TextField,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Importing the OpenAPI specification type and the new API client
import { OpenAPISpec } from '../types/openapi';
import apiClient from '../api/client';

interface EndpointItemProps {
  path: string;
  method: string;
  details: any;
}

const EndpointItem: React.FC<EndpointItemProps> = ({ path, method, details }) => {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<{ status: number; data: any; headers: any } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const methodColor = 
    method === 'get' ? 'info' : 
    method === 'post' ? 'success' : 
    method === 'put' ? 'warning' : 
    method === 'delete' ? 'error' : 'default';

  const handleParamChange = (name: string, value: string) => {
    setParamValues(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecuteError(null);
    setResponse(null);

    try {
      let url = path;
      const queryParams: Record<string, string> = {};
      const headers: Record<string, string> = {};

      if (details.parameters) {
        details.parameters.forEach((param: any) => {
          const val = paramValues[param.name];
          if (val !== undefined && val !== '') {
            if (param.in === 'path') {
              url = url.replace(`{${param.name}}`, encodeURIComponent(val));
            } else if (param.in === 'query') {
              queryParams[param.name] = val;
            } else if (param.in === 'header') {
              headers[param.name] = val;
            }
          }
        });
      }

      const res = await apiClient.request({
        method: method as any,
        url: url,
        params: queryParams,
        headers: headers,
      });

      setResponse({
        status: res.status,
        data: res.data,
        headers: res.headers,
      });
    } catch (err: any) {
      if (err.response) {
        setResponse({
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      } else {
        setExecuteError(err.message || 'An error occurred while executing the request.');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Accordion variant="outlined" sx={{ mb: 1, borderLeft: 4, borderColor: `${methodColor}.main` }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={2} width="100%">
          <Chip 
            label={method.toUpperCase()} 
            color={methodColor as any}
            size="small"
            sx={{ fontWeight: 'bold', minWidth: 80, borderRadius: 1 }}
          />
          <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {path}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {details.summary}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', pt: 3 }}>
        <Typography variant="body1" paragraph>
          {details.description || details.summary || 'No description available.'}
        </Typography>
        
        {details.tags && details.tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {details.tags.map((tag: string) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        {details.parameters && details.parameters.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Parameters
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {details.parameters.map((param: any, idx: number) => (
                <Box key={param.name} sx={{ mb: idx !== details.parameters.length - 1 ? 2 : 0 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {param.name} <Typography component="span" variant="caption" color="error">{param.required ? '*' : ''}</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    in: {param.in}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={param.description || param.name}
                    required={param.required}
                    value={paramValues[param.name] || ''}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                  />
                  {idx !== details.parameters.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Paper>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleExecute} 
            disabled={isExecuting}
            startIcon={isExecuting ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          >
            {isExecuting ? 'Executing...' : 'Try it out'}
          </Button>
        </Box>

        {executeError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {executeError}
          </Alert>
        )}

        {response && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Response
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" fontWeight="bold">Status:</Typography>
                <Chip 
                  label={response.status} 
                  size="small" 
                  color={response.status >= 200 && response.status < 300 ? 'success' : response.status >= 400 ? 'error' : 'default'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Typography variant="body2" fontWeight="bold" gutterBottom>Headers:</Typography>
              <Paper variant="outlined" sx={{ p: 1, mb: 2, bgcolor: '#f5f5f5', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.8125rem' }}>
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </Paper>

              <Typography variant="body2" fontWeight="bold" gutterBottom>Body:</Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.8125rem' }}>
                  {typeof response.data === 'object' && response.data !== null 
                    ? JSON.stringify(response.data, null, 2) 
                    : response.data !== undefined 
                      ? String(response.data) 
                      : ''}
                </pre>
              </Paper>
            </Paper>
          </Box>
        )}

        {details.responses && (
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Expected Responses
            </Typography>
            <Stack spacing={1}>
              {Object.entries(details.responses).map(([statusCode, resp]: [string, any]) => (
                <Paper key={statusCode} variant="outlined" sx={{ p: 1.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Chip 
                    label={statusCode} 
                    size="small" 
                    color={statusCode.startsWith('2') ? 'success' : statusCode.startsWith('4') || statusCode.startsWith('5') ? 'error' : 'default'}
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {resp.description}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const ApiPlaygroundView: React.FC = () => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Dynamic fetcher using the new API client
        const response = await apiClient.get<OpenAPISpec>('/api/docs/spec.json');
        setSpec(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load OpenAPI specification. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpec();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!spec) {
    return (
      <Box p={3}>
        <Alert severity="info">No API specification data available.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {spec.info?.title || 'API Playground'}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Version: ${spec.info?.version || '1.0.0'}`} color="primary" variant="outlined" />
          {spec.openapi && (
            <Chip label={`OAS ${spec.openapi}`} color="secondary" variant="outlined" />
          )}
        </Stack>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
          {spec.info?.description || 'Explore and test the API endpoints.'}
        </Typography>

        {spec.servers && spec.servers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Available Servers
            </Typography>
            <Stack direction="row" spacing={1}>
              {spec.servers.map((server, index) => (
                <Chip key={index} label={server.url} size="small" sx={{ fontFamily: 'monospace' }} />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Endpoints
      </Typography>

      {spec.paths && Object.entries(spec.paths).map(([path, methods]) => (
        <Box key={path} sx={{ mb: 3 }}>
          {Object.entries(methods).map(([method, details]: [string, any]) => (
            <EndpointItem key={`${path}-${method}`} path={path} method={method} details={details} />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ApiPlaygroundView;