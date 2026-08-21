export async function verifyGeminiKey(apiKey: string) {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey)
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'المفتاح غير صالح');
  }
  return true;
}

export async function askGemini(apiKey: string, message: string) {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(apiKey),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'فشل الاتصال بـ Gemini');
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
