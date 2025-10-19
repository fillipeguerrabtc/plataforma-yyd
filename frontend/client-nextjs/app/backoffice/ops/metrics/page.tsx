"use client";

import { useEffect, useState } from "react";

type Metrics = {
  calls: number;
  prompt_tokens: number;
  completion_tokens: number;
  est_cost_total: number;
};

type RecentMetric = {
  timestamp: string;
  app: string;
  calls: number;
  promptTokens: number;
  completionTokens: number;
  estCostTotal: string;
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recent, setRecent] = useState<RecentMetric[]>([]);
  const [proxyStatus, setProxyStatus] = useState<"ok" | "error" | "loading">("loading");
  const [netGuardStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      // Fetch proxy metrics
      const proxyUrl = process.env.NEXT_PUBLIC_REASON_PROXY_URL || "http://localhost:3000";
      const res = await fetch(`${proxyUrl}/metrics`);
      
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setProxyStatus("ok");
      } else {
        setProxyStatus("error");
      }
    } catch (err) {
      console.error("Failed to fetch proxy metrics:", err);
      setProxyStatus("error");
    }

    try {
      // Fetch recent metrics from database
      const dbRes = await fetch("/api/v1/telemetry/recent");
      if (dbRes.ok) {
        const data = await dbRes.json();
        setRecent(data);
      }
    } catch (err) {
      console.error("Failed to fetch DB metrics:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Auto-refresh 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>⏳ Carregando métricas...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: "bold" }}>
        📊 Métricas em Tempo Real - Cérebro Proxy
      </h1>

      {/* Status Badges */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            background: proxyStatus === "ok" ? "#10b981" : "#ef4444",
            color: "white",
            fontWeight: "600",
          }}
        >
          {proxyStatus === "ok" ? "✅ USING CÉREBRO PROXY" : "❌ PROXY OFFLINE"}
        </div>
        <div
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            background: netGuardStatus === "active" ? "#ef4444" : "#gray",
            color: "white",
            fontWeight: "600",
          }}
        >
          🔒 OPENAI DIRECT: BLOCKED
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Card title="Total Calls" value={metrics.calls.toLocaleString()} />
          <Card
            title="Prompt Tokens"
            value={metrics.prompt_tokens.toLocaleString()}
          />
          <Card
            title="Completion Tokens"
            value={metrics.completion_tokens.toLocaleString()}
          />
          <Card
            title="Total Tokens"
            value={(metrics.prompt_tokens + metrics.completion_tokens).toLocaleString()}
          />
          <Card
            title="Custo Total (EUR)"
            value={`€${metrics.est_cost_total.toFixed(6)}`}
          />
        </div>
      )}

      {/* Recent Activity */}
      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Atividade Recente (últimas 10)
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>App</th>
                <th style={thStyle}>Calls</th>
                <th style={thStyle}>Tokens</th>
                <th style={thStyle}>Custo (€)</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center" }}>
                    Nenhuma atividade recente
                  </td>
                </tr>
              ) : (
                recent.map((m, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{new Date(m.timestamp).toLocaleString()}</td>
                    <td style={tdStyle}>{m.app}</td>
                    <td style={tdStyle}>{m.calls}</td>
                    <td style={tdStyle}>{m.promptTokens + m.completionTokens}</td>
                    <td style={tdStyle}>€{Number(m.estCostTotal).toFixed(6)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", background: "#fef3c7", borderRadius: "8px" }}>
        <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
          💡 <strong>Auto-refresh:</strong> Esta página atualiza automaticamente a cada 5 segundos
        </p>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
        {title}
      </div>
      <div style={{ fontSize: "1.875rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.75rem",
  textAlign: "left",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "#374151",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderTop: "1px solid #e5e7eb",
  fontSize: "0.875rem",
};
