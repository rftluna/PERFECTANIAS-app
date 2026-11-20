import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import "./ResenasGoogle.css";

// Ficha de Perfectanias en Google Maps (link corto por CID, no vence).
export const LINK_MAPS_PERFECTANIAS = "https://www.google.com/maps?cid=10425680960657163280";

export const LINKS_POR_DEFECTO = {
    linkVer: LINK_MAPS_PERFECTANIAS,
    linkDejar: LINK_MAPS_PERFECTANIAS
};

// Promedio con un decimal (ej: 4.8). Sin reseñas = 0.
export const calcularPromedio = (lista) => {
    if (!lista.length) return 0;
    const suma = lista.reduce((acc, r) => acc + Number(r.estrellas || 0), 0);
    return Math.round((suma / lista.length) * 10) / 10;
};

export const formatearPuntaje = (valor) =>
    Number(valor || 0).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// "2026-10-26" -> "26 oct 2026"
export const formatearFechaResena = (fecha) => {
    if (!fecha) return "";
    const [a, m, d] = String(fecha).split("-").map(Number);
    if (!a || !m || !d) return String(fecha);
    return new Date(a, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "").replace(/ de /g, " ");
};

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

// Ventana "Opiniones sobre Perfectanias".
const ModalOpiniones = ({ resenas, links, onCerrar }) => {
    const promedio = calcularPromedio(resenas);

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
                        {resenas.length === 0 ? (
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
                                Opiniones de clientas publicadas en <strong>Google Maps</strong>
                            </span>
                        </div>

                        <a href={links.linkDejar || LINK_MAPS_PERFECTANIAS} target="_blank" rel="noreferrer" className="opiniones-btn-dejar">
                            Dejar reseña
                        </a>
                        <a href={links.linkVer || LINK_MAPS_PERFECTANIAS} target="_blank" rel="noreferrer" className="opiniones-link-ver">
                            Ver todas en Google Maps
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
                const [snapResenas, snapConfig] = await Promise.all([getDocs(collection(db, "resenas")), getDoc(doc(db, "config", "resenas"))]);

                const lista = snapResenas.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));

                setResenas(lista);
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
