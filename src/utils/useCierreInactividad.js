import { useEffect, useRef } from "react";

/** Minutos sin actividad (mouse, teclado, toques) antes de cerrar la sesión del panel. */
export const MINUTOS_INACTIVIDAD = 30;

/**
 * Cierra la sesión si no hay actividad durante `minutos`.
 * Evita que el panel quede abierto en una compu compartida o desatendida.
 */
export function useCierreInactividad(activo, alVencer, minutos = MINUTOS_INACTIVIDAD) {
    const callback = useRef(alVencer);
    useEffect(() => {
        callback.current = alVencer;
    }, [alVencer]);

    useEffect(() => {
        if (!activo) return;
        let timer;
        const reiniciar = () => {
            clearTimeout(timer);
            timer = setTimeout(() => callback.current?.(), minutos * 60_000);
        };
        const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        eventos.forEach((e) => window.addEventListener(e, reiniciar, { passive: true }));
        reiniciar();
        return () => {
            clearTimeout(timer);
            eventos.forEach((e) => window.removeEventListener(e, reiniciar));
        };
    }, [activo, minutos]);
}
