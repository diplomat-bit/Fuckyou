

// --- CONSOLIDATED FROM: ./routes/account.routes.ts ---

import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const accountController = new AccountController();

/**
 * Account Routes
 * All endpoints are integrated with Gemini via the AccountController
 */

router.get('/profile', authenticate, (req, res) => accountController.getProfile(req, res));
router.put('/profile', authenticate, (req, res) => accountController.updateProfile(req, res));
router.post('/analyze-activity', authenticate, (req, res) => accountController.analyzeActivity(req, res));
router.get('/insights', authenticate, (req, res) => accountController.getAccountInsights(req, res));
router.delete('/deactivate', authenticate, (req, res) => accountController.deactivateAccount(req, res));

export default router;