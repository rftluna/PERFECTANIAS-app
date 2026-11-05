import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config"; // Verifica que la ruta apunte bien a tu firebase config
import { useTurno } from "../../context/TurnoContext";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaPlusCircle } from "react-icons/fa";

export const CatalogoServicios = () => {
    const { serviciosSeleccionados, toggleServicio, setPaso } = useTurno();
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Conectamos con Firestore para traer los servicios cargados de Iara en tiempo real
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

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#d4a3b8" }} />
                <p className="text-muted mt-2 small">Cargando catálogo estético...</p>
            </div>
        );
    }

    return (
        <Container fluid className="p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>Selecciona los servicios</h4>
            
            <Row className="g-3">
                {servicios.map((srv) => {
                    // Validamos si la clienta ya seleccionó esta tarjeta
                    const elegido = serviciosSeleccionados.some((s) => s.id === srv.id);

                    return (
                        <Col xs={12} key={srv.id}>
                            <Card 
                                className={`p-3 border rounded-3 transition-all shadow-sm ${elegido ? "border-rosa-activo" : ""}`}
                                style={{ 
                                    backgroundColor: "#ffffff",
                                    borderColor: elegido ? "#d4a3b8" : "#fff0f5",
                                    transition: "all 0.2s ease-in-out"
                                }}
                            >
                                <Row className="align-items-center">
                                    {/* Miniatura del tratamiento */}
                                    <Col xs={3} sm={2} className="text-center">
                                        <img 
                                            src={srv.image} 
                                            alt={srv.name} 
                                            className="rounded-3 object-fit-cover"
                                            style={{ width: "65px", height: "65px", objectFit: "cover" }}
                                        />
                                    </Col>

                                    {/* Nombre, descripción y precio */}
                                    <Col xs={6} sm={7}>
                                        <h6 className="fw-bold m-0 text-dark">{srv.name}</h6>
                                        <p className="text-muted m-0 my-1 small text-truncate-2" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                                            {srv.description}
                                        </p>
                                        <span className="fw-bold fs-6" style={{ color: "#d4a3b8" }}>
                                            ${srv.price}
                                        </span>
                                    </Col>

                                    {/* Botón de selección interactivo */}
                                    <Col xs={3} sm={3} className="text-end">
                                        <Button 
                                            variant={elegido ? "danger" : "outline-primary"}
                                            className="rounded-pill px-3 py-1 btn-sm fw-bold d-inline-flex align-items-center gap-1"
                                            style={{
                                                backgroundColor: elegido ? "#d4a3b8" : "transparent",
                                                borderColor: "#d4a3b8",
                                                color: elegido ? "#ffffff" : "#d4a3b8"
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

            {/* Botón flotante para avanzar de paso al elegir al menos un servicio */}
            {serviciosSeleccionados.length > 0 && (
                <div className="text-end mt-4">
                    <Button 
                        className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm"
                        style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }}
                        onClick={() => setPaso(3)} // Avanza al Calendario de Horarios
                    >
                        Siguiente paso ➔
                    </Button>
                </div>
            )}
        </Container>
    );
};
