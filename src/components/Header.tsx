import React from 'react';
import { Mic, Settings, Globe, Smartphone, Layers, Terminal, Code2, Wifi, Zap } from 'lucide-react';
import { ArabicDialect, OperatingMode, AppViewTab } from '../types';

interface HeaderProps {
  dialect: ArabicDialect;
  onDialectChange: (dialect: ArabicDialect) => void;
  mode: OperatingMode;
  onModeToggle: () => void;
  activeTab: AppViewTab;
  onTabChange: (tab: AppViewTab) => void;
  onOpenSettings: () => void;
  hasCustomKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dialect,
  onDialectChange,
  mode,
  onModeToggle,
  activeTab,
  onTabChange,
  onOpenSettings,
  hasCustomKey,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 select-none">
      {/* Brand & Mode Status */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-slate-950 font-bold transform hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white tracking-tight">سنا AI</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-800/60 shadow-sm">
                وكيل صوتي متكامل
              </span>
            </div>
            <p className="text-[10px] text-slate-400">التحكم الصوتي الكامل بالهاتف والأندرويد</p>
          </div>
        </div>

        {/* Mode Toggle Button for Mobile */}
        <button
          onClick={onModeToggle}
          className={`sm:hidden flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
            mode === 'online'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
              : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50'
          }`}
        >
          {mode === 'online' ? <Zap className="w-3 h-3 text-emerald-400" /> : <Wifi className="w-3 h-3 text-indigo-400" />}
          <span>{mode === 'online' ? 'سحابي (Cloud)' : 'محلي (Edge)'}</span>
        </button>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/90 shadow-lg overflow-x-auto max-w-full">
        <button
          onClick={() => onTabChange('assistant_simulator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'assistant_simulator'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>المساعد والمحاكي</span>
        </button>

        <button
          onClick={() => onTabChange('accessibility')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'accessibility'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>فاحص الشاشة</span>
        </button>

        <button
          onClick={() => onTabChange('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>سجل العمليات</span>
        </button>

        <button
          onClick={() => onTabChange('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'code'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>الكود والمعمارية</span>
        </button>
      </div>

      {/* Actions: Dialect Selector + Mode + Settings */}
      <div className="flex items-center gap-2">
        {/* Dialect Selector */}
        <div className="relative flex items-center">
          <select
            id="dialect-select-header"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value as ArabicDialect)}
            className="bg-slate-900/90 text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none pr-7 pl-2.5 shadow-sm"
          >
            <option value="auto">🌐 كل اللهجات</option>
            <option value="sudanese">🇸🇩 سوداني / يا زول</option>
            <option value="saudi">🇸🇦 خليجي / سعودي</option>
            <option value="egyptian">🇪🇬 مصري</option>
            <option value="levantine">🇱🇧 شامي</option>
            <option value="maghrebi">🇲🇦 مغاربي</option>
            <option value="msa">العربية الفصحى</option>
          </select>
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
        </div>

        {/* Mode Toggle Button for Desktop */}
        <button
          onClick={onModeToggle}
          title={`الوضع الحالي: ${mode === 'online' ? 'سحابي (Gemini Flash)' : 'محلي (Edge SLM)'}`}
          className={`hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-sm ${
            mode === 'online'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
              : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50 hover:bg-indigo-900/60'
          }`}
        >
          {mode === 'online' ? <Zap className="w-3.5 h-3.5 text-emerald-400" /> : <Wifi className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{mode === 'online' ? 'سحابي' : 'محلي'}</span>
        </button>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="relative flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
          title="إعدادات المساعد، مفاتيح Gemini، الأصوات وكلمات التنبيه"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">الإعدادات</span>
          {hasCustomKey && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
