import axios from "axios"
import { showApiErrorToast } from "@/lib/apiError"
const axiosPublic = axios.create({ baseURL: import.meta.env.VITE_SERVER_URL })

const useAxiosPublic = () => {
  axiosPublic.interceptors.response.use(
    (response) => response,
    (error) => {
      showApiErrorToast(error)
      return Promise.reject(error)
    }
  )
  return axiosPublic
}

export default useAxiosPublic
