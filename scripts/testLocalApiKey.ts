import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const apiKey = config.apiKey;

console.log("Initializing Gemini with API Key from firebase-applet-config.json:", apiKey.substring(0, 8) + "...");
const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
    });

    console.log("✅ SUCCESS! Response text:", response.text);
  } catch (err: any) {
    console.error("❌ Error with config API Key:", err.message || err);
  }
}

run();
