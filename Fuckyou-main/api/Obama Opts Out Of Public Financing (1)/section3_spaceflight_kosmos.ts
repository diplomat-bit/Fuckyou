/**
 * Section 3: Spaceflight Log & Satellite Launch App
 * Resolving Pegasus XL vs. Kosmos-3M launch log conflicts.
 * Enhanced with fully-featured Express API routes, robust validation, and error handling.
 */

import { Router, Request, Response, NextFunction } from 'express';

export interface LaunchLog {
  id: string;
  vehicle: 'Pegasus XL' | 'Kosmos-3M';
  timestamp: number;
  orbitInclination: number;
}

// ==========================================
// Core Business Logic Functions
// ==========================================

// 1. Pegasus vs Kosmos Conflict Resolver
export const resolveLaunchConflict = (logs: LaunchLog[]): LaunchLog[] => {
  return logs.filter((log, index, self) => 
    index === self.findIndex((t) => t.timestamp === log.timestamp)
  );
};

// 2. Orbital Trajectory Calculator
export const calculateTrajectory = (velocity: number, altitude: number): number => {
  return (velocity * altitude) / 9.81;
};

// 3. Launch Schedule Parser
export const parseLaunchDate = (dateStr: string): Date => {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid date format provided");
  }
  return parsed;
};

// 4. Timestamp Error Detector
export const detectTimestampAnomaly = (logs: LaunchLog[]): number[] => {
  return logs.map((l, i) => (i > 0 && l.timestamp < logs[i - 1].timestamp ? i : -1)).filter(i => i !== -1);
};

// 5. Vehicle Efficiency Comparator
export const compareEfficiency = (v1: number, v2: number): string => {
  return v1 > v2 ? "Pegasus XL Superior" : "Kosmos-3M Superior";
};

// 6. Orbit Inclination Validator
export const isInclinationValid = (inc: number): boolean => inc >= 0 && inc <= 180;

// 7. Log Sanitizer
export const sanitizeLogs = (logs: any[]): LaunchLog[] => {
  if (!Array.isArray(logs)) return [];
  return logs
    .filter(l => l && typeof l === 'object' && l.vehicle && typeof l.timestamp === 'number')
    .map(l => ({
      id: String(l.id || Math.random().toString(36).substr(2, 9)),
      vehicle: l.vehicle === 'Kosmos-3M' ? 'Kosmos-3M' : 'Pegasus XL',
      timestamp: Number(l.timestamp),
      orbitInclination: typeof l.orbitInclination === 'number' ? l.orbitInclination : 0
    }));
};

// 8. Delta-V Estimator
export const estimateDeltaV = (massRatio: number, isp: number): number => {
  if (massRatio <= 0 || isp <= 0) {
    throw new Error("Mass ratio and ISP must be greater than zero");
  }
  return isp * 9.81 * Math.log(massRatio);
};

// 9. Launch Window Finder
export const findLaunchWindow = (start: number, end: number, duration: number): number[] => {
  if (start + duration > end) {
    throw new Error("Duration exceeds the specified launch window bounds");
  }
  return [start, start + duration];
};

// 10. Data Export Formatter
export const formatForArchive = (log: LaunchLog): string => {
  return `${log.vehicle}|${log.timestamp}|${log.orbitInclination}`;
};

export const SpaceflightAppSuite = {
  resolveLaunchConflict,
  calculateTrajectory,
  parseLaunchDate,
  detectTimestampAnomaly,
  compareEfficiency,
  isInclinationValid,
  sanitizeLogs,
  estimateDeltaV,
  findLaunchWindow,
  formatForArchive
};

// ==========================================
// Express API Router Implementation
// ==========================================

const router = Router();

// Helper middleware for async error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @route POST /api/spaceflight/resolve-conflicts
 * @desc Resolves Pegasus vs Kosmos launch log conflicts by removing duplicate timestamps
 */
router.post('/resolve-conflicts', asyncHandler(async (req: Request, res: Response) => {
  const { logs } = req.body;
  if (!Array.isArray(logs)) {
    return res.status(400).json({ success: false, error: "Invalid input: 'logs' must be an array." });
  }
  const sanitized = sanitizeLogs(logs);
  const resolved = resolveLaunchConflict(sanitized);
  return res.json({ success: true, data: resolved });
}));

/**
 * @route POST /api/spaceflight/calculate-trajectory
 * @desc Calculates orbital trajectory based on velocity and altitude
 */
router.post('/calculate-trajectory', asyncHandler(async (req: Request, res: Response) => {
  const { velocity, altitude } = req.body;
  if (typeof velocity !== 'number' || typeof altitude !== 'number') {
    return res.status(400).json({ success: false, error: "Velocity and altitude must be numbers." });
  }
  const trajectory = calculateTrajectory(velocity, altitude);
  return res.json({ success: true, data: { trajectory } });
}));

/**
 * @route POST /api/spaceflight/parse-date
 * @desc Parses launch schedule date string
 */
router.post('/parse-date', asyncHandler(async (req: Request, res: Response) => {
  const { dateStr } = req.body;
  if (typeof dateStr !== 'string') {
    return res.status(400).json({ success: false, error: "dateStr must be a string." });
  }
  try {
    const parsedDate = parseLaunchDate(dateStr);
    return res.json({ success: true, data: { parsedDate, iso: parsedDate.toISOString() } });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}));

/**
 * @route POST /api/spaceflight/detect-anomalies
 * @desc Detects timestamp anomalies in chronological launch logs
 */
router.post('/detect-anomalies', asyncHandler(async (req: Request, res: Response) => {
  const { logs } = req.body;
  if (!Array.isArray(logs)) {
    return res.status(400).json({ success: false, error: "logs must be an array." });
  }
  const sanitized = sanitizeLogs(logs);
  const anomalies = detectTimestampAnomaly(sanitized);
  return res.json({ success: true, data: { anomalies, count: anomalies.length } });
}));

/**
 * @route POST /api/spaceflight/compare-efficiency
 * @desc Compares efficiency metrics between Pegasus XL and Kosmos-3M
 */
router.post('/compare-efficiency', asyncHandler(async (req: Request, res: Response) => {
  const { v1, v2 } = req.body;
  if (typeof v1 !== 'number' || typeof v2 !== 'number') {
    return res.status(400).json({ success: false, error: "v1 and v2 efficiency metrics must be numbers." });
  }
  const result = compareEfficiency(v1, v2);
  return res.json({ success: true, data: { result } });
}));

/**
 * @route POST /api/spaceflight/validate-inclination
 * @desc Validates if orbit inclination is within acceptable bounds (0-180 degrees)
 */
router.post('/validate-inclination', asyncHandler(async (req: Request, res: Response) => {
  const { inclination } = req.body;
  if (typeof inclination !== 'number') {
    return res.status(400).json({ success: false, error: "inclination must be a number." });
  }
  const isValid = isInclinationValid(inclination);
  return res.json({ success: true, data: { inclination, isValid } });
}));

/**
 * @route POST /api/spaceflight/sanitize-logs
 * @desc Sanitizes raw launch log inputs into structured LaunchLog objects
 */
router.post('/sanitize-logs', asyncHandler(async (req: Request, res: Response) => {
  const { logs } = req.body;
  if (!Array.isArray(logs)) {
    return res.status(400).json({ success: false, error: "logs must be an array." });
  }
  const sanitized = sanitizeLogs(logs);
  return res.json({ success: true, data: sanitized });
}));

/**
 * @route POST /api/spaceflight/estimate-deltav
 * @desc Estimates Delta-V using mass ratio and specific impulse (ISP)
 */
router.post('/estimate-deltav', asyncHandler(async (req: Request, res: Response) => {
  const { massRatio, isp } = req.body;
  if (typeof massRatio !== 'number' || typeof isp !== 'number') {
    return res.status(400).json({ success: false, error: "massRatio and isp must be numbers." });
  }
  try {
    const deltaV = estimateDeltaV(massRatio, isp);
    return res.json({ success: true, data: { deltaV } });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}));

/**
 * @route POST /api/spaceflight/find-window
 * @desc Finds optimal launch window based on start, end, and duration parameters
 */
router.post('/find-window', asyncHandler(async (req: Request, res: Response) => {
  const { start, end, duration } = req.body;
  if (typeof start !== 'number' || typeof end !== 'number' || typeof duration !== 'number') {
    return res.status(400).json({ success: false, error: "start, end, and duration must be numbers." });
  }
  try {
    const window = findLaunchWindow(start, end, duration);
    return res.json({ success: true, data: { windowStart: window[0], windowEnd: window[1] } });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
}));

/**
 * @route POST /api/spaceflight/format-archive
 * @desc Formats a single LaunchLog into archival string representation
 */
router.post('/format-archive', asyncHandler(async (req: Request, res: Response) => {
  const { log } = req.body;
  if (!log || typeof log !== 'object') {
    return res.status(400).json({ success: false, error: "log must be a valid LaunchLog object." });
  }
  const sanitized = sanitizeLogs([log]);
  if (sanitized.length === 0) {
    return res.status(400).json({ success: false, error: "Provided log could not be sanitized." });
  }
  const formatted = formatForArchive(sanitized[0]);
  return res.json({ success: true, data: { formatted } });
}));

export default router;