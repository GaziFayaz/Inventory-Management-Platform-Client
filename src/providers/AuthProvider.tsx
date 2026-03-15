/* eslint-disable react-refresh/only-export-components */
import axios from "axios"
import { createContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { showApiErrorToast } from "@/lib/apiError"

// Axios instance used only inside AuthProvider to avoid circular dependency
// (useAxiosSecure → useAuth → AuthContext → AuthProvider)
const authAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
})

interface AuthContextType {
  user: User | null
  loading: boolean
  authError: string | null
  login: (provider: "Google" | "Facebook") => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const login = (provider: "Google" | "Facebook") => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/login/${provider}`
  }
  const fetchUser = async () => {
    try {
      const response = await authAxios.get<{ success: boolean; data: User }>(
        "/auth/me"
      )
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorCode = err.response?.data?.errorCode as string | undefined
        if (err.response?.status === 403 && errorCode === "auth.blocked") {
          setAuthError(errorCode)
        }
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAxios.post("/auth/logout")
    } finally {
      setUser(null)
      setAuthError(null)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    if (errorParam) {
      setAuthError(errorParam)
      showApiErrorToast({
        response: { data: { errorCode: errorParam, message: errorParam } },
      })
      params.delete("error")
      const cleanSearch = params.toString()
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (cleanSearch ? `?${cleanSearch}` : "")
      )
    }

    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
