import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  vertexai: true,
  project: "gen-lang-client-0482021639",
  location: "us-central1"
});

async function run() {
  console.log("Calling generateContent on Vertex AI...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
    });

    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("❌ Error in Vertex AI:", err);
  }
}

run();
