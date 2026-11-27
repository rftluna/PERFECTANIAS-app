import { useState } from "react";
import { Link } from "react-router-dom";
import { BsWhatsapp } from "react-icons/bs";
import { FaInstagram, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { DOCUMENTOS_LEGALES, linkWhatsAppLocal } from "../../utils/legales";
import { useDatosLegales } from "../../utils/useDatosLegales";
import { appCheckActivo } from "../../firebase/config";
import "./Footer.css";

const NAVEGACION = [
    { to: "/", texto: "Inicio" },
    { to: "/category/pestanas", texto: "Pestañas" },
    { to: "/category/unas", texto: "Uñas" },
    { to: "/turnos", texto: "Turnos" }
];

const CLAVE_COOKIES = "perfectanias_cookies_ok";

const leerCookiesOk = () => {
    try {
        return localStorage.getItem(CLAVE_COOKIES) === "1";
    } catch {
        return false;
    }
};

// Aviso fijo abajo, como en las tiendas online. Se oculta al tocar "Entendido".
const AvisoCookies = () => {
    const [visible, setVisible] = useState(() => !leerCookiesOk());
    if (!visible) return null;

    const aceptar = () => {
        try {
            localStorage.setItem(CLAVE_COOKIES, "1");
        } catch {
            // Sin almacenamiento: se vuelve a mostrar en la próxima visita.
        }
        setVisible(false);
    };

    return (
        <div className="aviso-cookies" role="region" aria-label="Aviso de cookies">
            <p>
                No usamos cookies de publicidad ni de seguimiento: solo guardamos en tu navegador lo necesario para que el sitio funcione. <Link to="/legales/privacidad">Más información</Link>
            </p>
            <button type="button" onClick={aceptar}>
                Entendido
            </button>
        </div>
    );
};

export const Footer = () => {
    const { datos } = useDatosLegales();
    const whatsapp = linkWhatsAppLocal(datos.whatsapp);
    const anio = new Date().getFullYear();

    return (
        <>
            <footer className="footer-perfectanias">
                <div className="footer-grilla">
                    {/* MARCA */}
                    <div className="footer-marca">
                        <Link to="/" className="footer-logo">
                            PERFECTANIAS <span aria-hidden="true">✨</span>
                        </Link>
                        <p>Pestañas, cejas y uñas. Reservá tu turno online en Isidro Casanova, Morón y Ramos Mejía.</p>
                    </div>

                    {/* NAVEGACIÓN */}
                    <nav aria-label="Navegación del pie">
                        <h2 className="footer-titulo">Navegación</h2>
                        <ul>
                            {NAVEGACION.map((l) => (
                                <li key={l.to}>
                                    <Link to={l.to}>{l.texto}</Link>
                                </li>
                            ))}
                            <li>
                                <a href="#donde-estamos">Dónde estamos</a>
                            </li>
                        </ul>
                    </nav>

                    {/* LEGALES */}
                    <nav aria-label="Información legal">
                        <h2 className="footer-titulo">Legales</h2>
                        <ul>
                            {DOCUMENTOS_LEGALES.map((d) => (
                                <li key={d.id}>
                                    <Link to={`/legales/${d.id}`}>{d.titulo}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* CONTACTO Y REDES */}
                    <div>
                        <h2 className="footer-titulo">Contacto</h2>
                        <div className="footer-redes">
                            {datos.instagram && (
                                <a href={datos.instagram} target="_blank" rel="noreferrer" aria-label="Instagram de Perfectanias">
                                    <FaInstagram />
                                </a>
                            )}
                            {whatsapp && (
                                <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp de Perfectanias">
                                    <BsWhatsapp />
                                </a>
                            )}
                            {datos.email && (
                                <a href={`mailto:${datos.email}`} aria-label="Email de Perfectanias">
                                    <FaEnvelope />
                                </a>
                            )}
                        </div>
                        <ul className="footer-contacto">
                            {datos.email && <li>{datos.email}</li>}
                            {datos.domicilio && (
                                <li>
                                    <FaMapMarkerAlt aria-hidden="true" /> {datos.domicilio}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* BARRA INFERIOR */}
                <div className="footer-inferior">
                    <span>
                        © {anio} Perfectanias{datos.titular ? ` · ${datos.titular}` : ""}. Todos los derechos reservados.
                    </span>
                    <Link to="/legales/arrepentimiento" className="footer-arrepentimiento">
                        Botón de arrepentimiento
                    </Link>
                    {appCheckActivo && (
                        <p className="footer-recaptcha">
                            Este sitio está protegido por reCAPTCHA y se aplican la{" "}
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de privacidad</a> y las{" "}
                            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Condiciones del servicio</a> de Google.
                        </p>
                    )}
                </div>
            </footer>

            {/* BOTÓN FLOTANTE DE WHATSAPP */}
            {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noreferrer" className="whatsapp-flotante" aria-label="Escribinos por WhatsApp">
                    <BsWhatsapp />
                </a>
            )}

            <AvisoCookies />
        </>
    );
};
