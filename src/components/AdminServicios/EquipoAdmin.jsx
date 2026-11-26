import { useCallback, useEffect, useState } from "react";
import { Timestamp, collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { DIAS_VALIDEZ_INVITACION, DUENA_UID } from "../../config/admins";

const ROSA = "#d4a3b8";

// Código secreto de 32 caracteres: es el ID de la invitación y va en el link.
const generarCodigo = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const linkDeInvitacion = (codigo) => `${window.location.origin}/admin/registro?codigo=${codigo}`;

const formatearFecha = (valor) => {
    const fecha = valor?.toDate ? valor.toDate() : valor ? new Date(valor) : null;
    return fecha ? fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : "";
};

export const EquipoAdmin = () => {
    const { user } = useAuth();

    const [admins, setAdmins] = useState([]);
    const [invitaciones, setInvitaciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [emailInvitar, setEmailInvitar] = useState("");
    const [creando, setCreando] = useState(false);
    const [ultimoLink, setUltimoLink] = useState(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        try {
            const [snapAdmins, snapInv] = await Promise.all([getDocs(collection(db, "admins")), getDocs(collection(db, "invitaciones"))]);
            setAdmins(snapAdmins.docs.map((d) => ({ uid: d.id, ...d.data() })));
            const ahora = Date.now();
            setInvitaciones(
                snapInv.docs
                    .map((d) => ({ codigo: d.id, ...d.data() }))
                    .map((inv) => ({ ...inv, vencida: (inv.expiraEn?.toMillis?.() ?? 0) < ahora }))
            );
        } catch (error) {
            console.error(error);
            toast.error("No se pudo cargar el equipo. ¿Publicaste las reglas nuevas de Firestore?");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const handleInvitar = async (e) => {
        e.preventDefault();
        const email = emailInvitar.trim().toLowerCase();
        if (!email) return;

        if (admins.some((a) => (a.email || "").toLowerCase() === email) || (user?.uid === DUENA_UID && user.email?.toLowerCase() === email)) {
            toast.info("Ese correo ya es administradora.");
            return;
        }

        setCreando(true);
        try {
            const codigo = generarCodigo();
            const expira = new Date(Date.now() + DIAS_VALIDEZ_INVITACION * 24 * 60 * 60 * 1000);
            await setDoc(doc(db, "invitaciones", codigo), {
                email,
                creadaPor: user?.email || "",
                creadaEn: Timestamp.now(),
                expiraEn: Timestamp.fromDate(expira)
            });
            setUltimoLink({ email, link: linkDeInvitacion(codigo) });
            setEmailInvitar("");
            toast.success("Invitación creada. Mandale el link.");
            cargar();
        } catch (error) {
            console.error(error);
            toast.error("No se pudo crear la invitación: " + error.message);
        } finally {
            setCreando(false);
        }
    };

    const copiar = async (texto) => {
        try {
            await navigator.clipboard.writeText(texto);
            toast.info("🔗 Link copiado.");
        } catch {
            toast.info("Copiá el link a mano.");
        }
    };

    const linkWhatsapp = (link) =>
        `https://wa.me/?text=${encodeURIComponent(`¡Hola! Te invito al panel de Perfectanias para que puedas cargar y editar servicios. Creá tu cuenta acá (tenés ${DIAS_VALIDEZ_INVITACION} días para usarlo): ${link}`)}`;

    const cancelarInvitacion = async (codigo) => {
        if (!window.confirm("¿Cancelar esta invitación? El link deja de funcionar.")) return;
        try {
            await deleteDoc(doc(db, "invitaciones", codigo));
            if (ultimoLink?.link.endsWith(codigo)) setUltimoLink(null);
            toast.success("Invitación cancelada.");
            cargar();
        } catch (error) {
            toast.error("No se pudo cancelar: " + error.message);
        }
    };

    const quitarAcceso = async (admin) => {
        if (!window.confirm(`¿Quitarle el acceso al panel a ${admin.nombre || admin.email}?`)) return;
        try {
            await deleteDoc(doc(db, "admins", admin.uid));
            toast.success("Acceso quitado.");
            cargar();
        } catch (error) {
            toast.error("No se pudo quitar el acceso: " + error.message);
        }
    };

    return (
        <div className="row g-4">
            {/* INVITAR */}
            <div className="col-lg-5">
                <div className="card p-4 shadow-sm border rounded-4 bg-white h-100">
                    <h5 className="fw-bold mb-1">💌 Invitar administradora</h5>
                    <p className="text-muted small mb-4">
                        Escribí su correo y mandale el link. Ella crea su propia contraseña y entra al panel con acceso completo. El link sirve una sola vez y vence en {DIAS_VALIDEZ_INVITACION} días.
                    </p>

                    <form onSubmit={handleInvitar} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold" htmlFor="invitar-email">
                                Correo de la persona invitada
                            </label>
                            <input id="invitar-email" type="email" className="form-control" placeholder="amiga@gmail.com" value={emailInvitar} onChange={(e) => setEmailInvitar(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={creando} className="btn rounded-pill fw-bold px-4 border-0 align-self-start" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                            {creando ? "Creando..." : "Crear invitación"}
                        </button>
                    </form>

                    {ultimoLink && (
                        <div className="p-3 rounded-3 small mt-4" style={{ backgroundColor: "#fff0f5", border: "1px solid #ead1dc" }}>
                            <div className="mb-2">
                                Link para <strong>{ultimoLink.email}</strong>:
                            </div>
                            <input type="text" readOnly className="form-control form-control-sm mb-2" value={ultimoLink.link} onFocus={(e) => e.target.select()} aria-label="Link de invitación" />
                            <div className="d-flex flex-wrap gap-2">
                                <button type="button" onClick={() => copiar(ultimoLink.link)} className="btn btn-sm rounded-pill px-3 fw-semibold border-0" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                                    Copiar link
                                </button>
                                <a href={linkWhatsapp(ultimoLink.link)} target="_blank" rel="noreferrer" className="btn btn-sm rounded-pill px-3 fw-semibold" style={{ border: `1px solid ${ROSA}`, color: "#bd829d" }}>
                                    Enviar por WhatsApp
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* EQUIPO */}
            <div className="col-lg-7">
                <div className="card p-4 shadow-sm border rounded-4 bg-white h-100">
                    <h5 className="fw-bold mb-3">👭 Equipo</h5>

                    {cargando ? (
                        <p className="text-muted small">Cargando...</p>
                    ) : (
                        <>
                            <div className="d-flex flex-column gap-2 mb-4">
                                <div className="d-flex justify-content-between align-items-center p-3 border rounded-3">
                                    <div>
                                        <div className="fw-bold">Dueña</div>
                                        <div className="small text-muted">{user?.uid === DUENA_UID ? user.email : "Cuenta principal"}</div>
                                    </div>
                                    <span className="badge rounded-pill" style={{ backgroundColor: ROSA }}>
                                        Principal
                                    </span>
                                </div>

                                {admins.map((a) => (
                                    <div key={a.uid} className="d-flex justify-content-between align-items-center gap-2 p-3 border rounded-3">
                                        <div>
                                            <div className="fw-bold">
                                                {a.nombre || "Administradora"} {a.uid === user?.uid && <span className="text-muted small">(vos)</span>}
                                            </div>
                                            <div className="small text-muted">
                                                {a.email} {a.creadaEn && `· desde ${formatearFecha(a.creadaEn)}`}
                                            </div>
                                        </div>
                                        {a.uid !== user?.uid && (
                                            <button type="button" onClick={() => quitarAcceso(a)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                                                Quitar acceso
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <h6 className="fw-bold small text-uppercase text-muted">Invitaciones pendientes</h6>
                            {invitaciones.length === 0 ? (
                                <p className="text-muted small mb-0">No hay invitaciones pendientes.</p>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {invitaciones.map((inv) => (
                                        <div key={inv.codigo} className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 border rounded-3">
                                            <div>
                                                <div className="fw-semibold">{inv.email}</div>
                                                <div className="small" style={{ color: inv.vencida ? "#b04a68" : "#987587" }}>
                                                    {inv.vencida ? "Vencida" : `Vence el ${formatearFecha(inv.expiraEn)}`}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                {!inv.vencida && (
                                                    <button type="button" onClick={() => copiar(linkDeInvitacion(inv.codigo))} className="btn btn-sm rounded-pill px-3" style={{ border: `1px solid ${ROSA}`, color: "#bd829d" }}>
                                                        Copiar link
                                                    </button>
                                                )}
                                                <button type="button" onClick={() => cancelarInvitacion(inv.codigo)} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                                    {inv.vencida ? "Borrar" : "Cancelar"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
