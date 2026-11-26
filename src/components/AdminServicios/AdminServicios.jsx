import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTurno } from "../../context/TurnoContext";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";
import { ReservasAdmin } from "./ReservasAdmin";
import { ResenasAdmin } from "./ResenasAdmin";
import { AccesoAdmin } from "./AccesoAdmin";
import { EquipoAdmin } from "./EquipoAdmin";
import { FotoServicio } from "../IlustracionServicio/IlustracionServicio";
import { CATEGORIA_POR_DEFECTO, DURACION_POR_DEFECTO, ORDENES, SECCIONES, SECCION_POR_DEFECTO, categoriasDe, duracionDe, limpiarCategoria, normalizarCategoria, ordenarServicios, seccionDe } from "../../utils/servicios";

const formInicial = {
    name: "",
    price: "",
    duration: String(DURACION_POR_DEFECTO),
    seccion: SECCION_POR_DEFECTO,
    category: CATEGORIA_POR_DEFECTO,
    description: "",
    image: ""
};

export const AdminServicios = () => {
    // La sesión viene del AuthContext (el login rosa está en /admin/login).
    const { user: usuario, logout } = useAuth();
    const navigate = useNavigate();
    // Para que el catálogo público (en memoria) muestre los cambios sin recargar la página.
    const { cargarServicios: refrescarCatalogoPublico } = useTurno();

    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(formInicial);
    const [guardando, setGuardando] = useState(false);
    const [seccion, setSeccion] = useState("reservas");
    const [ordenServicios, setOrdenServicios] = useState("recomendados");
    const [filtroCategoriaAdmin, setFiltroCategoriaAdmin] = useState("todos");
    const [filtroSeccionAdmin, setFiltroSeccionAdmin] = useState("todas");

    const cargarServicios = async () => {
        setLoadingServicios(true);
        try {
            const snap = await getDocs(collection(db, "servicios"));
            const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setServicios(lista);
        } catch (err) {
            console.error(err);
            toast.error("No se pudieron cargar los servicios.");
        } finally {
            setLoadingServicios(false);
        }
    };

    useEffect(() => {
        if (usuario) {
            cargarServicios();
        }
    }, [usuario]);

    // Filtros y orden de la lista "Servicios cargados" (mismos que en el catálogo público).
    const categoriasExistentes = categoriasDe(servicios);
    const serviciosVisibles = ordenarServicios(
        servicios
            .filter((srv) => filtroSeccionAdmin === "todas" || seccionDe(srv) === filtroSeccionAdmin)
            .filter((srv) => filtroCategoriaAdmin === "todos" || normalizarCategoria(srv.category) === normalizarCategoria(filtroCategoriaAdmin)),
        ordenServicios
    );
    const nombreSeccion = (id) => SECCIONES.find((s) => s.id === id)?.nombre || id;

    const estiloChip = (activo) => ({
        backgroundColor: activo ? "#d4a3b8" : "#fff7fa",
        color: activo ? "#ffffff" : "#bd829d",
        border: `1px solid ${activo ? "#d4a3b8" : "#ead1dc"}`,
        fontSize: "12px"
    });

    const handleLogout = async () => {
        await logout();
        setEditandoId(null);
        setForm(formInicial);
        navigate("/admin/login", { replace: true });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const iniciarEdicion = (srv) => {
        setEditandoId(srv.id);
        setForm({
            name: srv.name || "",
            price: srv.price ?? "",
            duration: String(duracionDe(srv)),
            seccion: seccionDe(srv),
            category: limpiarCategoria(srv.category) || CATEGORIA_POR_DEFECTO,
            description: srv.description || "",
            image: srv.image || ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setForm(formInicial);
    };

    const handleGuardarServicio = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.warning("Ingresá el nombre del servicio.");
            return;
        }
        setGuardando(true);
        const payload = {
            name: form.name.trim(),
            price: Number(form.price || 0),
            duration: Number(form.duration) > 0 ? Number(form.duration) : DURACION_POR_DEFECTO,
            seccion: seccionDe(form),
            category: limpiarCategoria(form.category) || CATEGORIA_POR_DEFECTO,
            description: form.description.trim(),
            image: form.image.trim()
        };

        try {
            if (editandoId) {
                await updateDoc(doc(db, "servicios", editandoId), payload);
                toast.success("Servicio actualizado.");
            } else {
                await addDoc(collection(db, "servicios"), payload);
                toast.success("Servicio creado.");
            }
            cancelarEdicion();
            await Promise.all([cargarServicios(), refrescarCatalogoPublico()]);
        } catch (err) {
            toast.error("Error al guardar: " + err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar "${nombre}" del catálogo?`)) return;
        try {
            await deleteDoc(doc(db, "servicios", id));
            toast.success("Servicio eliminado.");
            if (editandoId === id) cancelarEdicion();
            await Promise.all([cargarServicios(), refrescarCatalogoPublico()]);
        } catch (err) {
            toast.error("No se pudo eliminar: " + err.message);
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-4 border-bottom">
                <div>
                    <h4 className="fw-bold m-0" style={{ color: "#e358ed" }}>
                        Panel de Perfectanias
                    </h4>
                    <small className="text-muted">Sesión: {usuario.email}</small>
                </div>
                <button type="button" onClick={handleLogout} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    Cerrar sesión
                </button>
            </div>

            {/* PESTAÑAS DEL PANEL */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {[
                    { id: "reservas", texto: "📅 Reservas" },
                    { id: "servicios", texto: "💅 Servicios" },
                    { id: "resenas", texto: "⭐ Reseñas" },
                    { id: "equipo", texto: "👭 Equipo" },
                    { id: "acceso", texto: "🔐 Acceso" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSeccion(tab.id)}
                        className="btn rounded-pill px-4 fw-semibold"
                        style={{
                            backgroundColor: seccion === tab.id ? "#d4a3b8" : "#fff0f5",
                            color: seccion === tab.id ? "#ffffff" : "#c47d9d",
                            border: "none"
                        }}
                    >
                        {tab.texto}
                    </button>
                ))}
            </div>

            {seccion === "reservas" ? (
                <ReservasAdmin />
            ) : seccion === "resenas" ? (
                <ResenasAdmin />
            ) : seccion === "equipo" ? (
                <EquipoAdmin />
            ) : seccion === "acceso" ? (
                <AccesoAdmin />
            ) : (
            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card p-4 shadow-sm border rounded-4 bg-white">
                        <h5 className="fw-bold mb-3">{editandoId ? "Editar servicio" : "Nuevo servicio"}</h5>
                        <form onSubmit={handleGuardarServicio} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label small fw-semibold">Nombre del servicio</label>
                                <input type="text" name="name" className="form-control" placeholder="Ej: Lifting de pestañas" value={form.name} onChange={handleChange} required />
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="form-label small fw-semibold">Precio ($)</label>
                                    <input type="number" name="price" min="0" className="form-control" value={form.price} onChange={handleChange} />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-semibold">Duración (min)</label>
                                    <input type="number" name="duration" min="10" className="form-control" value={form.duration} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="form-label small fw-semibold" htmlFor="servicio-seccion">
                                        Sección (pestaña)
                                    </label>
                                    <select id="servicio-seccion" name="seccion" className="form-select" value={form.seccion} onChange={handleChange}>
                                        {SECCIONES.map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                {sec.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-semibold" htmlFor="servicio-categoria">
                                        Categoría
                                    </label>
                                    {/* Se puede elegir una existente o escribir una nueva: aparece sola como filtro en la web. */}
                                    <input id="servicio-categoria" type="text" name="category" list="categorias-existentes" className="form-control" value={form.category} onChange={handleChange} required />
                                    <datalist id="categorias-existentes">
                                        {[...new Set([CATEGORIA_POR_DEFECTO, "Combos", ...categoriasExistentes])].map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="form-label small fw-semibold">URL de la foto (ImgBB u otra)</label>
                                <input type="url" name="image" className="form-control" placeholder="https://i.ibb.co/..." value={form.image} onChange={handleChange} />
                                {form.image && (
                                    <div className="mt-2">
                                        <img
                                            src={form.image}
                                            alt="Vista previa"
                                            style={{
                                                width: "76px",
                                                height: "76px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                                border: "1px solid #ece4e8"
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="form-label small fw-semibold">Descripción</label>
                                <textarea name="description" rows="3" className="form-control" placeholder="Detalle del tratamiento..." value={form.description} onChange={handleChange} />
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" disabled={guardando} className="btn rounded-pill fw-bold px-4 border-0" style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }}>
                                    {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar servicio"}
                                </button>
                                {editandoId && (
                                    <button type="button" onClick={cancelarEdicion} className="btn btn-outline-secondary rounded-pill px-3">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card p-4 shadow-sm border rounded-4 bg-white">
                        <h5 className="fw-bold mb-3">
                            Servicios cargados ({serviciosVisibles.length}
                            {serviciosVisibles.length !== servicios.length ? ` de ${servicios.length}` : ""})
                        </h5>

                        {/* FILTROS Y ORDEN */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                            <div className="d-flex flex-wrap gap-2">
                                {[{ id: "todas", texto: "Todas las secciones" }, ...SECCIONES.map((sec) => ({ id: sec.id, texto: sec.nombre }))].map((f) => (
                                    <button key={f.id} type="button" onClick={() => setFiltroSeccionAdmin(f.id)} aria-pressed={filtroSeccionAdmin === f.id} className="btn btn-sm rounded-pill px-3 fw-semibold" style={estiloChip(filtroSeccionAdmin === f.id)}>
                                        {f.texto}
                                    </button>
                                ))}
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {[{ id: "todos", texto: "Todas las categorías" }, ...categoriasExistentes.map((cat) => ({ id: cat, texto: cat }))].map((f) => (
                                    <button key={f.id} type="button" onClick={() => setFiltroCategoriaAdmin(f.id)} aria-pressed={filtroCategoriaAdmin === f.id} className="btn btn-sm rounded-pill px-3 fw-semibold" style={estiloChip(filtroCategoriaAdmin === f.id)}>
                                        {f.texto}
                                    </button>
                                ))}
                            </div>

                            <label className="d-inline-flex align-items-center gap-2 m-0 small fw-semibold" style={{ color: "#987587" }}>
                                Ordenar:
                                <select
                                    value={ordenServicios}
                                    onChange={(e) => setOrdenServicios(e.target.value)}
                                    className="form-select form-select-sm rounded-pill fw-semibold"
                                    style={{ width: "auto", borderColor: "#ead1dc", color: "#bd829d", fontSize: "12px" }}
                                    aria-label="Ordenar servicios"
                                >
                                    {ORDENES.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.texto}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        {loadingServicios ? (
                            <p className="text-muted small">Cargando servicios...</p>
                        ) : serviciosVisibles.length === 0 ? (
                            <p className="text-muted small">{servicios.length === 0 ? "Todavía no hay servicios cargados." : "No hay servicios con estos filtros."}</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {serviciosVisibles.map((srv) => (
                                    <div key={srv.id} className="d-flex justify-content-between align-items-center gap-3 p-3 border rounded-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <FotoServicio servicio={srv} className="admin-thumb-servicio" />
                                            <div>
                                                <div className="fw-bold">{srv.name}</div>
                                                <div className="small text-muted">
                                                    ${Number(srv.price || 0).toLocaleString("es-AR")} · {duracionDe(srv)} min · {nombreSeccion(seccionDe(srv))} · {limpiarCategoria(srv.category) || "General"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="button" onClick={() => iniciarEdicion(srv)} className="btn btn-sm btn-outline-dark rounded-pill px-3">
                                                Editar
                                            </button>
                                            <button type="button" onClick={() => handleEliminar(srv.id, srv.name)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
