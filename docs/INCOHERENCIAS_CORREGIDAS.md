# Reporte de Incoherencias Corregidas

## Fecha: 2025-01-28

### ✅ Problemas Corregidos

#### 1. **Tipos `any` en `hero-client.tsx`**
   - **Problema**: El componente usaba `weeklyPlans: any[]` y `t = useTranslations() as any`
   - **Impacto**: Pérdida de type safety, posibles errores en runtime
   - **Solución**: 
     - Cambiado a `weeklyPlans: SubscriptionPlan[]` usando el tipo de `@/app/account/types`
     - Eliminado el `as any` del hook de traducciones
   - **Archivo**: `components/hero-client.tsx`

#### 2. **Import no usado en `products/[slug]/page.tsx`**
   - **Problema**: Se importaba `useProductTracking` pero nunca se usaba
   - **Impacto**: Código innecesario, posible confusión
   - **Solución**: Eliminado el import no utilizado
   - **Archivo**: `app/products/[slug]/page.tsx`

#### 3. **Tipo `Translations` incompleto**
   - **Problema**: El tipo `Translations` en `lib/providers/translations-provider.tsx` no incluía la propiedad `home`, causando errores de TypeScript
   - **Impacto**: Errores de compilación en componentes que usan `t.home.hero.*`
   - **Solución**: 
     - Actualizado para usar el tipo completo de `lib/i18n/types.ts`
     - Agregada la propiedad `home` explícitamente al tipo `Translations`
   - **Archivos**: 
     - `lib/providers/translations-provider.tsx`
     - `lib/i18n/types.ts`

### ⚠️ Problemas Identificados (No Corregidos)

#### 1. **Duplicación de archivos Supabase**
   - **Problema**: Existen dos ubicaciones para los clientes de Supabase:
     - `/utils/supabase/server.ts` y `/utils/supabase/client.ts`
     - `/lib/supabase/server.ts` y `/lib/supabase/client.ts`
   - **Impacto**: Posible confusión sobre qué archivos usar, inconsistencia en imports
   - **Recomendación**: 
     - Documentar cuál es la ubicación oficial según las reglas del proyecto
     - Consolidar en una sola ubicación o documentar claramente cuándo usar cada una
   - **Nota**: Según las reglas del proyecto, se debe usar `@/utils/supabase/server` y `@/utils/supabase/client`

#### 2. **Tipos `SubscriptionPlan` duplicados**
   - **Problema**: Existen dos definiciones de `SubscriptionPlan`:
     - `types/subscription.ts` - versión más simple
     - `app/account/types.ts` - versión más completa con campos nullable
   - **Impacto**: Inconsistencia en tipos, posibles errores de compilación
   - **Recomendación**: 
     - Consolidar en un solo tipo
     - Usar el tipo de `app/account/types.ts` como fuente de verdad (más completo)

#### 3. **Uso extensivo de `any` en el código**
   - **Problema**: Se encontraron 89 archivos con uso de `any`
   - **Impacto**: Pérdida de type safety, posibles errores en runtime
   - **Recomendación**: 
     - Revisar gradualmente y reemplazar `any` con tipos apropiados
     - Priorizar archivos críticos (checkout, pagos, autenticación)

### 📊 Estadísticas

- **Archivos corregidos**: 3
- **Errores de linter resueltos**: 9
- **Problemas identificados para revisión**: 3

### 🔍 Archivos Revisados

- `components/hero-client.tsx` ✅
- `app/products/[slug]/page.tsx` ✅
- `lib/providers/translations-provider.tsx` ✅
- `lib/i18n/types.ts` ✅
- `app/products/[...slug]/page.tsx` (revisado, sin cambios necesarios)
- `app/not-found.tsx` (revisado, sin cambios necesarios)
- `app/sitemap.ts` (revisado, sin cambios necesarios)

### 📝 Notas Adicionales

- Los tipos de traducciones ahora están correctamente tipados y el autocompletado debería funcionar mejor
- El componente `hero-client.tsx` ahora tiene mejor type safety
- Se mantiene compatibilidad con el código existente

