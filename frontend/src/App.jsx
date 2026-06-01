import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galerie from './pages/Galerie';
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

function App() {
  return (
    <Router>
      <AuthProvider>
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
              <Route path="/inscription" element={<Register />} />

              {/* Protected */}
              <Route path="/mon-espace" element={<ProtectedRoute><MonEspace /></ProtectedRoute>} />
              {/* Redirects from old URLs for backward compatibility */}
              <Route path="/inscription" element={<Navigate to="/formations" replace />} />
              <Route path="/inscriptions" element={<Navigate to="/mon-espace/inscriptions" replace />} />

              {/* Formations / inscription */}
              <Route path="/formations" element={<InscriptionFormation />} />
              <Route path="/formations/:id" element={<FormationDetails />} />

              {/* Protected */}
              <Route path="/mon-espace/inscriptions" element={<ProtectedRoute><TableauInscriptions /></ProtectedRoute>} />

              {/* Pages temporaires pour les routes */}
              <Route path="/formations" element={<div className="container section-padding text-center"><h2>Nos Formations</h2><p>Bientôt disponible...</p></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
