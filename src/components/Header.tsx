import React from 'react';
import { Mic, Settings, Globe } from 'lucide-react';
import { ArabicDialect } from '../types';

interface HeaderProps {
  dialect: ArabicDialect;
  onDialectChange: (dialect: ArabicDialect) => void;
  onOpenSettings: () => void;
  hasCustomKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dialect,
  onDialectChange,
  onOpenSettings,
  hasCustomKey,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
          <Mic className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>المساعد الصوتي</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              AI
            </span>
          </h1>
        </div>
      </div>

      {/* Header Actions: Dialect Selector + Settings Button */}
      <div className="flex items-center gap-2">
        {/* Dialect Selector */}
        <div className="relative flex items-center">
          <select
            id="dialect-select-header"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as ArabicDialect)}
            className="bg-slate-900/90 text-slate-300 text-xs font-medium rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none pr-7 pl-2.5"
          >
            <option value="auto">🌐 كل اللهجات</option>
            <option value="saudi">🇸🇦 خليجي / سعودي</option>
            <option value="egyptian">🇪🇬 مصري</option>
            <option value="levantine">🇱🇧 شامي</option>
            <option value="maghrebi">🇲🇦 مغاربي</option>
            <option value="msa">العربية الفصحى</option>
          </select>
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
        </div>

        {/* Settings Button (Replaces the download button) */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
          title="إعدادات المساعد ومفاتيح API"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">الإعدادات</span>
          {hasCustomKey && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
