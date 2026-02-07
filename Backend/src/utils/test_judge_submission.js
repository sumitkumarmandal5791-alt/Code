require("dotenv").config();
const { submitTestCase } = require("./languagecode");

async function runTest() {
    console.log("Starting Judge API Test...");

    const submissions = [
        {
            source_code: "console.log('hello world')",
            language_id: 63, // JavaScript
            stdin: "",
            expected_output: "hello world"
        }
    ];

    try {
        const result = await submitTestCase(submissions);
        console.log("Submission Result:", result);
    } catch (error) {
        console.error("Test Error:", error);
    }
}

runTest();
