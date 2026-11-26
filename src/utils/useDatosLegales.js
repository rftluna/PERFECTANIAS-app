import { useEffect, useState } from "react";
import { DATOS_LEGALES_POR_DEFECTO, cargarDatosLegales } from "./legales";

// Datos del local para las páginas legales y el pie (con valores por defecto mientras cargan).
export const useDatosLegales = () => {
    const [datos, setDatos] = useState(DATOS_LEGALES_POR_DEFECTO);
    const [cargado, setCargado] = useState(false);

    useEffect(() => {
        let activo = true;
        cargarDatosLegales().then((d) => {
            if (activo) {
                setDatos(d);
                setCargado(true);
            }
        });
        return () => {
            activo = false;
        };
    }, []);

    return { datos, cargado };
};
