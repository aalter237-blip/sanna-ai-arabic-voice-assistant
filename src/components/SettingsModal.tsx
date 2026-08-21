import React, { useState } from 'react';
import {
  X,
  Key,
  Volume2,
  Radio,
  Sliders,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  AlertCircle,
  Play,
  User,
  Phone,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { OperatingMode, ArabicDialect } from '../types';
import { voiceAudio } from '../services/audio-service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: string[];
  onAddApiKey: (key: string) => void;
  onRemoveApiKey: (index: number) => void;
  activeApiKeyIndex: number;
  onSelectActiveKey: (index: number) => void;
  mode: OperatingMode;
  onModeChange: (mode: OperatingMode) => void;
  dialect: ArabicDialect;
  onDialectChange: (dialect: ArabicDialect) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  speechPitch: number;
  onSpeechPitchChange: (pitch: number) => void;
  wakeWords: string[];
  onAddWakeWord: (word: string) => void;
  onRemoveWakeWord: (index: number) => void;
  soundEffects: boolean;
  onToggleSoundEffects: () => void;
  bgOpacity: number;
  onBgOpacityChange: (opacity: number) => void;
  onCustomBgUpload?: (dataUrl: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onAddApiKey,
  onRemoveApiKey,
  activeApiKeyIndex,
  onSelectActiveKey,
  mode,
  onModeChange,
  dialect,
  onDialectChange,
  speechRate,
  onSpeechRateChange,
  speechPitch,
  onSpeechPitchChange,
  wakeWords,
  onAddWakeWord,
  onRemoveWakeWord,
  soundEffects,
  onToggleSoundEffects,
  bgOpacity,
  onBgOpacityChange,
  onCustomBgUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'voice' | 'wakewords' | 'background' | 'automation'>('keys');

  // New API Key Input State
  const [newKeyInput, setNewKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // New Wake Word Input State
  const [newWakeWordInput, setNewWakeWordInput] = useState('');

  if (!isOpen) return null;

  const handleTestAndAddKey = async () => {
    if (!newKeyInput.trim()) return;

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const { verifyGeminiKey } = await import('../services/gemini-direct');
      await verifyGeminiKey(newKeyInput.trim());
      setTestResult({ success: true, message: 'تم التحقق من المفتاح بنجاح!' });
      onAddApiKey(newKeyInput.trim());
      setNewKeyInput('');
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'تعذر الاتصال بخادم الفحص. يرجى التأكد من المفتاح.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleAddKeyDirectly = () => {
    if (newKeyInput.trim()) {
      onAddApiKey(newKeyInput.trim());
      setNewKeyInput('');
      setTestResult({ success: true, message: 'تمت إضافة المفتاح بنجاح.' });
    }
  };

  const handleAddNewWakeWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWakeWordInput.trim()) {
      onAddWakeWord(newWakeWordInput.trim());
      setNewWakeWordInput('');
    }
  };

  const handleTestSpeech = () => {
    voiceAudio.speakArabic('مرحباً بك! هذه تجربة لجودة وسرعة الصوت المحددة.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">إعدادات المساعد الصوتي</h2>
              <p className="text-[11px] text-slate-400">تخصيص المفاتيح، الصوت، والذكاء الاصطناعي</p>
            </div>
          </div>

          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/40 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'keys'
                ? 'text-cyan-400 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>مفاتيح API</span>
            {apiKeys.length > 0 && (
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded-full border border-cyan-800/40">
                {apiKeys.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'voice'
                ? 'text-cyan-400 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>الصوت والنطق</span>
          </button>

          <button
            onClick={() => setActiveTab('wakewords')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'wakewords'
                ? 'text-cyan-400 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>كلمات التنبيه</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'background'
                ? 'text-cyan-400 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>الخلفية والتعتيم</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'automation'
                ? 'text-cyan-400 border-cyan-400 bg-slate-900/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>الوضع والذكاء</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-200">
          {/* TAB: BACKGROUND & OPACITY */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  خلفية التطبيق وتعتيم الشاشة:
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">درجة عتمة وشفافية الخلفية:</span>
                    <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                      {Math.round(bgOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={bgOpacity}
                    onChange={(e) => onBgOpacityChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>صورة واضحة وساطعة</span>
                    <span>متوازنة ومريحة للعين</span>
                    <span>عتمة هادئة</span>
                  </div>
                </div>

                {onCustomBgUpload && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-700 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تغيير صورة الخلفية من جهازك</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                onCustomBgUpload(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    إضافة مفتاح Gemini API جديد:
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    الحصول على مفتاح مجاني ↗
                  </a>
                </div>

                <div className="relative">
                  <input
                    id="input-api-key"
                    type={showKeyText ? 'text' : 'password'}
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    placeholder="الصق مفتاحك هنا (يبدأ عادة بـ AIzaSy...)"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 pr-3 pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Feedback message */}
                {testResult && (
                  <div
                    className={`text-xs p-2.5 rounded-xl flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-700/50 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="btn-test-add-key"
                    onClick={handleTestAndAddKey}
                    disabled={!newKeyInput.trim() || isTestingKey}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    {isTestingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري التحقق والربط...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>فحص وإضافة المفتاح</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-save-key-direct"
                    onClick={handleAddKeyDirectly}
                    disabled={!newKeyInput.trim() || isTestingKey}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    حفظ مباشر
                  </button>
                </div>
              </div>

              {/* Saved Keys List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">المفاتيح المسجلة (التدوير التلقائي):</h4>

                {apiKeys.length === 0 ? (
                  <div className="text-xs text-slate-400 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-center">
                    يتم حالياً استخدام مفاتيح النظام الافتراضية السحابية المدمجة. يمكنك إضافة مفتاحك الخاص للحصول على أداء أعلى وأولوية قصوى.
                  </div>
                ) : (
                  apiKeys.map((k, idx) => {
                    const masked = k.slice(0, 6) + '••••••••••••' + k.slice(-4);
                    const isActive = idx === activeApiKeyIndex;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-xs ${
                          isActive
                            ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => onSelectActiveKey(idx)}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${
                              isActive
                                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                                : 'border-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <div>
                            <span className="font-mono font-bold">{masked}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {isActive ? 'المفتاح النشط حالياً' : `مفتاح رقم ${idx + 1}`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveApiKey(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="حذف المفتاح"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VOICE & SPEECH */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              {/* Speech Rate */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">سرعة تحدث المساعد الصوتي:</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                    {speechRate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>أهدأ وأبطأ (0.7x)</span>
                  <span>طبيعي (1.0x)</span>
                  <span>أسرع (1.4x)</span>
                </div>
              </div>

              {/* Speech Pitch */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">نبرة وحدّة الصوت:</span>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-800/40">
                    {speechPitch}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => onSpeechPitchChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>عميق / رخيم</span>
                  <span>طبيعي ومتوازن</span>
                  <span>أعلى وأوضح</span>
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">نغمات التأكيد والتنبيه الصوتية</h4>
                  <p className="text-[11px] text-slate-400">إصدار صوت رنين خفيف عند الاستماع وإتمام الأوامر</p>
                </div>
                <button
                  onClick={onToggleSoundEffects}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    soundEffects
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {soundEffects ? 'مفعّل' : 'معطل'}
                </button>
              </div>

              {/* Test Audio Button */}
              <button
                onClick={handleTestSpeech}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                <span>تجربة صوت المساعد الآن</span>
              </button>
            </div>
          )}

          {/* TAB 3: WAKE WORDS */}
          {activeTab === 'wakewords' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNewWakeWord} className="flex gap-2">
                <input
                  type="text"
                  value={newWakeWordInput}
                  onChange={(e) => setNewWakeWordInput(e.target.value)}
                  placeholder="أضف كلمة تنبيه صوتية (مثال: مرحباً مساعدي)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!newWakeWordInput.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
              </form>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">كلمات التنبيه النشطة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {wakeWords.map((word, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-semibold text-slate-200">"{word}"</span>
                      </div>
                      <button
                        onClick={() => onRemoveWakeWord(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTOMATION & OPERATING MODE */}
          {activeTab === 'automation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onModeChange('online')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                    mode === 'online'
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">الذكاء السحابي (Gemini)</span>
                    {mode === 'online' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    فهم عميق لكافة اللهجات العربية، سياق المحادثة المتقدم، وأتمتة شاملة.
                  </p>
                </button>

                <button
                  onClick={() => onModeChange('offline')}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                    mode === 'offline'
                      ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">الوضع المحلي (Edge SLM)</span>
                    {mode === 'offline' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    استجابة فورية بدون إنترنت، استهلاك صفر للبيانات، وأمان تام.
                  </p>
                </button>
              </div>

              {/* Preferred Dialect */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-slate-200">اللهجة العربية المفضلة:</span>
                <select
                  value={dialect}
                  onChange={(e) => onDialectChange(e.target.value as ArabicDialect)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="auto">🌐 التعرف التلقائي على كافة اللهجات</option>
                  <option value="saudi">🇸🇦 اللهجة السعودية والخليجية</option>
                  <option value="egyptian">🇪🇬 اللهجة المصرية</option>
                  <option value="levantine">🇱🇧 اللهجة الشامية</option>
                  <option value="maghrebi">🇲🇦 اللهجة المغاربية</option>
                  <option value="msa">العربية الفصحى الحديثة</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            id="close-settings-footer-btn"
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
