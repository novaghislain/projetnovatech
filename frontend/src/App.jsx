import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galerie from './pages/Galerie';
import Inscription from './pages/Inscription';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Apropos from './pages/Apropos';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Temoignages from './pages/Temoignages';
import Login from './pages/Login';
import Register from './pages/Register';
import MonEspace from './pages/MonEspace';
import InscriptionFormation from './pages/InscriptionFormation';
import FormationDetails from './pages/FormationDetails';
import TableauInscriptions from './pages/TableauInscriptions';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Remonter en haut de la page à chaque changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
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
          <Route path="/a-propos" element={<Apropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/temoignages" element={<Temoignages />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inscription" element={<Inscription />} />
          
          <Route path="/mon-espace" element={<ProtectedRoute><MonEspace /></ProtectedRoute>} />
          <Route path="/mon-espace/inscriptions" element={<ProtectedRoute><TableauInscriptions /></ProtectedRoute>} />
          
          <Route path="/formations" element={<InscriptionFormation />} />
          <Route path="/formations/:id" element={<FormationDetails />} />
          
          {/* Fallback backward compatibility */}
          <Route path="/inscriptions" element={<Navigate to="/mon-espace/inscriptions" replace />} />
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
