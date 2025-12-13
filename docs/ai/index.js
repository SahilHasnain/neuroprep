// Appwrite Cloud Function (Node.js) - Ask Doubt
// Handles input validation, subject/topic inference, Gemini call, and persistence

import sdk from 'node-appwrite';
import { fetch } from 'undici';

/**
 * Simple heuristic inference for subject/topic/difficulty
 * This is MVP-grade and can be replaced with proper model later.
 */
function inferMetadata(text) {
    const t = text.toLowerCase();
    const isNeet = /biology|botany|zoology|cell|dna|physiology|genetics|ecology|photosynthesis|neuron/.test(t);
    const isJeePhy = /physics|newton|force|momentum|electric|magnetic|optics|thermo|quantum|kinematics|current/.test(t);
    const isJeeChem = /chemistry|organic|inorganic|stoichiometry|acid|base|salt|reaction|bond|periodic/.test(t);
    const isJeeMath = /math|integration|derivative|limits|probability|matrix|vector|algebra|geometry|trigonometry/.test(t);

    let subject = 'General';
    if (isNeet) subject = 'Biology';
    else if (isJeePhy) subject = 'Physics';
    else if (isJeeChem) subject = 'Chemistry';
    else if (isJeeMath) subject = 'Mathematics';

    // Basic topic extraction: take a keyword window
    const topicMatch = (t.match(/([a-z]+){1,}/g) || []).slice(0, 3).join(' ');

    // Difficulty by length + keywords
    const lengthScore = Math.min(3, Math.ceil(text.length / 120));
    const keywordScore = /(prove|derive|why|explain|mechanism|theorem)/.test(t) ? 2 : 1;
    const total = lengthScore + keywordScore;
    const inferredDifficulty = total >= 4 ? 'Hard' : total >= 3 ? 'Medium' : 'Easy';

    return { subject, topic: topicMatch || 'General Topic', inferredDifficulty };
}

/**
 * Build exam-focused Gemini prompt
 */
function buildGeminiPrompt({ doubtText }) {
    return `
Tum ek expert NEET/JEE tutor ho.
Tumhara kaam sirf answer dena nahi, balki student ko concept samjhaana hai
taaki exam me wo khud soch sake.

Student ka doubt:
"${doubtText}"

Instruction (bahut important):
- Explanation hamesha Roman Urdu me dena (English ya Hindi words avoid karna).
- Tone calm, supportive aur confident ho — pressure create mat karna.
- Assume karo student thoda confused hai, lekin dumb nahi.
- Step-by-step samjhao, har step ka reason clear karo.
- Direct exam-relevant baat karo, extra theory ya textbook lecture mat dena.
- Agar formula use ho raha hai:
  - pehle batao formula kyun aaya
  - phir short derivation
  - phir exam me kaise use hota hai
- Agar concept tricky hai, to ek simple intuition line zaroor do.
- Answer ko chhote clear sections me likho (paragraph ya bullets).
- End me ek short "Revision Tip" do jo exam yaad rakhne me help kare.

Goal:
Student ko lagna chahiye:
"Ab ye cheez mere dimaag me baith gayi hai, aur exam me ghabrahat nahi hogi."
`;
}


async function callGemini(apiKey, prompt) {
    // Gemini 2.5 Flash via Generative Language API
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const res = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1024,
            },
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    // Extract text safely
    const candidates = data?.candidates || [];
    const text = candidates[0]?.content?.parts?.[0]?.text || 'No response';
    return text;
}

/**
 * Appwrite Function entrypoint
 * @param {object} req - Request from Appwrite
 * @param {object} res - Response handler
 */
export default async ({ req, res, log, error }) => {
    try {
        if (req.method !== 'POST') {
            return res.json({ success: false, message: 'Only POST allowed' }, 405);
        }

        const payload = req.body ? JSON.parse(req.body) : {};
        const userId = payload?.userId;
        const doubtText = (payload?.doubtText || '').trim();

        if (!userId || !doubtText) {
            return res.json({ success: false, message: 'Missing userId or doubtText' }, 400);
        }

        // Env vars
        const {
            APPWRITE_ENDPOINT,
            APPWRITE_PROJECT_ID,
            APPWRITE_API_KEY,
            APPWRITE_DATABASE_ID,
            GEMINI_API_KEY,
        } = req.env;

        if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY || !APPWRITE_DATABASE_ID || !GEMINI_API_KEY) {
            return res.json({ success: false, message: 'Missing environment configuration' }, 500);
        }

        // Appwrite SDK setup
        const client = new sdk.Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)
            .setKey(APPWRITE_API_KEY);

        const databases = new sdk.Databases(client);

        // Infer subject/topic/difficulty
        const meta = inferMetadata(doubtText);

        // Save doubt
        const doubtDoc = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            'doubts',
            sdk.ID.unique(),
            {
                userId,
                text: doubtText,
                subject: meta.subject,
                topic: meta.topic,
                inferredDifficulty: meta.inferredDifficulty,
                createdAt: new Date().toISOString(),
            }
        );

        // Build prompt and call Gemini
        const prompt = buildGeminiPrompt({ subject: meta.subject, topic: meta.topic, doubtText });
        const responseText = await callGemini(GEMINI_API_KEY, prompt);

        // Save AI response
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            'ai_responses',
            sdk.ID.unique(),
            {
                doubtId: doubtDoc.$id,
                responseText,
                explanationStyle: 'step-by-step',
                responseLength: Math.max(1, responseText.length),
                createdAt: new Date().toISOString(),
            }
        );

        // Bonus: log user event
        try {
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                'user_events',
                sdk.ID.unique(),
                {
                    userId,
                    eventType: 'ASK_DOUBT',
                    timestamp: new Date().toISOString(),
                }
            );
        } catch (e) {
            log?.('Event log failed (non-critical): ' + e.message);
        }

        return res.json({ success: true, answer: responseText }, 200);
    } catch (e) {
        error?.(e.stack || e.message);
        return res.json({ success: false, message: 'Internal error', details: String(e.message || e) }, 500);
    }
};
