import React, { useState } from 'react';
import { Table, PieChart, Repeat } from 'lucide-react';
import { SavingsBucketKey } from '../../engine/types.ts';

interface Props {
  bucketShares: {
    key: SavingsBucketKey;
    label: string;
    amount: number;
    monthlyContribution: number;
    percentage: number;
  }[];
  totalSavings: number;
  totalMonthlyContribution?: number;
}

const BUCKET_COLORS: Record<string, string> = {
  cash: '#10b981', // Emerald
  endowment: '#f59e0b', // Amber
  bonds: '#3b82f6', // Blue
  equities: '#8b5cf6', // Violet
  other: '#ec4899', // Pink
};

export const SavingsMixDonutChart: React.FC<Props> = ({
  bucketShares,
  totalSavings,
  totalMonthlyContribution = 0,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [chartMode, setChartMode] = useState<'valuation' | 'contribution'>('valuation');

  const isContributionMode = chartMode === 'contribution' && totalMonthlyContribution > 0;

  // Choose items based on mode
  const activeBuckets = isContributionMode
    ? bucketShares.filter((b) => b.monthlyContribution > 0)
    : bucketShares.filter((b) => b.amount > 0);

  const displayTotal = isContributionMode ? totalMonthlyContribution : totalSavings;

  let cumulativePct = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Savings & Investment Mix</h4>
          <p className="text-xs text-stone-500">Asset allocation across stored reserves and ongoing monthly flows</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {totalMonthlyContribution > 0 && !showTable && (
            <div className="inline-flex rounded-lg border border-stone-200 p-0.5 text-xs bg-stone-50">
              <button
                type="button"
                onClick={() => setChartMode('valuation')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  chartMode === 'valuation'
                    ? 'bg-white font-medium text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Stored Assets
              </button>
              <button
                type="button"
                onClick={() => setChartMode('contribution')}
                className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  chartMode === 'contribution'
                    ? 'bg-white font-medium text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Repeat className="w-3 h-3 text-stone-400" />
                <span>Monthly Flows</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors cursor-pointer"
          >
            {showTable ? <PieChart className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
            <span>{showTable ? 'View Donut' : 'Data Table'}</span>
          </button>
        </div>
      </div>

      {totalSavings === 0 && totalMonthlyContribution === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-stone-400 text-xs text-center">
          <p>No savings or investments recorded yet.</p>
          <p className="text-stone-500 text-[11px] mt-1">Enter your cash, endowments, bonds, or equities below.</p>
        </div>
      ) : !showTable ? (
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          {/* SVG Donut */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-stone-100 fill-none"
                strokeWidth="24"
              />
              {activeBuckets.map((bucket) => {
                const itemVal = isContributionMode ? bucket.monthlyContribution : bucket.amount;
                const pct = displayTotal > 0 ? (itemVal / displayTotal) * 100 : 0;
                const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePct / 100) * circumference);
                cumulativePct += pct;
                return (
                  <circle
                    key={bucket.key}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={BUCKET_COLORS[bucket.key] || '#64748b'}
                    strokeWidth="24"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
              <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                {isContributionMode ? 'Monthly' : 'Total'}
              </span>
              <span className="text-sm font-bold text-stone-900 font-mono-num">
                ${Math.round(displayTotal).toLocaleString()}
                {isContributionMode && <span className="text-[10px] font-normal text-stone-500 block -mt-0.5">/month</span>}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {activeBuckets.map((b) => {
              const itemVal = isContributionMode ? b.monthlyContribution : b.amount;
              const pct = displayTotal > 0 ? (itemVal / displayTotal) * 100 : 0;
              return (
                <div key={b.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: BUCKET_COLORS[b.key] || '#64748b' }}
                    />
                    <span className="text-stone-700 truncate">{b.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-num shrink-0">
                    <span className="font-semibold text-stone-900">
                      ${itemVal.toLocaleString()}
                      {isContributionMode && <span className="text-[11px] font-normal text-stone-500">/mo</span>}
                    </span>
                    <span className="text-stone-500 w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2.5">Asset Bucket</th>
                <th className="py-2.5 text-right">Current Value</th>
                <th className="py-2.5 text-right">Portfolio Share</th>
                <th className="py-2.5 text-right font-semibold text-amber-950">Monthly Contribution</th>
                <th className="py-2.5 text-right">Annual Flow</th>
                <th className="py-2.5 text-right">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              {bucketShares.map((b) => (
                <tr key={b.key} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-2.5 text-stone-800 font-sans flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: BUCKET_COLORS[b.key] || '#64748b' }}
                    />
                    <span className="font-medium">{b.label}</span>
                  </td>
                  <td className="py-2.5 text-right text-stone-900">${b.amount.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-medium text-stone-600">{b.percentage.toFixed(1)}%</td>
                  <td className="py-2.5 text-right font-medium text-amber-900">
                    {b.monthlyContribution > 0 ? (
                      `$${b.monthlyContribution.toLocaleString()}/mo`
                    ) : (
                      <span className="text-stone-400 font-light">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right text-stone-600">
                    {b.monthlyContribution > 0 ? (
                      `$${(b.monthlyContribution * 12).toLocaleString()}/yr`
                    ) : (
                      <span className="text-stone-400 font-light">—</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-sans text-stone-500">
                    {b.key === 'cash'
                      ? 'Emergency Buffer'
                      : b.key === 'equities'
                      ? 'Long-term Growth'
                      : b.key === 'bonds'
                      ? 'Fixed Yield'
                      : b.key === 'endowment'
                      ? 'Capital Preserving'
                      : 'Alternative'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-200 font-mono-num font-semibold text-stone-950 bg-stone-50/50">
                <td className="py-2.5 font-sans">Total Assets & Flows</td>
                <td className="py-2.5 text-right">${Math.round(totalSavings).toLocaleString()}</td>
                <td className="py-2.5 text-right font-sans text-stone-500">100%</td>
                <td className="py-2.5 text-right text-amber-900">
                  ${Math.round(totalMonthlyContribution).toLocaleString()}/mo
                </td>
                <td className="py-2.5 text-right text-stone-800">
                  ${Math.round(totalMonthlyContribution * 12).toLocaleString()}/yr
                </td>
                <td className="py-2.5 text-right font-sans text-stone-400 font-normal">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
