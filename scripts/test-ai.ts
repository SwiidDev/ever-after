/** One-off: test the Nous endpoint with the configured AI_* env values. */
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replaceAll('"', "")];
    }),
);

const base = env.AI_BASE_URL;
const key = env.AI_API_KEY;
const model = env.AI_MODEL;
console.log("base:", base, "model:", model, "key set:", Boolean(key));

const res = await fetch(`${base}/chat/completions`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "Say 'ready' and nothing else." }],
    max_tokens: 10,
  }),
});
console.log("status:", res.status);
const text = await res.text();
console.log("body:", text.slice(0, 400));
