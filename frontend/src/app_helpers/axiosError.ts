import axios from 'axios'

type ErrorResponse = {
  status?: number
  data?: unknown
}

type ErrorDetailPayload = {
  detail?: string
}

export const getErrorResponse = (error: unknown): ErrorResponse => {
  if (typeof axios.isAxiosError === 'function' && axios.isAxiosError(error)) {
    return {
      status: error.response?.status,
      data: error.response?.data,
    }
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: ErrorResponse }).response
    return {
      status: response?.status,
      data: response?.data,
    }
  }

  return {}
}

export const getErrorDetail = (data: unknown): string | undefined => {
  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as ErrorDetailPayload).detail
    if (typeof detail === 'string') {
      return detail
    }
  }

  return undefined
}

export const getErrorMessage = (error: unknown, fallback: string) => {
  const { data } = getErrorResponse(error)
  const detail = getErrorDetail(data)
  if (detail) {
    return detail
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
