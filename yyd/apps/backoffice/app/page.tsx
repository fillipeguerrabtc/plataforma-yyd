export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#7E3231' }}>🏢 YYD Backoffice</h1>
      <p style={{ marginTop: '1rem', color: '#6b7280' }}>
        Administrative dashboard - Clean slate, ready to build
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>✅ System Ready</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ PostgreSQL database connected</li>
          <li>✅ Prisma schema configured (7 tables)</li>
          <li>✅ Next.js 14 running on port 3001</li>
          <li>✅ TypeScript monorepo structure</li>
        </ul>
      </div>
    </div>
  );
}
