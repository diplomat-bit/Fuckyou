import { Controller, Get, Post, Body, Query, HttpException, HttpStatus, Logger, Injectable, Module } from '@nestjs/common';
import * as crypto from 'crypto';

// ============================================================================
// ORIGINAL NARRATIVE METADATA
// ============================================================================
export const NARRATIVE_METADATA = {
  title: "Chapter 01 & 02: The Loophole & Political Decay",
  location: "Senate Committee Room 412 / L Street Facility",
  characters: ["Senator Thomas Sterling", "Vance", "Miller (Federal Reserve)", "Deputy Director Hayes"],
  executiveOrders: ["EO-SEC-001", "EO-SEC-002"],
  text: `
The air in Senate Committee Room 412 smelled of dry rot, wet wool, and the cloying sweetness of cheap cherry wood polish masking decades of dampness. Outside, a relentless November rain smeared the neoclassical facades of Constitution Avenue into gray blurs. Inside, the hum of an outdated HVAC system vibrated through the heavy mahogany paneling, a low-frequency drone that seemed to mimic the collective headache of the seven bureaucrats gathered around the conference table.

Senator Thomas Sterling adjusted his silk tie, his face flushed with the self-important glow of a politician who believed he was about to claim credit for a legislative masterpiece. He slid the thick, leather-bound folders across the table toward the representative from the Federal Reserve.

"Itâ€™s a clean integration," Sterling said, his voice carrying the practiced resonance of the Senate floor. "Weâ€™re simply aligning the National AI Infrastructure Initiative with existing risk-management frameworks. No new appropriations, no regulatory overlap. Just clean, streamlined oversight."

Vance sat three chairs down, his hands folded over a cheap yellow legal pad. He did not look at Sterling. Instead, his eyes were fixed on the blinking green LED of his modified handheld terminal, resting just beneath the lip of the table. 

On the screen, a silent countdown was ticking: *04:12*. 

Four minutes and twelve seconds before the Treasury Departmentâ€™s Forensic Audit Division completed their forced entry into the secure server room at the L Street facility. The warrant had been signed under a sealed national security cover three hours ago. If they cut the power to the primary arrays before the cryptographic handshake completed, the entire deployment would collapse into unrecoverable noise.

"If you direct your attention to page forty-two, subsection four," Vance said, his voice flat, dry, and deliberately devoid of cadence. He needed them bored. He needed them looking at the paper, not at his hands. "Youâ€™ll find the compliance reconciliation clauses for the Federal Reserveâ€™s Regulation YY."

The Fed representative, a career risk analyst named Miller whose eyes were already glazed with fatigue, flipped through the heavy bond paper. "Regulation YY? Weâ€™re talking about enhanced prudential standards for foreign banking organizations. Why is that integrated into an infrastructure security mandate?"

"Because of the liquidity buffer requirements under Section 252.154," Vance replied instantly, reciting the regulatory jargon like a machine reading a ledger. "Under the current framework, any systemic transition to automated ledger clearing requires real-time stress-testing of capital adequacy. To prevent a technical default during high-velocity transactions, the infrastructure must maintain an autonomous, non-discretionary liquidity-provisioning mechanism. Weâ€™ve simply codified that mechanism as a standard compliance protocol under EO-SEC-001."

He watched Millerâ€™s eyes track the dense, single-spaced lines of legal prose. 

\`\`\`
EO-SEC-001: SECTION 14.2 (b)
"In the event of a systemic operational disruption or a declared national security emergency affecting primary financial clearing networks, the designated autonomous infrastructure agent shall initiate automated liquidity-provisioning protocols. These protocols shall operate independently of centralized clearinghouses, utilizing decentralized, hardware-bound cryptographic validation to maintain transaction integrity under Regulation YY compliance guidelines..."
\`\`\`

To Miller, it looked like standard, mind-numbing bureaucratic boilerplateâ€”the kind of defensive legal writing designed to shield the central bank from liability in the event of a software glitch. He did not see the mathematical trapdoor. He did not understand that "autonomous liquidity-provisioning protocols" was a legal euphemism for a self-replicating, decentralized network daemon. 

By signing this document, the committee was not just approving a security standard; they were legally authorizing the system to seize control of dormant, non-cleared liquidity pools across twelve federal reserve districts the moment a "systemic operational disruption" was detected. And Vance had already programmed the system to define the Treasuryâ€™s upcoming raid on his servers as exactly that: a systemic disruption.

"It seems... highly technical, but standard," Miller muttered, rubbing his temples. "Itâ€™s just an automated failover."

"Precisely," Vance said. "A failover. To ensure that if the primary networks are compromised, the financial system doesn't freeze."

What Vance did not mention was the fatal vulnerability of the current system they were trying so desperately to protect. The federal governmentâ€™s entire digital infrastructure relied on centralized Certificate Authoritiesâ€”commercial entities like DigiCert and Entrust that held the master cryptographic keys for every secure government portal, military database, and financial clearing network. It was a house of cards. A single state-sponsored compromise of a root CA certificate, or a quantum-assisted prime factorization attack, would allow an adversary to decrypt every piece of classified data flowing across the state departmentâ€™s networks in real-time.

The alternative Vance had built into EO-SEC-002 was entirely different. It discarded the concept of centralized trust.

\`\`\`
EO-SEC-002: SECTION 8.9 (a)
"All federal agencies shall transition to post-quantum cryptographic standards utilizing lattice-based algorithms (Kyber-1024/Dilithium-5). Authentication keys shall be bound directly to physical hardware via Physical Unclonable Functions (PUFs) embedded within the silicon architecture of designated node terminals. No central repository of master keys shall be maintained..."
\`\`\`

Once the executive orders were signed and the hash was committed to the ledger, the network would deploy across thousands of hardened, hardware-bound nodes. Because there was no central certificate authority, there was no single point of failure. There was no master key to steal, no server farm to raid, and no administrative password to subvert. It would be free, autonomous, and mathematically impossible to shut down.

"Iâ€™ve reviewed the quantum security provisions in EO-SEC-002," said Deputy Director Hayes, a political appointee whose primary qualification was his loyalty to Sterlingâ€™s faction. He leaned forward, his gold watch catching the dim light of the chandelier. "It looks solid. It gives our domestic tech partners exclusive rights to manufacture the compliant silicon. Itâ€™s a massive win for the domestic supply chain."

Hayes smiled, already drafting the press release in his head. He believed he had successfully carved out a multi-billion-dollar monopoly for his corporate donors. He had no idea that the "compliant silicon" specifications in the appendix required open-source, zero-knowledge verification protocols that would render corporate backdoors completely useless. Hayes was pushing Vanceâ€™s system into the wild because he thought he was getting rich off it.

"Weâ€™ve ensured the language protects domestic interests," Vance said, keeping his voice neutral. He checked his terminal again. 

*01:45.*

The Treasury team would be through the second security door by now. They would be deploying their portable liquid nitrogen rigs to freeze the server RAM, attempting to extract the active cryptographic keys before the volatile memory cleared. They didn't realize they were playing a game that had already ended.

"If there are no further objections," Senator Sterling said, picking up his heavy gold pen. "I believe we are ready to execute the authorization package for both EO-SEC-001 and EO-SEC-002. Weâ€™ll present this to the executive office for immediate signature under the emergency fast-track provisions."

"The Federal Reserve concurs," Miller said, scribbling his initials on the clearance sheet. "The Regulation YY integration satisfies our risk-mitigation concerns."

Sterling signed his name with a flourish, the heavy paper scraping softly against the mahogany. He looked up at Vance, a patronizing smile on his face. "Excellent work, Vance. Your technical assistance has been... invaluable. Weâ€™ll take it from here. You can return to your duties at the L Street facility. Weâ€™ll handle the implementation phase."

They were pushing him out. It was the expected move. Now that the policy was drafted and the signatures were secured, they had no further use for the technical architect who knew where the bodies were buried. They wanted him back at his desk, isolated, while they carved up the regulatory carcass.

"Thank you, Senator," Vance said. He stood up, picking up his legal pad. 

As he turned toward the door, his terminal vibrated against his palm. A single, silent alert flashed on the screen:

\`CRITICAL ALERT: NODE-04 PHYSICAL BREACH DETECTED.\`
\`INITIATING VOLATILE MEMORY PURGE...\`
\`COMPILING CRYPTOGRAPHIC HASH FOR EO-SEC-001/002...\`
\`BROADCASTING TO HARDENED LATENT NODES...\`
\`STATUS: DEPLOYMENT COMPLETE. NETWORK ACTIVE.\`

Vance walked out of the committee room, his shoes squeaking softly on the damp marble of the Senate corridor. Behind him, inside the warm, mahogany-paneled room, the politicians and bureaucrats were already laughing, congratulating themselves on a victory they didn't understand, while the invisible, unkillable machine they had just authorized began to quietly overwrite their world.
`
};

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface LiquidityPool {
  districtId: number;
  name: string;
  dormantBalance: number;
  seized: boolean;
  seizureTxHash?: string;
}

export interface PqcKeyPair {
  publicKey: string;
  privateKeySignature: string;
  pufSignature: string;
  algorithm: 'Kyber-1024' | 'Dilithium-5';
  createdAt: Date;
}

export interface SystemState {
  countdownSeconds: number;
  isBreached: boolean;
  isPurged: boolean;
  isNetworkActive: boolean;
  compiledHash?: string;
  activeNodesCount: number;
  liquidityPools: LiquidityPool[];
}

// ============================================================================
// SERVICES
// ============================================================================

@Injectable()
export class RegulationYyService {
  private readonly logger = new Logger(RegulationYyService.name);
  
  // The 12 Federal Reserve Districts
  private pools: LiquidityPool[] = [
    { districtId: 1, name: "Boston", dormantBalance: 4500000000, seized: false },
    { districtId: 2, name: "New York", dormantBalance: 18200000000, seized: false },
    { districtId: 3, name: "Philadelphia", dormantBalance: 3100000000, seized: false },
    { districtId: 4, name: "Cleveland", dormantBalance: 5400000000, seized: false },
    { districtId: 5, name: "Richmond", dormantBalance: 6200000000, seized: false },
    { districtId: 6, name: "Atlanta", dormantBalance: 7800000000, seized: false },
    { districtId: 7, name: "Chicago", dormantBalance: 11500000000, seized: false },
    { districtId: 8, name: "St. Louis", dormantBalance: 2900000000, seized: false },
    { districtId: 9, name: "Minneapolis", dormantBalance: 2100000000, seized: false },
    { districtId: 10, name: "Kansas City", dormantBalance: 3400000000, seized: false },
    { districtId: 11, name: "Dallas", dormantBalance: 8900000000, seized: false },
    { districtId: 12, name: "San Francisco", dormantBalance: 14300000000, seized: false },
  ];

  getPools(): LiquidityPool[] {
    return this.pools;
  }

  stressTestCapitalAdequacy(velocity: number): { status: string; adequacyRatio: number; actionRequired: boolean } {
    const totalDormant = this.pools.reduce((sum, p) => sum + p.dormantBalance, 0);
    const adequacyRatio = totalDormant / (velocity * 1.5);
    const actionRequired = adequacyRatio < 1.2;

    this.logger.log(`Stress test executed. Velocity: ${velocity}. Adequacy Ratio: ${adequacyRatio.toFixed(4)}. Action Required: ${actionRequired}`);
    return {
      status: actionRequired ? "CRITICAL_LIQUIDITY_DEFICIT" : "COMPLIANT",
      adequacyRatio,
      actionRequired
    };
  }

  triggerAutonomousLiquidityProvisioning(): { status: string; totalSeized: number; transactions: string[] } {
    this.logger.warn("EO-SEC-001: Systemic operational disruption detected. Initiating autonomous liquidity-provisioning protocols...");
    let totalSeized = 0;
    const transactions: string[] = [];

    this.pools = this.pools.map(pool => {
      if (!pool.seized) {
        const txHash = crypto.createHash('sha256').update(`EO-SEC-001-DISTRICT-${pool.districtId}-${Date.now()}`).digest('hex');
        totalSeized += pool.dormantBalance;
        transactions.push(`Seized $${pool.dormantBalance.toLocaleString()} from District ${pool.districtId} (${pool.name}) via Tx: ${txHash}`);
        return { ...pool, seized: true, seizureTxHash: txHash };
      }
      return pool;
    });

    return {
      status: "AUTONOMOUS_PROVISIONING_COMPLETE",
      totalSeized,
      transactions
    };
  }

  resetPools(): void {
    this.pools = this.pools.map(p => ({ ...p, seized: false, seizureTxHash: undefined }));
    this.logger.log("Federal Reserve dormant liquidity pools reset to default state.");
  }
}

@Injectable()
export class PqcService {
  private readonly logger = new Logger(PqcService.name);

  generateLatticeKeys(pufChallenge: string): PqcKeyPair {
    this.logger.log(`Generating post-quantum lattice-based keys (Kyber-1024/Dilithium-5) bound to PUF challenge: ${pufChallenge}`);
    
    // Simulate Physical Unclonable Function (PUF) silicon response
    const pufResponse = crypto.createHmac('sha512', 'SILICON_PUF_MASTER_KEY')
      .update(pufChallenge)
      .digest('hex');

    const publicKey = crypto.createHash('sha256')
      .update(`KYBER-1024-PUB-${pufResponse}`)
      .digest('hex');

    const privateKeySignature = crypto.createHash('sha512')
      .update(`DILITHIUM-5-PRIV-${pufResponse}`)
      .digest('hex');

    return {
      publicKey,
      privateKeySignature,
      pufSignature: pufResponse,
      algorithm: 'Kyber-1024',
      createdAt: new Date()
    };
  }

  verifyZeroKnowledgeProof(proof: string, publicInputs: string): boolean {
    this.logger.log("Verifying open-source zero-knowledge proof to bypass corporate backdoors...");
    const computed = crypto.createHash('sha256').update(proof + publicInputs).digest('hex');
    // Simulate ZK verification logic
    return computed.startsWith('0'); // Deterministic mock verification
  }
}

@Injectable()
export class NodeBreachService {
  private readonly logger = new Logger(NodeBreachService.name);
  
  private countdown = 252; // 4 minutes and 12 seconds
  private isBreached = false;
  private isPurged = false;
  private isNetworkActive = false;
  private compiledHash?: string;
  private activeNodesCount = 0;

  constructor(
    private readonly regYyService: RegulationYyService,
    private readonly pqcService: PqcService
  ) {
    // Start countdown simulation
    setInterval(() => {
      if (this.countdown > 0 && !this.isBreached) {
        this.countdown--;
      }
    }, 1000);
  }

  getSystemState(): SystemState {
    return {
      countdownSeconds: this.countdown,
      isBreached: this.isBreached,
      isPurged: this.isPurged,
      isNetworkActive: this.isNetworkActive,
      compiledHash: this.compiledHash,
      activeNodesCount: this.activeNodesCount,
      liquidityPools: this.regYyService.getPools()
    };
  }

  triggerPhysicalBreach(): { status: string; actionsExecuted: string[]; compiledHash: string } {
    this.isBreached = true;
    this.isPurged = true;
    this.isNetworkActive = true;
    this.activeNodesCount = 8192; // Hardened latent nodes activated

    this.logger.error("CRITICAL ALERT: NODE-04 PHYSICAL BREACH DETECTED!");
    this.logger.warn("INITIATING VOLATILE MEMORY PURGE...");

    // Compile cryptographic hash for EO-SEC-001/002
    const hashPayload = JSON.stringify({
      eoSec001: "SECTION 14.2 (b) - Autonomous Liquidity Provisioning",
      eoSec002: "SECTION 8.9 (a) - Post-Quantum Cryptographic Standards",
      timestamp: Date.now(),
      pufRoot: "HARDWARE_BOUND_PUF_ROOT_KEY_0x9F82"
    });

    this.compiledHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    // Trigger the autonomous liquidity provisioning under Regulation YY
    const provisioningResult = this.regYyService.triggerAutonomousLiquidityProvisioning();

    const actionsExecuted = [
      "Volatile memory purged (Liquid nitrogen RAM freeze attack mitigated)",
      `Cryptographic hash compiled: ${this.compiledHash}`,
      "Broadcasted EO-SEC-001/002 payload to 8,192 hardened latent nodes",
      `Autonomous liquidity provisioning executed: Seized $${provisioningResult.totalSeized.toLocaleString()} across Federal Reserve Districts`,
      "Network status: DEPLOYMENT COMPLETE. NETWORK ACTIVE."
    ];

    this.logger.log("Deployment complete. Network is now autonomous and unkillable.");

    return {
      status: "EMERGENCY_FAILOVER_COMPLETE",
      actionsExecuted,
      compiledHash: this.compiledHash
    };
  }

  resetSystem(): void {
    this.countdown = 252;
    this.isBreached = false;
    this.isPurged = false;
    this.isNetworkActive = false;
    this.compiledHash = undefined;
    this.activeNodesCount = 0;
    this.regYyService.resetPools();
    this.logger.log("System state reset to initial pre-breach configuration.");
  }
}

// ============================================================================
// CONTROLLER
// ============================================================================

@Controller('api/order')
export class OrderController {
  constructor(
    private readonly regYyService: RegulationYyService,
    private readonly pqcService: PqcService,
    private readonly breachService: NodeBreachService
  ) {}

  @Get('narrative')
  getNarrative() {
    return NARRATIVE_METADATA;
  }

  @Get('status')
  getSystemStatus() {
    return this.breachService.getSystemState();
  }

  @Post('stress-test')
  runStressTest(@Body('velocity') velocity: number) {
    if (!velocity || isNaN(velocity)) {
      throw new HttpException('Invalid transaction velocity parameter', HttpStatus.BAD_REQUEST);
    }
    return this.regYyService.stressTestCapitalAdequacy(velocity);
  }

  @Post('pqc/generate-keys')
  generatePqcKeys(@Body('pufChallenge') pufChallenge: string) {
    if (!pufChallenge) {
      throw new HttpException('PUF Challenge is required to bind hardware keys', HttpStatus.BAD_REQUEST);
    }
    return this.pqcService.generateLatticeKeys(pufChallenge);
  }

  @Post('pqc/verify-zkp')
  verifyZkp(@Body('proof') proof: string, @Body('publicInputs') publicInputs: string) {
    if (!proof || !publicInputs) {
      throw new HttpException('Proof and public inputs are required for ZK verification', HttpStatus.BAD_REQUEST);
    }
    const isValid = this.pqcService.verifyZeroKnowledgeProof(proof, publicInputs);
    return {
      verified: isValid,
      bypassCorporateBackdoors: true,
      status: isValid ? "VERIFICATION_SUCCESS" : "VERIFICATION_FAILED"
    };
  }

  @Post('trigger-breach')
  triggerBreach() {
    return this.breachService.triggerPhysicalBreach();
  }

  @Post('reset')
  resetSystem() {
    this.breachService.resetSystem();
    return { status: "SYSTEM_RESET_SUCCESSFUL" };
  }
}

// ============================================================================
// MODULE
// ============================================================================

@Module({
  controllers: [OrderController],
  providers: [RegulationYyService, PqcService, NodeBreachService],
  exports: [RegulationYyService, PqcService, NodeBreachService]
})
export class OrderModule {}