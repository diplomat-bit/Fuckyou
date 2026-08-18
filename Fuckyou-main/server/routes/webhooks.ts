import { Router } from 'express';

const router = Router();

router.post('/stripe', (req, res) => {
  res.status(200).send('Webhook received');
});

export default router;