# Implementación de Boxes de Vinos

## Descripción
Los "Boxes" son una nueva categoría de productos que agrupan múltiples vinos individuales en un solo paquete. Cada box puede contener entre 2 y 6 vinos, con la opción de aplicar descuentos.

## Características Principales
- **Categoría**: Nueva categoría "Boxes" en el sistema
- **Flexibilidad**: 2, 3, 4 o 6 vinos por box
- **Descuentos**: Porcentaje de descuento configurable
- **Gestión**: CRUD completo para admins
- **Relaciones**: Tabla separada para manejar productos dentro de cada box

## Archivos Creados/Modificados

### 1. Tipos y Schemas
- `app/account/types/box.ts` - Schemas Zod y tipos TypeScript para boxes
- `app/account/types/product.ts` - Agregada categoría "Boxes"

### 2. Componentes
- `app/account/components/BoxForm.tsx` - Formulario específico para crear/editar boxes
- `app/account/components/CreateProductForm.tsx` - Modificado para detectar categoría "Boxes"

### 3. Server Actions
- `app/account/actions/boxes.ts` - CRUD completo para boxes

### 4. Base de Datos
- `scripts/create-box-tables.sql` - Script SQL para crear tabla de relaciones

## Estructura de Base de Datos

### Tabla Principal: `products`
Los boxes se almacenan en la tabla `products` existente con:
- `category = 'Boxes'`
- `year = 'N/A'`
- `region = 'Múltiples'`
- `varietal = 'Múltiples'`

### Nueva Tabla: `box_product_relations`
```sql
CREATE TABLE box_product_relations (
    id UUID PRIMARY KEY,
    box_id UUID REFERENCES products(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE
);
```

## Funcionalidades Implementadas

### 1. Crear Box
- Nombre y descripción del box
- Precio total del box
- Cantidad de vinos (2, 3, 4, o 6)
- Porcentaje de descuento
- Selección de vinos individuales
- Imagen del box
- Configuración de visibilidad y destacado

### 2. Editar Box
- Modificar todos los campos del box
- Agregar/quitar vinos
- Cambiar cantidades
- Actualizar imagen

### 3. Eliminar Box
- Eliminación en cascada de relaciones
- Limpieza automática de datos

### 4. Visualización
- Lista de boxes disponibles
- Detalles completos de cada box
- Productos incluidos en cada box

## Instrucciones de Implementación

### Paso 1: Ejecutar Script SQL
```bash
# Conectar a tu base de datos Supabase y ejecutar:
psql -h [HOST] -U [USER] -d [DATABASE] -f scripts/create-box-tables.sql
```

### Paso 2: Verificar Archivos
Asegúrate de que todos los archivos estén en su lugar:
- ✅ `app/account/types/box.ts`
- ✅ `app/account/components/BoxForm.tsx`
- ✅ `app/account/actions/boxes.ts`
- ✅ `scripts/create-box-tables.sql`

### Paso 3: Probar Funcionalidad
1. Ir al dashboard de admin
2. Crear nuevo producto
3. Seleccionar categoría "Boxes"
4. Completar formulario de box
5. Verificar que se cree correctamente

## Uso del Sistema

### Para Admins
1. **Crear Box**: 
   - Seleccionar "Crear Producto" → Categoría "Boxes"
   - Completar información del box
   - Seleccionar vinos individuales
   - Configurar precios y descuentos

2. **Editar Box**:
   - Modificar información existente
   - Agregar/quitar vinos
   - Actualizar precios

3. **Eliminar Box**:
   - Eliminación completa con limpieza de relaciones

### Para Usuarios
- Los boxes aparecen como productos normales
- Se pueden agregar al carrito
- Se procesan en checkout como productos individuales
- Se muestran en listas de productos

## Consideraciones Técnicas

### Seguridad
- Solo admins pueden crear/editar/eliminar boxes
- RLS policies implementadas en `box_product_relations`
- Validación de datos con Zod schemas

### Rendimiento
- Índices en `box_id` y `product_id`
- Consultas optimizadas con JOINs
- Funciones SQL para cálculos complejos

### Escalabilidad
- Estructura flexible para diferentes tamaños de box
- Relaciones normalizadas
- Fácil extensión para nuevas funcionalidades

## Próximos Pasos Sugeridos

### 1. Frontend Público
- Mostrar boxes en la tienda principal
- Página dedicada para boxes
- Filtros por tipo de box

### 2. Carrito y Checkout
- Manejo especial de boxes en el carrito
- Cálculo de descuentos automático
- Validación de stock para boxes

### 3. Analytics
- Tracking de ventas de boxes
- Métricas de popularidad
- Análisis de combinaciones exitosas

### 4. Personalización
- Boxes personalizables por el usuario
- Recomendaciones de vinos para boxes
- Boxes temáticos por ocasión

## Troubleshooting

### Problemas Comunes

1. **Error al crear box**: Verificar permisos de admin
2. **Productos no aparecen**: Verificar que estén visibles y no sean boxes
3. **Error de validación**: Revisar que todos los campos requeridos estén completos
4. **Problemas de imagen**: Verificar permisos de storage

### Logs y Debugging
- Revisar console del navegador
- Verificar logs del servidor
- Comprobar permisos de base de datos
e
## Soporte
Para problemas o preguntas sobre la implementación, revisar:
1. Logs de la aplicación
2. Permisos de usuario en Supabase
3. Estructura de base de datos
4. Validaciones de formulario

## Configuración de Emails

El sistema utiliza **Resend** para el envío de emails con las siguientes configuraciones:

### Variables de Entorno Requeridas
```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=Vino Rodante <info@vinorodante.com>
EMAIL_ADMIN=admin@vinorodante.com
```

### Configuraciones de Seguridad
- **SPF**: Incluye `resend.net` para evitar spam
- **DKIM**: Activo con `resend._domainkey.mail`
- **Dominio verificado**: `vinorodante.com`

### Casos de Uso
- Confirmación de pagos aprobados
- Notificaciones de cambio de estado de órdenes
- Emails a administradores
- Notificaciones de boxes creados/actualizados
