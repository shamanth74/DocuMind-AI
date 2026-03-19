import api from "@/lib/api";

export const getCurrentUser = async (token: string) => {
  const res = await api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};