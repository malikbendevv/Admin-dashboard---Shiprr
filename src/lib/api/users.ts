import api from "@/lib/axiosInstance";
import type { Params, User, UsersResponse } from "@/types";

export async function fetchUsers(params: Params): Promise<UsersResponse> {
  const res = await api.get("/users", { params });
  return res.data;
}

export const getUsers = (params: Params) => api.get("/users", { params });
export const addUser = (data: Partial<User>) => api.post("/users", data);
export const editUser = (id: string | number, data: Partial<User>) =>
  api.put(`/users/${id}`, data);
export const deleteUser = (id: string | number) => api.delete(`/users/${id}`);
