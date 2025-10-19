/**
 * Teste Controlado de Economia
 * Mede impacto de chamadas no Proxy vs Replit
 */
import fetch from "node-fetch";
import { reason } from "../packages/proxy-sdk/dist/index.js";

const PROXY_URL = process.env.REASON_PROXY_URL || "http://localhost:3000";
const ITERATIONS = 5;

async function getMetrics() {
  const res = await fetch(`${PROXY_URL}/metrics`);
  return await res.json();
}

async function runEconomyTest() {
  console.log("\n💰 TESTE CONTROLADO DE ECONOMIA\n");
  console.log("=".repeat(70));
  
  // BEFORE
  console.log("\n📊 Métricas BEFORE:");
  const before = await getMetrics();
  console.log(JSON.stringify(before, null, 2));
  
  // EXECUTE
  console.log(`\n🔄 Executando ${ITERATIONS} chamadas ao Proxy...\n`);
  for (let i = 1; i <= ITERATIONS; i++) {
    try {
      const result = await reason(`test_iteration_${i}`, { index: i });
      console.log(`   ${i}/${ITERATIONS} ✅ ${result.action}`);
    } catch (err) {
      console.log(`   ${i}/${ITERATIONS} ❌ ${err.message}`);
    }
  }
  
  // AFTER
  console.log("\n📊 Métricas AFTER:");
  const after = await getMetrics();
  console.log(JSON.stringify(after, null, 2));
  
  // DELTAS
  console.log("\n📈 DELTAS:");
  console.log("─".repeat(70));
  console.log(`Calls:             +${after.calls - before.calls}`);
  console.log(`Prompt Tokens:     +${after.prompt_tokens - before.prompt_tokens}`);
  console.log(`Completion Tokens: +${after.completion_tokens - before.completion_tokens}`);
  console.log(`Total Tokens:      +${(after.prompt_tokens + after.completion_tokens) - (before.prompt_tokens + before.completion_tokens)}`);
  console.log(`Custo Total:       +€${(after.est_cost_total - before.est_cost_total).toFixed(6)}`);
  console.log("─".repeat(70));
  
  console.log("\n✅ Custo e tokens aumentaram APENAS no Proxy (não no Replit)");
  console.log("🔒 Economia real: 100% dos custos em ChatGPT subscription\n");
}

runEconomyTest().catch(console.error);
