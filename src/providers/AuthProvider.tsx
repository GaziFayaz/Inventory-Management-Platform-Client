import axios from "axios";
import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Axios instance used only inside AuthProvider to avoid circular dependency
// (useAxiosSecure → useAuth → AuthContext → AuthProvider)
const authAxios = axios.create({
	baseURL: import.meta.env.VITE_SERVER_URL,
	withCredentials: true,
});

// Define the shape of the AuthContext
interface AuthContextType {
	user: User | null;
	loading: boolean;
	/** OAuth error code forwarded from the backend redirect (e.g. "auth.provider_failed", "auth.blocked") */
	authError: string | null;
	/** Redirect the browser to the provider's OAuth page. No return value — this is a full-page navigation. */
	login: (provider: "google" | "facebook") => void;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [authError, setAuthError] = useState<string | null>(null);

	/**
	 * Redirect the browser to the backend OAuth entry point.
	 * The backend ultimately redirects back to `FrontendUrl` (or `FrontendUrl?error=…`).
	 */
	const login = (provider: "google" | "facebook") => {
		window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/login/${provider}`;
	};

	/**
	 * Fetch the currently signed-in user from `GET /auth/me`.
	 * - 200 → populate `user`
	 * - 401 (not signed in) → `user` stays null, no error surfaced
	 * - 403 auth.blocked → `user` stays null, authError is set
	 */
	const fetchUser = async () => {
		try {
			const response = await authAxios.get<{ success: boolean; data: User }>("/auth/me");
			if (response.data.success) {
				setUser(response.data.data);
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const errorCode = err.response?.data?.errorCode as string | undefined;
				if (err.response?.status === 403 && errorCode === "auth.blocked") {
					setAuthError(errorCode);
				}
				// 401 = not signed in — silently set user to null
			}
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	/** Clear the identity cookie and reset local state. */
	const logout = async () => {
		try {
			await authAxios.post("/auth/logout");
		} catch {
			// Swallow — even if the request fails, clear client-side state.
		} finally {
			setUser(null);
			setAuthError(null);
		}
	};

	useEffect(() => {
		// Check for an OAuth error code that the backend appended to the redirect URL
		// e.g. FrontendUrl?error=auth.provider_failed
		const params = new URLSearchParams(window.location.search);
		const errorParam = params.get("error");
		if (errorParam) {
			setAuthError(errorParam);
			// Remove the query param so it doesn't persist on refresh
			params.delete("error");
			const cleanSearch = params.toString();
			window.history.replaceState(
				{},
				"",
				window.location.pathname + (cleanSearch ? `?${cleanSearch}` : "")
			);
		}

		fetchUser();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, authError, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
