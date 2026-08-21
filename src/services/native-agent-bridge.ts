import { VoiceAgent } from '../plugins/VoiceAgentPlugin';

/**
 * Capacitor Bridge Interface for Native Android Voice Agent & Accessibility Service
 * This bridges web calls directly to the Kotlin native plugin on Android (VoiceAgentPlugin.kt)
 */

export interface NativeActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class NativeAgentBridge {
  private static isCapacitor(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      (window as any).Capacitor &&
      (window as any).Capacitor.isNativePlatform &&
      (window as any).Capacitor.isNativePlatform()
    );
  }

  private static getPlugin(): any {
    if (this.isCapacitor()) {
      return (window as any).VoiceAgent;
    }
    return VoiceAgent;
  }

  /**
   * Check if Native Android Accessibility Service is enabled in System Settings
   */
  public static async isAccessibilityEnabled(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.isServiceEnabled();
      return Boolean(res?.enabled);
    } catch (e) {
      console.warn('[NativeAgentBridge] isAccessibilityEnabled error:', e);
      return false;
    }
  }

  /**
   * Open Android System Accessibility Settings page directly
   */
  public static async openAccessibilitySettings(): Promise<void> {
    const plugin = this.getPlugin();
    if (!plugin) return;
    try {
      await plugin.openAccessibilitySettings();
    } catch (e) {
      console.warn('[NativeAgentBridge] openAccessibilitySettings error:', e);
    }
  }

  /**
   * Start Background Voice Listening Foreground Service (Continuous Wake Word Listener)
   */
  public static async startBackgroundListening(wakeWords: string[] = ['تلفوني', 'مساعدي']): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.startBackgroundListening({ wakeWords });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] startBackgroundListening error:', e);
      return false;
    }
  }

  /**
   * Stop Background Listening Service
   */
  public static async stopBackgroundListening(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.stopBackgroundListening();
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] stopBackgroundListening error:', e);
      return false;
    }
  }

  /**
   * Find UI node with text and perform programmatic click via AccessibilityService
   */
  public static async clickByText(text: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.clickByText({ text });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] clickByText error:', e);
      return false;
    }
  }

  /**
   * Find UI node with View ID and perform programmatic click
   */
  public static async clickById(viewId: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.clickById({ viewId });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] clickById error:', e);
      return false;
    }
  }

  /**
   * Extract all visible text nodes from the active foreground app
   */
  public static async getScreenText(): Promise<string[]> {
    const plugin = this.getPlugin();
    if (!plugin) return [];
    try {
      const res = await plugin.getScreenText();
      return res?.texts || [];
    } catch (e) {
      console.warn('[NativeAgentBridge] getScreenText error:', e);
      return [];
    }
  }

  /**
   * Type text into currently focused input on Android
   */
  public static async inputText(text: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.inputText({ text });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] inputText error:', e);
      return false;
    }
  }

  /**
   * Launch any Android app by package name or search
   */
  public static async launchApp(packageName: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.launchApp({ packageName });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] launchApp error:', e);
      return false;
    }
  }

  /**
   * Adjust Android Media Volume
   */
  public static async setVolume(percent: number): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.setVolume({ percent });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] setVolume error:', e);
      return false;
    }
  }

  /**
   * Set Android System Alarm Clock
   */
  public static async setAlarm(timeString: string, label: string = 'منبه المساعد الصوتي'): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.setAlarm({ time: timeString, label });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] setAlarm error:', e);
      return false;
    }
  }

  /**
   * Trigger Global Android Action: back, home, recents, notifications
   */
  public static async performGlobalAction(action: 'back' | 'home' | 'recents' | 'notifications' | 'quick_settings'): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.performGlobalAction({ action });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] performGlobalAction error:', e);
      return false;
    }
  }

  public static resolveApp(name: string): string {
    const n = (name || "").toLowerCase();
    const map: Record<string,string> = {
      "واتس":"com.whatsapp","واتساب":"com.whatsapp","whatsapp":"com.whatsapp",
      "يوتيوب":"com.google.android.youtube","youtube":"com.google.android.youtube",
      "خرائط":"com.google.android.apps.maps","مابز":"com.google.android.apps.maps",
      "كاميرا":"com.android.camera","إعدادات":"com.android.settings","الاعدادات":"com.android.settings",
      "اتصال":"com.android.dialer","هاتف":"com.android.dialer","رسائل":"com.android.mms",
      "كروم":"com.android.chrome","فيسبوك":"com.facebook.katana","انستقرام":"com.instagram.android",
      "تيليجرام":"org.telegram.messenger","تويتر":"com.twitter.android"
    };
    for (const k of Object.keys(map)) { if (n.includes(k)) return map[k]; }
    return name;
  }
  public static async launchApp(packageName: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      const res = await plugin.launchApp({ packageName: this.resolveApp(packageName) });
      return Boolean(res?.success);
    } catch (e) { return false; }
  }
  public static async requestAppPermissions(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.requestAppPermissions) return false;
    try { const r = await plugin.requestAppPermissions(); return Boolean(r?.success); } catch { return false; }
  }
  public static async getNotifications(): Promise<any[]> {
    const plugin = this.getPlugin();
    if (!plugin?.getNotifications) return [];
    try { const r = await plugin.getNotifications(); return r?.items || []; } catch { return []; }
  }
  public static async openNotificationListenerSettings(): Promise<void> {
    const plugin = this.getPlugin();
    if (!plugin?.openNotificationListenerSettings) return;
    try { await plugin.openNotificationListenerSettings(); } catch {}
  }
  public static async replyLastNotification(text: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      if (plugin.replyLastNotification) {
        const r = await plugin.replyLastNotification({ text });
        return Boolean(r?.success);
      }
      await this.performGlobalAction("notifications");
      await this.clickByText("رد");
      return this.inputText(text);
    } catch { return false; }
  }
}
