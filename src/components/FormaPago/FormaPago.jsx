import { useTurno } from "../../context/TurnoContext";
import { Container, Form, Card, Button } from "react-bootstrap";
import { FaUniversity, FaMoneyBillWave } from "react-icons/fa";

export const FormaPago = () => {
    const { formaPago, setFormaPago, setPaso, getTotal } = useTurno();

    return (
        <Container fluid className="p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Elige la forma de pago
            </h4>

            <div className="d-flex flex-column gap-3 mb-4">
                {/* OPCIÓN 1: TRANSFERENCIA */}
                <Card
                    className={`p-3 border rounded-3 cursor-pointer shadow-sm ${formaPago === "Transferencia bancaria" ? "bg-light border-dark" : ""}`}
                    onClick={() => setFormaPago("Transferencia bancaria")}
                    style={{ cursor: "pointer", borderColor: formaPago === "Transferencia bancaria" ? "#d4a3b8" : "#fff0f5" }}
                >
                    <div className="d-flex align-items-start gap-3">
                        <Form.Check type="radio" name="pago" checked={formaPago === "Transferencia bancaria"} onChange={() => setFormaPago("Transferencia bancaria")} className="mt-1" />
                        <div className="w-100">
                            <strong className="d-flex align-items-center gap-2 text-dark">
                                <FaUniversity style={{ color: "#d4a3b8" }} /> Transferencia bancaria
                            </strong>
                            <p className="text-muted small m-0 mt-1">
                                Se requiere abonar una seña de <strong>$15.000</strong> para congelar el turno.
                            </p>

                            {formaPago === "Transferencia bancaria" && (
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
                            )}
                        </div>
                    </div>
                </Card>

                {/* OPCIÓN 2: EFECTIVO */}
                <Card
                    className={`p-3 border rounded-3 cursor-pointer shadow-sm ${formaPago === "Efectivo" ? "bg-light border-dark" : ""}`}
                    onClick={() => setFormaPago("Efectivo")}
                    style={{ cursor: "pointer", borderColor: formaPago === "Efectivo" ? "#d4a3b8" : "#fff0f5" }}
                >
                    <div className="d-flex align-items-start gap-3">
                        <Form.Check type="radio" name="pago" checked={formaPago === "Efectivo"} onChange={() => setFormaPago("Efectivo")} className="mt-1" />
                        <div>
                            <strong className="d-flex align-items-center gap-2 text-dark">
                                <FaMoneyBillWave style={{ color: "#d4a3b8" }} /> Efectivo en el local
                            </strong>
                            <p className="text-muted small m-0 mt-1">
                                Abona el total de <strong>${getTotal()}</strong> de manera presencial al finalizar el servicio.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Navegación */}
            <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" className="fw-bold px-4 rounded-pill text-dark" onClick={() => setPaso(3)} style={{ borderColor: "#d4a3b8" }}>
                    Volver
                </Button>

                <Button
                    className="fw-bold px-4 rounded-pill border-0 shadow-sm"
                    style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }}
                    onClick={() => setPaso(5)} // Avanza al Formulario del Cliente
                >
                    Siguiente paso ➔
                </Button>
            </div>
        </Container>
    );
};
