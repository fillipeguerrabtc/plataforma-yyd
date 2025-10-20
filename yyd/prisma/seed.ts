import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.auroraKnowledge.deleteMany();
  await prisma.auroraConversation.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.productActivity.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productSeasonPrice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.accountsPayable.deleteMany();
  await prisma.accountsReceivable.deleteMany();

  console.log('✅ Data cleared');

  // Create Guides
  console.log('👥 Creating guides...');
  const danielPonce = await prisma.guide.create({
    data: {
      name: 'Daniel Ponce',
      email: 'daniel@yesyoudeserve.tours',
      phone: '+351 123 456 789',
      languages: ['en', 'pt', 'es'],
      bio: 'Founder of Yes, You Deserve! Featured on ABC Good Morning America with Robin Roberts. 10+ years of expertise guiding travelers through the magic of Sintra.',
      photoUrl: '/assets/guides/daniel-ponce.jpg',
      certifications: ['Licensed Tour Guide', 'First Aid Certified', 'Electric Vehicle Specialist'],
      active: true,
    },
  });

  const danyellaSantos = await prisma.guide.create({
    data: {
      name: 'Danyella Santos',
      email: 'danyella@yesyoudeserve.tours',
      phone: '+351 987 654 321',
      languages: ['en', 'pt', 'es'],
      bio: 'Director and creative mind behind Yes, You Deserve. Creates all tour products and manages the entire company operations.',
      photoUrl: '/assets/guides/danyella-santos.jpg',
      certifications: ['Business Management', 'Tourism Product Development', 'Customer Experience Specialist'],
      active: true,
    },
  });

  console.log('✅ Guides created: Daniel Ponce, Danyella Santos');

  // === PRODUCT 1: PERSONALIZED HALF-DAY TOUR ===
  console.log('📦 Creating Product 1: Half-Day Tour...');
  const halfDayTour = await prisma.product.create({
    data: {
      slug: 'personalized-half-day-tour',
      titleEn: 'Sintra Half-Day Tuk Tuk Tour — Designed Around You',
      titlePt: 'Tour de Meio Dia em Tuk Tuk por Sintra — Personalizado para Você',
      titleEs: 'Tour de Medio Día en Tuk Tuk por Sintra — Diseñado para Ti',
      descriptionEn: 'Short on time but want the full Sintra experience? In just 4 hours, this private tuk tuk tour takes you through the region\'s most iconic spots and hidden gems — all adapted to your pace and interests on the day.',
      descriptionPt: 'Pouco tempo mas quer a experiência completa de Sintra? Em apenas 4 horas, este tour privado de tuk tuk leva você pelos pontos mais icônicos da região e joias escondidas — tudo adaptado ao seu ritmo e interesses do dia.',
      descriptionEs: '¿Poco tiempo pero quieres la experiencia completa de Sintra? En solo 4 horas, este tour privado en tuk tuk te lleva por los lugares más icónicos de la región y gemas escondidas — todo adaptado a tu ritmo e intereses del día.',
      durationHours: 4,
      maxGroupSize: 6,
      categoryEn: 'Private Tuk Tuk Tour',
      categoryPt: 'Tour Privado em Tuk Tuk',
      categoryEs: 'Tour Privado en Tuk Tuk',
      featuresEn: [
        'Private transportation',
        'Professional photography',
        'WiFi onboard',
        'Choose where to end',
        'Option 1: 1 monument inside + 1 activity',
        'Option 2: 3 activities (no monuments inside)',
      ],
      featuresPt: [
        'Transporte privado',
        'Fotografia profissional',
        'WiFi a bordo',
        'Escolha onde terminar',
        'Opção 1: 1 monumento por dentro + 1 atividade',
        'Opção 2: 3 atividades (sem entrar em monumentos)',
      ],
      featuresEs: [
        'Transporte privado',
        'Fotografía profesional',
        'WiFi a bordo',
        'Elige dónde terminar',
        'Opción 1: 1 monumento por dentro + 1 actividad',
        'Opción 2: 3 actividades (sin entrar en monumentos)',
      ],
      excludedEn: [
        'Entry/admission to monuments (if choosing Option 1)',
        'Wine tasting (€24/person additional)',
        'Transfer service (additional cost)',
        'Lunch (not included)',
      ],
      excludedPt: [
        'Entrada para monumentos (se escolher Opção 1)',
        'Degustação de vinho (€24/pessoa adicional)',
      ],
      excludedEs: [
        'Entrada a monumentos (si eliges Opción 1)',
        'Degustación de vino (€24/persona adicional)',
      ],
      imageUrls: [
        '/assets/tours/half-day-sintra-1.jpg',
        '/assets/tours/half-day-sintra-2.jpg',
        '/assets/tours/half-day-sintra-3.jpg',
      ],
      active: true,
      bestChoice: false,
    },
  });

  // Half-Day Pricing: Nov-Apr
  await prisma.productSeasonPrice.createMany({
    data: [
      {
        productId: halfDayTour.id,
        season: 'low',
        startMonth: 11, // November
        endMonth: 4, // April (excluding Dec 23 - Jan 1)
        tier: '1-4-people',
        minPeople: 1,
        maxPeople: 4,
        priceEur: 340,
        pricePerPerson: false,
      },
      {
        productId: halfDayTour.id,
        season: 'low',
        startMonth: 11,
        endMonth: 4,
        tier: '5-6-people',
        minPeople: 5,
        maxPeople: 6,
        priceEur: 85,
        pricePerPerson: true,
      },
      // Half-Day Pricing: May-Oct
      {
        productId: halfDayTour.id,
        season: 'high',
        startMonth: 5, // May
        endMonth: 10, // October (including Dec 23 - Jan 1)
        tier: '1-4-people',
        minPeople: 1,
        maxPeople: 4,
        priceEur: 400,
        pricePerPerson: false,
      },
      {
        productId: halfDayTour.id,
        season: 'high',
        startMonth: 5,
        endMonth: 10,
        tier: '5-6-people',
        minPeople: 5,
        maxPeople: 6,
        priceEur: 100,
        pricePerPerson: true,
      },
    ],
  });

  // Half-Day Options
  await prisma.productOption.createMany({
    data: [
      {
        productId: halfDayTour.id,
        nameEn: 'Option 1: Dive into Sintra\'s History',
        namePt: 'Opção 1: Mergulhe na História de Sintra',
        nameEs: 'Opción 1: Sumérgete en la Historia de Sintra',
        descriptionEn: 'Step inside one of Sintra\'s most iconic monuments and explore it in depth with your private guide. After your monument visit, enjoy one activity of your choice.',
        descriptionPt: 'Entre em um dos monumentos mais icônicos de Sintra e explore-o em profundidade com seu guia privado. Após a visita ao monumento, aproveite uma atividade de sua escolha.',
        descriptionEs: 'Entra en uno de los monumentos más icónicos de Sintra y explóralo en profundidad con tu guía privado. Después de la visita al monumento, disfruta de una actividad de tu elección.',
        sortOrder: 1,
        active: true,
      },
      {
        productId: halfDayTour.id,
        nameEn: 'Option 2: Embrace the Scenic Route',
        namePt: 'Opção 2: Abrace a Rota Panorâmica',
        nameEs: 'Opción 2: Abraza la Ruta Escénica',
        descriptionEn: 'Skip monument interiors and enjoy three activities of your choice. From breathtaking coastline to charming towns and unique wine experiences.',
        descriptionPt: 'Pule o interior dos monumentos e desfrute de três atividades de sua escolha. De costa deslumbrante a cidades encantadoras e experiências únicas de vinho.',
        descriptionEs: 'Omite los interiores de monumentos y disfruta de tres actividades de tu elección. Desde la costa impresionante hasta pueblos encantadores y experiencias únicas de vino.',
        sortOrder: 2,
        active: true,
      },
    ],
  });

  // Half-Day Activities
  await prisma.productActivity.createMany({
    data: [
      {
        productId: halfDayTour.id,
        nameEn: 'Cabo da Roca — Edge of the Continent',
        namePt: 'Cabo da Roca — Borda do Continente',
        nameEs: 'Cabo da Roca — Borde del Continente',
        descriptionEn: 'Stand at the dramatic cliffs of the westernmost point of mainland Europe, where the Atlantic meets Portugal\'s rugged coastline.',
        descriptionPt: 'Fique nas falésias dramáticas do ponto mais ocidental da Europa continental, onde o Atlântico encontra a costa acidentada de Portugal.',
        descriptionEs: 'Párate en los acantilados dramáticos del punto más occidental de Europa continental, donde el Atlántico se encuentra con la costa escarpada de Portugal.',
        imageUrl: '/assets/activities/cabo-da-roca.jpg',
        sortOrder: 1,
        active: true,
      },
      {
        productId: halfDayTour.id,
        nameEn: 'Azenhas do Mar — Ocean Cliffs Retreat',
        namePt: 'Azenhas do Mar — Refúgio de Falésias do Oceano',
        nameEs: 'Azenhas do Mar — Retiro de Acantilados del Océano',
        descriptionEn: 'Discover this cliffside village with whitewashed houses, ocean views, and a natural seawater pool carved into the rocks.',
        descriptionPt: 'Descubra esta vila à beira do penhasco com casas caiadas, vistas do oceano e uma piscina natural de água do mar esculpida nas rochas.',
        descriptionEs: 'Descubre este pueblo al borde del acantilado con casas encaladas, vistas al océano y una piscina natural de agua de mar tallada en las rocas.',
        imageUrl: '/assets/activities/azenhas-do-mar.jpg',
        sortOrder: 2,
        active: true,
      },
      {
        productId: halfDayTour.id,
        nameEn: 'Cascais — Seaside Elegance',
        namePt: 'Cascais — Elegância à Beira-Mar',
        nameEs: 'Cascais — Elegancia Costera',
        descriptionEn: 'Stroll through cobblestone streets, see the marina, and enjoy the relaxed charm of this elegant seaside town.',
        descriptionPt: 'Passeie pelas ruas de paralelepípedos, veja a marina e aproveite o charme relaxado desta elegante cidade costeira.',
        descriptionEs: 'Pasea por calles empedradas, ve la marina y disfruta del encanto relajado de esta elegante ciudad costera.',
        imageUrl: '/assets/activities/cascais.jpg',
        sortOrder: 3,
        active: true,
      },
      {
        productId: halfDayTour.id,
        nameEn: 'Wine Tasting — Colares Heritage Wines',
        namePt: 'Degustação de Vinhos — Vinhos Patrimônio de Colares',
        nameEs: 'Cata de Vinos — Vinos Patrimonio de Colares',
        descriptionEn: 'Savor the rare and full-bodied Colares wine in a local cellar, paired with stories of its unique sandy-soil vineyards.',
        descriptionPt: 'Saboreie o raro e encorpado vinho de Colares em uma adega local, acompanhado de histórias de suas vinhas únicas de solo arenoso.',
        descriptionEs: 'Saborea el raro y robusto vino de Colares en una bodega local, acompañado de historias de sus viñedos únicos de suelo arenoso.',
        imageUrl: '/assets/activities/wine-tasting.jpg',
        sortOrder: 4,
        active: true,
      },
      {
        productId: halfDayTour.id,
        nameEn: 'Historical Center — Heart of Sintra',
        namePt: 'Centro Histórico — Coração de Sintra',
        nameEs: 'Centro Histórico — Corazón de Sintra',
        descriptionEn: 'Wander Sintra\'s winding alleys, lined with pastel façades, traditional shops, and the scent of fresh pastries.',
        descriptionPt: 'Passeie pelos becos sinuosos de Sintra, repletos de fachadas pastel, lojas tradicionais e o aroma de doces frescos.',
        descriptionEs: 'Pasea por los callejones sinuosos de Sintra, llenos de fachadas pastel, tiendas tradicionales y el aroma de pasteles frescos.',
        imageUrl: '/assets/activities/historical-center.jpg',
        sortOrder: 5,
        active: true,
      },
      {
        productId: halfDayTour.id,
        nameEn: 'Major Monuments — Iconic Views',
        namePt: 'Monumentos Principais — Vistas Icônicas',
        nameEs: 'Monumentos Principales — Vistas Icónicas',
        descriptionEn: 'Capture stunning views and learn the history of Sintra\'s most iconic palaces without entering the interiors.',
        descriptionPt: 'Capture vistas deslumbrantes e aprenda a história dos palácios mais icônicos de Sintra sem entrar nos interiores.',
        descriptionEs: 'Captura vistas impresionantes y aprende la historia de los palacios más icónicos de Sintra sin entrar en los interiores.',
        imageUrl: '/assets/activities/monuments.jpg',
        sortOrder: 6,
        active: true,
      },
    ],
  });

  console.log('✅ Product 1 created: Half-Day Tour');

  // === PRODUCT 2: PERSONALIZED FULL-DAY TOUR (BEST CHOICE) ===
  console.log('📦 Creating Product 2: Full-Day Tour...');
  const fullDayTour = await prisma.product.create({
    data: {
      slug: 'personalized-full-day-tour',
      titleEn: 'Private Sintra Full-Day Tuk Tuk Tour — Customized for You',
      titlePt: 'Tour Privado de Dia Inteiro em Tuk Tuk por Sintra — Personalizado para Você',
      titleEs: 'Tour Privado de Día Completo en Tuk Tuk por Sintra — Personalizado para Ti',
      descriptionEn: 'Discover the magic of Sintra on a private full-day tuk tuk tour. Visit iconic landmarks, hidden gems, coastlines, and enjoy authentic local flavors — all at your pace, with a local expert by your side.',
      descriptionPt: 'Descubra a magia de Sintra em um tour privado de dia inteiro em tuk tuk. Visite marcos icônicos, joias escondidas, litorais e desfrute de sabores locais autênticos — tudo no seu ritmo, com um especialista local ao seu lado.',
      descriptionEs: 'Descubre la magia de Sintra en un tour privado de día completo en tuk tuk. Visita lugares emblemáticos, gemas escondidas, costas y disfruta de sabores locales auténticos — todo a tu ritmo, con un experto local a tu lado.',
      durationHours: 8,
      maxGroupSize: 6,
      categoryEn: 'Private Tuk Tuk Tour',
      categoryPt: 'Tour Privado em Tuk Tuk',
      categoryEs: 'Tour Privado en Tuk Tuk',
      highlightedEn: 'BEST CHOICE',
      highlightedPt: 'MELHOR ESCOLHA',
      highlightedEs: 'MEJOR ELECCIÓN',
      featuresEn: [
        'Full day customized tour',
        'Planning call with Daniel Ponce (30 min)',
        'Professional photos included',
        'Choose where to end',
        'Private transportation',
        'WiFi onboard',
        'Pena Palace',
        'Quinta da Regaleira',
        'Cabo da Roca',
        'Azenhas do Mar',
        'Cascais',
        'Colares wine cellars',
      ],
      featuresPt: [
        'Tour personalizado de dia inteiro',
        'Chamada de planejamento com Daniel Ponce (30 min)',
        'Fotos profissionais incluídas',
        'Escolha onde terminar',
        'Transporte privado',
        'WiFi a bordo',
        'Palácio da Pena',
        'Quinta da Regaleira',
        'Cabo da Roca',
        'Azenhas do Mar',
        'Cascais',
        'Adegas de Colares',
      ],
      featuresEs: [
        'Tour personalizado de día completo',
        'Llamada de planificación con Daniel Ponce (30 min)',
        'Fotos profesionales incluidas',
        'Elige dónde terminar',
        'Transporte privado',
        'WiFi a bordo',
        'Palacio da Pena',
        'Quinta da Regaleira',
        'Cabo da Roca',
        'Azenhas do Mar',
        'Cascais',
        'Bodegas de Colares',
      ],
      excludedEn: [
        'Monument tickets (paid separately)',
        'Lunch (paid separately)',
        'Wine tasting (optional, €24/person)',
      ],
      excludedPt: [
        'Ingressos para monumentos (pagos separadamente)',
        'Almoço (pago separadamente)',
        'Degustação de vinho (opcional, €24/pessoa)',
      ],
      excludedEs: [
        'Entradas a monumentos (pagadas por separado)',
        'Almuerzo (pagado por separado)',
        'Degustación de vino (opcional, €24/persona)',
      ],
      imageUrls: [
        '/assets/tours/full-day-sintra-1.jpg',
        '/assets/tours/full-day-sintra-2.jpg',
        '/assets/tours/full-day-sintra-3.jpg',
      ],
      active: true,
      bestChoice: true,
    },
  });

  // Full-Day Pricing
  await prisma.productSeasonPrice.createMany({
    data: [
      // Nov-Apr
      {
        productId: fullDayTour.id,
        season: 'low',
        startMonth: 11,
        endMonth: 4,
        tier: '1-4-people',
        minPeople: 1,
        maxPeople: 4,
        priceEur: 440,
        pricePerPerson: false,
      },
      {
        productId: fullDayTour.id,
        season: 'low',
        startMonth: 11,
        endMonth: 4,
        tier: '5-6-people',
        minPeople: 5,
        maxPeople: 6,
        priceEur: 110,
        pricePerPerson: true,
      },
      // May-Oct
      {
        productId: fullDayTour.id,
        season: 'high',
        startMonth: 5,
        endMonth: 10,
        tier: '1-4-people',
        minPeople: 1,
        maxPeople: 4,
        priceEur: 520,
        pricePerPerson: false,
      },
      {
        productId: fullDayTour.id,
        season: 'high',
        startMonth: 5,
        endMonth: 10,
        tier: '5-6-people',
        minPeople: 5,
        maxPeople: 6,
        priceEur: 130,
        pricePerPerson: true,
      },
    ],
  });

  console.log('✅ Product 2 created: Full-Day Tour');

  // === PRODUCT 3: ALL-INCLUSIVE EXPERIENCE (PREMIUM) ===
  console.log('📦 Creating Product 3: All-Inclusive Experience...');
  const allInclusiveTour = await prisma.product.create({
    data: {
      slug: 'all-inclusive-experience',
      titleEn: 'The Most Complete and Comfortable Way to Discover Sintra',
      titlePt: 'A Forma Mais Completa e Confortável de Descobrir Sintra',
      titleEs: 'La Forma Más Completa y Cómoda de Descubrir Sintra',
      descriptionEn: 'Enjoy a private all-inclusive tuk tuk tour with everything arranged for you — from monument tickets and a traditional Portuguese lunch to optional wine tasting and stunning coastal views.',
      descriptionPt: 'Desfrute de um tour privado tudo incluído em tuk tuk com tudo organizado para você — de ingressos para monumentos e um almoço português tradicional a degustação de vinho opcional e vistas deslumbrantes da costa.',
      descriptionEs: 'Disfruta de un tour privado todo incluido en tuk tuk con todo organizado para ti — desde entradas a monumentos y un almuerzo portugués tradicional hasta degustación de vino opcional y vistas impresionantes de la costa.',
      durationHours: 8,
      maxGroupSize: 6,
      categoryEn: 'Premium All-Inclusive Tour',
      categoryPt: 'Tour Premium Tudo Incluído',
      categoryEs: 'Tour Premium Todo Incluido',
      highlightedEn: 'PREMIUM',
      highlightedPt: 'PREMIUM',
      highlightedEs: 'PREMIUM',
      featuresEn: [
        'Private transfers from Lisbon',
        'Customizable itinerary',
        'Authentic Portuguese lunch INCLUDED',
        'All monument tickets INCLUDED',
        'Optional wine tour in Colares',
        'Professional photos INCLUDED',
        'WiFi onboard',
        'No hidden costs',
        'Everything seamlessly arranged',
      ],
      featuresPt: [
        'Transfers privados de Lisboa',
        'Itinerário personalizável',
        'Almoço português autêntico INCLUÍDO',
        'Todos os ingressos para monumentos INCLUÍDOS',
        'Tour de vinho opcional em Colares',
        'Fotos profissionais INCLUÍDAS',
        'WiFi a bordo',
        'Sem custos ocultos',
        'Tudo perfeitamente organizado',
      ],
      featuresEs: [
        'Traslados privados desde Lisboa',
        'Itinerario personalizable',
        'Almuerzo portugués auténtico INCLUIDO',
        'Todas las entradas a monumentos INCLUIDAS',
        'Tour de vino opcional en Colares',
        'Fotos profesionales INCLUIDAS',
        'WiFi a bordo',
        'Sin costos ocultos',
        'Todo perfectamente organizado',
      ],
      excludedEn: [],
      excludedPt: [],
      excludedEs: [],
      imageUrls: [
        '/assets/tours/all-inclusive-sintra-1.jpg',
        '/assets/tours/all-inclusive-sintra-2.jpg',
        '/assets/tours/all-inclusive-sintra-3.jpg',
      ],
      active: true,
      bestChoice: false,
    },
  });

  // All-Inclusive Pricing (detailed per-person tiers)
  await prisma.productSeasonPrice.createMany({
    data: [
      // Nov-Apr
      { productId: allInclusiveTour.id, season: 'low', startMonth: 11, endMonth: 4, tier: '1-person', minPeople: 1, maxPeople: 1, priceEur: 580, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'low', startMonth: 11, endMonth: 4, tier: '2-people', minPeople: 2, maxPeople: 2, priceEur: 720, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'low', startMonth: 11, endMonth: 4, tier: '3-people', minPeople: 3, maxPeople: 3, priceEur: 860, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'low', startMonth: 11, endMonth: 4, tier: '4-people', minPeople: 4, maxPeople: 4, priceEur: 1000, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'low', startMonth: 11, endMonth: 4, tier: '5-people', minPeople: 5, maxPeople: 5, priceEur: 1250, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'low', startMonth: 11, endMonth: 4, tier: '6-people', minPeople: 6, maxPeople: 6, priceEur: 1500, pricePerPerson: false },
      // May-Oct
      { productId: allInclusiveTour.id, season: 'high', startMonth: 5, endMonth: 10, tier: '1-person', minPeople: 1, maxPeople: 1, priceEur: 680, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'high', startMonth: 5, endMonth: 10, tier: '2-people', minPeople: 2, maxPeople: 2, priceEur: 820, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'high', startMonth: 5, endMonth: 10, tier: '3-people', minPeople: 3, maxPeople: 3, priceEur: 960, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'high', startMonth: 5, endMonth: 10, tier: '4-people', minPeople: 4, maxPeople: 4, priceEur: 1100, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'high', startMonth: 5, endMonth: 10, tier: '5-people', minPeople: 5, maxPeople: 5, priceEur: 1375, pricePerPerson: false },
      { productId: allInclusiveTour.id, season: 'high', startMonth: 5, endMonth: 10, tier: '6-people', minPeople: 6, maxPeople: 6, priceEur: 1650, pricePerPerson: false },
    ],
  });

  console.log('✅ Product 3 created: All-Inclusive Experience');

  // Create Integrations
  console.log('🔌 Creating integrations...');
  await prisma.integration.createMany({
    data: [
      {
        kind: 'whatsapp',
        name: 'WhatsApp Cloud API',
        config: {
          phone: '+351 123 456 789',
          link: 'http://wa.link/y0m3y9',
          priority: 1,
        },
        active: true,
      },
      {
        kind: 'facebook',
        name: 'Facebook Messenger',
        config: {
          pageId: '1566043420168290',
          link: 'https://www.m.me/1566043420168290',
          priority: 2,
        },
        active: true,
      },
      {
        kind: 'email',
        name: 'Email Support',
        config: {
          email: 'info@yesyoudeserve.tours',
          priority: 3,
        },
        active: true,
      },
      {
        kind: 'stripe',
        name: 'Stripe Payments',
        config: {
          currency: 'EUR',
          mode: 'live',
        },
        active: true,
      },
    ],
  });

  console.log('✅ Integrations created');

  console.log('🎉 Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('  - 3 Products (Half-Day, Full-Day, All-Inclusive)');
  console.log('  - 24 Seasonal price tiers');
  console.log('  - 2 Product options (Half-Day)');
  console.log('  - 6 Product activities (Half-Day)');
  console.log('  - 2 Guides (Daniel Ponce - Founder, Danyella Santos - Director)');
  console.log('  - 4 Integrations (WhatsApp, Facebook, Email, Stripe)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
