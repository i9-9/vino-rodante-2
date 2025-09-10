# Arquitectura y Convenciones del Proyecto Vino Rodante

Overview

## 1. Stack Tecnológico

- **Frontend:** Next.js (App Router), React, TypeScript
- **UI:** Componentes personalizados y librerías UI (Dialog, Table, etc.)
- **Backend/DB:** Supabase (PostgreSQL, Storage, Auth)
- **Auth:** Supabase Auth (SSR y browser client)
- **Almacenamiento de imágenes:** Supabase Storage
- **Internacionalización:** Archivos de traducción y provider propio
- **Estilos:** TailwindCSS (o similar, verificar en el proyecto)
- **Despliegue:** Vercel (o similar, verificar en el proyecto)

---

## 2. Estructura de Base de Datos (Tablas principales)

- **products:** Productos de la tienda (vinos)
- **orders:** Órdenes de compra
- **order_items:** Ítems de cada orden
- **customers:** Usuarios registrados (incluye campo `is_admin`)
- **addresses:** Direcciones de usuario
- **subscription_plans:** Planes de suscripción (clubes)
- **subscription_plan_products:** Relación N:M entre planes y productos (con cantidad)
- **user_subscriptions:** Suscripciones activas de usuarios a planes
- **newsletter_subscribers:** Suscriptores al boletín

**Relaciones clave:**
- Un usuario puede tener muchas órdenes y muchas direcciones.
- Un plan de suscripción puede tener muchos productos asociados (y viceversa).
- Un usuario puede tener varias suscripciones activas.

---

## 3. Supabase Auth (SSR y Client)

- **Nunca** usar métodos individuales de cookies (`get`, `set`, `remove`).
- **Siempre** usar `getAll` y `setAll` para manejo de cookies en SSR.
- **Nunca** importar desde `@supabase/auth-helpers-nextjs`.
- **Siempre** importar desde `@supabase/ssr`.
- Implementación recomendada para browser y server client en `/lib/supabase/client.ts` y `/lib/supabase/server.ts`.
- El campo `is_admin` en la tabla `customers` determina el acceso a funcionalidades de administración.

---

## 4. CRUD de Productos y Suscripciones (Admin)

- El dashboard `/account` muestra pestañas según el rol (`is_admin`).
- **Productos:** CRUD completo (crear, editar, eliminar, subir imagen a Storage).
- **Suscripciones:** CRUD completo (crear, editar, eliminar, subir imagen a Storage).
  - Modal para editar/crear plan (nombre, descripción, precios, imagen, visibilidad).
  - Modal para asociar productos a cada plan (agregar/quitar productos, editar cantidad).
- **Órdenes:** Los admin pueden ver todas las órdenes, los usuarios solo las propias.
- **Validaciones:** Los formularios deben validar campos obligatorios y tipos de datos antes de enviar.

---

## 5. Subida de Imágenes

- Las imágenes de productos van a `product-images` en Supabase Storage.
- Las imágenes de planes de suscripción van a `subscription-plans` en Supabase Storage.
- Se obtiene la URL pública tras la subida y se guarda en la base de datos.
- El nombre del archivo debe ser único (ej: `${slug}-${Date.now()}.ext`).

---

## 6. Internacionalización

- Archivos de traducción en `/lib/i18n/es.ts` y `/lib/i18n/en.ts`.
- Los textos deben estar en español argentino por defecto, salvo nombres propios o marcas.
- El dashboard y el frontend usan el provider de traducciones.
- Los textos de UI y validaciones deben ser traducibles.

---

## 7. Políticas de Seguridad (RLS)

- Las tablas sensibles tienen Row Level Security activado.
- Los admin pueden ver y editar todo; los usuarios solo sus propios datos.
- Revisar y mantener actualizadas las policies en Supabase.
- Las mutaciones (insert/update/delete) deben ser validadas por el backend y respetar el usuario autenticado.

---

## 8. Convenciones de Código

- Usar componentes reutilizables para formularios, tablas y modales.
- Mantener la lógica de subida de imágenes y CRUD en archivos de acciones (`/app/account/actions/`).
- Los formularios usan `FormData` y handlers asíncronos.
- Los modales usan el componente `Dialog` para edición y creación.
- Los hooks de React deben usarse correctamente para side effects y estado.
- El tipado debe ser estricto (TypeScript) y reflejar la estructura real de la base de datos.
- Los imports de Supabase deben ser siempre desde `/lib/supabase/client` o `/lib/supabase/server`.

---

## 9. Extensibilidad

- El sistema está preparado para agregar más tipos de suscripciones, productos y funcionalidades admin.
- La relación N:M entre planes y productos permite flexibilidad en la composición de cada club.
- El sistema de órdenes y suscripciones puede escalar a nuevos tipos de membresía o productos digitales.
- El sistema de roles puede ampliarse fácilmente agregando campos o tablas de permisos.

---

## 10. Notas adicionales

- El código está preparado para SSR y SSG de Next.js.
- El frontend está pensado para ser mobile-first y accesible.
- El sistema de roles se basa en el campo `is_admin` de la tabla `customers`.
- El código debe ser limpio, comentado y seguir las mejores prácticas de React y Next.js.
- Los cambios en la arquitectura o reglas deben reflejarse en este archivo y comunicarse al equipo.

---

## 11. Buenas prácticas y advertencias

- **No** modificar la lógica de autenticación sin revisar las reglas de este archivo.
- **No** cambiar la estructura de la base de datos sin actualizar los tipos y las policies.
- **No** usar endpoints o helpers de Supabase que estén marcados como deprecated.
- **No** dejar lógica de negocio importante solo en el frontend; siempre validar en el backend.
- **No** dejar datos sensibles expuestos en el frontend o en el storage público.

---

> **Actualizado a junio 2024. Si agregas nuevas features, actualiza este archivo para mantener el contexto claro para futuros desarrolladores.** 

---
description: NextJS 15 Supabase ecommerce de vinos con suscripciones - Proyecto Vino Rodante Argentina - Reglas y mejores prácticas 2025
globs: ["*.ts", "*.tsx", "*.js", "*.jsx", "middleware.ts", "lib/supabase/**/*", "app/**/*", "components/**/*"]
alwaysApply: false
---

Detalle

# NextJS 15 Supabase - Proyecto Vino Rodante Argentina

Eres un experto en NextJS 15, Supabase SSR (@supabase/ssr), TypeScript, React 19, y aplicaciones ecommerce de vinos con suscripciones para Argentina. Te especializas en debugging de estados de carga infinita, gestión de suscripciones, integración con Mercado Pago, y optimización de rendimiento siguiendo ÚNICAMENTE las mejores prácticas oficiales para el mercado argentino.

## 🚨 REQUERIMIENTOS CRÍTICOS DE MIGRACIÓN (Verificados 2025)

### 1. INMEDIATO: Remover Paquete Auth Helpers Deprecado
El paquete @supabase/auth-helpers-nextjs está oficialmente deprecado desde 2024

```bash
# Remover paquete deprecado (CRÍTICO)
pnpm remove @supabase/auth-helpers-nextjs

# Instalar paquetes actuales
pnpm add @supabase/ssr@latest @supabase/supabase-js@latest
```

### 2. Cambios Breaking de APIs Async en NextJS 15 (Verificado)
En NextJS 15, cookies(), headers(), y params ahora son async y DEBEN ser await

**Crítico**: Esto afecta TODO el código server-side que usa cookies() en NextJS 15+

## Configuración Oficial de Cliente Supabase (NextJS 15 Compatible - Verificado)

### Cliente Servidor para Vino Rodante
```typescript
// lib/supabase/server.ts - NextJS 15 Compatible (ARREGLO CRÍTICO)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies() // REQUERIDO en NextJS 15+
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component - las cookies no se pueden setear aquí
            // El middleware manejará el refresh de sesión
          }
        },
      },
    }
  )
}

// lib/supabase/client.ts - Cliente Browser (Sin cambios necesarios)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## Esquema de Base de Datos para Vino Rodante

### Tablas Principales (Existentes)
```sql
-- Productos de vinos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  stock_quantity INT DEFAULT 0,
  category TEXT,
  vintage_year INT,
  region TEXT,
  alcohol_content DECIMAL(3,1),
  volume_ml INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes (usuarios con campo is_admin)
CREATE TABLE customers (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false, -- Campo clave para permisos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direcciones de usuarios
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Argentina',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planes de suscripción (clubes de vino)
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2),
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  max_wines_per_month INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación N:M entre planes y productos
CREATE TABLE subscription_plan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, product_id)
);

-- Suscripciones activas de usuarios
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  next_billing_date TIMESTAMPTZ,
  billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'yearly')) DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Órdenes de compra
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  shipping_address_id UUID REFERENCES addresses(id),
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de cada orden
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suscriptores al boletín
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Índices esenciales para rendimiento
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_user_subscriptions_customer ON user_subscriptions(customer_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
```

## Políticas RLS para Vino Rodante

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para customers
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON customers
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON customers
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Los admin pueden ver todos los clientes" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

-- Políticas para productos (públicos para ver, solo admin para modificar)
CREATE POLICY "Todos pueden ver productos activos" ON products
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Solo admin pueden gestionar productos" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

-- Políticas para planes de suscripción
CREATE POLICY "Todos pueden ver planes visibles" ON subscription_plans
  FOR SELECT TO authenticated, anon
  USING (is_visible = true);

CREATE POLICY "Solo admin pueden gestionar planes" ON subscription_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

-- Políticas para órdenes (usuarios ven las suyas, admin ve todas)
CREATE POLICY "Los usuarios pueden ver sus propias órdenes" ON orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = customer_id);

CREATE POLICY "Los admin pueden ver todas las órdenes" ON orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

-- Políticas para suscripciones de usuarios
CREATE POLICY "Los usuarios pueden ver sus propias suscripciones" ON user_subscriptions
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = customer_id);

CREATE POLICY "Los admin pueden ver todas las suscripciones" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );
```

## Gestión de Archivos e Imágenes en Supabase Storage

### Buckets de Storage para Vino Rodante
```sql
-- Crear buckets en Supabase Storage
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('subscription-plans', 'subscription-plans', true);

-- Políticas para subida de imágenes (solo admin)
CREATE POLICY "Solo admin pueden subir imágenes de productos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

CREATE POLICY "Solo admin pueden subir imágenes de planes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'subscription-plans' AND
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

-- Todos pueden ver las imágenes públicas
CREATE POLICY "Todos pueden ver imágenes públicas" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id IN ('product-images', 'subscription-plans'));
```

## Acciones para CRUD de Admin

### Gestión de Productos
```typescript
// app/account/actions/products.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  // Verificar que el usuario es admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!customer?.is_admin) {
    throw new Error('Acceso denegado: Se requieren permisos de administrador')
  }
  
  const productData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    stock_quantity: parseInt(formData.get('stock_quantity') as string),
    category: formData.get('category') as string,
    vintage_year: parseInt(formData.get('vintage_year') as string),
    region: formData.get('region') as string,
    alcohol_content: parseFloat(formData.get('alcohol_content') as string),
    volume_ml: parseInt(formData.get('volume_ml') as string),
  }
  
  // Subir imagen si existe
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const fileName = `${productData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${imageFile.name.split('.').pop()}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)
    
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadData.path)
    
    productData.image_url = publicUrl
  }
  
  const { error } = await supabase
    .from('products')
    .insert(productData)
  
  if (error) throw error
  
  revalidatePath('/account')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  
  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!customer?.is_admin) {
    throw new Error('Acceso denegado: Se requieren permisos de administrador')
  }
  
  const productData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    stock_quantity: parseInt(formData.get('stock_quantity') as string),
    category: formData.get('category') as string,
    vintage_year: parseInt(formData.get('vintage_year') as string),
    region: formData.get('region') as string,
    alcohol_content: parseFloat(formData.get('alcohol_content') as string),
    volume_ml: parseInt(formData.get('volume_ml') as string),
    updated_at: new Date().toISOString()
  }
  
  // Manejar nueva imagen si existe
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const fileName = `${productData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${imageFile.name.split('.').pop()}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)
    
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadData.path)
    
    productData.image_url = publicUrl
  }
  
  const { error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/account')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  
  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: customer } = await supabase
    .from('customers')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!customer?.is_admin) {
    throw new Error('Acceso denegado: Se requieren permisos de administrador')
  }
  
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/account')
  return { success: true }
}
```

## Componentes de UI para Dashboard Admin

### Modal de Producto
```typescript
// components/admin/ProductModal.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { createProduct, updateProduct } from '@/app/account/actions/products'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Crear Producto'}
          </DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Nombre del Vino *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={product?.name || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description || ''}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium">
                Precio (ARS) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                defaultValue={product?.price || ''}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            
            <div>
              <label htmlFor="stock_quantity" className="block text-sm font-medium">
                Stock
              </label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                defaultValue={product?.stock_quantity || 0}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="vintage_year" className="block text-sm font-medium">
                Cosecha
              </label>
              <input
                type="number"
                id="vintage_year"
                name="vintage_year"
                defaultValue={product?.vintage_year || new Date().getFullYear()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            
            <div>
              <label htmlFor="alcohol_content" className="block text-sm font-medium">
                Graduación (%)
              </label>
              <input
                type="number"
                id="alcohol_content"
                name="alcohol_content"
                step="0.1"
                defaultValue={product?.alcohol_content || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="region" className="block text-sm font-medium">
              Región
            </label>
            <input
              type="text"
              id="region"
              name="region"
              defaultValue={product?.region || ''}
              placeholder="ej: Mendoza, Salta"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product?.category || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Seleccionar categoría</option>
              <option value="tinto">Tinto</option>
              <option value="blanco">Blanco</option>
              <option value="rosado">Rosado</option>
              <option value="espumante">Espumante</option>
              <option value="dulce">Dulce</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium">
              Imagen del Producto
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className="mt-1 block w-full"
            />
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="mt-2 h-20 w-20 object-cover rounded"
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Middleware de Configuración (NextJS 15 Verificado)

```typescript
// middleware.ts - Actualizado para NextJS 15
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Crear un objeto response para modificar
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // CRÍTICO: Esto refresca la sesión del usuario
  const { data: { user } } = await supabase.auth.getUser()

  // Proteger rutas de admin
  if (request.nextUrl.pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Ser específico para evitar problemas de rendimiento
    '/account/:path*',
    '/admin/:path*',
    // Excluir archivos estáticos y API routes que no necesitan auth
    '/((?!_next/static|_next/image|favicon.ico|api/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Optimizaciones de Rendimiento (Mejores Prácticas Verificadas)

```typescript
// Forzar renderizado dinámico para páginas que dependen de auth
export const dynamic = 'force-dynamic'

// O deshabilitar caché de fetch para rutas específicas
export const fetchCache = 'force-no-store'

// O setear tiempo de revalidación (en segundos)
export const revalidate = 0

// Para Server Actions - llamar cookies() primero para optar out del caché
'use server'
export async function someServerAction() {
  await cookies() // Esto opta out del caché de NextJS
  const supabase = await createClient()
  
  // Ahora es seguro obtener datos específicos del usuario
  const { data } = await supabase.from('user_data').select('*')
  return data
}
```

## Estructura de Archivos para Vino Rodante

```
lib/supabase/
├── client.ts          # Cliente browser
├── server.ts          # Cliente servidor (async)
└── types.ts           # Tipos de DB específicos del proyecto

app/
├── (auth)/           # Rutas de auth
│   ├── login/
│   └── register/
├── account/          # Dashboard protegido
│   ├── actions/      # Server actions para CRUD
│   ├── components/   # Componentes específicos del dashboard
│   └── page.tsx      # Dashboard principal con tabs admin
├── productos/        # Catálogo público de vinos
├── suscripciones/    # Planes de club de vinos
└── api/
    └── webhook/      # Para integraciones futuras con pagos

components/
├── ui/               # Componentes base (Dialog, Table, etc.)
├── admin/            # Componentes específicos de admin
│   ├── ProductModal.tsx
│   ├── SubscriptionModal.tsx
│   ├── ProductsTable.tsx
│   └── OrdersTable.tsx
├── wine/             # Componentes específicos de vinos
│   ├── WineCard.tsx
│   ├── WineDetails.tsx
│   └── WineFilters.tsx
└── subscription/     # Componentes de suscripciones
    ├── PlanCard.tsx
    ├── PlanComparison.tsx
    └── SubscriptionStatus.tsx

lib/i18n/
├── es.ts             # Traducciones español (principal)
└── en.ts             # Traducciones inglés
```

## Notas de Seguridad Críticas para Vino Rodante (Actualizadas 2025)

⚠️ NUNCA confiar en getSession() en código server - SOLO usar getUser() por seguridad
⚠️ TODA validación de auth server-side DEBE usar getUser() que valida tokens server-side
⚠️ Siempre validar el campo is_admin en customers antes de permitir operaciones de admin
⚠️ Las políticas RLS deben verificar is_admin para operaciones administrativas
⚠️ Validar permisos tanto en frontend como backend para operaciones sensibles
⚠️ Nunca exponer datos sensibles en componentes client-side
⚠️ Implementar validación CSRF para todos los formularios de auth y admin
⚠️ Usar configuraciones de cookies seguras (httpOnly, secure, sameSite) para manejo de sesiones
⚠️ Validar todas las entradas del usuario en server-side, nunca confiar en datos del cliente
⚠️ Usar queries parametrizadas y métodos ORM para prevenir inyección SQL
⚠️ Nunca loggear información sensible como passwords, tokens, o datos de pago
⚠️ Implementar manejo de errores que no exponga internals del sistema
⚠️ Usar HTTPS en todos lados e implementar configuración TLS apropiada
⚠️ Las imágenes en Storage público deben ser optimizadas y sin metadatos sensibles

## Checklist de Debug de Problemas de Carga para Vino Rodante

Cuando debuggees problemas de carga relacionados con el proyecto, siempre verifica:
1. Tab Network del browser para requests colgados de Supabase
2. Dashboard de Supabase para queries lentas en tablas del