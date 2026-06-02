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
    // 1. Check Hardcoded demo accounts
    let role = null;
    let firstName = 'Utilisateur';

    if (email === 'admin@novatech.com' && password === 'admin123') {
      role = 'admin';
      firstName = 'Direction';
    } else if (email === 'formateur@novatech.com' && password === 'formateur123') {
      role = 'formateur';
      firstName = 'Professeur';
    } else if (email === 'annonceur@novatech.com' && password === 'annonceur123') {
      role = 'annonceur';
      firstName = 'Partenaire';
    } else if (email === 'eleve@novatech.com' && password === 'eleve123') {
      role = 'apprenant';
      firstName = 'Élève';
    } else {
      // 2. Check if user registered locally
      const storedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const foundUser = storedUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        role = foundUser.role;
        firstName = foundUser.firstName;
      } else {
        throw new Error("Identifiants incorrects. Veuillez créer un compte ou utiliser les comptes de démonstration.");
      }
    }

    const mockUser = { email, firstName, role };
    setUser(mockUser);
    return mockUser;
  };

  const register = async ({ firstName, email, password }) => {
    // Par défaut, toute nouvelle inscription est un apprenant
    const role = 'apprenant';
    const newUser = { email, firstName: firstName || email.split('@')[0], role, password };
    
    // Save to local mock database
    const storedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(storedUsers));

    // Remove password before setting active session
    const sessionUser = { email, firstName: newUser.firstName, role };
    setUser(sessionUser);
    return sessionUser;
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
