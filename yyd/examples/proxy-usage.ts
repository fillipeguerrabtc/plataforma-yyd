/**
 * Exemplo de uso do @yyd/proxy-sdk
 * 
 * O proxy-sdk permite usar ChatGPT para raciocínio complexo,
 * economizando tokens Replit Agent.
 */

import { reason, ensureShortJson } from "@yyd/proxy-sdk";

async function exemploCalculoPreco() {
  console.log("📊 Exemplo: Cálculo de preço dinâmico");
  
  try {
    const resultado = await reason(
      "Calcular preço dinâmico considerando demanda e clima",
      {
        tour_id: "T-SIN-001",
        base_price: 420,
        demand_factor: 0.85,
        weather_forecast: "sunny",
        day_of_week: "Saturday"
      }
    );

    console.log("✅ Resposta do Cérebro Proxy:");
    console.log(`   Ação: ${resultado.action}`);
    console.log(`   Parâmetros:`, resultado.params);
    console.log(`   Raciocínio: ${resultado.reasoning || 'N/A'}`);
    
  } catch (err) {
    console.error("❌ Erro:", (err as Error).message);
  }
}

async function exemploRecomendacaoTour() {
  console.log("\n🎯 Exemplo: Recomendação de tour");
  
  try {
    const resultado = await reason(
      "Recomendar tour ideal baseado no perfil do cliente",
      ensureShortJson({
        customer_profile: {
          age_group: "30-45",
          interests: ["history", "photography", "wine"],
          budget: "premium",
          group_size: 2,
          preferred_language: "en"
        },
        available_tours: [
          { id: "T-SIN-001", name: "Personalized Half-Day", price: 280 },
          { id: "T-SIN-002", name: "Full-Day Experience", price: 420 },
          { id: "T-SIN-003", name: "All-Inclusive", price: 640 }
        ]
      })
    );

    console.log("✅ Recomendação:");
    console.log(`   Ação: ${resultado.action}`);
    console.log(`   Tour sugerido:`, resultado.params);
    
  } catch (err) {
    console.error("❌ Erro:", (err as Error).message);
  }
}

async function main() {
  console.log("🧠 Testando Cérebro Proxy SDK\n");
  console.log("REASON_PROXY_URL:", process.env.REASON_PROXY_URL || "não configurado");
  console.log("=" . repeat(60));
  
  await exemploCalculoPreco();
  await exemploRecomendacaoTour();
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ Testes completos!");
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
