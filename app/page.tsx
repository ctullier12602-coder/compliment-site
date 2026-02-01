"use client";

import React, { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hi baby 😊 Message me and I’ll reply with a compliment. I miss you" },
  ]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Fixes never[] inference
  const [recentCompliments, setRecentCompliments] = useState<string[]>([]);

  // ✅ Fixes scrollIntoView on never
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (loading) return;

    const userText = text.trim();
    if (!userText) return;

    setText("");
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/compliment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          recent: recentCompliments,
        }),
      });

      const data: { reply: string; usedCompliment?: string } = await res.json();

      setMessages((m) => [...m, { role: "bot", text: data.reply }]);

      if (data.usedCompliment) {
        setRecentCompliments((prev) => [...prev, data.usedCompliment!].slice(-8));
      }
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Oops — something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter makes a newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(); // we already added the message, just send
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>Compliment Bot 💬</h1>
            <p style={styles.sub}>Every message gets a sweet compliment + a helpful reply.</p>
          </div>
        </header>

        <section style={styles.chat}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.row,
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: m.role === "user" ? "#7d1a1a" : "#98c0eb",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.row, justifyContent: "flex-start" }}>
              <div style={{ ...styles.bubble, opacity: 0.7 }}>Typing…</div>
            </div>
          )}

          <div ref={endRef} />
        </section>

        <form onSubmit={sendMessage} style={styles.form}>
          <textarea
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            style={styles.input}
            rows={2}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "…" : "Send"}
          </button>
        </form>

        <footer style={styles.footer}>
          <small style={{ opacity: 0.7 }}>Tip: Press Enter to send, Shift+Enter for a new line.</small>
        </footer>
      </div>
    </main>
  );
}

// ✅ Strongly type styles so overflowY/resize match React’s allowed union types
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    backgroundColor: "#add8e6",
  },
  card: {
    width: "min(820px, 100%)",
    border: "1px solid #2321c4",
    borderRadius: 16,
    backgroundColor: "#080839",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  header: {
    padding: "18px 18px 10px",
    borderBottom: "1px solid #b05555",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  h1: { margin: 0, fontSize: 22 },
  sub: { margin: "6px 0 0", fontSize: 13, color: "#e6dbdb" },
  chat: {
    height: 460,
    overflowY: "auto", // ✅ OK now
    padding: 16,
    backgroundColor: "#486fd9",
  },
  row: { display: "flex", margin: "10px 0" },
  bubble: {
    maxWidth: "78%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid #b12f2f",
    whiteSpace: "pre-wrap",
    lineHeight: 1.35,
    fontSize: 14,
  },
  form: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderTop: "1px solid #de1212",
    alignItems: "flex-end",
    backgroundColor: "#aad3f4",
  },
  input: {
    flex: 1,
    resize: "none", // ✅ OK now
    borderRadius: 12,
    border: "1px solid #8f1919",
    padding: 10,
    fontSize: 14,
    outline: "none",
  },
  button: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #7d2424",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  footer: { padding: "0 12px 12px", backgroundColor: "black" },
};
