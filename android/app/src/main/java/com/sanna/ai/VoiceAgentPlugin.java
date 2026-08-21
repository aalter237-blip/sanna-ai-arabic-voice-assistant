package com.sanna.ai;

import android.content.Context;
import android.app.Activity;
import android.content.Intent;
import android.media.AudioManager;
import android.provider.AlarmClock;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VoiceAgent")
public class VoiceAgentPlugin extends Plugin {
    private String resolvePkg(String name){ if(name==null)return ""; String n=name.toLowerCase(); if(n.contains("واتس")||n.contains("whatsapp"))return "com.whatsapp"; if(n.contains("يوتيوب")||n.contains("youtube"))return "com.google.android.youtube"; if(n.contains("خرائط")||n.contains("maps"))return "com.google.android.apps.maps"; if(n.contains("كاميرا"))return "com.android.camera"; if(n.contains("إعدادات")||n.contains("اعدادات"))return "com.android.settings"; if(n.contains("اتصال")||n.contains("هاتف"))return "com.android.dialer"; if(n.contains("كروم"))return "com.android.chrome"; if(n.contains("تيليجرام"))return "org.telegram.messenger"; if(n.contains("انستقرام"))return "com.instagram.android"; return name; }
    private boolean ok(PluginCall c){ if(SannaAccessibilityService.instance==null){ c.reject("Accessibility Service is not enabled"); return false;} return true; }
    @PluginMethod public void tap(PluginCall c){ if(!ok(c))return; Float x=c.getFloat("x"); Float y=c.getFloat("y"); if(x==null||y==null){c.reject("x and y");return;} SannaAccessibilityService.instance.tap(x,y); c.resolve(); }
    @PluginMethod public void swipe(PluginCall c){ if(!ok(c))return; SannaAccessibilityService.instance.swipe(c.getFloat("x1"),c.getFloat("y1"),c.getFloat("x2"),c.getFloat("y2"),c.getLong("duration",300L)); c.resolve(); }
    @PluginMethod public void clickByText(PluginCall c){ if(!ok(c))return; JSObject r=new JSObject(); r.put("success",SannaAccessibilityService.instance.clickByText(c.getString("text"))); c.resolve(r); }
    @PluginMethod public void clickById(PluginCall c){ if(!ok(c))return; JSObject r=new JSObject(); r.put("success",SannaAccessibilityService.instance.clickById(c.getString("viewId"))); c.resolve(r); }
    @PluginMethod public void getScreenText(PluginCall c){ if(!ok(c))return; JSObject r=new JSObject(); r.put("texts", new JSArray(SannaAccessibilityService.instance.getScreenText())); c.resolve(r); }
    @PluginMethod public void inputText(PluginCall c){ if(!ok(c))return; JSObject r=new JSObject(); r.put("success",SannaAccessibilityService.instance.inputText(c.getString("text"))); c.resolve(r); }
    @PluginMethod public void isServiceEnabled(PluginCall c){ JSObject r=new JSObject(); r.put("enabled",SannaAccessibilityService.instance!=null); c.resolve(r); }
    @PluginMethod public void isAccessibilityEnabled(PluginCall c){ isServiceEnabled(c); }
    @PluginMethod public void openAccessibilitySettings(PluginCall c){ Intent i=new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS); i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(i); c.resolve(); }
    @PluginMethod public void launchApp(PluginCall c){ String p=c.getString("packageName"); Intent i=getContext().getPackageManager().getLaunchIntentForPackage(p); JSObject r=new JSObject(); if(i==null){r.put("success",false);c.resolve(r);return;} i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(i); r.put("success",true); c.resolve(r); }
    @PluginMethod public void setVolume(PluginCall c){ int percent=50; try{ percent=c.getInt("percent"); }catch(Exception e){} AudioManager am=(AudioManager)getContext().getSystemService(Context.AUDIO_SERVICE); int max=am.getStreamMaxVolume(AudioManager.STREAM_MUSIC); am.setStreamVolume(AudioManager.STREAM_MUSIC, Math.round(max*percent/100f),0); JSObject r=new JSObject(); r.put("success",true); c.resolve(r); }
    @PluginMethod public void setAlarm(PluginCall c){ String t=c.getString("time","07:00"); String[] p=t.split(":"); Intent i=new Intent(AlarmClock.ACTION_SET_ALARM); i.putExtra(AlarmClock.EXTRA_HOUR,Integer.parseInt(p[0])); i.putExtra(AlarmClock.EXTRA_MINUTES,Integer.parseInt(p[1])); i.putExtra(AlarmClock.EXTRA_MESSAGE,c.getString("label","منبه سنا")); i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(i); JSObject r=new JSObject(); r.put("success",true); c.resolve(r); }
    @PluginMethod public void performGlobalAction(PluginCall c){ if(!ok(c))return; JSObject r=new JSObject(); r.put("success",SannaAccessibilityService.instance.global(c.getString("action","back"))); c.resolve(r); }

    @PluginMethod public void requestAppPermissions(PluginCall c){
        if (getActivity()!=null && android.os.Build.VERSION.SDK_INT>=23){
            getActivity().requestPermissions(new String[]{android.Manifest.permission.RECORD_AUDIO, android.Manifest.permission.POST_NOTIFICATIONS},1001);
        }
        JSObject r=new JSObject(); r.put("success",true); c.resolve(r);
    }
    @PluginMethod public void getNotifications(PluginCall c){
        JSArray arr=new JSArray();
        if (SannaNotificationListener.instance!=null){
            for (SannaNotificationListener.Item it: SannaNotificationListener.instance.snapshot()){
                JSObject o=new JSObject(); o.put("pkg",it.pkg); o.put("title",it.title); o.put("text",it.text); arr.put(o);
            }
        }
        JSObject r=new JSObject(); r.put("items",arr); r.put("enabled", SannaNotificationListener.instance!=null); c.resolve(r);
    }
    @PluginMethod public void openNotificationListenerSettings(PluginCall c){
        Intent i=new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(i); c.resolve();
    }
    @PluginMethod public void replyLastNotification(PluginCall c){ if(!ok(c))return; String text=c.getString("text",""); SannaAccessibilityService.instance.global("notifications"); boolean clicked=SannaAccessibilityService.instance.clickByText("رد")||SannaAccessibilityService.instance.clickByText("Reply")||SannaAccessibilityService.instance.clickByText("إجابة")||SannaAccessibilityService.instance.clickByText("أرسل"); boolean typed=SannaAccessibilityService.instance.inputText(text); JSObject r=new JSObject(); r.put("success", clicked||typed); c.resolve(r); }
        @PluginMethod public void requestBatteryIgnore(PluginCall c){
        try {
            android.content.Intent i=new android.content.Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            i.setData(android.net.Uri.parse("package:"+getContext().getPackageName()));
            i.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        } catch (Exception e) {}
        JSObject r=new JSObject(); r.put("success",true); c.resolve(r);
    }
@PluginMethod public void startBackgroundListening(PluginCall c){ JSObject r=new JSObject(); Intent i=new Intent(getContext(), VoiceForegroundService.class); if(android.os.Build.VERSION.SDK_INT>=26) getContext().startForegroundService(i); else getContext().startService(i); r.put("success", true); c.resolve(r); }
    @PluginMethod public void stopBackgroundListening(PluginCall c){ getContext().stopService(new Intent(getContext(), VoiceForegroundService.class)); JSObject r=new JSObject(); r.put("success",true); c.resolve(r); }
}
