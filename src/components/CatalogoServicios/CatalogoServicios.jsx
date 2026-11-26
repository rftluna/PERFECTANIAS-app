import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTurno } from "../../context/TurnoContext";
import { Container, Row, Col } from "react-bootstrap";
import { FaCheckCircle, FaChevronRight, FaSearch } from "react-icons/fa";
import { ORDENES, calcularSena, categoriasDe, duracionDe, formatearMoneda, limpiarCategoria, normalizarCategoria, ordenarServicios, seccionDe } from "../../utils/servicios";
import { FotoServicio } from "../IlustracionServicio/IlustracionServicio";
import { fotoReferenciaDe } from "../../utils/fotosReferencia";
import "./CatalogoServicios.css";

// Tarjetas grises mientras carga el catálogo.
const CatalogoCargando = () => (
    <Row className="g-3" aria-busy="true" aria-label="Cargando servicios">
        {[0, 1, 2, 3].map((i) => (
            <Col xs={12} md={6} key={i}>
                <div className="servicio-card-agendamas servicio-skeleton" aria-hidden="true">
                    <div className="servicio-thumb-cuadrada skeleton-bloque" />
                    <div className="servicio-info-central w-100">
                        <div className="skeleton-linea" style={{ width: "70%" }} />
                        <div className="skeleton-linea" style={{ width: "35%" }} />
                        <div className="skeleton-linea" style={{ width: "55%" }} />
                        <div className="skeleton-linea" style={{ width: "90%" }} />
                    </div>
                </div>
            </Col>
        ))}
    </Row>
);

// seccion: "pestanas" | "unas" filtra el catálogo; sin valor (Inicio) muestra todos los servicios.
export const CatalogoServicios = ({ seccion = null, titulo = "Elegí servicios" }) => {
    const { servicios: todosLosServicios, cargandoServicios, errorServicios, cargarServicios, serviciosSeleccionados, toggleServicio, ajustarCantidadServicio, getCantidadServicio } = useTurno();

    const [descripcionExpandida, setDescripcionExpandida] = useState({});

    // Filtro, búsqueda y orden viven en la URL (?categoria=&q=&orden=),
    // así el enlace de "Compartir" lleva lo que la clienta está viendo y "atrás" funciona.
    const [searchParams, setSearchParams] = useSearchParams();
    const filtroCategoria = searchParams.get("categoria") || "todos";
    const busqueda = searchParams.get("q") || "";
    const ordenParam = searchParams.get("orden");
    const orden = ORDENES.some((o) => o.id === ordenParam) ? ordenParam : "recomendados";

    const actualizarParam = (clave, valor, valorPorDefecto, reemplazar = false) => {
        setSearchParams(
            (prev) => {
                const siguiente = new URLSearchParams(prev);
                if (!valor || valor === valorPorDefecto) siguiente.delete(clave);
                else siguiente.set(clave, valor);
                return siguiente;
            },
            { replace: reemplazar }
        );
    };

    const servicios = seccion ? todosLosServicios.filter((srv) => seccionDe(srv) === seccion) : todosLosServicios;

    // Los filtros salen de las categorías cargadas en el panel (no están escritos a mano).
    const categorias = categoriasDe(servicios);

    const manejarDescripcion = (e, id) => {
        e.stopPropagation(); // Evita que al tocar "Ver más" se seleccione/deseleccione el servicio
        setDescripcionExpandida((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Teclado: Enter o Espacio sobre la tarjeta la elige (solo si el foco está en la tarjeta, no en sus botones).
    const manejarTeclaTarjeta = (e, srv) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleServicio(srv);
        }
    };

    const serviciosFiltrados = servicios.filter((srv) => {
        // En "Todos" se muestran todos los servicios de la sección (aunque tengan otra categoría).
        const coincideCategoria = filtroCategoria === "todos" || normalizarCategoria(srv.category) === normalizarCategoria(filtroCategoria);

        const termino = busqueda.trim().toLowerCase();
        const coincideBusqueda = !termino || (srv.name && srv.name.toLowerCase().includes(termino)) || (srv.description && srv.description.toLowerCase().includes(termino));

        return coincideCategoria && coincideBusqueda;
    });

    const serviciosOrdenados = ordenarServicios(serviciosFiltrados, orden);

    return (
        <Container fluid className="p-0 catalogo-servicios">
            {/* CABECERA CON TÍTULO Y BUSCADOR */}
            <div className="catalogo-header-bar">
                <div>
                    <h2 className="catalogo-titulo">{titulo}</h2>
                    <p className="catalogo-subtitulo">Podés reservar uno o más servicios.</p>
                </div>

                <div className="buscador-servicios-box">
                    <input
                        type="search"
                        className="buscador-servicios-input"
                        placeholder="Buscar servicio..."
                        aria-label="Buscar servicio"
                        value={busqueda}
                        onChange={(e) => actualizarParam("q", e.target.value, "", true)}
                    />
                    <FaSearch className="buscador-servicios-icon" aria-hidden="true" />
                </div>
            </div>

            {/* FILTROS Y ORDEN */}
            <div className="filtros-y-orden">
                <div className="filtros-servicios" role="group" aria-label="Filtrar por categoría">
                    {["todos", ...categorias].map((cat) => {
                        const activo = cat === "todos" ? filtroCategoria === "todos" : normalizarCategoria(filtroCategoria) === normalizarCategoria(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                className={`filtro-servicio ${activo ? "activo" : ""}`}
                                aria-pressed={activo}
                                onClick={() => actualizarParam("categoria", cat === "todos" ? "" : limpiarCategoria(cat), "")}
                            >
                                {cat === "todos" ? "Todos" : cat}
                            </button>
                        );
                    })}
                </div>

                <label className="orden-servicios">
                    <span>Ordenar:</span>
                    <select value={orden} onChange={(e) => actualizarParam("orden", e.target.value, "recomendados")} aria-label="Ordenar servicios">
                        {ORDENES.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.texto}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* GRILLA DE 2 COLUMNAS ESTILO AGENDAMAS */}
            {cargandoServicios ? (
                <CatalogoCargando />
            ) : errorServicios ? (
                <div className="catalogo-vacio" role="alert">
                    <span>😢</span>
                    <p>No pudimos cargar los servicios.</p>
                    <button type="button" className="filtro-servicio activo" onClick={cargarServicios}>
                        Reintentar
                    </button>
                </div>
            ) : serviciosOrdenados.length > 0 ? (
                <Row className="g-3">
                    {serviciosOrdenados.map((srv) => {
                        const cantidad = getCantidadServicio(srv.id);
                        const elegido = cantidad > 0 || serviciosSeleccionados.some((s) => s.id === srv.id);
                        const expandida = descripcionExpandida[srv.id] === true;
                        const precioNum = Number(srv.price || 0);
                        const senaNum = calcularSena(precioNum);
                        const descripcion = typeof srv.description === "string" && srv.description.trim() ? srv.description.trim() : "Tratamiento estético personalizado realizado por especialistas.";

                        return (
                            <Col xs={12} md={6} key={srv.id}>
                                <div
                                    className={`servicio-card-agendamas ${elegido ? "servicio-elegido" : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={elegido}
                                    aria-label={`${srv.name}, $${formatearMoneda(precioNum)}${elegido ? ", elegido" : ""}`}
                                    onClick={() => toggleServicio(srv)}
                                    onKeyDown={(e) => manejarTeclaTarjeta(e, srv)}
                                >
                                    {/* ENUMERADOR ROSA SOBRE LA ETIQUETA */}
                                    {cantidad > 0 && (
                                        <span className="enumerador-rosa-badge" aria-label={`Cantidad elegida: ${cantidad}`}>
                                            {cantidad}
                                        </span>
                                    )}

                                    {/* FOTO CUADRADA (o ilustración si todavía no tiene foto) */}
                                    <FotoServicio servicio={srv} className="servicio-thumb-cuadrada" />

                                    {/* DATOS DEL SERVICIO */}
                                    <div className="servicio-info-central">
                                        <h3 className="servicio-nombre">{srv.name}</h3>
                                        <div className="servicio-precio">${formatearMoneda(precioNum)}</div>

                                        <div className="servicio-meta-sena">{`${duracionDe(srv)} min · Seña $${formatearMoneda(senaNum)}`}</div>

                                        <p className={`servicio-descripcion ${expandida ? "expandida" : ""}`}>{descripcion}</p>

                                        {/* Crédito de la foto de referencia (lo pide la licencia de Unsplash) */}
                                        {!srv.image && fotoReferenciaDe(srv.name) && (
                                            <p className="foto-referencia-credito" onClick={(e) => e.stopPropagation()}>
                                                Foto de referencia:{" "}
                                                <a href={fotoReferenciaDe(srv.name).autorLink} target="_blank" rel="noreferrer">
                                                    {fotoReferenciaDe(srv.name).autor}
                                                </a>{" "}
                                                /{" "}
                                                <a href={fotoReferenciaDe(srv.name).unsplashLink} target="_blank" rel="noreferrer">
                                                    Unsplash
                                                </a>
                                            </p>
                                        )}

                                        <div className="servicio-acciones-fila">
                                            <button type="button" className="btn-ver-mas-link" aria-expanded={expandida} onClick={(e) => manejarDescripcion(e, srv.id)}>
                                                {expandida ? "Ver menos" : "Ver más"}
                                            </button>

                                            <div className="controles-cantidad-servicio" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                                <button type="button" className="btn-cantidad-rosa" onClick={() => ajustarCantidadServicio(srv, -1)} aria-label={`Restar una unidad de ${srv.name}`}>
                                                    −
                                                </button>
                                                <span className="valor-cantidad-servicio">{cantidad}</span>
                                                <button type="button" className="btn-cantidad-rosa" onClick={() => ajustarCantidadServicio(srv, 1)} aria-label={`Sumar una unidad de ${srv.name}`}>
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FLECHA O CHECK DE SELECCIÓN */}
                                    <div className="servicio-accion-derecha" aria-hidden="true">{elegido ? <FaCheckCircle /> : <FaChevronRight />}</div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div className="catalogo-vacio">
                    <span>✨</span>
                    <p>{servicios.length === 0 ? "Todavía no hay servicios cargados en esta sección." : "No encontramos servicios que coincidan con tu búsqueda."}</p>
                </div>
            )}
        </Container>
    );
};
