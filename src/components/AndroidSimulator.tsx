import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  MessageCircle,
  Settings,
  Clock,
  Camera,
  MapPin,
  Globe,
  Youtube,
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Volume2,
  VolumeX,
  Sliders,
  CheckCheck,
  Bell,
  Search,
  Mic,
  Smile,
  Paperclip,
  Check,
  Eye,
  Smartphone,
  Shield,
  Lock,
  Play,
  Pause,
  Star,
  Music,
  Share2,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AppScreen, WhatsAppChat, WhatsAppMessage } from '../types';

interface AndroidSimulatorProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  activeChatRecipient: string;
  onSelectChat: (recipient: string) => void;
  volumeLevel: number;
  onVolumeChange: (vol: number) => void;
  wifiEnabled: boolean;
  onWifiToggle: () => void;
  alarms: { id: string; time: string; label: string; enabled: boolean }[];
  onToggleAlarm?: (id: string) => void;
  whatsappChats: WhatsAppChat[];
  onSendMessage: (chatId: string, text: string) => void;
  activeTapPoint: { x: number; y: number; label?: string } | null;
  highlightedElement: string | null;
  isArabicUI?: boolean;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  currentScreen,
  onScreenChange,
  activeChatRecipient,
  onSelectChat,
  volumeLevel,
  onVolumeChange,
  wifiEnabled,
  onWifiToggle,
  alarms,
  onToggleAlarm,
  whatsappChats,
  onSendMessage,
  activeTapPoint,
  highlightedElement,
}) => {
  const [currentTime, setCurrentTime] = useState('10:42');
  const [chatInputText, setChatInputText] = useState('');
  const [isPlayingQuran, setIsPlayingQuran] = useState(true);
  const [isQuranSaved, setIsQuranSaved] = useState(false);
  const [bankPin, setBankPin] = useState('');
  const [showNotificationShade, setShowNotificationShade] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeChat =
    whatsappChats.find(
      (c) => c.name.includes(activeChatRecipient) || c.id === activeChatRecipient
    ) || whatsappChats[0];

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputText.trim() && activeChat) {
      onSendMessage(activeChat.id, chatInputText.trim());
      setChatInputText('');
    }
  };

  const handlePinClick = (digit: string) => {
    if (bankPin.length < 4) {
      setBankPin((prev) => prev + digit);
    }
  };

  const handleClearPin = () => {
    setBankPin('');
  };

  return (
    <div className="flex flex-col items-center justify-center p-1 w-full" dir="rtl">
      {/* Device Chassis Frame */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] h-[690px] bg-slate-950 rounded-[46px] p-3 border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between select-none">
        
        {/* Dynamic Tap Ripple Animation when Sanna performs Accessibility click */}
        {activeTapPoint && (
          <div
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `${activeTapPoint.x}%`, top: `${activeTapPoint.y}%` }}
          >
            <div className="w-12 h-12 rounded-full bg-cyan-400/50 border-2 border-cyan-300 animate-ping" />
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-cyan-500/90 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-[11px] text-slate-950 font-bold">
              ✓
            </div>
            {activeTapPoint.label && (
              <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-950/95 text-cyan-300 text-[10px] px-2.5 py-1 rounded-lg border border-cyan-500/50 whitespace-nowrap shadow-xl font-bold">
                {activeTapPoint.label}
              </span>
            )}
          </div>
        )}

        {/* Punch-hole camera */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 rounded-full border border-slate-800/80 z-40 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
        </div>

        {/* Volume OSD Overlay if changed */}
        <div className="absolute top-14 left-3 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 flex items-center gap-2 shadow-xl">
          {volumeLevel > 0 ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          )}
          <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${volumeLevel}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-300 font-bold">{volumeLevel}%</span>
        </div>

        {/* Inner Screen Display */}
        <div className="w-full h-full bg-slate-900 rounded-[36px] overflow-hidden flex flex-col justify-between relative border border-slate-800/80">
          
          {/* Status Bar */}
          <div
            onClick={() => setShowNotificationShade(!showNotificationShade)}
            className="px-5 pt-3 pb-1.5 flex items-center justify-between text-xs text-slate-300 z-30 select-none cursor-pointer hover:bg-slate-800/30 transition-colors"
            title="انقر لفتح/إغلاق لوحة الإشعارات"
          >
            <span className="font-semibold text-[11px] font-mono">{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1 bg-cyan-900/60 text-cyan-300 rounded">
                5G
              </span>
              {wifiEnabled ? (
                <Wifi className="w-3 h-3 text-cyan-400" />
              ) : (
                <Signal className="w-3 h-3 text-slate-500" />
              )}
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* NOTIFICATION SHADE OVERLAY */}
          {showNotificationShade && (
            <div className="absolute inset-0 bg-slate-950/95 z-40 p-4 pt-10 flex flex-col justify-between backdrop-blur-md animate-fadeIn">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    لوحة الإشعارات
                  </span>
                  <button
                    onClick={() => setShowNotificationShade(false)}
                    className="text-[11px] text-cyan-400 font-semibold"
                  >
                    إغلاق
                  </button>
                </div>

                {/* Sanna Background Listener Notification */}
                <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-3 shadow-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-cyan-300">سنا (Sanna Voice Agent)</h5>
                    <p className="text-[10px] text-slate-400">الاستماع لكلمة الاستيقاظ نشط ("يا زول"، "تلفوني")</p>
                  </div>
                </div>

                {/* WhatsApp Notification */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-white">واتساب: أمي</h5>
                    <p className="text-[10px] text-slate-300">وصلت البيت ولا لسه؟</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotificationShade(false);
                      onSelectChat('أمي');
                      onScreenChange('whatsapp_chat');
                    }}
                    className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-lg font-bold"
                  >
                    رد
                  </button>
                </div>
              </div>

              <div className="text-center py-2">
                <button
                  onClick={() => setShowNotificationShade(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  سحب للأعلى للإغلاق ↑
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 1: HOME SCREEN */}
          {currentScreen === 'home' && (
            <div className="flex-1 flex flex-col justify-between p-4 z-10 select-none animate-fadeIn">
              {/* Date & Weather Widget */}
              <div className="mt-2 text-center">
                <h2 className="text-3xl font-light text-white tracking-tight font-mono">
                  {currentTime}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">الخميس، 22 أغسطس</p>
                <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-cyan-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                  <span>☀️ 33°C - مشمس</span>
                </div>
              </div>

              {/* Google Search Bar Mock */}
              <div className="my-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3.5 py-2 flex items-center justify-between text-xs text-slate-400 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-400 text-sm">G</span>
                  <span>بحث في الهاتف...</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>

              {/* App Icons Grid */}
              <div className="grid grid-cols-4 gap-3 my-auto px-1">
                {/* WhatsApp */}
                <button
                  id="app-icon-whatsapp"
                  onClick={() => onScreenChange('whatsapp')}
                  className={`flex flex-col items-center gap-1 group transition-transform active:scale-90 ${
                    highlightedElement === 'com.whatsapp' ? 'ring-2 ring-emerald-400 rounded-2xl p-1 bg-emerald-950/40' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">واتساب</span>
                </button>

                {/* Bank App (Bankak / Secure) */}
                <button
                  id="app-icon-bankak"
                  onClick={() => onScreenChange('bank_app')}
                  className={`flex flex-col items-center gap-1 group transition-transform active:scale-90 ${
                    highlightedElement === 'com.bok.bankak' ? 'ring-2 ring-amber-400 rounded-2xl p-1 bg-amber-950/40' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">بنكك</span>
                </button>

                {/* Settings */}
                <button
                  id="app-icon-settings"
                  onClick={() => onScreenChange('settings')}
                  className={`flex flex-col items-center gap-1 group transition-transform active:scale-90 ${
                    highlightedElement === 'com.android.settings' ? 'ring-2 ring-cyan-400 rounded-2xl p-1 bg-cyan-950/40' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-white shadow-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">الإعدادات</span>
                </button>

                {/* Clock / Alarms */}
                <button
                  id="app-icon-clock"
                  onClick={() => onScreenChange('clock')}
                  className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">الساعة</span>
                </button>

                {/* Quran / Audio Player */}
                <button
                  id="app-icon-quran"
                  onClick={() => onScreenChange('quran_player')}
                  className={`flex flex-col items-center gap-1 group transition-transform active:scale-90 ${
                    highlightedElement === 'com.quran.audio' ? 'ring-2 ring-emerald-400 rounded-2xl p-1 bg-emerald-950/40' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">القرآن</span>
                </button>

                {/* Screen Reader Inspector App */}
                <button
                  id="app-icon-screen-reader"
                  onClick={() => onScreenChange('screen_reader')}
                  className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">قارئ الشاشة</span>
                </button>

                {/* Camera */}
                <button
                  id="app-icon-camera"
                  onClick={() => onScreenChange('camera')}
                  className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-white shadow-lg">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">الكاميرا</span>
                </button>

                {/* Maps */}
                <button
                  id="app-icon-maps"
                  onClick={() => onScreenChange('maps')}
                  className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-200 font-medium">الخرائط</span>
                </button>
              </div>

              {/* Bottom Dock */}
              <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-2 flex items-center justify-around border border-slate-700/50">
                <button
                  onClick={() => onScreenChange('whatsapp')}
                  className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onScreenChange('bank_app')}
                  className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md active:scale-90 transition-transform"
                >
                  <Shield className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onScreenChange('settings')}
                  className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onScreenChange('screen_reader')}
                  className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md active:scale-90 transition-transform"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: WHATSAPP CHAT LIST */}
          {currentScreen === 'whatsapp' && (
            <div className="flex-1 flex flex-col bg-slate-950 select-none animate-fadeIn">
              <div className="bg-emerald-800 px-4 py-3 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <button onClick={() => onScreenChange('home')} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-sm tracking-wide">WhatsApp</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-200" />
                  <MoreVertical className="w-4 h-4 text-slate-200" />
                </div>
              </div>

              <div className="bg-emerald-800/90 text-xs flex text-slate-200 border-b border-emerald-900/50">
                <div className="flex-1 py-2 text-center font-bold border-b-2 border-emerald-300 text-white">
                  الدردشات
                </div>
                <div className="flex-1 py-2 text-center text-slate-300">الحالة</div>
                <div className="flex-1 py-2 text-center text-slate-300">المكالمات</div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                {whatsappChats.map((chat) => (
                  <div
                    key={chat.id}
                    id={`whatsapp-chat-row-${chat.id}`}
                    onClick={() => {
                      onSelectChat(chat.name);
                      onScreenChange('whatsapp_chat');
                    }}
                    className={`px-3.5 py-3 flex items-center justify-between hover:bg-slate-900/80 cursor-pointer transition-all ${
                      highlightedElement === chat.name || highlightedElement === chat.id
                        ? 'bg-emerald-950/70 ring-2 ring-emerald-400'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
                        style={{ backgroundColor: chat.avatarColor }}
                      >
                        {chat.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{chat.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[160px]">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="text-left" dir="ltr">
                      <span className="text-[10px] text-slate-500 font-mono">{chat.time}</span>
                      {chat.unreadCount > 0 && (
                        <span className="block mt-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold rounded-full text-[9px] text-center leading-4">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 3: ACTIVE WHATSAPP CHAT CONVERSATION */}
          {currentScreen === 'whatsapp_chat' && (
            <div className="flex-1 flex flex-col bg-slate-950 animate-fadeIn">
              <div className="bg-emerald-800 px-3 py-2.5 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <button onClick={() => onScreenChange('whatsapp')} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                    style={{ backgroundColor: activeChat.avatarColor }}
                  >
                    {activeChat.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{activeChat.name}</h4>
                    <span className="text-[10px] text-emerald-200">متصل الآن</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4" />
                  <Phone className="w-4 h-4" />
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              {/* Chat Messages Wall */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[82%] rounded-2xl px-3 py-2 text-xs shadow-md ${
                      msg.isOutgoing
                        ? 'mr-auto bg-emerald-700 text-white rounded-bl-sm'
                        : 'ml-auto bg-slate-800 text-slate-100 rounded-br-sm border border-slate-700/50'
                    }`}
                  >
                    <p className="font-sans leading-relaxed text-[12px]">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-300">
                      <span>{msg.time}</span>
                      {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleManualSend}
                className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5"
              >
                <div className="flex-1 bg-slate-800 rounded-full px-3 py-1.5 flex items-center gap-2 border border-slate-700">
                  <Smile className="w-4 h-4 text-slate-400" />
                  <input
                    id="com.whatsapp:id/entry"
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="اكتب رسالة..."
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    dir="rtl"
                  />
                  <Paperclip className="w-4 h-4 text-slate-400" />
                </div>

                <button
                  id="com.whatsapp:id/send"
                  type="submit"
                  className={`w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-all ${
                    highlightedElement === 'com.whatsapp:id/send'
                      ? 'ring-4 ring-cyan-400 scale-110 bg-cyan-500 text-slate-950'
                      : ''
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 4: BANK APP - SECURE PIN CHECKPOINT */}
          {currentScreen === 'bank_app' && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white p-4 space-y-3 select-none animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <button onClick={() => onScreenChange('home')} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    تطبيق بنكك (Bankak)
                  </h3>
                </div>
                <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  🔐 نقطة أمان
                </span>
              </div>

              {/* Secure Notice */}
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-3 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  حماية الأمان المصرفي
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  فتحت ليك الصفحة، يرجى إدخال الرمز السري بنفسك للاستمرار بأمان.
                </p>
              </div>

              {/* Account Card Mock */}
              <div className="bg-gradient-to-tr from-amber-600/90 to-yellow-500/90 text-slate-950 rounded-2xl p-3.5 shadow-lg">
                <span className="text-[10px] font-bold text-slate-900 block">الرصيد المتاح:</span>
                <h4 className="text-xl font-bold font-mono my-0.5">125,450.00 SDG</h4>
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-900 mt-1">
                  <span>حساب جاري: **** 8421</span>
                  <span>بنك الخرطوم</span>
                </div>
              </div>

              {/* PIN Code Dots Display */}
              <div className="text-center py-1">
                <span className="text-xs text-slate-300 block mb-1 font-medium">أدخل رمز الأمان (PIN):</span>
                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border border-slate-600 transition-all ${
                        bankPin.length > idx ? 'bg-amber-400 border-amber-300 scale-110' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* PIN Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 px-4 py-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') handleClearPin();
                      else if (key === '✓') {
                        if (bankPin.length === 4) alert('تم تأكيد التحويل بأمان!');
                      } else {
                        handlePinClick(key);
                      }
                    }}
                    className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold text-slate-200 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 5: QURAN / AUDIO PLAYER */}
          {currentScreen === 'quran_player' && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white p-4 space-y-4 select-none animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onScreenChange('home')} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-sm text-emerald-400">المشغل الصوتي (Quran Player)</h3>
                </div>
                <button
                  id="btn-favorite-quran"
                  onClick={() => setIsQuranSaved(!isQuranSaved)}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl border transition-all ${
                    isQuranSaved
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isQuranSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isQuranSaved ? 'تم الحفظ' : 'حفظ في المفضلة'}</span>
                </button>
              </div>

              {/* Album Art Mock */}
              <div className="w-36 h-36 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-900 via-slate-800 to-teal-950 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-950/50">
                <Music className="w-14 h-14 text-emerald-400 animate-pulse" />
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-white">سورة الكهف</h4>
                <p className="text-xs text-slate-400">بصوت القارئ ماهر المعيقلي</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-1/3" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>08:45</span>
                  <span>26:30</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setIsPlayingQuran(!isPlayingQuran)}
                  className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlayingQuran ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 6: SETTINGS & ACCESSIBILITY */}
          {currentScreen === 'settings' && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white p-4 space-y-3.5 overflow-y-auto select-none animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button onClick={() => onScreenChange('home')} className="p-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-sm">إعدادات النظام (Settings)</h3>
              </div>

              {/* Sanna Accessibility Status Card */}
              <div className="bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/40 rounded-2xl p-3.5 shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-300">خدمة سنا للتحكم التلقائي</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-semibold">
                    مفعّلة (Active)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  خدمة إمكانية الوصول التلقائية للتحكم بالنظام، النقر، وقراءة نصوص الشاشة.
                </p>
              </div>

              {/* Wi-Fi Control */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">الواي فاي (Wi-Fi)</h4>
                    <span className="text-[10px] text-slate-400">
                      {wifiEnabled ? 'متصل بـ Home_5G' : 'معطّل'}
                    </span>
                  </div>
                </div>
                <button
                  id="toggle-wifi-switch"
                  onClick={onWifiToggle}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    wifiEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      wifiEnabled ? 'transform translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider Control */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold">صوت الوسائط (Media Volume)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">{volumeLevel}%</span>
                </div>
                <input
                  id="com.android.settings:id/volume_slider"
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevel}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Bluetooth */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">البلوتوث (Bluetooth)</h4>
                    <span className="text-[10px] text-slate-400">متصل بسماعات الرأس</span>
                  </div>
                </div>
                <span className="text-[10px] text-indigo-300 font-bold bg-indigo-950 px-2 py-1 rounded-md">
                  ON
                </span>
              </div>
            </div>
          )}

          {/* SCREEN 7: CLOCK & ALARMS */}
          {currentScreen === 'clock' && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white p-4 space-y-3 select-none animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button onClick={() => onScreenChange('home')} className="p-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-sm">المنبه والمؤقت (Alarms)</h3>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-sm cursor-pointer"
                    onClick={() => onToggleAlarm && onToggleAlarm(alarm.id)}
                  >
                    <div>
                      <span className="text-xl font-bold font-mono text-cyan-300">{alarm.time}</span>
                      <p className="text-[11px] text-slate-400">{alarm.label}</p>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        alarm.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          alarm.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 8: CAMERA */}
          {currentScreen === 'camera' && (
            <div className="flex-1 flex flex-col bg-black text-white justify-between p-3 select-none animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                <button onClick={() => onScreenChange('home')} className="p-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full">HDR AUTO</span>
                <RotateCcw className="w-4 h-4" />
              </div>

              {/* Viewfinder Mock */}
              <div className="flex-1 flex items-center justify-center relative border border-slate-800 rounded-3xl m-2 overflow-hidden bg-slate-900/50">
                <div className="absolute w-24 h-24 border border-white/40 rounded-2xl" />
                <span className="text-xs text-slate-400">معاينة الكاميرا المباشرة</span>
              </div>

              {/* Shutter Button */}
              <div className="flex items-center justify-around py-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800" />
                <button className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform">
                  <div className="w-full h-full bg-white rounded-full" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 9: MAPS */}
          {currentScreen === 'maps' && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white p-3 space-y-3 select-none animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button onClick={() => onScreenChange('home')} className="p-1">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-xs text-rose-400">خرائط Google (Maps)</h3>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-2.5 flex items-center gap-2 border border-slate-700 text-xs">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">طريق الملك فهد، الرياض</span>
              </div>

              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative p-4 text-center">
                <MapPin className="w-10 h-10 text-rose-500 animate-bounce mb-2" />
                <span className="text-xs font-bold text-slate-200">الوجهة: العمل</span>
                <span className="text-[10px] text-cyan-400 font-mono mt-1">18 دقيقة (12.4 كم)</span>
              </div>
            </div>
          )}

          {/* SCREEN 10: SCREEN READER LIVE INSPECTOR */}
          {currentScreen === 'screen_reader' && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white p-3 space-y-2 select-none animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => onScreenChange('home')} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-xs text-cyan-300">فاحص الشاشة (Accessibility)</h3>
                </div>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                  Live OCR
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] space-y-1.5 font-mono text-slate-300 flex-1 overflow-y-auto">
                <div className="text-cyan-400 font-bold text-[10px]">
                  [Active Window: {currentScreen}]
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400">Node:</span> TextView &quot;الخميس، 22 أغسطس&quot;
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400">Node:</span> Button &quot;واتساب&quot; (id: com.whatsapp)
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400">Node:</span> Button &quot;بنكك&quot; (id: com.bok.bankak)
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-emerald-400">Node:</span> Seekbar &quot;volume_slider&quot; (value: {volumeLevel}%)
                </div>
              </div>
            </div>
          )}

          {/* Android Navigation Bar (Back, Home, Recents) */}
          <div className="px-8 py-2 bg-slate-950 border-t border-slate-900 flex items-center justify-around text-slate-500 z-30 select-none">
            {/* Recents */}
            <button
              id="nav-recents"
              onClick={() => onScreenChange('home')}
              className="p-2 hover:text-cyan-400 transition-colors"
              title="التطبيقات الحديثة"
            >
              <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
            </button>

            {/* Home */}
            <button
              id="nav-home"
              onClick={() => onScreenChange('home')}
              className="p-2 hover:text-cyan-400 transition-colors"
              title="الشاشة الرئيسية"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
            </button>

            {/* Back */}
            <button
              id="nav-back"
              onClick={() => onScreenChange('home')}
              className="p-2 hover:text-cyan-400 transition-colors"
              title="الرجوع"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
