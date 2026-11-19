import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthContext } from './AuthContext';

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
          setRol(userSnap.exists() ? userSnap.data().rol || 'cliente' : 'cliente');
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

    await setDoc(doc(db, 'usuarios', nuevoUsuario.uid), {
      nombre: nombre.trim(),
      email: nuevoUsuario.email,
      rol: 'cliente',
      fechaRegistro: new Date().toISOString(),
    });

    setRol('cliente');
    return userCredential;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, rol, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
