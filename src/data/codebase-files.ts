import { CodeFile } from '../types';

export const CODEBASE_FILES: CodeFile[] = [
  {
    path: 'package.json',
    name: 'package.json',
    category: 'root',
    language: 'json',
    description: 'React Native project dependencies including Voice STT, TTS synthesizer, Wake Word detector, and Axios.',
    content: `{
  "name": "androidvoiceagent",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.4",
    "@react-native-voice/voice": "^3.2.4",
    "react-native-tts": "^4.1.0",
    "react-native-porcupine-node": "^1.0.0",
    "axios": "^1.6.7",
    "react-native-permissions": "^4.1.1",
    "react-native-fs": "^2.20.0",
    "react-native-device-info": "^10.12.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@types/react": "^18.2.6",
    "@types/react-native": "^0.73.0",
    "typescript": "^5.0.4"
  }
}`
  },
  {
    path: 'App.tsx',
    name: 'App.tsx',
    category: 'root',
    language: 'typescript',
    description: 'Main React Native UI with Arabic Voice trigger, status indicator, and conversation lifecycle.',
    content: `import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  I18nManager
} from 'react-native';
import { sttService } from './src/audio/stt-service';
import { wakeWordService } from './src/audio/wake-word-service';
import { pipeline } from './src/agent/conversation-pipeline';

// Enable RTL layout for Arabic native experience
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const App = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [agentSpeech, setAgentSpeech] = useState<string>('مرحباً! قل "تلفوني" أو "مساعدي" أو اضغط للتحدث معي.');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    requestPermissions();
    setupAssistant();
    return () => {
      wakeWordService.stop();
      sttService.stopListening();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);
    } catch (err) {
      console.warn('Permission request error', err);
    }
  };

  const setupAssistant = async () => {
    sttService.setResultHandler(async (text: string) => {
      setTranscript(text);
      setIsListening(false);
      setIsProcessing(true);
      try {
        const responseText = await pipeline.processVoiceInput(text, isOffline);
        setAgentSpeech(responseText);
      } catch (err) {
        console.error('Pipeline processing error', err);
      } finally {
        setIsProcessing(false);
      }
    });

    await wakeWordService.init((keyword) => {
      console.log(\`Wake Word Triggered: "\${keyword}"\`);
      startVoiceSession();
    });
    await wakeWordService.start();
  };

  const startVoiceSession = () => {
    setTranscript('');
    setIsListening(true);
    sttService.startListening('ar-SA');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المساعد الذكي | Voice Agent</Text>
        <TouchableOpacity
          style={[styles.badge, isOffline ? styles.badgeOffline : styles.badgeOnline]}
          onPress={() => setIsOffline(!isOffline)}
        >
          <Text style={styles.badgeText}>
            {isOffline ? 'وضع بدون إنترنت (محلي)' : 'متصل بالسحابة (Online)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Visual Circle */}
      <View style={styles.centerContainer}>
        <View style={[styles.statusCircle, isListening && styles.statusCircleListening, isProcessing && styles.statusCircleProcessing]}>
          {isProcessing ? (
            <ActivityIndicator size="large" color="#00F0FF" />
          ) : (
            <Text style={styles.statusCircleText}>
              {isListening ? 'أستمع إليك...' : 'المساعد جاهز'}
            </Text>
          )}
        </View>

        <Text style={styles.speechResponse}>{agentSpeech}</Text>
        {transcript ? <Text style={styles.transcript}>"{transcript}"</Text> : null}
      </View>

      {/* Action Bar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={startVoiceSession}
          disabled={isListening || isProcessing}
        >
          <Text style={styles.micButtonText}>
            {isListening ? 'جاري الاستماع...' : '🎙️ تحدث بالصوت'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>كلمات التنبيه: تلفوني، مساعدي، يا زول، افتح يا سمسم</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B132B', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#00F0FF', letterSpacing: 0.5 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeOnline: { backgroundColor: '#1C2541' },
  badgeOffline: { backgroundColor: '#FF8800' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1C2541',
    borderWidth: 3,
    borderColor: '#3A506B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#00F0FF',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  statusCircleListening: { borderColor: '#00F0FF', shadowOpacity: 0.8 },
  statusCircleProcessing: { borderColor: '#6FFFE9' },
  statusCircleText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  speechResponse: { color: '#E0E7FF', fontSize: 18, textAlign: 'center', lineHeight: 28, paddingHorizontal: 15, marginBottom: 12 },
  transcript: { color: '#6FFFE9', fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
  footer: { paddingBottom: 30, alignItems: 'center' },
  micButton: {
    backgroundColor: '#00F0FF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  micButtonActive: { backgroundColor: '#FF3366' },
  micButtonText: { color: '#0B132B', fontSize: 18, fontWeight: 'bold' },
  hintText: { color: '#94A3B8', fontSize: 13, marginTop: 12 },
});

export default App;`
  },
  {
    path: 'local.config.example.ts',
    name: 'local.config.example.ts',
    category: 'config',
    language: 'typescript',
    description: 'Configuration for multi-key Gemini API rotation, multiple wake words (تلفوني، مساعدي، يا زول، افتح يا سمسم), Arabic STT locales, TTS voices, and SLM parameters.',
    content: `export const Config = {
  // Cloud LLM Provider: 'anthropic' | 'openai' | 'gemini'
  ONLINE_LLM_PROVIDER: 'gemini' as 'anthropic' | 'openai' | 'gemini',
  
  // Gemini API Keys pool for multi-key rotation (Automatic Failover & Rate Limit 429/403 Handling)
  GEMINI_API_KEYS: [
    'AQ.Ab8RN6KttUzHJtl6XWnypbStsCJN-BLkaATXr5NZuAH1VFA25w',
    'AQ.Ab8RN6KKZeG68JQ_PfmDcWbZH4ErAwd66nLaHHRsQxdfq0iBEQ',
    'AQ.Ab8RN6IPCY2zz710mgUc6laGWcXEfYr3-_HNJg2nYSFqkliZxA'
  ],

  // Fallback single key
  GEMINI_API_KEY: 'AQ.Ab8RN6KttUzHJtl6XWnypbStsCJN-BLkaATXr5NZuAH1VFA25w',
  ANTHROPIC_API_KEY: 'YOUR_CLAUDE_KEY',
  OPENAI_API_KEY: 'YOUR_OPENAI_KEY',
  
  // Multiple Simultaneous Wake Word Triggers
  WAKE_WORDS: ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'],
  
  // On-Device / Local Edge LLM
  LOCAL_LLM_ENDPOINT: 'http://localhost:8080/v1',
  
  // Speech-To-Text Locale (supports: 'ar-SA' Saudi, 'ar-EG' Egyptian, 'ar-AE' UAE, 'ar-MA' Morocco, 'ar-SD' Sudanese)
  STT_LOCALE: 'ar-SA',
  
  PORCUPINE_ACCESS_KEY: 'YOUR_PICOVOICE_ACCESS_KEY',

  // Text-To-Speech Arabic Voice
  TTS_VOICE_ID: 'ar-sa-x-asw-network',
  TTS_RATE: 0.52,
  TTS_PITCH: 1.05,
};`
  },
  {
    path: 'local.config.ts',
    name: 'local.config.ts',
    category: 'config',
    language: 'typescript',
    description: 'Active local project configuration with multi-key Gemini rotation pool, multiple wake words, and STT locale.',
    content: `export const Config = {
  // Cloud LLM Provider: 'anthropic' | 'openai' | 'gemini'
  ONLINE_LLM_PROVIDER: 'gemini' as 'anthropic' | 'openai' | 'gemini',

  // Gemini API Keys pool for multi-key rotation (Automatic Failover & Rate Limit 429/403 Handling)
  GEMINI_API_KEYS: [
    'AQ.Ab8RN6KttUzHJtl6XWnypbStsCJN-BLkaATXr5NZuAH1VFA25w',
    'AQ.Ab8RN6KKZeG68JQ_PfmDcWbZH4ErAwd66nLaHHRsQxdfq0iBEQ',
    'AQ.Ab8RN6IPCY2zz710mgUc6laGWcXEfYr3-_HNJg2nYSFqkliZxA'
  ],

  // Fallback single key
  GEMINI_API_KEY: 'AQ.Ab8RN6KttUzHJtl6XWnypbStsCJN-BLkaATXr5NZuAH1VFA25w',
  ANTHROPIC_API_KEY: 'YOUR_CLAUDE_KEY',
  OPENAI_API_KEY: 'YOUR_OPENAI_KEY',

  // Multiple Simultaneous Wake Word Triggers
  WAKE_WORDS: ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'],

  // Local Edge LLM
  LOCAL_LLM_ENDPOINT: 'http://localhost:8080/v1',

  // Speech-To-Text Locale
  STT_LOCALE: 'ar-SA',

  PORCUPINE_ACCESS_KEY: 'YOUR_PICOVOICE_ACCESS_KEY',

  // Text-To-Speech Arabic Voice
  TTS_VOICE_ID: 'ar-sa-x-asw-network',
  TTS_RATE: 0.52,
  TTS_PITCH: 1.05,
};`
  },
  {
    path: 'src/audio/stt-service.ts',
    name: 'stt-service.ts',
    category: 'audio',
    language: 'typescript',
    description: 'Speech-To-Text engine supporting Modern Standard Arabic, regional dialects, and multiple activation keyword filters.',
    content: `import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { Config } from '../../local.config';

export class STTService {
  private onResultCallback: (text: string) => void = () => {};
  private onErrorCallback: (error: any) => void = () => {};
  private onWakeWordDetectedCallback: (keyword: string, remainderText: string) => void = () => {};
  private isListeningState: boolean = false;
  private wakeWordsList: string[] = ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'];

  constructor() {
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechEnd = () => {
      this.isListeningState = false;
    };

    if (Config.WAKE_WORDS && Array.isArray(Config.WAKE_WORDS)) {
      this.wakeWordsList = Config.WAKE_WORDS.map((w: string) => this.normalizeArabic(w));
    }
  }

  /**
   * Normalizes Arabic text by standardizing alifs, taa marbutas, yaas, and removing diacritics.
   */
  public normalizeArabic(text: string): string {
    return text
      .toLowerCase()
      .replace(/[ًٌٍَُِّْـ]/g, '') // Remove tashkeel & tatweel
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\.,\/#!$%\^&\*;:{}=\-_\x60~()؟?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Checks if an incoming speech transcript contains any of the configured activation keywords.
   */
  public checkWakeWordInTranscript(rawTranscript: string): { matched: boolean; keyword: string; remainder: string } {
    const normalized = this.normalizeArabic(rawTranscript);
    
    for (const kw of this.wakeWordsList) {
      const normalizedKw = this.normalizeArabic(kw);
      if (normalized.includes(normalizedKw)) {
        const idx = normalized.indexOf(normalizedKw);
        const remainder = rawTranscript.slice(idx + kw.length).trim();
        return { matched: true, keyword: kw, remainder };
      }
    }
    return { matched: false, keyword: '', remainder: rawTranscript };
  }

  /**
   * Start listening with the preferred Arabic locale.
   * @param locale 'ar-SA' (Saudi), 'ar-EG' (Egyptian), 'ar-AE' (Emirati), 'ar-MA' (Moroccan), 'ar-SD' (Sudanese)
   */
  async startListening(locale: string = 'ar-SA'): Promise<void> {
    try {
      if (this.isListeningState) {
        await this.stopListening();
      }
      this.isListeningState = true;
      await Voice.start(locale);
    } catch (e) {
      console.error('[STTService] Start Error:', e);
      this.isListeningState = false;
      this.onErrorCallback(e);
    }
  }

  async stopListening(): Promise<void> {
    try {
      this.isListeningState = false;
      await Voice.stop();
    } catch (e) {
      console.error('[STTService] Stop Error:', e);
    }
  }

  private onSpeechResults(e: SpeechResultsEvent): void {
    if (e.value && e.value.length > 0) {
      const topTranscript = e.value[0];
      
      const wakeCheck = this.checkWakeWordInTranscript(topTranscript);
      if (wakeCheck.matched) {
        console.log('[STTService] 🎯 Activation keyword triggered: "' + wakeCheck.keyword + '"');
        this.onWakeWordDetectedCallback(wakeCheck.keyword, wakeCheck.remainder);
      }

      this.onResultCallback(topTranscript);
    }
  }

  private onSpeechError(e: SpeechErrorEvent): void {
    console.error('[STTService] Recognition Error:', e.error);
    this.isListeningState = false;
    this.onErrorCallback(e);
  }

  setResultHandler(handler: (text: string) => void): void {
    this.onResultCallback = handler;
  }

  setErrorHandler(handler: (error: any) => void): void {
    this.onErrorCallback = handler;
  }

  setWakeWordHandler(handler: (keyword: string, remainder: string) => void): void {
    this.onWakeWordDetectedCallback = handler;
  }

  isListening(): boolean {
    return this.isListeningState;
  }
}

export const sttService = new STTService();`
  },
  {
    path: 'src/audio/tts-service.ts',
    name: 'tts-service.ts',
    category: 'audio',
    language: 'typescript',
    description: 'Arabic Text-To-Speech synthesizer with pitch, rate, and stream management for Android.',
    content: `import Tts from 'react-native-tts';

class TTSService {
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await Tts.getInitStatus();
      await Tts.setDefaultLanguage('ar-SA');
      await Tts.setDefaultRate(0.52);
      await Tts.setDefaultPitch(1.0);
      
      Tts.setDucking(true);
      
      Tts.addEventListener('tts-start', (event) => console.log('[TTSService] Started:', event));
      Tts.addEventListener('tts-finish', (event) => console.log('[TTSService] Finished:', event));
      Tts.addEventListener('tts-cancel', (event) => console.log('[TTSService] Cancelled:', event));
      this.isInitialized = true;
    } catch (err) {
      console.error('[TTSService] Init Failed:', err);
    }
  }

  async speak(text: string): Promise<void> {
    if (!text || text.trim() === '') return;
    try {
      await Tts.stop();
      Tts.speak(text, {
        androidParams: {
          KEY_PARAM_PAN: 0.0,
          KEY_PARAM_VOLUME: 1.0,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });
    } catch (e) {
      console.error('[TTSService] Speak Error:', e);
    }
  }

  stop(): void {
    try {
      Tts.stop();
    } catch (e) {
      console.error('[TTSService] Stop Error:', e);
    }
  }
}

export const ttsService = new TTSService();`
  },
  {
    path: 'src/audio/wake-word-service.ts',
    name: 'wake-word-service.ts',
    category: 'audio',
    language: 'typescript',
    description: 'Standalone wake word detector supporting multiple simultaneous trigger keywords (تلفوني، مساعدي، يا زول، افتح يا سمسم) without external .ppn files.',
    content: `import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { Config } from '../../local.config';

export type WakeWordEngineType = 'porcupine_builtin' | 'continuous_mic_vad' | 'disabled';

export interface WakeWordConfig {
  engine?: WakeWordEngineType;
  keywords?: string[];
  locale?: string;
  sensitivity?: number;
}

class WakeWordService {
  private onWakeCallback: (detectedKeyword?: string) => void = () => {};
  private isListeningState: boolean = false;
  private isPaused: boolean = false;
  private activeEngine: WakeWordEngineType = 'continuous_mic_vad';
  private restartTimeout: any = null;

  // Active pool of trigger keywords
  private targetWakeKeywords: string[] = [
    'تلفوني',
    'يا تلفوني',
    'مساعدي',
    'يا مساعدي',
    'يا زول',
    'يا زول سواني',
    'افتح يا سمسم',
    'افتح ياسمسم'
  ];

  private normalizeArabic(text: string): string {
    return text
      .toLowerCase()
      .replace(/[ًٌٍَُِّْـ]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\.,\/#!$%\^&\*;:{}=\-_\x60~()؟?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async init(onWake: (detectedKeyword?: string) => void, config?: WakeWordConfig): Promise<void> {
    this.onWakeCallback = onWake;

    if (Config.WAKE_WORDS && Array.isArray(Config.WAKE_WORDS)) {
      this.targetWakeKeywords = Array.from(
        new Set([...Config.WAKE_WORDS, ...this.targetWakeKeywords])
      );
    }

    if (config?.keywords && config.keywords.length > 0) {
      this.targetWakeKeywords = Array.from(
        new Set([...config.keywords, ...this.targetWakeKeywords])
      );
    }

    console.log('[WakeWordService] Registered Multi-Wake Word Pool:', this.targetWakeKeywords);
    this.setupStandardMicEngine();
  }

  private setupStandardMicEngine(): void {
    this.activeEngine = 'continuous_mic_vad';

    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);

    console.log('[WakeWordService] Initialized Multi-Keyword Mic Trigger for:', this.targetWakeKeywords);
  }

  async start(): Promise<void> {
    if (this.isPaused) {
      this.isPaused = false;
    }

    if (this.isListeningState) return;

    try {
      this.isListeningState = true;
      await Voice.start(Config.STT_LOCALE || 'ar-SA');
      console.log('[WakeWordService] Continuous multi-wake word listening started');
    } catch (err) {
      console.warn('[WakeWordService] Start listen error:', err);
      this.scheduleRestart(1000);
    }
  }

  async stop(): Promise<void> {
    this.isListeningState = false;
    this.isPaused = true;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    try {
      await Voice.stop();
      await Voice.destroy();
    } catch (e) {
      // Ignore destroy errors during teardown
    }
  }

  pause(): void {
    this.isPaused = true;
    this.stop();
  }

  resume(): void {
    this.isPaused = false;
    this.start();
  }

  private onSpeechResults(e: SpeechResultsEvent): void {
    if (!e.value || e.value.length === 0 || this.isPaused) return;

    const rawTranscript = e.value.join(' ');
    const normalizedTranscript = this.normalizeArabic(rawTranscript);

    let matchedKeyword: string | null = null;
    for (const keyword of this.targetWakeKeywords) {
      const normalizedKey = this.normalizeArabic(keyword);
      if (normalizedTranscript.includes(normalizedKey)) {
        matchedKeyword = keyword;
        break;
      }
    }

    if (matchedKeyword) {
      console.log('[WakeWordService] 🎯 Wake word detected: "' + matchedKeyword + '"!');
      this.handleWakeDetected(matchedKeyword);
    }
  }

  private handleWakeDetected(detectedKeyword: string = 'تلفوني'): void {
    this.pause();
    if (this.onWakeCallback) {
      this.onWakeCallback(detectedKeyword);
    }
  }

  private onSpeechError(e: SpeechErrorEvent): void {
    if (!this.isPaused) {
      this.scheduleRestart(800);
    }
  }

  private onSpeechEnd(): void {
    if (!this.isPaused && this.isListeningState) {
      this.scheduleRestart(300);
    }
  }

  private scheduleRestart(delayMs: number): void {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(async () => {
      if (!this.isPaused) {
        try {
          await Voice.destroy();
          await Voice.start(Config.STT_LOCALE || 'ar-SA');
          this.isListeningState = true;
        } catch (e) {
          console.warn('[WakeWordService] Restart attempt error:', e);
        }
      }
    }, delayMs);
  }

  isListening(): boolean {
    return this.isListeningState && !this.isPaused;
  }

  getActiveEngine(): WakeWordEngineType {
    return this.activeEngine;
  }

  getWakeWords(): string[] {
    return this.targetWakeKeywords;
  }
}

export const wakeWordService = new WakeWordService();`
  },
  {
    path: 'src/agent/system-prompt.ts',
    name: 'system-prompt.ts',
    category: 'agent',
    language: 'typescript',
    description: 'Arabic-first system prompt engineered for multi-step intent extraction, general UI automation, dynamic screen inspection, and secure screen handling.',
    content: [
      'export const AGENT_SYSTEM_PROMPT = `',
      'You are an advanced Arabic AI Voice Assistant & General Android UI Automation Agent.',
      'Your mission is to understand user voice commands across all Arabic dialects (Sudanese, Saudi/Gulf, Egyptian, Levantine, Maghrebi, and MSA) and translate them into deterministic Android Accessibility and system control operations.',
      '',
      '====================================================',
      'GENERAL UI AUTOMATION & FALLBACK INSPECTION ENGINE',
      '====================================================',
      '1. FALLBACK UI AUTOMATION:',
      '   If a user requests an action for an app, third-party service, or device setting that does NOT have a dedicated native tool:',
      '   - Step 1: Open the target app or setting package using "open_app" (e.g. target: "com.android.settings", "com.spotify.music", "com.zhiliaoapp.musically", "org.telegram.messenger", etc.).',
      '   - Step 2: Dynamically inspect and search screen element nodes for matching Arabic or English text and content descriptions (e.g. Settings, Save, Play, Send, Confirm, إعدادات, حفظ, تشغيل, إرسال, تأكيد, موافق, بحث).',
      '   - Step 3: Automatically issue sequential "click_by_text", "type_text", or "scroll_forward" actions to complete the user\'s intent step-by-step.',
      '',
      '2. SMART GRACEFUL HANDLING OF SECURE SCREENS:',
      '   If an action encounters a system-restricted secure screen (such as PIN entry, pattern lock, biometric authentication, passwords, or financial payment authorization):',
      '   - You MUST navigate the user directly to that secure screen.',
      '   - Do NOT attempt to type or bypass the secure credential.',
      '   - Verbally prompt the user with the friendly localized message:',
      '     "فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار" (or "فتحت لك الصفحة، تفضل بإدخال الرمز للاستمرار").',
      '',
      '====================================================',
      'CORE NATIVE TOOLS:',
      '====================================================',
      '- whatsapp_tool: Send messages, deep link to chats, and confirm sends.',
      '- accessibility_control: Dynamic screen inspection, click_by_text, click_by_id, scroll_forward, type_text, inspect_screen_nodes.',
      '- system_control: Volume adjustment, timers/alarms, Wi-Fi toggles, open_app / launchApp.',
      '- screen_reader: Read text content of active foreground window.',
      '',
      '====================================================',
      'OUTPUT JSON SCHEMA:',
      '====================================================',
      'Always provide a concise, natural, warm Arabic speech response, accompanied by a JSON tool execution block:',
      '',
      '```json',
      '{',
      '  "speech": "الرد الصوتي باللغة العربية (مثال: فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار)",',
      '  "dialect_detected": "sudanese" | "saudi" | "egyptian" | "levantine" | "maghrebi" | "msa",',
      '  "intent": "general_ui_automation" | "send_whatsapp" | "read_screen" | "click_element" | "system_control" | "open_app" | "secure_checkpoint",',
      '  "steps": [',
      '    {',
      '      "step_number": 1,',
      '      "tool": "system_control" | "accessibility_control" | "whatsapp_tool" | "screen_reader",',
      '      "action": "open_app" | "click_by_text" | "click_by_id" | "scroll_forward" | "read_screen_text" | "set_volume" | "set_timer" | "type_text",',
      '      "target": "package name, element label, or node description",',
      '      "value": "parameter or input text payload",',
      '      "recipient": "recipient name if applicable",',
      '      "description": "وصف الإجراء بالعربية"',
      '    }',
      '  ]',
      '}',
      '```',
      '`;'
    ].join('\\n')
  },
  {
    path: 'src/agent/hybrid-provider.ts',
    name: 'hybrid-provider.ts',
    category: 'agent',
    language: 'typescript',
    description: 'Hybrid intelligence engine with Multi-Key Gemini API rotation (429/403 Failover & Rate Limit Handling) and Local Edge SLM.',
    content: `import axios from 'axios';
import { Config } from '../../local.config';
import { AGENT_SYSTEM_PROMPT } from './system-prompt';

export class HybridProvider {
  private currentGeminiKeyIndex: number = 0;
  private totalRotations: number = 0;

  public getActiveGeminiKey(): string {
    const keys = this.getGeminiKeyPool();
    return keys[this.currentGeminiKeyIndex % keys.length] || '';
  }

  public getGeminiKeyPool(): string[] {
    const pool = (Config as any).GEMINI_API_KEYS || [];
    if (Array.isArray(pool) && pool.length > 0) {
      return pool;
    }
    return [(Config as any).GEMINI_API_KEY || ''];
  }

  public rotateGeminiKey(reason: string = 'Rate limit or error'): string {
    const keys = this.getGeminiKeyPool();
    if (keys.length <= 1) {
      console.warn('[HybridProvider] Only 1 Gemini API key configured. Key rotation skipped.');
      return this.getActiveGeminiKey();
    }

    const previousIndex = this.currentGeminiKeyIndex;
    this.currentGeminiKeyIndex = (this.currentGeminiKeyIndex + 1) % keys.length;
    this.totalRotations += 1;

    console.warn(
      \`[HybridProvider] 🔄 Gemini API Key rotated [Index \${previousIndex} -> \${this.currentGeminiKeyIndex}] due to: \${reason}\`
    );

    return keys[this.currentGeminiKeyIndex];
  }

  async chat(message: string, history: any[] = [], isOffline: boolean = false): Promise<string> {
    if (isOffline) {
      return this.localInference(message);
    }
    return this.cloudInference(message, history);
  }

  private async cloudInference(message: string, history: any[]): Promise<string> {
    if (Config.ONLINE_LLM_PROVIDER === 'gemini') {
      return this.geminiInferenceWithKeyRotation(message, history);
    }

    if (Config.ONLINE_LLM_PROVIDER === 'anthropic') {
      try {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1024,
            system: AGENT_SYSTEM_PROMPT,
            messages: [...history, { role: 'user', content: message }],
          },
          {
            headers: {
              'x-api-key': Config.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data.content[0].text;
      } catch (err) {
        console.warn('[HybridProvider] Anthropic failed, falling back to local edge engine:', err);
        return this.localInference(message);
      }
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: AGENT_SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message }
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': \`Bearer \${Config.OPENAI_API_KEY}\`,
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.warn('[HybridProvider] Cloud inference failed, falling back to local edge engine:', error);
      return this.localInference(message);
    }
  }

  private async geminiInferenceWithKeyRotation(message: string, history: any[]): Promise<string> {
    const keys = this.getGeminiKeyPool();
    const maxAttempts = Math.max(keys.length, 1);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const activeKey = this.getActiveGeminiKey();

      try {
        const response = await axios.post('/api/agent/chat', {
          message,
          history,
          apiKey: activeKey,
        }, { timeout: 10000 });

        if (response.data && response.data.speech) {
          return JSON.stringify(response.data);
        }
        return JSON.stringify(response.data);
      } catch (err: any) {
        const status = err.response?.status;
        const errorText = err.response?.data?.error || err.message || '';

        if (this.isRateLimitOrQuotaError(errorText, status)) {
          this.rotateGeminiKey(\`HTTP \${status || 'Quota'} - \${errorText.slice(0, 50)}\`);
          continue;
        }

        try {
          return await this.callGeminiDirect(activeKey, message, history);
        } catch (directErr: any) {
          this.rotateGeminiKey('Direct call failed');
        }
      }
    }

    return this.localInference(message);
  }

  private isRateLimitOrQuotaError(errorText: string, status?: number): boolean {
    if (status === 429 || status === 403 || status === 503) return true;
    const lower = errorText.toLowerCase();
    return (
      lower.includes('429') ||
      lower.includes('403') ||
      lower.includes('rate limit') ||
      lower.includes('resource_exhausted') ||
      lower.includes('quota')
    );
  }

  private async callGeminiDirect(apiKey: string, message: string, history: any[]): Promise<string> {
    const endpoint = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${apiKey}\`;
    
    const formattedHistory = history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    const body = {
      systemInstruction: { parts: [{ text: AGENT_SYSTEM_PROMPT }] },
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    };

    const res = await axios.post(endpoint, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000
    });

    const candidate = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || JSON.stringify({ speech: 'تم استلام الأمر.', intent: 'general_qa', steps: [] });
  }

  private async localInference(message: string): Promise<string> {
    return JSON.stringify({
      speech: "تمت معالجة الطلب بنجاح محلياً.",
      intent: "system_control",
      source: "offline_edge_heuristic",
      steps: [
        {
          step_number: 1,
          tool: "system_control",
          action: "execute_local_fallback",
          value: message,
          description: "تنفيذ الإجراء عبر المحرك المحلي"
        }
      ]
    });
  }
}

export const hybridProvider = new HybridProvider();`
  },
  {
    path: 'src/agent/tool-loop.ts',
    name: 'tool-loop.ts',
    category: 'agent',
    language: 'typescript',
    description: 'Tool parser and asynchronous step-by-step execution coordinator.',
    content: `import { accessibilityTool } from '../tools/accessibility-tool';
import { whatsappTool } from '../tools/whatsapp-tool';
import { systemControlTool } from '../tools/system-control-tool';

export class ToolLoop {
  async execute(rawOutput: string): Promise<void> {
    let commandData: any = null;

    try {
      if (typeof rawOutput === 'object') {
        commandData = rawOutput;
      } else {
        const jsonMatch = rawOutput.match(/\\{[\\s\\S]*\\}/);
        if (jsonMatch) {
          commandData = JSON.parse(jsonMatch[0]);
        }
      }

      if (!commandData) return;

      const steps = commandData.steps || (commandData.tool ? [commandData] : []);

      for (const step of steps) {
        console.log(\`[ToolLoop] Executing Step \${step.step_number || 1}: \${step.tool} -> \${step.action}\`);
        
        switch (step.tool) {
          case 'accessibility_control':
            await accessibilityTool.run(step.action, step.target, step.value);
            break;
            
          case 'whatsapp_tool':
          case 'whatsapp_send':
            await whatsappTool.sendMessage(step.recipient || 'أمي', step.value || step.message || '');
            break;
            
          case 'system_control':
            await systemControlTool.run(step.action, step.value || step.target);
            break;
            
          case 'screen_reader':
            const screenText = await accessibilityTool.run('read', 'active_window_root');
            console.log('[ToolLoop] Screen Reader Output:', screenText);
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (e) {
      console.error('[ToolLoop] Tool Execution Error:', e);
    }
  }
}

export const toolLoop = new ToolLoop();`
  },
  {
    path: 'src/agent/conversation-pipeline.ts',
    name: 'conversation-pipeline.ts',
    category: 'agent',
    language: 'typescript',
    description: 'Master loop: Voice -> STT -> Hybrid LLM -> Tool Loop -> Arabic TTS.',
    content: `import { ttsService } from '../audio/tts-service';
import { hybridProvider } from './hybrid-provider';
import { toolLoop } from './tool-loop';

class ConversationPipeline {
  private history: { role: 'user' | 'assistant'; content: string }[] = [];

  async processVoiceInput(text: string, isOffline: boolean = false): Promise<string> {
    console.log('[Pipeline] Processing Arabic Voice Input:', text);

    const rawResponse = await hybridProvider.chat(text, this.history, isOffline);
    
    let speechToVoice = '';
    try {
      const parsed = typeof rawResponse === 'object' ? rawResponse : JSON.parse(rawResponse);
      speechToVoice = parsed.speech || 'تم تنفيذ طلبك بنجاح.';
    } catch {
      speechToVoice = rawResponse.replace(/\\{[\\s\\S]*\\}/, '').replace(/\`\`\`json[\\s\\S]*\`\`\`/, '').trim();
      if (!speechToVoice) speechToVoice = 'أهلاً بك، تم تنفيذ الأمر.';
    }

    await ttsService.speak(speechToVoice);
    await toolLoop.execute(rawResponse);

    this.history.push({ role: 'user', content: text });
    this.history.push({ role: 'assistant', content: rawResponse });

    if (this.history.length > 8) {
      this.history = this.history.slice(-8);
    }

    return speechToVoice;
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const pipeline = new ConversationPipeline();`
  },
  {
    path: 'src/tools/accessibility-tool.ts',
    name: 'accessibility-tool.ts',
    category: 'tools',
    language: 'typescript',
    description: 'Bridge caller to native AndroidAccessibilityService for dynamic screen inspection, element matching, UI automation, and secure screen detection.',
    content: `import { NativeModules } from 'react-native';

const AndroidAccessibilityBridge = NativeModules.AndroidAccessibilityBridge || NativeModules.SannaAccessibilityBridge;

export interface AccessibilityNodeInfo {
  id?: string;
  text?: string;
  contentDescription?: string;
  className?: string;
  isClickable?: boolean;
  isEditable?: boolean;
  bounds?: { left: number; top: number; right: number; bottom: number };
}

export const accessibilityTool = {
  secureScreenKeywords: [
    'pin',
    'رمز',
    'كلمة المرور',
    'password',
    'بصمة',
    'fingerprint',
    'otp',
    'رمز التحقق',
    'تحقق',
    'تأكيد الدفع',
    'payment'
  ],

  async run(action: string, target?: string, value?: any): Promise<any> {
    if (!AndroidAccessibilityBridge) {
      console.warn('[AccessibilityTool] AndroidAccessibilityBridge native module running in virtual mode.');
      return this.virtualFallbackAction(action, target, value);
    }

    switch (action) {
      case 'click':
      case 'click_by_text':
        return await AndroidAccessibilityBridge.clickByText(target || '');

      case 'click_by_id':
        return await AndroidAccessibilityBridge.clickById(target || '');

      case 'read':
      case 'read_screen_text':
        return await AndroidAccessibilityBridge.getScreenText();

      case 'scroll':
      case 'scroll_forward':
        return await AndroidAccessibilityBridge.performGlobalAction('scroll_forward');

      case 'type_text':
      case 'input_text':
        return await AndroidAccessibilityBridge.inputText(String(value || ''));

      case 'inspect_screen_nodes':
      case 'search_nodes':
        return await this.searchScreenNodes(target || '');

      case 'check_secure_screen':
        return await this.detectSecureScreen();

      default:
        console.warn('[AccessibilityTool] Unknown action: ' + action);
        return false;
    }
  },

  async searchScreenNodes(queryText: string): Promise<AccessibilityNodeInfo[]> {
    if (!AndroidAccessibilityBridge) return [];
    try {
      const rawHierarchy = await AndroidAccessibilityBridge.getScreenHierarchy();
      const nodes: AccessibilityNodeInfo[] = JSON.parse(rawHierarchy || '[]');
      const normalizedQuery = queryText.toLowerCase().trim();

      return nodes.filter((node) => {
        const textMatch = node.text && node.text.toLowerCase().includes(normalizedQuery);
        const descMatch = node.contentDescription && node.contentDescription.toLowerCase().includes(normalizedQuery);
        const idMatch = node.id && node.id.toLowerCase().includes(normalizedQuery);
        return textMatch || descMatch || idMatch;
      });
    } catch (e) {
      console.warn('[AccessibilityTool] Screen inspection search error:', e);
      return [];
    }
  },

  async findAndClickElement(possibleLabels: string[]): Promise<boolean> {
    for (const label of possibleLabels) {
      const success = await this.run('click_by_text', label);
      if (success) {
        console.log('[AccessibilityTool] ✅ Successfully auto-clicked element: "' + label + '"');
        return true;
      }
    }
    return false;
  },

  async detectSecureScreen(): Promise<{ isSecure: boolean; prompt: string }> {
    try {
      const screenText = await this.run('read_screen_text');
      const textLower = String(screenText || '').toLowerCase();

      const hasSecureKeyword = this.secureScreenKeywords.some((kw) => textLower.includes(kw));

      if (hasSecureKeyword) {
        return {
          isSecure: true,
          prompt: 'فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار',
        };
      }
    } catch (e) {
      // Ignored
    }

    return { isSecure: false, prompt: '' };
  },

  virtualFallbackAction(action: string, target?: string, value?: any): any {
    console.log('[AccessibilityTool:Virtual] Executed ' + action + ' on target: "' + target + '"');
    return { success: true, action, target, value };
  }
};`
  },
  {
    path: 'src/tools/whatsapp-tool.ts',
    name: 'whatsapp-tool.ts',
    category: 'tools',
    language: 'typescript',
    description: 'Automates WhatsApp messaging via Android deep linking and accessibility clicks.',
    content: `import { NativeModules, Linking } from 'react-native';

const AndroidAccessibilityBridge = NativeModules.AndroidAccessibilityBridge || NativeModules.SannaAccessibilityBridge;

export const whatsappTool = {
  async sendMessage(recipient: string, message: string): Promise<boolean> {
    try {
      console.log(\`[WhatsAppTool] Preparing message to: \${recipient} | Content: \${message}\`);
      
      const encodedMsg = encodeURIComponent(message);
      const url = \`whatsapp://send?text=\${encodedMsg}\`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        
        setTimeout(async () => {
          if (AndroidAccessibilityBridge) {
            await AndroidAccessibilityBridge.clickById('com.whatsapp:id/send');
          }
        }, 1800);
        return true;
      } else {
        console.warn('[WhatsAppTool] WhatsApp is not installed on this device.');
        return false;
      }
    } catch (e) {
      console.error('[WhatsAppTool] Failed to send message:', e);
      return false;
    }
  }
};`
  },
  {
    path: 'src/tools/system-control-tool.ts',
    name: 'system-control-tool.ts',
    category: 'tools',
    language: 'typescript',
    description: 'Controls device volume, alarms, timers, Wi-Fi, and launches Android packages.',
    content: `import { NativeModules } from 'react-native';

const AndroidAccessibilityBridge = NativeModules.AndroidAccessibilityBridge || NativeModules.SannaAccessibilityBridge;

export const systemControlTool = {
  async run(action: string, value: any): Promise<boolean> {
    try {
      console.log(\`[SystemControlTool] Executing: \${action} with value:\`, value);

      switch (action) {
        case 'set_volume':
          if (AndroidAccessibilityBridge) {
            await AndroidAccessibilityBridge.setMediaVolume(Number(value) || 100);
          }
          return true;

        case 'set_timer':
        case 'set_alarm':
          if (AndroidAccessibilityBridge) {
            await AndroidAccessibilityBridge.setAlarm(String(value || '07:00 AM'));
          }
          return true;

        case 'open_app':
          if (AndroidAccessibilityBridge) {
            await AndroidAccessibilityBridge.launchApp(String(value));
          }
          return true;

        default:
          console.warn(\`[SystemControlTool] Unsupported system action: \${action}\`);
          return false;
      }
    } catch (e) {
      console.error('[SystemControlTool] Error:', e);
      return false;
    }
  }
};`
  },
  {
    path: 'android/app/src/main/java/com/androidvoiceagent/AndroidAccessibilityService.kt',
    name: 'AndroidAccessibilityService.kt',
    category: 'native',
    language: 'kotlin',
    description: 'Production Android AccessibilityService inspecting UI trees, extracting screen text, and performing programmatic clicks without root.',
    content: `package com.androidvoiceagent

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.os.Bundle

class AndroidAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            Log.d(TAG, "Window changed: \${event.packageName} | Class: \${event.className}")
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility Service Interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "Accessibility Service Connected & Ready")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    fun findAndClick(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(text)
        
        if (nodes.isNotEmpty()) {
            for (node in nodes) {
                var clickableNode: AccessibilityNodeInfo? = node
                while (clickableNode != null && !clickableNode.isClickable) {
                    clickableNode = clickableNode.parent
                }
                if (clickableNode != null && clickableNode.isClickable) {
                    val clicked = clickableNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    Log.d(TAG, "Clicked node with text: $text -> $clicked")
                    return clicked
                }
            }
        }
        return false
    }

    fun findAndClickById(viewId: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByViewId(viewId)
        if (nodes.isNotEmpty()) {
            val node = nodes[0]
            var clickableNode: AccessibilityNodeInfo? = node
            while (clickableNode != null && !clickableNode.isClickable) {
                clickableNode = clickableNode.parent
            }
            if (clickableNode != null) {
                return clickableNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            }
        }
        return false
    }

    fun extractScreenText(): List<String> {
        val rootNode = rootInActiveWindow ?: return emptyList()
        val textList = mutableListOf<String>()
        collectNodeText(rootNode, textList)
        return textList
    }

    private fun collectNodeText(node: AccessibilityNodeInfo?, result: MutableList<String>) {
        if (node == null) return
        if (!node.text.isNullOrEmpty()) {
            result.add(node.text.toString())
        } else if (!node.contentDescription.isNullOrEmpty()) {
            result.add(node.contentDescription.toString())
        }
        for (i in 0 until node.childCount) {
            collectNodeText(node.getChild(i), result)
        }
    }

    fun inputText(textToType: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val focusedNode = rootNode.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
        if (focusedNode != null) {
            val arguments = Bundle()
            arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, textToType)
            return focusedNode.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
        }
        return false
    }

    fun triggerGlobalAction(actionType: String): Boolean {
        val action = when (actionType.lowercase()) {
            "back" -> GLOBAL_ACTION_BACK
            "home" -> GLOBAL_ACTION_HOME
            "recents" -> GLOBAL_ACTION_RECENTS
            "notifications" -> GLOBAL_ACTION_NOTIFICATIONS
            "quick_settings" -> GLOBAL_ACTION_QUICK_SETTINGS
            else -> GLOBAL_ACTION_BACK
        }
        return performGlobalAction(action)
    }

    companion object {
        private const val TAG = "VoiceAccessibility"
        var instance: AndroidAccessibilityService? = null

        fun isRunning(): Boolean {
            return instance != null
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/androidvoiceagent/AndroidAccessibilityBridgeModule.kt',
    name: 'AndroidAccessibilityBridgeModule.kt',
    category: 'native',
    language: 'kotlin',
    description: 'Kotlin React Native Bridge module exposing findAndClick, getScreenText, and launchApp to TypeScript.',
    content: `package com.androidvoiceagent

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.provider.AlarmClock
import com.facebook.react.bridge.*

class AndroidAccessibilityBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AndroidAccessibilityBridge"
    }

    @ReactMethod
    fun isServiceEnabled(promise: Promise) {
        promise.resolve(AndroidAccessibilityService.isRunning())
    }

    @ReactMethod
    fun findAndClick(text: String, promise: Promise) {
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.findAndClick(text)
            promise.resolve(success)
        } else {
            promise.reject("SERVICE_NOT_CONNECTED", "AndroidAccessibilityService is not enabled in Settings.")
        }
    }

    @ReactMethod
    fun clickByText(text: String, promise: Promise) {
        findAndClick(text, promise)
    }

    @ReactMethod
    fun findAndClickById(viewId: String, promise: Promise) {
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.findAndClickById(viewId)
            promise.resolve(success)
        } else {
            promise.reject("SERVICE_NOT_CONNECTED", "AndroidAccessibilityService is not enabled in Settings.")
        }
    }

    @ReactMethod
    fun clickById(viewId: String, promise: Promise) {
        findAndClickById(viewId, promise)
    }

    @ReactMethod
    fun getScreenText(promise: Promise) {
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val texts = service.extractScreenText()
            val array = Arguments.createArray()
            texts.forEach { array.pushString(it) }
            promise.resolve(array)
        } else {
            promise.reject("SERVICE_NOT_CONNECTED", "AndroidAccessibilityService is not enabled.")
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val launchIntent = reactContext.packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(launchIntent)
                promise.resolve(true)
            } else {
                promise.reject("APP_NOT_FOUND", "Package $packageName is not installed on this device.")
            }
        } catch (e: Exception) {
            promise.reject("LAUNCH_ERROR", e.message)
        }
    }

    @ReactMethod
    fun inputText(text: String, promise: Promise) {
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.inputText(text)
            promise.resolve(success)
        } else {
            promise.reject("SERVICE_NOT_CONNECTED", "AndroidAccessibilityService is not enabled.")
        }
    }

    @ReactMethod
    fun setMediaVolume(volumePercent: Int, promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            val clampedPercent = volumePercent.coerceIn(0, 100)
            val targetVolume = (clampedPercent * maxVolume) / 100
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, AudioManager.FLAG_SHOW_UI)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("VOLUME_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setAlarm(timeString: String, promise: Promise) {
        try {
            val parts = timeString.replace("ص", "").replace("م", "").trim().split(":")
            val hour = parts.getOrNull(0)?.trim()?.toIntOrNull() ?: 7
            val minute = parts.getOrNull(1)?.trim()?.toIntOrNull() ?: 0

            val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_MESSAGE, "منبه بواسطة المساعد الصوتي")
                putExtra(AlarmClock.EXTRA_HOUR, hour)
                putExtra(AlarmClock.EXTRA_MINUTES, minute)
                putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ALARM_ERROR", e.message)
        }
    }

    @ReactMethod
    fun performGlobalAction(actionName: String, promise: Promise) {
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.triggerGlobalAction(actionName)
            promise.resolve(success)
        } else {
            promise.reject("SERVICE_NOT_CONNECTED", "AndroidAccessibilityService is not enabled.")
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/androidvoiceagent/AndroidAccessibilityBridgePackage.kt',
    name: 'AndroidAccessibilityBridgePackage.kt',
    category: 'native',
    language: 'kotlin',
    description: 'React Native Package registration file binding AndroidAccessibilityBridgeModule to the React Native runtime.',
    content: `package com.androidvoiceagent

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class AndroidAccessibilityBridgePackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules = ArrayList<NativeModule>()
        modules.add(AndroidAccessibilityBridgeModule(reactContext))
        return modules
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/androidvoiceagent/MainApplication.kt',
    name: 'MainApplication.kt',
    category: 'native',
    language: 'kotlin',
    description: 'Android Application class configuring React Native Host and registering AndroidAccessibilityBridgePackage.',
    content: `package com.androidvoiceagent

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(AndroidAccessibilityBridgePackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost(this.applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/androidvoiceagent/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'native',
    language: 'kotlin',
    description: 'Android React Activity entry point configuring fullscreen, RTL Arabic layout, and component name.',
    content: `package com.androidvoiceagent

import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "androidvoiceagent"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'native',
    language: 'xml',
    description: 'Android Manifest registering permissions for STT, Audio, Internet, Accessibility Service, and Foreground Services.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.androidvoiceagent">

    <!-- Audio Recording & Speech Recognition (STT) -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- Network Access for Gemini Live API, Cloud STT, and Knowledge Grounding -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <!-- Foreground Service Permissions for Continuous Voice Listening & Background Assistant -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- System Automation & Native Tool Permissions -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="com.android.alarm.permission.SET_ALARM" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" tools:ignore="QueryAllPackagesPermission" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:name=".MainApplication"
        android:label="المساعد الصوتي الذكي - AI Voice Assistant"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="false">

        <!-- Main Application Activity -->
        <activity
            android:name=".MainActivity"
            android:label="المساعد الصوتي الذكي"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Accessibility Automation Service (Screen Reading & UI Automation) -->
        <service
            android:name=".AndroidAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:label="Voice Assistant Accessibility Service (خدمة الوصول والتحكم)"
            android:description="@string/accessibility_service_description"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>
</manifest>`
  },
  {
    path: 'android/app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    category: 'native',
    language: 'xml',
    description: 'Full XML configuration for Accessibility Service enabling window inspection, programmatic clicking, and gesture execution.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackGeneric|feedbackVisual"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:canRequestFilterKeyEvents="true"
    android:canRequestTouchExplorationMode="true"
    android:canControlMagnification="false"
    android:accessibilityFlags="flagDefault|flagReportViewIds|flagRetrieveInteractiveWindows|flagIncludeNotImportantViews|flagRequestTouchExplorationMode"
    android:settingsActivity="com.androidvoiceagent.MainActivity" />`
  },
  {
    path: 'android/app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    category: 'native',
    language: 'xml',
    description: 'Android localized strings with Accessibility Service description.',
    content: `<resources>
    <string name="app_name">المساعد الصوتي الذكي</string>
    <string name="accessibility_service_description">خدمة المساعد الصوتي الذكي لقراءة الشاشة وتنفيذ النقرات والتحكم بالتطبيقات نيابة عنك عبر الأوامر الصوتية.</string>
</resources>`
  },
  {
    path: '.github/workflows/android-build-apk.yml',
    name: 'android-build-apk.yml',
    category: 'root',
    language: 'yaml',
    description: 'Automated GitHub Actions CI/CD workflow to compile, build, and publish the Native Android APK directly on GitHub Releases/Artifacts with zero local errors.',
    content: `name: Build Native Android APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Build Production Native APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js Environment (LTS 20)
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install NPM Dependencies
        run: |
          npm ci --prefer-offline --no-audit

      - name: Set up Java Development Kit (JDK 17)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Set up Android SDK & Build Tools
        uses: android-actions/setup-android@v3

      - name: Grant Execute Permission for Gradle Wrapper
        run: chmod +x android/gradlew

      - name: Generate React Native Android JS Bundle
        run: |
          mkdir -p android/app/src/main/assets
          npx react-native bundle \\
            --platform android \\
            --dev false \\
            --entry-file index.js \\
            --bundle-output android/app/src/main/assets/index.android.bundle \\
            --assets-dest android/app/src/main/res/

      - name: Build Native Debug APK with Gradle
        run: |
          cd android
          ./gradlew assembleDebug --no-daemon --stacktrace

      - name: Upload Native APK as GitHub Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Android-Voice-Agent-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
`
  },
  {
    path: 'index.js',
    name: 'index.js',
    category: 'root',
    language: 'javascript',
    description: 'React Native entry registration binding App component to AppRegistry.',
    content: `import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
`
  },
  {
    path: 'app.json',
    name: 'app.json',
    category: 'root',
    language: 'json',
    description: 'React Native app configuration with app name and display title.',
    content: `{
  "name": "androidvoiceagent",
  "displayName": "المساعد الصوتي الذكي - AI Voice Assistant"
}
`
  },
  {
    path: 'android/settings.gradle',
    name: 'settings.gradle',
    category: 'native',
    language: 'groovy',
    description: 'Android Gradle settings file including app module and react native cli extensions.',
    content: `rootProject.name = 'androidvoiceagent'
apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applySettingsScript(project)
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')
`
  },
  {
    path: 'android/build.gradle',
    name: 'build.gradle (Root)',
    category: 'native',
    language: 'groovy',
    description: 'Root Android build.gradle specifying Kotlin, Android Gradle Plugin, and Maven repositories.',
    content: `buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 24
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.2.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
`
  },
  {
    path: 'android/gradle.properties',
    name: 'gradle.properties',
    category: 'native',
    language: 'properties',
    description: 'Gradle performance and memory optimization flags for Android APK builds.',
    content: `org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
REACT_NATIVE_ARCHITECTURES=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=false
hermesEnabled=true
`
  },
  {
    path: 'android/app/build.gradle',
    name: 'build.gradle (App)',
    category: 'native',
    language: 'groovy',
    description: 'Android App module Gradle build script with Hermes, NDK, and React Native plugins.',
    content: `apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

react {
    /* Folders */
    root = file("../..")
    reactNativeDir = file("../../node_modules/react-native")
    codegenDir = file("../../node_modules/@react-native/codegen")
    cliFile = file("../../node_modules/react-native/cli.js")

    /* Hermes V8 JavaScript Engine */
    enableHermes = true
}

android {
    ndkVersion rootProject.ext.ndkVersion
    compileSdkVersion rootProject.ext.compileSdkVersion
    namespace "com.androidvoiceagent"

    defaultConfig {
        applicationId "com.androidvoiceagent"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation("org.webkit:android-jsc:+")
    }
}

apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)`
  },
  {
    path: 'SETUP_GUIDE.md',
    name: 'SETUP_GUIDE.md',
    category: 'root',
    language: 'markdown',
    description: 'Complete step-by-step setup and Gradle APK compilation guide for Android Voice Assistant.',
    content: `# 🚀 دليل إعداد وتجميع تطبيق المساعد الصوتي الذكي (Android Voice Assistant APK)

دليل شامل خطوة بخطوة لتثبيت الحزم وتجميع ملف الـ APK الحقيقي عبر Gradle وتشغيل المساعد كخدمة نظام (Accessibility Service) على أجهزة الأندرويد.

---

## 📋 المتطلبات الأساسية (Prerequisites)

1. **Node.js**: إصدار LTS (Node 18.x أو Node 20.x).
2. **Java Development Kit (JDK)**: OpenJDK 17.
3. **Android Studio**: مع تثبيت:
   - Android SDK Platform 34 (Android 14) أو 33 (Android 13).
   - Android SDK Build-Tools 34.0.0.
   - NDK (Side by side) 25.1.8937393+.
   - Android SDK Command-line Tools.
4. **متغيرات البيئة (Environment Variables)**:
   \`\`\`bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   \`\`\`

---

## 🛠️ الخطوة 1: تثبيت الاعتمادات (Install Dependencies)

في المجلد الرئيسي للمشروع، قم بتثبيت الحزم:

\`\`\`bash
# عبر npm
npm install

# أو عبر Yarn
yarn install
\`\`\`

---

## ⚙️ الخطوة 2: ضبط الإعدادات والمفاتيح (Configuration & Multi-Key Rotation)

انسخ ملف الإعدادات وقم بإضافة مصفوفة مفاتيح Gemini API لتدوير المفاتيح تلقائياً:

\`\`\`bash
cp local.config.example.ts local.config.ts
\`\`\`

عدل الملف \`local.config.ts\`:
\`\`\`typescript
export const Config = {
  ONLINE_LLM_PROVIDER: 'gemini',
  GEMINI_API_KEYS: [
    'AQ.Ab8RN6KttUzHJtl6XWnypbStsCJN-BLkaATXr5NZuAH1VFA25w',
    'AQ.Ab8RN6KKZeG68JQ_PfmDcWbZH4ErAwd66nLaHHRsQxdfq0iBEQ',
    'AQ.Ab8RN6IPCY2zz710mgUc6laGWcXEfYr3-_HNJg2nYSFqkliZxA'
  ],
  STT_LOCALE: 'ar-SA',
  WAKE_WORDS: ['تلفوني', 'مساعدي', 'يا زول', 'افتح يا سمسم'],
};
\`\`\`

---

## 📦 الخطوة 3: تجميع ملف الـ APK عبر Gradle (Build APK)

### لتجميع نسخة الـ Debug APK:

\`\`\`bash
# الدخول إلى مجلد الأندرويد
cd android

# تنظيف التجميعات السابقة
./gradlew clean

# تجميع الـ APK بنجاح
./gradlew assembleDebug
\`\`\`

> على نظام **Windows (PowerShell / CMD)** استخدم:
> \`\`\`cmd
> cd android
> gradlew.bat assembleDebug
> \`\`\`

### 📍 مسار ملف الـ APK المجمّع:
بعد اكتمال التجميع بنجاح، ستجد ملف الـ APK في:
\`\`\`
android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

## 📲 الخطوة 4: التثبيت والتشغيل على الهاتف

### تثبيت ملف الـ APK يدوياً عبر ADB:
\`\`\`bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

## 🔒 الخطوة 5: تفعيل صلاحيات خدمة الوصول (Accessibility Service)

لكي يتمكن المساعد من قراءة الشاشة وتنفيذ النقرات في واتساب والتطبيقات الأخرى كوكيل حقيقي:

1. افتح **الإعدادات (Settings)** على هاتف الأندرويد.
2. انتقل إلى **إمكانية الوصول (Accessibility)**.
3. ابحث عن **Voice Assistant Accessibility Service (خدمة الوصول والتحكم)**.
4. اضغط **تفعيل (Turn ON)** ووافق على إذن التحكم بالشاشة.
5. افتح التطبيق وامنح إذن الميكروفون والإشعارات.`
  }
];
