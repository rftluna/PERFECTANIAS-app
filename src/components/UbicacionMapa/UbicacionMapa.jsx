import { useState } from "react";
import { useTurno } from "../../context/TurnoContext";
import { FaMapMarkerAlt, FaRoute } from "react-icons/fa";
import "./UbicacionMapa.css";

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
      <h5 className="mapa-titulo text-center mb-3">
        Dónde estamos
      </h5>

      <div className="mapa-sucursales" role="group" aria-label="Elegí una sucursal">
        {SUCURSALES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setElegidaId(s.id)}
            aria-pressed={s.id === local.id}
            className={`mapa-sucursal-btn ${s.id === local.id ? "activo" : ""}`}
          >
            <FaMapMarkerAlt aria-hidden="true" />
            {s.nombre}
          </button>
        ))}
      </div>

      <div className="ratio ratio-16x9 mapa-marco">
        <iframe
          title={`Mapa de Perfectanias en ${local.nombre}`}
          src={mapaSrc}
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <p className="mapa-direccion text-center mt-3 mb-2">{local.direccion}</p>
      <div className="text-center">
        <a
          href={linkComoLlegar}
          target="_blank"
          rel="noreferrer"
          className="mapa-como-llegar"
        >
          <FaRoute aria-hidden="true" />
          Cómo llegar
        </a>
      </div>
    </section>
  );
};
