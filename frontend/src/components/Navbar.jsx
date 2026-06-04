import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { Menu, X, User, ChevronDown, LayoutDashboard, BookOpen, LogOut, Settings, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

                {/* Quick links for apprenant */}
                {auth.user?.role === 'apprenant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
                    <Link
                      to="/mon-espace"
                      onClick={closeAll}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                    >
                      <BookOpen size={15} /> Mon Espace
                    </Link>
                    <Link
                      to="/mon-espace/inscriptions"
                      onClick={closeAll}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                    >
                      <CreditCard size={15} /> Mes Inscriptions
                    </Link>
                  </div>
                )}

                <div className="account-dropdown" ref={dropdownRef}>
                  <button
                    className="account-trigger"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    aria-expanded={accountMenuOpen}
                  >
                    <div className="account-avatar">
                      {auth.user?.avatar ? (
                        <img src={auth.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                          {auth.user?.firstName ? auth.user.firstName.charAt(0).toUpperCase() : <User size={16} />}
                        </span>
                      )}
                    </div>
                    <span>{auth.user?.firstName || auth.user?.email || 'Utilisateur'}</span>
                    <ChevronDown size={16} className={`chevron ${accountMenuOpen ? 'open' : ''}`} />
                  </button>

                  <div className={`account-menu ${accountMenuOpen ? 'open' : ''}`}>
                    {auth.user?.role === 'admin' && (
                      <Link to="/admin" className="account-menu-item" onClick={closeAll}>
                        <LayoutDashboard size={16} /> Dashboard Admin
                      </Link>
                    )}
                    {auth.user?.role === 'formateur' && (
                      <Link to="/formateur" className="account-menu-item" onClick={closeAll}>
                        <LayoutDashboard size={16} /> Espace Formateur
                      </Link>
                    )}
                    {auth.user?.role === 'annonceur' && (
                      <Link to="/annonceur" className="account-menu-item" onClick={closeAll}>
                        <LayoutDashboard size={16} /> Espace Annonceur
                      </Link>
                    )}
                    {auth.user?.role === 'apprenant' && (
                      <>
                        <Link to="/mon-espace" className="account-menu-item" onClick={closeAll}>
                          <LayoutDashboard size={16} /> Mon Espace
                        </Link>
                        <Link to="/mon-espace/inscriptions" className="account-menu-item" onClick={closeAll}>
                          <BookOpen size={16} /> Mes Inscriptions
                        </Link>
                        <Link to="/mon-espace/paiements" className="account-menu-item" onClick={closeAll}>
                          <CreditCard size={16} /> Mes paiements
                        </Link>
                        <Link to="/mon-espace/recus" className="account-menu-item" onClick={closeAll}>
                          <FileText size={16} /> Mes reçus
                        </Link>
                      </>
                    )}
                    
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
