import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useTurno } from "../../context/TurnoContext";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaPlusCircle } from "react-icons/fa";
import "./CatalogoServicios.css";

export const CatalogoServicios = () => {
    const { category } = useParams();

    const { serviciosSeleccionados, toggleServicio, setPaso } = useTurno();

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [descripcionExpandida, setDescripcionExpandida] = useState({});
    const [filtroCategoria, setFiltroCategoria] = useState("todos");

    const esSeccionPestanas = category === "pestanas";

    // Reiniciar filtro y descripciones al cambiar de sección
    useEffect(() => {
        setFiltroCategoria("todos");
        setDescripcionExpandida({});
    }, [category]);

    // Cargar servicios desde Firestore
    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "servicios"));

                const dataMapeada = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setServicios(dataMapeada);
            } catch (error) {
                console.error("Error al cargar servicios de Firestore:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServicios();
    }, []);

    // Expandir o contraer descripción
    const manejarDescripcion = (id) => {
        setDescripcionExpandida((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Filtrado de servicios
    const serviciosFiltrados = servicios.filter((srv) => {
        if (!esSeccionPestanas) {
            return true;
        }

        if (filtroCategoria === "todos") {
            return srv.category === "Modelado - Tratamientos" || srv.category === "Combos";
        }

        return srv.category === filtroCategoria;
    });

    // Cargando catálogo
    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#d4a3b8" }} />

                <p className="text-muted mt-2 small">Cargando catálogo estético...</p>
            </div>
        );
    }

    return (
        <Container fluid className="p-0 catalogo-servicios">
            <h4 className="fw-bold mb-3 catalogo-titulo">{esSeccionPestanas ? "Servicios de pestañas y cejas" : "Seleccioná los servicios"}</h4>

            {/* FILTROS DE PESTAÑAS */}
            {esSeccionPestanas && (
                <div className="filtros-servicios">
                    <button type="button" className={`filtro-servicio ${filtroCategoria === "todos" ? "activo" : ""}`} onClick={() => setFiltroCategoria("todos")}>
                        Todos
                    </button>

                    <button type="button" className={`filtro-servicio ${filtroCategoria === "Modelado - Tratamientos" ? "activo" : ""}`} onClick={() => setFiltroCategoria("Modelado - Tratamientos")}>
                        Modelado - Tratamientos
                    </button>

                    <button type="button" className={`filtro-servicio ${filtroCategoria === "Combos" ? "activo" : ""}`} onClick={() => setFiltroCategoria("Combos")}>
                        Combos
                    </button>
                </div>
            )}

            {/* CATÁLOGO EN GRILLA */}
            {serviciosFiltrados.length > 0 ? (
                <Row className="g-3 catalogo-grid">
                    {serviciosFiltrados.map((srv) => {
                        const elegido = serviciosSeleccionados.some((s) => s.id === srv.id);

                        const expandida = descripcionExpandida[srv.id] === true;

                        const descripcionOriginal = typeof srv.description === "string" ? srv.description.trim() : "";

                        const descripcion = descripcionOriginal || "La descripción de este servicio estará disponible próximamente.";

                        return (
                            <Col xs={10} md={40} lg={10} key={srv.id}>
                                <Card className={`servicio-card ${elegido ? "servicio-elegido" : ""}`}>
                                    {/* IMAGEN */}
                                    <div className="servicio-imagen-container">
                                        <img
                                            src={srv.image}
                                            alt={srv.name || "Servicio estético"}
                                            className="servicio-imagen"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />

                                        {elegido && (
                                            <div className="servicio-badge-elegido">
                                                <FaCheckCircle />
                                            </div>
                                        )}
                                    </div>

                                    {/* INFORMACIÓN */}
                                    <Card.Body className="servicio-card-body">
                                        <h6 className="servicio-nombre">{srv.name}</h6>

                                        <div className="servicio-precio">${srv.price}</div>

                                        {/* DESCRIPCIÓN */}
                                        <div className="servicio-descripcion-container">
                                            <p id={`descripcion-${srv.id}`} className={`servicio-descripcion ${expandida ? "expandida" : ""}`}>
                                                {descripcion}
                                            </p>

                                            <button
                                                type="button"
                                                className="btn-ver-descripcion"
                                                aria-expanded={expandida}
                                                aria-controls={`descripcion-${srv.id}`}
                                                onClick={() => manejarDescripcion(srv.id)}
                                            >
                                                {expandida ? "Ver menos" : "Ver descripción"}
                                            </button>
                                        </div>

                                        {/* ELEGIR SERVICIO */}
                                        <Button className={`btn-seleccionar-servicio ${elegido ? "seleccionado" : ""}`} onClick={() => toggleServicio(srv)}>
                                            {elegido ? (
                                                <>
                                                    <FaCheckCircle />
                                                    Quitar
                                                </>
                                            ) : (
                                                <>
                                                    <FaPlusCircle />
                                                    Elegir
                                                </>
                                            )}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div className="catalogo-vacio">
                    <span>✨</span>

                    <p>No hay servicios disponibles en esta categoría por el momento.</p>
                </div>
            )}

            {/* AVANZAR AL CALENDARIO */}
            {serviciosSeleccionados.length > 0 && (
                <div className="text-end mt-4">
                    <Button className="btn-siguiente-paso" onClick={() => setPaso(3)}>
                        Siguiente paso ➔
                    </Button>
                </div>
            )}
        </Container>
    );
};
