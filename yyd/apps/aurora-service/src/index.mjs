import express from 'express';
import { PrismaClient } from '@prisma/client';
import { reason } from '@yyd/proxy-sdk';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.AURORA_PORT || 3003;

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ service: 'aurora-service', status: 'running' });
});

// Webhook: booking confirmed
app.post('/webhooks/booking-confirmed', async (req, res) => {
  try {
    const { booking_id, customer_id, productId, date } = req.body;

    const result = await reason('classify_msg', {
      source: 'booking',
      payload_min: { booking_id, customer_id, productId, date }
    });

    console.log(`📧 Booking confirmed webhook - Tag: ${result.params?.tag || 'processed'}`);

    res.json({ success: true, tag: result.params?.tag });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Check ticket availability
app.post('/ops/check-ticket-availability', async (req, res) => {
  try {
    // Get ticket provider integrations
    const providers = await prisma.integration.findMany({
      where: { kind: 'ticket_provider', active: true }
    });

    const results = [];

    for (const provider of providers) {
      const config = provider.config;
      const url = config.url;

      try {
        // Fetch provider page
        const response = await fetch(url, { timeout: 5000 });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract availability text (heuristic)
        const bodyText = $('body').text().toLowerCase();
        
        // Classify availability
        const classification = await reason('classify_msg', {
          source: 'tickets',
          text: bodyText.slice(0, 500)
        });

        const status = bodyText.includes('sold out') || bodyText.includes('esgotado') 
          ? 'unavailable' 
          : 'available';

        // Save to database
        await prisma.ticketAvailability.create({
          data: {
            productId: config.productId || 'unknown',
            provider: provider.name,
            date: new Date(),
            status,
            raw: { tag: classification.params?.tag, snippet: bodyText.slice(0, 200) }
          }
        });

        results.push({
          provider: provider.name,
          status,
          tag: classification.params?.tag
        });
      } catch (err) {
        console.error(`Provider ${provider.name} check failed:`, err.message);
      }
    }

    res.json({ checked: results.length, results });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Availability check failed' });
  }
});

// Ops ping
app.get('/ops/ping', async (req, res) => {
  try {
    const result = await reason('classify_msg', {
      source: 'ops',
      text: 'ping'
    });

    console.log(`🏓 Ops ping - Tag: ${result.params?.tag || 'pong'}`);

    res.json({ pong: true, tag: result.params?.tag });
  } catch (error) {
    console.error('Ping error:', error);
    res.json({ pong: true, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Aurora Service running on port ${PORT}`);
});
