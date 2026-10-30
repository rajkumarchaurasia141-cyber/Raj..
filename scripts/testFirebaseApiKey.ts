import { GoogleGenAI } from "@google/genai";

// Use the Firebase API Key starting with AIzaSy...
const apiKey = "AIzaSyDk9Li2rgKNng10UkwC3d-ICnez5ORAbd0";

const ai = new GoogleGenAI({ apiKey });

async function run() {
  console.log("Calling generateContent with Firebase API Key...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
    });

    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("❌ Error with Firebase API Key:", err.message);
  }
}

run();
