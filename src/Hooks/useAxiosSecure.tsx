import axios from "axios"
import { useNavigate } from "react-router-dom"
import useAuth from "./useAuth"
import { showApiErrorToast } from "@/lib/apiError"

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
})

const useAxiosSecure = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  axiosSecure.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      const status = error.response?.status
      const errorCode = error.response?.data?.errorCode

      if (status === 401 || status === 403) {
        await logout()
        navigate("/")

        if (errorCode === "auth.blocked") {
          showApiErrorToast(error)
        }
      } else {
        // Show toast for all other errors
        showApiErrorToast(error)
      }

      return Promise.reject(error)
    }
  )

  return axiosSecure
}

export default useAxiosSecure
