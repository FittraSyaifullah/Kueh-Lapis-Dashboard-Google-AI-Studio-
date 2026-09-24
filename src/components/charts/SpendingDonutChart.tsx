import React, { useState } from 'react';
import { Table, PieChart } from 'lucide-react';
import { ExpenseItem } from '../../engine/types.ts';

interface Props {
  expenses: ExpenseItem[];
  totalExpenses: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Housing & Shelter': '#e07a5f',
  'Food & Sustenance': '#f4a261',
  'Transport & Mobility': '#2a9d8f',
  'Family, Healthcare & Insurance': '#457b9d',
  'Lifestyle, Subscriptions & Leisure': '#e76f51',
  'Miscellaneous & Commitments': '#6c757d',
  'Custom Expenses': '#9d4edd',
};

export const SpendingDonutChart: React.FC<Props> = ({ expenses, totalExpenses }) => {
  const [showTable, setShowTable] = useState(false);

  // Aggregate by category
  const groups: Record<string, number> = {};
  expenses.forEach((item) => {
    const raw = Math.max(0, Number(item.amount) || 0);
    const monthly = item.period === 'year' ? raw / 12 : raw;
    const groupName = item.group || 'Custom Expenses';
    groups[groupName] = (groups[groupName] || 0) + monthly;
  });

  const categories = Object.entries(groups)
    .filter(([_, amount]) => amount > 0)
    .map(([group, amount]) => ({
      name: group,
      amount: Math.round(amount),
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: CATEGORY_COLORS[group] || '#78716c',
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate SVG stroke dashes for donut
  let cumulativePct = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Spending by Category</h4>
          <p className="text-xs text-stone-500">Distribution across major life areas</p>
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

      {categories.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-stone-400 text-xs text-center py-6">
          <p>No expenses entered yet.</p>
          <p className="text-stone-500 text-[11px] mt-1">Enter your monthly or annual expenses below.</p>
        </div>
      ) : !showTable ? (
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          {/* Donut graphic */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-stone-100 fill-none"
                strokeWidth="24"
              />
              {categories.map((cat) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePct / 100) * circumference);
                cumulativePct += cat.percentage;
                return (
                  <circle
                    key={cat.name}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={cat.color}
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
                ${Math.round(totalExpenses).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-stone-700 truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono-num shrink-0">
                  <span className="font-semibold text-stone-900">${cat.amount.toLocaleString()}</span>
                  <span className="text-stone-500 w-9 text-right">{cat.percentage.toFixed(0)}%</span>
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
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Monthly Spend</th>
                <th className="py-2 text-right">Annualised</th>
                <th className="py-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              {categories.map((c) => (
                <tr key={c.name}>
                  <td className="py-2 text-stone-800 font-sans flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </td>
                  <td className="py-2 text-right text-stone-900">${c.amount.toLocaleString()}</td>
                  <td className="py-2 text-right text-stone-600">${Math.round(c.amount * 12).toLocaleString()}</td>
                  <td className="py-2 text-right font-medium text-stone-700">{c.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
