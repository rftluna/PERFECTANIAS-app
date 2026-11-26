import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Timestamp, doc, getDoc, writeBatch } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { evaluarPassword, passwordEsSegura } from "../../utils/seguridadPassword";
import { useMetaPagina } from "../../utils/useMetaPagina";
import "../Login/Login.css";

// Página a la que llega una persona invitada desde /admin → Equipo.
// Con el código del link crea su cuenta (o usa la que ya tenga con ese correo) y queda como administradora.
export const RegistroAdmin = () => {
    useMetaPagina("Crear cuenta de administradora");

    const [searchParams] = useSearchParams();
    const codigo = searchParams.get("codigo") || "";
    const navigate = useNavigate();
    const { user, esAdmin, loading, refrescarRol } = useAuth();

    const [invitacion, setInvitacion] = useState(null);
    const [estado, setEstado] = useState("cargando"); // "cargando" | "ok" | "invalida" | "vencida"
    const [form, setForm] = useState({ nombre: "", password: "", repetir: "" });
    const [creando, setCreando] = useState(false);
    const [cuentaExistente, setCuentaExistente] = useState(false);

    useEffect(() => {
        const leerInvitacion = async () => {
            if (!/^[0-9a-f]{32}$/.test(codigo)) {
                setEstado("invalida");
                return;
            }
            try {
                const snap = await getDoc(doc(db, "invitaciones", codigo));
                if (!snap.exists()) {
                    setEstado("invalida");
                    return;
                }
                const datos = snap.data();
                if ((datos.expiraEn?.toMillis?.() ?? 0) < Date.now()) {
                    setEstado("vencida");
                    return;
                }
                setInvitacion(datos);
                setEstado("ok");
            } catch (error) {
                console.error(error);
                setEstado("invalida");
            }
        };
        leerInvitacion();
    }, [codigo]);

    // Si ya es administradora (por ejemplo, volvió a abrir el link), va directo al panel.
    if (!loading && user && esAdmin && !creando) return <Navigate to="/admin" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nombre = form.nombre.trim();
        if (!nombre) {
            toast.warning("Escribí tu nombre.");
            return;
        }
        if (!cuentaExistente && !passwordEsSegura(form.password)) {
            toast.warning("La contraseña no cumple todos los requisitos de seguridad.");
            return;
        }
        if (!cuentaExistente && form.password !== form.repetir) {
            toast.warning("Las contraseñas no coinciden.");
            return;
        }

        setCreando(true);
        try {
            let credencial;
            if (cuentaExistente) {
                credencial = await signInWithEmailAndPassword(auth, invitacion.email, form.password);
            } else {
                try {
                    credencial = await createUserWithEmailAndPassword(auth, invitacion.email, form.password);
                } catch (error) {
                    if (error?.code === "auth/email-already-in-use") {
                        // Ese correo ya tiene cuenta: pedimos su contraseña para vincularla.
                        setCuentaExistente(true);
                        setForm((f) => ({ ...f, password: "", repetir: "" }));
                        toast.info("Ese correo ya tiene una cuenta. Ingresá su contraseña para activarla como administradora.");
                        return;
                    }
                    throw error;
                }
            }

            const uid = credencial.user.uid;
            await updateProfile(credencial.user, { displayName: nombre }).catch(() => {});

            // Alta como administradora + invitación usada, todo junto (las reglas exigen las dos cosas).
            const batch = writeBatch(db);
            batch.set(doc(db, "admins", uid), {
                email: invitacion.email,
                nombre,
                invitacion: codigo,
                creadaEn: Timestamp.now()
            });
            batch.delete(doc(db, "invitaciones", codigo));
            await batch.commit();

            await refrescarRol();
            toast.success(`¡Bienvenida, ${nombre}! Ya tenés acceso al panel.`);
            navigate("/admin", { replace: true });
        } catch (error) {
            console.error(error);
            const mensajes = {
                "auth/invalid-credential": "La contraseña no es correcta.",
                "auth/wrong-password": "La contraseña no es correcta.",
                "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos.",
                "auth/weak-password": "La contraseña es muy débil.",
                "permission-denied": "La invitación ya no es válida. Pedile a la dueña un link nuevo."
            };
            toast.error(mensajes[error?.code] || "No se pudo crear la cuenta. " + (error?.message || ""));
        } finally {
            setCreando(false);
        }
    };

    if (estado === "cargando") {
        return <p className="text-center text-muted py-5">Cargando invitación...</p>;
    }

    if (estado !== "ok") {
        return (
            <div className="login-wrapper">
                <div className="login-form">
                    <div className="login-icono">{estado === "vencida" ? "⌛" : "🔗"}</div>
                    <h2>{estado === "vencida" ? "La invitación venció" : "Invitación no válida"}</h2>
                    <p className="login-subtitulo">
                        {estado === "vencida" ? "Este link ya no se puede usar." : "El link está incompleto o ya fue usado."} Pedile a la dueña del panel que te mande una invitación nueva.
                    </p>
                    <Link to="/admin/login" className="btn-login-rosa text-center text-decoration-none">
                        Ir a iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-wrapper">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="login-icono">💌</div>
                <h2>Te invitaron al panel</h2>
                <p className="login-subtitulo">
                    {cuentaExistente ? "Ingresá la contraseña de tu cuenta para activarla como administradora." : "Creá tu cuenta para cargar y editar servicios, reservas y reseñas de Perfectanias."}
                </p>

                <div className="form-group">
                    <label htmlFor="registro-email">Correo</label>
                    <input id="registro-email" type="email" value={invitacion.email} autoComplete="username" readOnly disabled />
                </div>

                <div className="form-group">
                    <label htmlFor="registro-nombre">Tu nombre</label>
                    <input id="registro-nombre" type="text" placeholder="Ej: Sofía" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} maxLength={60} required />
                </div>

                <div className="form-group">
                    <label htmlFor="registro-password">{cuentaExistente ? "Contraseña de tu cuenta" : "Elegí una contraseña"}</label>
                    <input
                        id="registro-password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        autoComplete={cuentaExistente ? "current-password" : "new-password"}
                        required
                    />
                    {!cuentaExistente && (
                        <ul className="list-unstyled small mt-2 mb-0 text-start">
                            {evaluarPassword(form.password).map((req) => (
                                <li key={req.id} style={{ color: req.ok ? "#2e9d6a" : "#a2627f" }}>
                                    {req.ok ? "✓" : "○"} {req.texto}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {!cuentaExistente && (
                    <div className="form-group">
                        <label htmlFor="registro-repetir">Repetí la contraseña</label>
                        <input id="registro-repetir" type="password" value={form.repetir} onChange={(e) => setForm((f) => ({ ...f, repetir: e.target.value }))} autoComplete="new-password" required />
                        {form.repetir && form.repetir !== form.password && <small style={{ color: "#b04a68" }}>Las contraseñas no coinciden.</small>}
                    </div>
                )}

                <button className="btn-login-rosa" type="submit" disabled={creando || (!cuentaExistente && (!passwordEsSegura(form.password) || form.password !== form.repetir))}>
                    {creando ? "Creando cuenta..." : cuentaExistente ? "Activar mi acceso" : "Crear mi cuenta"}
                </button>

                <Link to="/admin/login" className="login-link-olvido text-decoration-none">
                    ¿Ya sos administradora? Iniciá sesión
                </Link>
            </form>
        </div>
    );
};
