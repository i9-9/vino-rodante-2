# Implementación de SEO con next-seo

## Resumen

Se ha implementado un sistema completo de SEO para Vino Rodante usando `next-seo`. El sistema incluye:

- **Meta tags optimizados** para productos, colecciones y páginas principales
- **Open Graph** y **Twitter Cards** para redes sociales
- **Structured Data** (JSON-LD) para mejor indexación en Google
- **Sitemap dinámico** que incluye todos los productos
- **Robots.txt** configurado para optimizar el crawling

## Archivos Creados/Modificados

### Archivos de Configuración
- `lib/seo-config.ts` - Configuraciones base de SEO
- `lib/seo-utils.ts` - Utilidades para structured data
- `components/SEO.tsx` - Componente wrapper para next-seo

### Archivos de SEO Automático
- `app/sitemap.ts` - Sitemap dinámico
- `app/robots.ts` - Robots.txt

### Páginas Actualizadas
- `app/page.tsx` - Página principal con SEO
- `app/products/[slug]/page.tsx` - Productos individuales con SEO
- `app/products/page.tsx` - Lista de productos con SEO
- `app/collections/bestsellers/page.tsx` - Colección bestsellers
- `app/collections/boxes/page.tsx` - Colección boxes
- `app/collections/new-arrivals/page.tsx` - Colección novedades

## Características Implementadas

### 1. SEO para Productos Individuales
- **Títulos dinámicos**: `{Nombre del Vino} | Vino Rodante`
- **Descripciones enriquecidas**: Incluyen año, varietal, región y precio
- **Open Graph optimizado**: Tipo "product" con imágenes y precios
- **Structured Data**: Schema.org Product con información completa
- **Meta tags específicos**: Precio, disponibilidad, condición

### 2. SEO para Colecciones
- **Títulos específicos**: `{Nombre de Colección} | Vino Rodante`
- **Descripciones personalizadas** por colección
- **Structured Data**: Schema.org CollectionPage
- **Open Graph**: Tipo "website" con imágenes de colección

### 3. SEO para Página Principal
- **Título optimizado**: "Vino Rodante | El Vino Rueda en el Tiempo y Crece con la Historia"
- **Structured Data**: Schema.org WebSite con SearchAction
- **Meta tags completos**: Keywords, autor, robots

### 4. Structured Data (JSON-LD)
- **Product Schema**: Información completa de productos
- **Collection Schema**: Lista de productos en colecciones
- **Website Schema**: Información del sitio con búsqueda
- **Organization Schema**: Datos de la empresa

### 5. Sitemap Dinámico
- **Páginas estáticas**: Home, productos, colecciones, about, contact
- **Páginas dinámicas**: Todos los productos individuales
- **Prioridades optimizadas**: Home (1.0), productos (0.9), colecciones (0.8)
- **Frecuencias de cambio**: Diario para productos, semanal para colecciones

### 6. Robots.txt
- **Permite crawling** de páginas públicas
- **Bloquea páginas privadas**: /api/, /account/, /checkout/, /auth/, /admin/
- **Referencia al sitemap**

## Uso del Sistema

### Para Productos Individuales
```tsx
import SEO from '@/components/SEO'
import { productSEO } from '@/lib/seo-config'

const seoConfig = productSEO({
  name: product.name,
  description: product.description,
  image: product.image,
  price: product.price,
  region: product.region,
  varietal: product.varietal,
  year: product.year,
  category: product.category,
  slug: product.slug,
  stock: product.stock
})

return (
  <SEO seo={seoConfig}>
    {/* Contenido de la página */}
  </SEO>
)
```

### Para Colecciones
```tsx
import SEO from '@/components/SEO'
import { collectionSEO } from '@/lib/seo-config'

const seoConfig = collectionSEO({
  name: "Nombre de Colección",
  description: "Descripción de la colección",
  slug: "slug-coleccion"
})

return (
  <SEO seo={seoConfig}>
    {/* Contenido de la página */}
  </SEO>
)
```

### Para Página Principal
```tsx
import SEO from '@/components/SEO'
import { getHomeSEOWithStructuredData } from '@/lib/seo-config'

return (
  <SEO seo={getHomeSEOWithStructuredData()}>
    {/* Contenido de la página */}
  </SEO>
)
```

## Beneficios SEO

### 1. Mejor Indexación
- **Structured Data** ayuda a Google a entender el contenido
- **Sitemap dinámico** asegura que todos los productos sean indexados
- **Meta tags optimizados** mejoran la relevancia en búsquedas

### 2. Mejor Apariencia en Redes Sociales
- **Open Graph** optimiza el preview en Facebook, LinkedIn
- **Twitter Cards** mejora la apariencia en Twitter
- **Imágenes optimizadas** para cada tipo de contenido

### 3. Mejor Experiencia de Usuario
- **Títulos descriptivos** en pestañas del navegador
- **Descripciones claras** en resultados de búsqueda
- **Información estructurada** para asistentes de voz

### 4. Mejor Rendimiento en Búsquedas
- **Keywords relevantes** en meta tags
- **URLs canónicas** evitan contenido duplicado
- **Robots.txt** optimiza el crawling

## Próximos Pasos Recomendados

1. **Verificar en Google Search Console** que el sitemap se esté indexando correctamente
2. **Probar structured data** con Google's Rich Results Test
3. **Monitorear performance** en Google Search Console
4. **Agregar más structured data** si es necesario (reviews, ratings, etc.)
5. **Optimizar imágenes** para Open Graph (1200x630px recomendado)

## Notas Técnicas

- El sistema usa `next-seo` que es compatible con Next.js 13+ App Router
- Los structured data se generan dinámicamente basados en el contenido
- El sitemap se regenera automáticamente cuando hay cambios en productos
- Todas las URLs usan HTTPS y son canónicas
- El sistema es completamente compatible con SSR/SSG de Next.js
