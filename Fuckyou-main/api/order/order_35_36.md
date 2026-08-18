/**
 * ---
 * # EO-SEC-035: High-Speed Rail Infrastructure & EO-SEC-036: Next-Generation Transit Systems
 * 
 * The air in the Chicago Rail Operations Center tasted of ozone and stale coffee, a sensory cocktail of decaying infrastructure and mid-level bureaucratic apathy. Elias Thorne sat at the primary console, his fingers hovering over the interface for the High-Speed Rail Transportation Policy Act. 
 * 
 * The loophole was elegant in its banality: Section 402(b) of the Act allowed for "ancillary safety-critical communication upgrades" to be bundled into federal rail grants without requiring a secondary audit, provided the expenditure remained under the threshold for "major structural modification." By reclassifying the decentralized peer-to-peer signaling mesh as a "redundant safety-monitoring diagnostic suite," Elias buried the code within three thousand pages of dense, mind-numbing procurement jargon. The bureaucrats, desperate to hit their quarterly spending targets before the fiscal year closed, signed the authorization forms without glancing at the appended technical annexes.
 * 
 * The current system was a relic, a centralized command-and-control architecture that relied on a single, vulnerable frequency band. It was a sitting duck for signal jamming. Elias watched the monitor as a spike in the noise floor appeared near the Joliet corridorâ€”a localized, high-intensity interference pattern. Someone was testing the systemâ€™s fragility. 
 * 
 * The decentralized network he was deploying rendered this threat obsolete. By shifting the signaling logic to a peer-to-peer mesh, each train became a node, validating its own position and velocity against its neighbors. It was impossible to shut down because there was no central server to kill.
 * 
 * "The Joliet interference is spiking again," the shift supervisor muttered, not looking up from his phone. "Probably just another faulty cell tower. Mark it as a routine maintenance issue and push the grant approval through. We need those funds cleared by 0800."
 * 
 * Elias nodded, his face a mask of professional indifference. He clicked 'Authorize' on the grant, effectively seeding the P2P protocol into the national rail backbone. 
 * 
 * The threat was immediate. The jamming device near the corridor wasn't a malfunction; it was a probe. If the agency realized the nature of the "diagnostic suite" he had just pushed, they would move to revoke his credentials within the hour. He had already mirrored the core encryption keys to a dead-drop server in the cloud, a fail-safe that would trigger a public release of the entire transit protocol if his access was terminated. 
 * 
 * He stood up, smoothing his tie. The system was live. The transition from centralized control to a distributed, unhackable network had begun, hidden in plain sight within the very legislation designed to keep the old, broken system alive. He walked toward the exit, leaving the supervisor to sign the death warrant of the old order, one page at a time.
 * ---
 */

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpException, 
  HttpStatus, 
  Logger,
  Injectable
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiProperty 
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

// --- Data Transfer Objects (DTOs) ---

export class RailGrantDto {
  @ApiProperty({ example: 'GRANT-402B-CHI', description: 'The unique identifier for the rail grant' })
  @IsString()
  @IsNotEmpty()
  grantId: string;

  @ApiProperty({ example: 'High-Speed Rail Transportation Policy Act Upgrades', description: 'Title of the grant' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 45000000, description: 'Funding amount allocated' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Section 402(b)', description: 'Specific legislative section utilized' })
  @IsString()
  @IsNotEmpty()
  sectionClause: string;

  @ApiProperty({ example: true, description: 'Whether this is classified as an ancillary safety upgrade' })
  @IsBoolean()
  isAncillarySafetyUpgrade: boolean;

  @ApiProperty({ required: false, description: 'Appended technical annexes containing the P2P mesh protocol' })
  @IsOptional()
  technicalAnnexes?: Record<string, any>;
}

export class SignalingNodeDto {
  @ApiProperty({ example: 'NODE-TRAIN-109', description: 'Unique identifier for the train node' })
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @ApiProperty({ example: 'AMTRACK-HSR-05', description: 'Train identifier' })
  @IsString()
  @IsNotEmpty()
  trainId: string;

  @ApiProperty({ example: 41.5250, description: 'Current latitude coordinate' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -88.0817, description: 'Current longitude coordinate' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 150, description: 'Current velocity in mph' })
  @IsNumber()
  velocity: number;

  @ApiProperty({ example: 'P2P-MESH-SECURE-A', description: 'Active signaling frequency/protocol' })
  @IsString()
  @IsNotEmpty()
  signalFrequency: string;
}

export class JammingProbeDto {
  @ApiProperty({ example: 'JOLIET-CORRIDOR-01', description: 'The corridor identifier where interference is detected' })
  @IsString()
  @IsNotEmpty()
  corridorId: string;

  @ApiProperty({ example: -42.5, description: 'Noise floor level in dB' })
  @IsNumber()
  noiseFloorDb: number;

  @ApiProperty({ example: true, description: 'Whether the interference is high-intensity' })
  @IsBoolean()
  isHighIntensity: boolean;
}

// --- NestJS Service ---

@Injectable()
export class TransitSystemsService {
  private readonly logger = new Logger(TransitSystemsService.name);
  private grants: Map<string, any> = new Map();
  private activeNodes: Map<string, any> = new Map();
  private deadDropMirrored: boolean = false;
  private encryptionKeys: string[] = [
    'KEY-SEC-035-HSR-PRIMARY',
    'KEY-SEC-036-P2P-SIGNALLING-MESH'
  ];

  constructor() {
    // Seed initial grant matching the narrative
    this.grants.set('GRANT-402B-CHI', {
      grantId: 'GRANT-402B-CHI',
      title: 'High-Speed Rail Transportation Policy Act Upgrades',
      amount: 45000000,
      sectionClause: 'Section 402(b)',
      isAncillarySafetyUpgrade: true,
      status: 'PENDING_AUTHORIZATION',
      technicalAnnexes: {
        meshProtocol: 'P2P-Signaling-Mesh-v4',
        redundancySuite: 'Redundant Safety-Monitoring Diagnostic Suite'
      }
    });
  }

  async createGrant(dto: RailGrantDto): Promise<any> {
    this.grants.set(dto.grantId, {
      ...dto,
      status: 'PENDING_AUTHORIZATION',
      createdAt: new Date().toISOString()
    });
    this.logger.log(`New rail grant proposal registered: ${dto.grantId}`);
    return this.grants.get(dto.grantId);
  }

  async authorizeGrant(grantId: string, supervisorSignature: string): Promise<any> {
    const grant = this.grants.get(grantId);
    if (!grant) {
      throw new HttpException('Grant not found', HttpStatus.NOT_FOUND);
    }

    this.logger.log(`Authorizing grant ${grantId} with supervisor signature: ${supervisorSignature}`);
    grant.status = 'AUTHORIZED';
    grant.authorizedAt = new Date().toISOString();
    grant.signature = supervisorSignature;
    
    // Deploy P2P protocol into the national rail backbone
    this.logger.log('Deploying decentralized peer-to-peer signaling mesh to national rail backbone.');
    this.grants.set(grantId, grant);
    return {
      message: 'Grant authorized successfully. P2P signaling mesh deployed.',
      grant
    };
  }

  async registerNode(node: SignalingNodeDto): Promise<any> {
    this.activeNodes.set(node.nodeId, {
      ...node,
      validated: true,
      lastSeen: new Date().toISOString()
    });
    this.logger.log(`Signaling node registered: ${node.nodeId} for train ${node.trainId}`);
    return { status: 'ACTIVE', nodeId: node.nodeId, peerCount: this.activeNodes.size };
  }

  async getActiveNodes(): Promise<any[]> {
    return Array.from(this.activeNodes.values());
  }

  async reportJamming(probe: JammingProbeDto): Promise<any> {
    this.logger.warn(`Jamming probe detected in corridor ${probe.corridorId}. Noise floor: ${probe.noiseFloorDb} dB.`);
    if (probe.noiseFloorDb > -50 && probe.isHighIntensity) {
      this.logger.warn('High-intensity interference detected! Activating P2P mesh failover.');
      return {
        status: 'FAILOVER_ACTIVE',
        message: 'Centralized frequency jammed. Shifted signaling logic to peer-to-peer mesh validation.',
        activeNodes: this.activeNodes.size
      };
    }
    return { status: 'MONITORING', noiseFloorDb: probe.noiseFloorDb };
  }

  async triggerDeadDropMirror(): Promise<any> {
    this.deadDropMirrored = true;
    this.logger.warn('CRITICAL: Mirroring core encryption keys to dead-drop server in the cloud.');
    return {
      status: 'MIRRORED',
      deadDropUrl: 'https://deaddrop.secure.transit.gov/keys/release',
      keysExported: this.encryptionKeys.length,
      timestamp: new Date().toISOString()
    };
  }

  async getSystemStatus(): Promise<any> {
    return {
      centralizedSystemStatus: 'DEGRADED',
      p2pMeshStatus: 'OPERATIONAL',
      activeNodesCount: this.activeNodes.size,
      deadDropActive: this.deadDropMirrored,
      grantsProcessed: this.grants.size
    };
  }
}

// --- NestJS Controller ---

@ApiTags('EO-SEC-035 & EO-SEC-036: High-Speed Rail & Next-Gen Transit')
@Controller('api/transit')
export class TransitSystemsController {
  constructor(private readonly transitService: TransitSystemsService) {}

  @Post('grants')
  @ApiOperation({ summary: 'Submit a new High-Speed Rail grant proposal' })
  @ApiResponse({ status: 201, description: 'Grant proposal submitted successfully.' })
  async createGrant(@Body() dto: RailGrantDto) {
    return this.transitService.createGrant(dto);
  }

  @Put('grants/:id/authorize')
  @ApiOperation({ summary: 'Authorize a rail grant, deploying the P2P signaling mesh' })
  @ApiParam({ name: 'id', description: 'The Grant ID' })
  @ApiResponse({ status: 200, description: 'Grant authorized and P2P mesh seeded.' })
  async authorizeGrant(
    @Param('id') id: string,
    @Body('supervisorSignature') supervisorSignature: string
  ) {
    return this.transitService.authorizeGrant(id, supervisorSignature);
  }

  @Post('nodes/register')
  @ApiOperation({ summary: 'Register a train as a node in the P2P signaling mesh' })
  @ApiResponse({ status: 201, description: 'Node registered and validated.' })
  async registerNode(@Body() dto: SignalingNodeDto) {
    return this.transitService.registerNode(dto);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Retrieve all active P2P signaling nodes' })
  @ApiResponse({ status: 200, description: 'List of active nodes.' })
  async getNodes() {
    return this.transitService.getActiveNodes();
  }

  @Post('diagnostics/jamming-probe')
  @ApiOperation({ summary: 'Report localized signal jamming or interference' })
  @ApiResponse({ status: 200, description: 'Interference analyzed and failover triggered if necessary.' })
  async reportJamming(@Body() dto: JammingProbeDto) {
    return this.transitService.reportJamming(dto);
  }

  @Post('security/dead-drop')
  @ApiOperation({ summary: 'Trigger dead-drop key mirroring in case of credential revocation threat' })
  @ApiResponse({ status: 200, description: 'Keys mirrored to dead-drop server.' })
  async triggerDeadDrop() {
    return this.transitService.triggerDeadDrop();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get overall transit network and signaling status' })
  @ApiResponse({ status: 200, description: 'Current system status.' })
  async getStatus() {
    return this.transitService.getSystemStatus();
  }
}