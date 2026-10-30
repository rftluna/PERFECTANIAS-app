// src/services/bookingService.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config"; // <--- Importamos la 'db' desde tu archivo de configuración (ajusta la ruta si tu config está en otra carpeta, ej: "../config" o "./firebase")

export const SUCURSALES = [
    { id: "casanova", name: "Isidro Casanova", address: "República de Portugal 2843, Isidro Casanova" },
    { id: "moron", name: "Morón", address: "Dr. José María Casullo 239, Morón" },
    { id: "ramos", name: "Ramos Mejía", address: "Leandro N. Alem 185, Ramos Mejía" }
];

export const DIAS_DISPONIBLES = [
    { day: "MIÉ", date: "4", month: "nov" },
    { day: "VIE", date: "6", month: "nov" },
    { day: "LUN", date: "9", month: "nov" },
    { day: "VIE", date: "13", month: "nov" },
    { day: "LUN", date: "16", month: "nov" }
];

export const HORARIOS = ["08:00", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00"];

// Función asincrónica para traer los servicios desde Firestore
export const getServiciosFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "servicios")); // Asegúrate de que tu colección en Firestore se llame exactamente "servicios"
        const serviciosList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Servicios obtenidos de Firestore:", serviciosList);
        return serviciosList;
    } catch (error) {
        console.error("Error al obtener los servicios de Firestore: ", error);
        return [];
    }
};
