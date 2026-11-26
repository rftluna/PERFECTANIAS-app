import { useState } from "react";
import { useTurno } from "../../context/TurnoContext";

const SUCURSALES = [
  { id: "casanova", nombre: "Isidro Casanova", direccion: "República de Portugal 2812, Isidro Casanova, Provincia de Buenos Aires" },
  { id: "moron", nombre: "Morón", direccion: "Dr. José María Casullo 231, Morón, Provincia de Buenos Aires" },
  { id: "ramos", nombre: "Ramos Mejía", direccion: "Avenida de Mayo 546, Ramos Mejía, Provincia de Buenos Aires" }
];

export const UbicacionMapa = () => {
  const { sucursal } = useTurno();
  const [elegidaId, setElegidaId] = useState(null);

  // Si el usuario eligió una sucursal en el mapa, esa manda; si no, la del contexto; si no, la primera.
  const idActiva = elegidaId ?? sucursal?.id;
  const local = SUCURSALES.find((s) => s.id === idActiva) ?? SUCURSALES[0];

  const mapaSrc = `https://www.google.com/maps?q=${encodeURIComponent(local.direccion)}&output=embed`;
  const linkComoLlegar = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local.direccion)}`;

  return (
    <section className="container py-4">
      <h5 className="fw-bold text-center mb-3" style={{ color: "#d4a3b8" }}>
        Dónde estamos
      </h5>

      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
        {SUCURSALES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setElegidaId(s.id)}
            className={`btn btn-sm ${s.id === local.id ? "btn-dark" : "btn-outline-secondary"}`}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
        <iframe
          title={`Mapa de Perfectanias en ${local.nombre}`}
          src={mapaSrc}
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <p className="text-center small text-muted mt-2 mb-1">{local.direccion}</p>
      <div className="text-center">
        <a
          href={linkComoLlegar}
          target="_blank"
          rel="noreferrer"
          className="small fw-bold text-decoration-none"
          style={{ color: "#d4a3b8" }}
        >
          Cómo llegar
        </a>
      </div>
    </section>
  );
};
