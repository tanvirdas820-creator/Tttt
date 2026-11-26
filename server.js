"use strict";
// Spark server: serves the app and proxies chat to the Claude API. No dependencies, Node 18+.
const http = require("http"), fs = require("fs"), path = require("path");
try {
  fs.readFileSync(path.join(__dirname, ".env"), "utf8").split("\n").forEach(l => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  });
} catch {}
const KEY = process.env.ANTHROPIC_API_KEY, MODEL = process.env.MODEL || "claude-sonnet-5-5";
const PORT = +process.env.PORT || 3000, PW = process.env.APP_PASSWORD || "", MAXTOK = +process.env.MAX_TOKENS || 1500;
if (!KEY) { console.error("Missing ANTHROPIC_API_KEY. Put it in a .env file (see .env.example)."); process.exit(1); }
if (!PW) console.warn("Warning: APP_PASSWORD is empty, so anyone with your URL can use your API credits.");

const hits = new Map();
function limited(ip) { const n = Date.now(), a = (hits.get(ip) || []).filter(t => n - t < 6e4); a.push(n); hits.set(ip, a); return a.length > 30; }
setInterval(() => hits.clear(), 6e5).unref();

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon" };
function readBody(req, max = 8e6) {
  return new Promise((res, rej) => {
    let n = 0; const c = [];
    req.on("data", d => { n += d.length; if (n > max) { rej(new Error("too big")); req.destroy(); } else c.push(d); });
    req.on("end", () => res(Buffer.concat(c).toString()));
    req.on("error", rej);
  });
}

async function handle(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type,x-app-key");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();

  if (req.method === "POST" && req.url.split("?")[0] === "/api/chat") {
    if (PW && req.headers["x-app-key"] !== PW) { res.writeHead(401); return res.end(); }
    if (limited(ip)) { res.writeHead(429); return res.end(); }
    let j; try { j = JSON.parse(await readBody(req)); } catch { res.writeHead(400); return res.end(); }
    const msgs = Array.isArray(j.messages) ? j.messages.slice(-30) : [];
    if (!msgs.length) { res.writeHead(400); return res.end(); }
    const ac = new AbortController(); res.on("close", () => ac.abort());
    let up;
    try {
      up = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: ac.signal,
        headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: MAXTOK, stream: true, system: String(j.system || "").slice(0, 4000), messages: msgs })
      });
    } catch { res.writeHead(502); return res.end(); }
    if (!up.ok) { console.error("Claude API error", up.status, await up.text().catch(() => "")); res.writeHead(up.status === 429 ? 429 : 502); return res.end(); }
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" });
    const dec = new TextDecoder(); let buf = "";
    try {
      for await (const ch of up.body) {
        buf += dec.decode(ch, { stream: true });
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          try { const e = JSON.parse(line.slice(5)); if (e.type === "content_block_delta" && e.delta && e.delta.text) res.write(e.delta.text); } catch {}
        }
      }
    } catch {}
    return res.end();
  }

  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
  let p; try { p = decodeURIComponent(req.url.split("?")[0]); } catch { res.writeHead(400); return res.end(); }
  if (p.endsWith("/")) p += "index.html";
  const root = path.join(__dirname, "public"), f = path.join(root, path.normalize(p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, d) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(d);
  });
}
http.createServer((req, res) => { handle(req, res).catch(() => { try { res.end(); } catch {} }); })
  .listen(PORT, () => console.log("Spark server running on http://localhost:" + PORT));
