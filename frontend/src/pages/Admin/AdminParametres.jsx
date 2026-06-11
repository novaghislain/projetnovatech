import React from 'react';
import { Settings, Globe, Shield, Bell, Palette, Database } from 'lucide-react';

const AdminParametres = () => {
  const sections = [
    {
      icon: Globe,
      title: 'Informations Générales',
      desc: 'Nom du site, description, logo, favicon, email de contact',
      fields: [
        { label: 'Nom du site', value: 'NovaTech Vision' },
        { label: 'Email de contact', value: 'contact@novatechvision.com' },
        { label: 'Téléphone', value: '+225 XX XX XX XX' },
      ]
    },
    {
      icon: Palette,
      title: 'Apparence',
      desc: 'Couleurs du thème, police, mise en page',
      fields: [
        { label: 'Couleur principale', value: '#8B5CF6' },
        { label: 'Police', value: 'Inter' },
      ]
    },
    {
      icon: Shield,
      title: 'Sécurité & Authentification',
      desc: 'Inscriptions, rôles utilisateurs, permissions',
      fields: [
        { label: 'Inscriptions', value: 'Ouvertes' },
        { label: 'Rôle par défaut', value: 'Apprenant' },
      ]
    },
    {
      icon: Database,
      title: 'Maintenance',
      desc: 'Sauvegarde de la base de données, logs, cache',
      fields: [
        { label: 'Base de données', value: 'SQLite' },
        { label: 'Dernière sauvegarde', value: '—' },
      ]
    },
  ];

  return (
    <div className="fade-in">
      <div className="admin-panel" style={{ borderTop: '4px solid #1A1A2E' }}>
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">
            <Settings size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Paramètres Généraux
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} style={{
                background: '#F9FAFB',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                border: '1px solid #E5E7EB',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>{section.title}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>{section.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} style={{
                      background: 'white',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      border: '1px solid #E5E7EB',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, marginBottom: '0.2rem' }}>{field.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)' }}>{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: '1.5rem', padding: '1rem 1.25rem',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <Bell size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#DC2626' }}>Page en cours de développement</div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '2px' }}>
              Les fonctionnalités de configuration avancée seront disponibles prochainement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminParametres;
