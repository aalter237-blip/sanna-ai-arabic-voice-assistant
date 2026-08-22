import { askGemini } from './gemini-direct';
import { ArabicDialect, ToolStep } from '../types';

export interface LocalAgentResult {
  speech: string;
  dialect_detected?: ArabicDialect;
  intent?: string;
  steps: ToolStep[];
}

export async function runLocalAgent(
  apiKey: string,
  message: string,
  screenText: string = '',
  preferredDialect: ArabicDialect = 'auto'
): Promise<LocalAgentResult> {
  const cleanMsg = (message || '').trim();

  // If an API Key is available, attempt direct Gemini inference
  if (apiKey && apiKey.trim()) {
    try {
      const prompt = `You are "Sanna" (سنا), an advanced Arabic Voice Assistant & Android UI Automation Agent.
User message: "${cleanMsg}"
Preferred dialect: ${preferredDialect}
Active screen text: "${screenText}"

Return JSON ONLY with this format:
{
  "speech": "Arabic voice response spoken to user",
  "dialect_detected": "sudanese"|"saudi"|"egyptian"|"levantine"|"maghrebi"|"msa",
  "intent": "general_ui_automation"|"send_whatsapp"|"read_screen"|"click_element"|"system_control"|"open_app"|"secure_checkpoint"|"general_qa",
  "steps": [
    {
      "step_number": 1,
      "tool": "system_control"|"accessibility_control"|"whatsapp_tool"|"screen_reader",
      "action": "open_app"|"click_by_text"|"click_by_id"|"type_text"|"send_message"|"set_volume"|"set_alarm"|"back"|"home"|"notifications"|"read_notifications",
      "target": "package or target element",
      "value": "text or volume value",
      "recipient": "recipient if whatsapp",
      "description": "Arabic step description"
    }
  ]
}

CRITICAL RULES:
- If banking/PIN/password/secure screen, set intent="secure_checkpoint", open_app to bank, do not simulate credentials, speech="فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار".
- Return ONLY valid JSON, no markdown formatting outside the JSON.`;

      const raw = await askGemini(apiKey.trim(), prompt);
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        return {
          speech: parsed.speech || 'تم تنفيذ طلبك بنجاح.',
          dialect_detected: parsed.dialect_detected || 'msa',
          intent: parsed.intent || 'general_ui_automation',
          steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        };
      }
    } catch (err) {
      console.warn('[Local Agent Gemini Error, falling back to offline SLM]:', err);
    }
  }

  // Fast Edge SLM Heuristic Parser (Local Offline Mode)
  return parseOfflineCommand(cleanMsg);
}

function parseOfflineCommand(text: string): LocalAgentResult {
  const lower = text.trim();

  // Dialect Detection
  let dialect: ArabicDialect = 'msa';
  if (lower.includes('زول') || lower.includes('ليك') || lower.includes('داير') || lower.includes('هسع') || lower.includes('شنو') || lower.includes('بنكك')) {
    dialect = 'sudanese';
  } else if (lower.includes('تلفوني') || lower.includes('ابشر') || lower.includes('وش') || lower.includes('تكفى') || lower.includes('ودي')) {
    dialect = 'saudi';
  } else if (lower.includes('عايز') || lower.includes('ايه') || lower.includes('ازيك') || lower.includes('دلوقتي')) {
    dialect = 'egyptian';
  } else if (lower.includes('بدي') || lower.includes('شو') || lower.includes('هيك') || lower.includes('هلأ')) {
    dialect = 'levantine';
  } else if (lower.includes('دابا') || lower.includes('واخا') || lower.includes('عفاك')) {
    dialect = 'maghrebi';
  }

  // 1. Notifications Shade
  if (lower.includes('إشعار') || lower.includes('اشعار') || lower.includes('إشعارات') || lower.includes('اشعارات') || lower.includes('تنبيهات')) {
    return {
      speech: 'جاري سحب لوحة الإشعارات وقراءة آخر التنبيهات.',
      dialect_detected: dialect,
      intent: 'read_notifications',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'notifications',
          description: 'فتح لوحة الإشعارات (Notification Shade)',
        },
        {
          step_number: 2,
          tool: 'system_control',
          action: 'read_notifications',
          description: 'قراءة الإشعارات عبر SannaNotificationListener',
        },
      ],
    };
  }

  // 2. Banking & Secure PIN Checkpoints
  if (lower.includes('بنك') || lower.includes('بنكك') || lower.includes('رمز') || lower.includes('pin') || lower.includes('بصمة') || lower.includes('تحويل')) {
    return {
      speech: dialect === 'sudanese'
        ? 'فتحت ليك الصفحة، يرجى إدخال الرمز للاستمرار.'
        : 'فتحت لك صفحة البنك، يرجى إدخال رمز الأمان للمتابعة.',
      dialect_detected: dialect === 'sudanese' ? 'sudanese' : dialect,
      intent: 'secure_checkpoint',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'open_app',
          target: 'com.bok.bankak',
          description: 'فتح تطبيق البنك والانتقال لصفحة التحقق الآمن',
        },
      ],
    };
  }

  // 2. WhatsApp
  if (lower.includes('واتساب') || lower.includes('واتس') || lower.includes('رسالة') || lower.includes('ابعث') || lower.includes('أرسل') || lower.includes('ارسل')) {
    let recipient = 'أمي';
    if (lower.includes('علي') || lower.includes('لعلي')) recipient = 'علي';
    else if (lower.includes('محمد') || lower.includes('لمحمد')) recipient = 'محمد';
    else if (lower.includes('سارة') || lower.includes('لسارة')) recipient = 'سارة';
    else if (lower.includes('أبي') || lower.includes('لأبي') || lower.includes('ابوي')) recipient = 'أبي';

    const msg = lower.includes('في الطريق') ? 'أنا في الطريق الآن' : text;

    return {
      speech: dialect === 'sudanese'
        ? `حاضر، جاري إرسال الرسالة إلى ${recipient} عبر الواتساب.`
        : `أبشر، جاري فتح واتساب وإرسال الرسالة إلى ${recipient}.`,
      dialect_detected: dialect,
      intent: 'send_whatsapp',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'open_app',
          target: 'com.whatsapp',
          description: 'فتح تطبيق واتساب',
        },
        {
          step_number: 2,
          tool: 'accessibility_control',
          action: 'click_by_text',
          target: recipient,
          description: `اختيار محادثة ${recipient}`,
        },
        {
          step_number: 3,
          tool: 'accessibility_control',
          action: 'type_text',
          value: msg,
          description: `كتابة نص الرسالة: "${msg}"`,
        },
        {
          step_number: 4,
          tool: 'accessibility_control',
          action: 'click_by_id',
          target: 'com.whatsapp:id/send',
          description: 'النقر على زر الإرسال',
        },
      ],
    };
  }

  // 3. Screen Reader / Accessibility OCR
  if (lower.includes('اقرأ') || lower.includes('اقرا') || lower.includes('شاشة') || lower.includes('شو مكتوب') || lower.includes('لخص')) {
    return {
      speech: 'جاري فحص الشاشة وقراءة النصوص المتوفرة بواسطة خدمة Accessibility Service.',
      dialect_detected: dialect,
      intent: 'read_screen',
      steps: [
        {
          step_number: 1,
          tool: 'accessibility_control',
          action: 'read_screen_text',
          target: 'active_window_root',
          description: 'قراءة نصوص الشاشة الحالية وتلخيصها',
        },
      ],
    };
  }

  // 4. Volume
  if (lower.includes('صوت') || lower.includes('علّي') || lower.includes('وطّي') || lower.includes('ارفع') || lower.includes('اخفض')) {
    const isUp = lower.includes('علّي') || lower.includes('ارفع') || lower.includes('100');
    const targetVol = isUp ? 100 : 30;
    return {
      speech: isUp ? 'تم رفع مستوى صوت الوسائط إلى 100%.' : 'تم خفض مستوى الصوت إلى 30%.',
      dialect_detected: dialect,
      intent: 'system_control',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'set_volume',
          value: targetVol,
          description: `ضبط الصوت إلى ${targetVol}%`,
        },
      ],
    };
  }

  // 5. Alarm / Timer
  if (lower.includes('منبه') || lower.includes('صحيني') || lower.includes('ساعة') || lower.includes('مؤقت')) {
    return {
      speech: 'تم ضبط المنبه بنجاح على الساعة 07:00 AM عبر مدير النظام.',
      dialect_detected: dialect,
      intent: 'system_control',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'open_app',
          target: 'com.android.deskclock',
          description: 'فتح تطبيق الساعة والمنبه',
        },
        {
          step_number: 2,
          tool: 'system_control',
          action: 'set_alarm',
          target: '07:00 AM',
          value: 'منبه صوتي - سنا',
          description: 'ضبط منبه 07:00 AM',
        },
      ],
    };
  }

  // 6. Quran / Media Player with Auto Click
  if (lower.includes('قرآن') || lower.includes('الكهف') || lower.includes('سورة') || lower.includes('صوتيات')) {
    return {
      speech: 'حاضر، سأقوم بفتح المشغل وتشغيل سورة الكهف والضغط على حفظ في المفضلة.',
      dialect_detected: dialect,
      intent: 'general_ui_automation',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'open_app',
          target: 'com.quran.audio',
          description: 'فتح تطبيق مشغل القرآن',
        },
        {
          step_number: 2,
          tool: 'accessibility_control',
          action: 'click_by_text',
          target: 'سورة الكهف',
          description: 'البحث عن سورة الكهف والنقر عليها',
        },
        {
          step_number: 3,
          tool: 'accessibility_control',
          action: 'click_by_text',
          target: 'حفظ في المفضلة',
          description: 'النقر التلقائي على زر حفظ في المفضلة',
        },
      ],
    };
  }

  // 7. Notifications Shade
  if (lower.includes('إشعار') || lower.includes('اشعار') || lower.includes('إشعارات') || lower.includes('اشعارات')) {
    return {
      speech: 'جاري سحب لوحة الإشعارات وقراءة آخر التنبيهات.',
      dialect_detected: dialect,
      intent: 'read_notifications',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'notifications',
          description: 'فتح لوحة الإشعارات (Notification Shade)',
        },
        {
          step_number: 2,
          tool: 'system_control',
          action: 'read_notifications',
          description: 'قراءة الإشعارات عبر SannaNotificationListener',
        },
      ],
    };
  }

  // 8. General open app
  let appTarget = 'com.android.settings';
  let appName = 'الإعدادات';
  if (lower.includes('كاميرا') || lower.includes('صور')) {
    appTarget = 'com.android.camera';
    appName = 'الكاميرا';
  } else if (lower.includes('خرائط') || lower.includes('مابز')) {
    appTarget = 'com.google.android.apps.maps';
    appName = 'الخرائط';
  } else if (lower.includes('يوتيوب')) {
    appTarget = 'com.google.android.youtube';
    appName = 'YouTube';
  }

  if (lower.includes('افتح') || lower.includes('شغل')) {
    return {
      speech: `أبشر، جاري فتح ${appName} وتنفيذ الأوامر.`,
      dialect_detected: dialect,
      intent: 'open_app',
      steps: [
        {
          step_number: 1,
          tool: 'system_control',
          action: 'open_app',
          target: appTarget,
          description: `تشغيل تطبيق ${appName}`,
        },
      ],
    };
  }

  // Default Fallback
  return {
    speech: dialect === 'sudanese'
      ? 'أهلاً بيك يا زول! أنا سنا، مساعدك الصوتي الذكي. كيف أقدر أساعدك هسع؟'
      : dialect === 'saudi'
      ? 'يا هلا والله! أنا سنا مساعدك الصوتي للتحكم الكامل بالجوال. سم وأمرني!'
      : 'مرحباً بك! أنا سنا، وكيلك الصوتي للتحكم الكامل بالهاتف. يمكنك أن تطلب مني فتح أي تطبيق، إرسال رسائل، أو قراءة الشاشة.',
    dialect_detected: dialect,
    intent: 'general_qa',
    steps: [],
  };
}
