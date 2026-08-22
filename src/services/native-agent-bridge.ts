import { VoiceAgent } from '../plugins/VoiceAgentPlugin';

/**
 * Capacitor Bridge Interface for Native Android Voice Agent & Accessibility Service
 * This bridges web calls directly to the Java native plugin on Android (VoiceAgentPlugin.java)
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
      return (window as any).VoiceAgent || VoiceAgent;
    }
    return VoiceAgent;
  }

  /**
   * Check if Native Android Accessibility Service is enabled in System Settings
   */
  public static async isAccessibilityEnabled(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.isServiceEnabled) return false;
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
    if (!plugin?.openAccessibilitySettings) return;
    try {
      await plugin.openAccessibilitySettings();
    } catch (e) {
      console.warn('[NativeAgentBridge] openAccessibilitySettings error:', e);
    }
  }

  /**
   * Start Background Voice Listening Foreground Service (Continuous Wake Word Listener)
   */
  public static async startBackgroundListening(wakeWords: string[] = ['سنا', 'تلفوني', 'مساعدي', 'يا زول']): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.startBackgroundListening) return false;
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
    if (!plugin?.stopBackgroundListening) return false;
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
    if (!plugin?.clickByText) return false;
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
    if (!plugin?.clickById) return false;
    try {
      const res = await plugin.clickById({ viewId });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] clickById error:', e);
      return false;
    }
  }

  /**
   * Tap at specific X/Y screen coordinates
   */
  public static async tap(x: number, y: number): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.tap) return false;
    try {
      const res = await plugin.tap({ x, y });
      return Boolean(res?.success ?? true);
    } catch (e) {
      console.warn('[NativeAgentBridge] tap error:', e);
      return false;
    }
  }

  /**
   * Perform gesture swipe
   */
  public static async swipe(x1: number, y1: number, x2: number, y2: number, duration: number = 300): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.swipe) return false;
    try {
      const res = await plugin.swipe({ x1, y1, x2, y2, duration });
      return Boolean(res?.success ?? true);
    } catch (e) {
      console.warn('[NativeAgentBridge] swipe error:', e);
      return false;
    }
  }

  /**
   * Extract all visible text nodes from the active foreground app
   */
  public static async getScreenText(): Promise<string[]> {
    const plugin = this.getPlugin();
    if (!plugin?.getScreenText) return [];
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
    if (!plugin?.inputText) return false;
    try {
      const res = await plugin.inputText({ text });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] inputText error:', e);
      return false;
    }
  }

  /**
   * Make a direct phone call
   */
  public static async makePhoneCall(phone: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.makePhoneCall) return false;
    try {
      const res = await plugin.makePhoneCall({ phone });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] makePhoneCall error:', e);
      return false;
    }
  }

  /**
   * Send an SMS message directly
   */
  public static async sendSms(phone: string, message: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.sendSms) return false;
    try {
      const res = await plugin.sendSms({ phone, message });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] sendSms error:', e);
      return false;
    }
  }

  /**
   * Toggle flashlight / torch
   */
  public static async toggleFlashlight(enable: boolean): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.toggleFlashlight) return false;
    try {
      const res = await plugin.toggleFlashlight({ enable });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] toggleFlashlight error:', e);
      return false;
    }
  }

  /**
   * Adjust Android Media Volume
   */
  public static async setVolume(percent: number): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.setVolume) return false;
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
  public static async setAlarm(timeString: string, label: string = 'منبه المساعد الصوتي سنا'): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.setAlarm) return false;
    try {
      const res = await plugin.setAlarm({ time: timeString, label });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] setAlarm error:', e);
      return false;
    }
  }

  /**
   * Set Android Countdown Timer
   */
  public static async setTimer(seconds: number, label: string = 'مؤقت سنا'): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.setTimer) return false;
    try {
      const res = await plugin.setTimer({ seconds, label });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] setTimer error:', e);
      return false;
    }
  }

  /**
   * Trigger Global Android Action: back, home, recents, notifications, quick_settings, lock_screen, screenshot
   */
  public static async performGlobalAction(action: 'back' | 'home' | 'recents' | 'notifications' | 'quick_settings' | 'lock_screen' | 'screenshot'): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.performGlobalAction) return false;
    try {
      const res = await plugin.performGlobalAction({ action });
      return Boolean(res?.success);
    } catch (e) {
      console.warn('[NativeAgentBridge] performGlobalAction error:', e);
      return false;
    }
  }

  /**
   * Resolve common Arabic app names to their Android package names
   */
  public static resolveApp(name: string): string {
    const n = (name || '').toLowerCase().trim();
    const map: Record<string, string> = {
      'واتس': 'com.whatsapp',
      'واتساب': 'com.whatsapp',
      'whatsapp': 'com.whatsapp',
      'يوتيوب': 'com.google.android.youtube',
      'youtube': 'com.google.android.youtube',
      'خرائط': 'com.google.android.apps.maps',
      'مابز': 'com.google.android.apps.maps',
      'maps': 'com.google.android.apps.maps',
      'كاميرا': 'com.android.camera',
      'إعدادات': 'com.android.settings',
      'الاعدادات': 'com.android.settings',
      'settings': 'com.android.settings',
      'اتصال': 'com.android.dialer',
      'هاتف': 'com.android.dialer',
      'phone': 'com.android.dialer',
      'رسائل': 'com.android.mms',
      'كروم': 'com.android.chrome',
      'chrome': 'com.android.chrome',
      'فيسبوك': 'com.facebook.katana',
      'انستقرام': 'com.instagram.android',
      'انستغرام': 'com.instagram.android',
      'تيليجرام': 'org.telegram.messenger',
      'تليجرام': 'org.telegram.messenger',
      'تويتر': 'com.twitter.android',
      'إكس': 'com.twitter.android',
      'جوجل': 'com.google.android.googlequicksearchbox',
      'متجر': 'com.android.vending',
      'جيميل': 'com.google.android.gm',
      'صور': 'com.google.android.apps.photos',
      'ملفات': 'com.google.android.documentsui',
      'ساعة': 'com.android.deskclock',
      'منبه': 'com.android.deskclock',
      'حاسبة': 'com.google.android.calculator',
      'واتساب اعمال': 'com.whatsapp.w4b',
      'سناب': 'com.snapchat.android',
      'سناب شات': 'com.snapchat.android',
      'تيك توك': 'com.zhiliaoapp.musically',
      'موسيقى': 'com.google.android.music',
      'بنك': 'com.bok.bankak',
      'بنكك': 'com.bok.bankak',
      'الراجحي': 'com.alrajhicapital.app',
      'قرآن': 'com.quran.audio',
    };

    for (const key of Object.keys(map)) {
      if (n.includes(key)) return map[key];
    }
    return name;
  }

  /**
   * Launch any Android app by package name or common name
   */
  public static async launchApp(packageName: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.launchApp) return false;
    try {
      const resolved = this.resolveApp(packageName);
      const res = await plugin.launchApp({ packageName: resolved });
      return Boolean(res?.success ?? true);
    } catch (e) {
      console.warn('[NativeAgentBridge] launchApp error:', e);
      return false;
    }
  }

  /**
   * Request necessary Android runtime permissions
   */
  public static async requestAppPermissions(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.requestAppPermissions) return false;
    try {
      const r = await plugin.requestAppPermissions();
      return Boolean(r?.success);
    } catch {
      return false;
    }
  }

  /**
   * Fetch active device notifications from NotificationListener
   */
  public static async getNotifications(): Promise<any[]> {
    const plugin = this.getPlugin();
    if (!plugin?.getNotifications) return [];
    try {
      const r = await plugin.getNotifications();
      return r?.items || [];
    } catch {
      return [];
    }
  }

  /**
   * Open Notification Listener Settings page
   */
  public static async openNotificationListenerSettings(): Promise<void> {
    const plugin = this.getPlugin();
    if (!plugin?.openNotificationListenerSettings) return;
    try {
      await plugin.openNotificationListenerSettings();
    } catch {}
  }

  /**
   * Reply to the most recent notification
   */
  public static async replyLastNotification(text: string): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin) return false;
    try {
      if (plugin.replyLastNotification) {
        const r = await plugin.replyLastNotification({ text });
        return Boolean(r?.success);
      }
      await this.performGlobalAction('notifications');
      await this.clickByText('رد');
      return this.inputText(text);
    } catch {
      return false;
    }
  }

  /**
   * Request ignoring battery optimization for continuous background wake word listening
   */
  public static async requestBatteryIgnore(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.requestBatteryIgnore) return false;
    try {
      const r = await plugin.requestBatteryIgnore();
      return Boolean(r?.success);
    } catch {
      return false;
    }
  }

  /**
   * Show Floating Mic Overlay Bubble
   */
  public static async showFloatingOverlay(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.showFloatingOverlay) return false;
    try {
      const r = await plugin.showFloatingOverlay();
      return Boolean(r?.success);
    } catch {
      return false;
    }
  }

  /**
   * Hide Floating Mic Overlay Bubble
   */
  public static async hideFloatingOverlay(): Promise<boolean> {
    const plugin = this.getPlugin();
    if (!plugin?.hideFloatingOverlay) return false;
    try {
      const r = await plugin.hideFloatingOverlay();
      return Boolean(r?.success);
    } catch {
      return false;
    }
  }

  /**
   * Get all installed apps on the device
   */
  public static async getInstalledApps(): Promise<Array<{ name: string; package: string }>> {
    const plugin = this.getPlugin();
    if (!plugin?.getInstalledApps) return [];
    try {
      const r = await plugin.getInstalledApps();
      return r?.apps || [];
    } catch {
      return [];
    }
  }
}
