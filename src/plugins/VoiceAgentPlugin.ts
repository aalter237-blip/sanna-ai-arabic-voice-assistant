export interface VoiceAgentPluginInterface {
  isAccessibilityEnabled(): Promise<{ enabled: boolean }>;
  openAccessibilitySettings(): Promise<{ success: boolean }>;
  clickByText(options: { text: string }): Promise<{ success: boolean }>;
  clickById(options: { viewId: string }): Promise<{ success: boolean }>;
  getScreenText(): Promise<{ texts: string[] }>;
  inputText(options: { text: string }): Promise<{ success: boolean }>;
  launchApp(options: { packageName: string }): Promise<{ success: boolean }>;
  setVolume(options: { percent: number }): Promise<{ success: boolean }>;
  setAlarm(options: { time: string; label?: string }): Promise<{ success: boolean }>;
  performGlobalAction(options: { action: 'back' | 'home' | 'recents' | 'notifications' | 'quick_settings' }): Promise<{ success: boolean }>;
  startBackgroundListening(options?: { wakeWords?: string[] }): Promise<{ success: boolean }>;
  stopBackgroundListening(): Promise<{ success: boolean }>;
}

const fallbackImplementation: VoiceAgentPluginInterface = {
  isAccessibilityEnabled: async () => ({ enabled: false }),
  openAccessibilitySettings: async () => ({ success: false }),
  clickByText: async () => ({ success: false }),
  clickById: async () => ({ success: false }),
  getScreenText: async () => ({ texts: [] }),
  inputText: async () => ({ success: false }),
  launchApp: async () => ({ success: false }),
  setVolume: async () => ({ success: false }),
  setAlarm: async () => ({ success: false }),
  performGlobalAction: async () => ({ success: false }),
  startBackgroundListening: async () => ({ success: false }),
  stopBackgroundListening: async () => ({ success: false }),
};

export function getVoiceAgentPlugin(): VoiceAgentPluginInterface {
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.Capacitor?.Plugins?.VoiceAgentPlugin) {
      return win.Capacitor.Plugins.VoiceAgentPlugin;
    }
    if (win.VoiceAgentPlugin) {
      return win.VoiceAgentPlugin;
    }
  }
  return fallbackImplementation;
}

export const VoiceAgent = getVoiceAgentPlugin();
