# Spark Server

Spark AI chat app + ek chhota server jo Claude API se baat karta hai. Koi package install nahi karna padta (sirf Node 18+).

## Chalane ka tareeka (phone par Termux ya PC)
1. Node install karo (Termux: `pkg install nodejs`).
2. Is folder mein `.env.example` ko copy karke `.env` banao aur apni API key daalo:
   `cp .env.example .env` phir `nano .env`
3. `npm start`
4. Browser mein kholo: http://localhost:3000

API key https://console.anthropic.com se milti hai. Ye claude.ai subscription se alag, pay-as-you-go hai.

## Internet par daalna (Render, free plan)
1. Ye folder GitHub par upload karo.
2. Render.com par New > Web Service, apna repo chuno.
3. Build command khaali, Start command: `npm start`
4. Environment mein `ANTHROPIC_API_KEY` aur `APP_PASSWORD` daalo.
5. Jo URL mile (jaise https://spark.onrender.com) wahi aapka app hai.

## Zaroori
- `APP_PASSWORD` zaroor lagao, nahi to URL jaanne wala koi bhi aapke paise kharch kar sakta hai.
- App pehli baar password poochta hai, phir yaad rakhta hai.
- Har IP par 1 minute mein 30 messages ki limit hai.

## APK banana
`public/index.html` ko HTML-to-APK converter mein daalo. APK pehli baar server ka URL poochega (jaise https://spark.onrender.com), phir yaad rakhega.

## Settings (.env)
- `MODEL` (default claude-sonnet-5-5), `MAX_TOKENS` (default 1500), `PORT` (default 3000)
