import { Modal, ListGroup } from "react-bootstrap";
import { useTurno } from "../../context/TurnoContext";
import { FaMapMarkerAlt } from "react-icons/fa";

export const ModalSucursal = () => {
    const { setSucursal, setPaso, sucursal } = useTurno();

    // 🔥 CORRECCIÓN DEFINITIVA: En lugar de un useState estático,
    // el modal se muestra dinámicamente si no hay ninguna sucursal seleccionada
    const show = !sucursal;

    const listaSucursales = [
        { id: "casanova", nombre: "Isidro Casanova", direccion: "República de Portugal 2812, Isidro Casanova, Provincia de Buenos Aires" },
        { id: "moron", nombre: "Morón", direccion: "Dr. José María Casullo 231, Morón, Provincia de Buenos Aires" },
        { id: "ramos", nombre: "Ramos Mejía", direccion: "Avenida de Mayo 546, Ramos Mejía, Provincia de Buenos Aires" }
    ];

    const elegirLocal = (local) => {
        setSucursal(local);
        setPaso(2);
    };

    return (
        <Modal show={show} centered backdrop="static" keyboard={false} className="modal-perfectanias">
            <Modal.Body className="p-4 text-center" style={{ backgroundColor: "#ffffff", borderRadius: "16px" }}>
                <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                    style={{ width: "60px", height: "60px", backgroundColor: "#fff0f5", border: "1px solid #d4a3b8" }}
                >
                    <span style={{ fontSize: "1.5rem" }}>✨</span>
                </div>

                <h5 className="fw-bold mb-4 text-dark" style={{ letterSpacing: "0.5px" }}>
                    ¡Elige la sucursal!
                </h5>

                <ListGroup variant="flush" className="gap-2">
                    {listaSucursales.map((local) => (
                        <ListGroup.Item
                            key={local.id}
                            action
                            onClick={() => elegirLocal(local)}
                            className="p-3 border rounded-3 text-start transition-all btn-sucursal-item shadow-sm"
                            style={{
                                cursor: "pointer",
                                borderColor: "#fff0f5",
                                transition: "all 0.2s ease-in-out"
                            }}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <FaMapMarkerAlt className="mt-1" style={{ color: "#d4a3b8", flexShrink: 0 }} />
                                <div>
                                    <strong className="d-block text-dark fs-6">{local.nombre}</strong>
                                    <small className="text-muted d-block mt-1" style={{ fontSize: "11px", lineHeight: "1.3" }}>
                                        {local.direccion}
                                    </small>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
};
