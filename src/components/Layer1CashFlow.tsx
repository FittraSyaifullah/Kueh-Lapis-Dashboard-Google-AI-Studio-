import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, ArrowRight } from 'lucide-react';
import { CalculatedResults, ExpenseItem, Plan } from '../engine/types.ts';
import { CashFlowBarChart } from './charts/CashFlowBarChart.tsx';
import { SpendingDonutChart } from './charts/SpendingDonutChart.tsx';
import { NeedVsWantChart } from './charts/NeedVsWantChart.tsx';
import { TopExpensesBarChart } from './charts/TopExpensesBarChart.tsx';

interface Props {
  plan: Plan;
  results: CalculatedResults;
  onUpdatePlan: (updated: Partial<Plan>) => void;
  needWantTagging: boolean;
  monthlyYearlyToggle: boolean;
  onNextLayer: () => void;
}

export const Layer1CashFlow: React.FC<Props> = ({
  plan,
  results,
  onUpdatePlan,
  needWantTagging,
  monthlyYearlyToggle,
  onNextLayer,
}) => {
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);
  const [filterTag, setFilterTag] = useState<'all' | 'need' | 'want'>('all');
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomAmount, setNewCustomAmount] = useState('');
  const [newCustomPeriod, setNewCustomPeriod] = useState<'month' | 'year'>('month');
  const [newCustomTag, setNewCustomTag] = useState<'need' | 'want'>('need');

  // Handle income update
  const handleTakeHomeChange = (val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      income: {
        ...plan.income,
        takeHomePay: cleanNum,
      },
    });
  };

  const handleOtherIncomeChange = (val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      income: {
        ...plan.income,
        otherIncome: cleanNum,
      },
    });
  };

  // Handle updating an existing expense item
  const handleExpenseAmountChange = (id: string, val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    const updatedExpenses = plan.expenses.map((e) => (e.id === id ? { ...e, amount: cleanNum } : e));
    onUpdatePlan({ expenses: updatedExpenses });
  };

  const handleExpensePeriodToggle = (id: string) => {
    const updatedExpenses = plan.expenses.map((e) => {
      if (e.id !== id) return e;
      const newPeriod = e.period === 'month' ? ('year' as const) : ('month' as const);
      const newAmount = newPeriod === 'year' ? Math.round(e.amount * 12) : Math.round(e.amount / 12);
      return {
        ...e,
        period: newPeriod,
        amount: newAmount,
      };
    });
    onUpdatePlan({ expenses: updatedExpenses });
  };

  const handleExpenseTagToggle = (id: string) => {
    const updatedExpenses = plan.expenses.map((e) => {
      if (e.id !== id) return e;
      return {
        ...e,
        tag: e.tag === 'need' ? ('want' as const) : ('need' as const),
      };
    });
    onUpdatePlan({ expenses: updatedExpenses });
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = plan.expenses.filter((e) => e.id !== id);
    onUpdatePlan({ expenses: updatedExpenses });
  };

  const handleAddCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomLabel.trim()) return;

    const cleanAmount = Math.max(0, Number(newCustomAmount.replace(/[^0-9.]/g, '')) || 0);
    const newItem: ExpenseItem = {
      id: `custom_${Date.now()}`,
      group: 'Custom Expenses',
      label: newCustomLabel.trim(),
      amount: cleanAmount,
      period: newCustomPeriod,
      tag: newCustomTag,
      custom: true,
    };

    onUpdatePlan({
      expenses: [...plan.expenses, newItem],
    });
    setNewCustomLabel('');
    setNewCustomAmount('');
  };

  const displayedExpenses = plan.expenses.filter((e) => {
    if (filterTag === 'all') return true;
    return e.tag === filterTag;
  });

  return (
    <div className="space-y-8">
      {/* Editorial Chapter Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
          <div className="text-xs text-stone-500 font-medium">
            Chapter 01 <span className="text-stone-300">/</span> Foundation <span className="text-stone-300">·</span> Workshop Level 1
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
          Where does my money go, and what is left?
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
          Record your genuine take-home income and monthly living expenses. In the Kueh Lapis method, gold cells represent your personal entries; white ledger cards calculate automatically in real time.
        </p>

        {showWhyWeAsk && (
          <div className="mt-5 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-700 leading-relaxed font-light">
            <span className="font-semibold text-stone-900 font-sans">The Core Principle: </span>
            Cash flow is the bedrock layer of any financial house. Without knowing what stays in your pocket each month, long-term saving, investing, or retirement planning is built on guesswork. Knowing your true monthly surplus is how you fund emergency buffers and build freedom.
          </div>
        )}
      </section>

      {/* Calculated Ledger Balance Figures (White Calculated Cells - SW-9) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Total */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Monthly Net Inflow</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.monthlyIncome).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Net pay received after employee CPF deduction
          </p>
        </div>

        {/* Expenses Total */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Monthly Total Outflow</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.monthlyExpenses).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Needs: ${Math.round(results.monthlyNeeds).toLocaleString()} · Wants: ${Math.round(results.monthlyWants).toLocaleString()}
          </p>
        </div>

        {/* Cash Flow Result */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Net Left Each Month</div>
          <div
            className={`text-3xl font-normal font-mono-num ${
              results.monthlyCashFlow >= 0 ? 'text-emerald-800' : 'text-rose-800'
            }`}
          >
            {results.monthlyCashFlow >= 0 ? '+' : '-'}${Math.round(Math.abs(results.monthlyCashFlow)).toLocaleString()}
          </div>
          <p className="text-xs text-stone-600 mt-2 font-light">
            {results.monthlyCashFlow >= 0
              ? `${(results.savingsRate * 100).toFixed(1)}% savings rate (${results.savingsRateBand.status})`
              : 'Monthly deficit (Spending exceeds earnings)'}
          </p>
        </div>
      </div>

      {/* Editorial Reader Observation Note (Non-judgmental guidance - SW-45) */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs text-xs text-stone-700 leading-relaxed">
        <div className="flex items-center gap-2 font-medium text-stone-900 mb-1">
          <span
            className={`w-2 h-2 rounded-full ${
              results.monthlyCashFlow > 0
                ? 'bg-emerald-600'
                : results.monthlyCashFlow === 0
                ? 'bg-stone-400'
                : 'bg-rose-600'
            }`}
          />
          <span className="font-serif italic text-sm">
            {results.monthlyCashFlow > 0
              ? 'Positive Monthly Buffer'
              : results.monthlyCashFlow === 0
              ? 'Breakeven Month-to-Month'
              : 'Immediate Attention: Monthly Deficit'}
          </span>
        </div>
        <p className="font-light">
          {results.monthlyCashFlow > 0
            ? `You have +$${Math.round(results.monthlyCashFlow).toLocaleString()} left over every month. This surplus forms the building block for your emergency runway and retirement investments.`
            : results.monthlyCashFlow === 0
            ? 'Your spending currently matches your earnings. While you are not accumulating debt, an unexpected vehicle or medical expense could strain your reserves.'
            : `Your monthly expenses currently exceed take-home pay by $${Math.round(Math.abs(results.monthlyCashFlow)).toLocaleString()}. What to do next: Review discretionary 'Wants' below. Trimming just 1 or 2 leisure, dining, or subscription items can restore balance without touching essentials.`}
        </p>
      </div>

      {/* Step 1: Income Inputs (Fine Parchment Gold - SW-9) */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Part 1 of 2
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Net Inflow (Take-Home Salary)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Parchment cells = Editable entries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Monthly Net Take-Home Pay (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-light text-sm font-mono-num">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.takeHomePay ? plan.income.takeHomePay.toLocaleString() : ''}
                onChange={(e) => handleTakeHomeChange(e.target.value)}
                placeholder="4,200"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 font-medium text-base focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Cash salary deposited into your bank account after employee CPF
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Other Regular Monthly Inflow
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-light text-sm font-mono-num">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.otherIncome ? plan.income.otherIncome.toLocaleString() : ''}
                onChange={(e) => handleOtherIncomeChange(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 font-medium text-base focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Side-gig, rental, or dividend yield (leave as 0 if none)
            </span>
          </div>
        </div>
      </section>

      {/* Step 2: Living Expenses Ledger */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6 pb-4 border-b border-stone-200/70">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Part 2 of 2
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Itemised Living Expenses
            </h3>
          </div>

          {/* Interactive Filter Tabs (Functional Button Elements) */}
          {needWantTagging && (
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterTag('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTag === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-medium'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Items ({plan.expenses.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('need')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTag === 'need'
                    ? 'bg-white text-emerald-900 shadow-2xs font-medium'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Needs Only
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('want')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterTag === 'want'
                    ? 'bg-white text-amber-900 shadow-2xs font-medium'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Wants Only
              </button>
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div className="divide-y divide-stone-100">
          {displayedExpenses.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 rounded-xl px-2 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-900 truncate">
                    {item.label}
                  </span>
                  {item.custom && (
                    <span className="text-[10px] text-stone-400 font-mono-num">
                      [custom]
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 font-light mt-0.5 truncate">
                  {item.group}
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Need vs Want Tag button */}
                {needWantTagging && (
                  <button
                    type="button"
                    onClick={() => handleExpenseTagToggle(item.id)}
                    className={`min-h-[34px] px-2.5 py-1 text-[11px] rounded-lg transition-colors border ${
                      item.tag === 'need'
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60 font-medium'
                        : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/60 font-medium'
                    }`}
                    title="Click to toggle between Need and Want"
                  >
                    {item.tag === 'need' ? 'Need' : 'Want'}
                  </button>
                )}

                {/* Month / Year toggle */}
                {monthlyYearlyToggle && (
                  <button
                    type="button"
                    onClick={() => handleExpensePeriodToggle(item.id)}
                    className="min-h-[34px] px-2 py-1 text-[11px] font-mono-num text-stone-600 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors"
                    title="Toggle monthly or annual billing"
                  >
                    /{item.period === 'month' ? 'mo' : 'yr'}
                  </button>
                )}

                {/* Amount Input (Parchment gold cell - SW-9) */}
                <div className="relative w-28 sm:w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.amount > 0 ? item.amount.toLocaleString() : ''}
                    onChange={(e) => handleExpenseAmountChange(item.id, e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono-num font-medium text-stone-950 bg-[#fffdf7] border border-[#e2d5b6] rounded-lg focus:border-amber-700 focus:bg-white outline-none transition-all text-right shadow-2xs"
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteExpense(item.id)}
                  className="p-1.5 text-stone-300 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Row */}
        <form
          onSubmit={handleAddCustomExpense}
          className="mt-6 pt-5 border-t border-stone-200/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs"
        >
          <input
            type="text"
            placeholder="Add custom expense (e.g. Pet Care, Piano Lessons)..."
            value={newCustomLabel}
            onChange={(e) => setNewCustomLabel(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-stone-400 focus:bg-white outline-none font-light"
          />

          <div className="flex items-center gap-2">
            <select
              value={newCustomTag}
              onChange={(e) => setNewCustomTag(e.target.value as 'need' | 'want')}
              className="px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 outline-none"
            >
              <option value="need">Need</option>
              <option value="want">Want</option>
            </select>

            <select
              value={newCustomPeriod}
              onChange={(e) => setNewCustomPeriod(e.target.value as 'month' | 'year')}
              className="px-2 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 outline-none font-mono-num"
            >
              <option value="month">/mo</option>
              <option value="year">/yr</option>
            </select>

            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={newCustomAmount}
                onChange={(e) => setNewCustomAmount(e.target.value)}
                className="w-full pl-5 pr-2 py-2 bg-[#fffdf7] border border-[#e2d5b6] rounded-xl font-mono-num text-right outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-1 px-3.5 py-2 font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-2xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </section>

      {/* Visualisation Charts for Level 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowBarChart
          income={results.monthlyIncome}
          expenses={results.monthlyExpenses}
          cashFlow={results.monthlyCashFlow}
        />

        <SpendingDonutChart
          expenses={plan.expenses}
          totalExpenses={results.monthlyExpenses}
        />

        <NeedVsWantChart
          needsAmount={results.monthlyNeeds}
          wantsAmount={results.monthlyWants}
          needsPercentage={results.needsPercentage}
          wantsPercentage={results.wantsPercentage}
        />

        <TopExpensesBarChart top5={results.top5Expenses} />
      </div>

      {/* Step Navigation to Layer 2 */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNextLayer}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-stone-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-300/70 rounded-2xl shadow-xs transition-all active:scale-[0.98]"
        >
          <span>Continue to Chapter 02: Emergency Runway</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
