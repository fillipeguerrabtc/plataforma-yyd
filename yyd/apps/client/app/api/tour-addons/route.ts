/**
 * Tour Add-ons API - camelCase response
 * 
 * GET /api/tour-addons - Retorna todos add-ons ativos
 * Query params:
 *   - category: Filter by category (experience, food, transfer, monument)
 *   - tourType: Filter by tour type (half-day, full-day, all-inclusive)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tourType = searchParams.get('tourType');

    // Build where clause
    const where: any = {
      active: true,
    };

    if (category) {
      where.category = category;
    }

    // Fetch add-ons
    const addons = await prisma.tourAddon.findMany({
      where,
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Filter by tour type (All-Inclusive gets nothing since everything is included)
    let filteredAddons = addons;
    
    if (tourType === 'all-inclusive') {
      // All-Inclusive: TUDO incluído, sem add-ons pagos
      filteredAddons = [];
    } else if (tourType === 'half-day') {
      // Half-Day: Apenas Wine Tasting disponível
      filteredAddons = addons.filter(a => a.code === 'wine-tasting');
    }
    // Full-Day: Todos add-ons disponíveis

    // Transform to camelCase response (Prisma já retorna em camelCase)
    const response = filteredAddons.map(addon => ({
      id: addon.id,
      code: addon.code,
      nameEn: addon.nameEn,
      namePt: addon.namePt,
      nameEs: addon.nameEs,
      descriptionEn: addon.descriptionEn,
      descriptionPt: addon.descriptionPt,
      descriptionEs: addon.descriptionEs,
      priceEur: Number(addon.priceEur), // Convert Decimal to Number
      priceType: addon.priceType,
      category: addon.category,
      imageUrl: addon.imageUrl,
      sortOrder: addon.sortOrder,
    }));

    return NextResponse.json({
      success: true,
      addons: response,
      count: response.length,
    });

  } catch (error) {
    console.error('❌ Tour addons API error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar add-ons' },
      { status: 500 }
    );
  }
}
