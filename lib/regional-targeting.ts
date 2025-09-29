// Regional targeting configuration for Argentine market
export const argentineProvinces = {
  'buenos-aires': {
    name: 'Buenos Aires',
    capital: 'La Plata',
    keywords: ['vinos buenos aires', 'delivery vino caba', 'envío vino buenos aires'],
    description: 'Envío gratis de vinos a Buenos Aires y CABA. Los mejores vinos argentinos directo a tu casa.',
    searchTerms: ['vino online buenos aires', 'comprar vino caba', 'delivery vino zona sur', 'vino zona norte']
  },
  'cordoba': {
    name: 'Córdoba',
    capital: 'Córdoba',
    keywords: ['vinos córdoba', 'delivery vino córdoba', 'envío vino córdoba capital'],
    description: 'Vinos premium con envío a Córdoba. Selección curada de los mejores vinos argentinos.',
    searchTerms: ['vino online córdoba', 'comprar vino córdoba', 'delivery vino villa carlos paz']
  },
  'santa-fe': {
    name: 'Santa Fe',
    capital: 'Santa Fe',
    keywords: ['vinos santa fe', 'delivery vino rosario', 'envío vino santa fe capital'],
    description: 'Delivery de vinos premium en Santa Fe y Rosario. Calidad garantizada.',
    searchTerms: ['vino online santa fe', 'comprar vino rosario', 'delivery vino rafaela']
  },
  'mendoza': {
    name: 'Mendoza',
    capital: 'Mendoza',
    keywords: ['vinos mendoza', 'delivery vino mendoza', 'vinos locales mendoza'],
    description: 'En el corazón del vino argentino. Vinos de Mendoza y otras regiones premium.',
    searchTerms: ['vino online mendoza', 'comprar vino local mendoza', 'delivery vino maipú']
  },
  'tucuman': {
    name: 'Tucumán',
    capital: 'San Miguel de Tucumán',
    keywords: ['vinos tucumán', 'delivery vino tucumán', 'envío vino san miguel'],
    description: 'Vinos premium con envío a Tucumán. Descubrí la mejor selección de Argentina.',
    searchTerms: ['vino online tucumán', 'comprar vino san miguel de tucumán']
  },
  'salta': {
    name: 'Salta',
    capital: 'Salta',
    keywords: ['vinos salta', 'delivery vino salta', 'vinos altura salta'],
    description: 'Vinos de altura y otras regiones premium con envío a Salta.',
    searchTerms: ['vino online salta', 'comprar vino salta capital', 'vinos torrontés salta']
  }
} as const

export const wineRegions = {
  mendoza: {
    name: 'Mendoza',
    subregions: ['Maipú', 'Luján de Cuyo', 'Valle de Uco', 'San Rafael'],
    specialties: ['Malbec', 'Cabernet Sauvignon', 'Chardonnay'],
    description: 'La región vitivinícola más importante de Argentina, conocida mundialmente por sus Malbec.'
  },
  salta: {
    name: 'Salta',
    subregions: ['Cafayate', 'Molinos', 'Animaná'],
    specialties: ['Torrontés', 'Malbec de altura', 'Cabernet Sauvignon'],
    description: 'Vinos de altura únicos, especialmente reconocidos por el Torrontés aromático.'
  },
  'san-juan': {
    name: 'San Juan',
    subregions: ['Pedernal', 'Tulum', 'Ullum'],
    specialties: ['Syrah', 'Bonarda', 'Chardonnay'],
    description: 'Segunda región vitivinícola de Argentina, destacada por vinos tintos robustos.'
  },
  'la-rioja': {
    name: 'La Rioja',
    subregions: ['Chilecito', 'Famatina'],
    specialties: ['Torrontés Riojano', 'Malbec', 'Cabernet Sauvignon'],
    description: 'Cuna del Torrontés Riojano, con tradición vitivinícola centenaria.'
  },
  neuquen: {
    name: 'Neuquén',
    subregions: ['San Patricio del Chañar', 'Añelo'],
    specialties: ['Pinot Noir', 'Merlot', 'Sauvignon Blanc'],
    description: 'Región patagónica emergente con vinos de clima frío únicos.'
  },
  'rio-negro': {
    name: 'Río Negro',
    subregions: ['General Roca', 'Mainqué'],
    specialties: ['Pinot Noir', 'Merlot', 'Sauvignon Blanc'],
    description: 'Patagonia vitivinícola con vinos elegantes de clima frío.'
  }
} as const

export const localSeoKeywords = {
  primary: [
    'vinos argentinos online',
    'comprar vino argentina',
    'delivery vino argentina',
    'vinos premium argentina',
    'club de vino argentina',
    'suscripción vino argentina'
  ],
  regional: [
    'vinos malbec mendoza',
    'vinos torrontés salta',
    'vinos patagonia',
    'vinos altura argentina',
    'vinos orgánicos argentina',
    'vinos boutique argentina'
  ],
  ecommerce: [
    'tienda vinos online',
    'envío gratis vinos',
    'vinos con descuento',
    'ofertas vinos argentina',
    'vinos gift box',
    'regalos vinos premium'
  ]
} as const

export const generateRegionalMetadata = (province: keyof typeof argentineProvinces) => {
  const provinceData = argentineProvinces[province]

  return {
    title: `Vinos Premium con Envío a ${provinceData.name} | Vino Rodante`,
    description: provinceData.description,
    keywords: [
      ...provinceData.keywords,
      ...localSeoKeywords.primary,
      `vinos ${provinceData.name.toLowerCase()}`,
      `delivery ${provinceData.capital.toLowerCase()}`
    ],
    openGraph: {
      title: `Vinos Premium en ${provinceData.name} | Envío Gratis`,
      description: provinceData.description,
      url: `https://www.vinorodante.com/envios/${province}`,
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `Vino Rodante - Envío a ${provinceData.name}`
      }]
    }
  }
}

export const generateWineRegionMetadata = (region: keyof typeof wineRegions) => {
  const regionData = wineRegions[region]

  return {
    title: `Vinos de ${regionData.name} | Selección Premium | Vino Rodante`,
    description: `${regionData.description} Comprá online los mejores vinos de ${regionData.name}.`,
    keywords: [
      `vinos ${regionData.name.toLowerCase()}`,
      ...regionData.specialties.map(s => `${s.toLowerCase()} ${regionData.name.toLowerCase()}`),
      ...regionData.subregions.map(s => `vinos ${s.toLowerCase()}`),
      ...localSeoKeywords.primary
    ],
    openGraph: {
      title: `Vinos de ${regionData.name} | Terroir Único Argentino`,
      description: regionData.description,
      url: `https://www.vinorodante.com/regiones/${region}`,
      images: [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `Vinos de ${regionData.name} - Vino Rodante`
      }]
    }
  }
}

export const getLocalBusinessHours = () => {
  // Online store - always open
  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    opens: '00:00',
    closes: '23:59'
  }
}

export const getShippingAreas = () => {
  return Object.values(argentineProvinces).map(province => ({
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: '-34.6118', // Will need actual coordinates for each province
      longitude: '-58.3960'
    },
    geoRadius: '1000000', // Large radius to cover whole provinces
    name: province.name
  }))
}