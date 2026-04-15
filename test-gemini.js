const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key:', apiKey ? 'FOUND' : 'MISSING');
  
  const endpoints = [
    'https://generativelanguage.googleapis.com/v1/models',
    'https://generativelanguage.googleapis.com/v1beta/models'
  ];

  for (const url of endpoints) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await axios.get(`${url}?key=${apiKey}`);
      console.log(`Success! Models found:`, response.data.models.map(m => m.name.split('/').pop()).join(', '));
    } catch (err) {
      console.log(`Error on ${url}:`, err.response?.status, err.response?.data || err.message);
    }
  }
}

testGemini();
