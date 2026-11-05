import { useState, useEffect } from "react";
import { useTurno } from "../../context/TurnoContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Row, Col, Button, Form, Spinner } from "react-bootstrap";
import { FaRegCalendarAlt, FaRegClock } from "react-icons/fa";

export const CalendarioTurnos = () => {
    const { sucursal, fechaSeleccionada, setFechaSeleccionada, horaSeleccionada, setHoraSeleccionada, setPaso } = useTurno();

    const [horasOcupadas, setHorasOcupadas] = useState({});
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    // Listado de horarios corridos del salón de estética
    const horariosDisponibles = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    // Conexión real a tu Firestore leyendo la colección de reservas
    useEffect(() => {
        if (!fechaSeleccionada || !sucursal) return;

        const mapearDisponibilidadDia = async () => {
            setLoadingHorarios(true);
            const conteoHoras = {};

            try {
                const turnosRef = collection(db, "reservas");
                const q = query(turnosRef, where("fecha", "==", fechaSeleccionada), where("sucursalId", "==", sucursal.id));

                const snapshot = await getDocs(q);

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const horaTurno = data.hora || data.Hora; // Soporta minúsculas o mayúsculas de tu base de datos
                    if (horaTurno) {
                        conteoHoras[horaTurno] = (conteoHoras[horaTurno] || 0) + 1;
                    }
                });

                setHorasOcupadas(conteoHoras);
            } catch (error) {
                console.error("Error al validar cupos del día en Firestore: ", error);
            } finally {
                setLoadingHorarios(false);
            }
        };

        mapearDisponibilidadDia();
    }, [fechaSeleccionada, sucursal]);

    return (
        <div className="container fluid p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Elige el día y horario
            </h4>

            <Row className="g-4">
                {/* 1. SECTOR DEL CALENDARIO DE ENTRADA */}
                <Col md={6} xs={12}>
                    <div className="p-3 border rounded-3 bg-white shadow-sm">
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "#d4a3b8" }}>
                            <FaRegCalendarAlt /> Selecciona la Fecha:
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => {
                                setFechaSeleccionada(e.target.value);
                                setHoraSeleccionada(""); // Resetea la hora al cambiar de día
                            }}
                            min={new Date().toISOString().split("T")[0]} // Evita sacar turnos en días pasados
                            className="border-rosa-suave"
                        />
                    </div>
                </Col>

                {/* 2. SECTOR DE LA GRILLA DE HORAS ADAPTATIVA */}
                <Col md={6} xs={12}>
                    {fechaSeleccionada ? (
                        <div className="p-3 border rounded-3 bg-white shadow-sm">
                            <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "#d4a3b8" }}>
                                <FaRegClock /> Horarios para el {fechaSeleccionada}:
                            </Form.Label>

                            {loadingHorarios ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" style={{ color: "#d4a3b8" }} />
                                    <small className="text-muted d-block mt-2">Validando agendas de las chicas...</small>
                                </div>
                            ) : (
                                <Row className="g-2">
                                    {horariosDisponibles.map((hora) => {
                                        // REGLA DE NEGOCIO: Si ya hay 2 turnos agendados, el cupo está agotado
                                        const cupoLleno = (horasOcupadas[hora] || 0) >= 2;
                                        const seleccionado = horaSeleccionada === hora;

                                        return (
                                            <Col xs={4} sm={3} key={hora}>
                                                <Button
                                                    variant={seleccionado ? "primary" : cupoLleno ? "light" : "outline-primary"}
                                                    disabled={cupoLleno}
                                                    onClick={() => setHoraSeleccionada(hora)}
                                                    className="w-100 fw-bold py-2 btn-sm small border-0"
                                                    style={{
                                                        backgroundColor: seleccionado ? "#d4a3b8" : cupoLleno ? "#f1f1f1" : "#fff0f5",
                                                        color: seleccionado ? "#ffffff" : cupoLleno ? "#b5b5b5" : "#d4a3b8",
                                                        textDecoration: cupoLleno ? "line-through" : "none",
                                                        borderRadius: "8px"
                                                    }}
                                                >
                                                    {hora}
                                                </Button>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )}
                        </div>
                    ) : (
                        <div className="alert alert-warning text-center fw-bold small p-3 rounded-3" role="alert">
                            Por favor, selecciona una fecha primero para consultar las horas disponibles.
                        </div>
                    )}
                </Col>
            </Row>

            {/* Acciones de Navegación de Flujo */}
            <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill text-dark" onClick={() => setPaso(2)} style={{ borderColor: "#d4a3b8" }}>
                    Volver
                </Button>

                <Button
                    className="fw-bold px-4 rounded-pill border-0 shadow-sm"
                    style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }}
                    disabled={!fechaSeleccionada || !horaSeleccionada}
                    onClick={() => setPaso(4)} // Avanza al Paso 4 (Formas de Pago)
                >
                    Siguiente paso ➔
                </Button>
            </div>
        </div>
    );
};
