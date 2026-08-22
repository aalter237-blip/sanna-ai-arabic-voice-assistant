import { registerPlugin } from "@capacitor/core";

export interface VoiceAgentPlugin {
  // Service & Permissions
  isServiceEnabled(): Promise<{ enabled: boolean }>;
  isAccessibilityEnabled(): Promise<{ enabled: boolean }>;
  openAccessibilitySettings(): Promise<void>;
  requestAppPermissions(): Promise<{ success: boolean }>;
  requestBatteryIgnore(): Promise<{ success: boolean }>;

  // Background Listening & Foreground Service
  startBackgroundListening(options?: { wakeWords?: string[] }): Promise<{ success: boolean }>;
  stopBackgroundListening(): Promise<{ success: boolean }>;

  // Accessibility Automation & Screen Touch
  tap(options: { x: number; y: number }): Promise<{ success: boolean }>;
  swipe(options: { x1: number; y1: number; x2: number; y2: number; duration?: number }): Promise<{ success: boolean }>;
  swipeUp(): Promise<{ success: boolean }>;
  swipeDown(): Promise<{ success: boolean }>;
  swipeLeft(): Promise<{ success: boolean }>;
  swipeRight(): Promise<{ success: boolean }>;
  clickByText(options: { text: string }): Promise<{ success: boolean }>;
  clickById(options: { viewId: string }): Promise<{ success: boolean }>;
  inputText(options: { text: string }): Promise<{ success: boolean }>;
  getScreenText(): Promise<{ texts: string[] }>;
  performGlobalAction(options: { action: string }): Promise<{ success: boolean }>;

  // System Hardware & Telephony
  launchApp(options: { packageName: string }): Promise<{ success: boolean }>;
  makePhoneCall(options: { phone: string }): Promise<{ success: boolean }>;
  sendSms(options: { phone: string; message: string }): Promise<{ success: boolean }>;
  toggleFlashlight(options: { enable: boolean }): Promise<{ success: boolean }>;
  setVolume(options: { percent: number }): Promise<{ success: boolean }>;
  setAlarm(options: { time: string; label?: string }): Promise<{ success: boolean }>;
  setTimer(options: { seconds: number; label?: string }): Promise<{ success: boolean }>;
  getInstalledApps(): Promise<{ apps: Array<{ name: string; package: string }> }>;

  // Notifications & Floating Overlay
  getNotifications(): Promise<{ items: Array<{ pkg: string; title: string; text: string }>; lastTitle?: string; lastText?: string; enabled: boolean }>;
  openNotificationListenerSettings(): Promise<void>;
  replyLastNotification(options: { text: string }): Promise<{ success: boolean }>;
  showFloatingOverlay(): Promise<{ success: boolean }>;
  hideFloatingOverlay(): Promise<{ success: boolean }>;
}

export const VoiceAgent = registerPlugin<VoiceAgentPlugin>("VoiceAgent");
export default VoiceAgent;
