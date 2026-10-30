import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  vertexai: true,
  project: "gen-lang-client-0482021639",
  location: "us-central1"
});

async function run() {
  console.log("Calling generateContent on Vertex AI with automatic credentials...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
    });

    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("❌ Error in Vertex AI Auto:", err);
  }
}

run();
