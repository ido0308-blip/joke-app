# תוכנית מיילסטון 1: Walking Skeleton

## המטרה
הדף והפונקציה עולים ב-Vercel, מדברים זה עם זה, ללא AI עדיין.

## קבצים שנוצרים

### `index.html`
- מבנה: `lang="he"`, `dir="rtl"`, גופנים מ-Google Fonts (Fredoka, Playpen Sans Hebrew).
- רקע: `bg-dots.svg` חוזר, `bg-doodles.svg` פעם אחת למעלה.
- רכיבים מלמעלה למטה:
  - `assets/logo.svg` ברוחב 300, מרוכז.
  - שורת הסבר.
  - תווית + תיבה (maxlength 100, placeholder "למשל: חתולים").
  - כפתור "תנו לי בדיחה!" - אדום, גלולה, גובה 64, צל קשה 8.
  - בועת בדיחה עם הדמות.
  - שורת תחתית.
- ארבעה מצבים דרך `data-state` על הבועה: `idle`, `think`, `joke`, `error`.
  - `idle`: `mascot-idle.svg`, טקסט "לוחצים על הכפתור, והבדיחה מופיעה כאן".
  - `think`: `mascot-think.svg`, כפתור נעול וכותב "חושב...", הדמות נמעכת.
  - `joke`: `mascot-joke.svg` בפינה, בדיחה בכתב יד Playpen Sans, כפתור "עוד בדיחה!".
  - `error`: `mascot-error.svg`, רקע ורדרד, הודעה באדום, כפתור "לנסות שוב".
- JavaScript: `fetch` ל-`/api/joke` עם POST, מציג `joke` עם `textContent`.
- `aria-live="polite"` על אזור הבדיחה.
- `prefers-reduced-motion`: בלי אנימציות.

### `api/joke.js`
- `export default { async fetch(request) { ... } }`.
- מקבל רק POST; מחזיר 405 לשאר.
- קורא `topic` מה-JSON, חותך ל-100 תווים.
- מחזיר `{ "joke": "בדיחה זמנית מהשרת: [הנושא]. המפתח: נמצא" }` אם `process.env.OPENAI_API_KEY` קיים.
- מחזיר `{ "joke": "בדיחה זמנית מהשרת: [הנושא]. המפתח: חסר" }` אם אינו קיים.
- כותב `console.log` קצר לכל פנייה.

### `package.json`
- `"type": "module"` בלבד, אין `dependencies`.

## מה שלא נוצר
- `manifest.webmanifest`, `sw.js` - ב-Milestone 3.
- קריאה אמיתית ל-OpenAI - ב-Milestone 2.

## סדר הבנייה
1. `package.json`
2. `api/joke.js`
3. `index.html` - מבנה + CSS + JavaScript

## אחרי הבנייה - מה המשתמש עושה ביד
1. `git push` ל-`main`.
2. ב-Vercel: New Project → Import → Framework Preset: Other → Deploy.
3. ב-OpenAI: מפתח production בשם `joke-in-a-click`.
4. ב-Vercel, Environment Variables: שם `OPENAI_API_KEY`, סוג Secret, Production ו-Preview. ואז Redeploy.

## תנאי השלמה (מ-MILESTONES.md)
1. הכתובת נפתחת בטלפון, בעברית, RTL, לפי DESIGN.md.
2. לחיצה מציגה "בדיחה זמנית מהשרת" עם הנושא, ו"המפתח: נמצא".
3. בלשונית Network: POST אחד ל-`/api/joke`.
4. ב-Logs של Vercel: שורה לכל לחיצה.
5. אין כותרות CORS, אין טיפול ב-OPTIONS.
6. ב-GitHub: אין `.env`, אין `.env.local`. יש `.env.example` ו-`.claude/settings.json`.
