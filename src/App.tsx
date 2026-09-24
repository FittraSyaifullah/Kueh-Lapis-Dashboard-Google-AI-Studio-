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
import { ShieldCheck, Sparkles, Layers, User } from 'lucide-react';

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
        {/* Editorial Reader Masthead */}
        <header className="border-b border-stone-200/80 pb-8 space-y-4">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Overhaul SG × AAG Financial Workshops</span>
            <span className="text-stone-300">·</span>
            <span>Session {plan.sessionCode}</span>
            <span className="text-stone-300">·</span>
            <span className="text-emerald-800">100% Private (Runs On-Device)</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-normal tracking-tight font-display text-stone-950 leading-[1.15]">
                Layer by layer, slice by slice.
              </h1>
              <p className="text-base sm:text-lg text-stone-600 font-light mt-3 leading-relaxed">
                Build your personal financial blueprint step by step. Answer three foundational questions: Where does my money go? What is left each month? And is it enough for the life I want?
              </p>

              {/* Participant Profile Banner */}
              <div className="flex items-center gap-3 mt-4 text-xs text-stone-600">
                <span className="flex items-center gap-1.5 font-medium text-stone-900">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  {plan.profile.name || 'Anonymous Attendee'}
                </span>
                <span className="text-stone-300">·</span>
                <span>
                  Age {plan.profile.age || 44} → Target Retire {plan.profile.retirementAge || 60}
                </span>
                <span className="text-stone-300">·</span>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="text-amber-800 hover:text-amber-950 font-medium underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Edit Timeline
                </button>
              </div>
            </div>

            {/* Quick Balance Summary Strip (Clickable & Unboxed Typography) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 text-xs text-stone-600 shrink-0 font-mono-num pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => setActiveLayer(1)}
                className="border-l border-stone-200 hover:border-emerald-600 pl-3 text-left transition-all group cursor-pointer"
                title="Click to view Chapter 01: Cash Flow Bedrock"
              >
                <span className="text-[11px] font-sans text-stone-400 group-hover:text-emerald-700 block font-light transition-colors">
                  Monthly Net Flow
                </span>
                <span className={`text-base font-medium transition-transform group-hover:scale-105 inline-block ${results.monthlyCashFlow >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {results.monthlyCashFlow >= 0 ? '+' : '-'}${Math.round(Math.abs(results.monthlyCashFlow)).toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayer(2)}
                className="border-l border-stone-200 hover:border-stone-500 pl-3 text-left transition-all group cursor-pointer"
                title="Click to inspect Chapter 02: Emergency Runway"
              >
                <span className="text-[11px] font-sans text-stone-400 group-hover:text-stone-700 block font-light transition-colors">
                  Emergency Runway
                </span>
                <span className="text-base font-medium text-stone-900 group-hover:scale-105 inline-block transition-transform">
                  {results.cashRunwayMonths.toFixed(1)} mo
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayer(5)}
                className="border-l border-stone-200 hover:border-amber-600 pl-3 text-left transition-all group cursor-pointer"
                title="Click to review Chapter 05: Retirement Gap"
              >
                <span className="text-[11px] font-sans text-stone-400 group-hover:text-amber-700 block font-light transition-colors">
                  Retirement Target
                </span>
                <span className="text-base font-medium text-stone-900 group-hover:scale-105 inline-block transition-transform">
                  {results.lumpSumNeeded > 0 ? `$${Math.round(results.lumpSumNeeded / 1000).toLocaleString()}k` : '—'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Visual Kueh Lapis Cake Cross-Section */}
        <KuehLapisVisual
          activeLayer={activeLayer}
          unlockedLevel={unlockedLevel}
          results={results}
          onSelectLayer={(id) => setActiveLayer(id)}
          lockedLayersVisible={lockedLayersVisible}
        />

        {/* Active Layer View */}
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
            <Layer5RetirementGap
              plan={plan}
              results={results}
              onUpdatePlan={handleUpdatePlan}
              onOpenReport={() => setIsReportOpen(true)}
            />
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
