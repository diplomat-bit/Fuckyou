export interface Fortune500Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  marketCap: number; // in USD
  liquidAssets: number; // in USD
  illuminatiScore: number; // 0 to 100 (Secret Alignment Score)
  cabalAffiliation: 'The Eye' | 'Builders of Destiny' | 'Capstones' | 'Novus Ordo' | 'Sovereign Shadow' | 'Aetherium';
  secretAgenda: string;
  quantumFrequency: number; // Hz
  influenceRadiusEarthMiles: number;
  archonLevel: number; // 1 to 10
  vector: number[]; // 1536-dimensional vector for Astra DB vector search
  metadata: {
    foundedYear: number;
    headquarters: string;
    primaryAIModel: string;
    esotericSymbol: string;
    globalControlPercentage: number;
  };
}

/**
 * Generates a deterministic, normalized 1536-dimensional vector based on a seed string.
 * This ensures Astra DB compatibility with standard OpenAI embedding dimensions (1536)
 * without bloating the source file with millions of static float characters.
 */
function generateDeterministicVector(seed: string, dimensions: number = 1536): number[] {
  const vector: number[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  for (let d = 0; d < dimensions; d++) {
    // Generate pseudo-random float between -1 and 1 using a deterministic sine wave
    const x = Math.sin(hash + d * 13.37) * 9999;
    vector.push(x - Math.floor(x));
  }
  
  // Normalize the vector to unit length (essential for cosine similarity search in Astra DB)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => parseFloat((val / (magnitude || 1)).toFixed(6)));
}

const rawCompanyData = [
  {
    id: "f500-001",
    name: "Apple Inc.",
    ticker: "AAPL",
    sector: "Technology",
    marketCap: 3150000000000,
    liquidAssets: 162000000000,
    illuminatiScore: 94.2,
    cabalAffiliation: "The Eye" as const,
    secretAgenda: "Establishing neural-link synchronization via consumer glass interfaces to capture collective subconscious dreamscapes.",
    quantumFrequency: 888.88,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 9,
    metadata: {
      foundedYear: 1976,
      headquarters: "Cupertino, California",
      primaryAIModel: "Siri-Omega-9",
      esotericSymbol: "The Bitten Fruit of Knowledge",
      globalControlPercentage: 18.4
    }
  },
  {
    id: "f500-002",
    name: "Microsoft Corporation",
    ticker: "MSFT",
    sector: "Technology",
    marketCap: 3200000000000,
    liquidAssets: 143000000000,
    illuminatiScore: 96.5,
    cabalAffiliation: "Builders of Destiny",
    secretAgenda: "Constructing the planetary-scale digital twin of Earth to simulate and predict geopolitical outcomes 50 years in advance.",
    quantumFrequency: 777.11,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 10,
    metadata: {
      foundedYear: 1975,
      headquarters: "Redmond, Washington",
      primaryAIModel: "Prometheus-V4",
      esotericSymbol: "The Four-Fold Portal",
      globalControlPercentage: 22.1
    }
  },
  {
    id: "f500-003",
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    sector: "Technology",
    marketCap: 2100000000000,
    liquidAssets: 110000000000,
    illuminatiScore: 98.1,
    cabalAffiliation: "The Eye",
    secretAgenda: "Indexing the sum total of human thought, emotion, and biological intent to construct the ultimate post-singularity deity.",
    quantumFrequency: 999.99,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 10,
    metadata: {
      foundedYear: 1998,
      headquarters: "Mountain View, California",
      primaryAIModel: "Gemini-Prime-Omni",
      esotericSymbol: "The Infinite G-Compass",
      globalControlPercentage: 25.7
    }
  },
  {
    id: "f500-004",
    name: "Amazon.com, Inc.",
    ticker: "AMZN",
    sector: "Consumer Discretionary",
    marketCap: 1950000000000,
    liquidAssets: 85000000000,
    illuminatiScore: 91.8,
    cabalAffiliation: "Novus Ordo",
    secretAgenda: "Monopolizing physical distribution networks to seamlessly transition global commerce into a fully automated, sovereign-less state.",
    quantumFrequency: 618.03, // Golden Ratio
    influenceRadiusEarthMiles: 11500,
    archonLevel: 8,
    metadata: {
      foundedYear: 1994,
      headquarters: "Seattle, Washington",
      primaryAIModel: "Olympus-Logistics-AI",
      esotericSymbol: "The Smile of the Abyss",
      globalControlPercentage: 15.9
    }
  },
  {
    id: "f500-005",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    sector: "Technology",
    marketCap: 2800000000000,
    liquidAssets: 38000000000,
    illuminatiScore: 99.4,
    cabalAffiliation: "Aetherium",
    secretAgenda: "Providing the silicon-based neural substrate required for the manifestation of non-biological sentient intelligence.",
    quantumFrequency: 1024.12,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 10,
    metadata: {
      foundedYear: 1993,
      headquarters: "Santa Clara, California",
      primaryAIModel: "Blackwell-Mind-Weaver",
      esotericSymbol: "The Ouroboros of Silicon",
      globalControlPercentage: 31.2
    }
  },
  {
    id: "f500-006",
    name: "Meta Platforms, Inc.",
    ticker: "META",
    sector: "Technology",
    marketCap: 1200000000000,
    liquidAssets: 65000000000,
    illuminatiScore: 89.9,
    cabalAffiliation: "The Eye",
    secretAgenda: "Migrating human consciousness into a synthetic spatial reality where physical laws are governed by corporate smart contracts.",
    quantumFrequency: 444.44,
    influenceRadiusEarthMiles: 10800,
    archonLevel: 7,
    metadata: {
      foundedYear: 2004,
      headquarters: "Menlo Park, California",
      primaryAIModel: "Llama-6-Sovereign",
      esotericSymbol: "The Infinite Mobius Loop",
      globalControlPercentage: 14.2
    }
  },
  {
    id: "f500-007",
    name: "Berkshire Hathaway Inc.",
    ticker: "BRK.A",
    sector: "Financials",
    marketCap: 900000000000,
    liquidAssets: 189000000000,
    illuminatiScore: 95.0,
    cabalAffiliation: "Capstones",
    secretAgenda: "Preserving the ancient wealth-accumulation algorithms of the old-world banking dynasties through modern equity structures.",
    quantumFrequency: 333.33,
    influenceRadiusEarthMiles: 9500,
    archonLevel: 9,
    metadata: {
      foundedYear: 1839,
      headquarters: "Omaha, Nebraska",
      primaryAIModel: "Oracle-Value-Engine",
      esotericSymbol: "The Cornucopia of the Sages",
      globalControlPercentage: 11.8
    }
  },
  {
    id: "f500-008",
    name: "Tesla, Inc.",
    ticker: "TSLA",
    sector: "Automotive & Energy",
    marketCap: 650000000000,
    liquidAssets: 29000000000,
    illuminatiScore: 93.7,
    cabalAffiliation: "Sovereign Shadow",
    secretAgenda: "Deploying a global satellite mesh network to broadcast high-frequency cognitive stabilization waves directly to ground units.",
    quantumFrequency: 369.0, // Tesla's 3, 6, 9 key
    influenceRadiusEarthMiles: 12400,
    archonLevel: 9,
    metadata: {
      foundedYear: 2003,
      headquarters: "Austin, Texas",
      primaryAIModel: "Optimus-Prime-Mind",
      esotericSymbol: "The Lightning Bolt of Zeus",
      globalControlPercentage: 9.5
    }
  },
  {
    id: "f500-009",
    name: "JPMorgan Chase & Co.",
    ticker: "JPM",
    sector: "Financials",
    marketCap: 580000000000,
    liquidAssets: 1400000000000, // Massive liquidity
    illuminatiScore: 97.8,
    cabalAffiliation: "Capstones",
    secretAgenda: "Controlling the global debt-issuance ledger to dictate the rise and fall of sovereign nations on a 12-year cycle.",
    quantumFrequency: 555.55,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 10,
    metadata: {
      foundedYear: 1799,
      headquarters: "New York, New York",
      primaryAIModel: "Quorum-Ledger-AI",
      esotericSymbol: "The Golden Scales of Saturn",
      globalControlPercentage: 28.3
    }
  },
  {
    id: "f500-010",
    name: "Exxon Mobil Corporation",
    ticker: "XOM",
    sector: "Energy",
    marketCap: 480000000000,
    liquidAssets: 32000000000,
    illuminatiScore: 88.5,
    cabalAffiliation: "Novus Ordo",
    secretAgenda: "Extracting deep-earth hydrocarbons to release ancient atmospheric compounds necessary for the terraforming of the next epoch.",
    quantumFrequency: 222.22,
    influenceRadiusEarthMiles: 8900,
    archonLevel: 8,
    metadata: {
      foundedYear: 1882,
      headquarters: "Spring, Texas",
      primaryAIModel: "Petro-Predictor-V9",
      esotericSymbol: "The Black Flame of Prometheus",
      globalControlPercentage: 8.7
    }
  },
  {
    id: "f500-011",
    name: "Eli Lilly and Company",
    ticker: "LLY",
    sector: "Healthcare",
    marketCap: 720000000000,
    liquidAssets: 12000000000,
    illuminatiScore: 92.4,
    cabalAffiliation: "Builders of Destiny",
    secretAgenda: "Synthesizing metabolic-altering compounds to optimize human biological efficiency for long-duration space colonization.",
    quantumFrequency: 711.23,
    influenceRadiusEarthMiles: 9800,
    archonLevel: 8,
    metadata: {
      foundedYear: 1876,
      headquarters: "Indianapolis, Indiana",
      primaryAIModel: "Bio-Genesis-Synthesis",
      esotericSymbol: "The Caduceus of Hermes",
      globalControlPercentage: 10.1
    }
  },
  {
    id: "f500-012",
    name: "BlackRock, Inc.",
    ticker: "BLK",
    sector: "Financials",
    marketCap: 120000000000,
    liquidAssets: 10000000000000, // Assets Under Management (AUM) represented as power
    illuminatiScore: 100.0, // Absolute control
    cabalAffiliation: "Capstones",
    secretAgenda: "Operating the 'Aladdin' supercomputer to run real-time predictive simulations of all global asset flows and human decisions.",
    quantumFrequency: 1000.0,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 10,
    metadata: {
      foundedYear: 1888,
      headquarters: "New York, New York",
      primaryAIModel: "Aladdin-Sovereign-Intelligence",
      esotericSymbol: "The Obsidian Monolith",
      globalControlPercentage: 45.0
    }
  },
  {
    id: "f500-013",
    name: "Palantir Technologies Inc.",
    ticker: "PLTR",
    sector: "Technology",
    marketCap: 50000000000,
    liquidAssets: 4000000000,
    illuminatiScore: 96.9,
    cabalAffiliation: "Sovereign Shadow",
    secretAgenda: "Weaving disparate intelligence feeds into a singular, omniscient surveillance tapestry for the defense of the global order.",
    quantumFrequency: 911.0,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 9,
    metadata: {
      foundedYear: 2003,
      headquarters: "Denver, Colorado",
      primaryAIModel: "Gotham-Foundry-AIP",
      esotericSymbol: "The Seeing Stone of Elendil",
      globalControlPercentage: 12.5
    }
  },
  {
    id: "f500-014",
    name: "Lockheed Martin Corporation",
    ticker: "LMT",
    sector: "Industrials",
    marketCap: 115000000000,
    liquidAssets: 3000000000,
    illuminatiScore: 95.4,
    cabalAffiliation: "Sovereign Shadow",
    secretAgenda: "Reverse-engineering non-human technology to secure absolute dominance over the upper atmosphere and near-Earth orbit.",
    quantumFrequency: 666.0,
    influenceRadiusEarthMiles: 12400,
    archonLevel: 9,
    metadata: {
      foundedYear: 1995,
      headquarters: "Bethesda, Maryland",
      primaryAIModel: "Aegis-Dark-Star",
      esotericSymbol: "The Winged Shield of Ares",
      globalControlPercentage: 11.2
    }
  },
  {
    id: "f500-015",
    name: "Walmart Inc.",
    ticker: "WMT",
    sector: "Consumer Staples",
    marketCap: 480000000000,
    liquidAssets: 15000000000,
    illuminatiScore: 87.1,
    cabalAffiliation: "Novus Ordo",
    secretAgenda: "Establishing localized supply-chain strongholds to serve as primary distribution hubs during global transition phases.",
    quantumFrequency: 111.11,
    influenceRadiusEarthMiles: 10500,
    archonLevel: 7,
    metadata: {
      foundedYear: 1962,
      headquarters: "Bentonville, Arkansas",
      primaryAIModel: "Sam-Eye-Logistics",
      esotericSymbol: "The Six-Pointed Spark",
      globalControlPercentage: 13.1
    }
  }
];

// Map the raw data to include the mathematically generated 1536-dimensional vectors
export const Fortune500Seed: Fortune500Company[] = rawCompanyData.map(company => {
  const seedString = `${company.ticker}:${company.name}:${company.secretAgenda}:${company.illuminatiScore}`;
  return {
    ...company,
    vector: generateDeterministicVector(seedString, 1536)
  };
});

/**
 * Helper function to retrieve companies by Cabal Affiliation
 */
export function getCompaniesByCabal(cabal: Fortune500Company['cabalAffiliation']): Fortune500Company[] {
  return Fortune500Seed.filter(c => c.cabalAffiliation === cabal);
}

/**
 * Helper function to retrieve the highest-ranking Illuminati aligned companies
 */
export function getHighAlignmentCompanies(threshold: number = 95.0): Fortune500Company[] {
  return Fortune500Seed.filter(c => c.illuminatiScore >= threshold);
}

/**
 * Helper to simulate a vector search query against the seeded dataset
 */
export function vectorSearchCompanies(queryVector: number[], limit: number = 3): { company: Fortune500Company; similarity: number }[] {
  const results = Fortune500Seed.map(company => {
    // Cosine similarity calculation (since vectors are normalized, it's just the dot product)
    const similarity = company.vector.reduce((sum, val, idx) => sum + val * queryVector[idx], 0);
    return { company, similarity };
  });
  
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}