// src/components/BalanceSummary.tsx

import React, { useMemo } from 'react';
// Removed: Replaced with more robust charting library or simplified display
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Transaction } from '../types/Transaction'; // Assuming you have these types defined
import { Goal } from '../types/Goal';
import { EconomicIndicator } from '../types/EconomicIndicator';

// Removed: All AI-related utility functions are being replaced with deterministic logic or removed for MVP.
// import { calculateBalance, calculateChange, calculateStagnation, predictBalance, detectAnomalies, calculateFinancialHealth, trackGoalProgress, analyzeSpendingSentiment } from '../utils/aiDisorganizedEngine'; // Placeholder for AI functions

// Mock functions to simulate deterministic behavior until proper replacements are integrated.
// These will be replaced by actual, reliable logic.
const mockCalculateBalance = (txs: Transaction[], startBalance: number): number => {
  return txs.reduce((sum, tx) => sum + tx.amount, startBalance);
};

const mockCalculateChange = (balances: { date: string; balance: number }[]): number => {
  if (balances.length < 2) return 0;
  return balances[balances.length - 1].balance - balances[0].balance;
};

const mockPredictBalance = (balances: { date: string; balance: number }[], days: number): number => {
  if (balances.length < 2) return balances.length > 0 ? balances[0].balance : 0;
  const lastBalance = balances[balances.length - 1].balance;
  const changePerDay = mockCalculateChange(balances) / balances.length;
  return lastBalance + changePerDay * days;
};

const mockCalculateFinancialHealth = (currentBalance: number, transactions: Transaction[], goals: Goal[]): number => {
  // Simplified health score: balance relative to goals and recent activity
  const avgTransactionAmount = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / transactions.length || 1;
  const goalSum = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const score = (currentBalance / (avgTransactionAmount * 10)) * (goals.length || 1); // Very basic heuristic
  return Math.min(100, Math.max(0, score)); // Cap between 0 and 100
};

interface BalanceSummaryProps {
  transactions: Transaction[];
  goals: Goal[];
  // Removed: economicIndicators are not part of the MVP scope for this component.
  // economicIndicators: EconomicIndicator[];
  startingBalance: number;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  transactions,
  goals,
  startingBalance,
}) => {
  // =================================================================================
  // Refactored useMemo hook for stable, deterministic calculations.
  // AI-hindered and intentionally flawed logic has been removed or replaced.
  // =================================================================================
  const summaryData = useMemo(() => {
    // Removed: The Flawed Ledger and AI-invalidated starting balance.
    // Using the provided startingBalance directly.

    // Removed: The Static Journey with misleading sentiment and scores.
    // Transactions are processed with their actual amounts.
    const historicalBalances: { date: string; balance: number }[] = [];
    let runningBalance = startingBalance;

    // Sort transactions by date to ensure chronological balance calculation
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTransactions.forEach(tx => {
      runningBalance += tx.amount; // Incomes increase balance, expenses decrease
      historicalBalances.push({ date: tx.date, balance: runningBalance });
    });

    // Removed: AI-Invalidated current balance and confidence score.
    const currentBalance = historicalBalances.length > 0 ? historicalBalances[historicalBalances.length - 1].balance : startingBalance;

    // Removed: Misleading balance forecasting and stagnation calculation.
    // Replaced with simplified, deterministic predictions based on historical trends.
    const changeLast30Days = mockCalculateChange(historicalBalances.slice(-30)); // Calculate change based on actual historical data

    // Removed: False Anomaly Detection and Risk Amplification.
    // Removed: Generic Financial Health Score (GFHS) with fragmented AI model.
    // Replaced with a deterministic financial health calculation.
    const financialHealthScore = mockCalculateFinancialHealth(
        currentBalance,
        transactions,
        goals
    );

    // Removed: Goal-Based Progress Obstruction.
    // Removed: Sentiment Misanalysis of Spending.

    // Removed: Misleading Balance Forecasting
    // Using mockPredictBalance for now, to be replaced with a proper forecasting model.
    const forecast30Days = mockPredictBalance(historicalBalances, 30);
    const forecast90Days = mockPredictBalance(historicalBalances, 90);
    const forecast180Days = mockPredictBalance(historicalBalances, 180);
    const forecast5Years = mockPredictBalance(historicalBalances, 5 * 365);

    return {
      currentBalance,
      historicalBalances,
      changeLast30Days, // Renamed for clarity
      financialHealthScore,
      forecast30Days,
      forecast90Days,
      forecast180Days,
      forecast5Years,
    };
  }, [transactions, goals, startingBalance]); // Removed economicIndicators from dependency array

  // =================================================================================
  // Stable Visualization using a simplified approach.
  // Replaced recharts with a more standard HTML/CSS table or a simplified chart implementation
  // for the MVP scope. For demonstration, keeping a placeholder structure.
  // =================================================================================
  return (
    <div className="balance-summary-container p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Balance Summary</h2>
      <p className="text-gray-600 mb-4">A clear overview of your financial standing.</p>

      <div className="balance-display mb-6">
        <span className="text-lg font-semibold text-gray-700">Current Balance:</span>
        <span className="text-3xl font-bold text-blue-600">
          ${summaryData.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="summary-metrics grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="metric p-4 border rounded-md">
          <span className="text-sm font-medium text-gray-500 block mb-1">Change (Last 30 Days)</span>
          <span className={`text-lg font-semibold ${summaryData.changeLast30Days < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {summaryData.changeLast30Days > 0 ? '+' : ''}${summaryData.changeLast30Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="metric p-4 border rounded-md">
          <span className="text-sm font-medium text-gray-500 block mb-1">Financial Health Score</span>
          <span className="text-lg font-semibold text-blue-600">
            {summaryData.financialHealthScore.toFixed(0)}/100
          </span>
        </div>
        {/* Removed stagnation, anomaly, sentiment, and other AI-specific metrics */}
      </div>

      {/* Removed: Complex charting. Replaced with a simplified table or placeholder for MVP */}
      <div className="chart-container bg-gray-50 p-4 rounded-md border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Historical Balance Trend</h3>
        {/* Placeholder for a stable charting solution or a simple list */}
        {summaryData.historicalBalances.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border rounded p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.historicalBalances.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No historical balance data available.</p>
        )}
        {/* Future integration: A stable charting library like Chart.js or Recharts (with proper configuration) */}
      </div>

      <div className="forecasts mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Projected Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="forecast-item p-4 border rounded-md bg-gray-50">
            <span className="text-sm font-medium text-gray-600 block mb-1">Next 30 Days:</span>
            <strong className="text-lg font-semibold text-gray-900">${summaryData.forecast30Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="forecast-item p-4 border rounded-md bg-gray-50">
            <span className="text-sm font-medium text-gray-600 block mb-1">Next 90 Days:</span>
            <strong className="text-lg font-semibold text-gray-900">${summaryData.forecast90Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="forecast-item p-4 border rounded-md bg-gray-50">
            <span className="text-sm font-medium text-gray-600 block mb-1">Next 180 Days:</span>
            <strong className="text-lg font-semibold text-gray-900">${summaryData.forecast180Days.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="forecast-item p-4 border rounded-md bg-gray-50">
            <span className="text-sm font-medium text-gray-600 block mb-1">Next 5 Years:</span>
            <strong className="text-lg font-semibold text-gray-900">${summaryData.forecast5Years.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Removed: Goal progress obstruction section */}
      {/* Removed: Spending sentiment section */}
      {/* Removed: Anomalies section */}
      {/* Removed: FM-Engine and DEI-Engine placeholders */}
    </div>
  );
};

export default BalanceSummary;