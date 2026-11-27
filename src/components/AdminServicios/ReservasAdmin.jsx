import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";

const ROSA = "#d4a3b8";
const ROSA_OSCURO = "#c47d9d";

// Fecha local de hoy en formato AAAA-MM-DD.
const obtenerFechaLocal = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
};

// Mismo formato de ID que usa TurnoContext al bloquear un horario.
const generarIdDisponibilidad = (fecha, sucursalId, hora) => {
    const sucursalSegura = encodeURIComponent(String(sucursalId));
    const horaSegura = String(hora).replace(":", "");
    return `${fecha}_${sucursalSegura}_${horaSegura}`;
};

// Todas las horas que ocupa una reserva (varios servicios pueden ir en horas distintas).
const obtenerHorasDeReserva = (reserva) => {
    const horas = new Set();

    if (Array.isArray(reserva.servicios)) {
        reserva.servicios.forEach((srv) => srv?.hora && horas.add(srv.hora));
    }

    if (reserva.asignacionesPorHora && typeof reserva.asignacionesPorHora === "object") {
        Object.keys(reserva.asignacionesPorHora).forEach((hora) => horas.add(hora));
    }

    if (reserva.hora) horas.add(reserva.hora);

    return [...horas].sort();
};

// "2026-11-21" -> "sáb 21/11"
const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [a, m, d] = fecha.split("-").map(Number);
    const fechaObj = new Date(a, m - 1, d);
    const diaSemana = fechaObj.toLocaleDateString("es-AR", { weekday: "short" });
    return `${diaSemana} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
};

const formatearMonto = (numero) => `$${Number(numero || 0).toLocaleString("es-AR")}`;

// Link de WhatsApp a partir del teléfono que cargó la clienta.
const linkWhatsApp = (telefono) => {
    let numero = String(telefono || "").replace(/\D/g, "");
    if (!numero) return null;
    if (numero.startsWith("0")) numero = numero.slice(1);
    if (!numero.startsWith("54")) numero = `549${numero}`;
    return `https://wa.me/${numero}`;
};

export const ReservasAdmin = () => {
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cancelandoId, setCancelandoId] = useState(null);
    const [verPasadas, setVerPasadas] = useState(false);
    const [filtroSucursal, setFiltroSucursal] = useState("todas");

    const cargarReservas = async () => {
        setCargando(true);
        try {
            const snap = await getDocs(collection(db, "reservas"));
            setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error(err);
            toast.error("No se pudieron cargar las reservas.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
        cargarReservas();
    }, []);

    const sucursales = useMemo(() => {
        const mapa = {};
        reservas.forEach((r) => {
            if (r.sucursalId) mapa[r.sucursalId] = r.sucursalNombre || r.sucursalId;
        });
        return Object.entries(mapa);
    }, [reservas]);

    const reservasFiltradas = useMemo(() => {
        const hoy = obtenerFechaLocal();

        return reservas
            .filter((r) => (verPasadas ? r.fecha < hoy : r.fecha >= hoy))
            .filter((r) => filtroSucursal === "todas" || r.sucursalId === filtroSucursal)
            .sort((a, b) => {
                const claveA = `${a.fecha} ${obtenerHorasDeReserva(a)[0] || ""}`;
                const claveB = `${b.fecha} ${obtenerHorasDeReserva(b)[0] || ""}`;
                // Próximas: de la más cercana a la más lejana. Pasadas: de la más reciente hacia atrás.
                return verPasadas ? claveB.localeCompare(claveA) : claveA.localeCompare(claveB);
            });
    }, [reservas, verPasadas, filtroSucursal]);

    // Agrupamos por día para que se lea como una agenda.
    const reservasPorDia = useMemo(() => {
        const grupos = [];
        reservasFiltradas.forEach((r) => {
            const ultimo = grupos[grupos.length - 1];
            if (ultimo && ultimo.fecha === r.fecha) {
                ultimo.items.push(r);
            } else {
                grupos.push({ fecha: r.fecha, items: [r] });
            }
        });
        return grupos;
    }, [reservasFiltradas]);

    const handleCancelar = async (reserva) => {
        const nombre = `${reserva.cliente?.nombre || ""} ${reserva.cliente?.apellido || ""}`.trim();
        const horas = obtenerHorasDeReserva(reserva);

        const confirmado = window.confirm(
            `¿Cancelar el turno de ${nombre || "esta clienta"} del ${formatearFecha(reserva.fecha)} (${horas.join(", ")} hs)?\n\nSe borra la reserva y esos horarios vuelven a quedar libres.`
        );
        if (!confirmado) return;

        setCancelandoId(reserva.id);

        try {
            // Borramos la reserva y liberamos sus horarios en una sola operación:
            // o se hace todo, o no se hace nada.
            const batch = writeBatch(db);

            batch.delete(doc(db, "reservas", reserva.id));

            horas.forEach((hora) => {
                batch.delete(doc(db, "disponibilidad", generarIdDisponibilidad(reserva.fecha, reserva.sucursalId, hora)));
            });

            await batch.commit();

            setReservas((prev) => prev.filter((r) => r.id !== reserva.id));
            toast.success("Turno cancelado y horarios liberados.");
        } catch (err) {
            console.error(err);
            toast.error("No se pudo cancelar el turno: " + err.message);
        } finally {
            setCancelandoId(null);
        }
    };

    const estiloFiltro = (activo) => ({
        backgroundColor: activo ? ROSA : "#fff0f5",
        color: activo ? "#ffffff" : ROSA_OSCURO,
        border: "none"
    });

    return (
        <div className="card p-4 shadow-sm border rounded-4 bg-white">
            {/* Encabezado y filtros */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold m-0">
                    {verPasadas ? "Turnos pasados" : "Próximos turnos"} ({reservasFiltradas.length})
                </h5>

                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <button type="button" className="btn btn-sm rounded-pill px-3 fw-semibold" style={estiloFiltro(!verPasadas)} onClick={() => setVerPasadas(false)}>
                        Próximos
                    </button>
                    <button type="button" className="btn btn-sm rounded-pill px-3 fw-semibold" style={estiloFiltro(verPasadas)} onClick={() => setVerPasadas(true)}>
                        Pasados
                    </button>

                    {sucursales.length > 1 && (
                        <select className="form-select form-select-sm rounded-pill" style={{ width: "auto", borderColor: "#ece4e8" }} value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)}>
                            <option value="todas">Todas las sucursales</option>
                            {sucursales.map(([id, nombre]) => (
                                <option key={id} value={id}>
                                    {nombre}
                                </option>
                            ))}
                        </select>
                    )}

                    <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={cargarReservas} disabled={cargando}>
                        {cargando ? "Actualizando..." : "Actualizar"}
                    </button>
                </div>
            </div>

            {/* Listado */}
            {cargando && reservas.length === 0 ? (
                <p className="text-muted small m-0">Cargando reservas...</p>
            ) : reservasPorDia.length === 0 ? (
                <p className="text-muted small m-0">{verPasadas ? "No hay turnos pasados." : "No hay turnos reservados por ahora."}</p>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {reservasPorDia.map((grupo) => (
                        <div key={grupo.fecha}>
                            <div className="fw-bold text-uppercase small mb-2" style={{ color: ROSA_OSCURO, letterSpacing: "0.05em" }}>
                                {formatearFecha(grupo.fecha)}
                                {grupo.fecha === obtenerFechaLocal() && (
                                    <span className="badge rounded-pill ms-2" style={{ backgroundColor: ROSA, fontSize: "10px" }}>
                                        HOY
                                    </span>
                                )}
                            </div>

                            <div className="d-flex flex-column gap-2">
                                {grupo.items.map((reserva) => {
                                    const cliente = reserva.cliente || {};
                                    const horas = obtenerHorasDeReserva(reserva);
                                    const whatsapp = linkWhatsApp(cliente.telefono);

                                    return (
                                        <div key={reserva.id} className="p-3 rounded-3 border" style={{ borderColor: "#ece4e8", backgroundColor: "#fff9fb" }}>
                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                <div>
                                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                                        <span className="badge rounded-pill" style={{ backgroundColor: ROSA, fontSize: "12px" }}>
                                                            {horas.join(" · ")} hs
                                                        </span>
                                                        <span className="fw-bold">
                                                            {cliente.nombre} {cliente.apellido}
                                                        </span>
                                                    </div>
                                                    <div className="small text-muted mt-1">
                                                        📍 {reserva.sucursalNombre || reserva.sucursalId}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                    onClick={() => handleCancelar(reserva)}
                                                    disabled={cancelandoId === reserva.id}
                                                >
                                                    {cancelandoId === reserva.id ? "Cancelando..." : "Cancelar turno"}
                                                </button>
                                            </div>

                                            {/* Servicios */}
                                            <ul className="small mb-2 mt-2 ps-3">
                                                {(reserva.servicios || []).map((srv, i) => (
                                                    <li key={`${srv.id}-${i}`}>
                                                        {srv.name}
                                                        {srv.cantidad > 1 ? ` (x${srv.cantidad})` : ""}
                                                        {srv.hora ? ` — ${srv.hora} hs` : ""}
                                                        <span className="text-muted"> ({formatearMonto(srv.price)})</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Contacto y pago */}
                                            <div className="d-flex flex-wrap gap-3 small">
                                                {whatsapp ? (
                                                    <a href={whatsapp} target="_blank" rel="noreferrer" style={{ color: ROSA_OSCURO }}>
                                                        📱 {cliente.telefono}
                                                    </a>
                                                ) : (
                                                    <span>📱 {cliente.telefono}</span>
                                                )}
                                                {cliente.email && (
                                                    <a href={`mailto:${cliente.email}`} style={{ color: ROSA_OSCURO }}>
                                                        ✉️ {cliente.email}
                                                    </a>
                                                )}
                                                <span>
                                                    💰 Total <strong>{formatearMonto(reserva.total)}</strong>
                                                    {reserva.sena ? ` · Seña ${formatearMonto(reserva.sena)}` : ""}
                                                </span>
                                            </div>

                                            {cliente.notas && (
                                                <div className="small mt-2 p-2 rounded-2" style={{ backgroundColor: "#ffffff", border: "1px dashed #ece4e8" }}>
                                                    📝 {cliente.notas}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
