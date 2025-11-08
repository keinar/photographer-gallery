import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;