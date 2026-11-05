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
        <nav className="navbar navbar-expand-lg nav-perfectanias navbar-light shadow-sm py-2 w-100">
            <div className="container-fluid px-3 d-flex align-items-center justify-content-between flex-wrap">
                {/* LOGO DE LA MARCA */}
                <span className="brand-perfectanias fs-5 fw-bold text-uppercase tracking-wider" onClick={() => manejarNavegacion("/")} style={{ cursor: "pointer" }}>
                    Perfectanias ✨
                </span>

                {/* BOTÓN HAMBURGUESA DE BOOTSTRAP PURO */}
                <button className="navbar-toggler border-0 p-1" type="button" onClick={() => setExpanded(!expanded)} aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* MENÚ DE CATEGORÍAS RESPONSIVE */}
                <div className={`collapse navbar-collapse justify-content-end ${expanded ? "show" : ""}`}>
                    <div className="nav-items-perfectanias d-flex flex-row flex-wrap justify-content-center align-items-center gap-3 rounded-pill px-4 py-1 my-2 my-lg-0 shadow-sm box-categorias-perfectanias">
                        <button className={`btn btn-link nav-link-item p-1 small ${!category ? "activo" : ""}`} onClick={() => manejarNavegacion("/")}>
                            Inicio
                        </button>

                        <button className={`btn btn-link nav-link-item p-1 small ${category === "pestanas" ? "activo" : ""}`} onClick={() => manejarNavegacion("/category/pestanas")}>
                            Pestañas
                        </button>

                        <button className={`btn btn-link nav-link-item p-1 small ${category === "unas" ? "activo" : ""}`} onClick={() => manejarNavegacion("/category/unas")}>
                            Uñas
                        </button>

                        <button className={`btn btn-link nav-link-item p-1 small ${category === "turnos" ? "activo" : ""}`} onClick={() => manejarNavegacion("/category/turnos")}>
                            Turnos 📅
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
