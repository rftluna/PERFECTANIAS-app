import { useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, verifyBeforeUpdateEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { toast } from "react-toastify";

const ROSA = "#d4a3b8";

// Traduce los errores de Firebase a mensajes claros.
const mensajeError = (error) => {
    switch (error?.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
            return "La contraseña actual no es correcta.";
        case "auth/too-many-requests":
            return "Demasiados intentos. Esperá unos minutos y probá de nuevo.";
        case "auth/weak-password":
            return "La contraseña nueva es muy débil: usá al menos 6 caracteres.";
        case "auth/email-already-in-use":
            return "Ese correo ya está usado por otra cuenta.";
        case "auth/invalid-email":
            return "El correo nuevo no es válido.";
        case "auth/requires-recent-login":
            return "Por seguridad, cerrá sesión, volvé a entrar y repetí el cambio.";
        default:
            return "No se pudo completar el cambio. " + (error?.message || "");
    }
};

// Antes de cambiar correo o contraseña, Firebase pide confirmar la contraseña actual.
const confirmarIdentidad = async (passwordActual) => {
    const usuario = auth.currentUser;
    const credencial = EmailAuthProvider.credential(usuario.email, passwordActual);
    await reauthenticateWithCredential(usuario, credencial);
    return usuario;
};

export const AccesoAdmin = () => {
    const usuario = auth.currentUser;

    const [pass, setPass] = useState({ actual: "", nueva: "", repetir: "" });
    const [guardandoPass, setGuardandoPass] = useState(false);

    const [mail, setMail] = useState({ nuevo: "", actual: "" });
    const [guardandoMail, setGuardandoMail] = useState(false);
    const [mailPendiente, setMailPendiente] = useState("");

    const handleCambiarPassword = async (e) => {
        e.preventDefault();

        if (pass.nueva.length < 6) {
            toast.warning("La contraseña nueva tiene que tener al menos 6 caracteres.");
            return;
        }
        if (pass.nueva !== pass.repetir) {
            toast.warning("Las contraseñas nuevas no coinciden.");
            return;
        }
        if (pass.nueva === pass.actual) {
            toast.warning("La contraseña nueva tiene que ser distinta de la actual.");
            return;
        }

        setGuardandoPass(true);
        try {
            const u = await confirmarIdentidad(pass.actual);
            await updatePassword(u, pass.nueva);
            setPass({ actual: "", nueva: "", repetir: "" });
            toast.success("¡Contraseña cambiada! La próxima vez entrá con la nueva.");
        } catch (error) {
            console.error(error);
            toast.error(mensajeError(error));
        } finally {
            setGuardandoPass(false);
        }
    };

    const handleCambiarEmail = async (e) => {
        e.preventDefault();
        const nuevo = mail.nuevo.trim().toLowerCase();

        if (nuevo === (usuario?.email || "").toLowerCase()) {
            toast.warning("Ese ya es tu correo actual.");
            return;
        }

        setGuardandoMail(true);
        try {
            const u = await confirmarIdentidad(mail.actual);
            auth.languageCode = "es"; // el mail de confirmación llega en español
            await verifyBeforeUpdateEmail(u, nuevo);
            setMailPendiente(nuevo);
            setMail({ nuevo: "", actual: "" });
            toast.success("Te mandamos un mail para confirmar el correo nuevo.");
        } catch (error) {
            console.error(error);
            toast.error(mensajeError(error));
        } finally {
            setGuardandoMail(false);
        }
    };

    return (
        <div className="row g-4">
            {/* CONTRASEÑA */}
            <div className="col-lg-6">
                <div className="card p-4 shadow-sm border rounded-4 bg-white h-100">
                    <h5 className="fw-bold mb-1">🔐 Cambiar contraseña</h5>
                    <p className="text-muted small mb-4">Elegí una contraseña que solo sepas vos. Mínimo 6 caracteres.</p>

                    <form onSubmit={handleCambiarPassword} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold">Contraseña actual</label>
                            <input type="password" className="form-control" autoComplete="current-password" value={pass.actual} onChange={(e) => setPass((p) => ({ ...p, actual: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Contraseña nueva</label>
                            <input type="password" className="form-control" autoComplete="new-password" minLength={6} value={pass.nueva} onChange={(e) => setPass((p) => ({ ...p, nueva: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Repetí la contraseña nueva</label>
                            <input type="password" className="form-control" autoComplete="new-password" minLength={6} value={pass.repetir} onChange={(e) => setPass((p) => ({ ...p, repetir: e.target.value }))} required />
                        </div>
                        <button type="submit" disabled={guardandoPass} className="btn rounded-pill fw-bold px-4 border-0 align-self-start" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                            {guardandoPass ? "Cambiando..." : "Cambiar contraseña"}
                        </button>
                    </form>
                </div>
            </div>

            {/* CORREO */}
            <div className="col-lg-6">
                <div className="card p-4 shadow-sm border rounded-4 bg-white h-100">
                    <h5 className="fw-bold mb-1">📧 Cambiar correo de acceso</h5>
                    <p className="text-muted small mb-1">
                        Correo actual: <strong>{usuario?.email}</strong>
                    </p>
                    <p className="text-muted small mb-4">Te vamos a mandar un mail al correo nuevo. El cambio se aplica cuando tocás el link de ese mail.</p>

                    {mailPendiente && (
                        <div className="p-3 rounded-3 small mb-3" style={{ backgroundColor: "#fff0f5", border: "1px solid #ead1dc" }}>
                            📬 Revisá <strong>{mailPendiente}</strong> (también la carpeta de spam) y tocá el link de confirmación. Después cerrá sesión y entrá con el correo nuevo.
                        </div>
                    )}

                    <form onSubmit={handleCambiarEmail} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold">Correo nuevo</label>
                            <input type="email" className="form-control" placeholder="tucorreo@gmail.com" autoComplete="email" value={mail.nuevo} onChange={(e) => setMail((m) => ({ ...m, nuevo: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Contraseña actual (para confirmar que sos vos)</label>
                            <input type="password" className="form-control" autoComplete="current-password" value={mail.actual} onChange={(e) => setMail((m) => ({ ...m, actual: e.target.value }))} required />
                        </div>
                        <button type="submit" disabled={guardandoMail} className="btn rounded-pill fw-bold px-4 border-0 align-self-start" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                            {guardandoMail ? "Enviando..." : "Cambiar correo"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
