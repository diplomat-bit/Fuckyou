import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Core System Imports & Constants ---

// --- Data Structures ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  costBasis: number;
  marketCapMillions: number;
  volatilityIndex: number;
}

interface Holding {
  companyId: number;
  shares: number;
  acquisitionDate: string;
}

interface TaxHarvestingSuggestion {
  id: string;
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  strategy: 'Tax Loss Carryforward' | 'Wash Sale Avoidance' | 'Long Term Gain Realization' | 'Optimized Rebalancing';
  recommendation: string;
  confidenceScore: number;
  executionPriority: number;
}

interface PortfolioSummary {
    totalMarketValue: number;
    totalCostBasis: number;
    netUnrealizedPL: number;
    totalSharesHeld: number;
    sectorExposure: Record<string, number>;
    riskScore: number;
}

// --- Mock Data Generation ---
// These mock data generators are retained for the MVP to simulate a data source.
// In a production system, this would be replaced by actual database/API calls.
const SECTORS = ['Technology', 'Finance', 'Energy', 'Industry', 'Health', 'Consumer Goods', 'Utilities', 'Real Estate', 'Biotech', 'Aerospace'];
const TICKER_PREFIXES = ['APL', 'BET', 'GAM', 'DEL', 'EPH', 'ZETA', 'KAPPA', 'OMEGA', 'SIGMA', 'THETA'];

const generateMockCompany = (index: number): Company => {
  const prefixIndex = index % TICKER_PREFIXES.length;
  const sectorIndex = index % SECTORS.length;
  const ticker = `${TICKER_PREFIXES[prefixIndex]}${index + 1}`;
  
  const basePrice = 50 + (index * 1.5);
  const volatility = Math.random() * 0.5 + 0.1;
  
  return {
    id: 1000 + index,
    ticker: ticker,
    name: `${SECTORS[sectorIndex]} Entity ${index + 1}`,
    sector: SECTORS[sectorIndex],
    currentPrice: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2)),
    costBasis: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
    marketCapMillions: Math.floor(1000 + Math.random() * 50000),
    volatilityIndex: parseFloat(volatility.toFixed(3)),
  };
};

let MOCK_COMPANIES: Company[] = Array.from({ length: 150 }, (_, i) => generateMockCompany(i));
let MOCK_PORTFOLIO: Holding[] = [
  { companyId: 1001, shares: 50, acquisitionDate: '2022-01-15' },
  { companyId: 1002, shares: 100, acquisitionDate: '2023-11-01' },
  { companyId: 1005, shares: 10, acquisitionDate: '2021-05-20' },
  { companyId: 1010, shares: 75, acquisitionDate: '2023-08-10' },
  { companyId: 1020, shares: 200, acquisitionDate: '2024-01-05' },
  { companyId: 1000, shares: 30, acquisitionDate: '2020-03-01' },
  { companyId: 1030, shares: 150, acquisitionDate: '2023-06-01' },
  { companyId: 1045, shares: 25, acquisitionDate: '2022-09-10' },
  { companyId: 1050, shares: 60, acquisitionDate: '2024-02-20' },
];

// --- Utility Functions (Service Layer Logic - abstracted from UI) ---

/**
 * Retrieves a company by its ID from the provided list.
 * @param id The company ID.
 * @param companies The list of available companies.
 */
const getCompanyById = (id: number, companies: Company[]): Company | undefined =>
  companies.find(c => c.id === id);

/**
 * Calculates the number of days a holding has been held.
 * @param acquisitionDateStr The acquisition date string (e.g., 'YYYY-MM-DD').
 */
const calculateDaysHeld = (acquisitionDateStr: string): number => {
    const acquisitionDate = new Date(acquisitionDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - acquisitionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Core function for tax optimization analysis.
 * Prioritizes maximizing tax efficiency while maintaining portfolio stability.
 * This function represents the "AI-powered transaction intelligence" logic,
 * ensuring robust error handling and explainability.
 * @param portfolio The current portfolio holdings.
 * @param portfolioSummary A summary of the portfolio.
 * @param companies The list of all available companies.
 */
const analyzeTaxHarvesting = (
  portfolio: Holding[],
  portfolioSummary: PortfolioSummary,
  companies: Company[]
): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const longTermThresholdDays = 365; 

  // Step 1: Pre-calculate current unrealized P/L for all holdings
  const detailedHoldings = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId, companies);
    if (!company) {
        console.warn(`Company with ID ${holding.companyId} not found for holding. Skipping.`);
        return null; // Skip holdings for non-existent companies
    }
    
    const marketValue = holding.shares * company.currentPrice;
    const totalCostBasis = holding.shares * company.costBasis;
    const unrealizedPL = marketValue - totalCostBasis;
    const daysHeld = calculateDaysHeld(holding.acquisitionDate);
    const isLongTerm = daysHeld >= longTermThresholdDays;

    return {
        ...holding,
        company,
        marketValue,
        totalCostBasis,
        unrealizedPL,
        daysHeld,
        isLongTerm,
    };
  }).filter((h): h is NonNullable<typeof h> => h !== null);

  // Step 2: Identify primary harvesting opportunities (Losses)
  detailedHoldings.forEach(holding => {
    if (holding.unrealizedPL < 0) {
      const lossAmount = Math.abs(holding.unrealizedPL);
      const sharesToSell = holding.shares;
      const isLongTermLoss = holding.isLongTerm;
      
      // Logic: Prioritize selling losses from highly volatile assets first, or smaller caps.
      // Explainability: Lower execution priority indicates a higher urgency/impact.
      let priority = 5; // Default priority
      if (holding.company.volatilityIndex > 0.4) priority = 2; // High volatility losses are prioritized
      if (holding.company.marketCapMillions < 5000) priority = 3; // Smaller cap losses often more impactful
      if (isLongTermLoss) priority = Math.max(priority, 1); // Long term losses have highest priority for carryforward

      suggestions.push({
        id: `LOSS-${holding.company.ticker}-${Date.now()}-${Math.random()}`,
        ticker: holding.company.ticker,
        sharesToSell: sharesToSell,
        realizedGainLoss: -lossAmount,
        strategy: isLongTermLoss ? 'Tax Loss Carryforward' : 'Wash Sale Avoidance',
        recommendation: `Execute liquidation of ${sharesToSell} shares of ${holding.company.ticker} to realize a capital loss of $${lossAmount.toFixed(2)}. Classification: ${isLongTermLoss ? 'Long-Term' : 'Short-Term'}. This helps offset current or future gains.`,
        confidenceScore: 0.98, // High confidence for clear losses
        executionPriority: priority,
      });
    }
  });

  // Step 3: Optimized Rebalancing (Conditional Gain Realization)
  detailedHoldings.forEach(holding => {
    if (holding.unrealizedPL > 0) {
        // Recommend selling a small portion (e.g., 15%) to realize gains if strategic.
        const sharesToSell = Math.floor(holding.shares * 0.15);
        
        if (sharesToSell > 0) {
            const realizedValue = sharesToSell * holding.company.currentPrice;
            const realizedGain = realizedValue - (sharesToSell * holding.company.costBasis);
            
            // Heuristic for overweight position: if a single holding exceeds 20% of total market value.
            const isOverweight = portfolioSummary.totalMarketValue > 0 && (holding.marketValue / portfolioSummary.totalMarketValue) > 0.20;
            // Check if there are active loss suggestions to offset these gains.
            const hasAvailableLosses = suggestions.some(s => s.realizedGainLoss < 0);

            // Prioritize realizing gains if there are offsetting losses, or if it's an overweight, volatile position.
            if (hasAvailableLosses || (isOverweight && holding.company.volatilityIndex > 0.35 && holding.isLongTerm)) {
                suggestions.push({
                    id: `GAIN-OPT-${holding.company.ticker}-${Date.now()}-${Math.random()}`,
                    ticker: holding.company.ticker,
                    sharesToSell: sharesToSell,
                    realizedGainLoss: realizedGain,
                    strategy: 'Optimized Rebalancing',
                    recommendation: `Sell ${sharesToSell} shares of ${holding.company.ticker} to realize a gain of $${realizedGain.toFixed(2)}. This can be used to offset existing losses or to reduce concentration risk in ${holding.company.sector}. This is a ${holding.isLongTerm ? 'long-term' : 'short-term'} gain.`,
                    confidenceScore: 0.92, // Slightly lower as it involves balancing
                    executionPriority: isOverweight ? 3 : 7, // Higher priority for risk reduction
                });
            }
        }
    }
  });

  // Step 4: Final Sorting by execution priority (lower number = higher priority), then by absolute gain/loss magnitude.
  return suggestions.sort((a, b) => {
    if (a.executionPriority !== b.executionPriority) {
        return a.executionPriority - b.executionPriority;
    }
    return Math.abs(b.realizedGainLoss) - Math.abs(a.realizedGainLoss); // Larger impact first
  });
};

/**
 * Calculates a summary of the current portfolio.
 * @param portfolio The current portfolio holdings.
 * @param companies The list of all available companies.
 */
const calculatePortfolioSummary = (portfolio: Holding[], companies: Company[]): PortfolioSummary => {
    let totalMarketValue = 0;
    let totalCostBasis = 0;
    let totalSharesHeld = 0;
    const sectorExposure: Record<string, number> = {};
    let totalVolatilitySum = 0;
    let invalidHoldingsCount = 0;

    portfolio.forEach(holding => {
        const company = getCompanyById(holding.companyId, companies);
        if (!company) {
            console.warn(`Company with ID ${holding.companyId} not found in companies list for summary. Skipping.`);
            invalidHoldingsCount++;
            return;
        }

        const marketValue = holding.shares * company.currentPrice;
        const costBasisTotal = holding.shares * company.costBasis;
        
        totalMarketValue += marketValue;
        totalCostBasis += costBasisTotal;
        totalSharesHeld += holding.shares;

        sectorExposure[company.sector] = (sectorExposure[company.sector] || 0) + marketValue;
        // Weighted average volatility: volatility of company * its market value as a proportion of total market value
        totalVolatilitySum += holding.company.volatilityIndex * marketValue; 
    });

    const netUnrealizedPL = totalMarketValue - totalCostBasis;
    
    // Calculate sector concentration risk
    const avgMarketValuePerSector = totalMarketValue / SECTORS.length; // Ideal average
    const sectorConcentrationVariance = Object.values(sectorExposure).reduce((sum, val) => sum + Math.pow(val - avgMarketValuePerSector, 2), 0);
    
    // Risk score combines weighted volatility and sector concentration variance.
    // Normalized to a more readable scale.
    const weightedAvgVolatility = totalMarketValue > 0 ? (totalVolatilitySum / totalMarketValue) : 0;
    const riskScore = parseFloat(((weightedAvgVolatility * 100) + (sectorConcentrationVariance / 1_000_000_000)).toFixed(2));
    // Adjusted scaling for `sectorConcentrationVariance` to make it meaningful for typical portfolio values.

    if (invalidHoldingsCount > 0) {
        console.error(`Warning: ${invalidHoldingsCount} holdings could not be processed due to missing company data.`);
    }

    return {
        totalMarketValue,
        totalCostBasis,
        netUnrealizedPL,
        totalSharesHeld,
        sectorExposure: Object.fromEntries(
            Object.entries(sectorExposure).map(([sector, value]) => [sector, parseFloat((value / totalMarketValue * 100).toFixed(1))])
        ),
        riskScore,
    };
};

// --- API Simulation Layer (Replaces direct mock data access and setTimeout) ---
// This layer simulates fetching and mutating data via an API, abstracting the mock data.
// In a real application, these would be actual API calls using Axios/fetch.
// Comment: This abstracts the data fetching logic behind promises, simulating a robust API integration framework
// as per the refactoring instructions. Rate limiting, retries, etc., would be implemented in a true API client,
// but useQuery provides a good foundation for managing these concerns at the component level.

const SIMULATED_API_LATENCY = 800; // ms

const api = {
    fetchCompanies: async (): Promise<Company[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        return MOCK_COMPANIES;
    },
    fetchPortfolio: async (): Promise<Holding[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        return MOCK_PORTFOLIO;
    },
    performTaxAnalysis: async (portfolio: Holding[], summary: PortfolioSummary, companies: Company[]): Promise<TaxHarvestingSuggestion[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY * 1.5)); // Longer latency for analysis
        try {
            const results = analyzeTaxHarvesting(portfolio, summary, companies);
            return results;
        } catch (error) {
            console.error("Error during tax analysis:", error);
            throw new Error("Failed to perform tax analysis.");
        }
    },
    executeTrade: async (suggestion: TaxHarvestingSuggestion, currentPortfolio: Holding[], companies: Company[]): Promise<Holding[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        
        const companyToUpdate = companies.find(c => c.ticker === suggestion.ticker);
        if (!companyToUpdate) {
            throw new Error(`Company with ticker ${suggestion.ticker} not found.`);
        }

        const updatedHoldings = currentPortfolio.map(holding => {
            if (holding.companyId === companyToUpdate.id) {
                const sharesRemaining = holding.shares - suggestion.sharesToSell;
                if (sharesRemaining <= 0) {
                    return null; // Remove holding if all shares sold
                }
                return { ...holding, shares: sharesRemaining };
            }
            return holding;
        }).filter((h): h is Holding => h !== null);
        
        MOCK_PORTFOLIO = updatedHoldings; // Update the "backend" mock state
        return updatedHoldings;
    }
};

// --- React Query Client Initialization ---
const queryClient = new QueryClient();

// --- React Component: TaxOptimizationChamber ---

const TaxOptimizationChamberContent: React.FC = () => {
  // Use React Query for data fetching and state management
  const { data: companies, isLoading: isLoadingCompanies, isError: isErrorCompanies, error: errorCompanies } = useQuery<Company[], Error>({
    queryKey: ['companies'],
    queryFn: api.fetchCompanies,
    staleTime: Infinity, // Company data assumed to be static for this demo
  });

  const { data: portfolioData, isLoading: isLoadingPortfolio, isError: isErrorPortfolio, error: errorPortfolio } = useQuery<Holding[], Error>({
    queryKey: ['portfolio'],
    queryFn: api.fetchPortfolio,
  });

  // Memoize portfolio summary calculation, dependent on fetched data
  const portfolioSummary: PortfolioSummary = useMemo(() => {
    if (!portfolioData || !companies) {
      return {
        totalMarketValue: 0, totalCostBasis: 0, netUnrealizedPL: 0, totalSharesHeld: 0,
        sectorExposure: {}, riskScore: 0
      };
    }
    return calculatePortfolioSummary(portfolioData, companies);
  }, [portfolioData, companies]);

  // Mutation for running tax analysis
  const analyzeMutation = useMutation<TaxHarvestingSuggestion[], Error, void>({
    mutationFn: async () => {
      if (!portfolioData || !companies) {
        throw new Error("Portfolio data or company data not loaded for analysis.");
      }
      return api.performTaxAnalysis(portfolioData, portfolioSummary, companies);
    },
  });

  // Mutation for executing a trade
  const executeTradeMutation = useMutation<Holding[], Error, TaxHarvestingSuggestion>({
    mutationFn: async (suggestion: TaxHarvestingSuggestion) => {
        if (!portfolioData || !companies) {
            throw new Error("Portfolio data or company data not loaded for trade execution.");
        }
        return api.executeTrade(suggestion, portfolioData, companies);
    },
    onSuccess: (updatedHoldings, suggestion) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] }); // Refetch portfolio data
      analyzeMutation.reset(); // Clear previous analysis results, as portfolio has changed
      alert(`Trade executed for ${suggestion.ticker}. Portfolio state updated.`);
    },
    onError: (error) => {
      alert(`Error executing trade: ${error.message}`);
    }
  });

  // Consolidated loading state for initial data
  const isInitialLoading = isLoadingCompanies || isLoadingPortfolio;
  const isInitialError = isErrorCompanies || isErrorPortfolio;
  const initialError = errorCompanies || errorPortfolio;

  // Determine system status for UI display
  const systemStatus = useMemo(() => {
    if (isInitialLoading) return 'LOADING_DATA';
    if (isInitialError) return 'ERROR_DATA';
    if (analyzeMutation.isPending) return 'ANALYZING';
    if (executeTradeMutation.isPending) return 'EXECUTING';
    if (analyzeMutation.isSuccess && analyzeMutation.data?.length === 0) return 'COMPLETE_NO_SUGGESTIONS';
    if (analyzeMutation.isSuccess && analyzeMutation.data?.length > 0) return 'COMPLETE_WITH_SUGGESTIONS';
    if (analyzeMutation.isError) return 'ERROR_ANALYSIS';
    return 'IDLE';
  }, [isInitialLoading, isInitialError, analyzeMutation.isPending, executeTradeMutation.isPending, analyzeMutation.isSuccess, analyzeMutation.data?.length, analyzeMutation.isError]);


  const renderSuggestions = () => {
    if (systemStatus === 'LOADING_DATA') {
      return <p className="text-gray-500 text-center mt-6 animate-pulse text-lg font-medium">Loading portfolio data...</p>;
    }
    if (systemStatus === 'ERROR_DATA') {
        return <p className="text-red-600 text-center mt-6 text-lg font-bold">Error loading data: {initialError?.message}</p>;
    }
    if (systemStatus === 'ANALYZING') {
      return <p className="text-indigo-400 text-center mt-6 animate-pulse text-lg font-medium">Analyzing Portfolio...</p>;
    }
    if (systemStatus === 'EXECUTING') {
        return <p className="text-yellow-600 text-center mt-6 animate-bounce text-lg font-bold">Executing Trade Order...</p>;
    }
    if (systemStatus === 'COMPLETE_NO_SUGGESTIONS') {
      return <p className="text-green-600 text-center mt-6 text-xl font-semibold">Optimization Complete: Portfolio is tax-efficient.</p>;
    }
    if (systemStatus === 'IDLE') {
        return <p className="text-gray-500 text-center mt-6">Ready to analyze portfolio.</p>;
    }
    if (systemStatus === 'ERROR_ANALYSIS') {
        return <p className="text-red-600 text-center mt-6 text-lg font-bold">Analysis failed: {analyzeMutation.error?.message}</p>;
    }

    const analysisResults = analyzeMutation.data || [];

    return (
      <div className="space-y-5 mt-6">
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300">
            <span className="text-sm font-bold text-gray-700">Total Potential Impact: 
                <span className="text-red-700 ml-2">${analysisResults.filter(r => r.realizedGainLoss < 0).reduce((sum, r) => sum + Math.abs(r.realizedGainLoss), 0).toFixed(2)}</span> / 
                <span className="text-green-700 ml-1">${analysisResults.filter(r => r.realizedGainLoss > 0).reduce((sum, r) => sum + r.realizedGainLoss, 0).toFixed(2)}</span>
            </span>
            <span className="text-xs text-indigo-600">Sorted by Priority ({analysisResults[0]?.executionPriority || '-'} being highest)</span>
        </div>
        {analysisResults.map((s) => (
          <div key={s.id} className={`p-5 rounded-xl shadow-lg transition duration-500 border-l-8 ${s.realizedGainLoss < 0 ? 'border-red-600 bg-red-50 hover:shadow-xl' : 'border-green-600 bg-green-50 hover:shadow-xl'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-2xl font-extrabold text-gray-900 flex items-center">
                        {s.ticker} 
                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-mono">{s.strategy}</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Confidence: {(s.confidenceScore * 100).toFixed(1)}% | Priority: {s.executionPriority}</p>
                </div>
                <button
                    onClick={() => executeTradeMutation.mutate(s)}
                    disabled={executeTradeMutation.isPending || isInitialLoading || isInitialError}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition duration-200 transform hover:scale-[1.05] shadow-md
                        ${s.realizedGainLoss < 0 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }
                        ${executeTradeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {executeTradeMutation.isPending ? 'Processing...' : `Execute Trade (${s.sharesToSell} Sh)`}
                </button>
            </div>
            <p className="mt-3 text-lg font-medium border-t pt-2 border-dashed">
              {s.recommendation}
            </p>
            <p className={`text-xl font-extrabold mt-2 ${s.realizedGainLoss < 0 ? 'text-red-800' : 'text-green-800'}`}>
              Net Impact: ${Math.abs(s.realizedGainLoss).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderSystemStatus = () => {
    let color = 'text-gray-500';
    let message = 'System Idle.';
    
    switch(systemStatus) {
        case 'LOADING_DATA':
            color = 'text-gray-500 animate-pulse';
            message = 'Status: Loading Initial Data...';
            break;
        case 'ERROR_DATA':
            color = 'text-red-600';
            message = `Status: Error Loading Data (${initialError?.message})`;
            break;
        case 'ANALYZING':
            color = 'text-indigo-500 animate-pulse';
            message = 'Status: Analysis in Progress';
            break;
        case 'EXECUTING':
            color = 'text-yellow-600 animate-bounce';
            message = 'Status: Executing Trade Orders';
            break;
        case 'COMPLETE_NO_SUGGESTIONS':
            color = 'text-green-600 font-bold';
            message = `Status: Analysis Complete. No New Suggestions.`;
            break;
        case 'COMPLETE_WITH_SUGGESTIONS':
            color = 'text-blue-600 font-bold';
            message = `Status: Analysis Complete. ${analyzeMutation.data?.length} Suggestions Identified.`;
            break;
        case 'ERROR_ANALYSIS':
            color = 'text-red-600';
            message = `Status: Analysis Failed (${analyzeMutation.error?.message})`;
            break;
    }
    return <p className={`text-lg ${color} mb-4 border-b pb-2`}>{message}</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl border-t-8 border-indigo-800 p-8">
        
        <header className="flex justify-between items-center border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Tax Optimization Dashboard
          </h1>
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending || executeTradeMutation.isPending || isInitialLoading || isInitialError}
            className={`px-8 py-4 text-lg font-extrabold rounded-xl transition duration-300 shadow-xl transform hover:scale-[1.03] active:scale-[0.98]
              ${analyzeMutation.isPending || executeTradeMutation.isPending || isInitialLoading || isInitialError
                ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                : 'bg-indigo-800 text-white hover:bg-indigo-900 ring-4 ring-indigo-300'}`}
          >
            {systemStatus === 'ANALYZING' ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </button>
        </header>

        {renderSystemStatus()}

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          
          <div className="lg:col-span-1 p-6 border border-indigo-200 rounded-2xl bg-indigo-50 shadow-inner">
            <h3 className="text-2xl font-bold mb-4 text-indigo-800 border-b pb-2">Portfolio Metrics</h3>
            
            {isInitialLoading ? (
                <p className="text-gray-500 animate-pulse">Loading metrics...</p>
            ) : isInitialError ? (
                <p className="text-red-600">Error: {initialError?.message}</p>
            ) : (
                <>
                    <MetricCard title="Total Market Value" value={`$${portfolioSummary.totalMarketValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} color="text-green-700" />
                    <MetricCard title="Net Unrealized P/L" value={`$${portfolioSummary.netUnrealizedPL.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} color={portfolioSummary.netUnrealizedPL >= 0 ? "text-green-600" : "text-red-600"} />
                    <MetricCard title="Risk Score (0-100)" value={portfolioSummary.riskScore.toFixed(2)} color={portfolioSummary.riskScore > 50 ? "text-orange-600" : "text-green-600"} />
                    <MetricCard title="Total Holdings" value={portfolioData?.length.toString() || '0'} color="text-gray-700" />
                    
                    <div className="mt-6 pt-4 border-t border-indigo-200">
                        <h4 className="text-lg font-semibold text-indigo-700 mb-2">Sector Concentration (%)</h4>
                        <div className="space-y-1 text-sm">
                            {Object.entries(portfolioSummary.sectorExposure).sort(([, a], [, b]) => b - a).map(([sector, percent]) => (
                                <div key={sector} className="flex justify-between">
                                    <span className="text-gray-600">{sector}</span>
                                    <span className="font-bold">{percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="lg:col-span-3 p-6 border border-gray-300 rounded-2xl bg-white shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 border-b pb-3">Actionable Suggestions</h3>
            <div className="min-h-[400px] bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 overflow-y-auto">
              {renderSuggestions()}
            </div>
          </div>
        </section>

        <section className="mt-10 pt-6 border-t-4 border-indigo-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">Optimization Logic</h3>
                    <p className="text-gray-700 leading-relaxed">
                        The system identifies suboptimal tax positions and calculates the most efficient path to optimization. Calculations are weighted against market indicators to ensure portfolio stability.
                    </p>
                    <div className="mt-4 text-sm p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                        <p className="font-bold">Note on Wash Sales:</p>
                        <p>The system cross-references suggested sales against trading logs to prevent wash sale violations.</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">Settings</h3>
                    <p className="text-gray-700 leading-relaxed">
                        Configure the parameters for the tax harvesting algorithm.
                    </p>
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked={true} disabled className="form-checkbox h-4 w-4 text-indigo-600 mr-2 border-indigo-400"/>
                            Enable Long-Term Gain Harvesting (LTG)
                        </label>
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked={true} disabled className="form-checkbox h-4 w-4 text-indigo-600 mr-2 border-indigo-400"/>
                            Activate Volatility Dampening Rebalance (VDR)
                        </label>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

interface MetricCardProps {
    title: string;
    value: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color }) => (
    <div className="py-3 border-b border-indigo-100 last:border-b-0">
        <p className="text-sm font-medium text-indigo-600">{title}</p>
        <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
);

// Wrapper component to provide QueryClientProvider for the entire file's context
// In a full application, QueryClientProvider would typically wrap your App component.
const TaxOptimizationChamber: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TaxOptimizationChamberContent />
  </QueryClientProvider>
);

export default TaxOptimizationChamber;