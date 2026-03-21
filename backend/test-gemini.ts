import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "none");
  
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        system_instruction: { parts: [{ text: "You are a helpful assistant" }] },
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      }
    );
    console.log("Success:", res.data.candidates[0].content);
  } catch (error: any) {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

test();
