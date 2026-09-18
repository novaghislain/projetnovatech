import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Galerie = lazy(() => import('./pages/Galerie'));
const Inscription = lazy(() => import('./pages/Inscription'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const FormateurDashboard = lazy(() => import('./pages/FormateurDashboard'));

const Apropos = lazy(() => import('./pages/Apropos'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const StaticPage = lazy(() => import('./pages/StaticPage'));

const ApprenantDashboard = lazy(() => import('./pages/ApprenantDashboard'));
const InscriptionFormation = lazy(() => import('./pages/InscriptionFormation'));
const FormationDetails = lazy(() => import('./pages/FormationDetails'));
const Parametres = lazy(() => import('./pages/Parametres'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const LessonViewer = lazy(() => import('./pages/LessonViewer'));
const CertificateVerify = lazy(() => import('./pages/CertificateVerify'));
import LoadingScreen from './components/LoadingScreen';
import MetaPixel from './components/MetaPixel';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { API_URL } from './config';
import { lazy, Suspense } from 'react';
// La Foi Distribution — chargement lazy pour isoler le bundle
const LFDRoot = lazy(() => import('./pages/LFD/LFDRoot'));

const SEOWatcher = () => {
  useEffect(() => {
    fetch(`${API_URL}/api/public/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.seoTitle) {
          document.title = data.seoTitle;
        } else if (data.siteName) {
          document.title = data.siteName;
        }

        if (data.seoDescription) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = data.seoDescription;
        }

        if (data.seoKeywords) {
          let metaKey = document.querySelector('meta[name="keywords"]');
          if (!metaKey) {
            metaKey = document.createElement('meta');
            metaKey.name = 'keywords';
            document.head.appendChild(metaKey);
          }
          metaKey.content = data.seoKeywords;
        }
      })
      .catch(err => console.error('Erreur lors du chargement SEO:', err));
  }, []);
  
  return null;
};

const LanguageRouteWatcher = () => {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    if (location.pathname.startsWith('/en')) {
      if (language !== 'en') setLanguage('en');
    } else if (location.pathname.startsWith('/fr')) {
      if (language !== 'fr') setLanguage('fr');
    }
  }, [location.pathname, language, setLanguage]);

  return null;
};

const AppLayout = () => {
  const location = useLocation();
  const hideNavFooter = location.pathname.startsWith('/admin') || 
                        location.pathname.startsWith('/formateur') || 
                        location.pathname.startsWith('/mon-espace') ||
                        location.pathname.startsWith('/gestion') ||  // La Foi Distribution
                        /^\/(fr\/|en\/)?(formations|courses)\/[^\/]+$/.test(location.pathname) ||
                        location.pathname.includes('/inscription') || 
                        location.pathname.includes('/enroll');

  // Remonter en haut de la page à chaque changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (hideNavFooter) {
    return (
      <>
        <MetaPixel />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin', 'admin_restreint']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/formateur/*" element={
              <ProtectedRoute allowedRoles={['formateur', 'admin']}>
                <FormateurDashboard />
              </ProtectedRoute>
            } />

            <Route path="/mon-espace/lecons/:courseId" element={
              <ProtectedRoute allowedRoles={['apprenant', 'admin']}>
                <LessonViewer />
              </ProtectedRoute>
            } />
            <Route path="/mon-espace/*" element={
              <ProtectedRoute allowedRoles={['apprenant', 'admin']}>
                <ApprenantDashboard />
              </ProtectedRoute>
            } />

            {/* ── La Foi Distribution — espace de gestion isolé ── */}
            <Route path="/gestion/*" element={
              <Suspense fallback={<LoadingScreen />}>
                <LFDRoot />
              </Suspense>
            } />

            <Route path="/formations/:id" element={<FormationDetails />} />
            <Route path="/fr/formations/:id" element={<FormationDetails />} />
            <Route path="/en/courses/:id" element={<FormationDetails />} />
            
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/fr/inscription" element={<Inscription />} />
            <Route path="/en/enroll" element={<Inscription />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  return (
    <div className="app">
      <MetaPixel />
      <Navbar />
      <main className="public-main-content">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* French & Default routes */}
            <Route path="/" element={<Home />} />
            <Route path="/fr" element={<Home />} />
            <Route path="/galerie" element={<Galerie />} />
            <Route path="/fr/galerie" element={<Galerie />} />
            <Route path="/fr/galerie" element={<Galerie />} />          <Route path="/temoignages" element={<Navigate to="/galerie" replace />} />
            <Route path="/fr/temoignages" element={<Navigate to="/fr/galerie" replace />} />
            <Route path="/a-propos" element={<Apropos />} />
            <Route path="/fr/a-propos" element={<Apropos />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/fr/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/fr/faq" element={<FAQ />} />
            <Route path="/conditions-utilisation" element={<StaticPage slug="conditions" defaultTitle="Conditions d'utilisation" />} />
            <Route path="/fr/conditions-utilisation" element={<StaticPage slug="conditions" defaultTitle="Conditions d'utilisation" />} />
            <Route path="/politique-confidentialite" element={<StaticPage slug="politique" defaultTitle="Politique de confidentialité" />} />
            <Route path="/fr/politique-confidentialite" element={<StaticPage slug="politique" defaultTitle="Politique de confidentialité" />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/fr/connexion" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fr/register" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/fr/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/inscription" element={<Navigate to="/inscription" replace />} />
            <Route path="/formations" element={<InscriptionFormation />} />
            <Route path="/fr/formations" element={<InscriptionFormation />} />
            <Route path="/formations/:id" element={<FormationDetails />} />
            <Route path="/fr/formations/:id" element={<FormationDetails />} />
            <Route path="/verifier/:certId" element={<CertificateVerify />} />

            {/* English routes */}
            <Route path="/en" element={<Home />} />
            <Route path="/en/gallery" element={<Galerie />} />
            <Route path="/en/testimonials" element={<Navigate to="/en/gallery" replace />} />
            <Route path="/en/about" element={<Apropos />} />
            <Route path="/en/contact" element={<Contact />} />
            <Route path="/en/faq" element={<FAQ />} />
            <Route path="/en/terms" element={<StaticPage slug="conditions" defaultTitle="Terms of use" />} />
            <Route path="/en/privacy" element={<StaticPage slug="politique" defaultTitle="Privacy Policy" />} />
            <Route path="/en/login" element={<Login />} />
            <Route path="/en/register" element={<Register />} />
            <Route path="/en/forgot-password" element={<ForgotPassword />} />
            <Route path="/en/courses" element={<InscriptionFormation />} />
            <Route path="/en/courses/:id" element={<FormationDetails />} />

            <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
            
            {/* Fallback backward compatibility */}
            <Route path="/inscriptions" element={<Navigate to="/mon-espace/formations" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <SEOWatcher />
        <LanguageRouteWatcher />
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
