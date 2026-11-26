// Reglas compartidas de los servicios: seña, duración, secciones, categorías y orden.
// Se usan en el catálogo, el resumen de reserva, la forma de pago, el contexto y el panel admin.

// Porcentaje de seña que se cobra al reservar.
export const SENA_PORCENTAJE = 0.5;
export const SENA_TEXTO = `${Math.round(SENA_PORCENTAJE * 100)}%`;
export const calcularSena = (total) => Math.round(Number(total || 0) * SENA_PORCENTAJE);

// Duración que se asume cuando un servicio no tiene una cargada.
export const DURACION_POR_DEFECTO = 60;
export const duracionDe = (servicio) => {
    const valor = Number(servicio?.duration);
    return Number.isFinite(valor) && valor > 0 ? valor : DURACION_POR_DEFECTO;
};

export const formatearMoneda = (valor) => Number(valor || 0).toLocaleString("es-AR");

// Secciones del sitio (cada una es una pestaña del menú).
export const SECCIONES = [
    { id: "pestanas", nombre: "Pestañas y cejas" },
    { id: "unas", nombre: "Uñas" }
];
// Los servicios cargados antes de existir el campo "seccion" son todos de pestañas.
export const SECCION_POR_DEFECTO = "pestanas";
export const seccionDe = (servicio) => {
    const valor = String(servicio?.seccion || "").trim().toLowerCase();
    return SECCIONES.some((s) => s.id === valor) ? valor : SECCION_POR_DEFECTO;
};

// Categorías: se limpian comillas y espacios de más, así un error de tipeo no esconde el servicio.
export const CATEGORIA_POR_DEFECTO = "Modelado - Tratamientos";
export const limpiarCategoria = (cat) =>
    String(cat || "")
        .replace(/["'“”]/g, "")
        .replace(/\s+/g, " ")
        .trim();
export const normalizarCategoria = (cat) => limpiarCategoria(cat).toLowerCase();

// Lista de categorías existentes (sin repetir), para armar los filtros a partir de los datos.
export const categoriasDe = (servicios) => {
    const vistas = new Map();
    servicios.forEach((srv) => {
        const limpia = limpiarCategoria(srv.category);
        if (limpia && !vistas.has(limpia.toLowerCase())) vistas.set(limpia.toLowerCase(), limpia);
    });
    return [...vistas.values()].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
};

// Opciones de orden de la lista de servicios.
export const ORDENES = [
    { id: "recomendados", texto: "Recomendados" },
    { id: "precio-asc", texto: "Menor precio" },
    { id: "precio-desc", texto: "Mayor precio" },
    { id: "az", texto: "Nombre: A → Z" },
    { id: "za", texto: "Nombre: Z → A" }
];

const compararNombre = (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es", { sensitivity: "base" });

export const ordenarServicios = (servicios, orden) => {
    if (!ORDENES.some((o) => o.id === orden) || orden === "recomendados") return servicios;
    return [...servicios].sort((a, b) => {
        if (orden === "precio-asc") return Number(a.price || 0) - Number(b.price || 0) || compararNombre(a, b);
        if (orden === "precio-desc") return Number(b.price || 0) - Number(a.price || 0) || compararNombre(a, b);
        if (orden === "az") return compararNombre(a, b);
        return compararNombre(b, a);
    });
};
