/**
 * MetaPixel.jsx — Injection automatique du Pixel Meta/Facebook
 *
 * Ce composant injecte le script Meta Pixel dans le <head> des pages publiques
 * lorsque l'administrateur a activé et configuré un ID Pixel dans l'interface admin.
 *
 * Architecture extensible :
 * - Google Analytics 4  → créer GA4Pixel.jsx (même pattern)
 * - Google Tag Manager  → créer GTMPixel.jsx
 * - TikTok Pixel        → créer TikTokPixel.jsx
 * - LinkedIn Insight Tag → créer LinkedInPixel.jsx
 *
 * Hook exporté : useMetaPixel() → permet aux composants de déclencher des événements
 */

import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config';

/**
 * Hook personnalisé pour interagir avec Meta Pixel
 * Utilisation : const { trackEvent } = useMetaPixel()
 * trackEvent('Purchase', { value: 25000, currency: 'XOF' })
 */
export const useMetaPixel = () => {
  const trackEvent = useCallback((eventName, params = {}) => {
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, params);
        console.log(`[META-PIXEL] Événement déclenché: ${eventName}`, params);
      }
    } catch (e) {
      // Silencieux en production
    }
  }, []);

  return { trackEvent };
};

/**
 * Composant MetaPixel — Injection du script
 * À placer dans le composant racine (App.jsx)
 */
const MetaPixel = () => {
  const [config, setConfig] = useState(null);
  const location = useLocation();

  // Récupérer la configuration depuis l'API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/meta-pixel`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        // Silencieux — le Pixel n'est pas critique
      }
    };

    fetchConfig();
  }, []);

  // Determiner si la page courante est publique (vs admin/dashboard)
  const isPublicPage = useCallback(() => {
    const adminPaths = [
      '/admin', '/formateur', '/annonceur', '/mon-espace',
      '/inscription', '/parametres'
    ];
    const pathname = location.pathname;
    return !adminPaths.some(path => pathname.startsWith(path));
  }, [location.pathname]);

  // Injecter le script Meta Pixel
  useEffect(() => {
    if (!config || !config.isActive || !config.pixelId) return;
    if (!isPublicPage()) return;

    const pixelId = config.pixelId;

    // Éviter la double injection
    if (document.getElementById('meta-pixel-script')) return;

    // Script d'injection Meta Pixel (version standard)
    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Script noscript (fallback image)
    const noscript = document.createElement('noscript');
    noscript.id = 'meta-pixel-noscript';
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
      />
    `;
    document.head.appendChild(noscript);

    console.log(`[META-PIXEL] Pixel ${pixelId} injecté sur la page publique.`);

    return () => {
      // Nettoyage : NE PAS supprimer le script entre les navigations SPA
      // (le script reste dans le head, seuls les événements PageView sont re-déclenchés)
    };
  }, [config, isPublicPage]);

  // Déclencher PageView à chaque changement de route (SPA)
  useEffect(() => {
    if (!config || !config.isActive || !config.pixelId) return;
    if (!isPublicPage()) return;

    try {
      if (window.fbq) {
        window.fbq('track', 'PageView');
      }
    } catch (e) {
      // Silencieux
    }
  }, [location.pathname, config, isPublicPage]);

  // Attacher les événements personnalisés
  useEffect(() => {
    if (!config || !config.isActive || !config.pixelId) return;
    if (!isPublicPage()) return;
    if (!config.customEvents || config.customEvents.length === 0) return;

    const activeEvents = config.customEvents.filter(ev => ev.isActive);

    activeEvents.forEach(event => {
      if (event.actionType === 'load') {
        // Événement déclenché au chargement
        const elements = document.querySelectorAll(event.cssSelector);
        if (elements.length > 0) {
          try {
            if (window.fbq) {
              window.fbq('track', event.eventName);
              console.log(`[META-PIXEL] Événement load: ${event.eventName} (selector: ${event.cssSelector})`);
            }
          } catch (e) { /* silencieux */ }
        }
      }
    });

    // Fonction handler pour click et submit
    const handleCustomEvent = (e, eventName) => {
      try {
        if (window.fbq) {
          window.fbq('track', eventName);
          console.log(`[META-PIXEL] Événement custom: ${eventName}`);
        }
      } catch (err) { /* silencieux */ }
    };

    // Attacher les événements click
    const clickEvents = activeEvents.filter(ev => ev.actionType === 'click');
    const clickHandlers = [];
    clickEvents.forEach(event => {
      const elements = document.querySelectorAll(event.cssSelector);
      elements.forEach(el => {
        const handler = (e) => handleCustomEvent(e, event.eventName);
        el.addEventListener('click', handler);
        clickHandlers.push({ el, handler });
      });
    });

    // Attacher les événements submit
    const submitEvents = activeEvents.filter(ev => ev.actionType === 'submit');
    const submitHandlers = [];
    submitEvents.forEach(event => {
      const elements = document.querySelectorAll(event.cssSelector);
      elements.forEach(el => {
        const handler = (e) => handleCustomEvent(e, event.eventName);
        el.addEventListener('submit', handler);
        submitHandlers.push({ el, handler });
      });
    });

    return () => {
      // Nettoyage des event listeners
      clickHandlers.forEach(({ el, handler }) => {
        el.removeEventListener('click', handler);
      });
      submitHandlers.forEach(({ el, handler }) => {
        el.removeEventListener('submit', handler);
      });
    };
  }, [location.pathname, config, isPublicPage]);

  return null; // Composant invisible
};

export default MetaPixel;
