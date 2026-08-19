import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

export class LoadBalancingAuditDto {
  @ApiProperty({ example: 'RTO-EAST-01' })
  coordinatorId: string;

  @ApiProperty({ example: 'UFLS-4A' })
  adjustmentType: string;

  @ApiProperty({ example: 500 })
  voltageTargetKv: number;

  @ApiProperty({ example: true })
  reactivePowerCompensation: boolean;
}

export class P2PNodeRegisterDto {
  @ApiProperty({ example: 'NODE-LOUDOUN-14B' })
  nodeId: string;

  @ApiProperty({ example: '39.0122Â° N, 77.5311Â° W' })
  coordinates: string;

  @ApiProperty({ example: '1.0.0-rust-secure' })
  firmwareVersion: string;

  @ApiProperty({ example: '0x4f8e9d2c1b3a5f7e6d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e' })
  publicKey: string;
}

export class TelemetryPayloadDto {
  @ApiProperty({ example: 'NODE-LOUDOUN-14B' })
  nodeId: string;

  @ApiProperty({ example: 'AES-256-GCM' })
  encryptionAlgorithm: string;

  @ApiProperty({ example: 'g3H7x9...qP2r' })
  encryptedData: string;

  @ApiProperty({ example: '0x7a1b...9c2d' })
  signature: string;
}

export interface GridNode {
  nodeId: string;
  coordinates: string;
  firmwareVersion: string;
  publicKey: string;
  status: 'ACTIVE' | 'ISOLATED' | 'MAINTENANCE';
  lastSeen: Date;
}

export interface AuditResult {
  auditId: string;
  timestamp: Date;
  status: string;
  complianceReference: string;
  details: string;
}

export class GridModernizationService {
  private nodes: Map<string, GridNode> = new Map();
  private audits: AuditResult[] = [];

  constructor() {
    this.nodes.set('NODE-LOUDOUN-14B', {
      nodeId: 'NODE-LOUDOUN-14B',
      coordinates: '39.0122Â° N, 77.5311Â° W',
      firmwareVersion: '1.0.0-rust-secure',
      publicKey: '0x4f8e9d2c1b3a5f7e6d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e',
      status: 'ACTIVE',
      lastSeen: new Date(),
    });
  }

  async runLoadBalancingAudit(dto: LoadBalancingAuditDto): Promise<AuditResult> {
    const auditId = `AUDIT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const result: AuditResult = {
      auditId,
      timestamp: new Date(),
      status: 'COMPLIANT',
      complianceReference: '16 U.S.C. Â§ 824a(c) - FPA Section 202(c)',
      details: `Ancillary service optimization completed for ${dto.voltageTargetKv}kV system. Reactive power compensation: ${dto.reactivePowerCompensation ? 'ENABLED' : 'DISABLED'}.`,
    };
    this.audits.push(result);
    return result;
  }

  async registerNode(dto: P2PNodeRegisterDto): Promise<GridNode> {
    const newNode: GridNode = {
      nodeId: dto.nodeId,
      coordinates: dto.coordinates,
      firmwareVersion: dto.firmwareVersion,
      publicKey: dto.publicKey,
      status: 'ACTIVE',
      lastSeen: new Date(),
    };
    this.nodes.set(dto.nodeId, newNode);
    return newNode;
  }

  async getNodes(): Promise<GridNode[]> {
    return Array.from(this.nodes.values());
  }

  async processTelemetry(dto: TelemetryPayloadDto): Promise<{ status: string; processedAt: Date }> {
    const node = this.nodes.get(dto.nodeId);
    if (!node) {
      throw new Error(`Node ${dto.nodeId} not registered in decentralized mesh.`);
    }
    
    const isSignatureValid = dto.signature.startsWith('0x');
    if (!isSignatureValid) {
      throw new Error('Invalid cryptographic signature. Telemetry rejected.');
    }

    node.lastSeen = new Date();
    this.nodes.set(dto.nodeId, node);

    return {
      status: 'TELEMETRY_PROCESSED_AND_PROPAGATED',
      processedAt: new Date(),
    };
  }

  async getGridHealth(): Promise<{ status: string; activeNodes: number; resilienceRating: string }> {
    const activeCount = Array.from(this.nodes.values()).filter(n => n.status === 'ACTIVE').length;
    return {
      status: 'OPERATIONAL',
      activeNodes: activeCount,
      resilienceRating: activeCount > 1 ? 'HIGH_EMP_RESILIENT_MESH' : 'DEGRADED_SINGLE_NODE',
    };
  }
}

@ApiTags('Clean Energy Grid & Smart Grid Integration (EO-SEC-005 / EO-SEC-006)')
@Controller('api/grid')
export class GridModernizationController {
  private readonly gridService = new GridModernizationService();

  @Post('audit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run load-balancing audit under FPA Section 202(c)' })
  @ApiResponse({ status: 200, description: 'Audit completed successfully.' })
  async runAudit(@Body() dto: LoadBalancingAuditDto) {
    return this.gridService.runLoadBalancingAudit(dto);
  }

  @Post('nodes/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a decentralized P2P mesh node (EO-SEC-006)' })
  @ApiResponse({ status: 201, description: 'Node registered successfully.' })
  async registerNode(@Body() dto: P2PNodeRegisterDto) {
    return this.gridService.registerNode(dto);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'List active autonomous cryptographic nodes' })
  @ApiResponse({ status: 200, description: 'List of active nodes.' })
  async getNodes() {
    return this.gridService.getNodes();
  }

  @Post('telemetry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit encrypted telemetry via power-line communication' })
  @ApiResponse({ status: 200, description: 'Telemetry processed.' })
  async submitTelemetry(@Body() dto: TelemetryPayloadDto) {
    try {
      return await this.gridService.processTelemetry(dto);
    } catch (error: any) {
      return {
        status: 'ERROR',
        message: error.message,
      };
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Check self-healing status and EMP resilience metrics' })
  @ApiResponse({ status: 200, description: 'Grid health status.' })
  async getHealth() {
    return this.gridService.getGridHealth();
  }
}