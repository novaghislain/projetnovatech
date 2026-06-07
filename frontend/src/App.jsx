import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galerie from './pages/Galerie';
import Inscription from './pages/Inscription';
import AdminDashboard from './pages/Admin/AdminDashboard';
import FormateurDashboard from './pages/FormateurDashboard';
import AnnonceurDashboard from './pages/AnnonceurDashboard';
import Apropos from './pages/Apropos';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import ApprenantDashboard from './pages/ApprenantDashboard';
import InscriptionFormation from './pages/InscriptionFormation';
import FormationDetails from './pages/FormationDetails';
import Parametres from './pages/Parametres';
import Testimonials from './pages/Testimonials';
import LessonViewer from './pages/LessonViewer';
import CertificateVerify from './pages/CertificateVerify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/formateur') || 
                      location.pathname.startsWith('/annonceur') ||
                      location.pathname.startsWith('/mon-espace') ||
                      location.pathname.startsWith('/inscription');

  // Remonter en haut de la page à chaque changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isDashboard) {
    return (
      <Routes>
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/formateur/*" element={
          <ProtectedRoute allowedRoles={['formateur', 'admin']}>
            <FormateurDashboard />
          </ProtectedRoute>
        } />
        <Route path="/annonceur/*" element={
          <ProtectedRoute allowedRoles={['annonceur', 'admin']}>
            <AnnonceurDashboard />
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
        <Route path="/inscription" element={
          <ProtectedRoute>
            <Inscription />
          </ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/temoignages" element={<Testimonials />} />
          <Route path="/a-propos" element={<Apropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/inscription" element={<Navigate to="/inscription" replace />} />
          <Route path="/formations" element={<InscriptionFormation />} />
          <Route path="/formations/:id" element={<FormationDetails />} />
          <Route path="/verifier/:certId" element={<CertificateVerify />} />

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
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
