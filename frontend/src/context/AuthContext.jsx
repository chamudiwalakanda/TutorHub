import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('tutorhub-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, double-check it's still valid
  // by asking the backend who we are (GET /api/auth/me).
  useEffect(() => {
    const token = localStorage.getItem('tutorhub-token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('tutorhub-user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('tutorhub-token');
        localStorage.removeItem('tutorhub-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login({ email, password, role }) {
    const res = await api.post('/auth/login', { email, password, role });
    const { token, user: loggedInUser } = res.data;
    localStorage.setItem('tutorhub-token', token);
    localStorage.setItem('tutorhub-user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    const { token, user: newUser } = res.data;
    localStorage.setItem('tutorhub-token', token);
    localStorage.setItem('tutorhub-user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  function logout() {
    localStorage.removeItem('tutorhub-token');
    localStorage.removeItem('tutorhub-user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
