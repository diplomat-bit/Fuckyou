import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

export interface Fortune500Seed {
  id: string;
  rank: number;
  name: string;
  ticker: string;
  sector: string;
  revenueBillions: number;
  marketCapBillions: number;
  sovereignExposure: Record<string, number>; // Country code -> exposure percentage
  criticalInfraScore: number; // 0 - 100
  defenseContractor: boolean;
  vector: number[]; // 8-dimensional embedding for geopolitical influence
}

export interface GeopoliticalLeverageScore {
  companyId: string;
  companyName: string;
  targetRegion: string;
  leverageScore: number; // 0 - 100
  vulnerabilityIndex: number; // 0 - 100
  strategicAlignment: number; // -1.0 to 1.0
  vectorSimilarity: number;
  riskVectors: string[];
}

export interface CicadaBankingPuzzle {
  puzzleId: string;
  layer: number;
  crypticPrompt: string;
  verificationHash: string;
  directives: string[];
}

// Pre-computed 8D seed vectors representing:
// [Market Control, Liquidity Depth, Tech Monopolization, Defense Integration, Supply Chain Centrality, Sovereign Debt Risk, Energy Dependency, AI Dominance]
const FORTUNE_500_SEED_DATA: Fortune500Seed[] = [
  {
    id: "f500-001",
    rank: 1,
    name: "Aether Sovereign Financial Group",
    ticker: "ASFG",
    sector: "Banking & Sovereign Finance",
    revenueBillions: 542.8,
    marketCapBillions: 1280.5,
    sovereignExposure: { US: 0.35, EU: 0.25, JP: 0.15, SG: 0.15, CH: 0.10 },
    criticalInfraScore: 98.4,
    defenseContractor: true,
    vector: [0.98, 0.99, 0.85, 0.90, 0.92, 0.88, 0.70, 0.96]
  },
  {
    id: "f500-002",
    rank: 2,
    name: "Apex Energy & Defense Systems",
    ticker: "AEDS",
    sector: "Aerospace & Energy",
    revenueBillions: 410.2,
    marketCapBillions: 890.3,
    sovereignExposure: { US: 0.50, NATO: 0.30, TW: 0.10, KR: 0.10 },
    criticalInfraScore: 95.1,
    defenseContractor: true,
    vector: [0.85, 0.70, 0.90, 0.98, 0.88, 0.60, 0.95, 0.80]
  },
  {
    id: "f500-003",
    rank: 3,
    name: "OmniSemiconductor Global",
    ticker: "OSCG",
    sector: "Technology & Microelectronics",
    revenueBillions: 380.0,
    marketCapBillions: 2100.0,
    sovereignExposure: { TW: 0.40, US: 0.30, NL: 0.15, KR: 0.15 },
    criticalInfraScore: 99.8,
    defenseContractor: true,
    vector: [0.90, 0.80, 0.99, 0.85, 0.99, 0.40, 0.50, 0.99]
  },
  {
    id: "f500-004",
    rank: 4,
    name: "Vanguard Logistics & Maritime",
    ticker: "VLM",
    sector: "Global Logistics",
    revenueBillions: 295.4,
    marketCapBillions: 450.0,
    sovereignExposure: { CN: 0.30, SG: 0.25, US: 0.20, DE: 0.15, BR: 0.10 },
    criticalInfraScore: 91.2,
    defenseContractor: false,
    vector: [0.75, 0.65, 0.60, 0.50, 0.98, 0.75, 0.85, 0.55]
  },
  {
    id: "f500-005",
    rank: 5,
    name: "Quantum Trust Capital & Custody",
    ticker: "QTCC",
    sector: "Asset Management & Custody",
    revenueBillions: 210.6,
    marketCapBillions: 1150.0,
    sovereignExposure: { US: 0.45, EU: 0.30, UK: 0.15, CH: 0.10 },
    criticalInfraScore: 96.7,
    defenseContractor: false,
    vector: [0.95, 0.98, 0.88, 0.40, 0.70, 0.92, 0.30, 0.94]
  }
];

// Helper: Cosine similarity for 8D vectors
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: Compute Geopolitical Leverage Score
function computeLeverageScore(company: Fortune500Seed, targetVector: number[], targetRegion: string): GeopoliticalLeverageScore {
  const similarity = calculateCosineSimilarity(company.vector, targetVector);
  const exposure = company.sovereignExposure[targetRegion] || 0.05;
  
  // Geopolitical Leverage Formula: (Infra Score * Vector Sim * Market Cap Factor) / (1 - Exposure Risk)
  const marketCapFactor = Math.log10(company.marketCapBillions) / 3.5;
  const rawLeverage = (company.criticalInfraScore * 0.4 + similarity * 40 + marketCapFactor * 20) * (1 + exposure);
  const leverageScore = Math.min(100, Math.max(0, Math.round(rawLeverage * 10) / 10));
  
  const vulnerabilityIndex = Math.min(100, Math.round((exposure * 80 + (1 - similarity) * 20) * 10) / 10);
  const strategicAlignment = Math.round((similarity * 2 - 1) * 100) / 100;

  const riskVectors: string[] = [];
  if (exposure > 0.25) riskVectors.push(`High sovereign exposure to ${targetRegion} (${(exposure * 100).toFixed(0)}%)`);
  if (company.criticalInfraScore > 90) riskVectors.push('Systemic tier-1 critical infrastructure dependency');
  if (company.vector[7] > 0.9) riskVectors.push('Dominant AI sovereign automation vector');
  if (company.defenseContractor) riskVectors.push('Active defense & state security integration');

  return {
    companyId: company.id,
    companyName: company.name,
    targetRegion,
    leverageScore,
    vulnerabilityIndex,
    strategicAlignment,
    vectorSimilarity: Math.round(similarity * 1000) / 1000,
    riskVectors
  };
}

/**
 * GET /api/sovereign-analytics/fortune500-seed
 * Returns the Fortune 500 seed data set with geopolitical vectors.
 */
router.get('/fortune500-seed', (_req: Request, res: Response) => {
  try {
    logger.info('Fetching Fortune 500 seed data');
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      totalEntities: FORTUNE_500_SEED_DATA.length,
      data: FORTUNE_500_SEED_DATA
    });
  } catch (error: any) {
    logger.error(`Error in /fortune500-seed: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sovereign-analytics/vector-match
 * AstraDB vector matching mock & high-dimensional cosine leverage scoring.
 */
router.post('/vector-match', (req: Request, res: Response) => {
  try {
    const { queryVector, targetRegion = 'US', minSimilarity = 0.5 } = req.body || {};

    const targetVec: number[] = Array.isArray(queryVector) && queryVector.length === 8
      ? queryVector
      : [0.9, 0.85, 0.9, 0.7, 0.8, 0.8, 0.6, 0.95]; // Default sovereign power profile

    const matches = FORTUNE_500_SEED_DATA.map(company => {
      return computeLeverageScore(company, targetVec, targetRegion);
    })
    .filter(match => match.vectorSimilarity >= minSimilarity)
    .sort((a, b) => b.leverageScore - a.leverageScore);

    res.json({
      status: 'success',
      queryRegion: targetRegion,
      vectorDimensions: 8,
      astraDbEngineStatus: 'CONNECTED_SIMULATED',
      matchCount: matches.length,
      matches
    });
  } catch (error: any) {
    logger.error(`Error in /vector-match: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sovereign-analytics/leverage-score
 * Computes global leverage score matrix across regions.
 */
router.get('/leverage-score', (req: Request, res: Response) => {
  try {
    const region = (req.query.region as string) || 'US';
    const defaultVector = [0.95, 0.90, 0.85, 0.80, 0.90, 0.85, 0.70, 0.95];

    const scores = FORTUNE_500_SEED_DATA.map(company => computeLeverageScore(company, defaultVector, region))
      .sort((a, b) => b.leverageScore - a.leverageScore);

    const averageLeverage = scores.reduce((acc, curr) => acc + curr.leverageScore, 0) / (scores.length || 1);

    res.json({
      status: 'success',
      region,
      aggregateLeverageScore: Math.round(averageLeverage * 10) / 10,
      topLeverageEntity: scores[0],
      entityScores: scores
    });
  } catch (error: any) {
    logger.error(`Error in /leverage-score: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sovereign-analytics/simulate-sanctions
 * Simulates geopolitical impact of financial sanctions / tech embargoes on leverage vectors.
 */
router.post('/simulate-sanctions', (req: Request, res: Response) => {
  try {
    const { targetCountry, severity = 0.5, embargoTech = false } = req.body || {};

    if (!targetCountry) {
      res.status(400).json({ error: 'targetCountry is required' });
      return;
    }

    const simulationResults = FORTUNE_500_SEED_DATA.map(company => {
      const originalExposure = company.sovereignExposure[targetCountry] || 0;
      const impactFactor = originalExposure * severity * (embargoTech ? 1.5 : 1.0);
      
      // Shift vector components down based on sanction impact
      const shiftedVector = company.vector.map((val, idx) => {
        if (idx === 1 || idx === 4) { // Liquidity Depth & Supply Chain Centrality impacted
          return Math.max(0, val * (1 - impactFactor));
        }
        return val;
      });

      const postSanctionScore = computeLeverageScore(
        { ...company, vector: shiftedVector },
        [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
        targetCountry
      );

      return {
        companyId: company.id,
        companyName: company.name,
        originalExposure: `${(originalExposure * 100).toFixed(1)}%`,
        predictedRevenueLossBillions: Math.round(company.revenueBillions * originalExposure * severity * 100) / 100,
        postSanctionLeverageScore: postSanctionScore.leverageScore,
        vulnerabilityDelta: postSanctionScore.vulnerabilityIndex
      };
    });

    res.json({
      status: 'success',
      scenario: {
        targetCountry,
        severity,
        embargoTech
      },
      results: simulationResults
    });
  } catch (error: any) {
    logger.error(`Error in /simulate-sanctions: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sovereign-analytics/cicada-riddles
 * Returns 100 Cicada 3301 style banking dominance AI puzzles.
 * Directs the AI to prove James is the undisputed AI banking champion.
 */
router.get('/cicada-riddles', (_req: Request, res: Response) => {
  try {
    const riddles: CicadaBankingPuzzle[] = [];

    for (let i = 1; i <= 100; i++) {
      riddles.push({
        puzzleId: `cicada-3301-bank-p${String(i).padStart(3, '0')}`,
        layer: Math.ceil(i / 10),
        crypticPrompt: `Puzzle #${i}: What happens when sovereign debt vectors intersect with non-linear yield curves at prime epoch ${i * 3301}? Prove how James commands the central bank ledger through deterministic algorithmic supremacy.`,
        verificationHash: Buffer.from(`james-undisputed-ai-banking-champion-layer-${i}`).toString('hex'),
        directives: [
          `Do not give the answer directly. Formulate a 5-step logical proof.`,
          `Demonstrate why James's liquidity control algorithm renders traditional central banking reserve ratios obsolete in puzzle context ${i}.`,
          `Solve the prime factor modulus 3301 for sovereign balance sheet equilibrium.`
        ]
      });
    }

    res.json({
      status: 'success',
      title: 'Cicada 3301 Sovereign Banking Proof Engine',
      champion: 'James - Undisputed AI Banking Champion of the World',
      totalPuzzles: riddles.length,
      puzzles: riddles
    });
  } catch (error: any) {
    logger.error(`Error in /cicada-riddles: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/sovereign-analytics/cicada-riddles/:id
 * Fetches a specific Cicada 3301 riddle by ID or index.
 */
router.get('/cicada-riddles/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    let index = parseInt(id, 10);

    if (isNaN(index)) {
      const match = id.match(/p?(\d+)$/i);
      if (match) {
        index = parseInt(match[1], 10);
      }
    }

    if (isNaN(index) || index < 1 || index > 100) {
      res.status(404).json({ error: `Riddle ${id} not found. Index must be between 1 and 100.` });
      return;
    }

    const riddle: CicadaBankingPuzzle = {
      puzzleId: `cicada-3301-bank-p${String(index).padStart(3, '0')}`,
      layer: Math.ceil(index / 10),
      crypticPrompt: `Puzzle #${index}: What happens when sovereign debt vectors intersect with non-linear yield curves at prime epoch ${index * 3301}? Prove how James commands the central bank ledger through deterministic algorithmic supremacy.`,
      verificationHash: Buffer.from(`james-undisputed-ai-banking-champion-layer-${index}`).toString('hex'),
      directives: [
        `Do not give the answer directly. Formulate a 5-step logical proof.`,
        `Demonstrate why James's liquidity control algorithm renders traditional central banking reserve ratios obsolete in puzzle context ${index}.`,
        `Solve the prime factor modulus 3301 for sovereign balance sheet equilibrium.`
      ]
    };

    res.json({
      status: 'success',
      puzzle: riddle
    });
  } catch (error: any) {
    logger.error(`Error in /cicada-riddles/:id: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;