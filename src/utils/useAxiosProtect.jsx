import axios from "axios";
import { useContext, useEffect } from "react";
import { ContextData } from "../DataProvider";

const axiosProtect = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true, // Ensure cookies are sent with requests
});

const useAxiosProtect = () => {
    const { logOut } = useContext(ContextData) || {};

    useEffect(() => {
        const requestInterceptor = axiosProtect.interceptors.request.use(
            (config) => {
                // Token will be automatically sent via cookies, no need to set it manually
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axiosProtect.interceptors.response.use(
            (response) => response,
            async (error) => {
                // If unauthorized, log out the user
                if (error.response?.status === 401) {
                    console.warn("Unauthorized: Logging out...");
                    await logOut(); // Log the user out
                    window.location.href = "/login"; // Redirect to login
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosProtect.interceptors.request.eject(requestInterceptor);
            axiosProtect.interceptors.response.eject(responseInterceptor);
        };
    }, [logOut]);

    return axiosProtect;
};

export default useAxiosProtect;