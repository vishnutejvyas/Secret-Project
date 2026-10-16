import React from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenTester: () => void;
  sheetsConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTester, sheetsConfigured }) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl select-none" role="img" aria-label="ghost">
          👻
        </span>
        <span className="font-heading font-bold text-slate-800 text-sm md:text-base tracking-tight whitespace-nowrap">
          Okay, Quick Question... 👀
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTester}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white rounded-lg border border-slate-200/80 transition-all shadow-xs"
          title="Google Sheets & Backend Status"
          aria-label="Open Integration Status"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-medium">Integration Status</span>
          <span
            className={`w-2 h-2 rounded-full ${
              sheetsConfigured ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
            title={sheetsConfigured ? 'Google Sheet Connected' : 'Google Sheet Setup Pending'}
          />
        </button>
      </div>
    </header>
  );
};
