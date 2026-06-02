import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { Menu, X, User, ChevronDown, LayoutDashboard, BookOpen, LogOut, Settings, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Simulated logged-in user (replace with real auth context later)
const MOCK_USER = { firstName: 'Herlance' };

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // temp toggle
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();

  useEffect(() => {
    setIsLoggedIn(!!auth?.user);
  }, [auth?.user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const closeAll = () => {
    setIsOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/4x.png" alt="Novatech Vision Logo" className="logo-image" />
        </Link>

        {/* Nav Links */}
        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>

          {/* Main links */}
          <div className="navbar-main-links">
            <Link to="/" onClick={closeAll}>Accueil</Link>
            <Link to="/formations" onClick={closeAll}>Formations</Link>
            {!isLoggedIn ? (
              <>
                <Link to="/a-propos" onClick={closeAll}>À propos</Link>
                <Link to="/galerie" onClick={closeAll}>Galerie</Link>
                <Link to="/temoignages" onClick={closeAll}>Témoignages</Link>
              </>
            ) : (
              <Link to="/mon-espace" onClick={closeAll}>Mon espace</Link>
            )}
            <Link to="/contact" onClick={closeAll}>Contact</Link>
          </div>

          {/* Auth section */}
          <div className="navbar-auth-links">
            {!isLoggedIn ? (
              <>
                <Link to="/connexion" className="nav-auth-text" onClick={closeAll}>Connexion</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeAll}>
                  S'inscrire
                </Link>
              </>
            ) : (
              <div className="account-dropdown" ref={dropdownRef}>
                <button
                  className="account-trigger"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-expanded={accountMenuOpen}
                >
                  <div className="account-avatar">
                    <User size={16} />
                  </div>
                  <span>{auth.user?.firstName || auth.user?.email || 'Herlance'}</span>
                  <ChevronDown size={16} className={`chevron ${accountMenuOpen ? 'open' : ''}`} />
                </button>

                <div className={`account-menu ${accountMenuOpen ? 'open' : ''}`}>
                  <Link to="/mon-profil" className="account-menu-item" onClick={closeAll}>
                    <User size={16} /> Mon profil
                  </Link>
                  <Link to="/mon-espace/paiements" className="account-menu-item" onClick={closeAll}>
                    <CreditCard size={16} /> Mes paiements
                  </Link>
                  <Link to="/mon-espace/recus" className="account-menu-item" onClick={closeAll}>
                    <FileText size={16} /> Mes reçus
                  </Link>
                  <Link to="/parametres" className="account-menu-item" onClick={closeAll}>
                    <Settings size={16} /> Paramètres
                  </Link>
                  <div className="account-menu-divider" />
                  <button
                    className="account-menu-item account-menu-logout"
                    onClick={() => { auth.logout(); closeAll(); }}
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile burger */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

    </nav>
  );
};

export default Navbar;
