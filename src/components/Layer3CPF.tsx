import React, { useState } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { CalculatedResults, Plan } from '../engine/types.ts';

interface Props {
  plan: Plan;
  results: CalculatedResults;
  onUpdatePlan: (updated: Partial<Plan>) => void;
  onNextLayer: () => void;
}

export const Layer3CPF: React.FC<Props> = ({
  plan,
  results,
  onUpdatePlan,
  onNextLayer,
}) => {
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);

  const handleProfileChange = (field: 'age' | 'retirementAge', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    onUpdatePlan({
      profile: {
        ...plan.profile,
        [field]: num,
      },
    });
  };

  const handleGrossSalaryChange = (val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      income: {
        ...plan.income,
        grossSalary: cleanNum,
      },
    });
  };

  const handleCpfFieldChange = (field: 'oa' | 'sa' | 'ma' | 'mortgageFromOA', val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      cpf: {
        oa: plan.cpf?.oa || 0,
        sa: plan.cpf?.sa || 0,
        ma: plan.cpf?.ma || 0,
        mortgageFromOA: plan.cpf?.mortgageFromOA || 0,
        [field]: cleanNum,
      },
    });
  };

  const cpfCalcs = results.cpfCalculations;

  return (
    <div className="space-y-8">
      {/* Editorial Chapter Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
          <div className="text-xs text-stone-500 font-medium">
            Chapter 03 <span className="text-stone-300">/</span> Social Security <span className="text-stone-300">·</span> Workshop Level 2
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
          What is building up in my CPF accounts?
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
          Statutory contributions calculated in accordance with the 2026 CPF Board schedules, ordinary wage ceilings ($8,000/mo), and your age band allocation ratios.
        </p>

        {showWhyWeAsk && (
          <div className="mt-5 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-700 leading-relaxed font-light">
            <span className="font-semibold text-stone-900 font-sans">The Core Principle: </span>
            In Singapore, CPF represents the bedrock of social security and retirement funding. Employer contributions contribute up to 17% on top of cash wages. Tracking your OA mortgage deductions and SA compounding prevents shortfalls at age 55 and 65.
          </div>
        )}
      </section>

      {/* Input Parameters (Parchment gold cells - SW-9) */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Profile & Compensation
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Wage & Deduction Parameters
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Applies 2026 Singapore citizen / PR3+ schedules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Current Age
            </label>
            <input
              type="number"
              min="16"
              max="95"
              value={plan.profile.age || ''}
              onChange={(e) => handleProfileChange('age', e.target.value)}
              placeholder="44"
              className="w-full px-3.5 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
            />
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Determines statutory age band rate
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Monthly Gross Base Salary (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.grossSalary ? plan.income.grossSalary.toLocaleString() : ''}
                onChange={(e) => handleGrossSalaryChange(e.target.value)}
                placeholder="7,500"
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              2026 Ordinary Wage Ceiling: $8,000/mo
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Monthly Mortgage Paid from OA (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.cpf?.mortgageFromOA ? plan.cpf.mortgageFromOA.toLocaleString() : ''}
                onChange={(e) => handleCpfFieldChange('mortgageFromOA', e.target.value)}
                placeholder="800"
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Deducted automatically from your OA share
            </span>
          </div>
        </div>

        {/* Optional Current CPF Balances */}
        <div className="mt-6 pt-5 border-t border-[#ebd7b2]/60">
          <div className="text-xs font-semibold text-stone-800 mb-3">
            Current Account Balances (Optional - from CPF statement)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-stone-600 mb-1 font-medium">
                Ordinary Account (OA) · 2.5% p.a.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={plan.cpf?.oa ? plan.cpf.oa.toLocaleString() : ''}
                  onChange={(e) => handleCpfFieldChange('oa', e.target.value)}
                  placeholder="65,000"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1 font-medium">
                Special Account (SA) · 4.0% p.a.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={plan.cpf?.sa ? plan.cpf.sa.toLocaleString() : ''}
                  onChange={(e) => handleCpfFieldChange('sa', e.target.value)}
                  placeholder="45,000"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1 font-medium">
                MediSave Account (MA) · 4.0% p.a.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={plan.cpf?.ma ? plan.cpf.ma.toLocaleString() : ''}
                  onChange={(e) => handleCpfFieldChange('ma', e.target.value)}
                  placeholder="32,000"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculated CPF Output (White Calculated Cells - SW-9) */}
      {cpfCalcs && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="text-xs text-stone-500 font-medium mb-1.5">Total Monthly CPF</div>
              <div className="text-3xl font-normal text-stone-950 font-mono-num">
                ${cpfCalcs.totalCpfMonthly.toLocaleString()}
              </div>
              <p className="text-xs text-stone-500 mt-2 font-light">
                {(cpfCalcs.ageBand.total_rate * 100).toFixed(1)}% statutory total rate
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="text-xs text-stone-500 font-medium mb-1.5">Your Employee Share</div>
              <div className="text-3xl font-normal text-stone-950 font-mono-num">
                ${cpfCalcs.employeeCpfMonthly.toLocaleString()}
              </div>
              <p className="text-xs text-stone-500 mt-2 font-light">
                Deducted from gross ({(cpfCalcs.ageBand.employee_rate * 100).toFixed(0)}%)
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="text-xs text-stone-500 font-medium mb-1.5">Employer Contribution</div>
              <div className="text-3xl font-normal text-emerald-800 font-mono-num">
                +${cpfCalcs.employerCpfMonthly.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-800 mt-2 font-light">
                Contributed above salary ({(cpfCalcs.ageBand.employer_rate * 100).toFixed(1)}%)
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="text-xs text-stone-500 font-medium mb-1.5">Calculated Net Salary</div>
              <div className="text-3xl font-normal text-stone-950 font-mono-num">
                ${cpfCalcs.netSalaryMonthly.toLocaleString()}
              </div>
              <p className="text-xs text-stone-500 mt-2 font-light">
                Gross minus employee CPF share
              </p>
            </div>
          </div>

          {/* Account Breakdown: OA, SA, MA */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display mb-1">
              Monthly Account Split ({cpfCalcs.ageBand.label})
            </h3>
            <p className="text-xs text-stone-500 mb-6 font-light">
              Distribution of the ${cpfCalcs.totalCpfMonthly.toLocaleString()} monthly contribution across CPF accounts:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* OA */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-900">Ordinary Account (OA)</span>
                  <span className="text-xs font-mono-num text-stone-500">2.5% p.a.</span>
                </div>
                <div className="text-2xl font-normal text-stone-950 font-mono-num">
                  ${cpfCalcs.oaMonthly.toLocaleString()}
                  <span className="text-xs text-stone-500 font-sans font-light">/mo</span>
                </div>
                <div className="text-xs text-stone-600 mt-3 pt-3 border-t border-stone-200 space-y-1 font-light">
                  <div>Housing mortgage: -${(plan.cpf?.mortgageFromOA || 0).toLocaleString()}</div>
                  <div className="font-medium text-stone-900 pt-1">
                    Net monthly accumulation: $
                    {Math.max(0, cpfCalcs.oaMonthly - (plan.cpf?.mortgageFromOA || 0)).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* SA */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-900">Special Account (SA)</span>
                  <span className="text-xs font-mono-num text-stone-500">4.0% p.a.</span>
                </div>
                <div className="text-2xl font-normal text-stone-950 font-mono-num">
                  ${cpfCalcs.saMonthly.toLocaleString()}
                  <span className="text-xs text-stone-500 font-sans font-light">/mo</span>
                </div>
                <p className="text-xs text-stone-500 mt-3 pt-3 border-t border-stone-200 font-light leading-relaxed">
                  Dedicated compound growth for retirement nest-egg and CPF LIFE premiums.
                </p>
              </div>

              {/* MA */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-900">MediSave Account (MA)</span>
                  <span className="text-xs font-mono-num text-stone-500">4.0% p.a.</span>
                </div>
                <div className="text-2xl font-normal text-stone-950 font-mono-num">
                  ${cpfCalcs.maMonthly.toLocaleString()}
                  <span className="text-xs text-stone-500 font-sans font-light">/mo</span>
                </div>
                <p className="text-xs text-stone-500 mt-3 pt-3 border-t border-stone-200 font-light leading-relaxed">
                  Health insurance (MediShield Life, CareShield Life) and approved hospitalization expenses.
                </p>
              </div>
            </div>

            {/* Projected CPF */}
            <div className="mt-6 p-5 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex flex-col sm:flex-row items-baseline justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-stone-900 block">
                  Projected Combined CPF at Retirement (Age {plan.profile.retirementAge || 60})
                </span>
                <span className="text-xs text-stone-500 font-light">
                  Compounded at 2.5% (OA) and 4.0% (SA/MA) after deducting monthly mortgage
                </span>
              </div>
              <div className="text-2xl font-normal text-stone-950 font-mono-num">
                ${cpfCalcs.projectedCpfAtRetirement.toLocaleString()}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Statutory footnote */}
      <div className="text-xs text-stone-400 font-light leading-relaxed">
        <span className="font-medium text-stone-600">Statutory Note: </span>
        Computed under 2026 CPF Board rates for Singapore Citizens and Permanent Residents (Year 3+). Ordinary wage ceiling capped at $8,000. Excludes transitional 1st/2nd year PR rates and extra 1% bonus interest on initial balances.
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          Return to Top
        </button>

        <button
          type="button"
          onClick={onNextLayer}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-stone-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-300/70 rounded-2xl shadow-xs transition-all active:scale-[0.98]"
        >
          <span>Continue to Chapter 04: Desired Lifestyle</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
