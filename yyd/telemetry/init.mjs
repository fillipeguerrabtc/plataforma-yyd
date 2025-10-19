/**
 * Inicializa banco SQLite de telemetria
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "telemetry.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

console.log("📊 Inicializando banco de telemetria...");

const db = new Database(DB_PATH);
const schema = fs.readFileSync(SCHEMA_PATH, "utf8");

db.exec(schema);

console.log("✅ Banco criado em:", DB_PATH);
db.close();
