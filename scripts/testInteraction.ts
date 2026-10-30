const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

async function run() {
  console.log("Calling Interactions API via native fetch...");
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${geminiApiKey}`
      },
      body: JSON.stringify({
        model: "gemini-3.8-flash",
        input: "Hello, list 2 elements of science in JSON.",
        response_format: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              element: { type: "STRING" },
              symbol: { type: "STRING" }
            },
            required: ["element", "symbol"]
          }
        }
      })
    });

    console.log("Response status:", response.status, response.statusText);
    const data: any = await response.json();
    if (!response.ok) {
      console.error("❌ API Error:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("Interaction response ID:", data.id);
    let text = "";
    for (const step of data.steps || []) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          text += textContent.text;
        }
      }
    }
    console.log("Extracted text:", text);
  } catch (err: any) {
    console.error("❌ Network Error:", err);
  }
}

run();
