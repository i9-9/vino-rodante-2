# Environment Variables

This document lists all the environment variables required for the Vino Rodante application.

## Required Environment Variables

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

### MercadoPago Configuration
- `MERCADO_PAGO_ACCESS_TOKEN` - Your MercadoPago access token
- `MP_SECRET` - **NEW**: MercadoPago webhook signature validation secret

### Email Configuration (Resend)
- `RESEND_API_KEY` - Your Resend API key for sending emails

### CORS Configuration
- `VERCEL_URL` - Automatically set by Vercel for preview deployments (used in CORS)
- `NODE_ENV` - Environment mode (development/production) - affects CORS allowed origins

## CORS Security

The application now uses specific allowed origins instead of wildcard (`*`) for better security:

### Production Domains
- `https://www.vinorodante.com`
- `https://vinorodante.com`

### Development Domains (only in development mode)
- `http://localhost:3000`
- `http://127.0.0.1:3000`

### Vercel Preview URLs
- Automatically includes Vercel preview URLs when `VERCEL_URL` is set

### Security Benefits
- **Prevents unauthorized cross-origin requests**: Only specified domains can make requests
- **Reduces attack surface**: Eliminates wildcard CORS vulnerabilities
- **Environment-aware**: Different origins for development vs production

## MercadoPago Webhook Security

The `MP_SECRET` environment variable is used to validate webhook signatures from MercadoPago, ensuring that webhook requests are authentic and haven't been tampered with.

### How to get your MP_SECRET:

1. Log in to your MercadoPago Developer Dashboard
2. Go to "Tus integraciones" (Your integrations)
3. Select your application
4. Navigate to the "Webhooks" section
5. Reveal the webhook secret key
6. Copy the secret and add it to your environment variables as `MP_SECRET`

### Security Benefits:

- **Prevents unauthorized webhook calls**: Only requests with valid signatures are processed
- **Protects against replay attacks**: Timestamp validation ensures requests are recent
- **Data integrity**: Ensures webhook payloads haven't been modified in transit

## Environment Setup

Create a `.env.local` file in your project root with all the required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=your_mercadopago_access_token
MP_SECRET=your_mercadopago_webhook_secret

# Email
RESEND_API_KEY=your_resend_api_key
```

## Production Deployment

Make sure to set all these environment variables in your production environment (Vercel, Netlify, etc.) with the production values for each service.
