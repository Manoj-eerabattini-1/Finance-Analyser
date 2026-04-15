import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

async function testModel(model) {
  const apiKey = process.env.GEMINI_API_KEY;
  let result = `Testing ${model}: `;
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      }
    );
    result += `SUCCESS (${res.status})\n`;
  } catch (error) {
    if (error.response) {
      result += `FAILED (${error.response.status}) - ${JSON.stringify(error.response.data.error || error.response.data)}\n`;
    } else {
      result += `NETWORK ERROR: ${error.message}\n`;
    }
  }
  return result;
}

async function runTests() {
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-2.5-flash" // Testing what the user remembered
  ];
  
  let report = "Gemini API Test Report\n======================\n";
  for (const model of models) {
    report += await testModel(model);
  }
 fs.writeFileSync("gemini-test-results.log", report);
 console.log("Report generated in gemini-test-results.log");
}

runTests();
