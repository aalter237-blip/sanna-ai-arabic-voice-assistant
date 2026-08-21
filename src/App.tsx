import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AgentSetupBar } from './components/AgentSetupBar';
import { VoiceAssistantOrb } from './components/VoiceAssistantOrb';
import { QuickCommands } from './components/QuickCommands';
import { SettingsModal } from './components/SettingsModal';
import { voiceAudio } from './services/audio-service';
import { NativeAgentBridge } from './services/native-agent-bridge';
import { ArabicDialect, OperatingMode, AgentResponse } from './types';
import { User, Phone, MessageSquare } from 'lucide-react';
import defaultBg from './assets/images/app_background_1787290542004.jpg';

// Fixed Owner Information
const OWNER_NAME = 'S҉H҉A҉R҉G҉A҉W҉E҉2҉3҉7';
const OWNER_PHONE = '+24962006146';
const OWNER_WHATSAPP = 'https://wa.me/qr/WV4DJQ6BHO2WF1';

export default function App() {
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [dialect, setDialect] = useState<ArabicDialect>('auto');
  const [mode, setMode] = useState<OperatingMode>('online');

  // Background Customization
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_bg_opacity');
      return saved ? parseFloat(saved) : 0.65;
    } catch {
      return 0.65;
    }
  });

  const [customBg, setCustomBg] = useState<string>(() => {
    try {
      return localStorage.getItem('voice_assistant_custom_bg') || defaultBg;
    } catch {
      return defaultBg;
    }
  });

  // Custom API Keys List (Stored locally)
  const [apiKeys, setApiKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_api_keys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeApiKeyIndex, setActiveApiKeyIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_active_key_idx');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Speech & Voice Configuration
  const [speechRate, setSpeechRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_rate');
      return saved ? parseFloat(saved) : 0.95;
    } catch {
      return 0.95;
    }
  });

  const [speechPitch, setSpeechPitch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_pitch');
      return saved ? parseFloat(saved) : 1.05;
    } catch {
      return 1.05;
    }
  });

  const [soundEffects, setSoundEffects] = useState<boolean>(true);

  // Wake Words List
  const [wakeWords, setWakeWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_wake_words');
      return saved ? JSON.parse(saved) : ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'];
    } catch {
      return ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'];
    }
  });

  // Voice & Conversation State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [agentSpeech, setAgentSpeech] = useState<string>(
    'مرحباً بك! أنا مساعدك الصوتي الذكي. اضغط على الدائرة للتحدث أو اختر أمراً للبدء.'
  );
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  // Sync TTS settings with engine
  useEffect(() => {
    voiceAudio.setSpeechSettings(speechRate, speechPitch, soundEffects);
    try {
      localStorage.setItem('voice_assistant_rate', speechRate.toString());
      localStorage.setItem('voice_assistant_pitch', speechPitch.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [speechRate, speechPitch, soundEffects]);

  // Sync API Keys to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voice_assistant_api_keys', JSON.stringify(apiKeys));
      localStorage.setItem('voice_assistant_active_key_idx', activeApiKeyIndex.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [apiKeys, activeApiKeyIndex]);

  // Sync Wake Words to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voice_assistant_wake_words', JSON.stringify(wakeWords));
    } catch (e) {
      console.warn(e);
    }
  }, [wakeWords]);

  // Sync Background to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voice_assistant_bg_opacity', bgOpacity.toString());
      localStorage.setItem('voice_assistant_custom_bg', customBg);
    } catch (e) {
      console.warn(e);
    }
  }, [bgOpacity, customBg]);

  // Audio Engine Hookup
  useEffect(() => {
    voiceAudio.onStateChange((listening) => {
      setIsListening(listening);
    });

    voiceAudio.onResult((text, isFinal) => {
      setTranscript(text);
      if (isFinal && text.trim()) {
        handleUserMessage(text.trim());
      }
    });

    voiceAudio.onError((err) => {
      console.warn('Audio recognition error:', err);
      setIsListening(false);
    });
  }, [dialect, mode, conversationHistory, apiKeys, activeApiKeyIndex]);

  const handleStartListening = () => {
    setTranscript('');
    const localeMap: Record<ArabicDialect, string> = {
      auto: 'ar-SA',
      saudi: 'ar-SA',
      egyptian: 'ar-EG',
      levantine: 'ar-JO',
      maghrebi: 'ar-MA',
      msa: 'ar-SA',
    };
    const locale = localeMap[dialect] || 'ar-SA';
    voiceAudio.startListening(locale);
  };

  useEffect(() => {
    NativeAgentBridge.requestAppPermissions();
    NativeAgentBridge.startBackgroundListening(["سنا","تلفوني","سناء","مساعدي"]);
    const onWake = () => { try { handleStartListening(); } catch (e) {} };
    window.addEventListener("sanna-wake", onWake);
    return () => window.removeEventListener("sanna-wake", onWake);
  }, []);
  useEffect(() => {
    try { const s=localStorage.getItem("sanna-history"); if(s) setConversationHistory(JSON.parse(s)); } catch(e) {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("sanna-history", JSON.stringify(conversationHistory.slice(-30))); } catch(e) {}
  }, [conversationHistory]);
  const handleStopListening = () => {
    voiceAudio.stopListening();
    setIsListening(false);
  };

  // Add / Remove Custom API Keys
  const handleAddApiKey = (newKey: string) => {
    if (!newKey.trim()) return;
    setApiKeys((prev) => {
      const next = [...prev, newKey.trim()];
      setActiveApiKeyIndex(next.length - 1);
      return next;
    });
  };

  const handleRemoveApiKey = (index: number) => {
    setApiKeys((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (activeApiKeyIndex >= next.length) {
        setActiveApiKeyIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  // Add / Remove Wake Words
  const handleAddWakeWord = (word: string) => {
    if (word.trim() && !wakeWords.includes(word.trim())) {
      setWakeWords((prev) => [...prev, word.trim()]);
    }
  };

  const handleRemoveWakeWord = (index: number) => {
    setWakeWords((prev) => prev.filter((_, i) => i !== index));
  };

  // Master Conversation Pipeline Execution
  const handleUserMessage = async (userText: string, forcedDialect?: ArabicDialect) => {
    if (!userText.trim() || isProcessing) return;

    setTranscript(userText);
    setIsProcessing(true);
    voiceAudio.stopSpeaking();

    const currentDialect = forcedDialect || dialect;
    const activeKey = apiKeys.length > 0 && apiKeys[activeApiKeyIndex] ? apiKeys[activeApiKeyIndex] : undefined;

    try {
      const { askGemini } = await import('./services/gemini-direct');
      const reply = await askGemini(activeKey || '', userText);
      const endpoint = '';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory,
          dialect: currentDialect,
          activeKey: activeKey,
        }),
      });

      const data: AgentResponse = await res.json();

      const vocalText = data.speech || 'تم تنفيذ طلبك بنجاح.';
      setAgentSpeech(vocalText);

      // Execute Native Android Agent Steps if running in APK / Native mode
      if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
        for (const step of data.steps) {
          try {
            if (step.action === 'open_app' && step.target) {
              await NativeAgentBridge.launchApp(step.target);
            } else if (step.action === 'click_by_text' && step.target) {
              await NativeAgentBridge.clickByText(step.target);
            } else if (step.action === 'click_by_id' && step.target) {
              await NativeAgentBridge.clickById(step.target);
            } else if (step.action === 'type_text' && step.value) {
              await NativeAgentBridge.inputText(String(step.value));
            } else if (step.action === 'set_volume' && step.value) {
              await NativeAgentBridge.setVolume(parseInt(String(step.value), 10) || 50);
            } else if (step.action === 'set_alarm' && step.value) {
              await NativeAgentBridge.setAlarm(String(step.value), step.description);
        } else if (step.action === "back") {
          await NativeAgentBridge.performGlobalAction("back");
        } else if (step.action === "home") {
          await NativeAgentBridge.performGlobalAction("home");
        } else if (step.action === "notifications") {
          await NativeAgentBridge.performGlobalAction("notifications");
        } else if (step.action === "read_screen") {
          await NativeAgentBridge.getScreenText();
        } else if (step.action === "start_listen") {
          await NativeAgentBridge.startBackgroundListening(["سنا","تلفوني"]);
        } else if (step.action === "send_message") {
          await NativeAgentBridge.launchApp(step.target || "com.whatsapp");
          if (step.recipient) await NativeAgentBridge.clickByText(String(step.recipient));
          if (step.value) await NativeAgentBridge.inputText(String(step.value));
        } else if (step.action === "read_notifications") {
          const items = await NativeAgentBridge.getNotifications();
          const txt = (items||[]).slice(0,5).map((i:any)=>`${i.title||""}: ${i.text||""}`).join("، ");
          if (txt) data.speech = "آخر الإشعارات: " + txt;
        } else if (step.action === "reply_notification" && step.value) {
          await NativeAgentBridge.replyLastNotification(String(step.value));
            }
          } catch (nativeErr) {
            console.warn('[Native Execution Warning]', nativeErr);
          }
        }
      }

            let screenTexts: string[] = [];
      try { screenTexts = await NativeAgentBridge.getScreenText(); } catch(e) {}
      if (screenTexts && screenTexts.length) {
        (window as any).__sannaScreen = screenTexts.slice(0,80).join(" | ");
        try {
          const res2 = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userText + "\n\n[نص الشاشة الحالي]\n" + (window as any).__sannaScreen,
              history: conversationHistory,
              dialect: currentDialect,
              activeKey: activeKey,
              currentScreen: (window as any).__sannaScreen,
            }),
          });
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.steps && data2.steps.length) {
              for (const step of data2.steps) {
                try {
                  if (step.action === "open_app" && step.target) await NativeAgentBridge.launchApp(step.target);
                  else if (step.action === "click_by_text" && step.target) await NativeAgentBridge.clickByText(step.target);
                  else if (step.action === "type_text" && step.value) await NativeAgentBridge.inputText(String(step.value));
                } catch(e) {}
              }
            }
            if (data2.speech) data.speech = data2.speech;
          }
        } catch(e) {}
      }

      for (let round=0; round<2; round++) {
        let more: string[] = [];
        try { more = await NativeAgentBridge.getScreenText(); } catch(e) {}
        if (!more || !more.length) break;
        (window as any).__sannaScreen = more.slice(0,80).join(" | ");
        try {
          const resN = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userText + "\n\n[نص الشاشة]\n" + (window as any).__sannaScreen,
              history: conversationHistory,
              dialect: currentDialect,
              activeKey: activeKey,
              currentScreen: (window as any).__sannaScreen,
            }),
          });
          if (!resN.ok) break;
          const dataN = await resN.json();
          if (!dataN.steps || !dataN.steps.length) {
            if (dataN.speech) data.speech = dataN.speech;
            break;
          }
          for (const step of dataN.steps) {
            try {
              if (step.action === "open_app" && step.target) await NativeAgentBridge.launchApp(step.target);
              else if (step.action === "click_by_text" && step.target) await NativeAgentBridge.clickByText(step.target);
              else if (step.action === "type_text" && step.value) await NativeAgentBridge.inputText(String(step.value));
              else if (step.action === "send_message") {
                await NativeAgentBridge.launchApp(step.target || "com.whatsapp");
                if (step.recipient) {
                  await NativeAgentBridge.clickByText("بحث");
                  await NativeAgentBridge.inputText(String(step.recipient));
                  await NativeAgentBridge.clickByText(String(step.recipient));
                }
                if (step.value) await NativeAgentBridge.inputText(String(step.value));
              }
            } catch(e) {}
          }
          if (dataN.speech) data.speech = dataN.speech;
        } catch(e) { break; }
      }

// Speak Vocal Response via Arabic TTS Engine
      setIsSpeaking(true);
      if (soundEffects) {
        voiceAudio.playSuccessChime();
      }
      voiceAudio.speakArabic(vocalText, () => {
        setIsSpeaking(false);
      });

      // Update History
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: vocalText },
      ]);
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setAgentSpeech('عذراً، حدث خطأ أثناء معالجة الأمر. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between overflow-x-hidden"
      dir="rtl"
    >
      {/* Background Image Layer with User's Photo */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url(${customBg})`,
          backgroundPosition: 'center 20%',
        }}
      />

      {/* Dark Gradient Overlay for Readability and Contrast */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: '#020617',
          opacity: bgOpacity,
        }}
      />
      <div className="fixed inset-0 z-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none" />

      {/* Top Header Bar with Settings Button */}
      <div className="relative z-10">
        <AgentSetupBar />
      <Header
          dialect={dialect}
          onDialectChange={setDialect}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasCustomKey={apiKeys.length > 0}
        />
      </div>

      {/* Main Single-Screen Voice Assistant View */}
      <main className="relative z-10 flex-1 max-w-xl w-full mx-auto px-4 py-2 flex flex-col justify-center items-center">
        <div className="w-full space-y-4">
          {/* Central Glowing Voice Orb */}
          <VoiceAssistantOrb
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            transcript={transcript}
            agentSpeech={agentSpeech}
            dialect={dialect}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onSendMessage={(txt) => handleUserMessage(txt)}
          />

          {/* Quick Voice Command Chips */}
          <QuickCommands
            onSelectCommand={(text, d) => {
              if (d) setDialect(d);
              handleUserMessage(text, d);
            }}
          />
        </div>
      </main>

      {/* Owner Information & Direct Contact Footer */}
      <footer className="relative z-10 py-3.5 px-4 text-center border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Owner Info Badge */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-100 block text-xs tracking-wide">المالك: {OWNER_NAME}</span>
              <span className="text-[11px] text-cyan-400 font-mono tracking-wider dir-ltr block text-right font-medium">
                {OWNER_PHONE}
              </span>
            </div>
          </div>

          {/* Actions: Direct WhatsApp & Call (Without Edit Button) */}
          <div className="flex items-center gap-2">
            <a
              href={OWNER_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="مراسلة المالك عبر واتساب"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </a>

            <a
              href={`tel:${OWNER_PHONE}`}
              className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="اتصال هاتفي بالمالك"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>اتصال</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal (Add Gemini API Keys, Audio, Wake Words & Background) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onAddApiKey={handleAddApiKey}
        onRemoveApiKey={handleRemoveApiKey}
        activeApiKeyIndex={activeApiKeyIndex}
        onSelectActiveKey={setActiveApiKeyIndex}
        mode={mode}
        onModeChange={setMode}
        dialect={dialect}
        onDialectChange={setDialect}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        speechPitch={speechPitch}
        onSpeechPitchChange={setSpeechPitch}
        wakeWords={wakeWords}
        onAddWakeWord={handleAddWakeWord}
        onRemoveWakeWord={handleRemoveWakeWord}
        soundEffects={soundEffects}
        onToggleSoundEffects={() => setSoundEffects(!soundEffects)}
        bgOpacity={bgOpacity}
        onBgOpacityChange={setBgOpacity}
        onCustomBgUpload={setCustomBg}
      />
    </div>
  );
}
