import React, { useState } from 'react';
import { HelpCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { CalculatedResults, Plan, SavingsBuckets } from '../engine/types.ts';
import { SavingsMixDonutChart } from './charts/SavingsMixDonutChart.tsx';

interface Props {
  plan: Plan;
  results: CalculatedResults;
  onUpdatePlan: (updated: Partial<Plan>) => void;
  onNextLayer: () => void;
}

export const Layer2Runway: React.FC<Props> = ({
  plan,
  results,
  onUpdatePlan,
  onNextLayer,
}) => {
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);

  const handleBucketChange = (key: keyof SavingsBuckets, val: string) => {
    const cleanNum = Math.max(0, Number(val.replace(/[^0-9.]/g, '')) || 0);
    onUpdatePlan({
      savings: {
        ...plan.savings,
        [key]: cleanNum,
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

  return (
    <div className="space-y-8">
      {/* Editorial Chapter Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
          <div className="text-xs text-stone-500 font-medium">
            Chapter 02 <span className="text-stone-300">/</span> Liquidity <span className="text-stone-300">·</span> Workshop Level 1
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
          How many months can I survive without a salary?
        </h2>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
          An emergency buffer prevents forced liquidation of investments at fire-sale prices or accumulating high-interest debt when sudden life changes arrive.
        </p>

        {showWhyWeAsk && (
          <div className="mt-5 p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-700 leading-relaxed font-light">
            <span className="font-semibold text-stone-900 font-sans">The Core Principle: </span>
            Life brings sudden shifts: career transitions, health leaves, or household obligations. Liquid savings determine your runway—how many months you can continue paying rent, utilities, and grocery bills without distress.
          </div>
        )}
      </section>

      {/* Calculated Highlight Figures (White calculated cells - SW-9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Total Stored Assets</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            ${Math.round(results.totalSavings).toLocaleString()}
          </div>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Cumulative sum of cash, endowments, bonds, and equities
          </p>
        </div>

        {/* Cash Emergency Runway */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Pure Cash Runway</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num flex items-baseline gap-1.5">
            <span>{results.cashRunwayMonths >= 90 ? '90+' : results.cashRunwayMonths.toFixed(1)}</span>
            <span className="text-sm font-normal text-stone-500">months</span>
          </div>
          <p className="text-xs text-amber-900 mt-2 font-light">
            {results.cashRunwayBand.status}
          </p>
        </div>

        {/* Total Liquid Runway */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Total Portfolio Runway</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num flex items-baseline gap-1.5">
            <span>{results.totalRunwayMonths >= 90 ? '90+' : results.totalRunwayMonths.toFixed(1)}</span>
            <span className="text-sm font-normal text-stone-500">months</span>
          </div>
          <p className="text-xs text-stone-600 mt-2 font-light">
            {results.totalRunwayBand.status}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <div className="text-xs text-stone-500 font-medium mb-1.5">Current Savings Rate</div>
          <div className="text-3xl font-normal text-stone-950 font-mono-num">
            {(results.savingsRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-stone-600 mt-2 font-light">
            Benchmark: 20%+ of take-home pay
          </p>
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

      {/* Savings Buckets Inputs (Parchment gold cells - SW-9) */}
      <section className="bg-[#fffdf7] rounded-3xl p-6 sm:p-8 border border-[#e8dfc8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-[#ebd7b2]/60">
          <div>
            <div className="text-xs text-stone-500 font-medium mb-1">
              Ledger Input <span className="text-stone-300">/</span> Asset Allocation
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-stone-950 font-display">
              Stored Savings & Investment Buckets
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-light italic">
            Enter current estimated valuations (blank = 0)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cash Bucket */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              1. Liquid Bank Cash & Deposits (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.savings.cash ? plan.savings.cash.toLocaleString() : ''}
                onChange={(e) => handleBucketChange('cash', e.target.value)}
                placeholder="8,125"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">Checking & high-yield savings accounts</span>
          </div>

          {/* Endowment Bucket */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              2. Endowment & Guaranteed Plans (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.savings.endowment ? plan.savings.endowment.toLocaleString() : ''}
                onChange={(e) => handleBucketChange('endowment', e.target.value)}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">Surrender value or capital committed</span>
          </div>

          {/* Bonds Bucket */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              3. Singapore Savings Bonds / Fixed Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.savings.bonds ? plan.savings.bonds.toLocaleString() : ''}
                onChange={(e) => handleBucketChange('bonds', e.target.value)}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">SSB, T-bills, bond index funds</span>
          </div>

          {/* Equities Bucket */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              4. Equities, ETFs & Unit Trusts (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.savings.equities ? plan.savings.equities.toLocaleString() : ''}
                onChange={(e) => handleBucketChange('equities', e.target.value)}
                placeholder="6,000"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block font-light">Robo-advisors, global index, stocks</span>
          </div>

          {/* Other Bucket */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                5. Other Designated Assets:
              </label>
              <input
                type="text"
                value={plan.savings.otherLabel || ''}
                onChange={(e) => handleOtherLabelChange(e.target.value)}
                placeholder="Asset category (e.g. Gold, Private investment)..."
                className="text-xs text-stone-800 font-medium bg-transparent border-b border-stone-300 px-1 outline-none"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={plan.savings.other ? plan.savings.other.toLocaleString() : ''}
                onChange={(e) => handleBucketChange('other', e.target.value)}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-[#dac8a0] rounded-xl font-mono-num font-medium text-stone-950 focus:border-amber-700 outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Asset Allocation Chart */}
      <SavingsMixDonutChart
        bucketShares={results.bucketShares}
        totalSavings={results.totalSavings}
      />

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
          <span>Continue to Chapter 03: CPF Foundation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
