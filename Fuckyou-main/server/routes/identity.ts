import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { IdentityService } from '../services/identity-service';
import { authenticate, requireClearance, UserPayload } from '../middleware/auth';

const router = Router();
const identityService = new IdentityService();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'illuminati_global_access_secret_999';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'illuminati_global_refresh_secret_999';

interface RequestWithUser extends Request {
  user?: UserPayload;
}

const validateRequest: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
};

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('A valid global email is required'),
    body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('dateOfBirth').isISO8601(),
    body('publicKey').notEmpty()
  ],
  validateRequest,
  (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const citizen = await identityService.registerCitizen(req.body);
      res.status(201).json({ success: true, data: citizen });
    } catch (error: any) {
      next(error);
    }
  }) as RequestHandler
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').exists()
  ],
  validateRequest,
  (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const citizen = await identityService.validateCredentials(email, password);
      if (!citizen) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const accessToken = jwt.sign({ id: citizen.id, clearanceLevel: citizen.clearanceLevel, roles: citizen.roles, did: citizen.did }, JWT_ACCESS_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: citizen.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      await identityService.saveRefreshToken(citizen.id, refreshToken);
      res.status(200).json({ success: true, accessToken, refreshToken });
    } catch (error: any) {
      next(error);
    }
  }) as RequestHandler
);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty()],
  validateRequest,
  (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      const isValid = await identityService.verifyRefreshToken(decoded.id, refreshToken);
      if (!isValid) {
        res.status(403).json({ success: false });
        return;
      }

      const citizen = await identityService.getCitizenById(decoded.id);
      if (!citizen) {
        res.status(403).json({ success: false });
        return;
      }
      const newAccessToken = jwt.sign({ id: citizen.id, clearanceLevel: citizen.clearanceLevel, roles: citizen.roles, did: citizen.did }, JWT_ACCESS_SECRET, { expiresIn: '1h' });
      res.status(200).json({ success: true, accessToken: newAccessToken });
    } catch (error: any) {
      res.status(403).json({ success: false });
    }
  }) as RequestHandler
);

router.get('/me', authenticate, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await identityService.getCitizenProfile(req.user!.id);
    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.put('/me', authenticate, validateRequest, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await identityService.updateCitizenProfile(req.user!.id, req.body);
    res.status(200).json({ success: true, profile: updated });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.post('/biometrics', authenticate, [body('biometricType').notEmpty(), body('signatureHash').notEmpty()], validateRequest, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    await identityService.registerBiometrics(req.user!.id, req.body.biometricType, req.body.signatureHash);
    res.status(200).json({ success: true });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.post('/keys', authenticate, [body('publicKey').notEmpty()], validateRequest, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    await identityService.rotateKeys(req.user!.id, req.body.publicKey, req.body.algorithm || 'Ed25519');
    res.status(200).json({ success: true });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.get('/clearance', authenticate, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const details = await identityService.getClearanceDetails(req.user!.id);
    res.status(200).json({ success: true, details });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.post('/kyc', authenticate, [body('documentType').notEmpty(), body('documentNumber').notEmpty()], validateRequest, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const submission = await (identityService as any).submitKYC ? (identityService as any).submitKYC(req.user!.id, req.body) : { status: 'submitted' };
    res.status(202).json({ success: true, status: submission.status || 'submitted' });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.post('/elevate-clearance', authenticate, requireClearance(10), [body('targetCitizenId').notEmpty(), body('newClearanceLevel').isInt()], validateRequest, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (typeof (identityService as any).updateClearanceLevel === 'function') {
      await (identityService as any).updateClearanceLevel(req.body.targetCitizenId, req.body.newClearanceLevel);
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

router.post('/logout', authenticate, (async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (typeof (identityService as any).revokeAllRefreshTokens === 'function') {
      await (identityService as any).revokeAllRefreshTokens(req.user!.id);
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

export default router;