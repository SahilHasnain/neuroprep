// Test script for callGemini function
// Usage: EXPO_GEMINI_KEY=your_api_key node test-gemini.js

import { buildGeminiPrompt, callGemini } from "./index.js";

// Test cases
async function runTests() {
    console.log("🧪 Testing Gemini API...\n");

    const testDoubts = [
        "What is Newton's second law of motion?",
        "Explain photosynthesis in simple terms",
        "How to solve quadratic equations?",
    ];

    for (const doubt of testDoubts) {
        console.log(`📝 Test Doubt: "${doubt}"`);
        console.log("━".repeat(60));

        try {
            const prompt = buildGeminiPrompt(doubt);
            const response = await callGemini(prompt);

            console.log("✅ Response received:\n");
            console.log("Explanation:");
            response.explanation.forEach((step, i) => {
                console.log(`  ${i + 1}. ${step}`);
            });
            console.log(`\n💡 Intuition: ${response.intuition}`);
            console.log(`📌 Revision Tip: ${response.revisionTip}`);
            console.log("\n" + "━".repeat(60) + "\n");
        } catch (error) {
            console.error(`❌ Error: ${error.message}\n`);
        }
    }

    console.log("✨ Test complete!");
}

runTests().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
