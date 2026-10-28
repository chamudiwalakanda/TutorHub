import axios from 'axios';

// Vite exposes env vars prefixed with VITE_ via import.meta.env
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Attach the JWT (if we have one) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tutorhub-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says our token is invalid/expired, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tutorhub-token');
      localStorage.removeItem('tutorhub-user');
    }
    return Promise.reject(error);
  }
);

export default api;
