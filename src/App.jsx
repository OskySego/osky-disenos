import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductosPage } from './pages/ProductosPage';
import { ItemDetail } from './pages/ItemDetail';
import { ResenasPage } from './pages/ResenasPage';
import { ContactoPage } from './pages/ContactoPage';
import { CarritoPage } from './pages/CarritoPage';
import { GestionPage } from './pages/GestionPage';
import { GestionCuponesPage } from './pages/GestionCuponesPage';
import { LoginPage } from './pages/LoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { PerfilPage } from './pages/PerfilPage';
import './css/styles.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
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
            </Route>
          </Routes>
          <ToastContainer position="bottom-right" autoClose={2500} theme="dark" />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;