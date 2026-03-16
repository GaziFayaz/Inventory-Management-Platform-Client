import Home from "@/components/Home/Home"
import Root from "@/Layouts/Root"
import UserManagement from "@/components/Admin/UserManagement"
import AdminRoute from "./AdminRoute"
import { createBrowserRouter } from "react-router-dom"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/admin/users",
        element: (
          <AdminRoute>
            <UserManagement></UserManagement>
          </AdminRoute>
        ),
      },
    ],
  },
])
