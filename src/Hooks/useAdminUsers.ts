import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

interface UserListResponse {
  success: boolean;
  status: number;
  data: {
    items: User[];
    page: number;
    pageSize: number;
    totalCount: number;
  };
}

export const useAdminUsers = (page = 1, pageSize = 20, search?: string) => {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["admin-users", page, pageSize, search],
    queryFn: async () => {
      const { data } = await axiosSecure.get<UserListResponse>("/admin/users", {
        params: { page, pageSize, search },
      });
      return data.data;
    },
  });
};

export const useAdminUserActions = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const onSuccessInit = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const blockUsers = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data } = await axiosSecure.put("/admin/users/block", userIds);
      return data;
    },
    onSuccess: onSuccessInit,
  });

  const unblockUsers = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data } = await axiosSecure.put("/admin/users/unblock", userIds);
      return data;
    },
    onSuccess: onSuccessInit,
  });

  const deleteUsers = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data } = await axiosSecure.delete("/admin/users", { data: userIds });
      return data;
    },
    onSuccess: onSuccessInit,
  });

  const addAdminRoles = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data } = await axiosSecure.post("/admin/users/roles/admin", userIds);
      return data;
    },
    onSuccess: onSuccessInit,
  });

  const removeAdminRoles = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data } = await axiosSecure.delete("/admin/users/roles/admin", { data: userIds });
      return data;
    },
    onSuccess: onSuccessInit,
  });

  return {
    blockUsers,
    unblockUsers,
    deleteUsers,
    addAdminRoles,
    removeAdminRoles,
  };
};
