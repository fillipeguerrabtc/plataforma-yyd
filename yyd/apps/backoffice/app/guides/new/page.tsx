'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

export default function NewGuidePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    languages: '',
    certifications: '',
    photoUrl: '',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        ...formData,
        languages: formData.languages.split(',').map((l) => l.trim()),
        certifications: formData.certifications
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c),
      };

      // Only include password if it's set
      if (!formData.password) {
        delete payload.password;
      }

      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/guides');
      } else {
        alert('Erro ao criar guia');
      }
    } catch (error) {
      console.error('Error creating guide:', error);
      alert('Erro ao criar guia');
    } finally {
      setSubmitting(false);
    }
  };

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
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-700)',
                }}
              >
                Senha (Opcional)
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Deixe em branco se não quiser definir senha agora"
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
                {submitting ? 'Adicionando...' : 'Adicionar Guia'}
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
