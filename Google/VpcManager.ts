import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { monitor } from './MonitoringService';

/**
 * VpcManager: A sovereign network isolation layer.
 * Replaces GCP VPC by managing virtual network segments, 
 * firewall rules, and encrypted tunnel routing at the application level.
 */

export interface NetworkSegment {
  id: string;
  name: string;
  cidr: string;
  isIsolated: boolean;
  allowedPeers: string[];
}

export interface FirewallRule {
  id: string;
  segmentId: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ALL';
  port: number | 'ALL';
  action: 'ALLOW' | 'DENY';
  source: string;
}

class VpcManager extends EventEmitter {
  private segments: Map<string, NetworkSegment> = new Map();
  private firewallRules: Map<string, FirewallRule> = new Map();

  constructor() {
    super();
    // Automatically set up default sovereign VPC topology to make all services work together
    this.setupDefaultSovereignVpc();
  }

  public createSegment(name: string, cidr: string): NetworkSegment {
    const segment: NetworkSegment = {
      id: uuidv4(),
      name,
      cidr,
      isIsolated: true,
      allowedPeers: []
    };
    this.segments.set(segment.id, segment);
    this.emit('segmentCreated', segment);
    monitor.log('info', 'VpcManager', `Network segment created: ${name} (${cidr})`, { segmentId: segment.id });
    return segment;
  }

  public removeSegment(id: string): boolean {
    const segment = this.segments.get(id);
    if (segment) {
      this.segments.delete(id);
      // Remove associated firewall rules
      for (const [ruleId, rule] of this.firewallRules.entries()) {
        if (rule.segmentId === id) {
          this.firewallRules.delete(ruleId);
        }
      }
      // Remove from peers
      for (const seg of this.segments.values()) {
        seg.allowedPeers = seg.allowedPeers.filter(peerId => peerId !== id);
      }
      this.emit('segmentRemoved', segment);
      monitor.log('info', 'VpcManager', `Network segment removed: ${segment.name}`);
      return true;
    }
    return false;
  }

  public addFirewallRule(rule: Omit<FirewallRule, 'id'>): string {
    const id = uuidv4();
    const newRule = { ...rule, id };
    this.firewallRules.set(id, newRule);
    monitor.log('info', 'VpcManager', `Firewall rule added for segment ${rule.segmentId}: ${rule.action} ${rule.protocol} on port ${rule.port}`);
    return id;
  }

  public removeFirewallRule(id: string): boolean {
    if (this.firewallRules.has(id)) {
      this.firewallRules.delete(id);
      monitor.log('info', 'VpcManager', `Firewall rule removed: ${id}`);
      return true;
    }
    return false;
  }

  public listFirewallRules(segmentId?: string): FirewallRule[] {
    const rules = Array.from(this.firewallRules.values());
    if (segmentId) {
      return rules.filter(r => r.segmentId === segmentId);
    }
    return rules;
  }

  public addPeering(segmentId1: string, segmentId2: string): void {
    const seg1 = this.segments.get(segmentId1);
    const seg2 = this.segments.get(segmentId2);
    if (seg1 && seg2) {
      if (!seg1.allowedPeers.includes(segmentId2)) {
        seg1.allowedPeers.push(segmentId2);
      }
      if (!seg2.allowedPeers.includes(segmentId1)) {
        seg2.allowedPeers.push(segmentId1);
      }
      this.emit('peeringCreated', { segmentId1, segmentId2 });
      monitor.log('info', 'VpcManager', `Peering established between ${seg1.name} and ${seg2.name}`);
    }
  }

  public removePeering(segmentId1: string, segmentId2: string): void {
    const seg1 = this.segments.get(segmentId1);
    const seg2 = this.segments.get(segmentId2);
    if (seg1 && seg2) {
      seg1.allowedPeers = seg1.allowedPeers.filter(id => id !== segmentId2);
      seg2.allowedPeers = seg2.allowedPeers.filter(id => id !== segmentId1);
      this.emit('peeringRemoved', { segmentId1, segmentId2 });
      monitor.log('info', 'VpcManager', `Peering removed between ${seg1.name} and ${seg2.name}`);
    }
  }

  public validateTraffic(sourceSegmentId: string, targetSegmentId: string, port: number | 'ALL', protocol: 'TCP' | 'UDP' | 'ICMP' | 'ALL' = 'TCP'): boolean {
    const source = this.segments.get(sourceSegmentId);
    const target = this.segments.get(targetSegmentId);

    if (!source || !target) {
      monitor.log('warn', 'VpcManager', `Traffic validation failed: Source (${sourceSegmentId}) or Target (${targetSegmentId}) segment not found.`);
      return false;
    }

    // Check if target is isolated and not in allowed peers
    if (target.isIsolated && !target.allowedPeers.includes(sourceSegmentId)) {
      monitor.log('warn', 'VpcManager', `Traffic blocked: ${source.name} is not peered with isolated segment ${target.name}.`);
      return false;
    }

    // Check firewall rules
    const applicableRules = Array.from(this.firewallRules.values()).filter(r => 
      r.segmentId === targetSegmentId && 
      (r.port === 'ALL' || r.port === port) &&
      (r.protocol === 'ALL' || r.protocol === protocol)
    );
    
    for (const rule of applicableRules) {
      if (rule.action === 'DENY') {
        monitor.log('warn', 'VpcManager', `Traffic blocked by DENY rule: ${source.name} -> ${target.name} on port ${port}`);
        return false;
      }
    }

    monitor.log('info', 'VpcManager', `Traffic allowed: ${source.name} -> ${target.name} on port ${port}`);
    return true;
  }

  public getSegment(id: string): NetworkSegment | undefined {
    return this.segments.get(id);
  }

  public listSegments(): NetworkSegment[] {
    return Array.from(this.segments.values());
  }

  public updateIsolationStatus(segmentId: string, status: boolean): void {
    const segment = this.segments.get(segmentId);
    if (segment) {
      segment.isIsolated = status;
      this.emit('segmentUpdated', segment);
      monitor.log('info', 'VpcManager', `Isolation status updated for segment ${segmentId}: ${status}`);
    }
  }

  /**
   * Establishes the default secure network topology for all local sovereign services.
   */
  public setupDefaultSovereignVpc(): void {
    // Create default segments
    const mgmt = this.createSegment('management-segment', '10.0.1.0/24');
    const compute = this.createSegment('compute-segment', '10.0.2.0/24');
    const storage = this.createSegment('storage-segment', '10.0.3.0/24');
    const database = this.createSegment('database-segment', '10.0.4.0/24');
    const ai = this.createSegment('ai-segment', '10.0.5.0/24');

    // Disable strict isolation for management to allow it to peer with others
    this.updateIsolationStatus(mgmt.id, false);

    // Peer compute with storage, database, and AI
    this.addPeering(compute.id, storage.id);
    this.addPeering(compute.id, database.id);
    this.addPeering(compute.id, ai.id);

    // Add default firewall rules
    // Management access
    this.addFirewallRule({
      segmentId: mgmt.id,
      protocol: 'TCP',
      port: 443,
      action: 'ALLOW',
      source: '0.0.0.0/0'
    });

    // Compute to Database (Postgres/SQLite bridge)
    this.addFirewallRule({
      segmentId: database.id,
      protocol: 'TCP',
      port: 5432,
      action: 'ALLOW',
      source: compute.cidr
    });

    // Compute to Storage (MinIO/S3)
    this.addFirewallRule({
      segmentId: storage.id,
      protocol: 'TCP',
      port: 9000,
      action: 'ALLOW',
      source: compute.cidr
    });

    // Compute to AI (Ollama/Local LLM)
    this.addFirewallRule({
      segmentId: ai.id,
      protocol: 'TCP',
      port: 11434,
      action: 'ALLOW',
      source: compute.cidr
    });

    monitor.log('info', 'VpcManager', 'Default Sovereign VPC topology successfully established and secured.');
  }
}

export const vpcManager = new VpcManager();
export default vpcManager;