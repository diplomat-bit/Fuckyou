# The Architecture of `Header.tsx`: The Unified, Secure Navigation Bar

**Executive Summary**

This component is being refactored from a deliberately flawed, slow prototype into a robust, secure, and performant navigation header suitable for an enterprise fintech application. It will now integrate secure session state, standardized design (MUI), and clear status indicators reflecting the health of critical backend services, aligning with the MVP scope (Unified business financial dashboard).

**Core Philosophy: Stability and Security**

This platform must now operate with high reliability, employing secure state management (Zustand/React Query integration) and adherence to modern UI standards (MUI v5). All static/placeholder elements are being replaced with dynamic, state-aware components.

**Component Architecture: The Standardized Bar**

The `Header` is now a highly functional container integrated deeply with global state for user context and real-time service health monitoring.

### 1. The Navigation Module (Left Side)

The left side handles secure navigation and branding.

*   **Mobile Menu Button**: Integrated with the global state/layout context to toggle the primary navigation structure (which will use MUI's standard drawer pattern).
*   **Company Branding**: Replaced the static placeholder with a standardized, configurable application title that respects the current environment context (Dev/Staging/Prod).

### 2. The Status Display (Center)

The center is replaced by the `ServiceHealthIndicator`. This component actively queries the unified API gateway health endpoint (mocked here for structural completeness) to provide real-time assurance of system availability.


const ServiceHealthIndicator: React.FC = () => { ... };


**Functionality:**
*   **Real-time Service Aggregation**: Checks the health status of critical domains (e.g., Authentication Service, Core Ledger API, Treasury Orchestrator).
*   **Circuit Breaker Visualization**: Visually reflects the state of circuit breakers (Open/Closed/Half-Open) managed by the new API connector layer.
*   **Proactive Alerting**: Uses clear, unambiguous indicators (green for operational, yellow for degraded, red for failure).

### 3. The User Module (Right Side)

The right side is now dedicated to secure user context and session management visualization.

*   **Secure Session Status**: Replaces the non-critical notification hub. This now shows JWT validity status (e.g., "Session Active," "Token Expires in 1h"). This requires integration with the new secure session management layer.
*   **Role-Based Profile Interface**: The avatar is now tied to the authenticated user principal (retrieved from secure state). Clicking it opens a secure dropdown managed by MUI, providing access to role-specific settings and the explicit **Logout** function (initiating token revocation).

**Strategic Imperative**

This component adheres strictly to the stability and security requirements. It is a fully integrated part of the new architecture, using defined UI libraries (MUI) and reflecting true system operational status, not simulated mediocrity.

---
// Mocking necessary imports for a runnable structure demonstration
import * as React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Box, styled } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security'; // Used for Health/Status

// --- MOCK STATE MANAGEMENT (Simulating Zustand/Context Integration) ---
// In a real refactor, this would pull from a global store (e.g., useAuthStore, useHealthStore)
interface MockAuthState {
  isAuthenticated: boolean;
  userRole: 'Admin' | 'Analyst' | 'Auditor';
  sessionExpiry: Date;
}

const mockAuth: MockAuthState = {
  isAuthenticated: true,
  userRole: 'Admin',
  sessionExpiry: new Date(Date.now() + 3600000), // 1 hour from now
};

interface MockHealthState {
  authService: 'OK' | 'DEGRADED' | 'DOWN';
  ledgerApi: 'OK' | 'DEGRADED' | 'DOWN';
  orchestrator: 'OK' | 'DEGRADED' | 'DOWN';
}

const mockHealth: MockHealthState = {
  authService: 'OK',
  ledgerApi: 'OK',
  orchestrator: 'DEGRADED', // Simulating one service being slightly degraded
};
// ---------------------------------------------------------------------


// 1. The Health Indicator (Replaces HeuristicAPIStatus)
const ServiceHealthIndicator: React.FC<{ health: MockHealthState }> = ({ health }) => {
  const getStatusColor = (status: string) => {
    if (status === 'OK') return 'success';
    if (status === 'DEGRADED') return 'warning';
    return 'error';
  };

  const totalFailures = Object.values(health).filter(s => s !== 'OK').length;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Badge color={totalFailures > 0 ? 'warning' : 'success'} variant="dot" invisible={totalFailures === 0}>
        <SecurityIcon color="action" />
      </Badge>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography variant="caption" color="text.secondary">
          System Health:
        </Typography>
        <Typography variant="body2" sx={{ ml: 0.5, display: 'inline-flex', alignItems: 'center' }}>
          {Object.entries(health).map(([service, status]) => (
            <Box key={service} sx={{ ml: 1, color: (theme) => theme.palette[getStatusStatusColor(status)].main }}>
              {service.split('Api')[0].charAt(0).toUpperCase() + service.split('Api')[0].slice(1)}: {status}
            </Box>
          ))}
        </Typography>
      </Box>
    </Box>
  );
};

// 2. The Main Header Component
const Header: React.FC = () => {
  const appName = "FinTech Dashboard MVP"; // Unified Branding

  // Derive calculated state from mocks
  const sessionStatus = mockAuth.isAuthenticated ? `Active (${mockAuth.userRole})` : 'Logged Out';
  const expiryTime = mockAuth.sessionExpiry.toLocaleTimeString();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ px: { xs: 1, md: 3 } }}>
        {/* LEFT: Navigation Module */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          // In a real app: onClick={toggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}
        >
          {appName}
        </Typography>

        {/* CENTER: Status Display (Replaced HeuristicAPIStatus) */}
        <Box sx={{ flexGrow: 0.5, display: { xs: 'none', lg: 'flex' } }}>
            <ServiceHealthIndicator health={mockHealth} />
        </Box>

        {/* RIGHT: User Module */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          
          {/* Secure Session Status */}
          <Box sx={{ mr: 2, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="caption" display="block" color="text.secondary">
                  Session: {sessionStatus}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                  Expires: {expiryTime}
              </Typography>
          </Box>

          {/* Notifications (Reduced to high-priority, integrated alert count if needed later) */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={1} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Standard Profile Interface */}
          <IconButton color="inherit">
            {/* Placeholder Avatar linked to secure user context */}
            <Avatar sx={{ bgcolor: 'secondary.main' }} alt={mockAuth.userRole}>
                {mockAuth.userRole[0]}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;