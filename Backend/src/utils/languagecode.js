const axios = require('axios');

const getLanguageId = (lang) => {
    const language = {
        "cpp": 54,
        "java": 62,
        "javascript": 63,
        "python": 71,
    };
    const normalizedLang = lang.toLowerCase();
    if (!language[normalizedLang]) {
        throw new Error(`Unsupported language: ${lang}. Supported languages are: ${Object.keys(language).join(", ")}`);
    }
    return language[normalizedLang];
};

const toBase64 = (str) => {
    if (!str || typeof str !== 'string') return '';
    return Buffer.from(str).toString('base64');
};

const fromBase64 = (str) => {
    if (!str || typeof str !== 'string') return '';
    try {
        return Buffer.from(str, 'base64').toString('utf8');
    } catch {
        return str;
    }
};

const submitTestCase = async (submissions) => {
    // Encode payloads in base64 to prevent UTF-8 transmission errors
    const encodedSubmissions = submissions.map((sub) => ({
        ...sub,
        source_code: toBase64(sub.source_code),
        stdin: toBase64(sub.stdin),
        expected_output: sub.expected_output ? toBase64(sub.expected_output) : undefined,
        cpu_time_limit: sub.cpu_time_limit || 2,
    }));

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=true',
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions: encodedSubmissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Judge API Submit Error:", error.response?.data || error.message);
        throw error;
    }
};

const submitTokens = async (resultToken) => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (true) {
        try {
            const options = {
                method: "GET",
                url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
                params: {
                    tokens: resultToken.join(','),
                    base64_encoded: "true", // CRITICAL: Avoids 400 UTF-8 conversions on non-ASCII compiler output
                    fields: "*",
                },
                headers: {
                    "x-rapidapi-key": process.env.JUDGE0_API_KEY,
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                },
            };

            const response = await axios.request(options);
            const results = response.data.submissions;

            const ready = results.every((r) => r.status && r.status.id > 2);

            if (ready) {
                // Safely decode all base64 outputs returned by Judge0
                return results.map((r) => ({
                    ...r,
                    status_id: r.status?.id,
                    stdout: fromBase64(r.stdout),
                    stderr: fromBase64(r.stderr),
                    compile_output: fromBase64(r.compile_output),
                    message: fromBase64(r.message),
                }));
            }
            await wait(800);

        } catch (error) {
            console.error('Error fetching submission results from Judge0');
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            throw new Error('Failed to fetch results from Judge0: ' + (error.response?.data?.error || error.message));
        }
    }
};

module.exports = { getLanguageId, submitTestCase, submitTokens };
