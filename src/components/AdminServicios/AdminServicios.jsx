import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";

const formInicial = {
    name: "",
    price: "",
    duration: "60",
    category: "Modelado - Tratamientos",
    description: "",
    image: ""
};

export const AdminServicios = () => {
    const auth = getAuth();
    const [usuario, setUsuario] = useState(null);
    const [authCargando, setAuthCargando] = useState(true);
    const [emailLogin, setEmailLogin] = useState("");
    const [passwordLogin, setPasswordLogin] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState(formInicial);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
            setAuthCargando(false);
        });
        return () => unsub();
    }, [auth]);

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        try {
            await signInWithEmailAndPassword(auth, emailLogin.trim(), passwordLogin);
            toast.success("Bienvenida al panel de Perfectanias.");
            setEmailLogin("");
            setPasswordLogin("");
        } catch (err) {
            toast.error("Credenciales inválidas: " + err.message);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setEditandoId(null);
        setForm(formInicial);
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
            duration: srv.duration ?? "60",
            category: srv.category || "Modelado - Tratamientos",
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
            duration: Number(form.duration || 60),
            category: form.category.trim() || "Modelado - Tratamientos",
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
            await cargarServicios();
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
            await cargarServicios();
        } catch (err) {
            toast.error("No se pudo eliminar: " + err.message);
        }
    };

    if (authCargando) {
        return <div className="container py-5 text-center text-muted">Verificando acceso...</div>;
    }

    if (!usuario) {
        return (
            <div className="container py-5" style={{ maxWidth: "420px" }}>
                <div className="card p-4 shadow-sm border rounded-4 bg-white">
                    <h4 className="fw-bold mb-1">Panel Administradora</h4>
                    <p className="text-muted small mb-4">Ingresá con tu cuenta para editar precios, textos y fotos.</p>
                    <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                        <div>
                            <label className="form-label small fw-semibold">Correo electrónico</label>
                            <input type="email" className="form-control" required value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Contraseña</label>
                            <input type="password" className="form-control" required value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} />
                        </div>
                        <button type="submit" disabled={loginLoading} className="btn rounded-pill fw-bold py-2 border-0" style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }}>
                            {loginLoading ? "Ingresando..." : "Ingresar"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-4 border-bottom">
                <div>
                    <h4 className="fw-bold m-0" style={{ color: "#e358ed" }}>
                        Gestión de Servicios — Perfectanias
                    </h4>
                    <small className="text-muted">Sesión: {usuario.email}</small>
                </div>
                <button type="button" onClick={handleLogout} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    Cerrar sesión
                </button>
            </div>

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

                            <div>
                                <label className="form-label small fw-semibold">Categoría</label>
                                <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                                    <option value="Modelado - Tratamientos">Modelado - Tratamientos</option>
                                    <option value="Combos">Combos</option>
                                </select>
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
                        <h5 className="fw-bold mb-3">Servicios cargados ({servicios.length})</h5>
                        {loadingServicios ? (
                            <p className="text-muted small">Cargando servicios...</p>
                        ) : servicios.length === 0 ? (
                            <p className="text-muted small">Todavía no hay servicios cargados.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {servicios.map((srv) => (
                                    <div key={srv.id} className="d-flex justify-content-between align-items-center gap-3 p-3 border rounded-3">
                                        <div className="d-flex align-items-center gap-3">
                                            {srv.image && (
                                                <img
                                                    src={srv.image}
                                                    alt={srv.name}
                                                    style={{
                                                        width: "54px",
                                                        height: "54px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px"
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            )}
                                            <div>
                                                <div className="fw-bold">{srv.name}</div>
                                                <div className="small text-muted">
                                                    ${Number(srv.price || 0).toLocaleString("es-AR")} · {srv.duration || 60} min · {srv.category || "General"}
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
        </div>
    );
};
