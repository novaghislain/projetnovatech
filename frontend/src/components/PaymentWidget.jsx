import React, { useEffect } from 'react';

const PaymentWidget = ({ amount, onSuccess, onFail, sandbox = false, customerInfo }) => {
  useEffect(() => {
    // Inject Kkiapay script dynamically
    if (!document.getElementById('kkiapay-script')) {
      const script = document.createElement('script');
      script.id = 'kkiapay-script';
      script.src = 'https://cdn.kkiapay.me/k.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = () => {
    if (window.openKkiapayWidget) {
      window.openKkiapayWidget({
        amount: amount,
        position: "center",
        callback: "http://localhost:5173/paiement-succes",
        theme: "#d4a017",
        key: "5038af86a07bf1ffaedef0cf1d8c6fb7bfdc1bfb",
        sandbox: sandbox
      });
    } else {
      alert("Le module de paiement Kkiapay est en cours de chargement...");
    }
  };

  return (
    <button 
      type="button" 
      onClick={handlePay}
      style={{
        background: '#000', // Noir ou jaune selon la charte, Kkiapay utilise souvent un fond sombre avec logo jaune, ici on met noir pour être élégant
        color: '#fff',
        border: 'none',
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        width: '100%'
      }}
    >
      Payer par Kkiapay
    </button>
  );
};

export default PaymentWidget;
