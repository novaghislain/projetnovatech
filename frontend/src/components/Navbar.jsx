import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { Menu, X, User, ChevronDown, LayoutDashboard, BookOpen, LogOut, Settings, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // temp toggle
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const handleToggleLanguage = () => {
    const currentPath = location.pathname;

    // Check Dashboard routes - they do not change URL
    if (currentPath.startsWith('/mon-espace') || 
        currentPath.startsWith('/admin') || 
        currentPath.startsWith('/formateur') ||
        currentPath === '/inscription') {
      toggleLanguage();
      return;
    }

    let nextPath = null;

    // Exact paths
    const exactMappings = {
      '/': '/en',
      '/fr': '/en',
      '/formations': '/en/courses',
      '/fr/formations': '/en/courses',
      '/a-propos': '/en/about',
      '/fr/a-propos': '/en/about',
      '/contact': '/en/contact',
      '/fr/contact': '/en/contact',
      '/faq': '/en/faq',
      '/fr/faq': '/en/faq',
      '/conditions-utilisation': '/en/terms',
      '/fr/conditions-utilisation': '/en/terms',
      '/politique-confidentialite': '/en/privacy',
      '/fr/politique-confidentialite': '/en/privacy',
      '/galerie': '/en/gallery',
      '/fr/galerie': '/en/gallery',
      '/temoignages': '/en/testimonials',
      '/fr/temoignages': '/en/testimonials',
      '/connexion': '/en/login',
      '/fr/connexion': '/en/login',
      '/register': '/en/register',
      '/fr/register': '/en/register',
      '/mot-de-passe-oublie': '/en/forgot-password',
      '/fr/mot-de-passe-oublie': '/en/forgot-password',

      '/en': '/fr',
      '/en/courses': '/fr/formations',
      '/en/enroll': '/fr/inscription',
      '/en/about': '/fr/a-propos',
      '/en/contact': '/fr/contact',
      '/en/faq': '/fr/faq',
      '/en/terms': '/fr/conditions-utilisation',
      '/en/privacy': '/fr/politique-confidentialite',
      '/en/gallery': '/fr/galerie',
      '/en/testimonials': '/fr/temoignages',
      '/en/login': '/fr/connexion',
      '/en/register': '/fr/register',
      '/en/forgot-password': '/fr/mot-de-passe-oublie'
    };

    if (exactMappings[currentPath]) {
      nextPath = exactMappings[currentPath];
    } else {
      // Dynamic paths
      if (currentPath.startsWith('/en/courses/')) {
        nextPath = currentPath.replace('/en/courses', '/fr/formations');
      } else if (currentPath.startsWith('/formations/') || currentPath.startsWith('/fr/formations/')) {
        const id = currentPath.split('/').pop();
        nextPath = `/en/courses/${id}`;
      } else if (currentPath.startsWith('/en/')) {
        nextPath = currentPath.replace('/en/', '/fr/');
      } else {
        nextPath = '/en' + currentPath.replace('/fr', '');
      }
    }

    // Since LanguageRouteWatcher watches the URL prefix to set language, 
    // we only need to navigate. But just in case, we also update state so it's instant.
    toggleLanguage();
    if (nextPath) {
      navigate(nextPath);
    }
  };

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

          {/* Main links */}
          <div className="navbar-main-links">
            <Link to="/" onClick={closeAll}>{t('nav_home')}</Link>
            <Link to="/formations" onClick={closeAll}>{t('nav_courses')}</Link>
            {!isLoggedIn ? (
              <>
                <Link to="/a-propos" onClick={closeAll}>{t('nav_about')}</Link>
                <Link to="/galerie" onClick={closeAll}>{t('nav_gallery')}</Link>
                <Link to="/temoignages" onClick={closeAll}>{t('nav_testimonials')}</Link>
              </>
            ) : (
              <>
                {auth.user?.role === 'admin' && <Link to="/admin" onClick={closeAll}>{t('nav_admin')}</Link>}
                {auth.user?.role === 'formateur' && <Link to="/formateur" onClick={closeAll}>{t('nav_formateur')}</Link>}
              </>
            )}
            <Link to="/contact" onClick={closeAll}>{t('nav_contact')}</Link>
          </div>

          <div className="navbar-auth-links">
            {/* Lang Switcher */}
            <button 
              onClick={handleToggleLanguage} 
              className="lang-switcher"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginRight: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              🌐 {language.toUpperCase()}
            </button>

            {!isLoggedIn ? (
              <>
                <Link to="/connexion" className="nav-auth-text" onClick={closeAll}>{t('nav_login')}</Link>
                <Link to="/register" className="btn btn-primary" onClick={closeAll}>
                  {t('nav_register')}
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
                      <BookOpen size={15} /> {t('nav_my_space')}
                    </Link>
                    <Link
                      to="/mon-espace/inscriptions"
                      onClick={closeAll}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                    >
                      <CreditCard size={15} /> {t('nav_my_enrollments')}
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
                        <LayoutDashboard size={16} /> {t('nav_admin')}
                      </Link>
                    )}
                    {auth.user?.role === 'formateur' && (
                      <Link to="/formateur" className="account-menu-item" onClick={closeAll}>
                        <LayoutDashboard size={16} /> {t('nav_formateur')}
                      </Link>
                    )}
                    {auth.user?.role === 'apprenant' && (
                      <>
                        <Link to="/mon-espace" className="account-menu-item" onClick={closeAll}>
                          <LayoutDashboard size={16} /> {t('nav_my_space')}
                        </Link>
                        <Link to="/mon-espace/inscriptions" className="account-menu-item" onClick={closeAll}>
                          <BookOpen size={16} /> {t('nav_my_enrollments')}
                        </Link>
                        <Link to="/mon-espace/paiements" className="account-menu-item" onClick={closeAll}>
                          <CreditCard size={16} /> {t('nav_my_payments')}
                        </Link>
                        <Link to="/mon-espace/recus" className="account-menu-item" onClick={closeAll}>
                          <FileText size={16} /> {t('nav_my_receipts')}
                        </Link>
                      </>
                    )}

                    <Link to="/parametres" className="account-menu-item" onClick={closeAll}>
                      <Settings size={16} /> {t('nav_settings')}
                    </Link>
                    <div className="account-menu-divider" />
                    <button
                      className="account-menu-item account-menu-logout"
                      onClick={() => { auth.logout(); closeAll(); }}
                    >
                      <LogOut size={16} /> {t('nav_logout')}
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
