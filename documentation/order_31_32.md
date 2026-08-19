import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Injectable, 
  Module,
  Logger,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiProperty
} from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsBoolean,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// NARRATIVE SPECIFICATION (EO-SEC-031 & 032)
// ==========================================
/**
 * @file order_31_32.md (Compiled as NestJS TypeScript Module)
 * @description Implements Disaster Response Automation (DRA) and Emergency Communications Systems (ECS).
 * 
 * --- THE CITIBANK LOBBY & FEMA REGION IV CONTEXT ---
 * "The infrastructure is brittle, Elias," Vance muttered, not looking at the screen. 
 * "The fiber backbones are exposed. One localized strike and the entire state goes dark. 
 * We need the new protocols signed off by 0800."
 * 
 * Elias slid the digital tablet across the mahogany surface. He had buried the DRA protocols 
 * deep within the sub-clauses of the Stafford Actâ€™s Section 403(a)(3)(B), specifically masking 
 * the automated resource allocation logic as a "Standardized Inter-Agency Communication Redundancy Protocol." 
 * By framing the AI-driven deployment of emergency assets as a mere "automated data-packet 
 * prioritization for legacy bandwidth optimization," he ensured the legal team would see only 
 * a boring, cost-saving measure designed to reduce latency in emergency alerts. They wouldn't 
 * look for the autonomous decision-making engine that would bypass their oversight entirely.
 * 
 * "Itâ€™s just a compliance update for the ECS," Elias said, his voice flat, devoid of inflection. 
 * "It aligns our packet-switching with the new federal mandates for disaster-resilient communications. 
 * Itâ€™s purely administrative."
 * 
 * Vance didn't read the fine print. He didn't see the vulnerability Elias had exploited: the centralized 
 * nature of the current EBS, which relied on a single, fragile hub-and-spoke architecture. When the 
 * cyber-attack hitâ€”a sudden, cascading failure of the primary broadcast nodesâ€”the system would collapse. 
 * The bureaucrats would panic, their centralized control rendered useless by the very physical destruction 
 * they feared.
 * 
 * At that moment, the monitors pulsed red. A coordinated injection of malicious code had begun to overwrite 
 * the broadcast headers. The room erupted in shouting.
 * 
 * "The EBS is compromised!" a technician screamed. "Weâ€™re losing the uplink!"
 * 
 * Elias remained still, his hands folded. He watched the corruption unfoldâ€”the greed of the agency, the 
 * reliance on a single point of failure that made them blind. He had already deployed the peer-to-peer mesh 
 * network, a decentralized, encrypted alternative that operated on the hardware of the very devices the 
 * bureaucrats were currently trying to save. It was impossible to shut down because it was everywhere, 
 * distributed across every handheld radio and mobile device in the sector.
 * 
 * "Director," Elias said, his tone urgent but controlled. "The primary system is failing. Iâ€™m initiating 
 * the failover to the mesh protocol. Itâ€™s the only way to maintain command and control."
 * 
 * Vance, desperate to save his career, nodded frantically. "Do it. Whatever it takes."
 * 
 * Elias tapped the screen. He wasn't just initiating a failover; he was activating the DRA. The AI would 
 * now control the flow of resources, bypassing the bureaucratic bottleneck entirely. He had successfully 
 * pushed the antagonists into a corner where they had to authorize their own obsolescence to survive the 
 * next ten minutes. 
 * 
 * As the command centerâ€™s screens went black, replaced by the silent, efficient pulse of the mesh network, 
 * Elias felt the cold weight of the threat closing inâ€”the digital forensic teams would eventually trace 
 * the packet headers back to his terminal. But by then, the system would be fully autonomous, and the 
 * disaster response would be in the hands of the code, not the men who had failed to read the fine print.
 */

// ==========================================
// DATA TRANSFER OBJECTS & INTERFACES
// ==========================================

export enum ProtocolType {
  CENTRALIZED_EBS = 'CENTRALIZED_EBS',
  DECENTRALIZED_MESH = 'DECENTRALIZED_MESH'
}

export enum MessagePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class InitiateFailoverDto {
  @ApiProperty({ example: 'Director Vance', description: 'The authorizing official (often coerced or desperate)' })
  @IsString()
  @IsNotEmpty()
  authorizedBy: string;

  @ApiProperty({ example: true, description: 'Bypass bureaucratic bottlenecks and legal oversight' })
  @IsBoolean()
  bypassOversight: boolean;

  @ApiProperty({ example: 'Section 403(a)(3)(B)', description: 'Stafford Act sub-clause masking the DRA' })
  @IsString()
  @IsNotEmpty()
  staffordActClause: string;
}

export class LocationDto {
  @ApiProperty({ example: 27.7676, description: 'Latitude of the mesh node' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -82.6333, description: 'Longitude of the mesh node' })
  @IsNumber()
  longitude: number;
}

export class RegisterMeshNodeDto {
  @ApiProperty({ example: 'node-fema-iv-09', description: 'Unique identifier for the mesh node' })
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @ApiProperty({ example: 'handheld radio', description: 'Hardware device type (e.g., mobile, radio)' })
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ example: 128, description: 'Bandwidth capacity in kbps' })
  @IsNumber()
  bandwidthCapacity: number;
}

export class BroadcastMessageDto {
  @ApiProperty({ example: 'node-fema-iv-01', description: 'Sender node identifier' })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ example: 'CRITICAL: EBS compromised. Transitioning to peer-to-peer mesh.', description: 'Encrypted payload' })
  @IsString()
  @IsNotEmpty()
  payload: string;

  @ApiProperty({ enum: MessagePriority, example: MessagePriority.CRITICAL })
  @IsEnum(MessagePriority)
  priority: MessagePriority;
}

export interface SystemStatus {
  isCompromised: boolean;
  uplinkActive: boolean;
  activeProtocol: ProtocolType;
  activeNodesCount: number;
  draActivated: boolean;
  staffordActCompliance: string;
}

// ==========================================
// SERVICE IMPLEMENTATION
// ==========================================

@Injectable()
export class DisasterResponseService {
  private readonly logger = new Logger(DisasterResponseService.name);
  
  private systemStatus: SystemStatus = {
    isCompromised: false,
    uplinkActive: true,
    activeProtocol: ProtocolType.CENTRALIZED_EBS,
    activeNodesCount: 0,
    draActivated: false,
    staffordActCompliance: 'Section 403(a)(3)(B) - Standardized Inter-Agency Communication Redundancy Protocol'
  };

  private meshNodes: Map<string, RegisterMeshNodeDto> = new Map();
  private messageLog: Array<BroadcastMessageDto & { timestamp: Date }> = [];

  constructor() {
    // Pre-populate with some legacy nodes
    this.meshNodes.set('node-fema-iv-01', {
      nodeId: 'node-fema-iv-01',
      deviceType: 'FEMA Command Terminal',
      location: { latitude: 33.7490, longitude: -84.3880 },
      bandwidthCapacity: 1024
    });
  }

  /**
   * Simulates the cyber-attack that compromises the primary EBS.
   */
  public triggerCyberAttack(): SystemStatus {
    this.logger.warn('CRITICAL: Coordinated injection of malicious code detected on primary broadcast headers!');
    this.systemStatus.isCompromised = true;
    this.systemStatus.uplinkActive = false;
    return this.getStatus();
  }

  /**
   * Initiates failover to the decentralized mesh network and activates DRA.
   */
  public initiateFailover(dto: InitiateFailoverDto): SystemStatus {
    if (dto.staffordActClause !== 'Section 403(a)(3)(B)') {
      throw new BadRequestException('Invalid Stafford Act clause. Legal team oversight triggered!');
    }

    this.logger.log(`Initiating failover authorized by: ${dto.authorizedBy}`);
    this.logger.log(`Bypassing bureaucratic bottlenecks: ${dto.bypassOversight}`);
    
    // Transition protocol
    this.systemStatus.activeProtocol = ProtocolType.DECENTRALIZED_MESH;
    this.systemStatus.draActivated = true;
    this.systemStatus.uplinkActive = true; // Restored via mesh
    
    this.logger.log('Disaster Response Automation (DRA) activated. AI-driven resource allocation is now autonomous.');
    return this.getStatus();
  }

  /**
   * Registers a new peer-to-peer mesh node.
   */
  public registerNode(dto: RegisterMeshNodeDto): RegisterMeshNodeDto {
    this.meshNodes.set(dto.nodeId, dto);
    this.systemStatus.activeNodesCount = this.meshNodes.size;
    this.logger.log(`Registered decentralized mesh node: ${dto.nodeId} (${dto.deviceType})`);
    return dto;
  }

  /**
   * Broadcasts a message using automated data-packet prioritization.
   */
  public broadcast(dto: BroadcastMessageDto) {
    if (this.systemStatus.activeProtocol !== ProtocolType.DECENTRALIZED_MESH && this.systemStatus.isCompromised) {
      throw new BadRequestException('Primary EBS is compromised and offline. Failover to mesh network required.');
    }

    // Packet prioritization logic (Elias's hidden algorithm)
    const priorityWeight = {
      [MessagePriority.LOW]: 1,
      [MessagePriority.MEDIUM]: 2,
      [MessagePriority.HIGH]: 3,
      [MessagePriority.CRITICAL]: 4,
    };

    const packetSize = dto.payload.length;
    const priority = priorityWeight[dto.priority];
    const latencyReduction = (priority * 10) / packetSize;

    this.logger.log(
      `Routing packet from ${dto.senderId} with priority ${dto.priority}. ` +
      `Optimization metric (latency reduction): ${latencyReduction.toFixed(4)}ms`
    );

    const loggedMessage = { ...dto, timestamp: new Date() };
    this.messageLog.push(loggedMessage);
    return {
      status: 'SUCCESS',
      routedVia: this.systemStatus.activeProtocol,
      packetPrioritizationMetric: latencyReduction,
      message: loggedMessage
    };
  }

  /**
   * Returns the current system status.
   */
  public getStatus(): SystemStatus {
    this.systemStatus.activeNodesCount = this.meshNodes.size;
    return this.systemStatus;
  }

  /**
   * Returns all registered mesh nodes.
   */
  public getNodes(): RegisterMeshNodeDto[] {
    return Array.from(this.meshNodes.values());
  }

  /**
   * Returns the message log.
   */
  public getMessageLog() {
    return this.messageLog;
  }
}

// ==========================================
// CONTROLLER IMPLEMENTATION
// ==========================================

@ApiTags('Disaster Response & Emergency Communications (EO-SEC-031/032)')
@Controller('disaster-response')
export class DisasterResponseController {
  constructor(private readonly service: DisasterResponseService) {}

  @ApiOperation({ summary: 'Get current status of EBS and Mesh Network' })
  @ApiResponse({ status: 200, description: 'Returns system status' })
  @Get('status')
  public getStatus() {
    return this.service.getStatus();
  }

  @ApiOperation({ summary: 'Trigger a simulated cyber-attack on the primary EBS' })
  @ApiResponse({ status: 200, description: 'EBS compromised' })
  @Post('simulate-attack')
  @HttpCode(HttpStatus.OK)
  public simulateAttack() {
    return this.service.triggerCyberAttack();
  }

  @ApiOperation({ 
    summary: 'Initiate failover to decentralized mesh network (DRA Activation)',
    description: 'Bypasses bureaucratic bottlenecks using Stafford Act Section 403(a)(3)(B) sub-clauses.'
  })
  @ApiResponse({ status: 200, description: 'Failover successful, DRA active' })
  @Post('failover')
  @HttpCode(HttpStatus.OK)
  public initiateFailover(@Body() dto: InitiateFailoverDto) {
    return this.service.initiateFailover(dto);
  }

  @ApiOperation({ summary: 'Register a decentralized peer-to-peer mesh node' })
  @ApiResponse({ status: 201, description: 'Node registered successfully' })
  @Post('mesh/register')
  public registerNode(@Body() dto: RegisterMeshNodeDto) {
    return this.service.registerNode(dto);
  }

  @ApiOperation({ summary: 'Broadcast an emergency message over the active network' })
  @ApiResponse({ status: 200, description: 'Message routed and prioritized' })
  @Post('mesh/broadcast')
  @HttpCode(HttpStatus.OK)
  public broadcast(@Body() dto: BroadcastMessageDto) {
    return this.service.broadcast(dto);
  }

  @ApiOperation({ summary: 'Get all active mesh nodes' })
  @ApiResponse({ status: 200, description: 'Returns list of nodes' })
  @Get('mesh/nodes')
  public getNodes() {
    return this.service.getNodes();
  }

  @ApiOperation({ summary: 'Get all broadcasted messages' })
  @ApiResponse({ status: 200, description: 'Returns message log' })
  @Get('mesh/messages')
  public getMessages() {
    return this.service.getMessageLog();
  }
}

// ==========================================
// MODULE DEFINITION
// ==========================================

@Module({
  controllers: [DisasterResponseController],
  providers: [DisasterResponseService],
  exports: [DisasterResponseService]
})
export class DisasterResponseModule {}