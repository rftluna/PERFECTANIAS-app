import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { toast } from "react-toastify";
import "./Login.css";
import { useEffect, useState } from "react";
import { MAX_INTENTOS, MINUTOS_BLOQUEO, intentosRestantes, registrarIntentoFallido, reiniciarIntentos, tiempoBloqueoRestante } from "../../utils/seguridadPassword";

const SEGUNDOS_ENTRE_ENVIOS = 60;

// 125000 ms -> "2:05"
const formatearTiempo = (ms) => {
    const totalSeg = Math.ceil(ms / 1000);
    return `${Math.floor(totalSeg / 60)}:${String(totalSeg % 60).padStart(2, "0")}`;
};

export const Login = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [vista, setVista] = useState("login"); // "login" | "recuperar" | "enviado"
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [ingresando, setIngresando] = useState(false);
    const [restantes, setRestantes] = useState(intentosRestantes());
    const [bloqueoMs, setBloqueoMs] = useState(tiempoBloqueoRestante());

    const [emailRecuperar, setEmailRecuperar] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [esperaEnvio, setEsperaEnvio] = useState(0);

    // Cuenta regresiva del bloqueo y de la espera entre envíos de mail.
    useEffect(() => {
        if (bloqueoMs <= 0 && esperaEnvio <= 0) return;
        const id = setInterval(() => {
            const restante = tiempoBloqueoRestante();
            setBloqueoMs(restante);
            if (restante === 0) setRestantes(intentosRestantes());
            setEsperaEnvio((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [bloqueoMs > 0, esperaEnvio > 0]);

    // Si ya hay sesión iniciada, va directo al panel.
    if (user) return <Navigate to="/admin" replace />;

    const bloqueado = bloqueoMs > 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (bloqueado) return;

        setIngresando(true);
        try {
            await login(formData.email.trim(), formData.password);
            reiniciarIntentos();
            toast.success("Bienvenida al panel de Perfectanias.");
            navigate("/admin", { replace: true });
        } catch (error) {
            console.error(error);

            if (error?.code === "auth/too-many-requests") {
                // Bloqueo propio de Firebase (del lado del servidor).
                toast.error("Demasiados intentos. Firebase bloqueó el acceso por un rato: probá más tarde o restablecé tu contraseña.");
                return;
            }

            const quedan = registrarIntentoFallido();
            setRestantes(quedan);
            setFormData((f) => ({ ...f, password: "" }));

            if (quedan <= 0) {
                setBloqueoMs(tiempoBloqueoRestante());
                toast.error(`Superaste los ${MAX_INTENTOS} intentos. El ingreso queda bloqueado ${MINUTOS_BLOQUEO} minutos.`);
            } else {
                // Mensaje genérico: no revela si falló el correo o la contraseña.
                toast.error(`Correo o contraseña incorrectos. Te ${quedan === 1 ? "queda 1 intento" : `quedan ${quedan} intentos`}.`);
            }
        } finally {
            setIngresando(false);
        }
    };

    const handleRecuperar = async (e) => {
        e.preventDefault();
        if (esperaEnvio > 0) return;

        setEnviando(true);
        try {
            auth.languageCode = "es"; // el mail llega en español
            await sendPasswordResetEmail(auth, emailRecuperar.trim());
        } catch (error) {
            // A propósito no mostramos si el correo existe o no (evita que alguien averigüe cuál es).
            console.warn("Recuperación:", error?.code);
        } finally {
            setEnviando(false);
            setEsperaEnvio(SEGUNDOS_ENTRE_ENVIOS);
            setVista("enviado");
        }
    };

    return (
        <div className="login-wrapper">
            {vista === "login" && (
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-icono">🔐</div>
                    <h2>Panel Administradora</h2>
                    <p className="login-subtitulo">Ingresá con tu cuenta para editar precios, textos y fotos.</p>

                    {bloqueado ? (
                        <div className="login-aviso login-aviso-bloqueo">
                            <strong>Ingreso bloqueado temporalmente</strong>
                            <span>
                                Por seguridad, después de {MAX_INTENTOS} intentos fallidos esperá <b>{formatearTiempo(bloqueoMs)}</b> para volver a intentar.
                            </span>
                        </div>
                    ) : (
                        restantes < MAX_INTENTOS && (
                            <div className="login-aviso">
                                Te {restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`} antes de que se bloquee el ingreso.
                            </div>
                        )
                    )}

                    <div className="form-group">
                        <label htmlFor="login-email">Correo electrónico</label>
                        <input id="login-email" type="email" name="email" placeholder="tucorreo@gmail.com" value={formData.email} onChange={handleChange} autoComplete="username" disabled={bloqueado} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Contraseña</label>
                        <input id="login-password" type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} autoComplete="current-password" disabled={bloqueado} required />
                    </div>

                    <button className="btn-login-rosa" type="submit" disabled={ingresando || bloqueado}>
                        {ingresando ? "Ingresando..." : bloqueado ? "Bloqueado" : "Ingresar"}
                    </button>

                    <button
                        type="button"
                        className="login-link-olvido"
                        onClick={() => {
                            setEmailRecuperar(formData.email);
                            setVista("recuperar");
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </form>
            )}

            {vista === "recuperar" && (
                <form onSubmit={handleRecuperar} className="login-form">
                    <div className="login-icono">💌</div>
                    <h2>Restablecer contraseña</h2>
                    <p className="login-subtitulo">Escribí el correo con el que ingresás al panel y te mandamos un link para crear una contraseña nueva.</p>

                    <div className="form-group">
                        <label htmlFor="recuperar-email">Correo registrado</label>
                        <input id="recuperar-email" type="email" placeholder="tucorreo@gmail.com" value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)} autoComplete="username" required />
                    </div>

                    <button className="btn-login-rosa" type="submit" disabled={enviando || esperaEnvio > 0}>
                        {enviando ? "Enviando..." : esperaEnvio > 0 ? `Podés reenviar en ${esperaEnvio}s` : "Enviarme el link"}
                    </button>

                    <button type="button" className="login-link-olvido" onClick={() => setVista("login")}>
                        ← Volver a iniciar sesión
                    </button>
                </form>
            )}

            {vista === "enviado" && (
                <div className="login-form">
                    <div className="login-icono">📬</div>
                    <h2>¡Revisá tu correo!</h2>
                    <p className="login-subtitulo">
                        Si <strong>{emailRecuperar.trim()}</strong> es el correo registrado, en unos minutos te llega un mail con el link para crear una contraseña nueva.
                    </p>

                    <ul className="login-pasos">
                        <li>Mirá también en <b>Spam</b> o <b>Promociones</b>.</li>
                        <li>El link vence en 1 hora.</li>
                        <li>Elegí una contraseña nueva con letras, números y un símbolo (ej: !, @, #).</li>
                    </ul>

                    <button type="button" className="btn-login-rosa" onClick={() => setVista("login")}>
                        Volver a iniciar sesión
                    </button>

                    <button type="button" className="login-link-olvido" disabled={esperaEnvio > 0} onClick={() => setVista("recuperar")}>
                        {esperaEnvio > 0 ? `¿No llegó? Podés reenviar en ${esperaEnvio}s` : "¿No llegó? Reenviar el link"}
                    </button>
                </div>
            )}
        </div>
    );
};
