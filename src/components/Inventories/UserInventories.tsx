import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import useAuth from "@/Hooks/useAuth"
import { useOwnedInventories } from "@/Hooks/useInventories"
import type { InventoryDto } from "@/types/inventory"

const UserInventories = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data, isLoading, isError } = useOwnedInventories(user?.id, 1, 100)

  const columns: ColumnDef<InventoryDto>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t("inventories.table.title"),
        cell: ({ row }) => (
          <Link
            to={`/inventories/${row.original.id}`}
            className="font-medium underline-offset-2 hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "descriptionMd",
        header: t("inventories.table.description"),
        cell: ({ row }) => {
          const description = row.original.descriptionMd || ""
          return (
            <span className="text-muted-foreground">
              {description.length > 80
                ? `${description.slice(0, 80)}...`
                : description || t("inventories.table.emptyDescription")}
            </span>
          )
        },
      },
      {
        accessorKey: "isPublic",
        header: t("inventories.table.visibility"),
        cell: ({ row }) =>
          row.original.isPublic
            ? t("inventories.visibility.public")
            : t("inventories.visibility.private"),
      },
    ],
    [t]
  )

  const ownedItems = data?.items ?? []
  const accessItems: InventoryDto[] = []

  return (
    <section className="space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("inventories.pageTitle")}
          </h1>
          <p className="text-muted-foreground">{t("inventories.pageHint")}</p>
        </div>
        <Button asChild>
          <Link to="/inventories/create">{t("inventories.createNew")}</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t("inventories.owned")}</h2>
        {isLoading ? (
          <p className="text-muted-foreground">{t("inventories.loading")}</p>
        ) : isError ? (
          <p className="text-destructive">{t("inventories.loadError")}</p>
        ) : (
          <DataTable columns={columns} data={ownedItems} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("inventories.withAccess")}</h2>
          <span className="text-muted-foreground text-xs">
            {t("inventories.withAccessPending")}
          </span>
        </div>
        <DataTable columns={columns} data={accessItems} />
      </div>
    </section>
  )
}

export default UserInventories