import { Link } from "react-router-dom";
import { useMetaPagina } from "../../utils/useMetaPagina";

export const NotFound = () => {
    useMetaPagina("Página no encontrada");

    return (
        <section
            className="container text-center d-flex flex-column align-items-center justify-content-center py-5"
            style={{ minHeight: "60vh" }}
        >
            <div style={{ fontSize: "3rem" }}>✨</div>
            <h1 className="h3 fw-bold mt-2" style={{ color: "#c47d9d" }}>
                Esta página no existe
            </h1>
            <p className="text-muted mt-2 mb-4">
                Puede que el enlace esté roto o que la página se haya movido.
            </p>
            <Link
                to="/"
                className="btn rounded-pill fw-bold px-4 py-2"
                style={{ backgroundColor: "#e8b4c8", color: "#2c282c", border: "none" }}
            >
                Volver a reservar
            </Link>
        </section>
    );
};
