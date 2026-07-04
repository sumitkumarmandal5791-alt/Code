const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyCEGnomF2PMwH7_weA9zgf48QNdzTDjQTc" });


async function gemini(mess) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: mess,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw error;
    }
}

module.exports = gemini;