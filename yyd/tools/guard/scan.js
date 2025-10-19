import fs from "fs";
import path from "path";

const ban = /['"]openai['"]/;

function walk(dir, bad = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (p.includes("packages/proxy-sdk")) continue;
    if (p.includes("tools/guard")) continue;
    if (p.includes("node_modules") || p.includes(".github")) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p, bad);
    } else if (/\.(js|mjs|ts|tsx)$/.test(p)) {
      const src = fs.readFileSync(p, "utf8");
      if (ban.test(src)) bad.push(p);
    }
  }
  return bad;
}

const offenders = walk(process.cwd());
if (offenders.length) {
  console.error("❌ Uso direto de 'openai' proibido:", offenders);
  process.exit(1);
}
console.log("✅ Nenhum uso direto de 'openai' encontrado.");
