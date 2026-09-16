import React, { useState } from "react";
import { Search, Plus, AlertTriangle, Package, Edit2 } from "lucide-react";
import { formatFCFA } from "../mockDataPhase2";
import { useLFDData } from "../../../contexts/LFDDataContext";
import LFDModal from "../../../components/LFD/LFDModal";

const Stock = () => {
  const { stock, setStock } = useLFDData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nom: "", categorie: "Matériel Informatique", quantite: "", seuil: "", prixUnitaire: "" });

  const totalArticles = stock.reduce((sum, item) => sum + item.quantite, 0);
  const valeurStock = stock.reduce((sum, item) => sum + (item.quantite * (item.prix || item.prixUnitaire || 0)), 0);
  const ruptures = stock.filter(s => s.quantite <= (s.seuil || s.seuilAlert || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStock([{
      id: `PRD-00${stock.length + 1}`,
      nom: formData.nom,
      categorie: formData.categorie,
      quantite: Number(formData.quantite),
      seuilAlert: Number(formData.seuil),
      prixUnitaire: Number(formData.prixUnitaire),
      statut: Number(formData.quantite) > Number(formData.seuil) ? "En stock" : (Number(formData.quantite) > 0 ? "Stock faible" : "Rupture")
    }, ...stock]);
    setIsModalOpen(false);
    setFormData({ nom: "", categorie: "Matériel Informatique", quantite: "", seuil: "", prixUnitaire: "" });
  };

  return (
    <div className="lfd-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>Gestion de Stock</h1>
          <p style={{ color: "var(--lfd-text-dim)", fontSize: "0.9rem" }}>Surveillez les inventaires et gérez les réapprovisionnements.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="lfd-btn lfd-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <Plus size={18} /> Nouvel Article
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderLeft: "4px solid var(--lfd-accent)", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Articles en entrepôt</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lfd-surface)" }}>{totalArticles}</div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #10B981", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Valeur d'inventaire</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10B981" }}>{formatFCFA(valeurStock)}</div>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", borderLeft: "4px solid #EF4444", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
          <div style={{ color: "var(--lfd-text-dim)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Alertes Rupture</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#EF4444", display: "flex", alignItems: "center", gap: 8 }}>
            {ruptures.length} {ruptures.length > 0 && <AlertTriangle size={20} />}
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--lfd-surface-3)", color: "var(--lfd-text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Réf / Produit</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Catégorie</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Quantité</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Seuil Alerte</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Valeur (P.U)</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {stock.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((item) => {
                const itemSeuil = item.seuil || item.seuilAlert || 0;
                const itemPrix = item.prix || item.prixUnitaire || 0;
                const itemId = item.sku || item.id;
                const statut = item.quantite > itemSeuil ? "En stock" : (item.quantite > 0 ? "Stock faible" : "Rupture");

                return (
                <tr key={itemId} style={{ borderBottom: "1px solid var(--lfd-content-bg)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--lfd-surface)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--lfd-content-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lfd-accent)" }}><Package size={16} /></div>
                      <div>
                        <div>{item.nom}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--lfd-text-dim)", fontWeight: 400 }}>{itemId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-dim)" }}>{item.categorie}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: item.quantite <= itemSeuil ? "#EF4444" : "var(--lfd-surface)" }}>{item.quantite}</td>
                  <td style={{ padding: "12px 16px", color: "var(--lfd-text-muted)" }}>{itemSeuil}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{formatFCFA(itemPrix)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: statut === "En stock" ? "rgba(16,185,129,0.1)" : statut === "Stock faible" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: statut === "En stock" ? "#059669" : statut === "Stock faible" ? "#D97706" : "#EF4444" }}>
                      {statut}
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <LFDModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un Article au Stock">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Nom du produit</label>
            <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Catégorie</label>
            <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }}>
              <option value="Matériel Informatique">Matériel Informatique</option>
              <option value="Réseau">Réseau & Câblage</option>
              <option value="Accessoires">Accessoires</option>
              <option value="Logiciels">Logiciels & Licences</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Quantité Initiale</label>
              <input type="number" required min="0" value={formData.quantite} onChange={(e) => setFormData({...formData, quantite: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Seuil d'Alerte</label>
              <input type="number" required min="1" value={formData.seuil} onChange={(e) => setFormData({...formData, seuil: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>Prix Unitaire d'achat (FCFA)</label>
            <input type="number" required min="0" value={formData.prixUnitaire} onChange={(e) => setFormData({...formData, prixUnitaire: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--lfd-surface-3)" }} />
          </div>
          <button type="submit" style={{ marginTop: 10, padding: "12px", borderRadius: 8, background: "var(--lfd-accent)", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Package size={18} /> Sauvegarder l'article
          </button>
        </form>
      </LFDModal>
    </div>
  );
};
export default Stock;

