import { BsWhatsapp } from "react-icons/bs";
import { FaInstagram } from "react-icons/fa";
import "./Footer.css";

// Completar con el número del local, solo dígitos, con código de país (ej: 5491112345678).
const WHATSAPP_NUMERO = "5491165186643";
const INSTAGRAM_URL = "https://www.instagram.com/perfectanias.ok";

const linkWhatsApp = WHATSAPP_NUMERO ? `https://wa.me/${WHATSAPP_NUMERO}` : "https://wa.me";

export const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 border-top border-secondary mt-auto w-100">
      <nav className="container">
        <ul className="nav-list d-flex flex-row justify-content-center align-items-center gap-4 m-0 p-0 list-unstyled">
          <li>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="text-white text-decoration-none d-inline-flex align-items-center gap-2 fw-bold small"
            >
              <BsWhatsapp size={18} style={{ color: "#25D366" }} />
              WhatsApp
            </a>
          </li>
          <li>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-white text-decoration-none d-inline-flex align-items-center gap-2 fw-bold small"
            >
              <FaInstagram size={18} style={{ color: "#E1306C" }} />
              Instagram
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
};
