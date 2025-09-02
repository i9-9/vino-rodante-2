# 📦 Flujo de Estados de Compra - Vino Rodante

## 🔄 Estados de Órdenes

### Estados Principales
```typescript
type OrderStatus = 
  | 'pending'      // Pendiente de pago
  | 'paid'         // Pagado
  | 'in_preparation' // En preparación
  | 'shipped'      // Enviado
  | 'delivered'    // Entregado
  | 'cancelled'    // Cancelado
  | 'refunded'     // Reembolsado
```

### Estados de Pago
```typescript
type PaymentStatus = 
  | 'pending'      // Pendiente
  | 'paid'         // Pagado
  | 'failed'       // Fallido
  | 'refunded'     // Reembolsado
```

---

## 🚀 Flujo Completo de Estados

### 1. **Creación de Orden** → `pending`
- Usuario completa checkout
- Se crea orden con estado `pending`
- Se crea preferencia en MercadoPago
- Usuario es redirigido a MercadoPago

### 2. **Procesamiento de Pago** (Webhook de MercadoPago)

#### ✅ **Pago Aprobado** → `paid`
```typescript
case "approved":
  orderStatus = "paid"
  orderNotes = `Payment approved. Payment ID: ${paymentId}`
```
- **Acciones automáticas:**
  - Email de confirmación al cliente
  - Email de notificación al admin
  - Actualización de stock (si aplica)

#### ❌ **Pago Rechazado** → `cancelled`
```typescript
case "rejected":
  orderStatus = "cancelled"
  orderNotes = `Payment rejected. Payment ID: ${paymentId}`
```

#### 🔄 **Pago en Proceso** → `pending`
```typescript
case "in_process":
  orderStatus = "pending"
  orderNotes = `Payment in process. Payment ID: ${paymentId}`
```

#### ⏳ **Pago Pendiente** → `pending`
```typescript
case "pending":
  orderStatus = "pending"
  orderNotes = `Payment pending. Payment ID: ${paymentId}`
```

#### 💰 **Reembolso** → `refunded`
```typescript
case "refunded":
  orderStatus = "refunded"
  orderNotes = `Payment refunded. Payment ID: ${paymentId}`
```

### 3. **Gestión Manual por Admin**

#### 📦 **En Preparación** → `in_preparation`
- Admin marca orden como "En preparación"
- Se envía email de notificación al cliente
- Orden lista para empaque

#### 🚚 **Enviado** → `shipped`
- Admin marca orden como "Enviado"
- Se envía email con tracking (si aplica)
- Cliente puede rastrear su pedido

#### ✅ **Entregado** → `delivered`
- Admin confirma entrega
- Se envía email de confirmación
- Orden completada

#### ❌ **Cancelado** → `cancelled`
- Admin cancela orden
- Se procesa reembolso si aplica
- Se envía email de cancelación

---

## 🎯 Transiciones de Estado

### Automáticas (Webhooks)
```
pending → paid (pago aprobado)
pending → cancelled (pago rechazado)
paid → refunded (reembolso)
```

### Manuales (Admin)
```
paid → in_preparation
in_preparation → shipped
shipped → delivered
paid → cancelled (cancelación manual)
```

---

## 📧 Notificaciones por Estado

### Estados que Envían Emails

#### ✅ **Pago Aprobado** (`paid`)
- **Cliente**: Email de confirmación con detalles del pedido
- **Admin**: Email de notificación de nueva venta

#### 📦 **Cambios de Estado** (Admin)
- **Cliente**: Email de actualización de estado
- **Contenido**: "Tu pedido está ahora en estado: [ESTADO]"

#### ❌ **Cancelación/Reembolso**
- **Cliente**: Email de cancelación con detalles del reembolso

---

## 🛠️ Implementación Técnica

### Webhook Handler
```typescript
// app/api/webhooks/mercadopago/route.ts
switch (paymentData.status) {
  case "approved":
    orderStatus = "paid"
    // Enviar emails automáticamente
    break
  case "rejected":
    orderStatus = "cancelled"
    break
  // ... otros casos
}
```

### Admin Actions
```typescript
// app/account/actions/admin-orders.ts
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  // 1. Verificar permisos de admin
  // 2. Actualizar estado en BD
  // 3. Enviar email de notificación
  // 4. Revalidar caché
}
```

### Validación de Estados
```typescript
// app/account/utils/validation.ts
export const validateOrderStatus = (status: string): boolean => {
  return ['pending', 'paid', 'in_preparation', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)
}
```

---

## 🎨 UI/UX por Estado

### Badges de Estado
```typescript
const ORDER_STATUS_MAP = {
  pending: { label: 'Pendiente de pago', variant: 'secondary' },
  paid: { label: 'Pagado', variant: 'default' },
  in_preparation: { label: 'En preparación', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'default' },
  delivered: { label: 'Entregado', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
  refunded: { label: 'Reembolsado', variant: 'destructive' }
}
```

### Selector de Estados (Admin)
- Dropdown con todos los estados válidos
- Validación en tiempo real
- Confirmación antes de cambios críticos

---

## 📊 Métricas y Monitoreo

### Estados Críticos para Monitorear
- **`pending`** por más de 24h → Posible problema de pago
- **`paid`** por más de 48h sin avanzar → Revisar logística
- **`shipped`** por más de 7 días → Verificar entrega

### Alertas Recomendadas
- Órdenes en `pending` > 24h
- Órdenes en `paid` > 48h sin preparación
- Órdenes en `shipped` > 7 días sin entrega

---

## 🔧 Configuración de Producción

### Variables de Entorno Críticas
```bash
# Webhook URL para MercadoPago
NEXT_PUBLIC_APP_URL=https://www.vinorodante.com

# Email notifications
RESEND_API_KEY=your_resend_key
EMAIL_FROM=Vino Rodante <info@vinorodante.com>
EMAIL_ADMIN=admin@vinorodante.com
```

### Webhook Configuration
- **URL**: `https://www.vinorodante.com/api/webhooks/mercadopago`
- **Eventos**: `payment`, `merchant_order`
- **Timeout**: 30 segundos
- **Retry**: 3 intentos

---

## ✅ Checklist de Verificación

### Pre-Producción
- [ ] Webhook URL configurada en MercadoPago
- [ ] Emails de prueba funcionando
- [ ] Estados de orden validados
- [ ] Permisos de admin verificados

### Post-Lanzamiento
- [ ] Monitorear webhooks de MercadoPago
- [ ] Verificar emails automáticos
- [ ] Probar flujo completo de compra
- [ ] Validar cambios de estado manuales

---

**Última actualización:** ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}

