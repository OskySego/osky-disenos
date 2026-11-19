import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = () => (
  <div className="app-layout">
    <Header />
    <main id="contenido-principal" tabIndex={-1} className="page-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);
