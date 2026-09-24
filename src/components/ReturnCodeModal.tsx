import React, { useState } from 'react';
import { X, Key, Copy, Check, ArrowRight } from 'lucide-react';
import { generateReturnCode } from '../engine/defaultData.ts';
import { Plan } from '../engine/types.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onLoadReturnCode: (code: string) => void;
}

export const ReturnCodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  plan,
  onLoadReturnCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [loadError, setLoadError] = useState('');

  if (!isOpen) return null;

  const currentCode = generateReturnCode(plan);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    if (!inputCode.toUpperCase().startsWith('KL-')) {
      setLoadError('Please enter a valid code starting with KL- (e.g. KL-7AB9X)');
      return;
    }
    setLoadError('');
    onLoadReturnCode(inputCode.trim().toUpperCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-display">Your Plan Return Code</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-stone-700">
          <div>
            <p className="text-stone-600 mb-2">
              To resume this workshop plan in subsequent sessions without creating an account or storing cookies, keep this unique return code:
            </p>

            <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                  Session Return Code
                </span>
                <span className="text-2xl font-mono-num font-extrabold text-stone-950 tracking-widest">
                  {currentCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Resume form */}
          <form onSubmit={handleApplyCode} className="pt-4 border-t border-stone-100">
            <label className="block font-semibold text-stone-800 mb-1">
              Have an existing return code from Workshop 1?
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. KL-8J4K2"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm font-semibold uppercase focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl hover:bg-amber-400 transition-colors"
              >
                Load
              </button>
            </div>
            {loadError && <p className="text-rose-600 mt-1.5 font-medium">{loadError}</p>}
          </form>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-xl text-xs hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
