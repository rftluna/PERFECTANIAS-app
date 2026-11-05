import { BsWhatsapp } from "react-icons/bs";
import { FaInstagram } from "react-icons/fa";
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 border-top border-secondary mt-auto w-100">
      <nav className="container">
        <ul className="nav-list d-flex flex-row justify-content-center align-items-center gap-4 m-0 p-0 list-unstyled">
          <li>
            <a 
              href="https://wa.me" 
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
              href="https://instagram.com" 
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
