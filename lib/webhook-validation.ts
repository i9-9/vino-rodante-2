import crypto from 'crypto'

/**
 * Validates MercadoPago webhook signature using their official validation method
 * @param body - Raw request body as string
 * @param signature - x-signature header value
 * @param requestId - x-request-id header value
 * @param dataId - ID from the webhook data
 * @returns boolean indicating if signature is valid
 */
export function validateMercadoPagoSignature(
  body: string,
  signature: string | null,
  requestId: string | null,
  dataId: string | null
): boolean {
  if (!signature || !process.env.MP_SECRET) {
    console.warn('Missing signature or MP_SECRET for webhook validation')
    return false
  }

  try {
    // Parse the signature header: ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839
    const signatureParts = signature.split(',')
    let ts: string | null = null
    let v1: string | null = null

    for (const part of signatureParts) {
      const [key, value] = part.split('=')
      if (key === 'ts') ts = value
      if (key === 'v1') v1 = value
    }

    if (!ts || !v1) {
      console.error('Invalid signature format - missing ts or v1')
      return false
    }

    // Build the validation string: id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    const validationParts = []
    
    if (dataId) {
      validationParts.push(`id:${dataId}`)
    }
    
    if (requestId) {
      validationParts.push(`request-id:${requestId}`)
    }
    
    validationParts.push(`ts:${ts}`)
    
    const validationString = validationParts.join(';') + ';'

    // Generate HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.MP_SECRET)
      .update(validationString)
      .digest('hex')

    // Compare signatures
    const isValid = expectedSignature === v1
    
    if (!isValid) {
      console.error('Webhook signature validation failed', {
        expected: expectedSignature,
        received: v1,
        validationString
      })
    }

    return isValid
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}
