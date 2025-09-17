# Configuración de Google Login

## Variables de Entorno Requeridas

Para habilitar el Google login, necesitas configurar las siguientes variables de entorno en tu archivo `.env.local`:

```bash
# Supabase OAuth Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (para redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Cambiar en producción
```

## Configuración en Supabase Dashboard

### 1. Habilitar Google OAuth

Ve a tu proyecto de Supabase → Authentication → Providers y habilita:

- **Google**

### 2. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configura:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo)
6. Copia el **Client ID** y **Client Secret**
7. En Supabase Dashboard → Authentication → Providers → Google:
   - Habilita el provider
   - Ingresa el Client ID y Client Secret

### 3. Configurar Apple OAuth

1. Ve a [Apple Developer Console](https://developer.apple.com/)
2. Crea un nuevo App ID:
   - **Description**: Vino Rodante
   - **Bundle ID**: com.yourcompany.vinorodante
   - Habilita "Sign In with Apple"
3. Crea un Service ID:
   - **Description**: Vino Rodante Web
   - **Identifier**: com.yourcompany.vinorodante.web
   - **Primary App ID**: selecciona el App ID creado anteriormente
   - **Domains**: tu dominio
   - **Return URLs**: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Crea una Key:
   - **Key Name**: Vino Rodante Sign In Key
   - **Services**: Sign In with Apple
   - Descarga el archivo .p8
5. En Supabase Dashboard → Authentication → Providers → Apple:
   - Habilita el provider
   - Ingresa el Service ID, Team ID, Key ID y el contenido del archivo .p8

### 4. Configurar Facebook OAuth

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva app → "Consumer" → "Next"
3. Agrega el producto "Facebook Login"
4. Configura:
   - **Valid OAuth Redirect URIs**: `https://your-project-ref.supabase.co/auth/v1/callback`
   - **App Domains**: tu dominio
5. Copia el **App ID** y **App Secret**
6. En Supabase Dashboard → Authentication → Providers → Facebook:
   - Habilita el provider
   - Ingresa el App ID y App Secret

## URLs de Redirect

Asegúrate de que las siguientes URLs estén configuradas correctamente:

- **Desarrollo**: `http://localhost:3000/auth/callback`
- **Producción**: `https://your-domain.com/auth/callback`

## Testing

Para probar el social login:

1. Ve a `/auth/sign-in`
2. Haz clic en cualquier botón de social login
3. Completa el flujo OAuth
4. Verifica que el usuario se crea automáticamente en la tabla `customers`

## Troubleshooting

### Error: "Invalid redirect URI"
- Verifica que las URLs de redirect en Supabase coincidan exactamente con las configuradas en los proveedores OAuth

### Error: "Client ID not found"
- Verifica que el Client ID esté correctamente configurado en Supabase Dashboard

### Usuario no se crea en tabla customers
- Revisa los logs del callback en `/auth/callback/route.ts`
- Verifica que la tabla `customers` tenga los permisos RLS correctos

## Seguridad

- Nunca expongas los Client Secrets en el código frontend
- Usa HTTPS en producción
- Configura correctamente los dominios permitidos en cada proveedor OAuth
