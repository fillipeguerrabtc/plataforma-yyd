"use client";

import { useEffect, useState } from "react";

type DailySummary = {
  date: string;
  totalCalls: number;
  totalTokens: number;
  totalCost: string;
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/telemetry/daily")
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch daily summary:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>⏳ Carregando analytics...</h1>
      </div>
    );
  }

  const totals = summary.reduce(
    (acc, s) => ({
      calls: acc.calls + s.totalCalls,
      tokens: acc.tokens + s.totalTokens,
      cost: acc.cost + Number(s.totalCost),
    }),
    { calls: 0, tokens: 0, cost: 0 }
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: "bold" }}>
        📈 Analytics Histórico - Últimos 30 Dias
      </h1>

      {/* Totals Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Card title="Total Calls (30d)" value={totals.calls.toLocaleString()} />
        <Card title="Total Tokens (30d)" value={totals.tokens.toLocaleString()} />
        <Card title="Total Cost (30d)" value={`€${totals.cost.toFixed(6)}`} />
      </div>

      {/* Daily Table */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Detalhamento Diário
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
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Calls</th>
                <th style={thStyle}>Tokens</th>
                <th style={thStyle}>Custo (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center" }}>
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                summary.map((s) => (
                  <tr key={s.date}>
                    <td style={tdStyle}>{s.date}</td>
                    <td style={tdStyle}>{s.totalCalls.toLocaleString()}</td>
                    <td style={tdStyle}>{s.totalTokens.toLocaleString()}</td>
                    <td style={tdStyle}>€{Number(s.totalCost).toFixed(6)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: "#fef3c7", fontWeight: "bold" }}>
                <td style={tdStyle}>TOTAL</td>
                <td style={tdStyle}>{totals.calls.toLocaleString()}</td>
                <td style={tdStyle}>{totals.tokens.toLocaleString()}</td>
                <td style={tdStyle}>€{totals.cost.toFixed(6)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={() => exportToCSV(summary)}
        style={{
          padding: "0.75rem 1.5rem",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        📥 Exportar CSV
      </button>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#dcfce7",
          borderRadius: "8px",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "#065f46" }}>
          💰 <strong>Economia Real:</strong> 100% dos custos estão no Cérebro Proxy (ChatGPT
          subscription), ZERO custos no Replit Agent.
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

function exportToCSV(summary: DailySummary[]) {
  const headers = ["Data", "Calls", "Tokens", "Custo (EUR)"];
  const rows = summary.map((s) => [
    s.date,
    s.totalCalls,
    s.totalTokens,
    Number(s.totalCost).toFixed(6),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `telemetry-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
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
