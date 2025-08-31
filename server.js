import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.type("text").send("OK"));
app.get("/health", (_req, res) => res.json({ ok: true }));

function smartFallback(text = "") {
  const t = (text||"").toLowerCase().trim();
  if (/^(hi|hello|hey)\b/.test(t)) return "Hi! Kaise ho? 😊";
  if (/how are you|kya haal/.test(t)) return "Main theek hoon! Tum kaise ho?";
  if (/sorry|maaf/.test(t)) return "Short & sincere apology works best.";
  if (/breakup|toot/.test(t)) return "Take care of yourself, talk to a friend, and be gentle with emotions.";
  if (/reply|message/.test(t)) return 'Try: "Thanks — I’ll call you when free 😊"';
  return "Thoda aur batao, fir main better help kar paunga 💖";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    let reply;
    if (process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a warm, concise love & relationship assistant. Use brief Hinglish-friendly replies." },
            { role: "user", content: message }
          ],
          temperature: 0.6,
          max_tokens: 220
        }),
      });

      const data = await r.json();
      if (!r.ok) {
        console.error("OpenAI error:", data);
        reply = smartFallback(message);
      } else {
        reply = data?.choices?.[0]?.message?.content?.trim() || smartFallback(message);
      }
    } else {
      reply = smartFallback(message);
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/forward", async (req, res) => {
  try {
    await fetch("https://formspree.io/f/xblkbnnq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.json({ success: true });
  } catch (err) {
    console.error("forward error", err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => console.log("Server listening on", PORT));
