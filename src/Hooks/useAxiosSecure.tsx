import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
	withCredentials: true
})

const useAxiosSecure = () => {
	const { logout } = useAuth();
	const navigate = useNavigate();

	axiosSecure.interceptors.response.use(
		(response) => {
			return response;
		},
		async (error) => {
			const status = error.response?.status;

			if (status === 401 || status === 403) {
				await logout();
				navigate("/");
			}
		}
	);

	return axiosSecure;
};

export default useAxiosSecure;
