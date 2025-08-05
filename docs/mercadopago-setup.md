# Configuración de MercadoPago para Vino Rodante

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# MercadoPago Configuration
MERCADO_PAGO_ACCESS_TOKEN=your_mercadopago_access_token_here
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_mercadopago_public_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Configuración de MercadoPago

### 1. Crear cuenta en MercadoPago Developers
- Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- Crea una cuenta o inicia sesión
- Accede al panel de desarrolladores

### 2. Crear una aplicación
- En el panel de desarrolladores, crea una nueva aplicación
- Selecciona "E-commerce" como tipo de aplicación
- Guarda las credenciales generadas

### 3. Obtener credenciales
- **Access Token**: Se encuentra en la sección "Credenciales" de tu aplicación
- **Public Key**: También se encuentra en la sección "Credenciales"

### 4. Configurar webhooks
- En la sección "Notificaciones" de tu aplicación
- Agrega la URL: `https://tu-dominio.com/api/webhooks/mercadopago`
- Para desarrollo local, puedes usar ngrok: `https://tu-tunnel.ngrok.io/api/webhooks/mercadopago`

## Mejoras Implementadas

### 1. Componente MercadoPagoCheckout Mejorado
- ✅ Manejo robusto de errores
- ✅ Estados de carga mejorados
- ✅ Validación de configuración
- ✅ Eventos de pago completos
- ✅ UX mejorada con botones y alertas

### 2. API de Preferencias Mejorada
- ✅ Validación de datos de entrada
- ✅ Manejo de errores detallado
- ✅ Metadatos personalizados
- ✅ Expiración de preferencias
- ✅ Configuración de métodos de pago

### 3. Webhook Robusto
- ✅ Validación de formato de webhook
- ✅ Logging detallado
- ✅ Manejo de errores mejorado
- ✅ Estados de orden actualizados
- ✅ Preparado para validación de firma

### 4. Página de Confirmación Mejorada
- ✅ Estados visuales claros
- ✅ Información detallada del pedido
- ✅ Navegación intuitiva
- ✅ Mensajes contextuales

## Modo de Pruebas

Para hacer pruebas, usa las credenciales de **sandbox**:

### Tarjetas de prueba:
- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 4332 1540 6351
- **American Express**: 3711 8030 3257 522

### Datos de prueba:
- **CVV**: 123
- **Fecha de vencimiento**: Cualquier fecha futura
- **DNI**: 12345678

## Scripts de Prueba

### Ejecutar pruebas de integración:
```bash
npm run test:mercadopago
# o
npx tsx scripts/test-mercadopago.ts
```

### Configurar ngrok para webhooks:
```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar tunnel
ngrok http 3000

# Copiar la URL de ngrok y configurarla en MercadoPago
```

## Flujo de Checkout Mejorado

### 1. Flujo de compra normal
1. Agregar productos al carrito
2. Ir al checkout (`/checkout`)
3. Completar información de contacto
4. Proceder al pago con MercadoPago
5. Usar tarjeta de prueba
6. Verificar redirección a página de confirmación

### 2. Estados de pago
- **pending**: Pago en proceso
- **paid**: Pago confirmado
- **cancelled**: Pago cancelado
- **refunded**: Pago reembolsado

### 3. Webhooks
1. Configurar ngrok para desarrollo local
2. Actualizar URL del webhook en MercadoPago
3. Realizar una compra de prueba
4. Verificar que el webhook actualice el estado de la orden

## Características Implementadas

### ✅ Funcionalidades Principales
- [x] Creación de preferencias de pago
- [x] Widget de MercadoPago integrado
- [x] Manejo de webhooks
- [x] Estados de pago actualizados
- [x] Página de confirmación mejorada
- [x] Validación de datos
- [x] Manejo de errores robusto

### ✅ Mejoras de UX
- [x] Estados de carga visuales
- [x] Mensajes de error claros
- [x] Navegación intuitiva
- [x] Información detallada del pedido
- [x] Botones de acción claros

### ✅ Seguridad
- [x] Validación de datos de entrada
- [x] Manejo seguro de errores
- [x] Preparado para validación de firma
- [x] Variables de entorno seguras

## Troubleshooting

### Error: "Invalid access token"
- Verificar que `MERCADO_PAGO_ACCESS_TOKEN` esté configurada
- Asegurar que el token sea válido y no haya expirado
- Verificar que estés usando las credenciales correctas (sandbox vs producción)

### Error: "Preference not found"
- Verificar que la preferencia se esté creando correctamente
- Revisar logs del servidor para errores en la creación
- Verificar que las variables de entorno estén configuradas

### Webhook no funciona
- Verificar que la URL del webhook sea accesible públicamente
- Usar ngrok para desarrollo local
- Revisar logs del webhook en MercadoPago
- Verificar que el endpoint responda correctamente

### Error de CORS
- Asegurar que las URLs de redirección estén en el dominio correcto
- Verificar configuración de CORS en MercadoPago
- Usar HTTPS en producción

### Error: "Public key not configured"
- Verificar que `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` esté configurada
- Asegurar que la variable esté disponible en el cliente

## Comandos útiles

```bash
# Ejecutar pruebas de integración
npm run test:mercadopago

# Iniciar servidor de desarrollo
npm run dev

# Instalar ngrok para webhooks
npm install -g ngrok

# Iniciar tunnel para webhooks
ngrok http 3000

# Verificar variables de entorno
echo $MERCADO_PAGO_ACCESS_TOKEN
echo $NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
```

## Próximos Pasos

1. **Configurar variables de entorno** en `.env.local`
2. **Ejecutar pruebas** con `npm run test:mercadopago`
3. **Iniciar servidor** con `npm run dev`
4. **Probar checkout** en `/checkout`
5. **Configurar webhooks** con ngrok para desarrollo
6. **Probar flujo completo** con tarjetas de prueba

## Notas de Producción

- Cambiar a credenciales de producción
- Configurar webhooks con URL de producción
- Habilitar validación de firma de webhooks
- Configurar monitoreo de errores
- Implementar notificaciones por email
- Configurar logs detallados 