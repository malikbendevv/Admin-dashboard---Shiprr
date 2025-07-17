import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addUser, editUser, fetchUsers } from "@/lib/api/users";
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface PaginationInfo {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  usersFetched: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
  // Fallback properties for backward compatibility
  data?: User[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: User[] | number | PaginationInfo | undefined;
}

export interface Params {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  role?: "admin" | "customer" | "driver" | "";
}

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUser,

    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });
}

export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => editUser(id, data),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });
}

export function useUsers(params: Params) {
  return useQuery<UsersResponse>({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
