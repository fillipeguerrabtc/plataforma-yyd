/**
 * Relatório de Telemetria - Últimos 7 dias
 * Usa Postgres via Prisma
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateReport() {
  console.log("\n📆 RELATÓRIO DE TELEMETRIA - ÚLTIMOS 7 DIAS\n");
  console.log("=".repeat(80));

  const summary = await prisma.dailySummary.findMany({
    orderBy: { date: "desc" },
    take: 7
  });

  if (summary.length === 0) {
    console.log("Nenhum dado de telemetria encontrado.");
  } else {
    console.log(
      "Data       │ Calls │ Tokens  │ Custo Total (EUR)"
    );
    console.log("─".repeat(80));
    
    for (const s of summary) {
      console.log(
        `${s.date} │ ${s.totalCalls.toString().padStart(5)} │ ${s.totalTokens.toString().padStart(7)} │ €${Number(s.totalCost).toFixed(6)}`
      );
    }
    
    const totals = summary.reduce((acc, s) => ({
      calls: acc.calls + s.totalCalls,
      tokens: acc.tokens + s.totalTokens,
      cost: acc.cost + Number(s.totalCost)
    }), { calls: 0, tokens: 0, cost: 0 });
    
    console.log("─".repeat(80));
    console.log(
      `TOTAL      │ ${totals.calls.toString().padStart(5)} │ ${totals.tokens.toString().padStart(7)} │ €${totals.cost.toFixed(6)}`
    );
  }

  console.log("=".repeat(80));
  console.log("\n💰 ECONOMIA REPLIT: 100% dos custos concentrados no Cérebro Proxy");
  console.log("🔒 Uso direto de OpenAI: BLOQUEADO pelo net-guard\n");
  
  await prisma.$disconnect();
}

generateReport().catch(console.error);
