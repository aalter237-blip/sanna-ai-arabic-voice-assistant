import React from 'react';
import { Sparkles, MessageCircle, Volume2, Clock, Eye, Sliders, Smartphone } from 'lucide-react';
import { ArabicDialect } from '../types';

interface PresetItem {
  id: string;
  dialect: ArabicDialect;
  dialectLabel: string;
  flag: string;
  text: string;
  englishSummary: string;
  icon: React.ReactNode;
}

interface DialectPresetsProps {
  onSelectPreset: (text: string, dialect: ArabicDialect) => void;
  isArabicUI: boolean;
}

export const DialectPresets: React.FC<DialectPresetsProps> = ({ onSelectPreset, isArabicUI }) => {
  const presets: PresetItem[] = [
    {
      id: 'p1-sudanese-secure',
      dialect: 'sudanese' as any,
      dialectLabel: 'سوداني / يا زول',
      flag: '🇸🇩',
      text: 'يا زول افتح لي تطبيق بنكك وحول 5000',
      englishSummary: 'Trigger "يا زول" + Secure PIN Checkpoint Handling',
      icon: <Smartphone className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'p2-telephony-automation',
      dialect: 'saudi',
      dialectLabel: 'تلفوني / UI Automation',
      flag: '🇸🇦',
      text: 'تلفوني، شغل سورة الكهف واضغط حفظ في المفضلة',
      englishSummary: 'Trigger "تلفوني" + Dynamic UI Inspection & Auto Click',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'p3-mosaedi-settings',
      dialect: 'msa',
      dialectLabel: 'مساعدي / إعدادات',
      flag: '🌐',
      text: 'مساعدي، افتح الإعدادات وافحص الشاشة للواي فاي',
      englishSummary: 'Trigger "مساعدي" + Inspect screen nodes & Open Settings',
      icon: <Sliders className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'p4-sesame-whatsapp',
      dialect: 'egyptian',
      dialectLabel: 'افتح يا سمسم / مصري',
      flag: '🇪🇬',
      text: 'افتح يا سمسم، أرسل رسالة لعلي بالواتس أنا وصلت',
      englishSummary: 'Trigger "افتح يا سمسم" + WhatsApp automation',
      icon: <MessageCircle className="w-4 h-4 text-teal-400" />,
    },
    {
      id: 'p5-levant-multistep',
      dialect: 'levantine',
      dialectLabel: 'شامي / متعدد الخطوات',
      flag: '🇱🇧',
      text: 'علّي الصوت على الآخر واضبط لي المنبه على الساعة 7 الصبح',
      englishSummary: 'Multi-step: Maximize volume + set 7:00 AM alarm',
      icon: <Volume2 className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'p6-summary-screen',
      dialect: 'egyptian',
      dialectLabel: 'مصري / قراءة الشاشة',
      flag: '🇪🇬',
      text: 'اقرأ آخر رسايل الواتس ولخصهالي يا سنا',
      englishSummary: 'Read & summarize latest WhatsApp conversations',
      icon: <Eye className="w-4 h-4 text-rose-400" />,
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            {isArabicUI ? 'سيناريوهات وأوامر صوتية جاهزة للهجات' : 'Arabic Dialect Presets & Scenarios'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {isArabicUI ? 'انقر للاختبار الفوري' : 'Click to execute'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            id={`preset-btn-${preset.id}`}
            onClick={() => onSelectPreset(preset.text, preset.dialect)}
            className="p-3 bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-right transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                <span>{preset.flag}</span>
                <span>{preset.dialectLabel}</span>
              </span>
              <div className="p-1.5 rounded-lg bg-slate-900/90 group-hover:scale-110 transition-transform">
                {preset.icon}
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-200 leading-relaxed font-sans mb-1 line-clamp-2">
              &quot;{preset.text}&quot;
            </p>

            <span className="text-[10px] text-slate-400 line-clamp-1 font-mono text-left" dir="ltr">
              {preset.englishSummary}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
