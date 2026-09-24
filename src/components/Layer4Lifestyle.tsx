import React, { useState } from 'react';
import { HelpCircle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { CalculatedResults, LifestyleItem, Plan } from '../engine/types.ts';

interface Props {
  plan: Plan;
  results: CalculatedResults;
  onUpdatePlan: (updated: Partial<Plan>) => void;
  onNextLayer: () => void;
}

export const Layer4Lifestyle: React.FC<Props> = ({
  plan,
  results,
  onUpdatePlan,
  onNextLayer,
}) => {
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const currentAge = plan.profile.age || 44;
  const retAge = plan.profile.retirementAge || 60;
  const planAge = plan.profile.planningAge || 85;

  const handleProfileField = (field: 'retirementAge' | 'planningAge', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    onUpdatePlan({
      profile: {
        ...plan.profile,
        [field]: num,
      },
    });
  };

  const handleInflationChange = (field: 'inflationPre' | 'inflationPost', val: number) => {
    onUpdatePlan({
      lifestyle: {
        items: plan.lifestyle?.items || [],
        inflationPre: plan.lifestyle?.inflationPre ?? 0.03,
        inflationPost: plan.lifestyle?.inflationPost ?? 0.03,
        [field]: val,
      },
    });
  };

  const handleItemAmountChange = (id: string, val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    const updated = (plan.lifestyle?.items || []).map((i) => (i.id === id ? { ...i, amount: cleanNum } : i));
    onUpdatePlan({
      lifestyle: {
        items: updated,
        inflationPre: plan.lifestyle?.inflationPre ?? 0.03,
        inflationPost: plan.lifestyle?.inflationPost ?? 0.03,
      },
    });
  };

  const handleDeleteItem = (id: string) => {
    const updated = (plan.lifestyle?.items || []).filter((i) => i.id !== id);
    onUpdatePlan({
      lifestyle: {
        items: updated,
        inflationPre: plan.lifestyle?.inflationPre ?? 0.03,
        inflationPost: plan.lifestyle?.inflationPost ?? 0.03,
      },
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const cleanAmount = Math.max(0, Number(newAmount.replace(/[^0-9.]/g, '')) || 0);
    const newItem: LifestyleItem = {
      id: `life_${Date.now()}`,
      label: newLabel.trim(),
      amount: cleanAmount,
      period: 'month',
      custom: true,
    };
    onUpdatePlan({
      lifestyle: {
        items: [...(plan.lifestyle?.items || []), newItem],
        inflationPre: plan.lifestyle?.inflationPre ?? 0.03,
        inflationPost: plan.lifestyle?.inflationPost ?? 0.03,
      },
    });
    setNewLabel('');
    setNewAmount('');
  };

  const yearsToRetirement = Math.max(0, retAge - currentAge);
  const yearsInRetirement = Math.max(0, planAge - retAge);

  return (
    <div className="space-y-8">
      {/* Editorial Chapter Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
          <div className="text-xs text-stone-500 font-medium">
            Chapter 04 <span className="text-stone-300">/</span> Horizon <span className="text-stone-300">·</span> Workshop Level 3
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
          What life do I want, and what will it cost then?
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
          Specify what monthly living expenses you desire in retirement. In Singapore, compounding inflation means a $3,000 basket today costs significantly more when you retire in {yearsToRetirement} years.
        </p>

        {showWhyWeAsk && (
          <div className="mt-5 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-700 leading-relaxed font-light">
            <span className="font-semibold text-stone-900 font-sans">The Core Principle: </span>
            A cup of kopi or chicken rice that cost $1.50 twenty years ago costs $4.00+ today. If your retirement plan ignores compounding inflation, your purchasing power halves every 24 years at 3% inflation.
          </div>
        )}
      </section>

      {/* Highlights: Today's Basket vs Future Inflated Basket */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Today's Desired Monthly Spend</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.desiredSpendMonthlyToday).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Sum of all retirement living items at current purchasing power
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">
            Future Cost at Age {retAge}
          </div>
          <div className="text-3xl font-normal text-amber-900 font-mono-num">
            ${results.costAtRetirementMonthly.toLocaleString()}
          </div>
          <p className="text-xs text-stone-600 mt-2 font-light">
            Inflated over {yearsToRetirement} years at {(((plan.lifestyle?.inflationPre ?? 0.03) * 100)).toFixed(1)}% p.a.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Retirement Horizon</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num flex items-baseline gap-1.5">
            <span>{yearsInRetirement}</span>
            <span className="text-sm font-normal text-stone-500">years funded</span>
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            From retirement age {retAge} to planning age {planAge}
          </p>
        </div>
      </div>

      {/* Target Ages & Inflation Configuration (Parchment gold cells - SW-9) */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Assumptions
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Timeline & Compounding Inflation
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Config-driven historical benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Target Retirement Age
            </label>
            <input
              type="number"
              min={currentAge}
              max="90"
              value={retAge}
              onChange={(e) => handleProfileField('retirementAge', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
            />
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Age when active wage stops
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Planning Horizon (Age)
            </label>
            <input
              type="number"
              min={retAge + 5}
              max="105"
              value={planAge}
              onChange={(e) => handleProfileField('planningAge', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
            />
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Singapore average life expectancy: ~85
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                Pre-Retirement Inflation
              </label>
              <span className="text-xs font-mono-num text-amber-900 font-medium">
                {(((plan.lifestyle?.inflationPre ?? 0.03) * 100)).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.06"
              step="0.005"
              value={plan.lifestyle?.inflationPre ?? 0.03}
              onChange={(e) => handleInflationChange('inflationPre', parseFloat(e.target.value))}
              className="w-full accent-amber-700 mt-2"
            />
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Benchmark: MAS core inflation ~3.0%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                Post-Retirement Inflation
              </label>
              <span className="text-xs font-mono-num text-amber-900 font-medium">
                {(((plan.lifestyle?.inflationPost ?? 0.03) * 100)).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.06"
              step="0.005"
              value={plan.lifestyle?.inflationPost ?? 0.03}
              onChange={(e) => handleInflationChange('inflationPost', parseFloat(e.target.value))}
              className="w-full accent-amber-700 mt-2"
            />
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Healthcare & long-term living inflation
            </span>
          </div>
        </div>

        {/* Singapore Everyday Inflation Reality Check */}
        <div className="mt-6 pt-5 border-t border-[#ebd7b2]/60">
          <div className="text-xs font-semibold text-stone-900 mb-2 flex items-center justify-between">
            <span>Everyday Singapore Inflation Reality Check ({yearsToRetirement} years to age {retAge}):</span>
            <span className="font-mono-num text-[11px] text-stone-500 font-normal">
              Purchasing power multiplier: {(Math.pow(1 + (plan.lifestyle?.inflationPre ?? 0.03), yearsToRetirement)).toFixed(2)}×
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#dac8a0]">
              <span className="text-[11px] text-stone-500 block truncate">Kopitiam Kopi / Teh</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-stone-400 font-mono-num">$1.80</span>
                <span className="text-stone-300">→</span>
                <span className="font-bold text-stone-900 font-mono-num">
                  ${(1.8 * Math.pow(1 + (plan.lifestyle?.inflationPre ?? 0.03), yearsToRetirement)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#dac8a0]">
              <span className="text-[11px] text-stone-500 block truncate">Hawker Chicken Rice</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-stone-400 font-mono-num">$6.00</span>
                <span className="text-stone-300">→</span>
                <span className="font-bold text-stone-900 font-mono-num">
                  ${(6.0 * Math.pow(1 + (plan.lifestyle?.inflationPre ?? 0.03), yearsToRetirement)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#dac8a0]">
              <span className="text-[11px] text-stone-500 block truncate">Monthly SP Utilities</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-stone-400 font-mono-num">$180</span>
                <span className="text-stone-300">→</span>
                <span className="font-bold text-stone-900 font-mono-num">
                  ${Math.round(180 * Math.pow(1 + (plan.lifestyle?.inflationPre ?? 0.03), yearsToRetirement)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#dac8a0]">
              <span className="text-[11px] text-stone-500 block truncate">Weekend Family Dining</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-stone-400 font-mono-num">$120</span>
                <span className="text-stone-300">→</span>
                <span className="font-bold text-stone-900 font-mono-num">
                  ${Math.round(120 * Math.pow(1 + (plan.lifestyle?.inflationPre ?? 0.03), yearsToRetirement)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desired Lifestyle Items Ledger */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-stone-200/70">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Desired Spend
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Retirement Living Expenses (Today's Dollars)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Enter what each category would cost today
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {(plan.lifestyle?.items || []).map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/60 rounded-xl px-2 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-stone-900 block truncate">
                  {item.label}
                </span>
                {item.custom && (
                  <span className="text-[10px] text-stone-400 font-mono-num">
                    [custom]
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative w-28 sm:w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.amount > 0 ? item.amount.toLocaleString() : ''}
                    onChange={(e) => handleItemAmountChange(item.id, e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono-num font-medium text-stone-950 bg-[#fffdf7] border border-[#e2d5b6] rounded-lg focus:border-amber-700 outline-none text-right shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-stone-300 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Item */}
        <form
          onSubmit={handleAddItem}
          className="mt-6 pt-5 border-t border-stone-200/70 flex items-center gap-2 text-xs"
        >
          <input
            type="text"
            placeholder="Add desired retirement item (e.g. Travel, Grandchildren fund)..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-400 focus:bg-white font-light"
          />

          <div className="relative w-24">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full pl-5 pr-2 py-2 bg-[#fffdf7] border border-[#e2d5b6] rounded-xl font-mono-num text-right outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1 px-3.5 py-2 font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-2xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </section>

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
          <span>Continue to Chapter 05: Freedom Gap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
