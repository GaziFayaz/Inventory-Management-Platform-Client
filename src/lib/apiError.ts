import axios from "axios"
import i18n from "@/i18n"
import { toast } from "react-toastify"
import type { ApiErrorResponse } from "@/types/api"

export interface NormalizedApiError {
  errorCode?: string
  message?: string
  status?: number
}

export const normalizeApiError = (err: unknown): NormalizedApiError => {
  if (axios.isAxiosError(err)) {
    const errorData = err.response?.data as ApiErrorResponse | undefined

    if (!err.response) {
      return {
        errorCode: "network_error",
        message: err.message,
      }
    }

    return {
      errorCode: errorData?.errorCode,
      message: errorData?.message,
      status: err.response.status,
    }
  }

  return {
    errorCode: "error",
    message: err instanceof Error ? err.message : "An unknown error occurred",
  }
}

export const translateApiError = (error: NormalizedApiError): string => {
  if (error.errorCode) {
    const translationKey = `errors.${error.errorCode}`
    if (i18n.exists(translationKey)) {
      return i18n.t(translationKey)
    }
  }

  // when backend sends fallback error
  if (error.message && error.errorCode !== "error") {
    return error.message
  }

  return i18n.t("errors.error")
}

export const showApiErrorToast = (err: unknown) => {
  if (axios.isCancel(err)) {
    return
  }

  const normalized = normalizeApiError(err)
  const message = translateApiError(normalized)

  toast.error(message)
}
