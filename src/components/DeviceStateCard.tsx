import React from 'react';
import {
  ShieldCheck,
  Volume2,
  Wifi,
  WifiOff,
  Clock,
  Radio,
  Plus,
  BellRing,
} from 'lucide-react';

interface DeviceStateCardProps {
  volumeLevel: number;
  onVolumeChange: (vol: number) => void;
  wifiEnabled: boolean;
  onWifiToggle: () => void;
  alarms: { id: string; time: string; label: string; enabled: boolean }[];
  onToggleAlarm?: (id: string) => void;
  isArabicUI: boolean;
}

export const DeviceStateCard: React.FC<DeviceStateCardProps> = ({
  volumeLevel,
  onVolumeChange,
  wifiEnabled,
  onWifiToggle,
  alarms,
  onToggleAlarm,
  isArabicUI,
}) => {
  const wakeWords = ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isArabicUI ? 'التحكم بإعدادات الهاتف' : 'Device Quick Controls'}
            </h3>
            <p className="text-xs text-slate-400">
              {isArabicUI ? 'خدمة الوصول والأجهزة نشطة' : 'Accessibility & System Connected'}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isArabicUI ? 'متصل' : 'Active'}
        </span>
      </div>

      {/* Control Cards */}
      <div className="space-y-4">
        {/* 1. Media Volume Controller */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              {isArabicUI ? 'صوت الوسائط والتنبيهات' : 'Media & Alarm Volume'}
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-700/40">
              {volumeLevel}%
            </span>
          </div>

          <input
            id="volume-slider-device"
            type="range"
            min="0"
            max="100"
            value={volumeLevel}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{isArabicUI ? 'صامت (0%)' : 'Mute (0%)'}</span>
            <span>{isArabicUI ? 'أعلى صوت (100%)' : 'Max (100%)'}</span>
          </div>
        </div>

        {/* 2. Wi-Fi & Network Toggle */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                wifiEnabled
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                  : 'bg-rose-950/80 text-rose-400 border-rose-700/50'
              }`}
            >
              {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                {isArabicUI ? 'شبكة الواي فاي (Wi-Fi)' : 'Wi-Fi Network'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {wifiEnabled
                  ? isArabicUI
                    ? 'متصل بالإنترنت'
                    : 'Connected'
                  : isArabicUI
                  ? 'غير متصل'
                  : 'Disconnected'}
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-wifi-device"
            onClick={onWifiToggle}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              wifiEnabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {wifiEnabled ? (isArabicUI ? 'مفعّل' : 'On') : (isArabicUI ? 'معطل' : 'Off')}
          </button>
        </div>

        {/* 3. Active Alarms List */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              {isArabicUI ? 'المنبهات المجدولة' : 'Scheduled Alarms'}
            </span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-700/40">
              {alarms.length} {isArabicUI ? 'منبه' : 'Alarms'}
            </span>
          </div>

          <div className="space-y-2">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200">{alarm.time}</span>
                  <span className="text-slate-400 text-[11px]">({alarm.label})</span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    alarm.enabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {alarm.enabled ? (isArabicUI ? 'نشط' : 'Active') : (isArabicUI ? 'موقف' : 'Off')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wake Words Section */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            {isArabicUI ? 'كلمات التنبيه الصوتي المدعومة:' : 'Voice Wake Words:'}
          </span>
          <span className="text-[10px] text-cyan-400">بدون لمس</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {wakeWords.map((word, idx) => (
            <span
              key={idx}
              className="text-xs px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-800/50 text-purple-200 font-medium"
            >
              "{word}"
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
