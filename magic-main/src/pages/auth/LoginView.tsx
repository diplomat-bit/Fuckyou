import React, { useState, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  Link,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, Lock, Mail, Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { datadogLogs } from '@datadog/browser-logs';

// --- Styled Components ---

const RootPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 4, 6, 4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 420,
  backgroundColor: 'rgba(17, 24, 39, 0.9)', // bg-gray-900/90
  border: '1px solid #1f2937', // border-gray-800
  borderRadius: '16px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 60px rgba(6, 182, 212, 0.15)', // Custom glow effect
  animation: 'fadeIn 0.8s ease-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
  background: 'linear-gradient(90deg, #06B6D4, #A855F7)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(3),
}));

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 0),
  background: 'linear-gradient(45deg, #06B6D4 30%, #A855F7 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #0891B2 30%, #9333EA 90%)',
  },
  fontWeight: 'bold',
}));

// --- Component ---

export const LoginView: React.FC = () => {
  const { login, isAuthenticated, error: authError, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle AuthContext errors
  React.useEffect(() => {
    if (authError) {
      setLocalError(authError);
      datadogLogs.logger.error('Login Error', { error: authError });
    }
  }, [authError]);

  const handleClickShowPassword = useCallback(() => {
    setShowPassword((show) => !show);
  }, []);

  const handleMouseDownPassword = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length >= 8;
  }, [email, password]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!isFormValid) {
      setLocalError('Please enter a valid email and a password of at least 8 characters.');
      return;
    }

    try {
      await login(email, password);
      // If login succeeds, the useEffect above will handle navigation
    } catch (e) {
      // Error handling is primarily done via useEffect watching authError,
      // but we catch sync errors here if any.
      console.error("Login submission failed:", e);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  }, [email, password, login, isFormValid]);

  if (isLoading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', color: '#06B6D4' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2, fontFamily: 'monospace' }}>
            Authenticating Nexus Credentials...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <RootPaper elevation={3}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Lock sx={{ fontSize: 40, color: '#06B6D4', mb: 1 }} />
          <GradientTypography variant="h5" component="h1" gutterBottom>
            Sovereign Login
          </GradientTypography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Access the Financial Operating System.
          </Typography>

          {localError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2, bgcolor: 'rgba(220, 38, 38, 0.2)', color: '#F87171', border: '1px solid #DC2626' }}>
              {localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail sx={{ color: '#06B6D4' }} />
                  </InputAdornment>
                ),
                style: { color: 'white' }
              }}
              InputLabelProps={{ style: { color: '#9CA3AF' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#374151' },
                  '&:hover fieldset': { borderColor: '#06B6D4' },
                  '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Shield sx={{ color: '#A855F7' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: '#9CA3AF' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: { color: 'white' }
              }}
              InputLabelProps={{ style: { color: '#9CA3AF' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#374151' },
                  '&:hover fieldset': { borderColor: '#06B6D4' },
                  '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                },
              }}
            />
            <CustomButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid || isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                <>
                  <Lock sx={{ mr: 1 }} />
                  SIGN IN
                </>
              )}
            </CustomButton>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="#" variant="body2" color="inherit" sx={{ color: '#06B6D4', mr: 2 }}>
                Forgot password?
              </Link>
              <Link href="#" variant="body2" color="inherit" sx={{ color: '#A855F7' }}>
                Register (SSO Required)
              </Link>
            </Box>
          </Box>
        </Box>
      </RootPaper>
    </Container>
  );
};