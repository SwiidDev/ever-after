/** E2E: signed-in couple asks the assistant a real question via the API route. */
import fs from "fs";
import crypto from "crypto";

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

const s = {
  uid: "test",
  email: "jane@test.local",
  role: "COUPLE",
  coupleId: "cmu9rv2at0002ueknglunyegb",
};
const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
const sig = crypto
  .createHmac("sha256", env.AUTH_SECRET)
  .update(payload)
  .digest("base64url");
const cookie = `weddo_session=${payload}.${sig}`;

const res = await fetch("http://localhost:3000/api/ai/assistant", {
  method: "POST",
  headers: { "content-type": "application/json", cookie },
  body: JSON.stringify({
    messages: [
      {
        role: "user",
        content: "How should I split a R150,000 wedding budget in Pretoria? Keep it short.",
      },
    ],
  }),
});
console.log("status:", res.status);
const json = await res.json();
console.log("reply:", (json.reply ?? JSON.stringify(json)).slice(0, 700));
