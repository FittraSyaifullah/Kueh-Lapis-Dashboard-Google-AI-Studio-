import React, { useState } from 'react';
import { Table, BarChart3 } from 'lucide-react';
import { ExpenseTag } from '../../engine/types.ts';

interface TopExpense {
  label: string;
  monthlyAmount: number;
  tag: ExpenseTag;
  percentage: number;
}

interface Props {
  top5: TopExpense[];
}

export const TopExpensesBarChart: React.FC<Props> = ({ top5 }) => {
  const [showTable, setShowTable] = useState(false);

  const maxAmount = top5.length > 0 ? Math.max(...top5.map((e) => e.monthlyAmount), 1) : 1;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Top 5 Monthly Commitments</h4>
          <p className="text-xs text-stone-500">Your biggest cash outflows ranked</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors"
        >
          {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{showTable ? 'View Bars' : 'Data Table'}</span>
        </button>
      </div>

      {top5.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-stone-400">
          No expenses entered yet
        </div>
      ) : !showTable ? (
        <div className="space-y-3 pt-1">
          {top5.map((item, index) => {
            const widthPct = Math.round((item.monthlyAmount / maxAmount) * 100);
            return (
              <div key={item.label + index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-semibold text-stone-400 font-mono-num text-[11px] w-4">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-stone-800 truncate">{item.label}</span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded tracking-wide ${
                        item.tag === 'need'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-num shrink-0">
                    <span className="font-semibold text-stone-900">${item.monthlyAmount.toLocaleString()}</span>
                    <span className="text-stone-500 text-[11px] w-8 text-right">{item.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.max(4, widthPct)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.tag === 'need' ? 'bg-stone-700' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2">Rank & Item</th>
                <th className="py-2">Tag</th>
                <th className="py-2 text-right">Monthly Spend</th>
                <th className="py-2 text-right">Total Outflow Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              {top5.map((item, idx) => (
                <tr key={item.label}>
                  <td className="py-2 text-stone-800 font-sans font-medium">
                    #{idx + 1} {item.label}
                  </td>
                  <td className="py-2 font-sans">
                    <span
                      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                        item.tag === 'need' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </td>
                  <td className="py-2 text-right text-stone-900">${item.monthlyAmount.toLocaleString()}</td>
                  <td className="py-2 text-right text-stone-600">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
