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

function App() {
    return (
        <TurnoProvider>
            <div className="d-flex flex-column min-vh-100 bg-white">
                {/* CONTENEDOR DE ALERTAS ANIMADAS (Toastify) */}
                <ToastContainer position="top-right" autoClose={2500} theme="colored" />

                {/* BARRA DE NAVEGACIÓN PERMANENTE */}
                <Nav />

                {/* ENRUTADOR PRINCIPAL DENTRO DEL CUERPO DE LA APP */}
                <main className="flex-grow-1">
                    <Routes>
                        {/* Todas las rutas principales cargan tu panel de control de turnos */}
                        <Route path="/" element={<ReservaDashboard />} />
                        <Route path="/category/:category" element={<ReservaDashboard />} />
                        <Route path="/turnos" element={<ReservaDashboard />} />
                    </Routes>
                </main>

                {/* PIE DE PÁGINA PERMANENTE CON ICONOS DE INSTAGRAM Y WHATSAPP */}
                <Footer />
            </div>
        </TurnoProvider>
    );
}

export default App;
