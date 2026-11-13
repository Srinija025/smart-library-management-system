
import axios from "axios";

const studentApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://smart-library-management-system-c39h.onrender.com/api"
});

// Attach student authentication token
studentApi.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("studentToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default studentApi;
