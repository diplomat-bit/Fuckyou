

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/types/SystemStatus.ts ---

/**
 * System Status Enums, Interfaces, and Types for Portal Diagnostics
 * Path: api/PortalDiagnostics/types/SystemStatus.ts
 */

import { Router, Request, Response } from 'express';

/**
 * High-level operational status
 */
export enum OperationalStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED_PERFORMANCE = 'DEGRADED_PERFORMANCE',
  PARTIAL_OUTAGE = 'PARTIAL_OUTAGE',
  MAJOR_OUTAGE = 'MAJOR_OUTAGE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Health assessment states
 * FIX: Ensure HealthLevel is an ENUM (value), not just a type, to fix TS2693
 */
export enum HealthState {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL',
  MAINTENANCE = 'MAINTENANCE',
}

export const HealthLevel = HealthState;
export type HealthLevel = HealthState;

export enum IncidentSeverity {
  LOW = 'SEV_4_LOW',
  MEDIUM = 'SEV_3_MEDIUM',
  HIGH = 'SEV_2_HIGH',
  CRITICAL = 'SEV_1_CRITICAL',
  SEV0 = 'SEV_0_EMERGENCY',
}

export enum ComponentType {
  API_GATEWAY = 'API_GATEWAY',
  DATABASE = 'DATABASE',
  CACHE = 'CACHE',
  AUTH_SERVICE = 'AUTH_SERVICE',
  WEBSOCKET = 'WEBSOCKET',
  MESSAGE_QUEUE = 'MESSAGE_QUEUE',
  STORAGE = 'STORAGE',
  THIRD_PARTY_PROVIDER = 'THIRD_PARTY_PROVIDER',
  AI_ENGINE = 'AI_ENGINE',
  LEDGER_SYNC = 'LEDGER_SYNC',
  QUANTUM_BRIDGE = 'QUANTUM_BRIDGE',
  SOVEREIGN_NODE = 'SOVEREIGN_NODE',
}

export interface ComponentMetrics {
  latencyMs: number;
  errorRatePercentage: number;
  throughputRps: number;
  cpuUsagePercentage?: number;
  memoryUsagePercentage?: number;
}

export interface ComponentHealth {
  id: string;
  name: string;
  type: ComponentType;
  status: HealthState;
  operationalStatus: OperationalStatus;
  version: string;
  uptimeSeconds: number;
  lastCheckedAt: string;
  metrics: ComponentMetrics;
  dependencies: string[];
  message?: string;
}

/**
 * Subsystem representation
 * FIX: Added 'latency', 'details', and 'level' to fix TS2353 in Contexts and Services
 */
export interface SubsystemStatus {
  subsystemId: string;
  displayName: string;
  status: OperationalStatus;
  level: HealthState; // Added
  healthScore: number; 
  latency?: number;   // Added
  details?: string;   // Added
  components: ComponentHealth[];
  lastUpdated: string;
}

// Aliases for Service compatibility (Fixes TS2305)
export type SubsystemReport = SubsystemStatus;
export type SystemStatus = SubsystemStatus;

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedComponentIds: string[];
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export type DiagnosticIssue = SystemIncident; // Alias for TS2305

export interface SystemHealthSummary {
  totalComponents: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  fatalCount: number;
  maintenanceCount: number;
  overallUptimePercentage: number;
}

export type SystemMetrics = SystemHealthSummary; // Alias for TS2305

export interface DiagnosticEnvironmentInfo {
  environment: 'development' | 'staging' | 'production' | 'sovereign_gov';
  region: string;
  clusterId: string;
  nodeId: string;
  buildHash: string;
}

// Alias for TS2724
export type DiagnosticEnvironment = DiagnosticEnvironmentInfo;

/**
 * Comprehensive System Report
 * FIX: Added 'id', 'summary', and 'timestamp' to fix TS2339 in Service
 */
export interface SystemDiagnosticReport {
  id: string;        // Added (alias for reportId)
  reportId: string;
  timestamp: string; 
  generatedAt: string; // Added for compatibility
  globalStatus: OperationalStatus;
  overallHealthScore: number;
  summary: string;     // Changed from Object to string for compatibility
  healthSummary: SystemHealthSummary; // Retained original object here
  subsystems: Record<string, SubsystemStatus>;
  activeIncidents: SystemIncident[];
  environment: DiagnosticEnvironmentInfo;
  executionDurationMs: number; // Added
  triggeredBy: string;         // Added
}

// Alias
export type DiagnosticReport = SystemDiagnosticReport;

// ============================================================================
// ROUTER IMPLEMENTATION
// ============================================================================

const currentReport: SystemDiagnosticReport = {
  id: 'rep_init_001',
  reportId: 'rep_init_001',
  timestamp: new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  globalStatus: OperationalStatus.OPERATIONAL,
  overallHealthScore: 100.0,
  summary: 'System is fully operational.',
  healthSummary: {
    totalComponents: 1, healthyCount: 1, warningCount: 0, criticalCount: 0, fatalCount: 0, maintenanceCount: 0, overallUptimePercentage: 100
  },
  subsystems: {},
  activeIncidents: [],
  environment: {
    environment: 'production', region: 'us-east-1', clusterId: 'p-01', nodeId: 'n-01', buildHash: 'abc'
  },
  executionDurationMs: 45,
  triggeredBy: 'SYSTEM'
};

export function createSystemStatusRouter(): Router {
  const router = Router();
  router.get('/report', (req: Request, res: Response) => res.json(currentReport));
  return router;
}

export function deriveAggregateOperationalStatus(statuses: OperationalStatus[]): OperationalStatus {
  if (statuses.includes(OperationalStatus.MAJOR_OUTAGE)) return OperationalStatus.MAJOR_OUTAGE;
  return OperationalStatus.OPERATIONAL;
}
