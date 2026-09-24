import React from 'react';
import { Lock, Check, ChevronRight } from 'lucide-react';
import { CalculatedResults } from '../engine/types.ts';

interface Props {
  activeLayer: number;
  unlockedLevel: number;
  results: CalculatedResults;
  onSelectLayer: (layerId: number) => void;
  lockedLayersVisible: boolean;
}

interface LayerMeta {
  id: number;
  chapter: string;
  level: number;
  title: string;
  subtitle: string;
  cakeTexture: string;
  accentColor: string;
  metricLabel: (res: CalculatedResults) => string;
  isComplete: (res: CalculatedResults) => boolean;
  teaser: string;
}

const LAYERS: LayerMeta[] = [
  {
    id: 5,
    chapter: '05',
    level: 4,
    title: 'Retirement Gap & Freedom',
    subtitle: 'Lump sum required, funded ratio & earliest freedom age',
    cakeTexture: 'bg-rose-900 text-rose-100', // The iconic prized top layer of Kueh Lapis Sagu / Legit
    accentColor: 'border-l-rose-800',
    metricLabel: (res) =>
      res.lumpSumNeeded > 0
        ? `${(res.fundedPercentage * 100).toFixed(0)}% Funded · $${Math.round(res.lumpSumNeeded / 1000).toLocaleString()}k Target`
        : 'Gap Analysis',
    isComplete: (res) => res.lumpSumNeeded > 0,
    teaser: 'Determine if your projected assets cover your desired lifestyle, and calculate your earliest retirement age.',
  },
  {
    id: 4,
    chapter: '04',
    level: 3,
    title: 'Desired Lifestyle & Inflation',
    subtitle: 'Future living costs projected with Singapore compounding inflation',
    cakeTexture: 'bg-amber-800 text-amber-100', // Spiced cinnamon layer
    accentColor: 'border-l-amber-800',
    metricLabel: (res) =>
      res.costAtRetirementMonthly > 0
        ? `$${res.costAtRetirementMonthly.toLocaleString()}/mo in retirement`
        : 'Future Living Cost',
    isComplete: (res) => res.costAtRetirementMonthly > 0,
    teaser: 'Model your ideal monthly retirement spend and evaluate what 3% inflation does over 15 to 25 years.',
  },
  {
    id: 3,
    chapter: '03',
    level: 2,
    title: 'CPF & Social Security',
    subtitle: '2026 CPF Board contributions, OA/SA/MA age allocations',
    cakeTexture: 'bg-amber-600 text-amber-50', // Golden saffron egg yolk layer
    accentColor: 'border-l-amber-600',
    metricLabel: (res) =>
      res.cpfCalculations
        ? `OA: $${res.cpfCalculations.oaMonthly.toLocaleString()} · SA: $${res.cpfCalculations.saMonthly.toLocaleString()}/mo`
        : 'CPF Accumulation',
    isComplete: (res) => !!res.cpfCalculations,
    teaser: 'Calculate statutory employee/employer splits, housing mortgage deductions, and age-band allocations.',
  },
  {
    id: 2,
    chapter: '02',
    level: 1,
    title: 'Emergency Runway & Reserves',
    subtitle: 'Cash buffers, endowments, bonds, and survival runway',
    cakeTexture: 'bg-stone-800 text-stone-100', // Gula melaka deep palm sugar layer
    accentColor: 'border-l-stone-800',
    metricLabel: (res) =>
      res.cashRunwayMonths > 0
        ? `${res.cashRunwayMonths.toFixed(1)} mo runway ($${Math.round(res.totalSavings).toLocaleString()} saved)`
        : '$0 recorded',
    isComplete: (res) => res.totalSavings > 0,
    teaser: 'Tally your emergency cash buffer to know exactly how many months you can weather sudden income shocks.',
  },
  {
    id: 1,
    chapter: '01',
    level: 1,
    title: 'Cash Flow Bedrock',
    subtitle: 'Net take-home income, living expenses, and monthly surplus/deficit',
    cakeTexture: 'bg-emerald-800 text-emerald-100', // Pandan leaf emerald base layer
    accentColor: 'border-l-emerald-800',
    metricLabel: (res) =>
      res.monthlyIncome > 0
        ? `${res.monthlyCashFlow >= 0 ? '+' : '-'}$${Math.round(Math.abs(res.monthlyCashFlow)).toLocaleString()}/mo (${(res.savingsRate * 100).toFixed(0)}% saved)`
        : 'Income minus Expenses',
    isComplete: (res) => res.monthlyIncome > 0 && res.monthlyExpenses > 0,
    teaser: 'The foundational bedrock: understand where your pay goes and what remains to build wealth.',
  },
];

export const KuehLapisVisual: React.FC<Props> = ({
  activeLayer,
  unlockedLevel,
  results,
  onSelectLayer,
  lockedLayersVisible,
}) => {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 pb-4 border-b border-stone-200/70">
        <div>
          <div className="text-xs text-stone-500 font-medium tracking-normal mb-1">
            Structural Overview <span className="text-stone-300">/</span> The Kueh Lapis Anatomy
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-stone-950 font-display tracking-tight">
            The Five Financial Strata
          </h2>
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" /> Unlocked in workshop
          </span>
          <span className="flex items-center gap-1.5 text-stone-400">
            <Lock className="w-3 h-3 inline-block" /> Subsequent level
          </span>
        </div>
      </div>

      {/* Layer Stack */}
      <div className="space-y-2">
        {LAYERS.map((layer) => {
          const isUnlocked = layer.level <= unlockedLevel;
          const isSelected = activeLayer === layer.id;
          const complete = layer.isComplete(results);
          const metric = layer.metricLabel(results);

          if (!isUnlocked && !lockedLayersVisible) {
            return null;
          }

          return (
            <div
              key={layer.id}
              onClick={() => {
                if (isUnlocked) onSelectLayer(layer.id);
              }}
              className={`group transition-all duration-200 border rounded-2xl overflow-hidden ${
                isUnlocked ? 'cursor-pointer' : 'opacity-65 cursor-not-allowed bg-stone-50/50'
              } ${
                isSelected
                  ? 'bg-amber-50/40 border-amber-300/80 shadow-xs ring-1 ring-amber-300/60'
                  : 'bg-white border-stone-200/70 hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between p-3.5 sm:p-4 gap-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Layer Chapter Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono-num text-xs font-semibold shrink-0 shadow-2xs ${layer.cakeTexture}`}
                  >
                    {layer.chapter}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-stone-900 truncate">
                        {layer.title}
                      </h3>
                      {complete && isUnlocked && (
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" strokeWidth={2.5} />
                      )}
                      {!isUnlocked && (
                        <span className="text-[11px] text-stone-400 font-medium">
                          (Level {layer.level})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate mt-0.5 font-light">
                      {layer.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right metrics / callout */}
                <div className="flex items-center gap-4 shrink-0">
                  {isUnlocked ? (
                    <div className="text-right hidden sm:block font-mono-num">
                      <span className="text-xs font-medium text-stone-900 block">
                        {metric}
                      </span>
                      <span className="text-[11px] text-stone-400 font-sans">
                        {isSelected ? 'Currently editing' : 'Click to inspect'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right hidden md:block max-w-[240px]">
                      <span className="text-xs text-stone-400 italic line-clamp-1">
                        {layer.teaser}
                      </span>
                    </div>
                  )}

                  <div className="w-7 h-7 flex items-center justify-center text-stone-400 group-hover:text-stone-700 transition-colors">
                    {isUnlocked ? (
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-stone-900' : ''}`} />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-stone-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Locked teaser drawer */}
              {!isUnlocked && (
                <div className="px-4 py-2 text-xs text-stone-500 bg-stone-50/80 border-t border-stone-200/40 flex items-center justify-between">
                  <span>{layer.teaser}</span>
                  <span className="text-[11px] text-stone-400 font-mono-num shrink-0 ml-3">
                    Facilitator code required
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
