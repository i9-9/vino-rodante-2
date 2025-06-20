# Especificaciones Técnicas - Dashboard Vino Rodante

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Implementación de Componentes](#implementación-de-componentes)
4. [Server Actions](#server-actions)
5. [Seguridad y Validación](#seguridad-y-validación)
6. [UI/UX Guidelines](#uiux-guidelines)
7. [Optimización y Performance](#optimización-y-performance)

## Arquitectura General

### Stack Tecnológico
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (Auth + Database)
- **Estilos**: Tailwind CSS + Shadcn/ui
- **Lenguaje**: TypeScript
- **Estado**: Server Components + Server Actions
- **Autenticación**: Supabase Auth

### Estructura de Directorios
```
/app/account/
├── page.tsx                    # Dashboard principal
├── layout.tsx                  # Layout común
├── types.ts                    # Tipos TypeScript
├── actions/                    # Server Actions
│   ├── profile.ts
│   ├── addresses.ts
│   ├── orders.ts
│   ├── products.ts
│   └── subscriptions.ts
└── components/                 # Componentes React
    ├── ProfileTab/
    │   ├── index.tsx
    │   └── ProfileForm.tsx
    ├── AddressesTab/
    │   ├── index.tsx
    │   ├── AddressCard.tsx
    │   └── AddressForm.tsx
    ├── OrdersTab/
    │   ├── index.tsx
    │   ├── OrderList.tsx
    │   └── OrderDetails.tsx
    └── admin/
        ├── ProductsTab/
        │   ├── index.tsx
        │   ├── ProductGrid.tsx
        │   └── ProductForm.tsx
        ├── OrdersTab/
        │   ├── index.tsx
        │   └── AdminOrderList.tsx
        └── SubscriptionsTab/
            ├── index.tsx
            ├── PlanList.tsx
            └── PlanForm.tsx
```

## Estructura de Base de Datos

### Tablas y Relaciones

#### customers
\`\`\`sql
create table customers (
  id uuid references auth.users primary key,
  name text,
  email text unique,
  created_at timestamptz default now(),
  is_admin boolean default false
);
\`\`\`

#### products
\`\`\`sql
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  image text,
  category text,
  year text,
  region text,
  varietal text,
  stock int4 default 0 check (stock >= 0),
  featured boolean default false,
  is_visible boolean default true,
  created_at timestamptz default now(),
  customer_id uuid references customers(id)
);
\`\`\`

#### orders
\`\`\`sql
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references customers(id),
  total numeric not null check (total >= 0),
  status text check (status in ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')),
  created_at timestamptz default now()
);
\`\`\`

#### order_items
\`\`\`sql
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  quantity int4 not null check (quantity > 0),
  price numeric not null check (price >= 0)
);
\`\`\`

#### addresses
\`\`\`sql
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);
\`\`\`

## Implementación de Componentes

### ProfileTab

#### Funcionalidades
- Mostrar datos del usuario
- Formulario de edición
- Validación en tiempo real
- Feedback visual

#### Ejemplo de Implementación
\`\`\`typescript
// ProfileTab/index.tsx
export default function ProfileTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Perfil</h2>
      </div>
      <ProfileForm />
    </div>
  )
}

// ProfileForm.tsx
export default function ProfileForm() {
  return (
    <form action={updateProfile} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      <Button type="submit" className="bg-[#7B1E1E] hover:bg-[#5E1717] text-white">
        Guardar cambios
      </Button>
    </form>
  )
}
\`\`\`

### AddressesTab

#### Funcionalidades
- Grid de direcciones
- Modal de edición
- Establecer predeterminada
- Validación de campos

#### Ejemplo de Implementación
\`\`\`typescript
// AddressCard.tsx
export default function AddressCard({ address }: { address: Address }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p>{address.city}, {address.state}</p>
          <p>{address.postal_code}</p>
          <p>{address.country}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          {!address.is_default && (
            <Button 
              className="bg-[#7B1E1E]" 
              onClick={() => setDefaultAddress(address.id)}
            >
              Establecer como predeterminada
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
\`\`\`

## Server Actions

### Implementación Segura de Updates

#### Ejemplo: Actualización Parcial de Producto
\`\`\`typescript
// actions/products.ts
export async function updateProduct(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Extraer y validar datos
  const updates: Partial<Product> = {}
  
  const name = formData.get('name')?.toString().trim()
  if (name) updates.name = name
  
  const price = formData.get('price')?.toString()
  if (price && !isNaN(Number(price))) {
    const numPrice = Number(price)
    if (numPrice >= 0) updates.price = numPrice
  }
  
  const stock = formData.get('stock')?.toString()
  if (stock && !isNaN(Number(stock))) {
    const numStock = Number(stock)
    if (numStock >= 0) updates.stock = numStock
  }
  
  // 2. Validar que hay cambios
  if (Object.keys(updates).length === 0) {
    return { error: 'No hay cambios para guardar' }
  }
  
  // 3. Actualizar solo campos modificados
  try {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', formData.get('id'))
    
    if (error) throw error
    
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    return { error: 'Error al actualizar producto' }
  }
}
\`\`\`

## Seguridad y Validación

### Middleware de Autenticación
\`\`\`typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Proteger rutas /account
  if (!session && req.nextUrl.pathname.startsWith('/account')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}
\`\`\`

### Validación de Datos
\`\`\`typescript
// utils/validation.ts
export const validateProduct = (data: Partial<Product>) => {
  const errors: Record<string, string> = {}
  
  if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
    errors.price = 'El precio debe ser un número positivo'
  }
  
  if (data.stock !== undefined && (isNaN(data.stock) || data.stock < 0)) {
    errors.stock = 'El stock debe ser un número positivo'
  }
  
  if (data.image && !isValidUrl(data.image)) {
    errors.image = 'URL de imagen inválida'
  }
  
  return errors
}
\`\`\`

## UI/UX Guidelines

### Colores
- **Principal**: Burgundy (#7B1E1E)
- **Hover**: Dark Burgundy (#5E1717)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Amber (#F59E0B)

### Componentes Comunes
- Botones con estado de carga
- Modales de confirmación
- Toast notifications
- Skeletons para carga

### Responsive Design
- Mobile First
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## Optimización y Performance

### Estrategias de Caching
- Revalidación por demanda
- Optimistic updates
- Server-side caching

### Lazy Loading
- Imágenes con Next/Image
- Componentes dinámicos
- Paginación de listas largas

### Monitoreo
- Error boundaries
- Logging de errores
- Analytics de uso

## Consideraciones de Implementación

1. **Updates Parciales**
   - Validar campos individualmente
   - Solo actualizar campos modificados
   - Mantener datos existentes

2. **Manejo de Errores**
   - Try-catch en todas las operaciones
   - Mensajes de error claros
   - Rollback cuando sea necesario

3. **Seguridad**
   - Validación en servidor
   - Sanitización de inputs
   - Control de acceso por rol

4. **Testing**
   - Unit tests para validaciones
   - Integration tests para flujos críticos
   - E2E tests para flujos principales 