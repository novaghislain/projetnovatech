import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Share2, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <img src="/4x.png" alt="Novatech Vision Logo" className="footer-logo-image" />
          <p className="footer-desc">
            Organisme de formation spécialisé dans l'éducation informatique des enfants et jeunes de 8 à 18 ans.
          </p>
          <div className="social-links">
            <a href="#"><Share2 size={20} /></a>
            <a href="#"><MessageCircle size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Liens Rapides</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/formations">Nos Formations</Link></li>
            <li><Link to="/a-propos">À Propos de Nous</Link></li>
            <li><Link to="/contact">Nous Contacter</Link></li>
            <li><Link to="/politique-confidentialite">Politique de confidentialité</Link></li>
            <li><Link to="/conditions-utilisation">Conditions d'utilisation</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="contact-info">
            <li><Phone size={18} /> +229 0191348557</li>
            <li><Mail size={18} /> contact@novatechvision.com</li>
            <li><MapPin size={18} /> Cotonou, Bénin</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Novatech Vision. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
