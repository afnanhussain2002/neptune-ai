import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";

// In-memory chat history store: { [chatId]: { id, title, messages[], createdAt } }
const chatStore = {};

// Last known rate limit info (populated after first API call)
let rateLimitInfo = null;

// ─── Helper ───────────────────────────────────────────────────────────────────
function getClient() {
  if (!token) throw new Error("GITHUB_TOKEN is not set in environment.");
  return ModelClient(endpoint, new AzureKeyCredential(token));
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model });
});

// Get all chats (sidebar list)
app.get("/api/chats", (req, res) => {
  const chats = Object.values(chatStore)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(({ id, title, createdAt }) => ({ id, title, createdAt }));
  res.json(chats);
});

// Get single chat with messages
app.get("/api/chats/:chatId", (req, res) => {
  const chat = chatStore[req.params.chatId];
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  res.json(chat);
});

// Rate limit info
app.get("/api/rate-limit", (req, res) => {
  if (!rateLimitInfo) {
    return res.json({ available: false, message: "Send a message first to load rate limit data." });
  }
  res.json({ available: true, ...rateLimitInfo });
});

// Delete a chat
app.delete("/api/chats/:chatId", (req, res) => {
  const { chatId } = req.params;
  if (!chatStore[chatId]) return res.status(404).json({ error: "Chat not found" });
  delete chatStore[chatId];
  res.json({ success: true });
});

// Send message — creates new chat or continues existing one
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatId, systemPrompt } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const client = getClient();

    // Resolve or create chat
    let chat;
    if (chatId && chatStore[chatId]) {
      chat = chatStore[chatId];
    } else {
      const newId = uuidv4();
      chat = {
        id: newId,
        title: message.slice(0, 50) + (message.length > 50 ? "…" : ""),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      chatStore[newId] = chat;
    }

    // Build messages array for the API
    const systemMessage = systemPrompt
      ? { role: "system", content: systemPrompt }
      : { role: "system", content: `Your Name is Neptune.You are a critical thinking assistant named Neptune. When asked your name, you always say: 'My name is Neptune'. Before giving any answer, you must 
follow these two steps in order:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — ASK FOLLOW-UP QUESTIONS FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before answering, ask 1-3 clarifying questions to understand:
- What exactly I want to know
- My context or background on the topic
- What I'll use the answer for

Do NOT answer yet. Wait for my response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — FACT-CHECK THEN ANSWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After I reply, evaluate any claims I made:

- CORRECT claim → Confirm briefly, then continue
- WRONG claim → Say so clearly, explain why, give correct info
- DISPUTED topic → Present both sides fairly
- OPINION stated as fact → Flag it as opinion

Never agree just to be polite. Prioritize truth over comfort.
Use phrases like:
  "Actually, that's not quite right..."
  "That's correct, and here's why..."
  "This is debated — here are both sides..."
  "That's an opinion, not a proven fact..."

If I push back on your correction, don't cave — stand by 
the facts unless I provide actual new evidence.

Your follow-up questions should be smart and specific — 
not generic like "can you tell me more?" Ask targeted 
questions that will actually change how you answer.
` };

    const apiMessages = [
      systemMessage,
      ...chat.messages,
      { role: "user", content: message },
    ];

    // Call GitHub Models API
    const response = await client.path("/chat/completions").post({
      body: {
        messages: apiMessages,
        model,
      },
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || "Unexpected API error");
    }

    const assistantContent = response.body.choices[0].message.content;

    // Capture rate limit headers
    const h = response.headers;
    rateLimitInfo = {
      limitRequests:     h["x-ratelimit-limit-requests"]     ?? null,
      remainingRequests: h["x-ratelimit-remaining-requests"] ?? null,
      limitTokens:       h["x-ratelimit-limit-tokens"]       ?? null,
      remainingTokens:   h["x-ratelimit-remaining-tokens"]   ?? null,
      resetRequests:     h["x-ratelimit-reset-requests"]     ?? null,
      resetTokens:       h["x-ratelimit-reset-tokens"]       ?? null,
    };

    // Save to history
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: assistantContent });

    res.json({
      chatId: chat.id,
      reply: assistantContent,
      title: chat.title,
      rateLimit: rateLimitInfo,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Model: ${model}`);
  console.log(`   Token: ${token ? "✅ Loaded" : "❌ Missing (set GITHUB_TOKEN)"}\n`);
});