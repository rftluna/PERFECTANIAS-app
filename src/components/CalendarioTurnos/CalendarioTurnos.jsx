import { useState, useEffect, useMemo } from "react";
import { useTurno } from "../../context/TurnoContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Row, Col, Button, Form, Spinner } from "react-bootstrap";
import { FaRegCalendarAlt, FaRegClock } from "react-icons/fa";

export const CalendarioTurnos = () => {
    const { sucursal, serviciosSeleccionados, fechaSeleccionada, setFechaSeleccionada, asignacionesPorHora, asignarServicioAHora, limpiarAsignaciones, setPaso } = useTurno();

    const [horasOcupadas, setHorasOcupadas] = useState({});
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [errorHorarios, setErrorHorarios] = useState(false);
    const [intentoConsulta, setIntentoConsulta] = useState(0);

    const horariosDisponibles = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    // Fecha local para evitar problemas con UTC.
    const obtenerFechaLocal = () => {
        const hoy = new Date();

        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return `${año}-${mes}-${dia}`;
    };

    // Un horario de hoy que ya pasó (o empieza en menos de 1 hora) no se puede reservar.
    const esHorarioPasado = (fecha, hora) => {
        if (fecha !== obtenerFechaLocal()) return false;

        const [hh, mm] = hora.split(":").map(Number);
        const inicioTurno = new Date();
        inicioTurno.setHours(hh, mm, 0, 0);

        // eslint-disable-next-line react-hooks/purity -- la hora actual define qué turnos ya pasaron
        return inicioTurno.getTime() - Date.now() < 60 * 60 * 1000;
    };

    // Generamos una lista de unidades individuales de servicios.
    const itemsParaAgendar = useMemo(() => {
        const lista = [];

        serviciosSeleccionados.forEach((srv) => {
            const cantidad = Math.max(1, Number(srv.cantidad || 1));

            for (let i = 0; i < cantidad; i++) {
                lista.push({
                    slotKey: cantidad > 1 ? `${srv.id}__${i + 1}` : `${srv.id}`,
                    servicioOriginal: srv,
                    etiqueta: cantidad > 1 ? `${srv.name} (${i + 1}/${cantidad})` : srv.name
                });
            }
        });

        return lista;
    }, [serviciosSeleccionados]);

    // Consultamos exclusivamente la colección disponibilidad.
    useEffect(() => {
        if (!fechaSeleccionada || !sucursal?.id || !db) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sin fecha o sucursal se limpia el estado
            setHorasOcupadas({});
            setErrorHorarios(false);
            setLoadingHorarios(false);
            return;
        }

        let cancelado = false;

        const mapearDisponibilidadDia = async () => {
            setLoadingHorarios(true);
            setErrorHorarios(false);
            setHorasOcupadas({});

            try {
                const disponibilidadRef = collection(db, "disponibilidad");

                const q = query(disponibilidadRef, where("fecha", "==", fechaSeleccionada), where("sucursalId", "==", sucursal.id), where("ocupado", "==", true));

                const snapshot = await getDocs(q);

                if (cancelado) return;

                const conteoHoras = {};

                snapshot.forEach((documento) => {
                    const data = documento.data();

                    if (data.hora) {
                        conteoHoras[data.hora] = true;
                    }
                });

                setHorasOcupadas(conteoHoras);
            } catch (error) {
                console.error("Error consultando disponibilidad:", error);

                if (!cancelado) {
                    setHorasOcupadas({});
                    setErrorHorarios(true);
                }
            } finally {
                if (!cancelado) {
                    setLoadingHorarios(false);
                }
            }
        };

        mapearDisponibilidadDia();

        return () => {
            cancelado = true;
        };
    }, [fechaSeleccionada, sucursal?.id, intentoConsulta]);

    // Obtiene el horario asignado a cada unidad de servicio.
    const obtenerHoraAsignadaAItem = (slotKey) => {
        const entry = Object.entries(asignacionesPorHora || {}).find(([, srvAsignado]) => srvAsignado?.slotKey === slotKey);

        return entry ? entry[0] : "";
    };

    // Selecciona o libera el horario de un servicio.
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

    // Verifica que todos los servicios tengan horario.
    const todosTienenHorario = Boolean(fechaSeleccionada) && itemsParaAgendar.length > 0 && itemsParaAgendar.every((item) => Boolean(obtenerHoraAsignadaAItem(item.slotKey)));

    return (
        <div className="container fluid p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Elige el día y horario
            </h4>

            <Row className="g-4">
                {/* Selección de fecha */}
                <Col md={5} xs={12}>
                    <div className="p-3 border rounded-3 bg-white shadow-sm">
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "#d4a3b8" }}>
                            <FaRegCalendarAlt />
                            Selecciona la Fecha:
                        </Form.Label>

                        <Form.Control
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => {
                                const nuevaFecha = e.target.value;

                                // Evita que se escriba a mano una fecha pasada.
                                if (nuevaFecha && nuevaFecha < obtenerFechaLocal()) {
                                    return;
                                }

                                setFechaSeleccionada(nuevaFecha);

                                // Liberamos las asignaciones del día anterior.
                                limpiarAsignaciones();

                                // Reiniciamos el estado de la consulta.
                                setHorasOcupadas({});
                                setErrorHorarios(false);
                            }}
                            min={obtenerFechaLocal()}
                            className="border-rosa-suave"
                        />
                    </div>
                </Col>

                {/* Selección de horarios */}
                <Col md={7} xs={12}>
                    {fechaSeleccionada ? (
                        <div className="p-3 border rounded-3 bg-white shadow-sm">
                            <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "#d4a3b8" }}>
                                <FaRegClock />
                                Un servicio por hora para el {fechaSeleccionada}:
                            </Form.Label>

                            {/* Cargando disponibilidad */}
                            {loadingHorarios ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" style={{ color: "#d4a3b8" }} />

                                    <small className="text-muted d-block mt-2">Validando disponibilidad...</small>
                                </div>
                            ) : errorHorarios ? (
                                /* Error de consulta */
                                <div className="alert alert-danger text-center small" role="alert">
                                    <p className="mb-2">No pudimos consultar los horarios disponibles.</p>

                                    <Button size="sm" variant="outline-danger" onClick={() => setIntentoConsulta((prev) => prev + 1)}>
                                        Reintentar consulta
                                    </Button>
                                </div>
                            ) : (
                                /* Horarios disponibles */
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
                                                {/* Nombre y horario asignado */}
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

                                                {/* Botones de horarios */}
                                                <Row className="g-2">
                                                    {horariosDisponibles.map((hora) => {
                                                        const ocupadoEnFirestore = Boolean(horasOcupadas[hora]);

                                                        const asignadoAOtroItem = Boolean(asignacionesPorHora?.[hora]) && asignacionesPorHora[hora]?.slotKey !== item.slotKey;

                                                        const horarioPasado = esHorarioPasado(fechaSeleccionada, hora);

                                                        const noDisponible = ocupadoEnFirestore || asignadoAOtroItem || horarioPasado;

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

            {/* Navegación */}
            <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill text-dark" onClick={() => setPaso(2)} style={{ borderColor: "#d4a3b8" }}>
                    Volver
                </Button>

                <Button
                    className="fw-bold px-4 rounded-pill border-0 shadow-sm"
                    style={{
                        backgroundColor: "#d4a3b8",
                        color: "#ffffff"
                    }}
                    disabled={!todosTienenHorario || loadingHorarios || errorHorarios}
                    onClick={() => setPaso(4)}
                >
                    Siguiente paso ➔
                </Button>
            </div>
        </div>
    );
};
