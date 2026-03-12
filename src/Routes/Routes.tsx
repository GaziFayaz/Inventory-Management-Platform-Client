import Home from "@/components/Home/Home";
import Root from "@/Layouts/Root";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Root></Root>,
		children: [
			{
				path: "/",
				element: <Home></Home>,
			},
		],
	},
]);
