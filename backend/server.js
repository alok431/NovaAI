const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Database Model (we'll create this next if it doesn't exist, but we just did!)
const Message = require('./models/Message');

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Database'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.log('⚠️ No MONGO_URI found in .env. Running without database connection.');
}


// Initialize OpenAI SDK to connect to Groq
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running correctly', timestamp: new Date() });
});

// Chat Route: Handles messages from the frontend and sends them to the AI
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    console.log(`[Backend API] Received message from frontend: "${message}"`);
    
    // -------------------------------------------------------------
    // OpenAI Integration
    // -------------------------------------------------------------
    
    // Check if the API key is set up
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.json({ reply: "OpenAI is connected! But you need to paste your actual API Key into the backend/.env file." });
    }

    // -------------------------------------------------------------
    // Chat Memory & Database Logic
    // -------------------------------------------------------------
    let history = [];
    
    // If MongoDB is connected, fetch the last 10 messages for context
    if (mongoose.connection.readyState === 1) {
      const pastMessages = await Message.find().sort({ timestamp: 1 }).limit(10);
      history = pastMessages.map(msg => ({ role: msg.role, content: msg.content }));
    }

    // Build the message payload with system prompt, history, and the new message
    const aiMessages = [
      { role: "system", content: "You are Nova, an enterprise GenAI assistant deployed by Kore.ai. You help streamline enterprise operations. Keep responses concise and professional." },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Active Groq model
      messages: aiMessages
    });
    
    const reply = completion.choices[0].message.content;
    
    // Save the conversation to the database
    if (mongoose.connection.readyState === 1) {
      await Message.create({ role: 'user', content: message });
      await Message.create({ role: 'assistant', content: reply });
    }
    
    res.json({ reply });
  } catch (error) {
    console.error("Error communicating with AI service:", error);
    res.status(500).json({ error: "Failed to process message." });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Enterprise Backend is Running`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`=========================================`);
});
