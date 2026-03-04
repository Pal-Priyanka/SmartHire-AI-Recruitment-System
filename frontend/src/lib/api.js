import axios from "axios";
import store from "../redux/store";
import { setUser } from "../redux/authSlice";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        // You can add headers here if needed, but withCredentials handles cookies
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Global Logout on Unauthorized
            store.dispatch(setUser(null));
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
