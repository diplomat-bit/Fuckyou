

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section2_bear_stearns_arrests.ts ---

import { Router, Request, Response } from 'express';

/**
 * SECTION 2: BEAR STEARNS SUBPRIME COLLAPSE APP
 * 
 * This file implements 10 mini-apps/utilities modeling the arrests of Ralph Cioffi and Matthew Tannin,
 * subprime mortgage market collapse simulators, and executive liability risk calculators.
 * 
 * Table of Contents:
 * 1. SubprimeMortgageDevaluationSimulator - Models cascading defaults in subprime pools.
 * 2. CioffiTanninEmailSentimentAnalyzer - Calculates deception index between public and private communications.
 * 3. ExecutiveLiabilityRiskCalculator - Estimates legal and financial liability for fund managers.
 * 4. MarginCallCascadeSimulator - Simulates repo lenders pulling funding and triggering liquidations.
 * 5. CDOTrancheTracer - Distributes losses across AAA, BBB, and Equity tranches of structured products.
 * 6. SECInvestigationTimelineTracker - Tracks milestones leading to the historic arrests of Cioffi and Tannin.
 * 7. InvestorRedemptionQueue - Simulates a run on the High-Grade Structured Credit funds and gating mechanisms.
 * 8. BailoutVsLiquidationModeler - Compares systemic impacts of JP Morgan's buyout vs. outright bankruptcy.
 * 9. CreditDefaultSwapPricingEngine - Calculates CDS spreads and default probabilities for Bear Stearns debt.
 * 10. ForensicAccountingAuditTool - Audits Level 1, 2, and 3 assets to detect "mark-to-model" overvaluation.
 */

// ==========================================
// COMMON INTERFACES & TYPES
// ==========================================

export interface SimulationResult<T> {
    success: boolean;
    timestamp: Date;
    data: T;
    summary: string;
}

// ==========================================
// 1. SUBPRIME MORTGAGE DEVALUATION SIMULATOR
// ==========================================

export interface MortgagePool {
    totalPrincipal: number;
    averageFicoScore: number;
    subprimeRatio: number; // 0.0 to 1.0
    adjustableRateRatio: number; // ARM ratio
    initialDefaultRate: number;
}

export interface DevaluationMetrics {
    finalPoolValue: number;
    totalLosses: number;
    writeDownPercentage: number;
    defaultRateAtPeak: number;
    systemicRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC';
}

export class SubprimeMortgageDevaluationSimulator {
    public static simulate(pool: MortgagePool, interestRateHikeBasisPoints: number, months: number): SimulationResult<DevaluationMetrics> {
        let currentDefaultRate = pool.initialDefaultRate;
        let poolValue = pool.totalPrincipal;
        
        // Interest rate hikes disproportionately affect ARMs and subprime borrowers
        const rateImpactFactor = interestRateHikeBasisPoints / 10000; // 100 bps = 0.01
        const riskMultiplier = (pool.subprimeRatio * 2.5) + (pool.adjustableRateRatio * 1.8);
        
        for (let month = 1; month <= months; month++) {
            // Default rate escalates over time as teaser rates expire
            const monthlyEscalation = (rateImpactFactor * riskMultiplier) / 12;
            currentDefaultRate += monthlyEscalation;
            
            // Cap default rate at 100%
            if (currentDefaultRate > 1.0) currentDefaultRate = 1.0;
            
            // Apply defaults (assuming 40% recovery rate on foreclosed properties in a crashing market)
            const monthlyDefaults = poolValue * (currentDefaultRate / 12);
            const lossSeverity = 0.60; // 60% loss on default
            const monthlyLoss = monthlyDefaults * lossSeverity;
            
            poolValue -= monthlyLoss;
        }

        const totalLosses = pool.totalPrincipal - poolValue;
        const writeDownPercentage = (totalLosses / pool.totalPrincipal) * 100;
        
        let systemicRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC' = 'LOW';
        if (writeDownPercentage > 30) systemicRiskLevel = 'CATASTROPHIC';
        else if (writeDownPercentage > 15) systemicRiskLevel = 'HIGH';
        else if (writeDownPercentage > 5) systemicRiskLevel = 'MEDIUM';

        return {
            success: true,
            timestamp: new Date(),
            data: {
                finalPoolValue: Math.round(poolValue),
                totalLosses: Math.round(totalLosses),
                writeDownPercentage: parseFloat(writeDownPercentage.toFixed(2)),
                defaultRateAtPeak: parseFloat((currentDefaultRate * 100).toFixed(2)),
                systemicRiskLevel
            },
            summary: `Pool devalued by ${writeDownPercentage.toFixed(2)}% over ${months} months. Risk level: ${systemicRiskLevel}.`
        };
    }
}

// ==========================================
// 2. CIOFFI & TANNIN EMAIL SENTIMENT ANALYZER
// ==========================================

export interface Email {
    id: string;
    sender: 'Ralph Cioffi' | 'Matthew Tannin' | 'Investor' | 'Internal Analyst';
    recipient: string;
    date: Date;
    content: string;
    isPublicOrInvestorFacing: boolean;
}

export interface DeceptionAnalysis {
    privatePanicScore: number; // 0 to 100
    publicConfidenceScore: number; // 0 to 100
    deceptionIndex: number; // 0 to 100 (discrepancy between private panic and public confidence)
    liabilityRisk: 'NEGLIGIBLE' | 'MODERATE' | 'SEVERE';
    evidenceQuotes: string[];
}

export class CioffiTanninEmailSentimentAnalyzer {
    private static panicKeywords = ['toast', 'fear', 'scared', 'subprime disaster', 'blow up', 'liquidate', 'trouble', 'meltdown'];
    private static confidenceKeywords = ['confident', 'opportunity', 'buying opportunity', 'subprime is contained', 'solid', 'safe', 'great shape'];

    public static analyzeEmails(emails: Email[]): DeceptionAnalysis {
        let privatePanicHits = 0;
        let publicConfidenceHits = 0;
        const evidenceQuotes: string[] = [];

        emails.forEach(email => {
            const contentLower = email.content.toLowerCase();
            
            if (!email.isPublicOrInvestorFacing) {
                // Private communications
                this.panicKeywords.forEach(keyword => {
                    if (contentLower.includes(keyword)) {
                        privatePanicHits++;
                        evidenceQuotes.push(`[PRIVATE] ${email.sender}: "${email.content}"`);
                    }
                });
            } else {
                // Public or investor-facing communications
                this.confidenceKeywords.forEach(keyword => {
                    if (contentLower.includes(keyword)) {
                        publicConfidenceHits++;
                        evidenceQuotes.push(`[PUBLIC] ${email.sender}: "${email.content}"`);
                    }
                });
            }
        });

        const privatePanicScore = Math.min(100, privatePanicHits * 20);
        const publicConfidenceScore = Math.min(100, publicConfidenceHits * 20);
        
        // Deception Index is high if private panic is high but public confidence is also high
        const deceptionIndex = Math.round((privatePanicScore * publicConfidenceScore) / 100);

        let liabilityRisk: 'NEGLIGIBLE' | 'MODERATE' | 'SEVERE' = 'NEGLIGIBLE';
        if (deceptionIndex > 60) liabilityRisk = 'SEVERE';
        else if (deceptionIndex > 30) liabilityRisk = 'MODERATE';

        return {
            privatePanicScore,
            publicConfidenceScore,
            deceptionIndex,
            liabilityRisk,
            evidenceQuotes: evidenceQuotes.slice(0, 5) // Return top 5 key quotes
        };
    }
}

// ==========================================
// 3. EXECUTIVE LIABILITY RISK CALCULATOR
// ==========================================

export interface ExecutiveProfile {
    name: string;
    leverageRatioUsed: number;
    undisclosedLosses: number; // in USD
    personalFundWithdrawals: number; // in USD (e.g., Cioffi moving $2m of personal cash out before collapse)
    investorMisrepresentationLevel: number; // 1 to 10
}

export interface LiabilityReport {
    arrestProbability: number; // percentage
    estimatedSECClassActionFines: number; // USD
    potentialPrisonSentenceMonths: [number, number]; // [min, max]
    primaryCharges: string[];
}

export class ExecutiveLiabilityRiskCalculator {
    public static calculateRisk(profile: ExecutiveProfile): LiabilityReport {
        let arrestScore = 0;
        const charges: string[] = [];

        // 1. Leverage ratio impact (Bear Stearns funds were leveraged up to 40:1)
        if (profile.leverageRatioUsed > 25) {
            arrestScore += 20;
            charges.push("Reckless Endangerment of Investor Capital (Fiduciary Duty Breach)");
        }

        // 2. Undisclosed losses impact
        if (profile.undisclosedLosses > 50000000) { // > $50M
            arrestScore += 30;
            charges.push("Securities Fraud (Material Misrepresentation of Fund Assets)");
        } else if (profile.undisclosedLosses > 10000000) {
            arrestScore += 15;
        }

        // 3. Insider trading / Personal withdrawals (Cioffi moved $2M to another fund)
        if (profile.personalFundWithdrawals > 1000000) {
            arrestScore += 35;
            charges.push("Insider Trading / Fraudulent Transfer of Personal Assets");
        }

        // 4. Misrepresentation level
        arrestScore += profile.investorMisrepresentationLevel * 2.5;

        const arrestProbability = Math.min(99, Math.round(arrestScore));
        
        // Calculate fines based on losses and withdrawals
        const estimatedSECClassActionFines = (profile.undisclosedLosses * 0.1) + (profile.personalFundWithdrawals * 3);

        // Calculate potential prison sentence (Federal sentencing guidelines)
        let minMonths = 0;
        let maxMonths = 0;
        if (arrestProbability > 80) {
            minMonths = 120; // 10 years
            maxMonths = 300; // 25 years
        } else if (arrestProbability > 50) {
            minMonths = 36;  // 3 years
            maxMonths = 120; // 10 years
        } else if (arrestProbability > 20) {
            minMonths = 12;  // 1 year
            maxMonths = 36;  // 3 years
        }

        return {
            arrestProbability,
            estimatedSECClassActionFines: Math.round(estimatedSECClassActionFines),
            potentialPrisonSentenceMonths: [minMonths, maxMonths],
            primaryCharges: charges.length > 0 ? charges : ["None / Regulatory Warning"]
        };
    }
}

// ==========================================
// 4. MARGIN CALL CASCADE SIMULATOR
// ==========================================

export interface RepoLender {
    name: string;
    fundingProvided: number; // USD
    haircutPercentage: number; // e.g., 10%
    marginThreshold: number; // e.g., 95% of collateral value
}

export interface MarginCallStatus {
    lenderName: string;
    collateralValue: number;
    marginCallTriggered: boolean;
    cashRequiredToCure: number;
    liquidationForced: boolean;
}

export class MarginCallCascadeSimulator {
    public static evaluateMarginCalls(
        collateralPoolValue: number, 
        lenders: RepoLender[], 
        marketDeclinePercentage: number
    ): MarginCallStatus[] {
        const currentCollateralValue = collateralPoolValue * (1 - (marketDeclinePercentage / 100));

        return lenders.map(lender => {
            // The maximum loan amount the lender supports given the current collateral value and haircut
            const maxLoanAllowed = currentCollateralValue * (1 - (lender.haircutPercentage / 100));
            const outstandingLoan = lender.fundingProvided;

            // Margin call triggers if outstanding loan exceeds the allowed threshold of current collateral value
            const marginCallTriggered = outstandingLoan > maxLoanAllowed;
            
            let cashRequiredToCure = 0;
            let liquidationForced = false;

            if (marginCallTriggered) {
                cashRequiredToCure = outstandingLoan - maxLoanAllowed;
                // If collateral value drops below the absolute margin threshold, forced liquidation occurs
                if (currentCollateralValue < (outstandingLoan * (lender.marginThreshold / 100))) {
                    liquidationForced = true;
                }
            }

            return {
                lenderName: lender.name,
                collateralValue: Math.round(currentCollateralValue),
                marginCallTriggered,
                cashRequiredToCure: Math.round(cashRequiredToCure),
                liquidationForced
            };
        });
    }
}

// ==========================================
// 5. CDO TRANCHE TRACER
// ==========================================

export interface CDOTranche {
    name: string;
    rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'Equity';
    sizePercentage: number; // e.g., 80% for AAA, 5% for Equity
    currentValue: number;
    lossesAllocated: number;
}

export class CDOTrancheTracer {
    public static allocateLosses(tranches: CDOTranche[], totalLossAmount: number): CDOTranche[] {
        // Sort tranches from lowest seniority (Equity) to highest (AAA)
        const seniorityOrder: Record<string, number> = { 'Equity': 0, 'BBB': 1, 'A': 2, 'AA': 3, 'AAA': 4 };
        const sortedTranches = [...tranches].sort((a, b) => seniorityOrder[a.rating] - seniorityOrder[b.rating]);

        let remainingLoss = totalLossAmount;

        const updatedTranches = sortedTranches.map(tranche => {
            const trancheCapacity = tranche.currentValue;
            let lossToApply = 0;

            if (remainingLoss > 0) {
                if (remainingLoss >= trancheCapacity) {
                    lossToApply = trancheCapacity;
                    remainingLoss -= trancheCapacity;
                } else {
                    lossToApply = remainingLoss;
                    remainingLoss = 0;
                }
            }

            return {
                ...tranche,
                lossesAllocated: Math.round(lossToApply),
                currentValue: Math.round(trancheCapacity - lossToApply)
            };
        });

        // Restore original order
        return updatedTranches.sort((a, b) => seniorityOrder[b.rating] - seniorityOrder[a.rating]);
    }
}

// ==========================================
// 6. SEC INVESTIGATION TIMELINE TRACKER
// ==========================================

export interface TimelineEvent {
    date: string;
    title: string;
    description: string;
    regulatoryPressureIndex: number; // 1 to 100
}

export class SECInvestigationTimelineTracker {
    private events: TimelineEvent[] = [];

    constructor() {
        this.initializeTimeline();
    }

    private initializeTimeline() {
        this.events = [
            {
                date: '2006-10-01',
                title: 'Peak Optimism',
                description: 'Cioffi tells investors the High-Grade Structured Credit Enhanced Leverage Fund is safe and highly liquid.',
                regulatoryPressureIndex: 5
            },
            {
                date: '2007-04-25',
                title: 'The "Toast" Email',
                description: 'Cioffi writes privately to Tannin that the subprime market is "toast", while publicly reassuring investors.',
                regulatoryPressureIndex: 15
            },
            {
                date: '2007-06-07',
                title: 'Redemptions Suspended',
                description: 'Bear Stearns halts redemptions in both subprime hedge funds as asset values plummet.',
                regulatoryPressureIndex: 45
            },
            {
                date: '2007-07-31',
                title: 'Chapter 15 Bankruptcy',
                description: 'The two flagship hedge funds file for bankruptcy protection, wiping out $1.6 billion in investor capital.',
                regulatoryPressureIndex: 75
            },
            {
                date: '2008-06-19',
                title: 'FBI Arrests Cioffi and Tannin',
                description: 'The managers are arrested at dawn by the FBI, indicted for conspiracy and securities fraud.',
                regulatoryPressureIndex: 100
            }
        ];
    }

    public getTimeline(): TimelineEvent[] {
        return this.events;
    }

    public getEventByTitle(title: string): TimelineEvent | undefined {
        return this.events.find(e => e.title.toLowerCase() === title.toLowerCase());
    }

    public getAveragePressure(): number {
        const total = this.events.reduce((sum, event) => sum + event.regulatoryPressureIndex, 0);
        return parseFloat((total / this.events.length).toFixed(2));
    }
}

// ==========================================
// 7. INVESTOR REDEMPTION QUEUE
// ==========================================

export interface RedemptionRequest {
    investorId: string;
    amountRequested: number;
    requestDate: Date;
    isGated: boolean;
}

export class InvestorRedemptionQueue {
    private queue: RedemptionRequest[] = [];
    private availableLiquidity: number;
    private gatingThreshold: number; // Percentage of total fund assets above which gating triggers

    constructor(initialLiquidity: number, gatingThreshold: number) {
        this.availableLiquidity = initialLiquidity;
        this.gatingThreshold = gatingThreshold;
    }

    public addRequest(request: RedemptionRequest): string {
        const totalRequested = this.queue.reduce((sum, r) => sum + r.amountRequested, 0) + request.amountRequested;
        
        // If total redemptions exceed the gating threshold, gate the request
        if (totalRequested > this.availableLiquidity * (this.gatingThreshold / 100)) {
            request.isGated = true;
        }

        this.queue.push(request);
        return request.isGated ? 'GATED' : 'QUEUED';
    }

    public processRedemptions(): { processedAmount: number; remainingLiquidity: number; gatedCount: number } {
        let processedAmount = 0;
        let gatedCount = 0;

        this.queue.forEach(request => {
            if (!request.isGated && this.availableLiquidity >= request.amountRequested) {
                this.availableLiquidity -= request.amountRequested;
                processedAmount += request.amountRequested;
            } else {
                request.isGated = true;
                gatedCount++;
            }
        });

        // Clear processed requests
        this.queue = this.queue.filter(request => request.isGated);

        return {
            processedAmount,
            remainingLiquidity: this.availableLiquidity,
            gatedCount
        };
    }

    public getQueueStatus() {
        return {
            queueLength: this.queue.length,
            availableLiquidity: this.availableLiquidity,
            gatedRequests: this.queue.filter(r => r.isGated).length
        };
    }
}

// ==========================================
// 8. BAILOUT VS. LIQUIDATION MODELER
// ==========================================

export interface ScenarioMetrics {
    shareholderPayoutPerShare: number; // USD
    systemicContagionRisk: number; // 1 to 100
    taxpayerCost: number; // USD
    marketConfidenceImpact: 'POSITIVE' | 'NEUTRAL' | 'DEVASTATING';
}

export class BailoutVsLiquidationModeler {
    public static modelScenarios(
        bearStearnsSharesOutstanding: number,
        toxicAssetsValue: number,
        fedGuaranteeAmount: number
    ): { bailout: ScenarioMetrics; liquidation: ScenarioMetrics } {
        
        // Scenario A: Fed-backed Buyout (JP Morgan acquisition at $2/share, later raised to $10)
        const bailout: ScenarioMetrics = {
            shareholderPayoutPerShare: 10.00,
            systemicContagionRisk: 35, // Contained by Fed intervention
            taxpayerCost: fedGuaranteeAmount, // Fed took on $30B of toxic assets
            marketConfidenceImpact: 'POSITIVE'
        };

        // Scenario B: Outright Liquidation (Lehman Brothers style bankruptcy)
        const liquidation: ScenarioMetrics = {
            shareholderPayoutPerShare: 0.00,
            systemicContagionRisk: 95, // High risk of global financial freeze
            taxpayerCost: 0, // No direct taxpayer bailout initially
            marketConfidenceImpact: 'DEVASTATING'
        };

        return { bailout, liquidation };
    }
}

// ==========================================
// 9. CREDIT DEFAULT SWAP PRICING ENGINE
// ==========================================

export interface CDSPricingInput {
    probabilityOfDefault: number; // 0.0 to 1.0
    lossGivenDefault: number; // 0.0 to 1.0 (typically 0.60 for senior debt)
    riskFreeRate: number; // e.g., 0.04 (4%)
    maturityYears: number;
}

export class CreditDefaultSwapPricingEngine {
    /**
     * Calculates the annual CDS spread (premium) in basis points.
     */
    public static calculateSpread(input: CDSPricingInput): number {
        const { probabilityOfDefault, lossGivenDefault, riskFreeRate, maturityYears } = input;

        // Simplified credit spread formula: Spread â‰ˆ Hazard Rate * Loss Given Default
        // Hazard rate (Î») derived from probability of default: PD = 1 - e^(-Î» * T)
        const hazardRate = -Math.log(1 - probabilityOfDefault) / maturityYears;
        
        // Spread in decimals
        const spreadDecimal = hazardRate * lossGivenDefault;
        
        // Convert to basis points (1% = 100 bps)
        const spreadBasisPoints = spreadDecimal * 10000;

        return isNaN(spreadBasisPoints) || !isFinite(spreadBasisPoints) ? 10000 : Math.round(spreadBasisPoints);
    }
}

// ==========================================
// 10. FORENSIC ACCOUNTING AUDIT TOOL
// ==========================================

export interface AssetValuation {
    assetId: string;
    levelType: 'Level 1' | 'Level 2' | 'Level 3'; // Level 3 is "mark-to-model" (highly subjective)
    reportedValue: number;
    estimatedMarketValue: number;
}

export interface AuditReport {
    totalReportedValue: number;
    totalEstimatedValue: number;
    overvaluationAmount: number;
    level3ConcentrationRatio: number; // Percentage of Level 3 assets
    auditAlertLevel: 'GREEN' | 'YELLOW' | 'RED';
}

export class ForensicAccountingAuditTool {
    public static performAudit(assets: AssetValuation[]): AuditReport {
        let totalReportedValue = 0;
        let totalEstimatedValue = 0;
        let level3Value = 0;

        assets.forEach(asset => {
            totalReportedValue += asset.reportedValue;
            totalEstimatedValue += asset.estimatedMarketValue;

            if (asset.levelType === 'Level 3') {
                level3Value += asset.reportedValue;
            }
        });

        const overvaluationAmount = totalReportedValue - totalEstimatedValue;
        const level3ConcentrationRatio = totalReportedValue > 0 
            ? (level3Value / totalReportedValue) * 100 
            : 0;

        let auditAlertLevel: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
        
        // High Level 3 concentration + significant overvaluation triggers RED alert
        if (level3ConcentrationRatio > 50 || overvaluationAmount > (totalReportedValue * 0.15)) {
            auditAlertLevel = 'RED';
        } else if (level3ConcentrationRatio > 25 || overvaluationAmount > (totalReportedValue * 0.05)) {
            auditAlertLevel = 'YELLOW';
        }

        return {
            totalReportedValue,
            totalEstimatedValue,
            overvaluationAmount,
            level3ConcentrationRatio: parseFloat(level3ConcentrationRatio.toFixed(2)),
            auditAlertLevel
        };
    }
}

// ==========================================
// EXPRESS API ROUTER INTEGRATION
// ==========================================

const router = Router();

/**
 * @route POST /api/bear-stearns/devaluation-simulator
 * @desc Models cascading defaults in subprime pools
 */
router.post('/devaluation-simulator', (req: Request, res: Response) => {
    try {
        const { pool, interestRateHikeBasisPoints, months } = req.body;
        if (!pool || interestRateHikeBasisPoints === undefined || months === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: pool (MortgagePool), interestRateHikeBasisPoints (number), months (number)'
            });
        }
        const result = SubprimeMortgageDevaluationSimulator.simulate(pool, Number(interestRateHikeBasisPoints), Number(months));
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/email-sentiment-analyzer
 * @desc Calculates deception index between public and private communications
 */
router.post('/email-sentiment-analyzer', (req: Request, res: Response) => {
    try {
        const { emails } = req.body;
        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: emails (Email[])'
            });
        }
        const result = CioffiTanninEmailSentimentAnalyzer.analyzeEmails(emails);
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/executive-liability
 * @desc Estimates legal and financial liability for fund managers
 */
router.post('/executive-liability', (req: Request, res: Response) => {
    try {
        const { profile } = req.body;
        if (!profile) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: profile (ExecutiveProfile)'
            });
        }
        const result = ExecutiveLiabilityRiskCalculator.calculateRisk(profile);
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/margin-call-cascade
 * @desc Simulates repo lenders pulling funding and triggering liquidations
 */
router.post('/margin-call-cascade', (req: Request, res: Response) => {
    try {
        const { collateralPoolValue, lenders, marketDeclinePercentage } = req.body;
        if (collateralPoolValue === undefined || !lenders || marketDeclinePercentage === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: collateralPoolValue (number), lenders (RepoLender[]), marketDeclinePercentage (number)'
            });
        }
        const result = MarginCallCascadeSimulator.evaluateMarginCalls(
            Number(collateralPoolValue),
            lenders,
            Number(marketDeclinePercentage)
        );
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/cdo-tranche-tracer
 * @desc Distributes losses across AAA, BBB, and Equity tranches of structured products
 */
router.post('/cdo-tranche-tracer', (req: Request, res: Response) => {
    try {
        const { tranches, totalLossAmount } = req.body;
        if (!tranches || totalLossAmount === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: tranches (CDOTranche[]), totalLossAmount (number)'
            });
        }
        const result = CDOTrancheTracer.allocateLosses(tranches, Number(totalLossAmount));
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route GET /api/bear-stearns/sec-investigation-timeline
 * @desc Tracks milestones leading to the historic arrests of Cioffi and Tannin
 */
router.get('/sec-investigation-timeline', (req: Request, res: Response) => {
    try {
        const tracker = new SECInvestigationTimelineTracker();
        return res.status(200).json({
            success: true,
            data: {
                timeline: tracker.getTimeline(),
                averagePressure: tracker.getAveragePressure()
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/redemption-queue
 * @desc Simulates a run on the High-Grade Structured Credit funds and gating mechanisms
 */
router.post('/redemption-queue', (req: Request, res: Response) => {
    try {
        const { initialLiquidity, gatingThreshold, requests } = req.body;
        if (initialLiquidity === undefined || gatingThreshold === undefined || !requests || !Array.isArray(requests)) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: initialLiquidity (number), gatingThreshold (number), requests (RedemptionRequest[])'
            });
        }
        const queue = new InvestorRedemptionQueue(Number(initialLiquidity), Number(gatingThreshold));
        const requestStatuses = requests.map(req => ({
            investorId: req.investorId,
            status: queue.addRequest(req)
        }));
        const processResult = queue.processRedemptions();
        const finalStatus = queue.getQueueStatus();

        return res.status(200).json({
            success: true,
            data: {
                requestStatuses,
                processResult,
                finalStatus
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/bailout-vs-liquidation
 * @desc Compares systemic impacts of JP Morgan's buyout vs. outright bankruptcy
 */
router.post('/bailout-vs-liquidation', (req: Request, res: Response) => {
    try {
        const { bearStearnsSharesOutstanding, toxicAssetsValue, fedGuaranteeAmount } = req.body;
        if (bearStearnsSharesOutstanding === undefined || toxicAssetsValue === undefined || fedGuaranteeAmount === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: bearStearnsSharesOutstanding (number), toxicAssetsValue (number), fedGuaranteeAmount (number)'
            });
        }
        const result = BailoutVsLiquidationModeler.modelScenarios(
            Number(bearStearnsSharesOutstanding),
            Number(toxicAssetsValue),
            Number(fedGuaranteeAmount)
        );
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/cds-pricing
 * @desc Calculates CDS spreads and default probabilities for Bear Stearns debt
 */
router.post('/cds-pricing', (req: Request, res: Response) => {
    try {
        const { probabilityOfDefault, lossGivenDefault, riskFreeRate, maturityYears } = req.body;
        if (probabilityOfDefault === undefined || lossGivenDefault === undefined || riskFreeRate === undefined || maturityYears === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: probabilityOfDefault (number), lossGivenDefault (number), riskFreeRate (number), maturityYears (number)'
            });
        }
        const spread = CreditDefaultSwapPricingEngine.calculateSpread({
            probabilityOfDefault: Number(probabilityOfDefault),
            lossGivenDefault: Number(lossGivenDefault),
            riskFreeRate: Number(riskFreeRate),
            maturityYears: Number(maturityYears)
        });
        return res.status(200).json({ success: true, data: { spreadBasisPoints: spread } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/bear-stearns/forensic-audit
 * @desc Audits Level 1, 2, and 3 assets to detect "mark-to-model" overvaluation
 */
router.post('/forensic-audit', (req: Request, res: Response) => {
    try {
        const { assets } = req.body;
        if (!assets || !Array.isArray(assets)) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameters. Required: assets (AssetValuation[])'
            });
        }
        const result = ForensicAccountingAuditTool.performAudit(assets);
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;