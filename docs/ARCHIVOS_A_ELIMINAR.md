# Archivos y Scripts a Eliminar

## Scripts de Debug/Test Temporales (NO referenciados en package.json)

### Scripts de test específicos que ya no se necesitan:
- scripts/debug-40-40-products.ts
- scripts/debug-card-error.ts
- scripts/debug-images.ts
- scripts/debug-payment-issues.ts (mantener si está en package.json)
- scripts/debug-user-data.ts
- scripts/find-40-40-malbec.ts
- scripts/fix-40-40-slugs.ts
- scripts/fix-slugs-with-slashes.ts
- scripts/test-correct-domain.ts
- scripts/test-corrected-url.ts
- scripts/test-official-cards.ts
- scripts/test-debit-card-support.ts
- scripts/test-minimum-amounts.ts
- scripts/test-anonymous-subscription-simple.ts
- scripts/test-anonymous-subscription.ts
- scripts/test-boxes-direct.ts
- scripts/test-boxes-function.ts
- scripts/test-boxes-query.ts
- scripts/test-browser-client.ts
- scripts/test-cart-logic.ts
- scripts/test-product-urls.ts
- scripts/test-revalidation.ts
- scripts/test-schema-validation.ts
- scripts/test-slug-generation.ts
- scripts/test-url-flexibility.ts
- scripts/diagnose-payment-restrictions.ts
- scripts/check-payment-methods.ts
- scripts/check-mercadopago-account.ts
- scripts/check-visibility.ts
- scripts/check-boxes-category.ts
- scripts/check-database-status.ts
- scripts/check-subscription-status.ts
- scripts/check-subscription-plans.ts
- scripts/get-plans-simple.ts
- scripts/get-plans.ts
- scripts/setup-mercadopago.ts (duplicado, hay setup-mercadopago-account.ts)
- scripts/setup-webhook.ts (duplicado, hay setup-webhooks.ts)

### Scripts SQL de migraciones antiguas (ya ejecutadas):
- scripts/add-newsletter-table.sql
- scripts/clean-duplicate-plans-final.sql
- scripts/clean-duplicate-plans.sql
- scripts/create-box-tables.sql
- scripts/create-storage-bucket.sql
- scripts/create-subscription-plans-bucket.sql
- scripts/create-tables.sql
- scripts/final-cleanup.sql
- scripts/fix-club-values.sql
- scripts/fix-premium-plans.sql
- scripts/fix-subscription-plans.sql
- scripts/init-database.sql (mantener init-database.ts si se usa)
- scripts/insert-boxes-products.sql
- scripts/insert-sample-products.sql
- scripts/migrate-boxes.sql
- scripts/migrate-subscription-plans.sql
- scripts/seed-subscription-plans.sql
- scripts/update-storage-policies.sql
- scripts/update-subscription-plans-features.sql
- scripts/update-subscription-plans-structure.sql
- scripts/update-subscription-plans.sql

### Scripts de utilidad que probablemente ya no se necesitan:
- scripts/fix-cache-issues.ts
- scripts/production-health-check.ts
- scripts/run-migration.js

## Documentación Obsoleta/Duplicada

### Archivos de documentación que pueden consolidarse o eliminarse:
- PRODUCTOS_CRUD_ERRORES.md (ya corregido)
- INSTRUCCIONES_CORRECCION.md (temporal)
- SUBSCRIPTION_CRUD_FIX.md (ya corregido)
- SUPABASE_ISSUES.md (issues resueltos)
- PRODUCTION_READINESS_REPORT.md (puede estar obsoleto)
- vinos.md (si no se usa)
- docs/SEO_OPTIMIZATION_PLAN.md (si ya se implementó)
- docs/SEO_IMPLEMENTATION.md (si docs/SEO_IMPLEMENTATION_SUMMARY.md es suficiente)

## Archivos de Componentes No Usados

- components/hero-parallax-cards.tsx (no se usa según grep)
- components/image-zoom-*.tsx (múltiples variantes, verificar cuál se usa)

