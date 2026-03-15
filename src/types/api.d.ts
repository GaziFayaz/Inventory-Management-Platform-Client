export interface ApiErrorResponse {
  success?: boolean
  status?: number
  message?: string
  errorCode?: string

  // Development only fields
  exceptionType?: string
  stackTrace?: string
}
