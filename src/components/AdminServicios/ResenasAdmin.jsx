import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";
import { Estrellas } from "../ResenasGoogle/ResenasGoogle";
import { LINKS_POR_DEFECTO, LINK_MAPS_PERFECTANIAS, LINK_OPINIONES_AGENDAMAS, calcularPromedio, cargarResenasAgendamas, formatearFechaResena, formatearPuntaje, unirResenas } from "../ResenasGoogle/resenasUtils";

const ROSA = "#d4a3b8";

const obtenerHoy = () => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
};

const formVacio = () => ({ nombre: "", fecha: obtenerHoy(), estrellas: "5", texto: "" });

export const ResenasAdmin = () => {
    const [resenas, setResenas] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [deAgendamas, setDeAgendamas] = useState([]);
    const [procesandoId, setProcesandoId] = useState(null);
    const [form, setForm] = useState(formVacio());
    const [editandoId, setEditandoId] = useState(null);
    const [links, setLinks] = useState(LINKS_POR_DEFECTO);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardandoLinks, setGuardandoLinks] = useState(false);

    const cargar = async () => {
        try {
            const [snapResenas, snapConfig, snapPendientes, externas] = await Promise.all([
                getDocs(collection(db, "resenas")),
                getDoc(doc(db, "config", "resenas")),
                getDocs(collection(db, "resenasPendientes")).catch(() => null),
                cargarResenasAgendamas()
            ]);
            setDeAgendamas(externas);
            setPendientes(snapPendientes ? snapPendientes.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""))) : []);
            setResenas(snapResenas.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""))));
            if (snapConfig.exists()) {
                const d = snapConfig.data();
                setLinks({ linkVer: d.linkVer || LINK_MAPS_PERFECTANIAS, linkDejar: d.linkDejar || LINK_MAPS_PERFECTANIAS });
            }
        } catch (err) {
            console.error(err);
            toast.error("No se pudieron cargar las reseñas.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
        cargar();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setForm(formVacio());
    };

    const iniciarEdicion = (r) => {
        setEditandoId(r.id);
        setForm({ nombre: r.nombre || "", fecha: r.fecha || obtenerHoy(), estrellas: String(r.estrellas || 5), texto: r.texto || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGuardarResena = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) {
            toast.warning("Ingresá el nombre de la clienta.");
            return;
        }

        const datos = {
            nombre: form.nombre.trim(),
            fecha: form.fecha || obtenerHoy(),
            estrellas: Math.max(1, Math.min(5, Number(form.estrellas) || 5)),
            texto: form.texto.trim()
        };

        setGuardando(true);
        try {
            if (editandoId) {
                await updateDoc(doc(db, "resenas", editandoId), datos);
                toast.success("Opinión actualizada.");
            } else {
                await addDoc(collection(db, "resenas"), datos);
                toast.success("Opinión agregada a la web.");
            }
            cancelarEdicion();
            await cargar();
        } catch (err) {
            console.error(err);
            toast.error("No se pudo guardar: " + err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (r) => {
        if (!window.confirm(`¿Borrar la opinión de ${r.nombre}?`)) return;
        try {
            await deleteDoc(doc(db, "resenas", r.id));
            if (editandoId === r.id) cancelarEdicion();
            setResenas((prev) => prev.filter((x) => x.id !== r.id));
            toast.success("Opinión borrada.");
        } catch (err) {
            toast.error("No se pudo borrar: " + err.message);
        }
    };

    // Aprobar: pasa a "resenas" (se publica) y se borra de pendientes, todo junto.
    const aprobar = async (p) => {
        setProcesandoId(p.id);
        try {
            const batch = writeBatch(db);
            batch.set(doc(collection(db, "resenas")), {
                nombre: p.nombre,
                fecha: p.fecha || obtenerHoy(),
                estrellas: Math.max(1, Math.min(5, Number(p.estrellas) || 5)),
                texto: p.texto || ""
            });
            batch.delete(doc(db, "resenasPendientes", p.id));
            await batch.commit();
            toast.success(`Opinión de ${p.nombre} publicada.`);
            await cargar();
        } catch (err) {
            toast.error("No se pudo aprobar: " + err.message);
        } finally {
            setProcesandoId(null);
        }
    };

    const rechazar = async (p) => {
        if (!window.confirm(`¿Descartar la opinión de ${p.nombre}? No se va a publicar.`)) return;
        setProcesandoId(p.id);
        try {
            await deleteDoc(doc(db, "resenasPendientes", p.id));
            setPendientes((prev) => prev.filter((x) => x.id !== p.id));
            toast.info("Opinión descartada.");
        } catch (err) {
            toast.error("No se pudo descartar: " + err.message);
        } finally {
            setProcesandoId(null);
        }
    };

    const handleGuardarLinks = async (e) => {
        e.preventDefault();
        setGuardandoLinks(true);
        try {
            await setDoc(doc(db, "config", "resenas"), {
                linkVer: links.linkVer.trim() || LINK_MAPS_PERFECTANIAS,
                linkDejar: links.linkDejar.trim() || LINK_MAPS_PERFECTANIAS
            });
            toast.success("Links guardados.");
        } catch (err) {
            toast.error("No se pudo guardar: " + err.message);
        } finally {
            setGuardandoLinks(false);
        }
    };

    if (cargando) return <p className="text-muted small">Cargando reseñas...</p>;

    // Lo que ve la clienta: propias + Agendamas sin repetir.
    const publicadas = unirResenas(resenas, deAgendamas);
    const promedio = calcularPromedio(publicadas);
    const idsVisibles = new Set(publicadas.map((r) => r.id));
    const agendamasVisibles = deAgendamas.filter((r) => idsVisibles.has(r.id));

    return (
        <div className="row g-4">
            {/* PENDIENTES DE APROBAR */}
            {pendientes.length > 0 && (
                <div className="col-12">
                    <div className="card p-4 shadow-sm rounded-4 bg-white" style={{ border: `2px solid ${ROSA}` }}>
                        <h5 className="fw-bold mb-1">💌 Opiniones nuevas para revisar ({pendientes.length})</h5>
                        <p className="text-muted small mb-3">Las dejaron clientas desde la web. Aprobalas para publicarlas o descartalas.</p>
                        <div className="d-flex flex-column gap-3">
                            {pendientes.map((p) => (
                                <div key={p.id} className="p-3 border rounded-3">
                                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                                        <div>
                                            <div className="fw-bold">{p.nombre}</div>
                                            <div className="d-flex align-items-center gap-2 small text-muted">
                                                <Estrellas puntaje={p.estrellas} tamano={12} />
                                                {formatearFechaResena(p.fecha)}
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="button" disabled={procesandoId === p.id} onClick={() => aprobar(p)} className="btn btn-sm rounded-pill px-3 fw-semibold border-0" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                                                Aprobar
                                            </button>
                                            <button type="button" disabled={procesandoId === p.id} onClick={() => rechazar(p)} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                    {p.texto && <p className="small mb-0 mt-2" style={{ whiteSpace: "pre-line" }}>{p.texto}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FORMULARIO */}
            <div className="col-lg-5">
                <div className="card p-4 shadow-sm border rounded-4 bg-white mb-4">
                    <h5 className="fw-bold mb-1">{editandoId ? "Editar opinión" : "Agregar opinión"}</h5>
                    <p className="text-muted small mb-3">Para sumar a mano una reseña de Google Maps u otro lugar. Las de Agendamas se suman solas.</p>

                    <form onSubmit={handleGuardarResena} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold">Nombre de la clienta</label>
                            <input type="text" name="nombre" className="form-control" maxLength={60} placeholder="Ej: Sol" value={form.nombre} onChange={handleChange} required />
                        </div>

                        <div className="row g-2">
                            <div className="col-7">
                                <label className="form-label small fw-semibold">Fecha</label>
                                <input type="date" name="fecha" className="form-control" value={form.fecha} onChange={handleChange} required />
                            </div>
                            <div className="col-5">
                                <label className="form-label small fw-semibold">Estrellas</label>
                                <select name="estrellas" className="form-select" value={form.estrellas} onChange={handleChange}>
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <option key={n} value={n}>
                                            {"★".repeat(n)} ({n})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="form-label small fw-semibold">Opinión</label>
                            <textarea name="texto" rows="4" maxLength={1500} className="form-control" placeholder="Son las mejores..." value={form.texto} onChange={handleChange} />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" disabled={guardando} className="btn rounded-pill fw-bold px-4 border-0" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                                {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar opinión"}
                            </button>
                            {editandoId && (
                                <button type="button" onClick={cancelarEdicion} className="btn btn-outline-secondary rounded-pill px-3">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* LINKS */}
                <div className="card p-4 shadow-sm border rounded-4 bg-white">
                    <h6 className="fw-bold mb-3">Link de Google Maps</h6>
                    <form onSubmit={handleGuardarLinks} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold">Ver todas las reseñas</label>
                            <input type="url" className="form-control" value={links.linkVer} onChange={(e) => setLinks((p) => ({ ...p, linkVer: e.target.value }))} />
                        </div>
                        <button type="submit" disabled={guardandoLinks} className="btn btn-outline-secondary rounded-pill px-4 align-self-start">
                            {guardandoLinks ? "Guardando..." : "Guardar links"}
                        </button>
                    </form>
                </div>
            </div>

            {/* LISTADO */}
            <div className="col-lg-7">
                <div className="card p-4 shadow-sm border rounded-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <h5 className="fw-bold m-0">Opiniones en la web ({publicadas.length})</h5>
                        {publicadas.length > 0 && (
                            <span className="d-flex align-items-center gap-2 small">
                                <Estrellas puntaje={promedio} />
                                <strong>{formatearPuntaje(promedio)}</strong>
                                <span className="text-muted">promedio</span>
                            </span>
                        )}
                    </div>

                    {/* DE AGENDAMAS (solo lectura) */}
                    <div className="p-3 rounded-3 mb-3 small" style={{ backgroundColor: "#fff7fa", border: "1px solid #f1e3e9" }}>
                        <div className="fw-semibold mb-1">🔄 De Agendamas: {agendamasVisibles.length} {agendamasVisibles.length === 1 ? "opinión" : "opiniones"}</div>
                        <div className="text-muted">
                            Se leen automáticamente de{" "}
                            <a href={LINK_OPINIONES_AGENDAMAS} target="_blank" rel="noreferrer" style={{ color: "#bd829d" }}>
                                tu página de Agendamas
                            </a>{" "}
                            (se actualizan cada hora). Para editarlas o borrarlas, hacelo en Agendamas.
                            {deAgendamas.length > agendamasVisibles.length && ` ${deAgendamas.length - agendamasVisibles.length} no se muestran porque ya las cargaste a mano abajo.`}
                        </div>
                        {agendamasVisibles.map((r) => (
                            <div key={r.id} className="d-flex align-items-center gap-2 mt-2">
                                <Estrellas puntaje={r.estrellas} tamano={11} />
                                <strong>{r.nombre}</strong>
                                <span className="text-muted">· {formatearFechaResena(r.fecha)}</span>
                            </div>
                        ))}
                    </div>

                    <h6 className="fw-bold small text-uppercase text-muted">Cargadas en esta web ({resenas.length})</h6>
                    {resenas.length === 0 ? (
                        <p className="text-muted small m-0">Todavía no hay opiniones cargadas acá.</p>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {resenas.map((r) => (
                                <div key={r.id} className="p-3 border rounded-3">
                                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                                        <div>
                                            <div className="fw-bold">{r.nombre}</div>
                                            <div className="d-flex align-items-center gap-2 small text-muted">
                                                <Estrellas puntaje={r.estrellas} tamano={12} />
                                                {formatearFechaResena(r.fecha)}
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="button" onClick={() => iniciarEdicion(r)} className="btn btn-sm btn-outline-dark rounded-pill px-3">
                                                Editar
                                            </button>
                                            <button type="button" onClick={() => handleEliminar(r)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                    {r.texto && <p className="small mb-0 mt-2" style={{ whiteSpace: "pre-line" }}>{r.texto}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
