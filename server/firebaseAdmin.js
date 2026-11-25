// Solo para las funciones del backend. NUNCA importar desde src/.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function serviciosAdmin() {
  if (!getApps().length) {
    const secreto = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!secreto) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT_JSON');
    const cuenta = JSON.parse(secreto);
    if (!cuenta.private_key || !cuenta.client_email || !cuenta.project_id) {
      throw new Error('La cuenta de servicio no está completa');
    }
    initializeApp({ credential: cert({ ...cuenta, private_key: cuenta.private_key.replace(/\\n/g, '\n') }) });
  }
  return { adminAuth: getAuth(), adminDb: getFirestore() };
}
