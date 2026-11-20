// ==========================================
// REGLAS DE SEGURIDAD DE CONTRASEÑAS Y LOGIN
// ==========================================

// Requisitos de una contraseña segura.
export const REQUISITOS_PASSWORD = [
    { id: "largo", texto: "Al menos 8 caracteres", cumple: (p) => p.length >= 8 },
    { id: "letra", texto: "Al menos una letra", cumple: (p) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p) },
    { id: "numero", texto: "Al menos un número", cumple: (p) => /[0-9]/.test(p) },
    { id: "simbolo", texto: "Al menos un símbolo (ej: ! @ # $ % & * ? .)", cumple: (p) => /[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ\s]/.test(p) },
    { id: "espacios", texto: "Sin espacios", cumple: (p) => p.length > 0 && !/\s/.test(p) }
];

export const evaluarPassword = (password = "") =>
    REQUISITOS_PASSWORD.map((r) => ({ id: r.id, texto: r.texto, ok: r.cumple(password) }));

export const passwordEsSegura = (password = "") => REQUISITOS_PASSWORD.every((r) => r.cumple(password));

// ---------- Límite de intentos de login ----------
// Se guarda en el navegador: máximo 6 intentos fallidos, después 15 minutos de bloqueo.
export const MAX_INTENTOS = 6;
export const MINUTOS_BLOQUEO = 15;
const CLAVE_STORAGE = "perfectanias_login_intentos";

const leer = () => {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || { fallidos: 0, bloqueadoHasta: 0 };
    } catch {
        return { fallidos: 0, bloqueadoHasta: 0 };
    }
};

const guardar = (estado) => {
    try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
    } catch {
        // Si el navegador no permite guardar (modo privado estricto), seguimos sin romper el login.
    }
};

// Devuelve cuántos milisegundos faltan para desbloquear (0 si no está bloqueado).
export const tiempoBloqueoRestante = () => {
    const { bloqueadoHasta } = leer();
    const restante = bloqueadoHasta - Date.now();
    if (restante <= 0 && bloqueadoHasta) guardar({ fallidos: 0, bloqueadoHasta: 0 });
    return Math.max(0, restante);
};

export const intentosRestantes = () => MAX_INTENTOS - leer().fallidos;

// Suma un intento fallido; al llegar al máximo, bloquea.
export const registrarIntentoFallido = () => {
    const estado = leer();
    const fallidos = estado.fallidos + 1;
    if (fallidos >= MAX_INTENTOS) {
        guardar({ fallidos, bloqueadoHasta: Date.now() + MINUTOS_BLOQUEO * 60 * 1000 });
    } else {
        guardar({ fallidos, bloqueadoHasta: 0 });
    }
    return MAX_INTENTOS - fallidos;
};

export const reiniciarIntentos = () => guardar({ fallidos: 0, bloqueadoHasta: 0 });
