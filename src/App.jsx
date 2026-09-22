import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductosPage } from './pages/ProductosPage';
import { ItemDetail } from './pages/ItemDetail';
import { ResenasPage } from './pages/ResenasPage';
import { ContactoPage } from './pages/ContactoPage';
import { CarritoPage } from './pages/CarritoPage';
import "./css/styles.css";

function App() {
  return (
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
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;