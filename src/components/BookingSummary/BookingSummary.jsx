// src/components/BookingSummary/BookingSummary.jsx
import React from "react";
import "./BookingSummary.css";

export const BookingSummary = ({ 
  selectedService, 
  selectedBranch, 
  selectedDay, 
  selectedTime, 
  step, 
  onNext 
}) => {
  const isButtonDisabled = () => {
    if (step === 1) return !selectedService;
    if (step === 2) return !selectedDay || !selectedTime;
    return false;
  };

  return (
    <div className="booking-summary">
      <h3>Tu reserva</h3>
      
      <div className="summary-section">
        <label>SERVICIOS</label>
        {selectedService ? (
          <div className="summary-item">
            <span>{selectedService.name}</span>
            <strong>${selectedService.price.toLocaleString("es-AR")}</strong>
          </div>
        ) : (
          <p className="text-muted">Seleccioná un servicio para comenzar.</p>
        )}
      </div>

      <div className="summary-section">
        <label>SUCURSAL</label>
        <p className="summary-branch-title"><strong>{selectedBranch ? selectedBranch.name : "No seleccionada"}</strong></p>
        <small className="summary-branch-address">{selectedBranch?.address}</small>
      </div>

      {selectedDay && selectedTime && (
        <div className="summary-section">
          <label>FECHA Y HORA</label>
          <p className="summary-datetime-text">{selectedDay.day} {selectedDay.date} de {selectedDay.month}</p>
          <small className="summary-time-small">{selectedTime} hs</small>
        </div>
      )}

      {selectedService && (
        <div className="summary-totals">
          <div className="total-row">
            <span>Total:</span>
            <strong>${selectedService.price.toLocaleString("es-AR")}</strong>
          </div>
          <div className="total-row highlight">
            <span>Seña hoy:</span>
            <strong>${selectedService.deposit.toLocaleString("es-AR")}</strong>
          </div>

          {step < 4 && (
            <button 
              type="button"
              className="btn-pink" 
              onClick={onNext}
              disabled={isButtonDisabled()}
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  );
};