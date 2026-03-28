import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addUser, editUser, fetchUsers } from "@/lib/api/users";
import type { User, Params, UsersResponse } from "@/types";

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: number }) =>
      editUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUsers(params: Params) {
  return useQuery<UsersResponse>({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000,
  });
}
