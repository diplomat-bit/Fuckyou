

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section9_citibank_demo_business.ts ---

import express, { Request, Response, NextFunction, Router } from 'express';

export interface DemoUser {
  username: string;
  role: string;
  company: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  category: string;
  referenceId: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE';
  details: string;
}

export interface ScanResult {
  endpoint: string;
  vulnerable: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  message: string;
  testedCredentials: { username: string; password?: string };
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers: Record<string, string>;
  body?: any;
}

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
}

// ==========================================
// APP 1: Citibank Demo Auth Sandbox
// ==========================================
export class CitibankDemoAuthSandbox {
  private readonly defaultUser = 'DEMO';
  private readonly defaultPass = '000000';
  private activeTokens: Map<string, { username: string; expires: Date }> = new Map();

  public login(username: string, password?: string): { success: boolean; token?: string; error?: string } {
    if (!username || !password) {
      return { success: false, error: 'Missing credentials' };
    }

    if (username.toUpperCase() === this.defaultUser && password === this.defaultPass) {
      const token = `citibank-demo-token-${Math.random().toString(36).substring(2, 15)}`;
      const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiry
      this.activeTokens.set(token, { username: username.toUpperCase(), expires });
      return { success: true, token };
    }

    return { success: false, error: 'Invalid credentials. Hint: Use DEMO / 000000' };
  }

  public validateToken(token: string): { valid: boolean; username?: string } {
    const session = this.activeTokens.get(token);
    if (!session) {
      return { valid: false };
    }
    if (session.expires < new Date()) {
      this.activeTokens.delete(token);
      return { valid: false };
    }
    return { valid: true, username: session.username };
  }

  public logout(token: string): boolean {
    return this.activeTokens.delete(token);
  }
}

// ==========================================
// APP 2: Default Credential Scanner
// ==========================================
export class DefaultCredentialScanner {
  private commonDefaults = [
    { username: 'DEMO', password: '000000' },
    { username: 'admin', password: 'admin' },
    { username: 'root', password: 'password' },
    { username: 'citi_demo', password: 'password123' }
  ];

  public async scanEndpoint(
    endpointUrl: string,
    authFn: (user: string, pass: string) => Promise<boolean>
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    for (const cred of this.commonDefaults) {
      try {
        const isVulnerable = await authFn(cred.username, cred.password);
        if (isVulnerable) {
          results.push({
            endpoint: endpointUrl,
            vulnerable: true,
            severity: cred.username === 'DEMO' && cred.password === '000000' ? 'CRITICAL' : 'HIGH',
            message: `Default credentials active: ${cred.username}/${cred.password}`,
            testedCredentials: cred
          });
        } else {
          results.push({
            endpoint: endpointUrl,
            vulnerable: false,
            severity: 'NONE',
            message: `Safe against ${cred.username} default credentials`,
            testedCredentials: cred
          });
        }
      } catch (error: any) {
        results.push({
          endpoint: endpointUrl,
          vulnerable: false,
          severity: 'LOW',
          message: `Error scanning endpoint: ${error.message}`,
          testedCredentials: cred
        });
      }
    }

    return results;
  }
}

// ==========================================
// APP 3: Sandbox Transaction Generator
// ==========================================
export class SandboxTransactionGenerator {
  private categories = ['Vendor Payment', 'Payroll', 'ACH Transfer', 'Wire Inward', 'SBA Loan', 'Merchant Fees'];
  private descriptions = [
    'Acme Corp Supplies',
    'Global Logistics Inc',
    'Bi-Weekly Payroll Deposit',
    'Citibank Business Card Payment',
    'Office Depot Invoice #9921',
    'AWS Cloud Hosting Services'
  ];

  public generateRandomTransaction(overrideAmount?: number): Transaction {
    const isCredit = Math.random() > 0.4;
    const amount = overrideAmount || parseFloat((Math.random() * 15000 + 5).toFixed(2));
    return {
      id: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // past 30 days
      amount,
      type: isCredit ? 'CREDIT' : 'DEBIT',
      description: this.descriptions[Math.floor(Math.random() * this.descriptions.length)],
      status: Math.random() > 0.05 ? 'COMPLETED' : 'PENDING',
      category: this.categories[Math.floor(Math.random() * this.categories.length)],
      referenceId: `REF-${Math.floor(Math.random() * 1000000000)}`
    };
  }

  public generateBatch(count: number): Transaction[] {
    const txns: Transaction[] = [];
    for (let i = 0; i < count; i++) {
      txns.push(this.generateRandomTransaction());
    }
    return txns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// ==========================================
// APP 4: Citibank Account Balance Simulator
// ==========================================
export class CitibankAccountBalanceSimulator {
  private balances: { checking: number; savings: number; creditLine: number } = {
    checking: 250000.0,
    savings: 1000000.0,
    creditLine: 50000.0
  };

  public getBalances() {
    return { ...this.balances };
  }

  public processTransaction(txn: Transaction): boolean {
    if (txn.type === 'CREDIT') {
      this.balances.checking += txn.amount;
      return true;
    } else {
      if (this.balances.checking >= txn.amount) {
        this.balances.checking -= txn.amount;
        return true;
      } else if (this.balances.checking + this.balances.creditLine >= txn.amount) {
        const remaining = txn.amount - this.balances.checking;
        this.balances.checking = 0;
        this.balances.creditLine -= remaining;
        return true;
      }
    }
    return false;
  }

  public resetBalances(): void {
    this.balances = {
      checking: 250000.0,
      savings: 1000000.0,
      creditLine: 50000.0
    };
  }
}

// ==========================================
// APP 5: Demo Audit Log Manager
// ==========================================
export class DemoAuditLogManager {
  private logs: AuditLog[] = [];

  public log(actor: string, action: string, status: 'SUCCESS' | 'FAILURE', details: string, ipAddress = '127.0.0.1'): void {
    this.logs.push({
      id: `LOG-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      timestamp: new Date(),
      actor,
      action,
      ipAddress,
      status,
      details
    });
  }

  public getLogs(): AuditLog[] {
    return [...this.logs];
  }

  public getLogsByActor(actor: string): AuditLog[] {
    return this.logs.filter(l => l.actor.toUpperCase() === actor.toUpperCase());
  }

  public detectAnomalies(): string[] {
    const anomalies: string[] = [];
    const failedLogins = this.logs.filter(l => l.action === 'LOGIN' && l.status === 'FAILURE');
    
    if (failedLogins.length > 5) {
      anomalies.push(`ALERT: High volume of failed login attempts detected (${failedLogins.length} failures).`);
    }

    const demoAccess = this.logs.filter(l => l.actor === 'DEMO' && l.status === 'SUCCESS');
    if (demoAccess.length > 20) {
      anomalies.push(`WARNING: Excessive activity on default 'DEMO' account. Potential sandbox abuse.`);
    }

    return anomalies;
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// ==========================================
// APP 6: Citibank API Endpoint Simulator
// ==========================================
export class CitibankApiEndpointSimulator {
  constructor(
    private authSandbox: CitibankDemoAuthSandbox,
    private balanceSimulator: CitibankAccountBalanceSimulator,
    private transactionGenerator: SandboxTransactionGenerator,
    private auditLogger: DemoAuditLogManager
  ) {}

  public handleRequest(req: ApiRequest): ApiResponse {
    const ip = req.headers['x-forwarded-for'] || '127.0.0.1';
    
    // Public Auth Endpoint
    if (req.path === '/api/v1/auth/login' && req.method === 'POST') {
      const { username, password } = req.body || {};
      const result = this.authSandbox.login(username, password);
      if (result.success) {
        this.auditLogger.log(username, 'LOGIN', 'SUCCESS', 'User logged in successfully', ip);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { token: result.token, message: 'Welcome to Citibank Business Sandbox' }
        };
      } else {
        this.auditLogger.log(username || 'UNKNOWN', 'LOGIN', 'FAILURE', result.error || 'Invalid credentials', ip);
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: { error: result.error }
        };
      }
    }

    // Protected Endpoints
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    const authCheck = this.authSandbox.validateToken(token);

    if (!authCheck.valid || !authCheck.username) {
      this.auditLogger.log('ANONYMOUS', 'API_ACCESS', 'FAILURE', `Unauthorized access attempt to ${req.path}`, ip);
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Unauthorized. Please provide a valid Bearer token.' }
      };
    }

    const user = authCheck.username;

    if (req.path === '/api/v1/accounts/balances' && req.method === 'GET') {
      this.auditLogger.log(user, 'GET_BALANCES', 'SUCCESS', 'Retrieved account balances', ip);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: this.balanceSimulator.getBalances()
      };
    }

    if (req.path === '/api/v1/transactions' && req.method === 'GET') {
      this.auditLogger.log(user, 'GET_TRANSACTIONS', 'SUCCESS', 'Retrieved transaction history', ip);
      const txns = this.transactionGenerator.generateBatch(5);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: txns
      };
    }

    if (req.path === '/api/v1/transactions/create' && req.method === 'POST') {
      const { amount, description, type } = req.body || {};
      if (!amount || !description || !type) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Missing required transaction fields' }
        };
      }

      const txn: Transaction = {
        id: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        timestamp: new Date(),
        amount,
        type,
        description,
        status: 'COMPLETED',
        category: 'Sandbox Manual Entry',
        referenceId: `REF-${Math.floor(Math.random() * 1000000000)}`
      };

      const success = this.balanceSimulator.processTransaction(txn);
      if (success) {
        this.auditLogger.log(user, 'CREATE_TRANSACTION', 'SUCCESS', `Processed transaction ${txn.id} for $${amount}`, ip);
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: { message: 'Transaction processed successfully', transaction: txn }
        };
      } else {
        this.auditLogger.log(user, 'CREATE_TRANSACTION', 'FAILURE', `Insufficient funds for transaction of $${amount}`, ip);
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Transaction failed: Insufficient funds or credit limit exceeded' }
        };
      }
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Endpoint not found' }
    };
  }
}

// ==========================================
// APP 7: Vulnerability Report Generator
// ==========================================
export class VulnerabilityReportGenerator {
  public generateReport(scanResults: ScanResult[]): string {
    const vulnerableEndpoints = scanResults.filter(r => r.vulnerable);
    const totalScanned = scanResults.length;
    const totalVulnerable = vulnerableEndpoints.length;

    let report = `======================================================================\n`;
    report += `CITIBANK SANDBOX SECURITY AUDIT & VULNERABILITY REPORT\n`;
    report += `Generated on: ${new Date().toISOString()}\n`;
    report += `======================================================================\n\n`;
    report += `SUMMARY:\n`;
    report += `- Total Endpoints Scanned: ${totalScanned}\n`;
    report += `- Vulnerable Endpoints: ${totalVulnerable}\n`;
    report += `- Risk Level: ${totalVulnerable > 0 ? 'CRITICAL' : 'LOW'}\n\n`;

    if (totalVulnerable > 0) {
      report += `DETAILED FINDINGS:\n`;
      vulnerableEndpoints.forEach((v, idx) => {
        report += `[${idx + 1}] ENDPOINT: ${v.endpoint}\n`;
        report += `    Severity: ${v.severity}\n`;
        report += `    Vulnerability: Default Credentials Enabled\n`;
        report += `    Tested Credentials: Username: "${v.testedCredentials.username}" / Password: "${v.testedCredentials.password}"\n`;
        report += `    Remediation: Disable the 'DEMO' user account in production environments. Ensure password complexity rules are enforced.\n\n`;
      });
    } else {
      report += `No default credential vulnerabilities were detected during this scan.\n\n`;
    }

    report += `======================================================================\n`;
    report += `End of Report\n`;
    report += `======================================================================\n`;

    return report;
  }
}

// ==========================================
// APP 8: Demo Rate Limiter Simulator
// ==========================================
export class DemoRateLimiterSimulator {
  private requestCounts: Map<string, { count: number; windowStart: number }> = new Map();
  private readonly limit = 10; // Max 10 requests per window
  private readonly windowMs = 10000; // 10 seconds window

  public isRateLimited(clientId: string): { limited: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData) {
      this.requestCounts.set(clientId, { count: 1, windowStart: now });
      return { limited: false, remaining: this.limit - 1, resetMs: this.windowMs };
    }

    if (now - clientData.windowStart > this.windowMs) {
      // Reset window
      clientData.count = 1;
      clientData.windowStart = now;
      this.requestCounts.set(clientId, clientData);
      return { limited: false, remaining: this.limit - 1, resetMs: this.windowMs };
    }

    if (clientData.count >= this.limit) {
      const resetMs = Math.max(0, this.windowMs - (now - clientData.windowStart));
      return { limited: true, remaining: 0, resetMs };
    }

    clientData.count++;
    this.requestCounts.set(clientId, clientData);
    const resetMs = Math.max(0, this.windowMs - (now - clientData.windowStart));
    return { limited: false, remaining: this.limit - clientData.count, resetMs };
  }

  public resetLimiter(): void {
    this.requestCounts.clear();
  }
}

// ==========================================
// APP 9: Citibank Wire Transfer Simulator
// ==========================================
export class CitibankWireTransferSimulator {
  constructor(
    private balanceSimulator: CitibankAccountBalanceSimulator,
    private auditLogger: DemoAuditLogManager
  ) {}

  public initiateWire(
    senderToken: string,
    details: {
      recipientName: string;
      recipientRouting: string;
      recipientAccount: string;
      amount: number;
      memo: string;
    }
  ): { success: boolean; transactionId?: string; error?: string } {
    if (!details.recipientName || !details.recipientRouting || !details.recipientAccount) {
      return { success: false, error: 'Incomplete recipient wire details' };
    }

    if (details.recipientRouting.length !== 9) {
      return { success: false, error: 'Invalid routing number. Must be exactly 9 digits.' };
    }

    if (details.amount <= 0) {
      return { success: false, error: 'Wire amount must be greater than zero' };
    }

    const txn: Transaction = {
      id: `WIRE-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      timestamp: new Date(),
      amount: details.amount,
      type: 'DEBIT',
      description: `Wire to ${details.recipientName} - ${details.memo || 'No Memo'}`,
      status: 'COMPLETED',
      category: 'Wire Transfer',
      referenceId: `REF-${Math.floor(Math.random() * 1000000000)}`
    };

    const success = this.balanceSimulator.processTransaction(txn);
    if (success) {
      this.auditLogger.log(
        'DEMO',
        'WIRE_TRANSFER',
        'SUCCESS',
        `Wired $${details.amount} to ${details.recipientName} (Acct: ${details.recipientAccount})`
      );
      return { success: true, transactionId: txn.id };
    } else {
      this.auditLogger.log(
        'DEMO',
        'WIRE_TRANSFER',
        'FAILURE',
        `Failed wire of $${details.amount} to ${details.recipientName} due to insufficient funds`
      );
      return { success: false, error: 'Insufficient funds to complete wire transfer' };
    }
  }
}

// ==========================================
// APP 10: Sandbox Data Reset Utility
// ==========================================
export class SandboxDataResetUtility {
  constructor(
    private authSandbox: CitibankDemoAuthSandbox,
    private balanceSimulator: CitibankAccountBalanceSimulator,
    private auditLogger: DemoAuditLogManager,
    private rateLimiter: DemoRateLimiterSimulator
  ) {}

  public performFullReset(): { success: boolean; timestamp: Date; message: string } {
    try {
      // Reset balances to default
      this.balanceSimulator.resetBalances();

      // Clear audit logs
      this.auditLogger.clearLogs();

      // Reset rate limiters
      this.rateLimiter.resetLimiter();

      // Log the reset event
      this.auditLogger.log('SYSTEM', 'SANDBOX_RESET', 'SUCCESS', 'Sandbox environment has been reset to default baseline.');

      return {
        success: true,
        timestamp: new Date(),
        message: 'Citibank Demo Business Sandbox successfully reset to baseline state.'
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date(),
        message: `Failed to reset sandbox: ${error.message}`
      };
    }
  }
}

// ==========================================
// EXPRESS API ROUTER INTEGRATION
// ==========================================
const authSandbox = new CitibankDemoAuthSandbox();
const balanceSimulator = new CitibankAccountBalanceSimulator();
const transactionGenerator = new SandboxTransactionGenerator();
const auditLogger = new DemoAuditLogManager();
const credentialScanner = new DefaultCredentialScanner();
const reportGenerator = new VulnerabilityReportGenerator();
const rateLimiter = new DemoRateLimiterSimulator();
const wireSimulator = new CitibankWireTransferSimulator(balanceSimulator, auditLogger);
const resetUtility = new SandboxDataResetUtility(authSandbox, balanceSimulator, auditLogger, rateLimiter);

const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientId = (req.headers['x-forwarded-for'] as string) || req.ip || 'anonymous';
  const status = rateLimiter.isRateLimited(clientId);
  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', status.remaining.toString());
  res.setHeader('X-RateLimit-Reset', status.resetMs.toString());
  if (status.limited) {
    return res.status(429).json({ error: 'Too Many Requests', retryAfterMs: status.resetMs });
  }
  next();
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  const authCheck = authSandbox.validateToken(token);
  if (!authCheck.valid || !authCheck.username) {
    return res.status(401).json({ error: 'Unauthorized. Please provide a valid Bearer token.' });
  }
  (req as any).username = authCheck.username;
  next();
};

const router = Router();

router.use(rateLimitMiddleware);

router.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const result = authSandbox.login(username, password);
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
  if (result.success) {
    auditLogger.log(username, 'LOGIN', 'SUCCESS', 'User logged in successfully', ip);
    return res.status(200).json({ token: result.token, message: 'Welcome to Citibank Business Sandbox' });
  } else {
    auditLogger.log(username || 'UNKNOWN', 'LOGIN', 'FAILURE', result.error || 'Invalid credentials', ip);
    return res.status(401).json({ error: result.error });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  const success = authSandbox.logout(token);
  return res.status(200).json({ success, message: success ? 'Logged out successfully' : 'Token not found or already expired' });
});

router.get('/balances', authMiddleware, (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
  const user = (req as any).username;
  auditLogger.log(user, 'GET_BALANCES', 'SUCCESS', 'Retrieved account balances', ip);
  return res.status(200).json(balanceSimulator.getBalances());
});

router.get('/transactions', authMiddleware, (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
  const user = (req as any).username;
  auditLogger.log(user, 'GET_TRANSACTIONS', 'SUCCESS', 'Retrieved transaction history', ip);
  const count = parseInt(req.query.count as string) || 10;
  const txns = transactionGenerator.generateBatch(count);
  return res.status(200).json(txns);
});

router.post('/transactions/create', authMiddleware, (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
  const user = (req as any).username;
  const { amount, description, type } = req.body || {};
  if (!amount || !description || !type) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }

  const txn: Transaction = {
    id: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    timestamp: new Date(),
    amount,
    type,
    description,
    status: 'COMPLETED',
    category: 'Sandbox Manual Entry',
    referenceId: `REF-${Math.floor(Math.random() * 1000000000)}`
  };

  const success = balanceSimulator.processTransaction(txn);
  if (success) {
    auditLogger.log(user, 'CREATE_TRANSACTION', 'SUCCESS', `Processed transaction ${txn.id} for $${amount}`, ip);
    return res.status(201).json({ message: 'Transaction processed successfully', transaction: txn });
  } else {
    auditLogger.log(user, 'CREATE_TRANSACTION', 'FAILURE', `Insufficient funds for transaction of $${amount}`, ip);
    return res.status(400).json({ error: 'Transaction failed: Insufficient funds or credit limit exceeded' });
  }
});

router.post('/wire', authMiddleware, (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  const { recipientName, recipientRouting, recipientAccount, amount, memo } = req.body || {};
  const result = wireSimulator.initiateWire(token, { recipientName, recipientRouting, recipientAccount, amount, memo });
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json({ error: result.error });
  }
});

router.get('/audit/logs', authMiddleware, (req: Request, res: Response) => {
  return res.status(200).json(auditLogger.getLogs());
});

router.get('/audit/anomalies', authMiddleware, (req: Request, res: Response) => {
  return res.status(200).json({ anomalies: auditLogger.detectAnomalies() });
});

router.post('/audit/clear', authMiddleware, (req: Request, res: Response) => {
  auditLogger.clearLogs();
  return res.status(200).json({ message: 'Audit logs cleared successfully' });
});

router.post('/scan', authMiddleware, async (req: Request, res: Response) => {
  const { endpointUrl } = req.body || {};
  if (!endpointUrl) {
    return res.status(400).json({ error: 'Missing endpointUrl in request body' });
  }
  const mockAuthFn = async (user: string, pass: string) => {
    return user === 'DEMO' && pass === '000000';
  };
  const results = await credentialScanner.scanEndpoint(endpointUrl, mockAuthFn);
  return res.status(200).json(results);
});

router.post('/scan/report', authMiddleware, async (req: Request, res: Response) => {
  const { results } = req.body || {};
  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Missing or invalid scan results array' });
  }
  const report = reportGenerator.generateReport(results);
  return res.status(200).json({ report });
});

router.post('/sandbox/reset', (req: Request, res: Response) => {
  const result = resetUtility.performFullReset();
  return res.status(200).json(result);
});

export { router as citibankDemoRouter };