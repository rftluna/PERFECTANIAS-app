// Fotos de referencia (Unsplash, licencia libre para uso comercial) para los servicios
// que todavía no tienen foto propia. Muestran una idea del resultado terminado de cada técnica.
// En cuanto se sube una foto real desde el panel admin, esa foto reemplaza a la de referencia.
// Unsplash pide mostrar el crédito del fotógrafo y usar las imágenes desde images.unsplash.com.

const UTM = "?utm_source=perfectanias&utm_medium=referral";

const FOTOS = {
    "clasicas": {
        url: "https://images.unsplash.com/photo-1721540343335-142d9a064d94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8MTR8fGNsYXNzaWMlMjBleWVsYXNoJTIwZXh0ZW5zaW9uc3xlbnwxfHx8fDE3OTU3MDAxNzF8MA&ixlib=rb-4.1.0&q=80&w=400",
        autor: "jamal naser habibi",
        autorLink: "https://unsplash.com/@jamalnaserhabibi",
        fotoLink: "https://unsplash.com/photos/a-close-up-of-a-person-with-long-eyelashes-yv2OAmvsjbE"
    },
    "2d": {
        url: "https://images.unsplash.com/photo-1639629509821-c54cdd984227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8M3x8Y2xhc3NpYyUyMGV5ZWxhc2glMjBleHRlbnNpb25zfGVufDF8fHx8MTc5NTcwMDE3MXww&ixlib=rb-4.1.0&q=80&w=400",
        autor: "Milky Way Lashes",
        autorLink: "https://unsplash.com/@milkywaylashes",
        fotoLink: "https://unsplash.com/photos/a-close-up-of-a-persons-eye-with-long-lashes-GEct9d7zgos"
    },
    "3d": {
        url: "https://images.unsplash.com/photo-1750967785153-ac30b4eb9ac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8Mjh8fG1hc2NhcmElMjBsYXNoZXMlMjBjbG9zZXVwfGVufDF8fHx8MTc5NTcwMDE3Mnww&ixlib=rb-4.1.0&q=80&w=400",
        autor: "Volodymyr Lymariev",
        autorLink: "https://unsplash.com/@vlmrv",
        fotoLink: "https://unsplash.com/photos/close-up-of-a-green-eye-with-long-eyelashes-ugqI4poLV-g"
    },
    "4d": {
        url: "https://images.unsplash.com/photo-1715195060250-b321e5cd5171?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8OXx8Y2xhc3NpYyUyMGV5ZWxhc2glMjBleHRlbnNpb25zfGVufDF8fHx8MTc5NTcwMDE3MXww&ixlib=rb-4.1.0&q=80&w=400",
        autor: "Jader Gouveia",
        autorLink: "https://unsplash.com/@gouveiaaa",
        fotoLink: "https://unsplash.com/photos/a-close-up-of-a-persons-eye-with-long-lashes-eXpSdovpDeE"
    },
    "5d": {
        url: "https://images.unsplash.com/photo-1683719312734-e31de63957ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8OHx8Y2xhc3NpYyUyMGV5ZWxhc2glMjBleHRlbnNpb25zfGVufDF8fHx8MTc5NTcwMDE3MXww&ixlib=rb-4.1.0&q=80&w=400",
        autor: "Samela Carvalho",
        autorLink: "https://unsplash.com/@samella",
        fotoLink: "https://unsplash.com/photos/a-close-up-of-a-persons-eye-with-long-eyelashes-hxp1rPHSUzI"
    },
    "foxy": {
        url: "https://images.unsplash.com/photo-1663330789058-c7b4c491c88d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8MTB8fGxvbmclMjBleWVsYXNoZXMlMjBjbG9zZXVwfGVufDF8fHx8MTc5NTcwMDE3M3ww&ixlib=rb-4.1.0&q=80&w=400",
        autor: "Liz Lorelei",
        autorLink: "https://unsplash.com/@loreleiweb",
        fotoLink: "https://unsplash.com/photos/close-up-of-a-persons-eye-9u1jIHMlohM"
    },
    "rimel": {
        url: "https://images.unsplash.com/photo-1548902378-2ec44c906391?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTQ1NjI1fDB8MXxzZWFyY2h8NHx8ZXllbGFzaCUyMGV4dGVuc2lvbnN8ZW58MXx8fHwxNzk1NzAwMTY5fDA&ixlib=rb-4.1.0&q=80&w=400",
        autor: "Aleks",
        autorLink: "https://unsplash.com/@aaaarupar",
        fotoLink: "https://unsplash.com/photos/woman-left-eye-Wude2F3CMss"
    }
};

const sinAcentos = (t) =>
    String(t || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

// Elige la foto según la técnica que dice el nombre del servicio.
export const fotoReferenciaDe = (nombre) => {
    const n = sinAcentos(nombre);
    let clave = null;
    if (n.includes("foxy")) clave = "foxy";
    else if (n.includes("rimel") || n.includes("mascara")) clave = "rimel";
    else if (n.includes("extension") || n.includes("volumen") || n.includes("clasica")) {
        const volumen = n.match(/([2-5])\s*d\b/);
        clave = volumen ? `${volumen[1]}d` : "clasicas";
    }
    const foto = clave && FOTOS[clave];
    if (!foto) return null;
    return {
        ...foto,
        autorLink: foto.autorLink + UTM,
        fotoLink: foto.fotoLink + UTM,
        unsplashLink: "https://unsplash.com/" + UTM
    };
};
