import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { LINKS_POR_DEFECTO, LINK_MAPS_PERFECTANIAS, LINK_OPINIONES_AGENDAMAS, calcularPromedio, cargarResenasAgendamas, formatearFechaResena, formatearPuntaje, unirResenas } from "./resenasUtils";
import "./ResenasGoogle.css";

// 5 estrellas con relleno parcial (sirve para 4,5 por ejemplo).
export const Estrellas = ({ puntaje, tamano = 14 }) => {
    const valor = Math.max(0, Math.min(5, Number(puntaje) || 0));
    return (
        <span className="resenas-estrellas" style={{ fontSize: `${tamano}px` }} aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => {
                const relleno = Math.max(0, Math.min(1, valor - (n - 1)));
                return (
                    <span key={n} className="resenas-estrella">
                        <span className="resenas-estrella-vacia">★</span>
                        <span className="resenas-estrella-llena" style={{ width: `${relleno * 100}%` }}>
                            ★
                        </span>
                    </span>
                );
            })}
        </span>
    );
};

// Rama de laurel dibujada en SVG (espejada para el lado derecho).
const Laurel = ({ espejado = false }) => (
    <svg className="resenas-laurel" viewBox="0 0 40 80" width="34" height="68" style={{ transform: espejado ? "scaleX(-1)" : "none" }} aria-hidden="true">
        <path d="M30 76 C 12 64, 8 40, 18 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        {[
            [17, 12, -30],
            [13, 22, -45],
            [11, 33, -60],
            [11, 44, -75],
            [14, 55, -95],
            [20, 65, -115]
        ].map(([x, y, rot], i) => (
            <g key={i}>
                <ellipse cx={x - 5} cy={y} rx="6" ry="2.6" transform={`rotate(${rot} ${x} ${y})`} fill="currentColor" />
                <ellipse cx={x + 5} cy={y + 2} rx="5.5" ry="2.4" transform={`rotate(${rot + 70} ${x} ${y})`} fill="currentColor" />
            </g>
        ))}
    </svg>
);

const hoyISO = () => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
};

const CLAVE_ENVIADA = "perfectanias_resena_enviada";

// Formulario para que una clienta deje su opinión. Queda pendiente hasta que la aprueben en /admin → Reseñas.
const FormularioResena = ({ onVolver }) => {
    const [form, setForm] = useState({ nombre: "", estrellas: 5, texto: "" });
    const [hover, setHover] = useState(0);
    const [enviando, setEnviando] = useState(false);
    const [enviada, setEnviada] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const nombre = form.nombre.trim();
        const texto = form.texto.trim();
        if (!nombre) return setError("Escribí tu nombre.");
        if (texto.length < 5) return setError("Contanos un poquito más sobre tu experiencia.");

        setEnviando(true);
        try {
            await addDoc(collection(db, "resenasPendientes"), {
                nombre,
                estrellas: form.estrellas,
                texto,
                fecha: hoyISO(),
                creadaEn: serverTimestamp()
            });
            try {
                localStorage.setItem(CLAVE_ENVIADA, hoyISO());
            } catch {
                // Sin almacenamiento local: no pasa nada.
            }
            setEnviada(true);
        } catch (err) {
            console.error(err);
            setError("No pudimos enviar tu opinión. Probá de nuevo en un rato.");
        } finally {
            setEnviando(false);
        }
    };

    if (enviada) {
        return (
            <div className="resena-form resena-enviada">
                <div className="resena-enviada-icono" aria-hidden="true">
                    💗
                </div>
                <h3>¡Gracias por tu opinión!</h3>
                <p>La vamos a publicar en la web apenas la revisemos.</p>
                <button type="button" className="opiniones-btn-dejar" onClick={onVolver}>
                    Volver a las opiniones
                </button>
            </div>
        );
    }

    const mostrar = hover || form.estrellas;

    return (
        <form className="resena-form" onSubmit={handleSubmit}>
            <h3>Dejá tu opinión</h3>

            <div className="resena-estrellas-elegir" role="radiogroup" aria-label="Puntaje" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={form.estrellas === n}
                        aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                        className={n <= mostrar ? "llena" : ""}
                        onMouseEnter={() => setHover(n)}
                        onClick={() => setForm((f) => ({ ...f, estrellas: n }))}
                    >
                        ★
                    </button>
                ))}
            </div>

            <label htmlFor="resena-nombre">Tu nombre</label>
            <input id="resena-nombre" type="text" maxLength={60} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Sofía" required />

            <label htmlFor="resena-texto">Tu experiencia</label>
            <textarea id="resena-texto" rows={4} maxLength={1000} value={form.texto} onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))} placeholder="¿Cómo te fue con tu tratamiento?" required />
            <small className="resena-contador">{form.texto.length}/1000</small>

            {error && (
                <p className="resena-error" role="alert">
                    {error}
                </p>
            )}

            <div className="resena-acciones">
                <button type="submit" className="opiniones-btn-dejar" disabled={enviando}>
                    {enviando ? "Enviando..." : "Publicar opinión"}
                </button>
                <button type="button" className="opiniones-link-ver resena-volver" onClick={onVolver}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};

// Ventana "Opiniones sobre Perfectanias".
const ModalOpiniones = ({ resenas, links, onCerrar }) => {
    const promedio = calcularPromedio(resenas);
    const [escribiendo, setEscribiendo] = useState(false);

    // Cerrar con Escape y bloquear el scroll de fondo mientras está abierta.
    useEffect(() => {
        const alPresionar = (e) => e.key === "Escape" && onCerrar();
        document.addEventListener("keydown", alPresionar);
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", alPresionar);
            document.body.style.overflow = overflowAnterior;
        };
    }, [onCerrar]);

    return createPortal(
        <div className="opiniones-overlay" onClick={onCerrar}>
            <div className="opiniones-modal" role="dialog" aria-modal="true" aria-labelledby="opiniones-titulo" onClick={(e) => e.stopPropagation()}>
                <div className="opiniones-encabezado">
                    <h2 id="opiniones-titulo">Opiniones sobre Perfectanias</h2>
                    <button type="button" className="opiniones-cerrar" onClick={onCerrar} aria-label="Cerrar">
                        ×
                    </button>
                </div>

                <div className="opiniones-cuerpo">
                    {/* LISTA DE OPINIONES */}
                    <div className="opiniones-lista">
                        {escribiendo ? (
                            <FormularioResena onVolver={() => setEscribiendo(false)} />
                        ) : resenas.length === 0 ? (
                            <p className="opiniones-vacio">Todavía no hay opiniones cargadas. ¡Sé la primera en dejar la tuya!</p>
                        ) : (
                            resenas.map((r) => (
                                <article key={r.id} className="opinion-card">
                                    <div className="opinion-cabecera">
                                        <strong>{r.nombre}</strong>
                                        <span className="opinion-fecha">{formatearFechaResena(r.fecha)}</span>
                                    </div>
                                    <Estrellas puntaje={r.estrellas} tamano={15} />
                                    {r.texto && <p className="opinion-texto">{r.texto}</p>}
                                    {r.respuesta && (
                                        <p className="opinion-respuesta">
                                            <strong>Respuesta de Perfectanias:</strong> {r.respuesta}
                                        </p>
                                    )}
                                    {r.origen === "agendamas" && <span className="opinion-origen">vía Agendamas</span>}
                                </article>
                            ))
                        )}
                    </div>

                    {/* RESUMEN */}
                    <aside className="opiniones-resumen">
                        <Estrellas puntaje={promedio} tamano={20} />
                        <div className="opiniones-puntaje-grande">
                            <Laurel />
                            <span>{formatearPuntaje(promedio)}</span>
                            <Laurel espejado />
                        </div>
                        <div className="opiniones-cantidad">
                            {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
                        </div>

                        <div className="opiniones-verificado">
                            <span className="opiniones-check" aria-hidden="true">
                                ✓
                            </span>
                            <span>
                                Opiniones reales de clientas, de esta web y de <strong>Agendamas</strong>
                            </span>
                        </div>

                        {!escribiendo && (
                            <button type="button" className="opiniones-btn-dejar" onClick={() => setEscribiendo(true)}>
                                Dejar reseña
                            </button>
                        )}
                        <a href={LINK_OPINIONES_AGENDAMAS} target="_blank" rel="noreferrer" className="opiniones-link-ver">
                            Ver en Agendamas
                        </a>
                        <a href={links.linkVer || LINK_MAPS_PERFECTANIAS} target="_blank" rel="noreferrer" className="opiniones-link-ver">
                            Ver en Google Maps
                        </a>
                    </aside>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const ResenasGoogle = () => {
    const [resenas, setResenas] = useState([]);
    const [links, setLinks] = useState(LINKS_POR_DEFECTO);
    const [cargado, setCargado] = useState(false);
    const [abierto, setAbierto] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                // Reseñas propias (Firestore) + las de Agendamas, que se actualizan solas.
                const [snapResenas, snapConfig, deAgendamas] = await Promise.all([
                    getDocs(collection(db, "resenas")),
                    getDoc(doc(db, "config", "resenas")),
                    cargarResenasAgendamas()
                ]);

                const propias = snapResenas.docs.map((d) => ({ id: d.id, ...d.data(), origen: "web" }));
                setResenas(unirResenas(propias, deAgendamas));
                if (snapConfig.exists()) setLinks({ ...LINKS_POR_DEFECTO, ...snapConfig.data() });
            } catch (error) {
                console.warn("No se pudieron cargar las reseñas:", error);
            } finally {
                setCargado(true);
            }
        };
        cargar();
    }, []);

    if (!cargado) return <div className="resenas-google-placeholder" />;

    const promedio = calcularPromedio(resenas);

    return (
        <>
            <button type="button" className="resenas-resumen-btn small" onClick={() => setAbierto(true)} title="Ver opiniones">
                {resenas.length > 0 ? (
                    <>
                        <Estrellas puntaje={promedio} />
                        <strong>{formatearPuntaje(promedio)}</strong>
                        <span className="resenas-cantidad">({resenas.length})</span>
                    </>
                ) : (
                    <span className="resenas-cantidad">✨ Dejanos tu opinión</span>
                )}
            </button>

            {abierto && <ModalOpiniones resenas={resenas} links={links} onCerrar={() => setAbierto(false)} />}
        </>
    );
};
