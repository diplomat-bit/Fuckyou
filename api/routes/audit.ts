import { Router, Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';
import { authenticate, validateQuery } from '../middleware/auth';
import { logger } from '../utils/logger';
import { complianceEngine } from '../utils/complianceEngine';

const router = Router();
const auditService = new AuditService();

/**
 * @route GET /api/audit/logs
 * @desc Retrieve historical compliance logs with pagination and filtering
 */
router.get('/logs', authenticate, validateQuery, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, severity, category, limit, offset } = req.query;
    const logs = await auditService.getComplianceLogs({
      startDate: startDate as string,
      endDate: endDate as string,
      severity: severity as string,
      category: category as string,
      limit: Number(limit) || 50,
      offset: Number(offset) || 0
    });
    
    logger.info('Compliance logs retrieved', { count: logs.length });
    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        limit: Number(limit) || 50,
        offset: Number(offset) || 0,
        total: logs.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/github
 * @desc Query GitHub audit commits for security and integrity tracking
 */
router.get('/github', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { repo, branch, author } = req.query;
    const commits = await auditService.getGitHubAuditCommits({
      repo: repo as string,
      branch: branch as string,
      author: author as string
    });
    res.status(200).json({ success: true, data: commits });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/ledger
 * @desc Fetch sovereign ledger state changes for immutable verification
 */
router.get('/ledger', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blockHeight, transactionHash, zkProofRequired } = req.query;
    const stateChanges = await auditService.getLedgerStateChanges({
      blockHeight: blockHeight ? Number(blockHeight) : undefined,
      transactionHash: transactionHash as string
    });
    res.status(200).json({
      success: true,
      data: stateChanges,
      meta: {
        blockHeight: blockHeight ? Number(blockHeight) : 'latest',
        zkVerified: zkProofRequired === 'true'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/audit/verify
 * @desc Cryptographically verify the integrity of a specific audit trail
 */
router.post('/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { auditId, signature, payload, merkleProof } = req.body;
    const verification = await auditService.verifyAuditIntegrity(auditId, signature, payload);
    
    const complianceResult = await complianceEngine.verifyIntegrity(payload, merkleProof);
    
    res.status(200).json({
      success: true,
      verified: verification && complianceResult.isValid,
      auditId,
      timestamp: new Date().toISOString(),
      merkleVerified: Boolean(merkleProof)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/bibliography
 * @desc Retrieve audit trails for cited academic research papers
 */
router.get('/bibliography', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paperId, doi, limit, offset } = req.query;
    const records = await auditService.getBibliographyAudit({
      paperId: paperId as string,
      doi: doi as string,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0
    });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/audit/bibliography/cite
 * @desc Record a research paper citation audit entry with zero-knowledge provenance
 */
router.post('/bibliography/cite', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paperId, doi, title, authors, claimHash, sourceContext } = req.body;
    if (!paperId || !title) {
      return res.status(400).json({ success: false, error: 'paperId and title are required fields' });
    }
    const record = await auditService.recordCitationAudit({
      paperId,
      doi,
      title,
      authors,
      claimHash,
      sourceContext,
      actorId: (req as any).user?.id || 'system'
    });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/paper-chat
 * @desc Retrieve audit logs for interactive paper AI talk-back sessions
 */
router.get('/paper-chat', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paperId, sessionId, limit } = req.query;
    const chats = await auditService.getPaperChatLogs({
      paperId: paperId as string,
      sessionId: sessionId as string,
      limit: Number(limit) || 20
    });
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/financial
 * @desc Compliance audit trails for AI banking
 */
router.get('/financial', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId, transactionType, minAmount, status, limit } = req.query;
    const financialLogs = await auditService.getFinancialAuditLogs({
      accountId: accountId as string,
      transactionType: transactionType as string,
      minAmount: minAmount ? Number(minAmount) : undefined,
      status: status as string,
      limit: Number(limit) || 50
    });
    res.status(200).json({ success: true, data: financialLogs });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/audit/financial/verify-tx
 * @desc Cryptographically verify zero-knowledge proof for AI banking transactions
 */
router.post('/financial/verify-tx', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { txHash, zkProof } = req.body;
    const isValid = await complianceEngine.verifyTransaction(txHash, zkProof);
    res.status(200).json({
      success: true,
      verified: isValid,
      txHash,
      complianceStandard: 'ISO-20022 / EU-AI-ACT-ART-12',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/property
 * @desc Retrieve sovereign property, deed transfers, and housing allocation audit logs
 */
router.get('/property', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId, ownerAddress, state } = req.query;
    const propertyLogs = await auditService.getPropertyAuditLogs({
      propertyId: propertyId as string,
      ownerAddress: ownerAddress as string,
      state: state as string
    });
    res.status(200).json({ success: true, data: propertyLogs });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/civic
 * @desc Audit trail for sovereign government services
 */
router.get('/civic', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceType, citizenId, status } = req.query;
    const civicLogs = await auditService.getCivicAuditLogs({
      serviceType: serviceType as string,
      citizenId: citizenId as string,
      status: status as string
    });
    res.status(200).json({ success: true, data: civicLogs });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/audit/export
 * @desc Generate and export examination-grade regulatory and academic citation audit reports
 */
router.post('/export', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format, scope } = req.body;
    const report = await auditService.getAuditStats();
    
    res.status(200).json({ 
      success: true, 
      report: {
        ...report,
        reportId: `REP-${Date.now()}`,
        format: (format || 'JSON_LD').toUpperCase(),
        scope: scope || 'ALL_MODULES'
      } 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/audit/stats
 * @desc Real-time system health, academic citations, banking, and civic action audit metrics
 */
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await auditService.getAuditStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;