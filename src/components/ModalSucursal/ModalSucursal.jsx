import { useState, useEffect } from "react";
import { Modal, ListGroup } from "react-bootstrap";
import { useTurno } from "../../context/TurnoContext";
import { FaMapMarkerAlt } from "react-icons/fa";

export const ModalSucursal = () => {
    const { setSucursal, setPaso, sucursal } = useTurno();
    const [showSplash, setShowSplash] = useState(true);

    // Temporizador de 3 segundos para la animación mágica inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000); // 3 segundos exactos
        return () => clearTimeout(timer);
    }, []);

    // El modal se muestra si no hay sucursal seleccionada
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
        <>
            {/* Estilos inline incrustados para la animación mágica */}
            <style>
                {`
                    @keyframes magicEntryCustom {
                        0% {
                            opacity: 0;
                            transform: scale(0.5) rotate(-10deg);
                            filter: drop-shadow(0 0 0px rgba(212, 163, 184, 0));
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.1) rotate(3deg);
                            filter: drop-shadow(0 0 20px rgba(212, 163, 184, 0.9)) brightness(1.2);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1) rotate(0deg);
                            filter: drop-shadow(0 0 10px rgba(212, 163, 184, 0.5));
                        }
                    }
                    .logo-magic-anim {
                        animation: magicEntryCustom 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    }
                `}
            </style>

            <Modal show={show} centered backdrop="static" keyboard={false} className="modal-perfectanias">
                <Modal.Body className="p-4 text-center" style={{ backgroundColor: "#ffffff", borderRadius: "16px" }}>
                    {showSplash ? (
                        /* FASE 1: Logo duplicado de tamaño y texto en rosa */
                        <div className="py-5 splash-container d-flex flex-column align-items-center justify-content-center">
                            <img
                                src="https://i.ibb.co/JWgZFvtx/logo.png"
                                alt="Perfectanias Logo"
                                className="logo-magic-anim mb-3 img-fluid shadow-sm"
                                style={{ width: "240px", height: "240px", objectFit: "contain", borderRadius: "50%" }}
                            />
                            <h4 className="fw-bold mt-3" style={{ letterSpacing: "1.5px", color: "#d4a3b8" }}>
                                PERFECTANIAS
                            </h4>
                            <p className="text-muted small mt-1">Preparando tu experiencia...</p>
                        </div>
                    ) : (
                        /* FASE 2: Muestra las 3 sucursales */
                        <div className="fade-in">
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
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};
