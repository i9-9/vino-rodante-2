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

## Problemas Identificados y Soluciones

### 1. Inconsistencia en nombres de variables
**Problema**: Algunos archivos usan `MERCADO_PAGO_ACCESS_TOKEN` y otros `MERCADOPAGO_ACCESS_TOKEN`

**Solución**: Estandarizar a `MERCADO_PAGO_ACCESS_TOKEN`

### 2. Clave pública hardcodeada
**Problema**: La clave pública está hardcodeada en el componente

**Solución**: Usar variable de entorno `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`

### 3. URLs de redirección
**Problema**: Las URLs de redirección usan variables que pueden no estar definidas

**Solución**: Asegurar que `NEXT_PUBLIC_APP_URL` esté configurada

## Archivos que necesitan corrección

1. `components/ui/mercado-pago-checkout.tsx` - Usar variable de entorno para la clave pública
2. `lib/mercadopago.ts` - Ya está correcto
3. `app/api/subscriptions/create/route.ts` - Corregir nombre de variable
4. `app/api/subscriptions/webhook/route.ts` - Corregir nombre de variable

## Pruebas del Checkout

### 1. Flujo de compra normal
1. Agregar productos al carrito
2. Ir al checkout
3. Completar información de contacto
4. Proceder al pago con MercadoPago
5. Usar tarjeta de prueba
6. Verificar redirección a página de confirmación

### 2. Flujo de suscripción
1. Seleccionar un plan de suscripción
2. Elegir frecuencia
3. Proceder al pago
4. Usar tarjeta de prueba
5. Verificar creación de suscripción en la base de datos

### 3. Webhooks
1. Configurar ngrok para desarrollo local
2. Actualizar URL del webhook en MercadoPago
3. Realizar una compra de prueba
4. Verificar que el webhook actualice el estado de la orden

## Comandos útiles

```bash
# Instalar ngrok para desarrollo local
npm install -g ngrok

# Iniciar tunnel para webhooks
ngrok http 3000

# Verificar variables de entorno
echo $MERCADO_PAGO_ACCESS_TOKEN
echo $NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
```

## Troubleshooting

### Error: "Invalid access token"
- Verificar que `MERCADO_PAGO_ACCESS_TOKEN` esté configurada
- Asegurar que el token sea válido y no haya expirado

### Error: "Preference not found"
- Verificar que la preferencia se esté creando correctamente
- Revisar logs del servidor para errores en la creación

### Webhook no funciona
- Verificar que la URL del webhook sea accesible públicamente
- Usar ngrok para desarrollo local
- Revisar logs del webhook en MercadoPago

### Error de CORS
- Asegurar que las URLs de redirección estén en el dominio correcto
- Verificar configuración de CORS en MercadoPago 