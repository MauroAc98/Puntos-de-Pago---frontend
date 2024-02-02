import React from 'react';

export default function OperCancelada() {
  return (
    <div className="cancelada-container">
      <div className="cancelada-opacity-bg" style={{ backgroundImage: `url('/logo_atm_recortado.png')` }}></div>
      <h1 className="cancelada-text">A continuación deberá cerrar esta ventana para finalizar la cancelación del pago.</h1>
    </div>
  );
}
