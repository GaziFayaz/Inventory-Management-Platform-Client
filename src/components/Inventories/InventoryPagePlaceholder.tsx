import { useTranslation } from "react-i18next"

const InventoryPagePlaceholder = () => {
  const { t } = useTranslation()

  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("inventories.inventoryPageTitle")}
      </h1>
    </section>
  )
}

export default InventoryPagePlaceholder