import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

// CORREGIDO: Apuntamos globalmente a la colección correcta "turnos de servicios"
const productsRef = collection(db, "turnos de servicios");

/* -------------------------------------------------------------------------- */
/*                                TRAER PRODUCTOS                             */
/* -------------------------------------------------------------------------- */
export const getProducts = async () => {
    try {
        const snapshot = await getDocs(productsRef);

        const productsFormat = snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
        });

        return productsFormat;
    } catch (error) {
        console.log("Error al traer productos", error);
        throw error;
    }
};

/* -------------------------------------------------------------------------- */
/*                            TRAER PRODUCTO POR ID                           */
/* -------------------------------------------------------------------------- */
export const getProductById = async (id) => {
    try {
        const productRef = doc(productsRef, id);
        const snapshot = await getDoc(productRef);

        if (snapshot.exists()) {
            const product = { id: snapshot.id, ...snapshot.data() };
            console.log("Doc:", product);
            return product;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al traer producto por ID:", error);
        throw error;
    }
};

/* -------------------------------------------------------------------------- */
/*                         SI FILTRAMOS POR CATEGORY                          */
/* -------------------------------------------------------------------------- */
export const getByCategory = async (category) => {
    try {
        let queryRef;

        if (category) {
            queryRef = query(productsRef, where("category", "==", category));
        } else {
            queryRef = productsRef;
        }

        const snapshot = await getDocs(queryRef);
        const productsFormat = snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
        });
        return productsFormat;
    } catch (error) {
        console.error("Error al filtrar productos:", error);
        throw error;
    }
};

/* -------------------------------------------------------------------------- */
/*                               ALTA DE PRODUCTO                             */
/* -------------------------------------------------------------------------- */
export const createProduct = async (productData) => {
    try {
        const docRef = await addDoc(productsRef, productData);
        return docRef.id;
    } catch (error) {
        console.error("Error al crear producto:", error);
        throw error;
    }
};
