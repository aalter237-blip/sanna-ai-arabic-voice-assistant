import React, { useState } from "react";
import { NativeAgentBridge } from "../services/native-agent-bridge";

export function AgentSetupBar() {
  const [msg, setMsg] = useState("فعّل الخدمات ليشتغل الوكيل");
  const activate = async () => {
    try {
      await NativeAgentBridge.requestAppPermissions();
      await NativeAgentBridge.startBackgroundListening(["سنا","تلفوني","سناء","مساعدي"]);
      if ((NativeAgentBridge as any).openNotificationListenerSettings) {
        await NativeAgentBridge.openNotificationListenerSettings();
      }
      await NativeAgentBridge.openAccessibilitySettings();
      const p = (NativeAgentBridge as any).getPlugin?.() || null;
      try { await (window as any).Capacitor?.Plugins?.VoiceAgent?.requestBatteryIgnore?.(); } catch {}
      setMsg("فعّل: إمكانية الوصول + الإشعارات + الميكروفون + البطارية");
    } catch (e) {
      setMsg("تعذر فتح الإعدادات، فعّلها يدوياً");
    }
  };
  return (
    <div className="relative z-20 mx-3 mt-3 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-3 text-right" dir="rtl">
      <p className="text-sm text-slate-200 mb-2">{msg}</p>
      <button onClick={activate} className="w-full rounded-xl bg-cyan-500 text-slate-950 font-bold py-2">
        تفعيل الوكيل الكامل
      </button>
    </div>
  );
}
