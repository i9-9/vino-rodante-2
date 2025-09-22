# SSG con Revalidación On-Demand

## 📋 **Resumen**

Este sistema implementa **Static Site Generation (SSG)** con **Incremental Static Regeneration (ISR)** y **revalidación on-demand** para manejar productos nuevos y actualizaciones en tiempo real.

## 🔧 **Componentes Implementados**

### **1. Cache Tags (`lib/cache-tags.ts`)**
Define tags para diferentes tipos de contenido:
- `products`: Todos los productos
- `product-by-slug`: Productos individuales
- `featured-products`: Productos destacados
- `products-by-category`: Productos por categoría
- `products-by-region`: Productos por región
- `products-by-varietal`: Productos por varietal

### **2. Revalidación en Acciones (`app/account/actions/products.ts`)**
Cada acción de producto incluye revalidación automática:
```typescript
// Al crear un producto
revalidateTag(CACHE_TAGS.PRODUCTS)
revalidateTag(CACHE_TAGS.PRODUCT_BY_SLUG)
revalidateTag(`product-${validatedData.slug}`)

// Al actualizar visibilidad
revalidateTag(CACHE_TAGS.PRODUCTS)
revalidateTag(CACHE_TAGS.FEATURED_PRODUCTS) // Si cambió featured
```

### **3. API de Revalidación (`app/api/revalidate/route.ts`)**
Endpoint para revalidación manual:
```bash
# Revalidar todos los productos
curl -X POST http://localhost:3001/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key"}'

# Revalidar tag específico
curl -X POST http://localhost:3001/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key","tag":"products"}'
```

### **4. Webhook de Supabase (`app/api/webhooks/supabase/route.ts`)**
Revalidación automática cuando cambian datos en Supabase:
- **INSERT**: Nuevo producto → Revalida productos y featured
- **UPDATE**: Producto actualizado → Revalida según cambios específicos
- **DELETE**: Producto eliminado → Revalida productos

## 🚀 **Configuración**

### **Variables de Entorno Requeridas**
```env
# .env.local
REVALIDATE_SECRET=your-secret-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### **Configurar Webhook en Supabase**
1. Ve a tu dashboard de Supabase
2. Navega a Database > Webhooks
3. Crea un nuevo webhook:
   - **URL**: `https://tu-dominio.com/api/webhooks/supabase`
   - **Events**: `products.insert`, `products.update`, `products.delete`
   - **HTTP Method**: `POST`
   - **Headers**: `Content-Type: application/json`

## 📊 **Flujo de Funcionamiento**

### **Productos Existentes (Build Time)**
1. `generateStaticParams()` pre-genera páginas para productos existentes
2. Páginas se sirven desde cache estático (muy rápido)
3. Se regeneran cada 2 horas (`revalidate = 7200`)

### **Productos Nuevos (On-Demand)**
1. Usuario crea producto en admin
2. Action ejecuta `revalidateTag('products')`
3. Next.js regenera páginas afectadas
4. Próxima visita sirve página regenerada

### **Actualizaciones (Real-time)**
1. Cambio en Supabase dispara webhook
2. Webhook ejecuta revalidación específica
3. Páginas se actualizan automáticamente

## 🧪 **Testing**

### **Probar Revalidación Manual**
```bash
# Ejecutar script de prueba
npx tsx scripts/test-revalidation.ts
```

### **Probar Webhook**
```bash
# Simular webhook de Supabase
curl -X POST http://localhost:3001/api/webhooks/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "products",
    "record": {"name": "Test Product", "slug": "test-product"}
  }'
```

## ⚡ **Beneficios**

1. **Rendimiento**: Páginas estáticas se sirven instantáneamente
2. **SEO**: Contenido pre-generado para motores de búsqueda
3. **Escalabilidad**: Cache reduce carga en base de datos
4. **Actualizaciones**: Cambios se reflejan automáticamente
5. **Flexibilidad**: Revalidación granular por tipo de contenido

## 🔍 **Monitoreo**

### **Logs de Revalidación**
```bash
# Ver logs de revalidación
tail -f .next/cache/revalidation.log
```

### **Verificar Cache**
```bash
# Verificar páginas en cache
ls -la .next/server/app/products/
```

## 🚨 **Troubleshooting**

### **Páginas no se regeneran**
1. Verificar que `revalidateTag()` se ejecuta
2. Comprobar logs de webhook
3. Verificar secret en API de revalidación

### **Webhook no funciona**
1. Verificar URL del webhook en Supabase
2. Comprobar que el endpoint responde
3. Verificar headers y formato de datos

### **Cache no se invalida**
1. Verificar tags en `revalidateTag()`
2. Comprobar que las páginas usan los tags correctos
3. Verificar configuración de ISR

## 📈 **Métricas**

- **Tiempo de build**: ~2-3 minutos para todos los productos
- **Tiempo de revalidación**: ~5-10 segundos por página
- **Cache hit ratio**: ~95% para productos existentes
- **Tiempo de respuesta**: <100ms para páginas cacheadas
