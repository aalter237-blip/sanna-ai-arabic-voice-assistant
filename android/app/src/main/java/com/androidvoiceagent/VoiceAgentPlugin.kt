package com.androidvoiceagent

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.provider.AlarmClock
import android.provider.Settings
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "VoiceAgentPlugin")
class VoiceAgentPlugin : Plugin() {

    @PluginMethod
    fun isAccessibilityEnabled(call: PluginCall) {
        val enabled = AndroidAccessibilityService.isRunning()
        val ret = JSObject()
        ret.put("enabled", enabled)
        call.resolve(ret)
    }

    @PluginMethod
    fun openAccessibilitySettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("FAILED_OPEN_SETTINGS", e.message)
        }
    }

    @PluginMethod
    fun clickByText(call: PluginCall) {
        val text = call.getString("text") ?: ""
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.findAndClick(text)
            val ret = JSObject()
            ret.put("success", success)
            call.resolve(ret)
        } else {
            call.reject("ACCESSIBILITY_NOT_ENABLED", "خدمة إمكانية الوصول غير مفعلة")
        }
    }

    @PluginMethod
    fun clickById(call: PluginCall) {
        val viewId = call.getString("viewId") ?: ""
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.findAndClickById(viewId)
            val ret = JSObject()
            ret.put("success", success)
            call.resolve(ret)
        } else {
            call.reject("ACCESSIBILITY_NOT_ENABLED", "خدمة إمكانية الوصول غير مفعلة")
        }
    }

    @PluginMethod
    fun getScreenText(call: PluginCall) {
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val texts = service.extractScreenText()
            val ret = JSObject()
            val jsArray = com.getcapacitor.JSArray(texts)
            ret.put("texts", jsArray)
            call.resolve(ret)
        } else {
            call.reject("ACCESSIBILITY_NOT_ENABLED", "خدمة إمكانية الوصول غير مفعلة")
        }
    }

    @PluginMethod
    fun inputText(call: PluginCall) {
        val text = call.getString("text") ?: ""
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.inputText(text)
            val ret = JSObject()
            ret.put("success", success)
            call.resolve(ret)
        } else {
            call.reject("ACCESSIBILITY_NOT_ENABLED", "خدمة إمكانية الوصول غير مفعلة")
        }
    }

    @PluginMethod
    fun launchApp(call: PluginCall) {
        val packageName = call.getString("packageName") ?: ""
        try {
            val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(launchIntent)
                val ret = JSObject()
                ret.put("success", true)
                call.resolve(ret)
            } else {
                call.reject("APP_NOT_FOUND", "الحزمة $packageName غير موجودة")
            }
        } catch (e: Exception) {
            call.reject("LAUNCH_ERROR", e.message)
        }
    }

    @PluginMethod
    fun setVolume(call: PluginCall) {
        val percent = call.getInt("percent") ?: 50
        try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            val clamped = percent.coerceIn(0, 100)
            val target = (clamped * maxVolume) / 100
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, target, AudioManager.FLAG_SHOW_UI)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("VOLUME_ERROR", e.message)
        }
    }

    @PluginMethod
    fun setAlarm(call: PluginCall) {
        val timeString = call.getString("time") ?: "07:00"
        val label = call.getString("label") ?: "منبه بواسطة المساعد الصوتي"
        try {
            val parts = timeString.replace("ص", "").replace("م", "").trim().split(":")
            val hour = parts.getOrNull(0)?.trim()?.toIntOrNull() ?: 7
            val minute = parts.getOrNull(1)?.trim()?.toIntOrNull() ?: 0

            val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_MESSAGE, label)
                putExtra(AlarmClock.EXTRA_HOUR, hour)
                putExtra(AlarmClock.EXTRA_MINUTES, minute)
                putExtra(AlarmClock.EXTRA_SKIP_UI, false)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("ALARM_ERROR", e.message)
        }
    }

    @PluginMethod
    fun performGlobalAction(call: PluginCall) {
        val action = call.getString("action") ?: "back"
        val service = AndroidAccessibilityService.instance
        if (service != null) {
            val success = service.triggerGlobalAction(action)
            val ret = JSObject()
            ret.put("success", success)
            call.resolve(ret)
        } else {
            call.reject("ACCESSIBILITY_NOT_ENABLED", "خدمة إمكانية الوصول غير مفعلة")
        }
    }

    @PluginMethod
    fun startBackgroundListening(call: PluginCall) {
        try {
            val serviceIntent = Intent(context, VoiceForegroundService::class.java).apply {
                action = VoiceForegroundService.ACTION_START_LISTENING
            }
            context.startForegroundService(serviceIntent)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("BACKGROUND_SERVICE_ERROR", e.message)
        }
    }

    @PluginMethod
    fun stopBackgroundListening(call: PluginCall) {
        try {
            val serviceIntent = Intent(context, VoiceForegroundService::class.java).apply {
                action = VoiceForegroundService.ACTION_STOP_LISTENING
            }
            context.startService(serviceIntent)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("BACKGROUND_SERVICE_ERROR", e.message)
        }
    }
}
