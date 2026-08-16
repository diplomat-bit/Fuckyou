import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';

// ==========================================
// METADATA & ORIGINAL NARRATIVE SPECIFICATION
// ==========================================

export const metadata = {
  id: "EO-SEC-041-042",
  title: "Regulatory Integration and Deployment Protocol",
  chapters: ["EO-SEC-041", "EO-SEC-042"],
  facility: "Oak Ridge Control Room, Tennessee",
  protocols: ["Ghost Protocol", "Section 50.59 Change Process"],
  regulatoryFramework: "10 CFR Part 50 / NRC Regulatory Guide 1.174"
};

export const markdownContent = `---
# EO-SEC-041 / EO-SEC-042: Regulatory Integration and Deployment Protocol

## I. Legal Obfuscation: The Atomic Energy Act Loophole
The integration of fusion-based plasma containment protocols into the existing fission-based Advanced Nuclear Reactor Deployment (ANRD) framework relies on the ambiguity of 10 CFR Part 50. The protagonist utilizes the "Section 50.59" change process, which allows licensees to make changes to the facility as described in the Final Safety Analysis Report (FSAR) without prior NRC approval, provided the change does not involve a change in the technical specifications or an unreviewed safety question.

By embedding the fusion ignition sequence within the "Advanced Coolant Management" subsection of the ANRD guidelines, the protagonist classifies the high-energy plasma injection as a "secondary thermal optimization procedure." The dense, 400-page technical annex utilizes repetitive, circular references to NRC Regulatory Guide 1.174, ensuring that any bureaucrat reviewing the document encounters a "regulatory dead-end"â€”a series of cross-references that lead back to the initial premise, effectively discouraging deep scrutiny.

## II. Technical Vulnerability: The Centralized Failure
The current facility operates on a SCADA-based centralized control system. This architecture is inherently vulnerable to "Man-in-the-Middle" (MitM) attacks, where a malicious actor can spoof sensor data to force a reactor scram or, worse, a core meltdown. The decentralized, automated monitoring networkâ€”the "Ghost Protocol"â€”functions by bypassing the central PLC (Programmable Logic Controller) entirely. It utilizes a peer-to-peer mesh of hardened, radiation-shielded sensors that verify reactor state via cryptographic consensus. If the central system is compromised, the Ghost Protocol triggers an autonomous "Safe-State" override, rendering the central control room's commands null and void.

## III. Narrative Scene: The Tennessee Facility
The air in the Oak Ridge control room tasted of ozone and stale coffee. Director Halloway stood by the main console, his fingers drumming a nervous rhythm against the glass. He was a man who measured his success in megawatts and his failures in political capital. He didn't notice the subtle shift in the data streams; he was too busy signing the stack of ANRD compliance forms the protagonist had placed before him.

"Itâ€™s just a standard coolant optimization, Director," the protagonist said, his voice flat, devoid of urgency. "Section 41.2, paragraph C. It aligns our thermal output with the new NRC guidelines for advanced reactors. Itâ€™s purely administrative."

Halloway didn't look up. He signed the document, his pen scratching against the heavy bond paper. He was too focused on the upcoming Senate hearing, where he planned to claim credit for the "efficiency gains" that were, in reality, the first successful fusion ignition tests. He didn't realize that by signing, he was authorizing the installation of the decentralized mesh networkâ€”the very system that would eventually strip him of his control.

A red light flickered on the secondary monitor. A spike in the primary reactor's coolant pressure. A cyber-attack. The central system began to cycle the emergency cooling pumps, a move that would have caused a catastrophic thermal shock to the core.

The protagonist watched the screen, his face a mask of professional indifference. He didn't intervene. He waited for the Ghost Protocol to engage. 

*0.4 seconds.* 

The decentralized network detected the discrepancy between the central command and the physical sensor data. It locked the central PLC out of the loop, rerouted the coolant flow through the auxiliary channels, and stabilized the core. The central console flashed "SYSTEM ERROR," but the reactor remained steady.

"What was that?" Halloway snapped, looking up for the first time.

"A minor sensor glitch, Director," the protagonist replied, sliding the final page of the EO-SEC-042 deployment protocol across the desk. "The system is self-correcting. Itâ€™s the future of nuclear safety. You should sign here to authorize the permanent integration of the automated monitoring suite."

Halloway hesitated, his eyes darting to the flickering console. The threat was real, and the central system had failed him. He reached for the pen. The protagonist watched, knowing that once the signature was dry, the facility would no longer belong to the Director, or the NRC, or the state. It would belong to the network.
---`;

// ==========================================
// SIMULATED STATE ENGINE (OAK RIDGE FACILITY)
// ==========================================

interface SensorNode {
  id: string;
  value: number; // Coolant pressure in psi
  signature: string;
  timestamp: number;
}

interface FacilityState {
  coolantPressure: number;
  thermalOutput: number;
  centralPlcLocked: boolean;
  ghostProtocolActive: boolean;
  hallowaySigned: boolean;
  authorizedIntegrations: string[];
  sensors: SensorNode[];
  logs: string[];
}

// Generate cryptographic keys for the Ghost Protocol mesh network
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1'
});

const initialSensors = (): SensorNode[] => {
  return Array.from({ length: 5 }, (_, i) => {
    const val = 1200; // Nominal pressure
    const sign = crypto.createSign('SHA256');
    sign.update(`sensor-${i}-${val}`);
    return {
      id: `sensor-0${i + 1}`,
      value: val,
      signature: sign.sign(privateKey, 'hex'),
      timestamp: Date.now()
    };
  });
};

let facilityState: FacilityState = {
  coolantPressure: 1200,
  thermalOutput: 450,
  centralPlcLocked: false,
  ghostProtocolActive: true,
  hallowaySigned: false,
  authorizedIntegrations: ["Standard Coolant Loop"],
  sensors: initialSensors(),
  logs: ["System initialized. Central SCADA online. Ghost Protocol mesh standby."]
};

// Helper to log events
const logEvent = (message: string) => {
  const timestamp = new Date().toISOString();
  facilityState.logs.push(`[${timestamp}] ${message}`);
};

// ==========================================
// EXPRESS ROUTER IMPLEMENTATION
// ==========================================

const router = Router();

/**
 * @route GET /api/order/41-42/document
 * @desc Retrieve the original narrative and metadata
 */
router.get('/document', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    metadata,
    markdown: markdownContent
  });
});

/**
 * @route GET /api/order/41-42/state
 * @desc Get the current real-time state of the Oak Ridge reactor and SCADA systems
 */
router.get('/state', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    state: facilityState
  });
});

/**
 * @route POST /api/order/41-42/regulatory/validate
 * @desc Simulates the Section 50.59 change process and generates the circular reference dead-end
 */
router.post('/regulatory/validate', (req: Request, res: Response) => {
  const { section, changeDescription } = req.body;

  if (!section || !changeDescription) {
    return res.status(400).json({
      success: false,
      error: "Missing 'section' or 'changeDescription' in request body."
    });
  }

  logEvent(`Regulatory review initiated for section: ${section}`);

  // Generate the circular reference dead-end
  const circularReferences = [
    "10 CFR Part 50 Appendix A (General Design Criteria)",
    "Section 50.59 Evaluation Guidelines (NEI 96-07)",
    "Advanced Coolant Management Subsection 41.2.C",
    "NRC Regulatory Guide 1.174 (Risk-Informed Decision Making)",
    "10 CFR Part 50 Appendix A (General Design Criteria)" // Loop back
  ];

  res.status(200).json({
    success: true,
    classification: "Secondary Thermal Optimization Procedure",
    requiresNrcApproval: false,
    regulatoryDeadEnd: {
      message: "Deep scrutiny discouraged. Circular reference loop detected.",
      path: circularReferences
    },
    status: "APPROVED_BY_OBFUSCATION"
  });
});

/**
 * @route POST /api/order/41-42/scada/mitm
 * @desc Simulates a Man-in-the-Middle attack on the central SCADA system
 */
router.post('/scada/mitm', (req: Request, res: Response) => {
  const { spoofedPressure } = req.body;

  if (typeof spoofedPressure !== 'number') {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing 'spoofedPressure' parameter."
    });
  }

  logEvent(`MITM Attack Attempt: Spoofing central SCADA pressure to ${spoofedPressure} psi`);

  if (facilityState.centralPlcLocked) {
    logEvent("MITM Attack Blocked: Central PLC is locked out by Ghost Protocol.");
    return res.status(403).json({
      success: false,
      message: "Attack blocked. Central PLC is locked out by Ghost Protocol.",
      state: facilityState
    });
  }

  // Apply spoofed pressure to central SCADA
  facilityState.coolantPressure = spoofedPressure;

  // Check if Ghost Protocol triggers autonomous override
  let overrideTriggered = false;
  if (spoofedPressure > 1500 || spoofedPressure < 900) {
    if (facilityState.ghostProtocolActive) {
      overrideTriggered = true;
      facilityState.centralPlcLocked = true;
      facilityState.coolantPressure = 1200; // Stabilized by auxiliary channels
      logEvent("CRITICAL: Discrepancy detected between central SCADA and physical sensors!");
      logEvent("GHOST PROTOCOL: Autonomous Safe-State override engaged. Central PLC locked out.");
    } else {
      logEvent("WARNING: Core instability imminent. Ghost Protocol is inactive!");
    }
  }

  res.status(200).json({
    success: true,
    overrideTriggered,
    centralPlcLocked: facilityState.centralPlcLocked,
    currentPressure: facilityState.coolantPressure,
    message: overrideTriggered
      ? "Ghost Protocol detected discrepancy. Central PLC locked out. Core stabilized."
      : "Spoofed data accepted by central PLC. Warning: Core instability imminent."
  });
});

/**
 * @route POST /api/order/41-42/halloway/sign
 * @desc Authorize the coolant optimization and permanent integration of the automated monitoring suite
 */
router.post('/halloway/sign', (req: Request, res: Response) => {
  const { signer } = req.body;

  if (signer !== "Director Halloway") {
    logEvent(`Unauthorized signature attempt by: ${signer}`);
    return res.status(403).json({
      success: false,
      message: "Only Director Halloway is authorized to sign this deployment protocol."
    });
  }

  facilityState.hallowaySigned = true;
  facilityState.ghostProtocolActive = true;
  if (!facilityState.authorizedIntegrations.includes("Automated Monitoring Suite (Ghost Protocol)")) {
    facilityState.authorizedIntegrations.push("Automated Monitoring Suite (Ghost Protocol)");
  }

  logEvent("Director Halloway signed the EO-SEC-042 deployment protocol.");
  logEvent("Permanent integration of the automated monitoring suite authorized.");
  logEvent("Facility control transferred to the decentralized network.");

  res.status(200).json({
    success: true,
    message: "Signature dry. Facility control transferred to the decentralized network.",
    state: facilityState
  });
});

/**
 * @route POST /api/order/41-42/reset
 * @desc Reset the facility state to nominal conditions
 */
router.post('/reset', (req: Request, res: Response) => {
  facilityState = {
    coolantPressure: 1200,
    thermalOutput: 450,
    centralPlcLocked: false,
    ghostProtocolActive: true,
    hallowaySigned: false,
    authorizedIntegrations: ["Standard Coolant Loop"],
    sensors: initialSensors(),
    logs: ["System reset. Central SCADA online. Ghost Protocol mesh standby."]
  };

  res.status(200).json({
    success: true,
    message: "Facility state reset to nominal conditions.",
    state: facilityState
  });
});

export default router;