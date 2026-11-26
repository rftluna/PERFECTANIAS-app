// Cuentas con acceso completo al panel /admin (por UID: siguen valiendo aunque cambien email o clave).
// El UID se ve en Firebase Console → Authentication → Usuarios → columna "UID de usuario".
// ⚠️ Si agregás o sacás una cuenta, hacé el mismo cambio en firestore.rules (función esAdmin)
//    y publicá las reglas en Firebase Console → Firestore → Reglas.
export const ADMIN_UIDS = [
    "OgWsAMKDYgQN8AhgDwjSvIzfjq72" // Dueña
];

export const esCuentaAdmin = (user) => Boolean(user && ADMIN_UIDS.includes(user.uid));
