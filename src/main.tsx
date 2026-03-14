import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./Routes/Routes";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./providers/AuthProvider";
import "./i18n";
import { LanguageProvider } from "./providers/LanguageProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<LanguageProvider>
				<QueryClientProvider client={queryClient}>
					<HelmetProvider>
						<RouterProvider router={router}></RouterProvider>
					</HelmetProvider>
				</QueryClientProvider>
			</LanguageProvider>
		</AuthProvider>
	</StrictMode>
);
