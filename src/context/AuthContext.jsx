import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { DUENA_UID } from "../config/admins";

//creamos el contexto
const AuthContext = createContext();

//custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};

// ¿La cuenta es administradora? La dueña siempre; el resto si tiene su documento en "admins".
const consultarEsAdmin = async (firebaseUser) => {
  if (!firebaseUser) return false;
  if (firebaseUser.uid === DUENA_UID) return true;
  try {
    const snap = await getDoc(doc(db, "admins", firebaseUser.uid));
    return snap.exists();
  } catch (error) {
    console.error("No se pudo verificar el rol de administradora:", error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      setEsAdmin(await consultarEsAdmin(firebaseUser));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Se usa después de aceptar una invitación, cuando recién se creó el documento en "admins".
  const refrescarRol = useCallback(async () => {
    const resultado = await consultarEsAdmin(auth.currentUser);
    setEsAdmin(resultado);
    return resultado;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, esAdmin, refrescarRol, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
