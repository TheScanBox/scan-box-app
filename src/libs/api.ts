import axios from "axios";

// Create an Axios instance
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Attach token
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
