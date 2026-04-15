const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testGeminiDetailed() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  console.log(`Testing Model: ${model}`);
  console.log(`URL: ${url.replace(apiKey, 'REDACTED')}`);

  try {
    const response = await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log('Success! Response received.');
    console.log('Reply:', response.data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    
    if (err.response?.status === 404) {
      console.log('Attempting fallback to gemini-1.5-flash-latest...');
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      try {
        const fallbackRes = await axios.post(fallbackUrl, {
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });
        console.log('Fallback SUCCESS with gemini-1.5-flash-latest!');
      } catch (fallbackErr) {
        console.log('Fallback also FAILED:', fallbackErr.response?.status);
      }
    }
  }
}

testGeminiDetailed();
