import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./Login.css";
import { useState } from "react";

export const Login = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [ingresando, setIngresando] = useState(false);

    // Si ya hay sesión iniciada, va directo al panel.
    if (user) return <Navigate to="/admin" replace />;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIngresando(true);

        try {
            await login(formData.email.trim(), formData.password);
            toast.success("Bienvenida al panel de Perfectanias.");
            navigate("/admin", { replace: true });
        } catch (error) {
            console.error(error);
            toast.error("Correo o contraseña incorrectos.");
        } finally {
            setIngresando(false);
        }
    };

    return (
        <div className="login-wrapper">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Panel Administradora</h2>
                <p className="login-subtitulo">Ingresá con tu cuenta para editar precios, textos y fotos.</p>

                <div className="form-group">
                    <label htmlFor="login-email">Correo electrónico</label>
                    <input id="login-email" type="email" name="email" placeholder="tucorreo@gmail.com" value={formData.email} onChange={handleChange} autoComplete="username" required />
                </div>

                <div className="form-group">
                    <label htmlFor="login-password">Contraseña</label>
                    <input id="login-password" type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} autoComplete="current-password" required />
                </div>

                <button className="btn-login-rosa" type="submit" disabled={ingresando}>
                    {ingresando ? "Ingresando..." : "Ingresar"}
                </button>
            </form>
        </div>
    );
};
