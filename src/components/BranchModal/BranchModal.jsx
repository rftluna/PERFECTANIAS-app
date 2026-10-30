// src/components/BranchModal/BranchModal.jsx
import React from "react";
import "./BranchModal.css";

export const BranchModal = ({ sucursales, onSelectBranch }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Elige la sucursal</h2>
        {sucursales.map((b) => (
          <div 
            key={b.id} 
            className="branch-card"
            onClick={() => onSelectBranch(b)}
          >
            <strong>{b.name}</strong>
            <p className="branch-address">{b.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};