# Seguridad — Perfectanias

Controles aplicados, alineados con SOC 2 (criterios de seguridad, disponibilidad y privacidad),
ISO/IEC 27001:2022 (Anexo A) e ISO/IEC 27701 (privacidad). No es una certificación: es la base
documentada que pide una auditoría.

## Acceso y autenticación
1. **Administradoras por UID**, no por email: la dueña por UID fijo (`src/config/admins.js` y `firestore.rules`) y el resto con documento en `/admins`.
2. **Alta de administradoras por invitación**: código secreto de 32 caracteres (128 bits), válido hasta 30 días, de un solo uso (se borra al usarlo) y atado al email invitado.
3. **Contraseña fuerte obligatoria** (`src/utils/seguridadPassword.js`) con checklist en vivo.
4. **Límite de intentos de login**: 6 fallidos bloquean 15 minutos (se suma al límite de Firebase Auth).
5. **Cierre de sesión automático del panel** tras 30 minutos sin actividad (`src/utils/useCierreInactividad.js`).
6. **Panel fuera de buscadores**: `Disallow: /admin` en robots.txt y `X-Robots-Tag: noindex` en `/admin`.

## Datos (Firestore)
7. **Denegado por defecto**: colección sin regla = acceso bloqueado (`firestore.rules`).
8. **Reservas privadas**: cualquiera puede crear una reserva con estructura exacta validada (campos, largos, formatos de fecha y hora); solo administradoras la leen, editan o borran.
9. **Disponibilidad sin datos personales**: los horarios ocupados se guardan separados de las reservas.
10. **Reseñas moderadas**: las de clientas quedan pendientes hasta que una administradora las aprueba.

## Navegador y servidor (Vercel)
11. **Encabezados de seguridad** (`vercel.json`): Content-Security-Policy (solo los orígenes que usa la app: Firebase, EmailJS, imágenes y mapa de Google), X-Frame-Options `DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, HSTS con preload y Cross-Origin-Opener-Policy.
12. **HTTPS forzado** por Vercel + HSTS.
13. **Función `/api/resenas-agendamas`**: URL fija (sin SSRF), tiempo máximo de 8 s, datos recortados y error genérico; respuesta cacheada 1 hora.

## Código y dependencias
14. **Sin secretos en el repositorio**: solo claves públicas por diseño (Firebase, EmailJS vía `VITE_*`). `.env*` ignorados.
15. **Dependencias sin vulnerabilidades** (`npm audit`: 0) y **Dependabot** semanal con grupos.
16. **Scripts de instalación aprobados uno por uno** (`allowScripts` en package.json, npm 12+).
17. **CI** (`.github/workflows/ci.yml`): lint, build y `npm audit` en cada PR.

## Pendientes que se configuran fuera del código
- **Firebase App Check** (reCAPTCHA Enterprise) para frenar reservas o reseñas falsas automatizadas.
- **Restringir la API key de Firebase** por dominio (Google Cloud Console → Credenciales → referentes HTTP).
- **EmailJS**: limitar orígenes permitidos al dominio de la web y fijar límite de envíos.
- **Firebase Auth**: activar protección contra enumeración de emails y política de contraseñas.
- **2FA** en las cuentas de Google/Firebase, GitHub y Vercel de quienes administran.

---
¿Encontraste un problema de seguridad? Escribinos por privado (WhatsApp de la web o GitHub). No lo publiques hasta que esté resuelto.
