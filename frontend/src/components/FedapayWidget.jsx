import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FedapayWidget = ({ amount, customerInfo, onSuccess, onFail }) => {
  const { language } = useLanguage();

  useEffect(() => {
    // Inject Fedapay script dynamically
    if (!document.getElementById('fedapay-script')) {
      const script = document.createElement('script');
      script.id = 'fedapay-script';
      script.src = 'https://checkout.fedapay.com/js/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = () => {
    if (window.FedaPay) {
      let widget = window.FedaPay.init({
        public_key: 'pk_live_9VvijBC1J4LwfPZh9FEwW0Dw',
        transaction: {
          amount: amount,
          description: 'Inscription à la formation Novatech',
        },
        customer: {
          email: customerInfo.email,
          lastname: customerInfo.lastName,
          firstname: customerInfo.firstName,
          phone_number: {
            number: customerInfo.phone,
            country: 'BJ' // Par défaut Bénin
          }
        },
        onComplete: (resp) => {
          console.log("Paiement FedaPay réussi", resp);
          if (onSuccess) onSuccess(resp);
        },
        onClose: () => {
          console.log("Paiement FedaPay fermé ou annulé");
          if (onFail) {
            onFail();
          } else {
            alert(language === 'en' 
              ? "Payment failed. Please contact support." 
              : "Échec du paiement. Veuillez contacter le support.");
          }
        }
      });
      widget.open();
    } else {
      alert(language === 'en'
        ? "The FedaPay payment module is loading, please wait."
        : "Le module de paiement FedaPay est en cours de chargement, veuillez patienter.");
    }
  };

  return (
    <button 
      type="button" 
      onClick={handlePay}
      style={{
        background: '#0047b3', // Bleu FedaPay
        color: '#fff',
        border: 'none',
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '1rem'
      }}
    >
      {language === 'en' ? 'Pay with FedaPay' : 'Payer avec FedaPay'}
    </button>
  );
};

export default FedapayWidget;
