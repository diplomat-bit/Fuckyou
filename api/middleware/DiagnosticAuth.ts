import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authenticate diagnostic requests.
 * Validates that the request contains the necessary authorization headers
 * or tokens required for accessing diagnostic endpoints.
 */
export const diagnosticAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for diagnostic access'
    });
  }

  // Basic validation logic - can be expanded to verify JWT or API keys
  // as per the project's security requirements.
  if (authHeader !== 'Bearer diagnostic-secret-token') {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired diagnostic token'
    });
  }

  next();
};

export default diagnosticAuth;