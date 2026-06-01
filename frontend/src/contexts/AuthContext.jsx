import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    // Mock login: accept any email/password
    const mockUser = { email, firstName: email.split('@')[0] || 'User', role: 'eleve' };
    setUser(mockUser);
    return mockUser;
  };

  const register = async ({ firstName, email, password }) => {
    // Mock register: create user object and auto-login
    const newUser = { email, firstName: firstName || email.split('@')[0], role: 'eleve' };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
