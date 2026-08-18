import { Controller, Get, Post, Body, Query, HttpException, HttpStatus, Injectable, Module } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

// ==========================================
// DTOs & Interfaces
// ==========================================

export class TelemetryDataDto {
  @ApiProperty({ example: 'NODE_CA_04', description: 'The unique identifier of the reporting node' })
  nodeId: string;

  @ApiProperty({ example: 'WET_WELL_03', description: 'The specific water source or wet well' })
  source: string;

  @ApiProperty({ example: 1.2, description: 'Chlorine residual level in mg/L (EPA Method 334.0)' })
  chlorineResidual: number;

  @ApiProperty({ example: 0.15, description: 'Turbidity level in NTU' })
  turbidity: number;

  @ApiProperty({ example: 7.4, description: 'pH level' })
  ph: number;

  @ApiProperty({ example: 450, description: 'Conductivity in uS/cm' })
  conductivity: number;

  @ApiProperty({ example: '0x7f83b12a...', description: 'Cryptographic signature of the telemetry payload' })
  signature: string;
}

export class NodeRegistrationDto {
  @ApiProperty({ example: 'NODE_CA_05', description: 'Unique node identifier' })
  nodeId: string;

  @ApiProperty({ example: '37.6812 N, 121.3245 W', description: 'Geographic coordinates' })
  coordinates: string;

  @ApiProperty({ example: '0x8a2f...', description: 'Public key for cryptographic handshakes' })
  publicKey: string;
}

export interface ConsensusResult {
  verified: boolean;
  activeNodes: string[];
  consensusRatio: number;
  actionTaken: string;
}

// ==========================================
// Service Layer
// ==========================================

@Injectable()
export class WaterResourceService {
  private registeredNodes: Map<string, { coordinates: string; publicKey: string; active: boolean }> = new Map([
    ['NODE_CA_01', { coordinates: '37.6812 N, 121.3245 W', publicKey: '0x01_pubkey', active: true }],
    ['NODE_CA_02', { coordinates: '37.6901 N, 121.3120 W', publicKey: '0x02_pubkey', active: true }],
    ['NODE_CA_04', { coordinates: '37.6812 N, 121.3245 W', publicKey: '0x04_pubkey', active: true }],
    ['NODE_CA_05', { coordinates: '37.7012 N, 121.3345 W', publicKey: '0x05_pubkey', active: true }],
    ['NODE_CA_08', { coordinates: '37.6512 N, 121.3045 W', publicKey: '0x08_pubkey', active: true }],
    ['NODE_CA_11', { coordinates: '37.6612 N, 121.2945 W', publicKey: '0x11_pubkey', active: true }],
  ]);

  private manualOverrideLocked = true;

  registerNode(dto: NodeRegistrationDto) {
    if (this.registeredNodes.has(dto.nodeId)) {
      throw new HttpException('Node already registered', HttpStatus.BAD_REQUEST);
    }
    this.registeredNodes.set(dto.nodeId, {
      coordinates: dto.coordinates,
      publicKey: dto.publicKey,
      active: true,
    });
    return { status: 'success', message: `Node ${dto.nodeId} registered successfully.` };
  }

  getNodes() {
    return Array.from(this.registeredNodes.entries()).map(([nodeId, data]) => ({
      nodeId,
      ...data,
    }));
  }

  async processTelemetry(data: TelemetryDataDto): Promise<ConsensusResult> {
    // 1. Verify cryptographic signature (Mock verification)
    const node = this.registeredNodes.get(data.nodeId);
    if (!node || !node.active) {
      throw new HttpException('Unauthorized or inactive node', HttpStatus.UNAUTHORIZED);
    }

    // 2. Check for anomalous spikes (e.g., Turbidity > 1.0 NTU or high chlorine demand)
    let actionTaken = 'NO_ACTION_REQUIRED';
    const isAnomalous = data.turbidity > 1.0 || data.chlorineResidual < 0.2 || data.chlorineResidual > 4.0;

    // 3. Query neighboring nodes for consensus (Simulating peer-to-peer validation)
    const activeNodesList = Array.from(this.registeredNodes.keys()).filter(id => id !== data.nodeId);
    const positiveVotes = activeNodesList.filter(() => Math.random() > 0.1).length; // 90% consensus simulation
    const consensusRatio = positiveVotes / activeNodesList.length;

    if (isAnomalous) {
      if (consensusRatio >= 0.66) {
        actionTaken = 'AUTONOMOUS_ISOLATION_TRIGGERED';
        this.manualOverrideLocked = true; // Force lock manual override to protect system
      } else {
        actionTaken = 'ANOMALY_DETECTED_BUT_CONSENSUS_FAILED';
      }
    }

    return {
      verified: consensusRatio >= 0.66,
      activeNodes: activeNodesList,
      consensusRatio,
      actionTaken,
    };
  }

  isManualOverrideLocked(): boolean {
    return this.manualOverrideLocked;
  }

  setManualOverrideLock(locked: boolean) {
    this.manualOverrideLocked = locked;
    return { status: 'success', manualOverrideLocked: this.manualOverrideLocked };
  }
}

// ==========================================
// Controller Layer
// ==========================================

@ApiTags('Decentralized Water Resource Management (EO-SEC-021 / EO-SEC-022)')
@Controller('water-resource')
export class WaterResourceController {
  constructor(private readonly waterService: WaterResourceService) {}

  @Post('telemetry')
  @ApiOperation({ summary: 'Submit real-time telemetry data from a municipal node' })
  @ApiResponse({ status: 201, description: 'Telemetry processed and consensus evaluated.' })
  async submitTelemetry(@Body() telemetryDto: TelemetryDataDto) {
    return await this.waterService.processTelemetry(telemetryDto);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Retrieve all registered decentralized cryptographic nodes' })
  @ApiResponse({ status: 200, description: 'List of active nodes.' })
  getNodes() {
    return this.waterService.getNodes();
  }

  @Post('nodes/register')
  @ApiOperation({ summary: 'Register a new decentralized node (EPA Method 334.0 Sensor)' })
  @ApiResponse({ status: 201, description: 'Node registered successfully.' })
  registerNode(@Body() registrationDto: NodeRegistrationDto) {
    return this.waterService.registerNode(registrationDto);
  }

  @Get('override-status')
  @ApiOperation({ summary: 'Check if the manual SCADA override is locked' })
  @ApiResponse({ status: 200, description: 'Current lock status.' })
  getOverrideStatus() {
    return { manualOverrideLocked: this.waterService.isManualOverrideLocked() };
  }

  @Post('override-lock')
  @ApiOperation({ summary: 'Lock or unlock the manual override registers (Modbus 40003)' })
  @ApiResponse({ status: 200, description: 'Lock status updated.' })
  setOverrideLock(@Body() body: { locked: boolean }) {
    return this.waterService.setManualOverrideLock(body.locked);
  }
}

// ==========================================
// Module Layer
// ==========================================

@Module({
  controllers: [WaterResourceController],
  providers: [WaterResourceService],
  exports: [WaterResourceService],
})
export class WaterResourceModule {}