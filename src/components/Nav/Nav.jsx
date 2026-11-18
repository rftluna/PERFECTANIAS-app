
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Nav.css";

export const Nav = () => {
    const navigate = useNavigate();
    const { category } = useParams();
    const [expanded, setExpanded] = useState(false);

    const manejarNavegacion = (ruta) => {
        navigate(ruta);
        setExpanded(false);
    };

    return (
        <nav className="navbar navbar-expand-lg nav-perfectanias shadow-sm">
            <div className="container-fluid nav-container">

                {/* MARCA */}
                <button
                    className="brand-perfectanias"
                    onClick={() => manejarNavegacion("/")}
                >
                    PERFECTANIAS <span>✨</span>
                </button>

                {/* HAMBURGUESA */}
                <button
                    className="navbar-toggler nav-toggler-custom"
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    aria-label="Abrir menú"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* NAVEGACIÓN */}
                <div className={`collapse navbar-collapse justify-content-end ${expanded ? "show" : ""}`}>
                    <div className="nav-items-perfectanias">

                        <button
                            className={`nav-link-item ${!category ? "activo" : ""}`}
                            onClick={() => manejarNavegacion("/")}
                        >
                            Inicio
                        </button>

                        <button
                            className={`nav-link-item ${category === "pestanas" ? "activo" : ""}`}
                            onClick={() => manejarNavegacion("/category/pestanas")}
                        >
                            Pestañas
                        </button>

                        <button
                            className={`nav-link-item ${category === "unas" ? "activo" : ""}`}
                            onClick={() => manejarNavegacion("/category/unas")}
                        >
                            Uñas
                        </button>

                        <button
                            className={`nav-link-item ${category === "turnos" ? "activo" : ""}`}
                            onClick={() => manejarNavegacion("/turnos")}
                        >
                            Turnos 📅
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
};
