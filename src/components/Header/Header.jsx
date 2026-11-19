import { Nav } from "../Nav/Nav";
import { Link } from "react-router-dom";
import logo from "../../assets/react.svg";
import "./Header.css";

export const Header = () => {
    return (
        <>
            <header>
                <div className="logo-container">
                    <Link to={"/"}>
                        <img src={logo} alt="Perfectanias" />
                        <span>PERFECTANIAS</span>
                    </Link>
                </div>

                <Nav />
            </header>

            <section className="business-info">
                <div className="business-logo">
                    <img src={logo} alt="Perfectanias" />
                </div>

                <div className="business-details">
                    <h1>Perfectanias</h1>

                    <p className="business-subtitle">Reservá tu turno online</p>
                </div>
            </section>
        </>
    );
};
