
export function filterCategories(list, keyword) {
   if (!Array.isArray(list) || !keyword?.trim()) return list ?? [];
  const q = keyword.trim().toLowerCase();
  return list.filter((c) => {
    const hay = [
      c?.name,
      c?.categoryName,
      c?.smallCategory,
      c?.mediumCategory,
      c?.largeCategory,
      c?.totalCategory,
      c?.kanCode,
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
}