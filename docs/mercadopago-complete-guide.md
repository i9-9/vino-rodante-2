# Guía Completa de Integración de MercadoPago

## ✅ Estado Actual

La integración de MercadoPago está **COMPLETA** y funcionando correctamente.

### Funcionalidades Implementadas

- ✅ **Creación de preferencias de pago**
- ✅ **Widget de MercadoPago integrado**
- ✅ **Manejo de webhooks**
- ✅ **Estados de pago actualizados**
- ✅ **Página de confirmación mejorada**
- ✅ **Página de pending**
- ✅ **Validación de datos**
- ✅ **Manejo de errores robusto**
- ✅ **Scripts de prueba**

## 🚀 Cómo Usar

### 1. Verificar Configuración

```bash
# Probar la integración
npm run test:mercadopago
```

### 2. Iniciar Servidor

```bash
# Iniciar servidor de desarrollo
npm run dev
```

### 3. Probar Checkout

1. Ve a `http://localhost:3000/checkout`
2. Completa la información de contacto
3. Procede al pago
4. Usa las tarjetas de prueba

### 4. Configurar Webhooks (Opcional)

```bash
# Configurar ngrok para webhooks
npm run setup:webhooks
```

## 💳 Tarjetas de Prueba

| Tarjeta | Número | CVV | Fecha |
|---------|--------|-----|-------|
| Visa | 4509 9535 6623 3704 | 123 | Cualquier fecha futura |
| Mastercard | 5031 4332 1540 6351 | 123 | Cualquier fecha futura |
| American Express | 3711 8030 3257 522 | 123 | Cualquier fecha futura |

**DNI**: 12345678

## 🔧 Configuración de Variables

Tu archivo `.env.local` debe contener:

```bash
# MercadoPago Configuration
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📁 Archivos Principales

### Componentes
- `components/ui/mercado-pago-checkout.tsx` - Widget de pago
- `app/checkout/page.tsx` - Página de checkout
- `app/checkout/confirmation/page.tsx` - Página de confirmación
- `app/checkout/pending/page.tsx` - Página de pending

### APIs
- `app/api/checkout/create-preference/route.ts` - Crear preferencia
- `app/api/webhooks/mercadopago/route.ts` - Webhook de pagos

### Utilidades
- `lib/mercadopago.ts` - Funciones de MercadoPago
- `scripts/test-mercadopago.ts` - Script de pruebas

## 🔄 Flujo de Pago

1. **Usuario agrega productos al carrito**
2. **Va a `/checkout`**
3. **Completa información de contacto**
4. **Se crea preferencia en MercadoPago**
5. **Se abre widget de pago**
6. **Usuario paga con tarjeta de prueba**
7. **Redirección a página de confirmación**
8. **Webhook actualiza estado de orden**

## 🌐 Webhooks

### Configuración para Desarrollo

1. Instala ngrok: `npm install -g ngrok`
2. Ejecuta: `npm run setup:webhooks`
3. Copia la URL de ngrok
4. Configura en MercadoPago Developers

### URL del Webhook
```
https://tu-tunnel.ngrok.io/api/webhooks/mercadopago
```

## 📊 Estados de Pago

| Estado MercadoPago | Estado Orden | Descripción |
|-------------------|--------------|-------------|
| `approved` | `paid` | Pago confirmado |
| `rejected` | `cancelled` | Pago rechazado |
| `refunded` | `refunded` | Pago reembolsado |
| `in_process` | `pending` | Pago en proceso |
| `pending` | `pending` | Pago pendiente |

## 🛠️ Comandos Útiles

```bash
# Probar integración
npm run test:mercadopago

# Configurar webhooks
npm run setup:webhooks

# Iniciar servidor
npm run dev

# Verificar variables
echo $MERCADO_PAGO_ACCESS_TOKEN
echo $NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
```

## 🔍 Troubleshooting

### Error: "Preference not found"
- Verificar que las credenciales sean correctas
- Verificar que el servidor esté corriendo
- Revisar logs del servidor

### Error: "Webhook not working"
- Verificar que ngrok esté corriendo
- Verificar URL en MercadoPago
- Revisar logs del webhook

### Error: "Payment failed"
- Usar tarjetas de prueba válidas
- Verificar datos de prueba
- Revisar logs de MercadoPago

## 🎯 Próximos Pasos

1. **Probar flujo completo** con tarjetas de prueba
2. **Configurar webhooks** con ngrok
3. **Probar diferentes escenarios** (éxito, fallo, pending)
4. **Configurar para producción** cuando esté listo

## 📞 Soporte

Si tienes problemas:
- Revisa los logs del servidor
- Verifica las variables de entorno
- Usa el script de pruebas
- Contacta soporte técnico

## 🎉 ¡Listo!

Tu integración de MercadoPago está completa y lista para usar. ¡Puedes empezar a procesar pagos! 