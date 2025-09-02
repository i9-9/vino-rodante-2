# 🚀 Checklist Pre-Lanzamiento - Vino Rodante

## ⚠️ CRÍTICO - Debe completarse antes del lanzamiento

### 🔧 Variables de Entorno
- [ ] **MercadoPago**: Cambiar `MERCADO_PAGO_ACCESS_TOKEN` de `TEST-` a `PROD-`
- [ ] **MercadoPago**: Cambiar `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` de `TEST-` a `PROD-`
- [ ] **App URL**: Cambiar `NEXT_PUBLIC_APP_URL` de localhost a dominio de producción
- [ ] **Site URL**: Cambiar `NEXT_PUBLIC_SITE_URL` de localhost a dominio de producción  
- [ ] **Node Environment**: Establecer `NODE_ENV=production`

### 🌐 Configuración de Dominio
- [ ] DNS configurado para apuntar al servidor
- [ ] SSL/TLS certificado instalado y funcionando
- [ ] Redirecciones HTTP → HTTPS configuradas

### 💳 MercadoPago Producción
- [ ] Cuenta de MercadoPago verificada para producción
- [ ] Webhook URL configurada: `https://tudominio.com/api/webhooks/mercadopago`
- [ ] Probado al menos un pago en producción

---

## ✅ Verificado y Listo

### 🔐 Autenticación
- [x] Supabase SSR configurado correctamente
- [x] Middleware de protección de rutas funcional
- [x] RLS policies implementadas
- [x] Verificación de admin funcionando

### 💾 Base de Datos
- [x] Schema de producción actualizado
- [x] Productos cargados (36 productos encontrados)
- [x] Planes de suscripción configurados
- [x] Datos de prueba removidos (si aplica)

### 🛠️ Aplicación
- [x] Build de producción exitoso
- [x] Dashboard administrativo operativo
- [x] Sistema de carrito funcionando
- [x] Flujo de checkout completo
- [x] Gestión de productos y órdenes

### 📧 Sistema de Emails
- [x] Resend configurado
- [x] Templates de email implementados
- [x] Emails de confirmación funcionando

---

## 🔄 Post-Lanzamiento (Primera semana)

### 📊 Monitoreo
- [ ] Configurar Google Analytics
- [ ] Implementar monitoreo de errores (Sentry)
- [ ] Configurar alertas de sistema
- [ ] Verificar logs de aplicación

### 🧪 Testing
- [ ] Probar flujo completo de compra
- [ ] Verificar emails en producción
- [ ] Testear dashboard administrativo
- [ ] Validar responsive en dispositivos reales

### 🔧 Optimizaciones
- [ ] Arreglar tests unitarios
- [ ] Resolver warnings de linting
- [ ] Configurar backups automatizados
- [ ] Documentar APIs para el equipo

---

## 📞 Contactos de Emergencia

### Servicios Externos
- **Supabase**: Panel de control y logs
- **MercadoPago**: Panel de desarrolladores
- **Resend**: Dashboard de emails
- **Vercel/Hosting**: Panel de aplicación

### Comandos Útiles
```bash
# Verificar salud de la aplicación
npm run build

# Verificar variables de entorno
npx tsx scripts/production-health-check.ts

# Ver logs en tiempo real (si aplica)
# tail -f logs/app.log
```

---

## 🎯 Criterios de Éxito Post-Lanzamiento

- [ ] **Primer día**: Sin errores críticos
- [ ] **Primera semana**: Al menos 1 venta completada
- [ ] **Primer mes**: Sistema de pagos estable (0% errores)
- [ ] **Performance**: Tiempos de carga < 3 segundos
- [ ] **Uptime**: > 99.5%

---

**Última actualización:** ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}

**Estado:** ⚠️ Pendiente configuración de variables de entorno

