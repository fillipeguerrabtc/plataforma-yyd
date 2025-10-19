import fetch from "node-fetch";

const PROXY_URL = process.env.REASON_PROXY_URL;

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export function ensureShortJson(obj: any, maxChars = 1200) {
  const s = JSON.stringify(obj);
  if (s.length <= maxChars) return obj;
  return { note: "truncated", keys: Object.keys(obj).slice(0, 20) };
}

export type ReasonResponse = {
  action: string;
  params: Record<string, any>;
  reasoning?: string;
};

export async function reason(task: string, minimalContext: Record<string, any>, tries = 3): Promise<ReasonResponse> {
  if (!PROXY_URL) throw new Error("REASON_PROXY_URL not set");
  const body = { task, minimal_context: ensureShortJson(minimalContext) };
  let last: any;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${PROXY_URL}/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Proxy error " + res.status);
      const data = await res.json() as any;
      if (!data?.action || !data?.params) throw new Error("Invalid JSON from proxy");
      return data as ReasonResponse;
    } catch (e) {
      last = e;
      await sleep(400 * Math.pow(2, i));
    }
  }
  throw last;
}
