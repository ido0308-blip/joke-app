const INSTRUCTIONS =
  'אתה כותב בדיחות קצרות בעברית. כתוב בדיחה אחת בלבד, עד ארבעה משפטים, נקייה ומתאימה לכל גיל. בלי הקדמה, בלי הסבר ובלי אימוג׳י. רק הבדיחה. ' +
  'אם הנושא פוגעני או לא מתאים לבדיחה נקייה, החזר בדיוק NO_JOKE ותו לא.';

const REFUSAL_MESSAGE = 'על הנושא הזה אין לי בדיחה. נסו נושא אחר.';

const json = (body, status = 200) => Response.json(body, { status });

function errorMessage(status, code) {
  if (status === 401) return 'בעיה במפתח של OpenAI.';
  if (code === 'insufficient_quota') return 'נגמר הקרדיט ב-OpenAI.';
  if (code === 'billing_hard_limit_reached') return 'הגענו למגבלת ההוצאה ב-OpenAI.';
  if (status === 429) return 'יותר מדי בקשות. נסו שוב עוד רגע.';
  if (status === 404 || code === 'model_not_found') return 'המודל לא נמצא.';
  return 'משהו השתבש. נסו שוב.';
}

function extractText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return { text: data.output_text.trim() };
  }
  let text = '';
  let refused = false;
  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const part of item.content ?? []) {
      if (part.type === 'output_text') text += part.text;
      if (part.type === 'refusal') refused = true;
    }
  }
  return { text: text.trim(), refused };
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ error: 'שיטה לא נתמכת' }, 405);
    }

    let topic = '';
    try {
      const body = await request.json();
      topic = String(body?.topic ?? '').trim().slice(0, 100);
    } catch {}

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[joke] OPENAI_API_KEY חסר');
      return json({ error: 'השרת לא מוגדר. חסר מפתח.' }, 500);
    }

    const model = process.env.OPENAI_MODEL || 'gpt-5';
    const input = topic ? `נושא הבדיחה: ${topic}` : 'אין נושא. ספר בדיחה כללית על החיים.';
    console.log(`[joke] נושא="${topic || '-'}" מודל=${model}`);

    let res;
    try {
      res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          instructions: INSTRUCTIONS,
          input,
          reasoning: { effort: 'low' },
          max_output_tokens: 2000,
        }),
      });
    } catch (err) {
      console.error('[joke] הפנייה ל-OpenAI נכשלה:', err);
      return json({ error: 'לא הצלחנו להגיע ל-OpenAI. נסו שוב.' }, 502);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const code = data?.error?.code ?? null;
      console.error(`[joke] OpenAI ${res.status} code=${code} ${data?.error?.message ?? ''}`);
      return json({ error: errorMessage(res.status, code) }, 502);
    }

    const { text, refused } = extractText(data);

    if (refused || text === 'NO_JOKE') {
      return json({ error: REFUSAL_MESSAGE }, 422);
    }

    if (!text) {
      console.error(`[joke] אין טקסט בתשובה. status=${data.status} reason=${data.incomplete_details?.reason}`);
      return json({ error: 'לא הגיעה בדיחה. נסו שוב.' }, 502);
    }

    return json({ joke: text });
  },
};
