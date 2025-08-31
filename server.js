import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

// ✅ Your real API key (make sure it's in Render env vars)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route for testing
app.get("/", (req, res) => {
  res.send("Cosmic Love Chat Backend is running 💖");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    if (!userMessage.trim()) {
      return res.json({ reply: "Please write something, my dear 💌" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ✅ lightweight + smart
      messages: [
        {
          role: "system",
          content: `You are "Cosmic Love Assistant" 💖 — 
          a friendly AI that helps users with relationship advice, 
          romantic message suggestions, and love guidance.
          - Keep answers SHORT (1–3 lines).
          - Always be polite, warm, and supportive.
          - If user pastes a chat/message from their partner, 
            suggest a caring reply they can send back.
          - If greeting (hi, hello), respond with a sweet greeting back.
          - Never give robotic answers, always sound like a close friend.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.8, // more natural
      max_tokens: 120,
    });

    const aiReply =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn’t think of a reply right now 💕";

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({
      reply:
        "Oops 💔! I'm having trouble connecting right now. Try again in a moment.",
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Cosmic Love backend running on port ${port}`);
});
