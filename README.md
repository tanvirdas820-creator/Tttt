# Spark Server

Spark AI chat app + ek chhota server jo Claude API se baat karta hai. Koi package install nahi karna, sirf Node 18+ chahiye.

## 1. Server chalao

### Option A: Internet par (Render, free) — APK ke liye sabse achha
1. Ye folder GitHub par upload karo (`.env` upload mat karna).
2. render.com par New > Blueprint (ya Web Service), apna repo chuno. `render.yaml` sab set kar deta hai.
3. Environment mein `ANTHROPIC_API_KEY` aur `APP_PASSWORD` daalo.
4. Jo URL mile (jaise https://spark.onrender.com) wahi aapka server hai.
   Free plan par server 15 min baad sota hai, pehla message 30-50 second le sakta hai.

### Option B: Isi phone par (Termux)
1. `pkg install nodejs`, phir zip ko extract karo.
2. `cp .env.example .env` aur `nano .env` se key aur password daalo.
3. `npm start`. Server http://localhost:3000 par chalega (Termux khula rehna chahiye).

API key https://console.anthropic.com se milti hai. Ye claude.ai subscription se alag, pay-as-you-go hai.

## 2. APK banao
1. Apne HTML-to-APK converter mein **public/index.html** daalo (ya alag se mili `Spark-APK.html`). Internet permission on rakho. Purani APK uninstall karke nayi install karo.
2. App kholo, menu (☰) > **Server settings**.
3. Server URL (jaise https://spark.onrender.com ya Termux ke liye http://localhost:3000) aur password daalo, **Test** dabao, phir **Save**.

## Zaroori
- `APP_PASSWORD` zaroor lagao, warna URL jaanne wala koi bhi aapke paise kharch kar sakta hai.
- Har IP par 1 minute mein 30 messages ki limit hai.
- Server galti batata hai (galat key, galat model, galat password), wahi message app mein dikhta hai.
- WebView mein mic dictation nahi chalta; photo aur file attach, sound effects, voice clips aur read aloud chalte hain.

## Settings (.env)
`MODEL` (default claude-sonnet-5-5), `MAX_TOKENS` (1500), `PORT` (3000)
