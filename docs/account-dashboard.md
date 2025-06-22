# Dashboard de Cuenta

## Estructura General

El dashboard de cuenta está organizado en la siguiente estructura de archivos:

```
/app/account/
├── page.tsx                    # Página principal del dashboard (Server Component)
├── AccountClientNew.tsx        # Componente cliente principal
├── actions/                    # Server Actions
│   ├── auth-client.ts         # Acciones de autenticación
│   ├── orders.ts              # Acciones de pedidos
│   ├── products.ts            # Acciones de productos (admin)
│   ├── subscriptions.ts       # Acciones de suscripciones
│   └── addresses.ts           # Acciones de direcciones
├── components/                 # Componentes de las tabs
│   ├── ProfileTab.tsx         # Tab de perfil
│   ├── OrdersTab.tsx          # Tab de pedidos
│   ├── AddressesTab.tsx       # Tab de direcciones
│   └── SubscriptionsTab.tsx   # Tab de suscripciones
└── types.ts                   # Tipos compartidos

```

## Flujo de Datos

1. `page.tsx` (Server Component)
   - Verifica la autenticación del usuario
   - Obtiene los datos iniciales (perfil, pedidos, direcciones, suscripciones)
   - Transforma los datos al formato correcto
   - Renderiza `AccountClientNew` con los datos

2. `AccountClientNew.tsx` (Client Component)
   - Maneja el estado del cliente
   - Gestiona la navegación entre tabs
   - Distribuye los datos a los componentes de cada tab

## Tabs Disponibles

### 1. Perfil (ProfileTab)
- Muestra información básica del usuario:
  - Nombre
  - Email
  - Fecha de registro
- Permite editar información básica del perfil

### 2. Pedidos (OrdersTab)
- Lista todos los pedidos del usuario
- Por cada pedido muestra:
  - Número de pedido
  - Fecha
  - Estado del pedido
  - Información del cliente
  - Lista de productos
    - Imagen
    - Nombre
    - Varietal y año
    - Región
    - Precio y cantidad
  - Total del pedido

### 3. Direcciones (AddressesTab)
- Gestiona las direcciones del usuario
- Funcionalidades:
  - Listar direcciones
  - Agregar nueva dirección
  - Editar dirección existente
  - Eliminar dirección
  - Marcar dirección como predeterminada

### 4. Suscripciones (SubscriptionsTab)
- Muestra las suscripciones activas del usuario
- Por cada suscripción:
  - Estado (activa, pausada, cancelada)
  - Detalles del plan
    - Nombre y descripción
    - Imagen
    - Club (tinto, blanco, mixto, naranjo)
    - Precios (mensual, bimestral, trimestral)
    - Características
  - Fechas importantes
    - Inicio
    - Próxima renovación
  - Indicador si es regalo

### 5. Panel de Administración
Solo visible para usuarios con rol de admin:

#### 5.1 Pedidos (AdminOrdersTab)
- Lista todos los pedidos de la plataforma
- Funcionalidades:
  - Ver detalles completos
  - Actualizar estado
  - Filtrar por estado
  - Buscar por ID o cliente

#### 5.2 Productos (AdminProductsTab)
- Gestión completa de productos
- Funcionalidades:
  - Listar productos
  - Agregar nuevo producto
  - Editar producto existente
  - Cambiar visibilidad
  - Actualizar stock

#### 5.3 Suscripciones (AdminSubscriptionsTab)
- Gestión de planes de suscripción
- Funcionalidades:
  - Listar planes
  - Crear nuevo plan
  - Editar plan existente
  - Activar/desactivar planes

## Server Actions

### auth-client.ts
- getProfile: Obtiene perfil del usuario
- updateProfile: Actualiza datos del perfil
- getOrders: Obtiene pedidos del usuario
- getAddresses: Obtiene direcciones del usuario

### orders.ts
- getOrdersByUser: Obtiene pedidos de un usuario específico
- getAllOrders: Obtiene todos los pedidos (admin)
- updateOrderStatus: Actualiza estado de un pedido
- getOrderDetails: Obtiene detalles completos de un pedido

### subscriptions.ts
- getUserSubscriptions: Obtiene suscripciones del usuario
- addSubscription: Agrega nueva suscripción (admin)
- updateSubscription: Actualiza suscripción existente (admin)
- deleteSubscription: Elimina suscripción (admin)

### addresses.ts
- addAddress: Agrega nueva dirección
- updateAddress: Actualiza dirección existente
- deleteAddress: Elimina dirección
- setDefaultAddress: Marca dirección como predeterminada

## Tipos Principales

### Order
```typescript
interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  created_at: string
  customer?: Customer
  order_items: OrderItem[]
}
```

### Customer
```typescript
interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}
```

### Subscription
```typescript
interface UserSubscription {
  id: string
  customer_id: string
  plan_id: string
  start_date: string
  end_date: string | null
  current_period_end: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  is_gift: boolean
  subscription_plan?: SubscriptionPlan
}
```

## Seguridad y Autorización

1. Protección de Rutas
   - Verificación de sesión en middleware
   - Redirección a /auth/sign-in si no hay sesión

2. Autorización en Server Actions
   - Verificación de usuario autenticado
   - Verificación de propiedad de recursos
   - Verificación de rol admin para acciones administrativas

3. Validación de Datos
   - Validación en el cliente con React Hook Form
   - Validación en el servidor antes de operaciones de DB
   - Manejo de errores y feedback al usuario

## Mejores Prácticas Implementadas

1. Separación de Responsabilidades
   - Server Components para datos iniciales
   - Client Components para interactividad
   - Server Actions para mutaciones

2. Optimización de Rendimiento
   - Carga paralela de datos
   - Revalidación selectiva de paths
   - Uso de cache cuando apropiado

3. Experiencia de Usuario
   - Feedback inmediato en acciones
   - Estados de carga y error
   - Validación en tiempo real
   - Diseño responsive

4. Mantenibilidad
   - Tipos TypeScript estrictos
   - Componentes modulares
   - Acciones reutilizables
   - Traducciones centralizadas 