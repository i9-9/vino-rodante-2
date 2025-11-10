/**
 * Sistema de logging estructurado para acciones de administrador
 * 
 * Proporciona logging consistente para auditoría y debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success'

interface LogContext {
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, any>
}

/**
 * Logger estructurado para acciones admin
 */
class AdminLogger {
  private formatLog(level: LogLevel, context: LogContext, message: string): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      ...context,
      message
    }

    // En desarrollo, usar console con colores
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        reset: '\x1b[0m'
      }
      
      const color = colors[level] || colors.reset
      console.log(`${color}[${level.toUpperCase()}]${colors.reset}`, JSON.stringify(logEntry, null, 2))
    } else {
      // En producción, usar console.log estructurado (puede ser capturado por servicios de logging)
      console.log(JSON.stringify(logEntry))
    }
  }

  info(context: LogContext, message: string): void {
    this.formatLog('info', context, message)
  }

  success(context: LogContext, message: string): void {
    this.formatLog('success', context, message)
  }

  warn(context: LogContext, message: string): void {
    this.formatLog('warn', context, message)
  }

  error(context: LogContext, message: string, error?: Error): void {
    const enhancedContext = {
      ...context,
      metadata: {
        ...context.metadata,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined
      }
    }
    this.formatLog('error', enhancedContext, message)
  }
}

// Instancia singleton
export const adminLogger = new AdminLogger()

/**
 * Helpers para logging común de acciones admin
 */
export const logAdminAction = {
  productCreated: (userId: string, productId: string, productName: string) => {
    adminLogger.success(
      { userId, action: 'product_created', resource: 'product', resourceId: productId },
      `Producto creado: ${productName}`
    )
  },

  productUpdated: (userId: string, productId: string, productName: string, changes?: Record<string, any>) => {
    adminLogger.info(
      { userId, action: 'product_updated', resource: 'product', resourceId: productId, metadata: { changes } },
      `Producto actualizado: ${productName}`
    )
  },

  productDeleted: (userId: string, productIds: string[]) => {
    adminLogger.warn(
      { userId, action: 'product_deleted', resource: 'product', metadata: { count: productIds.length } },
      `Producto(s) eliminado(s): ${productIds.length} producto(s)`
    )
  },

  productVisibilityToggled: (userId: string, productId: string, visible: boolean) => {
    adminLogger.info(
      { userId, action: 'product_visibility_toggled', resource: 'product', resourceId: productId },
      `Visibilidad cambiada: ${visible ? 'visible' : 'oculto'}`
    )
  },

  discountCreated: (userId: string, discountId: string, discountName: string) => {
    adminLogger.success(
      { userId, action: 'discount_created', resource: 'discount', resourceId: discountId },
      `Descuento creado: ${discountName}`
    )
  },

  discountUpdated: (userId: string, discountId: string, discountName: string) => {
    adminLogger.info(
      { userId, action: 'discount_updated', resource: 'discount', resourceId: discountId },
      `Descuento actualizado: ${discountName}`
    )
  },

  discountDeleted: (userId: string, discountId: string) => {
    adminLogger.warn(
      { userId, action: 'discount_deleted', resource: 'discount', resourceId: discountId },
      `Descuento eliminado`
    )
  },

  orderStatusUpdated: (userId: string, orderId: string, newStatus: string) => {
    adminLogger.info(
      { userId, action: 'order_status_updated', resource: 'order', resourceId: orderId, metadata: { newStatus } },
      `Estado de orden actualizado: ${newStatus}`
    )
  },

  orderDeleted: (userId: string, orderId: string) => {
    adminLogger.warn(
      { userId, action: 'order_deleted', resource: 'order', resourceId: orderId },
      `Orden eliminada: ${orderId}`
    )
  },

  orderNotesAdded: (userId: string, orderId: string) => {
    adminLogger.info(
      { userId, action: 'order_notes_added', resource: 'order', resourceId: orderId },
      `Notas agregadas a orden: ${orderId}`
    )
  },

  unauthorizedAccess: (userId: string | undefined, action: string) => {
    adminLogger.error(
      { userId, action: 'unauthorized_access', metadata: { attemptedAction: action } },
      `Intento de acceso no autorizado: ${action}`
    )
  },

  error: (userId: string | undefined, action: string, error: Error, context?: Record<string, any>) => {
    adminLogger.error(
      { userId, action, metadata: context },
      `Error en acción admin: ${action}`,
      error
    )
  }
}


