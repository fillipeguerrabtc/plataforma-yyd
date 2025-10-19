import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST() {
  try {
    const sources = await prisma.integration.findMany({
      where: { kind: 'catalog_source', active: true }
    });

    let totalIngested = 0;

    for (const source of sources) {
      const urls = source.config.urls || [];

      for (const url of urls) {
        try {
          console.log(`📥 Ingesting: ${url}`);
          const response = await fetch(url, { timeout: 10000 });
          const html = await response.text();
          const $ = cheerio.load(html);

          const title = $('h1').first().text().trim() || $('title').text().trim();
          const description = $('meta[name="description"]').attr('content') || 
                            $('p').first().text().trim().slice(0, 500);

          const priceMatch = html.match(/€\s*(\d+)/);
          const priceEur = priceMatch ? parseFloat(priceMatch[1]) : 0;

          const durationMatch = html.match(/(\d+)\s*(hour|hora|horas)/i);
          const duration = durationMatch ? `${durationMatch[1]} hours` : '';

          const imageUrls: string[] = [];
          $('img').each((i, elem) => {
            if (i < 5) {
              const src = $(elem).attr('src');
              if (src && (src.startsWith('http') || src.startsWith('//'))) {
                imageUrls.push(src.startsWith('//') ? `https:${src}` : src);
              }
            }
          });

          if (title && title.length > 5) {
            const slug = slugify(title);

            const existing = await prisma.product.findUnique({ where: { slug } });

            if (existing) {
              await prisma.product.update({
                where: { slug },
                data: {
                  title,
                  description,
                  priceEur,
                  duration,
                  imageUrls,
                  externalUrl: url
                }
              });
              console.log(`🔄 Updated: ${slug}`);
            } else {
              await prisma.product.create({
                data: {
                  slug,
                  title,
                  description,
                  priceEur,
                  duration,
                  imageUrls,
                  externalUrl: url,
                  active: true
                }
              });
              console.log(`✅ Created: ${slug}`);
            }

            totalIngested++;
          }
        } catch (err) {
          console.error(`Failed to ingest ${url}:`, err.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      ingested: totalIngested,
      message: `Ingested ${totalIngested} products`
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 });
  }
}
