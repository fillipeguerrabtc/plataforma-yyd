import Stripe from "stripe";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Executor local: o Replit age (Stripe/DB/etc.). Mantemos tokens baixos pois aqui não há IA.
export async function execute(decision) {
  const { action, params } = decision || {};

  if (action === "quote_price") {
    const base = typeof params?.price_eur === "number" ? params.price_eur : 0;
    const final_price = Math.max(0, Math.round(base * 100) / 100);
    return { ok: true, action, data: { price_eur: final_price, risk: params?.risk ?? 0 } };
  }

  if (action === "create_booking") {
    if (!stripe) return { ok: false, action, error: "Stripe não configurado" };
    // Exemplo: aqui criaria PaymentIntent, salvaria reserva no DB etc.
    return { ok: true, action, data: { booking_id: "bk_" + Date.now() } };
  }

  if (action === "classify_msg") {
    return { ok: true, action, data: { tag: "sales" } };
  }

  return { ok: false, action: "other", error: "Ação desconhecida ou dados insuficientes." };
}
