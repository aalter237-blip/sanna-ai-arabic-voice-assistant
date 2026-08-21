import { askGemini } from './gemini-direct';

export async function runLocalAgent(apiKey: string, message: string, screenText: string = '') {
  const prompt =
    'You are Sanna, an Arabic Android voice agent. Understand dialect. ' +
    'Return JSON only: {"speech":"Arabic spoken reply","steps":[{"action":"open_app|click_by_text|type_text|home|back|notifications|set_volume","target":"","value":""}]} ' +
    'If user wants WhatsApp use target com.whatsapp. ' +
    'Screen: ' + screenText + ' User: ' + message;

  let speech = '';
  let steps: any[] = [];

  try {
    const raw = await askGemini(apiKey, prompt);
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const parsed = JSON.parse(raw.slice(start, end + 1));
      speech = parsed.speech || '';
      steps = Array.isArray(parsed.steps) ? parsed.steps : [];
    } else {
      speech = raw;
    }
  } catch (e) {
    speech = 'Gemini request failed';
  }

  const t = message.toLowerCase();
  if (t.includes('whatsapp') || t.includes('واتس')) steps.push({ action: 'open_app', target: 'com.whatsapp' });
  if (t.includes('youtube') || t.includes('يوتيوب')) steps.push({ action: 'open_app', target: 'com.google.android.youtube' });
  if (t.includes('home') || t.includes('رئيسي')) steps.push({ action: 'home' });
  if (t.includes('back') || t.includes('رجوع')) steps.push({ action: 'back' });

  if (!speech) speech = 'تم.';
  return { speech, steps };
}
