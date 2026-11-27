// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

//⚠️Esto no deberia compartirse en un proyecto real
//📚En este proyecto educativo, por simplicidad para todos, lo utilizamos asi
//👉A futuro lo reemplazarían por variables de entorno y archivo .env😉

const firebaseConfig = {
    apiKey: "AIzaSyB99dOmxeHytPEIVPHGLPfAv_115JoHX9A",
    authDomain: "perfectanias-app.firebaseapp.com",
    projectId: "perfectanias-app",
    storageBucket: "perfectanias-app.firebasestorage.app",
    messagingSenderId: "580534903118",
    appId: "1:580534903118:web:d970b5a7db58a30bf73e1f",
    measurementId: "G-2DCZ1KJ4MM"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check: Firestore y el login solo aceptan pedidos que vienen de este sitio
// (no de scripts o bots que copien la configuración de arriba). La clave del sitio
// de reCAPTCHA es pública; la protección real se activa en Firebase → App Check.
const siteKeyRecaptcha = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || "").trim();
export const appCheckActivo = Boolean(siteKeyRecaptcha);

if (appCheckActivo) {
    if (import.meta.env.DEV) {
        // En la compu (npm run dev) se usa un token de prueba registrado en la consola de Firebase.
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || "").trim() || true;
    }
    initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKeyRecaptcha),
        isTokenAutoRefreshEnabled: true
    });
}

const db = getFirestore(app);

//para el login
const auth = getAuth(app);

export { db, auth };
