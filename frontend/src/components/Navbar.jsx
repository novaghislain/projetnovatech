import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { Menu, X, User, ChevronDown, LayoutDashboard, BookOpen, LogOut, Settings, CreditCard, FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // temp toggle
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();
  const location = useLocation();

  const isCheckout = ['/inscription', '/register', '/connexion'].includes(location.pathname);

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

        {/* Mobile Nav Overlay */}
        {isOpen && (
          <div className="navbar-mobile-overlay" onClick={closeAll}></div>
        )}

        {/* Nav Links (Drawer on mobile) */}
        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>

          {isCheckout ? (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                <ArrowLeft size={16} />
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <>
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
              <>
                {auth.user?.role === 'admin' && <Link to="/admin" onClick={closeAll}>Espace Admin</Link>}
                {auth.user?.role === 'formateur' && <Link to="/formateur" onClick={closeAll}>Espace Formateur</Link>}
                {auth.user?.role === 'annonceur' && <Link to="/annonceur" onClick={closeAll}>Espace Annonceur</Link>}
                {/* For apprenant, 'Mon Espace' is now on the right side */}
              </>
            )}
            <Link to="/contact" onClick={closeAll}>Contact</Link>
          </div>

          <div className="navbar-auth-links">
            {!isLoggedIn ? (
              <>
                <Link to="/connexion" className="nav-auth-text" onClick={closeAll}>Connexion</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeAll}>
                  S'inscrire
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>


                {/* Simple direct links instead of dropdown */}
                {auth.user?.role === 'admin' && (
                  <Link to="/admin" className="btn btn-primary" onClick={closeAll}>
                    Dashboard Admin
                  </Link>
                )}
                {auth.user?.role === 'formateur' && (
                  <Link to="/formateur" className="btn btn-primary" onClick={closeAll}>
                    Espace Formateur
                  </Link>
                )}
                {auth.user?.role === 'annonceur' && (
                  <Link to="/annonceur" className="btn btn-primary" onClick={closeAll}>
                    Espace Annonceur
                  </Link>
                )}
                {auth.user?.role === 'apprenant' && (
                  <Link to="/mon-espace" className="btn btn-primary" onClick={closeAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LayoutDashboard size={16} /> Mon Espace
                  </Link>
                )}
              </div>
            )}
          </div>
          </>
          )}
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
