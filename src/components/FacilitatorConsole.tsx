import React, { useState } from 'react';
import { X, Sliders, Check, Copy, Users, Lock, Unlock, Sparkles, RefreshCw } from 'lucide-react';
import sessionsConfig from '../config/sessions.json';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unlockedLevel: number;
  onSetUnlockedLevel: (lvl: number) => void;
  isSampleData: boolean;
  onToggleSampleData: () => void;
  needWantTagging: boolean;
  onToggleNeedWantTagging: () => void;
  monthlyYearlyToggle: boolean;
  onToggleMonthlyYearly: () => void;
  lockedLayersVisible: boolean;
  onToggleLockedLayersVisible: () => void;
  currentSessionCode: string;
}

export const FacilitatorConsole: React.FC<Props> = ({
  isOpen,
  onClose,
  unlockedLevel,
  onSetUnlockedLevel,
  isSampleData,
  onToggleSampleData,
  needWantTagging,
  onToggleNeedWantTagging,
  monthlyYearlyToggle,
  onToggleMonthlyYearly,
  lockedLayersVisible,
  onToggleLockedLayersVisible,
  currentSessionCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'cohort'>('controls');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?session=${currentSessionCode}&level=${unlockedLevel}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base font-display">Facilitator Console</h3>
              <p className="text-xs text-stone-400">Overhaul SG × AAG Workshop Controls (SW-6)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'controls'
                ? 'border-amber-600 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Session Feature Flags
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cohort')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cohort'
                ? 'border-amber-600 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Simulated Cohort View</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'controls' ? (
            <>
              {/* Level Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  1. Unlocked Workshop Level (SW-6)
                </label>
                <p className="text-stone-500 mb-3">
                  Instantly reveal or lock layers for this live workshop cohort without any code redeploy:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { lvl: 1, label: 'Level 1: Cash Flow & Runway', icon: 'L1' },
                    { lvl: 2, label: 'Level 2: CPF Foundation', icon: 'L2' },
                    { lvl: 3, label: 'Level 3: Desired Lifestyle', icon: 'L3' },
                    { lvl: 4, label: 'Level 4: Retirement Gap', icon: 'L4' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => onSetUnlockedLevel(item.lvl)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        unlockedLevel === item.lvl
                          ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-xs ring-2 ring-amber-400'
                          : unlockedLevel > item.lvl
                          ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono-num font-bold text-sm">{item.icon}</span>
                        {unlockedLevel >= item.lvl ? (
                          <Unlock className="w-3.5 h-3.5 text-stone-900" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-stone-400" />
                        )}
                      </div>
                      <span className="text-[11px] leading-tight font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Flags */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                  2. Session Toggles (Feature Flags)
                </label>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-semibold text-stone-800 block">Sample Demo Data</span>
                      <span className="text-stone-500 text-[11px]">
                        Pre-populate with Section 8 Sarah Tan plan ($4,200 pay, $3,250 expenses)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSampleData}
                      onChange={onToggleSampleData}
                      className="w-4 h-4 text-amber-600 accent-amber-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-semibold text-stone-800 block">Need vs. Want Tagging</span>
                      <span className="text-stone-500 text-[11px]">
                        Allow participants to classify expenses into Needs & Wants
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={needWantTagging}
                      onChange={onToggleNeedWantTagging}
                      className="w-4 h-4 text-amber-600 accent-amber-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-semibold text-stone-800 block">Monthly / Yearly Toggle</span>
                      <span className="text-stone-500 text-[11px]">
                        Allow per-row month and year billing with automatic math conversion
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={monthlyYearlyToggle}
                      onChange={onToggleMonthlyYearly}
                      className="w-4 h-4 text-amber-600 accent-amber-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-semibold text-stone-800 block">Show Locked Layers with Teaser</span>
                      <span className="text-stone-500 text-[11px]">
                        Keep subsequent layers visible with workshop preview hints
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={lockedLayersVisible}
                      onChange={onToggleLockedLayersVisible}
                      className="w-4 h-4 text-amber-600 accent-amber-600"
                    />
                  </label>
                </div>
              </div>

              {/* Shareable Link */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                  3. Participant QR / Session URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?session=${currentSessionCode}&level=${unlockedLevel}`}
                    className="flex-1 px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl font-mono text-[11px] text-stone-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Cohort Anonymised Summary View (SW-7) */
            <div className="space-y-4">
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-600">
                <span className="font-semibold text-stone-900">Anonymised Cohort Aggregates: </span>
                Real-time aggregated metrics for the current workshop room ({currentSessionCode}). Zero individual identities or personal amounts are exposed.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
                  <span className="text-stone-500 block text-[11px]">Cohort Median Cash Flow</span>
                  <span className="text-xl font-bold font-mono-num text-emerald-700">+$650 / mo</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
                  <span className="text-stone-500 block text-[11px]">% with Monthly Deficit</span>
                  <span className="text-xl font-bold font-mono-num text-rose-600">18% (4 of 22)</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
                  <span className="text-stone-500 block text-[11px]">% with Runway &lt; 3 Months</span>
                  <span className="text-xl font-bold font-mono-num text-amber-600">32% (7 of 22)</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
                  <span className="text-stone-500 block text-[11px]">Average Savings Rate</span>
                  <span className="text-xl font-bold font-mono-num text-stone-900">19.4%</span>
                </div>
              </div>

              {/* Progress Distribution */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                <span className="font-semibold text-stone-900 block mb-2">Workshop Completion Progress</span>
                <div className="space-y-2 text-stone-600">
                  <div className="flex justify-between">
                    <span>Completed Level 1 (Cash Flow)</span>
                    <span className="font-mono-num font-semibold">22 / 22 (100%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500" />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Completed Level 2 (Runway)</span>
                    <span className="font-mono-num font-semibold">19 / 22 (86%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="w-[86%] h-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl text-xs hover:bg-stone-800 transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
