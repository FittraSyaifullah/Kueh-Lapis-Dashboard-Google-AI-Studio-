import React, { useState } from 'react';
import { Table, BarChart2 } from 'lucide-react';

interface Props {
  income: number;
  expenses: number;
  cashFlow: number;
}

export const CashFlowBarChart: React.FC<Props> = ({ income, expenses, cashFlow }) => {
  const [showTable, setShowTable] = useState(false);

  const maxVal = Math.max(income, expenses, Math.abs(cashFlow), 1);
  const incomeH = Math.round((income / maxVal) * 100);
  const expensesH = Math.round((expenses / maxVal) * 100);
  const cashFlowH = Math.round((Math.abs(cashFlow) / maxVal) * 100);
  const isPositive = cashFlow >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Monthly Cash Balance</h4>
          <p className="text-xs text-stone-500">Take-home income vs living expenses</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors"
          title="Toggle data table"
        >
          {showTable ? <BarChart2 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{showTable ? 'View Chart' : 'Data Table'}</span>
        </button>
      </div>

      {!showTable ? (
        <div className="pt-4">
          <div className="h-44 flex items-end justify-around gap-4 pb-2 border-b border-stone-200">
            {/* Income Bar */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-semibold text-stone-800 font-mono-num mb-1.5 group-hover:scale-105 transition-transform">
                ${Math.round(income).toLocaleString()}
              </span>
              <div
                style={{ height: `${Math.max(8, incomeH)}%` }}
                className="w-full max-w-[56px] bg-emerald-600 rounded-t-lg transition-all duration-300"
              />
              <span className="text-xs font-medium text-stone-600 mt-2">Income</span>
            </div>

            {/* Expenses Bar */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-semibold text-stone-800 font-mono-num mb-1.5 group-hover:scale-105 transition-transform">
                ${Math.round(expenses).toLocaleString()}
              </span>
              <div
                style={{ height: `${Math.max(8, expensesH)}%` }}
                className="w-full max-w-[56px] bg-stone-500 rounded-t-lg transition-all duration-300"
              />
              <span className="text-xs font-medium text-stone-600 mt-2">Expenses</span>
            </div>

            {/* Cash Flow Bar */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span
                className={`text-xs font-semibold font-mono-num mb-1.5 group-hover:scale-105 transition-transform ${
                  isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPositive ? '+' : '-'}${Math.round(Math.abs(cashFlow)).toLocaleString()}
              </span>
              <div
                style={{ height: `${Math.max(8, cashFlowH)}%` }}
                className={`w-full max-w-[56px] rounded-t-lg transition-all duration-300 ${
                  isPositive ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-medium text-stone-600 mt-2">Net Left</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Inflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500 inline-block" /> Outflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${isPositive ? 'bg-amber-500' : 'bg-rose-500'}`} /> Surplus/Deficit
            </span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2">Metric</th>
                <th className="py-2 text-right">Monthly Amount</th>
                <th className="py-2 text-right">Annualised</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              <tr>
                <td className="py-2 text-stone-800 font-sans font-medium">Net Take-Home Income</td>
                <td className="py-2 text-right text-stone-900">${Math.round(income).toLocaleString()}</td>
                <td className="py-2 text-right text-stone-600">${Math.round(income * 12).toLocaleString()}</td>
                <td className="py-2 text-right font-sans text-emerald-700 font-medium">Inflow</td>
              </tr>
              <tr>
                <td className="py-2 text-stone-800 font-sans font-medium">Total Living Expenses</td>
                <td className="py-2 text-right text-stone-900">${Math.round(expenses).toLocaleString()}</td>
                <td className="py-2 text-right text-stone-600">${Math.round(expenses * 12).toLocaleString()}</td>
                <td className="py-2 text-right font-sans text-stone-600 font-medium">Outflow</td>
              </tr>
              <tr className="bg-stone-50 font-semibold">
                <td className="py-2 text-stone-900 font-sans">Net Cash Left Over</td>
                <td className={`py-2 text-right ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isPositive ? '+' : '-'}${Math.round(Math.abs(cashFlow)).toLocaleString()}
                </td>
                <td className={`py-2 text-right ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isPositive ? '+' : '-'}${Math.round(Math.abs(cashFlow * 12)).toLocaleString()}
                </td>
                <td className="py-2 text-right font-sans">
                  {isPositive ? 'Monthly Surplus' : 'Monthly Deficit'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
