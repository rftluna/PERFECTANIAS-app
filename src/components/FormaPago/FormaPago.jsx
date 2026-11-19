import { useEffect } from "react";
import { useTurno } from "../../context/TurnoContext";
import { Container, Form, Card, Button } from "react-bootstrap";
import { FaUniversity } from "react-icons/fa";

export const FormaPago = () => {
    const { formaPago, setFormaPago, setPaso, getTotal } = useTurno();

    useEffect(() => {
        if (formaPago !== "Transferencia bancaria") {
            setFormaPago("Transferencia bancaria");
        }
    }, [formaPago, setFormaPago]);

    const totalReserva = getTotal();
    const senaCincuentaPorCiento = Math.round(totalReserva * 0.5);
    const formatearMoneda = (valor) => Number(valor || 0).toLocaleString("es-AR");

    return (
        <Container fluid className="p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Elige la forma de pago
            </h4>

            <div className="d-flex flex-column gap-3 mb-4">
                {/* ÚNICA OPCIÓN: TRANSFERENCIA BANCARIA (SEÑA 50%) */}
                <Card className="p-3 border rounded-3 shadow-sm bg-light" onClick={() => setFormaPago("Transferencia bancaria")} style={{ cursor: "pointer", borderColor: "#d4a3b8" }}>
                    <div className="d-flex align-items-start gap-3">
                        <Form.Check type="radio" name="pago" checked={true} onChange={() => setFormaPago("Transferencia bancaria")} className="mt-1" />
                        <div className="w-100">
                            <strong className="d-flex align-items-center gap-2 text-dark">
                                <FaUniversity style={{ color: "#d4a3b8" }} /> Transferencia bancaria
                            </strong>
                            <p className="text-muted small m-0 mt-1">
                                Se requiere abonar el <strong>50% por transferencia para reservar el turno</strong> (<strong>${formatearMoneda(senaCincuentaPorCiento)}</strong> sobre un total de $
                                {formatearMoneda(totalReserva)}).
                            </p>

                            <div className="mt-3 p-3 bg-white rounded border border-dashed small text-secondary">
                                <p className="mb-1">
                                    <strong>Banco:</strong> Galicia
                                </p>
                                <p className="mb-1">
                                    <strong>Alias:</strong> perfectanias.iara
                                </p>
                                <p className="mb-0">
                                    <strong>Titular:</strong> Iara Sanchez
                                </p>
                                <small className="text-danger d-block mt-2 fw-bold">* Enviar el comprobante por WhatsApp una vez realizada la transferencia.</small>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Navegación */}
            <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill text-dark" onClick={() => setPaso(3)} style={{ borderColor: "#d4a3b8" }}>
                    Volver
                </Button>

                <Button className="fw-bold px-4 rounded-pill border-0 shadow-sm" style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }} onClick={() => setPaso(5)}>
                    Siguiente paso ➔
                </Button>
            </div>
        </Container>
    );
};
