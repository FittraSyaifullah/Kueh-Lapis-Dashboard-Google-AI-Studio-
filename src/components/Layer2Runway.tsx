import React, { useState } from 'react';
import { HelpCircle, ArrowRight, ShieldCheck, Repeat, Sparkles, CheckCircle2, AlertTriangle, Plus, Trash2, TrendingUp, Clock, Briefcase } from 'lucide-react';
import { CalculatedResults, InvestmentPolicy, InvestmentPolicyType, Plan, SavingsBucketKey } from '../engine/types.ts';
import { SavingsMixDonutChart } from './charts/SavingsMixDonutChart.tsx';
import { SAMPLE_AAG_POLICIES } from '../engine/defaultData.ts';

interface Props {
  plan: Plan;
  results: CalculatedResults;
  onUpdatePlan: (updated: Partial<Plan>) => void;
  onNextLayer: () => void;
}

interface BucketConfig {
  key: SavingsBucketKey;
  num: number;
  label: string;
  sublabel: string;
  rateHint: string;
  role: string;
  dotColor: string;
  placeholderValue: string;
  placeholderMonthly: string;
}

const BUCKET_CONFIGS: BucketConfig[] = [
  {
    key: 'cash',
    num: 1,
    label: '1. Liquid Bank Cash & High-Yield Deposits',
    sublabel: 'Emergency buffer, checking, UOB One, OCBC 360, DBS Multiplier',
    rateHint: '1.5% - 3.5%',
    role: 'Immediate Liquidity & Emergency Buffer',
    dotColor: '#10b981',
    placeholderValue: '8,125',
    placeholderMonthly: '450',
  },
  {
    key: 'endowment',
    num: 2,
    label: '2. Endowment & Guaranteed Policies',
    sublabel: 'Surrender values, capital-guaranteed maturity insurance plans',
    rateHint: '2.8% - 3.5%',
    role: 'Capital Preservation & Guaranteed Payouts',
    dotColor: '#f59e0b',
    placeholderValue: '0',
    placeholderMonthly: '0',
  },
  {
    key: 'bonds',
    num: 3,
    label: '3. Singapore Savings Bonds / Fixed Income',
    sublabel: 'SSB, 6-month MAS T-bills, Singapore Government Securities',
    rateHint: '3.0% - 3.4%',
    role: 'Safe Sovereign Yield & Inflation Hedge',
    dotColor: '#3b82f6',
    placeholderValue: '0',
    placeholderMonthly: '0',
  },
  {
    key: 'equities',
    num: 4,
    label: '4. Equities, Global ETFs & Unit Trusts',
    sublabel: 'Global all-world index (VWRA), S&P 500, Robo-advisors, stocks',
    rateHint: '6.5% - 8.0%',
    role: 'Inflation-Beating Long-Term Compounding',
    dotColor: '#8b5cf6',
    placeholderValue: '6,000',
    placeholderMonthly: '500',
  },
  {
    key: 'other',
    num: 5,
    label: '5. Other Designated Investments',
    sublabel: 'Physical gold, REITs, private businesses, or alternative assets',
    rateHint: 'Variable',
    role: 'Alternative Asset Diversification',
    dotColor: '#ec4899',
    placeholderValue: '0',
    placeholderMonthly: '0',
  },
];

export const Layer2Runway: React.FC<Props> = ({
  plan,
  results,
  onUpdatePlan,
  onNextLayer,
}) => {
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);

  const handleBucketChange = (key: SavingsBucketKey, val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      savings: {
        ...plan.savings,
        [key]: cleanNum,
      },
    });
  };

  const handleContributionChange = (key: SavingsBucketKey, val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      savings: {
        ...plan.savings,
        monthlyContributions: {
          ...(plan.savings?.monthlyContributions || {}),
          [key]: cleanNum,
        },
      },
    });
  };

  const handleOtherLabelChange = (val: string) => {
    onUpdatePlan({
      savings: {
        ...plan.savings,
        otherLabel: val,
      },
    });
  };

  // 1-Click quick helper to align surplus to savings & investments
  const handleAutoDeploySurplus = () => {
    if (results.monthlyCashFlow <= 0) return;
    const half = Math.round(results.monthlyCashFlow / 2);
    const remaining = results.monthlyCashFlow - half;
    onUpdatePlan({
      savings: {
        ...plan.savings,
        monthlyContributions: {
          ...(plan.savings?.monthlyContributions || {}),
          cash: half,
          equities: remaining,
        },
      },
    });
  };

  const handleLoadSamplePolicies = () => {
    onUpdatePlan({
      investmentPolicies: SAMPLE_AAG_POLICIES,
    });
  };

  const handleAddPolicy = () => {
    const currentAge = plan.profile.age || 44;
    const retAge = plan.profile.retirementAge || 60;
    const newPolicy: InvestmentPolicy = {
      id: `pol_${Date.now()}`,
      name: 'AAG Wealth Accumulator Plan',
      policyType: 'ilp',
      currentValuation: 10000,
      monthlyContribution: 300,
      expectedReturnRate: 0.065,
      startAge: currentAge,
      targetAge: retAge,
    };
    onUpdatePlan({
      investmentPolicies: [...(plan.investmentPolicies || []), newPolicy],
    });
  };

  const handleAddPresetPolicy = (
    name: string,
    policyType: InvestmentPolicyType,
    currentValuation: number,
    monthlyContribution: number,
    expectedReturnRate: number
  ) => {
    const currentAge = plan.profile.age || 44;
    const retAge = plan.profile.retirementAge || 60;
    const newPolicy: InvestmentPolicy = {
      id: `pol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      policyType,
      currentValuation,
      monthlyContribution,
      expectedReturnRate,
      startAge: currentAge,
      targetAge: retAge,
    };
    onUpdatePlan({
      investmentPolicies: [...(plan.investmentPolicies || []), newPolicy],
    });
  };

  const handleUpdatePolicy = (id: string, updates: Partial<InvestmentPolicy>) => {
    const updated = (plan.investmentPolicies || []).map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    onUpdatePlan({ investmentPolicies: updated });
  };

  const handleDeletePolicy = (id: string) => {
    const updated = (plan.investmentPolicies || []).filter((p) => p.id !== id);
    onUpdatePlan({ investmentPolicies: updated });
  };

  const surplusDiff = results.monthlyCashFlow - results.totalMonthlyContribution;
  const isSurplusExceeded = results.totalMonthlyContribution > results.monthlyCashFlow && results.monthlyCashFlow > 0;
  const isFullyMatched = Math.abs(surplusDiff) < 1 && results.monthlyCashFlow > 0;

  const currentAge = plan.profile.age || 44;
  const retirementAge = plan.profile.retirementAge || 60;
  const wealthRunwayYears = results.wealthRunwayYears || Math.max(0, retirementAge - currentAge);

  return (
    <div className="space-y-8">
      {/* Editorial Chapter Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
          <div className="text-xs text-stone-500 font-medium">
            Chapter 02 <span className="text-stone-300">/</span> Liquidity & Assets <span className="text-stone-300">·</span> Workshop Level 1
          </div>
          <button
            type="button"
            onClick={() => setShowWhyWeAsk(!showWhyWeAsk)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Why we ask this</span>
          </button>
        </div>

        <h2 className="text-3xl sm:text-4xl font-normal text-stone-950 font-display tracking-tight leading-tight">
          How many months can I survive without a salary?
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
          An emergency buffer prevents forced liquidation of investments at fire-sale prices or accumulating high-interest debt when sudden life changes arrive. Track current stored reserves and ongoing monthly contributions.
        </p>

        {showWhyWeAsk && (
          <div className="mt-5 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-700 leading-relaxed font-light">
            <span className="font-semibold text-stone-900 font-sans">The Core Principle: </span>
            Life brings sudden shifts: career transitions, health leaves, or household obligations. Liquid savings determine your runway—how many months you can continue paying rent, utilities, and grocery bills without distress. Ongoing monthly contributions ensure your wealth compounds systematically over time.
          </div>
        )}
      </section>

      {/* Calculated Highlight Figures: Dual Runway & Asset Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Wealth Accumulation Runway (AAG Horizon) */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-700/5 rounded-2xl p-5 border border-amber-300/80 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="text-xs text-amber-950 font-semibold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-800" />
              <span>Wealth Runway</span>
            </span>
            <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-1.5 py-0.5 rounded">
              AAG Horizon
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-normal text-amber-950 font-mono-num font-bold flex items-baseline gap-1.5">
            <span>{wealthRunwayYears}</span>
            <span className="text-xs font-normal text-stone-600">years left</span>
          </div>
          <p className="text-[11px] text-amber-900 mt-1.5 font-light">
            Age {currentAge} → Target Age {retirementAge} to build wealth
          </p>
        </div>

        {/* Total Savings */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1">Total Stored Assets</div>
          <div className="text-2xl sm:text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.totalSavings).toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 font-light">
            Cash, endowments, bonds, equities & policies
          </p>
        </div>

        {/* Monthly Wealth Flow */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1 flex items-center justify-between">
            <span>Monthly Contribution</span>
            <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-sans font-medium">Active Flow</span>
          </div>
          <div className="text-2xl sm:text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.totalMonthlyContribution).toLocaleString()}
            <span className="text-xs font-normal text-stone-500 ml-1">/mo</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 font-light">
            ${Math.round(results.totalMonthlyContribution * 12).toLocaleString()}/yr deployed into wealth
          </p>
        </div>

        {/* Cash Emergency Runway */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1">Pure Cash Runway</div>
          <div className="text-2xl sm:text-3xl font-normal text-stone-950 font-mono-num flex items-baseline gap-1.5">
            <span>{results.cashRunwayMonths >= 90 ? '90+' : results.cashRunwayMonths.toFixed(1)}</span>
            <span className="text-xs font-normal text-stone-500">months</span>
          </div>
          <p className="text-[11px] text-amber-900 mt-1.5 font-light">
            {results.cashRunwayBand.status} (Cash buffer)
          </p>
        </div>

        {/* Uncommitted Spare Cash */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1">Spare Cash Remaining</div>
          <div className={`text-2xl sm:text-3xl font-normal font-mono-num font-bold ${
            results.spareCashMonthly >= 0 ? 'text-emerald-800' : 'text-rose-800'
          }`}>
            {results.spareCashMonthly >= 0 ? '+' : '-'}${Math.round(Math.abs(results.spareCashMonthly)).toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-600 mt-1.5 font-light">
            Surplus after living & scheduled wealth flows
          </p>
        </div>
      </div>

      {/* Wealth Accumulation Runway Clarifier Card */}
      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <Clock className="w-4 h-4 text-amber-800" />
          <span>The AAG Runway Principle: Understanding Your Wealth Horizon</span>
        </div>
        <p className="text-stone-700 font-light leading-relaxed">
          In financial planning, <strong>Runway</strong> has two critical dimensions:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60">
            <span className="font-semibold text-stone-900 block mb-0.5">1. Emergency Cash Runway</span>
            <p className="text-[11px] text-stone-600 font-light">
              How many months you can pay all bills if work stops tomorrow (Currently <strong className="font-mono-num">{results.cashRunwayMonths.toFixed(1)} months</strong> in liquid bank cash).
            </p>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60">
            <span className="font-semibold text-stone-900 block mb-0.5">2. Wealth Accumulation Runway</span>
            <p className="text-[11px] text-stone-600 font-light">
              How many years you have left to build and compound your wealth. At age <strong className="font-mono-num">{currentAge}</strong> aiming to retire at <strong className="font-mono-num">{retirementAge}</strong>, you have exactly <strong className="font-mono-num text-amber-900 font-bold">{wealthRunwayYears} compounding years</strong> remaining.
            </p>
          </div>
        </div>
      </div>

      {/* Runway Assessment Observation (SW-45) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs text-xs text-stone-700 leading-relaxed space-y-3">
        <div className="flex items-center gap-2 font-medium text-stone-900">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span className="font-serif italic text-sm">Emergency Runway Diagnostics</span>
        </div>
        <p className="font-light">{results.cashRunwayBand.explanation}</p>

        {/* Crisis Stress-Test: Needs Only */}
        {results.monthlyNeeds > 0 && results.monthlyWants > 0 && (
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-800">
            <div>
              <strong className="font-medium text-stone-950">Crisis Stress-Test (Pausing All Discretionary Wants):</strong>
              <p className="font-light text-stone-600 mt-0.5">
                If you pause all non-essential "Wants" ($
                {Math.round(results.monthlyWants).toLocaleString()}
                /mo), your liquid cash runway extends from{' '}
                <span className="font-mono-num font-semibold">
                  {results.cashRunwayMonths.toFixed(1)} months
                </span>{' '}
                to{' '}
                <span className="font-mono-num font-semibold text-emerald-800">
                  {((plan.savings.cash || 0) / results.monthlyNeeds).toFixed(1)} months
                </span>
                .
              </p>
            </div>
            <div className="shrink-0 font-mono-num text-xs bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200/60 font-medium">
              +{Math.max(0, (plan.savings.cash || 0) / results.monthlyNeeds - results.cashRunwayMonths).toFixed(1)} mo extra cushion
            </div>
          </div>
        )}

        {results.cashRunwayMonths < 3 && (
          <p className="pt-2 border-t border-stone-100 font-medium text-amber-900">
            Suggested Action: Channel your current monthly cash surplus directly into a high-interest liquid savings account until you hold at least 3 months of essential living expenses ($
            {Math.round(results.monthlyExpenses * 3).toLocaleString()}).
          </p>
        )}
      </div>

      {/* Savings & Investments Ledger with Dedicated Monthly Contribution Column */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Asset Allocation & Scheduled Inflows
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Stored Savings & Investment Buckets
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Enter current stored balances and scheduled monthly contributions
          </span>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#ebd7b2] text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 pr-4">Asset Bucket & Description</th>
                <th className="py-3 px-3 w-40 sm:w-44">
                  <div className="flex items-center gap-1">
                    <span>Stored Balance (SGD)</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-amber-200/80 text-amber-950 font-bold">
                      AAG
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3 w-44 sm:w-48 bg-amber-50/70 text-amber-950 font-bold border-x border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <span>Monthly Flow (SGD/mo)</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-amber-200 text-amber-950 font-bold">
                      Active
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3 text-right w-32 hidden md:table-cell">Annualized Flow</th>
                <th className="py-3 pl-4 text-right hidden lg:table-cell">Strategic Role & Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebd7b2]/50 font-sans">
              {BUCKET_CONFIGS.map((cfg) => {
                const currentVal = plan.savings[cfg.key] || 0;
                const monthlyVal = plan.savings.monthlyContributions?.[cfg.key] || 0;
                const annualVal = monthlyVal * 12;

                return (
                  <tr key={cfg.key} className="hover:bg-amber-50/30 transition-colors">
                    {/* Bucket Info */}
                    <td className="py-3.5 pr-4 align-top">
                      <div className="flex items-start gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                          style={{ backgroundColor: cfg.dotColor }}
                        />
                        <div>
                          {cfg.key === 'other' ? (
                            <div className="flex flex-wrap items-center gap-1.5 font-semibold text-stone-900 text-xs">
                              <span>5. Other Assets:</span>
                              <input
                                type="text"
                                value={plan.savings.otherLabel || ''}
                                onChange={(e) => handleOtherLabelChange(e.target.value)}
                                placeholder="e.g. Gold, Private Equity..."
                                className="text-xs text-amber-900 font-medium bg-white/70 border-b border-amber-300 px-1 py-0.5 outline-none rounded"
                              />
                            </div>
                          ) : (
                            <div className="font-semibold text-stone-900 text-xs">
                              {cfg.label}
                            </div>
                          )}
                          <p className="text-[11px] text-stone-500 font-light mt-0.5">
                            {cfg.sublabel}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Current Balance Input */}
                    <td className="py-3.5 px-3 align-top font-mono-num">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={currentVal > 0 ? currentVal.toLocaleString() : ''}
                          onChange={(e) => handleBucketChange(cfg.key, e.target.value)}
                          placeholder={cfg.placeholderValue}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs sm:text-sm bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block font-sans">
                        Current valuation
                      </span>
                    </td>

                    {/* Monthly Contribution Input (THE REQUESTED COLUMN) */}
                    <td className="py-3.5 px-3 align-top font-mono-num bg-amber-50/40 border-x border-amber-200/40">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-700 text-xs font-semibold">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={monthlyVal > 0 ? monthlyVal.toLocaleString() : ''}
                          onChange={(e) => handleContributionChange(cfg.key, e.target.value)}
                          placeholder={cfg.placeholderMonthly}
                          className="w-full pl-6 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-amber-300 rounded-xl font-mono-num font-semibold text-amber-950 focus:border-amber-800 outline-none shadow-2xs transition-all"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-sans text-stone-400 pointer-events-none">
                          /mo
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-900/80 mt-0.5 block font-sans">
                        Scheduled monthly flow
                      </span>
                    </td>

                    {/* Annual Flow Preview */}
                    <td className="py-3.5 px-3 align-top text-right font-mono-num hidden md:table-cell">
                      <span className="text-xs font-medium text-stone-800">
                        {annualVal > 0 ? `$${annualVal.toLocaleString()}` : '—'}
                      </span>
                      {annualVal > 0 && (
                        <span className="text-[10px] text-stone-400 block font-sans">
                          per year
                        </span>
                      )}
                    </td>

                    {/* Strategic Role */}
                    <td className="py-3.5 pl-4 align-top text-right hidden lg:table-cell">
                      <span className="text-xs font-medium text-stone-700 block">
                        {cfg.role}
                      </span>
                      <span className="text-[11px] font-mono-num text-stone-400 block mt-0.5">
                        Est. Yield: {cfg.rateHint}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer Totals */}
            <tfoot>
              <tr className="border-t-2 border-[#ebd7b2] font-mono-num font-semibold text-stone-950 bg-amber-100/40">
                <td className="py-3 pr-4 font-sans text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>Portfolio Totals</span>
                    <span className="text-[10px] font-sans text-stone-500 font-normal">
                      (Assets & Monthly Inflows)
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-xs sm:text-sm text-stone-950">
                  ${Math.round(results.totalSavings).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-xs sm:text-sm text-amber-950 bg-amber-200/40 border-x border-amber-300/60 font-bold">
                  ${Math.round(results.totalMonthlyContribution).toLocaleString()}
                  <span className="text-[11px] font-normal text-amber-800 ml-1">/mo</span>
                </td>
                <td className="py-3 px-3 text-right text-xs text-stone-900 hidden md:table-cell">
                  ${Math.round(results.totalMonthlyContribution * 12).toLocaleString()}
                  <span className="text-[10px] font-normal text-stone-500 ml-0.5">/yr</span>
                </td>
                <td className="py-3 pl-4 text-right font-sans text-[11px] text-stone-500 font-normal hidden lg:table-cell">
                  Compounding toward Retirement
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Cash Flow Surplus Reconciliation Banner */}
        <div className="mt-6 pt-4 border-t border-[#ebd7b2]/70 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 font-medium text-stone-900">
              <Repeat className="w-3.5 h-3.5 text-amber-800" />
              <span>Cash Flow Alignment (Chapter 01 ↔ Chapter 02)</span>
            </div>
            <p className="text-stone-600 font-light leading-relaxed">
              Monthly Net Cash Flow Surplus:{' '}
              <strong className="font-mono-num text-stone-900">
                ${Math.round(results.monthlyCashFlow).toLocaleString()}/mo
              </strong>
              {' · '}
              Allocated into Savings & Investments:{' '}
              <strong className="font-mono-num text-amber-900">
                ${Math.round(results.totalMonthlyContribution).toLocaleString()}/mo
              </strong>
              {results.monthlyCashFlow > 0 && (
                <span>
                  {' '}
                  ({Math.round((results.totalMonthlyContribution / results.monthlyCashFlow) * 100)}% deployed)
                </span>
              )}
            </p>

            {isFullyMatched && (
              <p className="text-emerald-800 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% of your monthly cash flow surplus is systematically building emergency cash and wealth.</span>
              </p>
            )}

            {!isFullyMatched && surplusDiff > 0 && (
              <p className="text-stone-600 font-light">
                <span className="text-amber-900 font-medium">Unassigned Surplus:</span> You have{' '}
                <strong className="font-mono-num text-stone-900">+${Math.round(surplusDiff).toLocaleString()}/mo</strong>{' '}
                remaining in unassigned cash flow each month. Consider assigning this to liquid cash buffer or dollar-cost averaging into global equities.
              </p>
            )}

            {isSurplusExceeded && (
              <p className="text-rose-800 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Notice: Your scheduled monthly contributions (${results.totalMonthlyContribution.toLocaleString()}/mo) exceed current net monthly surplus (${results.monthlyCashFlow.toLocaleString()}/mo) by ${Math.round(Math.abs(surplusDiff)).toLocaleString()}/mo. Ensure this is supported by bonuses or adjust expenses.
                </span>
              </p>
            )}
          </div>

          {/* Quick Helper Button */}
          {results.monthlyCashFlow > 0 && !isFullyMatched && (
            <button
              type="button"
              onClick={handleAutoDeploySurplus}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-300/80 rounded-xl shadow-2xs transition-all cursor-pointer self-start md:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>Split Surplus 50/50 (Cash & Equities)</span>
            </button>
          )}
        </div>
      </section>

      {/* AAG Feature: Investment Policies Multi-Start Compounding Engine */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-300/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-100 text-amber-950 font-sans">
                AAG Feature
              </span>
              <span className="text-xs text-stone-500 font-medium">Policy Compounding Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display mt-1">
              Investment Policies & Compounding to Age {retirementAge}
            </h3>
            <p className="text-xs text-stone-600 mt-1 font-light leading-relaxed">
              Treat each investment policy with its own start time and rate of return. Calculate how much each policy will be worth when your client reaches age {retirementAge} ({wealthRunwayYears} years of wealth runway).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(!plan.investmentPolicies || plan.investmentPolicies.length === 0) && (
              <button
                type="button"
                onClick={handleLoadSamplePolicies}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                <span>Load Sample AAG Policies</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAddPolicy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Policy</span>
            </button>
          </div>
        </div>

        {/* 1-Click Fast Presets for AAG Advisors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider mr-1">
            Quick Add Preset:
          </span>
          <button
            type="button"
            onClick={() => handleAddPresetPolicy('AAG Wealth Accumulator', 'ilp', 12000, 350, 0.065)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-medium transition-all cursor-pointer shadow-2xs"
          >
            + AAG Wealth Accumulator (ILP @ 6.5%)
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetPolicy('AAG Global Equity ETF', 'equities', 15000, 450, 0.072)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-medium transition-all cursor-pointer shadow-2xs"
          >
            + AAG Global Equity ETF (@ 7.2%)
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetPolicy('AAG Prime Endowment', 'endowment', 20000, 200, 0.035)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-medium transition-all cursor-pointer shadow-2xs"
          >
            + AAG Prime Endowment (@ 3.5%)
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetPolicy('SSB / MAS T-Bills', 'bonds', 10000, 0, 0.032)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 font-medium transition-all cursor-pointer shadow-2xs"
          >
            + SSB Sovereign Yield (@ 3.2%)
          </button>
        </div>

        {/* Investment Policies Table */}
        {plan.investmentPolicies && plan.investmentPolicies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-3">Policy / Plan Name</th>
                  <th className="py-2.5 px-2.5 w-28">Type</th>
                  <th className="py-2.5 px-2.5 w-32">
                    <div className="flex items-center gap-1">
                      <span>Amount Invested</span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded">AAG</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-2.5 w-32 bg-amber-50/70 text-amber-950 font-bold border-x border-amber-200/50">
                    Monthly Flow ($/mo)
                  </th>
                  <th className="py-2.5 px-2.5 w-24 text-right">Return (% p.a.)</th>
                  <th className="py-2.5 px-2.5 w-24 text-center">Start Age & Duration</th>
                  <th className="py-2.5 px-3 text-right bg-emerald-50/60 text-emerald-950 font-bold">
                    Projected at Age {retirementAge}
                  </th>
                  <th className="py-2.5 pl-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {plan.investmentPolicies.map((pol) => {
                  const compResult = results.investmentPoliciesResults?.find((r) => r.policy.id === pol.id);
                  const polStartAge = pol.startAge ?? currentAge;
                  const polTargetAge = pol.targetAge ?? retirementAge;
                  const yearsRemaining = Math.max(0, polTargetAge - currentAge);

                  return (
                    <tr key={pol.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Name */}
                      <td className="py-3 pr-3">
                        <input
                          type="text"
                          value={pol.name}
                          onChange={(e) => handleUpdatePolicy(pol.id, { name: e.target.value })}
                          className="w-full text-xs font-semibold text-stone-900 bg-transparent border-b border-stone-300 focus:border-amber-700 outline-none px-1 py-0.5"
                          placeholder="e.g. AAG Wealth Accumulator"
                        />
                      </td>

                      {/* Type */}
                      <td className="py-3 px-2.5">
                        <select
                          value={pol.policyType}
                          onChange={(e) => handleUpdatePolicy(pol.id, { policyType: e.target.value as InvestmentPolicyType })}
                          className="w-full text-[11px] bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 outline-none text-stone-700 font-medium"
                        >
                          <option value="ilp">ILP (Wealth)</option>
                          <option value="equities">Equities / ETF</option>
                          <option value="endowment">Endowment</option>
                          <option value="bonds">Bonds / Fixed</option>
                          <option value="annuity">Annuity</option>
                          <option value="other">Other</option>
                        </select>
                      </td>

                      {/* Current Valuation / Amount Invested */}
                      <td className="py-3 px-2.5">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono-num">$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={pol.currentValuation ? pol.currentValuation.toLocaleString() : ''}
                            onChange={(e) => {
                              const num = Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0);
                              handleUpdatePolicy(pol.id, { currentValuation: num });
                            }}
                            placeholder="0"
                            className="w-full pl-6 pr-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono-num text-stone-900 outline-none focus:border-amber-700"
                          />
                        </div>
                      </td>

                      {/* Monthly Contribution */}
                      <td className="py-3 px-2.5 bg-amber-50/40 border-x border-amber-200/40">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600 font-mono-num font-bold">$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={pol.monthlyContribution ? pol.monthlyContribution.toLocaleString() : ''}
                            onChange={(e) => {
                              const num = Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0);
                              handleUpdatePolicy(pol.id, { monthlyContribution: num });
                            }}
                            placeholder="0"
                            className="w-full pl-6 pr-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-mono-num text-amber-950 font-bold outline-none focus:border-amber-700"
                          />
                        </div>
                      </td>

                      {/* Rate of Return */}
                      <td className="py-3 px-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            value={pol.expectedReturnRate ? (pol.expectedReturnRate * 100).toFixed(1) : '5.0'}
                            onChange={(e) => {
                              const num = Math.max(0, parseFloat(e.target.value) || 0) / 100;
                              handleUpdatePolicy(pol.id, { expectedReturnRate: num });
                            }}
                            className="w-14 text-right py-1 px-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono-num text-stone-900 outline-none focus:border-amber-700"
                          />
                          <span className="text-[11px] text-stone-500 font-mono-num">%</span>
                        </div>
                      </td>

                      {/* Start Age */}
                      <td className="py-3 px-2.5 text-center">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="18"
                            max="80"
                            value={polStartAge}
                            onChange={(e) => {
                              const num = parseInt(e.target.value, 10) || currentAge;
                              handleUpdatePolicy(pol.id, { startAge: num });
                            }}
                            className="w-12 text-center py-1 px-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono-num text-stone-900 outline-none"
                          />
                          <span className="text-[9px] text-stone-400 mt-0.5">
                            {yearsRemaining} yrs to {polTargetAge}
                          </span>
                        </div>
                      </td>

                      {/* Projected Value at Age 60 */}
                      <td className="py-3 px-3 text-right bg-emerald-50/40">
                        <span className="font-mono-num font-bold text-sm text-emerald-950 block">
                          ${compResult ? Math.round(compResult.projectedValueAtRetirement).toLocaleString() : '0'}
                        </span>
                        {compResult && compResult.projectedProfit > 0 && (
                          <span className="text-[10px] text-emerald-800 font-mono-num block">
                            +${Math.round(compResult.projectedProfit).toLocaleString()} gain
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-3 pl-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePolicy(pol.id)}
                          className="p-1 text-stone-400 hover:text-rose-700 transition-colors rounded hover:bg-rose-50"
                          title="Remove policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 font-mono-num font-bold bg-amber-50/50 text-stone-950">
                  <td className="py-3 pr-3 font-sans text-xs">
                    Total Investment Policies
                  </td>
                  <td className="py-3 px-2.5 text-[11px] font-sans text-stone-500 font-normal">
                    {plan.investmentPolicies.length} Active {plan.investmentPolicies.length === 1 ? 'Policy' : 'Policies'}
                  </td>
                  <td className="py-3 px-2.5 text-xs text-stone-950">
                    ${Math.round(results.totalInvestmentsValuation).toLocaleString()}
                  </td>
                  <td className="py-3 px-2.5 text-xs text-amber-950 bg-amber-200/40 border-x border-amber-300/60">
                    ${Math.round(results.totalInvestmentsMonthlyContribution).toLocaleString()}/mo
                  </td>
                  <td colSpan={2} className="py-3 px-2.5 text-center font-sans text-[11px] text-stone-500 font-normal">
                    Compounding over {wealthRunwayYears} years
                  </td>
                  <td className="py-3 px-3 text-right text-base text-emerald-950 bg-emerald-100/60 font-bold">
                    ${Math.round(results.totalInvestmentsProjectedAtRetirement).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-500 space-y-3">
            <Briefcase className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs">No specific investment policies recorded yet.</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleLoadSamplePolicies}
                className="px-4 py-2 text-xs font-semibold text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Load Sample AAG Policies (ILP, ETF, Endowment)
              </button>
              <button
                type="button"
                onClick={handleAddPolicy}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                + Add Investment Policy
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Asset Allocation Chart */}
      <SavingsMixDonutChart
        bucketShares={results.bucketShares}
        totalSavings={results.totalSavings}
        totalMonthlyContribution={results.totalMonthlyContribution}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          Return to Top
        </button>

        <button
          type="button"
          onClick={onNextLayer}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-stone-950 bg-amber-200/80 hover:bg-amber-300 border border-amber-300/70 rounded-2xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Continue to Chapter 03: CPF Foundation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
