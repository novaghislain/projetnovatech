import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Zap } from "lucide-react";
import { useLFDAuth, ROLE_LABELS } from "../../contexts/LFDAuthContext";
import "./lfd.css";

const LFDLogin = () => {
  const { login, loginAsDemo, getDefaultRoute, DEMO_USERS } = useLFDAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login({ email, password });
      navigate(getDefaultRoute(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role) => {
    const user = loginAsDemo(role);
    if (user) navigate(getDefaultRoute(user.role));
  };

  const demoRoleColors = {
    director: { border:"#3B82F6", color:"#60A5FA", bg:"rgba(59,130,246,0.15)" },
    cashier:  { border:"#F59E0B", color:"#FCD34D", bg:"rgba(245,158,11,0.15)" },
    accountant:{ border:"#8B5CF6", color:"#C4B5FD", bg:"rgba(139,92,246,0.15)" },
    warehouse_agent:{ border:"#10B981", color:"#6EE7B7", bg:"rgba(16,185,129,0.15)" },
  };

  return (
    <div className="lfd-app">
      <div className="lfd-login-bg">
        {/* Orbs decoratifs gérés en CSS désormais */}

        <div className="lfd-login-card" style={{ animation:"lfd-fadeUp 0.5s ease" }}>
          {/* Brand */}
          <div className="lfd-login-brand">
            <h1 className="lfd-login-title">La Foi Distribution</h1>
            <p className="lfd-login-subtitle">Plateforme de gestion interne — Accès restreint</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="lfd-login-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="lfd-field">
              <label className="lfd-label">Adresse email professionnelle</label>
              <div className="lfd-input-wrap">
                <Mail size={16} className="lfd-input-icon" />
                <input
                  type="email"
                  className="lfd-input"
                  placeholder="email@lafoidistr.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="lfd-field">
              <label className="lfd-label">Mot de passe</label>
              <div className="lfd-input-wrap">
                <Lock size={16} className="lfd-input-icon" />
                <input
                  type={showPwd ? "text" : "password"}
                  className="lfd-input"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="lfd-input-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lfd-login-btn" disabled={loading}>
              {loading ? (
                <span className="lfd-spinner" style={{ width:20, height:20, borderWidth:2 }} />
              ) : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo rapide */}
          <div className="lfd-login-demo">
            <p><Zap size={12} style={{ display:"inline", marginRight:4 }} />Acces demo rapide</p>
            <div className="lfd-demo-roles">
              {DEMO_USERS.map(u => {
                const colors = demoRoleColors[u.role] || { border:"#64748B", color:"#64748B", bg:"rgba(100,116,139,0.08)" };
                return (
                  <button
                    key={u.role}
                    className="lfd-demo-role-btn"
                    style={{ borderColor: colors.border, color: colors.color, background: colors.bg }}
                    onClick={() => handleDemo(u.role)}
                  >
                    {ROLE_LABELS[u.role]}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize:"0.68rem", color:"#475569", marginTop:8, marginBottom:0 }}>
              Email: direction@lafoidistr.com / MDP: demo2026
            </p>
          </div>

          {/* Footer */}
          <div style={{ textAlign:"center", marginTop:24, fontSize:"0.7rem", color:"#334155" }}>
            <span>FormationNova Ecosystem</span>
            <span style={{ margin:"0 8px", color:"#475569" }}>•</span>
            <span>La Foi Distribution v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LFDLogin;

