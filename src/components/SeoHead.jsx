import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const paginas = {
  '/': {
    titulo: 'Inicio',
    descripcion:
      'Osky Diseños: diseño web, branding e identidad visual para emprendedores y marcas de Argentina.',
  },
  '/productos': {
    titulo: 'Servicios',
    descripcion:
      'Explorá los servicios de diseño web, logotipos, identidad de marca y contenido para redes sociales de Osky Diseños.',
  },
  '/resenas': {
    titulo: 'Reseñas',
    descripcion:
      'Conocé las experiencias y opiniones publicadas por clientes de Osky Diseños.',
  },
  '/contacto': {
    titulo: 'Contacto',
    descripcion:
      'Contactá a Osky Diseños y contanos tu proyecto de diseño web, gráfico o branding.',
  },
  '/carrito': {
    titulo: 'Mi carrito',
    descripcion: 'Revisá los servicios seleccionados.',
    privado: true,
  },
  '/login': {
    titulo: 'Iniciar sesión',
    descripcion: 'Accedé a tu cuenta de Osky Diseños.',
    privado: true,
  },
  '/registro': {
    titulo: 'Crear cuenta',
    descripcion: 'Registrate en Osky Diseños.',
    privado: true,
  },
  '/perfil': {
    titulo: 'Mi perfil',
    descripcion: 'Panel de cuenta de Osky Diseños.',
    privado: true,
  },
  '/gestion': {
    titulo: 'Administración',
    descripcion: 'Panel de gestión de productos.',
    privado: true,
  },
  '/admin/cupones': {
    titulo: 'Gestión de cupones',
    descripcion: 'Administración de descuentos.',
    privado: true,
  },
};

export const SeoHead = () => {
  const { pathname } = useLocation();

  const datos = pathname.startsWith('/producto/')
    ? {
        titulo: 'Detalle del servicio',
        descripcion:
          'Conocé los detalles de este servicio de Osky Diseños.',
      }
    : paginas[pathname] || {
        titulo: 'Osky Diseños',
        descripcion:
          'Estudio creativo especializado en diseño web y gráfico.',
      };

  const tituloCompleto =
    datos.titulo === 'Osky Diseños'
      ? 'Osky Diseños | Diseño web y gráfico'
      : `${datos.titulo} | Osky Diseños`;

  return (
    <Helmet>
      <title>{tituloCompleto}</title>

      <meta
        name="description"
        content={datos.descripcion}
      />

      {datos.privado && (
        <meta
          name="robots"
          content="noindex, nofollow"
        />
      )}
    </Helmet>
  );
};