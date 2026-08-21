import { askGemini } from './gemini-direct';

export async function runLocalAgent(apiKey: string, message: string, screenText: string = '') {
  const prompt =
    'You are Sanna, a warm human-like Arabic voice companion. Speak naturally, short spoken Arabic, matching dialect. Return JSON only: {"speech":"...","steps":[{"action":"open_app|click_by_text|type_text|home|back|notifications","target":"","value":""}]} Screen: ' +
    screenText + ' User: ' + message;
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
    speech = 'OK, try again.';
  }
  if (!speech) speech = 'OK';
  return { speech, steps };
}
