package com.sanna.ai;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VoiceAgent")
public class VoiceAgentPlugin extends Plugin {

    @PluginMethod
    public void tap(PluginCall call) {
        Float x = call.getFloat("x");
        Float y = call.getFloat("y");
        if (x == null || y == null) {
            call.reject("x and y are required");
            return;
        }
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is not enabled");
            return;
        }
        SannaAccessibilityService.instance.tap(x, y);
        call.resolve();
    }

    @PluginMethod
    public void swipe(PluginCall call) {
        Float x1 = call.getFloat("x1");
        Float y1 = call.getFloat("y1");
        Float x2 = call.getFloat("x2");
        Float y2 = call.getFloat("y2");
        Long duration = call.getLong("duration", 300L);

        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is not enabled");
            return;
        }
        SannaAccessibilityService.instance.swipe(x1, y1, x2, y2, duration);
        call.resolve();
    }

    @PluginMethod
    public void clickByText(PluginCall call) {
        String text = call.getString("text");
        if (text == null || text.isEmpty()) {
            call.reject("text is required");
            return;
        }
        if (SannaAccessibilityService.instance == null) {
            call.reject("Accessibility Service is not enabled");
            return;
        }
        boolean success = SannaAccessibilityService.instance.clickByText(text);
        JSObject result = new JSObject();
        result.put("success", success);
        call.resolve(result);
    }

    @PluginMethod
    public void isServiceEnabled(PluginCall call) {
        boolean enabled = SannaAccessibilityService.instance != null;
        JSObject result = new JSObject();
        result.put("enabled", enabled);
        call.resolve(result);
    }
}
