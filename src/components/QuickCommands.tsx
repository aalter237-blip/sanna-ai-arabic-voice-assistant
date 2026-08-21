import React from 'react';
import { MessageCircle, Clock, Volume2, Eye, Sparkles } from 'lucide-react';
import { ArabicDialect } from '../types';

interface QuickCommandsProps {
  onSelectCommand: (text: string, dialect?: ArabicDialect) => void;
}

export const QuickCommands: React.FC<QuickCommandsProps> = ({ onSelectCommand }) => {
  const quickPills = [
    {
      id: 'pill-whatsapp',
      label: 'رسالة واتساب لوالدتي',
      prompt: 'أرسل رسالة لوالدتي بالواتس أنا في الطريق',
      icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'pill-alarm',
      label: 'منبه الساعة 7:00 ص',
      prompt: 'اضبط المنبه على الساعة 7:00 صباحاً',
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'pill-volume',
      label: 'أعلى صوت 100%',
      prompt: 'ارفع صوت الجهاز إلى 100%',
      icon: <Volume2 className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      id: 'pill-reader',
      label: 'اقرأ الشاشة الآن',
      prompt: 'اقرأ النصوص المعروضة على الشاشة الآن',
      icon: <Eye className="w-3.5 h-3.5 text-cyan-400" />,
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto py-2">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          أوامر سريعة بنقرة واحدة:
        </span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {quickPills.map((pill) => (
          <button
            key={pill.id}
            id={pill.id}
            onClick={() => onSelectCommand(pill.prompt)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 hover:border-slate-700 rounded-xl text-xs text-slate-200 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {pill.icon}
            <span className="font-medium">{pill.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
