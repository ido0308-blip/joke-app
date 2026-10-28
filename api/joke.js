export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'שיטה לא נתמכת' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let topic = '';
    try {
      const body = await request.json();
      topic = String(body.topic ?? '').trim().slice(0, 100);
    } catch {
      // גוף שבור נחשב "אין נושא"
    }

    const keyStatus = process.env.OPENAI_API_KEY ? 'נמצא' : 'חסר';
    const label = topic ? topic : 'כללי';
    const joke = `בדיחה זמנית מהשרת: ${label}. המפתח: ${keyStatus}`;

    console.log(`[joke] נושא="${label}" מפתח=${keyStatus}`);

    return new Response(JSON.stringify({ joke }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
