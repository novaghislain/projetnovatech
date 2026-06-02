import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galerie from './pages/Galerie';
import Inscription from './pages/Inscription';
import AdminDashboard from './pages/Admin/AdminDashboard';

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

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
          <Route path="/formations" element={<div className="container section-padding text-center"><h2>Nos Formations</h2><p>Bientôt disponible...</p></div>} />
          <Route path="/a-propos" element={<div className="container section-padding text-center"><h2>À Propos</h2><p>Bientôt disponible...</p></div>} />
          <Route path="/contact" element={<div className="container section-padding text-center"><h2>Contact</h2><p>Bientôt disponible...</p></div>} />
          <Route path="/inscription" element={<Inscription />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
