import { CodeFile } from '../types';

export const CODEBASE_FILES: CodeFile[] = [
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'native',
    language: 'xml',
    description: 'Android Manifest registering Sanna Accessibility Service, 24/7 Voice Foreground Listener, Notification Interceptor, and System Permissions.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.sanna.ai">

    <!-- Network & Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />

    <!-- Audio & Speech Recognition -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- Background Services & 24/7 Listening -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <!-- System Overlays (Floating Mic Bubble over all apps) -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Alarms, Timers & Clock -->
    <uses-permission android:name="android.permission.SET_ALARM" />
    <uses-permission android:name="com.android.alarm.permission.SET_ALARM" />

    <!-- Phone Calls & Direct Dialing -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />

    <!-- SMS Messaging -->
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <!-- Camera & Flashlight -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />

    <!-- Bluetooth -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- Contacts -->
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- Vibration & Feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Query all installed apps on Android 11+ -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" tools:ignore="QueryAllPackagesPermission" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.ASSIST" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VOICE_COMMAND" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

        <!-- Sanna Accessibility Automation Service -->
        <service
            android:name=".SannaAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true"
            android:label="سنا - خدمة التحكم التلقائي الشامل">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Background Voice Wake Word Continuous Listener -->
        <service
            android:name=".VoiceForegroundService"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <!-- Notification Listener Service for Reading & Intercepting Messages -->
        <service
            android:name=".SannaNotificationListener"
            android:label="سنا - قارئ ومجيب الإشعارات"
            android:exported="true"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <!-- Floating Mic Overlay Service -->
        <service
            android:name=".FloatingOverlayService"
            android:exported="false" />

        <!-- Boot Receiver for Auto-Starting Listener on Device Start -->
        <receiver
            android:name=".BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    path: 'android/app/src/main/java/com/sanna/ai/SannaAccessibilityService.java',
    name: 'SannaAccessibilityService.java',
    category: 'native',
    language: 'kotlin',
    description: 'Autonomous Android Accessibility Service: taps, swipes, clicks by text/id, text typing, live screen text extraction and global gestures.',
    content: `package com.sanna.ai;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;
import java.util.List;

public class SannaAccessibilityService extends AccessibilityService {
    public static SannaAccessibilityService instance;

    @Override public void onAccessibilityEvent(AccessibilityEvent event) {}
    @Override public void onInterrupt() {}

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
    }

    public boolean tap(float x, float y) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false;
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, 50));
        return dispatchGesture(builder.build(), null, null);
    }

    public boolean swipe(float x1, float y1, float x2, float y2, long duration) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false;
        Path path = new Path();
        path.moveTo(x1, y1);
        path.lineTo(x2, y2);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, Math.max(duration, 100)));
        return dispatchGesture(builder.build(), null, null);
    }

    public boolean clickByText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || text == null || text.trim().isEmpty()) return false;
        return findAndClickText(root, text.trim());
    }

    private boolean findAndClickText(AccessibilityNodeInfo node, String text) {
        if (node == null) return false;
        CharSequence nodeText = node.getText();
        CharSequence desc = node.getContentDescription();
        String query = text.toLowerCase();

        boolean match = false;
        if (nodeText != null && nodeText.toString().toLowerCase().contains(query)) match = true;
        if (desc != null && desc.toString().toLowerCase().contains(query)) match = true;

        if (match) {
            AccessibilityNodeInfo target = node;
            while (target != null && !target.isClickable()) {
                target = target.getParent();
            }
            if (target != null && target.isClickable()) {
                return target.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            } else {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            }
        }

        for (int i = 0; i < node.getChildCount(); i++) {
            if (findAndClickText(node.getChild(i), text)) return true;
        }
        return false;
    }

    public boolean clickById(String viewId) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || viewId == null || viewId.trim().isEmpty()) return false;
        List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByViewId(viewId.trim());
        if (nodes == null || nodes.isEmpty()) return false;
        for (AccessibilityNodeInfo node : nodes) {
            if (node != null && node.isClickable()) {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            }
        }
        return false;
    }

    public List<String> getScreenText() {
        List<String> results = new ArrayList<>();
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root != null) collectAllTexts(root, results);
        return results;
    }

    private void collectAllTexts(AccessibilityNodeInfo node, List<String> out) {
        if (node == null) return;
        CharSequence text = node.getText();
        CharSequence desc = node.getContentDescription();
        if (text != null && text.length() > 0) out.add(text.toString().trim());
        else if (desc != null && desc.length() > 0) out.add(desc.toString().trim());
        for (int i = 0; i < node.getChildCount(); i++) collectAllTexts(node.getChild(i), out);
    }

    public boolean inputText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || text == null) return false;
        AccessibilityNodeInfo focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (focused == null) focused = root.findFocus(AccessibilityNodeInfo.FOCUS_ACCESSIBILITY);
        if (focused != null) {
            Bundle args = new Bundle();
            args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
            return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
        }
        return false;
    }

    public boolean performGlobal(String action) {
        if ("back".equalsIgnoreCase(action)) return performGlobalAction(GLOBAL_ACTION_BACK);
        if ("home".equalsIgnoreCase(action)) return performGlobalAction(GLOBAL_ACTION_HOME);
        if ("recents".equalsIgnoreCase(action)) return performGlobalAction(GLOBAL_ACTION_RECENTS);
        if ("notifications".equalsIgnoreCase(action)) return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS);
        if ("quick_settings".equalsIgnoreCase(action)) return performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS);
        if ("lock_screen".equalsIgnoreCase(action) && Build.VERSION.SDK_INT >= 28) return performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN);
        if ("screenshot".equalsIgnoreCase(action) && Build.VERSION.SDK_INT >= 28) return performGlobalAction(GLOBAL_ACTION_TAKE_SCREENSHOT);
        return false;
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/sanna/ai/VoiceForegroundService.java',
    name: 'VoiceForegroundService.java',
    category: 'native',
    language: 'kotlin',
    description: '24/7 Background Speech Recognition and Wake Word listener ("سنا", "يا زول", "تلفوني", "مساعدي").',
    content: `package com.sanna.ai;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import java.util.ArrayList;
import java.util.Locale;

public class VoiceForegroundService extends Service {
    public static boolean running = false;
    private SpeechRecognizer speechRecognizer;
    private final String[] wakeWords = new String[]{"سنا", "يا سنا", "تلفوني", "مساعدي", "يا زول", "افتح يا سمسم"};

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundNotification();
        running = true;
        initSpeechRecognizer();
        return START_STICKY;
    }

    private void startForegroundNotification() {
        String channelId = "sanna_voice_channel";
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm != null) {
            NotificationChannel channel = new NotificationChannel(channelId, "سنا - استماع 24/7", NotificationManager.IMPORTANCE_LOW);
            nm.createNotificationChannel(channel);
        }
        Intent openIntent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, openIntent, Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, channelId) : new Notification.Builder(this);
        Notification n = b.setContentTitle("سنا AI").setContentText("استماع لكلمات التنبيه نشط في الخلفية").setSmallIcon(android.R.drawable.ic_btn_speak_now).setContentIntent(pi).setOngoing(true).build();
        startForeground(101, n);
    }

    private void initSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return;
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            public void onReadyForSpeech(Bundle params) {}
            public void onBeginningOfSpeech() {}
            public void onRmsChanged(float rmsdB) {}
            public void onBufferReceived(byte[] buffer) {}
            public void onEndOfSpeech() {}
            public void onError(int error) { if (running) restart(); }
            public void onResults(Bundle results) { check(results); if (running) restart(); }
            public void onPartialResults(Bundle partialResults) { check(partialResults); }
            public void onEvent(int eventType, Bundle params) {}
        });
        restart();
    }

    private void restart() {
        try {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA");
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            speechRecognizer.startListening(intent);
        } catch (Exception e) {}
    }

    private void check(Bundle bundle) {
        if (bundle == null) return;
        ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (matches == null) return;
        for (String match : matches) {
            String text = match.toLowerCase(Locale.ROOT);
            for (String wake : wakeWords) {
                if (text.contains(wake)) {
                    Intent open = new Intent(this, MainActivity.class);
                    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    open.putExtra("wake", true);
                    open.putExtra("command", text);
                    startActivity(open);
                    return;
                }
            }
        }
    }

    @Override
    public void onDestroy() {
        running = false;
        if (speechRecognizer != null) { speechRecognizer.destroy(); speechRecognizer = null; }
        super.onDestroy();
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/sanna/ai/VoiceAgentPlugin.java',
    name: 'VoiceAgentPlugin.java',
    category: 'native',
    language: 'kotlin',
    description: 'Capacitor Bridge connecting JS agent to Android: Phone calls, SMS, Flashlight, Volume, Alarms, Timers, Apps, and Notifications.',
    content: `package com.sanna.ai;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.provider.AlarmClock;
import android.provider.Settings;
import android.telephony.SmsManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;

@CapacitorPlugin(name = "VoiceAgent")
public class VoiceAgentPlugin extends Plugin {

    @PluginMethod
    public void isServiceEnabled(PluginCall call) {
        JSObject res = new JSObject();
        res.put("enabled", SannaAccessibilityService.instance != null);
        call.resolve(res);
    }

    @PluginMethod
    public void launchApp(PluginCall call) {
        String pkg = call.getString("packageName");
        try {
            PackageManager pm = getContext().getPackageManager();
            Intent intent = pm.getLaunchIntentForPackage(pkg);
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } else call.reject("App not found");
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    @PluginMethod
    public void makePhoneCall(PluginCall call) {
        String phone = call.getString("phone");
        try {
            Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phone));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    @PluginMethod
    public void sendSms(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message");
        try {
            SmsManager.getDefault().sendTextMessage(phone, null, message, null, null);
            call.resolve();
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    @PluginMethod
    public void toggleFlashlight(PluginCall call) {
        boolean enable = call.getBoolean("enable", true);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                CameraManager cm = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
                cm.setTorchMode(cm.getCameraIdList()[0], enable);
                call.resolve();
            }
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        int percent = call.getInt("percent", 50);
        AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        am.setStreamVolume(AudioManager.STREAM_MUSIC, Math.round(max * percent / 100f), AudioManager.FLAG_SHOW_UI);
        call.resolve();
    }

    @PluginMethod
    public void setAlarm(PluginCall call) {
        String timeStr = call.getString("time");
        Intent intent = new Intent(AlarmClock.ACTION_SET_ALARM);
        intent.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void clickByText(PluginCall call) {
        String text = call.getString("text");
        boolean ok = SannaAccessibilityService.instance != null && SannaAccessibilityService.instance.clickByText(text);
        JSObject r = new JSObject(); r.put("success", ok); call.resolve(r);
    }

    @PluginMethod
    public void inputText(PluginCall call) {
        String text = call.getString("text");
        boolean ok = SannaAccessibilityService.instance != null && SannaAccessibilityService.instance.inputText(text);
        JSObject r = new JSObject(); r.put("success", ok); call.resolve(r);
    }

    @PluginMethod
    public void getScreenText(PluginCall call) {
        JSObject res = new JSObject();
        if (SannaAccessibilityService.instance != null) {
            res.put("texts", new JSArray(SannaAccessibilityService.instance.getScreenText()));
        } else res.put("texts", new JSArray());
        call.resolve(res);
    }
}`
  },
  {
    path: 'android/app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    category: 'native',
    language: 'xml',
    description: 'Accessibility Service XML configuration enabling gestures, window retrieval, and touch exploration.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds|flagRequestFilterKeyEvents|flagIncludeNotImportantViews"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:description="@string/app_name"
    android:notificationTimeout="100"
    android:settingsActivity="com.sanna.ai.MainActivity" />`
  },
  {
    path: 'capacitor.config.json',
    name: 'capacitor.config.json',
    category: 'config',
    language: 'json',
    description: 'Capacitor Android build configuration with scheme, allowMixedContent, and debug settings.',
    content: `{
  "appId": "com.sanna.ai",
  "appName": "Sanna AI",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  }
}`
  },
  {
    path: 'src/services/native-agent-bridge.ts',
    name: 'native-agent-bridge.ts',
    category: 'tools',
    language: 'typescript',
    description: 'TypeScript bridge interfacing React Web Runtime with Java native plugin.',
    content: `import { VoiceAgent } from '../plugins/VoiceAgentPlugin';

export class NativeAgentBridge {
  public static async clickByText(text: string): Promise<boolean> {
    try { const res = await VoiceAgent.clickByText({ text }); return Boolean(res?.success); } catch { return false; }
  }
  public static async inputText(text: string): Promise<boolean> {
    try { const res = await VoiceAgent.inputText({ text }); return Boolean(res?.success); } catch { return false; }
  }
  public static async launchApp(packageName: string): Promise<boolean> {
    try { const res = await VoiceAgent.launchApp({ packageName }); return Boolean(res?.success); } catch { return false; }
  }
  public static async setVolume(percent: number): Promise<boolean> {
    try { const res = await VoiceAgent.setVolume({ percent }); return Boolean(res?.success); } catch { return false; }
  }
  public static async makePhoneCall(phone: string): Promise<boolean> {
    try { const res = await VoiceAgent.makePhoneCall({ phone }); return Boolean(res?.success); } catch { return false; }
  }
  public static async sendSms(phone: string, message: string): Promise<boolean> {
    try { const res = await VoiceAgent.sendSms({ phone, message }); return Boolean(res?.success); } catch { return false; }
  }
  public static async toggleFlashlight(enable: boolean): Promise<boolean> {
    try { const res = await VoiceAgent.toggleFlashlight({ enable }); return Boolean(res?.success); } catch { return false; }
  }
}`
  }
];
