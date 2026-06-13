import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

const API = API_URL;

export default function CertificateVerify() {
  const { certId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certId) return;
    fetch(`${API}/api/certificates/verify/${certId}`)
      .then(r => r.json())
      .then(res => {
        if (res.valid) setData(res);
        else setError(res.error);
      })
      .catch(() => setError('Erreur de connexion au serveur'))
      .finally(() => setLoading(false));
  }, [certId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f1f5f9'
      }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Vérification en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f1f5f9'
      }}>
        <div style={{
          background: '#fff', padding: '48px 40px', borderRadius: 16,
          textAlign: 'center', maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 40, color: '#ef4444'
          }}>✕</div>
          <h2 style={{ color: '#1e293b', marginBottom: 8, fontSize: 22 }}>Certificat introuvable</h2>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Aucun certificat ne correspond à cet identifiant.
          </p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>
            ID : {certId}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{
      minHeight: '70vh', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        maxWidth: 600, width: '100%', overflow: 'hidden'
      }}>
        {/* Bannière verte */}
        <div style={{
          background: 'linear-gradient(135deg, #059669, #10b981)',
          padding: '32px 24px', textAlign: 'center'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 36, color: '#fff'
          }}>✓</div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 26 }}>Certificat authentifié</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontSize: 14 }}>
            Ce certificat a été émis et signé numériquement par FormationNova.
          </p>
        </div>

        {/* Contenu */}
        <div style={{ padding: '32px 28px' }}>
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: 12, padding: 24,
            marginBottom: 24
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                Titulaire
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {data.nom}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                Formation
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>
                {data.formation}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                Date d'émission
              </div>
              <div style={{ fontSize: 16, color: '#334155' }}>
                {data.dateEmission}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                Identifiant du certificat
              </div>
              <div style={{
                fontSize: 13, color: '#64748b', fontFamily: 'monospace',
                background: '#f8fafc', padding: '8px 12px', borderRadius: 6,
                border: '1px solid #e2e8f0'
              }}>
                {data.certId}
              </div>
            </div>
          </div>

          <div style={{
            background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10,
            padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: 14, marginBottom: 2 }}>
                À propos de la validation
              </div>
              <p style={{ color: '#a16207', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Ce certificat est vérifié électroniquement. Vous pouvez le partager avec votre
                employeur ou l'utiliser comme preuve de compétence. Pour toute vérification
                manuelle, contactez-nous à{' '}
                <a href="mailto:contact@FormationNova-vision.bj" style={{ color: '#a16207' }}>
                  contact@FormationNova-vision.bj
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
