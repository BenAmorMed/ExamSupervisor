import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android Emulator loopback address
// For physical device, replace with your machine's LAN IP (e.g., http://192.168.1.15:8081)
const API_BASE_URL = 'http://10.0.2.2:8081';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if available and set dynamic URL
api.interceptors.request.use(
    async (config) => {
        try {
            // Dynamic URL handling
            const serverUrl = await AsyncStorage.getItem('server_url');
            if (serverUrl) {
                config.baseURL = serverUrl;
            }

            const user = await AsyncStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                // Add token if available in user data
                if (userData.token) {
                    config.headers.Authorization = `Bearer ${userData.token}`;
                }
            }
        } catch (error) {
            console.error('Error fetching token or url', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('user');
            // Navigation to login should be handled by the UI listening to user state
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email, password) => api.post('/api/enseignant/login', { email, password }),
};

export const teacherAPI = {
    getTeacherInfo: (id) => api.get(`/api/enseignant/${id}`),
    getAvailableSessions: (id) => api.get(`/api/enseignant/${id}/disponibilite`),
    getMySessions: (id) => api.get(`/api/enseignant/${id}/mesSeances`),
    getSubjectSessions: (id) => api.get(`/api/enseignant/${id}/sessionsWithAllMatieres`),
    getAllSessions: (page = 0, size = 8) => api.get(`/api/enseignant/sessions?page=${page}&size=${size}`),
    selectSession: (teacherId, sessionId) =>
        api.post(`/api/enseignant/${teacherId}/choisir/${sessionId}`),
    cancelSession: (teacherId, sessionId) =>
        api.post(`/api/enseignant/${teacherId}/annuler/${sessionId}`),
    autoAssign: (id) => api.post(`/api/enseignant/assign-auto/${id}`),
};

export default api;
