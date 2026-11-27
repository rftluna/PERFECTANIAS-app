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
11. **Encabezados de seguridad** (`vercel.json`): Content-Security-Policy (solo los orígenes que usa la app: Firebase, App Check/reCAPTCHA, EmailJS, imágenes y mapa de Google), X-Frame-Options `DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, HSTS con preload y Cross-Origin-Opener-Policy.
12. **HTTPS forzado** por Vercel + HSTS.
13. **Función `/api/resenas-agendamas`**: URL fija (sin SSRF), tiempo máximo de 8 s, datos recortados y error genérico; respuesta cacheada 1 hora.

## Código y dependencias
14. **Sin secretos en el repositorio**: solo claves públicas por diseño (Firebase, EmailJS vía `VITE_*`). `.env*` ignorados.
15. **Dependencias sin vulnerabilidades** (`npm audit`: 0) y **Dependabot** semanal con grupos.
16. **Scripts de instalación aprobados uno por uno** (`allowScripts` en package.json, npm 12+).
17. **CI** (`.github/workflows/ci.yml`): lint, build y `npm audit` en cada PR.
18. **Escaneo semanal OWASP ZAP** (`.github/workflows/zap.yml`) del sitio publicado.

## Privacidad (ISO 27701 · Ley 25.326)
19. **Política de privacidad** con responsable, datos, finalidades, proveedores (Firebase, EmailJS, Vercel, Google Maps, Agendamas, Google reCAPTCHA), medidas de seguridad, plazos de respuesta y derechos.
20. **Datos de salud** (notas de la reserva) tratados como datos sensibles: aviso en el formulario y uso limitado a la atención.
21. **Mapa de Google a pedido** ("Ver mapa"): Google no recibe la visita ni deja cookies sin una acción de quien navega.
22. **Licencias y créditos** (`/legales/creditos`), con la atribución que exige Font Awesome (CC BY 4.0).

## Protección contra bots (SOC 2 CC6.6 · ISO 27001 A.8.20)
23. **Firebase App Check** con reCAPTCHA Enterprise (`src/firebase/config.js`): Firestore y el login solo aceptan pedidos hechos desde este sitio, no desde scripts o bots que copien la configuración pública de Firebase. Se activa con la variable `VITE_RECAPTCHA_SITE_KEY` y se exige en Firebase → App Check (*Enforce*).

## Configurado fuera del código
- **2FA con app de autenticación** en las cuentas de Google/Firebase, GitHub y Vercel de quienes administran.
- **GitHub**: `main` protegida (cambios solo por Pull Request), *secret scanning* con *push protection*, CodeQL y alertas de Dependabot.

## Pendientes que se configuran fuera del código
- **Firebase App Check: pasar a *Enforce*** en Firestore y Authentication después de comprobar en las métricas que casi todos los pedidos llegan verificados.
- **Restringir la API key de Firebase** por dominio (Google Cloud Console → Credenciales → referentes HTTP).
- **EmailJS**: limitar orígenes permitidos al dominio de la web y fijar límite de envíos.
- **Firebase Auth**: activar protección contra enumeración de emails y política de contraseñas.

---
¿Encontraste un problema de seguridad? Escribinos por privado (WhatsApp de la web o GitHub). No lo publiques hasta que esté resuelto.
