
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useTurno } from "../../context/TurnoContext";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaPlusCircle } from "react-icons/fa";
import "./CatalogoServicios.css";

export const CatalogoServicios = () => {
    const { serviciosSeleccionados, toggleServicio, setPaso } = useTurno();

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [descripcionExpandida, setDescripcionExpandida] = useState({});

    // Conectamos con Firestore para traer los servicios
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
                console.error("Error al cargar servicios de Firestore: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServicios();
    }, []);

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#d4a3b8" }} />
                <p className="text-muted mt-2 small">
                    Cargando catálogo estético...
                </p>
            </div>
        );
    }

    // Expandir o contraer la descripción de un servicio
    const manejarDescripcion = (id) => {
        setDescripcionExpandida((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <Container fluid className="p-0">

            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Selecciona los servicios
            </h4>

            <Row className="g-3">
                {servicios.map((srv) => {

                    // Comprobamos si el servicio está seleccionado
                    const elegido = serviciosSeleccionados.some(
                        (s) => s.id === srv.id
                    );

                    const expandida = descripcionExpandida[srv.id];

                    return (
                        <Col xs={12} key={srv.id}>
                            <Card
                                className={`servicio-card p-3 ${
                                    elegido ? "border-rosa-activo" : ""
                                }`}
                                style={{
                                    backgroundColor: elegido ? "#fff5f7" : "#ffffff",
                                    borderColor: elegido ? "#d4a3b8" : "#f1e3e9"
                                }}
                            >

                                <Row className="align-items-center">

                                    {/* Imagen del servicio */}
                                    <Col xs={3} sm={2} className="text-center">
                                        <img
                                            src={srv.image}
                                            alt={srv.name}
                                            className="servicio-imagen rounded-3"
                                        />
                                    </Col>

                                    {/* Información del servicio */}
                                    <Col xs={6} sm={7}>

                                        <h6 className="servicio-nombre m-0 text-dark">
                                            {srv.name}
                                        </h6>

                                        {/* Descripción expandible */}
                                        <div className="servicio-descripcion-container">

                                            <p
                                                className={`servicio-descripcion ${
                                                    expandida ? "expandida" : ""
                                                }`}
                                            >
                                                {srv.description}
                                            </p>

                                            {srv.description && srv.description.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn-ver-descripcion"
                                                    onClick={() => manejarDescripcion(srv.id)}
                                                >
                                                    {expandida
                                                        ? "Ver menos"
                                                        : "Ver descripción..."}
                                                </button>
                                            )}

                                        </div>

                                        <span className="servicio-precio">
                                            ${srv.price}
                                        </span>

                                    </Col>

                                    {/* Botón para seleccionar o quitar */}
                                    <Col xs={3} sm={3} className="text-end">

                                        <Button
                                            variant={elegido ? "danger" : "outline-primary"}
                                            className="rounded-pill px-3 py-1 btn-sm fw-bold d-inline-flex align-items-center gap-1"
                                            style={{
                                                backgroundColor: elegido
                                                    ? "#d4a3b8"
                                                    : "transparent",
                                                borderColor: "#d4a3b8",
                                                color: elegido
                                                    ? "#ffffff"
                                                    : "#d4a3b8"
                                            }}
                                            onClick={() => toggleServicio(srv)}
                                        >
                                            {elegido ? (
                                                <>
                                                    <FaCheckCircle /> Quitar
                                                </>
                                            ) : (
                                                <>
                                                    <FaPlusCircle /> Elegir
                                                </>
                                            )}
                                        </Button>

                                    </Col>

                                </Row>

                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Botón para avanzar al calendario */}
            {serviciosSeleccionados.length > 0 && (
                <div className="text-end mt-4">

                    <Button
                        className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm"
                        style={{
                            backgroundColor: "#d4a3b8",
                            color: "#ffffff"
                        }}
                        onClick={() => setPaso(3)}
                    >
                        Siguiente paso ➔
                    </Button>

                </div>
            )}

        </Container>
    );
};
