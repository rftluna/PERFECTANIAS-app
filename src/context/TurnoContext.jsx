import { createContext, useContext, useState } from "react";
import { collection, doc, getDocs, query, where, runTransaction } from "firebase/firestore";
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

    // Calcula el importe total de los servicios seleccionados.
    const getTotal = () => serviciosSeleccionados.reduce((sum, servicio) => sum + Number(servicio.price || 0) * Number(servicio.cantidad || 1), 0);

    // Obtiene la cantidad seleccionada de un servicio.
    const getCantidadServicio = (servicioId) => {
        const encontrado = serviciosSeleccionados.find((servicio) => servicio.id === servicioId);

        return encontrado ? Number(encontrado.cantidad || 1) : 0;
    };

    // Agrega o elimina un servicio del carrito de turnos.
    const toggleServicio = (servicio) => {
        setServiciosSeleccionados((prev) => {
            const existe = prev.some((item) => item.id === servicio.id);

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

                return prev.filter((item) => item.id !== servicio.id);
            }

            return [
                ...prev,
                {
                    ...servicio,
                    cantidad: 1
                }
            ];
        });
    };

    // Modifica la cantidad de unidades de un servicio.
    const ajustarCantidadServicio = (servicio, cambio) => {
        setServiciosSeleccionados((prev) => {
            const indice = prev.findIndex((item) => item.id === servicio.id);

            if (indice === -1) {
                if (cambio > 0) {
                    return [
                        ...prev,
                        {
                            ...servicio,
                            cantidad: 1
                        }
                    ];
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

                return prev.filter((item) => item.id !== servicio.id);
            }

            const copia = [...prev];

            copia[indice] = {
                ...copia[indice],
                cantidad: nuevaCantidad
            };

            return copia;
        });
    };

    // Asigna un servicio a un horario o libera el horario.
    const asignarServicioAHora = (hora, servicio) => {
        if (!hora) return;

        const siguiente = { ...asignacionesPorHora };

        // Liberar horario.
        if (!servicio) {
            delete siguiente[hora];

            setAsignacionesPorHora(siguiente);

            const restantes = Object.keys(siguiente).sort();

            setHoraSeleccionada(restantes[0] || "");

            return;
        }

        // Evita que una misma unidad se asigne a más de un horario.
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

    // Limpia todas las asignaciones.
    const limpiarAsignaciones = () => {
        setAsignacionesPorHora({});
        setHoraSeleccionada("");
    };

    // Verifica si un horario está libre.
    const verificarDisponibilidadHora = async (fecha, hora, sucursalId) => {
        try {
            if (!db || !fecha || !hora || !sucursalId) {
                return false;
            }

            const disponibilidadRef = collection(db, "disponibilidad");

            const q = query(disponibilidadRef, where("fecha", "==", fecha), where("hora", "==", hora), where("sucursalId", "==", sucursalId), where("ocupado", "==", true));

            const snapshot = await getDocs(q);

            return snapshot.empty;
        } catch (error) {
            console.error("Error verificando disponibilidad:", error);

            // Ante un error, no permitimos continuar.
            return false;
        }
    };

    // Genera un ID determinístico para cada horario.
    const generarIdDisponibilidad = (fecha, sucursalId, hora) => {
        const sucursalSegura = encodeURIComponent(String(sucursalId));

        const horaSegura = hora.replace(":", "");

        return `${fecha}_${sucursalSegura}_${horaSegura}`;
    };

    // Confirma la reserva.
    const finalizarReserva = async () => {
        if (loading) return;

        if (!db) {
            toast.error("No hay conexión con la base de datos.");
            return;
        }

        if (!sucursal?.id) {
            toast.error("Selecciona una sucursal.");
            return;
        }

        if (!fechaSeleccionada) {
            toast.error("Selecciona una fecha.");
            return;
        }

        if (!serviciosSeleccionados.length) {
            toast.error("Selecciona al menos un servicio.");
            return;
        }

        if (!horaSeleccionada) {
            toast.error("Selecciona un horario.");
            return;
        }

        if (!datosCliente.nombre.trim()) {
            toast.error("Ingresa tu nombre.");
            return;
        }

        if (!datosCliente.apellido.trim()) {
            toast.error("Ingresa tu apellido.");
            return;
        }

        if (!datosCliente.telefono.trim()) {
            toast.error("Ingresa tu teléfono.");
            return;
        }

        if (!datosCliente.email.trim()) {
            toast.error("Ingresa tu correo electrónico.");
            return;
        }

        setLoading(true);

        try {
            let serviciosOrdenadosPorHora = [];

            // Si existen asignaciones horarias, usamos cada unidad asignada.
            if (Object.keys(asignacionesPorHora).length > 0) {
                serviciosOrdenadosPorHora = Object.entries(asignacionesPorHora)
                    .sort(([horaA], [horaB]) => horaA.localeCompare(horaB))
                    .map(([hora, servicio]) => ({
                        hora,
                        id: servicio.id,
                        name: servicio.name,
                        price: Number(servicio.price || 0),
                        duration: servicio.duration ?? null,
                        slotKey: servicio.slotKey || servicio.id,
                        cantidad: 1
                    }));

                // Validamos que todas las cantidades seleccionadas
                // tengan sus correspondientes asignaciones horarias.
                for (const servicio of serviciosSeleccionados) {
                    const cantidadSeleccionada = Number(servicio.cantidad || 1);

                    const cantidadAsignada = serviciosOrdenadosPorHora.filter((asignacion) => asignacion.id === servicio.id).length;

                    if (cantidadAsignada !== cantidadSeleccionada) {
                        toast.error(`Debes asignar los ${cantidadSeleccionada} horarios de "${servicio.name}".`);

                        return;
                    }
                }
            } else {
                // Compatibilidad cuando no se utilizan asignaciones.
                serviciosOrdenadosPorHora = serviciosSeleccionados.map((servicio) => ({
                    hora: horaSeleccionada,
                    id: servicio.id,
                    name: servicio.name,
                    price: Number(servicio.price || 0),
                    cantidad: Number(servicio.cantidad || 1)
                }));
            }

            // Horarios únicos que deben bloquearse.
            const horariosAReservar = [...new Set(serviciosOrdenadosPorHora.map((servicio) => servicio.hora).filter(Boolean))];

            if (!horariosAReservar.length) {
                toast.error("No hay horarios asignados.");
                return;
            }

            const totalCalculado = getTotal();

            const senaCalculada = Math.round(totalCalculado * 0.5);

            const formatearMonto = (numero) => Number(numero || 0).toLocaleString("es-AR");

            const emailDestino = (datosCliente.email || "").trim();

            // Datos privados de la reserva.
            const nuevoTurno = {
                sucursalId: sucursal.id,
                sucursalNombre: sucursal.nombre,

                servicios: serviciosOrdenadosPorHora,

                asignacionesPorHora,

                fecha: fechaSeleccionada,

                hora: horaSeleccionada,

                formaPago,

                cliente: {
                    nombre: datosCliente.nombre.trim(),
                    apellido: datosCliente.apellido.trim(),
                    telefono: datosCliente.telefono.trim(),
                    email: emailDestino,
                    notas: datosCliente.notas.trim()
                },

                total: totalCalculado,

                sena: senaCalculada,

                createdAt: new Date().toISOString()
            };

            // Referencia de la reserva.
            const reservaRef = doc(collection(db, "reservas"));

            // Referencias de los horarios.
            const disponibilidadRefs = horariosAReservar.map((hora) => ({
                hora,
                ref: doc(db, "disponibilidad", generarIdDisponibilidad(fechaSeleccionada, sucursal.id, hora))
            }));

            // Reserva y bloqueo de horarios en una única transacción.
            await runTransaction(db, async (transaction) => {
                const documentosDisponibilidad = [];

                // Todas las lecturas se realizan antes de escribir.
                for (const disponibilidad of disponibilidadRefs) {
                    const documento = await transaction.get(disponibilidad.ref);

                    documentosDisponibilidad.push({
                        hora: disponibilidad.hora,
                        ref: disponibilidad.ref,
                        documento
                    });
                }

                // Verificamos que ninguno esté ocupado.
                for (const disponibilidad of documentosDisponibilidad) {
                    if (disponibilidad.documento.exists()) {
                        const datos = disponibilidad.documento.data();

                        if (datos.ocupado === true) {
                            throw new Error(`El horario ${disponibilidad.hora} ya está ocupado.`);
                        }
                    }
                }

                // Guardamos los datos de la reserva.
                transaction.set(reservaRef, nuevoTurno);

                // Publicamos únicamente información mínima.
                // No guardamos datos del cliente ni reservaId.
                for (const disponibilidad of documentosDisponibilidad) {
                    transaction.set(disponibilidad.ref, {
                        fecha: fechaSeleccionada,
                        hora: disponibilidad.hora,
                        sucursalId: sucursal.id,
                        ocupado: true
                    });
                }
            });

            // A partir de acá la reserva ya está confirmada.
            // Un eventual error de EmailJS no la cancela.

            const serviceId = (import.meta.env.VITE_EMAILJS_SERVICE_ID || "").trim();

            const templateId = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "").trim();

            const publicKey = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "").trim();

            const resumenServiciosTexto = serviciosOrdenadosPorHora
                .map((item) => {
                    const cantidad = item.cantidad > 1 ? ` (x${item.cantidad})` : "";

                    const horario = item.hora ? ` - ${item.hora} hs` : "";

                    return `• ${item.name}${cantidad}${horario} ` + `($${formatearMonto(item.price)})`;
                })
                .join("\n");

            // Envío de confirmación por correo.
            if (emailDestino && serviceId && templateId && publicKey) {
                try {
                    await emailjs.send(
                        serviceId,
                        templateId,
                        {
                            to_email: emailDestino,

                            cliente_nombre: `${datosCliente.nombre} ${datosCliente.apellido}`.trim(),

                            sucursal_nombre: sucursal.nombre || "",

                            fecha: fechaSeleccionada,

                            hora: horaSeleccionada,

                            servicios_detalle: resumenServiciosTexto,

                            total: `$${formatearMonto(totalCalculado)}`,

                            sena: `$${formatearMonto(senaCalculada)}`,

                            forma_pago: `${formaPago} (50% de seña)`,

                            notas: datosCliente.notas.trim() || "Sin indicaciones",

                            telefono: datosCliente.telefono.trim()
                        },
                        {
                            publicKey
                        }
                    );
                } catch (emailError) {
                    console.warn("Reserva guardada, pero falló el envío del correo:", emailError?.text || emailError?.message || emailError);

                    toast.info("Tu turno está reservado, pero no pudimos enviar el correo automático.");
                }
            } else {
                console.warn("No se llamó a EmailJS. Configuración incompleta:", {
                    tieneEmail: Boolean(emailDestino),
                    tieneServiceId: Boolean(serviceId),
                    tieneTemplateId: Boolean(templateId),
                    tienePublicKey: Boolean(publicKey)
                });
            }

            toast.success("🎉 ¡Tu turno ha sido reservado con éxito!");

            // Reiniciamos el formulario.
            setPaso(1);

            setServiciosSeleccionados([]);

            setFechaSeleccionada("");

            setHoraSeleccionada("");

            setAsignacionesPorHora({});

            setSucursal(null);

            setFormaPago("Transferencia bancaria");

            setDatosCliente({
                nombre: "",
                apellido: "",
                telefono: "",
                email: "",
                notas: ""
            });
        } catch (error) {
            console.error("Error al finalizar reserva:", error);

            if (error.message?.includes("ya está ocupado")) {
                toast.error("😢 Uno de los horarios seleccionados acaba de ocuparse. Por favor, selecciona otro.");
            } else {
                toast.error("No pudimos confirmar tu reserva. Por favor, intenta nuevamente.");
            }
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
                limpiarAsignaciones,

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
