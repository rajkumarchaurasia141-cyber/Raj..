const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

async function run() {
  console.log("Calling generateContent via native fetch with ?key= query parameter...");
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello! Tell me in one sentence what photosynthesis is in Hindi."
              }
            ]
          }
        ]
      })
    });

    console.log("Response status:", response.status, response.statusText);
    const data: any = await response.json();
    if (!response.ok) {
      console.error("❌ API Error:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("Response text:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err: any) {
    console.error("❌ Network Error:", err);
  }
}

run();
