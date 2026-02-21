import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://coder-bc73.onrender.com",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;
