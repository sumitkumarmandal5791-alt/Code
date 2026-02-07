require("dotenv").config();
const axios = require('axios');

// For the FREE tier, use this endpoint
const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
        tokens: 'dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db',
        base64_encoded: 'true',
        fields: '*'
    },
    headers: {
        'x-rapidapi-key': process.env.JUDGE0_API_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com' // Note: NO "extra" in host
    }
};

async function check() {
    try {
        const response = await axios.request(options);
        console.log("✅ Success! Status:", response.status);
        console.log(response)

    } catch (error) {
        console.error("❌ Error:", error.message);

    }
}

check();