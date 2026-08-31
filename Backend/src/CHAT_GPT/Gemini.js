// Backend/src/CHAT_GPT/Gemini.js
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function gemini(mess, systemInstruction) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: mess,
            config: {
                // Pass system context to Gemini
                systemInstruction: systemInstruction
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw error;
    }
}

module.exports = gemini;
