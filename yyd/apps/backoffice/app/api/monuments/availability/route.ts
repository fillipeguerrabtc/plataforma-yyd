import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/monuments/availability - Check monument ticket availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monumentId = searchParams.get('monumentId');
    const date = searchParams.get('date');
    const productId = searchParams.get('productId');

    if (!date) {
      return NextResponse.json({ error: 'date parameter required' }, { status: 400 });
    }

    const targetDate = new Date(date);
    const where: any = {
      date: {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
    };

    if (monumentId) where.monumentId = monumentId;
    if (productId) where.productId = productId;

    // Fetch cached availability from database
    const availability = await prisma.monumentTicketAvailability.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    // Check if cache is stale (older than 1 hour) OR empty
    const now = new Date();
    const staleThreshold = 60 * 60 * 1000; // 1 hour in ms
    const needsRefresh = 
      availability.length === 0 ||  // Empty cache = needs refresh
      availability.some((item: any) => now.getTime() - item.updatedAt.getTime() > staleThreshold);

    return NextResponse.json({
      availability,
      cached: !needsRefresh,
      needsRefresh,
    });
  } catch (error: any) {
    console.error('Availability GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/monuments/availability - Refresh monument availability from provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monumentId, date, provider } = body;

    if (!monumentId || !date || !provider) {
      return NextResponse.json(
        { error: 'monumentId, date, and provider are required' },
        { status: 400 }
      );
    }

    // Fetch from external provider (placeholder - implement actual API calls)
    const externalData = await fetchMonumentAvailability(monumentId, date, provider);

    // Upsert availability in database
    const availability = await prisma.monumentTicketAvailability.upsert({
      where: {
        monumentId_date_provider: {
          monumentId,
          date: new Date(date),
          provider,
        },
      },
      update: {
        available: externalData.available,
        totalCapacity: externalData.totalCapacity,
        remainingSlots: externalData.remainingSlots,
        priceEur: externalData.priceEur,
        rawResponse: externalData.raw,
        status: externalData.status,
      },
      create: {
        monumentId,
        date: new Date(date),
        provider,
        available: externalData.available,
        totalCapacity: externalData.totalCapacity,
        remainingSlots: externalData.remainingSlots,
        priceEur: externalData.priceEur,
        rawResponse: externalData.raw,
        status: externalData.status,
      },
    });

    return NextResponse.json(availability);
  } catch (error: any) {
    console.error('Availability POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fetch monument availability from external provider
async function fetchMonumentAvailability(
  monumentId: string,
  date: string,
  provider: string
): Promise<{
  available: boolean;
  totalCapacity: number;
  remainingSlots: number;
  priceEur: number;
  status: string;
  raw: any;
}> {
  // TODO: Implement actual API calls to monument providers
  // Example providers: GetYourGuide, Tiqets, Viator, etc.
  
  // For now, return mock data structure
  // In production, this would call:
  // - GET https://api.getyourguide.com/availability/...
  // - GET https://api.tiqets.com/v1/availability/...
  // etc.

  console.log(`Fetching availability for ${monumentId} on ${date} from ${provider}`);

  // Mock response (replace with real API calls)
  const mockResponse = {
    available: true,
    totalCapacity: 100,
    remainingSlots: Math.floor(Math.random() * 50) + 20,
    priceEur: monumentId.includes('sintra') ? 15.0 : 12.0,
    status: 'active',
    raw: {
      provider,
      monumentId,
      date,
      timestamp: new Date().toISOString(),
    },
  };

  return mockResponse;
}
