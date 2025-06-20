# Documentación de Funcionalidades Actuales - Account Section

## 1. Estructura de Tabs

### 1.1 Profile Tab
**Funcionalidades:**
- Muestra información básica del usuario:
  - Email (read-only)
  - ID de usuario
  - Última fecha de inicio de sesión
- Formulario de actualización de perfil:
  - Campo de nombre
  - Actualización vía `updateProfileAction`
- Manejo de errores y estados de carga

### 1.2 Orders Tab
**Funcionalidades:**
- Lista completa de órdenes del usuario
- Por cada orden muestra:
  - Número de orden (#id)
  - Fecha de creación (formateada)
  - Estado (badge con status)
  - Lista de items:
    - Nombre del producto
    - Precio individual
  - Total de la orden
- Ordenamiento por fecha (más reciente primero)
- Estado vacío cuando no hay órdenes

### 1.3 Addresses Tab
**Funcionalidades:**
- Lista de direcciones guardadas
- Por cada dirección:
  - Calle y número
  - Ciudad, estado, código postal
  - País
  - Opción de eliminar
  - Opción de marcar como default
- Modal para agregar nueva dirección con:
  - Línea 1 (requerido)
  - Línea 2 (opcional)
  - Ciudad (requerido)
  - Estado (requerido)
  - Código postal (requerido)
  - País (requerido)
- Validaciones de formulario
- Cache de direcciones (10 minutos)
- Invalidación de cache en operaciones CRUD

### 1.4 Admin Tabs (Solo para isAdmin=true)
**Funcionalidades:**

#### Products Tab
- CRUD completo de productos:
  - Crear nuevo producto
  - Actualizar productos existentes
  - Eliminar productos
  - Upload de imágenes
- Campos de producto:
  - Nombre
  - Descripción
  - Precio
  - Categoría
  - Stock
  - Visibilidad
  - Featured status

#### Subscriptions Tab
- Gestión de planes de suscripción:
  - Nombre
  - Descripción
  - Precio mensual/anual
  - Productos incluidos
  - Cantidad máxima de vinos
  - Visibilidad
- Relación N:M con productos
- Actualización de planes existentes

#### Admin Orders Tab
- Dashboard de órdenes:
  - Todas las órdenes del sistema
  - Información de cliente
  - Items y cantidades
  - Totales
  - Estados
- Ordenamiento y filtros

## 2. Server Actions Utilizadas

### 2.1 Auth Actions (`auth-client.ts`)
```typescript
getProfile(userId: string)
getOrders(userId: string)
getAddresses(userId: string)
addAddress(userId: string, address: any)
deleteAddress(id: string)
setDefaultAddress(userId: string, id: string)
```

### 2.2 Product Actions (`products.ts`)
```typescript
createProduct(product: Omit<Product, "id">)
updateProduct(id: string, updates: Partial<Product>)
deleteProduct(id: string)
uploadProductImage(formData: FormData)
```

### 2.3 Subscription Actions (`subscription-plans.ts`)
```typescript
savePlanAction(prevState, formData)
```

### 2.4 Admin Orders Actions (`admin-orders.ts`)
```typescript
getAllOrders()
```

## 3. Integraciones Especiales

### 3.1 Funcionalidades de Vinos
- Categorización por región
- Categorización por varietal
- Sistema de stock
- Featured products
- Visibilidad de productos

### 3.2 Sistema de Suscripciones
- Clubes de vino
- Frecuencia mensual/anual
- Cantidad de vinos por mes
- Estados de suscripción (active, paused, cancelled)

## 4. Estados y Data Management

### 4.1 Estados Locales
```typescript
const [profile, setProfile] = useState<any>(initialProfile)
const [orders, setOrders] = useState<any[]>(initialOrders)
const [addresses, setAddresses] = useState<any[]>(initialAddresses)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### 4.2 Cache y Optimizaciones
- Cache de direcciones (10 minutos)
- Cache de órdenes (2 minutos)
- Invalidación automática en operaciones CRUD
- Revalidación de rutas después de updates

### 4.3 Manejo de Errores
- Toast notifications para errores
- Estados de error por operación
- Fallbacks UI para estados de error

## 5. Seguridad y Permisos

### 5.1 Verificaciones de Auth
- Middleware de protección de rutas
- Verificación de rol admin
- Tokens y sesiones seguras

### 5.2 Validaciones
- Formularios con campos requeridos
- Validación de tipos de datos
- Sanitización de inputs

## 6. Internacionalización

- Soporte completo de traducciones (es/en)
- Formatos de fecha localizados
- Mensajes de error traducidos
- Placeholders traducidos 