import { useTurno } from "../../context/TurnoContext";
// Importamos todos los pasos lógicos de PERFECTANIAS sin usar react-bootstrap
import { ModalSucursal } from "../ModalSucursal/ModalSucursal";
import { CatalogoServicios } from "../CatalogoServicios/CatalogoServicios";
import { CalendarioTurnos } from "../CalendarioTurnos/CalendarioTurnos";
import { FormaPago } from "../FormaPago/FormaPago";
import { FormularioCliente } from "../FormularioCliente/FormularioCliente";

export const ReservaDashboard = () => {
    const { paso, serviciosSeleccionados, getTotal, sucursal, fechaSeleccionada, horaSeleccionada } = useTurno();

    return (
        <div className="container-fluid my-4 px-4" style={{ minHeight: "75vh" }}>
            {/* PASO 1: Modal flotante seguro */}
            <ModalSucursal />

            <div className="row g-4">
                {/* COLUMNA IZQUIERDA: COMPONENTE DINÁMICO DE LOS PASOS DE IARA (70%) */}
                <div className="col-lg-8 col-md-7 col-12">
                    {paso === 1 && (
                        <div className="text-center py-5">
                            <h4 className="fw-bold" style={{ color: "#d4a3b8" }}>
                                ✨ Bienvenido a Perfectanias ✨
                            </h4>
                            <p className="text-secondary small">Por favor, selecciona una sucursal en el panel flotante para comenzar tu reserva.</p>
                        </div>
                    )}
                    {paso === 2 && <CatalogoServicios />}
                    {paso === 3 && <CalendarioTurnos />}
                    {paso === 4 && <FormaPago />}
                    {paso === 5 && <FormularioCliente />}
                </div>

                {/* COLUMNA DERECHA: RESUMEN FIJO DE LA RESERVA (30%) */}
                <div className="col-lg-4 col-md-5 col-12 border-start ps-lg-4">
                    <div className="card p-3 shadow-sm border-0 rounded-3" style={{ backgroundColor: "#fff5f7" }}>
                        <h5 className="fw-bold mb-3 pb-2 border-bottom text-uppercase tracking-wider small" style={{ color: "#d4a3b8" }}>
                            Tu Reserva
                        </h5>

                        {sucursal && (
                            <div className="small mb-2">
                                <span className="text-muted d-block small">Sucursal seleccionada:</span>
                                <strong className="text-dark">{sucursal.nombre}</strong>
                            </div>
                        )}

                        {fechaSeleccionada && (
                            <div className="small mb-3">
                                <span className="text-muted d-block small">Cita programada:</span>
                                <strong className="text-dark">
                                    📅 {fechaSeleccionada} a las {horaSeleccionada} hs
                                </strong>
                            </div>
                        )}

                        <div className="border-top pt-2">
                            <span className="text-muted d-block small mb-1">Servicios solicitados:</span>
                            {serviciosSeleccionados.length > 0 ? (
                                <ul className="list-unstyled small mb-0">
                                    {serviciosSeleccionados.map((s) => (
                                        <li key={s.id} className="d-flex justify-content-between my-1 text-secondary">
                                            <span>• {s.name}</span>
                                            <span className="fw-bold">${s.price}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted small italic m-0">Ningún tratamiento seleccionado aún.</p>
                            )}
                        </div>

                        <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top" style={{ color: "#4a4a4a" }}>
                            <span>Total:</span>
                            <span style={{ color: "#d4a3b8" }}>${getTotal()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
