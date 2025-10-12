export const saveHold = (holdData) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  const newHold = { 
    id: Date.now(), 
    createdAt: new Date().toISOString(), 
    items: holdData 
  };
  holds.push(newHold);
  localStorage.setItem("holds", JSON.stringify(holds));
};

export const getHolds = () => JSON.parse(localStorage.getItem("holds") || "[]");

export const deleteHold = (id) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  const updated = holds.filter((h) => h.id !== id);
  localStorage.setItem("holds", JSON.stringify(updated));
};

export const getHoldById = (id) => {
  const holds = JSON.parse(localStorage.getItem("holds") || "[]");
  return holds.find((h) => h.id === id);
};