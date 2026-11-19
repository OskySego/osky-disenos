import { createContext, useContext } from 'react';

// Contexto y hook. No exporta componentes; evita advertencias Fast Refresh.
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
