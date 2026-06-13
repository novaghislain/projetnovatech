import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_live_9VvijBC1J4LwfPZh9FEwW0Dw';

const FedapayWidget = ({ amount, description, customerInfo, onSuccess, onFail }) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (!document.getElementById('fedapay-script')) {
      const script = document.createElement('script');
      script.id = 'fedapay-script';
      script.src = 'https://checkout.fedapay.com/js/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = () => {
    if (!window.FedaPay) {
      alert(
        language === 'en'
          ? 'The FedaPay module is loading, please wait a moment and try again.'
          : 'Le module FedaPay est en cours de chargement, veuillez patienter quelques secondes.'
      );
      return;
    }

    const widget = window.FedaPay.init({
      public_key: FEDAPAY_PUBLIC_KEY,
      transaction: {
        amount: amount,
        description: description || 'Inscription formation FormationNova',
      },
      customer: customerInfo
        ? {
            email: customerInfo.email || '',
            lastname: customerInfo.lastName || '',
            firstname: customerInfo.firstName || '',
            phone_number: {
              number: customerInfo.phone || '',
              country: 'BJ',
            },
          }
        : undefined,
      onComplete: (resp) => {
        const status = resp?.status || (resp?.transaction && resp.transaction.status);
        console.log('[FEDAPAY] Paiement complet:', resp, 'Status:', status);
        if (status === 'approved' || status === 'successful') {
          if (onSuccess) onSuccess(resp);
        } else {
          console.warn('[FEDAPAY] Transaction non approuvée:', resp);
          if (onFail) {
            onFail(resp?.reason || 'Transaction non approuvée');
          }
        }
      },
      onClose: () => {
        console.log('[FEDAPAY] Widget fermé ou paiement annulé');
        if (onFail) {
          onFail();
        }
      },
    });

    widget.open();
  };

  return (
    <button
      type="button"
      id="btn-pay-fedapay"
      onClick={handlePay}
      style={{
        background: 'linear-gradient(135deg, #0047b3 0%, #0066ff 100%)',
        color: '#fff',
        border: 'none',
        padding: '1rem 2rem',
        fontSize: '1.05rem',
        fontWeight: '700',
        borderRadius: '10px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        boxShadow: '0 4px 14px rgba(0, 71, 179, 0.35)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 71, 179, 0.45)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 71, 179, 0.35)';
      }}
    >
      {/* Icône Mobile Money */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="14" rx="2" stroke="white" strokeWidth="1.8"/>
        <path d="M3 9h18" stroke="white" strokeWidth="1.8"/>
        <circle cx="7" cy="14" r="1.2" fill="white"/>
      </svg>
      {language === 'en'
        ? `Pay ${amount?.toLocaleString()} FCFA via FedaPay`
        : `Payer ${amount?.toLocaleString()} FCFA via FedaPay`}
    </button>
  );
};

export default FedapayWidget;
