import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Award, Check } from 'lucide-react';
import { PlanProfile } from '../engine/types.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PlanProfile;
  sessionCode: string;
  onUpdateProfile: (profile: PlanProfile) => void;
}

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  sessionCode,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '44');
  const [retirementAge, setRetirementAge] = useState(
    profile.retirementAge ? String(profile.retirementAge) : '60',
  );
  const [planningAge, setPlanningAge] = useState(
    profile.planningAge ? String(profile.planningAge) : '85',
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name || '');
    setAge(profile.age ? String(profile.age) : '44');
    setRetirementAge(profile.retirementAge ? String(profile.retirementAge) : '60');
    setPlanningAge(profile.planningAge ? String(profile.planningAge) : '85');
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAge = Math.max(16, parseInt(age, 10) || 44);
    const cleanRetAge = Math.max(cleanAge + 1, parseInt(retirementAge, 10) || 60);
    const cleanPlanAge = Math.max(cleanRetAge + 1, parseInt(planningAge, 10) || 85);

    onUpdateProfile({
      name: name.trim(),
      age: cleanAge,
      retirementAge: cleanRetAge,
      planningAge: cleanPlanAge,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200/80">
        <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-stone-100">
          <div>
            <div className="text-xs text-stone-500 font-medium">Workshop Profile</div>
            <h3 className="text-xl font-normal text-stone-950 font-display">
              Participant Timeline
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Participant Name */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Participant Name / Alias
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Tan (or leave blank for Anonymous)"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 outline-none text-stone-900"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Used solely to personalise your workbook and PDF report.
            </span>
          </div>

          {/* Age Grid */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Current Age
              </label>
              <input
                type="number"
                min="16"
                max="90"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 outline-none text-stone-900 font-mono-num font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Retire Age
              </label>
              <input
                type="number"
                min="30"
                max="95"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 outline-none text-stone-900 font-mono-num font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Horizon Age
              </label>
              <input
                type="number"
                min="50"
                max="105"
                value={planningAge}
                onChange={(e) => setPlanningAge(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-stone-400 outline-none text-stone-900 font-mono-num font-medium"
              />
            </div>
          </div>

          {/* Session code banner */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-stone-600 text-[11px] flex items-center justify-between">
            <span>Current Session: <strong className="text-stone-900 font-mono-num">{sessionCode}</strong></span>
            <span className="text-emerald-800 font-medium">On-Device Storage</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-stone-950 font-semibold bg-amber-200/80 hover:bg-amber-300 border border-amber-300/70 rounded-xl shadow-2xs transition-colors"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Timeline</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
