import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('nv_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) localStorage.setItem('nv_user', JSON.stringify(user));
    else localStorage.removeItem('nv_user');
  }, [user]);

  // Global fetch interceptor for Refresh Tokens
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let response = await originalFetch(...args);
      
      if (response.status === 401 || response.status === 403) {
        // Ignorer les requêtes de login/refresh elles-mêmes pour éviter les boucles infinies
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        if (url && (url.includes('/api/auth/login') || url.includes('/api/auth/refresh'))) {
          return response;
        }

        const refreshToken = localStorage.getItem('nv_refreshToken');
        if (refreshToken) {
          try {
            const refreshRes = await originalFetch(`${API_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              localStorage.setItem('nv_token', data.token);
              
              // Retry the original request with new token
              const [reqUrl, config] = args;
              const newConfig = { ...config };
              if (newConfig && newConfig.headers) {
                newConfig.headers = { ...newConfig.headers, 'Authorization': `Bearer ${data.token}` };
              }
              response = await originalFetch(reqUrl, newConfig);
            } else {
              // Refresh failed, clear session without redirect to avoid loop
              setUser(null);
              localStorage.removeItem('nv_token');
              localStorage.removeItem('nv_refreshToken');
            }
          } catch (e) {
            console.error("Refresh token error", e);
          }
        }
      }
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const login = async ({ email, password }) => {
    // 2. Fetch from Real Backend
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('nv_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('nv_refreshToken', data.refreshToken);
      }
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(err.message || "Identifiants incorrects ou serveur injoignable.");
    }
  };

  const register = async ({ firstName, email, password }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, password, role: 'apprenant' })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      localStorage.setItem('nv_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(err.message || "Impossible de créer le compte.");
    }
  };

  const updateUserDetails = (newDetails) => {
    const updatedUser = { ...user, ...newDetails };
    setUser(updatedUser);
    localStorage.setItem('nv_user', JSON.stringify(updatedUser)); // backup fallback
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nv_token');
    localStorage.removeItem('nv_refreshToken');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
