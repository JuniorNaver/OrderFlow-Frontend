const ROOT = 'http://localhost:8080/api/v1/pr';
const BROWSE = `${ROOT}/browse`; // corners / categories / products
const INV = ROOT;                // inventory APIs

async function jsonOrThrow(res, fallbackMsg) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || fallbackMsg);
  }
  return res.json();
}

async function okOrThrow(res, fallback) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || fallback);
  }
}

// 인벤토리 
export async function fetchAvailable(gtin) {
  const res = await fetch(`${INV}/inventory?gtin=${encodeURIComponent(gtin)}`, { credentials: 'include' });
  return jsonOrThrow(res, 'failed to load inventory');
}

export async function reserve(gtin, qty = 1) {
  const res = await fetch(`${INV}/inventory/reserve`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gtin, qty })
  });
  return okOrThrow(res, 'failed to reserve');
}

// 필요 시 release/commit도 같은 방식으로:
export async function release(gtin, qty = 1) {
  const res = await fetch(`${INV}/inventory/release`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gtin, qty })
  });
  return okOrThrow(res, 'failed to release');
}

export async function commit(gtin, qty = 1) {
  const res = await fetch(`${INV}/inventory/commit`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gtin, qty })
  });
  return okOrThrow(res, 'failed to commit');
}


// browse
export async function fetchCorners(zone) {
  const res = await fetch(`${BROWSE}/corners?zone=${encodeURIComponent(zone)}`, { credentials: 'include' });
  return jsonOrThrow(res, 'failed to loda corners');
}

export async function fetchCategories(zone, cornerId) {
  const res = await fetch(`${BROWSE}/categories?zone=${encodeURIComponent(zone)}&cornerId=${encodeURIComponent(cornerId)}`, { credentials: 'include' });
  return  jsonOrThrow(res, 'failed to load categories');
}

export async function fetchProducts(kan, page = 0, size = 20) {
  const res = await fetch(
    `${BROWSE}/products?kan=${encodeURIComponent(kan)}&page=${page}&size=${size}`,
    { credentials: 'include' }
  );
  return jsonOrThrow(res, 'failed to load products');
}