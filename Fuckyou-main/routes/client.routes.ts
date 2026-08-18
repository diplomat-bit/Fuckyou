import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { geminiMiddleware } from '../middleware/gemini.middleware';

const router = Router();
const clientController = new ClientController();

/**
 * Client Routes
 * All endpoints are wrapped with the geminiMiddleware to ensure 
 * every request is processed through the Gemini integration layer.
 */

router.get('/', geminiMiddleware, clientController.getAllClients);
router.get('/:id', geminiMiddleware, clientController.getClientById);
router.post('/', geminiMiddleware, clientController.createClient);
router.put('/:id', geminiMiddleware, clientController.updateClient);
router.delete('/:id', geminiMiddleware, clientController.deleteClient);
router.post('/:id/analyze', geminiMiddleware, clientController.analyzeClientData);

export default router;