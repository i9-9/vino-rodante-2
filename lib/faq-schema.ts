// FAQ Schema for better SEO and rich snippets
export interface FAQItem {
  question: string
  answer: string
}

// Función para obtener información específica por varietal
const getVarietalSpecificInfo = (varietal: string, region: string) => {
  const varietalLower = varietal.toLowerCase()
  
  // Malbec
  if (varietalLower.includes('malbec')) {
    return {
      maridaje: 'El Malbec argentino es versátil y elegante.',
      guarda: 'El Malbec tiene excelente potencial de guarda.',
      evolucion: 'El Malbec evoluciona muy bien en botella.'
    }
  }
  
  // Cabernet Sauvignon
  if (varietalLower.includes('cabernet')) {
    return {
      maridaje: 'El Cabernet Sauvignon es robusto y estructurado.',
      guarda: 'El Cabernet Sauvignon es ideal para la guarda.',
      evolucion: 'El Cabernet Sauvignon mejora notablemente con el tiempo.'
    }
  }
  
  // Bonarda
  if (varietalLower.includes('bonarda')) {
    return {
      maridaje: 'La Bonarda es suave y frutal.',
      guarda: 'La Bonarda se disfruta mejor joven.',
      evolucion: 'La Bonarda está pensada para beber pronto.'
    }
  }
  
  // Syrah
  if (varietalLower.includes('syrah')) {
    return {
      maridaje: 'El Syrah es especiado y complejo.',
      guarda: 'El Syrah tiene buen potencial de guarda.',
      evolucion: 'El Syrah desarrolla aromas terciarios con el tiempo.'
    }
  }
  
  // Torrontés
  if (varietalLower.includes('torrontés') || varietalLower.includes('torrontes')) {
    return {
      maridaje: 'El Torrontés es aromático y fresco.',
      guarda: 'El Torrontés se consume mejor joven.',
      evolucion: 'El Torrontés mantiene su frescura por poco tiempo.'
    }
  }
  
  // Chardonnay
  if (varietalLower.includes('chardonnay')) {
    return {
      maridaje: 'El Chardonnay es elegante y versátil.',
      guarda: 'El Chardonnay puede guardarse algunos años.',
      evolucion: 'El Chardonnay desarrolla complejidad con la guarda.'
    }
  }
  
  // Pinot Noir
  if (varietalLower.includes('pinot')) {
    return {
      maridaje: 'El Pinot Noir es delicado y elegante.',
      guarda: 'El Pinot Noir tiene potencial de guarda moderado.',
      evolucion: 'El Pinot Noir evoluciona sutilmente en botella.'
    }
  }
  
  // Default para otros varietales
  return {
    maridaje: '',
    guarda: '',
    evolucion: ''
  }
}

export const generateFAQStructuredData = (faqs: FAQItem[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// Función para generar FAQs específicas por categoría y varietal
const getCategorySpecificFAQs = (productName: string, region: string, varietal?: string, category?: string): FAQItem[] => {
  const categoryLower = category?.toLowerCase() || ''
  const varietalLower = varietal?.toLowerCase() || ''
  
  // FAQs para vinos tintos
  if (categoryLower.includes('tinto') || categoryLower.includes('red')) {
    const varietalSpecific = getVarietalSpecificInfo(varietalLower, region)
    
    return [
      {
        question: `¿Cómo se guarda el ${productName}?`,
        answer: `Guardá el ${productName} en un lugar fresco, seco y oscuro, entre 12-18°C. Mantené la botella acostada para que el corcho se mantenga húmedo y el vino evolucione correctamente. Evitá cambios bruscos de temperatura que puedan afectar su estructura.`
      },
      {
        question: `¿A qué temperatura se sirve el ${productName}?`,
        answer: `Serví el ${productName} entre 16-18°C. Esta temperatura permite que los aromas se expresen correctamente sin que el alcohol domine el paladar. Si es un vino joven, decantalo 30 minutos antes; si es añejo, decantalo con cuidado para separar sedimentos.`
      },
      {
        question: `¿Con qué comidas puedo acompañar el ${productName}?`,
        answer: `${varietalSpecific.maridaje} El ${productName} de ${region}${varietal ? ` (${varietal})` : ''} acompaña bien con carnes rojas, asado argentino, cordero, quesos curados y pastas con salsas fuertes. También es perfecto para el locro y las empanadas caseras.`
      },
      {
        question: `¿Cuánto tiempo puedo guardar el ${productName}?`,
        answer: `${varietalSpecific.guarda} El ${productName} se puede guardar por varios años si se almacena correctamente. Los vinos jóvenes se consumen mejor dentro de 2-3 años, mientras que los reservas pueden mejorar hasta 10-15 años.`
      },
      {
        question: `¿Necesito decantar el ${productName}?`,
        answer: `Para vinos jóvenes, decantá el ${productName} 30 minutos antes de servir para que respire y se abran los aromas. Para vinos añejos (5+ años), decantalo con cuidado para separar sedimentos y suavizar los taninos.`
      },
      {
        question: `¿El ${productName} mejora con el tiempo?`,
        answer: `${varietalSpecific.evolucion} Los vinos jóvenes están pensados para beber pronto, mientras que los reservas pueden mejorar significativamente con la guarda. El ${productName} de ${region} generalmente tiene buen potencial de evolución.`
      }
    ]
  }
  
  // FAQs para vinos blancos
  if (categoryLower.includes('blanco') || categoryLower.includes('white')) {
    const varietalSpecific = getVarietalSpecificInfo(varietalLower, region)
    
    return [
      {
        question: `¿Cómo se guarda el ${productName}?`,
        answer: `Guardá el ${productName} en un lugar fresco, seco y oscuro, entre 8-12°C. Mantené la botella acostada o parada, pero siempre en un lugar estable. Evitá cambios bruscos de temperatura que puedan afectar su frescura.`
      },
      {
        question: `¿A qué temperatura se sirve el ${productName}?`,
        answer: `Serví el ${productName} entre 8-12°C. Esta temperatura permite que los aromas frutales se expresen sin que el frío excesivo los enmascare. Enfríalo en la heladera 2-3 horas antes de servir.`
      },
      {
        question: `¿Con qué comidas puedo acompañar el ${productName}?`,
        answer: `${varietalSpecific.maridaje} El ${productName} de ${region}${varietal ? ` (${varietal})` : ''} acompaña bien con pescados, mariscos, pollo, ensaladas frescas y quesos suaves. También es perfecto para el sushi y las comidas ligeras del verano argentino.`
      },
      {
        question: `¿Cuánto tiempo puedo guardar el ${productName}?`,
        answer: `${varietalSpecific.guarda} El ${productName} se debe consumir más rápido que los tintos. Los vinos blancos jóvenes se disfrutan mejor dentro de 1-2 años, mientras que los más complejos pueden guardarse hasta 3-5 años.`
      },
      {
        question: `¿Se puede servir con hielo el ${productName}?`,
        answer: `No recomendamos servir el ${productName} con hielo, ya que diluye el sabor y aromas. Es mejor enfriarlo bien en la heladera y servirlo a la temperatura correcta para disfrutar todos sus matices.`
      },
      {
        question: `¿El ${productName} es mejor en verano o invierno?`,
        answer: `El ${productName} es perfecto para el verano argentino, ideal para tomar fresco en días calurosos. También podés disfrutarlo en invierno con comidas ligeras, pescados o ensaladas frescas.`
      }
    ]
  }
  
  // FAQs para vinos rosados
  if (categoryLower.includes('rosado') || categoryLower.includes('rosé')) {
    return [
      {
        question: `¿Cómo se guarda el ${productName}?`,
        answer: `El ${productName} se debe guardar en un lugar fresco, seco y oscuro, preferentemente a una temperatura entre 10-14°C. Mantené la botella acostada para preservar sus características.`
      },
      {
        question: `¿A qué temperatura se sirve el ${productName}?`,
        answer: `La temperatura ideal para servir el ${productName} es entre 10-14°C. Servilo fresco pero no tan frío como un blanco, para disfrutar su equilibrio entre frescura y cuerpo.`
      },
      {
        question: `¿Con qué comidas puedo acompañar el ${productName}?`,
        answer: `El ${productName} de ${region}${varietal ? ` (${varietal})` : ''} es ideal para acompañar con ensaladas, pescados, pollo, jamón crudo, quesos suaves y platos de verano. Perfecto para el clima argentino.`
      },
      {
        question: `¿Cuánto tiempo puedo guardar el ${productName}?`,
        answer: `El ${productName} se debe consumir relativamente rápido, idealmente dentro de 1-2 años. Los rosados están pensados para beber jóvenes y frescos.`
      },
      {
        question: `¿Es mejor el ${productName} en verano o invierno?`,
        answer: `El ${productName} es perfecto para el verano argentino, ideal para tomar fresco en días calurosos. También podés disfrutarlo en invierno con comidas ligeras.`
      }
    ]
  }
  
  // FAQs para espumantes
  if (categoryLower.includes('espumante') || categoryLower.includes('champagne') || categoryLower.includes('sparkling')) {
    return [
      {
        question: `¿Cómo se guarda el ${productName}?`,
        answer: `Guardá el ${productName} en un lugar fresco, seco y oscuro, entre 8-12°C. Mantené la botella parada para preservar las burbujas y evitá movimientos bruscos que puedan afectar la efervescencia.`
      },
      {
        question: `¿A qué temperatura se sirve el ${productName}?`,
        answer: `Serví el ${productName} entre 6-8°C, bien frío. Esta temperatura permite que las burbujas se mantengan vivas y los aromas se expresen correctamente. Enfríalo en la heladera 3-4 horas antes o en hielo 20-30 minutos.`
      },
      {
        question: `¿Con qué comidas puedo acompañar el ${productName}?`,
        answer: `El ${productName} de ${region}${varietal ? ` (${varietal})` : ''} acompaña bien con mariscos, sushi, quesos suaves, frutas frescas y postres. También es perfecto para celebraciones, brindis y momentos especiales como el Año Nuevo argentino.`
      },
      {
        question: `¿Cuánto tiempo puedo guardar el ${productName}?`,
        answer: `El ${productName} se debe consumir relativamente rápido, idealmente dentro de 1-2 años. Los espumantes están pensados para beber frescos y con sus burbujas intactas, por eso no recomendamos guardarlos por mucho tiempo.`
      },
      {
        question: `¿Cómo abro el ${productName} correctamente?`,
        answer: `Para abrir el ${productName}, mantené la botella inclinada a 45°, retirá la cápsula, sujetá el corcho firmemente y girá la botella (no el corcho) hasta que salga con un sonido suave. Nunca apuntes hacia nadie.`
      },
      {
        question: `¿Qué pasa si el ${productName} pierde las burbujas?`,
        answer: `Si el ${productName} pierde las burbujas, puede ser por almacenamiento incorrecto, cambios de temperatura o tiempo excesivo. Los espumantes deben consumirse frescos para mantener su efervescencia característica.`
      }
    ]
  }
  
  // FAQs para boxes de vinos
  if (categoryLower.includes('box') || categoryLower.includes('boxes')) {
    return [
      {
        question: `¿Qué contiene el ${productName}?`,
        answer: `El ${productName} incluye una selección curada de vinos argentinos premium. Cada box viene con información detallada sobre cada vino, sugerencias de acompañamiento, datos de las bodegas y guía de cata para que disfrutes cada botella al máximo.`
      },
      {
        question: `¿Cómo se guarda el ${productName}?`,
        answer: `Guardá el ${productName} en un lugar fresco, seco y oscuro. Cada vino dentro del box debe almacenarse según sus características específicas, pero el conjunto se mantiene estable en las mismas condiciones de temperatura y humedad.`
      },
      {
        question: `¿Cuánto tiempo puedo guardar el ${productName}?`,
        answer: `El ${productName} se puede guardar por varios años. Cada vino dentro del box tiene su tiempo de guarda específico, pero como conjunto podés disfrutarlo gradualmente durante 2-3 años, siguiendo las recomendaciones de cada vino.`
      },
      {
        question: `¿Es mejor abrir todos los vinos del ${productName} juntos?`,
        answer: `No, es mejor abrir los vinos del ${productName} gradualmente. Cada uno tiene su momento ideal para beber. Seguí las recomendaciones de cada vino para disfrutar la experiencia completa y comparar diferentes estilos.`
      },
      {
        question: `¿El ${productName} es bueno para regalar?`,
        answer: `¡Sí! El ${productName} es perfecto para regalar. Viene con presentación elegante, información educativa y una selección que sorprende. Ideal para amantes del vino o para introducir a alguien en el mundo del vino argentino.`
      },
      {
        question: `¿Puedo elegir los vinos del ${productName}?`,
        answer: `El ${productName} viene con una selección curada por nuestros tomadores profesionales. Si tenés preferencias específicas, contactanos y podemos sugerirte boxes personalizados o ayudarte a elegir vinos individuales.`
      }
    ]
  }
  
  // FAQs genéricas para otras categorías
  return [
    {
      question: `¿Cómo se guarda el ${productName}?`,
      answer: `El ${productName} se debe guardar en un lugar fresco, seco y oscuro, preferentemente a una temperatura entre 12-18°C. Mantené la botella acostada para que el corcho se mantenga húmedo.`
    },
    {
      question: `¿A qué temperatura se sirve el ${productName}?`,
      answer: `La temperatura ideal para servir el ${productName} es entre 16-18°C. Para una experiencia óptima, dejalo reposar unos minutos antes de servir.`
    },
    {
      question: `¿Con qué comidas puedo acompañar el ${productName}?`,
      answer: `El ${productName} de ${region}${varietal ? ` (${varietal})` : ''} es ideal para acompañar con carnes rojas, quesos curados, pastas con salsas fuertes y platos de la cocina argentina tradicional como asado y empanadas.`
    },
    {
      question: `¿Cuánto tiempo puedo guardar el ${productName}?`,
      answer: `El ${productName} se puede guardar por varios años si se almacena correctamente. Para vinos jóvenes, consumilo dentro de 2-3 años. Para reservas, pueden mejorar con el tiempo.`
    }
  ]
}

// Predefined FAQ sets for different page types
export const faqConfigs = {
  product: (productName: string, region: string, varietal?: string, category?: string): FAQItem[] => {
    // FAQs específicas por categoría
    const categoryFAQs = getCategorySpecificFAQs(productName, region, varietal, category)
    
    // FAQs comunes para todos los productos
    const commonFAQs: FAQItem[] = [
      {
        question: `¿Hacen envíos a todo el país?`,
        answer: `Sí, llevamos nuestros vinos a todo el país. Los tiempos de entrega varían según la ubicación, pero generalmente llegamos en 2-5 días hábiles. El envío es gratis en compras superiores a $5000, para que disfrutes sin complicaciones.`
      },
      {
        question: `¿Qué garantía tienen los vinos?`,
        answer: `Todos nuestros vinos están garantizados. Si recibís un producto en mal estado o que no cumple con las expectativas, te lo reemplazamos sin costo adicional. Contactanos y resolvemos el problema rápidamente, porque tu satisfacción es nuestra prioridad.`
      },
      {
        question: `¿Puedo cancelar mi pedido?`,
        answer: `Podés cancelar tu pedido antes de que sea enviado. Una vez que el pedido esté en camino, no podemos cancelarlo, pero podés devolverlo siguiendo nuestra política de devoluciones. Siempre buscamos la mejor solución para vos.`
      },
      {
        question: `¿Cómo puedo contactar con atención al cliente?`,
        answer: `Podés contactarnos por WhatsApp, email o completando el formulario de contacto en nuestra página. Nuestro equipo está disponible para ayudarte con cualquier consulta sobre nuestros vinos y para que tengas la mejor experiencia.`
      }
    ]
    
    return [...categoryFAQs, ...commonFAQs]
  },
  
  weeklyWine: (clubType: string): FAQItem[] => [
    {
      question: `¿Cómo funciona el Club de Vino ${clubType}?`,
      answer: `El Club de Vino ${clubType} te entrega vinos cuidadosamente seleccionados cada semana. Recibís 2 botellas de ${clubType} premium con información detallada sobre cada vino y sugerencias de acompañamiento.`
    },
    {
      question: `¿Puedo pausar mi suscripción?`,
      answer: `Sí, podés pausar tu suscripción en cualquier momento desde tu cuenta. No hay penalizaciones y podés reactivarla cuando quieras.`
    },
    {
      question: `¿Qué pasa si no me gusta un vino?`,
      answer: `Si no estás conforme con algún vino, contactanos y te enviamos un reemplazo sin costo adicional. Tu satisfacción es nuestra prioridad.`
    },
    {
      question: `¿Puedo cambiar el tipo de club?`,
      answer: `Sí, podés cambiar entre Club Tinto, Blanco, Mixto o Naranjo en cualquier momento desde tu panel de usuario.`
    },
    {
      question: `¿Hay descuentos por suscripción anual?`,
      answer: `Sí, ofrecemos descuentos especiales para suscripciones trimestrales y anuales. Consultá los precios en la página de suscripciones.`
    }
  ],
  
  general: (): FAQItem[] => [
    {
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), MercadoPago, transferencia bancaria y efectivo en puntos de pago."
    },
    {
      question: "¿Hacen envíos a todo el país?",
      answer: "Sí, hacemos envíos a todas las provincias de Argentina. Los tiempos de entrega varían según la ubicación, generalmente entre 2-5 días hábiles."
    },
    {
      question: "¿Qué garantías ofrecen?",
      answer: "Garantizamos la calidad de todos nuestros vinos. Si recibís un producto en mal estado o que no cumple con tus expectativas, te lo reemplazamos sin costo."
    },
    {
      question: "¿Puedo hacer pedidos personalizados?",
      answer: "Sí, trabajamos con bodegas de todo el país y podemos ayudarte a encontrar vinos específicos. Contactanos con tus requerimientos."
    },
    {
      question: "¿Ofrecen degustaciones o eventos?",
      answer: "Sí, organizamos degustaciones virtuales y eventos presenciales. Suscribite a nuestro newsletter para recibir invitaciones a eventos exclusivos."
    }
  ]
}

// Component to render FAQ section
export const renderFAQSection = (faqs: FAQItem[], title: string = "Preguntas Frecuentes") => {
  return {
    title,
    faqs: faqs.map(faq => ({
      ...faq,
      id: faq.question.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }))
  }
}

