import { Controller, Get, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';

/**
 * DTO for signing the Executive Order Security Directives (EO-SEC-023 & EO-SEC-024)
 */
export class SignDirectiveDto {
  signerRole: string;
  signerName: string;
  cryptographicSignature: string;
  timestamp: string;
}

/**
 * DTO for triggering a global logistics supply chain alert
 */
export class LogisticsAlertDto {
  source: string;
  message: string;
  priceSpikePercentage: number;
  affectedElements: string[];
}

interface LogisticsNode {
  id: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'STANDBY';
  capacity: number;
  securedTailingRights: boolean;
}

@Controller('api/order/23-24')
export class Order2324Controller {
  private isSigned = false;
  private signatureDetails: SignDirectiveDto | null = null;
  private systemStatus: 'STANDBY' | 'ACTIVE' | 'CRITICAL' = 'STANDBY';
  private activeAlerts: Array<{ timestamp: string; details: LogisticsAlertDto }> = [];
  
  private logisticsNodes: LogisticsNode[] = [
    { id: 'NODE-NV-01', location: 'Nevada Desert Storage Complex', status: 'STANDBY', capacity: 85, securedTailingRights: true },
    { id: 'NODE-CO-02', location: 'Colorado Tailings Site', status: 'STANDBY', capacity: 90, securedTailingRights: true },
    { id: 'NODE-CA-03', location: 'Mountain Pass Facility', status: 'STANDBY', capacity: 95, securedTailingRights: true },
    { id: 'NODE-UT-04', location: 'Utah Extraction Hub', status: 'STANDBY', capacity: 70, securedTailingRights: false }
  ];

  /**
   * GET /api/order/23-24/narrative
   * Returns the original historical and systemic vulnerability analysis narrative.
   */
  @Get('narrative')
  getNarrative() {
    return {
      title: 'EXECUTIVE ORDER SECURITY DIRECTIVE: EO-SEC-023 & EO-SEC-024',
      classification: 'RESTRICTED // NATIONAL SECURITY ASSET PROCUREMENT',
      location: 'DEPOT 14, NEVADA DESERT STORAGE COMPLEX',
      sections: [
        {
          id: 'SECTION I',
          title: 'SYSTEMIC VULNERABILITY ANALYSIS (EO-SEC-023)',
          content: `The corrugated steel roof of Depot 14 groaned under the midday Nevada heat, the metal expanding with sharp, metallic pops that echoed through the three-hundred-thousand-square-foot cavern. Inside, the air was a stagnant soup of ozone, decaying cardboard, and the bitter, alkaline dust blown in from the surrounding salt flats. Marcus stood before a towering rack of rusted steel drums, each stenciled with faded yellow alphanumeric codes. These drums held the physical reality of national vulnerability: unprocessed monazite sands and low-grade neodymium-praseodymium carbonates. Undersecretary Vance did not look at the drums. He was staring at his encrypted mobile device, his thumb flicking rapidly through a feed of market tickers and political briefings. The air conditioning unit in his temporary field office hummed a high-pitched, failing whine, struggling against the 104-degree desert heat. Vanceâ€™s tailored charcoal suit was already ruined, dark patches of sweat blooming beneath his arms.`
        },
        {
          id: 'SECTION II',
          title: 'THE LEGAL SUBTERFUGE (EO-SEC-024)',
          content: `Pursuant to 50 U.S.C. Â§ 98e(a)(5) and (6), the National Defense Stockpile Manager is hereby authorized to execute automated material exchanges and disposal of obsolete forms of strategic materials, provided that such transactions are processed through certified, non-governmental clearinghouses utilizing automated algorithmic valuation models to minimize market disruption and administrative overhead...`
        },
        {
          id: 'SECTION III',
          title: 'REAL-TIME EXECUTION & IMMEDIATE THREATS',
          content: `A sharp, rhythmic chiming cut through the hum of the failing air conditioner. It wasn't Vance's phone. It was the ruggedized tablet. Marcus stepped closer to the screen. A red banner was flashing across the top of the terminal interface indicating an immediate export ban on all heavy rare earth elements (HREE) from Beijing.`
        }
      ]
    };
  }

  /**
   * GET /api/order/23-24/status
   * Retrieves the current status of the decentralized acquisition protocol.
   */
  @Get('status')
  getStatus() {
    return {
      directives: {
        'EO-SEC-023': { status: this.isSigned ? 'ACTIVE' : 'PENDING' },
        'EO-SEC-024': { status: this.isSigned ? 'ACTIVE' : 'PENDING' }
      },
      decentralizedAcquisitionProtocol: this.isSigned ? 'INITIALIZED' : 'INACTIVE',
      systemStatus: this.systemStatus,
      signature: this.signatureDetails,
      activeAlerts: this.activeAlerts,
      nodesSummary: {
        total: this.logisticsNodes.length,
        active: this.logisticsNodes.filter(n => n.status === 'ACTIVE').length,
        securedTailingRights: this.logisticsNodes.filter(n => n.securedTailingRights).length
      }
    };
  }

  /**
   * POST /api/order/23-24/sign
   * Executes the cryptographic signing of the directives, activating the decentralized protocol.
   */
  @Post('sign')
  @HttpCode(HttpStatus.OK)
  signDirective(@Body() dto: SignDirectiveDto) {
    if (this.isSigned) {
      throw new HttpException('Directives are already cryptographically signed and active.', HttpStatus.BAD_REQUEST);
    }

    if (!dto.cryptographicSignature || !dto.signerRole) {
      throw new HttpException('Invalid signature payload. Cryptographic signature and role are required.', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    this.isSigned = true;
    this.signatureDetails = {
      ...dto,
      timestamp: new Date().toISOString()
    };
    this.systemStatus = 'ACTIVE';

    // Automatically activate all nodes with secured tailing rights
    this.logisticsNodes = this.logisticsNodes.map(node => {
      if (node.securedTailingRights) {
        return { ...node, status: 'ACTIVE' };
      }
      return node;
    });

    return {
      message: 'EO-SEC-023 & EO-SEC-024 STATUS: ACTIVE.',
      protocol: 'DECENTRALIZED ACQUISITION PROTOCOL INITIALIZED.',
      action: 'DEPLOYING SMART CONTRACTS TO PRIVATE LOGISTICS NODES.',
      nodesActivated: this.logisticsNodes.filter(n => n.status === 'ACTIVE').map(n => n.id)
    };
  }

  /**
   * POST /api/order/23-24/trigger-alert
   * Simulates an incoming global supply chain disruption or export ban.
   */
  @Post('trigger-alert')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerAlert(@Body() dto: LogisticsAlertDto) {
    const alert = {
      timestamp: new Date().toISOString(),
      details: dto
    };

    this.activeAlerts.push(alert);
    this.systemStatus = 'CRITICAL';

    if (this.isSigned) {
      // If signed, the system automatically mitigates the exposure by locking in tailing rights
      return {
        status: 'MITIGATED',
        message: 'Global logistics alert received. Decentralized protocol active. Locking in domestic tailing rights at pre-panic prices.',
        alertDetails: alert
      };
    } else {
      return {
        status: 'UNMITIGATED_EXPOSURE',
        message: 'Global logistics alert received. WARNING: Decentralized protocol inactive. Defense industrial base runtime: 42 days.',
        alertDetails: alert
      };
    }
  }

  /**
   * GET /api/order/23-24/nodes
   * Lists all private logistics nodes coordinating the micro-refining pipeline.
   */
  @Get('nodes')
  getNodes() {
    return {
      nodes: this.logisticsNodes,
      totalCapacityMetric: 'Tons/Day (Refined NdPr Equivalent)'
    };
  }
}