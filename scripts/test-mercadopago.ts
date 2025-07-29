#!/usr/bin/env tsx

import { MercadoPagoConfig, Preference } from 'mercadopago';

// Verificar variables de entorno
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

if (!accessToken) {
  console.error('❌ MERCADO_PAGO_ACCESS_TOKEN no está configurada');
  process.exit(1);
}

if (!publicKey) {
  console.error('❌ NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY no está configurada');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas correctamente');

// Inicializar MercadoPago
const mp = new MercadoPagoConfig({ accessToken });

async function testPreferenceCreation() {
  try {
    console.log('\n🧪 Probando creación de preferencia...');
    
    const preference = new Preference(mp);
    const testItems = [
      {
        id: 'test-product-1',
        title: 'Vino de Prueba',
        quantity: 1,
        unit_price: 1000,
        currency_id: 'ARS'
      }
    ];

    const preferenceData = {
      body: {
        items: testItems,
        payer: {
          email: 'test@example.com'
        },
        external_reference: 'test-order-123',
        back_urls: {
          success: 'http://localhost:3000/checkout/confirmation',
          failure: 'http://localhost:3000/checkout?error=payment_failed',
          pending: 'http://localhost:3000/checkout/pending'
        },
        auto_return: 'approved',
        statement_descriptor: 'Vino Rodante Test'
      }
    };

    const result = await preference.create(preferenceData);
    
    console.log('✅ Preferencia creada exitosamente');
    console.log('📋 ID de preferencia:', result.id);
    console.log('🔗 URL de pago:', result.init_point);
    
    return result;
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error);
    throw error;
  }
}

async function testPaymentStatus() {
  try {
    console.log('\n🧪 Probando obtención de estado de pago...');
    
    // Crear una preferencia primero
    const preference = await testPreferenceCreation();
    
    // Simular un pago de prueba (esto requeriría un payment_id real)
    console.log('ℹ️  Para probar el estado de pago, necesitas un payment_id real');
    console.log('ℹ️  Puedes obtenerlo realizando una compra de prueba');
    
    return preference;
  } catch (error) {
    console.error('❌ Error al probar estado de pago:', error);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Iniciando pruebas de MercadoPago...\n');
    
    await testPreferenceCreation();
    await testPaymentStatus();
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configura las variables de entorno en tu .env.local');
    console.log('2. Inicia el servidor de desarrollo: npm run dev');
    console.log('3. Prueba el checkout con las tarjetas de prueba');
    console.log('4. Configura ngrok para probar webhooks localmente');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests();
}

export { testPreferenceCreation, testPaymentStatus }; 