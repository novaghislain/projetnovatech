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
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error("Identifiants incorrects ou serveur injoignable.");
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
