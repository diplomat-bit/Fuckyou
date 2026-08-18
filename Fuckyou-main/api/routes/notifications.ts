import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { RESEARCH_BIBLIOGRAPHY } from '../types/AppManifest';
import { SeverityEnum, NotificationPayloadSchema, GoogleChatWebhookSchema, SovereignProtocolSchema, PaperTalkbackSchema, FinancialGovernanceSchema } from '../types/AppRuntime';
import { dispatchToGoogleChat, dispatchToSovereignProtocol, dispatchPaperTalkbackSession, dispatchFinancialGovernanceAction } from '../services/AppDeploymentService';
import { DISPATCH_AUDIT_LEDGER } from '../services/AppMetricsCollector';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'HEALTHY',
    subsystem: 'sovereign-ai-paper-banking-notification-router',
    activeProtocols: [
      'GOOGLE_CHAT_V2_CARDS',
      'SOVEREIGN_MESH_HMAC_SHA512',
      'PAPER_INTERACTIVE_TALKBACK_V4',
      'AUTONOMOUS_BANKING_GOVERNANCE_DISPATCH'
    ],
    citationsIndexedCount: Object.keys(RESEARCH_BIBLIOGRAPHY).length,
    ledgerDispatchesTotal: DISPATCH_AUDIT_LEDGER.length,
    timestamp: new Date().toISOString(),
  });
});

router.get('/bibliography', (_req: Request, res: Response) => {
  res.status(200).json({
    description: 'Academic Research Bibliography & Nuts & Bolts Technical Foundation',
    citations: Object.values(RESEARCH_BIBLIOGRAPHY),
    totalCount: Object.keys(RESEARCH_BIBLIOGRAPHY).length,
    timestamp: new Date().toISOString()
  });
});

router.get('/ledger', (_req: Request, res: Response) => {
  res.status(200).json({
    ledger: DISPATCH_AUDIT_LEDGER.slice(-100).reverse(),
    totalDispatched: DISPATCH_AUDIT_LEDGER.length,
    timestamp: new Date().toISOString()
  });
});

router.post('/dispatch', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = NotificationPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid payload', details: parseResult.error.format() });
      return;
    }

    const payload = parseResult.data;
    const dispatchTasks = [];

    if (payload.channels.googleChat) dispatchTasks.push(dispatchToGoogleChat(payload, payload.channels.googleChat));
    if (payload.channels.sovereign) dispatchTasks.push(dispatchToSovereignProtocol(payload, payload.channels.sovereign));
    if (payload.channels.paperTalkback) dispatchTasks.push(dispatchPaperTalkbackSession(payload, payload.channels.paperTalkback));
    if (payload.channels.financialGovernance) dispatchTasks.push(dispatchFinancialGovernanceAction(payload, payload.channels.financialGovernance));

    const results = await Promise.all(dispatchTasks);
    const allSuccessful = results.every((r: any) => r.success);
    const anySuccessful = results.some((r: any) => r.success);

    DISPATCH_AUDIT_LEDGER.push({
      alertId: payload.alertId,
      severity: payload.severity,
      title: payload.title,
      channelsDispatched: results.filter((r: any) => r.success).map((r: any) => r.channel),
      citationsCount: payload.citationsUsed.length,
      timestamp: payload.timestamp
    });

    res.status(allSuccessful ? 200 : anySuccessful ? 207 : 502).json({
      alertId: payload.alertId,
      status: allSuccessful ? 'DELIVERED' : anySuccessful ? 'PARTIALLY_DELIVERED' : 'FAILED',
      dispatches: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/google-chat', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = z.object({ webhookUrl: z.string().url(), title: z.string(), summary: z.string(), severity: SeverityEnum.default('INFO') }).parse(req.body);
    const payload = { ...validated, alertId: crypto.randomUUID(), timestamp: new Date().toISOString(), sourceSystem: 'direct-route', citationsUsed: [], channels: { googleChat: { webhookUrl: validated.webhookUrl } } };
    const result = await dispatchToGoogleChat(payload as any, payload.channels.googleChat);
    res.status(result.success ? 200 : 502).json(result);
  } catch (err) { next(err); }
});

router.post('/sovereign', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = SovereignProtocolSchema.extend({ title: z.string(), summary: z.string() }).parse(req.body);
    const payload = { alertId: crypto.randomUUID(), title: validated.title, summary: validated.summary, severity: 'HIGH', timestamp: new Date().toISOString(), sourceSystem: 'sovereign-direct', citationsUsed: [], channels: { sovereign: validated } };
    const result = await dispatchToSovereignProtocol(payload as any, validated);
    res.status(result.success ? 200 : 502).json(result);
  } catch (err) { next(err); }
});

router.post('/paper-talkback', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = PaperTalkbackSchema.parse(req.body);
    const result = await dispatchPaperTalkbackSession({} as any, validated);
    res.status(result.success ? 200 : 502).json(result);
  } catch (err) { next(err); }
});

router.post('/financial-governance', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = FinancialGovernanceSchema.parse(req.body);
    const result = await dispatchFinancialGovernanceAction({} as any, validated);
    res.status(result.success ? 200 : 502).json(result);
  } catch (err) { next(err); }
});

export default router;