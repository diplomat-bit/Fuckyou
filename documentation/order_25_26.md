import { Controller, Post, Get, Body, Query, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

/**
 * =================================================================================
 * HISTORICAL CONTEXT & NARRATIVE SPECIFICATION (EO-SEC-025 & EO-SEC-026)
 * =================================================================================
 * 
 * Dean Halloway (Tri-County Community College, East Liverpool, OH) signed the WIOA
 * Title I Dislocated Worker Program Compliance Update (Addendum 4-B), unlocking
 * federal STEM education funding under EO-SEC-026.
 * 
 * The system bypasses the centralized, slow, and corrupt OhioMeansJobs (ODJFS) registry
 * by deploying a decentralized, peer-to-peer labor matching network across fifty
 * community college servers.
 * 
 * When ODJFS initiated an administrative freeze (COLUMBUS_TREASURY_NODE_04), the system
 * executed an automated ACH drawdown ($1,245,000.00) to escrow (NODE_HOST_TRUST_09)
 * and seeded the P2P network nodes before the freeze propagated.
 * =================================================================================
 */

// ==========================================
// DTOs & Interfaces
// ==========================================

export interface WioaComplianceDto {
  collegeId: string;
  deanSignature: string;
  customizedTrainingTermsAccepted: boolean;
  infrastructureOffsetApproved: boolean;
  allocatedNodes: string[];
}

export interface AchDrawdownDto {
  sourceAuthCode: string; // e.g., AUTH_CODE_WIOA_88392
  targetEscrowAccount: string; // e.g., NODE_HOST_TRUST_09
  amount: number; // e.g., 1245000.00
  bypassClearinghouse: boolean;
}

export interface LaborMatchRequestDto {
  skillSet: string[];
  locationRadiusMiles: number;
  minimumCompensation: number;
}

export interface NodeStatus {
  nodeId: string;
  location: string;
  isActive: boolean;
  peersConnected: number;
  localJobsMapped: number;
}

// ==========================================
// Services
// ==========================================

@Injectable()
export class LaborMatchingService {
  private readonly logger = new Logger(LaborMatchingService.name);
  private activeNodes: Map<string, NodeStatus> = new Map();
  private escrowBalance: number = 0;
  private isNetworkSeeded: boolean = false;

  constructor() {
    // Initialize default regional nodes from the narrative
    const defaultNodes = [
      { nodeId: 'COLUMBIANA_01', location: 'East Liverpool, OH', isActive: false, peersConnected: 0, localJobsMapped: 0 },
      { nodeId: 'JEFFERSON_02', location: 'Steubenville, OH', isActive: false, peersConnected: 0, localJobsMapped: 0 },
      { nodeId: 'BELMONT_01', location: 'St Clairsville, OH', isActive: false, peersConnected: 0, localJobsMapped: 0 },
      { nodeId: 'STARK_04', location: 'Canton, OH', isActive: false, peersConnected: 0, localJobsMapped: 0 }
    ];
    for (const node of defaultNodes) {
      this.activeNodes.set(node.nodeId, node);
    }
  }

  async verifyWioaCompliance(dto: WioaComplianceDto): Promise<{ status: string; timestamp: string }> {
    if (!dto.deanSignature || !dto.customizedTrainingTermsAccepted) {
      throw new HttpException('Invalid WIOA compliance parameters. Dean signature required.', HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`[SYS] WIOA Compliance verified for college: ${dto.collegeId}`);
    return {
      status: 'COMPLIANT_WIOA_TITLE_I',
      timestamp: new Date().toISOString()
    };
  }

  async executeAchDrawdown(dto: AchDrawdownDto): Promise<{ transactionId: string; status: string; escrowBalance: number }> {
    this.logger.warn(`[SYS] INITIATING ACH DRAWDOWN: ${dto.sourceAuthCode}`);
    
    if (dto.amount <= 0) {
      throw new HttpException('Invalid drawdown amount', HttpStatus.BAD_REQUEST);
    }

    // Simulate the race condition against the ODJFS freeze
    const odjfsFreezeDetected = true; // Simulating the narrative warning
    if (odjfsFreezeDetected) {
      this.logger.warn(`[WARN] ODJFS_GATEWAY: INBOUND ADMINISTRATIVE HOLD DETECTED - STATUS: PENDING`);
      this.logger.warn(`[WARN] ORIGIN: COLUMBUS_TREASURY_NODE_04`);
    }

    this.escrowBalance += dto.amount;
    this.logger.log(`[SYS] ACH TRANSFER COMPLETED. FUNDS DISBURSED TO ESCROW: ${dto.targetEscrowAccount}`);

    return {
      transactionId: `TXN-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      status: 'FUNDS_LOCKED_IN_ESCROW',
      escrowBalance: this.escrowBalance
    };
  }

  async seedNetwork(): Promise<{ status: string; activeNodes: NodeStatus[] }> {
    this.logger.log(`[SYS] DEPLOYING NETWORK SEED...`);
    
    for (const [nodeId, node] of this.activeNodes.entries()) {
      node.isActive = true;
      node.peersConnected = Math.floor(Math.random() * 12) + 4;
      node.localJobsMapped = Math.floor(Math.random() * 150) + 30;
      this.activeNodes.set(nodeId, node);
      this.logger.log(`[SYS] ESTABLISHING PEER-TO-PEER NODE: [${nodeId}] - ACTIVE`);
    }

    this.isNetworkSeeded = true;
    this.logger.log(`[SYS] LOCAL LABOR MATCHING ENGINE: ACTIVE`);

    return {
      status: 'DECENTRALIZED_NETWORK_LIVE',
      activeNodes: Array.from(this.activeNodes.values())
    };
  }

  async getNodes(): Promise<NodeStatus[]> {
    return Array.from(this.activeNodes.values());
  }

  async matchLabor(dto: LaborMatchRequestDto): Promise<{ matchesFound: number; matches: any[] }> {
    if (!this.isNetworkSeeded) {
      throw new HttpException('P2P Labor Matching Engine is offline. Network seed required.', HttpStatus.SERVICE_UNAVAILABLE);
    }

    // Mock matching logic based on local node data
    const mockMatches = [
      { jobTitle: 'CNC Machinist', location: 'East Liverpool, OH', compensation: 28.50, matchScore: 0.95 },
      { jobTitle: 'Industrial Automation Tech', location: 'Steubenville, OH', compensation: 32.00, matchScore: 0.89 }
    ].filter(job => job.compensation >= dto.minimumCompensation);

    return {
      matchesFound: mockMatches.length,
      matches: mockMatches
    };
  }
}

// ==========================================
// Controllers
// ==========================================

@Controller('api/workforce')
export class WorkforceRetrainingController {
  constructor(private readonly laborService: LaborMatchingService) {}

  @Post('wioa/compliance')
  async verifyCompliance(@Body() dto: WioaComplianceDto) {
    return await this.laborService.verifyWioaCompliance(dto);
  }

  @Get('nodes')
  async getActiveNodes() {
    return await this.laborService.getNodes();
  }

  @Post('labor/match')
  async matchLabor(@Body() dto: LaborMatchRequestDto) {
    return await this.laborService.matchLabor(dto);
  }
}

@Controller('api/stem')
export class StemFundingController {
  constructor(private readonly laborService: LaborMatchingService) {}

  @Post('funding/drawdown')
  async executeDrawdown(@Body() dto: AchDrawdownDto) {
    // Execute the critical drawdown to beat the ODJFS freeze
    const drawdownResult = await this.laborService.executeAchDrawdown(dto);
    
    // Immediately seed the network to secure the nodes
    const seedResult = await this.laborService.seedNetwork();

    return {
      drawdown: drawdownResult,
      networkSeeding: seedResult,
      systemStatus: 'FULLY_OPERATIONAL'
    };
  }
}

// ==========================================
// NestJS Module Definition
// ==========================================

import { Module } from '@nestjs/common';

@Module({
  controllers: [WorkforceRetrainingController, StemFundingController],
  providers: [LaborMatchingService],
  exports: [LaborMatchingService]
})
export class WorkforceStemModule {}