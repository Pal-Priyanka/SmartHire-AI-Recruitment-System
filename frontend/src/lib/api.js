import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // Fallback if cookie not used or for mobile
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Logout user or redirect to login
            console.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
    }
);

export default api;
