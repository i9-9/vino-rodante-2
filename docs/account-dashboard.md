# Dashboard de Cuenta - Estado Actual

## Estructura General
El dashboard de cuenta está implementado como una aplicación Next.js con las siguientes características principales:

- Layout de ancho completo (max-width: 2000px)
- Padding consistente (px-4 sm:px-6 lg:px-8)
- Sistema de pestañas para diferentes secciones
- Diseño responsive

## Secciones Principales

### 1. Perfil
- Muestra información básica del usuario
- Permite editar datos personales
- Formato de fecha estandarizado (DD/MM/YYYY)
- Validación de campos

### 2. Direcciones
- Vista en grid de tarjetas de dirección
- Fondo blanco y sombra para cada tarjeta
- Botones "Editar" y "Establecer como predeterminada"
- Modal para agregar/editar direcciones
- Etiquetas en español
- Botones en color burgundy (#7B1E1E)

### 3. Pedidos
- Lista de pedidos realizados
- Información detallada de cada pedido
- Formato de fecha estandarizado
- Estado del pedido claramente visible

### 4. Panel de Administración
Solo visible para usuarios administradores. Incluye:

#### 4.1 Gestión de Productos
- Vista en grid con imágenes de productos
- Cada tarjeta muestra:
  - Imagen del producto
  - Nombre
  - Descripción
  - Precio
  - Stock
  - Categoría
  - Año
  - Región
  - Varietal
- Indicadores visuales para:
  - Visibilidad (verde/rojo)
  - Destacado (ámbar/gris)
- Modal de edición con:
  - Formulario completo de producto
  - Validación de campos
  - Validación de URLs de imágenes
  - Imagen por defecto (placeholder.svg)

#### 4.2 Gestión de Pedidos
- Vista detallada de todos los pedidos
- Filtros y búsqueda
- Acciones administrativas

#### 4.3 Gestión de Suscripciones
- Administración de planes de suscripción
- Seguimiento de suscriptores

## Sistema de Autenticación
- Integración con Supabase Auth
- Middleware para protección de rutas
- Verificación de roles de administrador
- Manejo de sesiones del lado del servidor

## Mejoras Recientes

### 1. Sistema de Roles
- Migración de `user_roles` a campo `is_admin` en tabla `customers`
- Simplificación de verificación de permisos

### 2. Manejo de Imágenes
- Validación de URLs de imágenes
- Sistema de fallback a imagen por defecto
- Prevención de errores de URL inválida

### 3. UI/UX
- Consistencia en colores y estilos
- Feedback visual para acciones
- Mensajes de error claros
- Diseño responsive mejorado

## Pendientes y Mejoras Futuras

1. Optimización de Rendimiento
   - Implementar caching
   - Mejorar la carga de imágenes
   - Reducir llamadas a la base de datos

2. Funcionalidades Adicionales
   - Exportación de datos
   - Estadísticas y análisis
   - Sistema de notificaciones

3. Mejoras de UX
   - Más filtros y opciones de búsqueda
   - Previsualización de imágenes
   - Drag and drop para ordenar productos

## Tecnologías Utilizadas

- Next.js 14
- Supabase (Auth y Base de datos)
- Tailwind CSS
- Shadcn/ui para componentes
- Server Actions para operaciones del servidor
- Next.js Image para optimización de imágenes 