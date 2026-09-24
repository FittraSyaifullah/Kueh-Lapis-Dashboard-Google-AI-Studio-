import React, { useState } from 'react';
import { X, Shield, Check, AlertCircle } from 'lucide-react';
import { Plan } from '../engine/types.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onUpdateConsent: (shared: boolean, name?: string) => void;
}

export const ConsentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  plan,
  onUpdateConsent,
}) => {
  const [agreed, setAgreed] = useState(plan.consent?.sharedWithAAG || false);
  const [participantName, setParticipantName] = useState(plan.profile.name || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateConsent(agreed, participantName);
    onClose();
  };

  const handleRevoke = () => {
    setAgreed(false);
    onUpdateConsent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden text-xs">
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base font-display">Privacy & Data Consent</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-stone-700">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
            <span className="font-bold text-emerald-900 block mb-1">Privacy by Default</span>
            <p className="text-emerald-800 leading-relaxed">
              All financial calculations run directly on your phone's browser. Nothing leaves your device unless you explicitly opt in to share your summary with AAG advisers for follow-up guidance.
            </p>
          </div>

          <div>
            <span className="font-bold text-stone-900 block mb-1.5">What is shared if you consent:</span>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Income and spending totals (by category)</li>
              <li>Calculated cash surplus and emergency runway months</li>
              <li>Retirement target and funded status score</li>
              <li>No banking credentials or sensitive identification exist in this application</li>
            </ul>
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              Your Preferred Name (Optional)
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="e.g. Sarah Tan (or leave blank)"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-amber-600 accent-amber-600 focus:ring-amber-500"
            />
            <span className="text-stone-800 leading-snug">
              I agree to share my dashboard inputs with AAG / Overhaul SG for the sole purpose of workshop follow-up and financial review.
            </span>
          </label>

          {plan.consent?.sharedWithAAG && (
            <div className="flex items-center justify-between p-3 bg-stone-100 rounded-xl">
              <span className="text-stone-600">Consent currently active</span>
              <button
                type="button"
                onClick={handleRevoke}
                className="text-rose-600 font-semibold hover:underline"
              >
                Revoke Consent
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 font-medium hover:bg-stone-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800"
          >
            Save Preference
          </button>
        </div>
      </div>
    </div>
  );
};
