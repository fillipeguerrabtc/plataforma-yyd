-- Telemetria: histórico de métricas do Cérebro Proxy

CREATE TABLE IF NOT EXISTS metrics_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  app TEXT,
  route TEXT,
  calls INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  est_cost_total REAL
);

CREATE TABLE IF NOT EXISTS daily_summary (
  date TEXT PRIMARY KEY,
  total_calls INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost REAL DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_app ON metrics_history(app);
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_summary(date);
