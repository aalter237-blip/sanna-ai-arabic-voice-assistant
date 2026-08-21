import React from 'react';
import { Sparkles, Wifi, WifiOff, Globe, Terminal, Smartphone, Code2, Layers } from 'lucide-react';
import { OperatingMode, ArabicDialect } from '../types';

interface HeaderProps {
  mode: OperatingMode;
  onModeToggle: (mode: OperatingMode) => void;
  dialect: ArabicDialect;
  onDialectChange: (dialect: ArabicDialect) => void;
  activeTab: 'simulator' | 'code' | 'nodes' | 'logs';
  onTabChange: (tab: 'simulator' | 'code' | 'nodes' | 'logs') => void;
  isArabicUI: boolean;
  onToggleUI: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeToggle,
  dialect,
  onDialectChange,
  activeTab,
  onTabChange,
  isArabicUI,
  onToggleUI,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold text-xl">
              س
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>سنا</span>
                  <span className="text-cyan-400 font-medium text-base">| Sanna AI</span>
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                  Android Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isArabicUI
                  ? 'مساعد صوتي ذكي للأندرويد يدعم اللهجات العربية والتحكم بإمكانية الوصول'
                  : 'Arabic Voice Assistant & Android Accessibility Automation'}
              </p>
            </div>
          </div>

          {/* Quick UI Language switch on mobile */}
          <button
            id="toggle-lang-mobile"
            onClick={onToggleUI}
            className="md:hidden flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isArabicUI ? 'EN' : 'العربية'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 text-xs w-full md:w-auto overflow-x-auto">
          <button
            id="tab-simulator"
            onClick={() => onTabChange('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isArabicUI ? 'المحاكي المباشر' : 'Live Simulator'}</span>
          </button>

          <button
            id="tab-nodes"
            onClick={() => onTabChange('nodes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'nodes'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isArabicUI ? 'هيكل Accessibility' : 'Node Inspector'}</span>
          </button>

          <button
            id="tab-logs"
            onClick={() => onTabChange('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isArabicUI ? 'سجل العمليات' : 'Pipeline Logs'}</span>
          </button>

          <button
            id="tab-code"
            onClick={() => onTabChange('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isArabicUI ? 'الكود المصدري' : 'Source Code'}</span>
          </button>
        </div>

        {/* Mode Switch & Dialect selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Dialect selector */}
          <div className="relative">
            <select
              id="dialect-select"
              value={dialect}
              onChange={(e) => onDialectChange(e.target.value as ArabicDialect)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="auto">{isArabicUI ? 'اللهجة: تلقائي (Auto)' : 'Dialect: Auto'}</option>
              <option value="saudi">🇸🇦 {isArabicUI ? 'خليجي / سعودي' : 'Gulf / Saudi'}</option>
              <option value="egyptian">🇪🇬 {isArabicUI ? 'مصري' : 'Egyptian'}</option>
              <option value="levantine">🇱🇧 {isArabicUI ? 'شامي' : 'Levantine'}</option>
              <option value="maghrebi">🇲🇦 {isArabicUI ? 'مغاربي' : 'Maghrebi'}</option>
              <option value="msa">🌐 {isArabicUI ? 'الفصحى (MSA)' : 'Standard Arabic'}</option>
            </select>
          </div>

          {/* Operating Mode (Hybrid: Online / Offline) */}
          <button
            id="mode-toggle-btn"
            onClick={() => onModeToggle(mode === 'online' ? 'offline' : 'online')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
              mode === 'online'
                ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-700/50 text-amber-400 hover:bg-amber-900/60'
            }`}
            title={
              mode === 'online'
                ? 'Cloud Gemini LLM Intelligence active'
                : 'Local On-Device Edge SLM active (Offline Mode)'
            }
          >
            {mode === 'online' ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>{isArabicUI ? 'وضع السحابة' : 'Cloud LLM'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>{isArabicUI ? 'وضع بدون إنترنت' : 'Offline SLM'}</span>
              </>
            )}
          </button>

          {/* Language Toggle Desktop */}
          <button
            id="toggle-lang-desktop"
            onClick={onToggleUI}
            className="hidden md:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Toggle Interface Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isArabicUI ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
