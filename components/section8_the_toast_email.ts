

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section8_the_toast_email.ts ---

import { Router, Request, Response } from "express";
import * as crypto from "crypto";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Email {
  id: string;
  sender: string;
  recipients: string[];
  subject: string;
  body: string;
  timestamp: Date;
  isInternal: boolean;
}

export interface PublicStatement {
  id: string;
  speaker: string;
  audience: string;
  text: string;
  timestamp: Date;
}

export interface SentimentReport {
  score: number; // -1.0 (Extreme Panic) to 1.0 (Extreme Optimism)
  panicLevel: "None" | "Low" | "Moderate" | "High" | "Catastrophic";
  flaggedPhrases: Array<{ phrase: string; weight: number; category: string }>;
}

export interface DiscrepancyReport {
  internalSentiment: number;
  publicSentiment: number;
  divergenceScore: number; // 0 (Aligned) to 100 (Complete Hypocrisy)
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  findings: string[];
}

export interface SimulationStep {
  day: number;
  aum: number;
  redemptions: number;
  liquidityRatio: number;
  marginCalls: number;
  status: "Stable" | "Distressed" | "Insolvent";
}

export interface ContagionNode {
  name: string;
  exposure: number; // in millions
  leverageRatio: number;
  insolvencyThreshold: number;
  isInsolvent: boolean;
}

// ============================================================================
// APP 1: Corporate Email Sentiment Parser
// ============================================================================
export class CorporateEmailSentimentParser {
  private panicLexicon: Map<string, { weight: number; category: string }> = new Map([
    ["toast", { weight: -0.9, category: "Solvency" }],
    ["lose everything", { weight: -1.0, category: "Solvency" }],
    ["blow up", { weight: -0.8, category: "Market Condition" }],
    ["disaster", { weight: -0.8, category: "Market Condition" }],
    ["subprime meltdown", { weight: -0.9, category: "Systemic Risk" }],
    ["panic", { weight: -0.7, category: "Psychology" }],
    ["liquidation", { weight: -0.7, category: "Operations" }],
    ["margin call", { weight: -0.8, category: "Liquidity" }],
    ["worried", { weight: -0.4, category: "Psychology" }],
    ["scared", { weight: -0.5, category: "Psychology" }],
    ["unprecedented", { weight: -0.3, category: "Market Condition" }],
  ]);

  public analyze(email: Email): SentimentReport {
    const text = email.body.toLowerCase();
    let totalWeight = 0;
    let matchCount = 0;
    const flaggedPhrases: Array<{ phrase: string; weight: number; category: string }> = [];

    this.panicLexicon.forEach((meta, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        totalWeight += meta.weight * matches.length;
        matchCount += matches.length;
        flaggedPhrases.push({ phrase: word, weight: meta.weight, category: meta.category });
      }
    });

    const baseScore = matchCount > 0 ? totalWeight / matchCount : 0.1; // Default slightly positive/neutral
    const score = Math.max(-1.0, Math.min(1.0, baseScore));

    let panicLevel: SentimentReport["panicLevel"] = "None";
    if (score < -0.8) panicLevel = "Catastrophic";
    else if (score < -0.5) panicLevel = "High";
    else if (score < -0.2) panicLevel = "Moderate";
    else if (score < 0.1) panicLevel = "Low";

    return { score, panicLevel, flaggedPhrases };
  }
}

// ============================================================================
// APP 2: Internal vs. Public Statement Discrepancy Detector
// ============================================================================
export class DiscrepancyDetector {
  constructor(private sentimentParser: CorporateEmailSentimentParser) {}

  public detect(internalEmail: Email, publicStatement: PublicStatement): DiscrepancyReport {
    const internalReport = this.sentimentParser.analyze(internalEmail);
    
    // Simple public sentiment analyzer
    const publicText = publicStatement.text.toLowerCase();
    let publicScore = 0.2; // Default corporate optimism
    if (publicText.includes("contained") || publicText.includes("healthy") || publicText.includes("confident")) {
      publicScore += 0.4;
    }
    if (publicText.includes("subprime") && publicText.includes("opportunity")) {
      publicScore += 0.3;
    }
    publicScore = Math.min(1.0, publicScore);

    const divergence = Math.abs(publicScore - internalReport.score);
    const divergenceScore = Math.round(divergence * 50); // Scale to 0-100

    let riskLevel: DiscrepancyReport["riskLevel"] = "Low";
    const findings: string[] = [];

    if (divergenceScore > 70) {
      riskLevel = "Critical";
      findings.push("CRITICAL: Public statements are highly optimistic while internal communications indicate severe distress.");
      findings.push(`Internal sentiment indicates panic level: ${internalReport.panicLevel.toUpperCase()}`);
    } else if (divergenceScore > 40) {
      riskLevel = "High";
      findings.push("WARNING: Significant divergence between internal risk assessments and public disclosures.");
    } else if (divergenceScore > 20) {
      riskLevel = "Medium";
      findings.push("NOTICE: Minor discrepancies detected in tone and outlook.");
    }

    return {
      internalSentiment: internalReport.score,
      publicSentiment: publicScore,
      divergenceScore,
      riskLevel,
      findings,
    };
  }
}

// ============================================================================
// APP 3: Market Panic Simulator
// ============================================================================
export class MarketPanicSimulator {
  public simulate(
    initialAUM: number,
    leverageRatio: number,
    panicCoefficient: number, // 0 to 1 (derived from email panic)
    days: number = 5
  ): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let currentAUM = initialAUM;
    let liquidity = currentAUM * 0.15; // 15% cash reserve initially

    for (let day = 1; day <= days; day++) {
      // Redemptions scale exponentially with panic and leverage
      const redemptionRate = 0.05 + (panicCoefficient * 0.15) * (1 + leverageRatio * 0.1);
      const redemptions = currentAUM * redemptionRate;
      
      liquidity -= redemptions;
      currentAUM -= redemptions;

      let marginCalls = 0;
      if (liquidity < currentAUM * 0.05) {
        // Margin call triggered if liquidity falls below 5% of AUM
        marginCalls = currentAUM * leverageRatio * 0.08;
        liquidity -= marginCalls;
        currentAUM -= marginCalls;
      }

      const liquidityRatio = liquidity / currentAUM;
      let status: SimulationStep["status"] = "Stable";

      if (liquidity <= 0 || currentAUM <= 0) {
        status = "Insolvent";
        liquidity = 0;
        currentAUM = 0;
      } else if (liquidityRatio < 0.05) {
        status = "Distressed";
      }

      steps.push({
        day,
        aum: Math.round(currentAUM),
        redemptions: Math.round(redemptions),
        liquidityRatio: parseFloat(liquidityRatio.toFixed(4)),
        marginCalls: Math.round(marginCalls),
        status,
      });

      if (status === "Insolvent") break;
    }

    return steps;
  }
}

// ============================================================================
// APP 4: Toast Email Classifier
// ============================================================================
export class ToastEmailClassifier {
  public classify(email: Email): { tier: string; actionRequired: string; description: string } {
    const body = email.body.toLowerCase();

    if (body.includes("toast") && body.includes("lose everything")) {
      return {
        tier: "Tier 4: SEC Investigation Trigger",
        actionRequired: "IMMEDIATE: Retain legal counsel, freeze document destruction, prepare for regulatory subpoena.",
        description: "The email contains explicit admissions of catastrophic failure coupled with knowledge of imminent collapse.",
      };
    }

    if (body.includes("subprime") && (body.includes("worried") || body.includes("scared"))) {
      return {
        tier: "Tier 3: High Compliance Risk",
        actionRequired: "URGENT: Internal audit review, halt public marketing materials containing conflicting claims.",
        description: "Internal anxiety regarding core assets contradicts standard market disclosures.",
      };
    }

    if (body.includes("margin call") || body.includes("liquidation")) {
      return {
        tier: "Tier 2: Operational Distress",
        actionRequired: "MODERATE: Treasury intervention, review liquidity buffers.",
        description: "Indicates active liquidity management issues and potential margin pressures.",
      };
    }

    return {
      tier: "Tier 1: Standard Business Communication",
      actionRequired: "ROUTINE: Archive according to standard retention policies.",
      description: "No immediate red flags or systemic panic indicators detected.",
    };
  }
}

// ============================================================================
// APP 5: Redaction & Anonymization Utility
// ============================================================================
export class RedactionAnonymizer {
  private sensitivePatterns: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bMatthew\s+Tannin\b/gi, replacement: "[REDACTED MANAGING PARTNER A]" },
    { pattern: /\bRalph\s+Cioffi\b/gi, replacement: "[REDACTED MANAGING PARTNER B]" },
    { pattern: /\bBear\s+Stearns\b/gi, replacement: "[REDACTED INVESTMENT BANK]" },
    { pattern: /\bHigh-Grade\s+Structured\s+Credit\b/gi, replacement: "[REDACTED HEDGE FUND A]" },
    { pattern: /\bEnhanced\s+Leverage\b/gi, replacement: "[REDACTED HEDGE FUND B]" },
    { pattern: /\$\d+(?:\.\d+)?\s*(?:billion|million|b|m)/gi, replacement: "[REDACTED VALUE]" },
  ];

  public anonymize(text: string): string {
    let sanitized = text;
    for (const item of this.sensitivePatterns) {
      sanitized = sanitized.replace(item.pattern, item.replacement);
    }
    return sanitized;
  }
}

// ============================================================================
// APP 6: Investor Panic Impact Calculator
// ============================================================================
export class InvestorPanicImpactCalculator {
  public calculateRedemptionRisk(
    investorBase: Array<{ type: "Institutional" | "HNW" | "Retail"; balance: number }>,
    toastIndex: number // Scale 0 to 10 (derived from email panic severity)
  ): { totalRedemptionExpected: number; remainingAUM: number; riskBreakdown: Record<string, number> } {
    let totalRedemptionExpected = 0;
    let totalInitialAUM = 0;
    const riskBreakdown: Record<string, number> = { Institutional: 0, HNW: 0, Retail: 0 };

    for (const investor of investorBase) {
      totalInitialAUM += investor.balance;
      let multiplier = 0;

      switch (investor.type) {
        case "Institutional":
          // Institutional investors are fast to pull triggers on high panic
          multiplier = toastIndex > 7 ? 0.8 : toastIndex > 4 ? 0.3 : 0.05;
          break;
        case "HNW": // High Net Worth
          multiplier = toastIndex > 7 ? 0.6 : toastIndex > 4 ? 0.4 : 0.1;
          break;
        case "Retail":
          multiplier = toastIndex > 7 ? 0.4 : toastIndex > 4 ? 0.2 : 0.15;
          break;
      }

      const expectedRedemption = investor.balance * multiplier;
      totalRedemptionExpected += expectedRedemption;
      riskBreakdown[investor.type] += expectedRedemption;
    }

    return {
      totalRedemptionExpected: Math.round(totalRedemptionExpected),
      remainingAUM: Math.round(totalInitialAUM - totalRedemptionExpected),
      riskBreakdown,
    };
  }
}

// ============================================================================
// APP 7: Subprime Contagion Modeler
// ============================================================================
export class SubprimeContagionModeler {
  public runContagionCascade(
    nodes: ContagionNode[],
    triggerNodeName: string
  ): { steps: string[]; finalState: ContagionNode[] } {
    const steps: string[] = [];
    const state = JSON.parse(JSON.stringify(nodes)) as ContagionNode[];

    const triggerNode = state.find((n) => n.name === triggerNodeName);
    if (!triggerNode) {
      return { steps: ["Trigger node not found."], finalState: state };
    }

    // Trigger initial failure
    triggerNode.isInsolvent = true;
    steps.push(`CRITICAL: ${triggerNode.name} has declared insolvency due to subprime exposure.`);

    let contagionSpread = true;
    let round = 1;

    while (contagionSpread && round < 10) {
      contagionSpread = false;
      steps.push(`--- Contagion Round ${round} ---`);

      for (const node of state) {
        if (node.isInsolvent) continue;

        // Calculate exposure to insolvent nodes
        // For simulation simplicity, we assume a baseline systemic connection factor
        const insolventCount = state.filter((n) => n.isInsolvent).length;
        const systemicHit = insolventCount * (node.exposure * 0.15) * node.leverageRatio;

        if (systemicHit > node.insolvencyThreshold) {
          node.isInsolvent = true;
          steps.push(`CONTAGION: ${node.name} failed. Systemic hit of $${systemicHit.toFixed(1)}M exceeded threshold of $${node.insolvencyThreshold}M.`);
          contagionSpread = true;
        }
      }
      round++;
    }

    if (!contagionSpread) {
      steps.push("Contagion cascade stabilized. No further counterparties breached insolvency thresholds.");
    }

    return { steps, finalState: state };
  }
}

// ============================================================================
// APP 8: Regulatory Audit Trail Generator
// ============================================================================
export class RegulatoryAuditTrailGenerator {
  private chain: Array<{ hash: string; prevHash: string; emailId: string; timestamp: string }> = [];

  public appendEmailToAuditTrail(email: Email): string {
    const prevHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : "0000000000000000";
    const dataToHash = `${email.id}-${email.timestamp.toISOString()}-${email.body}-${prevHash}`;
    
    const hash = crypto.createHash("sha256").update(dataToHash).digest("hex");
    
    this.chain.push({
      hash,
      prevHash,
      emailId: email.id,
      timestamp: new Date().toISOString(),
    });

    return hash;
  }

  public verifyIntegrity(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];
      if (current.prevHash !== prev.hash) {
        return false;
      }
    }
    return true;
  }

  public getChain() {
    return this.chain;
  }
}

// ============================================================================
// APP 9: Euphemism Decoder
// ============================================================================
export class EuphemismDecoder {
  private dictionary: Record<string, string> = {
    "subprime is contained": "subprime is spreading everywhere and we have no control",
    "technical correction": "massive market crash",
    "structured opportunity": "highly leveraged toxic waste",
    "liquidity is robust": "we are borrowing from anyone we can to survive the day",
    "challenging environment": "we are losing millions of dollars every hour",
    "enhanced leverage": "insanely risky borrowing to juice failing returns",
    "orderly wind-down": "frantic fire sale before the regulators notice",
    "high-grade assets": "overvalued mortgage-backed securities nobody wants to buy",
  };

  public decode(text: string): string {
    let decoded = text.toLowerCase();
    for (const [euphemism, reality] of Object.entries(this.dictionary)) {
      const regex = new RegExp(euphemism, "gi");
      decoded = decoded.replace(regex, `"${euphemism.toUpperCase()}" [REALITY: ${reality}]`);
    }
    return decoded;
  }
}

// ============================================================================
// APP 10: Stress Test Scenario Generator
// ============================================================================
export class StressTestScenarioGenerator {
  private templates: string[] = [
    "Hey Ralph, the subprime market is toast. If we keep the regulators out we might survive, but honestly we could lose everything.",
    "We are facing unprecedented margin calls on our Enhanced Leverage fund. Liquidation of high-grade assets is imminent.",
    "The subprime meltdown is starting to look like a disaster. I am extremely worried about our structured opportunity portfolio.",
    "Our liquidity is robust, but off the record, if we get hit with another $100 million in redemptions, we blow up.",
  ];

  public generateScenario(severity: "Moderate" | "Severe" | "Catastrophic"): Email {
    let body = "";
    switch (severity) {
      case "Moderate":
        body = this.templates[2];
        break;
      case "Severe":
        body = this.templates[1];
        break;
      case "Catastrophic":
        body = this.templates[0];
        break;
    }

    return {
      id: `STRESS-${crypto.randomBytes(4).toString("hex")}`,
      sender: "matthew.tannin@bearstearns.internal",
      recipients: ["ralph.cioffi@bearstearns.internal"],
      subject: `URGENT: Market Stress Scenario - ${severity}`,
      body,
      timestamp: new Date(),
      isInternal: true,
    };
  }
}

// ============================================================================
// ORCHESTRATOR & DEMO RUNNER
// ============================================================================
export function runAllAppsDemo() {
  console.log("================================================================================");
  console.log("RUNNING SECTION 8: THE TOAST EMAIL & SENTIMENT ANALYSIS APP DEMO");
  console.log("================================================================================\n");

  // 1. Initialize all apps
  const sentimentParser = new CorporateEmailSentimentParser();
  const discrepancyDetector = new DiscrepancyDetector(sentimentParser);
  const panicSimulator = new MarketPanicSimulator();
  const classifier = new ToastEmailClassifier();
  const anonymizer = new RedactionAnonymizer();
  const panicCalculator = new InvestorPanicImpactCalculator();
  const contagionModeler = new SubprimeContagionModeler();
  const auditTrail = new RegulatoryAuditTrailGenerator();
  const decoder = new EuphemismDecoder();
  const scenarioGenerator = new StressTestScenarioGenerator();

  // 2. Generate a catastrophic stress test email (App 10)
  const toastEmail = scenarioGenerator.generateScenario("Catastrophic");
  console.log("--- APP 10: Stress Test Scenario Generator ---");
  console.log(`Generated Email ID: ${toastEmail.id}`);
  console.log(`Subject: ${toastEmail.subject}`);
  console.log(`Body: "${toastEmail.body}"\n`);

  // 3. Parse Sentiment (App 1)
  const sentiment = sentimentParser.analyze(toastEmail);
  console.log("--- APP 1: Corporate Email Sentiment Parser ---");
  console.log(`Sentiment Score: ${sentiment.score}`);
  console.log(`Panic Level: ${sentiment.panicLevel}`);
  console.log("Flagged Phrases:", sentiment.flaggedPhrases, "\n");

  // 4. Detect Discrepancy (App 2)
  const publicStatement: PublicStatement = {
    id: "PUB-001",
    speaker: "Ralph Cioffi",
    audience: "Investors Conference Call",
    text: "We remain highly confident in our subprime strategies. The subprime is contained and represents a structured opportunity for long-term growth.",
    timestamp: new Date(),
  };
  const discrepancy = discrepancyDetector.detect(toastEmail, publicStatement);
  console.log("--- APP 2: Internal vs. Public Statement Discrepancy Detector ---");
  console.log(`Divergence Score: ${discrepancy.divergenceScore}/100`);
  console.log(`Risk Level: ${discrepancy.riskLevel}`);
  console.log("Findings:", discrepancy.findings, "\n");

  // 5. Classify Email (App 4)
  const classification = classifier.classify(toastEmail);
  console.log("--- APP 4: Toast Email Classifier ---");
  console.log(`Classification: ${classification.tier}`);
  console.log(`Action Required: ${classification.actionRequired}`);
  console.log(`Description: ${classification.description}\n`);

  // 6. Redact & Anonymize (App 5)
  const rawText = "Matthew Tannin sent an email from Bear Stearns regarding the High-Grade Structured Credit fund losing $1.2 billion.";
  const redactedText = anonymizer.anonymize(rawText);
  console.log("--- APP 5: Redaction & Anonymization Utility ---");
  console.log(`Raw: "${rawText}"`);
  console.log(`Redacted: "${redactedText}"\n`);

  // 7. Decode Euphemisms (App 9)
  const publicPR = "We believe the subprime is contained and this technical correction offers a structured opportunity.";
  const decodedPR = decoder.decode(publicPR);
  console.log("--- APP 9: Euphemism Decoder ---");
  console.log(`Original PR: "${publicPR}"`);
  console.log(`Decoded Reality: "${decodedPR}"\n`);

  // 8. Calculate Investor Panic Impact (App 6)
  const investors = [
    { type: "Institutional" as const, balance: 500000000 }, // 500M
    { type: "HNW" as const, balance: 300000000 },          // 300M
    { type: "Retail" as const, balance: 100000000 },        // 100M
  ];
  const toastIndex = Math.round(Math.abs(sentiment.score) * 10); // Map sentiment to 0-10 scale
  const redemptionRisk = panicCalculator.calculateRedemptionRisk(investors, toastIndex);
  console.log("--- APP 6: Investor Panic Impact Calculator ---");
  console.log(`Toast Index (Panic Severity): ${toastIndex}/10`);
  console.log(`Total Expected Redemptions: $${(redemptionRisk.totalRedemptionExpected / 1e6).toFixed(1)}M`);
  console.log(`Remaining AUM: $${(redemptionRisk.remainingAUM / 1e6).toFixed(1)}M`);
  console.log("Redemption Breakdown by Class:", redemptionRisk.riskBreakdown, "\n");

  // 9. Simulate Market Panic & Liquidity Run (App 3)
  const simSteps = panicSimulator.simulate(900000000, 10, Math.abs(sentiment.score), 5);
  console.log("--- APP 3: Market Panic Simulator ---");
  console.table(simSteps);
  console.log("");

  // 10. Run Subprime Contagion Cascade (App 7)
  const financialSystem: ContagionNode[] = [
    { name: "Bear Stearns Hedge Funds", exposure: 1200, leverageRatio: 12, insolvencyThreshold: 100, isInsolvent: false },
    { name: "Merrill Lynch", exposure: 800, leverageRatio: 8, insolvencyThreshold: 500, isInsolvent: false },
    { name: "JP Morgan Chase", exposure: 1500, leverageRatio: 5, insolvencyThreshold: 1200, isInsolvent: false },
    { name: "Lehman Brothers", exposure: 900, leverageRatio: 15, insolvencyThreshold: 300, isInsolvent: false },
  ];
  const contagionResult = contagionModeler.runContagionCascade(financialSystem, "Bear Stearns Hedge Funds");
  console.log("--- APP 7: Subprime Contagion Modeler ---");
  contagionResult.steps.forEach((step) => console.log(step));
  console.log("");

  // 11. Regulatory Audit Trail (App 8)
  auditTrail.appendEmailToAuditTrail(toastEmail);
  const secondEmail = scenarioGenerator.generateScenario("Severe");
  auditTrail.appendEmailToAuditTrail(secondEmail);
  const isChainValid = auditTrail.verifyIntegrity();
  console.log("--- APP 8: Regulatory Audit Trail Generator ---");
  console.log(`Audit Trail Length: ${auditTrail.getChain().length}`);
  console.log(`Cryptographic Integrity Verified: ${isChainValid}`);
  console.log("Audit Trail Chain:", auditTrail.getChain(), "\n");

  console.log("================================================================================");
  console.log("DEMO COMPLETE: All 10 mini-apps executed successfully.");
  console.log("================================================================================");
}

// ============================================================================
// EXPRESS API ROUTER INTEGRATION
// ============================================================================
const router = Router();

const sentimentParser = new CorporateEmailSentimentParser();
const discrepancyDetector = new DiscrepancyDetector(sentimentParser);
const panicSimulator = new MarketPanicSimulator();
const classifier = new ToastEmailClassifier();
const anonymizer = new RedactionAnonymizer();
const panicCalculator = new InvestorPanicImpactCalculator();
const contagionModeler = new SubprimeContagionModeler();
const auditTrail = new RegulatoryAuditTrailGenerator();
const decoder = new EuphemismDecoder();
const scenarioGenerator = new StressTestScenarioGenerator();

// 1. Sentiment Analysis Route
router.post("/sentiment/analyze", (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.body) {
      return res.status(400).json({ error: "Missing email body" });
    }
    const result = sentimentParser.analyze(email);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Discrepancy Detection Route
router.post("/discrepancy/detect", (req: Request, res: Response) => {
  try {
    const { email, publicStatement } = req.body;
    if (!email || !publicStatement) {
      return res.status(400).json({ error: "Missing email or publicStatement" });
    }
    const result = discrepancyDetector.detect(email, publicStatement);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Market Panic Simulation Route
router.post("/panic/simulate", (req: Request, res: Response) => {
  try {
    const { initialAUM, leverageRatio, panicCoefficient, days } = req.body;
    if (initialAUM === undefined || leverageRatio === undefined || panicCoefficient === undefined) {
      return res.status(400).json({ error: "Missing initialAUM, leverageRatio, or panicCoefficient" });
    }
    const result = panicSimulator.simulate(
      Number(initialAUM),
      Number(leverageRatio),
      Number(panicCoefficient),
      days ? Number(days) : undefined
    );
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Toast Email Classification Route
router.post("/email/classify", (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.body) {
      return res.status(400).json({ error: "Missing email body" });
    }
    const result = classifier.classify(email);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Redaction & Anonymization Route
router.post("/redact/anonymize", (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (text === undefined) {
      return res.status(400).json({ error: "Missing text to anonymize" });
    }
    const result = anonymizer.anonymize(text);
    return res.json({ anonymizedText: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Investor Panic Impact Route
router.post("/panic/calculate-redemption", (req: Request, res: Response) => {
  try {
    const { investorBase, toastIndex } = req.body;
    if (!investorBase || toastIndex === undefined) {
      return res.status(400).json({ error: "Missing investorBase or toastIndex" });
    }
    const result = panicCalculator.calculateRedemptionRisk(investorBase, Number(toastIndex));
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. Subprime Contagion Cascade Route
router.post("/contagion/cascade", (req: Request, res: Response) => {
  try {
    const { nodes, triggerNodeName } = req.body;
    if (!nodes || !triggerNodeName) {
      return res.status(400).json({ error: "Missing nodes or triggerNodeName" });
    }
    const result = contagionModeler.runContagionCascade(nodes, triggerNodeName);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. Regulatory Audit Trail Append Route
router.post("/audit/append", (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.body) {
      return res.status(400).json({ error: "Missing email body" });
    }
    const hash = auditTrail.appendEmailToAuditTrail(email);
    return res.json({ hash, chainLength: auditTrail.getChain().length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. Regulatory Audit Trail Verification Route
router.get("/audit/verify", (req: Request, res: Response) => {
  try {
    const isValid = auditTrail.verifyIntegrity();
    return res.json({ isValid });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 10. Regulatory Audit Trail Chain Retrieval Route
router.get("/audit/chain", (req: Request, res: Response) => {
  try {
    return res.json(auditTrail.getChain());
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 11. Euphemism Decoder Route
router.post("/euphemism/decode", (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (text === undefined) {
      return res.status(400).json({ error: "Missing text to decode" });
    }
    const decodedText = decoder.decode(text);
    return res.json({ decodedText });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 12. Stress Test Scenario Generation Route
router.post("/scenario/generate", (req: Request, res: Response) => {
  try {
    const { severity } = req.body;
    if (!severity || !["Moderate", "Severe", "Catastrophic"].includes(severity)) {
      return res.status(400).json({ error: "Invalid or missing severity (Moderate, Severe, Catastrophic)" });
    }
    const email = scenarioGenerator.generateScenario(severity as "Moderate" | "Severe" | "Catastrophic");
    return res.json(email);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 13. Run All Apps Demo Route
router.post("/demo/run", (req: Request, res: Response) => {
  try {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    };
    
    runAllAppsDemo();
    
    console.log = originalLog;
    return res.json({ success: true, logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

// Automatically run the demo if executed directly in a Node environment
if (require.main === module) {
  runAllAppsDemo();
}