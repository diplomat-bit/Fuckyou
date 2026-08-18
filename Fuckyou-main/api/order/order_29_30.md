import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export class DeployFirmwareDto {
  @ApiProperty({ example: '10.148.32.0/24', description: 'Target subnet for ATVN deployment' })
  @IsString()
  @IsNotEmpty()
  subnet: string;

  @ApiProperty({ example: 'atvn_core_v1.0.0_stable.bin', description: 'Firmware binary filename' })
  @IsString()
  @IsNotEmpty()
  firmwareImage: string;

  @ApiProperty({ example: '-----BEGIN RSA PRIVATE KEY-----\n...', description: 'Signature key for authentication' })
  @IsString()
  @IsNotEmpty()
  signatureKey: string;
}

export class TelemetryDataDto {
  @ApiProperty({ example: 'node-atvn-12', description: 'Unique identifier of the ATVN node' })
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @ApiProperty({ example: -34.5, description: 'Ambient air temperature in Celsius' })
  @IsNumber()
  ambientTemp: number;

  @ApiProperty({ example: -3.2, description: 'Permafrost thermal gradient temperature in Celsius' })
  @IsNumber()
  permafrostTemp: number;

  @ApiProperty({ example: 1012.4, description: 'Barometric pressure in millibars' })
  @IsNumber()
  barometricPressure: number;

  @ApiProperty({ example: 40.2, description: 'Wind speed in knots' })
  @IsNumber()
  windSpeed: number;
}

export class LockoutProtocolDto {
  @ApiProperty({ example: '0x8F3C2A9E5B7D1C3A', description: 'Cryptographic master key to inject' })
  @IsString()
  @IsNotEmpty()
  masterKey: string;

  @ApiProperty({ example: true, description: 'Confirm disabling of default SSH access' })
  @IsBoolean()
  disableSsh: boolean;

  @ApiProperty({ example: true, description: 'Confirm removal of military root certificates' })
  @IsBoolean()
  removeRootCerts: boolean;
}

// ==========================================
// Interfaces & Types
// ==========================================

export interface AtvnNodeStatus {
  nodeId: string;
  ipAddress: string;
  status: 'ACTIVE' | 'OFFLINE' | 'DEGRADED' | 'LOCKED';
  firmwareVersion: string;
  batteryLevel: number;
  routingMode: 'P2P_MESH' | 'SATELLITE_BYPASS' | 'GROUND_WAVE_ONLY';
  peers: string[];
}

// ==========================================
// Service Layer
// ==========================================

export class Order2930Service {
  private nodes: Map<string, AtvnNodeStatus> = new Map();
  private telemetryLogs: TelemetryDataDto[] = [];
  private auditLogs: string[] = [];

  constructor() {
    // Initialize mock ATVN nodes based on the Toolik Field Station deployment
    for (let i = 1; i <= 24; i++) {
      const id = `node-atvn-${i.toString().padStart(2, '0')}`;
      this.nodes.set(id, {
        nodeId: id,
        ipAddress: `10.148.32.${10 + i}`,
        status: 'ACTIVE',
        firmwareVersion: 'v1.0.4-beta',
        batteryLevel: 92 - i,
        routingMode: 'P2P_MESH',
        peers: [],
      });
    }
    this.recalculateMeshTopology();
  }

  private recalculateMeshTopology() {
    const nodeIds = Array.from(this.nodes.keys());
    for (const [id, node] of this.nodes.entries()) {
      const index = nodeIds.indexOf(id);
      const peers: string[] = [];
      if (index > 0) peers.push(nodeIds[index - 1]);
      if (index < nodeIds.length - 1) peers.push(nodeIds[index + 1]);
      node.peers = peers;
    }
  }

  async deployFirmware(dto: DeployFirmwareDto): Promise<{ success: boolean; updatedNodes: string[]; log: string[] }> {
    const log: string[] = [];
    const updatedNodes: string[] = [];
    log.push(`[+] Scanning for active ATVN nodes on subnet ${dto.subnet}...`);

    for (const [id, node] of this.nodes.entries()) {
      if (node.status === 'ACTIVE') {
        log.push(`[+] Deploying to node: ${node.ipAddress}`);
        node.firmwareVersion = 'v1.0.0-stable';
        node.routingMode = 'SATELLITE_BYPASS';
        updatedNodes.push(id);
      }
    }

    this.auditLogs.push(`Firmware deployment initiated on subnet ${dto.subnet} using image ${dto.firmwareImage}`);
    return { success: true, updatedNodes, log };
  }

  async getNodes(): Promise<AtvnNodeStatus[]> {
    return Array.from(this.nodes.values());
  }

  async triggerReroute(nodeId: string): Promise<{ nodeId: string; optimalPath: string[] }> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new HttpException(`Node ${nodeId} not found`, HttpStatus.NOT_FOUND);
    }

    const optimalPath = [nodeId, ...node.peers, 'gateway-coast-01'];
    this.auditLogs.push(`Cognitive Q-Learning reroute triggered for node ${nodeId}`);
    return { nodeId, optimalPath };
  }

  async ingestTelemetry(dto: TelemetryDataDto): Promise<{ success: boolean; timestamp: string }> {
    const node = this.nodes.get(dto.nodeId);
    if (!node) {
      throw new HttpException(`Node ${dto.nodeId} not found`, HttpStatus.NOT_FOUND);
    }

    this.telemetryLogs.push(dto);
    return { success: true, timestamp: new Date().toISOString() };
  }

  async executeLockout(dto: LockoutProtocolDto): Promise<{ success: boolean; status: string; lockedNodes: string[] }> {
    const lockedNodes: string[] = [];
    for (const [id, node] of this.nodes.entries()) {
      node.status = 'LOCKED';
      node.routingMode = 'GROUND_WAVE_ONLY';
      lockedNodes.push(id);
    }

    this.auditLogs.push(`EMERGENCY LOCKOUT PROTOCOL EXECUTED. Master Key: ${dto.masterKey.substring(0, 6)}...`);
    return {
      success: true,
      status: 'All nodes locked, SSH disabled, military root certificates removed.',
      lockedNodes,
    };
  }

  async getComplianceReport(): Promise<{ vanguardAudit: string; consortiumAudit: string; logs: string[] }> {
    return {
      vanguardAudit: 'FAIL - Diverted $4.2M in federal grants to private security overhead and tactical gear.',
      consortiumAudit: 'WARNING - 78% of physical sensors degraded due to moisture intrusion and lack of maintenance.',
      logs: this.auditLogs,
    };
  }
}

// ==========================================
// Controller Layer
// ==========================================

@ApiTags('Executive Order SEC-029 & SEC-030 (Arctic Security & Sovereignty)')
@Controller('order-29-30')
export class Order2930Controller {
  constructor(private readonly service: Order2930Service) {}

  @Post('deploy')
  @ApiOperation({ summary: 'Deploy decentralized firmware to ATVN nodes (EO-SEC-029)' })
  @ApiResponse({ status: 201, description: 'Firmware successfully deployed and flashed.' })
  async deployFirmware(@Body() dto: DeployFirmwareDto) {
    return this.service.deployFirmware(dto);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Retrieve status of all active ATVN nodes' })
  @ApiResponse({ status: 200, description: 'List of active nodes and their current state.' })
  async getNodes() {
    return this.service.getNodes();
  }

  @Post('nodes/:id/reroute')
  @ApiOperation({ summary: 'Trigger cognitive Q-learning rerouting for a specific node' })
  @ApiResponse({ status: 200, description: 'Optimal path calculated.' })
  async triggerReroute(@Param('id') id: string) {
    return this.service.triggerReroute(id);
  }

  @Post('telemetry')
  @ApiOperation({ summary: 'Ingest environmental and permafrost telemetry data (EO-SEC-030)' })
  @ApiResponse({ status: 201, description: 'Telemetry data successfully recorded.' })
  async ingestTelemetry(@Body() dto: TelemetryDataDto) {
    return this.service.ingestTelemetry(dto);
  }

  @Post('lockout')
  @ApiOperation({ summary: 'Execute emergency lockout protocol and sever external backdoors' })
  @ApiResponse({ status: 200, description: 'Lockout complete. Nodes transitioned to autonomous state.' })
  async executeLockout(@Body() dto: LockoutProtocolDto) {
    return this.service.executeLockout(dto);
  }

  @Get('compliance')
  @ApiOperation({ summary: 'Retrieve regulatory compliance and audit logs' })
  @ApiResponse({ status: 200, description: 'Compliance report for Vanguard and Arctic Research Consortium.' })
  async getComplianceReport() {
    return this.service.getComplianceReport();
  }
}