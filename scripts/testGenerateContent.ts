import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

// Initialize with standard GoogleGenAI
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function run() {
  console.log("Calling standard generateContent...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
    });

    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("❌ Error in generateContent:", err.message);
  }
}

run();
