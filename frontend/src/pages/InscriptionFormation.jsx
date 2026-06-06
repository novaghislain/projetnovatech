import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, ArrowRight, ShieldCheck, Search, Filter } from 'lucide-react';
import AdBanner from '../components/AdBanner';
import './Home.css';

const API = 'http://localhost:5001';

const InscriptionFormation = () => {
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const fetchFormations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sort) params.set('sort', sort);
      const qs = params.toString();
      const res = await fetch(`${API}/api/public/formations${qs ? '?' + qs : ''}`);
      if (res.ok) setFormations(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort]);

  useEffect(() => { fetchFormations(); }, [fetchFormations]);

  useEffect(() => {
    fetch(`${API}/api/public/categories`)
      .then(r => r.ok && r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleReserve = (f) => {
    if (!auth.user) {
      navigate('/connexion', { state: { from: '/inscription', autoReserve: { course: f } } });
      return;
    }
    navigate('/inscription', { state: { course: f } });
  };

  return (
    <div className="page-transition">
      <div className="page-top-bar">
        <div className="container">
          <h1>Catalogue de Formations</h1>
          <p className="page-top-desc">
            Choisissez la formation idéale pour initier votre enfant au numérique dans un cadre sécurisé et encadré par des professionnels.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0 4rem' }}>
        <AdBanner placement="header" />

        {/* Barre de recherche et filtres */}
        <div style={{ margin: '2rem 0' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 38px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                borderRadius: 8, border: '1px solid #e2e8f0', background: showFilters ? '#1e3a5f' : '#fff',
                color: showFilters ? '#fff' : '#334155', cursor: 'pointer', fontSize: 14, fontWeight: 500
              }}
            >
              <Filter size={16} /> Filtres
            </button>
          </div>

          {showFilters && (
            <div style={{
              marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 10,
              border: '1px solid #e2e8f0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end'
            }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 160 }}>
                  <option value="">Toutes</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Prix min (FCFA)</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, width: 110 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Prix max (FCFA)</label>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, width: 110 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Trier par</label>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 140 }}>
                  <option value="">Plus récents</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="title">Ordre alphabétique</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>Chargement...</div>
        ) : formations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
            Aucune formation trouvée. Essayez de modifier vos filtres.
          </div>
        ) : (
          <div className="formations-page-list">
            {formations.map(f => {
              const isFull = f.isFull || f.status === 'full';
              return (
                <div key={f.id} className="formation-card">
                  <div className="formation-card-img">
                    <img src={f.imageUrl || '/placeholder.jpg'} alt={f.title} />
                    <div className="formation-card-tag">{f.category}</div>
                    {isFull && <div className="formation-card-complet">COMPLET</div>}
                  </div>
                  <div className="formation-card-body">
                    <div className="formation-card-meta">
                      <span><Clock size={16} /> {f.duration}</span>
                      <span><Users size={16} /> {f.ageGroup}</span>
                    </div>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                    <div className="formation-card-foot">
                      <strong>{f.price ? f.price.toLocaleString() + ' FCFA' : 'Gratuit'}</strong>
                      <div className="formation-card-actions">
                        <Link to={`/formations/${f.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                          Détails
                        </Link>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1rem' }}
                          disabled={isFull}
                          onClick={() => handleReserve(f)}
                        >
                          {isFull ? 'Plein' : "S'inscrire"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AdBanner placement="inline" />

        <div className="secure-banner">
          <ShieldCheck size={40} />
          <div>
            <strong>Paiement 100% sécurisé via FedaPay</strong>
            <span>Vos transactions sont cryptées et protégées. Nous ne conservons aucune donnée bancaire.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionFormation;
