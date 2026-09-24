import React from 'react';
import { ArrowDownRight, Sparkles } from 'lucide-react';

interface Props {
  income: number;
  otherIncome: number;
  needs: number;
  wants: number;
  cashFlow: number;
}

export const CashFlowSankeyChart: React.FC<Props> = ({
  income,
  otherIncome,
  needs,
  wants,
  cashFlow,
}) => {
  const totalInflow = income + otherIncome;
  const totalOutflow = needs + wants;
  const isSurplus = cashFlow >= 0;

  if (totalInflow <= 0 && totalOutflow <= 0) {
    return null;
  }

  const needsPct = totalInflow > 0 ? (needs / totalInflow) * 100 : 0;
  const wantsPct = totalInflow > 0 ? (wants / totalInflow) * 100 : 0;
  const surplusPct = totalInflow > 0 ? (Math.max(0, cashFlow) / totalInflow) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Cash Flow Stream</h4>
          <p className="text-xs text-stone-500 font-light">Where your monthly inflow distributes and what remains</p>
        </div>
        <div className="text-xs font-mono-num text-stone-500 font-medium">
          Total Inflow: ${Math.round(totalInflow).toLocaleString()}
        </div>
      </div>

      {/* Stream Diagram */}
      <div className="space-y-4">
        {/* Stream Bar representation */}
        <div className="h-7 w-full rounded-xl bg-stone-100 flex overflow-hidden p-0.5 border border-stone-200/60 shadow-inner">
          {/* Needs Segment */}
          <div
            style={{ width: `${Math.max(0, Math.min(100, needsPct))}%` }}
            className="bg-emerald-700 rounded-l-lg transition-all duration-500 flex items-center justify-center text-[10px] text-white font-medium font-mono-num px-1 truncate"
            title={`Needs: $${Math.round(needs).toLocaleString()} (${needsPct.toFixed(0)}%)`}
          >
            {needsPct >= 12 && `Needs ${needsPct.toFixed(0)}%`}
          </div>

          {/* Wants Segment */}
          <div
            style={{ width: `${Math.max(0, Math.min(100, wantsPct))}%` }}
            className="bg-amber-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-medium font-mono-num px-1 truncate"
            title={`Wants: $${Math.round(wants).toLocaleString()} (${wantsPct.toFixed(0)}%)`}
          >
            {wantsPct >= 12 && `Wants ${wantsPct.toFixed(0)}%`}
          </div>

          {/* Surplus Segment */}
          {isSurplus && surplusPct > 0 ? (
            <div
              style={{ width: `${Math.max(0, Math.min(100, surplusPct))}%` }}
              className="bg-stone-900 rounded-r-lg transition-all duration-500 flex items-center justify-center text-[10px] text-amber-300 font-semibold font-mono-num px-1 truncate"
              title={`Surplus: $${Math.round(cashFlow).toLocaleString()} (${surplusPct.toFixed(0)}%)`}
            >
              {surplusPct >= 12 && `Surplus ${surplusPct.toFixed(0)}%`}
            </div>
          ) : !isSurplus ? (
            <div
              className="bg-rose-600 rounded-r-lg flex-1 flex items-center justify-center text-[10px] text-white font-semibold font-mono-num px-1 truncate"
              title={`Monthly Deficit: -$${Math.round(Math.abs(cashFlow)).toLocaleString()}`}
            >
              Deficit
            </div>
          ) : null}
        </div>

        {/* Breakdown Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {/* Card 1: Needs */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
                1. Survival Needs
              </span>
              <span className="font-mono-num font-semibold text-stone-900">
                {needsPct.toFixed(0)}%
              </span>
            </div>
            <div className="text-base font-semibold text-stone-900 font-mono-num">
              ${Math.round(needs).toLocaleString()}
              <span className="text-[11px] font-sans font-normal text-stone-400">/mo</span>
            </div>
            <span className="text-[11px] text-stone-500 font-light mt-0.5 block">
              Essential housing, groceries, transport
            </span>
          </div>

          {/* Card 2: Wants */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-stone-700">
                <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                2. Lifestyle Wants
              </span>
              <span className="font-mono-num font-semibold text-stone-900">
                {wantsPct.toFixed(0)}%
              </span>
            </div>
            <div className="text-base font-semibold text-stone-900 font-mono-num">
              ${Math.round(wants).toLocaleString()}
              <span className="text-[11px] font-sans font-normal text-stone-400">/mo</span>
            </div>
            <span className="text-[11px] text-stone-500 font-light mt-0.5 block">
              Dining out, leisure, subscriptions
            </span>
          </div>

          {/* Card 3: Surplus or Deficit */}
          <div
            className={`p-3 rounded-xl border ${
              isSurplus
                ? 'bg-amber-50/40 border-amber-200/80 text-amber-950'
                : 'bg-rose-50/50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                {isSurplus ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                )}
                {isSurplus ? '3. Net Surplus' : '3. Monthly Deficit'}
              </span>
              <span className="font-mono-num font-semibold">
                {isSurplus ? `${surplusPct.toFixed(0)}%` : 'Warning'}
              </span>
            </div>
            <div
              className={`text-base font-semibold font-mono-num ${
                isSurplus ? 'text-emerald-800' : 'text-rose-800'
              }`}
            >
              {isSurplus ? '+' : '-'}${Math.round(Math.abs(cashFlow)).toLocaleString()}
              <span className="text-[11px] font-sans font-normal text-stone-400">/mo</span>
            </div>
            <span className="text-[11px] text-stone-600 font-light mt-0.5 block">
              {isSurplus
                ? 'Funds your emergency buffer & wealth'
                : 'Spending exceeds income; trim wants'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
