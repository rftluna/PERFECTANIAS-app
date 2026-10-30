// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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

const db = getFirestore(app);

//para el login
const auth = getAuth(app);

export { db, auth };
