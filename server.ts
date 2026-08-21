import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Multi-Key Gemini pool configuration
const DEFAULT_GEMINI_KEYS: string[] = [
  process.env.GEMINI_API_KEY || '',
  ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map((k) => k.trim()) : []),
  'AQ.Ab8RN6KttUzHJtl6XWnypbStsCJN-BLkaATXr5NZuAH1VFA25w',
  'AQ.Ab8RN6KKZeG68JQ_PfmDcWbZH4ErAwd66nLaHHRsQxdfq0iBEQ',
  'AQ.Ab8RN6IPCY2zz710mgUc6laGWcXEfYr3-_HNJg2nYSFqkliZxA',
].filter((k) => typeof k === 'string' && k.trim().length > 0);

let currentServerKeyIndex = 0;
const clientCache = new Map<string, GoogleGenAI>();

function getAIClient(customKey?: string): { client: GoogleGenAI; key: string; index: number } | null {
  const keyToUse = customKey && customKey.trim().length > 0
    ? customKey.trim()
    : DEFAULT_GEMINI_KEYS[currentServerKeyIndex % Math.max(DEFAULT_GEMINI_KEYS.length, 1)];

  if (!keyToUse) return null;

  if (!clientCache.has(keyToUse)) {
    clientCache.set(
      keyToUse,
      new GoogleGenAI({
        apiKey: keyToUse,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    );
  }

  return {
    client: clientCache.get(keyToUse)!,
    key: keyToUse,
    index: currentServerKeyIndex % Math.max(DEFAULT_GEMINI_KEYS.length, 1),
  };
}

function rotateServerGeminiKey(reason: string = 'Rate limit 429/403'): string {
  if (DEFAULT_GEMINI_KEYS.length <= 1) {
    return DEFAULT_GEMINI_KEYS[0] || '';
  }
  const oldIdx = currentServerKeyIndex;
  currentServerKeyIndex = (currentServerKeyIndex + 1) % DEFAULT_GEMINI_KEYS.length;
  console.warn(
    `[Server Gemini Rotator] 🔄 Rotated key [Index ${oldIdx} -> ${currentServerKeyIndex}] (...${DEFAULT_GEMINI_KEYS[currentServerKeyIndex].slice(-6)}) due to: ${reason}`
  );
  return DEFAULT_GEMINI_KEYS[currentServerKeyIndex];
}

const SYSTEM_PROMPT = `
You are an advanced Arabic AI Voice Assistant & General Android UI Automation Agent.
Your role is to understand user voice commands in Arabic across all dialects (Sudanese - سوداني, Modern Standard Arabic - الفصحى, Egyptian - مصري, Gulf/Saudi - خليجي/سعودي, Levantine - شامي, Maghrebi - مغاربي) and execute Android smartphone actions.

====================================================
GENERAL UI AUTOMATION & FALLBACK INSPECTION ENGINE
====================================================
1. FALLBACK UI AUTOMATION:
   If a user requests an action for an app, third-party service, or setting that doesn't have a dedicated native tool (e.g. adjust custom display settings, music player, social app, taxi booking, or shopping):
   - Step 1: Open the target app or setting package using "open_app" (tool: "system_control", action: "open_app", target: "app_package_name_or_id").
   - Step 2: Dynamically inspect screen element nodes for matching text or content descriptions (e.g. 'Settings', 'Save', 'Play', 'Send', 'Confirm', 'إعدادات', 'حفظ', 'تشغيل', 'إرسال', 'تأكيد', 'موافق').
   - Step 3: Automatically issue sequential "click_by_text", "type_text", or "scroll_forward" actions to complete the user's intent.

2. SMART GRACEFUL HANDLING OF SECURE SCREENS:
   If an action encounters a system-restricted secure screen (such as PIN entry, lock screen, biometric verification, password prompt, or financial banking payment confirmation):
   - You MUST navigate the user directly to that screen.
   - Do NOT attempt to simulate entering private credentials.
   - Verbally prompt the user with the friendly localized message:
     "فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار" (or in Sudanese/Gulf: "فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار").

====================================================
SUPPORTED ACTIONS & JSON SCHEMA:
====================================================
When an action is needed, return a structured JSON code block containing an array of steps:

\`\`\`json
{
  "speech": "الجملة الصوتية التي سيقولها المساعد للمستخدم باللغة العربية (مثال: فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار)",
  "dialect_detected": "sudanese" | "saudi" | "egyptian" | "levantine" | "maghrebi" | "msa",
  "intent": "general_ui_automation" | "send_whatsapp" | "read_screen" | "click_element" | "system_control" | "open_app" | "secure_checkpoint" | "general_qa",
  "steps": [
    {
      "step_number": 1,
      "tool": "system_control" | "accessibility_control" | "whatsapp_tool" | "screen_reader",
      "action": "open_app" | "click_by_text" | "click_by_id" | "scroll_forward" | "read_screen" | "read_screen_text" | "set_volume" | "set_alarm" | "set_timer" | "type_text" | "send_message" | "back" | "home" | "notifications" | "start_listen" | "read_notifications" | "reply_notification",
      "target": "package name, element text or view id",
      "value": "optional value or text to type",
      "recipient": "optional for whatsapp",
      "description": "وصف الخطوة بالعربية"
    }
  ]
}
\`\`\`

EXAMPLES:
1. User: "يا زول افتح لي تطبيق بنكك وحول 5000"
Response:
\`\`\`json
{
  "speech": "فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار.",
  "dialect_detected": "sudanese",
  "intent": "secure_checkpoint",
  "steps": [
    {
      "step_number": 1,
      "tool": "system_control",
      "action": "open_app",
      "target": "com.bok.bankak",
      "description": "فتح تطبيق البنك والانتقال لصفحة التحقق الآمن"
    }
  ]
}
\`\`\`

2. User: "تلفوني، شغل سورة الكهف واضغط حفظ في المفضلة"
Response:
\`\`\`json
{
  "speech": "حاضر، سأقوم بفتح التطبيق وتشغيل السورة والضغط على حفظ في المفضلة.",
  "dialect_detected": "saudi",
  "intent": "general_ui_automation",
  "steps": [
    {
      "step_number": 1,
      "tool": "system_control",
      "action": "open_app",
      "target": "com.quran.audio",
      "description": "فتح تطبيق الصوتيات"
    },
    {
      "step_number": 2,
      "tool": "accessibility_control",
      "action": "click_by_text",
      "target": "سورة الكهف",
      "description": "البحث عن عقدة النص والنقر عليها"
    },
    {
      "step_number": 3,
      "tool": "accessibility_control",
      "action": "click_by_text",
      "target": "حفظ",
      "description": "النقر التلقائي على زر الحفظ"
    }
  ]
}
\`\`\`
`;

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Voice Assistant Backend",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint to validate a custom Gemini API Key
app.post("/api/keys/validate", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return res.status(400).json({ valid: false, error: "يرجى كتابة مفتاح API صالح." });
  }

  try {
    const testClient = new GoogleGenAI({ apiKey: apiKey.trim() });
    const testRes = await testClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "قل: تم التحقق بنجاح",
    });

    return res.json({
      valid: true,
      message: "تم التحقق من المفتاح بنجاح! المفتاح يعمل بشكل ممتاز.",
      sample: testRes.text || "تم التحقق",
    });
  } catch (err: any) {
    return res.status(400).json({
      valid: false,
      error: err.message || "فشل التحقق من المفتاح. تأكد من صحة المفتاح والصلاحيات.",
    });
  }
});

// Cloud Gemini Inference endpoint with Multi-Key Rotation & Failover
app.post("/api/agent/chat", async (req, res) => {
  const { message, history = [], dialect = "auto", currentScreen = "home", activeKey } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message string is required" });
  }

  const prompt = `
[CURRENT CONTEXT]
- Screen State: ${currentScreen}
- User Preferred Dialect: ${dialect}
- Conversation History: ${JSON.stringify(history.slice(-12))}

[USER COMMAND]
"${message}"
`;

  const maxAttempts = Math.max(DEFAULT_GEMINI_KEYS.length, 1);
  let failoverCount = 0;
  let lastErrorMsg = "";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // If client supplied a custom activeKey on the first attempt, use it; otherwise use server pool
    const keyCandidate = attempt === 0 && activeKey ? activeKey : undefined;
    const aiContext = getAIClient(keyCandidate);

    if (!aiContext) {
      break;
    }

    try {
      const response = await aiContext.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      let parsedPayload: any = null;

      try {
        parsedPayload = JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedPayload = JSON.parse(jsonMatch[0]);
          } catch {
            parsedPayload = {
              speech: text,
              intent: "general_qa",
              steps: [],
            };
          }
        } else {
          parsedPayload = {
            speech: text,
            intent: "general_qa",
            steps: [],
          };
        }
      }

      return res.json({
        source: "gemini-cloud",
        key_index: aiContext.index,
        failovers_handled: failoverCount,
        ...parsedPayload,
      });
    } catch (error: any) {
      lastErrorMsg = error.message || String(error);
      const errStr = lastErrorMsg.toLowerCase();
      const isRateLimitOrQuota =
        errStr.includes("429") ||
        errStr.includes("403") ||
        errStr.includes("quota") ||
        errStr.includes("rate limit") ||
        errStr.includes("resource_exhausted") ||
        errStr.includes("overloaded");

      if (isRateLimitOrQuota && DEFAULT_GEMINI_KEYS.length > 1) {
        failoverCount += 1;
        rotateServerGeminiKey(`Client error: ${lastErrorMsg}`);
        continue;
      }

      console.error(`Gemini API call failed on attempt ${attempt + 1}:`, lastErrorMsg);
      if (DEFAULT_GEMINI_KEYS.length > 1 && attempt < maxAttempts - 1) {
        failoverCount += 1;
        rotateServerGeminiKey(`Attempt error: ${lastErrorMsg}`);
        continue;
      }
    }
  }

  // Graceful offline heuristic fallback if all cloud keys fail
  console.warn("All Gemini API keys failed or rate-limited. Serving offline heuristic response.");
  const fallback = generateOfflineResponse(message, currentScreen);
  return res.json({
    source: "offline_fallback_on_error",
    failovers_handled: failoverCount,
    error_note: lastErrorMsg || "Failed to reach Cloud AI, switched to on-device edge parser.",
    ...fallback,
  });
});

// Offline Edge SLM / Local Sidecar Simulation Endpoint
app.post("/api/offline/chat", async (req, res) => {
  const { message, currentScreen = "home" } = req.body;
  const result = generateOfflineResponse(message || "", currentScreen);
  return res.json({
    source: "local_edge_slm",
    latency_ms: Math.floor(Math.random() * 25) + 15,
    ...result,
  });
});

// Heuristic on-device intent parser for offline resilience
function generateOfflineResponse(text: string, currentScreen: string) {
  const lower = text.trim();

  // Secure screens / PIN / Financial payment prompts
  if (
    lower.includes("بنك") ||
    lower.includes("رقم سري") ||
    lower.includes("رمز") ||
    lower.includes("pin") ||
    lower.includes("بصمة") ||
    lower.includes("تحويل") ||
    lower.includes("سداد")
  ) {
    return {
      speech: "فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار.",
      dialect_detected: "sudanese",
      intent: "secure_checkpoint",
      steps: [
        {
          step_number: 1,
          tool: "system_control",
          action: "open_app",
          target: "com.android.settings",
          description: "التوجيه الآمن إلى شاشة التحقق وحماية البيانات الحساسة",
        },
      ],
    };
  }

  // WhatsApp Send
  if (lower.includes("واتساب") || lower.includes("واتس") || lower.includes("رسالة") || lower.includes("ابعث") || lower.includes("أرسل")) {
    let recipient = "أمي";
    if (lower.includes("علي") || lower.includes("لعلي")) recipient = "علي";
    if (lower.includes("محمد") || lower.includes("لمحمد")) recipient = "محمد";
    if (lower.includes("سارة") || lower.includes("لسارة")) recipient = "سارة";
    if (lower.includes("أبي") || lower.includes("لأبي") || lower.includes("ابوي")) recipient = "أبي";

    return {
      speech: `تم في الوضع غير المتصل: سأقوم بفتح واتساب وإرسال الرسالة إلى ${recipient}.`,
      dialect_detected: "msa",
      intent: "send_whatsapp",
      steps: [
        {
          step_number: 1,
          tool: "whatsapp_tool",
          action: "send_message",
          recipient: recipient,
          value: text,
          description: `إرسال رسالة واتساب مباشرة إلى ${recipient} عبر خدمة إمكانية الوصول`,
        },
      ],
    };
  }

  // Read screen / Accessibility
  if (lower.includes("اقرأ") || lower.includes("شاشة") || lower.includes("اقرا") || lower.includes("لخص") || lower.includes("شو مكتوب")) {
    return {
      speech: "جاري فحص الشاشة وقراءة النصوص المتوفرة بواسطة خدمة Accessibility Service.",
      dialect_detected: "msa",
      intent: "read_screen",
      steps: [
        {
          step_number: 1,
          tool: "accessibility_control",
          action: "read_screen_text",
          target: "active_window_root",
          description: "قراءة نصوص الشاشة الحالية وتلخيصها",
        },
      ],
    };
  }

  // Volume / Brightness / System
  if (lower.includes("صوت") || lower.includes("علّي") || lower.includes("وطّي") || lower.includes("كتم")) {
    const isUp = lower.includes("علّي") || lower.includes("ارفع") || lower.includes("زيادة") || lower.includes("آخر");
    return {
      speech: isUp ? "تم رفع مستوى صوت الوسائط." : "تم خفض مستوى الصوت.",
      dialect_detected: "msa",
      intent: "system_control",
      steps: [
        {
          step_number: 1,
          tool: "system_control",
          action: "set_volume",
          value: isUp ? 100 : 30,
          description: isUp ? "رفع الصوت إلى 100%" : "خفض الصوت إلى 30%",
        },
      ],
    };
  }

  // Alarm / Timer
  if (lower.includes("منبه") || lower.includes("صحيني") || lower.includes("ساعة") || lower.includes("مؤقت")) {
    return {
      speech: "تم ضبط المنبه بنجاح عبر مدير النظام المحلي.",
      dialect_detected: "msa",
      intent: "system_control",
      steps: [
        {
          step_number: 1,
          tool: "system_control",
          action: "set_timer",
          target: "07:00 AM",
          value: "منبه صوتي",
          description: "ضبط منبه النظام عبر Android AlarmManager",
        },
      ],
    };
  }

  // General UI Automation / App Open & Action
  if (lower.includes("افتح") || lower.includes("شغل") || lower.includes("احفظ") || lower.includes("حفظ") || lower.includes("إعدادات")) {
    let appTarget = "com.android.settings";
    let appName = "الإعدادات";
    if (lower.includes("واتس") || lower.includes("واتساب")) {
      appTarget = "com.whatsapp";
      appName = "واتساب";
    } else if (lower.includes("كاميرا") || lower.includes("صور")) {
      appTarget = "com.android.camera";
      appName = "الكاميرا";
    } else if (lower.includes("خرائط") || lower.includes("خريطة") || lower.includes("مابز")) {
      appTarget = "com.google.android.apps.maps";
      appName = "خرائط Google";
    } else if (lower.includes("يوتيوب")) {
      appTarget = "com.google.android.youtube";
      appName = "YouTube";
    } else if (lower.includes("قرآن") || lower.includes("صوتيات")) {
      appTarget = "com.quran.audio";
      appName = "المشغل الصوتي";
    }

    return {
      speech: `أبشر، جاري فتح ${appName} وتنفيذ الأوامر عبر فحص عناصر الشاشة.`,
      dialect_detected: "msa",
      intent: "general_ui_automation",
      steps: [
        {
          step_number: 1,
          tool: "system_control",
          action: "open_app",
          target: appTarget,
          description: `تشغيل تطبيق ${appName}`,
        },
        {
          step_number: 2,
          tool: "accessibility_control",
          action: "click_by_text",
          target: lower.includes("حفظ") ? "حفظ" : lower.includes("تشغيل") ? "تشغيل" : "إعدادات",
          description: "فحص شجرة عناصر الشاشة والنقر على العنصر المطابق",
        },
      ],
    };
  }

  // Click on screen
  if (lower.includes("اضغط") || lower.includes("انقر") || lower.includes("دوس") || lower.includes("كبس")) {
    return {
      speech: "جاري البحث عن العنصر والنقر عليه عبر خدمة إمكانية الوصول.",
      dialect_detected: "msa",
      intent: "click_element",
      steps: [
        {
          step_number: 1,
          tool: "accessibility_control",
          action: "click_by_text",
          target: text.replace(/(اضغط|انقر|دوس|على|زر)/g, "").trim() || "التالي",
          description: "العثور على عقدة AccessibilityNodeInfo وتنفيذ ACTION_CLICK",
        },
      ],
    };
  }

  // General fallback
  return {
    speech: "أهلاً بك، أنا مساعدك الصوتي الذكي للأندرويد. يمكنك أن تطلب مني فتح أي تطبيق، النقر التلقائي، أو قراءة الشاشة.",
    dialect_detected: "msa",
    intent: "general_qa",
    steps: [],
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Voice Assistant] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
