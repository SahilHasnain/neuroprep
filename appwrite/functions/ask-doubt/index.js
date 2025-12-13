import { fetch } from "undici";


function inferMetadata(text) {
    const t = text.toLowerCase();

    const isBio = /biology|botany|zoology|cell|dna|physiology|genetics|ecology|photosynthesis|neuron/.test(t);
    const isPhy = /physics|newton|force|momentum|electric|magnetic|optics|thermo|quantum|kinematics|current/.test(t);
    const isChem = /chemistry|organic|inorganic|stoichiometry|acid|base|salt|reaction|bond|periodic/.test(t);
    const isMath = /math|integration|derivative|limits|probability|matrix|vector|algebra|geometry|trigonometry/.test(t)

    let subject = "General"
    if (isBio) subject = "Biology"
    else if (isPhy) subject = "Physics"
    else if (isChem) subject = "Chemistry"
    else if (isMath) subject = "Mathematics"

    const topicMatch = (t.match(/[a-z]+/g) || []).slice(0, 3).join(" ");

    const lengthScore = Math.min(3, Math.ceil(text.length / 120));
    const keywordScore = /prove | derive | why | explain | mechanism | theorem/.test(t) ? 2 : 1;
    const total = lengthScore + keywordScore;
    const inferredDifficulty = total >= 4 ? "Hard" : total >= 3 ? "Medium" : "Easy";

    return { subject, topic: topicMatch || "General Topic", inferredDifficulty };

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

