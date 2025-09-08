# 🖼️ Optimización de Banners de Suscripciones

## Resumen de Mejoras

Se implementaron optimizaciones completas para mostrar los banners de suscripciones en alta calidad, mejorando significativamente la experiencia visual del usuario.

## 🚀 Características Implementadas

### 1. Componente BannerImage Optimizado
- **Ubicación:** `components/ui/banner-image.tsx`
- **Características:**
  - Calidad máxima (quality=100)
  - Carga progresiva con skeleton
  - Manejo de errores con fallback
  - Overlay gradient opcional
  - Optimización de rendimiento

### 2. Función de Subida Mejorada
- **Ubicación:** `app/account/actions/subscriptions.ts`
- **Mejoras:**
  - Límite de 50MB para banners (vs 20MB para imágenes principales)
  - Cache de 1 año para banners (vs 1 hora para main)
  - Prefijo "banner-" en nombres de archivo
  - Validación específica por tipo de imagen

### 3. Configuración Next.js Optimizada
- **Ubicación:** `next.config.mjs`
- **Optimizaciones:**
  - Formatos modernos: WebP y AVIF
  - Device sizes optimizados hasta 4K
  - Límite de server actions aumentado a 50MB
  - Cache TTL optimizado

### 4. Componente SubscriptionBanner
- **Especializado para banners de suscripciones**
- **Características:**
  - Altura configurable (default: 70vh)
  - Overlay gradient automático
  - Fallback a imagen de club
  - Optimización de carga

## 📊 Especificaciones Técnicas

### Límites de Archivo
- **Banners:** 50MB máximo
- **Imágenes principales:** 20MB máximo
- **Formatos:** JPG, PNG, WebP

### Calidad de Imagen
- **Quality:** 100 (máxima calidad)
- **Priority:** true (carga prioritaria)
- **Sizes:** "100vw" (responsive completo)

### Cache y Performance
- **Banners:** 1 año de cache
- **Main images:** 1 hora de cache
- **Formats:** WebP, AVIF automático
- **Device sizes:** 640px a 3840px

## 🎯 Uso en el Dashboard

### Para Administradores
1. Ve a `/account` (pestaña Admin)
2. Selecciona "Gestión de Clubes/Plans"
3. Edita un plan existente o crea uno nuevo
4. En la sección "Banner (opcional)":
   - Sube imágenes de hasta 50MB
   - Formatos: JPG, PNG, WebP
   - Se muestra preview inmediato

### Para Usuarios
- Los banners se muestran automáticamente en `/weekly-wine/[club]`
- Carga optimizada con skeleton loading
- Fallback automático si hay error
- Overlay gradient para mejor legibilidad

## 🔧 Archivos Modificados

1. **`components/ui/banner-image.tsx`** - Nuevo componente
2. **`app/account/actions/subscriptions.ts`** - Función de subida mejorada
3. **`app/account/admin-plans-tab.tsx`** - Modal actualizado
4. **`app/weekly-wine/[club]/page.tsx`** - Página de club optimizada
5. **`next.config.mjs`** - Configuración Next.js mejorada

## 📈 Beneficios

- **Calidad Visual:** Banners en máxima resolución
- **Performance:** Carga optimizada y cache inteligente
- **UX:** Loading states y fallbacks
- **Mantenimiento:** Código modular y reutilizable
- **Escalabilidad:** Soporte para imágenes 4K

## 🚨 Consideraciones

- Los archivos de banner son más grandes (hasta 50MB)
- Se recomienda usar imágenes optimizadas antes de subir
- El cache de banners es de 1 año (cambios tardan en reflejarse)
- WebP y AVIF se generan automáticamente para mejor performance

## 🔄 Próximos Pasos

1. Subir banners de alta calidad para cada club
2. Monitorear performance y ajustar si es necesario
3. Considerar implementar compresión automática en el futuro
4. Añadir métricas de carga de imágenes
