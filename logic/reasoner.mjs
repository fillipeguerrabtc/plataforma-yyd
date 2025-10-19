import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // modelo custo/benefício

// Função central de raciocínio: entrada mínima, saída JSON OBRIGATÓRIA.
export async function reason({ task, minimal_context }) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system = [
    "Você é o Cérebro Proxy da YYD.",
    "Saída OBRIGATORIAMENTE em JSON válido, curto e objetivo, segundo o schema.",
    "NUNCA escreva texto fora do JSON. Não gere prosa.",
    "Se faltar dados para agir, retorne action='other' com rationale_short dizendo o que falta."
  ].join(" ");

  // Schema mínimo que o Replit EXECUTARÁ localmente
  const schema = {
    type: "object",
    properties: {
      action: { type: "string", enum: ["quote_price", "create_booking", "classify_msg", "other"] },
      rationale_short: { type: "string" },
      params: {
        type: "object",
        additionalProperties: false,
        properties: {
          customer_id: { type: "string" },
          tour_id: { type: "string" },
          date: { type: "string" },
          seats: { type: "number" },
          price_eur: { type: "number" },
          risk: { type: "number" }
        }
      }
    },
    required: ["action","params"]
  };

  const messages = [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify({ task, minimal_context, schema }) }
  ];

  // Structured Outputs -> força JSON; max_tokens baixo -> economia
  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages,
    max_tokens: 250,
    temperature: 0.2
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    data = { action: "other", rationale_short: "JSON inválido do modelo", params: {} };
  }
  if (!data.action || !data.params) {
    data = { action: "other", rationale_short: "Schema ausente", params: {} };
  }
  return data;
}
