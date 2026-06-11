import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galerie from './pages/Galerie';
import Inscription from './pages/Inscription';
import AdminDashboard from './pages/Admin/AdminDashboard';
import FormateurDashboard from './pages/FormateurDashboard';

import Apropos from './pages/Apropos';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StaticPage from './pages/StaticPage';

import ApprenantDashboard from './pages/ApprenantDashboard';
import InscriptionFormation from './pages/InscriptionFormation';
import FormationDetails from './pages/FormationDetails';
import Parametres from './pages/Parametres';
import Testimonials from './pages/Testimonials';
import LessonViewer from './pages/LessonViewer';
import CertificateVerify from './pages/CertificateVerify';
import MetaPixel from './components/MetaPixel';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

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
  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/formateur') || 
                      location.pathname.startsWith('/mon-espace') ||
                      location.pathname.startsWith('/inscription') ||
                      location.pathname.startsWith('/fr/inscription') ||
                      location.pathname.startsWith('/en/enroll');

  // Remonter en haut de la page à chaque changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isDashboard) {
    return (
      <>
        <MetaPixel />
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
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/fr/inscription" element={<Inscription />} />
        <Route path="/en/enroll" element={<Inscription />} />
      </Routes>
      </>
    );
  }

  return (
    <div className="app">
      <MetaPixel />
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* French & Default routes */}
          <Route path="/" element={<Home />} />
          <Route path="/fr" element={<Home />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/fr/galerie" element={<Galerie />} />
          <Route path="/temoignages" element={<Navigate to="/galerie" replace />} />
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
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <LanguageRouteWatcher />
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
