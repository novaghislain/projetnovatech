import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: { bg: '#ECFDF5', border: '#10B981', text: '#059669', icon: '#10B981' },
  error: { bg: '#F3F4F6', border: '#EF4444', text: '#DC2626', icon: '#EF4444' },
  warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#D97706', icon: '#F59E0B' },
  info: { bg: '#EFF6FF', border: '#3B82F6', text: '#2563EB', icon: '#3B82F6' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
      }}>
        {toasts.map(t => {
          const colors = COLORS[t.type] || COLORS.info;
          const Icon = ICONS[t.type] || ICONS.info;
          return (
            <div
              key={t.id}
              className="fade-in"
              style={{
                background: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                animation: 'slideIn 0.3s ease',
                minWidth: '300px',
              }}
            >
              <Icon size={22} style={{ color: colors.icon, flexShrink: 0 }} />
              <span style={{
                flex: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: colors.text,
                lineHeight: 1.4,
              }}>
                {t.message}
              </span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.text,
                  opacity: 0.6,
                  padding: '2px',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
