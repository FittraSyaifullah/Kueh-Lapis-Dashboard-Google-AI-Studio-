import React, { useState } from 'react';
import { AlertCircle, Table, BarChart } from 'lucide-react';

interface Props {
  needsAmount: number;
  wantsAmount: number;
  needsPercentage: number;
  wantsPercentage: number;
  warningThreshold?: number; // e.g. 0.35 (35%)
}

export const NeedVsWantChart: React.FC<Props> = ({
  needsAmount,
  wantsAmount,
  needsPercentage,
  wantsPercentage,
  warningThreshold = 0.35,
}) => {
  const [showTable, setShowTable] = useState(false);
  const total = needsAmount + wantsAmount;
  const isHighWants = total > 0 && wantsAmount / total > warningThreshold;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Needs vs. Wants Balance</h4>
          <p className="text-xs text-stone-500">Non-negotiable essentials vs discretionary choices</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors"
        >
          {showTable ? <BarChart className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{showTable ? 'View Bar' : 'Data Table'}</span>
        </button>
      </div>

      {!showTable ? (
        <div className="space-y-4">
          {/* Stacked Bar */}
          <div>
            <div className="h-6 w-full rounded-full bg-stone-100 flex overflow-hidden p-0.5">
              <div
                style={{ width: `${Math.max(0, Math.min(100, needsPercentage))}%` }}
                className="bg-emerald-600 rounded-l-full transition-all duration-500 relative group flex items-center justify-center text-[10px] text-white font-medium font-mono-num"
              >
                {needsPercentage >= 15 && `${needsPercentage.toFixed(0)}%`}
              </div>
              <div
                style={{ width: `${Math.max(0, Math.min(100, wantsPercentage))}%` }}
                className="bg-amber-500 rounded-r-full transition-all duration-500 relative group flex items-center justify-center text-[10px] text-white font-medium font-mono-num"
              >
                {wantsPercentage >= 15 && `${wantsPercentage.toFixed(0)}%`}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
                <span className="text-stone-700 font-medium">Needs (Essentials)</span>
                <span className="font-mono-num font-semibold text-stone-900">
                  ${Math.round(needsAmount).toLocaleString()}/mo ({needsPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                <span className="text-stone-700 font-medium">Wants (Lifestyle)</span>
                <span className="font-mono-num font-semibold text-stone-900">
                  ${Math.round(wantsAmount).toLocaleString()}/mo ({wantsPercentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Warning or Affirmation Callout */}
          {isHighWants ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-800">Observation: </span>
                Wants account for {wantsPercentage.toFixed(0)}% of your monthly expenses (benchmark is under 30–35%).
                If you ever need to boost your savings rate quickly, trimming just one or two wants is the fastest lever without sacrificing survival essentials.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-emerald-800">Balanced Allocation: </span>
                Your discretionary wants are well-proportioned at {wantsPercentage.toFixed(0)}% of monthly spending, safely within prudent benchmarks.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2">Classification</th>
                <th className="py-2 text-right">Monthly Spend</th>
                <th className="py-2 text-right">Percentage</th>
                <th className="py-2 text-right">Standard Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              <tr>
                <td className="py-2 text-stone-800 font-sans font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Needs (Essential Bills & Survival)</span>
                </td>
                <td className="py-2 text-right text-stone-900">${Math.round(needsAmount).toLocaleString()}</td>
                <td className="py-2 text-right font-semibold text-stone-900">{needsPercentage.toFixed(1)}%</td>
                <td className="py-2 text-right font-sans text-stone-500">~50% of income</td>
              </tr>
              <tr>
                <td className="py-2 text-stone-800 font-sans font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Wants (Discretionary & Pleasures)</span>
                </td>
                <td className="py-2 text-right text-stone-900">${Math.round(wantsAmount).toLocaleString()}</td>
                <td className="py-2 text-right font-semibold text-stone-900">{wantsPercentage.toFixed(1)}%</td>
                <td className="py-2 text-right font-sans text-stone-500">~30% of income</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
