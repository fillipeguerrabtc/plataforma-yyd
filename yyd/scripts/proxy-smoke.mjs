/**
 * Smoke test do Cérebro Proxy
 * Executa chamadas de teste para verificar funcionamento
 */
import { reason } from "../packages/proxy-sdk/dist/index.js";

const tests = [
  {
    task: "classify_message",
    context: { source: "test", text: "ping" }
  },
  {
    task: "calculate_dynamic_price",
    context: { tour_id: "T-SIN-001", demand: 0.8, weather: "sunny" }
  },
  {
    task: "recommend_tour",
    context: { budget: "premium", interests: ["history", "wine"] }
  }
];

async function runSmoke() {
  console.log("🔥 Executando smoke tests do Cérebro Proxy...\n");
  
  let success = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`▶️  ${test.task}...`);
      const result = await reason(test.task, test.context);
      console.log(`   ✅ action: ${result.action}`);
      console.log(`   📦 params:`, JSON.stringify(result.params).slice(0, 60));
      success++;
    } catch (err) {
      console.error(`   ❌ ${err.message}`);
      failed++;
    }
    console.log();
  }
  
  console.log("─".repeat(60));
  console.log(`✅ Sucesso: ${success} | ❌ Falhas: ${failed}`);
  console.log("─".repeat(60));
  
  process.exit(failed > 0 ? 1 : 0);
}

runSmoke();
