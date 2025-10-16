const BASE = 'http://localhost:8080/api/v1/pr/browse';


export async function fetchCorners(zone) {
  const res = await fetch(`${BASE}/corners?zone=${zone}`, { credentials: 'include' });
  if (!res.ok) throw new Error('failed to load corners');
  return res.json();
}
export async function fetchCategories(zone, cornerId) {
  const res = await fetch(`${BASE}/categories?zone=${zone}&cornerId=${encodeURIComponent(cornerId)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('failed to load categories');
  return res.json();
}