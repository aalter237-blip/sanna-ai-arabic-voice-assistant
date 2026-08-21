package com.sanna.ai;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.content.Intent;
import android.media.AudioManager;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;

@CapacitorPlugin(name = "VoiceAgent")
public class VoiceAgentPlugin extends Plugin {

    @PluginMethod
    public void isServiceEnabled(PluginCall call) {
        JSObject result = new JSObject();
        result.put("enabled", SannaAccessibilityService.instance != null);
        call.resolve(result);
    }

    @PluginMethod
    public void launchApp(PluginCall call) {
        String pkg = call.getString("packageName");
        if (pkg == null) { call.reject("packageName required"); return; }
        try {
            Intent intent = getContext().getPackageManager().getLaunchIntentForPackage(pkg);
            if (intent == null) { call.reject("App not found"); return; }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void performGlobalAction(PluginCall call) {
        if (SannaAccessibilityService.instance == null) { call.reject("Service off"); return; }
        String action = call.getString("action");
        int act = android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_HOME;
        if ("back".equals(action)) act = android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_BACK;
        if ("recents".equals(action)) act = android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_RECENTS;
        if ("notifications".equals(action)) act = android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_NOTIFICATIONS;
        if ("quick_settings".equals(action)) act = android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_QUICK_SETTINGS;
        SannaAccessibilityService.instance.performGlobalAction(act);
        call.resolve();
    }

    @PluginMethod
    public void clickByText(PluginCall call) {
        String text = call.getString("text");
        if (SannaAccessibilityService.instance == null) { call.reject("Service off"); return; }
        boolean ok = SannaAccessibilityService.instance.clickByText(text);
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void tap(PluginCall call) {
        Float x = call.getFloat("x");
        Float y = call.getFloat("y");
        if (SannaAccessibilityService.instance == null) { call.reject("Service off"); return; }
        SannaAccessibilityService.instance.tap(x, y);
        call.resolve();
    }

    @PluginMethod
    public void swipe(PluginCall call) {
        if (SannaAccessibilityService.instance == null) { call.reject("Service off"); return; }
        SannaAccessibilityService.instance.swipe(
            call.getFloat("x1"), call.getFloat("y1"),
            call.getFloat("x2"), call.getFloat("y2"),
            call.getLong("duration", 300L)
        );
        call.resolve();
    }

    @PluginMethod
    public void inputText(PluginCall call) {
        String text = call.getString("text");
        if (SannaAccessibilityService.instance == null) { call.reject("Service off"); return; }
        AccessibilityNodeInfo root = SannaAccessibilityService.instance.getRootInActiveWindow();
        boolean ok = false;
        if (root != null) {
            AccessibilityNodeInfo focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
            if (focused != null) {
                android.os.Bundle args = new android.os.Bundle();
                args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
                ok = focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
            }
        }
        JSObject result = new JSObject();
        result.put("success", ok);
        call.resolve(result);
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        Integer percent = call.getInt("percent", 50);
        AudioManager am = (AudioManager) getContext().getSystemService(android.content.Context.AUDIO_SERVICE);
        int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        am.setStreamVolume(AudioManager.STREAM_MUSIC, Math.round(max * percent / 100f), 0);
        call.resolve();
    }

    @PluginMethod
    public void getScreenText(PluginCall call) {
        JSObject result = new JSObject();
        result.put("texts", new com.getcapacitor.JSArray());
        if (SannaAccessibilityService.instance == null) { call.resolve(result); return; }
        AccessibilityNodeInfo root = SannaAccessibilityService.instance.getRootInActiveWindow();
        ArrayList<String> texts = new ArrayList<>();
        collectText(root, texts);
        result.put("texts", new com.getcapacitor.JSArray(texts));
        call.resolve(result);
    }

    private void collectText(AccessibilityNodeInfo node, ArrayList<String> out) {
        if (node == null) return;
        CharSequence t = node.getText();
        if (t != null && t.length() > 0) out.add(t.toString());
        for (int i = 0; i < node.getChildCount(); i++) collectText(node.getChild(i), out);
    }

    @PluginMethod
    public void getNotifications(PluginCall call) {
        com.getcapacitor.JSArray arr = new com.getcapacitor.JSArray();
        if (SannaNotificationListener.instance != null) {
            for (SannaNotificationListener.Item it : SannaNotificationListener.instance.snapshot()) {
                JSObject o = new JSObject();
                o.put("pkg", it.pkg);
                o.put("title", it.title);
                o.put("text", it.text);
                arr.put(o);
            }
        }
        JSObject result = new JSObject();
        result.put("items", arr);
        result.put("lastTitle", SannaNotificationListener.lastTitle);
        result.put("lastText", SannaNotificationListener.lastText);
        call.resolve(result);
    }
}
