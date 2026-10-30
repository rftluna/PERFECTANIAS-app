// src/components/AppBooking/AppBooking.jsx
import React, { useState, useEffect } from "react";
import "./AppBooking.css";
import { SUCURSALES, DIAS_DISPONIBLES, HORARIOS, getServiciosFromDB } from "../../services/bookingService";
import { BranchModal } from "../BranchModal/BranchModal";
import { ServiceList } from "../ServiceList/ServiceList";
import { BookingSummary } from "../BookingSummary/BookingSummary";

export const AppBooking = () => {
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showBranchModal, setShowBranchModal] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [step, setStep] = useState(1);

    // Estado para almacenar los servicios que vienen de Firestore
    const [servicios, setServicios] = useState([]);

    // Cargar servicios desde Firestore al montar el componente
    useEffect(() => {
        getServiciosFromDB().then((data) => {
            setServicios(data);
        });
    }, []);

    const [clientData, setClientData] = useState({
        name: "",
        surname: "",
        phone: "",
        email: "",
        file: null
    });

    const handleSelectBranch = (branch) => {
        setSelectedBranch(branch);
        setShowBranchModal(false);
    };

    const handleNextStep = () => {
        if (step === 1 && selectedService) setStep(2);
        else if (step === 2 && selectedDay && selectedTime) setStep(3);
        else if (step === 3) setStep(4);
        else if (step === 4) {
            alert(`¡Turno reservado con éxito en ${selectedBranch?.name} para el ${selectedDay?.date} de ${selectedDay?.month} a las ${selectedTime}!`);
        }
    };

    return (
        <div className="perfectanias-container">
            {showBranchModal && <BranchModal sucursales={SUCURSALES} onSelectBranch={handleSelectBranch} />}

            <header className="header-perfectanias">
                <h1>Perfectanias</h1>
                <p>Reservá tu turno online</p>
                {selectedBranch && (
                    <button className="btn-change-branch" onClick={() => setShowBranchModal(true)}>
                        Sucursal: <strong>{selectedBranch.name}</strong> ✏️
                    </button>
                )}
            </header>

            <div className="booking-layout">
                <div className="booking-main">
                    {step === 1 && <ServiceList servicios={servicios} selectedService={selectedService} onSelectService={setSelectedService} />}

                    {step === 2 && (
                        <div className="step-datetime">
                            <h3>Elige día y horario</h3>
                            <p className="service-selected-label">
                                Servicio: <strong>{selectedService?.name}</strong>
                            </p>

                            <label className="input-label">Día</label>
                            <div className="days-grid">
                                {DIAS_DISPONIBLES.map((d, index) => (
                                    <div key={index} onClick={() => setSelectedDay(d)} className={`day-card ${selectedDay?.date === d.date ? "selected" : ""}`}>
                                        <span className="day-name">{d.day}</span>
                                        <strong className="day-number">{d.date}</strong>
                                        <span className="day-month">{d.month}</span>
                                    </div>
                                ))}
                            </div>

                            <label className="input-label">Horario</label>
                            <div className="hours-grid">
                                {HORARIOS.map((h, index) => (
                                    <button key={index} type="button" onClick={() => setSelectedTime(h)} className={`hour-btn ${selectedTime === h ? "selected" : ""}`}>
                                        {h}
                                    </button>
                                ))}
                            </div>

                            <button type="button" onClick={() => setStep(1)} className="btn-back">
                                Atrás
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-payment">
                            <h3>Forma de pago</h3>
                            <div className="payment-box">
                                🏦 <strong>Transferencia bancaria</strong>
                                <p className="payment-desc">Transferí ${selectedService?.deposit?.toLocaleString("es-AR")} y subí el comprobante para confirmar tu turno.</p>
                            </div>
                            <button type="button" onClick={() => setStep(2)} className="btn-back">
                                Atrás
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step-client">
                            <h3>Confirmar turno</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleNextStep();
                                }}
                                className="client-form"
                            >
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        required
                                        value={clientData.name}
                                        onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Apellido"
                                        required
                                        value={clientData.surname}
                                        onChange={(e) => setClientData({ ...clientData, surname: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Teléfono / WhatsApp"
                                    required
                                    value={clientData.phone}
                                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                                    className="form-input"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={clientData.email}
                                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                                    className="form-input"
                                />

                                <label className="file-label">Subir Comprobante de Transferencia:</label>
                                <input type="file" accept="image/*,.pdf" required onChange={(e) => setClientData({ ...clientData, file: e.target.files[0] })} />

                                <div className="form-actions">
                                    <button type="button" onClick={() => setStep(3)} className="btn-back">
                                        Atrás
                                    </button>
                                    <button type="submit" className="btn-pink">
                                        Confirmar Turno
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <BookingSummary selectedService={selectedService} selectedBranch={selectedBranch} selectedDay={selectedDay} selectedTime={selectedTime} step={step} onNext={handleNextStep} />
            </div>
        </div>
    );
};
