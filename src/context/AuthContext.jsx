import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setRol(userSnap.data().rol || 'cliente');
          } else {
            setRol('cliente');
          }
        } catch (err) {
          console.error('Error al obtener rol del usuario:', err);
          setRol('cliente');
        }
      } else {
        setRol(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, nombre) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const nuevoUsuario = userCredential.user;

    // Guarda el perfil y rol por defecto en Firestore usando el UID como ID de documento
    await setDoc(doc(db, 'usuarios', nuevoUsuario.uid), {
      nombre: nombre.trim(),
      email: nuevoUsuario.email,
      rol: 'cliente',
      fechaRegistro: new Date().toISOString()
    });

    setRol('cliente');
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, rol, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};