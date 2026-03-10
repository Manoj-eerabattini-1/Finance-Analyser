# Gemini API Quick Setup Guide

This short guide shows you exactly how to set up Google's Gemini AI for your Money Mentor application.

---

## What is Gemini?

Gemini is Google's AI (like ChatGPT but by Google). In Money Mentor, it helps interpret your financial goals written in natural language.

**Examples:**
- You type: "Save ₹5,00,000 for a car in 18 months"
- Gemini understands: You want a car, need 18 months, target is ₹5,00,000
- Gemini suggests: "Save ₹27,778 per month", "Consider insurance costs", etc.

---

## Step 1: Get Your Gemini API Key

### Method 1: Quick (Recommended)

1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Look for a button that says **"Create API Key"** or **"Get API Key"**
4. Click it
5. You'll see something like: `AIzaSyD1234567890abcdefghijk`
6. Click **"Copy"** button
7. Keep it in a text editor for now

### Method 2: Detailed Steps

If Method 1 doesn't work:

1. Go to: https://console.cloud.google.com/
2. Sign in with Google
3. Create a new project:
   - Click project dropdown at top
   - Click "New Project"
   - Name: "Money Mentor"
   - Click "Create"
4. Enable Generative AI API:
   - Search for "Generative Language API"
   - Click it
   - Click "Enable"
5. Create API Key:
   - Go to "Credentials" in left menu
   - Click "Create Credentials"
   - Choose "API Key"
   - Copy the key

---

## Step 2: Add Key to Your Project

### On Windows:

1. Open explorer
2. Go to: `C:\Users\reera\Desktop\Manoj files\Finance-Analyser\my-money-mentor\backend`
3. Look for **.env** file (if not there, create it)
4. Open with Notepad
5. Find or add this line:
   ```
   GEMINI_API_KEY=
   ```
6. Paste your key:
   ```
   GEMINI_API_KEY=AIzaSyD1234567890abcdefghijk
   ```
7. Save (Ctrl+S)

### On Mac/Linux:

```bash
cd ~/Desktop/"Manoj files"/Finance-Analyser/my-money-mentor/backend

# Open in text editor (nano)
nano .env

# Or use vim
vim .env
```

Find the line with `GEMINI_API_KEY=` and add your key.

---

## Step 3: Verify It Works

### Method 1: Check Backend Logs

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Look for messages like:
   ```
   Server running on port 5000
   MongoDB connected: localhost
   ```
   (If you see errors about GEMINI_API_KEY, the key wasn't found)

### Method 2: Test with a Goal

1. Start the app
2. Log in
3. Go to Goals page
4. Type: "I want to save 1 lakh for a laptop in 6 months"
5. Click "Set Goal"
6. Wait 5-10 seconds
7. If you see AI suggestions, **it works!** ✅

---

## Troubleshooting

### Problem: "GEMINI_API_KEY not configured"

**Solution:**
1. Check `.env` file exists in `backend/` folder
2. Check the line: `GEMINI_API_KEY=YOUR_KEY_HERE`
3. Restart the backend server (stop and run `npm run dev` again)

### Problem: "Invalid API key"

**Solution:**
1. Your key might be expired or incorrect
2. Go back to https://makersuite.google.com/app/apikey
3. Delete the old key
4. Create a new API key
5. Update `.env` file with new key
6. Restart backend

### Problem: "Rate limit exceeded"

**This means you've made too many API requests**

Solution:
1. Wait a few minutes
2. Try again
3. The free tier has limits (usually 60 requests per minute)

### Problem: Timeout when creating goal

**Gemini API is slow (5-10 seconds is normal)**

Solution:
1. Wait up to 10 seconds
2. If still not working after 20 seconds, check:
   - Internet connection
   - API key is correct
   - Backend is running

---

## How Gemini Works in the App

```
You type goal text
      ↓
Frontend sends to backend
      ↓
Backend sends to Gemini API
      ↓
Gemini AI processes
      ↓
Gemini responds with structured data
      ↓
Backend processes response
      ↓
Backend sends suggestions back
      ↓
You see AI suggestions!
```

---

## Environment Variables Explained

```bash
# In backend/.env:

# Your Gemini API key
GEMINI_API_KEY=AIzaSyD...

# Fallback (if you have OpenAI key too)
OPENAI_API_KEY=sk-proj-...

# If neither configured, system falls back to regex parsing
# (Less accurate but works without API)
```

---

## What Gemini Can Do

✅ **Parse natural language:**
- "Save 500k for car" → understands you want ₹500,000

✅ **Extract timeline:**
- "in 18 months" → extracts 18 months

✅ **Categorize goals:**
- "car" → recognizes category as "Automobile"

✅ **Generate suggestions:**
- Proposes monthly savings targets
- Suggests related considerations

❌ **What it can't do:**
- Can't actually charge your account
- Can't read your transaction history (that's local)
- Can't access real-time market data

---

## API Usage & Costs

**Good news:** Gemini has a **free tier**!

- **Free:** 60 requests per minute
- **After that:** Can upgrade to paid plan
- **Typical usage:** 1-2 requests per goal creation

For personal use, free tier is more than enough.

---

## Security Tips

⚠️ **IMPORTANT:**

1. **Never share your API key**
   - Don't commit `.env` file to GitHub
   - Don't paste key in chat/email
   - Only you should see it

2. **`.env` is in .gitignore**
   - Look for `.env` in `.gitignore` file
   - Should already be there (not tracked by git)

3. **Change key if compromised**
   - If someone sees your key, delete it immediately
   - Create new key at makersuite.google.com
   - Update `.env` file

---

## Monitoring API Usage

To see how many requests you've made:

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Quotas"
4. Look for "Generative Language API"
5. See your usage

---

## If You Still Have Issues

Try this checklist:

- [ ] Do you have a Gemini API key?
- [ ] Is it pasted in `backend/.env`?
- [ ] Does `.env` line say `GEMINI_API_KEY=AIzaSy...`?
- [ ] Have you restarted the backend?
- [ ] Is backend showing "Server running on port 5000"?
- [ ] Can you log in to the app?
- [ ] Are you on Goals page?
- [ ] Did you wait 10 seconds after clicking "Set Goal"?

If all checked, it should work! 🎉

---

## What Happens Without Gemini?

If Gemini is not configured:

1. Goals still get created
2. But AI suggestions won't appear
3. System uses rule-based parsing instead
4. Less accurate but still functional

To enable Gemini, just add the key to `.env` and restart!

---

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Add to `backend/.env`
3. ✅ Restart backend
4. ✅ Create a goal and see AI suggestions
5. ✅ Celebrate! 🎉

You're all set!
