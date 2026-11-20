import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// UID de la cuenta de la administradora (el mismo que usan las reglas de Firestore).
// No cambia aunque ella cambie su correo o su contraseña.
export const ADMIN_UID = "OgWsAMKDYgQN8AhgDwjSvIzfjq72";

export const ProtectedRoute = ({ children }) => {
  const { user, loading, logout } = useAuth();

  // Esperamos a saber si hay usuario antes de redirigir.
  if (loading) return <p className="text-center text-muted py-5">Cargando...</p>;

  if (!user) return <Navigate to="/admin/login" replace />;

  // Hay sesión, pero no es la cuenta de la administradora: no se muestra el panel.
  if (user.uid !== ADMIN_UID) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "420px" }}>
        <h5 className="fw-bold mb-2" style={{ color: "#c47d9d" }}>Sin acceso</h5>
        <p className="text-muted small mb-4">Esta cuenta no tiene permiso para entrar al panel de Perfectanias.</p>
        <button type="button" onClick={logout} className="btn rounded-pill px-4 border-0 fw-bold" style={{ backgroundColor: "#d4a3b8", color: "#ffffff" }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return children;
};
