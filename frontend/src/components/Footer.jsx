import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t, language } = useLanguage();
  const homePath = language === 'en' ? '/en' : '/';
  const coursesPath = language === 'en' ? '/en/courses' : '/formations';
  const aboutPath = language === 'en' ? '/en/about' : '/a-propos';
  const contactPath = language === 'en' ? '/en/contact' : '/contact';
  const privacyPath = language === 'en' ? '/en/privacy' : '/politique-confidentialite';
  const termsPath = language === 'en' ? '/en/terms' : '/conditions-utilisation';

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3 style={{ color: 'var(--color-white)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>FormationNova</h3>
          <p className="footer-desc">
            {t('footer_desc')}
          </p>
          <div className="social-links">
            <a href="https://www.facebook.com/FormationNovavision" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="https://x.com/FormationNovavision" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
            <a href="https://www.instagram.com/FormationNovavision" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
            <a href="https://www.linkedin.com/company/FormationNova-vision" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>{t('footer_quick_links')}</h4>
          <ul>
            <li><Link to={homePath}>{t('nav_home')}</Link></li>
            <li><Link to={coursesPath}>{t('nav_courses')}</Link></li>
            <li><Link to={aboutPath}>{t('nav_about')}</Link></li>
            <li><Link to={contactPath}>{t('nav_contact')}</Link></li>
            <li><Link to={privacyPath}>{t('footer_privacy')}</Link></li>
            <li><Link to={termsPath}>{t('footer_terms')}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="contact-info">
            <li><Phone size={18} /> +229 0191348557</li>
            <li><Mail size={18} /> contact@FormationNovavision.com</li>
            <li><MapPin size={18} /> Cotonou, Bénin</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FormationNova. {t('footer_rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
