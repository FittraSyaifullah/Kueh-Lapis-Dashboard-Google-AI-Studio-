import React, { useState } from 'react';
import { Table, PieChart } from 'lucide-react';
import { SavingsBuckets } from '../../engine/types.ts';

interface Props {
  bucketShares: {
    key: keyof SavingsBuckets;
    label: string;
    amount: number;
    percentage: number;
  }[];
  totalSavings: number;
}

const BUCKET_COLORS: Record<string, string> = {
  cash: '#10b981', // Emerald
  endowment: '#f59e0b', // Amber
  bonds: '#3b82f6', // Blue
  equities: '#8b5cf6', // Violet
  other: '#ec4899', // Pink
};

export const SavingsMixDonutChart: React.FC<Props> = ({ bucketShares, totalSavings }) => {
  const [showTable, setShowTable] = useState(false);

  const activeBuckets = bucketShares.filter((b) => b.amount > 0);

  let cumulativePct = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Savings & Investment Mix</h4>
          <p className="text-xs text-stone-500">Asset allocation across liquidity and growth</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors"
        >
          {showTable ? <PieChart className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{showTable ? 'View Donut' : 'Data Table'}</span>
        </button>
      </div>

      {totalSavings === 0 ? (
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
                const strokeDasharray = `${(bucket.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePct / 100) * circumference);
                cumulativePct += bucket.percentage;
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Total</span>
              <span className="text-sm font-bold text-stone-900 font-mono-num">
                ${Math.round(totalSavings).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {activeBuckets.map((b) => (
              <div key={b.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: BUCKET_COLORS[b.key] || '#64748b' }}
                  />
                  <span className="text-stone-700 truncate">{b.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-num shrink-0">
                  <span className="font-semibold text-stone-900">${b.amount.toLocaleString()}</span>
                  <span className="text-stone-500 w-10 text-right">{b.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2">Asset Bucket</th>
                <th className="py-2 text-right">Current Value</th>
                <th className="py-2 text-right">Portfolio Share</th>
                <th className="py-2 text-right">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              {activeBuckets.map((b) => (
                <tr key={b.key}>
                  <td className="py-2 text-stone-800 font-sans flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: BUCKET_COLORS[b.key] || '#64748b' }}
                    />
                    <span>{b.label}</span>
                  </td>
                  <td className="py-2 text-right text-stone-900">${b.amount.toLocaleString()}</td>
                  <td className="py-2 text-right font-medium text-stone-700">{b.percentage.toFixed(1)}%</td>
                  <td className="py-2 text-right font-sans text-stone-500">
                    {b.key === 'cash' ? 'Emergency Buffer' : b.key === 'equities' ? 'Long-term Growth' : 'Capital Preserving'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
