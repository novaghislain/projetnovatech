import React from "react";
import { Bell, Menu, RefreshCw } from "lucide-react";
import { useLFDAuth, ROLE_LABELS } from "../../contexts/LFDAuthContext";
import { useLFDAlert } from "../../contexts/LFDAlertContext";
import { getLFDDate } from "./mockData";

const LFDHeader = ({ pageTitle, pageSubtitle, onMobileMenuOpen, alertCount = 2 }) => {
  const { lfdUser } = useLFDAuth();
  const { showAlert } = useLFDAlert();
  const today = getLFDDate();

  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          const { default: axios } = await import('axios');
          const token = localStorage.getItem('lfd_token');
          await axios.put("http://localhost:5001/api/lfd/employees/avatar", {
            avatar: compressedBase64
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          window.location.reload(); // Quick way to refresh auth state
        } catch (err) {
          console.error("Avatar upload error:", err);
          showAlert("Erreur", "Erreur lors de la mise à jour de l'avatar.", "error");
        } finally {
          setUploadingAvatar(false);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="lfd-header">
      <div className="lfd-header-left">
        <button className="lfd-header-toggle" onClick={onMobileMenuOpen} style={{ display:"flex" }}>
          <Menu size={20} />
        </button>
        <div>
          <div className="lfd-header-title">{pageTitle || "Tableau de bord"}</div>
          {pageSubtitle && <div className="lfd-header-subtitle">{pageSubtitle}</div>}
        </div>
      </div>

      <div className="lfd-header-right">
        {/* Date */}
        <div className="lfd-date-badge" style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ textTransform:"capitalize" }}>{today}</span>
        </div>

        {/* Refresh */}
        <button className="lfd-notif-btn" title="Actualiser les donnees" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
        </button>

        {/* Notifs */}
        <button className="lfd-notif-btn" title={`${alertCount} alertes actives`} onClick={() => window.location.href = '/gestion/alertes'}>
          <Bell size={16} />
          {alertCount > 0 && <span className="lfd-notif-dot" />}
        </button>

        {/* User chip */}
        {lfdUser && (
          <label className="lfd-user-chip" style={{ cursor: "pointer", opacity: uploadingAvatar ? 0.5 : 1 }}>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            <div className="lfd-user-avatar">
              {lfdUser.avatar && lfdUser.avatar.startsWith('data:') ? (
                <img src={lfdUser.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                lfdUser.firstName?.[0] || "?"
              )}
            </div>
            <div className="lfd-user-info">
              <span className="lfd-user-name">{lfdUser.firstName} {lfdUser.lastName}</span>
              <span className="lfd-user-role-label">{ROLE_LABELS[lfdUser.role] || lfdUser.role}</span>
            </div>
          </label>
        )}
      </div>
    </header>
  );
};

export default LFDHeader;

