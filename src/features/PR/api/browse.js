const BASE = 'http://localhost:8080/api/v1/pr/browse';

async function jsonOrThrow(res, fallbackMsg) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || fallbackMsg);
  }
  return res.json();
}

export async function fetchCorners(zone) {
  const res = await fetch(`${BASE}/corners?zone=${encodeURIComponent(zone)}`, { credentials: 'include' });
  return jsonOrThrow(res, 'failed to loda corners');
}

export async function fetchCategories(zone, cornerId) {
  const res = await fetch(`${BASE}/categories?zone=${encodeURIComponent(zone)}&cornerId=${encodeURIComponent(cornerId)}`, { credentials: 'include' });
  return  jsonOrThrow(res, 'failed to load categories');
}

export async function fetchProducts(kan, page = 0, size = 20) {
  const res = await fetch(
    `${BASE}/products?kan=${encodeURIComponent(kan)}&page=${page}&size=${size}`,
    { credentials: 'include' }
  );
  return jsonOrThrow(res, 'failed to load products');
}