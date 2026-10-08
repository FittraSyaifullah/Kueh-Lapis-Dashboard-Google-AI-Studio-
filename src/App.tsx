import React, { useState, useEffect, useMemo } from 'react';
import { Plan, CalculatedResults } from './engine/types.ts';
import { BLANK_PLAN, SAMPLE_DEMO_PLAN, loadStoredPlan, saveStoredPlan, clearStoredPlan } from './engine/defaultData.ts';
import { calculatePlan } from './engine/calculations.ts';
import { TopNavBar } from './components/TopNavBar.tsx';
import { KuehLapisVisual } from './components/KuehLapisVisual.tsx';
import { Layer1CashFlow } from './components/Layer1CashFlow.tsx';
import { Layer2Runway } from './components/Layer2Runway.tsx';
import { Layer3CPF } from './components/Layer3CPF.tsx';
import { Layer4Lifestyle } from './components/Layer4Lifestyle.tsx';
import { Layer5RetirementGap } from './components/Layer5RetirementGap.tsx';
import { FacilitatorConsole } from './components/FacilitatorConsole.tsx';
import { ReturnCodeModal } from './components/ReturnCodeModal.tsx';
import { ConsentModal } from './components/ConsentModal.tsx';
import { GlossaryModal } from './components/GlossaryModal.tsx';
import { PrintReport } from './components/PrintReport.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { ShieldCheck, Sparkles, Layers, User, Clock, ArrowRight, Wallet, CheckCircle2, ChevronRight, Cake } from 'lucide-react';

export default function App() {
  // Read initial query params if present
  const queryParams = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search);
    } catch {
      return new URLSearchParams();
    }
  }, []);

  const initialSession = queryParams.get('session') || 'TOA-PAYOH-L1';
  const initialLevelParam = parseInt(queryParams.get('level') || '4', 10);
  const initialDemoParam = queryParams.get('demo') === '1' || queryParams.get('sample') === '1';

  // Application State
  const [unlockedLevel, setUnlockedLevel] = useState<number>(
    isNaN(initialLevelParam) ? 4 : Math.min(4, Math.max(1, initialLevelParam)),
  );
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [isSampleData, setIsSampleData] = useState<boolean>(initialDemoParam);

  // Feature Flags controlled by Facilitator Console
  const [needWantTagging, setNeedWantTagging] = useState<boolean>(true);
  const [monthlyYearlyToggle, setMonthlyYearlyToggle] = useState<boolean>(true);
  const [lockedLayersVisible, setLockedLayersVisible] = useState<boolean>(true);

  // Modals state
  const [isFacilitatorOpen, setIsFacilitatorOpen] = useState(false);
  const [isReturnCodeOpen, setIsReturnCodeOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active Financial Plan
  const [plan, setPlan] = useState<Plan>(() => {
    if (initialDemoParam) return SAMPLE_DEMO_PLAN;
    const cached = loadStoredPlan();
    return cached || BLANK_PLAN;
  });

  // Calculate master engine results (Reactive & Memoized)
  const results: CalculatedResults = useMemo(() => {
    return calculatePlan(plan);
  }, [plan]);

  // Persist plan changes locally
  useEffect(() => {
    saveStoredPlan(plan);
  }, [plan]);

  const handleUpdatePlan = (updated: Partial<Plan>) => {
    setPlan((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleToggleSampleData = () => {
    if (!isSampleData) {
      setPlan(SAMPLE_DEMO_PLAN);
      setIsSampleData(true);
    } else {
      setPlan(BLANK_PLAN);
      setIsSampleData(false);
    }
  };

  const handleResetPlan = () => {
    if (window.confirm('Reset all values to a blank workshop plan?')) {
      clearStoredPlan();
      setPlan(BLANK_PLAN);
      setIsSampleData(false);
      setActiveLayer(1);
    }
  };

  const handleLoadReturnCode = (code: string) => {
    const cached = loadStoredPlan();
    if (cached) {
      setPlan(cached);
    } else {
      setPlan(SAMPLE_DEMO_PLAN);
    }
  };

  const handleUpdateConsent = (shared: boolean, name?: string) => {
    handleUpdatePlan({
      profile: {
        ...plan.profile,
        name: name !== undefined ? name : plan.profile.name,
      },
      consent: {
        sharedWithAAG: shared,
        timestamp: shared ? new Date().toISOString() : undefined,
        consentedAt: shared ? new Date().toISOString() : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900 pb-20 sm:pb-12">
      {/* Top Navigation Bar (Editorial Reader Style) */}
      <TopNavBar
        activeLayer={activeLayer}
        unlockedLevel={unlockedLevel}
        isSampleData={isSampleData}
        onSelectLayer={(id) => setActiveLayer(id)}
        onToggleSampleData={handleToggleSampleData}
        onOpenFacilitator={() => setIsFacilitatorOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenReturnCode={() => setIsReturnCodeOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onResetPlan={handleResetPlan}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Editorial Reader Masthead with iPad-Optimized Client Profile Inputs at the Top */}
        <header className="border-b border-stone-200/80 pb-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">Overhaul SG × AAG Financial Advisory</span>
              <span className="text-stone-300">·</span>
              <span>Session {plan.sessionCode}</span>
              <span className="text-stone-300">·</span>
              <span className="text-emerald-800 font-medium">100% Private (Runs On-Device)</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-semibold text-[11px]">
                iPad Point-of-Interaction Mode
              </span>
            </div>
          </div>

          {/* iPad & Mobile Client Name & Wealth Runway Command Deck (Top Inputs) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">
                  AAG Advisor Consultation Deck
                </span>
                <h1 className="text-2xl sm:text-3xl font-normal text-stone-950 font-display tracking-tight mt-0.5">
                  Client Profile & Wealth Accumulation Runway
                </h1>
              </div>

              {/* Wealth Accumulation Runway Hero Badge (e.g. 16 Years Left: 60 - 44) */}
              <div className="flex items-center gap-3 bg-amber-50/90 border border-amber-300 px-4 py-2.5 rounded-2xl shrink-0 shadow-2xs">
                <Clock className="w-5 h-5 text-amber-800 shrink-0" />
                <div>
                  <span className="text-[10px] text-amber-900 font-semibold uppercase block">
                    Wealth Accumulation Runway
                  </span>
                  <div className="text-lg sm:text-xl font-bold font-mono-num text-amber-950 flex items-baseline gap-1">
                    <span>{results.wealthRunwayYears} Years Left</span>
                    <span className="text-xs font-normal text-stone-600 font-sans">
                      (Age {plan.profile.age || 44} → {plan.profile.retirementAge || 60})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Inputs: Name, Age, Target Retirement Age (Touch-Optimized for iPad & iPhone with Steppers) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Client Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Client Name / Identifier
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={plan.profile.name || ''}
                    onChange={(e) =>
                      handleUpdatePlan({
                        profile: { ...plan.profile, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Sarah Tan"
                    className="w-full pl-10 pr-3 py-2.5 min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:bg-white focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all"
                  />
                </div>
                <span className="text-[11px] text-stone-500 font-light block">
                  Advisor point-of-interaction identifier
                </span>
              </div>

              {/* Client Current Age with Touch Steppers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    Current Age
                  </label>
                  <span className="text-[11px] text-stone-400 font-mono-num">Starting Age</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = plan.profile.age || 44;
                      if (cur > 18) {
                        handleUpdatePlan({ profile: { ...plan.profile, age: cur - 1 } });
                      }
                    }}
                    className="w-10 h-[44px] shrink-0 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-bold text-stone-700 flex items-center justify-center transition-all cursor-pointer text-base active:scale-95"
                    title="Decrease age by 1"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={plan.profile.age || ''}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10) || 0;
                      handleUpdatePlan({
                        profile: { ...plan.profile, age: num },
                      });
                    }}
                    placeholder="44"
                    className="w-full px-3 py-2.5 min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono-num font-bold text-center text-stone-900 focus:bg-white focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = plan.profile.age || 44;
                      if (cur < 85) {
                        handleUpdatePlan({ profile: { ...plan.profile, age: cur + 1 } });
                      }
                    }}
                    className="w-10 h-[44px] shrink-0 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-bold text-stone-700 flex items-center justify-center transition-all cursor-pointer text-base active:scale-95"
                    title="Increase age by 1"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-stone-500 font-light block">
                  Determines statutory CPF rates & wealth runway
                </span>
              </div>

              {/* Target Retirement Age with Touch Steppers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    Target Retirement Age
                  </label>
                  <span className="text-[11px] text-stone-400 font-mono-num">Horizon Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = plan.profile.retirementAge || 60;
                      if (cur > (plan.profile.age || 44)) {
                        handleUpdatePlan({ profile: { ...plan.profile, retirementAge: cur - 1 } });
                      }
                    }}
                    className="w-10 h-[44px] shrink-0 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-bold text-stone-700 flex items-center justify-center transition-all cursor-pointer text-base active:scale-95"
                    title="Decrease retirement age by 1"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="35"
                    max="95"
                    value={plan.profile.retirementAge || ''}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10) || 0;
                      handleUpdatePlan({
                        profile: { ...plan.profile, retirementAge: num },
                      });
                    }}
                    placeholder="60"
                    className="w-full px-3 py-2.5 min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono-num font-bold text-center text-stone-900 focus:bg-white focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = plan.profile.retirementAge || 60;
                      if (cur < 90) {
                        handleUpdatePlan({ profile: { ...plan.profile, retirementAge: cur + 1 } });
                      }
                    }}
                    className="w-10 h-[44px] shrink-0 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-bold text-stone-700 flex items-center justify-center transition-all cursor-pointer text-base active:scale-95"
                    title="Increase retirement age by 1"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-amber-900 font-medium block">
                  Wealth runway: {Math.max(0, (plan.profile.retirementAge || 60) - (plan.profile.age || 44))} years to compound
                </span>
              </div>
            </div>

            {/* Advisor Fast-Track Bar: Gross Salary CPF Auto-Sync & Target Savings Selector */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-stone-50/70 p-3.5 rounded-2xl">
              {/* Gross Salary + Auto-Populate Take-Home & CPF */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span>Gross Base Salary & Statutory CPF Sync</span>
                  </span>
                  {results.cpfCalculations && (
                    <span className="text-[11px] text-stone-500 font-mono-num">
                      Employee CPF: -${results.cpfCalculations.employeeCpfMonthly.toLocaleString()}/mo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono-num">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={plan.income.grossSalary ? plan.income.grossSalary.toLocaleString() : ''}
                      onChange={(e) => {
                        const cleanNum = Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0);
                        handleUpdatePlan({
                          income: {
                            ...plan.income,
                            grossSalary: cleanNum,
                          },
                        });
                      }}
                      placeholder="7,500"
                      className="w-full pl-7 pr-3 py-2 min-h-[40px] bg-white border border-stone-300 rounded-xl text-xs font-mono-num font-bold text-stone-900 outline-none focus:border-amber-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (results.cpfCalculations) {
                        handleUpdatePlan({
                          income: {
                            ...plan.income,
                            takeHomePay: results.cpfCalculations.netSalaryMonthly,
                            autoCpfToTakeHome: true,
                          },
                        });
                      }
                    }}
                    className="px-3.5 py-2 min-h-[40px] bg-amber-200/90 hover:bg-amber-300 border border-amber-300 text-amber-950 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Auto-compute 2026 CPF based on age and update Take-Home Pay"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-Populate Take-Home</span>
                  </button>
                </div>
              </div>

              {/* Target Savings Rate Quick Chips */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">Target Savings Rate Setting</span>
                  <span className="font-mono-num font-bold text-amber-950">
                    {((plan.targetSavingsRate ?? 0.20) * 100).toFixed(0)}% (${Math.round(results.monthlyIncome * (plan.targetSavingsRate ?? 0.20)).toLocaleString()}/mo)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0.10, 0.15, 0.20, 0.25, 0.30, 0.40].map((rate) => {
                    const isSelected = Math.abs((plan.targetSavingsRate ?? 0.20) - rate) < 0.01;
                    return (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleUpdatePlan({ targetSavingsRate: rate })}
                        className={`flex-1 py-1.5 min-h-[40px] rounded-xl text-xs font-mono-num font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-900 text-amber-50 shadow-xs ring-1 ring-amber-950'
                            : 'bg-white hover:bg-stone-100 border border-stone-200 text-stone-700'
                        }`}
                      >
                        {(rate * 100).toFixed(0)}%
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Inflow, Outflow, Spare Cash & Savings Rate Deck (Moved to Top!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 font-mono-num">
            {/* 1. Monthly Net Inflow */}
            <button
              type="button"
              onClick={() => setActiveLayer(1)}
              className="p-4 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
            >
              <span className="text-[11px] font-sans text-stone-500 group-hover:text-stone-900 block transition-colors">
                1. Monthly Net Inflow
              </span>
              <span className="text-xl sm:text-2xl font-bold text-stone-950 block mt-1">
                ${Math.round(results.monthlyIncome).toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-stone-400 block mt-0.5 truncate">
                Salary + Investments + Side
              </span>
            </button>

            {/* 2. Monthly Outflow / Expenses */}
            <button
              type="button"
              onClick={() => setActiveLayer(1)}
              className="p-4 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
            >
              <span className="text-[11px] font-sans text-stone-500 group-hover:text-stone-900 block transition-colors">
                2. Living Expenses
              </span>
              <span className="text-xl sm:text-2xl font-bold text-stone-950 block mt-1">
                ${Math.round(results.monthlyExpenses).toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-stone-400 block mt-0.5 truncate">
                Needs: ${Math.round(results.monthlyNeeds).toLocaleString()} · Wants: ${Math.round(results.monthlyWants).toLocaleString()}
              </span>
            </button>

            {/* 3. Monthly Savings & Investments */}
            <button
              type="button"
              onClick={() => setActiveLayer(2)}
              className="p-4 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
            >
              <span className="text-[11px] font-sans text-stone-500 group-hover:text-stone-900 block transition-colors">
                3. Monthly Wealth Flow
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-950 block mt-1">
                ${Math.round(results.totalMonthlyContribution).toLocaleString()}
              </span>
              <span className="text-[10px] font-sans text-stone-400 block mt-0.5 truncate">
                Savings & AAG Policies
              </span>
            </button>

            {/* 4. Spare Cash (Prominently Highlighted!) */}
            <div className={`p-4 rounded-2xl border text-left shadow-2xs transition-all ${
              results.spareCashMonthly > 0
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : results.spareCashMonthly === 0
                ? 'bg-amber-50/70 border-amber-300 text-stone-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-bold">
                  4. Spare Cash Left
                </span>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold ${
                  results.spareCashMonthly > 0
                    ? 'bg-emerald-200 text-emerald-950'
                    : results.spareCashMonthly === 0
                    ? 'bg-amber-200 text-amber-950'
                    : 'bg-rose-200 text-rose-950'
                }`}>
                  {results.spareCashMonthly > 0 ? 'Surplus' : results.spareCashMonthly === 0 ? 'Exact' : 'Deficit'}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold block mt-1">
                {results.spareCashMonthly >= 0 ? '+' : '-'}${Math.round(Math.abs(results.spareCashMonthly)).toLocaleString()}
              </span>
              <span className="text-[10px] font-sans opacity-85 block mt-0.5 truncate font-medium">
                {results.spareCashMonthly >= 0 ? 'Inflow - Living - Investments' : 'Spending exceeds available'}
              </span>
            </div>

            {/* 5. Savings Rate */}
            <div className="p-4 bg-white border border-stone-200/90 rounded-2xl text-left shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-sans text-stone-500 block">
                5. Actual Savings Rate
              </span>
              <span className="text-xl sm:text-2xl font-bold text-stone-950 block mt-1">
                {(results.savingsRate * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] font-sans text-amber-900 font-semibold block mt-0.5 truncate">
                Target: {((plan.targetSavingsRate ?? 0.20) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </header>

        {/* Active Layer View (Steps 01 to 05, with The Cake Session at the End!) */}
        <div className="transition-all duration-300">
          {activeLayer === 1 && (
            <Layer1CashFlow
              plan={plan}
              results={results}
              onUpdatePlan={handleUpdatePlan}
              needWantTagging={needWantTagging}
              monthlyYearlyToggle={monthlyYearlyToggle}
              onNextLayer={() => setActiveLayer(2)}
            />
          )}

          {activeLayer === 2 && (
            <Layer2Runway
              plan={plan}
              results={results}
              onUpdatePlan={handleUpdatePlan}
              onNextLayer={() => setActiveLayer(3)}
            />
          )}

          {activeLayer === 3 && (
            <Layer3CPF
              plan={plan}
              results={results}
              onUpdatePlan={handleUpdatePlan}
              onNextLayer={() => setActiveLayer(4)}
            />
          )}

          {activeLayer === 4 && (
            <Layer4Lifestyle
              plan={plan}
              results={results}
              onUpdatePlan={handleUpdatePlan}
              onNextLayer={() => setActiveLayer(5)}
            />
          )}

          {activeLayer === 5 && (
            <div className="space-y-8">
              <Layer5RetirementGap
                plan={plan}
                results={results}
                onUpdatePlan={handleUpdatePlan}
                onOpenReport={() => setIsReportOpen(true)}
              />

              {/* End of Process Transition to Cake Cross-Section */}
              <div className="p-6 bg-gradient-to-r from-amber-100/70 to-rose-100/50 rounded-3xl border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
                    Final Culmination Milestone
                  </span>
                  <h3 className="text-lg font-bold text-stone-950 font-display">
                    Interactive Kueh Lapis Cake Cross-Section
                  </h3>
                  <p className="text-xs text-stone-600 font-light mt-0.5">
                    Synthesize all layers of your personal financial cake into one unified visual masterpiece.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLayer(6)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-stone-950 bg-white hover:bg-amber-50 border border-stone-300 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Cake className="w-4 h-4 text-amber-800" />
                  <span>Reveal Full Cake Cross-Section</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Layer 6: The Interactive Cake Session (Positioned at the End of the Process) */}
          {activeLayer === 6 && (
            <div className="space-y-8">
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2">
                  <div className="text-xs text-stone-500 font-medium">
                    Chapter 06 <span className="text-stone-300">/</span> Grand Synthesis <span className="text-stone-300">·</span> Final Cake Reveal
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>All Strata Unlocked & Synthesized</span>
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-normal text-stone-950 font-display tracking-tight leading-tight">
                  The Complete Kueh Lapis Cake Cross-Section
                </h2>
                <p className="text-sm text-stone-600 mt-2 max-w-2xl font-light leading-relaxed">
                  Here is the full architecture of your financial life stacked layer by layer. Explore each stratum, inspect compounding metrics, and review your blueprint.
                </p>

                {/* Culmination Executive Scorecard */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-stone-100 font-mono-num text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-[10px] font-sans text-stone-500 uppercase block font-semibold">Wealth Runway</span>
                    <span className="text-lg font-bold text-amber-950 block mt-0.5">{results.wealthRunwayYears} Years Left</span>
                    <span className="text-[10px] font-sans text-stone-400">Age {plan.profile.age || 44} → {plan.profile.retirementAge || 60}</span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-[10px] font-sans text-stone-500 uppercase block font-semibold">Total Stored Assets</span>
                    <span className="text-lg font-bold text-stone-950 block mt-0.5">${Math.round(results.totalSavings).toLocaleString()}</span>
                    <span className="text-[10px] font-sans text-stone-400">Cash + Policies + Equities</span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
                    <span className="text-[10px] font-sans text-emerald-800 uppercase block font-semibold">Spare Cash Remaining</span>
                    <span className="text-lg font-bold text-emerald-950 block mt-0.5">
                      {results.spareCashMonthly >= 0 ? '+' : '-'}${Math.round(Math.abs(results.spareCashMonthly)).toLocaleString()}/mo
                    </span>
                    <span className="text-[10px] font-sans text-emerald-700/80">Uncommitted surplus</span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-[10px] font-sans text-stone-500 uppercase block font-semibold">Retirement Target</span>
                    <span className="text-lg font-bold text-stone-950 block mt-0.5">{(results.fundedPercentage * 100).toFixed(0)}% Funded</span>
                    <span className="text-[10px] font-sans text-amber-900 font-medium">{results.fundedBand.status}</span>
                  </div>
                </div>
              </section>

              {/* The Interactive Cake Session Visual */}
              <KuehLapisVisual
                activeLayer={activeLayer}
                unlockedLevel={unlockedLevel}
                results={results}
                onSelectLayer={(id) => setActiveLayer(id)}
                lockedLayersVisible={lockedLayersVisible}
              />

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLayer(5)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  ← Back to Chapter 05: Freedom Gap
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-950 bg-amber-200/90 hover:bg-amber-300 border border-amber-300/80 rounded-2xl shadow-xs transition-all cursor-pointer"
                >
                  <span>Generate Full Advisor Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Privacy & Consent Bar */}
        <footer className="mt-14 pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {plan.consent?.sharedWithAAG
                ? 'Consent active: Summary shared with AAG for workshop follow-up.'
                : '100% Private: All calculations execute locally on your browser. Zero data transmission.'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsConsentOpen(true)}
              className="text-stone-800 hover:underline font-medium"
            >
              {plan.consent?.sharedWithAAG ? 'Manage Consent' : 'Privacy Settings'}
            </button>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={() => setIsGlossaryOpen(true)}
              className="text-stone-800 hover:underline font-medium"
            >
              Glossary of Terms
            </button>
          </div>
        </footer>
      </main>

      {/* Sticky Mobile Bottom Navigation (Ergonomic Thumb-Zone) */}
      <div className="fixed bottom-0 inset-x-0 bg-[#faf9f5]/95 backdrop-blur-md border-t border-stone-200 text-stone-900 z-40 lg:hidden px-3 py-2 flex items-center justify-around text-[11px] shadow-sm no-print">
        <button
          type="button"
          onClick={() => setActiveLayer(1)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeLayer === 1 ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>01. Flow</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer(2)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            activeLayer === 2 ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>02. Runway</span>
        </button>

        {unlockedLevel >= 2 && (
          <button
            type="button"
            onClick={() => setActiveLayer(3)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              activeLayer === 3 ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>03. CPF</span>
          </button>
        )}

        {unlockedLevel >= 3 && (
          <button
            type="button"
            onClick={() => setActiveLayer(4)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              activeLayer === 4 ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>04. Life</span>
          </button>
        )}

        {unlockedLevel >= 4 && (
          <button
            type="button"
            onClick={() => setActiveLayer(5)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              activeLayer === 5 ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>05. Gap</span>
          </button>
        )}

        {unlockedLevel >= 4 && (
          <button
            type="button"
            onClick={() => setActiveLayer(6)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              activeLayer === 6 ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>06. Cake</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <FacilitatorConsole
        isOpen={isFacilitatorOpen}
        onClose={() => setIsFacilitatorOpen(false)}
        unlockedLevel={unlockedLevel}
        onSetUnlockedLevel={(lvl) => setUnlockedLevel(lvl)}
        isSampleData={isSampleData}
        onToggleSampleData={handleToggleSampleData}
        needWantTagging={needWantTagging}
        onToggleNeedWantTagging={() => setNeedWantTagging(!needWantTagging)}
        monthlyYearlyToggle={monthlyYearlyToggle}
        onToggleMonthlyYearly={() => setMonthlyYearlyToggle(!monthlyYearlyToggle)}
        lockedLayersVisible={lockedLayersVisible}
        onToggleLockedLayersVisible={() => setLockedLayersVisible(!lockedLayersVisible)}
        currentSessionCode={plan.sessionCode}
      />

      <ReturnCodeModal
        isOpen={isReturnCodeOpen}
        onClose={() => setIsReturnCodeOpen(false)}
        plan={plan}
        onLoadReturnCode={handleLoadReturnCode}
      />

      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        plan={plan}
        onUpdateConsent={handleUpdateConsent}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <PrintReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        plan={plan}
        results={results}
        unlockedLevel={unlockedLevel}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={plan.profile}
        sessionCode={plan.sessionCode}
        onUpdateProfile={(profile) => handleUpdatePlan({ profile })}
      />
    </div>
  );
}
