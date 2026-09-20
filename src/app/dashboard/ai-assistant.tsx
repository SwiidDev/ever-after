"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(question?: string) {
    const content = (question ?? input).trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const json = await res.json();
      if (json.reply) {
        setMessages([...next, { role: "assistant", content: json.reply }]);
      } else {
        setError(
          json.error === "AI not configured"
            ? "The AI assistant is not configured yet."
            : "Something went wrong — try again.",
        );
        setMessages(next);
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-full border border-pink-300 bg-pink-50 px-4 py-3 text-left text-sm text-pink-700 hover:bg-pink-100"
      >
        💬 How do you plan your wedding? Ask our assistant…
      </button>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-pink-200 bg-pink-50/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-pink-700">
          Wedding assistant
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-neutral-400 hover:text-neutral-600"
        >
          close
        </button>
      </div>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-pink-600 text-white" : "bg-white"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="max-w-[85%] rounded-2xl bg-white px-3 py-2 text-sm text-neutral-400">
            thinking…
          </div>
        )}
        {messages.length === 0 && !busy && (
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              "How do I split a R150,000 budget?",
              "What should I book first?",
              "How far in advance should I book a venue?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-pink-200 bg-white px-3 py-1.5 hover:border-pink-400"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about planning…"
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
