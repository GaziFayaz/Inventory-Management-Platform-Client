import Navbar from "@/components/Shared/Navbar"
import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"

const Root = () => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 w-full">
        <Navbar></Navbar>
      </div>
      <div className="mx-12 flex min-h-screen flex-col md:mx-24 lg:mx-32">
        <div className="flex-1">
          <Outlet></Outlet>
          <ToastContainer />
        </div>
      </div>
    </div>
  )
}

export default Root
