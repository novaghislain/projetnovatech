import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Galerie from './pages/Galerie';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/galerie" element={<Galerie />} />
            {/* Pages temporaires pour les routes */}
            <Route path="/formations" element={<div className="container section-padding text-center"><h2>Nos Formations</h2><p>Bientôt disponible...</p></div>} />
            <Route path="/a-propos" element={<div className="container section-padding text-center"><h2>À Propos</h2><p>Bientôt disponible...</p></div>} />
            <Route path="/contact" element={<div className="container section-padding text-center"><h2>Contact</h2><p>Bientôt disponible...</p></div>} />
            <Route path="/inscription" element={<div className="container section-padding text-center"><h2>Inscription</h2><p>Bientôt disponible...</p></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
