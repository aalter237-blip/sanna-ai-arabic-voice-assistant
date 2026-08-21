import React, { useState } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, Radio, Loader2 } from 'lucide-react';
import { ArabicDialect } from '../types';

interface VoiceAssistantOrbProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  agentSpeech: string;
  dialect: ArabicDialect;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendMessage: (text: string) => void;
}

export const VoiceAssistantOrb: React.FC<VoiceAssistantOrbProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcript,
  agentSpeech,
  onStartListening,
  onStopListening,
  onSendMessage,
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
    <div className="w-full flex flex-col items-center justify-between text-center relative py-2">
      {/* Dynamic Background Glow Effect */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening
            ? 'bg-rose-500/25 scale-125'
            : isProcessing
            ? 'bg-amber-500/25 scale-110'
            : isSpeaking
            ? 'bg-cyan-500/25 scale-125'
            : 'bg-indigo-500/15 scale-100'
        }`}
      />

      {/* Status Badge */}
      <div className="z-10 mb-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-sm">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isListening
                ? 'bg-rose-400'
                : isProcessing
                ? 'bg-amber-400'
                : isSpeaking
                ? 'bg-cyan-400'
                : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isListening
                ? 'bg-rose-500'
                : isProcessing
                ? 'bg-amber-500'
                : isSpeaking
                ? 'bg-cyan-500'
                : 'bg-emerald-500'
            }`}
          />
        </span>
        <span className="text-xs font-medium text-slate-300">
          {isListening
            ? 'أستمع إليك الآن...'
            : isProcessing
            ? 'جاري التفكير والمعالجة...'
            : isSpeaking
            ? 'يتحدث المساعد...'
            : 'جاهز لأوامرك الصوتية'}
        </span>
      </div>

      {/* Main Interactive Orb Button */}
      <div className="relative flex items-center justify-center my-4 z-10">
        {/* Pulsing Ripple Rings */}
        <div
          className={`absolute w-44 h-44 rounded-full transition-all duration-700 pointer-events-none ${
            isListening
              ? 'scale-125 bg-rose-500/15 border border-rose-500/30 animate-pulse'
              : isSpeaking
              ? 'scale-120 bg-cyan-500/15 border border-cyan-500/30 animate-pulse'
              : isProcessing
              ? 'scale-110 bg-amber-500/15 border border-amber-500/30'
              : 'scale-90 bg-indigo-500/10 border border-indigo-500/20'
          }`}
        />

        {/* Central Glowing Mic Button */}
        <button
          id="mic-core-button"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={isProcessing}
          className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
            isListening
              ? 'bg-gradient-to-tr from-rose-500 to-pink-600 scale-105 shadow-rose-500/40 text-white'
              : isProcessing
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/40 text-slate-950 scale-95'
              : isSpeaking
              ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-cyan-500/40 text-slate-950 scale-105'
              : 'bg-gradient-to-tr from-cyan-400 via-teal-400 to-indigo-500 hover:scale-105 shadow-cyan-500/30 text-slate-950'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10" />
          ) : isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isSpeaking ? (
            <Volume2 className="w-10 h-10 animate-pulse" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
          <span className="text-[11px] font-bold mt-1">
            {isListening
              ? 'إيقاف'
              : isProcessing
              ? 'معالجة...'
              : isSpeaking
              ? 'يتحدث'
              : 'تحدث الآن'}
          </span>
        </button>
      </div>

      {/* Dynamic Soundwave Equalizer */}
      <div className="flex items-center justify-center gap-1.5 h-6 my-4 z-10">
        {[20, 45, 75, 35, 90, 55, 80, 40, 70, 30, 50, 25].map((h, idx) => (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-rose-400 animate-pulse'
                : isSpeaking
                ? 'bg-cyan-400 animate-pulse'
                : isProcessing
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-800 h-1.5'
            }`}
            style={{
              height:
                isListening || isSpeaking || isProcessing
                  ? `${Math.max(6, (h * ((idx % 3) + 1)) / 3)}px`
                  : '4px',
              animationDelay: `${idx * 70}ms`,
            }}
          />
        ))}
      </div>

      {/* Assistant Voice & Response Card */}
      <div className="w-full max-w-lg space-y-2.5 z-10 my-3 text-right">
        {transcript && (
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl px-4 py-2.5 text-xs text-cyan-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <p className="font-medium truncate">{transcript}</p>
          </div>
        )}

        <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-5 shadow-xl text-right">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              رد المساعد:
            </span>
            {isSpeaking && (
              <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-700/50">
                صوت مفعّل
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans font-medium">
            {agentSpeech}
          </p>
        </div>
      </div>

      {/* Text Command Input */}
      <form onSubmit={handleFormSubmit} className="w-full max-w-lg z-10 mt-2">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 focus-within:border-cyan-500/70 transition-all shadow-lg">
          <input
            id="voice-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="أو اكتب طلبك هنا (مثلاً: اضبط منبه، أرسل واتساب)..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            dir="rtl"
          />
          <button
            id="send-command-btn"
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
