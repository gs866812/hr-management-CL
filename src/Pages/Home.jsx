import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../DataProvider';
import AdminDashboard from '../Component/Admin/AdminDashboard';
import ClientDashboard from '../Component/ClientDashboard/ClientDashboard';
import useAxiosProtect from '../utils/useAxiosProtect';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import HrDashboard from '../Component/HrAdmin/HrDashboard';
import Employee from '../Component/EmployeeList/Employee';




const Home = () => {

    const { user, currentUser, setCurrentUser } = useContext(ContextData);


    const axiosProtect = useAxiosProtect();

    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ************************************************************************************************
   




    return (
        <>
            {
                user && currentUser?.role === 'Admin' || currentUser?.role === 'Developer' ?
                    <AdminDashboard /> :
                    user && currentUser?.role === 'HR-ADMIN' ?
                        <HrDashboard /> :
                        user && currentUser?.role === 'client' ?
                            <ClientDashboard /> :
                            <Employee />

                // <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
                //     <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
                // </div>
            }
        </>
    );
};

export default Home;