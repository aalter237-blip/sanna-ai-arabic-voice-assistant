import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AgentSetupBar } from './components/AgentSetupBar';
import { VoiceAssistantOrb } from './components/VoiceAssistantOrb';
import { QuickCommands } from './components/QuickCommands';
import { DialectPresets } from './components/DialectPresets';
import { AndroidSimulator } from './components/AndroidSimulator';
import { AccessibilityNodeViewer } from './components/AccessibilityNodeViewer';
import { DeviceStateCard } from './components/DeviceStateCard';
import { ExecutionLogs } from './components/ExecutionLogs';
import { CodeExplorer } from './components/CodeExplorer';
import { SettingsModal } from './components/SettingsModal';
import { voiceAudio } from './services/audio-service';
import { NativeAgentBridge } from './services/native-agent-bridge';
import {
  ArabicDialect,
  OperatingMode,
  AppScreen,
  AppViewTab,
  AgentResponse,
  ExecutionLogItem,
  WhatsAppChat,
  ToolStep,
} from './types';
import { User, Phone, MessageSquare, ShieldCheck, Smartphone, Terminal, Layers, Code2 } from 'lucide-react';
import defaultBg from './assets/images/app_background_1787290542004.jpg';

// Owner Information
const OWNER_NAME = 'S҉H҉A҉R҉G҉A҉W҉E҉2҉3҉7';
const OWNER_PHONE = '+24962006146';
const OWNER_WHATSAPP = 'https://wa.me/qr/WV4DJQ6BHO2WF1';

export default function App() {
  // Navigation View Tab
  const [activeTab, setActiveTab] = useState<AppViewTab>('assistant_simulator');

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [dialect, setDialect] = useState<ArabicDialect>('auto');
  const [mode, setMode] = useState<OperatingMode>('online');

  // Background Customization
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('voice_assistant_bg_opacity');
      return saved ? parseFloat(saved) : 0.7;
    } catch {
      return 0.7;
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
      return saved ? JSON.parse(saved) : ['سنا', 'تلفوني', 'يا زول', 'مساعدي', 'افتح يا سمسم'];
    } catch {
      return ['سنا', 'تلفوني', 'يا زول', 'مساعدي', 'افتح يا سمسم'];
    }
  });

  // Voice & Conversation State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [agentSpeech, setAgentSpeech] = useState<string>(
    'مرحباً بك! أنا "سنا" وكيلك الصوتي للتحكم الكامل بهاتفك. اضغط على الدائرة وتحدث، أو اختر من الأوامر بالأسفل.'
  );
  const [conversationHistory, setConversationHistory] = useState<any[]>(() => {
    try {
      const s = localStorage.getItem('sanna-history');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Simulator Device State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [activeChatRecipient, setActiveChatRecipient] = useState<string>('أمي');
  const [volumeLevel, setVolumeLevel] = useState<number>(65);
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [activeTapPoint, setActiveTapPoint] = useState<{ x: number; y: number; label?: string } | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const [alarms, setAlarms] = useState<Array<{ id: string; time: string; label: string; enabled: boolean }>>([
    { id: 'alarm-1', time: '07:00 AM', label: 'الدوام الصباحي', enabled: true },
    { id: 'alarm-2', time: '08:30 AM', label: 'الاجتماع اليومي', enabled: false },
    { id: 'alarm-3', time: '05:00 AM', label: 'صلاة الفجر', enabled: true },
  ]);

  const [whatsappChats, setWhatsappChats] = useState<WhatsAppChat[]>([
    {
      id: 'chat-1',
      name: 'أمي',
      avatarColor: '#10b981',
      lastMessage: 'وصلت البيت ولا لسه؟',
      time: '10:35 AM',
      unreadCount: 1,
      messages: [
        { id: 'm1', sender: 'أمي', text: 'السلام عليكم يا ولدي، طمني عليك', time: '10:30 AM', isOutgoing: false },
        { id: 'm2', sender: 'أمي', text: 'وصلت البيت ولا لسه؟', time: '10:35 AM', isOutgoing: false },
      ],
    },
    {
      id: 'chat-2',
      name: 'علي',
      avatarColor: '#3b82f6',
      lastMessage: 'تمام نتقابل بعد الصلاة',
      time: '09:40 AM',
      unreadCount: 0,
      messages: [
        { id: 'm3', sender: 'علي', text: 'وين واصل يا غالي؟', time: '09:30 AM', isOutgoing: false },
        { id: 'm4', sender: 'أنا', text: 'في الطريق إليك الآن', time: '09:35 AM', isOutgoing: true },
        { id: 'm5', sender: 'علي', text: 'تمام نتقابل بعد الصلاة', time: '09:40 AM', isOutgoing: false },
      ],
    },
    {
      id: 'chat-3',
      name: 'محمد',
      avatarColor: '#8b5cf6',
      lastMessage: 'أرسلت لك الملفات على الإيميل',
      time: 'أمس',
      unreadCount: 0,
      messages: [
        { id: 'm6', sender: 'محمد', text: 'أرسلت لك الملفات على الإيميل', time: 'أمس', isOutgoing: false },
      ],
    },
    {
      id: 'chat-4',
      name: 'سارة',
      avatarColor: '#ec4899',
      lastMessage: 'شكراً جزيلاً!',
      time: 'أمس',
      unreadCount: 0,
      messages: [
        { id: 'm7', sender: 'سارة', text: 'شكراً جزيلاً!', time: 'أمس', isOutgoing: false },
      ],
    },
  ]);

  // Execution Telemetry Logs
  const [logs, setLogs] = useState<ExecutionLogItem[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      phase: 'WAKE_WORD',
      title: 'محرك الاستماع لكلمات الاستيقاظ نشط',
      details: 'تم تجهيز كلمات التنبيه: ["سنا", "تلفوني", "يا زول", "مساعدي"] للاستماع الدائم.',
      payload: { wakeWords: ['سنا', 'تلفوني', 'يا زول', 'مساعدي'] },
      status: 'info',
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      phase: 'ACCESSIBILITY_BRIDGE',
      title: 'تهيئة خدمة إمكانية الوصول لنظام الأندرويد',
      details: 'اتصال نشط مع SannaAccessibilityService.kt و VoiceAgentPlugin.kt.',
      payload: { service: 'SannaAccessibilityService', status: 'CONNECTED', permissions: 'GRANTED' },
      status: 'success',
    },
  ]);

  const addLog = (phase: ExecutionLogItem['phase'], title: string, details: string, payload?: any, status: ExecutionLogItem['status'] = 'info') => {
    const item: ExecutionLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      phase,
      title,
      details,
      payload,
      status,
    };
    setLogs((prev) => [item, ...prev]);
  };

  // Sync TTS settings
  useEffect(() => {
    voiceAudio.setSpeechSettings(speechRate, speechPitch, soundEffects);
    try {
      localStorage.setItem('voice_assistant_rate', speechRate.toString());
      localStorage.setItem('voice_assistant_pitch', speechPitch.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [speechRate, speechPitch, soundEffects]);

  // Sync API Keys
  useEffect(() => {
    try {
      localStorage.setItem('voice_assistant_api_keys', JSON.stringify(apiKeys));
      localStorage.setItem('voice_assistant_active_key_idx', activeApiKeyIndex.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [apiKeys, activeApiKeyIndex]);

  // Sync Wake Words
  useEffect(() => {
    try {
      localStorage.setItem('voice_assistant_wake_words', JSON.stringify(wakeWords));
    } catch (e) {
      console.warn(e);
    }
  }, [wakeWords]);

  // Sync Background
  useEffect(() => {
    try {
      localStorage.setItem('voice_assistant_bg_opacity', bgOpacity.toString());
      localStorage.setItem('voice_assistant_custom_bg', customBg);
    } catch (e) {
      console.warn(e);
    }
  }, [bgOpacity, customBg]);

  // Sync History
  useEffect(() => {
    try {
      localStorage.setItem('sanna-history', JSON.stringify(conversationHistory.slice(-30)));
    } catch (e) {
      console.warn(e);
    }
  }, [conversationHistory]);

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

  // Native Setup Hook
  useEffect(() => {
    NativeAgentBridge.requestAppPermissions();
    NativeAgentBridge.startBackgroundListening(['سنا', 'تلفوني', 'يا زول', 'مساعدي']);

    const onWake = () => {
      try {
        if (soundEffects) voiceAudio.playWakeChime();
        addLog('WAKE_WORD', 'تم التقاط كلمة التنبيه الصوتية', 'تم تنشيط الوكيل عبر صوت المستخدم.');
        handleStartListening();
      } catch (e) {}
    };

    window.addEventListener('sanna-wake', onWake);
    return () => window.removeEventListener('sanna-wake', onWake);
  }, [soundEffects]);

  const handleStartListening = () => {
    setTranscript('');
    const localeMap: Record<ArabicDialect, string> = {
      auto: 'ar-SA',
      sudanese: 'ar-SA',
      saudi: 'ar-SA',
      egyptian: 'ar-EG',
      levantine: 'ar-JO',
      maghrebi: 'ar-MA',
      msa: 'ar-SA',
    };
    const locale = localeMap[dialect] || 'ar-SA';
    if (soundEffects) {
      voiceAudio.playWakeChime();
    }
    voiceAudio.startListening(locale);
  };

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

  // Send WhatsApp message in simulated environment
  const handleSimulatorSendMessage = (chatId: string, text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWhatsappChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId || chat.name === chatId) {
          return {
            ...chat,
            lastMessage: text,
            time: timeStr,
            messages: [
              ...chat.messages,
              {
                id: `m-${Date.now()}`,
                sender: 'أنا',
                text,
                time: timeStr,
                isOutgoing: true,
                status: 'sent',
              },
            ],
          };
        }
        return chat;
      })
    );
  };

  // Toggle alarm
  const handleToggleAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  // Execute a visual and native step sequence
  const executeStepSequence = async (steps: ToolStep[], userPrompt: string) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      addLog(
        'TOOL_PARSER',
        `تنفيذ الخطوة [${i + 1}/${steps.length}]: ${step.action}`,
        step.description || `الأداة: ${step.tool}، الهدف: ${step.target || ''}`,
        step
      );

      // Execute on Native Android if in native APK
      try {
        if (step.action === 'open_app' && step.target) {
          await NativeAgentBridge.launchApp(step.target);
        } else if (step.action === 'click_by_text' && step.target) {
          await NativeAgentBridge.clickByText(step.target);
        } else if (step.action === 'click_by_id' && step.target) {
          await NativeAgentBridge.clickById(step.target);
        } else if (step.action === 'type_text' && step.value) {
          await NativeAgentBridge.inputText(String(step.value));
        } else if (step.action === 'set_volume' && step.value !== undefined) {
          await NativeAgentBridge.setVolume(Number(step.value) || 50);
        } else if (step.action === 'set_alarm' && step.target) {
          await NativeAgentBridge.setAlarm(String(step.target), step.description);
        } else if (step.action === 'back' || step.action === 'home' || step.action === 'notifications') {
          await NativeAgentBridge.performGlobalAction(step.action as any);
        }
      } catch (nativeErr) {
        console.warn('[Native Execution Warning]', nativeErr);
      }

      // Execute on Visual Android Simulator for real-time demonstration
      if (step.action === 'open_app' && step.target) {
        setHighlightedElement(step.target);
        if (step.target.includes('whatsapp')) {
          setCurrentScreen('whatsapp');
        } else if (step.target.includes('bankak') || step.target.includes('bank')) {
          setCurrentScreen('bank_app');
        } else if (step.target.includes('settings')) {
          setCurrentScreen('settings');
        } else if (step.target.includes('clock') || step.target.includes('deskclock')) {
          setCurrentScreen('clock');
        } else if (step.target.includes('camera')) {
          setCurrentScreen('camera');
        } else if (step.target.includes('quran') || step.target.includes('audio')) {
          setCurrentScreen('quran_player');
        } else if (step.target.includes('maps')) {
          setCurrentScreen('maps');
        }
        await new Promise((r) => setTimeout(r, 450));
      } else if (step.action === 'click_by_text' || step.action === 'click_by_id') {
        const targetName = step.target || '';
        setHighlightedElement(targetName);
        setActiveTapPoint({ x: 50, y: 45, label: `النقر على: ${targetName}` });

        if (targetName.includes('أمي') || targetName.includes('علي') || targetName.includes('محمد') || targetName.includes('سارة')) {
          setActiveChatRecipient(targetName);
          setCurrentScreen('whatsapp_chat');
        } else if (targetName.includes('سورة الكهف') || targetName.includes('حفظ')) {
          setCurrentScreen('quran_player');
        }

        await new Promise((r) => setTimeout(r, 600));
        setActiveTapPoint(null);
      } else if (step.action === 'type_text' && step.value) {
        setActiveTapPoint({ x: 45, y: 92, label: `كتابة: "${step.value}"` });
        await new Promise((r) => setTimeout(r, 500));
        setActiveTapPoint(null);
      } else if (step.action === 'send_message' || (step.action === 'click_by_id' && step.target?.includes('send'))) {
        const msgText = step.value ? String(step.value) : 'أنا في الطريق إليكم الآن';
        handleSimulatorSendMessage(activeChatRecipient, msgText);
        setCurrentScreen('whatsapp_chat');
        setActiveTapPoint({ x: 88, y: 92, label: 'إرسال الرسالة ✓' });
        await new Promise((r) => setTimeout(r, 500));
        setActiveTapPoint(null);
      } else if (step.action === 'set_volume' && step.value !== undefined) {
        const val = Number(step.value);
        setVolumeLevel(val);
        addLog('ACCESSIBILITY_BRIDGE', 'تعديل مستوى الصوت', `تم ضبط صوت الجهاز إلى ${val}%.`, { volume: val }, 'success');
        await new Promise((r) => setTimeout(r, 350));
      } else if (step.action === 'set_alarm' || step.action === 'set_timer') {
        const alarmTime = String(step.target || step.value || '07:00 AM');
        setAlarms((prev) => [
          { id: `alarm-${Date.now()}`, time: alarmTime, label: 'منبه صوتي - سنا', enabled: true },
          ...prev,
        ]);
        setCurrentScreen('clock');
        addLog('ACCESSIBILITY_BRIDGE', 'إنشاء منبه جديد', `تم ضبط المنبه على ${alarmTime}`, { time: alarmTime }, 'success');
        await new Promise((r) => setTimeout(r, 350));
      } else if (step.action === 'read_screen' || step.action === 'read_screen_text') {
        setCurrentScreen('screen_reader');
        addLog('ACCESSIBILITY_BRIDGE', 'فحص شاشة AccessibilityNodeInfo', 'تم فحص جميع عناصر الشاشة بنجاح.', { screen: currentScreen }, 'success');
        await new Promise((r) => setTimeout(r, 400));
      } else if (step.action === 'home') {
        setCurrentScreen('home');
      } else if (step.action === 'back') {
        setCurrentScreen('home');
      } else if (step.action === 'notifications') {
        setCurrentScreen('home');
      }
    }

    setHighlightedElement(null);
  };

  // Master Conversation Pipeline Execution
  const handleUserMessage = async (userText: string, forcedDialect?: ArabicDialect) => {
    if (!userText.trim() || isProcessing) return;

    setTranscript(userText);
    setIsProcessing(true);
    voiceAudio.stopSpeaking();

    const currentDialect = forcedDialect || dialect;
    const activeKey = apiKeys.length > 0 && apiKeys[activeApiKeyIndex] ? apiKeys[activeApiKeyIndex] : undefined;

    addLog('STT_INPUT', 'تم استقبال الأمر الصوتي', userText, { text: userText, dialect: currentDialect });

    try {
      let data: AgentResponse;

      if (mode === 'offline') {
        // Fast On-Device Edge SLM
        const { runLocalAgent } = await import('./services/local-agent');
        const local = await runLocalAgent('', userText, currentScreen, currentDialect);
        data = {
          source: 'local_edge_slm',
          speech: local.speech,
          dialect_detected: local.dialect_detected || currentDialect,
          intent: local.intent,
          steps: local.steps || [],
        };
      } else {
        // Online Server Gemini Chat endpoint with key rotation pool
        try {
          const res = await fetch('/api/agent/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userText,
              history: conversationHistory,
              dialect: currentDialect,
              currentScreen,
              activeKey,
            }),
          });

          if (res.ok) {
            data = await res.json();
          } else {
            throw new Error(`Server error: ${res.statusText}`);
          }
        } catch (apiErr) {
          console.warn('[Online API failed, falling back to Local SLM]', apiErr);
          const { runLocalAgent } = await import('./services/local-agent');
          const local = await runLocalAgent(activeKey || '', userText, currentScreen, currentDialect);
          data = {
            source: 'offline_fallback',
            speech: local.speech,
            dialect_detected: local.dialect_detected || currentDialect,
            intent: local.intent,
            steps: local.steps || [],
          };
        }
      }

      addLog(
        'LLM_INFERENCE',
        `تم تحليل النية واستنتاج الخطوات (${data.source})`,
        `اللهجة المكتشفة: ${data.dialect_detected || currentDialect} | النية: ${data.intent || 'general'} | عدد الخطوات: ${data.steps?.length || 0}`,
        data,
        'success'
      );

      const vocalText = data.speech || 'تم تنفيذ طلبك بنجاح.';
      setAgentSpeech(vocalText);

      // Execute Tool Steps
      if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
        await executeStepSequence(data.steps, userText);
      }

      // Speak Vocal Response via Arabic TTS Engine
      setIsSpeaking(true);
      if (soundEffects) {
        voiceAudio.playSuccessChime();
      }

      addLog('TTS_OUTPUT', 'توليد النطق الصوتي العربي (TTS)', vocalText, { text: vocalText, pitch: speechPitch, rate: speechRate });

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
      const errMsg = 'عذراً، حدث خطأ أثناء معالجة الأمر. يرجى المحاولة مرة أخرى.';
      setAgentSpeech(errMsg);
      addLog('LLM_INFERENCE', 'خطأ في معالجة الأمر', err.message || String(err), err, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between overflow-x-hidden"
      dir="rtl"
    >
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url(${customBg})`,
          backgroundPosition: 'center 20%',
        }}
      />

      {/* Dark Overlay for Readability and Contrast */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: '#020617',
          opacity: bgOpacity,
        }}
      />
      <div className="fixed inset-0 z-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none" />

      {/* Top Header Bar with Navigation Tabs */}
      <div className="relative z-10">
        <AgentSetupBar />
        <Header
          dialect={dialect}
          onDialectChange={setDialect}
          mode={mode}
          onModeToggle={() => setMode(mode === 'online' ? 'offline' : 'online')}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasCustomKey={apiKeys.length > 0}
        />
      </div>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-3">
        {/* VIEW 1: ASSISTANT & PHONE SIMULATOR */}
        {activeTab === 'assistant_simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main Column: Voice Assistant Orb + Commands + Dialect Presets */}
            <div className="lg:col-span-7 space-y-4 flex flex-col items-center">
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

              {/* Dialect Presets & Scenarios */}
              <div className="w-full">
                <DialectPresets
                  onSelectPreset={(text, d) => {
                    if (d) setDialect(d);
                    handleUserMessage(text, d);
                  }}
                  isArabicUI={true}
                />
              </div>

              {/* Device Quick State Card */}
              <div className="w-full">
                <DeviceStateCard
                  volumeLevel={volumeLevel}
                  onVolumeChange={(vol) => {
                    setVolumeLevel(vol);
                    NativeAgentBridge.setVolume(vol);
                  }}
                  wifiEnabled={wifiEnabled}
                  onWifiToggle={() => setWifiEnabled(!wifiEnabled)}
                  alarms={alarms}
                  onToggleAlarm={handleToggleAlarm}
                  isArabicUI={true}
                />
              </div>
            </div>

            {/* Right Column: Interactive Android Phone Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center sticky top-4">
              <div className="w-full text-center mb-2">
                <span className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/30 shadow-md">
                  <Smartphone className="w-3.5 h-3.5" />
                  محاكي الأندرويد التفاعلي (Live Device Preview)
                </span>
              </div>

              <AndroidSimulator
                currentScreen={currentScreen}
                onScreenChange={setCurrentScreen}
                activeChatRecipient={activeChatRecipient}
                onSelectChat={setActiveChatRecipient}
                volumeLevel={volumeLevel}
                onVolumeChange={setVolumeLevel}
                wifiEnabled={wifiEnabled}
                onWifiToggle={() => setWifiEnabled(!wifiEnabled)}
                alarms={alarms}
                onToggleAlarm={handleToggleAlarm}
                whatsappChats={whatsappChats}
                onSendMessage={handleSimulatorSendMessage}
                activeTapPoint={activeTapPoint}
                highlightedElement={highlightedElement}
                isArabicUI={true}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: ACCESSIBILITY NODE INSPECTOR */}
        {activeTab === 'accessibility' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <AccessibilityNodeViewer
                currentScreen={currentScreen}
                highlightedElement={highlightedElement}
                onSimulateClick={(nodeId, nodeText) => {
                  handleUserMessage(`اضغط على ${nodeText || nodeId}`);
                }}
                isArabicUI={true}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col items-center">
              <AndroidSimulator
                currentScreen={currentScreen}
                onScreenChange={setCurrentScreen}
                activeChatRecipient={activeChatRecipient}
                onSelectChat={setActiveChatRecipient}
                volumeLevel={volumeLevel}
                onVolumeChange={setVolumeLevel}
                wifiEnabled={wifiEnabled}
                onWifiToggle={() => setWifiEnabled(!wifiEnabled)}
                alarms={alarms}
                onToggleAlarm={handleToggleAlarm}
                whatsappChats={whatsappChats}
                onSendMessage={handleSimulatorSendMessage}
                activeTapPoint={activeTapPoint}
                highlightedElement={highlightedElement}
                isArabicUI={true}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: EXECUTION LOGS & TELEMETRY */}
        {activeTab === 'logs' && (
          <div className="max-w-4xl mx-auto h-[700px]">
            <ExecutionLogs
              logs={logs}
              onClearLogs={() => setLogs([])}
              isArabicUI={true}
            />
          </div>
        )}

        {/* VIEW 4: CODE & ARCHITECTURE EXPLORER */}
        {activeTab === 'code' && (
          <div className="max-w-5xl mx-auto">
            <CodeExplorer isArabicUI={true} />
          </div>
        )}
      </main>

      {/* Owner Information & Direct Contact Footer */}
      <footer className="relative z-10 py-3.5 px-4 text-center border-t border-slate-800/80 bg-slate-950/85 backdrop-blur-md mt-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Owner Info Badge */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-100 block text-xs tracking-wide">المالك: {OWNER_NAME}</span>
              <span className="text-[11px] text-cyan-400 font-mono tracking-wider dir-ltr block text-right font-medium">
                {OWNER_PHONE}
              </span>
            </div>
          </div>

          {/* Actions: Direct WhatsApp & Call */}
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
