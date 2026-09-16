import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Journaux = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`http://localhost:5001/api/lfd/accounting/journals/${id}/entries`, { headers });
      setEntries(res.data);
    } catch (error) {
      console.error(error);
      setError("Erreur de chargement du journal.");
    } finally {
      setLoading(false);
    }
  };

  const postEntry = async (entryId) => {
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`http://localhost:5001/api/lfd/accounting/entries/${entryId}/post`, {}, { headers });
      setSuccess("Écriture validée avec succès.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de validation");
    }
  };

  const reverseEntry = async (entryId) => {
    if (!window.confirm("Voulez-vous vraiment contrepasser cette écriture ?")) return;
    try {
      const token = localStorage.getItem('lfd_token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`http://localhost:5001/api/lfd/accounting/entries/${entryId}/reverse`, {}, { headers });
      setSuccess("Écriture contrepassée avec succès.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de contrepassation");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="lfd-page">
      <div className="lfd-header-flex">
        <h2>Écritures du Journal</h2>
        <button className="lfd-btn lfd-btn-secondary" onClick={() => navigate('/lfd/comptabilite')}>Retour</button>
      </div>

      {error && <div className="lfd-alert lfd-alert-danger">{error}</div>}
      {success && <div className="lfd-alert lfd-alert-success">{success}</div>}

      <div className="lfd-card">
        <table className="lfd-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>N° Écriture</th>
              <th>Libellé</th>
              <th>Source</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td>{e.entry_date}</td>
                <td><strong>{e.entry_number}</strong></td>
                <td>{e.description}</td>
                <td>
                  {e.source_type} {e.source_id && `(#${e.source_id})`}
                  {e.source_type && e.source_id && (
                    <button 
                      className="lfd-btn-small lfd-btn-secondary" 
                      style={{ marginLeft: '0.5rem' }}
                      onClick={() => alert(`Navigation vers la source ${e.source_type} #${e.source_id} (À implémenter dans les modules respectifs)`)}
                    >
                      Voir
                    </button>
                  )}
                </td>
                <td>
                  <span className={`lfd-badge lfd-badge-${e.status.toLowerCase()}`}>
                    {e.status}
                  </span>
                </td>
                <td>{new Date(e.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  {e.status === 'DRAFT' && (
                    <button className="lfd-btn-small lfd-btn-success" onClick={() => postEntry(e.id)}>
                      Valider
                    </button>
                  )}
                  {e.status === 'POSTED' && (
                    <button className="lfd-btn-small lfd-btn-danger" onClick={() => reverseEntry(e.id)}>
                      Contrepasser
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">Aucune écriture dans ce journal.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Journaux;
