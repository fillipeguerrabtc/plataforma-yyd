export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#37C8C4' }}>
        🚗 Yes You Deserve Tours
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2rem' }}>
        Premium Electric Tuk-Tuk Tours in Sintra & Cascais, Portugal
      </p>
      
      <div style={{ 
        padding: '2rem', 
        background: 'linear-gradient(135deg, #37C8C4 0%, #E9C46A 100%)', 
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>✨ Clean Slate - Ready to Build</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
          The platform has been reset and is ready for your next steps.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ color: '#7E3231', marginBottom: '0.5rem' }}>🗄️ Database</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            PostgreSQL connected with Prisma schema (7 tables)
          </p>
        </div>

        <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ color: '#7E3231', marginBottom: '0.5rem' }}>⚡ Stack</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Next.js 14, TypeScript, pnpm workspaces
          </p>
        </div>

        <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ color: '#7E3231', marginBottom: '0.5rem' }}>🎨 Design</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Turquoise, Gold, Bordeaux color palette
          </p>
        </div>
      </div>
    </div>
  );
}
