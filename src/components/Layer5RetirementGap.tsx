import React, { useState } from 'react';
import { HelpCircle, Download, TrendingUp } from 'lucide-react';
import { CalculatedResults, Plan } from '../engine/types.ts';
import { ProjectionLineChart } from './charts/ProjectionLineChart.tsx';
import assumptionsConfig from '../config/assumptions.json';

interface Props {
  plan: Plan;
  results: CalculatedResults;
  onUpdatePlan: (updated: Partial<Plan>) => void;
  onOpenReport: () => void;
}

export const Layer5RetirementGap: React.FC<Props> = ({
  plan,
  results,
  onUpdatePlan,
  onOpenReport,
}) => {
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);

  const retAge = plan.profile.retirementAge || 60;
  const currentAge = plan.profile.age || 44;
  const planningAge = plan.profile.planningAge || 85;

  const handleToggleCpf = () => {
    onUpdatePlan({
      toggles: {
        countCpfTowardsFund: !(plan.toggles?.countCpfTowardsFund ?? true),
      },
    });
  };

  const handleFundMixChange = (mixKey: string) => {
    const assetClasses = assumptionsConfig.asset_classes as Record<string, { label: string; default_rate: number }>;
    const preset = assetClasses[mixKey];
    if (!preset) return;
    onUpdatePlan({
      returns: {
        fundMix: mixKey,
        preRetirementRate: preset.default_rate,
        postRetirementRate: Math.max(0.02, preset.default_rate - 0.02),
      },
    });
  };

  const gapValue = results.lumpSumNeeded - results.projectedFundAtRetirement;
  const isFunded = gapValue <= 0;

  return (
    <div className="space-y-8">
      {/* Editorial Chapter Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
          <div className="text-xs text-stone-500 font-medium">
            Chapter 05 <span className="text-stone-300">/</span> The Capstone <span className="text-stone-300">·</span> Workshop Level 4
          </div>
          <button
            type="button"
            onClick={() => setShowWhyWeAsk(!showWhyWeAsk)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Why we ask this</span>
          </button>
        </div>

        <h2 className="text-3xl sm:text-4xl font-normal text-stone-950 font-display tracking-tight leading-tight">
          How much have I saved, and is it enough for the life I want?
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
          The culmination of your Kueh Lapis: uniting current savings, future monthly surplus accumulation, CPF growth, and your desired retirement living basket into one unified verdict.
        </p>

        {showWhyWeAsk && (
          <div className="mt-5 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-700 leading-relaxed font-light">
            <span className="font-semibold text-stone-900 font-sans">The Core Principle: </span>
            Retirement is not an age; it is a financial number. Knowing your gap today gives you agency. A gap is not a failure; it is the exact map of what surplus to invest or what timeline adjustments you can make while compounding works in your favor.
          </div>
        )}
      </section>

      {/* Primary Capstone Balance Figures (White Calculated Cells - SW-9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lump Sum Needed */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Lump Sum Target Needed</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.lumpSumNeeded).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Capital needed at age {retAge} to sustain inflated spending
          </p>
        </div>

        {/* Projected Total Fund */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Projected Fund at Age {retAge}</div>
          <div className="text-3xl font-normal text-emerald-800 font-mono-num">
            ${Math.round(results.projectedFundAtRetirement).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Investments + Cash + {plan.toggles?.countCpfTowardsFund ? 'CPF balances' : 'Excluding CPF'}
          </p>
        </div>

        {/* Gap Amount */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">
            {isFunded ? 'Projected Surplus' : 'Retirement Gap (Shortfall)'}
          </div>
          <div
            className={`text-3xl font-normal font-mono-num ${
              isFunded ? 'text-emerald-800' : 'text-rose-800'
            }`}
          >
            {isFunded ? '+' : '-'}${Math.round(Math.abs(gapValue)).toLocaleString()}
          </div>
          <p className="text-xs text-stone-600 mt-2 font-light">
            {isFunded ? 'Surplus buffer over target' : 'Capital shortfall at retirement age'}
          </p>
        </div>

        {/* Funded Percentage */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Funded Ratio</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            {(results.fundedPercentage * 100).toFixed(0)}%
          </div>
          <p className="text-xs text-amber-900 mt-2 font-light">
            {results.fundedBand.status}
          </p>
        </div>
      </div>

      {/* Actionable Next Step & Earliest Age Verdict (SW-45) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 font-medium text-stone-900 mb-2">
          <TrendingUp className="w-4 h-4 text-stone-600" />
          <span className="font-serif italic text-base">The Verdict & Strategic Options</span>
        </div>

        <div className="space-y-3 text-xs text-stone-700 leading-relaxed font-light">
          {isFunded ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl text-emerald-950">
              <span className="font-semibold block font-sans mb-1">Target Fully Funded:</span>
              Your projected assets exceed your desired lifestyle target by $
              {Math.round(Math.abs(gapValue)).toLocaleString()}. Based on your trajectory, your earliest potential retirement age is{' '}
              <strong className="font-mono-num font-bold">Age {results.earliestRetirementAge ?? retAge}</strong> (
              {retAge - (results.earliestRetirementAge ?? retAge)} years earlier than planned).
            </div>
          ) : (
            <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-2xl text-stone-800">
              <span className="font-semibold block font-sans mb-1">Bridging the Gap:</span>
              To close your ${Math.round(gapValue).toLocaleString()} gap completely before age {retAge}:
              <ul className="list-disc pl-5 mt-2 space-y-1 font-normal">
                <li>
                  <strong>Option A (Monthly Savings): </strong> Save or invest an additional{' '}
                  <strong className="font-mono-num font-bold">${results.extraMonthlySavingNeeded.toLocaleString()} / month</strong> from your current cash flow surplus until age {retAge}.
                </li>
                <li>
                  <strong>Option B (Retirement Timeline): </strong> Adjusting retirement to age{' '}
                  <strong className="font-mono-num font-bold">{retAge + 3}</strong> allows ongoing contributions and investment growth to narrow the gap by ~45%.
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Investment Mix & Sensitivity Settings (Parchment gold cells - SW-9) */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Portfolio Assumption
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Growth Engine & CPF Treatment
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Long-term compounding return assumptions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fund Mix Presets */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-2">
              Portfolio Growth Strategy (Fund Mix)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'cash', label: 'Cash / FD', rate: 0.02 },
                { key: 'bonds', label: 'Bonds / SSB', rate: 0.04 },
                { key: 'balanced', label: 'Balanced 60/40', rate: 0.06 },
                { key: 'equities', label: 'Equities / ETFs', rate: 0.08 },
              ].map((item) => {
                const isSelected = (plan.returns?.fundMix || 'balanced') === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleFundMixChange(item.key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-100/70 border-amber-400 text-stone-950 font-semibold shadow-2xs'
                        : 'bg-white border-[#dac8a0] text-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-xs block font-sans">{item.label}</span>
                    <span className="text-[11px] font-mono-num text-stone-500 font-normal">
                      {(item.rate * 100).toFixed(0)}% p.a.
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-stone-500 mt-2 block font-light">
              Annual return rate applied to non-cash investment buckets before retirement
            </span>
          </div>

          {/* CPF Inclusion Toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-2">
              CPF Treatment
            </label>
            <label className="flex items-start gap-3 p-3 bg-white border border-[#dac8a0] rounded-xl cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={plan.toggles?.countCpfTowardsFund ?? true}
                onChange={handleToggleCpf}
                className="w-4 h-4 mt-0.5 rounded accent-amber-700 text-amber-700"
              />
              <div>
                <span className="text-xs font-semibold text-stone-900 block">
                  Count CPF Balances Towards Retirement Fund
                </span>
                <span className="text-[11px] text-stone-500 font-light block leading-relaxed mt-0.5">
                  When enabled, your projected Ordinary & Special Account balances contribute to retirement capital. If disabled, retirement relies strictly on private non-CPF savings.
                </span>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Sensitivity Analysis Table (SW-27) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display mb-1">
          Sensitivity Analysis: Retiring Earlier or Later (±4 Years)
        </h3>
        <p className="text-xs text-stone-500 mb-6 font-light">
          See how your target lump sum, projected capital, and funded status shift with each year of extra work or early retirement:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2.5 px-3 font-medium">Retire Age</th>
                <th className="py-2.5 px-3 font-medium text-right">Lump Sum Target</th>
                <th className="py-2.5 px-3 font-medium text-right">Projected Assets</th>
                <th className="py-2.5 px-3 font-medium text-right">Surplus / Gap</th>
                <th className="py-2.5 px-3 font-medium text-right">Funded %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              {results.sensitivityTable.map((row) => {
                const isCurrent = row.retirementAge === retAge;
                const rowGap = row.lumpSumNeeded - row.projectedFund;
                const isRowFunded = rowGap <= 0;
                return (
                  <tr
                    key={row.retirementAge}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-amber-50/70 font-semibold text-stone-950'
                        : 'hover:bg-stone-50/60 text-stone-800'
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center gap-1.5">
                      <span>Age {row.retirementAge}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-sans text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                          Current Target
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      ${Math.round(row.lumpSumNeeded).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-800">
                      ${Math.round(row.projectedFund).toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-3 text-right ${
                        isRowFunded ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {isRowFunded ? '+' : '-'}${Math.round(Math.abs(rowGap)).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {(row.fundedPercentage * 100).toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lifespan Trajectory Line Chart */}
      <ProjectionLineChart
        currentAge={currentAge}
        retirementAge={retAge}
        planningAge={planningAge}
        lumpSumNeeded={results.lumpSumNeeded}
        projectedFund={results.projectedFundAtRetirement}
        fundedPercentage={results.fundedPercentage}
      />

      {/* Export Report CTA */}
      <section className="bg-stone-900 text-white rounded-3xl p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs font-medium text-amber-400 mb-1">
            Overhaul SG × AAG Financial Blueprint
          </div>
          <h3 className="text-2xl font-normal font-display tracking-tight text-white">
            Ready to preserve your complete dashboard?
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-md font-light leading-relaxed">
            Generate an archival A4 PDF report with all five layers, your return code, and personalized milestone summaries.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReport}
          className="flex items-center gap-2 px-6 py-3 bg-amber-300 hover:bg-amber-200 text-stone-950 font-semibold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Save / Print PDF Report</span>
        </button>
      </section>
    </div>
  );
};
