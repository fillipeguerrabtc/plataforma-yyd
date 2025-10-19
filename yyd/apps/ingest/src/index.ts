import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import slugify from "slugify";

const prisma = new PrismaClient();
const BASE_URL = "https://yesyoudeserve.tours";
const DELAY_MS = 500; // Throttle: ~2 req/s

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeSlug(title: string): string {
  return slugify(title, { lower: true, strict: true });
}

async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "YYD-Ingester/1.0 (https://yesyoudeserve.tours)"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function extractProducts(html: string, pageUrl: string): any[] {
  const $ = cheerio.load(html);
  const products: any[] = [];

  // Try to find tour/product cards (adjust selectors based on actual HTML)
  // Common patterns: .tour-card, .product-item, article, etc.
  const candidates = $("article, .tour, .product, .card, .experience").toArray();

  for (const el of candidates) {
    const $el = $(el);
    
    // Extract title (h2, h3, .title, etc.)
    const title = $el.find("h2, h3, .title, .name").first().text().trim();
    if (!title) continue;

    // Extract description
    const description = $el.find("p, .description, .excerpt").first().text().trim() || title;

    // Extract price (look for EUR, €, numbers)
    let priceEur = 0;
    const priceText = $el.find(".price, .cost, [class*=price]").text();
    const priceMatch = priceText.match(/(\d+(?:[.,]\d+)?)\s*€?/);
    if (priceMatch) {
      priceEur = parseFloat(priceMatch[1].replace(",", "."));
    }

    // Extract duration
    const duration = $el.find(".duration, [class*=duration]").text().trim() || null;

    // Extract images
    const imageUrls: string[] = [];
    $el.find("img").each((i, img) => {
      const src = $(img).attr("src") || $(img).attr("data-src");
      if (src) {
        const fullUrl = src.startsWith("http") ? src : new URL(src, BASE_URL).toString();
        imageUrls.push(fullUrl);
      }
    });

    // Extract link
    const link = $el.find("a").first().attr("href");
    const externalUrl = link ? (link.startsWith("http") ? link : new URL(link, BASE_URL).toString()) : pageUrl;

    products.push({
      title,
      description,
      priceEur,
      duration,
      imageUrls,
      externalUrl,
      category: "Tours", // Default category
      subcategory: null
    });
  }

  return products;
}

async function ingestCatalog() {
  console.log("🚀 Starting catalog ingestion from yesyoudeserve.tours");
  
  try {
    // Fetch main page and tours page
    const pagesToScrape = [
      BASE_URL,
      `${BASE_URL}/tours`,
      `${BASE_URL}/experiences`,
      `${BASE_URL}/private-tours`
    ];

    const allProducts: any[] = [];

    for (const pageUrl of pagesToScrape) {
      try {
        const html = await fetchPage(pageUrl);
        const products = extractProducts(html, pageUrl);
        allProducts.push(...products);
        console.log(`  Found ${products.length} products on ${pageUrl}`);
        await sleep(DELAY_MS);
      } catch (err) {
        console.warn(`  ⚠️ Failed to fetch ${pageUrl}:`, (err as Error).message);
      }
    }

    console.log(`\n📊 Total products extracted: ${allProducts.length}`);

    // Upsert products to database
    let created = 0;
    let updated = 0;

    for (const product of allProducts) {
      if (!product.title) continue;

      const slug = makeSlug(product.title);
      
      try {
        await prisma.product.upsert({
          where: { slug },
          create: {
            slug,
            title: product.title,
            description: product.description,
            category: product.category,
            subcategory: product.subcategory,
            duration: product.duration,
            priceEur: product.priceEur,
            currency: "EUR",
            imageUrls: product.imageUrls,
            externalUrl: product.externalUrl,
            active: true
          },
          update: {
            title: product.title,
            description: product.description,
            priceEur: product.priceEur,
            duration: product.duration,
            imageUrls: product.imageUrls,
            externalUrl: product.externalUrl,
            updatedAt: new Date()
          }
        });
        
        const action = await prisma.product.findUnique({ where: { slug } });
        if (action) {
          if (action.createdAt.getTime() === action.updatedAt.getTime()) {
            created++;
          } else {
            updated++;
          }
        }
      } catch (err) {
        console.error(`  ❌ Failed to upsert "${product.title}":`, (err as Error).message);
      }
    }

    console.log(`\n✅ Ingestion complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);

  } catch (err) {
    console.error("❌ Ingestion failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ingestCatalog();
