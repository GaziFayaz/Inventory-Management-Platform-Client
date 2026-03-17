import Home from "@/components/Home/Home"
import Root from "@/Layouts/Root"
import UserManagement from "@/components/Admin/UserManagement"
import UserInventories from "@/components/Inventories/UserInventories"
import CreateInventory from "@/components/Inventories/CreateInventory"
import InventoryPagePlaceholder from "@/components/Inventories/InventoryPagePlaceholder"
import AdminRoute from "./AdminRoute"
import AuthenticatedRoute from "./AuthenticatedRoute"
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
      {
        path: "/user-inventories",
        element: (
          <AuthenticatedRoute>
            <UserInventories></UserInventories>
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/inventories/create",
        element: (
          <AuthenticatedRoute>
            <CreateInventory></CreateInventory>
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/inventories/:inventoryId",
        element: <InventoryPagePlaceholder></InventoryPagePlaceholder>,
      },
    ],
  },
])
