import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VoiceAssistantOrb } from './components/VoiceAssistantOrb';
import { AndroidSimulator } from './components/AndroidSimulator';
import { AccessibilityNodeViewer } from './components/AccessibilityNodeViewer';
import { ExecutionLogs } from './components/ExecutionLogs';
import { DialectPresets } from './components/DialectPresets';
import { CodeExplorer } from './components/CodeExplorer';
import { sannaAudio } from './services/audio-service';
import {
  OperatingMode,
  ArabicDialect,
  AppScreen,
  ExecutionLogItem,
  WhatsAppChat,
  AgentResponse,
  ToolStep,
} from './types';

export default function App() {
  // Navigation & Preferences State
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'nodes' | 'logs'>('simulator');
  const [mode, setMode] = useState<OperatingMode>('online');
  const [dialect, setDialect] = useState<ArabicDialect>('auto');
  const [isArabicUI, setIsArabicUI] = useState<boolean>(true);

  // Voice & Conversation State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [agentSpeech, setAgentSpeech] = useState<string>(
    'مرحباً بك! أنا سنا، مساعدك الذكي لنظام أندرويد. اضغط على الميكروفون للتحدث معي أو اختر أمراً جاهزاً.'
  );
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  // Telemetry & Logs
  const [logs, setLogs] = useState<ExecutionLogItem[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      phase: 'WAKE_WORD',
      title: 'خدمة سنا مهيأة وجاهزة',
      details: 'تم تهيئة محرك Sanna AI Voice Engine ونظام الربط مع SannaAccessibilityService بنجاح.',
      status: 'info',
    },
  ]);

  // Android Device Simulator State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [volumeLevel, setVolumeLevel] = useState<number>(75);
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [activeChatRecipient, setActiveChatRecipient] = useState<string>('أمي');
  const [activeTapPoint, setActiveTapPoint] = useState<{ x: number; y: number; label?: string } | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const [alarms, setAlarms] = useState([
    { id: 'al-1', time: '07:00 ص', label: 'الاستيقاظ للعمل', enabled: true },
    { id: 'al-2', time: '08:30 ص', label: 'الاجتماع الصباحي', enabled: false },
  ]);

  const [whatsappChats, setWhatsappChats] = useState<WhatsAppChat[]>([
    {
      id: 'chat-mom',
      name: 'أمي (والدتي)',
      avatarColor: '#10B981',
      lastMessage: 'يا ولدي لا تتأخر على الغداء',
      time: '10:30',
      unreadCount: 1,
      messages: [
        { id: 'm1', sender: 'أمي', text: 'السلام عليكم، متى راجع للبيت؟', time: '10:15', isOutgoing: false },
        { id: 'm2', sender: 'أمي', text: 'يا ولدي لا تتأخر على الغداء', time: '10:30', isOutgoing: false },
      ],
    },
    {
      id: 'chat-ali',
      name: 'علي (العمل)',
      avatarColor: '#3B82F6',
      lastMessage: 'وصلت الموقع وجاهز للاجتماع',
      time: '09:45',
      unreadCount: 0,
      messages: [
        { id: 'm3', sender: 'علي', text: 'هلا، أوراق المشروع جاهزة معك؟', time: '09:30', isOutgoing: false },
        { id: 'm4', sender: 'أنا', text: 'أي نعم جاهزة، في طريقي إليك', time: '09:32', isOutgoing: true },
      ],
    },
    {
      id: 'chat-sarah',
      name: 'سارة',
      avatarColor: '#EC4899',
      lastMessage: 'تم إرسال الملفات على البريد',
      time: 'أمس',
      unreadCount: 0,
      messages: [
        { id: 'm5', sender: 'سارة', text: 'تم إرسال الملفات على البريد', time: 'أمس', isOutgoing: false },
      ],
    },
  ]);

  // Audio Engine Hookup
  useEffect(() => {
    sannaAudio.onStateChange((listening) => {
      setIsListening(listening);
    });

    sannaAudio.onResult((text, isFinal) => {
      setTranscript(text);
      if (isFinal && text.trim()) {
        handleUserMessage(text.trim());
      }
    });

    sannaAudio.onError((err) => {
      console.warn('Audio recognition error:', err);
      setIsListening(false);
    });
  }, [mode, dialect, currentScreen, conversationHistory]);

  const addLog = (log: Omit<ExecutionLogItem, 'id' | 'timestamp'>) => {
    const newLog: ExecutionLogItem = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

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
    sannaAudio.startListening(locale);

    addLog({
      phase: 'WAKE_WORD',
      title: 'بدء الاستماع الصوتي (Wake Trigger)',
      details: `تم تفعيل الميكروفون باللغة العربية (Locale: ${locale}).`,
      status: 'info',
    });
  };

  const handleStopListening = () => {
    sannaAudio.stopListening();
    setIsListening(false);
  };

  // Master Conversation Pipeline Execution
  const handleUserMessage = async (userText: string, forcedDialect?: ArabicDialect) => {
    if (!userText.trim() || isProcessing) return;

    setTranscript(userText);
    setIsProcessing(true);
    sannaAudio.stopSpeaking();

    const currentDialect = forcedDialect || dialect;

    // 1. Log Input
    addLog({
      phase: 'STT_INPUT',
      title: `استلام الأمر الصوتي: "${userText}"`,
      details: `تم التقاط الكلام عبر خدمة STT باللهجة: ${currentDialect}.`,
      payload: { input_text: userText, dialect: currentDialect, currentScreen },
      status: 'info',
    });

    try {
      // 2. Call Server LLM (Cloud Gemini or Local Edge SLM)
      const endpoint = mode === 'online' ? '/api/agent/chat' : '/api/offline/chat';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory,
          dialect: currentDialect,
          currentScreen,
        }),
      });

      const data: AgentResponse = await res.json();

      // 3. Log LLM Output
      addLog({
        phase: 'LLM_INFERENCE',
        title: `تحليل الذكاء الاصطناعي (${data.source})`,
        details: `تم استخراج النية [${data.intent || 'action'}] وبناء ${data.steps?.length || 0} خطوات تنفيذية.`,
        payload: data,
        status: 'success',
      });

      // 4. Update Speech state
      const vocalText = data.speech || 'تم تنفيذ طلبك بنجاح.';
      setAgentSpeech(vocalText);

      // 5. Execute Android Tool Automation Steps Sequentially
      if (data.steps && data.steps.length > 0) {
        await executeToolSteps(data.steps, userText);
      }

      // 6. Speak Vocal Response via Arabic TTS Engine
      setIsSpeaking(true);
      addLog({
        phase: 'TTS_OUTPUT',
        title: 'توليد النطق الصوتي العربي (TTS)',
        details: `سنا تنطق: "${vocalText}"`,
        status: 'info',
      });

      sannaAudio.playSuccessChime();
      sannaAudio.speakArabic(vocalText, () => {
        setIsSpeaking(false);
      });

      // 7. Update History
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: vocalText },
      ]);
    } catch (err: any) {
      console.error('Agent execution error:', err);
      addLog({
        phase: 'LLM_INFERENCE',
        title: 'تعذر المعالجة',
        details: err.message || 'حدث خطأ أثناء معالجة الأمر.',
        status: 'error',
      });
      setAgentSpeech('عذراً، حدث خطأ أثناء معالجة الأمر. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Automated Android Accessibility & System Tool Execution
  const executeToolSteps = async (steps: ToolStep[], userPrompt: string) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      addLog({
        phase: 'TOOL_PARSER',
        title: `تنفيذ الخطوة ${step.step_number || i + 1}: ${step.tool} -> ${step.action}`,
        details: step.description || `جاري تطبيق الإجراء على ${step.target || step.action}`,
        payload: step,
        status: 'info',
      });

      // Execute specific Tool Actions
      if (step.tool === 'whatsapp_tool' || step.action === 'send_message') {
        const recipientName = step.recipient || (userPrompt.includes('علي') ? 'علي' : 'أمي');
        setActiveChatRecipient(recipientName);
        setCurrentScreen('whatsapp_chat');

        // Trigger visual tap animation on contact & send
        setHighlightedElement('com.whatsapp:id/send');
        setActiveTapPoint({ x: 88, y: 89, label: 'findAndClick(com.whatsapp:id/send)' });

        await new Promise((r) => setTimeout(r, 900));

        // Add message into chat
        const outgoingMsg = step.value ? String(step.value) : 'أنا في الطريق وراح أتأخر شوي';
        const targetChatId = recipientName.includes('علي') ? 'chat-ali' : 'chat-mom';

        setWhatsappChats((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                lastMessage: outgoingMsg,
                time: 'الآن',
                messages: [
                  ...c.messages,
                  {
                    id: `m-${Date.now()}`,
                    sender: 'أنا',
                    text: outgoingMsg,
                    time: 'الآن',
                    isOutgoing: true,
                    status: 'delivered',
                  },
                ],
              };
            }
            return c;
          })
        );

        addLog({
          phase: 'ACCESSIBILITY_BRIDGE',
          title: `إرسال رسالة واتساب إلى [${recipientName}] بنجاح`,
          details: `تم تنفيذ Intent للواتساب والنقر التلقائي على زر الإرسال بواسطة SannaAccessibilityService.`,
          status: 'success',
        });
      } else if (step.action === 'open_app') {
        const target = String(step.target || '').toLowerCase();
        if (target.includes('whatsapp') || target.includes('واتس')) {
          setCurrentScreen('whatsapp');
          setActiveTapPoint({ x: 25, y: 35, label: 'ACTION_CLICK(com.whatsapp)' });
        } else if (target.includes('settings') || target.includes('إعدادات')) {
          setCurrentScreen('settings');
          setActiveTapPoint({ x: 50, y: 35, label: 'ACTION_CLICK(com.android.settings)' });
        } else if (target.includes('clock') || target.includes('ساعة') || target.includes('منبه')) {
          setCurrentScreen('clock');
          setActiveTapPoint({ x: 75, y: 35, label: 'ACTION_CLICK(com.google.android.deskclock)' });
        }

        addLog({
          phase: 'ACCESSIBILITY_BRIDGE',
          title: `تشغيل التطبيق: ${step.target}`,
          details: `تم إطلاق النشاط عبر PackageManager Intent.`,
          status: 'success',
        });
      } else if (step.action === 'set_volume') {
        const newVol = Number(step.value) || 100;
        setVolumeLevel(newVol);
        setActiveTapPoint({ x: 80, y: 8, label: `setMediaVolume(${newVol}%)` });

        addLog({
          phase: 'ACCESSIBILITY_BRIDGE',
          title: `تعديل مستوى الصوت إلى ${newVol}%`,
          details: `تم استدعاء AudioManager.STREAM_MUSIC عبر SannaAccessibilityBridge.kt`,
          status: 'success',
        });
      } else if (step.action === 'set_timer' || step.action === 'set_alarm') {
        const alarmTime = String(step.target || step.value || '07:00 ص');
        setCurrentScreen('clock');
        setAlarms((prev) => [
          { id: `al-${Date.now()}`, time: alarmTime, label: 'منبه سنا الصوتي', enabled: true },
          ...prev,
        ]);
        setActiveTapPoint({ x: 50, y: 30, label: 'AlarmClock.ACTION_SET_ALARM' });

        addLog({
          phase: 'ACCESSIBILITY_BRIDGE',
          title: `ضبط المنبه: ${alarmTime}`,
          details: `تم إرسال AlarmClock.ACTION_SET_ALARM للنظام.`,
          status: 'success',
        });
      } else if (step.action === 'read_screen_text') {
        setCurrentScreen('screen_reader');
        setActiveTapPoint({ x: 50, y: 50, label: 'extractScreenText()' });

        addLog({
          phase: 'ACCESSIBILITY_BRIDGE',
          title: 'قراءة وتحليل نصوص الشاشة النشطة',
          details: `تم جمع عقد AccessibilityNodeInfo النصية للشاشة الحالية.`,
          status: 'success',
        });
      } else if (step.action === 'click_by_text' || step.action === 'click_by_id') {
        setActiveTapPoint({ x: 50, y: 50, label: `findAndClick(${step.target})` });
        addLog({
          phase: 'ACCESSIBILITY_BRIDGE',
          title: `النقر على العنصر: ${step.target}`,
          details: `تم العثور على العقدة وتنفيذ AccessibilityNodeInfo.ACTION_CLICK.`,
          status: 'success',
        });
      }

      // Step delay
      await new Promise((r) => setTimeout(r, 700));
      setActiveTapPoint(null);
      setHighlightedElement(null);
    }
  };

  // Node simulator click handler
  const handleSimulateNodeClick = (nodeId: string, nodeText: string) => {
    setActiveTapPoint({ x: 50, y: 50, label: `findAndClick("${nodeText || nodeId}")` });
    setTimeout(() => setActiveTapPoint(null), 1000);

    if (nodeId === 'com.whatsapp') {
      setCurrentScreen('whatsapp');
    } else if (nodeId === 'com.android.settings') {
      setCurrentScreen('settings');
    } else if (nodeId === 'com.google.android.deskclock') {
      setCurrentScreen('clock');
    } else if (nodeId === 'com.whatsapp:id/send') {
      setCurrentScreen('whatsapp_chat');
    }

    addLog({
      phase: 'ACCESSIBILITY_BRIDGE',
      title: `محاكاة نقر يدوي: ${nodeText || nodeId}`,
      details: `تم تنفيذ استدعاء SannaAccessibilityBridge.clickByText("${nodeText || nodeId}")`,
      status: 'info',
    });
  };

  // Manual chat send handler
  const handleSimulatorManualSend = (chatId: string, text: string) => {
    setWhatsappChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: text,
            time: 'الآن',
            messages: [
              ...c.messages,
              {
                id: `m-${Date.now()}`,
                sender: 'أنا',
                text,
                time: 'الآن',
                isOutgoing: true,
                status: 'delivered',
              },
            ],
          };
        }
        return c;
      })
    );
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col"
      dir={isArabicUI ? 'rtl' : 'ltr'}
    >
      {/* Top Application Bar */}
      <Header
        mode={mode}
        onModeToggle={setMode}
        dialect={dialect}
        onDialectChange={setDialect}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isArabicUI={isArabicUI}
        onToggleUI={() => setIsArabicUI(!isArabicUI)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* VIEW 1: LIVE SIMULATOR & VOICE WORKSPACE */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Top Grid: Voice Assistant Engine (Left/Right) + Live Android Simulator Phone */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Voice Orb & Assistant Control */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <VoiceAssistantOrb
                  isListening={isListening}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  transcript={transcript}
                  agentSpeech={agentSpeech}
                  mode={mode}
                  dialect={dialect}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  onSendMessage={(txt) => handleUserMessage(txt)}
                  isArabicUI={isArabicUI}
                />

                {/* Dialect Quick Scenarios */}
                <DialectPresets
                  onSelectPreset={(text, d) => {
                    setDialect(d);
                    handleUserMessage(text, d);
                  }}
                  isArabicUI={isArabicUI}
                />
              </div>

              {/* Live Android 15 Device Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs font-bold text-slate-400">
                      {isArabicUI ? 'محاكي جهاز أندرويد الحقيقي' : 'Android Device Simulation'}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Pixel 9 Pro / Android 15
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
                    whatsappChats={whatsappChats}
                    onSendMessage={handleSimulatorManualSend}
                    activeTapPoint={activeTapPoint}
                    highlightedElement={highlightedElement}
                    isArabicUI={isArabicUI}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACCESSIBILITY NODE INSPECTOR */}
        {activeTab === 'nodes' && (
          <div className="h-[750px]">
            <AccessibilityNodeViewer
              currentScreen={currentScreen}
              highlightedElement={highlightedElement}
              onSimulateClick={handleSimulateNodeClick}
              isArabicUI={isArabicUI}
            />
          </div>
        )}

        {/* VIEW 3: PIPELINE EXECUTION LOGS */}
        {activeTab === 'logs' && (
          <div className="h-[750px]">
            <ExecutionLogs
              logs={logs}
              onClearLogs={() => setLogs([])}
              isArabicUI={isArabicUI}
            />
          </div>
        )}

        {/* VIEW 4: SOURCE CODE REPOSITORY & ZIP EXPORTER */}
        {activeTab === 'code' && (
          <div className="min-h-[750px]">
            <CodeExplorer isArabicUI={isArabicUI} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {isArabicUI
              ? 'مشروع سنا (Sanna AI) - مساعد صوتي ذكي عربي متكامل للأندرويد مع أتمتة إمكانية الوصول'
              : 'Sanna AI - Production Arabic Voice Assistant & Android Accessibility Agent'}
          </span>
          <span className="font-mono text-cyan-400/80">
            React Native + Kotlin Native Accessibility Service
          </span>
        </div>
      </footer>
    </div>
  );
}
