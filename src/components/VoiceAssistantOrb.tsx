import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, Radio, CornerDownLeft, RefreshCw } from 'lucide-react';
import { OperatingMode, ArabicDialect } from '../types';

interface VoiceAssistantOrbProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  agentSpeech: string;
  mode: OperatingMode;
  dialect: ArabicDialect;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendMessage: (text: string) => void;
  isArabicUI: boolean;
}

export const VoiceAssistantOrb: React.FC<VoiceAssistantOrbProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcript,
  agentSpeech,
  mode,
  dialect,
  onStartListening,
  onStopListening,
  onSendMessage,
  isArabicUI,
}) => {
  const [inputText, setInputText] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient glow effect */}
      <div
        className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening
            ? 'bg-cyan-500/25'
            : isProcessing
            ? 'bg-amber-500/25'
            : isSpeaking
            ? 'bg-teal-500/25'
            : 'bg-indigo-500/10'
        }`}
      />
      <div
        className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening
            ? 'bg-indigo-500/25'
            : isProcessing
            ? 'bg-cyan-500/25'
            : isSpeaking
            ? 'bg-emerald-500/25'
            : 'bg-slate-800/10'
        }`}
      />

      {/* Top Status Bar */}
      <div className="flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isListening
                  ? 'bg-rose-400'
                  : isProcessing
                  ? 'bg-amber-400'
                  : isSpeaking
                  ? 'bg-teal-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isListening
                  ? 'bg-rose-500'
                  : isProcessing
                  ? 'bg-amber-500'
                  : isSpeaking
                  ? 'bg-teal-500'
                  : 'bg-cyan-500'
              }`}
            />
          </span>
          <span className="text-xs font-semibold text-slate-300">
            {isListening
              ? isArabicUI
                ? 'أستمع إليك الآن...'
                : 'Listening to your voice...'
              : isProcessing
              ? isArabicUI
                ? 'جاري التحليل واستخراج الأوامر...'
                : 'Processing Arabic intent...'
              : isSpeaking
              ? isArabicUI
                ? 'سنا تتحدث بالصوت...'
                : 'Sanna is speaking...'
              : isArabicUI
              ? 'سنا جاهزة ومستعدة'
              : 'Sanna Ready'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/90 text-cyan-300 border border-slate-700/60 font-mono">
            {mode === 'online' ? 'Gemini 3.7 Flash' : 'Edge SLM (Offline)'}
          </span>
          {dialect !== 'auto' && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
              {dialect}
            </span>
          )}
        </div>
      </div>

      {/* Central Visual Voice Orb */}
      <div className="flex flex-col items-center justify-center my-6 z-10">
        <div className="relative flex items-center justify-center">
          {/* Animated Ring 1 */}
          <div
            className={`absolute w-44 h-44 rounded-full border border-cyan-500/30 transition-all duration-1000 ${
              isListening
                ? 'scale-125 animate-pulse border-cyan-400/60'
                : isProcessing
                ? 'scale-110 animate-spin border-amber-400/40'
                : isSpeaking
                ? 'scale-120 animate-ping border-teal-400/40'
                : 'scale-100 opacity-30'
            }`}
          />

          {/* Animated Ring 2 */}
          <div
            className={`absolute w-36 h-36 rounded-full border border-indigo-500/40 transition-all duration-700 ${
              isListening
                ? 'scale-110 border-rose-400/50'
                : isSpeaking
                ? 'scale-115 border-cyan-300/50'
                : 'scale-95 opacity-40'
            }`}
          />

          {/* Main Glowing Core Button */}
          <button
            id="mic-core-button"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isProcessing}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-500 scale-105 shadow-rose-500/50 text-white animate-bounce'
                : isProcessing
                ? 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-cyan-500 shadow-amber-500/50 text-slate-950 scale-95'
                : isSpeaking
                ? 'bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500 shadow-teal-500/50 text-slate-950 scale-105'
                : 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-teal-400 hover:scale-105 shadow-cyan-500/40 text-slate-950'
            }`}
          >
            {isListening ? (
              <MicOff className="w-9 h-9" />
            ) : isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : isSpeaking ? (
              <Volume2 className="w-9 h-9 animate-pulse" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
            <span className="text-[11px] font-bold mt-1 tracking-tight">
              {isListening
                ? isArabicUI
                  ? 'إيقاف'
                  : 'Stop'
                : isProcessing
                ? isArabicUI
                  ? 'تحليل...'
                  : 'Thinking...'
                : isSpeaking
                ? isArabicUI
                  ? 'تحدث'
                  : 'Speaking'
                : isArabicUI
                ? 'تحدث مع سنا'
                : 'Talk to Sanna'}
            </span>
          </button>
        </div>

        {/* Audio Wave Bars visualizer */}
        <div className="flex items-center gap-1.5 h-8 mt-5">
          {[24, 45, 68, 30, 85, 55, 90, 40, 70, 32, 60, 20].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-gradient-to-t from-cyan-500 to-rose-400 animate-pulse'
                  : isSpeaking
                  ? 'bg-gradient-to-t from-teal-400 to-cyan-300 animate-pulse'
                  : isProcessing
                  ? 'bg-amber-400/80 animate-pulse'
                  : 'bg-slate-700/50 h-2'
              }`}
              style={{
                height:
                  isListening || isSpeaking || isProcessing
                    ? `${Math.max(6, (height * ((i % 3) + 1)) / 3)}px`
                    : '4px',
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Live Conversation Cards (Transcript & Agent Speech) */}
      <div className="space-y-3 z-10 mb-4">
        {/* User Input Bubble */}
        {transcript && (
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-3.5 text-sm text-cyan-200 flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {isArabicUI ? 'صوتك (مدخلات الكلام):' : 'Voice Input (STT):'}
              </span>
              <p className="font-medium leading-relaxed font-sans">{transcript}</p>
            </div>
          </div>
        )}

        {/* Sanna Vocal Speech Output */}
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-800/90 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-4 text-sm text-slate-100 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabicUI ? 'رد سنا الصوتي:' : 'Sanna Vocal Response:'}</span>
            </div>
            {isSpeaking && (
              <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-600/40 flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse" />
                {isArabicUI ? 'صوت ar-SA نشط' : 'Arabic TTS Active'}
              </span>
            )}
          </div>
          <p className="font-medium text-slate-200 leading-relaxed font-sans text-base">
            {agentSpeech ||
              (isArabicUI
                ? 'مرحباً بك! أنا سنا، مساعدك الذكي لنظام أندرويد. اضغط على زر الميكروفون أو اختر أمراً لتنفيذه فوراً.'
                : 'Welcome! I am Sanna, your Arabic Android Assistant. Tap the mic or type a command to execute actions in real-time.')}
          </p>
        </div>
      </div>

      {/* Fast Command Input Field */}
      <form onSubmit={handleFormSubmit} className="relative z-10">
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-2xl p-1.5 focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
          <input
            id="voice-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isArabicUI
                ? 'أو اكتب أمراً صوتياً بالعربية هنا (مثال: أرسل رسالة لأمي بالواتساب)...'
                : 'Or type an Arabic command (e.g. أرسل رسالة لوالدتي في الواتس)...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            dir={isArabicUI ? 'rtl' : 'auto'}
          />

          <button
            id="send-command-btn"
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            title="Execute Command"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
