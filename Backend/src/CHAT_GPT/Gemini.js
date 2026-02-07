const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyD-I9YHaGiYoIgWsN1qdLc_3zJUy4CfZTw" });


async function gemini(mess) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: mess,
    });

    return response.text
}

module.exports = gemini;