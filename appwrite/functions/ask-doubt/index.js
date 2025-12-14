import { fetch } from "undici";
import { Client, ID, Account, TablesDB, Avatars } from "node-appwrite";

const appwriteConfig = {
    endpointUrl: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    doubtsTableId: process.env.DOUBTS_TABLE_ID,
    aiAnswerTableId: process.env.AI_ANSWER_TABLE_ID,
}


function inferMetadata(text) {
    const t = text.toLowerCase();

    const SUBJECT_RULES = [
        { subject: "Biology", regex: /biology|botany|zoology|cell|dna|genetics|neuron/ },
        { subject: "Physics", regex: /physics|newton|force|momentum|current|quantum/ },
        { subject: "Chemistry", regex: /chemistry|organic|inorganic|acid|base|bond/ },
        { subject: "Mathematics", regex: /math|integration|derivative|matrix|vector/ },
    ];

    const subject = SUBJECT_RULES.find(r => r.regex.test(t))?.subject ?? "General"

    const topic = (t.match(/[a-z]+/g) || []).slice(0, 3).join(" ") || "General Topic";

    const lengthScore = Math.min(3, Math.ceil(text.length / 120));
    const keywordScore = /prove | derive | why | explain | mechanism | theorem/.test(t) ? 2 : 1;
    const total = lengthScore + keywordScore;
    const difficulty = total >= 4 ? "Hard" : total >= 3 ? "Medium" : "Easy";

    return { subject, topic, difficulty };

}

function buildGeminiPrompt(doubtText) {
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
"Ab ye cheez mere dimaag me baith gayi hai, aur exam me ghabrahat nahi hogi." `
}

const answerSchema = {
    type: "object",
    properties: {
        explanation: {
            type: "array",
            description: "Step by step explanation roman urdu me",
            items: {
                type: "string",
            },
            minItems: 1,
        },
        intuition: {
            type: "string",
        },
        revisionTip: {
            type: "string",
            description: "Exam oriented short revision tip"
        },
    },
    required: ["explanation", "intuition", "revisionTip"],
    additionalProperties: false
}

async function callGemini(prompt) {
    const apiKey = process.env.EXPO_GEMINI_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                }
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2400,
                responseMimeType: "application/json",
                responseJsonSchema: answerSchema,
            }
        })
    })

    if (!res.ok) {
        const err = await res.text();
        throw new Error("Gemini api error: ", +err);
    }

    const data = await res.json();

    const jsonText = data.candidates[0].content.parts[0].text;

    console.log(jsonText);

    return JSON.parse(jsonText);
}

export { buildGeminiPrompt, callGemini, inferMetadata };

const createAdminClient = async () => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_SECRET_KEY);

    return {
        get account() {
            return new Account(client);
        },
        get tablesDB() {
            return new TablesDB(client)
        },
        get avatars() {
            return new Avatars(client);
        }
    }
}

export default async ({ req, res, log, error }) => {
    try {
        if (req.method !== "POST") return res.json({
            success: false, message: "Only post method allowed"
        }, 405)

        const { userId, doubtText } = JSON.parse(req.body ?? "{}");

        if (!userId || !doubtText.trim()) res.json({ sucess: false, message: "invalid input" }, 400);

        const meta = inferMetadata(doubtText)

        const { tablesDB } = await createAdminClient();

        const doubt = await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.doubtsTableId,
            rowId: ID.unique(),
            data: {
                userId,
                doubtText,
                subject: meta.subject,
                topic: meta.topic,
                difficulty: meta.difficulty
            }
        })

        const prompt = buildGeminiPrompt(doubtText);
        const aiAnswer = await callGemini(prompt)

        await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.aiAnswerTableId,
            rowId: ID.unique(),
            data: {
                doubtId: doubt.$id,
                aiAnswer
            }
        })

        return res.json({ success: true, aiAnswer })
    } catch (err) {
        res.json({ success: false, message: "Internal server error: " + err }, 500)
    }
}

