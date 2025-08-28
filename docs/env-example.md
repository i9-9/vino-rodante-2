# Variables de Entorno - Ejemplo

Copia este contenido en un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# MercadoPago Configuration
MERCADO_PAGO_ACCESS_TOKEN=TEST-your_mercadopago_access_token_here
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-your_mercadopago_public_key_here

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=Vino Rodante <info@vinorodante.com>
EMAIL_ADMIN=admin@vinorodante.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Notas importantes:

1. **Para desarrollo**: Usa las credenciales de **TEST** (sandbox) de MercadoPago
2. **Para producción**: Usa las credenciales de **PROD** de MercadoPago
3. **NEXT_PUBLIC_APP_URL**: Debe coincidir con la URL de tu aplicación
4. **NEXT_PUBLIC_SITE_URL**: Usado para redirecciones en suscripciones

## Cómo obtener las credenciales de MercadoPago:

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una aplicación
3. En la sección "Credenciales" encontrarás:
   - **Access Token**: Para operaciones del servidor
   - **Public Key**: Para el frontend 