import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { useCreateInventory } from "@/Hooks/useInventories"

interface CreateInventoryFormValues {
  title: string
  descriptionMd: string
  categoryId: string
  isPublic: boolean
  tags: string
  imageFile: FileList
}

const CreateInventory = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createInventory = useCreateInventory()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInventoryFormValues>({
    defaultValues: {
      title: "",
      descriptionMd: "",
      categoryId: "",
      isPublic: false,
      tags: "",
    },
  })

  const onSubmit = async (values: CreateInventoryFormValues) => {
    const tagNames = values.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

    await createInventory.mutateAsync({
      title: values.title.trim(),
      descriptionMd: values.descriptionMd.trim() || undefined,
      categoryId: values.categoryId ? Number(values.categoryId) : undefined,
      isPublic: values.isPublic,
      tagNames,
      imageFile: values.imageFile?.[0],
    })

    toast.success(t("inventories.createSuccess"))
    navigate("/user-inventories")
  }

  return (
    <section className="mx-auto w-full max-w-2xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("inventories.createPageTitle")}
        </h1>
        <p className="text-muted-foreground">{t("inventories.createPageHint")}</p>
      </div>

      <form
        className="space-y-4 rounded-md border p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            {t("inventories.form.title")}
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={t("inventories.form.titlePlaceholder")}
            {...register("title", {
              required: t("inventories.form.titleRequired"),
            })}
          />
          {errors.title ? (
            <p className="text-destructive text-xs">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="descriptionMd" className="text-sm font-medium">
            {t("inventories.form.description")}
          </label>
          <textarea
            id="descriptionMd"
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={t("inventories.form.descriptionPlaceholder")}
            {...register("descriptionMd")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="categoryId" className="text-sm font-medium">
              {t("inventories.form.categoryId")}
            </label>
            <input
              id="categoryId"
              type="number"
              min={1}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("inventories.form.categoryIdPlaceholder")}
              {...register("categoryId")}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tags" className="text-sm font-medium">
              {t("inventories.form.tags")}
            </label>
            <input
              id="tags"
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("inventories.form.tagsPlaceholder")}
              {...register("tags")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="imageFile" className="text-sm font-medium">
            {t("inventories.form.image")}
          </label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("imageFile")}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            type="checkbox"
            className="size-4"
            {...register("isPublic")}
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            {t("inventories.form.isPublic")}
          </label>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={createInventory.isPending}>
            {createInventory.isPending
              ? t("inventories.form.creating")
              : t("inventories.form.create")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/user-inventories")}
          >
            {t("inventories.form.cancel")}
          </Button>
        </div>
      </form>
    </section>
  )
}

export default CreateInventory