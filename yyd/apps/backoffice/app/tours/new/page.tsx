import TourForm from '@/components/TourForm';

export default function NewTourPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          ➕ Adicionar Novo Tour
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Crie um novo tour com informações multilíngue, preços sazonais e atividades
        </p>
      </div>

      <TourForm />
    </div>
  );
}
