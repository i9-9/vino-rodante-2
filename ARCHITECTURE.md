# Documentación de Arquitectura - Vino Rodante

## Descripción General
Este proyecto es una aplicación web moderna construida con Next.js 15.2.4 y TypeScript, diseñada para una tienda de vinos en línea. La aplicación utiliza un stack tecnológico moderno y sigue las mejores prácticas de desarrollo web.

## Stack Tecnológico

### Frontend
- **Framework Principal**: Next.js 15.2.4
- **Lenguaje**: TypeScript
- **UI Components**: 
  - Radix UI (componentes accesibles y personalizables)
  - Tailwind CSS (estilizado)
  - Lucide React (iconos)
- **Estado y Formularios**:
  - React Hook Form
  - Zod (validación)
- **Internacionalización**: Sistema de múltiples idiomas implementado
- **Temas**: Soporte para temas claro/oscuro con next-themes

### Backend
- **Base de Datos**: Supabase
- **Autenticación**: Supabase Auth
- **Pagos**: Integración con MercadoPago

## Estructura del Proyecto

### Directorios Principales

#### `/app`
- Implementación de rutas y páginas usando el App Router de Next.js
- Estructura de rutas:
  - `/` - Página principal
  - `/about` - Página sobre nosotros
  - `/contact` - Página de contacto
  - `/account` - Gestión de cuenta de usuario
  - `/auth` - Autenticación
  - `/checkout` - Proceso de pago
  - `/collections` - Colecciones de productos
  - `/products` - Catálogo de productos
  - `/api` - Endpoints de API

#### `/components`
Componentes reutilizables de la aplicación:
- `header.tsx` - Cabecera principal
- `footer.tsx` - Pie de página
- `cart-sidebar.tsx` - Carrito de compras
- `product-card.tsx` - Tarjeta de producto
- `mega-menu.tsx` - Menú de navegación
- `mobile-menu.tsx` - Menú móvil
- `language-switcher.tsx` - Selector de idioma
- Componentes UI adicionales en `/components/ui`

#### `/lib`
Utilidades y configuraciones compartidas

#### `/hooks`
Custom React hooks

#### `/styles`
Estilos globales y configuraciones de Tailwind

#### `/public`
Archivos estáticos

## Características Principales

### 1. Sistema de Autenticación
- Implementado con Supabase Auth
- Manejo de sesiones y tokens
- Protección de rutas

### 2. Catálogo de Productos
- Visualización de productos
- Filtrado y búsqueda
- Colecciones y categorías

### 3. Carrito de Compras
- Gestión de productos
- Actualización en tiempo real
- Persistencia de datos

### 4. Proceso de Checkout
- Integración con MercadoPago
- Gestión de pagos
- Confirmación de órdenes

### 5. Internacionalización
- Soporte multiidioma
- Cambio dinámico de idioma
- Contenido localizado

### 6. UI/UX
- Diseño responsive
- Tema claro/oscuro
- Componentes accesibles
- Animaciones y transiciones

## Configuración y Despliegue

### Requisitos
- Node.js
- pnpm (gestor de paquetes)
- Cuenta de Supabase
- Cuenta de MercadoPago

### Scripts Disponibles
- `pnpm dev` - Desarrollo local
- `pnpm build` - Construcción para producción
- `pnpm start` - Iniciar en producción
- `pnpm lint` - Linting del código

## Consideraciones de Seguridad
- Autenticación segura con Supabase
- Protección de rutas sensibles
- Manejo seguro de pagos
- Validación de datos con Zod

## Mejores Prácticas Implementadas
1. Componentes modulares y reutilizables
2. Tipado fuerte con TypeScript
3. Accesibilidad (WCAG)
4. SEO optimizado
5. Rendimiento optimizado
6. Código limpio y mantenible

## Próximos Pasos Recomendados
1. Implementar pruebas unitarias y de integración
2. Mejorar la documentación de componentes
3. Optimizar el rendimiento de imágenes
4. Implementar análisis y métricas
5. Expandir la funcionalidad de búsqueda

## Recursos Adicionales
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de MercadoPago](https://www.mercadopago.com.ar/developers)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs) 