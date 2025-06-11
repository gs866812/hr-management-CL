import axios from 'axios';
import { useContext, useEffect } from 'react';
import { ContextData } from '../DataProvider';

const axiosProtect = axios.create({
    baseURL: 'http://localhost:5000',
});

const useAxiosProtect = () => {
    const { logOut } = useContext(ContextData) || {};

    useEffect(() => {
        const requestInterceptor = axiosProtect.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('jwtToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axiosProtect.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    console.warn('Unauthorized: Logging out...');
                    await logOut(); // Cleanup
                    window.location.href = '/login'; // Redirect
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
