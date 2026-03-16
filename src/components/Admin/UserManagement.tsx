import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useAdminUsers, useAdminUserActions } from "@/Hooks/useAdminUsers"
import { Shield, ShieldOff, Ban, CheckCircle2, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

export default function UserManagement() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useAdminUsers(1, 100)

  const {
    blockUsers,
    unblockUsers,
    deleteUsers,
    addAdminRoles,
    removeAdminRoles,
  } = useAdminUserActions()

  const handleAction = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: any,
    userIds: string[],
    successI18nKey: string
  ) => {
    await action.mutateAsync(userIds)
    toast.success(t(successI18nKey))
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-gray-500"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border border-black"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "displayName",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "isAdmin",
      header: "Role",
      cell: ({ row }) => {
        const isAdmin = row.getValue("isAdmin")
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              isAdmin
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>
        )
      },
    },
    {
      accessorKey: "isBlocked",
      header: "Status",
      cell: ({ row }) => {
        const isBlocked = row.getValue("isBlocked")
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              isBlocked
                ? "bg-destructive/10 text-destructive"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isBlocked ? "Blocked" : "Active"}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
  ]

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Failed to load users</div>
    )

  return (
    <div className="space-y-6 border-transparent py-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage your platform users and their roles here.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        renderToolbar={(table) => {
          const selectedRows = table.getFilteredSelectedRowModel().rows
          const selectedIds = selectedRows.map((r) => r.original.id)
          const hasSelection = selectedIds.length > 0

          return (
            <div className="mb-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !hasSelection ||
                  !!selectedRows.find((r) => {
                    const user = r.original
                    return user.isBlocked
                  }) ||
                  blockUsers.isPending
                }
                onClick={() => {
                  handleAction(blockUsers, selectedIds, "admin.usersBlocked")
                  table.resetRowSelection()
                }}
              >
                <Ban className="mr-2 h-4 w-4" /> Block
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !hasSelection ||
                  !!selectedRows.find((r) => {
                    const user = r.original
                    return !user.isBlocked
                  }) ||
                  unblockUsers.isPending
                }
                onClick={() => {
                  handleAction(
                    unblockUsers,
                    selectedIds,
                    "admin.usersUnblocked"
                  )
                  table.resetRowSelection()
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Unblock
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !hasSelection ||
                  !!selectedRows.find((r) => {
                    const user = r.original
                    return user.isAdmin
                  }) ||
                  addAdminRoles.isPending
                }
                onClick={() => {
                  handleAction(addAdminRoles, selectedIds, "admin.rolesAdded")
                  table.resetRowSelection()
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Make Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !hasSelection ||
                  !!selectedRows.find((r) => {
                    const user = r.original
                    return !user.isAdmin
                  }) ||
                  removeAdminRoles.isPending
                }
                onClick={() => {
                  handleAction(
                    removeAdminRoles,
                    selectedIds,
                    "admin.rolesRemoved"
                  )
                  table.resetRowSelection()
                }}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Remove Admin
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!hasSelection || deleteUsers.isPending}
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete the selected users?"
                    )
                  ) {
                    handleAction(deleteUsers, selectedIds, "admin.usersDeleted")
                    table.resetRowSelection()
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )
        }}
      />
    </div>
  )
}
