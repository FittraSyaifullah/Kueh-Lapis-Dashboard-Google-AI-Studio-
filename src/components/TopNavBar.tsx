import React from 'react';
import { Sliders, Download, Sparkles, RotateCcw, Key, BookOpen } from 'lucide-react';

interface Props {
  activeLayer: number;
  unlockedLevel: number;
  isSampleData: boolean;
  onSelectLayer: (layerId: number) => void;
  onToggleSampleData: () => void;
  onOpenFacilitator: () => void;
  onOpenReport: () => void;
  onOpenReturnCode: () => void;
  onOpenGlossary: () => void;
  onResetPlan: () => void;
}

export const TopNavBar: React.FC<Props> = ({
  activeLayer,
  unlockedLevel,
  isSampleData,
  onSelectLayer,
  onToggleSampleData,
  onOpenFacilitator,
  onOpenReport,
  onOpenReturnCode,
  onOpenGlossary,
  onResetPlan,
}) => {
  const navItems = [
    { id: 1, label: '01. Cash Flow', level: 1 },
    { id: 2, label: '02. Runway', level: 1 },
    { id: 3, label: '03. CPF', level: 2 },
    { id: 4, label: '04. Lifestyle', level: 3 },
    { id: 5, label: '05. Freedom Gap', level: 4 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f5]/90 backdrop-blur-md border-b border-stone-200/70 text-stone-900 no-print transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark (Display Serif) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectLayer(1);
            }}
            className="text-2xl font-normal tracking-tight text-stone-950 font-display hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            Kueh Lapis
          </a>
        </div>

        {/* Zone 2: Editorial Navigation Links (Clean unboxed typography) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
          {navItems.map((item) => {
            if (item.level > unlockedLevel) return null;
            const isActive = activeLayer === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectLayer(item.id)}
                className={`relative py-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-stone-950 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sample Demo Toggle */}
          <button
            type="button"
            onClick={onToggleSampleData}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors border ${
              isSampleData
                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            }`}
            title={isSampleData ? 'Switch to blank template' : 'Load sample scenario (Sarah Tan)'}
          >
            <Sparkles className="w-3.5 h-3.5 opacity-70" />
            <span className="hidden sm:inline">{isSampleData ? 'Demo Active' : 'Sample Plan'}</span>
          </button>

          {/* Glossary Tooltip Trigger */}
          <button
            type="button"
            onClick={onOpenGlossary}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="Reader's Glossary & Terms"
            aria-label="Financial glossary"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Return Code / Magic link */}
          <button
            type="button"
            onClick={onOpenReturnCode}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="Resume or Save Return Code"
            aria-label="Return code"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* Facilitator Controls */}
          <button
            type="button"
            onClick={onOpenFacilitator}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="Facilitator Workshop Controls"
            aria-label="Facilitator settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* PDF Report Export */}
          <button
            type="button"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-amber-200/70 hover:bg-amber-300 border border-amber-300/60 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Save as Branded A4 PDF Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold">Export PDF</span>
          </button>

          {/* Clear Everything */}
          <button
            type="button"
            onClick={onResetPlan}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="Reset worksheet"
            aria-label="Reset worksheet"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
