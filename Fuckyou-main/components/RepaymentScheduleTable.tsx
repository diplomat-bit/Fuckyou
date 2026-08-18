import React from 'react';

interface RepaymentPeriod {
  period: number;
  date: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}

interface RepaymentScheduleTableProps {
  schedule: RepaymentPeriod[];
  currency?: string;
}

export const RepaymentScheduleTable: React.FC<RepaymentScheduleTableProps> = ({
  schedule,
  currency = 'USD',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-semibold">Period</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold text-right">Principal</th>
              <th className="px-6 py-3 font-semibold text-right">Interest</th>
              <th className="px-6 py-3 font-semibold text-right">Total Payment</th>
              <th className="px-6 py-3 font-semibold text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((row) => (
              <tr key={row.period} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{row.period}</td>
                <td className="px-6 py-4 text-slate-600">{row.date}</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.principal)}</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.interest)}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(row.totalPayment)}</td>
                <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={6} className="px-6 py-3 text-center text-xs text-slate-400">
                End of repayment schedule
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default RepaymentScheduleTable;