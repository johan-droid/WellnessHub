const DEFAULT_LOCAL_API_URL = 'http://localhost:8787';
const DEFAULT_PROD_API_URL = 'https://wellnesshub01.sahooashutosh2022.workers.dev';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimTrailingSlash(trimmed);
  }

  // If protocol is missing, treat it as an HTTPS host.
  return trimTrailingSlash(`https://${trimmed}`);
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return normalizeUrl(configured);
  }

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
    return DEFAULT_PROD_API_URL;
  }

  return DEFAULT_LOCAL_API_URL;
}
