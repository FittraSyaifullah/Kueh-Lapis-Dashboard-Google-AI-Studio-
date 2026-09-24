import React from 'react';
import { X, Printer, Download, Sparkles, Shield, Key } from 'lucide-react';
import { CalculatedResults, Plan } from '../engine/types.ts';
import { generateReturnCode } from '../engine/defaultData.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  results: CalculatedResults;
  unlockedLevel: number;
}

export const PrintReport: React.FC<Props> = ({
  isOpen,
  onClose,
  plan,
  results,
  unlockedLevel,
}) => {
  if (!isOpen) return null;

  const returnCode = generateReturnCode(plan);
  const formattedDate = new Date().toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base font-display">Personal Financial Dashboard Report</h3>
              <p className="text-xs text-stone-400">Overhaul SG × AAG Financial Blueprint</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save to PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 text-stone-900 print:p-0 print:m-0">
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-amber-800 mb-1">
                Kueh Lapis Method · Personal Dashboard
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display text-stone-950">
                Financial Clarity Blueprint
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Workshop Cohort: {plan.sessionCode} · Prepared: {formattedDate}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs font-semibold text-stone-500 block uppercase tracking-wider">
                Participant
              </span>
              <span className="text-base font-bold text-stone-900">
                {plan.profile.name || 'Anonymous Attendee'}
              </span>
              <div className="text-xs font-mono-num text-stone-500 mt-0.5">
                Age {plan.profile.age || 44} · Target Retire Age {plan.profile.retirementAge || 60}
              </div>
            </div>
          </div>

          {/* Return Code Banner */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">Personal Return Code:</span>
                <span className="text-xs text-stone-500">Use this to resume or update your plan anytime</span>
              </div>
            </div>
            <span className="text-xl font-mono-num font-extrabold tracking-wider text-stone-900 bg-white px-3 py-1 rounded-xl border border-stone-300">
              {returnCode}
            </span>
          </div>

          {/* Section 1: Cash Flow & Habits (Layer 1) */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-stone-950 border-b border-stone-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono-num">
                1
              </span>
              <span>Layer 1: Cash Flow Foundation</span>
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-4 font-mono-num">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-sans font-medium text-stone-500 block">Monthly Inflow</span>
                <span className="text-xl font-bold text-stone-900">
                  ${Math.round(results.monthlyIncome).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-sans font-medium text-stone-500 block">Monthly Outflow</span>
                <span className="text-xl font-bold text-stone-900">
                  ${Math.round(results.monthlyExpenses).toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Needs ${Math.round(results.monthlyNeeds).toLocaleString()} · Wants ${Math.round(results.monthlyWants).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-sans font-medium text-stone-500 block">Net Monthly Surplus</span>
                <span
                  className={`text-xl font-bold ${
                    results.monthlyCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {results.monthlyCashFlow >= 0 ? '+' : '-'}${Math.round(Math.abs(results.monthlyCashFlow)).toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Savings Rate: {(results.savingsRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Runway (Layer 2) */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-stone-950 border-b border-stone-200 pb-2 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-stone-700 text-white text-[10px] flex items-center justify-center font-mono-num">
                2
              </span>
              <span>Layer 2: Emergency Runway & Stored Savings</span>
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-3 font-mono-num">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-sans font-medium text-stone-500 block">Pure Cash Runway</span>
                <span className="text-xl font-bold text-stone-900">
                  {results.cashRunwayMonths.toFixed(1)} <span className="text-xs font-normal">months</span>
                </span>
                <span className="text-[10px] font-sans text-amber-800 block mt-0.5 font-medium">
                  {results.cashRunwayBand.status}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-sans font-medium text-stone-500 block">Total Liquid Savings</span>
                <span className="text-xl font-bold text-stone-900">
                  ${Math.round(results.totalSavings).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="text-[11px] font-sans font-medium text-stone-500 block">Total Portfolio Runway</span>
                <span className="text-xl font-bold text-stone-900">
                  {results.totalRunwayMonths.toFixed(1)} <span className="text-xs font-normal">months</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: CPF Foundation (Layer 3) */}
          {results.cpfCalculations && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-stone-950 border-b border-stone-200 pb-2 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono-num">
                  3
                </span>
                <span>Layer 3: 2026 CPF Allocation</span>
              </h2>

              <div className="grid grid-cols-4 gap-3 text-xs font-mono-num mb-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 text-[10px] font-sans block">Total Monthly CPF</span>
                  <span className="font-bold text-stone-900 text-base">${results.cpfCalculations.totalCpfMonthly.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 text-[10px] font-sans block">OA Contribution</span>
                  <span className="font-bold text-stone-900 text-base">${results.cpfCalculations.oaMonthly.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 text-[10px] font-sans block">SA Contribution</span>
                  <span className="font-bold text-stone-900 text-base">${results.cpfCalculations.saMonthly.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 text-[10px] font-sans block">MA Contribution</span>
                  <span className="font-bold text-stone-900 text-base">${results.cpfCalculations.maMonthly.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4 & 5: Lifestyle & Retirement Gap */}
          {results.lumpSumNeeded > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-stone-950 border-b border-stone-200 pb-2 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-teal-700 text-white text-[10px] flex items-center justify-center font-mono-num">
                  5
                </span>
                <span>Layers 4 & 5: Retirement Lifestyle & Freedom Target</span>
              </h2>

              <div className="grid grid-cols-3 gap-4 font-mono-num mb-4">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-sans font-medium text-stone-500 block">Lump Sum Target Needed</span>
                  <span className="text-xl font-bold text-stone-900">${Math.round(results.lumpSumNeeded).toLocaleString()}</span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-sans font-medium text-stone-500 block">Projected Total Fund</span>
                  <span className="text-xl font-bold text-emerald-700">${Math.round(results.projectedFundAtRetirement).toLocaleString()}</span>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-sans font-medium text-amber-800 block">Funded Ratio</span>
                  <span className="text-xl font-bold text-stone-900">{(results.fundedPercentage * 100).toFixed(0)}%</span>
                  <span className="text-[10px] font-sans font-semibold text-amber-900 block mt-0.5">{results.fundedBand.status}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-700">
                <span className="font-semibold">Next Action: </span>
                {results.extraMonthlySavingNeeded > 0
                  ? `Investing an extra $${results.extraMonthlySavingNeeded.toLocaleString()}/month between now and age ${plan.profile.retirementAge || 60} bridges your retirement gap completely.`
                  : `Your plan is currently 100%+ funded. Your earliest potential retirement age is Age ${results.earliestRetirementAge || plan.profile.retirementAge}.`}
              </div>
            </div>
          )}

          {/* Key Assumptions Box */}
          <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-2xl text-[11px] text-stone-600 mb-8 space-y-1">
            <span className="font-bold text-stone-900 block uppercase tracking-wider text-[10px]">
              Core Modelling Assumptions
            </span>
            <p>
              Pre-Retirement Inflation: {((plan.lifestyle?.inflationPre ?? 0.03) * 100).toFixed(1)}% · Post-Retirement Inflation: {((plan.lifestyle?.inflationPost ?? 0.03) * 100).toFixed(1)}%
            </p>
            <p>
              Pre-Retirement Return: {((plan.returns?.preRetirementRate ?? 0.06) * 100).toFixed(1)}% · Post-Retirement Return: {((plan.returns?.postRetirementRate ?? 0.04) * 100).toFixed(1)}%
            </p>
            <p className="text-stone-500 italic pt-1">
              "All figures are illustrative projections, not guaranteed promises."
            </p>
          </div>

          {/* Statutory Regulatory Disclaimer */}
          <div className="border-t border-stone-200 pt-4 text-[10px] text-stone-400 leading-normal flex items-start gap-2">
            <Shield className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-600">Educational Notice: </span>
              This dashboard is designed solely for financial education, self-reflection, and workshop exercises by Overhaul SG and AAG. It does not constitute financial advice, an offer, solicitation, or recommendation of any specific financial product under the Singapore Financial Advisers Act (Cap. 110).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
