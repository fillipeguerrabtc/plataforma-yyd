/**
 * Seed Tour Add-ons - Real YYD Data
 * 
 * Based on: https://www.yesyoudeserve.tours/
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PAID ADD-ONS ONLY
 * These are EXTRAS that customers pay for on top of tour price
 * 
 * Activities INCLUDED in tour price are in ProductActivity model
 */
const TOUR_ADDONS = [
  // Wine Tasting - €24 per person (OPTIONAL PAID ADD-ON)
  {
    code: 'wine-tasting',
    nameEn: 'Wine Tasting in Colares',
    namePt: 'Degustação de Vinhos em Colares',
    nameEs: 'Cata de Vinos en Colares',
    descriptionEn: 'Visit a historic winery and learn about one of the world\'s rarest wines, aged in exotic wooden barrels. Includes tasting of traditional Colares wines. (Optional €24/person)',
    descriptionPt: 'Visite uma vinícola histórica e aprenda sobre um dos vinhos mais raros do mundo, envelhecido em barris de madeira exóticos. Inclui degustação de vinhos tradicionais de Colares. (Opcional €24/pessoa)',
    descriptionEs: 'Visita una bodega histórica y aprende sobre uno de los vinos más raros del mundo, envejecido en barricas de madera exóticas. Incluye degustación de vinos tradicionales de Colares. (Opcional €24/persona)',
    priceEur: 24.00,
    priceType: 'per_person',
    category: 'experience',
    imageUrl: 'https://www.yesyoudeserve.tours/wp-content/uploads/2025/01/75.jpg',
    active: true,
    sortOrder: 1,
  },
  
  // Traditional Portuguese Lunch (NOT included in Half-Day/Full-Day, INCLUDED in All-Inclusive)
  {
    code: 'portuguese-lunch',
    nameEn: 'Traditional Portuguese Lunch',
    namePt: 'Almoço Português Tradicional',
    nameEs: 'Almuerzo Portugués Tradicional',
    descriptionEn: 'Savor authentic Portuguese cuisine at a family-run local restaurant. Includes main course, drink, and dessert. (Optional €18/person)',
    descriptionPt: 'Saboreie autêntica culinária portuguesa em restaurante familiar local. Inclui prato principal, bebida e sobremesa. (Opcional €18/pessoa)',
    descriptionEs: 'Saborea auténtica cocina portuguesa en un restaurante familiar local. Incluye plato principal, bebida y postre. (Opcional €18/persona)',
    priceEur: 18.00,
    priceType: 'per_person',
    category: 'food',
    imageUrl: 'https://www.yesyoudeserve.tours/wp-content/uploads/2025/01/416090828_10231486321089862_7605267956500557408_n.webp',
    active: true,
    sortOrder: 2,
  },
  
  // Transfer Service - Lisbon Pickup/Dropoff (NOT included in Half-Day/Full-Day, INCLUDED in All-Inclusive)
  {
    code: 'lisbon-transfer',
    nameEn: 'Private Transfer from Lisbon',
    namePt: 'Transfer Privado de Lisboa',
    nameEs: 'Traslado Privado desde Lisboa',
    descriptionEn: 'Door-to-door comfortable transfer service from your Lisbon accommodation to Sintra and back. Includes pickup and dropoff. (Optional €40/booking)',
    descriptionPt: 'Serviço de transfer confortável porta-a-porta da sua acomodação em Lisboa para Sintra e volta. Inclui pickup e dropoff. (Opcional €40/reserva)',
    descriptionEs: 'Servicio de traslado cómodo puerta a puerta desde tu alojamiento en Lisboa a Sintra y vuelta. Incluye recogida y entrega. (Opcional €40/reserva)',
    priceEur: 40.00,
    priceType: 'per_booking',
    category: 'transfer',
    imageUrl: 'https://www.yesyoudeserve.tours/wp-content/uploads/2025/05/transferpickupsintra.jpg',
    active: true,
    sortOrder: 3,
  },
  
  // Monument Tickets Bundle (NOT included in Half-Day/Full-Day, INCLUDED in All-Inclusive)
  {
    code: 'monument-tickets-bundle',
    nameEn: 'Monument Entry Tickets Bundle',
    namePt: 'Pacote de Ingressos para Monumentos',
    nameEs: 'Paquete de Entradas a Monumentos',
    descriptionEn: 'Skip the lines with pre-purchased tickets to Pena Palace, Quinta da Regaleira, and Moorish Castle. Save time and enjoy priority access. (Optional €36/person)',
    descriptionPt: 'Evite filas com ingressos pré-comprados para Palácio da Pena, Quinta da Regaleira e Castelo dos Mouros. Economize tempo e desfrute de acesso prioritário. (Opcional €36/pessoa)',
    descriptionEs: 'Evita las colas con entradas compradas previamente al Palacio da Pena, Quinta da Regaleira y Castillo de los Moros. Ahorra tiempo y disfruta de acceso prioritario. (Opcional €36/persona)',
    priceEur: 36.00,
    priceType: 'per_person',
    category: 'monument',
    imageUrl: 'https://www.yesyoudeserve.tours/wp-content/uploads/elementor/thumbs/466782984_886579926929197_8891419567420536741_n-r8gch5f0ztdw90lh4drs8vibaoftppf07ssjk3hj00.jpg',
    active: true,
    sortOrder: 4,
  },
];

async function seedAddons() {
  console.log('🌱 Seeding Tour Add-ons...\n');

  for (const addon of TOUR_ADDONS) {
    const existing = await prisma.tourAddon.findUnique({
      where: { code: addon.code },
    });

    if (existing) {
      console.log(`⚠️  Add-on "${addon.code}" already exists, updating...`);
      await prisma.tourAddon.update({
        where: { code: addon.code },
        data: addon,
      });
    } else {
      console.log(`✅ Creating add-on: ${addon.nameEn} (€${addon.priceEur})`);
      await prisma.tourAddon.create({
        data: addon,
      });
    }
  }

  console.log('\n✅ Tour Add-ons seeded successfully!\n');
  
  // Display summary
  const addons = await prisma.tourAddon.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  });
  
  console.log('📊 Available Add-ons:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const addon of addons) {
    console.log(`${addon.nameEn.padEnd(40)} €${addon.priceEur.toString().padStart(6)} (${addon.priceType})`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seedAddons()
  .catch((e) => {
    console.error('❌ Error seeding add-ons:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
