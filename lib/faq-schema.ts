// FAQ Schema for better SEO and rich snippets
export interface FAQItem {
  question: string
  answer: string
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

// Predefined FAQ sets for different page types
export const faqConfigs = {
  product: (productName: string, region: string, varietal?: string): FAQItem[] => [
    {
      question: `¿Cómo se almacena el ${productName}?`,
      answer: `El ${productName} debe almacenarse en un lugar fresco, seco y oscuro, preferiblemente a una temperatura entre 12-18°C. Mantén la botella horizontal para que el corcho permanezca húmedo.`
    },
    {
      question: `¿Cuál es la temperatura ideal para servir el ${productName}?`,
      answer: `La temperatura ideal para servir el ${productName} es entre 16-18°C. Para una experiencia óptima, déjalo reposar unos minutos antes de servir.`
    },
    {
      question: `¿Con qué alimentos puedo maridar el ${productName}?`,
      answer: `El ${productName} de ${region}${varietal ? ` (${varietal})` : ''} es ideal para maridar con carnes rojas, quesos curados, pastas con salsas robustas y platos de la cocina argentina tradicional.`
    },
    {
      question: `¿Cuánto tiempo puedo conservar el ${productName}?`,
      answer: `El ${productName} puede conservarse por varios años si se almacena correctamente. Para vinos jóvenes, consume dentro de 2-3 años. Para reservas, pueden mejorar con el tiempo.`
    },
    {
      question: `¿Ofrecen envío a domicilio?`,
      answer: `Sí, realizamos envíos a todo el país. El tiempo de entrega varía según la ubicación, generalmente entre 2-5 días hábiles. Consulta los costos de envío en el checkout.`
    }
  ],
  
  weeklyWine: (clubType: string): FAQItem[] => [
    {
      question: `¿Cómo funciona el Club de Vino ${clubType}?`,
      answer: `El Club de Vino ${clubType} te entrega vinos cuidadosamente seleccionados cada semana. Recibes 2 botellas de ${clubType} premium con información detallada sobre cada vino y sugerencias de maridaje.`
    },
    {
      question: `¿Puedo pausar mi suscripción?`,
      answer: `Sí, puedes pausar tu suscripción en cualquier momento desde tu cuenta. No hay penalizaciones y puedes reactivarla cuando desees.`
    },
    {
      question: `¿Qué pasa si no me gusta un vino?`,
      answer: `Si no estás satisfecho con algún vino, contáctanos y te enviaremos un reemplazo sin costo adicional. Tu satisfacción es nuestra prioridad.`
    },
    {
      question: `¿Puedo cambiar el tipo de club?`,
      answer: `Sí, puedes cambiar entre Club Tinto, Blanco, Mixto o Naranjo en cualquier momento desde tu panel de usuario.`
    },
    {
      question: `¿Hay descuentos por suscripción anual?`,
      answer: `Sí, ofrecemos descuentos especiales para suscripciones trimestrales y anuales. Consulta los precios en la página de suscripciones.`
    }
  ],
  
  general: (): FAQItem[] => [
    {
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), MercadoPago, transferencia bancaria y efectivo en puntos de pago."
    },
    {
      question: "¿Realizan envíos a todo el país?",
      answer: "Sí, realizamos envíos a todas las provincias de Argentina. Los tiempos de entrega varían según la ubicación, generalmente entre 2-5 días hábiles."
    },
    {
      question: "¿Qué garantías ofrecen?",
      answer: "Garantizamos la calidad de todos nuestros vinos. Si recibes un producto en mal estado o que no cumple con tus expectativas, te lo reemplazamos sin costo."
    },
    {
      question: "¿Puedo hacer pedidos personalizados?",
      answer: "Sí, trabajamos con bodegas de todo el país y podemos ayudarte a encontrar vinos específicos. Contáctanos con tus requerimientos."
    },
    {
      question: "¿Ofrecen degustaciones o eventos?",
      answer: "Sí, organizamos degustaciones virtuales y eventos presenciales. Suscríbete a nuestro newsletter para recibir invitaciones a eventos exclusivos."
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

