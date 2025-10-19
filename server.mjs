import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import { reason } from "./logic/reasoner.mjs";
import { execute } from "./logic/executor.mjs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

// Cache simples em arquivo para economizar tokens em prompts repetidos
const CACHE_FILE = "./cache.json";
let cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE)) : {};
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
const keyOf = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64").slice(0, 40);

// 1) Endpoint do CÉREBRO PROXY (consome tokens, mas com limites e JSON estrito)
app.post("/reason", async (req, res) => {
  try {
    const { task, minimal_context } = req.body || {};
    const key = keyOf({ task, minimal_context });
    if (cache[key]) return res.json(cache[key]);

    const result = await reason({ task, minimal_context });
    cache[key] = result;
    saveCache();
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 2) Exemplo de endpoint que USA o proxy e EXECUTA localmente
app.post("/quote", async (req, res) => {
  try {
    const { customer_id, tour_id, date, seats } = req.body || {};
    const decision = await reason({
      task: "quote_price",
      minimal_context: { customer_id, tour_id, date, seats }
    });
    const result = await execute(decision);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// Healthcheck
app.get("/", (req, res) => res.send("YYD Reasoning Proxy + Executor ON"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
