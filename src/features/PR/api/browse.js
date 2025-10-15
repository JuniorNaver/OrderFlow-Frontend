import apiClient from "../../../services/apiClient";


export async function getCorners(zone) {
  const { data } = await apiClient.get("/api/v1/pr/browse/corners", {
    params: { zone },
  });
  return data; // [{id,name,desc}]
}

export async function getCategories(zone, cornerId) {
  const { data } = await apiClient.get("/api/v1/pr/browse/categories", {
    params: { zone, cornerId },
  });
  return data; // [{id,name,childrenCount}]
}