console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log("GEMINI_API_KEY prefix:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
}
