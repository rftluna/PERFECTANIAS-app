// 1. ESTILOS GLOBALES Y LIBRERÍAS DE TERCEROS
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import "./App.css";

// 2. IMPORTACIONES DE LOS COMPONENTES DE PERFECTANIAS
import { TurnoProvider } from "./context/TurnoContext";
import { Nav } from "./components/Nav/Nav";
import { Footer } from "./components/Footer/Footer";
import { ReservaDashboard } from "./components/ReservaDashboard/ReservaDashboard";
import { AdminServicios } from "./components/AdminServicios/AdminServicios";
import { NotFound } from "./components/NotFound/NotFound";
import { UbicacionMapa } from "./components/UbicacionMapa/UbicacionMapa";

// 3. IMPORTACIONES DE AUTENTICACIÓN
import { Login } from "./components/Login/Login";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";

function App() {
    return (
        <TurnoProvider>
            <div className="d-flex flex-column min-vh-100 app-contenedor">
                {/* CONTENEDOR DE ALERTAS ANIMADAS (Toastify) */}
                <ToastContainer position="top-right" autoClose={2500} theme="colored" />

                {/* BARRA DE NAVEGACIÓN PERMANENTE */}
                <Nav />

                {/* ENRUTADOR PRINCIPAL DENTRO DEL CUERPO DE LA APP */}
                <main className="flex-grow-1">
                    <Routes>
                        {/* RUTAS PÚBLICAS */}
                        <Route path="/" element={<ReservaDashboard />} />
                        <Route path="/category/:category" element={<ReservaDashboard />} />
                        <Route path="/turnos" element={<ReservaDashboard />} />

                        {/* LOGIN ADMINISTRATIVO */}
                        <Route path="/admin/login" element={<Login />} />

                        {/* PANEL ADMINISTRATIVO PROTEGIDO */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminServicios />
                                </ProtectedRoute>
                            }
                        />

                        {/* PÁGINA 404 PARA CUALQUIER RUTA INEXISTENTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>

                {/* MAPA DE UBICACIÓN DE LAS SUCURSALES, ARRIBA DEL FOOTER */}
                <UbicacionMapa />

                {/* PIE DE PÁGINA PERMANENTE CON ICONOS DE INSTAGRAM Y WHATSAPP */}
                <Footer />
            </div>
        </TurnoProvider>
    );
}

export default App;
