// Datos y funciones de las reseñas (separados del componente para que Fast Refresh funcione).

// Ficha de Perfectanias en Google Maps (link corto por CID, no vence).
export const LINK_MAPS_PERFECTANIAS = "https://www.google.com/maps?cid=10425680960657163280";

export const LINKS_POR_DEFECTO = {
    linkVer: LINK_MAPS_PERFECTANIAS,
    linkDejar: LINK_MAPS_PERFECTANIAS
};

// Promedio con un decimal (ej: 4.8). Sin reseñas = 0.
export const calcularPromedio = (lista) => {
    if (!lista.length) return 0;
    const suma = lista.reduce((acc, r) => acc + Number(r.estrellas || 0), 0);
    return Math.round((suma / lista.length) * 10) / 10;
};

export const formatearPuntaje = (valor) =>
    Number(valor || 0).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// "2026-10-26" -> "26 oct 2026"
export const formatearFechaResena = (fecha) => {
    if (!fecha) return "";
    const [a, m, d] = String(fecha).split("-").map(Number);
    if (!a || !m || !d) return String(fecha);
    return new Date(a, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }).replace(/\./g, "").replace(/ de /g, " ");
};
