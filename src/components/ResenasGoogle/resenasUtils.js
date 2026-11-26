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

// Opiniones que las clientas dejaron en Agendamas (las lee la función /api/resenas-agendamas en Vercel).
export const API_RESENAS_AGENDAMAS = "/api/resenas-agendamas";
export const LINK_OPINIONES_AGENDAMAS = "https://www.agendamas.app/perfectanias?opiniones=1";

export const cargarResenasAgendamas = async () => {
    try {
        const respuesta = await fetch(API_RESENAS_AGENDAMAS);
        if (!respuesta.ok) return [];
        const datos = await respuesta.json();
        return Array.isArray(datos.resenas) ? datos.resenas : [];
    } catch {
        // En desarrollo local (sin Vercel) o si Agendamas no responde: solo se ven las reseñas propias.
        return [];
    }
};

const normalizar = (texto) =>
    String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z0-9]/g, "");

// Une las reseñas de la web con las de Agendamas sin repetir las que se cargaron a mano en los dos lados
// (misma clienta y mismo comienzo del texto, o misma clienta y misma fecha). Más nuevas primero.
export const unirResenas = (propias, externas) => {
    const claves = new Set();
    const resultado = [];
    [...propias, ...externas].forEach((r) => {
        const nombre = normalizar(r.nombre);
        const porTexto = `${nombre}|${normalizar(r.texto).slice(0, 24)}`;
        const porFecha = `${nombre}|${r.fecha}`;
        if (claves.has(porTexto) || claves.has(porFecha)) return;
        claves.add(porTexto);
        claves.add(porFecha);
        resultado.push(r);
    });
    return resultado.sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
};
