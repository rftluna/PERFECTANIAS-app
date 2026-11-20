import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useTurno } from "../../context/TurnoContext";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaChevronRight, FaSearch } from "react-icons/fa";
import "./CatalogoServicios.css";

export const CatalogoServicios = () => {
    const { category } = useParams();
    const { serviciosSeleccionados, toggleServicio, ajustarCantidadServicio, getCantidadServicio } = useTurno();

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [descripcionExpandida, setDescripcionExpandida] = useState({});
    const [filtroCategoria, setFiltroCategoria] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState("recomendados");

    const esSeccionPestanas = category === "pestanas";

    useEffect(() => {
        setFiltroCategoria("todos");
        setDescripcionExpandida({});
        setBusqueda("");
        setOrden("recomendados");
    }, [category]);

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "servicios"));
                const dataMapeada = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setServicios(dataMapeada);
            } catch (error) {
                console.error("Error al cargar servicios de Firestore:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServicios();
    }, []);

    const manejarDescripcion = (e, id) => {
        e.stopPropagation(); // Evita que al tocar "Ver más" se seleccione/deseleccione el servicio
        setDescripcionExpandida((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatearMoneda = (valor) => {
        return Number(valor || 0).toLocaleString("es-AR");
    };

    // Filtrado por categoría y buscador
    // Limpia la categoría: saca comillas y espacios de más, así un error de tipeo no esconde el servicio.
    const normalizarCategoria = (cat) => String(cat || "").replace(/["'“”]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

    const serviciosFiltrados = servicios.filter((srv) => {
        const categoriaSrv = normalizarCategoria(srv.category);
        // En "Todos" se muestran todos los servicios cargados (aunque tengan otra categoría).
        const coincideCategoria = filtroCategoria === "todos" ? true : categoriaSrv === normalizarCategoria(filtroCategoria);

        const termino = busqueda.trim().toLowerCase();
        const coincideBusqueda = !termino || (srv.name && srv.name.toLowerCase().includes(termino)) || (srv.description && srv.description.toLowerCase().includes(termino));

        return coincideCategoria && coincideBusqueda;
    });

    // Orden elegido por la clienta (en Inicio y en Pestañas).
    const compararNombre = (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base" });
    const serviciosOrdenados = orden === "recomendados"
        ? serviciosFiltrados
        : [...serviciosFiltrados].sort((a, b) => {
              if (orden === "precio-asc") return Number(a.price || 0) - Number(b.price || 0) || compararNombre(a, b);
              if (orden === "precio-desc") return Number(b.price || 0) - Number(a.price || 0) || compararNombre(a, b);
              if (orden === "az") return compararNombre(a, b);
              if (orden === "za") return compararNombre(b, a);
              return 0;
          });

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#d4a3b8" }} />
                <p className="text-muted mt-2 small">Cargando catálogo estético...</p>
            </div>
        );
    }

    return (
        <Container fluid className="p-0 catalogo-servicios">
            {/* CABECERA CON TÍTULO Y BUSCADOR */}
            <div className="catalogo-header-bar">
                <div>
                    <h4 className="catalogo-titulo">{esSeccionPestanas ? "Elegí servicios de pestañas y cejas" : "Elegí servicios"}</h4>
                    <p className="catalogo-subtitulo">Podés reservar uno o más servicios.</p>
                </div>

                <div className="buscador-servicios-box">
                    <input type="text" className="buscador-servicios-input" placeholder="Buscar servicio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    <FaSearch className="buscador-servicios-icon" />
                </div>
            </div>

            {/* FILTROS Y ORDEN (siempre visibles) */}
            {(
                <div className="filtros-y-orden">
                <div className="filtros-servicios">
                    <button type="button" className={`filtro-servicio ${filtroCategoria === "todos" ? "activo" : ""}`} onClick={() => setFiltroCategoria("todos")}>
                        Todos
                    </button>
                    <button type="button" className={`filtro-servicio ${filtroCategoria === "Modelado - Tratamientos" ? "activo" : ""}`} onClick={() => setFiltroCategoria("Modelado - Tratamientos")}>
                        Modelado - Tratamientos
                    </button>
                    <button type="button" className={`filtro-servicio ${filtroCategoria === "Combos" ? "activo" : ""}`} onClick={() => setFiltroCategoria("Combos")}>
                        Combos
                    </button>
                </div>

                <label className="orden-servicios">
                    <span>Ordenar:</span>
                    <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar servicios">
                        <option value="recomendados">Recomendados</option>
                        <option value="precio-asc">Menor precio</option>
                        <option value="precio-desc">Mayor precio</option>
                        <option value="az">Nombre: A → Z</option>
                        <option value="za">Nombre: Z → A</option>
                    </select>
                </label>
                </div>
            )}

            {/* GRILLA DE 2 COLUMNAS ESTILO AGENDAMAS */}
            {serviciosOrdenados.length > 0 ? (
                <Row className="g-3">
                    {serviciosOrdenados.map((srv) => {
                        const cantidad = getCantidadServicio(srv.id);
                        const elegido = cantidad > 0 || serviciosSeleccionados.some((s) => s.id === srv.id);
                        const expandida = descripcionExpandida[srv.id] === true;
                        const precioNum = Number(srv.price || 0);
                        const senaNum = Math.round(precioNum * 0.5);
                        const tieneDuracion = srv.duration !== undefined && srv.duration !== null && srv.duration !== "";
                        const duracionTexto = tieneDuracion ? `${srv.duration} min` : null;
                        const descripcion = typeof srv.description === "string" && srv.description.trim() ? srv.description.trim() : "Tratamiento estético personalizado realizado por especialistas.";

                        return (
                            <Col xs={12} md={6} key={srv.id}>
                                <div className={`servicio-card-agendamas ${elegido ? "servicio-elegido" : ""}`} onClick={() => toggleServicio(srv)}>
                                    {/* ENUMERADOR ROSA SOBRE LA ETIQUETA */}
                                    {cantidad > 0 && (
                                        <span className="enumerador-rosa-badge" aria-label={`Cantidad elegida: ${cantidad}`}>
                                            {cantidad}
                                        </span>
                                    )}

                                    {/* FOTO CUADRADA DE IMGBB */}
                                    {srv.image && (
                                        <div className="servicio-thumb-cuadrada">
                                            <img
                                                src={srv.image}
                                                alt={srv.name || "Servicio"}
                                                onError={(e) => {
                                                    e.currentTarget.parentElement.style.display = "none";
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* DATOS DEL SERVICIO */}
                                    <div className="servicio-info-central">
                                        <h6 className="servicio-nombre">{srv.name}</h6>
                                        <div className="servicio-precio">${formatearMoneda(precioNum)}</div>

                                        <div className="servicio-meta-sena">{duracionTexto ? `${duracionTexto} · Seña $${formatearMoneda(senaNum)}` : `- Seña $${formatearMoneda(senaNum)}`}</div>

                                        <p className={`servicio-descripcion ${expandida ? "expandida" : ""}`}>{descripcion}</p>

                                        <div className="servicio-acciones-fila">
                                            <button type="button" className="btn-ver-mas-link" onClick={(e) => manejarDescripcion(e, srv.id)}>
                                                {expandida ? "Ver menos" : "Ver más"}
                                            </button>

                                            <div className="controles-cantidad-servicio" onClick={(e) => e.stopPropagation()}>
                                                <button type="button" className="btn-cantidad-rosa" onClick={() => ajustarCantidadServicio(srv, -1)} aria-label="Restar cantidad">
                                                    −
                                                </button>
                                                <span className="valor-cantidad-servicio">{cantidad}</span>
                                                <button type="button" className="btn-cantidad-rosa" onClick={() => ajustarCantidadServicio(srv, 1)} aria-label="Sumar cantidad">
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FLECHA O CHECK DE SELECCIÓN */}
                                    <div className="servicio-accion-derecha">{elegido ? <FaCheckCircle /> : <FaChevronRight />}</div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div className="catalogo-vacio">
                    <span>✨</span>
                    <p>No encontramos servicios que coincidan con tu búsqueda.</p>
                </div>
            )}
        </Container>
    );
};
