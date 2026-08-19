

// --- CONSOLIDATED FROM: ./services/LastBossService.ts ---

import { securityService } from './SecurityService';

export interface WorkflowStep {
  id: string;
  name: string;
  platform: 'Plaid' | 'Alpaca' | 'Citi' | 'Stripe' | 'ModernTreasury' | 'Mastercard' | 'AstraDB' | 'Custom';
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  input?: any;
  output?: any;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'rolling_back' | 'rolled_back';
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentHandshakeSession {
  sessionId: string;
  agentId: string;
  protocol: 'MCP' | 'Custom';
  status: 'initiated' | 'verified' | 'failed' | 'expired';
  capabilities: string[];
  publicKey?: string;
  challenge?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TransactionRoute {
  id: string;
  sourcePlatform: 'Plaid' | 'Citi' | 'Stripe' | 'ModernTreasury' | 'Alpaca' | 'Mastercard';
  destinationPlatform: 'Plaid' | 'Citi' | 'Stripe' | 'ModernTreasury' | 'Alpaca' | 'Mastercard';
  amount: number;
  currency: string;
  intermediaries?: ('ModernTreasury' | 'Stripe' | 'Citi')[];
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'security';
  category: 'workflow' | 'handshake' | 'routing' | 'security';
  message: string;
  details?: any;
}

export type WorkflowListener = (workflow: Workflow) => void;
export type HandshakeListener = (session: AgentHandshakeSession) => void;
export type AuditLogListener = (log: AuditLogEntry) => void;

class LastBossService {
  private workflows: Map<string, Workflow> = new Map();
  private handshakes: Map<string, AgentHandshakeSession> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  
  private workflowListeners: Set<WorkflowListener> = new Set();
  private handshakeListeners: Set<HandshakeListener> = new Set();
  private auditLogListeners: Set<AuditLogListener> = new Set();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows() {
    const defaultWorkflows: Workflow[] = [
      {
        id: 'wf-plaid-alpaca-bridge',
        name: 'Plaid-Alpaca Liquidity Bridge',
        description: 'Automated bank liquidity verification, ACH clearing via Stripe, and instant Alpaca brokerage deposit.',
        status: 'idle',
        steps: [
          { id: 'step-1', name: 'Verify Bank Liquidity', platform: 'Plaid', action: 'get_balance', status: 'pending' },
          { id: 'step-2', name: 'Initiate ACH Clearing', platform: 'Stripe', action: 'create_charge', status: 'pending' },
          { id: 'step-3', name: 'Deposit Brokerage Funds', platform: 'Alpaca', action: 'post_deposit', status: 'pending' },
          { id: 'step-4', name: 'Execute TQQQ Quant Strategy', platform: 'Alpaca', action: 'execute_order', status: 'pending' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf-citi-mt-ledger-sync',
        name: 'Citi-Modern Treasury Sovereign Ledger Sync',
        description: 'Cross-border payment initiation via Citi with real-time double-entry ledger synchronization in Modern Treasury.',
        status: 'idle',
        steps: [
          { id: 'step-1', name: 'Initiate Citi International Payment', platform: 'Citi', action: 'initiate_payment', status: 'pending' },
          { id: 'step-2', name: 'Record Double-Entry Ledger Entry', platform: 'ModernTreasury', action: 'create_ledger_transaction', status: 'pending' },
          { id: 'step-3', name: 'Persist Audit Metadata', platform: 'AstraDB', action: 'insert_audit_log', status: 'pending' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf-mastercard-mcp-discovery',
        name: 'Mastercard MCP Service Discovery & Integration',
        description: 'AI-driven discovery of Mastercard Developers APIs and automated integration guide retrieval.',
        status: 'idle',
        steps: [
          { id: 'step-1', name: 'Discover Available Services', platform: 'Mastercard', action: 'get-services-list', status: 'pending' },
          { id: 'step-2', name: 'Retrieve API Specification', platform: 'Mastercard', action: 'get-api-operation-list', status: 'pending' },
          { id: 'step-3', name: 'Generate Integration Boilerplate', platform: 'Custom', action: 'generate_code', status: 'pending' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultWorkflows.forEach(wf => this.workflows.set(wf.id, wf));
  }

  // Workflow Management
  public getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  public getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  public registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    this.log('info', 'workflow', `Registered new workflow: ${workflow.name}`, { workflowId: workflow.id });
  }

  public async executeWorkflow(workflowId: string, inputs: Record<string, any> = {}): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found.`);
    }

    if (workflow.status === 'running') {
      throw new Error(`Workflow ${workflowId} is already running.`);
    }

    this.log('info', 'workflow', `Starting execution of workflow: ${workflow.name}`, { workflowId });
    workflow.status = 'running';
    workflow.updatedAt = new Date();
    this.notifyWorkflowListeners(workflow);

    try {
      for (const step of workflow.steps) {
        step.status = 'running';
        step.input = inputs[step.id] || {};
        this.notifyWorkflowListeners(workflow);

        this.log('info', 'workflow', `Executing step: ${step.name} on ${step.platform}`, { stepId: step.id });
        
        // Simulate network latency and execution
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
          step.output = await this.executeStepAction(step, inputs);
          step.status = 'completed';
          this.log('info', 'workflow', `Successfully completed step: ${step.name}`, { stepId: step.id, output: step.output });
        } catch (stepError: any) {
          step.status = 'failed';
          step.error = stepError.message || 'Unknown error occurred during step execution.';
          this.log('error', 'workflow', `Failed step: ${step.name}. Error: ${step.error}`, { stepId: step.id });
          throw stepError;
        }

        this.notifyWorkflowListeners(workflow);
      }

      workflow.status = 'completed';
      this.log('info', 'workflow', `Workflow completed successfully: ${workflow.name}`, { workflowId });
    } catch (error: any) {
      workflow.status = 'failed';
      this.log('error', 'workflow', `Workflow failed: ${workflow.name}. Initiating rollback...`, { workflowId, error: error.message });
      await this.rollbackWorkflow(workflowId);
    } finally {
      workflow.updatedAt = new Date();
      this.notifyWorkflowListeners(workflow);
    }

    return workflow;
  }

  private async executeStepAction(step: WorkflowStep, inputs: Record<string, any>): Promise<any> {
    // Mocking actual API integrations based on platform and action
    switch (step.platform) {
      case 'Plaid':
        if (step.action === 'get_balance') {
          return { balance: 125000.00, currency: 'USD', accountId: 'plaid-acc-9988' };
        }
        break;
      case 'Stripe':
        if (step.action === 'create_charge') {
          return { chargeId: 'ch_3Mv8Y2LkdIwHu7ix0', amount: 50000.00, status: 'succeeded' };
        }
        break;
      case 'Alpaca':
        if (step.action === 'post_deposit') {
          return { depositId: 'dp-8821-992', status: 'cleared', amount: 50000.00 };
        }
        if (step.action === 'execute_order') {
          return { orderId: 'ord-tqqq-quant-001', symbol: 'TQQQ', qty: 120, side: 'buy', status: 'filled' };
        }
        break;
      case 'Citi':
        if (step.action === 'initiate_payment') {
          return { paymentId: 'citi-pay-88291-intl', status: 'settled', amount: 1000000.00, currency: 'EUR' };
        }
        break;
      case 'ModernTreasury':
        if (step.action === 'create_ledger_transaction') {
          return { ledgerTransactionId: 'lt-9921-883', status: 'posted', ledgerId: 'ledger-sov-01' };
        }
        break;
      case 'AstraDB':
        if (step.action === 'insert_audit_log') {
          return { documentId: 'astra-doc-88219-xyz', status: 'persisted' };
        }
        break;
      case 'Mastercard':
        if (step.action === 'get-services-list') {
          return {
            services: [
              { id: 'cross-border', title: 'Cross Border Services', description: 'Global payout solutions' },
              { id: 'open-finance', title: 'Open Finance API', description: 'Financial data aggregation' }
            ]
          };
        }
        if (step.action === 'get-api-operation-list') {
          return {
            operations: [
              { method: 'POST', path: '/payouts', title: 'Initiate Payout' },
              { method: 'GET', path: '/payouts/{id}', title: 'Get Payout Status' }
            ]
          };
        }
        break;
      case 'Custom':
        if (step.action === 'generate_code') {
          return {
            language: 'TypeScript',
            code: `import { MastercardDevelopersAgentToolkit } from "@mastercard/developers-agent-toolkit/mcp";\n// Generated integration code...`
          };
        }
        break;
      default:
        throw new Error(`Unsupported platform/action combination: ${step.platform}/${step.action}`);
    }

    return { status: 'success', timestamp: new Date().toISOString() };
  }

  public async rollbackWorkflow(workflowId: string): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found.`);

    this.log('warn', 'workflow', `Rolling back workflow: ${workflow.name}`, { workflowId });
    workflow.status = 'rolling_back';
    this.notifyWorkflowListeners(workflow);

    // Rollback completed steps in reverse order
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').reverse();
    for (const step of completedSteps) {
      this.log('info', 'workflow', `Rolling back step: ${step.name}`, { stepId: step.id });
      await new Promise(resolve => setTimeout(resolve, 1000));
      step.status = 'rolled_back';
      this.notifyWorkflowListeners(workflow);
    }

    workflow.status = 'rolled_back';
    workflow.updatedAt = new Date();
    this.notifyWorkflowListeners(workflow);
    this.log('info', 'workflow', `Workflow rollback completed: ${workflow.name}`, { workflowId });

    return workflow;
  }

  // AI Agent Handshakes
  public async initiateAgentHandshake(agentId: string, capabilities: string[]): Promise<AgentHandshakeSession> {
    const challenge = securityService ? securityService.generateChallenge() : Math.random().toString(36).substring(2);
    const sessionId = `session-${Math.random().toString(36).substring(2, 15)}`;
    
    const session: AgentHandshakeSession = {
      sessionId,
      agentId,
      protocol: 'MCP',
      status: 'initiated',
      capabilities,
      challenge,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
    };

    this.handshakes.set(sessionId, session);
    this.log('security', 'handshake', `Initiated AI Agent Handshake for agent: ${agentId}`, { sessionId, challenge });
    this.notifyHandshakeListeners(session);

    return session;
  }

  public async verifyAgentHandshake(sessionId: string, signature: string): Promise<boolean> {
    const session = this.handshakes.get(sessionId);
    if (!session) {
      this.log('error', 'handshake', `Handshake verification failed: Session ${sessionId} not found.`);
      return false;
    }

    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      this.notifyHandshakeListeners(session);
      this.log('warn', 'handshake', `Handshake session expired: ${sessionId}`);
      return false;
    }

    // Verify signature using securityService if available
    let isValid = false;
    if (securityService && session.challenge) {
      isValid = securityService.verifySignature(session.challenge, signature, session.publicKey || '');
    } else {
      // Fallback mock verification
      isValid = signature.length > 10;
    }

    if (isValid) {
      session.status = 'verified';
      this.log('info', 'handshake', `AI Agent Handshake verified successfully for agent: ${session.agentId}`, { sessionId });
    } else {
      session.status = 'failed';
      this.log('error', 'handshake', `AI Agent Handshake verification failed for agent: ${session.agentId}`, { sessionId });
    }

    this.notifyHandshakeListeners(session);
    return isValid;
  }

  // Cross-API Transaction Routing
  public async routeCrossApiTransaction(route: TransactionRoute): Promise<{ transactionId: string; status: string; steps: any[] }> {
    const transactionId = `tx-route-${Math.random().toString(36).substring(2, 15)}`;
    this.log('info', 'routing', `Routing cross-API transaction ${transactionId}`, { route });

    const steps = [];
    
    // Step 1: Source Platform Debit
    steps.push({ platform: route.sourcePlatform, action: 'debit', status: 'completed', amount: route.amount });
    
    // Step 2: Intermediary Routing (if any)
    if (route.intermediaries) {
      for (const intermediary of route.intermediaries) {
        steps.push({ platform: intermediary, action: 'route_transit', status: 'completed', amount: route.amount });
      }
    }

    // Step 3: Destination Platform Credit
    steps.push({ platform: route.destinationPlatform, action: 'credit', status: 'completed', amount: route.amount });

    this.log('info', 'routing', `Cross-API transaction ${transactionId} routed successfully.`, { transactionId, steps });
    return {
      transactionId,
      status: 'completed',
      steps
    };
  }

  // Audit Logging
  private log(level: AuditLogEntry['level'], category: AuditLogEntry['category'], message: string, details?: any) {
    const entry: AuditLogEntry = {
      id: `log-${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      details
    };

    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }

    this.notifyAuditLogListeners(entry);
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  // Listeners & Subscriptions
  public subscribeToWorkflows(listener: WorkflowListener): () => void {
    this.workflowListeners.add(listener);
    return () => this.workflowListeners.delete(listener);
  }

  public subscribeToHandshakes(listener: HandshakeListener): () => void {
    this.handshakeListeners.add(listener);
    return () => this.handshakeListeners.delete(listener);
  }

  public subscribeToAuditLogs(listener: AuditLogListener): () => void {
    this.auditLogListeners.add(listener);
    return () => this.auditLogListeners.delete(listener);
  }

  private notifyWorkflowListeners(workflow: Workflow) {
    this.workflowListeners.forEach(listener => listener({ ...workflow }));
  }

  private notifyHandshakeListeners(session: AgentHandshakeSession) {
    this.handshakeListeners.forEach(listener => listener({ ...session }));
  }

  private notifyAuditLogListeners(log: AuditLogEntry) {
    this.auditLogListeners.forEach(listener => listener(log));
  }
}

export const lastBossService = new LastBossService();