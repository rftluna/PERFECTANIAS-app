import { createContext, useContext, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

const TurnoContext = createContext();

export const useTurno = () => {
    const context = useContext(TurnoContext);
    if (!context) {
        throw new Error("useTurno debe usarse dentro de un TurnoProvider");
    }
    return context;
};

export const TurnoProvider = ({ children }) => {
    const [paso, setPaso] = useState(1);
    const [sucursal, setSucursal] = useState(null);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState("");
    const [horaSeleccionada, setHoraSeleccionada] = useState("");
    const [asignacionesPorHora, setAsignacionesPorHora] = useState({});
    const [formaPago, setFormaPago] = useState("Transferencia bancaria");
    const [datosCliente, setDatosCliente] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        notas: ""
    });
    const [loading, setLoading] = useState(false);

    const getTotal = () => serviciosSeleccionados.reduce((sum, s) => sum + Number(s.price || 0) * Number(s.cantidad || 1), 0);

    const getCantidadServicio = (servicioId) => {
        const encontrado = serviciosSeleccionados.find((s) => s.id === servicioId);
        return encontrado ? Number(encontrado.cantidad || 1) : 0;
    };

    const toggleServicio = (servicio) => {
        setServiciosSeleccionados((prev) => {
            const existe = prev.some((s) => s.id === servicio.id);
            if (existe) {
                setAsignacionesPorHora((horasPrev) => {
                    const actualizado = { ...horasPrev };
                    Object.keys(actualizado).forEach((horaKey) => {
                        if (actualizado[horaKey]?.id === servicio.id) {
                            delete actualizado[horaKey];
                        }
                    });
                    return actualizado;
                });
                return prev.filter((s) => s.id !== servicio.id);
            }
            return [...prev, { ...servicio, cantidad: 1 }];
        });
    };

    const ajustarCantidadServicio = (servicio, cambio) => {
        setServiciosSeleccionados((prev) => {
            const indice = prev.findIndex((s) => s.id === servicio.id);

            if (indice === -1) {
                if (cambio > 0) {
                    return [...prev, { ...servicio, cantidad: 1 }];
                }
                return prev;
            }

            const actual = Number(prev[indice].cantidad || 1);
            const nuevaCantidad = actual + cambio;

            if (nuevaCantidad <= 0) {
                setAsignacionesPorHora((horasPrev) => {
                    const actualizado = { ...horasPrev };
                    Object.keys(actualizado).forEach((horaKey) => {
                        if (actualizado[horaKey]?.id === servicio.id) {
                            delete actualizado[horaKey];
                        }
                    });
                    return actualizado;
                });
                return prev.filter((s) => s.id !== servicio.id);
            }

            const copia = [...prev];
            copia[indice] = { ...copia[indice], cantidad: nuevaCantidad };
            return copia;
        });
    };

    // Asigna 1 servicio a 1 hora (o libera la hora si servicio es null)
    const asignarServicioAHora = (hora, servicio) => {
        if (!hora) return;

        const siguiente = { ...asignacionesPorHora };

        if (!servicio) {
            delete siguiente[hora];
            setAsignacionesPorHora(siguiente);
            const restantes = Object.keys(siguiente).sort();
            setHoraSeleccionada(restantes[0] || "");
            return;
        }

        Object.keys(siguiente).forEach((horaKey) => {
            const mismoSlot = servicio.slotKey && siguiente[horaKey]?.slotKey === servicio.slotKey;
            const mismoServicioSinSlot = !servicio.slotKey && siguiente[horaKey]?.id === servicio.id;
            if (mismoSlot || mismoServicioSinSlot) {
                delete siguiente[horaKey];
            }
        });

        siguiente[hora] = {
            slotKey: servicio.slotKey || `${servicio.id}`,
            id: servicio.id,
            name: servicio.name,
            price: Number(servicio.price || 0),
            duration: servicio.duration ?? null
        };

        setAsignacionesPorHora(siguiente);
        const horasOrdenadas = Object.keys(siguiente).sort();
        setHoraSeleccionada(horasOrdenadas[0] || hora);
    };

    const verificarDisponibilidadHora = async (fecha, hora, sucursalId) => {
        try {
            if (!db) return true;
            const turnosRef = collection(db, "reservas");
            const q = query(turnosRef, where("fecha", "==", fecha), where("hora", "==", hora), where("sucursalId", "==", sucursalId));
            const snapshot = await getDocs(q);
            return snapshot.empty;
        } catch (error) {
            console.warn("Firebase offline o reintentando, simulando cupo libre para desarrollo.");
            return true;
        }
    };

    const finalizarReserva = async () => {
        setLoading(true);
        const disponible = await verificarDisponibilidadHora(fechaSeleccionada, horaSeleccionada, sucursal.id);

        if (!disponible) {
            toast.error("😢 Lo sentimos, este horario se acaba de ocupar.");
            setLoading(false);
            return;
        }

        try {
            const serviciosOrdenadosPorHora =
                Object.keys(asignacionesPorHora).length > 0
                    ? Object.entries(asignacionesPorHora)
                          .sort(([horaA], [horaB]) => horaA.localeCompare(horaB))
                          .map(([hora, srv]) => ({
                              hora,
                              id: srv.id,
                              name: srv.name,
                              price: srv.price,
                              duration: srv.duration
                          }))
                    : serviciosSeleccionados.map((s) => ({
                          hora: horaSeleccionada,
                          id: s.id,
                          name: s.name,
                          price: s.price,
                          cantidad: Number(s.cantidad || 1)
                      }));

            const totalCalculado = getTotal();
            const senaCalculada = Math.round(totalCalculado * 0.5);
            const formatearMonto = (num) => Number(num || 0).toLocaleString("es-AR");
            const emailDestino = (datosCliente?.email || "").trim();

            const nuevoTurno = {
                sucursalId: sucursal.id,
                sucursalNombre: sucursal.nombre,
                servicios: serviciosOrdenadosPorHora,
                asignacionesPorHora,
                fecha: fechaSeleccionada,
                hora: horaSeleccionada,
                formaPago: "Transferencia bancaria",
                cliente: {
                    ...datosCliente,
                    email: emailDestino
                },
                total: totalCalculado,
                sena: senaCalculada,
                createdAt: new Date().toISOString()
            };

            if (db) {
                await addDoc(collection(db, "reservas"), nuevoTurno);
            }

            // Envío de confirmación por email con EmailJS
            const serviceId = (import.meta.env.VITE_EMAILJS_SERVICE_ID || "").trim();
            const templateId = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "").trim();
            const publicKey = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "").trim();

            const resumenServiciosTexto = serviciosOrdenadosPorHora
                .map((item) => {
                    const cant = item.cantidad ? ` (x${item.cantidad})` : "";
                    const horarioItem = item.hora ? ` - ${item.hora} hs` : "";
                    return `• ${item.name}${cant}${horarioItem} ($${formatearMonto(item.price)})`;
                })
                .join("\n");

            if (emailDestino && serviceId && templateId && publicKey) {
                try {
                    await emailjs.send(
                        serviceId,
                        templateId,
                        {
                            to_email: emailDestino,
                            cliente_nombre: `${datosCliente.nombre || ""} ${datosCliente.apellido || ""}`.trim(),
                            sucursal_nombre: sucursal?.nombre || "",
                            fecha: fechaSeleccionada,
                            hora: horaSeleccionada,
                            servicios_detalle: resumenServiciosTexto,
                            total: `$${formatearMonto(totalCalculado)}`,
                            sena: `$${formatearMonto(senaCalculada)}`,
                            forma_pago: "Transferencia bancaria (50% de seña)"
                        },
                        {
                            publicKey
                        }
                    );
                } catch (emailError) {
                    console.warn("Turno guardado, pero falló el envío del correo:", emailError?.text || emailError?.message || emailError);
                    toast.info("Turno reservado, aunque no pudimos enviar el correo automático.");
                }
            } else {
                console.warn("No se llamó a EmailJS. Estado de datos:", {
                    tieneEmail: Boolean(emailDestino),
                    tieneServiceId: Boolean(serviceId),
                    tieneTemplateId: Boolean(templateId),
                    tienePublicKey: Boolean(publicKey)
                });
            }

            toast.success("🎉 ¡Tu turno ha sido reservado con éxito!");

            setPaso(1);
            setServiciosSeleccionados([]);
            setFechaSeleccionada("");
            setHoraSeleccionada("");
            setAsignacionesPorHora({});
            setSucursal(null);
            setDatosCliente({ nombre: "", apellido: "", telefono: "", email: "", notas: "" });
        } catch (error) {
            toast.error("Error al guardar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TurnoContext.Provider
            value={{
                paso,
                setPaso,
                sucursal,
                setSucursal,
                serviciosSeleccionados,
                toggleServicio,
                ajustarCantidadServicio,
                getCantidadServicio,
                fechaSeleccionada,
                setFechaSeleccionada,
                horaSeleccionada,
                setHoraSeleccionada,
                asignacionesPorHora,
                asignarServicioAHora,
                formaPago,
                setFormaPago,
                datosCliente,
                setDatosCliente,
                getTotal,
                verificarDisponibilidadHora,
                finalizarReserva,
                loading
            }}
        >
            {children}
        </TurnoContext.Provider>
    );
};
