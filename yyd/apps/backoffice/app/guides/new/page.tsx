import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function createGuide(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const languages = (formData.get('languages') as string).split(',').map((l) => l.trim());
  const bio = formData.get('bio') as string;
  const photoUrl = formData.get('photoUrl') as string;
  const certifications = (formData.get('certifications') as string)
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c);

  await prisma.guide.create({
    data: {
      name,
      email,
      phone,
      languages,
      bio: bio || null,
      photoUrl: photoUrl || null,
      certifications,
      active: true,
    },
  });

  redirect('/guides');
}

export default function NewGuidePage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link
          href="/guides"
          style={{
            padding: '0.5rem',
            background: 'var(--gray-200)',
            borderRadius: '6px',
            display: 'inline-flex',
          }}
        >
          ← Voltar
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          Adicionar Novo Guia
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '800px' }}>
        <form action={createGuide}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-700)',
                }}
              >
                Nome Completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: 'var(--gray-700)',
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: 'var(--gray-700)',
                  }}
                >
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="languages"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-700)',
                }}
              >
                Idiomas (separados por vírgula) *
              </label>
              <input
                type="text"
                id="languages"
                name="languages"
                placeholder="ex: Português, Inglês, Espanhol"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="certifications"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-700)',
                }}
              >
                Certificações (separadas por vírgula)
              </label>
              <input
                type="text"
                id="certifications"
                name="certifications"
                placeholder="ex: Guia Turístico Certificado, Primeiros Socorros"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="photoUrl"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-700)',
                }}
              >
                URL da Foto
              </label>
              <input
                type="url"
                id="photoUrl"
                name="photoUrl"
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-700)',
                }}
              >
                Biografia
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Conte um pouco sobre a experiência do guia..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'var(--brand-turquoise)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Adicionar Guia
              </button>
              <Link
                href="/guides"
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'var(--gray-200)',
                  color: 'var(--gray-700)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
