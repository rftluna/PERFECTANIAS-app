import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Datos del local que usan las páginas legales, el pie de página y el panel /admin → Legales.
// Se guardan en Firestore (config/legales). Lo que falte se muestra como "a completar".
export const DATOS_LEGALES_POR_DEFECTO = {
    titular: "",
    cuit: "",
    email: "",
    domicilio: "",
    whatsapp: "5491165186643",
    instagram: "https://www.instagram.com/perfectanias.ok",
    horasCancelacion: 24,
    toleranciaMinutos: 15,
    politicaSena: "reprogramar", // "reprogramar" | "reintegro" | "no_reintegra"
    diasReprogramar: 30,
    actualizado: ""
};

export const POLITICAS_SENA = [
    { id: "reprogramar", texto: "La seña queda a favor para reprogramar" },
    { id: "reintegro", texto: "La seña se devuelve" },
    { id: "no_reintegra", texto: "La seña no se devuelve" }
];

// Campos obligatorios para que los textos legales estén completos.
export const CAMPOS_OBLIGATORIOS = [
    { id: "titular", texto: "Nombre del titular o razón social" },
    { id: "email", texto: "Email de contacto" },
    { id: "domicilio", texto: "Domicilio" }
];

export const camposFaltantes = (datos) => CAMPOS_OBLIGATORIOS.filter((c) => !String(datos?.[c.id] || "").trim());

export const DOCUMENTOS_LEGALES = [
    { id: "terminos", titulo: "Términos y condiciones" },
    { id: "privacidad", titulo: "Política de privacidad" },
    { id: "cancelacion", titulo: "Política de cancelación" },
    { id: "arrepentimiento", titulo: "Botón de arrepentimiento" },
    { id: "creditos", titulo: "Licencias y créditos" }
];

export const linkWhatsAppLocal = (numero, texto = "") => {
    const solo = String(numero || "").replace(/\D/g, "");
    if (!solo) return "";
    return `https://wa.me/${solo}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
};

// Se pide una sola vez por visita y lo comparten el pie, las páginas legales y la reserva.
let cache = null;
export const cargarDatosLegales = (forzar = false) => {
    if (!cache || forzar) {
        cache = getDoc(doc(db, "config", "legales"))
            .then((snap) => ({ ...DATOS_LEGALES_POR_DEFECTO, ...(snap.exists() ? snap.data() : {}) }))
            .catch((error) => {
                console.warn("No se pudieron cargar los datos legales:", error);
                cache = null;
                return { ...DATOS_LEGALES_POR_DEFECTO };
            });
    }
    return cache;
};
