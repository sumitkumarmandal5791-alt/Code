const express = require("express");
const AI = express.Router();
const { validateToken } = require("../middleware/userMiddleware")
const gemini = require("./Gemini")
const { User } = require("../Modles/user")
const ai = require("../Modles/schema")


AI.post("/message/:id", validateToken, async (req, res) => {

    try {
        const { msg } = req.body;
        const userId = req.params.id;
        let person = await ai.findOne({ id: userId });

        if (!person) {
            person = await ai.create({ id: userId, info: [] })
        }
        //get current history
        const history = person.info;

        ///get response from gemini
        const promptmessage = [
            ...history,
            { role: 'user', parts: [{ text: msg }] }
        ];

        const answer = await gemini(promptmessage)

        history.push({ role: 'user', parts: [{ text: msg }] });
        history.push({ role: 'model', parts: [{ text: answer }] });

        await ai.updateOne(
            { id: userId },
            { $set: { info: history } }
        )

        res.send(answer)
    }
    catch (error) {
        res.status(400).send(error.message)
    }
})

AI.get("/message/:id", validateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const person = await ai.findOne({ id: userId });
        if (!person) {
            return res.json([])
        }
        res.json(person.info)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports = AI
