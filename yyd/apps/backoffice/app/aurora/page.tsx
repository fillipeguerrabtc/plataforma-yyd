'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'aurora';
  content: string;
  timestamp: Date;
};

export default function AuroraPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sessionId] = useState(`backoffice-test-${Date.now()}`);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/aurora/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          language,
        }),
      });

      const data = await res.json();

      const auroraMessage: Message = {
        role: 'aurora',
        content: data.response || data.error || 'No response',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, auroraMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'aurora',
          content: 'Error: Failed to connect to Aurora service',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Aurora IA - Chat Testing</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Test Aurora's AI chat capabilities directly from the backoffice
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Chat</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '2rem' }}>
                Start a conversation with Aurora...
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      background: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
                      color: msg.role === 'user' ? 'white' : '#1f2937',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      marginTop: '0.25rem',
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: '#f3f4f6',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
                    Aurora is typing...
                  </p>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            style={{
              padding: '1rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '0.5rem 1.5rem',
                background: loading || !input.trim() ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              Send
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Quick Setup
            </h2>
            <ol style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li>Configure OPENAI_API_KEY (already set ✅)</li>
              <li>Set WHATSAPP_ACCESS_TOKEN & WHATSAPP_PHONE_NUMBER_ID</li>
              <li>Set FACEBOOK_PAGE_ACCESS_TOKEN & FACEBOOK_PAGE_ID</li>
              <li>Configure webhooks in WhatsApp/Facebook panels</li>
              <li>Aurora will respond automatically!</li>
            </ol>
          </div>

          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Aurora Capabilities
            </h2>
            <ul style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li>Multilingual support (EN, PT, ES)</li>
              <li>Tour information & pricing</li>
              <li>Booking assistance</li>
              <li>Stripe payment links</li>
              <li>Automatic confirmations</li>
              <li>Smart follow-ups</li>
            </ul>
          </div>

          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Test Scenarios
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setInput('Hello! What tours do you offer?')}
                style={{
                  padding: '0.5rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Tour information
              </button>
              <button
                onClick={() => setInput('I want to book the Half-Day Tour for 4 people')}
                style={{
                  padding: '0.5rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Booking request
              </button>
              <button
                onClick={() => setInput('What are your prices?')}
                style={{
                  padding: '0.5rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Pricing inquiry
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Session Info
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              <p>
                <strong>Session ID:</strong>
              </p>
              <p style={{ fontFamily: 'monospace', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                {sessionId}
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                <strong>Language:</strong> {language.toUpperCase()}
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                <strong>Messages:</strong> {messages.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
