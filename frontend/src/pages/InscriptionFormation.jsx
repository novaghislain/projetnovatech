import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, ShieldCheck, Search, Filter, MapPin, Layers } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { translateDuration, translateAgeGroup, translateLevel, translateTitle, translateDescription, translateCategory } from '../utils/translator';
import './Home.css';
import { API_URL, getImageUrl } from '../config';
import CourseImageSlider from '../components/CourseImageSlider';

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
  const { t, language } = useLanguage();

  const getFormatDisplay = (f) => {
    if (f.format === 'physique' || f.format === 'présentiel') {
      return (language === 'en' ? 'In-person ' : 'Présentiel ') + (f.location ? '(' + f.location + ')' : '');
    } else if (f.format === 'en_ligne' || f.format === 'hybride') {
      return language === 'en' ? 'Online' : 'En ligne';
    } else if (f.format === 'masse') {
      return (language === 'en' ? 'Camp / Mass ' : 'Camp / Masse ') + (f.location ? '(' + f.location + ')' : '');
    }
    return f.isOnline ? (language === 'en' ? 'Online' : 'En ligne') : (f.location || (language === 'en' ? 'In-person' : 'Présentiel'));
  };

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
      const res = await fetch(`${API_URL}/api/public/formations${qs ? '?' + qs : ''}`);
      if (res.ok) setFormations(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort]);

  useEffect(() => { fetchFormations(); }, [fetchFormations]);

  useEffect(() => {
    fetch(`${API_URL}/api/public/categories`)
      .then(r => r.ok && r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleReserve = (f) => {
    navigate('/inscription', { state: { formationId: f.id } });
  };

  return (
    <div className="page-transition">
      <div className="page-top-bar">
        <div className="container">
          <h1>{t('cat_title')}</h1>
          <p className="page-top-desc">
            {t('cat_subtitle')}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0 4rem' }}>


        {/* Barre de recherche et filtres */}
        <div style={{ margin: '2rem 0' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={t('cat_search_placeholder')}
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
              <Filter size={16} /> {t('cat_filters')}
            </button>
          </div>

          {showFilters && (
            <div style={{
              marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 10,
              border: '1px solid #e2e8f0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end'
            }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{t('cat_category')}</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 160 }}>
                  <option value="">{t('cat_category_all')}</option>
                  {categories.map(c => <option key={c} value={c}>{translateCategory(c, language) || c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{t('cat_price_min')}</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, width: 110 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{t('cat_price_max')}</label>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, width: 110 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{t('cat_sort_by')}</label>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 140 }}>
                  <option value="">{t('cat_sort_recent')}</option>
                  <option value="price_asc">{t('cat_sort_price_asc')}</option>
                  <option value="price_desc">{t('cat_sort_price_desc')}</option>
                  <option value="title">{t('cat_sort_alpha')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>{t('loading')}</div>
        ) : formations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
            {t('cat_no_course')}
          </div>
        ) : (
          <div className="formations-page-list">
            {formations.map(f => {
              const isFull = f.isFull || f.status === 'full';
              return (
                <div key={f.id} className="formation-card">
                  <div className="formation-card-img" style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <CourseImageSlider formation={f} height="180px" />
                    {f.category && <div className="formation-card-tag" style={{zIndex: 2}}>{translateCategory(f.category, language) || f.category}</div>}
                    {isFull && <div className="formation-card-complet" style={{zIndex: 2}}>{t('courses_full').toUpperCase()}</div>}
                  </div>
                  <div className="formation-card-body">
                    <div className="formation-card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      {f.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> {translateDuration(f.duration, language)}</span>}
                      {f.ageGroup && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={16} /> {translateAgeGroup(f.ageGroup, language)}</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} /> {getFormatDisplay(f)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Layers size={16} /> {translateLevel(f.level, language) || t('fd_all_levels')}</span>
                    </div>
                    <h3>{translateTitle(f.title, language)}</h3>
                    <p>{language === 'en' ? (f.descriptionEn || f.description || t('fd_default_desc')) : (f.description || t('fd_default_desc'))}</p>
                    
                    {/* Jauge de remplissage & alerte places */}
                    <div style={{ margin: '1rem 0' }}>
                      {isFull ? (
                        <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span>{language === 'en' ? '● Course Full (Waitlist)' : '● Formation Complète (Liste d\'attente)'}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                          <span>{f.enrolled || 0} / {f.maxParticipants || 20} {t('cat_spots')}</span>
                          {(f.maxParticipants || 20) - (f.enrolled || 0) <= 5 && (
                            <span style={{ color: '#ea580c', fontWeight: 700 }}>{t('cat_spots_only').replace('{spots}', (f.maxParticipants || 20) - (f.enrolled || 0))}</span>
                          )}
                        </div>
                      )}
                      <div style={{ width: '100%', height: '5px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginTop: '0.3rem', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          backgroundColor: isFull ? '#dc2626' : (((f.maxParticipants || 20) - (f.enrolled || 0) <= 5) ? '#ea580c' : '#10b981'), 
                          width: `${Math.min(100, (((f.enrolled || 0) / (f.maxParticipants || 20)) * 100))}%` 
                        }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                        {f.price ? `${f.price.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR')} FCFA` : t('courses_free')}
                      </strong>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={language === 'en' ? `/en/courses/${f.slug || f.id}` : `/formations/${f.slug || f.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{t('details')}</Link>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isFull ? '#475569' : 'var(--color-primary)' }}
                          onClick={() => handleReserve(f)}
                        >
                          {isFull ? t('cat_waitlist') : t('cat_enroll')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InscriptionFormation;
