// Appwrite Cloud Function — Ask Doubt (Clean Version)

import { Client, Databases, ID } from "node-appwrite";
import { fetch } from "undici";

/* -------------------------------------------------------------------------- */
/*                               Helper Utils                                 */
/* -------------------------------------------------------------------------- */

const inferMetadata = (text: string) => {
    const t = text.toLowerCase();

    const SUBJECT_RULES = [
        { subject: "Biology", regex: /biology|botany|zoology|cell|dna|genetics|neuron/ },
        { subject: "Physics", regex: /physics|newton|force|momentum|current|quantum/ },
        { subject: "Chemistry", regex: /chemistry|organic|inorganic|acid|base|bond/ },
        { subject: "Mathematics", regex: /math|integration|derivative|matrix|vector/ },
    ];

    const subject =
        SUBJECT_RULES.find(r => r.regex.test(t))?.subject ?? "General";

    const topic =
        (t.match(/[a-z]+/g) || []).slice(0, 3).join(" ") || "General Topic";

    const lengthScore = Math.min(3, Math.ceil(text.length / 120));
    const keywordScore = /(prove|derive|why|explain|theorem)/.test(t) ? 2 : 1;
    const difficulty =
        lengthScore + keywordScore >= 4
            ? "Hard"
            : lengthScore + keywordScore >= 3
                ? "Medium"
                : "Easy";

    return { subject, topic, difficulty };
};

const buildGeminiPrompt = (doubtText: string) => `
Tum ek expert NEET/JEE tutor ho.

Student ka doubt:
"${doubtText}"

Rules:
- Explanation Roman Urdu me ho
- Step-by-step samjhao
- Exam-focused rakho
- End me ek short Revision Tip do
`;

const callGemini = async (apiKey: string, prompt: string) => {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
            }),
        }
    );

    if (!res.ok) {
        throw new Error(`Gemini error: ${await res.text()}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
};

/* -------------------------------------------------------------------------- */
/*                              Main Function                                  */
/* -------------------------------------------------------------------------- */

export default async ({ req, res, log, error }) => {
    try {
        if (req.method !== "POST") {
            return res.json({ success: false, message: "POST only" }, 405);
        }

        const { userId, doubtText } = JSON.parse(req.body ?? "{}");

        if (!userId || !doubtText?.trim()) {
            return res.json({ success: false, message: "Invalid input" }, 400);
        }

        const {
            APPWRITE_ENDPOINT,
            APPWRITE_PROJECT_ID,
            APPWRITE_API_KEY,
            APPWRITE_DATABASE_ID,
            GEMINI_API_KEY,
        } = req.env;

        const client = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID)
            .setKey(APPWRITE_API_KEY);

        const databases = new Databases(client);

        const meta = inferMetadata(doubtText);

        const doubt = await databases.createDocument({
            databaseId: APPWRITE_DATABASE_ID,
            collectionId: "doubts",
            documentId: ID.unique(),
            data: {
                userId,
                text: doubtText,
                subject: meta.subject,
                topic: meta.topic,
                difficulty: meta.difficulty,
                createdAt: new Date().toISOString(),
            },
        });

        const answer = await callGemini(
            GEMINI_API_KEY,
            buildGeminiPrompt(doubtText)
        );

        await databases.createDocument({
            databaseId: APPWRITE_DATABASE_ID,
            collectionId: "ai_responses",
            documentId: ID.unique(),
            data: {
                doubtId: doubt.$id,
                responseText: answer,
                createdAt: new Date().toISOString(),
            },
        });

        return res.json({ success: true, answer });
    } catch (e) {
        error?.(e.message);
        return res.json({ success: false, message: "Internal error" }, 500);
    }
};
