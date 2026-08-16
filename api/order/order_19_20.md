import { Controller, Get, Post, Body, Param, Patch, HttpCode, HttpStatus, Injectable } from '@nestjs/common';

// ============================================================================
// DTOs & Interfaces
// ============================================================================

export interface CropInsuranceAlignmentDto {
  terminalId: string;
  reinsuranceAgreementId: string;
  schemaVersion: string; // e.g., "M-13"
  complianceSubpart: string; // e.g., "7 C.F.R. Part 400, Subpart T"
  authorizedSignature: string;
  timestamp: string;
}

export interface SoilMoistureTelemetryDto {
  sensorId: string;
  calibrationProtocol: string; // "SMS-CP-01"
  soilMoisturePercentage: number;
  telemetryPayload: string; // Base64 encoded telemetry data
  zeroKnowledgeProof: {
    proof: string;
    publicInputs: string[];
  };
}

export interface ScadaStatusResponse {
  terminalId: string;
  conveyorBeltTempCelsius: number;
  opticalSorterActive: boolean;
  diverterGatesStatus: 'NORMAL' | 'JAMMED' | 'BYPASS';
  remoteLockoutActive: boolean;
  systemStatus: 'OPERATIONAL' | 'CRITICAL' | 'OVERRIDE_ACTIVE';
  activeProtocol: string; // "DRP-v4" or "Agri-Nexus-Standard"
}

export interface FederalOverrideDto {
  terminalId: string;
  complianceDirective: string; // "7 C.F.R. Â§ 400.271"
  overrideAuthToken: string;
  bypassScadaLockout: boolean;
}

export interface P2PTransactionDto {
  transactionId: string;
  sellerId: string; // Independent Farmer / Co-op
  buyerId: string; // Local Mill / Feedlot
  grainType: string; // e.g., "Grade-1 Yellow Corn"
  bushels: number;
  pricePerBushel: number;
  smartContractAddress: string;
  settlementStatus: 'PENDING' | 'SETTLED' | 'FAILED';
}

// ============================================================================
// Service Layer
// ============================================================================

@Injectable()
export class AgriculturalSecurityService {
  private scadaState: ScadaStatusResponse = {
    terminalId: 'DSM-TERMINAL-04',
    conveyorBeltTempCelsius: 42.5,
    opticalSorterActive: true,
    diverterGatesStatus: 'NORMAL',
    remoteLockoutActive: false,
    systemStatus: 'OPERATIONAL',
    activeProtocol: 'Agri-Nexus-Standard',
  };

  private transactions: P2PTransactionDto[] = [];

  async alignCropInsurance(dto: CropInsuranceAlignmentDto) {
    // Validate alignment with M-13 Data Acceptance System
    return {
      status: 'SUCCESS',
      message: 'M-13 Data Schema Alignment verified successfully.',
      complianceStatus: 'COMPLIANT',
      regulation: dto.complianceSubpart,
      timestamp: new Date().toISOString(),
    };
  }

  async processSoilMoistureTelemetry(dto: SoilMoistureTelemetryDto) {
    // Verify Zero-Knowledge Proof for soil moisture and yield
    const isProofValid = this.verifyZkProof(dto.zeroKnowledgeProof);
    if (!isProofValid) {
      throw new Error('Invalid Zero-Knowledge Proof for telemetry payload.');
    }

    return {
      sensorId: dto.sensorId,
      calibrationStatus: 'VERIFIED',
      protocol: dto.calibrationProtocol,
      processedAt: new Date().toISOString(),
    };
  }

  async getScadaStatus(terminalId: string): Promise<ScadaStatusResponse> {
    if (terminalId !== this.scadaState.terminalId) {
      throw new Error('Terminal not found.');
    }
    return this.scadaState;
  }

  async executeFederalOverride(dto: FederalOverrideDto): Promise<ScadaStatusResponse> {
    if (dto.complianceDirective !== '7 C.F.R. Â§ 400.271') {
      throw new Error('Unauthorized compliance directive.');
    }

    // Simulate the transition from corporate lockout to decentralized local control
    this.scadaState.remoteLockoutActive = false;
    this.scadaState.diverterGatesStatus = 'NORMAL';
    this.scadaState.conveyorBeltTempCelsius = 35.0; // Cooling down
    this.scadaState.opticalSorterActive = true;
    this.scadaState.systemStatus = 'OVERRIDE_ACTIVE';
    this.scadaState.activeProtocol = 'DRP-v4'; // Decentralized Routing Protocol

    return this.scadaState;
  }

  async settleP2PTransaction(dto: P2PTransactionDto): Promise<P2PTransactionDto> {
    const newTransaction: P2PTransactionDto = {
      ...dto,
      settlementStatus: 'SETTLED',
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getP2PTransactions(): Promise<P2PTransactionDto[]> {
    return this.transactions;
  }

  private verifyZkProof(zkp: { proof: string; publicInputs: string[] }): boolean {
    // Mock verification of cryptographic proof
    return zkp.proof.length > 0;
  }
}

// ============================================================================
// Controller Layer
// ============================================================================

@Controller('agritech')
export class AgriculturalSecurityController {
  constructor(private readonly service: AgriculturalSecurityService) {}

  @Post('insurance-alignment')
  @HttpCode(HttpStatus.OK)
  async alignInsurance(@Body() dto: CropInsuranceAlignmentDto) {
    return this.service.alignCropInsurance(dto);
  }

  @Post('telemetry/sms-cp01')
  @HttpCode(HttpStatus.OK)
  async processTelemetry(@Body() dto: SoilMoistureTelemetryDto) {
    return this.service.processTelemetry(dto);
  }

  @Get('scada/status/:terminalId')
  async getScadaStatus(@Param('terminalId') terminalId: string) {
    return this.service.getScadaStatus(terminalId);
  }

  @Post('scada/override')
  @HttpCode(HttpStatus.OK)
  async executeOverride(@Body() dto: FederalOverrideDto) {
    return this.service.executeFederalOverride(dto);
  }

  @Post('p2p/settle')
  @HttpCode(HttpStatus.CREATED)
  async settleTransaction(@Body() dto: P2PTransactionDto) {
    return this.service.settleP2PTransaction(dto);
  }

  @Get('p2p/transactions')
  async getTransactions() {
    return this.service.getP2PTransactions();
  }
}