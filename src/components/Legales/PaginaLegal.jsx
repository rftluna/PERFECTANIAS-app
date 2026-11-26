import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { NotFound } from "../NotFound/NotFound";
import { DOCUMENTOS_LEGALES, linkWhatsAppLocal } from "../../utils/legales";
import { useDatosLegales } from "../../utils/useDatosLegales";
import { useMetaPagina } from "../../utils/useMetaPagina";
import { SENA_TEXTO } from "../../utils/servicios";
import "./Legales.css";

// Muestra un dato del local; si falta, un aviso rosa "a completar" (se carga en /admin → Legales).
const Dato = ({ valor, nombre }) =>
    String(valor || "").trim() ? <strong>{valor}</strong> : <span className="legal-falta">[a completar: {nombre}]</span>;

const Seccion = ({ titulo, children }) => (
    <section className="legal-seccion">
        <h2>{titulo}</h2>
        {children}
    </section>
);

// ---------- TÉRMINOS Y CONDICIONES ----------
const Terminos = ({ d }) => (
    <>
        <Seccion titulo="1. Quiénes somos">
            <p>
                Este sitio pertenece a <Dato valor={d.titular} nombre="titular o razón social" />
                {d.cuit && <> (CUIT {d.cuit})</>}, con domicilio en <Dato valor={d.domicilio} nombre="domicilio" />, que presta servicios estéticos de pestañas, cejas y uñas bajo el nombre
                comercial <strong>Perfectanias</strong> (en adelante, “Perfectanias”). Contacto: <Dato valor={d.email} nombre="email" />.
            </p>
        </Seccion>

        <Seccion titulo="2. Uso del sitio">
            <p>
                El sitio permite consultar servicios y precios y reservar turnos online. Al reservar, la clienta declara haber leído y aceptado estos Términos y condiciones, la{" "}
                <Link to="/legales/privacidad">Política de privacidad</Link> y la <Link to="/legales/cancelacion">Política de cancelación</Link>.
            </p>
        </Seccion>

        <Seccion titulo="3. Precios y seña">
            <ul>
                <li>Los precios se expresan en pesos argentinos e incluyen impuestos. Pueden cambiar sin previo aviso; se respeta el precio vigente al momento de la reserva.</li>
                <li>
                    Para confirmar el turno se abona una seña del <strong>{SENA_TEXTO}</strong> del total por transferencia bancaria. El comprobante se envía por WhatsApp. El saldo se abona en el local el día del turno.
                </li>
                <li>El turno queda confirmado cuando Perfectanias recibe la seña.</li>
            </ul>
        </Seccion>

        <Seccion titulo="4. Información sobre los servicios">
            <ul>
                <li>Las duraciones son aproximadas y pueden variar según cada caso.</li>
                <li>
                    Algunas imágenes del catálogo son <strong>fotos de referencia</strong> (identificadas como tales) que muestran una idea del resultado; no son trabajos realizados por Perfectanias. El resultado final depende de las
                    características de cada clienta.
                </li>
                <li>
                    Antes del servicio, la clienta debe informar alergias, sensibilidad, tratamientos oculares o cualquier condición de salud relevante. Perfectanias puede no realizar el servicio si considera que hay un riesgo para la
                    clienta.
                </li>
                <li>Las menores de 18 años deben contar con autorización y, cuando corresponda, compañía de una persona adulta responsable.</li>
            </ul>
        </Seccion>

        <Seccion titulo="5. Cancelaciones, demoras y reprogramaciones">
            <p>
                Se rigen por la <Link to="/legales/cancelacion">Política de cancelación</Link>.
            </p>
        </Seccion>

        <Seccion titulo="6. Derecho de arrepentimiento">
            <p>
                Conforme al artículo 34 de la Ley 24.240 de Defensa del Consumidor, quien contrata a distancia puede revocar la contratación dentro de los 10 días corridos, sin costo ni responsabilidad, mientras el servicio no se haya
                prestado. Para hacerlo, usá el <Link to="/legales/arrepentimiento">Botón de arrepentimiento</Link>.
            </p>
        </Seccion>

        <Seccion titulo="7. Responsabilidad">
            <p>
                Perfectanias realiza los servicios con productos y prácticas adecuadas. No es responsable por reacciones derivadas de información de salud no informada, ni por el incumplimiento de los cuidados posteriores indicados.
                El sitio puede tener interrupciones temporales por mantenimiento o fallas de terceros.
            </p>
        </Seccion>

        <Seccion titulo="8. Cambios y ley aplicable">
            <p>
                Perfectanias puede actualizar estos términos; la versión vigente es la publicada en este sitio. Se aplican las leyes de la República Argentina. Ante cualquier reclamo podés escribirnos a{" "}
                <Dato valor={d.email} nombre="email" /> o acudir a la autoridad de Defensa del Consumidor de tu jurisdicción.
            </p>
        </Seccion>
    </>
);

// ---------- POLÍTICA DE PRIVACIDAD ----------
const Privacidad = ({ d }) => (
    <>
        <Seccion titulo="1. Responsable de los datos">
            <p>
                El responsable de la base de datos es <Dato valor={d.titular} nombre="titular o razón social" />
                {d.cuit && <> (CUIT {d.cuit})</>}, con domicilio en <Dato valor={d.domicilio} nombre="domicilio" />. Contacto: <Dato valor={d.email} nombre="email" />.
            </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recopilamos">
            <ul>
                <li>
                    <strong>Al reservar:</strong> nombre, apellido, teléfono, email (opcional), servicios, sucursal, fecha y horario del turno, y las notas que quieras dejar.
                </li>
                <li>
                    <strong>Al dejar una opinión:</strong> el nombre que elijas, el puntaje y el texto.
                </li>
                <li>No pedimos datos de tarjetas: la seña se paga por transferencia bancaria.</li>
            </ul>
            <p>
                En las notas solo incluí información necesaria para atenderte (por ejemplo, una alergia). Esa información se usa únicamente para cuidar tu salud durante el servicio.
            </p>
        </Seccion>

        <Seccion titulo="3. Para qué los usamos">
            <ul>
                <li>Gestionar y confirmar tu turno, y contactarte por WhatsApp o email sobre él (cambios, recordatorios, seña).</li>
                <li>Enviarte el email de confirmación de la reserva.</li>
                <li>Publicar tu opinión en el sitio, solo si la dejaste y fue aprobada.</li>
            </ul>
            <p>No vendemos ni cedemos tus datos a terceros para publicidad.</p>
        </Seccion>

        <Seccion titulo="4. Dónde se guardan">
            <p>Para que el sitio funcione usamos estos proveedores, que tratan los datos por cuenta de Perfectanias:</p>
            <ul>
                <li>
                    <strong>Google Firebase</strong>: almacenamiento de reservas, opiniones y acceso al panel.
                </li>
                <li>
                    <strong>EmailJS</strong>: envío del email de confirmación.
                </li>
                <li>
                    <strong>Vercel</strong>: alojamiento del sitio.
                </li>
                <li>
                    <strong>Google Maps</strong>: mapa de las sucursales.
                </li>
            </ul>
            <p>Estos servicios pueden almacenar datos fuera de la Argentina. Conservamos los datos de turnos mientras sean necesarios para la atención y para cumplir obligaciones legales.</p>
        </Seccion>

        <Seccion titulo="5. Cookies y almacenamiento del navegador">
            <p>
                El sitio guarda en tu navegador información técnica necesaria para funcionar: la sesión del panel de administración, el aviso de cookies aceptado y si ya enviaste una opinión. El mapa de Google puede usar sus propias
                cookies. No usamos cookies de publicidad.
            </p>
        </Seccion>

        <Seccion titulo="6. Tus derechos">
            <p>
                Podés pedir acceso, rectificación, actualización o supresión de tus datos escribiendo a <Dato valor={d.email} nombre="email" />. El derecho de acceso puede ejercerse en forma gratuita a intervalos no inferiores a
                seis meses, salvo interés legítimo (art. 14, inc. 3, Ley 25.326).
            </p>
            <p className="legal-leyenda">
                La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos
                por incumplimiento de las normas vigentes en materia de protección de datos personales.
            </p>
        </Seccion>
    </>
);

// ---------- POLÍTICA DE CANCELACIÓN ----------
const Cancelacion = ({ d }) => {
    const horas = Number(d.horasCancelacion) || 24;
    const tolerancia = Number(d.toleranciaMinutos) || 15;
    const dias = Number(d.diasReprogramar) || 30;
    const conAnticipacion = {
        reprogramar: `la seña queda a tu favor para reprogramar el turno dentro de los ${dias} días.`,
        reintegro: "te devolvemos la seña por transferencia.",
        no_reintegra: "podés reprogramar el turno una vez, por única vez y sin costo."
    }[d.politicaSena] || `la seña queda a tu favor para reprogramar el turno dentro de los ${dias} días.`;

    return (
        <>
            <div className="legal-resumen">
                <div>
                    <span className="legal-resumen-numero">{horas} h</span>
                    <span>de anticipación para cancelar o reprogramar</span>
                </div>
                <div>
                    <span className="legal-resumen-numero">{tolerancia} min</span>
                    <span>de tolerancia de llegada</span>
                </div>
                <div>
                    <span className="legal-resumen-numero">{SENA_TEXTO}</span>
                    <span>de seña para confirmar el turno</span>
                </div>
            </div>

            <Seccion titulo="1. Cancelar o reprogramar">
                <ul>
                    <li>
                        Si avisás con <strong>al menos {horas} horas</strong> de anticipación, {conAnticipacion}
                    </li>
                    <li>
                        Si avisás con <strong>menos de {horas} horas</strong>, o no te presentás, la seña no se devuelve ni se usa para otro turno.
                    </li>
                    <li>
                        Para cancelar o reprogramar escribinos por{" "}
                        {linkWhatsAppLocal(d.whatsapp) ? (
                            <a href={linkWhatsAppLocal(d.whatsapp, "Hola! Quiero cancelar/reprogramar mi turno.")} target="_blank" rel="noreferrer">
                                WhatsApp
                            </a>
                        ) : (
                            "WhatsApp"
                        )}{" "}
                        indicando tu nombre, fecha y horario del turno.
                    </li>
                </ul>
            </Seccion>

            <Seccion titulo="2. Demoras">
                <p>
                    Hay una tolerancia de <strong>{tolerancia} minutos</strong>. Pasado ese tiempo, el turno puede reducirse o cancelarse para no afectar a la clienta siguiente, y se considera como inasistencia.
                </p>
            </Seccion>

            <Seccion titulo="3. Si cancelamos nosotras">
                <p>Si Perfectanias tiene que cancelar o mover tu turno, te avisamos lo antes posible y podés elegir otro turno o la devolución total de la seña.</p>
            </Seccion>

            <Seccion titulo="4. Arrepentimiento">
                <p>
                    Esta política no afecta tu derecho de arrepentimiento por contratación a distancia (art. 34, Ley 24.240): ver <Link to="/legales/arrepentimiento">Botón de arrepentimiento</Link>.
                </p>
            </Seccion>
        </>
    );
};

// ---------- BOTÓN DE ARREPENTIMIENTO ----------
const Arrepentimiento = ({ d }) => {
    const [form, setForm] = useState({ nombre: "", telefono: "", turno: "", motivo: "" });
    const [enviado, setEnviado] = useState(false);
    const whatsapp = linkWhatsAppLocal(d.whatsapp);

    const mensaje = () =>
        [
            "Hola! Quiero ejercer mi derecho de ARREPENTIMIENTO (art. 34, Ley 24.240) y revocar la contratación de mi turno.",
            `Nombre: ${form.nombre.trim()}`,
            `Teléfono: ${form.telefono.trim()}`,
            `Turno (fecha, hora y servicio): ${form.turno.trim()}`,
            form.motivo.trim() ? `Comentario: ${form.motivo.trim()}` : ""
        ]
            .filter(Boolean)
            .join("\n");

    const enviar = (e) => {
        e.preventDefault();
        if (whatsapp) window.open(linkWhatsAppLocal(d.whatsapp, mensaje()), "_blank", "noopener");
        else if (d.email) window.location.href = `mailto:${d.email}?subject=${encodeURIComponent("Arrepentimiento de turno")}&body=${encodeURIComponent(mensaje())}`;
        setEnviado(true);
    };

    return (
        <>
            <Seccion titulo="¿Qué es?">
                <p>
                    Si reservaste un turno por este sitio, podés <strong>revocar la contratación dentro de los 10 días corridos</strong> desde la reserva, sin costo ni necesidad de explicar el motivo, siempre que el servicio no
                    se haya realizado (art. 34, Ley 24.240 y Resolución 424/2020). Te devolvemos la seña abonada.
                </p>
                <p>Completá el formulario y se abre WhatsApp con tu pedido listo para enviar. Te respondemos con un código de identificación del trámite dentro de las 24 horas.</p>
            </Seccion>

            {enviado ? (
                <div className="legal-confirmacion" role="status">
                    <strong>¡Listo!</strong> Si no se abrió WhatsApp, escribinos a <Dato valor={d.email} nombre="email" /> con tu nombre, teléfono y turno.
                </div>
            ) : (
                <form className="legal-form" onSubmit={enviar}>
                    <label htmlFor="arr-nombre">Nombre y apellido</label>
                    <input id="arr-nombre" required maxLength={80} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />

                    <label htmlFor="arr-telefono">Teléfono</label>
                    <input id="arr-telefono" type="tel" required maxLength={30} value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />

                    <label htmlFor="arr-turno">Turno que querés cancelar (fecha, hora y servicio)</label>
                    <input id="arr-turno" required maxLength={150} placeholder="Ej: 12/12 a las 15 hs, Lifting de pestañas" value={form.turno} onChange={(e) => setForm((f) => ({ ...f, turno: e.target.value }))} />

                    <label htmlFor="arr-motivo">Comentario (opcional)</label>
                    <textarea id="arr-motivo" rows={3} maxLength={500} value={form.motivo} onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))} />

                    <button type="submit" className="legal-boton">
                        Enviar pedido de arrepentimiento
                    </button>
                </form>
            )}
        </>
    );
};

const CONTENIDO = { terminos: Terminos, privacidad: Privacidad, cancelacion: Cancelacion, arrepentimiento: Arrepentimiento };

export const PaginaLegal = () => {
    const { documento } = useParams();
    const { datos } = useDatosLegales();
    const info = DOCUMENTOS_LEGALES.find((x) => x.id === documento);

    useMetaPagina(info?.titulo || "Página no encontrada", info ? `${info.titulo} de Perfectanias.` : undefined, info ? `/legales/${info.id}` : undefined);

    if (!info) return <NotFound />;
    const Contenido = CONTENIDO[info.id];

    return (
        <div className="legal-pagina">
            <header className="legal-hero">
                <span className="legal-hero-marca">Perfectanias ✨</span>
                <h1>{info.titulo}</h1>
                {datos.actualizado && <p>Última actualización: {datos.actualizado}</p>}
            </header>

            <div className="legal-cuerpo">
                <nav className="legal-indice" aria-label="Documentos legales">
                    {DOCUMENTOS_LEGALES.map((x) => (
                        <NavLink key={x.id} to={`/legales/${x.id}`} className={({ isActive }) => `legal-indice-link ${isActive ? "activo" : ""}`}>
                            {x.titulo}
                        </NavLink>
                    ))}
                </nav>

                <article className="legal-contenido">
                    <Contenido d={datos} />
                    <p className="legal-volver">
                        <Link to="/">← Volver a reservar</Link>
                    </p>
                </article>
            </div>
        </div>
    );
};
