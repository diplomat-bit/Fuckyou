import { Router, Request, Response } from 'express';

export interface ServiceNode {
  id: string;
  name: string;
  category: 'api' | 'service' | 'database' | 'gateway' | 'queue' | 'bridge' | 'auth';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  baseLatencyMs: number;
  maxRps: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metadata?: Record<string, unknown>;
}

export interface DependencyEdge {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: 'REST' | 'gRPC' | 'WEBSOCKET' | 'SQL' | 'EVENT' | 'RPC';
  weight: number; // Represents average network/processing cost or latency multiplier
  isBlocking: boolean;
  timeoutMs: number;
  fallbackNodeId?: string;
}

export interface BottleneckReport {
  nodeId: string;
  nodeName: string;
  bottleneckScore: number; // 0 to 100
  fanIn: number;
  fanOut: number;
  cascadingFailureRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedLatencyImpactMs: number;
  reasons: string[];
}

export interface CriticalPathResult {
  path: string[];
  totalLatencyMs: number;
  containsUnhealthyNode: boolean;
  chokePointNodeId?: string;
}

export interface SimulationResult {
  failedNodeId: string;
  affectedServices: string[];
  isolatedServices: string[];
  systemDegradationPercentage: number;
  resilientWithFallbacks: string[];
}

export class DependencyGraph {
  private static instance: DependencyGraph;
  public static getInstance(): DependencyGraph {
    if (!DependencyGraph.instance) {
      DependencyGraph.instance = new DependencyGraph();
    }
    return DependencyGraph.instance;
  }

  private nodes: Map<string, ServiceNode> = new Map();
  private edges: Map<string, DependencyEdge> = new Map();
  private outgoingAdjacency: Map<string, Set<string>> = new Map();
  private incomingAdjacency: Map<string, Set<string>> = new Map();

  constructor(initialNodes?: ServiceNode[], initialEdges?: DependencyEdge[]) {
    if (initialNodes) {
      initialNodes.forEach((node) => this.addNode(node));
    }
    if (initialEdges) {
      initialEdges.forEach((edge) => this.addEdge(edge));
    }
  }

  /**
   * Register or update a service node in the graph
   */
  public addNode(node: ServiceNode): void {
    this.nodes.set(node.id, { ...node });
    if (!this.outgoingAdjacency.has(node.id)) {
      this.outgoingAdjacency.set(node.id, new Set());
    }
    if (!this.incomingAdjacency.has(node.id)) {
      this.incomingAdjacency.set(node.id, new Set());
    }
  }

  /**
   * Remove a service node and its connected dependency edges
   */
  public removeNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) {
      return false;
    }

    this.nodes.delete(nodeId);

    // Remove connected edges
    const edgesToRemove: string[] = [];
    this.edges.forEach((edge, edgeId) => {
      if (edge.sourceId === nodeId || edge.targetId === nodeId) {
        edgesToRemove.push(edgeId);
      }
    });

    edgesToRemove.forEach((edgeId) => this.removeEdge(edgeId));
    this.outgoingAdjacency.delete(nodeId);
    this.incomingAdjacency.delete(nodeId);

    return true;
  }

  /**
   * Connect a dependency between two services (Source depends on Target)
   */
  public addEdge(edge: DependencyEdge): void {
    if (!this.nodes.has(edge.sourceId) || !this.nodes.has(edge.targetId)) {
      throw new Error(
        `Cannot create dependency edge ${edge.id}: Node ${
          !this.nodes.has(edge.sourceId) ? edge.sourceId : edge.targetId
        } does not exist.`
      );
    }

    this.edges.set(edge.id, { ...edge });
    this.outgoingAdjacency.get(edge.sourceId)?.add(edge.targetId);
    this.incomingAdjacency.get(edge.targetId)?.add(edge.sourceId);
  }

  /**
   * Remove a specific dependency edge
   */
  public removeEdge(edgeId: string): boolean {
    const edge = this.edges.get(edgeId);
    if (!edge) return false;

    this.edges.delete(edgeId);
    this.outgoingAdjacency.get(edge.sourceId)?.delete(edge.targetId);
    this.incomingAdjacency.get(edge.targetId)?.delete(edge.sourceId);
    return true;
  }

  public getNode(nodeId: string): ServiceNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): ServiceNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): DependencyEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Clears all nodes and edges from the graph
   */
  public clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.outgoingAdjacency.clear();
    this.incomingAdjacency.clear();
  }

  /**
   * Cycle detection using DFS to prevent deadlock/circular dependency loops
   */
  public detectCycles(): { hasCycle: boolean; cyclePath: string[] } {
    const visited = new Map<string, 'UNVISITED' | 'VISITING' | 'VISITED'>();
    const parent = new Map<string, string | null>();
    let cycleStart: string | null = null;
    let cycleEnd: string | null = null;

    this.nodes.forEach((_, id) => visited.set(id, 'UNVISITED'));

    const dfs = (u: string): boolean => {
      visited.set(u, 'VISITING');
      const neighbors = this.outgoingAdjacency.get(u) || new Set();

      for (const v of neighbors) {
        if (visited.get(v) === 'UNVISITED') {
          parent.set(v, u);
          if (dfs(v)) return true;
        } else if (visited.get(v) === 'VISITING') {
          cycleStart = v;
          cycleEnd = u;
          return true;
        }
      }

      visited.set(u, 'VISITED');
      return false;
    };

    for (const [nodeId] of this.nodes) {
      if (visited.get(nodeId) === 'UNVISITED') {
        if (dfs(nodeId)) {
          const cyclePath: string[] = [];
          if (cycleEnd && cycleStart) {
            let curr: string | null = cycleEnd;
            cyclePath.push(cycleStart);
            while (curr && curr !== cycleStart) {
              cyclePath.push(curr);
              curr = parent.get(curr) || null;
            }
            cyclePath.push(cycleStart);
            cyclePath.reverse();
          }
          return { hasCycle: true, cyclePath };
        }
      }
    }

    return { hasCycle: false, cyclePath: [] };
  }

  /**
   * Topological Sort to establish execution/initialization sequence
   */
  public getTopologicalOrder(): string[] {
    const inDegree = new Map<string, number>();
    this.nodes.forEach((_, id) => inDegree.set(id, 0));

    this.edges.forEach((edge) => {
      inDegree.set(edge.targetId, (inDegree.get(edge.targetId) || 0) + 1);
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);

      const neighbors = this.outgoingAdjacency.get(u) || new Set();
      neighbors.forEach((v) => {
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      });
    }

    if (order.length !== this.nodes.size) {
      // Cycle present, return partial or fallback order
      return Array.from(this.nodes.keys());
    }

    return order;
  }

  /**
   * Analyzes node dependencies, fan-in/fan-out metrics, latency, and health to score bottlenecks
   */
  public analyzeBottlenecks(): BottleneckReport[] {
    const reports: BottleneckReport[] = [];

    this.nodes.forEach((node, id) => {
      const fanIn = (this.incomingAdjacency.get(id) || new Set()).size;
      const fanOut = (this.outgoingAdjacency.get(id) || new Set()).size;

      const reasons: string[] = [];
      let score = 0;

      // High Fan-in increases risk score (Many dependent systems rely on this)
      if (fanIn > 5) {
        score += 30;
        reasons.push(`High fan-in count (${fanIn} dependents)`);
      } else if (fanIn > 2) {
        score += 15;
      }

      // Health penalties
      if (node.healthStatus === 'DEGRADED') {
        score += 35;
        reasons.push('Service state is currently DEGRADED');
      } else if (node.healthStatus === 'UNHEALTHY') {
        score += 50;
        reasons.push('Service state is UNHEALTHY');
      }

      // Latency impact
      if (node.baseLatencyMs > 500) {
        score += 25;
        reasons.push(`High base latency (${node.baseLatencyMs}ms)`);
      } else if (node.baseLatencyMs > 200) {
        score += 10;
      }

      // Low capacity RPS with high demand
      if (node.maxRps < 100) {
        score += 15;
        reasons.push(`Low maximum throughput throughput limit (${node.maxRps} RPS)`);
      }

      // Criticality factor
      if (node.criticality === 'CRITICAL') {
        score *= 1.25;
      }

      const finalScore = Math.min(100, Math.round(score));
      let cascadingFailureRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

      if (finalScore >= 75) cascadingFailureRisk = 'CRITICAL';
      else if (finalScore >= 50) cascadingFailureRisk = 'HIGH';
      else if (finalScore >= 25) cascadingFailureRisk = 'MEDIUM';

      // Estimate latency impact based on dependents
      const estimatedLatencyImpactMs = node.baseLatencyMs * (1 + fanIn * 0.2);

      reports.push({
        nodeId: id,
        nodeName: node.name,
        bottleneckScore: finalScore,
        fanIn,
        fanOut,
        cascadingFailureRisk,
        estimatedLatencyImpactMs: Math.round(estimatedLatencyImpactMs),
        reasons: reasons.length > 0 ? reasons : ['Optimal baseline metrics'],
      });
    });

    return reports.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  }

  /**
   * Find critical paths through the dependency chain to determine longest execution latency
   */
  public findCriticalPath(startNodeId: string, endNodeId: string): CriticalPathResult {
    const memo = new Map<string, { latency: number; path: string[] }>();

    const findMaxPath = (curr: string): { latency: number; path: string[] } => {
      if (curr === endNodeId) {
        const currNode = this.nodes.get(curr);
        return { latency: currNode?.baseLatencyMs || 0, path: [curr] };
      }

      if (memo.has(curr)) {
        return memo.get(curr)!;
      }

      const neighbors = this.outgoingAdjacency.get(curr) || new Set();
      let maxSubPathLatency = -1;
      let bestSubPath: string[] = [];

      for (const next of neighbors) {
        const edge = Array.from(this.edges.values()).find(
          (e) => e.sourceId === curr && e.targetId === next
        );
        const edgeWeight = edge ? edge.weight : 1;

        const subResult = findMaxPath(next);
        if (subResult.path.length > 0) {
          const totalSubLatency = subResult.latency * edgeWeight;
          if (totalSubLatency > maxSubPathLatency) {
            maxSubPathLatency = totalSubLatency;
            bestSubPath = subResult.path;
          }
        }
      }

      if (maxSubPathLatency === -1) {
        memo.set(curr, { latency: 0, path: [] });
        return { latency: 0, path: [] };
      }

      const currNode = this.nodes.get(curr);
      const totalLatency = (currNode?.baseLatencyMs || 0) + maxSubPathLatency;
      const result = { latency: totalLatency, path: [curr, ...bestSubPath] };
      memo.set(curr, result);
      return result;
    };

    const criticalPath = findMaxPath(startNodeId);
    let containsUnhealthyNode = false;
    let chokePointNodeId: string | undefined;
    let maxIndividualLatency = 0;

    criticalPath.path.forEach((id) => {
      const node = this.nodes.get(id);
      if (node) {
        if (node.healthStatus === 'UNHEALTHY' || node.healthStatus === 'DEGRADED') {
          containsUnhealthyNode = true;
        }
        if (node.baseLatencyMs > maxIndividualLatency) {
          maxIndividualLatency = node.baseLatencyMs;
          chokePointNodeId = node.id;
        }
      }
    });

    return {
      path: criticalPath.path,
      totalLatencyMs: criticalPath.latency,
      containsUnhealthyNode,
      chokePointNodeId,
    };
  }

  /**
   * Simulates a scenario where a specific service goes down
   */
  public simulateServiceFailure(failingNodeId: string): SimulationResult {
    const affectedServices = new Set<string>();
    const resilientWithFallbacks = new Set<string>();
    const queue: string[] = [failingNodeId];
    const visited = new Set<string>([failingNodeId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = this.incomingAdjacency.get(current) || new Set();

      dependents.forEach((depId) => {
        const connectingEdge = Array.from(this.edges.values()).find(
          (e) => e.sourceId === depId && e.targetId === current
        );

        if (connectingEdge?.fallbackNodeId) {
          resilientWithFallbacks.add(depId);
        } else if (connectingEdge?.isBlocking ?? true) {
          affectedServices.add(depId);
          if (!visited.has(depId)) {
            visited.add(depId);
            queue.push(depId);
          }
        }
      });
    }

    const isolatedServices: string[] = [];
    this.nodes.forEach((_, id) => {
      if (!visited.has(id) && id !== failingNodeId) {
        const deps = this.outgoingAdjacency.get(id) || new Set();
        if (deps.has(failingNodeId) && (this.incomingAdjacency.get(id) || new Set()).size === 0) {
          isolatedServices.push(id);
        }
      }
    });

    const degradationPct = (affectedServices.size / Math.max(1, this.nodes.size - 1)) * 100;

    return {
      failedNodeId: failingNodeId,
      affectedServices: Array.from(affectedServices),
      isolatedServices,
      systemDegradationPercentage: Math.round(degradationPct * 100) / 100,
      resilientWithFallbacks: Array.from(resilientWithFallbacks),
    };
  }

  /**
   * Creates a default Graph snapshot with standard system modules
   */
  public static createStandardOkoGraph(): DependencyGraph {
    const nodes: ServiceNode[] = [
      { id: 'auth-vault', name: 'Vault & Auth Middleware', category: 'auth', healthStatus: 'HEALTHY', baseLatencyMs: 15, maxRps: 5000, criticality: 'CRITICAL' },
      { id: 'db-astra', name: 'AstraDB Vector Engine', category: 'database', healthStatus: 'HEALTHY', baseLatencyMs: 45, maxRps: 2000, criticality: 'HIGH' },
      { id: 'citi-gateway', name: 'Citi Direct Connect Gateway', category: 'gateway', healthStatus: 'HEALTHY', baseLatencyMs: 120, maxRps: 800, criticality: 'HIGH' },
      { id: 'alpaca-service', name: 'Alpaca Brokerage Execution', category: 'service', healthStatus: 'HEALTHY', baseLatencyMs: 85, maxRps: 1200, criticality: 'HIGH' },
      { id: 'modern-treasury', name: 'Modern Treasury Service', category: 'service', healthStatus: 'HEALTHY', baseLatencyMs: 110, maxRps: 600, criticality: 'MEDIUM' },
      { id: 'zkp-engine', name: 'Zero-Knowledge Proof Engine', category: 'service', healthStatus: 'HEALTHY', baseLatencyMs: 250, maxRps: 300, criticality: 'MEDIUM' },
      { id: 'azure-gov', name: 'Azure Gov Compliance Bridge', category: 'bridge', healthStatus: 'HEALTHY', baseLatencyMs: 95, maxRps: 1500, criticality: 'HIGH' },
      { id: 'sovereign-ai', name: 'Sovereign AI Agent Factory', category: 'api', healthStatus: 'HEALTHY', baseLatencyMs: 320, maxRps: 400, criticality: 'CRITICAL' },
      { id: 'plaid-bridge', name: 'Plaid Settlement Bridge', category: 'bridge', healthStatus: 'HEALTHY', baseLatencyMs: 140, maxRps: 900, criticality: 'MEDIUM' },
    ];

    const edges: DependencyEdge[] = [
      { id: 'e1', sourceId: 'sovereign-ai', targetId: 'auth-vault', protocol: 'RPC', weight: 1.0, isBlocking: true, timeoutMs: 2000 },
      { id: 'e2', sourceId: 'sovereign-ai', targetId: 'db-astra', protocol: 'gRPC', weight: 1.2, isBlocking: false, timeoutMs: 3000 },
      { id: 'e3', sourceId: 'alpaca-service', targetId: 'auth-vault', protocol: 'REST', weight: 1.0, isBlocking: true, timeoutMs: 1500 },
      { id: 'e4', sourceId: 'citi-gateway', targetId: 'azure-gov', protocol: 'REST', weight: 1.5, isBlocking: true, timeoutMs: 5000 },
      { id: 'e5', sourceId: 'modern-treasury', targetId: 'citi-gateway', protocol: 'REST', weight: 1.1, isBlocking: true, timeoutMs: 4000 },
      { id: 'e6', sourceId: 'sovereign-ai', targetId: 'zkp-engine', protocol: 'RPC', weight: 1.8, isBlocking: false, timeoutMs: 6000 },
      { id: 'e7', sourceId: 'plaid-bridge', targetId: 'modern-treasury', protocol: 'EVENT', weight: 1.0, isBlocking: false, timeoutMs: 2500 },
    ];

    return new DependencyGraph(nodes, edges);
  }
}

// Global instance of the dependency graph
export const globalGraph = DependencyGraph.createStandardOkoGraph();

// Validation helpers
function validateServiceNode(body: any): string | null {
  if (!body.id || typeof body.id !== 'string') return 'Missing or invalid id';
  if (!body.name || typeof body.name !== 'string') return 'Missing or invalid name';
  if (!body.category || !['api', 'service', 'database', 'gateway', 'queue', 'bridge', 'auth'].includes(body.category)) {
    return 'Missing or invalid category';
  }
  if (!body.healthStatus || !['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN'].includes(body.healthStatus)) {
    return 'Missing or invalid healthStatus';
  }
  if (typeof body.baseLatencyMs !== 'number') return 'Missing or invalid baseLatencyMs';
  if (typeof body.maxRps !== 'number') return 'Missing or invalid maxRps';
  if (!body.criticality || !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(body.criticality)) {
    return 'Missing or invalid criticality';
  }
  return null;
}

function validateDependencyEdge(body: any): string | null {
  if (!body.id || typeof body.id !== 'string') return 'Missing or invalid id';
  if (!body.sourceId || typeof body.sourceId !== 'string') return 'Missing or invalid sourceId';
  if (!body.targetId || typeof body.targetId !== 'string') return 'Missing or invalid targetId';
  if (!body.protocol || !['REST', 'gRPC', 'WEBSOCKET', 'SQL', 'EVENT', 'RPC'].includes(body.protocol)) {
    return 'Missing or invalid protocol';
  }
  if (typeof body.weight !== 'number') return 'Missing or invalid weight';
  if (typeof body.isBlocking !== 'boolean') return 'Missing or invalid isBlocking';
  if (typeof body.timeoutMs !== 'number') return 'Missing or invalid timeoutMs';
  return null;
}

// Express Router exposing the DependencyGraph API
const router = Router();

router.get('/nodes', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: globalGraph.getAllNodes() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/nodes/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const node = globalGraph.getNode(id);
    if (!node) {
      return res.status(404).json({ success: false, error: `Node with ID ${id} not found` });
    }
    res.json({ success: true, data: node });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/nodes', (req: Request, res: Response) => {
  try {
    const validationError = validateServiceNode(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }
    globalGraph.addNode(req.body);
    res.status(201).json({ success: true, message: `Node ${req.body.id} added/updated successfully`, data: req.body });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/nodes/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const removed = globalGraph.removeNode(id);
    if (!removed) {
      return res.status(404).json({ success: false, error: `Node with ID ${id} not found` });
    }
    res.json({ success: true, message: `Node ${id} and its connected edges removed successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/edges', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: globalGraph.getAllEdges() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/edges', (req: Request, res: Response) => {
  try {
    const validationError = validateDependencyEdge(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }
    globalGraph.addEdge(req.body);
    res.status(201).json({ success: true, message: `Edge ${req.body.id} added successfully`, data: req.body });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/edges/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const removed = globalGraph.removeEdge(id);
    if (!removed) {
      return res.status(404).json({ success: false, error: `Edge with ID ${id} not found` });
    }
    res.json({ success: true, message: `Edge ${id} removed successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cycles', (req: Request, res: Response) => {
  try {
    const result = globalGraph.detectCycles();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/topological-order', (req: Request, res: Response) => {
  try {
    const order = globalGraph.getTopologicalOrder();
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bottlenecks', (req: Request, res: Response) => {
  try {
    const reports = globalGraph.analyzeBottlenecks();
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/critical-path', (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameters "start" and "end" are required and must be strings' });
    }
    const result = globalGraph.findCriticalPath(start, end);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/simulate-failure/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = globalGraph.simulateServiceFailure(id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reset', (req: Request, res: Response) => {
  try {
    globalGraph.clear();
    const standard = DependencyGraph.createStandardOkoGraph();
    standard.getAllNodes().forEach(node => globalGraph.addNode(node));
    standard.getAllEdges().forEach(edge => globalGraph.addEdge(edge));
    res.json({ success: true, message: 'Graph reset to standard baseline configuration', data: { nodes: globalGraph.getAllNodes(), edges: globalGraph.getAllEdges() } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as dependencyGraphRouter };
export default DependencyGraph;