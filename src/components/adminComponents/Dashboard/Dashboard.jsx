import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../../../context/AuthContext";
import { ProductAdminListContainer } from "../ProductAdminListContainer/ProductAdminListContainer";

export const Dashboard = () => {
    const { logout } = useAuth();

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h2>Panel de administración</h2>

                <div className="header-actions">
                    <Link className="btn btn-secondary" to="/">
                        Volver a la tienda
                    </Link>
                    <button className="btn bg-delete primary" onClick={logout}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <section className="dashboard-actions">
                <h3>Acciones rápidas / Gestion de Productos y/o Servicios </h3>

                <div className="actions-grid">
                    <Link to="/admin/products/new" className="action-card">
                        ➕ Cargar / Agregar productoso servicios
                    </Link>

                    <Link to="/admin/products" className="action-card">
                        ✏️ Modificar productos o servicios / Ver todos
                    </Link>

                    <Link to="/admin/products" className="action-card">
                        🗑️ Eliminar productos o servicios
                    </Link>
                </div>
            </section>

            {/* Listado en tiempo real con los botones de Editar y Eliminar */}
            <section className="dashboard-products-section" style={{ marginTop: "30px" }}>
                <ProductAdminListContainer />
            </section>

            <section className="dashboard-help" style={{ marginTop: "30px" }}>
                <h3>Ayuda</h3>
                <p>Desde este panel podés gestionar, modificar o eliminar los productos de la tienda.</p>
            </section>
        </div>
    );
};
