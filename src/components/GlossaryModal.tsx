import React, { useState } from 'react';
import { X, BookOpen, Search } from 'lucide-react';
import copyConfig from '../config/copy.json';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const glossaryItems = Object.entries(copyConfig.glossary || {}).map(([key, item]) => ({
    key,
    term: item.term,
    definition: item.definition,
  }));

  const filtered = glossaryItems.filter(
    (g) =>
      g.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base font-display">Financial Terms & Glossary</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-100 bg-stone-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search terms (e.g. CPF LIFE, Runway, OA, Inflation)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto divide-y divide-stone-100 flex-1 text-xs">
          {filtered.length === 0 ? (
            <p className="text-center text-stone-400 py-8">No terms match your search.</p>
          ) : (
            filtered.map((item) => (
              <div key={item.key} className="py-3">
                <h4 className="font-bold text-stone-900 text-sm mb-1">{item.term}</h4>
                <p className="text-stone-600 leading-relaxed">{item.definition}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl text-xs hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
