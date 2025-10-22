'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

type Guide = {
  id: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  bio?: string;
  photoUrl?: string;
  certifications?: string[];
  active: boolean;
};

export default function EditGuidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    languages: '',
    certifications: '',
    photoUrl: '',
    bio: '',
    active: true,
  });

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    try {
      const res = await fetch(`/api/guides/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setGuide(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          languages: data.languages.join(', '),
          certifications: data.certifications?.join(', ') || '',
          photoUrl: data.photoUrl || '',
          bio: data.bio || '',
          active: data.active,
        });
      }
    } catch (error) {
      console.error('Error fetching guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/guides/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          languages: formData.languages.split(',').map((l) => l.trim()),
          certifications: formData.certifications
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c),
        }),
      });

      if (res.ok) {
        router.push('/guides');
      } else {
        alert('Erro ao atualizar guia');
      }
    } catch (error) {
      console.error('Error updating guide:', error);
      alert('Erro ao atualizar guia');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!guide) {
    return <div>Guia não encontrado</div>;
  }

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
          Editar Guia: {guide.name}
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={submitting}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={submitting}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={submitting}
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
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="ex: Português, Inglês, Espanhol"
                required
                disabled={submitting}
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
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="ex: Guia Turístico Certificado, Primeiros Socorros"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <ProfilePhotoUpload
              currentPhoto={formData.photoUrl}
              onPhotoChange={(photoUrl) => setFormData({ ...formData, photoUrl })}
              disabled={submitting}
            />

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
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Conte um pouco sobre a experiência do guia..."
                disabled={submitting}
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

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  disabled={submitting}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>
                  Guia Ativo
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: submitting ? 'var(--gray-400)' : 'var(--brand-turquoise)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
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
