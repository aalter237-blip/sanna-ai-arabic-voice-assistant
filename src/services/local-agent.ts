import { askGemini } from './gemini-direct';

export async function runLocalAgent(apiKey: string, message: string) {
  const prompt = 'You are Sanna Android agent. Reply JSON only: {"speech":"...","steps":[{"action":"open_app|click_by_text|type_text|home|back","target":"...","value":"..."}]} User: ' + message;
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
  if (t.includes('whatsapp') || t.includes('watsapp')) {
    steps.push({ action: 'open_app', target: 'com.whatsapp' });
  }
  if (!speech) speech = 'Done';
  return { speech, steps };
}
