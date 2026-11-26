import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Nav.css";

// Pestañas del menú. NavLink marca la activa según la URL
// (useParams no sirve acá porque el Nav está fuera de <Routes>).
const LINKS = [
    { to: "/", texto: "Inicio", end: true },
    { to: "/category/pestanas", texto: "Pestañas" },
    { to: "/category/unas", texto: "Uñas" },
    { to: "/turnos", texto: "Turnos 📅" }
];

export const Nav = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const cerrarMenu = () => setExpanded(false);

    return (
        <nav className="navbar navbar-expand-lg nav-perfectanias shadow-sm" aria-label="Navegación principal">
            <div className="container-fluid nav-container">

                {/* MARCA */}
                <button
                    className="brand-perfectanias"
                    onClick={() => {
                        navigate("/");
                        cerrarMenu();
                    }}
                >
                    PERFECTANIAS <span>✨</span>
                </button>

                {/* HAMBURGUESA */}
                <button
                    className="navbar-toggler nav-toggler-custom"
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    aria-controls="menu-perfectanias"
                    aria-label="Abrir menú"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* NAVEGACIÓN */}
                <div id="menu-perfectanias" className={`collapse navbar-collapse justify-content-end ${expanded ? "show" : ""}`}>
                    <div className="nav-items-perfectanias">
                        {LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={cerrarMenu}
                                className={({ isActive }) => `nav-link-item ${isActive ? "activo" : ""}`}
                            >
                                {link.texto}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};
