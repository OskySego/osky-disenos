import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './context/CartProvider';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import './css/styles.css';
import './css/sistema-visual-osky.css';

// Carga cada página cuando el visitante accede a su ruta.
// Las páginas existentes utilizan exportaciones con nombre.
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const ProductosPage = lazy(() => import('./pages/ProductosPage').then((m) => ({ default: m.ProductosPage })));
const ItemDetail = lazy(() => import('./pages/ItemDetail').then((m) => ({ default: m.ItemDetail })));
const ResenasPage = lazy(() => import('./pages/ResenasPage').then((m) => ({ default: m.ResenasPage })));
const ContactoPage = lazy(() => import('./pages/ContactoPage').then((m) => ({ default: m.ContactoPage })));
const CarritoPage = lazy(() => import('./pages/CarritoPage').then((m) => ({ default: m.CarritoPage })));
const GestionPage = lazy(() => import('./pages/GestionPage').then((m) => ({ default: m.GestionPage })));
const GestionCuponesPage = lazy(() => import('./pages/GestionCuponesPage').then((m) => ({ default: m.GestionCuponesPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegistroPage = lazy(() => import('./pages/RegistroPage').then((m) => ({ default: m.RegistroPage })));
const PerfilPage = lazy(() => import('./pages/PerfilPage').then((m) => ({ default: m.PerfilPage })));

const SolicitudesPage = lazy(() =>
  import('./pages/SolicitudesPage').then((m) => ({
    default: m.SolicitudesPage
  }))
);

const OfertasAdminPage = lazy(() =>
  import('./pages/OfertasAdminPage').then((m) => ({
    default: m.OfertasAdminPage
  }))
);

const PantallaCargando = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      color: 'var(--cyber-hielo, #F2F0F7)',
      textAlign: 'center',
    }}
  >
    Cargando Osky Diseños…
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<PantallaCargando />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="productos" element={<ProductosPage />} />
                <Route path="producto/:id" element={<ItemDetail />} />
                <Route path="resenas" element={<ResenasPage />} />
                <Route path="contacto" element={<ContactoPage />} />
                <Route path="carrito" element={<CarritoPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegistroPage />} />

                <Route
                  path="perfil"
                  element={
                    <ProtectedRoute>
                      <PerfilPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="gestion"
                  element={
                    <ProtectedRoute rolesPermitidos={['admin']}>
                      <GestionPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin/cupones"
                  element={
                    <ProtectedRoute rolesPermitidos={['admin']}>
                      <GestionCuponesPage />
                    </ProtectedRoute>
                  }
                />

                {/* HISTORIAL DE SOLICITUDES */}
                <Route
                  path="solicitudes"
                  element={
                    <ProtectedRoute>
                      <SolicitudesPage />
                    </ProtectedRoute>
                  }
                />

                {/* ADMINISTRACIÓN DE OFERTAS */}
                <Route
                  path="admin/ofertas"
                  element={
                    <ProtectedRoute rolesPermitidos={['admin']}>
                      <OfertasAdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
          <ToastContainer position="bottom-right" autoClose={2500} theme="dark" />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
