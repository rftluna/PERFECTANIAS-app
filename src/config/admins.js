// Cuenta de la dueña: siempre es administradora (por UID, vale aunque cambie email o clave).
// Las demás administradoras se suman con invitación desde /admin → Equipo
// y quedan guardadas en la colección "admins" de Firestore.
// ⚠️ Este UID tiene que ser el mismo que el de firestore.rules (función esDuena).
export const DUENA_UID = "OgWsAMKDYgQN8AhgDwjSvIzfjq72";

// Días que dura un link de invitación.
export const DIAS_VALIDEZ_INVITACION = 7;
