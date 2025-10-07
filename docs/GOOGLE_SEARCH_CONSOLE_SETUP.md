# Google Search Console - Guía de Configuración

## ¿Qué es Google Search Console?

Google Search Console es una herramienta gratuita que te permite:
- **Monitorear** cómo Google ve tu sitio web
- **Verificar** problemas de indexación
- **Recibir alertas** sobre errores de Core Web Vitals
- **Analizar** qué palabras clave te traen tráfico
- **Enviar sitemaps** para indexación más rápida

## Paso 1: Crear cuenta en Google Search Console

1. **Ve a**: [search.google.com/search-console](https://search.google.com/search-console)
2. **Inicia sesión** con la misma cuenta que usaste para Google Analytics
3. **Haz clic** en "Agregar propiedad"

## Paso 2: Agregar tu sitio

### Opción A: Prefijo de URL (Recomendado)
- **Selecciona**: "Prefijo de URL"
- **Ingresa**: `https://vinorodante.com`
- **Haz clic**: "Continuar"

### Opción B: Dominio (Más complejo)
- **Selecciona**: "Dominio"
- **Ingresa**: `vinorodante.com`
- **Requiere**: Configuración DNS adicional

## Paso 3: Verificar propiedad

### Método 1: Meta tag (Ya implementado)
1. **Google te mostrará** un código como:
   ```html
   <meta name="google-site-verification" content="abc123def456ghi789" />
   ```
2. **Copia el código** (solo la parte del content)
3. **Agrega la variable** a tu `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123def456ghi789
   ```
4. **Despliega** los cambios
5. **Haz clic** en "Verificar" en Google Search Console

### Método 2: Archivo HTML (Alternativo)
1. **Descarga** el archivo `google-site-verification.html`
2. **Súbelo** a tu carpeta `public/`
3. **Verifica** que sea accesible en `https://vinorodante.com/google-site-verification.html`

## Paso 4: Configurar en Vercel

### Variables de entorno en Vercel:
```bash
# Google Search Console
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=tu_codigo_de_verificacion_aqui
```

### Pasos en Vercel:
1. **Ve a** tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. **Add New**:
   - **Name**: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value**: `tu_codigo_de_verificacion`
   - **Environment**: `Production`, `Preview`, `Development`
4. **Redeploy** tu proyecto

## Paso 5: Enviar sitemap

### Una vez verificado:
1. **Ve a** Google Search Console
2. **Sitemaps** → **Agregar nuevo sitemap**
3. **Ingresa**: `sitemap.xml`
4. **Haz clic**: "Enviar"

### Tu sitemap ya está configurado en:
- **URL**: `https://vinorodante.com/sitemap.xml`
- **Archivo**: `app/sitemap.ts`

## Paso 6: Configurar alertas

### Alertas importantes:
1. **Core Web Vitals** → Problemas de rendimiento
2. **Errores de rastreo** → Problemas de acceso
3. **Errores de indexación** → Problemas de contenido
4. **Seguridad** → Problemas de seguridad

### Configurar alertas:
1. **Ve a** Google Search Console
2. **Configuración** → **Usuarios y permisos**
3. **Agrega** tu email para recibir alertas

## Paso 7: Monitoreo continuo

### Revisar regularmente:
- **Cobertura** → Páginas indexadas vs errores
- **Rendimiento** → Impresiones, clics, CTR, posición
- **Core Web Vitals** → LCP, FID, CLS
- **Mejoras** → Sugerencias de Google

### Frecuencia recomendada:
- **Diario**: Errores críticos
- **Semanal**: Rendimiento general
- **Mensual**: Análisis completo

## Beneficios para Vino Rodante

### SEO específico para vinos:
- **Monitorear** palabras clave de vinos argentinos
- **Optimizar** páginas de productos por varietal
- **Mejorar** Core Web Vitals para mejor ranking
- **Analizar** comportamiento de usuarios

### E-commerce específico:
- **Rastrear** páginas de productos
- **Monitorear** páginas de checkout
- **Optimizar** páginas de categorías
- **Mejorar** experiencia de usuario

## Troubleshooting

### Problemas comunes:

#### "No se puede verificar"
- **Verifica** que el meta tag esté en el `<head>`
- **Confirma** que la variable de entorno esté configurada
- **Espera** unos minutos después del deploy

#### "Sitemap no encontrado"
- **Verifica** que `https://vinorodante.com/sitemap.xml` sea accesible
- **Confirma** que el sitemap tenga URLs válidas

#### "Datos no aparecen"
- **Espera** 24-48 horas para los primeros datos
- **Verifica** que el sitio esté indexado
- **Confirma** que haya tráfico orgánico

## Próximos pasos

1. **Configurar** Google Search Console
2. **Enviar** sitemap
3. **Configurar** alertas
4. **Monitorear** Core Web Vitals
5. **Optimizar** basado en datos

---

**Nota**: Este proceso puede tomar 24-48 horas para mostrar los primeros datos en Google Search Console.
