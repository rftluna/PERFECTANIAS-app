import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";
import { Estrellas, LINKS_POR_DEFECTO, LINK_MAPS_PERFECTANIAS, calcularPromedio, formatearFechaResena, formatearPuntaje } from "../ResenasGoogle/ResenasGoogle";

const ROSA = "#d4a3b8";

const obtenerHoy = () => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
};

const formVacio = () => ({ nombre: "", fecha: obtenerHoy(), estrellas: "5", texto: "" });

export const ResenasAdmin = () => {
    const [resenas, setResenas] = useState([]);
    const [form, setForm] = useState(formVacio());
    const [editandoId, setEditandoId] = useState(null);
    const [links, setLinks] = useState(LINKS_POR_DEFECTO);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardandoLinks, setGuardandoLinks] = useState(false);

    const cargar = async () => {
        try {
            const [snapResenas, snapConfig] = await Promise.all([getDocs(collection(db, "resenas")), getDoc(doc(db, "config", "resenas"))]);
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

    const promedio = calcularPromedio(resenas);

    return (
        <div className="row g-4">
            {/* FORMULARIO */}
            <div className="col-lg-5">
                <div className="card p-4 shadow-sm border rounded-4 bg-white mb-4">
                    <h5 className="fw-bold mb-1">{editandoId ? "Editar opinión" : "Agregar opinión"}</h5>
                    <p className="text-muted small mb-3">Copiá la reseña tal cual aparece en Google Maps.</p>

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
                    <h6 className="fw-bold mb-3">Links de Google</h6>
                    <form onSubmit={handleGuardarLinks} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold">Ver todas las reseñas</label>
                            <input type="url" className="form-control" value={links.linkVer} onChange={(e) => setLinks((p) => ({ ...p, linkVer: e.target.value }))} />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Botón “Dejar reseña”</label>
                            <input type="url" className="form-control" placeholder="https://g.page/r/.../review" value={links.linkDejar} onChange={(e) => setLinks((p) => ({ ...p, linkDejar: e.target.value }))} />
                            <small className="text-muted">
                                En tu Perfil de Empresa de Google → <strong>Pedir reseñas</strong> → copiá el link y pegalo acá.
                            </small>
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
                        <h5 className="fw-bold m-0">Opiniones en la web ({resenas.length})</h5>
                        {resenas.length > 0 && (
                            <span className="d-flex align-items-center gap-2 small">
                                <Estrellas puntaje={promedio} />
                                <strong>{formatearPuntaje(promedio)}</strong>
                                <span className="text-muted">promedio</span>
                            </span>
                        )}
                    </div>

                    {resenas.length === 0 ? (
                        <p className="text-muted small m-0">Todavía no cargaste opiniones. Agregá las que ya tenés en Google Maps.</p>
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
