export function getBackOfficeToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('backoffice_token');
}

export function setBackOfficeToken(token: string): void {
  localStorage.setItem('backoffice_token', token);
}

export function removeBackOfficeToken(): void {
  localStorage.removeItem('backoffice_token');
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getBackOfficeToken();
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Prepend API_URL if url starts with /api
  const fullUrl = url.startsWith('/api') ? `${API_URL}${url}` : url;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeBackOfficeToken();
    window.location.href = '/backoffice/auth/login';
  }

  return response;
}
