const fs = require('fs');
let css = fs.readFileSync('Home.css', 'utf8');

const modalCss = `
/* =============================
   PROMO MODAL
   ============================= */
.promo-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 52, 96, 0.6);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.promo-modal-content {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.promo-modal-close {
  position: absolute;
  top: 15px; right: 15px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.promo-modal-close:hover {
  background: var(--color-primary);
  color: #fff;
  transform: rotate(90deg);
}

.promo-modal-badge {
  position: absolute;
  top: 15px; left: 15px;
  background: #ef4444;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
  animation: pulseBadge 2s infinite;
}

@keyframes pulseBadge {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.promo-modal-img {
  width: 100%;
  height: 200px;
  overflow: hidden;
}
.promo-modal-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-modal-body {
  padding: 1.8rem;
}
.promo-modal-body h3 {
  font-size: 1.3rem;
  color: var(--color-primary);
  margin: 0 0 0.8rem 0;
  line-height: 1.3;
}
.promo-modal-body p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.promo-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: 1.2rem;
}
.promo-modal-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-accent);
}
`;

fs.writeFileSync('Home.css', css + '\n' + modalCss, 'utf8');
