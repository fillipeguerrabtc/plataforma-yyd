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

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getBackOfficeToken();
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeBackOfficeToken();
    window.location.href = '/backoffice/auth/login';
  }

  return response;
}
