
import { useParams, useLocation } from "react-router-dom";
import { useTurno } from "../../context/TurnoContext";

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
        serviciosSeleccionados,
        getTotal,
        sucursal,
        fechaSeleccionada,
        horaSeleccionada
    } = useTurno();

    // Detectar la sección independientemente de la ruta utilizada
    const seccionActual = category || pathname.replace(/^\/+/, "");

    // Secciones que todavía no están disponibles
    const seccionProximamente =
        seccionActual === "unas" ||
        seccionActual === "turnos";

    const esSeccionUnas = seccionActual === "unas";
    const esSeccionTurnos = seccionActual === "turnos";

    // Ocultar modal de sucursal en las secciones próximamente
    const mostrarModalSucursal = !seccionProximamente;

    return (
        <div className="container-fluid reserva-dashboard">

            {/* MODAL DE SELECCIÓN DE SUCURSAL */}
            {mostrarModalSucursal && <ModalSucursal />}

            {/* ENCABEZADO DE PERFECTANIAS */}
            <header className="perfectanias-header">

                <img
                    src="https://i.ibb.co/JWgZFvtx/logo.png"
                    alt="Logo Perfectanias"
                    className="perfectanias-logo"
                />

                <div className="perfectanias-info">

                    <h1>Perfectanias</h1>

                    <p className="perfectanias-subtitulo">
                        Reservá tu turno online
                    </p>

                    <div className="perfectanias-rating">

                        <span className="perfectanias-estrellas">
                            ★★★★★
                        </span>

                        <span className="perfectanias-puntuacion">
                            5,0
                        </span>

                        <span className="text-muted small">
                            (2)
                        </span>

                    </div>

                </div>

            </header>

            {/* =====================================
                SECCIONES PRÓXIMAMENTE
            ===================================== */}

            {seccionProximamente ? (

                <section className="perfectanias-proximamente">

                    <div className="proximamente-icono">
                        {esSeccionUnas ? "💅" : "📅"}
                    </div>

                    <h2>
                        {esSeccionUnas ? "Uñas" : "Turnos"}
                    </h2>

                    <div className="proximamente-decoracion">
                        ✨ ───────── ✨
                    </div>

                    <h3>
                        PRÓXIMAMENTE...
                    </h3>

                    <p>
                        {esSeccionUnas
                            ? "Estamos preparando nuevos servicios para vos."
                            : "Pronto vas a poder consultar y administrar tus reservas."
                        }
                    </p>

                </section>

            ) : (

                /* =====================================
                   SISTEMA DE RESERVAS
                ===================================== */

                <div className="row g-4 mt-2">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="col-lg-8 col-md-7 col-12">

                        {/* CATÁLOGO */}
                        {(paso === 1 || paso === 2) && (
                            <CatalogoServicios />
                        )}

                        {/* PASO 3: CALENDARIO */}
                        {paso === 3 && (
                            <CalendarioTurnos />
                        )}

                        {/* PASO 4: FORMA DE PAGO */}
                        {paso === 4 && (
                            <FormaPago />
                        )}

                        {/* PASO 5: DATOS DEL CLIENTE */}
                        {paso === 5 && (
                            <FormularioCliente />
                        )}

                    </div>

                    {/* =====================================
                        COLUMNA DERECHA: RESUMEN
                    ===================================== */}

                    <div className="col-lg-4 col-md-5 col-12">

                        <div className="card p-3 shadow-sm border-0 rounded-3 resumen-reserva">

                            <h5 className="fw-bold mb-3 pb-2 border-bottom text-uppercase small">
                                Tu Reserva
                            </h5>

                            {/* SUCURSAL */}
                            {sucursal && (
                                <div className="small mb-2">

                                    <span className="text-muted d-block">
                                        Sucursal seleccionada:
                                    </span>

                                    <strong className="text-dark">
                                        {sucursal.nombre}
                                    </strong>

                                </div>
                            )}

                            {/* FECHA Y HORA */}
                            {fechaSeleccionada && (
                                <div className="small mb-3">

                                    <span className="text-muted d-block">
                                        Cita programada:
                                    </span>

                                    <strong className="text-dark">
                                        📅 {fechaSeleccionada} a las {horaSeleccionada} hs
                                    </strong>

                                </div>
                            )}

                            {/* SERVICIOS SELECCIONADOS */}
                            <div className="border-top pt-2">

                                <span className="text-muted d-block small mb-1">
                                    Servicios solicitados:
                                </span>

                                {serviciosSeleccionados.length > 0 ? (

                                    <ul className="list-unstyled small mb-0">

                                        {serviciosSeleccionados.map((s) => (

                                            <li
                                                key={s.id}
                                                className="d-flex justify-content-between my-1 text-secondary"
                                            >

                                                <span>
                                                    • {s.name}
                                                </span>

                                                <span className="fw-bold">
                                                    ${s.price}
                                                </span>

                                            </li>

                                        ))}

                                    </ul>

                                ) : (

                                    <p className="text-muted small m-0">
                                        Ningún tratamiento seleccionado aún.
                                    </p>

                                )}

                            </div>

                            {/* TOTAL */}
                            <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top">

                                <span>
                                    Total:
                                </span>

                                <span className="total-reserva">
                                    ${getTotal()}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};
