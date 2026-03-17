import useAuth from "@/Hooks/useAuth"
import { Navigate, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function AuthenticatedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user) {
    return <>{children}</>
  }

  return <Navigate to="/" state={{ from: location }} replace />
}