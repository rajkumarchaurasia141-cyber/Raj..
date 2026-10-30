import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function run() {
  console.log("Calling interactions.create using @google/genai SDK...");
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
    });

    console.log("Interaction succeeded!");
    console.log("Text output:", interaction.output_text);
  } catch (err: any) {
    console.error("❌ Error in SDK interactions.create:", err);
  }
}

run();
