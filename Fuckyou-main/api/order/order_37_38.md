import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Injectable, Module } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

export class TelemetryDto {
  @ApiProperty({ example: 'Sector_4', description: 'The identifier of the waste management sector' })
  sectorId: string;

  @ApiProperty({ example: 0.08, description: 'Methane concentration level in the sector' })
  methaneLevel: number;

  @ApiProperty({ example: 1200, description: 'Current temperature of the thermal gasification unit in Celsius' })
  gasifierTemperature: number;

  @ApiProperty({ example: 1.5, description: 'Peptide concentration indicator for biological anomalies' })
  peptideConcentration: number;

  @ApiProperty({ example: true, description: 'Flag indicating if a biological anomaly has been detected' })
  isBiologicalAnomalyDetected: boolean;

  @ApiProperty({ example: 'LOCKED', description: 'Current status of the sector intake gates' })
  gateStatus: 'OPEN' | 'CLOSED' | 'LOCKED';
}

export class ConsensusSignatureDto {
  @ApiProperty({ example: 'node_edge_037_4', description: 'The unique identifier of the edge node' })
  nodeId: string;

  @ApiProperty({ example: 'sig_0x7f89ab34cd21ef89', description: 'Cryptographic signature of the node' })
  signature: string;

  @ApiProperty({ example: 'APPROVE_LOCKDOWN', description: 'The action being authorized by the node' })
  action: string;
}

export class OverrideRequestDto {
  @ApiProperty({ example: 'Sector_4', description: 'The sector target for manual override' })
  sectorId: string;

  @ApiProperty({ example: 'op_token_vance_9921', description: 'The operator authorization token' })
  operatorToken: string;
}

@Injectable()
export class WasteRecoveryService {
  private sectorsTelemetry: Map<string, TelemetryDto> = new Map();
  private activeConsensusNodes: Set<string> = new Set();
  private isLockdownActive: boolean = false;

  constructor() {
    // Initialize default state for San Jacinto Waste Recovery Complex
    this.sectorsTelemetry.set('Sector_4', {
      sectorId: 'Sector_4',
      methaneLevel: 0.08,
      gasifierTemperature: 900,
      peptideConcentration: 1.5, // Exceeds safe threshold of 0.5
      isBiologicalAnomalyDetected: true,
      gateStatus: 'LOCKED',
    });
    this.sectorsTelemetry.set('Sector_5', {
      sectorId: 'Sector_5',
      methaneLevel: 0.02,
      gasifierTemperature: 150,
      peptideConcentration: 0.1,
      isBiologicalAnomalyDetected: false,
      gateStatus: 'OPEN',
    });
  }

  getTelemetry(sectorId: string): TelemetryDto {
    const telemetry = this.sectorsTelemetry.get(sectorId);
    if (!telemetry) {
      throw new HttpException('Sector not found', HttpStatus.NOT_FOUND);
    }
    return telemetry;
  }

  getAllTelemetry(): TelemetryDto[] {
    return Array.from(this.sectorsTelemetry.values());
  }

  submitSignature(dto: ConsensusSignatureDto) {
    this.activeConsensusNodes.add(dto.nodeId);
    
    // If we have at least 3 nodes signing, consensus is achieved
    if (this.activeConsensusNodes.size >= 3 && !this.isLockdownActive) {
      this.isLockdownActive = true;
      this.executeAutonomousLockdown();
    }
    return {
      success: true,
      activeNodesCount: this.activeConsensusNodes.size,
      consensusAchieved: this.activeConsensusNodes.size >= 3,
    };
  }

  attemptManualOverride(dto: OverrideRequestDto): { success: boolean; message: string } {
    const telemetry = this.getTelemetry(dto.sectorId);
    
    // Critical Rule: If biological anomaly is detected, manual override is strictly blocked by consensus
    if (telemetry.isBiologicalAnomalyDetected) {
      throw new HttpException(
        'Consensus Denied. Local Node Isolation Initiated under EO-SEC-037. Manual override blocked due to biological anomaly.',
        HttpStatus.FORBIDDEN
      );
    }

    telemetry.gateStatus = 'OPEN';
    this.sectorsTelemetry.set(dto.sectorId, telemetry);
    return {
      success: true,
      message: `Manual override successful for ${dto.sectorId}. Gates opened.`,
    };
  }

  private executeAutonomousLockdown() {
    const sector4 = this.sectorsTelemetry.get('Sector_4');
    if (sector4) {
      sector4.gateStatus = 'LOCKED';
      sector4.gasifierTemperature = 1200; // Raise to 1200C to neutralize pathogen
      this.sectorsTelemetry.set('Sector_4', sector4);
    }
  }

  getPowerGenerationMetrics() {
    // EO-SEC-038: Circular Economy Initiatives - Waste-to-Energy power generation
    const activeGasifiers = Array.from(this.sectorsTelemetry.values()).filter(
      (s) => s.gasifierTemperature >= 900
    );
    
    const totalPowerMW = activeGasifiers.reduce((acc, curr) => {
      // 1200C generates 20MW, 900C generates 10MW
      const power = curr.gasifierTemperature >= 1200 ? 20 : 10;
      return acc + power;
    }, 0);

    return {
      activeGasifiersCount: activeGasifiers.length,
      totalPowerGeneratedMW: totalPowerMW,
      gridFeedbackStatus: 'ACTIVE',
      efficiencyRating: '98.4%',
    };
  }
}

@ApiTags('Waste Recovery & Energy Consensus (EO-SEC-037 / EO-SEC-038)')
@Controller('waste-recovery')
export class WasteRecoveryController {
  constructor(private readonly service: WasteRecoveryService) {}

  @Get('telemetry')
  @ApiOperation({ summary: 'Retrieve real-time telemetry for all sectors' })
  @ApiResponse({ status: 200, type: [TelemetryDto] })
  getAllTelemetry() {
    return this.service.getAllTelemetry();
  }

  @Get('telemetry/:sectorId')
  @ApiOperation({ summary: 'Retrieve real-time telemetry for a specific sector' })
  @ApiResponse({ status: 200, type: TelemetryDto })
  getTelemetry(@Param('sectorId') sectorId: string) {
    return this.service.getTelemetry(sectorId);
  }

  @Post('consensus/sign')
  @ApiOperation({ summary: 'Submit node signature for decentralized consensus' })
  @ApiResponse({ status: 200, description: 'Signature registered successfully' })
  signConsensus(@Body() dto: ConsensusSignatureDto) {
    return this.service.submitSignature(dto);
  }

  @Post('override')
  @ApiOperation({ summary: 'Attempt manual override of sector gates (restricted during biological events)' })
  @ApiResponse({ status: 200, description: 'Override successful' })
  @ApiResponse({ status: 403, description: 'Consensus Denied. Manual override blocked.' })
  attemptOverride(@Body() dto: OverrideRequestDto) {
    return this.service.attemptManualOverride(dto);
  }

  @Get('energy-metrics')
  @ApiOperation({ summary: 'Retrieve circular economy waste-to-energy metrics' })
  @ApiResponse({ status: 200, description: 'Power generation metrics retrieved successfully' })
  getEnergyMetrics() {
    return this.service.getPowerGenerationMetrics();
  }
}

@Module({
  controllers: [WasteRecoveryController],
  providers: [WasteRecoveryService],
})
export class WasteRecoveryModule {}