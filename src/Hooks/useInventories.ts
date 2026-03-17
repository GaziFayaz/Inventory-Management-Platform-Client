import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import useAxiosSecure from "./useAxiosSecure"
import type {
  CreateInventoryInput,
  CreateInventoryResponse,
  InventoryListResponse,
} from "@/types/inventory"

export const useOwnedInventories = (
  ownerId?: string,
  page = 1,
  pageSize = 20
) => {
  const axiosSecure = useAxiosSecure()

  return useQuery({
    queryKey: ["inventories", "owned", ownerId, page, pageSize],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data } = await axiosSecure.get<InventoryListResponse>(
        "/inventories",
        {
          params: {
            ownerId,
            page,
            pageSize,
          },
        }
      )

      return data.data
    },
  })
}

export const useCreateInventory = () => {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateInventoryInput) => {
      const formData = new FormData()

      formData.append("title", payload.title)
      formData.append("isPublic", String(payload.isPublic))

      if (payload.descriptionMd) {
        formData.append("descriptionMd", payload.descriptionMd)
      }

      if (payload.categoryId !== undefined) {
        formData.append("categoryId", String(payload.categoryId))
      }

      if (payload.imageFile) {
        formData.append("imageFile", payload.imageFile)
      }

      payload.tagNames?.forEach((tagName) => {
        formData.append("tagNames", tagName)
      })

      const { data } = await axiosSecure.post<CreateInventoryResponse>(
        "/inventories",
        formData
      )

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories", "owned"] })
    },
  })
}