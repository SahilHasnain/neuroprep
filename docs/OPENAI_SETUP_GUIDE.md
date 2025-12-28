# OpenAI Migration - Quick Setup Guide

## 🚀 Immediate Action Required

Your backend code has been successfully migrated from Gemini to OpenAI. To make it work, you need to:

### 1. Get OpenAI API Key

1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Name it: "NeuroprepBackend" (or any name)
5. Copy the key (starts with `sk-...`)

### 2. Add Environment Variable

**In Appwrite Console:**

1. Go to your Appwrite Console
2. Navigate to **Functions**
3. For **EACH** of these three functions:
   - `askDoubt`
   - `generate-questions`
   - `notes`
4. Go to **Settings** → **Environment Variables**
5. Add new variable:
   ```
   Key: OPENAI_API_KEY
   Value: sk-your-key-here
   ```

### 3. Deploy Functions

You need to redeploy all three functions with the updated code:

```bash
# Using Appwrite CLI
cd neuroprep-backend

# Deploy each function
appwrite deploy function askDoubt
appwrite deploy function generate-questions
appwrite deploy function notes
```

Or manually:

1. Zip each function folder
2. Upload via Appwrite Console
3. Wait for deployment to complete

---

## 📋 Environment Variables Checklist

Each function should have these environment variables:

### Common Variables (all 3 functions)

- ✅ `OPENAI_API_KEY` ← **NEW** (Add this)
- ✅ `APPWRITE_ENDPOINT`
- ✅ `APPWRITE_PROJECT_ID`
- ✅ `APPWRITE_DATABASE_ID`
- ✅ `APPWRITE_SECRET_KEY`

### Function-Specific Variables

**askDoubt:**

- ✅ `APPWRITE_DOUBTS_TABLE_ID`
- ✅ `APPWRITE_DOUBT_HISTORY_TABLE_ID`

**generate-questions:**

- ✅ `APPWRITE_QUESTIONS_TABLE_ID`

**notes:**

- ✅ `APPWRITE_NOTES_TABLE_ID`

---

## 🧪 Testing After Deployment

### 1. Test Ask Doubt

Open your app → Ask Doubt tab → Ask any question:

```
"Explain Newton's first law in simple terms"
```

Expected: Hinglish explanation with proper formatting

### 2. Test Generate Questions

Open your app → Generate Questions tab:

```
Subject: Physics
Topic: Mechanics
Difficulty: Easy
Count: 5
```

Expected: 5 MCQ questions with 4 options each

### 3. Test Notes

Open your app → Notes tab:

```
Subject: Biology
Topic: Cell Structure
Length: Brief
```

Expected: Structured notes with markdown formatting

---

## ⚠️ Common Issues

### Issue 1: "API key not found"

**Solution:** Add `OPENAI_API_KEY` environment variable in ALL three functions

### Issue 2: "Function deployment failed"

**Solution:**

- Check function logs in Appwrite Console
- Ensure `openai` package is in `package.json` (already added)
- Verify Node 18 runtime

### Issue 3: "Response is empty"

**Solution:**

- Check OpenAI API dashboard for errors
- Verify API key has credits/quota
- Check function execution logs

### Issue 4: "Invalid JSON response"

**Solution:**

- The new strict schema should prevent this
- If it occurs, check function logs for OpenAI error messages

---

## 💰 Cost Considerations

### OpenAI Pricing (GPT-4o-mini)

- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

### Estimated Costs per Request

- **Ask Doubt:** ~$0.001-0.003 per request
- **Questions (5):** ~$0.002-0.004 per request
- **Notes (Brief):** ~$0.002-0.005 per request

### Free Tier

- OpenAI offers $5 free credits for new accounts
- Approximately 1,500-5,000 requests depending on complexity

---

## 🔄 Rollback (If Needed)

If you encounter issues and need to rollback to Gemini:

1. **Keep `GEMINI_API_KEY` in environment variables** (don't delete it)
2. **Revert code changes:**
   ```bash
   git revert <commit-hash>
   ```
3. **Redeploy functions**

The migration doc includes detailed rollback instructions.

---

## ✅ Verification

After deploying, verify each function works:

```bash
# Check function logs
appwrite functions logs --functionId askDoubt --limit 10
appwrite functions logs --functionId generate-questions --limit 10
appwrite functions logs --functionId notes --limit 10
```

Look for:

- ✅ "Calling OpenAI API..."
- ✅ "OpenAI response status: success"
- ❌ Any error messages

---

## 📞 Support

If you encounter issues:

1. **Check Logs:** Appwrite Console → Functions → Logs
2. **Verify API Key:** OpenAI Dashboard → Usage
3. **Test Locally:** Run functions locally with test data
4. **Check Network:** Ensure Appwrite can reach OpenAI API

---

## 🎯 Summary

**What Changed:**

- ✅ AI provider: Gemini → OpenAI
- ✅ Model: gemini-2.5-flash-lite → gpt-4o-mini
- ✅ New file: `shared/openai.js`
- ✅ Updated: All 3 `ai.js` files + index files

**What Didn't Change:**

- ❌ Frontend code
- ❌ Database schema
- ❌ API endpoints
- ❌ Response structures (maintained compatibility)
- ❌ Prompts and instructions

**Next Step:** Add `OPENAI_API_KEY` to all three functions and deploy!

---

**Status:** Ready to Deploy ✨  
**Risk:** Low (backward compatible)  
**Time to Deploy:** ~5 minutes
