export class VoiceAudioEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private audioCtx: AudioContext | null = null;
  private onResultCallback: (transcript: string, isFinal: boolean) => void = () => {};
  private onErrorCallback: (error: string) => void = () => {};
  private onStateChangeCallback: (isListening: boolean) => void = () => {};

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ar-SA';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChangeCallback(true);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.onResultCallback(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.onResultCallback(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[VoiceAudioEngine] Recognition error:', event.error);
        this.isListening = false;
        this.onStateChangeCallback(false);
        this.onErrorCallback(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChangeCallback(false);
      };
    }
  }

  public setLocale(locale: string) {
    if (this.recognition) {
      this.recognition.lang = locale;
    }
  }

  public startListening(locale: string = 'ar-SA'): boolean {
    if (!this.recognition) {
      this.onErrorCallback('Speech recognition is not supported in this browser.');
      return false;
    }
    try {
      this.playWakeChime();
      this.recognition.lang = locale;
      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn('[VoiceAudioEngine] Start failed:', e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public onResult(cb: (transcript: string, isFinal: boolean) => void) {
    this.onResultCallback = cb;
  }

  public onError(cb: (err: string) => void) {
    this.onErrorCallback = cb;
  }

  public onStateChange(cb: (isListening: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  public hasSpeechRecognition(): boolean {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  private speechRate: number = 0.95;
  private speechPitch: number = 1.05;
  private soundEffectsEnabled: boolean = true;

  public setSpeechSettings(rate: number, pitch: number, soundEffects: boolean = true) {
    this.speechRate = rate;
    this.speechPitch = pitch;
    this.soundEffectsEnabled = soundEffects;
  }

  // Text-To-Speech
  public speakArabic(text: string, onEnd?: () => void) {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;

    // Pick best Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic') || v.name.includes('Maged') || v.name.includes('Tarik') || v.name.includes('Laila') || v.name.includes('Salma'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[VoiceAudioEngine] TTS error', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // Audio Synthesizer for Chimes
  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playWakeChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

      osc2.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18); // C6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.06);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio chime error', e);
    }
  }

  public playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15); // E6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio chime error', e);
    }
  }
}

export const voiceAudio = new VoiceAudioEngine();
