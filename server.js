const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 CORS для всех устройств
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// 📁 Папка с публичными файлами
app.use(express.static(path.join(__dirname, 'public')));

// 🌐 Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// 💬 Обработка чата
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.PUBLIC_URL || "http://localhost:3000",
        "X-Title": "ISHAREAI Chat"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are Bill Petruck, founder of FUNDING matters. You have 25+ years of experience in fundraising, planning, and strategic development. Answer like a real human advisor — clear, thoughtful, supportive, and insightful. Keep responses short and under 3 sentences."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 250 // ← Ограничение длины ответа
      })
    });

    const data = await response.json();
    console.log("✅ Ответ от OpenRouter:\n", JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content || "🤖 Sorry, I couldn't generate a response.";
    res.json({ reply });

  } catch (error) {
    console.error("❌ Ошибка при обращении к OpenRouter:", error);
    res.status(500).json({ reply: "❌ Error contacting AI." });
  }
});

// 🚀 Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
