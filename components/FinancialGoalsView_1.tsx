// components/FinancialGoalsView.tsx
import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { FinancialGoal } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, BarChart, Bar, ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts';
import { v4 as uuidv4 } from 'uuid';


const GOAL_ICONS: { [key: string]: React.FC<{ className?: string }> } = {
    home: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    plane: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    car: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m14 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    education: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>,
    default: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    retirement: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    investment: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    gift: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 00-2-2v-7" /></svg>,
};
export const ALL_GOAL_ICONS = Object.keys(GOAL_ICONS);


// --- START OF NEW CODE ---

/**
 * @typedef {Object} Contribution
 * @property {string} id - Unique identifier for the contribution.
 * @property {number} amount - The monetary amount of the contribution.
 * @property {string} date - ISO date string of when the contribution was made.
 * @property {'manual' | 'recurring'} type - The type of contribution, either manual or recurring.
 */
export type Contribution = {
    id: string;
    amount: number;
    date: string;
    type: 'manual' | 'recurring';
};

/**
 * @typedef {Object} RecurringContribution
 * @property {string} id - Unique identifier for the recurring contribution setup.
 * @property {number} amount - The amount contributed per period.
 * @property {'monthly' | 'bi-weekly' | 'weekly'} frequency - How often the contribution occurs.
 * @property {string} startDate - The date when the recurring contribution started or will start.
 * @property {string | null} endDate - Optional end date for the recurring contribution.
 * @property {boolean} isActive - Whether the recurring contribution is currently active.
 */
export type RecurringContribution = {
    id: string;
    amount: number;
    frequency: 'monthly' | 'bi-weekly' | 'weekly';
    startDate: string;
    endDate: string | null;
    isActive: boolean;
};

/**
 * @typedef {Object} ProjectionScenario
 * @property {string} name - Name of the projection scenario (e.g., "Base Case", "Optimistic").
 * @property {number} monthlyContribution - The assumed monthly contribution for this scenario.
 * @property {number} annualReturn - The assumed annual return rate for this scenario (as a percentage).
 * @property {{ month: number; value: number }[]} data - The projected value data over time.
 */
export type ProjectionScenario = {
    name: string;
    monthlyContribution: number;
    annualReturn: number;
    data: { month: number; value: number }[];
};

/**
 * @typedef {'conservative' | 'moderate' | 'aggressive'} RiskProfile
 * @description Defines the user's investment risk tolerance, influencing recommended strategies and Monte Carlo simulation parameters.
 */
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

/**
 * @typedef {Object} LinkedGoal
 * @property {string} id - The ID of the goal being linked to.
 * @property {string} relationshipType - Describes how this goal is linked (e.g., 'prerequisite', 'dependency', 'overflow').
 * @property {number} [triggerAmount] - Optional: amount at which this link triggers an action (e.g., start funding linked goal).
 */
export type LinkedGoal = {
    id: string;
    relationshipType: 'prerequisite' | 'dependency' | 'overflow' | 'sibling';
    triggerAmount?: number;
};

/**
 * @typedef {Object} ExtendedFinancialGoal
 * @extends FinancialGoal
 * @property {Contribution[]} contributions - A list of all historical contributions made to this goal.
 * @property {RecurringContribution[]} recurringContributions - A list of active and inactive recurring contribution setups.
 * @property {RiskProfile} [riskProfile] - The user's assigned risk profile for this goal's investment strategy.
 * @property {'on_track' | 'needs_attention' | 'achieved' | 'behind'} status - The current status of the goal relative to its target.
 * @property {LinkedGoal[]} linkedGoals - Other goals that this goal is related to.
 */
// FIX: ExtendedFinancialGoal now correctly inherits from FinancialGoal which includes basic properties
export interface ExtendedFinancialGoal extends FinancialGoal {
    contributions: Contribution[];
    recurringContributions: RecurringContribution[];
    riskProfile?: RiskProfile;
    status: 'on_track' | 'needs_attention' | 'achieved' | 'behind';
    linkedGoals: LinkedGoal[];
}

// --- UTILITY FUNCTIONS ---

/**
 * Philosophical thought: Utility functions are the unsung heroes of any robust application.
 * They provide pure, predictable operations, distilling complex logic into reusable, testable units.
 * Think of them as the finely crafted tools in a master artisan's kit â€“ simple in form, but essential for grand creations.
 *
 * Million Dollar Feature Overview: "The 'Date Whisperer' and 'Future Fortune Teller' Utilities!"
 * (Said in a jester's voice) "Hark, my friends, these humble functions, they may seem small and meek!
 * But with the 'Date Whisperer', we shall make sense of time's swift creek,
 * And with the 'Future Fortune Teller', behold! Your gold will surely peak!
 * They lay the groundwork, unseen, for riches we all seek!"
 */

/**
 * Formats an ISO date string into a more human-readable format (e.g., "January 1, 2023").
 * @param {string} dateString - The ISO date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Calculates the number of full months between two given Date objects.
 * Accounts for year and month differences.
 * @param {Date} date1 - The start date.
 * @param {Date} date2 - The end date.
 * @returns {number} The number of full months between date1 and date2. Returns 0 if date2 is before or the same month as date1.
 */
export const monthsBetween = (date1: Date, date2: Date): number => {
    let months;
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    // Ensure that if date2 is before date1, or in the same month but earlier day, we return 0.
    if (months < 0 || (months === 0 && date2.getDate() < date1.getDate())) return 0;
    return months;
};

/**
 * Calculates the future value of an investment with regular contributions, compounded monthly.
 * This is a fundamental financial calculation, essential for projecting goal achievement.
 * @param {number} principal - The initial amount invested.
 * @param {number} monthlyContribution - The amount contributed each month.
 * @param {number} months - The total number of months over which to project.
 * @param {number} annualRate - The annual interest rate (e.g., 0.05 for 5%).
 * @returns {number} The future value of the investment.
 */
export const calculateFutureValue = (principal: number, monthlyContribution: number, months: number, annualRate: number): number => {
    const monthlyRate = annualRate / 12;
    if (monthlyRate === 0) {
        // Simple interest if rate is 0
        return principal + monthlyContribution * months;
    }
    const futureValueOfPrincipal = principal * Math.pow(1 + monthlyRate, months);
    // Future value of a series of payments (ordinary annuity formula)
    const futureValueOfContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return futureValueOfPrincipal + futureValueOfContributions;
};

/**
 * Calculates the present value of a future amount. Useful for determining how much needs to be invested today.
 * @param {number} futureValue - The target future value.
 * @param {number} annualRate - The annual interest rate (e.g., 0.05 for 5%).
 * @param {number} months - The number of months until the future value is needed.
 * @returns {number} The present value.
 */
// FIX: Added missing return value in calculatePresentValue
export const calculatePresentValue = (futureValue: number, annualRate: number, months: number): number => {
    const monthlyRate = annualRate / 12;
    if (monthlyRate === 0) return futureValue;
    return futureValue / Math.pow(1 + monthlyRate, months);
};

const FinancialGoalsView: React.FC = () => {
    const context = useContext(DataContext);
    const goals = context?.financialGoals || [];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Financial Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => (
                    <Card key={goal.id} title={goal.name}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-gray-400 text-sm">Target: {formatDate(goal.targetDate)}</p>
                                    <p className="text-2xl font-bold text-white">${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-cyan-400">{(goal.currentAmount / goal.targetAmount * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(goal.currentAmount / goal.targetAmount * 100)}%` }}></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// FIX: Added default export for FinancialGoalsView
export default FinancialGoalsView;