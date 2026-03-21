import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  let logOutput = "Using API Key: " + (apiKey ? apiKey.substring(0, 10) + "..." : "none") + "\n";
  
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      }
    );
    logOutput += "Success: " + res.status + "\n";
  } catch (error) {
    if (error.response) {
      logOutput += "HTTP Error: " + error.response.status + "\n";
      logOutput += "DATA: " + JSON.stringify(error.response.data, null, 2) + "\n";
      logOutput += "URL: " + error.config.url + "\n";
    } else {
      logOutput += "Network Error: " + error.message + "\n";
    }
  }
  fs.writeFileSync("debug.log", logOutput);
}
test();
