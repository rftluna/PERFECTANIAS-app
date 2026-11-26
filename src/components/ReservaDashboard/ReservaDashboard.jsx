import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTurno } from "../../context/TurnoContext";
import { FaTimes, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";

import { ModalSucursal } from "../ModalSucursal/ModalSucursal";
import { CatalogoServicios } from "../CatalogoServicios/CatalogoServicios";
import { CalendarioTurnos } from "../CalendarioTurnos/CalendarioTurnos";
import { FormaPago } from "../FormaPago/FormaPago";
import { FormularioCliente } from "../FormularioCliente/FormularioCliente";
import { ResenasGoogle } from "../ResenasGoogle/ResenasGoogle";
import { NotFound } from "../NotFound/NotFound";
import { SENA_TEXTO, duracionDe, formatearMoneda, seccionDe } from "../../utils/servicios";
import { useMetaPagina } from "../../utils/useMetaPagina";

// Configuración de cada pestaña pública: título del catálogo y datos para SEO.
const PAGINAS = {
    inicio: {
        seccion: null,
        tituloCatalogo: "Elegí servicios",
        tituloPagina: "Pestañas y uñas: reservá tu turno online",
        descripcion: "Reservá tu turno online en Perfectanias: extensiones de pestañas, modelado y tratamientos en Isidro Casanova, Morón y Ramos Mejía.",
        ruta: "/"
    },
    pestanas: {
        seccion: "pestanas",
        tituloCatalogo: "Elegí servicios de pestañas y cejas",
        tituloPagina: "Pestañas y cejas",
        descripcion: "Extensiones, lifting y tratamientos de pestañas y cejas en Perfectanias. Mirá precios, duración y seña, y reservá tu turno online.",
        ruta: "/category/pestanas"
    },
    unas: {
        seccion: "unas",
        tituloCatalogo: "Elegí servicios de uñas",
        tituloPagina: "Uñas",
        descripcion: "Servicios de uñas en Perfectanias. Reservá tu turno online.",
        ruta: "/category/unas"
    },
    turnos: {
        seccion: null,
        tituloPagina: "Mis turnos",
        descripcion: "Consultá y administrá tus turnos en Perfectanias.",
        ruta: "/turnos"
    }
};

export const ReservaDashboard = () => {
    const { category } = useParams();
    const { pathname } = useLocation();

    const { paso, setPaso, serviciosSeleccionados, toggleServicio, getTotal, getSena, sucursal, setSucursal, fechaSeleccionada, horaSeleccionada, servicios, cargandoServicios } = useTurno();

    const seccionActual = category || pathname.replace(/^\/+/, "") || "inicio";
    const pagina = PAGINAS[seccionActual];

    useMetaPagina(pagina?.tituloPagina || "Página no encontrada", pagina?.descripcion, pagina?.ruta);

    // Al cambiar de pestaña se vuelve al catálogo (la selección de servicios se conserva).
    useEffect(() => {
        setPaso((pasoActual) => (pasoActual > 2 ? 1 : pasoActual));
    }, [seccionActual, setPaso]);

    const esSeccionUnas = seccionActual === "unas";
    // Uñas queda en "Próximamente" hasta que se cargue al menos un servicio de esa sección desde el panel.
    const hayServiciosUnas = servicios.some((s) => seccionDe(s) === "unas");
    const seccionProximamente = seccionActual === "turnos" || (esSeccionUnas && !cargandoServicios && !hayServiciosUnas);
    const mostrarModalSucursal = !seccionProximamente;

    const cantidadTotalServicios = serviciosSeleccionados.reduce((acc, s) => acc + Math.max(1, Number(s.cantidad || 1)), 0);
    const totalReserva = getTotal();
    const senaHoy = getSena();
    const minutosTotales = serviciosSeleccionados.reduce((acc, s) => acc + duracionDe(s) * Math.max(1, Number(s.cantidad || 1)), 0);

    // /category/<cualquier-cosa> que no sea una pestaña real muestra la 404.
    if (!pagina) {
        return <NotFound />;
    }

    const handleCompartir = async () => {
        const urlActual = window.location.href;
        const textoCompartir = sucursal ? `Reservá tu turno en Perfectanias (${sucursal.nombre}):` : "Reservá tu turno online en Perfectanias:";

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Perfectanias",
                    text: textoCompartir,
                    url: urlActual
                });
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error al compartir:", error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(urlActual);
                toast.info("🔗 Enlace copiado al portapapeles.");
            } catch {
                toast.info("🔗 Copiá el enlace desde la barra del navegador.");
            }
        }
    };

    return (
        <div className="container-fluid reserva-dashboard">
            {/* MODAL DE SELECCIÓN DE SUCURSAL */}
            {mostrarModalSucursal && <ModalSucursal />}

            {/* ENCABEZADO DE PERFECTANIAS */}
            <header className="perfectanias-header d-flex align-items-start justify-content-between flex-wrap gap-3 pb-3 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                    <img
                        src="https://i.ibb.co/JWgZFvtx/logo.png"
                        alt="Logo Perfectanias"
                        className="perfectanias-logo"
                        style={{ width: "68px", height: "68px", borderRadius: "16px", objectFit: "cover" }}
                    />

                    <div className="perfectanias-info">
                        <h1 className="h3 fw-bold mb-0">Perfectanias</h1>
                        <p className="perfectanias-subtitulo text-muted mb-1 small">Reservá tu turno online</p>
                        {/* Puntaje y reseñas de Google (se editan desde /admin → Reseñas) */}
                        <ResenasGoogle />
                    </div>
                </div>

                {/* BOTÓN COMPARTIR + SELECTOR DE SUCURSAL */}
                {!seccionProximamente && (
                    <div className="d-flex flex-column align-items-end gap-2">
                        <button
                            type="button"
                            onClick={handleCompartir}
                            title="Compartir enlace"
                            aria-label="Compartir enlace"
                            className="btn rounded-circle d-flex align-items-center justify-content-center shadow-sm p-0"
                            style={{
                                width: "42px",
                                height: "42px",
                                border: "1px solid #ece4e8",
                                backgroundColor: "#ffffff",
                                color: "#221f22"
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#221f22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>

                        {sucursal && (
                            <button type="button" onClick={() => setSucursal(null)} className="btn btn-sm btn-link text-decoration-none p-0 text-dark">
                                <span className="text-muted">Sucursal:</span> <strong>{sucursal.nombre}</strong> ▾
                            </button>
                        )}
                    </div>
                )}
            </header>

            {seccionProximamente ? (
                <section className="perfectanias-proximamente">
                    <div className="proximamente-icono">{esSeccionUnas ? "💅" : "📅"}</div>
                    <h2>{esSeccionUnas ? "Uñas" : "Turnos"}</h2>
                    <div className="proximamente-decoracion">✨ ───────── ✨</div>
                    <h3>PRÓXIMAMENTE...</h3>
                    <p>{esSeccionUnas ? "Estamos preparando nuevos servicios para vos." : "Pronto vas a poder consultar y administrar tus reservas."}</p>
                </section>
            ) : (
                <div className="row g-4 mt-1">
                    {/* COLUMNA IZQUIERDA */}
                    <div className="col-lg-8 col-md-7 col-12">
                        {(paso === 1 || paso === 2) && <CatalogoServicios key={seccionActual} seccion={pagina.seccion} titulo={pagina.tituloCatalogo} />}
                        {paso === 3 && <CalendarioTurnos />}
                        {paso === 4 && <FormaPago />}
                        {paso === 5 && <FormularioCliente />}
                    </div>

                    {/* COLUMNA DERECHA: TU RESERVA */}
                    <div className="col-lg-4 col-md-5 col-12">
                        <div className="card p-4 shadow-sm border rounded-4 resumen-reserva bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h5 className="fw-bold m-0 fs-6">Tu reserva</h5>
                                {minutosTotales > 0 && <span className="text-muted small">{minutosTotales} min</span>}
                            </div>

                            {/* SERVICIOS SELECCIONADOS */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                                        Servicios
                                    </span>

                                    {cantidadTotalServicios > 0 && (
                                        <span
                                            className="badge rounded-pill"
                                            style={{
                                                backgroundColor: "#d4a3b8",
                                                color: "#ffffff",
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                padding: "3px 8px"
                                            }}
                                        >
                                            {cantidadTotalServicios}
                                        </span>
                                    )}
                                </div>

                                {serviciosSeleccionados.length > 0 ? (
                                    <ul className="list-unstyled small mb-0">
                                        {serviciosSeleccionados.map((s) => {
                                            const cant = Math.max(1, Number(s.cantidad || 1));
                                            const subtotal = Number(s.price || 0) * cant;
                                            return (
                                                <li key={s.id} className="d-flex justify-content-between align-items-start gap-2 my-2 pb-2 border-bottom">
                                                    <div>
                                                        <div className="fw-semibold text-dark">
                                                            {s.name} {cant > 1 ? `(x${cant})` : ""}
                                                        </div>
                                                        <span className="text-muted" style={{ fontSize: "11px" }}>
                                                            {duracionDe(s)} min · ${formatearMoneda(subtotal)}
                                                        </span>
                                                    </div>
                                                    <button type="button" onClick={() => toggleServicio(s)} className="btn btn-sm p-0 text-muted" title="Quitar servicio">
                                                        <FaTimes />
                                                    </button>
                                                </li>
                                            );
                                        })}
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
                                        <button type="button" onClick={() => setSucursal(null)} className="btn btn-link btn-sm p-0 text-decoration-none" style={{ color: "#bd829d", fontSize: "12px" }}>
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
                                    <span>Seña hoy ({SENA_TEXTO})</span>
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
