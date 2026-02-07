const axios = require('axios');



const getLanguageId = (lang) => {
    const language = {
        "cpp": 54,
        "java": 62,
        "javascript": 63,

    }
    const normalizedLang = lang.toLowerCase();
    if (!language[normalizedLang]) {
        throw new Error(`Unsupported language: ${lang}. Supported languages are: ${Object.keys(language).join(", ")}`);
    }
    return language[normalizedLang];
}


const submitTestCase = async (submissions) => {

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);;
            return response.data
        } catch (error) {
            console.error("Judge API Error:", error.message);
            throw error;
        }
    }

    return await fetchData();
}

const submitTokens = async (resultToken) => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (true) {
        try {
            const options = {
                method: "GET",
                url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
                params: {
                    tokens: resultToken.join(','),
                    base64_encoded: "true",
                    fields: "*",
                },
                headers: {
                    "x-rapidapi-key": "e27fc56142msh68c93958e1cd391p121ce1jsn1db1fefa708a",
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                },
            };

            const response = await axios.request(options);
            const results = response.data.submissions;

            const ready = results.every((r) => r.status && r.status.id > 2);

            if (ready) {
                return results;
            }
            await wait(800);

        } catch (error) {
            console.error(' Error fetching submission results');
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            throw new Error('Failed to fetch results from Judge0: ' + (error.response?.data?.error || error.message));
        }
    }

    throw new Error('Timeout waiting for Judge0 results');
};

module.exports = { getLanguageId, submitTestCase, submitTokens };