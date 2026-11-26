import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../../firebase/config";
import { DATOS_LEGALES_POR_DEFECTO, DOCUMENTOS_LEGALES, POLITICAS_SENA, camposFaltantes, cargarDatosLegales } from "../../utils/legales";

const ROSA = "#d4a3b8";

const hoyTexto = () => new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

// Datos del local que completan la Política de privacidad, Términos, Cancelación y el pie de la web.
export const LegalesAdmin = () => {
    const [form, setForm] = useState(DATOS_LEGALES_POR_DEFECTO);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargarDatosLegales(true).then((d) => {
            setForm(d);
            setCargando(false);
        });
    }, []);

    const cambiar = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const datos = {
            titular: form.titular.trim(),
            cuit: form.cuit.trim(),
            email: form.email.trim(),
            domicilio: form.domicilio.trim(),
            whatsapp: String(form.whatsapp).replace(/\D/g, ""),
            instagram: form.instagram.trim(),
            horasCancelacion: Math.max(1, Number(form.horasCancelacion) || 24),
            toleranciaMinutos: Math.max(0, Number(form.toleranciaMinutos) || 15),
            politicaSena: POLITICAS_SENA.some((p) => p.id === form.politicaSena) ? form.politicaSena : "reprogramar",
            diasReprogramar: Math.max(1, Number(form.diasReprogramar) || 30),
            actualizado: hoyTexto()
        };
        try {
            await setDoc(doc(db, "config", "legales"), datos);
            setForm(datos);
            await cargarDatosLegales(true);
            toast.success("Datos legales guardados. Ya se ven en la web.");
        } catch (err) {
            toast.error("No se pudo guardar: " + err.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <p className="text-muted small">Cargando...</p>;

    const faltan = camposFaltantes(form);

    return (
        <div className="row g-4">
            <div className="col-lg-7">
                <div className="card p-4 shadow-sm border rounded-4 bg-white">
                    <h5 className="fw-bold mb-1">📄 Datos del local</h5>
                    <p className="text-muted small mb-4">Se usan en la Política de privacidad, los Términos y condiciones, la Política de cancelación y el pie de la web.</p>

                    <form onSubmit={guardar} className="d-flex flex-column gap-3">
                        <div className="row g-2">
                            <div className="col-md-7">
                                <label className="form-label small fw-semibold" htmlFor="leg-titular">
                                    Nombre del titular o razón social *
                                </label>
                                <input id="leg-titular" name="titular" className="form-control" maxLength={120} value={form.titular} onChange={cambiar} placeholder="Ej: Iara Sánchez" />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-semibold" htmlFor="leg-cuit">
                                    CUIT / CUIL (opcional)
                                </label>
                                <input id="leg-cuit" name="cuit" className="form-control" maxLength={20} value={form.cuit} onChange={cambiar} placeholder="27-12345678-9" />
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold" htmlFor="leg-email">
                                    Email de contacto *
                                </label>
                                <input id="leg-email" name="email" type="email" className="form-control" maxLength={120} value={form.email} onChange={cambiar} placeholder="perfectanias@gmail.com" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-semibold" htmlFor="leg-whatsapp">
                                    WhatsApp (con código de país)
                                </label>
                                <input id="leg-whatsapp" name="whatsapp" className="form-control" maxLength={20} value={form.whatsapp} onChange={cambiar} placeholder="5491112345678" />
                            </div>
                        </div>

                        <div>
                            <label className="form-label small fw-semibold" htmlFor="leg-domicilio">
                                Domicilio legal *
                            </label>
                            <input id="leg-domicilio" name="domicilio" className="form-control" maxLength={160} value={form.domicilio} onChange={cambiar} placeholder="Calle 123, Localidad, Provincia de Buenos Aires" />
                        </div>

                        <div>
                            <label className="form-label small fw-semibold" htmlFor="leg-instagram">
                                Instagram (link)
                            </label>
                            <input id="leg-instagram" name="instagram" type="url" className="form-control" value={form.instagram} onChange={cambiar} />
                        </div>

                        <h6 className="fw-bold mt-2 mb-0">Política de cancelación</h6>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold" htmlFor="leg-horas">
                                    Aviso mínimo (horas)
                                </label>
                                <input id="leg-horas" name="horasCancelacion" type="number" min="1" className="form-control" value={form.horasCancelacion} onChange={cambiar} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold" htmlFor="leg-tolerancia">
                                    Tolerancia de llegada (min)
                                </label>
                                <input id="leg-tolerancia" name="toleranciaMinutos" type="number" min="0" className="form-control" value={form.toleranciaMinutos} onChange={cambiar} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold" htmlFor="leg-dias">
                                    Días para reprogramar
                                </label>
                                <input id="leg-dias" name="diasReprogramar" type="number" min="1" className="form-control" value={form.diasReprogramar} onChange={cambiar} disabled={form.politicaSena !== "reprogramar"} />
                            </div>
                        </div>
                        <div>
                            <label className="form-label small fw-semibold" htmlFor="leg-sena">
                                Si cancelan a tiempo…
                            </label>
                            <select id="leg-sena" name="politicaSena" className="form-select" value={form.politicaSena} onChange={cambiar}>
                                {POLITICAS_SENA.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.texto}
                                    </option>
                                ))}
                            </select>
                            <small className="text-muted">Si cancelan tarde o no vienen, la seña no se devuelve.</small>
                        </div>

                        <button type="submit" disabled={guardando} className="btn rounded-pill fw-bold px-4 border-0 align-self-start" style={{ backgroundColor: ROSA, color: "#ffffff" }}>
                            {guardando ? "Guardando..." : "Guardar datos"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="col-lg-5">
                <div className="card p-4 shadow-sm border rounded-4 bg-white mb-4">
                    <h6 className="fw-bold mb-2">Estado</h6>
                    {faltan.length === 0 ? (
                        <p className="small mb-0" style={{ color: "#2e9d6a" }}>
                            ✓ Los textos legales están completos.
                        </p>
                    ) : (
                        <>
                            <p className="small mb-2" style={{ color: "#b04a68" }}>
                                Faltan completar ({faltan.length}). En la web aparecen marcados como “a completar”:
                            </p>
                            <ul className="small mb-0">
                                {faltan.map((f) => (
                                    <li key={f.id}>{f.texto}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    {form.actualizado && <p className="small text-muted mt-2 mb-0">Última actualización: {form.actualizado}</p>}
                </div>

                <div className="card p-4 shadow-sm border rounded-4 bg-white">
                    <h6 className="fw-bold mb-2">Ver las páginas</h6>
                    <div className="d-flex flex-column gap-2">
                        {DOCUMENTOS_LEGALES.map((d) => (
                            <Link key={d.id} to={`/legales/${d.id}`} target="_blank" className="small fw-semibold" style={{ color: "#bd829d" }}>
                                {d.titulo} ↗
                            </Link>
                        ))}
                    </div>
                    <p className="small text-muted mt-3 mb-0">Son textos base para Argentina (Ley 25.326 y Ley 24.240). Conviene que los revise un abogado o contador antes de usarlos de forma definitiva.</p>
                </div>
            </div>
        </div>
    );
};
