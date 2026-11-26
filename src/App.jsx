// 1. ESTILOS GLOBALES Y LIBRERÍAS DE TERCEROS
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

// 2. IMPORTACIONES DE LOS COMPONENTES DE PERFECTANIAS
import { TurnoProvider } from "./context/TurnoContext";
import { Nav } from "./components/Nav/Nav";
import { Footer } from "./components/Footer/Footer";
import { ReservaDashboard } from "./components/ReservaDashboard/ReservaDashboard";
import { NotFound } from "./components/NotFound/NotFound";
import { UbicacionMapa } from "./components/UbicacionMapa/UbicacionMapa";

// 3. IMPORTACIONES DE AUTENTICACIÓN
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";

// El panel y el login se descargan solo cuando alguien entra a /admin (las clientas no los bajan).
const AdminServicios = lazy(() => import("./components/AdminServicios/AdminServicios").then((m) => ({ default: m.AdminServicios })));
const Login = lazy(() => import("./components/Login/Login").then((m) => ({ default: m.Login })));
const RegistroAdmin = lazy(() => import("./components/RegistroAdmin/RegistroAdmin").then((m) => ({ default: m.RegistroAdmin })));

const CargandoPagina = () => <p className="text-center text-muted py-5">Cargando...</p>;

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
                    <Suspense fallback={<CargandoPagina />}>
                    <Routes>
                        {/* RUTAS PÚBLICAS */}
                        <Route path="/" element={<ReservaDashboard />} />
                        <Route path="/category/:category" element={<ReservaDashboard />} />
                        <Route path="/turnos" element={<ReservaDashboard />} />

                        {/* LOGIN ADMINISTRATIVO */}
                        <Route path="/admin/login" element={<Login />} />

                        {/* ALTA DE ADMINISTRADORA CON LINK DE INVITACIÓN (/admin/registro?codigo=...) */}
                        <Route path="/admin/registro" element={<RegistroAdmin />} />

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
                    </Suspense>
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
