/** Probe which free model IDs are accepted by the Nous inference endpoint. */
import fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env","utf8").split("\n")
    .filter(l=>l.includes("="))
    .map(l=>{const i=l.indexOf("="); return [l.slice(0,i), l.slice(i+1).replaceAll('"',"")]}));
const base = env.AI_BASE_URL, key = env.AI_API_KEY;
const models = process.argv.slice(2);
for (const m of models) {
  try {
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {"content-type":"application/json", authorization: `Bearer ${key}`},
      body: JSON.stringify({
        model: m,
        messages: [{role: "user", content: "say ready"}],
        max_tokens: 8,
      }),
    });
    const text = await r.text();
    console.log(r.status, m, "|", text.slice(0, 200).replaceAll("\n"," "));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log("ERR", m, msg);
  }
}
