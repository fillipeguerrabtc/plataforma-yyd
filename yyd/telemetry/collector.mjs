/**
 * Coletor Automático de Métricas do Cérebro Proxy
 * Coleta métricas a cada 30s e salva em Postgres via Prisma
 */
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PROXY_URL = process.env.REASON_PROXY_URL || "http://localhost:3000";
const COLLECT_INTERVAL = 30000; // 30s

let lastCalls = 0;
let lastTokens = 0;
let lastCost = 0;

console.log("📊 Telemetry Collector iniciado");
console.log("   Proxy:", PROXY_URL);
console.log("   Intervalo:", COLLECT_INTERVAL / 1000, "segundos");
console.log("   Database: Postgres (via Prisma)");

async function collect() {
  try {
    const res = await fetch(`${PROXY_URL}/metrics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) {
      console.warn("⚠️ Proxy não respondeu:", res.status);
      return;
    }

    const metrics = await res.json();
    
    // Calcular delta desde última coleta
    const deltaCalls = metrics.calls - lastCalls;
    const deltaTokens = (metrics.prompt_tokens + metrics.completion_tokens) - lastTokens;
    const deltaCost = metrics.est_cost_total - lastCost;
    
    if (deltaCalls > 0) {
      // Inserir no histórico
      await prisma.metricsHistory.create({
        data: {
          app: "proxy",
          route: "reason",
          calls: deltaCalls,
          promptTokens: metrics.prompt_tokens,
          completionTokens: metrics.completion_tokens,
          estCostTotal: deltaCost
        }
      });

      // Atualizar sumário diário
      const today = new Date().toISOString().split("T")[0];
      
      const existing = await prisma.dailySummary.findUnique({
        where: { date: today }
      });

      if (existing) {
        await prisma.dailySummary.update({
          where: { date: today },
          data: {
            totalCalls: existing.totalCalls + deltaCalls,
            totalTokens: existing.totalTokens + deltaTokens,
            totalCost: Number(existing.totalCost) + deltaCost
          }
        });
      } else {
        await prisma.dailySummary.create({
          data: {
            date: today,
            totalCalls: deltaCalls,
            totalTokens: deltaTokens,
            totalCost: deltaCost
          }
        });
      }

      console.log(`✅ [${new Date().toISOString()}] Δ: ${deltaCalls} calls, ${deltaTokens} tokens, €${deltaCost.toFixed(6)}`);
    }
    
    // Atualizar últimos valores
    lastCalls = metrics.calls;
    lastTokens = metrics.prompt_tokens + metrics.completion_tokens;
    lastCost = metrics.est_cost_total;
    
  } catch (err) {
    console.error("❌ Erro ao coletar métricas:", err.message);
  }
}

// Inicializar e rodar
collect(); // Primeira coleta imediata
setInterval(collect, COLLECT_INTERVAL);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Parando collector...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
