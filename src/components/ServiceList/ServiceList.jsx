// src/components/ServiceList/ServiceList.jsx
import React from "react";
import "./ServiceList.css";

export const ServiceList = ({ servicios, selectedService, onSelectService }) => {
  return (
    <div>
      <h3>Elegí servicios</h3>
      <div className="services-grid">
        {servicios.map((s) => (
          <div 
            key={s.id} 
            className={`service-card ${selectedService?.id === s.id ? "selected" : ""}`}
            onClick={() => onSelectService(s)}
          >
            <div className="service-image-placeholder">
              📷 Espacio Foto Servicio
            </div>
            <div>
              <h4>{s.name}</h4>
              <p className="price">${s.price.toLocaleString("es-AR")}</p>
              <small className="service-meta">
                {s.duration} · Seña ${s.deposit.toLocaleString("es-AR")}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};