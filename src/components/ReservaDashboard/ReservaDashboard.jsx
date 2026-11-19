import { useParams, useLocation } from "react-router-dom";
import { useTurno } from "../../context/TurnoContext";
import { FaTimes, FaChevronRight } from "react-icons/fa";

import { ModalSucursal } from "../ModalSucursal/ModalSucursal";
import { CatalogoServicios } from "../CatalogoServicios/CatalogoServicios";
import { CalendarioTurnos } from "../CalendarioTurnos/CalendarioTurnos";
import { FormaPago } from "../FormaPago/FormaPago";
import { FormularioCliente } from "../FormularioCliente/FormularioCliente";

export const ReservaDashboard = () => {
    const { category } = useParams();
    const { pathname } = useLocation();

    const {
        paso,
        setPaso,
        serviciosSeleccionados,
        toggleServicio,
        getTotal,
        sucursal,
        setSucursal,
        fechaSeleccionada,
        horaSeleccionada
    } = useTurno();

    const seccionActual = category || pathname.replace(/^\/+/, "");
    const seccionProximamente = seccionActual === "unas" || seccionActual === "turnos";
    const esSeccionUnas = seccionActual === "unas";
    const mostrarModalSucursal = !seccionProximamente;

    const totalReserva = getTotal();
    const senaHoy = Math.round(totalReserva * 0.5);
    const minutosTotales = serviciosSeleccionados.reduce(
        (acc, s) => acc + Number(s.duration || 90),
        0
    );

    const formatearMoneda = (valor) => Number(valor || 0).toLocaleString("es-AR");

    return (
        <div className="container-fluid reserva-dashboard">
            {/* MODAL DE SELECCIÓN DE SUCURSAL */}
            {mostrarModalSucursal && <ModalSucursal />}

            {/* ENCABEZADO DE PERFECTANIAS */}
            <header className="perfectanias-header d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                    <img
                        src="https://i.ibb.co/JWgZFvtx/logo.png"
                        alt="Logo Perfectanias"
                        className="perfectanias-logo"
                        style={{ width: "68px", height: "68px", borderRadius: "16px", objectFit: "cover" }}
                    />

                    <div className="perfectanias-info">
                        <h1 className="h3 fw-bold mb-0">Perfectanias</h1>
                        <p className="perfectanias-subtitulo text-muted mb-1 small">
                            Reservá tu turno online
                        </p>
                        <div className="perfectanias-rating d-flex align-items-center gap-1 small">
                            <span className="text-dark">★★★★★</span>
                            <strong className="text-dark">5,0</strong>
                            <span className="text-muted">(2)</span>
                        </div>
                    </div>
                </div>

                {sucursal && !seccionProximamente && (
                    <button
                        type="button"
                        onClick={() => setSucursal(null)}
                        className="btn btn-sm btn-light border rounded-pill px-3 text-muted"
                    >
                        Sucursal: <strong className="text-dark">{sucursal.nombre}</strong> ▾
                    </button>
                )}
            </header>

            {seccionProximamente ? (
                <section className="perfectanias-proximamente">
                    <div className="proximamente-icono">{esSeccionUnas ? "💅" : "📅"}</div>
                    <h2>{esSeccionUnas ? "Uñas" : "Turnos"}</h2>
                    <div className="proximamente-decoracion">✨ ───────── ✨</div>
                    <h3>PRÓXIMAMENTE...</h3>
                    <p>
                        {esSeccionUnas
                            ? "Estamos preparando nuevos servicios para vos."
                            : "Pronto vas a poder consultar y administrar tus reservas."}
                    </p>
                </section>
            ) : (
                <div className="row g-4 mt-1">
                    {/* COLUMNA IZQUIERDA: CATÁLOGO SIEMPRE VISIBLE EN PASO 1 Y 2 */}
                    <div className="col-lg-8 col-md-7 col-12">
                        {(paso === 1 || paso === 2) && <CatalogoServicios />}
                        {paso === 3 && <CalendarioTurnos />}
                        {paso === 4 && <FormaPago />}
                        {paso === 5 && <FormularioCliente />}
                    </div>

                    {/* COLUMNA DERECHA: TU RESERVA */}
                    <div className="col-lg-4 col-md-5 col-12">
                        <div className="card p-4 shadow-sm border rounded-4 resumen-reserva bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h5 className="fw-bold m-0 fs-6">Tu reserva</h5>
                                {minutosTotales > 0 && (
                                    <span className="text-muted small">{minutosTotales} min</span>
                                )}
                            </div>

                            {/* SERVICIOS SELECCIONADOS */}
                            <div className="mb-3">
                                <span className="text-muted d-block small fw-semibold text-uppercase mb-2" style={{ fontSize: "11px" }}>
                                    Servicios ({serviciosSeleccionados.length})
                                </span>

                                {serviciosSeleccionados.length > 0 ? (
                                    <ul className="list-unstyled small mb-0">
                                        {serviciosSeleccionados.map((s) => (
                                            <li
                                                key={s.id}
                                                className="d-flex justify-content-between align-items-start gap-2 my-2 pb-2 border-bottom"
                                            >
                                                <div>
                                                    <div className="fw-semibold text-dark">{s.name}</div>
                                                    <span className="text-muted" style={{ fontSize: "11px" }}>
                                                        {s.duration || 90} min · ${formatearMoneda(s.price)}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleServicio(s)}
                                                    className="btn btn-sm p-0 text-muted"
                                                    title="Quitar servicio"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted small m-0">Ningún tratamiento seleccionado aún.</p>
                                )}
                            </div>

                            {/* SUCURSAL */}
                            {sucursal && (
                                <div className="small mb-3 pt-2 border-top">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                                            Sucursal
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSucursal(null)}
                                            className="btn btn-link btn-sm p-0 text-decoration-none"
                                            style={{ color: "#bd829d", fontSize: "12px" }}
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                    <strong className="text-dark d-block">{sucursal.nombre}</strong>
                                    {sucursal.direccion && (
                                        <span className="text-muted d-block" style={{ fontSize: "11px" }}>
                                            {sucursal.direccion}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* FECHA Y HORA */}
                            {fechaSeleccionada && (
                                <div className="small mb-3 pt-2 border-top">
                                    <span className="text-muted d-block fw-semibold text-uppercase mb-1" style={{ fontSize: "11px" }}>
                                        Cita programada
                                    </span>
                                    <strong className="text-dark">
                                        📅 {fechaSeleccionada} a las {horaSeleccionada} hs
                                    </strong>
                                </div>
                            )}

                            {/* TOTAL Y SEÑA */}
                            <div className="pt-3 border-top">
                                <div className="d-flex justify-content-between fw-bold fs-6 mb-1">
                                    <span>Total</span>
                                    <span>${formatearMoneda(totalReserva)}</span>
                                </div>
                                <div className="d-flex justify-content-between small text-muted mb-3">
                                    <span>Seña hoy (50%)</span>
                                    <strong className="text-dark">${formatearMoneda(senaHoy)}</strong>
                                </div>

                                {(paso === 1 || paso === 2) && (
                                    <button
                                        type="button"
                                        disabled={serviciosSeleccionados.length === 0}
                                        onClick={() => setPaso(3)}
                                        className="btn w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                                        style={{
                                            backgroundColor: serviciosSeleccionados.length > 0 ? "#e8b4c8" : "#f3e6ec",
                                            color: serviciosSeleccionados.length > 0 ? "#2c282c" : "#9e8c95",
                                            border: "none"
                                        }}
                                    >
                                        Continuar <FaChevronRight size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};