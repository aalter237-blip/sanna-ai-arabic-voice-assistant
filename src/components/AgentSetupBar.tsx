import React, { useState } from "react";
import { NativeAgentBridge } from "../services/native-agent-bridge";
const wait = (ms:number) => new Promise(r=>setTimeout(r,ms));
export function AgentSetupBar() {
  const [msg, setMsg] = useState("اضغط لتفعيل الخدمات بالترتيب");
  const activate = async () => {
    try {
      setMsg("1/4 الاذونات");
      await NativeAgentBridge.requestAppPermissions();
      await wait(400);
      setMsg("2/4 البطارية");
      await NativeAgentBridge.requestBatteryIgnore();
      await wait(400);
      setMsg("3/4 الاشعارات");
      await NativeAgentBridge.openNotificationListenerSettings();
      await wait(600);
      setMsg("4/4 امكانية الوصول ثم ارجع");
      await NativeAgentBridge.openAccessibilitySettings();
      await NativeAgentBridge.startBackgroundListening(["سنا","تلفوني","سناء","مساعدي"]);
    } catch (e) {
      setMsg("فعّل الخدمات يدويا");
    }
  };
  return (
    <div className="relative z-20 mx-3 mt-3 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-3 text-right" dir="rtl">
      <p className="text-sm text-slate-200 mb-2">{msg}</p>
      <button onClick={activate} className="w-full rounded-xl bg-cyan-500 text-slate-950 font-bold py-2">تفعيل الوكيل الكامل</button>
    </div>
  );
}
