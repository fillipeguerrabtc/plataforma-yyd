"use client";

import { useState } from "react";

type TestResult = {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  data?: any;
};

export default function SelfCheckPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Proxy SDK reason() call
    try {
      const res = await fetch("/api/v1/telemetry/self-check/proxy-test");
      const data = await res.json();

      if (res.ok && data.success) {
        testResults.push({
          name: "Proxy SDK Test",
          status: "success",
          message: "✅ reason() via proxy-sdk funcional",
          data: data.result,
        });
      } else {
        testResults.push({
          name: "Proxy SDK Test",
          status: "error",
          message: `❌ Erro: ${data.error || "Unknown"}`,
        });
      }
    } catch (err) {
      testResults.push({
        name: "Proxy SDK Test",
        status: "error",
        message: `❌ Exceção: ${(err as Error).message}`,
      });
    }

    // Test 2: Direct OpenAI block
    try {
      const res = await fetch("/api/v1/telemetry/self-check/openai-block");
      const data = await res.json();

      if (data.blocked) {
        testResults.push({
          name: "Net-Guard Block Test",
          status: "success",
          message: "✅ Acesso direto a api.openai.com BLOQUEADO pelo net-guard",
          data: { error: data.error },
        });
      } else {
        testResults.push({
          name: "Net-Guard Block Test",
          status: "error",
          message: "❌ FALHA DE SEGURANÇA: OpenAI direto não está bloqueado!",
        });
      }
    } catch (err) {
      testResults.push({
        name: "Net-Guard Block Test",
        status: "error",
        message: `❌ Exceção: ${(err as Error).message}`,
      });
    }

    setResults(testResults);
    setRunning(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: "bold" }}>
        🔍 Self-Check - Prova de Dependência
      </h1>

      <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
        Este teste verifica que:<br />
        1. Todas as chamadas de IA passam pelo Cérebro Proxy (via @yyd/proxy-sdk)<br />
        2. Acesso direto a api.openai.com está bloqueado pelo net-guard
      </p>

      <button
        onClick={runTests}
        disabled={running}
        style={{
          padding: "1rem 2rem",
          background: running ? "#9ca3af" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: running ? "not-allowed" : "pointer",
          fontWeight: "600",
          fontSize: "1rem",
          marginBottom: "2rem",
        }}
      >
        {running ? "🔄 Executando testes..." : "▶️ Executar Testes"}
      </button>

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((result, i) => (
            <div
              key={i}
              style={{
                padding: "1.5rem",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderLeft: `4px solid ${
                  result.status === "success"
                    ? "#10b981"
                    : result.status === "error"
                    ? "#ef4444"
                    : "#f59e0b"
                }`,
              }}
            >
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                {result.name}
              </h3>
              <p style={{ marginBottom: "0.5rem", color: "#374151" }}>
                {result.message}
              </p>
              {result.data && (
                <pre
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "#f3f4f6",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && results.every((r) => r.status === "success") && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#dcfce7",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#065f46", fontWeight: "600" }}>
            ✅ <strong>TODOS OS TESTES PASSARAM!</strong><br />
            Sistema configurado corretamente - 100% das chamadas passam pelo Cérebro Proxy.
          </p>
        </div>
      )}
    </div>
  );
}
