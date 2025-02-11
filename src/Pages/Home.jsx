import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../DataProvider';
import AdminDashboard from '../Component/Admin/AdminDashboard';
import ClientDashboard from '../Component/Client/ClientDashboard';
import useAxiosProtect from '../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';




const Home = () => {

    const { user } = useContext(ContextData);

    const [currentUser, setCurrentUser] = useState(null);


    const axiosProtect = useAxiosProtect();

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************************
        useEffect(() => {
                const fetchPresentUser = async () => {
                    try {
                        const response = await axiosProtect.get('/getCurrentUser', {
                            params: {
                                userEmail: user?.email,
                            },
                        });

                        setCurrentUser(response.data);
        
                    } catch (error) {
                        toast.error('Error fetching user data');
                    }
                };
                fetchPresentUser();
            }, [refetch]);
    // ************************************************************************************************


    return (
        <>
            {
                user && currentUser?.role === 'admin' ?
                    <AdminDashboard /> :
                    user && currentUser?.role === 'accountant' ?
                        <ClientDashboard /> :
                        <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
                            <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
                        </div>
            }
        </>
    );
};

export default Home;