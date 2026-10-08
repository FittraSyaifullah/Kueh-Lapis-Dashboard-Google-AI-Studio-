import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, ArrowRight, Sparkles, CheckCircle2, TrendingUp, Wallet, ArrowDown, Info } from 'lucide-react';
import { CalculatedResults, ExpenseItem, Plan } from '../engine/types.ts';
import { CashFlowBarChart } from './charts/CashFlowBarChart.tsx';
import { SpendingDonutChart } from './charts/SpendingDonutChart.tsx';
import { NeedVsWantChart } from './charts/NeedVsWantChart.tsx';
import { TopExpensesBarChart } from './charts/TopExpensesBarChart.tsx';
import { CashFlowSankeyChart } from './charts/CashFlowSankeyChart.tsx';

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

  const handleIncomeFieldChange = (field: 'takeHomePay' | 'investmentIncome' | 'rentalIncome' | 'otherInflow' | 'otherIncome' | 'yearlyBonus', val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      income: {
        ...plan.income,
        [field]: cleanNum,
      },
    });
  };

  const handleTargetSavingsRateChange = (rateDecimal: number) => {
    onUpdatePlan({
      targetSavingsRate: rateDecimal,
    });
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Total */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1">Monthly Net Inflow</div>
          <div className="text-2xl sm:text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.monthlyIncome).toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 font-light">
            Take-home + Investment + Rental
          </p>
        </div>

        {/* Expenses Total */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1">Monthly Living Outflow</div>
          <div className="text-2xl sm:text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.monthlyExpenses).toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 font-light">
            Needs: ${Math.round(results.monthlyNeeds).toLocaleString()} · Wants: ${Math.round(results.monthlyWants).toLocaleString()}
          </p>
        </div>

        {/* Monthly Cash Flow / Surplus */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1">Net Cash Surplus</div>
          <div
            className={`text-2xl sm:text-3xl font-normal font-mono-num ${
              results.monthlyCashFlow >= 0 ? 'text-emerald-800' : 'text-rose-800'
            }`}
          >
            {results.monthlyCashFlow >= 0 ? '+' : '-'}${Math.round(Math.abs(results.monthlyCashFlow)).toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-600 mt-1.5 font-light">
            {results.monthlyCashFlow >= 0
              ? `${(results.savingsRate * 100).toFixed(1)}% savings rate`
              : 'Deficit (Spending exceeds income)'}
          </p>
        </div>

        {/* Uncommitted Spare Cash */}
        <div className={`rounded-2xl p-5 border shadow-xs ${
          results.spareCashMonthly > 0
            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
            : results.spareCashMonthly === 0
            ? 'bg-amber-50/40 border-amber-200/80 text-stone-900'
            : 'bg-rose-50/50 border-rose-200/80 text-rose-950'
        }`}>
          <div className="text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Uncommitted Spare Cash</span>
            <span className="text-[10px] font-mono-num uppercase px-1.5 py-0.5 rounded-full bg-white/80 border border-current">
              {results.spareCashMonthly > 0 ? 'Surplus' : results.spareCashMonthly === 0 ? 'Balanced' : 'Deficit'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-normal font-mono-num font-bold">
            {results.spareCashMonthly >= 0 ? '+' : '-'}${Math.round(Math.abs(results.spareCashMonthly)).toLocaleString()}
          </div>
          <p className="text-[11px] opacity-80 mt-1.5 font-light">
            Left after living expenses & ${Math.round(results.totalMonthlyContribution).toLocaleString()} saved
          </p>
        </div>
      </div>

      {/* Savings Rate Target & Adjustment Control (Editable by Advisor & Client) */}
      <section className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-100">
          <div>
            <div className="text-xs text-stone-500 font-medium">AAG Wealth Advisory Feature</div>
            <h3 className="text-lg font-bold text-stone-900 font-display">
              Savings Rate & Target Wealth Allocation
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Current Actual:</span>
            <span className="text-sm font-bold font-mono-num px-2.5 py-1 rounded-lg bg-stone-100 text-stone-900">
              {(results.savingsRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-800">
              <span>Target Savings Rate</span>
              <span className="font-mono-num text-amber-900 font-bold text-base">
                {((plan.targetSavingsRate ?? 0.20) * 100).toFixed(0)}%
                <span className="text-xs font-normal text-stone-500 ml-1">
                  (${Math.round(results.monthlyIncome * (plan.targetSavingsRate ?? 0.20)).toLocaleString()} / mo)
                </span>
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={plan.targetSavingsRate ?? 0.20}
              onChange={(e) => handleTargetSavingsRateChange(parseFloat(e.target.value))}
              className="w-full accent-amber-800 cursor-pointer h-2.5 bg-stone-200 rounded-lg"
            />
            
            {/* Quick-Select Buttons for Savings Rate */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50].map((rate) => {
                const isSelected = Math.abs((plan.targetSavingsRate ?? 0.20) - rate) < 0.01;
                return (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleTargetSavingsRateChange(rate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {(rate * 100).toFixed(0)}%
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs text-stone-700 space-y-2 font-light">
            <div className="flex justify-between">
              <span className="font-medium text-stone-900">Monthly Net Inflow:</span>
              <span className="font-mono-num font-semibold">${Math.round(results.monthlyIncome).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-stone-900">Target Monthly Accumulation:</span>
              <span className="font-mono-num font-semibold text-amber-900">
                ${Math.round(results.monthlyIncome * (plan.targetSavingsRate ?? 0.20)).toLocaleString()} / mo
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-200">
              <span className="font-medium text-stone-900">Permitted Spending Ceiling:</span>
              <span className="font-mono-num font-semibold text-emerald-800">
                ${Math.round(results.monthlyIncome * (1 - (plan.targetSavingsRate ?? 0.20))).toLocaleString()} / mo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* AAG Spare Cash Master Waterfall (High Clarity Reconciliation) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span>AAG Financial Clarity</span>
            </div>
            <h3 className="text-xl font-bold text-stone-950 font-display mt-0.5">
              Spare Cash Reconciliation Waterfall
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Uncommitted Monthly Surplus</span>
            <div className={`text-2xl font-bold font-mono-num ${
              results.spareCashMonthly > 0 ? 'text-emerald-800' : results.spareCashMonthly === 0 ? 'text-stone-900' : 'text-rose-800'
            }`}>
              {results.spareCashMonthly >= 0 ? '+' : '-'}${Math.round(Math.abs(results.spareCashMonthly)).toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4-Step Flow Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono-num text-xs">
          {/* Step 1: Net Inflow */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
            <span className="text-[10px] uppercase font-sans font-semibold text-stone-500 block">1. Total Inflow</span>
            <div className="text-lg font-bold text-stone-950">${Math.round(results.monthlyIncome).toLocaleString()}</div>
            <p className="text-[10px] text-stone-500 font-sans font-light">
              Take-Home (${Math.round(plan.income.takeHomePay || 0).toLocaleString()}) + Investments (${Math.round(plan.income.investmentIncome || 0).toLocaleString()})
            </p>
          </div>

          {/* Step 2: Living Expenses */}
          <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200/60 space-y-1">
            <span className="text-[10px] uppercase font-sans font-semibold text-rose-800 block">2. Living Outflows</span>
            <div className="text-lg font-bold text-rose-900">-${Math.round(results.monthlyExpenses).toLocaleString()}</div>
            <p className="text-[10px] text-rose-700/80 font-sans font-light">
              Needs (${Math.round(results.monthlyNeeds).toLocaleString()}) + Wants (${Math.round(results.monthlyWants).toLocaleString()})
            </p>
          </div>

          {/* Step 3: Scheduled Wealth Flow */}
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-1">
            <span className="text-[10px] uppercase font-sans font-semibold text-amber-900 block">3. Wealth Accumulation</span>
            <div className="text-lg font-bold text-amber-950">-${Math.round(results.totalMonthlyContribution).toLocaleString()}</div>
            <p className="text-[10px] text-amber-800/80 font-sans font-light">
              Scheduled savings & AAG policies
            </p>
          </div>

          {/* Step 4: Spare Cash */}
          <div className={`p-3.5 rounded-2xl border space-y-1 ${
            results.spareCashMonthly > 0
              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
              : results.spareCashMonthly === 0
              ? 'bg-amber-100/70 border-amber-300 text-stone-950'
              : 'bg-rose-100/70 border-rose-300 text-rose-950'
          }`}>
            <span className="text-[10px] uppercase font-sans font-bold block">4. Spare Cash Left</span>
            <div className="text-lg font-bold">
              {results.spareCashMonthly >= 0 ? '+' : '-'}${Math.round(Math.abs(results.spareCashMonthly)).toLocaleString()}
            </div>
            <p className="text-[10px] font-sans font-light">
              {results.spareCashMonthly > 0 ? 'Surplus ready for enjoyment or investing' : results.spareCashMonthly === 0 ? 'Balanced budget' : 'Deficit'}
            </p>
          </div>
        </div>
      </section>

      {/* Step 1: Income Inputs & Filing (Fine Parchment Gold - SW-9) */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Part 1: Inflow Filing
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Inflow Filing & Pay Breakdown
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-light">
            Total Inflow: <strong className="font-mono-num font-bold text-stone-950">${Math.round(results.monthlyIncome).toLocaleString()}/mo</strong>
          </span>
        </div>

        {/* AI & Statutory CPF Auto-Populate Assistant Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
              <span className="text-xs font-bold text-amber-950">
                AI & Statutory CPF Assistant: Auto-Populate from Gross Salary & Age
              </span>
            </div>
            <span className="text-[11px] text-stone-600 font-medium">
              Client Age: <strong className="font-mono-num text-stone-900">{plan.profile.age || 44}</strong> · Ordinary Ceiling: $8,000/mo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Gross Monthly Salary (SGD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={plan.income.grossSalary ? plan.income.grossSalary.toLocaleString() : ''}
                  onChange={(e) => {
                    const cleanNum = Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0);
                    onUpdatePlan({
                      income: {
                        ...plan.income,
                        grossSalary: cleanNum,
                      },
                    });
                  }}
                  placeholder="7,500"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono-num font-bold text-stone-900 outline-none focus:border-amber-700"
                />
              </div>
            </div>

            {/* Live Statutory Split Preview */}
            <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/80 text-[11px] font-mono-num space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-600 font-sans">Employee CPF ({(results.cpfCalculations ? (results.cpfCalculations.ageBand.employee_rate * 100).toFixed(0) : 20)}%):</span>
                <span className="font-bold text-rose-800">
                  -${results.cpfCalculations ? results.cpfCalculations.employeeCpfMonthly.toLocaleString() : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 font-sans">Net Take-Home Salary:</span>
                <span className="font-bold text-emerald-900">
                  ${results.cpfCalculations ? results.cpfCalculations.netSalaryMonthly.toLocaleString() : 0}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 pt-0.5 border-t border-stone-100">
                <span>OA: ${results.cpfCalculations ? results.cpfCalculations.oaMonthly.toLocaleString() : 0}</span>
                <span>SA: ${results.cpfCalculations ? results.cpfCalculations.saMonthly.toLocaleString() : 0}</span>
                <span>MA: ${results.cpfCalculations ? results.cpfCalculations.maMonthly.toLocaleString() : 0}</span>
              </div>
            </div>

            {/* 1-Click Auto-Populate Button */}
            <button
              type="button"
              onClick={() => {
                if (results.cpfCalculations) {
                  onUpdatePlan({
                    income: {
                      ...plan.income,
                      takeHomePay: results.cpfCalculations.netSalaryMonthly,
                      autoCpfToTakeHome: true,
                    },
                  });
                }
              }}
              className="w-full py-2.5 px-4 bg-amber-200/90 hover:bg-amber-300 border border-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Auto-Populate Take-Home (${results.cpfCalculations ? results.cpfCalculations.netSalaryMonthly.toLocaleString() : 0})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Take-Home Pay */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              1. Take-Home Cash Salary (SGD/mo)
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
              Cash salary received into bank after employee CPF
            </span>
          </div>

          {/* 2. Investment Income */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              2. Investment Income & Dividends (SGD/mo)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-light text-sm font-mono-num">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.investmentIncome ? plan.income.investmentIncome.toLocaleString() : ''}
                onChange={(e) => handleIncomeFieldChange('investmentIncome', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 font-medium text-base focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Stock dividends, bond coupons, ETF & REIT payouts
            </span>
          </div>

          {/* 3. Rental Income */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              3. Rental Property Inflow (SGD/mo)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-light text-sm font-mono-num">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.rentalIncome ? plan.income.rentalIncome.toLocaleString() : ''}
                onChange={(e) => handleIncomeFieldChange('rentalIncome', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 font-medium text-base focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Net rental cash collected after mortgage & condo fees
            </span>
          </div>

          {/* 4. Side-Gig / Business / Other Inflow */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              4. Side-Hustle / Business (SGD/mo)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-light text-sm font-mono-num">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.otherInflow ? plan.income.otherInflow.toLocaleString() : ''}
                onChange={(e) => handleIncomeFieldChange('otherInflow', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 font-medium text-base focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              Consulting, freelance, or secondary enterprise
            </span>
          </div>

          {/* 5. Annual Bonus / Variable Bonus */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              5. Annual Bonus / 13th Month (SGD/yr)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-light text-sm font-mono-num">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.income.yearlyBonus ? plan.income.yearlyBonus.toLocaleString() : ''}
                onChange={(e) => handleIncomeFieldChange('yearlyBonus', e.target.value)}
                placeholder="7,500"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#dac8a0] rounded-xl font-mono-num text-stone-950 font-medium text-base focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">
              {plan.income.yearlyBonus ? `Averages ~$${Math.round(plan.income.yearlyBonus / 12).toLocaleString()}/month equivalent` : 'Annual incentive pay'}
            </span>
          </div>

          {/* Gross Salary Quick Link */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-950 block">Gross Salary & CPF Link</span>
              <p className="text-[11px] text-amber-800 mt-0.5 font-light">
                {plan.income.grossSalary
                  ? `Recorded Gross: $${plan.income.grossSalary.toLocaleString()}/mo`
                  : 'Enter gross salary to auto-compute statutory CPF.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNextLayer}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 mt-2 text-left"
            >
              <span>Inspect Chapter 03 CPF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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

      {/* Cash Flow Stream Visualisation */}
      <CashFlowSankeyChart
        income={plan.income.takeHomePay || 0}
        otherIncome={plan.income.otherIncome || 0}
        needs={results.monthlyNeeds}
        wants={results.monthlyWants}
        cashFlow={results.monthlyCashFlow}
      />

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
