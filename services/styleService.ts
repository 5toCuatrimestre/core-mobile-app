const API = "http://192.168.106.205:3000/style";

export const getActiveStyle = async () => {
  const response = await fetch(`${API}/active`);
  if (!response.ok) throw new Error("Active style not found");
  return response.json();
};

