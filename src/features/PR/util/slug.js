export const toSlug = (s) => (s ?? '').replace(/\s+/g, '_');
export const fromSlug = (s) => (s ?? '').replace(/_/g, ' ');