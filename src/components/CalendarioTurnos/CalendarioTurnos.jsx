import { useState, useEffect, useMemo } from "react";
import { useTurno } from "../../context/TurnoContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Row, Col, Button, Form, Spinner } from "react-bootstrap";
import { FaRegCalendarAlt, FaRegClock } from "react-icons/fa";

export const CalendarioTurnos = () => {
    const { sucursal, serviciosSeleccionados, fechaSeleccionada, setFechaSeleccionada, setHoraSeleccionada, asignacionesPorHora, asignarServicioAHora, setPaso } = useTurno();

    const [horasOcupadas, setHorasOcupadas] = useState({});
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    const horariosDisponibles = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    const itemsParaAgendar = useMemo(() => {
        const lista = [];
        serviciosSeleccionados.forEach((srv) => {
            const cant = Math.max(1, Number(srv.cantidad || 1));
            for (let i = 0; i < cant; i++) {
                lista.push({
                    slotKey: cant > 1 ? `${srv.id}__${i + 1}` : `${srv.id}`,
                    servicioOriginal: srv,
                    etiqueta: cant > 1 ? `${srv.name} (${i + 1}/${cant})` : srv.name
                });
            }
        });
        return lista;
    }, [serviciosSeleccionados]);

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
                    if (data.asignacionesPorHora && typeof data.asignacionesPorHora === "object") {
                        Object.keys(data.asignacionesPorHora).forEach((h) => {
                            conteoHoras[h] = (conteoHoras[h] || 0) + 1;
                        });
                    } else {
                        const horaTurno = data.hora || data.Hora;
                        if (horaTurno) {
                            conteoHoras[horaTurno] = (conteoHoras[horaTurno] || 0) + 1;
                        }
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

    const obtenerHoraAsignadaAItem = (slotKey) => {
        const entry = Object.entries(asignacionesPorHora || {}).find(([, srvAsignado]) => srvAsignado?.slotKey === slotKey);
        return entry ? entry[0] : "";
    };

    const handleSeleccionHoraItem = (item, hora) => {
        const horaActualDelItem = obtenerHoraAsignadaAItem(item.slotKey);

        if (horaActualDelItem === hora) {
            asignarServicioAHora(hora, null);
            return;
        }

        asignarServicioAHora(hora, {
            ...item.servicioOriginal,
            slotKey: item.slotKey
        });
    };

    const todosTienenHorario = Boolean(fechaSeleccionada) && itemsParaAgendar.length > 0 && itemsParaAgendar.every((item) => Boolean(obtenerHoraAsignadaAItem(item.slotKey)));

    return (
        <div className="container fluid p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Elige el día y horario
            </h4>

            <Row className="g-4">
                <Col md={5} xs={12}>
                    <div className="p-3 border rounded-3 bg-white shadow-sm">
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "#d4a3b8" }}>
                            <FaRegCalendarAlt /> Selecciona la Fecha:
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => {
                                setFechaSeleccionada(e.target.value);
                                setHoraSeleccionada("");
                            }}
                            min={new Date().toISOString().split("T")[0]}
                            className="border-rosa-suave"
                        />
                    </div>
                </Col>

                <Col md={7} xs={12}>
                    {fechaSeleccionada ? (
                        <div className="p-3 border rounded-3 bg-white shadow-sm">
                            <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "#d4a3b8" }}>
                                <FaRegClock /> Un servicio por hora para el {fechaSeleccionada}:
                            </Form.Label>

                            {loadingHorarios ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" style={{ color: "#d4a3b8" }} />
                                    <small className="text-muted d-block mt-2">Validando agendas de las chicas...</small>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {itemsParaAgendar.map((item) => {
                                        const horaAsignadaEsteItem = obtenerHoraAsignadaAItem(item.slotKey);

                                        return (
                                            <div
                                                key={item.slotKey}
                                                className="p-3 rounded-3 border"
                                                style={{
                                                    borderColor: horaAsignadaEsteItem ? "#d4a3b8" : "#ece4e8",
                                                    backgroundColor: horaAsignadaEsteItem ? "#fff9fb" : "#ffffff"
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                                    <strong className="small text-dark">{item.etiqueta}</strong>
                                                    <span
                                                        className="badge rounded-pill"
                                                        style={{
                                                            backgroundColor: horaAsignadaEsteItem ? "#d4a3b8" : "#f3e6ec",
                                                            color: horaAsignadaEsteItem ? "#ffffff" : "#7a747a",
                                                            fontSize: "11px"
                                                        }}
                                                    >
                                                        {horaAsignadaEsteItem ? `${horaAsignadaEsteItem} hs` : "Sin hora"}
                                                    </span>
                                                </div>

                                                <Row className="g-2">
                                                    {horariosDisponibles.map((hora) => {
                                                        const ocupadoEnFirestore = (horasOcupadas[hora] || 0) >= 1;
                                                        const asignadoAOtroItem = Boolean(asignacionesPorHora?.[hora]) && asignacionesPorHora[hora]?.slotKey !== item.slotKey;
                                                        const noDisponible = ocupadoEnFirestore || asignadoAOtroItem;
                                                        const seleccionado = horaAsignadaEsteItem === hora;

                                                        return (
                                                            <Col xs={4} sm={3} key={hora}>
                                                                <button
                                                                    type="button"
                                                                    disabled={noDisponible}
                                                                    onClick={() => handleSeleccionHoraItem(item, hora)}
                                                                    style={{
                                                                        width: "100%",
                                                                        padding: "6px 4px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 700,
                                                                        borderRadius: "8px",
                                                                        border: seleccionado ? "1px solid #d4a3b8" : "1px solid transparent",
                                                                        cursor: noDisponible ? "not-allowed" : "pointer",
                                                                        backgroundColor: seleccionado ? "#d4a3b8" : noDisponible ? "#f1f1f1" : "#fff0f5",
                                                                        color: seleccionado ? "#ffffff" : noDisponible ? "#b5b5b5" : "#c47d9d",
                                                                        textDecoration: noDisponible ? "line-through" : "none"
                                                                    }}
                                                                >
                                                                    {hora}
                                                                </button>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="alert alert-warning text-center fw-bold small p-3 rounded-3" role="alert">
                            Por favor, selecciona una fecha primero para consultar las horas disponibles.
                        </div>
                    )}
                </Col>
            </Row>

            <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill text-dark" onClick={() => setPaso(2)} style={{ borderColor: "#d4a3b8" }}>
                    Volver
                </Button>

                <Button className="fw-bold px-4 rounded-pill border-0 shadow-sm" style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }} disabled={!todosTienenHorario} onClick={() => setPaso(4)}>
                    Siguiente paso ➔
                </Button>
            </div>
        </div>
    );
};
