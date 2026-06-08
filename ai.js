require("dotenv").config();
const axios = require("axios");

async function askAI(text, model, username = "friend", imageBase64 = null) {
  try {
    const content = imageBase64
      ? [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: "text", text: text || "What is in this image?" }
        ]
      : [{ type: "text", text }];

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: imageBase64 ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile",
        max_tokens: 500,
        messages: [
          { role: "system", content: `You are CYBERLORD AI. The user's name is ${username}. Be helpful and concise.` },
          { role: "user", content }
        ]
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq error:", err?.response?.data || err.message);
    return "❌ AI is offline right now. Try again later.";
  }
}

module.exports = askAI;
