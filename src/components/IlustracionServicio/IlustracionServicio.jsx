import { useState } from "react";

// Ilustración rosa para los servicios que todavía no tienen foto.
// Se elige según el nombre del servicio y muestra la diferencia entre técnicas:
// clásicas = 1 fibra por pestaña, volumen 2D a 5D = abanicos de 2 a 5 fibras,
// Foxy = ojo alargado hacia afuera, rimel = puntas agrupadas, lifting = pestañas curvadas, cejas, combos.
// En cuanto se carga una foto real desde el panel, se muestra la foto.

const TINTA = "#8c5a71";
const ROSA = "#d4a3b8";

const sinAcentos = (t) =>
    String(t || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

// Decide qué dibujar a partir del nombre.
const tipoIlustracion = (nombre) => {
    const n = sinAcentos(nombre);
    const volumen = n.match(/([2-5])\s*d\b/);
    if (n.includes("foxy")) return { tipo: "foxy", fibras: volumen ? Number(volumen[1]) : 3 };
    if (n.includes("rimel") || n.includes("mascara")) return { tipo: "rimel" };
    if (n.includes("extension") || n.includes("volumen") || n.includes("clasica")) {
        return { tipo: "extensiones", fibras: volumen ? Number(volumen[1]) : 1 };
    }
    const cejas = n.includes("ceja") || n.includes("perfilado") || n.includes("laminado") || n.includes("henna");
    const lifting = n.includes("lifting") || n.includes("pestana");
    if (cejas && lifting) return { tipo: "combo" };
    if (n.includes("laminado")) return { tipo: "laminado" };
    if (cejas) return { tipo: "cejas" };
    if (lifting) return { tipo: "lifting" };
    return { tipo: "brillo" };
};

// Punto, tangente y normal de una curva cuadrática (párpado).
const curva = (p0, p1, p2, t) => {
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
    const tx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const ty = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    const largo = Math.hypot(tx, ty) || 1;
    return { x, y, tx: tx / largo, ty: ty / largo };
};

const rotar = (vx, vy, grados) => {
    const r = (grados * Math.PI) / 180;
    return [vx * Math.cos(r) - vy * Math.sin(r), vx * Math.sin(r) + vy * Math.cos(r)];
};

// Ojo cerrado con pestañas hacia abajo. fibras = cuántas fibras tiene cada abanico.
const OjoCerrado = ({ fibras = 1, foxy = false, rimel = false }) => {
    const p0 = foxy ? [16, 50] : [18, 50];
    const p1 = [48, 72];
    const p2 = foxy ? [79, 45] : [82, 50];
    const posiciones = 11;
    const trazos = [];

    for (let i = 0; i < posiciones; i++) {
        const t = 0.06 + (i / (posiciones - 1)) * 0.88;
        const { x, y, tx, ty } = curva(p0, p1, p2, t);
        let [nx, ny] = [-ty, tx];
        if (ny < 0) [nx, ny] = [-nx, -ny];
        // Las pestañas se inclinan un poco hacia afuera del ojo.
        [nx, ny] = rotar(nx, ny, (t - 0.5) * -38);

        let largo = 9 + Math.sin(t * Math.PI) * 6;
        if (foxy) largo = 7 + t * 10;

        if (rimel) {
            // Puntas agrupadas: 3 fibras que se juntan en la punta (efecto "mojado").
            const punta = [x + nx * (largo + 2), y + ny * (largo + 2)];
            [-3, 0, 3].forEach((d, k) => {
                trazos.push(<path key={`${i}-${k}`} d={`M${x + tx * d * 0.6} ${y + ty * d * 0.6} Q${x + nx * largo * 0.5} ${y + ny * largo * 0.5} ${punta[0]} ${punta[1]}`} />);
            });
            continue;
        }

        const apertura = fibras === 1 ? 0 : 7 + fibras * 2;
        for (let f = 0; f < fibras; f++) {
            const angulo = fibras === 1 ? 0 : -apertura / 2 + (apertura / (fibras - 1)) * f;
            const [vx, vy] = rotar(nx, ny, angulo);
            trazos.push(<line key={`${i}-${f}`} x1={x} y1={y} x2={x + vx * largo} y2={y + vy * largo} />);
        }
    }

    return (
        <g>
            <g stroke={TINTA} strokeWidth={fibras >= 4 ? 0.9 : rimel ? 1.1 : 1.3} strokeLinecap="round" fill="none" opacity="0.9">
                {trazos}
            </g>
            <path d={`M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} stroke={TINTA} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
    );
};

// Ojo abierto con pestañas curvadas hacia arriba (lifting).
const OjoLifting = () => {
    const p0 = [18, 58];
    const p1 = [50, 34];
    const p2 = [82, 58];
    const pestanas = [];
    for (let i = 0; i < 10; i++) {
        const t = 0.08 + (i / 9) * 0.84;
        const { x, y, tx, ty } = curva(p0, p1, p2, t);
        let [nx, ny] = [-ty, tx];
        if (ny > 0) [nx, ny] = [-nx, -ny];
        const largo = 10 + Math.sin(t * Math.PI) * 5;
        const fin = [x + nx * largo + tx * 4, y + ny * largo];
        pestanas.push(<path key={i} d={`M${x} ${y} Q${x + nx * largo * 0.8} ${y + ny * largo * 0.8} ${fin[0]} ${fin[1] - 2}`} />);
    }
    return (
        <g>
            <path d="M18 58 Q50 76 82 58" stroke={ROSA} strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="56" r="9" fill={ROSA} opacity="0.55" />
            <circle cx="50" cy="56" r="4" fill={TINTA} />
            <g stroke={TINTA} strokeWidth="1.4" strokeLinecap="round" fill="none">
                {pestanas}
            </g>
            <path d="M18 58 Q50 34 82 58" stroke={TINTA} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
    );
};

// Ceja. laminado = pelitos peinados hacia arriba; sombreado = relleno suave.
const Ceja = ({ y = 0, laminado = false, sombreado = true }) => (
    <g transform={`translate(0 ${y})`}>
        <path d="M20 46 Q40 30 62 33 Q74 35 82 42 Q70 39 60 40 Q42 41 22 50 Z" fill={TINTA} opacity={sombreado ? 0.85 : 0.6} />
        {laminado && (
            <g stroke={TINTA} strokeWidth="1.1" strokeLinecap="round">
                {[26, 32, 38, 44, 50, 56, 62, 68, 74].map((x, i) => (
                    <line key={x} x1={x} y1={44 - i * 0.6} x2={x + 2.5} y2={34 - i * 0.4 - (i > 5 ? 0 : 2)} />
                ))}
            </g>
        )}
    </g>
);

const Brillo = ({ x, y, r = 4 }) => <path d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`} fill="#ffffff" opacity="0.95" />;

export const IlustracionServicio = ({ nombre }) => {
    const { tipo, fibras } = tipoIlustracion(nombre);
    const id = `ilu-${sinAcentos(nombre).replace(/[^a-z0-9]/g, "").slice(0, 24) || "srv"}`;

    let dibujo;
    if (tipo === "extensiones") dibujo = <OjoCerrado fibras={fibras} />;
    else if (tipo === "foxy") dibujo = <OjoCerrado fibras={fibras} foxy />;
    else if (tipo === "rimel") dibujo = <OjoCerrado rimel />;
    else if (tipo === "lifting") dibujo = <OjoLifting />;
    else if (tipo === "laminado") dibujo = <Ceja y={8} laminado />;
    else if (tipo === "cejas") dibujo = <Ceja y={8} />;
    else if (tipo === "combo")
        dibujo = (
            <g>
                <g transform="translate(8 -9) scale(0.84 0.8)">
                    <Ceja laminado />
                </g>
                <g transform="translate(8 16) scale(0.84)">
                    <OjoLifting />
                </g>
            </g>
        );
    else dibujo = null;

    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label={`Ilustración de ${nombre}`} preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fdf1f6" />
                    <stop offset="100%" stopColor="#f3d3e0" />
                </linearGradient>
            </defs>
            <rect width="100" height="100" fill={`url(#${id})`} />
            <circle cx="80" cy="18" r="22" fill="#ffffff" opacity="0.35" />
            {dibujo}
            <Brillo x={82} y={18} r={5} />
            <Brillo x={16} y={24} r={3} />
            {tipo === "brillo" && <Brillo x={50} y={50} r={16} />}
            {(tipo === "extensiones" || tipo === "foxy") && fibras > 1 && (
                <text x="50" y="94" textAnchor="middle" fontSize="9" fontWeight="700" fill={TINTA} opacity="0.75" fontFamily="system-ui, sans-serif">
                    {fibras}D
                </text>
            )}
        </svg>
    );
};

// Foto del servicio; si no tiene o no carga, muestra la ilustración.
export const FotoServicio = ({ servicio, className = "" }) => {
    const [fallo, setFallo] = useState(false);
    const usarFoto = servicio?.image && !fallo;
    return (
        <div className={className}>
            {usarFoto ? <img src={servicio.image} alt={servicio.name || "Servicio"} loading="lazy" onError={() => setFallo(true)} /> : <IlustracionServicio nombre={servicio?.name || ""} />}
        </div>
    );
};
