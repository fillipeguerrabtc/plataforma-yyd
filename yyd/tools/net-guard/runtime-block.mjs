/**
 * Runtime Network Guard - Bloqueia qualquer chamada direta a OpenAI
 * Importar no bootstrap de todos os apps para garantir bloqueio total
 */

const BLOCKED_DOMAINS = [
  "api.openai.com",
  "openai.com",
  "platform.openai.com"
];

const originalFetch = globalThis.fetch;
const originalHttpRequest = async () => {
  try {
    const http = await import("http");
    const https = await import("https");
    return { http, https };
  } catch {
    return null;
  }
};

// Sobrescrever fetch global
globalThis.fetch = function (url, ...args) {
  const urlStr = typeof url === "string" ? url : url.toString();
  
  for (const domain of BLOCKED_DOMAINS) {
    if (urlStr.includes(domain)) {
      throw new Error(
        `🔒 NET-GUARD: Bloqueado acesso direto a ${domain}. Use @yyd/proxy-sdk.`
      );
    }
  }
  
  return originalFetch.call(this, url, ...args);
};

// Bloquear http/https request também
(async () => {
  const modules = await originalHttpRequest();
  if (!modules) return;
  
  const { http, https } = modules;
  
  const wrapRequest = (original) => {
    return function (url, ...args) {
      const urlStr = typeof url === "string" ? url : url.hostname || url.host || "";
      
      for (const domain of BLOCKED_DOMAINS) {
        if (urlStr.includes(domain)) {
          throw new Error(
            `🔒 NET-GUARD: Bloqueado acesso direto a ${domain}. Use @yyd/proxy-sdk.`
          );
        }
      }
      
      return original.call(this, url, ...args);
    };
  };
  
  if (http.request) http.request = wrapRequest(http.request);
  if (http.get) http.get = wrapRequest(http.get);
  if (https.request) https.request = wrapRequest(https.request);
  if (https.get) https.get = wrapRequest(https.get);
})();

console.log("🛡️ NET-GUARD: Runtime blocker ativo - OpenAI direto BLOQUEADO");

export default {
  BLOCKED_DOMAINS,
  enabled: true
};
