package com.sanna.ai;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.AlarmClock;
import android.provider.Settings;
import android.telephony.SmsManager;
import android.util.DisplayMetrics;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

@CapacitorPlugin(name = "VoiceAgent")
public class VoiceAgentPlugin extends Plugin {
    private static final String TAG = "VoiceAgentPlugin";

    @PluginMethod
    public void isServiceEnabled(PluginCall call) {
        JSObject result = new JSObject();
        boolean enabled = SannaAccessibilityService.instance != null;
        result.put("enabled", enabled);
        call.resolve(result);
    }

    @PluginMethod
    public void isAccessibilityEnabled(PluginCall call) {
        isServiceEnabled(call);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open accessibility settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startBackgroundListening(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), VoiceForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to start voice service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopBackgroundListening(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), VoiceForegroundService.class);
            getContext().stopService(intent);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to stop voice service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestAppPermissions(PluginCall call) {
        JSObject res = new JSObject();
        res.put("success", true);
        call.resolve(res);
    }

    @PluginMethod
    public void requestBatteryIgnore(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(getContext().getPackageName())) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                }
            }
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void launchApp(PluginCall call) {
        String pkg = call.getString("packageName");
        if (pkg == null || pkg.isEmpty()) {
            call.reject("packageName is required");
            return;
        }
        try {
            PackageManager pm = getContext().getPackageManager();
            Intent intent = pm.getLaunchIntentForPackage(pkg);
            if (intent == null) {
                // Try searching installed apps by label
                List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
                for (ApplicationInfo packageInfo : packages) {
                    CharSequence label = pm.getApplicationLabel(packageInfo);
                    if (label != null && label.toString().toLowerCase().contains(pkg.toLowerCase())) {
                        intent = pm.getLaunchIntentForPackage(packageInfo.packageName);
                        if (intent != null) break;
                    }
                }
            }

            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
                getContext().startActivity(intent);
                JSObject res = new JSObject();
                res.put("success", true);
                call.resolve(res);
            } else {
                call.reject("Application not found: " + pkg);
            }
        } catch (Exception e) {
            call.reject("Error launching app: " + e.getMessage());
        }
    }

    @PluginMethod
    public void makePhoneCall(PluginCall call) {
        String phone = call.getString("phone");
        if (phone == null || phone.isEmpty()) {
            call.reject("phone number is required");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_CALL);
            intent.setData(Uri.parse("tel:" + phone.trim()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (SecurityException se) {
            // Fallback to dialer if direct call permission not granted
            Intent dialIntent = new Intent(Intent.ACTION_DIAL);
            dialIntent.setData(Uri.parse("tel:" + phone.trim()));
            dialIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(dialIntent);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void sendSms(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message");
        if (phone == null || message == null) {
            call.reject("phone and message are required");
            return;
        }
        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phone, null, message, null, null);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            // Fallback to SMS Intent
            try {
                Intent smsIntent = new Intent(Intent.ACTION_VIEW);
                smsIntent.setData(Uri.parse("smsto:" + phone));
                smsIntent.putExtra("sms_body", message);
                smsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(smsIntent);
                JSObject res = new JSObject();
                res.put("success", true);
                call.resolve(res);
            } catch (Exception ex) {
                call.reject(ex.getMessage());
            }
        }
    }

    @PluginMethod
    public void toggleFlashlight(PluginCall call) {
        boolean enable = call.getBoolean("enable", true);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                CameraManager cameraManager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
                if (cameraManager != null) {
                    String cameraId = cameraManager.getCameraIdList()[0];
                    cameraManager.setTorchMode(cameraId, enable);
                    JSObject res = new JSObject();
                    res.put("success", true);
                    call.resolve(res);
                    return;
                }
            }
            call.reject("Flashlight not supported on this device/version");
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        Integer percent = call.getInt("percent", 50);
        try {
            AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                int target = Math.round(max * (percent / 100f));
                am.setStreamVolume(AudioManager.STREAM_MUSIC, target, AudioManager.FLAG_SHOW_UI);
                JSObject res = new JSObject();
                res.put("success", true);
                call.resolve(res);
            } else {
                call.reject("AudioManager unavailable");
            }
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void setAlarm(PluginCall call) {
        String timeStr = call.getString("time");
        String label = call.getString("label", "منبه المساعد الصوتي سنا");
        if (timeStr == null) {
            call.reject("time is required");
            return;
        }

        try {
            int hour = 7;
            int minute = 0;
            String[] parts = timeStr.replace("AM", "").replace("PM", "").replace("ص", "").replace("م", "").trim().split(":");
            if (parts.length >= 1) hour = Integer.parseInt(parts[0].trim());
            if (parts.length >= 2) minute = Integer.parseInt(parts[1].trim());

            if (timeStr.toUpperCase().contains("PM") || timeStr.contains("م")) {
                if (hour < 12) hour += 12;
            }

            Intent intent = new Intent(AlarmClock.ACTION_SET_ALARM);
            intent.putExtra(AlarmClock.EXTRA_HOUR, hour);
            intent.putExtra(AlarmClock.EXTRA_MINUTES, minute);
            intent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
            intent.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);

            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to set alarm: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setTimer(PluginCall call) {
        int seconds = call.getInt("seconds", 300);
        String label = call.getString("label", "مؤقت سنا");
        try {
            Intent intent = new Intent(AlarmClock.ACTION_SET_TIMER);
            intent.putExtra(AlarmClock.EXTRA_LENGTH, seconds);
            intent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
            intent.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);

            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to set timer: " + e.getMessage());
        }
    }

    @PluginMethod
    public void performGlobalAction(PluginCall call) {
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        String action = call.getString("action");
        boolean ok = SannaAccessibilityService.instance.performGlobal(action);
        JSObject res = new JSObject();
        res.put("success", ok);
        call.resolve(res);
    }

    @PluginMethod
    public void clickByText(PluginCall call) {
        String text = call.getString("text");
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        boolean ok = SannaAccessibilityService.instance.clickByText(text);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void clickById(PluginCall call) {
        String viewId = call.getString("viewId");
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        boolean ok = SannaAccessibilityService.instance.clickById(viewId);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void inputText(PluginCall call) {
        String text = call.getString("text");
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        boolean ok = SannaAccessibilityService.instance.inputText(text);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void tap(PluginCall call) {
        Float x = call.getFloat("x");
        Float y = call.getFloat("y");
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        boolean ok = SannaAccessibilityService.instance.tap(x != null ? x : 0, y != null ? y : 0);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void swipe(PluginCall call) {
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        Float x1 = call.getFloat("x1", 500f);
        Float y1 = call.getFloat("y1", 1000f);
        Float x2 = call.getFloat("x2", 500f);
        Float y2 = call.getFloat("y2", 300f);
        Long dur = call.getLong("duration", 300L);

        boolean ok = SannaAccessibilityService.instance.swipe(x1, y1, x2, y2, dur);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void swipeUp(PluginCall call) {
        swipeDirection(0, 1, call);
    }

    @PluginMethod
    public void swipeDown(PluginCall call) {
        swipeDirection(0, -1, call);
    }

    @PluginMethod
    public void swipeLeft(PluginCall call) {
        swipeDirection(1, 0, call);
    }

    @PluginMethod
    public void swipeRight(PluginCall call) {
        swipeDirection(-1, 0, call);
    }

    private void swipeDirection(int dx, int dy, PluginCall call) {
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is disabled");
            return;
        }
        DisplayMetrics dm = getContext().getResources().getDisplayMetrics();
        float cx = dm.widthPixels / 2f;
        float cy = dm.heightPixels / 2f;
        float x2 = cx - dx * dm.widthPixels * 0.35f;
        float y2 = cy - dy * dm.heightPixels * 0.35f;
        boolean ok = SannaAccessibilityService.instance.swipe(cx, cy, x2, y2, 300);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void getScreenText(PluginCall call) {
        JSObject result = new JSObject();
        if (SannaAccessibilityService.instance == null) {
            result.put("texts", new JSArray());
            call.resolve(result);
            return;
        }
        List<String> texts = SannaAccessibilityService.instance.getScreenText();
        result.put("texts", new JSArray(texts));
        call.resolve(result);
    }

    @PluginMethod
    public void getNotifications(PluginCall call) {
        JSArray arr = new JSArray();
        if (SannaNotificationListener.instance != null) {
            for (SannaNotificationListener.Item item : SannaNotificationListener.instance.snapshot()) {
                JSObject o = new JSObject();
                o.put("pkg", item.pkg);
                o.put("title", item.title);
                o.put("text", item.text);
                arr.put(o);
            }
        }
        JSObject result = new JSObject();
        result.put("items", arr);
        result.put("lastTitle", SannaNotificationListener.lastTitle);
        result.put("lastText", SannaNotificationListener.lastText);
        result.put("enabled", SannaNotificationListener.instance != null);
        call.resolve(result);
    }

    @PluginMethod
    public void openNotificationListenerSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open notification settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void replyLastNotification(PluginCall call) {
        String text = call.getString("text");
        if (text == null) {
            call.reject("text is required");
            return;
        }
        if (SannaNotificationListener.instance != null) {
            boolean ok = SannaNotificationListener.instance.replyLast(text, getContext());
            if (ok) {
                JSObject res = new JSObject();
                res.put("success", true);
                call.resolve(res);
                return;
            }
        }
        // Fallback via Accessibility click
        if (SannaAccessibilityService.instance != null) {
            SannaAccessibilityService.instance.performGlobal("notifications");
            SannaAccessibilityService.instance.clickByText("رد");
            SannaAccessibilityService.instance.inputText(text);
        }
        JSObject res = new JSObject();
        res.put("success", true);
        call.resolve(res);
    }

    @PluginMethod
    public void showFloatingOverlay(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), FloatingOverlayService.class);
            getContext().startService(intent);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void hideFloatingOverlay(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), FloatingOverlayService.class);
            getContext().stopService(intent);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        try {
            PackageManager pm = getContext().getPackageManager();
            List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);
            JSArray arr = new JSArray();

            for (ApplicationInfo app : apps) {
                if ((app.flags & ApplicationInfo.FLAG_SYSTEM) == 0 || pm.getLaunchIntentForPackage(app.packageName) != null) {
                    JSObject item = new JSObject();
                    CharSequence label = pm.getApplicationLabel(app);
                    item.put("name", label != null ? label.toString() : app.packageName);
                    item.put("package", app.packageName);
                    arr.put(item);
                }
            }

            JSObject res = new JSObject();
            res.put("apps", arr);
            call.resolve(res);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
