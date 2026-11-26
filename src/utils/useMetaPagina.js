import { useEffect } from "react";

const TITULO_BASE = "Perfectanias";

// Cambia el <title> y la meta descripción de la página actual (SEO por pestaña).
// "ruta" (opcional) actualiza la URL canónica y og:url, ej: "/category/pestanas".
export const useMetaPagina = (titulo, descripcion, ruta) => {
    useEffect(() => {
        document.title = titulo ? `${titulo} | ${TITULO_BASE}` : TITULO_BASE;

        if (descripcion) {
            document.querySelector('meta[name="description"]')?.setAttribute("content", descripcion);
            document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
            document.querySelector('meta[property="og:description"]')?.setAttribute("content", descripcion);
        }

        if (ruta !== undefined) {
            const url = `${window.location.origin}${ruta}`;
            document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
            document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
        }
    }, [titulo, descripcion, ruta]);
};
