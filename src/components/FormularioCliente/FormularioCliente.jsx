import { useState } from "react";
import { Link } from "react-router-dom";
import { useTurno } from "../../context/TurnoContext";
import { Container, Form, Button, Row, Col, Spinner } from "react-bootstrap";

export const FormularioCliente = () => {
    const { datosCliente, setDatosCliente, finalizarReserva, setPaso, loading } = useTurno();
    const [aceptaTerminos, setAceptaTerminos] = useState(false);

    const elInputCambio = (e) => {
        const { name, value } = e.target;
        setDatosCliente({ ...datosCliente, [name]: value });
    };

    const procesarConfirmacion = (e) => {
        e.preventDefault();

        // Validación express de campos obligatorios
        if (!datosCliente.nombre.trim() || !datosCliente.apellido.trim() || !datosCliente.telefono.trim()) {
            alert("Por favor completa los campos obligatorios (Nombre, Apellido y Teléfono)");
            return;
        }

        if (!aceptaTerminos) {
            alert("Para confirmar el turno tenés que aceptar los Términos y condiciones y la Política de cancelación.");
            return;
        }

        finalizarReserva(); // Dispara el guardado seguro en Firestore
    };

    return (
        <Container fluid className="p-0">
            <h4 className="fw-bold mb-4" style={{ color: "#4a4a4a" }}>
                Tus datos personales
            </h4>

            <Form onSubmit={procesarConfirmacion} className="p-4 border rounded-3 bg-white shadow-sm">
                <Row className="g-3">
                    <Col sm={6} xs={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-secondary">Nombre *</Form.Label>
                            <Form.Control type="text" name="nombre" value={datosCliente.nombre} onChange={elInputCambio} required />
                        </Form.Group>
                    </Col>

                    <Col sm={6} xs={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-secondary">Apellido *</Form.Label>
                            <Form.Control type="text" name="apellido" value={datosCliente.apellido} onChange={elInputCambio} required />
                        </Form.Group>
                    </Col>

                    <Col sm={6} xs={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-secondary">Teléfono de contacto *</Form.Label>
                            <Form.Control type="tel" name="telefono" placeholder="Ej: 1122334455" value={datosCliente.telefono} onChange={elInputCambio} required />
                        </Form.Group>
                    </Col>

                    <Col sm={6} xs={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-secondary">Correo electrónico</Form.Label>
                            <Form.Control type="email" name="email" placeholder="nombre@correo.com" value={datosCliente.email} onChange={elInputCambio} />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-secondary">Notas / Indicaciones para las chicas</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notas"
                                placeholder="Si tenés alguna alergia o indicación especial, anotala acá..."
                                value={datosCliente.notas}
                                onChange={elInputCambio}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* ACEPTACIÓN DE TÉRMINOS Y AVISO DE PRIVACIDAD */}
                <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: "#fff7fa", border: "1px solid #f1e3e9" }}>
                    <Form.Check
                        id="acepta-terminos"
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        required
                        label={
                            <span className="small">
                                Leí y acepto los{" "}
                                <Link to="/legales/terminos" target="_blank" style={{ color: "#bd829d", fontWeight: 600 }}>
                                    Términos y condiciones
                                </Link>{" "}
                                y la{" "}
                                <Link to="/legales/cancelacion" target="_blank" style={{ color: "#bd829d", fontWeight: 600 }}>
                                    Política de cancelación
                                </Link>
                                . *
                            </span>
                        }
                    />
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: "12px" }}>
                        Usamos tus datos solo para gestionar tu turno y contactarte sobre él. Más info en la{" "}
                        <Link to="/legales/privacidad" target="_blank" style={{ color: "#bd829d" }}>
                            Política de privacidad
                        </Link>
                        .
                    </p>
                </div>

                {/* Botones de acción final dentro del formulario */}
                <div className="d-flex justify-content-between mt-4 border-top pt-3">
                    <Button type="button" variant="outline-secondary" className="fw-bold px-4 rounded-pill text-dark" onClick={() => setPaso(4)} disabled={loading} style={{ borderColor: "#d4a3b8" }}>
                        Volver
                    </Button>

                    <Button type="submit" className="fw-bold px-5 rounded-pill border-0 shadow-sm" style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }} disabled={loading || !aceptaTerminos}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Validando cupos...
                            </>
                        ) : (
                            "Confirmar reserva 📌"
                        )}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};
