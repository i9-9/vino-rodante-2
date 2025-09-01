# Sistema de Emails - Vino Rodante

## 📧 Configuración de Resend

El sistema de emails está configurado con **Resend** y envía automáticamente emails en las siguientes situaciones:

### Variables de entorno requeridas:
```env
RESEND_API_KEY=tu_api_key_de_resend
EMAIL_FROM=info@vinorodante.com
NEXT_PUBLIC_SITE_URL=https://vinorodante.com
```

## 🛒 Emails de Compras (Checkout)

### Cuando se procesa un pago exitoso:

**1. Email al Comprador:**
- ✅ Template profesional con branding de Vino Rodante
- ✅ Confirmación de pago recibido
- ✅ Detalles completos del pedido
- ✅ Información de próximos pasos
- ✅ Botón de contacto WhatsApp
- ✅ Asunto: `🍷 ¡Tu pedido está confirmado! - Vino Rodante #[ORDER_ID]`

**2. Email al Vendedor (info@vinorodante.com):**
- ✅ Notificación de nueva venta
- ✅ Información completa del cliente
- ✅ Detalles de productos vendidos
- ✅ Total de la venta
- ✅ ID de pago de MercadoPago
- ✅ Lista de próximos pasos administrativos
- ✅ Enlace al panel de admin
- ✅ Asunto: `💰 Nueva venta confirmada #[ORDER_ID] - [CUSTOMER_NAME]`

### Flujo técnico:
1. MercadoPago procesa el pago
2. Webhook `/api/webhooks/mercadopago` recibe notificación
3. Se actualiza el estado de la orden en la base de datos
4. Si el pago es `approved`, se envían ambos emails
5. Los emails se envían en paralelo con `Promise.allSettled()`
6. Si los emails fallan, no afectan la respuesta del webhook

## 🔄 Emails de Suscripciones

### Cuando se procesa un pago de suscripción:

**1. Email al Suscriptor:**
- ✅ Template diferente para primera activación vs renovación
- ✅ Detalles del plan de suscripción
- ✅ Fecha de próxima entrega
- ✅ Información sobre qué esperar
- ✅ Enlaces para gestionar suscripción
- ✅ Asunto primera vez: `🍷 ¡Bienvenido a tu suscripción! - Vino Rodante`
- ✅ Asunto renovación: `🍷 ¡Tu suscripción se ha renovado! - Vino Rodante`

**2. Email al Admin:**
- ✅ Notificación de nueva suscripción o renovación
- ✅ Información completa del cliente
- ✅ Detalles del plan y frecuencia
- ✅ Próxima fecha de entrega
- ✅ Lista de tareas administrativas
- ✅ Enlace al panel de admin

### Flujo técnico:
1. MercadoPago procesa el pago de suscripción
2. Webhook `/api/subscriptions/webhook` recibe notificación
3. Se actualiza la suscripción y se crea la próxima entrega
4. Si el pago es `approved`, se envían emails personalizados
5. Se detecta automáticamente si es primera activación o renovación

## 📬 Email de Newsletter

**Template de bienvenida:**
- ✅ Email de bienvenida para nuevos suscriptores
- ✅ Lista de beneficios del newsletter
- ✅ Oferta de bienvenida con código de descuento
- ✅ Enlaces a productos y WhatsApp
- ✅ Link de cancelar suscripción

**Uso:**
```typescript
import { sendEmail, renderNewsletterWelcomeEmail } from '@/lib/emails/resend'

await sendEmail({
  to: email,
  subject: '🍷 ¡Bienvenido a Vino Rodante!',
  html: renderNewsletterWelcomeEmail({ email })
})
```

## 🎨 Templates Disponibles

### 1. `renderCustomerOrderEmail()` - Para compradores
- Header con branding Vino Rodante
- Saludo personalizado
- Detalles del pedido en tabla
- Información de próximos pasos
- Botón de WhatsApp

### 2. `renderAdminOrderEmail()` - Para vendedores  
- Header administrativo
- Información completa del cliente
- Detalles de la venta
- Lista de tareas pendientes
- Enlace al panel de admin

### 3. `renderSubscriptionEmail()` - Para suscriptores
- Template adaptativo (primera vez / renovación)
- Detalles de la suscripción
- Fecha de próxima entrega
- Enlaces de gestión

### 4. `renderAdminSubscriptionEmail()` - Para admin de suscripciones
- Notificación de activación/renovación
- Información completa del plan
- Tareas administrativas pendientes

### 5. `renderNewsletterWelcomeEmail()` - Para newsletter
- Bienvenida para nuevos suscriptores
- Oferta especial
- Enlaces útiles

## 🔧 Funciones Helper

### `sendEmail(params)`
```typescript
interface SendEmailParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string // Default: 'Vino Rodante <info@vinorodante.com>'
}
```

## ⚡ Características del Sistema

1. **Resiliente**: Los emails no bloquean los webhooks si fallan
2. **Paralelo**: Emails a cliente y admin se envían simultáneamente
3. **Personalizado**: Templates diferentes según el contexto
4. **Professional**: Diseño responsive y consistente con la marca
5. **Informativo**: Incluye todos los detalles necesarios
6. **Actionable**: Botones y enlaces para próximos pasos

## 📝 Próximos pasos recomendados

1. **Testing**: Probar con compras reales en modo test de MercadoPago
2. **Monitoreo**: Agregar logs detallados de envío de emails
3. **Templates adicionales**: 
   - Email de envío/tracking
   - Email de entrega completada
   - Email de reseña/feedback
4. **Personalización**: Agregar más opciones de personalización
5. **Analytics**: Tracking de apertura y clics en emails

## 🚨 Notas Importantes

- Todos los emails usan HTML completo para mejor compatibilidad
- El sistema maneja errores sin afectar la funcionalidad core
- Los webhooks siempre responden con 200 OK para evitar reintentos
- El email del admin siempre es `info@vinorodante.com`
- Los templates son responsive y se ven bien en móviles
