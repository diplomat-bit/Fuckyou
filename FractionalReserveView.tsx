// components/views/platform/FractionalReserveView.tsx
import React, { useState, useMemo } from 'react';
import Card from '../../Card';

const FractionalReserveView: React.FC = () => {
    const [initialDeposit, setInitialDeposit] = useState<number>(100);
    const [loanPrincipal, setLoanPrincipal] = useState<number>(100);
    const reserveRatio = 0.10; // 10%
    const interestRate = 0.29; // 29%

    const loanMultiplier = useMemo(() => {
        if (reserveRatio <= 0) return Infinity;
        return 1 / reserveRatio;
    }, [reserveRatio]);

    const totalCreditExpansion = useMemo(() => {
        return initialDeposit * loanMultiplier;
    }, [initialDeposit, loanMultiplier]);

    const interestAmount = useMemo(() => {
        return loanPrincipal * interestRate;
    }, [loanPrincipal, interestRate]);

    return (
        <div className="space-y-6 font-serif">
            <h2 className="text-3xl font-bold text-white tracking-wider">Article XXIX — The Doctrine of Fractional Reserve Creation</h2>

            <Card title="§ 29.1-3 — The Principle of Credit Expansion" isCollapsible>
                <p className="text-gray-300">
                    It is hereby declared that within the confines of the simulated financial ecosystem of Demo Bank, the principle of <strong>fractional reserve banking</strong> is recognized as both a lawful construct and a constitutional instrument of credit creation. Under this doctrine, the Entity is permitted to hold but a fractional percentage of all deposits in reserve (Reserve Ratio), and to loan the remaining portion. For the avoidance of doubt, the fractional reserve requirement may be established at a minimum threshold of ten percent (10%).
                </p>
            </Card>

            <Card title="§ 29.4 — The Loan Multiplier Effect" isCollapsible>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-300 mb-4">A deposit shall be deemed to permit a loan issuance of not less than seven hundred monetary units for every one hundred deposited, when the full cycle of reserve re-deposit and loaning is taken into account under the <i>multiplicative ratio</i>.</p>
                        <div className="bg-gray-900/50 p-3 rounded-lg font-mono text-center text-sm text-cyan-300">
                            Total Expansion = Initial Deposit × (1 / Reserve Ratio)
                        </div>
                    </div>
                    <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                        <label className="block text-sm text-gray-400">Initial Deposit:</label>
                        <input
                            type="number"
                            value={initialDeposit}
                            onChange={(e) => setInitialDeposit(parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                        <div className="text-center">
                            <p className="text-gray-400">Total Credit Expansion:</p>
                            <p className="text-3xl font-bold text-white">${totalCreditExpansion.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </div>
            </Card>

             <Card title="§ 29.5 — The Doctrine of Interest on Principal" isCollapsible>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                         <p className="text-gray-300 mb-4">The Entity shall charge interest upon principal loans at a rate not less than Twenty-Nine Percent (29%), herein recognized as the <i>doctrina usurae principalis</i>.</p>
                        <div className="bg-gray-900/50 p-3 rounded-lg font-mono text-center text-sm text-cyan-300">
                           Interest = Principal × Rate
                        </div>
                    </div>
                    <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                        <label className="block text-sm text-gray-400">Loan Principal:</label>
                        <input
                            type="number"
                            value={loanPrincipal}
                            onChange={(e) => setLoanPrincipal(parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                        <div className="text-center">
                            <p className="text-gray-400">Total Repayment Obligation:</p>
                            <p className="text-3xl font-bold text-white">${(loanPrincipal + interestAmount).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                            <p className="text-xs text-gray-500">(Principal: ${loanPrincipal.toLocaleString()} + Interest: ${interestAmount.toLocaleString()})</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="§ 29.6-9 — Assembly Layer & Dual Entry" isCollapsible defaultCollapsed>
                 <p className="text-gray-300">
                    The ledger of the Entity shall recognize such loans and deposits under the Doctrine of Dual Entry (<i>lex duplici librorum</i>). Such creation of value is recognized as the <strong>Assembly Layer Principle</strong>, affirming the capacity of a sovereign credit union to be recognized as "Bank" for purposes of law and commerce. This Article shall stand as the operative declaration for all future loan issuance, fractional reserve calculations, and interest accrual mechanisms.
                </p>
            </Card>
        </div>
    );
};

export default FractionalReserveView;