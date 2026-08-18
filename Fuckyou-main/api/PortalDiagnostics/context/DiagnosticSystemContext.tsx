import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// ==========================================
// Type Definitions
// ==========================================

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';

export interface ServiceHealth {
  id: string;
  name: string;
  category: 'banking' | 'brokerage' | 'compliance' | 'cloud' | 'identity';
  status: HealthStatus;
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  errorRate: number; // percentage
  version: string;
}

export interface DiagnosticAlert {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  code: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestRate: number; // req/sec
}

export interface DiagnosticState {
  overallStatus: HealthStatus;
  services: Record<string, ServiceHealth>;
  alerts: DiagnosticAlert[];
  metrics: SystemMetrics;
  isScanning: boolean;
  lastScanTime: string | null;
  apiConnected: boolean;
}

// ==========================================
// Initial State (Reflecting Project Tree)
// ==========================================

const INITIAL_SERVICES: Record<string, ServiceHealth> = {
  'citi-sovereign-ledger': {
    id: 'citi-sovereign-ledger',
    name: 'Citi Sovereign Ledger Bridge',
    category: 'banking',
    status: 'healthy',
    latencyMs: 42,
    uptimePercent: 99.98,
    lastChecked: new Date().toISOString(),
    errorRate: 0.01,
    version: '1.4.2'
  },
  'alpaca-broker-bridge': {
    id: 'alpaca-broker-bridge',
    name: 'Alpaca Brokerage Bridge',
    category: 'brokerage',
    status: 'healthy',
    latencyMs: 85,
    uptimePercent: 99.95,
    lastChecked: new Date().toISOString(),
    errorRate: 0.05,
    version: '2.1.0'
  },
  'modern-treasury-settlement': {
    id: 'modern-treasury-settlement',
    name: 'Modern Treasury Settlement Hub',
    category: 'banking',
    status: 'healthy',
    latencyMs: 120,
    uptimePercent: 99.99,
    lastChecked: new Date().toISOString(),
    errorRate: 0.0,
    version: '1.0.8'
  },
  'azure-ad-auditor': {
    id: 'azure-ad-auditor',
    name: 'Azure AD App Auditor',
    category: 'identity',
    status: 'healthy',
    latencyMs: 65,
    uptimePercent: 99.91,
    lastChecked: new Date().toISOString(),
    errorRate: 0.12,
    version: '3.0.1'
  },
  'voter-registration-portal': {
    id: 'voter-registration-portal',
    name: 'Voter Registration Portal Gateway',
    category: 'compliance',
    status: 'healthy',
    latencyMs: 95,
    uptimePercent: 99.85,
    lastChecked: new Date().toISOString(),
    errorRate: 0.08,
    version: '1.1.0'
  },
  'pqc-crypto-bridge': {
    id: 'pqc-crypto-bridge',
    name: 'Post-Quantum Cryptography Bridge',
    category: 'compliance',
    status: 'healthy',
    latencyMs: 14,
    uptimePercent: 100.0,
    lastChecked: new Date().toISOString(),
    errorRate: 0.0,
    version: '0.9.5-beta'
  },
  'google-cloud-shim': {
    id: 'google-cloud-shim',
    name: 'Google Cloud Replacement Engine',
    category: 'cloud',
    status: 'healthy',
    latencyMs: 30,
    uptimePercent: 99.99,
    lastChecked: new Date().toISOString(),
    errorRate: 0.02,
    version: '2.0.4'
  }
};

const INITIAL_STATE: DiagnosticState = {
  overallStatus: 'healthy',
  services: INITIAL_SERVICES,
  alerts: [
    {
      id: 'alert-1',
      serviceId: 'azure-ad-auditor',
      serviceName: 'Azure AD App Auditor',
      severity: 'warning',
      message: 'Slight latency spike detected during credential rotation sync.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      acknowledged: false,
      code: 'AUTH_LATENCY_SPIKE'
    }
  ],
  metrics: {
    cpuUsage: 24.5,
    memoryUsage: 48.2,
    activeConnections: 1420,
    requestRate: 345.8
  },
  isScanning: false,
  lastScanTime: new Date().toISOString(),
  apiConnected: false
};

// ==========================================
// Actions & Reducer
// ==========================================

type DiagnosticAction =
  | { type: 'START_SCAN' }
  | { type: 'COMPLETE_SCAN'; payload: { services: Record<string, ServiceHealth>; metrics: SystemMetrics; overallStatus: HealthStatus; apiConnected?: boolean } }
  | { type: 'SET_ALERTS'; payload: DiagnosticAlert[] }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { alertId: string } }
  | { type: 'CLEAR_ACKNOWLEDGED_ALERTS' }
  | { type: 'ADD_ALERT'; payload: DiagnosticAlert }
  | { type: 'UPDATE_SERVICE_STATUS'; payload: { serviceId: string; status: HealthStatus; latencyMs: number; errorRate: number } }
  | { type: 'SET_API_CONNECTED'; payload: boolean };

function diagnosticReducer(state: DiagnosticState, action: DiagnosticAction): DiagnosticState {
  switch (action.type) {
    case 'START_SCAN':
      return {
        ...state,
        isScanning: true
      };
    case 'COMPLETE_SCAN':
      return {
        ...state,
        isScanning: false,
        services: action.payload.services,
        metrics: action.payload.metrics,
        overallStatus: action.payload.overallStatus,
        lastScanTime: new Date().toISOString(),
        apiConnected: action.payload.apiConnected !== undefined ? action.payload.apiConnected : state.apiConnected
      };
    case 'SET_ALERTS':
      return {
        ...state,
        alerts: action.payload
      };
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.alertId ? { ...alert, acknowledged: true } : alert
        )
      };
    case 'CLEAR_ACKNOWLEDGED_ALERTS':
      return {
        ...state,
        alerts: state.alerts.filter((alert) => !alert.acknowledged)
      };
    case 'ADD_ALERT':
      // Prevent duplicate active alerts for the same code
      if (state.alerts.some((a) => a.code === action.payload.code && !a.acknowledged)) {
        return state;
      }
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
        overallStatus: action.payload.severity === 'critical' ? 'critical' : state.overallStatus === 'critical' ? 'critical' : 'degraded'
      };
    case 'UPDATE_SERVICE_STATUS': {
      const updatedServices = { ...state.services };
      if (updatedServices[action.payload.serviceId]) {
        updatedServices[action.payload.serviceId] = {
          ...updatedServices[action.payload.serviceId],
          status: action.payload.status,
          latencyMs: action.payload.latencyMs,
          errorRate: action.payload.errorRate,
          lastChecked: new Date().toISOString()
        };
      }

      // Recalculate overall status based on service statuses
      const statuses = Object.values(updatedServices).map((s) => s.status);
      let overall: HealthStatus = 'healthy';
      if (statuses.includes('critical')) {
        overall = 'critical';
      } else if (statuses.includes('degraded')) {
        overall = 'degraded';
      }

      return {
        ...state,
        services: updatedServices,
        overallStatus: overall
      };
    }
    case 'SET_API_CONNECTED':
      return {
        ...state,
        apiConnected: action.payload
      };
    default:
      return state;
  }
}

// ==========================================
// Context & Provider
// ==========================================

interface DiagnosticContextProps extends DiagnosticState {
  triggerScan: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  clearAcknowledgedAlerts: () => Promise<void>;
  simulateServiceFailure: (serviceId: string, severity: 'warning' | 'critical') => Promise<void>;
  resolveServiceFailure: (serviceId: string) => Promise<void>;
}

const DiagnosticSystemContext = createContext<DiagnosticContextProps | undefined>(undefined);

export const DiagnosticSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(diagnosticReducer, INITIAL_STATE);

  // Helper to fetch from API with fallback to simulation
  const triggerScan = useCallback(async () => {
    dispatch({ type: 'START_SCAN' });

    try {
      // Attempt to fetch from the actual API route
      const response = await fetch('/api/diagnostics/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: 'COMPLETE_SCAN',
          payload: {
            services: data.services || state.services,
            metrics: data.metrics || state.metrics,
            overallStatus: data.overallStatus || 'healthy',
            apiConnected: true
          }
        });
        if (data.alerts) {
          dispatch({ type: 'SET_ALERTS', payload: data.alerts });
        }
        return;
      }
    } catch (error) {
      console.warn('Diagnostics API unavailable, falling back to local simulation engine:', error);
    }

    // Fallback Simulation Engine
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedServices = { ...state.services };
    let hasCritical = false;
    let hasDegraded = false;

    Object.keys(updatedServices).forEach((key) => {
      const service = updatedServices[key];
      const latencyDelta = Math.floor((Math.random() - 0.5) * 10);
      const errorDelta = (Math.random() - 0.5) * 0.02;

      updatedServices[key] = {
        ...service,
        latencyMs: Math.max(5, service.latencyMs + latencyDelta),
        errorRate: Math.max(0, Math.min(100, parseFloat((service.errorRate + errorDelta).toFixed(2)))),
        lastChecked: new Date().toISOString()
      };

      if (service.status === 'critical') hasCritical = true;
      if (service.status === 'degraded') hasDegraded = true;
    });

    const simulatedMetrics: SystemMetrics = {
      cpuUsage: Math.max(5, Math.min(99, parseFloat((state.metrics.cpuUsage + (Math.random() - 0.5) * 4).toFixed(1)))),
      memoryUsage: Math.max(10, Math.min(95, parseFloat((state.metrics.memoryUsage + (Math.random() - 0.5) * 1).toFixed(1)))),
      activeConnections: Math.max(100, state.metrics.activeConnections + Math.floor((Math.random() - 0.5) * 40)),
      requestRate: Math.max(10, parseFloat((state.metrics.requestRate + (Math.random() - 0.5) * 15).toFixed(1)))
    };

    const overallStatus: HealthStatus = hasCritical ? 'critical' : hasDegraded ? 'degraded' : 'healthy';

    dispatch({
      type: 'COMPLETE_SCAN',
      payload: {
        services: updatedServices,
        metrics: simulatedMetrics,
        overallStatus,
        apiConnected: false
      }
    });
  }, [state.services, state.metrics]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: { alertId } });

    try {
      await fetch(`/api/diagnostics/alerts/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
    } catch (error) {
      console.warn('Failed to sync alert acknowledgment with API:', error);
    }
  }, []);

  const clearAcknowledgedAlerts = useCallback(async () => {
    dispatch({ type: 'CLEAR_ACKNOWLEDGED_ALERTS' });

    try {
      await fetch(`/api/diagnostics/alerts/clear-acknowledged`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.warn('Failed to sync cleared alerts with API:', error);
    }
  }, []);

  // Helper to simulate a failure in the dashboard for testing resilience
  const simulateServiceFailure = useCallback(async (serviceId: string, severity: 'warning' | 'critical') => {
    const service = state.services[serviceId];
    if (!service) return;

    const status: HealthStatus = severity === 'critical' ? 'critical' : 'degraded';
    const latencyMs = severity === 'critical' ? 999 : 350;
    const errorRate = severity === 'critical' ? 85.0 : 15.5;

    dispatch({
      type: 'UPDATE_SERVICE_STATUS',
      payload: { serviceId, status, latencyMs, errorRate }
    });

    dispatch({
      type: 'ADD_ALERT',
      payload: {
        id: `alert-${Date.now()}`,
        serviceId,
        serviceName: service.name,
        severity,
        message: `Simulated ${severity} failure triggered on ${service.name}. High error rates detected.`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        code: `SIMULATED_${severity.toUpperCase()}_FAILURE`
      }
    });

    try {
      await fetch(`/api/diagnostics/services/simulate-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, severity })
      });
    } catch (error) {
      console.warn('Failed to sync simulated failure with API:', error);
    }
  }, [state.services]);

  // Helper to resolve simulated failures
  const resolveServiceFailure = useCallback(async (serviceId: string) => {
    const service = state.services[serviceId];
    if (!service) return;

    const defaultService = INITIAL_SERVICES[serviceId];

    dispatch({
      type: 'UPDATE_SERVICE_STATUS',
      payload: {
        serviceId,
        status: 'healthy',
        latencyMs: defaultService ? defaultService.latencyMs : 45,
        errorRate: 0.0
      }
    });

    // Auto-acknowledge alerts related to this service
    state.alerts
      .filter((a) => a.serviceId === serviceId && !a.acknowledged)
      .forEach((a) => acknowledgeAlert(a.id));

    try {
      await fetch(`/api/diagnostics/services/resolve-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId })
      });
    } catch (error) {
      console.warn('Failed to sync resolved failure with API:', error);
    }
  }, [state.services, state.alerts, acknowledgeAlert]);

  // Auto-scan periodically to simulate real-time telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      triggerScan();
    }, 15000); // Scan every 15 seconds

    return () => clearInterval(interval);
  }, [triggerScan]);

  return (
    <DiagnosticSystemContext.Provider
      value={{
        ...state,
        triggerScan,
        acknowledgeAlert,
        clearAcknowledgedAlerts,
        simulateServiceFailure,
        resolveServiceFailure
      }}
    >
      {children}
    </DiagnosticSystemContext.Provider>
  );
};

export const useDiagnosticSystem = () => {
  const context = useContext(DiagnosticSystemContext);
  if (context === undefined) {
    throw new Error('useDiagnosticSystem must be used within a DiagnosticSystemProvider');
  }
  return context;
};