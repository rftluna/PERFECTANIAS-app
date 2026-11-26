// Función serverless de Vercel: GET /api/resenas-agendamas
// Lee las opiniones públicas de la página de Perfectanias en Agendamas y las devuelve en el
// mismo formato que las reseñas de Firestore ({ id, nombre, fecha, estrellas, texto, origen }).
// Vercel guarda la respuesta 1 hora en su CDN, así no se consulta Agendamas en cada visita.

const URL_AGENDAMAS = "https://www.agendamas.app/perfectanias";

// Next.js manda los datos de la página dentro de self.__next_f.push([1, "..."]).
// Juntamos esos textos (des-escapados) para poder buscar el JSON adentro.
const extraerPayload = (html) => {
    const partes = [];
    const regex = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
    let m;
    while ((m = regex.exec(html))) {
        try {
            partes.push(JSON.parse(m[1]));
        } catch {
            // Fragmento ilegible: se ignora.
        }
    }
    return partes.join("");
};

// Recorta el arreglo JSON que empieza en "inicio" respetando comillas y corchetes anidados.
const recortarArreglo = (texto, inicio) => {
    let profundidad = 0;
    let enString = false;
    for (let i = inicio; i < texto.length; i++) {
        const c = texto[i];
        if (enString) {
            if (c === "\\") i++;
            else if (c === '"') enString = false;
        } else if (c === '"') enString = true;
        else if (c === "[") profundidad++;
        else if (c === "]" && --profundidad === 0) return texto.slice(inicio, i + 1);
    }
    return null;
};

// "2026-11-24T01:18:42+00:00" -> "2026-11-23" (fecha en hora de Argentina, como la muestra Agendamas).
const fechaArgentina = (valor) => {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
};

export const extraerResenas = (html) => {
    const payload = extraerPayload(html);
    const marca = '"reviews":[';
    const pos = payload.indexOf(marca);
    if (pos === -1) return [];
    const arreglo = recortarArreglo(payload, pos + marca.length - 1);
    if (!arreglo) return [];

    return JSON.parse(arreglo)
        .filter((r) => r && r.author_name && Number(r.rating) >= 1)
        .map((r) => ({
            id: `agendamas-${r.id}`,
            nombre: String(r.author_name).trim().slice(0, 60),
            fecha: fechaArgentina(r.created_at),
            estrellas: Math.max(1, Math.min(5, Number(r.rating))),
            texto: String(r.comment || "").trim().slice(0, 1500),
            respuesta: r.owner_reply ? String(r.owner_reply).trim().slice(0, 1500) : "",
            origen: "agendamas"
        }));
};

export default async function handler(req, res) {
    try {
        const respuesta = await fetch(URL_AGENDAMAS, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; PerfectaniasResenas/1.0)", Accept: "text/html" },
            signal: AbortSignal.timeout(8000)
        });
        if (!respuesta.ok) throw new Error(`Agendamas respondió ${respuesta.status}`);

        const resenas = extraerResenas(await respuesta.text());

        res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
        res.status(200).json({ resenas, actualizado: new Date().toISOString(), fuente: URL_AGENDAMAS });
    } catch (error) {
        console.error("Reseñas de Agendamas:", error);
        // Si Agendamas no responde, la web sigue mostrando las reseñas propias.
        res.setHeader("Cache-Control", "public, s-maxage=300");
        res.status(200).json({ resenas: [], error: "No se pudieron leer las reseñas de Agendamas." });
    }
}
