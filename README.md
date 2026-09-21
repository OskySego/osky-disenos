# README.md - Osky Diseños

## Propósito de la Página
Este proyecto es una aplicación web SPA (*Single Page Application*) desarrollada en **React** para **Osky Diseños**, emprendimiento especializado en servicios de diseño web, branding y piezas gráficas. Carga su catálogo de servicios de forma dinámica desde un archivo JSON local, gestiona el carrito de compras globalmente con estado persistente y permite finalizar pedidos enviando un resumen detallado directamente al WhatsApp del negocio, además de contar con un formulario de contacto funcional vía Formspree[cite: 1, 4, 6].

---

## Cambios y Mejoras en esta Entrega (Migración a React)

* **Migración a React + Vite:** Se transformó la maquetación estática original en una arquitectura modular por componentes reutilizables utilizando React y Vite para una velocidad de desarrollo y rendimiento óptimos.
* **Sistema de Ruteo SPA (`react-router-dom`):** Navegación fluida y sin recargas entre las páginas principales (`/`, `/productos`, `/producto/:id`, `/resenas`, `/contacto` y `/carrito`).
* **Estado Global con Context API (`CartContext`):** 
  * Manejo unificado de ítems agregados, indicador numérico en tiempo real en el `CartWidget` y cálculo del monto total.
  * Control de cantidades ($+$ y $-$) e incremento/decrecimiento individual dentro del carrito.
  * Persistencia de datos mediante `localStorage`.
* **Checkout Integrado con WhatsApp:** Al presionar "Finalizar Compra", se genera un mensaje estructurado con el desglose de productos, cantidades y precio total en ARS enviado directamente al número `+54 9 11 2323-0175`, limpiando el carrito automáticamente tras el envío.
* **Rediseño UI/UX y Presentación de Imágenes:**
  * Aplicación de `object-fit: contain` y contenedores adaptativos para previsualizar logos y piezas gráficas completas sin recortes.
  * Efectos de *zoom* suave en *hover* sobre las tarjetas de producto.
  * Incorporación del componente `Footer` con información de la empresa y tarjetas del equipo de trabajo[cite: 6].

---

## Estructura del Proyecto

```text
osky-disenos/
├── public/
│   ├── img/                   # Assets gráficos, vectores y fotografías de servicios
│   └── productos.json         # Catálogo JSON local consumido mediante fetch[cite: 6]
├── src/
│   ├── components/            # Componentes de UI reutilizables
│   │   ├── CartWidget.jsx     # Ícono del carrito con badge de cantidad en tiempo real[cite: 6]
│   │   ├── Footer.jsx         # Pie de página con información y miembros del equipo[cite: 6]
│   │   ├── Header.jsx         # Cabecera principal con Isologotipo, Nav y CartWidget[cite: 6]
│   │   ├── Item.jsx           # Tarjeta individual de presentación de producto/servicio[cite: 6]
│   │   ├── ItemListContainer.jsx # Contenedor agrupador de productos por categorías[cite: 6]
│   │   ├── Layout.jsx         # Estructura wrapper con Header, Outlet y Footer[cite: 6]
│   │   └── NavBar.jsx         # Menú de navegación con componentes NavLink[cite: 6]
│   ├── context/
│   │   └── CartContext.jsx    # Proveedor global de estado del carrito de compras[cite: 6]
│   ├── pages/                 # Vistas principales de la aplicación
│   │   ├── CarritoPage.jsx    # Detalle del pedido, ajuste de unidades y envío a WhatsApp[cite: 6]
│   │   ├── ContactoPage.jsx   # Formulario de contacto integrado con Formspree[cite: 1]
│   │   ├── Home.jsx           # Página de bienvenida, propuesta de valor y destacados[cite: 2]
│   │   ├── ItemDetail.jsx     # Vista detallada e individual de un servicio (/producto/:id)[cite: 6]
│   │   ├── ProductosPage.jsx  # Catálogo completo de servicios organizados por área[cite: 3]
│   │   └── ResenasPage.jsx    # Testimonios y valoraciones de clientes[cite: 5]
│   ├── css/
│   │   └── styles.css         # Estilos globales responsivos (Flexbox, Grid y Animaciones)
│   ├── App.jsx                # Configuración principal de rutas y contexto global[cite: 6]
│   └── main.jsx               # Punto de entrada de la aplicación React
├── package.json
└── README.md