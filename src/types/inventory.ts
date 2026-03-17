export interface InventoryDto {
  id: string
  title: string
  descriptionMd?: string | null
  imageUrl?: string | null
  categoryId?: number | null
  isPublic: boolean
  ownerId?: string
  ownerDisplayName?: string
  tagNames?: string[]
  createdAt?: string
  updatedAt?: string
  version?: number
}

export interface InventoryListResult {
  items: InventoryDto[]
  page: number
  pageSize: number
  totalCount: number
}

export interface InventoryListResponse {
  success: boolean
  status: number
  data: InventoryListResult
}

export interface CreateInventoryInput {
  title: string
  descriptionMd?: string
  imageFile?: File
  categoryId?: number
  isPublic: boolean
  tagNames?: string[]
}

export interface CreateInventoryResponse {
  success: boolean
  status: number
  data: InventoryDto
}