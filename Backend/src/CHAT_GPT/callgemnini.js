// Backend/src/CHAT_GPT/callgemnini.js
const express = require("express");
const AI = express.Router();
const { validateToken } = require("../middleware/userMiddleware");
const gemini = require("./Gemini");
const Problem = require("../Modles/problem");

AI.post("/message/:id", validateToken, async (req, res) => {
    try {
        const { messages } = req.body;
        const problemId = req.params.id;

        // 1. Fetch the problem details from the database
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        // 2. Build a rich system instruction containing description & test cases
        const testCasesString = problem.visibleTestCases.map((tc, index) =>
            `Test Case ${index + 1}:\nInput: ${tc.input}\nExpected Output: ${tc.output}\nExplanation: ${tc.explanation || "N/A"}`
        ).join("\n\n");

        const systemInstruction = `
You are a helpful coding assistant for a platform like LeetCode. 
The user is currently trying to solve the following problem:

Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${problem.tags.join(", ")}

Description:
${problem.description}

Available Test Cases:
${testCasesString}

Instructions:
1. Guide the user toward the solution by giving hints, correcting syntax, or explaining concepts.
2. DO NOT just write the complete solution unless the user specifically asks for it. Help them learn.
3. Be concise and format code snippets in markdown.
        `.trim();

        // 3. Call gemini passing the history (messages) and the systemInstruction context
        const answer = await gemini(messages || [], systemInstruction);

        res.send(answer);
    }
    catch (error) {
        console.error("AI Route Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Since we no longer save history in DB, return empty array if hit
AI.get("/message/:id", validateToken, async (req, res) => {
    try {
        res.json([]);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = AI;

