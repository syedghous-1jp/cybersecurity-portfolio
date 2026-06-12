import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// OpenAI setup
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/chat.html");
});

// Chat API route
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "No message received" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: userMessage }
      ],
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ reply: "Error: " + error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
